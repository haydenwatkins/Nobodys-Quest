const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');

test('garden roadmenders retain every footprint, direction and earned appearance',()=>{
  const {G}=runtime(),source=G.forms.golem.sprite;G.state.costumeId='trailblazer';
  for(const sprite of [source,G.costumedSprite(source),G.signatureSprite(source,G.skinForForm('golem'))])for(const hd of [true,false]){
    G.hdPilot=hd;const m=G.spriteMetrics(sprite),s=G.activeSpriteDefinition(sprite);assert.equal(m.w,22);assert.equal(m.h,21);assert.equal(s.frames.length,48);
    for(const dir of ['south','east','north','west']){const set=s.directional[dir];assert.equal(set.walk.length,6);assert.equal(set.attack.length,3);assert.notDeepEqual(s.frames[set.attack[0]],s.frames[set.attack[1]]);
      for(const ids of Object.values(set))for(const i of ids)for(const row of s.frames[i])for(const p of row)assert.ok(p==='.'||s.palette[p]);}
    assert.notDeepEqual(s.frames[s.directional.south.idle[0]],s.frames[s.directional.north.idle[0]]);
  }
  for(const hd of [true,false]){G.hdPilot=hd;const sprite=G.enemies.oldMason.sprite,m=G.spriteMetrics(sprite),s=G.activeSpriteDefinition(sprite);assert.equal(m.w,28);assert.equal(m.h,26);assert.equal(s.frames.length,4);assert.notDeepEqual(s.frames[0],s.frames[2]);for(const frame of s.frames)for(const row of frame)for(const p of row)assert.ok(p==='.'||s.palette[p]);}
});
function fixture(){const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.formId='golem';G.state.enemies=[];G.state.projectiles=[];
  Object.assign(G.state.player,{x:240,y:152,dir:{x:1,y:0},mana:G.playerMaxMana()});return r;}

test('Cobblekin punches immediately once and keeps the heavy third punch across recovery',()=>{
  const r=fixture(),{G}=r,p=G.state.player;let hit;G.events.on('hit',v=>hit=v);
  assert.equal(G.beginFormPerformance(p,'stoneKnuckle'),false);
  for(let n=1;n<=4;n++){
    G.state.enemies=[];const e=G.makeEnemy('slime',254,152);e.hp=30;G.state.enemies.push(e);
    r.taps.add('a');G.updatePlayer(.01);assert.equal(e.hp,n===3?28:29);assert.equal(hit.combo,n===3?'keystone':'knuckle');
    assert.equal(p.performance,null);assert.ok(p.attackPose);assert.equal(p.x,240);assert.equal(p.y,152);
    const hp=e.hp;G.updatePlayer(.49);G.state.time+=.49;assert.equal(e.hp,hp);assert.equal(p.attackPose,null);assert.equal(p.cooldowns.stoneKnuckle,0);
  }
});

test('a real Rampart cast pays once and raises cover that rejects only enemy shots',()=>{
  const r=fixture(),{G}=r,p=G.state.player;G.state.loadouts.golem=['stoneKnuckle','rampartPulse','rollingMonolith'];
  const e=G.makeEnemy('slime',264,152);e.hp=30;G.state.enemies.push(e);const mana=p.mana;
  r.taps.add('b');G.updatePlayer(.01);assert.equal(e.hp,29);assert.equal(p.mana,mana-2,'three mana paid; one returned by the landed hit');assert.equal(p.cooldowns.rampartPulse,1);assert.equal(G.state.passiveShelters.length,1);
  const wall=G.state.passiveShelters[0];assert.equal(wall.t,3.2);G.state.enemies=[];
  G.combat.shoot(p,{ability:'rollingMonolith',speed:125,range:185,damage:2,type:'blunt',size:3,color:'#96a6a0'});
  const friendly=G.state.projectiles[0];Object.assign(friendly,{x:wall.x,y:wall.y,startX:wall.x,startY:wall.y,vx:0,vy:0});
  G.state.projectiles.push({...friendly,fromPlayer:false,trail:[]});G.combat.updateProjectiles(.01);
  assert.equal(G.state.projectiles.length,1);assert.equal(G.state.projectiles[0],friendly);assert.equal(p.damageTaken,0);
  p.manaRegenDelay=100;G.updatePlayer(1.01);assert.equal(p.cooldowns.rampartPulse,0);assert.equal(G.state.passiveShelters.length,1);assert.equal(p.mana,mana-2);
});
