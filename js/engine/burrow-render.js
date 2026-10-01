/* Rooted cover fits the four native rocks; workshop furniture is cosmetic. */
"use strict";
(()=>{
 const here=()=>G.state&&G.state.mapId==='moleTrial',S=G.burrowScenery,rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 G.drawBurrowTile=(c,cell,x,y)=>{if(!here()||!['floor','wall','rock'].includes(cell.tile))return false;const px=x*16,py=y*16,r=G.util.hash2(x+281,y+137)*2,patch=G.util.hash2(Math.floor(x/5)+73,Math.floor(y/4)+157)*2;rect(c,px,py,16,16,['#a5927c','#ac9981','#9f8c78'][Math.floor(patch*3)]);if(cell.tile==='wall')G.drawSprite(c,S.wall,Math.floor(r*4),px+8,py+16,false);else if(r>.5){rect(c,px+4,py+10,5,1,'#b4a18a');rect(c,px+9,py+11,2,1,'#917f6c');if(r>.85)rect(c,px+7,py+4,2,1,'#c4ae8c');}return true;};
 G.drawBurrowPortal=(c,cell,x,y)=>{if(!here()||!cell.portal)return false;G.drawSprite(c,S.returnStep,0,x*16+8,y*16+16,false);return true;};
 G.drawBurrowNotice=(c,cell,x,y)=>{if(!here()||!cell.message)return false;G.drawSprite(c,S.notice,0,x*16+8,y*16+16,false);return true;};
 G.drawBurrowCache=(c,ch)=>{if(!here())return false;const x=ch.x*16+8,y=ch.y*16+16;G.drawSprite(c,S.shortbread,ch.opened?1:0,x,y,false);if(ch.food&&ch.opened){const progress=1-Math.min(1,Math.max(0,(ch.readyAt||0)-Date.now())/G.PANTRY_REFILL_MS);rect(c,x-10,y-5,20,1,'#493e3c');rect(c,x-10,y-5,Math.round(20*progress),1,'#b2c0a0');}return true;};
 const old=G.openingDrawables;
 G.openingDrawables=c=>{const list=old(c);if(!here())return list;for(let ty=0;ty<G.state.mapH;ty++)for(let tx=0;tx<G.state.mapW;tx++)if(G.state.grid[ty][tx].tile==='rock'){const x=tx*16+8,y=ty*16+16;list.push({y:y-1,fn:()=>{c.save();const hidden=a=>a&&Math.abs(a.x-x)<14&&a.y<y&&a.y>y-30;if(hidden(G.state.player)||(G.state.npcs||[]).some(hidden))c.globalAlpha*=.35;G.drawSprite(c,S.rootStone,0,x,y,false);c.restore();}});}for(const [id,tx,bottom]of [['tools',9,32],['oven',18,40]]){const x=tx*16+8,y=bottom;list.push({y:16,fn:()=>{c.save();const hidden=a=>a&&Math.abs(a.x-x)<26&&a.y<y&&a.y>y-38;if(hidden(G.state.player)||(G.state.npcs||[]).some(hidden))c.globalAlpha*=.35;G.drawSprite(c,S[id],G.reducedMotion?0:Math.floor(G.state.time*.3)%4,x,y,false);c.restore();}});}return list;};
})();
