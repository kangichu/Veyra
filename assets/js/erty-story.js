/* Erty page: theme toggle (shared with the rest of the site) and the scroll trace. Everything works without it. */
(() => {
  'use strict';
  document.body.classList.add('enhanced');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  const theme = document.getElementById('theme-toggle');
  const label = () => theme && theme.setAttribute('aria-label', `Switch to ${document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'} theme`);
  if (theme) {
    label();
    theme.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('veyra-theme', next); } catch (_) { /* Storage is optional. */ }
      label();
    });
  }

  const trace = document.querySelector('.story-trace span');
  if (!trace) return;
  let pending = false;
  const draw = () => {
    pending = false;
    const bounds = trace.parentElement.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight * .6 - bounds.top) / bounds.height));
    trace.style.transform = `scaleY(${progress})`;
  };
  window.addEventListener('scroll', () => { if (!pending && !reduced.matches) { pending = true; requestAnimationFrame(draw); } }, { passive: true });
  window.addEventListener('resize', draw);
  draw();
})();
