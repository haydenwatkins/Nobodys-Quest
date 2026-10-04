const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(){
  const r=runtime(),{G}=r;G.state.delivery=G.normalizeDelivery({complete:true});G.state.opening.complete=true;
  G.state.town.followedRequest='beacon';G.state.claimedForms=['rat','ranger','wizard'];r.load('sunriseQuay');r.drain();
  G.state.formId='nobody';G.state.loadouts.nobody=['slap','bite','arrow'];
  G.state.items.push('trophy-sky-sovereign');G.state.worldwake.marks=['sky'];G.state.worldwake.attunedMark='sky';G.state.keepsakeId='plume';
  G.state.lessonQuestId=G.forms.nobody.quests[0].id;
  Object.assign(G.state.player,{mana:7,manaRegenProgress:.3,cooldowns:{arrow:.4},cooldownDurations:{arrow:.45}});
  return r;
}

test('borrowing a boss counter keeps and recalls the complete previous build without refilling or resetting recovery',()=>{
  const {G}=setup(),p=G.state.player,before=JSON.stringify(p),lesson=G.state.lessonQuestId;
  assert.equal(G.bossPreparation().ready,false);assert.ok(G.equipBossPreparation('curse',1));
  assert.equal(G.getLoadout('nobody')[1],'curse');assert.equal(G.bossPreparation().ready,true);
  const card=G.mixRecipes('nobody')[0];assert.equal(card.arts.join(','),'slap,bite,arrow');
  assert.equal(card.mark,'sky');assert.equal(card.keepsake,'plume');assert.equal(card.lesson,lesson);
  assert.equal(JSON.stringify(p),before);G.saveGame();const saved=G.loadSaveData();
  G.state.mixRecipes=G.normalizeMixRecipes(saved.mixRecipes);assert.ok(G.recallMixRecipe('nobody',0));
  assert.equal(G.getLoadout('nobody')[1],'bite');assert.equal(G.state.lessonQuestId,lesson);assert.equal(JSON.stringify(p),before);
  assert.ok(G.equipBossPreparation('curse',1));assert.equal(G.mixRecipes('nobody').filter(Boolean).length,1,'the same complete build does not fill another card');
});

test('different followed lessons and old arts-only cards do not stand in for a complete current build',()=>{
  const {G}=setup();const old=G.getLoadout('nobody').slice();G.state.mixRecipes={nobody:[old,null,null]};
  assert.equal(G.keepCurrentMixRecipe('nobody'),1);assert.equal(JSON.stringify(G.mixRecipes('nobody')[0]),JSON.stringify(old));
  const first=G.state.lessonQuestId;G.state.lessonQuestId=G.forms.nobody.quests[2].id;
  assert.equal(G.keepCurrentMixRecipe('nobody'),2);assert.equal(G.mixRecipes('nobody')[1].lesson,first);
  assert.equal(G.mixRecipes('nobody')[2].lesson,G.state.lessonQuestId);
});

test('full cards are preserved and invalid boss-counter actions create no backup',()=>{
  const {G}=setup();for(let i=0;i<3;i++)G.saveMixRecipe('nobody',i);
  // Distinct saved builds: none matches the current complete build.
  for(const card of G.mixRecipes('nobody'))card.mark=null;
  const saved=JSON.stringify(G.state.mixRecipes);
  assert.equal(G.equipBossPreparation('curse',0),false);assert.equal(G.equipBossPreparation('slap',1),false);
  assert.equal(JSON.stringify(G.state.mixRecipes),saved);assert.ok(G.equipBossPreparation('curse',1));
  assert.equal(JSON.stringify(G.state.mixRecipes),saved);
});

test('the Journal states whether a counter can keep the old build on a free card',()=>{
  const r=setup(),{G}=r,menu=r.context.document.getElementById('menu');r.run('js/engine/ui.js');G.ui.openMenu();
  assert.match(menu.innerHTML,/An unused recipe card keeps your previous build before borrowing/);
  for(let i=0;i<3;i++)G.saveMixRecipe('nobody',i);for(const card of G.mixRecipes('nobody'))card.mark=null;
  G.ui.closeMenu();G.ui.openMenu();assert.match(menu.innerHTML,/Your recipe cards are full/);
});
