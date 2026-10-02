const {test}=require('node:test');
const assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');

test('every native wildlife kind has four authored poses in both pixel settings',()=>{
  const {G}=runtime(), seen=new Set();
  G.state.opening.complete=true;G.state.delivery.complete=true;
  for(const id of Object.keys(G.maps)) {
    G.world.load(id);
    for(const animal of G.state.wildlife) seen.add(animal.kind);
  }
  assert.equal(seen.size,12);
  assert.deepEqual([...seen].sort(),Object.keys(G.wildlifeArt).sort());
  for(const hd of [true,false]) {
    G.hdPilot=hd;
    for(const sprite of Object.values(G.wildlifeArt)) {
      const active=G.activeSpriteDefinition(sprite);
      assert.equal(active.frames.length,4);
      assert.equal(G.spriteMetrics(sprite).w,12);
      assert.equal(G.spriteMetrics(sprite).h,10);
      for(const frame of active.frames) {
        assert.equal(frame.length,hd?20:10);
        for(const row of frame) {
          assert.equal(row.length,hd?24:12);
          for(const pixel of row) assert.ok(pixel==='.'||active.palette[pixel]);
        }
      }
    }
  }
});

test('drawing wildlife preserves creatures, habitat, progress and Canvas state',()=>{
  const {G}=runtime(),stack=[],draws=[];
  const ctx={globalAlpha:.8,fillStyle:'parent',save(){stack.push([this.globalAlpha,this.fillStyle]);},restore(){[this.globalAlpha,this.fillStyle]=stack.pop();},fillRect(){}};
  G.state.opening.complete=true;G.state.delivery.complete=true;G.world.load('sunkenMarsh');
  const before=JSON.stringify(G.state);
  G.drawSprite=(c,s,f,x,y,flip)=>draws.push({s,f,x,y,flip,alpha:c.globalAlpha});
  for(const animal of G.state.wildlife) G.drawWildlife(ctx,animal);
  assert.equal(JSON.stringify(G.state),before);
  assert.equal(draws.length,G.state.wildlife.length);
  assert.equal(ctx.globalAlpha,.8);assert.equal(ctx.fillStyle,'parent');assert.equal(stack.length,0);
  for(let i=0;i<draws.length;i++) {
    const animal=G.state.wildlife[i],draw=draws[i];
    assert.equal(draw.s,G.wildlifeArt[animal.kind]);
    assert.equal(draw.flip,animal.facingLeft);
    assert.equal(draw.alpha,animal.def.aquatic?.8*.75:.8);
  }
  const startled=G.state.wildlife.find(a=>a.kind==='frog');
  Object.assign(G.state.player,{x:startled.x+3,y:startled.y,dashing:{t:.1}});
  G.updateLivingWorld(.016);
  assert.ok(startled.fleeT>1);
  assert.equal(startled.boxW,4);assert.equal(startled.boxH,3);
});

test('reduced motion holds authored poses and bobbing without changing facing or flee timers',()=>{
  const {G}=runtime(),stack=[],draws=[];
  const ctx={globalAlpha:1,save(){stack.push(this.globalAlpha);},restore(){this.globalAlpha=stack.pop();},fillRect(){}};
  G.drawSprite=(c,s,f,x,y,flip)=>draws.push({f,x,y,flip});
  for(const kind of Object.keys(G.wildlifeArt)) for(const facingLeft of [false,true]) {
    const animal={kind,def:{flying:true},x:101.3,y:94.2,facingLeft,phase:0,fleeT:.7};
    G.reducedMotion=true;draws.length=0;
    for(const phase of [0,1,2,3]) {animal.phase=phase;G.drawWildlife(ctx,animal);}
    assert.ok(draws.every(d=>d.f===0&&d.x===101&&d.y===98&&d.flip===facingLeft));
    assert.equal(animal.fleeT,.7);
    G.reducedMotion=false;draws.length=0;
    for(let f=0;f<4;f++) {animal.phase=(f+.1)/1.7;G.drawWildlife(ctx,animal);}
    assert.deepEqual(draws.map(d=>d.f),[0,1,2,3]);
  }
});
