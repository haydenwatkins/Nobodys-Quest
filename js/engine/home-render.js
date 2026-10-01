/* Presentation-only housing. Native plots, rest, pantry and portals remain authoritative. */
"use strict";
(()=>{
 const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 G.drawSettlementHomes=c=>{const s=G.state;if(s.mapId!=='town')return false;const S=G.homeScenery;let minX=Infinity,minY=Infinity,maxX=-1,maxY=-1;
  for(let y=0;y<s.mapH;y++)for(let x=0;x<s.mapW;x++){const cell=s.grid[y][x];if(cell.playerHouse){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}if(cell.townPlot){const built=G.townHouseBuilt(cell.townPlot),v=(cell.townPlot.charCodeAt(0)-97)%4;G.drawSprite(c,built?S['cottage'+v]:S.plot,0,x*16+8,y*16+16,false);}}
  if(maxX>=0)G.drawSprite(c,S.home,0,(minX+maxX+1)*8,minY*16+(maxY-minY+1)*16+16,false);return true;
 };
 G.drawHomeTile=(c,cell,x,y)=>{const s=G.state;if(s.mapId!=='playerHouse')return false;const px=x*16,py=y*16,r=G.util.hash2(x,y),S=G.homeScenery;
  if(cell.tile==='wall'){rect(c,px,py,16,16,'#d6c8ab');if(y===0||y===s.mapH-1){rect(c,px,py+8,16,8,'#796050');rect(c,px,py+8,16,1,'#ae8b65');rect(c,px+3,py+10,1,6,'#604d43');}else{const edge=x===0?8:0;rect(c,px+edge,py,8,16,'#796050');rect(c,px+(x===0?15:0),py,1,16,'#ae8b65');rect(c,px+edge+3,py,1,16,'#604d43');}if(r>.7)rect(c,px+3,py+3,3,1,'#bbae94');}
  else{rect(c,px,py,16,16,(x+y)%3===0?'#a18061':'#a88969');rect(c,px,py+15,16,1,'#84674f');if((x+y)%3===0)rect(c,px+6,py,1,15,'#947255');if(r>.65){rect(c,px+10,py+7,3,1,'#8b6b50');rect(c,px+11,py+8,1,2,'#bb9973');}
  }return true;
 };
 G.drawHomeRoom=c=>{const s=G.state;if(s.mapId!=='playerHouse')return;const S=G.homeScenery;G.drawSprite(c,S.rug,0,120,129,false);for(const x of [56,184])G.drawSprite(c,S.window,0,x,16,false,.85);for(let y=0;y<s.mapH;y++)for(let x=0;x<s.mapW;x++){const cell=s.grid[y][x],px=x*16+8,py=y*16+16;if(cell.tile==='rock')G.drawSprite(c,x<8?S.desk:S.shelf,0,px,py,false,1.5);if(cell.rest)G.drawSprite(c,S.bed,0,px,py,false,1.5);if(cell.portal)G.drawSprite(c,S.doorMat,0,px,py,false);}};
 G.drawHomePantry=(c,ch)=>{if(G.state.mapId!=='playerHouse')return false;G.drawSprite(c,G.homeScenery[ch.opened?'pantryEmpty':'pantryReady'],0,ch.x*16+8,ch.y*16+16,false);if(ch.opened){const progress=1-Math.min(1,Math.max(0,(ch.readyAt||0)-Date.now())/G.PANTRY_REFILL_MS);rect(c,ch.x*16+3,ch.y*16+14,10,1,'#30383c');rect(c,ch.x*16+3,ch.y*16+14,Math.round(10*progress),1,'#90a4ac');}return true;};
})();
