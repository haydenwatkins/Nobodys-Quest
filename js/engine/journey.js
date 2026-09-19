/* One journey across authored chapters and the original world. Road stops
   belong in the Atlas without changing the eight-region completion reward. */
"use strict";
G.JOURNEY_STOPS = [
  {id:"orchardRoad",name:"Orchard Road",icon:"🌳",clue:"Help Parcel, open the culvert, and ring the watch bell."},
  {id:"heartwood",name:"The Heartwood",icon:"🌲",clue:"The root arch at the north end of Orchard Road leads to the guardian."},
  {id:"lanternReach",name:"Lantern Reach",icon:"🏮",clue:"Parcel's departure post leads here. Restore both lamps to cross the causeway."},
  {id:"tollCourt",name:"Old Toll Bridge",icon:"🌧",clue:"East of the lanterns. Defeat the Tollkeeper to open the road to town."},
  {id:"sunriseQuay",name:"Sunrise Quay",icon:"☀",clue:"Deliver the parcels, then meet Parcel. The east road joins the town green."},
  {id:"town",name:"Town Green",icon:"🏡",clue:"Build homes and choose projects for the people you brought together."},
];
G.journeyStop = id => {
  const stop=G.JOURNEY_STOPS.find(stop => stop.id === id);
  if (!stop) return null;
  if (id === "sunriseQuay" && G.state?.delivery?.complete)
    return {...stop,clue:"The deliveries are complete. Meet Parcel for a ride to Orchard Road, explore the Manyfold trail, or take the east road to your town."};
  return stop;
};
const regionInfo = G.wayfinderRegionInfo;
G.wayfinderRegionInfo = id => G.journeyStop(id) || regionInfo(id);
const allIds = G.wayfinderAllIds;
G.wayfinderAllIds = () => [...new Set(allIds().concat(G.JOURNEY_STOPS.map(stop=>stop.id)))];
const normalize = G.normalizeWayfinder;
G.normalizeWayfinder = (saved, legacy) => {
  const journal = normalize(saved, legacy);
  // The new crest and guardian are earned on the story road, so they are
  // not evidence that this player visited the old dungeon or Mistwood.
  if (legacy && legacy.opening && (legacy.opening.started || legacy.opening.seen?.includes("arrival"))) {
    for (const [id,evidence] of [["dungeon","knights-crest"],["mistwood","trophy-heartwood-crown"]]) {
      if (!(saved?.discovered||[]).includes(id) && legacy.mapId!==id &&
          !(legacy.opened||[]).some(key=>key.startsWith(id+":"))) {
        journal.discovered=journal.discovered.filter(found=>found!==id);
        journal.posts=journal.posts.filter(found=>found!==id);
      }
    }
  }
  if(legacy?.opening?.started || legacy?.opening?.seen?.includes("arrival")) {
    if(!journal.discovered.includes("orchardRoad"))journal.discovered.push("orchardRoad");
  }
  return journal;
};
G.events.on("mapEnter", ({map}) => {
  if(G.journeyStop(map) && !G.ensureWayfinder().discovered.includes(map)) {
    G.ensureWayfinder().discovered.push(map);
    G.saveGame();
  }
});

G.journeyTravelLinks = mapId => {
  const s=G.state,d=s.delivery||{};
  if(mapId==="orchardRoad" && s.opening?.complete)
    return [{x:26,y:37,map:d.complete?"sunriseQuay":"lanternReach",label:d.complete?"Parcel's cart to Sunrise Quay":"Parcel's departure post",kind:"cart"}];
  if(mapId==="sunriseQuay" && d.complete)
    return [{x:8,y:20,map:"orchardRoad",label:"Parcel's cart to Orchard Road",kind:"cart"}];
  return [];
};

G.journeyGateReason = (mapId,destination) => {
  const s=G.state,o=s.opening||{},d=s.delivery||{};
  if(mapId==="orchardRoad" && destination==="heartwood" && !o.bell) return "Ring the watch bell to open the root arch.";
  if(mapId==="lanternReach" && destination==="tollCourt" && d.lamps?.[1]!==2) return "Restore both lanterns to open the causeway.";
  if(mapId==="tollCourt" && destination==="sunriseQuay" && !d.keeper && (s.mapId!==mapId || s.player.x<28*G.TILE)) return "Defeat the Tollkeeper to cross the bridge.";
  if(mapId==="tollCourt" && destination==="lanternReach" && !d.keeper && s.mapId===mapId && s.player.x>28*G.TILE) return "The Tollkeeper bars this side. Return through the quay.";
  return null;
};

G.localJourneyRoutes = () => {
  const s=G.state,routes=[],seen=new Set();
  const direction=(x,y)=>{
    const dx=x*G.TILE+8-s.player.x,dy=y*G.TILE+8-s.player.y;
    return Math.abs(dx)>Math.abs(dy)?dx<0?"West":"East":dy<0?"North":"South";
  };
  for(let y=0;y<s.mapH;y++)for(let x=0;x<s.mapW;x++) {
    const cell=s.grid[y][x];if(!cell.portal||seen.has(cell.portal.map))continue;
    seen.add(cell.portal.map);
    const reason=G.world.portalBlockReason(cell);
    routes.push({map:cell.portal.map,x,y,name:G.maps[cell.portal.map].name,direction:direction(x,y),
      reason:reason?.text||G.journeyGateReason(s.mapId,cell.portal.map),kind:"road"});
  }
  for(const link of G.journeyTravelLinks(s.mapId))routes.push({...link,name:link.label,direction:direction(link.x,link.y),reason:null});
  return routes;
};

// Prepare from the actual enemy and earned-art registries, including old saves.
G.bossPreparation = () => {
  const s=G.state;
  if(!s || s.expeditionRun)return null;
  const promise=G.followedSunriseRequest?.();
  const goal=promise?.id==="beacon"&&!promise.ready?{guide:"boss",mapId:"sunkenMarsh"}:G.storyGoal();
  if(goal?.guide!=="boss" || goal.complete)return null;
  const map=G.maps[goal.mapId];
  const def=Object.values(map?.legend||{}).map(cell=>G.enemies[cell.enemy]).find(e=>e?.miniboss&&e.ward&&!(s.items||[]).includes(e.trophy));
  if(!def)return null;
  const live=s.mapId===goal.mapId?s.enemies.find(e=>e.id===def.id&&!e.dead):null;
  if(live?.ward?.hp<=0)return null;
  const types=live?.ward?.types||def.ward.types,form=G.playerForm(),loadout=G.getLoadout(form.id);
  const matches=id=>types.includes(G.abilities[id]?.type);
  const equipped=loadout.slice(0,form.slots+1).find(matches);
  const arts=G.availableAbilities().filter(matches).sort((a,b)=>(G.abilities[a].mana||0)-(G.abilities[b].mana||0));
  const source=G.formOrder.map(id=>G.forms[id]).find(f=>matches(f.basic));
  return {enemy:def.name,types,ready:!!equipped||!!form.breaksAnyWard,equipped,arts,source:source?.id};
};
G.equipBossPreparation = (id,slot) => {
  const prep=G.bossPreparation(),form=G.playerForm();
  if(!prep || !prep.arts.includes(id) || !Number.isInteger(slot) || slot<1 || slot>form.slots)return false;
  G.getLoadout(form.id)[slot]=id;G.saveGame();return true;
};
