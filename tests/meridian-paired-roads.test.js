const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(form='nobody'){const r=runtime(),{G}=r;G.state.claimedForms.push(form);if(form==='god'){G.state.worldwake.marks=['sky','stone','thread','echo','light','heart'];G.state.items.push('god-spark');G.questsDone.push(...G.formOrder.filter(id=>id!=='god').slice(0,8).flatMap((id,i)=>G.forms[id].quests.slice(0,i<3?4:2).map(q=>q.id)));}G.setForm(form);assert.equal(G.state.formId,form);Object.assign(G.state.opening,{started:true,version:2,complete:true});r.load('godTrial');r.drain();const e=G.state.enemies.find(e=>e.id==='godAvatar')||G.makeEnemy('godAvatar',360,136);G.state.enemies=[e];Object.assign(G.state.player,{x:272,y:136,mana:0,manaRegenDelay:1000});Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:1,bossPendingAction:'meridianRoad',bossTelegraphT:.001});G.state.bossCutscene=null;G.updateEnemies(.01);return {...r,e};}
function step(r,seconds){for(let t=0;t<seconds;t+=.025){r.step(.025);r.drain();}}
function walk(r,x,y){const p=r.G.state.player;for(let i=0;i<200&&Math.hypot(x-p.x,y-p.y)>2;i++){const dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy);r.G.input.vec={x:dx/d,y:dy/d};r.step(.025);r.drain();}r.G.input.vec={x:0,y:0};assert.ok(Math.hypot(x-p.x,y-p.y)<=2,'actual feet reach the chosen route');}
function freeHit(r,at,seconds=.25){const {G}=r,p=G.state.player,dx=at.x-p.x,dy=at.y-p.y,d=Math.hypot(dx,dy)||1;p.dir={x:dx/d,y:dy/d};G.input.takeAim=()=>({x:dx/d,y:dy/d,dragged:true});r.taps.add('a');step(r,seconds);}
test('Meridian’s real paired roads divert the continuing bead and restore an actual walking crossing',()=>{
 const r=setup(),{G,e}=r,p=G.state.player,fault=G.state.bossHazards.find(h=>h.kind==='atlasFault'),silk=G.state.bossHazards.find(h=>h.kind==='silkRoute');assert.ok(fault&&silk,'both actual parent lessons must be present, not a graphic rotation');let credit=0;const counters=[];G.events.on('hit',()=>credit++);G.events.on('kill',()=>credit++);G.events.on('guardianCounter',v=>counters.push(v.guardian));
 const knot=G.state.enemies.find(a=>G.guardianPropLive(a)&&a.def.name==='Silk connection knot'),stone=fault.stones[0];walk(r,knot.x-14,knot.y);freeHit(r,knot);assert.equal(silk.silk.nodes[0].choice,1);assert.equal(silk.silk.pulse.node,-1,'the incoming segment keeps its committed destination');
 walk(r,stone.x-14,stone.y);freeHit(r,stone);assert.equal(e.atlasRepairs,1);const gap=fault.gaps[0],x=(gap.left+gap.right)/2,y=knot.y;walk(r,x-30,y);
 for(let i=0;i<300&&!silk.silk.nodes[0].committed;i++)step(r,.025);assert.ok(silk.silk.nodes[0].committed);assert.ok(fault.gaps[0].open);assert.equal(G.world.solid(x,y),false);assert.equal(G.world.solid(x,gap.bottom-2),true,'a repaired patch leaves the other real gap');const start={x:p.x,y:p.y};walk(r,x+24,y);assert.ok(Math.hypot(p.x-start.x,p.y-start.y)>45);assert.ok(G.state.bossHazards.includes(silk)&&!silk.silk.finished,'the sister bead continues while actual feet use the released crossing');assert.equal(p.damageTaken,0);assert.equal(p.mana,0);assert.equal(e.hp,82);assert.equal(e.ward.hp,10);assert.equal(e.bossStaggerT||0,0);assert.equal(credit,0);assert.deepEqual(counters,['godAvatar','godAvatar']);
});

test('the chosen sister strand removes a real bead collision from the rebuilt crossing without granting immunity',()=>{
 for(const divert of [false,true]){const r=setup(),{G,e}=r,p=G.state.player,fault=G.state.bossHazards.find(h=>h.kind==='atlasFault'),silk=G.state.bossHazards.find(h=>h.kind==='silkRoute'),stone=fault.stones[0],knot=G.state.enemies.find(a=>G.guardianPropLive(a)&&a.def.name==='Silk connection knot');
  if(divert){walk(r,knot.x-14,knot.y);freeHit(r,knot);}walk(r,stone.x-14,stone.y);freeHit(r,stone);const x=(fault.gaps[0].left+fault.gaps[0].right)/2;walk(r,x,knot.y);assert.equal(G.world.solid(x,knot.y),false);p.invuln=0;
  for(let i=0;i<450&&!silk.silk.finished;i++)step(r,.025);assert.equal(silk.silk.finished,true);assert.equal(p.damageTaken,divert?0:1,'actual branch contact determines the outcome on the same rebuilt floor');assert.equal(e.hp,82);assert.equal(e.ward.hp,10);assert.equal(e.atlasRepairs,1);
 }
});

test('turned and linked pairs retain rebuilt footing and complete real choices under independent help',()=>{
 for(const help of [false,true]){const r=setup(),{G,e}=r,p=G.state.player;G.setComfortSetting('bossAssistance',help);const first=G.state.bossHazards.find(h=>h.kind==='atlasFault'),stone=first.stones[0];walk(r,stone.x-14,stone.y);freeHit(r,stone);const x=(first.gaps[0].left+first.gaps[0].right)/2;assert.equal(e.atlasRepairs,1);
  for(const phase of [2,3]){e.hp=phase===2?50:25;G.updateEnemies(.01);r.drain();assert.equal(e.bossPhase,phase);Object.assign(e,{bossPendingAction:'meridianRoad',bossTelegraphT:.001});G.updateEnemies(.01);const fault=G.state.bossHazards.find(h=>h.kind==='atlasFault'),silk=G.state.bossHazards.find(h=>h.kind==='silkRoute');assert.ok(fault&&silk,`actual phase${phase} must contain the learned pair`);assert.equal(fault.vertical,phase!==2);assert.equal(fault.gaps.length,phase===3?2:1);assert.equal(silk.silk.nodes.length,phase===3?2:1);assert.equal(fault.warning,help?1.8:1.5);assert.equal(silk.warning,help?1.8:1.5);assert.ok(fault.warning+fault.active>=silk.warning+silk.active);assert.ok(e.bossRecoverT>silk.warning+silk.active,'recovery covers the full actual paired phrase');
   step(r,fault.warning+.05);assert.equal(G.world.solid(x,136),false,'the previous actual stone patch remains usable across both kinds of crack');const props=G.state.enemies.filter(a=>G.guardianPropLive(a)&&a.def.name==='Silk connection knot');assert.equal(props.length,phase===3?4:2);assert.ok(props.every(at=>!G.world.solid(at.x,at.y)),'all remaining knots stand on actual usable floor');
  }
  assert.equal(e.atlasRepairs,1);assert.equal(p.mana,0);
 }
});

test('all24 actual earned worn bodies answer both paired lessons with their own free basic at zero mana',()=>{
 for(const form of runtime().G.formOrder){const r=setup(form),{G,e}=r,p=G.state.player,fault=G.state.bossHazards.find(h=>h.kind==='atlasFault'),silk=G.state.bossHazards.find(h=>h.kind==='silkRoute'),knot=G.state.enemies.find(a=>G.guardianPropLive(a)&&a.def.name==='Silk connection knot'),stone=fault.stones[0];let credit=0;for(const name of ['hit','kill'])G.events.on(name,()=>credit++);
  walk(r,knot.x-14,knot.y);freeHit(r,knot,.6);assert.equal(silk.silk.nodes[0].choice,1,form);if(!e.atlasRepairs){walk(r,stone.x-14,stone.y);freeHit(r,stone,.6);}assert.equal(e.atlasRepairs,1,form);const x=(fault.gaps[0].left+fault.gaps[0].right)/2;walk(r,x-30,knot.y);for(let i=0;i<250&&!silk.silk.nodes[0].committed;i++)step(r,.025);walk(r,x+24,knot.y);assert.ok(G.state.bossHazards.includes(fault)&&!silk.silk.finished,form+' completes actual crossing during the continuing pair');assert.equal(p.damageTaken,0,form);assert.equal(p.mana,0,form);assert.equal(e.hp,82,form);assert.equal(e.ward.hp,10,form);assert.equal(credit,0,form);
 }
});

test('a guardian beside the near-bank knot uses the clear opposite bank instead of silently dropping the pair',()=>{
 const r=setup(),{G,e}=r;G.cancelBossHazards(e);Object.assign(e,{x:363,y:151,hp:24,bossPhase:3,bossPendingAction:'meridianRoad',bossTelegraphT:.001});Object.assign(G.state.player,{x:368,y:191});G.updateEnemies(.01);assert.ok(G.state.bossHazards.some(h=>h.kind==='atlasFault'&&!h.cancelled));assert.ok(G.state.bossHazards.some(h=>h.kind==='silkRoute'),'the actual other bank has room for both connected choices');
});

test('actual defeat, knockout, travel and reload retire both lessons and leave the original floor and saved gift contract intact',()=>{
 for(const leave of ['defeat','knockout','travel','reload']){const r=setup(),{G,e}=r,p=G.state.player,grid=JSON.stringify(G.state.grid),fault=G.state.bossHazards.find(h=>h.kind==='atlasFault'),stone=fault.stones[0];walk(r,stone.x-14,stone.y);freeHit(r,stone);assert.equal(e.atlasRepairs,1);const props=G.state.enemies.filter(a=>a.guardianProp?.owner===e);
  if(leave==='defeat'){G.combat.damageEnemy(e,{ability:'curse',damage:10,type:'dark',noMana:true});G.combat.damageEnemy(e,{ability:'curse',damage:100,type:'dark',noMana:true});r.drain();assert.ok(e.dead);assert.ok(G.groundRewardFor('god-spark'));assert.equal(G.state.items.includes('god-spark'),false);G.saveGame();assert.ok(G.loadSaveData().groundRewards.some(g=>g.item==='god-spark'));}
  if(leave==='knockout'){p.invuln=0;G.damagePlayer(100,e.x,e.y);assert.ok(G.state.knockout);}
  if(leave==='travel')r.load('overworld');
  if(leave==='reload'){G.saveGame();assert.equal(G.loadSaveData().meridianRoad,undefined);r.load('godTrial');r.drain();}
  G.updateOpening(.01);G.updateBossHazards(.01);assert.ok(props.every(a=>!G.guardianPropLive(a)));assert.equal(G.atlasGapBlocked(316,160),false);assert.ok(!G.state.bossHazards.some(h=>h.owner===e));if(leave!=='travel')assert.equal(JSON.stringify(G.state.grid),grid);
 }
});

test('the actual moving bead stays visible above rebuilt ground and its own crack paint',()=>{
 const r=setup(),{G}=r,fault=G.state.bossHazards.find(h=>h.kind==='atlasFault'),silk=G.state.bossHazards.find(h=>h.kind==='silkRoute'),stone=fault.stones[0];walk(r,stone.x-14,stone.y);freeHit(r,stone);walk(r,270,100);const x=(fault.gaps[0].left+fault.gaps[0].right)/2;
 for(let i=0;i<400&&!(silk.silk.nodes[0].committed&&Math.abs(silk.silk.pulse.x-x)<2&&silk.silk.pulse.y<125);i++)step(r,.025);assert.ok(silk.silk.nodes[0].committed);assert.ok(Math.abs(silk.silk.pulse.x-x)<2);const make=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']})).createCanvas,c=make(448,272),ctx=c.getContext('2d');G.drawBossHazards(ctx);const at=silk.silk.pulse,bead=[...ctx.getImageData(Math.round(at.x),Math.round(at.y-4),1,1).data],ground=[...ctx.getImageData(Math.round(at.x),Math.round(at.y+8),1,1).data];assert.equal(bead[3],255);assert.ok(bead[0]+bead[1]+bead[2]>ground[0]+ground[1]+ground[2]+50,'the real bright bead remains distinct from the stone under it');
});
