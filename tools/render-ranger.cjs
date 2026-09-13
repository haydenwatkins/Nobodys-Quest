const fs=require('node:fs'),path=require('node:path');
const {createCanvas,GlobalFonts}=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
const r=require('./lib/classic-runtime.cjs')(createCanvas),{G}=r;r.load('sunriseQuay');
GlobalFonts.registerFromPath(path.join(r.root,'fonts/vt323.woff2'),'VT323');
const canvas=createCanvas(1056,1000),c=canvas.getContext('2d');c.fillStyle='#26373a';c.fillRect(0,0,1056,1000);c.imageSmoothingEnabled=false;
const sprite=G.forms.ranger.sprite;
for(const [row,dir]of ['south','east','north','west'].entries())for(const [col,[mode,index]]of [['idle',0],['walk',1],['attack',0],['attack',1]].entries()){
  c.fillStyle='#31464a';c.fillRect(col*264+8,row*230+8,248,214);
  const frame=sprite.hd.directional[dir][mode][index];G.drawSprite(c,sprite,frame,col*264+132,row*230+202,false,7);
  c.fillStyle='#ecd3a1';c.font='19px VT323';c.fillText(dir+' / '+(mode==='attack'?(index?'release':'draw'):mode),col*264+20,row*230+28);
}
G.state.projectiles=[['arrow',1,0],['luckyArrow',0,-1],['tripleShot',-1,.3]].map(([ability,vx,vy],i)=>({fromPlayer:true,ability,vx,vy,x:22+i*57,y:11,size:3,color:'#d2d6b9',trail:[]}));
c.save();c.translate(0,920);c.scale(6,6);G.drawProjectiles(c);c.restore();
const out=process.argv[2]||'/tmp/nq-ranger-review.png';fs.writeFileSync(out,canvas.toBuffer('image/png'));console.log(out);
