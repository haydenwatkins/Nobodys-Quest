const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
test('all 72 legend trials place opponents and distinct runes on usable ground',()=>{
 const r=runtime(),{G}=r;G.formUnlocked=()=>true;G.formLevel=()=>5;
 for(const [id,stages] of Object.entries(G.LEGEND_PATHS))for(const stage of stages){
  r.load(stage.mapId);r.drain();G.state.formId=id;G.state.enemies=[];G.state.legends=G.makeLegends();G.state.legends.ranks[id]=stage.rank-1;
  const p=G.legendSitePoint(stage);Object.assign(G.state.player,p);assert.ok(G.tryLegendEcho(),id+': '+stage.name);r.drain();const active=G.state.legends.active;assert.ok(active);
  for(const e of G.state.enemies.filter(e=>e.legendTrial))assert.ok(G.world.isSafeSpawn(e.x,e.y),id+' opponent');
  if(active.runes){const points=active.runes.map(([dx,dy])=>({x:p.x+dx,y:p.y+dy}));for(let i=0;i<points.length;i++){assert.ok(G.world.isSafeSpawn(points[i].x,points[i].y),id+' rune '+i);for(let j=0;j<i;j++)assert.ok(Math.hypot(points[i].x-points[j].x,points[i].y-points[j].y)>28,id+' distinct runes');}}
 }
});
test('Frog can visit each relocated marsh rune and finish its first legend trial',()=>{
 const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.formUnlocked=()=>true;G.formLevel=()=>5;G.state.formId='frog';G.state.enemies=[];G.state.legends=G.makeLegends();const p=G.legendSitePoint(G.LEGEND_PATHS.frog[0]);Object.assign(G.state.player,p);G.tryLegendEcho();r.drain();const runes=G.state.legends.active.runes;
 for(const [dx,dy] of runes){Object.assign(G.state.player,{x:p.x+dx,y:p.y+dy});G.updateLegendQuest(.02);}
 assert.equal(G.state.legends.active,null);assert.equal(G.state.legends.rewards.frog,1);
});
test('all legendary techniques explain their effects and chain techniques stop at four targets',()=>{
 const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();G.state.formId='nobody';G.state.enemies=[];Object.assign(G.state.player,{x:240,y:144,dir:{x:1,y:0}});G.world.solid=()=>false;
 const arts=Object.values(G.abilities).filter(a=>a.legendTechnique);assert.equal(arts.length,24);for(const a of arts)assert.ok(a.description?.length>30,a.id);
 const chain=arts.find(a=>a.style==='chain');const enemies=[];for(let i=0;i<6;i++){const e=G.makeEnemy('slime',260+i*18,144);e.hp=50;enemies.push(e);}G.state.enemies=enemies;chain.use(G.state.player);assert.equal(enemies.filter(e=>e.hp<50).length,4);
});
