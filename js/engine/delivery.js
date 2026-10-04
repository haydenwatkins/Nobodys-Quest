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
    return {gift,inPocket,mapId:gift.mapId,point:inPocket?[gift.x/16-.5,gift.y/16-.5]:[20,30],
      text:inPocket?'Walk over the recipe book to collect it, then walk back through the drain and bring Brindle the good news.':'Become Rat and walk south through the Lantern Reach drain again. The recipe book waits safely in the little pocket beneath the bank.'};
  };
  G.deliveryGoal=()=>{
    const s=G.state;if(!s)return null;const d=state();
    const gift=(s.groundRewards||[]).find(g=>['orchard-ribbon','sunrise-seal','keeper-lantern','brindles-recipes'].includes(g.item)&&!s.items.includes(g.item));
    const approach=gift?.item==='brindles-recipes'?G.recipeGiftApproach():null;
    if(gift)return {chapter:1,act:G.STORY_CHAPTERS[1],title:'A gift for helping',short:`Collect the ${G.groundRewardInfo(gift).name}`,objective:approach?approach.text:`Walk over the gift on the ground. ${G.groundRewardInfo(gift).purpose}. The road and your unfinished promises remain open.`,reason:'Your help is remembered. Its gift waits even if you leave.',mapId:gift.mapId,point:approach?approach.point:[gift.x/16-.5,gift.y/16-.5],destination:G.maps[gift.mapId].name,guide:'opening',progress:{value:d.complete?8:d.keeper?4:0,total:8,label:'A THANK-YOU GIFT'},complete:false};
    if(d.complete||(!d.started&&!(s.opening&&s.opening.complete)))return null;
    let mapId,point,short,objective,value;
    if(!d.started){mapId='orchardRoad';point=[26,37];short='Meet Parcel beside the east road';objective='Talk to Parcel beside the cart, then follow Orchard Road east toward the lanterns.';value=0;}
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
    if(map==='orchardRoad'&&G.state.opening.complete&&!d.started)return option('depart','Plan the road with Parcel',26,37);
    if(!here())return null;
    if(map==='lanternReach'){
      for(const i of [0,1])if(d.started&&d.lamps[i]===0&&(i===0||d.lamps[0]===2)){
        const [x,y]=i?[38,12]:[14,24],at=option('lamp'+i,'Raise the '+(i?'second':'first')+' lantern',x,y);if(at)return at;
      }
      if(!d.salvage||G.groundRewardFor('brindles-recipes'))return option('drain','Low drain · walk south as Rat',20,30,25);
    }
    if(map==='sunriseQuay'&&d.started&&d.keeper){
      if(d.complete&&G.expeditionUnlocked()){
        const trail=option('manyfold','Choose a Manyfold trail',35,20);if(trail)return trail;
      }
      for(const [id,[x,y]]of Object.entries(locations))if(!d.parcels.includes(id)){
        const at=option(id,{bread:'Deliver the flour',letter:'Deliver Mara’s letter',present:'Deliver the birthday present'}[id],x,y);if(at)return at;
      }
      if(d.parcels.length===3&&!d.complete)return option('finish','Tell Parcel the delivery is done',8,20);
    }
    return null;
  };
  const oldCandidate=G.openingInteractionCandidate,oldInteract=G.tryOpeningInteraction;
  G.openingInteractionCandidate=()=>G.deliveryCandidate()||oldCandidate();
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
      d.started=true;
      say('departure',[['PARCEL','Flour for Brindle, a letter for Mara, and Pip’s birthday present. They’ve all been waiting for me. Let’s get these home!'],['PARCEL','Follow this road east to Lantern Reach. The first lamp is on the west bank. I’ll bring the cart along once you’ve made the road safe.'],['PATCHLING','I’ll walk ahead and look for the lamp!']]);
    }else if(at.id==='manyfold'){if(G.ui.openExpedition)G.ui.openExpedition(G.ensureExpeditionProgress().runs===0?3:undefined);}
    else if(at.id.startsWith('lamp')){
      const i=Number(at.id.slice(-1));d.lamps[i]=1;spawnWave(i);G.sfx.play('bossPhase');
      say('lamp'+i,[['PARCEL',i?'More root creatures! Clear the bank, please. I’ll keep the lamp safe.':'Oh no, there’s something moving in the reeds! I’ll stay with the cart. You’ve got room to dodge around it.']]);
    }else if(at.id==='drain'){
      if(s.formId!=='rat')G.ui.dialogue('PEBBLE','There’s something caught under that bank! Try the drain as Rat; I think you’ll fit.',{accent:'#e7bd78'});
      else G.ui.dialogue('PEBBLE','Walk south through the low drain. There’s a dry little pocket under the bank. Come back the same way when you’ve had a look.',{accent:'#e7bd78'});
    }else if(locations[at.id]){
      d.parcels.push(at.id);G.sfx.play('pickup');s.deliveryWarmT=3;
      const lines={bread:[['BAKER BRINDLE',d.salvage?'My flour AND my recipes! I can stop calling the burnt ones a local tradition.':'Flour! I was down to making the smell of bread. Very popular. Not filling.'],['PATCHLING','You must have missed baking for everyone.'],['BAKER BRINDLE','I did! I kept checking the road. I’m so happy to have you all back.']],
        letter:[['MARA','From my sister. She is coming home. She thought I had stopped writing.'],['PATCHLING','She must have missed you. I’m glad we got her letter here.'],['MARA','I will put another cup out.']],
        present:[['PIP','A wooden dragon! It has wheels!'],['PATCHLING','The best dragons do.'],['PIP','Will you stay until I make it fly?']]};
      say(at.id,lines[at.id]);
    }else if(at.id==='finish'){
      d.complete=true;const gift=G.revealActivityReward('sunrise-seal',at.x,at.y);
      G.healPlayer(G.playerMaxHearts(),'delivery');
      say('home',[['PARCEL','Everyone got their parcel! I was so worried we’d let them down. Thank you for staying with me.'],['PEBBLE','Welcome to Sunrise! You can come home here when you need a rest. Brindle’s been worrying about her lost recipe book—let’s check on her first.'],['PARCEL','The marsh is still flooded. Its queen is holding the harbour pearl. We’ll need dark magic when we go there. Your coat can learn a Wizard shape now; practice your Knight shield if it hasn’t appeared yet.'],['PATCHLING','First, cinnamon recipes. Then we’ll help with the harbour light.']]);
      G.ui.banner('THE LONG WAY HOME',gift?'Sunrise Seal waits nearby · walk over it for 8 town spirit':'Every parcel delivered · a place to return to');
    }
    G.saveGame();G.input.clearTaps();return true;
  };
  const oldTalk=G.npcDialogue;
  G.npcDialogue=(id,chapter,index)=>{
    if(G.state&&G.state.mapId==='sunriseQuay'){
      const d=state();
      if(id==='quayBaker'&&d.parcels.includes('bread'))return 'The first loaf is yours, dear. You’ve earned a warm lunch!';
      if(id==='quayMara'&&d.parcels.includes('letter'))return 'I’ve put a cup out for my sister. I can’t wait to see her again.';
      if(id==='quayPip'&&d.parcels.includes('present'))return 'I named him Thimble. He is a very important dragon.';
      if(id==='parcel'&&d.complete&&!G.systemIntroduced('sideAdventures'))return G.ensureTown().requests?.includes('recipes')?'Pebble’s worried about the late boat. Could you check on him at the centre of the quay?':'Brindle’s been worrying about her recipe book. She’s beside the bakery if you’d like to talk.';
      if(id==='parcel')return d.complete?'The west road goes back through the toll bridge and Lantern Reach to the orchard. If you want a new outing, the map stand beside the east lantern leads into the Manyfold. New paths, borrowed powers, and something to bring home. I might let you carry the post next time.':'We made it. Brindle is by the oven, Mara by the east house, Pip down by the water.';
    }
    return oldTalk(id,chapter,index);
  };
  G.events.on('mapEnter',()=>{
    if(!here())return;const s=G.state,d=state();s.openingHazards=[];
    if(s.mapId==='lanternReach'&&s.opening.complete&&!d.started){d.started=true;say('departure',[['PARCEL','Here are the lanterns! The first lamp is on this bank. Light it when you’re ready; I’ll keep the cart nearby.']]);}
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
    if(s.mapId==='lanternReach'&&s.formId==='rat'&&!d.salvage&&near(20,33,12)){
      d.salvage=true;G.revealActivityReward('brindles-recipes',20*16+8,33*16+8);G.sfx.play('pickup');
      say('salvage',[['PATCHLING','A recipe book! The pages smell of cinnamon. I’ll pick it up and bring it back to Brindle.'],['PEBBLE','Keep it dry! Walk back up the drain, then follow the lamps and bridge east to Sunrise.']]);G.saveGame();
    }
    if(s.mapId==='lanternReach')for(const i of [0,1]){
      if(d.lamps[i]!==1||s.enemies.some(e=>!e.dead&&e.deliveryWave===i))continue;
      d.lamps[i]=2;G.healPlayer(2,'lantern');s.player.mana=G.playerMaxMana();
      positionCourier();
      const [x,y]=i?[40,15]:[14,25];s.entryPoint={x:x*16+8,y:y*16+8};G.sfx.play('unlock');
      say('lit'+i,[['PARCEL',i?'Both lamps are lit! I can see the town windows past the bridge. We’re nearly home!':'That lamp makes such a difference. Thank you! I’ll bring the cart up now.']]);
    }
    if(s.mapId==='tollCourt'&&d.keeper)say('keeper',[['THE TOLLKEEPER','I’ve kept everyone waiting over an old toll. I’m sorry. You can cross now.'],['PATCHLING','Thank you! There are people waiting for us in Sunrise.'],['THE TOLLKEEPER',G.groundRewardFor('keeper-lantern')?'Take the lantern on the ground. One star for the road, and three parcels for the people waiting.':'Tell the people in Sunrise the bridge is open. I’m going to help keep it safe.']]);
    if(s.mapId==='sunriseQuay'&&d.keeper&&!d.complete)say('quay',[['PARCEL','There’s Sunrise! Brindle’s oven is smoking, and Pip’s waiting by the water. Oh, I’m so relieved!'],['PATCHLING','Let’s go say hello! I want to see Pip open his present.'],['PARCEL','He’s going to love it. Brindle is by the bakery, Mara’s at the blue door, and Pip’s down by the water.']]);
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
