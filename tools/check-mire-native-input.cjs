#!/usr/bin/env node
'use strict';
// Small native-input checkpoints, separate from full encounter balance runs.
const assert=require('node:assert/strict'),runtime=require('./lib/classic-runtime.cjs');
{
 const r=runtime(),{G}=r;G.state.items.push('trophy-mire-pearl');G.state.guardianChallenges.queen.counterLearned=true;r.load('sunkenMarsh');r.drain();assert.ok(G.beginMireRematch());
 const e=G.state.enemies.find(e=>e.queenLocalRematch);let hurts=0;G.events.on('playerHurt',()=>hurts++);
 for(let i=0;i<1200;i++){r.step(.05);r.drain();}
 assert.equal(hurts,0);assert.equal(e.bossEngaged,false);assert.equal(e.x,104);assert.equal(e.y,152);
 console.log('PASS a chosen unengaged Queen stays in her court for 60 native seconds, with all nine regional enemies');
}
for(const mana of [0,2]){
 const r=runtime(),{G}=r;Object.assign(G.state.opening,{started:true,complete:true});G.state.delivery.complete=true;
 // Earned Cartwheel checkpoint; casting still pays its real native price.
 G.questsDone.push(G.forms.nobody.quests[0].id);r.load('sunkenMarsh');r.drain();G.setForm('nobody');
 const e=G.state.enemies.find(e=>e.id==='mireQueen');G.state.enemies=[e];const p=G.state.player;
 Object.assign(p,{x:140,y:152,dir:{x:1,y:0},mana,manaRegenDelay:100});G.leaveMireCrust({owner:e,mireAftermath:{x:164,y:152}});
 const root=G.state.enemies.find(e=>e.mireCrust);assert.equal(G.getLoadout('nobody')[1],'cartwheel');r.taps.add('b');for(let i=0;i<12;i++){r.step(.025);r.drain();}
 assert.equal(p.mana,0);assert.equal(e.ward.hp,5);assert.equal(e.hp,36);
 if(mana){assert.ok(p.x>=192);assert.equal(e.mireCounters,1);assert.equal(root.dead,true);}else{assert.equal(e.mireCounters,undefined);assert.equal(root.dead,false);assert.equal(p.x,140);}
 console.log(`PASS native Cartwheel B ${mana?'cracks mire with its real 2 mana price and full travel':'retains its empty-mana refusal; a free attack remains available'}`);
}
