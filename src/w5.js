// ===== INTÉRIEUR DU VAISSEAU (après w4.js) : se lever du siège, marcher à bord, dormir, café, casier, terminal, réparations, soute =====
// Scène à part `SI.sc` (comme le hangar), construite selon la taille du vaisseau (petit : cabine ; gros : cockpit + quartiers + salle des machines + soute).
// Pendant ce temps le vaisseau tient sa position dans l'espace (enveloppe de `fly`), le monde continue (alarme si des ennemis attaquent).
const SI={on:false,sc:null,cam:null,key:'',p:new V3(),yaw:0,cy:0,cp:.25,vel:new V3(),ph:0,m:null,spots:[],col:[],box:null,near:null,drag:null,big:false,alarm:0,alT:0,lights:null,react:null,pass:null,sleep:0,ceil:2.7};
const _si1=new V3(),_si2=new V3(),_siQ=new QT();
const siBig=()=>((HULLS[G.ship]||{}).hp||1)>=1.4;
// ----- matériaux et textures -----
const SIT={};function siTex(){if(SIT.ok)return SIT;SIT.ok=1;
const f=mkC(256,256),g=f.getContext('2d');g.fillStyle='#2a3038';g.fillRect(0,0,256,256);g.strokeStyle='#1a1e24';g.lineWidth=4;for(let i=0;i<=256;i+=64){g.beginPath();g.moveTo(i,0);g.lineTo(i,256);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(256,i);g.stroke()}for(let i=0;i<300;i++){g.fillStyle=`rgba(255,255,255,${Math.random()*.04})`;g.fillRect(Math.random()*256,Math.random()*256,2,2)}g.fillStyle='#ffb84a';for(let i=8;i<256;i+=64)for(let j=8;j<256;j+=64)g.fillRect(i,j,3,3);
SIT.floor=new THREE.CanvasTexture(f);SIT.floor.wrapS=SIT.floor.wrapT=THREE.RepeatWrapping;
const w=mkC(256,256),h=w.getContext('2d');h.fillStyle='#c9d1da';h.fillRect(0,0,256,256);h.strokeStyle='#9aa4b0';h.lineWidth=3;h.strokeRect(6,6,244,244);h.strokeRect(20,20,216,100);h.fillStyle='#b5bfca';h.fillRect(20,140,216,96);for(let i=0;i<8;i++){h.fillStyle='#8a94a0';h.beginPath();h.arc(14+i*32,248,2.5,0,TAU);h.fill()}
SIT.wall=new THREE.CanvasTexture(w);SIT.wall.wrapS=SIT.wall.wrapT=THREE.RepeatWrapping;
SIT.scr=k=>{const c=mkC(256,160),x=c.getContext('2d');x.fillStyle='#04121c';x.fillRect(0,0,256,160);x.strokeStyle='#38e0ff';x.lineWidth=2;x.strokeRect(4,4,248,152);x.fillStyle='#38e0ff';x.font="700 18px 'Chakra Petch',system-ui";x.fillText(k,12,28);for(let i=0;i<6;i++){x.globalAlpha=.6;x.fillRect(12,44+i*18,40+Math.random()*180,6)}x.globalAlpha=1;x.strokeStyle='#ffb84a';x.beginPath();for(let i=0;i<24;i++)x.lineTo(150+i*4,120-Math.random()*30);x.stroke();return new THREE.CanvasTexture(c)};
SIT.m={floor:new THREE.MeshStandardMaterial({map:SIT.floor,metalness:.6,roughness:.45}),wall:new THREE.MeshStandardMaterial({map:SIT.wall,color:0xa8b0bc,metalness:.3,roughness:.6}),dark:new THREE.MeshStandardMaterial({color:0x262c34,metalness:.6,roughness:.45}),
 trim:new THREE.MeshStandardMaterial({color:0xffb84a,emissive:0xffa030,emissiveIntensity:.9}),cyan:new THREE.MeshStandardMaterial({color:0x38e0ff,emissive:0x38e0ff,emissiveIntensity:1.2}),glass:new THREE.MeshStandardMaterial({color:0x9fd8ff,metalness:.2,roughness:.05,transparent:true,opacity:.12}),
 fabric:new THREE.MeshStandardMaterial({color:0x3a5a8a,roughness:.95}),white:new THREE.MeshStandardMaterial({color:0xe8ecf0,roughness:.9}),leather:new THREE.MeshStandardMaterial({color:0x5a3a2a,roughness:.6}),crate:new THREE.MeshStandardMaterial({color:0x8a6a3a,roughness:.75}),crate2:new THREE.MeshStandardMaterial({color:0x4a6a8a,metalness:.4,roughness:.5})};return SIT}
// ----- construction -----
function siBuild(){const big=siBig(),key=G.ship+(big?'B':'S');if(SI.sc&&SI.key===key)return;SI.key=key;SI.big=big;const T=siTex(),M=T.m,sc=new THREE.Scene();sc.background=new THREE.Color(0x02040a);SI.sc=sc;SI.spots=[];SI.col=[];
SI.cam=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.05,2000);
const add=(geo,m,x,y,z,rx=0,ry=0,rz=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);sc.add(o);return o},box=(w,h,d,m,x,y,z,ry=0,coll=true)=>{const o=add(RB3(w,h,d),m,x,y,z,0,ry);if(coll)SI.col.push({x,z,w:(ry?d:w)/2,d:(ry?w:d)/2});return o};
const W=big?4:3,Z0=big?-14:-5.5,Z1=big?14:5.5,H=big?3.1:2.6;SI.ceil=H;SI.box={x0:-W+.35,x1:W-.35,z0:Z0+(big?2.2:1.3),z1:Z1-.4};
// sol / plafond
const fl=add(new THREE.PlaneGeometry(W*2,Z1-Z0),M.floor,0,0,(Z0+Z1)/2,-Math.PI/2);T.floor.repeat.set(W,(Z1-Z0)/2);add(new THREE.PlaneGeometry(W*2,Z1-Z0),M.dark,0,H,(Z0+Z1)/2,Math.PI/2);
for(let z=Z0+1;z<Z1;z+=2){add(new THREE.BoxGeometry(W*1.6,.05,.12),M.trim,0,H-.03,z)}// bandes lumineuses
// murs latéraux : bas + haut + montants, bande de hublots entre 1,0 et 2,0 m
for(const s of[-1,1]){add(new THREE.BoxGeometry(.12,1,Z1-Z0),M.wall,s*W,.5,(Z0+Z1)/2);add(new THREE.BoxGeometry(.12,H-2,Z1-Z0),M.wall,s*W,(H+2)/2,(Z0+Z1)/2);for(let z=Z0;z<=Z1;z+=2.2)add(new THREE.BoxGeometry(.18,1,.35),M.dark,s*W,1.5,z);add(new THREE.PlaneGeometry(Z1-Z0,1),M.glass,s*W,1.5,(Z0+Z1)/2,0,-s*Math.PI/2)}
add(new THREE.BoxGeometry(W*2,H,.12),M.wall,0,H/2,Z1);// mur arrière
// pare-brise avant
add(new THREE.BoxGeometry(W*2,.9,.12),M.wall,0,.45,Z0);add(new THREE.BoxGeometry(W*2,.35,.12),M.wall,0,H-.18,Z0);for(const x of[-W*.35,W*.35])add(new THREE.BoxGeometry(.15,H,.18),M.dark,x,H/2,Z0);add(new THREE.PlaneGeometry(W*2,H-1.25),M.glass,0,.9+(H-1.25)/2,Z0+.02);
// siège(s) de pilotage + console
const seat=(x,z)=>{box(.8,.5,.8,M.dark,x,.25,z);box(.82,.14,.82,M.leather,x,.57,z,0,false);box(.82,1,.16,M.leather,x,1.1,z+.38,0,false);box(.1,.3,.6,M.dark,x-.45,.8,z,0,false);box(.1,.3,.6,M.dark,x+.45,.8,z,0,false)};
const cz=Z0+(big?2:1.5);if(big){seat(-1.2,cz);seat(1.2,cz)}else seat(0,cz);
box(W*1.6,.85,.55,M.dark,0,.43,Z0+.55);for(let i=-1;i<=1;i++){const sp=add(new THREE.PlaneGeometry(.75,.45),new THREE.MeshBasicMaterial({map:T.scr(['NAV','SYS','COM'][i+1])}),i*.95,1.05,Z0+.62,-.6);}
for(let i=0;i<14;i++){const l=sprite([0x38e0ff,0xffb84a,0x60ff90,0xff5050][i%4],.06,.9);l.position.set(-W*.75+i*W*.11,.88,Z0+.7);sc.add(l)}
SI.spots.push({x:big?-1.2:0,z:cz+.9,act:'seat',lab:'Reprendre les commandes',ic:'ship'});
// ----- aménagements -----
const bed=(x,z,ry)=>{box(1.3,.42,2.3,M.dark,x,.21,z,ry);add(RB3(1.2,.16,2.2),M.white,x,.5,z,0,ry);add(RB3(1.18,.08,1.4),M.fabric,x,.6,z+(ry?0:.35),0,ry);add(RB3(.7,.14,.35),M.white,x,.62,z-(ry?0:.85),0,ry);SI.spots.push({x:x-Math.sign(x)*1.1,z,act:'bed',lab:'Dormir',ic:'moon'})};
const locker=(x,z)=>{box(.6,2.1,1,M.dark,x,1.05,z);add(new THREE.BoxGeometry(.02,1.9,.02),M.trim,x-Math.sign(x)*.31,1.05,z);SI.spots.push({x:x-Math.sign(x)*.9,z,act:'locker',lab:'Casier (tenue du pilote)',ic:'user'})};
const term=(x,z)=>{box(.6,.9,1.2,M.dark,x,.45,z);const s=add(new THREE.PlaneGeometry(1.1,.7),new THREE.MeshBasicMaterial({map:T.scr('CARTE')}),x-Math.sign(x)*.02,1.55,z,0,-Math.sign(x)*Math.PI/2);SI.spots.push({x:x-Math.sign(x)*1,z,act:'term',lab:'Terminal de bord (carte)',ic:'map'})};
const coffee=(x,z)=>{box(.6,1,1.3,M.dark,x,.5,z);box(.4,.5,.35,M.leather,x,1.25,z,0,false);const l=sprite(0xff8a3a,.12,1);l.position.set(x-Math.sign(x)*.2,1.25,z);sc.add(l);SI.spots.push({x:x-Math.sign(x)*.95,z,act:'coffee',lab:'Se faire un café',ic:'spark'})};
const repair=(x,z,lab)=>{box(.5,1.6,1.4,M.dark,x,.8,z);add(new THREE.PlaneGeometry(1.1,.8),new THREE.MeshBasicMaterial({map:T.scr('SYSTÈMES')}),x-Math.sign(x)*.27,1.3,z,0,-Math.sign(x)*Math.PI/2);SI.spots.push({x:x-Math.sign(x)*.95,z,act:'repair',lab,ic:'wrench'})};
SI.crates=[];const crates=(x0,x1,z0,z1)=>{SI.cz=[x0,x1,z0,z1]};
if(!big){bed(2.15,2.2);locker(-2.6,3.3);term(-2.65,-.4);coffee(2.6,-.6);repair(0,5.15,'Panneau technique (réparer)');SI.col.push({x:0,z:5.15,w:.75,d:.3});crates(-2.4,-1.2,4.2,5)}
else{// quartiers et cuisine
 coffee(-3.6,-6.5);box(1.6,.75,1,M.dark,0,.38,-5,0);box(1.8,.06,1.2,M.white,0,.78,-5,0,false);for(const s of[-1,1])box(.4,.5,.4,M.leather,s*1.25,.25,-5);
 bed(2.9,-4.2);locker(3.6,-7.4);term(-3.65,-2.4);
 // cloisons avec passages (salle des machines et soute)
 for(const zz of[-.8,6])for(const s of[-1,1]){box(W-1,H,.15,M.wall,s*(W+1)/2,H/2,zz)}
 // salle des machines : réacteur
 const re=add(new THREE.CylinderGeometry(.9,.9,2.6,24),new THREE.MeshStandardMaterial({color:0x38e0ff,emissive:0x1aa8ff,emissiveIntensity:1.4,transparent:true,opacity:.85}),0,1.4,2.6);SI.react=re;for(const yy of[.1,2.75])add(new THREE.CylinderGeometry(1.2,1.2,.25,24),M.dark,0,yy,2.6);SI.col.push({x:0,z:2.6,w:1.25,d:1.25});
 for(let i=0;i<4;i++){const a=i/4*TAU;add(new THREE.CylinderGeometry(.08,.08,3,8),M.trim,Math.cos(a)*1.6,1.5,2.6+Math.sin(a)*1.6)}
 repair(-3.6,1.2,'Console des machines (réparer)');crates(-3.4,3.4,7.2,13.4);
 // rampe de la soute
 add(new THREE.PlaneGeometry(4,2.6),new THREE.MeshStandardMaterial({color:0x3a4048,metalness:.6,roughness:.5}),0,1.3,Z1-.08,0,Math.PI);for(let i=0;i<5;i++)add(new THREE.BoxGeometry(.5,.08,.02),M.trim,-1.5+i*.75,.2,Z1-.1)
 SI.spots.push({x:0,z:9.5,act:'cargo',lab:'Inspecter la soute',ic:'cargo'})}
// extérieur vu par les hublots : nébuleuse, étoiles, étoile proche, planète proche
const neb=typeof NEB!='undefined'&&NEB.material&&NEB.material.map;const sky=add(new THREE.SphereGeometry(400,32,16),new THREE.MeshBasicMaterial({map:neb||null,color:neb?0xffffff:0x050a14,side:THREE.BackSide,depthWrite:false}),0,0,0);sky.renderOrder=-10;SI.sky=sky;
const sp=new Float32Array(1500*3);for(let i=0;i<1500;i++){const v=new V3(rv(1),rv(1),rv(1)).normalize().multiplyScalar(380);sp.set([v.x,v.y,v.z],i*3)}const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.BufferAttribute(sp,3));sc.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:1.4,sizeAttenuation:false})));
SI.sun=sprite(0xfff2d0,60);sc.add(SI.sun);SI.planet=add(new THREE.SphereGeometry(1,32,16),new THREE.MeshLambertMaterial({color:0x6688aa}),0,0,0);SI.planet.visible=false;
// lumières
sc.add(new THREE.HemisphereLight(0xcfe2ff,0x1a1e26,.55));SI.dl=new THREE.DirectionalLight(0xfff2d0,.6);sc.add(SI.dl,SI.dl.target);SI.lights=[];for(let z=Z0+2;z<Z1;z+=big?7:5){const l=new THREE.PointLight(0xffe2b0,.9,big?11:8,1.6);l.position.set(0,H-.3,z);sc.add(l);SI.lights.push(l)}
SI.al=new THREE.PointLight(0xff2020,0,30,1.2);SI.al.position.set(0,H-.4,(Z0+Z1)/2);sc.add(SI.al);
// pilote
SI.m=buildHuman(pilotOpts({acc:0xff8a2a,tool:true,skin:0xe0b090,closed:false}));sc.add(SI.m)}
// caisses selon la cargaison
function siCrates(){const sc=SI.sc;if(!sc||!SI.cz)return;for(const c of SI.crates)sc.remove(c);SI.crates=[];const n=Math.min(SI.big?18:4,Math.ceil(cargoUsed()/(SI.big?3:5)));const[x0,x1,z0,z1]=SI.cz,M=siTex().m;
for(let i=0;i<n;i++){const cols=SI.big?6:2,cx=i%cols,row=Math.floor(i/cols)%3,lv=Math.floor(i/(cols*3));const x=x0+(x1-x0)*(cx+.5)/cols,z=z0+(row+.5)*((z1-z0)/3),y=.4+lv*.8;const c=new THREE.Mesh(RB3(.8,.8,.8),i%3?M.crate:M.crate2);c.position.set(x,y,z);c.rotation.y=(i*1.7)%.4-.2;sc.add(c);SI.crates.push(c)}}
// orientation de l'extérieur (le vaisseau ne bouge pas pendant qu'on marche)
function siOutside(){const inv=_siQ.copy(S.q).invert(),L=lightFor(S.pos.x,S.pos.y,S.pos.z),d=_si1.copy(L.dir).applyQuaternion(inv);SI.sun.position.copy(d).multiplyScalar(300);SI.dl.position.copy(d).multiplyScalar(10);SI.dl.color.copy(L.col);
SI.sky.quaternion.copy(inv);let bp=null,bd=1e9;for(const p of planets){const dd=Math.hypot(p.x-S.pos.x,p.y-S.pos.y,p.z-S.pos.z)-p.r;if(dd<bd){bd=dd;bp=p}}
if(bp&&bd<25000){const dir=_si2.set(bp.x-S.pos.x,bp.y-S.pos.y,bp.z-S.pos.z).normalize().applyQuaternion(inv),ang=Math.atan(bp.r/Math.max(1,bd+bp.r));SI.planet.visible=true;SI.planet.position.copy(dir).multiplyScalar(300);SI.planet.scale.setScalar(Math.min(280,300*Math.tan(ang)));SI.planet.material.color.setHSL(bp.hue/360,.45,.45)}else SI.planet.visible=false}
// ----- entrer / sortir -----
const siThreat=()=>en.some(e=>!e.dead&&e.pos.distanceTo(S.pos)<2500&&(!e.ai3||e.ai3.st=='atk'));
function siEnter(){if(SI.on||mode!='space'||S.docked||S.dead||S.entry||(typeof JMP!='undefined'&&JMP.on))return;if(siThreat()){toast('⚠ Impossible de quitter le siège : des ennemis attaquent');return}
siBuild();siCrates();siOutside();SI.on=true;S.vel.set(0,0,0);S.spd=0;S.thr=0;const s0=SI.spots.find(s=>s.act=='seat');SI.p.set(s0.x,0,s0.z+2.4);SI.yaw=Math.PI;SI.cy=Math.PI;SI.cp=.25;SI.vel.set(0,0,0);SI.m.visible=true;
siPassenger();document.body.classList.add('siOn');try{SFX.buy()}catch(e){}toast('🚶 Tu marches dans ton vaisseau — '+(DESK?'ZQSD/WASD pour marcher, glisse pour regarder, E pour interagir':'joystick à gauche, glisse à droite pour regarder'));siUI()}
function siExit(silent){if(!SI.on)return;SI.on=false;SI.alarm=0;document.body.classList.remove('siOn');camInit=true;if(!silent)toast('🚀 De retour aux commandes');siUI()}
function siPassenger(){const T=typeof v4T=='function'&&v4T();if(SI.pass&&(!T||SI.pass.userData.nm!==T.name)){SI.sc.remove(SI.pass);SI.pass=null}if(T&&!SI.pass){const h=buildHuman({suit:[0x8a3a5a,0x3a6a8a,0x6a8a3a,0xc0a050][T.name.length%4],helmet:false,hs:T.name.length%5,fem:T.name.length%2==0});h.userData.nm=T.name;
 if(SI.big){h.position.set(-1.25,0,-5);h.rotation.y=Math.PI/2}else{h.position.set(1.35,0,2.2);h.rotation.y=-Math.PI/2}SI.sc.add(h);SI.pass=h;SI.spots.push({x:h.position.x+(SI.big?.9:-1),z:h.position.z,act:'pass',lab:'Parler à '+T.name,ic:'user',pass:1})}
SI.spots=SI.spots.filter(s=>!s.pass||(T&&SI.pass))}
// ----- actions -----
function siAct(a){if(a=='seat'){siExit();return}
if(a=='bed')siSleep();
else if(a=='locker'){if(typeof cus3Toggle=='function')cus3Toggle(true)}
else if(a=='term'){openMap();toast('🗺 Choisis une destination puis va dormir : le vaisseau y voyagera pendant ton sommeil')}
else if(a=='coffee'){G.x.siCafe=Date.now()+10*60e3;toast('☕ Un bon café : +10 % de cadence de tir pendant 10 min');try{noise(1.2,.05,900);tone(400,300,.6,'sine',.03)}catch(e){}}
else if(a=='repair'){const s=v1s();const any=Object.values(s).some(v=>v<1);if(!any){toast('🔧 Tous les systèmes sont en état');return}SI.fix=2.5;toast('🔧 Réparation en cours…');try{noise(2.5,.08,2400)}catch(e){}}
else if(a=='cargo'){const L=Object.entries(G.cargo||{}).filter(([k,v])=>v>0).map(([k,v])=>{const g=GOODS.find(x=>x.id==k);return v+' '+(g?g.n:k)});toast('📦 Soute : '+(L.length?L.join(', '):'vide')+' ('+cargoUsed()+'/'+cap()+')')}
else if(a=='pass'){const T=v4T();if(T)toast('💬 '+T.name+' : '+['Joli vaisseau, pilote.','On arrive quand ?','Votre café est excellent.','Vous dormez parfois ici ?'][Math.random()*4|0]+' (satisfaction '+Math.round(T.sat)+' %)')}}
function siSleep(){if(SI.sleep>0)return;if(siThreat()){toast('😨 Impossible de dormir avec des ennemis dehors !');return}SI.sleep=3.2;$('siz').classList.add('on');try{tone(220,110,2,'sine',.03)}catch(e){}}
function siWake(){$('siz').classList.remove('on');S.hp=maxhp();S.sh=PM('sh');G.x.siRest=Date.now()+20*60e3;let msg='Coque et bouclier au maximum. Reposé : +10 % d\'XP pendant 20 min.';
const o=MAP.sel;if(o&&(o.k=='st'||o.k=='base'||o.k=='pl'||o.k=='mis'||o.k=='ply')){const need=typeof v4Need=='function'?v4Need(o):0,F=typeof v4F=='function'?v4F():null;
 if(F&&F.v<need)msg+=' Pas assez de carburant pour voyager pendant la nuit ('+need+' requis).';else{if(F)F.v-=need;const off=o.k=='pl'?(o.r||400)*1.6+300:420,dir=_si1.set(S.pos.x-o.x,0,S.pos.z-o.z);if(dir.lengthSq()<1)dir.set(1,0,0);dir.normalize();S.pos.set(o.x,o.y||0,o.z).addScaledVector(dir,off);S.q.setFromUnitVectors(new V3(0,0,-1),_si2.set(o.x,o.y||0,o.z).sub(S.pos).normalize());
  for(const e of en)e.mesh.parent&&e.mesh.parent.remove(e.mesh);en.length=0;lastCK='';streamWorld();siOutside();msg='Le pilote automatique t\'a amené près de '+o.n+' pendant la nuit. '+msg;MAP.sel=null}}
banner('moon','Bonne nuit, pilote',msg,'#7ab6ff');save()}
// bonus café / repos
{const _pm=PM;PM=function(k){let v=_pm(k);if(k=='rate'&&G.x&&G.x.siCafe>Date.now())v*=1.1;return v}}
{const _gx=gainXP;gainXP=function(n){if(G.x&&G.x.siRest>Date.now()&&n>0)n=Math.round(n*1.1);return _gx(n)}}
// ----- vaisseau immobile, armes coupées, rendu de l'intérieur -----
{const _fl=fly;fly=function(dt,o){if(SI.on&&mode=='space'){S.vel.set(0,0,0);S.spd=0;S.thr=0;return}return _fl(dt,o)}}
{const _fw=fireW;fireW=function(dt,TG){if(SI.on)return;return _fw(dt,TG)}}
{const _rf=renderFrame;renderFrame=function(){if(SI.on&&SI.sc&&!MAP.open&&!(typeof CUS3!='undefined'&&CUS3.open)){siCam(DT||.016);if(typeof GRP!='undefined'&&GRP)GRP.uniforms.str.value=0;if(composer&&bloomOn){rpass.scene=SI.sc;rpass.camera=SI.cam;composer.render();rpass.camera=camera}else R3.render(SI.sc,SI.cam);return}_rf()}}
{const _em=edgeMarker;edgeMarker=function(...a){if(SI.on)return;return _em(...a)}}
{const _pj=proj;proj=function(p){if(SI.on)return{x:-9999,y:-9999,front:false,d:1e9};return _pj(p)}}
if(typeof lensFlares=='function'){const _lf=lensFlares;lensFlares=function(...a){if(SI.on)return;return _lf(...a)}}
function siCam(dt){const c=SI.cam,P=SI.p;if(c.aspect!==innerWidth/innerHeight){c.aspect=innerWidth/innerHeight;c.updateProjectionMatrix()}const dist=2.7,h=1.55+SI.cp*1.3;
let x=P.x+Math.sin(SI.cy)*dist*Math.cos(SI.cp*.5),z=P.z+Math.cos(SI.cy)*dist*Math.cos(SI.cp*.5);const B=SI.box;x=clamp(x,B.x0-.2,B.x1+.2);z=clamp(z,B.z0-.8,B.z1+.2);c.position.set(x,Math.min(h,SI.ceil-.15),z);c.lookAt(P.x,1.3,P.z)}
// ----- interface -----
document.body.insertAdjacentHTML('beforeend','<div id="siui"><button id="sia"></button><button id="siback"></button></div><div id="siz"><b>💤</b><small>Repos…</small></div>');
$('sia').onclick=()=>{if(SI.near)siAct(SI.near.act)};$('siback').onclick=()=>siExit();
function siUI(){$('siui').style.display=SI.on?'block':'none';if(!SI.on)return;const n=SI.near;$('sia').style.display=n?'':'none';if(n){const h=ICO(n.ic||'target')+' '+n.lab+(DESK?' (E)':'');if($('sia').innerHTML!==h)$('sia').innerHTML=h}$('siback').style.display=n&&n.act=='seat'?'none':'';const b=ICO('ship')+' Reprendre les commandes';if($('siback').innerHTML!==b)$('siback').innerHTML=b}
OV.addEventListener('pointerdown',e=>{if(!SI.on)return;if(e.pointerType!='mouse'&&e.clientX<innerWidth*.62)return;SI.drag={id:e.pointerId,x:e.clientX,y:e.clientY}});
OV.addEventListener('pointermove',e=>{const D=SI.drag;if(!D||D.id!==e.pointerId)return;SI.cy-=(e.clientX-D.x)*.008;SI.cp=clamp(SI.cp+(e.clientY-D.y)*.005,-.3,.9);D.x=e.clientX;D.y=e.clientY});
for(const ev of['pointerup','pointercancel'])OV.addEventListener(ev,e=>{if(SI.drag&&SI.drag.id===e.pointerId)SI.drag=null});
addEventListener('keydown',e=>{if(!SI.on||e.target.tagName=='INPUT')return;if(e.code=='KeyE'){e.preventDefault();e.stopImmediatePropagation();if(SI.near)siAct(SI.near.act)}},true);
V1XB.push(()=>mode=='space'&&!S.docked&&!S.dead&&!SI.on&&!(V1&&V1.tur)&&!(typeof GZ!='undefined'&&GZ.on)?['siup','Se lever','user','']:null);V1ACT.siup=siEnter;
// ----- boucle -----
function siTick(dt,rd){if(SI.on&&(mode!='space'||S.dead||S.docked))siExit(true);siUI();if(!SI.on)return;const P=SI.p;
if(SI.sleep>0){SI.sleep-=rd;if(SI.sleep<=0)siWake();return}
if(SI.fix>0){SI.fix-=rd;if(SI.fix<=0){const s=v1s();for(const k in s)s[k]=1;toast('🔧 Réacteur, armes et bouclier réparés');try{tone(600,900,.2,'sine',.05)}catch(e){}}}
let ix=0,iz=0;if(!(typeof CUS3!='undefined'&&CUS3.open)&&!MAP.open){if(stick&&Math.hypot(stick.x,stick.y)>.1){ix=stick.x;iz=-stick.y}ix+=(K.KeyD|K.ArrowRight|0)-(K.KeyA|K.KeyQ|K.ArrowLeft|0);iz+=(K.KeyW|K.KeyZ|K.ArrowUp|0)-(K.KeyS|K.ArrowDown|0);const il=Math.hypot(ix,iz);if(il>1){ix/=il;iz/=il}}
const fw=_si1.set(-Math.sin(SI.cy),0,-Math.cos(SI.cy)),rt=_si2.set(Math.cos(SI.cy),0,-Math.sin(SI.cy)),run=K.ShiftLeft||K.ShiftRight||(B&&B.boost),sp=run?5:3;
const wx=(fw.x*iz+rt.x*ix)*sp,wz=(fw.z*iz+rt.z*ix)*sp;SI.vel.x=lerp(SI.vel.x,wx,damp(10,dt));SI.vel.z=lerp(SI.vel.z,wz,damp(10,dt));P.x+=SI.vel.x*dt;P.z+=SI.vel.z*dt;
const Bx=SI.box;P.x=clamp(P.x,Bx.x0,Bx.x1);P.z=clamp(P.z,Bx.z0,Bx.z1);for(const c of SI.col){const dx=P.x-c.x,dz=P.z-c.z,ox=c.w+.3-Math.abs(dx),oz=c.d+.3-Math.abs(dz);if(ox>0&&oz>0){if(ox<oz)P.x+=Math.sign(dx||1)*ox;else P.z+=Math.sign(dz||1)*oz}}
const hs=Math.hypot(SI.vel.x,SI.vel.z);if(hs>.3){const ty=Math.atan2(-SI.vel.x,-SI.vel.z);let d=ty-SI.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));SI.yaw+=d*damp(10,dt)}SI.ph+=dt*hm3Rate(hs);
SI.m.position.set(P.x,0,P.z);SI.m.rotation.y=SI.yaw;try{animHuman(SI.m,SI.ph,hs,false,false,0,null)}catch(e){}if(SI.pass)try{animHuman(SI.pass,t,0,false,false,Math.sin(t*.6)>.7?1:0,null)}catch(e){}
let best=null,bd=1.6;for(const s of SI.spots){const d=Math.hypot(P.x-s.x,P.z-s.z);if(d<bd){bd=d;best=s}}SI.near=best;
if(SI.react){SI.react.material.emissiveIntensity=1.2+Math.sin(t*3)*.4;SI.react.rotation.y+=dt}
// alarme
const thr=siThreat();if(thr&&!SI.alarm){SI.alarm=1;toast('🚨 Alerte ! Des ennemis approchent : retourne au siège de pilotage !')}else if(!thr)SI.alarm=0;SI.al.intensity=SI.alarm?(Math.sin(t*8)>0?2.5:0):0;
if(SI.alarm){SI.alT-=dt;if(SI.alT<=0){SI.alT=1;try{tone(880,660,.35,'square',.04)}catch(e){}}}for(const l of SI.lights)l.intensity=SI.alarm?.35:.9}
let siT0=performance.now();TICK.push(()=>{const t=performance.now(),rd=Math.min(1,(t-siT0)/1000),d=Math.min(.1,rd);siT0=t;try{siTick(d,rd)}catch(e){console.warn(e)}});
