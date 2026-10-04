const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
const walk=require('./helpers/walk-road.cjs'),cross=require('./helpers/cross-road.cjs');
const plain=value=>JSON.parse(JSON.stringify(value));

function modern(r){const {G}=r;G.state.opening.started=G.state.opening.complete=true;G.state.delivery.complete=true;
 G.state.items=['trophy-heartwood-crown','trophy-mire-pearl'];G.ensureTown().requests=['recipes','beacon'];G.state.stars=40;}
function press(r,button){r.taps.add(button);r.G.updatePlayer(.05);r.drain();}
function settle(r,frames=35){for(let i=0;i<frames;i++){r.G.state.time+=.05;r.G.updatePlayer(.05);r.G.updateEnemies(.05);r.G.combat.updateProjectiles(.05);}r.drain();}

test('all 24 forms have a concrete role; six restored trails remain connected and optional',()=>{
 const r=runtime(),{G}=r;assert.deepEqual(Object.keys(G.FORM_ROLES).sort(),plain(G.formOrder.slice().sort()));
 for(const role of Object.values(G.FORM_ROLES))assert.ok(G.maps[role.mapId]);
 for(const trail of G.FORM_TRAILS){r.load(trail.id);r.drain();const s=G.state,queue=[[4,22]],seen=new Set(['4,22']);
  for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
   const nx=x+dx,ny=y+dy,key=nx+','+ny;if(nx<0||ny<0||nx>=s.mapW||ny>=s.mapH||seen.has(key)||G.world.solid(nx*16+8,ny*16+8))continue;seen.add(key);queue.push([nx,ny]);}}
  for(const [x,y]of [[4,24],[38,19],[10,18],[29,7]])assert.ok(seen.has(x+','+y),trail.id+' has an open long route');
  assert.ok(G.world.solid(21*16+8,19*16+8),'the useful return shortcut starts closed');
  assert.equal(s.enemies.length,12);assert.equal(s.grid[24][4].portal.map,trail.region);
  const region=G.maps[trail.region];assert.equal(region.legend.u.mark,trail.mark);assert.ok(!region.legend.u.stars);
 }
});

test('a learned calling gets two arts and separated native encounters before a competing echo',()=>{
 const r=runtime(),{G}=r;r.load('emberRidge');r.drain();modern(r);G.state.claimedForms=['rat','knight','wizard'];
 G.questsDone=[G.forms.knight.quests[0].id];assert.ok(G.claimForm('ranger',{worldEcho:true}));
 G.questsDone.push(G.forms.ranger.quests[0].id,G.forms.ranger.quests[2].id);assert.ok(G.formReady('frog'));
 assert.equal(G.claimForm('frog'),false);assert.equal(G.leaveReadyFormEchoAt(200,144,'battle'),false);
 assert.equal(G.storyGoal().guide,'outing');assert.equal(G.currentTask().title,'An outing with Bramble Scout');
 const p=G.state.player;Object.assign(p,{x:160,y:144,dir:{x:1,y:0}});G.state.enemies=[];
 function defeat(x,y,art){const e=G.makeEnemy('slime',x,y);G.state.enemies=[e];for(let n=0;n<8&&!e.dead;n++){
   G.state.time+=.05;p.dir={x:Math.sign(e.x-p.x),y:0};G.abilities[art].use(p);for(let i=0;i<30;i++)G.combat.updateProjectiles(.05);r.drain();}assert.ok(e.dead);return e;}
 defeat(270,144,'arrow');assert.equal(G.activeFormOuting().scenes.length,1);
 // Repeating a respawned pocket cannot impersonate another clearing.
 defeat(272,144,'luckyArrow');assert.equal(G.activeFormOuting().scenes.length,1);
 assert.equal(G.formDiscoveryAllowed(),false);assert.equal(G.formEchoesHere().length,0);
 // Borrowing its art on another body cannot finish the new body's outing.
 G.setForm('knight');defeat(70,144,'arrow');assert.equal(G.activeFormOuting().scenes.length,1);
 G.setForm('ranger');defeat(70,144,'luckyArrow');assert.equal(G.activeFormOuting(),null);
 assert.equal(G.formEchoesHere().length,0,'the outing-ending victory stays about the new shape');
 assert.equal(G.leaveReadyFormEchoAt(200,144,'battle'),false,'another kill from the same frame cannot reveal a competing form');
 defeat(272,144,'arrow');assert.equal(G.formEchoesHere().length,1);
 assert.equal(G.leaveReadyFormEchoAt(200,144,'battle'),false,'only one waiting discovery can exist');
});

test('future Worldwake guidance recommends the earned form and its outing before the next guardian',()=>{
 const r=runtime(),{G}=r;r.load('windscarCanyon');r.drain();modern(r);G.state.claimedForms=['rat','knight','wizard','ranger'];
 G.questsDone=G.forms.ranger.quests.slice(0,2).map(q=>q.id);G.state.items.push('trophy-sky-sovereign');
 G.state.worldwake=G.normalizeWorldwake(undefined,{items:G.state.items,mapId:'windscarCanyon'});
 assert.equal(G.storyGoal().formId,'griffin');assert.equal(G.storyGoal().guide,'echo');
 assert.ok(G.claimForm('griffin',{worldEcho:true}));assert.equal(G.storyGoal().mapId,'galecrestPostroad');
 assert.equal(G.guidanceRouteTarget(G.storyGoal()).cell.portal.map,'galecrestPostroad');
 cross(r,'galecrestPostroad');assert.equal(G.state.mapId,'galecrestPostroad');cross(r,'windscarCanyon');
});

test('each guardian form including Cragback wins the discovery slot over an older optional calling',()=>{
 const r=runtime(),{G}=r;r.load();r.drain();modern(r);
 const marks=Object.values(G.WORLDWAKE_MARKS);
 for(let i=0;i<G.FORM_TRAILS.length;i++){
  const trail=G.FORM_TRAILS[i];G.state.claimedForms=['rat','knight','wizard','ranger','frog',...G.FORM_TRAILS.slice(0,i).map(t=>t.formId)];
  G.questsDone=G.state.claimedForms.flatMap(id=>G.forms[id].quests.slice(0,2).map(q=>q.id));
  G.state.items=['trophy-heartwood-crown','trophy-mire-pearl',...Object.keys(G.WORLDWAKE_MARKS).slice(0,i+1)];
  G.state.worldwake.marks=marks.slice(0,i+1).map(m=>m.id);G.state.formOutings=G.makeFormOutings();G.state.formEchoes=[];
  r.load(trail.region);r.drain();assert.ok(G.formReady('alchemist'),'an older optional calling is also earned');
  assert.equal(G.readyFormsWithoutEcho()[0],trail.formId);assert.equal(G.storyGoal().formId,trail.formId);
  const echo=G.leaveReadyFormEchoAt(G.state.player.x+32,G.state.player.y,'victory');assert.equal(echo.formId,trail.formId);
  assert.ok(G.claimForm(trail.formId,{worldEcho:true}));assert.equal(G.storyGoal().mapId,trail.id);
 }
 // A previously placed optional echo remains earned and actionable. Its
 // existence must not leave guidance asking for a second, impossible drop.
 G.state.formOutings=G.makeFormOutings();G.state.formEchoes=[];
 G.state.worldwake.marks=[];const echo=G.leaveReadyFormEchoAt(80,80,'battle');assert.equal(echo.formId,'alchemist');
 assert.equal(G.storyGoal().formId,'alchemist');
});

test('an outing helper stays anchored to its clearing when foes chase or the player moves',()=>{
 const r=runtime(),{G}=r;r.load('galecrestPostroad');r.drain();modern(r);G.state.claimedForms=['griffin'];G.setForm('griffin');
 G.state.worldwake.marks=['sky'];G.state.formOutings.active={formId:'griffin',scenes:[],arts:[]};
 const first=G.guidanceTarget();assert.ok(first.x);assert.equal(first.entity,undefined);
 for(const enemy of G.state.enemies)G.world.moveBox(enemy,32,0);
 walk(r,[[4,21],[4,20]]);const second=G.guidanceTarget();
 assert.deepEqual([second.x,second.y],[first.x,first.y]);
 // Learning another art still points at a useful encounter even if both
 // earlier clearings were credited before the player tried that second art.
 G.questsDone=G.forms.griffin.quests.slice(0,2).map(q=>q.id);
 G.state.formOutings.active.scenes=[{mapId:G.state.mapId,x:168,y:296},{mapId:G.state.mapId,x:472,y:120}];
 G.state.formOutings.active.arts=['wingbeat'];assert.ok(G.guidanceTarget().x);
});

test('actual native inputs reveal six body strengths and persist their return shortcuts independently',()=>{
 const r=runtime(),{G}=r;r.load();r.drain();modern(r);
 for(const trail of G.FORM_TRAILS){G.state.claimedForms.push(trail.formId);G.setForm(trail.formId);r.load(trail.id);r.drain();
  const p=G.state.player;Object.assign(p,{x:160,y:296,dir:{x:1,y:0},cooldowns:{},mana:12});
  G.state.projectiles=[];G.state.passiveShelters=[];G.state.safeLights=[];G.input.vec={x:0,y:0};
  if(['golem','lanternWisp'].includes(trail.formId)){
   const shooter=G.makeEnemy('wisp',230,296);shooter.shootT=0;G.state.enemies=[shooter];press(r,'b');settle(r);
  }else if(trail.formId==='weaver'){
   const first=G.makeEnemy('mirageSkater',185,296),second=G.makeEnemy('mirageSkater',218,296);G.state.enemies=[first,second];
   press(r,'a');settle(r,15);p.dir={x:1,y:0};press(r,'b');settle(r,15);
  }else if(trail.formId==='bellkeeper'){
   G.state.enemies=[G.makeEnemy('mirageSkater',180,296),G.makeEnemy('mirageSkater',184,306)];press(r,'a');
   p.dir={x:1,y:0};press(r,'b');settle(r,5);
  }else if(trail.formId==='griffin'){
   G.state.enemies=[G.makeEnemy('sunHopper',168,296),G.makeEnemy('sunHopper',170,306)];G.input.vec={x:1,y:0};press(r,'a');G.input.vec={x:0,y:0};
  }else{
   const heavy=G.makeEnemy('cairnWalker',182,296);heavy.ward.hp=0;G.state.enemies=[heavy];press(r,'a');assert.ok(heavy.kbx>0);
  }
  assert.ok(G.state.formOutings.features.includes(trail.formId),trail.formId+' is proved by its actual effect');
  assert.equal(G.world.solid(21*16+8,19*16+8),false);G.state.enemies=[];
  walk(r,[[12,18],[12,19],[25,19],[38,19]]);assert.ok(G.state.chests.some(c=>c.chest.name===trail.picnic));
  G.saveGame();const saved=G.loadSaveData();G.state.formOutings=G.normalizeFormOutings(saved.formOutings);
  r.load(trail.id);r.drain();assert.equal(G.world.solid(21*16+8,19*16+8),false,'learned crossing survives reload');
  const learned=G.state.formOutings;G.state.formOutings=G.makeFormOutings();r.load(trail.id);r.drain();
  assert.equal(G.world.solid(21*16+8,19*16+8),true,'a new slot cannot inherit the previous slot’s bridge');G.state.formOutings=learned;
 }
 assert.equal(G.state.formOutings.features.length,6);
});

test('saved outings normalize safely and legacy accomplishments are never replayed',()=>{
 const r=runtime(),{G}=r;r.load();r.drain();G.state.claimedForms=['griffin'];
 assert.deepEqual(plain(G.normalizeFormOutings(undefined)),{active:null,features:[]});
 const out=G.normalizeFormOutings({features:['griffin','missing','golem','griffin'],active:{formId:'griffin',arts:['wingbeat','bite','missing'],scenes:[{mapId:'galecrestPostroad',x:168,y:296},{mapId:'missing',x:1,y:2}]}});
 assert.deepEqual(plain(out),{features:['griffin'],active:{formId:'griffin',arts:['wingbeat'],scenes:[{mapId:'galecrestPostroad',x:168,y:296}]}});
 G.state.formOutings=out;G.saveGame();assert.deepEqual(plain(G.loadSaveData().formOutings),plain(out));
 assert.equal(G.normalizeFormOutings({active:{formId:'golem',scenes:[]}}).active,null);
 G.state.formOutings=G.makeFormOutings();G.state.opening.version=1;G.state.stars=40;G.questsDone=[G.forms.knight.quests[0].id];
 assert.ok(G.claimForm('ranger'));assert.equal(G.activeFormOuting(),null);assert.ok(G.formUnlocked('griffin'));
});

test('outing scenery reuses its region artwork and drawing never changes saved crossings or combat',()=>{
 const {createCanvas}=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
 const r=runtime(createCanvas),{G}=r,ctx=createCanvas(640,360).getContext('2d');
 for(const trail of G.FORM_TRAILS){r.load(trail.id);r.drain();
  const snapshot=()=>JSON.stringify({grid:G.state.grid,items:G.state.items,outings:G.state.formOutings,enemies:G.state.enemies,player:G.state.player});
  const before=snapshot();
  for(const scale of [1,2]){G.renderScale=scale;G.hdPilot=scale===2;ctx.save();ctx.scale(scale,scale);
   G.world.draw(ctx,{x:0,y:160},1);for(const drawable of G.openingDrawables(ctx))drawable.fn();ctx.restore();}
  assert.equal(snapshot(),before,trail.id+' rendering is cosmetic');
 }
});
