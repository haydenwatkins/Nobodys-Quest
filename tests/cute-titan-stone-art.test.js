const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');

test('Titan Grave mountain bears retain directions, footprints and earned appearances',()=>{
  const {G}=runtime(),source=G.forms.colossus.sprite;G.state.costumeId='trailblazer';
  for(const sprite of [source,G.costumedSprite(source),G.signatureSprite(source,G.skinForForm('colossus'))])for(const hd of [true,false]){
    G.hdPilot=hd;const m=G.spriteMetrics(sprite),s=G.activeSpriteDefinition(sprite);assert.equal(m.w,25);assert.equal(m.h,23);assert.equal(s.frames.length,48);
    for(const dir of ['south','east','north','west']){const set=s.directional[dir];assert.equal(set.walk.length,6);assert.equal(set.attack.length,3);assert.notDeepEqual(s.frames[set.attack[0]],s.frames[set.attack[1]]);
      for(const ids of Object.values(set))for(const i of ids)for(const row of s.frames[i])for(const p of row)assert.ok(p==='.'||s.palette[p]);}
    assert.notDeepEqual(s.frames[s.directional.south.idle[0]],s.frames[s.directional.north.idle[0]]);
  }
  for(const hd of [true,false]){G.hdPilot=hd;const sprite=G.enemies.lastWorldbearer.sprite,m=G.spriteMetrics(sprite),s=G.activeSpriteDefinition(sprite);assert.equal(m.w,30);assert.equal(m.h,28);assert.equal(s.frames.length,4);assert.notDeepEqual(s.frames[0],s.frames[2]);for(const frame of s.frames)for(const row of frame)for(const p of row)assert.ok(p==='.'||s.palette[p]);}
});

test('Cragback lands one immediate fist and Worldweight keeps the pose without erasing damage',()=>{
  const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.formId='colossus';G.state.enemies=[];G.state.projectiles=[];
  const p=G.state.player;Object.assign(p,{x:240,y:152,dir:{x:1,y:0},mana:G.playerMaxMana()});
  const e=G.makeEnemy('slime',264,152);e.hp=30;G.state.enemies.push(e);let hit;G.events.on('hit',v=>hit=v);
  assert.equal(G.beginFormPerformance(p,'pillarFist'),false);r.taps.add('a');G.updatePlayer(.01);assert.equal(e.hp,28);assert.equal(hit.damageType,'blunt');assert.ok(p.attackPose);assert.equal(p.performance,null);
  p.invuln=0;p.meleeGuard=0;const x=p.x,y=p.y,pose=p.attackPose;G.damagePlayer(1,x-20,y);assert.equal(p.damageTaken,1);assert.equal(p.x,x);assert.equal(p.y,y);assert.equal(p.attackPose,pose);
  G.updatePlayer(.6);assert.equal(e.hp,28);assert.equal(p.attackPose,null);assert.equal(p.cooldowns.pillarFist,0);
});
