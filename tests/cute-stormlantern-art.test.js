const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');

test('Stormspine hearth lights retain every footprint, direction and earned appearance',()=>{
  const {G}=runtime(),source=G.forms.lanternWisp.sprite;G.state.costumeId='trailblazer';
  for(const sprite of [source,G.costumedSprite(source),G.signatureSprite(source,G.skinForForm('lanternWisp'))])for(const hd of [true,false]){
    G.hdPilot=hd;const m=G.spriteMetrics(sprite),s=G.activeSpriteDefinition(sprite);assert.equal(m.w,19);assert.equal(m.h,20);assert.equal(s.frames.length,48);
    for(const dir of ['south','east','north','west']){const set=s.directional[dir];assert.equal(set.walk.length,6);assert.equal(set.attack.length,3);assert.notDeepEqual(s.frames[set.attack[0]],s.frames[set.attack[1]]);
      for(const ids of Object.values(set))for(const i of ids)for(const row of s.frames[i])for(const p of row)assert.ok(p==='.'||s.palette[p]);}
    assert.notDeepEqual(s.frames[s.directional.south.idle[0]],s.frames[s.directional.north.idle[0]]);
  }
  for(const hd of [true,false]){G.hdPilot=hd;const sprite=G.enemies.lanternKeeper.sprite,m=G.spriteMetrics(sprite),s=G.activeSpriteDefinition(sprite);assert.equal(m.w,26);assert.equal(m.h,26);assert.equal(s.frames.length,4);assert.notDeepEqual(s.frames[0],s.frames[2]);for(const frame of s.frames)for(const row of frame)for(const p of row)assert.ok(p==='.'||s.palette[p]);}
});

test('Wickling lashes immediately and a paid light burst raises one protective circle',()=>{
  const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.formId='lanternWisp';G.state.enemies=[];G.state.projectiles=[];
  const p=G.state.player;Object.assign(p,{x:240,y:152,dir:{x:1,y:0},mana:G.playerMaxMana()});
  const e=G.makeEnemy('slime',264,152);e.hp=30;G.state.enemies.push(e);let hit;G.events.on('hit',v=>hit=v);
  assert.equal(G.beginFormPerformance(p,'wickLash'),false);r.taps.add('a');G.updatePlayer(.01);assert.equal(e.hp,29);assert.equal(hit.damageType,'dark');assert.ok(p.attackPose);assert.equal(p.performance,null);
  G.updatePlayer(.43);assert.equal(e.hp,29);assert.equal(p.attackPose,null);assert.equal(p.cooldowns.wickLash,0);
  G.state.loadouts.lanternWisp=['wickLash','ghostlight','lanternDrift'];const mana=p.mana;
  r.taps.add('b');G.updatePlayer(.01);assert.equal(e.hp,27);assert.equal(hit.damageType,'light');assert.equal(p.mana,mana-3,'four paid, one refunded for the landed hit');assert.equal(p.cooldowns.ghostlight,1.05);
  assert.equal(G.state.safeLights.length,1);const field=G.state.safeLights[0];assert.equal(field.t,3.4);
  G.state.projectiles.push({x:field.x+12,y:field.y,vx:-20,vy:0,size:3,damage:1,range:100,startX:field.x+12,startY:field.y,fromPlayer:false,armT:0});
  G.combat.updateProjectiles(.02);assert.equal(G.state.projectiles.length,0);assert.equal(p.damageTaken,0);
  G.updatePlayer(1.06);assert.equal(e.hp,27);assert.equal(G.state.safeLights.length,1);assert.equal(p.cooldowns.ghostlight,0);
});
