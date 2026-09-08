// The Last Light uses durable milestones. Presentation may replay after a reload,
// but no story progress depends on a timer or a rendered frame.
export const PROLOGUE_STATES=['arrival','landingThreat','coupling','crossing','briefing','complete'];
export const PROLOGUE_TEXT={
 arrival:'Veyr! Their boat is drifting—help them get ashore!',
 threat:'The landing platform is blocked. Clear a path to the cable reel.',
 inspect:'Scrap is caught in the cable reel. Break it loose!',
 safe:'They are safe. Thank you.',
 engine:'That machine keeps our island in the air. If it stops, we fall into the storm.',
 exit:'The repair stations are marked on your chart. Take whichever road you trust.'
};
export const PROLOGUE_DIALOGUE=[
 {speaker:'Veyr',text:'The whole island shook. What is happening?'},
 {speaker:'Sera Vale',text:'That machine keeps our island in the air. If it stops, we fall into the storm.'},
 {speaker:'Sera Vale',text:'We call it the Storm Engine. You used to help keep it running.'},
 {speaker:'Veyr',text:'It never used to fight us.'},
 {speaker:'Sera Vale',text:'The part that keeps its power steady broke apart. The repair crews carried three pieces to their stations. Then the other machines turned on them.'},
 {speaker:'Veyr',text:'Bring back the pieces. Get the engine under control.'},
 {speaker:'Sera Vale',text:'Your suit can get you inside. I have to stay here and bring the boats in.'},
 {speaker:'Veyr',text:'How many people are still out there?'},
 {speaker:'Sera Vale',text:'Too many. Save the island, and they will have somewhere to come home to.'},
 {speaker:'Veyr',text:'Keep a light for us.'}
];
export const PROLOGUE_TARGETS={
 dock:{id:'dock-reel',x:0,z:19,name:'Cable reel',area:'The Last Anchorage',radius:4.6,type:'prologue'},
 jam:{id:'cable-jam',x:2.7,z:18.1,name:'Jammed scrap',area:'The Last Anchorage',radius:1,type:'prologue'},
 sera:{id:'sera',x:-7,z:20,name:'Sera Vale',area:'The Last Anchorage',radius:3.5,type:'npc'},
 exit:{id:'exit',x:0,z:10,name:'The north road',area:'The Cinder March',radius:6,type:'prologue'}
};
export function hasSubstantiveProgress(p={}){
 return !!(p.briefed||p.won||p.returned||p.rescueBriefed||p.rescueWon||p.rescueDone||
  (Array.isArray(p.teeth)&&p.teeth.length)||(Array.isArray(p.defeated)&&p.defeated.length)||
  (Array.isArray(p.caches)&&p.caches.length)||(Array.isArray(p.relays)&&p.relays.length)||(Array.isArray(p.relayStarted)&&p.relayStarted.length));
}
export function migratedPrologue(p={}){
 if(PROLOGUE_STATES.includes(p.prologue))return p.prologue;
 return hasSubstantiveProgress(p)?'complete':'arrival';
}

// Short radio acknowledgements also remain available from Sera and on the chart.
export const REGULATOR_LINES=[
 'One piece seated in your suit. Its light is holding. Bring the other two home.',
 'Two lights, Veyr. The repair crews did their part. One piece left.',
 'All three pieces fit. The Keelbreaker guards the engine controls. Clear it, and we can steady the island.'
];
export const CROSSING_DURATION=6.5;
