/* Splash a landed pie to choose a walking passage through Tansy's cards. */
"use strict";
(() => {
 const point=(x,y)=>({x:x*16+8,y:y*16+8}),fire=point(3,11),lamp=point(4,12),friend=point(5,10),practice=point(6,13);
 const tansy=e=>e?.def?.id==='royalFool';
 const progress=()=>{const all=G.state.guardianChallenges||(G.state.guardianChallenges=G.makeGuardianChallenges());return all.tansy||(all.tansy=G.makeGuardianChallenges().tansy);};
 G.stageVisitReady=()=>G.state.items.includes('jester-bell')&&G.systemIntroduced('sideAdventures')&&(!G.state.opening?.started||G.state.opening.version<2||(G.state.claimedForms.includes('jester')&&!G.activeFormOuting()&&!G.formReturnPromise()));
 G.stageRematchActive=()=>G.state.mapId==='jesterTrial'&&G.state.enemies.some(e=>!e.dead&&tansy(e));
 G.stageCampCompanionVisible=()=>G.state.mapId==='jesterTrial'&&G.state.items.includes('jester-bell')&&!G.stageRematchActive()&&!G.state.gauntletRun&&!G.state.expeditionRun;
 const friendly=()=>G.stageCampCompanionVisible()&&G.stageVisitReady();
 G.stageEncoreLit=()=>progress().encore;
 G.stageChallengeStation=()=>friendly()&&progress().counterLearned?{kind:'stageChallenge',...lamp}:null;
 G.toggleStageEncore=()=>{if(!G.stageChallengeStation())return false;progress().encore=!progress().encore;G.saveGame();return true;};
 function pie(x,y,owner=null,h=null){
  const e=G.makeEnemy('slime',x,y);e.id='custardPie';e.def={...e.def,id:e.id,name:'Landed custard pie',practice:true,damage:0,speed:0,size:18};e.hp=1;e.ward=null;
  e.custardPie={owner,h,map:G.state.mapId};G.state.enemies.push(e);return e;
 }
 G.stagePieAim=e=>!!e.custardPie&&!e.dead&&(!e.custardPie.owner||(G.state.bossHazards.includes(e.custardPie.h)&&e.custardPie.h.t-(e.custardPie.h.delay||0)<e.custardPie.h.warning));
 G.retireStagePie=h=>{if(h.stagePie)h.stagePie.dead=true;};
 G.cancelStagePies=owner=>{for(const e of G.state.enemies||[])if(e.custardPie?.owner&&(!owner||e.custardPie.owner===owner))e.dead=true;};
 G.prepareStageCounter=(owner,fields,p)=>{
  if(!tansy(owner))return;G.cancelStagePies(owner);
  if(!fields.length)return;
  const count=owner.bossPhase*2+3,angle=Math.atan2(p.y-5-(owner.y-6),p.x-owner.x);
  const h={kind:'stageCards',owner,mapId:G.state.mapId,t:0,delay:Math.max(...fields.map(h=>(G.guardianWarningSeconds?.(h.warning)??h.warning)+h.active))+.45,warning:.85,active:.15,color:'#ffcd75',phase:owner.bossPhase,angle,shots:Array.from({length:count},(_,i)=>angle+(i-(count-1)/2)*18*Math.PI/180),x:owner.x,y:owner.y-6,fired:false,passages:[]};
  h.fullShots=[...h.shots];
  for(const pie of fields){pie.stageCounter=true;pie.landing=.18;pie.cardPassage=h;}
  G.state.bossHazards.push(h);
  if(owner.tansyEncore){const encore={...h,kind:'stageEncore',shots:[...h.shots],following:h,followingDone:false,delay:h.delay+(G.guardianWarningSeconds?.(h.warning)??h.warning)+175/105+.45};G.state.bossHazards.push(encore);}
 };
 G.waitStageEncore=h=>{
  if(!h.following||h.followingDone)return;
  // Never start the next warning over still-live, possibly helped cards.
  h.delay=h.t+.45;
  if(h.following.fired&&!G.state.projectiles.some(s=>s.stagePassage===h.following&&!s.dispelled))h.followingDone=true;
 };
 G.landStagePie=h=>{
  if(!h.stageCounter||h.mapId!==G.state.mapId||h.owner.dead||G.state.knockout)return;
  const t=h.t-(h.delay||0);if(t>=h.warning){G.retireStagePie(h);return;}if(t<h.landing||h.stagePie)return;
  h.stagePie=pie(h.x,h.y,h.owner,h);
 };
 G.hitStagePie=(e,opts)=>{
  const r=e.custardPie;if(e.dead||!r||r.map!==G.state.mapId||!(opts.damage>0)||!G.abilities[opts.ability])return false;
  if(r.owner){const h=r.h,t=h.t-(h.delay||0);
   if(r.owner.dead||!tansy(r.owner)||h.owner!==r.owner||!G.state.bossHazards.includes(h)||t<h.landing||t>=h.warning)return false;
   const cards=h.cardPassage;if(!cards||cards.fired||!G.state.bossHazards.includes(cards))return false;
   const toward=Math.atan2(h.y-5-cards.y,h.x-cards.x),distance=a=>Math.abs(Math.atan2(Math.sin(a-toward),Math.cos(a-toward)));
   // Near Tansy, a side pie can lie beyond the fan. Open its nearest actual
   // lane instead of drawing an unused path that changes no cards.
   const angle=cards.fullShots.reduce((best,a)=>distance(a)<distance(best)?a:best),delta=a=>Math.abs(Math.atan2(Math.sin(a-angle),Math.cos(a-angle)));
   cards.passages.push(angle);for(const fan of G.state.bossHazards.filter(f=>f===cards||f.following===cards))fan.shots=fan.shots.filter(a=>delta(a)>.4);
   e.dead=true;G.state.bossHazards=G.state.bossHazards.filter(other=>other!==h);r.owner.stageCounters=(r.owner.stageCounters||0)+1;progress().counterLearned=true;
   G.damageNumber(e.x,e.y-18,'SPLAT!','#fff3c2');G.spawnFx({kind:'ring',x:e.x,y:e.y-5,color:'#fff3c2',radius:23,dur:.5});
   G.events.emit('guardianCounter',{guardian:'royalFool',kind:'custardSplash'});
  }else{e.dead=true;progress().practiceCleared=true;G.damageNumber(e.x,e.y-18,'SPLAT!','#fff3c2');}
  G.sfx.play('wardBreak');for(let i=0;i<6;i++)G.spawnFx({kind:'puff',x:e.x+(i-2.5)*3,y:e.y-8-(i%2)*5,color:i%2?'#e9a9ce':'#fff3c2',dur:.4});G.saveGame();
  return false; // A pie is neither a creature nor a ward/mastery reward.
 };
 G.noteStageDefeat=e=>{
  if(!tansy(e))return;const a=progress(),n=e.stageCounters||0;if(n>0){a.counterLearned=true;a.bestCounters=Math.max(a.bestCounters,n);}
  if(e.tansyLocalRematch&&e.tansyEncore&&G.state.mapId==='jesterTrial')a.encoreCleared=true;G.cancelStagePies(e);G.saveGame();
 };
 G.beginStageRematch=()=>{
  if(!friendly()||G.state.knockout||G.ui.dialogueOpen||G.ui.menuOpen)return false;
  const e=G.makeEnemy('royalFool',22*16+8,8*16+8);e.def={...e.def,boss:{...e.def.boss,rematchLine:progress().encore?'The cards come twice! Splash a landed pie, then follow the crumbs through both fans. Or walk around them.':'Ready for another show? Splash a landed pie to open a path through my cards. The cookie tin is by the fire.'}};
  e.guardPost=true;e.tansyLocalRematch=true;e.tansyEncore=progress().encore&&progress().counterLearned;e.guardianPracticeExit={map:'jesterTrial',x:3,y:11};G.state.enemies.push(e);return true;
 };
 G.events.on('mapEnter',()=>{if(G.state.mapId!=='jesterTrial')return;for(const e of G.state.enemies)if(tansy(e)){e.guardPost=true;if(G.state.items.includes('jester-bell'))e.dead=true;}if(!progress().practiceCleared)pie(practice.x,practice.y);});
 const update=G.updateOpening;
 G.updateOpening=dt=>{update(dt);for(const e of G.state.enemies||[]){const r=e.custardPie;if(e.dead||!r?.owner)continue;const h=r.h;if(r.owner.dead||r.map!==G.state.mapId||G.state.knockout||!G.state.bossHazards.includes(h)||h.t-(h.delay||0)>=h.warning)e.dead=true;}};
 const candidate=G.openingInteractionCandidate,interact=G.tryOpeningInteraction;
 G.openingInteractionCandidate=()=>{const at=candidate();if(at)return at;
  if(!friendly()||G.ui.dialogueOpen||G.ui.menuOpen||G.state.knockout||G.state.bossCutscene||G.state.zoneTransition)return null;
  const p=G.state.player;if(Math.hypot(p.x-friend.x,p.y-friend.y)>18||G.state.projectiles.some(s=>!s.fromPlayer&&!s.dispelled&&Math.hypot(s.x-p.x,s.y-p.y)<75))return null;
  const a=progress();return{id:'tansy-rematch',kind:'tansy-rematch',...friend,label:a.counterLearned&&!a.invited?'Tansy · Say hello':a.encore?'Tansy · Try card encore':'Tansy · Practice a show',hint:a.counterLearned&&!a.invited?'Ask Tansy about her card encore.':a.encoreCleared?'Card Encore cleared. Most pie splashes: '+a.bestCounters+'.':'Choose a show here, then walk east.'};
 };
 G.tryOpeningInteraction=()=>{const at=G.openingInteractionCandidate();if(at?.id!=='tansy-rematch')return interact();const a=progress();if(a.counterLearned&&!a.invited){a.invited=true;G.saveGame();G.ui.dialogue('TANSY',"You got me with custard! Want to try my card encore? Light its lantern by the fire. Keep your help lights if you like. I'll fetch the cookies.",{accent:'#ffcd75'});}else G.beginStageRematch();G.input.clearTaps();return true;};
 function drawPie(c,x,y){if(G.drawStagePie?.(c,x,y))return;c.save();c.fillStyle='#bb8c55';c.fillRect(x-8,y-3,16,6);c.fillStyle='#fff3c2';c.fillRect(x-7,y-6,14,4);c.fillStyle='#e9a9ce';c.fillRect(x-3,y-8,6,3);c.restore();}
 G.drawStagePassages=c=>{
  const fans=new Set((G.state.bossHazards||[]).filter(h=>!h.owner.dead&&(h.kind==='stageCards'||h.kind==='stageEncore')).map(h=>h.following||h));
  for(const s of G.state.projectiles)if(s.stagePassage&&!s.dispelled)fans.add(s.stagePassage.following||s.stagePassage);
  c.save();c.strokeStyle='#fff3c2';c.fillStyle='#fff3c2';c.lineWidth=1;
  // Released cards keep their native danger after victory, so their route
  // remains useful until those actual shots leave, even with a dead owner.
  for(const h of fans){if(h.mapId!==G.state.mapId)continue;for(const a of h.passages){
   c.globalAlpha=.5;c.setLineDash([3,5]);for(const edge of [a-.22,a+.22]){c.beginPath();c.moveTo(h.x+Math.cos(edge)*30,h.y+Math.sin(edge)*30);c.lineTo(h.x+Math.cos(edge)*140,h.y+Math.sin(edge)*140);c.stroke();}
   c.setLineDash([]);c.globalAlpha=.85;for(let d=38;d<=134;d+=16)c.fillRect(Math.round(h.x+Math.cos(a)*d)-1,Math.round(h.y+Math.sin(a)*d)-1,3,3);
  }}c.restore();
 };
 const draw=G.openingDrawables;
 G.openingDrawables=c=>{const list=draw(c);for(const e of G.state.enemies||[])if(!e.dead&&e.custardPie&&!e.custardPie.owner)list.push({y:e.y,fn:()=>drawPie(c,e.x,e.y)});
  if(G.state.mapId!=='jesterTrial')return list;list.push({y:fire.y,fn:()=>G.drawOpeningProp(c,'camp',fire.x,fire.y,G.state.time)});
  if(progress().practiceCleared)list.push({y:practice.y,fn:()=>{c.save();c.fillStyle='#e2c9d6';c.beginPath();c.ellipse(practice.x,practice.y,10,4,0,0,Math.PI*2);c.fill();c.strokeStyle='#fff3c2';c.lineWidth=1;c.stroke();c.fillStyle='#fff3c2';c.fillRect(practice.x-3,practice.y-2,6,3);c.restore();}});
  if(progress().counterLearned)list.push({y:fire.y,fn:()=>{c.save();for(const dx of [-18,-12]){c.fillStyle='#e2c9d6';c.fillRect(fire.x+dx,fire.y-15,5,7);c.fillStyle='#fff3c2';c.fillRect(fire.x+dx+2,fire.y-13,1,3);}c.restore();}});
  if(G.stageCampCompanionVisible())list.push({y:friend.y,fn:()=>{G.drawShadow(c,friend.x,friend.y,14);G.drawSprite(c,G.enemies.royalFool.sprite,0,friend.x,friend.y,false);}});return list;
 };
})();
