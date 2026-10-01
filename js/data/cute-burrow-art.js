/* Tunneltuft and Bram: rooted silhouettes, soft fur and attached digging paws.
   Stable mole IDs, footprints and all combat timing remain unchanged. */
"use strict";
(() => {
  const A=G.authoredPixelArt;
  const palette={k:'#302d3b',a:'#514650',b:'#7c6665',c:'#a48e78',d:'#d5bea0',e:'#f5ddbc',f:'#e7a5a2',g:'#f6efe0',h:'#91675c',i:'#be8c5b',j:'#dfbd7e',l:'#547877',m:'#91b4a4',n:'#516171',o:'#c8e5d7',p:'#9b727c'};
  function paw(g,x,y,r=3){
    g.ellipse(x,y,r+1,r,'k');g.ellipse(x,y-1,r,r-1,'c');
    for(const dx of [-2,0,2])g.line(x+dx,y+1,x+dx+1,y+3,'e',1);
  }
  function tuft(dir,mode,step){
    const g=A.grid(38,30),side=dir==='east'||dir==='west',back=dir==='north';
    const stride=mode==='walk'?Math.sin(step*Math.PI/3):0,bob=mode==='idle'?step:Math.round(Math.abs(stride));
    const dig=mode==='attack'&&step===1,cx=19,cy=20-bob;
    for(const dx of [-5,5]){const x=cx+dx+Math.round(stride*Math.sign(dx));g.ellipse(x,28,4,1,'k');g.line(x-2,27,x+2,27,'h',1);}
    g.ellipse(cx,cy,11,9,'k');g.ellipse(cx,cy-1,10,8,'a');g.ellipse(cx-2,cy-3,7,5,'b');
    if(!back){g.ellipse(cx,cy+1,6,5,'c');g.line(cx-3,cy+4,cx+3,cy+4,'d',1);}
    else{g.line(cx-3,cy-2,cx+2,cy+4,'b',1);g.put(cx-4,cy+1,'c');}
    for(const sign of [-1,1]){const x=cx+sign*(dig?15:13),y=(dig?15:21)-bob;g.line(cx+sign*8,cy-2,x,y,'k',4);g.line(cx+sign*8,cy-2,x,y,'b',2);paw(g,x,y,2);}
    const hx=side?22:cx,hy=10-bob;
    for(const dx of [-7,7]){g.ellipse(hx+dx,hy-4,3,3,'k');g.ellipse(hx+dx,hy-4,2,2,'b');g.put(hx+dx,hy-4,'p');}
    g.ellipse(hx,hy,9,8,'k');g.ellipse(hx,hy-1,8,7,'b');g.ellipse(hx-2,hy-2,6,5,'c');
    if(!back){
      const nose=side?hx+7:hx;g.ellipse(side?hx+4:hx,hy+4,side?5:6,3,'d');
      for(const x of side?[hx+3]:[hx-4,hx+3]){g.rect(x,hy,2,3,'a');g.put(x,hy,'g');}
      g.ellipse(nose,hy+4,3,2,'f');g.put(nose-1,hy+3,'e');g.line(nose-1,hy+7,nose+1,hy+7,'h',1);g.put(hx-5,hy+4,'p');
    }else g.line(hx-3,hy+2,hx+3,hy+3,'a',1);
    // A headlamp held by its leather band, and a small fitted neckerchief.
    g.line(hx-6,hy-5,hx+6,hy-5,'h',3);g.line(hx-5,hy-6,hx+5,hy-6,'i',1);
    if(!back){g.ellipse(hx,hy-6,3,3,'n');g.ellipse(hx,hy-7,2,2,'j');g.put(hx-1,hy-8,'g');g.put(hx,hy-7,'o');}
    g.line(hx-5,hy+8,hx+5,hy+8,'l',2);g.put(hx-4,hy+7,'m');
    if(dir==='west')for(const row of g.cells)row.reverse();return g.rows();
  }
  const frames=[],directional={};
  for(const dir of ['south','east','north','west']){
    const set=directional[dir]={};
    for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['guard',1]]){
      set[mode]=[];for(let i=0;i<count;i++){set[mode].push(frames.length);frames.push(tuft(dir,mode,i));}
    }
  }
  const sprite=A.compactSprite({palette,frames,density:2,authored:true,directional,animations:directional.south});
  sprite.directional=directional;G.forms.mole.sprite=sprite;
  function bram(g,frame){
    const cx=26,bob=frame===1?1:frame===3?-1:0,dig=frame===2,head=17-bob;
    for(const dx of [-7,7]){const x=cx+dx+bob*Math.sign(dx);g.ellipse(x,40,5,1,'k');g.line(x-3,39,x+3,39,'h',1);}
    g.ellipse(cx,28-bob,15,12,'k');g.ellipse(cx,27-bob,14,11,'a');g.ellipse(cx-3,25-bob,10,8,'b');g.ellipse(cx,31-bob,9,6,'c');
    for(const sign of [-1,1]){const x=cx+sign*19,y=(dig?23:30)-bob;g.line(cx+sign*11,27-bob,x,y,'k',7);g.line(cx+sign*11,27-bob,x,y,'b',5);paw(g,x,y,4);}
    for(const dx of [-10,10]){g.ellipse(cx+dx,head-7,4,4,'k');g.ellipse(cx+dx,head-7,3,3,'b');g.rect(cx+dx,head-8,1,2,'p');}
    g.ellipse(cx,head,13,11,'k');g.ellipse(cx,head-1,12,10,'b');g.ellipse(cx-2,head-3,9,7,'c');g.ellipse(cx,head+5,8,4,'d');
    for(const x of [cx-5,cx+4]){g.ellipse(x,head,3,4,'a');g.rect(x,head-1,1,2,'g');}
    g.ellipse(cx,head+5,4,3,'f');g.line(cx-1,head+4,cx+1,head+4,'e',1);g.line(cx-2,head+9,cx+2,head+9,'h',1);
    g.ellipse(cx-8,head+5,2,1,'p');g.ellipse(cx+8,head+5,2,1,'p');
    // The copper root crown joins a fitted band: nothing floats above him.
    g.line(cx-8,head-8,cx+8,head-8,'k',4);g.line(cx-7,head-9,cx+7,head-9,'i',2);
    for(const [dx,dy]of [[-7,-12],[0,-14],[7,-12]]){g.line(cx+Math.round(dx/2),head-9,cx+dx,head+dy,'h',2);g.ellipse(cx+dx,head+dy,2,2,'i');g.put(cx+dx-1,head+dy-1,'j');}
    g.poly([[cx-8,head+10],[cx+8,head+10],[cx+5,head+16],[cx,head+18],[cx-5,head+16]],'l');
    g.line(cx-5,head+11,cx+5,head+11,'m',1);g.ellipse(cx,head+14,2,3,'i');g.line(cx,head+12,cx,head+15,'e',1);
  }
  G.enemies.moleMonarch.sprite=A.compactSprite(A.authored(52,42,palette,bram));
})();
