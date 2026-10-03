const assert = require('node:assert/strict');

// Walk through the native collision and pickup paths; never grant the item.
module.exports = function collectTreasure(r, item) {
  const { G } = r, reward = G.groundRewardFor(item);
  assert.ok(reward, `${item} is visibly pending before collection`);
  assert.ok(!G.state.items.includes(item), `${item} was not silently awarded by opening`);
  const p = G.state.player;
  for (let frame = 0; frame < 100 && !G.state.items.includes(item); frame++) {
    const distance = Math.hypot(reward.x - p.x, reward.y - p.y);
    if (distance > 0) {
      const amount = Math.min(2, distance);
      G.world.moveBox(p, (reward.x - p.x) / distance * amount, (reward.y - p.y) / distance * amount);
    }
    G.state.time += .05;
    G.updatePickups(.05);
  }
  assert.ok(G.state.items.includes(item), `${item} can be reached and collected`);
  assert.equal(G.groundRewardFor(item), null, 'claim clears pending ownership');
  r.drain();
};
