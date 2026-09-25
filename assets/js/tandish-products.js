(() => {
  const container = document.querySelector('.home-product-stories');
  if (!container) return;
  const slides = [...container.querySelectorAll('.home-product-story')];
  if (slides.length < 2) return;
  let active = 0;
  const picker = document.createElement('div');
  picker.className = 'product-picker';
  picker.setAttribute('role', 'group');
  picker.setAttribute('aria-label', 'Choose a product');
  const choices = slides.map((slide, index) => {
    if (!slide.id) slide.id = 'product-story-' + index;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = slide.dataset.product;
    button.setAttribute('aria-controls', slide.id);
    button.setAttribute('aria-pressed', String(index === active));
    button.addEventListener('click', () => select(index));
    picker.append(button);
    return button;
  });
  container.before(picker);
  const status = document.createElement('p');
  status.className = 'product-slider-status';
  status.setAttribute('role', 'status');
  container.after(status);
  container.setAttribute('aria-label', 'Tandish product stories');
  container.setAttribute('aria-roledescription', 'carousel');
  container.setAttribute('role', 'region');

  function select(index) {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== active; });
    choices.forEach((button, i) => button.setAttribute('aria-pressed', String(i === active)));
    const slide = slides[active];
    status.textContent = `${slide.dataset.product} selected. All three steps now show its problem, context and approach.`;
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      slide.animate([{opacity:0.45}, {opacity:1}], {duration:220, easing:'ease-out'});
    }
  }

  slides.forEach((slide, index) => {
    slide.hidden = index !== active;
    slide.setAttribute('aria-roledescription', 'slide');
    const outcome = slide.querySelector('.home-story-outcome');
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
