/* Five weathered memorials remember the guardians before the final heartbeat. */
"use strict";
(() => {
 const oldDraw=G.openingDrawables;
 const marks=[[10,24,"trophy-sky-sovereign","#73eff7"],[18,24,"trophy-old-mason","#d8b06a"],[25,24,"trophy-silk-matriarch","#d9a7ff"],[32,24,"trophy-bell-titan","#fff3c2"],[39,24,"trophy-lantern-keeper","#ffcd75"]];
 G.openingDrawables=c=>{const list=oldDraw(c);if(G.state.mapId!=="titanGrave")return list;
  for(const [tx,ty,item,color]of marks){const x=tx*16+8,y=ty*16+8;
   list.push({y:y-12,fn:()=>{c.save();c.fillStyle="#353344";c.fillRect(x-9,y-14,18,3);
    c.fillStyle="#74697c";c.fillRect(x-6,y-34,12,20);c.fillRect(x-4,y-38,8,4);
    c.fillStyle="#a3969b";c.fillRect(x-6,y-34,2,20);c.fillStyle=G.state.items.includes(item)?color:"#41415a";
    c.fillRect(x-1,y-30,2,10);c.fillRect(x-4,y-27,8,3);c.restore();}});
  }return list;
 };
})();
