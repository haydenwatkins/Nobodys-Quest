/* Frostbell's living waystation bells: rounded hammered metal, warm faces,
   joined handles and visible clappers. Ring/peal/silence clocks stay native. */
"use strict";
(() => {
  const A=G.authoredPixelArt;
  const palette={k:'#373740',a:'#735445',b:'#a47a50',c:'#cf9e61',d:'#ebc17c',e:'#f6dc9e',f:'#fff0ca',g:'#536d75',h:'#78979a',i:'#a9bdb5',j:'#d0d6bb',l:'#bf8680',m:'#e1ada0',n:'#8c7a99',o:'#bba8c5',p:'#ecdeeb',q:'#48605f',r:'#779383',s:'#b1c2a2'};
  function handle(g,x,y,hx,hy,elder){
    g.line(x,y,hx,hy,'k',elder?6:4);g.line(x,y,hx,hy,elder?'h':'c',elder?4:2);
    g.ellipse(hx,hy,elder?4:3,elder?4:3,'k');g.ellipse(hx,hy-1,elder?3:2,elder?3:2,elder?'i':'e');g.put(hx-1,hy-2,'f');
  }
  function bell(g,cx,bob,side,back,mode,step,walk,elder){
    const peal=mode==='peal',ringing=mode==='attack'||peal,open=ringing&&step===1,hush=mode==='silence',closed=hush&&step===1;
    const cy=(elder?26:20)+bob,rx=side?9:elder?17:12,ry=elder?18:12,rim=(elder?41:31)+bob;
    const flare=open?(peal?3:1):0,swing=Math.round(walk*(elder?4:2))+(open?(side?4:peal?5:2):ringing&&step===2?-2:0);
    // The clapper shaft is joined inside the bell and remains visible below its mouth.
    g.line(cx,cy+6,cx+swing,rim+5,'k',elder?5:3);g.line(cx,cy+6,cx+swing,rim+5,'b',elder?3:1);
    const clapperY=rim+(elder?6:5);
    g.ellipse(cx+swing,clapperY,elder?5:3,elder?3:2,'k');g.ellipse(cx+swing,clapperY-1,elder?4:2,elder?2:1,'d');g.put(cx+swing-1,clapperY-2,'f');
    const reach=rx+(closed?0:open&&peal?5:3),hy=closed?cy+2:open?cy+1:cy+7;
    for(const sign of [-1,1])handle(g,cx+sign*(rx-3),cy+1,cx+sign*reach,hy+Math.round(walk*sign),elder);
    // Curved shoulder and full lip, rather than a triangular cloak silhouette.
    g.ellipse(cx,cy,rx,ry,'k');g.ellipse(cx,cy-1,rx-1,ry-1,elder?'g':'b');
    g.ellipse(cx-2,cy-2,rx-3,ry-3,elder?'h':'c');g.ellipse(cx-4,cy-3,Math.max(2,rx-7),ry-5,elder?'i':'d');
    g.poly([[cx-rx+2,cy+4],[cx+rx-2,cy+4],[cx+rx+flare,rim],[cx-rx-flare,rim]],elder?'g':'b');
    g.line(cx-rx+4,cy+5,cx-rx+2,rim-3,elder?'i':'d',2);g.line(cx+rx-3,cy+4,cx+rx-1,rim-3,elder?'q':'a',2);
    // A cast-metal hanging loop joins the crown of the bell. No ribbon/crown stamp.
    const ly=cy-ry-3;
    g.ellipse(cx,ly,elder?5:4,elder?4:3,'k');g.ellipse(cx,ly-1,elder?4:3,elder?3:2,'c');g.ellipse(cx,ly-1,elder?2:1,elder?2:1,'.');g.line(cx-2,ly+3,cx+2,ly+3,'d',2);
    if(back){g.line(cx-1,cy-7,cx-1,cy+6,elder?'g':'a',1);g.line(cx+1,cy-7,cx+1,cy+6,elder?'j':'e',1);
      g.ellipse(cx+4,cy+1,2,3,elder?'g':'c');g.put(cx+4,cy,'f');
    }else{
      const eyeY=cy-2,eyes=side?[cx+3]:[cx-4,cx+4];
      for(const ex of eyes){if(closed)g.line(ex-1,eyeY+1,ex+1,eyeY+1,'k',1);else{g.ellipse(ex,eyeY,2,3,'k');g.put(ex-1,eyeY-1,'f');}if(elder)g.line(ex-2,eyeY-4,ex+1,eyeY-4,'j',1);}
      const mx=side?cx+4:cx;g.line(mx-2,cy+5,mx+2,cy+5,'a',1);g.put(mx,cy+6,elder?'i':'d');
      g.ellipse(cx-(side?1:7),cy+2,2,1,'l');if(!side)g.ellipse(cx+7,cy+2,2,1,'l');
    }
    const lip=closed?'n':'b',shine=closed?'o':open&&peal?'f':'e';
    g.ellipse(cx,rim,rx+2+flare,3,'k');g.ellipse(cx,rim-1,rx+1+flare,2,lip);g.line(cx-rx-flare+1,rim-2,cx+rx+flare-1,rim-2,shine,2);
    for(let x=cx-rx+3;x<cx+rx-2;x+=5)g.put(x,rim,'d');
    // Engraved song dashes follow the metal rim; they are part of its surface.
    for(const dx of [-5,0,5]){g.put(cx+dx,cy+9,elder?'j':'e');g.put(cx+dx+1,cy+8,elder?'i':'d');}
    if(open)g.line(cx-rx+3,rim+2,cx+rx-3,rim+2,peal?'f':'d',1);
    if(hush&&step===2)g.line(cx-4,cy+7,cx+4,cy+7,'o',1);
  }
  function draw(dir,mode,step){
    const g=A.grid(42,40),side=dir==='east'||dir==='west',back=dir==='north';
    const walk=mode==='walk'?Math.sin(step*Math.PI/3):0;
    const bob=mode==='idle'?step:mode==='attack'||mode==='peal'?[1,0,-1][step]:mode==='silence'?[0,1,-1][step]:Math.round(Math.abs(walk));
    bell(g,21+Math.round(walk),bob,side,back,mode,step,walk,false);
    if(dir==='west')for(const row of g.cells)row.reverse();return g.rows();
  }
  const frames=[],directional={};for(const dir of ['south','east','north','west']){const set=directional[dir]={};for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['peal',3],['silence',3],['guard',1]]){set[mode]=[];for(let i=0;i<count;i++){set[mode].push(frames.length);frames.push(draw(dir,mode,i));}}}
  const sprite=A.compactSprite({palette,frames,density:2,authored:true,directional,animations:directional.south});sprite.directional=directional;G.forms.bellkeeper.sprite=sprite;
  G.enemies.bellTitan.sprite=A.compactSprite(A.authored(54,52,palette,(g,frame)=>{
    const bob=frame===1?1:frame===3?-1:0;bell(g,27,bob,false,false,frame===2?'peal':'idle',frame===2?1:0,frame===1?1:frame===3?-1:0,true);
  }));
})();
