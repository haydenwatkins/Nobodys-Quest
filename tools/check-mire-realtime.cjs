#!/usr/bin/env node
'use strict';
// Original RAF, AI and physics. Only the earned chapter/initial pose is supplied.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(require.resolve('playwright',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
const url=process.argv[2]||'http://127.0.0.1:8000/',out=process.argv[3]||'/tmp/nq-mire-realtime';
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{for(const mode of ['touch','controller']){
  const viewport=mode==='touch'?{width:667,height:375}:{width:1280,height:720},context=await browser.newContext({viewport,hasTouch:mode==='touch',...(mode==='controller'?{userAgent:'NobodysQuestTV/1.0 real-time check'}:{})}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${new URL(r.url()).pathname}`);});
  async function pad(axes=[0,0,0,0],pressed=false){await page.evaluate(({axes,pressed})=>window.__nqTvPad(JSON.stringify({t:'s',a:axes,b:[pressed?1:0,...Array(15).fill(0)]})),{axes,pressed});}
  async function next(){if(mode==='controller'){await pad(undefined,true);await page.waitForTimeout(80);await pad();}else await page.touchscreen.tap(viewport.width/2,viewport.height/2);await page.waitForTimeout(100);}
  async function drain(){for(let i=0;i<40&&await page.evaluate(()=>G.ui.dialogueOpen);i++)await next();assert.equal(await page.evaluate(()=>G.ui.dialogueOpen),false);}
  async function move(x,y,ms){
   if(mode==='controller'){await pad([x,y,0,0]);await page.waitForTimeout(ms);await pad();}
   else{const b=await page.locator('#joy-zone').boundingBox(),cdp=await context.newCDPSession(page),bx=b.x+b.width/2,by=b.y+b.height/2;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:bx,y:by,id:2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:bx+x*40,y:by+y*40,id:2}]});await page.waitForTimeout(ms);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}
  }
  async function art(x,y){
   if(mode==='controller'){await pad([0,0,x,y],true);await page.waitForTimeout(80);await pad();}
   else{const b=await page.locator('#btn-a').boundingBox(),cdp=await context.newCDPSession(page),bx=b.x+b.width/2,by=b.y+b.height/2;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:bx,y:by,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:bx+x*35,y:by+y*35,id:1}]});await page.waitForTimeout(80);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}
  }
  await page.goto(url);await page.waitForFunction(()=>typeof G!=='undefined'&&G.state?.player);
  if(mode==='controller')await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'c',id:'Real-time TV check'})));
  if(await page.evaluate(()=>G.saveSlotScreenOpen)){if(mode==='controller')await next();else await page.locator('[data-save-slot="1"]').tap();await page.waitForTimeout(500);}
  await drain();assert.equal(await page.evaluate(()=>G.comfortSetting('easyMode')),false);assert.equal(await page.evaluate(()=>G.comfortSetting('bossAssistance')),false);
  const start=await page.evaluate(()=>({x:G.state.player.x,y:G.state.player.y}));await move(1,0,200);assert.ok(await page.evaluate(start=>Math.hypot(G.state.player.x-start.x,G.state.player.y-start.y)>5,start));await page.screenshot({path:path.join(out,mode+'-native-opening.png')});
  await page.evaluate(()=>{Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.delivery.complete=true;G.state.claimedForms.push('wizard');G.setForm('wizard');G.world.load('sunkenMarsh');window.realtimeQueen=G.state.enemies.find(e=>!e.dead&&e.id==='mireQueen');Object.assign(G.state.player,{x:realtimeQueen.x-60,y:realtimeQueen.y,mana:0,manaRegenDelay:1000});});
  await page.waitForFunction(()=>G.ui.dialogueOpen);await drain();
  await page.waitForFunction(()=>G.state.bossHazards.some(h=>h.owner===realtimeQueen&&h.kind==='mirePool'),null,{timeout:20000,polling:20});
  await move(1,0,260);await page.screenshot({path:path.join(out,mode+'-native-bubble-sidestep.png')});
  await page.waitForFunction(()=>G.state.enemies.some(e=>!e.dead&&e.mireCrust?.owner===realtimeQueen),null,{timeout:5000,polling:20});
  const aim=await page.evaluate(()=>{const p=G.state.player,c=G.state.enemies.find(c=>!c.dead&&c.mireCrust?.owner===realtimeQueen),dx=c.x-p.x,dy=c.y-p.y,d=Math.hypot(dx,dy);return{x:dx/d,y:dy/d};});await art(aim.x,aim.y);
  await page.waitForFunction(()=>realtimeQueen.mireCounters>0,null,{timeout:1500});await page.screenshot({path:path.join(out,mode+'-native-crust-and-channel.png')});
  await page.waitForFunction(()=>G.state.projectiles.some(s=>s.owner===realtimeQueen&&!s.fromPlayer&&!s.dispelled),null,{timeout:15000,polling:20});
  const walk=await page.evaluate(()=>{const p=G.state.player,c=realtimeQueen.mireChannel,dx=(c.x+c.x2)/2-p.x,dy=(c.y+c.y2)/2-p.y,d=Math.hypot(dx,dy);return{x:p.x,y:p.y,damage:p.damageTaken,vx:dx/d,vy:dy/d};});await move(walk.vx,walk.vy,250);
  assert.ok(await page.evaluate(walk=>Math.hypot(G.state.player.x-walk.x,G.state.player.y-walk.y)>15,walk));assert.equal(await page.evaluate(()=>G.mireShelters(G.state.player,realtimeQueen)),true);
  await page.waitForFunction(()=>!G.state.projectiles.some(s=>s.owner===realtimeQueen&&!s.fromPlayer&&!s.dispelled),null,{timeout:5000});
  const result=await page.evaluate(()=>({hp:realtimeQueen.hp,ward:realtimeQueen.ward.hp,stagger:realtimeQueen.bossStaggerT,damage:G.state.player.damageTaken,mana:G.state.player.mana,heart:G.comfortSetting('easyMode'),guardian:G.comfortSetting('bossAssistance'),channels:realtimeQueen.mireCounters}));assert.equal(result.hp,36);assert.equal(result.ward,5);assert.equal(result.stagger,0);assert.equal(result.damage,walk.damage);assert.equal(result.damage,0);assert.equal(result.mana,0);assert.equal(result.heart,false);assert.equal(result.guardian,false);assert.deepEqual(errors,[]);
  await page.screenshot({path:path.join(out,mode+'-native-walk-through-reeds.png')});console.log(JSON.stringify({mode,url,clock:'native requestAnimationFrame',...result,errors}));await context.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
