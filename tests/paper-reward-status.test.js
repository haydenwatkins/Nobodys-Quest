const test=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
test('paper gift cues reserve the actual hearts, mana and identity panel in touch and controller layouts',()=>{
 const r=runtime(),{G}=r;G.state.opening.complete=true;G.state.delivery.complete=true;G.state.items=['trophy-heartwood-crown'];
 r.load('orchardRoad');r.drain();G.state.enemies=[];Object.assign(G.state.player,{x:360,y:600});
 G.revealActivityReward('orchard-ribbon',360,600);r.drain();r.run('js/engine/ui.js');G.getLoadout('nobody');
 const c=r.nodes.get('ui').getContext('2d'),rects=[],labels=[];
 c.measureText=text=>({width:text.length*3.5});c.fillRect=(x,y,w,h)=>rects.push({x,y,w,h,color:c.fillStyle});c.fillText=text=>labels.push(text);
 for(const hd of [true,false])for(const touch of [true,false]){
  G.hdPilot=hd;G.input.isTouch=touch;rects.length=labels.length=0;G.ui.drawHUD({x:200,y:510});
  assert.ok(labels.includes('Orchard Ribbon'));assert.ok(labels.join(' ').includes('+5 town spirit'));assert.ok(labels.includes('Walk over the treasure to collect'));
  const cue=rects.find(r=>r.color==='rgba(26,28,44,.94)'),status=rects.find(r=>r.x===6&&r.y===6&&r.color==='rgba(30,44,44,.88)');
  assert.ok(cue);assert.ok(status);assert.equal(cue.x<status.x+status.w&&cue.x+cue.w>status.x&&cue.y<status.y+status.h&&cue.y+cue.h>status.y,false);
 }
});
