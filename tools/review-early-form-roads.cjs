#!/usr/bin/env node
'use strict';
// Earned checkpoints isolate native controls, authored routes, offers,
// repairs and saves. Original health/wards; AI held still for this review.
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2],out:process.argv[3]||'/tmp/patchling-roads-review',name:'Patchling’s Quest and five neighbour roads',publishedHost:true,
 async run({page,mode,hd,frames,next,drain,offer,answer,walkTo,shot,reload}){
  async function pad(index){const b=Array(16).fill(0);b[index]=1;await page.evaluate(b=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b})),b);await frames(1);await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));await frames(5);}
  async function art(slot){if(mode==='controller')await pad([0,2,3][slot]);else{await page.locator(['#btn-a','#btn-b','#btn-c'][slot]).tap();await frames(6);}await frames(35);await drain();}
  async function walk(x,y){
   const points=await page.evaluate(({x,y})=>{
    const start=[Math.floor(G.state.player.x/16),Math.floor(G.state.player.y/16)],queue=[start],parents=new Map([[start.join(','),null]]);
    for(let i=0;i<queue.length&&!parents.has(x+','+y);i++){const [px,py]=queue[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=px+dx,ny=py+dy,key=nx+','+ny;if(parents.has(key)||![[0,0],[3,0],[-3,0],[0,3],[0,-3]].every(([ox,oy])=>G.world.isSafeSpawn(nx*16+8+ox,ny*16+8+oy)))continue;parents.set(key,[px,py]);queue.push([nx,ny]);}}
    if(!parents.has(x+','+y))throw Error('No physical approach');const points=[];let at=[x,y];while(at){points.unshift(at);at=parents.get(at.join(','));}return points;
   },{x,y});
   for(const [px,py]of points)await walkTo(px*16+8,py*16+8);
  }
  assert.equal(await page.title(),'Patchling’s Quest');
  await page.evaluate(()=>G.showSaveSlotScreen(true));await page.evaluate(()=>document.fonts.ready);await frames(3);
  assert.equal((await page.locator('.title-lockup').innerText()).replace(/\n+/g,'\n'),'Patchling’s\nQuest\nA little coat. A world to mend.');
  assert.equal(await page.locator('.title-lockup').evaluate(el=>el.scrollWidth>el.clientWidth),false);await shot('new-title');
  assert.equal(await page.locator('.title-lockup').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;}),true,'the complete title stays on screen after slot focus');
  if(mode==='controller')await pad(1);else await page.locator('[data-title-return]').tap();await frames(3);
  const selected=process.argv[4]?.split(',');
  const roads=(await page.evaluate(()=>G.EARLY_FORM_ROADS)).filter(r=>!selected||selected.includes(r.formId));
  for(const road of roads){
   await page.evaluate(r=>{
    Object.assign(G.state.opening,{started:true,complete:true,bell:true,version:2});G.state.delivery.complete=true;G.state.stars=14;
    G.state.items=['trophy-heartwood-crown','trophy-mire-pearl'];G.state.claimedForms=['rat','knight','wizard','ranger','frog','alchemist','stormcaller','dragon'];
    Object.assign(G.ensureTown(),{founded:true,introduced:true,requests:['recipes','beacon'],followedRequest:null});
    G.questsDone=[];G.questCounts={};G.state.loadouts={};G.state.roadworks=G.makeRoadworks();G.state.formEchoes=[];
    G.state.formOutings={active:{formId:r.formId,arts:[],scenes:[]},features:[]};G.setForm(r.formId);G.world.load(r.id);
    for(const e of G.state.enemies){e.def={...e.def,speed:0,aggro:0};e.guardPost=true;}
    G.state.player.invuln=999;G.guidanceShowStoryCard=()=>true;
   },road);await drain();await frames(10);
   assert.equal(await page.evaluate(()=>G.deliveryCandidate()?.kind),'sunriseRequest','the entrance offers a safe neighbour conversation');
   assert.equal(await page.evaluate(person=>G.resolveDialogueSpeaker(person.toUpperCase()).id,road.person),road.npc,'the actual neighbour portrait belongs to the speaker');
   await next();await frames(180);
   assert.ok(await page.evaluate(text=>window.reviewPaint.map(p=>p.text).join(' ').includes(text),road.ask),'complete emotional request is painted');await shot(road.id+'-concern');
   await offer();await shot(road.id+'-choice');await answer(true);
   assert.equal(await page.evaluate(()=>G.currentTask().requestId),'road-'+road.formId);
   for(const repair of road.repairs){
    await walk(...repair.approach);await frames(8);await shot(repair.id+'-before');
    await page.evaluate(({x,y})=>{const p=G.state.player,dx=x*16+8-p.x,dy=y*16+8-p.y,d=Math.hypot(dx,dy)||1;p.dir={x:dx/d,y:dy/d};},{x:repair.nodes?.[0]?.[0]??repair.x,y:repair.nodes?.[0]?.[1]??repair.y});
    for(let i=0;i<3&&!await page.evaluate(id=>G.roadRepairOpen(id),repair.id);i++)await art(['alchemist','stormcaller'].includes(road.formId)?1:0);
    assert.equal(await page.evaluate(id=>G.roadRepairOpen(id),repair.id),true,'native input completes '+repair.id);await frames(8);await shot(repair.id+'-after');
    const [x0,y0,x1,y1]=repair.bridge;await walk(x0,Math.round((y0+y1)/2));await walk(x1,Math.round((y0+y1)/2));await frames(100);await shot(repair.id+'-crossed');
   }
   assert.equal(await page.evaluate(()=>G.currentTask().short),'Return to '+road.person);
   await page.evaluate(()=>G.ui.openMenu());assert.match(await page.locator('.journey-hero').innerText(),new RegExp('Return to '+road.person));await shot(road.id+'-return-journal');await page.evaluate(()=>G.ui.closeMenu());
   await reload();await page.evaluate(()=>{for(const e of G.state.enemies){e.def={...e.def,speed:0,aggro:0};e.guardPost=true;}G.state.player.invuln=999;});await frames(3);
   assert.equal(await page.evaluate(()=>G.state.roadworks.opened.length),2,'both repairs survive actual save reboot');
   assert.equal(await page.evaluate(()=>G.currentTask().short),'Return to '+road.person,'the selected promise also survives reboot');
   await walk(road.at[0],road.at[1]+1);await next();await frames(180);await shot(road.id+'-good-news');await drain();
   assert.equal(await page.evaluate(id=>G.ensureTown().requests.includes(id),'road-'+road.formId),true);
   await next();await frames(180);assert.ok(await page.evaluate(text=>window.reviewPaint.map(p=>p.text).join(' ').includes(text),road.after));await shot(road.id+'-revisit');await drain();
   // Both sides are ordinary walked exits. Approach inside the road, then
   // use native movement through its border and back through the parent.
   const [dx,dy]=road.door,inside=[Math.max(1,Math.min(36,dx)),Math.max(1,Math.min(23,dy))];await walk(...inside);
   if(mode==='controller')await page.evaluate(({dx,dy})=>window.__nqTvPad(JSON.stringify({t:'s',a:[dx===37?1:0,dy===24?1:0,0,0],b:Array(16).fill(0)})),{dx,dy});else await page.keyboard.down(dx===37?'ArrowRight':'ArrowDown');
   for(let i=0;i<35&&await page.evaluate(()=>G.state.mapId)===road.id;i++)await frames(1);
   if(mode==='controller')await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));else await page.keyboard.up(dx===37?'ArrowRight':'ArrowDown');await drain();
   assert.equal(await page.evaluate(()=>G.state.mapId),road.region,'the return is a physical connected route');
  }
  assert.equal(await page.evaluate(()=>G.hdPilot),hd);assert.equal(await page.evaluate(()=>G.WORKSHOP_ERRORS?.length||0),0);
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
