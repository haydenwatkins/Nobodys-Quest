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
  G.moonCoverAim=e=>!!e.moonCover&&!e.dead&&!e.moonCover.lit;
  G.cancelMoonCovers=owner=>{for(const e of G.state.enemies||[])if(e.moonCover?.owner&&(!owner||e.moonCover.owner===owner))e.dead=true;};
  G.prepareDuskCounter=owner=>{
    if(!vesper(owner))return;
    G.cancelMoonCovers(owner);
    for(const d of [34,26,18]){
      const x=owner.x+owner.bossChargeX*d,y=owner.y+owner.bossChargeY*d;
      if(G.world.isSafeSpawn(x,y)){cover(x,y,owner);break;}
    }
  };
  G.hitMoonCover=(e,opts)=>{
    const r=e.moonCover;
    if(e.dead||!r||r.lit||r.map!==G.state.mapId||!(opts.damage>0)||!G.abilities[opts.ability]||r.owner?.dead)return false;
    r.lit=true;G.sfx.play('wardBreak');G.damageNumber(e.x,e.y-20,'LIGHT!','#fff3c2');
    G.spawnFx({kind:'ring',x:e.x,y:e.y-4,color:'#fff3c2',radius:23,dur:.45});
    if(!r.owner){e.dead=true;progress().practiceCleared=true;G.saveGame();}
    return false; // Preparing light is not a hit, kill, lesson or counter.
  };
  G.catchMoonLight=(owner,x,y)=>{
    if(!vesper(owner)||owner.dead||owner.bossChargeT<=0||owner.bossAfterCharge!=='crimsonWaltz')return false;
    for(const e of G.state.enemies||[]){
      const r=e.moonCover;if(e.dead||r?.owner!==owner||r.linked||!r.lit||r.map!==G.state.mapId)continue;
      const dx=owner.x-x,dy=owner.y-y,sq=dx*dx+dy*dy,t=sq?G.util.clamp(((e.x-x)*dx+(e.y-y)*dy)/sq,0,1):0;
      if(Math.hypot(x+dx*t-e.x,y+dy*t-e.y)>12+owner.def.size/2)continue;
      r.linked=true;r.phase=owner.bossPhase;r.age=0;
      const sx=e.x-owner.bossChargeX*24,sy=e.y-owner.bossChargeY*24;
      r.shadow=G.world.isSafeSpawn(sx,sy)?{x:sx,y:sy}: {x:e.x,y:e.y};owner.duskShadow=e;
      owner.duskCounters=(owner.duskCounters||0)+1;progress().counterLearned=true;
      G.sfx.play('wardBreak');G.damageNumber(e.x,e.y-24,'SHADOW!','#fff3c2');
      G.spawnFx({kind:'ring',x:e.x,y:e.y-4,color:'#fff3c2',radius:28,dur:.5});G.saveGame();
      G.events.emit('guardianCounter',{guardian:'countessCarmine',kind:'moonRefuge'});return false;
    }
    return false;
  };
  G.duskShadowPoint=owner=>{
    const e=owner?.duskShadow,r=e?.moonCover;
    return e&&!e.dead&&r.linked&&!owner.dead&&r.map===G.state.mapId&&r.phase===owner.bossPhase?r.shadow:null;
  };
  G.noteDuskShadowHit=(owner,at)=>{
    if(!at?.duskShadow||!G.duskShadowPoint(owner))return;
    owner.duskShadowHits=(owner.duskShadowHits||0)+1;
    progress().bestShadowHits=Math.max(progress().bestShadowHits||0,owner.duskShadowHits);G.saveGame();
  };
  G.prepareDuskWaltz=(owner,h)=>{
    if(!vesper(owner)||!owner.vesperSecondWaltz)return;
    const scale=G.guidanceProjectileScale?.({owner,fromPlayer:false})??1;
    const arm=G.guardianWarningSeconds?.(G.BOSS_PROJECTILE_ARM_SECONDS)??G.BOSS_PROJECTILE_ARM_SECONDS;
    const warning=G.guardianWarningSeconds?.(h.warning)??h.warning;
    // The second committed wedge waits for the first real shots, including
    // retry help, to finish. Its direction never follows moving feet.
    const follow={...h,shots:[...h.shots],t:0,fired:false,delay:warning+h.active+arm+155/(92*scale)+.45,duskFollower:true};
    G.state.bossHazards.push(follow);
  };
  G.noteDuskDefeat=e=>{
    if(!vesper(e))return;const a=progress(),n=e.duskCounters||0;
    if(n>0){a.counterLearned=true;a.bestCounters=Math.max(a.bestCounters,n);}
    if(e.vesperLocalRematch&&e.vesperSecondWaltz&&G.state.mapId==='vampireTrial')a.secondWaltzCleared=true;
    G.cancelMoonCovers(e);G.saveGame();
  };
  G.beginDuskRematch=()=>{
    if(!friendly()||G.state.knockout||G.ui.dialogueOpen||G.ui.menuOpen)return false;
    const e=G.makeEnemy('countessCarmine',22*16+8,8*16+8);
    e.def={...e.def,boss:{...e.def.boss,rematchLine:progress().secondWaltz?'Two waltzes this time! Their pale openings stay put. Uncover a moon lamp to stop my dash before either begins.':'Welcome back! Uncover a moon lamp and let my dash meet its light. There is tea by the fire.'}};
    e.guardPost=true;e.vesperLocalRematch=true;e.vesperSecondWaltz=progress().secondWaltz&&progress().counterLearned;
    e.guardianPracticeExit={map:'vampireTrial',x:3,y:11};G.state.enemies.push(e);return true;
  };
  G.events.on('mapEnter',()=>{
    if(G.state.mapId!=='vampireTrial')return;
    for(const e of G.state.enemies)if(vesper(e)){e.guardPost=true;if(G.state.items.includes('crimson-seal'))e.dead=true;}
    if(!progress().practiceCleared)cover(practice.x,practice.y);
  });
  const update=G.updateOpening;
  G.updateOpening=dt=>{update(dt);for(const e of G.state.enemies||[]){const r=e.moonCover;if(e.dead||!r?.owner)continue;
    r.age+=dt;if(r.owner.dead||r.map!==G.state.mapId||G.state.knockout||r.age>4)e.dead=true;
  }};
  const candidate=G.openingInteractionCandidate,interact=G.tryOpeningInteraction;
  G.openingInteractionCandidate=()=>{
    const at=candidate();if(at)return at;
    if(!friendly()||G.ui.dialogueOpen||G.ui.menuOpen||G.state.knockout||G.state.bossCutscene||G.state.zoneTransition)return null;
    const p=G.state.player;if(Math.hypot(p.x-friend.x,p.y-friend.y)>18||G.state.projectiles.some(s=>!s.fromPlayer&&!s.dispelled&&Math.hypot(s.x-p.x,s.y-p.y)<75))return null;
    const a=progress();return {id:'vesper-rematch',kind:'vesper-rematch',...friend,label:a.counterLearned&&!a.invited?'Vesper · Say hello':a.secondWaltz?'Vesper · Try second waltz':'Vesper · Practice a dance',hint:a.counterLearned&&!a.invited?'Ask Vesper about her two-waltz practice.':a.secondWaltzCleared?'Second waltz cleared. Most light catches: '+a.bestCounters+'.':'Choose a dance here, then walk east.'};
  };
  G.tryOpeningInteraction=()=>{
    const at=G.openingInteractionCandidate();if(at?.id!=='vesper-rematch')return interact();
    const a=progress();if(a.counterLearned&&!a.invited){a.invited=true;G.saveGame();G.ui.dialogue('VESPER',"You caught my dash in the moonlight! Want to try two waltzes? Light the Second Waltz lantern by the fire. Keep your help lights if you like. I've saved you a cup of tea.",{accent:'#e2c9d6'});}else G.beginDuskRematch();G.input.clearTaps();return true;
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
  const draw=G.openingDrawables;
  G.openingDrawables=c=>{const list=draw(c);
    for(const e of G.state.enemies||[])if(!e.dead&&e.moonCover){
      list.push({y:e.y,fn:()=>drawLamp(c,e.x,e.y,e.moonCover.lit)});
      const owner=e.moonCover.owner,at=G.duskShadowPoint(owner);
      if(at&&owner.duskShadow===e)list.push({y:at.y,fn:()=>{
        c.save();c.globalAlpha=.65;c.strokeStyle='#e2c9d6';c.lineWidth=2;c.setLineDash([3,3]);c.beginPath();c.moveTo(owner.x,owner.y);c.lineTo(at.x,at.y);c.stroke();c.setLineDash([]);
        c.globalAlpha=.9;c.fillStyle='#302638';c.strokeStyle='#fff3c2';c.lineWidth=1.5;
        c.beginPath();c.moveTo(at.x-10,at.y+4);c.lineTo(at.x-14,at.y-9);c.lineTo(at.x-5,at.y-6);c.lineTo(at.x,at.y-15);c.lineTo(at.x+5,at.y-6);c.lineTo(at.x+14,at.y-9);c.lineTo(at.x+10,at.y+4);c.closePath();c.fill();c.stroke();
        c.fillStyle='#fff3c2';c.fillRect(at.x-4,at.y-5,2,2);c.fillRect(at.x+2,at.y-5,2,2);c.restore();
      }});
    }
    if(G.state.mapId!=='vampireTrial')return list;
    list.push({y:fire.y,fn:()=>G.drawOpeningProp(c,'camp',fire.x,fire.y,G.state.time)});
    if(progress().practiceCleared)list.push({y:practice.y,fn:()=>drawLamp(c,practice.x,practice.y,true)});
    if(progress().counterLearned)list.push({y:fire.y,fn:()=>{c.save();c.strokeStyle='#fff3c2';c.lineWidth=2;c.beginPath();c.arc(fire.x-15,fire.y-7,4,Math.PI*.4,Math.PI*1.6);c.stroke();c.restore();}});
    if(friendly())list.push({y:friend.y,fn:()=>{G.drawShadow(c,friend.x,friend.y,14);G.drawSprite(c,G.enemies.countessCarmine.sprite,0,friend.x,friend.y,false);}});return list;
  };
})();
