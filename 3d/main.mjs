import {Game,readProgress,saveProgress,freshProgress} from './game.mjs';
import {WorldView} from './scene.mjs';
import {WEAPONS,LANDMARKS,STRUCTURES,ROADS,ENEMIES,SAVE_KEY,landHeight,region,clamp,distance} from './world-data.mjs';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let storage;try{storage=window.localStorage;}catch{storage={getItem:()=>null,setItem:()=>{throw Error('Storage unavailable');}};}
let game=new Game(readProgress(storage)),view,started=false,heldAttack=false,joy={x:0,z:0},keys=new Set(),lastRegion='',areaUntil=0,lastSaved=0,toastUntil=0,toastQueue=[],lastUI=0,wasPad={},padPresent=false,dialogueLines=[],musicStep=0,musicTime=0;
let audioContext,master;
const save=()=>{const ok=saveProgress(storage,game);$('#save-status').textContent=ok?'Saved on this device':'Saving unavailable in this browser';lastSaved=game.time;return ok;};
function initAudio(){if(!audioContext){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audioContext=new Audio();master=audioContext.createGain();master.gain.value=game.progress.sound?.13:0;master.connect(audioContext.destination);}if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});}
function tone(freq,duration=.15,type='sine',volume=.3,delay=0){if(!audioContext||!master||!game.progress.sound)return;const now=audioContext.currentTime+delay,osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type=type;osc.frequency.value=freq;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(volume,now+.01);gain.gain.exponentialRampToValueAtTime(.001,now+duration);osc.connect(gain);gain.connect(master);osc.start(now);osc.stop(now+duration+.01);}
function noise(duration=.1,volume=.3){if(!audioContext||!game.progress.sound)return;const n=Math.ceil(audioContext.sampleRate*duration),buffer=audioContext.createBuffer(1,n,audioContext.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<n;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/n,3);const source=audioContext.createBufferSource(),gain=audioContext.createGain();source.buffer=buffer;gain.gain.value=volume;source.connect(gain);gain.connect(master);source.start();}
function sound(e){const name=e.type;if(name==='swing'){const heavy=e.weapon==='maul';noise(heavy?.22:.09,heavy?.6:.2);tone(heavy?57:e.weapon==='pike'?430:180,heavy?.3:.12,'triangle',.4);if(e.vent)tone(82,.5,'sawtooth',.15);}if(name==='hit'){noise(.07,e.heavy?.65:.35);tone(e.heavy?48:94,.13,'triangle',.5);tone(670,.06,'square',.055);}if(name==='damage'){noise(.15,.4);tone(55,.25,'sawtooth',.15);}if(name==='dodge')noise(.14,.1);if(name==='perfect'){tone(880,.3,'sine',.2);tone(1320,.25,'sine',.1,.06);}if(name==='pickup')tone(640,.12,'sine',.1);if(name==='equip')noise(.055,.17);if(name==='stagger'){noise(.18,.4);tone(110,.35,'square',.09);}if(['tooth','salvage','victory'].includes(name))for(const [i,n]of [164.81,220,329.63,440].entries())tone(n,.9,'triangle',.16,i*.16);}
function music(dt){if(!audioContext||!game.progress.sound)return;musicTime-=dt;if(musicTime<=0){musicTime=.42;const notes=[82.41,0,82.41,110,0,82.41,0,123.47];const n=notes[musicStep%8];if(n)tone(n,.3,'triangle',.06);if(musicStep%16===0){tone(82.41,5,'sine',.07);tone(123.47,4,'sine',.025);}musicStep++;}}
function toast(text,duration=3.5){toastQueue.push({text,duration});}
function openDialog(id){for(const d of $$('dialog[open]'))d.close();heldAttack=false;keys.clear();joy={x:0,z:0};$('#joystick>div').style.transform='';const d=$(id);d.showModal();const first=d.querySelector('button:not([disabled]),a');if(first)first.focus();save();}
function closeDialogs(){for(const d of $$('dialog[open]'))d.close();keys.clear();heldAttack=false;}
function speak(speaker,lines){$('#speaker').textContent=speaker.toUpperCase();dialogueLines=[...lines];$('#speech').textContent=dialogueLines.shift();$('#continue').textContent=dialogueLines.length?'Continue ↵':'Return to the field ↗';openDialog('#dialogue');}
function nextSpeech(){if(dialogueLines.length){$('#speech').textContent=dialogueLines.shift();$('#continue').textContent=dialogueLines.length?'Continue ↵':'Return to the field ↗';}else closeDialogs();}
function paused(){return !started||!!$('dialog[open]')||view.overview||document.hidden;}
function start(){if(started)return;initAudio();started=true;view.started=true;$('#welcome').classList.add('hidden');$('#hud').classList.remove('hidden');$('#start').blur();lastRegion='';toast('Find Sera at the amber marker. All three weapons are ready.',4);save();}
function updateMenu(){const p=game.progress;$('#sound-button').textContent=`Sound: ${p.sound?'on':'off'}`;$('#sound-button').setAttribute('aria-pressed',String(p.sound));$('#comfort-button').textContent=`Gentle mode: ${p.gentle?'on':'off'}`;$('#comfort-button').setAttribute('aria-pressed',String(p.gentle));$('#quality-button').textContent=`Graphics: ${p.quality}`;$('#shake-button').textContent=`Impact shake: ${p.shake?'on':'off'}`;$('#shake-button').setAttribute('aria-pressed',String(p.shake));}
function mapOpen(){if(view.overview){view.overview=false;$('#map-button').innerHTML='◇ <span>Chart</span>';return;}drawMap();openDialog('#map-dialog');}
function drawMap(){
  const c=$('#map'),ctx=c.getContext('2d'),w=c.width,h=c.height,scale=4.7,cx=w/2,cy=h/2;
  ctx.fillStyle='#18354a';ctx.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=4)for(let x=0;x<w;x+=4){const wx=(x-cx)/scale,wz=(y-cy)/scale,height=landHeight(wx,wz);if(height<0)continue;ctx.fillStyle=height<.8?'#b69a70':height>2.7?'#3e5968':'#64767a';ctx.fillRect(x,y,4,4);}
  const point=(x,z)=>[cx+x*scale,cy+z*scale];
  ctx.lineWidth=9;ctx.strokeStyle='#af9168';ctx.lineCap='round';for(const road of ROADS){ctx.beginPath();road.forEach(([x,z],i)=>{const p=point(x,z);i?ctx.lineTo(...p):ctx.moveTo(...p);});ctx.stroke();}
  for(const house of STRUCTURES){const [x,y]=point(house.x,house.z);ctx.fillStyle='#b9825c';ctx.fillRect(x-house.w*2,y-house.d*2,house.w*4,house.d*4);}
  ctx.textAlign='center';ctx.font='14px Georgia';ctx.fillStyle='#eef0d1';ctx.fillText('N',w/2,20);ctx.font='12px system-ui';ctx.fillStyle='#c4d6c5';ctx.fillText('THE STORM BELOW',w/2,545);
  for(const l of LANDMARKS){if(!['station','boss','npc'].includes(l.type))continue;const [x,y]=point(l.x,l.z),lit=game.progress.teeth.includes(l.id);ctx.fillStyle=lit?'#ffe7a0':l.type==='boss'?'#d5927b':'#edf0d1';ctx.font='22px Georgia';ctx.fillText(l.type==='boss'?'✦':l.type==='npc'?'⌂':'◆',x,y+6);ctx.font='13px Georgia';ctx.fillText(l.area,x,y+(l.type==='npc'?24:-17));if(lit){ctx.font='10px system-ui';ctx.fillText('SECURED',x,y+21);}}
  const target=game.quest().target;if(target){const [x,y]=point(target.x,target.z);ctx.beginPath();ctx.arc(x,y,15,0,Math.PI*2);ctx.strokeStyle='#ffe097';ctx.lineWidth=2;ctx.stroke();}
  const [px,py]=point(game.player.x,game.player.z);ctx.beginPath();ctx.arc(px,py,7,0,Math.PI*2);ctx.fillStyle='#fff8de';ctx.fill();ctx.strokeStyle='#143b43';ctx.lineWidth=3;ctx.stroke();
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
  $('#sound-button').onclick=()=>{game.progress.sound=!game.progress.sound;initAudio();if(master)master.gain.value=game.progress.sound?.13:0;updateMenu();save();};
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
  let joyId=null;
  const stick=$('#joystick');const moveStick=e=>{if(e.pointerId!==joyId)return;const r=stick.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,len=Math.hypot(dx,dy),max=36;joy={x:dx/Math.max(max,len),z:dy/Math.max(max,len)};stick.firstElementChild.style.transform=`translate(${joy.x*max}px,${joy.z*max}px)`;};
  stick.addEventListener('pointerdown',e=>{if(joyId!==null)return;joyId=e.pointerId;stick.setPointerCapture(e.pointerId);moveStick(e);initAudio();});stick.addEventListener('pointermove',moveStick);const stopStick=e=>{if(e.pointerId===joyId){joyId=null;joy={x:0,z:0};stick.firstElementChild.style.transform='';}};stick.addEventListener('pointerup',stopStick);stick.addEventListener('pointercancel',stopStick);stick.addEventListener('lostpointercapture',stopStick);
  let drag=null;
  $('#world').addEventListener('pointerdown',e=>{drag={id:e.pointerId,x:e.clientX,y:e.clientY};e.target.setPointerCapture(e.pointerId);});
  $('#world').addEventListener('pointermove',e=>{if(drag&&e.pointerId===drag.id){view.yaw-=(e.clientX-drag.x)*.006;drag.x=e.clientX;drag.y=e.clientY;}});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])$('#world').addEventListener(type,()=>drag=null);
  $('#world').addEventListener('wheel',e=>{e.preventDefault();view.zoom=clamp(view.zoom+e.deltaY*.0008,.7,1.65);},{passive:false});
  window.addEventListener('keydown',e=>{
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)&&!$('dialog[open]'))e.preventDefault();
    if(e.code==='Escape'){if(view.overview){view.overview=false;$('#map-button').innerHTML='◇ <span>Chart</span>';}else if(!$('dialog[open]')&&started){updateMenu();openDialog('#menu');}return;}
    if($('dialog[open]')){if(e.code==='KeyE'&&$('#dialogue').open){e.preventDefault();nextSpeech();}return;}
    if(!started){if(e.code==='Enter'||e.code==='Space'){e.preventDefault();start();}return;}
    keys.add(e.code);if(e.repeat)return;initAudio();
    if(e.code==='KeyM'){mapOpen();return;}if(e.code==='KeyI'){rigOpen();return;}if(paused())return;
    if(e.code==='KeyE')game.interact();if(e.code==='Space')game.dodge();if(e.code==='KeyQ')cycleWeapon(1);if(e.code==='KeyK')game.vent();if(e.code==='Digit1')game.setWeapon('shear');if(e.code==='Digit2')game.setWeapon('pike');if(e.code==='Digit3')game.setWeapon('maul');
  });window.addEventListener('keyup',e=>keys.delete(e.code));
  window.addEventListener('blur',()=>{keys.clear();heldAttack=false;joy={x:0,z:0};stick.firstElementChild.style.transform='';});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();heldAttack=false;joy={x:0,z:0};save();}});
  window.addEventListener('pagehide',save);window.addEventListener('resize',()=>view.resize());
  $('#world').addEventListener('webglcontextlost',e=>{e.preventDefault();save();$('#error-text').textContent='The graphics connection paused. Your progress was saved; try reloading, then choose low graphics in the pause menu.';$('#error').classList.remove('hidden');});
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
let feedbackUntil=0;
function events(){for(const e of game.events.splice(0)){sound(e);if(e.type==='save')save();if(e.type==='toast')toast(e.text);if(e.type==='dialogue')speak(e.speaker,e.lines);if(e.type==='equip')save();if(e.type==='hit')view.shake=Math.max(view.shake,e.heavy?.8:.35);if(e.type==='damage')view.shake=.65;if(e.type==='stagger'||e.type==='perfect'){$('#feedback').textContent=e.type==='perfect'?'PERFECT EVADE':'CORE EXPOSED';feedbackUntil=performance.now()/1000+.8;}if(e.type==='tooth')toast(`Governor tooth secured. ${e.count} / 3. Pressure fully primed.`,4);if(e.type==='awaken')toast('The Keelbreaker is awake. Approach the northern engine scar.',5);if(e.type==='respawn')toast('Sera recovered your rig. Recovered teeth and salvage are safe.',4);if(e.type==='salvage')toast(`Rig reinforced. +10 maximum health. ${e.count} / 3 survey cases.`,4);if(e.type==='victory')toast('Engine severed. Return to Sera. Bring the crew home.',6);}}
function ui(now){const p=game.player,w=WEAPONS[p.weapon],q=game.quest();$('#health').style.width=`${Math.max(0,p.hp/game.maxHP*100)}%`;$('#health-label').textContent=`${Math.ceil(p.hp)} / ${game.maxHP}`;$('#pressure').style.width=`${p.charge}%`;$('#pressure-label').textContent=`${Math.floor(p.charge)}%`;$('#pressure-note').textContent=p.charge>=30?'VENT READY / COST 30':'LAND HITS TO BUILD PRESSURE';$('#quest-title').textContent=q.title;$('#quest-detail').textContent=q.detail;$('#quest-count').textContent=q.count;$('#attack-name').textContent=p.weapon==='maul'?'Crush':p.weapon==='pike'?'Thrust':'Cut';$('#vent-name').textContent=w.vent;$('#attack i').style.transform=`scaleY(${p.attack?1-p.attack.age/p.attack.duration:0})`;$('#vent i').style.transform=`scaleY(${p.charge<30?1-p.charge/30:0})`;$('#dodge').style.opacity=p.dodge>0?'.5':'1';for(const b of $$('[data-weapon]')){b.classList.toggle('selected',b.dataset.weapon===p.weapon);b.setAttribute('aria-pressed',String(b.dataset.weapon===p.weapon));}
 const near=!paused()?game.nearby():null;$('#interact').classList.toggle('hidden',!near);if(near){$('#interact-label').textContent=near.name;$('#interact .key').textContent=padPresent?'Y':'E';}const boss=game.enemies.find(e=>e.type==='engine');$('#boss').classList.toggle('hidden',!(game.active(boss)&&distance(boss,p)<24));$('#boss-health').style.width=`${Math.max(0,boss.hp/ENEMIES.engine.hp*100)}%`;$('#boss-posture').textContent=boss.state==='stagger'?'CORE EXPOSED / STRIKE NOW':`POSTURE ${Math.round(boss.posture/ENEMIES.engine.posture*100)}% / BREAK WITH HEAVY BLOWS`;
 const area=region(p.x,p.z);if(started&&area!==lastRegion){lastRegion=area;$('#area h2').textContent=area;areaUntil=now+3.5;}$('#area').classList.toggle('show',now<areaUntil&&!view.overview);$('#feedback').classList.toggle('show',now<feedbackUntil);$('#damage-vignette').classList.toggle('show',p.flash>0);if(now>toastUntil&&toastQueue.length){const t=toastQueue.shift();$('#toast').textContent=t.text;toastUntil=now+t.duration;}$('#toast').classList.toggle('show',now<toastUntil);if(padPresent)$('#desktop-hint').textContent='Left stick move · A strike · X vent · B evade · Y interact · LB / RB weapon';}
try{
  view=new WorldView($('#world'),game);wire();window.stormEngineReady=true;$('#loading').classList.add('hidden');$('#welcome').classList.remove('hidden');$('#start').textContent=game.progress.briefed?'Return to the field ↗':'Enter the breach ↗';
  let last=performance.now();function frame(now){try{const dt=Math.min((now-last)/1000,.05);last=now;const pad=gamepad(dt);
    if(!paused()){
      const x=joy.x+pad.x+(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0),z=joy.z+pad.z+(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0);
      if(heldAttack||keys.has('KeyJ'))game.attack();game.update(dt,view.orientCameraMove(x,z));music(dt);if(game.time-lastSaved>10)save();
    }
    events();view.update(dt);if(now-lastUI>80){ui(now/1000);lastUI=now;}requestAnimationFrame(frame);
  }catch(error){console.error(error);save();$('#error').classList.remove('hidden');$('#error-text').textContent='The renderer stopped. Your latest progress was saved. Reconnect to continue.';}}requestAnimationFrame(frame);
}catch(error){console.error(error);$('#loading').classList.add('hidden');$('#error').classList.remove('hidden');$('#error-text').textContent='This device could not start the 3D world. Try a current browser with graphics acceleration.';}
