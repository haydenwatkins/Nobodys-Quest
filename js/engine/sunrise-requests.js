/* Small promises make a place a home. Existing accomplishments count. */
"use strict";
(() => {
  const requests = [
    {id:"recipes", npc:"quayBaker", name:"Brindle", title:"The cinnamon pages", x:12, y:12, reward:5,
      task:"Find Brindle’s recipe book in the Lantern Reach drain. Rat can fit beneath the bank.",
      ready:()=>!!G.state.delivery.salvage || G.state.items.includes("brindles-recipes"),
      ask:"The flood took my cinnamon recipes. There’s a drain under the Lantern Reach bank. Small paws might manage where my bread paddle couldn’t.",
      thanks:"Cinnamon knots! My mother put a thumbprint in every one. Come back hungry. I have years of catching up to bake.",
      after:"That tray is for the road. The slightly enormous one is for you. I have a generous thumb."},
    {id:"dragon", npc:"quayPip", name:"Pip", title:"A dragon needs a story", x:28, y:26, reward:6,
      task:"Finish any Manyfold crossing, then tell Pip what you found. The trail stand is east of the quay.",
      ready:()=>G.ensureExpeditionProgress().victories>0,
      ask:"Nobody the dragon needs an adventure. A REAL one. Go through the strange trail and come back with a story. I’ll make the roaring noises.",
      thanks:"Rooms that move? Powers you borrow? Nobody the dragon says he was there too. I’m painting his wings purple. That makes it official.",
      after:"We’re practising the bit where you came home. It’s the best bit. RRRROAR. That means welcome back."},
    {id:"welcome", npc:"quayMara", name:"Mara", title:"Room for one more", x:30, y:13, reward:5,
      task:"Build the Welcome Lodge in Home’s Civic Works, then visit Mara beside the east house.",
      ready:()=>!!G.ensureTown().projects.welcomeLodge,
      ask:"My sister is bringing friends. Of course she is. Could we make a warm place for them to stay? A Welcome Lodge would be a beginning.",
      thanks:"A roof for every friend she’s collected. I’ve put a second chair outside. She always liked to sit where she could see the boats.",
      after:"I moved her chair three times this morning. Waiting is easier when you can pretend it’s decorating."}
  ];
  const unlocked=()=>!!(G.state && G.state.delivery?.complete);
  const claimed=()=>{const town=G.ensureTown();if(!Array.isArray(town.requests))town.requests=[];return town.requests;};
  G.sunriseRequests=()=>unlocked()?requests.map(r=>({id:r.id,name:r.name,title:r.title,task:r.task,reward:r.reward,done:claimed().includes(r.id),ready:r.ready()})):[];
  function candidate(){
    const s=G.state;
    if(!unlocked() || s.mapId!=="sunriseQuay" || s.expeditionRun || G.ui.dialogueOpen || s.knockout || s.bossCutscene)return null;
    if(s.enemies.some(e=>!e.dead&&!e.def.practice&&Math.hypot(e.x-s.player.x,e.y-s.player.y)<88))return null;
    const r=requests.find(r=>Math.hypot(s.player.x-(r.x*16+8),s.player.y-(r.y*16+8))<32);
    return r?{id:r.id,kind:"sunriseRequest",label:claimed().includes(r.id)?`Talk to ${r.name}`:r.ready()?`Good news for ${r.name}`:`Hear ${r.name}’s request`,x:r.x*16+8,y:r.y*16+8}:null;
  }
  const oldCandidate=G.deliveryCandidate, oldInteract=G.tryOpeningInteraction, oldTalk=G.npcDialogue;
  G.deliveryCandidate=()=>oldCandidate()||candidate();
  G.tryOpeningInteraction=()=>{
    const at=G.deliveryCandidate();
    if(at?.kind!=="sunriseRequest")return oldInteract();
    const r=requests.find(r=>r.id===at.id), done=claimed().includes(r.id), ready=r.ready();
    if(!done&&ready){
      claimed().push(r.id);G.ensureTown().spirit+=r.reward;G.saveGame();
      G.ui.banner(r.title.toUpperCase(),`${r.name}’s thanks · ${r.reward} town spirit`);
    }
    G.ui.dialogue(r.name.toUpperCase(),done?r.after:ready?r.thanks:r.ask,{accent:"#e7bd78"});
    G.input.clearTaps();return true;
  };
  G.npcDialogue=(id,chapter,index)=>{
    const r=unlocked()&&G.state.mapId==="sunriseQuay"&&requests.find(r=>r.npc===id);
    return r?(claimed().includes(r.id)?r.after:r.ask):oldTalk(id,chapter,index);
  };
  const oldDraw=G.openingDrawables;
  G.openingDrawables=c=>{
    const list=oldDraw(c);
    if(!unlocked()||G.state.mapId!=="sunriseQuay")return list;
    for(const r of requests){
      const done=claimed().includes(r.id),x=r.x*16+8,y=r.y*16+8;
      list.push({y:y+2,fn:()=>{
        c.save();
        if(!done){
          c.fillStyle="#362522";c.fillRect(x-5,y-32,10,13);
          c.fillStyle=r.ready()?"#ffdb77":"#e6cda0";c.fillRect(x-1,y-30,2,6);c.fillRect(x-1,y-22,2,2);
        }else if(r.id==="recipes"){
          c.fillStyle="#65402c";c.fillRect(x+15,y-1,22,4);c.fillRect(x+17,y+3,3,7);c.fillRect(x+32,y+3,3,7);
          c.fillStyle="#dba454";for(let i=0;i<3;i++){c.fillRect(x+17+i*6,y-5,5,4);c.fillStyle="#f7d490";c.fillRect(x+18+i*6,y-5,2,1);c.fillStyle="#dba454";}
        }else if(r.id==="dragon"){
          c.fillStyle="#9666b7";c.fillRect(x+15,y+3,12,5);c.fillRect(x+24,y-2,5,6);c.fillRect(x+17,y-3,3,7);
          c.fillStyle="#e6bc67";c.fillRect(x+16,y+8,3,3);c.fillRect(x+24,y+8,3,3);c.fillRect(x+27,y-1,1,1);
        }else{
          c.fillStyle="#97623e";c.fillRect(x+18,y-10,12,12);c.fillRect(x+17,y+2,14,4);c.fillRect(x+18,y+6,3,5);c.fillRect(x+27,y+6,3,5);
          c.fillStyle="#d9bd84";c.fillRect(x+20,y-8,8,8);
        }
        c.restore();
      }});
    }
    return list;
  };
})();

