/* Loosen a paper fold, then move away to unfold Sumi’s cuts. */
"use strict";
(() => {
 const point=(x,y)=>({x:x*16+8,y:y*16+8}),fire=point(3,11),lamp=point(4,12),friend=point(5,10),practice=point(6,13);
 const sumi=e=>e?.def?.id==='paperRonin';
 const progress=()=>{const all=G.state.guardianChallenges||(G.state.guardianChallenges=G.makeGuardianChallenges());return all.sumi||(all.sumi=G.makeGuardianChallenges().sumi);};
 G.foldroadVisitReady=()=>G.state.items.includes('paper-crane')&&G.systemIntroduced('sideAdventures')&&(!G.state.opening?.started||G.state.opening.version<2||(G.state.claimedForms.includes('samurai')&&!G.activeFormOuting()&&!G.formReturnPromise()));
 G.foldroadRematchActive=()=>G.state.mapId==='samuraiTrial'&&G.state.enemies.some(e=>!e.dead&&sumi(e));
 G.foldroadCampCompanionVisible=()=>G.state.mapId==='samuraiTrial'&&G.state.items.includes('paper-crane')&&!G.foldroadRematchActive()&&!G.state.gauntletRun&&!G.state.expeditionRun;
 const friendly=()=>G.foldroadCampCompanionVisible()&&G.foldroadVisitReady();
 G.foldroadCrossfoldLit=()=>progress().crossfold;
 G.foldroadChallengeStation=()=>friendly()&&progress().counterLearned?{kind:'foldroadChallenge',...lamp}:null;
 G.toggleFoldroadCrossfold=()=>{if(!G.foldroadChallengeStation())return false;progress().crossfold=!progress().crossfold;G.saveGame();return true;};
 let playerStep=0,roads=[];
 function live(r,dt=0){return !r.owner||(!r.owner.dead&&(r.cut?[r.cut]:r.fields).some(h=>h.owner===r.owner&&h.mapId===G.state.mapId&&G.state.bossHazards.includes(h)&&h.t+dt<(h.delay||0)+h.warning+h.active));}
 function paper(x,y,owner=null,fields=[]){const e=G.makeEnemy('slime',x,y);e.id='looseFold';e.def={...e.def,id:e.id,name:'Loose paper fold',practice:true,damage:0,speed:0,size:20};e.hp=1;e.ward=null;e.foldroadPaper={owner,fields,map:G.state.mapId,primed:false,pull:0};G.state.enemies.push(e);return e;}
 G.foldroadPaperAim=e=>!!e.foldroadPaper&&!e.dead&&!e.foldroadPaper.primed&&e.foldroadPaper.map===G.state.mapId&&live(e.foldroadPaper);
 G.cancelFoldroadPapers=owner=>{for(const f of roads)if(!owner||f.owner===owner)f.retired=true;for(const e of G.state.enemies||[])if(e.foldroadPaper?.owner&&(!owner||e.foldroadPaper.owner===owner))e.dead=true;};
 G.prepareFoldroadCounter=(owner,fields)=>{
  if(owner?.def?.id!=='paperRonin'||!fields.length)return;G.cancelFoldroadPapers(owner);const h=fields[0];
  if(owner.sumiCrossfold){const end=Math.max(...fields.map(f=>(f.delay||0)+(G.guardianWarningSeconds?.(f.warning)??f.warning)+f.active));const f={...h,t:0,hit:false,delay:end+.55,warning:.95,angle:h.angle+Math.PI/2,note:fields.length+1};G.state.bossHazards.push(f);fields.push(f);}
  const spots=Array.from({length:16},(_,i)=>{const a=h.angle+Math.PI/2+(i%2?Math.PI:0)+Math.floor(i/2)*Math.PI/8;return{x:h.x+Math.cos(a)*22,y:h.y+Math.sin(a)*22};});
  const at=spots.find(s=>paperFits(s,h))||G.world.safeArrival(h.x,h.y),along={x:Math.cos(h.angle)*28,y:Math.sin(h.angle)*28};
  const choices=owner.bossPhase>=2?[-1,1].map(side=>({x:at.x+along.x*side,y:at.y+along.y*side})).filter(s=>paperFits(s,h)):[];
  const nextCuts=owner.bossPhase>=3?fields.slice(1):owner.sumiCrossfold?[fields.at(-1)]:[];
  for(const place of choices.length===2?choices:[at])paper(place.x,place.y,owner,fields).foldroadPaper.nextCuts=nextCuts;
 };
 G.hitFoldroadPaper=(e,opts)=>{
  const r=e.foldroadPaper;if(e.dead||!r||r.primed||r.map!==G.state.mapId||!live(r)||!(opts.damage>0)||!G.abilities[opts.ability])return false;
  const p=G.state.player;r.primed=true;r.dist=Math.hypot(p.x-e.x,p.y-e.y);r.feet={x:p.x,y:p.y};r.primedStep=playerStep;r.pull=0;G.damageNumber(e.x,e.y-18,'LOOSE!','#fff3c2');G.sfx.play('wardBreak');return false;
 };
 function clearLength(at,dx,dy,limit){let length=0;for(let i=1;i<=limit;i++){if(!G.world.isSafeSpawn(at.x+dx*i,at.y+dy*i))break;length=i;}return length;}
 function cutSpan(h,f){const c=Math.cos(h.angle),s=Math.sin(h.angle),x=f.x-h.x,y=f.y-h.y;let enter=-Infinity,exit=Infinity;
  for(const [at,step,half] of [[x*c+y*s,f.dx*c+f.dy*s,h.length/2],[-x*s+y*c,-f.dx*s+f.dy*c,h.width/2]]){if(Math.abs(step)<1e-9){if(Math.abs(at)>half)return null;continue;}const a=(-half-at)/step,b=(half-at)/step;enter=Math.max(enter,Math.min(a,b));exit=Math.min(exit,Math.max(a,b));}
  return enter<=exit?{enter,exit}:null;
 }
 function paperFits(at,h){const dx=at.x-h.x,dy=at.y-h.y,d=Math.hypot(dx,dy);return d>0&&d+12<=80&&G.world.isSafeSpawn(at.x,at.y)&&clearLength(at,dx/d,dy/d,36)===36&&clearLength(at,-dx/d,-dy/d,d+12)>=Math.floor(d+12);}
 function openRoad(e){const p=G.state.player,r=e.foldroadPaper,dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy)||1;
  const f={x:e.x,y:e.y,dx:dx/d,dy:dy/d,back:clearLength(e,-dx/d,-dy/d,36),length:clearLength(e,dx/d,dy/d,80),owner:r.owner,fields:r.fields,map:r.map,phase:r.owner.bossPhase,walked:0,parentRoad:r.parentRoad||null,nextCuts:r.nextCuts||[]},h=r.cut||r.fields[0],nx=-Math.sin(h.angle),ny=Math.cos(h.angle),across=f.dx*nx+f.dy*ny;
  f.cross=Math.abs(across)>.1?((h.x-f.x)*nx+(h.y-f.y)*ny)/across:null;r.road=f;roads.push(f);
  f.cut=h;f.exit=cutSpan(h,f)?.exit??null;
  const next=f.nextCuts[0];if(next&&next.t<next.delay){f.next=next;next.x=f.x+f.dx*f.length;next.y=f.y+f.dy*f.length;next.angle=Math.atan2(f.dy,f.dx);}
 }
 function liveRoad(f){return !f.retired&&f.map===G.state.mapId&&!G.state.knockout&&!f.owner.dead&&G.state.enemies.includes(f.owner)&&f.owner.bossPhase===f.phase&&(f.owner.bossRecoverT>0||f.fields.some(h=>G.state.bossHazards.includes(h)&&h.t<(h.delay||0)+h.warning+h.active));}
 function roadContains(f,p){const at=G.util.clamp((p.x-f.x)*f.dx+(p.y-f.y)*f.dy,-f.back,f.length);return Math.hypot(p.x-f.x-f.dx*at,p.y-f.y-f.dy*at)<=12;}
 G.foldroadCutSafe=(h,p)=>G.state.bossHazards.includes(h)&&h.t<(h.delay||0)+h.warning+h.active&&roads.some(f=>f.owner===h.owner&&f.fields.includes(h)&&liveRoad(f)&&roadContains(f,p));
 function roadPath(c,f){const a=Math.atan2(f.dy,f.dx),x=f.x-f.dx*f.back,y=f.y-f.dy*f.back,tx=f.x+f.dx*f.length,ty=f.y+f.dy*f.length;c.moveTo(x-f.dy*12,y+f.dx*12);c.lineTo(tx-f.dy*12,ty+f.dx*12);c.arc(tx,ty,12,a+Math.PI/2,a-Math.PI/2,true);c.lineTo(x+f.dy*12,y-f.dx*12);c.arc(x,y,12,a-Math.PI/2,a+Math.PI/2,true);c.closePath();}
 function paperFloor(c,f){const end={x:f.x+f.dx*f.length,y:f.y+f.dy*f.length},start={x:f.x-f.dx*f.back,y:f.y-f.dy*f.back};c.beginPath();for(let y=Math.floor((Math.min(start.y,end.y)-13)/16)*16;y<=Math.max(start.y,end.y)+13;y+=16)for(let x=Math.floor((Math.min(start.x,end.x)-13)/16)*16;x<=Math.max(start.x,end.x)+13;x+=16)if(!G.world.solid(x+8,y+8))c.rect(x,y,16,16);c.clip();}
 G.clipFoldroadRoad=(c,h)=>{for(const f of roads)if(f.owner===h.owner&&f.fields.includes(h)&&liveRoad(f)){c.beginPath();c.rect(-10000,-10000,20000,20000);roadPath(c,f);c.clip('evenodd');}};
 function unfold(e){const r=e.foldroadPaper;e.dead=true;
  if(r.owner){openRoad(e);for(const other of G.state.enemies)if(other!==e&&other.foldroadPaper?.fields===r.fields)other.dead=true;r.owner.foldroadCounters=(r.owner.foldroadCounters||0)+1;progress().counterLearned=true;G.damageNumber(e.x,e.y-22,'ROAD OPEN!','#fff3c2');G.events.emit('guardianCounter',{guardian:'paperRonin',kind:'unfoldPaper'});}else progress().practiceCleared=true;
  G.sfx.play('wardBreak');for(let i=0;i<6;i++)G.spawnFx({kind:'puff',x:e.x+(i-2.5)*5,y:e.y-6-(i%2)*6,color:i%2?'#73eff7':'#fff3c2',dur:.5});G.saveGame();
 }
 // Credit actual controlled feet after contact, including real dash travel.
 // A visual lunge, standing still, knockback alone or a supplied position
 // cannot substitute for the outward movement that opens the paper.
 const move=G.updatePlayer;
 G.updatePlayer=dt=>{const p=G.state.player,map=G.state.mapId,x=p.x,y=p.y,dash=!!p.dashing;playerStep++;move(dt);
  if(G.state.player!==p||G.state.mapId!==map||G.state.knockout)return;
  const directed=dash||!!p.dashing||Math.hypot(G.input.vec.x,G.input.vec.y)>.05;
  for(const e of G.state.enemies||[]){const r=e.foldroadPaper;if(e.dead||!r?.primed||r.map!==map||!live(r,dt))continue;
   const before=r.primedStep===playerStep?r.feet:{x,y},d0=Math.hypot(before.x-e.x,before.y-e.y),d1=Math.hypot(p.x-e.x,p.y-e.y);
   if(!directed||Math.hypot(p.x-before.x,p.y-before.y)<.001)continue;r.pull+=Math.max(0,d1-d0);
   const turn=!r.parentRoad||Math.abs(((p.x-e.x)*r.parentRoad.dx+(p.y-e.y)*r.parentRoad.dy)/(d1||1))<.5;
   if(r.pull>=10&&d1>=r.dist+10&&turn)unfold(e);
  }
  if(!directed||G.ui.dialogueOpen||G.ui.menuOpen)return;
  for(const f of roads){if(!liveRoad(f)||f.trip||f.exit===null||!roadContains(f,p)||!roadContains(f,{x,y}))continue;const before=(x-f.x)*f.dx+(y-f.y)*f.dy,after=(p.x-f.x)*f.dx+(p.y-f.y)*f.dy,intent=dash||p.dashing?p.dir.x*f.dx+p.dir.y*f.dy:G.input.vec.x*f.dx+G.input.vec.y*f.dy;
   if(intent<=.1||after-before<=.001)continue;const distance=Math.hypot(p.x-x,p.y-y),through=cutSpan(f.cut,{x,y,dx:(p.x-x)/distance,dy:(p.y-y)/distance});if(through&&through.exit>=0&&through.enter<=distance)f.entered=true;f.walked+=after-before;
   if(f.entered&&f.walked>=32&&after>=f.exit+2){f.trip=true;f.owner.foldroadTrips=(f.owner.foldroadTrips||0)+1;progress().bestRoadTrips=Math.max(progress().bestRoadTrips,f.owner.foldroadTrips);G.saveGame();
    if(f.next&&f.next.t<f.next.delay+f.next.warning){const flap=paper(f.x+f.dx*f.length,f.y+f.dy*f.length,f.owner,f.fields);Object.assign(flap.foldroadPaper,{parentRoad:f,cut:f.next,nextCuts:f.nextCuts.slice(1)});}
   }
  }
 };
 G.noteFoldroadDefeat=e=>{
  if(!sumi(e))return;const a=progress(),n=e.foldroadCounters||0;if(n>0){a.counterLearned=true;a.bestCounters=Math.max(a.bestCounters,n);}
  if(e.sumiLocalRematch&&e.sumiCrossfold&&G.state.mapId==='samuraiTrial')a.crossfoldCleared=true;G.cancelFoldroadPapers(e);G.saveGame();
 };
 G.beginFoldroadRematch=()=>{
  if(!friendly()||G.state.knockout||G.ui.dialogueOpen||G.ui.menuOpen)return false;
  const e=G.makeEnemy('paperRonin',22*16+8,8*16+8);e.def={...e.def,boss:{...e.def.boss,rematchLine:progress().crossfold?'Let’s fold a longer road. Cross each strip, then pull the far flap sideways. Your turns choose where the next cut goes.':'Ready to practice? Strike a loose flap, then step away to unfold a road. Walk across it, or walk around each bright cut.'}};
  e.guardPost=true;e.sumiLocalRematch=true;e.sumiCrossfold=progress().crossfold&&progress().counterLearned;e.guardianPracticeExit={map:'samuraiTrial',x:3,y:11};G.state.enemies.push(e);return true;
 };
 G.events.on('mapEnter',()=>{roads=[];if(G.state.mapId!=='samuraiTrial')return;for(const e of G.state.enemies)if(sumi(e)){e.guardPost=true;if(G.state.items.includes('paper-crane'))e.dead=true;}if(!progress().practiceCleared)paper(practice.x,practice.y);});
 const update=G.updateOpening;G.updateOpening=dt=>{update(dt);roads=roads.filter(liveRoad);for(const e of G.state.enemies||[]){const r=e.foldroadPaper;if(e.dead||!r?.owner)continue;if(r.map!==G.state.mapId||G.state.knockout||!live(r))e.dead=true;}};
 const candidate=G.openingInteractionCandidate,interact=G.tryOpeningInteraction;
 G.openingInteractionCandidate=()=>{const at=candidate();if(at)return at;
  if(!friendly()||G.ui.dialogueOpen||G.ui.menuOpen||G.state.knockout||G.state.bossCutscene||G.state.zoneTransition)return null;
  const p=G.state.player;if(Math.hypot(p.x-friend.x,p.y-friend.y)>18||G.state.projectiles.some(s=>!s.fromPlayer&&!s.dispelled&&Math.hypot(s.x-p.x,s.y-p.y)<75))return null;
  const a=progress();return{id:'sumi-rematch',kind:'sumi-rematch',...friend,label:a.counterLearned&&!a.invited?'Sumi · Say hello':a.crossfold?'Sumi · Try crossfold':'Sumi · Practice the folds',hint:a.counterLearned&&!a.invited?'Ask Sumi about her crossing fold.':a.crossfoldCleared?(a.bestRoadTrips>0?'Crossfold cleared. Most paper crossings: '+a.bestRoadTrips+'.':'Crossfold cleared. There are rice cakes by the fire.'):'Choose practice here, then walk east.'};
 };
 G.tryOpeningInteraction=()=>{const at=G.openingInteractionCandidate();if(at?.id!=='sumi-rematch')return interact();const a=progress();if(a.counterLearned&&!a.invited){a.invited=true;G.saveGame();G.ui.dialogue('SUMI',"You unfolded a road! Want to try Crossfold? Its lantern is by the fire. Keep your help lights if you like. I'll bring the rice cakes.",{accent:'#ffcd75'});}else G.beginFoldroadRematch();G.input.clearTaps();return true;};
 G.drawFoldroadPaper=(c,x,y,primed)=>{c.save();c.fillStyle='#45414a';c.beginPath();c.ellipse(x,y+2,13,4,0,0,Math.PI*2);c.fill();c.fillStyle='#fff3c2';c.beginPath();c.moveTo(x-11,y);c.lineTo(x-8,y-12);c.lineTo(x+9,y-10);c.lineTo(x+11,y+1);c.closePath();c.fill();c.strokeStyle='#c6ac79';c.lineWidth=1;c.stroke();c.strokeStyle='#73a7b6';c.beginPath();c.moveTo(x-6,y-9);c.lineTo(x+4,y-8);c.lineTo(x-2,y-3);c.lineTo(x+6,y-2);c.stroke();c.fillStyle=primed?'#73eff7':'#ffcd75';c.beginPath();c.moveTo(x+3,y-7);c.lineTo(x+(primed?17:11),y-(primed?14:5));c.lineTo(x+10,y+1);c.closePath();c.fill();c.restore();};
 function crane(c,x,y){c.save();c.fillStyle='#fff3c2';c.beginPath();c.moveTo(x-12,y-6);c.lineTo(x,y);c.lineTo(x+12,y-8);c.lineTo(x+5,y+2);c.lineTo(x-3,y+2);c.closePath();c.fill();c.strokeStyle='#73a7b6';c.lineWidth=1;c.beginPath();c.moveTo(x-5,y);c.lineTo(x+1,y-8);c.lineTo(x+4,y-6);c.stroke();c.restore();}
 const draw=G.openingDrawables;G.openingDrawables=c=>{const list=draw(c);
  for(const f of roads)if(liveRoad(f))list.push({y:-10000,fn:()=>{c.save();paperFloor(c,f);c.fillStyle='rgba(255,243,194,.7)';c.strokeStyle='#c6ac79';c.lineWidth=1;c.beginPath();roadPath(c,f);c.fill();c.stroke();c.strokeStyle='#73a7b6';c.globalAlpha=.45;for(let at=8-f.back;at<f.length;at+=16){const x=f.x+f.dx*at,y=f.y+f.dy*at;c.beginPath();c.moveTo(x-f.dy*9,y+f.dx*9);c.lineTo(x+f.dy*9,y-f.dx*9);c.stroke();}c.setLineDash([3,5]);c.beginPath();c.moveTo(f.x-f.dx*f.back,f.y-f.dy*f.back);c.lineTo(f.x+f.dx*f.length,f.y+f.dy*f.length);c.stroke();c.restore();}});
  for(const e of G.state.enemies||[]){const r=e.foldroadPaper;if(e.dead||!r||!live(r))continue;list.push({y:e.y,fn:()=>{G.drawFoldroadPaper(c,e.x,e.y,r.primed);const p=G.state.player;if(r.primed&&Math.hypot(p.x-e.x,p.y-e.y)<100){c.save();c.globalAlpha=.7;c.strokeStyle='#73eff7';c.lineWidth=1;c.setLineDash([2,2]);c.beginPath();c.moveTo(e.x+12,e.y-6);c.lineTo(p.x,p.y-5);c.stroke();c.restore();}}});}
  if(G.state.mapId!=='samuraiTrial')return list;list.push({y:fire.y,fn:()=>G.drawOpeningProp(c,'camp',fire.x,fire.y,G.state.time)});
  if(progress().practiceCleared)list.push({y:practice.y,fn:()=>crane(c,practice.x,practice.y)});
  if(progress().counterLearned)list.push({y:fire.y,fn:()=>crane(c,fire.x-18,fire.y-8)});
  if(G.foldroadCampCompanionVisible())list.push({y:friend.y,fn:()=>{G.drawShadow(c,friend.x,friend.y,14);G.drawSprite(c,G.enemies.paperRonin.sprite,0,friend.x,friend.y,false);}});return list;
 };
})();
