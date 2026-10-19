/* Rebuilt stone restores feet, never damage immunity or projectile cover. */
"use strict";
(() => {
 const sites=new WeakMap();let present=[];
 const propLive=G.guardianPropLive;G.guardianPropLive=e=>propLive(e)&&(!e.atlasFault||G.state.bossHazards.includes(e.atlasFault)&&!e.atlasFault.cancelled);
 const update=G.updateOpening;G.updateOpening=dt=>{update(dt);present=present.filter(live);for(const s of present)for(const h of fields(s))if(h.departures)h.departures=h.departures.filter(d=>departing(d,h));};
 const inside=(b,x,y)=>x>=b.left&&x<=b.right&&y>=b.top&&y<=b.bottom;
 const live=s=>s&&!s.owner.dead&&!G.state.knockout&&(s.map??s.mapId)===G.state.mapId&&G.state.enemies.includes(s.owner);
 const fields=s=>(G.state.bossHazards||[]).filter(h=>h.owner===s.owner&&h.kind==='atlasFault'&&!h.cancelled&&h.phase===s.owner.bossPhase);
 G.atlasGapBlocked=(x,y)=>present.some(s=>live(s)&&!s.bridges.some(b=>inside(b,x,y))&&fields(s).some(h=>!h.departures?.some(d=>departing(d,h)&&inside(d,x,y))&&h.gaps.some(g=>g.open&&inside(g,x,y))));
 function clear(x,y){return G.world.isSafeSpawn(x,y)&&!G.world.cellAt(x,y).portal;}
 function site(owner,p){let s=sites.get(owner);if(live(s))return s;
  const midpoint={x:(owner.x+p.x)/2,y:(owner.y+p.y)/2};
  for(const [dx,dy] of [[0,0],[-32,0],[32,0],[0,32],[0,-32],[-64,0],[64,0]]){
   const x=midpoint.x+dx,y=midpoint.y+dy;
   if(!Array.from({length:13},(_,i)=>i*8-48).every(a=>Array.from({length:13},(_,i)=>i*8-48).every(b=>clear(x+a,y+b))))continue;
   s={owner,map:G.state.mapId,x,y,bridges:[]};sites.set(owner,s);present.push(s);return s;
  }return null;
 }
 G.prepareAtlasCourt=(owner,p)=>{if(owner.def.id==='lastWorldbearer')site(owner,p);};
 function paintStone(c,e){c.save();c.fillStyle='#4c4543';c.fillRect(e.x-8,e.y-5,16,7);c.fillStyle='#dfbb80';c.beginPath();c.moveTo(e.x-8,e.y-5);c.lineTo(e.x-5,e.y-13);c.lineTo(e.x+5,e.y-15);c.lineTo(e.x+8,e.y-5);c.closePath();c.fill();c.strokeStyle='#fff3c2';c.lineWidth=1;c.stroke();c.fillStyle='#7dbc70';c.fillRect(e.x-2,e.y-18,3,4);c.restore();}
 const bridgeAt=(s,vertical,at)=>vertical?{left:s.x-14,right:s.x+14,top:at.y-24,bottom:at.y+24}:{left:at.x-24,right:at.x+24,top:s.y-14,bottom:s.y+14};
 const restored=(s,b)=>[[b.left,b.top],[b.right,b.top],[b.left,b.bottom],[b.right,b.bottom]].every(([x,y])=>s.bridges.some(old=>inside(old,x,y)));
 function rebuild(s,h,at){if(!live(s)||!fields(s).includes(h)||h.rebuilt)return;h.rebuilt=true;
  const bridge=bridgeAt(s,h.vertical,at);if(restored(s,bridge))return;
  s.bridges.push(bridge);for(const prop of h.stones)prop.dead=true;s.owner.atlasRepairs=(s.owner.atlasRepairs||0)+1;
  G.sfx.play('wardBreak');G.spawnFx({kind:'puff',x:at.x,y:at.y,color:'#dfbb80',dur:.35});G.events.emit('guardianCounter',{guardian:'lastWorldbearer',kind:'rebuiltGround'});
 }
 function feetOverlap(g,a){const hw=(a.boxW||10)/2,bh=a.boxH||8;return a.x+hw>=g.left&&a.x-hw<=g.right&&a.y>=g.top&&a.y-bh<=g.bottom;}
 function departing(d,h){return !d.actor.dead&&(d.actor===G.state.player||G.state.enemies.includes(d.actor)||(G.state.npcs||[]).includes(d.actor))&&h.gaps.some(g=>feetOverlap(g,d.actor));}
 function departure(h,a){const routes=[];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])for(let distance=2;distance<=112;distance+=2){const end={...a,x:a.x+dx*distance,y:a.y+dy*distance};if(h.gaps.some(g=>feetOverlap(g,end)))continue;routes.push({end,distance});break;}routes.sort((a,b)=>a.distance-b.distance);const end=routes[0]?.end;if(!end)return null;return {actor:a,left:Math.min(a.x,end.x)-6,right:Math.max(a.x,end.x)+6,top:Math.min(a.y,end.y)-9,bottom:Math.max(a.y,end.y)+1};}
 function collapse(s,h,p){if(h.collapsed)return;h.collapsed=true;for(const g of h.gaps)g.open=true;
  if(h.gaps.some(g=>inside(g,p.x,p.y))&&!s.bridges.some(b=>inside(b,p.x,p.y))&&G.damagePlayer(1,s.owner.x,s.owner.y))h.hit=true;
  h.departures=[p,...G.state.enemies,...(G.state.npcs||[])].filter(a=>!a.dead&&!a.guardianProp&&h.gaps.some(g=>feetOverlap(g,a))).map(a=>departure(h,a)).filter(Boolean);
 }
 function paintFault(c,h,active){if(!live(h)||h.phase!==h.owner.bossPhase)return;c.save();for(const g of h.gaps){c.globalAlpha=active?.95:.45;c.fillStyle=active&&g.open?'#272936':'#b46f50';c.fillRect(g.left,g.top,g.right-g.left,g.bottom-g.top);c.strokeStyle='#ffcd75';c.lineWidth=1;c.setLineDash(active?[]:[3,3]);c.strokeRect(g.left,g.top,g.right-g.left,g.bottom-g.top);}c.restore();for(const d of h.departures||[])if(departing(d,h))paintBridge(c,d);for(const b of h.bridges)paintBridge(c,b);}
 G.registerGuardianAuthor('lastWorldbearer',{actions:{atlasFault(owner,p,spawn){const s=site(owner,p);if(!s){owner.bossRecoverT=.9;return;}
  const vertical=owner.bossPhase!==2,gap=vertical?{left:s.x-8,right:s.x+8,top:s.y-40,bottom:s.y+40}:{left:s.x-40,right:s.x+40,top:s.y-8,bottom:s.y+8};
  const h=spawn(owner,'atlasFault',{warning:1.5,active:4,color:'#dfbb80',vertical,bridges:s.bridges,gaps:owner.bossPhase===3?[gap,{left:s.x-40,right:s.x+40,top:s.y-8,bottom:s.y+8}]:[gap],guardianPaint:paintFault,guardianActive(h){collapse(s,h,p);}});
  const side=vertical?(p.x<s.x?-1:1):(p.y<s.y?-1:1);h.stones=[-16,16].map(offset=>vertical?{x:s.x+side*20,y:s.y+offset}:{x:s.x+offset,y:s.y+side*20}).filter(at=>!restored(s,bridgeAt(s,vertical,at))).map(at=>{const prop=G.makeGuardianProp(owner,at.x,at.y,{name:'Loose bridge stone',size:16,paint:paintStone,hit:()=>rebuild(s,h,at)});prop.atlasFault=h;return prop;});owner.bossRecoverT=h.warning+h.active+.8;
 },atlasWeight(owner,p,spawn){spawn(owner,'atlasWeight',{x:p.x,y:p.y,radius:22,warning:.95,active:.25,color:'#ef7d57',guardianActive(h){if(!h.hit&&Math.hypot(p.x-h.x,p.y-h.y)<=h.radius&&G.damagePlayer(1,owner.x,owner.y))h.hit=true;},guardianPaint(c,h,active){if(!live(h)||h.phase!==h.owner.bossPhase)return;c.save();c.globalAlpha=active?.75:.3;c.fillStyle=active?'#fff3c2':'#ef7d57';c.beginPath();c.arc(h.x,h.y,h.radius,0,Math.PI*2);c.fill();c.globalAlpha=1;c.strokeStyle='#ffcd75';c.lineWidth=2;c.setLineDash(active?[]:[3,3]);c.stroke();c.setLineDash([]);if(!active){const height=34*(1-Math.min(1,h.t/h.warning));c.fillStyle='#dfbb80';c.fillRect(h.x-6,h.y-height-12,12,10);c.strokeRect(h.x-6,h.y-height-12,12,10);}c.restore();}});owner.bossRecoverT=2;}}});
 function paintBridge(c,b){c.save();c.globalAlpha=1;c.fillStyle='#b9956e';c.fillRect(b.left,b.top,b.right-b.left,b.bottom-b.top);c.strokeStyle='#f4dfb1';c.lineWidth=1;c.strokeRect(b.left+.5,b.top+.5,b.right-b.left-1,b.bottom-b.top-1);c.strokeStyle='#8c735c';for(let x=b.left+7;x<b.right;x+=8){c.beginPath();c.moveTo(x,b.top+1);c.lineTo(x,b.bottom-1);c.stroke();}c.fillStyle='#83b46c';c.fillRect(b.right-5,b.top+2,3,3);c.restore();}
 const draw=G.drawBossHazards;G.drawBossHazards=c=>{present=present.filter(live);for(const s of present)for(const b of s.bridges)paintBridge(c,b);draw(c);};
})();
