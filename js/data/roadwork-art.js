/* Joined timber, copper targets, towing loops and warm lamp glass. The art
   has two physical poses: waiting for help and restored by a real action. */
"use strict";
(() => {
  const A=G.authoredPixelArt,S=G.roadworkScenery={},pal={k:'#303f3d',a:'#544536',b:'#826348',c:'#b48a60',d:'#dfc38c',e:'#597769',f:'#89a982',g:'#bdd1a1',h:'#994f3e',i:'#cb8057',j:'#f1b976',l:'#6a8b95',m:'#b3d5cf',n:'#fff0bd',o:'#79749b',p:'#afa5cf',q:'#ded2ee'};
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
  build('relay',40,52,(g,v)=>{
    const powered=v%2;
    g.poly([[4,49],[8,41],[31,41],[36,49]],'a');g.rect(10,39,20,7,'b');g.line(11,40,28,40,'d',1);
    g.rect(17,18,6,24,'a');g.line(19,19,19,40,'i',2);
    for(const y of [21,26,31]){g.rect(11,y,18,3,'h');g.line(12,y,27,y,'j',1);}
    g.ellipse(20,12,10,10,'a');g.ellipse(20,11,8,8,powered?'l':'b');
    g.ellipse(20,10,5,5,powered?'m':'i');g.ellipse(19,9,2,2,powered?'n':'j');
    g.line(5,47,34,47,'c',1);g.put(7,45,'d');g.put(32,45,'d');
  });
  build('brush',38,38,(g,v)=>{
    const cleared=v%2;
    if(cleared){g.ellipse(19,33,14,3,'e');g.line(6,31,31,33,'b',3);g.line(8,30,29,32,'d',1);g.ellipse(8,30,3,3,'c');g.ellipse(8,30,1,1,'a');}
    else{
      g.line(4,31,31,11,'a',7);g.line(5,30,30,12,'b',5);g.line(7,28,29,12,'c',2);
      g.line(14,24,9,10,'a',4);g.line(15,23,10,11,'b',2);g.line(21,19,34,23,'a',4);g.line(22,18,33,22,'c',1);
      g.ellipse(5,30,4,4,'d');g.ellipse(5,30,2,2,'a');
      for(const [x,y]of [[9,9],[28,9],[34,21]]){g.ellipse(x,y,4,3,'e');g.ellipse(x-1,y-1,2,1,'g');}
    }
  });
  build('breadCart',64,54,(g,v)=>{
    g.ellipse(32,49,29,4,'a');g.line(5,36,58,36,'a',4);g.line(7,35,57,35,'c',2);
    for(const x of [15,47]){g.ellipse(x,43,9,9,'a');g.ellipse(x,43,6,6,'b');g.ellipse(x,43,2,2,'d');g.line(x-4,39,x+4,47,'c',1);}
    g.poly([[6,34],[3,16],[59,16],[56,34]],'a');g.rect(7,20,48,12,'b');g.line(8,21,54,21,'d',1);
    for(const y of [26,30])g.line(8,y,53,y,'c',1);
    g.line(57,29,63,20,'a',3);g.line(58,28,63,20,'d',1);
    for(const [x,y]of [[13,14],[25,12],[38,13],[50,14]]){g.ellipse(x,y,8,6,'b');g.ellipse(x,y-1,6,4,'j');g.line(x-3,y-2,x+2,y-1,'n',1);}
    g.line(12,4,12,19,'a',2);g.line(51,4,51,19,'a',2);g.poly([[8,3],[53,3],[58,8],[3,8]],'e');g.line(6,7,55,7,'g',1);
  });
  build('kettle',42,48,(g,v)=>{
    const warm=v%2;g.rect(3,34,36,5,'a');g.line(5,35,37,35,'d',1);g.rect(7,39,4,8,'b');g.rect(31,39,4,8,'b');
    g.ellipse(20,26,13,10,'k');g.ellipse(19,25,10,8,'l');g.ellipse(17,23,5,5,'m');
    g.poly([[28,23],[36,17],[35,26],[29,29]],'k');g.line(31,23,35,20,'l',2);
    g.ellipse(19,13,8,8,'k');g.ellipse(19,13,5,5,'e');g.rect(9,17,20,4,'k');g.line(11,18,26,18,'d',1);g.rect(17,14,5,3,'b');
    g.ellipse(32,34,5,4,'b');g.ellipse(32,32,4,2,warm?'j':'l');
    if(warm){g.line(17,9,14,6,'m',1);g.line(14,6,16,2,'m',1);g.line(23,9,25,5,'m',1);g.put(24,2,'m');}
  });
  build('vane',56,72,(g,v)=>{
    const turned=v%2;
    g.ellipse(28,67,24,4,'o');g.poly([[6,65],[12,55],[43,55],[50,65]],'k');g.rect(12,56,31,8,'o');g.line(14,57,40,57,'q',1);
    g.rect(25,17,6,41,'a');g.line(27,18,27,56,'d',2);g.ellipse(28,33,5,5,'a');g.ellipse(28,33,2,2,'j');
    if(turned){g.poly([[28,6],[41,12],[35,29],[28,32]],'k');g.poly([[29,9],[38,13],[33,26],[29,29]],'l');g.line(31,12,34,16,'m',2);
      g.poly([[27,34],[15,40],[20,51],[27,55]],'k');g.poly([[26,37],[18,42],[22,49],[26,51]],'l');g.line(22,42,24,47,'m',2);
    }else{g.poly([[4,20],[23,23],[27,32],[16,39],[3,34]],'k');g.poly([[7,23],[21,25],[24,31],[16,36],[6,32]],'l');g.line(10,25,16,28,'m',2);
      g.poly([[29,33],[41,26],[52,30],[49,43],[32,42]],'k');g.poly([[32,35],[41,29],[49,32],[47,40],[34,39]],'l');g.line(40,32,45,34,'m',2);}
    g.ellipse(28,13,4,4,'a');g.ellipse(28,12,2,2,'d');g.line(13,62,40,62,'p',1);
  });
  build('soil',64,42,(g,v)=>{
    const loose=v%2;g.ellipse(32,35,29,5,'a');
    if(loose){g.ellipse(32,32,25,5,'c');g.line(8,29,19,30,'b',3);g.line(46,29,58,30,'b',3);g.line(20,33,42,33,'d',1);g.line(25,36,36,36,'j',1);}
    else{g.poly([[5,33],[12,21],[24,12],[40,12],[51,22],[59,33]],'b');g.poly([[10,30],[16,22],[26,16],[39,15],[49,25],[53,31]],'c');
      g.line(17,25,27,23,'a',2);g.line(32,19,35,26,'b',2);g.line(35,26,45,28,'a',2);g.line(26,29,30,32,'b',2);
      g.ellipse(16,29,5,3,'l');g.ellipse(43,18,4,3,'l');g.line(13,29,17,28,'m',1);g.line(39,18,43,17,'m',1);}
    g.line(6,34,10,26,'e',2);g.ellipse(9,25,4,2,'f');g.ellipse(55,33,4,2,'g');
  });
  build('pavers',32,32,g=>{g.rect(0,0,32,32,'o');for(const [x,y,w,h]of [[1,1,19,13],[21,1,10,13],[1,16,10,15],[12,16,19,15]]){g.rect(x,y,w,h,'p');g.line(x+1,y+1,x+w-2,y+1,'q',1);}g.put(6,8,'o');g.put(23,25,'o');});
  build('dryPath',32,32,g=>{g.rect(0,0,32,32,'c');g.line(2,0,2,31,'b',2);g.line(29,0,29,31,'b',2);for(const [x,y]of [[9,5],[20,13],[11,22],[21,28]])g.line(x,y,x+3,y,'d',1);g.line(4,2,4,28,'j',1);});
  build('bookBasket',64,48,(g,v)=>{
    const full=v%2;g.ellipse(32,43,29,4,'a');g.poly([[4,22],[59,22],[54,42],[9,42]],'a');g.rect(9,26,46,13,'b');
    for(const y of [28,33,37])g.line(10,y,53,y,'c',1);for(const x of [15,26,38,49])g.line(x,26,x,38,'d',1);
    g.ellipse(31,17,17,15,'a');g.ellipse(31,17,13,11,'c');g.rect(14,19,35,8,'a');
    if(full){for(const [x,y,color]of [[11,18,'l'],[25,13,'o'],[38,16,'h']]){g.rect(x,y,12,15,'a');g.rect(x+1,y+1,10,12,color);g.line(x+3,y+3,x+9,y+3,'n',1);g.rect(x+3,y+6,6,6,'d');g.line(x+4,y+7,x+8,y+7,'n',1);}g.line(46,15,46,8,'e',1);g.ellipse(46,7,4,2,'g');}
    g.rect(5,25,54,4,'a');g.line(7,26,56,26,'d',1);
  });
  build('flower',64,64,(g,v)=>{
    const warm=v%2;g.ellipse(32,59,27,4,'a');g.ellipse(32,56,22,5,'e');g.line(32,54,32,25,'e',4);
    g.poly([[29,44],[13,32],[10,41],[22,48]],'e');g.poly([[30,43],[16,36],[15,41],[25,46]],'f');
    g.poly([[35,48],[47,35],[55,40],[47,48]],'e');g.line(36,46,49,40,'g',2);
    if(warm){for(const [x,y]of [[19,14],[33,9],[45,18],[43,32],[26,35],[15,27]]){g.ellipse(x,y,9,12,'o');g.ellipse(x,y,7,9,'p');g.line(x-2,y-5,x+2,y-6,'q',2);}
      g.ellipse(31,23,9,8,'h');g.ellipse(31,22,7,6,'j');g.ellipse(30,21,4,3,'n');g.put(29,20,'d');g.put(34,23,'d');
    }else{g.line(32,28,24,25,'e',3);g.ellipse(23,31,10,15,'o');g.ellipse(22,30,7,12,'p');g.line(20,21,19,36,'q',2);g.poly([[13,27],[14,19],[23,15],[29,22],[32,28]],'e');g.line(20,17,25,25,'f',2);}
    for(const x of [12,23,41,51])g.line(x,57,x-2,51,'f',2);g.line(17,59,45,59,'g',1);
  });
  build('bell',48,64,(g,v)=>{
    const rung=v%2;g.ellipse(24,59,21,4,'o');g.rect(7,53,34,7,'a');g.line(9,54,38,54,'d',1);
    g.rect(9,10,5,44,'a');g.rect(34,10,5,44,'a');g.rect(8,9,32,6,'b');g.line(11,10,36,10,'d',1);
    g.rect(22,15,4,8,'a');g.ellipse(24,25,10,9,'a');g.poly([[16,24],[32,24],[35,40],[13,40]],rung?'j':'c');
    g.line(18,25,16,35,'n',2);g.rect(12,38,24,5,'a');g.line(14,39,33,39,'d',2);g.ellipse(24,44,3,4,rung?'n':'d');
    g.poly([[8,16],[16,16],[12,25]],'p');g.poly([[32,16],[40,16],[36,25]],'l');
    if(rung){g.line(4,27,1,30,'n',2);g.line(43,27,46,30,'n',2);g.put(4,37,'j');g.put(43,37,'j');}
  });
  build('petalPath',32,32,g=>{g.rect(0,0,32,32,'o');g.rect(2,2,28,28,'p');g.line(3,3,28,3,'q',1);g.line(2,29,29,29,'o',1);for(const [x,y]of [[8,9],[21,22]]){g.ellipse(x,y,3,2,'q');g.put(x+1,y,'d');}g.line(5,21,8,20,'o',1);});
  build('cushions',64,44,(g,v)=>{
    const ready=v%2;g.ellipse(32,39,29,4,'a');g.rect(7,29,50,10,'a');g.rect(9,30,46,7,'b');for(const x of [14,25,37,48])g.line(x,31,x,37,'d',1);
    if(ready){for(const [x,y,w,color]of [[10,23,23,'l'],[29,20,24,'o'],[22,11,19,'h']]){g.rect(x,y,w,10,'a');g.rect(x+1,y+1,w-2,7,color);g.line(x+3,y+2,x+w-4,y+2,'m',1);g.put(x+5,y+5,'d');g.put(x+w-6,y+5,'d');}g.ellipse(31,11,6,4,'p');g.line(28,10,34,10,'q',1);}
    else{g.rect(13,17,38,12,'a');g.rect(15,18,34,9,'l');g.line(17,20,46,20,'m',1);g.line(19,25,43,25,'m',1);g.rect(30,18,4,10,'b');}
    g.line(8,38,54,38,'c',1);
  });
  build('puppetStage',96,92,(g,v)=>{
    const ready=v%2;g.ellipse(48,85,45,5,'a');g.rect(9,19,7,64,'a');g.rect(80,19,7,64,'a');g.rect(8,14,80,9,'b');g.line(12,15,83,15,'d',2);
    g.rect(16,23,64,47,'a');g.rect(10,68,76,15,'o');g.rect(12,70,72,10,'p');g.line(14,71,81,71,'q',1);g.rect(7,81,82,5,'a');g.line(10,82,85,82,'d',1);
    if(ready){g.poly([[16,23],[32,23],[28,45],[19,62],[16,62]],'h');g.poly([[64,23],[80,23],[80,62],[76,62],[68,45]],'h');g.line(20,25,21,49,'i',2);g.line(76,25,75,49,'i',2);
      // Pip's tiny wooden dragon has ears, an eye, a tail and a bow.
      g.poly([[39,59],[40,44],[50,40],[60,47],[61,59]],'e');g.poly([[42,46],[41,36],[47,41],[54,35],[55,44]],'f');g.rect(54,45,11,7,'f');g.put(51,45,'n');g.put(52,45,'a');g.line(60,58,68,53,'e',3);g.line(42,60,58,60,'g',2);g.poly([[47,54],[42,51],[42,57]],'j');g.poly([[49,54],[54,51],[54,57]],'j');g.put(48,54,'n');
    }else{g.rect(16,23,64,43,'h');for(const x of [22,35,59,72])g.line(x,25,x,64,'i',2);g.line(47,24,47,64,'a',2);}
    for(const [x,color]of [[22,'p'],[40,'j'],[58,'l'],[76,'p']])g.poly([[x-6,18],[x+6,18],[x,28]],color);
  });
})();
