'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(phase=1){
 const r=runtime(),{G}=r;Object.assign(G.state.opening,{started:true,complete:true});G.state.delivery.complete=true;G.state.claimedForms.push('wizard');G.setForm('wizard');r.load('druidTrial');r.drain();
 const e=G.state.enemies.find(e=>e.id==='grandmotherBriar');G.state.enemies=[e];G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),bossPendingAction:'gardenBeds',bossTelegraphT:.001});
 Object.assign(G.state.player,{x:e.x-64,y:e.y,mana:0,manaRegenDelay:100,invuln:0});G.updateEnemies(.01);return {...r,e};
}
test('a native free cut keeps its bed clear through later blooms while the rest of the garden continues',()=>{
 const r=setup(),{G,e}=r,bed=G.state.bossHazards[0],others=G.state.bossHazards.slice(1),hp=e.hp,ward=e.ward.hp;
 const bud=G.state.enemies.find(a=>a.guardianProp?.owner===e&&Math.hypot(a.x-bed.x,a.y-bed.y)<1);assert.ok(bud,'a planted bud is a real native attack target');
 Object.assign(G.state.player,{x:bud.x+18,y:bud.y,dir:{x:-1,y:0}});r.taps.add('a');for(let i=0;i<8;i++){r.step(.025);r.drain();}
 assert.equal(bud.dead,true);assert.equal(e.hp,hp);assert.equal(e.ward.hp,ward);assert.equal(e.bossStaggerT||0,0);assert.ok(others.some(h=>G.state.bossHazards.includes(h)));
 G.state.player.x=bed.x;G.state.player.y=bed.y;const damage=G.state.player.damageTaken;G.updateBossHazards(2);assert.equal(G.state.player.damageTaken,damage);
 Object.assign(e,{bossPendingAction:'gardenBeds',bossTelegraphT:.001});G.updateEnemies(.01);
 assert.equal(G.state.bossHazards.some(h=>h.owner===e&&Math.hypot(h.x-bed.x,h.y-bed.y)<1),false,'a later pulse preserves the chosen gap');
 assert.ok(G.state.bossHazards.some(h=>h.owner===e));
});
test('unpruned flowers still hurt, phase-two sides alternate, and phase-three blooms roll around fixed beds',()=>{
 for(const phase of [1,2,3])for(const help of [false,true]){
  const r=setup(phase),{G,e}=r;G.setComfortSetting('bossAssistance',help);
  const first=[...G.state.bossHazards],at=first[0];Object.assign(G.state.player,{x:at.x,y:at.y});const damage=G.state.player.damageTaken;
  G.updateBossHazards(at.warning+.001);assert.equal(G.state.player.damageTaken,damage+1);
  const locations=G.state.enemies.filter(a=>a.guardianProp?.owner===e).map(a=>({x:a.x,y:a.y}));
  G.state.player.x=e.x;G.state.player.y=e.y;G.updateBossHazards(3);
  Object.assign(e,{bossPendingAction:'gardenBeds',bossTelegraphT:.001});G.updateEnemies(.01);
  const second=G.state.bossHazards;
  if(phase===2)assert.ok(second.every(h=>first.every(a=>Math.hypot(a.x-h.x,a.y-h.y)>1)),'the other side blooms next');
  if(phase===3)assert.ok(second.at(-1).warning>second[0].warning,'the bloom travels around fixed beds');
  assert.ok(second.every(h=>locations.some(a=>Math.hypot(a.x-h.x,a.y-h.y)<1)));
  for(const h of second)assert.ok(h.warning>=1.1+(help?.3:0));
 }
});
test('harmless practice saves a pruned flower while Acorn, Hedgehare and its return stay ahead of chosen practice',()=>{
 const r=runtime(),{G}=r;Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.delivery.complete=true;G.state.items.push('trophy-mire-pearl');G.ensureTown().requests.push('beacon');r.load('druidTrial');r.drain();
 const bud=G.state.enemies.find(e=>e.guardianProp&&!e.guardianProp.owner);assert.ok(bud);
 Object.assign(G.state.player,{x:bud.x+18,y:bud.y,dir:{x:-1,y:0},mana:0,manaRegenDelay:100});r.taps.add('a');for(let i=0;i<10;i++){r.step(.025);r.drain();}
 assert.equal(bud.dead,true);assert.equal(G.state.player.mana,0);assert.ok(G.loadSaveData().guardianChallenges.briar.practicePruned);
 G.state.items.push('elder-acorn');r.load('druidTrial');r.drain();assert.ok(G.briarCompanionVisible());assert.equal(G.briarVisitReady(),false);assert.equal(G.beginBriarRematch(),false);
 G.state.claimedForms.push('druid');G.state.formOutings.active={formId:'druid',scenes:[],arts:[]};assert.equal(G.briarVisitReady(),false);G.state.formOutings.active=null;
 assert.ok(G.briarVisitReady(),JSON.stringify({side:G.systemIntroduced('sideAdventures'),claimed:G.state.claimedForms,out:G.activeFormOuting(),promise:G.formReturnPromise(),o:G.state.opening,items:G.state.items}));const at={x:G.state.player.x,y:G.state.player.y};assert.ok(G.beginBriarRematch());const e=G.state.enemies.find(e=>!e.dead&&e.briarLocalRematch);
 assert.equal(e.hp,74);assert.equal(e.ward.hp,8);assert.deepEqual({x:G.state.player.x,y:G.state.player.y},at);assert.equal(e.guardianPracticeExit.map,'druidTrial');
});
test('native free basics prune at zero mana across all24 forms without fake hit, mana or ward credit',()=>{
 for(const form of Object.keys(runtime().G.forms)){
  const r=setup(),{G,e}=r;G.state.claimedForms.push(form);if(form==='god'){G.state.worldwake.marks=['sky','stone','thread','echo','light','heart'];G.state.items.push('god-spark');G.questsDone.push(...G.formOrder.filter(id=>id!=='god').slice(0,8).flatMap((id,i)=>G.forms[id].quests.slice(0,i<3?4:2).map(q=>q.id)));}G.setForm(form);assert.equal(G.state.formId,form);const bud=G.state.enemies.find(a=>a.guardianProp?.owner===e);
  let credit=0;G.events.on('hit',()=>credit++);G.events.on('kill',()=>credit++);Object.assign(G.state.player,{x:bud.x+18,y:bud.y,dir:{x:-1,y:0},mana:0,manaRegenDelay:100});
  r.taps.add('a');for(let i=0;i<28;i++){r.step(.025);r.drain();}
  assert.ok(bud.dead,form);assert.equal(e.hp,e.def.hp,form);assert.equal(e.ward.hp,8,form);assert.equal(G.state.player.mana,0,form);assert.equal(credit,0,form);
 }
});
test('ordinary ward recovery preserves pruning, while phase, actual defeat, knockout and travel retire owned beds',()=>{
 for(const action of ['ward','phase','death','knockout','travel']){
  const r=setup(),{G,e}=r,bud=G.state.enemies.find(a=>a.guardianProp?.owner===e);
  G.combat.damageEnemy(bud,{damage:1,type:'dark',ability:'curse'});const at={x:bud.x,y:bud.y};
  if(action==='ward'){G.combat.damageEnemy(e,{damage:8,type:'dark',ability:'curse',noMana:true});assert.equal(e.ward.hp,0);Object.assign(e,{bossStaggerT:0,bossPendingAction:'gardenBeds',bossTelegraphT:.001});G.updateEnemies(.01);assert.ok(G.state.bossHazards.every(h=>Math.hypot(h.x-at.x,h.y-at.y)>1));continue;}
  if(action==='phase'){e.hp=45;G.updateEnemies(.01);r.drain();}
  if(action==='death'){e.ward.hp=0;G.combat.damageEnemy(e,{damage:100,type:'dark',ability:null,noMana:true});assert.equal(G.loadSaveData().guardianChallenges.briar.bestPrunes,1);}
  if(action==='knockout'){G.state.player.invuln=0;G.damagePlayer(100,e.x,e.y);assert.ok(G.state.knockout);assert.equal(G.state.guardianChallenges.briar.bestPrunes,0);}
  if(action==='travel')r.load('shattercoast');
  assert.ok(G.state.enemies.filter(a=>a.guardianProp?.owner===e).every(a=>!G.guardianPropLive(a)));
 }
});
