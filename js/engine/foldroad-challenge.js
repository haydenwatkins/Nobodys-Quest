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
 let playerStep=0;
 function live(r,dt=0){return !r.owner||(!r.owner.dead&&r.fields.some(h=>h.owner===r.owner&&h.mapId===G.state.mapId&&G.state.bossHazards.includes(h)&&h.t+dt<(h.delay||0)+h.warning+h.active));}
 function paper(x,y,owner=null,fields=[]){const e=G.makeEnemy('slime',x,y);e.id='looseFold';e.def={...e.def,id:e.id,name:'Loose paper fold',practice:true,damage:0,speed:0,size:20};e.hp=1;e.ward=null;e.foldroadPaper={owner,fields,map:G.state.mapId,primed:false,pull:0};G.state.enemies.push(e);return e;}
 G.foldroadPaperAim=e=>!!e.foldroadPaper&&!e.dead&&!e.foldroadPaper.primed&&e.foldroadPaper.map===G.state.mapId&&live(e.foldroadPaper);
 G.cancelFoldroadPapers=owner=>{for(const e of G.state.enemies||[])if(e.foldroadPaper?.owner&&(!owner||e.foldroadPaper.owner===owner))e.dead=true;};
 G.prepareFoldroadCounter=(owner,fields)=>{
  if(owner?.def?.id!=='paperRonin'||!fields.length)return;G.cancelFoldroadPapers(owner);const h=fields[0];
  if(owner.sumiCrossfold){const end=Math.max(...fields.map(f=>(f.delay||0)+(G.guardianWarningSeconds?.(f.warning)??f.warning)+f.active));const f={...h,t:0,hit:false,delay:end+.55,warning:.95,angle:h.angle+Math.PI/2,note:fields.length+1};G.state.bossHazards.push(f);fields.push(f);}
  const spots=Array.from({length:16},(_,i)=>{const a=h.angle+Math.PI/2+(i%2?Math.PI:0)+Math.floor(i/2)*Math.PI/8;return{x:h.x+Math.cos(a)*22,y:h.y+Math.sin(a)*22};});
  const at=spots.find(s=>G.world.isSafeSpawn(s.x,s.y))||G.world.safeArrival(h.x,h.y);paper(at.x,at.y,owner,fields);
 };
 G.hitFoldroadPaper=(e,opts)=>{
  const r=e.foldroadPaper;if(e.dead||!r||r.primed||r.map!==G.state.mapId||!live(r)||!(opts.damage>0)||!G.abilities[opts.ability])return false;
  const p=G.state.player;r.primed=true;r.dist=Math.hypot(p.x-e.x,p.y-e.y);r.feet={x:p.x,y:p.y};r.primedStep=playerStep;r.pull=0;G.damageNumber(e.x,e.y-18,'LOOSE!','#fff3c2');G.sfx.play('wardBreak');return false;
 };
 function unfold(e){const r=e.foldroadPaper;e.dead=true;
  if(r.owner){r.owner.foldroadCounters=(r.owner.foldroadCounters||0)+1;progress().counterLearned=true;G.guardianCounterOpening(r.owner);G.damageNumber(r.owner.x,r.owner.y-22,'UNFOLDED!','#fff3c2');G.events.emit('guardianCounter',{guardian:'paperRonin',kind:'unfoldPaper'});}else progress().practiceCleared=true;
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
   if(r.pull>=10&&d1>=r.dist+10)unfold(e);
  }
 };
 G.noteFoldroadDefeat=e=>{
  if(!sumi(e))return;const a=progress(),n=e.foldroadCounters||0;if(n>0){a.counterLearned=true;a.bestCounters=Math.max(a.bestCounters,n);}
  if(e.sumiLocalRematch&&e.sumiCrossfold&&G.state.mapId==='samuraiTrial')a.crossfoldCleared=true;G.cancelFoldroadPapers(e);G.saveGame();
 };
 G.beginFoldroadRematch=()=>{
  if(!friendly()||G.state.knockout||G.ui.dialogueOpen||G.ui.menuOpen)return false;
  const e=G.makeEnemy('paperRonin',22*16+8,8*16+8);e.def={...e.def,boss:{...e.def.boss,rematchLine:progress().crossfold?'One more cut crosses the first folds after a pause. Strike the loose fold, then step away to open it and stop the whole sequence.':'Ready to practice? Strike the loose fold, then step away to open the paper. Or walk clear of each bright cut.'}};
  e.guardPost=true;e.sumiLocalRematch=true;e.sumiCrossfold=progress().crossfold&&progress().counterLearned;e.guardianPracticeExit={map:'samuraiTrial',x:3,y:11};G.state.enemies.push(e);return true;
 };
 G.events.on('mapEnter',()=>{if(G.state.mapId!=='samuraiTrial')return;for(const e of G.state.enemies)if(sumi(e)){e.guardPost=true;if(G.state.items.includes('paper-crane'))e.dead=true;}if(!progress().practiceCleared)paper(practice.x,practice.y);});
 const update=G.updateOpening;G.updateOpening=dt=>{update(dt);for(const e of G.state.enemies||[]){const r=e.foldroadPaper;if(e.dead||!r?.owner)continue;if(r.map!==G.state.mapId||G.state.knockout||!live(r))e.dead=true;}};
 const candidate=G.openingInteractionCandidate,interact=G.tryOpeningInteraction;
 G.openingInteractionCandidate=()=>{const at=candidate();if(at)return at;
  if(!friendly()||G.ui.dialogueOpen||G.ui.menuOpen||G.state.knockout||G.state.bossCutscene||G.state.zoneTransition)return null;
  const p=G.state.player;if(Math.hypot(p.x-friend.x,p.y-friend.y)>18||G.state.projectiles.some(s=>!s.fromPlayer&&!s.dispelled&&Math.hypot(s.x-p.x,s.y-p.y)<75))return null;
  const a=progress();return{id:'sumi-rematch',kind:'sumi-rematch',...friend,label:a.counterLearned&&!a.invited?'Sumi · Say hello':a.crossfold?'Sumi · Try crossfold':'Sumi · Practice the folds',hint:a.counterLearned&&!a.invited?'Ask Sumi about her crossing fold.':a.crossfoldCleared?'Crossfold cleared. Most unfolded sequences: '+a.bestCounters+'.':'Choose practice here, then walk east.'};
 };
 G.tryOpeningInteraction=()=>{const at=G.openingInteractionCandidate();if(at?.id!=='sumi-rematch')return interact();const a=progress();if(a.counterLearned&&!a.invited){a.invited=true;G.saveGame();G.ui.dialogue('SUMI',"You opened the paper! Want to try my crossing fold? Its lantern is by the fire. Keep your help lights if you like. I'll bring the rice cakes.",{accent:'#ffcd75'});}else G.beginFoldroadRematch();G.input.clearTaps();return true;};
 G.drawFoldroadPaper=(c,x,y,primed)=>{c.save();c.fillStyle='#45414a';c.beginPath();c.ellipse(x,y+2,13,4,0,0,Math.PI*2);c.fill();c.fillStyle='#fff3c2';c.beginPath();c.moveTo(x-11,y);c.lineTo(x-8,y-12);c.lineTo(x+9,y-10);c.lineTo(x+11,y+1);c.closePath();c.fill();c.strokeStyle='#c6ac79';c.lineWidth=1;c.stroke();c.strokeStyle='#73a7b6';c.beginPath();c.moveTo(x-6,y-9);c.lineTo(x+4,y-8);c.lineTo(x-2,y-3);c.lineTo(x+6,y-2);c.stroke();c.fillStyle=primed?'#73eff7':'#ffcd75';c.beginPath();c.moveTo(x+3,y-7);c.lineTo(x+(primed?17:11),y-(primed?14:5));c.lineTo(x+10,y+1);c.closePath();c.fill();c.restore();};
 function crane(c,x,y){c.save();c.fillStyle='#fff3c2';c.beginPath();c.moveTo(x-12,y-6);c.lineTo(x,y);c.lineTo(x+12,y-8);c.lineTo(x+5,y+2);c.lineTo(x-3,y+2);c.closePath();c.fill();c.strokeStyle='#73a7b6';c.lineWidth=1;c.beginPath();c.moveTo(x-5,y);c.lineTo(x+1,y-8);c.lineTo(x+4,y-6);c.stroke();c.restore();}
 const draw=G.openingDrawables;G.openingDrawables=c=>{const list=draw(c);
  for(const e of G.state.enemies||[]){const r=e.foldroadPaper;if(e.dead||!r||!live(r))continue;list.push({y:e.y,fn:()=>{G.drawFoldroadPaper(c,e.x,e.y,r.primed);const p=G.state.player;if(r.primed&&Math.hypot(p.x-e.x,p.y-e.y)<100){c.save();c.globalAlpha=.7;c.strokeStyle='#73eff7';c.lineWidth=1;c.setLineDash([2,2]);c.beginPath();c.moveTo(e.x+12,e.y-6);c.lineTo(p.x,p.y-5);c.stroke();c.restore();}}});}
  if(G.state.mapId!=='samuraiTrial')return list;list.push({y:fire.y,fn:()=>G.drawOpeningProp(c,'camp',fire.x,fire.y,G.state.time)});
  if(progress().practiceCleared)list.push({y:practice.y,fn:()=>crane(c,practice.x,practice.y)});
  if(progress().counterLearned)list.push({y:fire.y,fn:()=>crane(c,fire.x-18,fire.y-8)});
  if(G.foldroadCampCompanionVisible())list.push({y:friend.y,fn:()=>{G.drawShadow(c,friend.x,friend.y,14);G.drawSprite(c,G.enemies.paperRonin.sprite,0,friend.x,friend.y,false);}});return list;
 };
})();
