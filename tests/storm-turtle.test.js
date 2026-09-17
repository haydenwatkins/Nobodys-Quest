const {test}=require('node:test'),assert=require('node:assert/strict');const runtime=require('../tools/lib/classic-runtime.cjs');
function setup(){const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.enemies=[];const p=G.state.player;p.x=200;p.y=152;p.dir={x:1,y:0};p.invuln=0;return r;}
function foe(G,x,y=152){const e=G.makeEnemy('slime',x,y);e.hp=50;G.state.enemies.push(e);return e;}
test('stunned chain anchors reach farther without hitting an enemy twice',()=>{
 const {G}=setup(),a=foe(G,220),b=foe(G,285);G.abilities.chainLightning.use(G.state.player);assert.equal(a.hp,49);assert.equal(b.hp,50);
 G.combat.applyStatus(a,'stun',{dur:1});G.abilities.chainLightning.use(G.state.player);assert.equal(a.hp,48);assert.equal(b.hp,49);
});
test('solid cover blocks initial lightning targets and later links',()=>{
 const {G}=setup(),a=foe(G,220),b=foe(G,250);const solid=G.world.solid;
 G.world.solid=(x,y)=>x>230&&x<240;G.abilities.chainLightning.use(G.state.player);assert.equal(a.hp,49);assert.equal(b.hp,50);
 G.world.solid=(x,y)=>x>205&&x<215;G.abilities.chainLightning.use(G.state.player);assert.equal(a.hp,49);assert.equal(b.hp,50);G.world.solid=solid;
});
test('Shell Counter blocks one hit and responds once, even when another hit arrives immediately',()=>{
 const {G}=setup(),p=G.state.player,e=foe(G,220);G.abilities.shellCounter.use(p);assert.equal(e.hp,48);
 G.damagePlayer(2,p.x+10,p.y);assert.equal(p.damageTaken,0);assert.equal(p.shellCounterT,0);assert.equal(e.hp,46);
 G.damagePlayer(2,p.x+10,p.y);assert.equal(e.hp,46);p.invuln=0;p.meleeGuard=0;G.damagePlayer(2,p.x+10,p.y);assert.equal(p.damageTaken,2);
});
test('unused counters expire and cannot carry across zone travel',()=>{
 const r=setup(),{G}=r,p=G.state.player;G.abilities.shellCounter.use(p);G.passives.update(.8);assert.equal(p.shellCounterT,0);
 p.meleeGuard=0;G.damagePlayer(1,p.x+10,p.y);assert.equal(p.damageTaken,1);
 G.abilities.shellCounter.use(p);r.load('emberRidge');r.drain();assert.equal(p.shellCounterT,0);
});
