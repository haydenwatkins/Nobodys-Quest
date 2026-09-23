const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(){const r=runtime();r.load('glasswaterDesert');r.drain();return r;}
function dial(G){Object.assign(G.state.player,{x:376,y:104});}
test('Rootdeep marks Glasswater as an optional reachable road while the Titan gate stays sealed',()=>{
 const r=runtime(),{G}=r;r.load('rootdeepHollow');r.drain();G.state.enemies=[];
 const sign=G.state.grid[14][43];
 assert.match(sign.message,/Glasswater Desert/i);
 assert.match(sign.message,/detour/i);
 assert.equal(G.world.solid(43*16+8,14*16+8),false);
 let spoken='';G.ui.dialogue=(_title,message)=>{spoken=message;};
 Object.assign(G.state.player,{x:43*16+8,y:14*16+8});G.world.checkTriggers(.5);r.drain();
 assert.match(spoken,/Lantern Mark/);
 G.input.vec={x:0,y:0};G.world.checkTriggers(.5);r.drain();
 G.input.vec={x:1,y:0};
 for(let i=0;i<50&&G.state.mapId==='rootdeepHollow';i++){
  G.world.moveBox(G.state.player,1.5,0);G.world.checkTriggers(.02);r.drain();
 }
 assert.equal(G.state.mapId,'glasswaterDesert');
 assert.ok(G.world.isSafeSpawn(G.state.player.x,G.state.player.y));
 assert.match(G.world.portalBlockReason(G.state.grid[28][23]).text,/Lantern Mark/);
});
test('Glasswater loop connects the prism, sundial, camp, exits and legend sites before alignment',()=>{
 const {G}=setup(),s=G.state,q=[[2,14]],seen=new Set(['2,14']);
 for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(nx<0||ny<0||nx>=s.mapW||ny>=s.mapH||seen.has(k)||G.world.solid(nx*16+8,ny*16+8))continue;seen.add(k);q.push([nx,ny]);}}
 for(const [x,y]of [[0,14],[23,27],[23,6],[37,9],[7,20]])assert.ok(seen.has(x+','+y),x+','+y);
 for(const stages of Object.values(G.LEGEND_PATHS))for(const stage of stages.filter(s=>s.mapId==='glasswaterDesert')){const p=G.legendSitePoint(stage);assert.ok(seen.has(Math.floor(p.x/16)+','+Math.floor(p.y/16)),stage.name);}
 assert.equal(s.grid[9][37].chest.item,'glasswater-prism');assert.ok(G.world.solid(376,312));
});
test('alignment requires and preserves the prism, opens a saved shortcut, pays once, and retains the gate requirement',()=>{
 const r=setup(),{G}=r;G.state.enemies=[];dial(G);const before=G.ensureTown().spirit,gate=G.state.grid[28][23],reason=G.world.portalBlockReason(gate);assert.ok(reason);assert.equal(gate.mark,'light');
 G.tryOpeningInteraction();r.drain();assert.equal(G.glasswaterSurvey().aligned,false);G.state.items.push('glasswater-prism');G.tryOpeningInteraction();r.drain();
 assert.equal(G.glasswaterSurvey().aligned,true);assert.equal(G.glasswaterSurvey().prism,true);assert.equal(G.ensureTown().spirit,before+6);assert.equal(G.world.solid(376,312),false);assert.deepEqual(G.world.portalBlockReason(gate),reason);
 G.tryOpeningInteraction();assert.equal(G.ensureTown().spirit,before+6);r.load('overworld');r.drain();r.load('glasswaterDesert');r.drain();assert.equal(G.world.solid(376,328),false);assert.equal(G.maps.glasswaterDesert.tiles[19][23],'r');assert.equal(G.state.grid[28][23].mark,'light');
});
test('combat prevents using the sundial',()=>{
 const {G}=setup();dial(G);G.state.items.push('glasswater-prism');G.state.enemies=[G.makeEnemy('slime',376,104)];assert.notEqual(G.openingInteractionCandidate()?.kind,'glasswater-dial');G.state.enemies=[];assert.equal(G.openingInteractionCandidate().kind,'glasswater-dial');
});
