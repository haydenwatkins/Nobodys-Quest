const test = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');

function sixMarkTraveler() {
  const r = runtime(), { G } = r;
  G.state.opening.complete = true;
  G.state.delivery.complete = true;
  G.state.stars = 60;
  G.state.worldwake.marks = ['sky', 'stone', 'thread', 'echo', 'light', 'heart'];
  G.state.claimedForms = G.formOrder.filter(id => !['nobody', 'god', 'turtle'].includes(id));
  G.questsDone = G.formOrder.filter(id => !['god', 'turtle'].includes(id))
    .flatMap(id => G.forms[id].quests.slice(0, 2).map(quest => quest.id));
  r.load('overworld'); r.drain();
  return r;
}

test('final preparation follows a missing guardian, its parent lesson, then the form echo', () => {
  const { G } = sixMarkTraveler();
  assert.equal(G.storyChapter(), 5);
  assert.deepEqual(Array.from(G.finalExamMastery().missingBreadth), ['turtle']);
  let goal = G.storyGoal();
  assert.equal(goal.guide, 'boss');
  assert.equal(goal.mapId, 'turtleTrial');
  assert.match(goal.objective, /Admiral Tortoise/);
  assert.equal(G.bossPreparation().enemy, 'Admiral Tortoise');
  assert.equal(G.guidanceRoute('overworld', goal.mapId).locks, 0);
  assert.equal(G.guidanceTarget().cell.portal.map, 'shattercoast');

  G.state.items.push('tide-shell');
  goal = G.storyGoal();
  assert.equal(goal.guide, 'mastery');
  assert.equal(goal.formId, 'knight');
  assert.ok(goal.questId);
  assert.ok(!G.guidanceTarget().text.includes('Shell Jab'), 'locked Turtle arts cannot be recommended');
  const lesson = G.questById(goal.questId).quest;
  for (let i = 0; i < lesson.count; i++) G.events.emit(lesson.event, { ability: lesson.match.ability, status: lesson.match.status });
  assert.equal(G.formLevel('knight'), 4);
  assert.equal(G.formReady('turtle'), true);
  goal = G.storyGoal();
  assert.equal(goal.guide, 'echo');
  assert.equal(goal.formId, 'turtle');
  assert.match(G.guidanceTarget().text, /win a battle/i);
  const echo = G.leaveReadyFormEchoAt(G.state.player.x + 40, G.state.player.y, 'battle');
  assert.equal(echo.formId, 'turtle');
  assert.match(G.guidanceTarget().destination, /Turtle/);
  assert.equal(G.claimForm('turtle'), true);
  goal = G.storyGoal();
  assert.equal(goal.guide, 'mastery');
  assert.equal(goal.formId, 'turtle');
  assert.ok(goal.questId);
});

test('a locked form with no known trial never sends field guidance to its unavailable quest', () => {
  const { G } = sixMarkTraveler();
  G.state.items.push('tide-shell');
  G.questsDone = G.questsDone.filter(id => id !== G.forms.knight.quests[1].id);
  // The Knight has an unfinished level, so a real Knight lesson is offered.
  assert.equal(G.storyGoal().formId, 'knight');
  // If no immediately borrowable lesson remains, the fallback still explains
  // the locked form rather than claiming its basic art is equipable.
  const oldLessons = G.masteryLessons;
  G.masteryLessons = () => [];
  const goal = G.storyGoal();
  assert.equal(goal.formId, 'turtle');
  assert.equal(goal.questId, undefined);
  const target = G.guidanceTarget();
  assert.equal(target.spatial, false);
  assert.match(target.text, /Awaken Turtle/);
  assert.ok(!target.text.includes('Shell Jab'));
  G.masteryLessons = oldLessons;
});

test('a missing Knight follows the Crest chest through the old dungeon to its Form Echo', () => {
  const r = runtime(), { G } = r;
  G.state.opening.complete = true;
  G.state.delivery.complete = true;
  G.state.stars = 60;
  G.state.worldwake.marks = ['sky', 'stone', 'thread', 'echo', 'light', 'heart'];
  G.state.claimedForms = G.formOrder.filter(id => !['nobody', 'god', 'knight'].includes(id));
  G.questsDone = G.formOrder.filter(id => !['god', 'knight'].includes(id))
    .flatMap(id => G.forms[id].quests.slice(0, 2).map(quest => quest.id));
  r.load('overworld'); r.drain();
  let goal = G.storyGoal();
  assert.equal(goal.guide, 'item');
  assert.equal(goal.mapId, 'dungeon');
  assert.equal(goal.itemId, 'knights-crest');
  assert.match(goal.objective, /Knight's Crest/);
  assert.equal(G.guidanceRoute('overworld', 'dungeon').locks, 0);
  assert.equal(G.guidanceTarget().cell.portal.map, 'dungeon');

  r.load('dungeon'); r.drain();
  const target = G.guidanceTarget();
  assert.equal(target.chest.chest.item, 'knights-crest');
  assert.equal(G.state.grid[target.tileY][target.tileX].chest.item, 'knights-crest');
  const start = [Math.floor(G.state.player.x / G.TILE), Math.floor(G.state.player.y / G.TILE)];
  const seen = new Set([start.join(',')]), queue = [start];
  for (let i = 0; i < queue.length; i++) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const x = queue[i][0] + dx, y = queue[i][1] + dy, key = `${x},${y}`;
    if (x < 0 || y < 0 || x >= G.state.mapW || y >= G.state.mapH || seen.has(key) ||
        G.world.solid(x * G.TILE + 8, y * G.TILE + 8)) continue;
    seen.add(key); queue.push([x, y]);
  }
  assert.ok(seen.has(`${target.tileX},${target.tileY}`), 'the dungeon entrance reaches the Crest chest');
  Object.assign(G.state.player, { x: target.x, y: target.y });
  G.world.checkTriggers(.5); r.drain();
  assert.ok(G.state.items.includes('knights-crest'));
  goal = G.storyGoal();
  assert.equal(goal.guide, 'echo');
  assert.equal(goal.formId, 'knight');
});
