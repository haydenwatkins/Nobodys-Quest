/* Choose a landing before a committed flight, then approach with its wind. */
"use strict";
(() => {
  const flights=new WeakMap(),hazards=new WeakMap();
  function clearPosts(f){for(const p of f.posts)p.dead=true;}
  function clearRoute(owner,x,y){
    const d=Math.hypot(x-owner.x,y-owner.y),steps=Math.max(1,Math.ceil(d/4)),probe={...owner};
    for(let i=1;i<=steps;i++){const nx=owner.x+(x-owner.x)*i/steps,ny=owner.y+(y-owner.y)*i/steps;G.world.moveBox(probe,nx-probe.x,ny-probe.y);if(Math.hypot(probe.x-nx,probe.y-ny)>.5)return false;}
    return G.world.isSafeSpawn(x,y);
  }
  function walkingRoute(from,to){
    const nodes=[{x:from.x,y:from.y,parent:-1}],seen=new Set(['0,0']);
    for(let i=0;i<nodes.length;i++){
      const n=nodes[i];if(Math.hypot(n.x-to.x,n.y-to.y)<14){const route=[];for(let j=i;j>=0;j=nodes[j].parent)route.push({x:nodes[j].x,y:nodes[j].y});return route.reverse();}
      for(const [dx,dy]of [[8,0],[-8,0],[0,8],[0,-8]]){const x=n.x+dx,y=n.y+dy,key=Math.round((x-from.x)/8)+','+Math.round((y-from.y)/8);if(seen.has(key)||Math.hypot(x-from.x,y-from.y)>180)continue;seen.add(key);if(G.world.isSafeSpawn(x,y))nodes.push({x,y,parent:i});}
    }return null;
  }
  function postPaint(c,e){const f=flights.get(e.guardianProp.owner),selected=f?.selected===e;
    c.save();c.fillStyle=selected?'#ffcd75':'#73eff7';c.strokeStyle='#fff3c2';c.lineWidth=selected?2:1;c.beginPath();c.ellipse(e.x,e.y,13,6,0,0,Math.PI*2);c.stroke();
    c.beginPath();c.ellipse(e.x,e.y-9,4,9,.5,0,Math.PI*2);c.fill();c.strokeStyle='#35483e';c.lineWidth=1;c.beginPath();c.moveTo(e.x-3,e.y-2);c.lineTo(e.x+3,e.y-16);c.stroke();c.restore();}
  function choose(owner,f,post){if(f.committed||!G.state.bossHazards.includes(hazards.get(f))||!G.guardianPropLive(post))return;if(f.touched&&f.selected===post)return;f.touched=true;f.selected=post;owner.skyChoices=(owner.skyChoices||0)+1;G.sfx.play('wardBreak');G.spawnFx({kind:'ring',x:post.x,y:post.y,color:'#ffcd75',radius:18,dur:.3});G.damageNumber(post.x,post.y-24,'HERE!','#ffcd75');G.events.emit('guardianCounter',{guardian:'skySovereign',kind:'landing'});}
  function paint(c,h,active){const f=h.flight,at=f.selected;
    c.save();c.strokeStyle='#73eff7';c.fillStyle='#73eff7';c.lineWidth=active?5:2;c.globalAlpha=active?.3:.75;c.setLineDash(active?[]:[4,4]);
    c.beginPath();c.moveTo(f.start.x,f.start.y);c.lineTo(at.x,at.y);c.stroke();c.setLineDash([]);
    const a=Math.atan2(at.y-f.start.y,at.x-f.start.x);for(const t of [.25,.5,.75]){const x=f.start.x+(at.x-f.start.x)*t,y=f.start.y+(at.y-f.start.y)*t;c.beginPath();c.moveTo(x-Math.cos(a-.6)*7,y-Math.sin(a-.6)*7);c.lineTo(x,y);c.lineTo(x-Math.cos(a+.6)*7,y-Math.sin(a+.6)*7);c.stroke();}
    c.globalAlpha=.8;c.strokeStyle='#ffcd75';c.lineWidth=2;c.beginPath();c.ellipse(at.x,at.y,16,9,0,0,Math.PI*2);c.stroke();c.restore();
  }
  function active(h,feet,dt){const f=h.flight,owner=h.owner,age=h.t-h.warning;
    if(!h.landed){const t=Math.min(1,age/.3),x=f.start.x+(f.selected.x-f.start.x)*t,y=f.start.y+(f.selected.y-f.start.y)*t,before={x:owner.x,y:owner.y};
      const steps=Math.max(1,Math.ceil(Math.hypot(x-owner.x,y-owner.y)/4));for(let i=0;i<steps;i++)G.world.moveBox(owner,(x-owner.x)/(steps-i),(y-owner.y)/(steps-i));
      const dx=owner.x-before.x,dy=owner.y-before.y,length=dx*dx+dy*dy,touch=length?G.util.clamp(((feet.x-before.x)*dx+(feet.y-before.y)*dy)/length,0,1):0;
      if(!h.hit&&Math.hypot(feet.x-before.x-dx*touch,feet.y-before.y-dy*touch)<18&&G.damagePlayer(1,owner.x,owner.y))h.hit=true;h.landed=t>=1;
    }
    if(age>=.3){
      const dx=f.selected.x-f.start.x,dy=f.selected.y-f.start.y,length=dx*dx+dy*dy,along=length?((feet.x-f.start.x)*dx+(feet.y-f.start.y)*dy)/length:-1;
      if(along>=0&&along<.9&&Math.hypot(feet.x-f.start.x-dx*along,feet.y-f.start.y-dy*along)<18){const d=Math.sqrt(length)||1,p=G.state.player,before={x:p.x,y:p.y},step=Math.min(28*Math.min(dt,Math.max(0,age-.3)),(.9-along)*d);G.world.moveBox(p,dx/d*step,dy/d*step);if(Math.hypot(p.x-before.x,p.y-before.y)>.001)owner.skyWindSteps=(owner.skyWindSteps||0)+1;}
    }
  }
  G.registerGuardianAuthor('skySovereign',{repeatVictory:owner=>owner.skyChoices>0?"You found me a lovely landing! The cliffpost still has letters waiting. Take the wind home, little courier.":"Lovely footwork! The cliffpost still has letters waiting. Take the wind home, little courier.",actions:{skyFlight(owner,p,spawn){
    const old=flights.get(owner);if(old)clearPosts(old);
    const a=Math.atan2(p.y-owner.y,p.x-owner.x),phase=owner.bossPhase,options=phase===1?[{angle:a-.7,d:54},{angle:a+.7,d:54}]:phase===2?[{angle:a-.35,d:56},{angle:a+1.25,d:56}]:[{angle:a-.65,d:34},{angle:a+.5,d:70}],landings=[];
    for(const option of options){let found=null;for(const turn of [0,.35,-.35,.7,-.7,1.4,-1.4,Math.PI]){const x=owner.x+Math.cos(option.angle+turn)*option.d,y=owner.y+Math.sin(option.angle+turn)*option.d;const route=clearRoute(owner,x,y)&&walkingRoute(p,{x,y});if(route&&landings.every(at=>Math.hypot(at.x-x,at.y-y)>22)){found={x,y,route};break;}}if(found)landings.push(found);}
    // A cramped corner still provides a truthful, short landing on real ground.
    if(!landings.length)landings.push({x:owner.x,y:owner.y});
    const choiceTime=Math.max(1.2,...landings.map(at=>((at.route?.length||1)-1)*8/G.bossWalkingSpeed()+.45));
    const f={start:{x:owner.x,y:owner.y},posts:[],phase,map:G.state.mapId,committed:false,choiceTime};flights.set(owner,f);
    for(const at of landings)f.posts.push(G.makeGuardianProp(owner,at.x,at.y,{name:'Feather landing',hit:e=>choose(owner,f,e),paint:postPaint}));f.selected=f.posts[0];
    hazards.set(f,spawn(owner,'skyFlight',{warning:choiceTime+1,active:1.4,color:'#73eff7',flight:f,guardianActive:active,guardianPaint:paint}));owner.bossRecoverT=choiceTime+3.3;
  }}});
  const update=G.updateOpening;G.updateOpening=dt=>{update(dt);for(const owner of G.state.enemies||[]){const f=flights.get(owner);if(!f)continue;
    if(owner.dead||owner.bossPhase!==f.phase||G.state.mapId!==f.map||G.state.knockout||!G.state.bossHazards.includes(hazards.get(f))){clearPosts(f);flights.delete(owner);continue;}
    if(!f.committed&&hazards.get(f).t>=hazards.get(f).warning-1){f.committed=true;clearPosts(f);}
  }};
})();
