const {test}=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');

test('Vesper keeps all four boss indices and the existing court footprint',()=>{
  const {G}=runtime(),sprite=G.enemies.countessCarmine.sprite;
  for(const hd of [true,false]){
    G.hdPilot=hd;const active=G.activeSpriteDefinition(sprite),m=G.spriteMetrics(sprite);
    assert.equal(m.w,25);assert.equal(m.h,25);assert.equal(active.frames.length,4);
    assert.notDeepEqual(active.frames[0],active.frames[2]);
    for(const frame of active.frames)for(const row of frame)for(const px of row)assert.ok(px==='.'||active.palette[px]);
  }
});
test('Vampire keeps its world footprint and directional poses through dyes and both rendering resolutions',()=>{
  const {G}=runtime();const source=G.forms.vampire.sprite;
  G.state.costumeId='trailblazer';G.state.costumesUnlocked=['classic','trailblazer'];
  for(const [sprite,footprint]of [[source,20],[G.costumedSprite(source),20],[G.signatureSprite(source,G.skinForForm('vampire')),20]]){
    for(const hd of [true,false]){
      G.hdPilot=hd;const active=G.activeSpriteDefinition(sprite),metrics=G.spriteMetrics(sprite);
      const expected=footprint; // Every appearance keeps the authored silhouette.
      assert.equal(metrics.w,expected);assert.equal(metrics.h,expected);
      for(const dir of ['south','east','north','west']){
        for(const mode of ['idle','walk','attack'])for(const index of active.directional[dir][mode]){
          const frame=active.frames[index];assert.ok(frame&&frame.some(row=>/[^. ]/.test(row)));
          for(const row of frame)for(const pixel of row)assert.ok(pixel==='.'||pixel===' '||active.palette[pixel]);
        }
        assert.notDeepEqual(active.frames[active.directional[dir].attack[0]],active.frames[active.directional[dir].idle[0]]);
      }
      assert.notDeepEqual(active.frames[active.directional.north.idle[0]],active.frames[active.directional.south.idle[0]]);
    }
  }
});
test('an immediate Blood Bite uses its live directional pose without delaying hits or hiding behind the walk animation',()=>{
  const {G}=runtime();G.world.load('emberRidge');G.state.formId='vampire';
  const p=G.state.player;p.x=160;p.y=144;p.dir={x:1,y:0};p.moving=true;
  const e=G.makeEnemy('slime',180,144);e.hp=50;G.state.enemies=[e];
  assert.equal(G.beginFormPerformance(p,'bloodBite'),false);
  G.abilities.bloodBite.use(p);assert.ok(e.hp<50);assert.ok(p.attackPose);assert.ok(!p.performance);
  for(const hd of [true,false]){
    G.hdPilot=hd;const sprite=G.forms.vampire.sprite,set=G.activeSpriteDefinition(sprite).directional.east;
    for(const [phase,beat]of [[1,0],[.5,1],[.01,2]]){
      p.attackPose.t=p.attackPose.dur*phase;assert.equal(G.performanceFrame(sprite,p,0),set.attack[beat]);
    }
    p.attackPose=null;assert.equal(G.performanceFrame(sprite,p,0),set.walk[0]);
    // Restore the existing combat pose for the second rendering mode.
    p.attackPose={t:.09,dur:.09,x:2,y:0};
  }
  assert.equal(G.forms.vampire.speed,105);assert.equal(G.forms.vampire.hearts,5);
});
