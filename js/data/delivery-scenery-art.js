/* Rain-worn river furniture and warm quay houses, authored in joined pixels. */
"use strict";
(() => {
  const A=G.authoredPixelArt,S=G.deliveryScenery={},pal={k:'#2c3d42',a:'#3b514d',b:'#58705c',c:'#7d946f',d:'#a9b58b',e:'#493f3c',f:'#76574d',g:'#a77b60',h:'#ceac7c',i:'#e9d0a1',j:'#fae6b4',l:'#526a74',m:'#7d9299',n:'#b2bdb3',o:'#586a80',p:'#8195a8',q:'#b0bdc5',r:'#895e66',s:'#b87f7d',t:'#e0ad90',u:'#6b958d'};
  const build=(id,w,h,fn)=>S[id]=A.compactSprite(A.authored(w,h,pal,fn));
  function timber(g,x,y,w,h){g.rect(x,y,w,h,'e');g.rect(x+1,y+1,w-2,h-2,'f');g.line(x+2,y+2,x+2,y+h-3,'g',1);if(w>12)g.line(x+4,y+2,x+w-4,y+2,'h',1);}
  build('willow',124,112,(g,f)=>{
    const sway=f===1?1:f===3?-1:0;g.poly([[54,110],[57,78],[53,53],[65,48],[69,77],[70,104],[82,111],[68,110],[62,106],[49,112],[43,110]],'e');g.poly([[56,106],[60,79],[57,55],[63,52],[65,78],[66,104],[73,108],[62,104]],'f');g.line(60,65,61,100,'g',2);g.line(64,83,65,103,'h',1);g.line(59,68,35,49,'e',5);g.line(59,66,35,48,'g',2);g.line(65,69,90,48,'e',5);g.line(65,68,88,49,'f',3);g.ellipse(61,88,3,4,'e');g.put(61,86,'g');
    for(const [i,[x,y,rx,ry]]of [[30,43,25,21],[58,25,27,21],[87,33,25,22],[99,54,22,18],[25,65,22,16],[64,52,30,24]].entries()){
      g.ellipse(x,y,rx,ry,'k');g.ellipse(x-1,y-2,rx-1,ry-2,'a');g.ellipse(x-2,y-4,rx-3,ry-4,'b');g.ellipse(x-7,y-ry+8,Math.max(5,rx-10),5,'c');g.line(x-9,y-ry+5,x-4,y-ry+4,'d',1);g.ellipse(x+rx-7,y+6,5,6,'a');
      for(let j=0;j<4;j++){const xx=x-rx+7+j*10+sway,yy=y+ry-8,len=13+(i+j)%3*5;g.line(xx,yy,xx-2,yy+len,'a',3);g.line(xx-1,yy,xx-3,yy+len-2,'b',1);for(let z=2;z<len;z+=5){g.ellipse(xx-3,yy+z,3,2,'b');g.put(xx-4,yy+z-1,'c');}}
    }
  });
  build('reed',52,42,(g,f)=>{for(let i=0;i<6;i++){const x=5+i*8,y=12+(i%3)*5,s=f===1?1:f===3?-1:0;g.line(x,40,x+s,y,'a',2);g.line(x,39,x+s,y+3,'c',1);g.line(x,34,x-5,25,'b',2);g.line(x,32,x+5,22,'b',2);g.ellipse(x+s,y-3,3,7,'e');g.ellipse(x+s-1,y-4,2,5,'g');g.put(x+s-1,y-7,'h');}});
  for(const on of [false,true])build(on?'lampOn':'lampOff',36,76,(g,f)=>{
    timber(g,16,27,5,48);g.rect(14,67,9,6,'l');g.line(15,68,20,68,'n',1);g.ellipse(18,10,4,5,'e');g.ellipse(18,9,2,3,'g');g.poly([[3,15],[33,15],[29,41],[7,41]],'e');g.poly([[7,18],[29,18],[26,38],[10,38]],on?'h':'l');g.poly([[9,20],[15,20],[15,35],[11,35]],on?'j':'m');g.line(22,20,23,35,on?'i':'n',1);g.rect(4,13,29,4,'g');g.line(7,14,30,14,'h',1);g.rect(7,39,23,4,'g');g.line(9,40,27,40,'h',1);g.line(18,17,18,39,'f',2);if(on){const s=f===1?1:f===3?-1:0;g.poly([[19,34],[20+s,25],[23,30],[24,35]],'j');}
  });
  for(const open of [false,true])build(open?'gateOpen':'gateClosed',32,124,g=>{for(const y of [4,92]){g.rect(9,y,15,25,'k');g.rect(11,y+2,11,20,'l');g.rect(10,y+1,13,5,'n');g.rect(12,y+7,2,13,'m');g.ellipse(17,y+18,3,3,'e');g.put(16,y+17,'h');}if(!open){for(let i=0;i<11;i++){const y=27+i*6,x=16-Math.round(Math.sin(i/10*Math.PI)*6);g.ellipse(x,y,3,4,'e');g.ellipse(x,y,2,3,'h');g.line(x,y-1,x,y+1,'e',1);}timber(g,9,56,14,17);g.ellipse(16,63,3,4,'h');g.rect(15,63,2,6,'e');}});
  for(const sail of [false,true])build(sail?'boat':'wreck',124,64,g=>{g.poly([[5,42],[116,42],[99,62],[28,62]],'k');g.poly([[10,44],[109,44],[97,57],[31,57]],'f');g.line(18,47,103,47,'g',2);g.line(29,54,96,54,'e',1);for(const x of [35,60,85])timber(g,x,38,6,17);timber(g,75,9,4,43);if(sail){g.poly([[79,8],[113,36],[80,36]],'e');g.poly([[81,11],[108,34],[81,34]],'i');g.line(84,17,102,32,'j',1);g.line(82,35,105,35,'g',1);}else{g.line(42,48,48,43,'k',2);g.line(48,43,54,48,'k',2);g.rect(51,50,8,5,'k');}for(const x of [21,98]){g.ellipse(x,47,2,2,'e');g.put(x,46,'h');}});
  build('drain',36,30,g=>{g.ellipse(18,15,17,13,'k');g.ellipse(18,14,15,11,'l');g.ellipse(18,15,11,9,'k');for(const x of [10,18,26]){g.line(x,7,x,23,'m',2);g.line(x-1,7,x-1,20,'n',1);}g.ellipse(7,25,5,2,'a');});
  build('satchel',28,26,g=>{g.line(7,10,9,3,'e',3);g.line(9,3,20,3,'e',3);g.line(20,3,22,10,'e',3);timber(g,3,10,23,15);g.rect(5,11,19,7,'i');g.line(6,12,21,12,'j',1);g.rect(13,11,3,13,'s');g.rect(11,16,7,4,'h');g.put(13,17,'e');});
  build('milepost',48,62,g=>{timber(g,22,24,6,37);timber(g,3,6,42,30);g.rect(7,9,34,23,'i');for(const [y,w]of [[14,25],[20,20],[26,23]])g.line(11,y,11+w,y,'f',1);g.put(7,10,'h');g.put(40,30,'h');});
  build('well',72,76,g=>{g.ellipse(36,62,29,12,'k');g.rect(7,50,58,14,'l');for(const x of [13,27,43,56])g.line(x,53,x,65,'m',1);g.ellipse(36,49,29,11,'n');g.ellipse(36,50,23,7,'k');g.ellipse(36,51,19,4,'l');g.line(18,44,31,42,'q',1);for(const x of [4,63])timber(g,x,9,6,52);timber(g,0,7,72,6);g.line(34,12,34,48,'h',1);g.poly([[28,43],[43,43],[40,53],[31,53]],'f');g.line(29,43,42,43,'h',1);});
  build('bunting',208,58,g=>{for(let x=0;x<207;x++)g.put(x,12+Math.round(Math.sin(x/207*Math.PI)*13),'f');for(let i=0;i<9;i++){const x=14+i*22,y=12+Math.round(Math.sin(x/207*Math.PI)*13);g.poly([[x,y],[x+14,y+1],[x+7,y+16]],'e');g.poly([[x+2,y+2],[x+12,y+2],[x+7,y+12]],['h','s','c'][i%3]);g.line(x+3,y+3,x+5,y+7,['i','t','d'][i%3],1);}});
  build('flowerbed',52,38,g=>{timber(g,2,27,48,10);g.rect(5,28,42,3,'e');for(let i=0;i<7;i++){const x=7+i*6,y=14+i%2*4;g.line(x,30,x,y,'b',1);g.ellipse(x-2,y+7,3,1,'c');g.ellipse(x,y,4,4,i%2?'r':'g');g.ellipse(x-1,y-1,3,3,i%2?'s':'h');g.put(x,y,i%2?'i':'j');}});
  build('bench',52,42,g=>{for(const x of [7,43])timber(g,x,11,5,30);timber(g,2,8,48,9);timber(g,4,27,46,6);g.line(8,11,44,11,'h',1);g.line(10,29,43,29,'g',1);});
  for(const kind of ['bakery','letterHouse','birthdayHouse'])for(const warm of [false,true])build(kind+(warm?'Warm':'Cold'),132,152,(g,f)=>{
    const blue=kind==='letterHouse',rose=kind==='birthdayHouse',roof=blue?'o':rose?'r':'f',roofLight=blue?'p':rose?'s':'g';
    if(kind==='bakery'){g.rect(96,8,15,39,'e');g.rect(99,12,9,34,'l');g.rect(94,7,19,6,'n');for(const y of [21,32])g.line(99,y,107,y,'m',1);}
    g.poly([[20,65],[111,65],[115,140],[20,140]],'e');g.rect(24,68,84,70,blue?'m':'i');
    for(let y=75;y<135;y+=13){g.line(25,y,107,y,'g',1);for(let x=30+(y%26?12:0);x<102;x+=24)g.line(x,y-11,x,y-2,blue?'n':'h',1);}
    for(const x of [20,63,107])timber(g,x,65,5,76);timber(g,20,134,93,6);
    g.poly([[3,69],[17,54],[56,18],[68,16],[112,52],[128,69]],'k');g.poly([[8,65],[22,54],[57,23],[67,21],[108,53],[122,65]],roof);
    for(let row=0;row<7;row++){const y=29+row*5,left=54-row*6,right=74+row*6;g.line(left,y,right,y,roofLight,3);for(let x=left+3+(row%2)*5;x<right-2;x+=10)g.line(x,y-1,x+6,y-1,blue?'q':rose?'t':'h',1);}
    timber(g,7,66,116,5);g.ellipse(63,49,8,8,'e');g.ellipse(63,49,6,6,blue?'q':'h');g.line(58,49,68,49,'f',1);g.line(63,44,63,54,'f',1);
    g.poly([[79,137],[78,100],[83,92],[96,92],[101,101],[101,138]],'e');g.poly([[82,136],[82,102],[86,96],[94,96],[98,103],[98,136]],blue?'o':rose?'u':'f');g.line(86,105,86,133,blue?'p':rose?'c':'g',1);g.ellipse(95,121,2,2,'h');g.rect(76,138,30,5,'l');g.line(78,138,103,138,'n',1);
    g.poly([[30,108],[30,84],[35,78],[51,78],[56,84],[56,108]],'e');g.rect(34,84,18,21,warm?'h':'l');g.line(36,85,36,102,warm?'j':'n',2);g.line(43,81,43,106,'f',2);g.line(34,95,52,95,'f',2);timber(g,27,108,31,4);
    if(kind==='bakery'){timber(g,27,117,29,10);g.ellipse(42,121,8,3,'h');g.line(37,118,38,121,'i',1);g.line(42,118,43,121,'i',1);g.poly([[19,112],[59,112],[64,118],[15,118]],'r');g.line(19,113,58,113,'s',1);timber(g,4,142,46,9);if(warm)for(const x of [12,25,38]){g.ellipse(x,141,6,4,'g');g.ellipse(x-1,140,5,3,'h');g.line(x-2,137,x-1,140,'i',1);}}
    if(blue){timber(g,105,121,7,30);g.poly([[99,122],[101,108],[119,108],[124,116],[122,123]],'e');g.rect(102,112,18,8,'o');g.line(105,113,116,113,'q',1);g.rect(106,116,10,1,'k');timber(g,104,142,27,5);if(warm){g.rect(107,140,12,7,'j');g.line(107,140,113,144,'g',1);g.line(118,140,113,144,'g',1);}}
    if(rose){for(const x of [26,56]){timber(g,x,83,5,23);g.line(x+1,86,x+3,100,'u',2);}g.rect(29,117,26,12,'u');g.line(31,119,52,126,'d',1);g.line(31,126,52,119,'d',1);if(warm){const x=39+(f===1?2:f===3?-2:0);g.poly([[x-13,145],[x-12,137],[x-5,134],[x+2,139],[x+9,138],[x+12,143],[x+4,148],[x-9,148]],'b');g.poly([[x-7,138],[x-6,127],[x,136]],'c');g.ellipse(x-7,148,3,3,'e');g.ellipse(x+6,148,3,3,'e');g.put(x+7,139,'j');}}
  });
  build('departure',84,30,g=>{timber(g,2,2,80,25);g.rect(6,5,72,19,'i');g.line(12,14,61,14,'f',2);g.poly([[58,8],[69,14],[58,20]],'f');g.put(6,6,'h');g.put(77,23,'h');});
  build('trailhead',84,68,g=>{for(const x of [14,65])timber(g,x,41,5,25);g.poly([[3,30],[65,28],[80,49],[15,51]],'e');g.poly([[8,32],[62,31],[73,47],[17,48]],'i');g.line(21,43,30,35,'u',2);g.line(30,35,45,44,'u',2);g.line(45,44,58,36,'u',2);g.ellipse(44,44,3,3,'s');timber(g,34,3,15,24);g.rect(37,6,9,15,'h');g.line(39,8,39,18,'j',2);});
})();
