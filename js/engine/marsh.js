/* The old ferry marsh: two optional approaches and a court on the far bank. */
"use strict";
(() => {
  const stops=[
    {id:"marsh-north-sluice",x:15,y:3,name:"North sluice"},
    {id:"marsh-south-sluice",x:15,y:15,name:"South sluice"},
    {id:"marsh-ferry-token",x:3,y:3,name:"Wreck salvage hatch"}
  ];
  const has=id=>G.state.items.includes(id);
  const sluices=()=>stops.slice(0,2).filter(r=>has(r.id)).length;
  function weakenVeil(){
    if(G.state.mapId!=="sunkenMarsh")return;
    for(const e of G.state.enemies){
      if(e.id!=="mireQueen"||!e.ward)continue;
      const count=sluices(),delta=Math.max(0,count-(e.marshSluices||0));
      if(e.ward.hp>0)e.ward.hp=Math.max(1,e.ward.hp-delta);
      e.marshSluices=count;
    }
  }
  G.marshSurvey=()=>({sluices:sluices(),salvage:has("marsh-ferry-token"),queen:has("trophy-mire-pearl")});
  function candidate(){
    const s=G.state;
    if(s.mapId!=="sunkenMarsh"||s.expeditionRun||s.knockout||s.bossCutscene||G.ui.dialogueOpen)return null;
    if(s.enemies.some(e=>!e.dead&&!e.def.practice&&Math.hypot(e.x-s.player.x,e.y-s.player.y)<75))return null;
    const r=stops.find(r=>!has(r.id)&&Math.hypot(r.x*16+8-s.player.x,r.y*16+8-s.player.y)<30);
    return r?{...r,kind:"marsh",label:r.name,x:r.x*16+8,y:r.y*16+8}:null;
  }
  const oldCandidate=G.openingInteractionCandidate,oldInteract=G.tryOpeningInteraction;
  G.openingInteractionCandidate=()=>candidate()||oldCandidate();
  G.tryOpeningInteraction=()=>{
    const r=candidate();if(!r)return oldInteract();
    const salvage=r.id==="marsh-ferry-token";
    if(salvage&&G.state.formId!=="rat"){
      G.ui.dialogue("THE WRECK","A brass token glints inside. The hatch is barely wider than a rat. Someone has scratched: ONE LAST CROSSING.",{accent:"#d5be83"});
    }else{
      G.state.items.push(r.id);G.ensureTown().spirit+=salvage?6:2;weakenVeil();
      G.ui.dialogue(salvage?"NOBODY":"THE OLD SLUICE",salvage?"A ferry token, worn smooth by a hundred journeys. Somebody kept it for the way home. I think I will too.":"The wheel gives. Water runs toward the abandoned ferry channels, and a thread of the Queen’s purple veil unravels.",{accent:"#d5be83"});
      G.ui.banner(salvage?"ONE LAST CROSSING":"THE MARSH BREATHES",salvage?"Old Ferry Token · 6 town spirit":`${sluices()}/2 sluices open · Queen’s ward weakened · 2 town spirit`);
      G.saveGame();
    }
    G.input.clearTaps();return true;
  };
  G.events.on("mapEnter",weakenVeil);
  const oldDraw=G.openingDrawables;
  G.openingDrawables=c=>{
    const list=oldDraw(c);if(G.state.mapId!=="sunkenMarsh")return list;
    for(const r of stops){const x=r.x*16+8,y=r.y*16+8,done=has(r.id),wreck=r.id==="marsh-ferry-token";
      list.push({y:y+6,fn:()=>{
        c.save();c.fillStyle="#493d35";
        if(wreck){
          c.fillRect(x-18,y-4,36,9);c.fillRect(x-13,y+5,26,4);c.fillRect(x-8,y-9,16,5);
          c.fillStyle="#a17b4f";for(let i=-12;i<16;i+=7)c.fillRect(x+i,y-3,3,7);
          c.fillStyle=done?"#282f32":"#e4c978";c.fillRect(x-3,y-2,6,4);
        }else{
          c.fillRect(x-13,y-5,26,12);c.fillStyle="#a18c65";c.fillRect(x-15,y-8,4,17);c.fillRect(x+11,y-8,4,17);
          c.fillStyle=done?"#79b2ae":"#73557f";for(let i=-8;i<=8;i+=8)c.fillRect(x+i,y+(done?0:-4),4,done?8:10);
          c.strokeStyle=done?"#a7cf9a":"#e1bb77";c.lineWidth=2;c.beginPath();c.arc(x,y-11,6,0,Math.PI*2);c.stroke();c.fillStyle=c.strokeStyle;c.fillRect(x-1,y-18,2,14);c.fillRect(x-7,y-12,14,2);
        }
        if(!done){c.fillStyle="#efdda1";c.fillRect(x-1,y-28,2,5);c.fillRect(x-1,y-21,2,2);}
        c.restore();
      }});
    }
    return list;
  };
})();
