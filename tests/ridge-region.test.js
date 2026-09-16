const {test}=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');
function at(G,x,y){G.state.player.x=x*16+8;G.state.player.y=y*16+8;}
function setup(){const r=runtime();r.load('emberRidge');r.drain();return r;}
test('ridge arrival, both watchfires, guard spawns and the eastern court are connected',()=>{
 const {G}=setup(),s=G.state,boss=s.enemies.find(e=>e.id==='eclipseKnight');
 assert.ok(Math.hypot(boss.x-s.player.x,boss.y-s.player.y)>boss.def.aggro);
 const queue=[[2,9]],seen=new Set(['2,9']);
 for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,key=nx+','+ny;if(nx<0||ny<0||nx>=s.mapW||ny>=s.mapH||seen.has(key)||G.world.solid(nx*16+8,ny*16+8))continue;seen.add(key);queue.push([nx,ny]);}}
 for(const point of ['0,9','10,4','8,3','12,5','14,14','12,13','16,15','18,9','24,9'])assert.ok(seen.has(point),point);
 assert.equal(s.mapDef.visualTheme,'ember');
});
test('watchfire awards recovery only after both guards die and cannot pay twice',()=>{
 const r=setup(),{G}=r;G.state.enemies=[];at(G,10,4);const spirit=G.state.town.spirit;
 assert.equal(G.openingInteractionCandidate().kind,'ridge');G.tryOpeningInteraction();
 assert.equal(G.state.enemies.length,2);G.tryOpeningInteraction();assert.equal(G.state.enemies.length,2);
 G.state.player.damageTaken=2;G.state.player.mana=0;G.state.enemies[0].dead=true;G.updateOpening(.05);
 assert.equal(G.ridgeSurvey().lit,0);assert.equal(G.ridgeSurvey().active.remaining,1);assert.equal(G.state.player.damageTaken,2);
 G.state.enemies[1].dead=true;G.updateOpening(.05);assert.equal(G.ridgeSurvey().lit,1);assert.equal(G.ridgeSurvey().active,null);
 assert.equal(G.state.player.damageTaken,0);assert.equal(G.state.player.mana,G.playerMaxMana());assert.equal(G.state.town.spirit,spirit+3);
 G.updateOpening(.05);G.tryOpeningInteraction();assert.equal(G.state.town.spirit,spirit+3);
 r.load('emberRidge');r.drain();assert.equal(G.ridgeSurvey().lit,1);G.state.enemies=[];at(G,10,4);assert.notEqual(G.openingInteractionCandidate()?.kind,'ridge');
});
test('abandoned fights reset, completed fires persist, and nearby combat blocks awakening',()=>{
 const r=setup(),{G}=r;G.state.enemies=[];at(G,14,14);G.tryOpeningInteraction();
 assert.equal(G.ridgeSurvey().active.remaining,2);r.load('overworld');r.drain();G.updateOpening(.05);assert.equal(G.ridgeSurvey().active,null);assert.equal(G.ridgeSurvey().lit,0);
 r.load('emberRidge');r.drain();G.state.enemies=[];at(G,14,14);
 G.state.enemies.push(G.makeEnemy('slime',G.state.player.x+10,G.state.player.y));assert.notEqual(G.openingInteractionCandidate()?.kind,'ridge');
 G.state.enemies=[];G.tryOpeningInteraction();for(const e of G.state.enemies)e.dead=true;G.updateOpening(.05);assert.equal(G.ridgeSurvey().lit,1);
 const ctx=new Proxy({},{get:()=>()=>{}});for(const d of G.openingDrawables(ctx))d.fn();
});
