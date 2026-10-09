'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup({phase=1,rippling=false,help=false,form='wizard'}={}){
 const r=runtime(),{G}=r;Object.assign(G.state.opening,{started:true,complete:true});G.state.delivery.complete=true;G.state.claimedForms.push(form,'wizard');G.setForm(form);r.load('sunkenMarsh');r.drain();
 const e=G.state.enemies.find(e=>e.id==='mireQueen');G.state.enemies=[e];G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),queenRippling:rippling,bossPendingAction:'mireBubbles',bossTelegraphT:.001});
 G.setComfortSetting('bossAssistance',help);Object.assign(G.state.player,{x:e.x+60,y:e.y,mana:0,manaRegenDelay:100,invuln:0,damageTaken:0});
 G.updateEnemies(.01);return {...r,e};
}
function finish(r){const {G,e}=r,end=Math.max(...G.state.bossHazards.filter(h=>!h.mireRipple).map(h=>h.delay+h.warning+h.active));G.state.player.y+=30;G.updateBossHazards(end+.001);return G.state.enemies.find(a=>!a.dead&&a.mireCrust?.owner===e);}
test('the real ferry camp and practice approaches stay quiet under ordinary enemy AI',()=>{
 const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();assert.equal(G.state.enemies.filter(e=>!e.def.practice).length,9);
 const root=G.state.enemies.find(e=>e.mireCrust);
 for(const at of [...G.helpStations(),{x:root.x+18,y:root.y},{x:root.x-18,y:root.y},{x:root.x,y:root.y+18}]){
  Object.assign(G.state.player,{x:at.x,y:at.y,damageTaken:0,invuln:0});for(let i=0;i<400;i++){r.step(.05);r.drain();}assert.equal(G.state.player.damageTaken,0,JSON.stringify(at));
 }
});
test('harmless practice opens a saved lily light with native zero-mana A and no false combat credit',()=>{
 const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();const root=G.state.enemies.find(e=>e.mireCrust);let credit=0;G.events.on('hit',()=>credit++);G.events.on('kill',()=>credit++);
 Object.assign(G.state.player,{x:root.x+18,y:root.y,dir:{x:-1,y:0},mana:0,manaRegenDelay:100});assert.equal(G.openingInteractionCandidate(),null);assert.equal(G.mireWalkingScale(G.state.player),1);
 r.taps.add('a');for(let i=0;i<15;i++){r.step(.025);r.drain();}assert.equal(root.dead,true);assert.equal(credit,0);assert.equal(G.state.player.mana,0);assert.equal(G.loadSaveData().guardianChallenges.queen.practiceCleared,true);assert.equal(G.mireChallengeStation(),null);
 r.load('sunkenMarsh');assert.equal(G.state.enemies.some(e=>e.mireCrust&&!e.mireCrust.owner),false);
});
test('all Queen phases leave one crust at the committed target after the entire primary phrase',()=>{
 for(const phase of [1,2,3])for(const help of [false,true]){
  const r=setup({phase,help}),{G}=r,at={x:G.state.player.x,y:G.state.player.y},fields=G.state.bossHazards;assert.equal(fields.length,phase);
  const root=finish(r);assert.ok(root);assert.equal(root.x,at.x);assert.equal(root.y,at.y);assert.equal(G.state.player.damageTaken,0);assert.equal(G.state.enemies.filter(e=>!e.dead&&e.mireCrust).length,1);
 }
});
test('ranged, sharp and slow native free basics splash at zero mana without erasing the dark ward or faking hits',()=>{
 for(const form of ['wizard','knight','colossus']){
  const r=setup({form}),{G,e}=r,root=finish(r),hp=e.hp,ward=e.ward.hp;let credit=0;G.events.on('hit',()=>credit++);G.events.on('wardBreak',()=>credit++);
  Object.assign(G.state.player,{x:root.x+18,y:root.y,dir:{x:-1,y:0}});r.taps.add('a');for(let i=0;i<28;i++){r.step(.025);r.drain();}
  assert.equal(root.dead,true,form);assert.equal(e.mireCounters,1,form);assert.equal(e.hp,hp,form);assert.equal(e.ward.hp,ward,form);assert.equal(credit,0,form);assert.equal(G.state.player.mana,0,form);assert.ok(e.bossStaggerT>0,form);
 }
});
test('sticky feet are local, unstacked, short-lived and immediately freed by a basic or expiration',()=>{
 const r=setup(),{G}=r,root=finish(r),p=G.state.player;Object.assign(p,{x:root.x,y:root.y});assert.equal(G.mireWalkingScale(p),.8);p.x+=15;assert.equal(G.mireWalkingScale(p),1);p.x-=15;
 G.updateOpening(3.7);assert.equal(root.dead,true);assert.equal(G.mireWalkingScale(p),1);assert.equal(G.state.guardianChallenges.queen.counterLearned,false);
});
test('a non-damaging dash tears the entire travelled segment and does not add hits or slow its travel',()=>{
 const r=setup(),{G,e}=r,root=finish(r),p=G.state.player;Object.assign(p,{x:root.x-24,y:root.y,dir:{x:1,y:0},mana:0});
 G.combat.dash(p,{ability:'cartwheel',dist:60,speed:260,damage:0});G.updatePlayer(.2);assert.equal(root.dead,true);assert.equal(e.mireCounters,1);assert.ok(p.x>=root.x+20);assert.equal(p.dashing.hitTargets.size,0);assert.equal(G.mireWalkingScale(p),1);
});
test('a distant crust still frees the player but cannot splash the Queen or unlock her alternate',()=>{
 const r=setup(),{G,e}=r;G.state.bossHazards=[];const h={owner:e,mireAftermath:{x:e.x+130,y:e.y}};G.leaveMireCrust(h);const root=G.state.enemies.find(e=>e.mireCrust);
 G.combat.damageEnemy(root,{damage:1,type:'dark',ability:'curse'});assert.equal(root.dead,true);assert.equal(e.mireCounters,undefined);assert.equal(G.state.guardianChallenges.queen.counterLearned,false);
});
test('the following volley waits for helped bubbles and can be cancelled; fallback shots follow the old target',()=>{
 for(const phase of [1,2,3])for(const help of [false,true]){
  const r=setup({phase,help,rippling:true}),{G,e}=r,echo=G.state.bossHazards.find(h=>h.mireRipple),primary=G.state.bossHazards.filter(h=>!h.mireRipple);
  assert.ok(Math.abs(echo.delay-Math.max(...primary.map(h=>h.warning+h.active)))<1e-8);assert.equal(echo.warning,help?1.25:.95);
  const root=finish(r);assert.ok(root);assert.equal(echo.fired,false);G.combat.damageEnemy(root,{damage:1,type:'blunt',ability:'slap'});assert.equal(G.state.bossHazards.length,0);assert.equal(e.bossPendingAction,null);
 }
 const r=setup({rippling:true}),{G,e}=r;finish(r);const echo=G.state.bossHazards[0],at={x:echo.x,y:echo.y};G.state.player.y+=35;G.updateBossHazards(echo.delay+echo.warning-echo.t+.01);assert.equal(echo.fired,true);assert.equal(echo.x,at.x);assert.equal(echo.y,at.y);assert.ok(G.state.projectiles.some(p=>p.owner===e));assert.equal(G.state.player.damageTaken,0);
});
test('phase, stagger, death and travel retire crusts and future echoes without recording a clear',()=>{
 for(const action of ['phase','cancel','death','travel']){
  const r=setup({rippling:true}),{G,e}=r,root=finish(r);
  if(action==='phase'){e.hp=e.def.hp*.6;G.updateEnemies(.01);r.drain();}if(action==='cancel')G.cancelBossHazards(e);
  if(action==='death'){e.ward.hp=0;G.combat.damageEnemy(e,{damage:100,type:'dark',ability:null,noMana:true});assert.ok(e.dead);}
  if(action==='travel')r.load('overworld');assert.ok(root.dead||!G.state.enemies.includes(root));assert.equal(G.state.guardianChallenges.queen.ripplingCleared,false);
 }
});
test('the first harbour return stays ahead of a local invitation and saved mode choices are independent',()=>{
 const r=runtime(),{G}=r;Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.delivery.complete=true;G.state.items.push('trophy-mire-pearl');G.state.guardianChallenges.queen.counterLearned=true;r.load('sunkenMarsh');
 assert.equal(G.mireVisitReady(),false);assert.equal(G.beginMireRematch(),false);assert.equal(G.mireChallengeStation(),null);G.ensureTown().requests.push('beacon');r.load('sunkenMarsh');assert.ok(G.mireChallengeStation());assert.equal(G.mireRipplingLit(),false);
 G.setComfortSetting('easyMode',true);G.setComfortSetting('bossAssistance',true);assert.ok(G.toggleMireRippling());const at={x:G.state.player.x,y:G.state.player.y};assert.ok(G.beginMireRematch());const e=G.state.enemies.find(e=>!e.dead&&e.queenLocalRematch);
 assert.ok(e.queenRippling);assert.equal(e.guardPost,true);assert.equal(e.hp,36);assert.equal(e.ward.hp,5);assert.equal(G.state.player.x,at.x);assert.equal(G.state.player.y,at.y);assert.equal(G.toggleMireRippling(),false);assert.equal(G.comfortSetting('easyMode'),true);assert.equal(G.comfortSetting('bossAssistance'),true);
});
test('local rematches respect opened sluices; records and normalizers cannot silently enable a pattern',()=>{
 const r=runtime(),{G}=r;G.state.items.push('trophy-mire-pearl','marsh-north-sluice','marsh-south-sluice');r.load('sunkenMarsh');assert.ok(G.beginMireRematch());const e=G.state.enemies.find(e=>!e.dead&&e.queenLocalRematch);assert.equal(e.ward.hp,3);
 assert.equal(G.normalizeGuardianChallenges({queen:{rippling:true}}).queen.rippling,false);assert.equal(G.normalizeGuardianChallenges({treant:{counterLearned:true,branching:true}}).treant.branching,true);
 e.queenRippling=true;e.mireCounters=2;e.dead=true;G.noteMireQueenDefeat(e);assert.equal(G.state.guardianChallenges.queen.ripplingCleared,true);assert.equal(G.loadSaveData().guardianChallenges.queen.bestCounters,2);
});
test('a failed engaged fight resets at the ferry with help, while ordinary mishaps never become Queen retries',()=>{
 const r=setup({rippling:true,help:true}),{G,e}=r;e.queenLocalRematch=true;finish(r);G.setComfortSetting('easyMode',true);G.state.items.push('trophy-mire-pearl');G.ensureTown().requests.push('beacon');Object.assign(G.state.guardianChallenges.queen,{counterLearned:true,rippling:true});
 G.damagePlayer(100,e.x,e.y);r.drain();assert.ok(G.state.knockout);assert.equal(G.state.guardianChallenges.queen.ripplingCleared,false);G.updateKnockout(2);r.drain();assert.equal(G.state.mapId,'sunkenMarsh');assert.equal(G.playerHp(),G.playerMaxHearts());assert.equal(G.mireRematchActive(),false);assert.ok(G.mireRipplingLit());assert.ok(G.comfortSetting('easyMode'));assert.ok(G.comfortSetting('bossAssistance'));assert.ok(G.beginMireRematch());
 const q=G.state.enemies.find(e=>!e.dead&&e.queenLocalRematch);assert.equal(q.hp,36);assert.equal(q.ward.hp,5);
 const fresh=runtime();fresh.load('sunkenMarsh');fresh.G.state.player.invuln=0;fresh.G.damagePlayer(100);assert.ok(!fresh.G.state.knockout);assert.equal(fresh.G.state.guidance.bossRetries.sunkenMarsh,undefined);
});
