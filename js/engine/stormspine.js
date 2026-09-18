/* Brass trail lanterns guide travelers through Stormspine's rock passes. */
"use strict";
(() => {
 const oldDraw=G.openingDrawables;
 G.openingDrawables=c=>{const list=oldDraw(c);if(G.state.mapId!=="stormspinePeaks")return list;
  for(const [tx,ty]of [[10,8],[18,8],[29,8],[13,23],[19,23],[27,23],[32,23],[39,23]]){
   const x=tx*16+8,y=ty*16+8;
   list.push({y:y-11,fn:()=>{c.save();
    c.fillStyle="#3a3d50";c.fillRect(x-2,y-28,4,16);c.fillRect(x-5,y-14,10,3);
    c.fillStyle="#be995c";c.fillRect(x-6,y-40,12,13);c.fillRect(x-4,y-43,8,3);c.fillRect(x-7,y-29,14,3);
    c.fillStyle="#fff3c2";c.fillRect(x-4,y-38,8,9);c.fillStyle="#ffcd75";c.fillRect(x-1,y-36,2,7);
    c.restore();}});
  }return list;
 };
})();
