/* Rounded little champions, with readable steel, fabric and shield grips.
   Keep the opening Slash performance and Eclipse combat definitions intact. */
"use strict";
(() => {
  const A=G.authoredPixelArt;
  const steel={k:'#272b3c',a:'#42475e',b:'#748397',c:'#a9bac3',d:'#d9e5dd',e:'#fff0bf',f:'#9addd1',g:'#dfb878',h:'#bd7186',i:'#744e71',j:'#89adaf',l:'#48566c',m:'#dca6a5',n:'#cfddd3'};
  const eclipse={...steel,a:'#413b61',b:'#7b7199',c:'#b0a1c9',d:'#e8d7e4',f:'#d6b8ff',h:'#95688c',i:'#554261',j:'#9c91b9',l:'#51445f'};
  function limb(g,x,y,tx,ty,color,w=3){g.line(x,y,tx,ty,'k',w+2);g.line(x,y,tx,ty,color,w);}
  function knight(g,dir,mode,step,boss=false){
    const side=dir==='east'||dir==='west',back=dir==='north',hit=mode==='attack',guard=mode==='guard';
    const stride=mode==='walk'?Math.sin(step*Math.PI/3):0,bob=mode==='idle'?step:Math.round(Math.abs(stride));
    const cx=boss?24:27,head=(boss?16:17)-bob,hip=36-bob,foot=44;
    // The cape has a soft scalloped hem; limbs attach under the shoulders.
    g.poly([[cx-7,head+6],[cx+6,head+6],[cx+10,39],[cx+5,42],[cx,40],[cx-7,42],[cx-11,39]],'k');
    g.poly([[cx-5,head+7],[cx+4,head+7],[cx+8,38],[cx+4,40],[cx,38],[cx-6,40],[cx-9,38]],'i');g.line(cx-5,29,cx-6,36,'h',1);
    for(const [dx,phase]of [[-4,1],[4,-1]]){
      const x=cx+dx+Math.round(stride*phase*2);limb(g,cx+dx,hip,x,foot-2,'l',3);
      g.ellipse(x,foot,4,2,'k');g.line(x-2,foot-1,x+2,foot-1,'b',1);
    }
    g.ellipse(cx,31-bob,boss?9:8,10,'k');g.ellipse(cx,30-bob,boss?8:7,9,'b');
    g.ellipse(cx-2,28-bob,5,6,'c');g.line(cx-3,27-bob,cx-3,33-bob,'d',1);g.line(cx+3,31-bob,cx+4,35-bob,'a',1);
    g.line(cx-6,36-bob,cx+6,36-bob,'g',2);g.rect(cx-1,34-bob,3,3,'e');
    const push=hit?(step===0?-3:step===1?(boss?3:5):1):0,handX=cx+9+push,handY=hit?24-bob:33-bob;
    limb(g,cx-6,27-bob,cx-9,33-bob,'c');limb(g,cx+6,27-bob,handX,handY,'c');g.ellipse(handX,handY,2,2,'k');
    // Sword remains attached to the hand through preparation, strike, settle.
    const tipX=handX+(hit&&step===1?10:1),tipY=handY-(hit&&step===0?17:hit&&step===1?11:15);
    limb(g,handX,handY,tipX,tipY,'d',1);g.line(handX+1,handY-1,tipX+1,tipY+1,'j',1);
    g.line(handX-3,handY-1,handX+3,handY+1,'g',2);g.put(handX,handY+3,'e');
    const sx=guard?cx+5:cx-10,sy=31-bob;
    if(boss){
      g.ellipse(sx,sy,9,10,'k');g.ellipse(sx,sy-1,8,9,'i');g.ellipse(sx,sy-1,6,7,'c');g.ellipse(sx+2,sy-3,5,6,'a');g.put(sx-3,sy-4,'d');
    }else{
      g.poly([[sx-6,sy-7],[sx+6,sy-7],[sx+6,sy+2],[sx+3,sy+7],[sx,sy+9],[sx-4,sy+6],[sx-6,sy+1]],'k');
      g.poly([[sx-4,sy-5],[sx+4,sy-5],[sx+4,sy+1],[sx+2,sy+5],[sx,sy+6],[sx-3,sy+4],[sx-4,sy]],back?'l':'h');
      g.line(sx,sy-4,sx,sy+3,back?'b':'e',1);if(!back)g.line(sx-2,sy-1,sx+2,sy-1,'g',1);
    }
    // A generous round helmet and lit eyes replace the rigid horizontal slit.
    g.ellipse(cx,head,boss?11:10,10,'k');g.ellipse(cx,head-1,boss?10:9,9,'b');g.ellipse(cx-3,head-3,6,6,'c');
    if(!back){
      g.ellipse(cx+(side?2:0),head+2,side?6:8,5,'a');
      for(const x of side?[cx+3]:[cx-5,cx+3]){g.rect(x,head,3,4,'f');g.put(x,head,'d');}
      g.line(cx-4,head+6,cx+4,head+6,'b',1);g.put(cx,head+5,'c');
    }else{g.line(cx,head-7,cx,head+6,'a',1);g.line(cx-5,head+5,cx+5,head+5,'c',1);}
    g.line(cx-5,head+9,cx+5,head+9,'g',2);
    if(boss){
      // Short moon horns stay rooted in the helmet rather than floating.
      for(const sign of [-1,1]){limb(g,cx+sign*8,head-6,cx+sign*12,head-9,'b',2);limb(g,cx+sign*12,head-9,cx+sign*11,head-12,'c',1);g.put(cx+sign*10,head-13,'d');}
      g.ellipse(cx,head-5,3,3,'g');g.ellipse(cx+1,head-6,2,2,'b');
    }else{limb(g,cx,head-10,cx-3+Math.round(stride),head-14,'h',2);g.line(cx-3,head-13,cx-6,head-11,'m',1);}
    if(dir==='west')for(const row of g.cells)row.reverse();
  }
  const frames=[],directional={};
  for(const dir of ['south','east','north','west']){
    const set=directional[dir]={};
    for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['guard',1]]){
      set[mode]=[];
      for(let i=0;i<count;i++){const g=A.grid(56,48);knight(g,dir,mode,i);set[mode].push(frames.length);frames.push(g.rows());}
    }
  }
  const sprite=A.compactSprite({palette:steel,frames,density:2,authored:true,directional,animations:directional.south});sprite.directional=directional;
  G.forms.knight.sprite=sprite;G.enemies.orchardGuard.sprite=sprite;
  G.enemies.eclipseKnight.sprite=A.compactSprite(A.authored(48,48,eclipse,(g,f)=>knight(g,'south',f===2?'attack':f===0?'idle':'walk',f===2?1:f===3?4:f,true)));
})();
