/* Four mooring posts keep the Breakwater Bastion's native solid cover. */
"use strict";
(()=>{
 const here=()=>G.state&&G.state.mapId==='turtleTrial',S=G.bastionScenery,rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 G.drawBastionTile=(c,cell,x,y)=>{if(!here()||!['floor','wall','rock'].includes(cell.tile))return false;const px=x*16,py=y*16,r=G.util.hash2(x+227,y+461)*2,patch=G.util.hash2(Math.floor(x/4)+173,Math.floor(y/3)+293)*2;rect(c,px,py,16,16,['#979c88','#9ea38f','#8f9683'][Math.floor(patch*3)]);if(cell.tile==='wall')G.drawSprite(c,S.wall,Math.floor(r*4),px+8,py+16,false);else{if(y%3===0)rect(c,px,py,16,1,'#818978');if(x%4===0)rect(c,px,py,1,16,'#818978');if(r>.82){rect(c,px+4,py+10,5,1,'#b0b5a0');rect(c,px+9,py+11,3,1,'#939a88');}}return true;};
 G.drawBastionPortal=(c,cell,x,y)=>{if(!here()||!cell.portal)return false;G.drawSprite(c,S.returnStep,0,x*16+8,y*16+16,false);return true;};
 G.drawBastionNotice=(c,cell,x,y)=>{if(!here()||!cell.message)return false;G.drawSprite(c,S.notice,0,x*16+8,y*16+16,false);return true;};
 G.drawBastionCache=(c,ch)=>{if(!here())return false;const x=ch.x*16+8,y=ch.y*16+16;G.drawSprite(c,S.biscuitTin,ch.opened?1:0,x,y,false);if(ch.food&&ch.opened){const progress=1-Math.min(1,Math.max(0,(ch.readyAt||0)-Date.now())/G.PANTRY_REFILL_MS);rect(c,x-10,y-5,20,1,'#3e4c4c');rect(c,x-10,y-5,Math.round(20*progress),1,'#b0cfc0');}return true;};
 G.drawBastionShell=(c,pr)=>{if((!here()&&G.state?.mapId!=='gauntletArena')||pr.fromPlayer||pr.shape!=='shell'||pr.owner?.def?.id!=='admiralTortoise')return false;G.drawSprite(c,S.combatShell,0,Math.round(pr.x)+.5,Math.round(pr.y-4)+3,false);return true;};
 const old=G.openingDrawables;
 G.openingDrawables=c=>{const list=old(c);if(!here())return list;const prop=(id,x,y,depth)=>list.push({y:depth,fn:()=>{c.save();const m=G.spriteMetrics(S[id]),hidden=a=>a&&Math.abs(a.x-x)<m.w/2+12&&a.y<y+4&&a.y>y-m.h-2;if(hidden(G.state.player)||(G.state.npcs||[]).some(hidden))c.globalAlpha*=.35;G.drawSprite(c,S[id],0,x,y,false);c.restore();}});for(let ty=0;ty<G.state.mapH;ty++)for(let tx=0;tx<G.state.mapW;tx++)if(G.state.grid[ty][tx].tile==='rock')prop('mooringPost',tx*16+8,ty*16+16,ty*16+15);for(const [id,tx,bottom]of [['harborChart',7,40],['stormShutters',19,40]])prop(id,tx*16+8,bottom,16);return list;};
})();
