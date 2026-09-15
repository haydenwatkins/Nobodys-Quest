const {test}=require('node:test'),assert=require('node:assert/strict');
const runtime=require('../tools/lib/classic-runtime.cjs');
function fight(phase=1){const r=runtime(),{G}=r;r.load('sunkenMarsh');r.drain();const e=G.state.enemies.find(e=>e.id==='mireQueen');G.state.enemies=[e];G.state.player.x=e.x+70;G.state.player.y=e.y;G.state.player.invuln=0;e.bossEngaged=true;e.bossIntroT=0;e.bossPhase=phase;e.bossPattern=1;e.bossSpecialT=0;G.state.bossCutscene=null;G.updateEnemies(.016);assert.equal(e.bossPendingAction,'mireBubbles');G.updateEnemies(.6);return {...r,e};}
test('Mire Queen marks a fixed target, warns before harm, and leaves a recovery opening',()=>{
 const {G,e}=fight();const h=G.state.bossHazards[0];assert.equal(h.kind,'mirePool');assert.equal(h.radius,16);
 const x=h.x,y=h.y;const health=G.state.player.damageTaken;G.updateBossHazards(.89);assert.equal(G.state.player.damageTaken,health);
 G.state.player.x=x+30;G.updateBossHazards(.02);assert.equal(h.x,x);assert.equal(h.y,y);assert.equal(G.state.player.damageTaken,health);
 assert.ok(e.bossRecoverT>h.warning+h.active);const pattern=e.bossPattern;G.updateEnemies(.1);assert.equal(e.bossPattern,pattern);
});
test('a bubble hits once, does not heal the queen, and expires',()=>{
 const {G,e}=fight();const h=G.state.bossHazards[0];let hits=0;G.damagePlayer=()=>{hits++;return true};e.hp=20;
 G.updateBossHazards(.91);G.updateBossHazards(.05);assert.equal(hits,1);assert.equal(e.hp,20);
 G.updateBossHazards(.5);assert.equal(G.state.bossHazards.length,0);
});
test('later phases add staggered warnings and death or travel removes every bubble',()=>{
 for(const phase of [2,3]){const {G,e}=fight(phase);const pools=G.state.bossHazards;
 assert.equal(pools.length,phase);assert.equal(pools[0].warning,.9);
 for(let i=1;i<pools.length;i++)assert.ok(pools[i].warning>pools[i-1].warning);
 const ctx=new Proxy({},{get:()=>()=>{}});G.drawBossHazards(ctx);
 e.dead=true;G.updateBossHazards(.01);assert.equal(G.state.bossHazards.length,0);}
 const {G}=fight();G.world.load('overworld');G.updateBossHazards(.01);assert.equal(G.state.bossHazards.length,0);
});

test('dash immunity and stagger cancellation remain valid answers to the marsh attack',()=>{
 const {G,e}=fight();const before=G.state.player.damageTaken;G.state.player.dashing={};
 G.updateBossHazards(.91);assert.equal(G.state.player.damageTaken,before);assert.equal(G.state.bossHazards[0].hit,false);
 G.cancelBossHazards(e);assert.equal(G.state.bossHazards.length,0);
});
