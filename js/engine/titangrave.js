/* Five weathered memorials remember the guardians before the final heartbeat. */
"use strict";
(() => {
 const oldDraw=G.openingDrawables;
 const marks=[[10,24,"trophy-sky-sovereign","#73eff7"],[18,24,"trophy-old-mason","#d8b06a"],[25,24,"trophy-silk-matriarch","#d9a7ff"],[32,24,"trophy-bell-titan","#fff3c2"],[39,24,"trophy-lantern-keeper","#ffcd75"]];
 G.openingDrawables=c=>{const list=oldDraw(c),map=G.state.mapId;
  if(map!=="titanGrave"&&map!=="overworld")return list;
  if(map==="titanGrave")for(const [tx,ty,item,color]of marks){const x=tx*16+8,y=ty*16+8;
   list.push({y:y-12,fn:()=>{c.save();c.fillStyle="#353344";c.fillRect(x-9,y-14,18,3);
    c.fillStyle="#74697c";c.fillRect(x-6,y-34,12,20);c.fillRect(x-4,y-38,8,4);
    c.fillStyle="#a3969b";c.fillRect(x-6,y-34,2,20);c.fillStyle=G.state.items.includes(item)?color:"#41415a";
    c.fillRect(x-1,y-30,2,10);c.fillRect(x-4,y-27,8,3);c.restore();}});
  }
  const lit=G.hasWorldMark("heart"),x=(map==="titanGrave"?23:114)*16+8,y=(map==="titanGrave"?27:2)*16+8;
  list.push({y:y-8,fn:()=>{c.save();
   c.fillStyle="#353344";c.fillRect(x-20,y-7,40,6);
   c.fillStyle=lit?"#9a7380":"#686679";
   for(const side of [-1,1]){c.fillRect(x+side*15-2,y-32,5,25);c.fillRect(x+side*15-4,y-9,9,4);}
   c.fillRect(x-18,y-35,36,5);c.fillStyle=lit?"#f0bf91":"#91899a";c.fillRect(x-16,y-36,32,2);
   c.fillStyle=lit?"#ffcd75":"#424257";c.fillRect(x-3,y-31,6,6);c.fillRect(x-5,y-29,10,3);
   c.fillStyle=lit?"#fff3c2":"#5a586d";c.fillRect(x-1,y-28,2,9);
   if(lit){c.fillStyle="rgba(255,205,117,.2)";c.fillRect(x-11,y-32,22,25);}
   c.restore();}});
  return list;
 };
})();
