// ===== GRAPHISMES + : entrée atmosphérique, vaisseaux (reflets, détails, chaleur, dégâts), explosions, espace (nébuleuses, ceintures, stations) =====
// ---------- ENTRÉE ATMOSPHÉRIQUE ----------
const TRAIL_FS=`uniform float k,tm;varying vec2 vUv;float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hs(i),hs(i+vec2(1.,0.)),f.x),mix(hs(i+vec2(0.,1.)),hs(i+vec2(1.,1.)),f.x),f.y);}
void main(){float y=vUv.y,s=vn(vec2(vUv.x*16.,y*5.-tm*9.))*.6+vn(vec2(vUv.x*38.,y*13.-tm*17.))*.4;float a=pow(1.-y,1.7)*smoothstep(0.,.06,y)*(.3+.7*s);vec3 c=mix(vec3(1.,.78,.4),vec3(1.,.22,.04),smoothstep(0.,.6,y));gl_FragColor=vec4(c*a*k*1.5,1.);}`;
const TRAILU={k:{value:0},tm:TM},TRAILG=new THREE.CylinderGeometry(15,4.2,72,18,1,true).rotateX(Math.PI/2).translate(0,0,40);
function addTrail(root){const m=new THREE.Mesh(TRAILG,new THREE.ShaderMaterial({uniforms:TRAILU,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:TRAIL_FS,transparent:true,blending:ADDB,depthWrite:false,side:THREE.DoubleSide}));m.visible=false;m.frustumCulled=false;root.add(m);root.userData.trail=m}
const _seP=SURF.enter;SURF.enter=function(p,entry){_seP(p,entry);if(entry)S.coolT=3.2};
let ENT=null;function entrySound(k){if(!AC||muted)return;if(!ENT){try{const s=AC.createBufferSource();s.buffer=noiseBuf;s.loop=true;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=380;const g=AC.createGain();g.gain.value=0;s.connect(lp);lp.connect(g);g.connect(master);s.start();
const s2=AC.createBufferSource();s2.buffer=noiseBuf;s2.loop=true;const hp=AC.createBiquadFilter();hp.type='bandpass';hp.frequency.value=2400;hp.Q.value=.6;const g2=AC.createGain();g2.gain.value=0;s2.connect(hp);hp.connect(g2);g2.connect(master);s2.start(0,.7);ENT={g,g2,lp}}catch(e){return}}
const n=AC.currentTime;ENT.g.gain.setTargetAtTime(k*.42,n,.08);ENT.g2.gain.setTargetAtTime(k*.08*(.6+Math.random()*.8),n,.03);ENT.lp.frequency.setTargetAtTime(260+k*500,n,.1)}
function updEntryFX(dt){if(S.coolT>0&&mode=='surf'){S.coolT-=dt;S.heat=Math.max(0,S.coolT/3.2)*.85;shake=Math.max(shake,S.heat*.3);if(S.coolT<=0)S.heat=0}
const hk=S.heat||0,tr=ship.userData.trail;if(tr){tr.visible=hk>.03&&ship.visible;TRAILU.k.value=hk;tr.scale.set(1+hk*.3,1+hk*.3,.5+hk*.9)}entrySound(hk);
if(hk>.1&&ship.visible){fwd();for(let i=0;i<(DESK?3:2);i++){const p=S.pos.clone().addScaledVector(_f,-2+Math.random()*6).add(new V3(rv(6),rv(4),rv(6)));SPK.emit(p.x,p.y,p.z,-_f.x*260+rv(40),-_f.y*260+rv(40),-_f.z*260+rv(40),.25+Math.random()*.3,1,.6+Math.random()*.3,.2,.6)}}}
// ---------- VAISSEAUX : relief des panneaux, reflets, dégâts ----------
const HULLN=(()=>{const src=HULLT.image,w=src.width,h=src.height,sx=src.getContext('2d').getImageData(0,0,w,h).data,c=mkC(w,h),g=c.getContext('2d'),im=g.createImageData(w,h),d=im.data,L=(x,y)=>sx[(((y+h)%h)*w+((x+w)%w))*4]/255;
for(let y=0;y<h;y++)for(let x=0;x<w;x++){const dx=(L(x+1,y)-L(x-1,y))*2.2,dy=(L(x,y+1)-L(x,y-1))*2.2,l=Math.hypot(dx,dy,1),k=(y*w+x)*4;d[k]=(-dx/l*.5+.5)*255;d[k+1]=(dy/l*.5+.5)*255;d[k+2]=(1/l*.5+.5)*255;d[k+3]=255}
g.putImageData(im,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t})();
function shipLook(root){const M=root.userData.mats;if(M){for(const k of['hull','wing']){const m=M[k];if(!m)continue;m.normalMap=HULLN;m.normalScale.set(.55,.55);if(!DESK){m.metalness=.5;m.roughness=.34;m.envMapIntensity=1.1}m.userData.c0=m.color.clone();m.needsUpdate=true}}if(!root.userData.trail&&root.userData.plasma)addTrail(root);return root}
const _bsG=buildShip;buildShip=function(...a){return shipLook(_bsG(...a))};
const _emG=enemyMat;enemyMat=function(ty){const m=_emG(ty);if(!m.normalMap){m.normalMap=HULLN;m.normalScale.set(.5,.5);m.needsUpdate=true}return m};
// reflets d'environnement dans l'espace aussi sur mobile
if(!DESK){try{const pm=new THREE.PMREMGenerator(R3),es=new THREE.Scene();es.add(new THREE.Mesh(new THREE.SphereGeometry(40,24,12),new THREE.MeshBasicMaterial({map:NEB.material.map,side:THREE.BackSide})));const k1=new THREE.Mesh(new THREE.SphereGeometry(5,12,8),new THREE.MeshBasicMaterial({color:0xfff2dd}));k1.position.set(20,22,10);es.add(k1);
scene.environment=pm.fromScene(es,.04).texture;pm.dispose()}catch(e){console.warn(e)}}
// fumée (réserve de sprites recyclés)
const SMK=[];{for(let i=0;i<(DESK?70:40);i++){const s=fxSprite(SMOKET,THREE.NormalBlending,0x2a2622,0);s.visible=false;s.material.rotation=Math.random()*TAU;SMK.push({s,l:0,ml:1,v:new V3(),sz:4})}}
let SMKi=0;function smokePuff(p,v,sz,life,col){const q=SMK[SMKi=(SMKi+1)%SMK.length],sc=curScene();if(q.s.parent!==sc)sc.add(q.s);q.s.visible=true;q.s.position.copy(p);q.v.copy(v);q.l=q.ml=life;q.sz=sz;q.s.material.color.setHex(col||0x2a2622);q.s.material.opacity=0}
function updSmoke(dt){for(const q of SMK){if(q.l<=0)continue;q.l-=dt;if(q.l<=0){q.s.visible=false;continue}const a=1-q.l/q.ml;q.s.position.addScaledVector(q.v,dt);q.v.multiplyScalar(Math.pow(.5,dt));if(mode=='surf')q.s.position.y+=5*dt;q.s.scale.setScalar(q.sz*(.5+a*2.2));q.s.material.opacity=.5*Math.min(1,a*6)*(1-a)}}
const _dmgP=new V3();let dmgT=0;
function updDamageFX(dt){const ud=ship.userData;if(!ud.mats)return;const r=clamp(S.hp/Math.max(1,maxhp()),0,1),hurt=S.dead||!ship.visible||FOOT.on?0:1-r;
for(const k of['hull','wing']){const m=ud.mats[k];if(m&&m.userData.c0)m.color.copy(m.userData.c0).multiplyScalar(1-Math.max(0,hurt-.3)*.55)}
if(!hurt)return;dmgT-=dt;fwd();_r.set(1,0,0).applyQuaternion(S.q);
if(r<.6&&Math.random()<dt*4*(1-r)){_dmgP.copy(S.pos).addScaledVector(_r,rv(5)).addScaledVector(_f,rv(5));for(let i=0;i<8;i++)SPK.emit(_dmgP.x,_dmgP.y,_dmgP.z,S.vel.x*.6+rv(30),S.vel.y*.6+rv(30),S.vel.z*.6+rv(30),.3+Math.random()*.4,1,.8,.4,.5);if(Math.random()<.3)SFX.tick()}
if(r<.42&&dmgT<=0){dmgT=.05;_dmgP.copy(S.pos).addScaledVector(_f,-4).addScaledVector(_r,rv(2));smokePuff(_dmgP,_v.copy(S.vel).multiplyScalar(.2).add(new V3(rv(3),rv(3),rv(3))),6,1.6,r<.25?0x1a1614:0x3a3632)}
if(r<.25&&Math.random()<.6){_dmgP.copy(S.pos).addScaledVector(_r,rv(3)).addScaledVector(_f,1+Math.random()*3);FIRE.emit(_dmgP.x,_dmgP.y,_dmgP.z,S.vel.x*.7+rv(4),S.vel.y*.7+rv(4),S.vel.z*.7+rv(4),.25,1,.45,.1,.6)}}
let eSmT=0;function updEnemyDamage(dt){eSmT-=dt;if(eSmT>0)return;eSmT=.09;for(const e of en){if(e.dead||!e.mhp||e.hp>e.mhp*.55)continue;smokePuff(e.pos,new V3(rv(4),rv(4),rv(4)),4*(e.boss?3:1),1.2);if(e.hp<e.mhp*.3)FIRE.emit(e.pos.x,e.pos.y,e.pos.z,rv(6),rv(6),rv(6),.3,1,.45,.1,.6)}}
// distorsion de chaleur derrière les réacteurs (PC : dans la passe d'étalonnage)
const _hz=new V3();function updHeatHaze(){if(!GRADE||!GRADE.uniforms.hz0)return;const ud=ship.userData,fl=ud.flames||[],on=ship.visible&&!S.dead&&!FOOT.on&&!ckActive();for(let i=0;i<3;i++){const u=GRADE.uniforms['hz'+i].value;u.z=0;if(!on||!fl[i])continue;
fl[i].gs.getWorldPosition(_hz);_hz.addScaledVector(fwd(),-3);const d=_hz.distanceTo(camera.position);_hz.project(camera);if(_hz.z>1||Math.abs(_hz.x)>1.2||Math.abs(_hz.y)>1.2)continue;u.set(_hz.x*.5+.5,_hz.y*.5+.5,clamp(S.thr,0,1.6)*clamp(40/d,0,1.5))}}
// ---------- EXPLOSIONS ----------
const SHOCK_FS='uniform float a;uniform vec3 col;varying vec3 vNV;varying vec3 vN;void main(){float f=pow(1.-abs(vNV.z),2.6);gl_FragColor=vec4(col*f*(1.-a)*1.4,1.);}';
const SHOCKG=new THREE.SphereGeometry(1,24,14);
const LPOOL=new Map();function poolLight(sc){let L=LPOOL.get(sc);if(!L){L=[0,1].map(()=>{const l=new THREE.PointLight(0xffa050,0,300,2);sc.add(l);return{l,t:0,i0:0}});LPOOL.set(sc,L)}for(const q of L)if(q.l.parent!==sc)sc.add(q.l);return L}
poolLight(scene);
function boomLight(p,size,col){const L=poolLight(curScene()),q=L[0].t<L[1].t?L[0]:L[1];q.l.position.copy(p);q.l.color.setHex(col||0xffa050);q.l.distance=size*9;q.i0=DESK?6:3.5;q.t=.55;q.ml=.55;q.l.intensity=q.i0}
function updBoomLights(dt){const L=LPOOL.get(curScene());if(!L)return;for(const q of L){if(q.t>0){q.t-=dt;q.l.intensity=q.i0*Math.max(0,q.t/q.ml)**1.5}else q.l.intensity=0}}
bigBoom=function(p,n,c){const sc=curScene(),size=clamp(n*1.15,14,95),hi=DESK?1:.6,cc=new THREE.Color(c).lerp(new THREE.Color(0xffe0b0),.5);
// boule de feu
for(let i=0;i<Math.round(7*hi);i++){const s=fxSprite(FIRET,ADDB,0xffffff,1);s.position.copy(p).add(new V3(rv(size*.2),rv(size*.2),rv(size*.2)));s.material.rotation=Math.random()*TAU;s.scale.setScalar(1);sc.add(s);FXL.push({o:s,k:'fire',l:.7+Math.random()*.6,ml:1.3,sz:size*(.5+Math.random()*.7),v:new V3(rv(12),rv(12),rv(12)),d:i*.035})}
// fumée
for(let i=0;i<Math.round(9*hi);i++){const s=fxSprite(SMOKET,THREE.NormalBlending,mode=='surf'?0x5a5048:0x34343c,0);s.material.rotation=Math.random()*TAU;s.position.copy(p).add(new V3(rv(size*.2),rv(size*.2),rv(size*.2)));s.scale.setScalar(1);sc.add(s);const l=2.6+Math.random()*1.8;FXL.push({o:s,k:'smoke',l,ml:l,sz:size*(.7+Math.random()*.7),v:new V3(rv(1),rv(1),rv(1)).normalize().multiplyScalar(size*(.15+Math.random()*.35)),d:.12+Math.random()*.2,sp:rv(.4)})}
// anneau plat + onde de choc sphérique
const rm=new THREE.Mesh(RINGG,new THREE.MeshBasicMaterial({map:RINGT,color:cc,transparent:true,blending:ADDB,depthWrite:false,side:THREE.DoubleSide}));rm.position.copy(p);rm.lookAt(camera.position);rm.rotateZ(Math.random()*TAU);sc.add(rm);FXL.push({o:rm,k:'ring',l:.6,ml:.6,sz:size*1.5});
const pr=new THREE.Mesh(RINGG,rm.material.clone());pr.position.copy(p);pr.rotation.set(Math.PI/2+rv(.5),0,rv(.5));sc.add(pr);FXL.push({o:pr,k:'ring',l:.9,ml:.9,sz:size*2.6});
const sh=new THREE.Mesh(SHOCKG,new THREE.ShaderMaterial({uniforms:{a:{value:0},col:{value:cc.clone()}},vertexShader:AVS,fragmentShader:SHOCK_FS,transparent:true,blending:ADDB,depthWrite:false}));sh.position.copy(p);sc.add(sh);FXL.push({o:sh,k:'shock',l:.75,ml:.75,sz:size*1.9});
// débris incandescents
for(let i=0;i<Math.round(12*hi);i++){const m=new THREE.Mesh(DEBG[i%4],DEBM);m.scale.setScalar((.35+Math.random()*.9)*size/22);m.position.copy(p);m.rotation.set(rv(3),rv(3),rv(3));sc.add(m);const l=1.8+Math.random()*1.6;FXL.push({o:m,k:'deb',l,ml:l,v:new V3(rv(1),rv(1),rv(1)).normalize().multiplyScalar(size*(1+Math.random()*2.2)),sp:new V3(rv(7),rv(7),rv(7))})}
// gerbe d'étincelles rapides
const cl=new THREE.Color(c);for(let i=0;i<Math.round(40*hi);i++){const v=new V3(rv(1),rv(1),rv(1)).normalize().multiplyScalar(size*(4+Math.random()*5));SPK.emit(p.x,p.y,p.z,v.x,v.y,v.z,.4+Math.random()*.5,1,.85,.55,.25)}
boomLight(p,size,0xffa050);
// explosions secondaires pour les gros vaisseaux
if(n>=45)for(let i=1;i<=3;i++)setTimeout(()=>{if(curScene()!==sc)return;const q=p.clone().add(new V3(rv(size*.5),rv(size*.5),rv(size*.5)));boom3(q,18,c,70,false);flash(q,size*.9);boomLight(q,size*.6,0xffc070);SFX.rock()},i*170+Math.random()*120);
// éclair à l'écran si l'explosion est proche
const d=p.distanceTo(camera.position);if(d<size*6)BFL.v=Math.max(BFL.v,.35*(1-d/(size*6)))};
const BFL={v:0};
const _uFX=updFX;updFX=function(dt){for(const f of FXL)if(f.k=='shock'&&f.d<=0){const a=clamp(1-(f.l-dt)/f.ml,0,1);f.o.scale.setScalar(f.sz*Math.pow(a,.45)+1);f.o.material.uniforms.a.value=a}_uFX(dt)};
// ---------- ESPACE : nébuleuses traversables, ceintures d'astéroïdes, trafic autour des stations ----------
const DECOS=new Map();
function sectorDeco(c){const o=[],H=(k)=>h3(c.cx,c.cy,c.cz,k),cx=c.cx*CS+CS/2,cy=c.cy*CS+CS/2,cz=c.cz*CS+CS/2;
if(!c.sun&&H(321)<.24){const g=new THREE.Group(),hue=[275,195,320,215,160][H(322)*5|0],n=DESK?24:14;for(let i=0;i<n;i++){const col=new THREE.Color().setHSL(((hue+rv(35))%360+360)%360/360,.7,.5),s=fxSprite(SMOKET,ADDB,col,.12+H(330+i)*.14);s.material.rotation=H(340+i)*TAU;s.scale.setScalar(700+H(350+i)*1100);s.position.set(cx+(H(360+i)-.5)*2600,cy+(H(370+i)-.5)*900,cz+(H(380+i)-.5)*2600);g.add(s)}
for(let i=0;i<(DESK?10:5);i++){const s=sprite(new THREE.Color().setHSL(hue/360,.6,.75).getHex(),40+H(390+i)*80,.6);s.position.set(cx+(H(400+i)-.5)*2200,cy+(H(410+i)-.5)*700,cz+(H(420+i)-.5)*2200);g.add(s)}scene.add(g);o.push(g)}
if(c.ast.length>=20){let mx=0,my=0,mz=0;for(const a of c.ast){mx+=a.x;my+=a.y;mz+=a.z}mx/=c.ast.length;my/=c.ast.length;mz/=c.ast.length;const g=new THREE.Group();g.position.set(mx,my,mz);const n=DESK?320:150,r=rng(seedOf(c.cx,c.cy,c.cz,77));
for(let v=0;v<3;v++){const m=new THREE.InstancedMesh(AGEO[v*2],AMAT[v],Math.ceil(n/3)),d=new THREE.Object3D();for(let i=0;i<m.count;i++){const a=r()*TAU,rad=200+r()*700;d.position.set(Math.cos(a)*rad,(r()-.5)*(220+rad*.15),Math.sin(a)*rad);d.rotation.set(r()*3,r()*3,r()*3);d.scale.setScalar(1.2+Math.pow(r(),3)*9);d.updateMatrix();m.setMatrixAt(i,d.matrix)}g.add(m)}
for(let i=0;i<(DESK?9:5);i++){const s=fxSprite(SMOKET,THREE.NormalBlending,0x5a5048,.18);s.scale.setScalar(500+r()*500);const a=r()*TAU;s.position.set(Math.cos(a)*500,(r()-.5)*150,Math.sin(a)*500);g.add(s)}g.userData.spin=(r()-.5)*.01;scene.add(g);o.push(g)}
if(o.length)DECOS.set(c.k,o)}
const _lsD=loadSmall;loadSmall=function(c){_lsD(c);try{sectorDeco(c)}catch(e){console.warn(e)}if(c.st&&c.st.mesh&&!c.st.mesh.userData.traffic)stationTraffic(c.st.mesh)};
const _usD=unloadSmall;unloadSmall=function(k){const o=DECOS.get(k);if(o){for(const g of o){scene.remove(g);g.traverse(m=>{if(m.material&&m.material.map!==SMOKET)return;if(m.isSprite)m.material.dispose()})}DECOS.delete(k)}_usD(k)};
// navettes, feux d'approche clignotants et projecteurs autour des stations
const SHUTG=(()=>{const L=[{g:new THREE.BoxGeometry(2.4,1.4,5),c:[.75,.78,.82]},{g:new THREE.BoxGeometry(5,.3,2),m:M4(0,0,1),c:[.4,.45,.52]},{g:new THREE.BoxGeometry(1.6,.8,.6),m:M4(0,.5,-2.6),c:[.2,.5,.8]}];return mergeG(L)})();
function stationTraffic(st){const T={sh:[],strobe:[],cones:[]};st.userData.traffic=T;const M=new THREE.MeshStandardMaterial({vertexColors:true,metalness:.5,roughness:.4});
for(let i=0;i<(DESK?5:3);i++){const m=new THREE.Mesh(SHUTG,M);const gl=sprite(i%2?0xffa040:0x60c0ff,5);gl.position.z=3;m.add(gl);st.add(m);T.sh.push({m,a:Math.random()*TAU,r:110+Math.random()*140,y:(Math.random()-.5)*80,sp:(.08+Math.random()*.1)*(Math.random()<.5?-1:1),tilt:rv(.5)})}
for(const z of[-1,1])for(let i=0;i<8;i++){const s=sprite(0x60ff90,7);s.position.set(0,0,z*(80+i*14));st.add(s);T.strobe.push({s,i})}
const CG=new THREE.ConeGeometry(16,90,16,1,true).translate(0,-45,0),CM=new THREE.MeshBasicMaterial({color:0xfff0c8,transparent:true,opacity:.07,blending:ADDB,depthWrite:false,side:THREE.DoubleSide});
for(let i=0;i<4;i++){const a=i/4*TAU+.4,c=new THREE.Mesh(CG,CM);c.position.set(Math.cos(a)*44,Math.sin(a)*44,26);c.lookAt(new V3(0,0,0).add(st.position));c.rotateX(-Math.PI/2);st.add(c);T.cones.push(c);const s=sprite(0xfff4d0,10,.9);s.position.copy(c.position);st.add(s)}}
function updStations(dt){for(const s of stations){const T=s.mesh&&s.mesh.userData.traffic;if(!T)continue;for(const q of T.sh){q.a+=q.sp*dt;const x=Math.cos(q.a)*q.r,z=Math.sin(q.a)*q.r;q.m.position.set(x,q.y+Math.sin(q.a*2)*20,z);q.m.lookAt(_v.set(Math.cos(q.a-q.sp*.5)*q.r,q.y,Math.sin(q.a-q.sp*.5)*q.r).applyMatrix4(s.mesh.matrixWorld));}
const ph=(t*6)%10;for(const L of T.strobe)L.s.visible=Math.abs(ph-L.i)<.9}}
// reflets d'objectif du soleil aussi sur mobile (version légère)
if(!DESK){lensFlares=function(){if(mode!='space')return;const W=innerWidth,H=innerHeight;for(const s of suns){const sp=proj(s);if(!sp.front||sp.x<-100||sp.x>W+100||sp.y<-100||sp.y>H+100)continue;const o=camera.position,dir=_v.set(s.x-o.x,s.y-o.y,s.z-o.z),L=dir.length();dir.divideScalar(L);let vis=1;for(const p of planets){const oc=_w.set(p.x-o.x,p.y-o.y,p.z-o.z),b=oc.dot(dir);if(b<0||b>L)continue;if(oc.lengthSq()-b*b<p.r*p.r){vis=0;break}}if(!vis)continue;
const c=new THREE.Color(s.col),cs=`${c.r*255|0},${c.g*255|0},${c.b*255|0}`,vx=W/2-sp.x,vy=H/2-sp.y,edge=1-clamp(Math.hypot(vx,vy)/Math.hypot(W,H)*1.4,0,1);OX.save();OX.globalCompositeOperation='lighter';
const G2=(x,y,r,a,col)=>{const g=OX.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);OX.fillStyle=g;OX.fillRect(x-r,y-r,r*2,r*2)};G2(sp.x,sp.y,160,.3*edge+.08,cs);
[[.35,18,.22,'180,220,255'],[.7,30,.12,'160,255,200'],[1.2,46,.08,cs],[1.6,16,.2,'255,180,220']].forEach(([f,r,a,col])=>G2(sp.x+vx*f,sp.y+vy*f,r,a*edge*1.3,col));OX.restore()}}}
// ---------- boucle : un seul point d'entrée par image ----------
const _upG=updParts;updParts=function(dt){_upG(dt);try{updEntryFX(dt);updDamageFX(dt);updEnemyDamage(dt);updSmoke(dt);updBoomLights(dt);updHeatHaze();if(mode=='space'){updStations(dt);for(const o of DECOS.values())for(const g of o)if(g.userData.spin)g.rotation.y+=g.userData.spin*dt}BFL.v=Math.max(0,BFL.v-dt*2.2)}catch(e){console.warn(e)}};
const _ovG=overlay;overlay=function(){_ovG();if(BFL.v>.01){OX.fillStyle=`rgba(255,236,200,${BFL.v})`;OX.fillRect(0,0,innerWidth,innerHeight)}};
const _oeG=SURF.onEnter;SURF.onEnter=function(F,sc){_oeG(F,sc);poolLight(sc);for(const q of SMK){q.l=0;q.s.visible=false}};
// ---------- mémoire : on libère la géométrie de la planète quand on la quitte ----------
const SHAREDG=new Set();function markShared(){for(const g of[...ROCKG,...Object.values(FLORA),...Object.values(CHG),BLADE,...AGEO,...DEBG,RINGG,SHOCKG,TRAILG,FPG,OREG,PBG,EBG,SHUTG])if(g)SHAREDG.add(g)}
const _sxD=SURF.exit;SURF.exit=function(dead){const old=SURF.scene.children.slice(3);_sxD(dead);try{markShared();const keep=new Set();ship.traverse(o=>keep.add(o));for(const q of SMK)keep.add(q.s);
for(const o of old){if(o.parent||keep.has(o)||o===SPK.pts||o===FIRE.pts)continue;o.traverse(m=>{if(keep.has(m)||m.isSprite)return;if(m.geometry&&!SHAREDG.has(m.geometry))m.geometry.dispose();if(m.isInstancedMesh&&m.dispose)m.dispose();
const mt=m.material;if(mt&&mt.isShaderMaterial&&mt!==PLU){for(const u of Object.values(mt.uniforms||{}))if(u&&u.value&&u.value.isDataTexture)u.value.dispose();mt.dispose()}})}}catch(e){console.warn(e)}};
