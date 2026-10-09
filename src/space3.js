// ===== ESPACE 3 : étoiles variées (doubles, pulsars, géantes à éruptions), tempêtes solaires, baleines spatiales, épaves qui dérivent, explosions en chaîne, ralenti cinématique =====
const S3={v:new V3(),w:new V3(),q:new QT(),c:new THREE.Color()};
const S3VS='varying vec2 vUv;varying vec3 vP;varying vec3 vN;varying vec3 vW;void main(){vUv=uv;vP=position;vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}';
// ---------- #1 étoiles variées ----------
const STREAM_FS='uniform float tm;uniform vec3 c1,c2;varying vec2 vUv;void main(){float f=fract(vUv.x*3.-tm*.35);float a=(.35+.65*smoothstep(.6,1.,f))*smoothstep(0.,.08,vUv.x)*smoothstep(1.,.85,vUv.x);gl_FragColor=vec4(mix(c1,c2,vUv.x)*a*.9,1.);}';
const PBEAM_FS='uniform vec3 c;varying vec2 vUv;void main(){float a=pow(vUv.y,1.6)*.55;gl_FragColor=vec4(c*a,1.);}';
const PROM_FS='uniform float tm,k;uniform vec3 c;varying vec2 vUv;varying vec3 vP;float h(float x){return fract(sin(x)*43758.5453);}void main(){float f=sin(vUv.x*30.-tm*1.7+sin(vUv.x*7.+tm)*2.)*.5+.5;float a=(.45+.55*f)*smoothstep(0.,.12,vUv.x)*smoothstep(1.,.88,vUv.x)*k;gl_FragColor=vec4(c*a*1.3,1.);}';
function sunKind3(s){if(!s||s.x==null)return '';const h=hs((s.x|0)+11,(s.z|0)+7,71);if(/géante/.test(s.name||''))return h<.85?'giant':'';return h<.22?'binary':h<.36?'pulsar':''}
function sun3Deco(s,g){const k=sunKind3(s);if(!k)return;const r=s.r,U3={tm:TM},D={k};g.userData.s3=D;
if(k=='binary'){s.name='étoile double';const cc=s.col==0x96beff?0xff8a5a:0x9fc8ff,piv=new THREE.Group();g.add(piv);
const core=new THREE.Mesh(new THREE.SphereGeometry(r*.42,32,20),new THREE.ShaderMaterial({uniforms:{cA:{value:new THREE.Color(cc)},cB:{value:new THREE.Color(0xffffff)},tm:TM},vertexShader:PVS,fragmentShader:SUNFS}));core.position.x=r*3.4;piv.add(core);
const gl=sprite(cc,r*3.4,.6);gl.position.copy(core.position);piv.add(gl);const gl2=sprite(cc,r*1.5,.85,GLOW2);gl2.position.copy(core.position);piv.add(gl2);
const curve=new THREE.CatmullRomCurve3([new V3(r*3.4-r*.4,0,0),new V3(r*2.6,r*.3,r*.45),new V3(r*1.7,r*.22,r*.75),new V3(r*.85,0,r*.6)]),tube=new THREE.Mesh(new THREE.TubeGeometry(curve,40,r*.08,8,false),new THREE.ShaderMaterial({uniforms:{tm:TM,c1:{value:new THREE.Color(cc)},c2:{value:new THREE.Color(s.col)}},vertexShader:S3VS,fragmentShader:STREAM_FS,transparent:true,blending:ADDB,depthWrite:false}));piv.add(tube);
piv.rotation.set(.25,hs(s.x|0,s.z|0,3)*6,0);D.piv=piv}
else if(k=='pulsar'){s.name='pulsar';const core=g.children[0];if(core)core.scale.setScalar(.42);const ud=g.userData;if(ud.a)ud.a.scale.multiplyScalar(.6);if(ud.b)ud.b.scale.multiplyScalar(.5);
const piv=new THREE.Group();piv.rotation.z=.55;g.add(piv);const spin=new THREE.Group();piv.add(spin);const bm=new THREE.ShaderMaterial({uniforms:{c:{value:new THREE.Color(0xbfe0ff)}},vertexShader:S3VS,fragmentShader:PBEAM_FS,transparent:true,blending:ADDB,depthWrite:false,side:THREE.DoubleSide});
for(const sg of[1,-1]){const c=new THREE.Mesh(new THREE.ConeGeometry(r*.5,r*16,24,1,true).translate(0,-r*8,0),bm);if(sg>0)c.rotation.x=Math.PI;spin.add(c)}
spin.rotation.x=.7;D.spin=spin;D.piv=piv;D.flash=sprite(0xd8ecff,r*3,.0);D.flash.material=D.flash.material.clone();g.add(D.flash)}
else if(k=='giant'){const pm=[];const rr=rng(seedOf(s.x,s.y,s.z,81));for(let i=0;i<9;i++){const mat=new THREE.ShaderMaterial({uniforms:{tm:TM,k:{value:0},c:{value:new THREE.Color(s.col).lerp(new THREE.Color(0xffd080),.25)}},vertexShader:S3VS,fragmentShader:PROM_FS,transparent:true,blending:ADDB,depthWrite:false,side:THREE.DoubleSide});
const R=r*(.22+rr()*.26),m=new THREE.Mesh(new THREE.TorusGeometry(R,r*.05,8,40,Math.PI),mat);g.add(m);const P={m,mat,R,ph:rr()*30,life:18+rr()*16};p3Place(P,r,rr);pm.push(P)}D.prom=pm;D.rr=rr}}
function p3Place(P,r,rr){const n=S3.v.set(rr()-.5,rr()-.5,rr()-.5).normalize(),tg=S3.w.set(0,1,0).cross(n);if(tg.lengthSq()<1e-3)tg.set(1,0,0);tg.normalize();const b=new V3().crossVectors(n,tg);P.m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(tg,n,b));P.m.position.copy(n).multiplyScalar(r*.97)}
{const _bsn3=buildSun;buildSun=function(s){const g=_bsn3(s);try{sun3Deco(s,g)}catch(e){console.warn(e)}return g}}
function sun3Tick(dt){for(const s of suns){const D=s.mesh&&s.mesh.userData.s3;if(!D)continue;
if(D.k=='binary')D.piv.rotation.y+=dt*TAU/160;
else if(D.k=='pulsar'){D.spin.rotation.y+=dt*TAU/3.2;const f=Math.pow(Math.max(0,Math.sin(t*TAU/1.6)),18);D.flash.material.opacity=f*.8;D.flash.scale.setScalar(s.r*(2.2+f*1.6))}
else if(D.k=='giant')for(const P of D.prom){P.ph+=dt;const a=P.ph/P.life;if(a>=1){P.ph=0;p3Place(P,s.r,D.rr);continue}P.mat.uniforms.k.value=Math.sin(a*Math.PI)*1.4;P.m.scale.set(1,.25+a*1.1,1)}}}
// ---------- #2 tempêtes solaires ----------
const STM3={on:false,cd:40+Math.random()*60,R:0,s:null,dir:new V3(),mesh:null,hit:0,warn:0};
const CME_FS=NOISE_GLSL+'uniform float tm,k;uniform vec3 dir,c;varying vec3 vP;varying vec3 vW;varying vec3 vN;void main(){vec3 n=normalize(vP);float cap=smoothstep(.15,.75,dot(n,dir));vec3 V=normalize(cameraPosition-vW);float rim=pow(1.-abs(dot(normalize(vN),V)),1.4);float nz=fbm4(n*5.+vec3(tm*.15))*.5+.5;float a=cap*cap*(.15+rim*.7)*(.35+.9*nz*nz)*k*.6;gl_FragColor=vec4(c*a,1.);}';
function stm3Tick(dt){if(mode!='space'||S.docked){if(STM3.mesh)STM3.mesh.visible=false;return}
if(!STM3.on){STM3.cd-=dt;if(STM3.cd>0)return;STM3.cd=70+Math.random()*90;let best=null,bd=17000;for(const s of suns){const d=Math.hypot(s.x-S.pos.x,s.y-S.pos.y,s.z-S.pos.z);if(d<bd){bd=d;best=s}}if(!best||Math.random()<.35)return;
STM3.on=true;STM3.s=best;STM3.R=best.r;STM3.hit=0;STM3.dir.set(S.pos.x-best.x,S.pos.y-best.y,S.pos.z-best.z).normalize().add(S3.v.set(rv(.25),rv(.25),rv(.25))).normalize();
if(!STM3.mesh){STM3.mesh=new THREE.Mesh(new THREE.SphereGeometry(1,64,32),new THREE.ShaderMaterial({uniforms:{tm:TM,k:{value:1},dir:{value:STM3.dir},c:{value:new THREE.Color(1,.5,.14)}},vertexShader:S3VS,fragmentShader:CME_FS,transparent:true,blending:ADDB,depthWrite:false,side:THREE.DoubleSide}));STM3.mesh.frustumCulled=false;scene.add(STM3.mesh)}
STM3.mesh.position.set(best.x,best.y,best.z);STM3.mesh.visible=true;banner('star','Tempête solaire !','Une éjection de plasma arrive de '+best.name+' — tes boucliers vont crépiter','#ffb040');try{SFX.alarm()}catch(e){}return}
const s=STM3.s;STM3.R+=dt*1100;STM3.mesh.scale.setScalar(STM3.R);const d=Math.hypot(s.x-S.pos.x,s.y-S.pos.y,s.z-S.pos.z),k=clamp(1-(STM3.R-s.r)/24000,0,1);STM3.mesh.material.uniforms.k.value=k;
const dp=S3.v.set(S.pos.x-s.x,S.pos.y-s.y,S.pos.z-s.z).normalize().dot(STM3.dir);STM3.hit=Math.abs(STM3.R-d)<700&&dp>.45?Math.min(1,STM3.hit+dt*3):Math.max(0,STM3.hit-dt*1.5);
if(STM3.hit>.05){if(Math.random()<STM3.hit*.5)shieldT=Math.max(shieldT,.6+Math.random()*.4);shake=Math.max(shake,STM3.hit*.35);for(let i=0;i<3;i++){const o=S3.w.copy(S.pos).add(S3.v.set(rv(60),rv(60),rv(60)));SPK.emit(o.x,o.y,o.z,STM3.dir.x*260,STM3.dir.y*260,STM3.dir.z*260,.4,1,.6*STM3.hit,.2*STM3.hit,1)}}
if(k<=0){STM3.on=false;STM3.mesh.visible=false;STM3.hit=0}}
// ---------- #3 baleines spatiales ----------
const WH3={list:[],pool:[],cell:'',seen:0};
const WHL_VS='uniform float tm,ph;varying vec3 vP;varying vec3 vN;varying vec3 vW;void main(){vec3 p=position;float k=smoothstep(-.2,1.,p.z);p.x+=sin(p.z*1.4-tm*1.1+ph)*.18*k*k;p.y+=sin(p.z*1.1-tm*.9+ph)*.12*k;vP=position;vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(p,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}';
const WHL_FS=NOISE_GLSL+'uniform float tm,ph;uniform vec3 c1,c2;varying vec3 vP;varying vec3 vN;varying vec3 vW;void main(){vec3 V=normalize(cameraPosition-vW),N=normalize(vN);float rim=pow(1.-abs(dot(N,V)),2.);float sp=smoothstep(.62,.8,snoise(vP*vec3(5.,5.,2.2))*.5+.5)*(.5+.5*sin(tm*1.5+vP.z*6.+ph));float belly=smoothstep(.0,-.25,vP.y)*(.5+.5*sin(vP.z*28.));vec3 col=c1*(.18+.25*max(dot(N,vec3(0.,1.,0.)),0.))+c2*(rim*1.2+sp*1.6+belly*.35);gl_FragColor=vec4(col,.82+rim*.18);}';
let WHLG=null;
function whl3Geo(){if(WHLG)return WHLG;const pts=[[0,-1],[.18,-.92],[.3,-.7],[.36,-.4],[.34,-.05],[.27,.3],[.17,.62],[.08,.88],[.03,1]].map(([r,z])=>new THREE.Vector2(r,z));const body=new THREE.LatheGeometry(pts,20).rotateX(Math.PI/2);body.scale(1,.72,1);
const fin=(sx)=>{const g=new THREE.SphereGeometry(1,10,6);g.scale(.42,.03,.16);g.rotateY(sx*.5);g.rotateZ(sx*-.25);g.translate(sx*.42,-.08,-.25);return g},fl=(sx)=>{const g=new THREE.SphereGeometry(1,10,6);g.scale(.26,.025,.12);g.rotateY(sx*-.7);g.translate(sx*.2,0,1.02);return g};
WHLG=mergeG([{g:body},{g:fin(1)},{g:fin(-1)},{g:fl(1)},{g:fl(-1)}]);return WHLG}
function wh3Mk(){const m=new THREE.Mesh(whl3Geo(),new THREE.ShaderMaterial({uniforms:{tm:TM,ph:{value:Math.random()*6},c1:{value:new THREE.Color(.05,.16,.3)},c2:{value:new THREE.Color(.3,.85,1)}},vertexShader:WHL_VS,fragmentShader:WHL_FS,transparent:true,depthWrite:true}));m.frustumCulled=false;return m}
function wh3Tick(dt){if(mode!='space'){for(const w of WH3.list)w.m.visible=false;return}const cx=cof(S.pos.x),cz=cof(S.pos.z),cy=cof(S.pos.y);let pod=null;
for(let i=-1;i<=1&&!pod;i++)for(let j=-1;j<=1&&!pod;j++){const X=cx+i,Z=cz+j;if(cy!=0||(!X&&!Z))continue;if(h3(X,0,Z,313)<.11)pod={X,Z,c:new V3(X*CS+CS/2,CS/2+(h3(X,0,Z,314)-.5)*600,Z*CS+CS/2),n:1+(h3(X,0,Z,315)*3|0)}}
const key=pod?pod.X+','+pod.Z:'';if(key!==WH3.cell){WH3.cell=key;for(const w of WH3.list){scene.remove(w.m);WH3.pool.push(w.m)}WH3.list=[];if(pod)for(let i=0;i<pod.n;i++){const m=WH3.pool.pop()||wh3Mk();const sz=90+h3(pod.X,i,pod.Z,316)*80;m.scale.set(sz*.9,sz*.9,sz*1.6);scene.add(m);WH3.list.push({m,c:pod.c,a:i*2.1,R:520+i*170,sp:(.022+i*.006)*(i%2?-1:1),y:(i-1)*90,sz,sung:0})}}
for(const w of WH3.list){w.a+=w.sp*dt;const x=w.c.x+Math.cos(w.a)*w.R,z=w.c.z+Math.sin(w.a)*w.R,y=w.c.y+w.y+Math.sin(w.a*3)*40;const p=w.m.position,nx=w.c.x+Math.cos(w.a+w.sp*.5)*w.R,nz=w.c.z+Math.sin(w.a+w.sp*.5)*w.R;
p.set(x,y,z);w.m.lookAt(nx,y,nz);w.m.rotateY(Math.PI);w.m.visible=true;const d=p.distanceTo(S.pos);
if(d<2600&&Math.random()<dt*.6){const tl=S3.v.set(0,0,1).applyQuaternion(w.m.quaternion).multiplyScalar(w.sz*1.5).add(p);SPK.emit(tl.x+rv(20),tl.y+rv(20),tl.z+rv(20),rv(4),rv(4),rv(4),2.5,.25,.7,1,1)}
if(d<1800&&t-w.sung>22){w.sung=t;try{tone(170,62,2.8,'sine',.09);tone(230,95,2.3,'triangle',.035,.35)}catch(e){}if(!GX('whale',{seen:0}).seen){G.x.whale.seen=1;banner('star','Baleines spatiales !','D\'immenses créatures nagent dans le vide. Elles sont pacifiques.','#5fd8ff');try{cxLog('Rencontre avec des baleines spatiales')}catch(e){}}}}}
// ---------- #5 épaves qui dérivent + #15 explosions en chaîne ----------
const WR3={list:[],max:DESK?40:22,chain:[]};
function wr3Mat(src){const m=(src&&src.isMaterial?src:new THREE.MeshStandardMaterial()).clone();if(m.color)m.color.multiplyScalar(.32);if(m.emissive){m.emissive.setRGB(1,.42,.12);m.emissiveIntensity=1.2}m.transparent=false;m.userData.w3=1;return m}
function wr3Piece(src,mat,vel,spin){if(!src.geometry)return null;src.updateMatrixWorld(true);const m=new THREE.Mesh(src.geometry,mat);src.matrixWorld.decompose(m.position,m.quaternion,m.scale);scene.add(m);const P={m,v:vel.clone(),sp:spin,age:0,life:150,smk:0,mat};WR3.list.push(P);
while(WR3.list.length>WR3.max){const o=WR3.list.shift();if(o.m.parent)o.m.parent.remove(o.m)}return P}
function wr3Break(root,base,big){const meshes=[];root.traverse(o=>{if(o.isMesh&&o.geometry&&!(o.material&&(o.material.blending===ADDB||o.material.transparent))){o.geometry.boundingSphere||o.geometry.computeBoundingSphere();meshes.push(o)}});
meshes.sort((a,b)=>b.geometry.boundingSphere.radius*b.scale.x-a.geometry.boundingSphere.radius*a.scale.x);const mat=wr3Mat(meshes[0]&&meshes[0].material),n=Math.min(meshes.length,big?14:6),fw=S3.w.set(0,0,-1).applyQuaternion(root.getWorldQuaternion(S3.q)).clone();
for(let i=0;i<n;i++){const o=meshes[i];o.getWorldPosition(S3.v);const out=S3.v.clone().sub(root.getWorldPosition(new V3()));const side=big?Math.sign(out.dot(fw)||1):0;const vel=base.clone().multiplyScalar(.45).add(out.normalize().multiplyScalar(big?10+Math.random()*10:14+Math.random()*16)).addScaledVector(fw,side*14);
wr3Piece(o,mat,vel,new V3(rv(big?.35:1.4),rv(big?.35:1.4),rv(big?.35:1.4)))}}
function wreck3(e){if(mode!='space'||!e.mesh)return;const big=!!(e.boss||e.ty=='lourd'||e.kind=='carrier'||(e.sz||0)>=17||e.big),root=e.mesh,base=(e.vel||new V3()).clone();
if(!big){wr3Break(root,base,false);return}
// gros vaisseau : il tient encore une seconde, explose de partout, puis se brise en deux
scene.add(root);root.traverse(o=>{if(o.userData&&o.userData.bar)o.userData.bar.visible=false});if(root.userData.bar)root.userData.bar.visible=false;const sz=e.sz||20;WR3.chain.push({root,base,sz,t:0,n:0,pos:root.position.clone(),kc:!!(e.boss||e.kind=='carrier')})}
function wr3Tick(dt){for(let i=WR3.chain.length-1;i>=0;i--){const C=WR3.chain[i];C.t+=dt;C.root.position.addScaledVector(C.base,dt*.5);C.root.rotation.z+=dt*.25;
if(C.t>C.n*.24&&C.n<7){C.n++;const p=S3.v.copy(C.root.position).add(S3.w.set(rv(C.sz*.7),rv(C.sz*.4),rv(C.sz*.9)));boom3(p,18,0xffa040,70,C.n%2==0);try{SFX.boom()}catch(e){}shake=Math.max(shake,.5)}
if(C.t>1.75){WR3.chain.splice(i,1);if(C.kc)kc3Start(C.root.position,C.sz);wr3Break(C.root,C.base,true);if(C.root.parent)C.root.parent.remove(C.root);boom3(C.pos.copy(C.root.position),60,0xffc070,150,true);shake=Math.max(shake,1.2)}}
for(let i=WR3.list.length-1;i>=0;i--){const P=WR3.list[i],m=P.m;P.age+=dt;m.position.addScaledVector(P.v,dt);P.v.multiplyScalar(Math.pow(.92,dt));m.rotation.x+=P.sp.x*dt;m.rotation.y+=P.sp.y*dt;m.rotation.z+=P.sp.z*dt;
if(P.mat.emissive&&P.mat.emissiveIntensity>0)P.mat.emissiveIntensity=Math.max(0,1.2-P.age*.12);
if(mode=='space'&&P.age<45&&(P.smk-=dt)<=0){P.smk=.5+Math.random()*.6;if(m.position.distanceToSquared(S.pos)<2500*2500){const s=fxSprite(SMOKET,THREE.NormalBlending,0x2e2e34,0);s.position.copy(m.position);s.scale.setScalar(1);s.material.rotation=Math.random()*TAU;scene.add(s);FXL.push({o:s,k:'smoke',l:3,ml:3,sz:6+Math.random()*6,v:new V3(rv(3),rv(3),rv(3)),d:0,sp:rv(.4)});if(P.age<12&&Math.random()<.6)FIRE.emit(m.position.x,m.position.y,m.position.z,rv(5),rv(5),rv(5),.5,1,.5,.15,.6)}}
if(P.age>P.life){m.scale.multiplyScalar(Math.pow(.15,dt));if(m.scale.x<.05||P.age>P.life+6){scene.remove(m);WR3.list.splice(i,1)}}}}
{const _he3=hitEnemy;hitEnemy=function(e,d,p){const was=e.dead;_he3(e,d,p);if(!was&&e.dead){try{wreck3(e)}catch(x){console.warn(x)}}}}
// ---------- #18 ralenti cinématique ----------
const KC3={on:false,t0:0,dur:2.8,p:new V3(),R:80,a0:0};
function kc3Start(p,sz){if(KC3.on||FOOT.on||(typeof PH!='undefined'&&PH.on)||(typeof MENU3!='undefined'&&MENU3.on)||(typeof ckActive=='function'&&ckActive()))return;KC3.on=true;KC3.t0=performance.now();KC3.p.copy(p);KC3.R=Math.max(70,sz*5.5);const o=camera.position.clone().sub(p);KC3.a0=Math.atan2(o.x,o.z)}
function kc3Tick(){if(!KC3.on){if(window.TSCALE&&window.TSCALE!==1)window.TSCALE=1;return}const e=(performance.now()-KC3.t0)/1000,D=KC3.dur;if(e>D){KC3.on=false;window.TSCALE=1;return}window.TSCALE=e<.2?lerp(1,.2,e/.2):e>D-.5?lerp(.2,1,(e-(D-.5))/.5):.2}
{const _uc3=updCam;updCam=function(dt){if(KC3.on&&mode=='space'){const e=(performance.now()-KC3.t0)/1000,a=KC3.a0+e*.42,R=KC3.R;camera.position.set(KC3.p.x+Math.sin(a)*R,KC3.p.y+R*.28,KC3.p.z+Math.cos(a)*R);camera.up.set(0,1,0);camera.lookAt(KC3.p);sky.position.copy(camera.position);camInit=true;return}_uc3(dt)}}
{const _ov3=overlay;overlay=function(){_ov3();if(!KC3.on)return;const W=innerWidth,H=innerHeight,e=(performance.now()-KC3.t0)/1000,k=Math.min(1,e*4,(KC3.dur-e)*3),bh=H*.09*k;OX.save();OX.fillStyle='#000';OX.fillRect(0,0,W,bh);OX.fillRect(0,H-bh,W,bh);OX.globalAlpha=k;OX.fillStyle='#ffd27a';OX.font=`700 ${Math.round(Math.min(W,H)*.045)}px 'Chakra Petch',system-ui`;OX.textAlign='center';OX.fillText('CIBLE DÉTRUITE',W/2,H-bh-18);OX.restore()}}
TICK.push(dt=>{kc3Tick();try{if(mode=='space'){sun3Tick(dt);stm3Tick(dt)}else if(STM3.mesh)STM3.mesh.visible=false;wh3Tick(dt);wr3Tick(dt)}catch(e){console.warn(e)}});
// la tempête teinte l'écran
{const _ov3b=overlay;overlay=function(){_ov3b();if(STM3.hit>.03&&mode=='space'){const W=innerWidth,H=innerHeight,g=OX.createRadialGradient(W/2,H/2,Math.min(W,H)*.25,W/2,H/2,Math.max(W,H)*.75);g.addColorStop(0,'rgba(255,140,40,0)');g.addColorStop(1,`rgba(255,120,30,${.35*STM3.hit*(.7+.3*Math.sin(t*20))})`);OX.fillStyle=g;OX.fillRect(0,0,W,H)}}}
