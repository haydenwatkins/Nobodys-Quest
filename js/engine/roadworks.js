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
    G.sfx.play('pickup');G.ui.toast(repair.kind==='lamp'?'The lamp is clear. A warm path opens!':'The boards settle into place. A new crossing!',3);
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
  G.roadMechanismAim=enemy=>enemy.roadMechanism?.kind==='winch'&&G.state.formId==='ranger'&&!G.roadRepairOpen(enemy.roadMechanism.id);
  G.noteRoadworkBlast=(projectile,targets)=>{
    if(projectile.ability!=='volatileFlask'||targets.length<3)return;
    const road=roads().find(r=>r.id===G.state.mapId&&r.formId==='alchemist');if(!road)return;
    for(const repair of road.repairs){
      const nearby=targets.filter(e=>!e.def.practice&&Math.hypot((e.outingSpawnX??e.x)-(repair.x*16+8),(e.outingSpawnY??e.y)-(repair.y*16+8))<56);
      if(nearby.length>=3)open(repair);
    }
  };
  G.events.on('kill',()=>{
    const road=roads().find(r=>r.id===G.state.mapId&&r.formId==='alchemist');if(!road)return;
    // A player can clear a stand before noticing its group opportunity.
    // Finishing the remaining growth also repairs it; never demand a reload
    // or a respawn because one creature was bonked first.
    for(const repair of road.repairs)if(!G.state.enemies.some(e=>!e.dead&&!e.def.practice&&
      Math.hypot(e.outingSpawnX-repair.x*16-8,e.outingSpawnY-repair.y*16-8)<56))open(repair);
  });
  G.events.on('mapEnter',()=>{
    G.applyRoadRepairs();
    const road=roads().find(r=>r.id===G.state.mapId);if(!road)return;
    for(const repair of road.repairs){
      if(repair.kind==='lamp'||G.roadRepairOpen(repair.id))continue;
      // Existing inert practice actors supply native hit geometry; the
      // road renderer owns their physical appearance and saved open pose.
      const e=G.makeEnemy('slime',repair.x*16+8,repair.y*16+8);
      e.roadMechanism=repair;e.def={...e.def,name:'Road mechanism',practice:true,hp:999,damage:0,speed:0,size:16};e.hp=999;G.state.enemies.push(e);
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
    const verb=repair.kind==='winch'?'Shoot the copper winch across the creek':repair.kind==='pontoon'?'Pull the copper loop with Tongue Lash':remaining<3?'Clear the remaining creatures around this lamp':'Catch the three lamp creatures in one Volatile Flask burst';
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
