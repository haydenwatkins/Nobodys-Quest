#!/usr/bin/env node
'use strict';
// Independent supplied earned-state/pose fixtures. Real native first actions,
// Canvas and touch/controller layouts; not complete fights or a campaign.
const assert=require('node:assert/strict'),review=require('./lib/browser-review.cjs');
review({url:process.argv[2]||'https://quest-review.example/',out:process.argv[3]||'/tmp/nq-court-edges',name:'Guardian court edges',publishedHost:true,modes:process.argv.includes('--portrait')?['touch']:undefined,viewports:process.argv.includes('--portrait')?{touch:{width:768,height:1024}}:{},
 async run({page,frames,drain,shot,mode,hd}){
  const roster=await page.evaluate(()=>Object.values(G.enemies).filter(d=>d.miniboss).map(d=>({id:d.id,map:Object.values(G.maps).find(m=>Object.values(m.legend||{}).some(c=>c.enemy===d.id))?.id})));
  assert.equal(roster.length,19);assert.ok(roster.every(d=>d.map));
  const requested=process.argv.find(a=>a.startsWith('--only='))?.slice(7).split(',');
  assert.ok(!(requested&&process.argv.includes('--pilot')),'choose either --only or --pilot');
  if(requested){assert.ok(requested.length&&requested.every(id=>id&&roster.some(d=>d.id===id)),`unknown or empty guardian selection: ${requested.join(',')}`);}
  const ids=process.argv.includes('--pilot')?roster.filter(d=>['royalFool','paperRonin','lastWorldbearer','godAvatar'].includes(d.id)):requested?roster.filter(d=>requested.includes(d.id)):roster;
  assert.ok(ids.length,'guardian selection cannot be empty');
  if(process.argv.includes('--heartwood'))for(const d of ids)if(d.id==='ancientTreant')d.map='heartwood';
  for(const {id,map}of ids)for(const edge of (process.argv.includes('--pilot')?['north']:['north','south','east','west'])){
   const fixture=await page.evaluate(({id,map,edge})=>{
    Object.assign(G.state.opening,{started:true,version:2,complete:true});Object.assign(G.state.delivery,{started:true,complete:id!=='tollkeeper',keeper:false,lamps:[2,2]});G.state.items=Object.keys(G.WORLDWAKE_MARKS).filter(item=>item!==G.enemies[id].trophy);G.state.worldwake=G.normalizeWorldwake(undefined,{items:G.state.items});G.state.claimedForms=G.formOrder.slice();G.questsDone.splice(0,G.questsDone.length,...G.formOrder.flatMap(id=>G.forms[id].quests.map(q=>q.id)));G.setForm('nobody');G.world.load(map);
    const e=G.state.enemies.find(e=>e.id===id);if(!e)throw Error('native guardian missing '+id+' in '+map);G.state.enemies=[e];const p=G.state.player;
    const b=e.def.worldbearer?{left:Math.max(24,e.x-180),right:Math.min(G.state.mapW*16-24,e.x+180),top:Math.max(24,e.y-120),bottom:Math.min(G.state.mapH*16-24,e.y+120)}:{left:24,right:G.state.mapW*16-24,top:24,bottom:G.state.mapH*16-24};
    const center={x:(b.left+b.right)/2,y:(b.top+b.bottom)/2},target={x:edge==='west'?b.left+4:edge==='east'?b.right-4:center.x,y:edge==='north'?b.top+4:edge==='south'?b.bottom-4:center.y},dir={x:edge==='west'?1:edge==='east'?-1:0,y:edge==='north'?1:edge==='south'?-1:0};
    let best=null;const clear=(x,y,r)=>[-r,r].every(dx=>[-r,r].every(dy=>!G.world.solid(x+dx,y+dy)));
    for(let y=b.top+4;y<=b.bottom-4;y+=4)for(let x=b.left+4;x<=b.right-4;x+=4){const q={x:x+dir.x*56,y:y+dir.y*56};if(!clear(x,y,e.def.size/2)||!clear(q.x,q.y,6))continue;const cost=Math.hypot(x-target.x,y-target.y);if(!best||cost<best.cost)best={x,y,p:q,cost};}
    if(!best)throw Error('no native clear edge pose '+id+'/'+edge);Object.assign(e,{x:best.x,y:best.y,bossEngaged:true,bossIntroT:0,bossSpecialT:.001,bossRecoverT:0,bossPattern:0});Object.assign(p,{...best.p,mana:0,manaRegenDelay:1000,damageTaken:0,invuln:0,knockVx:0,knockVy:0});G.state.bossCutscene=null;window.edgeGuardian=e;
    return {id,map,edge,scope:e.def.worldbearer?'regional home-court native floor':'native-floor trial/road boundary',intended:target,actual:{x:e.x,y:e.y}};
   },{id,map,edge});await drain();await frames(1);await drain();await frames(19);await drain();
   const view=await page.evaluate(()=>{const e=edgeGuardian,p=G.state.player,cam=G.fieldCamera(),m=G.spriteMetrics(e.def.sprite),scale=e.def.boss?.spriteScale||1,body=G.spriteMetrics(G.forms[G.state.formId].sprite),game=document.getElementById('game').getBoundingClientRect(),controls=document.getElementById('btn-zone').getBoundingClientRect();return {mapId:G.state.mapId,knockout:!!G.state.knockout,cam,boss:{left:e.x-m.w*scale/2-cam.x,right:e.x+m.w*scale/2-cam.x,top:e.y-m.h*scale-cam.y,bottom:e.y-cam.y},player:{left:p.x-body.w/2-cam.x,right:p.x+body.w/2-cam.x,top:p.y-body.h-cam.y,bottom:p.y-cam.y},controls:{left:(controls.left-game.left)*G.W/game.width,visible:G.input.isTouch&&!G.input.hasGamepad&&controls.top<game.top+game.height},fields:[...G.state.bossHazards,...G.state.openingHazards].filter(h=>h.owner===e).map(h=>h.kind),heart:G.comfortSetting('easyMode'),guardian:G.comfortSetting('bossAssistance')};});
   assert.equal(view.mapId,map);assert.equal(view.knockout,false);assert.ok(view.player.top>=25&&view.player.bottom<180,JSON.stringify({fixture,view}));assert.ok(view.boss.top>=25&&view.boss.bottom<180,JSON.stringify({fixture,view}));if(view.controls.visible&&view.controls.left>160)assert.ok(view.player.right<view.controls.left&&view.boss.right<view.controls.left,JSON.stringify({fixture,view}));assert.equal(view.heart,false);assert.equal(view.guardian,false);await shot(id+'-'+edge+'-native-committed-action');console.log(JSON.stringify({mode,hd,...fixture,...view}));
  }
 }
}).catch(e=>{console.error(e);process.exitCode=1;});
