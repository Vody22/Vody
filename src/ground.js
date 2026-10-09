// ===== SUR LES PLANÈTES : sortir du vaisseau, marcher, avant-postes, marchands, PNJ, filons de minerai =====
const FOOT={on:false,pos:new V3(),vel:new V3(),vy:0,yaw:0,cy:0,cp:.18,ph:0,fuel:1,sp:new V3(),sq:new QT(),model:null,grounded:true,tcd:0,drag:null,lastLook:0,mineT:null,beam:null,talk:null};
const OPN={ty:null};let GR=null; // GR : contenu de la planète courante (avant-poste, PNJ, filons…)
// ----- astronaute (joueur et PNJ) : voir chars.js -----
function buildAstro(suit,acc,tool){return buildHuman({suit,acc,tool,closed:false})}
function animAstro(m,ph,spd,air,aim){animHuman(m,ph,spd,air,aim,0,null)}
// ----- textures de l'avant-poste -----
const PADT=(()=>{const c=mkC(256),g=c.getContext('2d');g.fillStyle='#2a2e34';g.fillRect(0,0,256,256);for(let i=0;i<300;i++){g.fillStyle=`rgba(255,255,255,${Math.random()*.04})`;g.fillRect(Math.random()*256,Math.random()*256,2+Math.random()*10,2)}
g.strokeStyle='#ffc41a';g.lineWidth=10;g.beginPath();g.arc(128,128,112,0,TAU);g.stroke();g.lineWidth=4;g.beginPath();g.arc(128,128,82,0,TAU);g.stroke();g.fillStyle='#f2f2f2';g.font='900 120px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('H',128,134);
for(let i=0;i<24;i++){if(i%2)continue;const a=i/24*TAU;g.fillStyle='#ffc41a';g.save();g.translate(128,128);g.rotate(a);g.fillRect(118,-6,10,12);g.restore()}const t=new THREE.CanvasTexture(c);return t})();
function signTex(txt,col='#ffd257'){const c=mkC(256,64),g=c.getContext('2d');g.fillStyle='rgba(6,14,26,.9)';g.fillRect(0,0,256,64);g.strokeStyle=col;g.lineWidth=3;g.strokeRect(3,3,250,58);g.fillStyle=col;g.font='800 30px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,128,34);return new THREE.CanvasTexture(c)}
// ----- PNJ -----
const ROLES=[{r:'Marchande',k:'merchant',n:['Yara','Tess','Mila','Noor'],suit:0xd9a632,acc:0x6b3fa0,merchant:1,lines:['Bienvenue ! Minerais, cristaux, marchandises… je rachète tout.','Le titane se vend bien chez les industriels.','Approche, approche, mes prix sont les meilleurs de la planète !']},
{r:'Mécanicien',k:'mechanic',n:['Bolt','Rivet','Gus','Kaï'],suit:0x5a6a7a,acc:0xff8a2a,repair:1,lines:['Ton vaisseau a besoin d\'un coup de clé ? C\'est fait, offert par la maison.','J\'ai réparé ta coque et rechargé ton bouclier.','Évite les geysers, ils grillent les réacteurs.']},
{r:'Mineuse',k:'miner',n:['Zara','Inès','Riko','Sol'],suit:0xc8643a,acc:0x2a2f36,lines:['Les filons qui brillent cachent les meilleurs minerais.','Tire sur un filon ou utilise ton outil de minage : touche FEU tout près.','Le laser de ton vaisseau mine deux fois plus vite.']},
{r:'Garde',k:'guard',n:['Kessel','Brann','Vex','Orik'],suit:0x2d4a6e,acc:0xff3a3a,lines:['Des tourelles pirates rôdent dans le coin. Reste sur tes gardes.','Les tourelles rouges, c\'est les pirates. Détruis-les sans hésiter.','L\'avant-poste est sûr, tant que je suis là.']},
{r:'Scientifique',k:'scientist',n:['Ilo','Dr Vance','Ama','Theo'],suit:0xf0f4f8,acc:0x3fa8ff,lines:['Les artefacts dorés valent une fortune. Il y en a sûrement près des ruines.','Ce monde a une atmosphère fascinante… pense à ton casque.','Les cristaux d\'énergie alimentent tous nos boucliers.']},
{r:'Voyageur extraterrestre',k:'alien',n:['Zorg','Kliik','Ühm','Xa-Lo'],suit:0x6fd08a,acc:0xb070ff,skin:0x6fd08a,robe:0x2a4a8a,glow:0xb070ff,lines:['Zorg vient d\'une étoile que tes cartes ne montrent pas. Bienvenue, petit humain.','Les monolithes chantent pour ceux qui savent écouter.','Vos vaisseaux sont si… bruyants. Charmant.']}];
const gAt=(x,z)=>{let y=GR.h(x,z);if(GR.pad&&Math.hypot(x-GR.pad.x,z-GR.pad.z)<24)y=Math.max(y,GR.pad.y);return y};
const SKINS=[0xf1c8a8,0xd9a07a,0xa86a48,0x6e4630,0xe8b896],HAIRS=[0x2a1810,0x5a3a20,0x101010,0xc89048,0x803020];
function mkNpc(role,x,z,rr,fixed){const R=ROLES[role],m=buildHuman({role:R.k,suit:R.suit,acc:R.acc,skin:R.skin||SKINS[rr()*5|0],hair:HAIRS[rr()*5|0],helmet:R.k=='miner'||R.k=='guard',closed:R.k=='guard',visor:R.k=='guard'?0x502020:undefined,robe:R.robe,glow:R.glow});m.position.set(x,GR.h(x,z),z);GR.sc.add(m);const n={m,pos:m.position,role,R,name:R.n[rr()*R.n.length|0],home:new V3(x,0,z),tg:null,wait:rr()*3,ph:rr()*9,fixed,yaw:rr()*TAU,say:null,sayT:0,li:0};GR.npcs.push(n);return n}
// ----- construction de l'avant-poste et des filons à l'arrivée sur une planète -----
const MINS_BY={Volcanique:['or','fer'],Glacée:['cristal','titane'],Désertique:['titane','fer','or'],Cristalline:['cristal','cristal','titane'],Jungle:['fer','titane'],Océanique:['fer','titane','cristal']};
SURF.onEnter=function(F,sc){const rr=rng(seedOf(F.p.x,F.p.y,F.p.z,31));GR={sc,h:F.h,F,npcs:[],deps:[],col:[],lights:[],op:null,st:null,lastLabel:''};FOOT.on=false;
const O=F.op;if(O){const ox=O.x,oz=O.z,oy=F.h(ox,oz);GR.op={x:ox,y:oy,z:oz};const metal=new THREE.MeshStandardMaterial({color:0x8a939e,metalness:.7,roughness:.35}),dark=new THREE.MeshStandardMaterial({color:0x3a414a,metalness:.6,roughness:.5}),white=new THREE.MeshStandardMaterial({color:0xdfe5ea,metalness:.3,roughness:.45}),
win=new THREE.MeshStandardMaterial({color:0xb8c2d0,metalness:.5,roughness:.3,emissive:0xffffff,emissiveMap:WINT,emissiveIntensity:.9,map:WINT}),orange=new THREE.MeshStandardMaterial({color:0xff8a2a,metalness:.3,roughness:.5});
const add=(geo,m,x,y,z,ry=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(ox+x,oy+y,oz+z);o.rotation.y=ry;o.castShadow=o.receiveShadow=DESK;sc.add(o);return o},col=(x,z,r)=>GR.col.push({x:ox+x,z:oz+z,r});
// piste d'atterrissage
add(new THREE.CylinderGeometry(25,26.5,1.6,6),dark,0,.4,0);const top=add(new THREE.CylinderGeometry(24,24,.2,48),new THREE.MeshStandardMaterial({map:PADT,metalness:.4,roughness:.6}),0,1.3,0);top.rotation.y=Math.PI/6;
for(let i=0;i<12;i++){const a=i/12*TAU,s=sprite(i%2?0xffc41a:0x60ff90,2.6);s.position.set(ox+Math.cos(a)*24.6,oy+1.8,oz+Math.sin(a)*24.6);sc.add(s);GR.lights.push({s,ph:i*.5})}GR.pad={x:ox,y:oy+1.4,z:oz,r:23};
// tour de contrôle
add(new THREE.CylinderGeometry(4,5.5,26,12),white,-40,13,-32);add(new THREE.CylinderGeometry(8.5,7,6,16),win,-40,28,-32);add(new THREE.CylinderGeometry(9,9,.8,16),dark,-40,31.4,-32);add(new THREE.CylinderGeometry(.25,.25,9,6),metal,-40,36,-32);
{const b=sprite(0xff3030,5);b.position.set(ox-40,oy+40.5,oz-32);sc.add(b);GR.lights.push({s:b,ph:0,blink:1})}col(-40,-32,7);
// hangar
add(new THREE.BoxGeometry(30,10,24),white,-52,5,26,.3);const roof=add(new THREE.CylinderGeometry(12,12,30,20,1,false,0,Math.PI),metal,-52,10,26,.3);roof.rotation.set(0,.3+Math.PI/2,Math.PI/2);roof.rotation.order='YXZ';roof.rotation.set(0,.3,Math.PI/2);
add(new THREE.BoxGeometry(18,8,.6),dark,-52+Math.sin(.3)*12.2,4.5,26+Math.cos(.3)*12.2,.3);col(-56,22,11);col(-48,30,11);
// dômes habitables
for(const[x,z,r]of[[42,-38,11],[63,-14,7.5],[24,-62,6.5]]){const d=add(new THREE.SphereGeometry(r,24,12,0,TAU,0,Math.PI/2),white,x,0,z);add(new THREE.CylinderGeometry(r*1.01,r*1.01,r*.22,24,1,true),win,x,r*.28,z);add(new THREE.BoxGeometry(r*.5,r*.55,r*.45),dark,x-r*.95,r*.27,z);col(x,z,r+.6)}
// réservoirs, antenne, panneaux solaires
for(const[x,z]of[[-8,-58],[2,-62],[12,-58]]){add(new THREE.CylinderGeometry(3,3,9,14),orange,x,4.5,z);add(new THREE.SphereGeometry(3,14,8,0,TAU,0,Math.PI/2),orange,x,9,z);col(x,z,3.4)}
add(new THREE.CylinderGeometry(.6,.9,14,8),metal,66,7,40);{const dsh=add(new THREE.SphereGeometry(7,20,10,0,TAU,0,Math.PI*.32),white,66,15,40);dsh.rotation.x=-.9;dsh.material=white}col(66,40,2);
for(let i=0;i<4;i++){add(new THREE.BoxGeometry(9,.3,5),new THREE.MeshStandardMaterial({map:SOLT,color:0xffffff,metalness:.5,roughness:.25,emissive:0x0a1a40}),-80+i*10,3.4,-6).rotation.x=-.5;add(new THREE.CylinderGeometry(.25,.25,3.4,6),metal,-80+i*10,1.7,-6)}
// lampadaires
for(let i=0;i<8;i++){const a=i/8*TAU+.2,x=Math.cos(a)*84,z=Math.sin(a)*84;add(new THREE.CylinderGeometry(.25,.35,8,6),metal,x,4,z);const l=sprite(0xffe2a0,6);l.position.set(ox+x,oy+8.4,oz+z);sc.add(l)}
// échoppe du marchand
const mx=36,mz=30;add(new THREE.BoxGeometry(8,1.2,2.4),dark,mx,.6,mz);add(new THREE.BoxGeometry(8.4,.16,2.8),metal,mx,1.25,mz);for(const s of[-1,1])add(new THREE.CylinderGeometry(.12,.12,4,6),metal,mx+s*3.9,2,mz-1.2);
const aw=add(new THREE.BoxGeometry(9,.16,4.4),new THREE.MeshStandardMaterial({color:0x6b3fa0,roughness:.6}),mx,4.1,mz+.4);aw.rotation.x=-.18;
for(let i=0;i<5;i++)add(new THREE.BoxGeometry(1.4,1.4,1.4),new THREE.MeshStandardMaterial({color:i%2?0x8a6a3a:0x5a6a3a,roughness:.8,map:HULLT}),mx-3+i*1.5,.7+(i==2?1.4:0),mz+3.6+rr()*.6);
const sg=new THREE.Mesh(new THREE.PlaneGeometry(6,1.5),new THREE.MeshBasicMaterial({map:signTex('MARCHÉ'),transparent:true}));sg.position.set(ox+mx,oy+5.3,oz+mz-1.6);sg.rotation.y=Math.PI;sc.add(sg);col(mx,mz+1,4.4);
const sg2=new THREE.Mesh(new THREE.PlaneGeometry(10,2.5),new THREE.MeshBasicMaterial({map:signTex('AVANT-POSTE','#7fdcff'),transparent:true,side:THREE.DoubleSide}));sg2.position.set(ox-40,oy+24,oz-26);sc.add(sg2);
// station au sol (services) et PNJ
const ECONS={Volcanique:'Minière',Désertique:'Minière',Jungle:'Agricole',Océanique:'Agricole',Cristalline:'High-tech',Glacée:'Industrielle'};
GR.st={n:'Avant-poste '+F.p.name,ground:true,x:F.p.x+7,y:F.p.y,z:F.p.z,econ:ECONS[F.ty]||'Industrielle'};
GR.merchant=mkNpc(0,ox+mx,oz+mz+1.9,rr,true);GR.merchant.yaw=0;
const walk=[[20,-20],[-25,-14],[-30,10],[30,-10],[10,50],[-14,-46],[48,8],[0,40]];for(let i=1;i<=5;i++){const w=walk[(i*3)%walk.length];const n=mkNpc(i,ox+w[0],oz+w[1],rr,false);n.path=walk.map(q=>new V3(ox+q[0],0,oz+q[1]))}}
// filons de minerai autour
const mins=MINS_BY[F.ty]||['fer','titane'],cx=O?O.x:0,cz=O?O.z:0;for(let i=0;i<16;i++){let x=0,z=0,ok=false;for(let k=0;k<20&&!ok;k++){const a=rr()*TAU,d=(i<6?140:200)+rr()*(i<6?220:900);x=cx+Math.cos(a)*d;z=cz+Math.sin(a)*d;ok=F.h(x,z)>3&&Math.abs(x)<F.HALF*.85&&Math.abs(z)<F.HALF*.85}if(!ok)continue;mkDeposit(x,z,mins[rr()*mins.length|0],rr)}};
function mkDeposit(x,z,min,rr){const y=GR.h(x,z),g=new THREE.Group();g.position.set(x,y,z);const c=MINC[min],rm=new THREE.MeshStandardMaterial({color:0x5a5650,roughness:.95,flatShading:true}),cm=new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:.55,metalness:.3,roughness:.2});
for(let k=0;k<4;k++){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(1.4+rr()*1.4,0),rm);r.position.set(rv(2.2),.6,rv(2.2));r.rotation.set(rr()*3,rr()*3,0);r.castShadow=DESK;g.add(r)}
for(let k=0;k<5;k++){const s=new THREE.Mesh(new THREE.OctahedronGeometry(.6+rr()*.7,0),cm);s.position.set(rv(1.8),1.2+rr()*1.4,rv(1.8));s.scale.y=1.8;s.rotation.set(rv(.5),rr()*3,rv(.5));g.add(s)}
const gl=sprite(c,9,.55);gl.position.y=2;g.add(gl);GR.sc.add(g);const D={g,pos:new V3(x,y+2,z),min,hp:7,mhp:7,r:4.5,max:1200,cone:.25,w:.8,isDep:1};D.hit=(d,p)=>depHit(D,d,p);GR.deps.push(D)}
function depHit(D,d,p){if(D.dead)return;D.hp-=d;const c=new THREE.Color(MINC[D.min]);for(let i=0;i<6;i++){const v=new V3(rv(1),Math.random(),rv(1)).normalize().multiplyScalar(20+Math.random()*30);SPK.emit(p.x,p.y,p.z,v.x,v.y,v.z,.45,c.r,c.g,c.b,.35)}SFX.mineTick();D.g.scale.setScalar(.75+.25*Math.max(0,D.hp/D.mhp));
if(D.hp<=0){D.dead=1;boom3(D.pos,22,MINC[D.min],50);SFX.rock();spawnDrops(D.pos.clone().add(new V3(0,1,0)),4+(Math.random()*3|0),D.min);GR.sc.remove(D.g);GR.deps=GR.deps.filter(q=>q!==D)}}
SURF.extra=()=>GR?GR.deps:[];
SURF.onExit=function(){if(FOOT.on)footLeave(true);GR=null;S.docked=null};
SURF.radar=blip=>{if(!GR)return;if(GR.op)blip(GR.op,'#ffc845',3.4,true);for(const D of GR.deps)blip(D.pos,'#'+MINC[D.min].toString(16).padStart(6,'0'),1.8);for(const n of GR.npcs)blip(n.pos,'#7f9',1.4);if(FOOT.on)blip(FOOT.sp,'#9fd8ff',2.6,true)};
// ----- à chaque image (surface) : PNJ, lumières, piste d'atterrissage -----
SURF.tick=function(dt,F){if(!GR)return;for(const L of GR.lights)L.s.visible=L.blink?Math.sin(t*3)>0:Math.sin(t*4+L.ph)>-.2;
for(const D of GR.deps)D.g.children[D.g.children.length-1].scale.setScalar(8+Math.sin(t*3+D.pos.x)*1.5);
const me=FOOT.on?FOOT.pos:S.pos;for(const n of GR.npcs){const near=n.pos.distanceTo(me)<7;if(!n.fixed&&!near){n.wait-=dt;if(n.wait<=0){if(!n.tg)n.tg=n.path[Math.random()*n.path.length|0].clone();const dx=n.tg.x-n.pos.x,dz=n.tg.z-n.pos.z,d=Math.hypot(dx,dz);if(d<1.5){n.tg=null;n.wait=2+Math.random()*4}else{const sp=2.2;n.pos.x+=dx/d*sp*dt;n.pos.z+=dz/d*sp*dt;n.yaw=Math.atan2(-dx,-dz);n.ph+=dt*sp*1.6}}}
if(near){n.yaw=Math.atan2(-(me.x-n.pos.x),-(me.z-n.pos.z))}n.pos.y=gAt(n.pos.x,n.pos.z);n.m.rotation.y=lerp(n.m.rotation.y,n.yaw,damp(6,dt));{let lk=null;if(near){lk=Math.atan2(-(me.x-n.pos.x),-(me.z-n.pos.z))-n.m.rotation.y;lk=Math.atan2(Math.sin(lk),Math.cos(lk))}animHuman(n.m,n.ph,!n.fixed&&!near&&n.wait<=0?2.2:0,false,false,n.sayT,lk)}if(n.sayT>0)n.sayT-=dt}
// le vaisseau se pose sur la piste → services de station
if(GR.pad&&!FOOT.on&&!S.ascent&&!S.dead){const P=GR.pad,dxz=Math.hypot(S.pos.x-P.x,S.pos.z-P.z);if(S.padLeave&&dxz>45)S.padLeave=0;
if(!S.docked&&!S.padLeave&&dxz<22&&S.pos.y-P.y<18&&S.spd<70)groundDock(GR.st,false);
if(S.docked&&S.docked.ground&&!S.docked.foot){S.pos.x=lerp(S.pos.x,P.x,damp(3,dt));S.pos.z=lerp(S.pos.z,P.z,damp(3,dt));S.pos.y=lerp(S.pos.y,P.y+4.4,damp(4,dt));S.vel.set(0,0,0);S.spd=0}}
if(S.docked&&S.docked.foot&&(!FOOT.on||FOOT.pos.distanceTo(GR.merchant.pos)>9))S.docked=null;if(S.docked&&document.pointerLockElement)try{document.exitPointerLock()}catch(e){}
// boutons en mode à pied
const lab=FOOT.on?'f':'s';if(GR.lastLabel!==lab){GR.lastLabel=lab;$('fire').textContent=FOOT.on?'OUTIL':'FEU';$('boost').textContent=FOOT.on?'SAUT':'BOOST';$('brake').textContent=FOOT.on?'COURSE':'FREIN';document.body.classList.toggle('foot',FOOT.on)}
const cx=canExit();setD('footb',cx?'block':'none');if(cx&&!GR.hinted){GR.hinted=1;toast('🚶 Tu es assez bas : appuie sur SORTIR'+(DESK?' (F)':'')+' pour marcher sur la planète')}};
function groundDock(st,foot){S.docked=foot?{...st,foot:true}:st;armed=0;const sp=S.pos.clone(),F=GR.F;S.pos.set(F.p.x,F.p.y,F.p.z);offer=G.m?null:makeOffer();S.pos.copy(sp);if(S.ore>0){G.cr+=S.ore*12;toast(st.n+' · minerai vendu +'+S.ore*12+' ¢');S.ore=0;SFX.coin()}else toast(foot?'🛒 '+st.n+' — marché':'🛬 Posé sur la piste — '+st.n);if(foot)TAB='market';SFX.buy();save()}
function padLeave(){S.docked=null;S.padLeave=1;S.pos.y+=6;S.spd=30;fwd();S.vel.copy(_f).multiplyScalar(30);SFX.buy()}
// ----- sortir du vaisseau / y remonter -----
function canExit(){if(mode!='surf'||FOOT.on||S.dead||S.ascent||S.entry||!GR)return false;const g=GR.h(S.pos.x,S.pos.z);return S.pos.y-Math.max(0,g)<34&&S.spd<85}
function footEnter(){if(!canExit())return;const g=GR.h(S.pos.x,S.pos.z);if(g<0){toast('Impossible de sortir au-dessus du liquide — pose-toi sur la terre ferme');return}
const P=GR.pad,onPad=P&&Math.hypot(S.pos.x-P.x,S.pos.z-P.z)<23;if(S.docked&&!S.docked.foot)S.docked=null;fwd();const yaw=Math.atan2(-_f.x,-_f.z);FOOT.sq.setFromEuler(new THREE.Euler(0,yaw,0));FOOT.sp.set(S.pos.x,(onPad?P.y:g)+4.4,S.pos.z);
const side=new V3(Math.cos(yaw),0,-Math.sin(yaw));FOOT.pos.copy(FOOT.sp).addScaledVector(side,8);FOOT.pos.y=GR.h(FOOT.pos.x,FOOT.pos.z);if(onPad)FOOT.pos.y=Math.max(FOOT.pos.y,P.y);FOOT.vel.set(0,0,0);FOOT.vy=0;FOOT.yaw=yaw;FOOT.cy=yaw;FOOT.cp=.18;FOOT.fuel=1;
if(!FOOT.model){FOOT.model=buildHuman({suit:new THREE.Color().setHSL(((typeof MP!='undefined'?MP.hue:200))/360,.3,.78).getHex(),acc:0xff8a2a,tool:true,skin:0xe0b090,closed:false})}if(FOOT.model.parent!==GR.sc)GR.sc.add(FOOT.model);FOOT.model.visible=true;
FOOT.on=true;S.spd=0;S.vel.set(0,0,0);S.thr=0;clearWeapons();camInit=true;SFX.buy();tone(300,180,.25,'sine',.08);toast('🚶 Tu marches sur '+GR.F.p.name+' — '+(DESK?'ZQSD pour marcher, clic pour viser, E pour interagir':'joystick pour marcher, glisse à droite pour regarder'))}
function footLeave(silent){if(!FOOT.on)return;FOOT.on=false;if(FOOT.model)FOOT.model.visible=false;hideBeam(FOOT.beam);if(S.docked&&S.docked.foot)S.docked=null;if(!silent){S.pos.copy(FOOT.sp);S.q.copy(FOOT.sq);S.vel.set(0,0,0);S.spd=0;camInit=true;SFX.buy();toast('🚀 À bord — prêt à décoller')}try{if(document.pointerLockElement)document.exitPointerLock()}catch(e){}}
// ----- déplacement à pied -----
const _g1=new V3(),_g2=new V3(),_g3=new V3();
function footUpdate(dt,F){const P=FOOT.pos;let ix=0,iz=0;if(stick&&Math.hypot(stick.x,stick.y)>.1){ix=stick.x;iz=-stick.y}ix+=(K.KeyD|K.ArrowRight|0)-(K.KeyA|K.ArrowLeft|0);iz+=(K.KeyW|K.ArrowUp|0)-(K.KeyS|K.ArrowDown|0);const il=Math.hypot(ix,iz);if(il>1){ix/=il;iz/=il}
if(DESK&&!document.pointerLockElement&&MS.in&&Math.abs(MS.x)>.2)FOOT.cy-=(MS.x-Math.sign(MS.x)*.2)*1.8*dt;
const fw=_g1.set(-Math.sin(FOOT.cy),0,-Math.cos(FOOT.cy)),rt=_g2.set(Math.cos(FOOT.cy),0,-Math.sin(FOOT.cy)),run=B.brake||K.ShiftLeft||K.ShiftRight,sp=(run?12:6.5)*(F.onLiq?.5:1);
const want=_g3.copy(fw).multiplyScalar(iz).addScaledVector(rt,ix).multiplyScalar(sp);FOOT.vel.x=lerp(FOOT.vel.x,want.x,damp(FOOT.grounded?10:2.5,dt));FOOT.vel.z=lerp(FOOT.vel.z,want.z,damp(FOOT.grounded?10:2.5,dt));
const hs=Math.hypot(FOOT.vel.x,FOOT.vel.z);if(hs>.5){const ty=Math.atan2(-FOOT.vel.x,-FOOT.vel.z);let d=ty-FOOT.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));FOOT.yaw+=d*damp(10,dt);if(!FOOT.drag&&!document.pointerLockElement&&!DESK&&t-FOOT.lastLook>1.2){let e=FOOT.yaw-FOOT.cy;e=Math.atan2(Math.sin(e),Math.cos(e));FOOT.cy+=e*damp(1.2,dt)*Math.min(1,hs/6)}}
if(isFire())FOOT.yaw=FOOT.cy;
// saut + jetpack
const jump=B.boost||K.Space;if(FOOT.grounded){FOOT.fuel=Math.min(1,FOOT.fuel+dt*.5);if(jump&&!FOOT.jl){FOOT.vy=8.5;FOOT.grounded=false;tone(200,320,.12,'sine',.05)}}else if(jump&&FOOT.fuel>0&&FOOT.vy<6){FOOT.vy+=34*dt;FOOT.fuel-=dt*.4;if(Math.random()<.6){const b=_g3.copy(P).add(_g1.set(Math.sin(FOOT.yaw)*.3,1.1,Math.cos(FOOT.yaw)*.3));FIRE.emit(b.x,b.y,b.z,rv(2),-12,rv(2),.25,.6,.75,1,.18)}}FOOT.jl=jump;
FOOT.vy-=20*dt;P.x+=FOOT.vel.x*dt;P.z+=FOOT.vel.z*dt;P.y+=FOOT.vy*dt;
for(const c of GR.col){const dx=P.x-c.x,dz=P.z-c.z,d=Math.hypot(dx,dz);if(d<c.r+.5&&d>.01){P.x=c.x+dx/d*(c.r+.5);P.z=c.z+dz/d*(c.r+.5)}}
const sd=FOOT.sp,dsx=P.x-sd.x,dsz=P.z-sd.z,dss=Math.hypot(dsx,dsz);if(dss<5.5&&dss>.01){P.x=sd.x+dsx/dss*5.5;P.z=sd.z+dsz/dss*5.5}
const lim=F.HALF*.9;P.x=clamp(P.x,-lim,lim);P.z=clamp(P.z,-lim,lim);
let gnd=F.h(P.x,P.z);if(GR.pad&&Math.hypot(P.x-GR.pad.x,P.z-GR.pad.z)<24)gnd=Math.max(gnd,GR.pad.y);const liq=gnd<0;if(liq)gnd=Math.max(gnd,-1.4);
if(P.y<=gnd){P.y=gnd;if(FOOT.vy<-16)damage((-FOOT.vy-16)*.8,'col');FOOT.vy=0;FOOT.grounded=true}else if(P.y>gnd+.05)FOOT.grounded=false;
F.onLiq=liq&&P.y<1;if(F.onLiq&&F.ty=='Volcanique'){damage(14*dt);if(Math.random()<dt*8)FIRE.emit(P.x,P.y+.5,P.z,rv(3),8,rv(3),.5,1,.5,.1,.4)}
FOOT.ph+=dt*hs*1.25;const m=FOOT.model;m.position.copy(P);m.rotation.y=FOOT.yaw;animAstro(m,FOOT.ph,hs,!FOOT.grounded,isFire());m.visible=!COCKPIT;
// l'état du vaisseau suit le pilote (radar, multijoueur, ramassage des cristaux, tirs des tourelles)
S.pos.set(P.x,P.y+1,P.z);S.q.setFromEuler(new THREE.Euler(0,FOOT.yaw,0));S.vel.set(FOOT.vel.x,FOOT.vy,FOOT.vel.z);S.spd=hs;S.thr=0;
if(K.KeyF&&!FOOT.kf&&nearShip())footLeave();FOOT.kf=K.KeyF}
const nearShip=()=>FOOT.on&&FOOT.pos.distanceTo(_g3.copy(FOOT.sp).setY(FOOT.pos.y))<11;
function nearNpc(){if(!GR)return null;let b=null,bd=5.5;for(const n of GR.npcs){const d=n.pos.distanceTo(FOOT.pos);if(d<bd){bd=d;b=n}}return b}
function nearDep(){if(!GR)return null;let b=null,bd=9;for(const D of GR.deps){const d=Math.hypot(D.pos.x-FOOT.pos.x,D.pos.z-FOOT.pos.z);if(d<bd){bd=d;b=D}}return b}
function nearInter(){if(!GR||!GR.inter)return null;let b=null,bd=1e9;for(const I of GR.inter){if(I.done)continue;const d=Math.hypot(I.pos.x-FOOT.pos.x,I.pos.z-FOOT.pos.z);if(d<I.r&&d<bd&&Math.abs(I.pos.y-FOOT.pos.y)<6){bd=d;b=I}}return b}
function footPrompt(){if(nearShip())return'🚀 REMONTER À BORD';const n=nearNpc();if(n)return(n.R.merchant?'🛒 MARCHAND':n.quest?'❗ QUÊTE':'💬 PARLER')+' · '+n.name;const I=nearInter();if(I)return I.label();const D=nearDep();if(D)return'⛏ MINER (maintiens '+(DESK?'le clic':'OUTIL')+')';return''}
function footAction(){if(nearShip()){footLeave();return}const n=nearNpc();if(n){talk(n);return}const I=nearInter();if(I){I.act();SFX.tick()}}
function talk(n){if(n.quest){questTalk(n);return}const L=n.R.lines;n.say=L[n.li++%L.length];n.sayT=4.5;SFX.tick();tone(520+n.role*60,640+n.role*60,.08,'triangle',.05);
if(n.R.merchant)groundDock(GR.st,true);if(n.R.repair){S.hp=maxhp();S.sh=PM('sh');SFX.win()}}
// ----- outil : rayon de minage près d'un filon, sinon pistolet blaster -----
function footTool(dt,TG){FOOT.tcd-=dt;const D=nearDep(),fire=isFire()&&!S.docked;const hand=FOOT.model.userData.tool;
if(fire&&D){const o=hand.getWorldPosition(_g1);if(!FOOT.beam)FOOT.beam=mkBeam(0x5ff0ff);placeBeam(FOOT.beam,o,D.pos,.22,true);FOOT.yaw=Math.atan2(-(D.pos.x-FOOT.pos.x),-(D.pos.z-FOOT.pos.z));FOOT.cy=lerp(FOOT.cy,FOOT.yaw,damp(4,dt));FOOT.mc=(FOOT.mc||0)+dt;if(FOOT.mc>.2){D.hit(.8,D.pos.clone().add(_g2.set(rv(1.5),rv(1),rv(1.5))));FOOT.mc=0}return}
hideBeam(FOOT.beam);if(!fire||FOOT.tcd>0)return;FOOT.tcd=.24;const o=hand.getWorldPosition(_g1).clone();let dir=_g2.set(-Math.sin(FOOT.cy)*Math.cos(FOOT.cp*.6),Math.sin(-FOOT.cp*.6+.05),-Math.cos(FOOT.cy)*Math.cos(FOOT.cp*.6)).normalize().clone();
let best=null,ba=.3;for(const T of TG){if(T.dead||T.isDep)continue;const v=_g3.copy(T.pos).sub(o),d=v.length();if(d>450)continue;const a=Math.acos(clamp(v.dot(dir)/d,-1,1));if(a<ba){ba=a;best=T}}if(best)dir=best.pos.clone().sub(o).normalize();
const m=mkPB(0xff7a40);m.scale.setScalar(.45);m.position.copy(o);m.lookAt(o.clone().sub(dir));PB.push({m,p:m.position,v:dir.multiplyScalar(420),l:1.3,d:1.4,c:0xff7a40});muzzleFlash2(o);tone(jit(900),260,.08,'square',.03)}
function muzzleFlash2(p){fxGlow(p,0xff9a50,1.6,.08,1.5)}
// ----- caméra à pied -----
function footCam(dt){const P=FOOT.pos;if(COCKPIT){camera.position.set(P.x,P.y+1.72,P.z);camera.quaternion.setFromEuler(new THREE.Euler(-FOOT.cp*.8,FOOT.cy,0,'YXZ'))}
else{const tg=_g1.set(P.x,P.y+1.6,P.z),fw=_g2.set(-Math.sin(FOOT.cy),0,-Math.cos(FOOT.cy)),dist=6.5,cp=FOOT.cp;const want=_g3.copy(tg).addScaledVector(fw,-dist*Math.cos(cp)).add(new V3(0,dist*Math.sin(cp)+.5,0)).addScaledVector(new V3(Math.cos(FOOT.cy),0,-Math.sin(FOOT.cy)),.9);
const gh=GR?GR.h(want.x,want.z)+1:0;want.y=Math.max(want.y,gh);if(camInit){camera.position.copy(want);camInit=false}else camera.position.lerp(want,damp(12,dt));camera.up.set(0,1,0);camera.lookAt(tg.addScaledVector(fw,3))}
if(shake>0){camera.position.x+=rv(shake*.3);camera.position.y+=rv(shake*.3);shake=Math.max(0,shake-dt*2.5)}const fv=innerWidth<innerHeight?76:62;if(Math.abs(camera.fov-fv)>.05){camera.fov=fv;camera.updateProjectionMatrix()}sky.position.copy(camera.position)}
// ----- commandes : clic pour verrouiller la souris (PC), glisser à droite pour regarder (mobile) -----
OV.addEventListener('pointerdown',e=>{if(!FOOT.on)return;if(e.pointerType=='mouse'&&DESK&&!document.pointerLockElement){try{OV.requestPointerLock()}catch(_){}}if(e.pointerType!='mouse'&&e.clientX>=innerWidth*.62)FOOT.drag={id:e.pointerId,x:e.clientX,y:e.clientY}});
OV.addEventListener('pointermove',e=>{if(FOOT.drag&&FOOT.drag.id==e.pointerId){FOOT.cy-=(e.clientX-FOOT.drag.x)*.008;FOOT.cp=clamp(FOOT.cp+(e.clientY-FOOT.drag.y)*.006,-.6,1);FOOT.drag.x=e.clientX;FOOT.drag.y=e.clientY;FOOT.lastLook=t}});
const endDrag=e=>{if(FOOT.drag&&FOOT.drag.id==e.pointerId)FOOT.drag=null};OV.addEventListener('pointerup',endDrag);OV.addEventListener('pointercancel',endDrag);
document.addEventListener('mousemove',e=>{if(FOOT.on&&document.pointerLockElement===OV){FOOT.cy-=e.movementX*.0026;FOOT.cp=clamp(FOOT.cp+e.movementY*.002,-.6,1);FOOT.lastLook=t}});
$('footb').addEventListener('click',()=>footEnter());
addEventListener('keydown',e=>{if(e.repeat||e.target.tagName=='INPUT')return;if(e.code=='KeyF'&&mode=='surf'&&!FOOT.on&&canExit())footEnter()});
// ----- surimpression : noms des PNJ, bulles, jetpack, repère de l'avant-poste -----
function groundOverlay(W,H){if(!GR||mode!='surf')return;if(GR.op&&!FOOT.on){const d=Math.hypot(S.pos.x-GR.op.x,S.pos.z-GR.op.z);if(d>140)edgeMarker({x:GR.op.x,y:GR.op.y+30,z:GR.op.z},'#ffc845','Avant-poste','⬡');else if(!S.docked){const s=proj({x:GR.pad.x,y:GR.pad.y+8,z:GR.pad.z});if(s.front){OX.fillStyle='#ffc845';OX.font='700 12px system-ui';OX.textAlign='center';OX.fillText('⬇ Pose-toi sur la piste',s.x,s.y)}}}
const me=FOOT.on?FOOT.pos:S.pos;for(const n of GR.npcs){const d=n.pos.distanceTo(me);if(d>60)continue;const s=proj(_g1.copy(n.pos).add(_g2.set(0,2.5,0)));if(!s.front)continue;OX.textAlign='center';OX.font='700 11px system-ui';OX.fillStyle=n.R.merchant?'#ffd257':'#9fe8b0';OX.fillText(n.name+' · '+n.R.r,s.x,s.y);
if(n.sayT>0&&n.say){OX.font='600 12px system-ui';const lines=wrapTxt(n.say,26),w=Math.max(...lines.map(l=>OX.measureText(l).width))+16,h=lines.length*15+10,bx=s.x-w/2,by=s.y-h-12;OX.fillStyle='rgba(8,18,30,.88)';OX.strokeStyle='rgba(140,220,255,.6)';OX.lineWidth=1.5;OX.beginPath();OX.rect(bx,by,w,h);OX.fill();OX.stroke();OX.fillStyle='#e8f6ff';lines.forEach((l,i)=>OX.fillText(l,s.x,by+17+i*15))}}
if(FOOT.on){if(!FOOT.grounded||FOOT.fuel<.99){const bw=90,bx=W/2-bw/2,by=H-(DESK?60:250);OX.fillStyle='rgba(0,0,0,.45)';OX.fillRect(bx,by,bw,6);OX.fillStyle='#ffb040';OX.fillRect(bx,by,bw*FOOT.fuel,6);OX.font='700 10px system-ui';OX.fillStyle='#ffd8a0';OX.textAlign='center';OX.fillText('JETPACK',W/2,by-4)}
const s=proj(_g1.copy(FOOT.sp).add(_g2.set(0,8,0)));if(s.front&&FOOT.pos.distanceTo(FOOT.sp)>25){OX.fillStyle='#9fd8ff';OX.font='700 11px system-ui';OX.textAlign='center';OX.fillText('🚀 Ton vaisseau · '+Math.round(FOOT.pos.distanceTo(FOOT.sp))+' m',s.x,s.y)}else if(!s.front&&FOOT.pos.distanceTo(FOOT.sp)>25)edgeMarker(FOOT.sp,'#9fd8ff','Vaisseau','🚀')}}
function wrapTxt(s,n){const w=s.split(' '),L=[];let c='';for(const x of w){if((c+' '+x).trim().length>n){L.push(c.trim());c=x}else c+=' '+x}if(c.trim())L.push(c.trim());return L}
