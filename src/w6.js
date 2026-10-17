// ----- Manette des gaz (w6.js) : la vitesse ne change plus toute seule -----
// THR6 (core.js) : man = pilotage manuel (par défaut), v = position de la manette 0–1 (× vitesse de croisière).
// PC : W/Z accélère, S ralentit (maintenus), B/Ctrl = frein (coupe les gaz), Maj = boost. Mobile : glissière #thr6, bouton Frein = coupe les gaz.
// Manette de jeu : stick droit vertical. Options → « Pilotage » : Manuel / Automatique (ancien comportement).
document.body.insertAdjacentHTML('beforeend','<div id="thr6"><i></i><b></b><small>GAZ</small><em></em><u>m/s</u></div>');
const THR6E={el:$('thr6'),drag:null,lm:'',wasDock:false,mode:mode,t0:performance.now(),hint:0};
function thr6Set(v){THR6.v=clamp(v,0,1)}
function thr6FromY(y){const r=THR6E.el.getBoundingClientRect();thr6Set(1-(y-r.top-18)/Math.max(1,r.height-26))}
THR6E.el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();THR6E.drag=e.pointerId;try{THR6E.el.setPointerCapture(e.pointerId)}catch(_){}thr6FromY(e.clientY)});
THR6E.el.addEventListener('pointermove',e=>{if(THR6E.drag===e.pointerId){e.preventDefault();thr6FromY(e.clientY)}});
for(const ev of['pointerup','pointercancel','lostpointercapture'])THR6E.el.addEventListener(ev,e=>{if(THR6E.drag===e.pointerId)THR6E.drag=null});
function thr6Show(){return THR6.man&&(mode=='space'||mode=='surf')&&!FOOT.on&&!S.docked&&!S.dead&&!S.entry&&!S.ascent&&!MAP.open&&!(typeof SI!='undefined'&&SI.on)&&!window.XPAUSE}
function thr6Gp(){try{if(!GPD.id||!navigator.getGamepads)return 0;const gp=[...navigator.getGamepads()].find(g=>g&&g.connected);if(!gp)return 0;const v=gp.axes[3]||0;return Math.abs(v)<.18?0:-v}catch(e){return 0}}
TICK.push(()=>{const t=performance.now(),dt=Math.min(.1,(t-THR6E.t0)/1000);THR6E.t0=t;
// amarrage : manette à zéro ; départ d'une station : 40 % ; décollage d'une planète : au moins 50 %
if(S.docked){THR6.v=0;THR6E.wasDock=true}else if(THR6E.wasDock){THR6E.wasDock=false;THR6.v=.4}
if(THR6E.mode!=mode){if(THR6E.mode=='surf'&&mode=='space')THR6.v=Math.max(THR6.v,.5);THR6E.mode=mode}
if(THR6.man&&!isPaused()&&!FOOT.on&&!S.docked&&(mode=='space'||mode=='surf')&&!(typeof SI!='undefined'&&SI.on)){
 const typing=document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName);
 if(!typing&&DESK){if(K.KeyW)thr6Set(THR6.v+.7*dt);if(K.KeyS)thr6Set(THR6.v-.7*dt)}
 if(isBrake())thr6Set(THR6.v-1.6*dt);
 const g=thr6Gp();if(g)thr6Set(THR6.v+g*.9*dt);
 if(!THR6E.hint&&!G.x.thr6h&&mode=='space'&&t>9000){THR6E.hint=1;G.x.thr6h=1;banner('🕹️','Manette des gaz',DESK?'W/Z pour accélérer, S pour ralentir, B pour freiner — le vaisseau garde la vitesse choisie.':'Glisse la jauge GAZ pour régler la vitesse, Frein pour couper les gaz.','#ffc34d')}}
const sh=thr6Show()&&!DLG.open;window.THR6VIS=sh&&!ckActive();THR6E.el.style.display=sh?'':'none';if(!sh)return;
const pc=Math.round(THR6.v*100),bo=isBoost(),sp=Math.round(S.spd),key=pc+'|'+bo+'|'+sp;if(key!==THR6E.lm){THR6E.lm=key;THR6E.el.style.setProperty('--v',THR6.v.toFixed(3));THR6E.el.querySelector('b').textContent=bo?'BOOST':pc+'%';THR6E.el.classList.toggle('bo',bo);THR6E.el.querySelector('em').textContent=sp;THR6E.el.classList.toggle('z',pc==0)}});
// Option : pilotage manuel / automatique
function thr6Toggle(){THR6.man=!THR6.man;try{localStorage.setItem('sf-thr',THR6.man?'man':'auto')}catch(e){}if(THR6.man)THR6.v=clamp(S.spd/Math.max(1,cruise()),0,1);thr6Btn();toast(THR6.man?'🕹️ Pilotage manuel : tu règles la vitesse avec la manette des gaz':'🕹️ Pilotage automatique : vitesse de croisière constante')}
function thr6Btn(){const b=$('thr6b');if(b)b.textContent=THR6.man?'Manuel (gaz)':'Automatique'}
{const b=$('thr6b');if(b){b.onclick=thr6Toggle;thr6Btn()}}
