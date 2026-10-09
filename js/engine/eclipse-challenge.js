/* Ring a raised shield with a normal art. An optional local duel develops
   the commitment; dark magic, native movement and reward ownership keep their rules. */
"use strict";
(() => {
  const trophy='trophy-eclipse-sigil',point=(x,y)=>({x:x*16+8,y:y*16+8});
  const fire=point(3,11),lamp=point(4,12),friend=point(5,9),post=point(6,14);
  const knight=e=>e?.def?.id==='eclipseKnight';
  const progress=()=>{
    const all=G.state.guardianChallenges||(G.state.guardianChallenges=G.makeGuardianChallenges());
    return all.knight||(all.knight=G.makeGuardianChallenges().knight);
  };
  G.eclipseVisitReady=()=>G.state.items.includes(trophy)&&G.systemIntroduced('sideAdventures')&&
    (!G.state.opening?.started||G.state.opening.version<2||G.ensureTown().requests.includes('ridge-watch'));
  G.eclipseRematchActive=()=>G.state.mapId==='emberRidge'&&G.state.enemies.some(e=>!e.dead&&knight(e));
  const friendly=()=>G.state.mapId==='emberRidge'&&G.eclipseVisitReady()&&!G.eclipseRematchActive()&&!G.state.gauntletRun&&!G.state.expeditionRun;
  G.eclipseCrescentLit=()=>progress().crescent;
  G.eclipseChallengeStation=()=>friendly()&&progress().counterLearned?{kind:'eclipseChallenge',...lamp}:null;
  G.toggleEclipseCrescent=()=>{
    if(!G.eclipseChallengeStation())return false;
    progress().crescent=!progress().crescent;G.saveGame();return true;
  };
  G.eclipseShieldRaised=e=>knight(e)&&!e.dead&&e.bossEngaged&&e.bossIntroT<=0&&
    ((e.bossTelegraphT>0&&e.bossPendingAction==='charge')||e.bossChargeT>0);
  function ring(e){
    G.sfx.play('wardBreak');G.spawnFx({kind:'ring',x:e.x,y:e.y-9,color:'#ffdc91',radius:25,dur:.45});
    G.damageNumber(e.x,e.y-e.h()-5,'CLANG!','#ffdc91');G.state.hitStop=Math.max(G.state.hitStop||0,.04);
  }
  G.hitEclipseShield=(e,opts)=>{
    if(!G.eclipseShieldRaised(e)||!(opts.damage>0)||!G.abilities[opts.ability])return false;
    // This is a tactical opening, never a free ward break or a fake hit/kill.
    e.eclipseCounters=(e.eclipseCounters||0)+1;G.guardianCounterOpening(e);ring(e);
    progress().counterLearned=true;G.saveGame();G.events.emit('guardianCounter',{guardian:'eclipseKnight',kind:'shield'});return true;
  };
  G.hitEclipsePractice=(e,opts)=>{
    if(e.dead||!e.eclipsePractice||!(opts.damage>0))return false;
    e.dead=true;ring(e);progress().practiceCleared=true;G.saveGame();return false;
  };
  G.noteEclipseDefeat=e=>{
    if(!knight(e))return;
    const a=progress(),n=e.eclipseCounters||0;if(n>0){a.counterLearned=true;a.bestCounters=Math.max(a.bestCounters,n);}
    if(e.knightLocalRematch&&e.knightCrescent&&G.state.mapId==='emberRidge')a.crescentCleared=true;
    G.saveGame();
  };
  G.beginEclipseRematch=()=>{
    if(!friendly()||G.state.knockout||G.ui.dialogueOpen||G.ui.menuOpen)return false;
    const e=G.makeEnemy('eclipseKnight',23*16+8,9*16+8);
    e.def={...e.def,boss:{...e.def.boss,rematchLine:progress().crescent?'Ready? I’ll follow my charge with a crescent. Ring my raised shield to stop the pair!':'A practice duel? Ring my raised shield! Dark magic still breaks my ward.'}};
    e.guardPost=true;e.knightLocalRematch=true;e.knightCrescent=progress().crescent&&progress().counterLearned;
    G.state.enemies.push(e);return true;
  };
  G.events.on('mapEnter',()=>{
    if(G.state.mapId!=='emberRidge')return;
    if(G.state.items.includes(trophy))for(const e of G.state.enemies)if(knight(e))e.dead=true;
    if(!progress().practiceCleared){
      const e=G.makeEnemy('slime',post.x,post.y);e.id='eclipsePractice';e.eclipsePractice=true;
      e.def={...e.def,id:e.id,name:'Spare shield',practice:true,damage:0,speed:0,size:20};e.hp=1;e.ward=null;G.state.enemies.push(e);
    }
  });
  const candidate=G.openingInteractionCandidate,interact=G.tryOpeningInteraction;
  G.openingInteractionCandidate=()=>{
    const at=candidate();if(at)return at;
    if(!friendly()||G.ui.dialogueOpen||G.state.knockout||G.state.bossCutscene||G.state.zoneTransition)return null;
    const p=G.state.player;
    if(Math.hypot(p.x-friend.x,p.y-friend.y)>18||G.state.enemies.some(e=>!e.dead&&!e.def.practice&&Math.hypot(e.x-p.x,e.y-p.y)<75)||G.state.projectiles.some(s=>!s.fromPlayer&&!s.dispelled&&Math.hypot(s.x-p.x,s.y-p.y)<75))return null;
    const a=progress();return {id:'knight-rematch',kind:'knight-rematch',...friend,
      label:a.counterLearned&&!a.invited?'Eclipse Knight · Say hello':a.crescent?'Eclipse Knight · Try following crescent':'Eclipse Knight · Practice a duel',
      hint:a.crescentCleared?`Following crescent cleared. Most shield rings: ${a.bestCounters}.`:'Walk east to the court to start.'};
  };
  G.tryOpeningInteraction=()=>{
    const at=G.openingInteractionCandidate();if(at?.id!=='knight-rematch')return interact();
    const a=progress();if(a.counterLearned&&!a.invited){a.invited=true;G.saveGame();
      G.ui.dialogue('ECLIPSE KNIGHT','You rang my shield! Want to try my following crescent? Light the crescent lantern by our fire. Keep your help lights if you like. I’ll have the kettle ready.',{accent:'#b58ee6'});
    }else G.beginEclipseRematch();G.input.clearTaps();return true;
  };
  function shield(c,x,y,raised){
    c.save();c.fillStyle='#493e5a';c.beginPath();c.moveTo(x-9,y-17);c.lineTo(x+9,y-17);c.lineTo(x+8,y-5);c.quadraticCurveTo(x+6,y,x,y+3);c.quadraticCurveTo(x-6,y,x-8,y-5);c.closePath();c.fill();
    c.strokeStyle=raised?'#ffdc91':'#bba7cf';c.lineWidth=2;c.stroke();
    c.fillStyle=raised?'#fff1c7':'#ddc5a5';c.beginPath();c.arc(x,y-9,3,0,Math.PI*2);c.fill();
    if(raised){c.strokeStyle='#ffdc91';c.lineWidth=1.5;for(const dx of [-1,1]){c.beginPath();c.arc(x+dx*8,y-8,6,dx<0?Math.PI*.65:-Math.PI*.35,dx<0?Math.PI*1.35:Math.PI*.35);c.stroke();}}
    c.restore();
  }
  const draw=G.openingDrawables;
  G.openingDrawables=c=>{const list=draw(c);
    for(const e of G.state.enemies||[]){
      if(!e.dead&&e.eclipsePractice)list.push({y:e.y,fn:()=>{c.fillStyle='#96765c';c.fillRect(e.x-2,e.y-20,4,23);shield(c,e.x,e.y-2,true);}});
      if(G.eclipseShieldRaised(e))list.push({y:e.y+1,fn:()=>shield(c,e.x+e.bossChargeX*7,e.y+e.bossChargeY*3,true)});
    }
    if(G.state.mapId!=='emberRidge')return list;
    list.push({y:fire.y,fn:()=>G.drawOpeningProp(c,'camp',fire.x,fire.y,G.state.time)});
    if(progress().practiceCleared)list.push({y:post.y,fn:()=>{shield(c,post.x,post.y,false);c.fillStyle='#ffdc91';c.beginPath();c.moveTo(post.x,post.y-17);c.quadraticCurveTo(post.x-8,post.y-7,post.x,post.y-5);c.quadraticCurveTo(post.x+7,post.y-8,post.x,post.y-17);c.fill();}});
    if(progress().counterLearned)list.push({y:fire.y,fn:()=>shield(c,fire.x-14,fire.y+2,false)});
    if(friendly())list.push({y:friend.y,fn:()=>{G.drawShadow(c,friend.x,friend.y,14);G.drawSprite(c,G.enemies.eclipseKnight.sprite,0,friend.x,friend.y,false);}});
    return list;
  };
})();
