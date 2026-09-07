// A captured movement finger may travel anywhere; the base follows at full tilt.
export class FloatingStick {
  constructor(radius=36,deadzone=4){this.radius=radius;this.deadzone=deadzone;this.reset();}
  reset(){this.id=null;this.x=0;this.y=0;this.value={x:0,z:0};}
  start(id,x,y){if(this.id!==null)return false;this.id=id;this.x=x;this.y=y;this.value={x:0,z:0};return true;}
  move(id,x,y){if(id!==this.id)return false;let dx=x-this.x,dy=y-this.y,d=Math.hypot(dx,dy);if(d>this.radius){this.x=x-dx/d*this.radius;this.y=y-dy/d*this.radius;dx=x-this.x;dy=y-this.y;d=this.radius;}const strength=Math.max(0,(d-this.deadzone)/(this.radius-this.deadzone));this.value=d?{x:dx/d*strength,z:dy/d*strength}:{x:0,z:0};return true;}
  end(id){if(id!==this.id)return false;this.reset();return true;}
}

export function installPointerControls({world,stick,canMove,canLook,width,onMove,onLook,onStart}){
  const movement=new FloatingStick();let moveOwner=null,look=null;
  function paint(){const active=movement.id!==null;stick.classList.toggle('active',active);if(active){stick.style.left=movement.x+'px';stick.style.top=movement.y+'px';stick.firstElementChild.style.transform=`translate(${movement.value.x*36}px,${movement.value.z*36}px)`;}else{stick.style.left='';stick.style.top='';stick.firstElementChild.style.transform='';}onMove({...movement.value});}
  function reset(){const captures=[[moveOwner,movement.id],[world,look?.id]];moveOwner=null;look=null;movement.reset();paint();for(const [node,id]of captures)if(node&&id!=null&&node.hasPointerCapture(id))node.releasePointerCapture(id);}
  function begin(e,fromStick){if(e.pointerType==='mouse'&&e.button!==0)return;const touch=e.pointerType!=='mouse';const wantsMove=fromStick||(touch&&canMove()&&e.clientX<width()*.5);if(wantsMove){if(!canMove()||!movement.start(e.pointerId,e.clientX,e.clientY))return;moveOwner=e.currentTarget;moveOwner.setPointerCapture(e.pointerId);e.preventDefault();onStart();paint();}else if(canLook()&&!look){look={id:e.pointerId,x:e.clientX};world.setPointerCapture(e.pointerId);e.preventDefault();}}
  function move(e){if(e.pointerId===movement.id){if(!canMove()){reset();return;}e.preventDefault();movement.move(e.pointerId,e.clientX,e.clientY);paint();}else if(look?.id===e.pointerId){if(!canLook()){reset();return;}e.preventDefault();onLook(e.clientX-look.x);look.x=e.clientX;}}
  function end(e){if(movement.end(e.pointerId)){moveOwner=null;paint();}if(look?.id===e.pointerId)look=null;}
  for(const node of [world,stick]){node.addEventListener('pointerdown',e=>begin(e,node===stick));node.addEventListener('pointermove',move);for(const name of ['pointerup','pointercancel','lostpointercapture'])node.addEventListener(name,end);}
  return {reset};
}

// Safari's touch defaults need cancellation in addition to CSS. Pointer Events
// drive movement/combat; ordinary HUD taps are activated once here because
// canceling touchend intentionally suppresses the browser's synthetic click.
export function installGameplayGestures(doc,isPlaying){
  const taps=new Map();
  const inGame=target=>!!target?.closest?.('#world, #hud');
  const cancel=e=>{if(e.cancelable)e.preventDefault();};
  doc.addEventListener('touchstart',e=>{if(!isPlaying()||!inGame(e.target))return;for(const t of e.changedTouches)taps.set(t.identifier,{target:t.target||e.target,x:t.clientX,y:t.clientY,moved:false});},{passive:true});
  doc.addEventListener('touchmove',e=>{for(const t of e.changedTouches){const tap=taps.get(t.identifier);if(tap&&Math.hypot(t.clientX-tap.x,t.clientY-tap.y)>12)tap.moved=true;}if(isPlaying()&&inGame(e.target))cancel(e);},{passive:false});
  doc.addEventListener('touchend',e=>{const playing=isPlaying()&&inGame(e.target);if(playing)cancel(e);for(const t of e.changedTouches){const tap=taps.get(t.identifier);taps.delete(t.identifier);if(!playing||!tap||tap.moved||Math.hypot(t.clientX-tap.x,t.clientY-tap.y)>12)continue;const button=tap.target.closest?.('#hud button');if(button&&!button.disabled&&!button.closest('#actions'))button.click();}},{passive:false});
  doc.addEventListener('touchcancel',e=>{for(const t of e.changedTouches)taps.delete(t.identifier);},{passive:true});
  for(const name of ['gesturestart','gesturechange','gestureend'])doc.addEventListener(name,e=>{if(isPlaying()&&!e.target?.closest?.('dialog'))cancel(e);},{passive:false});
  for(const name of ['contextmenu','selectstart','dragstart','dblclick'])doc.addEventListener(name,e=>{if(isPlaying()&&inGame(e.target))cancel(e);});
  return {reset(){taps.clear();}};
}
