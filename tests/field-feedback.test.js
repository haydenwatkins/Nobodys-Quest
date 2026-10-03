const { test } = require('node:test'), assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function fixture() {
  const r = runtime(), { G } = r;
  G.state.opening.complete = G.state.delivery.complete = true;
  r.load('dungeon'); r.drain(); G.state.enemies = []; G.state.npcs = [];
  G.state.bossCutscene = null; G.world.nearPortal = () => null; G.tutorial.prompt = () => null;
  Object.assign(G.state.player, { x: 160, y: 96 });
  r.run('js/engine/ui.js'); G.getLoadout(G.state.formId);
  const c = r.nodes.get('ui').getContext('2d'), rects = [], labels = [], stack = [];
  let dx = 0, dy = 0;
  c.measureText = text => ({ width: String(text).length * 3.5 });
  c.save = () => stack.push([dx, dy, c.globalAlpha]);
  c.restore = () => { [dx, dy, c.globalAlpha] = stack.pop(); };
  c.translate = (x, y) => { dx += x; dy += y; };
  c.fillRect = (x, y, w, h) => rects.push({ x: x + dx, y: y + dy, w, h, color: c.fillStyle });
  c.fillText = text => labels.push(String(text));
  const draw = () => { rects.length = labels.length = 0; G.ui.drawHUD({ x: 0, y: 0 }); assert.equal(stack.length, 0); };
  return { r, G, rects, labels, draw };
}

test('compact full-text feedback clears the traveller, essential status and fixed controls in each input mode', () => {
  const { G, rects, labels, draw } = fixture();
  G.ui.toast('Sky Mark collected. One star earned.', 4);
  G.ui.toast('The wind lifts are awake.', 4);
  G.ui.banner('NEW BUILD CHOICE', 'Weigh its gift and price in Build.');
  const before = JSON.stringify(G.state);
  for (const hd of [true, false]) for (const mode of ['touch', 'controller', 'keyboard']) {
    G.hdPilot = hd; G.input.isTouch = mode === 'touch'; G.input.hasGamepad = mode === 'controller'; draw();
    const cards = rects.filter(rect => rect.color === 'rgba(26,28,44,.9)'); assert.ok(cards.length);
    assert.match(labels.join(' '), /Sky Mark collected\. One star earned\./);
    const mana = rects.find(rect => rect.w === 42 && rect.h === 5); assert.ok(mana);
    const chip = rects.find(rect => rect.color === 'rgba(26,28,44,0.65)' && rect.x === mana.x - 1 && rect.y === mana.y + 8);
    assert.ok(chip);
    const essentialPaint = [mana, chip, ...rects.filter(rect => ['#b13e53', '#333c57'].includes(rect.color) && rect.h <= 3 && rect.y < mana.y)];
    const body = G.spriteMetrics(G.playerForm().sprite);
    for (const card of cards) {
      assert.ok(!overlaps(card, { x: G.state.player.x - body.w / 2, y: G.state.player.y - body.h, w: body.w, h: body.h }));
      for (const paint of essentialPaint) assert.ok(!overlaps(card, paint), 'feedback clears actual heart/mana/form painting');
      assert.ok(card.y + card.h <= G.H - 23);
      if (G.input.isTouch) { assert.ok(card.x + card.w <= G.W - 68); assert.ok(card.x >= 84 || card.y + card.h <= G.H - 68); }
    }
    for (let i = 0; i < cards.length; i++) for (let j = i + 1; j < cards.length; j++) assert.ok(!overlaps(cards[i], cards[j]));
  }
  assert.equal(JSON.stringify(G.state), before, 'painting never changes earned progress or combat');
});

test('a notice retains its reading time through native dialogue and expires after it has actually appeared', () => {
  const { r, G, labels, draw } = fixture();
  G.ui.toast('A clear road home.', 2); G.ui.dialogue('PEBBLE', 'The beacon is lit.');
  draw(); assert.ok(!labels.includes('A clear road home.'));
  G.ui.update(10); draw(); assert.ok(!labels.includes('A clear road home.'));
  r.taps.add('a'); G.ui.update(.2); assert.equal(G.ui.dialogueOpen, false);
  draw(); assert.ok(labels.includes('A clear road home.'), 'reading dialogue did not consume the notice');
  G.ui.update(2.1); draw(); assert.ok(!labels.includes('A clear road home.'), 'visible notices retain finite native lifetimes');
});

test('celebration waits through an active guardian encounter while the native boss header stays visible', () => {
  const { G, labels, rects, draw } = fixture();
  const boss = G.makeEnemy('ancientTreant', 240, 104); boss.bossEngaged = true;
  G.state.enemies = [boss]; G.ui.banner('NEW BUILD CHOICE', 'A gift to weigh after this fight.');
  draw(); G.ui.update(10); draw();
  assert.ok(!rects.some(rect => rect.color === 'rgba(26,28,44,.9)'));
  assert.ok(labels.some(label => label.includes('TREANT')), 'the real encounter header remains');
  // The rendering fixture ends the encounter; native victory/credit has its own integration coverage.
  G.state.enemies = []; draw(); G.ui.update(.2); draw();
  assert.match(labels.join(' '), /NEW BUILD CHOICE/);
  assert.match(labels.join(' '), /A gift to weigh after this fight\./);
});
