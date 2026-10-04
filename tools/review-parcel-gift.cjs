#!/usr/bin/env node
// Controlled earned NPC checkpoints; native touch/TV interaction, saves and movement.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(require.resolve('playwright',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
const seal=process.argv[2]==='seal',item=seal?'sunrise-seal':'orchard-ribbon',amount=seal?8:5;
const url=process.argv[3]||'http://127.0.0.1:8000/',out=path.resolve(process.argv[4]||`/tmp/nobodys-quest-${seal?'seal':'ribbon'}-scenes`);
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});fs.mkdirSync(out,{recursive:true});
 try{for(const mode of ['touch','controller'])for(const hd of [true,false]){
  const viewport=mode==='touch'?{width:667,height:375}:{width:1280,height:720},context=await browser.newContext({viewport,hasTouch:mode==='touch',...(mode==='controller'?{userAgent:'NobodysQuestTV/1.0 Chromium review'}:{})}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{window.reviewClock=1000;window.requestAnimationFrame=cb=>(window.reviewFrame=cb,1);window.cancelAnimationFrame=()=>{};
   const fill=CanvasRenderingContext2D.prototype.fillText,clear=CanvasRenderingContext2D.prototype.clearRect,rect=CanvasRenderingContext2D.prototype.fillRect;window.reviewHudText=[];window.reviewHudRects=[];
   CanvasRenderingContext2D.prototype.fillText=function(text,...args){if(this.canvas.id==='ui')window.reviewHudText.push(String(text));return fill.call(this,text,...args);};
   CanvasRenderingContext2D.prototype.fillRect=function(x,y,w,h){if(this.canvas.id==='ui')window.reviewHudRects.push({x,y,w,h,color:this.fillStyle});return rect.call(this,x,y,w,h);};
   CanvasRenderingContext2D.prototype.clearRect=function(...args){if(this.canvas.id==='ui'){window.reviewHudText=[];window.reviewHudRects=[];}return clear.apply(this,args);};});
  const frames=n=>page.evaluate(n=>{for(let i=0;i<n;i++){const cb=window.reviewFrame;window.reviewFrame=null;window.reviewClock+=50;if(cb)cb(window.reviewClock);}},n);
  async function connect(){if(mode==='controller'){await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'c',id:'Review TV controller'})));await frames(1);assert.equal(await page.evaluate(()=>G.input.hasGamepad),true);}}
  async function next(){
   if(mode==='controller'){await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:[1,0,0,0]})));await frames(1);await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:[0,0,0,0]})));}
   else if(await page.evaluate(()=>G.ui.dialogueOpen))await page.touchscreen.tap(viewport.width/2,viewport.height/2);
   else{const b=await page.locator('#btn-a').boundingBox();assert.ok(b);await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);}
   await frames(5);
  }
  async function drain(){for(let i=0;i<50&&await page.evaluate(()=>G.ui.dialogueOpen);i++){await frames(5);await next();}assert.equal(await page.evaluate(()=>G.ui.dialogueOpen),false);}
  const shot=stage=>page.screenshot({path:path.join(out,`${mode}-${hd?'hd':'base'}-${stage}.png`)});
  async function boot(){await page.waitForFunction(()=>typeof G!=='undefined'&&G.state?.player);await connect();await drain();await frames(100);await drain();}
  await page.goto(url);await boot();await page.evaluate(({hd,seal})=>{
   G.state.items=seal?['orchard-ribbon','keeper-lantern']:['trophy-heartwood-crown'];G.state.stars=5;
   G.state.claimedForms=G.formOrder.filter(id=>!['nobody','god'].includes(id));G.questsDone=G.formOrder.filter(f=>f!=='god').flatMap(f=>G.forms[f].quests.map(q=>q.id));
   G.state.story=G.normalizeStory({prologueSeen:true,seenChapters:[0,1,2,3,4,5],lastChapter:5});
   G.state.opening=G.normalizeOpening({started:true,notice:true,cart:true,sluice:true,bell:true,complete:seal});
   G.state.delivery=seal?G.normalizeDelivery({started:true,keeper:true,lamps:[2,2],parcels:['bread','letter','present'],seen:['quay']}):G.makeDelivery();
   Object.assign(G.ensureTown(),{founded:true,introduced:true,residents:4,spirit:20});G.setForm('nobody');G.setHdPilot(hd);
   G.world.load(seal?'sunriseQuay':'orchardRoad');for(const e of G.state.enemies)if(e.openingKey&&!e.def.practice)G.state.opening.defeated.push(e.openingKey);G.state.enemies=[];G.state.player.damageTaken=0;
   Object.assign(G.state.player,{x:(seal?8:22)*16+8,y:(seal?20:37)*16+8,invuln:999});
  },{hd,seal});await drain();await frames(100);await drain();await next();
  assert.ok(await page.evaluate(item=>G.groundRewardFor(item),item));assert.equal(await page.evaluate(item=>G.state.items.includes(item),item),false);assert.equal(await page.evaluate(()=>G.ensureTown().spirit),20);
  assert.equal(await page.evaluate(seal=>seal?G.state.delivery.complete:G.state.opening.complete,seal),true);
  await frames(80);await shot('thanks');await drain();await frames(100);await drain();
  async function visible(){await frames(1);assert.equal(await page.evaluate(()=>{const r=G.nearGroundReward();return !!r&&window.reviewHudText.includes(G.groundRewardInfo(r).name)&&window.reviewHudText.join(' ').includes(G.groundRewardInfo(r).purpose)&&window.reviewHudText.join(' ').includes('Walk over the treasure to collect');}),true,JSON.stringify(await page.evaluate(()=>({paint:window.reviewHudText,gift:G.nearGroundReward(),p:{x:G.state.player.x,y:G.state.player.y}}))));assert.equal(await page.evaluate(()=>{const cue=window.reviewHudRects.find(r=>r.color.replace(/\s/g,'').replace(',0.',',.')==='rgba(26,28,44,.94)'),status=window.reviewHudRects.find(r=>r.x===6&&r.y===6&&r.color.replace(/\s/g,'').replace(',0.',',.')==='rgba(30,44,44,.88)');return !!cue&&!!status&&!(cue.x<status.x+status.w&&cue.x+cue.w>status.x&&cue.y<status.y+status.h&&cue.y+cue.h>status.y);}),true,'purpose cue clears the actual paper hearts/mana/identity panel');}
  await visible();await shot('ground');await page.evaluate(()=>G.saveGame());await page.reload();await boot();
  assert.equal(await page.evaluate(item=>G.state.items.includes(item),item),false);assert.equal(await page.evaluate(()=>G.ensureTown().spirit),20);await visible();await shot('restored');
  for(let i=0;i<120&&!await page.evaluate(item=>G.state.items.includes(item),item);i++){
   const v=await page.evaluate(item=>{const r=G.groundRewardFor(item),p=G.state.player;return {dx:r.x-p.x,dy:r.y-p.y};},item);
   if(mode==='controller')await page.evaluate(({dx,dy})=>{const m=Math.hypot(dx,dy);window.__nqTvPad(JSON.stringify({t:'s',a:[dx/m,dy/m,0,0],b:[0,0,0,0]}));},v);
   else{const key=Math.abs(v.dx)>Math.abs(v.dy)?(v.dx>0?'ArrowRight':'ArrowLeft'):(v.dy>0?'ArrowDown':'ArrowUp');for(const k of ['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'])if(k===key)await page.keyboard.down(k);else await page.keyboard.up(k);}
   await frames(1);if(await page.evaluate(()=>G.ui.dialogueOpen))await drain();
  }
  if(mode==='controller')await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:[0,0,0,0]})));else for(const k of ['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'])await page.keyboard.up(k);
  await frames(1);await drain();assert.equal(await page.evaluate(item=>G.state.items.includes(item),item),true);assert.equal(await page.evaluate(()=>G.ensureTown().spirit),20+amount);assert.equal(await page.evaluate(()=>G.state.stars),5);await shot('collected');
  await page.evaluate(()=>G.saveGame());await page.reload();await boot();assert.equal(await page.evaluate(item=>G.groundRewardFor(item),item),null);assert.equal(await page.evaluate(()=>G.ensureTown().spirit),20+amount);await shot('owned-boot');
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  console.log(`PASS ${item} ${mode} ${hd?'HD':'BASE'}: native NPC thanks, saved uncollected spirit/item, actual movement claim, owned boot, +${amount} spirit once`);await context.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
