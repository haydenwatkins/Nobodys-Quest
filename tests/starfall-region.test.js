const {test}=require('node:test'),assert=require('node:assert/strict');const runtime=require('../tools/lib/classic-runtime.cjs');
function at(G,x,y){G.state.player.x=x*16+8;G.state.player.y=y*16+8;}
function setup(){const r=runtime();r.load('starfallRuins');r.drain();return r;}
test('all observatory wings, recovery pantry, instrument and exit are reachable',()=>{
 const {G}=setup(),s=G.state,queue=[[15,1]],seen=new Set(['15,1']);
 for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(nx<0||ny<0||nx>=s.mapW||ny>=s.mapH||seen.has(k)||G.world.solid(nx*16+8,ny*16+8))continue;seen.add(k);queue.push([nx,ny]);}}
 for(const p of ['15,0','5,5','24,5','24,14','15,15','5,14'])assert.ok(seen.has(p),p);
 assert.ok(!s.chests.some(c=>c.item==='starfall-thread'));
});
test('lenses persist in any order and the instrument awards the thread once',()=>{
 const r=setup(),{G}=r;G.state.enemies=[];const before=G.state.town.spirit;at(G,15,15);G.tryOpeningInteraction();assert.equal(G.starfallSurvey().thread,false);
 for(const [x,y]of [[24,14],[5,5],[24,5]]){at(G,x,y);G.tryOpeningInteraction();}
 assert.equal(G.starfallSurvey().aligned,3);r.load('starfallRuins');r.drain();assert.equal(G.starfallSurvey().aligned,3);G.state.enemies=[];
 at(G,15,15);let picked=0;G.events.on('pickup',e=>{if(e.item==='starfall-thread')picked++;});G.state.player.damageTaken=2;G.state.player.mana=0;G.tryOpeningInteraction();
 assert.equal(G.starfallSurvey().thread,true);assert.equal(G.state.town.spirit,before+8);assert.equal(G.state.player.damageTaken,0);assert.equal(G.state.player.mana,G.playerMaxMana());assert.equal(picked,1);
 G.tryOpeningInteraction();assert.equal(G.state.town.spirit,before+8);assert.equal(picked,1);
});
test('legacy thread owners keep their reward and nearby enemies prevent lens interaction',()=>{
 const {G}=setup();G.state.items.push('starfall-thread');G.state.enemies=[];at(G,15,15);assert.notEqual(G.openingInteractionCandidate()?.kind,'starfall');
 at(G,5,5);G.state.enemies.push(G.makeEnemy('slime',G.state.player.x,G.state.player.y));assert.notEqual(G.openingInteractionCandidate()?.kind,'starfall');
 G.state.enemies=[];G.tryOpeningInteraction();assert.equal(G.starfallSurvey().aligned,1);assert.equal(G.starfallSurvey().thread,true);
 const c=new Proxy({},{get:()=>()=>{}});for(const d of G.openingDrawables(c))d.fn();
});
