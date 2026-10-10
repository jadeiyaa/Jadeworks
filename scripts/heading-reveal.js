// Fast ink-like reveal using the existing live text and font; local experiment.
(()=>{
 const root=document.querySelector('#jade-grove');if(!root)return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const headings=[...root.querySelectorAll('h1,.info-content>h2,.detail-caption>h2,.project-name')];
 const states=new WeakMap();
 function reveal(el){
  const previous=states.get(el);previous?.animation?.cancel();
  if(reduced.matches)return null;
  return el.animate([
   {clipPath:'inset(-8% 100% -12% -2%)',opacity:.35},
   {clipPath:'inset(-8% 0% -12% -2%)',opacity:1}
  ],{duration:460,easing:'cubic-bezier(.25,.65,.3,1)'});
 }
 function update(){
  for(const el of headings){
   const visible=!el.closest('[hidden]')&&el.getClientRects().length>0;
   const text=el.textContent,old=states.get(el);
   if(!visible){old?.animation?.cancel();states.set(el,{visible:false,text});continue;}
   if(!old||!old.visible||old.text!==text){const animation=reveal(el);states.set(el,{visible:true,text,animation});}
  }
 }
 let pending=false;
 const observer=new MutationObserver(records=>{
  if(!records.some(r=>r.type==='attributes'||headings.some(h=>h===r.target||h.contains(r.target))))return;
  if(!pending){pending=true;queueMicrotask(()=>{pending=false;update();});}
 });
 observer.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden']});
 reduced.addEventListener('change',()=>{if(reduced.matches)for(const el of headings)states.get(el)?.animation?.cancel();});
 update();
})();
