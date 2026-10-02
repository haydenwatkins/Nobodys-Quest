/* Orchard creatures and an independent wooden road watchman. Art only. */
"use strict";
(() => {
  const A=G.authoredPixelArt;
  const palette={k:'#35413e',a:'#566457',b:'#849d70',c:'#b3ca92',d:'#eee8cb',e:'#f6c47e',f:'#89644c',g:'#bd8d61',h:'#e7b888',i:'#497c72',j:'#80b7a0',l:'#bedfc5',m:'#7d5d6f',n:'#dfa5ac',o:'#486578',p:'#86aeb7'};
  function bud(spitter) {return A.compactSprite(A.authored(30,30,palette,(g,f)=>{
    const bob=f===1?1:f===3?-1:0,y=18+bob;
    for(const [x,dx]of [[9,-1],[21,1]]) {g.line(x,y+4,x+dx*(f===1?5:3),27,'k',3);g.line(x,y+4,x+dx*(f===1?5:3),26,'f',2);g.line(x+dx*3,27,x+dx*5,27,'h',1);}
    g.ellipse(15,y,12,8,'k');g.ellipse(15,y-1,11,7,spitter?'f':'i');g.ellipse(13,y-3,8,4,spitter?'g':'b');
    g.poly([[5,y-2],[2,y-7],[7,y-10],[11,y-5]],'a');g.poly([[19,y-5],[24,y-10],[28,y-6],[25,y-1]],'a');
    g.poly([[6,y-4],[4,y-7],[7,y-8],[10,y-4]],'b');g.poly([[20,y-4],[24,y-8],[26,y-6],[24,y-2]],'c');
    g.line(15,y-7,15,4,'a',2);g.poly([[15,6],[8,1],[6,5],[12,8]],'b');g.poly([[15,5],[21,1],[24,4],[18,8]],'c');g.line(17,5,21,3,'l',1);
    for(const x of [9,19]){g.rect(x,y-3,3,4,'k');g.put(x,y-3,'d');}
    g.put(6,y+1,'n');g.put(24,y+1,'n');
    if(spitter){g.ellipse(15,y+3,f===2?5:4,3,'k');g.ellipse(15,y+3,f===2?3:2,2,'m');g.line(12,y+1,17,y+1,'h',1);}
    else g.line(13,y+3,17,y+3,'a',1);
    g.line(9,y+6,12,y+6,'j',1);g.line(19,y+5,22,y+4,'h',1);
  }));}
  G.enemies.orchardTangle.sprite=bud(false);G.enemies.orchardSpitter.sprite=bud(true);
  function limb(g,x,y,tx,ty,color,w=3){g.line(x,y,tx,ty,'k',w+2);g.line(x,y,tx,ty,color,w);}
  function watchman(g,dir,mode,step) {
    const side=dir==='east'||dir==='west',back=dir==='north',hit=mode==='attack',guard=mode==='guard';
    const stride=mode==='walk'?Math.sin(step*Math.PI/3):0,bob=mode==='idle'?step:Math.round(Math.abs(stride));
    const cx=27,hy=16-bob,hip=35-bob;
    // Carved root boots, a canvas work tabard and a warm seed-shell face.
    for(const [dx,phase]of [[-5,1],[5,-1]]) {const x=cx+dx+Math.round(stride*phase*2);limb(g,cx+dx,hip,x,42,'f',3);g.ellipse(x,44,5,2,'k');g.line(x-3,43,x+2,43,'g',1);}
    g.poly([[19,25-bob],[34,25-bob],[38,38-bob],[32,41-bob],[26,39-bob],[19,41-bob],[16,37-bob]],'k');
    g.poly([[21,26-bob],[32,26-bob],[35,37-bob],[31,39-bob],[26,37-bob],[20,39-bob],[19,36-bob]],'i');
    g.ellipse(cx,29-bob,8,9,'k');g.ellipse(cx,28-bob,7,8,'g');g.line(23,27-bob,23,34-bob,'h',1);g.line(31,28-bob,32,33-bob,'f',1);
    g.rect(22,28-bob,10,10,'o');g.line(23,28-bob,31,28-bob,'p',1);g.rect(25,32-bob,4,4,'e');g.put(26,33-bob,'f');
    const push=hit?(step===0?-2:step===1?5:1):0,hx=38+push,handY=(hit?25:31)-bob;
    limb(g,21,26-bob,16,31-bob,'g');limb(g,33,26-bob,hx,handY,'g');g.ellipse(hx,handY,3,3,'h');
    // A pruned wooden staff stays in the same hand through the thrust poses.
    const tx=hit&&step===1?53:hx+2,ty=hit&&step===1?18-bob:7-bob;
    limb(g,hx,handY,tx,ty,'f',2);g.line(hx+1,handY,tx+1,ty,'h',1);
    g.ellipse(tx,ty,2,3,'k');g.ellipse(tx,ty-1,1,2,'e');g.line(hx-3,handY+1,hx+3,handY+1,'e',1);
    const sx=guard?29:14,sy=32-bob;
    g.ellipse(sx,sy,7,8,'k');g.ellipse(sx,sy-1,6,7,'f');g.ellipse(sx,sy-1,4,5,'g');g.ellipse(sx,sy-1,2,3,'h');g.line(sx-4,sy-5,sx-4,sy+3,'e',1);
    g.ellipse(cx,hy,11,11,'k');g.ellipse(cx,hy-1,10,10,'f');g.ellipse(cx-3,hy-3,7,7,'g');
    // Copper edging is fitted to the wooden cap, rather than a player ornament.
    g.poly([[17,hy-4],[19,hy-10],[26,hy-12],[34,hy-9],[37,hy-4]],'k');
    g.poly([[19,hy-5],[21,hy-9],[26,hy-10],[32,hy-8],[35,hy-5]],'g');g.line(18,hy-4,36,hy-4,'e',2);
    if(!back){g.ellipse(cx+(side?3:0),hy+2,side?6:8,5,'a');for(const x of side?[cx+4]:[cx-5,cx+3]){g.rect(x,hy,3,4,'l');g.put(x,hy,'d');}g.line(cx+(side?3:-2),hy+7,cx+(side?6:2),hy+7,'h',1);g.put(cx-8,hy+4,'n');}
    else {g.line(cx,hy-7,cx,hy+6,'f',1);g.line(cx-4,hy+5,cx+4,hy+5,'h',1);}
    g.line(20,hy+10,34,hy+10,'i',3);g.line(21,hy+9,32,hy+9,'j',1);
    if(dir==='west')for(const row of g.cells)row.reverse();
  }
  const frames=[],directional={};
  for(const dir of ['south','east','north','west']){const set=directional[dir]={};for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['guard',1]]){set[mode]=[];for(let i=0;i<count;i++){const g=A.grid(56,48);watchman(g,dir,mode,i);set[mode].push(frames.length);frames.push(g.rows());}}}
  const dense={palette,frames,density:2,authored:true,directional,animations:directional.south};const sprite=A.compactSprite(dense);sprite.directional=directional;G.enemies.orchardGuard.sprite=sprite;
  G.orchardFoeArtIds=['orchardTangle','orchardSpitter','orchardGuard'];
})();
