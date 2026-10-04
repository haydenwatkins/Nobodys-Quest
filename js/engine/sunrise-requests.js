/* Small promises make a place a home. Existing accomplishments count. */
"use strict";
(() => {
  const requests = [
    {id:"beacon", npc:"pebble", name:"Pebble", title:"A light for the late boat", x:22, y:20, reward:8,
      task:"Defeat the Mire Queen in Sunken Marsh, collect her pearl from the ground, then bring it to Pebble at the centre of Sunrise Quay. Dark magic breaks her ward.",
      ready:()=>G.state.items.includes("trophy-mire-pearl"),
      ask:"The late boat follows our harbour light. Which is unfortunate, because our harbour light is a bucket. The Mire Queen’s pearl could shine through this fog. Parcel’s cart goes back to Orchard Road; Greenfield is west from there, and the marsh lies farther west.",
      thanks:"A pearl! I’ll set it above the quay. You may keep calling it a trophy. I shall call it a lighthouse with a very small budget. The late boat has something to steer by again.",
      after:"Three boats found us last night. One brought turnips. We must accept the consequences of our heroism."},
    {id:"recipes", npc:"quayBaker", name:"Brindle", title:"The cinnamon pages", x:12, y:12, reward:5,
      task:"Enter the Lantern Reach drain as Rat, collect Brindle’s recipe book from the ground, then return to her on Sunrise Quay.",
      ready:()=>G.state.items.includes("brindles-recipes") || (!!G.state.delivery.salvage && !G.groundRewardFor?.("brindles-recipes")),
      ask:"The flood took my cinnamon recipes. There’s a drain under the Lantern Reach bank. Small paws might manage where my bread paddle couldn’t.",
      thanks:"Cinnamon knots! My mother put a thumbprint in every one. Come back hungry. I have years of catching up to bake.",
      after:"That tray is for the road. The slightly enormous one is for you. I have a generous thumb."},
    {id:"dragon", npc:"quayPip", name:"Pip", title:"A dragon needs a story", x:28, y:26, reward:6,
      task:"Finish any Manyfold crossing, then tell Pip what you found. The trail stand is east of the quay.",
      ready:()=>G.ensureExpeditionProgress().victories>0,
      ask:"Thimble the dragon needs an adventure. A REAL one. Go through the strange trail and come back with a story. I’ll make the roaring noises.",
      thanks:"Rooms that move? Powers you borrow? Thimble the dragon says he was there too. I’m painting his wings purple. That makes it official.",
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
  const giftFor=r=>G.groundRewardFor(`sunrise-thanks-${r.id}`);
  const giftName=r=>G.treasureInfo?.[`sunrise-thanks-${r.id}`]?.name||`${r.name}'s thank-you gift`;
  const reminder=r=>giftFor(r)?` Your ${giftName(r)} waits beside me. Walk over it to collect your thanks.`:"";
  G.sunriseRequests=()=>unlocked()?requests.map(r=>({id:r.id,name:r.name,title:r.title,task:r.task,reward:r.reward,done:claimed().includes(r.id),pending:!!giftFor(r),giftName:giftName(r),ready:r.ready(),followed:G.ensureTown().followedRequest===r.id})):[];
  G.followSunriseRequest=id=>{
    if(id!==null && (!unlocked() || !requests.some(r=>r.id===id) || claimed().includes(id)))return false;
    G.ensureTown().followedRequest=id;
    G.formEchoGuide=null;G.legendEchoGuide=null;
    G.ensureWorldwake().practiceMark=null;
    G.saveGame();return true;
  };
  G.followedSunriseRequest=()=>G.sunriseRequests().find(r=>r.followed&&!r.done)||null;
  // A view of the existing promise, not another quest or saved progress counter.
  G.sunriseRequestTask=()=>{
    const selected=G.followedSunriseRequest();
    if(!selected||G.state.expeditionRun)return null;
    const r=requests.find(r=>r.id===selected.id);
    const places={beacon:["sunkenMarsh",22,20],recipes:["lanternReach",18,30],dragon:["sunriseQuay",35,20],welcome:["sunriseQuay",30,13]};
    const steps={beacon:"Find the Mire Queen's pearl",recipes:"Find Brindle's recipes",dragon:"Win a Manyfold crossing",welcome:"Build the Welcome Lodge"};
    const reasons={beacon:"Help the late boat find the harbour.",recipes:"Help Brindle bake her family's cinnamon knots again.",dragon:"Bring Pip and Thimble a real adventure story.",welcome:"Make a warm place for Mara's sister and her friends."};
    const gift=!selected.ready&&G.groundRewardFor?.(r.id==="beacon"?"trophy-mire-pearl":r.id==="recipes"?"brindles-recipes":"");
    const recipe=gift&&r.id==="recipes"?G.recipeGiftApproach():null;
    const [mapId,tileX,tileY]=selected.ready?["sunriseQuay",r.x,r.y]:recipe&&!recipe.inPocket?[recipe.mapId,...recipe.point]:gift?[gift.mapId,Math.floor(gift.x/G.TILE),Math.floor(gift.y/G.TILE)]:places[r.id];
    return {kind:"request",requestId:r.id,name:r.name,ready:selected.ready,title:r.title,
      short:selected.ready?`Return to ${r.name}`:gift?(recipe?"Collect Brindle's recipe book":"Collect the Mire Queen's pearl"):steps[r.id],
      objective:selected.ready?`Return to ${r.name} on Sunrise Quay and share the good news.`:recipe?recipe.text:gift?"The Mire Queen is defeated. Collect her pearl from the ground, then return to Pebble on Sunrise Quay.":r.task,
      reason:reasons[r.id],reward:`${r.reward} town spirit`,mapId,tileX,tileY,
      destination:G.maps[mapId].name,color:G.GUIDANCE_COLORS.home,icon:"☀",complete:false,
      label:`A PROMISE TO ${r.name.toUpperCase()}`,progress:{value:selected.ready?1:0,total:2,label:selected.ready?"GOOD NEWS · RETURN TO THE QUAY":"HELP, THEN RETURN"}};
  };
  G.sunriseRequestTarget=()=>{
    const selected=G.sunriseRequestTask();
    if(!selected)return null;
    const r=requests.find(r=>r.id===selected.requestId);
    let mapId=selected.mapId,x=selected.tileX,y=selected.tileY,text=selected.objective;
    if(!selected.ready){
      if(r.id==="beacon"){
        mapId="sunkenMarsh";
        const gift=G.groundRewardFor&&G.groundRewardFor("trophy-mire-pearl");
        if(gift){
          mapId=gift.mapId;
          if(G.state.mapId===mapId)return {kind:"home",color:G.GUIDANCE_COLORS.home,icon:"☀",destination:r.title,
            x:gift.x,y:gift.y,tileX:Math.floor(gift.x/G.TILE),tileY:Math.floor(gift.y/G.TILE),reward:gift,
            text:"The Mire Queen is defeated. Collect her pearl from the ground, then return to Pebble on Sunrise Quay."};
        }
        const queen=G.state.enemies.find(e=>e.id==="mireQueen"&&!e.dead);
        if(G.state.mapId===mapId && queen){x=Math.floor(queen.x/G.TILE);y=Math.floor(queen.y/G.TILE);text="The Mire Queen holds the pearl. Break her ward with dark magic, step clear of bubbles, then use her recovery to attack.";}
        else if(G.state.mapId===mapId)return {kind:"home",color:G.GUIDANCE_COLORS.home,icon:"☀",spatial:false,destination:r.title,text:"Search the marsh for the Mire Queen’s pearl, then return to Pebble on Sunrise Quay."};
      }
      if(r.id==="recipes"){
        const approach=G.recipeGiftApproach();
        if(approach?.inPocket){const gift=approach.gift;return {kind:"home",color:G.GUIDANCE_COLORS.home,icon:"☀",destination:r.title,
          x:gift.x,y:gift.y,tileX:Math.floor(gift.x/G.TILE),tileY:Math.floor(gift.y/G.TILE),reward:gift,text:approach.text};}
        mapId="lanternReach";[x,y]=approach?approach.point:[18,30];text=approach?approach.text:"Follow the bank to the drain, then become Rat to recover Brindle’s recipe book.";
      }
      if(r.id==="dragon"){x=35;y=20;text="Choose a Manyfold crossing at the trail stand. Finish it and bring Pip a story.";}
      if(r.id==="welcome")return {kind:"home",color:G.GUIDANCE_COLORS.home,icon:"☀",spatial:false,destination:r.title,text:"Open Home → Sunrise and build the Welcome Lodge in Civic Works (12 spirit). Then visit Mara on the quay."};
    }
    if(G.state.mapId!==mapId){
      const route=G.guidanceRouteTarget({mapId});
      return route?{...route,kind:"home",color:G.GUIDANCE_COLORS.home,icon:"☀",text:`${route.text} ${r.name} is counting on you.`}:null;
    }
    return {kind:"home",color:G.GUIDANCE_COLORS.home,icon:"☀",destination:r.title,tileX:Math.floor(x),tileY:Math.floor(y),x:x*G.TILE+8,y:y*G.TILE+8,text};
  };
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
      claimed().push(r.id);if(G.ensureTown().followedRequest===r.id)G.ensureTown().followedRequest=null;
      G.revealRegionalReward(`sunrise-thanks-${r.id}`,r.x*G.TILE+8,r.y*G.TILE+8);
      G.ui.banner(r.title.toUpperCase(),`${r.name}’s thanks · collect the ${giftName(r)} for ${r.reward} town spirit`);
    }
    const offer=!done&&!ready&&G.ensureTown().followedRequest!==r.id?{
      prompt:`Follow “${r.title}” for ${r.name}? You can set it aside in Journey.`,
      onAccept:()=>{
        if(!G.followSunriseRequest(r.id))return;
        G.ui.banner(`A PROMISE TO ${r.name.toUpperCase()}`,G.sunriseRequestTask().short);
        G.requestGuidance?.(true);
      }
    }:null;
    G.ui.dialogue(r.name.toUpperCase(),(done?r.after:ready?r.thanks:r.ask)+reminder(r),{accent:"#e7bd78",offer});
    G.input.clearTaps();return true;
  };
  G.npcDialogue=(id,chapter,index)=>{
    const r=unlocked()&&G.state.mapId==="sunriseQuay"&&requests.find(r=>r.npc===id);
    return r?(claimed().includes(r.id)?r.after+reminder(r):r.ask):oldTalk(id,chapter,index);
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
        }else if(r.id==="beacon"){
          c.fillStyle="#523e35";c.fillRect(x+19,y-20,4,29);c.fillRect(x+14,y+8,14,3);
          c.fillStyle="#a98350";c.fillRect(x+14,y-28,14,10);c.fillRect(x+12,y-30,18,3);
          c.fillStyle="#fbebad";c.fillRect(x+17,y-26,8,6);
          c.globalAlpha=.13;c.fillStyle="#fff3bf";c.fillRect(x+10,y-33,22,20);c.globalAlpha=1;
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
