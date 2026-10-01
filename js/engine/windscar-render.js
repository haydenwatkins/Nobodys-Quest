/* Native cliff shelves and wind landings keep their original travel geometry. */
"use strict";
(()=>{
 const here=()=>G.state&&G.state.mapId==='windscarCanyon',S=G.windscarScenery;
 const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 G.drawWindscarTile=(c,cell,x,y)=>{if(!here()||!['grass','path','rock'].includes(cell.tile))return false;const px=x*16,py=y*16,r=G.util.hash2(x+173,y+113)*2,patch=G.util.hash2(Math.floor(x/5)+41,Math.floor(y/4)+71)*2;
  rect(c,px,py,16,16,cell.tile==='path'?['#cfb28d','#d8c099','#c4a987'][Math.floor(patch*3)]:['#b69276','#bd9b7e','#aa886f'][Math.floor(patch*3)]);if(cell.tile==='rock'){G.drawSprite(c,S.cliff,Math.floor(r*4),px+8,py+16,false);const rock=(xx,yy)=>G.state.grid[yy]?.[xx]?.tile==='rock';if(!rock(x,y-1))rect(c,px,py,16,1,'#d8b18c');if(!rock(x,y+1))rect(c,px,py+15,16,1,'#654b45');if(!rock(x-1,y))rect(c,px,py,1,16,'#654b45');if(!rock(x+1,y))rect(c,px+15,py,1,16,'#654b45');}else if(cell.tile==='grass'&&r>.92)G.drawSprite(c,S.tuft,Math.floor(G.util.hash2(x+19,y+131)*8),px+8,py+16,false);else if(cell.tile==='path'&&r>.6){rect(c,px+3,py+8,5,1,'#e3caa5');rect(c,px+11,py+11,2,1,'#b4997e');}return true;
 };
 G.drawWindscarPortal=(c,cell,x,y)=>{if(!here()||!cell.portal)return false;c.save();if(x===0){c.translate(x*16+8,y*16+16);c.scale(-1,1);G.drawSprite(c,S.roadStep,0,0,0,false);}else G.drawSprite(c,S.roadStep,0,x*16+8,y*16+16,false);c.restore();return true;};
 G.drawWindscarNotice=(c,cell,x,y)=>{if(!here()||!cell.message)return false;G.drawSprite(c,S.notice,0,x*16+8,y*16+16,false);return true;};
 G.drawWindscarCache=(c,ch)=>{if(!here()||ch.chest?.item!=='windscar-feather')return false;G.drawSprite(c,S.cache,ch.opened?1:0,ch.x*16+8,ch.y*16+16,false);return true;};
 G.drawWindscarPost=(c,post,awake,near)=>{if(!here())return false;G.drawSprite(c,G.greenfieldScenery[awake?'postAwake':'postSleeping'],0,Math.round(post.x),Math.round(post.y)+6,false);if(near){rect(c,post.x-9,post.y-20,18,1,'#d0b58b');rect(c,post.x-9,post.y-20,1,4,'#d0b58b');rect(c,post.x+8,post.y-20,1,4,'#d0b58b');}return true;};
 G.drawWindscarFence=(c,fence)=>here()?G.drawCaravanFence(c,fence):false;
 G.drawWindscarCamp=(c,time)=>here()?G.drawCaravanCamp(c,time):false;
 G.drawWindscarLift=(c,x,y,active,index)=>{if(!here())return false;G.drawSprite(c,S.windLift,active?(G.reducedMotion?1:1+Math.floor(G.state.time*1.2)%2):0,x,y+6,false);c.save();c.fillStyle=active?'#d5e2d5':'#ece0b6';const dy=index?1:-1;c.fillRect(x,y-1,1,5);c.fillRect(x-2,y+(dy<0?-1:3),5,1);c.fillRect(x-1,y+(dy<0?-2:4),3,1);c.restore();return true;};
 // The fresh road art also covers the saved bloom in the three earlier guardian regions.
 G.drawRestoredRoadDetail=(c,d)=>{if(!['windscarCanyon','mistwood','sunkenMarsh','emberRidge'].includes(G.state.mapId))return false;const x=Math.round(d.x),y=Math.round(d.y),frame=Math.floor(G.util.hash2(x+31,y+17)*8);G.drawSprite(c,d.kind==='lantern'?G.townScenery.lantern:d.kind==='sprout'?(here()?S.tuft:G.mistwoodScenery.fern):G.groveScenery.flower,frame,x,y+3,false);return true;};
 const old=G.openingDrawables;
 G.openingDrawables=c=>{const list=old(c);if(!here())return list;for(const [tx,ty]of [[15,5],[27,19],[28,24],[36,4]])if(G.state.grid[ty][tx].tile==='rock'){const x=tx*16+8,y=ty*16+8;list.push({y,fn:()=>{c.save();const hidden=a=>a&&Math.abs(a.x-x)<28&&a.y<y-8&&a.y>y-38;if(hidden(G.state.player)||(G.state.npcs||[]).some(hidden))c.globalAlpha=Math.min(c.globalAlpha,.35);G.drawSprite(c,S.scarp,G.reducedMotion?0:Math.floor(G.state.time*.25+tx)%4,x,y,false);c.restore();}});}return list;};
})();
