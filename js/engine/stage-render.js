/* Four painted travel cases preserve the native solid cover and stage routes. */
"use strict";
(()=>{
 const here=()=>G.state&&G.state.mapId==='jesterTrial',S=G.stageScenery,rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 G.drawStageTile=(c,cell,x,y)=>{if(!here()||!['floor','wall','rock'].includes(cell.tile))return false;const px=x*16,py=y*16,r=G.util.hash2(x+419,y+239)*2,patch=G.util.hash2(Math.floor(x/5)+127,Math.floor(y/4)+89)*2;rect(c,px,py,16,16,['#82696a','#8b716f','#7b6467'][Math.floor(patch*3)]);if(cell.tile==='wall')G.drawSprite(c,S.wall,Math.floor(r*4),px+8,py+16,false);else{if(y%2===0)rect(c,px,py,16,1,'#715a61');if(r>.75){rect(c,px+5,py+9,6,1,'#9b817b');rect(c,px+10,py+10,3,1,'#715a61');}}return true;};
 G.drawStagePortal=(c,cell,x,y)=>{if(!here()||!cell.portal)return false;G.drawSprite(c,S.returnStep,0,x*16+8,y*16+16,false);return true;};
 G.drawStageNotice=(c,cell,x,y)=>{if(!here()||!cell.message)return false;G.drawSprite(c,S.notice,0,x*16+8,y*16+16,false);return true;};
 G.drawStageCache=(c,ch)=>{if(!here())return false;const x=ch.x*16+8,y=ch.y*16+16;G.drawSprite(c,S.custardPantry,ch.opened?1:0,x,y,false);if(ch.food&&ch.opened){const progress=1-Math.min(1,Math.max(0,(ch.readyAt||0)-Date.now())/G.PANTRY_REFILL_MS);rect(c,x-10,y-5,20,1,'#463b4c');rect(c,x-10,y-5,Math.round(20*progress),1,'#aac1af');}return true;};
 // Keep the original flight (16x11) and impact (24x16) footprints.
 G.drawStagePie=(c,x,y,impact=false)=>{if(!here()&&G.state?.mapId!=="gauntletArena")return false;G.drawSprite(c,impact?S.pieImpact:S.combatPie,0,x,y+(impact?8:3),false);return true;};
 const old=G.openingDrawables;
 G.openingDrawables=c=>{const list=old(c);if(!here())return list;for(let ty=0;ty<G.state.mapH;ty++)for(let tx=0;tx<G.state.mapW;tx++)if(G.state.grid[ty][tx].tile==='rock'){const x=tx*16+8,y=ty*16+16;list.push({y:y-1,fn:()=>{c.save();const hidden=a=>a&&Math.abs(a.x-x)<17&&a.y<y&&a.y>y-38;if(hidden(G.state.player)||(G.state.npcs||[]).some(hidden))c.globalAlpha*=.35;G.drawSprite(c,S.propCase,0,x,y,false);c.restore();}});}for(const [id,tx,bottom]of [['curtain',9,44],['curtain',18,44],['curtain',24,44],['poster',5,32]]){const x=tx*16+8,y=bottom;list.push({y:16,fn:()=>{c.save();const hidden=a=>a&&Math.abs(a.x-x)<26&&a.y<y&&a.y>y-42;if(hidden(G.state.player)||(G.state.npcs||[]).some(hidden))c.globalAlpha*=.35;G.drawSprite(c,S[id],0,x,y,false);c.restore();}});}return list;};
})();
