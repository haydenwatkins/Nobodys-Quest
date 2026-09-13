// Authoring snapshots from the same world, sprite and UI functions as play.
const fs=require('node:fs'),path=require('node:path');
const {createCanvas,GlobalFonts}=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
const r=require('./lib/classic-runtime.cjs')(createCanvas),{G}=r;
GlobalFonts.registerFromPath(path.join(r.root,'fonts/vt323.woff2'),'VT323');
GlobalFonts.registerFromPath(path.join(r.root,'fonts/press-start-2p.woff2'),'Press Start 2P');
r.load();r.run('js/engine/ui.js');G.ui.resizeOverlay();G.state.delivery.started=true;G.state.opening.complete=true;
const out=process.argv[2]||'/tmp/nq-delivery-review';fs.mkdirSync(out,{recursive:true});
function frame(name,map,x,y,setup){
  r.load(map);G.state.player.x=x*16+8;G.state.player.y=y*16+8;G.state.time=3;G.state.mapReveal=0;
  G.state.formId='knight';G.state.claimedForms=['rat','knight'];G.state.known=['nobody','rat','knight'];G.state.player.dir={x:1,y:0};
  if(setup)setup();
  const cam={x:Math.max(0,Math.min(G.state.mapW*16-320,G.state.player.x-160)),y:Math.max(0,Math.min(G.state.mapH*16-180,G.state.player.y-94))};
  const canvas=createCanvas(1280,720),c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.scale(4,4);c.translate(-cam.x,-cam.y);
  G.world.draw(c,cam,G.state.time);G.drawOpeningHazards(c);
  const list=G.openingDrawables(c);for(const e of G.state.enemies)if(!e.dead)list.push({y:e.y,fn:()=>G.drawEnemy(c,e)});
  for(const n of G.state.npcs)list.push({y:n.y,fn:()=>G.drawNpc(c,n)});list.push({y:G.state.player.y,fn:()=>G.drawPlayer(c)});list.sort((a,b)=>a.y-b.y);list.forEach(d=>d.fn());
  G.drawOpeningAtmosphere(c,cam);c.resetTransform();G.ui.drawHUD(cam);c.drawImage(r.nodes.get('ui'),0,0);fs.writeFileSync(path.join(out,name+'.png'),canvas.toBuffer('image/png'));
}
frame('01-first-light','lanternReach',14,26);
G.state.delivery.lamps=[2,1];frame('02-far-bank','lanternReach',37,14);
G.state.delivery.lamps=[2,2];frame('03-tollkeeper','tollCourt',17,17,()=>{
 const e=G.state.enemies.find(e=>e.id==='tollkeeper');e.bossEngaged=true;e.bossIntroT=0;G.updateOrchardBoss(e,G.state.player,.1);G.state.openingHazards[0].t=.8;
});
G.state.delivery.keeper=true;frame('04-quay-before','sunriseQuay',20,16);
G.state.delivery.parcels=['bread','letter','present'];G.state.delivery.complete=true;
frame('05-bakery-after','sunriseQuay',12,12);frame('06-birthday-after','sunriseQuay',28,25);frame('07-quay-after','sunriseQuay',22,18);
console.log(out);
