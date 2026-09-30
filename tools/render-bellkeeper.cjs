const fs=require('node:fs');
const {createCanvas}=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
const {G}=require('./lib/classic-runtime.cjs')(createCanvas);
const canvas=createCanvas(1000,920),c=canvas.getContext('2d'),sprite=G.forms.bellkeeper.sprite;
c.fillStyle='#202e32';c.fillRect(0,0,1000,920);c.imageSmoothingEnabled=false;
for(const [row,dir]of ['south','east','north','west'].entries())for(const [col,mode]of ['idle','walk','attack','peal','silence'].entries()){
  c.fillStyle='#314449';c.fillRect(col*200+8,row*230+8,184,214);
  const set=sprite.hd.directional?.[dir]||sprite.hd.animations;
  const frame=(set[mode]||set.attack)[mode==='idle'?0:Math.min(1,(set[mode]||set.attack).length-1)];
  G.drawSprite(c,sprite,frame,col*200+100,row*230+202,false,7);
  c.fillStyle='#ebd7a6';c.font='16px monospace';c.fillText(dir+' / '+mode,col*200+18,row*230+29);
}
const out=process.argv[2];if(!out)throw Error('Pass a PNG output path');fs.writeFileSync(out,canvas.toBuffer('image/png'));console.log(out);
