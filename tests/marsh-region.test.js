const {test}=require('node:test'),assert=require('node:assert/strict');const runtime=require('../tools/lib/classic-runtime.cjs');
function at(G,x,y){G.state.player.x=x*16+8;G.state.player.y=y*16+8;}
function setup(){const r=runtime();r.load('sunkenMarsh');r.drain();return r;}
test('arrival is outside the court and every regional landmark has a walkable approach',()=>{
 const {G}=setup(),s=G.state,e=s.enemies.find(e=>e.id==='mireQueen');assert.ok(Math.hypot(e.x-s.player.x,e.y-s.player.y)>e.def.aggro);
 const queue=[[27,9]],seen=new Set(['27,9']);for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,key=nx+','+ny;if(nx<0||ny<0||nx>=s.mapW||ny>=s.mapH||seen.has(key)||G.world.solid(nx*16+8,ny*16+8))continue;seen.add(key);queue.push([nx,ny]);}}
 for(const point of ['15,3','15,15','3,3','6,9','29,9','12,15'])assert.ok(seen.has(point),point);
});
test('sluices weaken the veil once, remain open after travel, and never restore a broken ward',()=>{
 const r=setup(),{G}=r;const e=G.state.enemies.find(e=>e.id==='mireQueen');G.state.enemies=[e];const before=G.state.town.spirit;
 at(G,15,3);G.tryOpeningInteraction();assert.equal(e.ward.hp,4);assert.equal(G.marshSurvey().sluices,1);
 G.tryOpeningInteraction();assert.equal(G.state.town.spirit,before+2);assert.equal(e.ward.hp,4);
 at(G,15,15);G.tryOpeningInteraction();assert.equal(e.ward.hp,3);assert.equal(G.marshSurvey().sluices,2);
 r.load('sunkenMarsh');r.drain();const reloaded=G.state.enemies.find(e=>e.id==='mireQueen');assert.equal(reloaded.ward.hp,3);
 reloaded.ward.hp=0;G.events.emit('mapEnter',{map:'sunkenMarsh'});assert.equal(reloaded.ward.hp,0);
});
test('wreck salvage requires Rat and is a one-time saved reward; nearby enemies prevent interactions',()=>{
 const {G}=setup();G.state.enemies=[];at(G,3,3);const before=G.state.town.spirit;
 G.tryOpeningInteraction();assert.equal(G.marshSurvey().salvage,false);G.state.formId='rat';G.tryOpeningInteraction();assert.equal(G.marshSurvey().salvage,true);assert.equal(G.state.town.spirit,before+6);
 G.tryOpeningInteraction();assert.equal(G.state.town.spirit,before+6);
 at(G,15,3);G.state.enemies=[G.makeEnemy('slime',G.state.player.x,G.state.player.y)];assert.notEqual(G.openingInteractionCandidate()?.kind,'marsh');
 const ctx=new Proxy({},{get:()=>()=>{}});for(const d of G.openingDrawables(ctx))d.fn();
});
