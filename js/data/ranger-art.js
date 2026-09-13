/* Ranger is a moving archer: hood, quiver, planted bow arm, and a release
   whose pose agrees with the projectile. Four directions, twelve poses each. */
"use strict";
(() => {
  const {grid,compactSprite}=G.authoredPixelArt;
  const palette={k:'#18272c',a:'#314b46',b:'#526e51',c:'#839363',d:'#b5bb85',e:'#eddfb7',f:'#d2aa8d',g:'#a47158',h:'#704e43',i:'#bc7c62',j:'#ebbb86',l:'#537578',m:'#93aea1',n:'#3e4247',o:'#c5c7b1'};
  function line(g,x1,y1,x2,y2,color,w=3){g.line(x1,y1,x2,y2,'k',w+2);g.line(x1,y1,x2,y2,color,w);}
  function draw(dir,mode,step){
    const g=grid(58,52),back=dir==='north',side=dir==='east'||dir==='west';
    const stride=mode==='walk'?Math.sin(step/6*Math.PI*2):0,bob=mode==='walk'?Math.round(Math.abs(stride)):mode==='idle'?step:0;
    const attack=mode==='attack',drawn=attack&&step===0,released=attack&&step===1;
    const cx=26+(released?-1:0),cy=19-bob,hip=39-bob;
    // A long, asymmetric cloak pulls against the stride, separate from the legs.
    g.poly([[cx-8,cy+3],[cx+6,cy+4],[cx+10-stride*3,44],[cx+1,41],[cx-9-stride*2,45],[cx-11,30]],'k');
    g.poly([[cx-7,cy+5],[cx+4,cy+6],[cx+7-stride*3,41],[cx,38],[cx-7-stride*2,42],[cx-8,29]],'a');
    g.line(cx-6,28,cx-6-stride*2,39,'b',2);
    const dx=side?3:5;
    line(g,cx-dx,hip,cx-dx+Math.round(stride*4),48-Math.round(Math.max(0,stride)*2),'h',3);
    line(g,cx+dx,hip,cx+dx-Math.round(stride*4),48-Math.round(Math.max(0,-stride)*2),'g',3);
    g.rect(cx-dx-2+Math.round(stride*4),48,6,2,'k');g.rect(cx+dx-2-Math.round(stride*4),48,6,2,'k');
    // Quiver projects above one shoulder; the rear view exposes its full length.
    g.poly([[cx-10,cy+3],[cx-5,cy+2],[cx-3,36],[cx-10,37]],'k');g.poly([[cx-8,cy+4],[cx-5,cy+4],[cx-5,34],[cx-8,35]],'h');
    for(let i=0;i<3;i++){const x=cx-11+i*3;g.line(x,cy+7,x-2,cy-5-i%2*2,'g',1);g.line(x-2,cy-5-i%2*2,x-4,cy-7-i%2*2,'e',2);}
    g.poly([[cx-6,cy+8],[cx+6,cy+8],[cx+7,37],[cx,42],[cx-7,37]],'k');
    g.poly([[cx-4,cy+9],[cx+4,cy+9],[cx+5,36],[cx,39],[cx-5,36]],'b');g.line(cx-3,cy+10,cx-3,34,'c',2);
    g.line(cx-5,cy+9,cx+4,36,'g',2);g.rect(cx-6,36,12,2,'h');g.rect(cx,36,3,2,'j');
    // Braced bow arm and drawing hand remain distinct through the three beats.
    const vertical=attack&&!side,sign=back?-1:1;
    const handX=attack?cx+13:cx+10,handY=vertical?cy+(back?-10:16):attack?cy+10:cy+16;
    line(g,cx+5,cy+10,handX,handY,'b',3);g.rect(handX,handY-1,3,3,'f');
    const pullX=vertical?cx:drawn?cx-1:released?cx-7:cx-8,pullY=vertical?handY-sign*(drawn?10:3):attack?cy+10:cy+16;
    line(g,cx-5,cy+10,pullX,pullY,'b',3);g.rect(pullX,pullY-1,3,3,'f');
    // A recurved wooden bow, with a taut or released string, not a straight stick.
    const bx=handX+3,by=handY,tip=attack?14:12;
    if(vertical){
      const pts=[[cx-13,by],[cx-9,by+sign*3],[cx,by+sign*5],[cx+9,by+sign*3],[cx+13,by]];
      for(let i=1;i<pts.length;i++)line(g,...pts[i-1],...pts[i],'g',1);
      g.line(cx-13,by,cx,pullY,'e',1);g.line(cx,pullY,cx+13,by,'e',1);
      if(drawn){const tip=back?7:12;g.line(cx,pullY-sign*2,cx,by+sign*(tip-2),'o',1);g.poly([[cx-2,by+sign*(tip-4)],[cx,by+sign*tip],[cx+2,by+sign*(tip-4)]],'e');}
    }else{
      const pts=[[bx-3,by-tip],[bx+1,by-tip+3],[bx+5,by-5],[bx+6,by],[bx+5,by+5],[bx+1,by+tip-3],[bx-3,by+tip]];
      for(let i=1;i<pts.length;i++)line(g,...pts[i-1],...pts[i],'g',1);
      g.line(bx-2,by-tip+1,drawn?pullX+1:bx-2,by,'e',1);g.line(drawn?pullX+1:bx-2,by,bx-2,by+tip-1,'e',1);
      g.rect(bx+4,by-2,3,4,'h');
      if(drawn){g.line(pullX-1,by,bx+10,by,'o',1);g.poly([[bx+10,by-2],[bx+13,by],[bx+10,by+2]],'e');g.line(pullX+1,by,pullX-2,by-3,'i',1);}
    }
    if(released){g.line(cx-9,cy+9,cx-12,cy+6,'f',2);}
    // Hood peak, shadowed face, narrow eyes, and a russet scarf.
    g.poly([[cx-10,cy+3],[cx-9,cy-7],[cx-3,cy-14],[cx+5,cy-11],[cx+10,cy-4],[cx+9,cy+7],[cx-6,cy+8]],'k');
    g.poly([[cx-8,cy+2],[cx-7,cy-6],[cx-2,cy-12],[cx+4,cy-9],[cx+8,cy-3],[cx+7,cy+5],[cx-5,cy+6]],'b');
    g.poly([[cx-6,cy-5],[cx-2,cy-10],[cx+4,cy-7],[cx+6,cy-3],[cx,cy-5]],'c');g.line(cx-3,cy-8,cx,cy-9,'d',1);
    if(!back){
      const hx=cx+(side?3:0);g.poly([[hx-5,cy-2],[hx+5,cy-1],[hx+4,cy+6],[hx-2,cy+7],[hx-5,cy+3]],'a');
      g.poly([[hx-4,cy],[hx+4,cy],[hx+3,cy+5],[hx-1,cy+6],[hx-4,cy+3]],'f');g.rect(hx+(side?2:-3),cy+1,2,2,'k');if(!side)g.rect(hx+2,cy+1,2,2,'k');
    }else{g.line(cx,cy-9,cx+3,cy+5,'a',1);g.line(cx-3,cy+5,cx+4,cy+5,'c',1);}
    g.poly([[cx-7,cy+7],[cx+6,cy+7],[cx+7,cy+10],[cx-4,cy+11]],'i');g.line(cx-5,cy+8,cx+4,cy+8,'j',1);
    g.poly([[cx-5,cy+9],[cx-9,cy+17],[cx-5,cy+16],[cx-3,cy+10]],'h');
    if(back){g.line(cx-9,cy+9,cx+4,37,'g',2);g.line(cx-9,cy+9,cx+3,36,'j',1);}
    if(dir==='west')for(const row of g.cells)row.reverse();
    return g.rows();
  }
  const frames=[],directional={};
  for(const dir of ['south','east','north','west']){
    directional[dir]={};for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['guard',1]]){
      directional[dir][mode]=[];for(let i=0;i<count;i++){directional[dir][mode].push(frames.length);frames.push(draw(dir,mode,i));}
    }
  }
  const sprite=compactSprite({palette,frames,density:2,authored:true,directional,animations:directional.south});sprite.directional=directional;G.forms.ranger.sprite=sprite;
})();
