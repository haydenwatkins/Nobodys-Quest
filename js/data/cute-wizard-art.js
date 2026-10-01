/* A kindly old sage: the hat frames his face instead of hiding it. Directional
   casting is visual only; Curse still fires immediately with its real recoil. */
"use strict";
(() => {
  const A=G.authoredPixelArt;
  const palette={k:'#292c42',a:'#41446c',b:'#626ba0',c:'#94a9c2',d:'#e1e7db',e:'#fff0c5',f:'#b4e2dd',g:'#d3af79',h:'#aa8493',i:'#e6c0a3',j:'#817d9b',l:'#675251',m:'#988276',n:'#466c7e',o:'#8bccd0',p:'#f9e5c8'};
  function limb(g,x,y,tx,ty,color){g.line(x,y,tx,ty,'k',3);g.line(x,y,tx,ty,color,1);}
  function draw(dir,mode,step){
    const g=A.grid(36,38),side=dir==='east'||dir==='west',back=dir==='north',cast=mode==='attack';
    const stride=mode==='walk'?Math.sin(step*Math.PI/3):0,bob=mode==='idle'?step:Math.round(Math.abs(stride));
    const cx=14,head=16-bob,flare=cast&&step===1;
    for(const [x,sign]of [[cx-3,1],[cx+3,-1]]){g.ellipse(x+Math.round(stride*sign),36,3,1,'k');g.put(x+Math.round(stride*sign),35,'m');}
    g.ellipse(cx,28-bob,8,8,'k');g.ellipse(cx,27-bob,7,7,'a');
    g.ellipse(cx-2,26-bob,4,5,'b');g.line(cx-3,25-bob,cx-4,32,'c',1);
    g.line(cx-5,33,cx+4,33,'g',1);g.line(cx+2,25-bob,cx+3,32,'j',1);
    g.rect(cx-1,25-bob,3,2,'g');g.put(cx,25-bob,'e');
    const handY=flare?22-bob:29-bob,orbY=flare?8-bob:11-bob;
    limb(g,cx+6,25-bob,29,handY,'b');g.ellipse(28,handY,2,2,'i');
    limb(g,cx-6,25-bob,cx-(flare?10:8),flare?22-bob:30-bob,'b');g.put(cx-(flare?10:8),flare?22-bob:30-bob,'i');
    g.line(30,orbY+3,29,35,'k',3);g.line(30,orbY+3,29,34,'l',1);g.put(30,30,'g');
    g.ellipse(30,orbY,flare?5:4,flare?5:4,'k');g.ellipse(30,orbY,flare?4:3,flare?4:3,'n');g.ellipse(29,orbY-1,2,2,'o');g.put(29,orbY-2,'f');
    if(flare){g.put(25,orbY-2,'f');g.put(34,orbY+2,'e');g.put(30,orbY-5,'f');}
    g.ellipse(cx,head,7,7,'k');g.ellipse(cx,head,6,6,back?'j':'i');
    if(!back){
      const xs=side?[cx+3]:[cx-3,cx+2];for(const x of xs){g.rect(x,head-1,2,2,'a');g.put(x,head-2,'d');}
      g.ellipse(cx+(side?3:0),head+2,2,1,'p');g.put(cx-4,head+2,'h');
      g.poly([[cx-5,head+3],[cx-2,head+3],[cx,head+4],[cx+3,head+3],[cx+5,head+3],[cx+4,head+6],[cx+1,head+8],[cx-3,head+6]],'j');
      g.poly([[cx-4,head+3],[cx-1,head+4],[cx+2,head+3],[cx+4,head+3],[cx+2,head+6],[cx,head+7],[cx-2,head+5]],'d');g.put(cx,head+3,'a');
    }else{g.line(cx-4,head+2,cx+4,head+2,'d',1);g.line(cx-2,head+3,cx+3,head+4,'c',1);}
    // Drooping felt tip, broad curved brim, a little warm brass star.
    g.poly([[cx-8,head-6],[cx-6,head-11],[cx-2,head-14],[cx+3,head-13],[cx+7,head-9],[cx+6,head-6]],'k');
    g.poly([[cx-6,head-7],[cx-4,head-10],[cx-1,head-12],[cx+2,head-11],[cx+5,head-9],[cx+4,head-7]],'b');
    g.line(cx-3,head-10,cx,head-11,'c',1);g.ellipse(cx,head-6,10,2,'k');g.ellipse(cx,head-7,9,1,'b');g.line(cx-6,head-6,cx+5,head-6,'g',1);
    g.put(cx+1,head-10,'e');g.put(cx+2,head-9,'g');
    if(dir==='west')for(const row of g.cells)row.reverse();return g.rows();
  }
  const frames=[],directional={};
  for(const dir of ['south','east','north','west']){
    const set=directional[dir]={};for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['guard',1]]){
      set[mode]=[];for(let i=0;i<count;i++){set[mode].push(frames.length);frames.push(draw(dir,mode,i));}
    }
  }
  const sprite=A.compactSprite({palette,frames,density:2,authored:true,directional,animations:directional.south});sprite.directional=directional;G.forms.wizard.sprite=sprite;
})();
