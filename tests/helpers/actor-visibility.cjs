const assert=require('node:assert/strict');
const {createCanvas}=require(require.resolve('@napi-rs/canvas',{paths:[process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES||'node_modules']}));
function assertActorVisible(actual,actor,foreground){
 const a=actual.getContext('2d').getImageData(0,0,actual.width,actual.height).data,b=actor.getContext('2d').getImageData(0,0,actor.width,actor.height).data,f=foreground.getContext('2d').getImageData(0,0,foreground.width,foreground.height).data;
 let compared=0,closer=0;const distance=(x,y,i)=>Math.abs(x[i]-y[i])+Math.abs(x[i+1]-y[i+1])+Math.abs(x[i+2]-y[i+2]);
 for(let i=0;i<a.length;i+=4)if(b[i+3]===255&&f[i+3]===255&&distance(b,f,i)>90){compared++;if(distance(a,b,i)<distance(a,f,i))closer++;}
 assert.ok(compared>=8,'the real foreground covers contrasting actor pixels');assert.ok(closer/compared>.6,JSON.stringify({compared,closer}));
}
module.exports={createCanvas,assertActorVisible};
