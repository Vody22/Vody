// ===== INTERFACE PC / MOBILE (ui4.js) : aide des touches qui se masque toute seule, barre contextuelle cachée pendant les dialogues =====
// PC : l'aide (#help) reste 60 s à la première partie puis se masque (H ou Options pour la revoir) ; le choix est retenu (localStorage sf-help).
const UI4={t0:performance.now(),auto:0,first:(()=>{try{return localStorage.getItem('sf-help')==null}catch(e){return false}})()};
try{if(DESK&&localStorage.getItem('sf-help')==='0')document.body.classList.add('nohelp')}catch(e){}
let ui4H=document.body.classList.contains('nohelp');new MutationObserver(()=>{if(!DESK)return;const h=document.body.classList.contains('nohelp');if(h===ui4H)return;ui4H=h;try{localStorage.setItem('sf-help',h?'0':'1')}catch(e){}}).observe(document.body,{attributes:true,attributeFilter:['class']});
TICK.push(()=>{document.body.classList.toggle('dlgOn',!!DLG.open);
if(DESK&&UI4.first&&!UI4.auto&&performance.now()-UI4.t0>60e3){UI4.auto=1;if(!document.body.classList.contains('nohelp')){document.body.classList.add('nohelp');toast('⌨ Aide des touches masquée — appuie sur H pour la revoir')}}});

// ----- PC : curseur libre (Tab) pour cliquer sur les boutons sans piloter ; la souris ne pilote pas non plus quand elle survole un bouton ou un panneau -----
UI4.free=false;UI4.over=false;
document.body.insertAdjacentHTML('beforeend','<div id="free4">'+ICO('target')+' Curseur libre — <kbd>Tab</kbd> pour reprendre le pilotage</div>');
function ui4Free(on){if(!DESK)return;UI4.free=on==null?!UI4.free:!!on;document.body.classList.toggle('free4',UI4.free);MS.in=false;MS.fire=0;MS.boost=0;try{if(UI4.free&&document.pointerLockElement)document.exitPointerLock()}catch(e){}}
addEventListener('keydown',e=>{if(!DESK||e.code!='Tab'||e.repeat)return;const tg=e.target&&e.target.tagName;if(tg=='INPUT'||tg=='TEXTAREA')return;e.preventDefault();if(mode=='space'||mode=='surf')ui4Free()},true);
// survol d'un élément d'interface : la souris arrête de diriger le vaisseau
document.addEventListener('pointerover',e=>{if(e.pointerType!='mouse')return;UI4.over=e.target!==OV&&e.target.id!=='c'},true);
// en curseur libre, un clic dans le décor ne tire pas
OV.addEventListener('pointerdown',e=>{if(UI4.free&&e.pointerType=='mouse'&&!FOOT.on&&mode!='int'){e.stopImmediatePropagation();MS.fire=0;MS.boost=0}},true);
TICK.push(()=>{if(!DESK)return;if(UI4.free&&(FOOT.on||mode=='int'||S.dead))ui4Free(false);const flying=(mode=='space'||mode=='surf')&&!FOOT.on;if(flying&&(UI4.free||UI4.over)){MS.in=false;if(UI4.free){MS.fire=0;MS.boost=0}}});

// la souris ne doit jamais diriger en curseur libre : on bloque l'événement avant mouseAim et on neutralise steerInput
OV.addEventListener('pointermove',e=>{if(UI4.free&&e.pointerType=='mouse'&&!FOOT.on&&mode!='int'){e.stopImmediatePropagation();MS.in=false}},true);
{const _si=steerInput;steerInput=function(){if(DESK&&(UI4.free||UI4.over)&&!FOOT.on&&mode!='int')MS.in=false;return _si.apply(this,arguments)}}
