/* Windscar's feathered roadkeepers. Rounded lion haunches, joined wings,
   expressive eagle faces and fitted courier gear; no detached ornaments. */
"use strict";
(() => {
  const A=G.authoredPixelArt;
  const palette={k:'#39343a',a:'#765444',b:'#ad7549',c:'#d99b56',d:'#efbd73',e:'#f7dca0',f:'#fff1d0',g:'#d7c9ac',h:'#aab6b6',i:'#638888',j:'#88b4ac',l:'#c9ded2',m:'#e6ae68',n:'#bd7e4e',o:'#edbbad',p:'#4d6374',q:'#7797a6',r:'#abc3c5',s:'#fdf9e8'};

  // Every feather begins at the shoulder/upper wing. Rounded feather ends
  // and overlapping rows keep a folded wing from reading as a spiky limb.
  function wing(g,x,y,sign,spread,elder){
    const reach=spread?19:12,rise=spread?13:9,shade=elder?'p':'b',mid=elder?'q':'d',light=elder?'r':'e';
    const tip=x+sign*reach;
    g.poly([[x,y+9],[x-sign*2,y],[x+sign*7,y-rise],[tip,y-rise+2],[tip-sign*3,y-2],[x+sign*8,y+8]],'k');
    g.poly([[x,y+7],[x,y],[x+sign*7,y-rise+2],[tip-sign,y-rise+3],[tip-sign*4,y-2],[x+sign*7,y+6]],shade);
    for(let n=0;n<4;n++){
      const tx=tip-sign*(n*3),ty=y-rise+3+n*4;
      g.line(x+sign*3,y+1+n,tx,ty,'k',4);
      g.line(x+sign*3,y+n,tx,ty,mid,2);
      g.line(x+sign*5,y+n-1,tx-sign,ty-1,light,1);
    }
    g.ellipse(x+sign*3,y+1,5,5,shade);g.ellipse(x+sign*3,y,4,4,mid);
    g.line(x+sign,y-2,x+sign*4,y-3,light,2);
    for(const [dx,dy]of [[2,1],[5,2],[3,4]])g.put(x+sign*dx,y+dy,light);
  }
  function tail(g,x,y,lift,elder){
    g.line(x,y,x-7,y-2,'k',4);g.line(x-7,y-2,x-11,y-7-lift,'k',4);
    g.line(x,y-1,x-7,y-3,'c',2);g.line(x-7,y-3,x-11,y-7-lift,'d',2);
    g.ellipse(x-12,y-8-lift,4,3,'k');g.ellipse(x-12,y-9-lift,3,2,elder?'g':'b');g.put(x-13,y-10-lift,elder?'f':'d');
  }
  function foot(g,x,y,front,stride){
    const fx=x+stride;
    g.line(x,y-6,fx,y-1,'k',4);g.line(x,y-6,fx,y-2,front?'m':'c',2);
    g.ellipse(fx+1,y,4,2,'k');g.ellipse(fx+1,y-1,3,1,front?'d':'e');
    for(const dx of [-1,2]){g.put(fx+dx,y,'f');g.put(fx+dx,y+1,'a');}
  }
  function head(g,x,y,side,back,elder){
    const rx=elder?11:9,ry=elder?10:8;
    // Soft cheek ruff and three joined crown feathers, rather than a crown.
    g.ellipse(x,y+5,rx+1,ry-2,'k');g.ellipse(x,y+4,rx,ry-3,'g');
    g.ellipse(x,y,rx,ry,'k');g.ellipse(x,y-1,rx-1,ry-1,'e');g.ellipse(x-2,y-2,rx-3,ry-3,'f');
    for(const [dx,dy]of [[-4,-ry+1],[-1,-ry-1],[2,-ry]]){g.ellipse(x+dx,y+dy,2,3,'k');g.ellipse(x+dx,y+dy-1,1,2,'f');}
    if(back){g.line(x-4,y+3,x,y+5,'g',1);g.line(x,y+5,x+4,y+3,'g',1);g.line(x-2,y+7,x+2,y+7,'f',1);return;}
    const eyes=side?[x+3]:[x-4,x+4];
    for(const ex of eyes){g.ellipse(ex,y,2,3,'k');g.rect(ex-1,y-1,2,2,'a');g.put(ex-1,y-2,'s');if(elder)g.line(ex-2,y-5,ex+1,y-4,'g',2);}
    const bx=side?x+rx-2:x,by=y+4;
    g.ellipse(bx,by,side?5:3,3,'k');g.ellipse(bx,by-1,side?4:2,2,'m');g.put(bx+(side?2:0),by-2,'e');
    g.line(bx-1,by+1,bx+(side?3:1),by+1,'n',1);g.put(bx+(side?3:0),by+2,'m');
    g.ellipse(x-(side?2:6),y+4,2,1,'o');if(!side)g.ellipse(x+6,y+4,2,1,'o');
    g.line(x-5,y+8,x-2,y+9,'f',1);if(!side)g.line(x+2,y+9,x+5,y+8,'f',1);
  }
  function courier(dir,mode,step){
    const g=A.grid(56,38),side=dir==='east'||dir==='west',back=dir==='north';
    const stride=mode==='walk'?Math.round(Math.sin(step*Math.PI/3)*2):0,bob=mode==='idle'?step:mode==='attack'?[1,0,-1][step]:mode==='guard'?1:Math.abs(stride)>0?1:0,spread=mode==='attack'&&step===1;
    if(side){
      tail(g,17,27-bob,mode==='attack'?2:0,false);
      foot(g,23,34,false,-stride);foot(g,39,34,true,-stride);
      wing(g,35,17-bob,1,spread,false);
      g.ellipse(27,26-bob,15,9,'k');g.ellipse(27,25-bob,14,8,'c');g.ellipse(22,25-bob,9,7,'d');g.ellipse(33,29-bob,7,4,'e');
      g.ellipse(20,28-bob,7,6,'b');g.ellipse(20,27-bob,6,5,'c');g.line(17,25-bob,20,24-bob,'d',2);
      foot(g,17,35,false,stride);foot(g,35,35,true,stride);
      head(g,40,13-bob,true,false,false);
      g.line(34,23-bob,42,22-bob,'i',3);g.line(35,22-bob,40,22-bob,'j',1);
      wing(g,27,18-bob,-1,spread,false);
      // Dispatch pouch is fitted to the flank, with a strap across the body.
      g.line(27,20-bob,30,29-bob,'a',2);g.ellipse(29,28-bob,4,4,'k');g.rect(26,25-bob,7,6,'b');g.line(27,26-bob,31,26-bob,'d',1);g.put(29,28-bob,'e');
    }else{
      tail(g,23,28-bob,0,false);
      foot(g,23,34,false,-stride);foot(g,33,34,false,stride);
      wing(g,21,18-bob,-1,spread,false);wing(g,35,18-bob,1,spread,false);
      g.ellipse(28,27-bob,10,9,'k');g.ellipse(28,26-bob,9,8,'c');g.ellipse(27,25-bob,7,6,back?'d':'e');
      foot(g,21,35,true,stride);foot(g,35,35,true,-stride);
      head(g,28,13-bob,false,back,false);
      g.line(21,23-bob,35,23-bob,'i',3);g.line(24,22-bob,31,22-bob,'j',1);
      if(back){g.line(24,24-bob,31,30-bob,'a',2);g.rect(28,28-bob,6,5,'b');g.line(29,29-bob,32,29-bob,'d',1);}else{g.put(28,23-bob,'e');g.line(25,29-bob,31,29-bob,'f',1);}
    }
    if(dir==='west')for(const row of g.cells)row.reverse();return g.rows();
  }
  const frames=[],directional={};for(const dir of ['south','east','north','west']){const set=directional[dir]={};for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['guard',1]]){set[mode]=[];for(let i=0;i<count;i++){set[mode].push(frames.length);frames.push(courier(dir,mode,i));}}}
  const sprite=A.compactSprite({palette,frames,density:2,authored:true,directional,animations:directional.south});sprite.directional=directional;G.forms.griffin.sprite=sprite;

  function aurelia(g,frame){
    const bob=frame===1?1:frame===3?-1:0,spread=frame===2,cx=30;
    tail(g,22,34-bob,spread?2:0,true);
    foot(g,25,40,false,frame===1?-1:0);foot(g,37,40,false,frame===1?1:0);
    wing(g,cx-6,22-bob,-1,spread,true);wing(g,cx+6,22-bob,1,spread,true);
    g.ellipse(cx,32-bob,13,10,'k');g.ellipse(cx,31-bob,12,9,'b');g.ellipse(cx-2,29-bob,9,7,'c');g.ellipse(cx,33-bob,8,7,'d');
    foot(g,cx-9,41,true,frame===3?1:0);foot(g,cx+9,41,true,frame===3?-1:0);
    // Long ivory breast feathers and blue shoulder plumage identify the older keeper.
    g.ellipse(cx,25-bob,10,10,'g');g.ellipse(cx,24-bob,9,9,'f');
    for(const dx of [-5,0,5])g.line(cx+dx,25-bob,cx+dx,32-bob,'e',2);
    head(g,cx,16-bob,false,false,true);
    g.line(cx-10,28-bob,cx-6,36-bob,'i',3);g.line(cx+10,28-bob,cx+6,36-bob,'i',3);
    g.line(cx-6,36-bob,cx+6,36-bob,'i',3);g.line(cx-5,35-bob,cx+4,35-bob,'j',1);
    g.rect(cx-3,33-bob,7,5,'a');g.rect(cx-2,34-bob,5,3,'m');g.put(cx,35-bob,'f');
  }
  G.enemies.skySovereign.sprite=A.compactSprite(A.authored(60,44,palette,aurelia));
})();
