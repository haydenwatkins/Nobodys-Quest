import {Game,readProgress,saveProgress,freshProgress} from './game.mjs';
import {WorldView} from './scene.mjs';
import {FORMS,ARTS,LANDMARKS,HOUSES,ROADS,ENEMIES,SAVE_KEY,landHeight,region,clamp,distance} from './world-data.mjs';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
let storage;try{storage=window.localStorage;}catch{storage={getItem:()=>null,setItem:()=>{throw Error('Storage unavailable');}};}
let game=new Game(readProgress(storage)),view,started=false,heldAttack=false,heldSpecial=false,joy={x:0,z:0},keys=new Set(),lastRegion='',areaUntil=0,lastSaved=0,toastUntil=0,toastQueue=[],lastUI=0,wasPad={},padPresent=false,dialogueLines=[],musicStep=0,musicTime=0;
let audioContext,master;
const save=()=>{const ok=saveProgress(storage,game);$('#save-status').textContent=ok?'Saved on this device':'Saving unavailable in this browser';lastSaved=game.time;return ok;};
function initAudio(){if(!audioContext){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audioContext=new Audio();master=audioContext.createGain();master.gain.value=game.progress.sound?.13:0;master.connect(audioContext.destination);}if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});}
function tone(freq,duration=.15,type='sine',volume=.3,delay=0){if(!audioContext||!master||!game.progress.sound)return;const now=audioContext.currentTime+delay,osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.type=type;osc.frequency.value=freq;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(volume,now+.01);gain.gain.exponentialRampToValueAtTime(.001,now+duration);osc.connect(gain);gain.connect(master);osc.start(now);osc.stop(now+duration+.01);}
function sound(name){if(name==='attack')tone(game.player.form==='knight'?130:240,.09,'triangle',.23);if(name==='hit')tone(100,.08,'triangle',.35);if(name==='damage')tone(65,.2,'sawtooth',.13);if(name==='dodge')tone(370,.09,'sine',.15);if(name==='pickup')tone(740,.2,'sine',.16);if(['shift','special'].includes(name)){tone(293,.2,'triangle',.22);tone(440,.3,'sine',.2,.08);}if(['unlock','beacon','treasure','victory'].includes(name))for(const [i,n]of [293,370,440,587].entries())tone(n,.7,'triangle',.25,i*.12);}
function music(dt){if(!audioContext||!game.progress.sound)return;musicTime-=dt;if(musicTime<=0){musicTime=.55;const notes=[293.66,0,440,493.88,0,369.99,0,329.63,293.66,0,246.94,0,329.63,0,0,0];const n=notes[musicStep%notes.length];if(n)tone(n,.9,'sine',.07);if(musicStep%8===0){tone(musicStep%16===0?146.83:164.81,3.5,'sine',.055);tone(220,3.5,'sine',.025);}musicStep++;}}
function toast(text,duration=3.5){toastQueue.push({text,duration});}
function openDialog(id){for(const d of $$('dialog[open]'))d.close();heldAttack=false;heldSpecial=false;keys.clear();joy={x:0,z:0};$('#joystick>div').style.transform='';const d=$(id);d.showModal();const first=d.querySelector('button:not([disabled]),a');if(first)first.focus();save();}
function closeDialogs(){for(const d of $$('dialog[open]'))d.close();keys.clear();heldAttack=false;heldSpecial=false;}
function speak(speaker,lines){$('#speaker').textContent=speaker.toUpperCase();dialogueLines=[...lines];$('#speech').textContent=dialogueLines.shift();$('#continue').textContent=dialogueLines.length?'Continue ↵':'Back to the adventure ↗';openDialog('#dialogue');}
function nextSpeech(){if(dialogueLines.length){$('#speech').textContent=dialogueLines.shift();$('#continue').textContent=dialogueLines.length?'Continue ↵':'Back to the adventure ↗';}else closeDialogs();}
function paused(){return !started||!!$('dialog[open]')||view.overview||document.hidden;}
function start(){if(started)return;initAudio();started=true;view.started=true;$('#welcome').classList.add('hidden');$('#hud').classList.remove('hidden');$('#start').blur();lastRegion='';toast('A new perspective. Your original adventure is safe.',4);save();}
function updateMenu(){const p=game.progress;$('#sound-button').textContent=`Sound: ${p.sound?'on':'off'}`;$('#sound-button').setAttribute('aria-pressed',String(p.sound));$('#comfort-button').textContent=`Gentle mode: ${p.gentle?'on':'off'}`;$('#comfort-button').setAttribute('aria-pressed',String(p.gentle));$('#quality-button').textContent=`Graphics: ${p.quality}`;}
function mapOpen(){if(view.overview){view.overview=false;$('#map-button').innerHTML='◎ <span>World</span>';return;}drawMap();openDialog('#map-dialog');}
function drawMap(){
  const c=$('#map'),ctx=c.getContext('2d'),w=c.width,h=c.height,scale=4.7,cx=w/2,cy=h/2;
  ctx.fillStyle='#244f58';ctx.fillRect(0,0,w,h);
  for(let y=0;y<h;y+=4)for(let x=0;x<w;x+=4){const wx=(x-cx)/scale,wz=(y-cy)/scale,height=landHeight(wx,wz);if(height<0)continue;ctx.fillStyle=height<.8?'#bfb58d':height>2.7?'#68846a':'#7e966c';ctx.fillRect(x,y,4,4);}
  const point=(x,z)=>[cx+x*scale,cy+z*scale];
  ctx.lineWidth=9;ctx.strokeStyle='#d3be90';ctx.lineCap='round';for(const road of ROADS){ctx.beginPath();road.forEach(([x,z],i)=>{const p=point(x,z);i?ctx.lineTo(...p):ctx.moveTo(...p);});ctx.stroke();}
  for(const house of HOUSES){const [x,y]=point(house.x,house.z);ctx.fillStyle='#b9825c';ctx.fillRect(x-house.w*2,y-house.d*2,house.w*4,house.d*4);}
  ctx.textAlign='center';ctx.font='14px Georgia';ctx.fillStyle='#eef0d1';ctx.fillText('N',w/2,20);ctx.font='12px system-ui';ctx.fillStyle='#c4d6c5';ctx.fillText('THE QUIET SEA',w/2,545);
  for(const l of LANDMARKS){if(!['beacon','boss','camp'].includes(l.type))continue;const [x,y]=point(l.x,l.z),lit=game.progress.beacons.includes(l.id);ctx.fillStyle=lit?'#ffe7a0':l.type==='boss'?'#d5927b':'#edf0d1';ctx.font='22px Georgia';ctx.fillText(l.type==='boss'?'✦':l.type==='camp'?'⌂':'◆',x,y+6);ctx.font='13px Georgia';ctx.fillText(l.area,x,y+(l.type==='camp'?24:-17));if(lit){ctx.font='10px system-ui';ctx.fillText('LIT',x,y+21);}}
  const target=game.quest().target;if(target){const [x,y]=point(target.x,target.z);ctx.beginPath();ctx.arc(x,y,15,0,Math.PI*2);ctx.strokeStyle='#ffe097';ctx.lineWidth=2;ctx.stroke();}
  const [px,py]=point(game.player.x,game.player.z);ctx.beginPath();ctx.arc(px,py,7,0,Math.PI*2);ctx.fillStyle='#fff8de';ctx.fill();ctx.strokeStyle='#143b43';ctx.lineWidth=3;ctx.stroke();
  $('#map-quest').textContent=game.quest().detail;
}
function mixOpen(){
  const list=$('#art-list');list.replaceChildren();
  for(const [id,a]of Object.entries(ARTS)){const b=document.createElement('button');b.className='art'+(game.player.art===id?' chosen':'');b.disabled=!game.progress.unlocked.includes(a.form);const strong=document.createElement('strong');strong.textContent=a.name+(game.player.art===id?' · equipped':'');const desc=document.createElement('span');desc.textContent=b.disabled?`Discover ${FORMS[a.form].name} to borrow this art.`:a.description;b.append(strong,desc);b.onclick=()=>{game.setArt(id);save();closeDialogs();toast(`${a.name} borrowed. Keep it in any form.`);};list.append(b);}openDialog('#mix-dialog');
}
function cycleForm(delta){const unlocked=game.progress.unlocked,i=unlocked.indexOf(game.player.form);game.setForm(unlocked[(i+delta+unlocked.length)%unlocked.length]);}
function wire(){
  $('#start').onclick=start;$('#continue').onclick=nextSpeech;
  for(const b of $$('[data-close]'))b.onclick=closeDialogs;
  $('#pause-button').onclick=()=>{updateMenu();openDialog('#menu');};$('#resume').onclick=closeDialogs;
  $('#map-button').onclick=mapOpen;$('#journal-button').onclick=mapOpen;$('#mix-button').onclick=mixOpen;
  $('#globe-button').onclick=()=>{closeDialogs();view.overview=true;$('#map-button').innerHTML='↙ <span>Return</span>';toast('The whole of Greenfield. Tap Return to keep exploring.',5);};
  $('#sound-button').onclick=()=>{game.progress.sound=!game.progress.sound;initAudio();if(master)master.gain.value=game.progress.sound?.13:0;updateMenu();save();};
  $('#quality-button').onclick=()=>{const modes=['balanced','low','high'];game.progress.quality=modes[(modes.indexOf(game.progress.quality)+1)%modes.length];view.setQuality(game.progress.quality);updateMenu();save();};
  $('#comfort-button').onclick=()=>{game.progress.gentle=!game.progress.gentle;updateMenu();save();};
  $('#restart').onclick=()=>openDialog('#reset-dialog');$('#confirm-reset').onclick=()=>{const p=freshProgress();p.sound=game.progress.sound;p.quality=game.progress.quality;p.gentle=game.progress.gentle;game=new Game(p);view.game=game;closeDialogs();lastRegion='';save();toast('A fresh start. Somebody should tell the Mayor.');};
  for(const b of $$('[data-form]'))b.onclick=()=>{if(!paused())game.setForm(b.dataset.form);};
  $('#interact').onclick=()=>{if(!paused())game.interact();};
  for(const [id,action]of [['attack','attack'],['special','special'],['dodge','dodge']]){
    const b=$('#'+id);b.addEventListener('pointerdown',e=>{e.preventDefault();initAudio();b.setPointerCapture(e.pointerId);if(paused())return;if(action==='attack')heldAttack=true;if(action==='special')heldSpecial=true;game[action]();});
    const stop=()=>{if(action==='attack')heldAttack=false;if(action==='special')heldSpecial=false;};b.addEventListener('pointerup',stop);b.addEventListener('pointercancel',stop);b.addEventListener('lostpointercapture',stop);
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
    if(e.code==='Escape'){if(view.overview){view.overview=false;$('#map-button').innerHTML='◎ <span>World</span>';}else if(!$('dialog[open]')&&started){updateMenu();openDialog('#menu');}return;}
    if($('dialog[open]')){if(e.code==='KeyE'&&$('#dialogue').open){e.preventDefault();nextSpeech();}return;}
    if(!started){if(e.code==='Enter'||e.code==='Space'){e.preventDefault();start();}return;}
    keys.add(e.code);if(e.repeat)return;initAudio();
    if(e.code==='KeyM'){mapOpen();return;}if(e.code==='KeyI'){mixOpen();return;}if(paused())return;
    if(e.code==='KeyE')game.interact();if(e.code==='Space')game.dodge();if(e.code==='KeyQ')cycleForm(1);if(e.code==='Digit1')game.setForm('nobody');if(e.code==='Digit2')game.setForm('rat');if(e.code==='Digit3')game.setForm('knight');
  });window.addEventListener('keyup',e=>keys.delete(e.code));
  window.addEventListener('blur',()=>{keys.clear();heldAttack=false;heldSpecial=false;joy={x:0,z:0};stick.firstElementChild.style.transform='';});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();heldAttack=false;heldSpecial=false;joy={x:0,z:0};save();}});
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
      if(buttons[0]||buttons[7])game.attack();if(buttons[2])game.special();if(edge(1))game.dodge();if(edge(3))game.interact();if(edge(4))cycleForm(-1);if(edge(5))cycleForm(1);view.yaw-=ax(2)*dt*1.8;view.zoom=clamp(view.zoom+ax(3)*dt*.5,.7,1.65);
    }
  }
  wasPad=Object.assign({},buttons,{up:ax(1)<-.6,down:ax(1)>.6});
  return {x:ax(0)+(buttons[15]?1:0)-(buttons[14]?1:0),z:ax(1)+(buttons[13]?1:0)-(buttons[12]?1:0)};
}
function events(){
  const list=game.events.splice(0);
  for(const e of list){sound(e.type);
    if(e.type==='save')save();
    if(e.type==='toast')toast(e.text);
    if(e.type==='dialogue')speak(e.speaker,e.lines);
    if(e.type==='shift'){toast(`${FORMS[e.form].name} · ${e.form==='rat'?'Small, quick, and absolutely covered in germs.':e.form==='knight'?'A little courage. A very large sword.':'A little blank someone with a big future.'}`,2);save();}
    if(e.type==='unlock'){toast(`${FORMS[e.form].name} discovered! Choose your new form below.`,5);toast(`You can also borrow ${e.form==='rat'?'Fester':'Shield sweep'} in any form.`,4);}
    if(e.type==='beacon')toast(`${game.progress.beacons.length} of 3 lanterns lit. A promise remembered.`,3);
    if(e.type==='awaken')toast('The Unfinished Warden has awakened. Follow the north road.',5);
    if(e.type==='respawn')toast('A breather, not the end. Back at camp with your discoveries safe.',5);
    if(e.type==='treasure')toast(`A wayfarer’s keepsake! ${e.count} of 3 secrets found. Hearts restored.`,4);
    if(e.type==='victory'){toast('A promise kept. The Warden rests. Tell Mayor Maybe!',6);}
  }
}
function ui(now){
  const p=game.player,f=FORMS[p.form],q=game.quest();$('#form-name').textContent=f.name;$('#health').style.width=`${Math.max(0,p.hp/f.hp*100)}%`;$('#health-label').textContent=`${Math.ceil(p.hp)} / ${f.hp}`;
  $('#quest-title').textContent=q.title;$('#quest-detail').textContent=q.detail;$('#quest-count').textContent=q.count;$('#attack-name').textContent=f.attack;$('#special-name').textContent=ARTS[p.art].name;
  $('#attack i').style.transform=`scaleY(${p.attack/f.cooldown})`;$('#special i').style.transform=`scaleY(${p.special/ARTS[p.art].cooldown})`;$('#dodge').style.opacity=p.dodge>0?'.5':'1';
  for(const b of $$('[data-form]')){b.disabled=!game.progress.unlocked.includes(b.dataset.form);b.classList.toggle('selected',b.dataset.form===p.form);b.setAttribute('aria-pressed',String(b.dataset.form===p.form));}
  $('#rat-hint').textContent=game.progress.unlocked.includes('rat')?'THE QUICK THINKER':'DEFEAT 3 FOES';$('#knight-hint').textContent=game.progress.unlocked.includes('knight')?'THE BRAVE HEART':'LIGHT THE HOLLOW';
  const near=!paused()?game.nearby():null;$('#interact').classList.toggle('hidden',!near);if(near){$('#interact-label').textContent=near.name;$('#interact .key').textContent=padPresent?'Y':'E';}
  const boss=game.enemies.find(e=>e.type==='warden');const showBoss=boss.alive&&game.progress.beacons.length===3&&distance(boss,p)<24;$('#boss').classList.toggle('hidden',!showBoss);$('#boss-health').style.width=`${Math.max(0,boss.hp/ENEMIES.warden.hp*100)}%`;
  const area=region(p.x,p.z);if(started&&area!==lastRegion){lastRegion=area;$('#area h2').textContent=area;areaUntil=now+3.5;}$('#area').classList.toggle('show',now<areaUntil&&!view.overview);
  if(now>toastUntil&&toastQueue.length){const t=toastQueue.shift();$('#toast').textContent=t.text;toastUntil=now+t.duration;}$('#toast').classList.toggle('show',now<toastUntil);
  if(padPresent)$('#desktop-hint').textContent='Left stick move · A attack · X art · B dodge · Y interact · LB / RB form';
}
try{
  view=new WorldView($('#world'),game);wire();window.nq3dReady=true;$('#loading').classList.add('hidden');$('#welcome').classList.remove('hidden');$('#start').textContent=game.progress.metMayor?'Continue exploring ↗':'Enter Greenfield ↗';
  let last=performance.now();function frame(now){const dt=Math.min((now-last)/1000,.05);last=now;const pad=gamepad(dt);
    if(!paused()){
      const x=joy.x+pad.x+(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0),z=joy.z+pad.z+(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0);
      if(heldAttack||keys.has('KeyJ'))game.attack();if(heldSpecial||keys.has('KeyK'))game.special();game.update(dt,view.orientCameraMove(x,z));music(dt);if(game.time-lastSaved>10)save();
    }
    events();view.update(dt);if(now-lastUI>80){ui(now/1000);lastUI=now;}requestAnimationFrame(frame);
  }requestAnimationFrame(frame);
}catch(error){console.error(error);$('#loading').classList.add('hidden');$('#error').classList.remove('hidden');$('#error-text').textContent='This device could not start the 3D world. Try a current browser with graphics acceleration, or enjoy the original game below.';}
