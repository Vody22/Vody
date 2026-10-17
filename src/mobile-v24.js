/* Mobile cockpit: two-thumb controls and an expandable shortcut menu. */
const STARFARER_MOBILE=(()=>{
  'use strict';
  if(DESK)return Object.freeze({enabled:false,version:'2.8'});
  const body=document.body;body.classList.add('sf-mobile');
  const note=document.querySelector('.sf2-key-note');if(note)note.textContent='Joystick à gauche · Actions à droite · Menu : carte, activités et options';
  const joystick=document.createElement('div');joystick.id='m24-stick';joystick.setAttribute('aria-label','Joystick de déplacement');
  joystick.innerHTML='<span>DIRECTION</span><i></i><b></b>';
  const speed=document.createElement('label');speed.id='m24-speed';speed.innerHTML='<span>GAZ <b id="m24-percent">0 %</b><small id="m24-velocity">0 m/s</small></span><input id="m24-throttle" type="range" min="0" max="100" step="1" value="0" aria-label="Gaz du vaisseau">';
  const menu=document.createElement('button');menu.id='m24-menu';menu.innerHTML=ICO('gear')+'<span>Menu</span>';menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-controls','sf3-toolbar');
  const back=document.createElement('button');back.id='m24-back';back.hidden=true;back.setAttribute('aria-label','Fermer les raccourcis');
  body.append(joystick,speed,back,menu);
  let opened=false,allowed=false,dragSpeed=false;
  function release(){stick=null;dragSpeed=false;THR6E.drag=null;for(const k of ['fire','boost','brake']){B[k]=0;$(k).classList.remove('on');}MS.fire=MS.boost=0;joystick.classList.remove('active');joystick.querySelector('b').style.transform='translate(-50%,-50%)';}
  function toggle(on){
    on=on==null?!opened:!!on;if(on===opened)return;
    release();opened=on;window.SFMobilePause=on;body.classList.toggle('m24-menu-open',on);back.hidden=!on;menu.setAttribute('aria-expanded',String(on));menu.querySelector('span').textContent=on?'Fermer':'Menu';
    if(on)$('mapb').focus();else menu.focus();sync();
  }
  menu.onclick=()=>toggle();back.onclick=()=>toggle(false);
  $('sf3-toolbar').addEventListener('click',e=>{if(e.target.closest('button'))toggle(false);},true);
  addEventListener('keydown',e=>{if(e.code==='Escape'&&opened){e.preventDefault();toggle(false);}});
  function playable(){return !MENU3.on&&!PH.on&&!MAP.open&&!S.dead&&!isPaused()&&!body.classList.contains('sf3-panel-open')&&!SI.on&&!GZ.on&&!S.entry&&!S.ascent&&!(WK3.on&&WK3.menu)&&(!S.docked||WK3.on||FOOT.on);}
  function move(e){if(!allowed||!stick||stick.id!==e.pointerId||!stick.mobile24)return;const r=joystick.getBoundingClientRect(),R=r.width*.32,dx=e.clientX-stick.ox,dy=e.clientY-stick.oy,l=Math.hypot(dx,dy),k=l>R?R/l:1;
    stick.x=dx*k/R;stick.y=dy*k/R;stick.R=R;joystick.querySelector('b').style.transform=`translate(calc(-50% + ${dx*k}px),calc(-50% + ${dy*k}px))`;
  }
  joystick.addEventListener('pointerdown',e=>{if(!allowed||stick)return;e.preventDefault();const r=joystick.getBoundingClientRect();stick={id:e.pointerId,ox:r.x+r.width/2,oy:r.y+r.height/2,x:0,y:0,mobile24:true};try{joystick.setPointerCapture(e.pointerId);}catch(_){}joystick.classList.add('active');move(e);});
  joystick.addEventListener('pointermove',move);
  for(const name of ['pointerup','pointercancel','lostpointercapture'])joystick.addEventListener(name,e=>{if(stick?.mobile24&&stick.id===e.pointerId){stick=null;joystick.classList.remove('active');joystick.querySelector('b').style.transform='translate(-50%,-50%)';}});
  OV.addEventListener('pointerdown',e=>{if(!allowed){e.stopImmediatePropagation();e.preventDefault();}},true);
  const slider=$('m24-throttle');slider.addEventListener('input',()=>{if(allowed&&THR6.man){thr6Set(+slider.value/100);$('m24-percent').textContent=slider.value+' %';}});
  slider.addEventListener('pointerdown',()=>dragSpeed=true);for(const ev of ['pointerup','pointercancel','lostpointercapture'])slider.addEventListener(ev,()=>dragSpeed=false);
  addEventListener('blur',release);addEventListener('resize',()=>{release();dragSpeed=false;});
  document.addEventListener('visibilitychange',()=>{release();if(document.hidden)toggle(false);});
  function sync(){
    const next=playable();if(allowed&&!next)release();allowed=next;
    body.classList.toggle('m24-controls-off',!allowed);joystick.hidden=!allowed;speed.hidden=!allowed||!THR6.man||FOOT.on||WK3.on||!['space','surf'].includes(mode);
    body.classList.toggle('m24-alert',!$('sf2-alert').hidden);
    const modal=body.classList.contains('sf3-panel-open')||window.SF2PAUSE;
    menu.hidden=MENU3.on||PH.on||MAP.open||S.dead||(!opened&&(modal||DLG.open));
    if(opened&&(MENU3.on||PH.on||MAP.open||S.dead||modal))toggle(false);
    if(!dragSpeed)slider.value=Math.round(THR6.v*100);$('m24-percent').textContent=Math.round(THR6.v*100)+' %';$('m24-velocity').textContent=Math.round(S.spd)+' m/s';
    for(const id of ['dodge','flare'])$(id).setAttribute('aria-label',id==='dodge'?'Esquive'+(CBT.rollCd>0?' en recharge':''):'Leurres'+(CBT.flCd>0?' en recharge':''));
  }
  let elapsed=0;TICK.push(dt=>{elapsed+=dt;if(elapsed>=.08){elapsed=0;sync();}});sync();
  return Object.freeze({enabled:true,version:'2.8',toggle,sync,release});
})();
