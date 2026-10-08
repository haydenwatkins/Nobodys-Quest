/* Physical repairs, native arts and optional neighbour promises share one
   saved world consequence. Mechanisms never manufacture mastery or kills. */
"use strict";
(() => {
  const roads=()=>G.EARLY_FORM_ROADS,repairs=()=>roads().flatMap(r=>r.repairs);
  G.makeRoadworks=()=>({opened:[]});
  G.normalizeRoadworks=raw=>({opened:[...new Set((Array.isArray(raw?.opened)?raw.opened:[]).filter(id=>repairs().some(r=>r.id===id)))]});
  const state=()=>G.state.roadworks||(G.state.roadworks=G.makeRoadworks());
  G.roadRepairOpen=id=>state().opened.includes(id);
  G.applyRoadRepairs=()=>{
    for(let y=0;y<G.state.mapH;y++)for(let x=0;x<G.state.mapW;x++){
      const cell=G.state.grid[y][x];
      if(cell.roadRepair&&G.roadRepairOpen(cell.roadRepair)&&cell.tile!=='path')G.state.grid[y][x]={...cell,tile:'path'};
    }
  };
  function open(repair){
    if(G.roadRepairOpen(repair.id))return false;
    state().opened.push(repair.id);G.applyRoadRepairs();
    for(const enemy of G.state.enemies)if(enemy.roadMechanism?.id===repair.id)enemy.dead=true;
    const [x0,y0,x1,y1]=repair.bridge;
    G.spawnFx({kind:'ring',x:(x0+x1+1)*8,y:(y0+y1+1)*8,color:'#a7f070',radius:26,dur:.65});
    const message=repair.kind==='flower'?'The dusk flower wakes. A warm path opens!':repair.kind==='bell'?'Both bells ring! Room for the show!':repair.kind==='vane'?'The glass vane turns. Room for the parade!':repair.kind==='soil'?'A little rumble. The dry path opens!':repair.kind==='lamp'?'The lamp is clear. A warm path opens!':repair.kind==='relay'?'The relays light up. The bridge lowers!':repair.kind==='brush'?'The branches roll aside. Room for the cart!':'The boards settle into place. A new crossing!';
    G.sfx.play('pickup');G.ui.toast(message,3);
    G.saveGame();return true;
  }
  G.hitRoadMechanism=(enemy,opts)=>{
    const repair=enemy.roadMechanism;
    if(!repair)return null;
    const native=G.abilities[opts.ability]?.nativeForm;
    if((repair.kind==='winch'&&native==='ranger'&&G.abilities[opts.ability]?.style==='projectile')||
      (repair.kind==='pontoon'&&opts.ability==='tongueLash'))open(repair);
    // Do not emit hit/kill/multiHit or refill mana from world furniture.
    return false;
  };
  G.roadMechanismAim=enemy=>!G.roadRepairOpen(enemy.roadMechanism?.id)&&
    ((enemy.roadMechanism?.kind==='winch'&&G.state.formId==='ranger')||
      (enemy.roadMechanism?.kind==='bell'&&enemy.roadMechanism.node===0&&G.state.formId==='jester'));
  function linkedContact(kind,ability,expected,contacts){
    if(ability!==expected)return;
    for(const repair of repairs().filter(r=>r.kind===kind)){
      const nodes=new Set([...contacts].filter(e=>e.roadMechanism?.id===repair.id).map(e=>e.roadMechanism.node));
      if(nodes.size===repair.nodes.length)open(repair);
    }
  }
  // Use the targets of one real arc or swing. Separate casts, distant
  // casts and a single Storm Spark cannot impersonate a connected action.
  G.noteRoadworkChain=(ability,contacts)=>linkedContact('relay',ability,'chainLightning',contacts);
  G.noteRoadworkSweep=(ability,contacts)=>linkedContact('brush',ability,'tailSweep',contacts);
  // Keep bell contacts on the actual card, never on a persistent task
  // counter. Two separate throws cannot stand in for one real ricochet.
  G.noteRoadworkRicochet=(projectile,enemy)=>{
    const repair=enemy.roadMechanism;
    if(repair?.kind!=='bell'||projectile.ability!=='wildCard'||projectile.sourceForm!=='jester'||
      !roads().some(r=>r.id===G.state.mapId&&r.formId===projectile.sourceForm&&r.repairs.some(p=>p.id===repair.id)))return;
    const contacts=projectile.roadContacts||(projectile.roadContacts=new Set());
    contacts.add(repair.id+':'+repair.node);
    if(projectile.ricochets<projectile.ricochetsMax&&repair.nodes.every((_,i)=>contacts.has(repair.id+':'+i)))open(repair);
  };
  // Real passive landings/echoes reach world props without pretending
  // they are living enemies or awarding hits, kills, mastery or mana.
  G.noteRoadworkPulse=(kind,x,y,radius,formId)=>{
    const road=roads().find(r=>r.id===G.state.mapId&&r.formId===formId);if(!road)return;
    for(const repair of road.repairs){
      const rx=repair.x*16+8,ry=repair.y*16+8;
      if(repair.kind===kind&&Math.hypot(rx-x,ry-y)<=radius&&G.combat.clearArc(x,y,rx,ry))open(repair);
    }
  };
  G.noteRoadworkBlast=(projectile,targets)=>{
    if(projectile.ability!=='volatileFlask'||targets.length<3)return;
    const road=roads().find(r=>r.id===G.state.mapId&&r.formId==='alchemist');if(!road)return;
    for(const repair of road.repairs){
      const nearby=targets.filter(e=>!e.def.practice&&Math.hypot((e.outingSpawnX??e.x)-(repair.x*16+8),(e.outingSpawnY??e.y)-(repair.y*16+8))<56);
      if(nearby.length>=3)open(repair);
    }
  };
  G.events.on('kill',()=>{
    const road=roads().find(r=>r.id===G.state.mapId&&['alchemist','vampire'].includes(r.formId));if(!road)return;
    // A player can clear a stand before noticing its group opportunity.
    // Finishing the remaining growth also repairs it; never demand a reload
    // or a respawn because one creature was bonked first. Dusk flowers
    // likewise keep the path usable if their creatures were cleared
    // before the player tried healing; damage is never a requirement.
    for(const repair of road.repairs)if(!G.state.enemies.some(e=>!e.dead&&!e.def.practice&&
      Math.hypot(e.outingSpawnX-repair.x*16-8,e.outingSpawnY-repair.y*16-8)<56))open(repair);
  });
  G.events.on('mapEnter',()=>{
    G.applyRoadRepairs();
    const road=roads().find(r=>r.id===G.state.mapId);if(!road)return;
    for(const repair of road.repairs){
      if(['lamp','vane','soil','flower'].includes(repair.kind)||G.roadRepairOpen(repair.id))continue;
      // Existing inert practice actors supply native hit geometry; the
      // road renderer owns their physical appearance and saved open pose.
      for(const [node,[x,y]]of (repair.nodes||[[repair.x,repair.y]]).entries()){
        const e=G.makeEnemy('slime',x*16+8,y*16+8);
        e.roadMechanism={...repair,node};e.def={...e.def,name:'Road mechanism',practice:true,hp:999,damage:0,speed:0,size:16};e.hp=999;G.state.enemies.push(e);
      }
    }
  });
  const enemyUpdate=G.updateOpeningEnemy;
  G.updateOpeningEnemy=(e,p,dt)=>e.roadMechanism?true:enemyUpdate?.(e,p,dt);
  const enemyDraw=G.drawEnemy;
  G.drawEnemy=(c,e)=>e.roadMechanism?undefined:enemyDraw(c,e);
  G.roadworkStep=road=>{
    const repair=road.repairs.find(r=>!G.roadRepairOpen(r.id));
    if(!repair)return {mapId:road.id,short:`Bring ${road.person} the good news`,objective:`Both routes are repaired. Return to ${road.person}.`,tileX:road.at[0],tileY:road.at[1],value:2};
    const remaining=G.state.mapId===road.id?G.state.enemies.filter(e=>!e.dead&&!e.def.practice&&Math.hypot(e.outingSpawnX-repair.x*16-8,e.outingSpawnY-repair.y*16-8)<56).length:3;
    const verb=repair.kind==='flower'?'Use Blood Bite near the dusk flower; healing or extra warmth wakes it':repair.kind==='bell'?'Throw Wild Card at the first stage bell; one card must bounce to both':repair.kind==='vane'?'Use Rift Rush towards the glass vane; its landing gust opens the gate':repair.kind==='soil'?'Use Burrow Blitz towards the packed soil, then wait for the little tremor':repair.kind==='winch'?'Shoot the copper winch across the creek':repair.kind==='pontoon'?'Pull the copper loop with Tongue Lash':repair.kind==='relay'?'Send Chain Lightning through all three copper relays':repair.kind==='brush'?'Stand beside the branches and move all three with Tail Sweep':remaining<3?'Clear the remaining creatures around this lamp':'Catch the three lamp creatures in one Volatile Flask burst';
    return {mapId:road.id,short:road.role,objective:verb+'. The long path is open if you need to approach from another side.',tileX:repair.approach[0],tileY:repair.approach[1],value:road.repairs.filter(r=>G.roadRepairOpen(r.id)).length};
  };
  G.roadworkOutingGoal=outing=>{
    const road=roads().find(r=>r.formId===outing.formId);
    if(!road||road.repairs.every(r=>G.roadRepairOpen(r.id)))return null;
    const step=G.roadworkStep(road);
    return {...step,guide:'outing',formId:road.formId,title:`An outing with ${G.forms[road.formId].name}`,destination:road.name,
      objective:G.state.formId===road.formId?step.objective:`Become ${G.forms[road.formId].name} and try helping ${road.person} on this road.`,
      reason:road.ask,progress:{value:step.value,total:2,label:'ROADS REPAIRED'}};
  };
  G.roadworkOutingTarget=goal=>goal.tileX===undefined?null:{kind:'form',color:G.GUIDANCE_COLORS.form,icon:G.forms[goal.formId].icon,destination:goal.title,
    x:goal.tileX*16+8,y:goal.tileY*16+8,tileX:goal.tileX,tileY:goal.tileY,text:goal.objective};
  for(const road of roads())G.registerSunriseRequest({id:`road-${road.formId}`,npc:road.npc,name:road.person,mapId:road.id,x:road.at[0],y:road.at[1],formId:road.formId,
    title:road.title,task:`Help ${road.person} repair both routes in ${road.name}, then return with the good news.`,reward:0,rewardText:'Two permanent crossings and a road picnic',
    consequence:'The repaired routes stay open for every shape.',ask:road.ask,tips:road.tips,thanks:road.thanks,after:road.after,
    ready:()=>road.repairs.every(r=>G.roadRepairOpen(r.id)),step:()=>G.roadworkStep(road)});
  const talk=G.npcDialogue;
  G.npcDialogue=(id,chapter,index)=>{
    const road=roads().find(r=>r.id===G.state.mapId&&r.npc===id);
    if(road&&!G.formUnlocked(road.formId))return road.ask+" The long path is still open. You're welcome to have a look around.";
    return talk(id,chapter,index);
  };
})();
