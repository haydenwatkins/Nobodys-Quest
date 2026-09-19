const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
const caches=[['windscarCanyon','windscar-feather'],['hangingGardens','garden-keystone'],['rootdeepHollow','rootdeep-silk'],['glasswaterDesert','glasswater-prism'],['frostbellTundra','frostbell-chime'],['stormspinePeaks','stormglass-lantern'],['titanGrave','titan-memory']];
test('old saves retain opened treasure after all seven regional caches move',()=>{
 const r=runtime(),{G}=r;let pickups=0;G.events.on('pickup',()=>pickups++);
 for(const [map,item]of caches){G.state.items.push(item);G.state.opened.push(map+':27,14');r.load(map);r.drain();G.state.enemies=[];const ch=G.state.chests.find(c=>c.chest.item===item);assert.ok(ch.opened,map);assert.ok(G.state.opened.includes(ch.key));G.state.player.damageTaken=2;Object.assign(G.state.player,{x:ch.x*16+8,y:ch.y*16+8});G.world.checkTriggers(.5);assert.equal(G.state.items.filter(i=>i===item).length,1);assert.equal(G.state.player.damageTaken,2,'moved treasure must not heal again');}
 assert.equal(pickups,0);G.saveGame();const saved=G.loadSaveData();assert.ok(saved);for(const [map,item]of caches){assert.ok(saved.items.includes(item));assert.ok(saved.opened.some(k=>k.startsWith(map+':')&&k!==map+':27,14'));}
});
test('new explorers earn relocated treasure once and keep it across travel and saving',()=>{
 const r=runtime(),{G}=r;r.load('glasswaterDesert');r.drain();G.state.enemies=[];const ch=G.state.chests.find(c=>c.chest.item==='glasswater-prism');let pickups=0;G.events.on('pickup',e=>{if(e.item==='glasswater-prism')pickups++;});
 Object.assign(G.state.player,{x:ch.x*16+8,y:ch.y*16+8,damageTaken:2});G.world.checkTriggers(.5);r.drain();assert.equal(pickups,1);assert.equal(G.state.player.damageTaken,0);r.load('rootdeepHollow');r.load('glasswaterDesert');r.drain();assert.ok(G.state.chests.find(c=>c.chest.item==='glasswater-prism').opened);G.saveGame();assert.equal(G.loadSaveData().items.filter(i=>i==='glasswater-prism').length,1);
});
test('an item awarded while its chest is loaded cannot pay or heal again',()=>{
 const r=runtime(),{G}=r;r.load('glasswaterDesert');r.drain();G.state.enemies=[];const ch=G.state.chests.find(c=>c.chest.item==='glasswater-prism');G.state.items.push('glasswater-prism');Object.assign(G.state.player,{x:ch.x*16+8,y:ch.y*16+8,damageTaken:2});G.world.checkTriggers(.5);assert.ok(ch.opened);assert.equal(G.state.items.filter(i=>i==='glasswater-prism').length,1);assert.equal(G.state.player.damageTaken,2);
});
