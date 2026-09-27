/* Size a single continuous strand from the actual section layout, never from scrolling. */
(() => {
  const main = document.querySelector('main');
  const svg = main?.querySelector('.site-current');
  if (!svg) return;
  const ns = 'http://www.w3.org/2000/svg';
  const sections = [...main.children].filter(node => node.tagName === 'SECTION');
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
    const bounds = sections.map(section => {
      const rect = section.getBoundingClientRect();
      return {top:rect.top-box.top, height:rect.height};
    });
    const height = Math.ceil(box.height + (footer?.getBoundingClientRect().height || 0));
    const next = JSON.stringify([width,height,bounds]);
    if (next === signature) return;
    signature = next;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.height = `${height}px`;
    const narrow = mobile.matches;
    const left = width * (narrow ? -.025 : .025);
    const right = width * (narrow ? 1.025 : .975);
    const points = [{x:width*.58,y:-100}];
    bounds.forEach((section,index) => {
      points.push({x:index%2 ? left : right,y:section.top+section.height*.5});
    });
    points.push({x:width*.5,y:height+100});
    function strand(offset) {
      let d = `M ${points[0].x+offset} ${points[0].y}`;
      for (let i=1;i<points.length;i++) {
        const a=points[i-1], b=points[i];
        const bend=i>1 && i<=bounds.length ? bounds[i-1].top : (a.y+b.y)/2;
        d+=` C ${a.x+offset} ${bend}, ${b.x+offset} ${bend}, ${b.x+offset} ${b.y}`;
      }
      return d;
    }
    const spacing=narrow ? 3 : Math.min(4,width/360);
    paths.forEach((path,index) => path.setAttribute('d',strand((index-11)*spacing)));
    trace.setAttribute('d',strand(0));
  }
  function schedule() {if (!pending) pending=requestAnimationFrame(draw);}
  function syncMotion() {main.toggleAttribute('data-current-active',!document.hidden&&!motion.matches&&!mobile.matches);}
  // FAQ expansion, product switching and text reflow all keep the strand connected.
  if ('ResizeObserver' in window) {
    const observer=new ResizeObserver(schedule);
    observer.observe(main);
    sections.forEach(section=>observer.observe(section));
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
