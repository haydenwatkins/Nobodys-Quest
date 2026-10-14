/* A short stone track trades a sheltered lane for an opened approach. */
"use strict";
(() => {
  const yards=new WeakMap();let present=[],movingCover=null;
  const live=y=>y&&!y.owner.dead&&!G.state.knockout&&y.map===G.state.mapId&&y.phase===y.owner.bossPhase&&G.state.enemies.includes(y.owner);
  const box=b=>({left:b.x-8,right:b.x+8,top:b.y-8,bottom:b.y+8});
  const covers=()=>present.filter(live).flatMap(y=>[y.cover,...(y.fixed||[])]).filter(b=>b!==movingCover);
  const blocked=G.openingCellBlocked;
  G.openingCellBlocked=(x,y)=>!!blocked?.(x,y)||covers().some(b=>Math.abs(x-b.x)<=8&&Math.abs(y-b.y)<=8);
  const terrain=G.world.blocksProjectile;
  G.world.blocksProjectile=(x,y,fromX,fromY,radius)=>terrain(x,y,fromX,fromY,radius)||covers().some(b=>G.world.segmentHitsBox(fromX??x,fromY??y,x,y,box(b),radius));
  function paintHandle(c,e){c.save();c.strokeStyle='#d8b06a';c.lineWidth=3;c.beginPath();c.moveTo(e.x,e.y);c.lineTo(e.x,e.y-12);c.stroke();c.fillStyle='#ffcd75';c.fillRect(e.x-5,e.y-15,10,5);c.restore();}
  function clearGround(x,y){return [[-9,-9],[9,-9],[-9,9],[9,9]].every(([dx,dy])=>!G.world.solid(x+dx,y+dy))&&G.world.isSafeSpawn(x,y);}
  function occupied(x,y){return [G.state.player,...(G.state.npcs||[]),...G.state.enemies].some(a=>!a.dead&&!a.guardianProp&&Math.abs(a.x-x)<15&&Math.abs(a.y-y)<15);}
  function slide(owner,site){if(!live(site)||site.travel)return;const slot=site.slots[(site.index+1)%site.slots.length];if(!slot||occupied(slot.x,slot.y)){G.damageNumber(site.handle.x,site.handle.y-20,'WAIT','#fff3c2');return;}site.travel=slot;}
  function moveCover(site,dt){if(!site.travel)return;const at=site.travel;movingCover=site.cover;
    try{let remaining=80*dt;while(remaining>0){const dx=at.x-site.cover.x,dy=at.y-site.cover.y,d=Math.hypot(dx,dy),step=Math.min(3,remaining,d),x=site.cover.x+dx/(d||1)*step,y=site.cover.y+dy/(d||1)*step;
      if(!clearGround(x,y)||occupied(x,y)){G.damageNumber(site.handle.x,site.handle.y-20,'WAIT','#fff3c2');site.travel=null;return;}
      site.cover.x=x;site.cover.y=y;remaining-=step;if(d<=step+.001){site.index=(site.index+1)%site.slots.length;site.travel=null;site.owner.masonryMoves=(site.owner.masonryMoves||0)+1;G.sfx.play('wardBreak');G.spawnFx({kind:'puff',x,y,color:'#d8b06a',dur:.3});G.events.emit('guardianCounter',{guardian:'oldMason',kind:'cover'});return;}
    }}finally{movingCover=null;}
  }
  function clearTrack(from,to){const d=Math.hypot(to.x-from.x,to.y-from.y),n=Math.ceil(d/4);for(let i=1;i<=n;i++)if(!clearGround(from.x+(to.x-from.x)*i/n,from.y+(to.y-from.y)*i/n)||occupied(from.x+(to.x-from.x)*i/n,from.y+(to.y-from.y)*i/n))return false;return true;}
  function yard(owner,p){const old=yards.get(owner);if(live(old))return old;
    const planned=owner.bossPhase===3?[[32,0],[64,0],[80,0],[-32,0],[-64,0]]:owner.bossPhase===2?[[32,0],[64,24],[0,36],[0,-36]]:[[32,0],[64,24],[32,36],[32,-36]];const candidates=[...planned,[32,-36],[64,-36],[0,-36],[80,-36],[-32,32],[-32,-32],[0,36],[0,-36],[64,-32],[48,48],[-48,0],[-64,0],[96,0],[128,0],[80,36],[112,36],[32,64],[64,64],[-32,-64],[-64,-64]].map(([dx,dy])=>({x:p.x+dx,y:p.y+dy})).filter(at=>clearGround(at.x,at.y)&&!occupied(at.x,at.y));let slots=[];
    for(const first of candidates){if(owner.bossPhase===3&&![-24,24].every(dy=>clearGround(first.x,first.y+dy)&&!occupied(first.x,first.y+dy)))continue;const other=candidates.find(at=>Math.hypot(at.x-first.x,at.y-first.y)>24&&(owner.bossPhase===3?Math.abs(at.x-first.x)>=24&&Math.abs(at.y-first.y)<1:owner.bossPhase===2?Math.abs(at.x-first.x)>=24:Math.abs(at.y-first.y)>=24)&&clearTrack(first,at));if(other){slots=[first,other];break;}}
    if(slots.length<2)return null;const site={owner,map:G.state.mapId,phase:owner.bossPhase,slots,index:0,cover:{...slots[0]},fixed:[]};if(owner.bossPhase===3)for(const dy of [-24,24]){const x=slots[0].x,atY=slots[0].y+dy;if(clearGround(x,atY)&&!occupied(x,atY))site.fixed.push({x,y:atY});}
    const from=slots[0],to=slots[1],dx=to.x-from.x,dy=to.y-from.y,trackDistance=at=>{const t=G.util.clamp(((at.x-from.x)*dx+(at.y-from.y)*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(at.x-from.x-dx*t,at.y-from.y-dy*t);};
    const handleAt=[[-24,32],[-24,-32],[24,32],[24,-32],[-48,32],[48,32],[-24,48],[24,48],[-24,-48],[24,-48]].map(([dx,dy])=>({x:from.x+dx,y:from.y+dy})).find(at=>clearGround(at.x,at.y)&&trackDistance(at)>26&&Math.hypot(at.x-owner.x,at.y-owner.y)>owner.def.size/2+12);if(!handleAt)return null;
    yards.set(owner,site);present.push(site);
    site.handle=G.makeGuardianProp(owner,handleAt.x,handleAt.y,{name:'Stone track handle',hit:()=>slide(owner,site),paint:paintHandle});return site;
  }
  G.registerGuardianAuthor('oldMason',{repeatVictory:e=>e.masonryMoves>0?"A door! And a useful wall! Take the garden road home. I'll tuck the petunias in.":"You found the open path! Take the garden road home. I'll tuck the petunias in.",actions:{masonryPassage(owner,p,spawn){const site=yard(owner,p);if(!site){owner.bossRecoverT=1;return;}
    const first=site.slots[0],other=site.slots[1],phase=owner.bossPhase,lanes=phase===3?[first.y-24,first.y,first.y+24]:phase===2?[first.x,other.x]:[first.y,other.y],launches=lanes.map(at=>phase===2?{from:{x:at,y:first.y-36},to:{x:at,y:first.y+90}}:{from:{x:first.x+52,y:at},to:{x:first.x-90,y:at}});
    spawn(owner,'masonryPassage',{warning:Math.max(1.4,Math.hypot(site.handle.x-p.x,site.handle.y-p.y)/G.bossWalkingSpeed()+Math.hypot(other.x-first.x,other.y-first.y)/80+.65),active:.08,color:'#ffcd75',launches,
      guardianActive(h){if(h.fired)return;h.fired=true;for(const lane of launches)G.fireGuardianProjectile(owner,lane.from,lane.to,{speed:90,range:Math.hypot(lane.to.x-lane.from.x,lane.to.y-lane.from.y),damage:1,size:4,shape:'masonryStone'});},
      guardianPaint(c,h){c.save();c.strokeStyle='#ffcd75';c.lineCap='round';c.lineWidth=18;c.globalAlpha=.13;for(const lane of launches){c.beginPath();c.moveTo(lane.from.x,lane.from.y-1);c.lineTo(lane.to.x,lane.to.y-1);c.stroke();}c.globalAlpha=.85;c.lineWidth=1;c.setLineDash([3,3]);for(const lane of launches){c.beginPath();c.moveTo(lane.from.x,lane.from.y-1);c.lineTo(lane.to.x,lane.to.y-1);c.stroke();}c.restore();}});owner.bossRecoverT=1.4+150/90+.85;
  }}});
  const update=G.updateOpening;G.updateOpening=dt=>{update(dt);present=present.filter(live);for(const site of present)moveCover(site,dt);};
  const draw=G.openingDrawables;G.openingDrawables=c=>{const list=draw(c);for(const site of present.filter(live)){
    list.push({y:site.slots[0].y-1,fn:()=>{c.save();c.strokeStyle='#d8caa1';c.lineWidth=2;c.setLineDash([3,3]);c.beginPath();c.moveTo(site.slots[0].x,site.slots[0].y);c.lineTo(site.slots.at(-1).x,site.slots.at(-1).y);c.stroke();c.restore();}});
    for(const b of [site.cover,...site.fixed])list.push({y:b.y+8,fn:()=>{c.save();c.fillStyle='#35483e';c.fillRect(b.x-8,b.y-8,16,16);c.fillStyle='#d8b06a';c.fillRect(b.x-8,b.y-18,16,18);c.fillStyle='#ffcd75';c.fillRect(b.x-8,b.y-18,16,3);c.strokeStyle='#8a6538';c.strokeRect(b.x-8,b.y-8,16,16);c.restore();}});
  }return list;};
})();
