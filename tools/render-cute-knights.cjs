const fs=require('node:fs');
const {createCanvas}=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
const {G}=require('./lib/classic-runtime.cjs')(createCanvas),canvas=createCanvas(1280,520),c=canvas.getContext('2d');
c.imageSmoothingEnabled=false;c.fillStyle='#24353a';c.fillRect(0,0,1280,520);
for(const [col,dir]of ['south','east','north','west'].entries()){
  const s=G.forms.knight.sprite,set=s.hd.directional[dir],x=col*320;
  c.fillStyle='#30474a';c.fillRect(x+6,6,308,228);c.fillStyle='#eed9b1';c.font='16px monospace';c.fillText('Knight / '+dir,x+16,28);
  G.drawSprite(c,s,set.idle[0],x+90,225,false,6);G.drawSprite(c,s,set.attack[1],x+238,225,false,6);
}
for(const [col,mode]of ['idle','walk','attack'].entries()){
  const x=col*426,s=G.enemies.eclipseKnight.sprite;
  c.fillStyle='#30474a';c.fillRect(x+6,246,414,268);c.fillStyle='#eed9b1';c.fillText('Eclipse Knight / '+mode,x+16,270);
  G.drawSprite(c,s,s.hd.animations[mode][mode==='walk'?1:0],x+213,502,false,8);
}
fs.writeFileSync(process.argv[2],canvas.toBuffer('image/png'));
