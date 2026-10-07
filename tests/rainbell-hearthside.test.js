const {test}=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs'),walk=require('../tools/lib/walk-grid.cjs');

function setup(formId){
  const r=runtime(),{G}=r;
  Object.assign(G.state.opening,{started:true,complete:true,bell:true,version:2});G.state.delivery.complete=true;
  G.state.claimedForms=['rat','knight','wizard','ranger','frog','alchemist',formId];
  G.state.stars=18;G.state.items=['trophy-heartwood-crown','trophy-mire-pearl'];
  G.ensureTown().requests=['recipes','beacon'];G.setForm(formId);
  const road=G.EARLY_FORM_ROADS.find(r=>r.formId===formId);r.load(road.id);r.drain();return {r,G,road};
}
function aim(G,[x,y]){const p=G.state.player,dx=x*16+8-p.x,dy=y*16+8-p.y,d=Math.hypot(dx,dy)||1;p.dir={x:dx/d,y:dy/d};}
function cast(r,button,frames=35){
  const {G}=r,ability=G.getLoadout(G.state.formId)[['a','b','c'].indexOf(button)];
  // The feet-only route helper does not tick mana/cooldowns. Let the
  // native recovery run before the next input; never grant either value.
  for(let i=0;i<200&&(G.state.player.mana<G.abilityManaCost(G.abilities[ability])||(G.state.player.cooldowns[ability]||0)>0);i++){G.state.time+=.05;G.updatePlayer(.05);G.combat.updateProjectiles(.05);}
  r.taps.add(button);for(let i=0;i<frames;i++){G.state.time+=.05;G.updatePlayer(.05);G.combat.updateProjectiles(.05);G.updateFx(.05);}r.drain();
}

test('one native chain links three relays across water; a single shot, incomplete chain and a wall cannot power a bridge',()=>{
  const {r,G,road}=setup('stormcaller');
  G.state.enemies=G.state.enemies.filter(e=>e.roadMechanism);
  const counts=JSON.stringify(G.questCounts),lessons=JSON.stringify(G.questsDone);
  for(const repair of road.repairs){
    walk(r,...repair.approach);aim(G,repair.nodes[0]);
    cast(r,'a');assert.equal(G.roadRepairOpen(repair.id),false,'Storm Spark is not a connected arc');
    const last=G.state.enemies.find(e=>e.roadMechanism.id===repair.id&&e.roadMechanism.node===2);
    last.dead=true;cast(r,'b');assert.equal(G.roadRepairOpen(repair.id),false,'separate contacts do not accumulate');last.dead=false;
    if(repair.id==='rainbell-lower'){
      const old=G.state.grid[14][11];G.state.grid[14][11]={tile:'wall'};
      cast(r,'b');assert.equal(G.roadRepairOpen(repair.id),false,'a wall still blocks the arc');G.state.grid[14][11]=old;
    }
    cast(r,'b',1);assert.ok(G.roadRepairOpen(repair.id));
    assert.ok(G.state.player.mana<G.state.player.manaMax,'world furniture cannot refund the paid cast');
    const [x0,y0,x1,y1]=repair.bridge;walk(r,x0,y0);walk(r,x1,y1);
  }
  assert.equal(JSON.stringify(G.questCounts),counts);assert.equal(JSON.stringify(G.questsDone),lessons);
  assert.equal(G.state.enemies.filter(e=>!e.dead&&e.roadMechanism).length,0);
});

test('one native broad sweep clears a complete branch pile, while an empty or partial swing supplies no world progress or mastery',()=>{
  const {r,G,road}=setup('dragon');G.state.enemies=G.state.enemies.filter(e=>e.roadMechanism);
  const counts=JSON.stringify(G.questCounts);
  cast(r,'a');assert.equal(G.state.roadworks.opened.length,0,'an empty swing is not help');
  for(const repair of road.repairs){
    walk(r,...repair.approach);aim(G,[repair.x,repair.y]);
    G.abilities.slap.use(G.state.player);assert.equal(G.roadRepairOpen(repair.id),false);
    const last=G.state.enemies.find(e=>e.roadMechanism.id===repair.id&&e.roadMechanism.node===2);
    last.dead=true;cast(r,'a');assert.equal(G.roadRepairOpen(repair.id),false);last.dead=false;
    cast(r,'a');assert.ok(G.roadRepairOpen(repair.id));
    const [x0,y0,x1,y1]=repair.bridge;walk(r,x0,y0);walk(r,x1,y1);
  }
  assert.equal(JSON.stringify(G.questCounts),counts);
});

test('the two neighbours offer one deliberate promise, remember native help after save reboot and leave the parent-region requests intact',()=>{
  for(const formId of ['stormcaller','dragon']){
    const {r,G,road}=setup(formId),request='road-'+formId;
    assert.equal(G.ensureTown().followedRequest,null);
    assert.equal(G.deliveryCandidate().id,request,'the quiet arrival invites the intended person');
    G.tryOpeningInteraction();const offer=r.messages.find(m=>m.options?.offer)?.options.offer;
    assert.ok(offer);r.drain();assert.equal(G.ensureTown().followedRequest,null);
    offer.onAccept();assert.equal(G.currentTask().requestId,request);
    G.state.enemies=G.state.enemies.filter(e=>e.roadMechanism);
    for(const repair of road.repairs){walk(r,...repair.approach);aim(G,repair.nodes[0]);cast(r,formId==='stormcaller'?'b':'a');}
    assert.equal(G.currentTask().short,'Return to '+road.person);
    G.saveGame();const saved=G.loadSaveData();G.state.roadworks=G.normalizeRoadworks(saved.roadworks);G.state.town=G.normalizeTown(saved.town);
    r.load(road.id);r.drain();assert.equal(G.currentTask().short,'Return to '+road.person);
    walk(r,road.at[0],road.at[1]+1);G.tryOpeningInteraction();r.drain();
    assert.ok(G.ensureTown().requests.includes(request));assert.equal(G.npcDialogue(road.npc,2,0),road.after);
    G.saveGame();G.state.town=G.normalizeTown(G.loadSaveData().town);assert.ok(G.ensureTown().requests.includes(request));
    // Starfall's older promise still follows Pending's report. Preserve
    // that introduction instead of making the new road bypass it.
    if(formId==='stormcaller')G.ensureTown().requests.push('ridge-watch');
    r.load(road.region);r.drain();assert.ok(G.sunriseRequests().some(q=>q.id===(formId==='dragon'?'ridge-watch':'starfall-lights')));
    assert.equal(G.resolveDialogueSpeaker(road.person.toUpperCase()).id,road.npc);
  }
});
