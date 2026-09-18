const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(){const r=runtime();r.load('mistwood');r.drain();return r;}
const bells=[[6,5],[23,5],[7,13]];
function visit(G,[x,y]){G.state.player.x=x*16+8;G.state.player.y=y*16+8;}
test('Mistwood entrance, bells, pantry, boss and legend sites connect before restoration',()=>{
 const {G}=setup(),s=G.state,q=[[15,17]],seen=new Set(['15,17']);for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(nx<0||ny<0||nx>=s.mapW||ny>=s.mapH||seen.has(k)||G.world.solid(nx*16+8,ny*16+8))continue;seen.add(k);q.push([nx,ny]);}}
 for(const [x,y]of [...bells,[4,7],[23,15],[14,18]])assert.ok(seen.has(x+','+y));
 for(const stages of Object.values(G.LEGEND_PATHS))for(const stage of stages.filter(s=>s.mapId==='mistwood')){const p=G.legendSitePoint(stage);assert.ok(seen.has(Math.floor(p.x/16)+','+Math.floor(p.y/16)),stage.name);}
 assert.ok(G.world.solid(232,152));assert.ok(G.world.solid(232,168));
});
test('bells persist across travel, open the shortcut and pay the recovery reward only once',()=>{
 const r=setup(),{G}=r;G.state.enemies=[];const spirit=G.ensureTown().spirit;visit(G,bells[0]);G.tryOpeningInteraction();assert.equal(G.mistwoodSurvey().bells,1);
 r.load('overworld');r.drain();r.load('mistwood');r.drain();G.state.enemies=[];assert.equal(G.mistwoodSurvey().bells,1);
 G.state.player.damageTaken=2;G.state.player.mana=0;for(const b of bells.slice(1)){visit(G,b);G.tryOpeningInteraction();r.drain();}
 assert.equal(G.mistwoodSurvey().open,true);assert.equal(G.ensureTown().spirit,spirit+6);assert.equal(G.state.player.damageTaken,0);assert.equal(G.state.player.mana,G.playerMaxMana());
 G.tryOpeningInteraction();assert.equal(G.ensureTown().spirit,spirit+6);r.load('mistwood');r.drain();assert.equal(G.world.solid(232,152),false);assert.equal(G.maps.mistwood.tiles[9][14],'t');
});
test('nearby combat blocks ringing a trail bell',()=>{
 const {G}=setup();visit(G,bells[0]);G.state.enemies=[G.makeEnemy('slime',104,88)];assert.notEqual(G.openingInteractionCandidate()?.kind,'mistwood-bell');G.state.enemies=[];assert.equal(G.openingInteractionCandidate().kind,'mistwood-bell');
});
