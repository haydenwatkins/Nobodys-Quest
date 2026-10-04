const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
test('only the worn form gains generic and borrowed-art mastery; old completed mastery stays earned',()=>{
 const r=runtime(),{G}=r;r.load('overworld');r.drain();G.state.claimedForms=['rat','knight','wizard'];G.state.formId='knight';G.getLoadout('knight')[2]='bite';
 const old=G.forms.rat.quests[2];G.questCounts[old.id]=2;G.questsDone.push(G.forms.nobody.quests[1].id);
 const e=G.makeEnemy('slime',G.state.player.x+10,G.state.player.y);e.hp=1;G.state.enemies.push(e);
 G.combat.damageEnemy(e,{ability:'bite',damage:1,type:'dark',status:{name:'poison',dur:4,dps:1},fromX:e.x-10,fromY:e.y});
 assert.equal(G.questProgress(old),2);assert.equal(G.questProgress(G.forms.rat.quests[0]),0);
 assert.equal(G.questProgress(G.forms.nobody.quests[2]),0,'Knight kills do not level Patchling');
 assert.equal(G.formLevel('nobody'),2,'old completed levels are never revoked');
 assert.ok(G.relevantMasteryQuests(Infinity).every(q=>q.form.id==='knight'));
 G.saveGame();assert.equal(G.loadSaveData().questCounts[old.id],2);
});
test('opening gates prevent a burst of forms, preserve claimed legacy forms, and introduce mixing before access',()=>{
 const r=runtime(),{G}=r;r.load();G.beginStorySession(null);r.drain();
 G.state.claimedForms=['rat','knight'];G.state.stars=50;G.questsDone=G.forms.rat.quests.concat(G.forms.knight.quests).map(q=>q.id);
 assert.equal(G.formReady('wizard'),false);assert.equal(G.formReady('ranger'),false);assert.equal(G.systemIntroduced('mix'),false);
 G.state.opening.bell=true;assert.equal(G.systemIntroduced('mix'),true);
 G.state.delivery.complete=true;assert.equal(G.formReady('wizard'),true);assert.equal(G.formReady('ranger'),false);
 G.state.items.push('trophy-mire-pearl');assert.equal(G.formReady('ranger'),false,'the harbour return still matters');
 G.ensureTown().requests=['beacon'];assert.equal(G.formReady('ranger'),true);
 G.state.claimedForms.push('wizard');assert.equal(G.systemIntroduced('sideAdventures'),true);G.ensureTown().requests=[];G.state.items=[];assert.equal(G.systemIntroduced('sideAdventures'),false,'a newly earned Wizard cannot bypass the harbour');
 G.state.opening=G.normalizeOpening({version:1,started:true});assert.equal(G.systemIntroduced('sideAdventures'),true,'old partial games keep introduced systems');assert.equal(G.formReady('ranger'),true);
 G.state.opening=G.normalizeOpening(undefined);assert.equal(G.formReady('ranger'),true,'pre-opening saves keep their routes');
 G.state.opening.started=true;G.state.claimedForms.push('dragon');assert.equal(G.formUnlocked('dragon'),true,'new gates do not take away earned forms');
});
test('Sunrise recommends one neighbour, reveals the next request after thanks, and retains an older followed request',()=>{
 const r=runtime(),{G}=r;r.load();G.beginStorySession(null);r.drain();G.state.opening.complete=true;G.state.delivery.complete=true;G.state.claimedForms=['rat','knight'];r.load('sunriseQuay');r.drain();
 assert.deepEqual(Array.from(G.sunriseRequests(),r=>r.id),['recipes']);
 assert.equal(G.currentTask().short,'Ask Brindle about her recipe book');assert.equal(G.followedSunriseRequest(),null,'a recommendation never accepts a promise');
 assert.equal(G.followSunriseRequest('dragon'),false);assert.equal(G.expeditionUnlocked(),false);
 G.ensureTown().requests.push('recipes');assert.deepEqual(Array.from(G.sunriseRequests(),r=>r.id),['beacon','recipes']);
 G.state.items.push('trophy-mire-pearl');G.ensureTown().requests.push('beacon');G.state.claimedForms=['rat','knight'];
 assert.equal(G.expeditionUnlocked(),true);assert.ok(G.sunriseRequests().some(r=>r.id==='dragon'));
 G.state.items=[];G.ensureTown().requests=[];G.ensureTown().followedRequest='dragon';assert.equal(G.followedSunriseRequest().id,'dragon','legacy selected tasks survive new sequencing');
});
test('moving TV players never see attention speech flicker; a settled player can read it without timer manipulation',()=>{
 const r=runtime(),{G}=r;r.load('frostbellTundra');r.drain();r.run('js/engine/ui.js');G.input.hasGamepad=true;G.state.enemies=[];G.state.bossCutscene=null;
 Object.assign(G.state.player,{x:40,y:140});G.state.npcs=[{x:120,y:168,def:{name:'Friend'},bubble:{text:'HELLO FRIEND',delay:0,t:2,duration:2}}];
 const labels=[],c=r.nodes.get('ui').getContext('2d');c.fillText=t=>labels.push(String(t));
 for(let i=0;i<30;i++){G.state.player.x+=.5;G.input.vec={x:.4,y:0};G.ui.update(.05);labels.length=0;G.ui.drawHUD({x:i%3,y:0});assert.ok(!labels.includes('HELLO FRIEND'));}
 G.input.vec={x:0,y:0};G.ui.update(.7);labels.length=0;G.ui.drawHUD({x:0,y:0});assert.ok(labels.includes('HELLO FRIEND'));assert.equal(G.state.npcs[0].bubble.t,2);
});

test('leaving during the introduction preserves its unread context and replays it on the next real story session',()=>{
 const r=runtime(),{G}=r;r.load();G.beginStorySession(null);
 assert.ok(r.messages.some(m=>m.text.includes('Sunrise')));assert.ok(!G.state.opening.seen.includes('arrival'));
 G.saveGame();const saved=G.loadSaveData();assert.ok(!saved.opening.seen.includes('arrival'));
 const again=runtime();again.G.state.opening=again.G.normalizeOpening(saved.opening);again.load();again.G.beginStorySession(saved);
 assert.ok(again.messages.some(m=>m.text.includes('Sunrise')));again.drain();assert.ok(again.G.state.opening.seen.includes('arrival'));
 assert.equal(again.G.beginOpening(),true);assert.equal(again.messages.length,0,'a fully read introduction is not repeated');
});

test('the guided Sunrise route uses native recipe recovery, Wizard discovery, Queen gift collection and harbour return before side adventures',()=>{
 const r=runtime(),{G}=r,collect=require('./helpers/collect-treasure.cjs');
 // A saved phase fixture after the delivery; actual early combat and gates
 // have their own opening test. No town request is pre-completed here.
 G.state.opening.started=G.state.opening.complete=true;G.state.delivery=G.normalizeDelivery({version:1,complete:true});
 G.state.claimedForms=['rat','knight'];G.questsDone=[...G.forms.nobody.quests.slice(0,2),G.forms.rat.quests[0],G.forms.knight.quests[0]].map(q=>q.id);G.state.stars=5;
 G.state.formId='rat';r.load('lanternReach');r.drain();G.state.enemies=[];Object.assign(G.state.player,{x:296,y:488});
 assert.ok(G.tryOpeningInteraction());r.drain();collect(r,'brindles-recipes');
 r.load('sunriseQuay');r.drain();G.state.enemies=[];Object.assign(G.state.player,{x:200,y:200});
 assert.ok(G.tryOpeningInteraction());r.drain();assert.ok(G.ensureTown().requests.includes('recipes'));assert.ok(G.groundRewardFor('sunrise-thanks-recipes'));
 assert.ok(G.sunriseRequests().some(q=>q.id==='beacon'));assert.equal(G.expeditionUnlocked(),false);assert.equal(G.formReady('wizard'),true);
 r.load('sunkenMarsh');r.drain();const foe=G.state.enemies.find(e=>!e.ward&&!e.dead&&!e.def.miniboss);foe.hp=1;
 G.combat.damageEnemy(foe,{ability:'bite',type:'sharp',damage:1,fromX:foe.x-10,fromY:foe.y});
 const echo=G.formEchoFor('wizard');assert.ok(echo);echo.needsLeave=false;Object.assign(G.state.player,{x:echo.x,y:echo.y});G.updateFormEcho();r.drain();
 assert.equal(G.state.formId,'wizard');assert.equal(G.systemIntroduced('sideAdventures'),false);assert.equal(G.formReady('ranger'),false);
 r.load('sunriseQuay');r.drain();G.state.enemies=[];Object.assign(G.state.player,{x:360,y:328});assert.ok(G.tryOpeningInteraction());
 const offer=r.messages.find(m=>m.options?.offer);assert.ok(offer);offer.options.offer.onAccept();r.drain();assert.equal(G.followedSunriseRequest().id,'beacon');
 r.load('sunkenMarsh');r.drain();const queen=G.state.enemies.find(e=>e.id==='mireQueen');queen.bossIntroT=0;queen.bossEngaged=true;
 while(!queen.dead)G.combat.damageEnemy(queen,{ability:'curse',type:'dark',damage:3,fromX:queen.x-20,fromY:queen.y});r.drain();
 assert.ok(G.groundRewardFor('trophy-mire-pearl'));assert.equal(G.systemIntroduced('sideAdventures'),false);
 const pearl=G.groundRewardFor('trophy-mire-pearl');Object.assign(G.state.player,G.world.safeArrival(pearl.x,pearl.y-24));
 collect(r,'trophy-mire-pearl');assert.equal(G.sunriseRequestTask().short,'Return to Pebble');assert.equal(G.systemIntroduced('sideAdventures'),false);
 r.load('sunriseQuay');r.drain();G.state.enemies=[];Object.assign(G.state.player,{x:360,y:328});assert.ok(G.tryOpeningInteraction());r.drain();
 assert.ok(G.ensureTown().requests.includes('beacon'));assert.ok(G.groundRewardFor('sunrise-thanks-beacon'));assert.equal(G.followedSunriseRequest(),null);
 assert.equal(G.systemIntroduced('sideAdventures'),true);assert.equal(G.expeditionUnlocked(),true);assert.equal(G.formReady('ranger'),true);
 G.saveGame();assert.ok(G.loadSaveData().town.requests.includes('beacon'));assert.equal(G.questProgress(G.forms.nobody.quests[2]),0,'the new forms never give Patchling passive kill credit');
});

test('clearing the mill in another body leaves a native Rat practice path instead of a progression dead end',()=>{
 const r=runtime(),{G}=r;r.load();G.beginStorySession(null);r.drain();
 G.state.claimedForms=['rat'];G.state.opening.notice=G.state.opening.cart=G.state.opening.sluice=true;
 for(const e of G.state.enemies.filter(e=>!e.def.practice))while(!e.dead)G.combat.damageEnemy(e,{ability:'slap',type:'blunt',damage:3,fromX:e.x-10,fromY:e.y});r.drain();
 assert.equal(G.formLevel('rat'),1);assert.equal(G.formReady('knight'),false);
 assert.equal(G.openingGoal().short,'Practice Bite at the straw post');
 Object.assign(G.state.player,{x:38*16+8,y:25*16+8});G.world.checkTriggers(.1);assert.equal(G.groundRewardFor('knights-crest'),null);
 G.setForm('rat');const post=G.state.enemies.find(e=>e.def.practice);
 for(let i=0;i<3;i++){
  Object.assign(G.state.player,{x:post.x-10,y:post.y,dir:{x:1,y:0}});G.abilities.bite.use(G.state.player);
  assert.ok(post.status.poison,'native Bite applies poison to the practice post');
  G.updateEnemies(3.1);r.drain();assert.ok(!post.status.poison,'native expiry allows another application');
 }
 assert.equal(G.formLevel('rat'),2);assert.ok(G.getLoadout('rat').includes('fester'));assert.ok(!post.dead);
 assert.equal(G.openingGoal().short,'Recover the crest beside the mill');
 Object.assign(G.state.player,{x:38*16+8,y:25*16+8});G.world.checkTriggers(.1);assert.ok(G.groundRewardFor('knights-crest'));
 G.saveGame();assert.ok(G.loadSaveData().questsDone.includes(G.forms.rat.quests[0].id));
});
