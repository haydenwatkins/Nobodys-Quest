/* Copper, wet wool, paper and flour. Characters are authored pixel grids. */
"use strict";
(() => {
  const art=G.authoredPixelArt;
  const colors={k:'#202b35',a:'#3b4650',b:'#705850',c:'#ac7d55',d:'#d5ab72',e:'#f5db9c',f:'#597b79',g:'#89a19a',h:'#d6d4b1',i:'#866376',j:'#c2918d',l:'#e7bba0',m:'#f5e3c5'};
  const keeperColors={...colors,n:'#dfb590',o:'#b9c6ad',p:'#3e605f',q:'#b9a784',r:'#caaa79',s:'#765453'};
  G.enemies.tollkeeper.sprite=art.compactSprite(art.authored(104,110,keeperColors,(g,frame)=>{
    const bob=frame===1?1:frame===3?-1:0,lift=frame===2?15:0,cx=50,cy=34-bob;
    // The bronze river-otter's tail joins its hips beneath a fitted raincoat.
    g.poly([[59,79],[69,82],[81,92],[84,100],[79,104],[71,98],[65,90],[59,88]],'k');
    g.poly([[61,81],[68,85],[77,93],[81,99],[78,101],[72,95],[67,88],[61,86]],'c');g.line(70,90,77,98,'d',2);
    for(const [x,s]of [[37,-1],[64,1]]){g.line(x,85,x+s*(frame===1?2:0),101,'k',12);g.line(x,85,x+s*(frame===1?2:0),100,'b',8);g.ellipse(x+s*(frame===1?2:0),103,11,4,'k');g.ellipse(x+s*(frame===1?2:0)-1,101,9,3,'c');g.line(x-6,101,x+4,101,'d',1);}
    // Rounded shoulder/hem panels, a stitched pocket and receipts tucked inside.
    g.ellipse(cx,69-bob,28,29,'k');g.ellipse(cx,67-bob,26,27,'p');g.ellipse(cx-4,65-bob,21,23,'f');
    g.line(32,57-bob,29,81-bob,'g',3);g.line(70,57-bob,73,80-bob,'a',2);g.line(29,88-bob,70,88-bob,'g',2);
    g.poly([[36,49-bob],[49,60-bob],[48,73-bob],[35,60-bob]],'k');g.poly([[37,51-bob],[47,60-bob],[46,69-bob],[37,60-bob]],'g');
    g.poly([[64,49-bob],[51,60-bob],[52,73-bob],[65,60-bob]],'k');g.poly([[63,51-bob],[53,60-bob],[54,69-bob],[63,60-bob]],'g');
    g.line(50,62-bob,50,88-bob,'d',1);for(const y of [70,80]){g.ellipse(51,y-bob,2,2,'k');g.put(51,y-bob,'d');}
    for(const [x,y]of [[35,72],[60,74]]){g.rect(x-3,y-5-bob,8,11,'k');g.rect(x-2,y-4-bob,6,9,'m');g.line(x-1,y-1-bob,x+2,y-1-bob,'b',1);g.line(x-1,y+2-bob,x+1,y+2-bob,'c',1);g.rect(x-5,y+3-bob,13,10,'p');g.line(x-4,y+4-bob,x+6,y+4-bob,'g',1);g.put(x-3,y+10-bob,'o');g.put(x+5,y+10-bob,'o');}
    // Sleeves bend at rounded elbows. Both tools remain in an articulated grip.
    g.line(28,56-bob,19,68-bob,'k',13);g.line(19,68-bob,19,77-bob,'k',11);g.line(28,56-bob,19,68-bob,'g',9);g.line(19,68-bob,19,77-bob,'f',7);
    const hx=84,hy=72-lift-bob;g.line(72,56-bob,81,62-lift/2-bob,'k',13);g.line(81,62-lift/2-bob,hx,hy,'k',11);g.line(72,56-bob,81,62-lift/2-bob,'g',9);g.line(81,62-lift/2-bob,hx,hy,'f',7);
    g.ellipse(81,62-lift/2-bob,6,6,'k');g.ellipse(81,61-lift/2-bob,4,4,'c');
    // Bound leather ledger: page block, copper corner caps and a held fore-edge.
    const by=76-bob;g.poly([[5,by-18],[23,by-21],[29,by+14],[9,by+18]],'k');g.poly([[8,by-16],[22,by-18],[26,by+12],[11,by+15]],'i');
    g.line(22,by-17,25,by+12,'h',3);g.line(9,by-14,12,by+12,'s',1);g.rect(12,by-10,8,7,'c');g.line(13,by-8,18,by-8,'e',1);g.line(14,by-5,19,by-5,'e',1);
    for(const [x,y]of [[9,by-14],[13,by+12]])g.line(x,y,x+3,y-1,'d',2);g.ellipse(25,by+2,4,5,'k');g.ellipse(25,by+1,3,4,'c');g.line(25,by-1,25,by+2,'e',1);
    // A short chain leads from the paw to the lantern's real hinged handle.
    g.line(hx,hy,91,hy+6,'k',3);g.line(hx,hy,91,hy+6,'d',1);g.line(91,hy+6,91,hy+12,'d',1);
    g.poly([[83,hy+11],[99,hy+11],[101,hy+29],[97,hy+34],[85,hy+34],[81,hy+29]],'k');
    g.poly([[85,hy+14],[97,hy+14],[98,hy+28],[95,hy+31],[87,hy+31],[84,hy+28]],'c');g.rect(87,hy+15,9,14,'d');g.rect(90,hy+16,4,11,'e');g.line(91,hy+15,91,hy+29,'b',1);g.line(83,hy+12,99,hy+12,'d',2);g.line(85,hy+32,97,hy+32,'b',2);
    g.ellipse(hx,hy,5,5,'k');g.ellipse(hx,hy-1,4,4,'c');g.line(hx-2,hy-2,hx+1,hy-2,'e',1);
    // Riveted otter cheeks, small round ears and a warm, legible muzzle.
    for(const sign of [-1,1]){g.ellipse(cx+sign*17,cy-18,9,9,'k');g.ellipse(cx+sign*17,cy-19,7,7,'c');g.ellipse(cx+sign*17,cy-18,4,4,'b');g.put(cx+sign*17-2,cy-22,'e');}
    g.ellipse(cx,cy,24,23,'k');g.ellipse(cx,cy-1,22,21,'c');g.ellipse(cx-4,cy-5,17,16,'d');g.line(cx-12,cy-13,cx-7,cy-16,'e',2);
    for(const ex of [cx-9,cx+9]){g.ellipse(ex,cy-2,4,5,'k');g.put(ex-1,cy-4,'m');g.line(ex-4,cy-9,ex+3,cy-10,'b',2);}
    g.ellipse(cx,cy+9,16,10,'b');g.ellipse(cx,cy+7,15,9,'n');g.ellipse(cx-4,cy+5,8,5,'m');g.ellipse(cx,cy+3,5,3,'k');g.line(cx-2,cy+2,cx+1,cy+2,'d',1);
    g.line(cx,cy+6,cx,cy+10,'b',1);g.line(cx-4,cy+11,cx-1,cy+12,'b',1);g.line(cx+1,cy+12,cx+4,cy+11,'b',1);
    for(const sign of [-1,1]){g.line(cx+sign*12,cy+6,cx+sign*18,cy+4,'e',1);g.line(cx+sign*13,cy+10,cx+sign*19,cy+10,'d',1);g.put(cx+sign*18,cy-2,'b');}
    // A soft rolled rain hood sits against the head, with ear cutouts.
    g.poly([[34,cy-19],[38,cy-26],[57,cy-27],[67,cy-20],[64,cy-16],[35,cy-16]],'k');g.poly([[37,cy-20],[40,cy-24],[56,cy-25],[64,cy-20],[62,cy-18],[37,cy-18]],'p');g.line(37,cy-18,63,cy-18,'g',2);g.line(43,cy-23,54,cy-24,'o',1);
  }));
  for(const [id,coat,hat]of [['quayBaker','#99716c','chef'],['quayMara','#577a8b','shawl'],['quayPip','#ab7a59','cap']]){
    const pal={...colors,o:coat};
    G.NPCS[id].sprite=art.compactSprite(art.authored(42,48,pal,(g,f)=>{
      const bob=f===1?1:0,kid=id==='quayPip',cy=kid?26:20;
      g.line(17,37,16+(f===3?2:0),45,'k',4);g.line(25,37,26-(f===3?2:0),45,'k',4);
      g.poly([[13,cy+7],[28,cy+7],[30,40],[12,40]],'k');g.poly([[15,cy+8],[26,cy+8],[27,38],[15,38]],'o');
      g.line(13,cy+9,9,cy+17,'o',4);g.line(28,cy+9,32,cy+16,'o',4);g.ellipse(9,cy+18,2,2,'l');g.ellipse(32,cy+17,2,2,'l');
      g.ellipse(21,cy+bob,8,9,'k');g.ellipse(21,cy+bob,7,8,'l');g.poly([[14,cy-4+bob],[16,cy-9+bob],[24,cy-9+bob],[29,cy-2+bob],[23,cy-5+bob]],'b');
      g.rect(17,cy+bob,2,2,'k');g.rect(25,cy+bob,2,2,'k');g.line(20,cy+5+bob,23,cy+5+bob,'j');
      if(hat==='chef'){g.rect(14,cy-10,15,5,'h');for(const [x,y]of [[15,cy-12],[20,cy-15],[26,cy-12]])g.ellipse(x,y,5,5,'m');g.poly([[17,cy+9],[25,cy+9],[27,39],[15,39]],'h');g.line(18,33,24,33,'b');}
      if(hat==='shawl'){g.poly([[12,cy+6],[21,cy+11],[29,cy+6],[30,cy+15],[22,cy+17],[12,cy+13]],'i');g.line(15,cy+9,21,cy+13,'j',2);}
      if(hat==='cap'){g.poly([[13,cy-5],[17,cy-11],[25,cy-11],[29,cy-5]],'f');g.rect(12,cy-5,19,3,'g');}
    }));
  }
})();
