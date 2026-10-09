/* The Treant's roots become an opening. Practice and local rematches use the
   existing arts, hazards, world interactions and adventure save. */
"use strict";
(() => {
  const trophy='trophy-heartwood-crown',point=(x,y)=>({x:x*16+8,y:y*16+8});
  const fire=point(12,20),lamp=point(12,19),friend=point(16,19),seat=point(20,20);
  const progress=()=> (G.state.guardianChallenges||(G.state.guardianChallenges=G.makeGuardianChallenges())).treant;
  const treant=e=>e?.def?.id==='ancientTreant';
  G.treantVisitReady=()=>G.state.items.includes(trophy)&&
    (G.state.opening?.complete||G.state.delivery?.started||!G.state.opening?.started);
  G.treantRematchActive=()=>G.state.mapId==='heartwood'&&G.state.enemies.some(e=>!e.dead&&treant(e));
  const friendly=()=>G.state.mapId==='heartwood'&&G.treantVisitReady()&&!G.treantRematchActive();
  G.treantBranchingAvailable=()=>G.treantVisitReady()&&progress().counterLearned;
  G.treantChallengeStation=()=>G.state.mapId==='heartwood'&&G.treantBranchingAvailable()
    ?{kind:'treantChallenge',...lamp}:null;
  G.treantBranchingLit=()=>progress().branching;
  G.toggleTreantBranching=()=>{
    if(!G.treantBranchingAvailable()||G.treantRematchActive())return false;
    progress().branching=!progress().branching;G.saveGame();return true;
  };
  function root(x,y,owner=null){
    const e=G.makeEnemy('orchardTangle',x,y);
    e.id='treantRoot';e.def={...e.def,id:'treantRoot',name:'Cracked root',practice:true,damage:0,speed:0,size:16};
    e.hp=1;e.ward=null;e.treantRoot={owner,map:G.state.mapId,left:owner?3.2:Infinity};
    G.state.enemies.push(e);return e;
  }
  G.treantRootAim=e=>!!e.treantRoot&&!e.dead;
  G.cancelTreantRoots=owner=>{
    for(const e of G.state.enemies||[])if(e.treantRoot?.owner&&(!owner||e.treantRoot.owner===owner))e.dead=true;
  };
  // Tag the last primary strike, but leave its root at the original player's
  // place. Later phases never ask a slow body to chase a distant outer bloom.
  G.prepareTreantCounter=(owner,fields,p)=>{
    if(!treant(owner)||!fields.length)return;
    const last=fields.reduce((a,b)=>{
      const end=h=>(h.delay||0)+(h.warning??h.warn)+h.active;
      return end(a)>end(b)?a:b;
    });
    last.treantAftermath={x:p.x,y:p.y};
    if(!owner.treantBranching||!owner.def.boss.orchard)return;
    const end=Math.max(...fields.map(h=>h.warn+h.active));
    // A second, already-known root circle follows. The first snapped root
    // cancels it. Its target is committed now; its warning begins later.
    G.state.openingHazards.push({kind:'roots',owner,t:0,delay:end,warn:end+(G.guardianWarningSeconds?.(.95)??.95),active:.4,
      x:p.x,y:p.y,radius:17,hit:false,treantEcho:true});
  };
  G.leaveTreantRoot=h=>{
    if(!h.treantAftermath||h.treantAftermath.used||h.owner.dead||G.state.knockout)return;
    h.treantAftermath.used=true;const at=h.treantAftermath;
    if(!G.world.isSafeSpawn(at.x,at.y))return;
    G.cancelTreantRoots(h.owner);root(at.x,at.y,h.owner);
  };
  G.hitTreantRoot=(e,opts)=>{
    const r=e.treantRoot;
    if(e.dead||!r||r.map!==G.state.mapId||!(opts.damage>0)||r.owner?.dead)return false;
    e.dead=true;
    G.sfx.play('wardBreak');G.state.hitStop=Math.max(G.state.hitStop||0,.04);
    G.spawnFx({kind:'ring',x:e.x,y:e.y-6,color:'#fff3c2',radius:15,dur:.35});
    for(let i=0;i<7;i++)G.spawnFx({kind:'spark',x:e.x,y:e.y-7,color:i%2?'#d8b06a':'#a7f070',vx:(i-3)*9,vy:-22-i*2,dur:.4});
    if(!r.owner){progress().practiceCleared=true;G.saveGame();return false;}
    const owner=r.owner;
    owner.treantCounters=(owner.treantCounters||0)+1;
    G.guardianCounterOpening(owner);
    // The root's tug is blunt, regardless of the art that snapped it. Use
    // the existing ward rule; never turn scenery into hit/mana/mastery credit.
    if(owner.ward?.hp>0)G.combat.damageEnemy(owner,{damage:1,type:'blunt',ability:null,knockback:0,noMana:true});
    G.spawnFx({kind:'bolt',x:e.x,y:e.y-6,x2:owner.x,y2:owner.y-8,color:'#a7f070',dur:.3});
    G.damageNumber(owner.x,owner.y-owner.h()-5,'TUG!','#fff3c2');
    progress().counterLearned=true;G.saveGame();
    G.events.emit('guardianCounter',{guardian:'ancientTreant',kind:'root'});
    return false;
  };
  G.noteTreantDefeat=owner=>{
    if(!treant(owner))return;
    G.cancelTreantRoots(owner);
    const n=owner.treantCounters||0,a=progress();
    if(n>0){a.counterLearned=true;a.bestCounters=Math.max(a.bestCounters,n);}
    if(owner.treantBranching&&owner.treantLocalRematch&&G.state.mapId==='heartwood')a.branchingCleared=true;
    G.saveGame();
  };
  G.beginTreantRematch=()=>{
    if(!friendly()||G.state.knockout||G.ui.dialogueOpen||G.ui.menuOpen||G.state.gauntletRun||G.state.expeditionRun)return false;
    const owner=G.makeEnemy('ancientTreant',16*16+8,6*16+8);
    owner.def={...owner.def,aggro:170,size:34,sprite:G.openingTreantSprite||owner.def.sprite,
      boss:{...owner.def.boss,orchard:true,rematchLine:progress().branching?'Let’s try my branching trick! Snap the first root to stop its follower.':'Ready for another try? My cracked roots still give me a good tug.'}};
    owner.treantLocalRematch=true;owner.treantBranching=G.treantBranchingAvailable()&&progress().branching;
    G.state.enemies.push(owner);
    G.state.openingHazards=[];G.state.bossHazards=[];
    // Keep the player at the fire. Walking into the clearing starts the fight.
    return true;
  };
  G.events.on('mapEnter',()=>{
    if(G.state.mapId==='heartwood'){
      // A collected guardian stays a friendly resident until the player
      // chooses a rematch. Pending ground gifts keep their existing consumer.
      if(G.state.items.includes(trophy))for(const e of G.state.enemies)if(treant(e))e.dead=true;
      if(!progress().practiceCleared)root(seat.x,seat.y);
    }
  });
  const update=G.updateOpening;
  G.updateOpening=dt=>{
    update(dt);
    for(const e of G.state.enemies||[]){
      const r=e.treantRoot;if(!r||e.dead)continue;
      if(r.map!==G.state.mapId||r.owner?.dead){e.dead=true;continue;}
      if(r.owner){r.left-=dt;if(r.left<=0)e.dead=true;}
    }
  };
  const candidate=G.openingInteractionCandidate,interact=G.tryOpeningInteraction;
  G.openingInteractionCandidate=()=>{
    const at=candidate();if(at)return at;
    if(!friendly()||G.ui.dialogueOpen||G.state.knockout||G.state.bossCutscene||G.state.zoneTransition)return null;
    if(Math.hypot(G.state.player.x-friend.x,G.state.player.y-friend.y)>18)return null;
    const a=progress();
    return {id:'treant-rematch',kind:'treant-rematch',...friend,label:a.counterLearned&&!a.invited?'Treant · Say hello':a.branching?'Treant · Try branching roots':'Treant · Try the roots',
      hint:a.branchingCleared?`Branching roots cleared. Most roots snapped: ${a.bestCounters}.`:'Walk into the clearing to start. The fire stays here for a breather.'};
  };
  G.tryOpeningInteraction=()=>{
    const at=G.openingInteractionCandidate();
    if(at?.id!=='treant-rematch')return interact();
    const a=progress();
    if(a.counterLearned&&!a.invited){
      a.invited=true;G.saveGame();
      G.ui.dialogue('THE ANCIENT TREANT','You gave my roots a good tug! Want to try my branching trick? Light the crossed-branch lantern by my fire. We can practice with your help lanterns lit, too.',{accent:'#a7f070'});
    }else G.beginTreantRematch();
    G.input.clearTaps();return true;
  };
  function drawRoot(c,e){
    const x=e.x,y=e.y;
    c.save();c.fillStyle='rgba(26,40,32,.25)';c.beginPath();c.ellipse(x,y+2,13,4,0,0,Math.PI*2);c.fill();
    c.strokeStyle='#293d39';c.lineWidth=7;c.beginPath();c.moveTo(x-11,y);c.quadraticCurveTo(x-4,y-14,x+10,y-6);c.stroke();
    c.strokeStyle='#b49060';c.lineWidth=4;c.stroke();
    c.strokeStyle='#ffde95';c.lineWidth=2;c.beginPath();c.moveTo(x-2,y-11);c.lineTo(x-5,y-7);c.lineTo(x+1,y-6);c.lineTo(x-2,y-3);c.stroke();
    c.fillStyle='#a6ce72';c.beginPath();c.ellipse(x+9,y-10,4,2,-.6,0,Math.PI*2);c.fill();
    // A steady crack and falling leaf draw attention without flashing text.
    if(e.treantRoot.owner){c.strokeStyle='#a7f070';c.lineWidth=1;c.beginPath();c.arc(x,y-6,16,0,Math.PI*2*e.treantRoot.left/3.2);c.stroke();}
    c.restore();
  }
  const drawables=G.openingDrawables;
  G.openingDrawables=c=>{
    const list=drawables(c);
    for(const e of G.state.enemies||[])if(!e.dead&&e.treantRoot)list.push({y:e.y,fn:()=>drawRoot(c,e)});
    if(G.state.mapId!=='heartwood')return list;
    if(progress().practiceCleared)list.push({y:seat.y,fn:()=>{
      c.fillStyle='#66513d';c.fillRect(seat.x-12,seat.y-4,24,4);c.fillRect(seat.x-10,seat.y,3,4);c.fillRect(seat.x+7,seat.y,3,4);
      c.fillStyle='#f2cf8b';c.fillRect(seat.x-7,seat.y-3,15,1);
      c.fillStyle='#8aaeb4';c.fillRect(seat.x+3,seat.y-10,5,6);c.fillStyle='#fff3c2';c.fillRect(seat.x+6,seat.y-9,3,3);c.fillStyle='#d8b06a';c.fillRect(seat.x+9,seat.y-8,2,1);
    }});
    if(progress().counterLearned)list.push({y:fire.y,fn:()=>{
      c.strokeStyle='#a7f070';c.lineWidth=2;c.beginPath();c.moveTo(fire.x-14,fire.y-14);c.quadraticCurveTo(fire.x,fire.y-18,fire.x+14,fire.y-14);c.stroke();
      c.fillStyle='#ffdb93';c.fillRect(fire.x-3,fire.y-18,2,6);c.fillRect(fire.x+1,fire.y-18,2,6);
    }});
    if(friendly())list.push({y:friend.y,fn:()=>{
      G.drawShadow(c,friend.x,friend.y,28);
      G.drawSprite(c,G.openingTreantSprite||G.enemies.ancientTreant.sprite,0,friend.x,friend.y,false);
    }});
    return list;
  };
})();
