const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');

test('harbor terrapins preserve footprints, every direction and earned appearances',()=>{
  const {G}=runtime(),source=G.forms.turtle.sprite;G.state.costumeId='trailblazer';
  for(const sprite of [source,G.costumedSprite(source),G.signatureSprite(source,G.skinForForm('turtle'))])for(const hd of [true,false]){
    G.hdPilot=hd;const m=G.spriteMetrics(sprite),s=G.activeSpriteDefinition(sprite);assert.equal(m.w,21);assert.equal(m.h,16);assert.equal(s.frames.length,48);
    for(const dir of ['south','east','north','west']){const set=s.directional[dir];assert.equal(set.walk.length,6);assert.equal(set.attack.length,3);assert.notDeepEqual(s.frames[set.attack[0]],s.frames[set.attack[1]]);
      for(const ids of Object.values(set))for(const i of ids)for(const row of s.frames[i])for(const p of row)assert.ok(p==='.'||s.palette[p]);}
    assert.notDeepEqual(s.frames[s.directional.south.idle[0]],s.frames[s.directional.north.idle[0]]);
  }
  for(const hd of [true,false]){G.hdPilot=hd;const sprite=G.enemies.admiralTortoise.sprite,m=G.spriteMetrics(sprite),s=G.activeSpriteDefinition(sprite);assert.equal(m.w,29);assert.equal(m.h,21);assert.equal(s.frames.length,4);assert.notDeepEqual(s.frames[0],s.frames[2]);for(const frame of s.frames)for(const row of frame)for(const p of row)assert.ok(p==='.'||s.palette[p]);}
});

test('Harborback jabs land on the input frame and the third hit still earns its brace',()=>{
  const r=runtime(),{G}=r;r.load('lanternReach');r.drain();G.state.formId='turtle';G.state.enemies=[];
  const p=G.state.player;Object.assign(p,{x:360,y:248,dir:{x:1,y:0},mana:G.playerMaxMana()});
  const e=G.makeEnemy('slime',376,248);e.hp=30;G.state.enemies.push(e);assert.equal(G.beginFormPerformance(p,'shellJab'),false);
  for(let beat=1;beat<=3;beat++){
    r.taps.add('a');G.updatePlayer(.01);assert.equal(p.shellBeat,beat);assert.equal(e.hp,30-beat);assert.equal(p.performance,null);assert.ok(p.attackPose);assert.equal(p.x,360);assert.equal(p.y,248);
    if(beat===3)assert.ok(p.meleeGuard>.3);else assert.equal(p.meleeGuard,G.meleeGuardDuration());
    G.updatePlayer(.44);G.state.time+=.44;assert.equal(p.attackPose,null);
  }
});
