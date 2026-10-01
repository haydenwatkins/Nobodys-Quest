/* Titan Grave's mountain bears: soft carved faces, broad joined stone paws,
   worldheart seams and moss rooted in the shoulders. No floating burden. */
"use strict";
(() => {
  const A=G.authoredPixelArt;
  const palette={k:'#38343c',a:'#53525a',b:'#74737c',c:'#97979c',d:'#b5b4af',e:'#d9d2be',f:'#f3e5c5',g:'#665449',h:'#92735b',i:'#bb9875',j:'#d5b798',l:'#576e55',m:'#829268',n:'#b1b591',o:'#9d5d57',p:'#cd8270',q:'#efb288',r:'#f6d19f',s:'#a4b8b2'};
  function head(g,x,y,side,back,elder){
    const rx=elder?12:10,ry=elder?11:9,base=elder?'h':'b',lit=elder?'i':'c';
    for(const sign of [-1,1]){const ex=x+sign*(elder?9:7);g.ellipse(ex,y-ry+2,elder?5:4,elder?5:4,'k');g.ellipse(ex,y-ry+1,elder?4:3,elder?4:3,base);g.ellipse(ex,y-ry+2,2,2,elder?'g':'a');}
    g.ellipse(x,y,rx,ry,'k');g.ellipse(x,y-1,rx-1,ry-1,base);g.ellipse(x-2,y-2,rx-3,ry-3,lit);
    g.line(x-7,y-ry+4,x-3,y-ry+2,elder?'j':'d',1);g.line(x+4,y-ry+4,x+6,y-ry+6,elder?'g':'a',1);
    if(back){g.line(x-2,y-1,x+2,y+2,elder?'g':'a',1);g.line(x+2,y+2,x,y+5,elder?'g':'a',1);g.ellipse(x-5,y-5,3,2,'m');return;}
    for(const ex of side?[x+3]:[x-4,x+4]){g.ellipse(ex,y,2,3,'k');g.put(ex-1,y-1,'f');g.line(ex-2,y-4,ex+1,y-4,elder?'e':'d',1);}
    const mx=side?x+6:x;g.ellipse(mx,y+5,side?5:7,4,elder?'e':'d');g.ellipse(mx+(side?2:0),y+3,3,2,'k');g.put(mx+(side?1:-1),y+2,elder?'j':'c');
    g.put(mx,y+6,elder?'h':'a');g.line(mx-2,y+7,mx+2,y+7,elder?'h':'b',1);
    for(const dx of side?[-6]:[-7,7])g.line(x+dx,y+3,x+dx+(dx<0?1:-1),y+4,elder?'j':'c',1);
  }
  function paw(g,x,y,elder){
    const rx=elder?6:5,ry=elder?5:4;
    g.ellipse(x,y,rx,ry,'k');g.ellipse(x,y-1,rx-1,ry-1,elder?'h':'b');g.ellipse(x-1,y-2,rx-2,ry-2,elder?'j':'d');
    for(const dx of [-2,0,2]){g.line(x+dx,y,x+dx,y+2,elder?'g':'a',1);g.put(x+dx,y-1,elder?'e':'c');}
  }
  function arm(g,x,y,hx,hy,elder){
    const ex=Math.round((x+hx)/2),ey=Math.round((y+hy)/2);g.line(x,y,ex,ey,'k',elder?10:8);g.line(ex,ey,hx,hy,'k',elder?9:7);
    g.line(x,y,ex,ey,elder?'h':'b',elder?8:6);g.line(ex,ey,hx,hy,elder?'g':'a',elder?7:5);
    g.ellipse(ex,ey,elder?5:4,elder?5:4,'k');g.ellipse(ex,ey-1,elder?4:3,elder?4:3,elder?'i':'c');g.line(ex-2,ey-2,ex+1,ey-2,elder?'j':'d',1);paw(g,hx,hy,elder);
  }
  function torso(g,x,y,back,side,elder){
    const rx=elder?15:12,ry=elder?14:11;
    g.ellipse(x,y,rx,ry,'k');g.ellipse(x,y-1,rx-1,ry-1,elder?'g':'a');g.ellipse(x-2,y-3,rx-3,ry-3,elder?'h':'b');g.ellipse(x-4,y-4,rx-6,ry-5,elder?'i':'c');
    for(const sign of [-1,1]){g.ellipse(x+sign*(rx-3),y-ry+5,4,3,'l');g.line(x+sign*(rx-5),y-ry+4,x+sign*(rx-2),y-ry+3,'m',2);g.put(x+sign*(rx-4),y-ry+2,'n');}
    g.line(x-rx+3,y+5,x-4,y+7,elder?'i':'c',1);g.line(x+4,y+7,x+rx-3,y+4,elder?'g':'a',1);
    if(back){g.line(x-2,y-5,x+3,y-1,'k',1);g.line(x+3,y-1,x+1,y+5,'k',1);g.line(x+1,y+5,x+4,y+8,elder?'i':'c',1);return;}
    const cx=x+(side?3:0);g.poly([[cx,y-6],[cx+5,y-2],[cx+3,y+7],[cx,y+9],[cx-3,y+7],[cx-5,y-2]],'k');
    g.poly([[cx,y-4],[cx+3,y-1],[cx+2,y+6],[cx,y+7],[cx-2,y+6],[cx-3,y-1]],'o');
    g.line(cx-1,y-2,cx-1,y+4,'q',2);g.line(cx+1,y,cx+1,y+5,'p',1);g.put(cx-1,y-3,'r');
  }
  function foot(g,x,y,stride,elder){
    g.line(x,y-5,x+stride,y-1,'k',elder?8:6);g.line(x,y-5,x+stride,y-1,elder?'h':'b',elder?6:4);
    g.ellipse(x+stride,y,elder?6:5,2,'k');g.ellipse(x+stride,y-1,elder?5:4,1,elder?'i':'c');for(const dx of [-2,1])g.put(x+stride+dx,y-1,elder?'e':'d');
  }
  function cragback(dir,mode,step){
    const g=A.grid(50,46),cx=25,side=dir==='east'||dir==='west',back=dir==='north';
    const stride=mode==='walk'?Math.round(Math.sin(step*Math.PI/3)*2):0,bob=mode==='idle'?step:mode==='attack'?[1,0,-1][step]:Math.abs(stride)>0?1:0,punch=mode==='attack'&&step===1,guard=mode==='guard';
    foot(g,cx-6,43,-stride,false);foot(g,cx+6,43,stride,false);if(side)arm(g,cx+7,26-bob,cx+12,35-bob,false);
    torso(g,cx,30-bob,back,side,false);head(g,cx+(side?2:0),15-bob,side,back,false);
    if(side)arm(g,cx-8,26-bob,punch?cx+19:guard?cx+9:cx-16,punch?26-bob:guard?25-bob:36-bob,false);
    else for(const sign of [-1,1])arm(g,cx+sign*10,26-bob,cx+sign*(punch?19:guard?11:17),punch?28-bob:guard?25-bob:36-bob,false);
    if(dir==='west')for(const row of g.cells)row.reverse();return g.rows();
  }
  const frames=[],directional={};for(const dir of ['south','east','north','west']){const set=directional[dir]={};for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['guard',1]]){set[mode]=[];for(let i=0;i<count;i++){set[mode].push(frames.length);frames.push(cragback(dir,mode,i));}}}
  const sprite=A.compactSprite({palette,frames,density:2,authored:true,directional,animations:directional.south});sprite.directional=directional;G.forms.colossus.sprite=sprite;
  function atlas(g,frame){
    const cx=30,bob=frame===1?1:frame===3?-1:0,lift=frame===2;
    foot(g,cx-7,53,frame===1?-1:0,true);foot(g,cx+7,53,frame===3?1:0,true);torso(g,cx,38-bob,false,false,true);head(g,cx,20-bob,false,false,true);
    for(const sign of [-1,1])arm(g,cx+sign*13,33-bob,cx+sign*(lift?23:21),lift?21:43-bob,true);
    g.line(cx-7,14-bob,cx-2,13-bob,'e',1);g.line(cx+2,13-bob,cx+7,14-bob,'e',1);
  }
  G.enemies.lastWorldbearer.sprite=A.compactSprite(A.authored(60,56,palette,atlas));
})();
