/* September 30 art direction: soft silhouettes, expressive little faces,
   sculpted materials. Art only: the opening performance timing stays intact. */
"use strict";
(() => {
  const A=G.authoredPixelArt;
  const palette={k:'#252431',a:'#454153',b:'#81758c',c:'#b8aab8',d:'#e9dfcf',e:'#fff5df',f:'#8cbfba',g:'#e4b871',h:'#bc7f8f',i:'#6b566f',j:'#e5a4b0',l:'#937889',m:'#f6c2b7',n:'#ccbdaf',o:'#547b7b',p:'#bddbd0'};
  function limb(g,x,y,tx,ty,color,w=3){g.line(x,y,tx,ty,'k',w+2);g.line(x,y,tx,ty,color,w);}
  function eyes(g,cx,cy,side){
    const xs=side?[cx+4]:[cx-4,cx+3];
    for(const x of xs){g.rect(x,cy,3,4,'a');g.put(x,cy,'e');}
    g.line(cx+(side?4:-1),cy+6,cx+(side?6:1),cy+6,'b',1);
  }
  function nobody(g,dir,mode,step){
    const side=dir==='east'||dir==='west',back=dir==='north';
    const stride=mode==='walk'?Math.sin(step*Math.PI/3):0;
    const bob=mode==='idle'?step:Math.round(Math.abs(stride));
    const hit=mode==='attack',beat=hit?step:-1,cx=27+(beat===1?1:0),y=19-bob;
    // Small rounded boots under a short coat; no long, stiff doll limbs.
    for(const [dx,phase]of [[-4,1],[4,-1]]){
      const foot=cx+dx+Math.round(stride*phase*2);
      limb(g,cx+dx,35-bob,foot,43-Math.max(0,Math.round(stride*phase)), 'b');
      g.ellipse(foot,44,4,2,'k');g.line(foot-2,43,foot+1,43,'c',1);
    }
    g.ellipse(cx,32-bob,8,9,'k');g.ellipse(cx,31-bob,7,8,'o');
    g.line(cx-4,29-bob,cx-4,36-bob,'f',2);g.line(cx+4,32-bob,cx+4,37-bob,'a',1);
    g.rect(cx-5,33-bob,4,4,'n');g.put(cx-4,34-bob,'e');g.put(cx-2,36-bob,'g');
    const hand=beat===0?-2:beat===1?11:beat===2?5:0;
    limb(g,cx-6,29-bob,cx-9,35-bob+Math.round(stride),'o');
    limb(g,cx+6,29-bob,cx+8+hand,hit?26-bob:35-bob-Math.round(stride),'o');
    g.ellipse(cx+8+hand,hit?26-bob:35-bob-Math.round(stride),3,3,'k');
    g.ellipse(cx+8+hand,hit?25-bob:34-bob-Math.round(stride),2,2,'n');
    // A folded canvas hood, copper map patch and stitches belong to this traveller.
    g.ellipse(cx,y,10,11,'k');g.ellipse(cx,y-1,9,10,'n');g.ellipse(cx-2,y-3,7,7,'d');
    g.poly([[cx-8,y-6],[cx-8,y-12],[cx-3,y-10],[cx-1,y-8]],'k');
    g.poly([[cx-7,y-7],[cx-7,y-10],[cx-4,y-9],[cx-3,y-8]],'d');
    g.line(cx+4,y-8,cx+7,y+6,'b',1);
    for(const dy of [-6,-2,2,6])g.line(cx+4,y+dy,cx+6,y+dy,'e',1);
    if(!back){g.rect(cx-7,y-7,4,3,'g');g.put(cx-6,y-6,'a');}
    if(!back){eyes(g,cx,y-1,side);g.line(cx+(side?1:-7),y+4,cx+(side?2:-6),y+4,'m',1);if(!side)g.line(cx+6,y+4,cx+7,y+4,'m',1);}
    else {g.line(cx-5,y-5,cx+2,y+5,'b',1);for(const dy of [-3,1,5])g.line(cx-4+(dy+3)/4,y+dy,cx-2+(dy+3)/4,y+dy,'e',1);}
    g.line(cx-6,y+10,cx+6,y+10,'o',3);g.line(cx-5,y+9,cx+5,y+9,'f',1);
    g.poly([[cx+3,y+10],[cx+7,y+12],[cx+6,y+18],[cx+3,y+16]],'f');g.put(cx+5,y+13,'p');
    if(!back)g.put(cx-1,35-bob,'g');
    if(dir==='west')for(const row of g.cells)row.reverse();
  }
  function rat(g,dir,mode,step){
    const side=dir==='east'||dir==='west',back=dir==='north';
    const stride=mode==='walk'?Math.sin(step*Math.PI/3):0,bob=mode==='idle'?step:Math.round(Math.abs(stride));
    const bite=mode==='attack'&&step===1,cx=25,cy=34-bob;
    // A tucked curl and pear-shaped haunches keep the tiny body readable.
    limb(g,15,cy+2,9,cy+1,'h',1);limb(g,9,cy+1,6,cy-4,'h',1);limb(g,6,cy-4,8,cy-8,'h',1);g.put(9,cy-8,'j');
    for(const [dx,phase]of [[-7,1],[7,-1]]){const x=cx+dx+Math.round(stride*phase*2);g.ellipse(x,43,4,2,'k');g.line(x-2,42,x+1,42,'m',1);}
    g.ellipse(cx,cy,side?12:11,9,'k');g.ellipse(cx,cy-1,side?11:10,8,'l');
    g.ellipse(cx-3,cy-3,8,6,'c');g.ellipse(cx+2,cy+2,6,5,'n');
    const hx=side?33+(bite?2:0):26,hy=(back?23:27)-bob+(bite&&!side?(back?-2:2):0);
    for(const dx of [-6,6]){g.ellipse(hx+dx,hy-7,6,6,'k');g.ellipse(hx+dx,hy-7,5,5,'l');g.ellipse(hx+dx,hy-7,3,3,'j');g.put(hx+dx-1,hy-9,'m');}
    g.ellipse(hx,hy,10,9,'k');g.ellipse(hx,hy-1,9,8,'c');g.ellipse(hx-2,hy-3,6,5,'d');
    if(!back){
      const nose=side?hx+9:hx;g.ellipse(side?hx+6:hx,hy+3,side?5:6,4,'n');
      eyes(g,hx,hy-2,side);g.ellipse(nose,hy+2,2,1,'h');g.put(nose,hy+1,'m');
      if(bite){g.ellipse(nose-1,hy+5,3,2,'a');g.rect(nose-2,hy+4,2,2,'e');}
      else g.line(nose-1,hy+5,nose+1,hy+5,'b',1);
      if(!side){g.line(hx-8,hy+2,hx-6,hy+2,'j',1);g.line(hx+6,hy+2,hx+8,hy+2,'j',1);}
    }else g.line(hx-4,hy+4,hx+3,hy+5,'b',1);
    if(dir==='west')for(const row of g.cells)row.reverse();
  }
  for(const [id,draw]of [['nobody',nobody],['rat',rat]]){
    const frames=[],directional={};
    for(const dir of ['south','east','north','west']){
      const set=directional[dir]={};
      for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['guard',1]]){
        set[mode]=[];
        for(let i=0;i<count;i++){const g=A.grid(56,48);draw(g,dir,mode,i);set[mode].push(frames.length);frames.push(g.rows());}
      }
    }
    const sprite=A.compactSprite({palette,frames,density:2,authored:true,directional,animations:directional.south});
    sprite.directional=directional;G.forms[id].sprite=sprite;
  }
  const wood={k:'#283335',a:'#504037',b:'#846048',c:'#ae845a',d:'#d1ac76',e:'#ffebbd',f:'#405b43',g:'#638456',h:'#96ad70',i:'#c8d794',j:'#e4a279',l:'#d8be94',m:'#7fb5a0'};
  function tree(frame){
    const g=A.grid(116,108),s=frame===1?2:frame===3?-2:0,reach=frame===2?8:0;
    // Root slippers and rounded branch mitts still show the attack's reach.
    for(const [x,dx]of [[43,-1],[73,1]]){g.ellipse(x+dx*s,96,15,9,'k');g.ellipse(x+dx*s,94,13,8,'b');g.line(x-7,97,x+7,97,'c',2);}
    for(const [x,sign]of [[35,-1],[81,1]]){
      limb(g,x,59,x+sign*(12+reach),64-reach,'b',10);
      g.ellipse(x+sign*(18+reach),57-reach,9,12,'k');g.ellipse(x+sign*(18+reach),56-reach,7,10,'c');
      g.line(x+sign*(18+reach),50-reach,x+sign*(20+reach),42-reach,'b',4);
      g.line(x+sign*(18+reach),50-reach,x+sign*(12+reach),45-reach,'b',3);
    }
    g.ellipse(58,64,27,33,'k');g.ellipse(58,62,25,31,'b');
    g.ellipse(53,56,20,23,'c');g.ellipse(48,51,13,17,'d');
    for(const x of [39,47,68,75]){g.line(x,69,x+(x<58?-2:2),86,'a',1);g.line(x+2,72,x+2,83,'d',1);}
    // Friendly eyes sit in shallow bark sockets; a little hollow is the mouth.
    for(const x of [47,68]){g.ellipse(x,54,6,7,'b');g.ellipse(x,53,4,5,'k');g.rect(x-1,50,2,2,'e');}
    g.ellipse(58,65,6,5,'a');g.ellipse(58,64,4,3,'k');g.line(55,63,59,63,'d',1);
    g.ellipse(40,63,4,2,'j');g.ellipse(76,63,4,2,'j');
    g.line(46,42,51,41,'b',2);g.line(65,41,70,42,'b',2);
    // Five leafy pillows make an asymmetric living crown, with acorn detail.
    for(const [x,y,rx,ry]of [[30,31,17,14],[47,22,20,16],[69,20,21,17],[88,32,17,14],[58,34,26,13]]){
      g.ellipse(x+s,y,rx,ry,'k');g.ellipse(x+s,y-1,rx-2,ry-2,'f');g.ellipse(x-3+s,y-4,rx-4,ry-5,'g');
      g.ellipse(x-5+s,y-6,rx-8,ry-9,'h');g.line(x-7+s,y-8,x+s,y-10,'i',2);
    }
    for(const x of [27,83]){g.line(x,40,x-1,49,'g',2);g.put(x-1,49,'h');}
    g.ellipse(79+s,24,3,4,'c');g.rect(75+s,19,8,3,'a');g.put(79+s,20,'l');
    g.poly([[54,78],[61,77],[65,82],[62,88],[56,88],[52,83]],'a');g.line(55,79,60,78,'d',1);
    return g.rows();
  }
  const full=[0,1,2,3].map(tree);
  function treant(w,h){
    const frames=full.map(rows=>Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>rows[Math.floor(y*108/h)][Math.floor(x*116/w)]).join('')));
    return A.compactSprite({palette:wood,frames,density:2,authored:true,animations:{idle:[0,0,3,0],walk:[0,1,0,3],attack:[2]}});
  }
  G.openingTreantSprite=treant(116,108);
  G.enemies.ancientTreant.sprite=treant(54,48);
})();
