const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs'),walk=require('../tools/lib/walk-grid.cjs');
function setup(form,canvas){const r=runtime(canvas),{G}=r;
 Object.assign(G.state.opening,{started:true,complete:true,bell:true,version:2});G.state.delivery.complete=true;G.state.stars=20;
 G.state.claimedForms=['rat','knight','wizard','vampire','jester'];G.state.items=['trophy-heartwood-crown','trophy-mire-pearl'];G.ensureTown().requests=['recipes','beacon'];
 G.setForm(form);const road=G.EARLY_FORM_ROADS.find(r=>r.formId===form);r.load(road.id);r.drain();return {r,G,road};}
function tick(r,n=1,live=false){for(let i=0;i<n;i++){if(live)r.step(.025);else{r.G.state.time+=.025;r.G.updatePlayer(.025);r.G.combat.updateProjectiles(.025);r.G.updateFx(.025);}r.drain();}}
function aim(G,x,y){const p=G.state.player,dx=x*16+8-p.x,dy=y*16+8-p.y,d=Math.hypot(dx,dy)||1;p.dir={x:dx/d,y:dy/d};}
function card(r,repair){walk(r,...repair.approach);aim(r.G,...repair.nodes[0]);r.taps.add('a');tick(r,50);}
function warm(r,repair){walk(r,...repair.approach);const G=r.G,p=G.state.player;
 for(let i=0;i<20&&!G.roadRepairOpen(repair.id);i++){
  const e=G.state.enemies.filter(e=>!e.dead&&!e.def.practice&&Math.hypot(e.outingSpawnX-repair.x*16-8,e.outingSpawnY-repair.y*16-8)<56).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
  assert.ok(e,'original flower creatures supply the native action');walk(r,Math.floor(e.x/16)-1,Math.floor(e.y/16));aim(G,Math.floor(e.x/16),Math.floor(e.y/16));r.taps.add('a');tick(r,25);
 }assert.ok(G.roadRepairOpen(repair.id));}
test('dusk flowers answer genuine bite healing or overflow, with no damage requirement or artificial hits',()=>{
 for(const missing of [0,1]){const {r,G,road}=setup('vampire'),p=G.state.player,repair=road.repairs[0];p.damageTaken=missing;
  walk(r,...repair.approach);aim(G,14,17);r.taps.add('a');tick(r,25);assert.equal(G.roadRepairOpen(repair.id),false,'a bite without a heal is not warmth');
  const stars=G.state.stars,lessons=G.questsDone.length;warm(r,repair);assert.equal(p.damageTaken,0);assert.equal(G.state.stars,stars+G.questsDone.length-lessons,'only ordinary completed lessons award stars');assert.ok(!G.state.enemies.some(e=>e.roadMechanism));
  if(!missing)assert.ok(p.passiveBarrier>0,'full hearts turn the earned overflow into ordinary Bloodskin armor');
  assert.ok(G.questCounts[G.forms.vampire.quests[0].id]>0||G.questsDone.includes(G.forms.vampire.quests[0].id),'only real creatures award bite credit');
  for(const part of road.repairs){warm(r,part);walk(r,part.bridge[0],part.bridge[1]);walk(r,part.bridge[2],part.bridge[3]);}
 }
});
test('a picnic, borrowed bite, empty bite and warmth through a wall cannot wake a flower; clearing its original creatures remains recoverable',()=>{
 const {r,G,road}=setup('vampire'),repair=road.repairs[0];walk(r,16,19);G.healPlayer(1,'pantry');assert.equal(G.roadRepairOpen(repair.id),false);
 const original=G.state.enemies;G.state.enemies=[];r.taps.add('a');tick(r,25);assert.equal(G.roadRepairOpen(repair.id),false);G.state.enemies=original;
 G.setForm('knight');G.state.loadouts.knight=['slash','bloodBite'];walk(r,13,17);aim(G,14,17);for(let i=0;i<5;i++){r.taps.add('b');tick(r,25);}assert.equal(G.roadRepairOpen(repair.id),false);
 G.setForm('vampire');walk(r,16,19);const cell=G.state.grid[18][16];G.state.grid[18][16]={tile:'wall'};G.healPlayer(1,'bloodBite');assert.equal(G.roadRepairOpen(repair.id),false);G.state.grid[18][16]=cell;
 // Actual native cuts clear any remaining authored patch, including a
 // player who never used healing here. No respawn or health sacrifice.
 for(const part of road.repairs){let n=0;while(!G.roadRepairOpen(part.id)&&n++<20){
  const e=G.state.enemies.find(e=>!e.dead&&Math.hypot(e.outingSpawnX-part.x*16-8,e.outingSpawnY-part.y*16-8)<56);assert.ok(e);walk(r,Math.floor(e.x/16)-1,Math.floor(e.y/16));aim(G,Math.floor(e.x/16),Math.floor(e.y/16));G.setForm('knight');r.taps.add('a');tick(r,25);
 }assert.ok(G.roadRepairOpen(part.id));}
});
test('stage gates require one actual card to ricochet through both bells, preserving source identity and native collision',()=>{
 const {r,G,road}=setup('jester');G.state.enemies=G.state.enemies.filter(e=>e.roadMechanism);G.state.player.mana=G.playerMaxMana();const counts=JSON.stringify(G.questCounts),mana=G.state.player.mana;
 G.setForm('knight');G.state.loadouts.knight=['slash','wildCard'];for(const [x,y]of road.repairs[0].nodes){walk(r,x+1,y);aim(G,x,y);r.taps.add('b');tick(r,50);}assert.equal(G.roadRepairOpen(road.repairs[0].id),false,'separate borrowed cards cannot combine contacts');
 G.setForm('jester');const repair=road.repairs[0];walk(r,...repair.approach);aim(G,...repair.nodes[0]);
 assert.equal(G.combat.clearArc(G.state.player.x,G.state.player.y,...repair.nodes[1].map(v=>v*16+8)),false,'the second bell is round a real hedge');
 const cell=G.state.grid[16][24];G.state.grid[16][24]={tile:'wall'};card(r,repair);assert.equal(G.roadRepairOpen(repair.id),false,'the bounce cannot pass through a hedge');G.state.grid[16][24]=cell;
 walk(r,...repair.approach);aim(G,...repair.nodes[0]);r.taps.add('a');tick(r);assert.equal(G.roadRepairOpen(repair.id),false,'casting is not contact');G.setForm('knight');tick(r,50);assert.ok(G.roadRepairOpen(repair.id),'the flying card retains the body it was thrown in');
 G.setForm('jester');card(r,road.repairs[1]);assert.ok(G.roadRepairOpen(road.repairs[1].id));assert.equal(JSON.stringify(G.questCounts),counts,'bells provide no hit, kill or ricochet mastery');assert.equal(G.state.player.mana,mana);
 for(const part of road.repairs){walk(r,part.bridge[0],part.bridge[1]);walk(r,part.bridge[2],part.bridge[3]);}
});
test('both optional promises save their help, hold space for the return, remember thanks and never add a payout or outing quota',()=>{
 for(const form of ['vampire','jester']){const {r,G,road}=setup(form);G.ensureTown().followedRequest='beacon';G.tryOpeningInteraction();const offer=r.messages.find(m=>m.options?.offer)?.options.offer;assert.ok(offer);r.drain();assert.equal(G.ensureTown().followedRequest,'beacon');offer.onAccept();
  G.state.formOutings={active:{formId:form,arts:[],scenes:[]},features:[]};for(const repair of road.repairs)form==='vampire'?warm(r,repair):card(r,repair);
  assert.ok(G.activeFormOuting());G.state.formOutings.active=null;assert.equal(G.formDiscoveryAllowed(),false);G.saveGame();const save=G.loadSaveData();G.state.roadworks=G.normalizeRoadworks(save.roadworks);G.state.town=G.normalizeTown(save.town);r.load(road.id);r.drain();G.state.enemies=G.state.enemies.filter(e=>e.roadMechanism);
  assert.equal(G.currentTask().short,'Return to '+road.person);walk(r,road.at[0],road.at[1]+1);const before=[G.state.stars,G.ensureTown().spirit];G.tryOpeningInteraction();r.drain();assert.ok(G.ensureTown().requests.includes('road-'+form));assert.equal(G.formDiscoveryAllowed(),true);assert.deepEqual([G.state.stars,G.ensureTown().spirit],before);assert.equal(G.npcDialogue(road.npc,2,0),road.after);
  const earned=G.state.roadworks;G.state.roadworks=G.makeRoadworks();r.load(road.id);r.drain();assert.ok(G.world.solid(road.repairs[0].bridge[0]*16+8,road.repairs[0].bridge[1]*16+8));G.state.roadworks=earned;
 }
});
test('original idle AI leaves entry, notice and camp pauses safe without free protection; all new art poses render read-only',()=>{
 const {createCanvas}=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
 for(const form of ['vampire','jester']){const {r,G,road}=setup(form,createCanvas),c=createCanvas(1280,720).getContext('2d'),p=G.state.player;
  for(const [x,y]of [road.start,[road.start[0],road.start[1]-1],[road.start[0]-2,road.start[1]-2]]){Object.assign(p,{x:x*16+8,y:y*16+8});const health=p.damageTaken;tick(r,480,true);assert.equal(p.damageTaken,health);}
  for(const id of ['flower','bell','petalPath','cushions','puppetStage'])assert.ok(G.roadworkScenery[id].hd);
  const snap=()=>JSON.stringify([G.state.player,G.state.enemies,G.state.grid,G.state.roadworks,G.questCounts,G.ensureTown().requests]);
  for(const done of [false,true]){if(done){G.state.roadworks.opened=road.repairs.map(r=>r.id);G.applyRoadRepairs();G.ensureTown().requests.push('road-'+form);}const before=snap();for(const hd of [true,false]){G.hdPilot=hd;for(let y=0;y<G.state.mapH;y++)for(let x=0;x<G.state.mapW;x++)G.drawGreenfieldTile(c,G.state.grid[y][x],x,y,0);for(const d of G.openingDrawables(c))d.fn();assert.equal(c.globalAlpha,1);}assert.equal(snap(),before);}
 }
});
