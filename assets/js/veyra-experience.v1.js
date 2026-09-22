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
  function stepIn(p,s,e){return clamp((p-s)/(e-s),0,1);}
  const hoods=['Westlands','Kilimani','Lavington','Karen','Runda','Kileleshwa','Muthaiga','Riverside'];
  const prices=['24.5M','18.2M','32.0M','15.8M','41.0M','12.4M','27.0M','19.6M'];
  const beds=[3,2,4,2,5,2,3,2], baths=[3,2,4,2,4,1,2,2], sqft=['2,400','1,650','3,100','1,480','3,800','1,200','2,050','1,700'];
  const imgCss=(idx)=>`height:150px;background:repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) ${8+idx%3*2}px, rgba(255,255,255,0.02) ${8+idx%3*2}px, rgba(255,255,255,0.02) ${16+idx%3*4}px);background-color:#181818;position:relative;`;
  const filters=[{label:'Location',value:'Westlands'},{label:'Type',value:'Apartment'},{label:'Bedrooms',value:'3+'},{label:'Bathrooms',value:'2+'},{label:'Price',value:'Up to 20M'}];

  function initProductDemo(){
  // ---- Scene 1: traditional site ----
  document.getElementById('s1Filters').innerHTML = filters.map(f=>`
    <div style="display:flex;align-items:center;gap:8px;padding:11px 16px;background:var(--charcoal-2);border:1px solid var(--line);border-radius:9px;font-size:13px;color:var(--fog);">
      <span style="color:var(--fog-dim);">${f.label}</span><span style="font-weight:500;color:var(--white);">${f.value}</span><span style="color:var(--fog-dim);font-size:10px;">▾</span>
    </div>`).join('');
  document.getElementById('s1Cards').innerHTML = hoods.map((h,i)=>`
    <div style="background:var(--ink-2);">
      <div style="${imgCss(i)}"></div>
      <div style="padding:14px 16px;">
        <div style="font-size:14px;font-weight:600;margin-bottom:2px;">KES ${prices[i]}</div>
        <div style="font-size:12px;color:var(--fog-dim);margin-bottom:8px;">${h}, Nairobi</div>
        <div style="font-size:11px;color:var(--fog-dim);">${beds[i]} bd · ${baths[i]} ba · ${sqft[i]} sqft</div>
      </div>
    </div>`).join('');

  // ---- Scene 2: simplification (elements referenced by scroll handler) ----
  const s2FiltersEl = document.getElementById('s2Filters');
  const s2CardsEl = document.getElementById('s2Cards');
  const s2Bar = document.getElementById('s2SearchBar');
  s2FiltersEl.innerHTML = filters.map(f=>`<div class="s2f" style="display:flex;align-items:center;gap:6px;padding:11px 16px;background:var(--charcoal-2);border:1px solid var(--line);border-radius:9px;font-size:13px;"><span style="color:var(--fog-dim);">${f.label}</span><span style="font-weight:500;margin-left:6px;color:var(--white);">${f.value}</span></div>`).join('');
  s2CardsEl.innerHTML = hoods.map((h,i)=>`<div class="s2c" style="border-radius:8px;overflow:hidden;"><div style="${imgCss(i)}"></div></div>`).join('');
  const s2f = [...s2FiltersEl.children], s2c = [...s2CardsEl.children];

  // ---- Scene 3: tokens ----
  const tokenDefs=[{label:'3 Bedroom',dx:-260,dy:-30},{label:'Apartment',dx:-125,dy:40},{label:'Westlands',dx:0,dy:-55},{label:'Under KES 18M',dx:135,dy:35},{label:'Near International Schools',dx:260,dy:-25}];
  const s3TokensEl = document.getElementById('s3Tokens');
  s3TokensEl.innerHTML = tokenDefs.map(t=>`<div class="s3tok" data-dx="${t.dx}" data-dy="${t.dy}" style="position:absolute;left:50%;top:0;padding:8px 14px;border-radius:20px;background:var(--charcoal-2);border:1px solid rgba(255,143,94,0.35);font-size:12.5px;font-weight:500;white-space:nowrap;color:var(--white);opacity:0;transform:translateX(-50%) translate(0px,20px) scale(0.6);transition:transform 1s cubic-bezier(.22,1,.36,1), opacity .8s ease;">${t.label}</div>`).join('');
  const s3Tokens = [...s3TokensEl.children];

  // ---- Scene 4: intelligent results ----
  const matches=['Sample','Sample','Sample','Sample','Sample','Sample'];
  const insights=['Example listing details','Example school proximity','Example neighbourhood context','Example location details','Example related property','Example commute context'];
  const s4Cards = document.getElementById('s4Cards');
  s4Cards.innerHTML = hoods.slice(0,6).map((h,i)=>`
    <div class="s4c" style="border-radius:12px;overflow:hidden;background:var(--charcoal);border:1px solid var(--line);opacity:0;transform:translateY(28px);transition:opacity .7s ease ${i*0.09}s, transform .7s cubic-bezier(.22,1,.36,1) ${i*0.09}s;">
      <div style="${imgCss(i)}display:flex;">
        <div style="position:absolute;top:12px;left:12px;background:var(--ember);color:var(--ink);font-size:11px;font-weight:700;padding:4px 9px;border-radius:20px;">${matches[i]} listing</div>
      </div>
      <div style="padding:16px 18px 20px;">
        <div style="font-size:15px;font-weight:600;margin-bottom:2px;">KES ${prices[i]}</div>
        <div style="font-size:12px;color:var(--fog-dim);margin-bottom:10px;">${h}, Nairobi · ${beds[i]} bd · ${baths[i]} ba</div>
        <div style="font-size:12px;color:var(--ember);font-weight:500;">${insights[i]}</div>
      </div>
    </div>`).join('');

  // ---- Scene 5: recommendations ----
  const chipLabels=['Luxury Apartments','Westlands','Family Homes','Nearby Schools'];
  document.getElementById('s5Chips').innerHTML = chipLabels.map((l,i)=>`<div class="s5chip" style="padding:8px 16px;border-radius:20px;background:var(--ink-2);border:1px solid var(--line-strong);font-size:13px;color:var(--fog);opacity:0;transform:translateY(10px);transition:opacity .5s ease ${i*0.08}s, transform .5s ease ${i*0.08}s;">${l}</div>`).join('');
  const recBase = hoods.map((h,i)=>({hood:h, price:prices[(i+3)%prices.length], idx:i+2}));
  const recAll = recBase.concat(recBase);
  document.getElementById('s5Marquee').innerHTML = recAll.map(c=>`
    <div style="width:230px;flex-shrink:0;border-radius:12px;border:1px solid var(--line);background:var(--charcoal);overflow:hidden;">
      <div style="${imgCss(c.idx)}"></div>
      <div style="padding:12px 14px;"><div style="font-size:13px;font-weight:600;">KES ${c.price}</div><div style="font-size:11px;color:var(--fog-dim);margin-top:2px;">${c.hood}, Nairobi</div></div>
    </div>`).join('');

  // ---- Scene 6: related properties ----
  document.getElementById('s6Related').innerHTML = hoods.slice(0,3).map((h,i)=>`
    <div style="flex:1;border-radius:8px;overflow:hidden;background:var(--charcoal);">
      <div style="height:56px;background:#1c1c1c;"></div>
      <div style="padding:8px 10px;font-size:11px;color:var(--fog);">KES ${prices[(i+1)%prices.length]}</div>
    </div>`).join('');

  // ---- Scene 7: before/after ----
  const oldLabels=['Visitor','Filters','Pages','Leaves'];
  const newLabels=['Visitor','Natural Language Search','Understanding','Recommendations','Property Discovery','Inquiry','Viewing','Customer'];
  document.getElementById('s7Old').innerHTML = oldLabels.map(l=>`<div class="s7old" style="display:flex;align-items:center;gap:12px;padding:12px 0;font-size:15px;color:var(--fog);border-bottom:1px solid var(--line);"><div style="width:6px;height:6px;border-radius:50%;background:var(--fog-dim);"></div><span>${l}</span></div>`).join('');
  document.getElementById('s7New').innerHTML = newLabels.map(l=>`<div class="s7new" style="display:flex;align-items:center;gap:12px;padding:10px 0;font-size:15px;color:var(--white);border-bottom:1px solid var(--line);"><div style="width:6px;height:6px;border-radius:50%;background:var(--ember);"></div><span>${l}</span></div>`).join('');
  const s7old = [...document.getElementById('s7Old').children], s7new = [...document.getElementById('s7New').children];

  // ---- Scene 8: deployment nodes ----
  const dLabels=['Customer Infrastructure','Veyra','Website','Customers'];
  document.getElementById('s8Nodes').innerHTML = dLabels.map((l,i)=>`
    <div class="s8node" style="display:flex;flex-direction:column;align-items:center;opacity:0;transform:translateY(14px);transition:opacity .6s ease ${i*0.15}s, transform .6s ease ${i*0.15}s;">
      <div style="padding:14px 28px;border-radius:9px;background:${i===1?'var(--ember)':'var(--ink-2)'};color:${i===1?'var(--ink)':'var(--white)'};border:${i===1?'none':'1px solid var(--line-strong)'};font-size:14px;font-weight:600;">${l}</div>
      ${i<dLabels.length-1?'<div style="width:1px;height:32px;background:var(--line-strong);"></div>':''}
    </div>`).join('');
  const emphLabels=['Your cloud.','Your infrastructure.','Your data.','Your control.'];
  document.getElementById('s8Emphasis').innerHTML = emphLabels.map((l,i)=>`<div class="s8emph" style="font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:600;opacity:0;transform:translateY(10px);transition:opacity .5s ease ${0.5+i*0.12}s, transform .5s ease ${0.5+i*0.12}s;">${l}</div>`).join('');

  // ---- Scroll progress: scene 2 & 7 ----
  const scene2 = document.getElementById('scene2'), scene7 = document.getElementById('scene7');
  function progressOf(el){
    const rect = el.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    if (total <= 0) return 0;
    return clamp(-rect.top/total, 0, 1);
  }
  let raf = null;
  function onScroll(){
    if (reducedMotion() || raf) return;
    raf = requestAnimationFrame(()=>{
      raf = null;
      const p2 = progressOf(scene2);
      s2f.forEach((el,i)=>{ const start=0.02+i*0.07,end=start+0.16; const out=stepIn(p2,start,end);
        el.style.opacity=1-out; el.style.transform=`translateY(${out*-16}px) scale(${1-out*0.15})`; });
      s2c.forEach((el,i)=>{ const start=0.12+i*0.045,end=start+0.22; const out=stepIn(p2,start,end);
        el.style.opacity=1-out; el.style.transform=`scale(${1-out*0.3}) translateY(${out*10}px)`; });
      const glow = stepIn(p2,0.55,1);
      s2Bar.style.border = `1px solid rgba(255,143,94,${0.15+glow*0.5})`;
      s2Bar.style.boxShadow = `0 0 ${glow*40}px rgba(255,143,94,${glow*0.25})`;
      s2Bar.style.transform = `scale(${1+glow*0.08})`;

      const p7 = progressOf(scene7);
      s7old.forEach((el,i)=>{ const s=0.05+i*0.06,e=s+0.2; const out=stepIn(p7,s,e);
        el.style.opacity = 1-out*0.75; el.style.transform = `translateX(${out*-8}px)`; });
      s7new.forEach((el,i)=>{ const s=0.18+i*0.09,e=s+0.16; const inn=stepIn(p7,s,e);
        el.style.opacity = inn; el.style.transform = `translateX(${(1-inn)*16}px)`; });
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  onScroll();

  // ---- IntersectionObserver reveals ----
  function revealOnce(selector, cb){
    const el = document.querySelector(selector);
    if (!el) return;
    if (reducedMotion() || !('IntersectionObserver' in window)) { cb(); return; }
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if (e.isIntersecting){ cb(); obs.disconnect(); } });
    }, {threshold:0.25});
    obs.observe(el);
  }
  revealOnce('#scene4', ()=> s4Cards.querySelectorAll('.s4c').forEach(el=>{ el.style.opacity=1; el.style.transform='translateY(0px)'; }));
  revealOnce('#scene5', ()=> document.querySelectorAll('.s5chip').forEach(el=>{ el.style.opacity=1; el.style.transform='translateY(0)'; }));
  revealOnce('#scene6', ()=>{
    const left = document.getElementById('s6Left'); left.style.opacity=1; left.style.transform='translateY(0)';
    document.querySelectorAll('.s6r').forEach(el=>{ el.style.opacity=1; el.style.transform='translateY(0)'; });
  });
  revealOnce('#scene8', ()=>{
    document.querySelectorAll('.s8node').forEach(el=>{ el.style.opacity=1; el.style.transform='translateY(0)'; });
    document.querySelectorAll('.s8emph').forEach(el=>{ el.style.opacity=1; el.style.transform='translateY(0)'; });
    document.getElementById('s8Trust').style.opacity=1;
  });

  // ---- Scene 3: typing + tokens ----
  revealOnce('#scene3', ()=>{
    const query = "I'm looking for a modern three-bedroom apartment in Westlands under KES 18M near international schools.";
    const typedEl = document.getElementById('typedText');
    let i = 0;
    function type(){
      if (reducedMotion()) { typedEl.textContent = query; return; }
      i += (Math.random() < 0.15 ? 2 : 1);
      typedEl.textContent = query.slice(0, i);
      if (i < query.length){
        setTimeout(type, 22 + Math.random()*45);
      } else {
        setTimeout(()=>{
          if (reducedMotion()) return;
          s3Tokens.forEach(el=>{ el.style.opacity=1; el.style.transform=`translateX(-50%) translate(${el.dataset.dx}px,${parseInt(el.dataset.dy)+20}px) scale(1)`; });
        }, 700);
        setTimeout(()=>{ s3Tokens.forEach(el=>{ el.style.opacity=0.6; el.style.transform='translateX(-50%) translate(0px,20px) scale(0.3)'; }); }, 700+1900);
        setTimeout(()=>{ s3Tokens.forEach(el=>{ el.style.opacity=0; }); }, 700+1900+1300);
      }
    }
    setTimeout(type, 500);
  });

    return onScroll;
  }
  const updateDemoScroll = document.getElementById('story') ? initProductDemo() : () => {};

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
  if (contourContext) {
    let width = 0, height = 0, ratio = 1, frame = null, lastTime = 0, elapsed = 0;
    let visible = true, pointerX = 0, pointerY = 0, offsetX = 0, offsetY = 0;
    let signal, ember, dark;
    function contourColors(){
      signal = cssVar('--signal'); ember = cssVar('--ember');
      dark = document.documentElement.getAttribute('data-theme') === 'dark';
    }
    function paintContours(time){
      const ctx = contourContext;
      ctx.setTransform(ratio,0,0,ratio,0,0);
      ctx.clearRect(0,0,width,height);
      const compact = width < 760;
      const count = compact ? 22 : 38;
      // The quieter centre band leaves the existing headline unobstructed.
      for (let ribbon=0;ribbon<2;ribbon++) {
        const lower = ribbon === 1;
        const color = ctx.createLinearGradient(0,0,width,0);
        color.addColorStop(0,'transparent');
        color.addColorStop(.45,lower ? ember : signal);
        color.addColorStop(1,signal);
        ctx.strokeStyle = color;
        for(let i=0;i<count;i++) {
          const n = i/(count-1), spread = (n-.5);
          const wave = Math.sin(time*.28 + n*1.8);
          const drift = Math.cos(time*.2 + n*1.2);
          const base = height*(lower ? .77 : .15);
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
          const highlight = ctx.createLinearGradient(0,0,width,0);
          highlight.addColorStop(0,'transparent');
          highlight.addColorStop(.35,lower ? signal : ember);
          highlight.addColorStop(1,'transparent');
          ctx.strokeStyle = highlight;
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
      width = hero.clientWidth; height = hero.clientHeight;
      ratio = Math.min(devicePixelRatio || 1,1.5);
      contourCanvas.width = Math.round(width*ratio); contourCanvas.height = Math.round(height*ratio);
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
    if (reducedMotion() && document.getElementById('typedText')) document.getElementById('typedText').textContent = "I'm looking for a modern three-bedroom apartment in Westlands under KES 18M near international schools.";
    updateDemoScroll();
  }
  motionPreference.addEventListener('change', updateMotion);
  updateMotion();

  // Reading progress follows actual page length, including GSAP pin spacers.
  // Direct updates also work with reduced motion, without easing or decorative motion.
  const readingProgress = document.getElementById('readingProgress');
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
