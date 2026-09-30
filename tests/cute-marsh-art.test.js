const {test}=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');
test('marsh redesigns preserve both resolutions, footprints, original pose indexing and readable actions',()=>{
  const {G}=runtime();
  for(const [sprite,w,h]of [[G.forms.frog.sprite,17,13],[G.enemies.mireQueen.sprite,26,19]])for(const hd of [true,false]){
    G.hdPilot=hd;const a=G.activeSpriteDefinition(sprite),m=G.spriteMetrics(sprite);
    assert.equal(m.w,w);assert.equal(m.h,h);assert.equal(a.frames.length,4);assert.deepEqual(Array.from(a.animations.attack),[2]);
    assert.notDeepEqual(a.frames[0],a.frames[2]);assert.notDeepEqual(a.frames[1],a.frames[3]);
    for(const frame of a.frames)for(const row of frame)for(const key of row)assert.ok(key==='.'||a.palette[key]);
  }
  G.state.costumeId='trailblazer';G.state.costumesUnlocked=['classic','trailblazer'];
  for(const sprite of [G.costumedSprite(G.forms.frog.sprite),G.signatureSprite(G.forms.frog.sprite,G.skinForForm('frog'))]){
    assert.equal(sprite.frames.length,4);assert.equal(sprite.hd.frames.length,4);
  }
});
