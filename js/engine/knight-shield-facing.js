/* Ring a shield to choose the next front; keep the charge already promised. */
"use strict";
(() => {
 let facings=new WeakMap();
 function facing(owner){const at=facings.get(owner);if(!at)return null;if(owner.dead||owner.status?.stun?.dur>0||owner.bossStaggerT>0||G.state.knockout||at.map!==G.state.mapId||at.phase!==owner.bossPhase||!G.state.enemies.includes(owner)){facings.delete(owner);return null;}return at;}
 G.cancelEclipseFacing=owner=>{if(owner)facings.delete(owner);else facings=new WeakMap();};
 function guardHazard(at){return [at?.hazard,at?.next].find(h=>h&&G.state.bossHazards.includes(h)&&h.t>=(h.delay||0)&&h.t<(h.delay||0)+h.warning+h.active);}
 function recordRing(owner){owner.eclipseCounters=(owner.eclipseCounters||0)+1;G.sfx.play('wardBreak');G.damageNumber(owner.x,owner.y-owner.h()-5,'CLANG!','#ffdc91');G.state.guardianChallenges.knight.counterLearned=true;G.saveGame();G.events.emit('guardianCounter',{guardian:'eclipseKnight',kind:'shield'});}
 G.hitEclipseShield=(owner,opts)=>{
  if(owner?.def?.id!=='eclipseKnight'||owner.dead||owner.status?.stun?.dur>0||owner.bossStaggerT>0||G.state.knockout||!G.state.enemies.includes(owner)||!(opts.damage>0)||!G.abilities[opts.ability])return false;
  const angle=G.eclipseContactAngle(owner,opts);if(angle===null)return false;const prior=facing(owner),h=guardHazard(prior);
  if(h){
   const front=Math.abs(G.util.angleDiff(angle,h.angle))<=70*Math.PI/180;
   if(front&&prior.next&&h===prior.hazard&&!prior.nextChosen&&prior.next.t<prior.next.delay){prior.next.angle=angle;prior.nextChosen=true;recordRing(owner);}
   return front;
  }
  if(!G.eclipseShieldRaised(owner))return false;
  if(prior?.pattern===owner.bossPattern)return true;
  facings.set(owner,{angle,pattern:owner.bossPattern,map:G.state.mapId,phase:owner.bossPhase,queued:true});recordRing(owner);return true;
 };
 G.registerGuardianAuthor('eclipseKnight',{actions:{eclipseSweep(owner,p,spawn){
  const previous=facing(owner),angle=previous?.queued?previous.angle:Math.atan2(p.y-owner.y,p.x-owner.x);
  const h=spawn(owner,'eclipseSweep',{x:owner.x,y:owner.y,angle,radius:56+owner.bossPhase*8,halfAngle:(45+owner.bossPhase*10)*Math.PI/180,warning:.85,active:.24,color:'#b58ee6'});
  const at={angle,pattern:owner.bossPattern,map:G.state.mapId,phase:owner.bossPhase,queued:false,hazard:h};facings.set(owner,at);
  if(owner.bossPhase>=2){const delay=(G.guardianWarningSeconds?.(.85)??.85)+.24+.55;at.next=spawn(owner,'eclipseSweep',{x:owner.x,y:owner.y,angle:angle+(owner.bossPhase===3?Math.PI:Math.PI/2),radius:h.radius,halfAngle:55*Math.PI/180,delay,warning:1.15,active:.24,color:'#b58ee6'});}
  owner.bossRecoverT=at.next?at.next.delay+at.next.warning+at.next.active+.9:h.warning+h.active+.9;
 }}});
 const update=G.updateOpening;G.updateOpening=dt=>{update(dt);for(const e of G.state.enemies||[]){const at=facing(e);if(at&&(e.bossStaggerT>0||!at.queued&&![at.hazard,at.next].some(h=>h&&G.state.bossHazards.includes(h))))facings.delete(e);}};
 const draw=G.openingDrawables;G.openingDrawables=c=>{const list=draw(c);for(const owner of G.state.enemies||[]){const at=facing(owner);if(!at)continue;const h=guardHazard(at),preview=at.queued?at.angle:at.nextChosen&&at.next.t<at.next.delay?at.next.angle:null;if(!h&&preview===null)continue;list.push({y:owner.y+2,fn:()=>{
  c.save();if(h){c.strokeStyle='#ffdc91';c.lineWidth=2.5;c.beginPath();c.arc(owner.x,owner.y-7,17,h.angle-70*Math.PI/180,h.angle+70*Math.PI/180);c.stroke();c.save();c.translate(owner.x+Math.cos(h.angle)*12,owner.y-7+Math.sin(h.angle)*10);c.rotate(h.angle+Math.PI/2);c.fillStyle='#493e5a';c.strokeStyle='#ffdc91';c.lineWidth=1.5;c.beginPath();c.moveTo(-5,-6);c.lineTo(5,-6);c.lineTo(4,2);c.lineTo(0,6);c.lineTo(-4,2);c.closePath();c.fill();c.stroke();c.restore();}
  if(preview!==null){c.strokeStyle='#fff3c2';c.lineWidth=1.5;c.setLineDash([2,2]);c.beginPath();c.arc(owner.x,owner.y-7,23,preview-.42,preview+.42);c.stroke();c.setLineDash([]);const x=owner.x+Math.cos(preview)*24,y=owner.y-7+Math.sin(preview)*24;c.fillStyle='#fff3c2';c.beginPath();c.arc(x,y,2,0,Math.PI*2);c.fill();}c.restore();
 }});}return list;};
})();
