/* Six old-save rooms keep their native routes; their rulers remain outside. */
"use strict";
(()=>{
 const S=G.worldbackScenery,rooms={
  griffinWorldback:{cover:'wingCase',bench:'windDesk',floor:['#958971','#9c9078','#91856d'],grain:'#b3a78e'},
  golemWorldback:{cover:'stoneCrate',bench:'masonBench',floor:['#858c7d','#8b9283','#818879'],grain:'#a3ab99'},
  weaverWorldback:{cover:'threadBasket',bench:'loom',floor:['#857e8c','#8b8492','#817a88'],grain:'#a39aaa'},
  bellWorldback:{cover:'bellBox',bench:'bellRack',floor:['#7c8e94','#82949a','#788a90'],grain:'#a1b6ba'},
  lanternWorldback:{cover:'lampBox',bench:'lampShelf',floor:['#81898d','#878f93','#7d8589'],grain:'#a7b4b8'},
  colossusWorldback:{cover:'heartStone',bench:'memoryCabinet',floor:['#8d8679','#938c7f','#898275'],grain:'#b1a999'},
 };
 const here=()=>rooms[G.state?.mapId];
 G.isAuthoredWorldback=()=>!!here();
 const rect=(c,x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
 const yieldAt=(c,sprite,x,y,fn)=>{c.save();const m=G.spriteMetrics(sprite),hidden=a=>a&&Math.abs(a.x-x)<m.w/2+9&&a.y>y-m.h-2&&a.y<y+4;if(hidden(G.state.player)||(G.state.npcs||[]).some(hidden))c.globalAlpha*=.35;fn();c.restore();};
 G.drawWorldbackTile=(c,cell,x,y)=>{const room=here();if(!room||!['floor','wall','rock'].includes(cell.tile))return false;const px=x*16,py=y*16,r=G.util.hash2(x+701,y+217)*2,patch=G.util.hash2(Math.floor(x/4)+181,Math.floor(y/3)+283)*2;rect(c,px,py,16,16,room.floor[Math.floor(patch*3)]);if(cell.tile==='wall')G.drawSprite(c,S.wall,Math.floor(r*4),px+8,py+16,false);else{if(y%4===0)rect(c,px,py+15,16,1,room.floor[2]);if(r>.87)rect(c,px+5,py+10,5,1,room.grain);}return true;};
 G.drawWorldbackPortal=(c,cell,x,y)=>{if(!here()||!cell.portal)return false;G.drawSprite(c,S.returnStep,0,x*16+8,y*16+16,false);return true;};
 G.drawWorldbackNotice=(c,cell,x,y)=>{if(!here()||!cell.message)return false;const px=x*16+8,py=y*16+16;yieldAt(c,S.notice,px,py,()=>G.drawSprite(c,S.notice,0,px,py,false));return true;};
 const old=G.openingDrawables;
 G.openingDrawables=c=>{const list=old(c),room=here();if(!room)return list;const prop=(id,x,y,depth,frame=0)=>list.push({y:depth,fn:()=>yieldAt(c,S[id],x,y,()=>G.drawSprite(c,S[id],frame,x,y,false))});for(let y=0;y<G.state.mapH;y++)for(let x=0;x<G.state.mapW;x++){const cell=G.state.grid[y][x];if(cell.tile==='rock')prop(room.cover,x*16+8,y*16+16,y*16+15);if(cell.rest)prop('restBench',x*16+8,y*16+16,y*16+15,G.state.lastRest===cell?1:0);}prop(room.bench,31*16+8,12*16,12*16-1);return list;};
})();
