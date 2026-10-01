/* Rootdeep's silk stitchers: soft jumping-spider faces, eight joined legs
   and held tools. Native footprints and guardian attack indices stay fixed. */
"use strict";
(() => {
  const A=G.authoredPixelArt;
  const palette={k:'#38303f',a:'#64516a',b:'#8a7188',c:'#b495ab',d:'#d6b8c4',e:'#efdae0',f:'#fff1df',g:'#af7889',h:'#d798a3',i:'#edc2bd',j:'#587579',l:'#87a6a7',m:'#c0d2c8',n:'#916348',o:'#bc8d60',p:'#e5bd86',q:'#696075',r:'#918699',s:'#bfb2bd',t:'#493e55'};
  function leg(g,x,y,kx,ky,fx,fy,elder,near){
    const mid=elder?(near?'g':'a'):(near?'b':'a'),light=elder?'h':'c';
    g.line(x,y,kx,ky,'k',4);g.line(kx,ky,fx,fy,'k',4);
    g.line(x,y,kx,ky,mid,2);g.line(kx,ky,fx,fy,mid,2);
    g.line(x,y-1,kx,ky-1,light,1);g.ellipse(kx,ky,2,2,mid);g.put(kx-1,ky-1,light);
    g.ellipse(fx,fy,3,2,'k');g.ellipse(fx,fy-1,2,1,elder?'i':'d');g.put(fx-1,fy-1,elder?'e':'f');
  }
  function needle(g,x,y,lift,elder){
    const tx=x+(elder?5:3),ty=y-(lift?(elder?16:10):11);
    g.line(x,y,tx,ty,'k',3);g.line(x,y-1,tx,ty,'m',1);
    g.line(tx,ty+1,tx+2,ty+3,'f',1);g.put(tx+1,ty+2,'a');
    // Thread returns to the tool grip, rather than forming a head ornament.
    g.line(tx+2,ty+3,tx+4,ty+7,'e',1);g.line(tx+4,ty+7,x+2,y,'e',1);
    g.ellipse(x,y,2,2,elder?'i':'d');g.put(x-1,y-1,'f');
  }
  function face(g,x,y,side,back,elder){
    const rx=elder?11:8,ry=elder?9:7;
    g.ellipse(x,y,rx+1,ry+1,'k');g.ellipse(x,y-1,rx,ry,elder?'s':'c');g.ellipse(x-2,y-2,rx-2,ry-2,elder?'e':'d');
    for(const dx of [-5,-2,1,4])g.ellipse(x+dx,y-ry+1,2,2,elder?'s':'c');
    if(back){g.line(x-3,y+1,x,y+3,elder?'r':'b',1);g.line(x,y+3,x+3,y+1,elder?'r':'b',1);return;}
    const eyes=side?[x+3]:[x-4,x+4];
    for(const ex of eyes){g.ellipse(ex,y,3,4,'k');g.put(ex-1,y-2,'f');g.put(ex+1,y+2,'b');if(elder)g.line(ex-2,y-4,ex+1,y-4,'f',1);}
    for(const dx of side?[0,5]:[-6,-2,2,6])g.put(x+dx,y-5,'a');
    g.ellipse(x+(side?2:0),y+5,side?5:6,2,elder?'f':'e');
    g.line(x+(side?1:-1),y+5,x+(side?4:1),y+5,'b',1);
    for(const sign of [-1,1]){g.ellipse(x+sign*4,y+6,2,1,elder?'i':'d');g.put(x+sign*5,y+5,'f');}
  }
  function abdomen(g,x,y,elder,back){
    const rx=elder?13:10,ry=elder?11:9;
    g.ellipse(x,y,rx+1,ry+1,'k');g.ellipse(x,y-1,rx,ry,'a');g.ellipse(x-2,y-2,rx-2,ry-2,elder?'g':'b');
    g.ellipse(x-3,y-3,rx-5,ry-4,elder?'h':'c');
    // A fitted woven work-wrap follows the abdomen's curve.
    for(const dy of [-2,2]){g.line(x-rx+4,y+dy,x,y+dy+3,elder?'e':'d',1);g.line(x,y+dy+3,x+rx-4,y+dy,elder?'e':'d',1);}
    for(const dx of [-5,0,5])g.put(x+dx,y+3,elder?'p':'e');
    if(back){g.ellipse(x,y+ry-2,3,2,'e');g.put(x-1,y+ry-3,'f');}
  }
  function silkstep(dir,mode,step){
    const g=A.grid(46,38),side=dir==='east'||dir==='west',back=dir==='north';
    const bob=mode==='idle'?step:mode==='attack'?[1,0,-1][step]:0,cast=mode==='attack'&&step===1;
    const walk=n=>mode==='walk'?Math.round(Math.sin((step+n%2*3)*Math.PI/3)*2):0;
    const cx=side?21:23,cy=25-bob;
    if(side){
      for(let n=0;n<4;n++){const lift=walk(n);leg(g,cx-3,cy-5+n*3,cx-9-n,cy-9+n*4,cx-15+n*2,cy-3+n*3+lift,false,false);}
      abdomen(g,cx,cy,false,false);face(g,33,13-bob,true,false,false);
      for(let n=3;n>=0;n--){const lift=walk(n);const fx=cast&&n===0?37:35-n*3,fy=cast&&n===0?12:Math.min(35,22+n*4+lift);leg(g,cx+5,cy-5+n*2,cx+10,cy-5+n*3,fx,fy,false,true);if(n===0)needle(g,fx,fy,cast,false);}
    }else{
      for(const sign of [-1,1])for(let n=3;n>=0;n--){
        const lift=walk(n),fx=cx+sign*([17,20,18,13][n]),fy=cast&&n===0?14:Math.min(35,20+n*5+lift);
        leg(g,cx+sign*7,cy-6+n*3,cx+sign*([11,14,14,10][n]),cy-10+n*6,fx,fy,false,true);
      }
      abdomen(g,cx,cy,false,back);face(g,cx,12-bob,false,back,false);
      const fx=cx-17,fy=cast?14:20+walk(0);needle(g,fx,fy,cast,false);
      g.line(cx-6,19-bob,cx+6,19-bob,'j',2);g.line(cx-3,18-bob,cx+2,18-bob,'l',1);
    }
    if(dir==='west')for(const row of g.cells)row.reverse();return g.rows();
  }
  const frames=[],directional={};for(const dir of ['south','east','north','west']){const set=directional[dir]={};for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['guard',1]]){set[mode]=[];for(let i=0;i<count;i++){set[mode].push(frames.length);frames.push(silkstep(dir,mode,i));}}}
  const sprite=A.compactSprite({palette,frames,density:2,authored:true,directional,animations:directional.south});sprite.directional=directional;G.forms.weaver.sprite=sprite;
  function tess(g,frame){
    const cx=30,cy=32,bob=frame===1?1:frame===3?-1:0,cast=frame===2;
    for(const sign of [-1,1])for(let n=3;n>=0;n--){const stride=frame===1?(n%2?1:-1):frame===3?(n%2?-1:1):0;
      const fx=cx+sign*([24,26,23,17][n]),fy=cast&&n===0?17:Math.min(43,25+n*6+stride);
      leg(g,cx+sign*9,cy-8+n*3,cx+sign*([15,19,17,13][n]),cy-13+n*7,fx,fy,true,true);
    }
    abdomen(g,cx,cy-bob,true,true);face(g,cx,16-bob,false,false,true);
    g.line(cx-8,26-bob,cx,29-bob,'o',2);g.line(cx,29-bob,cx+8,26-bob,'o',2);g.put(cx,28-bob,'f');
    const fx=cx-24,fy=cast?17:25+(frame===1?-1:frame===3?1:0);needle(g,fx,fy,cast,true);
    // A small reel is carried by the opposite forepaw and rests against it.
    const rx=cx+24,ry=fy;g.ellipse(rx,ry-1,3,4,'k');g.rect(rx-2,ry-4,5,6,'e');g.line(rx-2,ry-3,rx+2,ry-3,'o',1);g.line(rx-2,ry+1,rx+2,ry+1,'o',1);g.ellipse(rx,ry+1,2,1,'i');
  }
  G.enemies.silkMatriarch.sprite=A.compactSprite(A.authored(60,46,palette,tess));
})();
