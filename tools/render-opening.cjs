// Render real Canvas2D game frames, including the sharp HUD, for visual review.
const fs=require('node:fs'),path=require('node:path');
const {createCanvas,GlobalFonts}=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
const r=require('./lib/classic-runtime.cjs')(createCanvas),{G}=r;
GlobalFonts.registerFromPath(path.join(r.root,'fonts/vt323.woff2'),'VT323');
GlobalFonts.registerFromPath(path.join(r.root,'fonts/press-start-2p.woff2'),'Press Start 2P');
r.load();r.run('js/engine/ui.js');G.ui.resizeOverlay();
const out=process.argv[2]||'/tmp/nq-opening-review';fs.mkdirSync(out,{recursive:true});
function frame(name,map,x,y,form='nobody',time=2){
  r.load(map);G.state.player.x=x*16+8;G.state.player.y=y*16+8;G.state.formId=form;G.state.time=time;
  if(form!=='nobody'&&!G.state.claimedForms.includes(form))G.state.claimedForms.push(form);
  G.state.known=G.state.claimedForms.slice();G.state.player.moving=true;G.state.player.anim=1.7;G.state.player.dir={x:1,y:0};G.state.mapReveal=0;
  const cam={x:Math.max(0,Math.min(G.state.mapW*16-320,G.state.player.x-160)),y:Math.max(0,Math.min(G.state.mapH*16-180,G.state.player.y-94))};
  const canvas=createCanvas(1280,720),c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.scale(4,4);c.translate(-cam.x,-cam.y);
  G.world.draw(c,cam,time);G.drawOpeningHazards(c);
  const draw=G.openingDrawables(c);
  for(const e of G.state.enemies)if(!e.dead&&!e.def.practice)draw.push({y:e.y,fn:()=>G.drawEnemy(c,e)});
  for(const n of G.state.npcs)draw.push({y:n.y,fn:()=>G.drawNpc(c,n)});
  draw.push({y:G.state.player.y,fn:()=>G.drawPlayer(c)});draw.sort((a,b)=>a.y-b.y);draw.forEach(d=>d.fn());
  G.drawOpeningAtmosphere(c,cam);c.resetTransform();
  G.ui.drawHUD(cam);c.drawImage(r.nodes.get('ui'),0,0);
  fs.writeFileSync(path.join(out,name+'.png'),canvas.toBuffer('image/png'));
}
frame('01-arrival','orchardRoad',10,36);
G.state.opening.notice=true;frame('02-cart','orchardRoad',18,34);
G.state.opening.cart=true;frame('03-culvert','orchardRoad',26,24,'rat');
G.state.opening.sluice=true;frame('04-mill','orchardRoad',38,25,'rat');
frame('05-bell','orchardRoad',46,15,'knight');
G.state.opening.bell=true;frame('06-heartwood','heartwood',16,12,'knight');
const atlas=createCanvas(1056,660),a=atlas.getContext('2d');a.fillStyle='#202d32';a.fillRect(0,0,1056,660);a.imageSmoothingEnabled=false;
for(const [row,id]of ['nobody','rat','knight'].entries())for(const [col,dir]of ['south','east','north','west'].entries()){
  const def=G.forms[id].sprite.hd,frame=def.directional[dir].walk[2];
  a.save();a.translate(col*264+132,row*220+172);a.scale(6,6);G.drawSprite(a,G.forms[id].sprite,frame,0,0,false);a.restore();
  a.fillStyle='#f0dfb2';a.font='18px monospace';a.fillText(id+' / '+dir,col*264+24,row*220+28);
}
fs.writeFileSync(path.join(out,'07-directional-forms.png'),atlas.toBuffer('image/png'));
console.log(out);
