/* Joined timber, copper targets, towing loops and warm lamp glass. The art
   has two physical poses: waiting for help and restored by a real action. */
"use strict";
(() => {
  const A=G.authoredPixelArt,S=G.roadworkScenery={},pal={k:'#303f3d',a:'#544536',b:'#826348',c:'#b48a60',d:'#dfc38c',e:'#597769',f:'#89a982',g:'#bdd1a1',h:'#994f3e',i:'#cb8057',j:'#f1b976',l:'#6a8b95',m:'#b3d5cf',n:'#fff0bd'};
  const build=(id,w,h,fn)=>S[id]=A.compactSprite(A.authored(w,h,pal,fn));
  build('winch',48,52,(g,v)=>{
    const done=v%2;g.rect(7,40,34,9,'a');g.line(8,41,39,41,'c',1);g.rect(11,27,5,17,'a');g.rect(33,27,5,17,'a');
    g.rect(13,29,3,12,'c');g.rect(34,29,2,12,'b');g.rect(9,26,30,5,'b');g.line(11,27,36,27,'d',1);
    g.ellipse(24,21,17,17,'a');g.ellipse(24,20,15,15,done?'e':'h');g.ellipse(24,20,10,10,done?'f':'i');
    g.ellipse(24,20,6,6,done?'d':'d');g.ellipse(24,20,2,2,'a');g.line(12,14,16,10,'j',2);
    g.line(24,21,done?33:24,done?24:7,'a',3);g.rect(done?32:22,done?23:5,5,4,'c');
    g.line(36,33,47,done?43:33,'a',2);g.line(36,34,47,done?44:34,'d',1);g.put(11,45,'d');g.put(36,45,'d');
  });
  build('pontoon',64,42,(g,v)=>{
    const done=v%2;g.ellipse(32,33,28,6,'l');g.poly([[3,23],[8,14],[53,14],[61,23],[57,34],[8,34]],'a');
    g.poly([[6,23],[10,17],[52,17],[58,23],[55,30],[9,30]],'b');g.line(11,19,51,19,'d',1);
    for(const x of [17,30,44]){g.rect(x,17,3,14,'a');g.line(x+1,18,x+1,28,'c',1);}
    g.ellipse(31,11,8,8,'a');g.ellipse(31,10,6,6,'i');g.ellipse(31,10,3,3,'k');g.line(28,5,31,4,'j',1);
    if(done){g.line(31,12,0,22,'a',2);g.line(30,12,0,21,'d',1);g.rect(0,26,8,5,'c');}
    g.line(9,32,55,32,'l',1);g.line(15,36,24,36,'m',1);g.line(43,35,52,35,'m',1);
  });
  build('lamp',48,74,(g,v)=>{
    const lit=v%2;g.poly([[14,72],[17,62],[30,62],[35,72]],'a');g.rect(20,28,7,38,'a');g.line(22,31,22,64,'c',2);
    g.rect(12,6,25,24,'a');g.rect(15,9,19,17,lit?'j':'l');g.rect(18,11,5,12,lit?'n':'m');
    g.line(26,9,26,26,'b',2);g.rect(10,28,29,4,'b');g.poly([[9,7],[17,1],[31,1],[40,7]],'a');g.line(13,6,36,6,'c',1);
    if(!lit){g.line(23,63,8,43,'e',3);g.line(24,57,39,43,'e',3);for(const [x,y]of [[9,44],[15,52],[37,44],[30,53],[19,35]]){g.ellipse(x,y,8,5,'e');g.ellipse(x-1,y-1,5,3,'f');g.line(x-2,y-2,x+1,y-2,'g',1);}}
    else{g.rect(6,65,36,3,'c');g.line(7,66,40,66,'d',1);g.ellipse(36,68,4,2,'f');}
  });
  build('boards',32,32,g=>{g.rect(0,0,32,32,'a');for(const y of [1,9,17,25]){g.rect(0,y,32,6,'b');g.line(1,y,30,y,'c',1);g.line(5,y+3,19,y+3,'a',1);g.put(2,y+2,'d');g.put(28,y+2,'d');}g.line(29,0,29,31,'c',1);});
})();
