const { test } = require('node:test'), assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');
const collect = require('./helpers/collect-treasure.cjs'), cross = require('./helpers/cross-road.cjs');
const priorItems = ['trophy-sky-sovereign', 'trophy-old-mason', 'trophy-silk-matriarch', 'trophy-bell-titan'];
const sources = [
  { boss:'silkMatriarch', map:'rootdeepHollow', mark:'thread', before:2, exits:['hangingGardens','glasswaterDesert'], next:'frostbellTundra', type:'dark', art:'curse', stars:4,
    crossings:[{x:232,y:328,dx:48,dy:0},{x:440,y:328,dx:48,dy:0}], cells:[[15,19],[16,20],[28,19],[29,20]] },
  { boss:'bellTitan', map:'frostbellTundra', mark:'echo', before:3, exits:['shattercoast','stormspinePeaks'], next:'stormspinePeaks', type:'light', art:'luckyArrow', stars:1,
    crossings:[{x:248,y:280,dx:0,dy:64},{x:472,y:280,dx:0,dy:64}], cells:[[15,18],[16,20],[29,18],[30,20]] },
  { boss:'lanternKeeper', map:'stormspinePeaks', mark:'light', before:4, exits:['frostbellTundra','titanGrave'], next:'titanGrave', type:'dark', art:'curse', stars:1,
    crossings:[{x:248,y:280,dx:0,dy:80},{x:456,y:280,dx:0,dy:80}], cells:[[15,18],[16,21],[28,18],[29,21]] },
];

for (const source of sources) test(`${source.boss}'s saved ground Mark opens its native roads only on collection, with legacy and rematch credit preserved`, () => {
  const r = runtime(), { G } = r, p = G.state.player, item = G.enemies[source.boss].trophy;
  G.state.opening.complete = G.state.delivery.complete = true;
  G.state.stars = 40; G.state.items = ['trophy-heartwood-crown', ...priorItems.slice(0,source.before)];
  G.state.worldwake = G.normalizeWorldwake(undefined, { items:G.state.items });
  G.questsDone = Object.values(G.forms).flatMap(form => form.quests.map(q => q.id));
  r.load(source.map); r.drain(); G.state.bossCutscene = null;
  const blocked = ([x,y]) => G.world.solid(x*16+8,y*16+8);
  assert.ok(source.cells.every(blocked));
  for (const route of source.crossings) {
    Object.assign(p,{x:route.x,y:route.y});
    for (let i=0;i<Math.max(route.dx,route.dy)/2;i++) G.world.moveBox(p,Math.sign(route.dx)*2,Math.sign(route.dy)*2);
    assert.ok(Math.hypot(p.x-route.x,p.y-route.y)<Math.hypot(route.dx,route.dy),'unrestored routes block actual collision movement');
  }
  const boss = G.state.enemies.find(e=>e.def.id===source.boss), point={x:boss.x,y:boss.y}, stars=G.state.stars;
  boss.bossIntroT=0; boss.bossEngaged=true;
  const strike={ability:source.art,type:source.type,fromX:boss.x-20,fromY:boss.y,knockback:0};
  G.combat.damageEnemy(boss,{...strike,damage:boss.ward.hp}); assert.equal(boss.ward.hp,0);
  G.combat.damageEnemy(boss,{...strike,damage:boss.hp+10}); r.drain(); assert.ok(boss.dead);
  assert.equal(G.hasWorldMark(source.mark),false); assert.equal(G.state.stars,stars); assert.ok(source.cells.every(blocked));
  assert.equal(G.storyGoal().itemId,item); assert.equal(G.guidanceTarget().reward,G.groundRewardFor(item));
  const saved=G.loadSaveData(); assert.ok(saved.groundRewards.some(reward=>reward.item===item));
  assert.ok(!saved.items.includes(item)); assert.ok(!saved.worldwake.marks.includes(source.mark));
  for (const exit of source.exits) { cross(r,exit); cross(r,source.map); }
  assert.ok(!G.state.enemies.some(e=>e.def.id===source.boss)); assert.ok(G.groundRewardFor(item));
  const beforeClaim=G.state.stars; Object.assign(p,point); collect(r,item);
  assert.equal(G.state.stars,beforeClaim+source.stars,source.mark==='thread'?'one gift star plus the native third-Mark caravan favor':'one native gift star');
  assert.equal(G.ensureWorldwake().marks.filter(mark=>mark===source.mark).length,1);
  assert.ok(source.cells.every(cell=>!blocked(cell))); assert.equal(G.storyGoal().mapId,source.next);
  assert.equal(G.activeKeepsake(),null); assert.equal(G.activeWorldMarkDiscipline(),null);
  for (const route of source.crossings) {
    Object.assign(p,{x:route.x,y:route.y});
    for (let i=0;i<Math.max(route.dx,route.dy)/2;i++) G.world.moveBox(p,Math.sign(route.dx)*2,Math.sign(route.dy)*2);
    assert.equal(p.x,route.x+route.dx); assert.equal(p.y,route.y+route.dy);
    for (let i=0;i<Math.max(route.dx,route.dy)/2;i++) G.world.moveBox(p,-Math.sign(route.dx)*2,-Math.sign(route.dy)*2);
    assert.equal(p.x,route.x); assert.equal(p.y,route.y);
  }
  r.load(source.map); r.drain(); assert.equal(G.state.restorationDetails.length,28);
  assert.ok(source.cells.every(cell=>!blocked(cell))); assert.ok(!G.state.enemies.some(e=>e.def.id===source.boss));
  const rematch=G.makeEnemy(source.boss,point.x,point.y); rematch.ward.hp=0; rematch.bossIntroT=0; G.state.enemies.push(rematch);
  G.combat.damageEnemy(rematch,{...strike,damage:rematch.hp+10}); r.drain();
  assert.equal(G.state.stars,beforeClaim+source.stars); assert.equal(G.groundRewardFor(item),null);
  G.state.groundRewards=G.normalizeGroundRewards(saved.groundRewards); assert.equal(G.state.groundRewards.length,0);
  assert.equal(G.ensureWorldwake().marks.filter(mark=>mark===source.mark).length,1);
});
