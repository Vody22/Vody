// ===== VAGUE 2 : EXPLORATION (après w1.js) =====
// 11 nébuleuses profondes, 12 système caché (portail d'Ombre), 13 plongée dans les géantes gazeuses, 14 lunes où se poser,
// 15 stations abandonnées hantées, 16 signaux de détresse, 17 cartographie payante, 18 artefacts anciens (collection + bonus),
// 19 vaisseau-mère extraterrestre, 20 galaxie miroir (traverser un trou noir).
const V2={neb:null,nebK:0,nebT:0,jel:[],relT:0,rel:new Map(),hs:new Map(),hsT:0,sig:null,sigT:120,mom:null,gz:null,mirT:0,moonP:new Map(),port:null,hid:null};
const _w2a=new V3(),_w2b=new V3(),_w2c=new V3();
const v2x=()=>G.x;
// textures partagées
const W2T={};function w2Cloud(){if(W2T.cl)return W2T.cl;const c=mkC(256,256),g=c.getContext('2d');for(let i=0;i<60;i++){const x=Math.random()*256,y=Math.random()*256,r=20+Math.random()*60,gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.18)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,256,256)}const t=new THREE.CanvasTexture(c);return W2T.cl=t}

// =============== 18. ARTEFACTS ANCIENS ===============
const ART=[['Masque des Veilleurs','Un visage de pierre noire qui semble suivre ton regard.'],['Clé spirale','Une clé sans serrure, gravée de la même spirale que les ruines.'],['Fragment de coordonnées α','Une plaque de cristal : une suite de nombres pointe vers un endroit introuvable sur les cartes.',1],
['Graine d\'étoile','Une sphère tiède qui pulse au rythme d\'un cœur lent.'],['Lame des Anciens','Aucune trace d\'usure : elle n\'a jamais servi.'],['Fragment de coordonnées β','Le deuxième morceau de la plaque de cristal. Les nombres se complètent.',1],
['Cristal chanteur','Il émet une note pure quand une planète est proche.'],['Carte d\'os','Une carte gravée sur un os immense. Les étoiles y sont à la mauvaise place.'],['Fragment de coordonnées γ','Le dernier morceau : les coordonnées du Système d\'Ombre sont complètes.',1],
['Couronne de givre','Elle ne fond jamais, même près d\'une étoile.'],['Œil de Nyx','Une pierre noire où tournent des milliers de points lumineux.'],['Cœur du Premier vaisseau','Le moteur du tout premier vaisseau, plus vieux que la galaxie connue.']];
const v2Art=()=>GX('v2art',[]);
const v2Frag=()=>v2Art().filter(i=>ART[i]&&ART[i][2]).length;
function v2GiveArt(src){const A=v2Art();const i=ART.findIndex((_,k)=>!A.includes(k));if(i<0){G.cr+=1500;toast('🏺 Artefact en double : vendu 1 500 ¢');return}A.push(i);gainXP(250);G.cr+=400;
banner('gem','Artefact : '+ART[i][0],ART[i][1]+' ('+A.length+'/12)','#c79bff');SFX.disc();try{cxLog('Artefact trouvé : '+ART[i][0])}catch(e){}
if(A.length%4==0)setTimeout(()=>banner('trophy','Collection : '+A.length+' artefacts','Bonus permanent débloqué : '+(A.length==4?'+5 % de dégâts':A.length==8?'+10 % de coque':'+8 % de vitesse'),'#ffc34d'),3500);
if(ART[i][2]&&v2Frag()==3)setTimeout(()=>banner('vortex','Coordonnées complètes','Un portail vers le Système d\'Ombre s\'est ouvert près de la Base Alpha.','#c79bff'),7000);save()}
{const _pm=PM;PM=function(k){let v=_pm(k);const n=(G.x&&Array.isArray(G.x.v2art))?G.x.v2art.length:0;if(k=='dmg'&&n>=4)v*=1.05;else if(k=='hp'&&n>=8)v*=1.1;else if((k=='spd'||k=='boost')&&n>=12)v*=1.08;return v}}
// reliques flottantes : une par secteur choisi, ramassées en passant dessus
const RELG=new THREE.OctahedronGeometry(4,0),RELM=new THREE.MeshStandardMaterial({color:0xc79bff,emissive:0x5a2aa0,metalness:.6,roughness:.25});
function v2RelScan(){const got=GX('v2rel',{}),want=new Set(),sx=Math.floor(S.pos.x/12000),sz=Math.floor(S.pos.z/12000);
for(let i=-1;i<=1;i++)for(let l=-1;l<=1;l++){const a=sx+i,b=sz+l,k=a+','+b;if((a>=-1&&a<=0&&b>=-1&&b<=0)||got[k]||h3(a,0,b,577)>.22)continue;want.add(k);if(V2.rel.has(k))continue;
 const r=rng(a*733+b*1777),p=new V3((a+.15+r()*.7)*12000,(r()-.5)*900,(b+.15+r()*.7)*12000),g=new THREE.Group();g.position.copy(p);const m=new THREE.Mesh(RELG,RELM);g.add(m);
 for(let j=0;j<2;j++){const ring=new THREE.Mesh(new THREE.TorusGeometry(8+j*3,.25,6,40),new THREE.MeshBasicMaterial({color:0xc79bff,transparent:true,opacity:.6,blending:ADDB,depthWrite:false}));ring.rotation.set(Math.random()*3,Math.random()*3,0);g.add(ring)}
 const s=sprite(0xb48cff,60,.8);g.add(s);scene.add(g);V2.rel.set(k,{g,p,k})}
for(const[k,R]of V2.rel)if(!want.has(k)){scene.remove(R.g);V2.rel.delete(k)}}
function v2RelTick(dt){V2.relT-=dt;if(V2.relT<=0){V2.relT=2;v2RelScan()}for(const R of V2.rel.values()){R.g.rotation.y+=dt*.6;R.g.children[1].rotation.x+=dt;R.g.children[2].rotation.y+=dt*1.3;const d=R.p.distanceTo(S.pos);
 if(d<1500&&!R.seen){R.seen=1;toast('🏺 Une relique ancienne brille à proximité')}if(d<35&&!S.dead){GX('v2rel',{})[R.k]=1;scene.remove(R.g);V2.rel.delete(R.k);boom3(R.p,20,0xc79bff,60);v2GiveArt()}}}
svcAdd({o:96,ic:'gem',t:()=>'Collection d\'artefacts ('+v2Art().length+'/12)',show:()=>true,html:()=>{const A=v2Art();return ART.map((a,i)=>`<div class="srow">${A.includes(i)?'🏺 <b>'+esc(a[0])+'</b>':'<span style="opacity:.45">❔ Artefact inconnu</span>'}<span>${A.includes(i)&&a[2]?'coordonnées':''}</span></div>`).join('')+`<div class="hint">Bonus : 4 → +5 % dégâts · 8 → +10 % coque · 12 → +8 % vitesse. Les reliques flottent dans l'espace profond, loin de la Base Alpha.</div>`}});

// =============== 17. CARTOGRAPHIE PAYANTE ===============
function v2CartoList(){const sold=GX('v2cs',{}),L=[];for(const n of G.disc||[])if(!sold['p:'+n])L.push(['p:'+n,150]);try{for(const id in ANK)if(!sold['a:'+id])L.push(['a:'+id,250])}catch(e){}try{for(const id in DERD)if(DERD[id].seen&&!/^brd/.test(id)&&!sold['d:'+id])L.push(['d:'+id,300])}catch(e){}return L}
svcAdd({o:94,ic:'map',t:'Guilde des cartographes',show:()=>true,html:()=>{const L=v2CartoList(),tot=Math.round(L.reduce((a,x)=>a+x[1],0)*(1+.05*Math.max(0,(G.rep&&G.rep.carto||0)/100)));return`<div class="hint">Vends tes relevés : planètes découvertes, anomalies et épaves géantes jamais déclarées.</div>`+(L.length?`<button data-sv="v2carto">Vendre ${L.length} relevé${L.length>1?'s':''} — ${tot.toLocaleString('fr-FR')} ¢</button>`:'<div class="hint">Aucun nouveau relevé à vendre.</div>')}});
SVC.act.v2carto=()=>{const L=v2CartoList();if(!L.length)return;const sold=GX('v2cs',{});let tot=0;for(const[k,v]of L){sold[k]=1;tot+=v}tot=Math.round(tot*(1+.05*Math.max(0,(G.rep&&G.rep.carto||0)/100)));G.cr+=tot;gainXP(Math.round(tot/10));try{addRep('carto',L.length*2)}catch(e){}toast('🗺 Relevés vendus : +'+tot.toLocaleString('fr-FR')+' ¢');SFX.coin();save()};

// =============== 16. SIGNAUX DE DÉTRESSE ===============
const PODG=new THREE.CylinderGeometry(2.2,2.2,8,10);
function v2SigTick(dt){if(mode!='space'||S.docked||S.dead)return;const Sg=V2.sig;
if(!Sg){V2.sigT-=dt;if(V2.sigT>0)return;V2.sigT=150+Math.random()*150;if(en.length>2)return;const a=Math.random()*TAU,p=S.pos.clone().add(new V3(Math.cos(a)*2200,rv(300),Math.sin(a)*2200));
 V2.sig={p,t:0,trap:danger()>=1&&Math.random()<.35,mesh:null};toast('📡 Signal de détresse capté à 2,2 km ! Un marqueur est sur ton écran');try{tone(800,800,.1,'square',.05);tone(800,800,.1,'square',.05,.2);tone(800,800,.1,'square',.05,.4)}catch(e){}return}
Sg.t+=dt;const d=Sg.p.distanceTo(S.pos);if(Sg.t>240||d>9000){if(Sg.mesh)scene.remove(Sg.mesh);V2.sig=null;return}
if(d<1600&&!Sg.mesh){const g=new THREE.Group(),m=new THREE.Mesh(PODG,MAT.metal);m.rotation.z=Math.PI/2;g.add(m);const l=sprite(0xff3a3a,12);l.position.y=3;g.add(l);g.userData.l=l;g.position.copy(Sg.p);scene.add(g);Sg.mesh=g}
if(Sg.mesh){Sg.mesh.rotation.y+=dt*.3;Sg.mesh.userData.l.visible=Math.sin(t*6)>0}
if(d<140&&!Sg.done){Sg.done=1;if(Sg.trap){toast('⚠ C\'était un piège ! Des pirates sortent de l\'ombre');SFX.alarm();for(let i=0;i<3;i++){const e=mkEnemy(i?'pirate':'chasseur',Sg.p.clone().add(new V3(rv(300),rv(100),rv(300))),Math.max(1,danger()));ai3Init(e,'atk');e.ai3.ext=1;en.push(e)}if(Sg.mesh)scene.remove(Sg.mesh);V2.sig=null}
 else{const cr=300+Math.random()*600|0;G.cr+=cr;gainXP(120);try{addRep('alliance',4)}catch(e){}banner('user','Survivants secourus','Tu as recueilli l\'équipage d\'une capsule de survie : +'+cr+' ¢ et la reconnaissance de l\'Alliance.','#7dffb0');SFX.win();if(Math.random()<.15)setTimeout(()=>v2GiveArt(),2000);if(Sg.mesh)scene.remove(Sg.mesh);V2.sig=null}}}

// =============== 15. STATIONS ABANDONNÉES HANTÉES ===============
const HSM=new THREE.MeshStandardMaterial({color:0x2a2e34,metalness:.5,roughness:.8});
function v2HsMesh(seed){const g=new THREE.Group(),r=rng(seed);g.add(new THREE.Mesh(new THREE.TorusGeometry(90,9,10,36),HSM));const hub=new THREE.Mesh(new THREE.CylinderGeometry(22,26,70,14),HSM);hub.rotation.x=Math.PI/2;g.add(hub);
for(let i=0;i<4;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(6,6,70),HSM);s.position.set(Math.cos(i*Math.PI/2)*45,Math.sin(i*Math.PI/2)*45,0);s.lookAt(0,0,0);g.add(s)}
for(let i=0;i<8;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(8+r()*20,3,10+r()*20),HSM);b.position.set(rv(120),rv(120),rv(30));b.rotation.set(rv(3),rv(3),rv(3));g.add(b)}
const lights=[];for(let i=0;i<10;i++){const s=sprite(i%3?0x60ff90:0xff4040,8);const a=r()*TAU;s.position.set(Math.cos(a)*92,Math.sin(a)*92,rv(8));g.add(s);lights.push({s,ph:r()*9})}
const air=new THREE.Object3D();air.position.set(0,0,40);g.add(air);g.userData={lights,air};return g}
function v2HsScan(){const want=new Set(),sx=Math.floor(S.pos.x/12000),sz=Math.floor(S.pos.z/12000);for(let i=-1;i<=1;i++)for(let l=-1;l<=1;l++){const a=sx+i,b=sz+l,k='hs'+a+'_'+b;if((a>=-1&&a<=0&&b>=-1&&b<=0)||h3(a,0,b,613)>.12)continue;want.add(k);if(V2.hs.has(k))continue;
 const r=rng(a*991+b*373),p=new V3((a+.2+r()*.6)*12000,(r()-.5)*700,(b+.2+r()*.6)*12000),seed=(a*7919+b*104729)>>>0,mesh=v2HsMesh(seed);mesh.position.copy(p);mesh.rotation.set(r()*.5,r()*TAU,r()*.5);scene.add(mesh);
 V2.hs.set(k,{id:k,seed:seed%1e6,n:'Poste abandonné '+NA[((a*3+b*7)%10+10)%10]+'-'+(Math.abs(a*13+b*7)%90+10),x:p.x,y:p.y,z:p.z,mesh,v1:1,v2h:1})}
for(const[k,H]of V2.hs)if(!want.has(k)){scene.remove(H.mesh);V2.hs.delete(k)}}
function v2HsTick(dt){V2.hsT-=dt;if(V2.hsT<=0){V2.hsT=2.5;v2HsScan()}for(const H of V2.hs.values()){const u=H.mesh.userData;H.mesh.rotation.z+=dt*.01;for(const L of u.lights)L.s.visible=Math.random()<.97&&Math.sin(t*2+L.ph)>-.2;
 const d=H.mesh.position.distanceTo(S.pos);if(d<3500&&!H.seen){H.seen=1;toast('👻 '+H.n+' : aucun signe de vie… mais les lumières clignotent encore');try{tone(140,60,1.4,'sine',.04)}catch(e){}}
 if(d<260&&S.spd<160&&!S.docked&&!S.dead)DRH.near=H;
 if(d<220){const lp=H.mesh.worldToLocal(_w2a.copy(S.pos));const rr=Math.hypot(lp.x,lp.y);if(Math.abs(rr-90)<14&&Math.abs(lp.z)<14){S.vel.multiplyScalar(-.3);S.spd*=.4;damage(2,'col')}}}}
// fantômes à l'intérieur (station hantée)
const GHT=(()=>{const c=mkC(128,256),g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'rgba(200,240,255,.9)');gr.addColorStop(1,'rgba(200,240,255,0)');g.fillStyle=gr;g.beginPath();g.arc(64,50,30,0,TAU);g.fill();g.beginPath();g.moveTo(30,70);g.quadraticCurveTo(64,40,98,70);g.lineTo(110,256);g.lineTo(18,256);g.closePath();g.fill();g.fillStyle='rgba(0,10,20,.8)';g.beginPath();g.arc(52,48,6,0,TAU);g.arc(76,48,6,0,TAU);g.fill();return new THREE.CanvasTexture(c)})();
const GH={s:null,t:0,cd:6};
function v2Haunt(dt){const q=DER.on&&DER.on.q;if(mode!='int'||!q||!q.v2h){if(GH.s&&GH.s.parent)GH.s.parent.remove(GH.s);return}
if(!GH.s){GH.s=new THREE.Sprite(new THREE.SpriteMaterial({map:GHT,transparent:true,depthWrite:false,blending:ADDB,opacity:0}));GH.s.scale.set(1.4,2.8,1)}
GH.cd-=dt;if(GH.t>0){GH.t-=dt;const k=GH.t/2;GH.s.material.opacity=Math.sin(k*Math.PI)*.55;GH.s.position.y+=dt*.15;if(GH.t<=0&&GH.s.parent)GH.s.parent.remove(GH.s)}
else if(GH.cd<=0){GH.cd=8+Math.random()*12;const a=(DER.yaw||0)+rv(.6),dist=6+Math.random()*5;GH.s.position.set(DER.p.x-Math.sin(a)*dist,DER.p.y+1.2,DER.p.z-Math.cos(a)*dist);DER.scene.add(GH.s);GH.t=2;
 try{noise(1.6,.04,500);tone(320,180,1.8,'sine',.03)}catch(e){}if(!GX('v2ghost',0)){G.x.v2ghost=1;toast('👻 …tu n\'es pas seul ici');try{cxLog('Une apparition dans une station abandonnée')}catch(e){}}}
try{if(typeof DRAMB!='undefined')DRAMB.intensity=Math.random()<.02?.1:(DRAMB.intensity*.95+.05*.45)}catch(e){}}

// =============== 19. VAISSEAU-MÈRE EXTRATERRESTRE ===============
const MOM={x:-31000,y:900,z:27500};
function v2MomBuild(){const g=new THREE.Group(),r=rng(4242),skin=new THREE.MeshStandardMaterial({color:0x163a3a,metalness:.3,roughness:.6,emissive:0x041414}),glow=new THREE.MeshBasicMaterial({color:0x5affd8,transparent:true,opacity:.8,blending:ADDB,depthWrite:false});
const body=new THREE.Mesh(new THREE.SphereGeometry(1,32,20),skin);body.scale.set(260,120,640);g.add(body);
for(let i=0;i<14;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(1,16,10),skin);const a=r()*TAU;s.scale.set(60+r()*80,40+r()*40,90+r()*140);s.position.set(Math.cos(a)*200,rv(80),rv(500));g.add(s)}
for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(330+i*60,6,8,80),glow);ring.rotation.x=Math.PI/2;ring.position.z=-200+i*200;g.add(ring)}
for(let i=0;i<8;i++){const pts=[];const a=r()*TAU;for(let k=0;k<8;k++)pts.push(new V3(Math.cos(a)*(150+k*20)+rv(20),Math.sin(a)*(80+k*14),500+k*90));g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),20,6-i*.4,6),skin))}
for(let i=0;i<60;i++){const s=sprite(i%3?0x5affd8:0xb48cff,18+r()*30);const u=r()*TAU,v=r()*Math.PI;s.position.set(Math.cos(u)*Math.sin(v)*265,Math.cos(v)*125,Math.sin(u)*Math.sin(v)*645);g.add(s)}
g.position.set(MOM.x,MOM.y,MOM.z);g.rotation.y=.7;return g}
function v2MomTick(dt){if(mode!='space'){return}const d=Math.hypot(S.pos.x-MOM.x,S.pos.y-MOM.y,S.pos.z-MOM.z);
if(d<14000&&!V2.mom){V2.mom={g:v2MomBuild(),scan:0};scene.add(V2.mom.g)}else if(d>16000&&V2.mom){scene.remove(V2.mom.g);V2.mom=null;return}if(!V2.mom)return;
const M=V2.mom;M.g.rotation.z+=dt*.004;M.g.position.y=MOM.y+Math.sin(t*.1)*30;for(let i=0;i<3;i++){const ring=M.g.children[15+i];if(ring)ring.rotation.z+=dt*(.05+i*.03)}
if(d<4500&&!GX('v2mom',0)){G.x.v2mom=1;G.cr+=5000;gainXP(1200);banner('vortex','Vaisseau-mère extraterrestre !','Une coque vivante, plus grande qu\'une station. Reste à moins de 1,5 km pour décoder son signal. +5 000 ¢','#5affd8');SFX.disc();try{cxLog('Vaisseau-mère extraterrestre découvert')}catch(e){}
 for(let i=0;i<3;i++)try{const e=mkFoe('xil',_w2a.set(MOM.x+rv(900),MOM.y+rv(200),MOM.z+rv(900)).clone(),Math.max(2,danger()));if(e){if(!e.ai3)ai3Init(e,'patrol');en.push(e)}}catch(e){}}
if(d<1500&&GX('v2mom',0)&&!GX('v2moms',0)){M.scan+=dt;if(M.scan>12){G.x.v2moms=1;toast('📡 Signal extraterrestre décodé !');v2GiveArt()}}}
// carte
{const _mi=mapItems;mapItems=function(){const r=_mi.apply(this,arguments);try{if(Array.isArray(r)){if(GX('v2mom',0))r.push({k:'mom',n:'Vaisseau-mère',x:MOM.x,y:MOM.y,z:MOM.z,c:'#5affd8'});if(v2Frag()>=3)r.push({k:'port',n:'Portail d\'Ombre',x:PORT.x,y:PORT.y,z:PORT.z,c:'#c79bff'})}}catch(e){}return r}}

// =============== 12. SYSTÈME D'OMBRE (caché) ===============
const PORT={x:4200,y:200,z:-3800},HID={x:-188000,y:0,z:166000};
function v2PortMesh(c){const g=new THREE.Group();for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.TorusGeometry(70+i*14,3,8,60),new THREE.MeshBasicMaterial({color:i==1?0xffffff:0xb48cff,transparent:true,opacity:.75,blending:ADDB,depthWrite:false}));g.add(m)}
const s=sprite(c||0x8a5cff,260,.7);g.add(s);const core=new THREE.Mesh(new THREE.CircleGeometry(66,40),new THREE.MeshBasicMaterial({color:0x2a0a50,transparent:true,opacity:.85,side:THREE.DoubleSide}));g.add(core);return g}
function v2HidTick(dt){if(mode!='space')return;
// portail près de la Base Alpha (dès que les 3 fragments sont réunis) et portail de retour au centre du système caché
const P=[];if(v2Frag()>=3)P.push([PORT,HID,'port']);if(GX('v2hid',0))P.push([HID,PORT,'ret']);
if(!V2.ports)V2.ports={};for(const[a,b,k]of P){const d=Math.hypot(S.pos.x-a.x,S.pos.y-a.y,S.pos.z-a.z);let Pm=V2.ports[k];if(d<12000&&!Pm){Pm=V2.ports[k]={g:v2PortMesh(k=='ret'?0xff9a50:0),a,b};Pm.g.position.set(a.x,a.y,a.z);scene.add(Pm.g)}else if(d>14000&&Pm){scene.remove(Pm.g);delete V2.ports[k];continue}
 if(!Pm)continue;Pm.g.children.forEach((c,i)=>{if(i<3){c.rotation.x+=dt*(.3+i*.2);c.rotation.y+=dt*(.2+i*.1)}});Pm.g.lookAt(camera.position);
 if(d<70&&!S.dead&&!JMP.on){FADE.col='60,20,110';FADE.v=1;FADE.tg=0;FADE.sp=.8;S.pos.set(b.x+300,b.y+50,b.z+300);S.vel.set(0,0,0);S.spd=60;for(const e of en)e.mesh.parent&&e.mesh.parent.remove(e.mesh);en.length=0;lastCK='';streamWorld();camInit=true;
  if(k=='port'){if(!GX('v2hid',0)){G.x.v2hid=1;banner('vortex','Le Système d\'Ombre','Un système absent de toutes les cartes. Le Sanctuaire t\'attend au centre.','#c79bff')}else toast('🌀 Système d\'Ombre')}else toast('🌀 De retour près de la Base Alpha');SFX.disc();save()}}
// le système caché : étoile violette, anneau de monolithes (sanctuaire), astéroïdes de cristal, gardiens Xil
const dH=Math.hypot(S.pos.x-HID.x,S.pos.z-HID.z);if(dH<20000&&!V2.hid){const g=new THREE.Group();const star=sprite(0xb070ff,9000,.9);star.position.set(0,2500,-14000);g.add(star);const s2=sprite(0xffffff,2600,.9);s2.position.copy(star.position);g.add(s2);
 const mono=new THREE.MeshStandardMaterial({color:0x0c0a12,metalness:.8,roughness:.2,emissive:0x1a0838});for(let i=0;i<12;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(14,90,5),mono);const a=i/12*TAU;m.position.set(Math.cos(a)*220,0,Math.sin(a)*220);m.lookAt(0,0,0);g.add(m);const gl=sprite(0xc79bff,30,.8);gl.position.set(Math.cos(a)*220,52,Math.sin(a)*220);g.add(gl)}
 const ag=new THREE.IcosahedronGeometry(1,1),am=new THREE.MeshStandardMaterial({color:0x8fdcff,emissive:0x1a4466,metalness:.2,roughness:.2,flatShading:true});const cr=[];for(let i=0;i<70;i++){const m=new THREE.Mesh(ag,am);const a=Math.random()*TAU,R=900+Math.random()*1800;m.position.set(Math.cos(a)*R,rv(300),Math.sin(a)*R);m.scale.setScalar(12+Math.random()*30);g.add(m);cr.push({m,hp:3})}
 g.position.set(HID.x,HID.y,HID.z);scene.add(g);V2.hid={g,cr,guard:0}}else if(dH>24000&&V2.hid){scene.remove(V2.hid.g);V2.hid=null}
if(V2.hid){const H=V2.hid;for(const c of H.cr){if(c.dead)continue;c.m.rotation.y+=dt*.2;const wp=c.m.getWorldPosition(_w2a);if(wp.distanceTo(S.pos)<c.m.scale.x+14&&!S.dead){c.dead=1;H.g.remove(c.m);spawnDrops(wp.clone(),3,'cristal');boom3(wp,14,0x8fdcff,40)}}
 if(dH<600&&!GX('v2sanct',0)){G.x.v2sanct=1;G.cr+=8000;gainXP(3000);banner('star','Sanctuaire des Anciens','Les monolithes s\'illuminent : +8 000 ¢. Les cristaux flottants se récoltent en passant dessus.','#c79bff');SFX.win();save()}
 if(dH<5000&&!H.guard){H.guard=1;for(let i=0;i<4;i++)try{const e=mkFoe('xil',_w2a.set(HID.x+rv(1500),HID.y+rv(300),HID.z+rv(1500)).clone(),4);if(e){if(!e.ai3)ai3Init(e,'patrol');en.push(e)}}catch(e){}}}}

// =============== 11. NÉBULEUSES PROFONDES ===============
function v2NebAt(a,b){if((a>=-1&&a<=0&&b>=-1&&b<=0)||h3(a,0,b,911)>.16)return null;const r=rng(a*389+b*631);return{c:new V3((a+.25+r()*.5)*12000,(r()-.5)*500,(b+.25+r()*.5)*12000),R:2400+r()*900,col:new THREE.Color().setHSL(.55+r()*.35,.7,.55),k:a+','+b}}
function v2NebTick(dt){if(mode!='space'){if(V2.neb){$('w2fog').style.opacity=0}return}V2.nebT-=dt;
if(V2.nebT<=0){V2.nebT=2;const sx=Math.floor(S.pos.x/12000),sz=Math.floor(S.pos.z/12000);let best=null,bd=1e9;for(let i=-1;i<=1;i++)for(let l=-1;l<=1;l++){const N=v2NebAt(sx+i,sz+l);if(!N)continue;const d=N.c.distanceTo(S.pos);if(d<bd){bd=d;best=N}}
 if(best&&bd<16000){if(!V2.neb||V2.neb.k!==best.k){v2NebFree();const g=new THREE.Group();g.position.copy(best.c);const tx=w2Cloud();for(let i=0;i<14;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,color:best.col,transparent:true,opacity:.5,depthWrite:false,blending:ADDB}));s.position.set(rv(best.R*.9),rv(best.R*.4),rv(best.R*.9));s.scale.setScalar(best.R*(.9+Math.random()*.8));g.add(s)}scene.add(g);
  const jel=[];for(let i=0;i<9;i++){const jg=new THREE.Group(),bell=new THREE.Mesh(new THREE.SphereGeometry(6,14,8,0,TAU,0,Math.PI/2),new THREE.MeshBasicMaterial({color:best.col,transparent:true,opacity:.55,blending:ADDB,depthWrite:false}));jg.add(bell);for(let k=0;k<5;k++){const tt=new THREE.Mesh(new THREE.CylinderGeometry(.15,.05,14,4),bell.material);tt.position.set(rv(4),-7,rv(4));jg.add(tt)}const l=sprite(best.col.getHex(),26,.8);jg.add(l);jg.position.copy(best.c).add(new V3(rv(best.R*.6),rv(best.R*.25),rv(best.R*.6)));jg.scale.setScalar(3+Math.random()*3);scene.add(jg);jel.push({g:jg,ph:Math.random()*9,done:false})}
  V2.neb={...best,g,jel,flash:0,scanned:GX('v2jel',{})[best.k]||0}}}else if(V2.neb&&bd>18000)v2NebFree()}
const N=V2.neb;if(!N){$('w2fog').style.opacity=0;return}const d=N.c.distanceTo(S.pos),k=clamp(1-d/N.R,0,1);V2.nebK=k;const fog=$('w2fog');fog.style.opacity=(k*.75).toFixed(3);if(k>0)fog.style.background=`radial-gradient(ellipse at center,rgba(${N.col.r*255|0},${N.col.g*255|0},${N.col.b*255|0},.15),rgba(${N.col.r*160|0},${N.col.g*160|0},${N.col.b*160|0},.85))`;
if(k>.15&&!N.told){N.told=1;toast('🌫 Nébuleuse profonde : radar brouillé, visibilité réduite. Des créatures lumineuses y vivent…')}
// éclairs
if(k>.2&&Math.random()<dt*.35){N.flash=1;try{tone(60,30,1.2,'sawtooth',.05)}catch(e){}if(Math.random()<.25&&!S.dead&&!S.docked)damage(4)}N.flash=Math.max(0,N.flash-dt*3);$('w2flash').style.opacity=(N.flash*.6*k).toFixed(3);
for(const J of N.jel){J.ph+=dt;J.g.position.y+=Math.sin(J.ph*.8)*dt*6;J.g.children[0].scale.y=1+Math.sin(J.ph*2.5)*.18;if(!J.done&&J.g.position.distanceTo(S.pos)<90){J.done=1;N.scanned++;GX('v2jel',{})[N.k]=N.scanned;G.cr+=180;gainXP(60);toast('🪼 Méduse stellaire scannée ('+N.scanned+'/9) : +180 ¢');try{tone(1200,1600,.3,'sine',.04)}catch(e){}if(N.scanned==9)setTimeout(()=>{banner('leaf','Colonie de méduses étudiée','La Guilde des cartographes te verse 1 500 ¢.','#7dffb0');G.cr+=1500},1500)}}}
function v2NebFree(){const N=V2.neb;if(!N)return;scene.remove(N.g);for(const J of N.jel)scene.remove(J.g);V2.neb=null;V2.nebK=0}
// radar brouillé dans la nébuleuse
{const _rd=radar;radar=function(){_rd();if(mode=='space'&&V2.nebK>.3){OX.save();OX.globalAlpha=Math.min(.85,V2.nebK);const W=innerWidth;for(let i=0;i<120;i++){OX.fillStyle=Math.random()<.5?'rgba(180,220,255,.5)':'rgba(10,20,30,.7)';OX.fillRect(W-200+Math.random()*190,innerHeight*.25+Math.random()*190,3,3)}OX.restore()}}}

// =============== 14. LUNES OÙ SE POSER ===============
function v2Moons(){if(mode!='space'||S.entry||S.docked)return;for(const p of planets){if(!p.mesh||!p.mesh.userData.moons)continue;const ms=p.mesh.userData.moons;for(let i=0;i<ms.length;i++){const m=ms[i].piv.children[0];if(!m)continue;const wp=m.getWorldPosition(_w2a),mr=(m.geometry.parameters.radius||40)*(m.scale.x||1);const d=wp.distanceTo(S.pos);
 if(d<mr*1.45+260){const k=p.name+'#'+i;let P=V2.moonP.get(k);if(!P){const hs=[270,50,10,300];P={name:p.name+' — Lune '+['I','II','III'][i],hue:hs[(p.name.length+i)%4],ring:false,v2moon:1};V2.moonP.set(k,P)}P.x=wp.x;P.y=wp.y;P.z=wp.z;P.r=Math.max(120,mr);landP=P;if(!P.told){P.told=1;toast('🌙 '+P.name+' : on peut s\'y poser !')}}}}}

// =============== 13. PLONGÉE DANS UNE GÉANTE GAZEUSE ===============
const GZ={on:false,sc:null,vp:new V3(900000,250000,900000),ret:null,layers:[],gas:[],lt:null,amb:null,flash:0,got:0,cr:0};
function gzBuild(){const sc=new THREE.Scene();sc.background=new THREE.Color(0xe8b47a);sc.fog=new THREE.FogExp2(0xe8b47a,.0009);const amb=new THREE.HemisphereLight(0xffe2b8,0x5a2a10,1.1);sc.add(amb);const lt=new THREE.DirectionalLight(0xffd090,1.2);lt.position.set(1,2,1);sc.add(lt);
const tx=w2Cloud();tx.wrapS=tx.wrapT=THREE.RepeatWrapping;const L=[];for(let k=0;k<12;k++){const m=new THREE.Mesh(new THREE.PlaneGeometry(9000,9000),new THREE.MeshBasicMaterial({map:tx,color:new THREE.Color().setHSL(.07-k*.004,.65,.72-k*.035),transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.material.map=tx.clone();m.material.map.needsUpdate=true;m.material.map.repeat.set(6,6);sc.add(m);L.push({m,y:-k*230})}
Object.assign(GZ,{sc,layers:L,amb,lt})}
function gzEnter(p){if(GZ.on||mode!='space')return;if(!GZ.sc)gzBuild();GZ.ret={p,pos:S.pos.clone(),q:S.q.clone()};GZ.on=true;GZ.got=0;GZ.cr=0;
FADE.col='240,190,120';FADE.v=1;FADE.tg=0;FADE.sp=.9;S.pos.copy(GZ.vp);S.vel.set(0,-20,0);S.spd=60;S.q.setFromEuler(new THREE.Euler(-.35,0,0));scene.remove(ship);GZ.sc.add(ship);GZ.sc.add(SPK.pts,FIRE.pts);
for(const g of GZ.gas)GZ.sc.remove(g.s);GZ.gas=[];for(let i=0;i<40;i++){const depth=150+Math.random()*2300,s=sprite(depth>1500?0x8fe8ff:0xfff0c0,30+depth/60);s.position.set(GZ.vp.x+rv(1600),GZ.vp.y-depth,GZ.vp.z+rv(1600));GZ.sc.add(s);GZ.gas.push({s,depth})}
document.body.classList.add('gzon');toast('🌪 Plongée dans '+p.name+' : récolte l\'hélium-3 (bulles lumineuses). Plus c\'est profond, plus ça rapporte… et plus la pression écrase la coque.');try{noise(2,.06,300)}catch(e){}}
function gzExit(){if(!GZ.on)return;const R=GZ.ret,p=R.p;GZ.on=false;GZ.sc.remove(ship);scene.add(ship);scene.add(SPK.pts,FIRE.pts);document.body.classList.remove('gzon');
const out=new V3(R.pos.x-p.x,R.pos.y-p.y,R.pos.z-p.z).normalize();S.pos.set(p.x,p.y,p.z).addScaledVector(out,p.r*1.6+500);S.q.setFromUnitVectors(new V3(0,0,-1),out);S.vel.set(0,0,0);S.spd=40;FADE.col='240,190,120';FADE.v=1;FADE.tg=0;FADE.sp=1;lastCK='';streamWorld();camInit=true;
if(GZ.got)banner('pad','Récolte terminée',GZ.got+' poches d\'hélium-3 récoltées : +'+GZ.cr.toLocaleString('fr-FR')+' ¢','#ffc34d');save()}
{const _us=updSpace;updSpace=function(dt){if(GZ.on){gzUpdate(dt);return}_us(dt)}}
{const _rf=renderFrame;renderFrame=function(){if(GZ.on&&GZ.sc){R3.render(GZ.sc,camera);return}_rf()}}
function gzUpdate(dt){if(!S.dead)fly(dt);const depth=GZ.vp.y-S.pos.y,pr=1+Math.max(0,depth)/400;
// turbulences et courants
S.vel.y+=Math.sin(t*.7+S.pos.x*.002)*dt*14;if(Math.random()<dt*.6){shake=Math.max(shake,.35)}
for(const L of GZ.layers){L.m.position.set(S.pos.x,GZ.vp.y+L.y,S.pos.z);L.m.material.map.offset.x+=dt*.004*(1+L.y/-1000);}
const k=clamp(depth/2600,0,1);GZ.sc.background.setRGB(.91-.68*k,.7-.62*k,.48-.45*k);GZ.sc.fog.color.copy(GZ.sc.background);GZ.sc.fog.density=.0006+k*.0016;GZ.amb.intensity=1.1-k*.6;
GZ.flash=Math.max(0,GZ.flash-dt*3);if(Math.random()<dt*(.15+k*.5)){GZ.flash=1;try{tone(50,25,1.3,'sawtooth',.06)}catch(e){}if(Math.random()<.2&&!S.dead)damage(3)}GZ.lt.intensity=1.2+GZ.flash*4;
if(depth>1800&&!S.dead){damage(dt*(depth-1800)/45);if(t-(GZ.wT||0)>3){GZ.wT=t;toast('⚠ Pression critique : remonte !')}}
for(const g of GZ.gas){if(g.got)continue;g.s.material.opacity=.7+Math.sin(t*3+g.depth)*.3;if(g.s.position.distanceTo(S.pos)<45){g.got=1;GZ.sc.remove(g.s);const cr=Math.round(40+g.depth*.18);GZ.got++;GZ.cr+=cr;G.cr+=cr;gainXP(8);SFX.pick();toast('💨 Hélium-3 : +'+cr+' ¢')}}
$('gzhud').innerHTML=`Profondeur <b>${Math.max(0,depth|0)} m</b> · Pression <b>${pr.toFixed(1)} bar</b>${depth>1500?' <span style="color:#ff6a4a">⚠</span>':''}<br><small>${GZ.got} poche${GZ.got>1?'s':''} · +${GZ.cr.toLocaleString('fr-FR')} ¢</small>`;
if(depth<-60)gzExit()}
V1XB.push(()=>GZ.on?['gzup','Remonter','takeoff','R']:(mode=='space'&&landP&&landP.ring&&!S.entry&&!S.docked&&!S.dead?['gz','Plonger dans l\'atmosphère','weather','R']:null));
V1ACT.gz=()=>{if(landP&&landP.ring)gzEnter(landP)};V1ACT.gzup=gzExit;
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT'||e.repeat)return;if(e.code=='KeyR'&&(GZ.on||(landP&&landP.ring&&mode=='space'))){if(GZ.on)gzExit();else gzEnter(landP)}});

// =============== 20. GALAXIE MIROIR ===============
function v2MirApply(){const on=!!(G.x&&G.x.v2mir);$('c').style.filter=on?'hue-rotate(180deg) saturate(1.5) contrast(1.08)':'';document.body.classList.toggle('mirror',on)}
{const _mk=mkEnemy;mkEnemy=function(ty,pos,z){const e=_mk(ty,pos,z);if(G.x&&G.x.v2mir){e.hp*=1.6;e.mhp=e.hp;e.rw=Math.round(e.rw*2)}return e}}
function v2MirTick(dt){V2.mirT-=dt;if(mode!='space'||V2.mirT>0||S.dead)return;for(const o of (typeof AN!='undefined'?AN.act.values():[])){if(o.k!='bh')continue;const c=o.mesh.position,d=c.distanceTo(S.pos);if(d<170){V2.mirT=8;G.x.v2mir=!G.x.v2mir;const out=_w2a.copy(S.pos).sub(c).normalize();if(out.lengthSq()<.1)out.set(1,0,0);S.pos.copy(c).addScaledVector(out,3200);S.vel.set(0,0,0);S.spd=80;S.hp=Math.max(S.hp,maxhp()*.5);FADE.col='255,255,255';FADE.v=1;FADE.tg=0;FADE.sp=.6;shake=1.2;v2MirApply();
 if(G.x.v2mir)banner('vortex','Galaxie miroir','Tu as traversé l\'horizon. Ici tout est inversé : ennemis plus coriaces, primes doublées. Repasse dans un trou noir pour revenir.','#ff9a50');else banner('vortex','Retour dans ta galaxie','Les couleurs reprennent leur place.','#7ab6ff');SFX.disc();save();return}}}

// =============== HUD + BOUCLES ===============
document.body.insertAdjacentHTML('beforeend','<div id="w2fog"></div><div id="w2flash"></div><div id="gzhud"></div>');
STICK.push(dt=>{try{v2Moons();v2HsTick(dt);v2MirTick(dt)}catch(e){console.warn(e)}});
TICK.push(dt=>{const rd=Math.min(.1,dt||.016);try{if(mode=='space'&&!GZ.on){v2RelTick(rd);v2SigTick(rd);v2MomTick(rd);v2HidTick(rd)}v2NebTick(rd);v2Haunt(rd)}catch(e){console.warn(e)}if(!V2.mirA){V2.mirA=1;v2MirApply()}});
// signal sur l'écran (marqueur)
{const _ov=overlay;overlay=function(){_ov();try{if(mode=='space'&&V2.sig&&!S.dead&&!GZ.on)edgeMarker(V2.sig.p,'#ff5a5a','Détresse','📡');if(mode=='space'&&!GZ.on)for(const R of V2.rel.values())if(R.seen&&R.p.distanceTo(S.pos)<4000)edgeMarker(R.p,'#c79bff','Relique','🏺')}catch(e){}}}

// pas de changement de zone multijoueur pendant une plongée (position virtuelle)
{const _nz=netZone;netZone=function(){if(GZ.on)return null;return _nz()}}
