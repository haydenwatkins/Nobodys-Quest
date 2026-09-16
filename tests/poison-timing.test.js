const {test}=require('node:test'),assert=require('node:assert/strict');const runtime=require('../tools/lib/classic-runtime.cjs');
test('repeated bites refresh poison without postponing its next damage tick',()=>{
 const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();const e=G.makeEnemy('slime',100,100);e.hp=20;
 G.combat.applyStatus(e,'poison',{dur:4,dps:1});
 for(let i=0;i<10;i++){G.combat.updateStatuses(e,.25);G.combat.applyStatus(e,'poison',{dur:3,dps:1});}
 assert.equal(e.hp,18);assert.equal(e.status.poison.tick,.5);
 G.combat.updateStatuses(e,.5);assert.equal(e.hp,17);
});
test('poison expiry counts only its active time and cannot report a kill twice',()=>{
 const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();const e=G.makeEnemy('slime',100,100);e.hp=20;
 G.combat.applyStatus(e,'poison',{dur:2.5,dps:1});G.combat.updateStatuses(e,8);assert.equal(e.hp,18);assert.equal(e.status.poison,undefined);
 let kills=0;G.events.on('kill',()=>kills++);e.hp=1;G.combat.applyStatus(e,'poison',{dur:3,dps:1});G.combat.updateStatuses(e,3);assert.equal(kills,1);assert.ok(e.dead);
});
test('a shorter poison preserves the remaining duration of a longer infection',()=>{
 const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();const e=G.makeEnemy('slime',100,100);
 G.combat.applyStatus(e,'poison',{dur:5.8,dps:1});G.combat.updateStatuses(e,.25);G.combat.applyStatus(e,'poison',{dur:3,dps:1});
 assert.equal(e.status.poison.dur,5.55);assert.equal(e.status.poison.tick,.25);
});
