/* Hedgehare and Grandmother Briar: soft garden neighbours, fitted aprons,
   joined ears and tools carried in their hands. Stable footprints and clocks. */
"use strict";
(() => {
  const A=G.authoredPixelArt;
  const palette={k:'#343a36',a:'#5c514b',b:'#8e7360',c:'#b5997a',d:'#dec5a0',e:'#f4e4bf',f:'#fff4db',g:'#d89995',h:'#57745c',i:'#82956d',j:'#b5c69a',l:'#936c49',m:'#c19561',n:'#e3bd7d',o:'#b0b1a1',p:'#d4d2bb',q:'#bf7977',r:'#567a78',s:'#9bb9a0'};
  function basket(g,x,y,large=false){
    const rx=large?6:5,ry=large?4:3;
    g.line(x-rx+1,y-2,x-rx+2,y-7,'a',2);g.line(x-rx+2,y-7,x,y-9,'a',2);g.line(x,y-9,x+rx-2,y-7,'a',2);g.line(x+rx-2,y-7,x+rx-1,y-2,'a',2);
    g.line(x-rx+2,y-6,x,y-8,'m',1);g.line(x,y-8,x+rx-2,y-6,'m',1);
    g.ellipse(x,y,rx+1,ry+1,'k');g.ellipse(x,y,rx,ry,'l');g.line(x-rx+1,y-2,x+rx-1,y-2,'n',2);
    for(const yy of [y,y+2])g.line(x-rx+2,yy,x+rx-2,yy,'m',1);for(const dx of [-2,1,3])g.line(x+dx,y-1,x+dx,y+ry-1,'n',1);
    // Seedlings sit inside the rim, rather than hovering above the basket.
    g.line(x,y-2,x,y-6,'h',1);g.ellipse(x-2,y-5,2,1,'j');g.ellipse(x+2,y-6,2,1,'i');
  }
  function cane(g,x,y,cast,large=false){
    const tipX=x+(cast?5:2),tipY=y-(large?20:16);
    g.line(x+1,y+8,tipX,tipY,'k',large?4:3);g.line(x+1,y+7,tipX,tipY,'l',large?2:1);g.line(x,y+2,tipX-1,tipY+2,'m',1);
    g.line(tipX,tipY,tipX-3,tipY-3,'l',2);g.ellipse(tipX-3,tipY-3,3,2,'h');g.ellipse(tipX-4,tipY-4,2,1,'j');g.put(tipX-3,tipY-3,'i');
  }
  function hareface(g,x,y,side,back){
    g.ellipse(x-5,y-7,3,8,'k');g.ellipse(x-5,y-8,2,7,'c');g.line(x-5,y-12,x-5,y-7,'g',1);
    g.line(x+5,y-5,x+6,y-12,'k',5);g.line(x+6,y-12,x+10,y-8,'k',4);g.line(x+5,y-5,x+6,y-11,'c',3);g.line(x+6,y-11,x+9,y-8,'c',2);g.put(x+6,y-10,'g');
    g.ellipse(x,y,9,8,'k');g.ellipse(x,y-1,8,7,'c');g.ellipse(x-1,y-2,6,5,'d');
    if(back){g.line(x-3,y+2,x+3,y+3,'b',1);return;}
    g.ellipse(side?x+3:x,y+3,side?5:6,3,'e');
    for(const ex of side?[x+3]:[x-4,x+4]){g.rect(ex,y,2,3,'a');g.put(ex,y,'f');}
    const mx=side?x+5:x;g.ellipse(mx,y+3,2,1,'g');g.put(mx,y+5,'a');g.put(mx-1,y+6,'b');g.put(mx+1,y+6,'b');g.put(x-6,y+3,'g');
  }
  function hedge(dir,mode,step){
    const g=A.grid(42,40),cx=21,side=dir==='east'||dir==='west',back=dir==='north';
    const stride=mode==='walk'?Math.round(Math.sin(step*Math.PI/3)*2):0,bob=mode==='idle'?step:Math.abs(stride)>0?1:0,cast=mode==='attack'&&step===1,hy=16-bob;
    for(const sign of [-1,1]){const x=cx+sign*4+stride*sign;g.line(cx+sign*4,31,x,36,'k',4);g.line(cx+sign*4,31,x,35,'c',2);g.ellipse(x,38,4,1,'k');g.line(x-2,37,x+2,37,'e',1);}
    g.ellipse(cx,28-bob,8,8,'k');g.ellipse(cx,27-bob,7,7,'c');g.ellipse(cx-2,26-bob,4,5,'d');
    g.poly([[cx-5,23-bob],[cx+5,23-bob],[cx+7,33],[cx+4,35],[cx-5,35],[cx-7,33]],'h');g.line(cx-4,25-bob,cx+3,25-bob,'j',1);
    if(back){g.line(cx-4,24-bob,cx+4,31,'i',1);g.line(cx+4,24-bob,cx-4,31,'i',1);}
    else{g.rect(cx-3,29-bob,6,4,'i');g.line(cx,30-bob,cx,32-bob,'j',1);g.put(cx-1,30-bob,'e');}
    hareface(g,cx+(side?2:0),hy,side,back);g.line(cx-4,hy+8,cx+4,hy+8,'r',2);g.put(cx-3,hy+7,'s');
    const bx=9,by=32-bob;basket(g,bx,by);g.line(cx-6,25-bob,bx-3,by-5,'k',4);g.line(cx-6,25-bob,bx-3,by-5,'c',2);g.ellipse(bx-3,by-5,2,2,'d');
    const hx=cast?31:30,handY=(cast?25:29)-bob;g.line(cx+6,25-bob,hx,handY,'k',4);g.line(cx+6,25-bob,hx,handY,'c',2);cane(g,hx,handY,cast);g.ellipse(hx,handY,2,2,'d');g.put(hx,handY-1,'e');
    if(dir==='west')for(const row of g.cells)row.reverse();return g.rows();
  }
  const frames=[],directional={};for(const dir of ['south','east','north','west']){const set=directional[dir]={};for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['guard',1]]){set[mode]=[];for(let i=0;i<count;i++){set[mode].push(frames.length);frames.push(hedge(dir,mode,i));}}}
  const sprite=A.compactSprite({palette,frames,density:2,authored:true,directional,animations:directional.south});sprite.directional=directional;G.forms.druid.sprite=sprite;
  function briar(g,frame){
    const cx=27,bob=frame===1?1:frame===3?-1:0,cast=frame===2,hy=17-bob;
    for(const sign of [-1,1]){const x=cx+sign*5+bob*sign;g.line(cx+sign*5,40,x,46,'k',5);g.line(cx+sign*5,40,x,45,'h',3);g.ellipse(x,48,4,1,'k');g.line(x-2,47,x+2,47,'l',1);}
    g.poly([[cx-10,25-bob],[cx+10,25-bob],[cx+13,42],[cx+6,45],[cx,43],[cx-6,45],[cx-13,42]],'k');g.ellipse(cx,35-bob,10,10,'h');g.ellipse(cx-3,32-bob,6,8,'i');
    g.poly([[cx-7,29-bob],[cx+7,29-bob],[cx+8,41],[cx+4,43],[cx-6,43],[cx-8,41]],'s');g.line(cx-6,30-bob,cx+5,30-bob,'e',1);g.rect(cx-4,36-bob,8,4,'i');g.line(cx,37-bob,cx,39-bob,'j',1);
    g.ellipse(cx,hy,11,10,'k');g.ellipse(cx,hy,10,9,'c');g.ellipse(cx-2,hy-2,8,7,'d');g.ellipse(cx,hy+3,8,5,'d');
    for(const ex of [cx-4,cx+4]){g.rect(ex,hy,2,3,'a');g.put(ex,hy,'f');g.line(ex-1,hy-3,ex+2,hy-3,'p',1);}
    g.put(cx,hy+4,'e');g.line(cx-2,hy+7,cx+2,hy+7,'b',1);g.ellipse(cx-7,hy+4,2,1,'g');g.ellipse(cx+7,hy+4,2,1,'g');
    for(const yy of [hy+4,hy+7,hy+10]){g.ellipse(cx-9,yy,2,2,'o');g.put(cx-10,yy-1,'p');}g.put(cx-9,hy+12,'q');
    // Straw hat, flower stitched into its band, and attached silver braid.
    g.ellipse(cx,hy-9,10,6,'k');g.ellipse(cx-1,hy-10,9,5,'m');g.line(cx-6,hy-12,cx+5,hy-12,'n',1);g.ellipse(cx,hy-7,15,3,'k');g.ellipse(cx,hy-8,14,2,'n');g.line(cx-9,hy-7,cx+9,hy-7,'l',1);
    g.ellipse(cx+8,hy-8,3,2,'q');g.put(cx+8,hy-8,'e');
    const bx=11,by=38-bob;basket(g,bx,by,true);g.line(cx-8,29-bob,bx-3,by-5,'k',6);g.line(cx-8,29-bob,bx-3,by-5,'h',4);g.ellipse(bx-3,by-5,3,2,'d');
    const hx=cast?41:39,handY=(cast?29:36)-bob;g.line(cx+8,29-bob,hx,handY,'k',6);g.line(cx+8,29-bob,hx,handY,'h',4);cane(g,hx,handY,cast,true);g.ellipse(hx,handY,3,2,'d');g.line(hx-1,handY-1,hx+1,handY-1,'e',1);
  }
  G.enemies.grandmotherBriar.sprite=A.compactSprite(A.authored(54,50,palette,briar));
})();
