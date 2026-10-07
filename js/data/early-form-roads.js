/* Ben: these are little road-repair adventures, drawn with letters.
   The long way is always open. Working bridges are saved per adventure. */
"use strict";
(() => {
  G.EARLY_FORM_ROADS = [
    {id:"bramblebank",name:"Bramblebank Crossing",formId:"ranger",region:"overworld",exit:[0,50],arrival:[1,50],start:[35,21],door:[37,21],npc:"parcel",person:"Parcel",at:[34,20],
      title:"The bags on the far bank",role:"Reach across the creek with your bow",
      ask:"My delivery bags are on the far bank! The footbridges folded up in the flood. I can take the long path, but the little bridge winches are over the water. Could you try your bow?",
      tips:["The copper targets turn the winches. Stand on the near bank and shoot across the creek. There's another bridge farther north.","The wisps on the far bank need Light damage. Lucky Arrow will help. I'll keep the bags dry while you try!"],
      thanks:"Both bridges are down! Thank you. Now I can carry the bags across without dropping the birthday parcels in the creek. I've left lunch by the northern bridge.",
      after:"I crossed with six bags this morning. Six! Not one wet sock. The bridges are making a very good impression.",
      repairs:[{id:"bramble-south",x:22,y:18,kind:"winch",bridge:[18,18,20,20],approach:[15,18]},
        {id:"bramble-north",x:22,y:9,kind:"winch",bridge:[18,8,20,10],approach:[15,9]}]},
    {id:"reedbedFerry",name:"Reedbed Ferry",formId:"frog",region:"sunkenMarsh",exit:[15,0],arrival:[15,2],start:[5,22],door:[5,24],npc:"moss",person:"Moss",at:[6,22],
      title:"Moss's floating footpath",role:"Pull the ferry pontoons into place",
      ask:"Oh, my poor ferry. The flood pulled its pontoons away from the bank. My neighbours can't bring their baskets across. Would you help me pull it together?",
      tips:["Frog's Tongue Lash can catch the copper towing loops from the bank. Pull the lower pontoon first, then look for the other loop upstream.","Those little creatures keep getting underfoot. Pull them close with Tongue Lash, then try Hop Crash. Please mind the baskets!"],
      thanks:"The ferry's together again! I was so worried we'd lose our visits across the water. Thank you. There's room for everyone's baskets now, and a picnic on the far bank.",
      after:"My neighbour brought soup across today. She used both pontoons just to check them. I think she's as pleased as I am.",
      repairs:[{id:"reed-lower",x:18,y:18,kind:"pontoon",bridge:[17,17,19,19],approach:[15,18]},
        {id:"reed-upper",x:18,y:7,kind:"pontoon",bridge:[17,6,19,8],approach:[15,7]}]},
    {id:"copperwickYard",name:"Copperwick Lampyard",formId:"alchemist",region:"overworld",exit:[0,55],arrival:[1,55],start:[35,20],door:[37,20],npc:"provisional",person:"Provisional",at:[34,21],
      title:"A warm way home",role:"Clear a crowded lamp stand with one flask",
      ask:"The road lamps are buried in prickly growth. I'm worried someone will miss the way home after dark. Could you help clear the two lamp stands? I've packed supper for when we're done.",
      tips:["Copperwick Brewer's Volatile Flask bursts wide enough to catch a whole clump. Aim into the middle, where three creatures are huddled together.","There's another lamp beside the upper path. Bottle Bonk gives you room if the creatures crowd you. We can try the herbs in Miasma Flask once you've found your feet."],
      thanks:"Both lamps are clear! Look how warm that road is. Thank you. I've opened the lampyard paths, and the supper basket is waiting by the upper stand.",
      after:"Parcel followed the lamps home last night. He said he could smell our supper from the bridge. I'll take that as a compliment.",
      repairs:[{id:"copper-lower",x:22,y:18,kind:"lamp",bridge:[18,17,20,19],approach:[25,18]},
        {id:"copper-upper",x:11,y:6,kind:"lamp",bridge:[10,10,12,12],approach:[14,6]}]},
    {id:"rainbellSteps",name:"Rainbell Steps",formId:"stormcaller",region:"starfallRuins",exit:[0,17],arrival:[1,17],start:[5,22],door:[5,24],npc:"probably",person:"Oracle Probably",at:[6,22],
      title:"Lights for the rain",role:"Carry lightning through the copper relays",
      ask:"I keep worrying about the families crossing here in the rain. The little bridges won't lower without power. Those copper relays used to carry a spark from bank to bank. Could you get them working again?",
      tips:["Try Chain Lightning on the first copper relay. The spark can hop through all three, even across the water. You don't need to stand in the stream.","The second row starts on the far bank. There's a dry path at the eastern end. I'll keep the kettle warm while you look around."],
      thanks:"They're shining again! Now the families can cross without going all the way around in the rain. Thank you. I can stop watching the clouds and put the kettle on.",
      after:"Moss came over in the rain this morning. Her basket stayed dry! She brought mint for the kettle. I like that sort of prediction best.",
      repairs:[{id:"rainbell-lower",x:11,y:13,kind:"relay",bridge:[10,10,12,12],approach:[10,19],nodes:[[10,16],[11,13],[12,10]]},
        {id:"rainbell-upper",x:24,y:10,kind:"relay",bridge:[23,10,25,12],approach:[23,4],nodes:[[23,7],[24,10],[25,13]]}]},
    {id:"hearthsideTurn",name:"Hearthside Turn",formId:"dragon",region:"emberRidge",exit:[24,18],arrival:[24,16],start:[35,21],door:[37,21],npc:"quayBaker",person:"Brindle",at:[34,20],
      title:"Room for the bread cart",role:"Sweep the fallen branches off the cart road",
      ask:"My bread cart can't squeeze past those fallen branches. I can carry the baskets around, but the neighbours' rolls will be cold by then. Could that lovely big tail make a little room?",
      tips:["Stand beside the three branches and try Tail Sweep. One broad swing can move the whole pile. There's another pile farther up the road.","Take your time with the creatures. Tail Sweep makes room, and Fire Breath reaches the ones hanging back. I've saved you a warm cinnamon knot."],
      thanks:"Room for the whole cart! Thank you. I can get the bread to everyone while it's warm. I've put your cinnamon knot by the upper clearing. Please eat it before Parcel finds it!",
      after:"Parcel helped me push the cart today. We didn't spill a single roll. He only asked for one as payment. Well, two. I'm pretending not to have counted.",
      repairs:[{id:"hearthside-lower",x:21,y:17,kind:"brush",bridge:[18,16,20,18],approach:[23,17],nodes:[[21,16],[21,17],[21,18]]},
        {id:"hearthside-upper",x:21,y:7,kind:"brush",bridge:[18,6,20,8],approach:[23,7],nodes:[[21,6],[21,7],[21,8]]}]},
  ];
  const rows = () => Array.from({length:25},(_,y)=>Array.from({length:38},(_,x)=>x===0||x===37||y===0||y===24?"t":"."));
  for(const road of G.EARLY_FORM_ROADS){
    const grid=rows(),put=(x,y,c)=>grid[y][x]=c,box=(x0,y0,x1,y1,c)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)put(x,y,c);};
    if(road.formId==='ranger'){
      box(18,1,20,23,'w');box(18,2,20,4,'p');
      for(const y of [9,18]){box(3,y,17,y+1,'p');box(21,y,36,y+1,'p');}
      box(4,3,5,21,'p');box(33,3,34,21,'p');
      // Bow lessons have a clear 7-tile sightline across water. A second
      // eastern clearing gives Light-mark shots a useful change of target.
      for(const [x,y,c]of [[23,18,'1'],[23,9,'1'],[29,5,'2'],[31,5,'2'],[29,13,'2'],[31,13,'2'],[7,6,'1'],[8,6,'1'],[6,16,'1'],[7,16,'1']])put(x,y,c);
    }else if(road.formId==='frog'){
      box(17,1,19,23,'w');box(17,11,19,13,'p');
      box(4,3,5,23,'p');box(31,3,32,21,'p');box(5,3,32,4,'p');box(5,20,32,21,'p');
      for(const [x,y]of [[11,18],[13,18],[12,16],[25,7],[27,7],[26,5],[10,5],[12,5],[24,18],[26,18]])put(x,y,'1');
      for(const [x,y]of [[8,9],[9,9],[29,14],[30,14]])put(x,y,'3');
    }else if(road.formId==='alchemist'){
      // Two perpendicular shelves make a loop through a real lampyard,
      // rather than another copy of the creek's horseshoe.
      box(18,12,20,23,'t');box(3,10,20,12,'t');box(18,4,20,6,'p');box(3,10,5,12,'p');
      box(4,5,33,6,'p');box(32,5,33,22,'p');box(4,20,33,21,'p');box(4,5,5,21,'p');
      for(const [x,y]of [[22,17],[23,17],[22,18],[10,5],[11,5],[10,6],[28,7],[29,7],[7,17],[9,17],[8,19]])put(x,y,'1');
    }else if(road.formId==='stormcaller'){
      // A sideways stream and two diagonal relay rows invite a different
      // approach from each bank. The dry eastern route is always open.
      box(1,10,36,12,'w');box(31,10,33,12,'p');
      box(4,18,30,19,'p');box(4,4,29,5,'p');box(31,4,33,22,'p');box(4,4,5,23,'p');
      for(const [x,y]of [[4,14],[4,16],[7,14],[7,6],[10,6],[13,6],[28,18],[30,18],[28,20],[29,20],[18,3],[18,5],[26,5],[28,5]])put(x,y,'1');
      for(const [x,y]of [[3,7],[3,16]])put(x,y,'3');
    }else if(road.formId==='dragon'){
      box(18,1,20,23,'t');box(18,20,20,22,'p');
      for(const y of [7,17]){box(4,y,17,y+1,'p');box(21,y,34,y+1,'p');}
      box(4,4,5,21,'p');box(32,4,33,21,'p');box(4,3,33,4,'p');
      // Wide unwarded clumps give the actual three-target Tail Sweep
      // lesson twice; the upper west pocket changes to ranged fire.
      for(const [x,y]of [[27,16],[27,17],[27,18],[12,6],[12,7],[12,8],[28,5],[30,5],[28,7],[30,7],[7,17],[9,17]])put(x,y,'1');
    }
    road.repairs.forEach((repair,i)=>{const [x0,y0,x1,y1]=repair.bridge;box(x0,y0,x1,y1,String(i+4));});
    const [dx,dy]=road.door;put(dx,dy,'x');put(road.start[0],road.start[1]-1,'m');put(31,4,'H');put(road.start[0]-2,road.start[1]-2,'C');
    const legend={
      'x':{tile:'path',portal:{map:road.region,x:road.arrival[0],y:road.arrival[1]},portalStyle:'gap',seamless:true},
      '1':{tile:'grass',enemy:'slime',guardPost:true},'2':{tile:'grass',enemy:'wisp',guardPost:true},'3':{tile:'grass',enemy:'bones',guardPost:true},
      'm':{tile:'path',message:`${road.person.toUpperCase()}'S NOTE · ${road.ask}`},
      'H':{tile:'path',chest:{heal:true,name:`${road.person}'s road picnic`}},'C':{tile:'path',rest:true,restText:'A quiet camp restores every heart and all mana.'},
    };
    road.repairs.forEach((repair,i)=>legend[String(i+4)]={tile:['alchemist','dragon'].includes(road.formId)?'tree':'water',roadRepair:repair.id});
    registerMap({id:road.id,name:road.name,earlyFormRoad:road.formId,playerStart:{x:road.start[0],y:road.start[1]},legend,tiles:grid.map(row=>row.join(''))});
    G.NPC_PLACEMENTS[road.id]=[[road.npc,...road.at,{stationary:true}]];
    const parent=G.maps[road.region],[px,py]=road.exit;
    const key=road.formId==='alchemist'?'b':road.formId==='stormcaller'?'q':road.formId==='dragon'?'q':'a';
    parent.legend={...parent.legend,[key]:{tile:'path',portal:{map:road.id,x:road.start[0],y:road.start[1]},portalStyle:'gap',seamless:true}};
    parent.tiles=parent.tiles.map((row,y)=>y===py?row.slice(0,px)+key+row.slice(px+1):row);
    // Clear the physical approach without changing neighbouring entrances.
    if(px===0)for(let y=py-1;y<=py+1;y++)parent.tiles[y]=parent.tiles[y].slice(0,1)+'pp'+parent.tiles[y].slice(3);
    else for(let y=1;y<=2;y++)parent.tiles[y]=parent.tiles[y].slice(0,px)+'p'+parent.tiles[y].slice(px+1);
  }
})();
