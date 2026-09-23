/* Planted borders and stone bridge heads distinguish the Mason's living terraces. */
"use strict";
(() => {
  const crossings=[];
  for(const y of [10,11,18,19])for(const x of [15,16])crossings.push({x,y});
  function raiseCrossings(){
    if(G.state.mapId!=="hangingGardens"||!G.hasWorldMark("stone"))return;
    const path=G.state.grid[14][15];
    for(const {x,y} of crossings)G.state.grid[y][x]=path;
  }
  G.events.on("mapEnter",raiseCrossings);
  G.events.on("pickup",data=>{if(data.item==="trophy-old-mason")raiseCrossings();});
  const oldDraw=G.openingDrawables;
  G.openingDrawables=c=>{
    const list=oldDraw(c);if(G.state.mapId!=="hangingGardens")return list;
    for(const tx of [23,34])for(const ty of [10,18])for(const side of [-1,1]){
      const x=tx*16+8+side*28,y=ty*16+8;
      list.push({y,fn:()=>{c.save();c.fillStyle="#50636a";c.fillRect(x-4,y-18,8,20);c.fillStyle="#b4c9ba";c.fillRect(x-5,y-20,10,4);c.fillRect(x-3,y-16,2,14);c.fillStyle="#385b50";c.fillRect(x+2,y-14,3,10);c.restore();}});
    }
    for(const [tx,ty]of [[12,5],[18,5],[28,5],[39,5],[14,22],[19,22],[28,25],[39,25]]){
      const x=tx*16+8,y=ty*16+8;
      list.push({y:y+2,fn:()=>{c.save();c.fillStyle="#627572";c.fillRect(x-12,y-6,24,9);c.fillStyle="#b4c9ba";c.fillRect(x-13,y-8,26,3);c.fillStyle="#574c46";c.fillRect(x-10,y-8,20,2);
        for(let i=0;i<3;i++){const fx=x-7+i*7;c.fillStyle="#315d49";c.fillRect(fx,y-14,2,7);c.fillStyle=i===1?"#ffdc90":"#d497b5";c.fillRect(fx-2,y-17-(i%2)*2,6,4);c.fillStyle="#fff3c2";c.fillRect(fx,y-16-(i%2)*2,2,2);}c.restore();}});
    }
    if(G.hasWorldMark("stone"))for(const {x:tx,y:ty} of crossings){
      const x=tx*16+8,y=ty*16+8;
      list.push({y:y-1,fn:()=>{c.save();c.fillStyle="#5f7770";c.fillRect(x-7,y-8,14,15);
        c.fillStyle="#c3d7b8";c.fillRect(x-6,y-7,12,3);c.fillStyle="#dbeaaf";c.fillRect(x-4,y-5,8,1);
        c.fillStyle="#728e7b";c.fillRect(x-5,y+4,10,2);c.fillStyle="#e5dbaf";c.fillRect(x-1,y-1,2,3);c.restore();}});
    }
    return list;
  };
})();
