const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');

test('Wayheart and Meridian preserve every authored footprint and legacy calling identity',()=>{
  const {G}=runtime(),source=G.forms.god.sprite;G.state.costumeId='trailblazer';assert.equal(G.forms.god.name,'Wayheart');assert.equal(G.enemies.godAvatar.name,'Meridian, the Perfect Map');assert.equal(G.enemies.godAvatar.trophy,'god-spark');assert.equal(G.forms.god.basic,'divineSpark');assert.equal(G.forms.god.unlock.requirements[1].item,'god-spark');
  for(const sprite of [source,G.costumedSprite(source),G.signatureSprite(source,G.skinForForm('god'))])for(const hd of [true,false]){
    G.hdPilot=hd;const m=G.spriteMetrics(sprite),s=G.activeSpriteDefinition(sprite);assert.equal(m.w,26);assert.equal(m.h,24);assert.equal(s.frames.length,48);
    for(const dir of ['south','east','north','west']){const set=s.directional[dir];assert.equal(set.walk.length,6);assert.equal(set.attack.length,3);assert.notDeepEqual(s.frames[set.attack[0]],s.frames[set.attack[1]]);for(const ids of Object.values(set))for(const i of ids)for(const row of s.frames[i])for(const p of row)assert.ok(p==='.'||s.palette[p]);}
    assert.notDeepEqual(s.frames[s.directional.south.idle[0]],s.frames[s.directional.north.idle[0]]);
  }
  for(const hd of [true,false]){G.hdPilot=hd;const sprite=G.enemies.godAvatar.sprite,m=G.spriteMetrics(sprite),s=G.activeSpriteDefinition(sprite);assert.equal(m.w,29);assert.equal(m.h,27);assert.equal(s.frames.length,4);assert.notDeepEqual(s.frames[0],s.frames[2]);for(const frame of s.frames)for(const row of frame)for(const p of row)assert.ok(p==='.'||s.palette[p]);}
});

test('Waylight launches on real input, opens an unmatched ward once, and recovers without extra casts',()=>{
  const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.formId='god';G.state.enemies=[];G.state.projectiles=[];
  const p=G.state.player;Object.assign(p,{x:240,y:152,dir:{x:1,y:0},mana:G.playerMaxMana()});const e=G.makeEnemy('slime',264,152);e.hp=30;e.ward={types:['blunt'],hp:1};G.state.enemies.push(e);let breaks=0;G.events.on('wardBreak',()=>breaks++);
  assert.equal(G.beginFormPerformance(p,'divineSpark'),false);r.taps.add('a');G.updatePlayer(.01);assert.equal(G.state.projectiles.length,1);assert.equal(p.performance,null);const mana=p.mana;
  for(let i=0;i<40;i++)G.combat.updateProjectiles(.02);assert.ok(e.ward.hp<=0);assert.equal(e.hp,30);assert.equal(breaks,1);assert.equal(G.state.projectiles.length,0);
  G.updatePlayer(.51);assert.equal(p.cooldowns.divineSpark,0);assert.equal(p.attackPose,null);assert.equal(G.state.projectiles.length,0);assert.equal(p.mana,mana);
  r.taps.add('a');G.updatePlayer(.01);assert.equal(G.state.projectiles.length,1);for(let i=0;i<40;i++)G.combat.updateProjectiles(.02);assert.equal(e.hp,28);assert.equal(breaks,1);
});
