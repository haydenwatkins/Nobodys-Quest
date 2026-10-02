const {test}=require('node:test');
const assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ids=['slime','bat','bones','wisp','brute','thornling','pebblebeast','shade'];
const withoutSprite=def=>JSON.stringify(Object.fromEntries(Object.entries(def).filter(([k])=>k!=='sprite')));

test('early foe redesigns keep native footprints, gameplay definitions and the two-beat clock',()=>{
  const r=runtime(),{G}=r;
  vm.runInContext('{'+fs.readFileSync(path.join(r.root,'js/data/enemies.js'),'utf8')+'}',r.context);
  const before=new Map(Object.values(G.enemies).map(e=>[e.id,{def:withoutSprite(e),sprite:e.sprite,metrics:G.spriteMetrics(e.sprite)}]));
  r.run('js/data/regular-foe-art.js');
  assert.deepEqual(Array.from(G.regularFoeArtIds),ids);
  for(const def of Object.values(G.enemies)) {
    assert.equal(withoutSprite(def),before.get(def.id).def);
    if(!ids.includes(def.id)) assert.equal(def.sprite,before.get(def.id).sprite);
  }
  for(const hd of [true,false]) {
    G.hdPilot=hd;
    for(const id of ids) {
      const sprite=G.enemies[id].sprite,active=G.activeSpriteDefinition(sprite),old=before.get(id);
      assert.equal(active.frames.length,2);
      const metrics=G.spriteMetrics(sprite);
      assert.equal(metrics.w,old.metrics.w);assert.equal(metrics.h,old.metrics.h);
      for(const frame of active.frames) for(const row of frame) for(const pixel of row) assert.ok(pixel==='.'||active.palette[pixel]);
      for(let tick=0;tick<6;tick+=.25) assert.equal(G.spriteFrame(sprite,'walk',tick),Math.floor(tick)%2);
    }
  }
});

test('native matching wards still break before damage and each redesigned foe still dies through native combat',()=>{
  const r=runtime(),{G}=r;G.state.opening.complete=true;G.state.delivery.complete=true;r.load('dungeon');r.drain();
  G.state.enemies=[];
  for(const id of ids) {
    const e=G.makeEnemy(id,160,160);G.state.enemies=[e];
    const hit=(type,damage)=>G.combat.damageEnemy(e,{type,damage,fromX:e.x+30,fromY:e.y,knockback:0});
    if(e.ward) {
      const hp=e.hp,ward=e.ward.hp,type=e.ward.types[0],wrong=type==='blunt'?'light':'blunt';
      assert.equal(hit(wrong,3),false);assert.equal(e.ward.hp,ward);assert.equal(e.hp,hp);
      hit(type,ward);assert.ok(e.ward.hp<=0);assert.equal(e.hp,hp);assert.equal(e.bossStaggerT,0);
    }
    hit('blunt',e.hp);assert.equal(e.dead,true);
  }
});

test('both facing directions and native ward/status tells draw without changing actors or attack clocks',()=>{
  const {G}=runtime(),spriteDraws=[],strokes=[];
  const ctx=new Proxy({globalAlpha:1,save(){},restore(){},stroke(){strokes.push(this.strokeStyle);},measureText:t=>({width:String(t).length*5})},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
  G.drawSprite=(c,s,f,x,y,flip)=>spriteDraws.push({s,f,flip});
  for(const hd of [true,false]) for(const id of ids) for(const left of [false,true]) for(const frame of [0,1]) {
    G.hdPilot=hd;
    const e=G.makeEnemy(id,160,160);e.dir.x=left?-1:1;e.anim=frame;e.hp--;
    e.status={poison:{dur:2},marked:{dur:2},burn:{dur:2},stun:{dur:1}};
    const before=JSON.stringify(e);spriteDraws.length=0;strokes.length=0;
    G.drawEnemy(ctx,e);
    assert.equal(JSON.stringify(e),before);
    assert.equal(spriteDraws[0].s,e.def.sprite);assert.equal(spriteDraws[0].f,frame);assert.equal(spriteDraws[0].flip,left);
    if(e.ward) assert.ok(strokes.includes(G.DAMAGE_TYPES[e.ward.types[0]].color));
  }
});
