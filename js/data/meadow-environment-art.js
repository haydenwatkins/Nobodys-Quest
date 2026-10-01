/* Meadow materials shared deliberately by Greenfield and the settlement.
   The legacy hash occupies [0,.5); expand only cosmetic samples, never global RNG. */
"use strict";
(()=>{
 const A=G.authoredPixelArt,S=G.meadowScenery={},pal={k:'#30463b',a:'#40593f',b:'#5d744b',c:'#82945f',d:'#abb77a',e:'#53443b',f:'#85644a',g:'#b49167',h:'#cfc79a',i:'#dfc69a',j:'#a87270'};
 S.hedge=A.compactSprite(A.authored(32,32,pal,(g,v)=>{g.poly([[12,31],[13,23],[19,23],[20,31]],'e');g.rect(15,25,3,6,'f');g.line(16,26,16,29,'g',1);for(const [x,y,rx,ry]of [[10,14,9,8],[22,15,8,8],[16,7,10,6],[16,20,11,7]]){g.ellipse(x,y,rx,ry,'k');g.ellipse(x-1,y-1,rx-1,ry-1,'a');g.ellipse(x-2,y-2,rx-3,ry-2,'b');g.ellipse(x-3,y-ry+3,4,2,'c');g.put(x-4,y-ry+2,'d');g.line(x+3,y+2,x+5,y+1,'b',1);}g.put(7+v*3,13+v,'c');}));
 S.herbs=A.compactSprite(A.authored(32,32,pal,(g,v)=>{const x=7+v*4,y=14+(v%2)*6;g.line(x,y,x,y+5,'a',1);g.ellipse(x-2,y+1,2,1,'c');g.ellipse(x+2,y-1,2,1,'b');g.put(x-2,y,'d');g.line(x+9,y+6,x+9,y+2,'b',1);g.put(x+10,y+2,'c');if(v===3){g.ellipse(x+1,y-3,2,2,'j');g.put(x+1,y-3,'i');}}));
 S.notice=A.compactSprite(A.authored(32,38,pal,g=>{g.rect(14,15,5,22,'e');g.line(15,17,15,35,'g',1);g.rect(1,2,30,24,'e');g.rect(3,4,26,20,'f');g.rect(5,6,22,16,'h');for(const [y,w]of [[10,16],[14,12],[18,14]])g.line(8,y,8+w,y,'f',1);g.put(3,4,'g');g.put(28,23,'g');}));
 G.drawMeadowNotice=(c,cell,x,y)=>{if(!here()||!cell.message)return false;G.drawSprite(c,S.notice,0,x*16+8,y*16+16,false);return true;};
 const here=()=>G.state&&(G.state.mapId==='town'||G.state.mapId==='overworld');
 G.meadowGroundColor=(kind,x,y)=>{if(!here()||!['grass','path'].includes(kind))return null;const r=G.util.hash2(Math.floor((x+(Math.floor(y/4)%2)*2)/5)+71,Math.floor(y/4)+43)*2;return (kind==='path'?['#b29c73','#b9a77f','#b5a079']:['#71835c','#7a8b64','#758660'])[r<.3?0:r>.76?1:2];};
 G.drawMeadowTile=(c,cell,x,y)=>{if(!here()||!['grass','path','tree'].includes(cell.tile))return false;const px=x*16,py=y*16,r=G.util.hash2(x,y)*2;c.fillStyle=G.meadowGroundColor(cell.tile==='path'?'path':'grass',x,y);c.fillRect(px,py,16,16);
  if(cell.tile==='tree')G.drawSprite(c,S.hedge,Math.floor(r*4),px+8,py+16,false);
  else if(cell.tile==='grass'&&r>.82)G.drawSprite(c,S.herbs,r>.96?3:Math.floor(G.util.hash2(x+131,y+19)*6),px+8,py+16,false);
  else if(cell.tile==='path'&&r>.45){c.fillStyle='#998365';c.fillRect(px+3+Math.floor(r*6),py+6,3,1);c.fillStyle='#d1bc91';c.fillRect(px+4+Math.floor(r*6),py+5,G.hdPilot?1.5:2,G.hdPilot ? .5 : 1);if(r>.8){c.fillStyle='#a7926e';c.fillRect(px+11,py+11,1,1);}}
  return true;
 };
})();

