/* The watchfires: optional fights, a place to recover, and a road to dawn. */
"use strict";
(() => {
  const fires=[
    {id:"ridge-coal-watch",name:"Coal watchfire",x:10,y:4,guards:[["brute",8,3],["bones",12,5]]},
    {id:"ridge-ash-watch",name:"Ash watchfire",x:14,y:14,guards:[["shade",12,13],["bones",16,15]]}
  ];
  let active=null;
  const has=id=>G.state.items.includes(id);
  G.ridgeSurvey=()=>({lit:fires.filter(f=>has(f.id)).length,knight:has("trophy-eclipse-sigil"),
    active:active?{name:active.fire.name,remaining:active.guards.filter(e=>!e.dead).length}:null});
  function candidate(){
    const s=G.state;
    if(s.mapId!=="emberRidge"||active||s.expeditionRun||s.knockout||s.bossCutscene||G.ui.dialogueOpen)return null;
    if(s.enemies.some(e=>!e.dead&&!e.def.practice&&Math.hypot(e.x-s.player.x,e.y-s.player.y)<75))return null;
    const f=fires.find(f=>!has(f.id)&&Math.hypot(f.x*16+8-s.player.x,f.y*16+8-s.player.y)<30);
    return f?{...f,kind:"ridge",label:`Awaken ${f.name} guards`,x:f.x*16+8,y:f.y*16+8}:null;
  }
  const oldCandidate=G.openingInteractionCandidate,oldInteract=G.tryOpeningInteraction;
  G.openingInteractionCandidate=()=>candidate()||oldCandidate();
  G.tryOpeningInteraction=()=>{
    const r=candidate();if(!r)return oldInteract();
    const fire=fires.find(f=>f.id===r.id);
    const guards=fire.guards.map(([id,x,y])=>G.makeEnemy(id,x*16+8,y*16+8));
    for(const e of guards){G.state.enemies.push(e);}
    active={fire,guards};
    G.ui.banner("THE OLD WATCH STIRS","Defeat both guards to relight the fire · recovery + 3 town spirit");
    G.input.clearTaps();return true;
  };
  const oldUpdate=G.updateOpening;
  G.updateOpening=dt=>{
    oldUpdate(dt);
    if(!active||G.state.mapId!=="emberRidge"||G.state.knockout)return;
    if(active.guards.some(e=>!e.dead))return;
    const fire=active.fire;active=null;
    if(has(fire.id))return;
    G.state.items.push(fire.id);G.ensureTown().spirit+=3;
    G.healPlayer(G.playerMaxHearts(),"watchfire");G.state.player.mana=G.playerMaxMana();
    G.ui.banner("A LIGHT FOR THE ROAD",`${G.ridgeSurvey().lit}/2 watchfires lit · hearts and mana restored · 3 town spirit`);
    G.saveGame();
  };
  G.events.on("mapEnter",()=>{active=null;});
  const oldDraw=G.openingDrawables;
  G.openingDrawables=c=>{
    const list=oldDraw(c);if(G.state.mapId!=="emberRidge")return list;
    for(const f of fires){const x=f.x*16+8,y=f.y*16+8,lit=has(f.id),fighting=active?.fire.id===f.id;
      list.push({y:y+7,fn:()=>{
        c.save();c.fillStyle="#292733";c.fillRect(x-14,y-5,28,12);
        c.fillStyle="#8a6858";c.fillRect(x-13,y+3,26,5);c.fillRect(x-16,y-4,5,8);c.fillRect(x+11,y-4,5,8);
        c.fillStyle="#43353d";c.fillRect(x-9,y-2,18,5);
        if(lit||fighting){const sway=Math.floor(Math.sin(G.state.time*7+f.x)*2);
          c.fillStyle=lit?"#ef7d57":"#8153c1";c.fillRect(x-7,y-13,14,15);c.fillRect(x-4+sway,y-20,7,10);
          c.fillStyle=lit?"#ffcd75":"#d9a7ff";c.fillRect(x-3,y-9,6,11);c.fillRect(x+sway,y-15,3,9);
          c.fillRect(x-9+sway,y-25,2,2);
        }else{c.fillStyle="#d5bd8d";c.fillRect(x-1,y-23,2,6);c.fillRect(x-1,y-15,2,2);}
        c.restore();
      }});
    }
    // Broken standards frame the dueling court without blocking movement.
    for(const [tx,ty]of [[21,5],[27,5],[21,13],[27,13]])list.push({y:ty*16+8,fn:()=>{
      const x=tx*16+8,y=ty*16+8;c.save();c.fillStyle="#ad8e69";c.fillRect(x-1,y-25,2,29);
      c.fillStyle="#493e5a";c.fillRect(x+1,y-24,11,14);c.fillStyle="#ffcd75";c.fillRect(x+4,y-20,4,4);
      c.fillStyle="#292733";c.fillRect(x-5,y+2,10,3);c.restore();
    }});
    return list;
  };
})();
