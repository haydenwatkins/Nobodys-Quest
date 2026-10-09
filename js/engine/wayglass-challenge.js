/* Raise a reflector with a normal art; an actual returning blade rings it. */
"use strict";
(() => {
  const trophy='riftblade-sigil',point=(x,y)=>({x:x*16+8,y:y*16+8});
  const fire=point(3,11),lamp=point(4,12),friend=point(5,10),post=point(6,13);
  const mira=e=>e?.def?.id==='riftbladeAdept';
  const progress=()=>{
    const all=G.state.guardianChallenges||(G.state.guardianChallenges=G.makeGuardianChallenges());
    return all.mira||(all.mira=G.makeGuardianChallenges().mira);
  };
  G.wayglassVisitReady=()=>G.state.items.includes(trophy)&&G.systemIntroduced('sideAdventures')&&
    (!G.state.opening?.started||G.state.opening.version<2||
      (G.state.claimedForms.includes('riftblade')&&!G.activeFormOuting()&&!G.formReturnPromise()));
  G.wayglassRematchActive=()=>G.state.mapId==='riftbladeTrial'&&G.state.enemies.some(e=>!e.dead&&mira(e));
  const friendly=()=>G.state.mapId==='riftbladeTrial'&&G.wayglassVisitReady()&&!G.wayglassRematchActive()&&!G.state.gauntletRun&&!G.state.expeditionRun;
  G.wayglassDoubleLit=()=>progress().doubleReturn;
  G.wayglassChallengeStation=()=>friendly()&&progress().counterLearned?{kind:'wayglassChallenge',...lamp}:null;
  G.toggleWayglassDouble=()=>{if(!G.wayglassChallengeStation())return false;progress().doubleReturn=!progress().doubleReturn;G.saveGame();return true;};
  function reflector(x,y,owner=null){
    const e=G.makeEnemy('slime',x,y);e.id='wayglassReflector';
    e.def={...e.def,id:e.id,name:'Wayglass reflector',practice:true,damage:0,speed:0,size:18};e.hp=1;e.ward=null;
    e.wayglassReflector={owner,map:G.state.mapId,armed:false};G.state.enemies.push(e);return e;
  }
  G.wayglassReflectorAim=e=>!!e.wayglassReflector&&!e.dead&&!e.wayglassReflector.armed;
  G.cancelWayglassReflectors=owner=>{
    for(const e of G.state.enemies||[])if(e.wayglassReflector?.owner&&(!owner||e.wayglassReflector.owner===owner))e.dead=true;
  };
  G.prepareWayglassCounter=(owner,h)=>{
    if(!mira(owner))return;
    G.cancelWayglassReflectors(owner);
    const a=Math.atan2(h.y-owner.y,h.x-owner.x),x=owner.x+Math.cos(a)*48,y=owner.y-2+Math.sin(a)*48;
    if(G.world.isSafeSpawn(x,y))reflector(x,y,owner);
    if(!owner.miraDoubleReturn)return;
    // Wait for the helped warning and actual slowed flight, then a breather.
    const scale=G.guidanceProjectileScale?.({owner,fromPlayer:false})??1;
    const delay=h.warning+(G.guardianWarningSeconds?.(0)??0)+164/(120*scale)+.4;
    G.state.bossHazards.push({...h,t:0,delay,warning:.9,active:.15,fired:false,wayglassFollower:true});
  };
  G.hitWayglassReflector=(e,opts)=>{
    const r=e.wayglassReflector;
    if(e.dead||!r||r.map!==G.state.mapId||r.armed||!(opts.damage>0)||!G.abilities[opts.ability]||r.owner?.dead)return false;
    r.armed=true;G.sfx.play('pickup');G.spawnFx({kind:'ring',x:e.x,y:e.y-4,color:'#73eff7',radius:16,dur:.3});
    if(!r.owner){
      const source={x:e.x-52,y:e.y+2,def:{shotColor:'#73eff7'},dead:false};r.practiceSource=source;
      enemyShot(G.state,source,0,{damage:0,speed:90,range:205,size:5,boomerang:true,outboundRange:82,shape:'riftBlade'});
      G.state.projectiles.at(-1).wayglassPractice=true;
    }
    return false;
  };
  const segmentDistance=(x,y,x2,y2,cx,cy)=>{
    const dx=x2-x,dy=y2-y,sq=dx*dx+dy*dy,t=sq?G.util.clamp(((cx-x)*dx+(cy-y)*dy)/sq,0,1):0;
    return Math.hypot(x+dx*t-cx,y+dy*t-cy);
  };
  G.catchWayglassReturn=(shot,x,y,wasReturning)=>{
    if(!wasReturning||shot.fromPlayer||shot.dispelled||!shot.boomerang||shot.shape!=='riftBlade'||shot.owner?.dead)return false;
    for(const e of G.state.enemies||[]){
      const r=e.wayglassReflector;
      if(e.dead||!r?.armed||r.map!==G.state.mapId||shot.owner!==(r.owner||r.practiceSource)||
        segmentDistance(x,y,shot.x,shot.y,e.x,e.y-4)>26+shot.size)continue;
      e.dead=true;shot.dispelled=true;G.sfx.play('wardBreak');
      G.spawnFx({kind:'ring',x:e.x,y:e.y-4,color:'#fff3c2',radius:26,dur:.45});G.damageNumber(e.x,e.y-22,'DING!','#fff3c2');
      if(!r.owner){progress().practiceCleared=true;G.saveGame();return true;}
      const owner=r.owner;owner.wayglassCounters=(owner.wayglassCounters||0)+1;G.guardianCounterOpening(owner);
      G.spawnFx({kind:'bolt',x:e.x,y:e.y-4,x2:owner.x,y2:owner.y-8,color:'#73eff7',dur:.3});
      // Reflection buys time; Sharp retains its distinct ward purpose.
      progress().counterLearned=true;G.saveGame();G.events.emit('guardianCounter',{guardian:'riftbladeAdept',kind:'reflector'});return true;
    }
    return false;
  };
  G.noteWayglassDefeat=e=>{
    if(!mira(e))return;const a=progress(),n=e.wayglassCounters||0;
    if(n>0){a.counterLearned=true;a.bestCounters=Math.max(a.bestCounters,n);}
    if(e.miraLocalRematch&&e.miraDoubleReturn&&G.state.mapId==='riftbladeTrial')a.doubleReturnCleared=true;G.saveGame();
  };
  G.beginWayglassRematch=()=>{
    if(!friendly()||G.state.knockout||G.ui.dialogueOpen||G.ui.menuOpen)return false;
    const e=G.makeEnemy('riftbladeAdept',21*16+8,8*16+8);
    e.def={...e.def,boss:{...e.def.boss,rematchLine:progress().doubleReturn?'Two throws this time! Raise a reflector to stop the pair when a blade comes back.':'Glad you came back! Raise the reflector, then step away from the blades.'}};
    e.guardianPracticeExit={map:'riftbladeTrial',x:3,y:11};e.guardPost=true;e.miraLocalRematch=true;e.miraDoubleReturn=progress().doubleReturn&&progress().counterLearned;G.state.enemies.push(e);return true;
  };
  G.events.on('mapEnter',()=>{
    if(G.state.mapId!=='riftbladeTrial')return;
    for(const e of G.state.enemies)if(mira(e))e.guardPost=true;
    if(G.state.items.includes(trophy))for(const e of G.state.enemies)if(mira(e))e.dead=true;
    if(!progress().practiceCleared)reflector(post.x,post.y);
  });
  const update=G.updateOpening;
  G.updateOpening=dt=>{update(dt);for(const e of G.state.enemies||[]){const r=e.wayglassReflector;if(e.dead||!r?.owner)continue;
    if(r.owner.dead||r.map!==G.state.mapId||G.state.knockout||(!G.state.bossHazards.some(h=>h.owner===r.owner)&&!G.state.projectiles.some(s=>!s.fromPlayer&&!s.dispelled&&s.owner===r.owner)))e.dead=true;
  }};
  const candidate=G.openingInteractionCandidate,interact=G.tryOpeningInteraction;
  G.openingInteractionCandidate=()=>{
    const at=candidate();if(at)return at;
    if(!friendly()||G.ui.dialogueOpen||G.ui.menuOpen||G.state.knockout||G.state.bossCutscene||G.state.zoneTransition)return null;
    const p=G.state.player;if(Math.hypot(p.x-friend.x,p.y-friend.y)>18||G.state.projectiles.some(s=>!s.fromPlayer&&!s.dispelled&&!s.wayglassPractice&&Math.hypot(s.x-p.x,s.y-p.y)<75))return null;
    const a=progress();return {id:'mira-rematch',kind:'mira-rematch',...friend,label:a.counterLearned&&!a.invited?'Mira · Say hello':a.doubleReturn?'Mira · Try double return':'Mira · Practice a duel',hint:a.counterLearned&&!a.invited?'Ask Mira about her two-throw practice.':a.doubleReturnCleared?`Double return cleared. Most reflector rings: ${a.bestCounters}.`:'Choose a duel here, then walk east.'};
  };
  G.tryOpeningInteraction=()=>{
    const at=G.openingInteractionCandidate();if(at?.id!=='mira-rematch')return interact();
    const a=progress();if(a.counterLearned&&!a.invited){a.invited=true;G.saveGame();G.ui.dialogue('MIRA',"That reflector rang beautifully! Want to try two throws? Light the twin-blade lantern by the fire. Your help lights can stay on. I'll set out more star-cookies.",{accent:'#73eff7'});}else G.beginWayglassRematch();G.input.clearTaps();return true;
  };
  function drawReflector(c,x,y,armed){
    c.save();if(armed){c.strokeStyle='#73eff7';c.globalAlpha=.6;c.lineWidth=1;c.beginPath();c.ellipse(x,y-4,26,26,0,0,Math.PI*2);c.stroke();c.globalAlpha=1;}c.fillStyle='#706253';c.fillRect(x-2,y-13,4,16);c.fillRect(x-9,y+1,18,3);
    c.fillStyle=armed?'#b7eff4':'#526572';c.strokeStyle=armed?'#fff3c2':'#73eff7';c.lineWidth=2;
    c.beginPath();c.moveTo(x,y-23);c.lineTo(x+10,y-12);c.lineTo(x,y-1);c.lineTo(x-10,y-12);c.closePath();c.fill();c.stroke();
    c.fillStyle=armed?'#fff3c2':'#73eff7';c.beginPath();c.arc(x,y-12,3,0,Math.PI*2);c.fill();
    if(armed){c.strokeStyle='#fff3c2';c.lineWidth=1.5;c.beginPath();c.moveTo(x-5,y-15);c.lineTo(x+4,y-15);c.lineTo(x+4,y-10);c.stroke();}c.restore();
  }
  const draw=G.openingDrawables;
  G.openingDrawables=c=>{const list=draw(c);
    for(const e of G.state.enemies||[])if(!e.dead&&e.wayglassReflector)list.push({y:e.y,fn:()=>drawReflector(c,e.x,e.y,e.wayglassReflector.armed)});
    if(G.state.mapId!=='riftbladeTrial')return list;
    list.push({y:fire.y,fn:()=>G.drawOpeningProp(c,'camp',fire.x,fire.y,G.state.time)});
    if(progress().practiceCleared)list.push({y:post.y,fn:()=>{drawReflector(c,post.x,post.y,true);c.fillStyle='#73eff7';c.beginPath();c.arc(post.x-14,post.y-12,3,0,Math.PI*2);c.fill();}});
    if(progress().counterLearned)list.push({y:fire.y,fn:()=>drawReflector(c,fire.x-14,fire.y,true)});
    if(friendly())list.push({y:friend.y,fn:()=>{G.drawShadow(c,friend.x,friend.y,14);G.drawSprite(c,G.enemies.riftbladeAdept.sprite,0,friend.x,friend.y,false);}});return list;
  };
})();
