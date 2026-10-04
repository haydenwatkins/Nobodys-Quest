const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
const collect=require('./helpers/collect-treasure.cjs'),cross=require('./helpers/cross-road.cjs');
function setup(withSeed=true){const r=runtime(),{G}=r;G.state.opening.complete=true;G.state.delivery.complete=true;if(withSeed)G.state.items.push('whispering-seed');G.ensureTown().spirit=20;r.load('whispering-grove');r.drain();G.state.enemies=[];Object.assign(G.state.player,{x:88,y:232,damageTaken:2,mana:0});return r;}
test('the Grove restores its shelter, shortcut and recovery before its saved six-spirit gift is collected',()=>{
 const r=setup(),{G}=r,p=G.state.player;assert.ok(G.tryOpeningInteraction());r.drain();
 const gift={...G.groundRewardFor('grove-home-tree')};assert.equal(gift.source,'regional');assert.ok(G.groveSurvey().planted);assert.ok(G.groveSurvey().pending);
 assert.ok(!G.state.items.includes(gift.item));assert.ok(G.state.items.includes('whispering-seed'));assert.equal(G.ensureTown().spirit,20);assert.equal(p.damageTaken,0);assert.equal(p.mana,G.playerMaxMana());
 for(const y of [8,9])assert.equal(G.world.solid(232,y*16+8),false);assert.equal(G.maps['whispering-grove'].tiles[8][14],'t');
 p.damageTaken=2;p.mana=0;G.tryOpeningInteraction();r.drain();assert.equal(p.damageTaken,2);assert.equal(p.mana,0,'planting cannot repeat recovery while the gift waits');
 assert.equal(G.state.groundRewards.filter(g=>g.item===gift.item).length,1);G.saveGame();const saved=G.loadSaveData();
 cross(r,'overworld');cross(r,'whispering-grove');r.drain();G.state.enemies=[];assert.ok(G.groveSurvey().pending);assert.equal(G.world.solid(232,136),false);
 G.state.groundRewards=G.normalizeGroundRewards(saved.groundRewards.map(g=>({...g,spirit:9999})));r.load('whispering-grove');r.drain();G.state.enemies=[];
 const restored=G.groundRewardFor(gift.item);Object.assign(p,G.world.safeArrival(restored.x,restored.y-24));let pickups=0;G.events.on('pickup',e=>{if(e.item===gift.item)pickups++;});collect(r,gift.item);
 assert.equal(G.ensureTown().spirit,26);assert.equal(pickups,1);assert.equal(p.damageTaken,2);assert.equal(p.mana,0,'collection cannot replay the shelter recovery');assert.equal(G.groveSurvey().pending,false);
 G.saveGame();assert.equal(G.loadSaveData().groundRewards.length,0);assert.equal(G.normalizeGroundRewards(saved.groundRewards).length,0);assert.equal(G.revealRegionalReward(gift.item,88,232),null);
});
test('an uncollected seed cannot plant or validate a shelter receipt, and legacy shelter ownership never creates another reward',()=>{
 const r=setup(false),{G}=r;const box=G.state.chests.find(c=>c.chest.item==='whispering-seed');Object.assign(G.state.player,{x:box.x*16+8,y:box.y*16+8});G.world.checkTriggers(.05);r.drain();
 assert.ok(G.groundRewardFor('whispering-seed'));assert.equal(G.normalizeGroundRewards([{source:'regional',item:'grove-home-tree',mapId:'whispering-grove',x:88,y:256}]).length,0);
 Object.assign(G.state.player,{x:88,y:232});G.tryOpeningInteraction();r.drain();assert.equal(G.groveSurvey().planted,false);assert.equal(G.world.solid(232,136),true);
 G.state.items.push('grove-home-tree');const spirit=G.ensureTown().spirit;r.load('whispering-grove');r.drain();G.state.enemies=[];Object.assign(G.state.player,{x:88,y:232,damageTaken:2,mana:0});
 G.tryOpeningInteraction();r.drain();assert.ok(G.groveSurvey().planted);assert.equal(G.groveSurvey().pending,false);assert.equal(G.world.solid(232,136),false);assert.equal(G.ensureTown().spirit,spirit);assert.equal(G.state.player.damageTaken,2);assert.equal(G.state.player.mana,0);
});
