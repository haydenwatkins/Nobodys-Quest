/* Give the continuing bead a road, then use rebuilt ground for your own. */
"use strict";
(() => {
 G.registerGuardianAuthor('godAvatar',{actions:{meridianRoad(owner,p,spawn){
  let fault,silk;
  const remember=(e,kind,options)=>{const h=spawn(e,kind,options);if(kind==='atlasFault')fault=h;if(kind==='silkRoute')silk=h;return h;};
  G.runGuardianLesson('lastWorldbearer',owner,p,'atlasFault',remember);
  if(!fault)return;
  const gap=fault.gaps[0],center={x:(gap.left+gap.right)/2,y:(gap.top+gap.bottom)/2},along=fault.vertical?{x:p.x<center.x?1:-1,y:0}:{x:0,y:p.y<center.y?1:-1};
  for(const side of [1,-1]){
   const direction={x:along.x*side,y:along.y*side};
   const perpendicular={x:-direction.y,y:direction.x};
   G.runGuardianLesson('silkMatriarch',owner,p,'silkRoute',remember,{junction:{x:center.x-direction.x*48,y:center.y-direction.y*48},along:direction,forward:80,second:{junction:{x:center.x-perpendicular.x*48,y:center.y-perpendicular.y*48},along:perpendicular,forward:80}});
   if(silk)break;
  }
  if(!silk){fault.cancelled=true;for(const stone of fault.stones)stone.dead=true;G.state.bossHazards=G.state.bossHazards.filter(h=>h!==fault);owner.bossRecoverT=1;return;}
  // The real connected path determines the paired phrase's duration. Its
  // footing cannot disappear before the bead reaches the chosen crossing.
  const end=Math.max(fault.warning+fault.active,silk.warning+silk.active);
  fault.active=end-fault.warning;owner.bossRecoverT=end+.8;
 }}});
})();
