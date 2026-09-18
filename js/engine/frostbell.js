/* Weathered bell arches mark safe crossings over Frostbell's frozen basins. */
"use strict";
(() => {
 const oldDraw=G.openingDrawables;
 G.openingDrawables=c=>{const list=oldDraw(c);if(G.state.mapId!=="frostbellTundra")return list;
  for(const [tx,ty]of [[7,8],[17,8],[16,22],[29,22],[38,22]]){
   const x=tx*16+8,y=ty*16+8;
   list.push({y:y-10,fn:()=>{c.save();
    c.fillStyle="#536f87";for(const dx of [-18,15]){c.fillRect(x+dx,y-30,4,20);c.fillRect(x+dx-2,y-12,8,3);}
    c.fillStyle="#90b2c4";c.fillRect(x-18,y-33,37,5);c.fillStyle="#e8f5f1";c.fillRect(x-19,y-35,39,3);
    c.fillStyle="#536f87";c.fillRect(x-1,y-28,2,4);c.fillStyle="#be995c";c.fillRect(x-4,y-24,8,7);c.fillRect(x-6,y-18,12,3);
    c.fillStyle="#fff3c2";c.fillRect(x-3,y-24,2,7);c.fillRect(x-1,y-15,2,3);c.restore();}});
  }
  return list;
 };
})();
