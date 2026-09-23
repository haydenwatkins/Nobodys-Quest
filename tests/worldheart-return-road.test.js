const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
const center=(tile)=>tile*16+8;
function cross(G,from,to,x,y,dx,dy){
 G.state.portalNeedsRelease=false;G.state.portalGrace=0;G.input.vec={x:dx,y:dy};
 Object.assign(G.state.player,{x:center(x),y:center(y)});
 for(let i=0;i<40&&G.state.mapId===from;i++){
  G.world.moveBox(G.state.player,dx*1.5,dy*1.5);
  G.world.checkTriggers(.02);
 }
 assert.equal(G.state.mapId,to,`${from} should lead to ${to}`);
 assert.ok(G.world.isSafeSpawn(G.state.player.x,G.state.player.y),`${to} safe arrival`);
 G.input.vec={x:0,y:0};G.world.checkTriggers(.5);
 assert.equal(G.state.mapId,to,'neutral input cannot bounce through the arrival');
}
test('Worldheart opens a two-way physical return road near the final trial',()=>{
 const r=runtime(),{G}=r;
 G.state.worldwake.marks=['sky','stone','thread','echo','light'];
 r.load('titanGrave');r.drain();
 const grave=G.state.grid[28][23],home=G.maps.overworld.legend.Q;
 assert.equal(grave.portal.map,'overworld');assert.equal(grave.mark,'heart');
 assert.equal(home.portal.map,'titanGrave');assert.equal(home.mark,'heart');
 assert.equal(G.world.solid(center(23),center(28)),true);
 assert.match(G.world.portalBlockReason(grave).text,/Worldheart Mark/);
 const before=G.guidanceRoute('titanGrave','overworld');
 assert.ok(before.steps.length>1,'the sealed new road must not hide the existing open route');
 G.events.emit('pickup',{item:'trophy-last-worldbearer'});
 assert.ok(G.hasWorldMark('heart'));
 assert.equal(G.world.portalBlockReason(grave),null);
 assert.equal(G.guidanceRoute('titanGrave','overworld').steps.length,1);
 cross(G,'titanGrave','overworld',23,27,0,1);
 assert.equal(G.world.portalBlockReason(home),null);
 cross(G,'overworld','titanGrave',114,1,0,-1);
});
test('old Worldbearer trophies restore the road without disturbing older exits',()=>{
 const r=runtime(),{G}=r;
 G.state.worldwake=G.normalizeWorldwake(undefined,{items:['trophy-last-worldbearer'],mapId:'titanGrave'});
 r.load('titanGrave');r.drain();
 assert.equal(G.world.portalBlockReason(G.state.grid[28][23]),null);
 assert.equal(G.state.grid[14][0].portal.map,'stormspinePeaks');
 assert.equal(G.state.grid[0][23].portal.map,'glasswaterDesert');
 r.load('overworld');r.drain();
 assert.equal(G.world.portalBlockReason(G.state.grid[0][114]),null);
 assert.equal(G.state.grid[0][110].portal.map,'godTrial');
});
