/* A stitched-map home and small neighbours' cottages; no route data lives here. */
"use strict";
(()=>{
 const A=G.authoredPixelArt,S=G.homeScenery={},pal={k:'#30383c',a:'#53453f',b:'#785e4c',c:'#ab8460',d:'#d4b085',e:'#edd4a7',f:'#f8e6bd',g:'#715964',h:'#a37678',i:'#d4a091',j:'#41645d',l:'#779387',m:'#a8ba97',n:'#5b7180',o:'#90a4ac',p:'#c6cec5'};
 const build=(id,w,h,fn)=>S[id]=A.compactSprite(A.authored(w,h,pal,fn));
 function wood(g,x,y,w,h){g.rect(x,y,w,h,'a');g.rect(x+1,y+1,w-2,h-2,'b');g.line(x+2,y+2,x+2,y+h-3,'c',1);if(w>12)g.line(x+4,y+2,x+w-4,y+2,'d',1);}
 function window(g,x,y){g.ellipse(x,y,10,12,'a');g.rect(x-10,y,21,12,'a');g.ellipse(x,y,7,9,'d');g.rect(x-7,y,15,9,'d');g.line(x-5,y-4,x-5,y+6,'f',2);g.line(x,y-8,x,y+9,'b',2);g.line(x-7,y+1,x+7,y+1,'b',2);wood(g,x-13,y+11,27,4);}
 build('home',144,104,g=>{
  g.poly([[15,37],[127,37],[132,100],[12,100]],'a');g.rect(18,39,107,58,'e');for(let y=48;y<96;y+=12){g.line(19,y,124,y,'d',1);for(let x=27+(y%24?18:0);x<120;x+=32)g.line(x,y-8,x,y-1,'c',1);}for(const x of [14,76,124])wood(g,x,38,5,62);wood(g,12,95,120,6);
  g.rect(113,8,10,30,'a');g.rect(116,9,5,26,'o');g.rect(112,6,13,5,'n');
  g.poly([[1,42],[10,24],[26,11],[59,1],[95,4],[117,20],[143,42]],'k');g.poly([[6,38],[14,26],[29,15],[60,5],[94,8],[114,23],[136,38]],'g');for(let row=0;row<6;row++){const y=11+row*5,left=52-row*8,right=91+row*7;g.line(left,y,right,y,'h',3);for(let x=left+3+(row%2)*4;x<right-2;x+=9)g.line(x,y-1,x+5,y-1,'i',1);}wood(g,6,39,132,5);
  window(g,34,62);window(g,101,62);for(const x of [20,47,87,114]){wood(g,x,57,4,21);g.line(x+1,61,x+2,74,'l',1);}
  g.poly([[45,99],[45,70],[48,64],[63,64],[67,72],[67,99]],'a');g.poly([[49,97],[49,72],[52,68],[61,68],[64,74],[64,97]],'j');g.line(51,75,51,95,'l',1);g.ellipse(60,84,2,2,'d');g.rect(44,99,25,5,'n');g.line(45,100,66,100,'p',1);
  g.rect(54,48,15,9,'b');g.rect(56,50,11,5,'f');g.line(57,54,60,51,'l',1);g.line(60,51,64,54,'l',1);g.line(64,54,66,52,'l',1);
 });
 for(let v=0;v<4;v++)build('cottage'+v,84,84,g=>{
  const r=v===1?'n':v===2?'j':v===3?'b':'g',hi=v===1?'o':v===2?'l':v===3?'c':'h';
  if(v%2){g.rect(62,9,7,24,'a');g.rect(64,10,3,20,'o');g.rect(60,8,11,4,'n');}
  g.rect(14,37,57,44,'a');g.rect(18,40,49,38,'e');for(let y=48;y<77;y+=10)g.line(19,y,66,y,'d',1);for(const x of [14,66])wood(g,x,38,4,43);wood(g,14,77,57,5);
  const peak=v===2?30:43;g.poly([[2,40],[peak-5,6],[peak+4,6],[82,40]],'k');g.poly([[8,36],[peak-3,11],[peak+3,11],[75,36]],r);for(let y=17;y<35;y+=5){const spread=(y-8)*1.3;g.line(Math.max(12,peak-spread),y,Math.min(72,peak+spread),y,hi,3);for(let x=peak-spread+5;x<peak+spread-4;x+=9)g.line(x,y-1,x+4,y-1,v===1?'p':v===2?'m':'i',1);}wood(g,7,38,69,4);
  g.poly([[41,79],[41,57],[45,52],[56,52],[60,58],[60,79]],'a');g.poly([[45,77],[45,58],[48,55],[54,55],[57,59],[57,77]],'j');g.line(47,59,47,74,'l',1);g.put(54,68,'d');g.rect(39,80,24,4,'n');window(g,28,57);
  if(v===0||v===2){wood(g,16,70,24,7);for(const x of [22,31]){g.line(x,71,x,66,'j',1);g.ellipse(x,65,3,2,v===0?'h':'l');g.put(x-1,64,'e');}}
  if(v===3){wood(g,65,65,10,14);g.line(67,68,72,76,'d',1);g.line(72,68,67,76,'d',1);}
 });
 build('plot',32,32,g=>{g.rect(4,7,24,18,'c');g.rect(6,9,20,14,'b');for(const [x,y]of [[3,6],[26,6],[3,24],[26,24]])wood(g,x,y,3,7);g.line(6,9,25,9,'e',1);g.line(7,12,22,21,'d',1);g.line(22,12,7,21,'d',1);});
 build('bed',32,36,g=>{for(const x of [2,27])wood(g,x,2,4,32);wood(g,3,3,25,5);g.rect(5,9,22,24,'a');g.rect(6,10,20,21,'h');g.rect(7,10,18,6,'f');g.line(9,12,22,12,'e',1);g.rect(7,17,18,13,'l');g.line(8,18,22,27,'m',1);g.line(22,18,8,27,'m',1);g.put(15,23,'e');wood(g,2,31,29,4);});
 build('desk',32,42,g=>{for(const x of [3,25])wood(g,x,18,4,23);wood(g,1,15,30,9);g.poly([[5,16],[20,13],[23,20],[7,21]],'e');g.line(8,18,12,16,'l',1);g.line(12,16,16,18,'l',1);g.line(16,18,20,16,'l',1);g.ellipse(26,14,3,3,'n');g.line(27,12,29,6,'b',1);g.line(28,8,25,4,'f',2);g.line(27,9,26,6,'p',1);});
 build('shelf',32,44,g=>{wood(g,1,1,30,42);g.rect(5,5,22,33,'a');for(const y of [16,29,39])wood(g,3,y,26,3);for(const [x,y,h,c]of [[6,7,9,'l'],[11,6,10,'h'],[17,8,8,'c'],[22,6,10,'o'],[6,22,7,'h'],[11,20,9,'l']]){g.rect(x,y,4,h,c);g.put(x+1,y+2,'e');}g.ellipse(23,25,4,3,'d');g.line(20,24,25,24,'e',1);});
 for(const open of [false,true])build(open?'pantryEmpty':'pantryReady',32,32,g=>{wood(g,3,14,26,16);g.poly([[5,14],[9,7],[25,7],[29,15]],'a');g.poly([[7,13],[10,9],[24,9],[27,13]],open?'n':'h');g.line(9,12,25,12,'i',1);g.rect(6,17,20,9,'e');g.ellipse(16,21,5,4,'c');for(const [x,y]of [[14,19],[18,20],[16,23]])g.put(x,y,'a');if(!open){g.line(9,9,10,3,'a',2);g.line(10,3,23,3,'a',2);g.line(23,3,24,9,'a',2);}});
 build('window',48,36,g=>{wood(g,1,1,46,34);g.rect(6,5,36,24,'n');g.rect(8,6,31,20,'o');g.poly([[9,7],[21,7],[9,21]],'p');g.poly([[31,7],[39,7],[28,25],[20,25]],'p');g.line(24,4,24,29,'b',3);g.line(5,17,42,17,'b',2);wood(g,0,31,48,5);});
 build('rug',144,104,g=>{g.ellipse(72,53,70,49,'a');g.ellipse(72,51,68,47,'c');g.ellipse(72,51,64,43,'j');g.ellipse(72,51,60,39,'l');g.ellipse(72,51,55,34,'j');g.ellipse(72,51,52,31,'l');g.line(36,66,50,37,'m',3);g.line(50,37,70,58,'m',3);g.line(70,58,94,32,'m',3);g.line(94,32,111,53,'m',3);g.ellipse(70,58,4,4,'d');for(let x=20;x<125;x+=8){const y=51+Math.sqrt(Math.max(0,1-((x-72)/64)**2))*45;g.line(x,y,x,y+5,'d',1);}});
 build('doorMat',32,32,g=>{g.rect(1,3,30,26,'a');g.rect(3,5,26,22,'j');g.line(5,7,26,7,'m',1);g.line(5,25,26,25,'m',1);g.rect(15,10,2,8,'e');g.line(11,15,16,20,'e',2);g.line(16,20,21,15,'e',2);});
})();
