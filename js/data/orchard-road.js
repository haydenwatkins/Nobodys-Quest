/* The first promise: an authored road through Greenfield's old orchard.
   All scenery uses the same collision grid as movement and navigation. */
"use strict";
(() => {
  function landscape(w, h) {
    const rows = Array.from({length:h}, () => Array(w).fill('t'));
    const put = (x,y,v) => { if(x>=0&&y>=0&&x<w&&y<h) rows[y][x]=v; };
    const oval = (cx,cy,rx,ry,v='.') => {
      for(let y=1;y<h-1;y++) for(let x=1;x<w-1;x++)
        if(((x-cx)/rx)**2+((y-cy)/ry)**2 < 1+Math.sin(x*1.8+y*.7)*.055) put(x,y,v);
    };
    const road = (points,r=1) => {
      for(let i=1;i<points.length;i++) {
        const a=points[i-1],b=points[i],n=Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]));
        for(let j=0;j<=n;j++) {
          const x=Math.round(a[0]+(b[0]-a[0])*j/n),y=Math.round(a[1]+(b[1]-a[1])*j/n);
          for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)put(x+dx,y+dy,'p');
        }
      }
    };
    return {rows,put,oval,road,finish:()=>rows.map(r=>r.join(''))};
  }
  const m=landscape(64,44);
  [[9,36,8,6],[20,33,9,7],[20,23,9,7],[39,24,7,7],[46,14,9,6],[54,7,7,5]].forEach(p=>m.oval(...p));
  m.road([[7,37],[12,36],[19,34],[21,30],[19,25],[24,24]]);
  m.road([[35,24],[40,24],[44,21],[45,16],[48,13],[53,12],[54,7],[54,1]]);
  // One narrow culvert under the old dam. Rat opens the sluice from the far side.
  for(let x=25;x<=35;x++)m.put(x,24,'p');
  m.oval(39,30,5,3,'w'); m.oval(38,18,4,3,'w');
  m.road([[39,24],[39,27]],0);
  m.road([[11,36],[3,36],[1,36]]);
  m.put(0,36,'E'); m.put(54,0,'H');
  for(let y=20;y<=22;y++)for(let x=37;x<=40;x++)m.put(x,y,'r');
  m.put(12,35,'N'); m.put(38,25,'C'); m.put(49,15,'F');
  // Four 3-heart creatures provide twelve actual Slap contacts and the sign
  // provides the second Nobody lesson; no fabricated quest events are needed.
  [[17,32],[21,32],[23,35],[18,36]].forEach(p=>m.put(...p,'s'));
  [[18,21],[22,22],[23,26]].forEach(p=>m.put(...p,'b'));
  [[44,15],[49,13]].forEach(p=>m.put(...p,'g'));
  registerMap({id:'orchardRoad',name:'Greenfield · Orchard Road',biome:'mistwood',openingLandscape:true,
    playerStart:{x:7,y:37}, tiles:m.finish(),
    legend:{
      E:{tile:'path',portal:{map:'overworld',x:59,y:45},portalStyle:'gap'},
      H:{tile:'path',portal:{map:'heartwood',x:16,y:22},portalStyle:'gap'},
      N:{tile:'grass',message:'WANTED: SOMEBODY. The orchard road is closed. Deliveries, visitors, and help have stopped arriving. Please report to the stranded cart. — Sunrise Town'},
      C:{tile:'grass',chest:{item:'knights-crest',name:"the mill keeper's Knight's Crest"}},
      F:{tile:'grass',rest:true},
      s:{tile:'grass',enemy:'orchardTangle'},b:{tile:'grass',enemy:'orchardSpitter'},g:{tile:'grass',enemy:'orchardGuard'},
    },
    openingProps:[
      ['sign',12,35],['cart',21,35],['banner',8,35],['mill',39,22],['sluice',34,24],
      ['bell',46,14],['camp',49,15],['arch',54,4],['stump',17,24],['stump',24,20],
      ['apple',15,29],['apple',25,30],['apple',15,20],['apple',24,18],['apple',24,27],
      ['apple',10,39],['apple',13,32],['apple',8,31],['apple',43,27],['apple',50,18],
      ['fence',14,33],['fence',14,35],['fence',26,31],['fence',26,33],
      ['stone',43,17],['stone',50,10],['stone',52,5],['stone',56,5],
    ],
  });
  const h=landscape(34,27);
  h.oval(16,13,14,11); h.road([[16,25],[16,19],[13,16],[16,11]],1);
  h.put(16,26,'O');h.put(16,6,'T');h.put(7,15,'r');h.put(25,15,'r');
  h.put(8,8,'r');h.put(24,8,'r');
  registerMap({id:'heartwood',name:'Mistwood · The Heartwood',biome:'mistwood',openingLandscape:true,
    playerStart:{x:16,y:22},tiles:h.finish(),bossTrial:{exit:{map:'orchardRoad',x:54,y:5},delay:1.2},
    legend:{O:{tile:'path',portal:{map:'orchardRoad',x:54,y:5},portalStyle:'gap'},T:{tile:'grass',enemy:'ancientTreant'}},
    openingProps:[['arch',16,22],['stone',5,13],['stone',27,13],['stump',10,5],['stump',23,6]],
  });
  // Original Greenfield remains reachable; add a clearly signed side road at
  // the starting crossroads without moving any existing portal or treasure.
  const over=G.maps.overworld;
  const row=over.tiles[45].split(''); row[57]='o';over.tiles[45]=row.join('');
  over.legend.o={tile:'path',portal:{map:'orchardRoad',x:3,y:36},portalStyle:'gap'};
  G.NPC_PLACEMENTS.orchardRoad=[['parcel',22,37],['pebble',9,37],['pending',48,16]];
  G.NPC_PLACEMENTS.heartwood=[];

  function copyEnemy(id,base,extra) {
    const src=G.enemies[base];
    registerEnemy(Object.assign({},src,{id,ward:null,trophy:null,miniboss:false},extra));
  }
  copyEnemy('orchardTangle','slime',{name:'Unfinished Tangle',hp:3,speed:23,damage:1,aggro:65});
  copyEnemy('orchardSpitter','slime',{name:'Briar Spitter',hp:4,speed:18,damage:1,aggro:110,behavior:'shooter',shootEvery:2.5,projectileSpeed:62});
  copyEnemy('orchardGuard','bones',{name:'Hollow Watchman',hp:5,speed:30,damage:1,aggro:75});
})();
