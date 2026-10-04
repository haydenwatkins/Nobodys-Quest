'use strict';
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2]||'http://127.0.0.1:8000/?playtestMap=sunkenMarsh',out:process.argv[3]||'/tmp/nq-early-review',name:'published opening and paced shapes',publishedHost:true,
 async run({page,mode,hd,frames,next,drain,walkGift,shot,reload}){
  assert.equal(await page.evaluate(()=>G.hdPilot),hd,'the native detail setting matches the capture');
  assert.equal(await page.evaluate(()=>location.hostname),'quest-review.example');
  assert.equal(await page.evaluate(()=>G.state.mapId),'orchardRoad','published hosts ignore builder map shortcuts');
  assert.ok(await page.evaluate(()=>window.reviewOpeningPaint.includes('Pebble')&&window.reviewOpeningPaint.includes('blocked')),'real title selection presents a friendly world problem');
  assert.equal(await page.evaluate(()=>G.state.opening.seen.filter(x=>x==='arrival').length),1);
  assert.equal(await page.evaluate(()=>G.formUnlocked('rat')),false);
  assert.equal(await page.evaluate(()=>G.ui.openArtMixer(1)),false);
  if(mode==='touch'){
   assert.equal(await page.locator('#btn-swap').evaluate(el=>getComputedStyle(el).visibility),'hidden','form changing appears after its introduction');
   assert.equal(await page.locator('#btn-b').evaluate(el=>getComputedStyle(el,'::after').content),'none','mixing is not advertised before its introduction');
  }
  // Controlled encounter fixtures: authored enemies and native A attacks;
  // positions/AI are fixed so this measures progression and UI, not balance.
  await page.evaluate(()=>{G.state.player.x=12*16+8;G.state.player.y=35*16+8;G.world.checkTriggers(.1);});await drain();
  const targets=await page.evaluate(()=>G.state.enemies.filter(e=>e.id==='orchardTangle'&&!e.dead).map(e=>e.openingKey));
  async function fight(key){
   if(!await page.evaluate(key=>G.state.enemies.some(e=>e.openingKey===key&&!e.dead),key)){assert.equal(await page.evaluate(key=>G.state.opening.defeated.includes(key),key),true,'a removed fixture was already defeated by native combat');return;}
   await page.evaluate(key=>{const e=G.state.enemies.find(e=>e.openingKey===key);e.def={...e.def,speed:0,aggro:0,shootEvery:999};Object.assign(G.state.player,{x:e.x-14,y:e.y,dir:{x:1,y:0},damageTaken:0});},key);
   for(let i=0;i<25&&await page.evaluate(key=>G.state.enemies.some(e=>e.openingKey===key&&!e.dead),key);i++){await page.evaluate(key=>{const e=G.state.enemies.find(e=>e.openingKey===key);G.state.player.x=e.x-14;G.state.player.y=e.y;G.state.player.dir={x:1,y:0};},key);await next();await frames(15);await drain();}
   assert.equal(await page.evaluate(key=>G.state.opening.defeated.includes(key),key),true,'native attacks defeat the fixture');
  }
  for(const key of targets)await fight(key);await frames(3);await drain();
  assert.equal(await page.evaluate(()=>G.formReady('rat')),true);
  await page.evaluate(()=>{const e=G.formEchoFor('rat');e.needsLeave=false;G.state.player.x=e.x;G.state.player.y=e.y;});await frames(3);await drain();
  assert.equal(await page.evaluate(()=>G.state.formId),'rat');await shot('rat-earned');
  if(mode==='touch'){
   assert.equal(await page.locator('#btn-swap').evaluate(el=>getComputedStyle(el).visibility),'visible');
   assert.equal(await page.locator('#btn-b').evaluate(el=>getComputedStyle(el,'::after').content),'none');
  }
  assert.equal(await page.evaluate(()=>window.reviewPaint.some(p=>p.text.includes('MASTERY'))),false,'optional mastery waits for the unlock announcement');
  if(mode==='touch')assert.equal(await page.evaluate(()=>window.reviewPaint.filter(p=>p.y>=50&&p.y<105).every(p=>{const c=document.getElementById('ui').getContext('2d');c.font=p.font;return p.x+c.measureText(p.text).width<=G.W-68;})),true,'the complete announcement clears touch buttons');
  await page.evaluate(()=>{Object.assign(G.state.player,{x:27*16+8,y:24*16+8});});await next();await drain();
  assert.equal(await page.evaluate(()=>G.state.opening.sluice),true);
  await page.evaluate(()=>{Object.assign(G.state.player,{x:38*16+8,y:25*16+8});G.world.checkTriggers(.1);});
  assert.equal(await page.evaluate(()=>!!G.groundRewardFor('knights-crest')),false,'crest waits for the mill play stretch');
  assert.equal(await page.evaluate(()=>G.formReady('wizard')),false);
  await frames(20);await shot('rat-mill-task');
  const briars=await page.evaluate(()=>G.state.enemies.filter(e=>e.id==='orchardSpitter'&&!e.dead).map(e=>e.openingKey));
  for(const key of briars)await fight(key);
  assert.ok(await page.evaluate(()=>G.formLevel('rat')>=2&&G.getLoadout('rat').includes('fester')),'Rat level and Fester are earned before Knight');
  await page.evaluate(()=>{G.state.player.x=38*16+8;G.state.player.y=25*16+8;G.world.checkTriggers(.1);});await drain();
  await walkGift('knights-crest');
  await page.evaluate(()=>{const e=G.formEchoFor('knight');e.needsLeave=false;G.state.player.x=e.x;G.state.player.y=e.y;});await frames(3);await drain();
  assert.equal(await page.evaluate(()=>G.state.formId),'knight');await frames(20);await shot('knight-earned');
  const before=await page.evaluate(()=>({rat:G.formLevel('rat'),patch:G.formLevel('nobody'),stars:G.state.stars}));await reload();
  assert.equal(await page.evaluate(()=>G.state.opening.seen.filter(x=>x==='arrival').length),1);
  assert.deepEqual(await page.evaluate(()=>({rat:G.formLevel('rat'),patch:G.formLevel('nobody'),stars:G.state.stars})),before);
  // A deliberately long current task must remain complete and bounded in
  // both fixed layouts. Moving the camera must not relocate its text.
  for(const map of ['sunriseQuay','overworld']){
   await page.evaluate(map=>{G.state.opening.complete=true;G.state.delivery.complete=true;G.world.load(map);G.state.enemies=[];G.state.npcs=[];G.state.bossCutscene=null;G.ui.closeMenu();G.currentTask=()=>({kind:'request',name:'Brindle',label:'A PROMISE TO BRINDLE',short:'Bring the cinnamon recipe book back to Brindle on Sunrise Quay',color:'#a7f070',progress:{label:'HELP BRINDLE'},objective:'Bring the book home.',reason:'She misses her family recipes.'});G.guidanceShowStoryCard=()=>true;G.state.player.x=500;G.state.player.y=400;},map);await drain();await frames(80);
   if(mode==='touch')assert.equal(await page.locator('#btn-b').evaluate(el=>getComputedStyle(el,'::after').content),'"HOLD MIX"','the announced system appears without needing another form change');
   const goal=await page.evaluate(()=>G.currentTask().short),positions=[];
   for(let i=0;i<20;i++){
    await page.evaluate(i=>{G.state.player.x=500+i*2;},i);await frames(1);
    const painted=await page.evaluate(()=>window.reviewPaint.filter(p=>G.state.mapDef.openingLandscape?p.x===106&&p.y>=9&&p.y<48:p.x===10&&p.y>=41&&p.y<90));
    assert.ok(painted.map(p=>p.text).join(' ').includes(goal),'every word of the task is painted');
    assert.ok(painted.every(p=>!p.text.includes('…')));positions.push(painted.map(p=>({text:p.text,x:p.x,y:p.y})));
    assert.equal(await page.evaluate(painted=>painted.every(p=>{const c=document.getElementById('ui').getContext('2d');c.font=p.font;return p.x>=0&&p.x+c.measureText(p.text).width<=((G.state.mapDef.openingLandscape&&G.input.isTouch)?G.W-68:G.W);}),painted),true,'complete text fits the actual scaled overlay');
   }
   for(const position of positions)assert.deepEqual(position,positions[0],'camera movement never moves the task dock');await shot(map+'-complete-task');
  }
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
