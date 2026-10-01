/* Copper-and-glass brewing and a cloud-soft conductor. Visual gestures only. */
"use strict";
(() => {
  const A=G.authoredPixelArt;
  const brewer={k:'#292d39',a:'#465662',b:'#607f88',c:'#a5c3bb',d:'#eddcb4',e:'#fff0cb',f:'#b88060',g:'#d6a56b',h:'#967259',i:'#dfb298',j:'#b77782',l:'#59795d',m:'#8fbaa2',n:'#466b76',o:'#85d7c7',p:'#b7eee0'};
  const storm={k:'#2c2a43',a:'#4b4773',b:'#7879af',c:'#b6b7d3',d:'#e3e7e2',e:'#fff0bd',f:'#b17b67',g:'#daa978',h:'#c99791',i:'#dbb398',j:'#776d87',l:'#4b6e89',m:'#90cbd6',n:'#f0c46d',o:'#a1e7e5',p:'#f2f3df'};
  function limb(g,x,y,tx,ty,color){g.line(x,y,tx,ty,'k',3);g.line(x,y,tx,ty,color,1);}
  function face(g,cx,y,side,back){
    g.ellipse(cx,y,7,7,'k');g.ellipse(cx,y,6,6,back?'h':'i');
    if(back){g.line(cx-3,y+2,cx+3,y+3,'f',1);return;}
    for(const x of side?[cx+3]:[cx-3,cx+2]){g.rect(x,y-1,2,3,'a');g.put(x,y-1,'e');}
    g.line(cx+(side?2:-1),y+4,cx+(side?4:1),y+4,'f',1);g.put(cx-4,y+3,'j');
  }
  function feet(g,cx,stride,y){for(const [dx,sign]of [[-3,1],[3,-1]]){const x=cx+dx+Math.round(stride*sign);g.ellipse(x,y,3,1,'k');g.line(x-1,y-1,x+1,y-1,'h',1);}}
  function brew(dir,mode,step){
    const g=A.grid(36,36),side=dir==='east'||dir==='west',back=dir==='north';
    const stride=mode==='walk'?Math.sin(step*Math.PI/3):0,bob=mode==='idle'?step:Math.round(Math.abs(stride));
    const lift=mode==='attack'&&step===1,cx=14,head=13-bob;
    feet(g,cx,stride,34);g.ellipse(cx,25-bob,8,8,'k');g.ellipse(cx,24-bob,7,7,'b');
    g.ellipse(cx-2,24-bob,4,5,'c');g.line(cx-4,30,cx+4,30,'a',1);
    // Field apron, stitched pocket and leather herb satchel.
    if(!back){g.poly([[cx-4,21-bob],[cx+4,21-bob],[cx+5,30],[cx-5,30]],'g');g.rect(cx-2,25-bob,4,3,'h');g.put(cx-1,26-bob,'d');g.line(cx-3,21-bob,cx+3,21-bob,'e',1);}
    else{g.line(cx-4,22-bob,cx+4,28-bob,'g',1);g.line(cx+4,22-bob,cx-4,28-bob,'g',1);}
    g.ellipse(5,26-bob,4,5,'k');g.ellipse(5,25-bob,3,4,'h');g.line(3,23-bob,7,23-bob,'g',1);g.put(5,24-bob,'e');
    limb(g,cx-6,22-bob,5,28-bob,'b');g.put(5,28-bob,'i');
    const handY=lift?17-bob:25-bob,bottleX=lift?30:28;
    limb(g,cx+6,22-bob,bottleX-2,handY,'b');g.ellipse(bottleX-2,handY,2,2,'i');
    g.ellipse(bottleX,handY-3,4,5,'k');g.ellipse(bottleX,handY-3,3,4,'n');g.ellipse(bottleX,handY-2,2,2,'o');
    g.line(bottleX-1,handY-5,bottleX-1,handY-3,'p',1);g.rect(bottleX-1,handY-9,2,3,'g');g.put(bottleX,handY-9,'e');
    if(lift){g.put(bottleX+3,handY-8,'m');g.put(bottleX+4,handY-5,'p');}
    face(g,cx,head,side,back);
    g.ellipse(cx,head-6,8,4,'k');g.ellipse(cx,head-7,7,3,'h');g.ellipse(cx-3,head-8,4,2,'g');g.line(cx-5,head-5,cx+5,head-5,'f',1);
    // Forehead goggles leave the eyes and smile visible.
    if(!back){g.line(cx-6,head-4,cx+6,head-4,'h',1);for(const x of side?[cx+2]:[cx-4,cx+3]){g.ellipse(x,head-4,3,2,'a');g.ellipse(x,head-4,2,1,'o');g.put(x-1,head-4,'p');}}
    if(dir==='west')for(const row of g.cells)row.reverse();return g.rows();
  }
  function conduct(dir,mode,step){
    const g=A.grid(38,38),side=dir==='east'||dir==='west',back=dir==='north';
    const stride=mode==='walk'?Math.sin(step*Math.PI/3):0,bob=mode==='idle'?step:Math.round(Math.abs(stride));
    const flare=mode==='attack'&&step===1,cx=19,head=14-bob;
    feet(g,cx,stride,36);g.ellipse(cx,28-bob,9,8,'k');g.ellipse(cx,27-bob,8,7,'a');
    g.ellipse(cx-2,26-bob,5,5,'b');g.line(cx-5,32,cx+4,32,'c',1);g.line(cx+4,25-bob,cx+5,30,'j',1);
    g.ellipse(cx,22-bob,8,3,'k');g.ellipse(cx,21-bob,7,2,'d');g.line(cx-4,23-bob,cx+4,23-bob,'g',1);
    if(back){g.line(cx,25-bob,cx-2,28-bob,'n',1);g.line(cx-2,28-bob,cx+2,28-bob,'n',1);g.line(cx+2,28-bob,cx,31,'n',1);}
    else{g.rect(cx-1,24-bob,3,2,'g');g.put(cx,24-bob,'e');}
    for(const sign of [-1,1]){
      const x=cx+sign*(flare?15:11),y=(flare?20:28)-bob;
      limb(g,cx+sign*6,25-bob,x,y,'b');g.ellipse(x,y,2,2,'i');g.line(x-sign*2,y-2,x-sign*2,y+1,'g',1);
      if(flare){g.ellipse(x,y,3,3,'l');g.ellipse(x,y,2,2,'o');g.put(x,y-1,'p');g.put(x+sign*2,y-4,'n');}
    }
    face(g,cx,head,side,back);
    // Cloud pillows, a curling felt edge and a brass weather pin.
    for(const [dx,dy,rx,ry]of [[-6,-7,5,4],[0,-9,6,4],[6,-7,5,4]]){g.ellipse(cx+dx,head+dy,rx,ry,'k');g.ellipse(cx+dx,head+dy-1,rx-1,ry-1,'c');g.ellipse(cx+dx-1,head+dy-2,rx-2,ry-2,'d');}
    g.line(cx-5,head-5,cx+5,head-5,'b',1);if(!back){g.put(cx+5,head-7,'n');g.put(cx+6,head-6,'e');}
    if(dir==='west')for(const row of g.cells)row.reverse();return g.rows();
  }
  for(const [id,draw,palette]of [['alchemist',brew,brewer],['stormcaller',conduct,storm]]){
    const frames=[],directional={};for(const dir of ['south','east','north','west']){
      const set=directional[dir]={};for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['guard',1]]){set[mode]=[];for(let i=0;i<count;i++){set[mode].push(frames.length);frames.push(draw(dir,mode,i));}}
    }
    const sprite=A.compactSprite({palette,frames,density:2,authored:true,directional,animations:directional.south});sprite.directional=directional;G.forms[id].sprite=sprite;
  }
})();
