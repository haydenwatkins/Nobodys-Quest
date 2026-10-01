/* Skylens Mapper and Nell: visible faces, brass spectacles and a telescope
   carried in the hand. No detached planets, combat or save changes. */
"use strict";
(() => {
  const A=G.authoredPixelArt;
  const palette={k:'#2b3445',a:'#4d4b5b',b:'#77534f',c:'#a57360',d:'#d5a079',e:'#f5cf9e',f:'#fff3d5',g:'#b57779',h:'#334e72',i:'#5a7595',j:'#90a9bd',l:'#c6d1c8',m:'#a48253',n:'#d9b56d',o:'#efcf92',p:'#497c8c',q:'#86c5c0',r:'#dcecdf'};
  function face(g,x,y,side,back,older=false){
    const rx=older?10:8,ry=older?9:7;
    g.ellipse(x,y,rx+1,ry+1,'k');g.ellipse(x,y,rx,ry,'b');g.ellipse(x,y-1,rx-1,ry-1,'c');g.ellipse(x-2,y-2,rx-3,ry-3,'d');
    const hair=older?'l':'h',highlight=older?'r':'i';
    g.ellipse(x,y-4,rx+1,ry-2,'k');g.ellipse(x-1,y-5,rx,ry-3,hair);
    for(const [dx,dy]of [[-rx+1,-3],[-rx+3,-7],[-2,-8],[3,-8],[rx-2,-5]]){g.ellipse(x+dx,y+dy,2,2,hair);g.put(x+dx-1,y+dy-1,highlight);}
    if(back){g.ellipse(x,y+1,rx-1,ry-1,hair);g.line(x-4,y+3,x+3,y+4,highlight,1);return;}
    g.ellipse(x+rx-1,y+1,2,3,'c');g.ellipse(x-rx+1,y+1,2,3,'d');
    for(const ex of side?[x+3]:[x-4,x+4]){
      g.ellipse(ex,y+1,3,3,'a');g.ellipse(ex,y+1,2,2,'n');g.rect(ex-1,y,3,2,'p');g.put(ex,y,'r');g.rect(ex,y+1,2,2,'k');
    }
    if(!side)g.line(x-1,y+1,x+1,y+1,'m',1);
    const mx=side?x+3:x;g.put(mx,y+4,'e');g.line(mx-1,y+6,mx+2,y+6,'b',1);g.put(x-rx+3,y+4,'g');
    if(older){g.line(x-5,y+5,x-4,y+6,'d',1);g.line(x+5,y+5,x+4,y+6,'d',1);}
  }
  function telescope(g,x,y,large=false){
    const dx=large?8:6,dy=large?-12:-9;
    g.line(x-2,y+3,x+dx,y+dy,'k',large?6:4);g.line(x-1,y+2,x+dx,y+dy,'n',large?4:2);
    g.line(x,y,x+dx-1,y+dy+1,'o',1);
    for(const fraction of [.35,.7]){const bx=x+dx*fraction,by=y+dy*fraction;g.line(bx-2,by-1,bx+2,by+1,'m',1);g.put(bx-1,by-1,'f');}
    g.ellipse(x+dx,y+dy,large?4:3,large?4:3,'k');g.ellipse(x+dx,y+dy,large?3:2,large?3:2,'n');g.ellipse(x+dx,y+dy,large?2:1,large?2:1,'q');g.put(x+dx-1,y+dy-1,'r');
    g.line(x-3,y+1,x+1,y+3,'a',1);
  }
  function mapper(dir,mode,step){
    const g=A.grid(42,40),cx=21,side=dir==='east'||dir==='west',back=dir==='north';
    const stride=mode==='walk'?Math.round(Math.sin(step*Math.PI/3)*2):0,bob=mode==='idle'?step:Math.abs(stride)>0?1:0,cast=mode==='attack'&&step===1,hy=13-bob;
    for(const sign of [-1,1]){const x=cx+sign*4+stride*sign;g.line(cx+sign*4,31,x,36,'k',4);g.line(cx+sign*4,31,x,35,'h',2);g.ellipse(x,38,3,1,'k');g.line(x-1,37,x+1,37,'m',1);}
    g.poly([[cx-7,20-bob],[cx+7,20-bob],[cx+9,33],[cx+4,35],[cx,33],[cx-4,35],[cx-9,33]],'k');g.ellipse(cx,27-bob,7,7,'h');g.ellipse(cx-2,25-bob,4,5,'i');
    if(back){g.line(cx,23-bob,cx,31,'h',1);g.line(cx-3,27-bob,cx+2,29-bob,'j',1);g.put(cx-3,27-bob,'o');g.put(cx+2,29-bob,'o');}
    else{g.line(cx-5,21-bob,cx,26-bob,'l',2);g.line(cx+5,21-bob,cx,26-bob,'j',2);for(const y of [27,30])g.put(cx,y-bob,'n');g.rect(cx-5,29-bob,3,3,'j');g.line(cx+3,30-bob,cx+5,30-bob,'m',1);}
    face(g,cx+(side?2:0),hy,side,back);
    const hx=cast?31:30,hyHand=(cast?23:29)-bob;
    g.line(cx+5,23-bob,hx,hyHand,'k',4);g.line(cx+5,23-bob,hx,hyHand,'h',2);telescope(g,hx,hyHand);g.ellipse(hx,hyHand,2,2,'d');g.put(hx,hyHand-1,'e');
    const lx=cx-(cast?13:10),ly=(cast?21:28)-bob;g.line(cx-5,23-bob,lx,ly,'k',4);g.line(cx-5,23-bob,lx,ly,'h',2);g.ellipse(lx,ly,2,2,'d');g.put(lx-1,ly-2,'e');
    if(dir==='west')for(const row of g.cells)row.reverse();return g.rows();
  }
  const frames=[],directional={};for(const dir of ['south','east','north','west']){const set=directional[dir]={};for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['guard',1]]){set[mode]=[];for(let i=0;i<count;i++){set[mode].push(frames.length);frames.push(mapper(dir,mode,i));}}}
  const sprite=A.compactSprite({palette,frames,density:2,authored:true,directional,animations:directional.south});sprite.directional=directional;G.forms.astronomer.sprite=sprite;
  function nell(g,frame){
    const cx=26,bob=frame===1?1:frame===3?-1:0,cast=frame===2,hy=16-bob;
    for(const sign of [-1,1]){const x=cx+sign*5+bob*sign;g.line(cx+sign*5,40,x,46,'k',5);g.line(cx+sign*5,40,x,45,'h',3);g.ellipse(x,48,4,1,'k');g.line(x-2,47,x+2,47,'m',1);}
    g.poly([[cx-10,25-bob],[cx+10,25-bob],[cx+13,42],[cx+6,45],[cx,42],[cx-6,45],[cx-13,42]],'k');g.ellipse(cx,35-bob,10,10,'h');g.ellipse(cx-3,32-bob,6,8,'i');
    g.line(cx-7,25-bob,cx,34-bob,'l',3);g.line(cx+7,25-bob,cx,34-bob,'j',3);g.line(cx,35-bob,cx,40-bob,'m',1);g.put(cx,36-bob,'n');g.put(cx,39-bob,'n');
    g.rect(cx-8,37-bob,4,4,'j');g.line(cx+4,37-bob,cx+7,40-bob,'n',1);g.put(cx+4,37-bob,'o');g.put(cx+7,40-bob,'o');
    face(g,cx,hy,false,false,true);
    const hx=cast?39:38,handY=(cast?28:36)-bob;
    g.line(cx+8,28-bob,hx,handY,'k',6);g.line(cx+8,28-bob,hx,handY,'h',4);telescope(g,hx,handY,true);g.ellipse(hx,handY,3,2,'d');g.line(hx-1,handY-1,hx+1,handY-1,'e',1);
    const lx=cx-(cast?18:14),ly=(cast?26:36)-bob;g.line(cx-8,28-bob,lx,ly,'k',6);g.line(cx-8,28-bob,lx,ly,'h',4);g.ellipse(lx,ly,3,3,'d');g.line(lx-2,ly-2,lx,ly-2,'e',1);g.put(lx-2,ly+1,'c');
  }
  G.enemies.professorPerihelion.sprite=A.compactSprite(A.authored(52,50,palette,nell));
})();
