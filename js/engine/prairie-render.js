/* Courier cloth is mounted to its posts; restoration lives in the saved course. */
"use strict";
(()=>{
 const here=()=>G.state&&G.state.mapId==='sunstepPrairie',S=G.prairieScenery;
 const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 G.drawPrairieTile=(c,cell,x,y)=>{if(!here()||!['grass','path','tree'].includes(cell.tile))return false;const px=x*16,py=y*16,r=G.util.hash2(x+193,y+137)*2,patch=G.util.hash2(Math.floor(x/5)+63,Math.floor(y/4)+47)*2;
  rect(c,px,py,16,16,cell.tile==='path'?['#c4ab7d','#ccb68a','#baa47a'][Math.floor(patch*3)]:['#9eac7b','#a7b382','#96a575'][Math.floor(patch*3)]);
  if(cell.tile==='tree')G.drawSprite(c,S.hedge,Math.floor(r*4),px+8,py+16,false);else if(cell.tile==='grass'&&r>.9)G.drawSprite(c,S.tuft,Math.floor(G.util.hash2(x+101,y+11)*8),px+8,py+16,false);else if(cell.tile==='path'&&r>.55){rect(c,px+3,py+7,5,1,'#decaa0');rect(c,px+11,py+11,2,1,'#ae9771');}return true;
 };
 G.drawPrairiePortal=(c,cell,x,y)=>{if(!here()||!cell.portal)return false;c.save();if(x===0){c.translate(x*16+8,y*16+16);c.scale(-1,1);G.drawSprite(c,S.roadStep,0,0,0,false);}else G.drawSprite(c,S.roadStep,0,x*16+8,y*16+16,false);c.restore();return true;};
 G.drawPrairieNotice=(c,cell,x,y)=>{if(!here()||!cell.message)return false;G.drawSprite(c,S.notice,0,x*16+8,y*16+16,false);return true;};
 G.drawPrairieCache=(c,ch)=>{if(!here()||ch.chest?.item!=='sunstep-ribbon')return false;G.drawSprite(c,S.cache,ch.opened?1:0,ch.x*16+8,ch.y*16+16,false);return true;};
 G.drawPrairiePost=(c,post,awake,near)=>{if(!here())return false;G.drawSprite(c,G.greenfieldScenery[awake?'postAwake':'postSleeping'],0,Math.round(post.x),Math.round(post.y)+6,false);if(near){rect(c,post.x-9,post.y-20,18,1,'#dbc08c');rect(c,post.x-9,post.y-20,1,4,'#dbc08c');rect(c,post.x+8,post.y-20,1,4,'#dbc08c');}return true;};
 G.drawCaravanFence=(c,fence)=>{const n=Math.max(1,Math.floor(fence.length||1)),x=fence.x*16,y=fence.y*16;c.save();if(fence.dir==='v'){rect(c,x+7,y,3,n*16,'#57483b');rect(c,x+8,y,1,n*16,'#b49161');}else{rect(c,x,y+5,n*16,3,'#57483b');rect(c,x,y+6,n*16,1,'#b49161');rect(c,x,y+11,n*16,2,'#806348');}for(let i=0;i<=n;i++)G.drawSprite(c,S.fencePost,0,x+(fence.dir==='v'?8:i*16),y+(fence.dir==='v'?i*16:0)+16,false);c.restore();return true;};
 G.drawCaravanCamp=(c,time)=>{G.drawSprite(c,S.hearth,G.reducedMotion?0:Math.floor(time*2)%4,120,332,false);
  // Earned roads are six fixed enamel studs fitted into the timber camp rail.
  const earned=G.ensureWorldwake().marks,colors=['#9cc9c8','#d5bc8d','#b89bbd','#b8d4d2','#dbb77a','#cf9b81'];for(let i=0;i<6;i++){rect(c,91+i*10,293,5,4,'#57483b');rect(c,92+i*10,294,3,2,earned.includes(['sky','stone','thread','echo','light','heart'][i])?colors[i]:'#806348');}return true;
 };
 G.drawPrairieFence=(c,fence)=>here()?G.drawCaravanFence(c,fence):false;
 G.drawPrairieCamp=(c,time)=>here()?G.drawCaravanCamp(c,time):false;
 G.drawPrairieCourierSign=(c,x,y)=>{if(!here())return false;G.drawSprite(c,S.courierSign,0,x,y+3,false);c.save();c.fillStyle='#57483b';c.font='6px monospace';c.textAlign='center';c.textBaseline='alphabetic';c.fillText('COURIER',x,y-28);c.font='5px monospace';c.fillText('CAMP SOUTH',x,y-21);c.restore();return true;};
 G.drawPrairieCheckpoint=(c,x,y,i,active)=>{if(!here())return false;const next=active?.step===i,done=active&&i<active.step,frame=next?1:done?2:G.reducedMotion?0:Math.floor(G.state.time*1.1+i)%2?3:0;G.drawSprite(c,S.pennant,frame,x,y+4,false);if(i===3)G.drawSprite(c,S.desk,G.prairieSurvey().done?1:0,x,y+4,false);c.save();c.fillStyle='#454f3c';c.font='7px monospace';c.textAlign='left';c.textBaseline='alphabetic';c.fillText(String(i+1),x+3,y-20);if(next){c.strokeStyle='#ffcd75';c.lineWidth=1;c.beginPath();c.arc(x,y,20,0,Math.PI*2);c.stroke();}c.restore();return true;};
 const old=G.openingDrawables;
 G.openingDrawables=c=>{const list=old(c);if(!here())return list;for(const [tx,ty]of [[7,4],[38,5],[7,24],[38,24]])if(G.state.grid[ty][tx].tile==='tree'){const x=tx*16+8,y=ty*16+8;list.push({y,fn:()=>{c.save();const hidden=a=>a&&Math.abs(a.x-x)<24&&a.y<y-12&&a.y>y-60;if(hidden(G.state.player)||(G.state.npcs||[]).some(hidden))c.globalAlpha=Math.min(c.globalAlpha,.35);G.drawSprite(c,G.groveScenery.shelterTree,G.reducedMotion?0:Math.floor(G.state.time*.6+x)%4,x,y+6,false);c.restore();}});}return list;};
})();
