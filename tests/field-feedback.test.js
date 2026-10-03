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
  G.ui.banner('ACT 4 · THE WAKING ROADS', 'The oldest roads were never grown. They were promises that carried people forward.');
  const before = JSON.stringify(G.state);
  for (const hd of [true, false]) for (const mode of ['touch', 'controller', 'keyboard']) {
    G.hdPilot = hd; G.input.isTouch = mode === 'touch'; G.input.hasGamepad = mode === 'controller'; draw();
    const cards = rects.filter(rect => rect.color === 'rgba(26,28,44,.9)'); assert.ok(cards.length);
    assert.match(labels.join(' '), /Sky Mark collected\. One star earned\./);
    const mana = rects.find(rect => rect.w === 42 && rect.h === 5); assert.ok(mana);
    const chip = rects.find(rect => rect.color === 'rgba(26,28,44,0.65)' && rect.x === mana.x - 1 && rect.y === mana.y + 8);
    assert.ok(chip);
    const stars = rects.find(rect => rect.color === 'rgba(26,28,44,0.65)' && rect.x > G.W / 2 && rect.y === 5); assert.ok(stars);
    const essentialPaint = [mana, chip, stars, ...rects.filter(rect => ['#b13e53', '#333c57'].includes(rect.color) && rect.h <= 3 && rect.y < mana.y)];
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

test('the native destination label yields to field notices and returns when their reading time finishes', () => {
  const { G, rects, labels, draw } = fixture();
  G.guidanceTarget = () => ({ x: 1000, y: 1000, kind: 'travel', spatial: true, color: '#ffcd75', icon: '◇', destination: 'Rootdeep Hollow' });
  G.requestGuidance(false);
  G.ui.toast('Stone Mark · +1 star · raises garden crossings', 4);
  G.ui.toast("Mason's Plumbline can shape your build. Visit Build / Keepsakes to choose its gift and price.", 4);
  G.input.hasGamepad = true;
  for (const [x,y] of [[160,96],[200,100],[90,145],[300,140]]) {
    Object.assign(G.state.player, { x, y }); draw();
    const notices = rects.filter(rect => rect.color === 'rgba(26,28,44,.9)');
    const destination = rects.find(rect => rect.color === 'rgba(26,28,44,0.86)' && rect.h === 12);
    if (destination) for (const notice of notices) assert.ok(!overlaps(notice, destination), 'optional destination text clears real notice painting');
  }
  Object.assign(G.state.player, { x: 160, y: 96 });
  // Settle the real queue through drawing and update, then renew native guidance.
  for (let i = 0; i < 80; i++) { draw(); G.ui.update(.1); }
  G.requestGuidance(false); draw();
  assert.ok(labels.some(label => label.includes('ROOTDEEP HOLLOW')));
});
