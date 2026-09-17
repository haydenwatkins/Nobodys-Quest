const {test}=require('node:test'),assert=require('node:assert/strict');const runtime=require('../tools/lib/classic-runtime.cjs');
function setup(form){const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.formId=form;G.state.enemies=[];G.state.projectiles=[];const p=G.state.player;p.x=240;p.y=144;p.dir={x:1,y:0};return r;}
function foe(G,x,y=144){const e=G.makeEnemy('slime',x,y);e.hp=50;G.state.enemies.push(e);return e;}
test('Hop Crash lands once with a local stun, including when stopped by terrain',()=>{
 const {G}=setup('frog'),p=G.state.player,e=foe(G,304),far=foe(G,345);
 G.abilities.hopCrash.use(p);for(let i=0;i<12;i++)G.updatePlayer(.02);
 assert.equal(p.dashing,null);assert.equal(e.hp,49);assert.ok(e.status.stun);assert.equal(far.hp,50);
 for(let i=0;i<8;i++)G.updatePlayer(.02);assert.equal(e.hp,49);
 // A blocked hop must still resolve its landing once at the actual position.
 const move=G.world.moveBox;G.world.moveBox=()=>{};const close=foe(G,p.x+18);G.abilities.hopCrash.use(p);G.updatePlayer(.02);G.world.moveBox=move;
 assert.equal(p.dashing,null);assert.equal(close.hp,49);assert.ok(close.status.stun);
});
test('Volatile Flask reacts once on the direct target and each poisoned splash target',()=>{
 const {G}=setup('alchemist'),a=foe(G,264),b=foe(G,274,160),far=foe(G,350);
 for(const e of [a,b,far])G.combat.applyStatus(e,'poison',{dur:4,dps:1});
 G.abilities.volatileFlask.use(G.state.player);for(let i=0;i<15;i++)G.combat.updateProjectiles(.02);
 assert.equal(a.hp,47);assert.equal(b.hp,47);assert.equal(far.hp,50);assert.equal(a.status.poison,undefined);assert.equal(b.status.poison,undefined);assert.ok(far.status.poison);
});
test('flask reactions do not spend poison through wards or invent bonuses on clean targets',()=>{
 const {G}=setup('alchemist'),a=foe(G,264),b=foe(G,274,160);a.ward={types:['blunt'],hp:5};G.combat.applyStatus(a,'poison',{dur:4});
 G.abilities.volatileFlask.use(G.state.player);for(let i=0;i<15;i++)G.combat.updateProjectiles(.02);
 assert.equal(a.hp,50);assert.equal(a.ward.hp,3);assert.ok(a.status.poison);assert.equal(b.hp,48);
});
