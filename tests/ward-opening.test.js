const {test}=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');
function setup(){const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();const e=G.state.enemies.find(e=>e.id==='mireQueen');e.bossEngaged=true;e.bossIntroT=0;G.state.bossCutscene=null;G.state.enemies=[e];return {...r,e};}
function hit(G,e,type,damage){return G.combat.damageEnemy(e,{type,damage,fromX:e.x+30,fromY:e.y,knockback:0});}
test('only the final matching ward hit creates a boss opening',()=>{
 const {G,e}=setup();e.bossTelegraphT=.5;e.bossPendingAction='nova';
 assert.equal(hit(G,e,'blunt',5),false);assert.equal(e.ward.hp,5);assert.equal(e.bossTelegraphT,.5);
 hit(G,e,'dark',2);assert.equal(e.ward.hp,3);assert.equal(e.bossStaggerT,0);
 hit(G,e,'dark',3);assert.equal(e.hp,e.def.hp);assert.equal(e.bossPendingAction,null);assert.equal(e.bossTelegraphT,0);assert.equal(e.bossStaggerT,1.2);
 G.updateEnemies(.4);const remaining=e.bossStaggerT;hit(G,e,'dark',1);assert.equal(e.bossStaggerT,remaining);assert.equal(e.hp,e.def.hp-1);
});
test('breaking a ward clears only that boss’s attacks and leaves player shots intact',()=>{
 const {G,e}=setup(),other=G.makeEnemy('slime',100,100);
 e.bossChargeT=.8;e.bossContactActive=true;e.bossAfterCharge='nova';
 G.state.bossHazards=[{owner:e},{owner:other}];G.state.openingHazards=[{owner:e},{owner:other}];
 const shot={owner:e,fromPlayer:false};const friendly={owner:e,fromPlayer:true};const foreign={owner:other,fromPlayer:false};G.state.projectiles=[shot,friendly,foreign];
 hit(G,e,'dark',5);assert.equal(shot.dispelled,true);assert.equal(friendly.dispelled,undefined);assert.equal(foreign.dispelled,undefined);
 assert.equal(G.state.bossHazards.length,1);assert.equal(G.state.openingHazards.length,1);assert.equal(e.bossChargeT,0);assert.equal(e.bossContactActive,false);assert.equal(e.bossAfterCharge,null);
});
test('a projectile ward break cannot skip or corrupt its surrounding projectile entries',()=>{
 const {G,e}=setup();G.world.blocksProjectile=()=>false;
 function shot(fromPlayer,owner,x){return {x,y:e.y-4,startX:x,startY:e.y-4,vx:0,vy:0,size:3,range:100,damage:5,type:'dark',fromPlayer,owner,armT:10};}
 const hostile=shot(false,e,e.x+80),friendly=shot(true,G.state.player,e.x),survivor=shot(true,G.state.player,e.x+60);
 G.state.projectiles=[hostile,survivor,friendly];G.combat.updateProjectiles(.01);
 assert.equal(G.state.projectiles.length,1);assert.equal(G.state.projectiles[0],survivor);assert.equal(e.ward.hp,0);
});

test('the opening expires and does not alter ordinary warded enemies',()=>{
 const {G,e}=setup();G.state.player.x=e.x+40;G.state.player.y=e.y;e.bossSpecialT=0;
 hit(G,e,'dark',5);G.updateEnemies(.6);assert.equal(e.bossPendingAction,null);G.updateEnemies(.61);G.updateEnemies(.01);assert.notEqual(e.bossPendingAction,null);
 const ordinary=G.makeEnemy('slime',100,100);ordinary.ward={hp:1,types:['dark']};ordinary.bossEngaged=true;
 hit(G,ordinary,'dark',1);assert.equal(ordinary.bossStaggerT,0);assert.equal(ordinary.hp,ordinary.def.hp);
});
