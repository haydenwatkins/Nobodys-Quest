/* Weathered bell arches mark safe crossings over Frostbell's frozen basins. */
"use strict";
(() => {
 const resonant=[];for(const y of [18,19,20])for(const x of [15,16,29,30])resonant.push({x,y});
 function awakenCauseways(){
  if(G.state.mapId!=="frostbellTundra"||!G.hasWorldMark("echo"))return;
  const path=G.state.grid[21][15];
  for(const {x,y} of resonant)G.state.grid[y][x]=path;
 }
 G.events.on("mapEnter",awakenCauseways);
 G.events.on("pickup",data=>{if(data.item==="trophy-bell-titan")awakenCauseways();});
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
  if(G.hasWorldMark("echo"))for(const {x:tx,y:ty} of resonant){
   const x=tx*16+8,y=ty*16+8;
   list.push({y:y-1,fn:()=>{c.save();
    c.fillStyle="#537f9a";c.fillRect(x-8,y-8,16,16);
    c.fillStyle="#b8e4df";c.fillRect(x-7,y-7,14,3);c.fillRect(x-7,y+5,14,2);
    c.fillStyle="#e8f5f1";c.fillRect(x-5,y-3,10,1);c.fillRect(x-5,y+2,10,1);
    c.fillStyle="#fff3c2";c.fillRect(x-1,y-5,2,10);c.fillRect(x-3,y-1,6,2);
    c.fillStyle="#6caeb9";c.fillRect(x-7,y-1,2,2);c.fillRect(x+5,y+1,2,2);
    c.restore();}});
  }
  return list;
 };
})();
