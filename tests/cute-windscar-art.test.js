const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');

test('Windscar roadkeepers preserve all footprints, directions and earned looks',()=>{
  const {G}=runtime(),source=G.forms.griffin.sprite;G.state.costumeId='trailblazer';
  for(const sprite of [source,G.costumedSprite(source),G.signatureSprite(source,G.skinForForm('griffin'))])for(const hd of [true,false]){
    G.hdPilot=hd;const m=G.spriteMetrics(sprite),s=G.activeSpriteDefinition(sprite);assert.equal(m.w,28);assert.equal(m.h,19);assert.equal(s.frames.length,48);
    for(const dir of ['south','east','north','west']){const set=s.directional[dir];assert.equal(set.walk.length,6);assert.equal(set.attack.length,3);
      assert.notDeepEqual(s.frames[set.attack[0]],s.frames[set.attack[1]]);assert.notDeepEqual(s.frames[set.attack[1]],s.frames[set.attack[2]]);
      for(const ids of Object.values(set))for(const i of ids)for(const row of s.frames[i])for(const p of row)assert.ok(p==='.'||s.palette[p]);}
    assert.notDeepEqual(s.frames[s.directional.south.idle[0]],s.frames[s.directional.north.idle[0]]);
  }
  for(const hd of [true,false]){G.hdPilot=hd;const sprite=G.enemies.skySovereign.sprite,m=G.spriteMetrics(sprite),s=G.activeSpriteDefinition(sprite);assert.equal(m.w,30);assert.equal(m.h,22);assert.equal(s.frames.length,4);assert.notDeepEqual(s.frames[0],s.frames[2]);for(const frame of s.frames)for(const row of frame)for(const p of row)assert.ok(p==='.'||s.palette[p]);}
});

test('the courier strikes immediately once, with moving Slipstream shove and paid recovery',()=>{
  for(const moving of [false,true]){
    const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.formId='griffin';G.state.enemies=[];
    const p=G.state.player;Object.assign(p,{x:240,y:152,dir:{x:1,y:0}});G.input.vec={x:moving?1:0,y:0};
    const target=G.makeEnemy('slime',264,152),rear=G.makeEnemy('slime',223,152);target.hp=rear.hp=30;G.state.enemies.push(target,rear);
    assert.equal(G.beginFormPerformance(p,'wingbeat'),false);r.taps.add('a');G.updatePlayer(.01);
    assert.equal(target.hp,29);assert.equal(rear.hp,30);assert.equal(p.performance,null);assert.ok(p.attackPose);
    assert.equal(p.cooldowns.wingbeat,.4);assert.equal(p.slipstreamT||0,moving?.7:0);
    if(moving){assert.equal(rear.kbx,-72);assert.equal(G.passives.movementScale(p),1.18);}else assert.equal(rear.kbx,0);
    G.input.vec={x:0,y:0};G.updatePlayer(.41);assert.equal(p.attackPose,null);assert.equal(p.cooldowns.wingbeat,0);assert.equal(target.hp,29);assert.equal(rear.hp,30);
  }
});
