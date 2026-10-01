/* Art follows the Mason's native channel crossings and saved Stone Mark. */
"use strict";
(()=>{
 const here=()=>G.state&&G.state.mapId==='hangingGardens',S=G.gardensScenery,water=['#4b7879','#7da19a','#bad0bd'];
 const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 G.gardensWaterColors=()=>here()?water:null;
 G.drawGardensTile=(c,cell,x,y,time)=>{if(!here()||!['grass','path','rock','tree','water'].includes(cell.tile))return false;const px=x*16,py=y*16,r=G.util.hash2(x+201,y+163)*2,patch=G.util.hash2(Math.floor(x/5)+71,Math.floor(y/4)+97)*2;
  if(cell.tile==='water'){rect(c,px,py,16,16,patch>.65?'#527f7e':water[0]);if(r>.6){rect(c,px+3,py+7,7,1,water[1]);if(!G.reducedMotion)rect(c,px+9,py+12+Math.floor(Math.sin(time*.7+x)*1.1),4,1,water[1]);}return true;}
  rect(c,px,py,16,16,cell.tile==='path'?['#adb9a3','#b7c0ad','#a6b49e'][Math.floor(patch*3)]:['#789274','#819a7a','#728b70'][Math.floor(patch*3)]);
  if(cell.tile==='rock')G.drawSprite(c,S.wall,Math.floor(r*4),px+8,py+16,false);else if(cell.tile==='tree')G.drawSprite(c,S.hedge,Math.floor(r*4),px+8,py+16,false);else if(cell.tile==='grass'&&r>.93)G.drawSprite(c,S.tuft,Math.floor(r*4),px+8,py+16,false);else if(cell.tile==='path'&&r>.6){rect(c,px+4,py+8,7,1,'#c8cfb7');rect(c,px+11,py+11,2,1,'#819185');}return true;
 };
 G.drawGardensPortal=(c,cell,x,y)=>{if(!here()||!cell.portal)return false;c.save();if(x===0){c.translate(x*16+8,y*16+16);c.scale(-1,1);G.drawSprite(c,S.roadStep,0,0,0,false);}else G.drawSprite(c,S.roadStep,0,x*16+8,y*16+16,false);c.restore();return true;};
 G.drawGardensNotice=(c,cell,x,y)=>{if(!here()||!cell.message)return false;G.drawSprite(c,S.notice,0,x*16+8,y*16+16,false);return true;};
 G.drawGardensCache=(c,ch)=>{if(!here()||ch.chest?.item!=='garden-keystone')return false;G.drawSprite(c,S.cache,ch.opened?1:0,ch.x*16+8,ch.y*16+16,false);return true;};
 G.drawGardensPost=(c,post,awake,near)=>{if(!here())return false;G.drawSprite(c,G.greenfieldScenery[awake?'postAwake':'postSleeping'],0,Math.round(post.x),Math.round(post.y)+6,false);if(near){rect(c,post.x-9,post.y-20,18,1,'#d4d8bb');rect(c,post.x-9,post.y-20,1,4,'#d4d8bb');rect(c,post.x+8,post.y-20,1,4,'#d4d8bb');}return true;};
 G.drawGardensFence=(c,fence)=>here()?G.drawCaravanFence(c,fence):false;
 G.drawGardensCamp=(c,time)=>here()?G.drawCaravanCamp(c,time):false;
 function yielding(c,s,x,y,range){c.save();const behind=a=>a&&Math.abs(a.x-x)<range&&a.y<y&&a.y>y-(s==='arch'?43:50);if(behind(G.state.player,x,y)||(G.state.npcs||[]).some(behind))c.globalAlpha=Math.min(c.globalAlpha,.35);G.drawSprite(c,S[s],G.reducedMotion?0:Math.floor(G.state.time*.3+x)%4,x,y,false);c.restore();}
 G.drawGardenArch=(c,x,y)=>{if(!here())return false;yielding(c,'arch',x,y+4,35);return true;};
 G.drawGardenPlanter=(c,x,y)=>{if(!here())return false;yielding(c,'planter',x,y+4,18);return true;};
 G.drawGardenRaisedStep=(c,x,y)=>{if(!here())return false;G.drawSprite(c,S.raisedStep,0,x,y+8,false);return true;};
 const old=G.openingDrawables;
 G.openingDrawables=c=>{const list=old(c);if(!here())return list;for(const [tx,ty]of [[12,4],[28,4],[13,25],[28,26]])if(G.state.grid[ty][tx].tile==='tree'){const x=tx*16+8,y=ty*16+8;list.push({y,fn:()=>yielding(c,'topiary',x,y+6,19)});}return list;};
})();
