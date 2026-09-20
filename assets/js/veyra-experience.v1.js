(function(){
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function stepIn(p,s,e){return clamp((p-s)/(e-s),0,1);}
  const hoods=['Westlands','Kilimani','Lavington','Karen','Runda','Kileleshwa','Muthaiga','Riverside'];
  const prices=['24.5M','18.2M','32.0M','15.8M','41.0M','12.4M','27.0M','19.6M'];
  const beds=[3,2,4,2,5,2,3,2], baths=[3,2,4,2,4,1,2,2], sqft=['2,400','1,650','3,100','1,480','3,800','1,200','2,050','1,700'];
  const imgCss=(idx)=>`height:150px;background:repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) ${8+idx%3*2}px, rgba(255,255,255,0.02) ${8+idx%3*2}px, rgba(255,255,255,0.02) ${16+idx%3*4}px);background-color:#181818;position:relative;`;
  const filters=[{label:'Location',value:'Westlands'},{label:'Type',value:'Apartment'},{label:'Bedrooms',value:'3+'},{label:'Bathrooms',value:'2+'},{label:'Price',value:'Up to 20M'}];

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
    if (raf) return;
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
      i += (Math.random() < 0.15 ? 2 : 1);
      typedEl.textContent = query.slice(0, i);
      if (i < query.length){
        setTimeout(type, 22 + Math.random()*45);
      } else {
        setTimeout(()=>{
          s3Tokens.forEach(el=>{ el.style.opacity=1; el.style.transform=`translateX(-50%) translate(${el.dataset.dx}px,${parseInt(el.dataset.dy)+20}px) scale(1)`; });
        }, 700);
        setTimeout(()=>{ s3Tokens.forEach(el=>{ el.style.opacity=0.6; el.style.transform='translateX(-50%) translate(0px,20px) scale(0.3)'; }); }, 700+1900);
        setTimeout(()=>{ s3Tokens.forEach(el=>{ el.style.opacity=0; }); }, 700+1900+1300);
      }
    }
    setTimeout(type, 500);
  });

  // ---- FAQ accordion ----
  const faqs = [
    {q:'Where does the data live?', a:'Customer property data is processed locally in the customer-controlled Veyra environment. Review external connections, support access and data handling for your deployment.'},
    {q:'How is it deployed?', a:'Veyra is packaged for customer infrastructure. Deployment timelines depend on your environment, integration scope and security requirements.'},
    {q:'Who operates it day to day?', a:'Your team controls the hosting environment. Agree operational responsibilities, available administration tools and support arrangements with Tandish for your deployment.'},
    {q:'What about security and audit?', a:'Review available access controls, logging and update processes with your security team. Self-hosting gives you infrastructure control; it does not by itself establish compliance.'},
    {q:'How do developers integrate?', a:'Veyra exposes search through an API for integration with websites and internal tools. Review supported endpoints, authentication and data formats during a technical walkthrough.'},
    {q:'Why start with real estate?', a:'Real estate combines detailed listing data with specific discovery workflows and ownership requirements. Veyra is focused on those needs.'}
  ];
  const faqList = document.getElementById('faqList');
  faqList.innerHTML = faqs.map((f,i)=>`
    <div style="border-bottom:1px solid var(--line);">
      <button class="faq-btn" data-i="${i}" style="width:100%;background:none;border:none;cursor:pointer;display:flex;align-items:center;gap:24px;padding:28px 0;text-align:left;transition:padding-left .2s;">
        <span style="font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--fog-dim);width:32px;flex-shrink:0;">${String(i+1).padStart(2,'0')}</span>
        <h3 style="font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:clamp(19px,2.2vw,25px);flex:1;">${f.q}</h3>
        <span class="faq-plus" style="font-family:'JetBrains Mono',monospace;font-size:18px;color:var(--fog-dim);transition:transform .3s;">+</span>
      </button>
      <div class="faq-panel" style="max-height:0px;opacity:0;overflow:hidden;transition:max-height .35s ease,opacity .3s;">
        <p style="font-size:15px;color:var(--fog-dim);max-width:620px;line-height:1.6;padding:0 clamp(12px,4vw,20px) 28px clamp(30px,10vw,78px);">${f.a}</p>
      </div>
    </div>`).join('');
  faqList.querySelectorAll('.faq-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const wrap = btn.parentElement;
      const panel = wrap.querySelector('.faq-panel');
      const plus = wrap.querySelector('.faq-plus');
      const open = panel.style.maxHeight !== '0px' && panel.style.maxHeight !== '';
      panel.style.maxHeight = open ? '0px' : '200px';
      panel.style.opacity = open ? 0 : 1;
      plus.style.transform = open ? 'rotate(0deg)' : 'rotate(45deg)';
    });
  });

  // ---- Theme ----
  const themeBtn = document.getElementById('themeToggle');
  function applyTheme(t){
    document.documentElement.setAttribute('data-theme', t);
    themeBtn.textContent = t === 'dark' ? 'LIGHT' : 'DARK';
    localStorage.setItem('veyra-theme', t);
  }
  applyTheme(localStorage.getItem('veyra-theme') || 'light');
  themeBtn.addEventListener('click', ()=> applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

  // ---- Menu ----
  const menuOverlay = document.getElementById('menuOverlay');
  document.getElementById('menuOpenBtn').addEventListener('click', ()=> menuOverlay.style.transform = 'translateY(0)');
  document.getElementById('menuCloseBtn').addEventListener('click', ()=> menuOverlay.style.transform = 'translateY(-100%)');
  menuOverlay.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> menuOverlay.style.transform = 'translateY(-100%)'));

  // ---- Scroll-to-top + who-words scrub trigger point ----
  const scrollTopBtn = document.getElementById('scrollTop');
  window.addEventListener('scroll', ()=>{
    const show = window.scrollY > 600;
    scrollTopBtn.style.opacity = show ? 1 : 0;
    scrollTopBtn.style.pointerEvents = show ? 'auto' : 'none';
  }, {passive:true});
  scrollTopBtn.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));

  // ---- Who words (build markup) ----
  const whoWords = "Enterprise AI should work where your business already operates. Organizations should not have to surrender ownership of their infrastructure or operational data simply to adopt AI. Veyra exists because of that belief.".split(' ');
  document.getElementById('whoText').innerHTML = whoWords.map(w=>`<span class="who-word" style="color:var(--fog-dim);transition:color .2s;">${w} </span>`).join('');

  // ---- Custom cursor ----
  const cursor = document.getElementById('cursor');
  function cursorVisible(){ return window.innerWidth > 860; }
  cursor.style.display = cursorVisible() ? 'block' : 'none';
  let mx = innerWidth/2, my = innerHeight/2, cx = mx, cy = my;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function loop(){
    cx += (mx-cx)*.18; cy += (my-cy)*.18;
    cursor.style.left = cx+'px'; cursor.style.top = cy+'px';
    requestAnimationFrame(loop);
  })();
  function cssVar(name){ return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  document.querySelectorAll('a,button').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.style.width='44px'; cursor.style.height='44px'; cursor.style.background=cssVar('--white'); });
    el.addEventListener('mouseleave', () => { cursor.style.width='8px'; cursor.style.height='8px'; cursor.style.background=cssVar('--signal'); });
  });

  // ---- Orb magnetism + hero parallax ----
  function setupOrbMagnet(id, radius, pullMax){
    const orb = document.getElementById(id);
    if (!orb) return;
    let tx=0,ty=0,scale=1,cx=0,cy=0,cs=1;
    window.addEventListener('mousemove', (e)=>{
      const rect = orb.getBoundingClientRect();
      const ocx = rect.left+rect.width/2, ocy = rect.top+rect.height/2;
      const dx = e.clientX-ocx, dy = e.clientY-ocy;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if (dist < radius){
        const pull = (1-dist/radius)*pullMax;
        const ang = Math.atan2(dy,dx);
        tx = Math.cos(ang)*pull; ty = Math.sin(ang)*pull;
        scale = 1+(1-dist/radius)*0.18;
      } else { tx=0; ty=0; scale=1; }
    });
    (function loop(){
      cx += (tx-cx)*.08; cy += (ty-cy)*.08; cs += (scale-cs)*.08;
      orb.style.transform = `translate(${cx}px, ${cy}px) scale(${cs})`;
      requestAnimationFrame(loop);
    })();
  }
  setupOrbMagnet('heroOrbTop', 480, 60);
  setupOrbMagnet('heroOrbMain', 520, 65);
  const heroContent = document.getElementById('heroContent');
  window.addEventListener('mousemove', (e)=>{
    const relX = e.clientX/window.innerWidth-0.5, relY = e.clientY/window.innerHeight-0.5;
    heroContent.style.transform = `translate(${relX*-18}px, ${relY*-10}px)`;
  });

  // ---- Responsive display toggles ----
  function applyResponsive(){
    const vw = window.innerWidth, vh = window.innerHeight;
    document.getElementById('heroOrbTop').style.display = (vw<=760||vh<700) ? 'none':'block';
    document.getElementById('heroOrbMain').style.display = (vw<=760||vh<700) ? 'none':'block';
    cursor.style.display = vw<=860 ? 'none':'block';
    document.getElementById('heroStatus').style.display = vw<=760 ? 'none':'flex';
    document.getElementById('heroStats').style.display = vw<=900 ? 'none':'flex';
    document.getElementById('veyraFloat').style.display = vw<=900 ? 'none':'block';
    document.getElementById('veyraBadge').style.display = vw<=900 ? 'none':'block';
    document.getElementById('engDesktop').style.display = vw<=768 ? 'none':'block';
    document.getElementById('engMobile').style.display = vw<=768 ? 'flex':'none';
  }
  window.addEventListener('resize', applyResponsive);
  applyResponsive();

  // ---- GSAP scroll-driven pieces (progressive enhancement) ----
  function initGsap(){
    if (!window.gsap || !window.ScrollTrigger) { return setTimeout(initGsap, 100); }
    gsap.registerPlugin(ScrollTrigger);
    // Mobile browsers fire resize events as the address bar shows/hides mid-scroll;
    // without this, ScrollTrigger re-measures pin spacers mid-gesture, which is what
    // makes pinned sections jump/pull neighboring sections around on mobile.
    ScrollTrigger.config({ ignoreMobileResize: true });
    if ('ontouchstart' in window) ScrollTrigger.normalizeScroll(true);
    gsap.from('#heroFoot', {opacity:0, duration:1, delay:.9});
    gsap.timeline({ scrollTrigger: { trigger:'#who', start:'top top', end:'+=120%', scrub:.4, pin:true, anticipatePin:1 } })
      .to('.who-word', { color: () => cssVar('--white'), stagger:.08 })
      .to('#whoPillars', { opacity: 1 }, 0.4);
    gsap.from('#veyraBig', {scale:1.25, opacity:0, duration:1.1, ease:'power3.out', scrollTrigger:{trigger:'#veyra', start:'top 70%'}});
    gsap.from('#veyraSub', {opacity:0, y:24, duration:.9, delay:.15, scrollTrigger:{trigger:'#veyra', start:'top 60%'}});
    gsap.to('#veyraFloat', {y:-50, scrollTrigger:{trigger:'#veyra', start:'top bottom', end:'bottom top', scrub:1}});

    const archTrack = document.getElementById('archTrack');
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
    window.addEventListener('load', ()=> ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(()=> ScrollTrigger.refresh());
    setTimeout(()=> ScrollTrigger.refresh(), 800);
  }
  initGsap();

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
