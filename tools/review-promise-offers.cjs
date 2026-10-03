#!/usr/bin/env node
// Controlled NPC conversation positions; native choices and real save boot.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(require.resolve('playwright',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
const url=process.argv[2]||'http://127.0.0.1:8000/',out=path.resolve(process.argv[3]||'/tmp/nobodys-quest-promise-offer-scenes');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});fs.mkdirSync(out,{recursive:true});
 try{for(const mode of ['touch','controller'])for(const hd of [true,false]){
  const viewport=mode==='touch'?{width:667,height:375}:{width:1280,height:720},context=await browser.newContext({viewport,hasTouch:mode==='touch',...(mode==='controller'?{userAgent:'NobodysQuestTV/1.0 Chromium review'}:{})}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{window.reviewClock=1000;window.requestAnimationFrame=cb=>(window.reviewFrame=cb,1);window.cancelAnimationFrame=()=>{};
   const fill=CanvasRenderingContext2D.prototype.fillText,clear=CanvasRenderingContext2D.prototype.clearRect;window.reviewHudPaint=[];
   CanvasRenderingContext2D.prototype.fillText=function(text,x,y,...args){if(this.canvas.id==='ui')window.reviewHudPaint.push({text:String(text),x,y});return fill.call(this,text,x,y,...args);};
   CanvasRenderingContext2D.prototype.clearRect=function(...args){if(this.canvas.id==='ui')window.reviewHudPaint=[];return clear.apply(this,args);};});
  const frames=n=>page.evaluate(n=>{for(let i=0;i<n;i++){const cb=window.reviewFrame;window.reviewFrame=null;window.reviewClock+=50;if(cb)cb(window.reviewClock);}},n);
  async function pad(button){const b=Array(16).fill(0);b[button]=1;await page.evaluate(b=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b})),b);await frames(1);await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));await frames(4);}
  async function connect(){if(mode==='controller'){await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'c',id:'Review TV controller'})));await frames(1);assert.equal(await page.evaluate(()=>G.input.hasGamepad),true);}}
  async function next(){if(mode==='controller')await pad(0);else if(await page.evaluate(()=>G.ui.dialogueOpen))await page.touchscreen.tap(viewport.width/2,viewport.height/2);else{const b=await page.locator('#btn-a').boundingBox();await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);}await frames(5);}
  async function choicePresent(){return page.evaluate(()=>window.reviewHudPaint.some(p=>p.text.endsWith('Maybe later')));}
  async function offer(x,y){await page.evaluate(({x,y})=>Object.assign(G.state.player,{x:x*16+8,y:y*16+8}),{x,y});await frames(3);await next();for(let i=0;i<30&&!await choicePresent();i++)await next();assert.equal(await choicePresent(),true);}
  async function answer(accept){if(mode==='controller')await pad(accept?0:1);else{const point=await page.evaluate(accept=>{const p=window.reviewHudPaint.find(p=>p.text.endsWith(accept?"I'll help":'Maybe later')),r=document.getElementById('ui').getBoundingClientRect();return {x:r.left+(p.x+8)*r.width/G.W,y:r.top+(p.y+5)*r.height/G.H};},accept);await page.touchscreen.tap(point.x,point.y);}await frames(6);assert.equal(await page.evaluate(()=>G.ui.dialogueOpen),false);}
  const shot=stage=>page.screenshot({path:path.join(out,`${mode}-${hd?'hd':'base'}-${stage}.png`)});
  await page.goto(url);await page.waitForFunction(()=>typeof G!=='undefined'&&G.state?.player);await connect();for(let i=0;i<50&&await page.evaluate(()=>G.ui.dialogueOpen);i++)await next();
  await page.evaluate(hd=>{G.state.opening.complete=G.state.delivery.complete=true;G.state.claimedForms=Object.keys(G.forms).filter(id=>id!=='nobody'&&id!=='god');G.questsDone=Object.values(G.forms).flatMap(f=>f.quests.map(q=>q.id));
   Object.assign(G.ensureTown(),{founded:true,introduced:true,residents:4,spirit:20,followedRequest:null,requests:[]});G.setHdPilot(hd);G.world.load('sunriseQuay');G.state.enemies=[];},hd);
  for(let i=0;i<50&&await page.evaluate(()=>G.ui.dialogueOpen);i++)await next();await frames(180);
  await offer(22,20);assert.equal(await page.evaluate(()=>G.followedSunriseRequest()),null);await answer(false);assert.equal(await page.evaluate(()=>G.followedSunriseRequest()),null);
  let previous=null;
  for(const [id,x,y]of [['beacon',22,20],['recipes',12,12],['dragon',28,26],['welcome',30,13]]){
   await offer(x,y);assert.equal(await page.evaluate(()=>G.followedSunriseRequest()?.id||null),previous);
   if(mode==='touch'){await page.touchscreen.tap(viewport.width/2,viewport.height/4);await frames(5);assert.equal(await choicePresent(),true,'tapping outside the choices does not accept');}
   await shot(`offer-${id}`);
   if(id==='recipes'){await answer(false);assert.equal(await page.evaluate(()=>G.followedSunriseRequest().id),'beacon');await shot('deferred');await offer(x,y);}
   const spirit=await page.evaluate(()=>G.state.town.spirit);await answer(true);
   assert.equal(await page.evaluate(()=>G.followedSunriseRequest().id),id);assert.equal(await page.evaluate(()=>G.state.town.spirit),spirit);assert.equal(await page.evaluate(()=>G.state.town.requests.length),0);previous=id;
  }
  await page.evaluate(()=>{Object.assign(G.state.player,G.world.safeArrival(8*16+8,26*16+8));G.saveGame();});await page.reload();await page.waitForFunction(()=>typeof G!=='undefined'&&G.state?.player);await connect();
  for(let i=0;i<50&&await page.evaluate(()=>G.ui.dialogueOpen);i++)await next();await frames(180);
  assert.equal(await page.evaluate(()=>G.followedSunriseRequest().id),'welcome');assert.ok(await page.evaluate(()=>window.reviewHudPaint.some(p=>p.text==='Build the Welcome Lodge')));await shot('restored');
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  console.log(`PASS ${mode} ${hd?'HD':'BASE'}: four native NPC offers, explicit accept/defer, chosen promise preserved on defer, no completion grant, real saved selection`);await context.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
