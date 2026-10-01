/* Garden roadmenders: rounded joined stones, readable faces and moss rooted
   in cracks. Existing measurements, guardian indices and combat clocks. */
"use strict";
(() => {
  const A=G.authoredPixelArt;
  const palette={k:'#333a3d',a:'#53636a',b:'#718789',c:'#96a6a0',d:'#b8c1af',e:'#dce0c7',f:'#f4efd2',g:'#536b48',h:'#7f975b',i:'#b1be7f',j:'#527875',l:'#93c8b3',m:'#d3efcc',n:'#8a6245',o:'#b78d57',p:'#dbb878',q:'#6b7760',r:'#96a087',s:'#c7cbae'};
  function stone(g,x,y,rx,ry,light=false){
    g.ellipse(x,y,rx,ry,'k');g.ellipse(x,y-1,rx-1,ry-1,light?'c':'a');
    g.ellipse(x-1,y-2,Math.max(1,rx-2),Math.max(1,ry-2),light?'d':'b');g.line(x-rx+2,y-ry+2,x-1,y-ry+1,light?'e':'c',1);
    g.line(x+1,y+ry-2,x+rx-2,y+ry-3,light?'b':'a',1);
  }
  function moss(g,x,y,large){
    g.ellipse(x,y,large?7:5,2,'g');g.ellipse(x-2,y-1,large?5:3,2,'h');g.line(x-3,y-2,x+1,y-2,'i',1);
    // The little fern grows out of the forehead stone, never floats above it.
    g.line(x-1,y-1,x-2,y-5,'g',1);g.line(x-2,y-4,x-5,y-5,'h',2);g.line(x-2,y-3,x+1,y-4,'i',1);
  }
  function face(g,x,y,side,back,elder){
    const rx=elder?11:9,ry=elder?9:8;stone(g,x,y,rx,ry,elder);
    g.line(x-5,y-ry+3,x-2,y-ry+2,'a',1);g.put(x-2,y-ry+3,'b');moss(g,x-4,y-ry+3,elder);
    if(back){g.line(x-2,y-2,x+2,y+1,'a',1);g.line(x+2,y+1,x,y+4,'a',1);g.put(x-2,y+4,'c');return;}
    for(const ex of side?[x+3]:[x-4,x+4]){
      g.ellipse(ex,y,2,3,'k');g.rect(ex-1,y-1,2,3,'j');g.put(ex-1,y-1,'m');
      g.line(ex-2,y-4,ex+1,y-4,elder?'e':'c',1);
    }
    g.ellipse(x+(side?6:0),y+3,2,2,elder?'e':'c');g.put(x+(side?7:1),y+4,elder?'c':'a');
    g.line(x+(side?2:-2),y+6,x+(side?5:2),y+6,'a',1);g.put(x+(side?4:1),y+7,elder?'d':'b');
    if(elder){g.line(x-7,y+3,x-5,y+4,'b',1);g.line(x+5,y+4,x+7,y+3,'b',1);}
  }
  function hand(g,x,y,large,open){
    const rx=large?6:4,ry=large?5:4;stone(g,x,y,rx,ry,large);
    for(const dx of large?[-3,0,3]:[-2,1])g.line(x+dx,y-1,x+dx,y+2,'a',1);
    if(open){g.ellipse(x,y+1,rx-2,2,'d');g.line(x-2,y+1,x+2,y+1,'e',1);}
  }
  function arm(g,x,y,hx,hy,large,open){
    const elbowX=Math.round((x+hx)/2),elbowY=Math.round((y+hy)/2);
    g.line(x,y,elbowX,elbowY,'k',large?8:6);g.line(elbowX,elbowY,hx,hy,'k',large?7:5);
    g.line(x,y,elbowX,elbowY,large?'c':'b',large?6:4);g.line(elbowX,elbowY,hx,hy,'a',large?5:3);
    stone(g,elbowX,elbowY,large?4:3,large?4:3,large);hand(g,hx,hy,large,open);
  }
  function leg(g,x,y,stride,large){
    stone(g,x,y,large?4:3,large?4:3,large);
    stone(g,x+stride,y+(large?5:4),large?6:4,large?3:2,large);
    g.line(x+stride-2,y+(large?4:3),x+stride+1,y+(large?4:3),large?'e':'d',1);
  }
  function cobble(dir,mode,step){
    const g=A.grid(44,42),cx=22,side=dir==='east'||dir==='west',back=dir==='north';
    const stride=mode==='walk'?Math.round(Math.sin(step*Math.PI/3)*2):0,bob=mode==='idle'?step:mode==='attack'?[1,0,-1][step]:Math.abs(stride)>0?1:0,punch=mode==='attack'&&step===1,guard=mode==='guard';
    leg(g,cx-5,35,-stride,false);leg(g,cx+5,35,stride,false);
    if(side)arm(g,cx+6,22-bob,cx+9,30-bob,false,false);
    stone(g,cx,27-bob,9,9);stone(g,cx,24-bob,9,6);g.line(cx-5,27-bob,cx-1,29-bob,'c',1);
    if(back){g.line(cx+1,23-bob,cx+4,28-bob,'a',1);g.line(cx+4,28-bob,cx+2,32-bob,'a',1);g.ellipse(cx-4,25-bob,3,2,'h');}
    else{
      const sx=cx+(side?3:0);g.poly([[sx,23-bob],[sx+4,26-bob],[sx+2,31-bob],[sx-2,31-bob],[sx-4,26-bob]],'k');
      g.poly([[sx,25-bob],[sx+2,27-bob],[sx+1,30-bob],[sx-1,30-bob],[sx-2,27-bob]],'l');g.put(sx-1,26-bob,'m');
      g.line(cx-4,33-bob,cx+4,33-bob,'a',1);
    }
    face(g,cx+(side?2:0),13-bob,side,back,false);
    if(side)arm(g,cx-6,23-bob,punch?cx+16:guard?cx+8:cx-13,punch?21-bob:guard?21-bob:31-bob,false,guard);
    else for(const sign of [-1,1])arm(g,cx+sign*9,23-bob,cx+sign*(punch?17:guard?10:14),punch?24-bob:guard?21-bob:31-bob,false,guard);
    if(dir==='west')for(const row of g.cells)row.reverse();return g.rows();
  }
  const frames=[],directional={};for(const dir of ['south','east','north','west']){const set=directional[dir]={};for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['guard',1]]){set[mode]=[];for(let i=0;i<count;i++){set[mode].push(frames.length);frames.push(cobble(dir,mode,i));}}}
  const sprite=A.compactSprite({palette,frames,density:2,authored:true,directional,animations:directional.south});sprite.directional=directional;G.forms.golem.sprite=sprite;
  function pillar(g,frame){
    const cx=28,bob=frame===1?1:frame===3?-1:0,brace=frame===2;
    leg(g,cx-7,44,frame===1?-1:0,true);leg(g,cx+7,44,frame===3?1:0,true);
    stone(g,cx,33-bob,13,12,true);stone(g,cx,28-bob,12,8,true);
    // His canvas mason's apron follows the torso and ties around the back.
    g.poly([[cx-7,27-bob],[cx+7,27-bob],[cx+9,42],[cx+4,45],[cx-5,45],[cx-9,42]],'q');
    g.line(cx-6,28-bob,cx+5,28-bob,'s',1);g.line(cx-7,30-bob,cx-6,40,'r',1);
    g.rect(cx-5,36-bob,10,5,'r');g.line(cx-4,37-bob,cx+3,37-bob,'s',1);g.line(cx,37-bob,cx,40-bob,'q',1);
    g.line(cx-9,29-bob,cx-6,24-bob,'n',2);g.line(cx+9,29-bob,cx+6,24-bob,'n',2);
    face(g,cx,16-bob,false,false,true);
    for(const sign of [-1,1])arm(g,cx+sign*11,29-bob,cx+sign*(brace?20:19),brace?40:36-bob,true,brace);
    if(!brace){
      // Small trowel held in the left hand; his palms meet the ground when casting.
      const x=cx-19,y=36-bob;g.line(x+1,y-2,x+4,y-10,'k',3);g.line(x+1,y-2,x+4,y-10,'o',1);
      g.poly([[x+3,y-10],[x+2,y-15],[x+8,y-14],[x+6,y-9]],'k');g.poly([[x+4,y-11],[x+3,y-14],[x+7,y-13],[x+5,y-10]],'e');g.put(x+4,y-13,'f');
      hand(g,x,y,true,false);
    }
  }
  G.enemies.oldMason.sprite=A.compactSprite(A.authored(56,52,palette,pillar));
})();
