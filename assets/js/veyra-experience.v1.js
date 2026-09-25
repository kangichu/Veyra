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
  const productHashes = ['#veyra','#who','#story','#veyra-arch','#eng','#capabilities','#future'];
  if (!document.body.classList.contains('product-page') && productHashes.includes(location.hash)) {
    const productPath = location.protocol === 'file:' ? 'veyra/index.html' : '/veyra/';
    location.replace(productPath + location.hash);
    return;
  }
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const reducedMotion = () => motionPreference.matches;
  const staticMotion = () => document.documentElement.classList.contains('motion-static');
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

  // ---- Scroll-to-top + who-words scrub trigger point ----
  const scrollTopBtn = document.getElementById('scrollTop');
  window.addEventListener('scroll', ()=>{
    const show = window.scrollY > 600;
    scrollTopBtn.style.opacity = show ? 1 : 0;
    scrollTopBtn.style.pointerEvents = show ? 'auto' : 'none';
  }, {passive:true});
  scrollTopBtn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:reducedMotion() ? 'auto' : 'smooth'}));

  // ---- Who words (build markup) ----
  if (document.getElementById('whoText')) {
  const whoWords = document.getElementById('whoText').textContent.trim().split(/\s+/);
  document.getElementById('whoText').innerHTML = whoWords.map(w=>`<span class="who-word" style="color:var(--fog-dim);transition:color .2s;">${w} </span>`).join('');

  }

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

  // ---- Hero contour field ----
  // Two flowing ribbons frame the headline. Cap resolution and frame rate, and
  // stop drawing entirely offscreen, in hidden tabs, or for reduced motion.
  const hero = document.getElementById('hero');
  const contourCanvas = document.getElementById('heroContours');
  const contourContext = contourCanvas.getContext('2d');
  const scrollContours = document.body.classList.contains('tandish-home');
  if (contourContext) {
    let width = 0, height = 0, ratio = 1, frame = null, lastTime = 0, elapsed = 0;
    let visible = true, pointerX = 0, pointerY = 0, offsetX = 0, offsetY = 0;
    let signal, ember, dark;
    let ribbonGradients = [], highlightGradients = [];
    function cacheContourGradients(){
      contourContext.setTransform(ratio,0,0,ratio,0,0);
      ribbonGradients = []; highlightGradients = [];
      for (let ribbon = 0; ribbon < 2; ribbon++) {
        const lower = ribbon === 1;
        const color = contourContext.createLinearGradient(0,0,width,0);
        color.addColorStop(0,'transparent');
        color.addColorStop(.45,lower ? ember : signal);
        color.addColorStop(1,signal);
        ribbonGradients.push(color);
        const highlight = contourContext.createLinearGradient(0,0,width,0);
        highlight.addColorStop(0,'transparent');
        highlight.addColorStop(.35,lower ? signal : ember);
        highlight.addColorStop(1,'transparent');
        highlightGradients.push(highlight);
      }
    }
    function contourColors(){
      signal = cssVar('--signal'); ember = cssVar('--ember');
      dark = document.documentElement.getAttribute('data-theme') === 'dark';
      cacheContourGradients();
    }
    function paintContours(time){
      // Let the homepage ribbons respond to scrolling within the hero.
      const scroll = scrollContours && !reducedMotion()
        ? clamp((window.scrollY - hero.offsetTop) / Math.max(height, 1), 0, 1) : 0;
      time += scroll * 1.5;
      const ctx = contourContext;
      ctx.setTransform(ratio,0,0,ratio,0,0);
      ctx.clearRect(0,0,width,height);
      const compact = width < 760;
      const count = compact ? 22 : 38;
      // The quieter centre band leaves the existing headline unobstructed.
      for (let ribbon=0;ribbon<2;ribbon++) {
        const lower = ribbon === 1;
        ctx.strokeStyle = ribbonGradients[ribbon];
        for(let i=0;i<count;i++) {
          const n = i/(count-1), spread = (n-.5);
          const wave = Math.sin(time*.28 + n*1.8);
          const drift = Math.cos(time*.2 + n*1.2);
          const base = height*(lower ? .77 : .15) + scroll*height*(lower ? -.025 : .025);
          const band = height*(lower ? .075 : .14);
          ctx.globalAlpha = (dark ? .38 : .24) * (lower ? .7 : 1) * (.45+.55*Math.sin(n*Math.PI));
          ctx.lineWidth = i%6===0 ? 1.2 : .65;
          ctx.beginPath();
          ctx.moveTo(width*-.08,base + spread*band + offsetY);
          ctx.bezierCurveTo(
            width*.38 + offsetX,base + height*(lower ? -.12 : .2) + spread*band*.35 + wave*height*.04,
            width*.73 + offsetX,base - height*(lower ? -.11 : .13) + spread*band*1.4 + drift*height*.04,
            width*1.12,base + height*(lower ? -.01 : .06) + spread*band*.7
          );
          ctx.stroke();
        }
        // A restrained highlight travels along a few contours, suggesting flow.
        if (!reducedMotion()) {
          ctx.globalAlpha = dark ? .34 : .22;
          ctx.strokeStyle = highlightGradients[ribbon];
          ctx.lineWidth = 1.3;
          ctx.setLineDash([width*.055,width*1.8]);
          ctx.lineDashOffset = -((time*28) % (width*1.855));
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      ctx.globalAlpha = 1;
    }
    function tickContours(now){
      frame = null;
      if (!visible || document.hidden || reducedMotion()) { lastTime = 0; return; }
      if (!lastTime || now-lastTime >= 1000/30) {
        elapsed += lastTime ? Math.min(now-lastTime,100)/1000 : 0;
        lastTime = now;
        offsetX += (pointerX-offsetX)*.06;
        offsetY += (pointerY-offsetY)*.06;
        paintContours(elapsed);
      }
      frame = requestAnimationFrame(tickContours);
    }
    function syncContours(){
      if (frame !== null) { cancelAnimationFrame(frame); frame = null; }
      lastTime = 0;
      if (reducedMotion()) { offsetX = offsetY = 0; paintContours(0); }
      else if (visible && !document.hidden) { paintContours(elapsed); frame = requestAnimationFrame(tickContours); }
    }
    function resizeContours(){
      const nextWidth = hero.clientWidth, nextHeight = hero.clientHeight;
      const nextRatio = Math.min(devicePixelRatio || 1,1.5);
      if (width === nextWidth && height === nextHeight && ratio === nextRatio) return;
      width = nextWidth; height = nextHeight;
      ratio = Math.min(devicePixelRatio || 1,1.5);
      contourCanvas.width = Math.round(width*ratio); contourCanvas.height = Math.round(height*ratio);
      cacheContourGradients();
      syncContours();
    }
    hero.addEventListener('pointermove', e => {
      if (reducedMotion() || e.pointerType !== 'mouse') return;
      const rect = hero.getBoundingClientRect();
      pointerX = ((e.clientX-rect.left)/width-.5)*28;
      pointerY = ((e.clientY-rect.top)/height-.5)*12;
    }, {passive:true});
    hero.addEventListener('pointerleave', () => { pointerX = pointerY = 0; });
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; syncContours(); }).observe(hero);
    new ResizeObserver(resizeContours).observe(hero);
    new MutationObserver(() => { contourColors(); syncContours(); }).observe(document.documentElement, {attributes:true,attributeFilter:['data-theme']});
    document.addEventListener('visibilitychange', syncContours);
    motionPreference.addEventListener('change', syncContours);
    contourColors(); resizeContours();
  }

  // ---- Existing hero parallax ----
  const heroContent = document.getElementById('heroContent');
  window.addEventListener('mousemove', (e)=>{
    if (reducedMotion()) return;
    const relX = e.clientX/window.innerWidth-0.5, relY = e.clientY/window.innerHeight-0.5;
    heroContent.style.transform = `translate(${relX*-18}px, ${relY*-10}px)`;
  });

  // ---- Responsive display toggles ----
  function applyResponsive(){
    const vw = window.innerWidth;
    cursor.style.display = vw<=860 ? 'none':'block';
    document.getElementById('heroStatus').style.display = vw<=760 ? 'none':'flex';
    document.getElementById('heroStats').style.display = vw<=900 ? 'none':'flex';
    const veyraFloat = document.getElementById('veyraFloat');
    if (veyraFloat) veyraFloat.style.display = vw<=900 ? 'none':'block';
    const veyraBadge = document.getElementById('veyraBadge');
    if (veyraBadge) veyraBadge.style.display = vw<=900 ? 'none':'block';
    const engDesktop = document.getElementById('engDesktop');
    if (engDesktop) engDesktop.style.display = vw<=768 ? 'none':'block';
    const engMobile = document.getElementById('engMobile');
    if (engMobile) engMobile.style.display = vw<=768 ? 'flex':'none';
  }
  window.addEventListener('resize', applyResponsive);
  applyResponsive();

  // ---- GSAP scroll-driven pieces (progressive enhancement) ----
  function initGsap(){

    gsap.registerPlugin(ScrollTrigger);
    // Mobile browsers fire resize events as the address bar shows/hides mid-scroll;
    // without this, ScrollTrigger re-measures pin spacers mid-gesture, which is what
    // makes pinned sections jump/pull neighboring sections around on mobile.
    ScrollTrigger.config({ ignoreMobileResize: true });
    if ('ontouchstart' in window) ScrollTrigger.normalizeScroll(true);
    gsap.from('#heroFoot', {opacity:0, duration:1, delay:.9});
    if (document.getElementById('who')) {
    gsap.timeline({ scrollTrigger: { trigger:'#who', start:'top top', end:'+=120%', scrub:.4, pin:true, anticipatePin:1 } })
      .to('.who-word', { color: () => cssVar('--white'), stagger:.08 })
      .to('#whoPillars', { opacity: 1 }, 0.4);
    }
    if (document.getElementById('veyra')) {
    gsap.from('#veyraBig', {scale:1.25, opacity:0, duration:1.1, ease:'power3.out', scrollTrigger:{trigger:'#veyra', start:'top 70%'}});
    gsap.from('#veyraSub', {opacity:0, y:24, duration:.9, delay:.15, scrollTrigger:{trigger:'#veyra', start:'top 60%'}});
    gsap.to('#veyraFloat', {y:-50, scrollTrigger:{trigger:'#veyra', start:'top bottom', end:'bottom top', scrub:1}});

    }

    const archTrack = document.getElementById('archTrack');
    if (archTrack) {
    const archPanels = gsap.utils.toArray('.arch-panel');
    const archFill = document.getElementById('archFill');
    const totalPanels = archPanels.length;
    gsap.to(archPanels, {
      xPercent: -100*(totalPanels-1), ease:'none',
      scrollTrigger: { trigger:'#veyra-arch', pin:true, scrub:1, snap:1/(totalPanels-1), anticipatePin:1,
        end: () => '+=' + (archTrack.scrollWidth - window.innerWidth), invalidateOnRefresh:true,
        onUpdate: (self)=>{
          archFill.style.width = (self.progress*100)+'%';
          const idx = Math.round(self.progress*(totalPanels-1));
          document.querySelectorAll('#archDots span').forEach((d,i)=>{
            d.style.background = i===idx ? cssVar('--signal') : cssVar('--line-strong');
            d.style.transform = i===idx ? 'scale(1.5)' : 'scale(1)';
          });
        }
      }
    });

    }

    const engSteps = [
      {t:'Embeddings', d:'Listings → vectors'},{t:'Vector Search', d:'Similar listings'},
      {t:'Multi-signal Retrieval', d:'Semantic + structured'},{t:'Relevance Ranking', d:'Order by relevance'},
      {t:'Runtime', d:'Inside your network'},{t:'API Response', d:'Results to your tools'}
    ];
    const engPath = document.getElementById('engPath'), engNodes = document.getElementById('engNodes');
    if (engPath && engNodes){
      const pathLen = engPath.getTotalLength();
      engPath.style.strokeDasharray = pathLen; engPath.style.strokeDashoffset = pathLen;
      engSteps.forEach((s,i)=>{
        const pt = engPath.getPointAtLength((i/(engSteps.length-1))*pathLen);
        const g = document.createElementNS('http://www.w3.org/2000/svg','g');
        g.innerHTML = `<circle cx="${pt.x}" cy="${pt.y}" r="4" fill="${cssVar('--ink-2')}" stroke="${cssVar('--line-strong')}" stroke-width="1.5" class="eng-dot"/>
          <text x="${pt.x}" y="${pt.y-48}" text-anchor="middle" style="font-family:'Space Grotesk',sans-serif;font-size:14.5px;font-weight:500;fill:${cssVar('--fog-dim')}" class="eng-node-title">${s.t}</text>
          <text x="${pt.x}" y="${pt.y-30}" text-anchor="middle" style="font-family:'JetBrains Mono',monospace;font-size:10.5px;fill:${cssVar('--fog-dim')}" class="eng-node-label">${s.d}</text>`;
        engNodes.appendChild(g);
      });
      gsap.timeline({ scrollTrigger:{ trigger:'#eng', start:'top top', end:'bottom bottom', scrub:.6 } })
        .to(engPath, {strokeDashoffset:0, ease:'none', stroke: () => cssVar('--signal')})
        .to('.eng-node-title', {fill: () => cssVar('--white'), stagger:.15}, 0)
        .to('.eng-node-label', {fill: () => cssVar('--fog'), stagger:.15}, 0)
        .to('.eng-dot', {fill: () => cssVar('--signal'), stagger:.15}, 0);
    }

    const capTrack = document.getElementById('capTrack'), capFill = document.getElementById('capFill');
    if (capTrack){
      gsap.to(capTrack, {
        x: () => -(capTrack.scrollWidth - window.innerWidth + 80), ease:'none',
        scrollTrigger: { trigger:'#capabilities', pin:true, scrub:1, start:'top top', anticipatePin:1,
          end: () => '+=' + (capTrack.scrollWidth - window.innerWidth), invalidateOnRefresh:true,
          onUpdate: (self)=>{ capFill.style.width = (self.progress*100)+'%'; } }
      });
    }
    window.addEventListener('load', ()=> { if (!staticMotion()) ScrollTrigger.refresh(); }, {once:true});
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(()=> ScrollTrigger.refresh());
    const refreshTimer = setTimeout(()=> ScrollTrigger.refresh(), 800);
    return () => clearTimeout(refreshTimer);
  }
  let animationContext;
  function updateMotion(){
    if (animationContext) { animationContext.revert(); animationContext = null; }
    if (window.ScrollTrigger) ScrollTrigger.normalizeScroll(false);
    document.getElementById('engNodes')?.replaceChildren();
    document.documentElement.classList.add('motion-static');
    heroContent.style.transform = '';
    if (!reducedMotion() && window.gsap && window.ScrollTrigger) {
      document.documentElement.classList.remove('motion-static');
      animationContext = gsap.context(initGsap);
    }
  }
  motionPreference.addEventListener('change', updateMotion);
  updateMotion();

  // Reading progress follows actual page length, including GSAP pin spacers.
  // Direct updates also work with reduced motion, without easing or decorative motion.
  const readingProgress = document.getElementById('readingProgress');
  if (readingProgress) {
    let progressFrame = null;
    let scrollableHeight = 0;
    function drawReadingProgress(){
      progressFrame = null;
      const progress = scrollableHeight > 0 ? clamp(scrollY / scrollableHeight, 0, 1) : 0;
      readingProgress.style.setProperty('--reading-progress', String(progress));
    }
    function requestProgressDraw(){
      if (progressFrame === null && !document.hidden) progressFrame = requestAnimationFrame(drawReadingProgress);
    }
    function measureReadingProgress(){
      scrollableHeight = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      requestProgressDraw();
    }
    window.addEventListener('scroll', requestProgressDraw, {passive:true});
    window.addEventListener('resize', measureReadingProgress);
    window.addEventListener('load', measureReadingProgress, {once:true});
    document.addEventListener('visibilitychange', measureReadingProgress);
    motionPreference.addEventListener('change', measureReadingProgress);
    new ResizeObserver(measureReadingProgress).observe(document.body);
    if (window.ScrollTrigger) ScrollTrigger.addEventListener('refresh', measureReadingProgress);
    measureReadingProgress();
  }

  // ---- TEMP diagnostic overlay for the mobile pin/sticky bleed-through bug ----
  // Visit with ?debug=1. Remove once diagnosed — not meant to ship long-term.
  if (location.search.indexOf('debug=1') !== -1) {
    const dbg = document.createElement('div');
    dbg.style.cssText = 'position:fixed;top:56px;left:6px;right:6px;z-index:999999;background:rgba(0,0,0,.88);color:#4f8;font:10px/1.45 monospace;padding:8px;border-radius:6px;max-height:65vh;overflow:auto;pointer-events:none;white-space:pre-wrap;';
    document.body.appendChild(dbg);
    const ids = ['veyra-arch', 'eng', 'capabilities'];
    function fmtRect(el) {
      if (!el) return 'no el';
      const r = el.getBoundingClientRect();
      return `top:${r.top.toFixed(0)} bot:${r.bottom.toFixed(0)} h:${r.height.toFixed(0)}`;
    }
    function fmtSpacer(el) {
      if (!el || !el.parentNode || !el.parentNode.classList || !el.parentNode.classList.contains('pin-spacer')) return 'no spacer';
      const r = el.parentNode.getBoundingClientRect();
      return `spacerTop:${r.top.toFixed(0)} spacerBot:${r.bottom.toFixed(0)} spacerH:${r.height.toFixed(0)}`;
    }
    function fmtST(el) {
      if (!window.ScrollTrigger) return 'no ScrollTrigger';
      const st = ScrollTrigger.getAll().find((t) => t.trigger === el);
      if (!st) return 'no trigger';
      return `start:${st.start.toFixed(0)} end:${st.end.toFixed(0)} prog:${st.progress.toFixed(2)} active:${st.isActive}`;
    }
    function update() {
      const lines = [];
      lines.push(
        `vw:${window.innerWidth} vh:${window.innerHeight} vvh:${window.visualViewport ? window.visualViewport.height.toFixed(0) : 'n/a'} scrollY:${window.scrollY.toFixed(0)}`
      );
      ids.forEach((id) => {
        const el = document.getElementById(id);
        lines.push(`#${id}`);
        lines.push(`  rect: ${fmtRect(el)}`);
        lines.push(`  ${fmtSpacer(el)}`);
        lines.push(`  st:   ${fmtST(el)}`);
      });
      dbg.textContent = lines.join('\n');
      requestAnimationFrame(update);
    }
    update();
  }
})();
