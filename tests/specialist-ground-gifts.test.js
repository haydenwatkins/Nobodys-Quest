const test=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
const collect=require('./helpers/collect-treasure.cjs'),cross=require('./helpers/cross-road.cjs');
const sources=[['riftbladeAdept','riftbladeTrial','riftblade-sigil','riftblade','sharp',18],['moleMonarch','moleTrial','mole-crown','mole','blunt',20],['countessCarmine','vampireTrial','crimson-seal','vampire','dark',22],['royalFool','jesterTrial','jester-bell','jester','sharp',24]];
for(const [id,map,item,form,type,entryStars]of sources)test(`${id} preserves its earned entry/return and saved victory while its form path waits for physical gift collection`,()=>{
 const r=runtime(),{G}=r;G.state.opening.complete=G.state.delivery.complete=true;G.state.stars=entryStars;
 G.state.claimedForms=Object.keys(G.forms).filter(f=>!['nobody','god',form].includes(f));G.questsDone=Object.values(G.forms).flatMap(f=>f.quests.map(q=>q.id));
 r.load('overworld');r.drain();cross(r,map);assert.equal(G.formReady(form),false);assert.equal(G.formEchoFor(form),null);
 const e=G.state.enemies.find(e=>e.id===id);e.bossEngaged=true;e.bossIntroT=0;G.state.bossCutscene=null;
 const stars=G.state.stars;G.combat.damageEnemy(e,{damage:e.ward.hp,type,knockback:0});G.combat.damageEnemy(e,{damage:100,type,knockback:0});r.drain();
 assert.ok(e.dead);assert.ok(G.groundRewardFor(item));assert.ok(!G.state.items.includes(item));assert.equal(G.state.stars,stars);
 assert.equal(G.formReady(form),false);assert.equal(G.formEchoFor(form),null);assert.equal(G.storyGoal().itemId,item);
 assert.equal(G.canWayfinderTravel(),false,'an instanced victory still returns on foot');
 G.saveGame();const saved=G.loadSaveData();assert.ok(saved.groundRewards.some(g=>g.item===item));assert.ok(!saved.items.includes(item));
 cross(r,'overworld');cross(r,map);assert.ok(!G.state.enemies.some(e=>e.id===id));
 G.state.groundRewards=G.normalizeGroundRewards(saved.groundRewards);r.load(map);r.drain();assert.ok(!G.state.enemies.some(e=>e.id===id));
 const gift=G.groundRewardFor(item);Object.assign(G.state.player,{x:gift.x,y:gift.y});collect(r,item);
 assert.equal(G.state.stars,stars+1);assert.ok(G.formReady(form));assert.ok(G.formEchoFor(form));assert.ok(!G.state.claimedForms.includes(form),'collection preserves the native Echo ceremony');
 G.saveGame();assert.ok(G.loadSaveData().items.includes(item));assert.ok(!G.loadSaveData().groundRewards.some(g=>g.item===item));
 const rematch=G.makeEnemy(id,e.x,e.y);rematch.ward.hp=0;G.combat.damageEnemy(rematch,{damage:100,type,knockback:0});r.drain();assert.equal(G.state.stars,stars+1);assert.equal(G.groundRewardFor(item),null);
 cross(r,'overworld');cross(r,map);
 if(['riftbladeAdept','moleMonarch'].includes(id)){
  assert.ok(!G.state.enemies.some(e=>!e.dead&&e.id===id),'the friendly specialist waits for a chosen rematch after collection');
  assert.ok(id==='moleMonarch'?G.beginBurrowRematch():G.beginWayglassRematch(),'legacy ownership retains deliberate practice access');
  assert.ok(G.state.enemies.some(e=>!e.dead&&(e.miraLocalRematch||e.bramLocalRematch)));
 }else assert.ok(G.state.enemies.some(e=>!e.dead&&e.id===id),'the original optional rematch returns after claim');
 assert.equal(G.normalizeGroundRewards(saved.groundRewards).length,0,'legacy ownership cannot restore duplicate pending credit');
});
