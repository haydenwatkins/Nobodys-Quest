const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function harbour(){const r=runtime(),{G}=r;r.load('emberRidge');r.drain();G.state.opening.started=G.state.opening.complete=true;G.state.delivery.complete=true;G.state.claimedForms=['rat','knight','wizard'];G.state.items=['trophy-mire-pearl'];G.ensureTown().requests=['recipes','beacon'];G.questsDone=[...G.forms.nobody.quests.slice(0,2),G.forms.rat.quests[0],G.forms.knight.quests[0],G.forms.wizard.quests[0]].map(q=>q.id);G.state.stars=12;return r;}
test('a native bow lesson separates Ranger discovery from Frog, and the new move can be used immediately',()=>{
 const r=harbour(),{G}=r;assert.ok(G.formReady('ranger'));assert.equal(G.formReady('frog'),false);G.claimForm('ranger');r.drain();assert.equal(G.formReady('frog'),false,'claiming a fourth form is not enough');G.setForm('ranger');
 const p=G.state.player;Object.assign(p,{x:160,y:144,dir:{x:1,y:0}});G.state.enemies=[];G.state.projectiles=[];const e=G.makeEnemy('slime',280,144);e.hp=50;G.state.enemies.push(e);
 for(let i=0;i<4;i++){e.x=280;e.y=144;G.abilities.arrow.use(p);for(let frame=0;frame<20;frame++)G.combat.updateProjectiles(.05);r.drain();}
 assert.equal(G.formLevel('ranger'),2);assert.ok(G.getLoadout('ranger').includes('tripleShot'));assert.ok(e.hp<50);assert.ok(G.formReady('frog'));assert.equal(G.formReady('alchemist'),false);
 assert.equal(G.claimForm('frog'),false,'Frog waits while Ranger gets an outing, even though its old challenge stays earned');
 require('./helpers/walk-road.cjs')(r,[[12,9]]);
 for(let i=0;i<80&&!e.dead;i++){if(i%10===0)require('./helpers/walk-road.cjs')(r,[[12,9]]);e.x=280;e.y=144;G.abilities.arrow.use(p);for(let frame=0;frame<20;frame++)G.combat.updateProjectiles(.05);r.drain();}
 assert.ok(e.dead,'finish the first real encounter before changing clearings');
 const second=G.makeEnemy('slime',80,144);G.state.enemies=[second];p.dir={x:-1,y:0};for(let i=0;i<3&&!second.dead;i++){G.abilities.luckyArrow.use(p);for(let frame=0;frame<30;frame++)G.combat.updateProjectiles(.05);r.drain();}
 assert.ok(second.dead);assert.equal(G.activeFormOuting(),null);assert.ok(G.claimForm('frog'));r.drain();G.setForm('frog');p.dir={x:1,y:0};G.state.enemies=[];G.state.projectiles=[];const target=G.makeEnemy('slime',p.x+18,p.y);target.hp=50;G.state.enemies.push(target);
 for(let i=0;i<6;i++){Object.assign(target,{x:p.x+18,y:p.y});G.abilities.tongueLash.use(p);r.drain();}
 assert.equal(G.formLevel('frog'),2);assert.ok(G.getLoadout('frog').includes('croakBurst'));assert.equal(G.formReady('alchemist'),false,'Frog still has a second lesson before the next calling');
 const progress=G.formLevel('ranger');G.saveGame();assert.ok(G.loadSaveData().questsDone.includes(G.forms.ranger.quests[0].id));assert.equal(G.formLevel('ranger'),progress);
});
test('four learned earlier forms and an advanced calling earn Dragon without practicing all eight early forms',()=>{
 const r=harbour(),{G}=r;G.state.claimedForms.push('ranger','frog','alchemist');G.questsDone=['nobody','rat','knight','frog'].flatMap(id=>G.forms[id].quests.slice(0,2).map(q=>q.id));
 assert.equal(G.formReady('dragon'),false,'breadth alone is not the advanced lesson');G.questsDone.push(G.forms.alchemist.quests[0].id);assert.ok(G.formReady('dragon'));assert.equal(G.formLevel('wizard'),1);assert.equal(G.formLevel('stormcaller'),1);
 const step=G.formUnlockSteps('dragon')[0];assert.equal(step.detail,'4/4 forms at level 3');assert.match(G.unlockHint('dragon'),/4 earlier forms/);assert.ok(G.claimForm('dragon'));
 G.state.opening=G.normalizeOpening({version:1,started:true});G.questsDone=[];assert.ok(G.formUnlocked('dragon'),'previously claimed bodies remain available');
});
test('Worldbearer successor practice uses a short native encounter, and borrowed hits never advance its parent',()=>{
 const r=runtime(),{G}=r;r.load('overworld');r.drain();G.state.claimedForms=['griffin','knight'];G.state.items=['trophy-old-mason'];G.state.formId='knight';assert.equal(G.formReady('golem'),false);const p=G.state.player,e=G.makeEnemy('slime',p.x+12,p.y);e.hp=100;G.state.enemies=[e];p.dir={x:1,y:0};
 G.getLoadout('knight')[2]='wingbeat';G.abilities.wingbeat.use(p);assert.equal(G.questProgress(G.forms.griffin.quests[0]),0);
 G.setForm('griffin');for(let i=0;i<6;i++){Object.assign(e,{x:p.x+12,y:p.y});G.abilities.wingbeat.use(p);r.drain();}
 assert.equal(G.formLevel('griffin'),2);assert.ok(G.formReady('golem'));assert.ok(G.getLoadout('griffin').includes('skyDive'));assert.ok(e.hp<100);
});
test('legacy form access and partial lesson progress survive the new quotas without replaying completed credit',()=>{
 const r=harbour(),{G}=r;G.state.opening=G.normalizeOpening({version:1,started:true});G.state.claimedForms.push('ranger');assert.ok(G.formReady('frog'),'old adventures keep their prior roster eligibility');G.state.formId='ranger';const q=G.forms.ranger.quests[2];G.questCounts[q.id]=11;const stars=G.state.stars;
 const p=G.state.player,e=G.makeEnemy('slime',p.x+10,p.y);e.hp=30;G.state.enemies=[e];G.combat.damageEnemy(e,{ability:'arrow',type:'sharp',damage:1,fromX:p.x,fromY:p.y});assert.ok(G.questsDone.includes(q.id));assert.equal(G.state.stars,stars+1);
 G.combat.damageEnemy(e,{ability:'arrow',type:'sharp',damage:1,fromX:p.x,fromY:p.y});assert.equal(G.state.stars,stars+1);G.saveGame();assert.equal(G.loadSaveData().questCounts[q.id],12,'older practice is retained');
});
