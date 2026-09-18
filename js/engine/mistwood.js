/* Trail bells make the old middle road remember its travellers. */
"use strict";
(() => {
  const map="mistwood",reward="mistwood-middle-road";
  const bells=[{id:"mistwood-bell-west",name:"Fern Bell",x:6,y:5},{id:"mistwood-bell-east",name:"Moth Bell",x:23,y:5},{id:"mistwood-bell-south",name:"Root Bell",x:7,y:13}];
  const has=id=>G.state.items.includes(id);
  G.mistwoodSurvey=()=>({bells:bells.filter(b=>has(b.id)).length,open:has(reward)});
  function restore(){if(G.state.mapId===map&&has(reward))for(const y of [9,10])G.state.grid[y][14]={tile:"path"};}
  G.events.on("mapEnter",restore);
  function candidate(){
    const s=G.state;
    if(s.mapId!==map||s.expeditionRun||s.knockout||s.bossCutscene||G.ui.dialogueOpen)return null;
    if(s.enemies.some(e=>!e.dead&&!e.def.practice&&Math.hypot(e.x-s.player.x,e.y-s.player.y)<75))return null;
    const bell=bells.find(b=>!has(b.id)&&Math.hypot(s.player.x-(b.x*16+8),s.player.y-(b.y*16+8))<28);
    return bell?{kind:"mistwood-bell",label:`Ring the ${bell.name}`,x:bell.x*16+8,y:bell.y*16+8,bell}:null;
  }
  const oldCandidate=G.openingInteractionCandidate,oldInteract=G.tryOpeningInteraction;
  G.openingInteractionCandidate=()=>candidate()||oldCandidate();
  G.tryOpeningInteraction=()=>{
    const choice=candidate();if(!choice)return oldInteract();
    G.state.items.push(choice.bell.id);G.sfx.play("pickup");
    G.spawnFx({kind:"ring",x:choice.x,y:choice.y-14,color:"#ffcd75",radius:24,dur:.6});
    if(G.mistwoodSurvey().bells===3&&!has(reward)){
      G.state.items.push(reward);restore();G.ensureTown().spirit+=6;G.healPlayer(G.playerMaxHearts(),"mistwood");G.state.player.mana=G.playerMaxMana();
      G.ui.dialogue("THE MIDDLE ROAD","Three notes drift between the trees. Roots loosen across the middle of the wood, leaving a road wide enough for someone coming home.",{accent:"#a7f070"});
      G.ui.banner("THE WOOD REMEMBERS","Central shortcut opened · hearts and mana restored · 6 town spirit");
    }else G.ui.toast(`${choice.bell.name} answers · ${G.mistwoodSurvey().bells}/3 trail bells`,3);
    G.saveGame();G.input.clearTaps();return true;
  };
  const oldDraw=G.openingDrawables;
  G.openingDrawables=c=>{
    const list=oldDraw(c);if(G.state.mapId!==map)return list;
    for(const bell of bells){const x=bell.x*16+8,y=bell.y*16+8,lit=has(bell.id);
      list.push({y:y+3,fn:()=>{c.save();c.fillStyle="#3b3439";c.fillRect(x-9,y-24,3,27);c.fillRect(x+7,y-24,3,27);c.fillRect(x-11,y-26,23,4);
        c.fillStyle="#92704c";c.fillRect(x-8,y-24,1,25);c.fillRect(x+8,y-24,1,25);
        c.fillStyle=lit?"#ffcd75":"#8a8464";c.fillRect(x-3,y-21,7,10);c.fillRect(x-5,y-13,11,3);c.fillRect(x,y-10,2,3);
        c.fillStyle=lit?"#fff3c2":"#b6ad82";c.fillRect(x-2,y-20,2,6);
        c.fillStyle=lit?"#a7f070":"#41634e";c.fillRect(x-12,y-28,7,4);c.fillRect(x+6,y-25,7,4);
        if(!lit){c.fillStyle="#efdda1";c.fillRect(x,y-36,2,4);c.fillRect(x,y-30,2,1);}c.restore();}});
    }
    return list;
  };
})();
