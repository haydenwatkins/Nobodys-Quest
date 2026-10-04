'use strict';
// Saved chapter fixtures with native combat, Form Echo claims, menu input,
// portal movement and save reload. This is not a timed campaign playthrough.
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2]||'http://127.0.0.1:8000/',out:process.argv[3]||'/tmp/nq-post-harbour-review',name:'post-harbour practice and chosen finale',publishedHost:true,modes:process.env.REVIEW_MODE?[process.env.REVIEW_MODE]:['touch','controller'],
 async run({page,mode,hd,frames,next,drain,shot,reload}){
  async function pad(index){const b=Array(16).fill(0);b[index]=1;await page.evaluate(b=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b})),b);await frames(1);await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));await frames(5);}
  async function tap(selector){const loc=page.locator(selector).first();await loc.scrollIntoViewIfNeeded();if(mode==='controller'){await loc.evaluate(el=>G.menuController.focusDefault(document.getElementById('menu'),el));await pad(0);}else{const b=await loc.boundingBox();assert.ok(b);await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);await frames(5);}}
  async function viewForm(id,stage){await page.evaluate(()=>G.ui.openMenu());await tap('[data-menu-route="forms"]');await tap(`[data-form-select="${id}"]`);await page.locator('.form-route-card').evaluate(el=>el.scrollIntoView({block:'center'}));await frames(3);await shot(stage);const text=await page.locator('#menu').innerText();await tap('[data-act="resume"]');return text;}
  async function claimEcho(id){assert.ok(await page.evaluate(id=>G.formEchoFor(id),id),'native battle leaves an earned Form Echo');await page.evaluate(id=>{const e=G.formEchoFor(id);e.needsLeave=false;Object.assign(G.state.player,{x:e.x,y:e.y});},id);await frames(3);await drain();assert.equal(await page.evaluate(()=>G.state.formId),id);}
  assert.equal(await page.evaluate(()=>G.hdPilot),hd);
  await page.evaluate(()=>{
   Object.assign(G.state.opening,{version:2,started:true,complete:true,bell:true});G.state.delivery.complete=true;
   G.state.claimedForms=['rat','knight','wizard'];G.state.items=['trophy-treant-crown','keeper-lantern','trophy-mire-pearl'];
   Object.assign(G.ensureTown(),{requests:['recipes','beacon'],followedRequest:null});
   G.questsDone=[...G.forms.nobody.quests.slice(0,2),G.forms.rat.quests[0],G.forms.knight.quests[0],G.forms.wizard.quests[0]].map(q=>q.id);G.state.stars=12;
   Object.assign(G.ensureStory(),{prologueSeen:true,seenChapters:[0,1,2],lastChapter:2});
   G.world.load('emberRidge');G.state.enemies=[];G.state.formEchoes=[];G.state.projectiles=[];G.setForm('knight');
   Object.assign(G.state.player,{x:160,y:144,dir:{x:1,y:0},damageTaken:0,invuln:999,mana:G.playerMaxMana()});
   const e=G.makeEnemy('slime',174,144);e.hp=1;e.def={...e.def,speed:0,aggro:0};G.state.enemies=[e];window.reviewPracticeFoe=e;
  });await drain();await frames(10);await next();await frames(20);await drain();
  assert.equal(await page.evaluate(()=>window.reviewPracticeFoe.dead),true);await claimEcho('ranger');
  assert.equal(await page.evaluate(()=>G.formReady('frog')),false);
  assert.match(await viewForm('frog','frog-waits-for-practice'),/Bramble Scout mastery[\s\S]*Level 1\/2/);
  await page.evaluate(()=>{
   Object.assign(G.state.player,{x:160,y:144,dir:{x:1,y:0},mana:G.playerMaxMana()});G.state.projectiles=[];
   const e=G.makeEnemy('slime',280,144);e.hp=80;e.def={...e.def,speed:0,aggro:0};G.state.enemies=[e];window.reviewPracticeFoe=e;
  });
  for(let i=0;i<4;i++){await page.evaluate(()=>{Object.assign(window.reviewPracticeFoe,{x:280,y:144});G.state.player.dir={x:1,y:0};});await next();await frames(20);await drain();}
  assert.equal(await page.evaluate(()=>G.formLevel('ranger')),2,'native distant arrows finish the bow lesson');
  assert.ok(await page.evaluate(()=>G.getLoadout('ranger').includes('tripleShot')));assert.equal(await page.evaluate(()=>G.formReady('frog')),true);
  await shot('bow-lesson-earned');
  await page.evaluate(()=>{window.reviewPracticeFoe.hp=1;G.state.player.mana=G.playerMaxMana();});
  if(mode==='controller')await pad(3);else{await page.locator('#btn-c').tap();await frames(6);}await frames(25);await drain();
  assert.equal(await page.evaluate(()=>window.reviewPracticeFoe.dead),true,'the new Triple Shot is immediately usable');
  await claimEcho('frog');assert.equal(await page.evaluate(()=>G.formReady('alchemist')),false);await shot('frog-earned');
  const before=await page.evaluate(()=>({rat:G.formLevel('rat'),ranger:G.formLevel('ranger'),form:G.state.formId,stars:G.state.stars}));await reload();
  assert.deepEqual(await page.evaluate(()=>({rat:G.formLevel('rat'),ranger:G.formLevel('ranger'),form:G.state.formId,stars:G.state.stars})),before);
  // The other fifteen pre-finale forms remain unclaimed. Eight learned
  // shapes, three favorites and actual World Marks satisfy the portfolio.
  await page.evaluate(()=>{
   const ids=G.formOrder.filter(id=>id!=='god').slice(0,8);G.state.claimedForms=ids.filter(id=>id!=='nobody');
   G.questsDone=ids.flatMap((id,i)=>G.forms[id].quests.slice(0,i<3?4:2).map(q=>q.id));
   G.state.stars=30;G.state.worldwake.marks=['sky','stone','thread','echo','light','heart'];
   G.state.items=G.state.items.filter(id=>id!=='god-spark');G.state.formEchoes=[];
   Object.assign(G.ensureStory(),{seenChapters:[0,1,2,3,4,5],lastChapter:5});
   G.world.load('overworld');G.state.enemies=[];G.state.npcs=[];G.setForm('knight');
   Object.assign(G.state.player,G.world.safeArrival(110*16+8,9*16+8),{dir:{x:0,y:-1},invuln:999});
  });await drain();await frames(120);
  assert.equal(await page.evaluate(()=>G.finalExamMastery().missingBreadth.length),15);assert.equal(await page.evaluate(()=>G.finalExamMastery().ready),true);
  assert.equal(await page.evaluate(()=>G.storyGoal().mapId),'godTrial');assert.equal(await page.evaluate(()=>G.formReady('god')),false);
  await page.evaluate(()=>G.ui.openMenu());await tap('[data-act="current-trail"]');await frames(100);
  await shot('finale-road');const painted=await page.evaluate(()=>({text:window.reviewPaint.map(p=>p.text).join(' '),task:G.currentTask().short,shown:G.guidanceShowStoryCard(),menu:G.ui.menuOpen,dialogue:G.ui.dialogueOpen,player:[G.state.player.x,G.state.player.y]}));
  assert.ok(painted.text.includes(painted.task),JSON.stringify(painted));
  const text=await viewForm('god','chosen-portfolio');assert.match(text,/8\/8 forms at level 3[\s\S]*3\/3 at level 5/);
  assert.doesNotMatch(text,/master six|every form.*level 3/i);
  await page.evaluate(()=>{Object.assign(G.state.player,{x:110*16+8,y:16+8});G.state.portalNeedsRelease=false;G.state.portalGrace=0;});
  if(mode==='controller')await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,-1,0,0],b:Array(16).fill(0)})));else await page.keyboard.down('ArrowUp');
  for(let i=0;i<45&&await page.evaluate(()=>G.state.mapId==='overworld');i++)await frames(1);
  if(mode==='controller')await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));else await page.keyboard.up('ArrowUp');
  await drain();assert.equal(await page.evaluate(()=>G.state.mapId),'godTrial','native movement enters the firmament without leveling the optional roster');
  await frames(25);await shot('firmament-arrival');await reload();assert.equal(await page.evaluate(()=>G.state.mapId),'godTrial');assert.equal(await page.evaluate(()=>G.finalExamMastery().ready),true);assert.equal(await page.evaluate(()=>G.state.items.includes('god-spark')),false);
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
