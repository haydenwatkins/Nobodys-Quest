/* Adventure choices and the earned opening shared by authored counters.
   Hazards, damage, arts, input and rewards remain in the existing engine. */
"use strict";
(() => {
  const profile=mode=>({practiceCleared:false,counterLearned:false,invited:false,[mode]:false,[mode+'Cleared']:false,bestCounters:0});
  G.makeGuardianChallenges=()=>({treant:profile('branching'),queen:profile('rippling'),knight:profile('crescent'),mira:profile('doubleReturn'),bram:profile('rootRumble')});
  G.normalizeGuardianChallenges=raw=>{
    const out=G.makeGuardianChallenges();
    for(const [id,mode] of [['treant','branching'],['queen','rippling'],['knight','crescent'],['mira','doubleReturn'],['bram','rootRumble']]){
      const a=raw?.[id],b=out[id];
      for(const k of ['practiceCleared','counterLearned','invited',mode+'Cleared'])b[k]=a?.[k]===true;
      b[mode]=a?.[mode]===true&&b.counterLearned;
      b.bestCounters=Number.isFinite(a?.bestCounters)?Math.max(0,Math.min(99,Math.floor(a.bestCounters))):0;
    }
    return out;
  };
  G.guardianCounterOpening=owner=>{
    G.cancelBossHazards(owner);
    owner.bossPendingAction=owner.bossAfterCharge=null;
    owner.bossTelegraphT=owner.bossChargeT=0;owner.bossContactActive=false;
    owner.openingTimer=0;
    owner.bossStaggerT=Math.max(owner.bossStaggerT||0,1.6);
    owner.bossRecoverT=Math.max(owner.bossRecoverT||0,.4);
    for(const shot of G.state.projectiles)if(!shot.fromPlayer&&shot.owner===owner)shot.dispelled=true;
  };
})();
