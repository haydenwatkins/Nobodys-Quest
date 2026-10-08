const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function modern(G){Object.assign(G.state.opening,{started:true,complete:true,bell:true,version:2});G.state.delivery.complete=true;
 G.state.stars=40;G.state.items=['trophy-heartwood-crown','trophy-mire-pearl'];G.ensureTown().requests=['recipes','beacon'];}
function settle(r,n=40){for(let i=0;i<n;i++)r.step(.05);r.drain();}
function press(r,button){r.taps.add(button);r.G.updatePlayer(.05);r.drain();}
function help(r,id){const {G}=r,p=G.state.player;Object.assign(p,{x:160,y:296,dir:{x:1,y:0}});G.input.vec={x:0,y:0};
 if(['golem','lanternWisp'].includes(id)){const e=G.makeEnemy('wisp',230,296);e.shootT=0;G.state.enemies=[e];press(r,'b');settle(r);}
 else if(id==='weaver'){G.state.enemies=[G.makeEnemy('mirageSkater',185,296),G.makeEnemy('mirageSkater',218,296)];press(r,'a');settle(r,8);p.dir={x:1,y:0};press(r,'b');settle(r,8);}
 else if(id==='bellkeeper'){G.state.enemies=[G.makeEnemy('mirageSkater',180,296),G.makeEnemy('mirageSkater',184,306)];press(r,'a');p.dir={x:1,y:0};press(r,'b');settle(r,5);}
 else if(id==='griffin'){G.state.enemies=[G.makeEnemy('sunHopper',168,296),G.makeEnemy('sunHopper',170,306)];G.input.vec={x:1,y:0};press(r,'a');G.input.vec={x:0,y:0};}
 else {const e=G.makeEnemy('cairnWalker',182,296);e.ward.hp=0;G.state.enemies=[e];press(r,'a');}
 assert.ok(G.state.formOutings.features.includes(id),id+' uses its actual native effect');
}
test('six live entrances leave room to read and talk, without granting combat protection',()=>{
 const r=runtime(),{G}=r;modern(G);
 for(const trail of G.FORM_TRAILS){G.state.claimedForms.push(trail.formId);G.setForm(trail.formId);G.state.worldwake.marks=[trail.mark];r.load(trail.id);r.drain();
  const p=G.state.player;for(const [x,y]of [[4,22],[5,22],[6,20]]){
   Object.assign(p,{x:x*16+8,y:y*16+8});const health=G.playerMaxHearts()-p.damageTaken;
   settle(r,240);assert.equal(G.playerMaxHearts()-p.damageTaken,health,trail.id+' has a safe pause at '+[x,y]);
  }
  Object.assign(p,{x:5*16+8,y:22*16+8});assert.equal(G.deliveryCandidate()?.id,'trail-'+trail.formId);
 }
});
test('first-use guidance describes the actual signature action and yields after it is demonstrated',()=>{
 const r=runtime(),{G}=r;modern(G);
 for(const trail of G.FORM_TRAILS){G.state.claimedForms.push(trail.formId);G.setForm(trail.formId);G.state.worldwake.marks=[trail.mark];G.state.formOutings={active:{formId:trail.formId,arts:[],scenes:[]},features:[]};r.load(trail.id);r.drain();
  const promise=G.FORM_TRAIL_PROMISES.find(p=>p.formId===trail.formId);assert.equal(G.formOutingGoal().objective,promise.action);
  const before=G.guidanceTarget();G.state.player.x+=16;assert.deepEqual([G.guidanceTarget().x,G.guidanceTarget().y],[before.x,before.y]);
  G.state.enemies=[];press(r,'b');settle(r,65);assert.equal(G.sunriseRequests().find(p=>p.id==='trail-'+trail.formId).ready,false,'an empty cast is not help');
  help(r,trail.formId);assert.ok(!G.world.solid(21*16+8,19*16+8));assert.equal(G.formTrailFirstUseGoal({formId:trail.formId}),null);
  assert.equal(G.sunriseRequests().find(p=>p.id==='trail-'+trail.formId).ready,true);
 }
});
test('trail promises require owned forms and explicit selection, preserve old accomplishments, and remember returns',()=>{
 const r=runtime(),{G}=r;modern(G);G.state.claimedForms=['rat','knight','wizard'];
 assert.ok(!G.sunriseRequests().some(p=>p.id.startsWith('trail-')));
 for(const trail of G.FORM_TRAILS){G.state.claimedForms.push(trail.formId);G.setForm(trail.formId);r.load(trail.id);r.drain();
  const promise=G.FORM_TRAIL_PROMISES.find(p=>p.formId===trail.formId),id='trail-'+trail.formId;
  assert.equal(G.resolveDialogueSpeaker(promise.person.toUpperCase()).id,promise.npc);
  G.ensureTown().followedRequest='beacon';G.tryOpeningInteraction();const offer=r.messages.find(m=>m.options?.offer)?.options.offer;assert.ok(offer);r.drain();
  assert.equal(G.ensureTown().followedRequest,'beacon','hearing/declining preserves another selected promise');offer.onAccept();assert.equal(G.currentTask().requestId,id);
  const spirit=G.ensureTown().spirit,stars=G.state.stars;help(r,trail.formId);G.saveGame();const saved=G.loadSaveData();G.state.town=G.normalizeTown(saved.town);G.state.formOutings=G.normalizeFormOutings(saved.formOutings);
  r.load(trail.id);r.drain();G.state.enemies=[];assert.equal(G.currentTask().short,'Return to '+promise.person);
  G.tryOpeningInteraction();r.drain();assert.ok(G.ensureTown().requests.includes(id));assert.equal(G.ensureTown().followedRequest,null);
  assert.equal(G.ensureTown().spirit,spirit);assert.equal(G.state.stars,stars,'return adds no numeric grind reward');
  assert.equal(G.npcDialogue(promise.npc,2,0),promise.after);G.tryOpeningInteraction();r.drain();assert.equal(G.ensureTown().spirit,spirit);
  G.saveGame();G.state.town=G.normalizeTown(G.loadSaveData().town);assert.ok(G.ensureTown().requests.includes(id));
 }
});
test('neighbour picnic consequences render in both densities without mutating progress or blocking actors',()=>{
 const {createCanvas}=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
 const r=runtime(createCanvas),{G}=r,c=createCanvas(1280,720).getContext('2d');modern(G);
 for(const trail of G.FORM_TRAILS){r.load(trail.id);r.drain();const before=G.openingDrawables(c).length;G.ensureTown().requests.push('trail-'+trail.formId);
  assert.equal(G.openingDrawables(c).length,before+1);const snapshot=()=>JSON.stringify([G.state.player,G.state.enemies,G.state.grid,G.state.formOutings,G.state.town]);const saved=snapshot();
  for(const hd of [true,false]){G.hdPilot=hd;for(const drawable of G.openingDrawables(c))drawable.fn();assert.equal(c.globalAlpha,1);}
  assert.equal(snapshot(),saved);assert.ok(G.world.isSafeSpawn(40*16+8,21*16+8));
 }
});
test('an accepted restored-road promise gives the return conversation space before the next discovery',()=>{
 const r=runtime(),{G}=r;modern(G);G.state.claimedForms=['rat','knight','wizard','griffin'];
 G.questsDone=[G.forms.griffin.quests[0].id];G.state.items.push('trophy-old-mason');r.load('galecrestPostroad');r.drain();
 G.state.formOutings.features=['griffin'];assert.ok(G.formReady('golem'));assert.ok(G.followSunriseRequest('trail-griffin'));
 assert.equal(G.formReturnPromise().name,'Parcel');assert.equal(G.formDiscoveryAllowed(),false);
 assert.equal(G.leaveReadyFormEchoAt(180,296,'battle'),false);assert.equal(G.claimForm('golem',{worldEcho:true}),false);
 G.state.formEchoes=[{formId:'golem',mapId:G.state.mapId,x:G.state.player.x,y:G.state.player.y,needsLeave:false,source:'battle'}];
 G.updateFormEcho();assert.equal(G.formUnlocked('golem'),false);assert.equal(G.state.formEchoes.length,1,'a prior earned echo remains intact');
 G.followSunriseRequest(null);assert.equal(G.formDiscoveryAllowed(),true,'deliberately setting aside the promise remains available');
 G.followSunriseRequest('trail-griffin');G.tryOpeningInteraction();r.drain();assert.equal(G.formDiscoveryAllowed(),true);assert.ok(G.claimForm('golem',{worldEcho:true}));
 G.state.formOutings=G.makeFormOutings();G.ensureTown().followedRequest='trail-griffin';G.ensureTown().requests=G.ensureTown().requests.filter(id=>id!=='trail-griffin');
 G.state.opening.version=1;assert.equal(G.formReturnPromise(),null,'legacy adventures keep their previous discovery contract');
});
test('real knockback onto a trail border preserves combat until the player deliberately heads outwards',()=>{
 const r=runtime(),{G}=r;modern(G);G.state.claimedForms=['lanternWisp'];G.setForm('lanternWisp');r.load('wicklingCauseway');r.drain();
 const p=G.state.player;Object.assign(p,{x:4*16+8,y:24*16-3,invuln:0});G.input.vec={x:0,y:0};G.state.portalGrace=0;G.state.portalNeedsRelease=false;
 assert.ok(G.damagePlayer(1,p.x,p.y-20));assert.ok(p.y>=24*16,'native damage really pushes the player onto the exit');G.world.checkTriggers(.05);assert.equal(G.state.mapId,'wicklingCauseway');
 G.input.vec={x:-1,y:0};G.updatePlayer(.025);r.drain();assert.equal(G.state.mapId,'wicklingCauseway','moving along the border also stays in the fight');
 G.input.vec={x:0,y:1};G.updatePlayer(.05);r.drain();assert.equal(G.state.mapId,'stormspinePeaks');assert.ok(G.world.isSafeSpawn(p.x,p.y));
});
