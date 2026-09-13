'use strict';
const assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');
const r=runtime(),{G}=r;
function at(x,y){Object.assign(G.state.player,{x:x*16+8,y:y*16+8});}
function talk(){assert.ok(G.tryOpeningInteraction());r.drain();}
function reachable(tx,ty){
  const p=G.state.player,q=[[Math.floor(p.x/16),Math.floor(p.y/16)]],seen=new Set(q.map(p=>p.join(',')));
  for(let i=0;i<q.length;i++){const [x,y]=q[i];if(x===tx&&y===ty)return true;
    for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,key=nx+','+ny;
      if(nx<0||ny<0||nx>=G.state.mapW||ny>=G.state.mapH||seen.has(key)||G.world.solid(nx*16+8,ny*16+8))continue;seen.add(key);q.push([nx,ny]);}}
  return false;
}
function kill(e){e.bossIntroT=0;let count=0;while(!e.dead){assert.ok(count++<150);G.combat.damageEnemy(e,{ability:'slap',damage:1,type:'blunt',knockback:0,fromX:e.x-20,fromY:e.y});}r.drain();}
function clearWave(i){for(const e of G.state.enemies.filter(e=>e.deliveryWave===i&&!e.dead))kill(e);G.updateOpening(.05);r.drain();}
function reload(){G.saveGame();const save=G.loadSaveData();G.state.delivery=G.normalizeDelivery(JSON.parse(JSON.stringify(save.delivery)));r.load(G.state.mapId);r.drain();}

r.load();assert.equal(G.workshopErrors.length,0);assert.equal(G.deliveryGoal(),null);
G.state.opening.complete=true;G.state.claimedForms=['rat','knight'];G.state.known=['nobody','rat','knight'];
for(const e of G.state.enemies)if(e.id==='orchardTangle'){e.dead=true;G.state.opening.defeated.push(e.openingKey);}
assert.equal(G.deliveryGoal().mapId,'orchardRoad');assert.ok(reachable(26,37));at(26,37);talk();
assert.equal(G.state.mapId,'lanternReach');assert.ok(G.state.delivery.started);
assert.ok(reachable(14,24));assert.ok(!reachable(38,12),'unlit first lantern blocks the real crossing');
assert.ok(G.world.blocksProjectile(24*16+8,18*16+8));
at(14,24);talk();assert.equal(G.state.delivery.lamps[0],1);assert.equal(G.state.enemies.length,3);
assert.equal(G.deliveryCandidate(),null,'combat cannot steal an attack for an interaction');
kill(G.state.enemies[0]);reload();assert.equal(G.state.enemies.length,2,'partial waves persist across reload');
clearWave(0);assert.equal(G.state.delivery.lamps[0],2);assert.ok(reachable(38,12));assert.ok(!reachable(54,18));
assert.ok(!G.world.blocksProjectile(24*16+8,18*16+8));
assert.ok(reachable(18,30));at(18,30);G.state.formId='nobody';talk();assert.equal(G.state.delivery.salvage,false);
G.state.formId='rat';const spirit=G.state.town.spirit;talk();assert.ok(G.world.isSafeSpawn(G.state.player.x,G.state.player.y));
assert.ok(G.state.items.includes('brindles-recipes'));assert.equal(G.state.town.spirit,spirit+3);
reload();at(20,33);assert.equal(G.deliveryCandidate().id,'drainBack');talk();assert.equal(G.state.player.x,18*16+8);
assert.equal(G.state.town.spirit,spirit+3);at(38,12);talk();clearWave(1);assert.equal(G.state.delivery.lamps[1],2);assert.ok(reachable(59,18));
reload();assert.equal(G.state.enemies.length,0);assert.ok(reachable(59,18));

r.load('tollCourt');at(5,17);assert.ok(reachable(18,12));assert.ok(!reachable(33,17),'keeper is an actual barrier');
let boss=G.state.enemies.find(e=>e.id==='tollkeeper');boss.bossEngaged=true;boss.bossIntroT=0;boss.bossRecoverT=0;
G.updateOrchardBoss(boss,G.state.player,.1);const h=G.state.openingHazards[0];
assert.equal(h.kind,'flood');assert.equal(G.openingHazardHits(h,h.x,h.y),false);assert.equal(G.openingHazardHits(h,h.x+100,h.y),true);
at(5,17);const hp=G.state.player.damageTaken;G.updateOpening(.1);assert.equal(G.state.player.damageTaken,hp,'telegraph never damages');
G.state.player.x=h.x;G.state.player.y=h.y;G.updateOpening(1.6);assert.equal(G.state.player.damageTaken,hp,'refuge is safe through flood impact');
G.cancelBossHazards(boss);assert.equal(G.state.openingHazards.length,0);
boss.openingTimer=0;G.updateOrchardBoss(boss,G.state.player,.1);assert.equal(G.state.openingHazards[0].kind,'tollSweep');
boss.hp=1;reload();boss=G.state.enemies.find(e=>e.id==='tollkeeper');assert.equal(boss.hp,40);assert.equal(G.state.openingHazards.length,0);
const stars=G.state.stars;kill(boss);G.updateOpening(.05);r.drain();assert.ok(G.state.delivery.keeper);assert.equal(G.state.stars,stars+1);assert.ok(reachable(33,17));
reload();assert.ok(G.state.enemies.every(e=>e.dead));assert.equal(G.state.stars,stars+1);

r.load('sunriseQuay');G.updateOpening(.05);r.drain();
for(const [id,x,y]of [['present',28,26],['bread',12,12],['letter',30,13]]){
  assert.ok(reachable(x,y),id+' has a walkable approach');at(x,y);talk();assert.ok(G.state.delivery.parcels.includes(id));reload();
}
assert.ok(reachable(43,19),'existing town remains linked');at(8,20);const before=G.state.town.spirit;talk();
assert.ok(G.state.delivery.complete);assert.equal(G.state.town.spirit,before+8);assert.ok(G.state.items.includes('sunrise-seal'));
reload();at(8,20);assert.equal(G.deliveryCandidate().id,'rideBack');assert.equal(G.state.town.spirit,before+8);assert.equal(G.deliveryGoal(),null);
assert.match(G.npcDialogue('quayPip',0,0),/Nobody/);
talk();assert.equal(G.state.mapId,'orchardRoad');talk();assert.equal(G.state.mapId,'sunriseQuay');assert.equal(G.state.town.spirit,before+8,'repeat cart trips cannot duplicate the delivery reward');
// Visiting via the old town cannot collect parcels or a final reward early.
G.state.delivery=G.makeDelivery();r.load('sunriseQuay');at(28,26);assert.equal(G.deliveryCandidate(),null);
assert.deepEqual(JSON.parse(JSON.stringify(G.normalizeDelivery(null))),JSON.parse(JSON.stringify(G.makeDelivery())));
const bad=G.normalizeDelivery({lamps:['2',8],parcels:['bread','bread','fake'],cleared:'oops'});assert.equal(bad.lamps[0],0);assert.equal(bad.parcels.length,1);assert.equal(bad.cleared.length,0);
G.state.delivery.started=true;G.saveGame();assert.equal(G.saveSlotSummaries()[0].chapterName,'The Long Way Home');
console.log('Delivery: gates, partial encounters, drain return, checkpoint saves, keeper tells, durable parcels and rewards passed.');
