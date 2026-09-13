// Execute the actual registries and simulation without a browser. Rendering
// callers supply a Canvas2D factory; logic tests need no third-party packages.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
module.exports=function runtime(createCanvas){
  const storage=new Map(),messages=[],nodes=new Map();
  const noop=()=>{};
  const dummyContext=new Proxy({measureText:t=>({width:String(t).length*5})},{get:(t,k)=>t[k]||noop,set:(t,k,v)=>(t[k]=v,true)});
  function element(id){
    if(nodes.has(id))return nodes.get(id);
    const e=(id==='game'||id==='ui'||id==='canvas')&&createCanvas?createCanvas(1280,720):{};
    const classes=new Set();
    Object.assign(e,{style:{setProperty:noop},dataset:{},classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k),toggle:noop},
      addEventListener:noop,removeEventListener:noop,setAttribute:noop,querySelectorAll:()=>[],querySelector:()=>null,
      getBoundingClientRect:()=>({left:0,top:0,width:1280,height:720}),focus:noop,appendChild:noop});
    if(!e.getContext)e.getContext=()=>dummyContext;
    if(id!=='canvas')nodes.set(id,e);return e;
  }
  const doc={getElementById:element,createElement:element,addEventListener:noop,querySelectorAll:()=>[],body:element('body'),documentElement:element('html'),fonts:{ready:Promise.resolve()}};
  const win={matchMedia:()=>({matches:false}),addEventListener:noop,removeEventListener:noop,innerWidth:1280,innerHeight:720,devicePixelRatio:1,requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop};
  const taps=new Set();
  const context=vm.createContext({console,Math,Date,Map,Set,WeakMap,JSON,window:win,document:doc,performance:{now:()=>0},location:{hostname:'localhost',search:''},URLSearchParams,
    localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},
    requestAnimationFrame:noop,setTimeout:noop,clearTimeout:noop,navigator:{getGamepads:()=>[],maxTouchPoints:0},Image:class{}});
  function run(file,suffix=''){vm.runInContext(fs.readFileSync(path.join(root,file),'utf8')+suffix,context,{filename:file});}
  run('js/engine/core.js',';this.G=G;');const G=context.G;
  G.sfx={play:noop,attack:noop,impact:noop,ensure:noop};
  G.ui={toast:noop,banner:noop,dialogue:(speaker,text,options)=>messages.push({speaker,text,options}),update:noop,dialogueOpen:false,menuOpen:false};
  G.input={vec:{x:0,y:0},aim:{x:0,y:0},tapped:k=>{const result=taps.has(k);taps.delete(k);return result;},takeAim:()=>null,clearTaps:()=>taps.clear(),update:noop,hasGamepad:false,isTouch:false};
  G.saveGame=noop;
  const files=[...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<script src="([^?]+)\?/g)].map(m=>m[1]);
  for(const file of files)if(!['core','audio','input','ui','main'].some(name=>file===`js/engine/${name}.js`))run(file);
  const main=fs.readFileSync(path.join(root,'js/engine/main.js'),'utf8');
  const state=main.slice(main.indexOf('  G.state = {'),main.indexOf('  // bring back the save'));
  vm.runInContext(state,context);
  G.hdPilot=true;G.upgradeSpriteCatalog();G.validateCrossRefs();
  function load(id='orchardRoad'){G.world.load(id);G.checkUnlocks();return G.state;}
  function step(dt=.05){G.state.time+=dt;G.updatePlayer(dt);G.updateOpening(dt);G.updateEnemies(dt);G.combat.updateProjectiles(dt);G.updatePickups(dt);G.updateFormEcho(dt);G.updateFx(dt);}
  function drain(){while(messages.length){const m=messages.shift();if(m.options&&m.options.onClose)m.options.onClose();}}
  return {G,run,load,step,drain,messages,taps,storage,context,nodes,root};
};
