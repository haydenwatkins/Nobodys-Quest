/* A seed returns to the tree that once sheltered the road. */
"use strict";
(() => {
  const map="whispering-grove",reward="grove-home-tree",tx=5,ty=14;
  const has=id=>G.state.items.includes(id);
  G.groveSurvey=()=>({seed:has("whispering-seed"),planted:has(reward)});
  function restoreRoad(){
    if(G.state.mapId!==map||!has(reward))return;
    for(const y of [8,9])G.state.grid[y][14]={tile:"path"};
  }
  G.events.on("mapEnter",restoreRoad);
  function candidate(){
    const s=G.state;
    if(s.mapId!==map||s.expeditionRun||s.knockout||s.bossCutscene||G.ui.dialogueOpen||has(reward))return null;
    if(Math.hypot(s.player.x-(tx*16+8),s.player.y-(ty*16+8))>=30)return null;
    if(s.enemies.some(e=>!e.dead&&!e.def.practice&&Math.hypot(e.x-s.player.x,e.y-s.player.y)<75))return null;
    return {kind:"grove",label:has("whispering-seed")?"Plant the Whispering Seed":"Old shelter stump",x:tx*16+8,y:ty*16+8};
  }
  const oldCandidate=G.openingInteractionCandidate,oldInteract=G.tryOpeningInteraction;
  G.openingInteractionCandidate=()=>candidate()||oldCandidate();
  G.tryOpeningInteraction=()=>{
    if(!candidate())return oldInteract();
    if(!has("whispering-seed")){
      G.ui.dialogue("THE OLD STUMP","Someone carved a little roof into the bark. This tree was a shelter once. A seed waits in the southeast clearing; perhaps it could be one again.",{accent:"#a7f070"});
    }else{
      G.state.items.push(reward);G.ensureTown().spirit+=6;restoreRoad();
      G.healPlayer(G.playerMaxHearts(),"grove");G.state.player.mana=G.playerMaxMana();
      G.ui.dialogue("NOBODY","I tuck the seed beneath the roots. The ground stirs, and the old path opens. There. Somewhere to come back to.",{accent:"#a7f070"});
      G.ui.banner("ROOM FOR ONE MORE","Shelter tree planted · central shortcut opened · 6 town spirit");G.saveGame();
    }
    G.input.clearTaps();return true;
  };
  const oldDraw=G.openingDrawables;
  G.openingDrawables=c=>{
    const list=oldDraw(c);if(G.state.mapId!==map)return list;
    const planted=has(reward),x=tx*16+8,y=ty*16+8;
    list.push({y:y+7,fn:()=>{
      c.save();c.fillStyle="#493d35";c.fillRect(x-12,y-5,24,12);c.fillStyle="#a17b4f";c.fillRect(x-10,y-7,20,5);
      c.fillStyle="#d5bd8d";c.fillRect(x-5,y-6,10,2);
      if(planted){c.fillStyle="#6b4a2b";c.fillRect(x-2,y-26,4,22);
        c.fillStyle="#257179";c.fillRect(x-15,y-30,30,12);c.fillRect(x-10,y-38,20,10);
        c.fillStyle="#38b764";c.fillRect(x-13,y-32,24,7);c.fillRect(x-8,y-40,16,9);
        c.fillStyle="#a7f070";c.fillRect(x-6,y-38,5,3);c.fillRect(x+7,y-29,4,3);
      }else{c.fillStyle="#efdda1";c.fillRect(x-1,y-24,2,5);c.fillRect(x-1,y-17,2,2);}
      c.restore();
    }});
    if(planted)for(const [fx,fy]of [[3,12],[7,15],[4,16],[8,13],[12,8],[15,9],[17,8]])list.push({y:fy*16+8,fn:()=>{
      const x=fx*16+8,y=fy*16+8;c.save();c.fillStyle="#257179";c.fillRect(x,y-5,2,7);
      c.fillStyle="#ffcd75";c.fillRect(x-2,y-8,6,4);c.fillStyle="#fff3c2";c.fillRect(x,y-7,2,2);c.restore();
    }});
    return list;
  };
})();
