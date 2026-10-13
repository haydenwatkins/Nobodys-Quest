"use strict";
const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(){
 const r=runtime(),{G}=r;Object.assign(G.state.opening,{started:true,complete:true});G.state.delivery.complete=true;G.state.claimedForms.push('wizard');G.setForm('wizard');r.load('sunkenMarsh');r.drain();
 const e=G.state.enemies.find(e=>e.id==='mireQueen');G.state.enemies=[e];G.state.bossCutscene=null;
 Object.assign(e,{bossEngaged:true,bossIntroT:0,bossPendingAction:'mireBubbles',bossTelegraphT:.001});
 Object.assign(G.state.player,{x:164,y:152,mana:0,manaRegenDelay:100,invuln:0});G.updateEnemies(.01);
 G.state.player.x=182;G.updateBossHazards(1.251);return {...r,e};
}
function crack(r){const {G}=r;Object.assign(G.state.player,{dir:{x:-1,y:0}});r.taps.add('a');for(let i=0;i<28;i++){r.step(.025);r.drain();}}
function volley(G,e,x,y){Object.assign(e,{bossPendingAction:'mireVolley',bossTelegraphT:.001});Object.assign(G.state.player,{x,y,invuln:0});G.updateEnemies(.01);G.updateBossHazards(.86);}
test('a free crust break leaves usable ground through continuing native reeds without a global opening',()=>{
 const r=setup(),{G,e}=r,hp=e.hp,ward=e.ward.hp;crack(r);
 assert.equal(e.mireCounters,1);assert.equal(e.hp,hp);assert.equal(e.ward.hp,ward);assert.equal(e.bossStaggerT||0,0);
 volley(G,e,140,152);assert.equal(G.state.projectiles.filter(s=>s.owner===e).length,3);
 const damage=G.state.player.damageTaken;for(let i=0;i<160;i++)G.combat.updateProjectiles(.01);
 assert.equal(G.state.player.damageTaken,damage,'standing on the chosen ground blocks the real middle reed');
 // Ground remains useful beyond the old 1.6-second stun. Walk along it using actual controls.
 G.input.vec={x:1,y:0};const x=G.state.player.x;G.updatePlayer(.2);assert.ok(G.state.player.x>x+14);G.input.vec={x:0,y:0};
 volley(G,e,140,176);for(let i=0;i<160;i++)G.combat.updateProjectiles(.01);
 assert.ok(G.state.player.damageTaken>damage,'the same volley hurts outside the chosen strip');
});
test('the channel shelters bubbles and stays useful through ordinary ward openings, with fixed ground and ownership',()=>{
 const r=setup(),{G,e}=r;crack(r);const path={...e.mireChannel};
 // Actual Dark hits still open the veil and its ordinary recovery, without deleting useful ground.
 for(let i=0;i<5;i++)G.combat.damageEnemy(e,{damage:1,type:'dark',ability:'curse',noMana:true});
 assert.equal(e.ward.hp,0);assert.deepEqual({...e.mireChannel},path);
 Object.assign(G.state.player,{x:140,y:152,invuln:0});const before=G.state.player.damageTaken;
 Object.assign(e,{bossStaggerT:0,bossPendingAction:'mireBubbles',bossTelegraphT:.001});G.updateEnemies(.01);G.updateBossHazards(.91);
 assert.equal(G.state.player.damageTaken,before);
 // A native reed with another owner is still dangerous on the strip.
 volley(G,e,140,152);const shots=G.state.projectiles.filter(s=>s.owner===e),middle=shots[1];
 middle.owner=G.makeEnemy('slime',e.x,e.y);for(let i=0;i<80;i++)G.combat.updateProjectiles(.01);
 assert.ok(G.state.player.damageTaken>before);
 e.x-=24;assert.deepEqual({...e.mireChannel},path);assert.equal(G.mireShelters({x:140,y:152},e),true);
});
test('Queen teaches useful ground before her reeds and leaves the generic radial nova out of her rotation',()=>{
 const r=runtime(),{G}=r;assert.deepEqual(Array.from(G.enemies.mireQueen.boss.patterns),['mireBubbles','mireVolley']);
});
test('a replacement changes the route and phase, defeat, knockout, travel and reload retire it honestly',()=>{
 for(const action of ['replace','phase','death','knockout','travel','reload']){
  const r=setup(),{G,e}=r;crack(r);assert.ok(G.mireShelters({x:140,y:152},e));
  if(action==='replace'){
   G.leaveMireCrust({owner:e,mireAftermath:{x:104,y:184}});const crust=G.state.enemies.find(a=>!a.dead&&a.mireCrust?.owner===e);
   G.combat.damageEnemy(crust,{damage:1,type:'dark',ability:'curse'});assert.ok(G.mireShelters({x:104,y:172},e));assert.equal(G.mireShelters({x:140,y:152},e),false);
  }
  if(action==='phase'){e.hp=20;G.updateEnemies(.01);r.drain();assert.equal(G.mireShelters({x:140,y:152},e),false);}
  if(action==='death'){e.ward.hp=0;G.combat.damageEnemy(e,{damage:100,type:'dark',ability:null,noMana:true});assert.equal(G.mireShelters({x:140,y:152},e),false);}
  if(action==='knockout'){G.state.player.invuln=0;G.damagePlayer(100,e.x,e.y);assert.ok(G.state.knockout);assert.equal(G.mireShelters({x:140,y:152},e),false);}
  if(action==='travel'){r.load('overworld');assert.equal(G.mireShelters({x:140,y:152},e),false);}
  if(action==='reload'){G.saveGame();assert.equal(JSON.stringify(G.loadSaveData()).includes('mireChannel'),false);r.load('sunkenMarsh');assert.equal(G.state.enemies.some(a=>a.mireChannel),false);}
 }
});
test('lily ground stops before an actual wall instead of promising a walking route through it',()=>{
 const r=setup(),{G,e}=r;
 // Native world cell fixture: place a real solid wall between the landed target and Queen.
 G.state.grid[9][8]={...G.state.grid[9][8],tile:'rock'};crack(r);assert.equal(e.mireCounters,1);assert.ok(G.mireShelters({x:164,y:152},e));
 assert.equal(G.world.isSafeSpawn(140,152),false);assert.equal(G.mireShelters({x:140,y:152},e),false);
 const canvas=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']})).createCanvas(256,256),ctx=canvas.getContext('2d');
 G.drawMireChannels(ctx);assert.equal(ctx.getImageData(140,152,1,1).data[3],0,'the painted strip does not cover the blocked ground');
});

test('a non-damaging dash blocked by real terrain cannot grow a route without travelling',()=>{
 const r=setup(),{G,e}=r;G.state.grid[9][8]={...G.state.grid[9][8],tile:'rock'};
 G.leaveMireCrust({owner:e,mireAftermath:{x:149,y:152}});
 const crust=G.state.enemies.find(a=>!a.dead&&a.mireCrust?.owner===e),p=G.state.player;Object.assign(p,{x:149,y:152,dir:{x:-1,y:0},mana:0});
 G.combat.dash(p,{dist:55,speed:240,damage:0});G.updatePlayer(.025);
 assert.equal(p.x,149);assert.equal(p.mana,0);assert.equal(crust.dead,false);assert.equal(e.mireCounters||0,0);
});
