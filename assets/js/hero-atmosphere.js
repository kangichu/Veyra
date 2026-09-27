/* Size a single continuous strand from the actual section layout, never from scrolling. */
(() => {
  const main = document.querySelector('main');
  const svg = main?.querySelector('.site-current');
  if (!svg) return;
  const ns = 'http://www.w3.org/2000/svg';
  const hero = main.querySelector('.designed-hero');
  const footer = document.querySelector('footer');
  const group = svg.querySelector('.site-current__lines');
  const trace = svg.querySelector('.site-current__trace');
  const paths = Array.from({length:23}, () => {
    const path = document.createElementNS(ns, 'path');
    group.append(path);
    return path;
  });
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width:760px)');
  let pending = 0;
  let signature = '';
  function draw() {
    pending = 0;
    const box = main.getBoundingClientRect();
    const width = box.width;
    if (!width) return;
    const heroHeight = hero?.getBoundingClientRect().height || 900;
    const height = Math.ceil(box.height + (footer?.getBoundingClientRect().height || 0));
    const next = JSON.stringify([width,height,heroHeight]);
    if (next === signature) return;
    signature = next;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.height = `${height}px`;
    const narrow = mobile.matches;
    const left = width * (narrow ? -.025 : .025);
    const right = width * (narrow ? 1.025 : .975);
    // Short or uneven sections must not squeeze the strand into hairpin turns.
    // A continuous wave gives every bend the same generous radius; changing
    // content height simply extends the path instead of moving existing bends.
    const halfTurn = Math.max(680, Math.min(1600, width * .85));
    const frequency = Math.PI / halfTurn;
    const center = (left + right) / 2;
    const amplitude = (right - left) / 2;
    const crest = heroHeight * .5;
    function point(y) {
      const phase = (y - crest) * frequency;
      return {x:center + amplitude * Math.cos(phase), y,
        slope:-amplitude * frequency * Math.sin(phase)};
    }
    const points = [];
    const start = -120, end = height + 120;
    const count = Math.ceil((end - start) / (halfTurn / 6));
    for (let i=0; i<=count; i++) points.push(point(start + (end-start)*i/count));
    function strand(offset) {
      let d = `M ${points[0].x+offset} ${points[0].y}`;
      for (let i=1;i<points.length;i++) {
        const a=points[i-1], b=points[i];
        // Shared analytic tangents keep consecutive Bezier segments smooth.
        const handle = (b.y-a.y)/3;
        d+=` C ${a.x+offset+a.slope*handle} ${a.y+handle}, ${b.x+offset-b.slope*handle} ${b.y-handle}, ${b.x+offset} ${b.y}`;
      }
      return d;
    }
    const spacing=narrow ? 4.5 : Math.min(8,width/180);
    paths.forEach((path,index) => path.setAttribute('d',strand((index-11)*spacing)));
    trace.setAttribute('d',strand(0));
  }
  function schedule() {if (!pending) pending=requestAnimationFrame(draw);}
  function syncMotion() {main.toggleAttribute('data-current-active',!document.hidden&&!motion.matches&&!mobile.matches);}
  // FAQ expansion, product switching and text reflow all keep the strand connected.
  if ('ResizeObserver' in window) {
    const observer=new ResizeObserver(schedule);
    observer.observe(main);
    if (hero) observer.observe(hero);
    if (footer) observer.observe(footer);
  }
  window.addEventListener('resize',schedule,{passive:true});
  document.fonts?.ready.then(schedule);
  document.addEventListener('visibilitychange',syncMotion);
  motion.addEventListener('change',syncMotion);
  mobile.addEventListener('change',()=>{schedule();syncMotion();});
  draw();
  syncMotion();
})();
