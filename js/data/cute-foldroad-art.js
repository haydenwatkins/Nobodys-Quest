/* Foldstep Fox and Sumi keep the folded roads: warm fox faces, joined tails,
   practical wrap coats and a blade held through every pose. No combat changes. */
"use strict";
(() => {
  const A=G.authoredPixelArt;
  const palette={k:'#303541',a:'#55434a',b:'#935c4e',c:'#c18560',d:'#e6b785',e:'#fae4bf',f:'#fff7e4',g:'#c67c7d',h:'#5b788b',i:'#859ba5',j:'#bdccc2',l:'#3f526d',m:'#61758d',n:'#457c7b',o:'#8bb8a5',p:'#b99a67',q:'#dfc893'};
  function foxface(g,x,y,side,back,older=false){
    const rx=older?10:8,ry=older?9:7,fur=older?'i':'c',light=older?'j':'d';
    for(const sign of [-1,1]){
      g.poly([[x+sign*(rx-2),y-4],[x+sign*(rx+1),y-12],[x+sign*3,y-7]],'k');
      g.poly([[x+sign*(rx-2),y-5],[x+sign*rx,y-10],[x+sign*4,y-7]],fur);g.line(x+sign*(rx-2),y-6,x+sign*(rx-1),y-8,'g',1);
    }
    g.ellipse(x,y,rx+1,ry+1,'k');g.ellipse(x,y,rx,ry,fur);g.ellipse(x-1,y-2,rx-2,ry-2,light);
    if(back){g.line(x-3,y+2,x,y+4,fur,1);g.line(x,y+4,x+3,y+2,fur,1);return;}
    g.poly([[x-rx+1,y],[x-3,y+1],[x,y+4],[x+3,y+1],[x+rx-1,y],[x+rx-1,y+4],[x,y+ry],[x-rx+1,y+4]],'e');
    const mx=side?x+4:x;
    for(const ex of side?[x+3]:[x-4,x+4]){g.rect(ex,y-1,1,3,'k');g.put(ex,y-2,'f');if(older)g.line(ex-1,y-4,ex+1,y-4,'e',1);}
    g.ellipse(mx,y+3,2,1,'a');g.put(mx-1,y+2,'k');g.line(mx,y+4,mx,y+5,'b',1);g.put(mx-1,y+5,'b');g.put(mx+1,y+5,'b');g.put(x-rx+2,y+2,'g');
  }
  function tail(g,x,y,back,large=false){
    const r=large?6:4;
    g.line(x+r,y+4,x,y-1,'k',r*2);g.ellipse(x,y-3,r+1,r+3,'k');g.ellipse(x,y-3,r,r+2,large?'i':'c');
    g.poly([[x-r+1,y-5],[x,y-3],[x+r-1,y-5],[x+r-1,y-8],[x-1,y-9],[x-r+1,y-7]],'e');g.put(x-1,y-7,'f');
    if(back)g.line(x,y-2,x+1,y+3,large?'h':'b',1);
  }
  function sword(g,x,y,draw,large=false){
    const dx=draw?(large?13:10):(large?6:5),dy=draw?(large?-11:-9):(large?-16:-12);
    g.line(x-1,y+3,x+dx,y+dy,'k',large?4:3);g.line(x+1,y-1,x+dx,y+dy,'i',large?2:1);g.line(x+2,y-2,x+dx,y+dy+1,'f',1);
    g.line(x-3,y-1,x+3,y+1,'p',2);g.line(x,y,x-1,y+3,'a',2);
  }
  function foldstep(dir,mode,step){
    const g=A.grid(40,40),back=dir==='north',side=dir==='east'||dir==='west',cx=20;
    const stride=mode==='walk'?Math.round(Math.sin(step*Math.PI/3)*2):0,bob=mode==='idle'?step:Math.abs(stride)>0?1:0,draw=mode==='attack'&&step===1;
    tail(g,back?cx:cx-11,back?33:30,back);
    for(const sign of [-1,1]){const x=cx+sign*4+stride*sign;g.line(cx+sign*4,31,x,36,'k',4);g.line(cx+sign*4,31,x,35,'l',2);g.ellipse(x,38,3,1,'k');g.line(x-1,37,x+1,37,'p',1);}
    g.poly([[cx-7,21-bob],[cx+7,21-bob],[cx+9,33],[cx+3,35],[cx,32],[cx-4,35],[cx-9,33]],'k');g.ellipse(cx,27-bob,7,7,'l');g.ellipse(cx-2,25-bob,4,4,'m');
    if(back){g.line(cx,24-bob,cx,31,'l',1);g.poly([[cx-3,25-bob],[cx+3,25-bob],[cx,28-bob]],'o');}
    else{g.line(cx-4,22-bob,cx+3,29-bob,'j',2);g.line(cx+4,22-bob,cx-2,29-bob,'h',2);g.rect(cx-5,30-bob,3,3,'p');g.put(cx-4,30-bob,'q');}
    g.line(cx-6,29-bob,cx+6,29-bob,'n',2);g.line(cx-5,28-bob,cx+5,28-bob,'o',1);
    const hx=cx+(side?2:0),hy=14-bob;
    foxface(g,hx,hy,side,back);g.line(hx-4,hy+8,hx+4,hy+8,'n',2);
    const handX=draw?27:29,handY=(draw?23:29)-bob;
    g.line(cx+5,24-bob,handX,handY,'k',4);g.line(cx+5,24-bob,handX,handY,'l',2);sword(g,handX,handY,draw);g.ellipse(handX,handY,2,2,'d');g.put(handX,handY-1,'e');
    g.line(cx-5,24-bob,cx-9,29-bob,'k',4);g.line(cx-5,24-bob,cx-9,29-bob,'l',2);g.ellipse(cx-9,29-bob,2,2,'d');
    if(dir==='west')for(const row of g.cells)row.reverse();return g.rows();
  }
  const frames=[],directional={};for(const dir of ['south','east','north','west']){const set=directional[dir]={};for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['guard',1]]){set[mode]=[];for(let i=0;i<count;i++){set[mode].push(frames.length);frames.push(foldstep(dir,mode,i));}}}
  const sprite=A.compactSprite({palette,frames,density:2,authored:true,directional,animations:directional.south});sprite.directional=directional;G.forms.samurai.sprite=sprite;
  function sumi(g,frame){
    const cx=25,bob=frame===1?1:frame===3?-1:0,draw=frame===2,hy=17-bob;
    tail(g,cx-15,38,false,true);
    for(const sign of [-1,1]){const x=cx+sign*5+bob*sign;g.line(cx+sign*5,39,x,46,'k',5);g.line(cx+sign*5,39,x,45,'h',3);g.ellipse(x,48,4,1,'k');g.line(x-2,47,x+2,47,'p',1);}
    g.poly([[cx-9,26-bob],[cx+9,26-bob],[cx+12,41],[cx+5,44],[cx,41],[cx-6,44],[cx-12,41]],'k');g.ellipse(cx,34-bob,9,9,'n');g.ellipse(cx-2,32-bob,6,7,'o');
    g.line(cx-6,26-bob,cx+3,36-bob,'e',3);g.line(cx+6,26-bob,cx-3,36-bob,'g',2);g.line(cx-8,37-bob,cx+8,37-bob,'h',2);g.put(cx,37-bob,'q');
    g.line(cx-7,39-bob,cx-8,42,'n',1);g.line(cx+6,39-bob,cx+7,42,'n',1);
    foxface(g,cx,hy,false,false,true);g.line(cx-6,hy+10,cx+6,hy+10,'g',2);g.line(cx-5,hy+9,cx+5,hy+9,'e',1);
    const handX=draw?34:36,handY=(draw?27:36)-bob;
    g.line(cx+7,29-bob,handX,handY,'k',6);g.line(cx+7,29-bob,handX,handY,'n',4);sword(g,handX,handY,draw,true);g.ellipse(handX,handY,3,2,'j');g.put(handX-1,handY-1,'e');
    g.line(cx-7,29-bob,cx-13,34-bob,'k',6);g.line(cx-7,29-bob,cx-13,34-bob,'n',4);g.ellipse(cx-13,34-bob,3,2,'j');
  }
  G.enemies.paperRonin.sprite=A.compactSprite(A.authored(50,50,palette,sumi));
})();
