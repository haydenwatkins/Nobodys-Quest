'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(){
 const r=runtime(),{G}=r;r.load('vampireTrial');r.drain();const e=G.state.enemies.find(e=>e.id==='countessCarmine');G.state.enemies=[e];G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:1,bossSpecialT:.001,bossPattern:0});Object.assign(G.state.player,{x:e.x-60,y:e.y,dir:{x:1,y:0},mana:0,manaRegenDelay:1000,damageTaken:0,invuln:0});r.step(.025);r.drain();const cover=G.state.enemies.find(c=>c.moonCover?.owner===e);assert.ok(cover);
 Object.assign(G.state.player,{x:cover.x-18,y:cover.y,dir:{x:1,y:0}});G.input.takeAim=()=>({x:1,y:0,dragged:true});r.taps.add('a');for(let i=0;i<10&&!cover.moonCover.lit;i++){r.step(.025);r.drain();}assert.ok(cover.moonCover.lit);G.state.player.y+=65;
 for(let i=0;i<60&&!e.duskCounters;i++){r.step(.025);r.drain();}assert.equal(e.duskCounters,1);return {...r,e,cover};
}
test('a real light catch keeps the committed dash and waltz, exposing one reachable normal-attack shadow',()=>{
 const r=setup(),{G,e}=r;assert.ok(e.bossChargeT>0,'the actual dash keeps moving');assert.equal(e.bossStaggerT||0,0);assert.equal(e.hp,58);assert.equal(e.ward.hp,6);
 for(let i=0;i<25&&!G.state.bossHazards.some(h=>h.owner===e&&h.kind==='crimsonWaltz');i++)r.step(.025);
 const h=G.state.bossHazards.find(h=>h.owner===e&&h.kind==='crimsonWaltz');assert.ok(h);const shadow=G.duskShadowPoint(e);assert.ok(shadow);assert.ok(Math.hypot(shadow.x-e.x,shadow.y-e.y)>35,'shadow offers a different reachable contact');
 e.ward.hp=0;Object.assign(G.state.player,{x:shadow.x-18,y:shadow.y,dir:{x:1,y:0}});let hits=0,kills=0;G.events.on('hit',a=>{assert.equal(a.enemy,'countessCarmine');hits++;});G.events.on('kill',()=>kills++);G.state.player.cooldowns.slap=0;r.taps.add('a');for(let i=0;i<12&&e.hp===58;i++){r.step(.025);r.drain();}assert.equal(e.hp,57,JSON.stringify({p:{x:G.state.player.x,y:G.state.player.y,cd:G.state.player.cooldowns,dir:G.state.player.dir},shadow,current:G.duskShadowPoint(e),hitStop:G.state.hitStop,stagger:e.bossStaggerT,enemies:G.state.enemies.map(z=>({id:z.id,x:z.x,y:z.y,dead:z.dead})),messages:r.messages.slice(-3)}));assert.equal(hits,1);assert.equal(kills,0);assert.equal(e.duskShadowHits,1);assert.equal(e.bossStaggerT||0,0);assert.ok(G.state.bossHazards.includes(h));assert.ok(G.loadSaveData().guardianChallenges.vesper.bestShadowHits>=1);
});
