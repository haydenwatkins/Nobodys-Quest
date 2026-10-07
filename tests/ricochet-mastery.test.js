const {test}=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');
function setup(body='jester'){
  const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();
  G.state.opening.complete=true;G.state.delivery.complete=true;G.state.claimedForms=['jester'];G.state.formId=body;
  G.state.enemies=[];G.state.projectiles=[];const p=G.state.player;Object.assign(p,{x:240,y:152,dir:{x:1,y:0}});
  const q=G.forms.jester.quests[1];G.storyGoal=()=>({guide:'mastery',formId:'jester',questId:q.id});
  if(body!=='jester')G.getLoadout(body)[1]='wildCard';
  function foe(x,y=152){const e=G.makeEnemy('slime',x,y);e.hp=50;G.state.enemies.push(e);return e;}
  function fire(){G.abilities.wildCard.use(p);for(let i=0;i<60;i++)G.combat.updateProjectiles(.02);}
  return {...r,p,q,foe,fire};
}
test('a native Jester follows a pair and earns ricochet credit from an ordinary card',()=>{
  const {G,q,foe,fire}=setup();const first=foe(264),second=foe(264,188);
  const lead=G.guidanceTarget();assert.equal(lead.entity,first);assert.match(lead.text,/every Wild Card a bounce/);
  fire();assert.equal(first.hp,49);assert.equal(second.hp,49);assert.equal(G.questProgress(q),1);
});
test('borrowed cards keep their third-throw combat rhythm but mastery asks for Jester and credits only Jester',()=>{
  const {G,p,q,foe,fire}=setup('nobody');foe(264);foe(264,188);
  assert.equal(G.guidanceTarget().spatial,false);assert.match(G.guidanceTarget().text,/become Pocket Trouper/);
  fire();fire();fire();assert.equal(p.cardBeat,3);assert.equal(G.questProgress(q),0,'the borrowed bounce works without leveling another body');
  assert.ok(G.prepareMasteryLesson(q.id,1));assert.equal(G.state.formId,'jester');G.state.enemies.forEach((e,i)=>{e.x=264;e.y=i?188:152;});fire();assert.equal(G.questProgress(q),1);
});

test('the ricochet lead explains an empty, warded, distant, or wall-separated road',()=>{
  const {G,foe}=setup();const a=foe(264),b=foe(264,188);
  b.ward={types:['sharp'],hp:3};assert.equal(G.guidanceTarget().spatial,false);assert.match(G.guidanceTarget().text,/break their wards/);
  b.ward=null;b.def={...b.def,practice:true};assert.equal(G.guidanceTarget().spatial,false);
  b.def.practice=false;b.dead=true;assert.equal(G.guidanceTarget().spatial,false);b.dead=false;
  b.y=260;assert.match(G.guidanceTarget().text,/close together/);b.y=188;
  G.world.blocksProjectile=(x,y)=>y>=165&&y<=175;assert.equal(G.guidanceTarget().spatial,false);assert.match(G.guidanceTarget().text,/across a wall/);
  a.dead=true;assert.match(G.guidanceTarget().text,/needs two baddies/);
});
