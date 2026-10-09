'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup({phase=1,branching=false,help=false,map='heartwood',form='nobody'}={}){
 const r=runtime(),{G}=r;Object.assign(G.state.opening,{started:true,complete:true});G.state.delivery.complete=true;r.load(map);r.drain();
 const e=G.state.enemies.find(e=>e.def.id==='ancientTreant');G.state.enemies=[e];G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),treantBranching:branching});
 G.setComfortSetting('bossAssistance',help);G.setForm(form);Object.assign(G.state.player,{x:map==='mistwood'?e.x-40:e.x,y:map==='mistwood'?e.y-16:e.y+80,mana:0,manaRegenDelay:100,invuln:0,damageTaken:0});
 return {...r,e};
}
function strike(r){const {G,e}=r;if(e.def.boss.orchard)G.updateOrchardBoss(e,G.state.player,.01);else{e.bossPendingAction='rootBloom';e.bossTelegraphT=.001;G.updateEnemies(.01);}}
function finish(r){const {G,e}=r,fields=e.def.boss.orchard?G.state.openingHazards:G.state.bossHazards;
 const end=Math.max(...fields.filter(h=>!h.treantEcho).map(h=>(h.warn??h.warning)+h.active));G.state.player.x+=32;
 if(e.def.boss.orchard)G.updateOpening(end+.001);else G.updateBossHazards(end+.001);
 return G.state.enemies.find(a=>!a.dead&&a.treantRoot?.owner===e);
}
test('safe root teaches a free art, saves a picnic seat, and grants no combat credit or challenge',()=>{
 const r=runtime(),{G}=r;r.load('heartwood');r.drain();const root=G.state.enemies.find(e=>e.treantRoot),p=G.state.player;
 Object.assign(p,{x:root.x+18,y:root.y,dir:{x:-1,y:0},mana:0,manaRegenDelay:100});let hit=0,kill=0;G.events.on('hit',()=>hit++);G.events.on('kill',()=>kill++);
 r.taps.add('a');for(let i=0;i<15;i++){r.step(.025);r.drain();}
 assert.equal(root.dead,true);assert.equal(p.mana,0);assert.equal(hit,0);assert.equal(kill,0);assert.equal(G.state.guardianChallenges.treant.practiceCleared,true);
 assert.equal(G.loadSaveData().guardianChallenges.treant.practiceCleared,true);assert.equal(G.treantChallengeStation(),null);
 r.load('heartwood');assert.equal(G.state.enemies.some(e=>e.treantRoot),false);
});
test('all root phases leave a stationary counter at the original target in both existing Treant fights',()=>{
 for(const map of ['heartwood','mistwood'])for(const phase of [1,2,3]){
  const r=setup({map,phase}),{G,e}=r,at={x:G.state.player.x,y:G.state.player.y};strike(r);const root=finish(r);
  assert.ok(root,`${map} ${phase}`);assert.equal(root.x,at.x);assert.equal(root.y,at.y);assert.equal(G.state.player.damageTaken,0);
  const hp=e.hp,ward=e.ward.hp;assert.equal(G.combat.damageEnemy(root,{damage:1,type:'sharp',ability:'slash',noMana:true}),false);
  assert.equal(e.hp,hp);assert.equal(e.ward.hp,ward-1);assert.equal(e.bossStaggerT,1.6);assert.equal(e.openingTimer,0);assert.equal(e.treantCounters,1);
  assert.equal(G.state.bossHazards.length+G.state.openingHazards.length,0);assert.equal(G.state.guardianChallenges.treant.counterLearned,true);
 }
});
test('free native basics snap the counter at zero mana in blunt, sharp and slow bodies without hit credit',()=>{
 for(const form of ['nobody','knight','colossus']){
  const r=setup({form}),{G,e}=r;strike(r);const root=finish(r),p=G.state.player;
  Object.assign(p,{x:root.x+18,y:root.y,dir:{x:-1,y:0}});let credit=0;G.events.on('hit',()=>credit++);r.taps.add('a');
  for(let i=0;i<25;i++){r.step(.025);r.drain();}
  assert.equal(root.dead,true,form);assert.equal(e.treantCounters,1,form);assert.equal(p.mana,0,form);assert.equal(credit,0,form);
 }
});
test('branching follows the committed target, has a helped warning and a complete fallback recovery',()=>{
 for(const phase of [1,2,3])for(const help of [false,true]){
  const r=setup({phase,branching:true,help}),{G,e}=r;strike(r);const echo=G.state.openingHazards.find(h=>h.treantEcho);
  assert.ok(echo);assert.ok(Math.abs(echo.warn-echo.delay-(help?1.25:.95))<1e-7);assert.equal(echo.x,G.state.player.x);assert.equal(echo.y,G.state.player.y);
  assert.ok(e.openingTimer>=echo.warn+echo.active+.899);const root=finish(r);assert.ok(root);assert.ok(echo.t<echo.warn);
  G.combat.damageEnemy(root,{damage:1,type:'blunt',ability:'slap'});assert.equal(G.state.openingHazards.length,0);
 }
});
test('ignoring a cracked root leaves a dodgeable follower and expires the prop without a status penalty',()=>{
 const r=setup({branching:true}),{G}=r;strike(r);const root=finish(r),echo=G.state.openingHazards.find(h=>h.treantEcho);
 G.updateOpening(echo.warn+echo.active-echo.t+.001);assert.equal(G.state.player.damageTaken,0);assert.equal(G.state.openingHazards.length,0);
 G.updateOpening(3.3);assert.equal(root.dead,true);assert.equal(G.state.guardianChallenges.treant.counterLearned,false);
});
test('cancellation, phase change, death and travel remove roots without granting a successful counter',()=>{
 for(const action of ['cancel','phase','death','travel']){
  const r=setup(),{G,e}=r;strike(r);const root=finish(r);
  if(action==='cancel')G.cancelBossHazards(e);
  if(action==='phase'){e.hp=e.def.hp*.6;G.updateEnemies(.01);r.drain();}
  if(action==='death'){e.ward.hp=0;G.combat.damageEnemy(e,{damage:100,type:'blunt',ability:null,noMana:true});assert.equal(e.dead,true);}
  if(action==='travel')r.load('orchardRoad');
  assert.ok(root.dead||!G.state.enemies.includes(root),action);assert.equal(G.state.guardianChallenges.treant.counterLearned,false,action);
 }
});
test('world challenge is earned, off by default, snapshots only the chosen local fight, and leaves help independent',()=>{
 const r=runtime(),{G}=r;G.state.items.push('trophy-heartwood-crown');Object.assign(G.state.opening,{started:true,complete:true});r.load('heartwood');r.drain();
 assert.equal(G.treantChallengeStation(),null);assert.equal(G.toggleTreantBranching(),false);
 G.state.guardianChallenges.treant.counterLearned=true;r.load('heartwood');r.drain();assert.ok(G.treantChallengeStation());assert.equal(G.treantBranchingLit(),false);
 G.setComfortSetting('easyMode',true);G.setComfortSetting('bossAssistance',true);assert.equal(G.toggleTreantBranching(),true);
 const p=G.state.player,at={x:p.x,y:p.y};assert.equal(G.beginTreantRematch(),true);const e=G.state.enemies.find(e=>!e.dead&&e.def.id==='ancientTreant');
 assert.equal(e.treantBranching,true);assert.equal(e.treantLocalRematch,true);assert.equal(e.hp,e.def.hp);assert.equal(e.ward.hp,4);assert.equal(p.x,at.x);assert.equal(p.y,at.y);
 assert.equal(G.toggleTreantBranching(),false);assert.equal(G.comfortSetting('easyMode'),true);assert.equal(G.comfortSetting('bossAssistance'),true);
 r.load('mistwood');assert.equal(G.state.enemies.find(e=>e.def.id==='ancientTreant').treantBranching,undefined);
});
test('first promise return stays ahead of the optional guardian rematch',()=>{
 const r=runtime(),{G}=r;G.state.items.push('trophy-heartwood-crown');Object.assign(G.state.opening,{started:true,complete:false});G.state.delivery.started=false;r.load('heartwood');
 G.state.guardianChallenges.treant.counterLearned=true;assert.equal(G.treantVisitReady(),false);assert.equal(G.beginTreantRematch(),false);assert.equal(G.treantChallengeStation(),null);
});
test('records use genuine victory independently of help, while interrupted fights grant no clear',()=>{
 const r=setup({branching:true,help:true}),{G,e}=r;e.treantLocalRematch=true;strike(r);const root=finish(r);G.combat.damageEnemy(root,{damage:1,type:'blunt',ability:'slap'});
 assert.equal(G.state.guardianChallenges.treant.branchingCleared,false);e.dead=true;G.noteTreantDefeat(e);
 assert.equal(G.state.guardianChallenges.treant.branchingCleared,true);assert.equal(G.state.guardianChallenges.treant.bestCounters,1);
 assert.equal(G.loadSaveData().guardianChallenges.treant.branchingCleared,true);
});
test('challenge save normalization is conservative, per-slot and clamps malformed records',()=>{
 const r=runtime(),{G}=r;r.load('heartwood');assert.equal(G.normalizeGuardianChallenges({treant:{branching:true}}).treant.branching,false);
 const a=G.normalizeGuardianChallenges({treant:{counterLearned:true,branching:true,bestCounters:1000}}).treant;assert.equal(a.branching,true);assert.equal(a.bestCounters,99);
 G.state.guardianChallenges.treant.practiceCleared=true;G.saveGame();assert.equal(G.loadSaveData(1).guardianChallenges.treant.practiceCleared,true);assert.equal(G.loadSaveData(2),null);
});

test('a lost local rematch returns outside, keeps help and choice, and restarts only on invitation',()=>{
 const r=runtime(),{G}=r;Object.assign(G.state.opening,{started:true,complete:true});G.state.delivery.complete=true;G.state.items.push('trophy-heartwood-crown');
 Object.assign(G.state.guardianChallenges.treant,{counterLearned:true,branching:true});G.setComfortSetting('easyMode',true);G.setComfortSetting('bossAssistance',true);r.load('heartwood');r.drain();assert.ok(G.beginTreantRematch());
 const e=G.state.enemies.find(e=>!e.dead&&e.treantLocalRematch);Object.assign(G.state.player,{invuln:0,meleeGuard:0,damageTaken:0});G.damagePlayer(100,e.x,e.y);r.drain();assert.ok(G.state.knockout);assert.equal(G.state.guardianChallenges.treant.branchingCleared,false);
 G.updateKnockout(2);r.drain();assert.equal(G.state.mapId,'orchardRoad');assert.equal(G.playerHp(),G.playerMaxHearts());assert.equal(G.treantBranchingLit(),true);assert.equal(G.comfortSetting('easyMode'),true);assert.equal(G.comfortSetting('bossAssistance'),true);
 r.load('heartwood');r.drain();assert.equal(G.treantRematchActive(),false);assert.ok(G.beginTreantRematch());const retry=G.state.enemies.find(e=>!e.dead&&e.treantLocalRematch);assert.equal(retry.hp,retry.def.hp);assert.equal(retry.ward.hp,4);assert.equal(retry.treantBranching,true);
});

test('the friendly resident leaves A available at the picnic root even when approached from his side',()=>{
 const r=runtime(),{G}=r;G.state.items.push('trophy-heartwood-crown');Object.assign(G.state.opening,{started:true,complete:true});G.state.delivery.complete=true;r.load('heartwood');r.drain();
 const root=G.state.enemies.find(e=>e.treantRoot);Object.assign(G.state.player,{x:root.x-18,y:root.y,dir:{x:1,y:0},mana:0,manaRegenDelay:100});assert.equal(G.openingInteractionCandidate(),null);
 r.taps.add('a');for(let i=0;i<15;i++){r.step(.025);r.drain();}assert.equal(root.dead,true);assert.equal(G.state.player.mana,0);
});

test('root scenery never borrows the straw-post portrait, while the living opening post keeps its art',()=>{
 const r=runtime(),{G}=r;r.load('heartwood');let posts=0;const sprite=G.openingScenery.props.practice;G.drawSprite=(c,s)=>{if(s===sprite)posts++;};
 const c=new Proxy({},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});for(const d of G.openingDrawables(c))d.fn();assert.equal(posts,0);
 r.load('orchardRoad');posts=0;for(const d of G.openingDrawables(c))d.fn();assert.equal(posts,1);
 const post=G.state.enemies.find(e=>e.def.practice&&!e.treantRoot);post.dead=true;posts=0;for(const d of G.openingDrawables(c))d.fn();assert.equal(posts,0);
});
