const {test}=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');
test('Vampire keeps its world footprint and directional poses through dyes and both rendering resolutions',()=>{
  const {G}=runtime();const source=G.forms.vampire.sprite;
  G.state.costumeId='trailblazer';G.state.costumesUnlocked=['classic','trailblazer'];
  for(const [sprite,footprint]of [[source,20],[G.costumedSprite(source),20],[G.signatureSprite(source,G.skinForForm('vampire')),25]]){
    for(const hd of [true,false]){
      G.hdPilot=hd;const active=G.activeSpriteDefinition(sprite),metrics=G.spriteMetrics(sprite);
      const expected=footprint===25&&!hd?30:footprint; // Existing signature ornaments pad each source grid by five pixels.
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
