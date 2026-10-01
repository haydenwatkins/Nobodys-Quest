/* The first roads' little working places: patched canvas, worn timber,
   copper mechanisms and limestone. These sprites never change collision. */
"use strict";
(() => {
  const A=G.authoredPixelArt,P=G.openingScenery.props={};
  const pal={k:'#2e3437',a:'#4d443f',b:'#715647',c:'#967258',d:'#bf9870',e:'#dcc198',f:'#f3dfb4',g:'#86696c',h:'#ad7472',i:'#d29b88',j:'#edd0aa',l:'#3c5750',m:'#657951',n:'#97a372',o:'#c8cea1',p:'#6e7d70',q:'#99a493',r:'#bcc1a5',s:'#477779',t:'#72a09b',u:'#b0c8b1'};
  const build=(id,w,h,fn)=>P[id]=A.compactSprite(A.authored(w,h,pal,fn));
  function wood(g,x,y,w,h){g.rect(x,y,w,h,'a');g.rect(x+1,y+1,w-2,h-2,'b');g.line(x+2,y+2,x+2,y+h-3,'d',1);g.line(x+w-3,y+5,x+w-3,y+h-2,'c',1);if(h>15){g.ellipse(x+w/2,y+h*.6,2,3,'a');g.put(x+w/2,y+h*.6,'c');}}
  function bolt(g,x,y){g.ellipse(x,y,2,2,'a');g.put(x,y,'e');}
  build('cart',112,86,g=>{
    for(const x of [18,76]){g.ellipse(x,72,12,13,'k');g.ellipse(x,72,10,11,'b');g.ellipse(x,72,7,8,'a');for(let i=0;i<6;i++){const a=i*Math.PI/3;g.line(x,72,x+Math.cos(a)*8,72+Math.sin(a)*9,'d',1);}g.ellipse(x,72,3,3,'c');g.put(x-1,71,'e');}
    wood(g,14,48,73,23);for(const x of [24,74])wood(g,x,29,5,38);g.rect(18,50,65,2,'d');g.line(15,66,84,66,'c',1);for(const x of [24,43,64,81]){g.line(x,53,x,65,'a',1);bolt(g,x,69);}
    g.poly([[9,42],[19,10],[38,4],[65,4],[81,10],[93,42]],'k');g.poly([[13,40],[22,12],[39,7],[64,7],[78,12],[89,40]],'g');g.poly([[17,38],[24,13],[40,9],[63,9],[75,13],[85,38]],'h');
    g.poly([[45,9],[55,9],[59,39],[42,39]],'j');g.line(30,17,24,37,'i',1);g.line(69,17,77,36,'g',1);
    for(let x=16;x<88;x+=8){g.ellipse(x,40,4,3,'a');g.ellipse(x,39,4,2,'i');g.put(x,38,'j');}g.line(14,43,88,43,'d',1);
    g.poly([[34,49],[53,46],[57,62],[36,65]],'a');g.poly([[36,50],[52,48],[54,61],[38,63]],'e');g.line(44,49,46,62,'h',3);g.line(38,54,53,51,'h',2);g.put(47,53,'f');
    wood(g,82,74,29,4);bolt(g,88,75);
  });
  build('mill',128,140,g=>{
    // Chimney and curved eaves remain within the old roof's envelope.
    g.rect(88,15,10,37,'a');g.rect(90,16,6,33,'q');g.rect(86,14,14,4,'p');g.line(90,25,96,25,'a',1);g.line(90,35,96,35,'a',1);
    g.poly([[17,46],[108,46],[111,130],[20,136]],'a');g.poly([[22,50],[103,50],[106,127],[24,131]],'r');g.poly([[23,51],[65,51],[65,128],[25,130]],'e');
    for(let y=63;y<127;y+=12){g.line(24,y,105,y-2,'q',1);g.line(29+(y%24?8:0),y-9,29+(y%24?8:0),y-2,'d',1);}
    for(const x of [20,62,105])wood(g,x,49,5,83);wood(g,21,82,89,4);wood(g,23,128,84,5);
    g.poly([[4,48],[17,33],[56,1],[69,1],[117,39],[125,48],[63,43]],'k');g.poly([[9,44],[21,33],[58,5],[68,5],[113,40],[120,45],[63,39]],'g');
    for(let row=0;row<6;row++){const y=10+row*6,left=58-row*8,right=68+row*8;g.line(left,y,right,y,'h',4);for(let x=left+2+(row%2)*5;x<right-2;x+=10){g.line(x,y-1,x+6,y-1,'i',1);g.line(x+8,y-2,x+8,y+2,'g',1);}}
    g.line(9,47,120,47,'d',3);for(const x of [26,57,87,113])bolt(g,x,48);
    g.poly([[76,132],[76,103],[80,96],[92,95],[96,102],[96,131]],'a');g.poly([[79,130],[79,104],[82,99],[91,98],[93,104],[93,129]],'b');g.line(82,105,82,128,'c',1);g.line(90,105,90,128,'a',1);bolt(g,90,115);
    g.poly([[33,81],[33,65],[37,59],[48,59],[52,65],[52,81]],'a');g.poly([[36,78],[36,65],[39,62],[46,62],[49,65],[49,78]],'u');g.line(42,62,42,79,'b',2);g.line(36,70,49,70,'b',2);g.line(32,82,53,82,'d',2);
    g.rect(39,87,12,8,'b');g.rect(40,88,10,5,'f');g.line(42,90,48,90,'c',1);g.put(46,92,'h');g.ellipse(36,126,4,2,'m');g.ellipse(100,126,3,2,'m');
  });
  const wheelFrames=[];for(let f=0;f<8;f++){const g=A.grid(62,62),angle=f*Math.PI/8;
    g.ellipse(31,31,30,30,'a');g.ellipse(31,31,27,27,'c');g.ellipse(31,31,23,23,'s');g.ellipse(31,31,21,21,'l');
    for(let i=0;i<8;i++){const a=angle+i*Math.PI/4,x=31+Math.cos(a)*27,y=31+Math.sin(a)*27;g.line(31,31,x,y,'b',5);g.line(31,31,x-1,y-1,'d',1);const tx=-Math.sin(a)*5,ty=Math.cos(a)*5;g.line(x-tx,y-ty,x+tx,y+ty,'a',5);g.line(x-tx,y-ty,x+tx,y+ty,'e',3);}
    g.ellipse(31,31,6,6,'a');g.ellipse(31,31,4,4,'d');g.put(30,29,'f');g.put(32,32,'b');wheelFrames.push(g.rows());}
  P.wheel=A.compactSprite({palette:pal,frames:wheelFrames,density:2,authored:true,animations:{idle:[0],walk:[0,1,2,3,4,5,6,7],attack:[0]}});
  build('bell',64,96,(g,f)=>{
    for(const x of [8,49])wood(g,x,12,7,80);wood(g,4,7,55,9);g.line(8,9,54,9,'d',1);bolt(g,11,11);bolt(g,53,11);
    const x=32+(f===1?2:f===3?-2:0);g.line(32,14,x,31,'a',3);g.line(32,14,x,31,'d',1);g.ellipse(x,29,5,4,'a');g.ellipse(x,28,3,3,'d');
    g.poly([[x-9,31],[x+9,31],[x+13,51],[x+20,58],[x+19,63],[x-19,63],[x-20,58],[x-13,51]],'a');g.poly([[x-7,33],[x+7,33],[x+10,52],[x+17,58],[x+16,60],[x-16,60],[x-17,58],[x-10,52]],'c');g.line(x-6,36,x-8,53,'f',2);g.line(x+5,36,x+9,54,'d',2);g.line(x-15,58,x+15,58,'e',2);
    g.ellipse(x,62,15,3,'a');g.line(x-13,63,x+13,63,'d',1);g.ellipse(x+(f===1?-2:f===3?2:0),66,3,4,'e');g.line(x+2,64,x+2,91,'f',1);g.rect(x+1,82,3,9,'d');
    for(const x of [6,56])g.ellipse(x,92,5,2,'l');
  });
  function arch(g,open){
    for(const x of [17,107]){g.poly([[x-7,118],[x-6,58],[x-1,36],[x+7,39],[x+8,111],[x+14,118]],'a');g.line(x,44,x,109,'b',7);g.line(x-2,56,x-2,111,'d',1);g.line(x+2,68,x+2,113,'c',1);g.ellipse(x,82,3,5,'a');g.put(x,80,'c');}
    for(let i=0;i<15;i++){const a=Math.PI+i*Math.PI/14,x=64+Math.cos(a)*47,y=55+Math.sin(a)*42;g.ellipse(x,y,9,7,'a');g.ellipse(x-1,y-1,6,5,'b');g.line(x-3,y-2,x+2,y-3,'d',1);}
    for(const [x,y]of [[18,48],[24,27],[41,14],[69,10],[91,19],[107,39]]){g.ellipse(x,y,9,6,'l');g.ellipse(x-2,y-2,6,4,'m');g.line(x-3,y-3,x+1,y-3,'n',1);}
    if(!open)for(const [x,h]of [[34,28],[51,43],[72,37],[89,25]]){g.line(x,115,x-3,115-h,'a',6);g.line(x,114,x-3,116-h,'b',3);g.line(x-3,115-h,x+4,110-h,'b',2);g.ellipse(x-2,113-h,3,2,'m');}
  }
  build('archOpen',128,120,g=>arch(g,true));build('archClosed',128,120,g=>arch(g,false));
  for(const open of [false,true])build(open?'sluiceOpen':'sluiceClosed',64,44,g=>{
    for(const x of [10,52]){wood(g,x,9,6,34);g.rect(x-1,28,8,4,'p');bolt(g,x+3,29);}
    const y=open?9:26;wood(g,8,y,52,12);g.line(11,y+2,55,y+2,'d',1);for(const x of [17,43])bolt(g,x,y+7);
    g.ellipse(54,10,7,7,'a');g.ellipse(54,10,5,5,'c');g.line(49,10,59,10,'e',1);g.line(54,5,54,15,'e',1);g.put(54,10,'b');
  });
  build('sign',56,60,g=>{wood(g,25,27,6,32);g.poly([[3,10],[49,7],[53,13],[52,41],[6,44],[2,39]],'a');g.poly([[6,12],[48,10],[50,14],[49,38],[8,41],[5,38]],'c');g.rect(10,15,36,22,'f');g.line(10,15,44,14,'e',1);for(const [x,y,w]of [[14,20,25],[14,26,19],[14,32,23]])g.line(x,y,x+w,y,'b',1);for(const [x,y]of [[7,15],[47,36]])bolt(g,x,y);});
  build('banner',36,58,(g,f)=>{wood(g,2,4,5,53);g.poly([[7,3],[33,7],[29,39],[21,33],[8,36]],'g');g.poly([[9,6],[30,9],[27,35],[21,30],[10,32]],'h');g.line(11,8,11,28,'i',1);g.rect(18,13,4,13,'f');g.line(15,19,24,19,'e',1);g.put(20,12,'j');});
  build('camp',48,44,(g,f)=>{g.ellipse(24,33,22,9,'a');g.ellipse(24,32,17,6,'l');for(let i=0;i<8;i++){const a=i*Math.PI/4,x=24+Math.cos(a)*18,y=33+Math.sin(a)*6;g.ellipse(x,y,4,3,'p');g.line(x-2,y-1,x+1,y-1,'r',1);}g.line(15,35,34,30,'b',4);g.line(16,29,33,35,'c',3);const s=f===1?2:f===3?-2:0;g.poly([[16,32],[13,23],[18,16],[20,22],[25+s,6],[29,17],[35,24],[32,32]],'h');g.poly([[20,31],[19,23],[23,18],[26+s,12],[29,23],[31,28],[27,33]],'d');g.line(24,24,24,31,'f',2);});
  build('fence',56,34,g=>{for(const x of [4,47]){wood(g,x,4,6,29);g.poly([[x-1,5],[x+3,1],[x+7,5]],'d');}wood(g,4,12,49,5);wood(g,4,24,49,4);g.line(11,15,45,14,'d',1);for(const x of [8,49]){bolt(g,x,14);bolt(g,x,25);}});
  build('stump',48,36,g=>{g.poly([[8,13],[38,13],[40,29],[46,32],[35,33],[28,29],[12,32],[2,31],[8,26]],'a');g.rect(10,14,26,15,'b');for(const x of [13,22,31])g.line(x,15,x-1,28,'c',2);g.ellipse(24,12,20,8,'a');g.ellipse(24,11,18,7,'d');g.ellipse(24,11,13,5,'b');g.ellipse(24,11,10,4,'e');g.ellipse(24,11,6,2,'c');g.line(28,11,37,7,'b',1);g.ellipse(5,29,4,2,'m');});
  build('stone',44,68,g=>{g.poly([[4,62],[5,19],[14,5],[29,9],[38,23],[40,62]],'a');g.poly([[8,59],[9,21],[16,9],[27,13],[34,24],[34,57]],'p');g.poly([[10,23],[17,10],[26,14],[22,49],[11,53]],'q');g.line(16,14,20,15,'r',2);g.line(29,29,25,34,'a',1);g.line(25,34,28,42,'a',1);g.line(20,24,20,43,'f',2);g.line(14,32,28,32,'f',2);g.ellipse(12,60,8,3,'m');g.ellipse(30,60,8,3,'l');g.line(10,59,13,59,'n',1);});
  build('practice',64,60,g=>{wood(g,28,9,8,49);wood(g,6,25,52,6);g.ellipse(32,15,15,15,'a');g.ellipse(31,14,13,13,'d');g.ellipse(29,11,9,8,'e');g.line(25,11,25,16,'b',2);g.line(38,11,38,16,'b',2);g.line(28,23,36,23,'c',1);g.line(19,17,22,19,'c',1);g.line(43,17,40,19,'c',1);g.rect(21,31,23,11,'b');g.line(24,34,39,34,'e',1);g.line(28,39,34,39,'h',2);});
  build('bridgePlank',12,32,g=>{wood(g,1,0,10,32);g.line(5,3,5,28,'c',1);g.line(7,5,7,15,'d',1);g.put(6,22,'a');g.put(6,2,'e');g.put(6,29,'e');});
  build('rootGate',128,64,g=>{
    const roots=[[[5,59],[21,37],[26,15],[35,4]],[[26,59],[46,39],[57,7]],[[52,59],[75,36],[78,10]],[[81,59],[102,40],[112,21]]];
    g.line(9,56,119,56,'a',11);g.line(10,54,118,54,'b',7);g.line(17,52,113,52,'c',2);
    for(const root of roots)for(let i=1;i<root.length;i++){g.line(...root[i-1],...root[i],'a',10-i);g.line(root[i-1][0]-1,root[i-1][1]-1,root[i][0]-1,root[i][1]-1,'b',7-i);g.line(root[i-1][0]-2,root[i-1][1]-2,root[i][0]-2,root[i][1]-2,'d',1);}
    for(const [x,y]of [[28,18],[63,39],[99,43]]){g.ellipse(x,y,5,3,'l');g.ellipse(x-1,y-1,3,2,'m');g.put(x-1,y-2,'n');}
  });
  build('culvert',36,42,g=>{g.ellipse(18,24,16,17,'a');g.ellipse(18,23,14,15,'p');g.ellipse(18,25,10,12,'k');g.ellipse(18,28,7,8,'l');for(const [x,y]of [[8,14],[15,9],[25,13]]){g.ellipse(x,y,4,4,'q');g.line(x-2,y-2,x+1,y-2,'r',1);}g.line(8,39,29,39,'b',2);g.put(10,35,'s');g.put(13,37,'t');});
})();
