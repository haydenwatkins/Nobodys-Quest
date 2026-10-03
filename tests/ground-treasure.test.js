const { test } = require('node:test');
const assert = require('node:assert/strict');
const runtime = require('../tools/lib/classic-runtime.cjs');
const collect = require('./helpers/collect-treasure.cjs');

function open(r, map, item) {
  const { G } = r; r.load(map); r.drain(); G.state.enemies = [];
  const chest = G.state.chests.find(ch => ch.chest.item === item);
  assert.ok(chest); Object.assign(G.state.player, { x: chest.x * 16 + 8, y: chest.y * 16 + 8 });
  G.world.checkTriggers(.05); r.drain();
  assert.ok(chest.opened); assert.ok(G.state.opened.includes(chest.key));
  assert.ok(!G.state.items.includes(item)); assert.ok(G.groundRewardFor(item));
  return chest;
}

test('every authored chest item has safe ground contents and grants its native item/heal exactly once on movement', () => {
  const r = runtime(), { G } = r; G.state.opening.complete = true; G.state.delivery.complete = true;
  const pickups = []; G.events.on('pickup', event => pickups.push(event.item));
  const cases = [...new Set(Object.values(G.maps).flatMap(map => Object.values(map.legend || {}).map(cell => cell.chest?.item).filter(Boolean)))].map(item => [Object.keys(G.maps).find(id =>
    Object.values(G.maps[id].legend || {}).some(cell => cell.chest?.item === item) &&
    G.maps[id].tiles.some(row => [...row].some(key => G.maps[id].legend[key]?.chest?.item === item))), item]);
  assert.equal(cases.length, 10);
  for (const [map, item] of cases) {
    G.state.player.damageTaken = 2; const chest = open(r, map, item), reward = G.groundRewardFor(item);
    assert.ok(G.world.isSafeSpawn(reward.x, reward.y));
    assert.equal(G.state.player.damageTaken, 2, 'opening itself does not heal');
    G.state.time += 30; G.updatePickups(.01); assert.ok(G.groundRewardFor(item), 'earned contents never expire');
    collect(r, item); assert.equal(pickups.filter(id => id === item).length, 1);
    assert.equal(G.state.player.damageTaken, chest.chest.heal ? 0 : 2);
    G.state.player.damageTaken = 2; r.load(map); r.drain(); G.state.enemies = [];
    const same = G.state.chests.find(ch => ch.chest.item === item);
    assert.ok(same.opened); Object.assign(G.state.player, { x: same.x * 16 + 8, y: same.y * 16 + 8 });
    G.world.checkTriggers(.05); G.updatePickups(.05);
    assert.equal(G.state.items.filter(id => id === item).length, 1); assert.equal(G.state.player.damageTaken, 2);
  }
});

test('pending contents survive real saves, travel and cache relocation; legacy ownership and another source cannot repay', () => {
  const r = runtime(), { G } = r; open(r, 'glasswaterDesert', 'glasswater-prism');
  const saved = G.loadSaveData(); assert.equal(saved.groundRewards.length, 1); assert.ok(!saved.items.includes('glasswater-prism'));
  r.load('town'); r.drain(); assert.equal(G.groundRewardsHere().length, 0); assert.ok(G.groundRewardFor('glasswater-prism'));
  G.state.groundRewards = G.normalizeGroundRewards(saved.groundRewards); G.state.opened = saved.opened;
  r.load('glasswaterDesert'); r.drain(); G.state.enemies = [];
  const old = G.state.chests.find(ch => ch.chest.item === 'glasswater-prism');
  const moved = [[old.x+1,old.y],[old.x-1,old.y],[old.x,old.y+1]].find(([x,y]) =>
    G.world.isSafeSpawn(x*16+8,y*16+8) && !G.state.grid[y][x].chest);
  assert.ok(moved);
  const rows = G.maps.glasswaterDesert.tiles.map(row => [...row]);
  [rows[old.y][old.x],rows[moved[1]][moved[0]]] = [rows[moved[1]][moved[0]],rows[old.y][old.x]];
  G.maps.glasswaterDesert.tiles = rows.map(row => row.join(''));
  r.load('glasswaterDesert'); r.drain(); G.state.enemies = [];
  const restored = G.state.chests.find(ch => ch.chest.item === 'glasswater-prism');
  assert.ok(restored.opened); assert.equal(restored.x, moved[0]); assert.equal(restored.y, moved[1]);
  assert.ok(G.state.opened.includes(restored.key), 'pending ownership follows the actual redesigned cache');
  G.state.player.invuln = 0; G.damagePlayer(100); r.drain();
  assert.ok(G.groundRewardFor('glasswater-prism'), 'native gentle knockout preserves the pending reward');
  Object.assign(G.state.player, { x: restored.x * 16 + 8, y: restored.y * 16 + 8 });
  G.state.player.damageTaken = 2; collect(r, 'glasswater-prism');
  assert.equal(G.loadSaveData().groundRewards.length, 0); assert.ok(G.loadSaveData().items.includes('glasswater-prism'));
  G.state.groundRewards = saved.groundRewards; G.restoreGroundRewards(); assert.equal(G.groundRewardsHere().length, 0, 'legacy owned item cannot be replayed');
  open(r, 'dungeon', 'knights-crest'); G.state.items.push('knights-crest'); G.updatePickups(.01);
  assert.equal(G.groundRewardFor('knights-crest'), null); assert.equal(G.state.items.filter(id => id === 'knights-crest').length, 1);
  assert.equal(G.normalizeGroundRewards([{source:'chest',item:'not-a-chest',mapId:'town',x:1,y:1}]).length, 0);
});

test('the Crest story trail follows revealed contents and advances only on claim; drawing never grants progress', () => {
  const r = runtime(), { G } = r; G.state.opening.complete = true; G.state.delivery.complete = true;
  G.state.stars = 60; G.state.worldwake.marks = ['sky','stone','thread','echo','light','heart'];
  G.state.claimedForms = G.formOrder.filter(id => !['nobody', 'god', 'knight'].includes(id));
  G.questsDone = G.formOrder.filter(id => !['god','knight'].includes(id)).flatMap(id => G.forms[id].quests.slice(0,2).map(q => q.id));
  open(r, 'dungeon', 'knights-crest');
  const reward = G.groundRewardFor('knights-crest'), target = G.guidanceTarget();
  assert.equal(target.reward, reward); assert.match(target.text, /ground.*collect/);
  assert.equal(G.storyGoal().guide, 'item'); assert.equal(G.formEchoFor('knight'), null);
  const c = new Proxy({ measureText: text => ({width: text.length * 4}) }, {get: (o,k) => o[k] ?? (()=>{}), set:(o,k,v)=>(o[k]=v,true)});
  const before = JSON.stringify({items:G.state.items,rewards:G.state.groundRewards,quests:G.questCounts,opened:G.state.opened});
  for (const hd of [true,false]) { G.hdPilot = hd; G.reducedMotion = true; G.drawGroundReward(c, reward); }
  assert.equal(JSON.stringify({items:G.state.items,rewards:G.state.groundRewards,quests:G.questCounts,opened:G.state.opened}), before);
  collect(r,'knights-crest'); assert.equal(G.storyGoal().guide, 'echo'); assert.ok(G.formEchoFor('knight'));
});

test('the sharp purpose cue preserves actors, ground contents and fixed controls while optional cards yield', () => {
  const r = runtime(), { G } = r; G.state.opening.complete = G.state.delivery.complete = true;
  open(r, 'dungeon', 'knights-crest'); r.run('js/engine/ui.js');
  const context = r.nodes.get('ui').getContext('2d'), labels = [], rects = [];
  context.measureText = text => ({ width: text.length * 3.5 });
  context.fillText = (text,x,y) => labels.push({text,x,y});
  context.fillRect = (x,y,w,h) => rects.push({x,y,w,h,color:context.fillStyle});
  G.state.formEchoes = G.normalizeFormEchoes([{formId:'ranger',mapId:'dungeon',x:80,y:98,source:'battle',needsLeave:false}]);
  const echoPaint = [], paintSprite = G.drawSprite;
  const scratch = new Proxy({measureText: text => ({width:text.length*5}),fillText(text,x,y){echoPaint.push({x:x-text.length*2.5,y:y-7,w:text.length*5,h:7});}}, {get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
  G.drawSprite = (context,sprite,frame,x,y,flip,scale=1) => {
    const body = G.spriteMetrics(sprite);echoPaint.push({x:x-body.w*scale/2,y:y-body.h*scale,w:body.w*scale,h:body.h*scale});
  };
  G.drawFormEcho(scratch,G.state.formEchoes[0]);G.drawSprite=paintSprite;
  // Normal boot/use creates the existing default loadout before field painting.
  G.getLoadout(G.state.formId);
  const reward = G.groundRewardFor('knights-crest'), before = JSON.stringify(G.state);
  for (const hd of [true,false]) for (const touch of [true,false]) {
    G.hdPilot = hd; G.input.isTouch = touch; labels.length = rects.length = 0;
    G.ui.drawHUD({x:0,y:0});
    assert.ok(labels.some(label => label.text === "Knight's Crest"));
    assert.ok(labels.some(label => label.text === 'Discover the Knight'));
    assert.ok(labels.some(label => /Walk over.*collect/.test(label.text)));
    const cue = rects.find(rect => rect.color === 'rgba(26,28,44,.94)'); assert.ok(cue);
    const overlaps = actor => cue.x < actor.x+actor.w && cue.x+cue.w > actor.x && cue.y < actor.y+actor.h && cue.y+cue.h > actor.y;
    assert.equal(overlaps({x:reward.x-10,y:reward.y-18,w:20,h:22}), false);
    assert.equal(overlaps({x:G.state.player.x-14,y:G.state.player.y-30,w:28,h:34}), false);
    for(const paint of echoPaint)assert.equal(overlaps(paint),false,'the cue clears the native Form Echo sprite/marker painting');
    if (touch) {assert.ok(cue.x+cue.w <= G.W-68);assert.ok(cue.y+cue.h <= G.H-68);}
  }
  assert.equal(JSON.stringify(G.state), before);
  open(r, 'orchardRoad', 'knights-crest');
  const cam = {x:Math.max(0,G.state.player.x-G.W/2),y:Math.max(0,G.state.player.y-G.H/2)};
  labels.length = rects.length = 0; G.ui.drawHUD(cam);
  assert.ok(labels.some(label => label.text === "Knight's Crest"), 'the paper HUD also presents the ground contents');
  assert.ok(labels.some(label => label.text === 'Discover the Knight'));
});

test('a crowded Heartwood touch view keeps the Crown purpose visible beneath the echo without covering controls', () => {
  const r = runtime(), { G } = r;
  G.state.opening.complete = G.state.delivery.complete = true;
  G.state.claimedForms = ['rat','knight'];
  G.questsDone = Object.values(G.forms).flatMap(form => form.quests.map(q => q.id));
  r.load('heartwood');r.drain();G.state.bossCutscene=null;
  const treant = G.state.enemies.find(e=>e.def.id==='ancientTreant');
  G.state.enemies=[treant];Object.assign(G.state.player,{x:treant.x+14,y:treant.y});
  treant.ward.hp=0;treant.hp=1;treant.bossIntroT=0;
  G.combat.damageEnemy(treant,{ability:'slap',damage:2,type:'blunt',fromX:treant.x+14,fromY:treant.y});r.drain();
  const crown=G.groundRewardFor('trophy-heartwood-crown');assert.ok(crown);
  G.state.formEchoes=G.normalizeFormEchoes([{formId:'dragon',mapId:'heartwood',x:treant.x,y:treant.y,source:'victory',needsLeave:true}]);
  r.run('js/engine/ui.js');G.getLoadout(G.state.formId);G.input.isTouch=true;
  const c=r.nodes.get('ui').getContext('2d'),labels=[],rects=[];
  c.measureText=text=>({width:text.length*3.5});c.fillText=text=>labels.push(text);
  c.fillRect=(x,y,w,h)=>rects.push({x,y,w,h,color:c.fillStyle});
  const cam={x:Math.max(0,Math.min(G.state.mapW*16-G.W,G.state.player.x-G.W/2)),y:Math.max(0,Math.min(G.state.mapH*16-G.H,G.state.player.y-G.H/2-4))};
  const before=JSON.stringify(G.state);
  for(const hd of [true,false]){
    G.hdPilot=hd;labels.length=rects.length=0;G.ui.drawHUD(cam);
    assert.ok(labels.includes('Heartwood Crown'));assert.ok(labels.includes('+1 star · choose a Keepsake in Build'));
    assert.ok(labels.some(text=>/Walk over.*collect/.test(text)));
    const cue=rects.find(rect=>rect.color==='rgba(26,28,44,.94)');assert.ok(cue);
    assert.ok(cue.x>=84&&cue.x+cue.w<=G.W-68,'the centred cue clears both touch control corners');
    assert.ok(cue.y+cue.h<=G.H-4,'the cue stays inside the field frame');
  }
  assert.equal(JSON.stringify(G.state),before,'cue placement leaves saved progress alone');
});
