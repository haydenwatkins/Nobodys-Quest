const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');

test('Rootdeep stitchers retain every footprint, direction and earned appearance',()=>{
  const {G}=runtime(),source=G.forms.weaver.sprite;G.state.costumeId='trailblazer';
  for(const sprite of [source,G.costumedSprite(source),G.signatureSprite(source,G.skinForForm('weaver'))])for(const hd of [true,false]){
    G.hdPilot=hd;const m=G.spriteMetrics(sprite),s=G.activeSpriteDefinition(sprite);assert.equal(m.w,23);assert.equal(m.h,19);assert.equal(s.frames.length,48);
    for(const dir of ['south','east','north','west']){const set=s.directional[dir];assert.equal(set.walk.length,6);assert.equal(set.attack.length,3);assert.notDeepEqual(s.frames[set.attack[0]],s.frames[set.attack[1]]);
      for(const ids of Object.values(set))for(const i of ids)for(const row of s.frames[i])for(const p of row)assert.ok(p==='.'||s.palette[p]);}
    assert.notDeepEqual(s.frames[s.directional.south.idle[0]],s.frames[s.directional.north.idle[0]]);
  }
  for(const hd of [true,false]){G.hdPilot=hd;const sprite=G.enemies.silkMatriarch.sprite,m=G.spriteMetrics(sprite),s=G.activeSpriteDefinition(sprite);assert.equal(m.w,30);assert.equal(m.h,23);assert.equal(s.frames.length,4);assert.notDeepEqual(s.frames[0],s.frames[2]);for(const frame of s.frames)for(const row of frame)for(const p of row)assert.ok(p==='.'||s.palette[p]);}
});

test('real Silk Needles recover once and Lifeline joins two targets without extra damage',()=>{
  const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.formId='weaver';G.state.enemies=[];G.state.projectiles=[];
  const p=G.state.player;Object.assign(p,{x:240,y:152,dir:{x:1,y:0}});
  const a=G.makeEnemy('slime',264,152),b=G.makeEnemy('slime',240,176);a.hp=b.hp=30;G.state.enemies.push(a,b);
  assert.equal(G.beginFormPerformance(p,'silkNeedle'),false);
  function shot(dir){p.dir=dir;G.input.aim=dir;r.taps.add('a');G.updatePlayer(.01);assert.equal(G.state.projectiles.length,1);assert.ok(p.attackPose);assert.equal(p.performance,null);
    for(let n=0;n<40;n++){G.state.time+=.02;G.combat.updateProjectiles(.02);}G.updatePlayer(.43);assert.equal(p.attackPose,null);assert.equal(p.cooldowns.silkNeedle,0);}
  shot({x:1,y:0});assert.equal(a.hp,29);assert.equal(b.hp,30);assert.equal(p.lifelineTarget,a);
  shot({x:0,y:1});assert.equal(a.hp,29);assert.equal(b.hp,29);assert.equal(p.lifelineTarget,null);
  assert.ok(a.x<264);assert.ok(a.y>152);assert.ok(b.x>240);assert.ok(b.y<176);assert.equal(p.x,240);assert.equal(p.y,152);
});
