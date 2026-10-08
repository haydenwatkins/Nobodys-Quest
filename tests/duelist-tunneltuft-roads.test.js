const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs'),walk=require('../tools/lib/walk-grid.cjs');
function setup(id,canvas){const r=runtime(canvas),{G}=r;
 Object.assign(G.state.opening,{started:true,complete:true,bell:true,version:2});G.state.delivery.complete=true;
 G.state.claimedForms=['rat','knight','wizard','riftblade','mole'];G.state.items=['trophy-heartwood-crown','trophy-mire-pearl'];G.state.stars=20;
 G.ensureTown().requests=['recipes','beacon'];G.setForm(id);const road=G.EARLY_FORM_ROADS.find(x=>x.formId===id);r.load(road.id);r.drain();return {r,G,road};}
function tick(r,n=1){for(let i=0;i<n;i++){r.step(.025);r.drain();}}
function aim(G,x,y){const p=G.state.player,dx=x*16+8-p.x,dy=y*16+8-p.y,d=Math.hypot(dx,dy)||1;p.dir={x:dx/d,y:dy/d};}
function recover(r){for(let i=0;i<400&&(r.G.state.player.mana<3||(r.G.state.player.cooldowns[r.G.getLoadout(r.G.state.formId)[1]]||0)>0);i++)tick(r);}
function launch(r,repair){recover(r);walk(r,...repair.approach);aim(r.G,repair.x,repair.y);r.taps.add('b');tick(r);}
test('Duelist gates answer actual landing gusts, not cuts, a borrowed rush in another body or a pulse through a wall',()=>{
 const {r,G,road}=setup('riftblade');G.state.enemies=[];const counts=JSON.stringify(G.questCounts),stars=G.state.stars;
 const repair=road.repairs[0];walk(r,...repair.approach);aim(G,repair.x,repair.y);r.taps.add('a');tick(r,20);assert.equal(G.roadRepairOpen(repair.id),false);
 G.setForm('knight');G.state.loadouts.knight=['slash','riftRush'];launch(r,repair);tick(r,25);assert.equal(G.roadRepairOpen(repair.id),false,'the borrowed dash has no Duelist afterimage');
 G.setForm('riftblade');walk(r,...repair.approach);const cell=G.state.grid[repair.y][repair.x];G.state.grid[repair.y][repair.x]={tile:'wall'};
 launch(r,repair);tick(r,25);assert.equal(G.roadRepairOpen(repair.id),false,'the landing gust respects a solid wall');G.state.grid[repair.y][repair.x]=cell;
 for(const part of road.repairs){launch(r,part);assert.equal(G.roadRepairOpen(part.id),false,'starting a rush is not a landing');tick(r,25);assert.ok(G.roadRepairOpen(part.id));
  walk(r,part.bridge[0],part.bridge[1]);walk(r,part.bridge[2],part.bridge[3]);}
 assert.equal(JSON.stringify(G.questCounts),counts);assert.equal(G.state.stars,stars);assert.ok(!G.state.enemies.some(e=>e.roadMechanism),'vanes never impersonate baddies');
});
test('Tunneltuft soil waits for the native delayed tremor, retains its source body and cannot echo into another map',()=>{
 const {r,G,road}=setup('mole');G.state.enemies=[];const counts=JSON.stringify(G.questCounts),repair=road.repairs[0];
 launch(r,repair);for(let i=0;i<30&&!G.state.passiveEchoes.length;i++)tick(r);
 assert.ok(G.state.passiveEchoes.length);assert.equal(G.roadRepairOpen(repair.id),false,'the landing comes before the rumble');
 tick(r,3);assert.equal(G.roadRepairOpen(repair.id),false);G.setForm('knight');tick(r,10);assert.ok(G.roadRepairOpen(repair.id),'a genuine Mole tremor remains its own effect after a swap');
 G.setForm('mole');launch(r,road.repairs[1]);for(let i=0;i<30&&!G.state.passiveEchoes.length;i++)tick(r);
 assert.ok(G.state.passiveEchoes.length);r.load('overworld');r.drain();tick(r,20);assert.equal(G.roadRepairOpen(road.repairs[1].id),false,'leaving clears pending world echoes');
 r.load(road.id);r.drain();G.state.enemies=[];launch(r,road.repairs[1]);tick(r,35);assert.ok(G.roadRepairOpen(road.repairs[1].id));assert.equal(JSON.stringify(G.questCounts),counts);
});
test('both roads preserve a chosen promise, saved help, zero extra payouts and distinct return memories',()=>{
 for(const id of ['riftblade','mole']){const {r,G,road}=setup(id);G.state.enemies=[];G.ensureTown().followedRequest='beacon';
  G.tryOpeningInteraction();const offer=r.messages.find(m=>m.options?.offer)?.options.offer;assert.ok(offer);r.drain();assert.equal(G.ensureTown().followedRequest,'beacon');offer.onAccept();
  G.state.formOutings={active:{formId:id,arts:[],scenes:[]},features:[]};for(const repair of road.repairs){launch(r,repair);tick(r,35);assert.ok(G.roadRepairOpen(repair.id));}
  assert.ok(G.activeFormOuting(),'world repairs do not manufacture lessons or encounter wins');G.state.formOutings.active=null;
  assert.equal(G.formDiscoveryAllowed(),false,'a chosen ready promise reserves the return');G.saveGame();const saved=G.loadSaveData();G.state.roadworks=G.normalizeRoadworks(saved.roadworks);G.state.town=G.normalizeTown(saved.town);r.load(road.id);r.drain();G.state.enemies=[];
  assert.equal(G.currentTask().short,'Return to '+road.person);walk(r,road.at[0],road.at[1]+1);const before=[G.state.stars,G.ensureTown().spirit];G.tryOpeningInteraction();r.drain();
  assert.ok(G.ensureTown().requests.includes('road-'+id));assert.equal(G.formDiscoveryAllowed(),true);assert.deepEqual([G.state.stars,G.ensureTown().spirit],before);assert.equal(G.npcDialogue(road.npc,2,0),road.after);
  const earned=G.state.roadworks;G.state.roadworks=G.makeRoadworks();r.load(road.id);r.drain();assert.ok(G.world.solid(road.repairs[0].bridge[0]*16+8,road.repairs[0].bridge[1]*16+8));G.state.roadworks=earned;
 }
});
test('original idle AI leaves both entries, notices and camps safe without granting protection',()=>{
 for(const id of ['riftblade','mole']){const {r,G,road}=setup(id),p=G.state.player;
  for(const [x,y]of [road.start,[road.start[0],road.start[1]-1],[road.start[0]-2,road.start[1]-2]]){
   Object.assign(p,{x:x*16+8,y:y*16+8});const health=G.playerMaxHearts()-p.damageTaken;tick(r,480);assert.equal(G.playerMaxHearts()-p.damageTaken,health);
  }walk(r,...road.start);assert.equal(G.deliveryCandidate()?.id,'road-'+id);
 }
});
test('new repair art and every terrain pose draw in both densities without awarding progress or obscuring actors',()=>{
 const {createCanvas}=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
 for(const id of ['riftblade','mole']){const {r,G,road}=setup(id,createCanvas),c=createCanvas(1280,720).getContext('2d');
  for(const sprite of ['vane','soil','pavers','dryPath','bookBasket'])assert.ok(G.roadworkScenery[sprite].hd);
  const snapshot=()=>JSON.stringify([G.state.player,G.state.enemies,G.state.grid,G.state.roadworks,G.questCounts,G.ensureTown().requests]);
  for(const complete of [false,true]){if(complete){G.state.roadworks.opened=road.repairs.map(x=>x.id);G.applyRoadRepairs();G.ensureTown().requests.push('road-'+id);}const before=snapshot();
   for(const hd of [true,false]){G.hdPilot=hd;for(let y=0;y<G.state.mapH;y++)for(let x=0;x<G.state.mapW;x++)G.drawGreenfieldTile(c,G.state.grid[y][x],x,y,0);for(const d of G.openingDrawables(c))d.fn();assert.equal(c.globalAlpha,1);}
   assert.equal(snapshot(),before);
  }
 }
});
