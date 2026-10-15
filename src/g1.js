// ===== GRAPHISMES G1 (après w2.js) : atmosphères physiques, reflets d'environnement, explosions volumétriques, réglages PC =====
// - atmosphère vue de l'espace : diffusion Rayleigh + Mie calculée par lancer de rayons dans la coquille (remplace AFS2)
// - ciel au sol : même modèle (couchers de soleil rouges, halo autour du soleil) ; la couleur du brouillard suit l'horizon calculé
// - reflets : carte d'environnement PMREM régénérée selon l'étoile, la nébuleuse et la planète la plus proche (aussi sur PC)
// - explosions : boule de feu en volume (bruit 3D), onde de choc, fumée qui se dissipe
const G1={hq:DESK,ist:DESK?16:8,jst:DESK?6:3,env:null,envT:0,envK:'',pm:null,fb:[],smoke:[]};
// coefficients (unités = rayon de la planète) : épaisseur 0,16 R, hauteurs d'échelle 0,028 / 0,0045
const G1KR=new V3(1.6,3.9,7.0),G1KM=6.0;
function g1Kr(atm){const c=new V3(atm.r,atm.g,atm.b);const m=Math.max(c.x,c.y,c.z,.01);c.divideScalar(m);// mélange Terre / couleur propre à la planète
return new V3(lerp(G1KR.x,c.x*7,.55),lerp(G1KR.y,c.y*7,.55),lerp(G1KR.z,c.z*7,.55))}
const G1ATM=(steps,jsteps)=>`
#define PI 3.14159265
uniform vec3 kR;uniform float kM,ra,iSun;
vec2 g1rsi(vec3 r0,vec3 rd,float sr){float b=2.*dot(rd,r0),c=dot(r0,r0)-sr*sr,d=b*b-4.*c;if(d<0.)return vec2(1e5,-1e5);d=sqrt(d);return vec2((-b-d)*.5,(-b+d)*.5);}
vec3 g1atmo(vec3 rd,vec3 r0,vec3 sd){const float shR=.028,shM=.0045,g=.76;vec2 p=g1rsi(r0,rd,ra);if(p.x>p.y)return vec3(0.);p.x=max(p.x,0.);vec2 pp=g1rsi(r0,rd,1.);if(pp.x>0.&&pp.x<p.y)p.y=pp.x;
float st=(p.y-p.x)/${steps}.,tm=p.x,oR=0.,oM=0.;vec3 tR=vec3(0.),tM=vec3(0.);float mu=dot(rd,sd),mumu=mu*mu,gg=g*g;
float pR=3./(16.*PI)*(1.+mumu),pM=3./(8.*PI)*((1.-gg)*(mumu+1.))/(pow(1.+gg-2.*mu*g,1.5)*(2.+gg));
for(int i=0;i<${steps};i++){vec3 ip=r0+rd*(tm+st*.5);float h=length(ip)-1.;float dR=exp(-h/shR)*st,dM=exp(-h/shM)*st;oR+=dR;oM+=dM;
 float js=g1rsi(ip,sd,ra).y/${jsteps}.,jt=0.,jR=0.,jM=0.;bool sh=false;
 for(int j=0;j<${jsteps};j++){vec3 jp=ip+sd*(jt+js*.5);float jh=length(jp)-1.;if(jh<0.){sh=true;}jR+=exp(-jh/shR)*js;jM+=exp(-jh/shM)*js;jt+=js;}
 if(!sh){vec3 at=exp(-(kM*(oM+jM)+kR*(oR+jR)));tR+=dR*at;tM+=dM*at;}tm+=st;}
return iSun*(pR*kR*tR+pM*kM*tM);}`;

// =============== ATMOSPHÈRE VUE DE L'ESPACE ===============
const G1AVS='varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}';
const G1AFS=`uniform vec3 pc,sunDir;uniform float pr;varying vec3 vW;${G1ATM(G1.ist,G1.jst)}
void main(){vec3 rd=normalize(vW-cameraPosition),r0=(cameraPosition-pc)/pr;vec3 c=g1atmo(rd,r0,normalize(sunDir));c=1.-exp(-c*1.35);gl_FragColor=vec4(c,1.);}`;
function g1AtmMat(p,atm,sunDir){return new THREE.ShaderMaterial({uniforms:{pc:{value:new V3(p.x,p.y,p.z)},pr:{value:p.r},sunDir,kR:{value:g1Kr(atm)},kM:{value:G1KM},ra:{value:1.16},iSun:{value:16}},vertexShader:G1AVS,fragmentShader:G1AFS,side:THREE.BackSide,blending:ADDB,transparent:true,depthWrite:false})}
function g1Planet(g,p){if(p.ring)return g;// pas d'atmosphère dense autour des géantes gazeuses (leur halo d'origine reste)
g.traverse(o=>{if(o.isMesh&&o.material&&o.material.fragmentShader===AFS2){const U=o.material.uniforms;const atm=U.atm.value;o.geometry.dispose();o.geometry=new THREE.SphereGeometry(p.r*1.16,G1.hq?96:48,G1.hq?64:32);o.material=g1AtmMat(p,atm,U.sunDir);o.userData.g1=1}});return g}
{const _bp=buildPlanet;buildPlanet=function(p,tx){return g1Planet(_bp(p,tx),p)}}
if(typeof buildPlanetGPU=='function'){const _bg=buildPlanetGPU;buildPlanetGPU=function(p){return g1Planet(_bg(p),p)}}

// =============== CIEL AU SOL ===============
const G1SKY=`uniform vec3 hor,top,sunD,sunC,glowC;uniform float night,set,tm;varying vec3 vD;${G1ATM(G1.hq?14:8,G1.hq?5:3)}
float hs(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
void main(){vec3 d=normalize(vD);float y=d.y;vec3 sd=normalize(sunD);
vec3 c=g1atmo(normalize(vec3(d.x,max(y,-.02),d.z)),vec3(0.,1.0004,0.),sd);c=1.-exp(-c*1.6);
float mu=max(dot(d,sd),0.);c+=sunC*pow(mu,900.)*6.*smoothstep(-.03,.02,sd.y);// disque solaire
c=mix(c,hor,(1.-smoothstep(-.02,.16,y))*.55);// raccord avec le brouillard au ras du sol
c+=top*.04*night;
if(night>.01){vec3 q=d*230.;vec3 i=floor(q);float h=hs(i);if(h>.982){vec3 f=fract(q)-.5;float s=smoothstep(.24,0.,length(f))*(.6+.4*sin(tm*(1.5+h*4.)+h*50.));c+=mix(vec3(1.,.85,.7),vec3(.8,.9,1.),hs(i+3.))*s*night*smoothstep(0.,.12,y)*(h-.982)*55.;}
float b=1.-abs(dot(d,normalize(vec3(.35,.75,.55))));c+=vec3(.2,.18,.32)*pow(max(0.,b),14.)*night*smoothstep(0.,.25,y)*.9;}
gl_FragColor=vec4(c,1.);}`;
// version JS (peu d'échantillons) pour la couleur du brouillard à l'horizon
function g1AtmoJS(rd,r0,sd,kR,ist,jst){const shR=.028,shM=.0045,g=.76,ra=1.16;const rsi=(o,d,R)=>{const b=2*o.dot(d),c=o.dot(o)-R*R,D=b*b-4*c;if(D<0)return[1e5,-1e5];const s=Math.sqrt(D);return[(-b-s)/2,(-b+s)/2]};
let p=rsi(r0,rd,ra);if(p[0]>p[1])return new V3();p[0]=Math.max(p[0],0);const pp=rsi(r0,rd,1);if(pp[0]>0&&pp[0]<p[1])p[1]=pp[0];const st=(p[1]-p[0])/ist;let tm=p[0],oR=0,oM=0;const tR=new V3(),tM=new V3();
const mu=rd.dot(sd),pR=3/(16*Math.PI)*(1+mu*mu),pM=3/(8*Math.PI)*((1-g*g)*(mu*mu+1))/(Math.pow(1+g*g-2*mu*g,1.5)*(2+g*g)),ip=new V3(),jp=new V3();
for(let i=0;i<ist;i++){ip.copy(rd).multiplyScalar(tm+st*.5).add(r0);const h=ip.length()-1,dR=Math.exp(-h/shR)*st,dM=Math.exp(-h/shM)*st;oR+=dR;oM+=dM;const js=rsi(ip,sd,ra)[1]/jst;let jt=0,jR=0,jM=0,sh=false;
 for(let j=0;j<jst;j++){jp.copy(sd).multiplyScalar(jt+js*.5).add(ip);const jh=jp.length()-1;if(jh<0)sh=true;jR+=Math.exp(-jh/shR)*js;jM+=Math.exp(-jh/shM)*js;jt+=js}
 if(!sh){const ax=Math.exp(-(G1KM*(oM+jM)+kR.x*(oR+jR))),ay=Math.exp(-(G1KM*(oM+jM)+kR.y*(oR+jR))),az=Math.exp(-(G1KM*(oM+jM)+kR.z*(oR+jR)));tR.x+=dR*ax;tR.y+=dR*ay;tR.z+=dR*az;tM.x+=dM*ax;tM.y+=dM*ay;tM.z+=dM*az}tm+=st}
return new V3(pR*kR.x*tR.x+pM*G1KM*tM.x,pR*kR.y*tR.y+pM*G1KM*tM.y,pR*kR.z*tR.z+pM*G1KM*tM.z).multiplyScalar(16)}
function g1Sky(){const F=GR&&GR.F;if(!F||!F.dome||!F.skyU||F.g1sky)return;const atm=new THREE.Color().setHSL(((F.p.hue+15)%360)/360,.55,.62),U=F.skyU;U.kR={value:g1Kr(atm)};U.kM={value:G1KM};U.ra={value:1.16};U.iSun={value:16};
F.dome.material=new THREE.ShaderMaterial({uniforms:U,vertexShader:SKY_VS,fragmentShader:G1SKY,side:THREE.BackSide,depthWrite:false,fog:false});F.g1sky=1;F.g1kR=U.kR.value;F.g1T=0}
{const _se=SURF.enter;SURF.enter=function(p,e){const r=_se(p,e);try{g1Sky()}catch(x){console.warn(x)}return r}}
const _g1c=new THREE.Color(),_g1v=new V3(),_g1w=new V3();
function g1FogTick(dt){const F=GR&&GR.F;if(mode!='surf'||!F||!F.g1sky||!F.fog)return;F.g1T-=dt;const U=F.skyU,sd=_g1w.copy(U.sunD.value).normalize();
if(F.g1T<=0){F.g1T=.5;let acc=new V3();const r0=new V3(0,1.0004,0);for(const a of[0,Math.PI*.5,Math.PI,Math.PI*1.5]){_g1v.set(Math.cos(a),.03,Math.sin(a)).normalize();acc.add(g1AtmoJS(_g1v,r0,sd,F.g1kR,10,4))}acc.multiplyScalar(.25);
 F.g1fog=new THREE.Color(1-Math.exp(-acc.x*1.6),1-Math.exp(-acc.y*1.6),1-Math.exp(-acc.z*1.6))}
if(F.g1fog){const night=U.night.value;_g1c.copy(F.g1fog).lerp(F.fog.color,.35+night*.6);F.fog.color.copy(_g1c);U.hor.value.copy(_g1c);if(GR.sc&&GR.sc.background&&GR.sc.background.isColor)GR.sc.background.copy(_g1c)}}

// =============== REFLETS D'ENVIRONNEMENT (espace) ===============
function g1EnvBuild(){if(!G1.pm)G1.pm=new THREE.PMREMGenerator(R3);const es=new THREE.Scene();const neb=typeof NEB!='undefined'&&NEB.material&&NEB.material.map;
es.add(new THREE.Mesh(new THREE.SphereGeometry(40,32,16),new THREE.MeshBasicMaterial({map:neb||null,color:neb?0xffffff:0x0a1020,side:THREE.BackSide})));
const L=lightFor(S.pos.x,S.pos.y,S.pos.z),sun=new THREE.Mesh(new THREE.SphereGeometry(3.5,16,8),new THREE.MeshBasicMaterial({color:new THREE.Color(L.col).multiplyScalar(6)}));sun.position.copy(L.dir).multiplyScalar(30);es.add(sun);
let bp=null,bd=1e9;for(const p of planets){const d=Math.hypot(p.x-S.pos.x,p.y-S.pos.y,p.z-S.pos.z)-p.r;if(d<bd){bd=d;bp=p}}
if(bp&&bd<20000){const dir=new V3(bp.x-S.pos.x,bp.y-S.pos.y,bp.z-S.pos.z).normalize(),ang=Math.atan(bp.r/Math.max(bp.r*1.05,bd+bp.r)),R=Math.min(30,30*Math.tan(ang)*1.2);const col=new THREE.Color().setHSL(bp.hue/360,.45,.4);
 const pl=new THREE.Mesh(new THREE.SphereGeometry(Math.max(1.5,R),24,12),new THREE.MeshLambertMaterial({color:col}));pl.position.copy(dir).multiplyScalar(30);es.add(pl);const dl=new THREE.DirectionalLight(0xffffff,1.6);dl.position.copy(L.dir);es.add(dl,new THREE.AmbientLight(0x202838,.6))}
const rt=G1.pm.fromScene(es,.035);es.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose()});if(G1.env)G1.env.dispose();G1.env=rt;scene.environment=rt.texture}
function g1EnvTick(dt){if(mode!='space')return;G1.envT-=dt;if(G1.envT>0)return;G1.envT=G1.hq?6:20;const L=lightFor(S.pos.x,S.pos.y,S.pos.z);let bp='';for(const p of planets)if(Math.hypot(p.x-S.pos.x,p.z-S.pos.z)<20000)bp+=p.name;const k=L.dir.x.toFixed(1)+L.dir.y.toFixed(1)+L.dir.z.toFixed(1)+bp;if(k===G1.envK&&G1.env)return;G1.envK=k;try{g1EnvBuild()}catch(e){console.warn(e)}}
// les coques des vaisseaux en profitent pleinement sur PC
{const _bs=buildShip;buildShip=function(...a){const r=_bs(...a);try{const M=r.userData.mats;if(M&&DESK)for(const k of['hull','wing','accent']){const m=M[k];if(!m)continue;m.metalness=Math.max(m.metalness,.55);m.roughness=Math.min(m.roughness,.38);m.envMapIntensity=1.15;m.needsUpdate=true}}catch(e){}return r}}

// =============== EXPLOSIONS VOLUMÉTRIQUES ===============
const G1NOISE=`vec3 g1m289(vec3 x){return x-floor(x*(1./289.))*289.;}vec4 g1m289(vec4 x){return x-floor(x*(1./289.))*289.;}vec4 g1perm(vec4 x){return g1m289(((x*34.)+1.)*x);}
float g1sn(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=g1m289(i);
vec4 p=g1perm(g1perm(g1perm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
vec4 norm=1.79284291400159-.85373472095314*vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}`;
const G1FBV=`uniform float k,seed;varying float vD;varying vec3 vN;${G1NOISE}
void main(){vec3 n=normalize(position);float d=g1sn(n*1.7+seed+k*1.2)*.5+g1sn(n*3.8+seed*2.-k*.8)*.25+g1sn(n*8.+seed)*.12;vD=d;vN=normalize(normalMatrix*n);vec3 p=position*(1.+d*.55);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
const G1FBF=`uniform float k;uniform vec3 tint;varying float vD;varying vec3 vN;
void main(){float heat=clamp(1.-k*1.35+vD*.9,0.,1.);vec3 c=mix(vec3(.05,.04,.04),vec3(.9,.18,.03),smoothstep(.0,.35,heat));c=mix(c,vec3(1.,.55,.12),smoothstep(.35,.65,heat));c=mix(c,vec3(1.,.95,.75),smoothstep(.65,.95,heat));c=mix(c,c*tint*1.6,.25);
float rim=pow(1.-abs(vN.z),1.6);float a=(1.-smoothstep(.55,1.,k))*(.65+.35*(1.-rim));gl_FragColor=vec4(c*(1.+heat*2.2),a);}`;
const G1FBG=new THREE.IcosahedronGeometry(1,DESK?5:3);
const G1SMT=(()=>{const c=mkC(128),g=c.getContext('2d');for(let i=0;i<26;i++){const x=34+Math.random()*60,y=34+Math.random()*60,r=16+Math.random()*30,gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.22)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128)}return new THREE.CanvasTexture(c)})();
function g1Fireball(p,n,c){if(G1.fb.length>(DESK?8:3))return;const sc=curScene(),R=clamp(n*.55,6,60),m=new THREE.Mesh(G1FBG,new THREE.ShaderMaterial({uniforms:{k:{value:0},seed:{value:Math.random()*50},tint:{value:new THREE.Color(c)}},vertexShader:G1FBV,fragmentShader:G1FBF,transparent:true,depthWrite:false}));
m.position.copy(p);m.scale.setScalar(R*.2);sc.add(m);const ring=new THREE.Mesh(new THREE.RingGeometry(.92,1,64),new THREE.MeshBasicMaterial({color:0xcfe6ff,transparent:true,opacity:.7,blending:ADDB,depthWrite:false,side:THREE.DoubleSide}));ring.position.copy(p);ring.lookAt(camera.position);sc.add(ring);
G1.fb.push({m,ring,R,t:0,sc,life:1.7+R*.01});const ns=DESK?10:4;for(let i=0;i<ns;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:G1SMT,color:0x3a3634,transparent:true,opacity:0,depthWrite:false}));s.position.copy(p).add(new V3(rv(R*.6),rv(R*.6),rv(R*.6)));s.scale.setScalar(R*1.2);sc.add(s);G1.smoke.push({s,t:-.35-Math.random()*.3,life:3.5+Math.random()*2,v:new V3(rv(R*.25),rv(R*.25)+R*.08,rv(R*.25)),R,sc})}
for(let i=0;i<(DESK?40:16);i++){const v=new V3(rv(1),rv(1),rv(1)).normalize().multiplyScalar(R*(3+Math.random()*5));SPK.emit(p.x,p.y,p.z,v.x,v.y,v.z,1.4+Math.random()*1.2,1,.55+Math.random()*.3,.15,.985)}}
function g1FxTick(dt){for(const F of G1.fb){F.t+=dt;const k=F.t/F.life,e=1-Math.pow(1-Math.min(1,k*2.2),3);F.m.scale.setScalar(F.R*(.2+.95*e+k*.35));F.m.material.uniforms.k.value=k;F.m.rotation.y+=dt*.3;
 F.ring.scale.setScalar(F.R*(.5+k*9));F.ring.material.opacity=Math.max(0,.7-k*2.2);F.ring.lookAt(camera.position);if(k>=1){F.sc.remove(F.m);F.sc.remove(F.ring);F.m.material.dispose();F.ring.geometry.dispose();F.ring.material.dispose();F.done=1}}G1.fb=G1.fb.filter(F=>!F.done);
for(const P of G1.smoke){P.t+=dt;if(P.t<0)continue;const k=P.t/P.life;P.s.position.addScaledVector(P.v,dt);P.v.multiplyScalar(Math.pow(.6,dt));P.s.scale.setScalar(P.R*(1.2+k*1.8));P.s.material.opacity=Math.min(1,P.t*3)*(1-k)*.55;P.s.material.rotation+=dt*.15;if(k>=1){P.sc.remove(P.s);P.s.material.dispose();P.done=1}}G1.smoke=G1.smoke.filter(P=>!P.done)}
{const _b=boom3;boom3=function(p,n,c,spd,big){const r=_b(p,n,c,spd,big);if(big&&p&&n>=18)try{g1Fireball(p.clone?p.clone():new V3(p.x,p.y,p.z),n,c)}catch(e){console.warn(e)}return r}}

// =============== RÉGLAGES PC ===============
// Ultra : résolution native (jusqu'à ×2), ombres 4096, filtrage anisotrope maximal sur les textures chargées
if(DESK){const _pb=fx3PRBase;fx3PRBase=function(){return QI==0?Math.min(devicePixelRatio||1,2):_pb()};try{if(sunL&&sunL.shadow&&QI==0){sunL.shadow.mapSize.set(4096,4096);if(sunL.shadow.map){sunL.shadow.map.dispose();sunL.shadow.map=null}}}catch(e){}}

TICK.push(dt=>{const rd=Math.min(.1,dt||.016);try{g1EnvTick(rd);g1FogTick(rd);g1FxTick(rd)}catch(e){console.warn(e)}});
