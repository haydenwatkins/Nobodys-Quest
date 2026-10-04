const test=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
const collect=require('./helpers/collect-treasure.cjs'),cross=require('./helpers/cross-road.cjs');
function setup(seal){
 const r=runtime(),{G}=r;G.state.claimedForms=['rat','knight'];G.state.stars=5;
 Object.assign(G.ensureTown(),{spirit:20});
 if(seal){G.state.opening.complete=true;Object.assign(G.state.delivery,{started:true,keeper:true,lamps:[2,2],parcels:['bread','letter','present']});}
 else{Object.assign(G.state.opening,{started:true,notice:true,cart:true,sluice:true,bell:true});G.state.items.push('trophy-heartwood-crown');}
 r.load(seal?'sunriseQuay':'orchardRoad');r.drain();G.state.enemies=[];
 Object.assign(G.state.player,{x:(seal?8:22)*16+8,y:(seal?20:37)*16+8});
 return r;
}
for(const seal of [false,true])test(`${seal?'Sunrise Seal':'Orchard Ribbon'} saves completed help separately from its item/spirit, survives the cart journey, and pays once on collection`,()=>{
 const r=setup(seal),{G}=r,item=seal?'sunrise-seal':'orchard-ribbon',amount=seal?8:5;
 const spirit=G.ensureTown().spirit,stars=G.state.stars;assert.ok(G.tryOpeningInteraction());r.drain();
 assert.ok(seal?G.state.delivery.complete:G.state.opening.complete);assert.ok(!G.state.items.includes(item));assert.equal(G.ensureTown().spirit,spirit);
 const gift=G.groundRewardFor(item);assert.equal(gift.source,'activity');assert.equal(G.deliveryGoal().mapId,gift.mapId);assert.ok(G.deliveryGoal().short.includes(G.groundRewardInfo(gift).name));
 G.saveGame();const saved=G.loadSaveData();assert.ok(saved.groundRewards.some(g=>g.item===item));
 Object.assign(G.state.player,{x:(seal?8:26)*16+8,y:(seal?20:37)*16+8});assert.ok(G.tryOpeningInteraction());r.drain();
 assert.equal(G.state.mapId,seal?'orchardRoad':'lanternReach');assert.equal(G.deliveryGoal().mapId,gift.mapId);
 if(seal){G.state.enemies=[];assert.ok(G.tryOpeningInteraction());r.drain();}else cross(r,'orchardRoad');
 assert.equal(G.state.mapId,gift.mapId);
 G.state.groundRewards=G.normalizeGroundRewards(saved.groundRewards.map(g=>({...g,spirit:9999})));r.load(gift.mapId);r.drain();
 Object.assign(G.state.player,G.world.safeArrival(gift.x-32,gift.y));collect(r,item);
 assert.equal(G.ensureTown().spirit,spirit+amount,'only the authored spirit amount is credited');assert.equal(G.state.stars,stars);
 G.saveGame();const owned=G.loadSaveData();assert.ok(owned.items.includes(item));assert.ok(!owned.groundRewards.some(g=>g.item===item));
 assert.equal(G.normalizeGroundRewards(saved.groundRewards).length,0);assert.equal(G.revealActivityReward(item,gift.x,gift.y),null);
 assert.equal(G.ensureTown().spirit,spirit+amount);
 if(seal)assert.equal(G.deliveryGoal(),null);
 else assert.equal(G.deliveryGoal().mapId,'lanternReach');
});
test('owned legacy thank-you items repair completion without another spirit bundle; unearned pending activities are rejected',()=>{
 for(const seal of [false,true]){
  const {G}=setup(seal),item=seal?'sunrise-seal':'orchard-ribbon';
  assert.equal(G.normalizeGroundRewards([{source:'activity',item,mapId:G.state.mapId,x:100,y:100}]).length,0);
  G.state.items.push(item);const spirit=G.ensureTown().spirit;assert.ok(G.tryOpeningInteraction());
  assert.equal(G.ensureTown().spirit,spirit);assert.equal(G.groundRewardFor(item),null);
 }
});
