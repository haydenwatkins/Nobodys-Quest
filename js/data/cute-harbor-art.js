/* Harborback and Marlo: rounded terrapin anatomy, sea-worn shell plates,
   and fitted harbor workwear. Stable IDs, footprints and combat clocks. */
"use strict";
(() => {
  const A=G.authoredPixelArt;
  const palette={k:'#293f46',a:'#465d55',b:'#64866d',c:'#92b68a',d:'#c9d6a3',e:'#fff0cf',f:'#b88f79',g:'#594d45',h:'#81624d',i:'#af8156',j:'#d8ab6e',l:'#efd39a',m:'#416d77',n:'#79aaa7',o:'#b9d5c0',p:'#806c59'};
  function flipper(g,x,y,dx,dy,large=false){
    const r=large?4:3;
    g.line(x,y,x+dx,y+dy,'k',r*2);g.line(x,y,x+dx,y+dy,'b',r*2-2);
    g.ellipse(x+dx,y+dy,r,r-1,'k');g.ellipse(x+dx,y+dy-1,r-1,r-2,'c');
    g.line(x+dx-1,y+dy,x+dx+1,y+dy,'d',1);
  }
  function shell(g,x,y,rx,ry){
    g.ellipse(x,y,rx+1,ry+1,'k');g.ellipse(x,y,rx,ry,'h');g.ellipse(x,y-1,rx-1,ry-1,'j');
    g.ellipse(x+1,y,rx-2,ry-2,'g');g.ellipse(x,y-1,rx-3,ry-3,'i');
    // Joined scutes follow the dome; quiet highlights explain their curvature.
    const px=Math.round(rx*.48),py=Math.round(ry*.45);
    g.poly([[x,y-py-2],[x+px,y-py],[x+px+1,y+py-1],[x,y+py+2],[x-px-1,y+py-1],[x-px,y-py]],'g');
    g.poly([[x,y-py-1],[x+px-1,y-py+1],[x+px,y+py-2],[x,y+py+1],[x-px,y+py-2],[x-px+1,y-py+1]],'i');
    g.line(x-px+2,y-py+1,x,y-py,'l',1);g.line(x-px+1,y-py+2,x-px+1,y,'j',1);
    for(const sign of [-1,1]){g.line(x+sign*px,y-py,x+sign*(rx-3),y-py-3,'g',1);g.line(x+sign*(px+1),y+py-1,x+sign*(rx-2),y+py+1,'g',1);}
    g.line(x,y+py+2,x,y+ry-2,'g',1);g.line(x,y-py-2,x,y-ry+2,'g',1);
    g.line(x-rx+3,y+ry-3,x-3,y+ry-1,'l',1);
  }
  function head(g,x,y,side,back,large=false){
    const rx=large?9:6,ry=large?7:5;
    g.ellipse(x,y,rx+1,ry+1,'k');g.ellipse(x,y,rx,ry,'b');g.ellipse(x-1,y-1,rx-1,ry-1,'c');
    if(back){g.line(x-2,y-2,x+2,y-2,'d',1);return;}
    g.ellipse(side?x+2:x,y+2,rx-1,ry-2,'d');
    for(const ex of side?[x+3]:large?[x-4,x+4]:[x-3,x+3]){g.ellipse(ex,y-1,large?2:1,2,'k');g.put(ex,y-2,'e');if(large)g.line(ex-2,y-4,ex+1,y-4,'a',1);}
    const mx=side?x+3:x;g.line(mx-2,y+3,mx+2,y+3,'a',1);g.put(mx-2,y+2,'a');g.put(mx+2,y+2,'a');
    g.put(x-rx+1,y+1,'f');if(!side)g.put(x+rx-1,y+1,'f');
  }
  function harborback(dir,mode,step){
    const g=A.grid(42,32),side=dir==='east'||dir==='west',back=dir==='north';
    const stride=mode==='walk'?Math.round(Math.sin(step*Math.PI/3)*2):0,bob=mode==='idle'?step:0;
    const jab=mode==='attack'&&step===1,brace=mode==='guard',cx=side?17:21,cy=(back?19:13)-bob;
    const rear=back?27:7,front=back?10:23;
    for(const sign of [-1,1]){flipper(g,cx+sign*8,rear-bob,sign*3,stride*sign);flipper(g,cx+sign*9,front-bob,sign*(jab?6:4),2-stride*sign);}
    if(side){g.poly([[5,13-bob],[1,16-bob],[7,17-bob]],'k');g.put(4,15-bob,'c');}
    else{const ty=back?31:2;g.line(cx,back?27:6,cx,ty,'k',3);g.put(cx,back?29:4,'c');}
    shell(g,cx,cy,side?12:11,side?10:10);
    const hx=side?(brace?29:33)+(jab?1:0):cx,hy=(back?(brace?9:5):side?18:(brace?23:25))-bob;
    g.line(side?27:cx,back?12:side?18:22,hx,hy,'k',7);g.line(side?27:cx,back?12:side?18:22,hx,hy,'c',5);
    head(g,hx,hy,side,back);
    // A neck cloth wraps the neck; no freestanding bows, flags or particles.
    if(side){g.line(28,16-bob,28,21-bob,'m',2);g.put(28,16-bob,'n');}
    else{g.line(cx-4,back?10-bob:21-bob,cx+4,back?10-bob:21-bob,'m',2);g.line(cx-3,back?9-bob:20-bob,cx+3,back?9-bob:20-bob,'n',1);}
    if(dir==='west')for(const row of g.cells)row.reverse();return g.rows();
  }
  const frames=[],directional={};for(const dir of ['south','east','north','west']){const set=directional[dir]={};for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['guard',1]]){set[mode]=[];for(let i=0;i<count;i++){set[mode].push(frames.length);frames.push(harborback(dir,mode,i));}}}
  const sprite=A.compactSprite({palette,frames,density:2,authored:true,directional,animations:directional.south});sprite.directional=directional;G.forms.turtle.sprite=sprite;
  function marlo(g,frame){
    const cx=29,bob=frame===1?1:frame===3?-1:0,cast=frame===2,cy=16-bob,hy=32-bob;
    for(const sign of [-1,1]){flipper(g,cx+sign*13,8-bob,sign*6,1+bob,true);flipper(g,cx+sign*13,27-bob,sign*(cast?10:7),cast?1:6,true);}
    g.line(cx,3-bob,cx,0,'k',4);shell(g,cx,cy,17,13);
    // A rope harness follows the shell rim and meets the neck bib.
    g.line(cx-12,22-bob,cx-7,27-bob,'p',2);g.line(cx+12,22-bob,cx+7,27-bob,'p',2);g.line(cx-6,27-bob,cx+6,27-bob,'p',2);
    for(const dx of [-10,-7,7,10])g.put(cx+dx,Math.abs(dx)>8?24-bob:26-bob,'l');
    g.line(cx,25-bob,cx,hy,'k',12);g.line(cx,25-bob,cx,hy,'c',10);head(g,cx,hy,false,false,true);
    // Rolled dock cap and fitted bib, stitched into the character silhouette.
    g.ellipse(cx,hy-7,10,3,'k');g.ellipse(cx-1,hy-8,8,3,'m');g.line(cx-7,hy-7,cx+7,hy-7,'n',1);g.line(cx-8,hy-5,cx+8,hy-5,'m',2);
    g.poly([[cx-7,hy+6],[cx+7,hy+6],[cx+5,hy+9],[cx,hy+10],[cx-5,hy+9]],'m');g.line(cx-4,hy+7,cx+4,hy+7,'n',1);g.put(cx,hy+8,'l');
  }
  G.enemies.admiralTortoise.sprite=A.compactSprite(A.authored(58,42,palette,marlo));
})();
