// Coordinates describe an explorable curved continent. Rendering and rules share this geometry.
export const RADIUS = 76;
export const SAVE_KEY = 'nobodys-quest.greenfield-3d.v1';
export const FORMS = {
  nobody:{name:'Nobody',hp:100,speed:8,damage:19,range:3.3,cooldown:.42,attack:'Slap',color:0xf7f0dc},
  rat:{name:'Rat',hp:80,speed:11,damage:13,range:2.8,cooldown:.27,attack:'Bite',color:0x8fa1af},
  knight:{name:'Knight',hp:140,speed:6.8,damage:34,range:4.3,cooldown:.66,attack:'Cleave',color:0x99bec9}
};
export const ARTS = {
  cartwheel:{name:'Cartwheel',form:'nobody',cooldown:4,description:'Tumble through danger. Invulnerable during the roll; crash into foes for damage.'},
  poison:{name:'Fester',form:'rat',cooldown:6,description:'Spread a lingering cloud of poison. Borrow it as Knight for a very dirty sword fight.'},
  spin:{name:'Shield sweep',form:'knight',cooldown:5,description:'Strike all around you, push enemies away, and gain a brief protective shield.'}
};
export const LANDMARKS = [
  {id:'mayor',name:'Mayor Maybe',area:'Sunrise Town',x:-7,z:19,type:'npc',radius:3},
  {id:'camp',name:'Rest at the campfire',area:'Sunrise Town',x:5,z:24,type:'camp',radius:3},
  {id:'sign',name:'Read the signpost',area:'Greenfield',x:5,z:9,type:'sign',radius:3},
  {id:'hollow',name:'The Hollow lantern',area:'Briar Hollow',x:-33,z:-7,type:'beacon',form:'rat',radius:3.5},
  {id:'tower',name:'The Watch lantern',area:'The Old Watch',x:26,z:-17,type:'beacon',form:'knight',radius:3.5},
  {id:'shore',name:'The Tide lantern',area:'Sunwash Coast',x:30,z:22,type:'beacon',radius:3.5},
  {id:'warden',name:'The Unfinished Warden',area:'The Promise Stones',x:0,z:-36,type:'boss',radius:7},
  {id:'pebble',name:'Pebble',area:'Briar Hollow',x:-23,z:0,type:'npc',radius:3},
  {id:'chest-orchard',name:'Open the forgotten picnic',area:'The Apple Orchard',x:-24,z:24,type:'chest',radius:3},
  {id:'chest-cliff',name:'Open the wayfarer’s chest',area:'The Old Watch',x:40,z:-7,type:'chest',radius:3},
  {id:'chest-north',name:'Open the very overdue delivery',area:'The Promise Stones',x:-19,z:-30,type:'chest',radius:3}
];
export const ROADS = [ [[0,29],[0,13],[0,0],[0,-16],[0,-36]], [[0,6],[-15,5],[-25,-2],[-33,-7]], [[0,0],[13,-5],[26,-17]], [[0,13],[15,19],[30,22]], [[-13,20],[0,20],[13,20]], [[0,20],[-15,24],[-24,24]] ];
export const HOUSES = [
  {x:-15,z:17,w:6,d:5,roof:0xbd5f44,angle:.15}, {x:-13,z:29,w:6,d:5,roof:0xd49452,angle:-.2},
  {x:12,z:28,w:6,d:5,roof:0x557e8d,angle:.1}, {x:13,z:13,w:5,d:5,roof:0xb55f45,angle:-.22},
  {x:-9,z:9,w:4,d:4,roof:0x59878c,angle:.25}
];
export const ENEMY_SPAWNS = [
  ['slime',-7,3],['slime',4,1],['slime',8,6],['slime',-14,9],['slime',-20,14],
  ['slime',-26,16],['slime',19,12],['slime',23,27],['slime',34,15],
  ['mushroom',-19,-6],['mushroom',-27,-14],['mushroom',-36,1],
  ['mushroom',-23,-23],['mushroom',12,-10],['mushroom',31,-11],
  ['wisp',21,-25],['wisp',33,-21],['wisp',-10,-25],['wisp',10,-27],
  ['warden',0,-36]
];
export const ENEMIES = {
  slime:{hp:48,damage:10,speed:3.3,range:2.5,aggro:12,windup:.7,cooldown:2.1,xp:1,radius:1},
  mushroom:{hp:85,damage:15,speed:2.5,range:4.4,aggro:13,windup:1.05,cooldown:2.8,xp:2,radius:1.3},
  wisp:{hp:60,damage:12,speed:3.5,range:10,aggro:15,windup:1.0,cooldown:2.2,xp:2,radius:1},
  warden:{hp:650,damage:25,speed:3,range:7,aggro:21,windup:1.45,cooldown:2.8,xp:12,radius:2.5}
};
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export function roadDistance(x,z){
  let best=1e5;
  for(const road of ROADS)for(let i=1;i<road.length;i++){
    const [ax,az]=road[i-1],[bx,bz]=road[i],dx=bx-ax,dz=bz-az;
    const t=clamp(((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz),0,1);
    best=Math.min(best,Math.hypot(x-ax-t*dx,z-az-t*dz));
  }
  return best;
}
export function landHeight(x,z){
  const coast=1-Math.sqrt((x/53)**2+(z/57)**2)+.045*Math.sin(x*.22+z*.12)+.026*Math.cos(z*.38-x*.1);
  if(coast<-.045)return -.8;
  const edge=clamp(coast/.16,0,1);
  let h=1.1+1.9*(Math.sin(x*.085+1)*Math.cos(z*.09))**2+2.4*Math.exp(-((x-29)**2+(z+18)**2)/150);
  // Open, flat-ish space around the village and landmarks keeps combat and navigation readable.
  const flatten=Math.max(...LANDMARKS.map(p=>Math.exp(-((x-p.x)**2+(z-p.z)**2)/55)));
  h=h*(1-flatten*.65)+1.4*flatten*.65;
  return -.45+edge*(h+.45);
}
export function walkable(x,z,radius=.5){
  if(landHeight(x,z)<.25)return false;
  for(const h of HOUSES){
    const dx=x-h.x,dz=z-h.z,c=Math.cos(h.angle),s=Math.sin(h.angle);
    if(Math.abs(dx*c+dz*s)<h.w/2+radius&&Math.abs(-dx*s+dz*c)<h.d/2+radius)return false;
  }
  for(const obstacle of collisionCells.get(`${Math.floor(x/5)},${Math.floor(z/5)}`)||[]){
    if(Math.hypot(x-obstacle.x,z-obstacle.z)<obstacle.radius+radius)return false;
  }
  return true;
}
export function region(x,z){
  if(z<-28)return 'The Promise Stones';
  if(x<-19&&z<8)return 'Briar Hollow';
  if(x>17&&z<0)return 'The Old Watch';
  if(x>22&&z>9)return 'Sunwash Coast';
  if(x<-18&&z>14)return 'The Apple Orchard';
  if(z>12&&Math.abs(x)<21)return 'Sunrise Town';
  return 'Greenfield';
}
export function random(seed=9417){return ()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};}

// Keep visible trunks and boulders in agreement with movement rules.
function makeDecorations(){
  const rng=random(2408),items=[];
  for(let i=0;i<700;i++){
    const x=(rng()-.5)*103,z=(rng()-.5)*107,h=landHeight(x,z);
    if(h<.7||roadDistance(x,z)<3.2||LANDMARKS.some(l=>Math.hypot(x-l.x,z-l.z)<(l.type==='boss'?10:6))||HOUSES.some(l=>Math.hypot(x-l.x,z-l.z)<7)||ENEMY_SPAWNS.some(([,ex,ez])=>Math.hypot(x-ex,z-ez)<2.8)||(z>11&&Math.abs(x)<19))continue;
    if(rng()<.65){const scale=.65+rng()*.6,type=x<-18&&z>14?1:rng()<.15?2:0;items.push({kind:'tree',x,z,scale,type,radius:.25*scale});}
    else{const yaw=rng()*6.28,color=rng()<.5?0x8c9b85:0xa4ab90,sx=.7+rng(),sy=.6+rng()*.6,sz=.6+rng();items.push({kind:'rock',x,z,yaw,color,sx,sy,sz,radius:Math.min(sx,sz)*.8});}
  }
  return items;
}
export const DECORATIONS=makeDecorations();
const collisionCells=new Map();
for(const o of [...DECORATIONS,{x:0,z:19,radius:2.3},{x:-21,z:33,radius:2}]){
  for(let gx=Math.floor((o.x-o.radius-1)/5);gx<=Math.floor((o.x+o.radius+1)/5);gx++)for(let gz=Math.floor((o.z-o.radius-1)/5);gz<=Math.floor((o.z+o.radius+1)/5);gz++){
    const key=`${gx},${gz}`;if(!collisionCells.has(key))collisionCells.set(key,[]);collisionCells.get(key).push(o);
  }
}
