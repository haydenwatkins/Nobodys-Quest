/* Brass trail lanterns guide travelers through Stormspine's rock passes. */
"use strict";
(() => {
 const litPasses=[];for(const y of [18,19,20,21])for(const x of [15,16,28,29])litPasses.push({x,y});
 function openLitPasses(){
  if(G.state.mapId!=="stormspinePeaks"||!G.hasWorldMark("light"))return;
  const path=G.state.grid[22][15];
  for(const {x,y}of litPasses)G.state.grid[y][x]=path;
 }
 G.events.on("mapEnter",openLitPasses);
 G.events.on("pickup",data=>{if(data.item==="trophy-lantern-keeper")openLitPasses();});
 const oldDraw=G.openingDrawables;
 G.openingDrawables=c=>{const list=oldDraw(c);if(G.state.mapId!=="stormspinePeaks")return list;
  const lit=G.hasWorldMark("light");
  for(const [tx,ty]of [[10,8],[18,8],[29,8],[13,23],[19,23],[27,23],[32,23],[39,23]]){
   const x=tx*16+8,y=ty*16+8;
   list.push({y:y-11,fn:()=>{c.save();
    c.fillStyle="#3a3d50";c.fillRect(x-2,y-28,4,16);c.fillRect(x-5,y-14,10,3);
    c.fillStyle=lit?"#be995c":"#6c6980";c.fillRect(x-6,y-40,12,13);c.fillRect(x-4,y-43,8,3);c.fillRect(x-7,y-29,14,3);
    c.fillStyle=lit?"#fff3c2":"#333c57";c.fillRect(x-4,y-38,8,9);
    c.fillStyle=lit?"#ffcd75":"#526477";c.fillRect(x-1,y-36,2,7);
    if(lit){c.fillStyle="rgba(255,205,117,.2)";c.fillRect(x-10,y-44,20,20);}
    c.restore();}});
  }
  if(lit)for(const {x:tx,y:ty}of litPasses){const x=tx*16+8,y=ty*16+8;
   list.push({y:y-1,fn:()=>{c.save();c.fillStyle="#626b78";c.fillRect(x-8,y-8,16,16);
    c.fillStyle="#d9bb83";c.fillRect(x-7,y-7,14,2);c.fillRect(x-7,y+5,14,2);
    c.fillStyle="#a99e87";c.fillRect(x-5,y-3,10,1);c.fillRect(x-5,y+2,10,1);
    c.fillStyle="#ffcd75";c.fillRect(x-1,y-5,2,10);c.fillRect(x-4,y-1,8,2);
    c.fillStyle="#fff3c2";c.fillRect(x,y-2,1,3);c.restore();}});
  }
  return list;
 };
})();
