/* Menu-optional play: tangible help at fires, and a field pocket preview.
   Existing comfort preferences and owned items remain the only authorities.
   Looking never equips; lighting help never awards progress. */
"use strict";
(() => {
  const el=document.getElementById('field-kit');
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lamps=[
    {key:'easyMode',name:'Heart Lantern',icon:'♥',color:'#efa2ae',effect:'Hearts grow back.',detail:'One heart every 6 seconds, after a short breather. Works in fights too.'},
    {key:'bossAssistance',name:'Guardian Lantern',icon:'☀',color:'#ffce7b',effect:'More time to react.',detail:'Longer guardian warnings. Extra hearts and slower boss shots after retries.'},
  ];
  G.HELP_LANTERNS=lamps;
  // Keep compact benefits explicit for a child; the full bench remains optional.
  const benefits={heartwood:['Wider swings','Swings push foes less'],mire:['Poison lasts longer','Paid arts cost more mana'],eclipse:['Hold more mana','Mana grows back slower'],plume:['Dash sooner','Area arts recover slower'],plumbline:['Longer guard after a swing','Dashes cost more mana'],spindle:['Chains reach one more foe','Shots recover slower'],clapper:['Chain 3 foes: gain mana','Area arts cost more mana'],ember:['Area arts snuff a shot','Chains cost more mana'],lodestone:['Matching hits crack more ward','Dashes recover slower']};
  G.pocketTreasures=()=>{
    if(!G.state)return [];
    const owned=new Set(G.state.items);
    const gifts=G.KEEPSAKES.filter(k=>owned.has(k.item)).map(k=>({...k,kind:'carry',benefit:benefits[k.id][0],cost:benefits[k.id][1]}));
    const giftItems=new Set(G.KEEPSAKES.map(k=>k.item));
    const found=Object.entries(G.treasureInfo||{}).filter(([id])=>owned.has(id)&&!giftItems.has(id)).map(([id,info])=>({id,item:id,...info,kind:'memory'}));
    return [...gifts,...found];
  };
  let view=null,index=0,intro=false,invitePending=false;
  function close(){
    if(!view)return;
    view=null;el.classList.add('hidden');el.setAttribute('aria-hidden','true');el.innerHTML='';
    G.menuController.reset(el);G.input.clearTaps();
    if(intro){intro=false;const o=G.state.opening;if(!o.seen.includes('help-lanterns'))o.seen.push('help-lanterns');G.saveGame();}
  }
  function allowed(){return !!G.state&&!G.saveSlotScreenOpen&&!G.state.knockout&&!G.state.bossCutscene&&!G.ui.menuOpen&&!G.ui.dialogueOpen&&!G.ui.formWheelOpen&&!G.ui.artMixerOpen&&!view;}
  function show(kind,preferred){
    if(!allowed())return false;
    view=kind;el.classList.remove('hidden');el.setAttribute('aria-hidden','false');render(preferred);G.input.clearTaps();G.sfx.play('menu');return true;
  }
  function page(delta){const list=G.pocketTreasures();if(!list.length)return;index=(index+delta+list.length)%list.length;render('pocket-next');}
  function render(preferred){
    const body=view==='lanterns'?lamps.map(l=>{
      const lit=G.comfortSetting(l.key);
      return `<button class="help-lamp ${lit?'lit':''}" data-lamp="${l.key}" data-nav-id="lamp-${l.key}" aria-pressed="${lit}" style="--lamp:${l.color}">
        <span class="lantern-picture" aria-hidden="true"><i>${l.icon}</i></span><strong>${l.name}</strong><span class="lamp-state">${lit?'LIT':'UNLIT'}</span><b>${l.effect}</b><small>${l.detail}</small><em>${lit?'Put out':'Light'}</em></button>`;
    }).join(''):pocketCard();
    el.innerHTML=`<section class="field-kit-panel" role="dialog" aria-modal="true" aria-label="${view==='lanterns'?'Help lanterns':'Pockets'}">
      <header><div><h1>${view==='lanterns'?'A little light for your road':'Patchling’s Pockets'}</h1>${view==='lanterns'?'<p>Light either. Change them at any camp.</p>':carriedPocket()}</div><button data-kit-close data-nav-id="kit-close" aria-label="${view==='lanterns'?'Done with lanterns':'Close pockets'}">Done ✓</button></header>
      <div class="${view==='lanterns'?'help-lamps':'pocket-layout'}">${body}</div>
    </section>`;
    el.querySelector('[data-kit-close]')?.addEventListener('click',close);
    el.querySelectorAll('[data-lamp]').forEach(b=>b.addEventListener('click',()=>{
      const key=b.dataset.lamp;G.setComfortSetting(key,!G.comfortSetting(key));G.sfx.play('pickup');render(`lamp-${key}`);
    }));
    el.querySelectorAll('[data-pocket-page]').forEach(b=>b.addEventListener('click',()=>page(Number(b.dataset.pocketPage))));
    el.querySelector('[data-pocket-carry]')?.addEventListener('click',()=>{
      const k=G.pocketTreasures()[index];if(k?.kind!=='carry')return;
      const id=G.activeKeepsake()?.id===k.id?null:k.id;
      if(G.carryKeepsake(id)){G.ui.toast(id?`${k.name} tucked in your pocket`:`${k.name} set aside`,2);G.sfx.play('pickup');close();}
    });
    // Bring the newly revealed explanation into view on short touch screens
    // and TV. Opening a disclosure must not leave its contents below the fold.
    el.querySelectorAll('details').forEach(detail=>detail.addEventListener('toggle',()=>{
      if(detail.open)detail.scrollIntoView({block:'nearest',inline:'nearest'});
    }));
    // Real authored treasure art, without writing to owned items or equipment.
    el.querySelectorAll('[data-pocket-art]').forEach(canvas=>{
      const shape=G.treasureInfo[canvas.dataset.pocketArt]?.shape;
      const sprite=G.treasureArt?.[shape];if(!sprite)return;
      const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;const m=G.spriteMetrics(sprite),scale=(Math.min(canvas.width,canvas.height)-8)/Math.max(m.w,m.h);
      G.drawSprite(c,sprite,0,canvas.width/2,canvas.height-4,false,scale);
    });
    if(G.input.hasGamepad)G.menuController.focusDefault(el,el.querySelector(`[data-nav-id="${preferred||'kit-close'}"]`));
  }
  function carriedPocket(){
    const k=G.activeKeepsake();
    const picture=k?`<canvas width="36" height="36" data-pocket-art="${k.item}" aria-hidden="true"></canvas>`:'<svg width="36" height="36" viewBox="0 0 36 36" aria-hidden="true"><path d="M7 8 Q18 4 29 8 L27 29 Q18 35 9 29Z" fill="#8d7558" stroke="#dfbd83" stroke-width="2"/><path d="M10 9 Q18 16 26 9" fill="#243c37" stroke="#dfbd83" stroke-width="2"/></svg>';
    return `<div class="carried-pocket">${picture}<span>${k?`Carrying ${esc(k.name)}`:'Empty gift pocket'}</span></div>`;
  }
  function pocketCard(){
    const list=G.pocketTreasures();index=Math.min(index,Math.max(0,list.length-1));const k=list[index];
    if(!k)return '<p>Your pockets are waiting for their first treasure.</p>';
    const carried=k.kind==='carry'&&G.activeKeepsake()?.id===k.id;
    return `<nav class="pocket-pages" aria-label="Look through treasures"><button data-pocket-page="-1" data-nav-id="pocket-prev" ${list.length<2?'disabled':''}>◀ Back</button><strong>${index+1} / ${list.length}</strong><button data-pocket-page="1" data-nav-id="pocket-next" ${list.length<2?'disabled':''}>Next ▶</button></nav>
      <article class="pocket-treasure"><canvas width="128" height="112" data-pocket-art="${k.item}" aria-label="${esc(k.name)}"></canvas><div><small>${k.kind==='carry'?(carried?'IN YOUR POCKET':'GUARDIAN GIFT'):'SOUVENIR · COLLECTED'}</small><h2>${esc(k.name)}</h2>
      ${k.kind==='carry'?`<p class="pocket-gift">＋ ${esc(k.benefit)}</p><p class="pocket-price">↔ ${esc(k.cost)}</p><div class="pocket-actions"><button data-pocket-carry data-nav-id="pocket-carry">${carried?'Set it aside':'Carry this gift'}</button><details><summary tabindex="0" data-nav-id="pocket-detail">Look closer</summary><p>${esc(k.gain)} ${esc(k.price)}</p></details></div>`:`<p>${esc(k.purpose)}</p>`}</div></article>`;
  }
  G.fieldKit={isOpen:()=>!!view,close,openLanterns:preferred=>show('lanterns',preferred),openPockets:()=>{index=Math.max(0,G.pocketTreasures().findIndex(k=>k.id===G.activeKeepsake()?.id));return show('pockets','pocket-carry');},update:dt=>{
    G.menuController.update(el,{preferred:el.querySelector('[data-kit-close]'),onBack:close,onPageLeft:()=>view==='pockets'?page(-1):undefined,onPageRight:()=>view==='pockets'?page(1):undefined},dt);
    if(G.input.tapped('pause'))close();
  }};
  G.introduceHelpLanterns=()=>{
    const o=G.state?.opening;if(!o||o.seen.includes('help-lanterns')||invitePending||intro||view)return false;
    invitePending=true;
    G.ui.dialogue('PEBBLE','Psst, Patchling! Want a little help? Try my lanterns!',{accent:'#efa2ae',onClose:()=>{invitePending=false;intro=G.fieldKit.openLanterns();}});return true;
  };
  // Rest locations already exist across the campaign. Place light props on
  // ordinary, walkable tiles, never on a door, message, reward, or camp fire.
  let stations=[];
  G.helpStations=()=>stations;
  G.events.on('mapEnter',()=>{
    stations=[];const s=G.state,used=new Set();
    const free=(x,y)=>{const c=s.grid[y]?.[x];return c&&['grass','path','floor'].includes(c.tile)&&!c.rest&&!c.portal&&!c.message&&!c.chest&&!c.smallPassage&&!c.enemy&&!c.townPlot&&G.world.isSafeSpawn(x*16+8,y*16+8)&&!used.has(`${x},${y}`)&&!(s.npcs||[]).some(n=>Math.hypot(n.x-(x*16+8),n.y-(y*16+8))<12);};
    const add=(x,y,kind,approach)=>{if(!free(x,y))return false;used.add(`${x},${y}`);stations.push({kind,x:x*16+8,y:y*16+8,...(approach?{approach}: {})});return true;};
    if(s.mapId==='orchardRoad'){add(6,38,'easyMode');add(8,38,'bossAssistance');}
    for(let y=0;y<s.mapH;y++)for(let x=0;x<s.mapW;x++)if(s.grid[y][x].rest){
      const spots=[[-1,0],[1,0],[0,1],[-1,1],[1,1],[0,-1],[-1,-1],[1,-1]];
      for(const kind of ['easyMode','bossAssistance','pockets'])for(const [dx,dy]of spots)if(add(x+dx,y+dy,kind))break;
    }
    // Prepare on the approach, not after entering danger. Open Worldwake
    // guardians already have caravan fires; houses and migration arenas do not
    // need another cluster of lamps. Use the actual registered destination.
    for(let y=0;y<s.mapH;y++)for(let x=0;x<s.mapW;x++){
      const door=s.grid[y][x].portal,dest=door&&G.maps[door.map];
      if(!dest||dest.worldwake||dest.worldbearer)continue;
      const guardian=Object.values(dest.legend||{}).some(c=>c.enemy&&G.enemies[c.enemy]?.miniboss);
      if(!dest.bossTrial&&!guardian&&!['dungeon','starfallRuins'].includes(dest.id))continue;
      // A trial's return point describes its walkable outside approach. In the
      // orchard it also keeps the lights below the closed root arch.
      const exit=dest.bossTrial?.exit;
      const seeds=exit?.map===s.mapId&&Math.hypot(exit.x-x,exit.y-y)<=8&&G.world.isSafeSpawn(exit.x*16+8,exit.y*16+8)?[[exit.x,exit.y]]:[[x-1,y],[x+1,y],[x,y-1],[x,y+1]];
      const queue=[],seen=new Set();
      const visit=(tx,ty,depth)=>{
        const key=`${tx},${ty}`,c=s.grid[ty]?.[tx];
        if(seen.has(key)||!c||c.portal||!G.world.isSafeSpawn(tx*16+8,ty*16+8))return;
        seen.add(key);queue.push({x:tx,y:ty,depth});
      };
      seeds.forEach(([tx,ty])=>visit(tx,ty,0));
      for(let i=0;i<queue.length;i++){
        const at=queue[i];if(at.depth>=6)continue;
        for(const [dx,dy]of [[-1,0],[1,0],[0,1],[0,-1]])visit(at.x+dx,at.y+dy,at.depth+1);
      }
      for(const kind of ['easyMode','bossAssistance']){
        for(const at of queue){
          if((s.enemies||[]).some(e=>!e.dead&&!e.def.practice&&Math.hypot(e.x-(at.x*16+8),e.y-(at.y*16+8))<72))continue;
          if(add(at.x,at.y,kind,dest.id))break;
        }
      }
    }
    addChallengeLamps();
  });
  function addChallengeLamps(){
    for(const at of [G.treantChallengeStation?.(),G.mireChallengeStation?.()])
      if(at&&!stations.some(s=>s.kind===at.kind))stations.push(at);
  }
  G.events.on('kill',data=>{if(['ancientTreant','mireQueen'].includes(data.enemy))addChallengeLamps();});
  const safe=()=>G.state&&!G.ui.dialogueOpen&&!G.ui.menuOpen&&!view&&!G.state.knockout&&!G.state.bossCutscene&&!G.state.zoneTransition&&!G.activeWorldbearer?.()&&!(G.state.enemies||[]).some(e=>!e.dead&&!e.def.practice&&Math.hypot(e.x-G.state.player.x,e.y-G.state.player.y)<68)&&!(G.state.projectiles||[]).some(p=>!p.fromPlayer&&Math.hypot(p.x-G.state.player.x,p.y-G.state.player.y)<68);
  G.helpStationCandidate=()=>{
    if(!safe())return null;
    const p=G.state.player,near=stations.map(s=>({...s,d:Math.hypot(s.x-p.x,s.y-p.y)})).filter(s=>s.d<=20).sort((a,b)=>a.d-b.d)[0];
    if(!near)return null;
    if((near.kind==='treantChallenge'&&G.treantRematchActive())||(near.kind==='mireChallenge'&&G.mireRematchActive()))return null;
    const npc=G.npcTalkCandidate?.();
    if(npc&&Math.hypot(npc.x-p.x,npc.y-p.y)<near.d+6)return null;
    const lamp=lamps.find(l=>l.key===near.kind);
    if(near.kind==='treantChallenge')return {...near,id:'field-kit',label:`Branching Roots · ${G.treantBranchingLit()?'Put out':'Light'}`,hint:'Adds a following root. Snap the first root to stop it.'};
    if(near.kind==='mireChallenge')return {...near,id:'field-kit',label:`Rippling Mire · ${G.mireRipplingLit()?'Put out':'Light'}`,hint:'Adds a following volley. Crack the mire near the Queen to stop it.'};
    return {...near,id:'field-kit',hint:lamp?(lamp.key==='easyMode'?'Hearts grow back, even in fights.':'Longer warnings; help after retries.'):null,label:lamp?`${lamp.icon} ${lamp.name} · ${G.comfortSetting(lamp.key)?'Put out':'Light'}`:'Camp bag · Pockets'};
  };
  const candidate=G.openingInteractionCandidate,interact=G.tryOpeningInteraction;
  G.openingInteractionCandidate=()=>candidate()||G.helpStationCandidate();
  G.tryOpeningInteraction=()=>{
    if(candidate())return interact();
    const at=G.helpStationCandidate();if(!at)return interact();
    if(at.kind==='pockets')return G.fieldKit.openPockets();
    if(at.kind==='treantChallenge'){G.toggleTreantBranching();G.sfx.play('pickup');G.input.clearTaps();return true;}
    if(at.kind==='mireChallenge'){G.toggleMireRippling();G.sfx.play('pickup');G.input.clearTaps();return true;}
    G.setComfortSetting(at.kind,!G.comfortSetting(at.kind));G.sfx.play('pickup');G.input.clearTaps();return true;
  };
  const drawables=G.openingDrawables;
  G.openingDrawables=c=>{const list=drawables(c);for(const s of stations)list.push({y:s.y,fn:()=>drawStation(c,s)});return list;};
  function drawStation(c,s){
    const lamp=lamps.find(l=>l.key===s.kind)||(['treantChallenge','mireChallenge'].includes(s.kind)?{key:s.kind,color:s.kind==='mireChallenge'?'#b7d9d4':'#e9ac75'}:null),lit=lamp&&(s.kind==='treantChallenge'?G.treantBranchingLit():s.kind==='mireChallenge'?G.mireRipplingLit():G.comfortSetting(lamp.key)),x=s.x,y=s.y;
    c.save();c.fillStyle='rgba(25,38,35,.25)';c.beginPath();c.ellipse(x,y+3,9,3,0,0,Math.PI*2);c.fill();
    if(!lamp){c.fillStyle='#48382f';c.fillRect(x-7,y-11,14,14);c.fillStyle='#af8462';c.fillRect(x-6,y-10,12,11);c.fillStyle='#e9c890';c.fillRect(x-7,y-12,14,4);c.fillRect(x-1,y-9,2,5);c.strokeStyle='#e9c890';c.strokeRect(x-4,y-15,8,5);c.restore();return;}
    if(lit){c.fillStyle=lamp.color+'33';c.beginPath();c.ellipse(x,y-8,13,15,0,0,Math.PI*2);c.fill();}
    c.fillStyle='#443b39';c.fillRect(x-6,y-18,12,19);c.fillStyle='#cfb078';c.fillRect(x-5,y-19,10,3);c.fillRect(x-7,y-1,14,3);c.fillRect(x-1,y-23,2,5);
    c.fillStyle=lit?lamp.color:'#5e746d';c.fillRect(x-4,y-15,8,13);c.fillStyle=lit?'#fff0d4':'#9aaca0';
    if(s.kind==='treantChallenge'){
      c.strokeStyle=lit?'#fff3c2':'#c4baa0';c.lineWidth=2;c.beginPath();c.moveTo(x-3,y-12);c.lineTo(x+3,y-5);c.moveTo(x+3,y-12);c.lineTo(x-3,y-5);c.stroke();
      if(lit){c.fillStyle='#fff3c2';c.beginPath();c.moveTo(x,y-17);c.lineTo(x-2,y-14);c.lineTo(x,y-12);c.lineTo(x+2,y-14);c.closePath();c.fill();}
    }else if(s.kind==='mireChallenge'){
      c.strokeStyle=lit?'#fff3c2':'#c4baa0';c.lineWidth=1;for(const dy of [-10,-6]){c.beginPath();c.ellipse(x,y+dy,3,1.5,0,0,Math.PI*2);c.stroke();}
      if(lit){c.fillStyle='#fff3c2';c.beginPath();c.arc(x,y-14,1.5,0,Math.PI*2);c.fill();}
    }else if(s.kind==='easyMode'){c.fillRect(x-3,y-11,2,3);c.fillRect(x+1,y-11,2,3);c.fillRect(x-2,y-8,4,2);c.fillRect(x-1,y-6,2,1);}
    else{c.fillRect(x-2,y-12,4,6);c.fillRect(x-3,y-11,6,4);c.fillRect(x-1,y-14,2,1);c.fillRect(x-1,y-4,2,1);}
    c.restore();
  }
})();
