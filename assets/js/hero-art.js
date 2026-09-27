/* Open, flowing strands echo the hero contours; no solid 3D objects. */
(function(){
  const TAU=Math.PI*2;
  function strands(kind,time=0){
    const lines=[],count=56,phase=Math.sin(time*.075)*.28;
    for(let i=0;i<count;i++){
      const v=i/(count-1)-.5,points=[];
      for(let j=0;j<=112;j++){
        const u=j/112,envelope=Math.sin(Math.PI*u);
        let x,y;
        if(kind==='tandish'){
          x=.02+.96*u+v*.07*Math.sin(TAU*u);
          y=.5+.22*Math.sin(TAU*u-.6+phase)+v*.52*Math.cos(Math.PI*u+phase*.3)
            +.1*Math.sin(Math.PI*u)*Math.sin(v*3.2+time*.055);
        }else{
          x=.02+.96*u;
          y=.47+.21*Math.sin(TAU*u+.55-phase)+v*(.42+.19*Math.cos(TAU*u))
            +.12*envelope*Math.cos(v*3.8+time*.065);
        }
        points.push([x,.5+(y-.5)*.82]);
      }
      const depth=(Math.cos(v*4+time*.08)+1)*.5;
      lines.push({points,alpha:.26+depth*.42,width:i%9===0?1.1:.65});
    }
    return lines;
  }
  function svg(kind){
    const color=kind==='tandish'?'129,145,240':'220,165,126';
    const paths=strands(kind).map(line=>`<path d="${line.points.map((p,i)=>(i?'L':'M')+(p[0]*800).toFixed(2)+','+(p[1]*800).toFixed(2)).join(' ')}" opacity="${line.alpha.toFixed(3)}" stroke-width="${line.width}"/>`).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><defs><linearGradient id="flow"><stop stop-color="rgb(${color})" stop-opacity="0"/><stop offset=".18" stop-color="rgb(${color})"/><stop offset=".52" stop-color="rgb(${color})"/><stop offset=".85" stop-color="rgb(${color})"/><stop offset="1" stop-color="rgb(${color})" stop-opacity="0"/></linearGradient></defs><g fill="none" stroke="url(#flow)">${paths}</g></svg>`;
  }
  if(typeof module!=='undefined'&&module.exports){module.exports={strands,svg};return;}
  document.querySelectorAll('[data-hero-product]').forEach(link=>link.addEventListener('click',()=>{
    document.querySelectorAll('.product-picker button').forEach(button=>{if(button.textContent.trim()===link.dataset.heroProduct)button.click();});
  }));
  const art=document.querySelector('[data-hero-art]');if(!art)return;
  const hero=art.closest('.designed-hero'),canvas=art.querySelector('canvas');
  const compact=matchMedia('(max-width:760px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)'),pointer=matchMedia('(hover:hover) and (pointer:fine)');
  let ctx=null,visible=false,frame=null,width=0,height=0,ratio=1,time=0,last=0;
  let targetX=0,targetY=0,x=0,y=0,scroll=0,scrollTarget=0,scrollListening=false;
  const desktopMotion=()=>!compact.matches&&pointer.matches&&!(navigator.maxTouchPoints>0)&&!reduced.matches;
  function readScroll(){
    if(!desktopMotion()){scroll=scrollTarget=0;return;}
    const bounds=hero.getBoundingClientRect();scrollTarget=Math.max(0,Math.min(1,-bounds.top/bounds.height));
  }
  function paint(){
    if(!ctx||!width||!height||compact.matches)return;
    const light=document.documentElement.dataset.theme==='light',kind=art.dataset.heroArt;
    const tone=kind==='tandish'?(light?'58,76,168':'136,157,247'):(light?'151,88,48':'229,170,124');
    const highlight=kind==='tandish'?(light?'50,66,150':'202,213,255'):(light?'134,72,37':'255,221,189');
    const t=reduced.matches?0:time+scroll*3;
    ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
    ctx.globalCompositeOperation=light?'multiply':'screen';
    const focus=.5+Math.sin(t*.14)*.23;
    const gradient=ctx.createLinearGradient(0,0,width,0);
    gradient.addColorStop(0,`rgba(${tone},0)`);
    gradient.addColorStop(.15,`rgba(${tone},.5)`);
    gradient.addColorStop(focus,`rgba(${highlight},1)`);
    gradient.addColorStop(.85,`rgba(${tone},.6)`);
    gradient.addColorStop(1,`rgba(${tone},0)`);
    ctx.strokeStyle=gradient;
    for(const line of strands(kind,t)){
      ctx.beginPath();line.points.forEach(([px,py],i)=>{
        const sx=px*width+x*9*Math.sin(px*Math.PI),sy=py*height+y*10*Math.sin(px*Math.PI);
        if(i)ctx.lineTo(sx,sy);else ctx.moveTo(sx,sy);
      });
      ctx.globalAlpha=line.alpha*(light?.85:1);ctx.lineWidth=line.width;ctx.stroke();
      if(!light&&line.width>1){ctx.globalAlpha=.035;ctx.lineWidth=4;ctx.stroke();}
    }
    ctx.globalAlpha=1;art.setAttribute('data-ready','');
  }
  function tick(now){
    frame=null;
    if(compact.matches||reduced.matches||!visible||document.hidden||!width||!height){last=0;return;}
    if(!last||now-last>=1000/30){
      const elapsed=last?Math.min(now-last,100):0;last=now;time+=elapsed/1000;
      const ease=1-Math.exp(-elapsed/650);x+=(targetX-x)*ease;y+=(targetY-y)*ease;scroll+=(scrollTarget-scroll)*(1-Math.exp(-elapsed/220));
      paint();
    }
    frame=requestAnimationFrame(tick);
  }
  function sync(){
    if(frame!==null)cancelAnimationFrame(frame);frame=null;last=0;
    const enabled=desktopMotion();
    if(enabled!==scrollListening){
      if(enabled)window.addEventListener('scroll',readScroll,{passive:true});else window.removeEventListener('scroll',readScroll);
      scrollListening=enabled;
    }
    readScroll();
    if(!enabled)targetX=targetY=x=y=0;
    if(compact.matches)return;
    if(!ctx)ctx=canvas.getContext('2d');
    if(!ctx)return;
    const nextWidth=art.clientWidth,nextHeight=art.clientHeight,nextRatio=Math.min(devicePixelRatio||1,1.5);
    if(width!==nextWidth||height!==nextHeight||ratio!==nextRatio){
      width=nextWidth;height=nextHeight;ratio=nextRatio;canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    }
    paint();if(!reduced.matches&&visible&&!document.hidden&&width&&height)frame=requestAnimationFrame(tick);
  }
  hero.addEventListener('pointermove',event=>{
    if(!desktopMotion()||event.pointerType!=='mouse')return;
    const bounds=hero.getBoundingClientRect();targetX=(event.clientX-bounds.left)/bounds.width-.5;targetY=(event.clientY-bounds.top)/bounds.height-.5;
  },{passive:true});
  hero.addEventListener('pointerleave',()=>{targetX=targetY=0;});
  new ResizeObserver(sync).observe(art);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(hero);
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  compact.addEventListener('change',sync);reduced.addEventListener('change',sync);pointer.addEventListener('change',sync);
  document.addEventListener('visibilitychange',sync);sync();
})();
