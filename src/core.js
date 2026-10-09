// ===== OUTILS =====
const $=id=>document.getElementById(id),TAU=Math.PI*2,V3=THREE.Vector3,QT=THREE.Quaternion,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,k)=>a+(b-a)*k,damp=(k,dt)=>1-Math.exp(-k*dt);
const hs=(a,b,s)=>{let n=(a*374761393+b*668265263+s*982451653)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967296};
const h3=(a,b,c,s)=>hs(a*1619+c*6971,b*31337-c*1013,s);
const rng=s=>()=>(s=(s*1664525+1013904223)>>>0)/4294967296;
const seedOf=(...a)=>(h3(a[0]|0,a[1]|0,a[2]|0,a[3]||0)*4294967295)>>>0;
function noise3(x,y,z,s){const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),fx=x-xi,fy=y-yi,fz=z-zi,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy),w=fz*fz*(3-2*fz),L=(a,b,c)=>h3(xi+a,yi+b,zi+c,s);
const x00=lerp(L(0,0,0),L(1,0,0),u),x10=lerp(L(0,1,0),L(1,1,0),u),x01=lerp(L(0,0,1),L(1,0,1),u),x11=lerp(L(0,1,1),L(1,1,1),u);return lerp(lerp(x00,x10,v),lerp(x01,x11,v),w)}
function fbm3(x,y,z,s,o=4){let a=.5,f=1,v=0,n=0;for(let i=0;i<o;i++){v+=a*noise3(x*f,y*f,z*f,s+i*17);n+=a;a*=.5;f*=2.03}return v/n}
function hsl(h,s,l){h=((h%360)+360)%360/360;const f=n=>{const k=(n+h*12)%12,a=s*Math.min(l,1-l);return 255*(l-a*Math.max(-1,Math.min(k-3,9-k,1)))};return[f(0),f(8),f(4)]}
const mkC=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h||w;return c};
function glowTex(inner=.2){const c=mkC(64),g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(inner,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(c);return t}
const NA=['Kor','Vel','Zan','Thy','Ark','Nyx','Omi','Sol','Ria','Bel'],SU=['ia','on','is','ara','ex','us'];

const TM={value:0};
// ===== ÉTAT =====
const S={pos:new V3(0,30,900),vel:new V3(),q:new QT(),hp:100,ore:0,thr:0,spd:0,bank:0,pitchV:0,docked:null,heatT:-9};
const G={cr:1500,xp:0,rep:{alliance:0,guilde:0,carto:0},bp:[],stash:{},bases:{},u:[1,1,1],disc:new Set(),kills:0,m:null,done:0,loot:{},ship:'eclaireur',owned:['eclaireur'],w:['canon'],wi:0,ammo:{missile:0,mine:0},cargo:{},story:null,time:0,vst:[{n:'Base Alpha',x:0,y:0,z:0}],dpos:{},parts:{},pown:[],x:{}};
let t=0,mode='space',hint=10,DT=.016;
const HULLS={eclaireur:{n:'Éclaireur',hp:1,spd:1,turn:1,cap:15,dmg:1,price:0,desc:'Polyvalent et fiable, ton premier vaisseau.'},
intercepteur:{n:'Intercepteur Vif',hp:.8,spd:1.3,turn:1.4,cap:10,dmg:1,price:9000,lv:3,desc:'Le plus rapide et le plus agile du secteur.'},
cargo:{n:'Cargo Mule',hp:1.4,spd:.85,turn:.75,cap:45,dmg:.8,price:12000,lv:3,desc:'Soute énorme : le roi du commerce.'},
faucon:{n:'Chasseur Faucon',hp:1.6,spd:.95,turn:.95,cap:20,dmg:1.5,price:28000,lv:7,rep:['alliance',2],desc:'Blindé et lourdement armé.'},
leviathan:{n:'Croiseur Léviathan',hp:2.5,spd:.8,turn:.7,cap:35,dmg:2.1,price:75000,lv:12,rep:['alliance',3],desc:'Une forteresse volante.'}};
const HS=()=>HULLS[G.ship]||HULLS.eclaireur;
// ----- pièces de vaisseau (Atelier) -----
const PARTS={
paint:{n:'Peinture',ic:'🎨',o:{std:{n:'Couleurs d\'usine',p:0,d:'Les couleurs d\'origine du vaisseau.'},arctique:{n:'Blanc arctique',p:250,d:'Blanc glacier, filets bleus.',c:[0xeef3f8,0x2f6fd0,0x39a0ff]},corsaire:{n:'Rouge corsaire',p:300,d:'Rouge sang et noir, pour faire peur aux pirates.',c:[0xb51f27,0x1c1c20,0xffc040]},toxique:{n:'Vert toxique',p:350,d:'Vert acide et graphite.',c:[0x63d43c,0x22282a,0xd4ff3a]},furtif:{n:'Noir furtif',p:450,d:'Mat et sombre, liserés lumineux.',c:[0x2a2d33,0x121316,0x39ff9a]},neon:{n:'Violet néon',p:550,d:'Violet électrique et cyan.',c:[0x6d34f0,0x16b8f0,0xff4adf]},royal:{n:'Or royal',p:800,d:'Or poli et pourpre. La grande classe.',c:[0xd8ad48,0x4e2378,0xffffff]}}},
nose:{n:'Nez',ic:'🔺',o:{std:{n:'Nez standard',p:0,d:'Profilé de série.'},radar:{n:'Radar longue portée',p:700,d:'Verrouille les cibles 50 % plus loin.',lock:1.5},eperon:{n:'Éperon blindé',p:900,d:'Coque +15 % et les collisions ne t\'abîment plus.',hp:1.15,ram:1},chasse:{n:'Nez de chasse',p:1300,d:'Toutes les armes +12 %, visée assistée plus large.',dmg:1.12,cone:1.5}}},
wings:{n:'Ailes',ic:'🪽',o:{std:{n:'Ailes standard',p:0,d:'Équilibrées.'},delta:{n:'Ailes delta',p:800,d:'Maniabilité +22 %.',turn:1.22},blindees:{n:'Ailes blindées',p:1100,d:'Coque +20 %, maniabilité −5 %.',hp:1.2,turn:.95},lames:{n:'Ailes-lames',p:1500,d:'Vitesse +10 %, maniabilité +15 %.',spd:1.1,turn:1.15}}},
eng:{n:'Moteurs',ic:'🔥',o:{std:{n:'Réacteurs standard',p:0,d:'Fiables.'},ion:{n:'Propulseurs ioniques',p:1000,d:'Vitesse +15 %. Flamme bleu électrique.',spd:1.15,col:0x3fa8ff},triple:{n:'Triple poussée',p:1600,d:'Boost +35 %.',boost:1.35,col:0xff8a30},fusion:{n:'Réacteur à fusion',p:3200,d:'Vitesse +25 % et boost +20 %. Flamme dorée.',spd:1.25,boost:1.2,col:0xffd23a}}},
guns:{n:'Canons',ic:'🔫',o:{std:{n:'Canons standard',p:0,d:'Tirs laser cyan.',bc:0x56e8ff},jumeles:{n:'Canons jumelés',p:1200,d:'Un tir de plus à chaque salve.',shots:1,bc:0x56e8ff},lourds:{n:'Canons lourds',p:1500,d:'Dégâts +45 %, cadence −15 %. Tirs orange.',cdmg:1.45,rate:.85,bc:0xff9a30},rotatifs:{n:'Canons rotatifs',p:2200,d:'Cadence +45 %. Tirs jaunes.',rate:1.45,bc:0xffe85a},plasma:{n:'Canons à plasma',p:3400,d:'Dégâts +30 % et cadence +15 %. Tirs verts.',cdmg:1.3,rate:1.15,bc:0x5dff6a}}},
armor:{n:'Blindage',ic:'🛡',o:{std:{n:'Blindage standard',p:0,d:'De série.'},composite:{n:'Plaques composites',p:900,d:'Coque +25 %.',hp:1.25},reactif:{n:'Blindage réactif',p:1800,d:'Coque +50 %, vitesse −5 %.',hp:1.5,spd:.95},nano:{n:'Nano-coque',p:3000,d:'Coque +30 % et elle se répare toute seule.',hp:1.3,regen:2.5}}},
shield:{n:'Bouclier',ic:'💠',o:{std:{n:'Aucun bouclier',p:0,d:'Rien ne protège la coque.'},leger:{n:'Déflecteur léger',p:800,d:'Bouclier de 25 points qui se recharge.',sh:25,scol:0x5ad0ff},tactique:{n:'Bouclier tactique',p:1700,d:'Bouclier de 55 points.',sh:55,scol:0x6a8cff},egide:{n:'Égide',p:3500,d:'Bouclier de 100 points, recharge rapide.',sh:100,shr:1.7,scol:0xc070ff}}},
focus:{n:'Laser',ic:'🔆',o:{std:{n:'Focaliseur standard',p:0,d:'Rayon cyan (arme Laser).',lc:0x46e6ff},cryo:{n:'Cryo-refroidisseur',p:900,d:'Le laser chauffe 45 % moins vite.',heat:.55,lc:0x7fb2ff},surcharge:{n:'Surcharge',p:1500,d:'Dégâts du laser +60 %, il chauffe un peu plus.',ldmg:1.6,heat:1.15,lc:0xff4422},prisme:{n:'Prisme double',p:2600,d:'Deux rayons, dégâts du laser +35 %.',ldmg:1.35,twin:1,lc:0xc65cff},solaire:{n:'Lance solaire',p:4200,d:'Dégâts +90 %, portée +40 %, chauffe −20 %.',ldmg:1.9,heat:.8,lrange:1.4,lc:0xffd54a}}},
cargo:{n:'Soute',ic:'📦',o:{std:{n:'Soute standard',p:0,d:'De série.'},pods:{n:'Modules latéraux',p:700,d:'Soute +50 %.',cap:1.5},ventral:{n:'Conteneur ventral',p:1500,d:'Soute ×2, vitesse −5 %.',cap:2,spd:.95}}}};
const PSLOTS=Object.keys(PARTS),PADD={shots:1,twin:1,sh:1,regen:1,ram:1};
const partOf=(s,P)=>{const o=PARTS[s].o;return o[(P||G.parts||{})[s]]||o.std};
let PMK=null,PMC=null;
function pmCalc(P){const r={hp:1,spd:1,boost:1,turn:1,dmg:1,cdmg:1,rate:1,shots:0,heat:1,ldmg:1,twin:0,sh:0,shr:1,regen:0,lock:1,cone:1,cap:1,ram:0,lrange:1};for(const s of PSLOTS){const o=partOf(s,P);for(const k in r)if(o[k]!=null)r[k]=PADD[k]?r[k]+o[k]:r[k]*o[k]}return r}
function PM(k){const key=JSON.stringify(G.parts||{});if(key!==PMK){PMK=key;PMC=pmCalc(G.parts||{})}return PMC[k]}
const maxhp=()=>Math.round((100+40*(G.u[2]-1))*HS().hp*PM('hp')),cap=()=>Math.round(HS().cap*(1+(G.u[2]-1)*.66)*PM('cap'));
const cruise=()=>(110+18*(G.u[1]-1))*HS().spd*PM('spd'),boostSpd=()=>cruise()*2.6*PM('boost');
function toast(s){const e=$('toast');e.textContent=s;e.style.opacity=1;clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.opacity=0,2800)}
const tn=['Arme','Moteur','Coque'];
const ZN=['Zone sûre','Zone frontière','Zone hostile','Zone dangereuse','Zone mortelle'],ZC=['#7f9','#cf6','#fc4','#f84','#f44'];
const danger=()=>Math.min(4,Math.floor(S.pos.length()/9000));

// ===== SAUVEGARDE =====
// économie réelle (true = crédits infinis pour tout le monde)
const ARGENT_ILLIMITE=false,CR_INF=999999999;let SELLK=1,TRAVK=1,GQL=0;try{GQL=clamp(+localStorage.getItem('sf-gq')||0,0,2)}catch(e){}
const SK='starfarer3d-v1';
function save(){try{localStorage.setItem(SK,JSON.stringify({cr:G.cr,u:G.u,disc:[...G.disc],kills:G.kills,done:G.done,loot:G.loot,ore:S.ore,p:S.pos.toArray(),q:S.q.toArray(),ship:G.ship,owned:G.owned,w:G.w,wi:G.wi,ammo:G.ammo,cargo:G.cargo,story:G.story,time:G.time,vst:G.vst,dpos:G.dpos,parts:G.parts,pown:G.pown,pexp:G.pexp,pq:G.pq,xp:G.xp,rep:G.rep,bp:G.bp,stash:G.stash,bases:G.bases,stats:G.stats,x:G.x,eco:2}))}catch(e){}}
function load(){try{let d=JSON.parse(localStorage.getItem(SK)||'null');if(!d){const o=JSON.parse(localStorage.getItem('starfarer-save-v1')||'null');if(o){G.cr=o.cr|0;G.u=o.u||[1,1,1];G.kills=o.kills|0;G.done=o.done|0;return 'old'}return false}
G.cr=d.cr|0;G.u=d.u;G.disc=new Set(d.disc);G.kills=d.kills|0;G.done=d.done|0;G.loot=d.loot||{};S.ore=d.ore|0;S.pos.fromArray(d.p);S.q.fromArray(d.q);for(const k of['ship','owned','w','wi','ammo','cargo','story','time','vst','dpos','parts','pown','pexp','pq','xp','rep','bp','stash','bases','stats','x'])if(d[k]!=null)G[k]=d[k];if(typeof G.x!='object'||!G.x||Array.isArray(G.x))G.x={};if(!d.eco&&!ARGENT_ILLIMITE){if(G.cr>=CR_INF||G.cr>200000)G.cr=2500;G.ecoReset=1}if(!ARGENT_ILLIMITE&&G.cr>=1e8){G.cr=2500;G.ecoReset=1}if(typeof G.rep!='object'||!G.rep)G.rep={};for(const f of['alliance','guilde','carto'])G.rep[f]=+G.rep[f]||0;if(!Array.isArray(G.bp))G.bp=[];if(typeof G.stash!='object'||!G.stash)G.stash={};if(typeof G.bases!='object'||!G.bases)G.bases={};G.xp=+G.xp||0;if(typeof G.parts!='object'||!G.parts)G.parts={};for(const k in G.parts)if(!PARTS[k]||!PARTS[k].o[G.parts[k]])delete G.parts[k];if(!Array.isArray(G.pown))G.pown=[];S.hp=maxhp();return true}catch(e){return false}}
setInterval(()=>{if(mode=='space'&&!S.dead)save()},5000);addEventListener('visibilitychange',()=>{if(document.hidden)save()});addEventListener('pagehide',save);

// ===== COMMANDES =====
const TOUCH=(navigator.maxTouchPoints>0&&matchMedia('(pointer:coarse)').matches)||/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
const DESK=!TOUCH||/[?&]pc\b/.test(location.search);if(DESK)document.body.classList.add('desk');
const K={},B={fire:0,boost:0,brake:0},MS={x:0,y:0,in:false,fire:0,boost:0};let stick=null,inv=false;
try{inv=localStorage.getItem('sf-inv')=='1'}catch(e){}
onkeydown=e=>{if(e.target&&e.target.tagName=='INPUT')return;if(!K[e.code])keyAct(e.code);K[e.code]=1;if(e.code=='Space'||e.code.startsWith('Arrow')||e.code=='Tab')e.preventDefault()};
function keyAct(c){if(c=='KeyE'){const l=$('land');if(l&&l.style.display!='none')l.click()}else if(c=='Digit1'||c=='Digit2'||c=='Digit3'){if(S.docked)$('u'+c.slice(-1)).click()}else if(c=='KeyF'){if(S.docked)$('mis').click()}else if(c=='KeyG'&&typeof cycleQuality=='function')cycleQuality();else if(c=='KeyH')document.body.classList.toggle('nohelp');else if(c=='KeyI')$('inv').click();else if(c=='KeyM')$('snd').click()}onkeyup=e=>K[e.code]=0;
const OV=$('ov');
OV.addEventListener('contextmenu',e=>e.preventDefault());
const mouseAim=e=>{const R=Math.min(innerWidth,innerHeight)*.34;MS.x=(e.clientX-innerWidth/2)/R;MS.y=(e.clientY-innerHeight/2)/R;MS.in=true};
OV.addEventListener('pointermove',e=>{if(e.pointerType=='mouse')mouseAim(e)});document.addEventListener('mouseleave',()=>{MS.in=false;MS.fire=0;MS.boost=0});
addEventListener('pointerup',e=>{if(e.pointerType=='mouse'){if(e.button==0)MS.fire=0;if(e.button==2)MS.boost=0}});addEventListener('blur',()=>{MS.fire=MS.boost=0;for(const k in K)K[k]=0});
OV.addEventListener('pointerdown',e=>{if(e.pointerType=='mouse'){mouseAim(e);if(e.button==0)MS.fire=1;if(e.button==2)MS.boost=1;return}if(!stick&&e.clientX<innerWidth*.62){stick={id:e.pointerId,ox:e.clientX,oy:e.clientY,x:0,y:0};try{OV.setPointerCapture(e.pointerId)}catch(_){}}});
OV.addEventListener('pointermove',e=>{if(stick&&stick.id==e.pointerId){const dx=e.clientX-stick.ox,dy=e.clientY-stick.oy,l=Math.hypot(dx,dy),R=Math.min(70,innerWidth*.16),m=Math.min(l,R);stick.x=l?dx/l*m/R:0;stick.y=l?dy/l*m/R:0;stick.R=R}});
const endStick=e=>{if(stick&&stick.id==e.pointerId)stick=null};OV.addEventListener('pointerup',endStick);OV.addEventListener('pointercancel',endStick);
for(const k of['fire','boost','brake']){const b=$(k);b.addEventListener('pointerdown',e=>{e.preventDefault();B[k]=1;b.classList.add('on')});for(const ev of['pointerup','pointerleave','pointercancel'])b.addEventListener(ev,()=>{B[k]=0;b.classList.remove('on')})}
$('inv').onclick=()=>{inv=!inv;$('inv').classList.toggle('on',inv);try{localStorage.setItem('sf-inv',inv?'1':'0')}catch(e){}toast(inv?'Commandes inversées (style avion)':'Commandes normales')};$('inv').classList.toggle('on',inv);
document.addEventListener('gesturestart',e=>e.preventDefault());document.addEventListener('dblclick',e=>e.preventDefault());
// lecture du joystick → [lacet, tangage]
function steerInput(){let yaw=0,pitch=0;if(DESK&&MS.in&&!stick){const m=Math.hypot(MS.x,MS.y),dz=.05;if(m>dz){const k=Math.min(1,(m-dz)/(1-dz));yaw=-MS.x/m*k*k*1.15;pitch=-MS.y/m*k*k*1.15*(inv?-1:1)}}else if(stick&&Math.hypot(stick.x,stick.y)>.08){yaw=-stick.x;pitch=-stick.y*(inv?-1:1);const m=Math.hypot(yaw,pitch);const c=Math.min(1,m);yaw=yaw/m*c*c;pitch=pitch/m*c*c}
yaw+=((K.ArrowLeft|K.KeyA|0)-(K.ArrowRight|K.KeyD|0));pitch+=((K.ArrowUp|(DESK?0:K.KeyW)|0)-(K.ArrowDown|(DESK?0:K.KeyS)|0))*(inv?-1:1);return[clamp(yaw,-1,1),clamp(pitch,-1,1)]}
const isBoost=()=>B.boost||MS.boost||K.ShiftLeft||K.ShiftRight||(DESK&&K.KeyW),isBrake=()=>B.brake||K.KeyB||K.ControlLeft||(DESK&&K.KeyS),isFire=()=>B.fire||MS.fire||K.Space;
