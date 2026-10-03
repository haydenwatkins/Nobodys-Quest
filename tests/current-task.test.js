const test=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');
function closeDialogue(r){for(let i=0;i<100&&r.G.ui.dialogueOpen;i++){r.taps.add('interact');r.G.ui.update(.1);}assert.equal(r.G.ui.dialogueOpen,false);}
function settle(r){closeDialogue(r);for(let i=0;i<5;i++){r.G.ui.drawHUD({x:0,y:0});r.G.ui.update(10);}}
function setup(){const r=runtime(),{G}=r;G.state.opening.complete=G.state.delivery.complete=true;r.load('sunriseQuay');r.drain();G.state.enemies=[];return r;}

test('the current promise follows actual victory, ground collection, save and once-only return without changing campaign ownership',()=>{
 const r=setup(),{G}=r;G.followSunriseRequest('beacon');const campaign=G.storyGoal().short;
 assert.equal(G.currentTask().kind,'request');assert.match(G.currentTask().short,/Find/);
 assert.equal(G.storyGoal().short,campaign);assert.equal(G.currentTask().mapId,'sunkenMarsh');
 r.load('sunkenMarsh');r.drain();const queen=G.state.enemies.find(e=>e.id==='mireQueen');
 queen.bossEngaged=true;queen.bossIntroT=0;G.state.bossCutscene=null;
 G.combat.damageEnemy(queen,{damage:5,type:'dark'});G.combat.damageEnemy(queen,{damage:100,type:'dark'});r.drain();
 assert.match(G.currentTask().short,/Collect/);assert.equal(G.currentTask().ready,false);
 assert.match(G.guidanceTarget().text,/Collect her pearl/);assert.equal(G.currentTask().progress.value,0);
 G.saveGame();const saved=G.loadSaveData();G.state.town=G.normalizeTown(saved.town);
 G.state.groundRewards=G.normalizeGroundRewards(saved.groundRewards,saved.items);
 assert.match(G.currentTask().short,/Collect/);
 Object.assign(G.state.player,{x:queen.x,y:queen.y});require('./helpers/collect-treasure.cjs')(r,'trophy-mire-pearl');
 assert.equal(G.currentTask().short,'Return to Pebble');assert.equal(G.currentTask().mapId,'sunriseQuay');
 assert.equal(G.currentTask().progress.value,1);assert.equal(G.currentTask().complete,false,'returning remains part of the promise');
 r.load('sunriseQuay');r.drain();Object.assign(G.state.player,{x:22*16+8,y:20*16+8});
 assert.equal(G.guidanceTarget().tileX,22);assert.equal(G.deliveryCandidate().label,'Good news for Pebble');
 const spirit=G.state.town.spirit;G.tryOpeningInteraction();r.drain();
 assert.equal(G.state.town.spirit,spirit+8);assert.equal(G.currentTask().kind,'story');
 G.tryOpeningInteraction();r.drain();assert.equal(G.state.town.spirit,spirit+8);assert.match(G.npcDialogue('pebble',0,0),/turnips/);
});

test('all four promises paint the selected next action in HUD, journey and atlas, then change to the actual return',()=>{
 const r=setup(),{G}=r;r.load('dungeon');r.drain();G.state.enemies=[];G.state.npcs=[];
 G.world.nearPortal=()=>null;G.tutorial.prompt=()=>null;
 Object.assign(G.state.player,{x:160,y:96});r.run('js/engine/ui.js');
 const c=r.nodes.get('ui').getContext('2d'),paint=[];c.fillText=t=>paint.push(String(t));
 c.measureText=t=>({width:String(t).length*3});
 for(const [id,name,ready]of [['beacon','Pebble',()=>G.state.items.push('trophy-mire-pearl')],['recipes','Brindle',()=>G.state.delivery.salvage=true],['dragon','Pip',()=>G.ensureExpeditionProgress().victories=1],['welcome','Mara',()=>G.state.town.projects.welcomeLodge=true]]){
  G.followSunriseRequest(id);const task=G.currentTask();
  for(const mode of ['touch','controller','keyboard']){
   G.input.isTouch=mode==='touch';G.input.hasGamepad=mode==='controller';paint.length=0;G.ui.drawHUD({x:0,y:0});
   assert.ok(paint.includes(task.label),JSON.stringify({id,mode,task:G.currentTask().short,paint}));assert.ok(paint.includes(task.short),`${mode} paints the promise's action`);
  }
  G.input.hasGamepad=false;G.ui.openMenu();let html=r.nodes.get('menu').innerHTML;
  const hero=html.match(/<article class="journey-hero">([\s\S]*?)<\/article>/)[1].replaceAll('&#39;',"'");
  assert.ok(hero.includes(task.short));assert.ok(hero.includes(task.title));assert.ok(hero.includes(task.reward));
  assert.equal((html.match(/A PROMISE TO /g)||[]).length,1,'one current promise rather than a duplicate competing card');
  G.ui.openMap();html=r.nodes.get('menu').innerHTML;assert.ok(html.includes(`Your current task leads to ${task.destination}`));G.ui.closeMenu();
  r.load('sunriseQuay');r.drain();settle(r);G.state.enemies=[];Object.assign(G.state.player,{x:136,y:424});
  for(const mode of ['touch','controller']){
   G.input.isTouch=mode==='touch';G.input.hasGamepad=mode==='controller';paint.length=0;G.ui.drawHUD({x:0,y:340});
   assert.ok(paint.includes(task.label));assert.ok(paint.includes(task.short),`${mode} paints the promise in the native paper HUD`);
  }
  G.input.hasGamepad=false;r.load('dungeon');r.drain();settle(r);G.state.enemies=[];G.state.npcs=[];Object.assign(G.state.player,{x:160,y:96});
  ready();assert.equal(G.currentTask().short,`Return to ${name}`);assert.equal(G.currentTask().mapId,'sunriseQuay');
  assert.match(G.sunriseRequestTarget().text,new RegExp(name));
 }
 G.followSunriseRequest(null);assert.equal(G.currentTask().short,G.storyGoal().short);
});

test('deliberately followed echoes and field notes keep their native priority, and expeditions suspend town tasks',()=>{
 const r=setup(),{G}=r;G.followSunriseRequest('recipes');
 G.questsDone=G.forms.nobody.quests.map(q=>q.id);const echo=G.leaveReadyFormEchoAt(G.state.player.x+30,G.state.player.y,'battle');
 assert.ok(echo);G.formEchoGuide={formId:echo.formId,until:G.state.time+18};
 assert.equal(G.currentTask().kind,'echo');assert.equal(G.guidanceTarget().kind,'form');
 assert.equal(G.followedSunriseRequest().id,'recipes','temporary echo guidance does not replace a promise');
 G.state.time+=19;assert.equal(G.currentTask().kind,'request');
 G.state.expeditionRun={};assert.equal(G.sunriseRequestTask(),null);assert.equal(G.currentTask().kind,'story');G.state.expeditionRun=null;
 G.ensureWorldwake().marks=['sky'];G.followWorldMarkPractice('sky');
 assert.equal(G.currentTask().kind,'mark');assert.equal(G.followedSunriseRequest(),null);
 assert.equal(G.currentTask().objective,G.worldMarkPracticeTarget(G.followedWorldMarkPractice()).text);
 G.followSunriseRequest('welcome');assert.equal(G.currentTask().kind,'request');assert.equal(G.followedWorldMarkPractice(),null);
});
