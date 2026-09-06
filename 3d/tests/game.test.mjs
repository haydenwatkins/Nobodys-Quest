import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,freshProgress,readProgress,saveProgress} from '../game.mjs';
import {FORMS,ARTS,LANDMARKS,HOUSES,ENEMIES,SAVE_KEY,walkable,landHeight,distance} from '../world-data.mjs';
import {surface} from '../scene.mjs';

function memory(initial={}){const values=new Map(Object.entries(initial));return {getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),values};}
function go(g,id){const p=LANDMARKS.find(l=>l.id===id);g.player.x=p.x;g.player.z=p.z;}
function slay(g,count=3){for(const e of g.enemies.filter(e=>e.type!=='warden').slice(0,count))g.hurtEnemy(e,1000);}
function allForms(g){slay(g);go(g,'hollow');g.setForm('rat');g.interact();}
function allBeacons(g){allForms(g);go(g,'tower');g.setForm('knight');g.interact();go(g,'shore');g.interact();}

test('saving and resetting the 3D adventure cannot modify classic save keys',()=>{
  const classic='{"forms":["dragon"],"hearts":9}';const s=memory({'nobodysquest':classic,'nq-save-slots':classic});const g=new Game();g.player.x=3;saveProgress(s,g);
  assert.equal(s.values.size,3);assert.equal(s.getItem('nobodysquest'),classic);assert.equal(s.getItem('nq-save-slots'),classic);assert.equal(readProgress(s).x,3);
  saveProgress(s,new Game(freshProgress()));assert.equal(s.getItem('nobodysquest'),classic);assert.equal(s.getItem('nq-save-slots'),classic);
});
test('malformed, incompatible, or inaccessible saves start safely',()=>{
  for(const v of ['not json','null','{"version":2}','[]'])assert.deepEqual(readProgress(memory({[SAVE_KEY]:v})),freshProgress());
  assert.deepEqual(readProgress({getItem(){throw Error('denied');}}),freshProgress());assert.equal(saveProgress({setItem(){throw Error('quota');}},new Game()),false);
});
test('save validation prevents invalid forms, positions, and imported progression',()=>{
  const s=memory({[SAVE_KEY]:JSON.stringify({version:1,x:Infinity,z:999,form:'dragon',art:'unknown',hp:-200,kills:-5,unlocked:['knight'],beacons:['hollow','hollow','fake'],defeated:[-1,99,'3'],chests:['bad']})});const p=readProgress(s);
  assert.equal(p.form,'nobody');assert.equal(p.art,'cartwheel');assert.equal(p.x,0);assert.equal(p.hp,1);assert.deepEqual(p.beacons,['hollow']);assert.deepEqual(p.defeated,[]);assert.deepEqual(p.chests,[]);
});
test('changing shape preserves health fraction and never heals for free',()=>{
  const g=new Game();allForms(g);g.player.hp=40;g.setForm('nobody');const ratio=g.player.hp/FORMS.nobody.hp;
  for(let i=0;i<10;i++){g.setForm('knight');assert.ok(Math.abs(g.player.hp/FORMS.knight.hp-ratio)<1e-10);g.setForm('rat');assert.ok(Math.abs(g.player.hp/FORMS.rat.hp-ratio)<1e-10);}
});
test('locked forms and their arts cannot be equipped',()=>{const g=new Game();assert.equal(g.setForm('rat'),false);assert.equal(g.setForm('knight'),false);assert.equal(g.setArt('poison'),false);assert.equal(g.setArt('spin'),false);});
test('a complete chapter can be finished and resumed without classic data',()=>{
  const g=new Game();go(g,'mayor');g.interact();assert.equal(g.progress.metMayor,true);
  slay(g);assert.ok(g.progress.unlocked.includes('rat'));go(g,'hollow');g.interact();assert.equal(g.progress.beacons.length,0);
  g.setForm('rat');g.interact();assert.ok(g.progress.unlocked.includes('knight'));assert.deepEqual(g.progress.beacons,['hollow']);
  go(g,'tower');g.interact();assert.equal(g.progress.beacons.length,1);g.setForm('knight');g.interact();
  go(g,'shore');g.interact();assert.equal(g.progress.beacons.length,3);const boss=g.enemies.at(-1);g.hurtEnemy(boss,1000);assert.equal(g.progress.won,true);
  go(g,'mayor');g.interact();assert.equal(g.progress.returned,true);assert.equal(g.quest().title,'A promise kept.');
  const s=memory();saveProgress(s,g);const restored=new Game(readProgress(s));assert.equal(restored.progress.returned,true);assert.equal(restored.enemies.at(-1).alive,false);assert.equal(restored.progress.beacons.length,3);
});
test('repeated interactions cannot duplicate lanterns, forms, or treasure',()=>{
  const g=new Game();allForms(g);g.interact();assert.equal(g.progress.beacons.length,1);assert.equal(g.progress.unlocked.length,3);
  go(g,'chest-orchard');g.interact();g.interact();assert.equal(g.progress.chests.length,1);
});
test('the Warden is invulnerable and inactive until all lanterns are lit',()=>{
  const g=new Game(),boss=g.enemies.at(-1);g.enemies=g.enemies.filter(e=>e.type==='warden');go(g,'warden');g.hurtEnemy(boss,9999);assert.equal(boss.hp,ENEMIES.warden.hp);for(let i=0;i<100;i++)g.update(.05);assert.equal(g.player.hp,100);assert.equal(boss.state,'idle');
});
test('basic attacks damage targets, honor cooldowns, and poison in Rat form',()=>{
  const g=new Game();slay(g);g.setForm('rat');const target=g.enemies.find(e=>e.alive&&e.type==='slime');g.player.x=target.x;g.player.z=target.z+2;g.attack();assert.equal(target.hp,ENEMIES.slime.hp-FORMS.rat.damage);assert.ok(target.poison>0);const hp=target.hp;g.attack();assert.equal(target.hp,hp);g.update(.05);assert.ok(target.hp<hp);
});
test('a borrowed poison art works in Knight form',()=>{
  const g=new Game();allForms(g);g.setForm('knight');assert.equal(g.setArt('poison'),true);const target=g.enemies.find(e=>e.alive&&e.type==='slime');g.player.x=target.x;g.player.z=target.z+2;g.special();g.update(.05);assert.ok(target.poison>0);assert.equal(g.player.form,'knight');
});
test('dodging and shield arts mitigate damage without creating permanent invulnerability',()=>{
  const g=new Game();g.dodge();g.hurtPlayer(20);assert.equal(g.player.hp,100);for(let i=0;i<20;i++)g.update(.05);g.hurtPlayer(20);assert.equal(g.player.hp,80);
  allForms(g);g.setForm('knight');g.setArt('spin');g.special();g.player.invulnerable=0;const hp=g.player.hp;g.hurtPlayer(20);assert.equal(g.player.hp,hp-5);
});
test('enemy attacks are telegraphed and can be escaped',()=>{
  const g=new Game(),e=g.enemies[0];g.player.x=e.x+1;g.player.z=e.z;e.cooldown=0;g.update(.05);assert.equal(e.state,'windup');assert.equal(g.player.hp,100);
  g.player.x=e.x+8;for(let i=0;i<20;i++)g.update(.05);assert.equal(g.player.hp,100);
});
test('enemy attacks connect when the player stays in the danger area',()=>{
  const g=new Game(),e=g.enemies[0];g.player.x=e.x+1;g.player.z=e.z;e.cooldown=0;for(let i=0;i<20;i++)g.update(.05);assert.ok(g.player.hp<100);
});
test('defeat returns the player to camp while preserving earned progression',()=>{
  const g=new Game();allForms(g);const defeated=[...g.progress.defeated];g.player.invulnerable=0;g.hurtPlayer(10000);assert.equal(g.player.x,0);assert.equal(g.player.z,24);assert.equal(g.player.hp,FORMS[g.player.form].hp);assert.deepEqual(g.progress.defeated,defeated);assert.ok(g.progress.beacons.includes('hollow'));assert.equal(g.enemies[0].alive,false);
});
test('gentle mode reduces hits and regenerates outside recent damage',()=>{
  const g=new Game();g.progress.gentle=true;g.hurtPlayer(20);assert.equal(g.player.hp,92);for(let i=0;i<180;i++)g.update(.05);assert.equal(g.player.hp,100);
});
test('campfires restore health and art, without changing quest progress',()=>{
  const g=new Game();g.player.hp=10;g.player.special=3;go(g,'camp');g.interact();assert.equal(g.player.hp,100);assert.equal(g.player.special,0);assert.equal(g.progress.beacons.length,0);
});
test('movement cannot tunnel through buildings or walk into deep water',()=>{
  const g=new Game(),h=HOUSES[0];assert.equal(walkable(h.x,h.z),false);g.player.x=h.x;g.player.z=h.z+8;g.move(g.player,0,-16);assert.ok(g.player.z>h.z+h.d/2);
  g.player.x=40;g.player.z=30;for(let i=0;i<20;i++)g.move(g.player,2,0);assert.ok(landHeight(g.player.x,g.player.z)>=.25);
});
test('all mission landmarks have walkable interaction space connected to town',()=>{
  const queue=[[0,24]],seen=new Set(['0,24']);for(let n=0;n<queue.length;n++){const [x,z]=queue[n];for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,key=`${nx},${nz}`;if(!seen.has(key)&&walkable(nx,nz)){seen.add(key);queue.push([nx,nz]);}}}
  for(const l of LANDMARKS)assert.ok(queue.some(([x,z])=>distance(l,{x,z})<l.radius-.4),`${l.id} must be reachable`);
});
test('curved world positions and local movement remain finite at the pole and coast',()=>{
  for(const [x,z]of [[0,0],[1,0],[0,1],[-33,-7],[30,22],[0,-36],[100,100]]){const p=surface(x,z);assert.ok([p.x,p.y,p.z].every(Number.isFinite));assert.ok(p.length()>74&&p.length()<84);}
  assert.ok(surface(0,0).distanceTo(surface(.1,0))<.2);
});
