const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(form='druid'){const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.formId=form;G.state.enemies=[];G.state.projectiles=[];Object.assign(G.state.player,{x:240,y:152,dir:{x:1,y:0}});return r;}
function foe(G,x,y=152){const e=G.makeEnemy('slime',x,y);e.hp=50;G.state.enemies.push(e);return e;}
test('Wild Growth holds the crowd without adding outward velocity',()=>{
 const {G}=setup(),enemies=[foe(G,270),foe(G,210),foe(G,240,180)];G.abilities.wildGrowth.use(G.state.player);
 for(const e of enemies){assert.equal(e.hp,48);assert.equal(e.kbx,0);assert.equal(e.kby,0);assert.equal(e.status.stun.dur,.7);}
});
test('borrowed Stitchline preserves zero knockback and gains Hexcraft duration',()=>{
 const {G}=setup('wizard'),a=foe(G,264),b=foe(G,290);G.abilities.stitchline.use(G.state.player);
 for(const e of [a,b]){assert.equal(e.hp,49);assert.equal(e.kbx,0);assert.equal(e.kby,0);assert.ok(e.status.stun.dur>.32);}
});
test('Seedbed skips wards and blocked targets, preserving borrowed burn kill credit',()=>{
 const {G}=setup(),source=foe(G,250),warded=foe(G,258),blocked=foe(G,266),clear=foe(G,250,182);warded.ward={types:['dark'],hp:4};
 G.world.solid=(x,y)=>x>=260&&x<=263&&y<170;
 G.combat.applyStatus(source,'burn',{dur:.2,dps:2,ability:'meteor'});source.hp=1;let killed;G.events.on('kill',e=>killed=e);
 G.combat.damageEnemy(source,{damage:1,type:'dark',ability:'thornLash',knockback:0});
 assert.equal(warded.status?.burn,undefined);assert.equal(blocked.status?.burn,undefined);assert.equal(clear.status.burn.ability,'meteor');assert.equal(clear.status.burn.dur,1);
 clear.hp=2;G.combat.updateStatuses(clear,1);assert.ok(clear.dead);assert.equal(killed.ability,'meteor');
});
test('a late poison spread still delivers one tick',()=>{
 const {G}=setup(),source=foe(G,250),target=foe(G,270);G.combat.applyStatus(source,'poison',{dur:.1,dps:1});source.hp=1;
 G.combat.damageEnemy(source,{damage:1,type:'dark',ability:'thornLash',knockback:0});G.combat.updateStatuses(target,1);assert.equal(target.hp,49);assert.equal(target.status.poison,undefined);
});
