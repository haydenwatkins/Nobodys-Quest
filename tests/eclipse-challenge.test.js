'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup({phase=1,crescent=false,form='nobody',help=false}={}){
 const r=runtime(),{G}=r;G.state.claimedForms.push(form,'wizard');G.setForm(form);r.load('emberRidge');r.drain();const e=G.state.enemies.find(e=>e.id==='eclipseKnight');G.state.enemies=[e];G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),knightCrescent:crescent,bossPattern:0,bossSpecialT:0,bossRecoverT:0});
 G.setComfortSetting('bossAssistance',help);Object.assign(G.state.player,{x:e.x-20,y:e.y,dir:{x:1,y:0},mana:0,manaRegenDelay:100,damageTaken:0,invuln:0});G.updateEnemies(.01);return {...r,e};
}
test('western camp, all help switches and spare shield are quiet with every original regional foe',()=>{
 const r=runtime(),{G}=r;r.load('emberRidge');r.drain();assert.equal(G.state.enemies.filter(e=>!e.def.practice).length,7);assert.ok(G.state.grid[11][3].rest);
 const post=G.state.enemies.find(e=>e.eclipsePractice);
 for(const at of [...G.helpStations(),{x:post.x-18,y:post.y},{x:post.x+18,y:post.y},{x:post.x,y:post.y+18}]){
  assert.ok(G.world.isSafeSpawn(at.x,at.y));Object.assign(G.state.player,{x:at.x,y:at.y,damageTaken:0,invuln:0});for(let i=0;i<400;i++){r.step(.05);r.drain();}assert.equal(G.state.player.damageTaken,0,JSON.stringify(at));
 }
});
test('zero-mana native Slap rings safe practice, saves the light, and supplies no false credit',()=>{
 const r=runtime(),{G}=r;r.load('emberRidge');r.drain();const e=G.state.enemies.find(e=>e.eclipsePractice);let credit=0;for(const event of ['hit','kill','guardianCounter'])G.events.on(event,()=>credit++);
 Object.assign(G.state.player,{x:e.x-18,y:e.y,dir:{x:1,y:0},mana:0,manaRegenDelay:100});assert.equal(G.openingInteractionCandidate(),null);r.taps.add('a');for(let i=0;i<15;i++){r.step(.025);r.drain();}
 assert.ok(e.dead);assert.equal(credit,0);assert.equal(G.state.player.mana,0);assert.ok(G.loadSaveData().guardianChallenges.knight.practiceCleared);assert.equal(G.state.guardianChallenges.knight.counterLearned,false);
 r.load('emberRidge');assert.equal(G.state.enemies.some(e=>e.eclipsePractice),false);assert.equal(G.eclipseChallengeStation(),null);
});
test('free native basics ring raised shields at zero mana in every phase with slow and ranged bodies',()=>{
 for(const form of ['nobody','wizard','colossus'])for(const phase of [1,2,3]){
  const r=setup({form,phase}),{G,e}=r;assert.equal(e.bossPendingAction,'charge');assert.ok(e.bossTelegraphT>=1.1);const hp=e.hp,ward=e.ward.hp;let hits=0;G.events.on('hit',()=>hits++);
  r.taps.add('a');for(let i=0;i<25;i++){r.step(.025);r.drain();}
  assert.equal(e.eclipseCounters,1,form);assert.equal(e.hp,hp);assert.equal(e.ward.hp,ward);assert.equal(G.state.player.mana,0);assert.equal(hits,0);assert.equal(G.state.player.damageTaken,0);assert.ok(e.bossStaggerT>.9);assert.ok(G.loadSaveData().guardianChallenges.knight.counterLearned);
 }
});
test('shield only answers a real art during a charge commitment; Dark retains its ordinary ward use',()=>{
 const {G,e}=setup();assert.equal(G.hitEclipseShield(e,{damage:0,ability:'slap'}),false);assert.equal(G.hitEclipseShield(e,{damage:1,ability:null}),false);e.bossPendingAction='eclipseSweep';assert.equal(G.hitEclipseShield(e,{damage:1,ability:'slap'}),false);
 const ward=e.ward.hp;G.combat.damageEnemy(e,{damage:1,type:'blunt',ability:'slap'});assert.equal(e.ward.hp,ward);G.combat.damageEnemy(e,{damage:1,type:'dark',ability:'curse'});assert.equal(e.ward.hp,ward-1);assert.equal(e.eclipseCounters,undefined);
 e.bossPendingAction=null;e.bossTelegraphT=0;e.bossChargeT=.2;assert.ok(G.hitEclipseShield(e,{damage:1,ability:'slap'}));assert.equal(e.bossChargeT,0);assert.equal(e.bossContactActive,false);
});
test('chosen crescent follows an unanswered charge; ordinary charges and borrowed-run settings stay unchanged',()=>{
 for(const crescent of [false,true])for(const help of [false,true]){
  const {G,e}=setup({crescent,help});G.state.player.y+=60;G.updateEnemies(e.bossTelegraphT+.001);assert.equal(e.bossAfterCharge,crescent?'eclipseSweep':null);G.updateEnemies(e.def.boss.chargeDur+.001);
  const h=G.state.bossHazards.find(h=>h.owner===e);assert.equal(!!h,crescent);if(h){assert.equal(h.kind,'eclipseSweep');assert.equal(h.warning,help?1.15:.85);assert.ok(e.bossRecoverT>=h.warning+h.active+.64);assert.equal(G.state.player.damageTaken,0);}
 }
});
test('ringing the shield clears its follower and only its hostile shots; phases and travel retire the commitment',()=>{
 for(const action of ['counter','phase','cancel','travel']){
  const r=setup({crescent:true}),{G,e}=r;const hostile={owner:e,fromPlayer:false},friendly={owner:e,fromPlayer:true},other={owner:{},fromPlayer:false};G.state.projectiles.push(hostile,friendly,other);
  if(action==='counter'){G.combat.damageEnemy(e,{damage:1,ability:'slap',type:'blunt'});assert.ok(hostile.dispelled);assert.ok(!friendly.dispelled);assert.ok(!other.dispelled);assert.equal(e.bossAfterCharge,null);}
  if(action==='phase'){e.hp=e.def.hp*.6;G.updateEnemies(.01);r.drain();assert.equal(e.bossPendingAction,null);assert.equal(e.bossTelegraphT,0);}
  if(action==='cancel'){e.ward.hp=0;e.bossPendingAction='eclipseSweep';e.bossAfterCharge='eclipseSweep';G.combat.meleeArc(G.state.player,{range:32,arc:Math.PI*2,damage:1,type:'dark',ability:'curse',stagger:20});assert.equal(e.bossAfterCharge,null);assert.equal(e.bossPendingAction,null);}
  if(action==='travel'){r.load('overworld');assert.ok(!G.state.enemies.includes(e));}assert.equal(G.state.guardianChallenges.knight.crescentCleared,false);
 }
});
test('first Sigil return precedes invitation; choices save independently and start by walking',()=>{
 const r=runtime(),{G}=r;Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.delivery.complete=true;G.state.items.push('trophy-mire-pearl');G.ensureTown().requests.push('beacon');G.state.items.push('trophy-eclipse-sigil');G.state.guardianChallenges.knight.counterLearned=true;r.load('emberRidge');
 assert.equal(G.eclipseVisitReady(),false);assert.equal(G.beginEclipseRematch(),false);assert.equal(G.eclipseChallengeStation(),null);G.ensureTown().requests.push('ridge-watch');G.helpStationCandidate();assert.ok(G.helpStations().some(s=>s.kind==='eclipseChallenge'));
 Object.assign(G.state.player,{x:88,y:152});assert.equal(G.openingInteractionCandidate().id,'knight-rematch');assert.ok(G.tryOpeningInteraction());assert.ok(G.state.guardianChallenges.knight.invited);assert.ok(!G.eclipseRematchActive());r.drain();
 G.setComfortSetting('easyMode',true);G.setComfortSetting('bossAssistance',true);assert.ok(G.toggleEclipseCrescent());const at={x:G.state.player.x,y:G.state.player.y};assert.ok(G.beginEclipseRematch());const e=G.state.enemies.find(e=>!e.dead&&e.knightLocalRematch);assert.equal(e.hp,42);assert.equal(e.ward.hp,6);assert.ok(e.guardPost);assert.ok(e.knightCrescent);assert.equal(e.bossEngaged,false);assert.deepEqual({x:G.state.player.x,y:G.state.player.y},at);assert.equal(G.toggleEclipseCrescent(),false);assert.equal(G.state.guardianChallenges.knight.crescentCleared,false);
 for(let i=0;i<1200;i++){r.step(.05);r.drain();}assert.equal(G.state.player.damageTaken,0);assert.equal(e.bossEngaged,false);assert.ok(G.loadSaveData().guardianChallenges.knight.crescent);assert.ok(G.comfortSetting('easyMode'));assert.ok(G.comfortSetting('bossAssistance'));
});
test('legacy saves keep practice access; malformed profiles cannot enable an unlearned pattern',()=>{
 const r=runtime(),{G}=r;G.state.items.push('trophy-eclipse-sigil');r.load('emberRidge');assert.ok(G.eclipseVisitReady());assert.equal(G.eclipseCrescentLit(),false);
 assert.equal(G.normalizeGuardianChallenges({knight:{crescent:true}}).knight.crescent,false);const p=G.normalizeGuardianChallenges({knight:{counterLearned:true,crescent:true,bestCounters:12.9}}).knight;assert.equal(p.crescent,true);assert.equal(p.bestCounters,12);assert.equal(G.normalizeGuardianChallenges({knight:{bestCounters:Infinity}}).knight.bestCounters,0);
 G.state.gauntletRun={};assert.equal(G.beginEclipseRematch(),false);G.state.gauntletRun=null;G.state.expeditionRun={};assert.equal(G.beginEclipseRematch(),false);
});
test('only a chosen local victory records its crescent and pays no second gift',()=>{
 for(const [local,counters] of [[false,3],[true,3],[true,0]]){
  const {G,e,messages}=setup({crescent:true});G.state.items.push('trophy-eclipse-sigil');const stars=G.state.stars;e.knightLocalRematch=local;e.eclipseCounters=counters;e.ward.hp=0;G.combat.damageEnemy(e,{damage:100,type:'dark',ability:null,noMana:true});
  assert.ok(e.dead);assert.equal(G.state.guardianChallenges.knight.crescentCleared,local);assert.equal(G.loadSaveData().guardianChallenges.knight.bestCounters,counters);if(local&&!counters)assert.ok(messages.some(m=>m.text.includes('found your way around my crescent')));assert.equal(G.state.stars,stars);assert.equal(G.groundRewardFor('trophy-eclipse-sigil'),null);
 }
});
test('engaged failures retry at the camp with choices intact; ordinary mishaps are not Knight attempts',()=>{
 const {G,e,drain}=setup({crescent:true,help:true});G.state.items.push('trophy-eclipse-sigil');G.ensureTown().requests.push('ridge-watch');Object.assign(G.state.guardianChallenges.knight,{counterLearned:true,crescent:true});G.setComfortSetting('easyMode',true);G.damagePlayer(100,e.x,e.y);drain();assert.ok(G.state.knockout);G.updateKnockout(2);drain();assert.equal(G.state.mapId,'emberRidge');assert.equal(G.state.player.x,56);assert.equal(G.state.player.y,184);assert.equal(G.playerHp(),G.playerMaxHearts());assert.ok(!G.eclipseRematchActive());assert.ok(G.eclipseCrescentLit());assert.ok(G.comfortSetting('bossAssistance'));assert.ok(G.comfortSetting('easyMode'));assert.ok(G.beginEclipseRematch());
 const r=runtime();r.load('emberRidge');r.G.state.player.invuln=0;r.G.damagePlayer(100);assert.ok(!r.G.state.knockout);assert.equal(r.G.state.guidance.bossRetries.emberRidge,undefined);
});
test('every earned form has a native zero-mana basic answer to the shield',()=>{
 const r=runtime(),{G}=r;r.load('emberRidge');r.drain();G.state.claimedForms.push(...Object.keys(G.forms));G.input.takeAim=()=>({x:1,y:0,dragged:true});
 for(const form of Object.keys(G.forms)){
  G.setForm(form);const e=G.makeEnemy('eclipseKnight',376,152);Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPendingAction:'charge',bossTelegraphT:1.1,bossSpecialT:3});G.state.enemies=[e];G.state.bossCutscene=null;G.state.bossHazards=[];G.state.projectiles=[];
  Object.assign(G.state.player,{x:356,y:152,dir:{x:1,y:0},mana:0,manaRegenDelay:100,damageTaken:0,invuln:0,dashing:null});G.state.player.cooldowns={};r.taps.add('a');
  for(let i=0;i<32&&!e.eclipseCounters;i++){r.step(.025);r.drain();}
  assert.equal(e.eclipseCounters,1,form);assert.equal(G.state.player.mana,0,form);assert.equal(e.hp,42,form);assert.equal(e.ward.hp,6,form);assert.equal(G.state.player.damageTaken,0,form);
 }
});
