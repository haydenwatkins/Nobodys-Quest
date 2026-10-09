'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup({phase=1,double=false,form='nobody',help=false,retries=0}={}){
 const r=runtime(),{G}=r;G.state.claimedForms.push(form);G.setForm(form);r.load('riftbladeTrial');r.drain();const e=G.state.enemies.find(e=>e.id==='riftbladeAdept');G.state.enemies=[e];G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),miraDoubleReturn:double,bossTelegraphT:.01,bossPendingAction:'blades'});
 G.setComfortSetting('bossAssistance',help);G.ensureGuidance().bossRetries.riftbladeTrial=retries;
 Object.assign(G.state.player,{x:e.x-60,y:e.y,dir:{x:1,y:0},mana:0,manaRegenDelay:100,damageTaken:0,invuln:0});G.updateEnemies(.02);
 return {...r,e,mirror:G.state.enemies.find(e=>e.wayglassReflector)};
}
function practice(r){const {G}=r,e=G.state.enemies.find(e=>e.wayglassReflector);Object.assign(G.state.player,{x:e.x-18,y:e.y,dir:{x:1,y:0},mana:0,manaRegenDelay:100});r.taps.add('a');for(let i=0;i<100;i++){r.step(.025);r.drain();}return e;}
function arm(r){const {G,mirror}=r;Object.assign(G.state.player,{x:mirror.x,y:mirror.y+18,dir:{x:0,y:-1}});G.input.takeAim=()=>({x:0,y:-1,dragged:true});r.taps.add('a');G.input.vec={x:0,y:1};}
test('quiet western fire, preparation and real harmless practice persist without kill or lesson credit',()=>{
 const r=runtime(),{G}=r;r.load('riftbladeTrial');r.drain();assert.ok(G.state.grid[11][3].rest);assert.equal(G.helpStations().length,3);
 for(const s of G.helpStations()){assert.ok(G.world.isSafeSpawn(s.x,s.y));Object.assign(G.state.player,{x:s.x,y:s.y,damageTaken:0});for(let i=0;i<400;i++){r.step(.05);r.drain();}assert.equal(G.state.player.damageTaken,0);}
 let credit=0;for(const event of ['hit','kill','guardianCounter'])G.events.on(event,()=>credit++);const e=practice(r);
 assert.ok(e.dead);assert.equal(credit,0);assert.equal(G.state.player.damageTaken,0);assert.equal(G.state.player.mana,0);assert.ok(G.loadSaveData().guardianChallenges.mira.practiceCleared);assert.equal(G.state.guardianChallenges.mira.counterLearned,false);
 r.load('riftbladeTrial');assert.ok(!G.state.enemies.some(e=>e.wayglassReflector));
});
test('native free basics raise the same reflector in all 24 bodies; the actual return opens each phase without bypassing Sharp',()=>{
 const all=Object.keys(runtime().G.forms);
 for(const form of all)for(const phase of form==='nobody'?[1,2,3]:[1]){
  const r=setup({form,phase}),{G,e,mirror}=r;assert.ok(mirror,form);const hp=e.hp,ward=e.ward.hp;arm(r);let outward=false;
  for(let i=0;i<90&&!e.wayglassCounters;i++){r.step(.025);r.drain();if(G.state.projectiles.some(s=>!s.fromPlayer&&!s.returning)){outward=true;assert.equal(e.wayglassCounters,undefined);}}
  assert.ok(outward);assert.equal(e.wayglassCounters,1,form);assert.ok(mirror.dead);if(form==='nobody'){assert.equal(e.hp,hp,form);assert.equal(e.ward.hp,ward,form);}assert.equal(G.state.player.mana,0,form);assert.equal(G.state.player.damageTaken,0,form);assert.ok(e.bossStaggerT>1.4);assert.ok(G.loadSaveData().guardianChallenges.mira.counterLearned);
 }
});
test('unraised reflectors permit the unchanged native walking answer and expire after the throw',()=>{
 for(const phase of [1,2,3]){const r=setup({phase}),{G,e,mirror}=r;G.state.player.y+=55;let returning=false;for(let i=0;i<130;i++){r.step(.025);r.drain();returning ||= G.state.projectiles.some(s=>s.returning);}assert.ok(returning);assert.equal(e.wayglassCounters,undefined);assert.ok(mirror.dead);assert.equal(G.state.player.damageTaken,0);assert.equal(G.state.guardianChallenges.mira.counterLearned,false);}
});
test('only the correct returning owner crosses the armed catcher; swept collision cannot tunnel',()=>{
 for(const bad of ['outbound','player','other','dispelled','wrongShape','miss','deadOwner','none']){
  const {G,e,mirror}=setup();G.combat.damageEnemy(mirror,{damage:1,ability:'slap'});const shot={owner:e,fromPlayer:false,dispelled:false,boomerang:true,shape:'riftBlade',size:5,x:mirror.x-50,y:mirror.y-4};
  if(bad==='player')shot.fromPlayer=true;if(bad==='other')shot.owner={};if(bad==='dispelled')shot.dispelled=true;if(bad==='wrongShape')shot.shape='seed';if(bad==='miss')shot.y+=70;if(bad==='deadOwner')e.dead=true;
  assert.equal(G.catchWayglassReturn(shot,mirror.x+50,shot.y,bad!=='outbound'),bad==='none',bad);
  assert.equal(e.wayglassCounters,bad==='none'?1:undefined);
 }
});
test('double return waits for helped slowed blades and remains a committed warning; counter cancels the pair',()=>{
 for(const help of [false,true])for(const retries of [0,5]){
  const r=setup({double:true,help,retries}),{G,e}=r,[primary,follow]=G.state.bossHazards;assert.equal(primary.warning,help?1.1:.8);assert.equal(follow.warning,help?1.2:.9);assert.ok(follow.delay>primary.warning+164/(120*(G.guidanceProjectileScale({owner:e})||1)));assert.ok(e.bossRecoverT>=follow.delay+follow.warning+follow.active+.64);
  G.state.player.y+=55;for(let i=0;i<Math.floor(follow.delay/.025);i++){r.step(.025);r.drain();}assert.equal(G.state.projectiles.length,0,'the first blades finish before the second warning');const x=follow.x;G.state.player.y+=15;while(!follow.fired){r.step(.025);r.drain();}assert.equal(follow.x,x);assert.ok(G.state.projectiles.length>0);
 }
 const r=setup({double:true}),{G,e,mirror}=r;arm(r);for(let i=0;i<90&&!e.wayglassCounters;i++){r.step(.025);r.drain();}assert.ok(mirror.dead);assert.equal(e.wayglassCounters,1);assert.equal(G.state.bossHazards.length,0);assert.ok(G.state.projectiles.every(s=>s.fromPlayer||s.dispelled));
});
test('phase, interruption, defeat and travel clear the reflector without learning or a false record',()=>{
 for(const action of ['phase','cancel','death','travel']){const r=setup({double:true}),{G,e,mirror}=r;
  if(action==='phase'){e.hp=e.def.hp*.6;G.updateEnemies(.01);r.drain();}
  if(action==='cancel')G.cancelBossHazards(e);
  if(action==='death'){e.ward.hp=0;G.combat.damageEnemy(e,{damage:100,type:'sharp'});r.drain();}
  if(action==='travel')r.load('overworld');assert.ok(mirror.dead||!G.state.enemies.includes(mirror),action);assert.equal(G.state.guardianChallenges.mira.counterLearned,false);assert.equal(G.state.guardianChallenges.mira.doubleReturnCleared,false);
 }
});
test('Sigil, Echo and useful outing take precedence; same-visit invitation is voluntary and the chosen duel waits',()=>{
 const r=runtime(),{G}=r;Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.delivery.complete=true;G.state.items.push('riftblade-sigil','trophy-mire-pearl');G.ensureTown().requests.push('beacon');G.state.guardianChallenges.mira.counterLearned=true;r.load('riftbladeTrial');r.drain();assert.equal(G.wayglassVisitReady(),false);assert.equal(G.beginWayglassRematch(),false);
 G.state.claimedForms.push('riftblade');G.state.formOutings.active={formId:'riftblade',scenes:[],arts:[]};assert.equal(G.wayglassVisitReady(),false);G.state.formOutings.active=null;
 assert.ok(G.wayglassVisitReady());Object.assign(G.state.player,{x:88,y:168});assert.equal(G.openingInteractionCandidate().id,'mira-rematch');assert.equal(G.openingInteractionCandidate().hint,'Ask Mira about her two-throw practice.');assert.ok(G.tryOpeningInteraction());assert.ok(G.state.guardianChallenges.mira.invited);assert.equal(G.wayglassRematchActive(),false);r.drain();assert.equal(G.openingInteractionCandidate().hint,'Choose a duel here, then walk east.');G.helpStationCandidate();assert.ok(G.helpStations().some(s=>s.kind==='wayglassChallenge'));
 G.setComfortSetting('easyMode',true);G.setComfortSetting('bossAssistance',true);assert.ok(G.toggleWayglassDouble());const at={x:G.state.player.x,y:G.state.player.y};assert.ok(G.beginWayglassRematch());const e=G.state.enemies.find(e=>!e.dead&&e.miraLocalRematch);assert.equal(e.hp,52);assert.equal(e.ward.hp,5);assert.ok(e.miraDoubleReturn);assert.deepEqual({x:G.state.player.x,y:G.state.player.y},at);assert.equal(G.toggleWayglassDouble(),false);
 for(let i=0;i<400;i++){r.step(.05);r.drain();}assert.equal(e.bossEngaged,false);assert.equal(G.state.player.damageTaken,0);assert.ok(G.loadSaveData().guardianChallenges.mira.doubleReturn);assert.ok(G.comfortSetting('easyMode'));assert.ok(G.comfortSetting('bossAssistance'));
});
test('legacy access, strict profile migration, optional run exclusions and once-only reward records',()=>{
 const r=runtime(),{G}=r;G.state.items.push('riftblade-sigil');r.load('riftbladeTrial');r.drain();assert.ok(G.wayglassVisitReady());assert.equal(G.normalizeGuardianChallenges({mira:{doubleReturn:true}}).mira.doubleReturn,false);assert.equal(G.normalizeGuardianChallenges({mira:{bestCounters:Infinity}}).mira.bestCounters,0);
 Object.assign(G.state.guardianChallenges.mira,{counterLearned:true,doubleReturn:true});G.state.gauntletRun={};assert.equal(G.beginWayglassRematch(),false);G.state.gauntletRun=null;G.state.expeditionRun={};assert.equal(G.beginWayglassRematch(),false);G.state.expeditionRun=null;
 for(const local of [false,true]){const e=G.makeEnemy('riftbladeAdept',344,136);e.miraLocalRematch=local;e.miraDoubleReturn=true;e.wayglassCounters=local?0:3;e.ward.hp=0;const stars=G.state.stars;G.combat.damageEnemy(e,{damage:100,type:'sharp',noMana:true});assert.equal(G.state.guardianChallenges.mira.doubleReturnCleared,local);assert.equal(G.state.stars,stars);assert.equal(G.groundRewardFor('riftblade-sigil'),null);if(local)assert.ok(r.messages.some(m=>m.text.includes('stepped around both throws')));r.drain();}
 assert.equal(G.loadSaveData().guardianChallenges.mira.bestCounters,3);
});

test('a chosen duel retries at Mira’s quiet fire; the first trial returns by the original eastern road',()=>{
 for(const local of [false,true]){const r=setup({double:local,help:true}),{G,e}=r;if(local){G.state.items.push('riftblade-sigil');e.miraLocalRematch=true;e.guardianPracticeExit={map:'riftbladeTrial',x:3,y:11};}G.damagePlayer(100,e.x,e.y);r.drain();assert.ok(G.state.knockout);G.updateKnockout(2);r.drain();assert.equal(G.state.mapId,local?'riftbladeTrial':'overworld');assert.equal(G.playerHp(),G.playerMaxHearts());assert.ok(G.comfortSetting('bossAssistance'));assert.equal(G.state.guardianChallenges.mira.doubleReturnCleared,false);if(local){assert.equal(G.state.player.x,56);assert.equal(G.state.player.y,184);assert.ok(!G.wayglassRematchActive());}}
 const r=runtime();r.load('riftbladeTrial');r.G.state.player.invuln=0;r.G.damagePlayer(100);assert.ok(!r.G.state.knockout);assert.equal(r.G.state.guidance.bossRetries.riftbladeTrial,undefined);
});
