// ===== INTERFACE PC / MOBILE (ui4.js) : aide des touches qui se masque toute seule, barre contextuelle cachée pendant les dialogues =====
// PC : l'aide (#help) reste 60 s à la première partie puis se masque (H ou Options pour la revoir) ; le choix est retenu (localStorage sf-help).
const UI4={t0:performance.now(),auto:0,first:(()=>{try{return localStorage.getItem('sf-help')==null}catch(e){return false}})()};
try{if(DESK&&localStorage.getItem('sf-help')==='0')document.body.classList.add('nohelp')}catch(e){}
let ui4H=document.body.classList.contains('nohelp');new MutationObserver(()=>{if(!DESK)return;const h=document.body.classList.contains('nohelp');if(h===ui4H)return;ui4H=h;try{localStorage.setItem('sf-help',h?'0':'1')}catch(e){}}).observe(document.body,{attributes:true,attributeFilter:['class']});
TICK.push(()=>{document.body.classList.toggle('dlgOn',!!DLG.open);
if(DESK&&UI4.first&&!UI4.auto&&performance.now()-UI4.t0>60e3){UI4.auto=1;if(!document.body.classList.contains('nohelp')){document.body.classList.add('nohelp');toast('⌨ Aide des touches masquée — appuie sur H pour la revoir')}}});
