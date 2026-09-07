import {Soundscape} from './audio.mjs';
import {installPointerControls,installGameplayGestures} from './touch-controls.mjs';
import {Game,readProgress,saveProgress,freshProgress} from './game.mjs';
import {WorldView} from './scene.mjs';
import {WEAPONS,LANDMARKS,STRUCTURES,ROADS,ENEMIES,SAVE_KEY,landHeight,region,clamp,distance} from './world-data.mjs';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let storage;try{storage=window.localStorage;}catch{storage={getItem:()=>null,setItem:()=>{throw Error('Storage unavailable');}};}
let game=new Game(readProgress(storage)),view,started=false,heldAttack=false,joy={x:0,z:0},keys=new Set(),lastRegion='',areaUntil=0,lastSaved=0,toastUntil=0,toastQueue=[],lastUI=0,wasPad={},padPresent=false,dialogueLines=[];
const soundtrack=new Soundscape();
let pointerControls,gameplayGestures;
function clearInput(){game.player.buffer=null;game.player.vx=0;game.player.vz=0;keys.clear();heldAttack=false;joy={x:0,z:0};pointerControls?.reset();gameplayGestures?.reset();}
const save=()=>{const ok=saveProgress(storage,game);$('#save-status').textContent=ok?'Saved on this device':'Saving unavailable in this browser';lastSaved=game.time;return ok;};
function initAudio(){soundtrack.unlock(game.progress.sound);}
function sound(e){soundtrack.event(e);}
function music(dt){soundtrack.tick(dt,!!game.nearestEnemy(14),game.player.move>.15&&!game.player.attack&&!game.player.dash);}
function toast(text,duration=3.5){toastQueue.push({text,duration});}
function openDialog(id){for(const d of $$('dialog[open]'))d.close();clearInput();const d=$(id);d.showModal();const first=d.querySelector('button:not([disabled]),a');if(first)first.focus();save();}
function closeDialogs(){for(const d of $$('dialog[open]'))d.close();clearInput();}
function speak(speaker,lines){$('#speaker').textContent=speaker.toUpperCase();dialogueLines=[...lines];$('#speech').textContent=dialogueLines.shift();$('#continue').textContent=dialogueLines.length?'Continue':'Continue';openDialog('#dialogue');}
function nextSpeech(){if(dialogueLines.length){$('#speech').textContent=dialogueLines.shift();$('#continue').textContent=dialogueLines.length?'Continue':'Continue';}else closeDialogs();}
function paused(){return !started||!!$('dialog[open]')||view.overview||document.hidden;}
function start(){if(started)return;initAudio();started=true;view.started=true;$('#welcome').classList.add('hidden');$('#hud').classList.remove('hidden');$('#start').blur();lastRegion='';if(!game.progress.briefed)toast('Sera is waiting by the mooring wheel.',3);save();}
function updateMenu(){const p=game.progress;$('#sound-button').textContent=`Sound: ${p.sound?'on':'off'}`;$('#sound-button').setAttribute('aria-pressed',String(p.sound));$('#comfort-button').textContent=`Gentle mode: ${p.gentle?'on':'off'}`;$('#comfort-button').setAttribute('aria-pressed',String(p.gentle));$('#quality-button').textContent=`Graphics: ${p.quality}`;$('#shake-button').textContent=`Impact shake: ${p.shake?'on':'off'}`;$('#shake-button').setAttribute('aria-pressed',String(p.shake));}
function mapOpen(){if(view.overview){view.overview=false;$('#map-button').innerHTML='<svg><use href="#chart-icon"/></svg><span>Chart</span>';return;}drawMap();openDialog('#map-dialog');}
function drawMap(){
  const c=$('#map'),ctx=c.getContext('2d'),w=c.width,h=c.height,scale=4.7,cx=w/2,cy=h/2;
  ctx.fillStyle='#c7c6a4';ctx.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=4)for(let x=0;x<w;x+=4){const wx=(x-cx)/scale,wz=(y-cy)/scale,height=landHeight(wx,wz);if(height<0)continue;ctx.fillStyle=height<.8?'#b1ad85':height>2.7?'#7b8163':'#a0a281';ctx.fillRect(x,y,4,4);}
  const point=(x,z)=>[cx+x*scale,cy+z*scale];
  ctx.lineWidth=9;ctx.strokeStyle='#797c60';ctx.lineCap='round';for(const road of ROADS){ctx.beginPath();road.forEach(([x,z],i)=>{const p=point(x,z);i?ctx.lineTo(...p):ctx.moveTo(...p);});ctx.stroke();}
  for(const house of STRUCTURES){const [x,y]=point(house.x,house.z);ctx.fillStyle='#b9825c';ctx.fillRect(x-house.w*2,y-house.d*2,house.w*4,house.d*4);}
  ctx.textAlign='center';ctx.font='14px Georgia';ctx.fillStyle='#343d2e';ctx.fillText('N',w/2,20);ctx.font='12px system-ui';ctx.fillStyle='#667259';ctx.fillText('THE STORM BELOW',w/2,545);
  for(const l of LANDMARKS){if(!['station','relay','boss','npc'].includes(l.type))continue;if((l.type==='relay'||l.id==='iona'||l.id==='harrow')&&!game.progress.returned)continue;if(l.type==='npc'&&l.id!==(game.progress.returned?'iona':'sera'))continue;const [x,y]=point(l.x,l.z),lit=game.progress.teeth.includes(l.id)||game.progress.relays.includes(l.id);ctx.fillStyle=lit?'#ffe7a0':l.type==='boss'?'#d5927b':'#333d31';ctx.font='22px Georgia';ctx.fillText(l.type==='boss'?'✦':l.type==='npc'?'⌂':l.type==='relay'?'▣':'◆',x,y+6);ctx.font='13px Georgia';ctx.fillText(l.type==='npc'?l.name:l.area,x,y+(l.type==='npc'?24:-17));if(lit){ctx.font='10px system-ui';ctx.fillText('SECURED',x,y+21);}}
  const target=game.quest().target;if(target){const [x,y]=point(target.x,target.z);ctx.beginPath();ctx.arc(x,y,15,0,Math.PI*2);ctx.strokeStyle='#9b4635';ctx.lineWidth=2;ctx.stroke();}
  const [px,py]=point(game.player.x,game.player.z);ctx.beginPath();ctx.arc(px,py,7,0,Math.PI*2);ctx.fillStyle='#9b4635';ctx.fill();ctx.strokeStyle='#e2daba';ctx.lineWidth=3;ctx.stroke();
  $('#map-quest').textContent=game.quest().detail;
}
function rigOpen(){const list=$('#weapon-list');list.replaceChildren();for(const [id,w]of Object.entries(WEAPONS)){const b=document.createElement('button');b.className='weapon-option'+(game.player.weapon===id?' chosen':'');const strong=document.createElement('strong');strong.textContent=w.name;const desc=document.createElement('span');desc.textContent=w.description+' Vent: '+w.vent+'.';b.append(strong,desc);b.onclick=()=>{if(game.setWeapon(id)||game.player.weapon===id){save();closeDialogs();}else toast('Finish the current strike before changing tools.');};list.append(b);}openDialog('#rig-dialog');}
function cycleWeapon(delta){const ids=Object.keys(WEAPONS),i=ids.indexOf(game.player.weapon);game.setWeapon(ids[(i+delta+ids.length)%ids.length]);}
function wire(){
  $('#start').onclick=start;$('#welcome-controls').onclick=()=>{updateMenu();openDialog('#menu');$('#menu details').open=true;};$('#continue').onclick=nextSpeech;
  for(const b of $$('[data-close]'))b.onclick=closeDialogs;
  $('#pause-button').onclick=()=>{updateMenu();openDialog('#menu');};$('#resume').onclick=closeDialogs;
  $('#map-button').onclick=mapOpen;$('#journal-button').onclick=mapOpen;$('#rig-button').onclick=rigOpen;
  $('#globe-button').onclick=()=>{closeDialogs();view.overview=true;$('#map-button').innerHTML='↙ <span>Return</span>';toast('The falling island. Tap Return to continue your mission.',5);};
  $('#sound-button').onclick=()=>{game.progress.sound=!game.progress.sound;initAudio();updateMenu();save();};
  $('#quality-button').onclick=()=>{const modes=['balanced','low','high'];game.progress.quality=modes[(modes.indexOf(game.progress.quality)+1)%modes.length];view.setQuality(game.progress.quality);updateMenu();save();};
  $('#shake-button').onclick=()=>{game.progress.shake=!game.progress.shake;updateMenu();save();};
  $('#comfort-button').onclick=()=>{game.progress.gentle=!game.progress.gentle;updateMenu();save();};
  $('#restart').onclick=()=>openDialog('#reset-dialog');$('#confirm-reset').onclick=()=>{const p=freshProgress();p.sound=game.progress.sound;p.quality=game.progress.quality;p.gentle=game.progress.gentle;p.shake=game.progress.shake;game=new Game(p);view.game=game;closeDialogs();lastRegion='';save();toast('Rig reset. Report to Sera at the anchorage.');};
  for(const b of $$('[data-weapon]'))b.onclick=()=>{if(!paused())game.setWeapon(b.dataset.weapon);};
  $('#interact').onclick=()=>{if(!paused())game.interact();};
  for(const [id,action]of [['attack','attack'],['vent','vent'],['dodge','dodge']]){
    const b=$('#'+id);b.addEventListener('pointerdown',e=>{e.preventDefault();initAudio();b.setPointerCapture(e.pointerId);if(paused())return;if(action==='attack')heldAttack=true;game[action]();});
    const stop=()=>{if(action==='attack')heldAttack=false;};b.addEventListener('pointerup',stop);b.addEventListener('pointercancel',stop);b.addEventListener('lostpointercapture',stop);
    b.addEventListener('click',e=>{if(e.detail===0&&!paused())game[action]();});
  }
  pointerControls=installPointerControls({world:$('#world'),stick:$('#joystick'),canMove:()=>!paused(),canLook:()=>!$('dialog[open]')&&!document.hidden,width:()=>innerWidth,onMove:value=>joy=value,onLook:dx=>view.yaw-=dx*.006,onStart:initAudio});
  gameplayGestures=installGameplayGestures(document,()=>started&&!$('dialog[open]')&&!document.hidden);
  $('#world').addEventListener('wheel',e=>{e.preventDefault();view.zoom=clamp(view.zoom+e.deltaY*.0008,.7,1.65);},{passive:false});
  window.addEventListener('keydown',e=>{
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)&&!$('dialog[open]'))e.preventDefault();
    if(e.code==='Escape'){if(view.overview){view.overview=false;$('#map-button').innerHTML='<svg><use href="#chart-icon"/></svg><span>Chart</span>';}else if(!$('dialog[open]')&&started){updateMenu();openDialog('#menu');}return;}
    if($('dialog[open]')){if(e.code==='KeyE'&&$('#dialogue').open){e.preventDefault();nextSpeech();}return;}
    if(!started){if(e.code==='Enter'||e.code==='Space'){e.preventDefault();start();}return;}
    keys.add(e.code);if(e.repeat)return;initAudio();
    if(e.code==='KeyM'){mapOpen();return;}if(e.code==='KeyI'){rigOpen();return;}if(paused())return;
    if(e.code==='KeyJ')game.attack();if(e.code==='KeyE')game.interact();if(e.code==='Space')game.dodge();if(e.code==='KeyQ')cycleWeapon(1);if(e.code==='KeyK')game.vent();if(e.code==='Digit1')game.setWeapon('shear');if(e.code==='Digit2')game.setWeapon('pike');if(e.code==='Digit3')game.setWeapon('maul');
  });window.addEventListener('keyup',e=>keys.delete(e.code));
  window.addEventListener('blur',clearInput);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();save();}});
  window.addEventListener('pagehide',()=>{clearInput();save();});window.addEventListener('resize',()=>{clearInput();view.resize();});
  $('#world').addEventListener('webglcontextlost',e=>{e.preventDefault();clearInput();save();$('#error-text').textContent='The graphics connection paused. Your progress was saved; try reloading, then choose low graphics in the pause menu.';$('#error').classList.remove('hidden');});
}
function gamepad(dt){
  const pads=navigator.getGamepads?navigator.getGamepads():[],pad=[...pads].find(p=>p&&p.connected);if(!pad){wasPad={};return {x:0,z:0};}padPresent=true;
  const buttons=pad.buttons.map(b=>b.pressed),edge=i=>buttons[i]&&!wasPad[i],ax=i=>Math.abs(pad.axes[i]||0)>.18?pad.axes[i]:0;
  const d=$('dialog[open]');
  if(!started){if(edge(0))start();}
  else if(d){
    const controls=[...d.querySelectorAll('button:not([disabled]),a,summary')].filter(el=>el.getClientRects().length);let i=controls.indexOf(document.activeElement);
    const up=edge(12)||(ax(1)<-.6&&!wasPad.up),down=edge(13)||(ax(1)>.6&&!wasPad.down);
    if(up||down){i=(i+(up?-1:1)+controls.length)%controls.length;controls[i]?.focus();controls[i]?.scrollIntoView({block:'nearest'});}if(edge(0))document.activeElement?.click();if(edge(1)||edge(9))closeDialogs();
  }else if(view.overview){if(edge(1)||edge(8)||edge(9))mapOpen();view.yaw-=ax(2)*dt*1.8;}
  else{
    if(edge(9)){updateMenu();openDialog('#menu');}else if(edge(8))mapOpen();else{
      if(buttons[0]||buttons[7])game.attack();if(edge(2))game.vent();if(edge(1))game.dodge();if(edge(3))game.interact();if(edge(4))cycleWeapon(-1);if(edge(5))cycleWeapon(1);view.yaw-=ax(2)*dt*1.8;view.zoom=clamp(view.zoom+ax(3)*dt*.5,.7,1.65);
    }
  }
  wasPad=Object.assign({},buttons,{up:ax(1)<-.6,down:ax(1)>.6});
  return {x:ax(0)+(buttons[15]?1:0)-(buttons[14]?1:0),z:ax(1)+(buttons[13]?1:0)-(buttons[12]?1:0)};
}
let feedbackUntil=0,questUntil=0,lastQuest='';
function events(){for(const e of game.events.splice(0)){sound(e);if(e.type==='save')save();if(e.type==='toast')toast(e.text);if(e.type==='dialogue')speak(e.speaker,e.lines);if(e.type==='equip')save();if(e.type==='hit')view.shake=Math.max(view.shake,e.heavy?.8:.35);if(e.type==='damage')view.shake=.65;if(e.type==='stagger'||e.type==='perfect'){$('#feedback').textContent=e.type==='perfect'?'Perfect evade':'Core exposed';feedbackUntil=performance.now()/1000+.8;}if(e.type==='tooth')toast(`Governor tooth secured. ${e.count} / 3. Pressure fully primed.`,4);if(e.type==='awaken')toast('The Keelbreaker is awake. Approach the northern engine scar.',5);if(e.type==='respawn')toast('Sera recovered your rig. Recovered teeth and salvage are safe.',4);if(e.type==='salvage')toast(`Rig reinforced. +10 maximum health. ${e.count} / 3 survey cases.`,4);if(e.type==='relay-start')toast('Transmitter active. First patrol incoming. Clear both patrols, then secure it.',5);if(e.type==='relay-wave')toast('Second patrol incoming. Keep the transmitter standing.',4);if(e.type==='relay-secured')toast(e.count===2?'Both relays online. The Tempest Harrow is exposed in the northwest.':`Relay online. ${e.count} / 2. Rig repaired.`,5);if(e.type==='rescue-victory')toast('The stormline is clear. Return to Iona for your upgraded regulator.',6);if(e.type==='crew-home')toast('CREW REGULATOR FITTED / Vent cost 20 / +20 health',5);if(e.type==='victory')toast('Engine severed. Return to Sera. Bring the crew home.',6);}}
function ui(now){const p=game.player,w=WEAPONS[p.weapon],q=game.quest();$('#health').style.width=`${Math.max(0,p.hp/game.maxHP*100)}%`;$('#health-label').textContent=`${Math.ceil(p.hp)} / ${game.maxHP}`;$('#pressure').style.width=`${p.charge}%`;$('#pressure-label').textContent=`${Math.floor(p.charge)}%`;$('#pressure-note').textContent=p.charge>=game.ventCost?`Vent ready · ${game.ventCost}`:'Build pressure with hits';$('#quest-title').textContent=q.title;$('#quest-detail').textContent=q.detail;if(lastQuest!==q.title+q.count){lastQuest=q.title+q.count;questUntil=now+6;}$('#quest').classList.toggle('expanded',now<questUntil);$('#hud').classList.toggle('in-combat',!!game.nearestEnemy(13));$('#equipped-name').textContent=w.name;$('#attack-symbol use').setAttribute('href','#'+(p.weapon==='shear'?'edge':p.weapon==='pike'?'lance':'hammer')+'-icon');$('#quest-count').textContent=q.count;$('#attack-name').textContent=p.weapon==='maul'?'Crush':p.weapon==='pike'?'Thrust':'Cut';$('#vent-name').textContent=w.vent;$('#attack i').style.transform=`scaleY(${p.attack?1-p.attack.age/p.attack.duration:0})`;$('#vent i').style.transform=`scaleY(${p.charge<game.ventCost?1-p.charge/game.ventCost:0})`;$('#dodge').style.opacity=p.dodge>0?'.5':'1';for(const b of $$('[data-weapon]')){b.classList.toggle('selected',b.dataset.weapon===p.weapon);b.setAttribute('aria-pressed',String(b.dataset.weapon===p.weapon));}
 const near=!paused()?game.nearby():null;$('#interact').classList.toggle('hidden',!near);if(near){$('#interact-label').textContent=near.name;$('#interact .key').textContent=padPresent?'Y':'E';}const boss=game.enemies.find(e=>e.type==='harrow'&&game.active(e)&&distance(e,p)<27)||game.enemies.find(e=>e.type==='engine');const bossData=ENEMIES[boss.type];$('#boss>span').textContent=bossData.name.toUpperCase();$('#boss').classList.toggle('hidden',!(game.active(boss)&&distance(boss,p)<24));$('#boss-health').style.width=`${Math.max(0,boss.hp/bossData.hp*100)}%`;$('#boss-posture').textContent=boss.state==='stagger'?'Core exposed':`Posture · ${Math.round(boss.posture/bossData.posture*100)}%`;
 const area=region(p.x,p.z);if(started&&area!==lastRegion){lastRegion=area;$('#area h2').textContent=area;areaUntil=now+3.5;}$('#area').classList.toggle('show',now<areaUntil&&!view.overview);$('#feedback').classList.toggle('show',now<feedbackUntil);$('#damage-vignette').classList.toggle('show',p.flash>0);if(now>toastUntil&&toastQueue.length){const t=toastQueue.shift();$('#toast').textContent=t.text;toastUntil=now+t.duration;}$('#toast').classList.toggle('show',now<toastUntil);if(padPresent)$('#desktop-hint').textContent='Left stick move · A strike · X vent · B evade · Y interact · LB / RB weapon';}
try{
  view=new WorldView($('#world'),game);wire();window.stormEngineReady=true;$('#loading').classList.add('hidden');$('#welcome').classList.remove('hidden');$('#start').textContent=game.progress.briefed?'Continue':'Begin';
  let last=performance.now();function frame(now){try{const dt=Math.min((now-last)/1000,.05);last=now;const pad=gamepad(dt);
    if(!paused()){
      const x=joy.x+pad.x+(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0),z=joy.z+pad.z+(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0);
      if(heldAttack||keys.has('KeyJ'))game.attack();game.update(dt,view.orientCameraMove(x,z));music(dt);if(game.time-lastSaved>10)save();
    }
    events();view.update(dt);if(now-lastUI>80){ui(now/1000);lastUI=now;}requestAnimationFrame(frame);
  }catch(error){console.error(error);save();$('#error').classList.remove('hidden');$('#error-text').textContent='The renderer stopped. Your latest progress was saved. Reconnect to continue.';}}requestAnimationFrame(frame);
}catch(error){console.error(error);$('#loading').classList.add('hidden');$('#error').classList.remove('hidden');$('#error-text').textContent='This device could not start the 3D world. Try a current browser with graphics acceleration.';}
