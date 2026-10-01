/* Hearthdrake and the Wayglass roadkeepers. Art only: legacy timing,
   footprints, attack indices and save identities remain intact. */
"use strict";
(() => {
  const A=G.authoredPixelArt;
  const scales={k:'#332c3b',a:'#69404a',b:'#995654',c:'#c57a60',d:'#e9a077',e:'#f8c697',f:'#f9e7bc',g:'#fff4d9',h:'#875470',i:'#c1858e',j:'#496777',l:'#677e8d',m:'#9dc4bd',n:'#cea867',o:'#ebba7d',p:'#6c4850'};
  function dragon(dir,mode,step){
    const g=A.grid(56,38),side=dir==='east'||dir==='west',back=dir==='north';
    const stride=mode==='walk'?Math.sin(step*Math.PI/3):0,bob=mode==='idle'?step:Math.round(Math.abs(stride));
    const sweep=mode==='attack'&&step===1,cx=28,cy=25-bob;
    // A tapered tail with a small hearth-shaped tip; attached to the haunch.
    const tail=side?[[18,cy+1],[10,cy+5],[5,sweep?cy+2:cy+3],[4,sweep?cy-5:cy-2]]:[[34,cy+2],[45,cy+7],[51,sweep?cy+2:cy+5],[52,sweep?cy-3:cy+2]];
    for(let i=1;i<tail.length;i++){g.line(...tail[i-1],...tail[i],'k',Math.max(2,7-i*2));g.line(...tail[i-1],...tail[i],'c',Math.max(1,5-i*2));}
    g.ellipse(...tail[3],2,2,'e');
    // Short membranous wings, with pale joint bones and rounded outer corners.
    function wing(root,sign){
      const lift=sweep?-3:0,x=root;
      g.poly([[x,cy-2],[x+sign*4,9+lift],[x+sign*12,7+lift],[x+sign*10,15+lift],[x+sign*15,15+lift],[x+sign*10,24],[x,cy+3]],'k');
      g.poly([[x,cy-1],[x+sign*5,11+lift],[x+sign*10,10+lift],[x+sign*8,17+lift],[x+sign*12,17+lift],[x+sign*8,23],[x,cy+1]],'h');
      g.line(x,cy,x+sign*5,11+lift,'e',1);g.line(x+sign*5,11+lift,x+sign*9,10+lift,'e',1);
      g.line(x+sign*4,15+lift,x+sign*10,18+lift,'i',1);
    }
    if(side)wing(25,-1);else{wing(20,-1);wing(36,1);}
    // Four feet on the side, two far feet and two forepaws facing the camera.
    const paws=side?[[18,1],[24,-1],[33,-1],[39,1]]:[[19,1],[37,-1],[23,-1],[33,1]];
    for(const [x,sign]of paws){const fx=x+Math.round(stride*sign);g.line(x,cy+2,fx,34,'k',4);g.line(x,cy+2,fx,33,'b',2);g.ellipse(fx,35,3,1,'k');g.line(fx-1,34,fx+1,34,'f',1);}
    g.ellipse(side?29:cx,cy,side?13:11,8,'k');g.ellipse(side?29:cx,cy-1,side?12:10,7,'b');
    g.ellipse(side?33:cx,cy,7,6,'c');
    if(back){g.line(cx,cy-4,cx,cy+6,'a',1);for(const y of [cy-3,cy+1,cy+5])g.poly([[cx,y-1],[cx-2,y+1],[cx+2,y+1]],'d');}
    else{g.ellipse(side?35:cx,cy+2,side?6:7,4,'e');for(const y of [cy,cy+3])g.line(side?31:cx-5,y,side?38:cx+5,y,'n',1);}
    if(side){g.line(35,cy-3,39,16-bob,'k',7);g.line(35,cy-3,39,16-bob,'c',5);}
    const hx=side?41:cx,hy=15-bob;
    g.ellipse(hx,hy,8,8,'k');g.ellipse(hx,hy-1,7,7,'c');g.ellipse(hx-2,hy-3,5,4,'d');
    for(const dx of side?[-4,3]:[-6,6]){g.line(hx+dx,hy-6,hx+dx+(dx<0?-1:1),hy-10,'k',3);g.line(hx+dx,hy-6,hx+dx+(dx<0?-1:1),hy-9,'f',1);}
    if(!back){
      const mx=side?hx+5:hx;g.ellipse(mx,hy+4,side?6:8,4,'k');g.ellipse(mx,hy+3,side?5:7,3,'d');
      for(const x of side?[hx+2]:[hx-4,hx+3]){g.ellipse(x,hy-1,2,3,'a');g.rect(x,hy-2,1,2,'g');}
      for(const x of side?[mx+3]:[mx-3,mx+3])g.put(x,hy+3,'p');
      g.line(mx-2,hy+6,mx+2,hy+6,'a',1);g.put(hx-5,hy+4,'i');
    }else{g.line(hx,hy-3,hx,hy+7,'a',1);for(const y of [hy-1,hy+3,hy+7])g.put(hx-1,y,'e');}
    if(side){g.line(24,cy-3,20,13-bob,'k',3);g.line(24,cy-3,20,13-bob,'d',1);}
    if(dir==='west')for(const row of g.cells)row.reverse();return g.rows();
  }
  const glass={k:'#292c44',a:'#444263',b:'#656286',c:'#9897b8',d:'#ddd6d0',e:'#fff0cf',f:'#b48979',g:'#d6ab7d',h:'#d9b59a',i:'#94d6cf',j:'#597e8c',l:'#a3718c',m:'#775765',n:'#baded8',o:'#efc984',p:'#795843'};
  function duelist(dir,mode,step){
    const g=A.grid(38,38),side=dir==='east'||dir==='west',back=dir==='north';
    const stride=mode==='walk'?Math.sin(step*Math.PI/3):0,bob=mode==='idle'?step:Math.round(Math.abs(stride));
    const cut=mode==='attack'&&step===1,cx=19,head=13-bob;
    for(const [dx,sign]of [[-3,1],[3,-1]]){const x=cx+dx+Math.round(stride*sign);g.ellipse(x,36,3,1,'k');g.line(x-1,35,x+1,35,'c',1);}
    g.poly([[cx-6,21-bob],[cx+6,21-bob],[cx+9,32],[cx+4,34],[cx,30],[cx-4,34],[cx-9,32]],'k');
    g.ellipse(cx,26-bob,7,7,'a');g.ellipse(cx-2,25-bob,4,5,'b');g.line(cx-4,32,cx-6,32,'l',1);g.line(cx+4,32,cx+6,32,'i',1);
    g.line(cx-4,24-bob,cx+3,28-bob,'j',1);g.put(cx,25-bob,'o');
    for(const sign of [-1,1]){
      const x=cx+sign*(cut?12:10),y=(cut?20:28)-bob;
      g.line(cx+sign*6,23-bob,x,y,'k',3);g.line(cx+sign*6,23-bob,x,y,'b',1);g.ellipse(x,y,2,2,'h');
      // Paired glass knives keep a nine-pixel blade throughout the gesture.
      const tipX=x+sign*(cut?3:2),tipY=y-9;g.line(x,y-1,tipX,tipY,'k',3);g.line(x,y-2,tipX,tipY+1,'i',1);g.put(tipX,tipY,'n');g.line(x-1,y-1,x+1,y-1,'g',1);
    }
    g.ellipse(cx,head,7,7,'k');g.ellipse(cx,head,6,6,back?'p':'h');
    if(!back){for(const x of side?[cx+3]:[cx-3,cx+2]){g.rect(x,head-1,2,3,'a');g.put(x,head-1,'e');}g.line(cx+(side?2:-1),head+4,cx+(side?4:1),head+4,'f',1);g.put(cx-4,head+3,'l');}
    else g.line(cx-3,head+1,cx+3,head+3,'f',1);
    // A rounded travel cap, a little wayglass pin and a folded neck scarf.
    g.ellipse(cx,head-6,8,4,'k');g.ellipse(cx,head-7,7,3,'b');g.line(cx-5,head-6,cx+5,head-6,'c',1);
    if(!back){g.put(cx+4,head-8,'i');g.put(cx+5,head-7,'e');}
    g.line(cx-5,head+7,cx+5,head+7,'m',3);g.line(cx-4,head+6,cx+4,head+6,'l',1);
    g.poly([[cx-5,head+7],[cx-8,head+10],[cx-10,head+16],[cx-7,head+14]],'l');g.put(cx-8,head+11,'d');
    if(dir==='west')for(const row of g.cells)row.reverse();return g.rows();
  }
  for(const [id,draw,palette]of [['dragon',dragon,scales],['riftblade',duelist,glass]]){
    const frames=[],directional={};for(const dir of ['south','east','north','west']){const set=directional[dir]={};for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['guard',1]]){set[mode]=[];for(let i=0;i<count;i++){set[mode].push(frames.length);frames.push(draw(dir,mode,i));}}}
    const sprite=A.compactSprite({palette,frames,density:2,authored:true,directional,animations:directional.south});sprite.directional=directional;G.forms[id].sprite=sprite;
  }
  function mira(g,frame){
    const cx=25,bob=frame===1?1:frame===3?-1:0,attack=frame===2,head=14-bob;
    for(const [dx,sign]of [[-5,1],[5,-1]]){const x=cx+dx+bob*sign;g.ellipse(x,46,4,1,'k');g.line(x-2,45,x+2,45,'c',1);}
    g.poly([[13,23-bob],[37,23-bob],[39,39],[31,43],[25,39],[18,43],[11,39]],'k');g.ellipse(cx,31-bob,11,11,'a');g.ellipse(cx-3,29-bob,7,8,'b');
    g.line(15,38,20,40,'l',2);g.line(30,40,36,38,'i',2);g.line(20,26-bob,29,33-bob,'j',1);g.put(25,28-bob,'o');
    for(const sign of [-1,1]){const x=cx+sign*(attack?17:14),y=(attack?22:34)-bob;g.line(cx+sign*9,27-bob,x,y,'k',5);g.line(cx+sign*9,27-bob,x,y,'b',3);g.ellipse(x,y,3,3,'h');
      const tx=x+sign*2,ty=y-12;g.line(x,y-1,tx,ty,'k',4);g.line(x,y-2,tx,ty+1,'i',2);g.put(tx,ty,'n');g.line(x-2,y-2,x+2,y-2,'g',1);}
    g.ellipse(cx,head,10,10,'k');g.ellipse(cx,head,9,9,'p');g.ellipse(cx,head+1,7,7,'h');g.ellipse(cx-2,head-1,5,5,'d');
    for(const x of [cx-4,cx+3]){g.rect(x,head,3,4,'a');g.put(x,head,'e');}
    g.line(cx-1,head+6,cx+2,head+6,'f',1);g.put(cx-6,head+4,'l');g.put(cx+6,head+4,'l');
    // Older keeper's woven hood and one copper-bound braid.
    g.ellipse(cx,head-7,11,4,'k');g.ellipse(cx,head-8,10,3,'b');g.line(cx-7,head-7,cx+7,head-7,'c',1);g.put(cx+5,head-9,'i');g.put(cx+6,head-8,'e');
    for(const y of [head+5,head+8,head+11]){g.ellipse(cx+8,y,2,2,'p');g.put(cx+8,y,'g');}
    g.line(cx-6,head+9,cx+6,head+9,'m',3);g.line(cx-5,head+8,cx+5,head+8,'l',1);
  }
  G.enemies.riftbladeAdept.sprite=A.compactSprite(A.authored(50,48,glass,mira));
})();
