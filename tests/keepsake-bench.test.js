const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function fixture(){
 const r=runtime(),{G}=r;r.load('windscarCanyon');r.drain();G.state.opening.complete=true;G.state.delivery.complete=true;G.state.enemies=[];
 G.state.claimedForms=[...G.formOrder];G.questsDone=G.formOrder.flatMap(id=>G.forms[id].quests.map(q=>q.id));G.state.items.push(...G.KEEPSAKES.map(k=>k.item));
 G.state.formId='nobody';G.state.loadouts.nobody=['slap','cartwheel','spinSlash'];G.getLoadout('nobody');G.carryKeepsake('mire');Object.assign(G.state.player,{mana:7,manaRegenProgress:.3,cooldowns:{cartwheel:.4},cooldownDurations:{cartwheel:.8}});
 function button(dataset){return {dataset,focus(){this.focused=true;},addEventListener(type,fn){if(type==='click')this.click=fn;}};}
 const route=button({formlabView:'keepsakes',keepsakeInspect:'plume'}),choose=button({keepsakeSelect:'lodestone',navId:'keepsake-inspect-lodestone'}),carry=button({keepsake:'lodestone'}),menu=r.context.document.getElementById('menu');
 menu.querySelectorAll=selector=>selector==='[data-formlab-view]'?[route]:selector==='[data-keepsake-select]'?[choose]:selector==='[data-keepsake]'?[carry]:[];
 r.run('js/engine/ui.js');G.ui.openMenu();return {...r,route,choose,carry,menu};
}
function inspector(html){return html.match(/<article class="mark-stone keepsake-inspector[\s\S]*?<\/article>/)[0];}
test('the journal inspects its named reward with current-art terms without equipping, refilling, or shortening recovery',()=>{
 const r=fixture(),{G}=r,p=G.state.player,before=JSON.stringify(p);r.route.click();const detail=inspector(r.menu.innerHTML);
 assert.match(detail,/Sovereign&#39;s Plume/);assert.match(detail,/B · Cartwheel/);assert.match(detail,/2 mana · 3 now · 0.6s recovery · 0.8s now/);
 assert.equal((r.menu.innerHTML.match(/class="mark-stone keepsake-inspector/g)||[]).length,1);assert.equal((r.menu.innerHTML.match(/data-keepsake-select=/g)||[]).length,9);
 assert.equal(G.activeKeepsake().id,'mire');assert.equal(JSON.stringify(p),before);
 r.choose.click();assert.match(inspector(r.menu.innerHTML),/Atlas&#39;s Lodestone/);assert.match(inspector(r.menu.innerHTML),/1s recovery · 0.8s now/);
 assert.equal(G.activeKeepsake().id,'mire');assert.equal(JSON.stringify(p),before);
 r.carry.click();assert.equal(G.activeKeepsake().id,'lodestone');assert.equal(p.mana,7);assert.equal(p.cooldowns.cartwheel,.4);assert.equal(p.cooldownDurations.cartwheel,.8);
});
test('locked gifts can be inspected for preparation but cannot be carried or appear recovered',()=>{
 const r=fixture(),{G}=r;G.state.items=G.state.items.filter(id=>id!=='trophy-last-worldbearer');r.route.click();r.choose.click();const detail=inspector(r.menu.innerHTML);
 assert.match(detail,/Titan Grave · With its guardian/);assert.match(detail,/data-keepsake="lodestone"[^>]*disabled/);assert.match(detail,/Face the Last Worldbearer in Titan Grave/);
 r.carry.click();assert.equal(G.activeKeepsake().id,'mire');assert.equal(G.state.player.mana,7);
});
test('preview terms use the same costs and recovery actually paid by the next cast',()=>{
 for(const [gear,id]of [['plume','cartwheel'],['clapper','spinSlash'],['ember','chainLightning'],['lodestone','cartwheel'],['mire','spinSlash'],['spindle','arrow']]){
  const r=fixture(),{G}=r,p=G.state.player;p.cooldowns={};p.cooldownDurations={};p.mana=12;p.manaMax=12;
  const ab=G.abilities[id],mana=G.abilityManaCost(ab,gear),recovery=G.abilityCooldown(ab,gear);assert.equal(G.activeKeepsake().id,'mire','preview must not equip');
  G.carryKeepsake(gear);G.getLoadout('nobody')[1]=id;r.taps.add('b');G.updatePlayer(0);assert.equal(p.mana,12-mana);assert.equal(p.cooldowns[id],recovery);
 }
});



test('controller confirmation returns to the gift tile after carrying rather than the set-aside action',()=>{
 const r=fixture(),{G}=r;r.route.click();G.input.hasGamepad=true;
 r.menu.querySelector=selector=>selector==='[data-keepsake-select="lodestone"]'?r.choose:null;
 r.carry.click();assert.equal(G.activeKeepsake().id,'lodestone');assert.equal(r.choose.focused,true);
 assert.equal(G.menuController.focusKey(r.choose),'navId:keepsake-inspect-lodestone');
});
