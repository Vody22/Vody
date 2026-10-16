// ===== PLANÈTES VOXEL DANS LE JEU (voxp.js, après vox.js) =====
// Option « Planètes » → « Voxel (visitables) » (par défaut). Les planètes où l'on peut se poser sont des planètes voxel entières :
// - vue de l'espace : maillage grossier du même champ de distance (mer, halo d'atmosphère), à la place de l'ancienne sphère texturée ;
// - en approchant (ou bouton « Atterrir »), passage sans écran de chargement dans la scène VX.sc, qui est le repère de la planète
//   (centre à l'origine, mêmes dimensions) : le vaisseau garde sa position, le jour et la nuit suivent la rotation de la planète ;
// - vol au-dessus du relief (gravité vers le centre pour le pilote, pas pour le vaisseau), sortie à pied, jetpack, grottes, deux puits
//   naturels jusqu'au noyau creux, outil pour creuser n'importe où (trous enregistrés par planète dans G.x.vxd) ;
// - planètes vierges : aucun contenu de l'ancien mode surface (villes, PNJ, avant-postes, bases, ruines, faune…).
// Mode de jeu 'vox' (comme 'surf' et 'int') : hud.js et game.js appellent vxUpdate / vxInfo / vxPrompt / vxAction / vxOverlay / vxRadar.
{try{const v=localStorage.getItem('sf-pl4');if(!v||v=='vox')WG4.mode='vox'}catch(e){WG4.mode='vox'}}
function vxEn(){return WG4.mode=='vox'&&!window.VOXOFF&&!/[?&]novox\b/.test(location.search)}
const VX={sc:new THREE.Scene(),on:false,p:null,P:null,V:null,U:null,sea:null,atm:null,sky:null,foot:false,asc:null,park:0,Q:new QT(),C:new V3(),sunW:new V3(),
 fp:new V3(),fv:new V3(),fq:new QT(),cy:0,cp:.2,yaw:0,ph:0,fuel:1,gr:false,pm:null,ck:false,drag:null,lastLook:0,digT:0,beam:null,saveT:0,told:{},frag:null,stepK:0,dead:0};
window.VXSC=VX.sc;
{const sc=VX.sc;VX.dl=new THREE.DirectionalLight(0xffffff,1.1);VX.hemi=new THREE.HemisphereLight(0xbfd8ff,0x30251a,.5);VX.pl=new THREE.PointLight(0xfff1d8,0,60,1.6);sc.add(VX.dl,VX.dl.target,VX.hemi,VX.pl)}
const VXPC=new Map(),_vxA=new V3(),_vxB=new V3(),_vxN=new V3(),_vxC=new V3(),_vxQ=new QT(),_vxQ2=new QT(),_vxM=new THREE.Matrix4();
const vxSS=(a,b,v)=>{v=clamp((v-a)/(b-a),0,1);return v*v*(3-2*v)};
const vxTy=p=>p.v2moon?'Lune':ptype(p);
function vxP(p){const R=Math.round(p.r),k=p.name;let P=VXPC.get(k);if(P&&P.R===R)return P;const seed=(seedOf(Math.round(p.x),Math.round(p.y),Math.round(p.z),4242)>>>0)||7;
 P=vxPreset(vxTy(p),seed,R,p.wg0!=null?p.wg0:p.hue);VXPC.set(k,P);return P}
const vxSeaK=P=>P.sea=='lave'?2:P.sea=='cristal'?3:1;
const VXINV=new THREE.MeshBasicMaterial({visible:false});

// ----- vue de l'espace -----
function vxSpaceApply(p,g){const ud=g&&g.userData;if(!ud||!ud.sph||ud.vx||p.ring)return;const P=vxP(p);
 const U=vxU(P);U.space.value=1;const V=vxPlanet(P,{space:true,N:DESK?36:26,U,cav:false,ew:DESK?1024:512});V.g.visible=false;ud.sph.add(V.g);
 let sea=null;if(P.Rs>0&&!P.ice){sea=new THREE.Mesh(new THREE.SphereGeometry(1,DESK?128:80,DESK?64:40),vxSeaMat(U,vxSeaK(P)));sea.visible=false;sea.renderOrder=1;ud.sph.add(sea)}
 let atm=null;if(P.atm){atm=vxAtmo(P,U,P.R+P.eMax*.8+P.R*.035);atm.visible=false;g.add(atm)}
 const lt=lightFor(p.x,p.y,p.z);U.sunDir.value.copy(lt.dir);U.sunCol.value.copy(lt.col).multiplyScalar(lt.s?1.05:.92);U.pc.value.copy(g.position);
 ud.vx={P,U,V,sea,atm,on:false,hid:[],m0:null}}
function vxSpaceShow(g){const ud=g.userData,X=ud.vx;if(!X||X.on)return;X.on=true;X.m0=ud.sph.material;ud.sph.material=VXINV;
 for(const o of g.children)if(o!==ud.sph&&o!==X.atm&&o.isMesh&&o.geometry&&o.geometry.type=='SphereGeometry'&&o.geometry.parameters.radius>X.P.R*1.001&&o.visible){X.hid.push(o);o.visible=false}
 X.V.g.visible=true;if(X.sea)X.sea.visible=true;if(X.atm)X.atm.visible=true}
function vxSpaceRevert(g){const ud=g&&g.userData,X=ud&&ud.vx;if(!X)return;if(X.on){ud.sph.material=X.m0;for(const o of X.hid)o.visible=true}
 X.V.dispose();ud.sph.remove(X.V.g);if(X.sea){ud.sph.remove(X.sea);X.sea.geometry.dispose();X.sea.material.dispose()}if(X.atm){g.remove(X.atm);X.atm.geometry.dispose();X.atm.material.dispose()}ud.vx=null}
{const _bgV=buildPlanetGPU;buildPlanetGPU=function(p){const g=_bgV.apply(this,arguments);try{if(vxEn()&&!p.ring){pl4Revert(g);vxSpaceApply(p,g)}}catch(e){console.warn('vox',e)}return g}}
{const _bpV=buildPlanet;buildPlanet=function(p,tx){const g=_bpV.apply(this,arguments);try{if(vxEn()&&!p.ring){pl4Revert(g);vxSpaceApply(p,g)}}catch(e){console.warn('vox',e)}return g}}
// option à 4 états : Voxel → Mondes générés → Stylisées → Réalistes
{const _wr=wg4Refresh;wg4Refresh=function(){for(const p of(typeof planets!='undefined'?planets:[]))if(p.mesh)try{vxSpaceRevert(p.mesh)}catch(e){console.warn(e)}_wr();
 if(vxEn())for(const p of planets)if(p.mesh&&!p.ring)try{pl4Revert(p.mesh);vxSpaceApply(p,p.mesh)}catch(e){console.warn(e)}}}
pl4Toggle=function(){WG4.mode={vox:'world',world:'style',style:'real',real:'vox'}[WG4.mode]||'vox';PL4.on=WG4.mode!='real';try{localStorage.setItem('sf-pl4',WG4.mode)}catch(e){}wg4Refresh();pl4Btn();
 toast('🪐 Planètes : '+{vox:'voxel, entièrement visitables',world:'mondes générés',style:'stylisées',real:'réalistes'}[WG4.mode]+(mode=='vox'||mode=='surf'?' (au prochain atterrissage)':''))};
pl4Btn=function(){const b=$('pl4b');if(b)b.textContent={vox:'Voxel (visitables)',world:'Mondes générés',style:'Stylisées',real:'Réalistes'}[WG4.mode]};
{let lt=performance.now();TICK.push(()=>{const n=performance.now(),dt=Math.min(.1,(n-lt)/1000);lt=n;if(typeof planets=='undefined')return;
 // une seule planète calculée à la fois, la plus proche d'abord (la scène voxel passe avant)
 let best=null,bd=1e18;for(const p of planets){const g=p.mesh,X=g&&g.userData&&g.userData.vx;if(!X)continue;X.U.pc.value.copy(g.position);X.U.tm.value=t;if(X.V.ready&&!X.V.pend){if(!X.on)vxSpaceShow(g);continue}
  if(X.V.pend){X.V.update(_vxA.set(0,0,0),dt);continue}const d=(p.x-camera.position.x)**2+(p.y-camera.position.y)**2+(p.z-camera.position.z)**2;if(d<bd){bd=d;best=X}}
 if(best&&!(VX.V&&VX.V.pend>0&&mode!='space'))best.V.update(_vxA.set(0,0,0),dt)})}

// ----- repère de la planète (rotation de la sphère dans l'espace) -----
function vxFrame(p){const sph=p&&p.mesh&&p.mesh.userData&&p.mesh.userData.sph;if(sph){p.mesh.updateMatrixWorld(true);sph.getWorldQuaternion(VX.Q);VX.C.copy(p.mesh.position)}else{VX.Q.identity();VX.C.set(p.x,p.y,p.z)}}
const vxToLocal=(w,o)=>o.copy(w).sub(VX.C).applyQuaternion(_vxQ2.copy(VX.Q).invert());
// prépare la scène voxel d'une planète (aussi en approche, pour que les morceaux soient prêts à l'arrivée)
function vxPrep(p){if(VX.p===p&&VX.V)return;if(VX.on)return;vxFree();const P=vxP(p),U=vxU(P);
 const V=vxPlanet(P,{N:DESK?32:24,leaf:32,K:DESK?.72:.56,U,ew:DESK?2048:1024});VX.sc.add(V.g);
 const dg=GX('vxd',{})[p.name];if(Array.isArray(dg))for(let i=0;i+3<dg.length;i+=4)V.digs.push([dg[i],dg[i+1],dg[i+2],dg[i+3]]);
 VX.sea=null;if(P.Rs>0&&!P.ice){VX.sea=new THREE.Mesh(new THREE.SphereGeometry(1,DESK?320:192,DESK?160:96),vxSeaMat(U,vxSeaK(P)));VX.sea.renderOrder=1;VX.sea.frustumCulled=false;VX.sc.add(VX.sea)}
 VX.atm=P.atm?vxAtmo(P,U,P.R+P.eMax*.8+P.R*.035):null;if(VX.atm)VX.sc.add(VX.atm);
 VX.sky=vxSkyDome(U);VX.sc.add(VX.sky);
 const lt=lightFor(p.x,p.y,p.z);VX.sunW.copy(lt.dir);U.sunCol.value.copy(lt.col).multiplyScalar(lt.s?1.05:.92);VX.dl.color.copy(U.sunCol.value);
 VX.hemi.color.setRGB(...P.col.atm).lerp(new THREE.Color(1,1,1),.4);VX.hemi.groundColor.setRGB(...P.col.rock2);
 VX.p=p;VX.P=P;VX.U=U;VX.V=V;VX.frag=null;vxFrame(p);vxSunUpd()}
function vxFree(){if(VX.on||!VX.V)return;VX.V.dispose();VX.sc.remove(VX.V.g);for(const o of[VX.sea,VX.atm,VX.sky])if(o){VX.sc.remove(o);o.geometry.dispose();o.material.dispose()}
 if(VX.frag){VX.sc.remove(VX.frag.m);VX.frag=null}VX.V=VX.sea=VX.atm=VX.sky=null;VX.p=null}
function vxSunUpd(){if(!VX.U)return;VX.U.sunDir.value.copy(VX.sunW).applyQuaternion(_vxQ2.copy(VX.Q).invert()).normalize();
 // ciel de l'espace (panorama) vu à travers l'atmosphère, orienté comme dans l'espace
 const sky=VX.sky;if(sky){const m=sky.material.uniforms,tx=typeof NEB!='undefined'&&NEB&&NEB.material&&NEB.material.map;m.spaceTx.value=tx||null;m.hasSpace.value=tx?1:0;m.skyRot.value.setFromMatrix4(_vxM.makeRotationFromQuaternion(VX.Q))}}
// en approche : préparation, puis entrée automatique près du relief
TICK.push(dt=>{if(!vxEn()||mode!='space'||S.dead||S.entry){if(mode=='space'&&VX.V&&!VX.on&&(!landP||landP!==VX.p))vxFreeLater(dt);return}
 const p=typeof landP!='undefined'?landP:null;if(!p||p.ring){vxFreeLater(dt);return}VX.ft=0;vxPrep(p);if(VX.p!==p)return;vxFrame(p);vxSunUpd();
 vxToLocal(camera.position,_vxA);VX.V.update(_vxA,dt||.016);
 if(!S.docked&&Math.hypot(S.pos.x-VX.C.x,S.pos.y-VX.C.y,S.pos.z-VX.C.z)<VX.P.R+VX.P.eMax+150)vxEnter(p)});
function vxFreeLater(dt){if(!VX.V||VX.on)return;VX.ft=(VX.ft||0)+(dt||.016);if(VX.ft>20)vxFree()}

// ----- entrée / sortie -----
function vxEnter(p){if(mode!='space'||S.dead||S.entry||!p||p.ring)return;vxPrep(p);if(VX.p!==p)return;vxFrame(p);vxSunUpd();
 const qi=_vxQ2.copy(VX.Q).invert();S.pos.sub(VX.C).applyQuaternion(qi);S.q.premultiply(qi).normalize();S.vel.applyQuaternion(qi);
 clearWeapons();for(const b of PB)rmPB(b);PB=[];for(const b of EB)b.m.parent&&b.m.parent.remove(b.m);EB=[];for(const d of DROPS)d.m.parent&&d.m.parent.remove(d.m);DROPS=[];for(const e of en)e.mesh.parent&&e.mesh.parent.remove(e.mesh);en=[];lock=null;
 VX.sc.add(ship,SPK.pts,FIRE.pts);SPK.clear();FIRE.clear();mode='vox';VX.on=true;VX.foot=false;VX.asc=null;VX.park=0;VX.dead=0;S.docked=null;S.heat=0;landP=null;camInit=true;
 VX.shipR=3.4*Math.max(1,(ship.userData.body&&ship.userData.body.scale.z)||1);
 const ty=vxTy(p);SFX.disc();toast('🪐 '+p.name+' — '+ty.toLowerCase()+' · planète voxel');
 if(!VX.told.in){VX.told.in=1;setTimeout(()=>{if(mode=='vox')toast('🚶 Pose-toi doucement puis appuie sur SORTIR'+(DESK?' (F)':'')+' : à pied, maintiens le tir pour creuser')},2600)}}
function vxExit(dead){if(mode!='vox')return;if(VX.foot)vxFootLeave(true);vxSaveDigs();const p=VX.p;vxFrame(p);
 if(!dead){S.pos.applyQuaternion(VX.Q).add(VX.C);S.q.premultiply(VX.Q).normalize();S.vel.applyQuaternion(VX.Q)}
 clearWeapons();for(const b of PB)rmPB(b);PB=[];for(const b of EB)b.m.parent&&b.m.parent.remove(b.m);EB=[];hideBeam(VX.beam);
 scene.add(ship,SPK.pts,FIRE.pts);SPK.clear();FIRE.clear();mode='space';VX.on=false;VX.asc=null;camInit=true;
 if(!dead){S.spd=Math.max(S.spd,cruise());SFX.buy();toast('🚀 Retour dans l\'espace')}save()}

// ----- distance au relief (avec les trous creusés) -----
function vxF(x,y,z,rad){const V=VX.V;V.near(x,y,z,rad||3);return V.f(x,y,z)}
function vxN(x,y,z,f,h){const c=VX.V.core,g=c.grad(x,y,z,f,h||.15);_vxN.set(c.GN[0],c.GN[1],c.GN[2]);return g}

// ----- vol -----
function vxFly(dt){const up=_vxA.copy(S.pos).normalize(),Qu=_vxQ.setFromUnitVectors(AY,up),Qi=_vxQ2.copy(Qu).invert();
 S.q.premultiply(Qi);S.vel.applyQuaternion(Qi);const p0=_vxB.copy(S.pos);S.pos.set(0,0,0);
 fly(dt,{rate:1.12,minSpd:0,surf:true});
 S.pos.applyQuaternion(Qu).add(p0);S.q.premultiply(Qu).normalize();S.vel.applyQuaternion(Qu)}
function vxAscend(dt){const A=VX.asc;A.t+=dt;const up=_vxA.copy(S.pos).normalize();fwd();const ft=_vxB.copy(_f).addScaledVector(up,-_f.dot(up));if(ft.lengthSq()<1e-4)ft.set(1,0,0).addScaledVector(up,-up.x);ft.normalize();
 const f=ft.multiplyScalar(Math.cos(1.05)).addScaledVector(up,Math.sin(1.05)).normalize();S.q.slerp(basisQ(f,up),damp(2.2,dt));S.spd=lerp(S.spd,420,damp(1.1,dt));fwd();S.vel.copy(_f).multiplyScalar(S.spd);S.pos.addScaledVector(S.vel,dt);S.thr=2.4;shake=Math.max(shake,.2)}
function vxShipCol(dt){const P=VX.P,r=VX.shipR||3.4;for(let it=0;it<2;it++){const f=vxF(S.pos.x,S.pos.y,S.pos.z,r+8);if(f>r+.5)break;const g=vxN(S.pos.x,S.pos.y,S.pos.z,f,.3),d=f/Math.max(1,g);if(d>=r)break;
  S.pos.addScaledVector(_vxN,r-d);const vn=S.vel.dot(_vxN);if(vn<0){if(vn<-50&&it==0){damage(Math.min(30,(-vn-50)*.35),'col');boom3(S.pos,10,0xbbaa88,40);shake=Math.min(1.2,shake+.5)}S.vel.addScaledVector(_vxN,-vn*1.2);S.spd=Math.min(S.spd,S.vel.length())}}
 // mer (le vaisseau rase l'eau sans y entrer ; la lave brûle)
 if(P.Rs>0&&!P.ice){const L=S.pos.length(),m=P.Rs+r*.7;if(L<m+6){vxF(S.pos.x,S.pos.y,S.pos.z,1);if(VX.V.core.OUT.ds>-2){if(L<m){S.pos.multiplyScalar(m/L);const up=_vxA.copy(S.pos).normalize(),vr=S.vel.dot(up);if(vr<0)S.vel.addScaledVector(up,-vr)}
  if(P.sea=='lave'&&L<m+5){damage(9*dt);if(Math.random()<dt*6)FIRE.emit(S.pos.x,S.pos.y,S.pos.z,rv(10),rv(10),rv(10),.6,1,.5,.1,.5)}}}}}
function vxCanExit(){if(mode!='vox'||VX.foot||S.dead||VX.asc||!VX.V)return false;if(S.spd>28)return false;const f=vxF(S.pos.x,S.pos.y,S.pos.z,4);return f<18}

// ----- à pied (gravité vers le centre) -----
function vxPilot(){if(!VX.pm){VX.pm=buildHuman(pilotOpts({suit:new THREE.Color().setHSL(((typeof MP!='undefined'?MP.hue:200))/360,.3,.78).getHex(),acc:0xff8a2a,tool:true,skin:0xe0b090,closed:true},null,true))}
 if(VX.pm.parent!==VX.sc)VX.sc.add(VX.pm);return VX.pm}
function vxFootEnter(){if(!vxCanExit())return;const P=VX.P,up=_vxA.copy(S.pos).normalize();
 if(P.Rs>0&&!P.ice&&S.pos.length()<P.Rs+12){vxF(S.pos.x,S.pos.y,S.pos.z,1);if(VX.V.core.OUT.ds>-1&&S.pos.length()-VX.V.core.OUT.ds<P.Rs){toast('Impossible de sortir au-dessus de '+(P.sea=='lave'?'la lave':'l\'eau')+' — pose-toi sur la terre ferme');return}}
 fwd();const ft=_vxB.copy(_f).addScaledVector(up,-_f.dot(up));if(ft.lengthSq()<1e-4)ft.set(1,0,0);ft.normalize();const rt=_vxC.crossVectors(ft,up).normalize();
 // point de départ à côté du vaisseau, posé sur le sol
 let ok=null;for(const[a,b]of[[1,0],[-1,0],[0,-1],[0,1],[1,1],[-1,1]]){const st=S.pos.clone().addScaledVector(rt,7.5*a).addScaledVector(ft,8*b).addScaledVector(up,2);for(let k=0;k<70;k++){const x=st.clone().addScaledVector(up,-k*.5);if(vxF(x.x,x.y,x.z,2)<.35){if(!(P.Rs>0&&!P.ice&&x.length()<P.Rs+.2))ok=x.addScaledVector(up,.4);break}}if(ok)break}
 if(!ok){toast('Pas de terre ferme à côté du vaisseau — pose-toi ailleurs');return}
 VX.fp.copy(ok);VX.fv.set(0,0,0);VX.fq.copy(basisQ(ft,up));VX.cy=0;VX.cp=.2;VX.yaw=0;VX.fuel=1;VX.gr=false;VX.ph=0;
 vxPilot().visible=true;VX.foot=true;VX.park=1;VX.ck=COCKPIT;COCKPIT=false;S.spd=0;S.vel.set(0,0,0);S.thr=0;clearWeapons();camInit=true;
 btnSet('fire','drill','Creuser');btnSet('boost','jump','Saut');btnSet('brake','run','Course');document.body.classList.add('foot');setD('footb','none');SFX.buy();tone(300,180,.25,'sine',.08);
 if(!VX.told.foot){VX.told.foot=1;toast('🚶 '+(DESK?'ZQSD pour marcher, souris pour regarder, clic pour creuser, Espace = saut/jetpack':'joystick pour marcher, glisse à droite pour regarder, CREUSER pour creuser'))}}
function vxFootLeave(silent){if(!VX.foot)return;VX.foot=false;if(VX.pm)VX.pm.visible=false;hideBeam(VX.beam);COCKPIT=VX.ck;VX.park=0;
 btnSet('fire','fire','Feu');btnSet('boost','boost','Boost');btnSet('brake','brake','Frein');document.body.classList.remove('foot');S.vel.set(0,0,0);S.spd=0;camInit=true;
 try{if(document.pointerLockElement)document.exitPointerLock()}catch(e){}if(!silent){SFX.buy();toast('🚀 À bord — prêt à décoller')}}
const vxNearShip=()=>VX.foot&&VX.fp.distanceTo(S.pos)<11;
function vxFootUpdate(dt){const P=VX.P,p=VX.fp,v=VX.fv;if(COCKPIT){VX.ck=!VX.ck;COCKPIT=false}
 const up=_vxA.copy(p).normalize();{const yv=_vxB.set(0,1,0).applyQuaternion(VX.fq);VX.fq.premultiply(_vxQ.setFromUnitVectors(yv,up)).normalize()}
 let ix=0,iz=0;if(stick&&Math.hypot(stick.x,stick.y)>.1){ix=stick.x;iz=-stick.y}ix+=(K.KeyD|K.ArrowRight|0)-(K.KeyA|K.ArrowLeft|0);iz+=(K.KeyW|K.ArrowUp|0)-(K.KeyS|K.ArrowDown|0);const il=Math.hypot(ix,iz);if(il>1){ix/=il;iz/=il}
 if(DESK&&!document.pointerLockElement&&MS.in&&Math.abs(MS.x)>.2)VX.cy-=(MS.x-Math.sign(MS.x)*.2)*1.8*dt;
 const fw=_vxB.set(-Math.sin(VX.cy),0,-Math.cos(VX.cy)).applyQuaternion(VX.fq),rt=_vxC.set(Math.cos(VX.cy),0,-Math.sin(VX.cy)).applyQuaternion(VX.fq);
 const L=p.length(),inSea=P.Rs>0&&!P.ice&&L<P.Rs-.6&&vxF(p.x,p.y,p.z,1)>-99&&VX.V.core.OUT.ds>-6&&L-VX.V.core.OUT.ds<P.Rs,run=B.brake||K.ShiftLeft||K.ShiftRight,sp=(run?11:6)*(inSea?.55:1);
 const vr=v.dot(up),vt=v.clone().addScaledVector(up,-vr),want=fw.clone().multiplyScalar(iz).addScaledVector(rt,ix).multiplyScalar(sp);vt.lerp(want,damp(VX.gr?10:inSea?3:2.2,dt));
 let nvr=vr;const jump=B.boost||K.Space;
 if(VX.gr){VX.fuel=Math.min(1,VX.fuel+dt*.5);if(jump&&!VX.jl){nvr=7.5;VX.gr=false;tone(200,320,.12,'sine',.05)}}else if(jump&&VX.fuel>0&&nvr<6){nvr+=30*dt;VX.fuel-=dt*.4/(1+.25*talR('jet'));if(Math.random()<.6){const b=p.clone().addScaledVector(up,1.1);FIRE.emit(b.x,b.y,b.z,-up.x*12+rv(2),-up.y*12+rv(2),-up.z*12+rv(2),.25,.6,.75,1,.18)}}VX.jl=jump;
 const gk=9.2;if(inSea){const dd=P.Rs-.95-L;nvr=lerp(nvr,dd>0?Math.min(2.6,dd*1.5):(jump?3:0),damp(2.4,dt));VX.fuel=Math.min(1,VX.fuel+dt*.3)}else nvr-=gk*dt;if(VX.gr&&nvr<0)nvr=Math.max(nvr,-3);
 v.copy(vt).addScaledVector(up,nvr);
 // déplacement par petits pas + collisions (deux sphères : pieds et tête)
 const steps=Math.max(1,Math.ceil(v.length()*dt/.25)),h=dt/steps;let gr=false,impact=0;
 for(let s=0;s<steps;s++){p.addScaledVector(v,h);const u=_vxA.copy(p).normalize();
  for(const[off,r]of[[.45,.45],[1.35,.38]])for(let it=0;it<2;it++){const c=_vxC.copy(p).addScaledVector(u,off),f=vxF(c.x,c.y,c.z,2);if(f>r+.2)break;const g=vxN(c.x,c.y,c.z,f,.08),d=f/Math.max(1,g);if(d>=r)break;
   p.addScaledVector(_vxN,r-d);const vn=v.dot(_vxN);if(vn<0){if(off<1&&_vxN.dot(u)>.5)impact=Math.min(impact,v.dot(u));v.addScaledVector(_vxN,-vn)}if(off<1&&_vxN.dot(u)>.55)gr=true}}
 if(!gr&&VX.gr&&nvr<=0){const u=_vxA.copy(p).normalize(),c=_vxC.copy(p).addScaledVector(u,.45-.4),f=vxF(c.x,c.y,c.z,2);if(f<.5){p.addScaledVector(u,-Math.max(0,f-.02));gr=true}}
 {const dx=_vxC.copy(p).sub(S.pos),dl=dx.length(),mr=(VX.shipR||3.4)*1.45;if(dl<mr&&dl>.01){p.addScaledVector(dx,(mr-dl)/dl);const vn=v.dot(dx)/dl;if(vn<0)v.addScaledVector(dx,-vn/dl)}}
 if(impact<-16)damage((-impact-16)*.8,'col');VX.gr=gr;
 if(P.sea=='lave'&&L<P.Rs+.3&&VX.V.core.OUT.ds>-3){damage(14*dt);if(Math.random()<dt*8)FIRE.emit(p.x,p.y,p.z,rv(3),rv(3),rv(3),.5,1,.5,.1,.4)}
 // corps : tourné dans le sens de la marche
 const hs=vt.length();if(hs>.5){const lf=vt.clone().applyQuaternion(_vxQ2.copy(VX.fq).invert());const ty=Math.atan2(-lf.x,-lf.z);let d=ty-VX.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));VX.yaw+=d*damp(10,dt);
  if(!VX.drag&&!document.pointerLockElement&&!DESK&&t-VX.lastLook>1.2){let e=VX.yaw-VX.cy;e=Math.atan2(Math.sin(e),Math.cos(e));VX.cy+=e*damp(1.2,dt)*Math.min(1,hs/6)}}
 if(isFire())VX.yaw=VX.cy;
 const ph0=VX.ph;VX.ph+=dt*hm3Rate(hs);if(VX.gr&&hs>.8&&Math.floor(VX.ph/Math.PI)!=Math.floor(ph0/Math.PI))vxStep(hs);
 const m=vxPilot();m.position.copy(p);m.quaternion.copy(VX.fq).multiply(_vxQ.setFromAxisAngle(AY,VX.yaw));animAstro(m,VX.ph,hs,!VX.gr,isFire());m.visible=!VX.ck;
 vxDig(dt);if(K.KeyF&&!VX.kf&&vxNearShip())vxFootLeave();VX.kf=K.KeyF}
function vxStep(hs){try{const k=VX.P.ice?'ice':VX.P.ty=='Désertique'?'sand':'rock';noise(.07,.025+Math.min(.02,hs*.002),k=='sand'?900:k=='ice'?2600:500)}catch(e){}}
// creuser : rayon depuis la caméra, sphère de 2,3 m enlevée au point touché
function vxDig(dt){VX.digT-=dt;const hand=VX.pm&&VX.pm.userData.tool;if(!isFire()||S.dead){hideBeam(VX.beam);return}
 const o=camera.position,dir=_vxB.set(0,0,-1).applyQuaternion(camera.quaternion);const head=_vxC.copy(VX.fp).addScaledVector(_vxA.copy(VX.fp).normalize(),1.5);
 let tt=.2,hit=null;const max=7.5;for(let i=0;i<120&&tt<max;i++){const x=head.x+dir.x*tt,y=head.y+dir.y*tt,z=head.z+dir.z*tt,f=vxF(x,y,z,2);if(f<.06){hit=new V3(x,y,z);break}tt+=Math.max(.06,f*.8)}
 const src=hand?hand.getWorldPosition(new V3()):head.clone();if(!VX.beam)VX.beam=mkBeam(0x7fe8ff);
 if(!hit){placeBeam(VX.beam,src,src.clone().addScaledVector(dir,7),.06,false);vxBeamS();return}
 placeBeam(VX.beam,src,hit,.09,false);vxBeamS();if(VX.digT>0)return;VX.digT=.17;const P=VX.P;
 const c=hit.addScaledVector(dir,.7),r=DESK?2.3:2.5,dg=VX.V.digs;if(dg.length>=4000){if(!VX.told.max){VX.told.max=1;toast('⛏ Trop de galeries sur cette planète — les plus anciennes se referment')}dg.shift()}
 vxOreTake(c,r);
 VX.V.dig(Math.round(c.x*10)/10,Math.round(c.y*10)/10,Math.round(c.z*10)/10,r);VX.dirty=1;
 const n=_vxA.copy(c).sub(o).normalize().negate(),col=VX.V.core.OUT.m==2?0xff7030:0x9a8270;for(let i=0;i<6;i++)SPK.emit(c.x,c.y,c.z,n.x*6+rv(4),n.y*6+rv(4),n.z*6+rv(4),.4+Math.random()*.4,.62,.52,.42,.6);
 boom3(c,5,col,14);try{noise(.12,.06,320);tone(90,55,.12,'sawtooth',.025)}catch(e){}}
// minerai récupéré en creusant : 7 points dans la sphère enlevée (seulement la roche encore pleine)
const VXORE=['fer','titane','cristal','or'];
function vxOreTake(c,r){const core=VX.V.core,got={};let n=0;for(const[a,b,d]of[[0,0,0],[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){const x=c.x+a*r*.55,y=c.y+b*r*.55,z=c.z+d*r*.55;
  if(vxF(x,y,z,r+1)>=0||core.OUT.m!=0)continue;const o=core.ore(x,y,z,-core.OUT.ds);if(o&&Math.random()<.45){got[o]=(got[o]||0)+1;n++}}
 if(!n)return;let room=cap()-cargoUsed();if(room<=0){if(!VX.told.full||t-VX.told.full>8){VX.told.full=t;toast('Soute pleine — vends le minerai dans une station')}return}
 for(const o in got){const id=VXORE[o-1],q=Math.min(room,2,got[o]);if(q<=0)break;G.cargo[id]=(G.cargo[id]||0)+q;MINQ[id]=(MINQ[id]||0)+q;room-=q}MINT=t;SFX.pick();
 if(!VX.told.ore){VX.told.ore=1;setTimeout(()=>toast('⛏ Les filons colorés valent cher : fer près de la surface, titane plus bas, cristal et or en profondeur'),1500)}}
function vxBeamS(){const u=VX.beam.userData;u.s0.scale.multiplyScalar(.1);u.s1.scale.multiplyScalar(.13);u.s2.scale.multiplyScalar(.18)}
function vxSaveDigs(){if(!VX.p||!VX.V)return;const D=GX('vxd',{}),a=[];for(const q of VX.V.digs.slice(-2000))a.push(q[0],q[1],q[2],q[3]);if(a.length)D[VX.p.name]=a;VX.dirty=0}

// ----- boucle (appelée par hud.js à la place de SURF.update) -----
function vxUpdate(dt){if(!VX.V){mode='space';return}const p=VX.p,ud=p.mesh&&p.mesh.userData;if(ud&&ud.sph){ud.sph.rotation.y+=dt*.004;if(ud.cl)ud.cl.rotation.y+=dt*.012}vxFrame(p);vxSunUpd();
 if(!S.dead){if(VX.foot)vxFootUpdate(dt);else if(VX.asc)vxAscend(dt);else vxFly(dt)}
 if(VX.foot&&VX.park){const up=_vxA.copy(S.pos).normalize(),f=vxF(S.pos.x,S.pos.y,S.pos.z,6),r=(VX.shipR||3.4)*.75;if(f>r+.1)S.pos.addScaledVector(up,-Math.min(f-r,dt*6));fwd();const ft=_vxB.copy(_f).addScaledVector(up,-_f.dot(up));if(ft.lengthSq()>1e-4)S.q.slerp(basisQ(ft.normalize(),up),damp(3,dt))}
 if(!VX.foot)vxShipCol(dt);
 if(!VX.foot&&S.pos.length()>VX.P.R*1.45+330){vxExit(false);return}
 if(VX.dirty&&(VX.saveT-=dt)<=0){VX.saveT=25;vxSaveDigs()}
 vxStory(dt);if(MINT&&t-MINT>.6&&Object.keys(MINQ).length)minToast();if(S.hp<=0)die()}
// uniformes, lumières et niveau de détail (après le placement de la caméra)
function vxView(dt){const U=VX.U,P=VX.P;if(!U)return;const cp=camera.position,r=cp.length(),up=_vxA.copy(cp).normalize();
 VX.V.update(cp,dt);U.tm.value=t;U.camUp.value.copy(up);const top=P.R+P.eMax*.8+P.R*.035,alt=r-P.R,a=clamp(alt/(top-P.R),0,1.5);
 U.dens.value=P.atm?clamp(1.08-a,0,1):0;U.dip.value=Math.sqrt(Math.max(0,1-(P.R/Math.max(P.R,r))**2));U.fogK.value=P.atm?.00055*U.dens.value*(P.ty=='Désertique'?1.6:1):0;
 const f=vxF(cp.x,cp.y,cp.z,2),depC=-VX.V.core.OUT.ds;U.caveK.value=clamp((depC-3)/9,0,1);
 U.waterK.value=P.Rs>0&&!P.ice&&r<P.Rs&&depC<2&&P.sea!='lave'?1:0;if(VX.atm)VX.atm.material.uniforms.aK.value=clamp((a-.55)*2.5,0,1);
 if(VX.sea){VX.sea.material.uniforms.Rs.value=P.Rs;VX.sea.visible=U.caveK.value<.6}VX.sky.position.copy(cp);
 const sd=U.sunDir.value,me=VX.foot?VX.fp:S.pos,upM=_vxB.copy(me).normalize(),day=vxSS(-.12,.15,upM.dot(sd)),dM=-vxF(me.x,me.y,me.z,2)>-99?-VX.V.core.OUT.ds:0,vis=1-clamp((dM-1.5)/7,0,1);
 VX.dl.position.copy(me).addScaledVector(sd,400);VX.dl.target.position.copy(me);VX.dl.intensity=1.15*day*vis;VX.hemi.intensity=(.12+.5*day*U.dens.value)*vis+.04;
 // lampe : frontale (à pied) ou phares (vaisseau), la nuit et sous terre
 const lk=clamp(Math.max(U.caveK.value,clamp((dM-2)/5,0,1),1-day)*1.1,0,1);U.lampK.value=lk;
 if(VX.foot){U.lampPos.value.copy(VX.fp).addScaledVector(upM,1.7);U.lampDir.value.set(0,0,-1).applyQuaternion(camera.quaternion)}else{fwd();U.lampPos.value.copy(S.pos).addScaledVector(_f,5);U.lampDir.value.copy(_f)}
 VX.pl.intensity=lk*1.6;VX.pl.position.copy(U.lampPos.value)}
// caméra : à pied (3e personne avec collision, ou 1re personne) ; en vol, caméra du jeu puis recul si elle entre dans le relief
function vxCamFix(){const o=S.pos,c=camera.position,d=_vxB.copy(c).sub(o),L=d.length();if(L<.1)return;d.divideScalar(L);let tt=0;
 for(let i=0;i<40&&tt<L;i++){const x=o.x+d.x*tt,y=o.y+d.y*tt,z=o.z+d.z*tt,f=vxF(x,y,z,2);if(f<1.2){c.copy(o).addScaledVector(d,Math.max(2,tt-1));break}tt+=Math.max(.4,f*.7)}}
function vxFootCam(dt){const p=VX.fp,up=_vxA.copy(p).normalize(),cy=VX.cy,cp=VX.cp;
 if(VX.ck){camera.position.copy(p).addScaledVector(up,1.72);camera.quaternion.copy(VX.fq).multiply(_vxQ.setFromEuler(new THREE.Euler(-cp*.8,cy,0,'YXZ')))}
 else{const tg=p.clone().addScaledVector(up,1.6),fw=new V3(-Math.sin(cy),0,-Math.cos(cy)).applyQuaternion(VX.fq),rt=new V3(Math.cos(cy),0,-Math.sin(cy)).applyQuaternion(VX.fq),dist=6.5;
  const want=tg.clone().addScaledVector(fw,-dist*Math.cos(cp)).addScaledVector(up,dist*Math.sin(cp)+.5).addScaledVector(rt,.9);
  // recul limité par le relief (plafonds de grottes, pentes)
  const d=want.clone().sub(tg),L=d.length();d.divideScalar(L);let tt=0,lim=L;for(let i=0;i<30&&tt<L;i++){const x=tg.clone().addScaledVector(d,tt),f=vxF(x.x,x.y,x.z,2);if(f<.45){lim=Math.max(.6,tt-.35);break}tt+=Math.max(.15,f*.8)}
  want.copy(tg).addScaledVector(d,Math.min(L,lim));if(camInit){camera.position.copy(want);camInit=false}else camera.position.lerp(want,damp(12,dt));camera.up.copy(up);camera.lookAt(tg.addScaledVector(fw,3))}
 if(shake>0){camera.position.x+=rv(shake*.3);camera.position.y+=rv(shake*.3);camera.position.z+=rv(shake*.3);shake=Math.max(0,shake-dt*2.5)}
 const fv=innerWidth<innerHeight?76:62;if(Math.abs(camera.fov-fv)>.05){camera.fov=fv;camera.updateProjectionMatrix()}sky.position.copy(camera.position)}
{const _uc=updCam;updCam=function(dt){if(mode!='vox'){_uc(dt);return}try{if(VX.foot)vxFootCam(dt);else{_uc(dt);if(!ckActive())vxCamFix()}vxView(dt)}catch(e){console.error(e)}}}
// commandes de la caméra à pied
OV.addEventListener('pointerdown',e=>{if(mode!='vox'||!VX.foot)return;if(e.pointerType=='mouse'&&DESK&&!document.pointerLockElement&&!(typeof UI4!='undefined'&&UI4.free)){try{OV.requestPointerLock()}catch(_){}}if(e.pointerType!='mouse'&&e.clientX>=innerWidth*.62)VX.drag={id:e.pointerId,x:e.clientX,y:e.clientY}});
OV.addEventListener('pointermove',e=>{if(VX.drag&&VX.drag.id==e.pointerId){VX.cy-=(e.clientX-VX.drag.x)*.008;VX.cp=clamp(VX.cp+(e.clientY-VX.drag.y)*.006,-.7,1.1);VX.drag.x=e.clientX;VX.drag.y=e.clientY;VX.lastLook=t}});
{const end=e=>{if(VX.drag&&VX.drag.id==e.pointerId)VX.drag=null};OV.addEventListener('pointerup',end);OV.addEventListener('pointercancel',end)}
document.addEventListener('mousemove',e=>{if(mode=='vox'&&VX.foot&&document.pointerLockElement===OV){VX.cy-=e.movementX*.0026;VX.cp=clamp(VX.cp+e.movementY*.002,-.7,1.1);VX.lastLook=t}});
$('footb').addEventListener('click',()=>{if(mode=='vox')vxFootEnter()});
addEventListener('keydown',e=>{if(e.repeat||e.target.tagName=='INPUT')return;if(e.code=='KeyF'&&mode=='vox'&&!VX.foot&&vxCanExit())vxFootEnter()});
TICK.push(()=>{if(mode=='vox')setD('footb',vxCanExit()?'block':'none')});

// ----- interface : panneau d'infos, bouton principal, surimpression, radar -----
function vxDepth(){const me=VX.foot?VX.fp:S.pos;vxF(me.x,me.y,me.z,2);return{d:-VX.V.core.OUT.ds,r:me.length()}}
function vxInfo(){const p=VX.p,P=VX.P,D=vxDepth();const where=D.r<P.cR+5?ICO('flame')+' Noyau de la planète':D.d>4?ICO('drill')+' Sous terre · '+Math.round(D.d)+' m':ICO('takeoff')+' Altitude '+Math.max(0,Math.round(-D.d))+' m';
 return{info:`<span style="color:#bfe6ff">${ICO('planet')} ${p.name} · ${vxTy(p)}</span><br>${where}`,sub:`<span title="Galeries creusées">${ICO('drill')}<b>${VX.V.digs.length}</b></span><span title="Planètes découvertes">${ICO('planet')}<b>${G.disc.size}</b></span>`,zone:['Planète voxel','#9cf']}}
function vxPrompt(){if(S.entry)return'';if(VX.foot)return vxNearShip()?actLabel('🚀 REMONTER À BORD'):'';if(VX.asc)return'';return ICO('takeoff')+'Décoller'}
function vxAction(){if(VX.foot){if(vxNearShip())vxFootLeave();return}if(!VX.asc&&!S.dead){VX.asc={t:0};toast('Décollage — cap vers l\'espace');SFX.buy()}}
function vxRadar(blip){if(VX.foot)blip(S.pos,'#5af0a0',3,true);if(VX.frag)blip(VX.frag.pos,'#c890ff',3,true)}
function vxOverlay(W,H){const foot=VX.foot;
 if(foot){OX.strokeStyle='rgba(200,240,255,.8)';OX.lineWidth=1.5;OX.beginPath();OX.arc(W/2,H/2,5,0,TAU);OX.stroke();if(VX.fp.distanceTo(S.pos)>30)edgeMarker(S.pos,'#5af0a0','Vaisseau','🚀')}
 else{fwd();const aim=proj(_w.copy(S.pos).addScaledVector(_f,320));if(aim.front){OX.strokeStyle='rgba(160,230,255,.75)';OX.lineWidth=1.5;OX.beginPath();OX.arc(aim.x,aim.y,11,0,TAU);OX.stroke()}
  if(!window.THR6VIS){const sy=H-(DESK?36:96);OX.textAlign='right';OX.font="700 17px 'Chakra Petch',system-ui";OX.fillStyle='rgba(205,242,255,.95)';OX.fillText(Math.round(S.spd)+'',W/2+6,sy);OX.textAlign='left';OX.font="600 10px 'Chakra Petch',system-ui";OX.fillStyle='rgba(132,168,189,.95)';OX.fillText('m/s',W/2+10,sy)}}
 if(VX.frag)edgeMarker(VX.frag.pos,'#c890ff','Fragment','★');
 {const D=vxDepth(),txt=D.r<VX.P.cR+5?'NOYAU':D.d>4?'PROFONDEUR '+Math.round(D.d)+' m':'ALTITUDE '+Math.max(0,Math.round(-D.d))+' m';OX.textAlign='center';OX.font="600 11px 'Chakra Petch',system-ui";OX.fillStyle='rgba(170,220,255,.8)';OX.fillText(txt,W/2,DESK?H-60:H-122)}
 if(foot){const sp=S.pos.clone(),sq=S.q.clone();S.pos.copy(VX.fp);S.q.copy(VX.fq).multiply(_vxQ.setFromAxisAngle(AY,VX.cy));try{if(!ckActive())radar()}finally{S.pos.copy(sp);S.q.copy(sq)}}else if(!ckActive())radar();
 if(ckActive())ckHUD(W,H);
 if(stick){const R=stick.R||70;OX.strokeStyle='rgba(120,220,255,.45)';OX.lineWidth=2;OX.beginPath();OX.arc(stick.ox,stick.oy,R,0,TAU);OX.stroke();OX.fillStyle='rgba(120,220,255,.35)';OX.beginPath();OX.arc(stick.ox+stick.x*R,stick.oy+stick.y*R,R*.36,0,TAU);OX.fill()}}

// ----- histoire : le fragment du chapitre 2 se trouve aussi sur la planète voxel -----
function vxStory(dt){const SGx=typeof SG=='function'&&SG();if(!SGx||SGx.ch!=2||!SGx.pl||!VX.p||SGx.pl.n!==VX.p.name){if(VX.frag){VX.sc.remove(VX.frag.m);VX.frag=null}return}
 if(!VX.frag){let d=_vxA.copy(S.pos).normalize();const t2=new V3(.3,.8,.5).cross(d).normalize();d=d.clone().addScaledVector(t2,.22).normalize();let r=VX.P.Rx;for(let i=0;i<400;i++){const x=d.clone().multiplyScalar(r);if(vxF(x.x,x.y,x.z,2)<0)break;r-=1}
  const m=new THREE.Mesh(new THREE.OctahedronGeometry(5,0),new THREE.MeshStandardMaterial({color:0xc080ff,emissive:0x8030ff,emissiveIntensity:1.2,metalness:.3,roughness:.1}));m.scale.y=1.8;m.position.copy(d).multiplyScalar(Math.max(r,VX.P.Rs||0)+10);m.add(sprite(0xb070ff,60,.8));VX.sc.add(m);VX.frag={m,pos:m.position};toast('Signal de l\'Écho détecté à proximité')}
 VX.frag.m.rotation.y+=dt;const me=VX.foot?VX.fp:S.pos;if(VX.frag.pos.distanceTo(me)<22){VX.sc.remove(VX.frag.m);VX.frag=null;SGx.ch=3;SFX.win();boom3(me,30,0xb070ff,70,true);
  say([['ia','Fragment récupéré. Il émet une fréquence… familière.'],['tess','Ramène-le vite à la Base Alpha, je dois l\'analyser !']])}}
// multijoueur : une zone par planète voxel (positions dans le repère de la planète)
const vxPName=()=>mode=='vox'&&VX.p?VX.p.name:null;
// atterrir = entrer dans la scène voxel (pas de rentrée atmosphérique enflammée ni d'ancienne surface)
{const _seV=startEntry;startEntry=function(p){if(vxEn()&&p&&!p.ring&&mode=='space'&&!S.entry&&!S.dead){vxEnter(p);return}_seV(p)}}
