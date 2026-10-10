'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
test('the opening continues directly into the world with optional help off and no forced configuration',()=>{
 const r=runtime(),{G}=r;r.load();G.beginStorySession(null);
 assert.ok(r.messages.some(m=>m.text.includes('Parcel')));
 assert.equal(r.messages.some(m=>/lantern/i.test(m.text)),false);
 r.drain();assert.equal(G.fieldKit.isOpen(),false);assert.equal(G.comfortSetting('easyMode'),false);assert.equal(G.comfortSetting('bossAssistance'),false);
 const p=G.state.player;assert.equal(G.helpStationCandidate(),null,'arrival does not present a lamp action under the player');
 assert.equal(G.helpStations().filter(s=>['easyMode','bossAssistance'].includes(s.kind)&&Math.hypot(s.x-p.x,s.y-p.y)<60).length,2,'help stays discoverable beside the path');
 const saved=G.loadSaveData();G.state.opening=G.normalizeOpening(saved.opening);G.beginOpening();r.drain();assert.equal(G.fieldKit.isOpen(),false);
});
test('world A switches lanterns without a menu or attack; threats and shots keep A available for combat',()=>{
 const r=runtime(),{G}=r;r.load();G.state.enemies=[];
 const at=G.helpStations().find(s=>s.kind==='easyMode');assert.ok(at);Object.assign(G.state.player,{x:at.x,y:at.y,mana:7,cooldowns:{}});
 assert.equal(G.helpStationCandidate().kind,'easyMode');r.taps.add('a');G.updatePlayer(.05);
 assert.equal(G.fieldKit.isOpen(),false);assert.equal(G.state.player.cooldowns.slap,undefined);assert.equal(G.comfortSetting('easyMode'),true);
 G.fieldKit.close();const e=G.makeEnemy('slime',at.x+12,at.y);G.state.enemies=[e];assert.equal(G.helpStationCandidate(),null);r.taps.add('a');G.updatePlayer(.05);assert.equal(G.fieldKit.isOpen(),false);assert.ok(G.state.player.cooldowns.slap>0);
 G.state.enemies=[];G.state.projectiles=[{x:at.x+10,y:at.y,fromPlayer:false}];assert.equal(G.helpStationCandidate(),null);
});
test('choosing standard extinguishes both saved help lights without refilling or rewarding the player',()=>{
 const r=runtime(),{G}=r;r.load();G.setComfortSetting('easyMode',true);G.setComfortSetting('bossAssistance',true);
 G.beginStorySession(null);r.drain();assert.equal(G.fieldKit.isOpen(),false);assert.ok(G.fieldKit.openLanterns());assert.ok(G.comfortSetting('easyMode'));assert.ok(G.comfortSetting('bossAssistance'),'opening respects existing choices until an actual selection');
 Object.assign(G.state.player,{mana:3,damageTaken:1});const before=JSON.stringify({items:G.state.items,stars:G.state.stars,quests:G.questsDone});
 assert.ok(G.fieldKit.chooseStandard());assert.equal(G.comfortSetting('easyMode'),false);assert.equal(G.comfortSetting('bossAssistance'),false);assert.equal(G.state.player.mana,3);assert.equal(G.state.player.damageTaken,1);
 assert.equal(JSON.stringify({items:G.state.items,stars:G.state.stars,quests:G.questsDone}),before);
 assert.deepEqual(JSON.parse(r.storage.get('nobodys-quest-comfort-v1')),{easyMode:false,bossAssistance:false});
 G.fieldKit.close();G.beginOpening();r.drain();assert.equal(G.fieldKit.isOpen(),false);
});
test('standard selection is unavailable outside the lantern chooser and never substitutes for a pocket action',()=>{
 const r=runtime(),{G}=r;r.load('town');G.setComfortSetting('easyMode',true);G.setComfortSetting('bossAssistance',true);
 assert.equal(G.fieldKit.chooseStandard(),false);assert.ok(G.fieldKit.openPockets());assert.equal(G.fieldKit.chooseStandard(),false);assert.ok(G.comfortSetting('easyMode'));assert.ok(G.comfortSetting('bossAssistance'));G.fieldKit.close();
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

test('old arrival and lantern-introduction flags never reopen configuration or overwrite saved help',()=>{
 const r=runtime(),{G}=r;r.load();G.setComfortSetting('easyMode',true);
 for(const seen of [['arrival'],['arrival','help-lanterns'],[]]){
  G.state.opening.seen=seen.slice();G.beginOpening();r.drain();assert.equal(G.fieldKit.isOpen(),false);assert.ok(G.comfortSetting('easyMode'));
 }
});

test('dungeon and guardian approaches offer help before entry, including the closed orchard arch and all coastal trials',()=>{
 const r=runtime(),{G}=r;let approaches=0;
 for(const id of Object.keys(G.maps)){
  r.load(id);
  for(let y=0;y<G.state.mapH;y++)for(let x=0;x<G.state.mapW;x++){
   const dest=G.maps[G.state.grid[y][x].portal?.map];
   if(!dest||dest.worldwake||dest.worldbearer)continue;
   if(!dest.bossTrial&&!Object.values(dest.legend||{}).some(c=>G.enemies[c.enemy]?.miniboss)&&!['dungeon','starfallRuins'].includes(dest.id))continue;
   approaches++;
   for(const kind of ['easyMode','bossAssistance']){
    const lamp=G.helpStations().find(s=>s.approach===dest.id&&s.kind===kind&&Math.hypot(s.x-(x*16+8),s.y-(y*16+8))<=128);
    assert.ok(lamp,`${id} -> ${dest.id}: ${kind} outside the door`);
    assert.ok(G.world.isSafeSpawn(lamp.x,lamp.y));
    assert.ok(G.state.enemies.every(e=>e.dead||e.def.practice||Math.hypot(e.x-lamp.x,e.y-lamp.y)>=72),'preparation is outside enemy attention');
   }
  }
 }
 assert.equal(approaches,22,'all current entrances, not just the first boss');
 r.load('orchardRoad');assert.equal(G.state.opening.bell,false);
 const lamps=G.helpStations().filter(s=>s.approach==='heartwood');assert.equal(lamps.length,2);
 for(const lamp of lamps){assert.ok(lamp.y>=5*16+8,'help stays below the locked roots');Object.assign(G.state.player,{x:lamp.x,y:lamp.y});assert.equal(G.helpStationCandidate()?.kind,lamp.kind);}
 r.load('shattercoast');assert.equal(G.helpStations().filter(s=>s.approach).length,10,'return points on portals still produce coastal lamps');
});

test('lamp prompts show complete effects and stay in one bounded dock across movement and switching',()=>{
 const r=runtime(),{G}=r;r.load();G.state.enemies=[];
 const at=G.helpStations().find(s=>s.kind==='easyMode'),p=G.state.player;Object.assign(p,{x:at.x,y:at.y});
 const paint=[],boxes=[],c=new Proxy({measureText:t=>({width:t.length*5}),fillRect:(x,y,w,h)=>boxes.push({x,y,w,h}),fillText:(text,x,y)=>paint.push({text,x,y})},{get:(o,k)=>o[k]||(()=>{})});
 for(const mode of ['keyboard','touch','controller']){
  G.input.isTouch=mode==='touch';G.input.hasGamepad=mode==='controller';paint.length=boxes.length=0;
  const cam={x:p.x-160,y:p.y-148};assert.equal(G.drawOpeningPrompt(c,cam),true);
  assert.match(paint.map(p=>p.text).join(' '),/Optional help: hearts grow back, even in fights\./);
  assert.match(paint.map(p=>p.text).join(' '),/Heart Lantern · Light/);
  const panel=boxes[0];assert.ok(panel.x>=0&&panel.x+panel.w<=G.W&&panel.y>=0&&panel.y+panel.h<=G.H);
  assert.ok(paint.every(p=>p.x+c.measureText(p.text).width<=panel.x+panel.w-8),'no clipped effect or action');
  paint.length=boxes.length=0;G.drawOpeningPrompt(c,{x:cam.x,y:cam.y+35});assert.equal(boxes[0].y,panel.y,'moving camera cannot reshuffle the dock');
  G.setComfortSetting('easyMode',true);paint.length=boxes.length=0;G.drawOpeningPrompt(c,cam);assert.equal(boxes[0].y,panel.y);assert.match(paint.map(p=>p.text).join(' '),/Put out/);G.setComfortSetting('easyMode',false);
 }
});
