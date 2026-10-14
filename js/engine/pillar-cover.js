/* A short stone track trades a sheltered lane for an opened approach. */
"use strict";
(() => {
  const yards=new WeakMap();let present=[];
  const live=y=>y&&!y.owner.dead&&!G.state.knockout&&y.map===G.state.mapId&&y.phase===y.owner.bossPhase&&G.state.enemies.includes(y.owner);
  const box=b=>({left:b.x-8,right:b.x+8,top:b.y-8,bottom:b.y+8});
  const covers=()=>present.filter(live).flatMap(y=>[y.cover,...(y.fixed||[])]);
  const blocked=G.openingCellBlocked;
  G.openingCellBlocked=(x,y)=>!!blocked?.(x,y)||covers().some(b=>Math.abs(x-b.x)<=8&&Math.abs(y-b.y)<=8);
  const terrain=G.world.blocksProjectile;
  G.world.blocksProjectile=(x,y,fromX,fromY,radius)=>terrain(x,y,fromX,fromY,radius)||covers().some(b=>G.world.segmentHitsBox(fromX??x,fromY??y,x,y,box(b),radius));
  function paintHandle(c,e){c.save();c.strokeStyle='#d8b06a';c.lineWidth=3;c.beginPath();c.moveTo(e.x,e.y);c.lineTo(e.x,e.y-12);c.stroke();c.fillStyle='#ffcd75';c.fillRect(e.x-5,e.y-15,10,5);c.restore();}
  function clearGround(x,y){return [[-9,-9],[9,-9],[-9,9],[9,9]].every(([dx,dy])=>!G.world.solid(x+dx,y+dy))&&G.world.isSafeSpawn(x,y);}
  function occupied(x,y){return [G.state.player,...(G.state.npcs||[]),...G.state.enemies].some(a=>!a.dead&&!a.guardianProp&&Math.abs(a.x-x)<15&&Math.abs(a.y-y)<15);}
  function slide(owner,y){if(!live(y))return;const slot=y.slots[(y.index+1)%y.slots.length];if(!slot||occupied(slot.x,slot.y)){G.damageNumber(y.handle.x,y.handle.y-20,'WAIT','#fff3c2');return;}
    y.cover.x=slot.x;y.cover.y=slot.y;y.index=(y.index+1)%y.slots.length;owner.masonryMoves=(owner.masonryMoves||0)+1;G.sfx.play('wardBreak');G.spawnFx({kind:'puff',x:slot.x,y:slot.y,color:'#d8b06a',dur:.3});G.events.emit('guardianCounter',{guardian:'oldMason',kind:'cover'});
  }
  function yard(owner,p){const old=yards.get(owner);if(live(old))return old;
    const planned=owner.bossPhase===2?[[32,0],[62,28],[32,36],[32,-36]]:[[32,0],[64,24],[32,36],[32,-36]];const slots=[];for(const [dx,dy]of [...planned,[-32,20],[-32,-20],[48,0]]){const x=p.x+dx,y=p.y+dy;if(clearGround(x,y)&&!occupied(x,y)&&slots.every(at=>Math.hypot(at.x-x,at.y-y)>24))slots.push({x,y});if(slots.length===2)break;}
    if(!slots.length)return null;const y={owner,map:G.state.mapId,phase:owner.bossPhase,slots,index:0,cover:{...slots[0]},fixed:[]};if(owner.bossPhase===3)for(const dy of [-24,24]){const x=slots[0].x,atY=slots[0].y+dy;if(clearGround(x,atY)&&!occupied(x,atY))y.fixed.push({x,y:atY});}yards.set(owner,y);present.push(y);
    const handleAt={x:slots[0].x-24,y:slots[0].y};if(!G.world.isSafeSpawn(handleAt.x,handleAt.y))Object.assign(handleAt,G.world.safeArrival(handleAt.x,handleAt.y));
    y.handle=G.makeGuardianProp(owner,handleAt.x,handleAt.y,{name:'Stone track handle',hit:()=>slide(owner,y),paint:paintHandle});return y;
  }
  G.registerGuardianAuthor('oldMason',{repeatVictory:e=>e.masonryMoves>0?"A door! And a useful wall! Take the garden road home. I'll tuck the petunias in.":"You found the open path! Take the garden road home. I'll tuck the petunias in.",actions:{masonryPassage(owner,p,spawn){const y=yard(owner,p);if(!y){owner.bossRecoverT=1;return;}
    const first=y.slots[0],other=y.slots[1]||{x:first.x+32,y:first.y+32},phase=owner.bossPhase,lanes=phase===3?[first.y-24,first.y,first.y+24]:phase===2?[first.x,other.x]:[first.y,other.y],launches=lanes.map(at=>phase===2?{from:{x:at,y:first.y-36},to:{x:at,y:first.y+90}}:{from:{x:first.x+52,y:at},to:{x:first.x-90,y:at}});
    spawn(owner,'masonryPassage',{warning:Math.max(1.4,Math.hypot(y.handle.x-p.x,y.handle.y-p.y)/G.bossWalkingSpeed()+.65),active:.08,color:'#ffcd75',launches,
      guardianActive(h){if(h.fired)return;h.fired=true;for(const lane of launches)G.fireGuardianProjectile(owner,lane.from,lane.to,{speed:90,range:150,damage:1,size:4,shape:'masonryStone'});},
      guardianPaint(c,h){c.save();c.strokeStyle='#ffcd75';c.lineCap='round';c.lineWidth=18;c.globalAlpha=.13;for(const lane of launches){c.beginPath();c.moveTo(lane.from.x,lane.from.y-1);c.lineTo(lane.to.x,lane.to.y-1);c.stroke();}c.globalAlpha=.85;c.lineWidth=1;c.setLineDash([3,3]);for(const lane of launches){c.beginPath();c.moveTo(lane.from.x,lane.from.y-1);c.lineTo(lane.to.x,lane.to.y-1);c.stroke();}c.restore();}});owner.bossRecoverT=1.4+150/90+.85;
  }}});
  const update=G.updateOpening;G.updateOpening=dt=>{update(dt);present=present.filter(live);};
  const draw=G.openingDrawables;G.openingDrawables=c=>{const list=draw(c);for(const y of present.filter(live)){
    list.push({y:y.slots[0].y-1,fn:()=>{c.save();c.strokeStyle='#d8caa1';c.lineWidth=2;c.setLineDash([3,3]);c.beginPath();c.moveTo(y.slots[0].x,y.slots[0].y);c.lineTo(y.slots.at(-1).x,y.slots.at(-1).y);c.stroke();c.restore();}});
    for(const b of [y.cover,...y.fixed])list.push({y:b.y+8,fn:()=>{c.save();c.fillStyle='#35483e';c.fillRect(b.x-8,b.y-8,16,16);c.fillStyle='#d8b06a';c.fillRect(b.x-8,b.y-18,16,18);c.fillStyle='#ffcd75';c.fillRect(b.x-8,b.y-18,16,3);c.strokeStyle='#8a6538';c.strokeRect(b.x-8,b.y-8,16,16);c.restore();}});
  }return list;};
})();
