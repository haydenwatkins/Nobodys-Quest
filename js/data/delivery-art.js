/* Copper, wet wool, paper and flour. Characters are authored pixel grids. */
"use strict";
(() => {
  const art=G.authoredPixelArt;
  const colors={k:'#202b35',a:'#3b4650',b:'#705850',c:'#ac7d55',d:'#d5ab72',e:'#f5db9c',f:'#597b79',g:'#89a19a',h:'#d6d4b1',i:'#866376',j:'#c2918d',l:'#e7bba0',m:'#f5e3c5'};
  G.enemies.tollkeeper.sprite=art.compactSprite(art.authored(104,110,colors,(g,frame)=>{
    const bob=frame===1?1:frame===3?-1:0,lift=frame===2?12:0;
    // A bell head, a coat of old receipts, and two conspicuously different arms.
    g.line(40,80,35,103,'k',11);g.line(61,80,69,103,'k',11);
    g.line(39,83,34,101,'b',7);g.line(61,83,69,101,'c',7);
    g.rect(25,100,17,6,'k');g.rect(63,100,19,6,'k');g.rect(27,100,12,2,'d');g.rect(66,100,12,2,'d');
    g.poly([[30,42],[69,42],[74,72],[81,90],[66,86],[56,95],[44,86],[24,94],[29,71]],'k');
    g.poly([[33,45],[65,44],[67,72],[74,87],[64,82],[56,90],[46,82],[29,87]],'f');
    g.poly([[32,50],[42,50],[39,73],[33,83]],'g');g.poly([[59,49],[65,49],[67,74],[62,81]],'a');
    g.line(49,47,52,88,'d',2);
    for(let i=0;i<7;i++){const x=36+(i%3)*10,y=57+Math.floor(i/3)*11;g.poly([[x,y],[x+7,y-1],[x+6,y+10],[x-1,y+11]],i%2?'h':'m');g.line(x+1,y+3,x+4,y+3,'b');g.line(x+1,y+6,x+3,y+6,'c');}
    // Ledger shield: thick fore-edge, bent leather corners, hanging bookmark.
    g.line(34,49,17,64,'k',10);g.line(33,48,17,61,'c',6);
    g.poly([[5,51],[25,48],[29,77],[10,82]],'k');g.poly([[8,53],[22,51],[25,74],[11,78]],'i');
    g.line(22,52,26,75,'h',2);g.rect(13,58,7,1,'d');g.rect(14,61,6,1,'d');g.line(16,75,17,86,'j',2);
    // Lantern arm swings on a chain during the warning pose.
    g.line(65,47,82,58-lift,'k',10);g.line(66,47,83,57-lift,'c',6);
    g.line(83,56-lift,90,67-lift,'d',2);g.rect(83,66-lift,16,19,'k');g.rect(85,69-lift,12,13,'d');g.rect(88,70-lift,6,10,'e');g.line(90,69-lift,90,82-lift,'c');g.rect(82,64-lift,18,3,'b');g.rect(84,85-lift,14,3,'b');
    // Crown bolts and the hollow bell opening read at gameplay scale.
    g.poly([[39,12+bob],[60,12+bob],[64,29+bob],[72,39+bob],[28,39+bob],[36,29+bob]],'k');
    g.poly([[41,15+bob],[57,15+bob],[60,30+bob],[67,36+bob],[33,36+bob],[39,29+bob]],'c');
    g.line(43,17+bob,40,31+bob,'e',2);g.line(55,17+bob,58,31+bob,'d',2);
    g.ellipse(49,37+bob,19,4,'k');g.line(33,38+bob,65,38+bob,'d',2);g.rect(48,35+bob,4,9,'e');
    g.rect(43,25+bob,4,3,'k');g.rect(54,25+bob,4,3,'k');g.rect(44,26+bob,2,1,'e');g.rect(55,26+bob,2,1,'e');
    g.rect(47,6+bob,6,7,'b');g.rect(45,6+bob,10,3,'d');
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
