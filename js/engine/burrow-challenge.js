/* Loosen a root; an actual completed burrow digs its connected shortcut. */
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
    e.burrowPlug={owner,threats,map:G.state.mapId,phase:owner?.bossPhase,broken:false};G.state.enemies.push(e);return e;
  }
  G.burrowPlugAim=e=>!!e.burrowPlug&&!e.dead&&!e.burrowPlug.broken;
  G.cancelBurrowPlugs=owner=>{for(const e of G.state.enemies||[])if(e.burrowPlug?.owner&&(!owner||e.burrowPlug.owner===owner))e.dead=true;};
  G.prepareBurrowCounter=(owner,h,p)=>{
    if(!bram(owner))return;
    for(const e of G.state.enemies||[])if(e.burrowPlug?.owner===owner&&!e.burrowPlug.broken)e.dead=true;
    const threats=[h];
    if(owner.bramRootRumble){
      const delay=h.warning+(G.guardianWarningSeconds?.(0)??0)+h.active+.45;
      const follow={...h,x:p.x,y:p.y,radius:34,t:0,delay,warning:.9,hit:false,burrowFollower:true};
      G.state.bossHazards.push(follow);threats.push(follow);
    }
    const dug=(G.state.enemies||[]).filter(e=>!e.dead&&e.burrowPlug?.owner===owner&&e.burrowPlug.passage);
    if(dug.length){for(const e of dug)e.burrowPlug.threats=threats;return;}
    const a=Math.atan2(p.y-h.y,p.x-h.x);
    for(const turn of [0,Math.PI/2,-Math.PI/2,Math.PI]){
      const x=h.x+Math.cos(a+turn)*48,y=h.y+Math.sin(a+turn)*48;
      if(G.world.isSafeSpawn(x,y)){plug(x,y,owner,threats);break;}
    }
  };
  G.hitBurrowPlug=(e,opts)=>{
    const r=e.burrowPlug;
    if(e.dead||!r||r.map!==G.state.mapId||!(opts.damage>0)||!G.abilities[opts.ability]||r.owner?.dead)return false;
    if(!r.owner){
      e.dead=true;progress().practiceCleared=true;G.sfx.play('wardBreak');G.damageNumber(e.x,e.y-19,'POP!','#fff3c2');
      G.spawnFx({kind:'ring',x:e.x,y:e.y-4,color:'#b4d397',radius:21,dur:.45});G.saveGame();return false;
    }
    if(!r.broken){r.broken=true;G.sfx.play('hit');G.spawnFx({kind:'puff',x:e.x,y:e.y-4,color:'#d8b06a',dur:.3});}
    return false;
  };
  function clearRoute(from,to){
    const distance=Math.hypot(to.x-from.x,to.y-from.y),steps=Math.max(1,Math.ceil(distance/3));
    for(let i=0;i<=steps;i++)if(!G.world.isSafeSpawn(from.x+(to.x-from.x)*i/steps,from.y+(to.y-from.y)*i/steps))return false;
    return true;
  }
  G.catchBurrowPlug=(owner,x,y)=>{
    if(!bram(owner)||owner.dead||owner.bossChargeT<=0||owner.bossAfterCharge!=='royalStomp')return false;
    for(const e of G.state.enemies||[]){
      const r=e.burrowPlug;if(e.dead||r?.owner!==owner||r.map!==G.state.mapId||!r.broken||r.passage)continue;
      const dx=owner.x-x,dy=owner.y-y,sq=dx*dx+dy*dy,t=sq?G.util.clamp(((e.x-x)*dx+(e.y-y)*dy)/sq,0,1):0;
      if(!r.dig){
        const from={x:x+dx*t,y:y+dy*t};
        if(Math.hypot(from.x-e.x,from.y-e.y)>10||!clearRoute(e,from))continue;
        r.dig={from,trail:[from]};
      }
      r.dig.trail.push({x:owner.x,y:owner.y});
    }
    return false;
  };
  G.finishBurrowPassage=owner=>{
    for(const e of G.state.enemies||[]){
      const r=e.burrowPlug;if(e.dead||r?.owner!==owner||!r.dig)continue;
      const from=r.dig.from,to={x:owner.x,y:owner.y};
      if(Math.hypot(to.x-from.x,to.y-from.y)>=18&&clearRoute(from,to)){
        r.passage={from,to,uses:0};e.x=from.x;e.y=from.y;
        G.spawnFx({kind:'ring',x:to.x,y:to.y-4,color:'#b4d397',radius:14,dur:.4});
      }
      r.dig=null;
    }
  };
  function passageLive(root){
    const r=root.burrowPlug,owner=r?.owner;if(!r)return false;
    return !root.dead&&r.map===G.state.mapId&&!G.state.knockout&&(!owner||!owner.dead&&G.state.enemies.includes(owner)&&!(owner.status?.stun?.dur>0)&&!(owner.bossStaggerT>0))&&r.passage;
  }
  function liveStomps(root){return root.burrowPlug.threats.filter(h=>G.state.bossHazards.includes(h)&&h.t<(h.delay||0)+h.warning+h.active);}
  function completePassage(transit){
    const root=transit.root,r=root.burrowPlug,path=r.passage,owner=r.owner,p=G.state.player;
    path.uses++;p.burrowArrival={root,end:transit.to};
    if(owner){
      owner.burrowTunnelUses=(owner.burrowTunnelUses||0)+1;const a=progress();a.counterLearned=true;a.bestTunnelUses=Math.max(a.bestTunnelUses||0,owner.burrowTunnelUses);
      G.events.emit('guardianCounter',{guardian:'moleMonarch',kind:'underpass'});
    }else progress().practiceCleared=true;
    G.sfx.play('pickup');G.saveGame();
  }
  G.advanceBurrowPassage=dt=>{
    const p=G.state.player,t=p.burrowTransit;if(!t)return false;
    if(!passageLive(t.root)||!liveStomps(t.root).length){p.burrowTransit=null;return false;}
    const dx=t.to.x-p.x,dy=t.to.y-p.y,distance=Math.hypot(dx,dy),step=Math.min(distance,120*dt),x=p.x,y=p.y;
    if(distance>.01)G.world.moveBox(p,dx/distance*step,dy/distance*step);
    if(distance>.01&&Math.hypot(p.x-x,p.y-y)<step-.1){p.burrowTransit=null;return true;}
    G.spawnFx({kind:'puff',x:p.x,y:p.y-3,color:'#d8b06a',dur:.15});
    if(Math.hypot(p.x-t.to.x,p.y-t.to.y)<.1){completePassage(t);p.burrowTransit=null;}
    return true;
  };
  G.enterBurrowPassage=(x,y)=>{
    const p=G.state.player,v=G.input.vec;if(p.dashing||p.burrowTransit||!v||Math.hypot(p.x-x,p.y-y)<.1)return;
    for(const root of G.state.enemies||[]){
      const path=passageLive(root);if(!path||!liveStomps(root).length||path.uses>=1||p.burrowArrival?.root===root)continue;
      for(const [from,to] of [[path.from,path.to],[path.to,path.from]]){
        const dx=to.x-from.x,dy=to.y-from.y,distance=Math.hypot(dx,dy);
        if(Math.hypot(p.x-from.x,p.y-from.y)<=7&&(v.x*dx+v.y*dy)/distance>.5&&Math.hypot(x-from.x,y-from.y)>Math.hypot(p.x-from.x,p.y-from.y)){
          p.burrowTransit={root,to};return;
        }
      }
    }
  };
  G.burrowShelters=(p,owner)=>{
    const at=p.burrowTransit||p.burrowArrival,root=at?.root;
    if(!root||root.burrowPlug.owner!==owner||!passageLive(root)||!liveStomps(root).length)return false;
    return !!p.burrowTransit||Math.hypot(p.x-at.end.x,p.y-at.end.y)<=12;
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
    const interrupted=r.owner.status?.stun?.dur>0||r.owner.bossStaggerT>0;
    if(r.dig&&(interrupted||r.owner.bossChargeT<=0))r.dig=null;
    if(r.owner.dead||r.phase!==r.owner.bossPhase||r.map!==G.state.mapId||G.state.knockout||r.passage&&(!passageLive(e)||!liveStomps(e).length))e.dead=true;
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
    for(const e of G.state.enemies||[])if(!e.dead&&e.burrowPlug){
      const path=e.burrowPlug.passage;
      if(path)list.push({y:Math.min(path.from.y,path.to.y)-12,fn:()=>{
        c.save();c.strokeStyle='#d8b06a';c.lineWidth=2;c.setLineDash([3,4]);c.beginPath();c.moveTo(path.from.x,path.from.y-3);c.lineTo(path.to.x,path.to.y-3);c.stroke();c.setLineDash([]);
        for(const at of [path.from,path.to]){drawPlug(c,at.x,at.y,true);c.strokeStyle=path.uses?'#fff3c2':'#b4d397';c.lineWidth=2;c.beginPath();c.ellipse(at.x,at.y-3,9,4,0,0,Math.PI*2);c.stroke();}
        const t=G.state.player.burrowTransit;if(t?.root===e){c.fillStyle='#fff3c2';c.beginPath();c.ellipse(G.state.player.x,G.state.player.y,7,3,0,0,Math.PI*2);c.fill();}c.restore();
      }});
      else list.push({y:e.y,fn:()=>drawPlug(c,e.x,e.y,e.burrowPlug.broken)});
    }
    if(G.state.mapId!=='moleTrial')return list;
    list.push({y:fire.y,fn:()=>G.drawOpeningProp(c,'camp',fire.x,fire.y,G.state.time)});
    if(progress().practiceCleared)list.push({y:practice.y,fn:()=>{drawPlug(c,practice.x,practice.y,true);c.fillStyle='#b4d397';c.fillRect(practice.x-3,practice.y-11,6,3);c.fillStyle='#fff3c2';c.fillRect(practice.x-1,practice.y-8,2,8);}});
    if(progress().counterLearned)list.push({y:fire.y,fn:()=>{c.fillStyle='#d8b06a';c.fillRect(fire.x-17,fire.y-6,9,3);for(const dx of [-17,-13,-9])c.fillRect(fire.x+dx,fire.y-9,2,4);}});
    if(friendly())list.push({y:friend.y,fn:()=>{G.drawShadow(c,friend.x,friend.y,14);G.drawSprite(c,G.enemies.moleMonarch.sprite,0,friend.x,friend.y,false);}});return list;
  };
})();
