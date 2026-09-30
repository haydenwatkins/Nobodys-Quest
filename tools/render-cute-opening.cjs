const fs=require('node:fs');
const {createCanvas}=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
const runtime=require('./lib/classic-runtime.cjs')(createCanvas),{G}=runtime;
if(process.argv.includes('--previous'))runtime.run('js/data/opening-art.js');
const canvas=createCanvas(1280,740),c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#24353a';c.fillRect(0,0,1280,740);
for(const [row,id]of ['nobody','rat'].entries())for(const [col,dir]of ['south','east','north','west'].entries()){
  const sprite=G.forms[id].sprite,set=sprite.hd.directional[dir],x=col*320,y=row*240;
  c.fillStyle='#30474a';c.fillRect(x+6,y+6,308,228);c.fillStyle='#eed9b1';c.font='16px monospace';c.fillText(id+' / '+dir,x+16,y+28);
  G.drawSprite(c,sprite,set.idle[0],x+90,y+225,false,6);G.drawSprite(c,sprite,set.attack[1],x+238,y+225,false,6);
}
for(const [col,mode]of ['idle','walk','attack'].entries()){
  const x=col*426,s=G.openingTreantSprite;
  c.fillStyle='#30474a';c.fillRect(x+6,486,414,248);c.fillStyle='#eed9b1';c.fillText('Ancient Treant / '+mode,x+16,510);
  G.drawSprite(c,s,s.hd.animations[mode][mode==='walk'?1:0],x+213,730,false,4);
}
fs.writeFileSync(process.argv[2],canvas.toBuffer('image/png'));
