'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup({phase=1,encore=false,help=false,distance=60,originX=null,originY=null,playerAt=null,form='nobody'}={}){
 const r=runtime(),{G}=r;G.state.claimedForms.push(form);G.setForm(form);assert.equal(G.state.formId,form);r.load('jesterTrial');r.drain();const e=G.state.enemies.find(e=>e.id==='royalFool');G.state.enemies=[e];G.state.bossCutscene=null;if(originX!==null)e.x=originX;if(originY!==null)e.y=originY;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:phase,hp:e.def.hp*(phase===3?.3:phase===2?.6:1),tansyEncore:encore,bossTelegraphT:.01,bossPendingAction:'pieRain'});G.setComfortSetting('bossAssistance',help);Object.assign(G.state.player,{x:e.x-distance,y:e.y,mana:0,manaRegenDelay:100,damageTaken:0,invuln:0},playerAt||{});G.updateEnemies(.02);
 for(let i=0;i<12&&!G.state.enemies.some(c=>c.custardPie?.owner===e);i++){r.step(.025);r.drain();}return {...r,e};
}
function splash(r,pie,side=-1){const p=r.G.state.player;Object.assign(p,{x:pie.x+side*20,y:pie.y,dir:{x:-side,y:0}});r.G.input.takeAim=()=>({x:-side,y:0,dragged:true});r.taps.add('a');for(let i=0;i<12&&!pie.dead;i++){r.step(.025);r.drain();}assert.ok(pie.dead);}
test('a native pie splash opens a real card passage instead of stopping Tansy or unrelated pressure',()=>{
 const r=setup(),{G,e}=r,c=G.state.enemies.find(c=>c.custardPie?.owner===e),ward=e.ward.hp,hp=e.hp;
 const other=G.makeEnemy('slime',100,80),shot={owner:other,fromPlayer:false,x:100,y:80,vx:0,vy:0,range:500,startX:100,startY:80,size:2,damage:1};G.state.projectiles.push(shot);
 splash(r,c);assert.equal(e.stageCounters,1);assert.equal(e.bossStaggerT,0);assert.equal(e.ward.hp,ward);assert.equal(e.hp,hp);assert.ok(G.state.projectiles.includes(shot));
 assert.ok(G.state.bossHazards.some(h=>h.owner===e&&h.kind==='stageCards'),'the cards continue after the splash');
 for(let i=0;i<160&&!G.state.projectiles.some(s=>s.owner===e&&s.shape==='card');i++){r.step(.025);r.drain();}
 const cards=G.state.projectiles.filter(s=>s.owner===e&&s.shape==='card');assert.ok(cards.length>0,'remaining cards actually launch');
 G.input.vec={x:1,y:0};for(let i=0;i<32;i++){r.step(.025);r.drain();}G.input.vec={x:0,y:0};assert.ok(G.state.player.x>e.x-24,'the walking opening permits an approach');assert.equal(G.state.player.damageTaken,0);assert.equal(G.state.player.mana,0);
});
test('choosing a side pie opens that walking approach while an untouched pie still bursts',()=>{
 const r=setup({phase:3}),{G,e}=r;
 const pies=G.state.enemies.filter(c=>c.custardPie?.owner===e),side=pies.find(c=>c.y>e.y+30);assert.ok(side);
 splash(r,side);assert.ok(G.state.bossHazards.some(h=>h.kind==='pieRain'&&h.y===e.y),'the first pie remains dangerous');
 const p=G.state.player;Object.assign(p,{x:e.x-60,y:e.y});for(let i=0;i<50&&!p.damageTaken;i++){r.step(.025);r.drain();}assert.ok(p.damageTaken>0,'splashing a different pie does not erase this impact');
 Object.assign(p,{x:side.x-20,y:side.y,damageTaken:0});
 for(let i=0;i<160&&!G.state.projectiles.some(s=>s.owner===e&&s.shape==='card');i++){r.step(.025);r.drain();}
 p.invuln=0;const before=Math.hypot(p.x-e.x,p.y-e.y),dx=e.x-p.x,dy=e.y-1-p.y,d=Math.hypot(dx,dy);G.input.vec={x:dx/d,y:dy/d};
 for(let i=0;i<30;i++){r.step(.025);r.drain();}G.input.vec={x:0,y:0};assert.ok(Math.hypot(p.x-e.x,p.y-e.y)<before-40);assert.equal(p.damageTaken,0,'actual moving cards respect the chosen side passage');
});
test('Card Encore waits for actually slowed cards to leave before its new curtain',()=>{
 const r=setup({phase:3,encore:true,help:true}),{G,e}=r;G.state.guidance.bossRetries.jesterTrial=5;
 splash(r,G.state.enemies.find(c=>c.custardPie?.owner===e&&Math.abs(c.y-e.y)<2));const p=G.state.player;Object.assign(p,{x:e.x-80,y:e.y});
 let firstLaunch=false,encoreLaunch=false;
 for(let i=0;i<400&&!encoreLaunch;i++){
  r.step(.025);r.drain();const shots=G.state.projectiles.filter(s=>s.owner===e&&!s.dispelled),second=G.state.bossHazards.find(h=>h.kind==='stageEncore');
  if(shots.some(s=>s.stagePassage?.kind==='stageCards'))firstLaunch=true;
  if(second&&second.t>=second.delay)assert.ok(!shots.some(s=>s.stagePassage?.kind==='stageCards'),'second warning has no first-flight overlap');
  if(shots.some(s=>s.stagePassage?.kind==='stageEncore'))encoreLaunch=true;
 }
 assert.ok(firstLaunch);assert.ok(encoreLaunch);assert.equal(p.damageTaken,0);assert.equal(e.bossStaggerT,0);
});
test('a close-range side pie still changes actual cards rather than drawing an unused path outside the fan',()=>{
 const r=setup({phase:2,distance:0,originX:280}),{G,e}=r,side=G.state.enemies.find(c=>c.custardPie?.owner===e&&Math.abs(c.y-e.y)>30),fan=G.state.bossHazards.find(h=>h.kind==='stageCards');assert.ok(side);const count=fan.shots.length;
 splash(r,side);assert.ok(fan.shots.length<count,'every landed choice removes actual pressure');assert.ok(fan.shots.length>0,'the other cards stay active');
});
test('the painted passage survives native victory until the last released card leaves',()=>{
 const r=setup(),{G,e}=r;e.ward.hp=0;splash(r,G.state.enemies.find(c=>c.custardPie?.owner===e));
 for(let i=0;i<160&&!G.state.projectiles.some(s=>s.stagePassage);i++){r.step(.025);r.drain();}
 G.combat.damageEnemy(e,{damage:100,type:'sharp',noMana:true});G.updateBossHazards(.001);assert.ok(e.dead);assert.ok(G.state.projectiles.some(s=>s.stagePassage&&!s.dispelled),'native victory preserves released shots');
 const {createCanvas}=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']})),canvas=createCanvas(448,272),c=canvas.getContext('2d');G.drawBossHazards(c);
 assert.ok(c.getImageData(0,0,448,272).data.some((v,i)=>i%4===3&&v>0),'the actual render still paints the useful path');
 for(let i=0;i<160&&G.state.projectiles.some(s=>s.stagePassage);i++)G.combat.updateProjectiles(.025);
 c.clearRect(0,0,448,272);G.drawBossHazards(c);assert.equal(c.getImageData(0,0,448,272).data.some((v,i)=>i%4===3&&v>0),false,'the path retires with its actual shots');
});

test('the first actual splash opens only its own curtain instead of automatically solving Card Encore',()=>{
 const r=setup({encore:true}),{G,e}=r,first=G.state.bossHazards.find(h=>h.kind==='stageCards'),second=G.state.bossHazards.find(h=>h.kind==='stageEncore'),original=[...second.shots];splash(r,G.state.enemies.find(c=>c.custardPie?.owner===e));assert.ok(first.shots.length<original.length);assert.deepEqual([...second.shots],original,'the next curtain still has its actual original pressure');assert.equal(second.passages.length,0);assert.equal(e.stageCounters,1);assert.equal(G.state.player.mana,0);assert.equal(e.hp,54);assert.equal(e.ward.hp,6);assert.equal(e.bossStaggerT,0);
});

test('Encore offers fresh fixed pie choices only after the actual first flight; a new splash opens a different real lane',()=>{
 const r=setup({encore:true}),{G,e}=r,first=G.state.bossHazards.find(h=>h.kind==='stageCards'),second=G.state.bossHazards.find(h=>h.kind==='stageEncore');splash(r,G.state.enemies.find(c=>c.custardPie?.owner===e));const old=first.passages[0];Object.assign(G.state.player,{x:220,y:220});let launched=false,newPies=[];
 for(let i=0;i<400&&!newPies.length;i++){r.step(.025);r.drain();if(G.state.projectiles.some(s=>s.stagePassage===first))launched=true;newPies=G.state.enemies.filter(c=>!c.dead&&c.custardPie?.h.cardPassage===second);if(G.state.projectiles.some(s=>s.stagePassage===first))assert.equal(newPies.length,0,'fresh preparation never overlaps the actual first flight');}
 assert.ok(launched);assert.equal(newPies.length,2,'the second curtain has two useful actual landed choices');const choice=newPies[0];assert.ok(G.world.isSafeSpawn(choice.x,choice.y));splash(r,choice);assert.equal(second.passages.length,1);assert.ok(Math.abs(Math.atan2(Math.sin(second.passages[0]-old),Math.cos(second.passages[0]-old)))>.6,'the new gap is at least two card spacings from the first');assert.ok(second.shots.some(a=>Math.abs(Math.atan2(Math.sin(a-old),Math.cos(a-old)))<.01),'the original center now has a real incoming card');assert.ok(G.state.enemies.some(c=>!c.dead&&c.custardPie?.h.cardPassage===second),'the unchosen second pie remains independent');assert.equal(e.stageCounters,2);assert.equal(e.hp,54);assert.equal(e.ward.hp,6);assert.equal(e.bossStaggerT,0);assert.equal(G.state.player.mana,0);
});

function realWalk(r,to){const p=r.G.state.player;for(let i=0;i<220&&Math.hypot(p.x-to.x,p.y-to.y)>2;i++){const dx=to.x-p.x,dy=to.y-p.y,d=Math.hypot(dx,dy);r.G.input.vec={x:dx/d,y:dy/d};r.step(.025);r.drain();}r.G.input.vec={x:0,y:0};assert.ok(Math.hypot(p.x-to.x,p.y-to.y)<4,JSON.stringify({at:{x:p.x,y:p.y},to}));}
function actualSplash(r,pie){const {G}=r,p=G.state.player;realWalk(r,{x:pie.x-20,y:pie.y});G.input.takeAim=()=>{const dx=pie.x-p.x,dy=pie.y-p.y,d=Math.hypot(dx,dy);return{x:dx/d,y:dy/d,dragged:true};};r.taps.add('a');for(let i=0;i<35&&!pie.dead;i++){r.step(.025);r.drain();}assert.ok(pie.dead);}
test('the 80-speed body can choose either fresh Encore pie and actually approach through its moving cards with independent help',()=>{
 for(const phase of [1,3])for(const help of [false,true])for(const side of [0,1]){const r=setup({phase,encore:true,help,form:'colossus'}),{G,e}=r,p=G.state.player,first=G.state.bossHazards.find(h=>h.kind==='stageCards'),second=G.state.bossHazards.find(h=>h.kind==='stageEncore');assert.equal(G.forms.colossus.speed,80);const root=G.state.enemies.find(c=>c.custardPie?.owner===e&&Math.abs(c.y-e.y)<2);splash(r,root);realWalk(r,{x:first.x-42,y:first.y+5});
  let pies=[];for(let i=0;i<400&&!pies.length;i++){r.step(.025);r.drain();pies=G.state.enemies.filter(c=>!c.dead&&c.custardPie?.h.cardPassage===second);}assert.equal(pies.length,2);const fixed=[second.x,second.y,second.angle];actualSplash(r,pies[side]);assert.equal(second.passages.length,1);const angle=second.passages[0];realWalk(r,{x:second.x+Math.cos(angle)*66,y:second.y+Math.sin(angle)*66+5});for(let i=0;i<220&&!second.fired;i++){r.step(.025);r.drain();}assert.ok(second.fired);assert.ok(G.state.projectiles.some(s=>s.stagePassage===second&&!s.dispelled));const before=Math.hypot(p.x-second.x,p.y-second.y);realWalk(r,{x:second.x+Math.cos(angle)*20,y:second.y+Math.sin(angle)*20+5});assert.ok(Math.hypot(p.x-second.x,p.y-second.y)<before-40);assert.deepEqual([second.x,second.y,second.angle],fixed);assert.equal(p.damageTaken,0,JSON.stringify({phase,help,side}));assert.equal(p.mana,0);assert.equal(e.stageCounters,2);assert.equal(e.ward.hp,6);assert.equal(e.bossStaggerT,0);assert.equal(G.comfortSetting('bossAssistance'),help);}
});

test('a wall-side Encore keeps fresh pie choices at least two real card lanes apart',()=>{
 const r=setup({phase:3,encore:true,originX:22,originY:157,playerAt:{x:58.4,y:207.4}}),{G,e}=r,second=G.state.bossHazards.find(h=>h.kind==='stageEncore'),root=G.state.enemies.filter(c=>c.custardPie?.owner===e).sort((a,b)=>b.y-a.y)[0];assert.ok(G.world.isSafeSpawn(root.x+20,root.y));splash(r,root,1);Object.assign(G.state.player,{x:220,y:80});let pies=[];for(let i=0;i<400&&!pies.length;i++){r.step(.025);r.drain();pies=G.state.enemies.filter(c=>!c.dead&&c.custardPie?.h.cardPassage===second);}assert.ok(pies.length>0&&pies.length<=2);for(const c of pies)assert.ok(G.world.isSafeSpawn(c.x,c.y));if(pies.length===2){const angles=pies.map(c=>Math.atan2(c.y-5-second.y,c.x-second.x)),diff=Math.abs(Math.atan2(Math.sin(angles[0]-angles[1]),Math.cos(angles[0]-angles[1])));assert.ok(diff>.6,JSON.stringify({diff,pies:pies.map(c=>({x:c.x,y:c.y}))}));}
});

test('a real northern-wall card commitment launches its remaining native cards from usable floor',()=>{
 const r=setup({phase:3,encore:true,originX:425.39555855529363,originY:22.29602097374434,playerAt:{x:420.1887779905756,y:39.63201262121266}}),{G,e}=r,first=G.state.bossHazards.find(h=>h.kind==='stageCards');Object.assign(G.state.player,{x:220,y:200});for(let i=0;i<200&&!first.fired;i++){r.step(.025);r.drain();}assert.ok(first.fired);assert.equal(first.shots.length,9);assert.ok(G.state.projectiles.some(s=>s.stagePassage===first&&!s.dispelled),'remaining cards must actually leave the committed point instead of immediately colliding with the northern wall');assert.equal(e.ward.hp,6);assert.equal(e.def.hp,54);
});
