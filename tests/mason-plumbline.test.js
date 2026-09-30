const {test}=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');
function fixture(){
  const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.opening.complete=true;G.state.delivery.complete=true;
  G.state.enemies=[];G.state.items.push('trophy-old-mason');G.state.claimedForms=[...G.formOrder];
  G.questsDone=G.formOrder.flatMap(id=>G.forms[id].quests.map(q=>q.id));
  Object.assign(G.state.player,{x:240,y:152,dir:{x:1,y:0},manaRegenDelay:100,invuln:0});
  function foe(){const e=G.makeEnemy('slime',253,152);e.hp=50;G.state.enemies.push(e);return e;}
  return {...r,foe};
}
test('the Mason extends a real landed swing through an incoming blow, then the guard ends',()=>{
  for(const carrying of [false,true]){
    const {G,foe}=fixture(),p=G.state.player;foe();if(carrying)G.carryKeepsake('plumbline');
    G.abilities.slap.use(p);assert.ok(Math.abs(p.meleeGuard-(carrying?.18:.12))<1e-10);
    G.updatePlayer(.14);G.damagePlayer(1,264,152);assert.equal(p.damageTaken,carrying?0:1);
    if(carrying){G.updatePlayer(.05);G.damagePlayer(1,264,152);assert.equal(p.damageTaken,1);}
  }
});
test('misses and mismatched wards give no guard, while a valid ward hit keeps the stated rule',()=>{
  const {G,foe}=fixture(),p=G.state.player;G.carryKeepsake('plumbline');
  G.abilities.slap.use(p);assert.equal(p.meleeGuard,0);
  const e=foe();e.ward={types:['sharp'],hp:5};G.abilities.slap.use(p);assert.equal(p.meleeGuard,0);
  e.ward.types=['blunt'];G.abilities.slap.use(p);assert.ok(Math.abs(p.meleeGuard-.18)<1e-10);
  p.meleeGuard=.32;G.abilities.slap.use(p);assert.equal(p.meleeGuard,.32,'a longer Turtle-style brace must not be shortened');
});
test('the dash price is paid at the input boundary and cannot silently use the earlier cheaper cost',()=>{
  const r=fixture(),{G}=r,p=G.state.player;G.carryKeepsake('plumbline');G.state.loadouts.nobody=['slap','cartwheel'];
  p.mana=2;r.taps.add('b');G.updatePlayer(.02);assert.equal(p.mana,2);assert.equal(p.cooldowns.cartwheel||0,0);
  p.mana=3;r.taps.add('b');G.updatePlayer(.02);assert.equal(p.mana,0);assert.ok(p.dashing);
  for(const [id,cost]of [['slap',0],['arrow',0],['spinSlash',5],['chainLightning',4]])assert.equal(G.abilityManaCost(G.abilities[id]),cost);
  assert.equal(G.abilityCooldown(G.abilities.cartwheel),G.abilities.cartwheel.cooldown);
  assert.equal(G.keepsakeSpeedScale(),1);
});
test('the new gift preserves native Knight parries and complete-build ownership across saves',()=>{
  const {G}=fixture(),p=G.state.player;G.state.formId='knight';G.carryKeepsake('plumbline');
  let parry;G.events.on('parry',e=>parry=e);p.knightGuardT=.18;p.knightPerfectT=.1;p.meleeGuard=.18;
  G.damagePlayer(1,p.x+12,p.y);assert.equal(p.damageTaken,0);assert.ok(parry?.perfect);assert.equal(p.knightGuardT,0);
  G.state.worldwake.marks=['stone'];G.attuneWorldMark('stone');G.saveMixRecipe('knight',0);G.carryKeepsake(null);
  assert.equal(G.recallMixRecipe('knight',0),true);assert.equal(G.activeKeepsake().id,'plumbline');G.saveGame();
  const saved=G.loadSaveData();assert.equal(G.normalizeKeepsake(saved.keepsakeId,saved.items),'plumbline');
  assert.equal(saved.mixRecipes.knight[0].keepsake,'plumbline');assert.equal(G.normalizeKeepsake('plumbline',[]),null);
});
