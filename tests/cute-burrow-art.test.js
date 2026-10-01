const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');

test('Tunneltuft and Bram preserve footprints, poses and appearance compatibility',()=>{
  const {G}=runtime();G.state.costumeId='trailblazer';
  const source=G.forms.mole.sprite;
  for(const sprite of [source,G.costumedSprite(source),G.signatureSprite(source,G.skinForForm('mole'))])for(const hd of [true,false]){
    G.hdPilot=hd;const active=G.activeSpriteDefinition(sprite);
    if(sprite===source){assert.equal(G.spriteMetrics(sprite).w,19);assert.equal(G.spriteMetrics(sprite).h,15);}
    assert.equal(active.frames.length,48);
    for(const dir of ['south','east','north','west']){
      const set=active.directional[dir];assert.equal(set.walk.length,6);assert.equal(set.attack.length,3);
      assert.notDeepEqual(active.frames[set.attack[0]],active.frames[set.attack[1]]);
      for(const ids of Object.values(set))for(const i of ids)for(const row of active.frames[i])for(const px of row)assert.ok(px==='.'||active.palette[px]);
    }
    assert.notDeepEqual(active.frames[active.directional.south.idle[0]],active.frames[active.directional.north.idle[0]]);
  }
  for(const hd of [true,false]){G.hdPilot=hd;const sprite=G.enemies.moleMonarch.sprite,active=G.activeSpriteDefinition(sprite);
    assert.equal(G.spriteMetrics(sprite).w,26);assert.equal(G.spriteMetrics(sprite).h,21);assert.equal(active.frames.length,4);
    assert.notDeepEqual(active.frames[0],active.frames[2]);
    for(const frame of active.frames)for(const row of frame)for(const px of row)assert.ok(px==='.'||active.palette[px]);
  }
});

test('Tunneltuft still strikes immediately and earns the third-tap eruption through real input',()=>{
  const r=runtime(),{G}=r;r.load('lanternReach');r.drain();G.state.formId='mole';
  const p=G.state.player;Object.assign(p,{x:360,y:248,dir:{x:1,y:0},mana:G.playerMaxMana()});
  const foe=G.makeEnemy('slime',376,248);foe.hp=30;G.state.enemies=[foe];
  assert.equal(G.beginFormPerformance(p,'drillTap'),false);
  for(let beat=1;beat<=3;beat++){
    r.taps.add('a');G.updatePlayer(.01);assert.equal(foe.hp,30-beat);assert.equal(p.drillTapCombo,beat);
    assert.equal(p.performance,null);assert.equal(p.x,360);assert.equal(p.y,248);assert.ok(p.attackPose);
    assert.ok(G.forms.mole.sprite.hd.frames[G.performanceFrame(G.forms.mole.sprite,p,0)]);
    if(beat===3)assert.ok(foe.status.stun.dur>0);
    G.updatePlayer(.4);G.state.time+=.4;assert.equal(foe.hp,30-beat);
  }
});
