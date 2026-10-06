(() => {
 const button=document.getElementById('themeToggle');
 function applyTheme(theme){
   document.documentElement.dataset.theme=theme;
   button.textContent=theme==='dark'?'LIGHT':'DARK';
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
 if (motion.matches || !('IntersectionObserver' in window)) return;
 const observer=new IntersectionObserver(entries=>{
   for(const entry of entries){
     if(!entry.isIntersecting)continue;
     entry.target.animate([{opacity:.7,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.2,.7,.2,1)'});
     observer.unobserve(entry.target);
   }
 },{threshold:.1});
 document.querySelectorAll('.product-chapter,.approach-grid>div').forEach(el=>observer.observe(el));
})();
