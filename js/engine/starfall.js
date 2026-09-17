/* An abandoned observatory still knows how to guide someone home. */
"use strict";
(() => {
  const lenses=[
    {id:"starfall-dawn",name:"Dawn lens",x:5,y:5,color:"#ffcd75",story:"The first astronomer watched for departing ships. A note reads: Wave even when they cannot see you."},
    {id:"starfall-dusk",name:"Dusk lens",x:24,y:5,color:"#ef7d57",story:"The second kept the windows lit for late arrivals. There is still a spare cup beside the telescope."},
    {id:"starfall-midnight",name:"Midnight lens",x:24,y:14,color:"#b58ee6",story:"The third charted roads for people who had lost theirs. The final entry reads: Nobody is too far away."}
  ];
  const instrument={id:"starfall-thread",name:"Star instrument",x:15,y:15,color:"#73eff7"};
  const has=id=>G.state.items.includes(id);
  G.starfallSurvey=()=>({aligned:lenses.filter(l=>has(l.id)).length,thread:has(instrument.id),
    remaining:lenses.filter(l=>!has(l.id)).map(l=>l.name)});
  function candidate(){
    const s=G.state;
    if(s.mapId!=="starfallRuins"||s.expeditionRun||s.knockout||s.bossCutscene||G.ui.dialogueOpen)return null;
    if(s.enemies.some(e=>!e.dead&&!e.def.practice&&Math.hypot(e.x-s.player.x,e.y-s.player.y)<75))return null;
    const l=[...lenses,instrument].find(l=>!has(l.id)&&Math.hypot(l.x*16+8-s.player.x,l.y*16+8-s.player.y)<30);
    return l?{...l,kind:"starfall",label:l.name,x:l.x*16+8,y:l.y*16+8}:null;
  }
  const oldCandidate=G.openingInteractionCandidate,oldInteract=G.tryOpeningInteraction;
  G.openingInteractionCandidate=()=>candidate()||oldCandidate();
  G.tryOpeningInteraction=()=>{
    const r=candidate();if(!r)return oldInteract();
    const isInstrument=r.id===instrument.id;
    if(isInstrument&&G.starfallSurvey().aligned<3){
      G.ui.dialogue("THE STAR INSTRUMENT",`The spindle waits for ${G.starfallSurvey().remaining.join(", ")}. Restore the lenses in the side galleries; their light will lead back here.`,{accent:instrument.color});
    }else{
      G.state.items.push(r.id);
      if(isInstrument){
        G.healPlayer(G.playerMaxHearts(),"starfall");G.state.player.mana=G.playerMaxMana();
        G.ensureTown().spirit+=8;G.events.emit("pickup",{item:r.id});G.checkUnlocks();
        G.ui.dialogue("NOBODY","A thread of starlight winds around my hand. Not a prophecy. Just a road somebody left for whoever needed it.",{accent:instrument.color});
        G.ui.banner("A ROAD THROUGH THE DARK","Fallen Star Thread · 8 town spirit · hearts and mana restored");
      }else{
        G.ui.dialogue(r.name.toUpperCase(),r.story,{accent:r.color});
        G.ui.toast(`${G.starfallSurvey().aligned}/3 lenses restored.`,3);
      }
      G.saveGame();
    }
    G.input.clearTaps();return true;
  };
  const oldDraw=G.openingDrawables;
  G.openingDrawables=c=>{
    const list=oldDraw(c);if(G.state.mapId!=="starfallRuins")return list;
    for(const l of [...lenses,instrument])list.push({y:l.y*16+14,fn:()=>{
      const x=l.x*16+8,y=l.y*16+8,done=has(l.id),center=l===instrument;
      c.save();c.fillStyle="#292746";c.fillRect(x-13,y-4,26,12);c.fillStyle="#8389b3";c.fillRect(x-10,y+4,20,3);
      if(center){
        c.fillStyle="#ad8e69";c.fillRect(x-17,y-21,3,27);c.fillRect(x+14,y-21,3,27);c.fillRect(x-17,y-21,34,3);
        c.fillStyle="#d5bd8d";c.fillRect(x-2,y-18,4,22);c.fillRect(x-7,y-2,14,2);
      }
      c.strokeStyle=done?l.color:"#686582";c.lineWidth=2;c.beginPath();c.arc(x,y-8,center?12:8,0,Math.PI*2);c.stroke();
      c.fillStyle=done?l.color:"#3c416b";c.fillRect(x-4,y-12,8,8);
      if(center){for(let i=0;i<3;i++){c.fillStyle=has(lenses[i].id)?lenses[i].color:"#454b78";c.fillRect(x-10+i*8,y-24,5,4);}}
      else if(done){c.fillStyle=l.color;const dx=Math.sign(instrument.x-l.x);c.fillRect(x+dx*13-2,y-8,4,2);c.fillRect(x+dx*19-1,y-7,2,2);}
      if(!done){c.fillStyle="#fff3c2";c.fillRect(x-1,y-33,2,5);c.fillRect(x-1,y-26,2,2);}
      c.restore();
    }});
    return list;
  };
})();
