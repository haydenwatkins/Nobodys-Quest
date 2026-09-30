/* A living belfry: hammered metal, a frayed red crown, and a swinging clapper.
   Its third peal opens the whole bell; no pose delays the immediate chime. */
"use strict";
(() => {
  const {grid,compactSprite}=G.authoredPixelArt;
  const palette={k:'#171e29',a:'#293441',b:'#465564',c:'#758c97',d:'#b7c8c5',e:'#9d773e',f:'#d7ad5d',g:'#f4df9c',h:'#78dce0',i:'#8d485c',j:'#c87583',l:'#c0a2dd'};
  function draw(dir,mode,step){
    const g=grid(42,40),side=dir==='east'||dir==='west',back=dir==='north';
    const walk=mode==='walk'?Math.sin(step/6*Math.PI*2):0;
    const ringing=mode==='attack'||mode==='peal',peal=mode==='peal',mute=mode==='silence';
    const open=ringing&&step===1,settle=ringing&&step===2,hush=mute&&step!==2;
    const cx=21+Math.round(walk),bob=mode==='idle'?step:Math.round(Math.abs(walk));
    const top=6+bob,half=side?9:13,flare=open?(peal?3:1):0,rim=30+bob;
    // The clapper sits behind the mouth, with room to swing during the peal.
    const swing=Math.round(walk*3)+(open?(side?7:peal?7:4):settle?-3:0);
    g.line(cx,27+bob,cx+swing,35+bob,'k',3);g.line(cx,27+bob,cx+swing,35+bob,'e',1);
    g.ellipse(cx+swing,36+bob,4,2,'k');g.ellipse(cx+swing,36+bob,3,1,'g');
    // Riveted handles, tucked in for Silence and thrown wide on a peal.
    for(const sign of [-1,1]){
      const reach=hush?half+(step===1?-1:1):half+3+(open&&peal?2:0),handY=hush?(step===1?20:24)+bob:open?22+bob:28+bob;
      g.line(cx+sign*(half-3),20+bob,cx+sign*reach,handY,'k',4);
      g.line(cx+sign*(half-3),20+bob,cx+sign*reach,handY,'c',2);
      g.rect(cx+sign*reach-1,handY-1,3,3,hush?'l':'d');
    }
    g.poly([[cx-5,top],[cx+5,top],[cx+half,27+bob],[cx+half+2+flare,rim],[cx-half-2-flare,rim],[cx-half,27+bob]],'k');
    g.poly([[cx-4,top+2],[cx+4,top+2],[cx+half-2,27+bob],[cx+half+flare,rim-2],[cx-half-flare,rim-2],[cx-half+2,27+bob]],'b');
    // Curved ribs and a worn casting seam distinguish front, side, and back.
    g.line(cx-half+3,25+bob,cx-3,top+3,'a',2);
    g.line(cx+3,top+3,cx+half-3,25+bob,'d',1);
    g.line(cx+1,top+4,cx+2,25+bob,'c',2);
    if(back){
      g.line(cx-2,top+5,cx-2,25+bob,'a',1);
      g.poly([[cx,16+bob],[cx+3,19+bob],[cx,22+bob],[cx-3,19+bob]],'e');g.put(cx,19+bob,'f');
      g.rect(cx-1,8+bob,2,5,'i');
    }else{
      const eye=side?cx+3:cx-5,glow=hush?'l':open&&peal?'g':'h';
      g.rect(eye-1,15+bob,4,4,'k');g.rect(eye,16+bob,2,2,glow);
      if(!side){g.rect(cx+2,15+bob,4,4,'k');g.rect(cx+3,16+bob,2,2,glow);}
      g.line(side?cx+3:cx-2,21+bob,side?cx+5:cx+2,21+bob,'a',1);
    }
    // A brass shoulder band, stamped rim, and dark open mouth.
    g.rect(cx-5,10+bob,side?11:10,2,'e');g.line(cx-4,10+bob,cx+4,10+bob,'f',1);
    g.rect(cx-half-flare,rim-4,2*(half+flare)+1,3,hush?'i':'e');
    g.line(cx-half-flare+1,rim-4,cx+half+flare-1,rim-4,hush?'l':open&&peal?'g':'f',1);
    for(let x=cx-half+3;x<=cx+half-2;x+=5)g.put(x,rim-2,'a');
    g.line(cx-half+1,rim,cx+half-1,rim,'a',1);
    if(open)g.line(cx-half+3,rim+1,cx+half-3,rim+1,'g',1);
    // The red hanging loop has a split fabric end rather than a solid cap.
    g.rect(cx-2,1+bob,4,4,'k');g.rect(cx-1,2+bob,2,3,'i');g.put(cx,2+bob,'j');
    g.line(cx+1,4+bob,cx+3+Math.round(walk),8+bob,'i',1);g.put(cx+4+Math.round(walk),8+bob,'j');
    if(dir==='west')for(const row of g.cells)row.reverse();
    return g.rows();
  }
  const frames=[],directional={};
  for(const dir of ['south','east','north','west']){
    directional[dir]={};
    for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['peal',3],['silence',3],['guard',1]]){
      directional[dir][mode]=[];
      for(let n=0;n<count;n++){directional[dir][mode].push(frames.length);frames.push(draw(dir,mode,n));}
    }
  }
  const sprite=compactSprite({palette,frames,density:2,authored:true,directional,animations:directional.south});
  sprite.directional=directional;G.forms.bellkeeper.sprite=sprite;
})();
