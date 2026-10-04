'use strict';
// Controlled chapters, native offers/combat/lenses/collection/returns and
// actual save reloads. Enemy final blows do not measure complete fight balance.
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2]||'http://127.0.0.1:8000/',out:process.argv[3]||'/tmp/nq-regional-promises-review',name:'regional friends and deliberate optional reports',publishedHost:true,modes:process.env.REVIEW_MODE?[process.env.REVIEW_MODE]:['touch','controller'],
 async run({page,mode,hd,frames,next,drain,offer,answer,walkGift,shot,reload}){
  async function pad(index){const b=Array(16).fill(0);b[index]=1;await page.evaluate(b=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b})),b);await frames(1);await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));await frames(5);}
  async function tap(selector){const loc=page.locator(selector).first();await loc.scrollIntoViewIfNeeded();if(mode==='controller'){await loc.evaluate(el=>G.menuController.focusDefault(document.getElementById('menu'),el));await pad(0);}else{const b=await loc.boundingBox();assert.ok(b);await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);await frames(5);}}
  async function atNpc(id){await page.evaluate(id=>{const n=G.state.npcs.find(n=>n.id===id);Object.assign(G.state.player,{x:n.x,y:n.y});},id);await frames(1);}
  async function at(x,y){await page.evaluate(({x,y})=>Object.assign(G.state.player,G.world.safeArrival(x*16+8,y*16+8)),{x,y});await frames(1);}
  async function reloadSafe(){await page.evaluate(()=>{const point=G.state.mapId==='emberRidge'?[40,152]:[232,27];Object.assign(G.state.player,G.world.safeArrival(...point));});await reload();}
  async function approachGift(item){await page.evaluate(item=>{const gift=G.groundRewardFor(item);G.state.enemies=[];Object.assign(G.state.player,G.world.safeArrival(gift.x-24,gift.y),{invuln:999});},item);await frames(1);await walkGift(item);}
  async function journal(stage,expected){await page.evaluate(()=>G.ui.openMenu());assert.match(await page.locator('.journey-hero').innerText(),expected);await shot(stage);await tap('[data-act="resume"]');}
  async function startRequest(stage,expected){await next();await frames(140);assert.equal(await page.evaluate(()=>G.ui.dialogueOpen),true);assert.ok(await page.evaluate(expected=>window.reviewPaint.map(p=>p.text).join(' ').includes(expected),expected));await shot(stage+'-concern');await offer();await shot(stage+'-choice');await answer(true);}
  await page.evaluate(()=>{
   Object.assign(G.state.opening,{version:2,started:true,complete:true,bell:true});G.state.delivery.complete=true;
   G.state.rivalState=G.makeRivalState();G.state.player.damageTaken=0;
   G.state.claimedForms=['rat','knight','wizard'];G.state.items=['trophy-heartwood-crown','keeper-lantern','trophy-mire-pearl'];G.state.stars=12;
   Object.assign(G.ensureTown(),{founded:true,introduced:true,requests:['recipes','beacon'],spirit:20});
   G.questsDone=['nobody','rat','knight','wizard'].flatMap(id=>G.forms[id].quests.slice(0,id==='nobody'?2:1).map(q=>q.id));
   Object.assign(G.ensureStory(),{prologueSeen:true,seenChapters:[0,1,2],lastChapter:2});G.setForm('wizard');G.world.load('emberRidge');
  });await drain();await frames(1);
  assert.equal(await page.evaluate(()=>G.hdPilot),hd);assert.equal(await page.evaluate(()=>G.deliveryCandidate()?.id),'ridge-watch','the authored entry is safe for its actual request');
  assert.equal(await page.evaluate(()=>G.ensureIncidents().active.length),0);await startRequest('pending','worried about the night watch');
  assert.equal(await page.evaluate(()=>G.currentTask().requestId),'ridge-watch');await journal('ridge-journal',/A PROMISE TO SER PENDING[\s\S]*eastern court/);
  await page.evaluate(()=>{
   const e=G.state.enemies.find(e=>e.id==='eclipseKnight');window.reviewKnight=e;G.state.enemies=[e];e.hp=3;e.ward.hp=1;e.def={...e.def,speed:0};e.bossRecoverT=999;
   Object.assign(G.state.player,G.world.safeArrival(e.x-48,e.y),{dir:{x:1,y:0},invuln:999,mana:G.playerMaxMana()});
  });await frames(3);await frames(140);assert.equal(await page.evaluate(()=>G.ui.dialogueOpen),true);assert.ok(await page.evaluate(()=>window.reviewPaint.map(p=>p.text).join(' ').includes('last watchfire')));await shot('knight-concern');await drain();
  for(let i=0;i<7&&!await page.evaluate(()=>window.reviewKnight.dead);i++){if(mode==='controller')await pad(2);else{await page.locator('#btn-b').tap();await frames(6);}await frames(25);await drain();}
  assert.equal(await page.evaluate(()=>window.reviewKnight.dead),true);assert.equal(await page.evaluate(()=>G.currentTask().short),'Collect the Eclipse Sigil');await journal('sigil-collect-journal',/Collect the Eclipse Sigil/);
  await reloadSafe();assert.equal(await page.evaluate(()=>G.currentTask().short),'Collect the Eclipse Sigil');assert.equal(await page.evaluate(()=>G.state.enemies.some(e=>e.id==='eclipseKnight')),false,'the earned gift prevents a repeat fight while collection is pending');
  await approachGift('trophy-eclipse-sigil');assert.equal(await page.evaluate(()=>G.currentTask().short),'Return to Ser Pending');
  await reloadSafe();assert.equal(await page.evaluate(()=>G.currentTask().short),'Return to Ser Pending');
  await atNpc('pending');const ridgeSpirit=await page.evaluate(()=>G.ensureTown().spirit);await next();await frames(140);await shot('pending-good-news');await drain();assert.equal(await page.evaluate(()=>G.ensureTown().spirit),ridgeSpirit);
  assert.equal(await page.evaluate(()=>G.ensureTown().requests.includes('ridge-watch')),true,'Pending hears the collected Sigil news');assert.equal(await page.evaluate(()=>G.storyGoal().mapId),'starfallRuins');await journal('observatory-handoff',/Errata[\s\S]*Starfall/);
  await page.evaluate(()=>G.world.load('starfallRuins'));await drain();await frames(1);await atNpc('errata');assert.equal(await page.evaluate(()=>G.resolveDialogueSpeaker('ERRATA').id),'errata');await startRequest('errata','worried about travellers');assert.equal(await page.evaluate(()=>G.currentTask().requestId),'starfall-lights');
  // Native lens use with authored positions; surrounding foes are removed
  // here to isolate the three-way state/guidance flow from combat balance.
  await page.evaluate(()=>{G.state.enemies=[];});await at(15,15);await next();await frames(140);await shot('instrument-waits');await drain();assert.equal(await page.evaluate(()=>G.starfallSurvey().instrument),false);
  for(const [x,y]of [[24,14],[5,5],[24,5]]){await at(x,y);await next();await drain();}
  assert.equal(await page.evaluate(()=>G.starfallSurvey().aligned),3);assert.equal(await page.evaluate(()=>G.currentTask().short),'Use the southern star instrument');await journal('lenses-ready-journal',/southern star instrument/);
  await page.evaluate(()=>G.ui.openMenu());await tap('[data-menu-section="challenges"]');const reports=page.locator('[data-act="introduce-reports"]');await reports.evaluate(el=>el.closest('section').scrollIntoView({block:'center'}));await frames(2);await shot('optional-reports');await tap('[data-act="introduce-reports"]');
  assert.equal(await page.evaluate(()=>G.ensureIncidents().active.length),3);assert.equal(await page.evaluate(()=>G.currentTask().requestId),'starfall-lights');await shot('reports-atlas');await tap('[data-act="resume"]');
  await at(15,15);const beforeThread=await page.evaluate(()=>G.ensureTown().spirit);await next();await drain();assert.equal(await page.evaluate(()=>G.currentTask().short),'Collect the Fallen Star Thread');assert.equal(await page.evaluate(()=>G.ensureTown().spirit),beforeThread);await journal('thread-collect-journal',/Collect the Fallen Star Thread/);
  await reloadSafe();assert.equal(await page.evaluate(()=>G.currentTask().short),'Collect the Fallen Star Thread');assert.equal(await page.evaluate(()=>G.ensureIncidents().unlocked),true);await page.evaluate(()=>G.state.enemies=[]);
  await approachGift('starfall-thread');assert.equal(await page.evaluate(()=>G.ensureTown().spirit),beforeThread+8);assert.equal(await page.evaluate(()=>G.currentTask().short),'Return to Errata');
  await atNpc('errata');await next();await frames(140);assert.ok(await page.evaluate(()=>window.reviewPaint.map(p=>p.text).join(' ').includes('waiting beyond it.')),'Errata finishes the complete road handoff');await shot('errata-good-news');await drain();assert.equal(await page.evaluate(()=>G.ensureTown().spirit),beforeThread+8);assert.equal(await page.evaluate(()=>G.followedSunriseRequest()),null);
  await reloadSafe();assert.equal(await page.evaluate(()=>G.ensureTown().requests.includes('ridge-watch')&&G.ensureTown().requests.includes('starfall-lights')),true);await page.evaluate(()=>G.state.enemies=[]);await atNpc('errata');await next();await frames(140);await shot('errata-revisit');await drain();assert.equal(await page.evaluate(()=>G.ensureTown().spirit),beforeThread+8);
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
