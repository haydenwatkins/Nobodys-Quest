/* Rain gives way to lamplight. All effects respect the existing 2D camera. */
"use strict";
(() => {
  const C={ink:'#26333d',dark:'#364954',water:'#476c77',stone:'#8a9694',light:'#b4b8a7',gold:'#d7ab6c',paper:'#f3deb2',wood:'#785c54',rose:'#ac7271',green:'#718470'};
  const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);};
  const oval=(c,x,y,rx,ry,color)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
  function poly(c,p,color){c.fillStyle=color;c.beginPath();p.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
  const d=()=>G.state.delivery||G.makeDelivery();
  const here=()=>G.state&&G.state.mapDef&&G.state.mapDef.deliveryLandscape;
  function glow(c,x,y,r=21){oval(c,x,y,r,r*.55,'rgba(247,206,126,.07)');oval(c,x,y,r*.65,r*.4,'rgba(247,206,126,.09)');}
  function lamp(c,x,y,on,t){
    if(on)glow(c,x,y-12,26);
    rect(c,x-1,y-29,3,31,C.ink);poly(c,[[x-7,y-28],[x+6,y-28],[x+4,y-15],[x-5,y-15]],C.ink);
    rect(c,x-4,y-26,7,9,on?'#e6bb74':'#536772');if(on){rect(c,x-2,y-25,3,7,C.paper);rect(c,x-2,y-25,1,7,'#fff0cd');}
    rect(c,x-7,y-29,13,2,C.gold);rect(c,x-5,y-16,9,2,C.gold);rect(c,x-1,y-27,1,12,C.wood);
    if(on&&!G.reducedMotion)rect(c,x+Math.sin(t*2)*3,y-34-(t*5%7),1,1,C.paper);
  }
  G.drawDeliveryProp=(c,kind,x,y,t)=>{
    const s=G.state,p=d(),quay=s.mapId==='sunriseQuay';
    if(kind==='departure'){if(s.opening.complete){lamp(c,x,y,true,t);rect(c,x-18,y-23,37,10,C.wood);rect(c,x-16,y-22,32,7,C.paper);rect(c,x-11,y-19,21,1,C.wood);poly(c,[[x+10,y-21],[x+14,y-19],[x+10,y-17]],C.wood);}return true;}
    if(!here())return false;
    if(kind==='cart'&&s.mapId==='lanternReach'&&p.lamps[0]===2&&x===120)return true;
    if(kind==='lantern'){
      const on=quay?p.parcels.length>0:s.mapId==='tollCourt'?true:p.lamps[x<400?0:1]>0;lamp(c,x,y,on,t);return true;
    }
    if(kind==='rainGate'||kind==='tollArch'){
      const open=kind==='tollArch'?p.keeper:p.lamps[x<500?0:1]===2;
      for(const dy of [-22,22]){rect(c,x-4,y+dy-12,8,14,C.dark);rect(c,x-3,y+dy-12,6,3,C.light);}
      if(!open){c.save();c.strokeStyle=C.gold;c.lineWidth=2;c.beginPath();c.moveTo(x,y-21);c.quadraticCurveTo(x-7,y,x,y+21);c.stroke();c.restore();rect(c,x-3,y-4,6,8,C.wood);rect(c,x-1,y-2,2,3,C.gold);}
      return true;
    }
    if(kind==='willow'){
      oval(c,x,y+2,21,5,'rgba(25,36,43,.24)');poly(c,[[x-4,y],[x-3,y-28],[x+5,y-28],[x+3,y],[x+9,y+2]],C.wood);
      rect(c,x-2,y-25,2,23,'#a08060');
      for(const [i,[dx,dy]]of [[-16,-29],[-5,-39],[9,-37],[18,-27],[-5,-26],[8,-24]].entries()){
        const yy=y+dy;poly(c,[[x+dx-12,yy],[x+dx-9,yy-7],[x+dx-2,yy-11],[x+dx+6,yy-8],[x+dx+13,yy],[x+dx+8,yy+7],[x+dx-8,yy+8]],'#39564e');
        poly(c,[[x+dx-10,yy],[x+dx-6,yy-6],[x+dx+2,yy-8],[x+dx+10,yy-1],[x+dx+6,yy+4],[x+dx-7,yy+5]],i%2?'#607e67':'#6b876b');
        rect(c,x+dx-6,yy-5,6,2,'#90a47d');rect(c,x+dx+2,yy-3,4,2,'#839b77');
        const shift=G.reducedMotion?0:Math.round(Math.sin(t*.8+i));for(let j=0;j<3;j++){rect(c,x+dx+j*3+shift,yy+2,2,13+(i%3)*3,'#6d8c78');rect(c,x+dx+j*3+shift,yy+4,1,5,'#a0ac83');}}
      return true;
    }
    if(kind==='reed'){for(let i=0;i<6;i++){const xx=x-9+i*4;rect(c,xx,y-8-i%3*3,1,10+i%3*3,C.green);rect(c,xx-1,y-12-i%3*3,3,5,'#987c64');}return true;}
    if(kind==='wreck'||kind==='boat'){
      oval(c,x,y+2,24,4,'rgba(29,48,58,.24)');poly(c,[[x-27,y-9],[x+23,y-9],[x+15,y+2],[x-16,y+2]],C.ink);poly(c,[[x-23,y-8],[x+19,y-8],[x+13,y],[x-14,y]],C.wood);rect(c,x-13,y-7,26,1,C.gold);
      for(let i=0;i<3;i++)rect(c,x-13+i*11,y-8,3,6,C.dark);rect(c,x+7,y-22,2,18,C.wood);if(kind==='boat')poly(c,[[x+9,y-21],[x+23,y-10],[x+9,y-10]],C.paper);return true;
    }
    if(kind==='drain'){oval(c,x,y-1,8,6,C.ink);for(let i=0;i<3;i++)rect(c,x-5+i*5,y-6,1,11,C.stone);return true;}
    if(kind==='satchel'){if(!p.salvage){rect(c,x-5,y-7,10,7,C.wood);rect(c,x-4,y-7,8,3,C.paper);rect(c,x,y-7,1,7,C.rose);}return true;}
    if(kind==='milepost'||kind==='ledger'){
      rect(c,x-2,y-17,4,19,C.wood);rect(c,x-10,y-24,21,13,C.ink);rect(c,x-9,y-23,19,11,C.paper);
      for(let i=0;i<3;i++)rect(c,x-6,y-20+i*3,12-i*2,1,C.wood);return true;
    }
    if(['bakery','letterHouse','birthdayHouse'].includes(kind)){
      const delivered=p.parcels.includes({bakery:'bread',letterHouse:'letter',birthdayHouse:'present'}[kind]);
      oval(c,x+3,y+2,30,7,'rgba(29,42,44,.22)');rect(c,x-23,y-38,46,39,C.wood);rect(c,x-21,y-36,42,35,kind==='letterHouse'?'#9eabb0':'#c5b397');
      for(let i=0;i<4;i++){rect(c,x-20,y-33+i*9,40,1,'#a69581');for(let j=0;j<4;j++)rect(c,x-18+j*10+(i%2)*3,y-33+i*9,1,8,'#b4a48c');}
      for(const dx of [-22,20])rect(c,x+dx,y-37,3,38,C.wood);
      poly(c,[[x-31,y-38],[x-3,y-63],[x+31,y-38]],C.ink);poly(c,[[x-28,y-39],[x-3,y-59],[x+27,y-39]],kind==='letterHouse'?'#576b7d':C.rose);
      for(let i=0;i<4;i++){rect(c,x-21+i*6,y-41-i*4,42-i*12,1,kind==='letterHouse'?'#84979e':'#d09686');for(let j=0;j<6-i;j++)rect(c,x-20+i*5+j*7,y-43-i*4,1,3,kind==='letterHouse'?'#455f72':'#916068');}rect(c,x-29,y-40,57,3,C.gold);
      rect(c,x-19,y-26,11,12,C.ink);rect(c,x-18,y-25,9,9,delivered?'#f1cf86':'#526a73');rect(c,x-14,y-25,1,10,C.wood);rect(c,x-18,y-21,9,1,C.wood);
      rect(c,x+4,y-23,12,24,C.wood);rect(c,x+5,y-22,10,21,kind==='letterHouse'?'#477886':'#705554');rect(c,x+12,y-10,1,2,C.gold);rect(c,x+2,y,16,3,C.stone);
      if(delivered)glow(c,x-13,y-17,24);
      if(kind==='bakery'){
        rect(c,x+13,y-60,7,17,C.wood);rect(c,x+12,y-61,9,3,C.stone);
        if(delivered)for(let i=0;i<4;i++){const age=(t*.3+i*.25)%1;oval(c,x+16+age*8,y-64-age*22,3+age*5,3+age*3,'rgba(230,217,193,'+(1-age)*.22+')');}
        rect(c,x-25,y-3,20,7,C.wood);if(delivered)for(let i=0;i<3;i++){oval(c,x-21+i*6,y-5,3,2,C.gold);rect(c,x-22+i*6,y-6,2,1,C.paper);}
      }
      if(kind==='letterHouse'){rect(c,x+21,y+5,9,3,C.wood);rect(c,x+22,y+8,2,4,C.wood);oval(c,x+23,y+3,2,2,C.paper);if(delivered)oval(c,x+28,y+3,2,2,C.paper);}
      if(kind==='birthdayHouse'&&delivered){
        const xx=x-15+(G.reducedMotion?0:Math.sin(t)*5);rect(c,xx,y+13,10,4,'#739280');poly(c,[[xx+2,y+13],[xx+3,y+7],[xx+7,y+13]],'#9aaf83');rect(c,xx+9,y+10,4,4,'#739280');oval(c,xx+2,y+18,2,2,C.wood);oval(c,xx+9,y+18,2,2,C.wood);
      }
      return true;
    }
    if(kind==='well'){
      oval(c,x,y,13,6,C.dark);rect(c,x-13,y-8,26,9,C.stone);oval(c,x,y-8,13,5,C.light);oval(c,x,y-8,9,3,C.dark);
      rect(c,x-14,y-29,3,26,C.wood);rect(c,x+12,y-29,3,26,C.wood);rect(c,x-16,y-30,32,3,C.wood);rect(c,x,y-28,1,20,C.gold);return true;
    }
    if(kind==='bunting'){
      c.strokeStyle=C.wood;c.lineWidth=1;c.beginPath();c.moveTo(x-52,y-22);c.quadraticCurveTo(x,y-9,x+52,y-22);c.stroke();
      for(let i=0;i<9;i++){const xx=x-45+i*11,yy=y-21+Math.sin(i/8*Math.PI)*6;poly(c,[[xx,yy],[xx+7,yy+1],[xx+3,yy+8]],i%3===0?C.gold:i%3===1?C.rose:C.green);}return true;
    }
    if(kind==='flowerbed'){rect(c,x-10,y-2,22,5,C.wood);for(let i=0;i<7;i++){rect(c,x-8+i*3,y-8+i%2,1,6,C.green);rect(c,x-9+i*3,y-9+i%2,3,3,i%2?C.rose:C.gold);}return true;}
    if(kind==='bench'){rect(c,x-9,y-4,21,3,C.wood);rect(c,x-10,y-12,23,5,C.wood);rect(c,x-8,y-8,2,11,C.dark);rect(c,x+9,y-8,2,11,C.dark);return true;}
    return false;
  };
  const oldTile=G.drawOpeningTile;
  G.drawOpeningTile=(c,cell,x,y,t)=>{
    if(!here()||G.state.mapId==='sunriseQuay')return oldTile(c,cell,x,y,t);
    const px=x*16,py=y*16,r=G.util.hash2(x+7,y+11);
    if(cell.tile==='water'){
      rect(c,px,py,16,16,r>.6?'#416773':'#456b76');for(let i=0;i<2;i++)rect(c,px+(r*9+i*4)%12,py+4+i*7,4,1,'#658790');return true;
    }
    if(cell.tile==='path'){
      rect(c,px,py,16,16,'#899893');
      for(let i=0;i<3;i++){const yy=py+i*5,offset=((x+y+i)%3)*3;rect(c,px,yy,16,1,'#778983');rect(c,px+offset,yy,1,5,'#778983');rect(c,px+offset+1,yy+1,Math.min(8,15-offset),1,'#9fa9a0');}
      if(r>.78){rect(c,px+3,py+7,8,2,'#78969a');rect(c,px+4,py+7,4,1,'#a5b7b2');}
      else if(r<.2){rect(c,px+2,py+3,3,1,'#637d71');rect(c,px+12,py+12,2,1,'#657e72');}return true;
    }
    rect(c,px,py,16,16,r>.5?'#61786e':'#5d746b');if(r>.25){const xx=px+3+r*7,yy=py+3+r*5;rect(c,xx,yy,1,4,'#8aa18a');rect(c,xx+2,yy+2,1,3,'#8aa18a');rect(c,xx-2,yy+3,1,2,'#47685c');}
    if(r>.9){rect(c,px+10,py+7,1,4,C.green);rect(c,px+9,py+6,3,2,'#b6b7a0');}return true;
  };
  G.drawDeliveryHazard=(c,h)=>{
    if(!here())return false;const active=h.t>=h.warn;
    c.save();
    if(h.kind==='flood'){
      // evenodd leaves the actual safe area clear, not merely a decorative ring.
      c.fillStyle=active?'rgba(75,135,160,.48)':'rgba(63,102,123,.19)';c.beginPath();c.rect(0,0,G.state.mapW*16,G.state.mapH*16);c.arc(h.x,h.y,h.radius,0,Math.PI*2);c.fill('evenodd');
      c.strokeStyle=C.paper;c.lineWidth=2;c.beginPath();c.arc(h.x,h.y,h.radius,0,Math.PI*2);c.stroke();
      c.strokeStyle=C.gold;c.lineWidth=1;c.beginPath();c.arc(h.x,h.y,h.radius+5,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(1,h.t/h.warn));c.stroke();
      c.font="8px 'VT323', monospace";c.textAlign='center';c.fillStyle=C.paper;c.fillText(active?'DRY GROUND':'SHELTER IN THE LIGHT',h.x,h.y+32);
    }else{
      c.translate(h.x,h.y);c.rotate(Math.atan2(h.dy,h.dx));rect(c,0,-h.width,h.length,h.width*2,active?'rgba(229,188,114,.68)':'rgba(229,188,114,.16)');
      rect(c,0,-h.width,h.length,1,C.gold);rect(c,0,h.width,h.length,1,C.gold);for(let i=8;i<h.length;i+=16)rect(c,i,-1,6,2,active?C.paper:C.gold);
    }
    c.restore();return true;
  };
  const oldAir=G.drawOpeningAtmosphere,oldDrawables=G.openingDrawables;
  G.drawOpeningAtmosphere=(c,cam)=>{
    if(!here())return oldAir(c,cam);
    const t=G.reducedMotion?0:G.state.time,p=d(),quay=G.state.mapId==='sunriseQuay';c.save();
    if(!quay&&!p.keeper){
      c.strokeStyle='rgba(200,219,218,.22)';c.lineWidth=.65;c.beginPath();for(let i=0;i<55;i++){const x=cam.x+((i*73-t*28)%340+340)%340,y=cam.y+(i*47+t*100)%200;c.moveTo(x,y);c.lineTo(x-3,y+7);}c.stroke();
    }else{
      c.globalAlpha=.04;for(let i=0;i<3;i++)poly(c,[[cam.x+i*135,cam.y],[cam.x+i*135+28,cam.y],[cam.x+i*135-40,cam.y+180],[cam.x+i*135-80,cam.y+180]],C.paper);
    }
    c.restore();
  };
  G.openingDrawables=c=>{
    const list=oldDrawables(c);if(G.state.mapId==='orchardRoad'&&G.state.opening.complete)list.push({y:37*16+8,fn:()=>G.drawDeliveryProp(c,'departure',26*16+8,37*16+8,G.state.time)});
    if(!here())return list;const s=G.state,p=d();
    // Parcel's cart advances only after safety is established, without a timer.
    if(s.mapId==='lanternReach'&&p.lamps[0]===2){
      // The original cart prop is suppressed by the shared prop hook below.
      const [tx,ty]=p.lamps[1]===2?[52,19]:[29,17];list.push({y:ty*16+8,fn:()=>G.drawOpeningProp(c,'cart',tx*16+8,ty*16+8,s.time,true)});
    }
    if(s.mapId==='sunriseQuay'&&p.keeper&&!p.complete){
      for(const [id,x,y]of [['bread',12,12],['letter',30,13],['present',28,26]])if(!p.parcels.includes(id))list.push({y:y*16+9,fn:()=>{
        const yy=y*16-25+(G.reducedMotion?0:Math.sin(s.time*2)*2);rect(c,x*16+3,yy,10,7,C.paper);rect(c,x*16+7,yy,1,7,C.rose);rect(c,x*16+3,yy+3,10,1,C.rose);
      }});
    }
    return list;
  };
})();
