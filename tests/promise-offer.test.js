const collect=require('./helpers/collect-treasure.cjs');
const test=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');
function fixture(){const r=runtime(),{G}=r;G.state.opening.complete=G.state.delivery.complete=true;r.load('sunriseQuay');r.drain();G.state.enemies=[];r.run('js/engine/ui.js');
 const paint=[];r.nodes.get('ui').getContext('2d').fillText=t=>paint.push(String(t));
 return {...r,paint,draw(){paint.length=0;G.ui.drawHUD({x:0,y:0});}};}
function listen(r){for(let i=0;i<15;i++){r.draw();if(r.paint.some(t=>t.endsWith('Maybe later')))return;r.taps.add('interact');r.G.ui.update(.3);}assert.fail('the request must end with an explicit offer');}
function reply(r,action){r.taps.add(action);r.G.ui.update(.2);}

test('hearing and deferring another promise preserves the chosen task and does not save or award anything',()=>{
 const r=fixture(),{G}=r;G.followSunriseRequest('beacon');const town=JSON.stringify(G.state.town),items=JSON.stringify(G.state.items);
 let saves=0;G.saveGame=()=>saves++;Object.assign(G.state.player,{x:12*16+8,y:12*16+8});
 assert.equal(G.tryOpeningInteraction(),true);listen(r);
 assert.equal(G.followedSunriseRequest().id,'beacon');assert.equal(saves,0);
 assert.ok(r.paint.some(t=>t.includes('cinnamon pages')));reply(r,'pause');
 assert.equal(G.ui.dialogueOpen,false);assert.equal(JSON.stringify(G.state.town),town);
 assert.equal(JSON.stringify(G.state.items),items);assert.equal(saves,0);
});

test('each native NPC offer explicitly follows and saves its promise once, while a repeat conversation keeps it',()=>{
 const r=fixture(),{G}=r;const spirit=G.state.town.spirit;
 for(const [id,name,x,y]of [['beacon','Pebble',22,20],['recipes','Brindle',12,12],['dragon','Pip',28,26],['welcome','Mara',30,13]]){
  Object.assign(G.state.player,{x:x*16+8,y:y*16+8});assert.equal(G.deliveryCandidate().id,id);
  G.tryOpeningInteraction();listen(r);reply(r,'interact');assert.equal(G.ui.dialogueOpen,false);
  assert.equal(G.followedSunriseRequest().id,id);assert.equal(G.currentTask().name,name);
  assert.equal(G.loadSaveData().town.followedRequest,id);assert.equal(G.state.town.spirit,spirit);
  G.tryOpeningInteraction();for(let i=0;i<10&&G.ui.dialogueOpen;i++)reply(r,'interact');
  assert.equal(G.ui.dialogueOpen,false);assert.equal(G.followedSunriseRequest().id,id);
  assert.equal(G.state.town.requests.length,0,'acceptance is not completion');
 }
});

test('ready and completed accomplishments use native thanks instead of asking to accept them again; other dialogue remains deliberate and queued',()=>{
 const r=fixture(),{G}=r;G.state.delivery.salvage=true;Object.assign(G.state.player,{x:12*16+8,y:12*16+8});const before=G.state.town.spirit;
 G.tryOpeningInteraction();for(let i=0;i<12&&G.ui.dialogueOpen;i++){r.draw();assert.ok(!r.paint.some(t=>t.endsWith('Maybe later')));reply(r,'interact');}
 assert.equal(G.state.town.spirit,before);collect(r,'sunrise-thanks-recipes');
 assert.equal(G.state.town.spirit,before+5);assert.equal(G.followedSunriseRequest(),null);
 G.tryOpeningInteraction();for(let i=0;i<12&&G.ui.dialogueOpen;i++)reply(r,'interact');assert.equal(G.state.town.spirit,before+5);
 let closed=0;G.ui.dialogue('PEBBLE','A small ordinary conversation.',{onClose:()=>closed++});G.ui.dialogue('BRINDLE','And another.');
 for(let i=0;i<12&&G.ui.dialogueOpen;i++)reply(r,'interact');assert.equal(G.ui.dialogueOpen,false);assert.equal(closed,1);
 r.load('dungeon');for(let i=0;i<12&&G.ui.dialogueOpen;i++)reply(r,'interact');
 let accepted=0;G.ui.dialogue('PEBBLE','A choice beyond the paper layout.',{offer:{prompt:'Would you like to help?',onAccept:()=>accepted++}});
 listen(r);assert.equal(accepted,0);reply(r,'interact');reply(r,'interact');assert.equal(accepted,1);assert.equal(G.ui.dialogueOpen,false);
});
