(() => {
 const button=document.getElementById('scrollTop');
 if(!button)return;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const update=()=>{button.hidden=window.scrollY<500;};
 window.addEventListener('scroll',update,{passive:true});
 window.addEventListener('pageshow',update);
 button.addEventListener('click',()=>{
   window.scrollTo({top:0,behavior:motion.matches?'instant':'smooth'});
   update();
   // Keep keyboard focus in the document when this control disappears.
   const target=document.querySelector('h1');
   if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true});}
 });
 update();
})();
