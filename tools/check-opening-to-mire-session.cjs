#!/usr/bin/env node
// One fresh simulation: no ownership, lesson, item, position, health or mana
// grants. Original AI and native engine movement, attacks and world choices.
// Dialogue callbacks are acknowledged immediately; simulation time omits
// reading, visual transitions and hit-stop. This is not a human pace estimate.
// Saved checkpoints are output from this earned journey for browser review.
'use strict';
const assert=require('node:assert/strict'),runtime=require('./lib/classic-runtime.cjs'),fs=require('node:fs'),path=require('node:path');
const r=runtime(),{G}=r,p=G.state.player;const out=process.argv[2]||'/tmp/nq-campaign-session';fs.mkdirSync(out,{recursive:true});let seed=Number(process.env.SESSION_SEED)||0x12345678;r.context.Math=Object.create(Math);r.context.Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
let pages=0,knockouts=0;const history=[];G.input.takeAim=()=>({...G.input.aim,dragged:true});
G.events.on('formUnlock',e=>mark('unlock '+e.form));G.events.on('questDone',e=>mark('lesson '+e.form));G.events.on('ko',()=>knockouts++);
function mark(label){const v={label,seconds:+G.state.time.toFixed(2),map:G.state.mapId,form:G.state.formId,levels:Object.fromEntries(G.unlockedForms().map(id=>[id,G.formLevel(id)])),stars:G.state.stars,health:G.playerMaxHearts()-p.damageTaken,pages,knockouts};history.push(v);G.saveGame();fs.writeFileSync(path.join(out,label.replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'.json'),JSON.stringify(G.loadSaveData(),null,2));console.log(JSON.stringify(v));}
function drain(){while(r.messages.length){const m=r.messages.shift();pages++;if(m.options?.onClose)m.options.onClose();if(m.options?.offer)m.options.offer.onAccept();}}
function step(){if(G.state.knockout){G.state.time+=.025;G.updateKnockout(.025);}else if(G.state.bossCutscene){G.state.time+=.025;r.taps.add('a');G.updateBossCutscene(.025);}else r.step(.025);drain();}
function aim(x,y){const dx=x-p.x,dy=y-p.y,d=Math.hypot(dx,dy)||1;G.input.aim={x:dx/d,y:dy/d};}
function defend(){const e=G.state.enemies.filter(e=>!e.dead&&!e.def.practice&&!e.def.miniboss).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];if(!e)return;const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<28){aim(e.x,e.y);r.taps.add('a');if(G.state.formId==='knight'&&d<27)r.taps.add('b');}if(G.state.formId==='wizard'&&d<105){aim(e.x,e.y);r.taps.add('a');if(e.status?.poison&&p.mana>=3)r.taps.add('b');}}
function pathTo(x,y){const start=[Math.floor(p.x/16),Math.floor(p.y/16)],key=x+','+y,q=[start],prev=new Map([[start.join(','),null]]);for(let i=0;i<q.length&&!prev.has(key);i++)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const [cx,cy]=q[i],nx=cx+dx,ny=cy+dy,k=nx+','+ny;if(prev.has(k)||!(G.world.isSafeSpawn(nx*16+8,ny*16+8)||(nx===x&&ny===y&&!G.world.solid(nx*16+8,ny*16+8))))continue;prev.set(k,[cx,cy]);q.push([nx,ny]);}assert.ok(prev.has(key),'path '+JSON.stringify({map:G.state.mapId,from:start,to:[x,y],form:G.state.formId}));const points=[];let a=[x,y];while(a){points.unshift(a);a=prev.get(a.join(','));}return points;}
function walk(x,y,{combat=true}={}){const map=G.state.mapId;for(const [tx,ty]of pathTo(x,y)){for(let i=0;i<600&&G.state.mapId===map&&Math.hypot(tx*16+8-p.x,ty*16+8-p.y)>2;i++){const dx=tx*16+8-p.x,dy=ty*16+8-p.y,d=Math.hypot(dx,dy)||1;G.input.vec={x:dx/d,y:dy/d};if(combat)defend();step();}if(G.state.mapId!==map)break;assert.ok(Math.hypot(tx*16+8-p.x,ty*16+8-p.y)<=2,'stuck '+JSON.stringify({map,x:p.x,y:p.y,tx,ty,health:G.playerMaxHearts()-p.damageTaken}));}G.input.vec={x:0,y:0};}
function interact(x,y){walk(x,y);G.input.vec={x:0,y:0};r.taps.add('interact');step();}
function clear(id){for(let i=0;i<16000&&G.state.enemies.some(e=>!e.dead&&e.id===id);i++){const e=G.state.enemies.filter(e=>!e.dead&&e.id===id).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];const d=Math.hypot(e.x-p.x,e.y-p.y),poison=G.state.formId==='rat'&&e.status?.poison?.dur>0;let target={x:e.x,y:e.y+18};if(poison)target={x:e.x-37,y:e.y};const dx=target.x-p.x,dy=target.y-p.y,len=Math.hypot(dx,dy)||1;G.input.vec=len>2?{x:dx/len,y:dy/len}:{x:0,y:0};if(d<29&&!poison){aim(e.x,e.y);r.taps.add('a');if(G.state.formId==='knight'&&e.openingMode==='windup'&&e.openingTimer<.12)r.taps.add('b');}step();}G.input.vec={x:0,y:0};assert.ok(!G.state.enemies.some(e=>!e.dead&&e.id===id),'uncleared '+id);mark('clear '+id);}
function meet(id){const e=G.formEchoFor(id);assert.ok(e,'echo '+id);const x=Math.floor(e.x/16),y=Math.floor(e.y/16);if(e.needsLeave){const candidate=pathTo(x,y).find(([tx,ty])=>Math.hypot(tx*16+8-e.x,ty*16+8-e.y)>35);if(candidate)walk(...candidate);else walk(x-3,y);}walk(x,y);for(let i=0;i<8;i++)step();assert.equal(G.state.formId,id,'met '+id);}
function gift(id){let g=G.groundRewardFor(id);assert.ok(g,'gift '+id);walk(Math.floor(g.x/16),Math.floor(g.y/16));for(let i=0;i<80&&!G.state.items.includes(id);i++){const dx=g.x-p.x,dy=g.y-p.y,d=Math.hypot(dx,dy)||1;G.input.vec={x:dx/d,y:dy/d};step();}G.input.vec={x:0,y:0};assert.ok(G.state.items.includes(id),'collected '+id);}
function cross(map,x,y,dx,dy){const from=G.state.mapId;walk(x,y);G.input.vec={x:dx,y:dy};for(let i=0;i<90&&G.state.mapId===from;i++)step();G.input.vec={x:0,y:0};assert.equal(G.state.mapId,map,'cross '+map);mark('arrive '+map);}
r.load();G.beginStorySession(null);drain();mark('fresh start');walk(12,35);assert.equal(G.state.opening.notice,true);clear('orchardTangle');meet('rat');walk(27,24);walk(34,24);interact(34,24);clear('orchardSpitter');assert.ok(G.formLevel('rat')>=2);walk(38,25);gift('knights-crest');meet('knight');clear('orchardGuard');interact(46,14);walk(49,15);mark('bell');cross('heartwood',54,0,0,-1);
// Treant's real warning, root counter and recovery.
let e=G.state.enemies.find(e=>!e.dead&&e.id==='ancientTreant');
for(let i=0;i<20000&&!e.dead;i++){const fields=G.state.openingHazards.filter(h=>h.owner===e&&!h.treantEcho),root=G.state.enemies.find(a=>!a.dead&&a.treantRoot?.owner===e);let target={x:e.x,y:e.y+75};if(root){target={x:root.x+18,y:root.y};if(Math.hypot(root.x-p.x,root.y-p.y)<=23){aim(root.x,root.y);r.taps.add('a');}}else if(fields.length){const h=fields[0];target=h.kind==='branch'?{x:h.x+h.dx*80-h.dy*34,y:h.y+h.dy*80+h.dx*34}:{x:h.x,y:h.y+32};}else if(e.bossStaggerT>0||(!e.openingTimer&&e.bossRecoverT>0)){target={x:e.x,y:e.y+22};if(Math.hypot(e.x-p.x,e.y-p.y)<=28){aim(e.x,e.y);r.taps.add('a');}}const dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy)||1;G.input.vec=d>2?{x:dx/d,y:dy/d}:{x:0,y:0};step();assert.ok(!G.state.knockout,'Treant KO');}assert.ok(e.dead);mark('Treant won');gift('trophy-heartwood-crown');cross('orchardRoad',16,26,0,1);interact(22,37);gift('orchard-ribbon');interact(26,37);cross('lanternReach',63,37,1,0);interact(14,24);clear('orchardGuard');clear('orchardSpitter');assert.equal(G.state.delivery.lamps[0],2);interact(38,12);clear('orchardGuard');clear('orchardSpitter');assert.equal(G.state.delivery.lamps[1],2);walk(40,15);mark('lanterns lit');cross('tollCourt',59,18,1,0);mark('toll arrival');
e=G.state.enemies.find(e=>!e.dead&&e.id==='tollkeeper');
for(let i=0;i<16000&&!e.dead;i++){const fields=G.state.openingHazards.filter(h=>h.owner===e);let target={x:e.x,y:e.y+22};if(fields.length){const h=fields[0];if(h.kind==='flood'){target=h.safeRoute?.find(n=>Math.hypot(n.x-p.x,n.y-p.y)>4)||h.safePoint||{x:h.x,y:h.y};}else target={x:h.x+h.dx*55-h.dy*35,y:h.y+h.dy*55+h.dx*35};}else if(Math.hypot(e.x-p.x,e.y-p.y)<28){aim(e.x,e.y);r.taps.add('a');}const dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy)||1;G.input.vec=d>2?{x:dx/d,y:dy/d}:{x:0,y:0};step();assert.ok(!G.state.knockout,'Tollkeeper KO');}assert.ok(e.dead);mark('Tollkeeper won');gift('keeper-lantern');cross('sunriseQuay',33,17,1,0);interact(12,12);interact(30,13);interact(28,26);interact(8,20);gift('sunrise-seal');mark('delivery returned');
interact(12,12);assert.equal(G.followedSunriseRequest()?.id,'recipes');mark('recipes chosen');
cross('tollCourt',0,19,-1,0);cross('lanternReach',0,17,-1,0);G.setForm('rat');walk(20,30);walk(20,33);gift('brindles-recipes');walk(20,30);G.setForm('knight');cross('tollCourt',59,18,1,0);cross('sunriseQuay',33,17,1,0);interact(12,12);gift('sunrise-thanks-recipes');mark('recipes returned');
assert.ok(G.formReady('wizard'));assert.equal(G.formEchoFor('wizard'),null);
interact(22,20);assert.equal(G.followedSunriseRequest()?.id,'beacon');assert.ok(G.formEchoFor('wizard'));mark('harbor chosen');meet('wizard');mark('magic ready before departure');
function travel(map){for(let i=0;i<12&&G.state.mapId!==map;i++){const at=G.guidanceRouteTarget({mapId:map});assert.ok(at?.x,'route '+map);console.log('ROUTE',G.state.mapId,JSON.stringify(at));const from=G.state.mapId;if(from==='overworld'&&at.cell.portal.map==='town'){walk(at.tileX,at.tileY+1);mark('home road approach');}walk(at.tileX,at.tileY);if(G.state.mapId===from&&from!==map){const cell=G.state.grid[at.tileY]?.[at.tileX];if(cell?.portal){const dx=at.tileX===0?-1:at.tileX===G.state.mapW-1?1:0,dy=at.tileY===0?-1:at.tileY===G.state.mapH-1?1:0;G.input.vec={x:dx,y:dy};for(let j=0;j<90&&G.state.mapId===from;j++)step();G.input.vec={x:0,y:0};}assert.notEqual(G.state.mapId,from,'travel portal');}mark('arrive '+G.state.mapId);}assert.equal(G.state.mapId,map);}
travel('sunkenMarsh');mark('marsh arrival');

walk(27,9);e=G.state.enemies.find(e=>!e.dead&&e.id==='mireQueen');const byPhase={};let paid=0,seconds=0,maxPhase=0,avoid=null;G.events.on('guardianCounter',({guardian})=>{if(guardian==='mireQueen')byPhase[e.bossPhase]=(byPhase[e.bossPhase]||0)+1;});
 for(let i=0;i<20000&&!e.dead;i++){
  const dt=.025;seconds+=dt;const root=G.state.enemies.find(a=>!a.dead&&a.mireCrust?.owner===e),fields=G.state.bossHazards.filter(h=>h.owner===e),primary=fields.filter(h=>h.kind==='mirePool');
  let target={x:e.x-60,y:e.y};
  if(root){target={x:root.x+18,y:root.y};if(Math.hypot(root.x-p.x,root.y-p.y)<=23){aim(root.x,root.y);r.taps.add('a');}}
  else if(primary.length){const at=primary.find(h=>h.mireAftermath)?.mireAftermath||primary[0];target={x:at.x-27,y:at.y};}
  else if((byPhase[e.bossPhase]||0)>0&&(!fields.length&&e.bossIntroT<=0)&&!G.state.projectiles.some(s=>!s.fromPlayer&&!s.dispelled&&s.owner===e)){
   target={x:e.x-48,y:e.y};if(Math.hypot(e.x-p.x,e.y-p.y)<=68){aim(e.x,e.y);r.taps.add(G.state.formId==='wizard'?(e.ward.hp<=0&&e.status?.poison?.dur>0&&p.mana>=3?'b':'a'):'b');}
  }else if(fields.some(h=>h.kind==='mireVolley')){
   const h=fields.find(h=>h.kind==='mireVolley'),a=Math.atan2(h.y-e.y,h.x-e.x);avoid={x:h.x-Math.sin(a)*52,y:h.y+Math.cos(a)*52};target=avoid;
  }else if(G.state.projectiles.some(s=>!s.fromPlayer&&!s.dispelled&&s.owner===e)&&avoid){target=avoid;
  }else if(e.bossPendingAction==='nova'||G.state.projectiles.some(s=>!s.fromPlayer&&!s.dispelled&&s.owner===e)){
   // Stand halfway between native radial spokes; fan shots keep their old target.
   const n=e.bossPhase>=3?20:e.bossPhase===2?16:12,a=Math.PI+Math.PI/n;
   target={x:e.x+100*Math.cos(a),y:e.y+100*Math.sin(a)};avoid=null;
  }
  if((byPhase[e.bossPhase]||0)>0&&!root&&!primary.length&&Math.hypot(e.x-p.x,e.y-p.y)<125){aim(e.x,e.y);r.taps.add(G.state.formId==='wizard'?(e.ward.hp<=0&&e.status?.poison?.dur>0&&p.mana>=3?'b':'a'):'b');}
  const dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy),desired=d>1.5?{x:dx/d,y:dy/d}:{x:0,y:0};
  const shots=G.state.projectiles.filter(s=>!s.fromPlayer&&!s.dispelled),speed=G.playerForm().speed*G.mireWalkingScale(p);
  const choices=[desired,{x:0,y:0},...Array.from({length:16},(_,j)=>({x:Math.cos(j*Math.PI/8),y:Math.sin(j*Math.PI/8)}))];
  // Replan feet steering every frame; do not treat a wall almost a
  // second away as a collision now. Keep the full danger forecast.
  const score=v=>{let cost=Math.hypot(p.x+v.x*speed*.3-target.x,p.y+v.y*speed*.3-target.y);
   for(let j=1;j<=8;j++){const t=j*.1,x=p.x+v.x*speed*t,y=p.y+v.y*speed*t;if(t<=.3&&!G.world.isSafeSpawn(x,y))cost+=1000;
    for(const s of shots){if(t<s.armT)continue;const scale=G.guidanceProjectileScale?.(s)??1,sx=s.x+s.vx*t*scale,sy=s.y+s.vy*t*scale,dist=Math.hypot(x-sx,y-5-sy);cost+=Math.max(0,(s.size||3)+11-dist)**2*15;}
    for(const h of primary){const age=h.t+t;if(age>=h.delay+h.warning&&age<h.delay+h.warning+h.active)cost+=Math.max(0,h.radius+6-Math.hypot(x-h.x,y-h.y))**2*20;}
   }return cost;};choices.sort((a,b)=>score(a)-score(b));G.input.vec=choices[0];step();maxPhase=Math.max(maxPhase,e.bossPhase||0);
  assert.ok(!G.state.knockout,JSON.stringify({seconds,hp:e.hp,ward:e.ward.hp,damage:p.damageTaken,counters:e.mireCounters,byPhase,x:p.x,y:p.y}));
 }

assert.ok(e.dead,'Queen defeated');mark('Queen won');gift('trophy-mire-pearl');mark('pearl collected');travel('sunriseQuay');interact(22,20);gift('sunrise-thanks-beacon');assert.ok(G.ensureTown().requests.includes('beacon'));mark('harbor returned');assert.equal(G.comfortSetting('easyMode'),false);assert.equal(G.comfortSetting('bossAssistance'),false);fs.writeFileSync(path.join(out,'session-report.json'),JSON.stringify({result:'PASS fresh campaign',knockouts,pages,history},null,2));console.log(JSON.stringify({result:'PASS fresh campaign',knockouts,pages,seconds:+G.state.time.toFixed(2),stars:G.state.stars}));
