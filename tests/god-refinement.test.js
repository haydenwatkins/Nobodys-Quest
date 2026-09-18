const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(){const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.formId='god';G.state.enemies=[];G.state.projectiles=[];Object.assign(G.state.player,{x:240,y:144,dir:{x:1,y:0}});return r;}
function foe(G,x,y=144){const e=G.makeEnemy('slime',x,y);e.hp=50;G.state.enemies.push(e);return e;}
test('Judgment Ring breaks a non-Light ward and hits behind without melee guard',()=>{
 const {G}=setup(),p=G.state.player,a=foe(G,220),b=foe(G,264);b.ward={types:['dark'],hp:3};p.meleeGuard=0;G.abilities.judgmentRing.use(p);
 assert.equal(a.hp,47);assert.equal(b.ward.hp,0);assert.equal(p.meleeGuard,0);
});
test('Void Star bursts at range without damaging its pierced targets twice',()=>{
 const {G}=setup(),p=G.state.player;G.world.solid=()=>false;G.world.blocksProjectile=()=>false;const a=foe(G,420,140),b=foe(G,433,161);G.abilities.voidStar.use(p);for(let i=0;i<90;i++)G.combat.updateProjectiles(.02);
 assert.equal(a.hp,46);assert.equal(b.hp,48);assert.equal(G.state.projectiles.length,0);
});
test('Providence survives form changes as spent but refreshes for a new boss phase',()=>{
 const {G}=setup(),p=G.state.player,boss=foe(G,290);boss.def={...boss.def,miniboss:true};boss.bossPhase=1;
 p.damageTaken=G.playerMaxHearts()-1;let result=G.passives.beforePlayerDamage(1,p.x-20,p.y);assert.equal(result.prevented,true);assert.equal(G.playerHp(),1);
 G.state.formId='rat';G.passives.onFormChange(p);G.state.formId='god';G.passives.onFormChange(p);result=G.passives.beforePlayerDamage(1,p.x-20,p.y);assert.equal(result.prevented,false);
 boss.bossPhase=2;result=G.passives.beforePlayerDamage(1,p.x-20,p.y);assert.equal(result.prevented,true);
});
