/* Progressive enhancement: all panels are readable without JavaScript. */
(() => {
  'use strict';
  const body = document.body;
  body.classList.add('enhanced');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const theme = document.getElementById('theme-toggle');
  theme.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('veyra-theme', next); } catch (_) { /* Storage is optional. */ }
    theme.setAttribute('aria-label', `Switch to ${next === 'light' ? 'dark' : 'light'} theme`);
  });
  document.querySelectorAll('[data-tabs]').forEach((system, index) => {
    const list = system.querySelector('.tab-list');
    const buttons = [...list.querySelectorAll('button')];
    const panels = [...system.querySelectorAll('.tab-panel')];
    list.setAttribute('role', 'tablist');
    const activate = selected => {
      buttons.forEach((button, i) => {
        button.setAttribute('aria-selected', String(i === selected));
        button.tabIndex = i === selected ? 0 : -1;
        panels[i].hidden = i !== selected;
        panels[i].classList.toggle('entering', i === selected);
      });
      if (system.classList.contains('estate-system')) document.getElementById('real-estate').dataset.scene = selected;
    };
    buttons.forEach((button, i) => {
      button.id = `story-tab-${index}-${i}`;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', `story-panel-${index}-${i}`);
      panels[i].id = `story-panel-${index}-${i}`;
      panels[i].setAttribute('role', 'tabpanel');
      panels[i].setAttribute('aria-labelledby', button.id);
      panels[i].tabIndex = 0;
      button.addEventListener('click', () => activate(i));
      button.addEventListener('keydown', event => {
        let next;
        if (event.key === 'ArrowRight') next = (i + 1) % buttons.length;
        if (event.key === 'ArrowLeft') next = (i + buttons.length - 1) % buttons.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = buttons.length - 1;
        if (next !== undefined) { event.preventDefault(); activate(next); buttons[next].focus(); }
      });
    });
    activate(0);
  });
  const examples = {
    apartment: ['Westlands apartment','3 bedrooms · 2 bathrooms · Balcony','KES 16.8M','“A three-bedroom apartment in Westlands under KES 18M. A balcony would be a plus.”','Apartment','Westlands','Under KES 18M','Balcony','Another Westlands apartment','3 bedrooms · 3 bathrooms · No balcony','KES 17.5M','Within the same budget and location. The missing balcony is a visible tradeoff.','Westlands · 3 bedrooms','KES 16.8M asking price'],
    house: ['Karen family home','4 bedrooms · 3 bathrooms','KES 39M','“A four-bedroom family home in Karen under KES 45M.”','House','Karen','Under KES 45M','None specified','Another Karen family home','4 bedrooms · 4 bathrooms','KES 48M','Above the KES 45M budget. This is a relaxed alternative, not a full match.','Karen · 4 bedrooms','KES 39M asking price']
  };
  const fields = ['property-name','property-facts','property-price','query','type','location','budget','preference','alt-name','alt-facts','alt-price','alt-note','price-context','asking'];
  document.querySelector('.example-picker').hidden = false;
  document.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => {
    fields.forEach((field, i) => document.querySelector(`[data-${field}]`).textContent = examples[button.dataset.example][i]);
    document.querySelectorAll('[data-example]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    document.querySelector('[data-bedrooms]').textContent = button.dataset.example === 'house' ? '4' : '3';
    document.getElementById('example-status').textContent = `${examples[button.dataset.example][0]} selected. Recommendations and price context updated.`;
  }));
  if (typeof window.IntersectionObserver === 'function') {
    const index = [...document.querySelectorAll('.model-index li')];
    const observer = new IntersectionObserver(entries => {
      entries.filter(entry => entry.isIntersecting).forEach(entry => index.forEach((item, i) => item.classList.toggle('active', i === Number(entry.target.dataset.stage))));
    }, { rootMargin: '-15% 0px -45% 0px' });
    document.querySelectorAll('[data-stage]').forEach(step => observer.observe(step));
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('assembled'); reveal.unobserve(entry.target); }
    }), { threshold: .25 });
    document.querySelectorAll('.domain-layer, .zoom-out').forEach(element => reveal.observe(element));
  }
  const trace = document.querySelector('.story-trace span');
  let pending = false;
  const draw = () => {
    pending = false;
    const bounds = trace.parentElement.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight * .6 - bounds.top) / bounds.height));
    trace.style.transform = `scaleY(${progress})`;
  };
  window.addEventListener('scroll', () => { if (!pending && !reduced.matches) { pending = true; requestAnimationFrame(draw); } }, {passive: true});
  window.addEventListener('resize', draw);
  draw();
  // Keep previously shared section links useful after consolidation.
  const aliases = {'story':'real-estate','recommendations':'real-estate','price-intelligence':'real-estate','how-it-works':'platform','deployment':'integration','future':'faq','plans':'walkthrough'};
  if (aliases[location.hash.slice(1)]) document.getElementById(aliases[location.hash.slice(1)]).scrollIntoView();
})();
