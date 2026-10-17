#!/usr/bin/env node
'use strict';
// Original RAF, AI and physics. Only the earned chapter/initial pose is supplied.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(require.resolve('playwright',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
const url=process.argv[2]||'http://127.0.0.1:8011/',out=process.argv[3]||'.scratch/verification/vesper/realtime';
(async()=>{
 fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{for(const mode of ['touch','controller']){
  const viewport=mode==='touch'?{width:667,height:375}:{width:1280,height:720},context=await browser.newContext({viewport,hasTouch:mode==='touch',...(mode==='controller'?{userAgent:'NobodysQuestTV/1.0 real-time check'}:{})}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${new URL(r.url()).pathname}`);});
  async function pad(axes=[0,0,0,0],pressed=false,index=0){await page.evaluate(({axes,pressed,index})=>{const b=Array(16).fill(0);b[index]=pressed?1:0;window.__nqTvPad(JSON.stringify({t:'s',a:axes,b}));},{axes,pressed,index});}
  async function next(){if(mode==='controller'){await pad(undefined,true);const t=await page.evaluate(()=>G.state.time);await page.waitForFunction(t=>G.state.time>=t+.1,t,{timeout:30000,polling:20});await pad();}else await page.touchscreen.tap(viewport.width/2,viewport.height/2);await page.waitForTimeout(100);}
  async function drain(){for(let i=0;i<40&&await page.evaluate(()=>G.ui.dialogueOpen);i++){const t=await page.evaluate(()=>G.state.time);await page.waitForFunction(t=>!G.ui.dialogueOpen||G.state.time>=t+.16,t,{timeout:30000,polling:20});if(await page.evaluate(()=>G.ui.dialogueOpen))await next();}assert.equal(await page.evaluate(()=>G.ui.dialogueOpen),false);}
  async function move(x,y,ms){
   if(mode==='controller'){await pad([x,y,0,0]);const t=await page.evaluate(()=>G.state.time);await page.waitForFunction(({t,ms})=>G.state.time>=t+ms/1000,{t,ms},{timeout:30000,polling:20});await pad();}
   else{const b=await page.locator('#joy-zone').boundingBox(),cdp=await context.newCDPSession(page),bx=b.x+b.width/2,by=b.y+b.height/2;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:bx,y:by,id:2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:bx+x*40,y:by+y*40,id:2}]});const t=await page.evaluate(()=>G.state.time);await page.waitForFunction(({t,ms})=>G.state.time>=t+ms/1000,{t,ms},{timeout:30000,polling:20});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}
  }
  async function art(x,y,secondary=false){
   if(mode==='controller'){await pad([0,0,x,y],true,secondary?2:0);const t=await page.evaluate(()=>G.state.time);await page.waitForFunction(t=>G.state.time>=t+.1,t,{timeout:30000,polling:20});await pad();}
   else{const b=await page.locator(secondary?'#btn-b':'#btn-a').boundingBox(),cdp=await context.newCDPSession(page),bx=b.x+b.width/2,by=b.y+b.height/2;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:bx,y:by,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:bx+x*35,y:by+y*35,id:1}]});const t=await page.evaluate(()=>G.state.time);await page.waitForFunction(t=>G.state.time>=t+.1,t,{timeout:30000,polling:20});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}
  }
  await page.goto(url);await page.waitForFunction(()=>typeof G!=='undefined'&&G.state?.player);
  if(mode==='controller')await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'c',id:'Real-time TV check'})));
  if(await page.evaluate(()=>G.saveSlotScreenOpen)){if(mode==='controller')await next();else await page.locator('[data-save-slot="1"]').tap();await page.waitForTimeout(500);}
  await drain();assert.equal(await page.evaluate(()=>G.comfortSetting('easyMode')),false);assert.equal(await page.evaluate(()=>G.comfortSetting('bossAssistance')),false);
  const start=await page.evaluate(()=>({x:G.state.player.x,y:G.state.player.y}));if(mode==='controller'){await pad([1,0,0,0]);try{await page.waitForFunction(start=>Math.hypot(G.state.player.x-start.x,G.state.player.y-start.y)>5,start,{timeout:30000,polling:20});}catch(e){console.error(await page.evaluate(start=>({stage:'native opening movement',start,p:{x:G.state.player.x,y:G.state.player.y},map:G.state.mapId,dialogue:G.ui.dialogueOpen,menu:G.ui.menuOpen,kit:!!G.fieldKit?.isOpen(),slot:G.saveSlotScreenOpen,gamepad:G.input.hasGamepad,vec:G.input.vec,safeRight:G.world.isSafeSpawn(G.state.player.x+10,G.state.player.y),opening:G.state.opening}),start));throw e;}finally{await pad();}}else await move(1,0,200);assert.ok(await page.evaluate(start=>Math.hypot(G.state.player.x-start.x,G.state.player.y-start.y)>5,start));await page.screenshot({path:path.join(out,mode+'-native-opening.png')});

  await page.evaluate(()=>{
   Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.delivery.complete=true;G.state.items.push('trophy-mire-pearl');G.ensureTown().requests.push('beacon');G.state.claimedForms.push('wizard');G.setForm('wizard');G.world.load('vampireTrial');window.realtimeVesper=G.state.enemies.find(e=>e.id==='countessCarmine');Object.assign(G.state.player,{x:realtimeVesper.x-65,y:realtimeVesper.y,mana:0,manaRegenDelay:1000});window.realtimeDamage=0;window.realtimePaid=0;window.realtimeCatch=null;
   G.events.on('playerHurt',v=>realtimeDamage+=v.damage);G.events.on('abilityUse',v=>{if(G.abilityManaCost(G.abilities[v.ability])>0)realtimePaid++;});G.events.on('guardianCounter',v=>{if(v.guardian==='countessCarmine')realtimeCatch={hp:realtimeVesper.hp,ward:realtimeVesper.ward.hp,charge:realtimeVesper.bossChargeT,stagger:realtimeVesper.bossStaggerT||0};});
   window.realtimeVesperDecision=()=>{
    const e=realtimeVesper,p=G.state.player,cover=G.state.enemies.find(m=>!m.dead&&m.moonCover?.owner===e),charge=e.bossPendingAction==='vampireDash'&&e.bossTelegraphT>0||e.bossChargeT>0;
    let target={x:e.x-65,y:e.y},aim=e,attack=false;
    if(cover&&!cover.moonCover.lit){const a=Math.atan2(cover.y-e.y,cover.x-e.x);target={x:cover.x+Math.cos(a)*25,y:cover.y+Math.sin(a)*25};aim=cover;attack=Math.hypot(p.x-cover.x,p.y-cover.y)<65&&!(p.cooldowns.curse>0);}
    else if(charge){const nx=-e.bossChargeY,ny=e.bossChargeX,side=(p.x-e.x)*nx+(p.y-e.y)*ny>=0?1:-1;target={x:e.x+nx*side*65,y:e.y+ny*side*65};}
    else if(G.duskShadowPoint(e)){const at=G.duskShadowPoint(e),pool=e.duskShadow.moonCover.pool||e.duskShadow;target={x:pool.x,y:pool.y};aim=at;attack=Math.hypot(p.x-at.x,p.y-at.y)<90&&!(p.cooldowns.curse>0);}
    if(!G.world.isSafeSpawn(target.x,target.y))target=G.world.safeArrival(target.x,target.y);
    const dx=aim.x-p.x,dy=aim.y-p.y,d=Math.hypot(dx,dy)||1,vx=target.x-p.x,vy=target.y-p.y,m=Math.hypot(vx,vy),speed=G.forms.wizard.speed,desired=m>2?{x:vx/m,y:vy/m}:{x:0,y:0},choices=[desired,{x:0,y:0},...Array.from({length:16},(_,i)=>({x:Math.cos(i*Math.PI/8),y:Math.sin(i*Math.PI/8)}))];
    const score=v=>{const toward=m>0?(v.x*vx+v.y*vy)/m:0,travel=toward>.99?Math.min(speed*.2,m):speed*.2;let cost=Math.hypot(p.x+v.x*travel-target.x,p.y+v.y*travel-target.y);
     for(let j=1;j<=6;j++){const t=j*.08,walk=toward>.99?Math.min(speed*t,m):speed*t,x=p.x+v.x*walk,y=p.y+v.y*walk;if(!G.world.isSafeSpawn(x,y))cost+=1000;
      if(charge){const wait=e.bossChargeT>0?0:e.bossTelegraphT,travel=e.def.boss.chargeSpeed*Math.min(Math.max(0,t-wait),e.bossChargeT>0?e.bossChargeT:e.def.boss.chargeDur),bx=e.x+e.bossChargeX*travel,by=e.y+e.bossChargeY*travel;cost+=Math.max(0,24-Math.hypot(x-bx,y-by))**2*20;}
      for(const s of G.state.projectiles)if(s.owner===e&&!s.fromPlayer&&!s.dispelled&&!G.duskShelters({x,y},s)){const scale=G.guidanceProjectileScale(s);cost+=Math.max(0,15-Math.hypot(x-s.x-s.vx*t*scale,y-s.y-s.vy*t*scale))**2*15;}}
     return cost;};choices.sort((a,b)=>score(a)-score(b));return{v:choices[0],aim:{x:dx/d,y:dy/d},attack};
   };
  });await page.waitForFunction(()=>G.ui.dialogueOpen);await drain();
  const driveCdp=mode==='touch'?await context.newCDPSession(page):null,joy=mode==='touch'?await page.locator('#joy-zone').boundingBox():null;let joyHeld=false;
  async function releaseDrive(){if(mode==='controller')await pad();else if(joyHeld){await driveCdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});joyHeld=false;}}
  async function drive(v){if(mode==='controller')await pad([v.x,v.y,0,0]);else{const x=joy.x+joy.width/2,y=joy.y+joy.height/2;if(!joyHeld){await driveCdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:2}]});joyHeld=true;}await driveCdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+v.x*40,y:y+v.y*40,id:2}]});}const t=await page.evaluate(()=>G.state.time);await page.waitForFunction(t=>G.state.time>=t+.04,t,{timeout:30000,polling:10});}
  let caught=false;
  for(let i=0;i<1800&&!await page.evaluate(()=>realtimeVesper.duskShadowHits>0);i++){
   assert.equal(await page.evaluate(()=>!!G.state.knockout),false);const decision=await page.evaluate(()=>realtimeVesperDecision());if(decision.attack){await releaseDrive();await art(decision.aim.x,decision.aim.y);}else await drive(decision.v);
   if(!caught&&await page.evaluate(()=>!!window.realtimeCatch)){caught=true;await page.screenshot({path:path.join(out,mode+'-actual-continuing-dash.png')});}
  }
  await releaseDrive();if(driveCdp)await driveCdp.detach();
  assert.ok(await page.evaluate(()=>realtimeVesper.duskShadowHits>0),JSON.stringify(await page.evaluate(()=>({hp:realtimeVesper.hp,ward:realtimeVesper.ward.hp,p:{x:G.state.player.x,y:G.state.player.y},catch:realtimeCatch}))));
  await page.screenshot({path:path.join(out,mode+'-actual-free-shadow-contact.png')});
  const result=await page.evaluate(()=>({atCatch:realtimeCatch,hp:realtimeVesper.hp,ward:realtimeVesper.ward.hp,speed:realtimeVesper.def.speed,counters:realtimeVesper.duskCounters,shadowHits:realtimeVesper.duskShadowHits,actualDamage:realtimeDamage,endDamage:G.state.player.damageTaken,mana:G.state.player.mana,paidCasts:realtimePaid,heart:G.comfortSetting('easyMode'),guardian:G.comfortSetting('bossAssistance'),knockout:!!G.state.knockout,liveHazards:G.state.bossHazards.filter(h=>h.owner===realtimeVesper).length,liveShots:G.state.projectiles.filter(s=>s.owner===realtimeVesper&&!s.fromPlayer&&!s.dispelled).length}));assert.equal(result.atCatch.hp,58);assert.equal(result.atCatch.ward,6);assert.ok(result.atCatch.charge>0);assert.equal(result.atCatch.stagger,0);assert.equal(result.hp,58);assert.equal(result.ward,5);assert.equal(result.speed,65);assert.equal(result.counters,1);assert.equal(result.shadowHits,1);assert.equal(result.paidCasts,0);assert.equal(result.heart,false);assert.equal(result.guardian,false);assert.equal(result.knockout,false);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({mode,url,clock:'native requestAnimationFrame',context:'supplied earned chapter/initial pose; original AI, real free lamp preparation, continuing dash and normal shadow Ward contact',...result,errors}));await context.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
