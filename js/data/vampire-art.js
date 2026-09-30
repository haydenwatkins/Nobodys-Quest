/* A courtly night creature: crimson-lined tails, a raised collar, and a bite
   that opens the cape. Keep the existing twenty-unit footprint in both modes. */
"use strict";
(() => {
  const {grid,compactSprite}=G.authoredPixelArt;
  const palette={k:'#181724',a:'#292031',b:'#453047',c:'#653044',d:'#a44054',e:'#d37579',f:'#e6c8bb',g:'#b38b9d',h:'#f5e6cf',i:'#a895b9',j:'#ddb67c'};
  function limb(g,x,y,xx,yy,color){g.line(x,y,xx,yy,'k',4);g.line(x,y,xx,yy,color,2);}
  function draw(dir,mode,step){
    const g=grid(40,40),back=dir==='north',side=dir==='east'||dir==='west';
    const stride=mode==='walk'?Math.sin(step/6*Math.PI*2):0;
    const bite=mode==='attack',open=bite&&step===0,reach=bite&&step===1;
    const cx=20+(reach&&side?2:0),cy=12-(mode==='idle'?step:Math.round(Math.abs(stride))),spread=open?5:reach?3:0;
    // Boots remain below the floating cape, even in the rear silhouette.
    limb(g,cx-3,30,cx-3+Math.round(stride*3),37,'b');limb(g,cx+3,30,cx+3-Math.round(stride*3),37,'a');
    g.rect(cx-5+Math.round(stride*3),37,5,2,'k');g.rect(cx+1-Math.round(stride*3),37,5,2,'k');
    g.poly([[cx-7,cy+5],[cx-13-spread,cy+2],[cx-11-stride*2,35],[cx-3,31],[cx,34],[cx+3,31],[cx+11-stride*2,35],[cx+13+spread,cy+2],[cx+7,cy+5]],'k');
    g.poly([[cx-6,cy+7],[cx-11-spread,cy+5],[cx-9-stride*2,32],[cx-3,28],[cx,31],[cx+3,28],[cx+9-stride*2,32],[cx+11+spread,cy+5],[cx+6,cy+7]],back?'b':'c');
    if(!back){g.line(cx-10-spread,cy+6,cx-8-stride*2,29,'d',2);g.line(cx+10+spread,cy+6,cx+8-stride*2,29,'d',2);}
    else {g.line(cx-6,cy+9,cx-7-stride*2,30,'i',1);g.line(cx+5,cy+8,cx+6-stride*2,29,'a',2);g.poly([[cx-3,cy+9],[cx,cy+11],[cx+3,cy+9],[cx+2,cy+14],[cx,cy+13],[cx-2,cy+14]],'j');}
    if(!back){
      g.poly([[cx-5,cy+6],[cx+5,cy+6],[cx+6,30],[cx+2,33],[cx,29],[cx-3,33],[cx-6,30]],'k');
      g.rect(cx-4,cy+8,8,14,'a');g.line(cx+3,cy+10,cx+3,28,'b',1);
      g.poly([[cx-3,cy+7],[cx+3,cy+7],[cx+1,cy+12],[cx,cy+10],[cx-1,cy+12]],'h');g.rect(cx-1,cy+9,3,2,'d');g.put(cx,cy+10,'j');
      g.rect(cx-4,28,8,2,'b');g.rect(cx,28,2,2,'j');
    }
    const handY=cy+(open?6:reach?9:14),armX=side&&reach?cx+13:cx+9+spread;
    limb(g,cx-5,cy+9,cx-9-spread,handY,'b');limb(g,cx+5,cy+9,armX,handY,'b');
    if(!back||bite){g.rect(cx-10-spread,handY-1,3,3,'f');g.rect(armX-1,handY-1,3,3,'f');}
    // High collar and swept hair frame a pale face; the rear has no painted eyes.
    g.poly([[cx-8,cy-1],[cx-5,cy+7],[cx+5,cy+7],[cx+8,cy-1],[cx+4,cy+4],[cx-4,cy+4]],'k');
    g.line(cx-7,cy+1,cx-4,cy+6,'d',1);g.line(cx+7,cy+1,cx+4,cy+6,'d',1);
    const hx=cx+(side?2:0)+(reach&&!back?1:0),hy=cy+(reach&&!side?2:0);
    g.poly([[hx-6,hy-7],[hx-3,hy-10],[hx+3,hy-9],[hx+6,hy-5],[hx+6,hy+2],[hx+2,hy+6],[hx-3,hy+5],[hx-6,hy+1]],'k');
    if(back){g.poly([[hx-4,hy-6],[hx-2,hy-8],[hx+2,hy-7],[hx+4,hy-4],[hx+3,hy+3],[hx-3,hy+3]],'a');g.line(hx-3,hy-5,hx,hy-7,'b',1);}
    else {
      g.poly([[hx-4,hy-5],[hx+3,hy-5],[hx+4,hy],[hx+6,hy+1],[hx+3,hy+2],[hx+2,hy+4],[hx-2,hy+4],[hx-4,hy+1]],'f');
      g.line(hx-4,hy-3,hx-3,hy+2,'g',1);g.poly([[hx-5,hy-5],[hx-2,hy-8],[hx+3,hy-7],[hx+4,hy-4],[hx+1,hy-4],[hx,hy-2],[hx-2,hy-4]],'a');
      g.rect(hx+(side?2:-3),hy,2,1,'d');if(!side)g.rect(hx+2,hy,2,1,'d');
      g.rect(hx+(side?2:-2),hy+2,side?3:5,bite?2:1,'k');g.put(hx+(side?3:-2),hy+2,'h');if(!side)g.put(hx+2,hy+2,'h');
    }
    if(dir==='west')for(const row of g.cells)row.reverse();
    return g.rows();
  }
  const frames=[],directional={};
  for(const dir of ['south','east','north','west']){
    directional[dir]={};for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['guard',1]]){
      directional[dir][mode]=[];for(let i=0;i<count;i++){directional[dir][mode].push(frames.length);frames.push(draw(dir,mode,i));}
    }
  }
  const sprite=compactSprite({palette,frames,density:2,authored:true,directional,animations:directional.south});
  sprite.directional=directional;G.forms.vampire.sprite=sprite;
})();
