const {test}=require('node:test'),assert=require('node:assert/strict');const runtime=require('../tools/lib/classic-runtime.cjs');
function setup(){const r=runtime(),{G}=r;G.state.delivery=G.normalizeDelivery({complete:true});G.state.town.followedRequest='beacon';r.load('sunriseQuay');r.drain();return r;}
test('boss preparation identifies the required type and only suggests earned arts',()=>{
 const {G}=setup();let p=G.bossPreparation();assert.equal(p.enemy,'Mire Queen');assert.equal(p.types.join(','),'dark');assert.equal(p.ready,false);assert.equal(p.arts.length,0);assert.ok(p.source);
 G.availableAbilities=()=>['curse'];p=G.bossPreparation();assert.equal(p.arts[0],'curse');assert.equal(p.ready,false);
 const basic=G.getLoadout(G.state.formId)[0];assert.equal(G.equipBossPreparation('curse',0),false);assert.equal(G.equipBossPreparation('slap',1),false);
 assert.equal(G.equipBossPreparation('curse',1),true);assert.equal(G.getLoadout(G.state.formId)[0],basic);assert.equal(G.bossPreparation().ready,true);
});
test('preparation disappears for a broken ward, a defeated boss, or an expedition',()=>{
 const r=setup(),{G}=r;r.load('sunkenMarsh');r.drain();const e=G.state.enemies.find(e=>e.id==='mireQueen');e.ward.hp=0;assert.equal(G.bossPreparation(),null);
 r.load('sunriseQuay');r.drain();G.state.expeditionRun={};assert.equal(G.bossPreparation(),null);G.state.expeditionRun=null;
 G.state.items.push('trophy-mire-pearl');assert.notEqual(G.bossPreparation()?.enemy,'Mire Queen');
});
