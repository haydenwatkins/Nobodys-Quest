/* Velvetwing and Vesper keep the dusk roads. Stable save IDs, footprints,
   attack indices and combat clocks; wings belong to the arms, never orbit. */
"use strict";
(() => {
  const A=G.authoredPixelArt;
  const palette={k:'#30293e',a:'#51415e',b:'#796078',c:'#a37d98',d:'#d4a8b8',e:'#f1d8c4',f:'#fff0d7',g:'#de9ba1',h:'#ad6077',i:'#773f61',j:'#bb7186',l:'#dbc4a8',m:'#8c716e',n:'#c29662',o:'#efce8a',p:'#697b87',q:'#a8c8c4'};
  function ear(g,x,y,scale=1){g.ellipse(x,y,3*scale,6*scale,'k');g.ellipse(x,y,2*scale,5*scale,'b');g.ellipse(x,y+1,scale,3*scale,'h');g.put(x-1,y-3*scale,'c');}
  function face(g,x,y,back,side,bite,large=false){
    const rx=large?11:8,ry=large?9:7;
    g.ellipse(x,y,rx,ry,'k');g.ellipse(x,y-1,rx-1,ry-1,'b');g.ellipse(x-2,y-3,rx-3,ry-3,'c');
    if(back){g.line(x-3,y+2,x+3,y+3,'a',1);g.put(x-4,y,'d');return;}
    const mx=side?x+4:x;
    g.ellipse(mx,y+3,large?8:side?5:6,large?5:4,'e');
    for(const ex of side?[x+3]:large?[x-5,x+4]:[x-4,x+3]){g.ellipse(ex,y,large?2:1,large?3:2,'a');g.put(ex,y-1,'f');}
    g.ellipse(mx+(side?2:0),y+3,large?3:2,1,'g');
    if(bite){g.ellipse(mx,y+6,large?4:3,2,'a');g.put(mx-2,y+5,'f');g.put(mx+2,y+5,'f');}
    else{g.line(mx-2,y+6,mx+2,y+6,'m',1);g.put(mx-2,y+5,'f');g.put(mx+2,y+5,'f');}
    g.put(x-6,y+3,'g');if(!side)g.put(x+6,y+3,'g');
  }
  function wing(g,cx,y,sign,spread,lift,large=false,back=false){
    const root=cx+sign*(large?7:5),tip=cx+sign*spread,lower=y+(large?17:13);
    const handY=y+lift;
    // Membrane runs from shoulder through the thumb, then scallops to the hip.
    g.poly([[root,y],[tip,handY],[tip-sign*2,lower-2],[tip-sign*5,lower-5],[tip-sign*8,lower-1],[root,lower-3]],'k');
    g.poly([[root,y+2],[tip-sign,handY+2],[tip-sign*3,lower-5],[tip-sign*5,lower-7],[tip-sign*8,lower-4],[root,lower-5]],back?'a':'i');
    g.line(root,y+1,tip-sign,handY+1,'b',large?3:2);
    g.line(tip-sign,handY+2,tip-sign*3,lower-6,back?'b':'j',1);
    g.line(tip-sign,handY+2,root,lower-6,back?'b':'h',1);
    g.ellipse(tip-sign,handY+1,large?3:2,2,'b');g.put(tip-sign,handY,'d');
  }
  function traveller(dir,mode,step){
    const g=A.grid(40,40),side=dir==='east'||dir==='west',back=dir==='north';
    const stride=mode==='walk'?Math.sin(step*Math.PI/3):0,bob=mode==='idle'?step:Math.round(Math.abs(stride));
    const bite=mode==='attack',open=bite&&step===0,reach=bite&&step===1,cx=20,head=14-bob;
    for(const [dx,sign]of [[-4,1],[4,-1]]){const x=cx+dx+Math.round(stride*2*sign);g.line(cx+dx,31,x,37,'a',3);g.ellipse(x,38,3,1,'k');g.line(x-1,37,x+1,37,'b',1);}
    for(const sign of [-1,1])wing(g,cx,22-bob,sign,open?18:reach?16:13,open?-3:reach?-1:2,false,back);
    g.ellipse(cx,27-bob,8,8,'k');g.ellipse(cx,26-bob,7,7,'a');g.ellipse(cx-2,25-bob,4,5,'b');
    if(back){g.line(cx,23-bob,cx,31-bob,'c',1);g.line(cx-3,32-bob,cx+3,32-bob,'b',1);}
    else{g.poly([[cx-5,21-bob],[cx,23-bob],[cx+5,21-bob],[cx+4,25-bob],[cx,27-bob],[cx-4,25-bob]],'l');g.line(cx-3,29-bob,cx+3,29-bob,'m',1);g.ellipse(cx,29-bob,1,2,'n');}
    const hx=side?22:cx,hy=head+(reach?1:0);
    ear(g,hx-6,head-7);ear(g,hx+6,head-7);
    face(g,hx,hy,back,side,reach);
    // Cheek ruff and a copper clasp sewn to the plum waistcoat.
    g.line(hx-5,hy+7,hx-2,hy+9,'l',1);g.line(hx+5,hy+7,hx+2,hy+9,'l',1);
    if(!back){g.ellipse(cx,22-bob,2,1,'n');g.put(cx,21-bob,'o');}
    if(dir==='west')for(const row of g.cells)row.reverse();return g.rows();
  }
  const frames=[],directional={};
  for(const dir of ['south','east','north','west']){const set=directional[dir]={};for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['guard',1]]){set[mode]=[];for(let i=0;i<count;i++){set[mode].push(frames.length);frames.push(traveller(dir,mode,i));}}}
  const sprite=A.compactSprite({palette,frames,density:2,authored:true,directional,animations:directional.south});sprite.directional=directional;G.forms.vampire.sprite=sprite;
  function host(g,frame){
    const cx=25,bob=frame===1?1:frame===3?-1:0,cast=frame===2,head=19-bob;
    for(const [dx,sign]of [[-5,1],[5,-1]]){const x=cx+dx+bob*sign;g.line(cx+dx,39,x,46,'a',4);g.ellipse(x,48,4,1,'k');g.line(x-2,47,x+2,47,'c',1);}
    for(const sign of [-1,1])wing(g,cx,29-bob,sign,cast?23:19,cast?-5:0,true);
    g.ellipse(cx,36-bob,11,10,'k');g.ellipse(cx,35-bob,10,9,'i');g.ellipse(cx-3,34-bob,6,7,'j');
    g.line(cx-5,41-bob,cx+5,41-bob,'n',1);g.line(cx+2,31-bob,cx+3,42-bob,'h',1);
    ear(g,cx-8,head-10,1.3);ear(g,cx+8,head-10,1.3);
    face(g,cx,head,false,false,cast,true);
    // A soft ivory ruff and sewn duskflower brooch; no detached reward layer.
    g.poly([[cx-9,head+8],[cx-5,head+10],[cx,head+9],[cx+5,head+10],[cx+9,head+8],[cx+7,head+14],[cx,head+16],[cx-7,head+14]],'l');
    g.line(cx-5,head+11,cx-2,head+13,'e',1);g.line(cx+5,head+11,cx+2,head+13,'e',1);
    g.ellipse(cx,head+13,3,2,'n');g.ellipse(cx,head+13,1,1,'o');
    g.line(cx+8,head-1,cx+10,head+3,'m',1);g.put(cx+9,head,'d');
  }
  G.enemies.countessCarmine.sprite=A.compactSprite(A.authored(50,50,palette,host));
})();
