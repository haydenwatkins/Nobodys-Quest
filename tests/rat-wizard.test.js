const {test}=require('node:test'),assert=require('node:assert/strict');const runtime=require('../tools/lib/classic-runtime.cjs');
function setup(form='rat'){const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.formId=form;G.state.enemies=[];G.state.projectiles=[];G.state.player.x=240;G.state.player.y=144;G.state.player.dir={x:1,y:0};return r;}
function foe(G,dx,poison=false){const e=G.makeEnemy('slime',240+dx,144);e.def={...e.def,hp:50};e.hp=50;if(poison)G.combat.applyStatus(e,'poison',{dur:3,dps:1});G.state.enemies.push(e);return e;}
test('Fester spreads from existing hosts, hits overlapping targets once, and cannot chain through fresh infections',()=>{
 const {G}=setup();const near=foe(G,10,true),host=foe(G,50,true),spread=foe(G,74),beyond=foe(G,99);
 G.abilities.fester.use(G.state.player);
 assert.equal(near.hp,49);assert.equal(host.hp,49);assert.equal(spread.hp,49);assert.equal(beyond.hp,50);
 assert.ok(spread.status.poison);assert.equal(beyond.status?.poison,undefined);
});
test('borrowed Fester benefits from Wizard Hexcraft and Dark Matter controls a piercing lane',()=>{
 const {G}=setup('wizard');const near=foe(G,12);G.abilities.fester.use(G.state.player);assert.equal(near.status.poison.dur,5.8);
 G.state.enemies=[];const first=foe(G,24),second=foe(G,50);G.abilities['dark matter'].use(G.state.player);
 for(let i=0;i<25;i++)G.combat.updateProjectiles(.02);
 assert.equal(first.hp,48);assert.equal(second.hp,48);assert.ok(first.status.stun.dur>.35);assert.ok(second.status.stun);
});
test('Shadow Bolt cashes in poison once, while wards keep both the poison and normal ward damage',()=>{
 const {G}=setup();const e=foe(G,24,true);G.abilities.shadowBolt.use(G.state.player);G.combat.updateProjectiles(.1);
 assert.equal(e.hp,46);assert.equal(e.status.poison,undefined);
 G.state.projectiles=[];G.abilities.shadowBolt.use(G.state.player);G.combat.updateProjectiles(.1);assert.equal(e.hp,44);
 G.combat.applyStatus(e,'poison',{dur:3});e.ward={types:['dark'],hp:5};G.state.projectiles=[];
 G.abilities.shadowBolt.use(G.state.player);G.combat.updateProjectiles(.1);assert.equal(e.ward.hp,3);assert.equal(e.hp,44);assert.ok(e.status.poison);
});
test('a poison-finishing bolt still credits the poisoned kill lesson',()=>{
 const {G}=setup();const e=foe(G,20,true);e.hp=4;let kill;G.events.on('kill',event=>kill=event);
 G.combat.damageEnemy(e,{damage:2,type:'dark',ability:'shadowBolt',consumePoison:2});assert.ok(e.dead);assert.equal(kill.poisoned,true);assert.equal(kill.ability,'shadowBolt');
});
