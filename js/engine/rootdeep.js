/* Silk stitched between roots marks the hollow's broad passages. */
"use strict";
(() => {
 const oldDraw=G.openingDrawables;
 G.openingDrawables=c=>{const list=oldDraw(c);if(G.state.mapId!=="rootdeepHollow")return list;
  for(const tx of [15,28])for(const ty of [7,14,23]){const x=tx*16+16,y=ty*16+8;
   list.push({y:y-12,fn:()=>{c.save();c.strokeStyle="#b6a7c5";c.lineWidth=1;
    for(const dy of [-17,-11,-5]){c.beginPath();c.moveTo(x-18,y+dy);c.lineTo(x,y+dy+4);c.lineTo(x+18,y+dy);c.stroke();}
    c.strokeStyle="#6c658b";for(const dx of [-12,0,12]){c.beginPath();c.moveTo(x+dx,y-20);c.lineTo(x+dx,y-1);c.stroke();}c.restore();}});
  }
  for(const [tx,ty]of [[9,5],[20,5],[31,5],[10,24],[24,25],[38,21]]){const x=tx*16+8,y=ty*16+8;
   list.push({y,fn:()=>{c.save();c.fillStyle="#48415a";c.fillRect(x-4,y-15,8,15);c.fillStyle="#d9cce2";c.fillRect(x-3,y-14,6,10);c.fillStyle="#9b81b4";for(let dy=-12;dy<-3;dy+=3)c.fillRect(x-3,y+dy,6,1);c.fillStyle="#73cfc3";c.fillRect(x-1,y-10,2,3);c.restore();}});
  }return list;
 };
})();
