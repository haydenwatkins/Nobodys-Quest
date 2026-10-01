// Full pose inventory through the shipped script order. Each row is a facing.
const fs=require('node:fs');
const {createCanvas}=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
const runtime=require('./lib/classic-runtime.cjs')(createCanvas),{G}=runtime;
const id=process.argv[2],out=process.argv[3],s=G.forms[id].sprite,a=s.hd;
const skin=process.argv.includes('--skin');const sprite=skin?G.signatureSprite(s,G.skinForForm(id)):s,active=sprite.hd;
const dirs=active.directional?Object.keys(active.directional):['south'],groups=dirs.map(dir=>Object.entries(active.directional?.[dir]||active.animations).flatMap(([mode,ids])=>ids.map((frame,i)=>({mode,frame,i}))));
const scale=2,w=(active.frames[0][0].length+8)*scale,h=active.frames[0].length*scale+30;
const canvas=createCanvas(Math.max(...groups.map(g=>g.length))*w,dirs.length*h),c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#24353a';c.fillRect(0,0,canvas.width,canvas.height);
groups.forEach((group,row)=>group.forEach(({mode,frame,i},col)=>{const x=col*w,y=row*h;c.fillStyle='#30474a';c.fillRect(x+2,y+2,w-4,h-4);G.drawSprite(c,sprite,frame,x+w/2,y+h-5,false,scale*active.density);c.fillStyle='#eed9b1';c.font='11px monospace';c.fillText(dirs[row]+' '+mode+' '+i,x+5,y+15);}));
fs.writeFileSync(out,canvas.toBuffer('image/png'));
