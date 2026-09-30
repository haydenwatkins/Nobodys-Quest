const {test}=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');
function fixture(){
  const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();
  G.state.opening.complete=true;G.state.delivery.complete=true;G.state.formId='knight';G.state.claimedForms=[...G.formOrder];
  G.questsDone=G.formOrder.flatMap(id=>G.forms[id].quests.map(q=>q.id));
  G.state.enemies=[];G.state.items.push('trophy-sky-sovereign');
  Object.assign(G.state.player,{x:240,y:152,mana:12,manaMax:12,dir:{x:1,y:0}});
  return r;
}
function cast(r,id){const {G}=r;G.getLoadout(G.state.formId)[1]=id;r.taps.add('b');G.updatePlayer(0);return G.state.player.cooldowns[id];}
test('the Plume changes actual dash and area readiness but leaves other styles and mana alone',()=>{
  for(const [id,scale]of [['cartwheel',.75],['spinSlash',1.25],['arrow',1],['chainLightning',1],['slap',1]]){
    const r=fixture(),{G}=r,p=G.state.player;G.carryKeepsake('plume');const mana=p.mana;
    const duration=cast(r,id);assert.equal(duration,G.abilities[id].cooldown*scale);
    assert.equal(G.cooldownDuration(G.abilities[id]),duration);assert.equal(p.mana,mana-G.abilities[id].mana);
    // End the movement pose, then advance the real readiness clock.
    p.dashing=null;G.updatePlayer(duration-.01);assert.ok(p.cooldowns[id]>0);
    G.updatePlayer(.02);assert.equal(p.cooldowns[id],0);
  }
});
test('changing a keepsake or recalling a card cannot escape the already-paid recovery',()=>{
  const r=fixture(),{G}=r,p=G.state.player;G.carryKeepsake('plume');G.saveMixRecipe('knight',0);
  const paid=cast(r,'spinSlash');G.carryKeepsake(null);
  assert.equal(p.cooldowns.spinSlash,paid);assert.equal(G.cooldownDuration(G.abilities.spinSlash),paid);
  p.cooldowns.cartwheel=.7;p.cooldownDurations.cartwheel=.8;
  assert.equal(G.recallMixRecipe('knight',0),true);assert.equal(G.activeKeepsake().id,'plume');
  assert.equal(p.cooldowns.cartwheel,.7);assert.equal(G.cooldownDuration(G.abilities.cartwheel),.8);
  G.saveGame();const saved=G.loadSaveData();assert.equal(G.normalizeKeepsake(saved.keepsakeId,saved.items),'plume');
  assert.equal(saved.mixRecipes.knight[0].keepsake,'plume');
  assert.equal(G.normalizeKeepsake('plume',[]),null);assert.equal(G.normalizeKeepsake(undefined,saved.items),null);
});
test('Sky distance and plume recovery form independent choices without changing walking escape speed',()=>{
  const {G}=fixture(),p=G.state.player;
  G.state.worldwake.marks=['sky'];G.attuneWorldMark('sky');
  const distance=G.passives.prepare('dash',p,{ability:'cartwheel',dist:55}).dist;
  const walk=G.bossWalkingSpeed();G.carryKeepsake('plume');
  assert.equal(G.passives.prepare('dash',p,{ability:'cartwheel',dist:55}).dist,distance);
  assert.equal(G.bossWalkingSpeed(),walk);assert.equal(G.keepsakeSpeedScale(),1);
  assert.ok(Math.abs(G.abilityCooldown(G.abilities.cartwheel)-.6)<1e-10);
});
test('winning Aurelia exposes the optional build gift in the regional awakening',()=>{
  const r=fixture(),{G}=r;G.state.items=[];G.state.items.push('trophy-sky-sovereign');
  G.events.emit('pickup',{item:'trophy-sky-sovereign'});
  const news=r.messages.find(m=>m.speaker.includes('SKY MARK'));
  assert.ok(news);assert.match(news.text,/Sovereign's Plume/);assert.match(news.text,/Dash arts recover 25% sooner/);
  assert.match(news.text,/Area arts take 25% longer/);assert.equal(G.activeKeepsake(),null);
});
