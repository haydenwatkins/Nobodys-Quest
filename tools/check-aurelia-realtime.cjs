#!/usr/bin/env node
'use strict';
// Original RAF, AI and physics. Only the earned chapter/initial pose is supplied.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(require.resolve('playwright',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
const url=process.argv[2]||'http://127.0.0.1:8000/',out=process.argv[3]||'/tmp/nq-aurelia-realtime';
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
  await page.evaluate(()=>{Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.delivery.complete=true;G.state.claimedForms.push('wizard');G.setForm('wizard');G.world.load('windscarCanyon');window.realtimeAurelia=G.state.enemies.find(e=>!e.dead&&e.id==='skySovereign');window.realtimeHurts=[];G.events.on('playerHurt',v=>realtimeHurts.push({...v,fromAurelia:Math.hypot(v.fromX-realtimeAurelia.x,v.fromY-realtimeAurelia.y)<1}));Object.assign(G.state.player,{x:realtimeAurelia.x-70,y:realtimeAurelia.y,mana:0,manaRegenDelay:1000});});
  await page.waitForFunction(()=>G.ui.dialogueOpen);await drain();
  await page.waitForFunction(()=>G.state.enemies.some(e=>G.guardianPropLive(e)&&e.guardianProp.owner===realtimeAurelia),null,{timeout:20000,polling:20});
  await page.screenshot({path:path.join(out,mode+'-native-flight-warning.png')});
  const approach=await page.evaluate(()=>{const p=G.state.player,posts=G.state.enemies.filter(e=>G.guardianPropLive(e)&&e.guardianProp.owner===realtimeAurelia),at=posts.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0],dx=at.x-p.x,dy=at.y-p.y,d=Math.hypot(dx,dy)||1;window.realtimeFeather=at;return{x:dx/d,y:dy/d,ms:Math.max(0,(d-18)/G.playerForm().speed*1000)};});await move(approach.x,approach.y,Math.min(approach.ms,450));
  const aim=await page.evaluate(()=>{const p=G.state.player,at=realtimeFeather,dx=at.x-p.x,dy=at.y-p.y,d=Math.hypot(dx,dy)||1;return{x:dx/d,y:dy/d};});await art(aim.x,aim.y);
  await page.waitForFunction(()=>realtimeAurelia.skyChoices>0,null,{timeout:1000});await page.screenshot({path:path.join(out,mode+'-native-feather-choice.png')});
  const evade=await page.evaluate(()=>{const h=G.state.bossHazards.find(h=>h.owner===realtimeAurelia),f=h.flight,p=G.state.player,dx=f.selected.x-f.start.x,dy=f.selected.y-f.start.y,d=Math.hypot(dx,dy)||1;for(const side of [1,-1])if(G.world.isSafeSpawn(p.x-dy/d*side*28,p.y+dx/d*side*28))return{x:-dy/d*side,y:dx/d*side};return{x:0,y:1};});await move(evade.x,evade.y,330);
  await page.waitForFunction(()=>G.state.bossHazards.some(h=>h.owner===realtimeAurelia&&h.landed),null,{timeout:15000,polling:10});await page.screenshot({path:path.join(out,mode+'-native-committed-arrival.png')});
  const walk=await page.evaluate(()=>{const p=G.state.player,h=G.state.bossHazards.find(h=>h.owner===realtimeAurelia),f=h.flight,dx=f.windStart.x+(f.selected.x-f.windStart.x)*.6-p.x,dy=f.windStart.y+(f.selected.y-f.windStart.y)*.6-p.y,d=Math.hypot(dx,dy)||1;return{x:dx/d,y:dy/d,ms:d/G.playerForm().speed*1000};});await move(walk.x,walk.y,Math.min(500,walk.ms));await page.waitForFunction(()=>realtimeAurelia.skyWindSteps>0,null,{timeout:1500});
  const result=await page.evaluate(()=>({hp:realtimeAurelia.hp,ward:realtimeAurelia.ward.hp,stagger:realtimeAurelia.bossStaggerT,damage:G.state.player.damageTaken,mana:G.state.player.mana,heart:G.comfortSetting('easyMode'),guardian:G.comfortSetting('bossAssistance'),choices:realtimeAurelia.skyChoices,windSteps:realtimeAurelia.skyWindSteps,hurts:realtimeHurts,knockout:!!G.state.knockout}));assert.equal(result.hp,88);assert.equal(result.ward,7);assert.equal(result.stagger,0);assert.equal(result.knockout,false);assert.equal(result.hurts.filter(h=>h.fromAurelia).length,0,JSON.stringify(result));assert.equal(result.mana,0);assert.equal(result.heart,false);assert.equal(result.guardian,false);assert.deepEqual(errors,[]);
  await page.screenshot({path:path.join(out,mode+'-native-wind-approach.png')});console.log(JSON.stringify({mode,url,clock:'native requestAnimationFrame',...result,errors}));await context.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
