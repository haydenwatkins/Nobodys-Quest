const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');

test('Brewer and Conductor retain their footprints, dyes, skins and directional gestures',()=>{
  const {G}=runtime();G.state.costumeId='trailblazer';G.state.costumesUnlocked=['classic','trailblazer'];
  for(const [id,size]of [['alchemist',18],['stormcaller',19]]){
    const source=G.forms[id].sprite;
    for(const sprite of [source,G.costumedSprite(source),G.signatureSprite(source,G.skinForForm(id))])for(const hd of [true,false]){
      G.hdPilot=hd;const active=G.activeSpriteDefinition(sprite);
      if(sprite===source){assert.equal(G.spriteMetrics(sprite).w,size);assert.equal(G.spriteMetrics(sprite).h,size);}
      assert.equal(active.frames.length,48);
      for(const dir of ['south','east','north','west']){
        const set=active.directional[dir];assert.equal(set.walk.length,6);assert.equal(set.attack.length,3);
        assert.notDeepEqual(active.frames[set.walk[1]],active.frames[set.walk[4]]);
        assert.notDeepEqual(active.frames[set.attack[0]],active.frames[set.attack[1]]);
        for(const ids of Object.values(set))for(const i of ids)for(const row of active.frames[i])for(const pixel of row)assert.ok(pixel==='.'||active.palette[pixel]);
      }
      assert.notDeepEqual(active.frames[active.directional.south.idle[0]],active.frames[active.directional.north.idle[0]]);
    }
  }
});

test('new gestures preserve immediate Bottle Bonk damage and a single Storm Spark',()=>{
  for(const [id,ability]of [['alchemist','bottleBonk'],['stormcaller','stormSpark']]){
    const r=runtime(),{G}=r;r.load('lanternReach');r.drain();G.state.formId=id;
    const p=G.state.player,mana=G.playerMaxMana();Object.assign(p,{x:360,y:248,dir:{x:1,y:0},mana});
    const foe=G.makeEnemy('slime',374,248);foe.hp=30;G.state.enemies=id==='alchemist'?[foe]:[];
    assert.equal(G.beginFormPerformance(p,ability),false);r.taps.add('a');G.updatePlayer(.01);
    assert.equal(p.performance,null);assert.equal(p.x,360);assert.equal(p.y,248);assert.equal(p.mana,mana);assert.ok(p.cooldowns[ability]>.3);
    assert.ok(p.attackPose);assert.ok(G.forms[id].sprite.hd.frames[G.performanceFrame(G.forms[id].sprite,p,0)]);
    if(id==='alchemist'){assert.equal(foe.hp,29);G.updatePlayer(.1);assert.equal(foe.hp,29);}
    else{assert.equal(G.state.projectiles.length,1);assert.equal(G.state.projectiles[0].vx,215);G.updatePlayer(.1);assert.equal(G.state.projectiles.length,1);}
    assert.equal(p.attackPose,null);
  }
});
