const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(){const r=runtime();r.load('sunstepPrairie');r.drain();r.G.state.enemies=[];return r;}
const points=[[12,8],[31,8],[34,20],[11,20]];
function go(G,[x,y]){Object.assign(G.state.player,{x:x*16+8,y:y*16+8});}
function start(G){go(G,points[3]);assert.equal(G.tryOpeningInteraction(),true);}
test('courier checkpoints connect to camp and the ordinary region exits',()=>{
 const {G}=setup(),s=G.state,q=[[11,20]],seen=new Set(['11,20']),dist=new Map([['11,20',0]]);
 for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=nx+','+ny;if(nx<0||ny<0||nx>=s.mapW||ny>=s.mapH||seen.has(k)||G.world.solid(nx*16+8,ny*16+8))continue;seen.add(k);dist.set(k,dist.get(x+','+y)+1);q.push([nx,ny]);}}
 for(const [x,y]of [...points,[0,14],[45,14],[7,20]])assert.ok(seen.has(x+','+y));for(const [x,y]of points)assert.ok(G.world.isSafeSpawn(x*16+8,y*16+8));
});
test('courier progress respects order, rewards once and retains only the best time',()=>{
 const {G}=setup();start(G);go(G,points[2]);G.updateOpening(1);assert.equal(G.prairieSurvey().active.step,0);const spirit=G.ensureTown().spirit;
 for(const p of points){go(G,p);G.updateOpening(2);}assert.equal(G.prairieSurvey().active,null);assert.equal(G.prairieSurvey().best,9);assert.equal(G.ensureTown().spirit,spirit+6);
 start(G);for(const p of points){go(G,p);G.updateOpening(3);}assert.equal(G.prairieSurvey().best,9);assert.equal(G.ensureTown().spirit,spirit+6);
 start(G);for(const p of points){go(G,p);G.updateOpening(1);}assert.equal(G.prairieSurvey().best,4);assert.equal(G.normalizeTown(G.state.town).prairieBest,4);
});
test('menus pause the clock, timeout resets safely, and travel or knockout cancels a run',()=>{
 const r=setup(),{G}=r;start(G);G.ui.menuOpen=true;G.updateOpening(50);assert.equal(G.prairieSurvey().active.time,45);G.ui.menuOpen=false;G.updateOpening(46);assert.equal(G.prairieSurvey().active,null);assert.equal(G.prairieSurvey().done,false);
 start(G);r.load('windscarCanyon');r.drain();assert.equal(G.prairieSurvey().active,null);r.load('sunstepPrairie');r.drain();G.state.enemies=[];start(G);G.state.knockout={};G.updateOpening(.02);assert.equal(G.prairieSurvey().active,null);
});
test('old or invalid save records normalize without changing valid courier times',()=>{
 const {G}=setup();for(const value of [undefined,NaN,Infinity,-1,0,46,'12'])assert.equal(G.normalizeTown({prairieBest:value}).prairieBest,null);assert.equal(G.normalizeTown({prairieBest:23.42}).prairieBest,23.42);
});

test('courier invitation waits for safety, appears once, and never starts the timer',()=>{
 const r=setup(),{G}=r,notices=[];G.ui.toast=(text)=>notices.push(text);go(G,[11,14]);G.state.enemies=[G.makeEnemy('slime',184,232)];G.updateOpening(.02);assert.equal(G.ensureTown().prairieInvited,false);
 G.state.enemies=[];G.ui.menuOpen=true;G.updateOpening(.02);assert.equal(G.ensureTown().prairieInvited,false);G.ui.menuOpen=false;G.updateOpening(.02);
 assert.equal(G.ensureTown().prairieInvited,true);assert.equal(G.prairieSurvey().active,null);assert.equal(notices.filter(s=>s.includes('COURIER WANTED')).length,1);
 G.state.town=G.normalizeTown(JSON.parse(JSON.stringify(G.state.town)));r.load('sunstepPrairie');r.drain();G.state.enemies=[];go(G,[11,14]);G.updateOpening(.02);assert.equal(notices.filter(s=>s.includes('COURIER WANTED')).length,1);
});
