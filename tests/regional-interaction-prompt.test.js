const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
test('regional interactions show the correct keyboard, touch and controller affordance',()=>{
 const r=runtime(),{G}=r;r.load('windscarCanyon');r.drain();G.state.enemies=[];
 Object.assign(G.state.player,{x:184,y:328});const labels=[];
 const c=new Proxy({measureText:text=>({width:text.length*4}),fillText:text=>labels.push(text)},{get:(o,k)=>o[k]||(()=>{})});
 for(const mode of ['keyboard','touch','controller']){
  G.input.isTouch=mode==='touch';G.input.hasGamepad=mode==='controller';
  assert.equal(G.drawOpeningPrompt(c),true);assert.match(labels.at(-1),/sleeping wind lift/);
  assert.ok(labels.at(-1).startsWith(mode==='keyboard'?'J / E':'A ·'));
 }
 for(const flag of ['dialogueOpen','menuOpen']){G.ui[flag]=true;const count=labels.length;assert.equal(G.drawOpeningPrompt(c),false);assert.equal(labels.length,count);G.ui[flag]=false;}
 G.state.bossCutscene={};assert.equal(G.drawOpeningPrompt(c),false);
});

test('a regional interaction prompt yields above a traveller near the bottom edge in keyboard, touch and controller layouts',()=>{
 const r=runtime(),{G}=r;r.load('starfallRuins');r.drain();G.state.enemies=[];Object.assign(G.state.player,{x:248,y:272});const boxes=[],labels=[],c=new Proxy({measureText:text=>({width:text.length*4}),fillRect:(x,y,w,h)=>boxes.push({x,y,w,h}),fillText:text=>labels.push(text)},{get:(o,k)=>o[k]||(()=>{})});const cam={x:88,y:124},px=160,py=148;
 for(const mode of ['keyboard','touch','controller']){G.input.isTouch=mode==='touch';G.input.hasGamepad=mode==='controller';boxes.length=0;assert.equal(G.drawOpeningPrompt(c,cam),true);assert.match(labels.at(-1),/Star instrument/);const panel=boxes.find(b=>b.h===16&&b.w>2);assert.ok(!(px+12>panel.x&&px-12<panel.x+panel.w&&py+4>panel.y&&py-24<panel.y+panel.h));assert.ok(panel.y>=40);}
 Object.assign(G.state.player,{x:248,y:248});boxes.length=0;G.drawOpeningPrompt(c,{x:88,y:124});const panel=boxes.find(b=>b.h===16&&b.w>2);assert.ok(panel.y>=136,'normal placement remains when the traveller is clear');assert.equal(G.starfallSurvey().thread,false);
});
