/* Product configuration lives in semantic articles. Add another article to extend
   the gallery, drawer and navigation; no two-product assumptions or dependency. */
(() => {
  'use strict';
  const track = document.getElementById('product-track');
  const dialog = document.querySelector('.product-drawer');
  if (!track || !dialog || typeof dialog.showModal !== 'function') return;
  const products = [...track.querySelectorAll('[data-product]')].map(card => ({
    card,
    name: card.dataset.productName,
    tone: card.dataset.productTone,
    link: card.querySelector('[data-open-product]'),
    detail: card.querySelector('[data-product-detail]'),
    content: card.querySelector('.product-detail-body')
  }));
  if (!products.length || products.some(product => !product.link || !product.content || !product.detail)) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const previous = document.querySelector('[data-gallery-prev]');
  const next = document.querySelector('[data-gallery-next]');
  const count = document.querySelector('.gallery-count');
  const announcement = document.querySelector('.gallery-announcement');
  const content = dialog.querySelector('.drawer-content');
  const close = dialog.querySelector('.drawer-close');
  const detailPrevious = dialog.querySelector('[data-detail-prev]');
  const detailNext = dialog.querySelector('[data-detail-next]');
  let galleryIndex = 0;
  let detailIndex = 0;
  let origin = null;
  let pending = false;
  const number = value => String(value).padStart(2, '0');
  const position = index => Math.min(track.scrollWidth - track.clientWidth, products[index].card.offsetLeft - products[0].card.offsetLeft);
  const updateGallery = () => {
    pending = false;
    const overflowing = track.scrollWidth > track.clientWidth + 2;
    document.querySelector('.gallery-controls').hidden = !overflowing;
    const distances = products.map((_, index) => Math.abs(position(index) - track.scrollLeft));
    galleryIndex = distances.indexOf(Math.min(...distances));
    previous.disabled = track.scrollLeft < 2;
    next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
    const bounds = track.getBoundingClientRect();
    const visible = products.map((product, index) => {
      const card = product.card.getBoundingClientRect();
      return Math.min(card.right, bounds.right) - Math.max(card.left, bounds.left) >= card.width / 2 ? index : -1;
    }).filter(index => index >= 0);
    const first = visible[0] ?? galleryIndex;
    const last = visible.at(-1) ?? first;
    count.textContent = `${number(first + 1)}${last > first ? '–' + number(last + 1) : ''} / ${number(products.length)}`;
  };
  const moveGallery = index => {
    galleryIndex = Math.max(0, Math.min(products.length - 1, index));
    track.scrollTo({left: position(galleryIndex), behavior: reduced.matches ? 'instant' : 'smooth'});
    announcement.textContent = `${products[galleryIndex].name}, product ${galleryIndex + 1} of ${products.length}.`;
  };
  previous.addEventListener('click', () => moveGallery(galleryIndex - 1));
  next.addEventListener('click', () => moveGallery(galleryIndex + 1));
  track.addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(updateGallery); } }, {passive:true});
  window.addEventListener('resize', updateGallery);
  track.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    if (event.target.closest('.product-fallback')) return;
    const focused = products.findIndex(product => product.link === document.activeElement);
    const current = focused < 0 ? galleryIndex : focused;
    let index = event.key === 'Home' ? 0 : event.key === 'End' ? products.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1);
    index = Math.max(0, Math.min(products.length - 1, index));
    event.preventDefault();
    products[index].link.focus({preventScroll:true});
    moveGallery(index);
  });
  const showProduct = (index, switching = false) => {
    detailIndex = (index + products.length) % products.length;
    const product = products[detailIndex];
    const body = product.content.cloneNode(true);
    const title = body.querySelector('[data-detail-title]');
    title.id = 'drawer-title';
    title.tabIndex = -1;
    const action = body.querySelector('a.button');
    const persistentAction = dialog.querySelector('.drawer-cta');
    persistentAction.href = action.href;
    persistentAction.replaceChildren(...action.childNodes);
    persistentAction.hidden = false;
    action.remove();
    content.replaceChildren(body);
    dialog.dataset.tone = product.tone;
    content.scrollTop = 0;
    content.classList.remove('switching');
    if (switching && !reduced.matches) requestAnimationFrame(() => content.classList.add('switching'));
    dialog.querySelector('.drawer-count').textContent = `${number(detailIndex + 1)} / ${number(products.length)}`;
    detailPrevious.setAttribute('aria-label', `Previous product: ${products[(detailIndex - 1 + products.length) % products.length].name}`);
    detailNext.setAttribute('aria-label', `Next product: ${products[(detailIndex + 1) % products.length].name}`);
    detailPrevious.disabled = detailNext.disabled = products.length < 2;
    if (switching) title.focus({preventScroll:true});
  };
  const openProduct = (index, trigger) => {
    origin = trigger;
    showProduct(index);
    document.documentElement.style.setProperty('--product-scrollbar-width', `${innerWidth - document.documentElement.clientWidth}px`);
    dialog.showModal();
    document.documentElement.classList.add('product-modal-open');
    close.focus({preventScroll:true});
    content.scrollTop = 0;
    requestAnimationFrame(() => { if (dialog.open) content.scrollTop = 0; });
  };
  const closeProduct = () => dialog.close();
  close.addEventListener('click', closeProduct);
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('a[href],button:not(:disabled),[tabindex="0"]')].filter(element => element.getClientRects().length);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
      event.preventDefault(); first.focus();
    }
  });
  dialog.querySelector('.drawer-brand').addEventListener('click', event => { event.preventDefault(); closeProduct(); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeProduct();
  });
  // Native Escape/cancel closes the modal; close also covers programmatic closure.
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('product-modal-open');
    document.documentElement.style.removeProperty('--product-scrollbar-width');
    if (origin?.isConnected) origin.focus({preventScroll:true});
  });
  detailPrevious.addEventListener('click', () => showProduct(detailIndex - 1, true));
  detailNext.addEventListener('click', () => showProduct(detailIndex + 1, true));
  products.forEach((product, index) => {
    product.link.setAttribute('aria-haspopup', 'dialog');
    product.link.setAttribute('aria-controls', 'product-dialog');
    product.link.addEventListener('click', event => {
      // Preserve normal open-in-new-tab/copy-link behavior for canonical destinations.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openProduct(index, product.link);
    });
    product.detail.hidden = true;
    product.card.querySelector('[data-card-action]').textContent = `Discover ${product.name}`;
  });
  dialog.id = 'product-dialog';
  document.querySelector('.enhanced-gallery-hint').hidden = false;
  updateGallery();
})();
