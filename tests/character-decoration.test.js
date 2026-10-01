const {test}=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');

test('every signature look preserves all authored pixels and footprints without stamped ornaments',()=>{
  const {G}=runtime();
  for(const form of Object.values(G.forms)){
    const skin=G.skinForForm(form.id);if(!skin)continue;
    const source=form.sprite,look=G.signatureSprite(source,skin);
    for(const hd of [true,false]){
      G.hdPilot=hd;const base=G.activeSpriteDefinition(source),dressed=G.activeSpriteDefinition(look);
      assert.deepEqual(dressed.frames,base.frames,form.id+' keeps every directional pose and occupied pixel');
      assert.deepEqual(G.spriteMetrics(look),G.spriteMetrics(source),form.id+' has no padding or displaced feet');
      assert.notDeepEqual(dressed.palette,base.palette,form.id+' retains its earned material colors');
    }
  }
});

test('earned ribbons, crowns and legends never add detached shapes to any character appearance',()=>{
  const {G}=runtime();
  const calls=[],ctx=new Proxy({}, {
    get:(_o,k)=>(...args)=>calls.push([k,...args]),
    set:(_o,k,v)=>(calls.push(['set',k,v]),true),
  });
  G.drawSprite=()=>calls.push(['body']);
  G.drawFormPerformance=()=>false;
  Object.assign(G.state.player,{x:90,y:80,dir:{x:1,y:0},moving:true,anim:1});
  G.state.time=1.7;
  const rewards=['orchard-ribbon','wayfarer-ribbon','heroic-halo','manyfold-crown'];
  for(const form of Object.values(G.forms))for(const look of ['classic','trailblazer','signature']){
    G.state.formId=form.id;
    G.state.costumeId=look==='signature'?'classic':look;
    const skin=G.skinForForm(form.id);
    G.state.skinsUnlocked=skin?[skin.id]:[];
    G.state.skinByForm=look==='signature'&&skin?{[form.id]:skin.id}:{};
    G.state.items=[];G.legendRank=()=>0;G.legendCharge=()=>0;
    calls.length=0;G.drawPlayer(ctx);const clean=JSON.stringify(calls);
    G.state.items=rewards.slice();G.legendRank=()=>3;G.legendCharge=()=>100;
    calls.length=0;G.drawPlayer(ctx);
    assert.equal(JSON.stringify(calls),clean,`${form.id}/${look}: earned rewards must not change character drawing`);
    assert.deepEqual(G.state.items,rewards,'drawing preserves earned save items');
    assert.ok(calls.some(c=>c[0]==='body'),'the actual appearance still draws');
  }
});
