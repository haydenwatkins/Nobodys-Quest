const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(form){const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.formId=form;G.state.enemies=[];G.state.projectiles=[];Object.assign(G.state.player,{x:240,y:144,dir:{x:1,y:0}});return r;}
function foe(G,x,y=144){const e=G.makeEnemy('slime',x,y);e.hp=50;G.state.enemies.push(e);return e;}
test('Sky Dive resolves a blocked landing once, hitting all sides without melee guard',()=>{
 const {G}=setup('griffin'),p=G.state.player;const a=foe(G,220),b=foe(G,240,168);p.meleeGuard=0;G.world.moveBox=()=>{};
 G.abilities.skyDive.use(p);G.updatePlayer(.02);assert.equal(p.dashing,null);assert.equal(a.hp,48);assert.equal(b.hp,48);assert.equal(p.meleeGuard,0);
 G.updatePlayer(.1);assert.equal(a.hp,48);assert.equal(b.hp,48);
});
test('Feather Gale is a crowd fan, not three stacked hits on a close target',()=>{
 const {G}=setup('griffin'),a=foe(G,260);G.abilities.featherGale.use(G.state.player);for(let n=0;n<40;n++)G.combat.updateProjectiles(.02);assert.equal(a.hp,49);
});
test('Stone Knuckle saves its heavy strike for every third punch',()=>{
 const {G}=setup('golem'),p=G.state.player;
 for(let i=1;i<=4;i++){G.state.enemies=[];const e=foe(G,p.x+14,p.y);let hit;G.events.on('hit',v=>hit=v);G.abilities.stoneKnuckle.use(p);assert.equal(e.hp,i===3?48:49);assert.equal(hit.combo,i===3?'keystone':'knuckle');}
});
test('Rolling Monolith stuns each unwarded lane target once and keeps multi-hit credit',()=>{
 const {G}=setup('golem'),a=foe(G,264),b=foe(G,288),c=foe(G,314);b.ward={types:['blunt'],hp:6};let multi;G.events.on('multiHit',e=>multi=e);
 G.abilities.rollingMonolith.use(G.state.player);for(let n=0;n<85;n++)G.combat.updateProjectiles(.02);
 for(const e of [a,c]){assert.equal(e.hp,48);assert.equal(e.status.stun.dur,.3);}
 assert.equal(b.hp,50);assert.equal(b.ward.hp,4);assert.equal(b.status?.stun,undefined);assert.equal(multi.ability,'rollingMonolith');assert.ok(multi.hits>=3);
});
