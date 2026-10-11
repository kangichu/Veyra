/* Progressive enhancement: static content is complete before this script runs. */
(() => {
  'use strict';
  const main = document.querySelector('.veyra-company main');
  if (!main) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px)');
  const running = new Map();
  const groups = [...main.querySelectorAll('[data-journey]')];
  let observer;

  function settle() {
    running.forEach((group, animation) => { animation.cancel(); group.dataset.journeyPlayed = 'true'; });
    running.clear();
    main.querySelectorAll('.journey-play,.journey-part').forEach(group => group.classList.remove('journey-play','journey-part'));
  }
  function animate(group, target, delay, kind = 'entry') {
    if (group.contains(document.activeElement)) return;
    const frames = kind === 'connector'
      ? [{opacity:.3}, {opacity:1}]
      : kind === 'zoom'
        ? [{borderColor:'var(--ember)', transform:'scale(.985)'}, {borderColor:getComputedStyle(target).borderColor, transform:'scale(1)'}]
        : [{opacity:.5, transform:`translateY(${mobile.matches ? 4 : 8}px)`}, {opacity:1, transform:'translateY(0)'}];
    const animation = target.animate(frames, {
      duration:mobile.matches ? 280 : 480, delay,
      easing:'cubic-bezier(.22,.61,.36,1)', fill:'backwards'
    });
    running.set(animation, group);
    animation.finished.then(() => running.delete(animation), () => running.delete(animation));
  }
  function play(group) {
    if (group.dataset.journeyPlayed || preference.matches || document.hidden) return;
    group.dataset.journeyPlayed = 'true';
    if (group.contains(document.activeElement)) return;
    group.classList.add('journey-play');
    const step = mobile.matches ? 110 : 190;
    let stages;
    switch (group.dataset.journey) {
      case 'composition': stages = [...group.children]; break;
      case 'search':
        stages = [...group.querySelectorAll('.demo-request,.demo-criteria>div,.demo-listing')]; break;
      case 'zoom': stages = [...group.querySelectorAll('.zoom-current,.zoom-domain,.zoom-platform,.domain-continuation')];
        // Resolve from the concrete implementation back to its shared foundation.
        stages.sort((a,b) => ['zoom-current','zoom-domain','zoom-platform','domain-continuation'].indexOf(a.className) - ['zoom-current','zoom-domain','zoom-platform','domain-continuation'].indexOf(b.className)); break;
      case 'lanes': {
        const lanes = [...group.querySelectorAll('.processing-stages')].map(lane => [...lane.children]);
        stages = lanes[0].flatMap((stage,index) => [stage,lanes[1][index]]);
        stages.push(group.querySelector('.processing-output')); break;
      }
      case 'boundary': stages = ['.tandish-boundary','.control-relationship','.customer-boundary'].map(selector => group.querySelector(selector)); break;
      default: stages = [...group.children];
    }
    stages.forEach((target, index) => {
      target.style.setProperty('--connector-delay', `${index * step + step}px`);
      animate(group, target, index * step, group.dataset.journey === 'zoom' ? 'zoom' : (target.classList.contains('equation-symbol') || ['integration','boundary'].includes(group.dataset.journey)) ? 'connector' : 'entry');
    });
    if (group.dataset.journey === 'composition') {
      group.querySelectorAll('div>p').forEach((target,index) => animate(group,target,index*step*2+step));
    }
    if (group.dataset.journey === 'ladder') {
      group.querySelectorAll('.plan-addition').forEach((target,index) => animate(group,target,index*step+step));
    }
  }

  // No hidden initial styles: absent JS, observers or WAAPI leave readable final states.
  if ('IntersectionObserver' in window && Element.prototype.animate) {
    const owners = new WeakMap();
    const parts = new WeakMap();
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const owner = owners.get(entry.target);
        if (owner) {
          entry.target.dataset.journeyPlayed = 'true';
          if (!preference.matches && !document.hidden) {
            entry.target.classList.add('journey-part');
            animate(owner,entry.target,0,entry.target.classList.contains('equation-symbol') || ['integration','boundary'].includes(owner.dataset.journey) ? 'connector' : 'entry');
          }
          if (owner.dataset.journey === 'ladder') {
            const addition = entry.target.querySelector('.plan-addition');
            if (addition && !preference.matches) animate(owner,addition,110);
          }
          if (parts.get(owner).every(child => child.dataset.journeyPlayed)) owner.dataset.journeyPlayed = 'true';
        } else play(entry.target);
        observer.unobserve(entry.target);
      });
    }, {threshold: .12});
    if (!preference.matches) groups.forEach(group => {
      if (mobile.matches && group.offsetHeight > innerHeight * .65 && group.dataset.journey !== 'zoom') {
        const children = group.dataset.journey === 'search'
          ? [...group.querySelectorAll('.demo-step-heading,.demo-request,.demo-criteria>div,.demo-listing')]
          : [...group.children];
        parts.set(group,children);
        children.forEach(child => { owners.set(child,group);observer.observe(child); });
      } else observer.observe(group);
    });
    const headings = main.querySelectorAll('.product-section-inner>h2');
    const entryObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entryObserver.unobserve(entry.target);
      if (!preference.matches && !document.hidden) animate(entry.target,entry.target,0);
    }), {threshold:.4});
    if (!preference.matches) headings.forEach(heading => entryObserver.observe(heading));
    preference.addEventListener('change', () => {
      if (preference.matches) {settle(); observer.disconnect(); entryObserver.disconnect();}
    });
    // Focus and background tabs must never wait for an animation to settle.
    document.addEventListener('focusin', settle);
    document.addEventListener('visibilitychange', () => {if (document.hidden) settle();});
  }

  // Native scrolling updates a single trace; no interpolation or continuous loop.
  const svg = main.querySelector('.site-current');
  const line = svg?.querySelector('.site-current__lines');
  const trace = svg?.querySelector('.site-current__trace');
  if (!line || !trace) return;
  const sections = [...main.querySelectorAll(':scope>section')];
  const NS = 'http://www.w3.org/2000/svg';
  let points = [], length = 0, start = 0, firstY = 0, pending = false;
  function progress() {
    pending = false;
    const reached = Math.max(0, Math.min(length, window.scrollY + innerHeight * .65 - start - firstY));
    trace.style.strokeDashoffset = String(preference.matches ? 0 : length - reached);
    points.forEach(({node,y}) => node.toggleAttribute('data-passed', preference.matches || y <= window.scrollY + innerHeight * .65 - start));
  }
  function schedule() {if (!pending) {pending=true; requestAnimationFrame(progress);}}
  function layout() {
    const bounds = main.getBoundingClientRect();
    start = bounds.top + window.scrollY;
    const x = mobile.matches ? 9 : 28;
    const end = document.getElementById('domains');
    const endY = end.offsetTop + end.offsetHeight - 44;
    firstY = document.getElementById('platform').offsetTop + 40;
    length = Math.max(1,endY-firstY);
    svg.setAttribute('viewBox', `0 0 ${main.clientWidth} ${main.offsetHeight}`);
    line.replaceChildren();
    const path = document.createElementNS(NS,'path');
    const d = `M ${x} ${firstY} L ${x} ${endY}`;
    path.setAttribute('d',d);line.append(path);trace.setAttribute('d',d);
    // The trace begins at firstY rather than the main origin.
    trace.style.strokeDasharray = String(length);
    points = sections.filter(section => section.id !== 'hero' && section.id !== 'walkthrough').map(section => {
      const y = section.offsetTop+40;
      const node=document.createElementNS(NS,'circle');
      node.setAttribute('cx',String(x));node.setAttribute('cy',String(y));node.setAttribute('r','3');node.setAttribute('class','journey-node');line.append(node);
      return {node,y};
    });
    // Store the line origin separately from marker coordinates.
    progress();
  }
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',layout,{passive:true});
  preference.addEventListener('change',() => {settle();layout();});
  if ('ResizeObserver' in window) new ResizeObserver(layout).observe(main);
  document.fonts?.ready.then(layout);
  layout();
})();
