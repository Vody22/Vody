// ===== VAGUE 1 : VOL ET COMBAT (après mmo3.js) =====
// 1 abordage (vaisseau désemparé → intérieur d'épave via derEnter), 2 capture (désemparer au lieu de détruire),
// 3 remorquage (câble, livraison à une station = prise de guerre), 4 tourelle pilotable (gros vaisseaux),
// 5 dégâts localisés (réacteur / armes / bouclier), 6 missile guidé, 7 champs de mines pirates,
// 8 astéroïdes volatils (réaction en chaîne) + embuscades, 9 mode furtif, 10 boss scénarisé « Kraken de fer ».
const V1={dis:[],near:null,tow:null,tur:null,tb:[],tg:[],gm:null,guide:false,st:{on:false,t:0,cd:0},amb:[],ambT:25,fields:new Map(),mineT:0,B:null,bk:'',sysT:0,warnF:{}};
const v1s=()=>GX('v1s',{eng:1,gun:1,sh:1});
const _v1a=new V3(),_v1b=new V3(),_v1c=new V3(),_v1q=new QT(),_v1e=new THREE.Euler(0,0,0,'YXZ');
const v1Fwd=()=>_v1a.set(0,0,-1).applyQuaternion(S.q);
const v1Big=()=>((HULLS[G.ship]||{}).hp||1)>=1.4;
const v1Sp=()=>mode=='space'&&!S.docked&&!S.dead&&!S.entry;

// =============== 2. VAISSEAUX DÉSEMPARÉS ===============
const V1DIS={pirate:.35,lourd:.55,chasseur:.2};
{const _he=hitEnemy;hitEnemy=function(e,d,p){
 if(V1.B){const r=v1BossHit(e,d,p);if(r===true)return;if(typeof r=='number')d=r}
 if(!e.dead&&!e.boss&&!e.ghost&&!e.v1nd&&V1DIS[e.ty]&&mode=='space'&&e.hp>0&&e.hp-d<=0&&Math.random()<V1DIS[e.ty]){v1Disable(e,p);return}
 _he(e,d,p)}}
function v1Disable(e,p){e.dead=1;G.kills++;try{e.onKill&&e.onKill()}catch(_){}G.cr+=e.rw;boom3(p||e.pos,14,0xffaa66,60);SFX.boom();const u=e.mesh.userData;if(u&&u.bar)u.bar.visible=false;
const D={mesh:e.mesh,pos:e.mesh.position,ty:e.ty,rw:e.rw,sz:e.sz||14,vel:(e.vel?e.vel.clone().multiplyScalar(.25):new V3()),spin:new V3(rv(.25),rv(.25),rv(.25)),t:0,hp:4*(e.ty=='lourd'?2:1),
 id:'brd'+Date.now().toString(36)+(Math.random()*1e3|0),seed:(Math.random()*1e6)|0,n:(e.ty=='lourd'?'cargo pirate ':'navire pirate ')+NA[Math.random()*10|0]+'-'+(10+Math.random()*90|0)};
V1.dis.push(D);toast('⚙ Vaisseau désemparé ! Approche-toi pour l\'aborder ou le remorquer jusqu\'à une station');try{cxLog&&cxLog('Vaisseau pirate désemparé')}catch(_){}}
function v1DisGone(D){D.gone=1;if(D.mesh.parent)D.mesh.parent.remove(D.mesh);if(V1.tow&&V1.tow.o===D)v1TowEnd(true);try{if(typeof DERD!='undefined')delete DERD[D.id]}catch(_){}}
function v1DisHit(D,d,p){D.hp-=d;boom3(p||D.pos,6,0xffaa66,30);if(D.hp<=0&&!D.gone){boom3(D.pos,D.ty=='lourd'?45:28,0xff8840,90,true);SFX.boom();spawnDrops(D.pos,D.ty=='lourd'?4:2);v1DisGone(D)}}
function v1DisTick(dt){V1.near=null;let bd=1e9;
for(const D of V1.dis){if(D.gone)continue;D.t+=dt;const towed=V1.tow&&V1.tow.o===D;if(!towed){D.pos.addScaledVector(D.vel,dt);D.vel.multiplyScalar(Math.pow(.85,dt))}
 D.mesh.rotation.x+=D.spin.x*dt*(towed?.2:1);D.mesh.rotation.y+=D.spin.y*dt*(towed?.2:1);D.mesh.rotation.z+=D.spin.z*dt*(towed?.2:1);
 if(Math.random()<dt*5)SPK.emit(D.pos.x+rv(D.sz*.6),D.pos.y+rv(D.sz*.4),D.pos.z+rv(D.sz*.6),rv(20),rv(20),rv(20),.4+Math.random()*.4,1,.6,.25,.9);
 if(Math.random()<dt*3)FIRE.emit(D.pos.x+rv(D.sz*.4),D.pos.y,D.pos.z+rv(D.sz*.4),rv(4),6,rv(4),1.2,.35,.32,.3,.95);
 const d=D.pos.distanceTo(S.pos);if((d>9000||D.t>480)&&!towed&&mode=='space'){v1DisGone(D);continue}
 if(d<D.sz*3+130&&d<bd){bd=d;V1.near=D}}
V1.dis=V1.dis.filter(D=>!D.gone)}
// cibles : les épaves désemparées se détruisent au tir
{const _st=spaceTargets;spaceTargets=function(){const r=_st();for(const D of V1.dis){if(D.gone)continue;if(!D.tg)D.tg={r:D.sz,max:1300,cone:.2,w:.8,foe:1,v1d:1,hit:(d,p)=>v1DisHit(D,d,p)};D.tg.pos=D.pos;D.tg.dead=D.gone;r.push(D.tg)}
 for(const F of V1.fields.values())for(const M of F.m){if(M.dead)continue;if(!M.tg)M.tg={r:5,max:900,cone:.12,w:1,foe:1,hit:()=>v1MineBoom(M,true)};M.tg.pos=M.pos;r.push(M.tg)}return r}}

// =============== 1. ABORDAGE (réutilise l'intérieur des épaves) ===============
function v1Q(D){if(D.q)return D.q;const u=D.mesh.userData||(D.mesh.userData={});if(!u.air){const a=new THREE.Object3D();a.position.set(D.sz*1.1/(D.mesh.scale.x||1),0,0);D.mesh.add(a);u.air=a}
D.q={id:D.id,seed:D.seed,n:D.n,x:D.pos.x,y:D.pos.y,z:D.pos.z,mesh:D.mesh,v1:1};return D.q}
STICK.push(()=>{try{if(V1.near&&!V1.tow&&S.spd<120&&!S.docked&&!S.dead)DRH.near=v1Q(V1.near)}catch(e){}});
TICK.push(()=>{if(mode=='space'&&typeof DRH!='undefined'&&DRH.near&&DRH.near.v1){const l=$('land');const h=ICO('door')+(DRH.near.v2h?'Entrer dans le ':'Aborder le ')+DRH.near.n+(DESK?' <kbd>E</kbd>':'');if(l&&l.innerHTML!==h)l.innerHTML=h}});

// =============== 3. REMORQUAGE ===============
function v1TowStart(){const D=V1.near;if(!D||V1.tow)return;const g=new THREE.BufferGeometry().setFromPoints([new V3(),new V3()]),line=new THREE.Line(g,new THREE.LineBasicMaterial({color:0x8fe8ff,transparent:true,opacity:.8}));line.frustumCulled=false;scene.add(line);
V1.tow={o:D,line};try{tone(220,520,.3,'sine',.05)}catch(_){}toast('🔗 Câble accroché : ramène le '+D.n+' à une station pour toucher la prime')}
function v1TowEnd(silent){const T=V1.tow;if(!T)return;scene.remove(T.line);T.line.geometry.dispose();V1.tow=null;if(!silent)toast('🔗 Câble largué')}
function v1TowTick(dt){const T=V1.tow;if(!T)return;const D=T.o;if(D.gone||mode!='space'){v1TowEnd(true);return}
const f=v1Fwd(),anchor=_v1b.copy(S.pos).addScaledVector(f,-(28+D.sz*2.2));_v1c.copy(anchor).sub(D.pos);const dist=_v1c.length();
D.vel.addScaledVector(_v1c,dt*2.2).multiplyScalar(Math.pow(.25,dt));D.pos.addScaledVector(D.vel,dt);if(dist>900){toast('💥 Le câble a cassé !');v1TowEnd(true);return}
const pa=T.line.geometry.attributes.position;_v1c.copy(S.pos).addScaledVector(f,-6);pa.setXYZ(0,_v1c.x,_v1c.y,_v1c.z);pa.setXYZ(1,D.pos.x,D.pos.y,D.pos.z);pa.needsUpdate=true}
TICK.push(()=>{const T=V1.tow;if(T&&S.docked&&!S.docked.ground){const D=T.o,pay=Math.round(D.rw*4+(D.ty=='lourd'?700:300));G.cr+=pay;gainXP(80);v1DisGone(D);banner('ship','Prise de guerre livrée','Le '+D.n+' est confisqué par la station : +'+pay.toLocaleString('fr-FR')+' ¢','#ffc34d');SFX.win();save()}});

// =============== 4. TOURELLE PILOTABLE ===============
{const _si=steerInput;steerInput=function(){const r=_si();if(V1.tur&&mode=='space'){V1.tur.in=r;return[0,0]}return r}}
{const _fw=fireW;fireW=function(dt,TG){V1.tg=TG;if(V1.st.on&&isFire())v1Stealth(false);if(V1.tur&&mode=='space'){LZ.on=0;v1TurFire(dt);return}_fw(dt,TG)}}
function v1TurToggle(){if(V1.tur){V1.tur=null;document.body.classList.remove('v1tur');camInit=true;return}if(!v1Big()){toast('La tourelle existe seulement sur les gros vaisseaux (Cargo, Faucon, Sentinelle, Mastodonte)');return}if(!v1Sp())return;
V1.tur={yaw:0,pitch:.12,cd:0,in:[0,0],side:1};document.body.classList.add('v1tur');toast('🎯 Tourelle : le joystick vise, le vaisseau garde son cap')}
function v1TurDir(out){const T=V1.tur;_v1e.set(T.pitch,T.yaw,0,'YXZ');_v1q.setFromEuler(_v1e);return out.set(0,0,-1).applyQuaternion(_v1q).applyQuaternion(S.q)}
function v1TurBase(out){const sc=(ship.userData.body&&ship.userData.body.scale.z)||1;return out.set(0,5.5*sc+2,1.5*sc).applyQuaternion(S.q).add(S.pos)}
function v1TurTick(dt){const T=V1.tur;if(!T)return;if(!v1Sp()||!v1Big()){V1.tur=null;document.body.classList.remove('v1tur');return}T.yaw+=T.in[0]*dt*1.7;T.pitch=clamp(T.pitch+T.in[1]*dt*1.3,-.35,1.25);T.cd-=dt;
for(const b of V1.tb){b.pos.addScaledVector(b.v,dt);b.l-=dt;for(const X of V1.tg){if(!X||X.dead||X.gone||!X.pos)continue;if(X.pos.distanceTo(b.pos)<(X.r||6)+3){try{X.hit(1.15*dmgMul(),b.pos.clone())}catch(e){}b.l=0;break}}if(b.l<=0)b.m.parent&&b.m.parent.remove(b.m)}V1.tb=V1.tb.filter(b=>b.l>0)}
function v1TurFire(dt){const T=V1.tur;if(!isFire()||T.cd>0||S.dead)return;T.cd=.11;T.side=-T.side;const dir=v1TurDir(new V3()),p=v1TurBase(new V3()).addScaledVector(dir,7).add(_v1c.set(T.side*1.2,0,0).applyQuaternion(S.q));
const m=boltMesh(0x8fe8ff,0);m.position.copy(p);m.lookAt(_v1b.copy(p).sub(dir));curScene().add(m);V1.tb.push({m,pos:m.position,v:dir.multiplyScalar(1350).add(S.vel),l:1.3});try{mpShot(p,dir.clone().normalize(),'c')}catch(e){}SFX.shoot()}
{const _uc=updCam;updCam=function(dt){
 if(V1.gm&&mode=='space'&&V1.gm.l>0){const M=V1.gm,dir=_v1a.copy(M.vel).normalize(),up=_v1b.set(0,1,0).applyQuaternion(S.q);camera.position.lerp(_v1c.copy(M.pos).addScaledVector(dir,-16).addScaledVector(up,3.5),Math.min(1,dt*10));camera.up.copy(up);camera.lookAt(_v1c.copy(M.pos).addScaledVector(dir,60));sky.position.copy(camera.position);return}
 if(V1.tur&&mode=='space'&&!S.docked){const b=v1TurBase(_v1b),d=v1TurDir(_v1a),up=_v1c.set(0,1,0).applyQuaternion(S.q);camera.position.copy(b);camera.up.copy(up);camera.lookAt(b.addScaledVector(d,100));sky.position.copy(camera.position);return}
 _uc(dt)}}

// =============== 5. DÉGÂTS LOCALISÉS ===============
const V1SN={eng:'Réacteur',gun:'Armes',sh:'Générateur de bouclier'};
{const _dm=damage;damage=function(n,kind){const h0=S.hp;_dm(n,kind);const lost=h0-S.hp;if(lost>0&&mode=='space'&&!S.dead){const s=v1s(),ks=['eng','gun','sh'],k=ks[Math.random()*3|0],was=s[k];s[k]=Math.max(0,s[k]-lost/maxhp()*1.7);if(was>=.5&&s[k]<.5)toast('⚠ '+V1SN[k]+' endommagé ('+Math.round(s[k]*100)+' %)');else if(was>.15&&s[k]<=.15)toast('🔥 '+V1SN[k]+' hors service !')}}}
{const _pm=PM;PM=function(k){let v=_pm(k);if(mode!='space')return v;const s=v1s();
 if(k=='spd'||k=='boost'){v*=.55+.45*s.eng;if(V1.tow)v*=.62;if(V1.st.on)v*=.35}else if(k=='rate')v*=.5+.5*s.gun;else if(k=='shr')v*=.3+.7*s.sh;return v}}
function v1SysTick(dt){const s=v1s();if(S.docked){let any=false;for(const k in s)if(s[k]<1){s[k]=Math.min(1,s[k]+dt*.35);any=true}if(any&&Object.values(s).every(x=>x>=1))toast('🔧 Systèmes du vaisseau réparés')}else for(const k in s)s[k]=Math.min(1,s[k]+dt*.004);
 // réacteur abîmé : le vaisseau dérive et crachote
 if(v1Sp()&&s.eng<.5){if(Math.random()<dt*(1-s.eng)*1.5)S.q.multiply(_v1q.setFromAxisAngle(_v1a.set(rv(1),rv(1),rv(1)).normalize(),rv(.05)*(1-s.eng)));if(Math.random()<dt*4*(1-s.eng)){const f=v1Fwd();FIRE.emit(S.pos.x-f.x*8,S.pos.y-f.y*8,S.pos.z-f.z*8,rv(6),rv(6),rv(6),.8,.4,.38,.35,.95)}}
 const el=$('v1sys'),show=mode=='space'&&Object.values(s).some(x=>x<.95);el.style.display=show?'flex':'none';if(show){V1.sysT-=dt;if(V1.sysT<=0){V1.sysT=.4;el.innerHTML=['eng','gun','sh'].map(k=>`<span class="${s[k]<.15?'off':s[k]<.5?'bad':s[k]<.95?'mid':''}">${ICO(k=='eng'?'boost':k=='gun'?'canon':'shield')}${Math.round(s[k]*100)}%</span>`).join('')}}}

// =============== 6. MISSILE GUIDÉ ===============
{const _lm=launchMissile;launchMissile=function(){_lm();if(V1.guide&&mode=='space'&&MIS.length){const M=MIS[MIS.length-1];M.tg=null;M.man=1;M.l=9;V1.gm=M;if(!V1.gmTip){V1.gmTip=1;toast('🚀 Missile guidé : oriente ton vaisseau pour le diriger, touche « Exploser » pour le faire sauter')}}}}
function v1GuideTick(dt){const M=V1.gm;if(!M)return;if(M.l<=0||!MIS.includes(M)||mode!='space'){V1.gm=null;camInit=true;return}const f=v1Fwd(),P=_v1b.copy(S.pos).addScaledVector(f,S.pos.distanceTo(M.pos)+280),sp=M.vel.length();_v1c.copy(P).sub(M.pos).normalize().multiplyScalar(sp);M.vel.lerp(_v1c,Math.min(1,dt*3.5)).setLength(sp)}

// =============== 7. CHAMPS DE MINES PIRATES ===============
let MINE1G=null;function v1MineMesh(){if(!MINE1G)MINE1G=new THREE.IcosahedronGeometry(2.6,0);const m=new THREE.Mesh(MINE1G,typeof MINEM!='undefined'?MINEM:MAT.dark);for(let i=0;i<6;i++){const d=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]][i],s=new THREE.Mesh(V1SPK||(V1SPK=new THREE.ConeGeometry(.5,2,5)),m.material);s.position.set(d[0]*2.6,d[1]*2.6,d[2]*2.6);s.lookAt(d[0]*9,d[1]*9,d[2]*9);s.rotateX(Math.PI/2);m.add(s)}const l=sprite(0xff3030,9);m.add(l);m.userData.bl=l;return m}
let V1SPK=null;
function v1FieldPts(key,cx,cy,cz,n,R0,R1,gapDir,seed){const r=rng(seed),P=[];for(let i=0;i<n;i++){const a=r()*TAU;if(gapDir){const c=Math.cos(a)*gapDir.x+Math.sin(a)*gapDir.z;if(Math.abs(c)>.88)continue}const R=R0+r()*(R1-R0);P.push(new V3(cx+Math.cos(a)*R,cy+(r()-.5)*120,cz+Math.sin(a)*R))}return P}
function v1MineScan(){const want=new Map();
for(const st of stations){if(!st.mesh||st.base||st.n=='Base Alpha')continue;let f='';try{f=stFac(st)}catch(e){}if(f!='pirates')continue;const k='st:'+st.n,gd=new V3(-st.x,0,-st.z).normalize();want.set(k,()=>v1FieldPts(k,st.x,st.y,st.z,26,620,880,gd,st.n.length*977+st.x|0))}
const sx=Math.floor(S.pos.x/12000),sz=Math.floor(S.pos.z/12000);for(let i=-1;i<=1;i++)for(let l=-1;l<=1;l++){const a=sx+i,b=sz+l;if(a>=-1&&a<=0&&b>=-1&&b<=0)continue;let c='front';try{c=ctlOf(a+','+b)}catch(e){}if(c=='alliance')continue;if(h3(a,0,b,733)>(c=='pirates'?.4:.15))continue;
 const r=rng(a*7919+b*104729),cx=(a+.2+r()*.6)*12000,cz=(b+.2+r()*.6)*12000,k='sec:'+a+','+b;if(Math.hypot(cx-S.pos.x,cz-S.pos.z)<8000)want.set(k,()=>v1FieldPts(k,cx,0,cz,18,40,320,null,a*31+b*17))}
for(const[k,F]of V1.fields)if(!want.has(k)){for(const M of F.m)M.mesh.parent&&M.mesh.parent.remove(M.mesh);V1.fields.delete(k)}
const dead=GX('v1md',{}),now=Date.now();for(const[k,mk]of want){if(V1.fields.has(k))continue;const m=[];mk().forEach((p,i)=>{const id=k+':'+i;if(dead[id]&&now-dead[id]<20*60e3)return;const mesh=v1MineMesh();mesh.position.copy(p);scene.add(mesh);m.push({id,mesh,pos:mesh.position,arm:-1,ph:Math.random()*9})});V1.fields.set(k,{m,c:m.reduce((a,M)=>a.add(M.pos),new V3()).divideScalar(Math.max(1,m.length))})}}
function v1MineBoom(M,shot){if(M.dead)return;M.dead=1;M.mesh.parent&&M.mesh.parent.remove(M.mesh);GX('v1md',{})[M.id]=Date.now();boom3(M.pos,30,0xff5030,90,true);SFX.boom();const d=M.pos.distanceTo(S.pos);if(d<85&&!S.dead)damage((16+6*danger())*(1-d/120));for(const e of en)if(!e.dead&&e.pos.distanceTo(M.pos)<85)try{hitEnemy(e,5,e.pos.clone())}catch(_){}}
function v1MineTick(dt){if(mode!='space'){return}V1.mineT-=dt;if(V1.mineT<=0){V1.mineT=1.5;v1MineScan()}
for(const[k,F]of V1.fields){const fd=F.c.distanceTo(S.pos);if(fd<1500&&!V1.warnF[k]){V1.warnF[k]=1;toast('💣 Champ de mines pirate droit devant — ralentis ou tire dessus')}
 if(fd>2500)continue;for(const M of F.m){if(M.dead)continue;M.mesh.rotation.y+=dt*.4;const d=M.pos.distanceTo(S.pos);
  if(M.arm<0&&d<75&&!S.docked&&!S.dead){M.arm=1.1;try{tone(1400,1400,.08,'square',.05);tone(1400,1400,.08,'square',.05,.25)}catch(e){}}
  M.mesh.userData.bl.visible=M.arm>0?Math.sin(t*30)>0:Math.sin(t*3+M.ph)>.6;if(M.arm>0){M.arm-=dt;if(M.arm<=0)v1MineBoom(M,false)}}
 F.m=F.m.filter(M=>!M.dead)}}

// =============== 8. ASTÉROÏDES VOLATILS + EMBUSCADES ===============
const V1VG=new THREE.SphereGeometry(1.04,10,8),V1VM=new THREE.MeshBasicMaterial({color:0xff4a20,transparent:true,opacity:.35,blending:ADDB,depthWrite:false,wireframe:true});
{const _ls=loadSmall;loadSmall=function(c){const r=_ls(c);try{const e=SMALL.get(c.k);if(e)for(const A of e.list){if(A.ore||A.v1vol!=null)continue;const h=((A.id*2654435761)>>>0)%100;A.v1vol=h<6;if(A.v1vol){const g=new THREE.Mesh(V1VG,V1VM);A.mesh.add(g);const s=sprite(0xff5020,1.5);A.mesh.add(s);A.v1s=s}}}catch(e){console.warn(e)}return r}}
{const _ah=astHit;astHit=function(a,d,p){_ah(a,d,p);if(a.v1vol&&a.hp<=0&&!a.v1b){a.v1b=1;v1Chain(a.pos.clone(),a.r||20)}}}
function v1Chain(pos,r){boom3(pos,40+r*.6,0xff6020,130,true);SFX.boom();const R=100+r*1.6;
for(const b of asts.slice()){if(b.hp<=0||b.v1b)continue;const d=b.pos.distanceTo(pos);if(d<R+(b.r||0))setTimeout(()=>{if(b.hp>0&&asts.includes(b))astHit(b,99,b.pos.clone())},100+Math.random()*250)}
for(const e of en)if(!e.dead&&e.pos.distanceTo(pos)<R)try{hitEnemy(e,7,e.pos.clone())}catch(_){}for(const D of V1.dis)if(!D.gone&&D.pos.distanceTo(pos)<R)v1DisHit(D,3,D.pos);
const d=S.pos.distanceTo(pos);if(d<R&&!S.dead){damage(14*(1-d/R)+4);if(!V1.volTip){V1.volTip=1;toast('☄ Astéroïde volatil : ceux qui luisent en rouge explosent en chaîne')}}}
function v1AmbTick(dt){if(!v1Sp())return;V1.ambT-=dt;
for(const A of V1.amb){A.t+=dt;const d=A.pos.distanceTo(S.pos);if(!A.on&&(d<400||A.shot)){A.on=1;for(const e of A.es){if(e.dead)continue;ai3Init(e,'atk');e.ai3.ext=1;en.push(e)}toast('⚠ Embuscade ! Des pirates surgissent des astéroïdes');SFX.alarm()}
 if(!A.on&&(A.t>100||d>4000)){for(const e of A.es)e.mesh.parent&&e.mesh.parent.remove(e.mesh);A.gone=1}}V1.amb=V1.amb.filter(A=>!A.on&&!A.gone);
if(V1.ambT>0)return;V1.ambT=30+Math.random()*30;const z=danger();if(z<1||en.length>3||V1.amb.length)return;let c='front';try{c=ctlOf(secOf(S.pos.x,S.pos.z))}catch(e){}if(c=='alliance'&&z<2)return;
const near=asts.filter(a=>{const d=a.pos.distanceTo(S.pos);return d>350&&d<850&&(a.r||0)>=16});if(near.length<6||Math.random()>.4)return;const A=near[Math.random()*near.length|0],away=_v1a.copy(A.pos).sub(S.pos).normalize(),es=[];
for(let i=0;i<2;i++){const p=A.pos.clone().addScaledVector(away,(A.r||20)+26).add(new V3(rv(22),rv(14),rv(22)));const e=mkEnemy(Math.random()<.3?'chasseur':'pirate',p,z);e.v1amb=1;es.push(e)}V1.amb.push({es,pos:A.pos.clone(),t:0})}

// =============== 9. MODE FURTIF ===============
{const _ad=ai3Det;ai3Det=function(z){return _ad(z)*(V1.st.on?.2:1)}}
function v1Stealth(on){const S1=V1.st;if(on==null)on=!S1.on;if(on){if(!v1Sp())return;if(S1.cd>0){toast('Furtif en recharge ('+Math.ceil(S1.cd)+' s)');return}S1.on=true;S1.t=25;document.body.classList.add('v1st');toast('🌑 Mode furtif : moteurs au ralenti, les ennemis te perdent de vue. Tirer te dévoile');try{tone(300,90,.6,'sine',.06)}catch(e){}}
else if(S1.on){S1.on=false;S1.cd=15;document.body.classList.remove('v1st');try{tone(90,300,.4,'sine',.05)}catch(e){}}}
function v1StTick(dt){const S1=V1.st;if(S1.cd>0)S1.cd-=dt;if(!S1.on)return;if(!v1Sp()){v1Stealth(false);return}S1.t-=dt;if(S1.t<=0){v1Stealth(false);toast('Mode furtif épuisé');return}
const u=ship.userData;if(u&&u.flames)for(const f of u.flames){if(f.fl)f.fl.scale.z*=.15;if(f.gs)f.gs.scale.multiplyScalar(.3)}
for(const e of en){if(e.dead||!e.ai3||e.ai3.st!='atk'||e.ai3.ext||e.boss)continue;if(e.pos.distanceTo(S.pos)>450){e.v1lost=(e.v1lost||0)+dt;if(e.v1lost>3){e.ai3.st='patrol';e.ai3.anc.copy(e.pos);e.v1lost=0;try{ai3Label(e)}catch(_){}}}}}

// =============== 10. BOSS : LE KRAKEN DE FER ===============
function v1Lair(){const L=GX('v1L',{});if(L.x!=null)return L;let best=null,bd=1e9;for(let a=-8;a<=8;a++)for(let b=-8;b<=8;b++){const r=Math.hypot(a+.5,b+.5);if(r<3||r>8)continue;let v=0;try{v=infl0(a+','+b)}catch(e){v=0}if(v<=-30&&r<bd){bd=r;best=[a,b]}}
if(!best)best=[5,-5];L.x=(best[0]+.5)*12000;L.z=(best[1]+.5)*12000;L.y=300;return L}
{const _mi=mapItems;mapItems=function(){const r=_mi.apply(this,arguments);try{if(GX('v1kn',0)&&Array.isArray(r)){const L=v1Lair();r.push({k:'boss2',n:'Repaire du Kraken de fer',x:L.x,y:L.y,z:L.z,c:'#ff4060'})}}catch(e){}return r}}
function v1BossSpawn(L){const z=Math.max(3,danger()),c=new V3(L.x,L.y,L.z),boss=mkEnemy('boss',c,z);boss.hp=boss.mhp=boss.hp*3.2;boss.rw=0;boss.v1nd=1;boss.persist=1;ai3Init(boss,'atk');boss.ai3.ext=1;boss.label='LE KRAKEN DE FER';
const sz=boss.sz||26,core=sprite(0xff3050,sz*.9);core.position.set(0,sz*.15,sz*.55);boss.mesh.add(core);const bub=new THREE.Mesh(new THREE.SphereGeometry(sz*1.7,24,16),new THREE.MeshBasicMaterial({color:0x60d8ff,transparent:true,opacity:.18,blending:ADDB,depthWrite:false}));boss.mesh.add(bub);
const nodes=[],beams=[];for(let i=0;i<4;i++){const a=i/4*TAU,n=mkEnemy('lourd',c.clone().add(new V3(Math.cos(a)*320,rv(60),Math.sin(a)*320)),z);n.v1nd=1;n.sp=0;n.keep=0;n.persist=1;ai3Init(n,'atk');n.ai3.ext=1;n.label='Générateur de bouclier';n.rw=150;nodes.push(n);
 const g=new THREE.BufferGeometry().setFromPoints([new V3(),new V3()]),bm=new THREE.Line(g,new THREE.LineBasicMaterial({color:0x60d8ff,transparent:true,opacity:.7,blending:ADDB}));bm.frustumCulled=false;scene.add(bm);beams.push(bm)}
en.push(boss,...nodes);V1.B={boss,nodes,beams,core,bub,ph:1,msgT:-9,L};banner('skull','LE KRAKEN DE FER','Son bouclier est alimenté par 4 générateurs : détruis-les d\'abord !','#ff4060');SFX.alarm()}
function v1BossHit(e,d,p){const B=V1.B;if(e!==B.boss)return null;
if(B.ph==1){boom3(p||e.pos,9,0x60e0ff,40);try{SFX.shield&&SFX.shield()}catch(_){}if(t-B.msgT>4){B.msgT=t;toast('🛡 Bouclier actif : détruis les générateurs autour du Kraken')}return true}
if(B.ph==3){const cw=B.core.getWorldPosition(_v1b);if(!p||p.distanceTo(cw)>(e.sz||26)*.95){boom3(p||e.pos,5,0xffe060,20);if(t-B.msgT>5){B.msgT=t;toast('🎯 Blindage ! Vise le cœur rouge du Kraken')}return true}return d*2.5}return null}
function v1BossTick(dt){const L=v1Lair();if(!GX('v1kn',0)&&lvl()>=5&&mode=='space'){G.x.v1kn=1;setTimeout(()=>banner('skull','Rumeur de contrebandiers','Un croiseur pirate géant, le Kraken de fer, rôde dans son repaire. Il est marqué sur ta carte.','#ff4060'),4000)}
const B=V1.B;if(!B){if(mode!='space'||S.dead||!GX('v1kn',0))return;const d=Math.hypot(S.pos.x-L.x,S.pos.z-L.z);const last=GX('v1bk',0);if(d<3500&&Date.now()-last>20*3600e3)v1BossSpawn(L);return}
const boss=B.boss,cw=boss.pos;B.nodes.forEach((n,i)=>{const bm=B.beams[i];bm.visible=!n.dead&&B.ph==1;if(bm.visible){const pa=bm.geometry.attributes.position;pa.setXYZ(0,n.pos.x,n.pos.y,n.pos.z);pa.setXYZ(1,cw.x,cw.y,cw.z);pa.needsUpdate=true}});
B.bub.visible=B.ph==1;B.bub.material.opacity=.14+Math.sin(t*4)*.05;B.core.material.opacity=B.ph==3?.75+Math.sin(t*9)*.25:.35;
if(B.ph==1&&B.nodes.every(n=>n.dead)){B.ph=2;banner('skull','Bouclier du Kraken tombé !','Il est vulnérable : à l\'attaque !','#ffc34d');boom3(cw,60,0x60d8ff,160,true)}
else if(B.ph==2&&boss.hp<boss.mhp*.5){B.ph=3;boss.rate*=.6;banner('skull','Le Kraken enrage !','Son blindage se referme : seul le cœur rouge est vulnérable.','#ff4060');for(let i=0;i<4;i++){const e=mkEnemy('chasseur',cw.clone().add(new V3(rv(200),rv(80),rv(200))),Math.max(3,danger()));e.v1nd=1;ai3Init(e,'atk');e.ai3.ext=1;en.push(e)}}
if(boss.dead){const first=!GX('v1bk',0),cr=first?15000:4000;G.cr+=cr;gainXP(first?2500:600);if(first)try{giveBlueprint()}catch(e){}G.x.v1bk=Date.now();banner('trophy','Le Kraken de fer est vaincu !','+'+cr.toLocaleString('fr-FR')+' ¢'+(first?' et un plan rare':'')+'. Il reviendra dans 20 h.','#ffc34d');SFX.win();v1BossEnd(false);save();return}
if(S.dead||mode!='space'||Math.hypot(S.pos.x-L.x,S.pos.z-L.z)>3200){v1BossEnd(true)}}
function v1BossEnd(abandon){const B=V1.B;if(!B)return;for(const bm of B.beams){scene.remove(bm);bm.geometry.dispose()}if(abandon){for(const e of[B.boss,...B.nodes]){if(!e.dead){e.dead=1;e.mesh.parent&&e.mesh.parent.remove(e.mesh)}}toast('Le Kraken de fer regagne son repaire')}V1.B=null}

// =============== BOUTONS CONTEXTUELS + INDICATEUR DE SYSTÈMES ===============
document.body.insertAdjacentHTML('beforeend','<div id="v1bar"></div><div id="v1sys"></div><div id="v1ret"></div><div id="v1veil"></div>');
// les autres vagues ajoutent leurs boutons : V1XB.push(()=>[clé,libellé,icône,touche] ou null) et V1ACT[clé]=fonction
const V1XB=[];const V1ACT={tur:v1TurToggle,st:()=>v1Stealth(),guide:()=>{if(V1.gm){V1.gm.l=0;return}V1.guide=!V1.guide;toast(V1.guide?'🚀 Missiles guidés à la main':'🎯 Missiles à tête chercheuse')},tow:()=>V1.tow?v1TowEnd():v1TowStart()};
function v1Bar(){const L=[];if(v1Sp()&&!V1.gm){if(v1Big())L.push(['tur',V1.tur?'Pilotage':'Tourelle',V1.tur?'ship':'turret','Y']);L.push(['st',V1.st.on?'Furtif '+Math.ceil(V1.st.t)+' s':V1.st.cd>0?'Furtif '+Math.ceil(V1.st.cd)+' s':'Furtif','moon','N']);if(curW()=='missile')L.push(['guide',V1.guide?'Guidé : oui':'Guidé : non','missile','U']);if(V1.tow)L.push(['tow','Larguer','magnet','L']);else if(V1.near)L.push(['tow','Remorquer','magnet','L'])}
if(V1.gm)L.push(['guide','Exploser','missile','U']);for(const f of V1XB){try{const r=f();if(r)L.push(r)}catch(e){}}const h=L.map(([k,n,ic,kb])=>`<button class="v1b${(k=='st'&&V1.st.on)||(k=='tur'&&V1.tur)||(k=='guide'&&V1.guide)?' on':''}" data-v1="${k}">${ICO(ic)}${n}${DESK&&kb?' <kbd>'+kb+'</kbd>':''}</button>`).join('');if(h!==V1.bk){V1.bk=h;$('v1bar').innerHTML=h}}
$('v1bar').addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(!b)return;e.preventDefault();e.stopPropagation();const f=V1ACT[b.dataset.v1];if(f)f()});
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT'||e.target.tagName=='TEXTAREA'||e.repeat||mode!='space')return;const m={KeyY:'tur',KeyN:'st',KeyU:'guide',KeyL:'tow'}[e.code];if(m&&(m!='tow'||V1.near||V1.tow)){e.preventDefault();V1ACT[m]()}});

// =============== BOUCLES ===============
STICK.push(dt=>{try{v1DisTick(dt);v1TowTick(dt);v1GuideTick(dt);v1AmbTick(dt)}catch(e){console.warn(e)}});
TICK.push(dt=>{const rd=Math.min(.1,dt||.016);try{v1TurTick(rd);v1SysTick(rd);v1StTick(rd);v1MineTick(rd);v1BossTick(rd)}catch(e){console.warn(e)}V1.barT=(V1.barT||0)-rd;if(V1.barT<=0){V1.barT=.2;v1Bar()}});
