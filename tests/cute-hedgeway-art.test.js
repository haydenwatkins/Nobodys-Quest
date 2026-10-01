const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');

test('hedgeway gardeners retain every footprint, direction and earned appearance',()=>{
  const {G}=runtime(),source=G.forms.druid.sprite;G.state.costumeId='trailblazer';
  for(const sprite of [source,G.costumedSprite(source),G.signatureSprite(source,G.skinForForm('druid'))])for(const hd of [true,false]){
    G.hdPilot=hd;const m=G.spriteMetrics(sprite),s=G.activeSpriteDefinition(sprite);assert.equal(m.w,21);assert.equal(m.h,20);assert.equal(s.frames.length,48);
    for(const dir of ['south','east','north','west']){const set=s.directional[dir];assert.equal(set.walk.length,6);assert.equal(set.attack.length,3);assert.notDeepEqual(s.frames[set.attack[0]],s.frames[set.attack[1]]);
      for(const ids of Object.values(set))for(const i of ids)for(const row of s.frames[i])for(const p of row)assert.ok(p==='.'||s.palette[p]);}
    assert.notDeepEqual(s.frames[s.directional.south.idle[0]],s.frames[s.directional.north.idle[0]]);
  }
  for(const hd of [true,false]){G.hdPilot=hd;const sprite=G.enemies.grandmotherBriar.sprite,m=G.spriteMetrics(sprite),s=G.activeSpriteDefinition(sprite);assert.equal(m.w,27);assert.equal(m.h,25);assert.equal(s.frames.length,4);assert.notDeepEqual(s.frames[0],s.frames[2]);for(const frame of s.frames)for(const row of frame)for(const p of row)assert.ok(p==='.'||s.palette[p]);}
});

test('Hedgehare lashes immediately, keeps poison attribution and recovers without a second hit',()=>{
  const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.formId='druid';G.state.enemies=[];
  const p=G.state.player;Object.assign(p,{x:240,y:152,dir:{x:1,y:0},mana:G.playerMaxMana()});
  const e=G.makeEnemy('slime',264,152);e.hp=30;G.state.enemies.push(e);assert.equal(G.beginFormPerformance(p,'thornLash'),false);
  r.taps.add('a');G.updatePlayer(.01);assert.equal(e.hp,29);assert.equal(p.performance,null);assert.ok(p.attackPose);assert.equal(p.x,240);assert.equal(p.y,152);
  assert.equal(e.status.poison.ability,'thornLash');assert.equal(e.status.poison.dur,3);
  G.updatePlayer(.49);G.state.time+=.49;assert.equal(p.attackPose,null);assert.equal(e.hp,29);
  G.combat.updateStatuses(e,1);assert.equal(e.hp,28);assert.equal(e.status.poison.ability,'thornLash');
});
