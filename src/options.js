// ===== OPTIONS : qualité, son (musique / effets), sensibilité, manette, sauvegarde dans le cloud =====
const OPT={mus:.8,sfx:.8,sens:1};try{const o=JSON.parse(localStorage.getItem('sf-opt')||'{}');Object.assign(OPT,o)}catch(e){}
const optSave=()=>{try{localStorage.setItem('sf-opt',JSON.stringify(OPT))}catch(e){}};
// ----- son : la musique a son propre volume -----
let MVOL=null;const getMV=()=>{if(!MVOL&&AC){MVOL=AC.createGain();MVOL.connect(AC.destination);applyVol()}return MVOL};
function applyVol(){if(master)master.gain.value=muted?0:.62*OPT.sfx;if(MVOL)MVOL.gain.value=muted?0:.62*OPT.mus}
music=function(){const prog=[[220,261.6,329.6],[174.6,220,261.6],[196,246.9,293.7],[164.8,207.7,246.9]];let i=0;const mg=AC.createGain();mg.gain.value=.05;mg.connect(getMV());
const play=()=>{const ch=prog[i++%4];if(muted||AC.state!='running')return;const n=AC.currentTime;ch.forEach(f=>[1,.5].forEach(m=>{const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=f*m;o.detune.value=(Math.random()-.5)*12;g.gain.setValueAtTime(0,n);g.gain.linearRampToValueAtTime(.5,n+2.5);g.gain.linearRampToValueAtTime(0,n+8.6);o.connect(g);g.connect(mg);o.start(n);o.stop(n+9)}));
for(let k=0;k<4;k++){const f=ch[Math.random()*3|0]*(Math.random()<.5?2:4),o=AC.createOscillator(),g=AC.createGain(),s=n+1+k*1.7+Math.random()*.5;o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(.22,s+.02);g.gain.exponentialRampToValueAtTime(.001,s+1.5);o.connect(g);g.connect(mg);o.start(s);o.stop(s+1.6)}};play();setInterval(play,8000)};
musInit=function(){if(MUS.on||!AC)return;MUS.on=true;MUS.bus=AC.createGain();MUS.bus.gain.value=0;MUS.bus.connect(getMV());MUS.next=AC.currentTime+.1;setInterval(musTick,25)};
// ----- sensibilité + manette dans le pilotage -----
{const _si=steerInput;steerInput=function(){const r=_si();return[clamp(r[0]*OPT.sens,-1,1),clamp(r[1]*OPT.sens,-1,1)]}}
// ----- panneau Options -----
const OPTP={open:false};const QNM=['Haute','Équilibrée','Économie'];
function optToggle(v){OPTP.open=v==null?!OPTP.open:v;$('opts').style.display=OPTP.open?'flex':'none';$('optb').classList.toggle('on',OPTP.open);if(OPTP.open){if(typeof profToggle=='function'&&PROF.open)profToggle(false);optRender()}}
function optRender(){$('snd').textContent=muted?'Coupé':'Activé';$('snd').classList.toggle('on',!muted);$('inv').textContent=inv?'Oui':'Non';$('inv').classList.toggle('on',inv);$('ockb').textContent=COCKPIT?'Cockpit':'Extérieure';
$('ohelp').textContent=document.body.classList.contains('nohelp')?'Masquée':'Affichée';$('qbtn').textContent=DESK?QN[QI]:QNM[GQL];$('vmus').value=Math.round(OPT.mus*100);$('vsfx').value=Math.round(OPT.sfx*100);$('sens').value=Math.round(OPT.sens*100);
$('gpst').textContent=GPD.id?'Connectée':'Non détectée';$('ccode').textContent=CLOUD.code;$('cstat').textContent=CLOUD.msg||''}
$('optb').onclick=()=>optToggle();$('optx').onclick=()=>optToggle(false);
$('snd').onclick=()=>{muted=!muted;applyVol();optRender()};
$('inv').onclick=()=>{inv=!inv;try{localStorage.setItem('sf-inv',inv?'1':'0')}catch(e){}optRender()};
$('ockb').onclick=()=>{ckToggle();optRender()};$('ohelp').onclick=()=>{document.body.classList.toggle('nohelp');optRender()};
$('qbtn').onclick=()=>{if(DESK){cycleQuality()}else{GQL=(GQL+1)%3;try{localStorage.setItem('sf-gq',GQL)}catch(e){}R3.setPixelRatio(Math.min(devicePixelRatio||1,[1.6,1.3,1][GQL]));resize();toast('Qualité : '+QNM[GQL]+(mode=='surf'?' (complète au prochain atterrissage)':''))}optRender()};
$('vmus').oninput=e=>{OPT.mus=e.target.value/100;applyVol();optSave()};$('vsfx').oninput=e=>{OPT.sfx=e.target.value/100;applyVol();optSave()};$('sens').oninput=e=>{OPT.sens=e.target.value/100;optSave()};
if(!DESK)R3.setPixelRatio(Math.min(devicePixelRatio||1,[1.6,1.3,1][GQL]));
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT'||e.repeat)return;if(e.code=='KeyO')optToggle();if(e.code=='Escape'){optToggle(false);if(PROF.open)profToggle(false);$('bpanel').style.display='none';$('trpanel').style.display='none'}});
// ----- manette (Xbox, PlayStation…) -----
const GPD={id:null,prev:[],toastT:0};
addEventListener('gamepadconnected',e=>{GPD.id=e.gamepad.id;toast('🎮 Manette connectée : gâchette droite pour tirer, A pour le boost, B pour l\'action');if(OPTP.open)optRender()});
addEventListener('gamepaddisconnected',()=>{GPD.id=null;if(stick&&stick.gp)stick=null;for(const k of['fire','boost','brake'])B[k]=0;if(OPTP.open)optRender()});
function updGamepad(dt){if(!GPD.id||!navigator.getGamepads)return;const gp=[...navigator.getGamepads()].find(g=>g&&g.connected);if(!gp)return;const ax=i=>{const v=gp.axes[i]||0;return Math.abs(v)<.14?0:v},btn=i=>{const b=gp.buttons[i];return!!b&&(b.pressed||b.value>.35)};
const lx=ax(0),ly=ax(1);if(!stick||stick.gp){if(lx||ly)stick={id:'gp',gp:1,ox:-999,oy:-999,x:clamp(lx,-1,1),y:clamp(ly,-1,1),R:70};else if(stick&&stick.gp)stick=null}
if(FOOT.on||mode=='int'){const rx=ax(2),ry=ax(3);if(rx||ry){FOOT.cy-=rx*dt*2.6;FOOT.cp=clamp(FOOT.cp+ry*dt*1.8,-.6,1);FOOT.lastLook=t}}
const now=gp.buttons.map((b,i)=>btn(i)),was=GPD.prev,edge=i=>now[i]&&!was[i],rel=i=>!now[i]&&was[i];
for(const[i,k]of[[7,'fire'],[0,'boost'],[6,'brake']]){if(edge(i)){B[k]=1;$(k).classList.add('on')}if(rel(i)){B[k]=0;$(k).classList.remove('on')}}
if(edge(1)){const l=$('land');if(l&&l.style.display!='none')l.click()}if(edge(2)||edge(5))cycleW(1);if(edge(4))cycleW(-1);if(edge(3))ckToggle();
if(edge(9)){if(MAP.open)closeMap();else openMap()}if(edge(8))optToggle();if(edge(12))profToggle();if(edge(13)&&mode=='surf'&&!FOOT.on&&canExit())footEnter();GPD.prev=now}
// ----- sauvegarde dans le cloud (code personnel) -----
const CLOUD={code:'',last:'',msg:'',busy:false,ok:location.protocol.startsWith('http')&&!/claude|localhost|127\.0\.0\.1/.test(location.hostname)};
{const AL='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';try{CLOUD.code=localStorage.getItem('sf-cloud')||''}catch(e){}if(!/^SF-[A-HJ-NP-Z2-9]{8}$/.test(CLOUD.code)){CLOUD.code='SF-'+Array.from({length:8},()=>AL[Math.random()*AL.length|0]).join('');try{localStorage.setItem('sf-cloud',CLOUD.code)}catch(e){}}}
const cloudURL=c=>'/api/save?code='+encodeURIComponent(c);
async function cloudSave(manual){if(!CLOUD.ok){if(manual){CLOUD.msg='La sauvegarde cloud n\'est disponible que sur starvody.netlify.app';optRender()}return}if(CLOUD.busy)return;save();let data='';try{data=localStorage.getItem(SK)||''}catch(e){}if(!data)return;if(!manual&&data===CLOUD.last)return;
CLOUD.busy=true;try{const r=await fetch(cloudURL(CLOUD.code),{method:'POST',headers:{'content-type':'application/json'},body:data});if(!r.ok)throw new Error(r.status);CLOUD.last=data;CLOUD.msg='Sauvegardé en ligne à '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});if(manual){toast('☁️ Partie sauvegardée en ligne');SFX.coin()}}
catch(e){CLOUD.msg='Sauvegarde en ligne impossible pour l\'instant (connexion ?)';if(manual)toast('☁️ Sauvegarde en ligne impossible pour l\'instant')}CLOUD.busy=false;if(OPTP.open)optRender()}
async function cloudLoad(){const c=(prompt('Tape ton code de sauvegarde (ex. SF-ABCD2345) :','')||'').trim().toUpperCase();if(!c)return;if(!/^SF-[A-HJ-NP-Z2-9]{8}$/.test(c)){toast('Code invalide');return}
try{const r=await fetch(cloudURL(c));if(!r.ok)throw new Error(r.status);const txt=await r.text();if(!txt||txt=='null'){toast('Aucune partie trouvée avec ce code');return}JSON.parse(txt);if(!confirm('Remplacer la partie de cet appareil par celle du code '+c+' ?'))return;
localStorage.setItem(SK,txt);localStorage.setItem('sf-cloud',c);CLOUD.ok=false;toast('☁️ Partie chargée — redémarrage…');setTimeout(()=>location.reload(),900)}catch(e){toast('Chargement impossible pour l\'instant')}}
$('csave').onclick=()=>cloudSave(true);$('cload').onclick=cloudLoad;$('ccopy').onclick=async()=>{try{await navigator.clipboard.writeText(CLOUD.code);toast('Code copié : '+CLOUD.code)}catch(e){prompt('Ton code de sauvegarde :',CLOUD.code)}};
setInterval(()=>{if(!document.hidden&&!S.dead)cloudSave(false)},180000);setTimeout(()=>cloudSave(false),20000);
addEventListener('pagehide',()=>{if(!CLOUD.ok)return;try{const d=localStorage.getItem(SK);if(d&&d!==CLOUD.last&&navigator.sendBeacon)navigator.sendBeacon(cloudURL(CLOUD.code),new Blob([d],{type:'application/json'}))}catch(e){}});
// ----- boucle -----
{const _up=updParts;updParts=function(dt){_up(dt);try{updGamepad(dt)}catch(e){}}}
