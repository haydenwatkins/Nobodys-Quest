/* THE FIRST PROMISE — saved, replayable opening. No separate input scheme:
   interactions use the same A / J / tap and dialogue pause as the rest of play. */
"use strict";
(() => {
  const road='orchardRoad',glade='heartwood';
  const near=(x,y,r=26)=>Math.hypot(G.state.player.x-(x*16+8),G.state.player.y-(y*16+8))<=r;
  const here=()=>G.state&&(G.state.mapId===road||G.state.mapId===glade);
  G.makeOpening=()=>({version:1,started:false,notice:false,cart:false,sluice:false,bell:false,complete:false,seen:[],defeated:[]});
  G.normalizeOpening=(raw)=>{
    const a=G.makeOpening();
    for(const k of ['notice','cart','sluice','bell','complete'])a[k]=!!(raw&&raw[k]);
    a.seen=Array.isArray(raw&&raw.seen)?raw.seen.filter(x=>typeof x==='string').slice(0,30):[];
    a.defeated=Array.isArray(raw&&raw.defeated)?raw.defeated.filter(x=>typeof x==='string').slice(0,40):[];
    a.started=!!(raw&&(raw.started||a.notice||a.cart||a.complete||a.seen.includes('arrival')));
    return a;
  };
  const progress=()=>G.state.opening||(G.state.opening=G.makeOpening());
  function say(key,lines,onClose) {
    const o=progress();if(o.seen.includes(key))return false;
    o.seen.push(key);G.saveGame();
    lines.forEach(([speaker,text],i)=>G.ui.dialogue(speaker,text,{accent:'#f2cf8b',onClose:i===lines.length-1?onClose:undefined}));
    return true;
  }
  G.beginOpening=()=>{
    const s=G.state;if(!here()||progress().complete)return false;
    progress().started=true;
    const st=G.ensureStory();st.prologueSeen=true;
    if(!st.seenChapters.includes(0))st.seenChapters.push(0);
    say('arrival',[
      ['PEBBLE','The notice says Somebody. You look like Nobody. This may be a very short interview.'],
      ['NOBODY','There is someone shouting up the road. I can start there.'],
    ]);
    return true;
  };
  G.openingActive=()=>!!(G.state&&(here()||progress().started)&&!progress().complete);
  G.openingGoal=()=>{
    if(!G.openingActive())return null;
    const o=progress(),won=G.state.items.includes('trophy-heartwood-crown');
    let data;
    if(won)data=['A road is a promise','Return to Parcel at the cart',[22,37],6,'The Heartwood is open. Tell Parcel the deliveries can reach Sunrise Town.'];
    else if(!o.notice)data=['Someone has to answer','Read the notice beside the road',[12,35],0,'Step up to the notice. The stranded cart is just beyond it.'];
    else if(!o.cart)data=['The first person who needed you','Clear the tangles around Parcel’s cart',[20,34],1,'The little root creatures have trapped the courier. Drive them away.'];
    else if(!G.formUnlocked('rat'))data=['A smaller answer',G.formReady('rat')?'Meet the Rat echo':'Practice Slap at the straw post',[20,23],2,'Finish two Nobody lessons. Practice at the straw post if you need more Slap contacts, then meet the echo.'];
    else if(!o.sluice)data=['Under the roots','Become Rat and enter the old culvert',[27,24],3,'The road is crushed under roots. Rat can slip through the culvert and release the sluice.'];
    else if(!G.formUnlocked('knight'))data=['Someone kept watch','Recover the crest beside the mill',[38,25],4,'The mill keeper left a Knight’s Crest. Open the chest and meet the shape it leaves behind.'];
    else if(!o.bell)data=['Let them hear you coming','Ring the watch bell',[46,14],5,'The watchmen gather near the bell. Clear the approach and ring it for the stranded town.'];
    else data=['The keeper of a closed road','Face the Ancient Treant',[16,6],5,'Go north through the root arch. Break the bark ward with a blunt move, then watch where the roots will rise.'];
    const mapId=won?road:o.bell?glade:road;
    return {chapter:0,act:G.STORY_CHAPTERS[0],title:data[0],short:data[1],objective:data[4],reason:'A delivery is waiting. Every new shape brings it one step closer to home.',
      mapId,destination:mapId===glade?'The Heartwood':'Orchard Road',guide:'opening',point:data[2],progress:{value:data[3],total:7,label:'THE FIRST PROMISE'},complete:false};
  };
  G.openingTarget=()=>{
    const goal=G.openingGoal();if(!goal||goal.mapId!==G.state.mapId)return null;
    let [x,y]=goal.point;
    if(progress().cart&&!G.formUnlocked('rat')) {
      const echo=G.formEchoFor('rat');if(echo&&echo.mapId===road){x=echo.x/16-.5;y=echo.y/16-.5;}
    }
    if(progress().sluice&&!G.formUnlocked('knight')){
      const echo=G.formEchoFor('knight');if(echo&&echo.mapId===road){x=echo.x/16-.5;y=echo.y/16-.5;}
    }
    return {x:x*16+8,y:y*16+8,tileX:Math.floor(x),tileY:Math.floor(y),kind:'story',icon:'◇',color:'#f2cf8b',destination:goal.short,text:goal.objective};
  };
  // Closed obstacles participate in movement, projectiles, and safe spawning.
  G.openingCellBlocked=(px,py)=>{
    if(!G.state||G.state.mapId!==road)return false;
    const x=Math.floor(px/16),y=Math.floor(py/16),o=progress();
    if(!o.sluice&&x>=29&&x<=32&&y===24)return true;
    return !o.bell&&x>=53&&x<=55&&y===3;
  };
  const threats=()=>G.state.enemies.some(e=>!e.dead&&!e.def.practice&&Math.hypot(e.x-G.state.player.x,e.y-G.state.player.y)<68);
  G.openingInteractionCandidate=()=>{
    if(!here()||G.ui.dialogueOpen||G.state.knockout||threats())return null;
    const o=progress();
    if(G.state.mapId===road){
      if(!o.sluice&&near(27,24,30))return {id:'culvert',label:G.state.formId==='rat'?'Slip through the culvert':'Culvert · Rat can fit',x:27*16+8,y:24*16+8};
      if(!o.bell&&near(46,14,28))return {id:'bell',label:'Ring the watch bell',x:46*16+8,y:14*16+8};
      if(G.state.items.includes('trophy-heartwood-crown')&&!o.complete&&near(22,37,38))return {id:'home',label:'Tell Parcel the road is open',x:22*16+8,y:37*16+8};
    }
    return null;
  };
  G.tryOpeningInteraction=()=>{
    const at=G.openingInteractionCandidate();if(!at)return false;
    const o=progress(),p=G.state.player;
    if(at.id==='culvert'){
      if(G.state.formId!=='rat')G.ui.dialogue('PEBBLE','I can see daylight through that drain. Try your Rat shape. Small is useful here.',{accent:'#d9a7ff'});
      else {
        o.sluice=true;p.x=35*16+8;p.y=24*16+8;p.dashing=null;p.lastSafe={x:p.x,y:p.y};
        G.state.entryPoint={x:p.x,y:p.y};G.state.mapReveal=G.reducedMotion?0:.28;
        say('sluice', [['PARCEL, FROM THE OTHER SIDE','The water is moving! And the bridge... you did it!'],['NOBODY','Nobody could move the roots. A rat could reach the latch.']]);
        G.healPlayer(2,'opening');G.sfx.play('unlock');G.saveGame();
      }
    } else if(at.id==='bell'){
      if(!G.formUnlocked('knight'))G.ui.dialogue('SER PENDING','The mill keeper’s crest is still beside the water. Bring that lesson with you before you meet the keeper of these roots.',{accent:'#f2cf8b'});
      else {
        o.bell=true;G.healPlayer(G.playerMaxHearts(),'opening');p.mana=G.playerMaxMana();
        G.sfx.play('bossIntro');G.state.openingBellT=3;
        say('bell',[['THE ANCIENT TREANT','That bell has been silent for years. Who dares promise this road will matter?'],['NOBODY','There is a cart behind me. That seems like a start.']]);G.saveGame();
      }
    }else if(at.id==='home'){
      o.complete=true;
      if(!G.state.items.includes('orchard-ribbon')){G.state.items.push('orchard-ribbon');if(G.state.town)G.state.town.spirit=(G.state.town.spirit||0)+5;}
      say('home',[['PARCEL','Bread, letters, a birthday present. None of it looked important until it stopped arriving.'],['PEBBLE','The notice still says Somebody. Shall we correct it?'],['NOBODY','Leave it. Someone else might answer too.']]);
      G.ui.banner('THE FIRST PROMISE KEPT','Orchard Ribbon · 5 town spirit · the wider world awaits');G.saveGame();
    }
    G.input.clearTaps();return true;
  };
  const oldNpcDialogue=G.npcDialogue;
  G.npcDialogue=(id,chapter,index)=>{
    if(G.state&&G.state.mapId===road){
      if(id==='parcel')return progress().cart?'There is a drain under the roots. The mill keeper used to keep a spare crest beside the water.':'Those tangles will eat the birthday present next. Please help!';
      if(id==='pending')return progress().bell?'A blunt blow breaks old bark. My Shield Advance will do; Nobody’s Slap works too. The empty ground between roots is your way through.':'A shield is a promise to stay when running would be easier. Try Shield Advance as the watchman winds up, then answer with Oathblade.';
      if(id==='pebble')return 'The world waited for a perfect hero. The courier would settle for someone who showed up.';
    }
    return oldNpcDialogue(id,chapter,index);
  };
  function tagEnemies(){
    if(!here())return;
    const s=G.state,o=progress();
    for(const e of s.enemies){
      e.openingKey=`${s.mapId}:${Math.round(e.x)},${Math.round(e.y)}`;
      if(o.defeated.includes(e.openingKey))e.dead=true;
      if(s.mapId===glade&&e.id==='ancientTreant'){
        e.def=Object.assign({},e.def,{aggro:170,size:34,sprite:G.openingTreantSprite||e.def.sprite,boss:Object.assign({},e.def.boss,{orchard:true,
          introLines:['I kept this road safe. I held it still. Nothing could be lost if nothing ever left.','And still the bell rings. Show me what a road is for.'],
          phaseLine:'You found the gaps. Then let the roots learn to move.',phaseThreeLine:'A road is not safe because it is closed. Come, little traveler!',
          defeatLine:'Take the road. I will hold the branches high enough for everyone.',
        })});
      }
    }
    if(s.mapId===road){
      const dummy=G.makeEnemy('orchardTangle',20*16+8,23*16+8);
      dummy.id='orchardPractice';dummy.def=Object.assign({},dummy.def,{name:'Straw Practice Post',practice:true,hp:999,damage:0,speed:0,size:14});dummy.hp=999;
      s.enemies.push(dummy);
      for(const n of s.npcs){n.anchors=[n.home];n.routineT=999;}
    }
    s.openingHazards=[];
  }
  G.events.on('mapEnter',()=>tagEnemies());
  G.events.on('sign',()=>{if(G.state.mapId===road){progress().notice=true;G.saveGame();}});
  G.events.on('kill',data=>{
    if(!here())return;
    const e=G.state.enemies.find(e=>e.dead&&e.id===data.enemy&&e.x===data.x&&e.y===data.y);
    if(e&&e.openingKey&&!progress().defeated.includes(e.openingKey))progress().defeated.push(e.openingKey);
    G.saveGame();
  });
  G.events.on('formUnlock',({form})=>{
    if(!here())return;
    if(form==='rat')say('rat',[['PEBBLE','Keep the small shape. The drain under the roots is just ahead.']]);
    if(form==='knight')say('knight',[['SER PENDING','A guard, then an answer. Let the watchman commit to its swing; meet it with your shield.']]);
  });
  G.updateOpening=dt=>{
    if(!here())return;
    const s=G.state,o=progress();s.openingBellT=Math.max(0,(s.openingBellT||0)-dt);
    if(s.mapId===road&&!o.cart&&!s.enemies.some(e=>!e.dead&&e.id==='orchardTangle')){
      o.cart=true;
      say('cart',[['PARCEL','Thank you! The mill bridge is caught in those roots. Sunrise hasn’t had a delivery in days.'],['PEBBLE','You answered. That is already more than the prophecy managed.']]);
    }
    // A practice contact can finish a lesson after the last creature is gone.
    // Seed an earned echo beside the post, never underneath a wall or the player.
    if(s.mapId===road&&o.cart&&G.formReady('rat')&&!G.formEchoFor('rat'))G.leaveReadyFormEchoAt(22*16+8,24*16+8,'battle');
    if(s.mapId===glade&&s.items.includes('trophy-heartwood-crown')){
      say('road-open',[['THE ANCIENT TREANT','Tell them the orchard will bloom again. Tell them they may come home.'],['PEBBLE','Parcel should hear this. A promise is better when it arrives.']]);
    }
    for(const h of s.openingHazards||[]){
      h.t+=dt;
      if(!h.hit&&h.t>=h.warn&&h.t<h.warn+h.active&&!h.owner.dead&&G.openingHazardHits(h,s.player.x,s.player.y))
        h.hit=!!G.damagePlayer(1,h.owner.x,h.owner.y);
    }
    s.openingHazards=(s.openingHazards||[]).filter(h=>!h.owner.dead&&h.t<h.warn+h.active);
  };
  G.openingHazardHits=(h,x,y)=>{
    if(h.kind==='roots')return Math.hypot(x-h.x,y-h.y)<h.radius;
    const dx=x-h.x,dy=y-h.y;
    const along=dx*h.dx+dy*h.dy,across=Math.abs(dx*h.dy-dy*h.dx);
    return along>0&&along<h.length&&across<h.width;
  };
  // Distinct watchmen: fixed windup, committed thrust, generous recovery.
  G.updateOpeningEnemy=(e,p,dt)=>{
    if(e.def.practice)return true;
    if(e.id!=='orchardGuard')return false;
    e.openingTimer=Math.max(0,(e.openingTimer||0)-dt);
    if(e.openingMode==='windup'){
      if(e.openingTimer<=0){
        e.openingMode='recover';e.openingTimer=.9;
        const a=e.openingAim;G.world.moveBox(e,a.x*24,a.y*24);
        if(Math.hypot(e.x-p.x,e.y-p.y)<24)G.damagePlayer(1,e.x,e.y);
        G.spawnFx({kind:'slash',x:e.x,y:e.y-6,a:Math.atan2(a.y,a.x),arc:1.2,range:24,color:'#f2cf8b',dur:.2});
      }
      return true;
    }
    if(e.openingMode==='recover'&&e.openingTimer>0)return true;
    if(Math.hypot(e.x-p.x,e.y-p.y)<53){
      const a=Math.atan2(p.y-e.y,p.x-e.x);e.openingAim={x:Math.cos(a),y:Math.sin(a)};
      e.dir=e.openingAim;e.openingMode='windup';e.openingTimer=.75;return true;
    }
    e.openingMode=null;return false;
  };
  // Treant attacks are ground commitments with visible safe space. Phase
  // changes and stagger retain the common boss machinery and cancel hazards.
  G.updateOrchardBoss=(e,p,dt)=>{
    if(!e.def.boss.orchard)return false;
    e.openingTimer=Math.max(0,(e.openingTimer||0)-dt);
    if(e.openingTimer>0)return true;
    e.openingBeat=(e.openingBeat||0)+1;
    const hazards=G.state.openingHazards||(G.state.openingHazards=[]);
    const assist=G.comfortSetting&&G.comfortSetting('bossAssistance');
    const warn=(e.bossPhase===1?.95:.8)+(assist?.3:0);
    if(e.openingBeat%2){
      const a=Math.atan2(p.y-e.y,p.x-e.x),count=e.bossPhase===1?1:3;
      for(let i=0;i<count;i++){
        const angle=a+(i-(count-1)/2)*.55;
        hazards.push({kind:'branch',owner:e,t:0,warn,active:.25,x:e.x,y:e.y,dx:Math.cos(angle),dy:Math.sin(angle),length:180,width:9,hit:false});
      }
    }else{
      const offsets=e.bossPhase===1?[[0,0]]:e.bossPhase===2?[[0,0],[42,0],[-42,0]]:[[0,0],[42,0],[-42,0],[0,42],[0,-42]];
      for(const [dx,dy]of offsets)hazards.push({kind:'roots',owner:e,t:0,warn,active:.55,x:p.x+dx,y:p.y+dy,radius:17,hit:false});
    }
    e.openingTimer=warn+1.45;e.bossRecoverT=.15;
    G.sfx.play('bossPhase');return true;
  };
})();
