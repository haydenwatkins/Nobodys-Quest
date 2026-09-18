const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(form){const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.formId=form;G.state.enemies=[];G.state.projectiles=[];Object.assign(G.state.player,{x:240,y:144,dir:{x:1,y:0}});return r;}
function foe(G,x,y=144){const e=G.makeEnemy('slime',x,y);e.hp=50;G.state.enemies.push(e);return e;}
test('native Echo Orb can complete its three-target mastery requirement',()=>{
 const {G}=setup('bellkeeper'),enemies=[foe(G,264),foe(G,289),foe(G,316)];let multi;G.events.on('multiHit',e=>multi=e);
 G.abilities.echoOrb.use(G.state.player);for(let i=0;i<100;i++)G.combat.updateProjectiles(.02);
 enemies.forEach(e=>assert.equal(e.hp,49));assert.equal(multi.ability,'echoOrb');assert.equal(multi.hits,3);
});
test('Handbell third peal reaches a foe beyond the normal chime',()=>{
 const {G}=setup('bellkeeper'),e=foe(G,279),p=G.state.player;
 G.abilities.handbell.use(p);G.abilities.handbell.use(p);assert.equal(e.hp,50);G.abilities.handbell.use(p);assert.equal(e.hp,49);assert.equal(p.bellBeat,3);
});
test('blocked Lantern Drift lands once and leaves one safe light without melee guard',()=>{
 const {G}=setup('lanternWisp'),p=G.state.player,e=foe(G,220);p.meleeGuard=0;G.state.safeLights=[];G.world.moveBox=()=>{};
 G.abilities.lanternDrift.use(p);G.updatePlayer(.02);assert.equal(p.dashing,null);assert.equal(e.hp,48);assert.equal(p.meleeGuard,0);assert.equal(G.state.safeLights.length,1);
 G.updatePlayer(.1);assert.equal(e.hp,48);assert.equal(G.state.safeLights.length,1);
});
test('Safe Light swallows hostile shots but allows the players shots through',()=>{
 const {G}=setup('lanternWisp'),p=G.state.player;G.passives.onAbilityUse(p,'ghostlight');let blocked=0;G.events.on('projectileBlock',()=>blocked++);
 G.state.projectiles.push({x:p.x+12,y:p.y-5,vx:-20,vy:0,size:3,damage:1,range:200,startX:p.x+12,startY:p.y-5,fromPlayer:false});
 G.abilities.echoOrb.use(p);G.combat.updateProjectiles(.02);
 assert.equal(blocked,1);assert.equal(p.damageTaken,0);assert.equal(G.state.projectiles.length,1);assert.ok(G.state.projectiles[0].fromPlayer);
 G.passives.update(4);assert.equal(G.state.safeLights.length,0);
});
