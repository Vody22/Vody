// ===== STATIONS PAR FACTION (Alliance, pirates, Guilde, frontière) + AMARRAGE ET DÉPART CINÉMATIQUES (pilote automatique jusqu'au berceau d'amarrage, plans de caméra) =====
const STY={alliance:{n:'Alliance',metal:0xdfe7f2,dark:0x2c4166,em:0x0a1a3a,hab:0xd6e6ff,l1:0x60b0ff,l2:0xffffff,hub:0x9fd0ff,acc:0x4aa0ff},
pirates:{n:'Pirates',metal:0x6b4b3a,dark:0x2a1b15,em:0x200500,hab:0xffb080,l1:0xff3030,l2:0xff8a30,hub:0xff5040,acc:0xff3a2a,rough:.75},
guilde:{n:'Guilde',metal:0xd0a54a,dark:0x4a3a22,em:0x201000,hab:0xffe0a0,l1:0xffb030,l2:0xffe080,hub:0xffc050,acc:0xffa020},
front:{n:'Frontière',metal:0x7f8a74,dark:0x30382c,em:0x081004,hab:0xe0f0c0,l1:0xffd060,l2:0xff5050,hub:0xffe090,acc:0xffc040}};
const STM={};
function styMats(k){if(STM[k])return STM[k];const s=STY[k],m=MAT.metal.clone(),d=MAT.dark.clone();m.color.setHex(s.metal);m.emissive.setHex(s.em);m.emissiveIntensity=1;d.color.setHex(s.dark);if(s.rough){m.roughness=s.rough;d.roughness=s.rough}
const h=new THREE.MeshStandardMaterial({color:s.hab,metalness:.5,roughness:.4,emissive:0xffffff,emissiveMap:WINT,emissiveIntensity:.9,map:WINT}),a=new THREE.MeshBasicMaterial({color:s.acc}),g=new THREE.MeshStandardMaterial({color:s.dark,metalness:.6,roughness:.5,emissive:s.acc,emissiveIntensity:.15});return STM[k]={m,d,h,a,g}}
function styKey(st){if(st.n=='Base Alpha')return'alliance';const f=stFac(st);if(f=='alliance'&&(stEcon(st)=='Minière'||stEcon(st)=='Industrielle'))return'guilde';return STY[f]?f:'alliance'}
const SB=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
function cable(par,mat,a,b,r=.35){const d=b.clone().sub(a),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),5).rotateX(Math.PI/2),mat);o.position.copy(a).addScaledVector(d,.5);o.quaternion.setFromUnitVectors(new V3(0,0,1),d.normalize());par.add(o);return o}
// décor propre à chaque faction (un seul groupe par station, remplacé si la faction change)
function styDeco(k,M,g){const D=new THREE.Group(),add=(geo,mat,x,y,z,rx=0,ry=0,rz=0,par=D)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);par.add(o);return o},rot=g.userData.rot,R=new THREE.Group();rot.add(R);D.userData.rotPart=R;
// berceaux d'amarrage aux deux bouts de l'axe + feux de guidage
for(const s of[-1,1]){add(new THREE.TorusGeometry(22,1.3,6,28),M.g,0,0,s*118);for(let i=0;i<4;i++){const a=i/4*TAU+Math.PI/4;add(SB(2,2,46),M.d,Math.cos(a)*22,Math.sin(a)*22,s*95)}
for(let i=0;i<4;i++){const a=i/4*TAU+Math.PI/4;add(SB(1.2,1.2,6),M.a,Math.cos(a)*22,Math.sin(a)*22,s*118)}}
const gl=[];for(const s of[-1,1])for(let i=0;i<7;i++)for(const x of[-14,14]){const sp=sprite(STY[k].l1,5);sp.position.set(x,0,s*(140+i*18));D.add(sp);gl.push({sp,i})}D.userData.gl=gl;
if(k=='alliance'){for(const s of[-1,1]){add(SB(.6,18,12),M.a,s*21,0,30);add(SB(.8,20,14),M.d,s*20.4,0,30)}for(let i=0;i<12;i++){const a=i/12*TAU+.26;add(SB(3,1,16),M.a,Math.cos(a)*67.5,Math.sin(a)*67.5,0,0,0,a,R)}
const b=sprite(0x9fd0ff,30,.8);b.position.set(0,32,0);D.add(b);add(new THREE.CylinderGeometry(.6,.6,14,6),M.d,0,27,0)}
else if(k=='pirates'){for(let i=0;i<16;i++){const a=i/16*TAU;add(new THREE.ConeGeometry(2,12+(i%3)*5,5),M.d,Math.cos(a)*72,Math.sin(a)*72,(i%2?4:-4),0,0,a-Math.PI/2,R)}
const r=rng(31);for(let i=0;i<14;i++){const a=r()*TAU,z=(r()-.5)*110;add(SB(6+r()*14,1.2,6+r()*12),r()<.5?M.d:M.m,Math.cos(a)*(16+r()*6),Math.sin(a)*(16+r()*6),z,r()*.6,r()*.6,a)}
for(const s of[-1,1]){const h=new THREE.Group();h.position.set(s*95,-25,-30);h.rotation.set(.4*s,.8,.3);D.add(h);add(SB(5,3,16),M.d,0,0,0,0,0,0,h);add(SB(14,.6,5),M.d,0,0,2,0,0,.15*s,h);cable(D,M.d,new V3(s*95,-25,-30),new V3(s*64,-12,-4))}
for(let i=0;i<4;i++){const sp=sprite(0xff3020,14,.9);const a=i/4*TAU;sp.position.set(Math.cos(a)*30,Math.sin(a)*30,-40);D.add(sp)}}
else if(k=='guilde'){for(const s of[-1,1]){add(new THREE.SphereGeometry(10,14,10),M.m,0,s*34,s*30);add(SB(3,14,3),M.d,0,s*24,s*30);add(new THREE.CylinderGeometry(6,6,24,12),M.d,s*34,0,-34,0,0,Math.PI/2)}
for(let i=0;i<4;i++){const a=i/4*TAU+.4,c=Math.cos(a),n=Math.sin(a);add(SB(30,2.4,2.4),M.a,c*82,n*82,6,0,0,a,R);add(SB(3,3,3),M.d,c*96,n*96,6,0,0,a,R);cable(R,M.d,new V3(c*96,n*96,6),new V3(c*96,n*96,22),.25);add(SB(4,4,4),M.a,c*96,n*96,24,0,0,a,R)}
const ast=add(new THREE.IcosahedronGeometry(16,1),new THREE.MeshStandardMaterial({color:0x6a5f55,roughness:.95,flatShading:true}),0,-104,-24);ast.scale.set(1.2,.8,1);cable(D,M.d,new V3(0,-22,-24),new V3(0,-92,-24),.8);for(let i=0;i<3;i++){const sp=sprite(0xffb030,8);sp.position.set(rv(12),-104+rv(8),-24+rv(12));D.add(sp)}}
else{for(let i=0;i<6;i++){const a=i/6*TAU+.52,T=new THREE.Group();T.position.set(Math.cos(a)*68,Math.sin(a)*68,0);T.rotation.z=a-Math.PI/2;R.add(T);add(SB(6,3,6),M.d,0,0,0,0,0,0,T);for(const x of[-1,1])add(new THREE.CylinderGeometry(.45,.45,9,6),M.m,x*1.4,2.4,-3,Math.PI/2,0,0,T)}
for(let i=0;i<8;i++){const a=i/8*TAU;add(SB(10,2,18),M.d,Math.cos(a)*23,Math.sin(a)*23,0,0,0,a+Math.PI/2)}for(const s of[-1,1]){const sp=sprite(0xfff0b0,22,.6);sp.position.set(s*30,20,-60);D.add(sp)}}
return D}
function styApply(st){const g=st.mesh,k=styKey(st),M=styMats(k),u=g.userData;if(u.sty===k)return;
if(u.fdeco){g.remove(u.fdeco);if(u.fdeco.userData.rotPart)u.rot.remove(u.fdeco.userData.rotPart);u.fdeco.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
g.traverse(o=>{if(!o.isMesh)return;const mm=o.material,S0=o.userData.sty0||(o.userData.sty0=mm);if(S0===MAT.metal)o.material=M.m;else if(S0===MAT.dark)o.material=M.d;else if(S0.emissiveMap===WINT&&S0.map===WINT)o.material=M.h});
const s=STY[k];u.lights.forEach((l,i)=>{if(l.position.z===72||l.position.z===-72)return;l.material=spriteMat(i%3?s.l1:s.l2,1)});if(u.hubL)u.hubL.material=spriteMat(s.hub,.7);
u.fdeco=styDeco(k,M,g);g.add(u.fdeco);u.sty=k}
const STS2={t:0};
function styTick(dt){STS2.t-=dt;if(STS2.t<=0){STS2.t=1.5;for(const st of stations)if(st.mesh&&!st.ground)try{styApply(st)}catch(e){console.warn(e)}}
for(const st of stations){const u=st.mesh&&st.mesh.userData;if(!u||!u.fdeco)continue;if(Math.abs(st.x-S.pos.x)+Math.abs(st.z-S.pos.z)>4000)continue;for(const L of u.fdeco.userData.gl)L.sp.visible=((t*6-L.i)%7+7)%7<1.6}}
TICK.push(styTick);styTick(0);
{const _ls=loadSmall;loadSmall=function(c){_ls(c);if(c.st&&c.st.mesh&&!c.st.ground)try{styApply(c.st)}catch(e){console.warn(e)}}}
// faction affichée à l'amarrage
{const _dk=dock;dock=function(st){_dk(st);if(!st.ground&&!st.base){const k=styKey(st);if(k=='pirates')setTimeout(()=>toast('🏴‍☠️ Repaire pirate : les affaires se font sans poser de questions'),1600);else if(k=='guilde')setTimeout(()=>toast('⛏ Comptoir de la Guilde des mineurs'),1600)}dkIn(st)}}
// ----- amarrage cinématique -----
let DKA={on:0};
const dkCtr=st=>new V3(st.x,st.y,st.z);
function dkQ(eye,tg,up){const m=new THREE.Matrix4().lookAt(eye,tg,up);return new QT().setFromRotationMatrix(m)}
function dkIn(st){if(st.ground||!st.mesh||S.entry||S.dead||(typeof RC!='undefined'&&RC.on))return;const m=st.mesh;m.updateMatrixWorld();const lp=m.worldToLocal(S.pos.clone()),side=lp.z>=0?1:-1,up=new V3(0,1,0).transformDirection(m.matrixWorld);
const pB=m.localToWorld(new V3(0,0,side*124)),pA=m.localToWorld(new V3(0,6,side*215));DKA={on:1,mode:'in',st,t:0,dur:3.4,side,p0:S.pos.clone(),q0:S.q.clone(),pA,pB,qB:dkQ(pB,dkCtr(st),up),up,cp:m.localToWorld(new V3(105*(Math.random()<.5?1:-1),38,side*215))};
S.vel.set(0,0,0);S.spd=0;tone(220,440,.5,'sine',.04);if(typeof ckActive=='function'&&!ckActive())toast('🛰 Pilote automatique : amarrage en cours')}
{const _ud=undock;undock=function(){const st=S.docked;_ud();if(!st||st.ground||!st.mesh||DKA.skip||(typeof RC!='undefined'&&RC.on)){DKA={on:0};return}S.spd=16;S.vel.copy(fwd()).multiplyScalar(16);const m=st.mesh;m.updateMatrixWorld();const lp=m.worldToLocal(S.pos.clone()),side=lp.z>=0?1:-1;
DKA={on:1,mode:'out',st,t:0,dur:2.8,side,up:new V3(0,1,0).transformDirection(m.matrixWorld),cp:m.localToWorld(new V3(34*(Math.random()<.5?1:-1),12,side*330)),p0:S.pos.clone()};noise(.9,.18,500);tone(90,260,1,'sawtooth',.04)}}
const dkSm=k=>k*k*(3-2*k);
STICK.push(dt=>{if(!DKA.on)return;const D=DKA;D.t+=dt;if(S.dead||mode!='space'||(typeof RC!='undefined'&&RC.on)||S.pos.distanceTo(dkCtr(D.st))>900){DKA={on:0};camInit=true;return}
if(D.mode=='in'){if(S.docked!==D.st){DKA={on:0};camInit=true;return}const k=Math.min(1,D.t/D.dur),e=dkSm(k),a=1-e;S.pos.set(0,0,0).addScaledVector(D.p0,a*a).addScaledVector(D.pA,2*a*e).addScaledVector(D.pB,e*e);S.q.copy(D.q0).slerp(D.qB,dkSm(Math.min(1,k*1.5)));S.vel.set(0,0,0);S.spd=0;S.thr=k<.85?.35:0;
if(k>=1){DKA={on:0};camInit=true;tone(160,120,.25,'square',.05);noise(.3,.25,900);shake=Math.min(1,shake+.25)}}
else if(D.t>=D.dur){DKA={on:0};camInit=true}});
{const _uc=updCam;updCam=function(dt){if(!DKA.on||mode!='space'||FOOT.on||(typeof atelierOn=='function'&&atelierOn())||(typeof ckActive=='function'&&ckActive()))return _uc(dt);const D=DKA;
camera.position.copy(D.cp);camera.up.copy(D.up);const lk=_c1.copy(S.pos);if(D.mode=='in')lk.lerp(dkCtr(D.st),.3);camera.lookAt(lk);const fv=innerWidth<innerHeight?66:50;if(Math.abs(camera.fov-fv)>.05){camera.fov=fv;camera.updateProjectionMatrix()}sky.position.copy(camera.position)}}
