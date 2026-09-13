'use strict';
const assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');
const r=runtime(),{G}=r;
function at(x,y){G.state.player.x=x*16+8;G.state.player.y=y*16+8;}
function clear(id){for(const e of G.state.enemies.filter(e=>e.id===id&&!e.dead)){
  at(e.x/16-.5,e.y/16-.5);
  while(!e.dead)G.combat.damageEnemy(e,{ability:'slap',damage:1,type:'blunt',fromX:e.x-10,fromY:e.y});
}}
function meet(id){const echo=G.formEchoFor(id);assert.ok(echo,`${id} echo exists`);echo.needsLeave=false;G.state.player.x=echo.x;G.state.player.y=echo.y;G.updateFormEcho();r.drain();assert.ok(G.formUnlocked(id));}
function reachable(tx,ty){
  const p=G.state.player,q=[[Math.floor(p.x/16),Math.floor(p.y/16)]],seen=new Set(q.map(p=>p.join(',')));
  for(let i=0;i<q.length;i++){
    const [x,y]=q[i];if(x===tx&&y===ty)return true;
    for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=x+dx,ny=y+dy,key=nx+','+ny;
      if(nx<0||ny<0||nx>=G.state.mapW||ny>=G.state.mapH||seen.has(key)||G.world.solid(nx*16+8,ny*16+8))continue;
      seen.add(key);q.push([nx,ny]);
    }
  }return false;
}
r.load();assert.equal(G.workshopErrors.length,0);G.beginStorySession(null);r.drain();
assert.equal(G.openingGoal().short,'Read the notice beside the road');
assert.ok(reachable(12,35));assert.ok(reachable(27,24));assert.ok(!reachable(38,25),'closed culvert must be a real barrier');
at(12,35);G.world.checkTriggers(.1);r.drain();assert.ok(G.state.opening.notice);assert.equal(G.formLevel('nobody'),2);
clear('orchardTangle');G.updateOpening(.05);r.drain();assert.ok(G.state.opening.cart);assert.ok(G.formReady('rat'));meet('rat');
at(27,24);assert.equal(G.openingInteractionCandidate().id,'culvert');
G.setForm('nobody');G.tryOpeningInteraction();r.drain();assert.equal(G.state.opening.sluice,false);
G.setForm('rat');assert.ok(G.tryOpeningInteraction());r.drain();assert.ok(G.state.opening.sluice);assert.ok(G.world.isSafeSpawn(G.state.player.x,G.state.player.y));
assert.ok(reachable(38,25),'mill chest is reachable after opening the crossing');
at(38,25);G.world.checkTriggers(.1);r.drain();assert.ok(G.state.items.includes('knights-crest'));meet('knight');
assert.ok(reachable(46,14),'watch bell is reachable');assert.ok(!reachable(54,1),'bell gate stays closed');
clear('orchardGuard');at(46,14);G.tryOpeningInteraction();r.drain();assert.ok(G.state.opening.bell);assert.ok(reachable(54,1));
// Every unique encounter and road milestone survives the actual save payload.
G.saveGame();const saved=G.loadSaveData();assert.ok(saved.opening.sluice&&saved.opening.bell);assert.equal(saved.opening.defeated.length,6);
G.state.opening=G.normalizeOpening(JSON.parse(JSON.stringify(saved.opening)));r.load();
assert.equal(G.state.enemies.filter(e=>e.id==='orchardTangle'&&!e.dead).length,0);
assert.equal(G.state.enemies.filter(e=>e.id==='orchardGuard'&&!e.dead).length,0);
at(35,24);assert.ok(reachable(22,37),'opened bridge provides the return route in every form');
// An interrupted guardian attempt resets health and hazards, never progression.
r.load('heartwood');assert.ok(reachable(16,6));let boss=G.state.enemies.find(e=>e.id==='ancientTreant');
boss.bossEngaged=true;boss.bossIntroT=0;boss.bossRecoverT=0;
G.updateOrchardBoss(boss,G.state.player,.05);assert.ok(G.state.openingHazards.length);
const h=G.state.openingHazards[0];assert.ok(G.openingHazardHits(h,h.x+h.dx*60,h.y+h.dy*60));
assert.ok(!G.openingHazardHits(h,h.x+h.dx*60+h.dy*30,h.y+h.dy*60-h.dx*30),'sidestepping leaves a safe lane');
const before=G.state.player.damageTaken;G.updateOpening(.1);assert.equal(G.state.player.damageTaken,before,'warning time cannot hurt');
G.cancelBossHazards(boss);assert.equal(G.state.openingHazards.length,0);
boss.hp=2;r.load('heartwood');boss=G.state.enemies.find(e=>e.id==='ancientTreant');assert.equal(boss.hp,boss.def.hp);
// Finish through real damage/ward/trophy code, then earn the reward once.
boss.bossIntroT=0;clear('ancientTreant');G.updateOpening(.05);r.drain();
assert.ok(G.state.items.includes('trophy-heartwood-crown'));assert.equal(G.openingGoal().mapId,'orchardRoad');
r.load();at(22,37);const spirit=G.state.town.spirit;assert.ok(G.tryOpeningInteraction());r.drain();
assert.ok(G.state.opening.complete);assert.ok(G.state.items.includes('orchard-ribbon'));assert.equal(G.state.town.spirit,spirit+5);
assert.equal(G.tryOpeningInteraction(),false);assert.equal(G.state.town.spirit,spirit+5);
// Old saves stay usable and retain unlocks; visiting does not overwrite them.
const old={claimedForms:['rat','knight','dragon'],stars:35,items:['trophy-heartwood-crown']};
G.state.opening=G.normalizeOpening(undefined);Object.assign(G.state,old);r.load('overworld');assert.equal(G.openingGoal(),null);assert.ok(G.formUnlocked('dragon'));assert.equal(G.state.stars,35);
// A second basic cast has real anticipation and fires exactly once.
r.load();G.state.formId='nobody';const target=G.state.enemies.find(e=>e.def.practice);G.state.player.x=target.x-10;G.state.player.y=target.y;G.state.player.dir={x:1,y:0};
let uses=0;const use=G.abilities.slap.use;G.abilities.slap.use=p=>{uses++;use(p);};
assert.ok(G.beginFormPerformance(G.state.player,'slap'));G.updateFormPerformance(.01);assert.equal(uses,0);G.updateFormPerformance(.04);assert.equal(uses,1);G.updateFormPerformance(.2);assert.equal(uses,1);
// Every direction/pose survives costume changes and both pixel resolutions.
for(const id of ['nobody','rat','knight']){
  G.state.formId=id;
  for(const costume of ['classic','trailblazer']){
    G.state.costumeId=costume;const sprite=G.costumedSprite(G.forms[id].sprite);
    for(const hd of [true,false]){G.hdPilot=hd;for(const dir of [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]){
      G.state.player.dir=dir;const frame=G.performanceFrame(sprite,G.state.player,1);assert.notEqual(frame,null);
      assert.ok(G.activeSpriteDefinition(sprite).frames[frame]);
    }}
  }
}
console.log('Opening: rescue, form discovery, gates, save/reload, guardian, one-time reward, legacy saves, and animation passed.');
