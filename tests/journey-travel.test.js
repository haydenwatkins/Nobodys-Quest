'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');

function completed(){const r=runtime(),{G}=r;G.state.opening=G.normalizeOpening({started:true,notice:true,cart:true,sluice:true,bell:true,complete:true});G.state.delivery=G.normalizeDelivery({complete:true});G.state.stars=100;G.state.claimedForms=G.formOrder.filter(id=>id!=='nobody');G.state.known=G.formOrder.slice();G.questsDone=G.formOrder.flatMap(id=>G.forms[id].quests.map(q=>q.id));return r;}

test('the authored story and its destination survive leaving Orchard Road',()=>{
  const r=runtime(),{G}=r;r.load();G.beginOpening();r.drain();
  assert.ok(G.state.opening.started);
  r.load('overworld');r.drain();
  assert.equal(G.storyGoal().short,'Read the notice beside the road');
  assert.equal(G.storyGoal().mapId,'orchardRoad');
  G.state.claimedForms=['rat'];G.state.town.founded=true;
  assert.equal(G.townUnlocked(),false,'old early auto-founding must not bypass the delivery');
  assert.equal(G.expeditionUnlocked(),false);
  assert.equal(G.visitTown(),false);
  G.state.opening.complete=true;r.load('orchardRoad');r.drain();
  G.state.delivery.started=true;
  const guide=G.guidanceTarget();
  assert.equal(guide.link.map,'lanternReach');
  assert.equal(guide.tileX,26);
  assert.match(guide.text,/Parcel/);
});

test('old campaign saves keep their town and do not acquire the opening',()=>{
  const r=runtime(),{G}=r;G.state.opening=G.normalizeOpening(undefined);G.state.claimedForms=['rat'];r.load('overworld');r.drain();
  assert.equal(G.state.opening.started,false);assert.ok(G.townUnlocked());
  assert.notEqual(G.storyGoal().guide,'opening');
});

test('story road discoveries persist without counting as legacy regions',()=>{
  const r=runtime(),{G}=r;r.load('orchardRoad');r.drain();
  assert.ok(G.wayfinderDiscovered('orchardRoad'));assert.equal(G.wayfinderProgress().found,0);
  const migrated=G.normalizeWayfinder(G.state.wayfinder,{mapId:'orchardRoad',opening:{started:true},items:['knights-crest','trophy-heartwood-crown']});
  assert.ok(migrated.discovered.includes('orchardRoad'));
  assert.ok(!migrated.discovered.includes('dungeon'));assert.ok(!migrated.discovered.includes('mistwood'));
  assert.equal(G.state.wayfinderPost,null,'do not draw a nonfunctional post on the story road');
});

test('local exits disclose real story gates and the cart route',()=>{
  const r=runtime(),{G}=r;r.load();
  assert.match(G.localJourneyRoutes().find(route=>route.map==='heartwood').reason,/bell/);
  G.state.opening.bell=true;assert.equal(G.localJourneyRoutes().find(route=>route.map==='heartwood').reason,null);
  G.state.opening.complete=true;assert.ok(G.localJourneyRoutes().some(route=>route.kind==='cart'&&route.map==='lanternReach'));
  r.load('lanternReach');assert.match(G.localJourneyRoutes().find(route=>route.map==='tollCourt').reason,/lanterns/);
});

test('eight road entrances cross with the actual feet box and retain safe return points',()=>{
  const r=completed(),{G}=r;
  for(const [from,x,y,dx,dy,to]of [
    ['orchardRoad',2,36,-1,0,'overworld'],['overworld',59,45,-1,0,'orchardRoad'],
    ['lanternReach',57,18,1,0,'tollCourt'],['tollCourt',2,17,-1,0,'lanternReach'],
    ['tollCourt',31,17,1,0,'sunriseQuay'],['sunriseQuay',2,19,-1,0,'tollCourt'],
    ['sunriseQuay',41,19,1,0,'town'],['town',2,8,-1,0,'sunriseQuay'],
  ]){
    G.world.load(from,{x,y});r.drain();G.input.vec={x:0,y:0};G.world.checkTriggers(.5);r.drain();
    G.input.vec={x:dx,y:dy};
    for(let n=0;n<80&&G.state.mapId===from;n++) {G.world.moveBox(G.state.player,dx*1.5,dy*1.5);G.world.checkTriggers(.02);r.drain();}
    assert.equal(G.state.mapId,to,`${from} → ${to}`);
    assert.ok(G.world.isSafeSpawn(G.state.player.x,G.state.player.y),`${to} arrival`);
    G.input.vec={x:0,y:0};G.world.checkTriggers(.5);assert.equal(G.state.mapId,to,'neutral input cannot bounce back');
  }
});

test('arrival protection releases after walking away, even with a continuously held stick',()=>{
  const r=completed(),{G}=r;G.world.load('sunriseQuay',{x:4,y:19});r.drain();
  G.input.vec={x:1,y:0};
  for(let n=0;n<40;n++){G.world.moveBox(G.state.player,1.5,0);G.world.checkTriggers(.02);}
  assert.equal(G.state.portalNeedsRelease,false);
  G.state.zoneTransition={snapshot:'old'};G.state.openingHazards=[{}];
  G.world.load('town',{x:0,y:8});r.drain();
  assert.equal(G.state.zoneTransition,null);assert.equal(G.state.openingHazards.length,0);
  assert.ok(G.world.isSafeSpawn(G.state.player.x,G.state.player.y),'arrival placed on a portal is repaired');
  assert.equal(G.world.isSafeSpawn(NaN,Infinity),false);
});

test('a held travel direction cannot retrigger the portal we just arrived through',()=>{
  const r=completed(),{G}=r;G.world.load('orchardRoad');G.input.vec={x:-1,y:0};
  G.world.load('overworld',{x:59,y:45});r.drain();
  for(let n=0;n<50;n++){G.world.moveBox(G.state.player,-1.5,0);G.world.checkTriggers(.02);r.drain();}
  assert.equal(G.state.mapId,'overworld');
  G.input.vec={x:0,y:0};G.world.checkTriggers(.5);
  assert.equal(G.state.portalNeedsRelease,false);
  G.world.load('sunriseQuay');G.input.vec={x:1,y:0};G.world.load('town',{x:2,y:8});r.drain();
  for(let n=0;n<50;n++){G.world.moveBox(G.state.player,1.5,0);G.world.checkTriggers(.02);r.drain();}
  assert.equal(G.state.mapId,'town');assert.equal(G.state.portalNeedsRelease,false);
});

test('completed deliveries replace the quay instructions without hiding the next campaign goal',()=>{
  const r=completed(),{G}=r;r.load('sunriseQuay');
  assert.match(G.journeyStop('sunriseQuay').clue,/deliveries are complete/);
  assert.doesNotMatch(G.journeyStop('sunriseQuay').clue,/Deliver the parcels/);
  assert.ok(G.storyGoal().short);
});
