/* A completed living map and the keeper who demanded a perfect one.
   Canvas faces, stitched route coats and carried tools; no orbit ornaments. */
"use strict";
(() => {
  const A=G.authoredPixelArt;
  const palette={k:'#292937',a:'#444657',b:'#666379',c:'#9d8da1',d:'#c4b49d',e:'#e9dcc0',f:'#fff0cf',g:'#426b70',h:'#6b9693',i:'#a0c5b4',j:'#d1e0c5',l:'#795451',m:'#b77962',n:'#d99e73',o:'#f0c48c',p:'#48537c',q:'#6978a4',r:'#a1b7cc',s:'#835f7b',t:'#bd8f9a',u:'#edb7b2'};
  function limb(g,x,y,hx,hy,color,width=4){
    const ex=Math.round((x+hx)/2),ey=Math.round((y+hy)/2);g.line(x,y,ex,ey,'k',width+2);g.line(ex,ey,hx,hy,'k',width+1);
    g.line(x,y,ex,ey,color,width);g.line(ex,ey,hx,hy,color,width-1);g.ellipse(hx,hy,3,3,'k');g.ellipse(hx,hy-1,2,2,'d');g.put(hx-1,hy-2,'f');
  }
  function head(g,x,y,side,back,keeper){
    const rx=keeper?12:11,ry=keeper?12:11;
    g.ellipse(x,y,rx,ry,'k');g.ellipse(x,y-1,rx-1,ry-1,'d');g.ellipse(x-2,y-3,rx-3,ry-3,'e');
    // A folded corner is sewn into the map hood, not a floating crown.
    g.poly([[x-8,y-6],[x-9,y-ry-2],[x-3,y-ry+1],[x-2,y-6]],'k');g.poly([[x-7,y-7],[x-7,y-ry],[x-4,y-ry+2],[x-3,y-7]],'f');
    const sx=x+(side?-3:6);g.line(sx,y-8,sx+1,y+6,'b',1);for(const dy of [-5,-1,3])g.line(sx-1,y+dy,sx+2,y+dy,'f',1);
    if(back){g.line(x-6,y-5,x+2,y+5,'b',1);g.line(x-3,y+2,x+5,y-3,'h',1);g.rect(x-4,y-3,3,3,'m');return;}
    const eyes=side?[x+4]:[x-4,x+4];for(const ex of eyes){g.ellipse(ex,y,2,3,'k');g.put(ex-1,y-1,'f');if(keeper)g.line(ex-2,y-4,ex+2,y-4,'b',1);}
    g.line(x+(side?4:-1),y+6,x+(side?6:1),y+6,'b',1);g.line(x+(side?1:-8),y+3,x+(side?2:-6),y+3,'u',1);if(!side)g.line(x+6,y+3,x+8,y+3,'u',1);
    g.rect(x-7,y-7,4,3,'m');g.put(x-6,y-6,'o');g.put(x-4,y-5,'l');
  }
  function coat(g,x,y,bottom,side,back,keeper){
    const width=keeper?13:11;
    g.poly([[x-width+3,y],[x+width-3,y],[x+width,bottom-5],[x+6,bottom],[x,bottom-2],[x-6,bottom],[x-width,bottom-5]],'k');
    g.poly([[x-width+5,y+1],[x+width-5,y+1],[x+width-2,bottom-6],[x+5,bottom-2],[x,bottom-4],[x-5,bottom-2],[x-width+2,bottom-6]],keeper?'p':'g');
    g.line(x-width+6,y+3,x-width+3,bottom-7,keeper?'q':'h',2);g.line(x+width-6,y+4,x+width-3,bottom-6,keeper?'a':'g',2);
    const cx=x+(side?2:0);g.rect(cx-4,y+5,8,9,back?'d':'e');g.line(cx-2,y+6,cx+2,y+12,keeper?'q':'h',1);g.line(cx-2,y+12,cx+2,y+8,keeper?'q':'h',1);g.put(cx-2,y+6,'m');g.put(cx+2,y+12,'m');
    if(keeper){g.line(x-width+4,bottom-8,x+width-4,bottom-8,'o',1);g.line(x,bottom-15,x,bottom-4,'q',1);}else{g.line(x-5,bottom-7,x+5,bottom-7,'m',1);g.rect(x+4,bottom-10,3,4,'s');g.line(x+4,bottom-11,x+6,bottom-11,'f',1);}
    g.line(x-7,y,x+7,y,keeper?'r':'i',3);g.line(x-6,y-1,x+6,y-1,keeper?'f':'j',1);
  }
  function boot(g,x,y,stride){g.line(x,y-6,x+stride,y-2,'k',5);g.line(x,y-6,x+stride,y-2,'b',3);g.ellipse(x+stride,y,4,2,'k');g.line(x+stride-2,y-1,x+stride+1,y-1,'c',1);}
  function map(g,x,y){g.poly([[x-4,y-5],[x,y-4],[x+4,y-6],[x+4,y+4],[x,y+5],[x-4,y+4]],'k');g.poly([[x-3,y-4],[x,y-3],[x+3,y-5],[x+3,y+3],[x,y+4],[x-3,y+3]],'e');g.line(x,y-2,x,y+3,'d',1);g.line(x-2,y,x+2,y+1,'h',1);g.put(x+2,y+1,'m');}
  function staff(g,x,y,lift,keeper){
    const top=y-(keeper?21:13);g.line(x,y+5,x+lift,top,'k',3);g.line(x,y+4,x+lift,top,'m',1);
    if(keeper){g.ellipse(x+lift,top,5,5,'k');g.ellipse(x+lift,top,4,4,'m');g.ellipse(x+lift,top,3,3,'e');g.line(x+lift,top-2,x+lift,top+2,'h',1);g.line(x+lift-2,top,x+lift+2,top,'h',1);g.put(x+lift,top,'o');}
    else{g.poly([[x+lift-2,top+1],[x+lift-1,top-4],[x+lift+2,top-6],[x+lift+2,top]],'k');g.line(x+lift,top,x+lift+1,top-4,'o',1);g.put(x+lift+1,top-4,'f');}
  }
  function wayheart(dir,mode,step){
    const g=A.grid(52,48),side=dir==='east'||dir==='west',back=dir==='north',stride=mode==='walk'?Math.round(Math.sin(step*Math.PI/3)*2):0,bob=mode==='idle'?step:Math.abs(stride)>0?1:0,cast=mode==='attack'?step:-1,guard=mode==='guard',cx=26;
    boot(g,cx-5,45,-stride);boot(g,cx+5,45,stride);coat(g,cx,25-bob,41,side,back,false);
    const lx=cx-13,ly=guard?28-bob:34-bob;limb(g,cx-7,27-bob,lx,ly,'h');map(g,lx,ly);
    const hx=cx+(cast===1?19:guard?9:14),hy=(cast===1?24:cast===0?30:34)-bob;limb(g,cx+7,27-bob,hx,hy,'h');staff(g,hx,hy,cast===1?2:0,false);head(g,cx+(side?1:0),16-bob,side,back,false);
    if(dir==='west')for(const row of g.cells)row.reverse();return g.rows();
  }
  const frames=[],directional={};for(const dir of ['south','east','north','west']){const set=directional[dir]={};for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['guard',1]]){set[mode]=[];for(let i=0;i<count;i++){set[mode].push(frames.length);frames.push(wayheart(dir,mode,i));}}}
  const sprite=A.compactSprite({palette,frames,density:2,authored:true,directional,animations:directional.south});sprite.directional=directional;G.forms.god.sprite=sprite;
  function meridian(g,frame){
    const cx=29,bob=frame===1?1:frame===3?-1:0,cast=frame===2;
    boot(g,cx-6,51,frame===1?-1:0);boot(g,cx+6,51,frame===3?1:0);coat(g,cx,28-bob,47,false,false,true);
    limb(g,cx-9,30-bob,cx-17,cast?28:39-bob,'q',5);map(g,cx-17,cast?28:39-bob);
    const hx=cx+(cast?22:18),hy=cast?29:40-bob;limb(g,cx+9,30-bob,hx,hy,'q',5);staff(g,hx,hy,cast?0:-1,true);head(g,cx,18-bob,false,false,true);
  }
  G.enemies.godAvatar.sprite=A.compactSprite(A.authored(58,54,palette,meridian));
})();
