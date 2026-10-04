#!/usr/bin/env node
const assert=require('node:assert/strict'),path=require('node:path'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2],out:path.resolve(process.argv[3]||'/tmp/nobodys-quest-prairie-scenes'),name:'Prairie native timed circuit, saved satchel, collection and repeat',
 run:async({page,hd,frames,next,drain,walkGift,walkTo,visibleGift,shot,reload})=>{
  await page.evaluate(hd=>{
   G.state.opening=G.normalizeOpening({complete:true});G.state.delivery=G.normalizeDelivery({complete:true});
   G.state.items=['orchard-ribbon','sunrise-seal','keeper-lantern'];G.state.stars=24;
   G.state.claimedForms=G.formOrder.filter(f=>!['nobody','god'].includes(f));G.questsDone=G.formOrder.filter(f=>f!=='god').flatMap(f=>G.forms[f].quests.map(q=>q.id));
   G.state.story=G.normalizeStory({prologueSeen:true,seenChapters:[0,1,2,3,4,5],lastChapter:5});
   Object.assign(G.ensureTown(),{founded:true,introduced:true,residents:4,spirit:20,prairieBest:null,prairieInvited:true});
   G.setForm('rat');G.setHdPilot(hd);G.world.load('sunstepPrairie');G.state.enemies=[];Object.assign(G.state.player,{x:184,y:328,damageTaken:0,invuln:999});
  },hd);await drain();await frames(80);await drain();
  async function circuit(){
   await next();assert.ok(await page.evaluate(()=>G.prairieSurvey().active));
   for(const [tx,ty]of [[12,8],[31,8],[34,20],[11,20]]){
    // Plan around the native terrain, then steer the real player through it.
    const points=await page.evaluate(({tx,ty})=>{
     const p=G.state.player,sx=Math.floor(p.x/16),sy=Math.floor(p.y/16),q=[[sx,sy]],parents=new Map([[`${sx},${sy}`,null]]),end=`${tx},${ty}`;
     for(let i=0;i<q.length&&!parents.has(end);i++){const [x,y]=q[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=x+dx,ny=y+dy,k=`${nx},${ny}`;if(parents.has(k)||nx<1||ny<1||nx>=G.state.mapW-1||ny>=G.state.mapH-1||!G.world.isSafeSpawn(nx*16+8,ny*16+8))continue;
      parents.set(k,`${x},${y}`);q.push([nx,ny]);
     }}
     if(!parents.has(end))throw Error('courier waypoint is unreachable');
     const path=[];for(let k=end;k;k=parents.get(k))path.push(k.split(',').map(Number));path.reverse();
     return path.filter((p,i)=>i===0||i===path.length-1||(p[0]-path[i-1][0]!==path[i+1][0]-p[0]||p[1]-path[i-1][1]!==path[i+1][1]-p[1])).map(([x,y])=>[x*16+8,y*16+8]);
    },{tx,ty});
    for(const [x,y]of points)await walkTo(x,y);
   }
   assert.equal(await page.evaluate(()=>G.prairieSurvey().active),null);assert.ok(await page.evaluate(()=>G.prairieSurvey().best>0&&G.prairieSurvey().best<=45));
  }
  await circuit();assert.equal(await page.evaluate(()=>G.ensureTown().spirit),20);assert.equal(await page.evaluate(()=>G.state.items.includes('sunstep-courier')),false);
  await visibleGift('sunstep-courier');await shot('ground');const gift=await page.evaluate(()=>({...G.groundRewardFor('sunstep-courier')}));
  await page.evaluate(()=>G.ui.openMenu());assert.ok((await page.locator('#menu').innerText()).includes('Your Courier Satchel waits on the ground'));
  await shot('journal');await page.evaluate(()=>G.ui.closeMenu());await frames(1);
  await reload();assert.equal(await page.evaluate(()=>G.ensureTown().spirit),20);assert.equal(await page.evaluate(()=>G.groundRewardFor('sunstep-courier')?.y),gift.y);
  await page.evaluate(()=>G.state.enemies=[]);await visibleGift('sunstep-courier');await shot('restored');await walkGift('sunstep-courier');
  assert.equal(await page.evaluate(()=>G.ensureTown().spirit),26);await frames(20);await shot('collected');
  await walkTo(184,328);await circuit();assert.equal(await page.evaluate(()=>G.ensureTown().spirit),26);assert.equal(await page.evaluate(()=>G.groundRewardFor('sunstep-courier')),null);await shot('repeat');
  await reload();assert.equal(await page.evaluate(()=>G.ensureTown().spirit),26);assert.equal(await page.evaluate(()=>G.state.items.filter(i=>i==='sunstep-courier').length),1);await page.evaluate(()=>G.state.enemies=[]);await shot('owned-boot');
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
