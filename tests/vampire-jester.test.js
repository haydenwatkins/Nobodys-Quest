const {test}=require('node:test'),assert=require('node:assert/strict');const runtime=require('../tools/lib/classic-runtime.cjs');
function setup(form){const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.formId=form;G.state.enemies=[];G.state.projectiles=[];const p=G.state.player;p.x=240;p.y=152;p.dir={x:1,y:0};return r;}
function foe(G,x,y=152){const e=G.makeEnemy('slime',x,y);e.hp=50;G.state.enemies.push(e);return e;}
test('a multi-target bite preserves progress beyond the five-hit heal',()=>{
 const {G}=setup('vampire'),p=G.state.player;p.bloodPips=4;p.damageTaken=2;foe(G,250,150);foe(G,252,154);G.abilities.bloodBite.use(p);
 assert.equal(p.damageTaken,1);assert.equal(p.bloodPips,1);
 G.state.enemies=[];G.abilities.bloodBite.use(p);assert.equal(p.bloodPips,1);assert.equal(p.damageTaken,1);
});
test('Blood Moon gathers a crowd and heals once without granting melee guard',()=>{
 const {G}=setup('vampire'),p=G.state.player;p.damageTaken=2;p.meleeGuard=0;const foes=[foe(G,272),foe(G,208),foe(G,240,184)];
 const before=foes.map(e=>Math.hypot(e.x-p.x,e.y-p.y));G.abilities.bloodMoon.use(p);
 assert.equal(p.damageTaken,1);assert.equal(p.meleeGuard,0);foes.forEach((e,i)=>{assert.equal(e.hp,48);assert.ok(Math.hypot(e.x-p.x,e.y-p.y)<before[i]);});
});
test('a card skips a nearer blocked ricochet target for a clear target',()=>{
 const {G}=setup('jester'),a=foe(G,264),hidden=foe(G,282),clear=foe(G,264,188);const solid=G.world.solid;
 G.world.solid=(x,y)=>x>=272&&x<=277&&y<170;
 G.abilities.wildCard.use(G.state.player);for(let i=0;i<60;i++)G.combat.updateProjectiles(.02);G.world.solid=solid;
 assert.equal(a.hp,49);assert.equal(hidden.hp,50);assert.equal(clear.hp,49);
});
