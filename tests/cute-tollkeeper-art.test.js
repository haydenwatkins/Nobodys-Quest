const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');

test('the bronze Tollkeeper retains its footprint and every guardian pose in both pixel settings',()=>{
  const r=runtime(),{G}=r;r.load('tollCourt');r.drain();const e=G.state.enemies.find(e=>e.id==='tollkeeper');assert.equal(e.def.sprite,G.enemies.tollkeeper.sprite);assert.equal(e.def.size,30);assert.equal(e.def.hp,40);
  for(const hd of [true,false]){G.hdPilot=hd;const s=G.activeSpriteDefinition(e.def.sprite),m=G.spriteMetrics(e.def.sprite);assert.equal(m.w,52);assert.equal(m.h,55);assert.equal(s.frames.length,4);assert.equal(s.animations.attack[0],2);assert.notDeepEqual(s.frames[0],s.frames[2]);for(const frame of s.frames)for(const row of frame)for(const p of row)assert.ok(p==='.'||s.palette[p]);}
});

test('the real flood warning raises the held lantern and cancellation returns to the resting pose',()=>{
  const r=runtime(),{G}=r;r.load('tollCourt');r.drain();const e=G.state.enemies.find(e=>e.id==='tollkeeper'),p=G.state.player;
  G.state.opening.complete=true;G.state.delivery.started=true;G.state.enemies=[e];G.state.bossCutscene=null;Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:1,bossTelegraphT:0,bossChargeT:0,anim:0});
  const frames=[],ctx=new Proxy({},{get:()=>()=>{},set:()=>true});G.drawSprite=(c,s,f)=>{assert.equal(s,e.def.sprite);frames.push(f);};
  for(const hd of [true,false]){G.hdPilot=hd;e.openingTimer=0;e.openingBeat=0;G.state.openingHazards=[];G.drawEnemy(ctx,e);assert.equal(frames.pop(),0);
    G.updateOrchardBoss(e,p,.01);const h=G.state.openingHazards[0];assert.equal(h.kind,'flood');assert.ok(h.warn>0);G.drawEnemy(ctx,e);assert.equal(frames.pop(),2);
    G.cancelBossHazards(e);assert.equal(G.state.openingHazards.length,0);G.drawEnemy(ctx,e);assert.equal(frames.pop(),0);
  }
});
