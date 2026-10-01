const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');

test('Errata uses the archivist portrait rather than matching RAT inside her name',()=>{
  const r=runtime(),{G}=r;r.load('lanternReach');r.drain();
  const drawn=[],noop=()=>{},c=new Proxy({measureText:t=>({width:t.length*4})},{get:(o,k)=>o[k]||noop,set:(o,k,v)=>(o[k]=v,true)});
  G.drawSprite=(_ctx,sprite)=>drawn.push(sprite);
  for(const [speaker,sprite]of [['ARCHIVIST ERRATA',G.NPCS.errata.sprite],['RAT',G.forms.rat.sprite],['PATCHLING',G.forms.nobody.sprite]]){
    drawn.length=0;assert.equal(G.drawOpeningDialogue(c,{speaker,text:'The road remembers.',shown:99},t=>[t]),true);assert.equal(drawn[0],sprite);
  }
});

test('Hearthdrake and Wayglass art preserve every footprint, facing, dye and signature pose',()=>{
  const {G}=runtime();G.state.costumeId='trailblazer';G.state.costumesUnlocked=['classic','trailblazer'];
  for(const [id,w,h]of [['dragon',28,19],['riftblade',19,19]]){
    const source=G.forms[id].sprite;
    for(const sprite of [source,G.costumedSprite(source),G.signatureSprite(source,G.skinForForm(id))])for(const hd of [true,false]){
      G.hdPilot=hd;const active=G.activeSpriteDefinition(sprite);
      if(sprite===source){assert.equal(G.spriteMetrics(sprite).w,w);assert.equal(G.spriteMetrics(sprite).h,h);}
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
  const sprite=G.enemies.riftbladeAdept.sprite;
  for(const hd of [true,false]){G.hdPilot=hd;assert.equal(G.spriteMetrics(sprite).w,25);assert.equal(G.spriteMetrics(sprite).h,24);const active=G.activeSpriteDefinition(sprite);assert.equal(active.frames.length,4);assert.notDeepEqual(active.frames[0],active.frames[2]);for(const frame of active.frames)for(const row of frame)for(const pixel of row)assert.ok(pixel==='.'||active.palette[pixel]);}
});

test('new gestures keep immediate tail/cut damage and the real three-cut rhythm',()=>{
  for(const [id,ability]of [['dragon','tailSweep'],['riftblade','riftCut']]){
    const r=runtime(),{G}=r;r.load('lanternReach');r.drain();G.state.formId=id;
    const p=G.state.player;Object.assign(p,{x:360,y:248,dir:{x:1,y:0},mana:G.playerMaxMana()});
    const foe=G.makeEnemy('slime',376,248);foe.hp=30;G.state.enemies=[foe];
    assert.equal(G.beginFormPerformance(p,ability),false);r.taps.add('a');G.updatePlayer(.01);
    assert.equal(foe.hp,29);assert.equal(p.performance,null);assert.equal(p.x,360);assert.equal(p.y,248);
    assert.ok(p.attackPose);assert.ok(G.forms[id].sprite.hd.frames[G.performanceFrame(G.forms[id].sprite,p,0)]);
    G.updatePlayer(.4);assert.equal(foe.hp,29);assert.equal(p.attackPose,null);
    if(id==='riftblade'){
      G.state.time+=.4;r.taps.add('a');G.updatePlayer(.01);assert.equal(p.riftCutCombo,2);
      G.updatePlayer(.4);G.state.time+=.4;r.taps.add('a');G.updatePlayer(.01);assert.equal(p.riftCutCombo,3);
      assert.equal(foe.hp,27);
    }
  }
});
