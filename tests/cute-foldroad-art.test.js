const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');

test('foldroad foxes preserve every footprint, directional pose and earned appearance',()=>{
  const {G}=runtime(),source=G.forms.samurai.sprite;G.state.costumeId='trailblazer';
  for(const sprite of [source,G.costumedSprite(source),G.signatureSprite(source,G.skinForForm('samurai'))])for(const hd of [true,false]){
    G.hdPilot=hd;const m=G.spriteMetrics(sprite),s=G.activeSpriteDefinition(sprite);assert.equal(m.w,20);assert.equal(m.h,20);assert.equal(s.frames.length,48);
    for(const dir of ['south','east','north','west']){const set=s.directional[dir];assert.equal(set.walk.length,6);assert.equal(set.attack.length,3);assert.notDeepEqual(s.frames[set.attack[0]],s.frames[set.attack[1]]);
      for(const ids of Object.values(set))for(const i of ids)for(const row of s.frames[i])for(const p of row)assert.ok(p==='.'||s.palette[p]);}
    assert.notDeepEqual(s.frames[s.directional.south.idle[0]],s.frames[s.directional.north.idle[0]]);
  }
  for(const hd of [true,false]){G.hdPilot=hd;const sprite=G.enemies.paperRonin.sprite,m=G.spriteMetrics(sprite),s=G.activeSpriteDefinition(sprite);assert.equal(m.w,25);assert.equal(m.h,25);assert.equal(s.frames.length,4);assert.notDeepEqual(s.frames[0],s.frames[2]);for(const frame of s.frames)for(const row of frame)for(const p of row)assert.ok(p==='.'||s.palette[p]);}
});

test('Foldstep Fox keeps immediate cuts, once-only damage, timed third draw and visual recovery',()=>{
  const r=runtime(),{G}=r;r.load('lanternReach');r.drain();G.state.formId='samurai';G.state.enemies=[];
  const p=G.state.player;Object.assign(p,{x:360,y:248,dir:{x:1,y:0},mana:G.playerMaxMana()});
  const e=G.makeEnemy('slime',376,248);e.hp=30;G.state.enemies.push(e);let hit;G.events.on('hit',event=>hit=event);
  assert.equal(G.beginFormPerformance(p,'quickdraw'),false);
  for(let beat=1;beat<=3;beat++){
    r.taps.add('a');G.updatePlayer(.01);assert.equal(p.drawBeat,beat);assert.equal(e.hp,30-beat);assert.equal(hit.combo,beat===3?'draw-finish':'draw');assert.equal(p.performance,null);assert.ok(p.attackPose);assert.equal(p.x,360);assert.equal(p.y,248);
    G.updatePlayer(.41);G.state.time+=.41;assert.equal(e.hp,30-beat);assert.equal(p.attackPose,null);
  }
  G.state.time+=.8;r.taps.add('a');G.updatePlayer(.01);assert.equal(p.drawBeat,1);assert.equal(e.hp,26);
});
