(function(){
  // Keep published links canonical; adapt only direct-from-disk previews.
  if (location.protocol === 'file:') {
    const root = new URL(document.body.classList.contains('product-page') ? '../' : './', location.href);
    document.querySelectorAll('a[href^="/"]').forEach(link => {
      const target = new URL(link.getAttribute('href'), 'https://tandish.com');
      if (target.pathname === '/' || target.pathname === '/veyra/') {
        link.href = new URL(target.pathname.slice(1) + 'index.html' + target.search + target.hash, root).href;
      }
    });
  }
  // Preserve previously shared homepage links after moving product sections.
  const legacySections = {'#who':'#audience','#veyra':'#hero','#veyra-arch':'#deployment','#eng':'#integration','#capabilities':'#integration'};
  const productHashes = ['#veyra','#who','#story','#veyra-arch','#eng','#capabilities','#future'];
  if (!document.body.classList.contains('product-page') && productHashes.includes(location.hash)) {
    const productPath = location.protocol === 'file:' ? 'veyra/index.html' : '/veyra/';
    location.replace(productPath + (legacySections[location.hash] || location.hash));
    return;
  }
  // Keep old Veyra section links useful after consolidating the page.
  if (document.body.classList.contains('product-page')) {
    const resolveLegacySection = () => {
      if (legacySections[location.hash]) location.replace(legacySections[location.hash]);
    };
    window.addEventListener('hashchange', resolveLegacySection);
    resolveLegacySection();
  }
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const reducedMotion = () => motionPreference.matches;
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  // ---- FAQ accordion ----
  const faqList = document.getElementById('faqList');
  if (faqList) {
  // Answers are readable in the HTML; JavaScript enhances them into an accordion.
  faqList.querySelectorAll('.faq-btn').forEach(btn => {
    btn.setAttribute('aria-expanded', 'false');
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    panel.setAttribute('aria-hidden', 'true');
    panel.inert = true;
    panel.style.maxHeight = '0px';
    panel.style.opacity = '0';
  });
  faqList.querySelectorAll('.faq-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const wrap = btn.closest('.product-faq-item') || btn.parentElement;
      const panel = wrap.querySelector('.faq-panel');
      const plus = wrap.querySelector('.faq-plus');
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.setAttribute('aria-hidden', String(open));
      panel.inert = open;
      panel.style.maxHeight = open ? '0px' : panel.scrollHeight + 'px';
      panel.style.opacity = open ? 0 : 1;
      plus.style.transform = open ? 'rotate(0deg)' : 'rotate(45deg)';
    });
  });

  const faqResize = new ResizeObserver(entries => entries.forEach(({target}) => {
    const panel = target.parentElement;
    if (panel.getAttribute('aria-hidden') === 'false') panel.style.maxHeight = panel.scrollHeight + 'px';
  }));
  faqList.querySelectorAll('.faq-panel p').forEach(p => faqResize.observe(p));

  }

  // ---- Theme ----
  const themeBtn = document.getElementById('themeToggle');
  function applyTheme(t){
    document.documentElement.setAttribute('data-theme', t);
    themeBtn.textContent = t === 'dark' ? 'LIGHT' : 'DARK';
    try { localStorage.setItem('veyra-theme', t); } catch (_) { /* Storage may be unavailable. */ }
  }
  let savedTheme = 'dark';
  try { savedTheme = localStorage.getItem('veyra-theme') || 'dark'; } catch (_) {}
  applyTheme(savedTheme);
  themeBtn.addEventListener('click', ()=> applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

  // ---- Menu ----
  const menuOverlay = document.getElementById('menuOverlay');
  const menuOpenBtn = document.getElementById('menuOpenBtn');
  if (menuOverlay && menuOpenBtn) {
    let previousOverflow = '';
    let inertBackground = [];
    function setMenu(open){
      menuOpenBtn.setAttribute('aria-expanded', String(open));
      menuOverlay.inert = !open;
      menuOverlay.setAttribute('aria-hidden', String(!open));
      menuOverlay.style.transform = open ? 'translateY(0)' : 'translateY(-100%)';
      if (open) {
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        inertBackground = [...document.body.children].filter(el => el !== menuOverlay && !el.inert);
        inertBackground.forEach(el => el.inert = true);
        document.getElementById('menuCloseBtn').focus({preventScroll:true});
      } else {
        inertBackground.forEach(el => el.inert = false);
        document.body.style.overflow = previousOverflow;
        menuOpenBtn.focus({preventScroll:true});
      }
    }
    menuOpenBtn.addEventListener('click', () => setMenu(true));
    document.getElementById('menuCloseBtn').addEventListener('click', () => setMenu(false));
    menuOverlay.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    menuOverlay.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); setMenu(false); }
      if (e.key !== 'Tab') return;
      const items = [...menuOverlay.querySelectorAll('button,a[href]')];
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  // Contact intent only: opening an email client does not confirm an enquiry.
  document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
    link.addEventListener('click', () => {
      if (typeof window.gtag === 'function') window.gtag('event',
        link.classList.contains('waitlist-submit') ? 'technical_walkthrough_click' : 'contact_email_click',
        { contact_method: 'email', location: 'contact_section' });
    });
  });

  // ---- Scroll-to-top ----
  const scrollTopBtn = document.getElementById('scrollTop');
  window.addEventListener('scroll', ()=>{
    const show = window.scrollY > 600;
    scrollTopBtn.style.opacity = show ? 1 : 0;
    scrollTopBtn.style.pointerEvents = show ? 'auto' : 'none';
  }, {passive:true});
  scrollTopBtn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:reducedMotion() ? 'auto' : 'smooth'}));

  // Pause decorative frames on small screens, hidden tabs and reduced motion.
  function motionLoop(callback, enabled){
    let frame = null;
    function tick(){
      frame = null;
      if (document.hidden || reducedMotion() || !enabled()) return;
      callback();
      frame = requestAnimationFrame(tick);
    }
    function restart(){ if (frame === null) tick(); }
    window.addEventListener('resize', restart);
    document.addEventListener('visibilitychange', restart);
    motionPreference.addEventListener('change', restart);
    restart();
  }

  // ---- Custom cursor ----
  const cursor = document.getElementById('cursor');
  function cursorVisible(){ return window.innerWidth > 860; }
  cursor.style.display = cursorVisible() ? 'block' : 'none';
  let mx = innerWidth/2, my = innerHeight/2, cx = mx, cy = my;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  motionLoop(()=>{
    cx += (mx-cx)*.18; cy += (my-cy)*.18;
    cursor.style.left = cx+'px'; cursor.style.top = cy+'px';
  }, cursorVisible);
  function cssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  document.querySelectorAll('a,button').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.style.width='44px'; cursor.style.height='44px'; cursor.style.background=cssVar('--white'); });
    el.addEventListener('mouseleave', () => { cursor.style.width='8px'; cursor.style.height='8px'; cursor.style.background=cssVar('--signal'); });
  });

  // ---- Responsive display toggles ----
  function applyResponsive(){
    const vw = window.innerWidth;
    cursor.style.display = vw<=860 ? 'none':'block';



  }
  window.addEventListener('resize', applyResponsive);
  applyResponsive();


})();
