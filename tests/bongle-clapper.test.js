const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function fixture(form='nobody'){
 const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.opening.complete=true;G.state.delivery.complete=true;
 G.state.formId=form;G.state.enemies=[];G.state.items.push('trophy-bell-titan');G.state.claimedForms=[...G.formOrder];
 G.questsDone=G.formOrder.flatMap(id=>G.forms[id].quests.map(q=>q.id));
 Object.assign(G.state.player,{x:240,y:152,dir:{x:1,y:0},mana:0,manaMax:12,manaRegenDelay:100});
 function crowd(n){return [[264,144],[264,152],[264,160],[280,152],[296,152]].slice(0,n).map(([x,y])=>{const e=G.makeEnemy('slime',x,y);e.hp=50;G.state.enemies.push(e);return e;});}
 const feedback=[],number=G.damageNumber;G.damageNumber=(x,y,text,color)=>{feedback.push(text);number(x,y,text,color);};
 return {...r,crowd,feedback};
}
test('the Clapper returns one bonus mana only for a real chain of three or more connected foes',()=>{
 for(const n of [0,1,2,3,4])for(const carried of [false,true]){
  const {G,crowd,feedback}=fixture();crowd(n);if(carried)G.carryKeepsake('clapper');G.abilities.chainLightning.use(G.state.player);
  const bonus=carried&&n>=3?1:0;assert.equal(G.state.player.mana,n+bonus);assert.equal(feedback.filter(x=>x==='+1 MANA').length,bonus);
 }
 const {G,crowd,feedback}=fixture();crowd(5);G.carryKeepsake('clapper');G.abilities.constellation.use(G.state.player);
 assert.equal(G.state.player.mana,6);assert.equal(feedback.filter(x=>x==='+1 MANA').length,1);
});
test('blocked wards and practice props cannot earn a returning note; valid ward connections can',()=>{
 for(const kind of ['wrong','matching','practice']){
  const {G,crowd,feedback}=fixture();G.carryKeepsake('clapper');const foes=crowd(3);
  for(const e of foes){if(kind==='practice')e.def={...e.def,practice:true};else e.ward={types:[kind==='matching'?'light':'sharp'],hp:8};}
  G.abilities.chainLightning.use(G.state.player);assert.equal(G.state.player.mana,kind==='matching'?1:0);
  assert.equal(feedback.filter(x=>x==='+1 MANA').length,kind==='matching'?1:0);assert.ok(foes.every(e=>e.hp===50));
 }
 const {G,crowd}=fixture();G.carryKeepsake('clapper');crowd(3);G.world.solid=(x,y)=>x>250&&x<257;
 G.abilities.chainLightning.use(G.state.player);assert.equal(G.state.player.mana,0);
});
test('full wells do not emit a false refund and other art styles receive no chain bonus',()=>{
 const {G,crowd,feedback}=fixture();G.carryKeepsake('clapper');crowd(3);G.state.player.mana=12;
 G.abilities.chainLightning.use(G.state.player);assert.equal(G.state.player.mana,12);assert.ok(!feedback.includes('+1 MANA'));
 G.state.player.mana=0;G.abilities.spinSlash.use(G.state.player);assert.equal(G.state.player.mana,3);assert.ok(!feedback.includes('+1 MANA'));
});
test('paid area arts charge at the input boundary while Handbell remains free and Resonance still answers changed styles',()=>{
 const r=fixture('bellkeeper'),{G}=r,p=G.state.player;G.carryKeepsake('clapper');G.state.loadouts.bellkeeper=['handbell','silenceRing','chainLightning'];
 p.mana=5;r.taps.add('b');G.updatePlayer(0);assert.equal(p.cooldowns.silenceRing||0,0);assert.equal(p.mana,5);
 p.mana=6;r.taps.add('b');G.updatePlayer(0);assert.equal(p.mana,0);assert.equal(p.cooldowns.silenceRing,1.3);assert.equal(p.resonanceStyle,'area');
 p.mana=4;r.taps.add('c');G.updatePlayer(0);assert.equal(p.mana,0);assert.equal(p.resonanceStyle,'chain');assert.ok(r.feedback.includes('RESONANCE!'));
 r.taps.add('a');G.updatePlayer(0);assert.equal(p.bellBeat,1);assert.equal(p.mana,0);assert.equal(G.abilityManaCost(G.abilities.handbell),0);
 assert.equal(G.abilityManaCost(G.abilities.cartwheel),2);assert.equal(G.abilityManaCost(G.abilities.chainLightning),4);assert.equal(G.keepsakeSpeedScale(),1);
});
test('Echo reach, complete build recall, trophy saves, and the optional awakening remain compatible',()=>{
 const r=fixture(),{G}=r,p=G.state.player;G.state.worldwake.marks=['echo'];G.attuneWorldMark('echo');
 const reach=G.passives.prepare('chain',p,{ability:'chainLightning',jumpRange:48,maxTargets:4});G.carryKeepsake('clapper');
 const carried=G.passives.prepare('chain',p,{ability:'chainLightning',jumpRange:48,maxTargets:4});assert.equal(carried.jumpRange,reach.jumpRange);assert.equal(carried.maxTargets,4);
 G.saveMixRecipe('nobody',0);G.carryKeepsake(null);assert.ok(G.recallMixRecipe('nobody',0));G.saveGame();const saved=G.loadSaveData();
 assert.equal(G.normalizeKeepsake(saved.keepsakeId,saved.items),'clapper');assert.equal(saved.mixRecipes.nobody[0].keepsake,'clapper');assert.equal(G.normalizeKeepsake('clapper',[]),null);
 G.carryKeepsake(null);G.state.worldwake.marks=[];G.events.emit('pickup',{item:'trophy-bell-titan'});const news=r.messages.find(m=>m.speaker.includes('ECHO MARK'));
 assert.match(news.text,/Bongle's Clapper/);assert.match(news.text,/Paid area arts cost 1 more/);assert.equal(G.activeKeepsake(),null);
});
