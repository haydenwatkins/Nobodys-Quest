#!/usr/bin/env node
'use strict';
// One saved late-campaign checkpoint, consecutive discoveries and original AI.
// Guardian victories/earlier mastery are checkpoint inputs, not tested here.
// No per-road resets, enemy replacements, health/mana grants or free lessons.
const assert=require('node:assert/strict'),runtime=require('./lib/classic-runtime.cjs');
let seed=Number(process.argv[2]||817);Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const r=runtime(),{G}=r,s=G.state,p=s.player;
Object.assign(s.opening,{started:true,complete:true,bell:true,version:2});s.delivery.complete=true;
s.claimedForms=['rat','knight','wizard','ranger','frog'];s.stars=40;
G.questsDone=s.claimedForms.flatMap(id=>G.forms[id].quests.slice(0,2).map(q=>q.id));
s.items=['trophy-heartwood-crown','trophy-mire-pearl','wayfinder-whistle',...Object.keys(G.WORLDWAKE_MARKS)];
s.worldwake=G.normalizeWorldwake({discovered:G.WORLDWAKE_REGIONS.map(t=>t.id)},s);
s.wayfinder=G.normalizeWayfinder({discovered:['overworld'],posts:G.WORLDWAKE_REGIONS.map(t=>t.id),introSeen:true},s);
G.ensureTown().requests=['recipes','beacon'];G.input.takeAim=()=>({...G.input.aim,dragged:true});
let knockouts=0,kills=0;G.events.on('kill',()=>kills++);G.events.on('ko',event=>{
 knockouts++;assert.equal(p.damageTaken,0,'the native gentle landing restores health');
 assert.deepEqual([p.x,p.y],[s.entryPoint.x,s.entryPoint.y],'recovery uses the real road entrance');
 console.log('GENTLE LANDING',JSON.stringify({map:s.mapId,form:s.formId,event}));
});
let deliberateCross=false;
function step(){const before=knockouts,from=s.mapId,at=[p.x,p.y],movement={...G.input.vec};r.step(.025);r.drain();
 if(from!==s.mapId&&!deliberateCross)console.log('UNPLANNED TRAVEL',JSON.stringify({from,to:s.mapId,at,movement}));
 assert.ok(knockouts<=3,'the bounded scripted session does not enter a retry loop');return before===knockouts;}
function face(e){const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy)||1;p.dir=G.input.aim={x:dx/d,y:dy/d};return d;}
function fight(){
 const form=G.playerForm(),living=s.enemies.filter(e=>!e.dead&&!e.def.practice);
 living.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));const e=living[0];if(!e)return;
 const loadout=G.getLoadout(form.id),firstDone=G.questsDone.includes(form.quests[0].id);
 let slot=firstDone&&loadout[1]?1:0;
 if(e.ward?.hp>0){
  slot=loadout.findIndex(id=>id&&e.ward.types.includes(G.abilities[id].type));
  if(slot<0){const borrowed=G.availableAbilities().find(id=>e.ward.types.includes(G.abilities[id].type));assert.ok(borrowed,'an earned mixed art answers a previous road');loadout[2]=borrowed;slot=2;}
 }
 assert.ok(slot>=0,'native body can answer the encountered ward');
 const art=G.abilities[loadout[slot]],d=face(e),reach=['melee','area'].includes(art.style)?23:art.style==='dash'?35:60;
 // Approach, then retain room between casts. Actual feet collision handles
 // terrain; scripted aim uses the same buffered path as touch/right stick.
 const moving=d>reach?1:d<18?-1:0;G.input.vec={x:p.dir.x*moving,y:p.dir.y*moving};
 const cover=['golem','lanternWisp'].includes(form.id)&&e.def.behavior==='shooter'&&d<100&&loadout[1]&&!p.cooldowns[loadout[1]]&&p.mana>=G.abilities[loadout[1]].mana;
 if(cover)r.taps.add('b');
 else if(d<reach+9&&(!p.cooldowns[art.id])&&p.mana>=art.mana)r.taps.add(['a','b','c'][slot]);
}
function walkTo(x,y,defend=true){
 const start=[Math.floor(p.x/16),Math.floor(p.y/16)],queue=[start],parent=new Map([[start.join(','),null]]);
 for(let i=0;i<queue.length&&!parent.has(x+','+y);i++)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
  const [px,py]=queue[i],nx=px+dx,ny=py+dy,key=nx+','+ny;
  if(parent.has(key)||![[0,0],[-3,0],[3,0],[0,-3],[0,3]].every(([ox,oy])=>G.world.isSafeSpawn(nx*16+8+ox,ny*16+8+oy)))continue;
  parent.set(key,[px,py]);queue.push([nx,ny]);
 }
 assert.ok(parent.has(x+','+y),'walked route exists: '+JSON.stringify({map:s.mapId,start,target:[x,y],player:[p.x,p.y]}));const path=[];let at=[x,y];while(at){path.unshift(at);at=parent.get(at.join(','));}
 for(const [tx,ty]of path){let n=0;while(Math.hypot(tx*16+8-p.x,ty*16+8-p.y)>2&&n++<400){
  if(defend)fight();const dx=tx*16+8-p.x,dy=ty*16+8-p.y,d=Math.hypot(dx,dy)||1;G.input.vec={x:dx/d,y:dy/d};if(!step())return walkTo(x,y,defend);
 }assert.ok(n<400,'native walking reaches its waypoint');}
 G.input.vec={x:0,y:0};
}
function reachableTiles(){
 const queue=[[Math.floor(p.x/16),Math.floor(p.y/16)]],seen=new Set([queue[0].join(',')]);
 for(let i=0;i<queue.length;i++)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
  const [x,y]=queue[i],nx=x+dx,ny=y+dy,key=nx+','+ny;
  if(seen.has(key)||![[0,0],[-3,0],[3,0],[0,-3],[0,3]].every(([ox,oy])=>G.world.isSafeSpawn(nx*16+8+ox,ny*16+8+oy)))continue;
  seen.add(key);queue.push([nx,ny]);
 }return queue;
}
function cross(to,dy){const from=s.mapId;deliberateCross=true;G.input.vec={x:0,y:0};step();G.input.vec={x:0,y:dy};for(let i=0;i<200&&s.mapId===from;i++)step();G.input.vec={x:0,y:0};step();deliberateCross=false;assert.equal(s.mapId,to);}
r.load('windscarCanyon');r.drain();
for(const trail of G.FORM_TRAILS){
 // Only the initial checkpoint needs a seed. Subsequent encounters leave
 // the next echo naturally; the previous outing cannot be overwritten.
 if(!G.formUnlocked(trail.formId)){
 if(!G.formEchoFor(trail.formId)){
  if(trail===G.FORM_TRAILS[0])assert.ok(G.leaveReadyFormEchoAt(p.x+40,p.y,'legacy'));
  else for(let i=0;i<4800&&!G.formEchoFor(trail.formId);i++){fight();step();}
 }
 const echo=G.formEchoFor(trail.formId);assert.ok(echo,'guardian calling has discovery priority');
 if(echo.mapId!==s.mapId){const source=G.FORM_TRAILS.find(t=>t.id===echo.mapId);assert.equal(source.region,s.mapId);walkTo(7,1);cross(source.id,-1);}
 if(echo.needsLeave){
  const away=reachableTiles().find(([x,y])=>Math.hypot(x*16+8-echo.x,y*16+8-echo.y)>=35);
  assert.ok(away,'the echo has a walkable place to step away');walkTo(...away);
 }
 const meet=reachableTiles().filter(([x,y])=>Math.hypot(x*16+8-echo.x,y*16+8-echo.y)<=18)
  .sort((a,b)=>Math.hypot(a[0]*16+8-p.x,a[1]*16+8-p.y)-Math.hypot(b[0]*16+8-p.x,b[1]*16+8-p.y))[0];
 assert.ok(meet,'a feet-safe meeting point is within the native echo radius');walkTo(...meet,false);for(let i=0;i<40&&!G.formUnlocked(trail.formId);i++)step();
 }
 assert.ok(G.formUnlocked(trail.formId));assert.equal(G.activeFormOuting().formId,trail.formId);
 const source=G.FORM_TRAILS.find(t=>t.id===s.mapId);if(source){walkTo(4,23);cross(source.region,1);}
 if(s.mapId!==trail.region){assert.ok(G.travelToWorldwakeRegion(trail.region),'use an earned Wayfinder route');r.drain();}
 G.restoreDefaultLoadout(trail.formId);
 walkTo(7,1);cross(trail.id,-1);walkTo(6,20);
 const began=s.time,health=G.playerMaxHearts()-p.damageTaken,initialKills=kills;
 for(let i=0;i<480;i++)step();assert.equal(G.playerMaxHearts()-p.damageTaken,health,'arrival has room for a twelve-second pause');
 G.tryOpeningInteraction();const offer=r.messages.find(m=>m.options?.offer)?.options.offer;r.drain();
 if(offer)offer.onAccept();else assert.ok(G.ensureTown().requests.includes('trail-'+trail.formId),'prior genuine help is recognized on arrival');
 // First clearing, upper clearing, then far-bank variation. Live fights
 // retain every real spawn and rely on native recovery and earned moves.
 for(const [x,y]of [[10,18],[10,8],[30,7],[34,18]]){
  walkTo(x,y);for(let i=0;i<2400&&G.activeFormOuting();i++){fight();step();if(!s.enemies.some(e=>!e.dead&&Math.hypot(e.x-p.x,e.y-p.y)<120))break;}
  if(!G.activeFormOuting())break;
 }
 assert.equal(G.activeFormOuting(),null,'outing completes in one visit: '+JSON.stringify({form:trail.formId,level:G.formLevel(trail.formId),counts:G.questCounts,living:s.enemies.filter(e=>!e.dead).map(e=>[e.id,e.hp,e.x,e.y])}));
 console.log(JSON.stringify({form:trail.formId,seconds:Math.round(s.time-began),level:G.formLevel(trail.formId),feature:s.formOutings.features.includes(trail.formId),defeated:kills-initialKills,health:G.playerMaxHearts()-p.damageTaken,knockouts}));
 if(p.x<20*16)walkTo(6,20);
 walkTo(38,19);r.taps.add('interact');step();walkTo(6,20);walkTo(5,22);
 for(let i=0;i<2400&&!G.deliveryCandidate();i++){fight();G.input.vec={x:0,y:0};step();}
 assert.equal(G.deliveryCandidate()?.id,'trail-'+trail.formId);G.tryOpeningInteraction();r.drain();assert.ok(G.ensureTown().requests.includes('trail-'+trail.formId));
 walkTo(4,23);cross(trail.region,1);
 G.saveGame();assert.equal(G.loadSaveData().claimedForms.includes(trail.formId),true);
}
console.log(JSON.stringify({sessionSeconds:Math.round(s.time),discoveries:G.FORM_TRAILS.filter(t=>G.formUnlocked(t.formId)).length,returnedPromises:G.FORM_TRAILS.filter(t=>G.ensureTown().requests.includes('trail-'+t.formId)).length,knockouts,respawns:0,ai:'original',checkpoint:'all six Marks already earned; bodies unclaimed'}));
console.log('PASS consecutive live Worldwake outings; guardian fights and fresh-campaign pacing remain separate.');
