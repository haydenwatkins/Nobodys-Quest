const {test}=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');
for(const [form,art,cue]of [['turtle','shellJab',/third jab/],['mole','drillTap',/third eruption/],['riftblade','riftCut',/wide third cut/],['samurai','quickdraw',/third draw/]]){
  test(`${form}'s crowd lesson explains the third beat and only a live third attack earns credit`,()=>{
    const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.opening.complete=true;G.state.delivery.complete=true;
    G.state.claimedForms=[form];G.state.formId=form;const p=G.state.player;Object.assign(p,{x:240,y:152,dir:{x:1,y:0}});
    const q=G.forms[form].quests[1];G.storyGoal=()=>({guide:'mastery',formId:form,questId:q.id});
    const foes=[-6,0,6].map(dy=>{const e=G.makeEnemy('slime',253,152+dy);e.hp=50;return e;});G.state.enemies=foes;
    assert.match(G.guidanceTarget().text,cue);
    for(let beat=0;beat<3;beat++){
      G.state.time=beat*.43;foes.forEach((e,i)=>{e.x=253;e.y=146+i*6;});G.abilities[art].use(p);
      assert.equal(G.questProgress(q),beat===2?1:0);
      if(form==='turtle'&&beat===1)assert.match(G.guidanceTarget().text,/next Shell Jab is a wide brace/);
    }
    if(form==='turtle')assert.match(G.guidanceTarget().text,/3 Shell Jabs away/);
    else{
      G.state.time+=1;foes.forEach((e,i)=>{e.x=253;e.y=146+i*6;});G.abilities[art].use(p);
      assert.equal(G.questProgress(q),1,'a pause resets the chain; a fresh first beat cannot count');
    }
  });
}
