const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
test('Scout and Sage keep dimensions, all directions, articulated poses and skin/dye support',()=>{
  const {G}=runtime();G.state.costumeId='trailblazer';G.state.costumesUnlocked=['classic','trailblazer'];
  for(const [id,w,h]of [['ranger',29,26],['wizard',18,19]]){
    const source=G.forms[id].sprite;
    for(const sprite of [source,G.costumedSprite(source),G.signatureSprite(source,G.skinForForm(id))])for(const hd of [true,false]){
      G.hdPilot=hd;const a=G.activeSpriteDefinition(sprite);
      if(sprite===source){assert.equal(G.spriteMetrics(sprite).w,w);assert.equal(G.spriteMetrics(sprite).h,h);}
      assert.equal(a.frames.length,48);
      for(const dir of ['south','east','north','west']){
        const set=a.directional[dir];assert.equal(set.walk.length,6);assert.equal(set.attack.length,3);
        assert.notDeepEqual(a.frames[set.attack[0]],a.frames[set.attack[1]]);
        assert.notDeepEqual(a.frames[set.walk[1]],a.frames[set.walk[4]]);
        for(const frames of Object.values(set))for(const i of frames)for(const row of a.frames[i])for(const pixel of row)assert.ok(pixel==='.'||a.palette[pixel]);
      }
      assert.notDeepEqual(a.frames[a.directional.north.idle[0]],a.frames[a.directional.south.idle[0]]);
    }
  }
  assert.equal(G.forms.ranger.name,'Bramble Scout');assert.equal(G.forms.wizard.name,'Starwick Sage');
});
test('Sage casting adds no windup, extra shot, or movement to the real Curse cast',()=>{
  const r=runtime(),{G}=r;r.load('lanternReach');r.drain();G.state.formId='wizard';
  const p=G.state.player;Object.assign(p,{x:360,y:248,dir:{x:1,y:0},mana:6});G.state.enemies=[];
  assert.equal(G.beginFormPerformance(p,'curse'),false);r.taps.add('a');G.updatePlayer(.01);
  assert.equal(G.state.projectiles.length,1);assert.equal(G.state.projectiles[0].ability,'curse');assert.equal(G.state.projectiles[0].vx,165);
  assert.equal(p.x,360);assert.equal(p.y,248);assert.equal(p.mana,6);assert.ok(p.cooldowns.curse>.5);assert.equal(p.performance,null);
  assert.ok(p.attackPose);assert.ok(G.forms.wizard.sprite.hd.frames[G.performanceFrame(G.forms.wizard.sprite,p,0)]);
  G.updatePlayer(.1);assert.equal(G.state.projectiles.length,1);assert.equal(p.attackPose,null);
});
