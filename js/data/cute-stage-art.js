/* The travelling theatre: Pocket Trouper and Tansy, Caravan Star.
   Cloth and props stay attached to their owners; all combat clocks are stable. */
"use strict";
(() => {
  const A=G.authoredPixelArt;
  const palette={k:'#312c3e',a:'#544052',b:'#7c5666',c:'#ac7184',d:'#d39bac',e:'#bd876c',f:'#e2b995',g:'#fff0d3',h:'#966553',i:'#4a7277',j:'#79a5a2',l:'#cad4bf',m:'#c49b5c',n:'#efd18e',o:'#ad5972',p:'#695460',q:'#d9bd9d'};
  function fan(g,x,y){
    for(const points of [ [[x-1,y],[x-4,y-6],[x-1,y-8],[x+1,y-1]], [[x-1,y],[x-1,y-9],[x+2,y-9],[x+2,y]], [[x,y],[x+2,y-8],[x+5,y-6],[x+2,y]] ])g.poly(points,'k');
    g.line(x-1,y-1,x-2,y-6,'l',1);g.line(x,y-1,x,y-7,'g',1);g.line(x+1,y-1,x+3,y-5,'g',1);
    g.put(x,y-5,'o');g.put(x+3,y-5,'m');
  }
  function face(g,x,y,side,back,large=false){
    const rx=large?10:7,ry=large?9:7;
    g.ellipse(x,y,rx+1,ry+1,'k');g.ellipse(x,y,rx,ry,'h');
    if(back){g.ellipse(x-2,y-2,rx-2,ry-2,'b');g.line(x-3,y+2,x+3,y+3,'a',1);return;}
    g.ellipse(x,y+1,rx-1,ry-1,'e');g.ellipse(x-2,y-1,rx-3,ry-3,'f');
    g.poly([[x-rx,y-3],[x-rx+2,y-7],[x+rx-2,y-6],[x+rx,y-2],[x+3,y-3],[x+1,y-1],[x-2,y-3]],'a');
    for(const ex of side?[x+3]:large?[x-4,x+4]:[x-3,x+3]){g.rect(ex,y+1,large?2:1,2,'a');g.put(ex,y,'g');}
    const mx=side?x+3:x;g.put(mx,y+4,'h');g.line(mx-1,y+6,mx+2,y+6,'h',1);g.put(x-5,y+4,'o');if(!side)g.put(x+5,y+4,'o');
  }
  function beret(g,x,y,back,large=false){
    const r=large?12:9;
    g.ellipse(x-1,y-7,r,4,'k');g.ellipse(x-2,y-8,r-1,3,'b');g.line(x-r+3,y-9,x+2,y-9,'c',1);
    g.line(x-r+2,y-5,x+r-2,y-5,'a',2);
    if(!back){g.ellipse(x+4,y-8,2,1,'m');g.put(x+4,y-9,'n');}
    else{g.line(x-3,y-6,x+3,y-6,'c',1);g.put(x,y-5,'m');}
  }
  function trouper(dir,mode,step){
    const g=A.grid(40,40),back=dir==='north',side=dir==='east'||dir==='west';
    const stride=mode==='walk'?Math.sin(step*Math.PI/3):0,bob=mode==='idle'?step:Math.round(Math.abs(stride)),throwing=mode==='attack'&&step===1;
    const cx=20,head=14-bob;
    for(const [dx,sign]of [[-4,1],[4,-1]]){const x=cx+dx+Math.round(stride*sign*2);g.line(cx+dx,30,x,36,'k',4);g.line(cx+dx,30,x,35,'i',2);g.ellipse(x,38,3,1,'k');g.line(x-1,37,x+1,37,'m',1);}
    g.poly([[cx-7,21-bob],[cx+7,21-bob],[cx+9,32],[cx+4,35],[cx,32],[cx-4,35],[cx-9,32]],'k');
    g.ellipse(cx,26-bob,7,7,'b');g.ellipse(cx-2,25-bob,4,5,'c');
    if(back){g.line(cx,24-bob,cx,32,'a',1);g.line(cx-4,31,cx+3,31,'c',1);}
    else{g.poly([[cx-5,21-bob],[cx,24-bob],[cx+5,21-bob],[cx+3,27-bob],[cx,25-bob],[cx-3,27-bob]],'i');g.put(cx,25-bob,'j');g.line(cx-4,29-bob,cx+4,29-bob,'m',1);g.rect(cx-5,30-bob,3,2,'j');g.put(cx+3,27-bob,'n');}
    for(const sign of [-1,1]){const x=cx+sign*(throwing?14:11),y=(throwing?22:29)-bob;g.line(cx+sign*6,23-bob,x,y,'k',4);g.line(cx+sign*6,23-bob,x,y,'b',2);if(sign===1)fan(g,x,y);g.ellipse(x,y,2,2,'f');g.put(x,y-1,'g');}
    const hx=side?22:cx;face(g,hx,head,side,back);beret(g,hx,head,back);
    g.line(hx-4,head+8,hx+4,head+8,'i',2);g.put(hx-3,head+7,'j');
    if(dir==='west')for(const row of g.cells)row.reverse();return g.rows();
  }
  const frames=[],directional={};for(const dir of ['south','east','north','west']){const set=directional[dir]={};for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['guard',1]]){set[mode]=[];for(let i=0;i<count;i++){set[mode].push(frames.length);frames.push(trouper(dir,mode,i));}}}
  const sprite=A.compactSprite({palette,frames,density:2,authored:true,directional,animations:directional.south});sprite.directional=directional;G.forms.jester.sprite=sprite;
  function tansy(g,frame){
    const cx=25,bob=frame===1?1:frame===3?-1:0,cast=frame===2,head=16-bob;
    for(const [dx,sign]of [[-5,1],[5,-1]]){const x=cx+dx+bob*sign;g.line(cx+dx,39,x,46,'k',5);g.line(cx+dx,39,x,45,'i',3);g.ellipse(x,48,4,1,'k');g.line(x-2,47,x+2,47,'m',1);}
    g.poly([[cx-10,26-bob],[cx+10,26-bob],[cx+13,41],[cx+6,45],[cx,40],[cx-6,45],[cx-13,41]],'k');g.ellipse(cx,34-bob,10,10,'i');g.ellipse(cx-3,32-bob,6,7,'j');
    g.poly([[cx-7,25-bob],[cx,29-bob],[cx+7,25-bob],[cx+4,34-bob],[cx,31-bob],[cx-4,34-bob]],'b');g.line(cx-5,38-bob,cx+5,38-bob,'m',2);g.put(cx+4,34-bob,'n');g.rect(cx-7,39-bob,4,3,'j');
    for(const sign of [-1,1]){const x=cx+sign*(cast?18:14),y=(cast?25:36)-bob;g.line(cx+sign*8,29-bob,x,y,'k',6);g.line(cx+sign*8,29-bob,x,y,'i',4);
      if(sign===1)fan(g,x,y);else{g.ellipse(x,y-2,5,3,'k');g.ellipse(x,y-3,4,2,'m');g.line(x-2,y-4,x+2,y-4,'g',1);g.put(x,y-3,'o');}
      g.ellipse(x,y,3,2,'f');g.line(x-1,y-1,x+1,y-1,'g',1);
    }
    face(g,cx,head,false,false,true);beret(g,cx,head,false,true);
    // A copper-tied braid sits against the coat, rather than trailing in space.
    for(const y of [head+6,head+9,head+12]){g.ellipse(cx+8,y,2,2,'a');g.put(cx+8,y,'m');}
    g.line(cx-6,head+10,cx+6,head+10,'i',2);g.line(cx-4,head+9,cx+4,head+9,'j',1);
  }
  G.enemies.royalFool.sprite=A.compactSprite(A.authored(50,50,palette,tansy));
})();
