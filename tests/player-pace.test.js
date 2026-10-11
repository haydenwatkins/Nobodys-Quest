const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');

test('all earned bodies retain a comfortable native walk, with fast forms keeping their advantage',()=>{
 const r=runtime(),{G}=r;r.load('overworld');r.drain();G.state.claimedForms=G.formOrder.slice();G.state.enemies=[];G.state.items.push('god-spark');G.questsDone=G.formOrder.flatMap(id=>G.forms[id].quests.map(q=>q.id));
 let start;
 for(let y=2;y<G.state.mapH-2&&!start;y++)for(let x=2;x<G.state.mapW-8&&!start;x++)
  if(Array.from({length:7},(_,i)=>G.world.isSafeSpawn((x+i)*16+8,y*16+8)).every(Boolean))start={x:x*16+8,y:y*16+8};
 assert.ok(start,'a real open stretch exists');
 for(const id of G.formOrder){
  G.setForm(id);assert.equal(G.state.formId,id,'the movement check wears the earned body');r.drain();const p=G.state.player;Object.assign(p,start,{dir:{x:1,y:0},dashing:null,pantryHasteT:0,passiveHaste:0,slipstreamT:0,manaRegenDelay:100});
  const before=JSON.stringify([G.state.stars,G.state.items,G.questCounts,G.questsDone,p.mana]);
  G.input.vec={x:1,y:0};G.updatePlayer(.25);r.drain();
  assert.ok(p.x-start.x>=20-1e-6,id+' keeps at least Patchling’s pace through native movement');
  assert.ok(Math.abs(p.x-start.x-G.forms[id].speed*.25)<1e-6,id+' retains its actual registered pace');
  assert.equal(p.y,start.y);assert.equal(JSON.stringify([G.state.stars,G.state.items,G.questCounts,G.questsDone,p.mana]),before,'walking changes no progress or resource price');
 }
 assert.equal(G.forms.rat.speed,105);assert.equal(G.forms.griffin.speed,118);assert.equal(G.forms.riftblade.speed,110);
});

test('saved completed roads resolve old outings without granting mastery or bypassing the chosen return',()=>{
 const r=runtime(),{G}=r;r.load();r.drain();Object.assign(G.state.opening,{started:true,complete:true,version:2});G.state.delivery.complete=true;
 G.state.claimedForms=G.formOrder.slice();G.ensureTown().requests=['recipes','beacon'];
 for(const road of G.EARLY_FORM_ROADS){
  G.setForm(road.formId);G.state.roadworks={opened:[road.repairs[0].id]};G.state.formOutings={active:{formId:road.formId,arts:[],scenes:[]},features:[]};
  G.ensureTown().followedRequest='road-'+road.formId;r.load(road.id);r.drain();G.updateFormOuting();assert.ok(G.activeFormOuting(),'one repair keeps the useful variation');
  G.state.roadworks.opened.push(road.repairs[1].id);G.saveGame();const save=G.loadSaveData();
  G.state.roadworks=G.normalizeRoadworks(save.roadworks);G.state.formOutings=G.normalizeFormOutings(save.formOutings);
  const before=JSON.stringify([G.questCounts,G.questsDone,G.state.stars,G.state.items,G.ensureTown().spirit]);
  G.setForm('nobody');G.updateFormOuting();assert.ok(G.activeFormOuting(),'the new body still gets its own visit');
  G.setForm(road.formId);G.updatePlayer(0);assert.equal(G.activeFormOuting(),null);
  assert.equal(JSON.stringify([G.questCounts,G.questsDone,G.state.stars,G.state.items,G.ensureTown().spirit]),before,'repair completion manufactures no mastery or payout');
  assert.equal(G.formDiscoveryAllowed(),false,'a chosen ready promise preserves its return');
  assert.equal(G.currentTask().short,'Return to '+road.person);
 }
});
