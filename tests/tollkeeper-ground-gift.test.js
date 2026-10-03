const test=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
const collect=require('./helpers/collect-treasure.cjs'),cross=require('./helpers/cross-road.cjs');
function setup(){
 const r=runtime(),{G}=r;G.state.opening.complete=true;G.state.claimedForms=['rat','knight'];
 Object.assign(G.state.delivery,{started:true,lamps:[2,2]});r.load('tollCourt');r.drain();
 const e=G.state.enemies.find(e=>e.id==='tollkeeper');e.bossEngaged=true;e.bossIntroT=0;G.state.bossCutscene=null;
 return {...r,e};
}
test('defeated Tollkeeper opens the bridge while a saved lantern/star waits for real collection and delivery guidance',()=>{
 const r=setup(),{G,e}=r,stars=G.state.stars;
 G.combat.damageEnemy(e,{damage:100,type:'blunt',knockback:0});G.updateOpening(.05);r.drain();
 assert.ok(e.dead);assert.ok(G.state.delivery.keeper);assert.equal(G.state.stars,stars);assert.ok(!G.state.items.includes('keeper-lantern'));
 const gift=G.groundRewardFor('keeper-lantern');assert.equal(gift.source,'delivery');assert.ok(G.world.isSafeSpawn(gift.x,gift.y));
 assert.equal(G.openingCellBlocked(28*16+8,17*16+8),false,'bridge opens from accomplishment without needing its own gift');
 assert.match(G.deliveryGoal().short,/Collect.*Lantern/);assert.equal(G.deliveryGoal().mapId,'tollCourt');
 assert.ok(Math.hypot(G.openingTarget().x-gift.x,G.openingTarget().y-gift.y)<=12);
 G.saveGame();const saved=G.loadSaveData();assert.ok(saved.delivery.keeper);assert.ok(saved.groundRewards.some(g=>g.item==='keeper-lantern'));
 cross(r,'lanternReach');cross(r,'tollCourt');assert.ok(G.state.enemies.every(e=>e.dead));
 G.state.delivery.complete=true;assert.match(G.deliveryGoal().short,/Collect.*Lantern/,'finishing parcels early cannot hide unclaimed treasure');G.state.delivery.complete=false;
 cross(r,'sunriseQuay');assert.equal(G.deliveryGoal().mapId,'tollCourt');assert.ok(G.deliveryCandidate()===null);
 cross(r,'tollCourt');assert.ok(G.state.enemies.every(e=>e.dead));
 G.state.delivery=G.normalizeDelivery(saved.delivery);G.state.groundRewards=G.normalizeGroundRewards(saved.groundRewards);r.load('tollCourt');r.drain();
 assert.ok(G.state.enemies.every(e=>e.dead));assert.equal(G.state.stars,stars);Object.assign(G.state.player,G.world.safeArrival(gift.x-32,gift.y));collect(r,'keeper-lantern');
 assert.equal(G.state.stars,stars+1);assert.equal(G.deliveryGoal().mapId,'sunriseQuay');assert.match(G.deliveryGoal().short,/Brindle/);
 G.saveGame();assert.ok(G.loadSaveData().items.includes('keeper-lantern'));assert.equal(G.normalizeGroundRewards(saved.groundRewards).length,0);
 const rematch=G.makeEnemy('tollkeeper',e.x,e.y);G.state.enemies.push(rematch);G.combat.damageEnemy(rematch,{damage:100,type:'blunt',knockback:0});r.drain();
 assert.equal(G.state.stars,stars+1);assert.equal(G.groundRewardFor('keeper-lantern'),null);
});
test('owned legacy lantern cannot become another star or pending gift when bridge flags are repaired by victory',()=>{
 const {G,e}=setup();G.state.items.push('keeper-lantern');const stars=G.state.stars;
 G.combat.damageEnemy(e,{damage:100,type:'blunt',knockback:0});
 assert.ok(G.state.delivery.keeper);assert.equal(G.state.stars,stars);assert.equal(G.groundRewardFor('keeper-lantern'),null);
 assert.equal(G.normalizeGroundRewards([{source:'delivery',item:'made-up',mapId:'tollCourt',x:200,y:200}]).length,0);
});
