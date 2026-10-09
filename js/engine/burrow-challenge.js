/* A stomp raises a root plug. Break it, or lead a later burrow through it. */
"use strict";
(() => {
  const point=(x,y)=>({x:x*16+8,y:y*16+8}),fire=point(3,11),lamp=point(4,12),friend=point(5,10),practice=point(6,13);
  const bram=e=>e?.def?.id==='moleMonarch';
  const progress=()=>{
    const all=G.state.guardianChallenges||(G.state.guardianChallenges=G.makeGuardianChallenges());
    return all.bram||(all.bram=G.makeGuardianChallenges().bram);
  };
  G.burrowVisitReady=()=>G.state.items.includes('mole-crown')&&G.systemIntroduced('sideAdventures')&&
    (!G.state.opening?.started||G.state.opening.version<2||
      (G.state.claimedForms.includes('mole')&&!G.activeFormOuting()&&!G.formReturnPromise()));
  G.burrowRematchActive=()=>G.state.mapId==='moleTrial'&&G.state.enemies.some(e=>!e.dead&&bram(e));
  const friendly=()=>G.state.mapId==='moleTrial'&&G.burrowVisitReady()&&!G.burrowRematchActive()&&!G.state.gauntletRun&&!G.state.expeditionRun;
  G.burrowRumbleLit=()=>progress().rootRumble;
  G.burrowChallengeStation=()=>friendly()&&progress().counterLearned?{kind:'burrowChallenge',...lamp}:null;
  G.toggleBurrowRumble=()=>{if(!G.burrowChallengeStation())return false;progress().rootRumble=!progress().rootRumble;G.saveGame();return true;};
  function plug(x,y,owner=null,threats=[]){
    const e=G.makeEnemy('slime',x,y);e.id='burrowPlug';
    e.def={...e.def,id:e.id,name:'Cracked root plug',practice:true,damage:0,speed:0,size:20};e.hp=1;e.ward=null;
    e.burrowPlug={owner,threats,map:G.state.mapId,broken:false};G.state.enemies.push(e);return e;
  }
  G.burrowPlugAim=e=>!!e.burrowPlug&&!e.dead&&!e.burrowPlug.broken;
  G.cancelBurrowPlugs=owner=>{for(const e of G.state.enemies||[])if(e.burrowPlug?.owner&&(!owner||e.burrowPlug.owner===owner))e.dead=true;};
  G.prepareBurrowCounter=(owner,h,p)=>{
    if(!bram(owner))return;
    G.cancelBurrowPlugs(owner);
    const threats=[h];
    if(owner.bramRootRumble){
      const delay=h.warning+(G.guardianWarningSeconds?.(0)??0)+h.active+.45;
      const follow={...h,x:p.x,y:p.y,radius:34,t:0,delay,warning:.9,hit:false,burrowFollower:true};
      G.state.bossHazards.push(follow);threats.push(follow);
    }
    const a=Math.atan2(p.y-h.y,p.x-h.x);
    for(const turn of [0,Math.PI/2,-Math.PI/2,Math.PI]){
      const x=h.x+Math.cos(a+turn)*30,y=h.y+Math.sin(a+turn)*30;
      if(G.world.isSafeSpawn(x,y)){plug(x,y,owner,threats);break;}
    }
  };
  function counter(e,kind){
    const owner=e.burrowPlug.owner;e.dead=true;
    owner.burrowCounters=(owner.burrowCounters||0)+1;
    const record=kind==='burrowTrip'?'burrowTripCounters':'burrowStompCounters';owner[record]=(owner[record]||0)+1;
    G.guardianCounterOpening(owner);
    progress().counterLearned=true;G.sfx.play('wardBreak');
    G.spawnFx({kind:'ring',x:e.x,y:e.y-4,color:'#fff3c2',radius:23,dur:.45});G.damageNumber(e.x,e.y-19,'POP!','#fff3c2');
    G.saveGame();G.events.emit('guardianCounter',{guardian:'moleMonarch',kind});return true;
  }
  G.hitBurrowPlug=(e,opts)=>{
    const r=e.burrowPlug;
    if(e.dead||!r||r.map!==G.state.mapId||!(opts.damage>0)||!G.abilities[opts.ability]||r.owner?.dead)return false;
    if(!r.owner){
      e.dead=true;progress().practiceCleared=true;G.sfx.play('wardBreak');G.damageNumber(e.x,e.y-19,'POP!','#fff3c2');
      G.spawnFx({kind:'ring',x:e.x,y:e.y-4,color:'#b4d397',radius:21,dur:.45});G.saveGame();return false;
    }
    if(r.threats.some(h=>G.state.bossHazards.includes(h)&&h.t<(h.delay||0)+h.warning+h.active))counter(e,'rootPlug');
    else if(!r.broken){r.broken=true;G.sfx.play('hit');G.spawnFx({kind:'puff',x:e.x,y:e.y-4,color:'#d8b06a',dur:.3});}
    return false;
  };
  G.catchBurrowPlug=(owner,x,y)=>{
    if(!bram(owner)||owner.dead||owner.bossChargeT<=0||owner.bossAfterCharge!=='royalStomp')return false;
    for(const e of G.state.enemies||[]){
      const r=e.burrowPlug;if(e.dead||r?.owner!==owner||r.map!==G.state.mapId)continue;
      const dx=owner.x-x,dy=owner.y-y,sq=dx*dx+dy*dy,t=sq?G.util.clamp(((e.x-x)*dx+(e.y-y)*dy)/sq,0,1):0;
      if(Math.hypot(x+dx*t-e.x,y+dy*t-e.y)>(r.broken?24:15)+owner.def.size/2)continue;
      return counter(e,'burrowTrip');
    }
    return false;
  };
  G.noteBurrowDefeat=e=>{
    if(!bram(e))return;const a=progress(),n=e.burrowCounters||0;
    if(n>0){a.counterLearned=true;a.bestCounters=Math.max(a.bestCounters,n);}
    if(e.bramLocalRematch&&e.bramRootRumble&&G.state.mapId==='moleTrial')a.rootRumbleCleared=true;G.saveGame();
  };
  G.beginBurrowRematch=()=>{
    if(!friendly()||G.state.knockout||G.ui.dialogueOpen||G.ui.menuOpen)return false;
    const e=G.makeEnemy('moleMonarch',22*16+8,8*16+8);
    e.def={...e.def,boss:{...e.def.boss,rematchLine:progress().rootRumble?'Two stomps this time! The second circle stays where I mark it. Pop the root plug to stop both.':'Welcome back! Pop a root plug when I stomp, or lead my burrow into an old one.'}};
    e.guardPost=true;e.bramLocalRematch=true;e.bramRootRumble=progress().rootRumble&&progress().counterLearned;
    e.guardianPracticeExit={map:'moleTrial',x:3,y:11};G.state.enemies.push(e);return true;
  };
  G.events.on('mapEnter',()=>{
    if(G.state.mapId!=='moleTrial')return;
    for(const e of G.state.enemies)if(bram(e)){e.guardPost=true;if(G.state.items.includes('mole-crown'))e.dead=true;}
    if(!progress().practiceCleared)plug(practice.x,practice.y);
  });
  const update=G.updateOpening;
  G.updateOpening=dt=>{update(dt);for(const e of G.state.enemies||[]){const r=e.burrowPlug;if(e.dead||!r?.owner)continue;
    if(r.owner.dead||r.map!==G.state.mapId||G.state.knockout)e.dead=true;
  }};
  const candidate=G.openingInteractionCandidate,interact=G.tryOpeningInteraction;
  G.openingInteractionCandidate=()=>{
    const at=candidate();if(at)return at;
    if(!friendly()||G.ui.dialogueOpen||G.ui.menuOpen||G.state.knockout||G.state.bossCutscene||G.state.zoneTransition)return null;
    const p=G.state.player;if(Math.hypot(p.x-friend.x,p.y-friend.y)>18||G.state.projectiles.some(s=>!s.fromPlayer&&!s.dispelled&&Math.hypot(s.x-p.x,s.y-p.y)<75))return null;
    const a=progress();return {id:'bram-rematch',kind:'bram-rematch',...friend,label:a.counterLearned&&!a.invited?'Bram · Say hello':a.rootRumble?'Bram · Try root rumble':'Bram · Practice a duel',hint:a.counterLearned&&!a.invited?'Ask Bram about his two-stomp practice.':a.rootRumbleCleared?`Root rumble cleared. Most root pops: ${a.bestCounters}.`:'Choose a duel here, then walk east.'};
  };
  G.tryOpeningInteraction=()=>{
    const at=G.openingInteractionCandidate();if(at?.id!=='bram-rematch')return interact();
    const a=progress();if(a.counterLearned&&!a.invited){a.invited=true;G.saveGame();G.ui.dialogue('BRAM',"You popped my root plug! Want to try my two-stomp trick? Light the Root Rumble lantern by the fire. Keep your help lights if you like. I'll put the shortbread on.",{accent:'#d8b06a'});}else G.beginBurrowRematch();G.input.clearTaps();return true;
  };
  function drawPlug(c,x,y,broken){
    c.save();c.fillStyle='#6b5039';c.beginPath();c.ellipse(x,y,broken?20:15,broken?9:6,0,0,Math.PI*2);c.fill();
    c.strokeStyle=broken?'#fff3c2':'#d8b06a';c.lineWidth=2;
    if(broken){c.beginPath();c.ellipse(x,y,23,13,0,0,Math.PI*2);c.stroke();}
    else{c.fillStyle='#9c744c';c.beginPath();c.moveTo(x-13,y);c.lineTo(x-9,y-13);c.lineTo(x-3,y-17);c.lineTo(x+5,y-14);c.lineTo(x+12,y-6);c.lineTo(x+14,y);c.closePath();c.fill();
      c.beginPath();c.moveTo(x-2,y-16);c.lineTo(x+2,y-10);c.lineTo(x-3,y-6);c.lineTo(x+3,y);c.stroke();
      c.strokeStyle='#c2b18b';c.lineWidth=1;c.beginPath();c.moveTo(x-11,y-7);c.lineTo(x-3,y-5);c.moveTo(x+10,y-7);c.lineTo(x+3,y-5);c.stroke();}
    c.restore();
  }
  const draw=G.openingDrawables;
  G.openingDrawables=c=>{const list=draw(c);
    for(const e of G.state.enemies||[])if(!e.dead&&e.burrowPlug)list.push({y:e.y,fn:()=>drawPlug(c,e.x,e.y,e.burrowPlug.broken)});
    if(G.state.mapId!=='moleTrial')return list;
    list.push({y:fire.y,fn:()=>G.drawOpeningProp(c,'camp',fire.x,fire.y,G.state.time)});
    if(progress().practiceCleared)list.push({y:practice.y,fn:()=>{drawPlug(c,practice.x,practice.y,true);c.fillStyle='#b4d397';c.fillRect(practice.x-3,practice.y-11,6,3);c.fillStyle='#fff3c2';c.fillRect(practice.x-1,practice.y-8,2,8);}});
    if(progress().counterLearned)list.push({y:fire.y,fn:()=>{c.fillStyle='#d8b06a';c.fillRect(fire.x-17,fire.y-6,9,3);for(const dx of [-17,-13,-9])c.fillRect(fire.x+dx,fire.y-9,2,4);}});
    if(friendly())list.push({y:friend.y,fn:()=>{G.drawShadow(c,friend.x,friend.y,14);G.drawSprite(c,G.enemies.moleMonarch.sprite,0,friend.x,friend.y,false);}});return list;
  };
})();
