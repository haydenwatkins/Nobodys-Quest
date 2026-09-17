const {test}=require('node:test'),assert=require('node:assert/strict');const runtime=require('../tools/lib/classic-runtime.cjs');
function setup(form){const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.formId=form;G.state.enemies=[];G.state.projectiles=[];const p=G.state.player;p.x=240;p.y=144;p.dir={x:1,y:0};return r;}
function foe(G,x,y=144){const e=G.makeEnemy('slime',x,y);e.hp=50;G.state.enemies.push(e);return e;}
test('Fire Breath hits once per cone and its burn refresh preserves damage timing',()=>{
 const {G}=setup('dragon'),e=foe(G,262);G.abilities.fireBreath.use(G.state.player);for(let i=0;i<15;i++)G.combat.updateProjectiles(.02);
 assert.equal(e.hp,49);assert.equal(e.status.burn.dur,2);G.combat.updateStatuses(e,.75);
 G.combat.applyStatus(e,'burn',{dur:2,dps:1,ability:'fireBreath'});G.combat.updateStatuses(e,.25);assert.equal(e.hp,48);
 G.combat.updateStatuses(e,8);assert.equal(e.hp,47);assert.equal(e.status.burn,undefined);
});
test('burn cannot enter through a ward and its lethal tick retains ability and light credit',()=>{
 const {G}=setup('dragon'),e=foe(G,262);e.ward={types:['light'],hp:6};G.abilities.fireBreath.use(G.state.player);for(let i=0;i<15;i++)G.combat.updateProjectiles(.02);
 assert.equal(e.hp,50);assert.equal(e.ward.hp,5);assert.equal(e.status?.burn,undefined);
 e.ward=null;e.hp=1;let kill;G.events.on('kill',v=>kill=v);G.combat.applyStatus(e,'burn',{dur:2,ability:'fireBreath'});G.combat.updateStatuses(e,2);
 assert.ok(e.dead);assert.equal(kill.ability,'fireBreath');assert.equal(kill.damageType,'light');
});
test('Meteor stuns both direct and splash targets without duplicate impact damage',()=>{
 const {G}=setup('dragon'),a=foe(G,264),b=foe(G,274,160);G.abilities.meteor.use(G.state.player);for(let i=0;i<20;i++)G.combat.updateProjectiles(.02);
 for(const e of [a,b]){assert.equal(e.hp,47);assert.equal(e.status.stun.dur,.5);}
});
test('borrowed Fault Line benefits from Hexcraft and strikes each lane target once',()=>{
 const {G}=setup('wizard'),a=foe(G,264),b=foe(G,290);G.abilities.faultLine.use(G.state.player);for(let i=0;i<70;i++)G.combat.updateProjectiles(.02);
 for(const e of [a,b]){assert.equal(e.hp,48);assert.equal(e.status.stun.dur,.25*1.45);}
});
