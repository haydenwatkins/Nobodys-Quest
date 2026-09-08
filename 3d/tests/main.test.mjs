// Exercises actual entry-point wiring with a DOM/renderer double; not a browser playtest.
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import * as gameModule from '../game.mjs';
import * as world from '../world-data.mjs';
import * as dialogue from '../dialogue.mjs';
import {REGULATOR_LINES} from '../prologue.mjs';
const source=readFileSync(new URL('../main.mjs',import.meta.url),'utf8').replace(/^import .*$/gm,'');
function boot(search=''){
 const nodes=new Map(),listeners=new Map(),values=new Map([[world.SAVE_KEY,JSON.stringify({...gameModule.freshProgress(),briefed:true,prologue:'complete',prologueDeparture:true,teeth:['west']})]]),session=new Map();
 const node=id=>{if(!nodes.has(id))nodes.set(id,{id,textContent:'',innerHTML:'',open:false,style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){},blur(){},focus(){},close(){this.open=false;},showModal(){this.open=true;},querySelector(){return node(id+' button');},querySelectorAll(){return [];}});return nodes.get(id);};
 const document={hidden:false,querySelector:s=>s==='dialog[open]'?[...nodes.values()].find(n=>n.open)||null:node(s),querySelectorAll:s=>s==='dialog[open]'?[...nodes.values()].filter(n=>n.open):[],addEventListener(){}};
 const storage=m=>({getItem:k=>m.get(k),setItem:(k,v)=>m.set(k,v)});
 const window={localStorage:storage(values),sessionStorage:storage(session),addEventListener:(type,fn)=>listeners.set(type,fn)};
 class WorldView{constructor(_,g){this.game=g;this.overview=false;this.started=false;}resetPresentation(){this.reset=true;}setQuality(){}resize(){}update(){}}
 const context=vm.createContext({...world,...gameModule,...dialogue,REGULATOR_LINES,WorldView,Soundscape:class{unlock(){}event(){}tick(){}},installPointerControls:()=>({reset(){}}),installGameplayGestures:()=>({reset(){}}),document,window,location:{search},URLSearchParams,performance:{now:()=>0},requestAnimationFrame(){},matchMedia:()=>({matches:false}),console});
 vm.runInContext(source,context);return {context,node,values,session,listeners,read:expr=>vm.runInContext(expr,context)};
}
test('actual restart button begins the rescue without a reload and clears held controls',()=>{
 const app=boot();app.node('#start').onclick();app.read("keys.add('KeyJ');heldAttack=true;joy={x:1,z:1};game.player.buffer={type:'attack'}");app.node('#confirm-reset').onclick();
 assert.equal(app.read('game.progress.prologue'),'landingThreat');assert.equal(app.read('game.enemies.filter(e=>game.active(e)).length'),2);assert.equal(app.read('heldAttack'),false);assert.equal(app.read('keys.size'),0);assert.equal(app.read('game.player.buffer'),null);assert.equal(app.read('view.game===game'),true);
});
test('opening preview start and restart never write to the main save',()=>{
 const app=boot('?preview=last-light'),before=app.values.get(world.SAVE_KEY);app.node('#start').onclick();app.node('#confirm-reset').onclick();
 assert.equal(app.values.get(world.SAVE_KEY),before);assert.ok(app.session.has('preview.'+world.SAVE_KEY));assert.equal(app.read('game.progress.prologue'),'landingThreat');assert.match(app.node('#save-status').textContent,/main save preserved/);
});
test('briefing needs explicit completion and blur releases controls',()=>{
 const app=boot();app.node('#start').onclick();app.read("game.progress.prologue='briefing';speak('Sera Vale',[], 'last-light-briefing',[{speaker:'Veyr',text:'Keep a light for us.'}]);keys.add('KeyJ');heldAttack=true");
 app.listeners.get('blur')();assert.equal(app.read('heldAttack'),false);assert.equal(app.read('keys.size'),0);app.node('#continue').onclick();assert.equal(app.read('game.progress.prologue'),'briefing');app.node('#continue').onclick();assert.equal(app.read('game.progress.prologue'),'complete');
});
