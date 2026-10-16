(() => {
 const button=document.getElementById('themeToggle');
 function applyTheme(theme){
   document.documentElement.dataset.theme=theme;
   button.textContent='◐';
   button.setAttribute('aria-label',theme==='dark'?'Switch to light theme':'Switch to dark theme');
   try{localStorage.setItem('veyra-theme',theme);}catch{}
 }
 applyTheme(document.documentElement.dataset.theme || 'dark');
 button.addEventListener('click',()=>applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
 if(location.protocol==='file:')document.querySelectorAll('a[href="/veyra/"]').forEach(a=>a.href=new URL('veyra/index.html',location.href).href);
})();
/* Subtle arrival motion; content remains fully available without JavaScript. */
(() => {
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 if (motion.matches || typeof IntersectionObserver !== 'function' || typeof Element.prototype.animate !== 'function') return;
 const observer=new IntersectionObserver(entries=>{
   for(const entry of entries){
     if(!entry.isIntersecting)continue;
     entry.target.animate([{opacity:.7,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.2,.7,.2,1)'});
     observer.unobserve(entry.target);
   }
 },{threshold:.1});
 document.querySelectorAll('.approach-stage').forEach(el=>observer.observe(el));
})();

/* Section wayfinding and reading progress. Native anchors and details remain
   functional when JavaScript or IntersectionObserver is unavailable. */
(() => {
 const sections = [...document.querySelectorAll('main>section[id]')];
 const links = [...document.querySelectorAll('.company-nav-links a, .nav-contact')];
 const trace = document.querySelector('.company-trace>span');
 const main = document.querySelector('main');
 if (!sections.length || !trace || !main) return;
 let scheduled = false;
 const update = () => {
   scheduled = false;
   const readingLine = innerHeight * .3;
   let active = sections[0].id;
   for (const section of sections) if (section.getBoundingClientRect().top <= readingLine) active = section.id;
   links.forEach(link => {
     if (link.hash === '#' + active) link.setAttribute('aria-current', 'location');
     else link.removeAttribute('aria-current');
   });
   const bounds = main.getBoundingClientRect();
   const progress = Math.max(0, Math.min(1, (innerHeight * .75 - bounds.top) / bounds.height));
   trace.style.transform = `scaleY(${progress})`;
 };
 const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(update); } };
 addEventListener('scroll', schedule, {passive:true});
 addEventListener('resize', schedule);
 document.querySelectorAll('.approach-stage').forEach(stage => stage.addEventListener('toggle', schedule));
 update();
})();
