import test from 'node:test';
import assert from 'node:assert/strict';
import {Game,freshProgress,readProgress,saveProgress} from '../game.mjs';
import {WEAPONS,ENEMIES,LANDMARKS,SPAWNS,SAVE_KEY,walkable,inStrike} from '../world-data.mjs';
const tick=(g,n=60)=>{for(let i=0;i<n;i++)g.update(1/60);};
function duel(weapon='shear'){const g=new Game();g.player.x=0;g.player.z=0;g.player.yaw=0;g.player.weapon=weapon;for(const e of g.enemies)e.alive=false;const e=g.enemies[0];Object.assign(e,{alive:true,x:0,z:3,hp:1000,cooldown:100});return [g,e];}
test('weapon contact happens after windup, once per strike, followed by recovery',()=>{for(const id of Object.keys(WEAPONS)){const [g,e]=duel(id);assert.equal(g.attack(),true);assert.equal(g.attack(),false);g.update(.05);assert.equal(e.hp,1000);tick(g,25);const hp=e.hp;assert.ok(hp<1000);tick(g,45);assert.equal(e.hp,hp);assert.equal(g.player.attack,null);}});
test('directional attacks exclude enemies behind and lance excludes wide flank',()=>{assert.equal(inStrike({x:0,z:0,yaw:0},{x:0,z:-2},10,3),false);const [g,e]=duel('pike');g.player.move=1;e.x=3;g.attack();tick(g);assert.equal(e.hp,1000);});
test('third cut is stronger and combo resets after inactivity',()=>{const [g,e]=duel();const damage=[];for(let i=0;i<3;i++){g.player.x=0;g.player.z=0;e.x=0;e.z=3;const hp=e.hp;g.attack();tick(g,30);damage.push(hp-e.hp);}assert.ok(damage[2]>damage[0]);tick(g,100);g.attack();assert.equal(g.player.combo,0);});
test('vent spends pressure, pierces a line, and cannot fire without fuel',()=>{const [g,e]=duel('pike');e.z=15;const e2=g.enemies[1];Object.assign(e2,{alive:true,x:0,z:9,hp:1000,cooldown:100});assert.equal(g.vent(),true);assert.equal(g.player.charge,0);tick(g);assert.ok(e.hp<1000&&e2.hp<1000);g.player.charge=0;assert.equal(g.vent(),false);});
test('hammer breaks posture and exposed cores take extra damage',()=>{const [g,e]=duel('maul');g.attack();tick(g,25);assert.equal(e.state,'stagger');const hp=e.hp;g.hurtEnemy(e,10);assert.equal(hp-e.hp,14.5);});
test('perfect evade rewards pressure and protects from damage',()=>{const [g,e]=duel();Object.assign(e,{state:'windup',timer:.2,attackX:0,attackZ:3,attackYaw:Math.PI});const charge=g.player.charge;assert.equal(g.dodge(),true);assert.equal(g.player.charge,charge+20);g.hurtPlayer(100);assert.equal(g.player.hp,120);assert.equal(g.dodge(),false);});
test('evade cancels windup but cannot cancel a committed hit',()=>{const [g]=duel('maul');g.attack();assert.equal(g.dodge(),true);assert.equal(g.player.attack,null);tick(g,90);g.attack();tick(g,24);assert.equal(g.player.attack.hit,true);assert.equal(g.dodge(),false);});
test('death returns to anchorage, keeps objectives and clears projectiles',()=>{const g=new Game();g.progress.teeth.push('west');g.shots.push({id:1});g.hurtPlayer(999);assert.deepEqual([g.player.x,g.player.z,g.player.hp],[0,25,120]);assert.deepEqual(g.progress.teeth,['west']);assert.equal(g.shots.length,0);});
test('gentle mode reduces damage and heals out of combat',()=>{const g=new Game();g.progress.gentle=true;g.hurtPlayer(20);assert.equal(g.player.hp,111);tick(g,420);assert.equal(g.player.hp,120);});
test('full objective sequence: briefing, guarded teeth, engine, return, survey cases',()=>{const g=new Game();const visit=id=>{const l=LANDMARKS.find(l=>l.id===id);Object.assign(g.player,{x:l.x,z:l.z});g.interact();};visit('sera');assert.equal(g.progress.briefed,true);const boss=g.enemies.find(e=>e.type==='engine');assert.equal(g.active(boss),false);visit('west');assert.equal(g.progress.teeth.length,0);for(const e of g.enemies)if(e!==boss)g.hurtEnemy(e,9999);for(const id of ['west','north','east'])visit(id);assert.equal(g.progress.teeth.length,3);assert.equal(g.active(boss),true);assert.equal(g.quest().target.id,'engine');g.hurtEnemy(boss,9999);assert.equal(g.progress.won,true);assert.equal(g.quest().target.id,'sera');visit('sera');assert.equal(g.progress.returned,true);for(const id of ['cache-a','cache-b','cache-c'])visit(id);assert.equal(g.maxHP,150);visit('cache-a');assert.equal(g.maxHP,150);});
test('saves use isolated key, round trip progress, and tolerate corrupt/unavailable storage',()=>{const values=new Map([['nq.save','legacy untouched']]);const storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};const g=new Game();g.progress.teeth=['west'];g.player.weapon='maul';assert.equal(saveProgress(storage,g),true);assert.equal(readProgress(storage).weapon,'maul');assert.deepEqual(readProgress(storage).teeth,['west']);assert.equal(values.get('nq.save'),'legacy untouched');values.set(SAVE_KEY,'{broken');assert.deepEqual(readProgress(storage),freshProgress());assert.equal(saveProgress({setItem(){throw Error();}},g),false);});
test('all objectives and enemy spawn areas reachable from anchorage',()=>{const todo=[[0,25]],seen=new Set(['0,25']);for(let i=0;i<todo.length;i++){const [x,z]=todo[i];for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,key=nx+','+nz;if(!seen.has(key)&&walkable(nx,nz)&&walkable(x+dx*.5,z+dz*.5)){seen.add(key);todo.push([nx,nz]);}}}for(const l of [...LANDMARKS,...SPAWNS.map(([id,x,z])=>({id,x,z,radius:3}))])assert.ok(todo.some(([x,z])=>Math.hypot(x-l.x,z-l.z)<Math.min(3,l.radius)),l.id+' is unreachable');});

test('pre-expansion saves keep their first 20 enemy IDs and unlock the next mission',()=>{const old={version:1,briefed:true,won:true,returned:true,teeth:['west','north','east'],defeated:[0,3,19],hp:100};const p=readProgress({getItem:()=>JSON.stringify(old)}),g=new Game(p);assert.equal(g.enemies[19].type,'engine');assert.equal(g.enemies[19].alive,false);assert.equal(g.enemies[3].alive,false);assert.equal(g.enemies[20].alive,true);assert.deepEqual(p.relays,[]);assert.equal(g.quest().target.id,'iona');});
test('Stormline Rescue requires both waves at each relay, gates its boss, and grants a persistent reward',()=>{const g=new Game();Object.assign(g.progress,{briefed:true,won:true,returned:true});const visit=id=>{const l=LANDMARKS.find(l=>l.id===id);Object.assign(g.player,{x:l.x,z:l.z});g.interact();};const boss=g.enemies.find(e=>e.type==='harrow');assert.equal(g.active(boss),false);visit('relay-west');assert.equal(g.progress.relayStarted.length,0);visit('iona');assert.equal(g.progress.rescueBriefed,true);for(const id of ['relay-west','relay-east']){visit(id);const foes=g.enemies.filter(e=>e.relay===id);assert.equal(foes.filter(e=>g.active(e)).length,3);visit(id);assert.equal(g.progress.relays.includes(id),false);for(const e of foes.filter(e=>e.wave===1))g.hurtEnemy(e,9999);assert.equal(foes.filter(e=>g.active(e)).length,3);for(const e of foes.filter(e=>e.wave===2))g.hurtEnemy(e,9999);visit(id);assert.equal(g.progress.relays.includes(id),true);}assert.equal(g.active(boss),true);assert.equal(g.quest().target.id,'harrow');g.hurtEnemy(boss,9999);assert.equal(g.progress.rescueWon,true);visit('iona');assert.equal(g.maxHP,140);assert.equal(g.ventCost,20);g.player.charge=20;assert.equal(g.vent(),true);assert.equal(g.player.charge,0);visit('iona');assert.equal(g.maxHP,140);let data;saveProgress({setItem:(_,v)=>data=v},g);const restored=new Game(readProgress({getItem:()=>data}));assert.equal(restored.maxHP,140);assert.equal(restored.ventCost,20);assert.equal(restored.enemies.find(e=>e.type==='harrow').alive,false);});
test('a partially cleared relay resumes without reviving defeated patrols',()=>{const g=new Game();Object.assign(g.progress,{returned:true,rescueBriefed:true,relayStarted:['relay-west']});const wave=g.enemies.filter(e=>e.relay==='relay-west'&&e.wave===1);g.hurtEnemy(wave[0],9999);let data;saveProgress({setItem:(_,v)=>data=v},g);const restored=new Game(readProgress({getItem:()=>data}));assert.equal(restored.enemies.filter(e=>e.relay==='relay-west'&&restored.active(e)).length,2);assert.equal(restored.relayWave('relay-west'),1);restored.hurtPlayer(9999);assert.equal(restored.enemies[wave[0].id].alive,false);assert.deepEqual(restored.progress.relayStarted,['relay-west']);});
test('Harrow telegraphs a three-shot volley, expands to five below half health, and exposes its core',()=>{const g=new Game();Object.assign(g.progress,{rescueBriefed:true,relays:['relay-west','relay-east']});const boss=g.enemies.find(e=>e.type==='harrow');g.player.x=0;g.player.z=25;Object.assign(boss,{state:'windup',timer:.01,attackYaw:0});g.update(.02);assert.equal(g.shots.length,3);g.shots=[];Object.assign(boss,{hp:400,state:'windup',timer:.01});g.update(.02);assert.equal(g.shots.length,5);g.hurtEnemy(boss,1,120);assert.equal(boss.state,'stagger');});


test('a late strike tap buffers exactly one combo, including through impact freeze',()=>{
 for(const id of Object.keys(WEAPONS)){
  const [g,e]=duel(id);e.alive=false;g.attack();
  while(g.player.attack.duration-g.player.attack.age>.14)g.update(.01);
  assert.equal(g.attack(),false);g.hitstop=.09;tick(g,17);
  assert.equal(g.player.attack.combo,1);assert.equal(g.player.buffer,null);
  tick(g,90);assert.equal(g.player.attack,null);
  assert.equal(g.events.filter(e=>e.type==='windup').length,2);
 }
});
test('a requested vent takes priority over held strikes in the recovery buffer',()=>{
 const [g,e]=duel();e.alive=false;g.attack();tick(g,15);g.vent();
 for(let i=0;i<8;i++){g.attack();g.update(1/60);}
 assert.equal(g.player.attack.vent,true);assert.equal(g.player.charge,0);
});
test('shots stop at solid cover and still damage the player in open ground',()=>{
 const g=new Game();for(const e of g.enemies)e.alive=false;
 Object.assign(g.player,{x:0,z:0});
 g.shots=[{id:1,x:0,z:15,vx:0,vz:100,life:1,damage:40}];
 g.update(.05);assert.equal(g.shots.length,0);assert.equal(g.player.hp,120);
 g.shots=[{id:2,x:0,z:-2,vx:0,vz:30,life:1,damage:40}];
 g.update(.05);assert.equal(g.player.hp,80);assert.equal(g.shots.length,0);
});
test('crowds reserve at most two simultaneous windups near the player',()=>{
 const g=new Game();for(const e of g.enemies)e.alive=false;Object.assign(g.player,{x:0,z:0});
 for(let i=0;i<4;i++)Object.assign(g.enemies[i],{type:'mite',alive:true,x:(i-1.5)*.4,z:2,homeX:0,homeZ:2,cooldown:0});
 g.update(.01);assert.equal(g.enemies.filter(e=>e.state==='windup').length,2);
});
test('movement settles quickly when the stick is released',()=>{
 const g=new Game();for(const e of g.enemies)e.alive=false;Object.assign(g.player,{x:0,z:0});
 for(let i=0;i<30;i++)g.update(1/60,{x:1,z:0});const x=g.player.x;
 tick(g,15);assert.ok(g.player.x-x<.4);assert.ok(Math.abs(g.player.vx)<.03);
});
