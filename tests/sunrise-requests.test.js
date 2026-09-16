const test=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');
function setup(){const r=runtime();r.G.state.delivery=r.G.normalizeDelivery({complete:true});r.load('sunriseQuay');r.drain();r.G.state.enemies=[];return r;}
function visit(G,x,y){G.state.player.x=x*16+8;G.state.player.y=y*16+8;}
test('neighbour requests unlock after delivery and require the actual accomplishment',()=>{
 const {G}=setup();G.state.delivery.complete=false;assert.equal(G.sunriseRequests().length,0);
 G.state.delivery.complete=true;visit(G,12,12);const spirit=G.state.town.spirit;
 assert.equal(G.deliveryCandidate().kind,'sunriseRequest');G.tryOpeningInteraction();assert.equal(G.state.town.spirit,spirit);
 assert.equal(G.sunriseRequests().filter(r=>r.ready).length,0);
 G.state.mapId='town';assert.notEqual(G.deliveryCandidate()?.kind,'sunriseRequest');
});
test('all three promises count past accomplishments and reward once across save normalization',()=>{
 const {G,messages}=setup();G.state.delivery.salvage=true;G.ensureExpeditionProgress().victories=1;G.state.town.projects.welcomeLodge=true;
 let spirit=G.state.town.spirit,saves=0;G.saveGame=()=>saves++;
 for(const [id,x,y,reward] of [['recipes',12,12,5],['dragon',28,26,6],['welcome',30,13,5]]){
  visit(G,x,y);assert.equal(G.deliveryCandidate().id,id);G.tryOpeningInteraction();spirit+=reward;assert.equal(G.state.town.spirit,spirit);
  assert.ok(G.sunriseRequests().find(r=>r.id===id).done);
  G.state.town=G.normalizeTown(JSON.parse(JSON.stringify(G.state.town)));G.tryOpeningInteraction();assert.equal(G.state.town.spirit,spirit);
 }
 assert.equal(saves,3);assert.ok(messages.some(m=>m.text.includes('Cinnamon knots')));
 const c=new Proxy({},{get:()=>()=>{}});for(const d of G.openingDrawables(c))d.fn();
});
test('failed expeditions do not qualify and unsafe interactions cannot claim',()=>{
 const {G}=setup();G.ensureExpeditionProgress().runs=5;assert.equal(G.sunriseRequests().find(r=>r.id==='dragon').ready,false);
 G.state.items.push('brindles-recipes');assert.equal(G.sunriseRequests().find(r=>r.id==="recipes").ready,true);visit(G,12,12);
 for(const flag of ['knockout','bossCutscene','expeditionRun']){G.state[flag]=true;assert.notEqual(G.deliveryCandidate()?.kind,'sunriseRequest');G.state[flag]=null;}
 G.ui.dialogueOpen=true;assert.equal(G.deliveryCandidate(),null);G.ui.dialogueOpen=false;
 G.state.enemies=[{def:{},x:G.state.player.x,y:G.state.player.y}];assert.equal(G.deliveryCandidate(),null);
 assert.equal(G.normalizeTown({requests:'bad'}).requests.length,0);
 assert.equal(G.normalizeTown({requests:['recipes','recipes','fake']}).requests.join(','),'recipes');
});


test('following a promise persists, routes across maps, and switches to its neighbour when ready',()=>{
 const r=setup(),{G}=r;const campaign=G.storyGoal().short;
 assert.equal(G.followSunriseRequest('invalid'),false);assert.equal(G.followSunriseRequest('recipes'),true);
 G.state.town=G.normalizeTown(JSON.parse(JSON.stringify(G.state.town)));
 assert.equal(G.followedSunriseRequest().id,'recipes');assert.equal(G.storyGoal().short,campaign);
 let target=G.guidanceTarget();assert.equal(target.kind,'home');assert.ok(target.tileX!==undefined);
 r.load('lanternReach');r.drain();target=G.guidanceTarget();assert.equal(target.tileX,18);assert.equal(target.tileY,30);assert.match(target.text,/Rat/);
 G.state.delivery.salvage=true;assert.match(G.guidanceTarget().text,/Brindle/);
 r.load('sunriseQuay');r.drain();assert.equal(G.guidanceTarget().tileX,12);
 visit(G,12,12);G.tryOpeningInteraction();assert.equal(G.followedSunriseRequest(),null);
 assert.equal(G.followSunriseRequest('recipes'),false);
});
test('Pip tracks victory rather than entry and Mara gives a building instruction instead of a false trail',()=>{
 const {G}=setup();G.followSunriseRequest('dragon');assert.equal(G.guidanceTarget().tileX,35);
 G.state.expeditionRun={};assert.equal(G.sunriseRequestTarget(),null);G.state.expeditionRun=null;
 G.ensureExpeditionProgress().victories=1;assert.equal(G.guidanceTarget().tileX,28);
 G.followSunriseRequest('welcome');assert.equal(G.guidanceTarget().spatial,false);assert.match(G.guidanceTarget().text,/12 spirit/);
 G.state.town.projects.welcomeLodge=true;assert.equal(G.guidanceTarget().tileX,30);
 G.followSunriseRequest(null);assert.equal(G.followedSunriseRequest(),null);
 assert.equal(G.normalizeTown({followedRequest:'fake'}).followedRequest,null);
 assert.equal(G.normalizeTown({followedRequest:'recipes',requests:['recipes']}).followedRequest,null);
});

test('the harbour beacon connects a real Queen victory to a permanent, once-only home reward',()=>{
 const r=setup(),{G}=r;G.followSunriseRequest('beacon');assert.equal(G.followedSunriseRequest().ready,false);
 assert.equal(G.guidanceTarget().kind,'home');r.load('sunkenMarsh');r.drain();
 const queen=G.state.enemies.find(e=>e.id==='mireQueen');assert.equal(G.guidanceTarget().tileX,Math.floor(queen.x/G.TILE));
 queen.bossEngaged=true;queen.bossIntroT=0;G.state.bossCutscene=null;
 G.combat.damageEnemy(queen,{damage:5,type:'dark'});G.combat.damageEnemy(queen,{damage:100,type:'dark'});
 assert.ok(G.state.items.includes('trophy-mire-pearl'));assert.equal(G.followedSunriseRequest().ready,true);
 r.load('sunriseQuay');r.drain();visit(G,22,20);assert.equal(G.deliveryCandidate().id,'beacon');
 const before=G.state.town.spirit;G.tryOpeningInteraction();assert.equal(G.state.town.spirit,before+8);assert.equal(G.followedSunriseRequest(),null);
 G.state.town=G.normalizeTown(JSON.parse(JSON.stringify(G.state.town)));G.tryOpeningInteraction();assert.equal(G.state.town.spirit,before+8);
 assert.ok(G.state.items.includes('trophy-mire-pearl'),'the campaign trophy stays in inventory');
 assert.match(G.npcDialogue('pebble',0,0),/turnips/);
 const c=new Proxy({},{get:()=>()=>{}});for(const d of G.openingDrawables(c))d.fn();
});
test('earlier pearl victories qualify for the beacon without repeating the fight',()=>{
 const {G}=setup();G.state.items.push('trophy-mire-pearl');assert.equal(G.sunriseRequests().find(r=>r.id==='beacon').ready,true);
 G.followSunriseRequest('beacon');assert.equal(G.guidanceTarget().tileX,22);
 const saved=G.normalizeTown({followedRequest:'beacon',requests:[]});assert.equal(saved.followedRequest,'beacon');
});
