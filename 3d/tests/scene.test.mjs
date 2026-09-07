import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../game.mjs';
import {WorldView} from '../scene.mjs';

test('scene survives tool changes, combat poses, effects, camera modes and resize without invalid transforms',()=>{
 globalThis.innerWidth=1280;globalThis.innerHeight=800;globalThis.devicePixelRatio=2;
 const renderer={shadowMap:{},setPixelRatio(){},setSize(){},render(){}};
 const game=new Game(),view=new WorldView(null,game,{renderer});
 for(const e of game.enemies)e.alive=false;
 const inspect=()=>{view.scene.updateMatrixWorld(true);view.scene.traverse(o=>assert.ok(o.matrixWorld.elements.every(Number.isFinite),`invalid ${o.type} transform`));assert.ok(view.camera.projectionMatrix.elements.every(Number.isFinite));};
 view.update(1/60);inspect();view.started=true;
 for(const weapon of ['shear','pike','maul']){
  assert.ok(game.setWeapon(weapon)||weapon===game.player.weapon);
  for(const action of ['attack','vent','dodge']){
   game.player.charge=100;assert.equal(game[action](),true);
   for(let i=0;i<70;i++){game.update(1/60,{x:0,z:0});view.update(1/60);if(i%10===0)inspect();}
  }
 }
 view.overview=true;view.update(.05);inspect();
 globalThis.innerWidth=390;globalThis.innerHeight=844;view.resize();view.overview=false;view.setQuality('low');view.update(.05);inspect();assert.equal(renderer.shadowMap.enabled,false);
 const enemy=game.enemies[0];Object.assign(enemy,{alive:true,hp:10,x:0,z:24});view.update(.05);assert.equal(view.enemyViews.get(0).health.visible,true);enemy.alive=false;view.update(.05);assert.equal(view.enemyViews.get(0).health.visible,false);
});
