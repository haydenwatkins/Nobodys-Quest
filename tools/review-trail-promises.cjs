#!/usr/bin/env node
'use strict';
// Earned, protected visual checkpoints isolate native input, conversations,
// saved crossings and consequence art. The live simulation checks real AI.
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2],out:process.argv[3]||'/tmp/patchling-trail-promises',name:'six Worldwake neighbour promises',publishedHost:true,
 async run({page,mode,frames,next,drain,offer,answer,walkTo,shot,reload}){
  async function art(slot){
   if(mode==='controller'){const b=Array(16).fill(0);b[slot==='a'?0:2]=1;await page.evaluate(b=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b})),b);await frames(1);await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));}
   else await page.locator('#btn-'+slot).tap();await frames(6);
  }
  const promises=await page.evaluate(()=>G.FORM_TRAIL_PROMISES.map(p=>({...p,...G.FORM_TRAILS.find(t=>t.formId===p.formId)})));
  for(const promise of promises){
   await page.evaluate(t=>{
    Object.assign(G.state.opening,{started:true,complete:true,bell:true,version:2});G.state.delivery.complete=true;G.state.stars=40;
    G.state.items=['trophy-heartwood-crown','trophy-mire-pearl'];G.state.claimedForms=['rat','knight','wizard',t.formId];
    G.questsDone=[];G.questCounts={};G.state.loadouts={};G.state.formEchoes=[];
    Object.assign(G.ensureTown(),{requests:['recipes','beacon'],followedRequest:'beacon'});
    G.state.worldwake.marks=[t.mark];G.state.formOutings={active:{formId:t.formId,arts:[],scenes:[]},features:[]};
    G.setForm(t.formId);G.world.load(t.id);G.state.player.invuln=999;
   },promise);await drain();await frames(240);await shot(promise.id+'-arrival');
   assert.equal(await page.evaluate(()=>G.deliveryCandidate()?.id),'trail-'+promise.formId);
   await next();await next();await frames(5);
   assert.equal(await page.evaluate(text=>window.reviewPaint.map(p=>p.text).join(' ').replace(/\s+/g,' ').includes(text.replace(/\s+/g,' ')),promise.ask),true,'the complete concern fits and is painted');await shot(promise.id+'-concern');
   assert.equal(await page.evaluate(name=>Boolean(G.resolveDialogueSpeaker(name).sprite),promise.person.toUpperCase()),true,'the actual NPC portrait is available');
   await offer();await shot(promise.id+'-choice');await answer(false);
   assert.equal(await page.evaluate(()=>G.ensureTown().followedRequest),'beacon');await offer();await answer(true);
   assert.equal(await page.evaluate(()=>G.currentTask().requestId),'trail-'+promise.formId);
   await page.evaluate(id=>{
    const p=G.state.player;Object.assign(p,{x:160,y:296,dir:{x:1,y:0}});G.state.projectiles=[];
    if(['golem','lanternWisp'].includes(id)){const e=G.makeEnemy('wisp',230,296);e.shootT=.2;G.state.enemies=[e];}
    else if(id==='weaver')G.state.enemies=[G.makeEnemy('mirageSkater',185,296),G.makeEnemy('mirageSkater',218,296)];
    else if(id==='bellkeeper')G.state.enemies=[G.makeEnemy('mirageSkater',180,296),G.makeEnemy('mirageSkater',184,306)];
    else if(id==='griffin')G.state.enemies=[G.makeEnemy('sunHopper',168,296),G.makeEnemy('sunHopper',170,306)];
    else {const e=G.makeEnemy('cairnWalker',182,296);e.ward.hp=0;G.state.enemies=[e];}
   },promise.formId);
   if(['golem','lanternWisp'].includes(promise.formId)){await art('b');await frames(35);}
   else if(['weaver','bellkeeper'].includes(promise.formId)){await art('a');await art('b');await frames(12);}
   else if(promise.formId==='griffin'){
    if(mode==='controller'){await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[1,0,0,0],b:[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]})));await frames(1);await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));await frames(6);}
    else {await page.keyboard.down('ArrowRight');await art('a');await page.keyboard.up('ArrowRight');}
   }else {await art('a');await frames(12);}
   assert.equal(await page.evaluate(id=>G.state.formOutings.features.includes(id),promise.formId),true);
   assert.equal(await page.evaluate(()=>G.world.solid(21*16+8,19*16+8)),false);await shot(promise.id+'-helped');
   await page.evaluate(()=>{G.state.enemies=[];G.state.projectiles=[];});await reload();
   assert.equal(await page.evaluate(()=>G.currentTask().short),'Return to '+promise.person);
   assert.equal(await page.evaluate(()=>G.world.solid(21*16+8,19*16+8)),false);
   await page.evaluate(()=>{G.state.enemies=[];G.state.projectiles=[];});
   // Walk the grid route after reboot rather than aiming a straight line
   // through the brook/root shelf from wherever the native art landed.
   const points=await page.evaluate(()=>{
    const s=G.state,start=[Math.floor(s.player.x/16),Math.floor(s.player.y/16)],target=[5,22],queue=[start],parent=new Map([[start.join(','),null]]);
    for(let i=0;i<queue.length&&!parent.has(target.join(','));i++)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const [x,y]=queue[i],nx=x+dx,ny=y+dy,key=nx+','+ny;if(parent.has(key)||!G.world.isSafeSpawn(nx*16+8,ny*16+8))continue;parent.set(key,[x,y]);queue.push([nx,ny]);}
    const result=[];let at=target;while(at){result.unshift(at);at=parent.get(at.join(','));}return result;
   });for(const [x,y]of points)await walkTo(x*16+8,y*16+8);
   await frames(10);assert.equal(await page.evaluate(()=>G.deliveryCandidate()?.id),'trail-'+promise.formId);
   await next();await next();await frames(5);
   assert.equal(await page.evaluate(text=>window.reviewPaint.map(p=>p.text).join(' ').replace(/\s+/g,' ').includes(text.replace(/\s+/g,' ')),promise.thanks),true,'the complete thanks fits and is painted');await shot(promise.id+'-thanks');await drain();
   assert.equal(await page.evaluate(id=>G.ensureTown().requests.includes(id),'trail-'+promise.formId),true);
   await next();await next();await frames(5);
   assert.equal(await page.evaluate(text=>window.reviewPaint.map(p=>p.text).join(' ').replace(/\s+/g,' ').includes(text.replace(/\s+/g,' ')),promise.after),true,'the complete revisit fits and is painted');await shot(promise.id+'-revisit');await drain();
   await page.evaluate(()=>{G.world.load(G.state.mapId,{x:38,y:20});G.state.enemies=[];G.state.projectiles=[];});await drain();await frames(100);await shot(promise.id+'-picnic');
  }
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
