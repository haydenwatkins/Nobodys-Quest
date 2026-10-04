#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2],out:process.argv[3]||'/tmp/nq-outings-art-review',name:'Worldwake outing scenery and readable context',publishedHost:true,
 async run({page,frames,drain,shot}){
  const trails=await page.evaluate(()=>G.FORM_TRAILS.map(t=>({id:t.id,formId:t.formId,mark:t.mark,sign:t.sign})));
  for(const trail of trails){
   await page.evaluate(t=>{
    G.state.opening.started=G.state.opening.complete=true;G.state.delivery.complete=true;G.state.stars=40;
    G.state.items=['trophy-heartwood-crown','trophy-mire-pearl'];G.ensureTown().requests=['recipes','beacon'];G.ensureTown().followedRequest=null;
    G.state.worldwake.marks=[t.mark];G.state.worldwake.discovered=G.WORLDWAKE_REGIONS.map(r=>r.id);
    if(!G.state.claimedForms.includes(t.formId))G.state.claimedForms.push(t.formId);G.setForm(t.formId);
    G.state.formOutings={active:{formId:t.formId,scenes:[],arts:[]},features:[]};G.world.load(t.id,{x:12,y:18});G.state.enemies=[];G.guidanceShowStoryCard=()=>true;
   },trail);await drain();await frames(100);
   assert.equal(await page.evaluate(()=>window.reviewPaint.map(p=>p.text).join(" ").includes(G.currentTask().short)),true,"the complete outing task is painted");
   await shot(trail.id+'-clearing');
   await page.evaluate(()=>{G.state.player.x=21*16+8;G.state.player.y=17*16+8;});await frames(5);await shot(trail.id+'-before');
   // Visual fixture only. Native demonstrations are checked in the route
   // review and simulation suite; this isolates the scenery after restoration.
   await page.evaluate(id=>{G.state.formOutings.features.push(id);G.applyFormTrailShortcut();},trail.formId);await frames(12);await shot(trail.id+'-after');
   await page.evaluate(()=>{G.state.player.x=5*16+8;G.state.player.y=22*16+8;G.state.lastSign=null;});await frames(200);
   assert.equal(await page.evaluate(()=>G.ui.dialogueOpen),true);
   assert.equal(await page.evaluate(sign=>window.reviewPaint.map(p=>p.text).join(' ').includes(sign.split(' · ')[1].split('. ')[0]),trail.sign),true,'neighbour context is fully readable');await shot(trail.id+'-neighbours');await drain();
   await page.evaluate(()=>{G.state.player.x=38*16+8;G.state.player.y=20*16+8;});await frames(6);await shot(trail.id+'-picnic');
  }
  await page.evaluate(()=>{
   for(const id of ['rat','knight','wizard'])if(!G.state.claimedForms.includes(id))G.state.claimedForms.push(id);
   G.questsDone.push(G.forms.knight.quests[0].id);G.ui.openMenu();
  });
  await page.locator('#menu [data-menu-route="forms"]').first().click();await frames(3);
  await page.locator('[data-form-select="ranger"]').first().click();await frames(3);
  assert.ok(await page.locator('.unlock-panel').innerText().then(t=>t.includes('Learn two lessons')&&t.includes('two of its own arts')));
  assert.equal(await page.locator('#menu').evaluate(el=>el.scrollWidth>el.clientWidth),false);
  assert.equal(await page.locator('.portrait-status').evaluateAll(labels=>labels.some(el=>el.scrollWidth>el.clientWidth)),false);
  await shot('earned-path-waiting');await page.evaluate(()=>G.ui.closeMenu());
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
