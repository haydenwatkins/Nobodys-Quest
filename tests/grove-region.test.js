const {test}=require('node:test'),assert=require('node:assert/strict');const runtime=require('../tools/lib/classic-runtime.cjs');
function setup(){const r=runtime();r.load('whispering-grove');r.drain();return r;}
function stump(G){G.state.player.x=88;G.state.player.y=232;}
test('the seed, shelter, pantry and exit are accessible before restoration',()=>{
 const {G}=setup(),s=G.state,queue=[[20,1]],seen=new Set(['20,1']);
 for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(nx<0||ny<0||nx>=s.mapW||ny>=s.mapH||seen.has(k)||G.world.solid(nx*16+8,ny*16+8))continue;seen.add(k);queue.push([nx,ny]);}}
 for(const p of ['20,0','25,14','5,14','4,10','14,4'])assert.ok(seen.has(p),p);
 assert.ok(G.world.solid(14*16+8,8*16+8));
});
test('planting requires the seed, preserves it, opens a saved shortcut and pays once',()=>{
 const r=setup(),{G}=r;G.state.enemies=[];stump(G);const before=G.state.town.spirit;
 G.tryOpeningInteraction();assert.equal(G.groveSurvey().planted,false);
 G.state.items.push('whispering-seed');G.state.player.damageTaken=2;G.state.player.mana=0;G.tryOpeningInteraction();
 assert.equal(G.groveSurvey().planted,true);assert.equal(G.groveSurvey().seed,true);assert.equal(G.state.town.spirit,before+6);
 assert.equal(G.state.player.damageTaken,0);assert.equal(G.state.player.mana,G.playerMaxMana());
 for(const y of [8,9])assert.equal(G.world.solid(232,y*16+8),false);
 G.tryOpeningInteraction();assert.equal(G.state.town.spirit,before+6);
 r.load('overworld');r.drain();r.load('whispering-grove');r.drain();assert.equal(G.world.solid(232,136),false);assert.equal(G.groveSurvey().planted,true);
 const c=new Proxy({},{get:()=>()=>{}});for(const d of G.openingDrawables(c))d.fn();
});
test('nearby fighting blocks planting, and restoration does not mutate the map template',()=>{
 const {G}=setup();stump(G);G.state.items.push('whispering-seed');G.state.enemies=[G.makeEnemy('slime',88,232)];assert.notEqual(G.openingInteractionCandidate()?.kind,'grove');
 G.state.enemies=[];G.tryOpeningInteraction();assert.equal(G.maps['whispering-grove'].tiles[8][14],'t');
});
