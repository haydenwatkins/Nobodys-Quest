const { test } = require('node:test'), assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');
const collect = require('./helpers/collect-treasure.cjs'), cross = require('./helpers/cross-road.cjs');

test('Atlas saves the unclaimed Worldheart, then collection opens the heart road and pays native six-Mark thanks once while mastery still gates the finale', () => {
  const r=runtime(),{G}=r,p=G.state.player,item='trophy-last-worldbearer';
  G.state.opening.complete=G.state.delivery.complete=true; G.state.stars=40;
  G.state.items=['trophy-heartwood-crown',...Object.keys(G.WORLDWAKE_MARKS).filter(trophy=>trophy!==item)];
  G.state.worldwake=G.normalizeWorldwake(undefined,{items:G.state.items});
  r.load('titanGrave');r.drain();G.state.bossCutscene=null;
  const boss=G.state.enemies.find(e=>e.def.id==='lastWorldbearer'),point={x:boss.x,y:boss.y},stars=G.state.stars;
  const gate=G.maps.overworld.legend.Y;
  assert.match(G.world.portalBlockReason(gate).text,/Restore all 6 World Marks/);
  assert.match(G.world.portalBlockReason(G.state.grid[28][23]).text,/Worldheart Mark/);
  boss.bossIntroT=0;boss.bossEngaged=true;
  const strike={ability:'slap',type:'blunt',fromX:boss.x-20,fromY:boss.y,knockback:0};
  G.combat.damageEnemy(boss,{...strike,damage:boss.ward.hp});assert.equal(boss.ward.hp,0);
  G.combat.damageEnemy(boss,{...strike,damage:boss.hp+10});r.drain();assert.ok(boss.dead);
  assert.equal(G.hasWorldMark('heart'),false);assert.equal(G.state.stars,stars);
  assert.ok(!G.state.items.includes('worldwake-crown'));assert.equal(G.storyGoal().itemId,item);
  const saved=G.loadSaveData();assert.ok(saved.groundRewards.some(reward=>reward.item===item));
  assert.ok(!saved.worldwake.marks.includes('heart'));assert.ok(!saved.items.includes(item));
  // Both original exits still work while the new heart road remains sealed.
  for(const exit of ['stormspinePeaks','glasswaterDesert']){cross(r,exit);cross(r,'titanGrave');}
  assert.ok(!G.state.enemies.some(e=>e.def.id==='lastWorldbearer'));assert.ok(G.groundRewardFor(item));
  assert.match(G.world.portalBlockReason(G.state.grid[28][23]).text,/Worldheart Mark/);
  const beforeClaim=G.state.stars;Object.assign(p,point);collect(r,item);
  assert.equal(G.state.stars,beforeClaim+6,'one gift star plus the existing five-star six-Mark favor');
  assert.equal(G.ensureWorldwake().marks.filter(mark=>mark==='heart').length,1);
  assert.equal(G.ensureWorldwake().favorsDone.filter(favor=>favor==='worldAtPeace').length,1);
  assert.equal(G.state.items.filter(trophy=>trophy==='worldwake-crown').length,1);
  assert.equal(G.storyChapter(),5);assert.equal(G.activeKeepsake(),null);assert.equal(G.activeWorldMarkDiscipline(),null);
  assert.equal(G.world.portalBlockReason(G.state.grid[28][23]),null);
  const reason=G.world.portalBlockReason(gate);assert.ok(reason);assert.match(reason.text,/Learn every form to level 3/);
  assert.doesNotMatch(reason.text,/Restore all 6 World Marks/,'awakening the last Mark does not bypass earned mastery');
  cross(r,'overworld');assert.equal(G.world.portalBlockReason(G.state.grid[0][114]),null);
  assert.ok(G.world.solid(110*16+8,8),'the final entrance still waits for the native portfolio');
  cross(r,'titanGrave');assert.equal(G.state.restorationDetails.length,28);
  assert.ok(!G.state.enemies.some(e=>e.def.id==='lastWorldbearer'));
  const rematch=G.makeEnemy('lastWorldbearer',point.x,point.y);rematch.ward.hp=0;rematch.bossIntroT=0;G.state.enemies.push(rematch);
  G.combat.damageEnemy(rematch,{...strike,damage:rematch.hp+10});r.drain();
  assert.equal(G.state.stars,beforeClaim+6);assert.equal(G.groundRewardFor(item),null);
  G.state.groundRewards=G.normalizeGroundRewards(saved.groundRewards);assert.equal(G.state.groundRewards.length,0);
  assert.equal(G.ensureWorldwake().favorsDone.filter(favor=>favor==='worldAtPeace').length,1);
  assert.equal(G.state.items.filter(trophy=>trophy==='worldwake-crown').length,1);
});
