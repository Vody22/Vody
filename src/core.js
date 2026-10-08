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
const G={cr:0,u:[1,1,1],disc:new Set(),kills:0,m:null,done:0,loot:{},ship:'eclaireur',owned:['eclaireur'],w:['canon'],wi:0,ammo:{missile:0,mine:0},cargo:{},story:null,time:0,vst:[{n:'Base Alpha',x:0,y:0,z:0}],dpos:{}};
let t=0,mode='space',hint=10,DT=.016;
const HULLS={eclaireur:{n:'Éclaireur',hp:1,spd:1,turn:1,cap:15,dmg:1,price:0,desc:'Polyvalent et fiable, ton premier vaisseau.'},
intercepteur:{n:'Intercepteur Vif',hp:.8,spd:1.3,turn:1.4,cap:10,dmg:1,price:1200,desc:'Le plus rapide et le plus agile du secteur.'},
cargo:{n:'Cargo Mule',hp:1.4,spd:.85,turn:.75,cap:45,dmg:.8,price:1500,desc:'Soute énorme : le roi du commerce.'},
faucon:{n:'Chasseur Faucon',hp:1.6,spd:.95,turn:.95,cap:20,dmg:1.5,price:3200,desc:'Blindé et lourdement armé.'},
leviathan:{n:'Croiseur Léviathan',hp:2.5,spd:.8,turn:.7,cap:35,dmg:2.1,price:7500,desc:'Une forteresse volante.'}};
const HS=()=>HULLS[G.ship]||HULLS.eclaireur;
const maxhp=()=>Math.round((100+40*(G.u[2]-1))*HS().hp),cap=()=>Math.round(HS().cap*(1+(G.u[2]-1)*.66));
const cruise=()=>(110+18*(G.u[1]-1))*HS().spd,boostSpd=()=>cruise()*2.6;
function toast(s){const e=$('toast');e.textContent=s;e.style.opacity=1;clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.opacity=0,2800)}
const tn=['Arme','Moteur','Coque'];
const ZN=['Zone sûre','Zone frontière','Zone hostile','Zone dangereuse','Zone mortelle'],ZC=['#7f9','#cf6','#fc4','#f84','#f44'];
const danger=()=>Math.min(4,Math.floor(S.pos.length()/9000));

// ===== SAUVEGARDE =====
const SK='starfarer3d-v1';
function save(){try{localStorage.setItem(SK,JSON.stringify({cr:G.cr,u:G.u,disc:[...G.disc],kills:G.kills,done:G.done,loot:G.loot,ore:S.ore,p:S.pos.toArray(),q:S.q.toArray(),ship:G.ship,owned:G.owned,w:G.w,wi:G.wi,ammo:G.ammo,cargo:G.cargo,story:G.story,time:G.time,vst:G.vst,dpos:G.dpos}))}catch(e){}}
function load(){try{let d=JSON.parse(localStorage.getItem(SK)||'null');if(!d){const o=JSON.parse(localStorage.getItem('starfarer-save-v1')||'null');if(o){G.cr=o.cr|0;G.u=o.u||[1,1,1];G.kills=o.kills|0;G.done=o.done|0;return 'old'}return false}
G.cr=d.cr|0;G.u=d.u;G.disc=new Set(d.disc);G.kills=d.kills|0;G.done=d.done|0;G.loot=d.loot||{};S.ore=d.ore|0;S.pos.fromArray(d.p);S.q.fromArray(d.q);for(const k of['ship','owned','w','wi','ammo','cargo','story','time','vst','dpos'])if(d[k]!=null)G[k]=d[k];S.hp=maxhp();return true}catch(e){return false}}
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
