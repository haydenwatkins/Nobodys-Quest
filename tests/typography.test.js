const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(){const G={state:{mapReveal:0},renderScale:2};vm.runInNewContext(fs.readFileSync(require.resolve('../js/engine/typography.js'),'utf8'),{G});return G;}
test('world lettering paints once on the sharp layer with camera, rotation, opacity and alignment preserved',()=>{
 const G=setup(),pixel=[],paint=[];
 const world={font:G.text.font(7,700),fillStyle:'#fff3c2',globalAlpha:.4,textAlign:'center',textBaseline:'alphabetic',getTransform:()=>({a:0,b:2,c:-2,d:0,e:-40,f:-60}),fillText:(...args)=>pixel.push(args)};
 const sharp={save(){},restore(){},setTransform(...m){this.matrix=m;},fillText(...args){paint.push({args,matrix:this.matrix,font:this.font,alpha:this.globalAlpha,align:this.textAlign,baseline:this.textBaseline,color:this.fillStyle});}};
 G.text.beginWorldFrame(world);G.drawWorldText(world,'MOVE OUT',100,80);assert.equal(pixel.length,0);
 G.text.paintWorldLabels(sharp,4);assert.deepEqual(paint[0].matrix,[0,4,-4,0,-80,-120]);assert.deepEqual(paint[0].args,['MOVE OUT',100,80]);assert.equal(paint[0].alpha,.4);assert.equal(paint[0].align,'center');assert.equal(paint[0].baseline,'alphabetic');assert.equal(paint[0].color,'#fff3c2');assert.match(paint[0].font,/700 7px "Nunito"/);
 G.text.paintWorldLabels(sharp,4);assert.equal(paint.length,1,'old labels cannot linger into another frame');
 G.drawWorldText(world,'Direct developer render',1,2);assert.equal(pixel.length,1,'independent atlas/test canvases retain normal painting');
});
test('world labels fade with map reveal and stay hidden during a scrolling transition',()=>{
 const G=setup(),world={getTransform:()=>({a:2,b:0,c:0,d:2,e:0,f:0}),globalAlpha:1},paint=[];
 const sharp={save(){},restore(){},setTransform(){},fillText(){paint.push(this.globalAlpha);}};
 G.state.mapReveal=.16;G.text.beginWorldFrame(world);G.drawWorldText(world,'COURiER',1,2);G.text.paintWorldLabels(sharp,4);assert.equal(paint[0],.5);
 G.state.zoneTransition={};G.text.beginWorldFrame(world);G.drawWorldText(world,'COURiER',1,2);G.text.paintWorldLabels(sharp,4);assert.equal(paint[1],0);
});
test('sharp combat lettering retains the native arena clip after camera scaling',()=>{
 const {createCanvas}=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
 const G=setup(),world=createCanvas(640,360).getContext('2d'),canvas=createCanvas(1280,720),sharp=canvas.getContext('2d');
 world.setTransform(2,0,0,2,-40,0);world.font=G.text.font(20,800);world.textBaseline='top';world.fillStyle='#fff';
 G.text.beginWorldFrame(world);G.text.setWorldClip(world,{left:30,top:20,right:50,bottom:40});G.drawWorldText(world,'MMMMMMMM',30,22);G.text.setWorldClip(world,null);G.text.paintWorldLabels(sharp,4);
 const pixels=sharp.getImageData(0,0,1280,720).data;let ink=0;
 for(let y=0;y<720;y++)for(let x=0;x<1280;x++)if(pixels[(y*1280+x)*4+3]){ink++;assert.ok(x>=40&&x<120&&y>=80&&y<160,'letters stay within the transformed arena');}
 assert.ok(ink>0,'the visible part of the combat cue still paints');
});
