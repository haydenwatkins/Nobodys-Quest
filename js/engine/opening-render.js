/* Orchard art direction: warm limestone, old rose canvas, blue-green shadow,
   ivory paper, copper bells. Scenery is code-native and draws without assets. */
"use strict";
(() => {
  const C={ink:'#202d32',dark:'#293f3b',shade:'#395548',grass:'#647957',light:'#91a270',gold:'#d9bd7e',paper:'#f0dfb2',wood:'#795749',woodDark:'#4a3e3d',rose:'#a76064',water:'#3f7377',blue:'#85b4ad'};
  const here=()=>G.state&&G.state.mapDef&&G.state.mapDef.openingLandscape;
  const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);};
  function poly(c,points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
  function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
  const rand=G.util.hash2;
  const freshOrchard=()=>G.state.mapId==='orchardRoad'||G.state.mapId==='heartwood';
  G.drawOpeningTile=(c,cell,x,y,time)=>{
    if(!here())return false;
    const px=x*16,py=y*16,t=cell.tile,r=rand(x+41,y+77),night=G.state.mapId==='heartwood';
    if(t==='water'){
      rect(c,px,py,16,16,C.water);
      for(let i=0;i<3;i++){const wx=px+Math.floor(rand(x+i,y)*12),wy=py+3+i*4;rect(c,wx,wy,3+Math.floor(r*5),1,i===0?'#619696':'#50848a');}
      if(Math.floor(time*2+r*5)%4===0)rect(c,px+4,py+6,5,1,C.blue);
      if((freshOrchard()||G.state.mapId==='sunriseQuay'))for(const [dx,dy]of [[0,-1],[1,0],[0,1],[-1,0]]){
        const n=G.state.grid[y+dy]&&G.state.grid[y+dy][x+dx];if(!n||n.tile==='water')continue;
        if(dx){rect(c,px+(dx>0?15:0),py,1,16,'#345b59');if(r>.5)rect(c,px+(dx>0?13:1),py+4,2,5,'#61928b');}
        else{rect(c,px,py+(dy>0?15:0),16,1,'#345b59');if(r>.5)rect(c,px+4,py+(dy>0?13:1),5,1,'#85aaa0');}
      }
      return true;
    }
    const grass=night?['#4c6450','#506852','#536b54']:['#70825b','#73865e','#778861'];
    const groundPatch=(freshOrchard()||G.state.mapId==='sunriseQuay')?rand(Math.floor((x+(Math.floor(y/4)%2)*2)/5),Math.floor(y/4)):rand(Math.floor(x/3),Math.floor(y/3));
    const color=t==='tree'?C.dark:t==='path'?['#b09a71','#b6a17b','#b5a079'][Math.floor(r*3)]:grass[Math.floor(groundPatch*3)];
    rect(c,px,py,16,16,color);
    if(t==='tree'){
      // A joined canopy, with darker recesses and clustered leaf shapes.
      for(let i=0;i<4;i++){
        const ox=px+Math.floor(rand(x+i*23,y+7)*13),oy=py+Math.floor(rand(x+2,y+i*17)*13);
        rect(c,ox,oy,4,3,i===0?'#46624d':'#314d40');rect(c,ox+1,oy-1,2,1,'#526c50');
      }
      if(r>.7){rect(c,px+9,py+9,2,7,C.woodDark);rect(c,px+8,py+9,1,5,C.wood);}
    }else if(t==='path'){
      for(let i=0;i<3;i++)rect(c,px+Math.floor(rand(x+i,y+4)*14),py+Math.floor(rand(y+i,x+4)*14),2,1,i===0?'#c5b58c':'#9c8c69');
      if((freshOrchard()||G.state.mapId==='sunriseQuay')&&r>.55){const sx=px+3+Math.floor(r*7),sy=py+4+Math.floor(rand(y+9,x)*7);rect(c,sx,sy,3,1,'#a28c68');rect(c,sx,sy-1,2,1,'#d2be94');if(r>.85)rect(c,sx+3,sy+3,1,1,'#d2be94');}
      for(const [dx,dy]of [[0,-1],[1,0],[0,1],[-1,0]]){
        const n=G.state.grid[y+dy]&&G.state.grid[y+dy][x+dx];
        if(n&&n.tile==='grass'){
          if(dx)rect(c,px+(dx>0?14:0),py+Math.floor(r*6),2,10,grass[0]);
          else rect(c,px+Math.floor(r*6),py+(dy>0?14:0),10,2,grass[0]);
        }
      }
    }else{
      if(r>.25){const ox=px+Math.floor(r*12),oy=py+Math.floor(rand(y+5,x)*12);rect(c,ox,oy,1,3,night?'#698563':'#92a472');rect(c,ox+2,oy+1,1,2,night?'#698563':'#92a472');}
      if((freshOrchard()||G.state.mapId==='sunriseQuay')&&r>.62){const ox=px+3+Math.floor(rand(y+13,x+3)*8),oy=py+4+Math.floor(r*7);rect(c,ox,oy+2,3,1,night?'#425e49':'#657c50');rect(c,ox-1,oy,2,1,night?'#75956b':'#a3b17b');rect(c,ox+2,oy-1,2,1,night?'#66815e':'#8b9e68');if(r>.91)rect(c,ox+3,oy+1,1,1,C.gold);}
      if(r>.93){rect(c,px+6,py+7,1,4,C.shade);rect(c,px+5,py+6,3,2,night?'#a6c8a3':'#e5ce91');}
      if(t==='rock'){
        poly(c,[[px+2,py+13],[px+1,py+7],[px+6,py+3],[px+12,py+5],[px+15,py+13]],'#485c54');
        poly(c,[[px+2,py+7],[px+6,py+3],[px+12,py+5],[px+9,py+8]],'#91a18a');
        rect(c,px+6,py+5,4,1,'#b4b69a');
      }
    }
    return true;
  };
  function tree(c,x,y,seed,apple){
    if(freshOrchard()&&G.openingScenery){
      const sprite=G.openingScenery[G.state.mapId==='heartwood'?'heartwood':apple?'apple':'forest'];
      const behind=a=>a&&Math.abs(a.x-x)<24&&a.y<y&&a.y>y-44;
      c.save();if(behind(G.state.player)||(G.state.npcs||[]).some(behind))c.globalAlpha=Math.min(typeof c.globalAlpha==='number'?c.globalAlpha:1,.35);
      ellipse(c,x+3,y+2,18,5,'rgba(25,43,37,.23)');G.drawSprite(c,sprite,G.reducedMotion?0:Math.floor((G.state.time||0)*.55+seed)%4,x,y+3,false);c.restore();return;
    }
    ellipse(c,x+4,y+2,18,5,'rgba(25,43,37,.23)');
    poly(c,[[x-5,y],[x-3,y-19],[x+4,y-22],[x+5,y],[x+10,y+3],[x+2,y+2],[x-1,y-1],[x-8,y+3]],C.woodDark);
    rect(c,x-1,y-18,3,16,C.wood);rect(c,x-1,y-17,1,12,'#a27c55');
    const leaf=apple?['#3d5844','#5f7851','#849563','#abba7b']:['#2e4c40','#49694d','#65825a','#839765'];
    [[-9,-24,11,9],[6,-27,12,11],[-1,-34,12,9],[12,-21,9,7],[-10,-17,8,6],[1,-20,14,10]].forEach(([dx,dy,rx,ry],i)=>{
      ellipse(c,x+dx,y+dy,rx,ry,leaf[0]);ellipse(c,x+dx-1,y+dy-2,rx-1,ry-2,leaf[1]);
      rect(c,x+dx-5,y+dy-ry+1,7,3,leaf[2]);rect(c,x+dx-3,y+dy-ry+1,3,1,leaf[3]);
    });
    if(apple)for(let i=0;i<5;i++){
      const ax=x-12+rand(seed+i,17)*25,ay=y-32+rand(33,seed+i)*16;
      ellipse(c,Math.round(ax),Math.round(ay),2,2,C.rose);rect(c,ax,ay-1,1,1,'#e4ab87');
    }
  }
  function prop(c,kind,x,y,time,skipDelivery=false){
    if(!skipDelivery&&G.drawDeliveryProp&&G.drawDeliveryProp(c,kind,x,y,time))return;
    const props=(freshOrchard()||G.state.mapDef?.deliveryLandscape)&&G.openingScenery&&G.openingScenery.props;
    if(props){
      if(kind==='mill'){G.drawSprite(c,props.mill,0,x-2,y+4,false);const f=G.state.opening.sluice&&!G.reducedMotion?Math.floor(time*.65/(Math.PI/8))%8:0;G.drawSprite(c,props.wheel,f,x+30,y+11,false);return;}
      let id=kind,frame=0,ox=0,oy=3;
      if(kind==='arch')id=G.state.mapId==='heartwood'||G.state.opening.bell?'archOpen':'archClosed';
      if(kind==='sluice'){id=G.state.opening.sluice?'sluiceOpen':'sluiceClosed';oy=4;}
      if(kind==='cart'){ox=4;oy=7;}if(kind==='banner'){ox=7;oy=2;}if(kind==='sign')oy=2;
      if(kind==='camp'){oy=4;frame=G.reducedMotion?0:Math.floor(time*4)%4;}
      if(kind==='stump')oy=4;if(kind==='fence')ox=1;
      if(kind==='bell'&&!G.reducedMotion&&(G.state.openingBellT||0)>0)frame=Math.sin(time*10)>.25?1:Math.sin(time*10)<-.25?3:0;
      if(props[id]){G.drawSprite(c,props[id],frame,x+ox,y+oy,false);return;}
    }
    if(kind==='apple'){tree(c,x,y,x+y,true);return;}
    if(kind==='cart'){
      ellipse(c,x,y+3,23,6,'rgba(26,36,35,.3)');
      [x-15,x+14].forEach(wx=>{ellipse(c,wx,y,6,7,C.woodDark);ellipse(c,wx,y,4,5,C.wood);rect(c,wx,y-4,1,8,C.gold);rect(c,wx-4,y,8,1,C.gold);});
      rect(c,x-19,y-15,38,12,C.woodDark);rect(c,x-17,y-13,34,8,C.wood);
      for(let i=0;i<5;i++)rect(c,x-15+i*6,y-12,1,8,'#a5815e');
      poly(c,[[x-21,y-16],[x-16,y-35],[x+14,y-35],[x+21,y-16]],C.ink);
      poly(c,[[x-19,y-17],[x-14,y-33],[x+12,y-33],[x+18,y-17]],C.rose);
      poly(c,[[x-5,y-33],[x+2,y-33],[x+4,y-17],[x-6,y-17]],'#d5ac95');
      rect(c,x-15,y-17,30,2,'#e1b794');rect(c,x-10,y-12,9,7,C.paper);rect(c,x-7,y-12,2,7,C.rose);
      rect(c,x+16,y-3,16,2,C.woodDark);return;
    }
    if(kind==='mill'){
      ellipse(c,x+4,y+3,35,8,'rgba(26,36,35,.3)');
      rect(c,x-25,y-43,46,43,C.woodDark);rect(c,x-22,y-40,40,38,'#c9bda0');
      for(let i=0;i<4;i++)rect(c,x-21,y-36+i*9,38,1,'#a5977f');
      rect(c,x-23,y-42,3,42,C.wood);rect(c,x+17,y-42,3,42,C.wood);rect(c,x-4,y-40,3,37,C.wood);
      poly(c,[[x-32,y-43],[x-4,y-66],[x+29,y-43]],C.ink);poly(c,[[x-29,y-44],[x-4,y-63],[x+25,y-44]],C.rose);
      for(let i=0;i<4;i++)rect(c,x-21+i*5,y-47-i*4,38-i*10,1,'#c17b77');
      rect(c,x-29,y-44,54,3,'#e5b68f');rect(c,x+4,y-26,9,22,C.woodDark);rect(c,x+5,y-24,2,18,C.wood);
      rect(c,x-17,y-31,10,11,C.ink);rect(c,x-16,y-30,8,8,'#c3d7b7');rect(c,x-12,y-30,1,8,C.wood);rect(c,x-16,y-26,8,1,C.wood);
      const wx=x+30,wy=y-4,a=G.state.opening.sluice?time*.65:.15;
      c.save();c.translate(wx,wy);c.rotate(a);ellipse(c,0,0,15,15,C.woodDark);ellipse(c,0,0,11,11,C.water);
      for(let i=0;i<8;i++){c.save();c.rotate(i*Math.PI/4);rect(c,-1,-14,3,28,C.wood);rect(c,-4,-15,9,3,C.gold);c.restore();}ellipse(c,0,0,3,3,C.paper);c.restore();return;
    }
    if(kind==='bell'){
      rect(c,x-11,y-40,4,41,C.woodDark);rect(c,x+9,y-40,4,41,C.woodDark);rect(c,x-14,y-42,29,5,C.wood);rect(c,x-13,y-42,26,1,C.gold);
      const sway=Math.sin(time*10)*(G.state.openingBellT||0)*.09;
      c.save();c.translate(x,y-34);c.rotate(sway);rect(c,-1,-6,2,7,C.gold);poly(c,[[-6,0],[6,0],[8,12],[11,15],[-11,15],[-8,12]],C.woodDark);poly(c,[[-4,1],[4,1],[6,11],[8,13],[-8,13],[-6,11]],'#ba9060');rect(c,-4,3,2,9,C.paper);rect(c,-9,13,18,2,C.gold);rect(c,-1,15,3,4,C.gold);c.restore();
      rect(c,x+1,y-16,1,17,C.paper);return;
    }
    if(kind==='arch'){
      const open=G.state.mapId==='heartwood'||G.state.opening.bell;
      for(const dx of [-22,22]){poly(c,[[x+dx-6,y],[x+dx-3,y-36],[x+dx+5,y-39],[x+dx+7,y]],C.woodDark);rect(c,x+dx,y-32,2,30,C.wood);}
      c.strokeStyle=C.woodDark;c.lineWidth=10;c.beginPath();c.arc(x,y-24,25,Math.PI,0);c.stroke();
      c.strokeStyle='#856e4e';c.lineWidth=4;c.beginPath();c.arc(x-1,y-25,25,Math.PI+.1,-.1);c.stroke();
      for(let i=0;i<8;i++){const a=Math.PI+i*Math.PI/7;ellipse(c,x+Math.cos(a)*27,y-24+Math.sin(a)*27,7,4,i%2?C.shade:C.light);}
      if(!open){for(let i=0;i<4;i++)poly(c,[[x-18+i*9,y],[x-16+i*9,y-16-i%2*8],[x-12+i*9,y]],C.wood);}
      return;
    }
    if(kind==='sluice'){
      for(const dx of [-11,11])rect(c,x+dx,y-11,3,14,C.woodDark);
      if(!G.state.opening.sluice){rect(c,x-12,y-9,26,6,C.wood);rect(c,x-10,y-8,22,1,C.gold);}
      else rect(c,x-12,y-13,26,4,C.wood);
      return;
    }
    if(kind==='stump'){
      ellipse(c,x,y+1,11,4,C.dark);rect(c,x-8,y-9,16,10,C.woodDark);ellipse(c,x,y-10,9,4,C.wood);ellipse(c,x,y-11,6,2,C.gold);rect(c,x-3,y-11,7,1,C.wood);return;
    }
    if(kind==='fence'){
      rect(c,x-10,y-8,22,2,C.wood);rect(c,x-10,y-4,22,2,C.wood);
      for(const dx of [-10,10]){rect(c,x+dx,y-11,3,13,C.woodDark);rect(c,x+dx,y-11,2,1,C.gold);}return;
    }
    if(kind==='stone'){
      poly(c,[[x-8,y],[x-7,y-22],[x-2,y-29],[x+7,y-25],[x+9,y]],'#4b6058');poly(c,[[x-6,y-21],[x-2,y-27],[x+4,y-23],[x+3,y-3],[x-5,y-2]],'#99a38a');
      rect(c,x-1,y-19,1,9,C.paper);rect(c,x-4,y-16,7,1,C.paper);rect(c,x-8,y,17,2,C.shade);return;
    }
    if(kind==='camp'){
      ellipse(c,x,y,9,4,C.woodDark);for(let i=0;i<5;i++)rect(c,x-8+i*4,y+(i%2)*2,3,2,'#9fa48a');
      poly(c,[[x-5,y-2],[x-4,y-8],[x-1,y-5],[x+2,y-14],[x+5,y-4],[x+4,y]],C.rose);poly(c,[[x-2,y-2],[x,y-9],[x+3,y-3]],C.gold);rect(c,x,y-5,1,4,C.paper);return;
    }
    if(kind==='sign'||kind==='banner'){
      rect(c,x-1,y-22,3,23,C.woodDark);
      if(kind==='sign'){rect(c,x-10,y-23,23,16,C.wood);rect(c,x-8,y-21,19,12,C.paper);for(let i=0;i<3;i++)rect(c,x-5,y-18+i*3,12-i*2,1,C.wood);}
      else {poly(c,[[x+2,y-25],[x+15,y-23],[x+13,y-9],[x+7,y-13],[x+1,y-11]],C.rose);rect(c,x+7,y-21,2,7,C.paper);}return;
    }
  }
  G.drawOpeningProp=prop;
  G.drawOpeningGround=(c,cam,time)=>{
    if(!here())return;
    if(G.state.mapId==='orchardRoad'){
      const props=G.openingScenery&&G.openingScenery.props;
      if(G.state.opening.sluice){for(let x=27*16;x<=35*16;x+=6){if(props)G.drawSprite(c,props.bridgePlank,0,x+3,24*16+16,false);else{rect(c,x,24*16,5,15,C.wood);rect(c,x,24*16,5,1,C.gold);}}}
      else {
        const x=30*16,y=24*16;
        c.save();if(G.smallPassageAt(G.state.player.x,G.state.player.y))c.globalAlpha=.35;
        if(props)G.drawSprite(c,props.rootGate,0,x+8,y+14,false);
        else for(let i=0;i<4;i++)poly(c,[[x-24,y+13],[x+i*9,y-17],[x+13+i*9,y+14]],C.woodDark);
        c.restore();
        // The dark floor and stone rims show the actual Rat corridor.
        rect(c,29*16,y+3,4*16,10,C.ink);rect(c,29*16,y+1,4*16,2,'#9fa48a');rect(c,29*16,y+13,4*16,2,C.woodDark);
        if(props)G.drawSprite(c,props.culvert,0,27*16+16,y+14,false);
        else ellipse(c,27*16+16,24*16+6,7,8,C.ink);
      }
      // Dam apron, millrace foam, and a sunlit scattering of fallen apples.
      for(let i=0;i<15;i++){const x=35*16+rand(i,14)*110,y=27*16+rand(i,71)*55;if(G.world.cellAt(x,y).tile==='water')rect(c,x,y,4,1,'#a0c1ac');}
    }else if(G.state.mapId==='heartwood'){
      c.save();c.strokeStyle='#839575';c.globalAlpha=.22;c.lineWidth=1;
      for(const radius of [43,65,88]){c.beginPath();c.ellipse(16*16+8,13*16,radius,radius*.64,0,0,Math.PI*2);c.stroke();}c.restore();
    }
  };
  G.openingDrawables=c=>{
    if(!here())return [];
    const s=G.state,time=s.time,list=[];
    for(const [kind,tx,ty]of s.mapDef.openingProps||[]){
      const x=tx*16+8,y=ty*16+8;list.push({y,fn:()=>prop(c,kind,x,y,time)});
    }
    // Larger edge trees break up the small collision tiles; their trunks sit
    // inside solid forest, while a nearby player fades the overhanging crown.
    for(let y=2;y<s.mapH-2;y+=3)for(let x=2;x<s.mapW-2;x+=3){
      if(s.grid[y][x].tile!=='tree')continue;
      const edge=[[0,1],[1,0],[0,-1],[-1,0]].some(([dx,dy])=>s.grid[y+dy][x+dx].tile!=='tree');
      if(!edge)continue;
      const px=x*16+8,py=y*16+8;
      list.push({y:py,fn:()=>{c.save();if(Math.abs(s.player.x-px)<24&&s.player.y<py&&s.player.y>py-43)c.globalAlpha=.32;tree(c,px,py,x+y,false);c.restore();}});
    }
    const dummy=s.enemies.find(e=>e.def.practice);
    if(dummy)list.push({y:dummy.y,fn:()=>{const x=dummy.x,y=dummy.y;if(freshOrchard()&&G.openingScenery?.props){G.drawSprite(c,G.openingScenery.props.practice,0,x,y+3,false);return;}rect(c,x-2,y-23,4,24,C.wood);rect(c,x-13,y-18,26,3,C.woodDark);ellipse(c,x,y-20,7,8,C.woodDark);ellipse(c,x,y-21,6,6,C.gold);rect(c,x-4,y-23,2,2,C.woodDark);rect(c,x+2,y-23,2,2,C.woodDark);rect(c,x-2,y-19,5,1,C.woodDark);}});
    return list;
  };
  G.drawOpeningAtmosphere=(c,cam)=>{
    if(!here())return;
    const time=G.state.time;
    c.save();
    // Broad, low-opacity shafts leave enemy silhouettes and ground tells clear.
    c.globalAlpha=.07;
    for(let i=0;i<3;i++)poly(c,[[cam.x+i*120+20,cam.y],[cam.x+i*120+52,cam.y],[cam.x+i*120-15,cam.y+180],[cam.x+i*120-66,cam.y+180]],'#fff0c4');
    c.globalAlpha=.65;
    for(let i=0;i<13;i++){
      const x=cam.x+(i*83+time*3)%330,y=cam.y+(i*47+Math.sin(time*.6+i)*8)%180;
      rect(c,x,y,i%3?1:2,1,i%3?C.paper:C.gold);
    }
    c.restore();
  };
  G.drawOpeningHazards=c=>{
    if(!here())return;
    for(const h of G.state.openingHazards||[]){
      if(G.drawDeliveryHazard&&G.drawDeliveryHazard(c,h))continue;
      const active=h.t>=h.warn;
      c.save();c.strokeStyle=active?'#f5dba0':'#eec780';c.fillStyle=active?'rgba(111, 60, 40, .8)':'rgba(224,174,101,.16)';c.lineWidth=active?3:1;
      if(h.kind==='roots'){
        ellipse(c,h.x,h.y,h.radius,h.radius,active?'#745749':'rgba(222,183,112,.2)');
        c.beginPath();c.arc(h.x,h.y,h.radius,0,Math.PI*2);c.stroke();
        if(active)for(let i=0;i<5;i++)poly(c,[[h.x-13+i*6,h.y+4],[h.x-10+i*6,h.y-14-(i%2)*7],[h.x-6+i*6,h.y+4]],i%2?C.wood:C.gold);
        else{c.beginPath();c.arc(h.x,h.y,h.radius*Math.min(1,h.t/h.warn),0,Math.PI*2);c.stroke();}
      }else{
        c.translate(h.x,h.y);c.rotate(Math.atan2(h.dy,h.dx));
        rect(c,0,-h.width,h.length,h.width*2,active?'#866347':'rgba(222,183,112,.18)');
        rect(c,0,-h.width,h.length,1,C.gold);rect(c,0,h.width,h.length,1,C.gold);
        if(active)for(let x=0;x<h.length;x+=14)poly(c,[[x,-h.width],[x+5,-h.width-8],[x+13,h.width],[x+6,h.width+5]],C.woodDark);
        else for(let x=0;x<h.length;x+=18)rect(c,x,0,9,1,C.paper);
      }
      c.restore();
    }
    for(const e of G.state.enemies){
      if(e.openingMode==='windup'&&!e.dead){const a=e.openingAim;c.save();c.translate(e.x,e.y-4);c.rotate(Math.atan2(a.y,a.x));rect(c,5,-7,38,14,'rgba(242,207,139,.17)');rect(c,5,-7,38,1,C.gold);rect(c,5,7,38,1,C.gold);c.restore();}
    }
  };
  G.drawOpeningPrompt=(c,cam)=>{
    if(G.ui.dialogueOpen||G.ui.menuOpen||G.state.bossCutscene)return false;
    const at=G.openingInteractionCandidate();if(!at)return;
    const prefix=G.input.isTouch?'A · ':G.input.hasGamepad?'A · ':'J / E · ';
    const label=prefix+at.label;
    c.save();c.font=G.text.font(9, 700);const w=c.measureText(label).width+16;
    const x=(G.W-w)/2,p=G.state.player;let y=136;
    if(cam&&p){const px=p.x-cam.x,py=p.y-cam.y;if(px+12>x&&px-12<x+w&&py+4>y&&py-24<y+16)y=Math.max(45,Math.min(117,Math.floor(py-40)));}
    rect(c,x,y,w,16,'rgba(32,45,50,.94)');rect(c,x,y,2,16,C.gold);
    c.fillStyle=C.paper;c.textBaseline='top';G.drawWorldText(c,label,x+8,y+4);c.restore();return true;
  };
})();

// Field UI: one objective, small meters, and physical-looking ability tokens.
// The same drawing is used on keyboard, controller, and touch screens.
(() => {
  const here=()=>G.state&&G.state.mapDef&&G.state.mapDef.openingLandscape;
  function text(c,label,x,y,color='#f0dfb2',size=9){c.font=G.text.font(size);c.fillStyle=color;G.drawWorldText(c,label,x,y);}
  function panel(c,x,y,w,h){c.fillStyle='rgba(30,44,44,.88)';c.fillRect(x,y,w,h);c.fillStyle='#ac9566';c.fillRect(x,y,1,h);}
  G.drawOpeningHud=(c,cam)=>{
    if(!here())return false;
    const s=G.state,p=s.player,form=G.playerForm();
    c.save();c.textBaseline='top';
    const hp=G.playerHp(),max=G.playerMaxHearts();
    const level=' · '+G.formLevel(form.id);let name=form.name;
    c.font=G.text.font(7, 700);
    const identityWidth=Math.max(64,max*7+10,Math.min(88,Math.ceil(c.measureText(name+level).width)+10));
    while(name.length>1&&c.measureText(name+level).width>identityWidth-10)name=name.slice(0,-1);
    if(name!==form.name)name=name.slice(0,-1)+'…';
    panel(c,6,6,identityWidth,27);
    for(let i=0;i<max;i++){
      c.fillStyle=i<hp?'#db8e8c':'#51605c';const x=11+i*7;
      c.fillRect(x,10,2,3);c.fillRect(x+3,10,2,3);c.fillRect(x+1,12,3,3);c.fillRect(x+2,15,1,1);
    }
    c.fillStyle='#344b54';c.fillRect(11,20,51,2);c.fillStyle='#85c0bb';c.fillRect(11,20,51*p.mana/p.manaMax,2);
    text(c,name+level,11,25,'#e4dbbc',7);
    const boss=s.enemies.find(e=>!e.dead&&e.def.miniboss&&e.bossEngaged);
    if(boss){
      panel(c,100,6,146,23);text(c,boss.def.name,107,9,'#e9d39f',9);
      c.fillStyle='#40574a';c.fillRect(107,21,131,3);c.fillStyle='#bdc77d';c.fillRect(107,21,131*Math.max(0,boss.hp/boss.def.hp),3);
      if(boss.ward&&boss.ward.hp>0)text(c,boss.id==='ancientTreant'?'BARK WARD · BLUNT':'WARD · '+boss.ward.types.join(' / ').toUpperCase(),107,29,'#f0cf89',8);
    }else if(!G.ui.dialogueOpen&&!(G.nearGroundReward&&G.nearGroundReward())){
      const opening=G.openingGoal(),goal=opening||(s.delivery?.complete&&G.currentTask?G.currentTask():null);
      if(goal){
        const x=100,y=6,w=G.W-x-(G.input.isTouch?68:6);
        c.font=G.text.font(9,700);
        const words=goal.short.split(/\s+/),lines=[];let line='';
        for(const word of words){const next=line?line+' '+word:word;if(line&&c.measureText(next).width>w-12){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);
        panel(c,x,y,w,15+lines.length*11);
        text(c,goal.kind==='request'?goal.label:opening?'PARCEL’S DELIVERY':'NEXT STEP',x+6,y+3,'#f4e5bc',7);
        lines.forEach((line,i)=>text(c,line,x+6,y+14+i*11,'#f3e4bd',9));
      }else{
        text(c,s.mapDef.deliveryLandscape?'SUNRISE, TOGETHER':'THE FIRST PROMISE',102,8,'#f4e5bc',7);
        text(c,s.mapDef.deliveryLandscape?'A place to return to':'The road is open',102,20,'#d2dda8',9);
      }
    }
    if(!boss&&!G.ui.dialogueOpen&&!s.bossCutscene&&G.fieldMasteryReward){
      const lesson=G.fieldMasteryReward();
      if(lesson&&G.ui.fieldQuiet?.()&&G.systemIntroduced('forms')&&!(G.nearGroundReward&&G.nearGroundReward())){
        c.font=G.text.font(8,700);
        const x=7,y=72,w=128,lines=[];let line='';
        for(const word of lesson.quest.text.split(/\s+/)){const next=line?line+' '+word:word;if(line&&c.measureText(next).width>w-10){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);
        c.font=G.text.font(7);const rewardLines=[];let rewardLine='';
        for(const word of lesson.reward.split(/\s+/)){const next=rewardLine?rewardLine+' '+word:word;if(rewardLine&&c.measureText(next).width>w-10){rewardLines.push(rewardLine);rewardLine=word;}else rewardLine=next;}if(rewardLine)rewardLines.push(rewardLine);
        const h=16+lines.length*10+rewardLines.length*9;
        if(!G.ui.fieldPanelBlocked?.(cam,x,y,w,h)){
          panel(c,x,y,w,h);lines.forEach((line,i)=>text(c,line,x+5,y+3+i*10,'#ece0bf',8));
          text(c,lesson.progress+'/'+lesson.total+' · MASTERY',x+5,y+4+lines.length*10,'#edc988',7);
          rewardLines.forEach((line,i)=>text(c,line,x+5,y+14+lines.length*10+i*9,'#b4c5a3',7));
        }

      }
    }
    // Keep the lower corners free for the touch joystick and ability buttons.
    if(!G.input.isTouch&&!G.ui.dialogueOpen&&!s.bossCutscene){
      const loadout=G.getLoadout(s.formId),keys=G.input.hasGamepad?['A','X','Y']:['J','K','L'];
      for(let i=0;i<3;i++){
        const ab=G.abilities[loadout[i]],x=7+i*62;
        panel(c,x,157,58,17);text(c,keys[i],x+5,161,'#edcf89',9);
        text(c,ab?ab.name:'—',x+15,162,'#f0e4c9',7);
        if(ab){const cd=p.cooldowns[ab.id]||0,duration=G.cooldownDuration?G.cooldownDuration(ab):ab.cooldown;c.fillStyle='#9cae86';c.fillRect(x+3,173,52*(1-Math.min(1,cd/duration)),1);}
      }
      if(G.systemIntroduced('forms'))text(c,(G.input.hasGamepad?'B  FORMS':'Q  FORMS')+(G.systemIntroduced('mix')?(G.input.hasGamepad?'   R3 MIX':'   F MIX'):''),205,163,'#f0dfb2',8);
    }
    if(!G.ui.dialogueOpen)G.drawOpeningPrompt(c,cam);
    c.restore();return {status:{x:6,y:6,w:identityWidth,h:27},
      boss:boss?{x:100,y:6,w:146,h:boss.ward&&boss.ward.hp>0?31:23}:null};
  };
  G.drawOpeningDialogue=(c,d,wrap)=>{
    if(!here())return false;
    c.save();c.textBaseline='top';
    const speaker=d.speaker.toUpperCase();
    c.font=G.text.font(11, 700);
    const lines=wrap(c,d.text,235),visible=wrap(c,d.text.slice(0,Math.floor(d.shown)),235);
    const h=Math.max(55,32+lines.length*13)+(d.offerActive?28:0),y=174-h;
    c.fillStyle='rgba(24,34,35,.24)';c.fillRect(0,0,320,180);
    // Offset paper edges, folded corners and a wax seal form a dialogue object.
    c.fillStyle='rgba(20,30,30,.5)';c.fillRect(10,y+4,303,h);
    c.fillStyle='#a68e66';c.fillRect(7,y,305,h);c.fillStyle='#eedfbb';c.fillRect(9,y+2,301,h-4);
    c.fillStyle='#e1cda4';c.fillRect(9,y+2,48,h-4);c.fillStyle='#c1aa7d';c.fillRect(56,y+7,1,h-14);
    c.fillStyle='#f8edcd';c.beginPath();c.moveTo(297,y+2);c.lineTo(310,y+2);c.lineTo(310,y+14);c.closePath();c.fill();
    c.save();c.beginPath();c.rect(10,y+3,46,h-7);c.clip();
    G.drawDialoguePortrait(c,d.speaker,13,y+9,39);c.restore();
    text(c,speaker.length>35?speaker.slice(0,34)+'…':speaker,65,y+7,'#65464a',8);
    c.font=G.text.font(11, 700);c.fillStyle='#354841';
    visible.forEach((line,i)=>G.drawWorldText(c,line,65,y+20+i*13));
    if(d.offerActive)G.ui.drawDialogueChoices(c,d,65,y+h-29,235,true);
    else if(d.shown>=d.text.length){
      const prompt=G.input.isTouch?'TAP TO CONTINUE':G.input.hasGamepad?'A · CONTINUE':'SPACE · CONTINUE';
      c.font=G.text.font(6, 700);c.fillStyle='#7f7056';G.drawWorldText(c,prompt,303-c.measureText(prompt).width,y+h-9);
    }
    c.restore();return true;
  };
})();
