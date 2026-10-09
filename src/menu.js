// ===== MENU D'ACCUEIL ANIMÉ : le vaisseau du joueur tourne devant une planète au lancement =====
const MENU3={on:false,sc:null,cam:null,ship:null,pl:null,gen:null,p:null,t:0,ast:[]};
function menu3Skip(){try{const nav=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0],u=(nav&&nav.name)||location.href;if(/(^|&)(v|nomenu)(=|&|$)/.test(u.split('#')[0].split('?')[1]||''))return true;if(sessionStorage.getItem('sf-m3'))return true}catch(e){}return false}
function menu3Build(){const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.5,60000);MENU3.sc=sc;MENU3.cam=cam;
try{const sk=sky.clone(true);sk.userData.m3sky=1;sc.add(sk)}catch(e){}
// planète : teinte qui change chaque jour
const day=Math.floor(Date.now()/864e5),H=[200,120,300,30,180,260,80][day%7],por=innerWidth<innerHeight,R0=por?46:34,c0=new V3(Math.sin(.55)*R0,5,Math.cos(.55)*R0),f0=new V3(por?0:-6,por?-3:1,0).sub(c0).normalize(),r0=new V3().crossVectors(f0,new V3(0,1,0)).normalize(),u0=new V3().crossVectors(r0,f0),pp=c0.clone().addScaledVector(f0,2600).addScaledVector(r0,por?240:820).addScaledVector(u0,por?-760:-330),p={x:pp.x,y:pp.y,z:pp.z,r:por?540:760,hue:H,ring:day%3==0,name:'Menu'};MENU3.p=p;MENU3.sunDir=new V3().addScaledVector(r0,-.8).addScaledVector(u0,.5).addScaledVector(f0,-.3).normalize();
const sunP=c0.clone().addScaledVector(f0,9000).addScaledVector(r0,por?-2600:-5200).addScaledVector(u0,por?5200:3000);sc.add(new THREE.AmbientLight(0x4a5570,.55));const dl=new THREE.DirectionalLight(0xfff0dd,1.6);dl.position.copy(MENU3.sunDir);sc.add(dl);sc.add(new THREE.HemisphereLight(0x9fc4ff,0x261c30,.45));
try{sc.add(buildSun({x:sunP.x,y:sunP.y,z:sunP.z,r:420,col:0xffe196,core:0xfffae6}))}catch(e){}

if(DESK){try{const g=buildPlanetGPU(p);menu3Planet(g)}catch(e){console.warn(e)}}else{try{MENU3.gen=planetTexGen(p)}catch(e){console.warn(e)}}
// vaisseau du joueur
try{const s=buildShip();s.position.set(0,0,0);sc.add(s);MENU3.ship=s;if(s.userData.shield)s.userData.shield.visible=false}catch(e){console.warn(e)}
// quelques astéroïdes qui dérivent
const r=rng(day);for(let i=0;i<10;i++){const m=new THREE.Mesh(AGEO[i%AGEO.length],AMAT[i%AMAT.length]);m.position.set((r()-.5)*320,(r()-.5)*120,-130-r()*300);m.scale.setScalar(2+r()*6);m.rotation.set(r()*6,r()*6,0);sc.add(m);MENU3.ast.push({m,sp:(r()-.5)*.3,v:(r()-.5)*3})}}
function menu3Planet(g){const U=g.userData.U;if(U){U.sunDir.value.copy(MENU3.sunDir);U.sunCol.value.setRGB(.98,.94,.88)}MENU3.sc.add(g);MENU3.pl=g}
function menu3Anim(dt){const M=MENU3;M.t+=dt;const t3=M.t;
if(M.gen){const t0=performance.now();while(performance.now()-t0<14){const r=M.gen.next();if(r.done){M.gen=null;try{menu3Planet(buildPlanet(M.p,r.value))}catch(e){console.warn(e)}break}}}
const a=.55+Math.sin(t3*.045)*.42,R=innerWidth<innerHeight?46:34;M.cam.position.set(Math.sin(a)*R,5+Math.sin(t3*.17)*2.2,Math.cos(a)*R);M.cam.lookAt(innerWidth<innerHeight?0:-6,innerWidth<innerHeight?-3:1,0);
const asp=innerWidth/innerHeight;if(Math.abs(M.cam.aspect-asp)>.001){M.cam.aspect=asp;M.cam.fov=asp<1?62:46;M.cam.updateProjectionMatrix()}
const s=M.ship;if(s){s.rotation.set(Math.sin(t3*.4)*.05,-.75+Math.sin(t3*.21)*.25,0);s.position.y=Math.sin(t3*.7)*.8;const ud=s.userData;if(ud.body){ud.body.rotation.z=Math.sin(t3*.33)*.16}if(ud.flames)for(const f of ud.flames){f.fl.scale.set(1,1,.55+Math.random()*.25);f.fl.material.opacity=.55;f.gs.scale.setScalar(3.4+Math.random()*.6)}if(ud.nl){const bl=Math.sin(t3*5)>.6;ud.nl.visible=ud.nr.visible=bl}}
if(M.pl){M.pl.rotation.y+=dt*.004;const ud=M.pl.userData;if(ud.cl&&ud.cl.material.uniforms&&ud.cl.material.uniforms.off)ud.cl.material.uniforms.off.value+=dt*.002;if(ud.moons)for(const mo of ud.moons)mo.piv.rotation.y+=mo.sp*dt}
for(const o of M.ast){o.m.rotation.x+=o.sp*dt;o.m.rotation.y+=o.sp*.7*dt;o.m.position.x+=o.v*dt}}
{const _rfM=renderFrame;renderFrame=function(){if(MENU3.on&&MENU3.sc){menu3Anim(DT||.016);if(typeof GRP!='undefined'&&GRP)GRP.uniforms.str.value=0;if(composer&&bloomOn){rpass.scene=MENU3.sc;rpass.camera=MENU3.cam;composer.render();rpass.camera=camera}else R3.render(MENU3.sc,MENU3.cam);return}_rfM()}}
{const _ovM=overlay;overlay=function(){if(MENU3.on){OX.clearRect(0,0,innerWidth,innerHeight);return}_ovM()}}
function menu3Info(){let lv=1;try{lv=lvInfo().L}catch(e){}const sh=typeof HULLS!='undefined'&&HULLS[G.ship]?HULLS[G.ship].n:'';const fresh=!G.xp&&!G.done&&!G.kills;return{fresh,txt:`Pilote niv. ${lv} · ${Math.floor(G.cr).toLocaleString('fr-FR')} ¢${sh?' · '+sh:''}`}}
function menu3Open(){MENU3.on=true;window.XPAUSE=(window.XPAUSE||0)+1;document.body.classList.add('m3');menu3Build();const I=menu3Info(),ver=(document.querySelector('meta[name=sf-build]')||{}).content||'';
const d=document.createElement('div');d.id='menu3';d.innerHTML=`<div class="m3top"><div class="m3logo"><b>STARFARER</b><span>3D</span></div><div class="m3tag">Explore · Commerce · Combats</div></div>
<div class="m3bot">${I.fresh?'':`<div class="m3card">${I.txt}</div>`}<button id="m3play">${I.fresh?'Nouvelle partie':'Continuer'}</button><div class="m3row"><button id="m3opt">Options</button><button id="m3ph">Mode photo</button></div><div class="m3ver">${ver?'Version '+ver.slice(0,4)+'-'+ver.slice(4,6)+'-'+ver.slice(6,8)+' · ':''}starvody.netlify.app</div></div>`;document.body.appendChild(d);
$('m3play').onclick=()=>menu3Close();$('m3opt').onclick=e=>{e.stopPropagation();try{optToggle(true)}catch(x){}};$('m3ph').onclick=()=>{menu3Close(true);setTimeout(()=>photoToggle(true),60)}}
function menu3Close(quick){if(!MENU3.on)return;MENU3.on=false;window.XPAUSE=Math.max(0,(window.XPAUSE||1)-1);try{sessionStorage.setItem('sf-m3','1')}catch(e){}try{optToggle(false)}catch(e){}
const d=$('menu3');if(d){d.classList.add('out');setTimeout(()=>d.remove(),700)}document.body.classList.remove('m3');
if(!quick){FADE.col='4,6,14';FADE.v=1;FADE.tg=0;FADE.sp=1.3;MENU3.fc=1}try{SFX.whoosh()}catch(e){}
if(!G.x.news13)setTimeout(news13,2600);const pl=MENU3.pl;MENU3.sc=null;MENU3.ship=null;MENU3.pl=null;MENU3.ast=[];MENU3.gen=null;if(pl){try{disposeObj(pl)}catch(e){}}}
TICK.push(()=>{if(MENU3.fc&&FADE.v<.01){MENU3.fc=0;if(FADE.tg==0)FADE.col='255,245,230'}});
addEventListener('keydown',e=>{if(MENU3.on&&(e.code=='Enter'||e.code=='Space')&&!(OPTP&&OPTP.open)){e.preventDefault();menu3Close()}},true);
function news13(){if(G.x.news13)return;G.x.news13=1;G.x.news12=1;banner('star','Mise à jour : graphismes !','Menu animé, mode photo ('+(DESK?'touche B':'bouton appareil photo')+'), reflets du soleil, aurores et orages vus de l\'espace, boucliers à hexagones, traînées des réacteurs, canons qui chauffent, ombres, et 3 nouveaux types de planètes : archipels, forêts de cristal, ruines anciennes','#7ab6ff');try{save()}catch(e){}}
if(!menu3Skip())menu3Open();else setTimeout(news13,7000);
