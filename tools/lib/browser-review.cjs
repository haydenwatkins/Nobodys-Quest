// Native input/save review shared by authored scenarios. No game grants here.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(require.resolve('playwright',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
module.exports=async function review({url='http://127.0.0.1:8000/',out,name,run,dpr=1,modes=['touch','controller'],viewports={}}){
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});fs.mkdirSync(out,{recursive:true});
 try{for(const mode of modes)for(const hd of [true,false]){
  const viewport=viewports[mode]||(mode==='touch'?{width:667,height:375}:{width:1280,height:720}),context=await browser.newContext({viewport,deviceScaleFactor:dpr,hasTouch:mode==='touch',...(mode==='controller'?{userAgent:'NobodysQuestTV/1.0 Chromium review'}:{})}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{
   window.reviewClock=1000;window.requestAnimationFrame=cb=>(window.reviewFrame=cb,1);window.cancelAnimationFrame=()=>{};window.reviewPaint=[];window.reviewRects=[];window.reviewPixelText=[];
   const fill=CanvasRenderingContext2D.prototype.fillText,rect=CanvasRenderingContext2D.prototype.fillRect,clear=CanvasRenderingContext2D.prototype.clearRect;
   CanvasRenderingContext2D.prototype.fillText=function(text,x,y,...args){if(this.canvas.id==='ui')window.reviewPaint.push({text:String(text),x,y,font:this.font});if(this.canvas.id==='game')window.reviewPixelText.push(String(text));return fill.call(this,text,x,y,...args);};
   CanvasRenderingContext2D.prototype.fillRect=function(x,y,w,h){if(this.canvas.id==='ui')window.reviewRects.push({x,y,w,h,color:this.fillStyle});return rect.call(this,x,y,w,h);};
   CanvasRenderingContext2D.prototype.clearRect=function(...args){if(this.canvas.id==='ui'){window.reviewPaint=[];window.reviewRects=[];}return clear.apply(this,args);};
  });
  const frames=n=>page.evaluate(n=>{for(let i=0;i<n;i++){const cb=window.reviewFrame;window.reviewFrame=null;window.reviewClock+=50;if(cb)cb(window.reviewClock);}},n);
  async function connect(){if(mode==='controller'){await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'c',id:'Review TV controller'})));await frames(1);assert.equal(await page.evaluate(()=>G.input.hasGamepad),true);}}
  async function pad(index){const b=Array(16).fill(0);b[index]=1;await page.evaluate(b=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b})),b);await frames(1);await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));await frames(5);}
  async function next(){if(mode==='controller')await pad(0);else{if(await page.evaluate(()=>G.ui.dialogueOpen))await page.touchscreen.tap(viewport.width/2,viewport.height/2);else{const b=await page.locator('#btn-a').boundingBox();assert.ok(b);await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);}await frames(6);}}
  const offered=()=>page.evaluate(()=>window.reviewPaint.some(p=>p.text.endsWith('Maybe later')));
  async function drain(){for(let i=0;i<60&&await page.evaluate(()=>G.ui.dialogueOpen);i++){assert.equal(await offered(),false,'an NPC choice requires an explicit scenario answer');await frames(5);await next();}assert.equal(await page.evaluate(()=>G.ui.dialogueOpen),false);}
  async function offer(){await next();for(let i=0;i<40&&!await offered();i++)await next();assert.equal(await offered(),true);}
  async function answer(accept){if(mode==='controller')await pad(accept?0:1);else{const p=await page.evaluate(accept=>{const t=window.reviewPaint.find(p=>p.text.endsWith(accept?"I'll help":'Maybe later')),r=document.getElementById('ui').getBoundingClientRect();return {x:r.left+(t.x+8)*r.width/G.W,y:r.top+(t.y+5)*r.height/G.H};},accept);await page.touchscreen.tap(p.x,p.y);await frames(6);}assert.equal(await page.evaluate(()=>G.ui.dialogueOpen),false);}
  async function release(){if(mode==='controller')await page.evaluate(()=>window.__nqTvPad(JSON.stringify({t:'s',a:[0,0,0,0],b:Array(16).fill(0)})));else for(const k of ['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'])await page.keyboard.up(k);}
  async function walkGift(item,distance=0){
   for(let i=0;i<180;i++){
    const v=await page.evaluate(item=>{const r=G.groundRewardFor(item),p=G.state.player;return r?{dx:r.x-p.x,dy:r.y-p.y}:null;},item);if(!v||Math.hypot(v.dx,v.dy)<=distance)break;
    if(mode==='controller')await page.evaluate(({dx,dy})=>{const m=Math.hypot(dx,dy);window.__nqTvPad(JSON.stringify({t:'s',a:[dx/m,dy/m,0,0],b:Array(16).fill(0)}));},v);
    else{const key=Math.abs(v.dx)>Math.abs(v.dy)?(v.dx>0?'ArrowRight':'ArrowLeft'):(v.dy>0?'ArrowDown':'ArrowUp');for(const k of ['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'])if(k===key)await page.keyboard.down(k);else await page.keyboard.up(k);}
    await frames(1);if(await page.evaluate(()=>G.ui.dialogueOpen)){await release();await drain();}
   }
   await release();await frames(1);await drain();
   assert.equal(await page.evaluate(({item,distance})=>{const r=G.groundRewardFor(item),p=G.state.player;return r?Math.hypot(r.x-p.x,r.y-p.y)<=distance:G.state.items.includes(item);},{item,distance}),true,'native movement reaches the gift');
  }
  async function visibleGift(item){await frames(1);assert.equal(await page.evaluate(item=>{const r=G.nearGroundReward(),text=window.reviewPaint.map(p=>p.text).join(' ');return r?.item===item&&text.includes(G.groundRewardInfo(r).name)&&text.includes(G.groundRewardInfo(r).purpose)&&text.includes('Walk over the treasure to collect');},item),true,'the actual HUD paints complete name/purpose/collection text');}
  async function walkTo(x,y){
   for(let i=0;i<800;i++){
    const v=await page.evaluate(({x,y})=>({dx:x-G.state.player.x,dy:y-G.state.player.y}),{x,y});if(Math.hypot(v.dx,v.dy)<3)break;
    if(mode==='controller')await page.evaluate(({dx,dy})=>{const m=Math.hypot(dx,dy);window.__nqTvPad(JSON.stringify({t:'s',a:[dx/m,dy/m,0,0],b:Array(16).fill(0)}));},v);
    else{const key=Math.abs(v.dx)>Math.abs(v.dy)?(v.dx>0?'ArrowRight':'ArrowLeft'):(v.dy>0?'ArrowDown':'ArrowUp');for(const k of ['ArrowRight','ArrowLeft','ArrowDown','ArrowUp'])if(k===key)await page.keyboard.down(k);else await page.keyboard.up(k);}
    await frames(1);if(await page.evaluate(()=>G.ui.dialogueOpen)){await release();await drain();}
   }
   await release();await frames(1);await drain();assert.ok(await page.evaluate(({x,y})=>Math.hypot(G.state.player.x-x,G.state.player.y-y)<4,{x,y}),'native movement reaches the authored waypoint');
  }
  async function boot(){await page.waitForFunction(()=>typeof G!=='undefined'&&G.state?.player);await connect();await drain();await frames(100);await drain();}
  const shot=stage=>page.screenshot({path:path.join(out,`${mode}-${hd?'hd':'base'}-${stage}.png`)});
  async function reload(){await page.evaluate(()=>G.saveGame());await page.reload();await boot();}
  await page.goto(url);await boot();await run({page,mode,hd,frames,next,drain,offer,answer,walkGift,walkTo,visibleGift,shot,reload});
  assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);console.log(`PASS ${name} ${mode} ${hd?'HD':'BASE'}`);await context.close();
 }}finally{await browser.close();}
};
