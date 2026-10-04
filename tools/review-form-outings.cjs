#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2],out:process.argv[3]||'/tmp/nq-outings-review',name:'connected Worldwake form outings',publishedHost:true,
 modes:process.env.NQ_REVIEW_MODES?process.env.NQ_REVIEW_MODES.split(','):['touch','controller'],
 async run({page,mode,frames,next,drain,walkTo,shot,reload}){
  const trails=await page.evaluate(()=>G.FORM_TRAILS.map(t=>({id:t.id,formId:t.formId,region:t.region,mark:t.mark})));
  const point=(x,y)=>walkTo(x*16+8,y*16+8);
  async function cast(button){
   if(mode==='controller'){
    const b=Array(16).fill(0);b[button==='a'?0:2]=1;
    await page.evaluate(b=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b})),b);await frames(1);
    await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));
   }else{const r=await page.locator('#btn-'+button).boundingBox();await page.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);}
   await frames(6);
  }
  async function cross(to,dy){
   const from=await page.evaluate(()=>G.state.mapId),key=dy<0?'ArrowUp':'ArrowDown';
   if(mode==='controller')await page.evaluate(dy=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,dy,0,0],b:Array(16).fill(0)})),dy);
   else await page.keyboard.down(key);
   for(let i=0;i<100&&await page.evaluate(()=>G.state.mapId)===from;i++)await frames(1);
   if(mode==='controller')await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));
   else await page.keyboard.up(key);
   assert.equal(await page.evaluate(()=>G.state.mapId),to);await frames(20);await drain();await frames(15);
  }
  for(const trail of trails){
   // An earned guardian checkpoint isolates each new route. Travel uses feet
   // and portals; combat fixtures isolate the passive rather than boss balance.
   await page.evaluate(t=>{
    G.state.opening.started=G.state.opening.complete=true;G.state.delivery.complete=true;G.state.stars=40;
    G.state.items=['trophy-heartwood-crown','trophy-mire-pearl'];G.ensureTown().requests=['recipes','beacon'];G.ensureTown().followedRequest=null;
    G.state.worldwake.marks=[t.mark];if(!G.state.claimedForms.includes(t.formId))G.state.claimedForms.push(t.formId);
    G.state.formOutings={active:{formId:t.formId,scenes:[],arts:[]},features:[]};G.state.formEchoes=[];
    G.setForm(t.formId);G.world.load(t.region,{x:7,y:2});G.state.enemies=[];G.state.bossCutscene=null;
   },trail);await drain();await frames(20);await point(7,1);await cross(trail.id,-1);await shot(trail.id+'-arrival');
   await page.evaluate(()=>G.state.enemies=[]);await point(5,22);await page.evaluate(()=>G.state.lastSign=null);await frames(1);await shot(trail.id+'-neighbours');await drain();
   await page.evaluate(id=>{
    const p=G.state.player;Object.assign(p,{x:160,y:296,dir:{x:1,y:0},cooldowns:{},damageTaken:0,mana:12});
    G.state.projectiles=[];G.state.passiveShelters=[];G.state.safeLights=[];
    if(['golem','lanternWisp'].includes(id)){const e=G.makeEnemy('wisp',230,296);e.shootT=.2;G.state.enemies=[e];}
    else if(id==='weaver')G.state.enemies=[G.makeEnemy('mirageSkater',185,296),G.makeEnemy('mirageSkater',218,296)];
    else if(id==='bellkeeper')G.state.enemies=[G.makeEnemy('mirageSkater',180,296),G.makeEnemy('mirageSkater',184,306)];
    else if(id==='griffin')G.state.enemies=[G.makeEnemy('sunHopper',168,296),G.makeEnemy('sunHopper',170,306)];
    else G.state.enemies=[G.makeEnemy('cairnWalker',182,296)];
   },trail.formId);
   if(['golem','lanternWisp'].includes(trail.formId)){await cast('b');await frames(35);}
   else if(trail.formId==='weaver'||trail.formId==='bellkeeper'){await cast('a');await cast('b');await frames(12);}
   else if(trail.formId==='griffin'){
    // Both input modes use real movement. A held controller packet is kept
    // through the attack so Slipstream gets its actual moving-body condition.
    if(mode==='controller'){
     await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[1,0,0,0],b:[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]})));await frames(1);
     await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));await frames(6);
    }else{await page.keyboard.down('ArrowRight');await cast('a');await page.keyboard.up('ArrowRight');}
   }else{for(let i=0;i<7&&!await page.evaluate(id=>G.state.formOutings.features.includes(id),trail.formId);i++){await cast('a');await frames(13);}}
   assert.equal(await page.evaluate(id=>G.state.formOutings.features.includes(id),trail.formId),true,'actual input demonstrates '+trail.formId);
   assert.equal(await page.evaluate(()=>G.world.solid(21*16+8,19*16+8)),false);await shot(trail.id+'-strength');
   await page.evaluate(()=>{G.state.enemies=[];G.state.projectiles=[];});await point(12,18);await point(12,19);await point(25,19);
   await shot(trail.id+'-crossing');await point(38,19);await next();await shot(trail.id+'-picnic');await drain();await reload();
   assert.equal(await page.evaluate(id=>G.state.formOutings.active?.formId===id&&G.state.formOutings.features.includes(id),trail.formId),true);
   assert.equal(await page.evaluate(()=>G.world.solid(21*16+8,19*16+8)),false);await shot(trail.id+'-restored');
   await page.evaluate(()=>G.state.enemies=[]);await point(25,19);await point(12,19);await point(4,19);await point(4,23);await cross(trail.region,1);
   assert.equal(await page.evaluate(()=>G.world.isSafeSpawn(G.state.player.x,G.state.player.y)),true);
  }
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
