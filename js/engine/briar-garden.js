/* Pruning removes a particular bed from the continuing garden, not the fight. */
"use strict";
(() => {
  const gardens=new WeakMap(),briar=e=>e?.def?.id==='grandmotherBriar';
  const live=e=>briar(e)&&!e.dead&&!G.state.knockout&&gardens.get(e)?.map===G.state.mapId&&gardens.get(e).phase===e.bossPhase;
  const progress=()=>G.state.guardianChallenges.briar;
  G.briarVisitReady=()=>G.state.items.includes('elder-acorn')&&G.systemIntroduced('sideAdventures')&&(!G.state.opening?.started||G.state.opening.version<2||(G.state.claimedForms.includes('druid')&&!G.activeFormOuting()&&!G.formReturnPromise()));
  G.briarRematchActive=()=>G.state.mapId==='druidTrial'&&G.state.enemies.some(e=>!e.dead&&briar(e));
  G.briarCompanionVisible=()=>G.state.mapId==='druidTrial'&&G.state.items.includes('elder-acorn')&&!G.briarRematchActive()&&!G.state.gauntletRun&&!G.state.expeditionRun;
  function paintBud(c,e){
    c.save();c.fillStyle='#35483e';c.beginPath();c.ellipse(e.x,e.y,9,4,0,0,Math.PI*2);c.fill();
    c.strokeStyle='#38b764';c.lineWidth=2;c.beginPath();c.moveTo(e.x,e.y);c.lineTo(e.x,e.y-12);c.stroke();
    c.fillStyle='#e9a9ce';c.beginPath();c.ellipse(e.x,e.y-12,6,4,-.3,0,Math.PI*2);c.fill();c.fillStyle='#fff3c2';c.fillRect(e.x-1,e.y-15,2,5);c.restore();
  }
  function prune(owner,bed,prop){
    if(!live(owner)||bed.pruned)return;
    prop.dead=true;bed.pruned=true;owner.briarPrunes=(owner.briarPrunes||0)+1;
    for(const h of G.state.bossHazards||[])if(h.briarBed===bed)h.cancelled=true;
    G.sfx.play('wardBreak');G.spawnFx({kind:'ring',x:bed.x,y:bed.y-2,radius:19,color:'#e9a9ce',dur:.3});
    progress().gardenLearned=true;G.saveGame();G.damageNumber(bed.x,bed.y-24,'PATH!','#fff3c2');G.events.emit('guardianCounter',{guardian:'grandmotherBriar',kind:'garden'});
  }
  function garden(owner,p){
    if(live(owner))return gardens.get(owner);
    const beds=[],angle=Math.atan2(p.y-owner.y,p.x-owner.x),count=owner.bossPhase+3;
    gardens.set(owner,{map:G.state.mapId,phase:owner.bossPhase,beds,cycle:0});
    for(let i=0;i<count;i++){
      const a=angle+i*Math.PI*2/count,x=owner.x+Math.cos(a)*64,y=owner.y+Math.sin(a)*64;
      if(!G.world.isSafeSpawn(x,y))continue;
      const bed={x,y,index:i,pruned:false};beds.push(bed);
      bed.prop=G.makeGuardianProp(owner,x,y,{name:'Briar bud',hit:e=>prune(owner,bed,e),paint:paintBud});
    }return gardens.get(owner);
  }
  function paintBloom(c,h,active,local){
    c.fillStyle='#a7f070';c.globalAlpha=active?.3:.12;c.beginPath();c.arc(h.x,h.y,h.radius,0,Math.PI*2);c.fill();
    c.globalAlpha=.9;c.strokeStyle=active?'#e9a9ce':'#fff3c2';c.lineWidth=active?2:1;c.setLineDash(active?[]:[3,3]);c.stroke();c.setLineDash([]);
    if(active)G.drawHedgewayBloom?.(c,h);
    else{c.beginPath();c.arc(h.x,h.y,h.radius*Math.min(1,local/h.warning),0,Math.PI*2);c.stroke();}
  }
  G.registerGuardianAuthor('grandmotherBriar',{actions:{gardenBeds(owner,p,spawn){
    const g=garden(owner,p),cycle=g.cycle++,beds=g.beds.filter(b=>!b.pruned&&(owner.bossPhase!==2||b.index%2===cycle%2));
    for(const bed of beds)spawn(owner,'rootBloom',{x:bed.x,y:bed.y,radius:22,warning:1.1+(owner.bossPhase===3?bed.index*.16:0),active:.8,color:'#a7f070',bloomColor:'#e9a9ce',briarBed:bed,
      guardianActive(h,feet){if(!bed.pruned&&!h.hit&&Math.hypot(feet.x-h.x,feet.y-h.y)<=h.radius&&G.damagePlayer(1,h.x,h.y))h.hit=true;},guardianPaint:paintBloom});
    owner.bossRecoverT=Math.max(.9,...beds.map(b=>1.1+(owner.bossPhase===3?b.index*.16:0)+.8+.9));
  }},defeat(owner){const n=owner.briarPrunes||0;if(n){progress().gardenLearned=true;progress().bestPrunes=Math.max(progress().bestPrunes,n);}G.saveGame();}});
  const update=G.updateOpening;
  G.updateOpening=dt=>{update(dt);for(const e of G.state.enemies||[])if(gardens.has(e)&&!live(e))gardens.delete(e);};
  G.events.on('mapEnter',()=>{
    if(G.state.mapId!=='druidTrial')return;
    for(const e of G.state.enemies)if(briar(e)){e.guardPost=true;if(G.state.items.includes('elder-acorn'))e.dead=true;}
    if(!progress().practicePruned)G.makeGuardianProp(null,88,200,{name:'Spare garden bud',paint:paintBud,hit:e=>{e.dead=true;progress().practicePruned=true;G.saveGame();G.sfx.play('wardBreak');G.spawnFx({kind:'ring',x:e.x,y:e.y,color:'#e9a9ce',radius:15,dur:.3});}});
  });
  G.beginBriarRematch=()=>{
    if(!G.briarCompanionVisible()||!G.briarVisitReady()||G.state.knockout||G.ui.dialogueOpen||G.ui.menuOpen)return false;
    const e=G.makeEnemy('grandmotherBriar',360,136);e.guardPost=true;e.briarLocalRematch=true;e.guardianPracticeExit={map:'druidTrial',x:3,y:11};G.state.enemies.push(e);return true;
  };
  const candidate=G.openingInteractionCandidate,interact=G.tryOpeningInteraction;
  G.openingInteractionCandidate=()=>{
    const at=candidate();if(at)return at;
    if(!G.briarCompanionVisible()||!G.briarVisitReady()||G.ui.dialogueOpen||G.ui.menuOpen||G.state.knockout||G.state.bossCutscene||G.state.zoneTransition)return null;
    const p=G.state.player;if(Math.hypot(p.x-88,p.y-168)>18||G.state.projectiles.some(s=>!s.fromPlayer&&!s.dispelled&&Math.hypot(s.x-p.x,s.y-p.y)<75))return null;
    return{id:'briar-rematch',kind:'briar-rematch',x:88,y:168,label:'Briar · Tend the garden again',hint:progress().gardenLearned?'Most buds clipped: '+progress().bestPrunes+'. Choose practice, then walk east.':'Clip a pink bud. Its path stays clear through the next blooms.'};
  };
  G.tryOpeningInteraction=()=>{if(G.openingInteractionCandidate()?.id!=='briar-rematch')return interact();G.beginBriarRematch();G.input.clearTaps();return true;};
  const draw=G.openingDrawables;
  G.openingDrawables=c=>{const list=draw(c);
    for(const owner of G.state.enemies||[])if(live(owner))for(const bed of gardens.get(owner).beds)if(bed.pruned)list.push({y:bed.y-1,fn:()=>{
      c.save();c.strokeStyle='#d8caa1';c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(bed.x-12,bed.y);c.lineTo(bed.x+12,bed.y);c.stroke();
      c.fillStyle='#e9a9ce';for(const [x,y]of [[-16,-6],[16,5],[-10,8],[12,-9]])c.fillRect(bed.x+x,bed.y+y,3,2);c.restore();
    }});
    if(G.state.mapId==='druidTrial'){
      list.push({y:184,fn:()=>G.drawOpeningProp(c,'camp',56,184,G.state.time)});
      if(progress().practicePruned||G.state.items.includes('elder-acorn'))list.push({y:200,fn:()=>{c.save();c.fillStyle='#38b764';c.fillRect(87,193,2,7);c.fillStyle='#e9a9ce';for(const x of [-5,0,5]){c.beginPath();c.arc(88+x,190,3,0,Math.PI*2);c.fill();}c.restore();}});
      if(G.briarCompanionVisible())list.push({y:168,fn:()=>{G.drawShadow(c,88,168,14);G.drawSprite(c,G.enemies.grandmotherBriar.sprite,0,88,168,false);}});
    }return list;
  };
})();
