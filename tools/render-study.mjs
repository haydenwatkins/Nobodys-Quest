// Offline composition study of the actual scene graph; not a WebGL screenshot.
import * as T from '../3d/vendor/three.module.min.js';
import {WorldView} from '../3d/scene.mjs';
import {Game} from '../3d/game.mjs';
import {writeFileSync} from 'node:fs';
const out=process.argv[2]||'/tmp/veyr-study';const mode=process.argv[3]||'play';
globalThis.innerWidth=1280;globalThis.innerHeight=800;globalThis.devicePixelRatio=1;
const renderer={shadowMap:{},setPixelRatio(){},setSize(){},render(){}};
const game=new Game();if(mode==='field'){game.player.x=0;game.player.z=-8;}if(mode==='hero'){game.player.yaw=.35;}
const view=new WorldView(null,game,{renderer});view.started=mode!=='title';if(mode==='hero')view.zoom=.7;
for(let i=0;i<180;i++)view.update(1/60);
view.scene.updateMatrixWorld(true);view.camera.updateMatrixWorld(true);
const positions=[],normals=[],colors=[],matrix=new T.Matrix4(),instance=new T.Matrix4(),normalMatrix=new T.Matrix3(),v=new T.Vector3(),n=new T.Vector3();let meshes=0;
view.scene.traverseVisible(o=>{if(!o.isMesh)return;const geo=o.geometry,index=geo.index,ps=geo.attributes.position,ns=geo.attributes.normal,cs=geo.attributes.color,mat=o.material;if(Array.isArray(mat))throw Error('Unexpected material array');if(mat.transparent&&mat.opacity<.4)return;const count=o.isInstancedMesh?o.count:1;for(let j=0;j<count;j++){matrix.copy(o.matrixWorld);if(o.isInstancedMesh){o.getMatrixAt(j,instance);matrix.multiply(instance);}normalMatrix.getNormalMatrix(matrix);for(let k=0;k<(index?index.count:ps.count);k++){const a=index?index.getX(k):k;v.fromBufferAttribute(ps,a).applyMatrix4(matrix);n.fromBufferAttribute(ns,a).applyNormalMatrix(normalMatrix);positions.push(v.x,v.y,v.z);normals.push(n.x,n.y,n.z);const c=mat.color.clone();if(cs)c.multiply(new T.Color().fromArray(cs.array,a*3));if(mat.emissive)c.add(mat.emissive.clone().multiplyScalar(mat.emissiveIntensity*.3));colors.push(c.r,c.g,c.b);}meshes++;}});
for(const [name,values]of Object.entries({positions,normals,colors}))writeFileSync(out+'-'+name+'.bin',Buffer.from(new Float32Array(values).buffer));
writeFileSync(out+'.json',JSON.stringify({width:innerWidth,height:innerHeight,projection:view.camera.projectionMatrix.elements,view:view.camera.matrixWorldInverse.elements,eye:view.camera.position.toArray(),sun:view.sun.position.toArray(),target:view.sun.target.position.toArray(),fog:view.scene.fog.color.toArray(),fogNear:view.scene.fog.near,fogFar:view.scene.fog.far,vertices:positions.length/3,meshes}));console.log({mode,meshes,triangles:positions.length/9,out});
