const {test}=require('node:test'),assert=require('node:assert/strict');const runtime=require('../tools/lib/classic-runtime.cjs');
function setup(form='ranger'){const r=runtime(),{G}=r;r.load('emberRidge');r.drain();G.state.formId=form;G.state.enemies=[];G.state.projectiles=[];const p=G.state.player;p.x=160;p.y=144;p.dir={x:1,y:0};return r;}
function foe(G,x){const e=G.makeEnemy('slime',160+x,144);e.hp=50;G.state.enemies.push(e);return e;}
test('Lucky Arrow marks a line and a sharp follow-up consumes one bonus per target',()=>{
 const {G}=setup(),a=foe(G,24),b=foe(G,50);G.abilities.luckyArrow.use(G.state.player);
 for(let i=0;i<15;i++)G.combat.updateProjectiles(.02);
 for(const e of [a,b]){assert.equal(e.hp,48);assert.equal(e.status.marked.dur,4);G.combat.damageEnemy(e,{ability:'arrow',type:'sharp',damage:1});assert.equal(e.hp,46);assert.equal(e.status.marked,undefined);G.combat.damageEnemy(e,{ability:'arrow',type:'sharp',damage:1});assert.equal(e.hp,45);}
});
test('marks expire, survive ward hits, and cannot be applied through a ward',()=>{
 const {G}=setup(),e=foe(G,24);e.ward={types:['light'],hp:6};G.abilities.luckyArrow.use(G.state.player);G.combat.updateProjectiles(.1);
 assert.equal(e.ward.hp,4);assert.equal(e.status?.marked,undefined);
 G.combat.applyStatus(e,'marked',{dur:4});e.ward.types=['sharp'];G.combat.damageEnemy(e,{ability:'arrow',type:'sharp',damage:1});assert.equal(e.ward.hp,3);assert.ok(e.status.marked);
 G.combat.updateStatuses(e,4.1);assert.equal(e.status.marked,undefined);
});
test('borrowed light marks support a Knight riposte without losing its mastery credit',()=>{
 const {G}=setup('knight'),e=foe(G,24);G.combat.applyStatus(e,'marked',{dur:4});G.state.player.knightRiposteT=2;
 let hit;G.events.on('hit',v=>hit=v);G.abilities.slash.use(G.state.player);assert.equal(e.hp,46);assert.equal(hit.combo,'riposte');assert.equal(e.status.marked,undefined);
});
test('perfect frontal parries ready Oathblade immediately and restore one capped mana',()=>{
 const {G}=setup('knight'),p=G.state.player;p.mana=0;p.cooldowns.slash=.4;p.knightGuardT=.5;p.knightPerfectT=.2;
 G.damagePlayer(1,p.x+12,p.y);assert.equal(p.damageTaken,0);assert.equal(p.mana,1);assert.equal(p.cooldowns.slash,0);
 p.knightGuardT=.5;p.knightPerfectT=0;p.cooldowns.slash=.4;G.damagePlayer(1,p.x+12,p.y);assert.equal(p.mana,1);assert.equal(p.cooldowns.slash,.4);
 p.knightGuardT=.5;p.knightPerfectT=.2;p.mana=G.playerMaxMana();G.damagePlayer(1,p.x+12,p.y);assert.equal(p.mana,G.playerMaxMana());
});
