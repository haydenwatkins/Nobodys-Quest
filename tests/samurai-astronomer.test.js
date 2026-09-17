const {test}=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');
function setup(form){const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.formId=form;G.state.enemies=[];G.state.projectiles=[];const p=G.state.player;p.x=240;p.y=152;p.dir={x:1,y:0};return r;}
function foe(G,x,y=152){const e=G.makeEnemy('slime',x,y);e.hp=50;G.state.enemies.push(e);return e;}
test('Quickdraw finishes a timed rhythm and a pause starts a fresh draw',()=>{
 const {G}=setup('samurai'),p=G.state.player;let hit;G.events.on('hit',e=>hit=e);
 for(let i=0;i<3;i++){G.state.time=i*.4;G.state.enemies=[];foe(G,p.x+14,p.y);G.abilities.quickdraw.use(p);assert.equal(p.drawBeat,i+1);assert.equal(hit.combo,i===2?'draw-finish':'draw');}
 G.state.time=1.6;G.abilities.quickdraw.use(p);assert.equal(p.drawBeat,1);
});
test('Crescent Draw hits behind the player and retains area mastery credit',()=>{
 const {G}=setup('samurai'),p=G.state.player;p.meleeGuard=0;
 const enemies=[foe(G,270),foe(G,210),foe(G,240,180),foe(G,240,124)];let multi;G.events.on('multiHit',e=>multi=e);
 G.abilities.crescentDraw.use(p);enemies.forEach(e=>assert.equal(e.hp,48));assert.equal(p.meleeGuard,0);assert.equal(multi.ability,'crescentDraw');assert.equal(multi.hits,4);
});
test('Gravity Well gathers and briefly holds foes without bypassing wards',()=>{
 const {G}=setup('astronomer'),p=G.state.player,a=foe(G,282),b=foe(G,198),warded=foe(G,240,192);warded.ward={types:['dark'],hp:6};
 G.abilities.gravityWell.use(p);
 for(const e of [a,b]){assert.equal(e.hp,48);assert.ok(Math.hypot(e.x-p.x,e.y-p.y)<42);assert.equal(e.status.stun.dur,.65);G.combat.updateStatuses(e,.66);assert.equal(e.status.stun,undefined);}
 assert.equal(warded.hp,50);assert.equal(warded.ward.hp,4);assert.equal(warded.status?.stun,undefined);
});
test('the fourth Star Needle pierces both targets then restarts alignment',()=>{
 const {G}=setup('astronomer'),p=G.state.player;
 for(let i=1;i<=5;i++){G.state.projectiles=[];G.state.enemies=[];const a=foe(G,p.x+24,p.y),b=foe(G,p.x+50,p.y);G.abilities.starNeedle.use(p);for(let n=0;n<25;n++)G.combat.updateProjectiles(.02);assert.equal(a.hp,49);assert.equal(b.hp,i===4?49:50);assert.equal(p.starBeat,(i-1)%4+1);}
});
