'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup({phase=1,help=false,form='knight'}={}){
 const r=runtime(),{G}=r;Object.assign(G.state.opening,{started:true,complete:true});G.state.delivery.complete=true;G.state.claimedForms.push(form);if(form==='god'){G.state.worldwake.marks=['sky','stone','thread','echo','light','heart'];G.state.items.push('god-spark');G.questsDone.push(...G.formOrder.filter(id=>id!=='god').slice(0,8).flatMap((id,i)=>G.forms[id].quests.slice(0,i<3?4:2).map(q=>q.id)));}G.setForm(form);assert.equal(G.state.formId,form);r.load('sunkenMarsh');r.drain();
 const e=G.state.enemies.find(e=>e.id==='mireQueen');G.state.enemies=[e];G.state.bossCutscene=null;
 G.setComfortSetting('bossAssistance',help);Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),queenRippling:true,bossPendingAction:'mireBubbles',bossTelegraphT:.001});
 Object.assign(G.state.player,{x:164,y:152,mana:0,manaRegenDelay:1000,invuln:0});G.updateEnemies(.01);
 G.state.player.x=182;G.updateBossHazards(.9+(phase-1)*.22+.35+(help?.3:0)+.001);return {...r,e};
}
function step(r,seconds){for(let t=0;t<seconds;t+=.025){r.step(.025);r.drain();}}
function walk(r,x,y){const {G}=r,p=G.state.player;for(let i=0;i<200&&Math.hypot(x-p.x,y-p.y)>2;i++){const dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy);G.input.vec={x:dx/d,y:dy/d};r.step(.025);r.drain();}G.input.vec={x:0,y:0};assert.ok(Math.hypot(x-p.x,y-p.y)<=2);}
test('baiting the committed ripple onto a real channel blooms wider useful ground only at impact',()=>{
 const r=setup(),{G,e}=r,p=G.state.player,ripple=G.state.bossHazards.find(h=>h.mireRipple);
 assert.equal(ripple.kind,'mirePool');assert.equal(ripple.mireCommitted,false);
 p.dir={x:-1,y:0};r.taps.add('a');step(r,.5);assert.equal(e.mireCounters,1);const ward=e.ward.hp,hp=e.hp;
 walk(r,140,152);assert.equal(G.mireShelters({x:140,y:176},e),false);
 for(let i=0;i<150&&!ripple.mireCommitted;i++)step(r,.025);assert.equal(ripple.mireCommitted,true);assert.ok(Math.abs(ripple.x-140)<=2);assert.equal(ripple.y,152);
 const at={x:ripple.x,y:ripple.y};walk(r,140,176);assert.equal(ripple.x,at.x);assert.equal(ripple.y,at.y);assert.equal(G.mireShelters(p,e),false,'a warning grants no wider shelter');
 for(let i=0;i<100&&!e.mireChannel.bloom;i++)step(r,.025);
 assert.ok(e.mireChannel.bloom);assert.equal(G.mireShelters(p,e),true);assert.equal(p.damageTaken,0);assert.equal(e.ward.hp,ward);assert.equal(e.hp,hp);assert.equal(e.bossStaggerT||0,0);assert.equal(p.mana,0);
 Object.assign(e,{bossPendingAction:'mireVolley',bossTelegraphT:.001});G.updateEnemies(.01);G.updateBossHazards(.86);assert.ok(G.state.projectiles.some(s=>s.owner===e));for(let i=0;i<160;i++)G.combat.updateProjectiles(.01);assert.equal(p.damageTaken,0,'the actual middle reed is sheltered on the wider bloom');
});

test('a real channel replacement before impact cannot turn an old commitment into a new bloom',()=>{
 const r=setup(),{G,e}=r,p=G.state.player,ripple=G.state.bossHazards.find(h=>h.mireRipple);
 p.dir={x:-1,y:0};r.taps.add('a');step(r,.5);walk(r,140,152);for(let i=0;i<150&&!ripple.mireCommitted;i++)step(r,.025);
 const original=e.mireChannel;G.leaveMireCrust({owner:e,mireAftermath:{x:164,y:152}});
 const crust=G.state.enemies.find(z=>!z.dead&&z.mireCrust?.owner===e);G.combat.damageEnemy(crust,{damage:1,type:'sharp',ability:'slash'});assert.notEqual(e.mireChannel,original);
 step(r,1.1);assert.equal(e.mireChannel.bloom,undefined);assert.equal(G.mireShelters({x:140,y:176},e),false);
});

test('a later ripple cannot walk its bloom away from the original narrow channel',()=>{
 const r=setup(),{G,e}=r,p=G.state.player; p.dir={x:-1,y:0};r.taps.add('a');step(r,.5);walk(r,140,152);
 const first=G.state.bossHazards.find(h=>h.mireRipple);for(let i=0;i<200&&!e.mireChannel.bloom;i++)step(r,.025);assert.ok(e.mireChannel.bloom);
 const original={...e.mireChannel.bloom};step(r,.5);
 Object.assign(p,{x:140,y:174});Object.assign(e,{bossPendingAction:'mireBubbles',bossTelegraphT:.001});G.updateEnemies(.01);
 const next=G.state.bossHazards.find(h=>h.mireRipple&&h!==first);assert.ok(next);for(let i=0;i<220&&!next.mireBloomed;i++)step(r,.025);
 assert.equal(next.mireBloomed,true);assert.deepEqual({...e.mireChannel.bloom},original,'a wider pool cannot recursively seed another wider pool');
});


test('primary bubbles finish before actual preparation and a single helped fixed warning in every phase',()=>{
 for(const phase of [1,2,3])for(const help of [false,true]){
  const r=setup({phase,help}),{G,e}=r,h=G.state.bossHazards.find(h=>h.mireRipple),p=G.state.player;
  assert.equal(G.state.bossHazards.filter(z=>!z.mireRipple).length,0);assert.equal(h.warning,help?1.25:.95);assert.equal(h.mireCommitted,false);
  p.dir={x:-1,y:0};r.taps.add('a');step(r,.5);assert.ok(e.mireChannel);walk(r,140,152);assert.equal(h.mireCommitted,false,'the slow body gets a real preparation interval');
  for(let i=0;i<150&&!h.mireCommitted;i++)step(r,.025);const x=h.x,y=h.y;walk(r,140,176);assert.equal(h.x,x);assert.equal(h.y,y);
  for(let i=0;i<100&&!e.mireChannel.bloom;i++)step(r,.025);assert.ok(e.mireChannel.bloom);assert.equal(p.damageTaken,0);assert.equal(e.bossPendingAction,null);assert.ok(e.bossRecoverT>0);
 }
});

test('bloom shelter and paint cannot cross a real solid bank to disconnected floor',()=>{
 const r=setup(),{G,e}=r,p=G.state.player;p.dir={x:-1,y:0};r.taps.add('a');step(r,.5);
 // Supply one native vertical-channel geometry; the free crust break and
 // ripple impact still own growth. The wall is an actual world-cell fixture.
 G.cancelMireCrusts(e);Object.assign(e,{x:156,y:104});G.leaveMireCrust({owner:e,mireAftermath:{x:156,y:164}});
 const crust=G.state.enemies.find(z=>!z.dead&&z.mireCrust?.owner===e);G.combat.damageEnemy(crust,{damage:1,type:'sharp',ability:'slash'});
 Object.assign(p,{x:169,y:140});for(let i=0;i<200&&!e.mireChannel.bloom;i++)step(r,.025);assert.ok(e.mireChannel.bloom);
 G.state.grid[8][11]={...G.state.grid[8][11],tile:'rock'};assert.equal(G.world.isSafeSpawn(197,140),true);assert.equal(G.mireShelters({x:197,y:140},e),false);
 const canvas=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']})).createCanvas(256,256),ctx=canvas.getContext('2d');G.drawMireChannels(ctx);
 assert.equal(ctx.getImageData(197,140,1,1).data[3],0,'paint and shelter both stop across the bank');
});


test('all24 actual earned worn bodies keep a free crust answer and time to lead a real bloom',()=>{
 for(const form of Object.keys(runtime().G.forms)){
  const r=setup({form}),{G,e}=r,p=G.state.player,h=G.state.bossHazards.find(h=>h.mireRipple);let credit=0;for(const event of ['hit','kill'])G.events.on(event,()=>credit++);
  p.dir={x:-1,y:0};G.input.takeAim=()=>({x:-1,y:0,dragged:true});r.taps.add('a');step(r,.55);assert.equal(e.mireCounters,1,form);
  walk(r,140,152);assert.equal(h.mireCommitted,false,form);for(let i=0;i<150&&!h.mireCommitted;i++)step(r,.025);walk(r,140,176);for(let i=0;i<100&&!e.mireChannel.bloom;i++)step(r,.025);
  assert.ok(e.mireChannel.bloom,form);assert.equal(G.mireShelters(p,e),true,form);assert.equal(p.damageTaken,0,form);assert.equal(p.mana,0,form);assert.equal(credit,0,form);assert.equal(e.hp,36,form);assert.equal(e.ward.hp,5,form);
 }
});

test('a bloom keeps native ownership and retires on replacement, phase, death, knockout or travel',()=>{
 for(const action of ['foreign','replace','phase','death','knockout','travel','reload']){
  const r=setup(),{G,e}=r,p=G.state.player;p.dir={x:-1,y:0};r.taps.add('a');step(r,.5);walk(r,140,152);for(let i=0;i<200&&!e.mireChannel.bloom;i++)step(r,.025);assert.ok(e.mireChannel.bloom);walk(r,140,176);assert.ok(G.mireShelters(p,e));
  if(action==='foreign'){
   Object.assign(e,{bossPendingAction:'mireVolley',bossTelegraphT:.001});G.updateEnemies(.01);G.updateBossHazards(.86);const shots=G.state.projectiles.filter(s=>s.owner===e);assert.equal(shots.length,3);for(const s of shots)s.owner=G.makeEnemy('slime',e.x,e.y);for(let i=0;i<160;i++)G.combat.updateProjectiles(.01);assert.ok(p.damageTaken>0);continue;
  }
  if(action==='replace'){G.leaveMireCrust({owner:e,mireAftermath:{x:164,y:152}});const crust=G.state.enemies.find(z=>!z.dead&&z.mireCrust?.owner===e);G.combat.damageEnemy(crust,{damage:1,type:'sharp',ability:'slash'});assert.equal(e.mireChannel.bloom,undefined);}
  if(action==='phase'){e.hp=20;G.updateEnemies(.01);r.drain();}
  if(action==='death'){e.ward.hp=0;G.combat.damageEnemy(e,{damage:100,type:'dark',ability:null,noMana:true});}
  if(action==='knockout'){p.invuln=0;G.damagePlayer(100,e.x,e.y);assert.ok(G.state.knockout);}
  if(action==='travel')r.load('overworld');
  if(action==='reload'){G.saveGame();assert.equal(JSON.stringify(G.loadSaveData()).includes('mireChannel'),false);r.load('sunkenMarsh');assert.ok(G.state.enemies.every(z=>!z.mireChannel));assert.equal(G.mireShelters({x:140,y:176},G.state.enemies.find(z=>z.id==='mireQueen')),false);continue;}
  assert.equal(G.mireShelters({x:140,y:176},e),false,action);
 }
});
