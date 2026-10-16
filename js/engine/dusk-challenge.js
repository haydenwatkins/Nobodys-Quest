/* A real moonlight catch exposes Vesper’s reachable dancing shadow. */
"use strict";
(() => {
  const point=(x,y)=>({x:x*16+8,y:y*16+8}),fire=point(3,11),lamp=point(4,12),friend=point(5,10),practice=point(6,13);
  const vesper=e=>e?.def?.id==='countessCarmine';
  const progress=()=>{
    const all=G.state.guardianChallenges||(G.state.guardianChallenges=G.makeGuardianChallenges());
    return all.vesper||(all.vesper=G.makeGuardianChallenges().vesper);
  };
  G.duskVisitReady=()=>G.state.items.includes('crimson-seal')&&G.systemIntroduced('sideAdventures')&&
    (!G.state.opening?.started||G.state.opening.version<2||
      (G.state.claimedForms.includes('vampire')&&!G.activeFormOuting()&&!G.formReturnPromise()));
  G.duskRematchActive=()=>G.state.mapId==='vampireTrial'&&G.state.enemies.some(e=>!e.dead&&vesper(e));
  const friendly=()=>G.state.mapId==='vampireTrial'&&G.duskVisitReady()&&!G.duskRematchActive()&&!G.state.gauntletRun&&!G.state.expeditionRun;
  G.duskSecondLit=()=>progress().secondWaltz;
  G.duskChallengeStation=()=>friendly()&&progress().counterLearned?{kind:'duskChallenge',...lamp}:null;
  G.toggleDuskSecond=()=>{if(!G.duskChallengeStation())return false;progress().secondWaltz=!progress().secondWaltz;G.saveGame();return true;};
  function cover(x,y,owner=null){
    const e=G.makeEnemy('slime',x,y);e.id='moonCover';
    e.def={...e.def,id:e.id,name:'Covered moon lamp',practice:true,damage:0,speed:0,size:18};e.hp=1;e.ward=null;
    e.moonCover={owner,map:G.state.mapId,lit:false,age:0};G.state.enemies.push(e);return e;
  }
  G.moonCoverAim=e=>{
    const r=e?.moonCover;if(!r||e.dead)return false;
    if(r.stepChoice){const dance=r.owner?.duskDance;return !!dance&&!dance.locked&&dance.options.includes(e);}
    return !r.lit||!!r.practiceShadow;
  };
  G.cancelMoonCovers=owner=>{
    for(const e of G.state.enemies||[]){
      if(e.moonCover?.owner&&(!owner||e.moonCover.owner===owner))e.dead=true;
      if(vesper(e)&&(!owner||e===owner)){e.duskShadow=null;e.duskDance=null;}
    }
  };
  G.prepareDuskCounter=owner=>{
    if(!vesper(owner))return;
    G.cancelMoonCovers(owner);owner.duskDashFeet={x:owner.x,y:owner.y};
    for(const d of [34,26,18]){
      const x=owner.x+owner.bossChargeX*d,y=owner.y+owner.bossChargeY*d;
      if(G.world.isSafeSpawn(x,y)){cover(x,y,owner);break;}
    }
  };
  G.hitMoonCover=(e,opts)=>{
    const r=e.moonCover;
    if(e.dead||!r||r.map!==G.state.mapId||!(opts.damage>0)||!G.abilities[opts.ability]||r.owner?.dead)return false;
    if(r.stepChoice){
      const dance=r.owner.duskDance;
      if(!dance||dance.locked||!dance.options.includes(e))return false;
      r.lit=true;dance.choice=e;G.sfx.play('wardBreak');G.spawnFx({kind:'ring',x:e.x,y:e.y,color:'#fff3c2',radius:22,dur:.35});return false;
    }
    if(r.practiceShadow){
      e.dead=true;progress().practiceCleared=true;G.sfx.play('wardBreak');
      G.spawnFx({kind:'ring',x:r.source.x,y:r.source.y,color:'#fff3c2',radius:24,dur:.5});G.saveGame();return false;
    }
    if(r.lit)return false;
    r.lit=true;G.sfx.play('wardBreak');G.damageNumber(e.x,e.y-20,'LIGHT!','#fff3c2');
    G.spawnFx({kind:'ring',x:e.x,y:e.y-4,color:'#fff3c2',radius:23,dur:.45});
    if(!r.owner){
      r.source={x:e.x,y:e.y};r.practiceShadow=true;e.def.name='Practice shadow';
      for(const [dx,dy] of [[32,0],[-32,0],[0,32],[0,-32]])if(G.world.isSafeSpawn(e.x+dx,e.y+dy)&&G.combat.clearArc(e.x,e.y,e.x+dx,e.y+dy)){e.x+=dx;e.y+=dy;break;}
    }
    return false; // Preparing light is not a hit, kill, lesson or counter.
  };
  // Account for actual engine knockback before tracing the committed body step.
  G.trackDuskSlide=(owner,x,y)=>{
    if(!vesper(owner)||!owner.duskDashFeet||!(owner.bossChargeT>0||owner.bossPendingAction==='vampireDash'))return;
    if(Math.hypot(x-owner.duskDashFeet.x,y-owner.duskDashFeet.y)>.1){G.cancelMoonCovers(owner);owner.duskDashFeet=null;return;}
    owner.duskDashFeet={x:owner.x,y:owner.y};
  };
  G.catchMoonLight=(owner,x,y)=>{
    if(!vesper(owner)||owner.dead||owner.bossChargeT<=0||owner.bossAfterCharge!=='crimsonWaltz')return false;
    const feet=owner.duskDashFeet;owner.duskDashFeet={x:owner.x,y:owner.y};
    if(!feet||Math.hypot(feet.x-x,feet.y-y)>.1||Math.hypot(owner.x-x,owner.y-y)<.1)return false;
    if(G.duskShadowPoint(owner))return false;
    for(const e of G.state.enemies||[]){
      const r=e.moonCover;if(e.dead||r?.owner!==owner||r.linked||!r.lit||r.map!==G.state.mapId)continue;
      const dx=owner.x-x,dy=owner.y-y,sq=dx*dx+dy*dy,t=sq?G.util.clamp(((e.x-x)*dx+(e.y-y)*dy)/sq,0,1):0;
      const cx=x+dx*t,cy=y+dy*t;
      if(Math.hypot(cx-e.x,cy-e.y)>12+owner.def.size/2||!G.combat.clearArc(cx,cy,e.x,e.y))continue;
      r.linked=true;r.phase=owner.bossPhase;r.age=0;
      const sx=e.x-owner.bossChargeX*24,sy=e.y-owner.bossChargeY*24;
      r.shadow=G.world.isSafeSpawn(sx,sy)&&G.combat.clearArc(e.x,e.y,sx,sy)?{x:sx,y:sy}: {x:e.x,y:e.y};owner.duskShadow=e;
      owner.duskCounters=(owner.duskCounters||0)+1;progress().counterLearned=true;
      G.sfx.play('wardBreak');G.damageNumber(e.x,e.y-24,'SHADOW!','#fff3c2');
      G.spawnFx({kind:'ring',x:e.x,y:e.y-4,color:'#fff3c2',radius:28,dur:.5});G.saveGame();
      G.events.emit('guardianCounter',{guardian:'countessCarmine',kind:'moonRefuge'});return false;
    }
    return false;
  };
  G.duskShadowPoint=owner=>{
    const e=owner?.duskShadow,r=e?.moonCover;
    return e&&!e.dead&&r.linked&&!owner.dead&&G.state.enemies.includes(owner)&&!(owner.status?.stun?.dur>0)&&!(owner.bossStaggerT>0)&&!G.state.knockout&&r.map===G.state.mapId&&r.phase===owner.bossPhase?r.shadow:null;
  };
  G.noteDuskShadowHit=(owner,at)=>{
    if(!at?.duskShadow||!G.duskShadowPoint(owner))return;
    owner.duskShadow.flash=.12;owner.duskShadowHits=(owner.duskShadowHits||0)+1;
    progress().bestShadowHits=Math.max(progress().bestShadowHits||0,owner.duskShadowHits);G.saveGame();
  };
  G.duskShelters=(p,shot)=>{
    const e=shot?.owner?.duskShadow,r=e?.moonCover;
    return !!e&&!!G.duskShadowPoint(shot.owner)&&!shot.fromPlayer&&!shot.dispelled&&r.phrases?.includes(shot.duskWaltz)&&Math.hypot(p.x-(r.pool||e).x,p.y-(r.pool||e).y)<=32;
  };
  function clearStepShadow(source,shadow,destination,preferred){
    if(!G.world.isSafeSpawn(destination.x,destination.y)||!G.combat.clearArc(source.x,source.y,destination.x,destination.y))return null;
    if(G.world.isSafeSpawn(preferred.x,preferred.y)&&G.combat.clearArc(destination.x,destination.y,preferred.x,preferred.y)&&G.combat.clearArc(shadow.x,shadow.y,preferred.x,preferred.y))return {...preferred};
    return G.combat.clearArc(shadow.x,shadow.y,destination.x,destination.y)?{x:destination.x,y:destination.y}:null;
  }
  G.prepareDuskWaltz=(owner,h)=>{
    if(!vesper(owner))return;
    const scale=G.guidanceProjectileScale?.({owner,fromPlayer:false})??1;
    const arm=G.guardianWarningSeconds?.(G.BOSS_PROJECTILE_ARM_SECONDS)??G.BOSS_PROJECTILE_ARM_SECONDS;
    const warning=G.guardianWarningSeconds?.(h.warning)??h.warning,flight=155/(92*scale);
    const source=owner.duskShadow,root=source?.moonCover;
    const firstEnd=warning+h.active+arm+flight;
    if(root){root.phrases=[h];root.age=0;root.maxAge=firstEnd+.65;}
    if(!(owner.vesperSecondWaltz||root&&owner.bossPhase>=2))return;
    const follow={...h,shots:[...h.shots],t:0,fired:false,delay:firstEnd+.65,duskFollower:true};
    if(root){
      const dance={owner,source,options:[],choice:null,locked:false,age:0,at:firstEnd+.65,travel:1.2,follow,phase:owner.bossPhase,map:G.state.mapId};
      const nx=-owner.bossChargeY,ny=owner.bossChargeX;
      for(const [dx,dy] of [[nx*64-owner.bossChargeX*32,ny*64-owner.bossChargeY*32],[-nx*64,-ny*64],[owner.bossChargeX*64,owner.bossChargeY*64],[-owner.bossChargeX*64,-owner.bossChargeY*64]]){
        const x=source.x+dx,y=source.y+dy;
        const shadow=clearStepShadow(source,root.shadow,{x,y},{x:x+root.shadow.x-source.x,y:y+root.shadow.y-source.y});
        if(!shadow)continue;
        const next=cover(x,y,owner);Object.assign(next.moonCover,{stepChoice:true,stepShadow:shadow});dance.options.push(next);
        if(dance.options.length===2)break;
      }
      if(dance.options.length){
        owner.duskDance=dance;follow.delay=dance.at+dance.travel+.1;
        root.maxAge=follow.delay+warning+h.active+arm+flight+.65;
        for(const option of dance.options)option.moonCover.maxAge=root.maxAge;
      }
      root.phrases.push(follow);
      root.maxAge=follow.delay+warning+h.active+arm+flight+.65;
    }
    owner.bossRecoverT=Math.max(owner.bossRecoverT,follow.delay+warning+h.active+arm+flight+.65);
    G.state.bossHazards.push(follow);
  };
  function prepareDuskFork(owner,previous){
    if(!owner.vesperSecondWaltz||owner.bossPhase<2||previous.last)return;
    const source=owner.duskShadow,root=source.moonCover,options=[];
    for(const option of [previous.source,...previous.options.filter(e=>e!==source)]){
      if(option.dead)continue;
      const preferred=option===previous.source?previous.shadowFrom:option.moonCover.stepShadow;
      const shadow=clearStepShadow(source,root.shadow,option,preferred);
      if(!shadow)continue;
      Object.assign(option.moonCover,{stepChoice:true,stepShadow:shadow});options.push(option);
    }
    if(!options.length)return;
    const h=previous.follow,scale=G.guidanceProjectileScale?.({owner,fromPlayer:false})??1;
    const arm=G.guardianWarningSeconds?.(G.BOSS_PROJECTILE_ARM_SECONDS)??G.BOSS_PROJECTILE_ARM_SECONDS,flight=155/(92*scale);
    const at=Math.max(0,h.delay-h.t)+h.warning+h.active+arm+flight+.65;
    const travel=Math.max(...options.map(e=>Math.hypot(e.x-source.x,e.y-source.y)))/80+.4;
    // h.warning was already helped by the actual first resolution; do not help twice.
    const last={...h,shots:[...h.shots],t:0,fired:false,delay:at+travel+.1,duskLast:true};
    owner.duskDance={owner,source,options,choice:null,locked:false,age:0,at,travel,follow:last,phase:owner.bossPhase,map:G.state.mapId,last:true,turnOpening:true};
    root.phrases.push(last);const life=last.delay+last.warning+last.active+arm+flight+.65;
    for(const e of G.state.enemies)if(e.moonCover?.owner===owner)e.moonCover.maxAge=e.moonCover.age+life;
    owner.bossRecoverT=Math.max(owner.bossRecoverT,life);G.state.bossHazards.push(last);
  }
  function advanceDance(owner,dt){
    const dance=owner.duskDance;if(!dance)return;
    const root=dance.source.moonCover;
    if(owner.dead||dance.source.dead||dance.map!==G.state.mapId||dance.phase!==owner.bossPhase||owner.status?.stun?.dur>0||owner.bossStaggerT>0||G.state.knockout){G.cancelMoonCovers(owner);return;}
    dance.age+=dt;
    if(dance.age<dance.at||dance.complete)return;
    if(!dance.locked){
      dance.locked=true;dance.target=dance.choice||dance.options[0];
      if(dance.target.dead){owner.duskDance=null;return;}
      dance.from={x:dance.source.x,y:dance.source.y};dance.shadowFrom={...root.shadow};
      dance.shadowTo={...dance.target.moonCover.stepShadow};
      if(owner.bossPhase>=3||dance.turnOpening){
        const angle=Math.atan2(dance.target.y-(owner.y-6),dance.target.x-owner.x),count=8+(owner.bossPhase-1)*4;
        dance.follow.angle=angle;dance.follow.shots=[];
        for(let i=0;i<count;i++){const a=angle+i*Math.PI*2/count,delta=Math.atan2(Math.sin(a-angle),Math.cos(a-angle));if(Math.abs(delta)>.55)dance.follow.shots.push(a);}
      }

    }
    const t=Math.min(1,(dance.age-dance.at)/dance.travel),to=dance.target;
    root.pool={x:dance.from.x+(to.x-dance.from.x)*t,y:dance.from.y+(to.y-dance.from.y)*t};
    root.shadow={x:dance.shadowFrom.x+(dance.shadowTo.x-dance.shadowFrom.x)*t,y:dance.shadowFrom.y+(dance.shadowTo.y-dance.shadowFrom.y)*t};
    if(t>=1){
      dance.complete=true;root.linked=false;const next=to.moonCover;
      Object.assign(next,{lit:true,linked:true,stepChoice:false,phase:owner.bossPhase,shadow:{...dance.shadowTo},pool:{x:to.x,y:to.y},phrases:root.phrases,age:root.age,maxAge:root.maxAge});owner.duskShadow=to;prepareDuskFork(owner,dance);
    }
  }
  G.noteDuskDefeat=e=>{
    if(!vesper(e))return;const a=progress(),n=e.duskCounters||0;
    if(n>0){a.counterLearned=true;a.bestCounters=Math.max(a.bestCounters,n);}
    if(e.vesperLocalRematch&&e.vesperSecondWaltz&&G.state.mapId==='vampireTrial')a.secondWaltzCleared=true;
    G.cancelMoonCovers(e);G.saveGame();
  };
  G.beginDuskRematch=()=>{
    if(!friendly()||G.state.knockout||G.ui.dialogueOpen||G.ui.menuOpen)return false;
    const e=G.makeEnemy('countessCarmine',22*16+8,8*16+8);
    e.def={...e.def,boss:{...e.def.boss,rematchLine:progress().secondWaltz?'Let’s try a longer dance! In the later steps, pick the lamp behind you or the one ahead. I’ll keep the waltz going.':'Back for another dance? Uncover a lamp, step aside, then follow my shadow. There’s tea by the fire.'}};
    e.guardPost=true;e.vesperLocalRematch=true;e.vesperSecondWaltz=progress().secondWaltz&&progress().counterLearned;
    e.guardianPracticeExit={map:'vampireTrial',x:3,y:11};G.state.enemies.push(e);return true;
  };
  G.events.on('mapEnter',()=>{
    if(G.state.mapId!=='vampireTrial')return;
    for(const e of G.state.enemies)if(vesper(e)){e.guardPost=true;if(G.state.items.includes('crimson-seal'))e.dead=true;}
    if(!progress().practiceCleared)cover(practice.x,practice.y);
  });
  const update=G.updateOpening;
  G.updateOpening=dt=>{update(dt);for(const owner of G.state.enemies||[])if(vesper(owner))advanceDance(owner,dt);for(const e of G.state.enemies||[]){const r=e.moonCover;if(e.dead||!r?.owner)continue;
    r.age+=dt;if(r.owner.dead||!G.state.enemies.includes(r.owner)||r.owner.status?.stun?.dur>0||r.owner.bossStaggerT>0||r.map!==G.state.mapId||G.state.knockout||r.age>(r.maxAge||4))e.dead=true;
  }};
  const candidate=G.openingInteractionCandidate,interact=G.tryOpeningInteraction;
  G.openingInteractionCandidate=()=>{
    const at=candidate();if(at)return at;
    if(!friendly()||G.ui.dialogueOpen||G.ui.menuOpen||G.state.knockout||G.state.bossCutscene||G.state.zoneTransition)return null;
    const p=G.state.player;if(Math.hypot(p.x-friend.x,p.y-friend.y)>18||G.state.projectiles.some(s=>!s.fromPlayer&&!s.dispelled&&Math.hypot(s.x-p.x,s.y-p.y)<75))return null;
    const a=progress();return {id:'vesper-rematch',kind:'vesper-rematch',...friend,label:a.counterLearned&&!a.invited?'Vesper · Say hello':a.secondWaltz?'Vesper · Try second waltz':'Vesper · Practice a dance',hint:a.counterLearned&&!a.invited?'Ask Vesper about her two-waltz practice.':a.secondWaltzCleared?(a.bestShadowHits>0?'Second Waltz cleared. Most shadow strikes: '+a.bestShadowHits+'.':'Second Waltz cleared. There’s tea by the fire.'):'Choose a dance here, then walk east.'};
  };
  G.tryOpeningInteraction=()=>{
    const at=G.openingInteractionCandidate();if(at?.id!=='vesper-rematch')return interact();
    const a=progress();if(a.counterLearned&&!a.invited){a.invited=true;G.saveGame();G.ui.dialogue('VESPER',"You woke my moon lamps! Want to choose where the dance goes next? Light the Second Waltz lantern by the fire. Keep your help lights if you like. I've saved you a cup of tea.",{accent:'#e2c9d6'});}else G.beginDuskRematch();G.input.clearTaps();return true;
  };
  function drawLamp(c,x,y,lit){
    c.save();c.fillStyle=lit?'rgba(255,243,194,.22)':'rgba(38,40,57,.3)';c.beginPath();c.ellipse(x,y+2,lit?24:12,lit?12:5,0,0,Math.PI*2);c.fill();
    if(lit){c.strokeStyle='#fff3c2';c.lineWidth=1.5;c.beginPath();c.ellipse(x,y+2,24,12,0,0,Math.PI*2);c.stroke();}
    c.fillStyle='#42394d';c.fillRect(x-7,y-16,14,17);c.fillStyle='#c2b5b9';c.fillRect(x-8,y,16,3);c.fillRect(x-6,y-17,12,3);
    c.fillStyle=lit?'#fff3c2':'#626278';c.fillRect(x-5,y-12,10,10);
    c.strokeStyle=lit?'#e2c9d6':'#fff3c2';c.lineWidth=2;c.beginPath();c.arc(x+1,y-8,3,Math.PI*.4,Math.PI*1.6);c.stroke();
    if(!lit){c.strokeStyle='#e2c9d6';c.lineWidth=1;c.beginPath();c.moveTo(x-4,y-13);c.lineTo(x,y-9);c.lineTo(x-3,y-6);c.lineTo(x+3,y-2);c.stroke();}
    c.restore();
  }
  function drawDancingShadow(c,at,source,flash){
        c.save();c.globalAlpha=.65;c.strokeStyle='#e2c9d6';c.lineWidth=2;c.setLineDash([3,3]);c.beginPath();c.moveTo(source.x,source.y);c.lineTo(at.x,at.y);c.stroke();c.setLineDash([]);
        c.globalAlpha=.9;c.fillStyle=flash>0?'#e2c9d6':'#302638';c.strokeStyle='#fff3c2';c.lineWidth=1.2;
        c.beginPath();c.moveTo(at.x-3,at.y-12);c.lineTo(at.x-12,at.y-8);c.lineTo(at.x-13,at.y-2);c.lineTo(at.x-6,at.y-6);c.lineTo(at.x-9,at.y+4);c.quadraticCurveTo(at.x,at.y+1,at.x+9,at.y+4);c.lineTo(at.x+6,at.y-6);c.lineTo(at.x+13,at.y-2);c.lineTo(at.x+12,at.y-8);c.lineTo(at.x+3,at.y-12);c.closePath();c.fill();c.stroke();
        c.beginPath();c.moveTo(at.x-5,at.y-15);c.lineTo(at.x-5,at.y-22);c.lineTo(at.x-1,at.y-19);c.lineTo(at.x+1,at.y-19);c.lineTo(at.x+5,at.y-22);c.lineTo(at.x+5,at.y-15);c.quadraticCurveTo(at.x,at.y-9,at.x-5,at.y-15);c.fill();c.stroke();
        c.fillStyle='#fff3c2';c.fillRect(at.x-3,at.y-16,2,2);c.fillRect(at.x+1,at.y-16,2,2);c.restore();
  }
  const draw=G.openingDrawables;
  G.openingDrawables=c=>{const list=draw(c);
    for(const e of G.state.enemies||[])if(!e.dead&&e.moonCover){
      const source=e.moonCover.source||e;
      list.push({y:source.y,fn:()=>drawLamp(c,source.x,source.y,e.moonCover.lit)});
      if(e.moonCover.stepChoice&&G.moonCoverAim(e))list.push({y:e.y,fn:()=>{
        const dance=e.moonCover.owner.duskDance,selected=(dance.choice||dance.options[0])===e;
        c.save();c.strokeStyle='#fff3c2';c.fillStyle=selected?'#fff3c2':'#51415e';c.lineWidth=1.5;c.beginPath();c.moveTo(e.x,e.y-29);c.lineTo(e.x+4,e.y-25);c.lineTo(e.x,e.y-21);c.lineTo(e.x-4,e.y-25);c.closePath();c.fill();c.stroke();c.restore();
      }});
      const owner=e.moonCover.owner,at=e.moonCover.practiceShadow?{x:e.x,y:e.y}:G.duskShadowPoint(owner);
      if(at&&owner?.duskShadow===e){const pool=e.moonCover.pool||e;list.push({y:-100000,fn:()=>{c.save();c.fillStyle='rgba(255,243,194,.13)';c.strokeStyle='#fff3c2';c.lineWidth=1.5;c.beginPath();c.arc(pool.x,pool.y,32,0,Math.PI*2);c.fill();c.stroke();c.restore();}});}
      if(at&&(!owner||owner.duskShadow===e))list.push({y:at.y,fn:()=>{
        drawDancingShadow(c,at,owner||e.moonCover.source,e.flash);
      }});
    }
    if(G.state.mapId!=='vampireTrial')return list;
    list.push({y:fire.y,fn:()=>G.drawOpeningProp(c,'camp',fire.x,fire.y,G.state.time)});
    if(progress().practiceCleared)list.push({y:practice.y,fn:()=>drawLamp(c,practice.x,practice.y,true)});
    if(progress().counterLearned)list.push({y:fire.y,fn:()=>{c.save();c.strokeStyle='#fff3c2';c.lineWidth=2;c.beginPath();c.arc(fire.x-15,fire.y-7,4,Math.PI*.4,Math.PI*1.6);c.stroke();c.restore();}});
    if(friendly())list.push({y:friend.y,fn:()=>{G.drawShadow(c,friend.x,friend.y,14);G.drawSprite(c,G.enemies.countessCarmine.sprite,0,friend.x,friend.y,false);}});return list;
  };
})();
