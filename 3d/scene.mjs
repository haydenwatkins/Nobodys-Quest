import * as T from './vendor/three.module.min.js';
import {RADIUS,LANDMARKS,HOUSES,FORMS,ENEMIES,DECORATIONS,landHeight,roadDistance,random,clamp} from './world-data.mjs';

const UP=new T.Vector3(0,1,0), V=new T.Vector3(), Q=new T.Quaternion();
const GEO={box:new T.BoxGeometry(1,1,1),ball:new T.IcosahedronGeometry(1,1),smooth:new T.SphereGeometry(1,16,12),cone:new T.ConeGeometry(1,1,7),cylinder:new T.CylinderGeometry(1,1,1,10),ring:new T.TorusGeometry(1,.055,5,32)};
const materials=new Map();
function mat(color,extra={}){const key=color+JSON.stringify(extra);if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness:.85,flatShading:true,...extra}));return materials.get(key);}
function part(parent,type,color,x,y,z,sx=1,sy=sx,sz=sx,rotation=null){const m=new T.Mesh(GEO[type],mat(color));m.position.set(x,y,z);m.scale.set(sx,sy,sz);if(rotation)m.rotation.set(...rotation);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function group(parent){const g=new T.Group();if(parent)parent.add(g);return g;}
export function surface(x,z,alt=0){const d=Math.hypot(x,z),a=d/RADIUS,r=RADIUS+landHeight(x,z)+alt,s=d?Math.sin(a)/d:0;return new T.Vector3(x*s*r,Math.cos(a)*r,z*s*r);}
function place(obj,x,z,alt=0,yaw=0){obj.position.copy(surface(x,z,alt));obj.quaternion.setFromUnitVectors(UP,obj.position.clone().normalize());if(yaw)obj.rotateY(yaw);}
function face(parent,x,y,z,size=1){part(parent,'smooth',0x19363b,x-.19*size,y,z,.075*size,.12*size,.055*size);part(parent,'smooth',0x19363b,x+.19*size,y,z,.075*size,.12*size,.055*size);}
function humanoid(type='nobody'){
  const root=group(),body=group(root);const limbs=[];const skin=type==='knight'?0x8eaeb8:type==='mayor'?0xb66849:type==='pebble'?0x6c8a9b:0xf8f3de;
  for(const side of [-1,1]){const leg=group(body);leg.position.set(side*.26,.63,0);part(leg,'cylinder',type==='nobody'?0xd9dfcb:0x314650,0,-.28,0,.18,.62,.19);part(leg,'ball',type==='nobody'?0xd9dfcb:0x344b55,0,-.54,.1,.22,.15,.33);limbs.push(leg);}
  part(body,'ball',skin,0,1.08,0,.58,.68,.38);
  const head=group(body);head.position.y=1.95;
  part(head,'smooth',type==='nobody'?0xfff8e6:type==='knight'?0xaac6c9:0xebbb8d,0,0,0,.62,.63,.52);
  if(type==='knight'){
    part(head,'box',0x244752,0,-.06,.48,.86,.19,.08);part(head,'box',0xe6c36c,0,-.09,.54,.1,.57,.08);
    for(let i=0;i<4;i++)part(head,'ball',0xb9534e,0,.51+i*.1,-.05-i*.16,.14,.32,.22);
    part(body,'box',0x426572,0,1.1,.36,.7,.67,.1);part(body,'box',0xf1d077,0,1.25,.43,.11,.32,.05);
  }else{face(head,0,.01,.49);if(type!=='nobody'){part(head,'ball',0x694b3d,0,.4,-.02,.61,.3,.52);if(type==='mayor'){part(head,'cylinder',0x283e51,0,.52,0,.79,.09,.66);part(head,'cylinder',0x283e51,0,.83,0,.46,.58,.41);part(head,'cylinder',0xddb75f,0,.63,0,.47,.12,.42);}}}
  const armL=group(body),armR=group(body);armL.position.set(-.62,1.4,0);armR.position.set(.62,1.4,0);
  part(armL,'ball',skin,0,-.25,0,.19,.47,.2);part(armR,'ball',skin,0,-.25,0,.19,.47,.2);limbs.push(armL,armR);
  if(type==='knight'){
    part(armL,'ball',0x395f70,-.13,-.16,.28,.49,.63,.16);part(armL,'ring',0xe3c477,-.13,-.16,.43,.45,.56,.7);part(armL,'box',0xebd28c,-.13,-.16,.47,.09,.65,.08);
    part(armR,'box',0xe6d591,.13,-.38,.2,.62,.09,.12);part(armR,'box',0xd8e8e3,.13,.19,.2,.18,1.12,.07);part(armR,'cone',0xd8e8e3,.13,.88,.2,.13,.28,.07);
  }else if(type==='nobody'){
    part(body,'cylinder',0x6aaea9,0,1.56,0,.43,.17,.39);part(body,'box',0x4d9698,-.31,1.18,-.33,.24,.68,.06,[.2,0,-.2]);part(body,'ball',0x89ded4,0,1.15,.4,.1,.12,.04);
  }
  root.userData={body,limbs,armR,head,type};return root;
}
function rat(){
  const root=group(),body=group(root),limbs=[];
  part(body,'ball',0x899aa7,0,.62,-.12,.59,.49,.92);part(body,'ball',0xb8babe,0,.9,.58,.44,.43,.56);
  part(body,'cone',0xc6c2bd,0,.77,1,.3,.6,.28,[Math.PI/2,0,0]);part(body,'smooth',0xd99496,0,.77,1.29,.13);
  for(const s of [-1,1]){part(body,'smooth',0x899aa7,s*.37,1.27,.44,.26,.34,.13);part(body,'smooth',0xe9aeab,s*.37,1.28,.55,.17,.24,.04);part(body,'smooth',0x19363b,s*.29,1.02,.91,.07,.1,.06);
    for(const z of [-.5,.5]){const l=group(body);l.position.set(s*.43,.34,z);part(l,'cylinder',0x596e7e,0,-.09,0,.1,.32,.12);part(l,'ball',0xd49c9f,0,-.24,.12,.14,.09,.23);limbs.push(l);}
  }
  const curve=new T.CatmullRomCurve3([new T.Vector3(0,.57,-.9),new T.Vector3(.4,.45,-1.5),new T.Vector3(.8,.55,-1.85),new T.Vector3(.73,.85,-2)]);
  const tail=new T.Mesh(new T.TubeGeometry(curve,14,.065,5,false),mat(0xd79494));body.add(tail);
  root.userData={body,limbs,tail,type:'rat'};return root;
}
function enemyModel(type){
  const root=group(),body=group(root),limbs=[];
  if(type==='slime'){
    part(body,'smooth',0x95bd62,0,.7,0,1,.82,.88);part(body,'smooth',0xc3d888,0,.5,.69,.68,.34,.15);face(body,0,.89,.79,1.4);
    part(body,'ball',0x547e44,-.12,1.55,0,.22,.07,.42,[0,0,.4]);part(body,'ball',0xd8e4ab,-.29,1.16,.54,.15,.09,.04);
  }else if(type==='mushroom'){
    part(body,'cylinder',0xe4d9b4,0,.85,0,.47,1.6,.43);part(body,'ball',0xb96856,0,1.65,0,1.25,.72,1.16);face(body,0,.94,.42,1.4);
    for(let i=0;i<7;i++){const a=i*2.4;part(body,'ball',0xf8db9c,Math.cos(a)*.8,1.96+Math.sin(i)*.15,Math.sin(a)*.8,.18,.1,.17);}
    for(const s of [-1,1])part(body,'ball',0x907f61,s*.45,.13,.2,.34,.2,.42);
  }else if(type==='wisp'){
    part(body,'ball',0x9cbccc,0,1.5,0,.63,.9,.63);part(body,'cone',0xcbdfd9,0,2.28,0,.4,.85,.4);face(body,0,1.61,.58,1.2);
    const ring=part(body,'ring',0xefdb99,0,1.4,0,1,1,1,[Math.PI/2,0,0]);limbs.push(ring);
  }else{
    for(const s of [-1,1]){
      const leg=group(body);leg.position.set(s*1.05,1.45,0);part(leg,'ball',0x647d79,0,-.4,0,.73,1.16,.77);part(leg,'box',0x8f9d8a,0,-1.07,.23,1.2,.55,1.65);limbs.push(leg);
      const arm=group(body);arm.position.set(s*1.95,3.35,0);part(arm,'ball',0x81978a,0,-.65,0,.88,1.32,.8);part(arm,'ball',0x4b6967,s*.15,-1.68,.14,.82,.72,.82);limbs.push(arm);
      part(body,'cone',0x9eac83,s*1.65,4.24,0,.5,1.1,.6,[0,0,-s*.4]);
    }
    part(body,'ball',0x72897f,0,2.9,0,1.77,1.65,1.05);part(body,'box',0xeec36b,0,3.05,1.02,.19,1.4,.08);part(body,'box',0xf6df90,0,3.28,1.04,.78,.14,.1);
    part(body,'box',0x9baa93,0,4.92,0,1.8,1.5,1.5);part(body,'box',0x294e52,0,4.91,.77,1.4,.23,.1);
    for(const s of [-1,1]){part(body,'ball',0xffdb84,s*.41,4.92,.86,.18,.12,.04);part(body,'cylinder',0x665f46,s*.68,6.05,0,.14,1.6,.14,[0,0,-s*.3]);part(body,'cylinder',0x665f46,s*1.03,6.2,0,.1,.77,.1,[0,0,-s*.9]);part(body,'ball',0x739664,s*.86,6.72,0,.5,.31,.5);}
  }
  root.userData={body,limbs,type};return root;
}
function batchStatic(root,scene){
  root.updateMatrixWorld(true);const buckets=new Map();
  root.traverse(m=>{if(!m.isMesh)return;const key=m.geometry.uuid+m.material.uuid;if(!buckets.has(key))buckets.set(key,{geometry:m.geometry,material:m.material,matrices:[]});buckets.get(key).matrices.push(m.matrixWorld.clone());});
  for(const b of buckets.values()){const mesh=new T.InstancedMesh(b.geometry,b.material,b.matrices.length);b.matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;mesh.computeBoundingSphere();scene.add(mesh);}
}

export class WorldView {
  constructor(canvas,game){
    this.game=game;this.canvas=canvas;this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
    this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.2;
    this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;
    this.scene=new T.Scene();this.scene.background=new T.Color(0xa6d1d2);this.scene.fog=new T.Fog(0xa6d1d2,180,410);
    this.camera=new T.PerspectiveCamera(45,1,.1,650);this.yaw=.25;this.zoom=1;this.overview=false;this.started=false;this.elapsed=0;
    this.scene.add(new T.HemisphereLight(0xe7f6e4,0x365764,2.4));
    this.sun=new T.DirectionalLight(0xffe7b7,3);this.sun.position.set(-60,150,80);this.sun.castShadow=true;
    Object.assign(this.sun.shadow.camera,{left:-48,right:48,top:48,bottom:-48,near:1,far:240});this.sun.shadow.mapSize.set(1024,1024);this.sun.shadow.bias=-.00035;this.sun.shadow.normalBias=.07;
    this.scene.add(this.sun,this.sun.target);
    this.static=group();this.animated=[];this.beacons=new Map();this.enemyViews=new Map();this.effectViews=new Map();this.pickupViews=new Map();this.shotViews=new Map();
    this.buildTerrain();this.buildLandscape();this.buildTown();this.buildLandmarks();batchStatic(this.static,this.scene);
    this.player=humanoid();this.scene.add(this.player);this.playerForm='nobody';
    for(const e of game.enemies){const mesh=enemyModel(e.type);this.scene.add(mesh);const danger=this.ring(0xef7965,.17);this.scene.add(danger);this.enemyViews.set(e.id,{mesh,danger});}
    this.targetMarker=group(this.scene);part(this.targetMarker,'cone',0xffdc87,0,0,0,.35,.7,.35,[Math.PI,0,0]);
    this.resize();this.setQuality(game.progress.quality);this.camera.position.set(90,135,145);this.camera.lookAt(0,42,0);
  }
  setQuality(quality){this.quality=quality;this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,quality==='low'?1:quality==='high'?2:1.4));this.renderer.shadowMap.enabled=quality!=='low';this.renderer.setSize(innerWidth,innerHeight,false);}
  resize(){this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight,false);}
  buildTerrain(){
    const geo=new T.SphereGeometry(RADIUS,192,128).toNonIndexed(),positions=geo.attributes.position,colors=[];
    const sand=new T.Color(0xdaca95),grass=new T.Color(0x7fa56b),forest=new T.Color(0x628758),road=new T.Color(0xddc99b),rock=new T.Color(0xa5ab90);
    for(let i=0;i<positions.count;i++){
      V.fromBufferAttribute(positions,i).normalize();const a=Math.acos(clamp(V.y,-1,1)),d=a*RADIUS,ang=Math.atan2(V.x,V.z),x=Math.sin(ang)*d,z=Math.cos(ang)*d;
      const h=a<1.4?landHeight(x,z):-.9;V.multiplyScalar(RADIUS+h);positions.setXYZ(i,V.x,V.y,V.z);
      const c=grass.clone().lerp(forest,clamp((Math.sin(x*.17)+Math.cos(z*.14))*.16+.12,0,.45));
      if(h<.8)c.copy(sand);else if(roadDistance(x,z)<1.7&&a<1.2)c.copy(road);else if(h>3.2)c.lerp(rock,(h-3.2)/3);
      c.multiplyScalar(.96+.04*Math.sin(Math.floor(x*.5)*13+Math.floor(z*.5)*7));colors.push(c.r,c.g,c.b);
    }
    geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
    const earth=new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true}));earth.receiveShadow=true;this.scene.add(earth);
    const ocean=new T.Mesh(new T.SphereGeometry(RADIUS-.15,128,96),mat(0x548f9c,{roughness:.5,metalness:.12}));ocean.receiveShadow=true;this.scene.add(ocean);
    this.ocean=ocean;
  }
  tree(x,z,scale,type=0){
    const g=group(this.static);place(g,x,z);g.scale.setScalar(scale);
    part(g,'cylinder',0x70563a,0,1.2,0,.25,2.4,.25);
    if(type===0){for(let i=0;i<3;i++)part(g,'cone',[0x3d6b51,0x4b7955,0x64895b][i],0,2.1+i*.95,0,1.65-i*.34,2.6-i*.35,1.65-i*.34);}
    else{part(g,'ball',type===2?0xc6b170:0x799a5d,0,3,0,1.9,1.65,1.7);part(g,'ball',type===2?0xd8c783:0x8ba567,1,2.9,.25,1.25,1.1,1.2);part(g,'ball',0x65895b,-.9,2.7,-.4,1.2,1.1,1.1);
      if(type===1)for(let i=0;i<5;i++)part(g,'ball',0xc86744,Math.sin(i*2.3)*1.35,2.6+Math.cos(i)*.4,Math.cos(i*2.3)*1.25,.16);
    }
  }
  buildLandscape(){
    const rng=random(137);
    for(const o of DECORATIONS){
      if(o.kind==='tree')this.tree(o.x,o.z,o.scale,o.type);
      else{const g=group(this.static);place(g,o.x,o.z,0,o.yaw);part(g,'ball',o.color,0,.45,0,o.sx,o.sy,o.sz);}
    }
    for(let i=0;i<1250;i++){
      const x=(rng()-.5)*99,z=(rng()-.5)*100;if(landHeight(x,z)<.8||roadDistance(x,z)<2||HOUSES.some(l=>Math.hypot(x-l.x,z-l.z)<4))continue;
      const g=group(this.static);place(g,x,z,0,rng()*6.28);
      if(i%3){part(g,'cone',i%2?0x90aa68:0x657f4e,0,.22,0,.14,.45,.1,[0,0,.15]);}
      else{part(g,'cylinder',0x73905a,0,.27,0,.035,.5,.035);part(g,'ball',[0xf6d988,0xf0e5b9,0xd49585,0x96b9c2][i%4],0,.54,0,.17,.08,.17);}
    }
    // Floating cloud banks sit off the coast, leaving the playable ground unobstructed.
    for(let i=0;i<20;i++){
      const angle=i*2.4,d=72+rng()*70,g=group(this.scene);place(g,Math.sin(angle)*d,Math.cos(angle)*d,12+rng()*8);
      for(let j=0;j<5;j++)part(g,'ball',0xe6efdd,(j-2)*2.7,rng()*1.3,0,3+rng()*2,1.4+rng(),2+rng());
      g.traverse(o=>{o.castShadow=false;});this.animated.push({type:'cloud',mesh:g,base:g.position.clone(),phase:i});
    }
    // Small distant islands make the globe feel inhabited beyond this first region.
    for(let i=0;i<14;i++){
      const x=Math.sin(i*2.3)*(100+i*4),z=Math.cos(i*2.3)*(100+i*4);const g=group(this.static);place(g,x,z,-.2);
      part(g,'ball',0xd4c18c,0,0,0,6+i%3,1.1,4+i%2);part(g,'ball',0x71936a,0,.65,0,4+i%2,.8,2.5+i%2);
      for(let j=0;j<3;j++)part(g,'cone',0x52765a,(j-1)*2,2.1,0,1,3,1);
    }
  }
  buildTown(){
    for(const h of HOUSES){
      const g=group(this.static);place(g,h.x,h.z,0,h.angle);
      part(g,'box',0x7f8470,0,.35,0,h.w+.5,.7,h.d+.5);part(g,'box',0xe3d3a6,0,2,0,h.w,3.5,h.d);
      // Gabled roof: a four-sided cone turned into a pitched roof prism.
      const roof=new T.Mesh(new T.CylinderGeometry(0,1,1,4,1),mat(h.roof));roof.rotation.y=Math.PI/4;roof.position.y=4.6;roof.scale.set(h.w*.82,2.7,h.d*.85);roof.castShadow=true;g.add(roof);
      for(const s of [-1,1]){part(g,'box',0x76523a,s*(h.w/2-.13),2,h.d/2+.02,.18,3.6,.1);part(g,'box',0x658a8b,s*h.w*.3,2.1,h.d/2+.05,.9,1,.09);part(g,'box',0xf3df9a,s*h.w*.3,2.1,h.d/2+.12,.07,1.08,.06);part(g,'box',0x8b6040,s*h.w*.3,1.5,h.d/2+.14,1.2,.16,.22);}
      part(g,'box',0x6c5040,0,1.3,h.d/2+.06,1.15,2.1,.12);part(g,'ball',0xebc66f,.35,1.3,h.d/2+.16,.09);
      part(g,'box',0xac8c67,1.5,4.85,-.4,.7,2,.7);part(g,'box',0x867058,1.5,5.9,-.4,.95,.2,.95);
      part(g,'box',0xbbaa83,0,.18,h.d/2+.55,1.8,.3,.9);
    }
    const fountain=group(this.static);place(fountain,0,19);
    part(fountain,'cylinder',0xaaa98b,0,.28,0,2.7,.5,2.7);part(fountain,'cylinder',0x7e9c93,0,.56,0,2.2,.2,2.2);part(fountain,'cylinder',0x64adb1,0,.69,0,1.93,.08,1.93);part(fountain,'cylinder',0xc6c3a1,0,1.18,0,.33,1.3,.33);part(fountain,'ball',0xd8cca1,0,1.94,0,.68,.22,.68);part(fountain,'ball',0x8fcbd0,0,2.27,0,.14,.5,.14);
    const mill=group(this.static);place(mill,-21,33);part(mill,'cylinder',0xd6c69d,0,3.1,0,2,6.2,2);part(mill,'cone',0x59808b,0,6.8,0,2.65,2.7,2.65);
    const rotor=group(this.scene);place(rotor,-21,35.13,4.9);
    for(let i=0;i<4;i++){const b=group(rotor);b.rotation.z=i*Math.PI/2;part(b,'box',0x735c42,0,1.9,0,.15,4,.14);part(b,'box',0xebdab4,.4,2.3,.06,.75,2.4,.08);}part(rotor,'ball',0xc0a96e,0,0,.2,.3);this.animated.push({type:'mill',mesh:rotor,baseQ:rotor.quaternion.clone()});
    for(const [x,z] of [[-5,14],[6,13],[-8,25],[8,20]]){const g=group(this.static);place(g,x,z);part(g,'cylinder',0x67553e,0,1.6,0,.1,3.2,.1);part(g,'box',0x625c42,.25,3.05,0,.6,.1,.1);part(g,'box',0xefcb78,.48,2.72,0,.35,.55,.35);part(g,'cone',0x455955,.48,3.1,0,.35,.25,.35);}
    // Low fences frame the village without blocking the roads.
    for(let i=0;i<8;i++){const g=group(this.static);place(g,-17+i*1.3,35);part(g,'box',0xc6b28a,0,.6,0,.15,1.2,.15);part(g,'box',0xbba17a,.65,.45,0,1.3,.12,.12);part(g,'box',0xbba17a,.65,.9,0,1.3,.12,.12);}
    const npc=humanoid('mayor');place(npc,-7,19,0,.5);this.scene.add(npc);this.animated.push({type:'npc',mesh:npc,phase:0});
    const pebble=humanoid('pebble');place(pebble,-23,0,0,1);this.scene.add(pebble);this.animated.push({type:'npc',mesh:pebble,phase:3});
    for(const [x,z] of [[-7,19],[-23,0]]){const marker=group(this.scene);place(marker,x,z,3.8);part(marker,'ball',0xf3d382,0,0,0,.32);part(marker,'cone',0xf3d382,0,-.4,0,.12,.24,.12,[Math.PI,0,0]);this.animated.push({type:'marker',mesh:marker,base:marker.position.clone(),phase:x});}
  }
  buildLandmarks(){
    for(const l of LANDMARKS){
      const g=group(this.static);place(g,l.x,l.z);
      if(l.type==='beacon'){
        part(g,'cylinder',0x9b9d83,0,.2,0,2.5,.4,2.5);part(g,'cylinder',0x697f76,0,.49,0,1.9,.2,1.9);
        if(l.id==='hollow'){
          for(const s of [-1,1])part(g,'ball',0x77876d,s*1.1,1.2,-.7,.8,1.2,.85);part(g,'ball',0x7e916e,0,2.1,-.7,1.6,.65,.8);part(g,'ball',0x34524b,0,1,-.74,.72,.9,.15);
          part(g,'ball',0x759658,-1,2.6,-.6,.9,.22,.7);
        }else if(l.id==='tower'){
          for(const s of [-1,1])part(g,'box',0x94a18b,s*2.1,2.7,-1.8,1,5.4,1);part(g,'box',0xa9ad90,0,5.35,-1.8,5.2,.65,1.3);
          for(let j=0;j<4;j++)part(g,'box',0x819680,-2+j*1.3,6,-1.8,.62,.9,1.1);
        }else{
          for(const s of [-1,1])part(g,'cylinder',0xc8b996,s*1.9,1.8,-1,.28,3.6,.28);part(g,'box',0xd7c89f,0,3.6,-1,4.3,.36,.6);
          part(g,'box',0x698e95,0,2.84,-1.05,3.4,1.15,.08);
        }
        part(g,'cylinder',0x405f59,0,1,0,.35,.9,.35);part(g,'box',0xd1b774,0,1.7,0,.7,.8,.7);part(g,'cone',0x466866,0,2.3,0,.65,.45,.65);
        const flame=group(this.scene);place(flame,l.x,l.z,2.8);const orb=part(flame,'ball',0xf8d780,0,0,0,.3);orb.material=mat(0xfce3a1,{emissive:0xf7b74a,emissiveIntensity:.9});this.beacons.set(l.id,{flame,l});
      }else if(l.type==='camp'){
        for(let i=0;i<8;i++)part(g,'ball',0x8b937c,Math.sin(i*Math.PI/4)*1.1,.25,Math.cos(i*Math.PI/4)*1.1,.36,.28,.3);
        part(g,'cylinder',0x67503a,0,.3,0,.2,1.8,.2,[Math.PI/2,0,.4]);part(g,'cylinder',0x73553a,0,.35,0,.2,1.8,.2,[Math.PI/2,0,-.5]);
        const fire=group(this.scene);place(fire,l.x,l.z,.6);part(fire,'cone',0xefaa58,0,.4,0,.55,1.3,.55);part(fire,'cone',0xffdd85,.15,.2,.1,.35,.9,.35);this.animated.push({type:'fire',mesh:fire});
        const light=new T.PointLight(0xffbd6c,8,12,2);place(light,l.x,l.z,2);this.scene.add(light);
      }else if(l.type==='chest'){
        const chest=group(this.scene);place(chest,l.x,l.z);part(chest,'box',0x805f40,0,.42,0,1.5,.85,.95);part(chest,'cylinder',0xa7804b,0,.9,0,.48,1.5,.48,[0,0,Math.PI/2]);
        for(const s of [-1,1])part(chest,'box',0xddbe70,s*.48,.56,.49,.13,1.05,.04);part(chest,'box',0xf2d687,0,.59,.55,.25,.3,.08);this.animated.push({type:'chest',mesh:chest,id:l.id});
      }else if(l.type==='sign'){
        part(g,'cylinder',0x765a3c,0,1,0,.15,2,.15);part(g,'box',0xd0b786,0,1.9,0,2,.7,.2);part(g,'box',0x705c40,.2,1.9,.11,.75,.08,.02);part(g,'box',0x705c40,.49,2.03,.12,.35,.08,.02,[0,0,-.5]);
      }else if(l.type==='boss'){
        for(let j=0;j<24;j++){const a=j*Math.PI/12,paving=group(this.static);place(paving,l.x+Math.sin(a)*8.6,l.z+Math.cos(a)*8.6,.04,a);part(paving,'box',0x9ca58b,0,0,0,1.65,.12,1.5);}
        for(let i=0;i<9;i++){const a=i*Math.PI*2/9;part(g,'box',0x879785,Math.sin(a)*10,1.5,Math.cos(a)*10,.85,3+Math.sin(i)*.8,1.1,[0,-a,.07*Math.sin(i)]);part(g,'box',0xd6c181,Math.sin(a)*9.4,1.8,Math.cos(a)*9.4,.13,.8,.1,[0,-a,0]);}
      }
    }
  }
  ring(color,opacity){const mesh=new T.Mesh(new T.RingGeometry(.82,1,48),new T.MeshBasicMaterial({color,transparent:true,opacity,side:T.DoubleSide,depthWrite:false}));mesh.rotation.x=-Math.PI/2;const root=group();root.add(mesh);return root;}
  orientCameraMove(x,z){return {x:x*Math.cos(this.yaw)+z*Math.sin(this.yaw),z:-x*Math.sin(this.yaw)+z*Math.cos(this.yaw)};}
  syncActor(mesh,entity,time,isPlayer=false){
    place(mesh,entity.x,entity.z,.05,entity.yaw);const d=mesh.userData,b=d.body;const moving=isPlayer?entity.move:entity.state==='idle'&&Math.hypot(entity.x-entity.homeX,entity.z-entity.homeZ)>.3;
    b.position.y=moving?Math.abs(Math.sin(time*(d.type==='rat'?20:12)))*.12:Math.sin(time*2+entity.x)*.035;
    if(d.limbs)for(let i=0;i<d.limbs.length;i++)d.limbs[i].rotation.x=moving?Math.sin(time*12+i%2*Math.PI)*.42:Math.sin(time*2+i)*.035;
    if(d.type==='slime'){b.scale.set(1+Math.sin(time*5+entity.id)*.035,1+Math.cos(time*5+entity.id)*.05,1);}
    if(d.type==='wisp'){b.position.y=Math.sin(time*3+entity.id)*.25;d.limbs[0].rotation.z=time;}
    if(d.type==='rat')d.tail.rotation.y=Math.sin(time*7)*.12;
    if(isPlayer){if(d.armR&&entity.anim>0)d.armR.rotation.x=-Math.sin((.25-entity.anim)/.25*Math.PI)*1.7;if(entity.dash>0)b.rotation.x=-time*22;else b.rotation.x=0;}
    else if(entity.state==='windup'){b.scale.y=1-.13*Math.sin((1-entity.timer/ENEMIES[entity.type].windup)*Math.PI);if(d.type==='warden')for(const i of [1,3])d.limbs[i].rotation.x=-1.2;}else if(d.type!=='slime')b.scale.y=1;
    mesh.visible=!(entity.flash>0&&Math.floor(time*35)%2===0);
  }
  update(dt){
    this.elapsed+=dt;const time=this.elapsed,p=this.game.player;
    if(this.playerForm!==p.form){this.scene.remove(this.player);this.player=p.form==='rat'?rat():humanoid(p.form);this.scene.add(this.player);this.playerForm=p.form;}
    this.syncActor(this.player,p,time,true);
    for(const e of this.game.enemies){const {mesh,danger}=this.enemyViews.get(e.id);mesh.visible=e.alive;if(e.alive)this.syncActor(mesh,e,time);danger.visible=e.alive&&e.state==='windup'&&e.type!=='wisp';if(danger.visible){place(danger,e.attackX,e.attackZ,.15);danger.scale.setScalar(ENEMIES[e.type].range);danger.children[0].material.opacity=.25+.25*(1-e.timer/ENEMIES[e.type].windup);}}
    for(const [id,b]of this.beacons){const lit=this.game.progress.beacons.includes(id);b.flame.visible=lit;b.flame.scale.setScalar(1+Math.sin(time*3)*.12);b.flame.rotation.y=time;}
    for(const a of this.animated){if(a.type==='mill')a.mesh.quaternion.copy(a.baseQ).multiply(Q.setFromAxisAngle(new T.Vector3(0,0,1),time*.3));if(a.type==='cloud')a.mesh.position.copy(a.base).addScaledVector(new T.Vector3(1,0,0),Math.sin(time*.04+a.phase)*2);if(a.type==='fire')a.mesh.scale.y=1+Math.sin(time*13)*.15;if(a.type==='npc')a.mesh.userData.body.position.y=Math.sin(time*2+a.phase)*.035;if(a.type==='marker')a.mesh.position.copy(a.base).addScaledVector(a.base.clone().normalize(),Math.sin(time*2+a.phase)*.18);if(a.type==='chest')a.mesh.visible=!this.game.progress.chests.includes(a.id);}
    const q=this.game.quest();this.targetMarker.visible=!!q.target&&this.started&&!this.overview;if(q.target){place(this.targetMarker,q.target.x,q.target.z,5+Math.sin(time*2)*.3);}
    this.syncEffects();this.syncPickups();this.syncShots();
    this.updateCamera(dt);this.renderer.render(this.scene,this.camera);
  }
  updateCamera(dt){
    const p=this.game.player,center=surface(p.x,p.z,1),up=center.clone().normalize(),north=surface(p.x,p.z-1,1).sub(center).normalize();
    const east=new T.Vector3().crossVectors(north,up).normalize();const south=north.clone().negate();
    const offset=east.multiplyScalar(Math.sin(this.yaw)).add(south.multiplyScalar(Math.cos(this.yaw)));
    const portrait=this.camera.aspect<.8,dist=(portrait?36:29)*this.zoom;
    let desired,target;
    if(!this.started||this.overview){const a=this.started?this.yaw:Math.sin(this.elapsed*.035)*.25;desired=new T.Vector3(Math.sin(a)*145,151,Math.cos(a)*151);target=new T.Vector3(0,28,0);this.camera.up.lerp(UP,.08);}
    else{desired=center.clone().addScaledVector(up,dist*.9).addScaledVector(offset,dist);target=center.clone().addScaledVector(offset,-3);this.camera.up.lerp(up,1-Math.exp(-dt*5)).normalize();}
    this.camera.position.lerp(desired,1-Math.exp(-dt*(this.started?3:1)));this.look=this.look||target.clone();this.look.lerp(target,1-Math.exp(-dt*5));this.camera.lookAt(this.look);
    this.sun.target.position.copy(center);this.sun.position.copy(center).add(new T.Vector3(-45,90,45));
  }
  syncEffects(){
    const ids=new Set();
    for(const f of this.game.effects){ids.add(f.id);let mesh=this.effectViews.get(f.id);
      if(!mesh){
        mesh=this.ring(f.type==='cloud'?0x9fcb72:f.type==='slam'?0xed9175:f.type==='heal'?0xbadea4:0xf8d785,.7);
        if(f.type==='burst'||f.type==='treasure'||f.type==='shift'||f.type==='beacon'){for(let i=0;i<8;i++){const s=part(mesh,'ball',f.color||0xf9d88d,Math.sin(i)*1.5,.3+Math.cos(i)*.2,Math.cos(i)*1.5,.12);s.castShadow=false;}}
        this.scene.add(mesh);this.effectViews.set(f.id,mesh);
      }
      const age=1-f.life/f.maxLife;place(mesh,f.x,f.z,.2);let size=f.radius||2;
      if(f.type!=='cloud')size*=.3+age;mesh.scale.set(size,size,size);mesh.children[0].material.opacity=(1-age)*(f.type==='cloud'?.45:.8);
      if(f.type==='slash'){mesh.rotateY(f.yaw);mesh.children[0].rotation.z=-f.yaw;mesh.scale.setScalar(f.radius*(.5+age*.5));}
      for(let i=1;i<mesh.children.length;i++)mesh.children[i].position.y=age*2+.4;
    }
    for(const [id,mesh]of this.effectViews)if(!ids.has(id)){this.scene.remove(mesh);mesh.children[0].geometry.dispose();mesh.children[0].material.dispose();this.effectViews.delete(id);}
  }
  syncPickups(){const ids=new Set();for(const p of this.game.pickups){ids.add(p.id);let m=this.pickupViews.get(p.id);if(!m){m=group(this.scene);part(m,'ball',0xf5d67b,0,0,0,.28);this.pickupViews.set(p.id,m);}place(m,p.x,p.z,.8+Math.sin(this.elapsed*4+p.id)*.12);m.rotation.y+=.03;}for(const [id,m]of this.pickupViews)if(!ids.has(id)){this.scene.remove(m);this.pickupViews.delete(id);}}
  syncShots(){const ids=new Set();for(const p of this.game.projectiles){ids.add(p.id);let m=this.shotViews.get(p.id);if(!m){m=group(this.scene);part(m,'ball',0xf2bb85,0,0,0,.32);this.shotViews.set(p.id,m);}place(m,p.x,p.z,1.3);}for(const [id,m]of this.shotViews)if(!ids.has(id)){this.scene.remove(m);this.shotViews.delete(id);}}
}
