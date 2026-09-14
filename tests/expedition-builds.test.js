'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');
function start(){const r=runtime(),{G}=r;r.load('overworld');G.state.claimedForms=['rat','knight'];G.state.known=['nobody','rat','knight'];G.questsDone=G.forms.nobody.quests.map(q=>q.id);r.drain();assert.ok(G.startManyfoldExpedition(3));r.drain();return r;}
function battle(G){const run=G.state.expeditionRun;run.phase='battle';G.state.enemies=[G.makeEnemy('slime',140,136),G.makeEnemy('slime',160,136),G.makeEnemy('slime',210,136)];for(const e of G.state.enemies){e.ward=null;e.hp=20;}return run;}
test('a crossing starts with three useful, resumable build choices',()=>{
  const r=start(),{G}=r,run=G.state.expeditionRun;
  assert.equal(run.phase,'reward');assert.ok(run.openingDraft);assert.equal(run.draftOptions.length,3);
  assert.ok(run.draftOptions.some(o=>o.id==='crossweave'));assert.ok(run.draftOptions.some(o=>o.id==='afterstep'));assert.ok(run.draftOptions.some(o=>o.id==='briarRelay'));
  G.saveGame();const save=G.loadSaveData();const resumed=G.normalizeExpeditionRun(save.expeditionRun);
  assert.equal(resumed.phase,'reward');assert.equal(resumed.draftOptions.length,3);
  assert.ok(G.chooseExpeditionDraft(0));assert.equal(run.phase,'route');assert.equal(run.room,0);assert.equal(run.boons.crossweave,1);
});
test('Crossweave rewards alternating successful arts and respects wards',()=>{
  const {G}=start(),run=battle(G);run.boons.crossweave=1;const e=G.state.enemies[0];
  const hit=id=>G.combat.damageEnemy(e,{ability:id,type:G.abilities[id].type,damage:1,knockback:0});
  hit('slap');assert.equal(e.hp,19);hit('slap');assert.equal(e.hp,18);hit('bite');assert.equal(e.hp,16);
  e.ward={hp:2,types:['sharp']};hit('slap');assert.equal(run.lastArt,'bite','a bounced art does not advance the rhythm');
  hit('bite');assert.equal(e.ward.hp,1);assert.equal(e.hp,16);
});
test('Afterstep uses a delayed local burst, never leaks into the campaign',()=>{
  const {G}=start(),run=battle(G);run.boons.afterstep=1;
  G.state.player.x=140;G.state.player.y=136;G.state.player.dir={x:1,y:0};
  G.combat.dash(G.state.player,{ability:'cartwheel',damage:0,type:'blunt'});
  G.updateExpeditionEffects(.2);assert.equal(G.state.enemies[0].hp,20);
  G.updateExpeditionEffects(.3);assert.equal(G.state.enemies[0].hp,18);assert.equal(G.state.enemies[1].hp,18);assert.equal(G.state.enemies[2].hp,20);
  G.expeditionDashEcho(G.state.player,{ability:'cartwheel',type:'blunt'});G.failManyfoldExpedition(null,true);
  assert.equal(G.state.expeditionEchoes.length,0);G.updateExpeditionEffects(1);assert.equal(G.state.mapId,'overworld');
});
test('Briar Relay spreads real poison only from poisoned defeats',()=>{
  const {G}=start(),run=battle(G);run.boons.briarRelay=1;const [a,b,c]=G.state.enemies;
  a.hp=1;G.combat.applyStatus(a,'poison',{dur:3,dps:.7,ability:'bite'});
  G.combat.damageEnemy(a,{ability:'slap',type:'blunt',damage:1,knockback:0});
  assert.ok(b.status.poison);assert.ok(c.status.poison);
});
test('chamber cover survives resume and never seals the player from foes',()=>{
  const {G}=start();G.chooseExpeditionDraft(0);const run=G.state.expeditionRun;run.routeChoices=[{id:'skirmish'}];G.chooseExpeditionRoute('skirmish');
  const before=JSON.stringify(G.state.grid);G.resumeManyfoldExpedition();assert.equal(JSON.stringify(G.state.grid),before);
  const seen=new Set(['6,8']),queue=[[6,8]];
  for(let i=0;i<queue.length;i++)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const x=queue[i][0]+dx,y=queue[i][1]+dy,key=x+','+y;if(seen.has(key)||G.world.solid(x*16+8,y*16+8))continue;seen.add(key);queue.push([x,y]);}
  for(const e of G.state.enemies)assert.ok(seen.has(Math.floor(e.x/16)+','+Math.floor(e.y/16)));
});
test('last-room victory restores the build and does not drop arena loot at home',()=>{
  const r=start(),{G}=r,run=battle(G);run.room=2;run.length=3;run.boons.crossweave=1;
  const original=JSON.stringify(run.backup.loadouts);G.state.player.pantryGuard=1;
  G.state.enemies=G.state.enemies.slice(0,1);G.state.enemies[0].hp=1;
  G.combat.damageEnemy(G.state.enemies[0],{ability:'bite',type:'sharp',damage:1,knockback:0});r.drain();
  assert.equal(G.state.expeditionRun,null);assert.equal(G.state.mapId,'overworld');
  assert.equal(JSON.stringify(G.state.loadouts),original);assert.equal(G.state.player.pantryGuard,0);assert.equal(G.state.pickups.length,0);
  assert.equal(G.state.expedition.lastRun.outcome,'victory');assert.ok(G.state.expedition.lastRun.boons.includes('crossweave'));
});
