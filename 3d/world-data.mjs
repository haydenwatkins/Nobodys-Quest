// Project-authored world geometry and encounter data. No source-game content is loaded.
export const RADIUS=76, SAVE_KEY='veyr.storm-engine.v1';
export const WEAPONS={
 shear:{name:'Cinder edge',tag:'CUT / CARRY',damage:22,reach:4.5,width:3.3,windup:.10,recovery:.26,speed:8.7,color:0xff9b54,vent:'Furnace cut',description:'Three sweeping cuts. The final strike breaks posture. Vent pressure into a blazing cross-cut.'},
 pike:{name:'Arc lance',tag:'LINE / PIERCE',damage:29,reach:7.4,width:1.1,windup:.17,recovery:.35,speed:8.2,color:0x6fe6ed,vent:'Rail discharge',description:'Long, narrow thrusts pierce a line of enemies. Vent a bolt through the entire lane.'},
 maul:{name:'Keel hammer',tag:'WEIGHT / BREAK',damage:57,reach:4.8,width:3,windup:.32,recovery:.53,speed:7.4,color:0xffca72,vent:'Fault driver',description:'Commit to a heavy overhead blow. Vent a chain of ground fractures straight ahead.'}
};
export const ENEMIES={
 mite:{name:'Scissor mite',hp:65,damage:10,speed:4.4,reach:3.4,width:2,windup:.7,recovery:.6,cooldown:1.4,aggro:13,posture:42,radius:.8},
 dredger:{name:'Iron dredger',hp:145,damage:19,speed:2.7,reach:5,width:3.5,windup:1.05,recovery:.8,cooldown:2.2,aggro:14,posture:65,radius:1.3},
 kite:{name:'Coil kite',hp:75,damage:12,speed:3.7,reach:13,width:1,windup:.9,recovery:.45,cooldown:2.1,aggro:16,posture:35,radius:.8},
 engine:{name:'The Keelbreaker',hp:1050,damage:27,speed:2.8,reach:10,width:5,windup:1.4,recovery:1.2,cooldown:2.2,aggro:24,posture:160,radius:2.2}
};
export const LANDMARKS=[
 {id:'sera',name:'Sera Vale',area:'The Last Anchorage',x:-7,z:20,type:'npc',radius:3.5},
 {id:'bench',name:'Repair rig',area:'The Last Anchorage',x:5,z:25,type:'bench',radius:3},
 {id:'chart',name:'Read the field chart',area:'The Cinder March',x:5,z:9,type:'chart',radius:3},
 {id:'west',name:'Recover the governor tooth',area:'Blackglass Cut',x:-33,z:-7,type:'station',radius:3.3},
 {id:'north',name:'Recover the governor tooth',area:'The Severed Spire',x:26,z:-17,type:'station',radius:3.3},
 {id:'east',name:'Recover the governor tooth',area:'The Copper Reaches',x:30,z:22,type:'station',radius:3.3},
 {id:'engine',name:'The Keelbreaker',area:'The Engine Scar',x:0,z:-36,type:'boss',radius:8},
 {id:'oren',name:'Oren Flint',area:'Blackglass Cut',x:-23,z:0,type:'npc',radius:3},
 {id:'cache-a',name:'Salvage the survey case',area:'The Soot Garden',x:-24,z:24,type:'cache',radius:3},
 {id:'cache-b',name:'Salvage the signal case',area:'The Severed Spire',x:40,z:-7,type:'cache',radius:3},
 {id:'cache-c',name:'Salvage the flight case',area:'The Engine Scar',x:-19,z:-30,type:'cache',radius:3}
];
export const ROADS=[[[0,29],[0,13],[0,0],[0,-16],[0,-36]],[[0,6],[-15,5],[-25,-2],[-33,-7]],[[0,0],[13,-5],[26,-17]],[[0,13],[15,19],[30,22]],[[-13,20],[0,20],[13,20]],[[0,20],[-15,24],[-24,24]]];
export const STRUCTURES=[{x:-15,z:17,w:6,d:5,angle:.15},{x:-13,z:29,w:6,d:5,angle:-.2},{x:12,z:28,w:6,d:5,angle:.1},{x:13,z:13,w:5,d:5,angle:-.22},{x:-9,z:9,w:4,d:4,angle:.25}];
export const SPAWNS=[
 ['mite',-7,3],['mite',4,1],['mite',8,6],['mite',-14,9],['mite',-20,14],['mite',-26,16],['mite',19,12],['mite',23,27],['mite',34,15],
 ['dredger',-28,-8],['mite',-34,-13],['dredger',-36,1],['dredger',-23,-23],['dredger',12,-10],['dredger',29,-13],
 ['kite',21,-23],['kite',33,-21],['kite',-10,-25],['kite',10,-27],['engine',0,-36]
];
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function random(seed=9417){return ()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};}
export function roadDistance(x,z){let best=1e5;for(const road of ROADS)for(let i=1;i<road.length;i++){const [ax,az]=road[i-1],[bx,bz]=road[i],dx=bx-ax,dz=bz-az,t=clamp(((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz),0,1);best=Math.min(best,Math.hypot(x-ax-t*dx,z-az-t*dz));}return best;}
export function landHeight(x,z){
 const coast=1-Math.sqrt((x/53)**2+(z/57)**2)+.045*Math.sin(x*.22+z*.12)+.026*Math.cos(z*.38-x*.1);
 if(coast<-.045)return -.8;const edge=clamp(coast/.16,0,1);
 let h=1.1+1.9*(Math.sin(x*.085+1)*Math.cos(z*.09))**2+2.4*Math.exp(-((x-29)**2+(z+18)**2)/150);
 const flat=Math.max(...LANDMARKS.map(p=>Math.exp(-((x-p.x)**2+(z-p.z)**2)/55)));h=h*(1-flat*.65)+1.4*flat*.65;
 return -.45+edge*(h+.45);
}
export const DECORATIONS=(()=>{const rng=random(63109),items=[];for(let i=0;i<600;i++){const x=(rng()-.5)*103,z=(rng()-.5)*107;
 if(landHeight(x,z)<.7||roadDistance(x,z)<3.4||LANDMARKS.some(l=>distance(l,{x,z})<(l.type==='boss'?12:6))||STRUCTURES.some(l=>distance(l,{x,z})<7)||SPAWNS.some(([,a,b])=>Math.hypot(x-a,z-b)<3)||(z>11&&Math.abs(x)<19))continue;
 const kind=rng()<.55?'spire':'tree',scale=.6+rng()*1.5;items.push({x,z,kind,scale,yaw:rng()*6.28,radius:kind==='tree'?.25*scale:.65*scale});}return items;})();
const cells=new Map();for(const o of [...DECORATIONS,{x:0,z:19,radius:2}])for(let gx=Math.floor((o.x-o.radius-1)/5);gx<=Math.floor((o.x+o.radius+1)/5);gx++)for(let gz=Math.floor((o.z-o.radius-1)/5);gz<=Math.floor((o.z+o.radius+1)/5);gz++){const key=gx+','+gz;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(o);}
export function walkable(x,z,radius=.5){if(landHeight(x,z)<.25)return false;for(const h of STRUCTURES){const dx=x-h.x,dz=z-h.z,c=Math.cos(h.angle),s=Math.sin(h.angle);if(Math.abs(dx*c+dz*s)<h.w/2+radius&&Math.abs(-dx*s+dz*c)<h.d/2+radius)return false;}for(const o of cells.get(Math.floor(x/5)+','+Math.floor(z/5))||[])if(distance(o,{x,z})<o.radius+radius)return false;return true;}
export function region(x,z){if(z<-28)return 'The Engine Scar';if(x<-19&&z<8)return 'Blackglass Cut';if(x>17&&z<0)return 'The Severed Spire';if(x>22&&z>9)return 'The Copper Reaches';if(x<-18&&z>14)return 'The Soot Garden';if(z>12&&Math.abs(x)<21)return 'The Last Anchorage';return 'The Cinder March';}
export function inStrike(origin,target,reach,width){const dx=target.x-origin.x,dz=target.z-origin.z,forward=dx*Math.sin(origin.yaw)+dz*Math.cos(origin.yaw),side=dx*Math.cos(origin.yaw)-dz*Math.sin(origin.yaw);return forward>-.4&&forward<reach&&Math.abs(side)<width;}
