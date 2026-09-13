/* A road worth opening has people at the other end. */
"use strict";
(() => {
  function shore(w,h){
    const a=Array.from({length:h},()=>Array(w).fill('w'));
    const put=(x,y,v)=>{if(x>=0&&y>=0&&x<w&&y<h)a[y][x]=v;};
    const land=(cx,cy,rx,ry)=>{for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<1)put(x,y,'.');};
    const path=(points,r=1)=>{for(let i=1;i<points.length;i++){
      const [ax,ay]=points[i-1],[bx,by]=points[i],n=Math.max(Math.abs(bx-ax),Math.abs(by-ay));
      for(let j=0;j<=n;j++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)put(Math.round(ax+(bx-ax)*j/n)+dx,Math.round(ay+(by-ay)*j/n)+dy,'p');
    }};
    return {put,land,path,tiles:()=>a.map(r=>r.join(''))};
  }
  const r=shore(60,38);
  r.land(8,29,8,6);r.land(16,24,8,9);r.land(35,14,9,8);r.land(53,19,6,6);
  r.land(20,34,2,2);r.put(20,33,'.');
  r.path([[0,29],[10,29],[16,26],[16,18],[26,18],[33,14],[39,14],[43,18],[59,18]]);
  r.path([[14,24],[16,24]]);r.path([[35,14],[38,12]]);
  r.put(0,29,'O');r.put(59,18,'K');r.put(9,30,'F');r.put(40,15,'F');
  registerMap({id:'lanternReach',name:'The Lantern Reach',biome:'sunkenMarsh',openingLandscape:true,deliveryLandscape:true,
    playerStart:{x:5,y:29},tiles:r.tiles(),
    legend:{O:{tile:'path',portal:{map:'orchardRoad',x:24,y:37},portalStyle:'gap'},K:{tile:'path',portal:{map:'tollCourt',x:5,y:17},portalStyle:'gap'},F:{tile:'grass',rest:true}},
    openingProps:[['cart',7,30],['lantern',14,24],['lantern',38,12],['camp',9,30],['camp',40,15],['rainGate',24,18],['rainGate',46,18],['milepost',10,27],['milepost',43,17],['willow',9,24],['willow',20,29],['willow',29,12],['willow',40,8],['willow',21,21],['willow',12,19],['willow',33,20],['reed',22,23],['reed',27,21],['reed',44,23],['reed',51,24],['reed',11,32],['reed',8,27],['reed',22,28],['reed',23,20],['reed',31,10],['reed',41,17],['wreck',31,24],['drain',18,30],['satchel',20,33]],
  });
  const b=shore(34,29);b.land(17,15,15,12);b.path([[0,17],[33,17]]);
  for(let y=9;y<=23;y++)for(let x=9;x<=26;x++)if(((x-18)/9)**2+((y-16)/8)**2<1)b.put(x,y,'p');
  for(let y=1;y<28;y++)b.put(28,y,y>=16&&y<=18?'p':'w');
  b.put(0,17,'R');b.put(33,17,'Q');b.put(18,17,'B');
  registerMap({id:'tollCourt',name:'The Old Toll Bridge',biome:'sunkenMarsh',openingLandscape:true,deliveryLandscape:true,
    playerStart:{x:5,y:17},tiles:b.tiles(),bossTrial:{exit:{map:'lanternReach',x:54,y:18},delay:1.1},
    legend:{R:{tile:'path',portal:{map:'lanternReach',x:56,y:18},portalStyle:'gap'},Q:{tile:'path',portal:{map:'sunriseQuay',x:4,y:19},portalStyle:'gap'},B:{tile:'grass',enemy:'tollkeeper'}},
    openingProps:[['tollArch',28,17],['lantern',8,10],['lantern',25,10],['lantern',8,22],['lantern',25,22],['ledger',17,6],['reed',3,10],['reed',30,23]],
  });
  const q=shore(44,32);q.land(21,16,22,17);q.path([[0,19],[13,19],[21,20],[32,19],[43,19]]);
  q.path([[13,19],[13,11],[21,11],[31,12],[32,19],[29,25],[21,25],[21,20]],1);
  // Building footprints match the visible walls; doors open onto clear paths.
  for(const [x,y]of [[12,10],[30,11],[28,24]])for(let dy=-2;dy<=0;dy++)for(let dx=-1;dx<=1;dx++)q.put(x+dx,y+dy,'r');
  q.put(0,19,'R');q.put(43,19,'T');q.put(19,22,'F');
  registerMap({id:'sunriseQuay',name:'Sunrise Town · The Quay',biome:'overworld',openingLandscape:true,deliveryLandscape:true,
    playerStart:{x:4,y:19},tiles:q.tiles(),
    legend:{R:{tile:'path',portal:{map:'tollCourt',x:30,y:17},portalStyle:'gap'},T:{tile:'path',portal:{map:'town',x:27,y:8},portalStyle:'gap'},F:{tile:'grass',rest:true}},
    openingProps:[['bakery',12,10],['letterHouse',30,11],['birthdayHouse',28,24],['cart',7,20],['well',21,16],['camp',19,22],['lantern',10,16],['lantern',33,16],['lantern',22,27],['bunting',21,12],['bunting',21,24],['willow',5,13],['willow',37,24],['apple',7,25],['apple',34,7],['apple',8,7],['apple',16,7],['flowerbed',15,9],['flowerbed',33,10],['flowerbed',25,25],['flowerbed',18,17],['bench',22,18],['fence',9,9],['fence',9,10],['fence',34,12],['fence',32,25],['fence',25,9],['reed',6,28],['reed',37,27],['boat',8,29],['boat',35,28]],
  });
  const town=G.maps.town,row=town.tiles[8].split('');row[29]='Q';town.tiles[8]=row.join('');
  town.legend.Q={tile:'path',portal:{map:'sunriseQuay',x:40,y:19},portalStyle:'gap'};
  G.NPC_PLACEMENTS.lanternReach=[['parcel',8,29]];G.NPC_PLACEMENTS.tollCourt=[];
  G.NPC_PLACEMENTS.sunriseQuay=[['parcel',8,20],['quayBaker',12,12],['quayMara',30,13],['quayPip',28,26],['pebble',22,20]];
  for(const [id,name,base,line]of [
    ['quayBaker','Baker Brindle','mayorMaybe','I kept the oven warm. It seemed a small thing I could do.'],
    ['quayMara','Mara','alias','The chair beside mine is for a letter. A person would be even better.'],
    ['quayPip','Pip','pebble','Mum said my birthday would arrive when the road did. Is that today?'],
  ])G.NPCS[id]={...G.NPCS[base],name,chapters:{0:[line]}};
  registerEnemy({...G.enemies.ancientTreant,id:'tollkeeper',name:'The Tollkeeper',hp:40,speed:0,damage:1,size:30,aggro:142,ward:null,trophy:null,trophyName:null,location:'The Old Toll Bridge',
    boss:{...G.enemies.ancientTreant.boss,orchard:true,color:'#e7bd78',
      introLines:['One copper to cross. Three hundred years of late fees.','The town owes tomorrow. I collect tomorrow.'],
      phaseLine:'You cannot settle a debt by giving things away!',phaseThreeLine:'The ledger is getting wet. The numbers... I cannot read the numbers.',
      knockoutLine:'Parcel catches you beneath the bridge lamps. The deliveries can wait one more try.'},
  });
})();
