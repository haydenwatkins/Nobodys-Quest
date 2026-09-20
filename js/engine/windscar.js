/* Aurelia's restored wind joins the caravan road to her former high perch. */
"use strict";
(() => {
  const map="windscarCanyon",dangerRadius=80;
  const endpoints=[
    {id:"camp",name:"Caravan Rise",x:11,y:20,sign:"UP · HIGH ROAD"},
    {id:"high",name:"Sovereign's Reach",x:33,y:8,sign:"DOWN · CAMP"},
  ];
  let lastRide=null;
  const point=endpoint=>({x:endpoint.x*16+8,y:endpoint.y*16+8});
  const unlocked=()=>G.hasWorldMark("sky");
  function liveHazard(h,boss=false){
    if(!h||(!boss&&h.hit)||!h.owner||h.owner.dead||h.mapId&&h.mapId!==G.state.mapId)return false;
    const t=h.t||0,warning=boss?(h.warning||0):(h.warn||0),delay=boss?(h.delay||0):0;
    return t<delay+warning+(h.active||0);
  }
  function dangerAt(endpoint){
    const at=point(endpoint);
    if(G.state.enemies.some(enemy=>!enemy.dead&&!enemy.def.practice&&Math.hypot(enemy.x-at.x,enemy.y-at.y)<dangerRadius))return true;
    if((G.state.projectiles||[]).some(shot=>!shot.fromPlayer&&!shot.dispelled&&Math.hypot(shot.x-at.x,shot.y-(at.y-5))<dangerRadius))return true;
    if((G.state.openingHazards||[]).some(h=>liveHazard(h)&&G.openingHazardHits(h,at.x,at.y)))return true;
    // Arena fields can push outside their drawn bounds, even after their damage hit.
    // Wait for them to finish instead of duplicating each boss's damage geometry here.
    return (G.state.bossHazards||[]).some(h=>liveHazard(h,true));
  }
  function activeBoss(){
    return G.state.enemies.some(enemy=>!enemy.dead&&(enemy.bossEngaged||enemy.bossIntroT>0));
  }
  function unavailable(){
    const s=G.state,p=s.player;
    return s.mapId!==map||s.expeditionRun||s.knockout||s.bossCutscene||s.zoneTransition||
      G.ui.dialogueOpen||G.ui.menuOpen||p.dashing||activeBoss();
  }
  function nearbyEndpoint(){
    const p=G.state.player;
    return endpoints.find(endpoint=>{const at=point(endpoint);return Math.hypot(p.x-at.x,p.y-at.y)<=28;})||null;
  }
  function ownCandidate(){
    if(unavailable())return null;
    const from=nearbyEndpoint();
    if(!from||dangerAt(from))return null;
    if(!unlocked())return from.id==="camp"?{kind:"windscar-lift",endpoint:from.id,label:"Listen at the sleeping wind lift",...point(from)}:null;
    const to=endpoints.find(endpoint=>endpoint!==from);
    if(dangerAt(to)||!G.world.isSafeSpawn(point(to).x,point(to).y))return {kind:"windscar-lift",endpoint:from.id,blocked:true,label:`Wait — ${to.name} is unsafe`,...point(from)};
    return {kind:"windscar-lift",endpoint:from.id,label:`Ride the wind lift ${from.id==="camp"?"up":"down"} to ${to.name}`,...point(from)};
  }
  G.windscarLiftSurvey=()=>{
    const candidate=ownCandidate();
    return {
      unlocked:unlocked(),
      endpoints:endpoints.map(endpoint=>({id:endpoint.id,name:endpoint.name,x:endpoint.x,y:endpoint.y})),
      candidate:candidate?{endpoint:candidate.endpoint,label:candidate.label}:null,
      lastRide:lastRide&&Object.assign({},lastRide),
    };
  };
  const oldCandidate=G.openingInteractionCandidate,oldInteract=G.tryOpeningInteraction;
  G.openingInteractionCandidate=()=>ownCandidate()||oldCandidate();
  G.tryOpeningInteraction=()=>{
    const candidate=ownCandidate();
    if(!candidate)return oldInteract();
    const from=endpoints.find(endpoint=>endpoint.id===candidate.endpoint);
    if(!unlocked()){
      G.ui.dialogue("THE SLEEPING LIFT","The pennants tug upward, then fall still. Aurelia holds every climbing wind close. Win the Sky Mark, and she may give these roads back.",{accent:"#73eff7"});
      G.input.clearTaps();
      return true;
    }
    const to=endpoints.find(endpoint=>endpoint!==from),arrival=point(to);
    // Recheck on use so a late hazard or enemy can never turn the prompt into an unsafe landing.
    if(dangerAt(from))return false;
    if(dangerAt(to)||!G.world.isSafeSpawn(arrival.x,arrival.y)){
      G.ui.toast(`${to.name} is unsafe. The wind lift waits for a clear landing.`,2.4);
      G.input.clearTaps();
      return true;
    }
    const p=G.state.player;
    p.x=arrival.x;p.y=arrival.y;p.lastSafe={x:arrival.x,y:arrival.y};
    lastRide={from:from.name,to:to.name,success:true,x:to.x,y:to.y};
    G.sfx.play("dash");
    G.spawnFx({kind:"ring",x:arrival.x,y:arrival.y,color:"#73eff7",radius:24,dur:.5});
    G.ui.toast(from.id==="camp"?"Aurelia's wind lifts you to the high road.":"Aurelia's wind bears you home to the caravan road.",2.4);
    G.input.clearTaps();
    return true;
  };
  G.events.on("mapEnter",()=>{lastRide=null;});
  const oldDraw=G.openingDrawables;
  G.openingDrawables=c=>{
    const list=oldDraw(c);if(G.state.mapId!==map)return list;
    const active=unlocked();
    endpoints.forEach((endpoint,index)=>{const {x,y}=point(endpoint);
      list.push({y:y-1,fn:()=>{
        c.save();
        // A broad stone landing keeps the destination readable beneath Nobody's feet.
        c.fillStyle="#493c3d";c.fillRect(x-16,y-5,32,9);
        c.fillStyle=active?"#8ccfd2":"#88766d";c.fillRect(x-13,y-8,26,5);
        c.fillStyle=active?"#d8ffff":"#b4a39a";c.fillRect(x-10,y-7,20,2);
        // Paired feather pennants point toward the other road.
        for(const side of [-1,1]){
          const px=x+side*11;c.fillStyle="#4c3a35";c.fillRect(px,y-28,2,21);
          c.fillStyle=active?"#73eff7":"#917f78";c.beginPath();
          c.moveTo(px+1,y-27);c.lineTo(px+side*8,y-23);c.lineTo(px+1,y-18);c.closePath();c.fill();
          c.fillStyle=active?"#e4ffff":"#b9aaa2";c.fillRect(px,y-25,1,6);
        }
        if(active){
          c.strokeStyle="#73eff7";c.globalAlpha=.65;c.lineWidth=1;
          for(let i=0;i<3;i++){c.beginPath();c.arc(x,y-9-i*5,7+i*3,index?Math.PI*.15:Math.PI*1.15,index?Math.PI*1.15:Math.PI*2.15);c.stroke();}
          c.globalAlpha=1;
        }
        c.font="6px monospace";c.textAlign="center";c.fillStyle=active?"#d8ffff":"#c0aea4";
        c.fillText(active?endpoint.sign:"WIND STILL",x,y-34);
        c.restore();
      }});
    });
    return list;
  };
})();
