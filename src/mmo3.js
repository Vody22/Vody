// ===== RÉSEAU GALACTIQUE — VISUELS (après mmo.js) =====
// - chantier commun construit dans l'espace près de la Base Alpha (CH3) : 4 structures selon le projet de la semaine,
//   poutres puis panneaux puis lumières selon MMO.pr.pct, drones et étincelles de soudure sur le front de construction
// - livrée de guilde : emblème (tag + couleur) posé sur le dessus des ailes par lancer de rayon (mm3Emblem), joueur et autres pilotes
// - arrivées hyperspatiales des autres pilotes (MM3.fx : éclair, anneau, traînée), bulles de discussion, émotes (saluer, fusées, tonneau)
// - plaques de nom refaites (mpOverlay remplacé) : niveau, tag en couleur de guilde, contour vert pour les membres de ta guilde
// - stations vivantes : balises de guidage qui défilent et navettes qui s'amarrent (enveloppe de loadSmall)
// - bandeau de région (#zb3) au changement de zone
const MM3={em:null,emN:0,bub:null,roll:null,fx:[],chkT:0,tex:{},emT:0};
const _m3a=new V3(),_m3b=new V3(),_m3q=new QT(),_m3z=new V3(0,0,1),_m3y=new V3(0,1,0),_m3m=new THREE.Matrix4(),_m3s=new V3();
const mm3Now=()=>performance.now();

// =============== CHANTIER COMMUN ===============
const CH3={g:null,kind:-1,pct:-1,pos:new V3(-2600,260,2400),beams:null,panels:null,lights:null,data:null,front:new V3(),drones:[],spkT:0,done:false,glow:null,ring:null};
const ch3Kind=n=>/Croiseur/i.test(n)?1:/Observatoire/i.test(n)?2:/Bouclier/i.test(n)?3:0;
function ch3Gen(kind){const B=[],P=[],L=[],v=(x,y,z)=>new V3(x,y,z);
const beam=(a,b,th)=>B.push({a:a.clone(),b:b.clone(),th:th||3});
const panel=(p,n,w,h)=>P.push({p:p.clone(),n:n.clone().normalize(),w,h});
const light=p=>L.push(p.clone());
// tour en treillis : 4 montants, traverses et croisillons
function tower(cx,cz,y0,h,w,lv){const c=[[-1,-1],[1,-1],[1,1],[-1,1]];for(let i=0;i<lv;i++){const ya=y0+h*i/lv,yb=y0+h*(i+1)/lv;for(let k=0;k<4;k++){const[a1,b1]=c[k],[a2,b2]=c[(k+1)%4];beam(v(cx+a1*w,ya,cz+b1*w),v(cx+a1*w,yb,cz+b1*w),4);beam(v(cx+a1*w,yb,cz+b1*w),v(cx+a2*w,yb,cz+b2*w),2.4);beam(v(cx+a1*w,ya,cz+b1*w),v(cx+a2*w,yb,cz+b2*w),1.6)}}light(v(cx,y0+h+6,cz))}
// surface couverte de panneaux : f(u,v) → point ; normale par différences
function shell(f,nu,nv,ribs){const pt=(i,j)=>f(i/nu,j/nv);for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){const a=pt(i,j),b=pt(i+1,j),c=pt(i,j+1),d=pt(i+1,j+1),m=a.clone().add(b).add(c).add(d).multiplyScalar(.25),n=_m3a.copy(b).sub(a).cross(_m3b.copy(c).sub(a));if(n.lengthSq()<1e-6)continue;
 panel(m,n,a.distanceTo(b)*1.04,a.distanceTo(c)*1.04);if(ribs){if(j==0||ribs.all)beam(a,b,2.2);beam(a,c,2.2)}}}
if(kind==0){// relais hyperspatial : tour + anneau vertical géant
 tower(0,0,-260,420,34,9);const R=175,cy=330,n=44;let prev=null,prev2=null;
 for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,p=v(-10,cy+Math.sin(a)*R,Math.cos(a)*R),p2=v(10,cy+Math.sin(a)*R,Math.cos(a)*R);if(prev){beam(prev,p,4);beam(prev2,p2,4);beam(p,p2,2);beam(prev,p2,1.4);const m=prev.clone().add(p2).multiplyScalar(.5);panel(m.clone().add(v(0,0,0)),v(0,Math.sin(a),Math.cos(a)),24,p.distanceTo(prev)*1.05);if(i%4==0)light(v(0,cy+Math.sin(a)*(R+10),Math.cos(a)*(R+10)))}prev=p;prev2=p2}
 for(let k=0;k<4;k++){const a=k/4*Math.PI*2+Math.PI/4;beam(v(0,cy-38*Math.sign(Math.sin(a)||1),0),v(0,cy+Math.sin(a)*R,Math.cos(a)*R),3)}
 shell((u,w)=>{const a=w*Math.PI*2,r=34+u*0;return v(Math.cos(a)*r*1.4,-260+u*430,Math.sin(a)*r*1.4)},9,10,null)}
else if(kind==1){// croiseur : coque fuselée sur couples
 const Lz=640,f=(u,w)=>{const z=-Lz/2+u*Lz,t=u<.18?Math.sqrt(u/.18):u>.86?1-(u-.86)/.14*.55:1,a=w*Math.PI*2;return v(Math.cos(a)*62*t,Math.sin(a)*40*t+(u>.6&&Math.sin(a)>.6?18*(u-.6):0),z)};
 for(let i=0;i<=16;i++){const u=i/16;let prev=null;for(let j=0;j<=14;j++){const p=f(u,j/14);if(prev)beam(prev,p,3);prev=p}}
 shell(f,16,14,{all:0});for(let i=0;i<4;i++){const x=(i%2?1:-1)*24,y=(i<2?1:-1)*14;light(v(x,y,Lz/2+8));light(v(x,y,Lz/2+18))}for(let i=0;i<10;i++)light(v(0,44,-Lz/2+60+i*55));
 for(const s of[-1,1])beam(v(s*62,0,-80),v(s*150,-10,120),5),beam(v(s*150,-10,120),v(s*62,0,200),5),panel(v(s*105,-5,80),v(0,1,0),70,150)}
else if(kind==2){// observatoire : tour + grande parabole inclinée
 tower(0,0,-240,300,30,7);const cy=110,R=230,tilt=-.7,rot=(p)=>p.applyAxisAngle(_m3a.set(1,0,0),tilt).add(_m3b.set(0,cy,0));
 const f=(u,w)=>{const r=R*u,a=w*Math.PI*2;return rot(v(Math.cos(a)*r,r*r/(R*2.2),Math.sin(a)*r))};
 shell(f,6,24,{all:1});const feed=rot(v(0,R*.9,0));for(let k=0;k<3;k++){const a=k/3*Math.PI*2;beam(f(1,k/3),feed,3)}light(feed);for(let k=0;k<12;k++)light(f(1.02,k/12))}
else{// bouclier planétaire : pylône central, 4 piliers et dôme
 tower(0,0,-200,360,22,8);for(let k=0;k<4;k++){const a=k/4*Math.PI*2+Math.PI/4;tower(Math.cos(a)*170,Math.sin(a)*170,-200,200,12,4)}
 const f=(u,w)=>{const th=u*Math.PI/2,a=w*Math.PI*2;return v(Math.cos(a)*Math.cos(th)*215,-10+Math.sin(th)*190,Math.sin(a)*Math.cos(th)*215)};shell(f,7,22,{all:1});light(v(0,195,0))}
const key=kind==1?(o=>o.z):(o=>o.y);B.sort((a,b)=>key(a.a.clone().add(a.b))-key(b.a.clone().add(b.b)));P.sort((a,b)=>key(a.p)-key(b.p));L.sort((a,b)=>key(a)-key(b));return{B,P,L}}
const CH3M={beam:null,panel:null,light:null};
function ch3Mats(){if(CH3M.beam)return;CH3M.beam=new THREE.MeshStandardMaterial({color:0x56606e,metalness:.6,roughness:.45});CH3M.panel=new THREE.MeshStandardMaterial({color:0xc7d0dc,metalness:.45,roughness:.38,emissive:0x0a1422});CH3M.light=new THREE.MeshBasicMaterial({color:0x7ae0ff,transparent:true,blending:ADDB,depthWrite:false})}
function ch3Build(kind){ch3Free();ch3Mats();const D=ch3Gen(kind),g=new THREE.Group();g.position.copy(CH3.pos);g.rotation.y=.6;g.scale.setScalar(1.6);
const mk=(geo,mat,n)=>{const im=new THREE.InstancedMesh(geo,mat,Math.max(1,n));im.frustumCulled=false;im.count=0;g.add(im);return im};
const bi=mk(new THREE.BoxGeometry(1,1,1),CH3M.beam,D.B.length),pi=mk(new THREE.BoxGeometry(1,1,1),CH3M.panel,D.P.length),li=mk(new THREE.SphereGeometry(1,8,6),CH3M.light,D.L.length);
D.B.forEach((b,i)=>{const d=_m3a.copy(b.b).sub(b.a),L=d.length();_m3q.setFromUnitVectors(_m3y,d.normalize());_m3m.compose(_m3b.copy(b.a).add(b.b).multiplyScalar(.5),_m3q,_m3s.set(b.th,L+b.th,b.th));bi.setMatrixAt(i,_m3m)});
D.P.forEach((p,i)=>{_m3q.setFromUnitVectors(_m3z,p.n);_m3m.compose(p.p,_m3q,_m3s.set(p.w,p.h,1.6));pi.setMatrixAt(i,_m3m)});
D.L.forEach((p,i)=>{_m3m.compose(p,_m3q.identity(),_m3s.setScalar(4));li.setMatrixAt(i,_m3m)});
for(const im of[bi,pi,li])im.instanceMatrix.needsUpdate=true;
// halo et anneau d'énergie quand c'est terminé
const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:0x7ae0ff,transparent:true,blending:ADDB,depthWrite:false,opacity:0}));glow.scale.setScalar(520);glow.position.y=kind==0?330:kind==2?200:80;g.add(glow);
// drones de construction
const dg=new THREE.BoxGeometry(5,2.4,7),dm=new THREE.MeshStandardMaterial({color:0xffc34d,metalness:.4,roughness:.5,emissive:0x221500});for(let i=0;i<4;i++){const d=new THREE.Mesh(dg,dm),l=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:0xffaa44,blending:ADDB,transparent:true,depthWrite:false}));l.scale.setScalar(14);l.position.z=4;d.add(l);d.userData.ph=i*1.7;g.add(d);CH3.drones.push(d)}
scene.add(g);Object.assign(CH3,{g,kind,data:D,beams:bi,panels:pi,lights:li,glow,pct:-1})}
function ch3Free(){if(!CH3.g)return;scene.remove(CH3.g);const gs=new Set();CH3.g.traverse(o=>{if(o.isMesh&&!o.isSprite)gs.add(o.geometry);if(o.isSprite)o.material.dispose()});for(const g of gs)g.dispose();CH3.g=null;CH3.drones=[];CH3.kind=-1;CH3.pct=-1}
function ch3Apply(p){const D=CH3.data,c=(a,b)=>clamp((p-a)/(b-a),0,1);
const nb=Math.max(Math.ceil(D.B.length*.06),Math.floor(D.B.length*c(0,.45))),np=Math.floor(D.P.length*c(.15,.98)),nl=p>=1?D.L.length:Math.floor(D.L.length*c(.55,1));
CH3.beams.count=nb;CH3.panels.count=np;CH3.lights.count=nl;CH3.done=p>=1;CH3.pct=p;
const f=np>0&&np<D.P.length?D.P[np-1].p:nb<D.B.length?D.B[Math.max(0,nb-1)].b:D.P.length?D.P[D.P.length-1].p:new V3();CH3.front.copy(f)}
function ch3Tick(dt){const pr=MMO.pr,want=API_OK&&pr&&mode=='space';const d=want?S.pos.distanceTo(CH3.pos):1e9;
if(!want||d>16000){if(CH3.g)ch3Free();return}const k=ch3Kind(pr.n);if(!CH3.g||CH3.kind!==k)ch3Build(k);
if(Math.abs(pr.pct-CH3.pct)>1e-4)ch3Apply(pr.pct);const g=CH3.g,ts=mm3Now()/1000;
CH3.lights.material.opacity=CH3.done?.75+Math.sin(ts*3)*.25:.55+Math.sin(ts*6)*.2;CH3.glow.material.opacity=CH3.done?.22+Math.sin(ts*1.3)*.06:0;
const wf=g.localToWorld(_m3a.copy(CH3.front));
for(const dr of CH3.drones){dr.visible=!CH3.done&&d<6000;if(!dr.visible)continue;const ph=ts*.7+dr.userData.ph,tg=_m3b.set(Math.cos(ph)*45,Math.sin(ph*1.3)*20+12,Math.sin(ph)*45).add(CH3.front);dr.position.lerp(tg,Math.min(1,dt*1.5));dr.lookAt(_m3s.copy(CH3.front))}
if(!CH3.done&&d<4500){CH3.spkT-=dt;if(CH3.spkT<=0){CH3.spkT=.06;for(let i=0;i<4;i++)SPK.emit(wf.x+rv(3),wf.y+rv(3),wf.z+rv(3),rv(30),rv(30)+10,rv(30),.5+Math.random()*.5,1,.75+Math.random()*.2,.4,.96)}}}
// étiquette au-dessus du chantier
function ch3Label(){if(!CH3.g||!MMO.pr)return;const p=_m3a.copy(CH3.pos);p.y+=(CH3.kind==1?120:CH3.kind==0?560:330)*1.6;const s=proj(p),d=S.pos.distanceTo(CH3.pos);if(!s.front||d>14000)return;
OX.textAlign='center';OX.font="700 13px 'Chakra Petch',system-ui";OX.fillStyle=CH3.done?'#7dffb0':'#ffc34d';OX.fillText('🏗 '+MMO.pr.n,s.x,s.y);OX.font="600 10.5px 'Chakra Petch',system-ui";OX.fillStyle='rgba(220,235,255,.85)';OX.fillText((CH3.done?'Terminé':'Chantier commun · '+Math.round(MMO.pr.pct*100)+' %')+' · '+(d>=1000?(d/1000).toFixed(1)+' km':Math.round(d)+' m'),s.x,s.y+14)}
TICK.push(dt=>{try{ch3Tick(dt)}catch(e){console.warn(e)}});
// le chantier apparaît sur la carte (fonction mapItems de la carte 2D/3D, si elle existe)
if(typeof mapItems=='function'){const _mi=mapItems;mapItems=function(){const r=_mi.apply(this,arguments);try{if(API_OK&&MMO.pr&&Array.isArray(r))r.push({x:CH3.pos.x,y:CH3.pos.y,z:CH3.pos.z,n:'Chantier commun : '+MMO.pr.n,k:'site',c:'#ffc34d'})}catch(e){}return r}}

// =============== LIVRÉE DE GUILDE ===============
function mm3EmTex(tag,col){const k=tag+col;if(MM3.tex[k])return MM3.tex[k];const c=mkC(256,256),g=c.getContext('2d');
g.translate(128,128);g.beginPath();g.moveTo(0,-112);g.lineTo(100,-70);g.lineTo(88,40);g.quadraticCurveTo(60,95,0,118);g.quadraticCurveTo(-60,95,-88,40);g.lineTo(-100,-70);g.closePath();
g.fillStyle='rgba(8,14,24,.92)';g.fill();g.lineWidth=12;g.strokeStyle=col;g.stroke();g.lineWidth=4;g.strokeStyle='rgba(255,255,255,.7)';g.beginPath();g.moveTo(-60,-52);g.lineTo(0,-78);g.lineTo(60,-52);g.stroke();
g.fillStyle=col;g.font=`700 ${tag.length>3?62:78}px 'Chakra Petch',system-ui`;g.textAlign='center';g.textBaseline='middle';g.fillText(tag,0,14);
const t=new THREE.CanvasTexture(c);t.anisotropy=4;return MM3.tex[k]=t}
const _m3r=new THREE.Raycaster();
function mm3Emblem(root,tag,col){if(!root||!root.userData)return;const key=tag?tag+col:'';if(root.userData.mm3k===key)return;root.userData.mm3k=key;
const old=[];root.traverse(o=>{if(o.userData&&o.userData.mm3e)old.push(o)});for(const o of old)o.parent.remove(o);if(!tag)return;
const body=root.userData.body||root;root.updateMatrixWorld(true);const hits=[];body.traverse(o=>{if(o.isMesh&&o.material&&(o.material.name=='hull'||o.material.name=='wing'))hits.push(o)});if(!hits.length)return;
const bb=new THREE.Box3();for(const h of hits)bb.expandByObject(h);const sz=bb.getSize(new V3()),c=bb.getCenter(new V3());
// le vaisseau peut être tourné : on lance les rayons dans son repère
const up=new V3(0,1,0).applyQuaternion(root.getWorldQuaternion(new QT())),rt=new V3(1,0,0).applyQuaternion(root.getWorldQuaternion(new QT()));
const mat=new THREE.MeshStandardMaterial({map:mm3EmTex(tag,mmCol(col)),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,metalness:.25,roughness:.55});
const w=Math.max(1.8,Math.min(sz.x,sz.z)*.3);
const fw0=new V3(0,0,-1).applyQuaternion(root.getWorldQuaternion(new QT())),W=Math.max(sz.x,sz.z);
for(const s of[-1,1]){let hit=null,n=null;
 // cherche un endroit plat sur l'aile (de préférence), sinon sur la coque
 search:for(const fx of[.3,.24,.36,.18,.42])for(const fz of[-.1,.05,-.25,.2,.35,-.4]){const o=c.clone().addScaledVector(rt,s*W*fx).addScaledVector(fw0,fz*W).addScaledVector(up,sz.y+W+10);_m3r.set(o,up.clone().negate());const h=_m3r.intersectObjects(hits,false)[0];if(!h||!h.face)continue;const nn=h.face.normal.clone().transformDirection(h.object.matrixWorld);if(nn.dot(up)<.55)continue;if(!hit||h.object.material.name=='wing'){hit=h;n=nn;if(h.object.material.name=='wing')break search}}
 if(!hit)continue;const p=hit.point.clone().addScaledVector(n,.04);
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w),mat);m.userData.mm3e=1;body.worldToLocal(p);m.position.copy(p);
 const inv=new THREE.Matrix4().copy(body.matrixWorld).invert(),nl=n.clone().transformDirection(inv),fw=new V3(0,0,-1).applyQuaternion(root.getWorldQuaternion(new QT())).transformDirection(inv);
 m.up.copy(fw);m.lookAt(p.clone().add(nl));body.add(m)}}
function mm3Liveries(){const tg=MMO.guild?MMO.guild.tag:'',cl=MMO.guild?MMO.guild.col:'';try{if(typeof ship!='undefined'&&ship)mm3Emblem(ship,tg,cl)}catch(e){console.warn(e)}
try{if(typeof H3!='undefined'&&H3.ship)mm3Emblem(H3.ship,tg,cl)}catch(e){}
for(const o of MP.others.values())if(o.mesh&&!o.ft)try{mm3Emblem(o.mesh,o.gt||'',o.gc||'')}catch(e){}}

// =============== ARRIVÉES HYPERSPATIALES ===============
const MM3G={ring:null};
function mm3Warp(pos,q,hue){if(MM3.fx.length>6)return;const col=new THREE.Color().setHSL((hue||200)/360,.8,.65);
if(!MM3G.ring)MM3G.ring=new THREE.TorusGeometry(1,.08,6,40);const sc=curScene();
const fl=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:0xffffff,transparent:true,blending:ADDB,depthWrite:false}));fl.position.copy(pos);sc.add(fl);
const ring=new THREE.Mesh(MM3G.ring,new THREE.MeshBasicMaterial({color:col,transparent:true,blending:ADDB,depthWrite:false}));ring.position.copy(pos);if(q)ring.quaternion.copy(q);sc.add(ring);
const fw=new V3(0,0,-1).applyQuaternion(q||new QT()),st=new THREE.Mesh(new THREE.CylinderGeometry(.6,.05,1,6,1,true).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:col,transparent:true,blending:ADDB,depthWrite:false}));st.position.copy(pos);st.lookAt(_m3a.copy(pos).add(fw));sc.add(st);
MM3.fx.push({fl,ring,st,t:0,pos:pos.clone(),fw,sc});for(let i=0;i<40;i++)SPK.emit(pos.x,pos.y,pos.z,rv(120),rv(120),rv(120),.6+Math.random()*.4,col.r,col.g,col.b,.92);
if(pos.distanceTo(S.pos)<2500)try{tone(180,1600,.35,'sine',.06);tone(900,120,.6,'triangle',.04,.12)}catch(e){}}
function mm3FxTick(dt){for(const f of MM3.fx){f.t+=dt;const k=f.t/.9;f.fl.scale.setScalar(k<.15?k/.15*160:160*(1-(k-.15)/.85)+1);f.fl.material.opacity=Math.max(0,1-k);
 f.ring.scale.setScalar(8+k*90);f.ring.material.opacity=Math.max(0,.9-k);f.st.scale.set(4,4,Math.max(.1,(1-k)*420));f.st.position.copy(f.pos).addScaledVector(f.fw,-(1-k)*210);f.st.material.opacity=Math.max(0,.8-k*1.2)}
for(const f of MM3.fx)if(f.t>=.9){for(const o of[f.fl,f.ring,f.st]){f.sc.remove(o);o.material.dispose()}f.st.geometry.dispose()}MM3.fx=MM3.fx.filter(f=>f.t<.9)}
function mm3Arrivals(){const quiet=mm3Now()-MMO.zoneT<4500;for(const o of MP.others.values()){if(!o.pos||o.dead){o.m3vis=false;continue}
 const jumped=o.m3lp&&o.m3lp.distanceTo(o.pos)>2500;if((!o.m3vis||jumped)&&!quiet&&o.m!='surf')mm3Warp(o.pos,o.mesh?o.mesh.quaternion:null,o.hue);o.m3vis=true;(o.m3lp||(o.m3lp=new V3())).copy(o.pos)}}

// =============== BULLES, ÉMOTES ===============
{const _mpp=mpPeer;mpPeer=function(p){const o0=MP.others.get(p.peer),had=!!o0;_mpp(p);if(p.kind!='viewer'||p.sameTab)return;const o=MP.others.get(p.peer),pr=p.presence||{};if(!o)return;
 const cn=pr.chat&&typeof pr.chat.n=='number'?pr.chat.n:0,en=pr.em&&typeof pr.em.n=='number'?pr.em.n:0;
 // première présence reçue : on retient les compteurs sans rejouer les anciens messages / émotes
 if(!had||o.m3ch==null){o.m3ch=cn;o.m3em=en}else{if(cn>o.m3ch){o.m3ch=cn;o.bub={tx:cleanTxt(pr.chat.txt),t:mm3Now()}}if(en>o.m3em){o.m3em=en;mm3EmoteFx(o,String(pr.em.k||''))}}
 // la livrée doit suivre un changement de guilde : on oublie la clé pour la reposer
 if(o.mesh&&o.mesh.userData&&o.mesh.userData.mm3k!==(o.gt?o.gt+o.gc:''))o.mesh.userData.mm3k=null}}
{const _mo=mpExtraOut;mpExtraOut=function(){const o=_mo();if(MM3.em)o.em=MM3.em;return o}}
{const _say=mpSay;mpSay=function(txt){_say(txt);const t2=cleanTxt(txt).trim();if(t2)MM3.bub={tx:t2,t:mm3Now()}}}
const EMOJ={wave:'👋',flare:'🎆',roll:'🌀'};
function mm3EmoteFx(o,k){const pos=o?o.pos:S.pos,hue=o?o.hue:MP.hue;if(!pos)return;const bub={tx:EMOJ[k]||'✨',t:mm3Now(),em:1};if(o)o.ebub=bub;else MM3.ebub=bub;
if(k=='flare'){const cs=[[1,.35,.3],[.35,1,.5],[.4,.6,1],[1,.85,.3],[1,.4,1]];for(let i=0;i<70;i++){const c=cs[i%cs.length],a=Math.random()*Math.PI*2,b=Math.random()*Math.PI-Math.PI/2,sp=60+Math.random()*90;FIRE.emit(pos.x,pos.y+4,pos.z,Math.cos(a)*Math.cos(b)*sp,Math.sin(b)*sp+50,Math.sin(a)*Math.cos(b)*sp,1.2+Math.random()*.8,c[0],c[1],c[2],.97)}if(pos.distanceTo(S.pos)<2000)try{tone(500,1800,.25,'square',.03);tone(1200,400,.4,'triangle',.03,.3)}catch(e){}}
else if(k=='wave'){for(const s of[-1,1])for(let i=0;i<8;i++)SPK.emit(pos.x+s*8,pos.y+1,pos.z,rv(8),rv(8),rv(8),.5,s<0?1:.3,s<0?.3:1,.35,.9);if(pos.distanceTo(S.pos)<2000)try{tone(660,660,.12,'sine',.04);tone(880,880,.12,'sine',.04,.14)}catch(e){}}}
function mm3Emote(k){const now=mm3Now();if(now-MM3.emT<1500){toast('Doucement…');return}MM3.emT=now;
if(k=='roll'){if(mode!='space'||S.docked){toast('Le tonneau se fait en vol');return}MM3.roll={a:0}}
MM3.em={n:++MM3.emN,k};mm3EmoteFx(null,k);mpSend(true)}
function mm3RollTick(dt){const R=MM3.roll;if(!R)return;if(mode!='space'||S.docked||S.dead){MM3.roll=null;return}const step=Math.min(Math.PI*2-R.a,dt*Math.PI*2/1.1);S.q.multiply(_m3q.setFromAxisAngle(_m3z,step));R.a+=step;if(R.a>=Math.PI*2-1e-3)MM3.roll=null}
// boutons dans l'onglet Zone
$('mppvp').insertAdjacentHTML('afterend','<div class="mmbtns" id="mm3em"><button data-em="wave">👋 Saluer</button><button data-em="flare">🎆 Fusées</button><button data-em="roll">🌀 Tonneau</button></div>');
$('mm3em').addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.dataset.em)mm3Emote(b.dataset.em)});

// =============== PLAQUES DE NOM (remplace mpOverlay de mp.js) ===============
function mm3Bubble(x,y,b){const age=Math.max(.2,(mm3Now()-b.t)/1000),life=b.em?2.6:6;if(age>life)return;const a=age>life-.6?(life-age)/.6:Math.min(1,age*6);
OX.save();OX.globalAlpha=a;OX.font=b.em?"700 22px system-ui":"600 12px 'Chakra Petch',system-ui";const tx=b.tx.length>48?b.tx.slice(0,47)+'…':b.tx,w=Math.min(260,OX.measureText(tx).width+18),h=b.em?30:22;
const bx=x-w/2,by=y-h-(b.em?8:4)+(1-Math.min(1,age*4))*6;OX.fillStyle='rgba(6,16,26,.88)';OX.strokeStyle='rgba(140,220,255,.55)';OX.lineWidth=1;OX.beginPath();if(OX.roundRect)OX.roundRect(bx,by,w,h,6);else OX.rect(bx,by,w,h);OX.fill();OX.stroke();
OX.beginPath();OX.moveTo(x-5,by+h);OX.lineTo(x,by+h+5);OX.lineTo(x+5,by+h);OX.fill();OX.fillStyle='#eaf4ff';OX.textAlign='center';OX.textBaseline='middle';OX.fillText(tx,x,by+h/2+1);OX.restore();OX.textBaseline='alphabetic'}
mpOverlay=function(){try{ch3Label()}catch(e){}
// ma propre bulle (au-dessus de mon vaisseau)
if(mode!='int'){const s=proj(S.pos);if(s.front){let y=s.y-40;if(MM3.bub&&mm3Now()-MM3.bub.t<6000){mm3Bubble(s.x,y,MM3.bub);y-=30}if(MM3.ebub)mm3Bubble(s.x,y,MM3.ebub)}}
if(!MP.room)return;const myG=MMO.guild&&MMO.guild.tag;
for(const o of MP.others.values()){if(!o.pos)continue;const s=proj(o.pos),d=o.pos.distanceTo(S.pos),col=`hsl(${o.hue},80%,70%)`,mate=myG&&o.gt===myG;
 if(s.front&&s.x>0&&s.x<innerWidth&&s.y>0&&s.y<innerHeight){OX.textAlign='left';OX.textBaseline='alphabetic';
  const nm=(o.pvp?'⚔ ':'')+_mpNameRaw(o),tg=o.gt?'['+o.gt+'] ':'',lv=o.lv?String(o.lv):'';OX.font="700 12px 'Chakra Petch',system-ui";const wT=OX.measureText(tg).width,wN=OX.measureText(nm).width,wL=lv?OX.measureText(lv).width+8:0,tot=wL+(wL?4:0)+wT+wN;let x=s.x-tot/2;const y=s.y-26;
  if(lv){OX.fillStyle=mate?'rgba(60,200,120,.9)':'rgba(255,195,77,.9)';OX.fillRect(x,y-11,wL,14);OX.fillStyle='#061018';OX.font="700 10px 'Chakra Petch',system-ui";OX.fillText(lv,x+4,y);x+=wL+4;OX.font="700 12px 'Chakra Petch',system-ui"}
  if(tg){OX.fillStyle=mmCol(o.gc);OX.fillText(tg,x,y);x+=wT}OX.fillStyle=col;OX.fillText(nm,x,y);
  OX.textAlign='center';OX.font="600 10px 'Chakra Petch',system-ui";OX.fillStyle='rgba(220,235,255,.8)';OX.fillText((d>=1000?(d/1000).toFixed(1)+' km':Math.round(d)+' m')+' · '+(o.ft?'à pied':SHIPN[o.ship]),s.x,s.y-13);
  OX.fillStyle='rgba(0,0,0,.5)';OX.fillRect(s.x-18,s.y-8,36,3);OX.fillStyle=o.hp<.3?'#f55':'#6f9';OX.fillRect(s.x-18,s.y-8,36*o.hp,3);
  if(mate){const r=clamp(2600/Math.max(40,d),14,60);OX.strokeStyle='rgba(110,255,170,.8)';OX.lineWidth=1.5;OX.beginPath();OX.moveTo(s.x,s.y-r);OX.lineTo(s.x+r,s.y);OX.lineTo(s.x,s.y+r);OX.lineTo(s.x-r,s.y);OX.closePath();OX.stroke()}
  {let by=y-14;if(o.bub&&mm3Now()-o.bub.t<6000){mm3Bubble(s.x,by,o.bub);by-=30}if(o.ebub)mm3Bubble(s.x,by,o.ebub)}}
 else if(d<(mate?20000:8000))edgeMarker(o.pos,mate?'#6fffa8':col,'',mate?'🛡':'👤')}};
// nom sans le tag (le tag est dessiné à part, dans sa couleur)
function _mpNameRaw(o){return o.nick||(o.by&&MP.names[o.by])||'Pilote'}

// =============== STATIONS VIVANTES : balises + navettes ===============
const ST3={geo:null,mat:null,bm:null};
function st3Res(){if(ST3.geo)return;const b=new THREE.BoxGeometry(5,3,14),w=new THREE.BoxGeometry(15,.7,5).translate(0,-.4,2),c=new THREE.BoxGeometry(3,2,3).translate(0,1.8,-4);ST3.geo=mergeG([{g:b},{g:w},{g:c}])||b;
ST3.mat=new THREE.MeshStandardMaterial({color:0xb9c2cc,metalness:.5,roughness:.45});ST3.bm=new THREE.SpriteMaterial({map:GLOW,color:0x7ae0ff,transparent:true,blending:ADDB,depthWrite:false})}
function st3Deco(st){const m=st.mesh;if(!m||m.userData.st3)return;st3Res();const g=new THREE.Group();g.userData.noCull=1;
const bc=[];for(const s of[-1,1])for(let i=0;i<10;i++)for(const x of[-26,26]){const sp=new THREE.Sprite(ST3.bm.clone());sp.scale.setScalar(15);sp.position.set(x,-8,s*(150+i*55));sp.userData.i=i;g.add(sp);bc.push(sp)}
const sh=[];for(let k=0;k<(DESK?4:2);k++){const n=new THREE.Mesh(ST3.geo,ST3.mat),e=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:0xffb060,transparent:true,blending:ADDB,depthWrite:false}));e.scale.setScalar(10);e.position.z=8;n.add(e);n.scale.setScalar(2.2);for(const sx of[-1,1]){const nl=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:sx<0?0xff4040:0x40ff70,transparent:true,blending:ADDB,depthWrite:false}));nl.scale.setScalar(4);nl.position.set(sx*7.5,-.3,2);n.add(nl)}n.userData={s:k%2?1:-1,x:(k<2?1:-1)*58,ph:k*6.5,e};g.add(n);sh.push(n)}
m.add(g);m.userData.st3={g,bc,sh}}
{const _ls=loadSmall;loadSmall=function(c){const r=_ls(c);try{if(c.st&&c.st.mesh)st3Deco(c.st)}catch(e){console.warn(e)}return r}}
function st3Tick(){if(mode!='space')return;const ts=mm3Now()/1000;for(const st of stations){const u=st.mesh&&st.mesh.userData.st3;if(!u){if(st.mesh)try{st3Deco(st)}catch(e){}continue}
 const d=st.mesh.position.distanceTo(S.pos);u.g.visible=d<5200;if(!u.g.visible)continue;
 const head=(ts*6)%12;for(const sp of u.bc){const k=head-(9-sp.userData.i);sp.material.opacity=k>=0&&k<2?1-k*.35:.3}
 for(const n of u.sh){const T=26,c=(ts+n.userData.ph)%T,s=n.userData.s;let z,vis=true,fwd;
  if(c<9){const k=c/9;z=s*(1100-930*(1-(1-k)*(1-k)));fwd=-s}else if(c<14){z=s*170;fwd=-s}else if(c<22){const k=(c-14)/8;z=s*(170+930*k*k);fwd=s}else{vis=false}
  n.visible=vis;if(!vis)continue;n.position.set(n.userData.x,-14,z);n.rotation.set(0,fwd>0?Math.PI:0,0);n.userData.e.visible=!(c>=9&&c<14);n.userData.e.position.z=fwd>0?-8:8}}}

// =============== BANDEAU DE RÉGION ===============
document.body.insertAdjacentHTML('beforeend','<div id="zb3"><small>ENTRÉE DANS LA</small><b></b><i></i></div>');
function zb3Show(z){if(!z)return;const el=$('zb3');let sub='';try{sub=z.surf?'Surface planétaire':CTLN[ctlOf(secOf(S.pos.x,S.pos.z))]}catch(e){}
el.querySelector('small').textContent=z.surf?'ATTERRISSAGE SUR':'ENTRÉE DANS LA';el.querySelector('b').textContent=z.surf?z.n:String(z.n).toUpperCase();el.querySelector('i').textContent=sub+(MP.on?' · '+(MP.others.size+1)+' pilote'+(MP.others.size?'s':''):'');
el.classList.remove('on');void el.offsetWidth;el.classList.add('on')}
{const _zs=mmZoneSwitched;mmZoneSwitched=function(){_zs();try{zb3Show(MMO.zone)}catch(e){}}}

// =============== BOUCLE ===============
TICK.push(dt=>{const rd=Math.min(.1,dt||.016);try{mm3FxTick(rd);mm3RollTick(rd);if(MP.room)mm3Arrivals();st3Tick()}catch(e){console.warn(e)}
const nw=mm3Now();if(nw>=MM3.chkT){MM3.chkT=nw+500;mm3Liveries()}});
// annonce (une fois)
TICK.push(()=>{if(MM3.news||!MMO.on)return;MM3.news=1;if(!GX('newsMMO3',0)){G.x.newsMMO3=1;setTimeout(()=>banner('station','Le réseau prend vie','Le chantier commun se construit près de la Base Alpha, emblème de guilde sur tes ailes, émotes (👋 🎆 🌀) dans l\'onglet Zone.','#7dffb0'),9000)}});
