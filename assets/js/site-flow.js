/* One quiet settling gesture per section. Content never depends on animation. */
(() => {
  'use strict';
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Set();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (preference.matches || entry.target.contains(document.activeElement)) continue;
      [entry.target].forEach(part => {
        const animation = part.animate(
          [{ transform: 'translateY(12px)' }, { transform: 'translateY(0)' }],
          { duration: 1100, easing: 'cubic-bezier(.22,.61,.36,1)' }
        );
        active.add(animation);
        animation.finished.then(() => active.delete(animation), () => active.delete(animation));
      });
    }
  }, { threshold: 0.12 });
  document.querySelectorAll('.home-story-outcome,.home-story-steps,.demo-step,.product-flow,#deployment .product-grid-two > article').forEach(el => observer.observe(el));
  const stop = () => { active.forEach(animation => animation.cancel()); active.clear(); };
  preference.addEventListener('change', () => { if (preference.matches) stop(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
})();
