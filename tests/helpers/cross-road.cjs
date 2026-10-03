const assert = require('node:assert/strict');

// Approach an authored portal from safe ground, then cross through native
// collision/triggers. This does not claim a complete inter-map walkthrough.
module.exports = function crossRoad(r, destination) {
  const { G } = r, from = G.state.mapId, cells = [];
  for (let y = 0; y < G.state.mapH; y++) for (let x = 0; x < G.state.mapW; x++)
    if (G.state.grid[y][x].portal?.map === destination) cells.push({ x, y });
  const approach = cells.map(cell => {
    const start = [[1, 0], [-1, 0], [0, 1], [0, -1]].find(([dx, dy]) =>
      G.world.isSafeSpawn((cell.x + dx) * G.TILE + 8, (cell.y + dy) * G.TILE + 8));
    return start && { ...cell, start };
  }).find(Boolean);
  assert.ok(approach, `${from} has a safe approach to ${destination}`);
  const [dx, dy] = approach.start, player = G.state.player;
  Object.assign(player, { x: (approach.x + dx) * G.TILE + 8, y: (approach.y + dy) * G.TILE + 8 });
  G.input.vec = { x: 0, y: 0 }; G.world.checkTriggers(.5); r.drain();
  G.input.vec = { x: -dx, y: -dy };
  for (let frame = 0; frame < 40 && G.state.mapId === from; frame++) {
    G.world.moveBox(player, -dx * 1.5, -dy * 1.5); G.world.checkTriggers(.02); r.drain();
  }
  G.input.vec = { x: 0, y: 0 };
  assert.equal(G.state.mapId, destination);
  assert.ok(G.world.isSafeSpawn(player.x, player.y));
};
