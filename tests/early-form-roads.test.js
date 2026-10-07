const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
const walkGrid=require('../tools/lib/walk-grid.cjs'),cross=require('./helpers/cross-road.cjs');
function modern(r,id){const {G}=r;G.state.opening.started=G.state.opening.complete=true;G.state.delivery.complete=true;
 G.state.items=['trophy-heartwood-crown','trophy-mire-pearl'];G.ensureTown().requests=['recipes','beacon'];G.state.stars=14;
 G.state.claimedForms=['rat','knight','wizard','ranger','frog','alchemist'];G.state.formOutings={active:{formId:id,arts:[],scenes:[]},features:[]};G.setForm(id);}
function cast(r,button,frames=35){r.taps.add(button);for(let i=0;i<frames;i++){r.G.state.time+=.05;r.G.updatePlayer(.05);r.G.combat.updateProjectiles(.05);r.G.updateFx(.05);}r.drain();}
function aim(G,x,y){const p=G.state.player,dx=x*16+8-p.x,dy=y*16+8-p.y,d=Math.hypot(dx,dy)||1;p.dir={x:dx/d,y:dy/d};}
test('three different roads connect both ways, have an open long path and preserve original neighbouring entrances',()=>{
 const r=runtime(),{G}=r;
 for(const road of G.EARLY_FORM_ROADS){modern(r,road.formId);r.load(road.region);r.drain();cross(r,road.id);
  assert.equal(G.state.mapId,road.id);walkGrid(r,31,4);walkGrid(r,...road.start);
  for(const repair of road.repairs){walkGrid(r,...repair.approach);const [x,y]=repair.bridge;assert.ok(G.world.solid(x*16+8,y*16+8));}
  cross(r,road.region);assert.equal(G.state.mapId,road.region);
 }
 assert.equal(G.maps.overworld.legend.S.portal.map,'sunkenMarsh');assert.equal(G.maps.sunkenMarsh.legend.x.portal.map,'overworld');
 for(const road of G.EARLY_FORM_ROADS){modern(r,road.formId);r.load('overworld');r.drain();assert.equal(G.guidanceRouteTarget(G.storyGoal()).cell.portal.map,road.region==='overworld'?road.id:'sunkenMarsh');}
});
test('native bow shots across water and Frog tongue contacts create actual saved crossings without free mastery',()=>{
 const r=runtime(),{G}=r;
 for(const road of G.EARLY_FORM_ROADS.filter(r=>r.formId!=='alchemist')){
  modern(r,road.formId);r.load(road.id);r.drain();G.state.enemies=G.state.enemies.filter(e=>e.roadMechanism);
  const original=JSON.stringify(G.questCounts);
  for(const repair of road.repairs){walkGrid(r,...repair.approach);aim(G,repair.x,repair.y);
   G.abilities.slap.use(G.state.player);assert.equal(G.roadRepairOpen(repair.id),false,'a close unrelated art cannot repair it');
   cast(r,'a');assert.ok(G.roadRepairOpen(repair.id),repair.id+' answers its native art');
   const [x0,y0,x1,y1]=repair.bridge;walkGrid(r,x0,y0);walkGrid(r,x1,y1);
  }
  assert.equal(JSON.stringify(G.questCounts),original,'mechanisms cannot impersonate creature mastery');
  G.saveGame();const saved=G.loadSaveData();G.state.roadworks=G.normalizeRoadworks(saved.roadworks);r.load(road.id);r.drain();
  assert.ok(!G.state.enemies.some(e=>e.roadMechanism),'completed winches and loops are no longer combat targets');
  for(const repair of road.repairs)assert.equal(G.state.grid[repair.bridge[1]][repair.bridge[0]].tile,'path');
 }
 const earned=G.state.roadworks;G.state.roadworks=G.makeRoadworks();r.load('reedbedFerry');r.drain();
 assert.equal(G.state.grid[17][17].tile,'water','another slot cannot inherit a changed legend');G.state.roadworks=earned;
});
test('a native flask burst actually catches three authored foes before a lampyard route opens',()=>{
 const r=runtime(),{G}=r;modern(r,'alchemist');r.load('copperwickYard');r.drain();
 const road=G.EARLY_FORM_ROADS.find(r=>r.formId==='alchemist');
 for(const repair of road.repairs){walkGrid(r,...repair.approach);aim(G,repair.x,repair.y);
  cast(r,'b');assert.ok(G.roadRepairOpen(repair.id),'the real blast clears '+repair.id);
 }
 assert.ok(G.questCounts[G.forms.alchemist.quests[1].id]>=6||G.questsDone.includes(G.forms.alchemist.quests[1].id));
 assert.ok(G.questsDone.includes(G.forms.alchemist.quests[2].id),'both different clumps supply the real three-target lesson');
});
test('offers wait for their shape, explicit decline preserves a promise, repair leads to return and a remembered consequence',()=>{
 const r=runtime(),{G}=r;modern(r,'ranger');G.state.claimedForms=['rat','knight','wizard'];
 assert.ok(!G.sunriseRequests().some(r=>r.id.startsWith('road-')));
  G.state.claimedForms.push('ranger');r.load('bramblebank');r.drain();G.state.enemies=G.state.enemies.filter(e=>e.roadMechanism);
 const parcel=G.state.npcs.find(n=>n.id==='parcel');Object.assign(G.state.player,{x:parcel.x,y:parcel.y+8});
 G.state.claimedForms.push('frog');assert.ok(G.followSunriseRequest('road-frog'));G.tryOpeningInteraction();
 const offer=r.messages.find(m=>m.options?.offer)?.options.offer;assert.ok(offer);r.drain();
  assert.equal(G.followedSunriseRequest().id,'road-frog');offer.onAccept();assert.equal(G.currentTask().requestId,'road-ranger');
 G.saveGame();G.state.town=G.normalizeTown(G.loadSaveData().town);assert.equal(G.followedSunriseRequest().id,'road-ranger','the selected promise survives normalized saves');
 for(const repair of G.EARLY_FORM_ROADS[0].repairs){walkGrid(r,...repair.approach);aim(G,repair.x,repair.y);cast(r,'a');}
 assert.equal(G.currentTask().short,'Return to Parcel');assert.equal(G.guidanceTarget().x,parcel.x);
 walkGrid(r,34,21);G.tryOpeningInteraction();r.drain();assert.ok(G.ensureTown().requests.includes('road-ranger'));
  const spirit=G.ensureTown().spirit;G.tryOpeningInteraction();r.drain();assert.equal(G.ensureTown().spirit,spirit);assert.match(G.npcDialogue('parcel',2,0),/Not one wet sock/);
 G.saveGame();G.state.town=G.normalizeTown(G.loadSaveData().town);assert.ok(G.ensureTown().requests.includes('road-ranger'),'a remembered return survives normalized saves');
});
test('repairs normalize safely, keep old mastery and ownership, and guide a stable authored bank during an outing',()=>{
 const r=runtime(),{G}=r;modern(r,'frog');r.load('reedbedFerry');r.drain();
 assert.deepEqual(JSON.parse(JSON.stringify(G.normalizeRoadworks({opened:['reed-lower','reed-lower','bad']}))),{opened:['reed-lower']});
 assert.deepEqual(JSON.parse(JSON.stringify(G.normalizeRoadworks())),{opened:[]});
 const before=JSON.stringify([G.state.claimedForms,G.questsDone]);G.state.roadworks=G.normalizeRoadworks();assert.equal(JSON.stringify([G.state.claimedForms,G.questsDone]),before);
 for(const road of G.EARLY_FORM_ROADS)assert.equal(G.resolveDialogueSpeaker(road.person.toUpperCase()).id,road.npc);
 assert.equal(G.storyGoal().mapId,'reedbedFerry');const a=G.guidanceTarget();G.state.player.x+=16;const b=G.guidanceTarget();assert.equal(a.x,b.x);assert.equal(a.y,b.y);
});
test('clearing a lamp before its group lesson never leaves an impossible three-target request',()=>{
 const r=runtime(),{G}=r;modern(r,'alchemist');r.load('copperwickYard');r.drain();
 const road=G.EARLY_FORM_ROADS.find(r=>r.formId==='alchemist'),repair=road.repairs[0];
 const clump=G.state.enemies.filter(e=>Math.hypot(e.outingSpawnX-repair.x*16-8,e.outingSpawnY-repair.y*16-8)<56);
 assert.equal(clump.length,3);G.combat.damageEnemy(clump[0],{ability:'bottleBonk',type:'blunt',damage:100});
 assert.equal(G.roadRepairOpen(repair.id),false);assert.match(G.roadworkStep(road).objective,/remaining creatures/);
 for(const e of clump.slice(1))G.combat.damageEnemy(e,{ability:'bottleBonk',type:'blunt',damage:100});
 assert.equal(G.roadRepairOpen(repair.id),true,'the already-cleared stand opens without a respawn');
});
test('authored repair scenery keeps both densities and cannot change progress or creature positions',()=>{
 const {createCanvas}=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
 const r=runtime(createCanvas),{G}=r,c=createCanvas(1280,720).getContext('2d');
 for(const road of G.EARLY_FORM_ROADS){modern(r,road.formId);r.load(road.id);r.drain();
  const snap=()=>JSON.stringify([G.state.roadworks,G.state.formOutings,G.questCounts,G.questsDone,G.state.player.x,G.state.player.y,G.state.enemies.map(e=>[e.x,e.y,e.hp]),G.ensureTown().requests]);
  const before=snap();for(const hd of [true,false]){G.hdPilot=hd;
   for(const drawable of G.openingDrawables(c))drawable.fn();
   for(const repair of road.repairs){const [x,y]=repair.bridge;G.drawGreenfieldTile(c,G.state.grid[y][x],x,y,0);}
  }
  assert.equal(snap(),before);assert.equal(G.greenfieldWaterColors()[0],'#42646f');
 }
 for(const id of ['winch','pontoon','lamp','boards'])assert.ok(G.roadworkScenery[id].hd&&G.roadworkScenery[id].frames.length===4);
});
