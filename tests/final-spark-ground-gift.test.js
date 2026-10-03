const test=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
const collect=require('./helpers/collect-treasure.cjs'),cross=require('./helpers/cross-road.cjs');
test('Meridian leaves a saved Spark; physical collection pays the final bundle and ending once, with roads still open',()=>{
 const r=runtime(),{G}=r;G.state.opening.complete=G.state.delivery.complete=true;G.state.stars=40;Object.assign(G.ensureTown(),{founded:true,introduced:true,residents:4,spirit:20});
 G.state.items=Object.values(G.enemies).filter(e=>e.miniboss&&e.trophy&&e.id!=='godAvatar').map(e=>e.trophy);
 G.state.worldwake=G.normalizeWorldwake({favorsDone:G.WORLDWAKE_FAVORS.map(f=>f.id)},G.state);
 G.state.claimedForms=G.formOrder.filter(f=>!['nobody','god'].includes(f));G.questsDone=G.formOrder.filter(f=>f!=='god').flatMap(f=>G.forms[f].quests.map(q=>q.id));
 G.state.story=G.normalizeStory({prologueSeen:true,seenChapters:[0,1,2,3,4,5],lastChapter:5});
 // Minimal DOM supplies the actual ending's close control; browser coverage
 // below proves layout, touch and TV input against the real document.
 const overlay=r.context.document.getElementById('story-ending');let close,opens=0;
 const button={focus:()=>opens++,addEventListener:(_,fn)=>close=fn,click:()=>close()};overlay.querySelector=()=>button;
 r.load('overworld');r.drain();G.beginStorySession(G.loadSaveData());r.drain();
 assert.ok(G.finalExamMastery().ready);cross(r,'godTrial');assert.equal(G.formReady('god'),false);
 const e=G.state.enemies.find(e=>e.id==='godAvatar');e.bossEngaged=true;e.bossIntroT=0;G.state.bossCutscene=null;
 const stars=G.state.stars;
 G.combat.damageEnemy(e,{damage:e.ward.hp,type:'dark',knockback:0});G.combat.damageEnemy(e,{damage:100,type:'dark',knockback:0});r.drain();const spirit=G.ensureTown().spirit;
 assert.ok(e.dead);assert.ok(G.groundRewardFor('god-spark'));assert.equal(G.state.stars,stars);
 assert.equal(G.storyComplete(),false);assert.equal(G.storyEndingOpen,false);assert.equal(G.ensureStory().endingSeen,false);
 assert.equal(G.formReady('god'),false);assert.equal(G.heroBoardUnlocked(),false);assert.equal(G.storyGoal().itemId,'god-spark');
 G.saveGame();const pending=G.loadSaveData();assert.ok(pending.groundRewards.some(g=>g.item==='god-spark'));
 cross(r,'overworld');cross(r,'godTrial');assert.ok(!G.state.enemies.some(e=>e.id==='godAvatar'));
 G.state.groundRewards=G.normalizeGroundRewards(pending.groundRewards);r.load('godTrial');r.drain();
 assert.ok(!G.state.enemies.some(e=>e.id==='godAvatar'));assert.equal(G.storyEndingOpen,false);
 const gift=G.groundRewardFor('god-spark');Object.assign(G.state.player,{x:gift.x+20,y:gift.y});collect(r,'god-spark');
 assert.equal(G.state.stars,stars+4,'one gift star plus the separate three-star Compass');assert.equal(G.ensureTown().spirit,spirit+20);
 assert.ok(G.heroBoardUnlocked());assert.ok(G.formReady('god'));assert.ok(G.formEchoFor('god'));assert.ok(!G.state.claimedForms.includes('god'));
 assert.ok(G.storyComplete());assert.ok(G.ensureStory().endingSeen);assert.ok(G.storyEndingOpen);assert.equal(opens,1);
 assert.ok(overlay.innerHTML.includes(`<strong>${stars+4}</strong> stars`),'ending sees the fully credited collection bundle');
 button.click();assert.equal(G.storyEndingOpen,false);G.storyCheck();r.drain();assert.equal(opens,1);
 G.saveGame();const owned=G.loadSaveData();assert.ok(owned.story.endingSeen);assert.ok(!owned.groundRewards.some(g=>g.item==='god-spark'));
 cross(r,'overworld');cross(r,'godTrial');r.drain();assert.ok(G.state.enemies.some(e=>e.id==='godAvatar'),'original optional rematch remains');
 const rematch=G.makeEnemy('godAvatar',e.x,e.y);rematch.ward.hp=0;G.combat.damageEnemy(rematch,{damage:100,type:'dark',knockback:0});r.drain();
 assert.equal(G.state.stars,stars+4);assert.equal(G.ensureTown().spirit,spirit+20);assert.equal(opens,1);
 assert.equal(G.normalizeGroundRewards(pending.groundRewards).length,0,'owned legacy Spark cannot replay credit');
 G.questsDone=[];assert.equal(G.formReady('god'),false,'the maintained Roadlight path still requires mastery');
});
