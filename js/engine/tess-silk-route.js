/* A bead keeps its committed thread; free hits choose its next connection. */
"use strict";
(() => {
 const posts=new WeakMap(),chosenProjectiles=new WeakMap();let phrases=[];
 function route(from,to){const nodes=[{...from,parent:-1,gx:0,gy:0}],seen=new Set(['0,0']);for(let i=0;i<nodes.length&&i<6000;i++){const n=nodes[i];if(Math.hypot(n.x-to.x,n.y-to.y)<6){const path=[{...to}];for(let j=i;j>=0;j=nodes[j].parent)path.push({x:nodes[j].x,y:nodes[j].y});return path.reverse();}for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const gx=n.gx+dx,gy=n.gy+dy,k=gx+','+gy,x=from.x+gx*8,y=from.y+gy*8;if(seen.has(k)||Math.abs(gx)>24||Math.abs(gy)>24)continue;seen.add(k);if(G.world.isSafeSpawn(x,y))nodes.push({x,y,gx,gy,parent:i});}}return null;}
 const length=path=>path.slice(1).reduce((sum,at,i)=>sum+Math.hypot(at.x-path[i].x,at.y-path[i].y),0);
 function retire(node){for(const at of posts.get(node)||[])at.dead=true;}
 function choose(owner,node,cut,opts){if(node.committed||node.choice===1-cut||node.choiceTick===G.state.time||opts.guardianAttack&&chosenProjectiles.get(node)?.has(opts.guardianAttack))return;if(opts.guardianAttack){if(!chosenProjectiles.has(node))chosenProjectiles.set(node,new WeakSet());chosenProjectiles.get(node).add(opts.guardianAttack);}node.choiceTick=G.state.time;node.choice=1-cut;owner.silkChoices=(owner.silkChoices||0)+1;G.damageNumber(node.x,node.y-20,'NEXT','#ffcd75');G.sfx.play('wardBreak');G.events.emit('guardianCounter',{guardian:owner.def.id,kind:'thread'});}
 function paintKnot(c,e,node,cut){c.save();const taut=cut===node.choice;c.strokeStyle=taut?'#fff3c2':'#78938a';c.lineWidth=3;c.beginPath();c.moveTo(e.x-8,e.y-8);c.lineTo(e.x+8,e.y-8);c.moveTo(e.x,e.y-15);c.lineTo(e.x,e.y-2);c.stroke();c.strokeStyle='#fff3c2';c.lineWidth=1;c.beginPath();c.arc(e.x,e.y-8,5,taut?0:.5,taut?Math.PI*2:Math.PI*1.6);c.stroke();c.restore();}
 function makeNode(owner,at,crossing,along,aside,forward=32){
  const place=(forward,side)=>G.world.safeArrival(at.x+along.x*forward+aside.x*side,at.y+along.y*forward+aside.y*side);
  const guides=crossing?[place(-24,0),place(24,0)]:[place(0,-24),place(0,24)],ends=crossing?[place(-32,32),place(32,32)]:[place(forward,-32),place(forward,32)];
  if(Math.hypot(guides[0].x-guides[1].x,guides[0].y-guides[1].y)<16||guides.some(p=>Math.hypot(p.x-owner.x,p.y-owner.y)<30))return null;
  const paths=ends.map((end,i)=>{const first=route(at,guides[i]),last=route(guides[i],end);return first&&last?[...first,...last.slice(1)]:null;});if(paths.some(p=>!p))return null;
  const node={...at,paths,choice:0,committed:false};posts.set(node,guides.map((place,cut)=>G.makeGuardianProp(owner,place.x,place.y,{name:'Silk connection knot',size:16,hit:(e,opts)=>choose(owner,node,cut,opts),paint:(c,e)=>paintKnot(c,e,node,cut)})));return node;
 }

 function distanceToSegment(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=G.util.clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);}
 function advance(h,p,dt){const silk=h.silk,pulse=silk.pulse;if(!silk.finished&&!h.hit&&Math.hypot(p.x-pulse.x,p.y-pulse.y)<=8&&G.damagePlayer(1,pulse.x,pulse.y))h.hit=true;let remaining=64*Math.min(dt,Math.max(0,h.t-h.warning));
  while(remaining>0){if(pulse.wait>0){const used=Math.min(pulse.wait,remaining/64);pulse.wait-=used;remaining-=used*64;if(pulse.wait>0)return;const node=silk.nodes[pulse.node];node.committed=true;retire(node);pulse.path=node.paths[node.choice];pulse.index=1;}
   const next=pulse.path[pulse.index];if(!next){if(pulse.node<silk.nodes.length-1){pulse.node++;pulse.wait=.75+(G.comfortSetting('bossAssistance')?.3:0);continue;}silk.finished=true;return;}
   const before={x:pulse.x,y:pulse.y},dx=next.x-pulse.x,dy=next.y-pulse.y,d=Math.hypot(dx,dy),step=Math.min(remaining,d);pulse.x+=dx/(d||1)*step;pulse.y+=dy/(d||1)*step;remaining-=step;if(!h.hit&&distanceToSegment(p,before,pulse)<=8&&G.damagePlayer(1,pulse.x,pulse.y))h.hit=true;if(d<=step+.001)pulse.index++;
  }
 }
 function paint(c,h){const silk=h.silk;c.save();c.lineCap='round';for(const node of silk.nodes)for(let choice=0;choice<2;choice++){c.strokeStyle=choice===node.choice?'#d9a7ff':'#78938a';c.globalAlpha=choice===node.choice?.65:.4;c.lineWidth=choice===node.choice?2:1;c.setLineDash(choice===node.choice?[]:[3,4]);c.beginPath();node.paths[choice].forEach((at,i)=>i?c.lineTo(at.x,at.y):c.moveTo(at.x,at.y));c.stroke();}
  if(silk.finished){c.restore();return;}c.setLineDash([]);c.strokeStyle='#ffcd75';c.globalAlpha=.15;c.lineWidth=16;c.beginPath();silk.pulse.path.forEach((at,i)=>i?c.lineTo(at.x,at.y):c.moveTo(at.x,at.y));c.stroke();c.globalAlpha=1;c.fillStyle='#fff3c2';c.strokeStyle='#ffcd75';c.lineWidth=1;c.beginPath();c.arc(silk.pulse.x,silk.pulse.y,8,0,Math.PI*2);c.stroke();c.beginPath();c.arc(silk.pulse.x,silk.pulse.y-4,4,0,Math.PI*2);c.fill();c.restore();}
 function makePhrase(owner,p,layout){
  const dx=owner.x-p.x,dy=owner.y-p.y,along=layout?.along||(Math.abs(dx)>=Math.abs(dy)?{x:Math.sign(dx)||1,y:0}:{x:0,y:Math.sign(dy)}),aside={x:-along.y,y:along.x},primary=owner.bossPhase===2||Math.hypot(p.x-owner.x,p.y-owner.y)<=50?-32:24;
  for(const at of (layout?[layout.junction]:[primary,-56,-80].map(offset=>G.world.safeArrival(p.x+along.x*offset,p.y+along.y*offset)))){
   const incoming=route(owner,at);if(!incoming)continue;
   const first=makeNode(owner,at,!layout&&owner.bossPhase===2,along,aside,layout?.forward);if(!first)continue;const nodes=[first];
   if(owner.bossPhase===3){const next=layout?.second,secondAlong=next?.along||along,secondAside={x:-secondAlong.y,y:secondAlong.x},second=makeNode(owner,next?.junction||G.world.safeArrival(at.x+aside.x*64,at.y+aside.y*64),false,secondAlong,secondAside,next?.forward),joined=second&&first.paths.map(path=>{const tail=route(path.at(-1),second);return tail?[...path,...tail.slice(1)]:null;});if(!second||joined.some(path=>!path)){retire(first);if(second)retire(second);continue;}first.paths=joined;nodes.push(second);}
   return {incoming,nodes};
  }return null;
 }
 G.registerGuardianAuthor('silkMatriarch',{repeatVictory:e=>e.silkChoices>0?'You gave that thread somewhere kind to go. Take the silver road home; I’ll mend the little gaps.':'You followed the bead beautifully. Take the silver road home; I’ll mend the little gaps.',actions:{silkRoute(owner,p,spawn,layout){const phrase=makePhrase(owner,p,layout);if(!phrase){owner.bossRecoverT=1;return;}const {incoming,nodes}=phrase;
  const silk={nodes,pulse:{x:owner.x,y:owner.y,path:incoming,index:1,node:-1,wait:0},finished:false},active=(length(incoming)+nodes.reduce((sum,node)=>sum+Math.max(...node.paths.map(length)),0))/64+1.1*nodes.length+.75;const points=[...incoming,...nodes.flatMap(node=>node.paths.flat())],bounds={left:Math.min(...points.map(at=>at.x))-9,top:Math.min(...points.map(at=>at.y))-9,right:Math.max(...points.map(at=>at.x))+9,bottom:Math.max(...points.map(at=>at.y))+9};const h=spawn(owner,'silkRoute',{warning:1.5,active,color:'#d9a7ff',bounds,silk,guardianActive:advance,guardianPaint:paint});phrases.push(h);owner.bossRecoverT=h.warning+h.active+.75;}}});

 const update=G.updateOpening;G.updateOpening=dt=>{update(dt);phrases=phrases.filter(h=>{const live=G.state.bossHazards.includes(h)&&h.mapId===G.state.mapId&&!h.owner.dead&&!G.state.knockout&&G.state.enemies.includes(h.owner);if(!live)for(const node of h.silk.nodes)retire(node);return live;});};
})();
