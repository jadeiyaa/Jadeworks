// Local-only hover experiment. No dependencies or continuous animation loop.
(()=>{
 const root=document.querySelector('#jade-grove');if(!root)return;
 const fine=matchMedia('(hover:hover) and (pointer:fine)');
 const style=document.createElement('style');
 style.textContent=`
 .glow-positioned{position:relative}
 .local-glow{position:absolute;inset:0;border-radius:inherit;pointer-events:none!important;z-index:20;opacity:0;transition:opacity 220ms ease;background:radial-gradient(170px circle at var(--gx) var(--gy),rgba(151,221,167,.035),transparent 100%)}
 .local-glow::after{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;background:radial-gradient(145px circle at var(--gx) var(--gy),rgba(169,235,184,.30),transparent 100%);-webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none}
 #jade-grove .media-frame.is-turntable>.local-glow{z-index:30;background:radial-gradient(230px circle at var(--gx) var(--gy),rgba(151,221,167,.065),transparent 100%)}
 #jade-grove .media-frame.is-turntable>.local-glow::after{padding:1px;background:radial-gradient(220px circle at var(--gx) var(--gy),rgba(169,235,184,.42),transparent 100%)}
 @media(prefers-reduced-motion:reduce){.local-glow{transition:none}}
 @media(hover:none),(pointer:coarse){.local-glow{display:none}}
 `;document.head.append(style);
 const selector='button:not(.brand):not([data-category]),.info-content,.plan,.segmented,.media-frame,.turntable-stick';
 let targets=[],active=new Set(),frame=0,pointer=null;
 function collect(){
  targets=[...root.querySelectorAll(selector)];
  for(const el of targets){
   if(el.querySelector(':scope > .local-glow'))continue;
   if(getComputedStyle(el).position==='static')el.classList.add('glow-positioned');
   const layer=document.createElement('span');layer.className='local-glow';layer.setAttribute('aria-hidden','true');el.append(layer);
  }
 }
 function clear(){pointer=null;for(const layer of active)layer.style.opacity=0;active.clear();}
 function draw(){
  frame=0;if(!pointer||!fine.matches)return;
  const next=new Set();
  for(const el of targets){
   if(!el.isConnected||el.closest('[hidden],[inert]'))continue;
   const rect=el.getBoundingClientRect();if(!rect.width||!rect.height)continue;
   const dx=Math.max(rect.left-pointer.x,0,pointer.x-rect.right),dy=Math.max(rect.top-pointer.y,0,pointer.y-rect.bottom);
   if(Math.hypot(dx,dy)>120)continue;
   const layer=el.querySelector(':scope > .local-glow');
   layer.style.setProperty('--gx',((pointer.x-rect.left)/rect.width*el.clientWidth)+'px');
   layer.style.setProperty('--gy',((pointer.y-rect.top)/rect.height*el.clientHeight)+'px');
   layer.style.opacity=1;next.add(layer);
  }
  for(const layer of active)if(!next.has(layer))layer.style.opacity=0;
  active=next;
 }
 root.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||!fine.matches)return;pointer={x:e.clientX,y:e.clientY};if(!frame)frame=requestAnimationFrame(draw);},{passive:true});
 root.addEventListener('pointerleave',clear);window.addEventListener('blur',clear);
 window.addEventListener('scroll',clear,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
 collect();let queued=false;
 new MutationObserver(records=>{if(records.every(r=>[...r.addedNodes,...r.removedNodes].every(n=>n.nodeType===1&&n.classList.contains('local-glow'))))return;if(!queued){queued=true;queueMicrotask(()=>{queued=false;collect();});}}).observe(root,{childList:true,subtree:true});
})();
