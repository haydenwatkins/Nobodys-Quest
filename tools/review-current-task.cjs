#!/usr/bin/env node
// Controlled saved-promise / native final-blow review, not a complete campaign.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(require.resolve('playwright',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
const url=process.argv[2]||'http://127.0.0.1:8000/',out=path.resolve(process.argv[3]||'/tmp/nobodys-quest-current-task-scenes');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});fs.mkdirSync(out,{recursive:true});
 try{for(const mode of (process.env.REVIEW_MODE?[process.env.REVIEW_MODE]:['touch','controller']))for(const hd of [true,false]){
  const viewport=mode==='touch'?{width:667,height:375}:{width:1280,height:720};
  const context=await browser.newContext({viewport,hasTouch:mode==='touch',...(mode==='controller'?{userAgent:'NobodysQuestTV/1.0 Chromium review'}:{})});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.reviewClock=1000;window.requestAnimationFrame=cb=>(window.reviewFrame=cb,1);window.cancelAnimationFrame=()=>{};
   const fill=CanvasRenderingContext2D.prototype.fillText,clear=CanvasRenderingContext2D.prototype.clearRect;window.reviewHudText=[];
   CanvasRenderingContext2D.prototype.fillText=function(t,...args){if(this.canvas.id==='ui')window.reviewHudText.push(String(t));return fill.call(this,t,...args);};
   CanvasRenderingContext2D.prototype.clearRect=function(...args){if(this.canvas.id==='ui')window.reviewHudText=[];return clear.apply(this,args);};});
  const frames=n=>page.evaluate(n=>{for(let i=0;i<n;i++){const cb=window.reviewFrame;window.reviewFrame=null;window.reviewClock+=50;if(cb)cb(window.reviewClock);}},n);
  async function pad(button){const b=Array(16).fill(0);b[button]=1;await page.evaluate(b=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b})),b);await frames(1);await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));await frames(3);}
  async function connect(){if(mode==='controller'){await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'c',id:'Review TV controller'})));await frames(1);assert.equal(await page.evaluate(()=>G.input.hasGamepad),true);}}
  async function tap(selector){const loc=page.locator(selector).first();await loc.scrollIntoViewIfNeeded();if(mode==='controller'){await loc.evaluate(el=>G.menuController.focusDefault(document.getElementById('menu'),el));await pad(0);}else{const b=await loc.boundingBox();assert.ok(b);await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);await frames(3);}}
  async function pause(){if(mode==='controller')await pad(9);else if(await page.evaluate(()=>G.ui.menuOpen))await tap('[data-act="resume"]');else await tap('#btn-pause');}
  async function drain(){for(let i=0;i<50&&await page.evaluate(()=>G.ui.dialogueOpen);i++){await frames(5);if(mode==='controller')await pad(0);else await page.touchscreen.tap(viewport.width/2,viewport.height/2);await frames(5);}assert.equal(await page.evaluate(()=>G.ui.dialogueOpen),false);}
  async function shot(stage){await page.screenshot({path:path.join(out,`${mode}-${hd?'hd':'base'}-${stage}.png`)});}
  await page.goto(url);await page.waitForFunction(()=>typeof G!=='undefined'&&G.state?.player);await connect();await drain();
  await page.evaluate(hd=>{G.state.opening.complete=G.state.delivery.complete=true;G.state.stars=5;G.state.items=['orchard-ribbon','keeper-lantern','sunrise-seal'];
   G.state.claimedForms=Object.keys(G.forms).filter(id=>id!=='nobody'&&id!=='god');G.questsDone=Object.values(G.forms).flatMap(f=>f.quests.map(q=>q.id));
   Object.assign(G.ensureTown(),{founded:true,introduced:true,residents:4,spirit:20,followedRequest:null,requests:[]});G.setForm('wizard');G.setHdPilot(hd);G.world.load('sunriseQuay');G.state.enemies=[];
   Object.assign(G.state.player,G.world.safeArrival(8*16+8,26*16+8),{invuln:999});},hd);await drain();await frames(180);
  await pause();await tap('[data-menu-section="challenges"]');await tap('[data-follow-request="beacon"]');
  assert.equal(await page.evaluate(()=>G.currentTask().requestId),'beacon');await frames(180);
  await shot('work');const work=await page.evaluate(()=>({text:window.reviewHudText,task:G.currentTask().short,player:[G.state.player.x,G.state.player.y],dialogue:G.ui.dialogueOpen,menu:G.ui.menuOpen}));
  assert.ok(work.text.includes("Find the Mire Queen's pearl"),JSON.stringify(work));
  await pause();const hero=await page.locator('.journey-hero').innerText();assert.match(hero,/A PROMISE TO PEBBLE/);assert.match(hero,/A light for the late boat/);assert.match(hero,/8 town spirit/);await shot('journal');
  await tap('[data-menu-section="world"]');assert.match(await page.locator('.atlas-story-callout').innerText(),/Sunken Marsh/);await shot('atlas');await pause();
  await page.evaluate(()=>G.saveGame());await page.reload();await page.waitForFunction(()=>typeof G!=='undefined'&&G.state?.player);await connect();await drain();await frames(180);
  assert.equal(await page.evaluate(()=>G.currentTask().requestId),'beacon');assert.ok(await page.evaluate(()=>window.reviewHudText.includes("Find the Mire Queen's pearl")));await shot('restored');
  await page.evaluate(()=>{G.world.load('sunkenMarsh');const e=G.state.enemies.find(e=>e.id==='mireQueen');window.reviewQueen=e;G.state.enemies=[e];e.bossEngaged=true;e.bossIntroT=0;e.bossRecoverT=999;e.ward.hp=e.hp=1;G.state.bossCutscene=null;Object.assign(G.state.player,G.world.safeArrival(e.x+36,e.y),{dir:{x:-1,y:0},invuln:999,mana:G.playerMaxMana()});});await drain();await frames(60);
  for(let i=0;i<8&&!await page.evaluate(()=>window.reviewQueen.dead);i++){if(mode==='controller')await pad(2);else await tap('#btn-b');await frames(18);await drain();}
  assert.equal(await page.evaluate(()=>window.reviewQueen.dead),true);assert.equal(await page.evaluate(()=>G.currentTask().short),"Collect the Mire Queen's pearl");await frames(100);await shot('collect');
  for(let i=0;i<160&&!await page.evaluate(()=>G.state.items.includes('trophy-mire-pearl'));i++){
   const v=await page.evaluate(()=>{const r=G.groundRewardFor('trophy-mire-pearl'),p=G.state.player;return r?{dx:r.x-p.x,dy:r.y-p.y}:null;});if(!v)break;
   if(mode==='controller')await page.evaluate(({dx,dy})=>{const m=Math.hypot(dx,dy);window.__nqTvPad(JSON.stringify({t:'s',a:[dx/m,dy/m,0,0],b:Array(16).fill(0)}));},v);
   else{const k=Math.abs(v.dx)>Math.abs(v.dy)?v.dx>0?'ArrowRight':'ArrowLeft':v.dy>0?'ArrowDown':'ArrowUp';for(const key of ['ArrowRight','ArrowLeft','ArrowDown','ArrowUp']){if(key===k)await page.keyboard.down(key);else await page.keyboard.up(key);}}
   await frames(1);
  }
  if(mode==='controller')await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));else for(const k of ['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'])await page.keyboard.up(k);await drain();
  assert.equal(await page.evaluate(()=>G.currentTask().short),'Return to Pebble');
  await page.evaluate(()=>{G.world.load('sunriseQuay');G.state.enemies=[];Object.assign(G.state.player,G.world.safeArrival(8*16+8,26*16+8));});await drain();await frames(180);
  assert.ok(await page.evaluate(()=>window.reviewHudText.includes('Return to Pebble')));await shot('return');
  await pause();assert.match(await page.locator('.journey-hero').innerText(),/GOOD NEWS · RETURN TO THE QUAY/);await shot('return-journal');await pause();
  await page.evaluate(()=>Object.assign(G.state.player,{x:22*16+8,y:20*16+8}));await frames(2);assert.equal(await page.evaluate(()=>G.deliveryCandidate().label),'Good news for Pebble');
  const before=await page.evaluate(()=>G.state.town.spirit);if(mode==='controller')await pad(0);else await tap('#btn-a');await drain();await frames(10);
  await shot('kept');assert.equal(await page.evaluate(()=>G.state.town.spirit),before+8,JSON.stringify(await page.evaluate(()=>({menu:G.ui.menuOpen,dialogue:G.ui.dialogueOpen,candidate:G.deliveryCandidate(),task:G.currentTask().short,position:[G.state.player.x,G.state.player.y],text:window.reviewHudText}))));assert.equal(await page.evaluate(()=>G.currentTask().kind),'story');assert.match(await page.evaluate(()=>G.npcDialogue('pebble',0,0)),/turnips/);await shot('kept');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);
  console.log(`PASS ${mode} ${hd?'HD':'BASE'}: native menu follow, persistent headline, journal/atlas, real reload, native final blow/ground claim, return/thanks once`);await context.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
