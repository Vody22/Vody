// ===== ANIMATIONS DU VAISSEAU : train d'atterrissage, verrière qui s'ouvre, flammes orientables ; EXPLOSIONS selon l'arme =====
const AN3={geo:null,gm:new THREE.MeshStandardMaterial({color:0x2c3036,metalness:.8,roughness:.35}),gl:new THREE.MeshStandardMaterial({color:0xa4acb6,metalness:.9,roughness:.22}),
lt:new THREE.MeshBasicMaterial({color:0xffb040}),_m:new THREE.Matrix4(),_b:new THREE.Box3(),_i:new THREE.Matrix4()};
function an3Geo(){return AN3.geo||(AN3.geo={st:new THREE.CylinderGeometry(.08,.1,1,10),pis:new THREE.CylinderGeometry(.13,.13,.42,10),pad:new THREE.CylinderGeometry(.36,.42,.16,18),door:RB3(.62,.06,1.05),lt:new THREE.SphereGeometry(.06,8,6)})}
// boîte englobante du vaisseau (sans flammes ni halos), dans le repère du corps
function an3Box(b,filter){const bb=new THREE.Box3(),inv=AN3._i.copy(b.matrixWorld).invert();b.traverse(o=>{if(!o.isMesh||!o.geometry||!filter(o))return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();AN3._b.copy(o.geometry.boundingBox).applyMatrix4(AN3._m.multiplyMatrices(inv,o.matrixWorld));bb.union(AN3._b)});return bb}
const an3Solid=o=>{const m=o.material;return!(m&&(m.transparent||m.blending===THREE.AdditiveBlending))&&!(o.parent&&o.parent.userData&&o.parent.userData.an3)};
function an3Rig(root){const ud=root.userData,b=ud.body;if(!b||ud.gear)return;root.updateMatrixWorld(true);const bb=an3Box(b,an3Solid);if(bb.isEmpty())return;
const L=bb.max.z-bb.min.z,W=bb.max.x-bb.min.x,y0=bb.min.y,h=clamp(L*.12,.9,2.2),Gm=an3Geo(),list=[];
const mk=(x,z,s)=>{const piv=new THREE.Group();piv.userData.an3=1;piv.position.set(x,y0+.12,z);const st=new THREE.Mesh(Gm.st,AN3.gl);st.scale.set(s,h,s);st.position.y=-h/2;const ps=new THREE.Mesh(Gm.pis,AN3.gm);ps.scale.setScalar(s);ps.position.y=-.25;
const pd=new THREE.Mesh(Gm.pad,AN3.gm);pd.scale.setScalar(s);pd.position.y=-h;const lt=new THREE.Mesh(Gm.lt,AN3.lt);lt.position.set(0,-h*.55,-.12*s);piv.add(st,ps,pd,lt);b.add(piv);
const dr=new THREE.Mesh(Gm.door,AN3.gm);dr.userData.an3=1;dr.position.set(x,y0+.03,z);dr.scale.setScalar(s);b.add(dr);list.push({piv,dr})};
mk(0,bb.min.z+L*.24,.85);mk(-W*.2,bb.min.z+L*.66,1);mk(W*.2,bb.min.z+L*.66,1);ud.gear={list,v:0};an3Gear(root,0)}
function an3Gear(root,v){const G=root.userData.gear;if(!G)return;G.v=v;const k=v*v*(3-2*v);for(const g of G.list){g.piv.rotation.x=-(1-k)*Math.PI*.5;g.piv.scale.setScalar(.3+.7*k);g.piv.visible=v>.02;g.dr.rotation.z=(g.dr.position.x>=0?-1:1)*Math.min(1,v*2.2)*1.2;g.dr.visible=v>.02}}
// verrière : regroupée autour d'une charnière à l'arrière pour pouvoir s'ouvrir
function an3Canopy(root){const ud=root.userData,b=ud.body;if(!b||ud.can!==undefined)return;ud.can=null;const gl=[];b.traverse(o=>{if(o.isMesh&&o.material&&(o.material===MAT.glass||(typeof SP3!='undefined'&&o.material===SP3.glass)))gl.push(o)});if(!gl.length)return;
root.updateMatrixWorld(true);const bb=an3Box(b,o=>gl.includes(o));if(bb.isEmpty())return;
// les arceaux de la verrière suivent la vitre
{const big=bb.clone().expandByScalar(.12),inv=AN3._i.copy(b.matrixWorld).invert(),pil=new Set();if(ud.pilot)ud.pilot.traverse(o=>pil.add(o));b.traverse(o=>{if(!o.isMesh||gl.includes(o)||pil.has(o)||!o.geometry)return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();AN3._b.copy(o.geometry.boundingBox).applyMatrix4(AN3._m.multiplyMatrices(inv,o.matrixWorld));if(big.containsBox(AN3._b))gl.push(o)})}
const piv=new THREE.Group();piv.userData.an3=1;piv.position.set(0,bb.min.y+(bb.max.y-bb.min.y)*.2,bb.max.z);b.add(piv);piv.updateMatrixWorld(true);for(const o of gl)piv.attach(o);ud.can={piv,v:0}}
function an3Can(root,v){const C=root.userData.can;if(!C)return;C.v=v;const k=v*v*(3-2*v);C.piv.rotation.x=k*.8}
{const _bsA=buildShip;buildShip=function(P,l){const r=_bsA(P,l);try{an3Rig(r);an3Canopy(r)}catch(e){console.warn(e)}return r}}
// ----- par image : train, verrière, flammes -----
function an3Tick(dt){if(typeof ship=='undefined'||!ship||!ship.userData.body)return;const ud=ship.userData;if(!ud.gear){try{an3Rig(ship);an3Canopy(ship)}catch(e){}}
let tg=0;if(S.docked)tg=1;else if(mode=='surf'){if(FOOT.on)tg=1;else if(!S.ascent){const p=ship.position,gy=Math.max(0,SURF.height(p.x,p.z)),alt=p.y-gy;if(alt<30&&S.spd<60)tg=1}}
const gq=ud.gear;if(gq){const v=gq.v+clamp(tg-gq.v,-dt*1.3,dt*1.3),mv=Math.abs(v-gq.v)>1e-4;if(mv){if(!gq.mv){gq.mv=1;try{noise(.5,.05,700);tone(140,90,.4,'square',.02)}catch(e){}}an3Gear(ship,v)}else gq.mv=0}
const C=ud.can;if(C){const ct=FOOT.on&&mode=='surf'?1:0,v=C.v+clamp(ct-C.v,-dt*1.1,dt*1.1);if(Math.abs(v-C.v)>1e-4)an3Can(ship,v)}if(ud.pilot)ud.pilot.visible=!FOOT.on;
// flammes orientées dans le sens du virage (poussée vectorielle)
if(ud.flames&&!FOOT.on){const kx=clamp((S.pitchV||0)*.35,-.3,.3),ky=clamp(-(S.yawV||0)*.35,-.3,.3);for(const f of ud.flames){if(!f.fl)continue;if(!f.r0)f.r0=f.fl.rotation.clone();f.fl.rotation.x=lerp(f.fl.rotation.x,f.r0.x+kx,Math.min(1,dt*8));f.fl.rotation.y=lerp(f.fl.rotation.y,f.r0.y+ky,Math.min(1,dt*8))}}}
TICK.push(an3Tick);
// ----- explosions différentes selon l'arme qui a détruit l'ennemi -----
const EX3={L:[],ring:new THREE.RingGeometry(.72,1,48),sph:new THREE.SphereGeometry(1,24,16)};
function ex3Mat(col,op){return new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})}
function ex3Add(o,life,grow,op,face){const sc=curScene();sc.add(o);EX3.L.push({o,t:0,life,grow,op,face,s0:o.scale.x,sc})}
function ex3Spr(p,col,size,life,grow,op){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:col,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false}));s.position.copy(p);s.scale.setScalar(size);ex3Add(s,life,grow,op,false);return s}
function ex3Ring(p,col,size,life,grow,op,face,rot){const m=new THREE.Mesh(EX3.ring,ex3Mat(col,op));m.position.copy(p);m.scale.setScalar(size);if(rot)m.rotation.set(rot.x,rot.y,rot.z);ex3Add(m,life,grow,op,face);return m}
function ex3Tick(dt){for(let i=EX3.L.length-1;i>=0;i--){const q=EX3.L[i];q.t+=dt;const k=q.t/q.life;if(k>=1||q.o.parent!==curScene()){if(q.o.parent)q.o.parent.remove(q.o);q.o.material.dispose();EX3.L.splice(i,1);continue}
const s=q.s0*(1+q.grow*(1-Math.pow(1-k,2.2)));q.o.scale.setScalar(s);q.o.material.opacity=q.op*(1-k)*(1-k*.5);if(q.face)q.o.quaternion.copy(camera.quaternion)}}
TICK.push(ex3Tick);
function ex3Kill(e){if(!e||!e.pos)return;const p=e.pos.clone(),w=(G.w&&G.w[G.wi%G.w.length])||'canon',big=!!(e.boss||e.big||e.ty=='lourd'),R=Math.max(8,(e.sz||8))*(big?1.3:1);
if(EX3.L.length>60)return;
if(w=='laser'){ex3Spr(p,0xffffff,R*1.6,.35,2,1);ex3Ring(p,0x7fe8ff,R*.8,.6,5,.9,true);for(let i=0;i<3;i++)ex3Ring(p,0x9fd8ff,R*.6,.45+i*.1,4,.7,false,new V3(Math.random()*3,Math.random()*3,Math.random()*3));boom3(p,DESK?34:18,0x80e0ff,110)}
else if(w=='missile'){ex3Spr(p,0xffc070,R*2.2,.5,2.2,1);const fb=new THREE.Mesh(EX3.sph,ex3Mat(0xff7a30,.55));fb.position.copy(p);fb.scale.setScalar(R*.5);ex3Add(fb,.7,2.6,.5,false);ex3Ring(p,0xffd8a0,R*.6,.8,6,.55,true);
for(const d of[160,330]){setTimeout(()=>{if(mode!='space'&&mode!='surf')return;const q=p.clone().add(new V3(rv(R),rv(R*.6),rv(R)));try{boom3(q,DESK?22:12,0xffa040,80,true)}catch(x){}ex3Spr(q,0xff9a40,R*1.2,.4,1.6,.9);try{SFX.boom()}catch(x){}},d)}}
else if(w=='mine'){const dm=new THREE.Mesh(EX3.sph,ex3Mat(0xd070ff,.32));dm.position.copy(p);dm.scale.setScalar(R*.4);ex3Add(dm,.9,3.6,.32,false);ex3Ring(p,0xff80ff,R*.5,.9,5,.6,false,new V3(Math.PI/2,0,0));ex3Spr(p,0xffd0ff,R*1.4,.4,2,.9);boom3(p,DESK?26:14,0xff70e0,90)}
else{ex3Spr(p,0xffe0b0,R*1.3,.32,1.8,.95);ex3Ring(p,0xffb060,R*.5,.45,4.5,.7,true);boom3(p,DESK?22:12,0xffc070,140)}}
{const _hk=hitEnemy;hitEnemy=function(e,d,p){const was=e&&e.dead;_hk(e,d,p);try{if(e&&!was&&e.dead)ex3Kill(e)}catch(x){}}}
