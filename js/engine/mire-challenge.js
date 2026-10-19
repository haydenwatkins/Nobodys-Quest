/* Break a landed crust to keep useful ground while the Queen fights on. */
"use strict";
(() => {
  const trophy='trophy-mire-pearl',point=(x,y)=>({x:x*16+8,y:y*16+8});
  const fire=point(28,9),lamp=point(28,8),friend=point(26,11),lily=point(25,8);
  const queen=e=>e?.def?.id==='mireQueen';
  const progress=()=>{
    const a=G.state.guardianChallenges||(G.state.guardianChallenges=G.makeGuardianChallenges());
    return a.queen||(a.queen=G.makeGuardianChallenges().queen);
  };
  G.mireVisitReady=()=>G.state.items.includes(trophy)&&G.systemIntroduced('sideAdventures');
  G.mireRematchActive=()=>G.state.mapId==='sunkenMarsh'&&G.state.enemies.some(e=>!e.dead&&queen(e));
  const friendly=()=>G.state.mapId==='sunkenMarsh'&&G.mireVisitReady()&&!G.mireRematchActive();
  G.mireRipplingLit=()=>progress().rippling;
  G.mireChallengeStation=()=>G.state.mapId==='sunkenMarsh'&&G.mireVisitReady()&&progress().counterLearned?{kind:'mireChallenge',...lamp}:null;
  G.toggleMireRippling=()=>{
    if(!G.mireChallengeStation()||G.mireRematchActive())return false;
    progress().rippling=!progress().rippling;G.saveGame();return true;
  };
  function crust(x,y,owner=null){
    const e=G.makeEnemy('slime',x,y);e.id='mireCrust';
    e.def={...e.def,id:e.id,name:'Mire crust',practice:true,damage:0,speed:0,size:20};e.hp=1;e.ward=null;
    e.mireCrust={owner,map:G.state.mapId,left:owner?3.6:Infinity};G.state.enemies.push(e);return e;
  }
  G.mireCrustAim=e=>!!e.mireCrust&&!e.dead;
  G.cancelMireCrusts=owner=>{
    for(const e of G.state.enemies||[])if(e.mireCrust?.owner&&(!owner||e.mireCrust.owner===owner))e.dead=true;
  };
  G.prepareMireCounter=(owner,fields,p)=>{
    if(!queen(owner)||!fields.length)return;
    const end=h=>(h.delay||0)+h.warning+h.active;
    const last=fields.reduce((a,b)=>end(a)>end(b)?a:b);last.mireAftermath={x:p.x,y:p.y};
    if(!owner.queenRippling)return;
    // Each new warning receives help once in resolveBossAction. The ripple
    // waits on the actual primary fields before its separate preparation.
    G.state.bossHazards.push({...last,t:0,delay:end(last)+1.6,warning:.95,active:.35,
      x:p.x,y:p.y,hit:false,mireAftermath:null,mireRipple:fields.slice(),mireCommitted:false});
  };
  G.waitMireRipple=(h,p)=>{
    if(!h.mireRipple||h.mireCommitted)return;
    if(h.mireRipple.some(primary=>!primary.cancelled&&G.state.bossHazards.includes(primary))){h.delay=h.t+1.6;return;}
    h.mireReadyAt??=h.t+1.6;h.delay=h.mireReadyAt;
    if(h.t<h.mireReadyAt)return;
    h.x=p.x;h.y=p.y;h.mireCommitted=true;h.mireChannel=liveChannel(h.owner);
  };
  G.bloomMireRipple=h=>{
    if(!h.mireCommitted||h.mireBloomed)return;h.mireBloomed=true;
    const c=liveChannel(h.owner);if(!c||c!==h.mireChannel||!G.world.isSafeSpawn(h.x,h.y)||!onChannel(c,h))return;
    c.bloom={x:h.x,y:h.y,radius:28};
    G.spawnFx({kind:'ring',x:h.x,y:h.y,color:'#c5e5dd',radius:28,dur:.5});
  };
  G.leaveMireCrust=h=>{
    const at=h.mireAftermath;
    if(!at||at.used||h.owner.dead||G.state.knockout)return;
    at.used=true;if(!G.world.isSafeSpawn(at.x,at.y))return;
    G.cancelMireCrusts(h.owner);crust(at.x,at.y,h.owner);
  };
  G.mireWalkingScale=p=>G.state.enemies.some(e=>!e.dead&&e.mireCrust?.owner&&!e.mireCrust.owner.dead&&
    e.mireCrust.map===G.state.mapId&&Math.hypot(e.x-p.x,e.y-p.y)<=14)?.8:1;
  function channel(owner,x,y){
    const dx=owner.x-x,dy=owner.y-y,length=Math.hypot(dx,dy),ux=length?dx/length:1,uy=length?dy/length:0;
    let reach=0;
    // A lily strip never advertises a walking route through solid ground.
    for(let d=4;d<=length;d+=4){
      if([-14,0,14].some(side=>!G.world.isSafeSpawn(x+ux*d-uy*side,y+uy*d+ux*side))||!G.world.isSafeSpawn(x+ux*(d+14),y+uy*(d+14)))break;
      reach=d;
    }
    owner.mireChannel={x,y,x2:x+ux*reach,y2:y+uy*reach,map:G.state.mapId,phase:owner.bossPhase};
  }
  function liveChannel(owner){
    const c=owner?.mireChannel;
    return c&&!owner.dead&&!G.state.knockout&&c.map===G.state.mapId&&c.phase===owner.bossPhase?c:null;
  }
  function onChannel(c,p){
    const dx=c.x2-c.x,dy=c.y2-c.y,sq=dx*dx+dy*dy,at=sq?G.util.clamp(((p.x-c.x)*dx+(p.y-c.y)*dy)/sq,0,1):0;
    return Math.hypot(p.x-c.x-dx*at,p.y-c.y-dy*at)<=14;
  }
  function bloomReach(b,a){
    let reach=0;for(let d=2;d<=b.radius;d+=2){if(!G.world.isSafeSpawn(b.x+Math.cos(a)*d,b.y+Math.sin(a)*d))break;reach=d;}return reach;
  }
  G.mireShelters=(p,owner)=>{
    const c=liveChannel(owner);if(!c||!G.world.isSafeSpawn(p.x,p.y))return false;
    return onChannel(c,p)||!!c.bloom&&Math.hypot(p.x-c.bloom.x,p.y-c.bloom.y)<=bloomReach(c.bloom,Math.atan2(p.y-c.bloom.y,p.x-c.bloom.x));
  };
  G.drawMireChannels=c=>{
    for(const owner of G.state.enemies||[]){const path=liveChannel(owner);if(!path)continue;
      c.save();c.beginPath();
      // Keep a near-wall crust's rounded edge off solid scenery too.
      const margin=path.bloom?32:18;
      for(let y=Math.floor((Math.min(path.y,path.y2)-margin)/16);y<=Math.floor((Math.max(path.y,path.y2)+margin)/16);y++)
        for(let x=Math.floor((Math.min(path.x,path.x2)-margin)/16);x<=Math.floor((Math.max(path.x,path.x2)+margin)/16);x++)
          if(!G.world.solid(x*16+8,y*16+8))c.rect(x*16,y*16,16,16);
      c.clip();c.strokeStyle='#b7d9d4';c.lineWidth=28;c.lineCap='round';c.globalAlpha=.38;
      c.beginPath();c.moveTo(path.x,path.y);c.lineTo(path.x2,path.y2);c.stroke();
      if(path.bloom){const b=path.bloom;c.beginPath();for(let i=0;i<=64;i++){const a=i*Math.PI/32,d=bloomReach(b,a),x=b.x+Math.cos(a)*d,y=b.y+Math.sin(a)*d;i?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();c.fillStyle='#b7d9d4';c.fill();c.save();c.clip();c.globalAlpha=1;flower(c,b.x,b.y+4);flower(c,b.x-12,b.y+10);flower(c,b.x+12,b.y-3);c.restore();}c.globalAlpha=1;
      const dx=path.x2-path.x,dy=path.y2-path.y,length=Math.hypot(dx,dy),ux=length?dx/length:1,uy=length?dy/length:0;
      for(let d=0;d<=length;d+=16){for(const side of [-14,14]){
        c.fillStyle='#c5e5dd';c.beginPath();c.ellipse(path.x+ux*d-uy*side,path.y+uy*d+ux*side,3,2,0,0,Math.PI*2);c.fill();
      }}c.restore();
    }
  };
  G.hitMireCrust=(e,opts)=>{
    const r=e.mireCrust;if(e.dead||!r||r.map!==G.state.mapId||!(opts.damage>0)||r.owner?.dead)return false;
    e.dead=true;G.sfx.play('wardBreak');G.state.hitStop=Math.max(G.state.hitStop||0,.04);
    G.spawnFx({kind:'ring',x:e.x,y:e.y-2,color:'#c5e5dd',radius:19,dur:.35});
    for(let i=0;i<8;i++)G.spawnFx({kind:'spark',x:e.x,y:e.y-3,color:i%2?'#b7d9d4':'#d6b5e6',vx:(i-3.5)*10,vy:-26-i,dur:.4});
    if(!r.owner){progress().practiceCleared=true;G.saveGame();return false;}
    const owner=r.owner;
    // Nearby splashes leave ground, not a global opening. Dark still answers the veil.
    if(Math.hypot(owner.x-e.x,owner.y-e.y)>110)return false;
    owner.mireCounters=(owner.mireCounters||0)+1;channel(owner,e.x,e.y);
    G.spawnFx({kind:'bolt',x:e.x,y:e.y-2,x2:owner.x,y2:owner.y-8,color:'#b7d9d4',dur:.3});
    G.damageNumber(owner.x,owner.y-owner.h()-5,'LILY PATH!','#d6e9e1');
    progress().counterLearned=true;G.saveGame();G.events.emit('guardianCounter',{guardian:'mireQueen',kind:'mire'});return false;
  };
  G.breakMireAlongDash=(x,y,x2,y2)=>{
    const dx=x2-x,dy=y2-y,sq=dx*dx+dy*dy;
    if(sq<1e-8)return;
    for(const e of G.state.enemies||[]){
      if(e.dead||!e.mireCrust)continue;
      const at=sq?G.util.clamp(((e.x-x)*dx+(e.y-y)*dy)/sq,0,1):0;
      if(Math.hypot(x+dx*at-e.x,y+dy*at-e.y)<=14)G.hitMireCrust(e,{damage:1});
    }
  };
  G.noteMireQueenDefeat=owner=>{
    if(!queen(owner))return;G.cancelMireCrusts(owner);
    const a=progress(),n=owner.mireCounters||0;if(n>0){a.counterLearned=true;a.bestCounters=Math.max(a.bestCounters,n);}
    if(owner.queenLocalRematch&&owner.queenRippling&&G.state.mapId==='sunkenMarsh')a.ripplingCleared=true;
    G.saveGame();
  };
  G.beginMireRematch=()=>{
    if(!friendly()||G.state.knockout||G.ui.dialogueOpen||G.ui.menuOpen||G.state.gauntletRun||G.state.expeditionRun)return false;
    const owner=G.makeEnemy('mireQueen',6*16+8,9*16+8);
    owner.def={...owner.def,boss:{...owner.def.boss,rematchLine:progress().rippling?'Let’s grow a flower pool! Crack the mire, then lead my next bubble onto your lily path. Its splash makes room to move.':'Ready for another splash? My veil still needs dark magic.'}};
    owner.guardPost=true;owner.queenLocalRematch=true;owner.queenRippling=progress().rippling&&progress().counterLearned;
    G.state.enemies.push(owner);G.applyMarshSluices();return true;
  };
  G.events.on('mapEnter',()=>{
    if(G.state.mapId!=='sunkenMarsh')return;
    if(G.state.items.includes(trophy))for(const e of G.state.enemies)if(queen(e))e.dead=true;
    if(!progress().practiceCleared)crust(lily.x,lily.y);
  });
  const update=G.updateOpening;
  G.updateOpening=dt=>{
    update(dt);
    for(const owner of G.state.enemies||[])if(owner.mireChannel&&!liveChannel(owner))delete owner.mireChannel;
    for(const e of G.state.enemies||[]){const r=e.mireCrust;if(!r||e.dead)continue;
      if(r.map!==G.state.mapId||r.owner?.dead){e.dead=true;continue;}
      if(r.owner){r.left-=dt;if(r.left<=0)e.dead=true;}
    }
  };
  const candidate=G.openingInteractionCandidate,interact=G.tryOpeningInteraction;
  G.openingInteractionCandidate=()=>{
    const at=candidate();if(at)return at;
    if(!friendly()||G.ui.dialogueOpen||G.state.knockout||G.state.bossCutscene||G.state.zoneTransition)return null;
    const p=G.state.player;
    if(Math.hypot(p.x-friend.x,p.y-friend.y)>18||G.state.enemies.some(e=>!e.dead&&!e.def.practice&&Math.hypot(e.x-p.x,e.y-p.y)<75)||G.state.projectiles.some(s=>!s.fromPlayer&&!s.dispelled&&Math.hypot(s.x-p.x,s.y-p.y)<75))return null;
    const a=progress();return {id:'queen-rematch',kind:'queen-rematch',...friend,
      label:a.counterLearned&&!a.invited?'Mire Queen · Say hello':a.rippling?'Mire Queen · Try rippling mire':'Mire Queen · Practice a splash',
      hint:a.ripplingCleared?`Rippling mire cleared. Most splashes: ${a.bestCounters}.`:'Walk west along the causeway to start.'};
  };
  G.tryOpeningInteraction=()=>{
    const at=G.openingInteractionCandidate();if(at?.id!=='queen-rematch')return interact();
    const a=progress();if(a.counterLearned&&!a.invited){a.invited=true;G.saveGame();
      G.ui.dialogue('MIRE QUEEN','You grew a lily path! Want to make it bloom? Light my ripple lantern, then lead the next bubble onto your path. Its splash grows a wider flower pool. I’ve got a towel ready.',{accent:'#b29bdf'});
    }else G.beginMireRematch();G.input.clearTaps();return true;
  };
  function drawCrust(c,e){const x=e.x,y=e.y;c.save();
    c.fillStyle='#4d5a69';c.beginPath();c.ellipse(x,y-1,15,7,0,0,Math.PI*2);c.fill();
    c.fillStyle='#877293';c.beginPath();c.ellipse(x,y-3,13,6,0,0,Math.PI*2);c.fill();
    c.strokeStyle='#d6b5e6';c.lineWidth=2;c.beginPath();c.moveTo(x-8,y-5);c.lineTo(x-3,y-2);c.lineTo(x+2,y-5);c.lineTo(x+8,y-2);c.stroke();
    c.fillStyle='#c5e5dd';c.beginPath();c.arc(x+5,y-7,2,0,Math.PI*2);c.fill();
    if(e.mireCrust.owner){c.strokeStyle='#b7d9d4';c.lineWidth=1;c.beginPath();c.arc(x,y-2,17,0,Math.PI*2*e.mireCrust.left/3.6);c.stroke();}c.restore();
  }
  function flower(c,x,y){c.save();c.fillStyle='#658f78';c.beginPath();c.ellipse(x,y,11,5,0,0,Math.PI*2);c.fill();
    c.fillStyle='#c5e5dd';for(const [dx,dy] of [[0,-5],[-5,-2],[5,-2]]){c.beginPath();c.ellipse(x+dx,y-5+dy,4,3,0,0,Math.PI*2);c.fill();}
    c.fillStyle='#efd6a2';c.beginPath();c.arc(x,y-8,2,0,Math.PI*2);c.fill();c.restore();
  }
  const draw=G.openingDrawables;
  G.openingDrawables=c=>{const list=draw(c);
    for(const e of G.state.enemies||[])if(!e.dead&&e.mireCrust)list.push({y:e.y,fn:()=>drawCrust(c,e)});
    if(G.state.mapId!=='sunkenMarsh')return list;
    list.push({y:fire.y,fn:()=>G.drawOpeningProp(c,'camp',fire.x,fire.y,G.state.time)});
    if(progress().practiceCleared)list.push({y:lily.y,fn:()=>flower(c,lily.x,lily.y)});
    if(progress().counterLearned)list.push({y:fire.y,fn:()=>flower(c,fire.x-15,fire.y+4)});
    if(friendly())list.push({y:friend.y,fn:()=>{G.drawShadow(c,friend.x,friend.y,18);G.drawSprite(c,G.enemies.mireQueen.sprite,0,friend.x,friend.y,false);}});
    return list;
  };
})();
