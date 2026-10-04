const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
const collect=require('./helpers/collect-treasure.cjs'),cross=require('./helpers/cross-road.cjs');
const stops=[['marsh-north-sluice',15,3,2],['marsh-south-sluice',15,15,2],['marsh-ferry-token',3,3,6]];
function setup(){const r=runtime(),{G}=r;G.state.opening.complete=true;G.state.delivery.complete=true;G.state.claimedForms=['rat'];G.state.stars=4;Object.assign(G.ensureTown(),{spirit:20});r.load('sunkenMarsh');r.drain();G.state.enemies=G.state.enemies.filter(e=>e.id==='mireQueen');return r;}
test('Marsh accomplishments, ward weakening and opened art persist while each spirit bundle waits for collection',()=>{
 const r=setup(),{G}=r,e=G.state.enemies[0],events=[];G.events.on('pickup',event=>events.push(event.item));
 for(const [item,x,y]of stops){
  if(item==='marsh-ferry-token')G.setForm('rat');
  Object.assign(G.state.player,{x:x*16+8,y:y*16+8});assert.ok(G.tryOpeningInteraction());r.drain();
  const gift=G.groundRewardFor(item);assert.equal(gift.source,'regional');assert.ok(G.world.isSafeSpawn(gift.x,gift.y));
  assert.ok(!G.state.items.includes(item));assert.equal(G.ensureTown().spirit,20);assert.equal(events.length,0);
  G.tryOpeningInteraction();r.drain();assert.equal(G.groundRewardFor(item),gift);assert.equal(G.state.groundRewards.filter(g=>g.item===item).length,1);
 }
 assert.equal(e.ward.hp,3);assert.equal(G.marshSurvey().sluices,2);assert.equal(G.marshSurvey().salvagePending,true);assert.equal(G.marshSurvey().sluiceGifts,2);
 G.saveGame();const saved=G.loadSaveData();assert.equal(saved.groundRewards.length,3);
 cross(r,'overworld');assert.equal(G.groundRewardsHere().length,0);cross(r,'sunkenMarsh');r.drain();
 assert.equal(G.state.enemies.find(e=>e.id==='mireQueen').ward.hp,3);assert.equal(G.marshSurvey().sluices,2);
 G.state.groundRewards=G.normalizeGroundRewards(saved.groundRewards.map(g=>({...g,spirit:9999})));r.load('sunkenMarsh');r.drain();G.state.enemies=[];
 let expected=20;const stars=G.state.stars;
 for(const [item,,,amount]of stops){const gift=G.groundRewardFor(item);Object.assign(G.state.player,G.world.safeArrival(gift.x,gift.y-24));collect(r,item);expected+=amount;assert.equal(G.ensureTown().spirit,expected);assert.equal(events.filter(id=>id===item).length,1);assert.equal(G.revealRegionalReward(item,gift.x,gift.y),null);}
 assert.equal(G.state.stars,stars);assert.equal(G.marshSurvey().sluiceGifts,0);assert.equal(G.marshSurvey().salvagePending,false);
 G.saveGame();assert.equal(G.loadSaveData().groundRewards.length,0);assert.equal(G.normalizeGroundRewards(saved.groundRewards).length,0);
});
test('uncollected Marsh gifts survive native knockout; owned legacy mechanisms never repay; regional receipts reject wrong maps and items',()=>{
 const r=setup(),{G}=r;G.state.enemies=[];Object.assign(G.state.player,{x:248,y:56});G.tryOpeningInteraction();r.drain();
 const gift={...G.groundRewardFor('marsh-north-sluice')};G.state.player.invuln=0;G.damagePlayer(100);r.drain();assert.ok(G.groundRewardFor(gift.item));assert.equal(G.marshSurvey().sluices,1);
 assert.equal(G.normalizeGroundRewards([{...gift,mapId:'town'},{...gift,item:'trophy-mire-pearl'}]).length,0);
 r.load('town');r.drain();assert.equal(G.revealRegionalReward('marsh-south-sluice',100,100),null);
 G.state.items.push(...stops.map(s=>s[0]));const spirit=G.ensureTown().spirit;r.load('sunkenMarsh');r.drain();G.state.enemies=[];
 for(const [,x,y]of stops){Object.assign(G.state.player,{x:x*16+8,y:y*16+8});assert.notEqual(G.openingInteractionCandidate()?.kind,'marsh');G.tryOpeningInteraction();r.drain();}
 assert.equal(G.state.groundRewards.length,0);assert.equal(G.marshSurvey().sluices,2);assert.equal(G.marshSurvey().salvage,true);assert.equal(G.ensureTown().spirit,spirit);
});
