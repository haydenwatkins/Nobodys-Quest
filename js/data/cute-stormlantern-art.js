/* Stormspine's hearth lights: warm flame faces inside rounded storm glass,
   attached copper frames/handles and feet. No loose ornamental wisps. */
"use strict";
(() => {
  const A=G.authoredPixelArt;
  const palette={k:'#3d3540',a:'#755346',b:'#a9754e',c:'#d09a60',d:'#e8ba7d',e:'#f5dca3',f:'#fff1d1',g:'#476b72',h:'#729596',i:'#a7bcb1',j:'#d2d8c0',l:'#be6460',m:'#e38e65',n:'#f2b570',o:'#f7d592',p:'#fff0b4',q:'#8e7689',r:'#b8a1ad',s:'#dcbdc4'};
  function flame(g,x,y,side,back,elder,cast){
    const rx=elder?10:7,ry=elder?11:8;
    g.ellipse(x,y,rx,ry,'l');g.ellipse(x,y-1,rx-1,ry-1,'m');g.ellipse(x-1,y,rx-2,ry-2,'n');
    g.poly([[x-rx+2,y-3],[x-4,y-ry-3],[x-1,y-ry-6],[x-1,y-ry-1],[x+3,y-ry-4],[x+rx-2,y-3]],'m');
    g.poly([[x-rx+3,y-1],[x-3,y-ry-1],[x,y-ry-3],[x+1,y-ry+1],[x+rx-3,y]],'n');
    g.ellipse(x,y+2,rx-3,ry-3,'o');g.ellipse(x-1,y+3,Math.max(2,rx-5),ry-5,'p');
    if(back){g.line(x,y-3,x-1,y+3,'o',1);return;}
    const eyes=side?[x+2]:[x-3,x+3];
    for(const ex of eyes){g.ellipse(ex,y,elder?2:1,elder?3:2,'k');g.put(ex,y-1,'f');}
    const mx=side?x+3:x;g.line(mx-1,y+5,mx+1,y+5,'l',1);g.put(mx,y+6,'n');
    g.put(x-(side?1:5),y+3,'l');if(!side)g.put(x+5,y+3,'l');
    if(cast){g.line(x-3,y+ry-2,x+3,y+ry-2,'p',1);}
  }
  function handle(g,x,y,hx,hy,elder){
    g.line(x,y,hx,hy,'k',elder?5:3);g.line(x,y,hx,hy,'b',elder?3:1);
    g.ellipse(hx,hy,elder?3:2,elder?3:2,'k');g.ellipse(hx,hy-1,elder?2:1,elder?2:1,'d');g.put(hx-1,hy-1,'e');
  }
  function lantern(g,x,bob,side,back,elder,cast,guard,stride){
    const y=(elder?29:23)+bob,rx=elder?14:10,ry=elder?16:12,roof=(elder?13:10)+bob,base=(elder?44:34)+bob;
    const footY=(elder?49:37)+bob;
    for(const sign of [-1,1]){const fx=x+sign*(elder?6:4)+sign*stride;
      g.line(x+sign*(elder?5:3),base-1,fx,footY-1,'k',elder?5:3);g.line(x+sign*(elder?5:3),base-1,fx,footY-1,'b',elder?3:1);
      g.ellipse(fx,footY,elder?4:3,1,'k');g.line(fx-2,footY-1,fx+2,footY-1,'d',1);
    }
    g.ellipse(x,y,rx+1,ry,'k');g.ellipse(x,y-1,rx,ry-1,'g');g.ellipse(x-3,y-2,rx-3,ry-3,'h');
    const reach=elder?21:16,handY=cast?y-2:guard?y+2:y+6;
    for(const sign of [-1,1])handle(g,x+sign*rx,y+1,x+sign*(guard?rx-2:reach),handY,elder);
    flame(g,x+(side?1:0),y,side,back,elder,cast);
    // The bowed side ribs leave the face unobscured. Glass highlights follow them.
    for(const sign of [-1,1]){g.line(x+sign*(rx-2),roof+2,x+sign*rx,y,'k',3);g.line(x+sign*rx,y,x+sign*(rx-2),base-1,'k',3);
      g.line(x+sign*(rx-2),roof+2,x+sign*rx,y,'c',1);g.line(x+sign*rx,y,x+sign*(rx-2),base-1,'d',1);
      g.line(x+sign*(rx-3),roof+5,x+sign*(rx-2),y-1,'j',1);
    }
    if(back){g.line(x,roof+3,x,base-2,'b',2);g.line(x-1,roof+4,x-1,base-3,'d',1);}
    g.ellipse(x,roof,rx+2,3,'k');g.ellipse(x,roof-1,rx+1,2,'b');g.line(x-rx+2,roof-2,x+rx-2,roof-2,'d',2);
    for(const dx of [-4,0,4])g.put(x+dx,roof,'a');
    const loopY=(elder?5:4)+bob;g.ellipse(x,loopY,elder?6:4,3,'k');g.ellipse(x,loopY-1,elder?5:3,2,'c');g.ellipse(x,loopY-1,elder?3:1,1,'.');g.line(x,loopY+3,x,roof-2,'b',3);
    g.ellipse(x,base,rx,3,'k');g.ellipse(x,base-1,rx-1,2,'b');g.line(x-rx+3,base-2,x+rx-3,base-2,'e',1);
    g.rect(x-2,base-1,5,2,'c');g.put(x,base-1,'e');
    if(cast){
      // Hinged side shutters open from the frame; nothing orbits the lantern.
      for(const sign of [-1,1]){const sx=x+sign*rx,ex=x+sign*(elder?21:15);
        g.line(sx,y-6,ex,y-4,'b',2);g.line(ex,y-4,ex,y+5,'c',1);g.line(ex,y+5,sx,y+8,'b',2);
      }
    }
  }
  function wickling(dir,mode,step){
    const g=A.grid(38,40),side=dir==='east'||dir==='west',back=dir==='north';
    const stride=mode==='walk'?Math.round(Math.sin(step*Math.PI/3)):0,bob=mode==='idle'?step:mode==='attack'?[1,0,-1][step]:Math.abs(stride),cast=mode==='attack'&&step===1;
    lantern(g,19,bob,side,back,false,cast,mode==='guard',stride);
    if(dir==='west')for(const row of g.cells)row.reverse();return g.rows();
  }
  const frames=[],directional={};for(const dir of ['south','east','north','west']){const set=directional[dir]={};for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['guard',1]]){set[mode]=[];for(let i=0;i<count;i++){set[mode].push(frames.length);frames.push(wickling(dir,mode,i));}}}
  const sprite=A.compactSprite({palette,frames,density:2,authored:true,directional,animations:directional.south});sprite.directional=directional;G.forms.lanternWisp.sprite=sprite;
  G.enemies.lanternKeeper.sprite=A.compactSprite(A.authored(52,52,palette,(g,frame)=>{
    lantern(g,26,frame===1?1:frame===3?-1:0,false,false,true,frame===2,false,frame===1?1:frame===3?-1:0);
  }));
})();
