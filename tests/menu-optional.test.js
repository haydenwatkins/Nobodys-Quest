'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
test('the opening invites lantern play once; returning and reloading do not impose another choice or change rewards',()=>{
 const r=runtime(),{G}=r;r.load();G.beginStorySession(null);r.drain();
 assert.equal(G.fieldKit.isOpen(),true);assert.equal(G.comfortSetting('easyMode'),false);assert.equal(G.comfortSetting('bossAssistance'),false);
 const before=JSON.stringify({items:G.state.items,stars:G.state.stars,quests:G.questsDone});
 G.fieldKit.close();assert.ok(G.state.opening.seen.includes('help-lanterns'));
 const saved=G.loadSaveData();G.state.opening=G.normalizeOpening(saved.opening);assert.equal(G.introduceHelpLanterns(),false);
 assert.equal(JSON.stringify({items:G.state.items,stars:G.state.stars,quests:G.questsDone}),before);
});
test('world A switches lanterns without a menu or attack; threats and shots keep A available for combat',()=>{
 const r=runtime(),{G}=r;r.load();G.state.enemies=[];
 const at=G.helpStations().find(s=>s.kind==='easyMode');assert.ok(at);Object.assign(G.state.player,{x:at.x,y:at.y,mana:7,cooldowns:{}});
 assert.equal(G.helpStationCandidate().kind,'easyMode');r.taps.add('a');G.updatePlayer(.05);
 assert.equal(G.fieldKit.isOpen(),false);assert.equal(G.state.player.cooldowns.slap,undefined);assert.equal(G.comfortSetting('easyMode'),true);
 G.fieldKit.close();const e=G.makeEnemy('slime',at.x+12,at.y);G.state.enemies=[e];assert.equal(G.helpStationCandidate(),null);r.taps.add('a');G.updatePlayer(.05);assert.equal(G.fieldKit.isOpen(),false);assert.ok(G.state.player.cooldowns.slap>0);
 G.state.enemies=[];G.state.projectiles=[{x:at.x+10,y:at.y,fromPlayer:false}];assert.equal(G.helpStationCandidate(),null);
});
test('every rest fire offers both lights and a bag on a safe neighbouring tile across the campaign',()=>{
 const r=runtime(),{G}=r;let fires=0;
 for(const id of Object.keys(G.maps)){
  r.load(id);const fireTiles=[];
  for(let y=0;y<G.state.mapH;y++)for(let x=0;x<G.state.mapW;x++)if(G.state.grid[y][x].rest)fireTiles.push([x*16+8,y*16+8]);
  for(const [x,y]of fireTiles){fires++;const stations=G.helpStations().filter(s=>Math.hypot(s.x-x,s.y-y)<=23);for(const kind of ['easyMode','bossAssistance','pockets'])assert.ok(stations.some(s=>s.kind===kind),`${id} fire ${x},${y} has ${kind}`);}
  for(const s of G.helpStations())assert.ok(G.world.isSafeSpawn(s.x,s.y),`${id} station is reachable by ordinary feet`);
 }
 assert.ok(fires>=20,'whole campaign fires were visited');
});
test('pocket browsing uses actual collected treasures; preview and rendering cannot equip, refill, or award anything',()=>{
 const r=runtime(),{G}=r;r.load('town');G.state.enemies=[];G.state.items.push('trophy-heartwood-crown','orchard-ribbon');G.state.player.mana=3;
 const before=JSON.stringify({items:G.state.items,player:G.state.player,keepsake:G.state.keepsakeId});
 assert.equal(G.pocketTreasures().some(k=>k.id==='mire'),false);const crown=G.pocketTreasures().find(k=>k.id==='heartwood');assert.equal(crown.kind,'carry');assert.equal(G.pocketTreasures().find(k=>k.id==='orchard-ribbon').kind,'memory');
 assert.ok(G.fieldKit.openPockets());assert.equal(JSON.stringify({items:G.state.items,player:G.state.player,keepsake:G.state.keepsakeId}),before);G.fieldKit.close();
 const c=r.context.document.getElementById('game').getContext('2d');for(const d of G.openingDrawables(c))d.fn();assert.equal(JSON.stringify({items:G.state.items,player:G.state.player,keepsake:G.state.keepsakeId}),before);
});

test('an interrupted opening invitation resumes, while a completed choice and late saves stay quiet',()=>{
 const r=runtime(),{G}=r;r.load();G.state.opening.seen=['arrival'];G.beginOpening();r.drain();assert.equal(G.fieldKit.isOpen(),true);G.fieldKit.close();
 G.beginOpening();r.drain();assert.equal(G.fieldKit.isOpen(),false);
 G.state.opening.seen=['arrival'];G.state.player.x=40*16+8;G.state.player.y=24*16+8;G.beginOpening();r.drain();assert.equal(G.fieldKit.isOpen(),false);
});
