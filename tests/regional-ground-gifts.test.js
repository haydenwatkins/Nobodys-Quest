const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
const collect=require('./helpers/collect-treasure.cjs'),cross=require('./helpers/cross-road.cjs');
const cases=[
 ['ridge-coal-watch','emberRidge',10,4,3,'overworld'],['ridge-ash-watch','emberRidge',14,14,3,'overworld'],
 ['mistwood-middle-road','mistwood',23,5,6,'overworld'],['starfall-thread','starfallRuins',15,15,8,'overworld'],
 ['glasswater-meridian','glasswaterDesert',23,6,6,'rootdeepHollow'],
];
function at(G,x,y){Object.assign(G.state.player,{x:x*16+8,y:y*16+8});}
function setup(map){const r=runtime(),{G}=r;G.state.opening.complete=G.state.delivery.complete=true;G.state.stars=40;G.state.claimedForms=G.formOrder.filter(id=>!['nobody','god'].includes(id));G.questsDone=G.formOrder.flatMap(id=>G.forms[id].quests.map(q=>q.id));G.ensureTown().spirit=20;r.load(map);r.drain();G.state.enemies=[];return r;}
function defeat(G,e){for(let i=0;i<10&&!e.dead;i++)G.combat.damageEnemy(e,{damage:100,type:e.ward?.types[0]||'blunt',fromX:e.x+14,fromY:e.y});assert.ok(e.dead,'native damage/ward/kill path defeats each guard');}
function earn(r,item,x,y){const {G}=r;
 if(item.startsWith('ridge-')){
  at(G,x,y);G.tryOpeningInteraction();assert.equal(G.ridgeSurvey().active.remaining,2);const guards=[...G.state.enemies];defeat(G,guards[0]);G.state.player.damageTaken=2;G.state.player.mana=0;G.updateOpening(.05);
  assert.equal(G.ridgeSurvey().active.remaining,1);assert.equal(G.groundRewardFor(item),null);assert.equal(G.state.player.damageTaken,2);defeat(G,guards[1]);G.state.pickups=[];G.updateOpening(.05);
 }else{
  const points=item==='mistwood-middle-road'?[[6,5],[7,13],[23,5]]:item==='starfall-thread'?[[24,14],[24,5],[5,5],[15,15]]:[[x,y]];
  if(item==='glasswater-meridian')G.state.items.push('glasswater-prism');
  for(let i=0;i<points.length;i++){at(G,...points[i]);if(i===points.length-1){G.state.player.damageTaken=2;G.state.player.mana=0;}G.tryOpeningInteraction();r.drain();}
 }
 r.drain();
}
for(const [item,map,x,y,amount,exit]of cases)test(`${item} preserves its accomplishment through portals/save boot, then claims fixed spirit and item exactly once`,()=>{
 const r=setup(map),{G}=r,events=[];G.events.on('pickup',e=>{if(e.item===item)events.push(e.item);});earn(r,item,x,y);const earnedSpirit=map==='emberRidge'?22:20;
 const gift={...G.groundRewardFor(item)};assert.equal(gift.source,'regional');assert.ok(G.world.isSafeSpawn(gift.x,gift.y));assert.equal(G.ensureTown().spirit,earnedSpirit);assert.ok(!G.state.items.includes(item));assert.equal(events.length,0);
 if(map==='emberRidge'){assert.equal(G.ridgeSurvey().lit,1);assert.equal(G.ridgeSurvey().active,null);}
 if(map==='mistwood'){assert.ok(G.mistwoodSurvey().open);assert.equal(G.world.solid(232,152),false);}
 if(map==='starfallRuins'){assert.ok(G.starfallSurvey().instrument);assert.equal(G.starfallSurvey().thread,false);assert.equal(G.costumeUnlocked('starstrider'),false);assert.equal(G.normalizeWayfinder(null,{items:[]}).discovered.includes('starfallRuins'),false);}
 if(map==='glasswaterDesert'){assert.ok(G.glasswaterSurvey().aligned);assert.equal(G.world.solid(376,312),false);assert.match(G.world.portalBlockReason(G.state.grid[28][23]).text,/Lantern Mark/);}
 else{assert.equal(G.state.player.damageTaken,0);assert.equal(G.state.player.mana,G.playerMaxMana());}
 G.state.player.damageTaken=2;G.state.player.mana=0;at(G,x,y);G.tryOpeningInteraction();G.updateOpening(.05);r.drain();assert.equal(G.state.groundRewards.filter(g=>g.item===item).length,1);assert.equal(G.state.player.damageTaken,2,'pending completion cannot replay recovery');
 G.saveGame();const saved=G.loadSaveData();cross(r,exit);assert.equal(G.groundRewardsHere().length,0);cross(r,map);r.drain();G.state.enemies=[];
 G.state.groundRewards=G.normalizeGroundRewards(saved.groundRewards.map(g=>({...g,spirit:9999})));r.load(map);r.drain();G.state.enemies=[];
 if(map==='mistwood')assert.equal(G.world.solid(232,152),false);if(map==='glasswaterDesert')assert.equal(G.world.solid(376,312),false);
 Object.assign(G.state.player,G.world.safeArrival(gift.x,gift.y-24));const stars=G.state.stars;collect(r,item);assert.equal(G.ensureTown().spirit,earnedSpirit+amount);assert.equal(events.length,1);assert.equal(G.state.stars,stars);assert.equal(G.state.player.damageTaken,2,'claim cannot replay recovery');
 if(map==='starfallRuins'){assert.ok(G.starfallSurvey().thread);assert.ok(G.costumeUnlocked('starstrider'));assert.ok(G.normalizeWayfinder(null,{items:G.state.items}).discovered.includes('starfallRuins'));}
 G.saveGame();assert.ok(G.loadSaveData().items.includes(item));assert.equal(G.normalizeGroundRewards(saved.groundRewards).length,0);assert.equal(G.revealRegionalReward(item,gift.x,gift.y),null);
});
test('all regional legacy owners stay completed without another award, while unearned lens/bell/prism receipts are rejected',()=>{
 for(const [item,map,x,y]of cases){const r=setup(map),{G}=r;
  if(!item.startsWith('ridge-'))assert.equal(G.normalizeGroundRewards([{source:'regional',item,mapId:map,x:x*16+8,y:y*16+8}]).length,0);
  assert.equal(G.normalizeGroundRewards([{source:'regional',item,mapId:'town',x:100,y:100}]).length,0);
  G.state.items.push(item);r.load(map);r.drain();G.state.enemies=[];at(G,x,y);G.state.player.damageTaken=2;G.tryOpeningInteraction();G.updateOpening(.05);r.drain();assert.equal(G.groundRewardFor(item),null);assert.equal(G.ensureTown().spirit,20);assert.equal(G.state.player.damageTaken,2);
  if(map==='emberRidge')assert.equal(G.ridgeSurvey().lit,1);if(map==='mistwood')assert.equal(G.world.solid(232,152),false);if(map==='glasswaterDesert')assert.equal(G.world.solid(376,312),false);if(map==='starfallRuins')assert.ok(G.starfallSurvey().thread);
 }
});
