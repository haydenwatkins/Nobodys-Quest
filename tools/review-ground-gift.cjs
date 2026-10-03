#!/usr/bin/env node
// Controlled final-blow fixtures, not balanced fights or physical-device tests.
// Run a static server first. Usage: node tools/review-ground-gift.cjs [guardian] [baseURL] [outputDir]
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const scenarios={
 admiralTortoise:{map:'turtleTrial',item:'tide-shell',stars:28,form:'nobody',button:'a',recovery:true},
 paperRonin:{map:'samuraiTrial',item:'paper-crane',stars:28,form:'ranger',button:'a',recovery:true},
 professorPerihelion:{map:'astronomerTrial',item:'orrery-key',stars:28,form:'ranger',button:'b',recovery:true},
 grandmotherBriar:{map:'druidTrial',item:'elder-acorn',stars:28,form:'wizard',button:'b',recovery:true},
 ancientTreant:{map:'heartwood',item:'trophy-heartwood-crown',stars:3},
 mireQueen:{map:'sunkenMarsh',item:'trophy-mire-pearl',stars:5},
 eclipseKnight:{map:'emberRidge',item:'trophy-eclipse-sigil',stars:7},
 skySovereign:{map:'windscarCanyon',item:'trophy-sky-sovereign',stars:24,form:'ranger',button:'a',mark:'sky'},
 oldMason:{map:'hangingGardens',item:'trophy-old-mason',stars:24,form:'nobody',button:'a',mark:'stone',crossings:[['upper',248,152,0,48],['lower',248,280,0,48]]},
 silkMatriarch:{map:'rootdeepHollow',item:'trophy-silk-matriarch',stars:40,form:'wizard',button:'b',mark:'thread',crossings:[['western',232,328,48,0],['eastern',440,328,48,0]]},
 bellTitan:{map:'frostbellTundra',item:'trophy-bell-titan',stars:40,form:'ranger',button:'b',mark:'echo',crossings:[['western',248,280,0,64],['eastern',472,280,0,64]]},
 lastWorldbearer:{map:'titanGrave',item:'trophy-last-worldbearer',stars:40,form:'nobody',button:'a',mark:'heart'},
 lanternKeeper:{map:'stormspinePeaks',item:'trophy-lantern-keeper',stars:40,form:'wizard',button:'b',mark:'light',crossings:[['western',248,280,0,80],['eastern',456,280,0,80]]},
};
const guardian=process.argv[2]||'eclipseKnight',scenario=scenarios[guardian];
if(!scenario)throw new Error(`Unknown guardian ${guardian}; choose ${Object.keys(scenarios).join(', ')}`);
const baseURL=process.argv[3]||'http://127.0.0.1:8000/',output=path.resolve(process.argv[4]||`/tmp/nobodys-quest-${guardian}-gift-scenes`);
const {chromium}=require(require.resolve('playwright',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']}),out=output;fs.mkdirSync(out,{recursive:true});
 try{for(const [mode,viewport]of [['touch',{width:667,height:375}],['controller',{width:1280,height:720}]])for(const hd of [true,false]){
  const ctx=await browser.newContext({viewport,hasTouch:mode==='touch',...(mode==='controller'?{userAgent:'NobodysQuestTV/1.0 Chromium review'}:{})}),page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{window.reviewClock=1000;window.requestAnimationFrame=cb=>(window.reviewFrame=cb,1);window.cancelAnimationFrame=()=>{};
   const fill=CanvasRenderingContext2D.prototype.fillText,clear=CanvasRenderingContext2D.prototype.clearRect;window.reviewHudText=[];
   CanvasRenderingContext2D.prototype.fillText=function(text,...args){if(this.canvas.id==='ui')window.reviewHudText.push(String(text));return fill.call(this,text,...args);};
   CanvasRenderingContext2D.prototype.clearRect=function(...args){if(this.canvas.id==='ui')window.reviewHudText=[];return clear.apply(this,args);};});
  await page.goto(baseURL);await page.waitForFunction(()=>typeof G!=='undefined'&&G.state?.player);
  const frames=async(n=5)=>page.evaluate(n=>{for(let i=0;i<n;i++){const cb=window.reviewFrame;window.reviewFrame=null;window.reviewClock+=50;if(cb)cb(window.reviewClock);}},n);
  async function connect(){if(mode==='controller'){await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'c',id:'Review TV controller'})));await frames(1);assert.equal(await page.evaluate(()=>G.input.hasGamepad),true);}}
  async function action(button='a'){
   if(mode==='controller'){await page.evaluate(button=>{const b=[0,0,0,0];b[button==='b'?2:0]=1;window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b}));},button);await frames(1);await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:[0,0,0,0]})));}
   else {const box=await page.locator('#btn-'+button).boundingBox();assert.ok(box);await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);}
   await frames(18);
  }
  async function drain(){for(let i=0;i<50&&await page.evaluate(()=>G.ui.dialogueOpen);i++){await frames(5);if(mode==='touch')await page.touchscreen.tap(viewport.width/2,viewport.height/2);else await action();await frames(5);}assert.equal(await page.evaluate(()=>G.ui.dialogueOpen),false);}
  await connect();await drain();await page.evaluate(({hd,guardian,scenario})=>{
   G.state.opening.complete=G.state.delivery.complete=true;G.state.claimedForms=['rat','knight','wizard',...(scenario.form?[scenario.form]:[])];G.state.stars=scenario.stars;G.state.items=['orchard-ribbon','keeper-lantern','sunrise-seal'];G.questsDone=Object.values(G.forms).flatMap(form=>form.quests.map(q=>q.id));Object.assign(G.ensureTown(),{founded:true,introduced:true,residents:4,spirit:20});G.setForm(scenario.form||'wizard');G.world.load(scenario.map);G.setHdPilot(hd);G.state.bossCutscene=null;
   const e=G.state.enemies.find(e=>e.def.id===guardian);G.state.enemies=[e];window.reviewGuardian=e;e.bossEngaged=true;e.bossIntroT=0;if(scenario.mark||scenario.recovery)e.bossRecoverT=999;e.ward.hp=1;e.hp=1;const safe=G.world.safeArrival(e.x+(scenario.mark||scenario.recovery?110:36),e.y);Object.assign(G.state.player,safe,{dir:{x:-1,y:0},invuln:999,mana:G.playerMaxMana()});
   // Wizard's dark spell matches both Queen/Knight wards. Treant uses its native blunt basic art.
   if(guardian==='ancientTreant'||guardian==='oldMason'||guardian==='lastWorldbearer'||guardian==='admiralTortoise'){G.setForm('nobody');Object.assign(G.state.player,{x:e.x+14,y:e.y,dir:{x:-1,y:0}});}
  },{hd,guardian,scenario});await drain();await frames(80);
  for(let i=0;i<8&&!await page.evaluate(()=>window.reviewGuardian.dead);i++){await action(scenario.button||(guardian==='ancientTreant'?'a':'b'));await drain();}
  assert.equal(await page.evaluate(()=>window.reviewGuardian.dead),true);
  assert.equal(await page.evaluate(item=>G.state.items.includes(item),scenario.item),false);
  assert.ok(await page.evaluate(item=>G.groundRewardFor(item),scenario.item));
  assert.equal(await page.evaluate(()=>G.state.stars),scenario.stars);
  if(scenario.mark)assert.equal(await page.evaluate(mark=>G.hasWorldMark(mark),scenario.mark),false);
  async function approachGift(stopDistance=0){
  for(let i=0;i<180&&!await page.evaluate(item=>G.state.items.includes(item),scenario.item);i++) {
   if(await page.evaluate(()=>G.ui.dialogueOpen)){
    if(mode==='controller')await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:[0,0,0,0]})));
    else for(const key of ['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'])await page.keyboard.up(key);
    await drain();
   }
   const v=await page.evaluate(item=>{const r=G.groundRewardFor(item),p=G.state.player;return r?{dx:r.x-p.x,dy:r.y-p.y}:null;},scenario.item);if(!v||Math.hypot(v.dx,v.dy)<=stopDistance)break;
   if(mode==='controller')await page.evaluate(({dx,dy})=>{const m=Math.hypot(dx,dy);window.__nqTvPad(JSON.stringify({t:'s',a:[dx/m,dy/m,0,0],b:[0,0,0,0]}));},v);
   else {
    const key=Math.abs(v.dx)>Math.abs(v.dy)?(v.dx>0?'ArrowRight':'ArrowLeft'):(v.dy>0?'ArrowDown':'ArrowUp');
    for(const candidate of ['ArrowRight','ArrowLeft','ArrowDown','ArrowUp']){if(candidate===key)await page.keyboard.down(candidate);else await page.keyboard.up(candidate);}
   }
   await frames(1);
  }
  if(mode==='controller')await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:[0,0,0,0]})));else for(const key of ['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'])await page.keyboard.up(key);await frames(1);await drain();
  }
  async function visibleGift(){await approachGift(40);await frames(1);const result=await page.evaluate(()=>{const reward=G.nearGroundReward();return !!reward&&window.reviewHudText.includes(G.groundRewardInfo(reward).name)&&window.reviewHudText.join(' ').includes(G.groundRewardInfo(reward).purpose)&&window.reviewHudText.join(' ').includes('Walk over the treasure to collect');});assert.equal(result,true,'a nearby ground gift paints its name without requiring dialogue');}
  await frames(80);await drain();await visibleGift();await page.screenshot({path:`${out}/${mode}-${hd?'hd':'base'}-ground.png`});
  await page.evaluate(()=>G.saveGame());await page.reload();await page.waitForFunction(()=>typeof G!=='undefined'&&G.state?.player);await connect();await drain();await frames(80);await drain();
  assert.equal(await page.evaluate(guardian=>G.state.enemies.some(e=>e.def.id===guardian),guardian),false);assert.ok(await page.evaluate(item=>G.groundRewardFor(item),scenario.item));assert.equal(await page.evaluate(item=>G.state.items.includes(item),scenario.item),false);
  await visibleGift();await page.screenshot({path:`${out}/${mode}-${hd?'hd':'base'}-restored.png`});
  await approachGift();
  assert.equal(await page.evaluate(item=>G.state.items.includes(item),scenario.item),true);
  assert.equal(await page.evaluate(()=>G.state.stars),scenario.stars+1);
  assert.equal(await page.evaluate(item=>G.groundRewardFor(item),scenario.item),null);
  assert.equal(await page.evaluate(()=>G.activeKeepsake()),null);
  await page.screenshot({path:`${out}/${mode}-${hd?'hd':'base'}-collected.png`});
  await frames(30);assert.equal(await page.evaluate(()=>G.state.stars),scenario.stars+1);
  if(scenario.mark){
   assert.equal(await page.evaluate(mark=>G.hasWorldMark(mark),scenario.mark),true);
   assert.equal(await page.evaluate(()=>G.activeWorldMarkDiscipline()),null);
   await page.evaluate(()=>G.saveGame());await page.reload();await page.waitForFunction(()=>typeof G!=='undefined'&&G.state?.player);await connect();await drain();await frames(80);await drain();
   assert.equal(await page.evaluate(mark=>G.ensureWorldwake().marks.filter(id=>id===mark).length,scenario.mark),1);
   assert.equal(await page.evaluate(()=>G.state.restorationDetails.length),28);
   await page.evaluate(()=>{G.state.enemies=[];G.state.projectiles=[];G.state.bossHazards=[];});
   if(scenario.mark==='sky'){
    await page.evaluate(()=>Object.assign(G.state.player,{x:11*16+8,y:20*16+8}));await frames(5);await action();
    assert.equal(await page.evaluate(()=>G.state.player.x),33*16+8);await frames(60);await page.screenshot({path:`${out}/${mode}-${hd?'hd':'base'}-lift-up.png`});
    await action();assert.equal(await page.evaluate(()=>G.state.player.x),11*16+8);await frames(60);await page.screenshot({path:`${out}/${mode}-${hd?'hd':'base'}-lift-down.png`});
   }else if(scenario.crossings){
    for(const [name,x,y,dx,dy]of scenario.crossings){
     await page.evaluate(({x,y})=>Object.assign(G.state.player,{x,y}),{x,y});await frames(5);
     const key=dx?'ArrowRight':'ArrowDown',distance=Math.hypot(dx,dy);
     if(mode==='controller')await page.evaluate(({dx,dy})=>window.__nqTvPad(JSON.stringify({t:'s',a:[Math.sign(dx),Math.sign(dy),0,0],b:[0,0,0,0]})),{dx,dy});else await page.keyboard.down(key);
     for(let i=0;i<120;i++){
      await frames(1);
      const travelled=await page.evaluate(({x,y})=>Math.hypot(G.state.player.x-x,G.state.player.y-y),{x,y});
      if(travelled>=distance*.4&&travelled<=distance*.65)await page.screenshot({path:`${out}/${mode}-${hd?'hd':'base'}-crossing-${name}.png`});
      if(travelled>=distance)break;
     }
     if(mode==='controller')await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:[0,0,0,0]})));else await page.keyboard.up(key);
     assert.ok(await page.evaluate(({x,y,dx,dy})=>dx?G.state.player.x>=x+dx:G.state.player.y>=y+dy,{x,y,dx,dy}),`${name} passage crossed through native movement`);
     assert.ok(fs.existsSync(`${out}/${mode}-${hd?'hd':'base'}-crossing-${name}.png`));
    }
   }
   if(scenario.mark==='heart'){
    async function heartRoad(from,to,tileX,tileY,dy){
     await page.evaluate(({tileX,tileY})=>{G.state.enemies=[];G.state.projectiles=[];G.state.bossHazards=[];Object.assign(G.state.player,{x:tileX*16+8,y:tileY*16+8});},{tileX,tileY});await frames(20);
     const key=dy>0?'ArrowDown':'ArrowUp';
     if(mode==='controller')await page.evaluate(dy=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,dy,0,0],b:[0,0,0,0]})),dy);else await page.keyboard.down(key);
     for(let i=0;i<60&&await page.evaluate(()=>G.state.mapId)===from;i++){await frames(1);if(await page.evaluate(()=>G.ui.dialogueOpen))await drain();}
     if(mode==='controller')await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:[0,0,0,0]})));else await page.keyboard.up(key);
     assert.equal(await page.evaluate(()=>G.state.mapId),to);await drain();await frames(80);await drain();
     assert.equal(await page.evaluate(()=>G.world.isSafeSpawn(G.state.player.x,G.state.player.y)),true);
     await page.screenshot({path:`${out}/${mode}-${hd?'hd':'base'}-${to==='overworld'?'road-home':'road-back'}.png`});
    }
    await heartRoad('titanGrave','overworld',23,27,1);await heartRoad('overworld','titanGrave',114,1,-1);
   }
   assert.equal(await page.evaluate(()=>G.state.stars),scenario.stars+1);
  }
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  console.log(`PASS ${guardian} ${mode} ${hd?'HD':'BASE'}: actual spell/attack input, ward/final blow, pending gift, real save/boot, no respawn, movement claim, +1 star once, no automatic Keepsake`);await ctx.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
