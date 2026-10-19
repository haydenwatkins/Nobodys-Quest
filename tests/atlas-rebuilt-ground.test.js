const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup({form='nobody'}={}){const r=runtime(),{G}=r;G.state.claimedForms.push(form);if(form==='god'){G.state.worldwake.marks=['sky','stone','thread','echo','light','heart'];G.state.items.push('god-spark');G.questsDone.push(...G.formOrder.filter(id=>id!=='god').slice(0,8).flatMap((id,i)=>G.forms[id].quests.slice(0,i<3?4:2).map(q=>q.id)));}G.setForm(form);assert.equal(G.state.formId,form);Object.assign(G.state.opening,{started:true,version:2,complete:true});r.load('titanGrave');r.drain();let e=G.state.enemies.find(e=>e.id==='lastWorldbearer');if(!e){e=G.makeEnemy('lastWorldbearer',568,136);G.state.enemies.push(e);}G.state.enemies=[e];Object.assign(G.state.player,{x:480,y:136,mana:0,manaRegenDelay:1000});Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPhase:1,bossPendingAction:'atlasFault',bossTelegraphT:.001,bossRecoverT:0});G.state.bossCutscene=null;G.updateEnemies(.01);return {...r,e};}
function step(r,seconds){for(let t=0;t<seconds;t+=.025){r.step(.025);r.drain();}}
function walk(r,x,y,limit=120){const p=r.G.state.player;for(let i=0;i<limit&&Math.hypot(x-p.x,y-p.y)>2;i++){const dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy);r.G.input.vec={x:dx/d,y:dy/d};r.step(.025);r.drain();}r.G.input.vec={x:0,y:0};return Math.hypot(x-p.x,y-p.y);}
test('a free stone contact rebuilds actual walking floor while the rest of Atlas’s fault stays impassable',()=>{
 const r=setup(),{G,e}=r,p=G.state.player,h=G.state.bossHazards.find(h=>h.kind==='atlasFault');assert.ok(h,'Atlas must reshape real ground');
 const stones=G.state.enemies.filter(e=>e.guardianProp&&e.def.name==='Loose bridge stone');assert.equal(stones.length,2);const stone=stones.sort((a,b)=>a.y-b.y)[0],ward=e.ward.hp,hp=e.hp;let credit=0;for(const name of ['hit','kill'])G.events.on(name,()=>credit++);
 assert.ok(walk(r,stone.x-14,stone.y)<=2);step(r,Math.max(0,h.warning-h.t)+.05);
 const x=(h.gaps[0].left+h.gaps[0].right)/2,y=stone.y;assert.equal(G.world.solid(x,y),true);assert.ok(walk(r,x+24,y,12)>12,'native feet cannot cross the unrepaired gap');
 p.dir={x:1,y:0};G.input.takeAim=()=>({x:1,y:0,dragged:true});r.taps.add('a');step(r,.25);
 assert.equal(G.world.solid(x,y),false);assert.equal(G.world.solid(x,h.gaps[0].bottom-3),true,'repair is local');assert.ok(walk(r,x+24,y)<=2,'actual controlled feet cross the rebuilt stone');
 assert.equal(p.damageTaken,0);assert.equal(p.mana,0);assert.equal(e.ward.hp,ward);assert.equal(e.hp,hp);assert.equal(e.bossStaggerT||0,0);assert.equal(credit,0);
});

test('rebuilt footing survives a turned phase, but a committed weight still hurts and can be walked away from',()=>{
 const r=setup(),{G,e}=r,p=G.state.player,h=G.state.bossHazards.find(h=>h.kind==='atlasFault'),stone=G.state.enemies.find(e=>e.guardianProp&&e.def.name==='Loose bridge stone');
 assert.ok(walk(r,stone.x-14,stone.y)<=2);p.dir={x:1,y:0};G.input.takeAim=()=>({x:1,y:0,dragged:true});r.taps.add('a');step(r,.3);const x=(h.gaps[0].left+h.gaps[0].right)/2;
 e.hp=60;G.updateEnemies(.01);r.drain();assert.equal(e.bossPhase,2);Object.assign(e,{bossPendingAction:'atlasFault',bossTelegraphT:.001});G.updateEnemies(.01);const turned=G.state.bossHazards.find(h=>h.kind==='atlasFault');assert.equal(turned.vertical,false);
 assert.ok(walk(r,x,stone.y)<=2);step(r,Math.max(0,turned.warning-turned.t)+.05);assert.equal(G.world.solid(x,136),false,'the original rebuilt patch remains through the perpendicular crack');assert.ok(walk(r,x,160)<=2);
 G.cancelBossHazards(e);assert.ok(walk(r,x,stone.y)<=2);Object.assign(e,{bossPendingAction:'atlasWeight',bossTelegraphT:.001});G.updateEnemies(.01);const weight=G.state.bossHazards.find(h=>h.kind==='atlasWeight');assert.ok(weight,'repaired ground is useful footing, not a safe spot from the mountain');const before=p.damageTaken,at={x:weight.x,y:weight.y};step(r,weight.warning+.05);assert.equal(p.damageTaken,before+1);
 G.cancelBossHazards(e);p.invuln=0;Object.assign(e,{bossPendingAction:'atlasWeight',bossTelegraphT:.001});G.updateEnemies(.01);const next=G.state.bossHazards.find(h=>h.kind==='atlasWeight'),nextAt={x:next.x,y:next.y};assert.ok(walk(r,p.x-28,p.y)<=2);assert.equal(next.x,nextAt.x);assert.equal(next.y,nextAt.y);step(r,Math.max(0,next.warning-next.t)+.1);assert.equal(p.damageTaken,before+1,'ordinary walking leaves the fixed impact');
});


test('the final reshaping crosses both directions, with a complete ordinary walking route around their ends',()=>{
 for(const help of [false,true]){const r=setup(),{G,e}=r,p=G.state.player;G.setComfortSetting('bossAssistance',help);e.hp=30;while(e.bossPhase<3){G.updateEnemies(.01);r.drain();}Object.assign(e,{bossPendingAction:'atlasFault',bossTelegraphT:.001});G.updateEnemies(.01);const h=G.state.bossHazards.find(h=>h.kind==='atlasFault');assert.equal(h.gaps.length,2);assert.equal(h.warning,help?1.8:1.5);
 const center={x:(h.gaps[0].left+h.gaps[0].right)/2,y:(h.gaps[0].top+h.gaps[0].bottom)/2};assert.ok(walk(r,center.x-50,center.y-50)<=2);step(r,Math.max(0,h.warning-h.t)+.05);assert.ok(walk(r,center.x+50,center.y-50)<=2);assert.ok(walk(r,center.x+50,center.y+50)<=2);assert.equal(p.damageTaken,0);assert.equal(e.atlasRepairs||0,0);}
});

test('native Atlas teaches rebuilt ground and aimed weight instead of rotating unrelated attack families',()=>{
 const r=runtime(),{G}=r;Object.assign(G.state.opening,{started:true,version:2,complete:true});r.load('titanGrave');r.drain();const e=G.state.enemies.find(e=>e.id==='lastWorldbearer');G.state.enemies=[e];Object.assign(G.state.player,{x:480,y:136});Object.assign(e,{bossEngaged:true,bossIntroT:0,bossSpecialT:.01,bossPattern:0});G.state.bossCutscene=null;const seen=new Set();
 for(let i=0;i<900&&seen.size<2;i++){for(const h of G.state.bossHazards)if(h.owner===e)seen.add(h.kind);const weight=G.state.bossHazards.find(h=>h.kind==='atlasWeight');G.input.vec=weight&&Math.hypot(G.state.player.x-weight.x,G.state.player.y-weight.y)<28?{x:-1,y:0}:{x:0,y:0};r.step(.025);r.drain();}
 assert.deepEqual([...seen].sort(),['atlasFault','atlasWeight']);assert.equal(G.state.player.damageTaken,0);assert.equal(e.hp,104);assert.equal(e.ward.hp,9);
});

test('expired fault stones stop being native attack targets instead of leaving useless props behind',()=>{
 const r=setup(),{G}=r,h=G.state.bossHazards.find(h=>h.kind==='atlasFault'),stones=G.state.enemies.filter(e=>e.guardianProp);step(r,h.warning+h.active+.1);assert.ok(stones.every(e=>!G.guardianPropLive(e)));assert.equal(G.world.solid(524,136),false);
});


test('all24 actual earned worn bodies rebuild a crossing with their free basic at zero mana',()=>{
 for(const form of Object.keys(runtime().G.forms)){const r=setup({form}),{G,e}=r,p=G.state.player,h=G.state.bossHazards.find(h=>h.kind==='atlasFault'),stone=G.state.enemies.find(e=>e.guardianProp&&e.def.name==='Loose bridge stone');let credit=0;for(const name of ['hit','kill'])G.events.on(name,()=>credit++);
 assert.ok(walk(r,stone.x-14,stone.y)<=2,form);p.dir={x:1,y:0};G.input.takeAim=()=>({x:1,y:0,dragged:true});r.taps.add('a');step(r,.6);assert.equal(e.atlasRepairs,1,form);assert.equal(credit,0,form);assert.equal(p.mana,0,form);assert.equal(e.hp,104,form);assert.equal(e.ward.hp,9,form);
 step(r,Math.max(0,h.warning-h.t)+.05);assert.ok(walk(r,548,stone.y)<=2,form);assert.equal(p.damageTaken,0,form);
 }
});


test('a completed bridge never offers the same loose stone as fresh construction or counterfeit counter credit',()=>{
 const r=setup(),{G,e}=r,p=G.state.player,h=G.state.bossHazards.find(h=>h.kind==='atlasFault'),stone=G.state.enemies.find(e=>e.guardianProp);assert.ok(walk(r,stone.x-14,stone.y)<=2);p.dir={x:1,y:0};G.input.takeAim=()=>({x:1,y:0,dragged:true});r.taps.add('a');step(r,.3);assert.equal(e.atlasRepairs,1);
 G.cancelBossHazards(e);Object.assign(e,{bossPendingAction:'atlasFault',bossTelegraphT:.001});G.updateEnemies(.01);const next=G.state.bossHazards.find(h=>h.kind==='atlasFault'),stones=next.stones.filter(G.guardianPropLive);assert.equal(stones.length,1);assert.notEqual(stones[0].y,stone.y);assert.equal(e.atlasRepairs,1);
});

test('a falling-stone warning stays visibly above rebuilt ground instead of disappearing beneath the bridge paint',()=>{
 const r=setup(),{G,e}=r,p=G.state.player,stone=G.state.enemies.find(e=>e.guardianProp);assert.ok(walk(r,stone.x-14,stone.y)<=2);p.dir={x:1,y:0};G.input.takeAim=()=>({x:1,y:0,dragged:true});r.taps.add('a');step(r,.3);G.cancelBossHazards(e);assert.ok(walk(r,524,stone.y)<=2);
 const make=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']})).createCanvas,c=make(736,464),ctx=c.getContext('2d');G.drawBossHazards(ctx);const before=[...ctx.getImageData(Math.round(p.x),Math.round(p.y),1,1).data];Object.assign(e,{bossPendingAction:'atlasWeight',bossTelegraphT:.001});G.updateEnemies(.01);ctx.clearRect(0,0,736,464);G.drawBossHazards(ctx);const after=[...ctx.getImageData(Math.round(p.x),Math.round(p.y),1,1).data];assert.notDeepEqual(after,before,'the visible fixed-impact disk must survive opaque stone rendering');
});

test('occupied feet get a local walking exit without holding the entire fault open for everyone else',()=>{
 const r=setup(),{G,e}=r,p=G.state.player,h=G.state.bossHazards.find(h=>h.kind==='atlasFault');Object.assign(e,{x:524,y:160});step(r,h.warning+.05);assert.equal(G.world.solid(524,120),true,'Atlas standing at the other end must not disable this real crack');assert.equal(G.world.solid(e.x,e.y),false,'occupied feet keep usable exit ground');G.world.moveBox(e,24,0);assert.equal(e.x,548);step(r,.05);assert.equal(G.world.solid(524,160),true,'departure ground retires after actual feet leave');
 const next=setup(),h2=next.G.state.bossHazards.find(h=>h.kind==='atlasFault');Object.assign(next.G.state.player,{x:524,y:120});step(next,h2.warning+.05);assert.equal(next.G.state.player.damageTaken,1);assert.ok(walk(next,552,120)<=2,'a missed collapse still leaves an ordinary walking escape');assert.equal(next.G.state.player.damageTaken,1);
});

test('actual projectiles cross unrepaired cracks and still hurt on repaired ground',()=>{
 for(const repaired of [false,true]){const r=setup(),{G,e}=r,p=G.state.player,h=G.state.bossHazards.find(h=>h.kind==='atlasFault'),stone=G.state.enemies.find(e=>e.guardianProp);assert.ok(walk(r,stone.x-14,stone.y)<=2);p.dir={x:1,y:0};G.input.takeAim=()=>({x:1,y:0,dragged:true});r.taps.add('a');step(r,.3);assert.ok(walk(r,548,stone.y)<=2);if(repaired)assert.ok(walk(r,524,stone.y)<=2);else assert.ok(walk(r,548,167)<=2);step(r,Math.max(0,h.warning-h.t)+.05);if(!repaired)assert.equal(G.world.solid(524,167),true);
 const from={x:repaired?590:490,y:p.y-5},other=G.makeEnemy('slime',from.x,from.y+5);G.state.enemies.push(other);G.fireGuardianProjectile(other,from,{x:p.x,y:p.y-5},{speed:100,range:130,size:4,damage:1});for(let t=0;t<1.4;t+=.025)G.combat.updateProjectiles(.025);assert.equal(p.damageTaken,1,repaired?'a bridge grants no projectile immunity':'a crack grants no projectile cover');}
});

test('construction never edits base tiles or survives actual defeat, knockout, travel or reload',()=>{
 for(const action of ['death','knockout','travel','reload']){const r=setup(),{G,e}=r,p=G.state.player,grid=JSON.stringify(G.state.grid),stone=G.state.enemies.find(e=>e.guardianProp);assert.ok(walk(r,stone.x-14,stone.y)<=2);p.dir={x:1,y:0};G.input.takeAim=()=>({x:1,y:0,dragged:true});r.taps.add('a');step(r,.3);assert.equal(e.atlasRepairs,1);assert.equal(JSON.stringify(G.state.grid),grid);
 if(action==='death'){e.ward.hp=0;G.combat.damageEnemy(e,{ability:'slap',damage:200,type:'blunt',noMana:true});r.drain();assert.ok(e.dead);assert.ok(G.groundRewardFor('trophy-last-worldbearer'));}
 if(action==='knockout'){p.invuln=0;G.damagePlayer(100,e.x,e.y);assert.ok(G.state.knockout);}
 if(action==='travel')r.load('overworld');
 if(action==='reload'){G.saveGame();assert.equal(G.loadSaveData().atlasGround,undefined);r.load('titanGrave');r.drain();assert.ok(G.state.enemies.every(e=>!e.atlasRepairs));}
 assert.equal(G.atlasGapBlocked(524,160),false);const c=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']})).createCanvas(736,464),ctx=c.getContext('2d');G.drawBossHazards(ctx);assert.equal(ctx.getImageData(524,120,1,1).data[3],0,'transient bridge paint leaves with the encounter');}
});

test('Atlas presents his first construction before walking over the loose-stone cues',()=>{
 const r=runtime(),{G}=r;Object.assign(G.state.opening,{started:true,version:2,complete:true});r.load('titanGrave');r.drain();const e=G.state.enemies.find(e=>e.id==='lastWorldbearer'),at={x:e.x,y:e.y};G.state.enemies=[e];Object.assign(G.state.player,{x:e.x-88,y:e.y});let first;
 for(let i=0;i<220&&!first;i++){r.step(.025);r.drain();first=G.state.bossHazards.find(h=>h.kind==='atlasFault');}assert.ok(first);assert.equal(e.x,at.x);assert.equal(e.y,at.y);assert.equal(e.hp,104);assert.equal(e.ward.hp,9);
});

test('the opening court commits at engagement so approaching during the introduction cannot hide its stones beneath Atlas',()=>{
 const r=runtime(),{G}=r;Object.assign(G.state.opening,{started:true,version:2,complete:true});r.load('titanGrave');r.drain();const e=G.state.enemies.find(e=>e.id==='lastWorldbearer');G.state.enemies=[e];Object.assign(G.state.player,{x:480,y:136});r.step(.025);r.drain();G.input.vec={x:1,y:0};let first;for(let i=0;i<100&&!first;i++){r.step(.025);r.drain();first=G.state.bossHazards.find(h=>h.kind==='atlasFault');}G.input.vec={x:0,y:0};assert.ok(first);assert.equal((first.gaps[0].left+first.gaps[0].right)/2,524);assert.equal(e.x,568);
});
