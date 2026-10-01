const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');

test('skylens scholars preserve footprints, every direction and earned appearances',()=>{
  const {G}=runtime(),source=G.forms.astronomer.sprite;G.state.costumeId='trailblazer';
  for(const sprite of [source,G.costumedSprite(source),G.signatureSprite(source,G.skinForForm('astronomer'))])for(const hd of [true,false]){
    G.hdPilot=hd;const m=G.spriteMetrics(sprite),s=G.activeSpriteDefinition(sprite);assert.equal(m.w,21);assert.equal(m.h,20);assert.equal(s.frames.length,48);
    for(const dir of ['south','east','north','west']){const set=s.directional[dir];assert.equal(set.walk.length,6);assert.equal(set.attack.length,3);assert.notDeepEqual(s.frames[set.attack[0]],s.frames[set.attack[1]]);
      for(const ids of Object.values(set))for(const i of ids)for(const row of s.frames[i])for(const p of row)assert.ok(p==='.'||s.palette[p]);}
    assert.notDeepEqual(s.frames[s.directional.south.idle[0]],s.frames[s.directional.north.idle[0]]);
  }
  for(const hd of [true,false]){G.hdPilot=hd;const sprite=G.enemies.professorPerihelion.sprite,m=G.spriteMetrics(sprite),s=G.activeSpriteDefinition(sprite);assert.equal(m.w,26);assert.equal(m.h,25);assert.equal(s.frames.length,4);assert.notDeepEqual(s.frames[0],s.frames[2]);for(const frame of s.frames)for(const row of frame)for(const p of row)assert.ok(p==='.'||s.palette[p]);}
});

test('the mapper launches on the input frame and only the fourth needle pierces the second foe',()=>{
  const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.formId='astronomer';G.state.enemies=[];G.state.projectiles=[];
  const p=G.state.player;Object.assign(p,{x:240,y:152,dir:{x:1,y:0},mana:G.playerMaxMana()});
  const a=G.makeEnemy('slime',264,152),b=G.makeEnemy('slime',290,152);a.hp=b.hp=50;G.state.enemies.push(a,b);
  assert.equal(G.beginFormPerformance(p,'starNeedle'),false);
  for(let beat=1;beat<=5;beat++){
    r.taps.add('a');G.updatePlayer(.01);assert.equal(p.starBeat,(beat-1)%4+1);assert.equal(G.state.projectiles.length,1);assert.equal(p.performance,null);assert.ok(p.attackPose);assert.equal(p.x,240);assert.equal(p.y,152);
    for(let n=0;n<60;n++)G.combat.updateProjectiles(.02);assert.equal(a.hp,50-beat);assert.equal(b.hp,beat>=4?49:50);assert.equal(G.state.projectiles.length,0);
    G.updatePlayer(.48);G.state.time+=.48;assert.equal(p.attackPose,null);
  }
});
