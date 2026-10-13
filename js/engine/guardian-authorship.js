/* Authored actions and real, transient attackable props share native combat. */
"use strict";
(() => {
  const authors=new Map();
  G.registerGuardianAuthor=(id,actions)=>authors.set(id,actions);
  G.runGuardianAction=(owner,p,action,spawn)=>{
    const perform=authors.get(owner.def.id)?.actions?.[action];if(!perform)return false;
    perform(owner,p,spawn);return true;
  };
  G.guardianRepeatVictory=owner=>authors.get(owner.def.id)?.repeatVictory?.(owner);
  G.noteGuardianAuthorDefeat=owner=>{authors.get(owner.def.id)?.defeat?.(owner);G.retireGuardianProps(owner);};
  G.guardianPropLive=e=>{
    const r=e?.guardianProp,owner=r?.owner;
    return !!r&&!e.dead&&r.map===G.state.mapId&&!G.state.knockout&&(!owner||(!owner.dead&&owner.bossPhase===r.phase&&G.state.enemies.includes(owner)));
  };
  G.makeGuardianProp=(owner,x,y,{name,size=20,hit,paint})=>{
    const e=G.makeEnemy('slime',x,y);e.id='guardianProp';e.def={...e.def,id:e.id,name,practice:true,damage:0,speed:0,size};e.hp=1;e.ward=null;
    e.guardianProp={owner,map:G.state.mapId,phase:owner?.bossPhase,hit,paint};G.state.enemies.push(e);return e;
  };
  G.hitGuardianProp=(e,opts)=>{
    if(G.guardianPropLive(e)&&opts.damage>0)e.guardianProp.hit(e,opts);
    return false; // Props never manufacture hit, kill, ward, mana or mastery credit.
  };
  G.retireGuardianProps=owner=>{for(const e of G.state.enemies||[])if(e.guardianProp&&(!owner||e.guardianProp.owner===owner)&&!G.guardianPropLive(e))e.dead=true;};
  const update=G.updateOpening;
  G.updateOpening=dt=>{update(dt);G.retireGuardianProps();};
  const draw=G.openingDrawables;
  G.openingDrawables=c=>{const list=draw(c);for(const e of G.state.enemies||[])if(G.guardianPropLive(e)&&e.guardianProp.paint)list.push({y:e.y,fn:()=>e.guardianProp.paint(c,e)});return list;};
})();
