/* Familiar neighbours give restored Worldwake roads a human purpose.
   Optional promises reuse Sunrise and the body's already saved crossing. */
"use strict";
(() => {
  G.FORM_TRAIL_PROMISES = [
    {formId:"griffin",npc:"parcel",person:"Parcel",title:"Letters on the wind",
      ask:"The cliffpost bags are ready, but the short crossing is still stuck. I'm worried the birthday letters won't get home today. Could you help me find a quicker way across?",
      action:"Attack while moving beside a creature. Galecrest's tailwind can shove it and open the short crossing.",
      tip:"Try a moving Wingbeat when a creature comes close. Feather Gale reaches the ones farther away. The upper road is open if you want more room.",
      thanks:"You did it! I can carry the letters straight across now. I've hung the birthday bunting by the picnic. Someone is going to have a very good afternoon.",
      after:"The birthday letter got there before the cake! They sent a drawing back. It has wings, a little coat, and seventeen candles. I counted twice."},
    {formId:"golem",npc:"moss",person:"Moss",title:"Lunch across the brook",
      ask:"I've packed lunch for the garden workers, but those flying sparks make me nervous. The short brook crossing needs a steady pair of hands. Could you make a safe way over?",
      action:"Face an incoming shot and cast Rampart Pulse. Let Cobblekin's cover stop the shot to restore the brook crossing.",
      tip:"You can walk through your cover. Try raising it before you approach a wisp. Rampart Pulse's Light also breaks their wards; Stone Knuckle helps with the creatures on the upper road.",
      thanks:"The crossing is steady! Thank you. I took the soup over while it was still warm. The workers brought back a planter for our picnic spot. They've put mint in it for me.",
      after:"I brought lunch over again today. Nobody spilled a drop. The workers want to grow peas next. I said I'd rather keep the mint."},
    {formId:"weaver",npc:"provisional",person:"Provisional",title:"A place at the sewing circle",
      ask:"We've got cake and a place for everyone, but the return lane is tangled. I'm worried our neighbours will get stuck on the long road after dark. Could your little threads bring things together?",
      action:"Hit two different living creatures in succession. Silkstep's Lifeline joins them and restores the woven return lane.",
      tip:"Try Silk Needle on one creature, then another nearby. Stitchline reaches a group without scattering it. There's another gathering along the upper road.",
      thanks:"A woven path all the way home! Thank you. We've set a lamp beside the picnic so nobody misses the turning. I saved you a corner of the cake. It was a very large corner.",
      after:"The sewing circle stayed until the stars came out. Everyone found the new lane home. Someone knitted me a hat with room for my ears. Both of them!"},
    {formId:"bellkeeper",npc:"quayPip",person:"Pip",title:"Biscuits for the belfry",
      ask:"We promised the belfry children biscuits! But the little crossing is shut, and Thimble doesn't like the long icy walk. Could you ring us a way through?",
      action:"Use Handbell, then Echo Orb beside a creature. Changing styles makes Chimelet's Resonance push it and opens the crossing.",
      tip:"Handbell makes room when they're close. Follow it with a bouncing Echo Orb. Two different sounds! Thimble says he'll do the cheering.",
      thanks:"BONG! That's my thank-you noise. We got the biscuits over without breaking any. Well, one. Thimble helped with that one. We've put a bench by the picnic for the children.",
      after:"The children made Thimble a bell out of a biscuit tin. Now he rings whenever he wants a snack. It's been quite a noisy morning."},
    {formId:"lanternWisp",npc:"probably",person:"Oracle Probably",title:"A warm road through the storm",
      ask:"The storm-watchers are waiting for supper. I keep imagining someone losing their way among those sparks. Could you bring a little safe light to the short crossing?",
      action:"Cast Ghostlight before an incoming shot reaches you. Wickling's lantern circle stops the shot and restores the sheltered lane.",
      tip:"Stay inside the light while the sparks pass. Ghostlight also breaks the wisps' Light wards. Wick Lash helps when a creature gets close. I'll watch the supper pot.",
      thanks:"The lane is lit! Thank you. Everyone got home with warm hands and warm bowls. I've put a lantern beside the picnic. It's nicer to see a friend than to predict one.",
      after:"Three storm-watchers came back for seconds. They followed the lantern all the way. My prediction for tomorrow is that we'll need a bigger pot."},
    {formId:"colossus",npc:"quayMara",person:"Mara",title:"Room to come home",
      ask:"The roadmenders are finally coming home. I've set out lunch, but the heavy creatures are crowding the short meadow crossing. Could you make some room for tired feet?",
      action:"Use Pillar Fist to move a heavy Cairn Walker or Pebblebeast. Cragback's Worldweight opens the meadow return lane.",
      tip:"Keep your feet planted for the punch. Your Blunt arts can break those stone wards. Earth Shoulder helps when a group gathers in the way. The long road is open too.",
      thanks:"There's room for everyone now. Thank you. I've put a bench beside the picnic, facing the road. After all that walking, it's lovely to sit and watch our friends arrive.",
      after:"Every roadmender made it home. One fell asleep on the bench with a sandwich in his hand. I put a blanket over him. The sandwich seemed quite comfortable too."},
  ];
  for(const promise of G.FORM_TRAIL_PROMISES){
    const trail=G.FORM_TRAILS.find(t=>t.formId===promise.formId),ready=()=>G.state.formOutings?.features.includes(promise.formId);
    G.NPC_PLACEMENTS[trail.id]=[[promise.npc,5,21,{stationary:true}]];
    G.registerSunriseRequest({id:`trail-${promise.formId}`,npc:promise.npc,name:promise.person,mapId:trail.id,x:5,y:21,formId:promise.formId,
      title:promise.title,task:`Help ${promise.person} restore the short crossing, then return with the good news.`,reward:0,
      rewardText:"A permanent crossing and a welcoming picnic",consequence:"The short road stays open for every shape.",
      ask:promise.ask,tips:[promise.action,promise.tip],thanks:promise.thanks,after:promise.after,ready,
      step:()=>({mapId:trail.id,short:G.FORM_ROLES[promise.formId].role,objective:promise.action+" The long road is open too.",tileX:13,tileY:18,value:ready()?1:0})});
  }
  G.formTrailFirstUseGoal=outing=>{
    const promise=G.FORM_TRAIL_PROMISES.find(p=>p.formId===outing.formId),trail=promise&&G.FORM_TRAILS.find(t=>t.formId===outing.formId);
    if(!trail||!G.hasWorldMark(trail.mark)||G.state.formOutings.features.includes(outing.formId))return null;
    return {guide:"outing",formId:outing.formId,mapId:trail.id,destination:trail.name,
      title:`An outing with ${G.forms[outing.formId].name}`,short:G.FORM_ROLES[outing.formId].role,
      objective:G.state.formId===outing.formId?promise.action:`Become ${G.forms[outing.formId].name} and help ${promise.person} find a short way home.`,
      reason:promise.ask,tileX:13,tileY:18,progress:{value:0,total:1,label:"A SHORT WAY HOME"}};
  };
  const previous=G.openingDrawables;
  G.openingDrawables=c=>{
    const list=previous(c),trail=G.FORM_TRAILS.find(t=>t.id===G.state.mapId);
    if(!trail||!G.ensureTown().requests.includes(`trail-${trail.formId}`))return list;
    const prop={griffin:G.deliveryScenery.bunting,golem:G.gardensScenery.planter,weaver:G.rootdeepScenery.silkLamp,
      bellkeeper:G.deliveryScenery.bench,lanternWisp:G.stormspineScenery.lantern,colossus:G.deliveryScenery.bench}[trail.formId];
    list.push({y:21*16+15,fn:()=>{
      const x=40*16+8,y=21*16+16,metrics=G.spriteMetrics(prop);
      c.save();if([G.state.player,...G.state.npcs,...G.state.enemies.filter(e=>!e.dead)].some(a=>Math.abs(a.x-x)<metrics.w/2+8&&a.y>y-metrics.h-2&&a.y<y+4))c.globalAlpha*=.35;
      G.drawSprite(c,prop,0,x,y,false);c.restore();
    }});
    return list;
  };
})();
