// Reproducible app identity built from Patchling's actual authored game art.
const fs=require('node:fs'),path=require('node:path');
const {createCanvas,GlobalFonts}=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
const r=require('./lib/classic-runtime.cjs')(createCanvas),{G}=r;G.hdPilot=true;
for(const size of [96,192,512]){
 const canvas=createCanvas(size,size),c=canvas.getContext('2d'),scale=size/128;
 c.scale(scale,scale);c.imageSmoothingEnabled=false;c.fillStyle='#254d4c';c.fillRect(0,0,128,128);
 c.fillStyle='#d6b985';c.fillRect(8,8,112,112);c.fillStyle='#f0dfb0';c.fillRect(12,12,104,104);
 c.strokeStyle='#9d7655';c.lineWidth=1;c.setLineDash([3,3]);c.strokeRect(16,16,96,96);c.setLineDash([]);
 c.strokeStyle='#baa77b';c.lineWidth=8;c.beginPath();c.moveTo(18,94);c.bezierCurveTo(35,72,36,108,61,83);c.bezierCurveTo(81,64,91,72,110,37);c.stroke();
 c.strokeStyle='#e1cf98';c.lineWidth=4;c.stroke();
 c.fillStyle='#6a8770';for(const [x,y]of [[23,33],[91,96],[102,28]]){c.fillRect(x,y,6,3);c.fillRect(x+2,y-4,2,10);}
 c.fillStyle='#c09c68';c.beginPath();c.ellipse(64,101,19,4,0,0,Math.PI*2);c.fill();
 G.drawSprite(c,G.forms.nobody.sprite,0,64,102,false,4.5);
 const file=size===96?'android-tv/app/src/main/res/mipmap-xhdpi/ic_launcher.png':`icons/icon-${size}.png`;
 fs.writeFileSync(path.join(r.root,file),canvas.toBuffer('image/png'));
 console.log('Rendered Patchling icon '+size);
}
GlobalFonts.registerFromPath(path.join(r.root,'fonts/nunito-variable.woff2'),'Nunito');
const banner=createCanvas(640,360),c=banner.getContext('2d');c.scale(2,2);c.imageSmoothingEnabled=false;
c.fillStyle='#254d4c';c.fillRect(0,0,320,180);c.fillStyle='#efdca8';c.fillRect(8,8,304,164);
c.strokeStyle='#ab8158';c.lineWidth=1;c.setLineDash([3,3]);c.strokeRect(14,14,292,152);c.setLineDash([]);
c.strokeStyle='#c0aa79';c.lineWidth=8;c.beginPath();c.moveTo(17,153);c.bezierCurveTo(79,104,145,170,302,146);c.stroke();
G.drawSprite(c,G.forms.nobody.sprite,0,57,143,false,4);
c.fillStyle='#254d4c';c.font='800 40px Nunito';c.fillText('Patchling',98,76);
c.font='800 17px Nunito';c.fillText('and the Waking Roads',99,101);
c.fillStyle='#6d5947';c.font='600 15px Nunito';c.fillText('A world to mend.',100,125);
fs.writeFileSync(path.join(r.root,'android-tv/app/src/main/res/drawable-xhdpi/tv_banner.png'),banner.toBuffer('image/png'));
console.log('Rendered TV banner from native Patchling art and Nunito');
