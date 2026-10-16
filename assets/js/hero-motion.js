/* A single entrance; static content for reduced motion and without JavaScript. */
(() => {
  const hero = document.querySelector('.type-hero');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!hero || reduced.matches) return;
  hero.classList.add('is-arriving');
  const finish = () => hero.classList.remove('is-arriving');
  reduced.addEventListener('change', finish, {once: true});
  setTimeout(finish, 1200);
})();
