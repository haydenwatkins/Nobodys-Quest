const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
function setup(){
  const r=runtime(),{G}=r;r.load('frostbellTundra');r.drain();G.state.formId='bellkeeper';G.state.claimedForms=['bellkeeper','ranger','wizard'];
  G.state.items.push('trophy-bell-titan');G.state.keepsakeId='clapper';G.state.loadouts.bellkeeper=['handbell','echoOrb','arrow'];
  const make=dataset=>({dataset,addEventListener(type,fn){if(type==='click')this.click=fn;}});
  const route=make({formlabView:'loadout'}),native=make({nativeArt:''}),slot=make({loadoutSlot:'2'}),art=make({abilitySelect:'curse'}),equip=make({});
  const menu=r.context.document.getElementById('menu');
  menu.querySelectorAll=s=>s==='[data-formlab-view]'?[route]:s==='[data-native-art]'?[native]:s==='[data-loadout-slot]'?[slot]:s==='[data-ability-select]'?[art]:[];
  menu.querySelector=s=>s==='[data-act="equip-ability"]'?equip:null;
  r.run('js/engine/ui.js');G.ui.openMenu();route.click();return {...r,route,native,slot,art,equip,menu};
}
function detail(menu){return menu.innerHTML.match(/<div class="ability-inspector">[\s\S]*?<\/section>/)[0];}

test('native A can teach its move while inspection and even an equip callback leave the body and build unchanged',()=>{
  const r=setup(),{G}=r,before=JSON.stringify(G.state.player),arts=JSON.stringify(G.state.loadouts),gear=G.state.keepsakeId;
  assert.match(r.menu.innerHTML,/data-native-art data-nav-id="native-art"/);r.native.click();
  assert.match(detail(r.menu),/Handbell/);assert.match(detail(r.menu),/Every third chime becomes a wider peal/);
  assert.match(detail(r.menu),/no mana · 0.5s recovery/);assert.match(detail(r.menu),/disabled[^>]*>Native A · stays with this form/);
  r.equip.click();assert.equal(JSON.stringify(G.state.player),before);assert.equal(JSON.stringify(G.state.loadouts),arts);assert.equal(G.state.keepsakeId,gear);
});

test('returning to C inspects its current move and another earned art can still replace only C',()=>{
  const r=setup(),{G}=r;r.native.click();r.slot.click();
  assert.match(detail(r.menu),/Arrow/);assert.match(detail(r.menu),/A quick, free sharp shot/);assert.match(detail(r.menu),/In slot C/);
  r.art.click();assert.match(detail(r.menu),/Curse/);assert.match(detail(r.menu),/Equip to C/);r.equip.click();
  assert.equal(G.getLoadout('bellkeeper').join(','),'handbell,echoOrb,curse');
});
