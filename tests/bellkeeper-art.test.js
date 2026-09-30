const {test}=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');

test('Bellkeeper keeps directional ringing poses through both resolutions, dyes, and its signature skin',()=>{
  const {G}=runtime(),source=G.forms.bellkeeper.sprite;
  G.state.costumeId='trailblazer';G.state.costumesUnlocked=['classic','trailblazer'];
  for(const sprite of [source,G.costumedSprite(source),G.signatureSprite(source,G.skinForForm('bellkeeper'))]){
    for(const hd of [true,false]){
      G.hdPilot=hd;const active=G.activeSpriteDefinition(sprite);
      if(sprite===source){const m=G.spriteMetrics(sprite);assert.equal(m.w,21);assert.equal(m.h,20);}
      for(const dir of ['south','east','north','west']){
        const set=active.directional[dir];
        for(const mode of ['idle','walk','attack','peal','silence']){
          const frames=set[mode].map(i=>active.frames[i]);
          for(const frame of frames){assert.ok(frame.some(row=>/[^. ]/.test(row)));for(const row of frame)for(const pixel of row)assert.ok(pixel==='.'||active.palette[pixel]);}
          assert.notDeepEqual(frames[0],frames[1],`${dir} ${mode} has a real second pose`);
        }
        assert.notDeepEqual(active.frames[set.attack[1]],active.frames[set.peal[1]]);
      }
      assert.notDeepEqual(active.frames[active.directional.south.idle[0]],active.frames[active.directional.north.idle[0]]);
      assert.notDeepEqual(active.frames[active.directional.south.idle[0]],active.frames[active.directional.east.idle[0]]);
    }
  }
});

test('the third Handbell peal displays its own ringing sequence without delaying damage or adding guard',()=>{
  const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.formId='bellkeeper';
  const p=G.state.player;Object.assign(p,{x:240,y:144,dir:{x:1,y:0},moving:true,meleeGuard:0});
  const e=G.makeEnemy('slime',279,144);e.hp=50;G.state.enemies=[e];
  assert.equal(G.beginFormPerformance(p,'handbell'),false);
  for(let chime=1;chime<=3;chime++){
    G.abilities.handbell.use(p);assert.equal(p.attackPose.animation,chime===3?'peal':'attack');
    assert.equal(e.hp,chime===3?49:50);assert.ok(!p.performance);assert.equal(p.meleeGuard,0);
  }
  for(const hd of [true,false]){
    G.hdPilot=hd;const sprite=G.forms.bellkeeper.sprite,set=G.activeSpriteDefinition(sprite).directional.east;
    for(const [phase,index]of [[1,0],[.5,1],[.01,2]]){p.attackPose.t=p.attackPose.dur*phase;assert.equal(G.performanceFrame(sprite,p,0),set.peal[index]);}
  }
  p.attackPose.t=.01;G.updatePlayer(.02);assert.equal(p.attackPose,null);assert.equal(e.hp,49);
  assert.equal(G.forms.bellkeeper.speed,78);assert.equal(G.forms.bellkeeper.hearts,6);
});

test('Silence Ring poses remain visual and borrowed bells keep the borrower animation',()=>{
  const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.formId='bellkeeper';
  const p=G.state.player;Object.assign(p,{x:240,y:144,dir:{x:0,y:-1}});
  const e=G.makeEnemy('slime',265,144);e.hp=50;G.state.enemies=[e];
  G.abilities.silenceRing.use(p);assert.equal(e.hp,48);assert.equal(p.attackPose.animation,'silence');assert.equal(e.status.stun.dur,.65);
  const sprite=G.forms.bellkeeper.sprite;p.attackPose.t=.12;assert.equal(G.performanceFrame(sprite,p,0),sprite.hd.directional.north.silence[1]);
  G.state.formId='nobody';p.attackPose=null;G.abilities.handbell.use(p);assert.equal(p.attackPose,null);
  G.abilities.silenceRing.use(p);assert.equal(p.attackPose,null);
});

test('a keyboard Handbell still pays its ordinary recovery and damages on the cast frame',()=>{
  const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.formId='bellkeeper';G.state.claimedForms.push('bellkeeper');
  const p=G.state.player;Object.assign(p,{x:240,y:144,dir:{x:1,y:0},mana:0});
  const e=G.makeEnemy('slime',265,144);e.hp=50;G.state.enemies=[e];
  r.taps.add('a');G.updatePlayer(.001);assert.equal(e.hp,49);assert.equal(p.mana,1,'the ordinary connected-hit refill remains intact');
  assert.equal(p.cooldowns.handbell,.5);assert.equal(p.attackPose.animation,'attack');assert.ok(!p.performance);
  r.taps.add('a');G.updatePlayer(.001);assert.equal(e.hp,49,'the pose does not create a second hit or bypass cooldown');
});
