
(()=>{
 const root=document.getElementById('jade-grove'),stage=root.querySelector('.tree-stage'),canvas=stage.querySelector('canvas'),c=canvas.getContext('2d'),buttons=[...stage.querySelectorAll('.tree-nav button')];
 const settings={wind:true,strength:100},reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let width=0,height=540,scaleY=1,ratio=1,raf=0,visible=true,pressedAt=-Infinity,pressDirection=1;
 const positions=[[.5,164],[.25,258],[.75,342],[.25,426],[.75,510]];
 buttons.forEach((b,i)=>{b.dataset.x=positions[i][0];b.dataset.y=positions[i][1];b.style.setProperty('--vine-x',positions[i][0]*100+'%');b.style.setProperty('--vine-y',(positions[i][1]-80)/540*100+'%')});

 buttons.forEach(b=>b.addEventListener('click',()=>{if(reduced.matches)return;pressedAt=performance.now();pressDirection=Number(b.dataset.x)<.5?-1:1;restart()}));
 function draw(ms=0){
  if(!width)return;
  c.setTransform(ratio,0,0,ratio,0,0);c.clearRect(0,0,width,height);c.scale(1,scaleY);c.translate(0,-80);
  const time=ms/1000*1.15,wind=settings.wind&&!reduced.matches?settings.strength/100:0;
  const elapsed=Math.max(0,(ms-pressedAt)/1000);
  const impulse=!reduced.matches&&elapsed<2?pressDirection*4*Math.exp(-3.8*elapsed)*Math.sin(13*elapsed):0;
  function stem(y){const height=(608-y)/490;return {x:width*.5+impulse*height+Math.sin((y-130)/83)*6+wind*height*height*(Math.sin(time*.67-height*.8)*4+Math.sin(time*1.07)*.7),y}}
  function stroke(points,lineWidth,color='#73927c') {c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.strokeStyle=color;c.lineWidth=lineWidth;c.lineCap='round';c.lineJoin='round';c.stroke()}
  function leaf(base,side,size,phase){
   const angle=side*(.8+Math.sin(time*.72+phase)*.035*wind);
   c.save();c.translate(base.x,base.y);c.rotate(angle);
   // The petiole and blade share their exact endpoint; no independently placed leaves.
   stroke([{x:0,y:0},{x:0,y:-5}],.8,'#65856e');
   c.beginPath();c.moveTo(0,-5);c.bezierCurveTo(-size*.42,-size*.4,-size*.45,-size*.88,0,-size-5);c.bezierCurveTo(size*.48,-size*.8,size*.38,-size*.35,0,-5);
   c.fillStyle='#3d5845';c.fill();
   c.beginPath();c.moveTo(0,-5);c.quadraticCurveTo(1,-size*.55,0,-size*.9);c.strokeStyle='#6e8b765c';c.lineWidth=.7;c.stroke();c.restore();
  }
  const poses=buttons.map((b,i)=>{
   const y=Number(b.dataset.y),height=(608-y)/490;
   const phase=time*.67-height*.8-.18;
   const dx=impulse*height+wind*(height*height*4*Math.sin(phase)+1.2*Math.sin(time*1.07-i*.3));
   const dy=wind*.65*Math.sin(time*.67-i*.4);
   const angle=impulse*.3+wind*(1.7*Math.sin(phase-.35)+.35*Math.sin(time*1.07-i*.3));
   b.style.transform=`translate(-50%,-50%) translate(${dx}px,${dy*scaleY}px) rotate(${angle}deg)`;
   const radians=angle*Math.PI/180;
   return {x:width*Number(b.dataset.x)+dx-23*Math.sin(radians),y:y+dy+23*Math.cos(radians)/scaleY,angle:radians};
  });
  // Taper the stem toward its growing tip, keeping the root anchored.
  for(let y=607;y>164;y-=3)stroke([stem(y),stem(y-3)],1.1+2*(y-110)/497);
  // Branches meet the exact rotated bottom-center attachment of each moving button.
  buttons.slice(1).forEach((b,i)=>{
   const side=Number(b.dataset.x)<.5?-1:1,ey=Number(b.dataset.y)+25,sy=ey+66;
   const p0=stem(sy),p3=poses[i+1];
   const p1={x:p0.x+side*width*.065,y:sy-26},p2={x:p3.x-29*Math.sin(p3.angle),y:p3.y+29*Math.cos(p3.angle)};
   function sample(t){const q=1-t;return {x:q*q*q*p0.x+3*q*q*t*p1.x+3*q*t*t*p2.x+t*t*t*p3.x,y:q*q*q*p0.y+3*q*q*t*p1.y+3*q*t*t*p2.y+t*t*t*p3.y}}
   const points=Array.from({length:37},(_,j)=>sample(j/36));stroke(points,1.45);
   leaf(sample(.43),side,24,i*.8);leaf(sample(.77),-side,18,i*.8+1.3);
  });
  // Small alternating growth follows the stem itself rather than floating beside it.
  leaf(stem(216),1,22,.5);leaf(stem(242),-1,17,1.2);
  leaf(stem(570),-1,20,2);leaf(stem(588),1,15,2.8);

 }
 function frame(t){raf=0;draw(t);if(visible&&!document.hidden&&settings.wind&&!reduced.matches)raf=requestAnimationFrame(frame)}
 function restart(){cancelAnimationFrame(raf);raf=0;draw(performance.now());if(visible&&!document.hidden&&settings.wind&&!reduced.matches)raf=requestAnimationFrame(frame)}
 new ResizeObserver(()=>{width=stage.clientWidth;height=stage.clientHeight;scaleY=height/540;ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);restart()}).observe(stage);
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;restart()}).observe(stage);
 document.addEventListener('visibilitychange',restart);reduced.addEventListener('change',restart);
})();
