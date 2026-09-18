const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(form){const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.formId=form;G.state.enemies=[];G.state.projectiles=[];Object.assign(G.state.player,{x:240,y:144,dir:{x:1,y:0}});return r;}
function foe(G,x,y=144){const e=G.makeEnemy('slime',x,y);e.hp=50;G.state.enemies.push(e);return e;}
test('Earth Shoulder counts distinct path and landing targets once per cast',()=>{
 const {G}=setup('colossus'),p=G.state.player,a=foe(G,256),b=foe(G,278),c=foe(G,303,166),events=[];G.events.on('multiHit',e=>events.push(e));
 G.abilities.earthShoulder.use(p);for(let i=0;i<15;i++)G.updatePlayer(.02);
 assert.equal(p.dashing,null);assert.ok(a.hp<50);assert.ok(b.hp<50);assert.ok(c.hp<50);assert.equal(events.length,1);assert.equal(events[0].hits,3);assert.equal(events[0].ability,'earthShoulder');
});
test('a fast dash hits crossed enemies between endpoints but cannot cross a wall',()=>{
 const {G}=setup('riftblade'),p=G.state.player,a=foe(G,255),b=foe(G,271);G.abilities.riftRush.use(p);G.updatePlayer(.1);assert.equal(a.hp,48);assert.equal(b.hp,48);
 G.state.enemies=[];p.dashing=null;const behind=foe(G,p.x+25);G.world.moveBox=()=>{};G.abilities.riftRush.use(p);G.updatePlayer(.1);assert.equal(behind.hp,50);assert.equal(p.dashing,null);
});
test('ward-rejected dash contacts do not count as successful multi-hits',()=>{
 const {G}=setup('riftblade'),a=foe(G,255),b=foe(G,271);a.ward={types:['light'],hp:5};b.ward={types:['light'],hp:5};const events=[];G.events.on('multiHit',e=>events.push(e));
 G.abilities.riftRush.use(G.state.player);for(let i=0;i<20;i++)G.updatePlayer(.02);assert.equal(a.hp,50);assert.equal(b.hp,50);assert.equal(events.length,0);
});
test('Rift Cut rhythm expires and Worldweight preserves position without erasing damage',()=>{
 const {G}=setup('riftblade'),p=G.state.player;G.state.time=1;G.abilities.riftCut.use(p);G.state.time=1.4;G.abilities.riftCut.use(p);assert.equal(p.riftCutCombo,2);G.state.time=2.2;G.abilities.riftCut.use(p);assert.equal(p.riftCutCombo,1);
 G.state.formId='colossus';p.invuln=0;p.meleeGuard=0;const x=p.x,y=p.y;G.damagePlayer(1,p.x-20,p.y);assert.equal(p.damageTaken,1);assert.equal(p.x,x);assert.equal(p.y,y);
});
