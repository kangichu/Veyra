/* CSS carries the motion; pause it when it cannot be seen. */
(() => {
  const hero=document.querySelector('.designed-hero');
  if(!hero||!hero.querySelector('.hero-atmosphere'))return;
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  let visible=false;
  const sync=()=>hero.toggleAttribute('data-atmosphere-active',visible&&!document.hidden&&!preference.matches);
  if('IntersectionObserver' in window){
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(hero);
  }else{visible=true;}
  document.addEventListener('visibilitychange',sync);
  preference.addEventListener('change',sync);
  sync();
})();
