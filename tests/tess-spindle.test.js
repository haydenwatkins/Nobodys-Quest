const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function fixture(form='nobody'){
 const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.opening.complete=true;G.state.delivery.complete=true;
 G.state.claimedForms=[...G.formOrder];G.questsDone=G.formOrder.flatMap(id=>G.forms[id].quests.map(q=>q.id));
 G.state.formId=form;G.state.enemies=[];G.state.items.push('trophy-silk-matriarch');
 Object.assign(G.state.player,{x:240,y:152,dir:{x:1,y:0},mana:12,manaMax:12,manaRegenDelay:100});
 function foe(x,y=152){const e=G.makeEnemy('slime',x,y);e.hp=50;G.state.enemies.push(e);return e;}
 function crowd(){return [[264,144],[264,152],[264,160],[280,144],[280,152],[280,160],[296,152]].map(([x,y])=>foe(x,y));}
 return {...r,foe,crowd};
}
test('all three actual chain arts connect one extra crowd member without increasing per-foe damage',()=>{
 for(const [form,id,limit]of [['nobody','chainLightning',4],['weaver','stitchline',5],['nobody','constellation',6]])for(const carried of [false,true]){
  const {G,crowd}=fixture(form),p=G.state.player,foes=crowd();if(carried)G.carryKeepsake('spindle');
  let hit;G.events.on('multiHit',e=>{if(e.ability===id)hit=e;});G.abilities[id].use(p);
  assert.equal(foes.filter(e=>e.hp===49).length,limit+(carried?1:0));assert.equal(hit.hits,limit+(carried?1:0));
  assert.ok(foes.every(e=>e.hp>=49));if(id==='stitchline')for(const e of foes.filter(e=>e.hp===49))assert.equal(e.status.stun.dur,.32);
 }
});
test('the extra thread respects solid walls, wrong wards, and guardian introductions',()=>{
 const {G,crowd}=fixture(),p=G.state.player,foes=crowd();G.carryKeepsake('spindle');
 const first=foes[1];first.ward={types:['sharp'],hp:8};G.abilities.chainLightning.use(p);
 assert.equal(first.hp,50);assert.equal(first.ward.hp,8);assert.equal(foes.filter(e=>e.hp===49).length,4);
 G.state.enemies=[first,foes[4]];first.ward=null;first.x=264;first.y=152;foes[4].x=295;foes[4].y=152;
 const hp=foes[4].hp;G.world.blocksProjectile=(x,y)=>x>275&&x<283;G.abilities.chainLightning.use(p);assert.equal(foes[4].hp,hp);
 const boss=G.makeEnemy('silkMatriarch',264,152);boss.bossIntroT=1;G.state.enemies=[boss];const before=boss.hp;
 G.abilities.chainLightning.use(p);assert.equal(boss.hp,before);
});
test('the projectile price is paid at cast time, lasts through equipment changes, and leaves other styles alone',()=>{
 const r=fixture(),{G}=r,p=G.state.player;G.carryKeepsake('spindle');G.getLoadout('nobody')[1]='arrow';
 r.taps.add('b');G.updatePlayer(0);const paid=G.abilities.arrow.cooldown*1.25;
 assert.equal(p.cooldowns.arrow,paid);assert.equal(G.cooldownDuration(G.abilities.arrow),paid);assert.equal(p.mana,12);
 G.carryKeepsake(null);assert.equal(G.cooldownDuration(G.abilities.arrow),paid);G.updatePlayer(paid-.01);assert.ok(p.cooldowns.arrow>0);
 G.updatePlayer(.02);assert.equal(p.cooldowns.arrow,0);G.carryKeepsake('spindle');
 for(const id of ['cartwheel','spinSlash','chainLightning','slap'])assert.equal(G.abilityCooldown(G.abilities[id]),G.abilities[id].cooldown);
 assert.equal(G.bossWalkingSpeed(),40);assert.equal(G.keepsakeSpeedScale(),1);
});
test('Thread ricochets and Echo reach combine independently with the spindle; complete builds persist its ownership',()=>{
 const {G}=fixture(),p=G.state.player;G.state.worldwake.marks=['thread','echo'];G.carryKeepsake('spindle');
 G.attuneWorldMark('thread');const arrow=G.passives.prepare('projectile',p,{ability:'arrow',ricochets:0});assert.equal(arrow.ricochets,1);
 G.attuneWorldMark('echo');const chain=G.passives.prepare('chain',p,{ability:'chainLightning',jumpRange:48,maxTargets:4});
 assert.equal(chain.maxTargets,5);assert.ok(Math.abs(chain.jumpRange-48*1.1*1.25)<1e-10);
 G.saveMixRecipe('nobody',0);G.carryKeepsake(null);assert.ok(G.recallMixRecipe('nobody',0));assert.equal(G.activeKeepsake().id,'spindle');
 G.saveGame();const saved=G.loadSaveData();assert.equal(G.normalizeKeepsake(saved.keepsakeId,saved.items),'spindle');
 assert.equal(G.normalizeKeepsake('spindle',[]),null);assert.equal(saved.mixRecipes.nobody[0].keepsake,'spindle');
});
test('Tess names the optional gift and its price on awakening, without auto-equipping it',()=>{
 const r=fixture(),{G}=r;G.events.emit('pickup',{item:'trophy-silk-matriarch'});
 const news=r.messages.find(m=>m.speaker.includes('THREAD MARK'));assert.ok(news);
 assert.match(news.text,/Tess's Spindle/);assert.match(news.text,/Chain arts can connect one extra foe/);
 assert.match(news.text,/Projectile arts take 25% longer/);assert.equal(G.activeKeepsake(),null);
});
