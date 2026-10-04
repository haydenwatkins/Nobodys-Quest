/* Neighbour promises reuse one selected task. Existing accomplishments count. */
"use strict";
(() => {
  const requests = [
    {id:"beacon", npc:"pebble", name:"Pebble", title:"A light for the late boat", x:22, y:20, reward:8,
      task:"Defeat the Mire Queen in Sunken Marsh, collect her pearl from the ground, then bring it to Pebble at the centre of Sunrise Quay. Dark magic breaks her ward.",
      ready:()=>G.state.items.includes("trophy-mire-pearl"),
      ask:"I’m worried about the late boat. Our harbour lamp can’t shine through this fog. The Mire Queen took its pearl when she flooded the marsh. Could you bring it back? Wizard’s dark magic will crack her ward. Try it on the little marsh creatures first. Parcel can take you back to Orchard Road; Greenfield and the marsh are west from there.",
      thanks:"A pearl! I’ll set it above the quay. You may keep calling it a trophy. I shall call it a lighthouse with a very small budget. The late boat has something to steer by again. Pip’s been asking about the strange trail east of the quay. He’d love to hear about your next adventure.",
      after:"Three boats found us last night. One brought turnips. We must accept the consequences of our heroism."},
    {id:"recipes", npc:"quayBaker", name:"Brindle", title:"The cinnamon pages", x:12, y:12, reward:5,
      task:"Enter the Lantern Reach drain as Rat, collect Brindle’s recipe book from the ground, then return to her on Sunrise Quay.",
      ready:()=>G.state.items.includes("brindles-recipes") || (!!G.state.delivery.salvage && !G.groundRewardFor?.("brindles-recipes")),
      ask:"The flood took my cinnamon recipes. There’s a drain under the Lantern Reach bank. Small paws might manage where my bread paddle couldn’t.",
      thanks:"My cinnamon recipes! I thought I’d lost Mum’s handwriting forever. Thank you! I’m baking a batch for you. Pebble’s worried about the boats—could you check on him next?",
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
      after:"I moved her chair three times this morning. Waiting is easier when you can pretend it’s decorating."},
    {id:"ridge-watch", npc:"pending", name:"Ser Pending", mapId:"emberRidge", title:"Bring back the night watch", x:2, y:7, reward:0,
      rewardText:"A safe guardian court", consequence:"Ser Pending can watch the road without the Eclipse Knight chasing travellers.",
      task:"Talk to the Eclipse Knight in Ember Ridge's eastern court. Break his ward with Dark attacks, defeat him, collect his Sigil, then return to Ser Pending at the western entrance.",
      ready:()=>G.state.items.includes("trophy-eclipse-sigil"),
      ask:"I'm worried about the night watch. The Eclipse Knight won't let anyone past his court. He thinks the last light will go out if he leaves. Could you help me talk him into letting people through?",
      tips:["He won't listen while that Dark ward is up. Wizard's Curse and Shadow Bolt can break it. The Ash watchfire is a good place to try your magic first, if you'd like.",
        "When he marks a crescent, step behind it. Wait until his swing is over to attack. Bring his Sigil back so I know you've made it safely."],
      thanks:"You're back! I was watching the court and worrying. The Knight has lowered his sword. Thank you. Errata is at Starfall's observatory, south of Greenfield. She needs help getting its lights working again.",
      after:"Two travellers passed the court this morning! I waved so much my glove fell off. If you're going farther, check on Errata at Starfall's observatory."},
    {id:"starfall-lights", npc:"errata", name:"Errata", mapId:"starfallRuins", title:"Lights for the lost road", x:14, y:1, reward:0,
      rewardText:"Restored lenses and the Fallen Star Thread", consequence:"The observatory's lenses shine again, and Errata can read the eastern road.",
      task:"Align Starfall's three lenses in the side galleries, use the instrument on the southern platform, collect its Fallen Star Thread, then return to Errata at the northern entrance.",
      ready:()=>G.state.items.includes("starfall-thread"),
      ask:"The observatory used to guide people home after dark. Its three lenses have slipped out of place. I'm worried about travellers missing the road. Would you help me get the lights working again?",
      tips:["Visit the northwest, northeast and southeast galleries. Use each lens when the nearby creatures are cleared. Their light points toward the instrument on the southern platform.",
        "Once all three are shining, use the instrument and collect the thread it leaves. Come back and tell me how it went. I'll keep your place in the map!"],
      thanks:"Look at that starlight! The lenses are shining all the way down the galleries. Thank you for finding the thread. Now I can read the old eastern road toward Sunstep. Practice a shape you enjoy, then we'll see who's waiting beyond it.",
      after:"I can see the road clearly again. Parcel has already asked for a copy of the map. He's very excited about having a route instead of a guess."}
  ];
  const unlocked=()=>!!(G.state && G.state.delivery?.complete);
  const claimed=()=>{const town=G.ensureTown();if(!Array.isArray(town.requests))town.requests=[];return town.requests;};
  const home=r=>r.mapId||"sunriseQuay";
  const position=r=>{
    const actor=r.mapId&&G.state.mapId===home(r)&&G.state.npcs?.find(n=>n.id===r.npc);
    return actor?{x:actor.x,y:actor.y}:{x:r.x*G.TILE+8,y:r.y*G.TILE+8};
  };
  const giftFor=r=>r.reward>0?G.groundRewardFor(`sunrise-thanks-${r.id}`):null;
  const giftName=r=>G.treasureInfo?.[`sunrise-thanks-${r.id}`]?.name||`${r.name}'s thank-you gift`;
  const reminder=r=>giftFor(r)?` Your ${giftName(r)} waits beside me. Walk over it to collect your thanks.`:"";
  function introduced(r) {
    if(r.mapId){
      if(claimed().includes(r.id)||G.ensureTown().followedRequest===r.id||r.ready())return true;
      const visited=G.state.mapId===home(r)||G.ensureWayfinder().discovered.includes(home(r));
      return visited&&G.systemIntroduced('sideAdventures')&&(r.id==='ridge-watch'||claimed().includes('ridge-watch')||G.state.items.includes('trophy-eclipse-sigil'));
    }
    if(!G.state.opening?.started || G.state.opening.version<2 || claimed().includes(r.id) || G.ensureTown().followedRequest===r.id || r.ready())return true;
    if(r.id==='recipes')return true;
    if(r.id==='beacon')return claimed().includes('recipes');
    return claimed().includes('beacon') && G.systemIntroduced('sideAdventures');
  }
  G.sunriseRequests=()=>unlocked()?requests.filter(introduced).map(r=>({id:r.id,name:r.name,title:r.title,task:r.task,reward:r.reward,rewardText:r.rewardText,consequence:r.consequence,mapId:home(r),place:G.maps[home(r)].name,done:claimed().includes(r.id),pending:!!giftFor(r),giftName:giftName(r),ready:r.ready(),followed:G.ensureTown().followedRequest===r.id})):[];
  G.followSunriseRequest=id=>{
    if(id!==null && (!unlocked() || !requests.some(r=>r.id===id&&introduced(r)) || claimed().includes(id)))return false;
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
    if(r.mapId){
      const step=r.id==='starfall-lights'?G.starfallPromiseStep():ridgeStep();
      const at=position(r),mapId=selected.ready?home(r):step.mapId;
      return {kind:"request",requestId:r.id,name:r.name,title:r.title,ready:selected.ready,
        short:selected.ready?`Return to ${r.name}`:step.short,
        objective:selected.ready?`Return to ${r.name} in ${G.maps[home(r)].name} and share the good news.`:step.objective,
        reason:r.ask,reward:r.rewardText,mapId,tileX:selected.ready?Math.floor(at.x/G.TILE):step.tileX,tileY:selected.ready?Math.floor(at.y/G.TILE):step.tileY,
        destination:G.maps[mapId].name,color:G.GUIDANCE_COLORS.home,icon:"☀",complete:false,label:`A PROMISE TO ${r.name.toUpperCase()}`,
        progress:{value:selected.ready?2:step.value||0,total:3,label:selected.ready?"GOOD NEWS · TELL YOUR FRIEND":"HELP, THEN RETURN"}};
    }
    const places={beacon:["sunkenMarsh",22,20],recipes:["lanternReach",20,30],dragon:["sunriseQuay",35,20],welcome:["sunriseQuay",30,13]};
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
    if(r.mapId){
      if(G.state.mapId!==mapId){const route=G.guidanceRouteTarget({mapId});return route?{...route,kind:"home",color:G.GUIDANCE_COLORS.home,icon:"☀",text:`${route.text} ${text}`}:null;}
      const gift=!selected.ready&&G.groundRewardFor(r.id==='ridge-watch'?'trophy-eclipse-sigil':'starfall-thread');
      const at=selected.ready?position(r):gift?{x:gift.x,y:gift.y}:{x:x*G.TILE+8,y:y*G.TILE+8};
      return {kind:"home",color:G.GUIDANCE_COLORS.home,icon:"☀",destination:r.title,x:at.x,y:at.y,tileX:Math.floor(at.x/G.TILE),tileY:Math.floor(at.y/G.TILE),text,...(gift?{reward:gift}:{})};
    }
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
        mapId="lanternReach";[x,y]=approach?approach.point:[20,30];text=approach?approach.text:"Follow the bank to the low drain. Become Rat and walk south to recover Brindle’s recipe book.";
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
    if(!unlocked() || s.expeditionRun || G.ui.dialogueOpen || s.knockout || s.bossCutscene)return null;
    if(s.enemies.some(e=>!e.dead&&!e.def.practice&&Math.hypot(e.x-s.player.x,e.y-s.player.y)<88))return null;
    const r=requests.find(r=>home(r)===s.mapId&&introduced(r)&&Math.hypot(s.player.x-position(r).x,s.player.y-position(r).y)<32);
    return r?{id:r.id,kind:"sunriseRequest",label:claimed().includes(r.id)?`Talk to ${r.name}`:r.ready()?`Good news for ${r.name}`:`Hear ${r.name}’s request`,...position(r)}:null;
  }
  const oldCandidate=G.deliveryCandidate, oldInteract=G.tryOpeningInteraction, oldTalk=G.npcDialogue;
  G.deliveryCandidate=()=>oldCandidate()||candidate();
  G.tryOpeningInteraction=()=>{
    const at=G.deliveryCandidate();
    if(at?.kind!=="sunriseRequest")return oldInteract();
    const r=requests.find(r=>r.id===at.id), done=claimed().includes(r.id), ready=r.ready();
    if(!done&&ready){
      claimed().push(r.id);if(G.ensureTown().followedRequest===r.id)G.ensureTown().followedRequest=null;
      if(r.reward>0)G.revealRegionalReward(`sunrise-thanks-${r.id}`,r.x*G.TILE+8,r.y*G.TILE+8);
      G.ui.banner(r.title.toUpperCase(),r.reward>0?`${r.name}’s thanks · collect the ${giftName(r)} for ${r.reward} town spirit`:r.consequence);
      G.saveGame();
    }
    const offer=!done&&!ready&&G.ensureTown().followedRequest!==r.id?{
      prompt:`Follow “${r.title}” for ${r.name}? You can set it aside in Journey.`,
      onAccept:()=>{
        if(!G.followSunriseRequest(r.id))return;
        G.ui.banner(`A PROMISE TO ${r.name.toUpperCase()}`,G.sunriseRequestTask().short);
        G.requestGuidance?.(true);
      }
    }:null;
    const pages=done?[r.after]:ready?[r.thanks]:[r.ask,...(r.tips||[])];
    pages.forEach((text,i)=>G.ui.dialogue(r.name.toUpperCase(),text+reminder(r),{accent:"#e7bd78",...(i===pages.length-1?{offer}:{})}));
    G.input.clearTaps();return true;
  };
  G.npcDialogue=(id,chapter,index)=>{
    const r=unlocked()&&requests.find(r=>home(r)===G.state.mapId&&introduced(r)&&r.npc===id);
    if(r)return claimed().includes(r.id)?r.after+reminder(r):r.ready()?r.thanks:r.ask;
    const ridge=G.state.mapId==='emberRidge',starfall=G.state.mapId==='starfallRuins';
    const lines=ridge&&id==='pebble'?[
      G.state.items.includes('trophy-eclipse-sigil')?"The court is quiet again! Let's bring Ser Pending the good news. He was trying very hard not to look worried.":"Ser Pending hasn't taken his eyes off that court. I'm worried too. Let's hear what he needs before we go charging in.",
      G.formUnlocked('ranger')?"That bow gives you some room! Try a distant shot while you're wearing Bramble Scout. I'd like to watch, from behind you.":"The watchfires are optional. If you'd like a little practice and a rest, Ser Pending knows the guards." ]:
      ridge&&id==='provisional'?["I'm glad Ser Pending has someone to help. The Knight's been keeping everyone on edge. Rest at a watchfire if you need to catch your breath.","Watch the crescent on the ground. Step behind it, let the Knight finish his swing, then try your Dark attacks."]:
      starfall&&id==='pebble'?[G.starfallSurvey().instrument?"The galleries are bright again! Errata will be so pleased. Let's make sure you've picked up the thread before we go tell her.":"I used to count the observatory lights on evening walks. I miss them. Let's help Errata get them shining again.","The lens beams point toward the southern instrument. There's mooncake in the southwest gallery if we need a break."]:
      starfall&&id==='probably'?["I dreamed the lights were shining again. This time I think we can help the dream along. Errata is waiting at the northern entrance.","I like the little cup beside the Dusk lens. Someone wanted the late visitors to feel welcome. I'd have left them biscuits too."]:null;
    return lines?lines[(index||0)%lines.length]:oldTalk(id,chapter,index);
  };
  const oldDraw=G.openingDrawables;
  G.openingDrawables=c=>{
    const list=oldDraw(c);
    if(!unlocked())return list;
    for(const r of requests.filter(r=>home(r)===G.state.mapId&&introduced(r))){
      const done=claimed().includes(r.id),{x,y}=position(r);
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
  function ridgeStep(){
    const gift=G.groundRewardFor('trophy-eclipse-sigil');
    const knight=G.state.mapId==='emberRidge'&&G.state.enemies.find(e=>e.id==='eclipseKnight'&&!e.dead);
    return {mapId:'emberRidge',tileX:gift?Math.floor(gift.x/G.TILE):knight?Math.floor(knight.x/G.TILE):24,
      tileY:gift?Math.floor(gift.y/G.TILE):knight?Math.floor(knight.y/G.TILE):9,value:gift?1:0,
      short:gift?'Collect the Eclipse Sigil':"Help Ser Pending at the eastern court",
      objective:gift?'The Eclipse Knight has lowered his sword. Collect his Sigil from the ground, then return to Ser Pending.':"Face the Eclipse Knight in Ember Ridge's eastern court. Dark attacks break his ward. Step behind the marked crescent, then attack during his recovery."};
  }
  G.neighbourPromiseLead=()=>{
    if(!unlocked()||!G.state.opening?.started||G.state.opening.version<2||!G.systemIntroduced('sideAdventures')||G.storyChapter()>=3||G.state.stars>=G.PACING.worldwakeStars||G.masteryLessons(1,null,true).length)return null;
    const r=requests.find(r=>r.mapId&&!claimed().includes(r.id));
    if(!r||G.state.stars<(r.id==='ridge-watch'?7:10))return null;
    const at=position(r);
    return {guide:'person',mapId:home(r),personId:r.npc,point:[Math.floor(at.x/G.TILE),Math.floor(at.y/G.TILE)],destination:G.maps[home(r)].name,
      title:r.title,short:r.ready()?`Bring ${r.name} the good news`:`Talk to ${r.name} in ${G.maps[home(r)].name}`,
      objective:r.ready()?`Visit ${r.name} in ${G.maps[home(r)].name}. Your help is ready to share.`:`Visit ${r.name} in ${G.maps[home(r)].name} and hear what is troubling the travellers. You can choose to help.`,
      reason:r.id==='ridge-watch'?"The harbour is shining again. Ser Pending is worried about the night watch on the next road.":"Ser Pending's road is calmer. Errata needs a hand at the old observatory.",progress:{value:claimed().includes('ridge-watch')?1:0,total:2,label:'FRIENDS ON THE ROAD'}};
  };
})();
