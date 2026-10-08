#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2],out:process.argv[3]||'/tmp/patchling-form-return',name:'form discoveries wait for chosen good news',publishedHost:true,
 async run({page,frames,drain,shot}){
  await page.evaluate(()=>{
   Object.assign(G.state.opening,{started:true,complete:true,bell:true,version:2});G.state.delivery.complete=true;
   G.state.stars=40;G.state.items=['trophy-heartwood-crown','trophy-mire-pearl'];G.state.claimedForms=['rat','knight','wizard','griffin'];
   G.questsDone=[G.forms.knight.quests[0].id];G.state.formOutings={active:null,features:['griffin']};
   G.ensureTown().requests=['recipes','beacon'];G.world.load('galecrestPostroad');G.state.enemies=[];G.followSunriseRequest('trail-griffin');
  });await drain();await frames(5);
  assert.equal(await page.evaluate(()=>G.formDiscoveryAllowed()),false);
  await page.evaluate(()=>G.ui.openMenu());await page.locator('#menu [data-menu-route="forms"]').first().click();await frames(3);
  await page.locator('[data-form-select="ranger"]').first().click();await frames(3);
  await shot('return-form-lab');assert.ok(await page.locator('.unlock-panel').count(),await page.locator('#menu').innerText());
  assert.match(await page.locator('.unlock-panel').innerText(),/helped Parcel.*good news.*set the promise aside/s);
  assert.equal(await page.locator('#menu').evaluate(el=>el.scrollWidth>el.clientWidth),false);
  await page.locator('.unlock-panel').scrollIntoViewIfNeeded();await frames(3);
  assert.equal(await page.locator('.unlock-panel').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight;}),true);
  await shot('good-news-before-another-form');
  await page.locator('#menu [data-menu-section="journey"]').first().click();await frames(3);
  await page.locator('[data-stop-request]').first().click();await frames(3);
  assert.equal(await page.evaluate(()=>G.formDiscoveryAllowed()),true);await shot('journey-set-aside');
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
