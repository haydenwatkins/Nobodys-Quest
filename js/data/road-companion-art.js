/* First road companions: authored clothing and tools, stable native IDs. */
'use strict';
(()=>{
 const A=G.authoredPixelArt;
 function make(id){
  const skin=id==='pebble'?'#efd1ac':id==='parcel'?'#bb8467':'#b88570';
  const coat=id==='pebble'?'#617e94':id==='parcel'?'#ad7158':'#708589';
  const p={k:'#35413e',a:'#e5be7c',b:'#536259',c:coat,d:'#efead0',e:'#bdd2cb',f:skin,g:'#936b53',h:'#cfac83',i:'#7e969b',j:'#cbd4c5',l:'#64847b',m:'#aac0a0',n:'#dfa3a0',o:'#496374',q:'#7594a5',r:'#8b6653'};
  const s=A.compactSprite(A.authored(36,44,p,(g,frame)=>{
   const bob=frame===1?1:0,work=frame===2,cx=18,head=13-bob,hip=34-bob;
   const stroke=(x,y,xx,yy,c,w=3)=>{g.line(x,y,xx,yy,'k',w+2);g.line(x,y,xx,yy,c,w);};
   for(const [x,step]of [[13,frame===1?-2:0],[23,frame===1?2:0]]){stroke(x,hip,x+step,40,'o',3);g.ellipse(x+step,41,4,2,'k');g.line(x+step-2,40,x+step+2,40,'h',1);}
   // Cloth and armour share joined shoulders, hips and a closed hem.
   g.poly([[10,23-bob],[26,23-bob],[30,34-bob],[24,37-bob],[12,37-bob],[6,34-bob]],'k');
   g.poly([[11,24-bob],[25,24-bob],[27,33-bob],[23,35-bob],[13,35-bob],[9,33-bob]],'c');
   g.line(11,26-bob,10,32-bob,id==='pending'?'j':'q',2);g.line(25,26-bob,26,32-bob,'b',1);
   g.line(cx,26-bob,cx,34-bob,'a',1);g.put(cx+1,29-bob,'d');
   const hands=id==='parcel'?[[10,31-bob],[26,31-bob]]:id==='pebble'?[[8,work?26:32-bob],[28,32-bob]]:[[7,32-bob],[30,31-bob]];
   for(const [i,[x,y]]of hands.entries()){stroke(i?26:10,25-bob,x,y,'c',3);g.ellipse(x,y,2,2,'f');}
   if(id==='pebble'){
    // A bound notebook rests in the guide's hand; the coat carries its badge.
    const by=work?26:32-bob;g.poly([[3,by-5],[10,by-6],[12,by+5],[4,by+6]],'k');g.poly([[4,by-4],[9,by-5],[10,by+4],[5,by+5]],'o');g.line(6,by-3,6,by+3,'a',1);g.ellipse(9,by,2,2,'f');
    g.ellipse(23,28-bob,2,2,'a');g.put(23,28-bob,'d');
   }else if(id==='parcel'){
    // Strap and pouch join the shoulder and hip, with a parcel held by both hands.
    g.line(12,23-bob,24,34-bob,'k',4);g.line(12,23-bob,24,34-bob,'a',2);
    g.rect(23,31-bob,8,6,'k');g.rect(24,32-bob,6,4,'r');g.line(24,32-bob,29,32-bob,'h',1);
    const y=work?27:31-bob;g.rect(10,y-3,16,9,'k');g.rect(11,y-2,14,7,'h');g.line(18,y-2,18,y+4,'d',2);g.line(11,y+1,24,y+1,'a',1);g.ellipse(10,y+1,2,2,'f');g.ellipse(26,y+1,2,2,'f');
   }else{
    // A small ceremonial blade stays in the grip, with fitted shoulder plates.
    g.ellipse(10,25-bob,4,3,'k');g.ellipse(10,24-bob,3,2,'i');g.ellipse(26,25-bob,4,3,'k');g.ellipse(26,24-bob,3,2,'i');
    const hx=30,hy=31-bob;stroke(hx,hy,work?34:32,work?19:15,'i',2);g.line(hx,hy-1,work?34:32,work?19:16,'d',1);g.line(hx-3,hy-2,hx+3,hy-2,'a',2);g.ellipse(hx,hy,2,2,'f');
    g.line(12,29-bob,24,29-bob,'j',1);g.rect(16,32-bob,4,3,'a');
   }
   // Large friendly faces with two eyes and visible cheeks; ears are attached.
   g.ellipse(9,head+2,3,4,'k');g.ellipse(27,head+2,3,4,'k');g.ellipse(9,head+2,2,3,'f');g.ellipse(27,head+2,2,3,'f');
   g.ellipse(cx,head,10,11,'k');g.ellipse(cx,head,9,10,'f');g.ellipse(cx-3,head-3,6,5,'h');
   if(id==='pebble'){
    g.poly([[8,head-2],[8,head-8],[13,head-12],[19,head-13],[27,head-8],[28,head-2],[24,head-4],[19,head-8],[15,head-5]],'k');
    g.poly([[10,head-3],[10,head-7],[14,head-10],[19,head-11],[25,head-7],[26,head-3],[23,head-5],[19,head-8],[15,head-6]],'j');g.line(12,head-7,17,head-9,'d',2);
   }else if(id==='parcel'){
    g.poly([[8,head-4],[11,head-12],[24,head-12],[28,head-4]],'k');g.poly([[10,head-5],[13,head-10],[23,head-10],[26,head-5]],'l');g.line(9,head-4,29,head-4,'a',2);g.rect(20,head-9,3,3,'d');
   }else{
    g.poly([[8,head-4],[10,head-10],[18,head-12],[26,head-10],[28,head-4]],'k');g.poly([[10,head-5],[12,head-9],[18,head-10],[24,head-9],[26,head-5]],'i');g.line(10,head-4,26,head-4,'j',2);g.line(cx,head-9,cx,head-5,'d',1);
    g.line(9,head+1,11,head+7,'i',3);g.line(27,head+1,25,head+7,'i',3);
   }
   for(const x of [13,21]){g.rect(x,head,2,3,'k');g.put(x,head,'d');}g.put(10,head+4,'n');g.put(26,head+4,'n');g.line(16,head+7,20,head+7,'g',1);
   g.line(12,head+10,24,head+10,id==='parcel'?'a':'e',2);
  }));
  s.integratedEquipment=true;s.animations.work=[2,3,2,0];s.hd.animations.work=[2,3,2,0];return s;
 }
 for(const id of ['pebble','parcel','pending'])G.NPCS[id].sprite=make(id);
 G.roadCompanionArtIds=['pebble','parcel','pending'];
 const aliases={'PEBBLE':'pebble','PARCEL':'parcel','COURIER PARCEL':'parcel','SER PENDING':'pending','SIR PENDING':'pending'};
 G.roadCompanionSpeaker=speaker=>{
  const name=String(speaker||'').toUpperCase().replace(/^[^A-Z0-9]+/,'');
  for(const [alias,id]of Object.entries(aliases))if(name===alias||name.startsWith(alias+' ·')||name.startsWith(alias+',')||name.startsWith(alias+' '))return G.NPCS[id];
  return null;
 };
})();
