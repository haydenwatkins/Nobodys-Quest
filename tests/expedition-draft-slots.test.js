const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(){
  const r=runtime(),{G}=r;r.load('overworld');r.drain();G.state.opening.complete=true;G.state.delivery.complete=true;
  G.state.claimedForms=['rat','knight','ranger'];G.questsDone=['nobody','knight'].flatMap(id=>G.forms[id].quests.map(q=>q.id));
  G.state.formId='nobody';G.state.loadouts.nobody=['slap','cartwheel','spinSlash'];
  assert.ok(G.startManyfoldExpedition(3));r.drain();
  G.state.expeditionRun.draftOptions=[{kind:'ability',id:'arrow',name:'Arrow',icon:'🏹',text:'Choose a mix slot'}];
  return r;
}

test('an art draft can replace B or C, keeps A and the other art, and restores the campaign mix on return',()=>{
  for(const slot of [1,2]){
    const {G}=setup(),run=G.state.expeditionRun,backup=JSON.stringify(run.backup.loadouts);
    assert.ok(G.chooseExpeditionDraft(0,slot));
    assert.equal(G.getLoadout('nobody').join(','),slot===1?'slap,arrow,spinSlash':'slap,cartwheel,arrow');
    assert.equal(run.phase,'route');assert.equal(JSON.stringify(run.backup.loadouts),backup);
    assert.equal(G.chooseExpeditionDraft(0,slot),false,'one gift cannot be claimed twice');
    assert.ok(G.failManyfoldExpedition(null,true));assert.equal(G.getLoadout('nobody').join(','),'slap,cartwheel,spinSlash');
  }
});

test('invalid, basic, out-of-body, and unearned draft choices leave the reward unclaimed',()=>{
  const {G}=setup();
  for(const slot of [0,3,-1,1.5,'1',null]){
    const before=JSON.stringify(G.state);assert.equal(G.chooseExpeditionDraft(0,slot),false);assert.equal(JSON.stringify(G.state),before);
  }
  G.state.expeditionRun.draftOptions[0].id='worldheart';
  const locked=JSON.stringify(G.state);assert.equal(G.chooseExpeditionDraft(0,1),false);assert.equal(JSON.stringify(G.state),locked);
});

test('a resumed art draft remains unclaimed until a slot is chosen, with legacy calls retaining the last-slot behavior',()=>{
  const {G}=setup();G.saveGame();const save=G.loadSaveData();
  G.state.expeditionRun=G.normalizeExpeditionRun(save.expeditionRun);
  assert.equal(G.state.expeditionRun.phase,'reward');assert.equal(G.getLoadout('nobody')[1],'cartwheel');
  assert.ok(G.chooseExpeditionDraft(0));assert.equal(G.getLoadout('nobody')[2],'arrow');assert.equal(G.getLoadout('nobody')[1],'cartwheel');
});

test('a real cleared chamber still generates an earned art and allows the chosen slot',()=>{
  const r=setup(),{G}=r,run=G.state.expeditionRun;run.draftOptions=[{kind:'boon',id:'crossweave'}];G.chooseExpeditionDraft(0);
  run.routeChoices=[{id:'skirmish'}];assert.ok(G.chooseExpeditionRoute('skirmish'));
  for(const e of G.state.enemies.slice()){e.ward=null;G.combat.damageEnemy(e,{ability:'slap',damage:e.hp,type:'blunt',knockback:0});}
  assert.equal(run.phase,'reward');const index=run.draftOptions.findIndex(o=>o.kind==='ability');assert.ok(index>=0);
  const art=run.draftOptions[index].id;assert.ok(G.availableAbilities().includes(art));assert.ok(G.chooseExpeditionDraft(index,1));
  assert.equal(G.getLoadout('nobody')[1],art);assert.equal(G.getLoadout('nobody')[2],'spinSlash');
});

test('the draft menu names both replacements, effective carried costs, and passes the chosen slot to the real handler',()=>{
  const r=setup(),{G}=r;G.state.items.push('trophy-silk-matriarch');G.state.keepsakeId='spindle';
  let click;const button={dataset:{expeditionDraft:'0',expeditionSlot:'1'},addEventListener(type,fn){if(type==='click')click=fn;}};
  const menu=r.context.document.getElementById('menu');menu.querySelectorAll=s=>s==='[data-expedition-draft]'?[button]:[];
  r.run('js/engine/ui.js');G.ui.openExpedition();
  assert.match(menu.innerHTML,/Borrow in B/);assert.match(menu.innerHTML,/Replaces Cartwheel/);assert.match(menu.innerHTML,/Borrow in C/);assert.match(menu.innerHTML,/Replaces Hold the Line/);
  assert.match(menu.innerHTML,/0 mana · 0.56s recovery/);assert.match(menu.innerHTML,/A stays Slap/);
  click();assert.equal(G.state.expeditionRun.phase,'route');assert.equal(G.getLoadout('nobody')[1],'arrow');assert.equal(G.getLoadout('nobody')[2],'spinSlash');
});
