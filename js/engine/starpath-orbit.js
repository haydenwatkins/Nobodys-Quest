/* Nell rewards safe positioning with carried cover, not an interrupted fight. */
"use strict";
(() => {
  let cover=null;
  const nell=e=>e?.def?.id==='professorPerihelion';
  const progress=()=>G.state.guardianChallenges.nell;
  G.starpathVisitReady=()=>G.state.items.includes('orrery-key')&&G.systemIntroduced('sideAdventures')&&(!G.state.opening?.started||G.state.opening.version<2||(G.state.claimedForms.includes('astronomer')&&!G.activeFormOuting()&&!G.formReturnPromise()));
  G.starpathRematchActive=()=>G.state.mapId==='astronomerTrial'&&G.state.enemies.some(e=>!e.dead&&nell(e));
  const friendly=()=>G.state.mapId==='astronomerTrial'&&G.starpathVisitReady()&&!G.starpathRematchActive()&&!G.state.gauntletRun&&!G.state.expeditionRun;
  const live=()=>cover&&cover.map===G.state.mapId&&!cover.owner.dead&&!G.state.knockout&&G.state.enemies.includes(cover.owner);
  function segmentDistance(ax,ay,bx,by){const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,-(ax*dx+ay*dy)/(dx*dx+dy*dy||1)));return Math.hypot(ax+t*dx,ay+t*dy);}
  G.prepareStarpathOrbit=h=>{
    if(!nell(h.owner)||h.kind!=='orbitalBand')return;
    cover=null;
    h.starpathOrbit={time:0,broken:false,previous:{x:G.state.player.x,y:G.state.player.y,t:h.t}};
  };
  G.trackStarpathOrbit=h=>{
    const r=h.starpathOrbit;if(!r||h.mapId!==G.state.mapId||h.owner.dead||G.state.knockout)return;
    const p=G.state.player,a=r.previous,b={x:p.x,y:p.y,t:h.t},start=(h.delay||0)+h.warning,end=start+h.active;
    const from=Math.max(a.t,start),to=Math.min(b.t,end);
    if(to>from){
      const at=t=>{const f=(t-a.t)/(b.t-a.t||1);return{x:a.x+(b.x-a.x)*f-h.x,y:a.y+(b.y-a.y)*f-h.y};},u=at(from),v=at(to);
      // Both the complete path and its endpoints must stay in the real band.
      if(segmentDistance(u.x,u.y,v.x,v.y)<h.inner||Math.max(Math.hypot(u.x,u.y),Math.hypot(v.x,v.y))>h.outer)r.broken=true;
      r.time+=to-from;
    }
    r.previous=b;
    if(b.t>=end&&!r.finished){
      r.finished=true;
      if(!r.broken&&r.time>=h.active-1e-6){
        cover={owner:h.owner,map:h.mapId,count:3,previousFeet:{x:p.x,y:p.y},previousOwner:{x:h.owner.x,y:h.owner.y}};
        h.owner.starpathOrbits=(h.owner.starpathOrbits||0)+1;
        G.sfx.play('wardBreak');G.damageNumber(p.x,p.y-28,'PLANETS!','#ffcd75');
        G.events.emit('orbitShelter',{guardian:'professorPerihelion'});
      }
    }
  };
  function planets(p,owner,count){
    const angle=Math.atan2(owner.y-(p.y-5),owner.x-p.x);
    return Array.from({length:count},(_,i)=>{const a=angle+(i-(count-1)/2)*.55;return{x:p.x+Math.cos(a)*22,y:p.y-5+Math.sin(a)*22};});
  }
  G.starpathPlanets=()=>live()?planets(G.state.player,cover.owner,cover.count):[];
  G.catchStarpathShot=(shot,x,y)=>{
    if(!live()||shot.fromPlayer||shot.dispelled||shot.owner!==cover.owner||shot.armT>0)return false;
    const now=planets(G.state.player,cover.owner,cover.count),before=planets(cover.previousFeet,cover.previousOwner,cover.count);
    let contact=-1,closest=Infinity;
    for(let i=0;i<now.length;i++){
      if(segmentDistance(x-before[i].x,y-before[i].y,shot.x-now[i].x,shot.y-now[i].y)>7+shot.size)continue;
      const d=Math.hypot(before[i].x-x,before[i].y-y);if(d<closest){closest=d;contact=i;}
    }
    if(contact<0)return false;
    const at=now[contact],owner=cover.owner;cover.count--;
    owner.starpathCatches=(owner.starpathCatches||0)+1;
    progress().orbitLearned=true;progress().bestCatches=Math.max(progress().bestCatches,owner.starpathCatches);
    G.spawnFx({kind:'ring',x:at.x,y:at.y,color:'#ffcd75',radius:9,dur:.22});G.sfx.play('wardBreak');
    G.events.emit('projectileBlock',{kind:'orbitPlanet',guardian:'professorPerihelion'});G.saveGame();
    if(!cover.count)cover=null;return true;
  };
  const move=G.updatePlayer;
  G.updatePlayer=dt=>{if(live()){cover.previousFeet={x:G.state.player.x,y:G.state.player.y};cover.previousOwner={x:cover.owner.x,y:cover.owner.y};}move(dt);};
  const update=G.updateOpening;
  G.updateOpening=dt=>{update(dt);if(cover&&!live())cover=null;};
  G.events.on('mapEnter',()=>{
    cover=null;
    if(G.state.mapId==='astronomerTrial')for(const e of G.state.enemies)if(nell(e)){e.guardPost=true;if(G.state.items.includes('orrery-key'))e.dead=true;}
  });
  G.noteStarpathDefeat=e=>{if(!nell(e))return;if(cover?.owner===e)cover=null;};
  G.beginStarpathRematch=()=>{
    if(!friendly()||G.state.knockout||G.ui.dialogueOpen||G.ui.menuOpen)return false;
    const e=G.makeEnemy('professorPerihelion',360,136);e.guardPost=true;e.nellLocalRematch=true;e.guardianPracticeExit={map:'astronomerTrial',x:3,y:11};G.state.enemies.push(e);return true;
  };
  const candidate=G.openingInteractionCandidate,interact=G.tryOpeningInteraction;
  G.openingInteractionCandidate=()=>{
    const at=candidate();if(at)return at;
    if(!friendly()||G.ui.dialogueOpen||G.ui.menuOpen||G.state.knockout||G.state.bossCutscene||G.state.zoneTransition)return null;
    const p=G.state.player;if(Math.hypot(p.x-88,p.y-168)>18||G.state.projectiles.some(s=>!s.fromPlayer&&!s.dispelled&&Math.hypot(s.x-p.x,s.y-p.y)<75))return null;
    return{id:'nell-rematch',kind:'nell-rematch',x:88,y:168,label:'Nell · Practice the orbit',hint:progress().orbitLearned?'Most stars caught: '+progress().bestCatches+'. Choose practice, then walk east.':'Stay between the circles. Carry the little planets into the star shower.'};
  };
  G.tryOpeningInteraction=()=>{if(G.openingInteractionCandidate()?.id!=='nell-rematch')return interact();G.beginStarpathRematch();G.input.clearTaps();return true;};
  const draw=G.openingDrawables;
  G.openingDrawables=c=>{
    const list=draw(c),p=G.state.player;
    if(live())list.push({y:p.y+1,fn:()=>{for(const at of G.starpathPlanets()){
      c.save();c.fillStyle='#263b4b';c.beginPath();c.arc(at.x,at.y,8,0,Math.PI*2);c.fill();
      c.fillStyle='#ffcd75';c.beginPath();c.arc(at.x,at.y,6,0,Math.PI*2);c.fill();
      c.strokeStyle='#fff3c2';c.lineWidth=1.5;c.beginPath();c.ellipse(at.x,at.y,9,3,-.35,0,Math.PI*2);c.stroke();c.restore();
    }}});
    if(G.state.mapId==='astronomerTrial'){
      list.push({y:184,fn:()=>G.drawOpeningProp(c,'camp',56,184,G.state.time)});
      if(G.state.items.includes('orrery-key')&&!G.state.enemies.some(e=>!e.dead&&nell(e))&&!G.state.gauntletRun&&!G.state.expeditionRun)
        list.push({y:168,fn:()=>{G.drawShadow(c,88,168,14);G.drawSprite(c,G.enemies.professorPerihelion.sprite,0,88,168,false);}});
    }
    return list;
  };
})();
