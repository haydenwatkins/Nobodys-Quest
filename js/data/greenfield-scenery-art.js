/* Greenfield's resting places and thresholds; native tiles remain authoritative. */
"use strict";
(() => {
  const A=G.authoredPixelArt,S=G.greenfieldScenery={};
  const pal={k:'#30413f',a:'#526365',b:'#788b88',c:'#acb6a4',d:'#dad8b8',e:'#51483d',f:'#7e674c',g:'#ac9065',h:'#d2b582',i:'#426250',j:'#658264',l:'#95a677',m:'#41646d',n:'#71939a',o:'#adc1ba',p:'#735f6d',q:'#a27d80',r:'#cb9e88'};
  const build=(id,w,h,fn)=>S[id]=A.compactSprite(A.authored(w,h,pal,fn));
  const wood=(g,x,y,w,h)=>{g.rect(x,y,w,h,'e');g.rect(x+1,y+1,w-2,h-2,'f');g.line(x+2,y+2,x+w-3,y+2,'g',1);g.put(x+3,y+3,'h');};
  build('rock',32,32,(g,v)=>{g.poly([[3,29],[2,17],[8,8],[19,4],[28,15],[30,29]],'k');g.poly([[5,27],[4,18],[10,10],[18,7],[25,16],[27,27]],'a');g.poly([[5,18],[11,10],[18,7],[25,16],[18,21]],'b');g.line(11,11,18,8,'c',1);g.line(18,21,24,23,'k',1);g.poly([[3,28],[7,23],[12,26],[17,24],[20,29]],'i');g.line(5,26,8,25,'j',1);g.put(10+v*3,26,'l');g.line(9,18,13,20,'a',1);});
  for(const awake of [false,true])build(awake?'postAwake':'postSleeping',32,48,g=>{wood(g,14,20,5,28);g.line(15,28,15,43,'g',1);wood(g,1,3,30,25);g.rect(4,6,24,19,awake?'d':'b');g.line(6,8,25,8,awake?'h':'c',1);g.line(7,22,11,12,awake?'i':'a',2);g.line(11,12,17,20,awake?'i':'a',2);g.line(17,20,24,12,awake?'i':'a',2);g.ellipse(17,20,2,2,awake?'g':'c');g.rect(26,30,5,8,'e');g.rect(27,31,3,6,awake?'h':'n');g.line(29,29,29,31,'e',1);});
  const steps={forestStep:['f','g','i'],marshStep:['a','n','m'],emberStep:['e','r','f'],groveStep:['p','c','i'],starStep:['a','o','p'],coastStep:['a','b','n'],prairieStep:['f','h','j'],titanStep:['k','a','r'],orchardStep:['e','g','q']};
  for(const [id,[base,hi,edge]]of Object.entries(steps))build(id,32,20,(g,v)=>{
    g.poly([[0,4],[4,1],[28,1],[31,4],[30,18],[2,18]],'k');g.rect(3,4,26,12,base);for(const y of [4,9,14]){g.line(4,y,27,y,hi,1);g.line(11+(y%2)*4,y+1,11+(y%2)*4,y+3,'k',1);}g.line(3,17,29,17,edge,1);g.put(7,6,'d');g.put(24,15,hi);
    if(id==='forestStep'||id==='groveStep'||id==='prairieStep'){g.line(0,17,4,12,'i',1);g.ellipse(4,12,3,2,'j');g.put(3,11,'l');}if(id==='orchardStep'){g.ellipse(27,4,3,3,'q');g.line(27,2,28,0,'i',1);}if(id==='coastStep'){g.poly([[1,14],[3,10],[6,14],[5,17],[2,17]],'c');g.put(3,12,'d');}if(id==='titanStep')g.line(21,6,25,12,'r',1);
    if(v%2){g.line(1,7,30,7,'g',2);g.line(2,6,29,6,'h',1);g.rect(12,7,8,11,'k');g.rect(14,12,4,4,'h');g.line(14,12,14,9,'h',1);g.line(14,9,17,9,'h',1);g.line(17,9,17,12,'h',1);}
  });
  build('dungeonGate',48,36,(g,v)=>{g.poly([[1,35],[1,13],[8,4],[17,0],[31,0],[40,4],[47,13],[47,35]],'k');g.poly([[4,34],[4,14],[11,7],[18,4],[30,4],[37,7],[44,14],[44,34]],'a');g.line(7,14,12,9,'b',2);g.line(17,5,30,5,'c',1);g.line(42,17,42,30,'b',2);for(const [x,y]of [[5,22],[12,8],[32,8],[36,25]]){g.line(x,y,x+7,y,'k',1);g.put(x+2,y-1,'b');}g.poly([[14,35],[14,16],[18,11],[29,11],[34,16],[34,35]],'k');g.line(15,16,19,12,'b',1);g.line(32,17,32,32,'a',1);g.ellipse(5,7,5,3,'i');g.ellipse(11,3,5,2,'j');g.ellipse(39,5,5,3,'i');g.put(8,5,'l');if(v%2){for(const x of [16,23,30])g.line(x,16,x,35,'b',2);g.rect(20,23,8,9,'k');g.rect(22,25,4,5,'h');g.line(22,25,22,22,'h',1);g.line(22,22,25,22,'h',1);g.line(25,22,25,25,'h',1);}});
})();
