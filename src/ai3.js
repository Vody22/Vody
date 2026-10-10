// ===== IA DES ENNEMIS : ils ne t'attaquent plus sans raison =====
// Les pirates rencontrés au hasard patrouillent ; ils ne t'attaquent que si tu t'approches trop de leur zone (après un avertissement),
// si tu leur tires dessus (tout le groupe riposte), ou en zone très dangereuse. Aucun pirate au hasard en zone sûre.
// Ils abandonnent la poursuite si tu t'éloignes. Les ennemis de missions, primes, douane, événements gardent leur comportement.
const AI3={t:20,gid:0,warned:new Map(),calmPos:new Set(),msgT:0};
const AI3_DET=[0,430,720,1000,1300],AI3_WARN=[8,7,5,2.5,0];
function ai3Ctl(){try{return typeof ctlOf=='function'?ctlOf(secOf(S.pos.x,S.pos.z)):'front'}catch(e){return 'front'}}
function ai3Det(z){const c=ai3Ctl();return AI3_DET[z]*(c=='alliance'?.65:c=='pirates'?1.3:1)}
function ai3Init(e,st,grp){e.ai3={st,anc:e.pos.clone(),ph:Math.random()*TAU,grp:grp||++AI3.gid,warnT:0,away:0,lab0:e.label,lc0:e.lc};ai3Label(e)}
function ai3Label(e){const A=e.ai3;if(!A||A.lab0)return;if(A.st=='patrol'){e.label='Patrouille pirate';e.lc='#ffd36a'}else if(A.st=='warn'){e.label='Pirates : avertissement '+Math.ceil(Math.max(0,A.warnT))+' s';e.lc='#ff9a40'}else{e.label=undefined;e.lc=undefined}}
function ai3Group(g,st){for(const o of en)if(o.ai3&&o.ai3.grp===g&&!o.dead){o.ai3.st=st;if(st=='atk'){o.cd=Math.min(o.cd,.6+Math.random()*.6);o.run=-1}ai3Label(o)}}
function ai3Say(txt){if(t-AI3.msgT<4)return;AI3.msgT=t;toast(txt)}
// ----- apparitions au hasard selon la zone (remplacent celles de updEnemies) -----
function ai3Spawn(dt,z){const hunt=(G.m&&G.m.type=='chasse')||!!G.gm;AI3.t-=dt;if(AI3.t>0||S.docked||S.dead||(typeof BOSS!='undefined'&&BOSS))return;
const c=ai3Ctl();
if(hunt){AI3.t=5+Math.random()*4;if(en.filter(e=>!e.boss&&e.ai3&&e.ai3.hunt).length>=3+z)return;const p=ai3Pos(1100),ty=z>=1&&Math.random()<.5?'chasseur':'pirate',L=mkEnemy(ty,p,z);en.push(L);ai3Init(L,'atk');L.ai3.hunt=1;
if(Math.random()<.5){const W=mkEnemy(ty,p.clone().add(new V3(30,10,30)),z);W.lead=L;W.side=Math.random()<.5?1:-1;en.push(W);ai3Init(W,'atk',L.ai3.grp);W.ai3.hunt=1}return}
AI3.t=(26+Math.random()*22)/(1+z*.25)*(c=='alliance'?1.6:c=='pirates'?.75:1);
if(z==0||(c=='alliance'&&z<=1))return;
if(en.filter(e=>!e.boss&&e.ai3&&e.ai3.st!='atk').length>=1+z)return;
const r=Math.random(),ty=z>=2&&r<.25?'lourd':z>=1&&r<.55?'chasseur':'pirate',p=ai3Pos(1350+Math.random()*350),L=mkEnemy(ty,p,z);en.push(L);ai3Init(L,'patrol');
const n=ty=='lourd'?1:ty=='chasseur'?(Math.random()<.7?1:0):(Math.random()<.5?1:0);for(let i=0;i<n;i++){const W=mkEnemy(ty=='lourd'?'pirate':ty,p.clone().add(new V3(30+i*25,10,30)),z);W.lead=L;W.side=i%2?1:-1;en.push(W);ai3Init(W,'patrol',L.ai3.grp)}}
function ai3Pos(R){const a=Math.random()*TAU;return S.pos.clone().add(new V3(Math.cos(a)*R,rv(220),Math.sin(a)*R))}
// ----- comportement des groupes au calme : patrouille, puis avertissement -----
const _a1=new V3(),_a2=new V3(),_a3=new V3();
function ai3Calm(dt,L,z){const det=ai3Det(z);AI3.calmPos.clear();
for(const e of L){if(e.dead)continue;const A=e.ai3,d=e.pos.distanceTo(S.pos);AI3.calmPos.add(e.pos);
if(d>4500&&!e.persist){e.dead=1;e.mesh.parent&&e.mesh.parent.remove(e.mesh);continue}
// perception
if(!S.docked&&!S.dead){if(A.st=='patrol'&&det>0&&d<det&&!(typeof RC!='undefined'&&RC.on)){const w=AI3_WARN[z];if(w<=0){ai3Group(A.grp,'atk');ai3Say('⚠ Des pirates t\'ont repéré : ils attaquent !');continue}
for(const o of L)if(o.ai3.grp===A.grp){o.ai3.st='warn';o.ai3.warnT=w}if(!AI3.warned.has(A.grp)){AI3.warned.set(A.grp,1);ai3Say(G.cr>0&&(typeof cargoUsed=='function'&&cargoUsed()>0)?'📡 Pirates : « Belle cargaison… Dégage de notre secteur ou on ouvre le feu ! »':'📡 Pirates : « Tu es sur notre territoire. Fais demi-tour ! »')}}
else if(A.st=='warn'){A.warnT-=dt;if(d>det*1.6){A.st='patrol';A.anc.copy(e.pos);ai3Label(e);if(e.lead==null)ai3Say('📡 Les pirates te laissent filer');continue}if(A.warnT<=0){ai3Group(A.grp,'atk');ai3Say('⚠ Tu n\'as pas obéi : les pirates attaquent !');continue}}}
else if(A.st=='warn'){A.st='patrol';A.anc.copy(e.pos)}
ai3Label(e);
// déplacement
_a1.copy(S.pos).sub(e.pos).normalize();let tg,spd;
if(A.st=='warn'){const keep=Math.min(380,det*.8);tg=_a2.copy(S.pos).addScaledVector(_a1,-keep).add(_a3.set(Math.sin(t*.4+A.ph)*60,Math.cos(t*.3+A.ph)*25,0));spd=Math.min(e.sp*1.1,Math.max(20,e.pos.distanceTo(tg)*.8))}
else if(e.lead&&!e.lead.dead&&e.lead.ai3&&e.lead.ai3.st!='atk'){const ld=e.lead;_a3.crossVectors(ld.dir,AY).normalize();tg=_a2.copy(ld.pos).addScaledVector(_a3,40*(e.side||1)).addScaledVector(ld.dir,-25).add(_a3.set(0,6,0));spd=Math.max(25,ld.vel.length()+e.pos.distanceTo(tg)*1.1)}
else{const R=260;A.ph+=dt*(e.sp*.42)/R*.6;tg=_a2.copy(A.anc).add(_a3.set(Math.cos(A.ph)*R,Math.sin(A.ph*.7)*45,Math.sin(A.ph)*R));spd=e.sp*.42}
const to=tg.sub(e.pos),dT=to.length();to.divideScalar(dT||1);_a3.copy(e.dir);e.dir.lerp(to,damp(1.8,dt)).normalize();e.vel.copy(e.dir).multiplyScalar(spd);e.pos.addScaledVector(e.vel,dt);
for(const o of L){if(o===e)continue;const dd=e.pos.distanceTo(o.pos);if(dd<38&&dd>.01)e.pos.addScaledVector(_a2.copy(e.pos).sub(o.pos).normalize(),(38-dd)*dt*3)}
const turn=_a2.crossVectors(_a3,e.dir).y;e.bank=lerp(e.bank||0,clamp(turn*55,-1,1),damp(3,dt));
if(A.st=='warn'&&d<900)e.mesh.lookAt(_a2.copy(e.pos).sub(_a1));else e.mesh.lookAt(_a2.copy(e.pos).sub(e.dir));if(e.mesh.userData.body)e.mesh.userData.body.rotation.z=e.bank+Math.sin(t*1.6+e.sz)*.06;
if(d<1800&&Math.random()<.5){_a2.copy(e.pos).addScaledVector(e.dir,-e.sz*.75);SPK.emit(_a2.x,_a2.y,_a2.z,-e.dir.x*40+rv(6),-e.dir.y*40+rv(6),-e.dir.z*40+rv(6),.3,1,.5,.18,.35)}}}
// ----- les attaquants rencontrés au hasard abandonnent si tu t'éloignes -----
function ai3Atk(dt,z){const det=Math.max(1800,ai3Det(z)*2.4);for(const e of en){const A=e.ai3;if(!A||A.st!='atk'||A.hunt||e.boss||A.ext)continue;const d=e.pos.distanceTo(S.pos);
if(d>det||S.docked||S.dead){A.away+=dt;if(A.away>5){A.away=0;A.anc.copy(e.pos);for(const o of en)if(o.ai3&&o.ai3.grp===A.grp){o.ai3.st='patrol';o.ai3.anc.copy(o.pos);o.ai3.away=0;ai3Label(o)}if(!S.docked&&!S.dead)ai3Say('📡 Les pirates abandonnent la poursuite')}}else A.away=0}}
{const _ue=updEnemies;updEnemies=function(dt,z){spawnT=1e9;ai3Spawn(dt,z);
const calm=en.filter(e=>e.ai3&&e.ai3.st!='atk'&&!e.dead);if(calm.length)en=en.filter(e=>!(e.ai3&&e.ai3.st!='atk'));
try{_ue(dt,z)}finally{for(const e of calm)if(!e.dead&&!en.includes(e))en.push(e)}
// tout ennemi apparu ailleurs (missions, primes, douane, événements) garde son comportement d'attaque
for(const e of en)if(!e.ai3){if(e.fromCar&&e.fromCar.ai3&&e.fromCar.ai3.st!='atk')ai3Init(e,'patrol',e.fromCar.ai3.grp);else{ai3Init(e,'atk');e.ai3.ext=1}}
ai3Calm(dt,calm,z);ai3Atk(dt,z);en=en.filter(e=>!e.dead)}}
// les rencontres au hasard de foes.js (essaims, furtifs, porte-chasseurs, Xil) patrouillent aussi
{const _fg=foeGroup;foeGroup=function(kind,z){const before=new Set(en);const r=_fg(kind,z);const g=++AI3.gid;for(const e of en)if(!before.has(e)&&!e.ai3)ai3Init(e,'patrol',g);return r}}
// riposte : si tu touches un pirate au calme, tout son groupe attaque
{const _he=hitEnemy;hitEnemy=function(e,d,p){if(e&&e.ai3&&e.ai3.st!='atk'&&!e.dead){ai3Group(e.ai3.grp,'atk');ai3Say('⚔ Tu as ouvert le feu : les pirates ripostent !')}_he(e,d,p)}}
// pas de flèche rouge au bord de l'écran pour les pirates au calme
{const _em=edgeMarker;edgeMarker=function(p,...a){if(AI3.calmPos.has(p))return;return _em(p,...a)}}
