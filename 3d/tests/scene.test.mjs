import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../game.mjs';
import {walkable} from '../world-data.mjs';
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

test('Last Light scene keeps the rescue boat, cable and repair target in valid staged states',()=>{
 globalThis.innerWidth=844;globalThis.innerHeight=390;globalThis.devicePixelRatio=1;
 const renderer={shadowMap:{},setPixelRatio(){},setSize(){},render(){}};const game=new Game(),view=new WorldView(null,game,{renderer});view.started=true;
 game.progress.prologue='coupling';game.progress.prologueInspected=true;view.update(1/60);assert.equal(view.prologue.jam.visible,true);
 game.progress.prologue='crossing';game.prologueTimer=.8;view.update(1/60);assert.equal(view.prologue.jam.visible,false);assert.ok(view.prologue.cable.geometry.attributes.position.count>=3);
 game.progress.prologue='briefing';view.prologueEvent('engine-answer');view.update(1/60);view.scene.updateMatrixWorld(true);view.scene.traverse(o=>assert.ok(o.matrixWorld.elements.every(Number.isFinite),`invalid staged ${o.type}`));
});

test('Last Light scene gates dock threats and stages a safe crew crossing with a jammed reel',()=>{
 globalThis.innerWidth=844;globalThis.innerHeight=390;globalThis.devicePixelRatio=1;
 const renderer={shadowMap:{},setPixelRatio(){},setSize(){},render(){}};const game=new Game(),view=new WorldView(null,game,{renderer});view.started=true;
 const threats=game.enemies.filter(e=>e.prologue);
 view.update(1/60);assert.ok(threats.every(e=>!view.enemyViews.get(e.id).mesh.visible),'arrival never shows dock threats');
 game.progress.prologue='landingThreat';view.update(1/60);assert.ok(threats.every(e=>view.enemyViews.get(e.id).mesh.visible),'dock threats appear only during landingThreat');
 game.progress.prologue='coupling';view.update(.2);const stopped=view.prologue.reel.quaternion.clone();view.update(.2);assert.ok(stopped.angleTo(view.prologue.reel.quaternion)<1e-8,'jammed reel remains stopped');
 game.progress.prologue='crossing';game.prologueTimer=1;view.update(.2);assert.equal(view.prologue.crew.parent,view.prologue.boat,'crew rides the boat before it docks');assert.ok(stopped.angleTo(view.prologue.reel.quaternion)>1e-4,'reel pulls the boat before it docks');
 const boatAtOne=view.prologue.boat.getWorldPosition(view.prologue.boat.position.clone()),crewAtOne=view.prologue.crew.getWorldPosition(view.prologue.crew.position.clone());game.prologueTimer=1.5;view.update(.2);const boatAtOneHalf=view.prologue.boat.getWorldPosition(view.prologue.boat.position.clone()),crewAtOneHalf=view.prologue.crew.getWorldPosition(view.prologue.crew.position.clone());assert.ok(crewAtOne.distanceTo(crewAtOneHalf)>0&&boatAtOne.distanceTo(boatAtOneHalf)>0,'crew follows the moving boat');
 game.prologueTimer=2;view.update(0);const docked=view.prologue.crew.getWorldPosition(view.prologue.crew.position.clone());game.prologueTimer=2.001;view.update(.001);const stepping=view.prologue.crew.getWorldPosition(view.prologue.crew.position.clone());assert.ok(docked.distanceTo(stepping)<.08,'crew handoff to gangway is continuous at the dock');
 game.prologueTimer=4.5;view.update(.2);const {x,z}=view.prologue.crewDestination;assert.ok(Math.hypot(x,z-19)>2,'crew destination clears the reel radius');assert.equal(view.prologue.crewPath.at(-1)[0],x);assert.equal(view.prologue.crewPath.at(-1)[1],z);assert.ok(view.prologue.crewPath.every(([px,pz])=>walkable(px,pz,.35)),'post-gangway crew path is walkable');
});

test('Last Light keeps engine victory lighting and recovered regulator pieces in the scene',()=>{
 globalThis.innerWidth=844;globalThis.innerHeight=390;globalThis.devicePixelRatio=1;
 const renderer={shadowMap:{},setPixelRatio(){},setSize(){},render(){}};const game=new Game(),view=new WorldView(null,game,{renderer});view.started=true;
 game.progress.teeth=['west','north'];view.resetPresentation();assert.equal(view.regulators.pieces[0].visible,true);assert.equal(view.regulators.pieces[1].visible,true);assert.equal(view.regulators.pieces[2].visible,false);
 game.progress.teeth.push('east');view.prologueEvent('tooth',{count:3,id:'east'});view.update(.8);assert.equal(view.regulators.pieces[2].visible,true);assert.equal(view.regulators.flight,null);
 view.prologueEvent('engine-answer');view.update(.05);assert.ok(view.prologue.lamps[0].material.emissiveIntensity<.5,'engine answer dips anchorage lights');assert.ok(view.prologue.vents.scale.y<.5,'engine answer visibly falters the lift vents');
 game.progress.won=true;view.prologueEvent('victory');view.update(.1);assert.equal(view.prologue.lamps[0].material.emissiveIntensity,1.35);assert.ok(view.prologue.engineGlow.material.emissiveIntensity>=2,'victory restores steady engine lights');
});
