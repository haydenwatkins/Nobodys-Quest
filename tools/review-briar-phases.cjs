#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
review({url:'https://quest-review.example/',out:process.argv[2]||'/tmp/nq-briar-phases',name:'Briar later gardens',publishedHost:true,modes:process.argv.includes('--portrait')?['touch']:['touch','controller'],viewports:process.argv.includes('--portrait')?{touch:{width:768,height:1024}}:{},async run({page,mode,frames,next,drain,shot,reload,pad}){
 // Earned body and phase checkpoint for layout only; native phase/action/warning code.
 await page.evaluate(()=>{Object.assign(G.state.opening,{started:true,version:2,complete:true});G.state.delivery.complete=true;G.state.claimedForms.push('wizard');G.setForm('wizard');G.world.load('druidTrial');window.reviewBriar=G.state.enemies.find(e=>!e.dead&&e.id==='grandmotherBriar');Object.assign(G.state.player,{x:reviewBriar.x-70,y:reviewBriar.y});});await frames(2);await drain();
 for(const phase of [2,3]){
  await page.evaluate(phase=>{reviewBriar.hp=phase===2?44:22;Object.assign(G.state.player,{x:reviewBriar.x-60,y:reviewBriar.y});},phase);await frames(2);await drain();
  for(let i=0;i<300&&!await page.evaluate(phase=>G.state.bossHazards.some(h=>h.briarBed&&h.phase===phase),phase);i++){await frames(1);await drain();}
  assert.equal(await page.evaluate(()=>reviewBriar.bossPhase),phase);assert.ok(await page.evaluate(phase=>G.state.bossHazards.some(h=>h.briarBed&&h.phase===phase),phase));await shot('phase-'+phase+'-warning');
  await page.evaluate(()=>Object.assign(G.state.player,{x:reviewBriar.x,y:reviewBriar.y}));await frames(28);await shot('phase-'+phase+'-bloom');
 }

}}).catch(e=>{console.error(e);process.exitCode=1;});
