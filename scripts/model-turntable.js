// Image-only prototype: no geometry, textures or model source is delivered.
(()=>{
 const root=document.querySelector('#jade-grove'),frame=root.querySelector('.media-frame'),img=root.querySelector('.detail-image');
 
 const urls=Array.from({length:36},(_,i)=>'Turntables/car-v2/'+String(i).padStart(3,'0')+'.webp');
 let pictures=null,index=0,zoom=1,active=false,drag=null,imagesReady=false;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const previous=document.createElement('img');previous.className='turntable-blend';previous.alt='';previous.setAttribute('aria-hidden','true');previous.draggable=false;previous.hidden=true;img.after(previous);
 function clearBlend(){previous.hidden=true;previous.style.opacity='0';}
 function preload(){
  if(pictures)return;
  pictures=urls.map(src=>{const image=new Image();image.decoding='async';image.src=src;return image;});
  Promise.all(pictures.map(image=>image.decode())).then(()=>{imagesReady=true;if(active)show(index);}).catch(()=>{ /* Keep the poster visible if any frame cannot load. */ });
 }
 // Keep rotation timing continuous, but display a single crisp rendered angle.
 function show(n){
  preload();index=((n%36)+36)%36;
  if(imagesReady){
   const nearest=Math.round(index)%36;
   if(img.getAttribute('src')!==urls[nearest])img.src=urls[nearest];
  }
  clearBlend();
  img.style.transform='scale('+zoom+')';
 }
 const controls=document.createElement('div');controls.className='turntable-orientation';controls.hidden=true;
 const stick=document.createElement('div');stick.className='turntable-stick';stick.tabIndex=0;stick.setAttribute('role','slider');stick.setAttribute('aria-label','Model rotation speed. Hold left or right; farther from center rotates faster.');stick.setAttribute('aria-valuemin','-100');stick.setAttribute('aria-valuemax','100');
 const thumb=document.createElement('span');thumb.className='turntable-stick-thumb';thumb.textContent='↔';thumb.setAttribute('aria-hidden','true');stick.append(thumb);
 controls.append(stick);root.querySelector('.detail-caption').append(controls);
 let deflection=0,stickPointer=null,rotationFrame=0,rotationTime=0,rotationSpeed=0;
 function stopStick(){
  const pointer=stickPointer;stickPointer=null;deflection=0;rotationSpeed=0;cancelAnimationFrame(rotationFrame);rotationFrame=0;
  stick.classList.remove('is-held');thumb.style.transform='translateX(0px)';stick.setAttribute('aria-valuenow','0');stick.setAttribute('aria-valuetext','Stopped');
  if(pointer!==null&&stick.hasPointerCapture(pointer))stick.releasePointerCapture(pointer);
 }
 function rotate(time){
  rotationFrame=0;
  if(!active||document.hidden||root.querySelector('.work-view').hidden||root.querySelector('.detail').hidden){stopStick();return;}
  const dt=Math.min((time-rotationTime)/1000,.05);rotationTime=time;
  rotationSpeed+=(deflection*18-rotationSpeed)*(1-Math.exp(-dt/.055));
  if(imagesReady)show(index+rotationSpeed*dt);
  if(deflection)rotationFrame=requestAnimationFrame(rotate);
 }
 function setStick(value){
  deflection=Math.abs(value)<.06?0:Math.max(-1,Math.min(1,value));
  const travel=(stick.clientWidth-40)/2;thumb.style.transform='translateX('+(deflection*travel)+'px)';
  stick.setAttribute('aria-valuenow',String(Math.round(deflection*100)));stick.setAttribute('aria-valuetext',deflection?(deflection<0?'Left':'Right')+', '+Math.round(Math.abs(deflection)*100)+' percent speed':'Stopped');
  if(deflection&&!rotationFrame){rotationTime=performance.now();rotationFrame=requestAnimationFrame(rotate);}
 }
 function moveStick(e){const box=stick.getBoundingClientRect();setStick((e.clientX-box.left-box.width/2)/((box.width-40)/2));}
 stick.addEventListener('pointerdown',e=>{if(!active||e.button!==0)return;e.preventDefault();stickPointer=e.pointerId;stick.setPointerCapture(e.pointerId);stick.focus();stick.classList.add('is-held');moveStick(e);});
 stick.addEventListener('pointermove',e=>{if(e.pointerId===stickPointer)moveStick(e);});
 for(const type of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(type,stopStick);
 stick.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();stick.classList.add('is-held');setStick((e.key==='ArrowLeft'?-1:1)*(e.shiftKey?1:.4));}else if(e.key==='Escape'||e.key==='Home'){e.preventDefault();stopStick();}});
 stick.addEventListener('keyup',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key))stopStick();});
 stick.addEventListener('blur',stopStick);window.addEventListener('blur',stopStick);document.addEventListener('visibilitychange',()=>{if(document.hidden)stopStick();});stopStick();
 const hint=document.createElement('p');hint.className='turntable-help';hint.textContent='you can drag and scroll (zoom) at the model';hint.hidden=true;
 root.querySelector('.detail-caption').append(hint);
 const reset=document.createElement('button');reset.className='turntable-reset';reset.textContent='reset view';reset.hidden=true;root.querySelector('.media-tabs').append(reset);
 reset.onclick=()=>{stopStick();zoom=1;show(0);};
 const style=document.createElement('style');style.textContent=`
 #jade-grove .turntable-blend{position:absolute;inset:0;width:100%;height:100%;object-fit:fill;pointer-events:none}
 #jade-grove .turntable-orientation{display:flex;align-items:center;justify-content:center;gap:14px;max-width:340px;margin:12px auto 0}
 #jade-grove .turntable-orientation button{border:1px solid var(--jo-line);background:transparent;border-radius:6px;width:38px;height:34px;color:var(--jo-muted)}
 #jade-grove .turntable-stick{position:relative;width:240px;height:38px;border:1px solid var(--jo-line);border-radius:24px;background:rgba(178,223,191,.025);cursor:ew-resize;touch-action:none;user-select:none;display:flex;align-items:center;justify-content:center}
 #jade-grove .turntable-stick::before{content:'';position:absolute;left:50%;height:18px;border-left:1px solid #b2dfbf35}
 #jade-grove .turntable-stick-thumb{display:grid;place-items:center;width:32px;height:30px;border:1px solid #b2dfbf65;border-radius:20px;background:#263b2e;color:#d8eade;pointer-events:none;transition:transform 150ms ease-out}
 #jade-grove .turntable-stick.is-held .turntable-stick-thumb{transition:none}
 #jade-grove .turntable-stick:focus-visible{outline:2px solid #b2dfbf;outline-offset:4px}
 @media(prefers-reduced-motion:reduce){#jade-grove .turntable-stick-thumb{transition:none}}
 #jade-grove .media-frame.is-turntable{cursor:grab;touch-action:pan-y}
 #jade-grove .media-frame.is-turntable:active{cursor:grabbing}
 #jade-grove .turntable-help{font-size:12px;color:var(--jo-muted);margin:8px 0 0}
 #jade-grove .turntable-reset{border:1px solid var(--jo-line);background:transparent;padding:12px 15px;border-radius:5px;color:var(--jo-muted)}
 #jade-grove .creation[data-turntable] .creation-inner{background:#000}
 #jade-grove .creation[data-turntable] .creation-inner::after{background:linear-gradient(transparent 70%,#000)}
 #jade-grove .creation[data-turntable] img{object-fit:contain;background:#000}
 `;document.head.append(style);
 frame.addEventListener('pointerdown',e=>{if(!active||e.button!==0)return;stopStick();drag={x:e.clientX,start:index};frame.setPointerCapture(e.pointerId);frame.focus();});
 frame.addEventListener('pointermove',e=>{if(!active||!drag)return;show(drag.start+(drag.x-e.clientX)/10);});
 const release=()=>{drag=null;};frame.addEventListener('pointerup',release);frame.addEventListener('pointercancel',release);frame.addEventListener('lostpointercapture',release);
 frame.addEventListener('wheel',e=>{if(!active)return;e.preventDefault();zoom=Math.max(1,Math.min(2.4,zoom-e.deltaY*.0015));show(index);},{passive:false});
 frame.addEventListener('keydown',e=>{if(!active)return;if(['ArrowLeft','ArrowRight','Home'].includes(e.key)){e.preventDefault();show(e.key==='Home'?0:index+(e.key==='ArrowRight'?1:-1));}});
 window.carTurntable={open(item){active=item?.image==='Modelling-Photos/Car.png';zoom=1;index=0;drag=null;clearBlend();stopStick();controls.hidden=!active;root.querySelector('.media-note').hidden=active;img.style.transform='';frame.classList.toggle('is-turntable',active);hint.hidden=reset.hidden=!active;frame.tabIndex=active?0:-1;frame.setAttribute('aria-label',active?'Car turntable. Drag or use arrow keys to rotate.':'Project preview');root.querySelector('[data-media="video"]').hidden=active;root.querySelector('[data-media="image"]').hidden=active;root.querySelector('[data-media="image"]').textContent='image';if(active){preload();}},close(){stopStick();active=false;drag=null;clearBlend();img.style.transform='';}};
})();
