// ===== JEU (espace) =====
const _f=new V3(),_u=new V3(),_r=new V3(),_v=new V3(),_w=new V3(),_q=new QT(),AX=new V3(1,0,0),AY=new V3(0,1,0),AZ=new V3(0,0,1);
const curScene=()=>mode=='surf'?SURF.scene:scene;
let ship=buildShip();scene.add(ship);
function rebuildShip(){const p=ship.parent;p.remove(ship);ship=buildShip();p.add(ship)}
const fwd=(q=S.q,o=_f)=>o.set(0,0,-1).applyQuaternion(q);
// ----- pilotage -----
function fly(dt,{rate=1,minSpd=0,surf=false}={}){const[yaw,pitch]=steerInput(),R=(1.2+.08*(G.u[1]-1))*rate*HS().turn*PM('turn');
S.yawV=lerp(S.yawV||0,yaw,damp(7,dt));S.pitchV=lerp(S.pitchV||0,pitch,damp(7,dt));
_q.setFromAxisAngle(AY,S.yawV*R*dt);S.q.multiply(_q);_q.setFromAxisAngle(AX,S.pitchV*R*.85*dt);S.q.multiply(_q);
_r.set(1,0,0).applyQuaternion(S.q);fwd();if(Math.abs(_f.y)<.97){const roll=Math.asin(clamp(_r.y,-1,1));_q.setFromAxisAngle(AZ,-roll*damp(2.2,dt));S.q.multiply(_q)}S.q.normalize();
const tg=S.docked?0:isBrake()?Math.max(minSpd,10):isBoost()?boostSpd()*(surf?.6:1):cruise()*(surf?.75:1);S.spd=lerp(S.spd,tg,damp(isBoost()?1.6:2.4,dt));
fwd();S.vel.lerp(_v.copy(_f).multiplyScalar(S.spd),damp(3.2,dt));S.pos.addScaledVector(S.vel,dt);
S.thr=S.docked?0:clamp(tg/cruise(),0,2.6);S.bank=lerp(S.bank,S.yawV*.75,damp(5,dt))}
// ----- caméra -----
const camUp=new V3(0,1,0),camLook=new V3();let camInit=true,fovK=0;const CAMQ=new QT(),CAMS={y:0,p:0,a:0,ls:0};
function updCam(dt){if(S.docked&&mode=='space'&&TAB=='atelier'&&!S.dead){const R=30*Math.max(1,ship.userData.body.scale.z);ORB+=dt*.3;_u.set(0,1,0).applyQuaternion(S.q);const off=_v.set(Math.sin(ORB+.7)*R,R*.3,Math.cos(ORB+.7)*R).applyQuaternion(S.q).add(S.pos);camera.position.lerp(off,damp(2.5,dt));camUp.lerp(_u,damp(5,dt)).normalize();camera.up.copy(camUp);const rgt=_r.crossVectors(_w.copy(S.pos).sub(camera.position).normalize(),_u).normalize();camLook.copy(S.pos);if(innerWidth>innerHeight)camLook.addScaledVector(rgt,R*.4);else camLook.addScaledVector(_u,-R*.55);camera.lookAt(camLook);sky.position.copy(camera.position);return}
if(ckActive()){ckCam(dt);return}
// 3e personne : caméra plus éloignée, rotation amortie (elle balance dans les virages), recul à l'accélération, vibrations au boost
const bo=isBoost()&&!S.docked?1:0;fovK=lerp(fovK,bo,damp(2.4,dt));const sk=Math.max(1,ship.userData.body.scale.z),spK=clamp(S.spd/Math.max(1,cruise()),0,2.8),srf=mode=='surf'?.84:1;
if(camInit){CAMQ.copy(S.q);CAMS.ls=S.spd;camInit=false}else CAMQ.slerp(S.q,damp(5,dt));
CAMS.y=lerp(CAMS.y,S.yawV||0,damp(3.5,dt));CAMS.p=lerp(CAMS.p,S.pitchV||0,damp(3.5,dt));const acc=dt>0?(S.spd-CAMS.ls)/dt:0;CAMS.ls=S.spd;CAMS.a=lerp(CAMS.a,clamp(acc*.025,-4,6),damp(2.5,dt));
const back=(35+spK*3+fovK*10+CAMS.a)*sk*srf,up=(9.5+fovK*1.5)*sk*srf;
camera.position.copy(_v.set(-CAMS.y*5*sk,up+CAMS.p*2.4*sk,back).applyQuaternion(CAMQ).add(S.pos));
_u.set(0,1,0).applyQuaternion(S.q);camUp.lerp(_u,damp(5,dt)).normalize();camera.up.copy(camUp);camLook.copy(S.pos).addScaledVector(fwd(),90);camera.lookAt(camLook);
const vib=(fovK*.3+Math.max(0,spK-1.05)*.06)*sk;if(vib>.01){camera.position.x+=rv(vib);camera.position.y+=rv(vib);camera.position.z+=rv(vib)}
if(shake>0){camera.position.x+=rv(shake);camera.position.y+=rv(shake);shake=Math.max(0,shake-dt*2.5)}
const base=innerWidth<innerHeight?74:(DESK?60:54),fv=base+fovK*20+Math.max(0,spK-1)*3;if(Math.abs(camera.fov-fv)>.05){camera.fov=fv;camera.updateProjectionMatrix()}sky.position.copy(camera.position)}
function placeShip(dt){ship.position.copy(S.pos);ship.quaternion.copy(S.q);const ud=ship.userData;ud.body.rotation.z=S.bank;ud.body.rotation.x=(S.pitchV||0)*.18;
const k=S.thr;for(const f of ud.flames){f.fl.scale.set(1,1,.3+k*(.7+Math.random()*.3));f.fl.material.opacity=.35+k*.25;f.gs.scale.setScalar(2.6+k*1.6)}
ud.shield.material.uniforms.op.value=Math.max(0,shieldT);if(ud.plasma){const hk=S.heat||0;ud.plasma.visible=hk>.02;PLU.k.value=hk;ud.plasma.scale.set(6+hk*2,4.5+hk*1.5,14+hk*10);ud.plasma.position.z=2+hk*3}ud.shield.rotation.y+=dt;const bl=Math.sin(t*5)>.6;ud.nl.visible=ud.nr.visible=bl;
if(S.thr>.2&&Math.random()<.5){fwd();for(const f of ud.flames){f.gs.getWorldPosition(_w);SPK.emit(_w.x,_w.y,_w.z,-_f.x*30+rv(6),-_f.y*30+rv(6),-_f.z*30+rv(6),.3,.12,.25,.45,.2)}}}
// ----- tir et visée assistée -----
let PB=[],EB=[],DROPS=[],en=[],fcd=0,lock=null,shieldT=0,hurt=0,lastHp=S.hp;
const pbPool={},ebPool=[];let FALT=0;
function mkPB(c){const P=pbPool[c]||(pbPool[c]=[]);const m=P.pop()||boltMesh(c,0);curScene().add(m);return m}
function rmPB(b){b.m.parent&&b.m.parent.remove(b.m);(pbPool[b.c]||(pbPool[b.c]=[])).push(b.m)}
function mkEB(c){const m=boltMesh(c,1);curScene().add(m);return m}
function findLock(cands){fwd();let best=null,bs=1e9;for(const c of cands){_v.copy(c.pos).sub(S.pos);const d=_v.length();if(d>c.max*PM('lock')||d<4)continue;const ang=Math.acos(clamp(_v.dot(_f)/d,-1,1));if(ang>c.cone*PM('cone'))continue;const sc=ang*c.w+d/8000;if(sc<bs){bs=sc;best=c}}return best}
// points de sortie des tirs (bouches des canons visibles sur le vaisseau)
function muzzlePts(n){const ud=ship.userData,M=ud.muzzles&&ud.muzzles.length?ud.muzzles:[[-4.6,-.3,-6],[4.6,-.3,-6]],sc=ud.body.scale,L=[];
if(n==1){FALT=(FALT+1)%M.length;L.push(M[FALT])}else{for(let i=0;i<Math.min(n,M.length);i++)L.push(M[i]);const X=[[0,-.7,-8.5],[0,.9,-6]];let k=0;while(L.length<n)L.push(X[k++%2])}
return L.map(m=>({l:m,w:new V3(m[0]*sc.x,m[1]*sc.y,m[2]*sc.z).applyQuaternion(S.q).add(S.pos)}))}
function fire(dt){fcd-=dt;if(!isFire()||fcd>0||S.docked||S.entry||S.ascent)return;fcd=(.27-.022*G.u[0])/PM('rate');const n=(G.u[0]>=4?2:1)+PM('shots'),bs=950,dmg=G.u[0]*HS().dmg*PM('dmg')*PM('cdmg'),gp=partOf('guns'),col=gp.bc;fwd();
for(const M of muzzlePts(n)){const p=M.w;let dir=_f.clone();
if(lock){const tp=lock.pos.clone();if(lock.vel){const tt=tp.distanceTo(p)/bs;tp.addScaledVector(lock.vel,tt)}dir=tp.sub(p).normalize()}
mpShot(p,dir,'c');const m=mkPB(col);m.position.copy(p);m.lookAt(p.clone().sub(dir));PB.push({m,p:m.position,v:dir.multiplyScalar(bs).addScaledVector(S.vel,.5),l:1.6,d:dmg,c:col});muzzleFlash(M.l,col)}gunKick();SFX.shoot()}
const segHit=(a,b,c,r)=>{_v.copy(b).sub(a);const L2=_v.lengthSq();let k=L2?_w.copy(c).sub(a).dot(_v)/L2:0;k=clamp(k,0,1);return _w.copy(a).addScaledVector(_v,k).distanceToSquared(c)<r*r};
function updPB(dt,targets){for(const b of PB){const a=b.p.clone();b.p.addScaledVector(b.v,dt);b.l-=dt;for(const T of targets){if(b.l<=0)break;if(segHit(a,b.p,T.pos,T.r)){b.l=0;impactFX(b.p,b.c);T.hit(b.d,b.p)}}if(b.l<=0)rmPB(b)}PB=PB.filter(b=>b.l>0)}
function updEB(dt){for(const b of EB){if(!b.or){b.or=1;b.m.lookAt(_w.copy(b.m.position).sub(b.v))}b.m.position.addScaledVector(b.v,dt);b.l-=dt;if(b.m.position.distanceTo(S.pos)<7.5){b.l=0;damage(b.dmg);impactFX(b.m.position,S.sh>0?partOf('shield').scol||0x5ad0ff:0xff6650,.8)}if(b.l<=0)b.m.parent&&b.m.parent.remove(b.m)}EB=EB.filter(b=>b.l>0)}
// dégâts : le bouclier absorbe d'abord, l'éperon annule les collisions
function damage(n,kind){if(S.dead)return;if(kind=='col'&&PM('ram'))return;S.shT=t;if(PM('sh')>0&&S.sh>0){const a=Math.min(S.sh,n);S.sh-=a;n-=a;shieldT=1;if(n<=0){SFX.shield();return}}S.hp-=n;SFX.hit()}
// ----- butin -----
function spawnDrops(p,n){for(let i=0;i<n;i++){const m=new THREE.Mesh(OREG,MAT.ore);const g=sprite(0x40e0ff,9);m.add(g);m.position.copy(p).add(new V3(rv(6),rv(6),rv(6)));curScene().add(m);DROPS.push({m,p:m.position,v:new V3(rv(20),rv(20),rv(20)),l:60})}}
function updDrops(dt,mag=260){for(const d of DROPS){d.l-=dt;d.m.rotation.y+=dt*2;const dd=d.p.distanceTo(S.pos);if(dd<mag&&cargoUsed()<cap()){d.v.addScaledVector(_v.copy(S.pos).sub(d.p).normalize(),900*dt)}d.v.multiplyScalar(Math.pow(.3,dt));d.p.addScaledVector(d.v,dt);
if(dd<16&&cargoUsed()<cap()){S.ore++;d.l=0;SFX.pick();if(cargoUsed()>=cap())toast('Soute pleine — vends le minerai dans une station')}if(d.l<=0)d.m.parent&&d.m.parent.remove(d.m)}DROPS=DROPS.filter(d=>d.l>0)}
// ----- ennemis -----
function mkEnemy(ty,pos,z){const m=1+z*.35,b={ty,pos:pos.clone(),vel:new V3(),dir:new V3(0,0,1),cd:1.5+Math.random()};
const P={chasseur:{hp:2,sp:270,keep:160,rng:620,rate:.75,n:1,spr:0,bs:560,dmg:5,sz:11,rw:25,bc:0xfff060},lourd:{hp:12,sp:100,keep:320,rng:880,rate:2,n:5,spr:.09,bs:360,dmg:9,sz:17,rw:70,bc:0xff70f0},boss:{hp:28+G.done*3,sp:140,keep:280,rng:950,rate:1.1,n:3,spr:.1,bs:440,dmg:10,sz:26,rw:100,bc:0xc890ff},pirate:{hp:3.5,sp:180,keep:230,rng:720,rate:1.3,n:1,spr:0,bs:440,dmg:6,sz:13,rw:30,bc:0xff5040}}[ty];
Object.assign(b,P);b.hp*=m;b.mhp=b.hp;b.rw=Math.round(b.rw*(1+z*.3));b.boss=ty=='boss';b.mesh=buildEnemy(ty);b.mesh.position.copy(b.pos);b.pos=b.mesh.position;curScene().add(b.mesh);b.max=1800;b.cone=.26;b.w=.7;b.r=b.sz;b.foe=1;b.hit=(d,p)=>hitEnemy(b,d,p);return b}
function hitEnemy(e,d,p){e.hp-=d;boom3(p,6,0xffaa66,40);SFX.tick();e.mesh.userData.bar.visible=true;if(e.hp<=0&&!e.dead){e.dead=1;G.kills++;if(e.onKill)e.onKill();G.cr+=e.rw;boom3(e.pos,e.boss?70:e.ty=='lourd'?45:28,ENC[e.ty],e.boss?140:90,true);SFX.boom();spawnDrops(e.pos,e.boss?6:e.ty=='lourd'?3:1);e.mesh.parent&&e.mesh.parent.remove(e.mesh);if(e.boss&&G.m&&G.m.type=='boss')complete()}}
let spawnT=8;
function updEnemies(dt,z){const hunt=G.m&&G.m.type=='chasse';spawnT-=dt;if(spawnT<=0){spawnT=(hunt?5+Math.random()*4:12+Math.random()*9)/(1+z*.25);if(en.filter(e=>!e.boss).length<(hunt?3:2)+z&&!S.docked){const r=Math.random(),ty=z>=2&&r<.25?'lourd':z>=1&&r<.55?'chasseur':'pirate',a=Math.random()*TAU,p=S.pos.clone().add(new V3(Math.cos(a)*1100,rv(250),Math.sin(a)*1100));en.push(mkEnemy(ty,p,z));if(ty=='chasseur'&&Math.random()<.6)en.push(mkEnemy(ty,p.clone().add(new V3(30,10,30)),z))}}
const PF=fwd().clone(),PR=_r.set(1,0,0).applyQuaternion(S.q).clone(),PU=_u.set(0,1,0).applyQuaternion(S.q).clone();
for(const e of en){_v.copy(S.pos).sub(e.pos);const d=_v.length();_v.divideScalar(d||1);
e.ph=(e.ph||Math.random()*TAU)+dt*(e.ty=='chasseur'?1.1:.5);const rad=e.ty=='chasseur'?150:e.ty=='lourd'?70:110,ahead=(e.ty=='lourd'?420:e.boss?360:280)+Math.sin(e.ph*.7)*60;
const tg=_w.copy(S.pos).addScaledVector(PF,ahead).addScaledVector(PR,Math.cos(e.ph)*rad).addScaledVector(PU,Math.sin(e.ph)*rad*.6);if(S.docked)tg.copy(e.pos).addScaledVector(_v,-400);
const toT=tg.sub(e.pos),dT=toT.length();toT.divideScalar(dT||1);e.dir.lerp(toT,damp(3.2,dt)).normalize();const sp=Math.min(e.sp+S.spd*.9,Math.max(30,dT*1.6));e.vel.copy(e.dir).multiplyScalar(sp);e.pos.addScaledVector(e.vel,dt);
if(d<650)e.mesh.lookAt(_r.copy(e.pos).sub(_v));else e.mesh.lookAt(_r.copy(e.pos).sub(e.dir));e.mesh.userData.body.rotation.z=Math.sin(t*2+e.sz)*.25;
const bar=e.mesh.userData.bar;if(e.boss||e.ty=='lourd')bar.visible=true;bar.scale.x=10*Math.max(0,e.hp/e.mhp);
e.cd-=dt;if(d<e.rng&&e.cd<=0&&!S.docked&&!S.dead){e.cd=e.rate*(.8+Math.random()*.4);const tt=d/e.bs,aim=S.pos.clone().addScaledVector(S.vel,tt*.85).add(new V3(rv(1),rv(1),rv(1)).multiplyScalar(d*.045)).sub(e.pos).normalize();for(let k=-(e.n-1)/2;k<=(e.n-1)/2;k++){const dir=aim.clone().applyAxisAngle(AY,k*e.spr);const m=mkEB(e.bc);m.position.copy(e.pos);EB.push({m,v:dir.multiplyScalar(e.bs),l:2.4,dmg:e.dmg})}if(d<900)SFX.eshoot()}
if(d>3500&&!e.boss){e.dead=1;e.mesh.parent&&e.mesh.parent.remove(e.mesh)}}en=en.filter(e=>!e.dead)}
// ----- missions -----
function findAround(kind,minD,maxD,excl){const cx=cof(S.pos.x),cz=cof(S.pos.z),R=Math.ceil(maxD/CS),o=[];for(let i=-R;i<=R;i++)for(let j=-1;j<=1;j++)for(let l=-R;l<=R;l++){const it=cdata(cx+i,j,cz+l)[kind];if(!it||it===excl)continue;if(kind=='pl'&&(G.disc.has(it.name)||it.ring&&false))continue;const d=Math.hypot(it.x-S.pos.x,it.y-S.pos.y,it.z-S.pos.z);if(d>=minD&&d<=maxD)o.push(it)}return o.length?o[Math.random()*o.length|0]:null}
function makeOffer(){const r=Math.random(),lv=1+G.done*.15;
if(r<.3){const s=findAround('st',4000,13000,S.docked);if(s)return{type:'liv',tg:s,rw:Math.round((60+Math.hypot(s.x-S.pos.x,s.z-S.pos.z)/70)*lv),txt:'Livrer une cargaison à '+s.n}}
if(r<.55){const p=findAround('pl',3500,12000);if(p)return{type:'exp',tg:p,rw:Math.round((50+Math.hypot(p.x-S.pos.x,p.z-S.pos.z)/90)*lv),txt:'Explorer une planète inconnue'}}
if(r<.8){const n=3+(Math.random()*3|0);return{type:'chasse',n,k0:0,rw:Math.round(n*45*lv),txt:'Éliminer '+n+' pirates'}}
const a=Math.random()*TAU,d=6000+Math.random()*4000;return{type:'boss',tg:{x:S.pos.x+Math.cos(a)*d,y:clamp(S.pos.y+rv(800),-3000,5000),z:S.pos.z+Math.sin(a)*d},rw:Math.round(250*lv),txt:'Prime : abattre le chef pirate'}}
function complete(){G.cr+=G.m.rw;toast('Mission accomplie ! +'+G.m.rw+' ¢');SFX.win();G.done++;G.m=null}
let offer=null,armed=0;
$('mis').onclick=()=>{if(G.m){if(armed){G.m=null;armed=0;offer=makeOffer();toast('Mission abandonnée')}else armed=1}else if(offer){G.m=offer;if(offer.type=='chasse')G.m.k0=G.kills;offer=null;SFX.buy();toast('Mission acceptée — suis le marqueur vert')}};
for(let i=0;i<3;i++)$('u'+(i+1)).onclick=()=>{const c=100*G.u[i];if(G.u[i]<6&&G.cr>=c){G.cr-=c;G.u[i]++;SFX.buy();if(i==2)S.hp=maxhp();rebuildShip()}};
// ----- stations -----
function dock(st){S.docked=st;if(!G.vst.some(v=>v.n==st.n))G.vst.push({n:st.n,x:st.x|0,y:st.y|0,z:st.z|0});S.undockT=0;armed=0;offer=G.m?null:makeOffer();if(G.m&&G.m.type=='liv'&&G.m.tg===st){complete();offer=makeOffer()}if(S.ore>0){G.cr+=S.ore*12;toast('Amarré à '+st.n+' · minerai vendu +'+S.ore*12+' ¢');S.ore=0;SFX.coin()}else toast('Amarré à '+st.n);save()}
function undock(){const st=S.docked;S.docked=null;S.mustLeave=st;S.undockT=0;if(st){const out=_v.copy(S.pos).sub(_w.set(st.x,st.y,st.z));out.y*=.2;if(out.lengthSq()<1)out.set(0,0,1);S.q.setFromUnitVectors(new V3(0,0,-1),out.normalize())}S.spd=cruise()*.8;S.vel.copy(fwd()).multiplyScalar(S.spd);SFX.buy()}
// ----- mort -----
function die(){if(S.dead)return;S.dead=1;mpDied();clearWeapons();S.entry=null;S.ascent=null;S.heat=0;FADE.tg=0;boom3(S.pos,60,0xffaa44,160,true);SFX.boom();ship.visible=false;toast('Vaisseau détruit — retour à la base');setTimeout(()=>{if(mode=='surf')SURF.exit(true);G.cr>>=1;S.ore=0;S.pos.set(0,30,900);S.q.set(0,0,0,1);S.vel.set(0,0,0);S.spd=0;S.hp=maxhp();for(const e of en)e.mesh.parent&&e.mesh.parent.remove(e.mesh);en=[];for(const b of EB)b.m.parent&&b.m.parent.remove(b.m);EB=[];if(G.m&&G.m.type=='boss')G.m.spawned=0;ship.visible=true;S.dead=0;camInit=true},1600)}
// ----- boucle espace -----
let landP=null;
function updSpace(dt){streamWorld();runJobs(LOWQ?5:8);
if(S.entry)entryUpdate(dt);else if(!S.dead){fly(dt);if(S.undockT>0)S.undockT-=dt}
const z=danger(),L=lightFor(S.pos.x,S.pos.y,S.pos.z);sunL.position.copy(S.pos).addScaledVector(L.dir,1000);sunL.target.position.copy(S.pos);sunL.color.copy(L.col);sunL.intensity=.95+L.k*.6;amb.intensity=.5;
// collisions
for(const p of planets){const d=S.pos.distanceTo(_v.set(p.x,p.y,p.z));if(d<p.r+14&&!(S.entry&&S.entry.p===p)){_w.copy(S.pos).sub(_v).normalize();S.pos.copy(_v).addScaledVector(_w,p.r+14);const rad=S.vel.dot(_w);if(rad<0){S.vel.addScaledVector(_w,-1.6*rad);if(rad<-60)damage(6,'col')}}
if(d<p.r+2200&&!G.disc.has(p.name)){G.disc.add(p.name);G.dpos[p.name]=[p.x|0,p.y|0,p.z|0,p.hue|0,p.ring?1:0,p.r|0];G.cr+=10;toast('Planète découverte : '+p.name+' (+10 ¢)');SFX.disc()}}
for(const s of suns){const d=S.pos.distanceTo(_v.set(s.x,s.y,s.z));if(d<s.r+40){_w.copy(S.pos).sub(_v).normalize();S.pos.copy(_v).addScaledVector(_w,s.r+40);S.vel.addScaledVector(_w,200)}if(d<s.r*1.9&&!S.dead){damage((1-(d-s.r)/(s.r*.9))*24*dt);if(t-S.heatT>4){S.heatT=t;toast('☀ Chaleur extrême — éloigne-toi !');SFX.alarm()}}}
for(const a of asts){a.mesh.rotation.x+=a.sp*dt;a.mesh.rotation.y+=a.sp*.7*dt;const d=S.pos.distanceTo(a.pos),R=a.r*.95+5;if(d<R){_w.copy(S.pos).sub(a.pos).normalize();S.pos.copy(a.pos).addScaledVector(_w,R);const rad=S.vel.dot(_w);if(rad<0){S.vel.addScaledVector(_w,-1.5*rad);S.spd*=.5;if(rad<-50){damage(4,'col');boom3(S.pos,8,0xcccccc,40)}}}}
// stations
for(const st of stations){const g=st.mesh.userData;g.rot.rotation.z+=dt*.15;g.lights.forEach((l,i)=>l.visible=Math.sin(t*4+i)>.2);const tg=G.m&&G.m.tg===st;g.zone.material.color.set(tg?0x4dff8a:0xffc84a);g.zone.material.opacity=.25+.15*Math.sin(t*3);
const d=S.pos.distanceTo(_v.set(st.x,st.y,st.z));if(S.mustLeave===st&&d>320)S.mustLeave=null;if(!S.docked&&S.mustLeave!==st&&d<230&&!S.dead)dock(st);if(S.docked===st&&d>400)S.docked=null}
if(S.docked)S.hp=Math.min(maxhp(),S.hp+30*dt);
// soleils animés
for(const s of suns){const u=s.mesh.userData,k=1+Math.sin(t*1.5+s.x)*.04;u.b.scale.setScalar(s.r*3.4*k);u.SU.tm.value=t}
for(const p of planets){const u=p.mesh.userData;if(u.cl)u.cl.rotation.y+=dt*.012;u.sph.rotation.y+=dt*.004;for(const m of u.moons)m.piv.rotation.y+=m.sp*dt}
// missions
if(G.m){const m=G.m;if(m.type=='exp'&&G.disc.has(m.tg.name))complete();else if(m.type=='chasse'&&G.kills-m.k0>=m.n)complete();else if(m.type=='boss'&&!m.spawned&&S.pos.distanceTo(_v.set(m.tg.x,m.tg.y,m.tg.z))<1700){m.spawned=1;const b=mkEnemy('boss',_v.clone(),z);en.push(b);m.tg=b.pos;toast('Le chef pirate t\'a repéré !');SFX.alarm()}}
// combat
const TG=spaceTargets();lock=findLock(TG.filter(T=>!T.bossPart||bossVuln(T)));fireW(dt,TG);
updPB(dt,TG);updWeapons(dt,TG);
updEnemies(dt,z);updEB(dt);updDrops(dt);
// atterrissage possible ?
landP=null;for(const p of planets){const d=S.pos.distanceTo(_v.set(p.x,p.y,p.z));if(d<p.r*1.45+260)landP=p}
if(S.hp<=0)die()}
