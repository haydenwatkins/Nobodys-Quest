const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
const allMarks=['sky','stone','thread','echo','light','heart'];
function setup(){
 const r=runtime(),{G}=r;
 G.state.worldwake.marks=allMarks.slice();
 G.state.claimedForms=G.formOrder.filter(id=>id!=='nobody'&&id!=='god');
 r.load('overworld');r.drain();
 const forms=G.formOrder.filter(id=>id!=='god');
 G.questsDone=forms.flatMap(id=>G.forms[id].quests.slice(0,2).map(q=>q.id));
 return {...r,forms,gate:G.maps.overworld.legend.Y};
}
test('final exam uses broad level-three practice and six chosen level-five specialists',()=>{
 const {G,forms,gate}=setup();
 const exam=G.finalExamMastery();
 assert.equal(exam.total,23);
 assert.equal(exam.broad,23);
 assert.equal(exam.specialists,0);
 assert.equal(exam.ready,false);
 assert.match(G.world.portalBlockReason(gate).text,/six|6 forms.*level 5/i);
 assert.equal(G.guidanceRouteTarget({mapId:'godTrial',guide:'boss'}).blocked,true);

 for(const id of forms.slice(0,5))G.questsDone.push(...G.forms[id].quests.slice(2).map(q=>q.id));
 assert.equal(G.finalExamMastery().specialists,5);
 assert.match(G.world.portalBlockReason(gate).text,/5\/6 mastered/);
 const chosen=forms[9];
 G.questsDone.push(...G.forms[chosen].quests.slice(2).map(q=>q.id));
 assert.equal(G.finalExamMastery().ready,true);
 assert.equal(G.world.portalBlockReason(gate),null);
 assert.ok(!G.guidanceRouteTarget({mapId:'godTrial',guide:'boss'}).blocked);
 assert.equal(G.formReady('god'),false,'the God form still requires the final victory');
 G.state.items.push('god-spark');
 assert.equal(G.formReady('god'),true);
 assert.match(G.unlockHint('god'),/23\/23.*6\/6/);
});
test('six specialists do not excuse an unlearned form; story guidance names a useful lesson',()=>{
 const {G,forms,gate}=setup();
 for(const id of forms.slice(0,6))G.questsDone.push(...G.forms[id].quests.slice(2).map(q=>q.id));
 const last=forms.at(-1),missing=G.forms[last].quests[1].id;
 G.questsDone=G.questsDone.filter(id=>id!==missing);
 const exam=G.finalExamMastery();
 assert.equal(exam.specialists,6);
 assert.equal(exam.broad,22);
 assert.equal(exam.ready,false);
 assert.match(G.world.portalBlockReason(gate).text,/22\/23 ready/);
 assert.match(G.world.portalBlockReason(gate).text,new RegExp(G.forms[last].name));
 G.openingGoal=()=>null;G.storyChapter=()=>5;
 const goal=G.storyGoal();
 assert.equal(goal.guide,'mastery');
 assert.equal(goal.formId,last);
 assert.match(goal.objective,/level 3.*six chosen forms to level 5/);
 G.questsDone.push(missing);
 assert.equal(G.storyGoal().mapId,'godTrial');
});
