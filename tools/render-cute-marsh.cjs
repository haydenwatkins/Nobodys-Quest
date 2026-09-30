const fs=require('node:fs');
const {createCanvas}=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
const {G}=require('./lib/classic-runtime.cjs')(createCanvas),canvas=createCanvas(1000,520),c=canvas.getContext('2d');
c.imageSmoothingEnabled=false;c.fillStyle='#24353a';c.fillRect(0,0,1000,520);
for(const [row,entry]of [['Frog',G.forms.frog.sprite,10],['Mire Queen',G.enemies.mireQueen.sprite,8]].entries())for(let frame=0;frame<4;frame++){
  const [name,sprite,scale]=entry,x=frame*250,y=row*260;
  c.fillStyle='#30474a';c.fillRect(x+6,y+6,238,248);c.fillStyle='#eed9b1';c.font='16px monospace';c.fillText(name+' / '+['idle','stride','tongue','stride'][frame],x+16,y+28);
  G.drawSprite(c,sprite,frame,x+125,y+240,false,scale);
}
fs.writeFileSync(process.argv[2],canvas.toBuffer('image/png'));
