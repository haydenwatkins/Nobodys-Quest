'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');
function setup({knightLevel=2}={}){
 const r=runtime(),{G}=r;
 Object.assign(G.state.opening,{started:true,complete:true,bell:true,version:2});G.state.delivery.complete=true;
 G.state.stars=6;G.state.items=['knights-crest','trophy-heartwood-crown'];G.state.claimedForms=['rat','knight'];G.questsDone=[G.forms.rat.quests[0].id,...(knightLevel>=2?[G.forms.knight.quests[0].id]:[])];
 G.ensureTown().requests=['recipes'];r.load('sunriseQuay');r.drain();G.setForm('knight');
 Object.assign(G.state.player,{x:22*16+8,y:20*16+8});return r;
}
function offer(r){assert.equal(r.G.deliveryCandidate()?.id,'beacon');r.G.tryOpeningInteraction();const choice=r.messages.find(m=>m.options?.offer)?.options.offer;assert.ok(choice);return choice;}
test('choosing the harbor promise reveals earned magic beside Pebble without another kill or a payout',()=>{
 const r=setup(),{G}=r;const choice=offer(r),before={stars:G.state.stars,counts:JSON.stringify(G.questCounts),done:[...G.questsDone],form:G.state.formId,items:[...G.state.items],x:G.state.player.x,y:G.state.player.y};
 assert.equal(G.formEchoFor('wizard'),null,'hearing or declining a request creates no discovery');r.drain();choice.onAccept();
 const echo=G.formEchoFor('wizard');assert.ok(echo);assert.equal(echo.mapId,'sunriseQuay');assert.equal(echo.source,'promise');assert.ok(G.world.isSafeSpawn(echo.x,echo.y));assert.ok(G.guidedFormEcho());
 assert.equal(G.state.stars,before.stars);assert.equal(JSON.stringify(G.questCounts),before.counts);assert.deepEqual([...G.questsDone],before.done);assert.deepEqual([...G.state.items],before.items);assert.equal(G.state.formId,before.form);assert.equal(G.state.player.x,before.x);assert.equal(G.state.player.y,before.y);
 const saved=G.loadSaveData();assert.equal(saved.town.followedRequest,'beacon');assert.equal(saved.formEchoes.length,1);assert.equal(G.normalizeFormEchoes(saved.formEchoes)[0].source,'promise');
 for(let i=0;i<100&&G.state.formId!=='wizard';i++){const p=G.state.player,dx=echo.x-p.x,dy=echo.y-p.y,d=Math.hypot(dx,dy)||1;G.input.vec={x:dx/d,y:dy/d};r.step(.025);r.drain();}
 assert.equal(G.state.formId,'wizard','native walking meets the echo and earns the body');assert.equal(G.formLevel('wizard'),1);assert.equal(G.getLoadout('wizard')[0],'curse');assert.equal(G.followedSunriseRequest().id,'beacon');assert.equal(G.state.stars,before.stars);
});
test('harbor preparation preserves unmet lessons, existing discoveries and old campaign ownership',()=>{
 {const r=setup({knightLevel:1}),choice=offer(r);r.drain();choice.onAccept();assert.equal(r.G.formEchoFor('wizard'),null);assert.equal(r.G.formReady('wizard'),false);}
 {const r=setup(),{G}=r;G.state.formEchoes=[{formId:'ranger',mapId:'overworld',x:200,y:200,source:'battle',needsLeave:true}];const before=JSON.stringify(G.state.formEchoes),choice=offer(r);r.drain();choice.onAccept();assert.equal(JSON.stringify(G.state.formEchoes),before);assert.equal(G.formEchoFor('wizard'),null);}
 {const r=setup(),{G}=r;G.state.claimedForms.push('wizard');const choice=offer(r);r.drain();choice.onAccept();assert.equal(G.formEchoFor('wizard'),null);assert.equal(G.state.formId,'knight');}
 {const r=setup(),{G}=r;G.state.opening.version=1;const choice=offer(r);r.drain();choice.onAccept();assert.equal(G.formEchoFor('wizard'),null,'legacy discoveries keep their existing rules');}
});
test('an already-selected partial harbor save can reveal its earned magic on a deliberate Pebble revisit',()=>{
 const r=setup(),{G}=r;G.followSunriseRequest('beacon');G.state.town=G.normalizeTown(JSON.parse(JSON.stringify(G.state.town)));
 assert.equal(G.formEchoFor('wizard'),null);G.tryOpeningInteraction();r.drain();assert.equal(G.formEchoFor('wizard')?.source,'promise');
 const first=JSON.stringify(G.state.formEchoes);G.tryOpeningInteraction();r.drain();assert.equal(JSON.stringify(G.state.formEchoes),first,'the revisit never stacks echoes');
});
test('the home road is a gated walking return, with a shorter connected harbor route and safe legacy arrival',()=>{
 const r=runtime(),{G}=r;G.state.opening.started=true;G.state.claimedForms=['rat'];r.load('overworld');r.drain();const home=G.state.grid[43][62];
 assert.equal(G.state.grid[43][60].portal,undefined,'the original north-south road remains uninterrupted');assert.equal(G.state.grid[44][62].tile,'path');assert.equal(G.state.grid[45][61].tile,'path');
 assert.match(G.world.portalBlockReason(home).text,/Parcel.*deliveries/);assert.equal(G.world.solid(62*16+8,43*16+8),true);
 Object.assign(G.state.player,{x:62*16+8,y:44*16+8});G.input.vec={x:0,y:-1};for(let i=0;i<30;i++)r.step(.025);assert.equal(G.state.mapId,'overworld','walking cannot skip the delivery introduction');
 G.state.delivery.complete=true;assert.equal(G.world.portalBlockReason(home),null);G.input.vec={x:0,y:0};r.step(.5);G.input.vec={x:0,y:-1};for(let i=0;i<30&&G.state.mapId==='overworld';i++)r.step(.025);assert.equal(G.state.mapId,'town');assert.ok(G.world.isSafeSpawn(G.state.player.x,G.state.player.y));
 for(let i=0;i<45;i++)r.step(.025);assert.equal(G.state.mapId,'town','holding the entering direction carries you into town');
 G.input.vec={x:0,y:0};r.step(.5);G.input.vec={x:0,y:1};for(let i=0;i<120&&G.state.mapId==='town';i++)r.step(.025);assert.equal(G.state.mapId,'overworld');assert.equal(Math.floor(G.state.player.x/16),60);assert.equal(Math.floor(G.state.player.y/16),45,'the old arrival remains a safe step away from the new entrance');
 for(let i=0;i<45;i++)r.step(.025);assert.equal(G.state.mapId,'overworld','holding the departing direction continues away from home');
 const route=G.guidanceRoute('sunkenMarsh','sunriseQuay');assert.deepEqual(Array.from(route.steps,s=>s.to),['overworld','town','sunriseQuay']);
 G.state.opening=G.normalizeOpening(undefined);G.state.delivery=G.makeDelivery();G.state.claimedForms=['rat'];assert.equal(G.world.portalBlockReason(home),null,'old earned town access remains usable');
});
test('both HUD layouts quiet automatic mastery for chosen work while preserving intentional practice and real learning',()=>{
 const r=setup(),{G}=r;G.setForm('rat');G.followSunriseRequest('beacon');G.state.enemies=[];G.state.npcs=[];
 const labels=[],c=new Proxy({measureText:t=>({width:String(t).length*3}),fillText:t=>labels.push(String(t))},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 const originalUI=G.ui;r.context.document.getElementById('ui').getContext=()=>c;G.world.nearPortal=()=>null;G.tutorial.prompt=()=>null;G.drawGuidanceHud=()=>{};G.guidanceShowStoryCard=()=>true;
 const draw=()=>{labels.length=0;G.ui.update(.01);G.ui.update(.7);G.ui.drawHUD({x:0,y:0});};
 for(const map of ['sunriseQuay','overworld']){
  G.ui=originalUI;r.load(map);r.drain();r.run('js/engine/ui.js');G.state.enemies=[];G.state.npcs=[];Object.assign(G.state.player,{x:400,y:300});G.state.lessonQuestId=null;draw();assert.equal(labels.some(t=>t.includes('MASTERY')),false,map+' quiet automatic card');assert.ok(labels.join(' ').includes('Find the Mire'),labels.join(' '));
  const lesson=G.fieldMasteryQuest();G.state.lessonQuestId=lesson.quest.id;draw();assert.ok(labels.some(t=>t.includes('MASTERY')),map+' deliberate unfinished lesson remains visible');
  G.state.items.push('trophy-mire-pearl');draw();assert.ok(labels.some(t=>t.includes('Return to Pebble')));assert.equal(labels.some(t=>t.includes('MASTERY')),false,map+' return gets its own moment');G.state.items=G.state.items.filter(id=>id!=='trophy-mire-pearl');
 }
 const before=G.questProgress(G.forms.rat.quests[1]);G.events.emit('kill',{enemy:'slime',poisoned:true});assert.equal(G.questProgress(G.forms.rat.quests[1]),before+1,'quiet presentation does not suspend native learning');
});
