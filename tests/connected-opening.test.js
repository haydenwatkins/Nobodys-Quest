'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs'),walk=require('./helpers/walk-road.cjs');
const at=(G,x,y)=>Object.assign(G.state.player,{x:x*16+8,y:y*16+8});
function cross(r,destination,dx,dy){
 const {G}=r,from=G.state.mapId;G.input.vec={x:dx,y:dy};
 for(let i=0;i<60&&G.state.mapId===from;i++){
  G.world.moveBox(G.state.player,dx*1.5,dy*1.5);G.world.checkTriggers(.02);r.drain();
 }
 G.input.vec={x:0,y:0};G.world.checkTriggers(.5);r.drain();
 assert.equal(G.state.mapId,destination);assert.ok(G.world.isSafeSpawn(G.state.player.x,G.state.player.y));
}
function position(G){return [G.state.mapId,G.state.player.x,G.state.player.y];}

test('Parcel explains the road in place, then the same feet walk east and back',()=>{
 const r=runtime(),{G}=r;G.state.opening.complete=true;r.load();r.drain();G.state.enemies=[];at(G,26,37);
 const start=position(G);assert.equal(G.deliveryCandidate().id,'depart');assert.ok(G.tryOpeningInteraction());r.drain();
 assert.deepEqual(position(G),start);assert.equal(G.state.delivery.started,true);
 assert.equal(G.journeyTravelLinks().length,0);
 const exit=G.localJourneyRoutes().find(route=>route.map==='lanternReach');
 assert.equal(exit.kind,'road');assert.equal(exit.x,63);assert.equal(exit.reason,null);
 walk(r,[[61,37]]);cross(r,'lanternReach',1,0);assert.equal(G.state.delivery.seen.filter(k=>k==='departure').length,1);
 walk(r,[[2,29]]);cross(r,'orchardRoad',-1,0);walk(r,[[26,37]]);
 assert.equal(G.deliveryCandidate(),null,'returning does not offer another cart trip');
 assert.equal(G.state.delivery.lamps[0],0);assert.equal(G.state.items.length,0,'walking creates no delivery credit or gift');
});

test('the east road waits for the orchard rescue and starts delivery on a direct walk',()=>{
 const r=runtime(),{G}=r;r.load();r.drain();at(G,61,37);
 assert.match(G.localJourneyRoutes().find(route=>route.map==='lanternReach').reason,/reopen/);
 G.input.vec={x:1,y:0};for(let i=0;i<60;i++){G.world.moveBox(G.state.player,1.5,0);G.world.checkTriggers(.02);}
 assert.equal(G.state.mapId,'orchardRoad');assert.equal(G.state.delivery.started,false);
 G.state.opening.complete=true;cross(r,'lanternReach',1,0);
 assert.equal(G.state.delivery.started,true);assert.equal(G.state.delivery.seen.filter(k=>k==='departure').length,1);
 assert.equal(G.deliveryGoal().mapId,'lanternReach');assert.equal(G.deliveryGoal().point[0],14);
 // Partial old deliveries must retain their return road even if the old
 // opening flags were absent. No chapter or lamp is re-earned.
 G.state.opening=G.normalizeOpening(undefined);G.state.delivery=G.normalizeDelivery({lamps:[1,0]});
 cross(r,'orchardRoad',-1,0);assert.equal(G.localJourneyRoutes().find(route=>route.map==='lanternReach').reason,null);
 cross(r,'lanternReach',1,0);assert.equal(G.state.delivery.lamps[0],1);
});

test('Rat walks beneath the roots and operates the far lever without being moved',()=>{
 const r=runtime(),{G}=r;G.state.claimedForms=['rat','knight'];r.load();r.drain();at(G,27,24);
 const start=position(G);assert.ok(G.tryOpeningInteraction());r.drain();assert.deepEqual(position(G),start);
 for(let i=0;i<80;i++)G.world.moveBox(G.state.player,1.5,0);
 assert.ok(G.state.player.x<29*16,'larger bodies cannot cross the drain');assert.equal(G.state.opening.sluice,false);
 G.setForm('rat');walk(r,[[30,24]]);assert.ok(G.smallPassageAt(G.state.player.x,G.state.player.y));
 G.state.opening.notice=true;G.state.opening.cart=true;
 assert.equal(G.openingGoal().point[0],34,'guidance continues to the lever after entering the culvert');
 const inside=position(G);G.setForm('knight');assert.equal(G.state.formId,'rat');assert.deepEqual(position(G),inside);
 G.saveGame();const saved=G.loadSaveData();assert.equal(saved.formId,'rat');assert.equal(saved.opening.sluice,false);
 G.world.load(saved.mapId,{x:saved.px/16-.5,y:saved.py/16-.5});r.drain();assert.deepEqual(position(G),inside);
 walk(r,[[34,24]]);assert.equal(G.openingInteractionCandidate().id,'sluice');
 const bank=position(G);G.state.mapReveal=0;assert.ok(G.tryOpeningInteraction());r.drain();
 assert.deepEqual(position(G),bank);assert.equal(G.state.mapReveal,0,'the lever does not flash the world');assert.equal(G.state.opening.sluice,true);
 G.setForm('knight');assert.equal(G.state.formId,'knight');walk(r,[[27,24]]);
 assert.equal(G.state.opening.sluice,true,'the open bridge remains a normal return route');
});

test('the recipe pocket is a Rat passage with a saved physical book and a walk out',()=>{
 const r=runtime(),{G}=r;G.state.opening.complete=true;G.state.delivery=G.normalizeDelivery({complete:true});G.state.claimedForms=['rat','knight'];
 r.load('lanternReach');r.drain();at(G,20,30);G.setForm('knight');
 const start=position(G);assert.ok(G.tryOpeningInteraction());r.drain();assert.deepEqual(position(G),start);
 for(let i=0;i<80;i++)G.world.moveBox(G.state.player,0,1.5);
 assert.ok(G.state.player.y<31*16,'the bank has no larger-body shortcut');assert.equal(G.state.delivery.salvage,false);
 G.setForm('rat');walk(r,[[20,31]]);G.setForm('knight');assert.equal(G.state.formId,'rat');
 walk(r,[[20,33]]);const gift=G.groundRewardFor('brindles-recipes');assert.ok(gift);assert.equal(G.state.items.includes(gift.item),false);
 const spirit=G.ensureTown().spirit;walk(r,[[20,30]]);G.setForm('knight');assert.equal(G.state.formId,'knight');
 G.saveGame();const saved=G.loadSaveData();assert.ok(saved.groundRewards.some(g=>g.item===gift.item));
 G.state.delivery=G.normalizeDelivery(saved.delivery);G.state.groundRewards=G.normalizeGroundRewards(saved.groundRewards);r.load('lanternReach');r.drain();
 assert.equal(G.groundRewardFor(gift.item).y,gift.y);assert.equal(G.ensureTown().spirit,spirit);
 at(G,20,30);G.setForm('rat');walk(r,[[20,33]]);require('./helpers/collect-treasure.cjs')(r,gift.item);
 assert.equal(G.ensureTown().spirit,spirit+3);walk(r,[[20,30],[20,33],[20,30]]);
 assert.equal(G.groundRewardFor(gift.item),null);assert.equal(G.ensureTown().spirit,spirit+3);
});

test('mill briars leave the sluice clear during a long arrival and retain the relocated enemy’s old saved credit',()=>{
 const r=runtime(),{G}=r;G.state.claimedForms=['rat'];r.load();r.drain();at(G,27,24);
 const briars=G.state.enemies.filter(e=>e.id==='orchardSpitter'),posts=briars.map(e=>[e.x,e.y]);
 G.state.enemies=briars;G.state.player.invuln=999;
 for(let i=0;i<1200;i++)G.updateEnemies(.05);
 assert.deepEqual(briars.map(e=>[e.x,e.y]),posts,'waiting before the passage cannot wander a briar into the lever');
 G.setForm('rat');
 // Keep native enemy AI active during the short crossing.
 for(let i=0;i<100&&G.state.player.x<34*16+6;i++){
  G.world.moveBox(G.state.player,1.5,0);G.updateEnemies(.02);
 }
 assert.equal(G.openingInteractionCandidate().id,'sluice');assert.ok(G.tryOpeningInteraction());r.drain();
 assert.equal(G.state.opening.sluice,true);
 const first=briars.find(e=>e.y===26*16+8&&e.openingKey==='orchardRoad:584,424');assert.ok(first);
 G.state.opening.defeated=['orchardRoad:584,424'];G.saveGame();const saved=G.loadSaveData();
 G.state.opening=G.normalizeOpening(saved.opening);r.load();r.drain();
 assert.ok(G.state.enemies.find(e=>e.openingKey==='orchardRoad:584,424').dead);
 assert.equal(G.state.enemies.filter(e=>e.id==='orchardSpitter'&&!e.dead).length,2);
});
