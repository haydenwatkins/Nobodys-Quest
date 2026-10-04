/* THE LONG WAY HOME. Durable checkpoints, optional small-form discovery,
   and three deliveries whose effects remain visible after the chapter. */
"use strict";
(() => {
  const maps=['lanternReach','tollCourt','sunriseQuay'];
  const here=()=>G.state&&maps.includes(G.state.mapId);
  G.makeDelivery=()=>({version:1,started:false,lamps:[0,0],cleared:[],keeper:false,parcels:[],salvage:false,complete:false,seen:[]});
  G.normalizeDelivery=raw=>{
    const d=G.makeDelivery(),r=raw&&typeof raw==='object'?raw:{};
    for(const k of ['started','keeper','salvage','complete'])d[k]=r[k]===true;
    d.lamps=[0,1].map(i=>[1,2].includes(r.lamps&&r.lamps[i])?r.lamps[i]:0);
    d.cleared=Array.isArray(r.cleared)?[...new Set(r.cleared.filter(x=>typeof x==='string'))].slice(0,12):[];
    d.parcels=Array.isArray(r.parcels)?['bread','letter','present'].filter(x=>r.parcels.includes(x)):[];
    d.seen=Array.isArray(r.seen)?[...new Set(r.seen.filter(x=>typeof x==='string'))].slice(0,24):[];
    if(d.complete){d.keeper=true;d.parcels=['bread','letter','present'];}
    if(d.keeper)d.lamps=[2,2];
    if(d.keeper||d.lamps.some(Boolean)||d.parcels.length)d.started=true;
    return d;
  };
  const state=()=>G.state.delivery||(G.state.delivery=G.makeDelivery());
  const near=(x,y,r=30)=>Math.hypot(G.state.player.x-(x*16+8),G.state.player.y-(y*16+8))<=r;
  const safe=()=>!G.ui.dialogueOpen&&!G.state.knockout&&!G.state.bossCutscene&&!G.state.enemies.some(e=>!e.dead&&!e.def.practice&&Math.hypot(e.x-G.state.player.x,e.y-G.state.player.y)<88);
  function say(key,lines){
    const d=state();if(d.seen.includes(key))return;d.seen.push(key);
    for(const [speaker,text]of lines)G.ui.dialogue(speaker,text,{accent:'#e7bd78'});
    G.saveGame();
  }
  const locations={bread:[12,12],letter:[30,13],present:[28,26]};
  G.recipeGiftApproach=()=>{
    const gift=G.groundRewardFor&&G.groundRewardFor('brindles-recipes');if(!gift)return null;
    const s=G.state,inPocket=s.mapId===gift.mapId&&Math.abs(s.player.x-328)<32&&s.player.y>=33*16;
    return {gift,inPocket,mapId:gift.mapId,point:inPocket?[gift.x/16-.5,gift.y/16-.5]:[18,30],
      text:inPocket?'Walk over the recipe book to collect it, then return through the drain and bring Brindle the good news.':'Become Rat and enter the Lantern Reach drain again. The recipe book waits safely in the little pocket beneath the bank.'};
  };
  G.deliveryGoal=()=>{
    const s=G.state;if(!s)return null;const d=state();
    const gift=(s.groundRewards||[]).find(g=>['orchard-ribbon','sunrise-seal','keeper-lantern','brindles-recipes'].includes(g.item)&&!s.items.includes(g.item));
    const approach=gift?.item==='brindles-recipes'?G.recipeGiftApproach():null;
    if(gift)return {chapter:1,act:G.STORY_CHAPTERS[1],title:'A gift for helping',short:`Collect the ${G.groundRewardInfo(gift).name}`,objective:approach?approach.text:`Walk over the gift on the ground. ${G.groundRewardInfo(gift).purpose}. The road and your unfinished promises remain open.`,reason:'Your help is remembered. Its gift waits even if you leave.',mapId:gift.mapId,point:approach?approach.point:[gift.x/16-.5,gift.y/16-.5],destination:G.maps[gift.mapId].name,guide:'opening',progress:{value:d.complete?8:d.keeper?4:0,total:8,label:'A THANK-YOU GIFT'},complete:false};
    if(d.complete||(!d.started&&!(s.opening&&s.opening.complete)))return null;
    let mapId,point,short,objective,value;
    if(!d.started){mapId='orchardRoad';point=[26,37];short='Meet Parcel at the departure post';objective='Parcel can finally travel. Join the delivery beside the cart, a few steps east.';value=0;}
    else if(d.lamps[0]<2){mapId='lanternReach';point=[14,24];short=d.lamps[0]?'Clear the first lantern':'Raise the first lantern';objective='Follow the west bank to the unlit lantern. Drive back the creatures its light draws.';value=1;}
    else if(d.lamps[1]<2){mapId='lanternReach';point=[38,12];short=d.lamps[1]?'Clear the second lantern':'Raise the second lantern';objective='The first light opened the causeway. Carry it to the lantern on the far bank.';value=2;}
    else if(!d.keeper){mapId='tollCourt';point=[18,17];short='Cross the old toll bridge';objective='Follow the lamps east. When the bridge floods, shelter inside the marked lantern circle.';value=3;}
    else if(d.parcels.length<3){const id=['bread','letter','present'].find(x=>!d.parcels.includes(x));mapId='sunriseQuay';point=locations[id];short={bread:'Bring the flour to Baker Brindle',letter:'Give Mara her letter',present:'Bring Pip the birthday present'}[id];objective='The quay is just across the bridge. Deliver the three parcels in any order.';value=4+d.parcels.length;}
    else {mapId='sunriseQuay';point=[8,20];short='Tell Parcel everyone received it';objective='Return to the cart. Three ordinary things have arrived at last.';value=7;}
    return {chapter:1,act:G.STORY_CHAPTERS[1],title:'The Long Way Home',short,objective,reason:'Opening a road matters because someone is waiting at the other end.',mapId,point,destination:G.maps[mapId].name,guide:'opening',progress:{value,total:8,label:'THE LONG WAY HOME'},complete:false};
  };
  const oldGoal=G.openingGoal,oldTarget=G.openingTarget,oldActive=G.openingActive;
  G.openingGoal=()=>G.deliveryGoal()||oldGoal();
  G.openingActive=()=>oldActive()||!!(here()&&state().started&&!state().complete);
  const oldBegin=G.beginOpening;
  G.beginOpening=()=>{
    if(here()&&state().started&&!state().complete){G.ensureStory().prologueSeen=true;return true;}
    return oldBegin();
  };
  G.openingTarget=()=>{
    const g=G.deliveryGoal();if(!g||g.mapId!==G.state.mapId)return oldTarget();
    const [x,y]=g.point;return {x:x*16+8,y:y*16+8,tileX:x,tileY:y,kind:'story',icon:'◇',color:'#e7bd78',destination:g.short,text:g.objective};
  };
  const oldBlock=G.openingCellBlocked;
  G.openingCellBlocked=(px,py)=>{
    if(oldBlock(px,py))return true;if(!here())return false;
    const x=Math.floor(px/16),y=Math.floor(py/16),d=state();
    if(G.state.mapId==='lanternReach')return (x===24&&y>=16&&y<=20&&d.lamps[0]!==2)||(x===46&&y>=15&&y<=21&&d.lamps[1]!==2);
    return G.state.mapId==='tollCourt'&&x===28&&y>=16&&y<=18&&!d.keeper;
  };
  G.deliveryCandidate=()=>{
    if(!G.state||!safe())return null;const d=state(),map=G.state.mapId;
    const option=(id,label,x,y,r)=>near(x,y,r)?{id,label,x:x*16+8,y:y*16+8}:null;
    if(map==='orchardRoad'&&G.state.opening.complete)return option('depart',d.complete?'Ride to Sunrise Quay':d.started?'Return to the Lantern Reach':'Travel with Parcel',26,37);
    if(!here())return null;
    if(map==='lanternReach'){
      for(const i of [0,1])if(d.started&&d.lamps[i]===0&&(i===0||d.lamps[0]===2)){
        const [x,y]=i?[38,12]:[14,24],at=option('lamp'+i,'Raise the '+(i?'second':'first')+' lantern',x,y);if(at)return at;
      }
      if(near(20,33,21))return {id:'drainBack',label:'Return through the drain',x:328,y:536};
      if(!d.salvage||G.groundRewardFor('brindles-recipes'))return option('drain',G.state.formId==='rat'?(d.salvage?'Return for the recipe book':'Explore the storm drain'):'A small drain · Rat can fit',18,30,25);
    }
    if(map==='sunriseQuay'&&d.started&&d.keeper){
      if(d.complete&&G.expeditionUnlocked()){
        const trail=option('manyfold','Choose a Manyfold trail',35,20);if(trail)return trail;
      }
      for(const [id,[x,y]]of Object.entries(locations))if(!d.parcels.includes(id)){
        const at=option(id,{bread:'Deliver the flour',letter:'Deliver Mara’s letter',present:'Deliver the birthday present'}[id],x,y);if(at)return at;
      }
      if(d.parcels.length===3&&!d.complete)return option('finish','Tell Parcel the delivery is done',8,20);
      if(d.complete)return option('rideBack','Ride back to Orchard Road',8,20);
    }
    return null;
  };
  const oldCandidate=G.openingInteractionCandidate,oldInteract=G.tryOpeningInteraction;
  G.openingInteractionCandidate=()=>G.deliveryCandidate()||oldCandidate();
  function move(x,y){const p=G.state.player;p.x=x*16+8;p.y=y*16+8;p.lastSafe={x:p.x,y:p.y};p.dashing=null;p.performance=null;}
  const waves=[[[13,22,'orchardGuard'],[18,25,'orchardGuard'],[18,20,'orchardSpitter']],[[34,13,'orchardGuard'],[39,16,'orchardGuard'],[37,10,'orchardSpitter']]];
  function spawnWave(i){
    const d=state();for(const [n,[x,y,id]]of waves[i].entries()){
      const key=i+':'+n;if(d.cleared.includes(key)||G.state.enemies.some(e=>e.deliveryKey===key))continue;
      const e=G.makeEnemy(id,x*16+8,y*16+8);e.deliveryKey=key;e.deliveryWave=i;G.state.enemies.push(e);
    }
  }
  function positionCourier(){
    if(G.state.mapId!=='lanternReach')return;
    const p=state(),[tx,ty]=p.lamps[1]===2?[53,20]:p.lamps[0]===2?[29,18]:[8,29];
    for(const n of G.state.npcs)if(n.id==='parcel'){n.x=tx*16+8;n.y=ty*16+8;n.home={x:tx,y:ty};n.path=[];}
  }
  G.tryOpeningInteraction=()=>{
    const at=G.deliveryCandidate();if(!at)return oldInteract();
    const d=state(),s=G.state;
    if(at.id==='depart'){
      d.started=true;G.world.load(d.complete?'sunriseQuay':'lanternReach');
      say('departure',[['PARCEL','Flour for the baker. A letter for Mara. A birthday present, only slightly chewed.'],['PATCHLING','Who has been keeping the road lights on?'],['PARCEL','No one lately. The lamps could use a keeper. Start with the one beside us.']]);
    }else if(at.id==='rideBack')G.world.load('orchardRoad',{x:26,y:37});
    else if(at.id==='manyfold'){if(G.ui.openExpedition)G.ui.openExpedition(G.ensureExpeditionProgress().runs===0?3:undefined);}
    else if(at.id.startsWith('lamp')){
      const i=Number(at.id.slice(-1));d.lamps[i]=1;spawnWave(i);G.sfx.play('bossPhase');
      say('lamp'+i,[['PARCEL',i?'They followed the light across. Clear the bank; I will keep the flame.':'The light woke something in the reeds. I have the cart. You have room to move.']]);
    }else if(at.id==='drain'){
      if(s.formId!=='rat')G.ui.dialogue('PEBBLE','Something pale is caught under that bank. A rat could follow the drain.',{accent:'#e7bd78'});
      else{move(20,33);if(!d.salvage){d.salvage=true;G.revealActivityReward('brindles-recipes',s.player.x,s.player.y);G.sfx.play('pickup');say('salvage',[['PATCHLING','A recipe book. The pages smell of cinnamon.'],['PARCEL','Brindle lost that in the flood. Walk over the book to collect it, then bring her the good news. Keep it dry.']]);}}
    }else if(at.id==='drainBack')move(18,30);
    else if(locations[at.id]){
      d.parcels.push(at.id);G.sfx.play('pickup');s.deliveryWarmT=3;
      const lines={bread:[['BAKER BRINDLE',d.salvage?'My flour AND my recipes! I can stop calling the burnt ones a local tradition.':'Flour! I was down to making the smell of bread. Very popular. Not filling.'],['PATCHLING','You kept the oven warm.'],['BAKER BRINDLE','Someone had to believe something would arrive.']],
        letter:[['MARA','From my sister. She is coming home. She thought I had stopped writing.'],['PATCHLING','The letters stopped. You didn’t.'],['MARA','I will put another cup out.']],
        present:[['PIP','A wooden dragon! It has wheels!'],['PATCHLING','The best dragons do.'],['PIP','Will you stay until I make it fly?']]};
      say(at.id,lines[at.id]);
    }else if(at.id==='finish'){
      d.complete=true;const gift=G.revealActivityReward('sunrise-seal',at.x,at.y);
      G.healPlayer(G.playerMaxHearts(),'delivery');
      say('home',[['PARCEL','Every name crossed off. That used to be an ordinary day.'],['PEBBLE','Patchling delivered everything. I am going to enjoy writing that down.'],['PATCHLING','Tomorrow there will be more.'],['PARCEL','Good. The road knows the way now.']]);
      G.ui.banner('THE LONG WAY HOME',gift?'Sunrise Seal waits nearby · walk over it for 8 town spirit':'Every parcel delivered · a place to return to');
    }
    G.saveGame();G.input.clearTaps();return true;
  };
  const oldTalk=G.npcDialogue;
  G.npcDialogue=(id,chapter,index)=>{
    if(G.state&&G.state.mapId==='sunriseQuay'){
      const d=state();
      if(id==='quayBaker'&&d.parcels.includes('bread'))return 'The first loaf is yours. Do not argue with someone holding a bread paddle.';
      if(id==='quayMara'&&d.parcels.includes('letter'))return 'Two cups. One for today, one for when she gets here.';
      if(id==='quayPip'&&d.parcels.includes('present'))return 'I named him Thimble. He is a very important dragon.';
      if(id==='parcel')return d.complete?'The map stand beside the east lantern leads into the Manyfold. New paths, borrowed powers, and something to bring home. I might let you carry the post next time.':'We made it. Brindle is by the oven, Mara by the east house, Pip down by the water.';
    }
    return oldTalk(id,chapter,index);
  };
  G.events.on('mapEnter',()=>{
    if(!here())return;const s=G.state,d=state();s.openingHazards=[];
    if(s.mapId==='lanternReach')for(const i of [0,1])if(d.lamps[i]===1)spawnWave(i);
    if(s.mapId==='tollCourt'&&d.keeper)for(const e of s.enemies)e.dead=true;
    for(const n of s.npcs){n.anchors=[n.home];n.routineT=999;if(n.id.startsWith('quay'))n.activity=null;}
    positionCourier();
  });
  G.events.on('kill',data=>{
    if(!here())return;const s=G.state,d=state();
    const e=s.enemies.find(e=>e.dead&&e.id===data.enemy&&e.x===data.x&&e.y===data.y);
    if(e&&e.deliveryKey&&!d.cleared.includes(e.deliveryKey))d.cleared.push(e.deliveryKey);
    if(data.enemy==='tollkeeper'&&!d.keeper){d.keeper=true;d.started=true;d.lamps=[2,2];G.cancelBossHazards(e);if(e)G.revealDeliveryReward(e);G.checkUnlocks();}
    G.saveGame();
  });
  const oldUpdate=G.updateOpening;
  G.updateOpening=dt=>{
    oldUpdate(dt);if(!here())return;const s=G.state,d=state();s.deliveryWarmT=Math.max(0,(s.deliveryWarmT||0)-dt);
    if(s.mapId==='lanternReach')for(const i of [0,1]){
      if(d.lamps[i]!==1||s.enemies.some(e=>!e.dead&&e.deliveryWave===i))continue;
      d.lamps[i]=2;G.healPlayer(2,'lantern');s.player.mana=G.playerMaxMana();
      positionCourier();
      const [x,y]=i?[40,15]:[14,25];s.entryPoint={x:x*16+8,y:y*16+8};G.sfx.play('unlock');
      say('lit'+i,[['PARCEL',i?'Two lights. The bridge is just ahead. I can see the town windows from here.':'One light. One stretch of road we can trust. I will bring the cart up.']]);
    }
    if(s.mapId==='tollCourt'&&d.keeper)say('keeper',[['THE TOLLKEEPER','I kept counting what they owed. I forgot what the bridge was for.'],['PATCHLING','You could count who gets home.'],['THE TOLLKEEPER',G.groundRewardFor('keeper-lantern')?'Take the lantern on the ground. One star for the road, and three parcels for the people waiting.':'Three parcels. Two travelers. Go on. I can start with that.']]);
    if(s.mapId==='sunriseQuay'&&d.keeper&&!d.complete)say('quay',[['PARCEL','There. The oven chimney. Mara’s blue door. Pip waiting on the step.'],['PATCHLING','They are still here.'],['PARCEL','Yes. Let us make that worth the wait.']]);
    for(const h of s.openingHazards||[]){h.t+=dt;if(!h.hit&&h.t>=h.warn&&h.t<h.warn+h.active&&!h.owner.dead&&!s.knockout&&G.openingHazardHits(h,s.player.x,s.player.y))h.hit=!!G.damagePlayer(1,h.owner.x,h.owner.y);}
    s.openingHazards=(s.openingHazards||[]).filter(h=>!h.owner.dead&&h.t<h.warn+h.active);
  };
  const oldHit=G.openingHazardHits,oldBoss=G.updateOrchardBoss;
  G.openingHazardHits=(h,x,y)=>h.kind==='flood'?Math.hypot(x-h.x,y-h.y)>h.radius:oldHit(h,x,y);
  function floodRefuge(h, p) {
    const nodes=[{x:p.x,y:p.y,parent:-1}],seen=new Set(['0,0']);
    for(let i=0;i<nodes.length;i++) {
      const n=nodes[i];
      if(Math.hypot(n.x-h.x,n.y-h.y)<=h.radius-8&&G.world.isSafeSpawn(n.x,n.y)) {
        h.safePoint={x:n.x,y:n.y};h.safeRoute=[];
        for(let at=i;at>=0;at=nodes[at].parent)h.safeRoute.push({x:nodes[at].x,y:nodes[at].y});
        h.safeRoute.reverse();
        h.warn=Math.max(h.warn,(h.safeRoute.length-1)*8/G.bossWalkingSpeed()+.35);
        return;
      }
      for(const [dx,dy] of [[8,0],[-8,0],[0,8],[0,-8]]) {
        const x=n.x+dx,y=n.y+dy,key=Math.round((x-p.x)/8)+','+Math.round((y-p.y)/8);
        if(seen.has(key))continue;seen.add(key);
        if(G.world.isSafeSpawn(x,y))nodes.push({x,y,parent:i});
      }
    }
  }
  G.updateOrchardBoss=(e,p,dt)=>{
    if(e.id!=='tollkeeper')return oldBoss(e,p,dt);
    e.openingTimer=Math.max(0,(e.openingTimer||0)-dt);if(e.openingTimer)return true;
    const phase=e.bossPhase||1,assist=G.comfortSetting&&G.comfortSetting('bossAssistance');
    const warn=1.15+(assist?.35:0),hazards=G.state.openingHazards||(G.state.openingHazards=[]);
    e.openingBeat=(e.openingBeat||0)+1;
    if(e.openingBeat%2){
      const flood={kind:'flood',owner:e,x:e.x,y:e.y+12,radius:phase===3?57:70,t:0,warn:1.65,active:.65,hit:false};
      floodRefuge(flood,p);
      if(assist)flood.warn+=.4;
      hazards.push(flood);e.openingTimer=flood.warn+flood.active+1.3;
    }else{
      const a=Math.atan2(p.y-e.y,p.x-e.x),count=phase===1?1:3;
      for(let i=0;i<count;i++){const angle=a+(i-(count-1)/2)*.65;hazards.push({kind:'tollSweep',owner:e,x:e.x,y:e.y,dx:Math.cos(angle),dy:Math.sin(angle),length:155,width:8,t:0,warn,active:.25,hit:false});}
      e.openingTimer=warn+1.5;
    }
    G.sfx.play('bossPhase');return true;
  };
})();
