const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
const pads={camp:{x:11,y:20},high:{x:33,y:8}};
function at(G,pad){Object.assign(G.state.player,{x:pad.x*16+8,y:pad.y*16+8});}
function setup(mark=false){const r=runtime();if(!r.G.windscarLiftSurvey)r.run('js/engine/windscar.js');if(mark)r.G.ensureWorldwake().marks.push('sky');r.load('windscarCanyon');r.drain();return r;}
function snapshot(G){const p=G.state.player;return {form:G.state.formId,damage:p.damageTaken,mana:p.mana,cooldowns:{...p.cooldowns},items:[...G.state.items],worldwake:JSON.stringify(G.state.worldwake)};}
test('the sleeping lift explains Aurelia holds the wind without moving Nobody',()=>{
 const r=setup(),{G}=r;G.state.enemies=[];at(G,pads.camp);const before={x:G.state.player.x,y:G.state.player.y};
 assert.match(G.openingInteractionCandidate().label,/sleeping wind lift/i);assert.equal(G.tryOpeningInteraction(),true);assert.deepEqual({x:G.state.player.x,y:G.state.player.y},before);
 assert.match(r.messages[0].text,/Aurelia holds every climbing wind/i);assert.equal(G.windscarLiftSurvey().unlocked,false);assert.equal(G.windscarLiftSurvey().lastRide,null);
});
test('the Sky Mark opens safe two-way rides and preserves combat and quest state',()=>{
 const {G}=setup(true);G.state.enemies=[];G.state.formId='ranger';const p=G.state.player;Object.assign(p,{damageTaken:2,mana:3,cooldowns:{quickshot:1.75,volley:4.5}});G.state.items.push('windscar-feather');
 at(G,pads.camp);const before=snapshot(G);assert.match(G.openingInteractionCandidate().label,/up.*Sovereign's Reach/i);assert.equal(G.tryOpeningInteraction(),true);
 assert.deepEqual({x:p.x,y:p.y},{x:pads.high.x*16+8,y:pads.high.y*16+8});assert.deepEqual(snapshot(G),before);assert.equal(p.lastSafe.x,p.x);assert.equal(p.lastSafe.y,p.y);assert.ok(G.world.isSafeSpawn(p.x,p.y));
 const ride=G.windscarLiftSurvey().lastRide;assert.equal(ride.from,'Caravan Rise');assert.equal(ride.to,"Sovereign's Reach");assert.equal(ride.success,true);assert.equal(ride.x,33);assert.equal(ride.y,8);
 assert.match(G.openingInteractionCandidate().label,/down.*Caravan Rise/i);assert.equal(G.tryOpeningInteraction(),true);assert.deepEqual({x:p.x,y:p.y},{x:pads.camp.x*16+8,y:pads.camp.y*16+8});assert.deepEqual(snapshot(G),before);
});
test('danger at either landing and active state prevent a ride',()=>{
 const {G}=setup(true);G.state.enemies=[];at(G,pads.camp);const p=G.state.player,start={x:p.x,y:p.y},before=snapshot(G);
 const notices=[];G.ui.toast=text=>notices.push(text);
 G.state.enemies=[G.makeEnemy('slime',pads.high.x*16+8,pads.high.y*16+8)];assert.match(G.openingInteractionCandidate().label,/Sovereign's Reach is unsafe/i);assert.equal(G.tryOpeningInteraction(),true);assert.deepEqual({x:p.x,y:p.y},start);assert.deepEqual(snapshot(G),before);assert.match(notices.pop(),/clear landing/i);
 G.state.enemies=[G.makeEnemy('slime',p.x+20,p.y)];assert.notEqual(G.openingInteractionCandidate()?.kind,'windscar-lift');assert.equal(G.tryOpeningInteraction(),false);assert.deepEqual({x:p.x,y:p.y},start);
 G.state.enemies=[];for(const flag of ['knockout','bossCutscene','expeditionRun']){G.state[flag]={};assert.notEqual(G.openingInteractionCandidate()?.kind,'windscar-lift');G.state[flag]=null;}
 p.dashing={left:10,speed:100};assert.notEqual(G.openingInteractionCandidate()?.kind,'windscar-lift');p.dashing=null;G.ui.menuOpen=true;assert.notEqual(G.openingInteractionCandidate()?.kind,'windscar-lift');
});
test('hostile shots and live hazards protect both pads without friendly or cleared effects locking them',()=>{
 const {G}=setup(true),p=G.state.player;G.state.enemies=[];at(G,pads.camp);const camp={x:p.x,y:p.y},high={x:pads.high.x*16+8,y:pads.high.y*16+8};
 const hostile=(x,y,extra={})=>({x,y:y-5,fromPlayer:false,...extra});
 G.state.projectiles=[hostile(high.x,high.y)];assert.match(G.openingInteractionCandidate().label,/unsafe/i);G.state.projectiles=[hostile(camp.x,camp.y)];assert.notEqual(G.openingInteractionCandidate()?.kind,'windscar-lift');
 G.state.projectiles=[hostile(high.x,high.y,{fromPlayer:true}),hostile(high.x,high.y,{dispelled:true})];assert.match(G.openingInteractionCandidate().label,/Ride the wind lift/i);
 const owner={dead:false,x:high.x,y:high.y,def:{}};
 G.state.openingHazards=[{kind:'roots',owner,x:high.x,y:high.y,radius:17,t:0,warn:1,active:.5,hit:false}];assert.match(G.openingInteractionCandidate().label,/unsafe/i);
 G.state.openingHazards[0].hit=true;assert.match(G.openingInteractionCandidate().label,/Ride the wind lift/i);
 G.state.openingHazards=[];G.state.bossHazards=[{kind:'gust',owner,mapId:'windscarCanyon',t:0,warning:.9,active:.35,hit:true}];assert.notEqual(G.openingInteractionCandidate()?.kind,'windscar-lift');
 G.state.bossHazards[0].t=2;assert.match(G.openingInteractionCandidate().label,/Ride the wind lift/i);G.state.bossHazards[0].t=0;
 G.state.bossHazards[0].owner.dead=true;assert.match(G.openingInteractionCandidate().label,/Ride the wind lift/i);
 at(G,pads.high);G.state.bossHazards=[];G.state.openingHazards=[{kind:'roots',owner:{dead:false,def:{}},x:camp.x,y:camp.y,radius:17,t:0,warn:1,active:.5,hit:false}];assert.match(G.openingInteractionCandidate().label,/Caravan Rise is unsafe/i);
});
test('old trophy saves unlock the lift on revisit and ordinary canyon roads remain accessible',()=>{
 const r=setup(),{G}=r;G.state.worldwake=G.normalizeWorldwake(undefined,{items:['trophy-sky-sovereign'],mapId:'windscarCanyon'});r.load('overworld');r.drain();r.load('windscarCanyon');r.drain();
 assert.equal(G.windscarLiftSurvey().unlocked,true);const ends=G.windscarLiftSurvey().endpoints;assert.equal(ends[0].name,'Caravan Rise');assert.equal(ends[0].x,11);assert.equal(ends[0].y,20);assert.equal(ends[1].name,"Sovereign's Reach");assert.equal(ends[1].x,33);assert.equal(ends[1].y,8);
 const s=G.state,q=[[2,14]],seen=new Set(['2,14']);for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,key=nx+','+ny;if(nx<0||ny<0||nx>=s.mapW||ny>=s.mapH||seen.has(key)||G.world.solid(nx*16+8,ny*16+8))continue;seen.add(key);q.push([nx,ny]);}}
 for(const [x,y]of [[0,14],[45,14],[7,20],[35,8],...Object.values(pads).map(p=>[p.x,p.y])])assert.ok(seen.has(x+','+y),x+','+y);
 const c=new Proxy({},{get:()=>()=>{}});assert.doesNotThrow(()=>G.openingDrawables(c).forEach(d=>d.fn()));
});
