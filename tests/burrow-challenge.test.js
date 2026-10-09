'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup({phase=1,rumble=false,form='nobody',help=false}={}){
 const r=runtime(),{G}=r;G.state.claimedForms.push(form);G.setForm(form);r.load('moleTrial');r.drain();const e=G.state.enemies.find(e=>e.id==='moleMonarch');G.state.enemies=[e];G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),bramRootRumble:rumble,bossTelegraphT:.01,bossPendingAction:'royalStomp'});
 G.setComfortSetting('bossAssistance',help);Object.assign(G.state.player,{x:e.x-60,y:e.y,dir:{x:1,y:0},mana:0,manaRegenDelay:100,damageTaken:0,invuln:0});G.updateEnemies(.02);
 return {...r,e,plug:G.state.enemies.find(e=>e.burrowPlug)};
}
function pop(r){const {G,plug,e}=r,a=Math.atan2(plug.y-e.y,plug.x-e.x);Object.assign(G.state.player,{x:plug.x+Math.cos(a)*20,y:plug.y+Math.sin(a)*20,dir:{x:-Math.cos(a),y:-Math.sin(a)}});const aim={...G.state.player.dir,dragged:true};G.input.takeAim=()=>({...aim});r.taps.add('a');G.input.vec={x:Math.cos(a),y:Math.sin(a)};}
test('quiet camp and native harmless practice leave a saved mushroom without lesson, kill or mana credit',()=>{
 const r=runtime(),{G}=r;r.load('moleTrial');r.drain();assert.ok(G.state.grid[11][3].rest);assert.equal(G.helpStations().length,3);
 for(const s of G.helpStations()){assert.ok(G.world.isSafeSpawn(s.x,s.y));Object.assign(G.state.player,{x:s.x,y:s.y,damageTaken:0});for(let i=0;i<400;i++){r.step(.05);r.drain();}assert.equal(G.state.player.damageTaken,0);}
 let credit=0;for(const event of ['hit','kill','guardianCounter'])G.events.on(event,()=>credit++);const root=G.state.enemies.find(e=>e.burrowPlug);
 Object.assign(G.state.player,{x:root.x-18,y:root.y,dir:{x:1,y:0},mana:0,manaRegenDelay:100});G.input.vec={x:0,y:0};G.input.takeAim=()=>({x:1,y:0,dragged:true});r.taps.add('a');for(let i=0;i<10&&!root.dead;i++)r.step(.025);assert.ok(root.dead);assert.equal(credit,0);assert.equal(G.state.player.mana,0);assert.equal(G.state.player.damageTaken,0);assert.ok(G.loadSaveData().guardianChallenges.bram.practiceCleared);assert.equal(G.state.guardianChallenges.bram.counterLearned,false);
 r.load('moleTrial');assert.ok(!G.state.enemies.some(e=>e.burrowPlug));
});
test('all 24 earned bodies pop a real stomp through native free basics; every phase leaves Blunt useful',()=>{
 for(const form of Object.keys(runtime().G.forms))for(const phase of form==='nobody'?[1,2,3]:[1]){
  const r=setup({form,phase}),{G,e,plug}=r,hp=e.hp,ward=e.ward.hp;assert.ok(plug,form);pop(r);
  for(let i=0;i<30&&!e.burrowCounters;i++){r.step(.025);r.drain();}
  assert.equal(e.burrowCounters,1,form);assert.ok(plug.dead);assert.ok(e.bossStaggerT>1.4,form);assert.equal(G.state.player.mana,0,form);assert.equal(G.state.player.damageTaken,0,form);assert.equal(G.state.bossHazards.length,0);assert.ok(G.loadSaveData().guardianChallenges.bram.counterLearned);if(form==='nobody'){assert.equal(e.hp,hp);assert.equal(e.ward.hp,ward);}
 }
});
test('walking out remains valid in all phases and unused plugs remain useful for a later burrow',()=>{
 for(const phase of [1,2,3]){const r=setup({phase}),{G,e,plug}=r;G.state.player.y+=65;for(let i=0;i<60;i++){r.step(.025);r.drain();}assert.equal(G.state.player.damageTaken,0);assert.equal(e.burrowCounters,undefined);assert.ok(!plug.dead);assert.equal(G.state.bossHazards.length,0);assert.equal(G.state.guardianChallenges.bram.counterLearned,false);}
});
test('native committed burrowing catches intact and loosened old plugs before contact or a follow-up stomp',()=>{
 for(const broken of [false,true])for(const phase of [1,2,3]){
  const r=setup({phase}),{G,e,plug}=r;G.state.player.y+=65;for(let i=0;i<60;i++){r.step(.025);r.drain();}
  if(broken){G.combat.damageEnemy(plug,{damage:1,ability:'slap'});assert.ok(plug.burrowPlug.broken);assert.equal(e.burrowCounters,undefined);}
  Object.assign(G.state.player,{x:plug.x-50,y:plug.y});e.bossRecoverT=0;e.bossSpecialT=100;e.bossTelegraphT=.01;e.bossPendingAction='burrow';e.bossChargeX=-1;e.bossChargeY=0;
  for(let i=0;i<25&&!e.burrowCounters;i++){r.step(.025);r.drain();}
  assert.equal(e.burrowCounters,1);assert.ok(plug.dead);assert.equal(e.bossChargeT,0);assert.equal(e.bossAfterCharge,null);assert.equal(G.state.player.damageTaken,0);assert.equal(G.state.bossHazards.length,0);
 }
});
test('Root Rumble keeps a full breather and committed second circle with help; either circle can still be answered',()=>{
 for(const help of [false,true]){
  const r=setup({rumble:true,help}),{G,e,plug}=r,[primary,follow]=G.state.bossHazards;
  assert.equal(primary.warning,help?1.15:.85);assert.equal(follow.warning,help?1.2:.9);assert.ok(follow.delay>=primary.warning+primary.active+.44);assert.ok(e.bossRecoverT>=follow.delay+follow.warning+follow.active+.64);
  const x=follow.x,y=follow.y;G.state.player.y+=65;for(let i=0;i<Math.ceil(follow.delay/.025)+1;i++){r.step(.025);r.drain();}
  assert.equal(follow.x,x);assert.equal(follow.y,y);assert.ok(G.state.bossHazards.includes(follow));assert.ok(!G.state.bossHazards.includes(primary));
  G.combat.damageEnemy(plug,{damage:1,ability:'slap'});assert.equal(e.burrowCounters,1);assert.equal(G.state.bossHazards.length,0);
 }
 const r=setup({rumble:true});pop(r);for(let i=0;i<30&&!r.e.burrowCounters;i++){r.step(.025);r.drain();}assert.equal(r.e.burrowCounters,1);assert.equal(r.G.state.bossHazards.length,0);
});
test('only a live stomp or actual owner burrow pays a counter; phase, interruption, defeat and travel retire old plugs',()=>{
 for(const action of ['phase','cancel','death','travel']){const r=setup({rumble:true}),{G,e,plug}=r;
  if(action==='phase'){e.hp=e.def.hp*.6;G.updateEnemies(.01);r.drain();}if(action==='cancel')G.cancelBossHazards(e);if(action==='death'){e.ward.hp=0;G.combat.damageEnemy(e,{damage:100,type:'blunt'});r.drain();}if(action==='travel')r.load('overworld');assert.ok(plug.dead||!G.state.enemies.includes(plug));assert.equal(G.state.guardianChallenges.bram.counterLearned,false);assert.equal(G.state.guardianChallenges.bram.rootRumbleCleared,false);
 }
 const {G,e,plug}=setup();assert.equal(G.catchBurrowPlug(e,plug.x,plug.y),false);G.combat.damageEnemy(plug,{damage:1,ability:'unknown'});assert.ok(!plug.dead);const other=G.makeEnemy('eclipseKnight',plug.x,plug.y);other.bossChargeT=1;other.bossAfterCharge='royalStomp';assert.equal(G.catchBurrowPlug(other,plug.x,plug.y),false);
});
test('Crown, Echo, outing and chosen return precede a same-visit invitation; hearing it cannot start a duel',()=>{
 const r=runtime(),{G}=r;Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.delivery.complete=true;G.state.items.push('mole-crown','trophy-mire-pearl');G.ensureTown().requests.push('beacon');G.state.guardianChallenges.bram.counterLearned=true;r.load('moleTrial');r.drain();assert.equal(G.burrowVisitReady(),false);assert.equal(G.beginBurrowRematch(),false);
 G.state.claimedForms.push('mole');G.state.formOutings.active={formId:'mole',scenes:[],arts:[]};assert.equal(G.burrowVisitReady(),false);G.state.formOutings.active=null;Object.assign(G.state.player,{x:88,y:168});assert.ok(G.burrowVisitReady());assert.equal(G.openingInteractionCandidate().id,'bram-rematch');assert.ok(G.tryOpeningInteraction());assert.ok(G.state.guardianChallenges.bram.invited);assert.equal(G.burrowRematchActive(),false);r.drain();G.helpStationCandidate();assert.ok(G.helpStations().some(s=>s.kind==='burrowChallenge'));
 G.setComfortSetting('easyMode',true);G.setComfortSetting('bossAssistance',true);assert.ok(G.toggleBurrowRumble());const at={x:G.state.player.x,y:G.state.player.y};assert.ok(G.beginBurrowRematch());const e=G.state.enemies.find(e=>!e.dead&&e.bramLocalRematch);assert.equal(e.hp,56);assert.equal(e.ward.hp,6);assert.ok(e.bramRootRumble);assert.deepEqual({x:G.state.player.x,y:G.state.player.y},at);assert.equal(G.toggleBurrowRumble(),false);
 for(let i=0;i<400;i++){r.step(.05);r.drain();}assert.equal(e.bossEngaged,false);assert.equal(G.state.player.damageTaken,0);assert.ok(G.loadSaveData().guardianChallenges.bram.rootRumble);assert.ok(G.comfortSetting('easyMode'));assert.ok(G.comfortSetting('bossAssistance'));
});
test('legacy saves, strict normalization, optional-run exclusions and walking victory records preserve equal payout',()=>{
 const r=runtime(),{G}=r;G.state.items.push('mole-crown');r.load('moleTrial');r.drain();assert.ok(G.burrowVisitReady());assert.equal(G.normalizeGuardianChallenges({bram:{rootRumble:true}}).bram.rootRumble,false);assert.equal(G.normalizeGuardianChallenges({bram:{bestCounters:Infinity}}).bram.bestCounters,0);
 Object.assign(G.state.guardianChallenges.bram,{counterLearned:true,rootRumble:true});G.state.gauntletRun={};assert.equal(G.beginBurrowRematch(),false);G.state.gauntletRun=null;G.state.expeditionRun={};assert.equal(G.beginBurrowRematch(),false);G.state.expeditionRun=null;
 for(const local of [false,true]){const e=G.makeEnemy('moleMonarch',360,136);e.bramLocalRematch=local;e.bramRootRumble=true;e.burrowCounters=local?0:3;e.ward.hp=0;const stars=G.state.stars;G.combat.damageEnemy(e,{damage:100,type:'blunt',noMana:true});assert.equal(G.state.guardianChallenges.bram.rootRumbleCleared,local);assert.equal(G.state.stars,stars);assert.equal(G.groundRewardFor('mole-crown'),null);if(local)assert.ok(r.messages.some(m=>m.text.includes('clear step through both stomps')));r.drain();}
 assert.equal(G.loadSaveData().guardianChallenges.bram.bestCounters,3);assert.equal(G.resolveDialogueSpeaker('BRAM').id,'moleMonarch');
});
test('chosen duels retry at the quiet fire; first trial and ordinary mishaps keep their original attribution',()=>{
 for(const local of [false,true]){const r=setup({rumble:local,help:true}),{G,e}=r;if(local){G.state.items.push('mole-crown');e.bramLocalRematch=true;e.guardianPracticeExit={map:'moleTrial',x:3,y:11};}G.damagePlayer(100,e.x,e.y);r.drain();assert.ok(G.state.knockout);G.updateKnockout(2);r.drain();assert.equal(G.state.mapId,local?'moleTrial':'overworld');assert.equal(G.playerHp(),G.playerMaxHearts());assert.ok(G.comfortSetting('bossAssistance'));assert.equal(G.state.guardianChallenges.bram.rootRumbleCleared,false);if(local){assert.equal(G.state.player.x,56);assert.equal(G.state.player.y,184);assert.ok(!G.burrowRematchActive());}}
 const r=runtime();r.load('moleTrial');r.G.state.player.invuln=0;r.G.damagePlayer(100);assert.ok(!r.G.state.knockout);assert.equal(r.G.state.guidance.bossRetries.moleTrial,undefined);
});
