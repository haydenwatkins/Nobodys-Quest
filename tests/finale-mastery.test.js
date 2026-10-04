const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(){const r=runtime(),{G}=r;G.state.worldwake.marks=['sky','stone','thread','echo','light','heart'];G.state.claimedForms=G.formOrder.filter(id=>!['nobody','god'].includes(id));r.load('overworld');r.drain();const forms=G.formOrder.filter(id=>id!=='god');G.questsDone=forms.slice(0,8).flatMap(id=>G.forms[id].quests.slice(0,2).map(q=>q.id));return {...r,forms,gate:G.maps.overworld.legend.Y};}
test('eight learned bodies and three chosen favorites open the finale without a whole-roster grind',()=>{
 const {G,forms,gate}=setup();let exam=G.finalExamMastery();assert.equal(exam.total,23);assert.equal(exam.breadthGoal,8);assert.equal(exam.broad,8);assert.equal(exam.specialists,0);assert.equal(exam.ready,false);assert.match(G.world.portalBlockReason(gate).text,/3 forms.*level 5/);
 for(const id of forms.slice(0,2))G.questsDone.push(...G.forms[id].quests.slice(2).map(q=>q.id));assert.equal(G.finalExamMastery().ready,false);assert.match(G.world.portalBlockReason(gate).text,/2\/3 mastered/);
 G.questsDone.push(...G.forms[forms[4]].quests.slice(2).map(q=>q.id));exam=G.finalExamMastery();assert.equal(exam.ready,true);assert.equal(exam.missingBreadth.length,15,'optional forms remain unlearned');assert.equal(G.world.portalBlockReason(gate),null);assert.ok(!G.guidanceRouteTarget({mapId:'godTrial',guide:'boss'}).blocked);
 assert.equal(G.formReady('god'),false,'the final victory is still required');G.state.items.push('god-spark');assert.equal(G.formReady('god'),true);assert.match(G.unlockHint('god'),/8\/8.*3\/3/);
});
test('three mastered favorites still need eight learned bodies and all six World Marks',()=>{
 const {G,forms,gate}=setup();for(const id of forms.slice(0,3))G.questsDone.push(...G.forms[id].quests.slice(2).map(q=>q.id));G.questsDone=G.questsDone.filter(id=>id!==G.forms[forms[7]].quests[1].id);
 assert.equal(G.finalExamMastery().ready,false);assert.match(G.world.portalBlockReason(gate).text,/7\/8 ready/);G.openingGoal=()=>null;G.storyChapter=()=>5;const goal=G.storyGoal();assert.equal(goal.guide,'mastery');assert.equal(goal.formId,forms[7]);assert.match(goal.objective,/8 chosen forms.*3 favorites/);
 G.questsDone.push(G.forms[forms[7]].quests[1].id);assert.equal(G.storyGoal().mapId,'godTrial');G.state.worldwake.marks.pop();assert.match(G.world.portalBlockReason(gate).text,/5\/6 awakened/);
});
