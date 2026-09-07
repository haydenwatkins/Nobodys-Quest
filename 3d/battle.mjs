// Move definitions are independent of input, rendering and save storage.
// Additional forms supply their own weapon->move-set map through resolveMove's registry.
const move=(name,shape,reach,width,damage,posture,windup,recovery,lunge,extra={})=>({name,shape,reach,width,damage,posture,windup,recovery,lunge,...extra});
export const MOVESETS={
 edge:{chain:[
  move('Draw cut','fan',4.5,1.05,22,12,.10,.26,.45),
  move('Returning cut','fan',4.2,1.35,25,18,.13,.25,.65),
  move('Cinder wheel','fan',4.8,2.35,36,32,.20,.34,.25)
 ],vent:move('Furnace cross','fan',7,1.6,80,80,.2,.5,.8)},
 lance:{chain:[
  move('Measure','line',7.4,.7,29,12,.17,.35,.2,{sweetSpot:.68}),
  move('Drive','line',8,.6,35,18,.23,.32,1.1,{sweetSpot:.68}),
  move('Skewer','line',9,.85,48,30,.30,.42,1.5,{sweetSpot:.65})
 ],vent:move('Rail discharge','line',20,1.6,100,80,.2,.5,0)},
 hammer:{chain:[
  move('Keel fall','impact',4.8,2.25,57,55,.32,.53,.15),
  move('Backbreaker','impact',5.2,2.6,65,65,.42,.5,.35),
  move('Foundering blow','impact',5.8,3.2,92,95,.55,.6,.6)
 ],vent:move('Fault driver','line',13,2.5,125,100,.35,.6,.1)}
};
export const COMBAT_FORMS={runner:{name:'Salvage runner',weapons:{shear:'edge',pike:'lance',maul:'hammer'}}};
export function resolveMove(form,weapon,combo=0,vent=false,forms=COMBAT_FORMS,sets=MOVESETS){
 const profile=forms[form];const set=sets[profile?.weapons[weapon]];
 if(!set)throw new Error(`Unsupported combat loadout: ${form}/${weapon}`);
 const definition=vent?set.vent:set.chain[((combo%set.chain.length)+set.chain.length)%set.chain.length];
 return {...definition,duration:definition.windup+definition.recovery,chainLength:set.chain.length};
}
export function contact(move,origin,target,radius=0){
 const dx=target.x-origin.x,dz=target.z-origin.z;
 const forward=dx*Math.sin(origin.yaw)+dz*Math.cos(origin.yaw),side=dx*Math.cos(origin.yaw)-dz*Math.sin(origin.yaw);
 let hit=false;
 if(move.shape==='line')hit=forward>=-radius&&forward<=move.reach+radius&&Math.abs(side)<=move.width+radius;
 if(move.shape==='fan')hit=Math.hypot(dx,dz)<=move.reach+radius&&Math.abs(Math.atan2(side,forward))<=move.width+Math.atan2(radius,Math.max(.1,Math.hypot(dx,dz)));
 if(move.shape==='impact')hit=Math.hypot(side,forward-(move.reach-move.width))<=move.width+radius;
 const precise=hit&&!!move.sweetSpot&&forward>=move.reach*move.sweetSpot;
 return {hit,precise,damage:move.damage*(precise?1.4:1),posture:move.posture*(precise?1.5:1)};
}
