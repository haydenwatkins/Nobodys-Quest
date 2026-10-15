/* Ring a shield to choose the next front; keep the charge already promised. */
"use strict";
(() => {
 let facings=new WeakMap();
 function facing(owner){const at=facings.get(owner);if(!at)return null;if(owner.dead||G.state.knockout||at.map!==G.state.mapId||at.phase!==owner.bossPhase||!G.state.enemies.includes(owner)){facings.delete(owner);return null;}return at;}
 G.cancelEclipseFacing=owner=>{if(owner)facings.delete(owner);else facings=new WeakMap();};
 G.hitEclipseShield=(owner,opts)=>{
  if(owner?.def?.id!=='eclipseKnight'||owner.dead||G.state.knockout||!G.state.enemies.includes(owner)||!(opts.damage>0)||!G.abilities[opts.ability])return false;
  const prior=facing(owner),x=Number.isFinite(opts.fromX)?opts.fromX:G.state.player.x,y=Number.isFinite(opts.fromY)?opts.fromY:G.state.player.y;
  if(prior&&!prior.queued&&G.state.bossHazards.includes(prior.hazard)){
   const dx=x-owner.x,dy=y-owner.y,d=Math.hypot(dx,dy);
   return d<1||(dx*Math.cos(prior.angle)+dy*Math.sin(prior.angle))/d>=Math.cos(70*Math.PI/180);
  }
  if(!G.eclipseShieldRaised(owner))return false;
  if(prior?.pattern===owner.bossPattern)return true;
  facings.set(owner,{angle:Math.atan2(y-owner.y,x-owner.x),pattern:owner.bossPattern,map:G.state.mapId,phase:owner.bossPhase,queued:true});
  owner.eclipseCounters=(owner.eclipseCounters||0)+1;G.sfx.play('wardBreak');G.damageNumber(owner.x,owner.y-owner.h()-5,'CLANG!','#ffdc91');G.state.guardianChallenges.knight.counterLearned=true;G.saveGame();G.events.emit('guardianCounter',{guardian:'eclipseKnight',kind:'shield'});return true;
 };
 G.registerGuardianAuthor('eclipseKnight',{actions:{eclipseSweep(owner,p,spawn){
  const at=facing(owner),angle=at?.queued?at.angle:Math.atan2(p.y-owner.y,p.x-owner.x);
  const h=spawn(owner,'eclipseSweep',{x:owner.x,y:owner.y,angle,radius:56+owner.bossPhase*8,halfAngle:(45+owner.bossPhase*10)*Math.PI/180,warning:.85,active:.24,color:'#b58ee6'});
  if(at){at.queued=false;at.hazard=h;}owner.bossRecoverT=h.warning+h.active+.9;
 }}});
 const update=G.updateOpening;G.updateOpening=dt=>{update(dt);for(const e of G.state.enemies||[]){const at=facing(e);if(at&&(e.bossStaggerT>0||!at.queued&&!G.state.bossHazards.includes(at.hazard)))facings.delete(e);}};
})();
