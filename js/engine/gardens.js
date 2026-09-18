/* Planted borders and stone bridge heads distinguish the Mason's living terraces. */
"use strict";
(() => {
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
    return list;
  };
})();
