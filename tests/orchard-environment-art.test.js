const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');

test('authored Orchard canopies keep characters visible, respect reduced motion, and leave the scene intact',()=>{
  const r=runtime(),{G}=r;r.load('orchardRoad');r.drain();const p=G.state.player,n=G.state.npcs[0];assert.ok(n);
  const x=160,y=160;Object.assign(p,{x:600,y:500});Object.assign(n,{x,y:y-18});const grid=JSON.stringify(G.state.grid),position=JSON.stringify([p.x,p.y,n.x,n.y]),draws=[],stack=[];
  const ctx=new Proxy({globalAlpha:1,save(){stack.push(this.globalAlpha);},restore(){this.globalAlpha=stack.pop();}},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
  G.drawSprite=(c,s,f)=>draws.push({sprite:s,frame:f,alpha:c.globalAlpha});
  for(const hd of [true,false]){G.hdPilot=hd;G.reducedMotion=true;G.state.time=6;G.drawOpeningProp(ctx,'apple',x,y,6);const d=draws.pop();assert.equal(d.sprite,G.openingScenery.apple);assert.equal(d.frame,0);assert.ok(d.alpha<=.35);assert.equal(ctx.globalAlpha,1);
    const m=G.spriteMetrics(d.sprite),s=G.activeSpriteDefinition(d.sprite);assert.equal(m.w,44);assert.equal(m.h,48);assert.equal(s.frames.length,4);for(const frame of s.frames)for(const row of frame)for(const pixel of row)assert.ok(pixel==='.'||s.palette[pixel]);
  }
  n.x=600;G.reducedMotion=false;G.drawOpeningProp(ctx,'apple',x,y,6);assert.equal(draws.pop().alpha,1);assert.equal(ctx.globalAlpha,1);n.x=x;
  assert.equal(JSON.stringify(G.state.grid),grid);assert.equal(JSON.stringify([p.x,p.y,n.x,n.y]),position);
  r.load('heartwood');r.drain();G.drawOpeningProp(ctx,'apple',x,y,6);assert.equal(draws.pop().sprite,G.openingScenery.heartwood);
});
