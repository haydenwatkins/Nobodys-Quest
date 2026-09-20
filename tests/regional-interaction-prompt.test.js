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
