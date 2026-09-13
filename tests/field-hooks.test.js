'use strict';
const assert=require('node:assert/strict');
const r=require('../tools/lib/classic-runtime.cjs')(),{G}=r;
r.load('sunriseQuay');G.state.claimedForms=['rat','knight','ranger'];G.state.known=['nobody','rat','knight','ranger'];G.state.formId='ranger';
const lesson=G.fieldMasteryReward();assert.ok(lesson);assert.equal(lesson.form.id,'ranger');
assert.match(lesson.reward,/Triple Shot/,'mastery reward names the actual next move');
G.questCounts[lesson.quest.id]=3;assert.equal(G.fieldMasteryReward().progress,3);
G.questsDone.push(lesson.quest.id);assert.notEqual(G.fieldMasteryReward().quest.id,lesson.quest.id,'completed lessons leave the tracker');
const p=G.state.player;p.x=35*16+8;p.y=20*16+8;r.drain();
assert.equal(G.deliveryCandidate(),null,'trailhead appears after the authored chapter');
G.state.delivery=G.normalizeDelivery({complete:true});let selected=null;G.ui.openExpedition=length=>{selected=length;};
assert.equal(G.deliveryCandidate().id,'manyfold');G.tryOpeningInteraction();assert.equal(selected,3);
p.damageTaken=2;p.mana=1;const before={x:p.x,y:p.y,hurt:p.damageTaken,mana:p.mana};
assert.ok(G.startManyfoldExpedition(selected));assert.equal(G.state.expeditionRun.length,3);
G.failManyfoldExpedition('Returning to the quay',true);r.drain();assert.equal(G.state.mapId,'sunriseQuay');
assert.equal(p.x,before.x);assert.equal(p.y,before.y);assert.equal(p.damageTaken,before.hurt);assert.equal(p.mana,before.mana,'opening and abandoning a run cannot heal the campaign');
assert.ok(G.startManyfoldExpedition(3));let safety=0;
while(G.state.expeditionRun){
  assert.ok(safety++<15,'short expedition must finish');const run=G.state.expeditionRun;
  if(run.phase==='route')G.chooseExpeditionRoute(run.routeChoices[0].id);
  else if(run.phase==='reward')G.chooseExpeditionDraft(0);
  else for(const e of G.state.enemies.filter(e=>!e.dead)){
    let hits=0;while(!e.dead){assert.ok(hits++<200);G.combat.damageEnemy(e,{ability:'arrow',damage:1,type:'sharp',breaksAnyWard:true,knockback:0,fromX:e.x-20,fromY:e.y});}
  }
  r.drain();
}
assert.equal(G.state.mapId,'sunriseQuay');assert.equal(G.state.expedition.victories,1);assert.equal(G.state.expedition.longestWin,3);
assert.ok(G.state.delivery.complete,'the run preserves the completed chapter');
console.log('Field hooks: truthful next reward, live progress, short-run entrance, return safety and complete three-room expedition passed.');
