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
 G.state.items.push('brindles-recipes');assert.equal(G.sunriseRequests()[0].ready,true);visit(G,12,12);
 for(const flag of ['knockout','bossCutscene','expeditionRun']){G.state[flag]=true;assert.notEqual(G.deliveryCandidate()?.kind,'sunriseRequest');G.state[flag]=null;}
 G.ui.dialogueOpen=true;assert.equal(G.deliveryCandidate(),null);G.ui.dialogueOpen=false;
 G.state.enemies=[{def:{},x:G.state.player.x,y:G.state.player.y}];assert.equal(G.deliveryCandidate(),null);
 assert.equal(G.normalizeTown({requests:'bad'}).requests.length,0);
 assert.equal(G.normalizeTown({requests:['recipes','recipes','fake']}).requests.join(','),'recipes');
});

