const test=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
const collect=require('./helpers/collect-treasure.cjs');
function setup(){
 const r=runtime(),{G}=r;G.state.opening.complete=true;
 G.state.delivery=G.normalizeDelivery({complete:true});G.state.claimedForms=['rat','knight'];
 Object.assign(G.ensureTown(),{founded:true,introduced:true,spirit:20});r.load('sunriseQuay');r.drain();
 return r;
}
function at(G,x,y){Object.assign(G.state.player,{x:x*16+8,y:y*16+8});}
function interact(r){assert.ok(r.G.tryOpeningInteraction());r.drain();}
test('Brindle’s accepted promise follows Rat entry, saved unclaimed book, safe re-entry, collection, thanks and a distinct revisit',()=>{
 const r=setup(),{G}=r;at(G,12,12);assert.ok(G.tryOpeningInteraction());const offer=r.messages.at(-1).options.offer;assert.ok(offer);offer.onAccept();r.drain();
 assert.equal(G.currentTask().requestId,'recipes');assert.equal(G.currentTask().ready,false);
 r.load('lanternReach');r.drain();at(G,18,30);G.setForm('rat');interact(r);
 assert.ok(G.state.delivery.salvage);assert.equal(G.state.player.x,328);assert.ok(G.groundRewardFor('brindles-recipes'));
 assert.equal(G.ensureTown().spirit,20);assert.ok(!G.state.items.includes('brindles-recipes'));assert.equal(G.currentTask().ready,false);
 assert.match(G.currentTask().short,/Collect/);assert.ok(G.recipeGiftApproach().point[1]>33);
 const gift=G.groundRewardFor('brindles-recipes');assert.ok(G.world.isSafeSpawn(gift.x,gift.y));
 const trail=[];G.requestGuidance(true);
 const ctx=new Proxy({translate:(x,y)=>trail.push([x,y])},{get:(o,k)=>k in o?o[k]:()=>{}});
 G.drawWorldGuidance(ctx,{x:0,y:0},G.state.time);
 assert.ok(trail.some(([x,y])=>x===Math.floor(gift.x/16)*16+8&&y===Math.floor(gift.y/16)*16+6),
  'the native breadcrumb path reaches the book tile inside the drain pocket');
 assert.equal(G.deliveryCandidate().id,'drainBack');interact(r);assert.equal(G.state.player.x,296);
 assert.deepEqual(Array.from(G.recipeGiftApproach().point),[18,30]);assert.match(G.currentTask().objective,/enter.*again/i);
 G.saveGame();const saved=G.loadSaveData();assert.ok(saved.delivery.salvage);assert.ok(saved.groundRewards.some(g=>g.item==='brindles-recipes'));
 G.state.delivery=G.normalizeDelivery(saved.delivery);G.state.groundRewards=G.normalizeGroundRewards(saved.groundRewards);r.load('lanternReach');r.drain();at(G,18,30);
 G.setForm('knight');interact(r);assert.equal(G.state.player.x,296,'the pocket still requires the earned Rat shape');assert.equal(G.ensureTown().spirit,20);
 G.setForm('rat');assert.match(G.deliveryCandidate().label,/Return/);interact(r);assert.equal(G.state.player.x,328);
 assert.equal(G.groundRewardFor('brindles-recipes').y,gift.y,'re-entry does not move or duplicate the saved book');collect(r,'brindles-recipes');
 assert.equal(G.ensureTown().spirit,23);assert.equal(G.currentTask().ready,true);assert.equal(G.currentTask().short,'Return to Brindle');
 assert.equal(G.deliveryCandidate().id,'drainBack');interact(r);at(G,18,30);assert.ok(!G.deliveryCandidate(),'the emptied pocket retains its original completed behavior');
 r.load('sunriseQuay');r.drain();at(G,12,12);assert.match(G.deliveryCandidate().label,/Good news/);interact(r);
 assert.equal(G.ensureTown().spirit,23);collect(r,'sunrise-thanks-recipes');
 assert.equal(G.ensureTown().spirit,28);assert.ok(G.sunriseRequests().find(r=>r.id==='recipes').done);assert.ok(G.state.items.includes('brindles-recipes'));
 assert.equal(G.followedSunriseRequest(),null);G.saveGame();assert.ok(G.loadSaveData().town.requests.includes('recipes'));
 at(G,12,12);assert.ok(G.tryOpeningInteraction());assert.match(r.messages.at(-1).text,/generous thumb/);r.drain();assert.equal(G.ensureTown().spirit,28);
 assert.equal(G.normalizeGroundRewards(saved.groundRewards).length,0);
});
test('legacy salvage still counts, while legacy owned recipes cannot replay salvage spirit when flags are repaired',()=>{
 const r=setup(),{G}=r;G.state.delivery.salvage=true;assert.ok(G.sunriseRequests().find(r=>r.id==='recipes').ready,'older immediate salvage credit remains recognized');
 G.state.delivery.salvage=false;G.state.items.push('brindles-recipes');r.load('lanternReach');r.drain();at(G,18,30);G.setForm('rat');interact(r);
 assert.ok(G.state.delivery.salvage);assert.equal(G.ensureTown().spirit,20);assert.equal(G.groundRewardFor('brindles-recipes'),null);
});
