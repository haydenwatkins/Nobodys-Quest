const {test}=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');
test('opening heroes and Knight retain footprints, directional poses, and dyes in both resolutions',()=>{
  const {G}=runtime();G.state.costumeId='trailblazer';G.state.costumesUnlocked=['classic','trailblazer'];
  for(const id of ['nobody','rat','knight']){
    const source=G.forms[id].sprite;
    const dyed=G.costumedSprite(source),signature=G.signatureSprite(source,G.skinForForm(id));
    for(const sprite of [source,dyed,signature])for(const hd of [true,false]){
      G.hdPilot=hd;const active=G.activeSpriteDefinition(sprite),m=G.spriteMetrics(sprite);
      // The existing skin renderer pads five source pixels on each side.
      const padding=sprite===signature?(hd?5:10):0;
      assert.equal(m.w,28+padding);assert.equal(m.h,24+padding);assert.equal(active.frames.length,48);
      for(const dir of ['south','east','north','west']){
        const set=active.directional[dir];
        for(const mode of ['idle','walk','attack','guard'])for(const i of set[mode]){
          for(const row of active.frames[i])for(const key of row)assert.ok(key==='.'||active.palette[key],`${id}/${dir} unknown color`);
          assert.ok(active.frames[i].some(row=>/[^. ]/.test(row)));
        }
        assert.notDeepEqual(active.frames[set.attack[0]],active.frames[set.attack[1]]);
        assert.notDeepEqual(active.frames[set.walk[1]],active.frames[set.walk[4]]);
      }
      assert.notDeepEqual(active.frames[active.directional.south.idle[0]],active.frames[active.directional.north.idle[0]]);
    }
  }
  for(const [sprite,w,h]of [[G.openingTreantSprite,58,54],[G.enemies.ancientTreant.sprite,27,24],[G.enemies.eclipseKnight.sprite,24,24]])for(const hd of [true,false]){
    G.hdPilot=hd;assert.equal(G.spriteMetrics(sprite).w,w);assert.equal(G.spriteMetrics(sprite).h,h);
    const active=G.activeSpriteDefinition(sprite);assert.equal(active.frames.length,4);
    assert.notDeepEqual(active.frames[0],active.frames[2]);
    for(const frame of active.frames)for(const row of frame)for(const key of row)assert.ok(key==='.'||active.palette[key]);
  }
});
test('opening heroes keep their real attacks and guardians keep their battle art',()=>{
  for(const [id,ability,delay]of [['nobody','slap',.035],['rat','bite',.025],['knight','slash',.055]]){
    const r=runtime(),{G}=r;r.load('orchardRoad');r.drain();G.state.formId=id;
    const p=G.state.player;Object.assign(p,{x:220,y:180,dir:{x:1,y:0}});
    const e=G.makeEnemy('slime',236,180);e.hp=30;G.state.enemies=[e];
    assert.equal(G.beginFormPerformance(p,ability),true);G.updateFormPerformance(delay/2);assert.equal(e.hp,30);
    G.updateFormPerformance(delay);assert.ok(e.hp<30);const hp=e.hp;G.updateFormPerformance(.3);assert.equal(e.hp,hp);assert.equal(p.performance,null);
  }
  const r=runtime();r.load('heartwood');r.drain();
  const treant=r.G.state.enemies.find(e=>e.def.id==='ancientTreant');
  assert.ok(treant);assert.equal(treant.def.sprite,r.G.openingTreantSprite);assert.equal(treant.def.size,34);
  assert.equal(r.G.enemies.orchardGuard.sprite,r.G.forms.knight.sprite);
  r.load('emberRidge');r.drain();assert.equal(r.G.state.enemies.find(e=>e.def.id==='eclipseKnight').def.sprite,r.G.enemies.eclipseKnight.sprite);
});
