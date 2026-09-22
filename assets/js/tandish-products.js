(() => {
  const container = document.querySelector('.home-product-stories');
  if (!container) return;
  const slides = [...container.querySelectorAll('.home-product-story')];
  if (slides.length < 2) return;
  let active = 0;
  const status = document.createElement('p');
  status.className = 'product-slider-status';
  status.setAttribute('role', 'status');
  container.after(status);
  container.setAttribute('aria-label', 'Tandish product stories');
  container.setAttribute('aria-roledescription', 'carousel');
  container.setAttribute('role', 'region');

  function select(index, focusDirection) {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== active; });
    const slide = slides[active];
    status.textContent = `${slide.dataset.product} selected. Steps 1 and 2 now show its problem and context.`;
    if (focusDirection) slide.querySelector(`[data-direction="${focusDirection}"]`).focus({preventScroll:true});
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      slide.animate([{opacity:0.45}, {opacity:1}], {duration:220, easing:'ease-out'});
    }
  }

  slides.forEach((slide, index) => {
    slide.hidden = index !== active;
    slide.setAttribute('aria-roledescription', 'slide');
    const controls = document.createElement('div');
    controls.className = 'product-slider-controls';
    const counter = document.createElement('span');
    counter.className = 'product-slider-count';
    counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    controls.append(counter);
    for (const [direction, delta, symbol] of [['previous', -1, '\u2190'], ['next', 1, '\u2192']]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.direction = direction;
      button.textContent = symbol;
      const target = slides[(index + delta + slides.length) % slides.length].dataset.product;
      button.setAttribute('aria-label', `${direction === 'next' ? 'Next' : 'Previous'} product: ${target}`);
      button.addEventListener('click', () => select(active + delta, direction));
      controls.append(button);
    }
    controls.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      select(active + (event.key === 'ArrowRight' ? 1 : -1), event.key === 'ArrowRight' ? 'next' : 'previous');
    });
    const outcome = slide.querySelector('.home-story-outcome');
    outcome.append(controls);
    let start = null;
    outcome.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'touch' || event.target.closest('a,button')) return;
      start = {x:event.clientX, y:event.clientY};
    }, {passive:true});
    outcome.addEventListener('pointerup', event => {
      if (!start) return;
      const dx = event.clientX - start.x, dy = event.clientY - start.y;
      start = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) select(active + (dx < 0 ? 1 : -1));
    }, {passive:true});
    outcome.addEventListener('pointercancel', () => { start = null; });
  });
  container.classList.add('product-slider-ready');
})();
