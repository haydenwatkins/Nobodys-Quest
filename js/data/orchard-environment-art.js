/* Quiet ground, layered leaf clusters and grown roots for the first roads.
   Scenery is authored at half-world pixels like the new character sprites. */
"use strict";
(() => {
  const A=G.authoredPixelArt;
  const materials={
    forest:{k:'#293e37',a:'#354d3e',b:'#4c6848',c:'#6c8456',d:'#9ca96b',e:'#4d3d38',f:'#785848',g:'#ac8056',h:'#cfad77',i:'#7d5553',j:'#ad6864',l:'#d79379',m:'#bcc285'},
    apple:{k:'#334235',a:'#40533b',b:'#60754a',c:'#859557',d:'#b0b772',e:'#514139',f:'#886349',g:'#b38a5e',h:'#d8b483',i:'#81484d',j:'#b26964',l:'#e1a17c',m:'#b5c282'},
    heartwood:{k:'#293d39',a:'#354e43',b:'#4c6a52',c:'#6e8a62',d:'#a2b785',e:'#413c36',f:'#695645',g:'#94816a',h:'#c0ad8a',i:'#735961',j:'#a76d78',l:'#d7a48f',m:'#c5cdae'},
  };
  function tree(g,frame,fruit){
    const sway=frame===1?1:frame===3?-1:0;
    // Branches and buttress roots belong to the trunk, below the crown.
    g.poly([[35,94],[39,70],[37,52],[44,46],[49,61],[50,84],[58,94],[49,94],[44,91],[38,95],[29,95]],'e');
    g.poly([[38,91],[41,70],[40,55],[44,51],[47,64],[47,87],[52,92],[44,89]],'f');
    g.line(41,62,42,86,'g',2);g.line(45,71,46,87,'h',1);g.line(47,76,48,90,'e',1);g.line(42,86,36,92,'g',1);
    g.line(40,66,26,55,'e',5);g.line(40,65,26,54,'f',3);g.line(46,67,62,51,'e',5);g.line(46,66,61,52,'g',2);
    g.ellipse(43,80,3,4,'e');g.ellipse(43,79,2,3,'f');g.put(43,78,'g');
    const lobes=[[23,43,20,16],[63,38,19,18],[42+sway,23,22,17],[68,55,15,14],[20,60,15,12],[45,55,28,22]];
    for(const [x,y,rx,ry]of lobes){
      g.ellipse(x,y,rx,ry,'k');g.ellipse(x-1,y-2,rx-1,ry-2,'a');g.ellipse(x-2,y-4,rx-3,ry-4,'b');
      g.ellipse(x-6,y-ry+7,Math.max(4,rx-8),5,'c');g.ellipse(x+5,y-ry+9,5,4,'c');g.line(x-9,y-ry+4,x-5,y-ry+3,'d',1);
      g.poly([[x-rx+4,y-3],[x-rx+8,y-7],[x-rx+10,y-2],[x-rx+7,y+1]],'c');
      g.ellipse(x+rx-6,y+5,4,5,'a');g.line(x-8,y+ry-5,x-4,y+ry-6,'b',2);g.put(x+6,y+1,'c');g.put(x+8,y+2,'b');
    }
    if(fruit)for(const [x,y]of [[23,43],[53,29],[65,49],[34,61],[55,61],[15,56]]){
      g.line(x,y-4,x+1,y-7,'e',1);g.ellipse(x+3,y-6,3,1,'m');g.ellipse(x,y,4,4,'i');g.ellipse(x-1,y-1,3,3,'j');g.put(x-2,y-2,'l');g.put(x,y+2,'i');
    }
    else for(const [x,y]of [[23,42],[45,21],[61,38],[40,57]]){g.line(x-3,y,x+1,y-1,'c',1);g.line(x-1,y-2,x-1,y+2,'a',1);}
  }
  G.openingScenery={};for(const [id,palette]of Object.entries(materials))G.openingScenery[id]=A.compactSprite(A.authored(88,96,palette,(g,f)=>tree(g,f,id==='apple')));
})();
