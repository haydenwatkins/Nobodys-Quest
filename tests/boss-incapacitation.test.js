'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),runtime=require('../tools/lib/classic-runtime.cjs');
test('a real paid stun stops a native charging body and follow-up without deleting released shots',()=>{
 const r=runtime(),{G}=r;G.state.opening.complete=true;G.state.delivery.complete=true;G.state.claimedForms.push('wizard','stormcaller');G.questsDone.push(G.forms.stormcaller.quests[0].id);G.setForm('wizard');G.state.loadouts.wizard=['curse','thunderclap'];r.load('sunkenMarsh');r.drain();
 const e=G.makeEnemy('moleMonarch',240,240);G.state.enemies=[e];G.state.bossCutscene=null;Object.assign(e,{bossEngaged:true,bossIntroT:0,bossSpecialT:0,bossPattern:0});e.ward.hp=0;Object.assign(G.state.player,{x:220,y:240});G.updateEnemies(.01);G.updateEnemies(e.bossTelegraphT+.001);assert.ok(e.bossChargeT>0,'actual charge action has begun');assert.equal(e.bossAfterCharge,'royalStomp','the native stomp is waiting on the actual burrow');
 const shot=G.fireGuardianProjectile(e,{x:300,y:280},{x:150,y:280},{speed:40,range:160});G.state.player.mana=G.abilityManaCost(G.abilities.thunderclap);r.taps.add('b');G.updatePlayer(.025);assert.ok(e.status.stun.dur>0,'actual B input buys incapacitation');const at={x:e.x,y:e.y};
 r.step(.025);
 assert.ok(Math.hypot(e.x-at.x,e.y-at.y)<2,'only the native art shove can move the incapacitated body');assert.equal(e.bossContactActive,false);assert.equal(e.bossAfterCharge,null);assert.ok(G.state.projectiles.includes(shot),'released pressure remains independent');assert.equal(e.bossChargeT,0,'the interrupted charge cannot resume without a fresh warning');
});
