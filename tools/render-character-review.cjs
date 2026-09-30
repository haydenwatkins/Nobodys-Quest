// Uses the shipped script order: older atlas tools omit the opening art overrides.
const fs=require('node:fs'),path=require('node:path');
const {createCanvas}=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
const {G}=require('./lib/classic-runtime.cjs')(createCanvas);
const out=process.argv[2];if(!out)throw Error('Pass an output directory');
fs.mkdirSync(out,{recursive:true});
const groups={forms:G.formOrder.map(id=>({id,...G.forms[id]})),bosses:Object.values(G.enemies).filter(e=>e.miniboss)};
groups.bosses.push({id:'ancientTreant-opening',name:'Treant / Orchard battle',sprite:G.openingTreantSprite});
for(const [kind,list]of Object.entries(groups)){
  for(let page=0;page<Math.ceil(list.length/9);page++){
    const w=360,h=300,canvas=createCanvas(w*3,h*3),c=canvas.getContext('2d');
    c.imageSmoothingEnabled=false;c.fillStyle='#24353a';c.fillRect(0,0,canvas.width,canvas.height);
    list.slice(page*9,page*9+9).forEach((e,i)=>{
      const x=(i%3)*w,y=Math.floor(i/3)*h,s=e.sprite.hd||e.sprite,dirs=s.directional;
      c.fillStyle='#30474a';c.fillRect(x+6,y+6,w-12,h-12);
      c.fillStyle='#eed9b1';c.font='16px monospace';c.fillText(e.name,x+16,y+28);
      const modes=dirs?['south','east','north']:['idle','walk','attack'];
      modes.forEach((mode,j)=>{
        const frame=dirs?(dirs[mode]||dirs.south).idle[0]:(s.animations[mode]||s.animations.idle)[0];
        const rows=s.frames[frame],scale=Math.min(5,Math.floor(100/rows[0].length),Math.floor(205/rows.length));
        G.drawSprite(c,e.sprite,frame,x+60+j*120,y+250,false,scale*(s.density||1));
        c.fillStyle='#c3ceca';c.font='12px monospace';c.fillText(dirs?mode:mode+' / front',x+12+j*120,y+276);
      });
      const frame=s.animations.idle[0];G.drawSprite(c,e.sprite,frame,x+36,y+76,false,1);
      c.fillStyle='#c3ceca';c.font='11px monospace';c.fillText('game size',x+62,y+68);
    });
    fs.writeFileSync(path.join(out,`${kind}-${page+1}.png`),canvas.toBuffer('image/png'));
  }
}
console.log(JSON.stringify(Object.fromEntries(Object.entries(groups).map(([k,list])=>[k,list.map(e=>({id:e.id,name:e.name,frames:e.sprite.hd.frames.length,width:e.sprite.hd.frames[0][0].length,height:e.sprite.hd.frames[0].length}))])),null,2));
