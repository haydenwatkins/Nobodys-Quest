/* Mayor Maybe: a round civic organiser with fitted glasses and a held agenda. */
'use strict';
(()=>{
 const A=G.authoredPixelArt,p={k:'#35413e',a:'#e5bc7c',b:'#7d5d70',c:'#ad8592',d:'#f0e7cf',e:'#c7d4c2',f:'#bb876d',g:'#865f4b',h:'#d9ad87',i:'#627e77',j:'#96afa1',l:'#728b92',m:'#aac0c6',n:'#dca49f',o:'#496574'};
 const s=A.compactSprite(A.authored(36,44,p,(g,frame)=>{
  const bob=frame===1?1:0,head=13-bob,work=frame===2,wave=frame===3;
  const limb=(x,y,xx,yy,c,w=3)=>{g.line(x,y,xx,yy,'k',w+2);g.line(x,y,xx,yy,c,w);};
  for(const [x,dx]of [[13,frame===1?-2:0],[23,frame===1?2:0]]){limb(x,34-bob,x+dx,40,'o');g.ellipse(x+dx,41,4,2,'k');g.line(x+dx-2,40,x+dx+2,40,'h',1);}
  g.ellipse(18,30-bob,12,10,'k');g.ellipse(18,29-bob,11,9,'b');g.line(9,29-bob,10,35-bob,'c',2);g.line(27,29-bob,26,35-bob,'g',1);
  g.poly([[11,23-bob],[25,23-bob],[23,34-bob],[13,34-bob]],'d');
  g.poly([[10,24-bob],[15,26-bob],[18,36-bob],[11,35-bob]],'i');g.poly([[26,24-bob],[21,26-bob],[18,36-bob],[25,35-bob]],'i');
  g.line(12,27-bob,14,32-bob,'j',1);for(const y of [29,33])g.ellipse(18,y-bob,1,1,'a');g.ellipse(23,29-bob,2,2,'a');g.put(23,28-bob,'d');
  limb(9,25-bob,7,31-bob,'b');g.ellipse(7,31-bob,2,2,'f');
  const bx=6,by=28-bob;g.rect(bx-3,by-4,11,14,'k');g.rect(bx-2,by-3,9,12,'g');g.rect(bx-1,by-2,7,9,'d');g.rect(bx+1,by-4,3,3,'a');g.line(bx,by+2,bx+4,by+2,'l',1);g.line(bx,by+5,bx+3,by+5,'l',1);g.ellipse(7,31-bob,2,2,'f');
  const hx=wave?32:work?16:29,hy=wave?17:work?29-bob:32-bob;
  if(work){limb(27,25-bob,25,31-bob,'b');limb(25,31-bob,hx,hy,'b');}else limb(27,25-bob,hx,hy,'b');
  g.ellipse(hx,hy,2,3,'f');if(work){g.line(hx,hy-2,12,by+2,'a',1);g.put(12,by+2,'k');}if(wave)g.line(hx,hy-3,hx,hy+1,'h',1);
  // Ear rims, side curls and a soft moustache share the rounded face.
  for(const x of [8,28]){g.ellipse(x,head+2,3,4,'k');g.ellipse(x,head+2,2,3,'f');}
  g.ellipse(18,head,10,11,'k');g.ellipse(18,head,9,10,'f');g.ellipse(15,head-3,6,5,'h');
  g.poly([[8,head-3],[9,head-8],[14,head-11],[22,head-11],[27,head-7],[28,head-2],[25,head-4],[23,head-7],[13,head-7],[11,head-2]],'g');g.line(11,head-7,14,head-9,'h',2);g.line(24,head-7,26,head-5,'a',1);
  for(const x of [13,23]){g.ellipse(x,head+1,4,4,'k');g.ellipse(x,head+1,3,3,'a');g.ellipse(x,head+1,2,2,'f');g.put(x,head+1,'k');g.put(x-1,head,'d');}g.line(17,head+1,19,head+1,'a',1);
  g.put(9,head+5,'n');g.put(27,head+5,'n');g.ellipse(15,head+7,3,1,'g');g.ellipse(21,head+7,3,1,'g');g.line(16,head+9,20,head+9,'h',1);
 }));s.integratedEquipment=true;s.animations.work=[2,3,2,0];s.hd.animations.work=[2,3,2,0];G.NPCS.mayorMaybe.sprite=s;G.civicCompanionArtIds=['mayorMaybe'];
})();
