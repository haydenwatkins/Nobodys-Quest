/* Open driftwood; walk with a real continuing tide through its outlet. */
"use strict";
(() => {
 const point=(x,y)=>({x:x*16+8,y:y*16+8}),fire=point(3,11),lamp=point(4,12),friend=point(5,10),practice=point(6,13);
 const marlo=e=>e?.def?.id==='admiralTortoise';let sprays=[];
 const progress=()=>{const all=G.state.guardianChallenges||(G.state.guardianChallenges=G.makeGuardianChallenges());return all.marlo||(all.marlo=G.makeGuardianChallenges().marlo);};
 G.breakwaterVisitReady=()=>G.state.items.includes('tide-shell')&&G.systemIntroduced('sideAdventures')&&(!G.state.opening?.started||G.state.opening.version<2||(G.state.claimedForms.includes('turtle')&&!G.activeFormOuting()&&!G.formReturnPromise()));
 G.breakwaterRematchActive=()=>G.state.mapId==='turtleTrial'&&G.state.enemies.some(e=>!e.dead&&marlo(e));
 G.breakwaterCompanionVisible=()=>G.state.mapId==='turtleTrial'&&G.state.items.includes('tide-shell')&&!G.breakwaterRematchActive()&&!G.state.gauntletRun&&!G.state.expeditionRun;
 const friendly=()=>G.breakwaterCompanionVisible()&&G.breakwaterVisitReady();
 G.breakwaterReturningLit=()=>progress().returningTide;
 G.breakwaterChallengeStation=()=>friendly()&&progress().counterLearned?{kind:'breakwaterChallenge',...lamp}:null;
 G.toggleBreakwaterReturning=()=>{if(!G.breakwaterChallengeStation())return false;progress().returningTide=!progress().returningTide;G.saveGame();return true;};
 function current(c,dx,dy,limit,b){let length=0;for(let at=1;at<=limit;at++){const x=c.x+dx*at,y=c.y+dy*at;if(x<b.left+6||x>b.right-6||y<b.top+8||y>b.bottom-6||!G.world.isSafeSpawn(x,y))break;length=at;}return{x:c.x,y:c.y,dx,dy,length,walked:0};}
 function inChannel(h,x,y){const b=h.bounds,at=h.axis==='x'?y-b.top:x-b.left,span=h.axis==='x'?b.bottom-b.top:b.right-b.left;return x>=b.left+6&&x<b.right-6&&y>=b.top+6&&y<b.bottom-6&&Math.floor(at/span*h.lanes)===h.safeLane;}
 function sluice(x,y,owner=null,h=null){const e=G.makeEnemy('slime',x,y);e.id='driftwoodSluice';e.def={...e.def,id:e.id,name:'Driftwood gate',practice:true,damage:0,speed:0,size:20};e.hp=1;e.ward=null;e.breakwaterSluice={owner,h,map:G.state.mapId,open:false};G.state.enemies.push(e);return e;}
 G.breakwaterSluiceAim=e=>!!e.breakwaterSluice&&!e.dead&&!e.breakwaterSluice.open;
 G.retireBreakwaterSluice=h=>{if(h.sluice)h.sluice.dead=true;};
 G.cancelBreakwaterSluices=owner=>{for(const e of G.state.enemies||[])if(e.breakwaterSluice?.owner&&(!owner||e.breakwaterSluice.owner===owner))e.dead=true;};
 G.prepareBreakwaterCounter=(owner,h)=>{
  if(!marlo(owner)||!h.safePoint)return;G.cancelBreakwaterSluices(owner);h.breakwater=true;
  if(!owner.marloReturningTide)return;
  const axis=h.axis==='x'?'y':'x',b=h.bounds,p=h.safePoint,span=axis==='x'?b.bottom-b.top:b.right-b.left,at=axis==='x'?p.y-b.top:p.x-b.left;
  // Both channels commit to the same reachable refuge. The second warning
  // starts only after the complete helped first tide and a clear breather.
  G.state.bossHazards.push({...h,axis,safeLane:G.util.clamp(Math.floor(at/span*h.lanes),0,h.lanes-1),safePoint:{...p},safeRoute:h.safeRoute.map(s=>({...s})),delay:(G.guardianWarningSeconds?.(h.warning)??h.warning)+h.active+.55,warning:h.warning,t:0,hit:false,sluice:null});
 };
 G.syncBreakwaterSluice=h=>{
  if(!h.breakwater||h.mapId!==G.state.mapId||h.owner.dead||G.state.knockout)return;
  const t=h.t-(h.delay||0);if(t<0)return;if(t>=h.warning+h.active){G.retireBreakwaterSluice(h);return;}if(h.sluice)return;
  const p=h.safePoint,spots=Array.from({length:16},(_,i)=>({x:p.x+Math.cos(i*Math.PI/8)*22,y:p.y+Math.sin(i*Math.PI/8)*22}));
  const at=spots.find(s=>inChannel(h,s.x,s.y)&&G.world.isSafeSpawn(s.x,s.y))||p;h.sluice=sluice(at.x,at.y,h.owner,h);
 };
 G.hitBreakwaterSluice=(e,opts)=>{
  const r=e.breakwaterSluice;if(e.dead||!r||r.open||r.map!==G.state.mapId||!(opts.damage>0)||!G.abilities[opts.ability])return false;
  if(r.owner&&(r.owner.dead||!marlo(r.owner)||r.h.owner!==r.owner||!G.state.bossHazards.includes(r.h)||r.h.t-(r.h.delay||0)<0||r.h.t-(r.h.delay||0)>=r.h.warning+r.h.active))return false;
  r.open=true;G.sfx.play('wardBreak');G.damageNumber(e.x,e.y-19,'OPEN!','#fff3c2');G.spawnFx({kind:'ring',x:e.x,y:e.y-4,color:'#73eff7',radius:21,dur:.35});
  if(!r.owner)r.practiceFlow={...current(e,1,0,64,{left:24,right:424,top:24,bottom:248}),practice:e};
  return false; // Opening wood is neither a creature hit nor a learned counter.
 };
 G.catchBreakwaterTide=h=>{
  const c=h.sluice,r=c?.breakwaterSluice,t=h.t-(h.delay||0),owner=h.owner;
  if(!h.breakwater||h.breakwaterFlow||!c||c.dead||!r.open||r.h!==h||r.map!==G.state.mapId||owner.dead||G.state.knockout||!G.state.bossHazards.includes(h)||t<h.warning||t>=h.warning+h.active)return false;
  const dx=h.axis==='y'?(owner.x>=c.x?1:-1):0,dy=h.axis==='x'?(owner.y>=c.y?1:-1):0;
  h.breakwaterFlow={...current(c,dx,dy,96,h.bounds),phase:owner.bossPhase};const {length}=h.breakwaterFlow;
  sprays.push({x:c.x,y:c.y,tx:c.x+dx*length,ty:c.y+dy*length,age:0});owner.breakwaterCounters=(owner.breakwaterCounters||0)+1;progress().counterLearned=true;
  G.damageNumber(c.x,c.y-22,'FLOW!','#fff3c2');G.sfx.play('wardBreak');G.saveGame();G.events.emit('guardianCounter',{guardian:'admiralTortoise',kind:'openSluice'});return false;
 };
 function liveFlow(h){const f=h.breakwaterFlow,t=h.t-(h.delay||0);return f&&h.mapId===G.state.mapId&&G.state.bossHazards.includes(h)&&!h.owner.dead&&G.state.enemies.includes(h.owner)&&!G.state.knockout&&f.phase===h.owner.bossPhase&&t>=h.warning&&t<h.warning+h.active?f:null;}
 function inFlow(f,p){if(!f)return false;const dx=p.x-f.x,dy=p.y-f.y,along=dx*f.dx+dy*f.dy,across=Math.abs(dx*f.dy-dy*f.dx);return along>=-8&&along<=f.length&&across<=14;}
 function practiceFlows(){return(G.state.enemies||[]).filter(e=>!e.dead&&e.breakwaterSluice?.map===G.state.mapId&&e.breakwaterSluice.practiceFlow).map(e=>e.breakwaterSluice.practiceFlow);}
 function flows(){return [...(G.state.bossHazards||[]).map(liveFlow).filter(Boolean),...practiceFlows()];}
 G.breakwaterCurrentShelters=(h,p)=>inFlow(liveFlow(h),p);
 const updatePlayer=G.updatePlayer;
 G.updatePlayer=dt=>{const p=G.state.player,x=p.x,y=p.y,map=G.state.mapId,dash=!!p.dashing;updatePlayer(dt);if(G.state.player!==p||G.state.mapId!==map||dash||p.dashing||G.state.knockout||G.ui.dialogueOpen||G.ui.menuOpen||Math.hypot(p.x-x,p.y-y)<.001)return;
  for(const f of flows()){if(!inFlow(f,p))continue;const along=G.input.vec.x*f.dx+G.input.vec.y*f.dy;if(along<=.1||(p.x-x)*f.dx+(p.y-y)*f.dy<=.001)continue;const left=f.length-((p.x-f.x)*f.dx+(p.y-f.y)*f.dy),step=Math.min(Math.max(0,left),60*along*dt);G.world.moveBox(p,f.dx*step,f.dy*step);f.walked+=Math.max(0,(p.x-x)*f.dx+(p.y-y)*f.dy);
   if(f.practice&&f.walked>=24&&(p.x-f.x)*f.dx+(p.y-f.y)*f.dy>=32){f.practice.dead=true;progress().practiceCleared=true;G.sfx.play('unlock');G.spawnFx({kind:'ring',x:f.x,y:f.y,color:'#fff3c2',radius:24,dur:.5});G.saveGame();}break;}
 };
 G.noteBreakwaterDefeat=e=>{if(!marlo(e))return;const a=progress(),n=e.breakwaterCounters||0;if(n>0){a.counterLearned=true;a.bestCounters=Math.max(a.bestCounters,n);}if(e.marloLocalRematch&&e.marloReturningTide&&G.state.mapId==='turtleTrial')a.returningTideCleared=true;G.cancelBreakwaterSluices(e);G.saveGame();};
 G.beginBreakwaterRematch=()=>{if(!friendly()||G.state.knockout||G.ui.dialogueOpen||G.ui.menuOpen)return false;
  const e=G.makeEnemy('admiralTortoise',22*16+8,8*16+8);e.def={...e.def,boss:{...e.def.boss,rematchLine:progress().returningTide?'The tide comes back across the first. Both channels stay put. Open a driftwood gate and let the water stop the pair.':'Ready to practice? Open a driftwood gate and let the tide catch my shell. Or keep to the marked channel.'}};
  e.guardPost=true;e.marloLocalRematch=true;e.marloReturningTide=progress().returningTide&&progress().counterLearned;e.guardianPracticeExit={map:'turtleTrial',x:3,y:11};G.state.enemies.push(e);return true;
 };
 G.events.on('mapEnter',()=>{sprays=[];if(G.state.mapId!=='turtleTrial')return;for(const e of G.state.enemies)if(marlo(e)){e.guardPost=true;if(G.state.items.includes('tide-shell'))e.dead=true;}if(!progress().practiceCleared)sluice(practice.x,practice.y);});
 const update=G.updateOpening;G.updateOpening=dt=>{update(dt);sprays=sprays.filter(s=>(s.age+=dt)<.6);for(const e of G.state.enemies||[]){const r=e.breakwaterSluice;if(e.dead||!r?.owner)continue;const h=r.h;if(r.owner.dead||r.map!==G.state.mapId||G.state.knockout||!G.state.bossHazards.includes(h)||h.t-(h.delay||0)>=h.warning+h.active)e.dead=true;}};
 const candidate=G.openingInteractionCandidate,interact=G.tryOpeningInteraction;
 G.openingInteractionCandidate=()=>{const at=candidate();if(at)return at;if(!friendly()||G.ui.dialogueOpen||G.ui.menuOpen||G.state.knockout||G.state.bossCutscene||G.state.zoneTransition)return null;
  const p=G.state.player;if(Math.hypot(p.x-friend.x,p.y-friend.y)>18||G.state.projectiles.some(s=>!s.fromPlayer&&!s.dispelled&&Math.hypot(s.x-p.x,s.y-p.y)<75))return null;
  const a=progress();return{id:'marlo-rematch',kind:'marlo-rematch',...friend,label:a.counterLearned&&!a.invited?'Marlo · Say hello':a.returningTide?'Marlo · Try returning tide':'Marlo · Practice the tide',hint:a.counterLearned&&!a.invited?'Ask Marlo about his returning tide.':a.returningTideCleared?'Returning Tide cleared. Most tide catches: '+a.bestCounters+'.':'Choose practice here, then walk east.'};
 };
 G.tryOpeningInteraction=()=>{const at=G.openingInteractionCandidate();if(at?.id!=='marlo-rematch')return interact();const a=progress();if(a.counterLearned&&!a.invited){a.invited=true;G.saveGame();G.ui.dialogue('MARLO',"You opened the gate! Want to try my returning tide? Its lantern is by the fire. Keep your help lights if you like. I'll put the kettle on.",{accent:'#73eff7'});}else G.beginBreakwaterRematch();G.input.clearTaps();return true;};
 G.drawBreakwaterSluice=(c,x,y,open)=>{c.save();c.fillStyle='#3e4c4c';c.beginPath();c.ellipse(x,y+2,13,5,0,0,Math.PI*2);c.fill();c.fillStyle='#73c9ce';c.fillRect(x-10,y-2,20,4);c.fillStyle='#fff3c2';c.fillRect(x-7,y,open?13:4,1);
  for(const dx of [-11,9]){c.fillStyle='#48382f';c.fillRect(x+dx,y-13,3,16);c.fillStyle='#c6ac79';c.fillRect(x+dx+1,y-12,1,14);}
  for(const dy of [-10,-5]){c.fillStyle='#8a6538';c.fillRect(x-8,y+dy-(open?7:0),17,4);c.fillStyle='#c6ac79';c.fillRect(x-8,y+dy-(open?7:0),17,1);}c.fillStyle='#fff3c2';c.fillRect(x-2,y-(open?17:10),4,2);c.restore();};
 const draw=G.openingDrawables;G.openingDrawables=c=>{const list=draw(c);for(const e of G.state.enemies||[])if(!e.dead&&e.breakwaterSluice)list.push({y:e.y,fn:()=>G.drawBreakwaterSluice(c,e.x,e.y,e.breakwaterSluice.open)});
  for(const f of flows()){list.push({y:-10000,fn:()=>{c.save();c.strokeStyle='#73eff7';c.fillStyle='rgba(115,239,247,.22)';c.lineWidth=2;c.beginPath();c.moveTo(f.x-f.dy*14,f.y+f.dx*14);c.lineTo(f.x+f.dx*f.length-f.dy*14,f.y+f.dy*f.length+f.dx*14);c.lineTo(f.x+f.dx*f.length+f.dy*14,f.y+f.dy*f.length-f.dx*14);c.lineTo(f.x+f.dy*14,f.y-f.dx*14);c.closePath();c.fill();c.stroke();for(let at=12;at<f.length;at+=20){const x=f.x+f.dx*at,y=f.y+f.dy*at;c.beginPath();c.moveTo(x-f.dx*5-f.dy*4,y-f.dy*5+f.dx*4);c.lineTo(x+f.dx*2,y+f.dy*2);c.lineTo(x-f.dx*5+f.dy*4,y-f.dy*5-f.dx*4);c.stroke();}c.restore();}});}
  for(const s of sprays)list.push({y:Math.max(s.y,s.ty),fn:()=>{c.save();for(let i=0;i<8;i++){const f=G.util.clamp(s.age/.45-i*.025,0,1),x=s.x+(s.tx-s.x)*f,y=s.y+(s.ty-s.y)*f-Math.sin(f*Math.PI)*12;c.globalAlpha=(1-s.age/.6)*.85;c.fillStyle=i%2?'#fff3c2':'#73eff7';c.beginPath();c.ellipse(x,y,5,2,0,0,Math.PI*2);c.fill();}c.restore();}});
  if(G.state.mapId!=='turtleTrial')return list;list.push({y:fire.y,fn:()=>G.drawOpeningProp(c,'camp',fire.x,fire.y,G.state.time)});
  if(progress().practiceCleared)list.push({y:practice.y,fn:()=>G.drawBreakwaterSluice(c,practice.x,practice.y,true)});
  if(progress().counterLearned)list.push({y:fire.y,fn:()=>{c.save();c.fillStyle='#3e4c4c';c.fillRect(fire.x-18,fire.y-14,2,16);c.fillStyle='#73eff7';c.beginPath();c.arc(fire.x-17,fire.y-15,4,0,Math.PI*2);c.fill();c.fillStyle='#fff3c2';c.fillRect(fire.x-20,fire.y-16,6,2);c.restore();}});
  if(G.breakwaterCompanionVisible())list.push({y:friend.y,fn:()=>{G.drawShadow(c,friend.x,friend.y,14);G.drawSprite(c,G.enemies.admiralTortoise.sprite,0,friend.x,friend.y,false);}});return list;};
})();
