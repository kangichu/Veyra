/* Original geometric hero studies: no external renderer or animation dependency. */
(function(){
  const palette={ceramic:[210,215,229],edge:[146,157,182],signal:[105,117,230],focus:[222,149,105],indigo:[103,119,244],copper:[238,164,116]};
  const clamp=value=>Math.max(0,Math.min(1,value));
  const ease=value=>{const t=clamp(value);return t*t*t*(t*(t*6-15)+10);};
  function box(list,x,y,z,w,h,d,material='ceramic'){
    // Small real chamfers catch the light without outlining every face.
    if(material==='ceramic'||material==='focus'||material==='signal'){
      const half=[w/2,h/2,d/2],center=[x,y,z],bevel=Math.min(.018,w*.12,h*.12,d*.12);
      const face=(points,normal)=>list.push({points:points.map(p=>p.map((v,i)=>v+center[i])),normal,material});
      for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){
        const other=[0,1,2].filter(i=>i!==axis),normal=[0,0,0];normal[axis]=sign;
        face([[-1,-1],[1,-1],[1,1],[-1,1]].map(pair=>{const p=[0,0,0];p[axis]=sign*half[axis];other.forEach((a,i)=>p[a]=pair[i]*(half[a]-bevel));return p;}),normal);
      }
      for(let a=0;a<3;a++)for(let b=a+1;b<3;b++)for(const sa of [-1,1])for(const sb of [-1,1]){
        const c=3-a-b,normal=[0,0,0];normal[a]=sa/Math.SQRT2;normal[b]=sb/Math.SQRT2;
        face([[-1,0],[1,0],[1,1],[-1,1]].map(([sc,end])=>{const p=[0,0,0];p[a]=sa*(half[a]-(end?bevel:0));p[b]=sb*(half[b]-(end?0:bevel));p[c]=sc*(half[c]-bevel);return p;}),normal);
      }
      for(const sx of [-1,1])for(const sy of [-1,1])for(const sz of [-1,1]){
        const signs=[sx,sy,sz];face([0,1,2].map(axis=>half.map((v,i)=>signs[i]*(v-(i===axis?0:bevel)))),signs.map(v=>v/Math.sqrt(3)));
      }
      return;
    }
    const vertices=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(p=>[x+p[0]*w/2,y+p[1]*h/2,z+p[2]*d/2]);
    const sides=[[[4,5,6,7],[0,0,1]],[[1,0,3,2],[0,0,-1]],[[5,1,2,6],[1,0,0]],[[0,4,7,3],[-1,0,0]],[[7,6,2,3],[0,1,0]],[[0,1,5,4],[0,-1,0]]];
    sides.forEach(([indices,normal])=>list.push({points:indices.map(i=>vertices[i]),normal,material}));
  }
  // An unhurried opening, a moment to read the structure, then a soft return.
  const PART_CYCLE=32;
  function openness(time){const phase=((time%PART_CYCLE)+PART_CYCLE)%PART_CYCLE;return ease((phase-2)/10)*(1-ease((phase-19)/11));}
  function partOpen(time,index,count,scroll,motion){
    const delay=index/(count-1)*1.8;
    return (openness(time-delay)*(1-scroll)+scroll)*motion;
  }
  function energize(list,start,amount){for(let i=start;i<list.length;i++)list[i].energy=amount;}
  function transformPart(list,start,yaw,roll,dx,dy,dz){
    function turn(p){
      const q=rotate(p,yaw,0),c=Math.cos(roll),s=Math.sin(roll);
      return [q[0]*c-q[1]*s,q[0]*s+q[1]*c,q[2]];
    }
    for(let i=start;i<list.length;i++){
      list[i].points=list[i].points.map(p=>{const q=turn(p);return[q[0]+dx,q[1]+dy,q[2]+dz];});
      list[i].normal=turn(list[i].normal);
    }
  }
  function scene(kind,time,scroll=0,motion=1){
    const list=[];
    if(kind==='tandish'){
      for(let i=0;i<15;i++){
        const open=partOpen(time,i,15,scroll,motion);
        const start=list.length;
        const material=i===7?'signal':i===14?'ceramic':'edge';
        box(list,0,1.13,0,2.7,.44,.068,material);
        box(list,0,-1.13,0,2.7,.44,.068,material);
        box(list,-1.13,0,0,.44,1.82,.068,material);
        box(list,1.13,0,0,.44,1.82,.068,material);
        // The logo corner stays attached to its front frame.
        if(i===14)box(list,-.81,.81,.095,.63,.63,.16,'signal');
        // Recessed inner seams carry one broad, slow highlight through the stack.
        const seam=list.length;
        box(list,0,.899,.037,1.79,.018,.012,'indigo');
        box(list,.899,0,.037,.018,1.79,.012,'indigo');
        box(list,0,-.899,.037,1.79,.018,.012,'indigo');
        box(list,-.899,0,.037,.018,1.79,.012,'indigo');
        const wave=Math.pow((1+Math.cos(i*.36-time*.28))*.5,5);
        energize(list,seam,.12+.88*wave);
        transformPart(list,start,0,(i-7)*.033*open,(i-7)*.027*open,Math.sin(i/14*Math.PI)*.08*open,(i-7)*(.115+.079*open));
      }
    }else{
      box(list,0,-1.03,0,2.85,.13,2.6,'edge');
      for(let floor=0;floor<3;floor++){
        const open=partOpen(time,floor,4,scroll,motion);
        const start=list.length;
        const mat=floor===2?'ceramic':'edge';
        box(list,0,0,-1,2.62,.1,.48,mat);
        box(list,0,0,1,2.62,.1,.48,mat);
        box(list,-1.08,0,0,.46,.1,1.52,mat);
        box(list,1.08,0,0,.46,.1,1.52,mat);
        box(list,-1.2,.23,-.35,.1,.46,1.48,'ceramic');
        box(list,.25,.23,-1.17,1.8,.46,.1,'ceramic');
        box(list,.65,.23,1.15,.11,.46,.13,'ceramic');
        box(list,1.21,.23,.3,.1,.46,1.7,'ceramic');
        box(list,-.6,.23,1.15,.1,.46,.13,'ceramic');
        const seam=list.length;
        box(list,0,.014,1.247,2.35,.018,.013,'copper');
        box(list,1.317,.014,0,.013,.018,2.17,'copper');
        energize(list,seam,.16+.84*Math.pow((1+Math.cos(floor*1.1-time*.32))*.5,4));
        // Floors lift in succession; the core stays visibly inside the structure.
        transformPart(list,start,(floor-1)*.085*open,0,(floor-1)*.06*open,-.84+floor*.62+(.08+floor*.25)*open,0);
      }
      const coreOpen=partOpen(time,1,4,scroll,motion);
      for(let cell=0;cell<3;cell++){
        const start=list.length,y=-.58+cell*(.49+.065*coreOpen);
        box(list,0,y,0,.86,.445,.86,'focus');
        energize(list,start,.08+.16*Math.pow((1+Math.cos(cell*1.15-time*.32))*.5,3));
      }
      const roof=list.length;
      box(list,0,0,-1,2.62,.08,.48,'ceramic');
      box(list,0,0,1,2.62,.08,.48,'ceramic');
      box(list,-1.08,0,0,.46,.08,1.52,'ceramic');
      box(list,1.08,0,0,.46,.08,1.52,'ceramic');
      const open=partOpen(time,3,4,scroll,motion);
      transformPart(list,roof,.13*open,0,0,1.18+.82*open,0);
    }
    return list;
  }
  function rotate(p,yaw,pitch){
    const x=p[0]*Math.cos(yaw)+p[2]*Math.sin(yaw),z=-p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw);
    return [x,p[1]*Math.cos(pitch)-z*Math.sin(pitch),p[1]*Math.sin(pitch)+z*Math.cos(pitch)];
  }
  const framing=new Map();
  function sceneFrame(kind){
    if(framing.has(kind))return framing.get(kind);
    let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
    // Fit the entire motion envelope once, so the sculpture never zooms as parts move.
    for(const t of [0,5,9,13,17,21,25,29])for(const scroll of [0,.5,1]){
      const model=scene(kind,t,scroll);
      for(const yawOffset of [-.095,.095,.415])for(const pitchOffset of [-.045,.045,.225]){
        const yaw=(kind==='tandish'?-.56:-.65)+yawOffset,pitch=(kind==='tandish'?.32:.48)+pitchOffset;
        for(const face of model)for(const vertex of face.points){
          const p=rotate(vertex,yaw,pitch),s=1/(1-p[2]/9),x=p[0]*s,y=-p[1]*s;
          minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
        }
      }
    }
    const result={minX,maxX,minY,maxY};framing.set(kind,result);return result;
  }
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  function viewFaces(kind,time,px=0,py=0,scroll=0,motion=1){
    const yaw=(kind==='tandish'?-.56:-.65)+Math.sin(time*.065)*.055+px*.08+scroll*.32;
    const pitch=(kind==='tandish'?.32:.48)+Math.sin(time*.05)*.025+py*.04+scroll*.18;
    return scene(kind,time,scroll,motion).map(face=>({...face,points:face.points.map(p=>rotate(p,yaw,pitch)),normal:rotate(face.normal,yaw,pitch)}))
      .filter(f=>dot(f.normal,[-f.points[0][0],-f.points[0][1],9-f.points[0][2]])>1e-7);
  }
  function projectFaces(faces,kind,w,h,light=false){
    const {minX,maxX,minY,maxY}=sceneFrame(kind);
    const scale=Math.min(w*.82/(maxX-minX),h*.8/(maxY-minY));
    const cx=(minX+maxX)/2,cy=(minY+maxY)/2;
    return faces.map(face=>{
      const n=face.normal,illum=.32+Math.max(0,-n[0]*.32+n[1]*.58+n[2]*.72)*.67;
      const spec=Math.pow(Math.max(0,-n[0]*.12+n[1]*.35+n[2]*.92),20)*30;
      let base=palette[face.material];
      if(light&&face.material==='edge')base=[135,147,168];
      if(light&&face.material==='ceramic')base=[183,193,209];
      const emissive=face.material==='indigo'||face.material==='copper';
      const energy=face.energy||0;
      const color=base.map(v=>Math.round(Math.min(255,emissive?v*(light?.42+energy*.43:.35+energy*.7):v*illum+spec+energy*18)));
      return {points:face.points.map(p=>{const s=1/(1-p[2]/9);return[(p[0]*s-cx)*scale+w*.5,(-p[1]*s-cy)*scale+h*.47];}),depths:face.points.map(p=>9-p[2]),color};
    });
  }
  function renderData(kind,time,w,h,px=0,py=0,light=false,scroll=0,motion=1){return projectFaces(viewFaces(kind,time,px,py,scroll,motion),kind,w,h,light);}
  // Static SVG fallback uses plane splitting rather than average-depth sorting.
  // This runs when generating the assets, never in the live animation loop.
  function orderFaces(faces){
    if(!faces.length)return [];
    const plane=faces[0],normal=plane.normal,d=dot(normal,plane.points[0]),front=[],back=[],coplanar=[];
    for(const face of faces){
      const distances=face.points.map(p=>dot(normal,p)-d);
      const positive=distances.some(x=>x>1e-6),negative=distances.some(x=>x< -1e-6);
      if(!positive&&!negative){coplanar.push(face);continue;}
      if(!negative){front.push(face);continue;}if(!positive){back.push(face);continue;}
      const fp=[],bp=[];
      for(let i=0;i<face.points.length;i++){
        const j=(i+1)%face.points.length,p=face.points[i],q=face.points[j],di=distances[i],dj=distances[j];
        if(di>=-1e-6)fp.push(p);if(di<=1e-6)bp.push(p);
        if((di>1e-6&&dj< -1e-6)||(di< -1e-6&&dj>1e-6)){
          const t=di/(di-dj),point=p.map((v,k)=>v+(q[k]-v)*t);fp.push(point);bp.push(point);
        }
      }
      if(fp.length>=3)front.push({...face,points:fp});if(bp.length>=3)back.push({...face,points:bp});
    }
    return dot(normal,[0,0,9])-d>=0?[...orderFaces(back),...coplanar,...orderFaces(front)]:[...orderFaces(front),...coplanar,...orderFaces(back)];
  }
  function svg(kind){
    const faces=projectFaces(orderFaces(viewFaces(kind,0)),kind,800,800);
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">'+faces.map(f=>'<polygon points="'+f.points.map(p=>p.map(n=>n.toFixed(3)).join(',')).join(' ')+'" fill="rgb('+f.color.join(',')+')"/>').join('')+'</svg>';
  }
  if(typeof module!=='undefined'&&module.exports){module.exports={svg,scene,renderData,openness};return;}
  // Product shortcuts remain functional when graphics acceleration is unavailable.
  document.querySelectorAll('[data-hero-product]').forEach(link=>link.addEventListener('click',()=>{
    const name=link.dataset.heroProduct;
    document.querySelectorAll('.product-picker button').forEach(button=>{if(button.textContent.trim()===name)button.click();});
  }));
  const art=document.querySelector('[data-hero-art]');if(!art)return;
  const canvas=art.querySelector('canvas');
  const gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:true,powerPreference:'low-power'});if(!gl)return;
  let program,buffer,positionAttribute,colorAttribute,rendererReady=false;
  function initRenderer(){
    try{
      function compile(type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);throw new Error('Hero shader unavailable');}return shader;}
      const vertex=compile(gl.VERTEX_SHADER,'attribute vec4 aPosition; attribute vec3 aColor; varying vec3 vColor; void main(){gl_Position=aPosition;vColor=aColor;}');
      const fragment=compile(gl.FRAGMENT_SHADER,'precision mediump float; varying vec3 vColor; void main(){gl_FragColor=vec4(vColor,1.0);}');
      program=gl.createProgram();gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);return false;}
      positionAttribute=gl.getAttribLocation(program,'aPosition');colorAttribute=gl.getAttribLocation(program,'aColor');buffer=gl.createBuffer();
      gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LESS);gl.clearDepth(1);gl.clearColor(0,0,0,0);
      return true;
    }catch(_){return false;}
  }
  rendererReady=initRenderer();if(!rendererReady)return;
  const hero=document.getElementById('hero'),preference=matchMedia('(prefers-reduced-motion: reduce)'),finePointer=matchMedia('(hover:hover) and (pointer:fine)');
  // Keep touch and compact layouts steady during normal page scrolling.
  const scrollMotion=matchMedia('(min-width: 761px) and (hover: hover) and (pointer: fine)');
  let width=0,height=0,ratio=1,time=0,last=0,frame=null,visible=true,targetX=0,targetY=0,pointerX=0,pointerY=0;
  let scrollTarget=0,scrollProgress=0;
  function readScroll(){
    if(preference.matches||!scrollMotion.matches){scrollTarget=scrollProgress=0;art.style.transform='';return;}
    const bounds=hero.getBoundingClientRect();
    const progress=Math.max(0,Math.min(1,-bounds.top/(bounds.height*.55)));
    scrollTarget=progress*progress*(3-2*progress);
  }
  window.addEventListener('scroll',readScroll,{passive:true});
  let vertices=new Float32Array(0);
  function paint(){
    if(!rendererReady||gl.isContextLost()||!width||!height)return;
    const light=document.documentElement.getAttribute('data-theme')==='light';
    const faces=renderData(art.dataset.heroArt,preference.matches?0:time,width,height,pointerX,pointerY,light,scrollProgress,scrollMotion.matches?1:.45);
    art.style.transform=scrollProgress?`translateY(${scrollProgress*Math.min(100,hero.clientHeight*.12)}px)`: '';
    const needed=faces.length*6*7;if(vertices.length<needed)vertices=new Float32Array(needed);
    let cursor=0;
    for(const face of faces)for(let triangle=1;triangle<face.points.length-1;triangle++)for(const index of [0,triangle,triangle+1]){
      const [x,y]=face.points[index],depth=face.depths[index];
      // Preserve perspective depth per vertex. A depth buffer resolves occlusion
      // per pixel, including crossing projections and long architectural faces.
      vertices[cursor++]=(x/width*2-1)*depth;vertices[cursor++]=(1-y/height*2)*depth;
      vertices[cursor++]=(21/19)*depth-40/19;vertices[cursor++]=depth;
      const tint=[7,0,-7,0][index];for(const c of face.color)vertices[cursor++]=Math.max(0,Math.min(255,c+tint))/255;
    }
    gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,vertices.subarray(0,cursor),gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(positionAttribute);gl.vertexAttribPointer(positionAttribute,4,gl.FLOAT,false,28,0);
    gl.enableVertexAttribArray(colorAttribute);gl.vertexAttribPointer(colorAttribute,3,gl.FLOAT,false,28,16);
    gl.drawArrays(gl.TRIANGLES,0,cursor/7);art.setAttribute('data-ready','');
  }
  function tick(now){frame=null;
    if(preference.matches){readScroll();targetX=targetY=pointerX=pointerY=0;paint();last=0;return;}
    if(!rendererReady||gl.isContextLost()||!visible||document.hidden){last=0;return;}
    if(!last||now-last>=1000/30){
      const elapsed=last?Math.min(now-last,100):0;
      time+=elapsed/1000;last=now;
      const pointerEase=1-Math.exp(-elapsed/650);
      pointerX+=(targetX-pointerX)*pointerEase;pointerY+=(targetY-pointerY)*pointerEase;
      // Keep scroll response consistent on both fast and slower graphics hardware.
      scrollProgress+=(scrollTarget-scrollProgress)*(1-Math.exp(-elapsed/160));
      if(Math.abs(scrollTarget-scrollProgress)<.0001)scrollProgress=scrollTarget;
      paint();
    }frame=requestAnimationFrame(tick);
  }
  function sync(){readScroll();if(preference.matches)scrollProgress=0;if(frame!==null)cancelAnimationFrame(frame);frame=null;last=0;if(preference.matches||!scrollMotion.matches){targetX=targetY=pointerX=pointerY=0;}paint();if(rendererReady&&!gl.isContextLost()&&visible&&!document.hidden&&!preference.matches)frame=requestAnimationFrame(tick);}
  function resize(){width=art.clientWidth;height=art.clientHeight;ratio=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);readScroll();scrollProgress=scrollTarget;sync();}
  hero.addEventListener('pointermove',e=>{if(preference.matches||!scrollMotion.matches||!finePointer.matches||e.pointerType!=='mouse')return;const r=hero.getBoundingClientRect();targetX=(e.clientX-r.left)/r.width-.5;targetY=(e.clientY-r.top)/r.height-.5;},{passive:true});
  hero.addEventListener('pointerleave',()=>{targetX=targetY=0;});
  new ResizeObserver(resize).observe(art);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(hero);
  new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  document.addEventListener('visibilitychange',sync);preference.addEventListener('change',sync);scrollMotion.addEventListener('change',sync);resize();
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();rendererReady=false;art.removeAttribute('data-ready');sync();});
  canvas.addEventListener('webglcontextrestored',()=>{rendererReady=initRenderer();sync();});
})();
