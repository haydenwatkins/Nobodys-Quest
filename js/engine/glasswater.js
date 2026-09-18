/* The prism reveals a straight road through the mirage shelf, not a gate bypass. */
"use strict";
(() => {
 const map="glasswaterDesert",reward="glasswater-meridian",x=23*16+8,y=6*16+8;
 const has=id=>G.state.items.includes(id);
 G.glasswaterSurvey=()=>({prism:has("glasswater-prism"),aligned:has(reward)});
 function restore(){if(G.state.mapId===map&&has(reward))for(const ty of [19,20])for(const tx of [22,23,24])G.state.grid[ty][tx]={tile:"path"};}
 G.events.on("mapEnter",restore);
 function candidate(){const s=G.state;
  if(s.mapId!==map||s.expeditionRun||s.knockout||s.bossCutscene||G.ui.dialogueOpen||has(reward)||Math.hypot(s.player.x-x,s.player.y-y)>28)return null;
  if(s.enemies.some(e=>!e.dead&&!e.def.practice&&Math.hypot(e.x-s.player.x,e.y-s.player.y)<75))return null;
  return {kind:"glasswater-dial",label:has("glasswater-prism")?"Focus the Glasswater Prism":"Read the old sundial",x,y};
 }
 const oldCandidate=G.openingInteractionCandidate,oldInteract=G.tryOpeningInteraction;
 G.openingInteractionCandidate=()=>candidate()||oldCandidate();
 G.tryOpeningInteraction=()=>{if(!candidate())return oldInteract();
  if(!has("glasswater-prism"))G.ui.dialogue("THE BLIND SUNDIAL","A shallow socket points toward the eastern shelf. Bring its prism back and the shadow may remember where the road went.",{accent:"#73eff7"});
  else{G.state.items.push(reward);restore();G.ensureTown().spirit+=6;G.sfx.play("unlock");G.ui.dialogue("A ROAD IN THE GLASS","Light catches the prism. The southern shelf thins into a reflection, leaving a straight road beneath it. The gate beyond still waits for the Lantern Mark.",{accent:"#73eff7"});G.ui.banner("THE TRUE MERIDIAN","Central shortcut revealed · 6 town spirit");G.saveGame();}
  G.input.clearTaps();return true;
 };
 const oldDraw=G.openingDrawables;
 G.openingDrawables=c=>{const list=oldDraw(c);if(G.state.mapId!==map)return list;
  list.push({y:y+3,fn:()=>{c.save();c.fillStyle="#625568";c.fillRect(x-14,y-5,28,9);c.fillStyle="#d6c5aa";c.fillRect(x-12,y-8,24,6);c.fillStyle="#837892";c.fillRect(x-2,y-19,4,13);
   if(has(reward)){c.fillStyle="#73eff7";c.beginPath();c.moveTo(x,y-28);c.lineTo(x+6,y-19);c.lineTo(x,y-12);c.lineTo(x-6,y-19);c.closePath();c.fill();c.fillStyle="#fff3c2";c.fillRect(x-1,y-24,2,7);}
   else{c.strokeStyle="#ffcd75";c.strokeRect(x-5,y-24,10,10);}c.restore();}});
  for(const ty of [10,14,18,22,26]){const py=ty*16+8;list.push({y:py,fn:()=>{c.save();c.fillStyle=has(reward)?"#73eff7":"#9e899b";c.fillRect(x-2,py-1,4,2);c.fillRect(x-1,py-3,2,6);c.restore();}});}
  return list;
 };
})();
