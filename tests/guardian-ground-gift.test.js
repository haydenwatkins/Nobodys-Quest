const { test } = require('node:test'), assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs'), collect = require('./helpers/collect-treasure.cjs');
const crown = 'trophy-heartwood-crown';
function fixture(map = 'heartwood') {
  const r = runtime(), { G } = r;
  G.state.opening.complete = G.state.delivery.complete = true;
  G.state.stars = 3; G.questsDone = Object.values(G.forms).flatMap(form => form.quests.map(q => q.id));
  r.load(map); r.drain(); G.state.bossCutscene = null;
  return r;
}
function defeat(r) {
  const { G } = r, enemy = G.state.enemies.find(e => e.def.id === 'ancientTreant');
  assert.ok(enemy); Object.assign(G.state.player, {x:enemy.x,y:enemy.y});
  enemy.ward.hp = 0; enemy.hp = 1; enemy.bossIntroT = 0;
  G.combat.damageEnemy(enemy, {ability:'slap',damage:2,type:'blunt',fromX:enemy.x-10,fromY:enemy.y});
  assert.ok(enemy.dead); r.drain(); return enemy;
}

test('native Treant victory reveals a real Crown/star bundle and credits it exactly once through collection', () => {
  const r = fixture(), { G } = r, pickups = []; G.events.on('pickup', event => pickups.push(event.item));
  const stars = G.state.stars; defeat(r);
  assert.ok(!G.state.items.includes(crown)); assert.equal(G.state.stars, stars);
  const reward = G.groundRewardFor(crown); assert.equal(reward.source, 'guardian');
  assert.ok(G.world.isSafeSpawn(reward.x,reward.y)); assert.equal(G.loadSaveData().groundRewards[0].item,crown);
  assert.equal(G.storyGoal().guide,'item'); assert.equal(G.storyGoal().itemId,crown);
  assert.equal(G.guidanceTarget().reward,reward);
  collect(r,crown); assert.equal(G.state.stars,stars+1); assert.equal(pickups.filter(item=>item===crown).length,1);
  assert.equal(G.state.keepsakeId,null,'a gift does not silently equip its speed/health tradeoff');
  assert.equal(G.loadSaveData().groundRewards.length,0);
  r.load('mistwood'); r.drain(); defeat(r);
  assert.equal(G.state.items.filter(item=>item===crown).length,1); assert.equal(G.state.stars,stars+1);
  assert.equal(G.groundRewardFor(crown),null); assert.equal(pickups.filter(item=>item===crown).length,1);
});

test('pending Treant victory survives travel/save and suppresses another guardian fight until the gift is claimed', () => {
  const r = fixture('mistwood'), { G } = r; defeat(r); const saved = G.loadSaveData();
  r.load('town'); r.drain(); assert.equal(G.groundRewardsHere().length,0);
  G.state.groundRewards = G.normalizeGroundRewards(saved.groundRewards);
  r.load('mistwood'); r.drain();
  assert.ok(!G.state.enemies.some(e=>e.def.id==='ancientTreant'),'the defeated guardian does not respawn over pending loot');
  assert.ok(G.groundRewardFor(crown));
  r.load('heartwood'); r.drain(); assert.ok(!G.state.enemies.some(e=>e.def.id==='ancientTreant'),'the same unique guardian on the opening road is already defeated');
  assert.equal(G.groundRewardFor(crown).mapId,'mistwood','travel does not move a guardian gift into another arena');
  G.state.items.push(crown); G.restoreGroundRewards(); assert.equal(G.groundRewardFor(crown),null,'already-owned legacy credit removes stale pending loot');
  assert.equal(G.state.stars,saved.stars,'normalizing owned loot never replays its star');
});

test('the opening promise guides collect then return, and final collection hooks run only after the Crown is claimed', () => {
  const r = fixture(), { G } = r; G.state.opening.complete = false;
  Object.assign(G.state.opening,{started:true,notice:true,cart:true,sluice:true,bell:true});
  G.state.claimedForms.push('rat','knight');
  G.state.items = G.guardianTrophies().filter(item=>item!==crown);
  defeat(r); const reward = G.groundRewardFor(crown);
  assert.equal(G.openingGoal().short,'Collect the Heartwood Crown');
  assert.equal(G.openingGoal().mapId,'heartwood'); assert.equal(G.openingTarget().x,reward.x);
  assert.ok(!G.state.items.includes('guardian-compass'),'completion does not run at reveal');
  const stars = G.state.stars; collect(r,crown);
  assert.equal(G.openingGoal().short,'Return to Parcel at the cart');
  assert.ok(G.state.items.includes('guardian-compass')); assert.equal(G.state.stars,stars+4,'native final-compass reward plus Crown star');
  G.updatePickups(.05); assert.equal(G.state.stars,stars+4);
});
