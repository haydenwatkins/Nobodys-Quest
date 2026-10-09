'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs'),collect=require('./helpers/collect-treasure.cjs');
function fixture(map='emberRidge'){
 const r=runtime(),{G}=r;Object.assign(G.state.opening,{version:2,started:true,complete:true,bell:true});G.state.delivery.complete=true;
 G.state.claimedForms=['rat','knight','wizard'];G.state.items=['trophy-heartwood-crown','keeper-lantern','trophy-mire-pearl'];G.state.stars=12;
 Object.assign(G.ensureTown(),{founded:true,introduced:true,requests:['recipes','beacon'],spirit:20});
 G.questsDone=['nobody','rat','knight','wizard'].flatMap(id=>G.forms[id].quests.slice(0,id==='nobody'?2:1).map(q=>q.id));
 r.load(map);r.drain();G.state.enemies=[];return r;
}
function visit(G,id){const actor=G.state.npcs.find(n=>n.id===id);assert.ok(actor);Object.assign(G.state.player,{x:actor.x,y:actor.y});}
function collectNearby(r,id){const gift=r.G.groundRewardFor(id);assert.ok(gift);Object.assign(r.G.state.player,r.G.world.safeArrival(gift.x-24,gift.y));collect(r,id);}
function defeatKnight(r){const {G}=r;r.load('emberRidge');r.drain();const e=G.state.enemies.find(e=>e.id==='eclipseKnight');G.setForm('wizard');e.bossEngaged=true;e.bossIntroT=0;G.state.bossCutscene=null;
 for(let i=0;i<2;i++)G.combat.damageEnemy(e,{type:'dark',damage:100,ability:'shadowBolt',fromX:e.x-36,fromY:e.y});r.drain();assert.ok(e.dead);}
function realDialogue(r){r.run('js/engine/ui.js');const paint=[];r.nodes.get('ui').getContext('2d').fillText=t=>paint.push(String(t));return {paint,listen(){for(let i=0;i<35;i++){paint.length=0;r.G.ui.drawHUD({x:0,y:0});if(paint.some(t=>t.endsWith('Maybe later')))return;r.taps.add('interact');r.G.ui.update(.3);}assert.fail('the three-page conversation must end with an explicit choice');},reply(action){r.taps.add(action);r.G.ui.update(.3);}};}
test('the unmodified Ridge entrance introduces Pending before its aggressive guard or optional watchfire encounters',()=>{
 const r=fixture(),{G}=r;r.load('emberRidge');r.drain();assert.equal(G.deliveryCandidate().id,'ridge-watch');
 const pending=G.state.npcs.find(n=>n.id==='pending'),guard=G.state.enemies.find(e=>e.id==='brute'),guardX=guard.x;assert.equal(pending.anchors.length,1);
 assert.ok(Math.hypot(guard.x-G.state.player.x,guard.y-G.state.player.y)>guard.def.aggro);
 // Force every idle foe to wander toward the entrance: the authored guards must still
 // leave time to read at the entrance rather than randomly crossing it.
 for(const e of G.state.enemies){e.wanderT=999;const dx=G.state.player.x-e.x,dy=G.state.player.y-e.y,d=Math.hypot(dx,dy);e.wanderDir={x:dx/d,y:dy/d};}
 for(let i=0;i<120;i++)r.step(.05);assert.equal(G.deliveryCandidate()?.id,'ridge-watch');assert.equal(G.state.player.damageTaken,0);
 assert.equal(guard.guardPost,true);assert.equal(guard.x,guardX);
 G.tryOpeningInteraction();assert.ok(r.messages.some(m=>m.text.includes("I'm worried about the night watch")));assert.ok(r.messages.some(m=>m.text.includes('Dark ward')));assert.equal(G.ensureTown().followedRequest,null);r.drain();
 G.state.enemies=[guard];Object.assign(G.state.player,{x:guard.x-50,y:guard.y,invuln:999});const oldX=guard.x;r.step(.1);assert.ok(guard.x<oldX,'approaching the posted guard still triggers native pursuit');
});
test('regional offers use the existing explicit choice and never replace a selected promise on decline',()=>{
 const r=fixture(),{G}=r,dialogue=realDialogue(r);assert.ok(G.followSunriseRequest('dragon'));visit(G,'pending');const before=JSON.stringify(G.ensureTown());
 assert.equal(G.deliveryCandidate().id,'ridge-watch');G.tryOpeningInteraction();dialogue.listen();assert.equal(G.followedSunriseRequest().id,'dragon');dialogue.reply('pause');assert.equal(JSON.stringify(G.ensureTown()),before);
 G.tryOpeningInteraction();dialogue.listen();dialogue.reply('interact');assert.equal(G.currentTask().requestId,'ridge-watch');assert.equal(G.currentTask().mapId,'emberRidge');assert.equal(G.ensureTown().requests.includes('ridge-watch'),false);assert.equal(G.loadSaveData().town.followedRequest,'ridge-watch');
});
test('native Eclipse victory requires collecting the Sigil before a moving Ser Pending can hear good news',()=>{
 const r=fixture(),{G}=r;assert.ok(G.followSunriseRequest('ridge-watch'));defeatKnight(r);
 assert.equal(G.currentTask().short,'Collect the Eclipse Sigil');assert.equal(G.followedSunriseRequest().ready,false);assert.ok(G.guidanceTarget().reward);
 G.saveGame();const save=G.loadSaveData();G.state.town=G.normalizeTown(save.town);G.state.groundRewards=G.normalizeGroundRewards(save.groundRewards);r.load('emberRidge');r.drain();assert.ok(!G.state.enemies.some(e=>e.id==='eclipseKnight'));
 collectNearby(r,'trophy-eclipse-sigil');const spirit=G.ensureTown().spirit;assert.equal(G.currentTask().short,'Return to Ser Pending');G.state.enemies=[];
 const pending=G.state.npcs.find(n=>n.id==='pending');pending.x+=16;assert.equal(G.guidanceTarget().x,pending.x);visit(G,'pending');G.tryOpeningInteraction();r.drain();
 assert.ok(G.ensureTown().requests.includes('ridge-watch'));assert.equal(G.ensureTown().spirit,spirit);assert.equal(G.followedSunriseRequest(),null);assert.equal(G.storyGoal().guide,'person');assert.equal(G.storyGoal().mapId,'starfallRuins');assert.match(G.npcDialogue('pending',2,0),/Two travelers/);
 G.tryOpeningInteraction();r.drain();assert.equal(G.ensureTown().requests.filter(id=>id==='ridge-watch').length,1);assert.equal(G.ensureTown().spirit,spirit);assert.ok(G.loadSaveData().town.requests.includes('ridge-watch'));
});
test('Starfall follows remaining lenses in any order, then the native thread gift, then Errata without a second payout',()=>{
 const r=fixture('starfallRuins'),{G}=r;G.state.items.push('trophy-eclipse-sigil');G.ensureTown().requests.push('ridge-watch');assert.ok(G.followSunriseRequest('starfall-lights'));const spirit=G.ensureTown().spirit;
 Object.assign(G.state.player,{x:15*16+8,y:15*16+8});G.tryOpeningInteraction();r.drain();assert.equal(G.starfallSurvey().instrument,false);assert.match(G.currentTask().short,/Dawn lens/);
 for(const [x,y,remaining]of [[24,14,'Dawn lens'],[5,5,'Dusk lens'],[24,5,'southern star instrument']]){Object.assign(G.state.player,{x:x*16+8,y:y*16+8});G.tryOpeningInteraction();r.drain();assert.ok(G.currentTask().short.includes(remaining));}
 G.saveGame();G.state.town=G.normalizeTown(G.loadSaveData().town);assert.equal(G.currentTask().requestId,'starfall-lights');
 Object.assign(G.state.player,{x:15*16+8,y:15*16+8});G.tryOpeningInteraction();r.drain();assert.equal(G.currentTask().short,'Collect the Fallen Star Thread');assert.equal(G.followedSunriseRequest().ready,false);assert.equal(G.ensureTown().spirit,spirit);
 visit(G,'errata');G.tryOpeningInteraction();r.drain();assert.equal(G.ensureTown().requests.includes('starfall-lights'),false,'seeing the light is not collection');
 collectNearby(r,'starfall-thread');assert.equal(G.ensureTown().spirit,spirit+8);assert.equal(G.currentTask().short,'Return to Errata');visit(G,'errata');G.tryOpeningInteraction();r.drain();
 assert.equal(G.ensureTown().spirit,spirit+8);assert.ok(G.ensureTown().requests.includes('starfall-lights'));assert.equal(G.followedSunriseRequest(),null);assert.match(G.npcDialogue('errata',2,0),/Parcel/);
 G.tryOpeningInteraction();r.drain();assert.equal(G.ensureTown().spirit,spirit+8);assert.equal(G.ensureTown().requests.filter(id=>id==='starfall-lights').length,1);
});
test('new regional promises wait for reachable introductions, and past accomplishments need no repeat fights or lens work',()=>{
 const r=fixture('sunriseQuay'),{G}=r;assert.ok(!G.sunriseRequests().some(q=>q.id==='ridge-watch'));assert.ok(!G.sunriseRequests().some(q=>q.id==='starfall-lights'));
 G.ensureTown().requests=['recipes'];r.load('emberRidge');r.drain();assert.equal(G.sunriseRequests().some(q=>q.id==='ridge-watch'),false);G.ensureTown().requests.push('beacon');assert.ok(G.sunriseRequests().some(q=>q.id==='ridge-watch'));
 G.state.opening=G.normalizeOpening({version:1,started:true});G.state.items.push('trophy-eclipse-sigil','starfall-thread');r.load('starfallRuins');r.drain();G.state.enemies=[];visit(G,'errata');const spirit=G.ensureTown().spirit;
 G.tryOpeningInteraction();r.drain();assert.ok(G.ensureTown().requests.includes('starfall-lights'));assert.equal(G.ensureTown().spirit,spirit);assert.equal(G.groundRewardFor('starfall-thread'),null);
 const saved=G.normalizeTown({requests:['ridge-watch','starfall-lights','fake'],followedRequest:'starfall-lights'});assert.equal(saved.requests.length,2);assert.equal(saved.followedRequest,null);
});
test('the post-harbour person lead follows native NPC positions but preserves explicit lessons and the open Worldwake road',()=>{
 const {G}=fixture();let goal=G.storyGoal();assert.equal(goal.guide,'person');assert.equal(goal.personId,'pending');const actor=G.state.npcs.find(n=>n.id==='pending');actor.x+=16;assert.equal(G.guidanceTarget().x,actor.x);
 G.state.lessonQuestId=G.forms.wizard.quests[2].id;assert.notEqual(G.storyGoal().guide,'person');G.state.lessonQuestId=null;G.state.stars=G.PACING.worldwakeStars;assert.equal(G.storyGoal().mapId,'sunstepPrairie');
});
test('optional reports require a deliberate introduction in new adventures and never announce another task during normal progress',()=>{
 const r=fixture(),{G}=r,toasts=[];G.ui.toast=text=>toasts.push(text);assert.ok(G.incidentsAvailable());assert.equal(G.incidentsUnlocked(),false);G.refreshIncidents(true);assert.equal(G.ensureIncidents().active.length,0);
 G.followSunriseRequest('ridge-watch');assert.ok(G.introduceIncidents());assert.equal(G.ensureIncidents().active.length,3);assert.equal(G.currentTask().requestId,'ridge-watch');
 G.state.incidents=G.normalizeIncidents(G.loadSaveData().incidents);assert.ok(G.incidentsUnlocked());const incident=G.ensureIncidents().active.find(i=>i.type==='infestation');r.load(incident.mapId);r.drain();G.state.enemies=[];toasts.length=0;
 const spirit=G.ensureTown().spirit;for(let i=0;i<incident.goal;i++){const e=G.makeEnemy('slime',G.state.player.x+15,G.state.player.y);G.state.enemies.push(e);G.combat.damageEnemy(e,{type:'blunt',damage:99,ability:'slap'});}
 assert.equal(G.ensureIncidents().completed,1);assert.equal(G.ensureIncidents().active.length,3);assert.ok(G.ensureTown().spirit>spirit);assert.ok(!toasts.some(t=>t.includes('Creature Surge')||t.includes('Many Hands')));assert.equal(G.followedSunriseRequest().id,'ridge-watch');
});
test('unintroduced new reports wait for harbour help while old active reports and version-one access survive',()=>{
 const {G}=fixture();G.ensureTown().requests=['recipes'];assert.equal(G.incidentsAvailable(),false);assert.equal(G.introduceIncidents(),false);
 G.state.incidents=G.normalizeIncidents({unlocked:true});assert.ok(G.incidentsUnlocked());G.refreshIncidents(true);assert.equal(G.ensureIncidents().active.length,3);
 G.state.incidents=G.makeIncidents();G.state.opening=G.normalizeOpening({version:1,started:true});assert.ok(G.incidentsUnlocked());G.refreshIncidents(true);assert.equal(G.ensureIncidents().active.length,3);
});
