/* A repeatable movement course; only the first delivery earns town spirit. */
"use strict";
(() => {
  const map="sunstepPrairie",reward="sunstep-courier",limit=45;
  const points=[{x:12,y:8,name:"northwest pennant"},{x:31,y:8,name:"northeast pennant"},{x:34,y:20,name:"south meadow pennant"},{x:11,y:20,name:"caravan desk"}];
  const sign={x:11,y:17};
  const desk=points[3];let active=null;
  const xy=p=>({x:p.x*16+8,y:p.y*16+8});
  G.prairieSurvey=()=>({active:active?{step:active.step,time:Math.max(0,limit-active.elapsed),next:points[active.step].name}:null,best:G.ensureTown().prairieBest||null,done:G.state.items.includes(reward)});
  const oldCandidate=G.openingInteractionCandidate,oldInteract=G.tryOpeningInteraction;
  function candidate(){const s=G.state,p=xy(desk);
    if(s.mapId!==map||s.expeditionRun||s.knockout||s.bossCutscene||G.ui.dialogueOpen||Math.hypot(s.player.x-p.x,s.player.y-p.y)>28)return null;
    if(s.enemies.some(e=>!e.dead&&!e.def.practice&&Math.hypot(e.x-s.player.x,e.y-s.player.y)<75))return null;
    return {kind:"prairie-courier",label:active?"Restart courier circuit (45s)":"Run courier circuit (45s)",...p};
  }
  G.openingInteractionCandidate=()=>candidate()||oldCandidate();
  G.tryOpeningInteraction=()=>{if(!candidate())return oldInteract();active={step:0,elapsed:0};G.ui.toast("Courier circuit: northwest, northeast, south meadow, then caravan desk. Follow the numbered pennants!",5);G.input.clearTaps();return true;};
  G.events.on("mapEnter",()=>{active=null;});
  const oldUpdate=G.updateOpening;
  G.updateOpening=dt=>{
    oldUpdate(dt);
    const s=G.state;
    if(s.mapId===map&&!active&&!s.knockout&&!s.expeditionRun&&!s.bossCutscene&&!G.ui.menuOpen&&!G.ui.dialogueOpen&&!G.ensureTown().prairieInvited){
      const at=xy(sign),near=Math.hypot(s.player.x-at.x,s.player.y-at.y)<64;
      const danger=s.enemies.some(e=>!e.dead&&!e.def.practice&&Math.hypot(e.x-s.player.x,e.y-s.player.y)<75);
      if(near&&!danger){
        G.ensureTown().prairieInvited=true;
        G.ui.toast("COURIER WANTED! Follow the sign south to the caravan desk. Try the 45-second circuit for 6 town spirit. Start whenever you're ready.",7);
        G.saveGame();
      }
    }
    if(!active)return;
    if(s.mapId!==map||s.knockout||s.expeditionRun){active=null;return;}
    if(G.ui.menuOpen||G.ui.dialogueOpen||s.bossCutscene)return;
    active.elapsed+=dt;
    if(active.elapsed>limit){active=null;G.ui.toast("The delivery window closed. Try again at the caravan desk.",4);return;}
    const target=xy(points[active.step]);if(Math.hypot(s.player.x-target.x,s.player.y-target.y)>22)return;
    active.step++;G.sfx.play("pickup");G.spawnFx({kind:"ring",...target,color:"#ffcd75",radius:20,dur:.4});
    if(active.step<points.length){G.ui.toast(`Checkpoint ${active.step}/4 · next: ${points[active.step].name}`,2);return;}
    const time=Math.round(active.elapsed*100)/100;active=null;const town=G.ensureTown();
    const record=!town.prairieBest||time<town.prairieBest;if(record)town.prairieBest=time;
    const first=!s.items.includes(reward);if(first){s.items.push(reward);town.spirit+=6;}
    G.ui.toast(`Delivery in ${time.toFixed(2)}s${record?" · personal best!":""}${first?" · 6 town spirit":""}`,5);G.saveGame();
  };
  const oldDraw=G.openingDrawables;
  G.openingDrawables=c=>{
    const list=oldDraw(c);if(G.state.mapId!==map)return list;
    const at=xy(sign);
    list.push({y:at.y+3,fn:()=>{
      const {x,y}=at;c.save();c.fillStyle="#49352d";c.fillRect(x-2,y-25,4,29);
      c.fillStyle="#5d4236";c.fillRect(x-30,y-29,60,20);c.fillStyle="#efdda1";c.fillRect(x-28,y-27,56,16);
      c.fillStyle="#49352d";c.font="7px monospace";c.textAlign="center";c.fillText("COURIER",x,y-20);c.fillText("CAMP SOUTH",x,y-13);
      c.fillStyle="#da9860";c.beginPath();c.moveTo(x-8,y-7);c.lineTo(x+8,y-7);c.lineTo(x,y+2);c.closePath();c.fill();c.restore();
    }});
    points.forEach((point,i)=>{const {x,y}=xy(point),next=active?.step===i;
      list.push({y:y+3,fn:()=>{c.save();c.fillStyle="#49352d";c.fillRect(x-1,y-26,3,28);c.fillStyle="#d7b97b";c.fillRect(x,y-26,1,27);
        c.fillStyle=next?"#fff3c2":active&&i<active.step?"#71b884":"#da9860";c.fillRect(x+2,y-26,13,11);c.fillRect(x+2,y-15,8,3);
        c.fillStyle="#302638";c.font="8px monospace";c.fillText(String(i+1),x+5,y-17);
        if(i===3){c.fillStyle="#76533b";c.fillRect(x-12,y-9,24,7);c.fillStyle="#efdda1";c.fillRect(x-7,y-10,9,3);}
        if(next){c.strokeStyle="#ffcd75";c.lineWidth=1;c.beginPath();c.arc(x,y,20,0,Math.PI*2);c.stroke();}
        c.restore();}});
    });
    if(active){const p=G.state.player;list.push({y:p.y+100,fn:()=>{c.save();c.font="7px monospace";c.textAlign="center";c.fillStyle="#302638";c.fillRect(p.x-24,p.y-39,48,11);c.fillStyle="#fff3c2";c.fillText(`${active.step}/4 ${Math.ceil(limit-active.elapsed)}s`,p.x,p.y-31);c.restore();}});}
    return list;
  };
})();
