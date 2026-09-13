'use strict';
const assert=require('node:assert/strict');
const r=require('../tools/lib/classic-runtime.cjs')(),{G}=r;
r.load('lanternReach');G.state.claimedForms=['rat','knight','ranger'];G.state.known=['nobody','rat','knight','ranger'];G.state.formId='ranger';
const p=G.state.player;p.x=33*16+8;p.y=15*16+8;p.dir={x:1,y:0};r.drain();
// Exercise the real input and cooldown path, not just the animation helper.
r.taps.add('a');G.updatePlayer(.01);assert.ok(p.performance);assert.equal(G.state.projectiles.length,0);
G.input.vec={x:0,y:1};G.updatePlayer(.04);assert.equal(G.state.projectiles.length,0);
G.updatePlayer(.06);assert.equal(G.state.projectiles.length,1);
const arrow=G.state.projectiles[0];assert.ok(arrow.vx>0);assert.equal(arrow.vy,0,'moving during draw cannot silently redirect the released shot');
assert.equal(p.dir.y,1,'movement facing is restored after firing');
G.updatePlayer(.2);assert.equal(G.state.projectiles.length,1,'release fires once');
G.input.vec={x:0,y:0};G.beginFormPerformance(p,'arrow');G.setForm('rat');G.updateFormPerformance(.2);assert.equal(G.state.projectiles.length,1,'shifting cancels an unreleased shot');
G.state.formId='ranger';G.beginFormPerformance(p,'arrow');G.world.load('sunriseQuay');assert.equal(p.performance,null);G.updateFormPerformance(.2);assert.equal(G.state.projectiles.length,0,'travel cancels windup and clears old projectiles');
for(const costume of ['classic','trailblazer']){
  G.state.costumeId=costume;const spr=G.costumedSprite(G.forms.ranger.sprite);
  for(const hd of [false,true]){G.hdPilot=hd;const active=G.activeSpriteDefinition(spr);
    for(const [dir,v]of Object.entries({south:{x:0,y:1},east:{x:1,y:0},north:{x:0,y:-1},west:{x:-1,y:0}})){
      p.dir=v;p.moving=false;p.performance=null;
      assert.equal(active.directional[dir].walk.length,6);assert.equal(active.directional[dir].attack.length,3);
      assert.ok(active.frames[G.performanceFrame(spr,p,0)]);
      G.beginFormPerformance(p,'arrow');const before=G.performanceFrame(spr,p,0);p.performance.t=.1;const after=G.performanceFrame(spr,p,0);assert.notEqual(before,after);p.performance=null;
    }
  }
}
console.log('Ranger: input timing, fixed release aim, once-only shot, shift/travel cancellation, and all dyed directional poses passed.');
