const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function fixture(form='nobody'){
 const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.opening.complete=true;G.state.delivery.complete=true;G.state.formId=form;
 G.state.items.push('trophy-last-worldbearer');G.state.enemies=[];G.state.projectiles=[];G.state.claimedForms=[...G.formOrder];G.questsDone=G.formOrder.flatMap(id=>G.forms[id].quests.map(q=>q.id));
 Object.assign(G.state.player,{x:240,y:152,dir:{x:1,y:0},mana:12,manaMax:12,manaRegenDelay:100});
 function foe(type){const e=G.makeEnemy('slime',264,152);e.hp=50;if(type)e.ward={types:[type],hp:6};G.state.enemies.push(e);return e;}
 function cast(id){G.getLoadout(G.state.formId)[1]=id;r.taps.add('b');G.updatePlayer(0);}
 return {...r,foe,cast};
}
test('actual melee and area hits chip an extra matching ward point, while projectile and chain hits retain their amount',()=>{
 for(const [id,type,chip]of [['slap','blunt',2],['spinSlash','blunt',2],['arrow','sharp',1],['chainLightning','light',1]]){
  const {G,foe}=fixture(),e=foe(type);G.carryKeepsake('lodestone');G.abilities[id].use(G.state.player);
  if(id==='arrow')for(let i=0;i<20;i++)G.combat.updateProjectiles(.02);
  assert.equal(e.ward.hp,6-chip,id);assert.equal(e.hp,50);assert.equal(e.status?.stun,undefined,'a held ward still blocks status');
 }
});
test('wrong wards and registry damage authority remain decisive, including God overrides',()=>{
 const {G,foe}=fixture(),p=G.state.player;G.carryKeepsake('lodestone');const wrong=foe('sharp');G.abilities.slap.use(p);assert.equal(wrong.ward.hp,6);assert.equal(wrong.hp,50);
 // Requested nested damage cannot relabel the registered Blunt art to Sharp.
 G.combat.damageEnemy(wrong,{ability:'slap',type:'sharp',damage:1,knockback:0});assert.equal(wrong.ward.hp,6);
 const matching=foe('blunt');G.combat.damageEnemy(matching,{ability:'slap',type:'sharp',damage:1,knockback:0});assert.equal(matching.ward.hp,4);
 G.combat.damageEnemy(wrong,{ability:'slap',type:'blunt',damage:1,breaksAnyWard:true,knockback:0});assert.equal(wrong.ward.hp,5,'overruling an unmatched ward gets no gift bonus');
 const health=foe();G.abilities.slap.use(p);assert.equal(health.hp,49,'ordinary health damage remains one');
});
test('a real boss opens only on the final enhanced ward hit and subsequent health damage remains normal',()=>{
 const {G}=fixture(),p=G.state.player;G.carryKeepsake('lodestone');const boss=G.makeEnemy('lastWorldbearer',264,152);Object.assign(boss,{bossIntroT:0,bossEngaged:true,bossTelegraphT:.5,bossPendingAction:'worldGrid'});boss.ward.hp=3;G.state.enemies=[boss];
 G.abilities.slap.use(p);assert.equal(boss.ward.hp,1);assert.equal(boss.hp,104);assert.equal(boss.bossTelegraphT,.5);
 G.abilities.slap.use(p);assert.ok(boss.ward.hp<=0);assert.equal(boss.hp,104);assert.equal(boss.bossPendingAction,null);assert.equal(boss.bossStaggerT,1.2);
 G.abilities.slap.use(p);assert.equal(boss.hp,103);
});
test('the slower dash is paid once and changing equipment cannot skip it; movement and Worldweight keep their rules',()=>{
 const r=fixture('colossus'),{G}=r,p=G.state.player;G.carryKeepsake('lodestone');r.cast('cartwheel');assert.equal(p.cooldowns.cartwheel,1);assert.equal(G.cooldownDuration(G.abilities.cartwheel),1);
 G.carryKeepsake(null);assert.equal(G.cooldownDuration(G.abilities.cartwheel),1);p.dashing=null;G.updatePlayer(.99);assert.ok(p.cooldowns.cartwheel>0);G.updatePlayer(.02);assert.equal(p.cooldowns.cartwheel,0);
 G.carryKeepsake('lodestone');p.attackPose={t:.1};assert.equal(G.passives.beforePlayerDamage(2,300,152).knockback,false);
 assert.equal(G.passives.beforePlayerDamage(2,300,152).damage,2);assert.equal(G.keepsakeSpeedScale(),1);assert.equal(G.abilityManaCost(G.abilities.cartwheel),2);
});
test('Worldheart shove, complete build recall, saves, and the final guardian awakening remain independent',()=>{
 const r=fixture(),{G}=r,p=G.state.player;G.state.worldwake.marks=['heart'];G.attuneWorldMark('heart');const shove=G.passives.prepare('melee',p,{ability:'slap',knockback:90}).knockback;G.carryKeepsake('lodestone');
 assert.equal(G.passives.prepare('melee',p,{ability:'slap',knockback:90}).knockback,shove);G.saveMixRecipe('nobody',0);G.carryKeepsake(null);assert.ok(G.recallMixRecipe('nobody',0));
 G.saveGame();const saved=G.loadSaveData();assert.equal(G.normalizeKeepsake(saved.keepsakeId,saved.items),'lodestone');assert.equal(saved.mixRecipes.nobody[0].keepsake,'lodestone');assert.equal(G.normalizeKeepsake('lodestone',[]),null);
 G.carryKeepsake(null);G.state.worldwake.marks=[];G.events.emit('pickup',{item:'trophy-last-worldbearer'});const news=r.messages.find(m=>m.speaker.includes('WORLDHEART MARK'));assert.ok(news);assert.match(news.text,/Atlas's Lodestone/);assert.match(news.text,/Dash arts take 25% longer/);assert.equal(G.activeKeepsake(),null);
});
