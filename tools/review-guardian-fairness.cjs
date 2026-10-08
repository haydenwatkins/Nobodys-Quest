#!/usr/bin/env node
'use strict';
// Controlled chapter/position/health checkpoint; actual attacks and phase UI.
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2],out:process.argv[3]||'/tmp/nq-guardian-fairness',name:'guardian fairness',publishedHost:true,
 async run({page,frames,next,drain,shot}){
  await page.evaluate(()=>{
   G.state.opening.complete=true;G.state.delivery.complete=true;G.state.items.push('harbor-pearl');G.state.claimedForms.push('wizard');G.state.stars=40;
   G.world.load('sunkenMarsh');G.setForm('wizard');G.setComfortSetting('bossAssistance',true);
  });await drain();
  await page.evaluate(()=>{
   const e=G.state.enemies.find(e=>e.id==='mireQueen');window.reviewGuardian=e;G.state.enemies=[e];G.state.projectiles=[];G.state.bossCutscene=null;
   const point=[[-24,0],[24,0],[0,-24],[0,24]].map(([dx,dy])=>({x:e.x+dx,y:e.y+dy})).find(p=>G.world.isSafeSpawn(p.x,p.y));if(!point)throw Error('missing ordinary approach');
   Object.assign(G.state.player,{...point,invuln:100,cooldowns:{},dir:{x:e.x-point.x,y:e.y-point.y}});
   Object.assign(e,{bossEngaged:true,bossIntroT:0,bossTelegraphT:.001,bossPendingAction:'mireVolley'});
   G.updateEnemies(.01);window.reviewWarning=G.state.bossHazards[0].warning;
  });await frames(8);await shot('helped-volley-warning');
  assert.ok(await page.evaluate(()=>window.reviewWarning>=1.15));assert.equal(await page.evaluate(()=>G.state.projectiles.length),0,'the helped warning has not launched early');
  await frames(17);assert.ok(await page.evaluate(()=>G.state.projectiles.some(p=>p.owner===window.reviewGuardian)));
  await shot('helped-volley-release');
  await page.evaluate(()=>{
   const e=window.reviewGuardian;window.reviewOldShots=G.state.projectiles.filter(p=>p.owner===e);e.ward.hp=0;e.hp=e.def.hp*.67+.1;G.state.player.cooldowns={};
  });await next();await frames(5);
  assert.equal(await page.evaluate(()=>window.reviewGuardian.bossPhase),2,'native Curse starts the next phase');
  assert.equal(await page.evaluate(()=>window.reviewOldShots.every(p=>p.dispelled)),true,'the old actual volley disperses before phase introduction');
  assert.equal(await page.evaluate(()=>G.state.projectiles.some(p=>p.owner===window.reviewGuardian&&!p.fromPlayer&&!p.dispelled)),false);
  await frames(60);
  assert.equal(await page.evaluate(()=>window.reviewPaint.map(p=>p.text).join(' ').includes(window.reviewGuardian.def.boss.phaseLine)),true,'the complete phase explanation is actually painted');
  await shot('native-next-phase');await drain();
  assert.equal(await page.evaluate(()=>window.reviewGuardian.bossPendingAction),null);
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
