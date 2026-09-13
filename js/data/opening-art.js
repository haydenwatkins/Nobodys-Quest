/* Directional paper-and-pixel characters. Each direction has two breathing
   poses, six articulated strides, three attack beats and a planted guard.
   The palette-grid format stays editable by the family. */
"use strict";
(() => {
  const {grid}=G.authoredPixelArt;
  const palette={k:'#151522',a:'#303249',b:'#706c85',c:'#b8b4bf',d:'#f2ece0',e:'#fff9ea',f:'#98d7cb',g:'#ddc07f',h:'#b75b65',i:'#713e59',j:'#bc8798',l:'#795a6c',m:'#dcaeab',n:'#e6d5b5',o:'#536174',p:'#7c98a6',q:'#a7c2c5',r:'#3c485d',s:'#efcf8d',t:'#8d5550',u:'#a47556',v:'#5c4146'};
  function stroke(g,x1,y1,x2,y2,fill,w=3){g.line(x1,y1,x2,y2,'k',w+2);g.line(x1,y1,x2,y2,fill,w);}
  function humanoid(g,id,dir,mode,step){
    const back=dir==='north',side=dir==='east'||dir==='west';
    const stride=mode==='walk'?Math.sin(step/6*Math.PI*2):0;
    const bob=mode==='walk'?Math.round(Math.abs(stride)):mode==='idle'?step:0;
    const attack=mode==='attack',beat=attack?step:-1,guard=mode==='guard';
    const knight=id==='knight',cx=25+(beat===1?2:beat===0?-1:0),hip=36-bob,head=17-bob;
    // Cape and coat tails turn independently of the planted torso.
    if(knight){g.poly([[cx-8,head+5],[cx+5,head+6],[cx+9-Math.round(stride*2),42],[cx-9,40]],'k');
      g.poly([[cx-6,head+6],[cx+3,head+7],[cx+6-Math.round(stride*2),40],[cx-7,38]],'i');
      g.line(cx-5,28,cx-4,37,'h',2);}
    const span=side?3:5;
    stroke(g,cx-span,hip,cx-span+Math.round(stride*4),44-Math.round(Math.max(0,stride)*2),knight?'r':'b',3);
    stroke(g,cx+span,hip,cx+span-Math.round(stride*4),44-Math.round(Math.max(0,-stride)*2),knight?'o':'c',3);
    g.rect(cx-span-2+Math.round(stride*4),44,6,2,'k');g.rect(cx+span-2-Math.round(stride*4),44,6,2,'k');
    g.poly([[cx-7,24-bob],[cx+6,23-bob],[cx+8,35-bob],[cx+3,39-bob],[cx-7,36-bob]],'k');
    g.poly([[cx-5,25-bob],[cx+4,25-bob],[cx+5,34-bob],[cx+1,36-bob],[cx-5,34-bob]],knight?'o':'d');
    g.line(cx-4,26-bob,cx-4,33-bob,knight?'q':'e',2);
    g.rect(cx-5,34-bob,10,2,knight?'g':'c');
    if(!knight&&!back){g.rect(cx,27-bob,2,4,'f');g.put(cx-1,28-bob,'f');}
    const reach=beat===1?14:beat===0?-4:beat===2?8:4;
    const armY=attack?head+9:head+14;
    stroke(g,cx-6,25-bob,cx-9-Math.round(stride),armY,knight?'p':'c',3);
    stroke(g,cx+6,25-bob,cx+8+(attack?reach:Math.round(stride)),attack?head+7:armY,knight?'q':'d',3);
    if(knight){
      // Tapered heater shield: straps on the rear, warm enamel on the face.
      const sx=guard?cx+6:cx-9,sy=guard?29:32;
      g.poly([[sx-7,sy-8],[sx+6,sy-8],[sx+6,sy+1],[sx,sy+9],[sx-7,sy+2]],'k');
      g.poly([[sx-5,sy-6],[sx+4,sy-6],[sx+4,sy],[sx,sy+6],[sx-5,sy+1]],back?'u':'h');
      g.line(sx,sy-5,sx,sy+3,'s',1);if(!back)g.line(sx-3,sy-2,sx+2,sy-2,'s',1);
      const ax=cx+8+(attack?reach:0),ay=attack?head+7:35;
      const end=beat===0?[ax-6,ay-16]:beat===1?[ax+9,ay-10]:[ax+3,ay-15];
      stroke(g,ax,ay,end[0],end[1],'q',2);g.line(ax,ay,end[0]-1,end[1],'e',1);
      g.line(ax-3,ay-1,ax+3,ay+1,'g',2);g.put(ax,ay+3,'s');
    }
    // Nobody's blank face keeps a distinctive, slightly uneven soft outline.
    g.ellipse(cx,head,knight?9:8,knight?9:9,'k');
    g.ellipse(cx,head-1,knight?8:7,8,knight?'p':'d');
    g.ellipse(cx-2,head-3,5,5,knight?'q':'e');
    if(knight){
      g.poly([[cx-8,head-2],[cx+8,head-2],[cx+7,head+4],[cx-6,head+5]],'r');
      if(!back){g.rect(cx+(side?3:-5),head,side?4:3,2,'f');if(!side)g.rect(cx+3,head,3,2,'f');}
      else {g.line(cx,head-7,cx,head+6,'o',2);g.rect(cx-4,head+5,8,2,'p');}
      g.line(cx,head-9,cx+Math.round(stride*3)-3,head-14,'h',3);g.line(cx-1,head-13,cx-6,head-11,'i',2);
      g.rect(cx-4,head+7,8,2,'g');
    }else if(!back){
      const eyeX=side?cx+3:cx-4;g.rect(eyeX,head-1,3,4,'a');if(!side)g.rect(cx+3,head,2,4,'a');
      g.put(side?cx+6:cx,head+5,'b');
    }else g.line(cx-3,head+6,cx+2,head+7,'c',1);
    if(dir==='west')for(const row of g.cells)row.reverse();
  }
  function rat(g,dir,mode,step){
    const side=dir==='east'||dir==='west',back=dir==='north';
    const s=mode==='walk'?Math.sin(step/6*Math.PI*2):0;
    const bite=mode==='attack'?step:-1,bob=mode==='idle'?step:Math.round(Math.abs(s));
    const cx=side?25:26,cy=34-bob;
    // Curved tail, haunches and separated fore/hind paws instead of a bobbing icon.
    const tail=[[cx-10,cy+2],[cx-17,cy],[cx-21,cy-5],[cx-19,cy-10]];
    for(let i=1;i<tail.length;i++)stroke(g,...tail[i-1],...tail[i],'j',1);
    g.ellipse(cx-3,cy,side?12:9,7,'k');g.ellipse(cx-3,cy-1,side?11:8,6,'l');
    g.ellipse(cx-5,cy-3,7,4,'b');g.ellipse(cx-7,cy+1,4,4,'a');
    for(const [dx,phase]of [[-10,1],[4,-1]]){
      const tx=cx+dx+Math.round(s*phase*3);g.line(cx+dx,cy+4,tx,cy+9,'k',3);g.line(tx,cy+9,tx+3,cy+9,'m',1);
    }
    const hx=side?cx+8+(bite===1?3:0):cx,hy=side?cy-5:cy+(back?-7:1);
    g.ellipse(hx,hy,7,6,'k');g.ellipse(hx,hy,6,5,'c');
    g.ellipse(hx-4,hy-6,4,5,'k');g.ellipse(hx-4,hy-6,3,4,'j');g.ellipse(hx-4,hy-7,2,2,'m');
    g.ellipse(hx+3,hy-6,4,4,'k');g.ellipse(hx+3,hy-6,3,3,'j');
    if(!back){
      g.poly([[hx+3,hy-2],[hx+10,hy+2],[hx+3,hy+5]],'c');
      g.rect(hx+(side?3:-3),hy-1,2,3,'a');if(!side)g.rect(hx+3,hy,2,2,'a');
      g.put(hx+4,hy-1,'e');g.rect(hx+9,hy+1,2,2,'h');
      g.line(hx+6,hy+3,hx+12,hy+5,'n',1);g.line(hx+7,hy+2,hx+12,hy,'n',1);
      if(bite===1){g.line(hx+5,hy+4,hx+10,hy+7,'k',2);g.put(hx+7,hy+4,'e');g.put(hx+9,hy+5,'e');}
    }
    if(dir==='west')for(const row of g.cells)row.reverse();
  }
  for(const id of ['nobody','rat','knight']){
    const frames=[],directional={};
    for(const dir of ['south','east','north','west']){
      directional[dir]={};
      for(const [mode,count]of [['idle',2],['walk',6],['attack',3],['guard',1]]){
        directional[dir][mode]=[];
        for(let i=0;i<count;i++){
          const g=grid(56,48);if(id==='rat')rat(g,dir,mode,i);else humanoid(g,id,dir,mode,i);
          directional[dir][mode].push(frames.length);frames.push(g.rows());
        }
      }
    }
    const dense={palette,frames,density:2,authored:true,directional,animations:directional.south};
    const sprite=G.authoredPixelArt.compactSprite(dense);sprite.directional=directional;
    G.forms[id].sprite=sprite;
  }
  // Readable living thorns and watchmen share the route's material palette.
  function tangle(spitter){return G.authoredPixelArt.authored(30,30,{k:'#151522',a:'#374c45',b:'#6c8056',c:'#b0ba79',d:'#e6cf86',e:'#bd7680'},(g,f)=>{
    const b=f===1?1:0;g.ellipse(15,20+b,11,7,'k');g.ellipse(15,19+b,10,6,'a');
    g.poly([[4,19],[8,9],[12,13],[16,5],[20,12],[26,9],[25,21]],'b');
    g.line(8,18,15,10,'c',2);g.line(17,19,22,13,'c',1);
    g.rect(10,18+b,3,3,'d');g.rect(19,18+b,3,3,'d');
    if(spitter){g.ellipse(16,23,4,3,'k');g.put(16,22,'e');}
    g.line(7,24,4-(f===1?1:0),28,'a',2);g.line(23,24,26+(f===3?1:0),28,'a',2);
  });}
  G.enemies.orchardTangle.sprite=G.authoredPixelArt.compactSprite(tangle(false));
  G.enemies.orchardSpitter.sprite=G.authoredPixelArt.compactSprite(tangle(true));
  G.enemies.orchardGuard.sprite=G.forms.knight.sprite;

  G.beginFormPerformance=(p,ability)=>{
    const active={nobody:'slap',rat:'bite',knight:'slash',ranger:'arrow'};
    if(active[G.state.formId]!==ability)return false;
    const windup=ability==='arrow'?.09:ability==='slash'?.055:ability==='bite'?.025:.035;
    p.performance={ability,form:G.state.formId,t:0,windup,duration:ability==='arrow'?.3:ability==='slash'?.29:.22,fired:false,dir:{...p.dir}};
    return true;
  };
  G.updateFormPerformance=dt=>{
    const p=G.state.player,a=p.performance;if(!a)return;
    if(a.form!==G.state.formId||G.state.knockout){p.performance=null;return;}
    a.t+=dt;
    if(!a.fired&&a.t>=a.windup){
      a.fired=true;const dir=p.dir;p.dir=a.dir;G.abilities[a.ability].use(p);p.dir=dir;
    }
    if(a.t>=a.duration)p.performance=null;
  };
  G.performanceFrame=(sprite,p,time)=>{
    const active=G.activeSpriteDefinition(sprite),dirs=active.directional;if(!dirs)return null;
    const a=p.performance,dir=a?a.dir:p.dir;
    const facing=Math.abs(dir.x)>Math.abs(dir.y)?dir.x<0?'west':'east':dir.y<0?'north':'south';
    const set=dirs[facing];
    if(a){const beat=a.t<a.windup?0:a.t<a.windup+.075?1:2;return set.attack[beat];}
    if(G.state.formId==='knight'&&p.knightGuardT>0)return set.guard[0];
    if(p.moving||p.dashing)return set.walk[Math.floor(p.anim*1.55)%set.walk.length];
    return set.idle[Math.floor(time*1.6)%set.idle.length];
  };
  G.drawFormPerformance=(ctx,sprite,x,y)=>{
    const frame=G.performanceFrame(sprite,G.state.player,G.state.time);if(frame===null)return false;
    G.drawSprite(ctx,sprite,frame,x,y,false);return true;
  };
})();

// The first guardian has a broad asymmetric crown, hanging moss, an old
// doorway in its trunk, and a readable reach pose. Other guardians keep their art.
(() => {
  G.openingTreantSprite=G.authoredPixelArt.compactSprite(G.authoredPixelArt.authored(116,108,
    {k:'#202d32',a:'#493f3b',b:'#755745',c:'#9e7b52',d:'#d8bb7b',e:'#e9dbaa',f:'#354e40',g:'#57704d',h:'#7d915c',i:'#a7b77c',j:'#82aaa0'},(g,frame)=>{
      const reach=frame===2?7:0,sway=frame===1?2:frame===3?-2:0;
      g.poly([[38,68],[35,94],[21,104],[43,102],[53,88],[64,89],[74,104],[97,104],[81,94],[75,65]],'k');
      g.poly([[41,69],[40,91],[31,101],[44,98],[54,82],[64,84],[77,101],[87,101],[77,92],[71,66]],'b');
      g.line(46,83,39,99,'c',3);g.line(71,82,78,98,'c',3);
      // Elbows and forked branch fingers; the right arm rises before a sweep.
      g.line(41,58,23-reach,63-reach,'k',11);g.line(23-reach,63-reach,13-reach,41-reach,'k',9);
      g.line(41,57,23-reach,61-reach,'b',8);g.line(23-reach,61-reach,13-reach,40-reach,'c',5);
      for(let i=0;i<3;i++)g.line(13-reach,42-reach,3+i*8-reach,30-i*4-reach,'b',3);
      g.line(73,60,91+reach,48-reach,'k',10);g.line(91+reach,48-reach,99+reach,30-reach,'k',8);
      g.line(72,58,91+reach,46-reach,'b',7);g.line(91+reach,46-reach,99+reach,29-reach,'c',4);
      for(let i=0;i<3;i++)g.line(99+reach,31-reach,91+i*8+reach,18-i*2,'b',3);
      g.poly([[35,39],[77,35],[72,54],[76,80],[66,91],[46,89],[35,77],[40,57]],'k');
      g.poly([[39,40],[72,38],[68,55],[72,78],[64,87],[47,84],[40,76],[44,55]],'b');
      g.poly([[44,43],[52,41],[50,65],[45,80],[41,76]],'c');g.poly([[62,43],[68,42],[65,67],[69,80],[63,83]],'a');
      for(let i=0;i<6;i++){const x=43+i*5;g.line(x,44,x+(i%2?2:-2),76,'a',1);}
      // An actual hollow, not a smile pasted on a tree.
      g.poly([[49,65],[54,59],[60,59],[65,65],[63,78],[51,78]],'k');
      g.line(52,66,60,65,'a',1);g.rect(53,72,7,1,'d');
      g.poly([[41,49],[52,47],[53,51],[44,54]],'a');g.poly([[61,47],[72,48],[69,53],[60,51]],'a');
      g.rect(44,50,7,2,'e');g.rect(62,49,7,2,'e');
      [[36,31,19,13],[56,21,24,17],[80,29,21,14],[24,34,16,10],[68,37,23,12]].forEach(([x,y,rx,ry],i)=>{
        g.ellipse(x+sway,y,rx,ry,'k');g.ellipse(x+sway,y-2,rx-1,ry-2,'f');g.ellipse(x-3+sway,y-5,rx-4,ry-5,'g');
        g.poly([[x-rx+5+sway,y-5],[x-4+sway,y-ry+3],[x+8+sway,y-ry+5],[x+2+sway,y-7]],'h');
        g.line(x-7+sway,y-ry+5,x+sway,y-ry+3,'i',2);
      });
      for(let i=0;i<8;i++){const x=29+i*8+sway;g.line(x,35+(i%3)*2,x-2,48+(i%2)*5,'g',2);g.put(x-2,47+(i%2)*5,'i');}
      g.rect(51,40,6,3,'j');g.rect(54,38,1,7,'e');
    }));
})();
