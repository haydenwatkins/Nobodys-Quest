const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function fixture(form='nobody'){
 const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.opening.complete=true;G.state.delivery.complete=true;G.state.formId=form;
 G.state.items.push('trophy-lantern-keeper');G.state.enemies=[];G.state.projectiles=[];G.state.claimedForms=[...G.formOrder];
 G.questsDone=G.formOrder.flatMap(id=>G.forms[id].quests.map(q=>q.id));Object.assign(G.state.player,{x:240,y:152,dir:{x:1,y:0},mana:12,manaMax:12,manaRegenDelay:100,invuln:0});
 function shot(dx,opts={}){const p=G.state.player,pr={x:p.x+dx,y:p.y-6,vx:-100,vy:0,size:3,damage:1,range:200,startX:p.x+dx,startY:p.y-6,fromPlayer:false,armT:0,...opts};G.state.projectiles.push(pr);return pr;}
 function cast(id){G.getLoadout(G.state.formId)[1]=id;r.taps.add('b');G.updatePlayer(0);}
 return {...r,shot,cast};
}
test('a paid input cast snuffs only the closest active hostile shot, then remaining shots can still hurt',()=>{
 const r=fixture(),{G}=r,p=G.state.player;G.carryKeepsake('ember');const far=r.shot(14),near=r.shot(12);let blocked=[];G.events.on('projectileBlock',e=>blocked.push(e));
 r.cast('spinSlash');assert.equal(p.mana,7);assert.ok(!G.state.projectiles.includes(near));assert.ok(G.state.projectiles.includes(far));
 assert.equal(blocked.length,1);assert.equal(blocked[0].kind,'ember');assert.equal(blocked[0].ability,'spinSlash');
 G.combat.updateProjectiles(.14);assert.equal(p.damageTaken,1,'snuffing one shot is not an invulnerability window');
});
test('clear paths, armed shots, and range determine eligibility; friendly shots and floor hazards survive',()=>{
 const r=fixture(),{G}=r;G.carryKeepsake('ember');const friendly=r.shot(2,{fromPlayer:true}),delayed=r.shot(4,{armT:1}),far=r.shot(61),covered=r.shot(30),clear=r.shot(-20);
 G.world.solid=(x,y)=>x>250&&x<257;const field={kind:'safeCircle',t:0,warning:1,active:1};G.state.bossHazards=[field];
 r.cast('spinSlash');assert.ok(!G.state.projectiles.includes(clear));for(const pr of [friendly,delayed,far,covered])assert.ok(G.state.projectiles.includes(pr));
 assert.equal(G.state.bossHazards[0],field);assert.equal(field.t,0);
});
test('unaffordable, cooling down, free, and non-area arts cannot extinguish a shot',()=>{
 for(const [form,id,mana]of [['nobody','spinSlash',4],['bellkeeper','handbell',0],['nobody','slap',12],['nobody','chainLightning',12]]){
  const r=fixture(form),{G}=r;G.carryKeepsake('ember');const pr=r.shot(25);G.state.player.mana=mana;r.cast(id);assert.ok(G.state.projectiles.includes(pr),id);
 }
 const r=fixture(),{G}=r;G.carryKeepsake('ember');const pr=r.shot(25);G.state.player.cooldowns.spinSlash=.5;r.cast('spinSlash');assert.ok(G.state.projectiles.includes(pr));
});
test('native Safe Light retains its full lifetime and protects later shots after the cast-time snuff',()=>{
 const r=fixture('lanternWisp'),{G}=r;G.carryKeepsake('ember');const pr=r.shot(45);r.cast('ghostlight');assert.ok(!G.state.projectiles.includes(pr));
 assert.equal(G.state.safeLights.length,1);assert.equal(G.state.safeLights[0].radius,36);assert.equal(G.state.safeLights[0].t,3.4);
 r.shot(12);r.shot(14);const outside=r.shot(50);G.combat.updateProjectiles(0);assert.equal(G.state.projectiles.length,1);assert.equal(G.state.projectiles[0],outside);assert.equal(G.state.player.damageTaken,0);
});
test('chain surcharge is paid at the input boundary; area timing, Lantern Mark, saves, and awakening remain intact',()=>{
 const r=fixture(),{G}=r,p=G.state.player;G.carryKeepsake('ember');p.mana=4;r.cast('chainLightning');assert.equal(p.cooldowns.chainLightning||0,0);assert.equal(p.mana,4);
 p.mana=5;r.cast('chainLightning');assert.equal(p.mana,0);assert.equal(p.cooldowns.chainLightning,1.05);
 assert.equal(G.abilityManaCost(G.abilities.ghostlight),4);assert.equal(G.abilityManaCost(G.abilities.handbell),0);assert.equal(G.abilityCooldown(G.abilities.ghostlight),1.05);
 G.state.worldwake.marks=['light'];G.attuneWorldMark('light');const radius=G.passives.prepare('area',p,{ability:'ghostlight',range:39}).range;
 G.carryKeepsake(null);assert.equal(G.passives.prepare('area',p,{ability:'ghostlight',range:39}).range,radius);G.carryKeepsake('ember');G.saveMixRecipe('nobody',0);G.carryKeepsake(null);
 assert.ok(G.recallMixRecipe('nobody',0));G.saveGame();const saved=G.loadSaveData();assert.equal(G.normalizeKeepsake(saved.keepsakeId,saved.items),'ember');assert.equal(saved.mixRecipes.nobody[0].keepsake,'ember');
 G.carryKeepsake(null);G.state.worldwake.marks=[];G.events.emit('pickup',{item:'trophy-lantern-keeper'});const news=r.messages.find(m=>m.speaker.includes('LANTERN MARK'));
 assert.ok(news);assert.match(news.text,/Mallow's Ember/);assert.match(news.text,/Chain arts cost 1 more mana/);assert.equal(G.activeKeepsake(),null);
});
