// ===== MODE ULTRA (PC) : rendu procédural sur la carte graphique, halo, reflets =====
const NOISE_GLSL=`
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
float fbm4(vec3 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*snoise(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return v;}
float fbm6(vec3 p){float v=0.,a=.5;for(int i=0;i<6;i++){v+=a*snoise(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return v;}`;

// ----- post-traitement (halo lumineux) -----
let composer=null,rpass=null,bloom=null,GRP=null,bloomOn=DESK;
function setupPost(){if(!DESK||!THREE.EffectComposer)return;const w=innerWidth,h=innerHeight;let rt;try{if(R3.capabilities.isWebGL2&&THREE.WebGLMultisampleRenderTarget){rt=new THREE.WebGLMultisampleRenderTarget(w*R3.getPixelRatio(),h*R3.getPixelRatio(),{format:THREE.RGBAFormat});rt.samples=4}}catch(e){rt=undefined}
composer=new THREE.EffectComposer(R3,rt);rpass=new THREE.RenderPass(scene,camera);composer.addPass(rpass);bloom=new THREE.UnrealBloomPass(new THREE.Vector2(w,h),.8,.5,.84);GRP=new THREE.ShaderPass({uniforms:{tDiffuse:{value:null},sun:{value:new THREE.Vector2(.5,.5)},str:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
fragmentShader:'uniform sampler2D tDiffuse;uniform vec2 sun;uniform float str;varying vec2 vUv;void main(){vec4 base=texture2D(tDiffuse,vUv);if(str<.002){gl_FragColor=base;return;}vec2 d=(vUv-sun)*(.92/60.);vec2 c=vUv;float dec=1.;vec3 acc=vec3(0.);for(int i=0;i<60;i++){c-=d;vec3 s=texture2D(tDiffuse,c).rgb;float l=max(max(s.r,max(s.g,s.b))-.86,0.)*7.*smoothstep(.32,.04,distance(c,sun));acc+=s*l*dec;dec*=.968;}gl_FragColor=vec4(base.rgb+acc*str/60.,base.a);}'});
composer.insertPass?composer.insertPass(GRP,1):composer.addPass(GRP);composer.addPass(bloom)}
function renderFrame(){const sc=curScene();if(composer&&bloomOn){rpass.scene=sc;composer.render()}else R3.render(sc,camera)}
// ----- reflets d'environnement (métal) -----
function setupEnv(neb){if(!DESK)return;try{const pm=new THREE.PMREMGenerator(R3),es=new THREE.Scene();const n=new THREE.Mesh(new THREE.SphereGeometry(40,32,16),new THREE.MeshBasicMaterial({map:neb.material.map,side:THREE.BackSide}));es.add(n);
const k1=new THREE.Mesh(new THREE.SphereGeometry(5,16,8),new THREE.MeshBasicMaterial({color:0xfff2dd}));k1.position.set(20,22,10);const k2=new THREE.Mesh(new THREE.SphereGeometry(9,16,8),new THREE.MeshBasicMaterial({color:0x3a6aff}));k2.position.set(-25,-10,-18);es.add(k1,k2);
const env=pm.fromScene(es,.03).texture;scene.environment=env;SURF.scene.environment=env}catch(e){console.warn(e)}}
// ----- nébuleuse calculée sur la carte graphique -----
function gpuNebula(){const W2=2048,H2=1024,rt=new THREE.WebGLRenderTarget(W2,H2,{depthBuffer:false});const m=new THREE.ShaderMaterial({vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
fragmentShader:NOISE_GLSL+`varying vec2 vUv;void main(){float lon=vUv.x*6.2831853,lat=(vUv.y-.5)*3.1415926;vec3 d=vec3(cos(lat)*cos(lon),sin(lat),cos(lat)*sin(lon));
float band=exp(-pow(d.y*1.6+fbm4(d*1.3)*.5,2.)*2.);float a=fbm6(d*2.1+3.)*.5+.5,b=fbm6(d*3.4+11.)*.5+.5,c=fbm4(d*5.+20.)*.5+.5,dust=smoothstep(.45,.75,fbm6(d*4.2+40.)*.5+.5);
vec3 col=vec3(.006,.008,.02);col+=vec3(.35,.12,.55)*pow(a,3.5)*1.6*(.4+band);col+=vec3(.1,.35,.8)*pow(b,4.)*1.8*(.3+band);col+=vec3(.9,.35,.25)*pow(c,6.)*1.2*band;col+=vec3(.9,.8,.7)*pow(max(0.,1.-abs(d.y)*2.2),3.)*.08;
col*=1.-dust*.75*band;gl_FragColor=vec4(col,1.);}`,depthTest:false,depthWrite:false});
const q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),m),s=new THREE.Scene(),c=new THREE.Camera();s.add(q);q.frustumCulled=false;const prev=R3.getRenderTarget();R3.setRenderTarget(rt);R3.render(s,c);R3.setRenderTarget(prev);m.dispose();return rt.texture}
// ----- planètes procédurales -----
const PVS2=`varying vec3 vObj;varying vec3 vN;varying vec3 vW;void main(){vObj=position;vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
const PFS2=NOISE_GLSL+`uniform vec3 sunDir,sunCol,seed,cDeep,cShallow,cLow,cHigh,cPeak,atm;uniform float lq,gas,lava,ice,desert,city,cloudAmt,tm,bumpK;varying vec3 vObj;varying vec3 vN;varying vec3 vW;
void main(){vec3 d=normalize(vObj);vec3 p=d*2.+seed;float h;vec3 col;float water=0.;
if(gas>.5){float b=sin(d.y*9.+fbm4(p*1.3)*3.+seed.x)*.5+.5;float b2=fbm4(p*vec3(.7,3.2,.7)+vec3(tm*.004,0.,0.))*.5+.5;h=mix(b,b2,.45);col=mix(cLow,cHigh,h);col=mix(col,cPeak,smoothstep(.7,.95,b2)*.6);float storm=smoothstep(.82,.9,snoise(p*.9+seed.zxy)*.5+.5);col=mix(col,cPeak*1.1,storm*.7);}
else{h=fbm6(p)*.75+.5;if(h<lq){water=1.;col=mix(cDeep,cShallow,smoothstep(lq-.2,lq,h));}else{float k=(h-lq)/(1.-lq);col=mix(cLow,cHigh,smoothstep(0.,.55,k));col=mix(col,cPeak,smoothstep(.62,.82,k)*(1.-desert)*(1.-lava));col*=.82+.36*(snoise(p*22.)*.5+.5);}
float pole=smoothstep(.8,.9,abs(d.y)+fbm4(p*3.)*.07)*(1.-lava)*(1.-desert);col=mix(col,vec3(.9,.94,1.),pole);water*=1.-pole;}
vec3 G=normalize(vN),N=G;if(gas<.5){float land=smoothstep(lq-.01,lq+.03,h);vec3 sx=dFdx(vW),sy=dFdy(vW);vec3 r1=cross(sy,N),r2=cross(N,sx);float det=dot(sx,r1);vec2 dh=clamp(bumpK*vec2(dFdx(h),dFdy(h))*land,-abs(det)*.6,abs(det)*.6);vec3 gr=sign(det)*(dh.x*r1+dh.y*r2);N=normalize(abs(det)*N-gr);}
float gl=dot(G,sunDir),term=smoothstep(-.1,.22,gl),diff=max(dot(N,sunDir),0.);vec3 V=normalize(cameraPosition-vW);
vec3 c=col*(.022+sunCol*diff*term*1.0);vec3 Hh=normalize(sunDir+V);c+=sunCol*pow(max(dot(G,Hh),0.),200.)*(water+ice*.3)*term*.7;
if(lava>.5&&water>.5){float fl=.75+.35*sin(tm*1.3+h*60.);c=col*fl*1.6+col*diff*.3;}
if(cloudAmt>0.){float cl=smoothstep(.0,.35,fbm4(d*2.6+seed*1.3+vec3(tm*.006,0.,0.))*.5+.5-(1.-cloudAmt));c*=1.-cl*.5*term;}
if(city>.5&&water<.5&&lava<.5){float ci=smoothstep(.62,.9,snoise(p*26.)*.5+.5)*smoothstep(.48,.62,fbm4(p*3.+7.)*.5+.5);c+=vec3(1.,.66,.32)*ci*smoothstep(.05,-.22,gl)*1.6;}
float mu=max(dot(G,V),0.);c=mix(c,atm*(.1+term*.75),pow(1.-mu,3.2)*.55);gl_FragColor=vec4(c,1.);}`;
const CFS2=NOISE_GLSL+`uniform vec3 sunDir,sunCol,seed;uniform float cloudAmt,tm,lava;varying vec3 vObj;varying vec3 vN;varying vec3 vW;void main(){vec3 d=normalize(vObj);float cl=smoothstep(.0,.35,fbm4(d*2.6+seed*1.3+vec3(tm*.006,0.,0.))*.5+.5-(1.-cloudAmt));cl*=.75+.25*(snoise(d*14.+seed)*.5+.5);
float gl=dot(normalize(vN),sunDir),day=smoothstep(-.15,.3,gl);vec3 sunset=mix(vec3(1.,.5,.3),vec3(1.),smoothstep(0.,.35,gl));vec3 base=lava>.5?vec3(.35,.3,.3):vec3(1.);vec3 c=base*(.02+sunCol*sunset*max(gl,0.)*.82);gl_FragColor=vec4(c,cl*(.15+.85*day)*.85);}`;
const AFS2=`uniform vec3 atm;uniform vec3 sunDir;varying vec3 vNV;varying vec3 vN;void main(){float i=pow(clamp(.8-dot(vNV,vec3(0.,0.,1.)),0.,1.),2.6);float l=dot(vN,sunDir);float day=smoothstep(-.35,.45,l);vec3 col=mix(vec3(1.,.42,.18),atm,smoothstep(-.12,.35,l))*day;gl_FragColor=vec4(col*i*1.7,1.);}`;
const C3=(h,s,l)=>{const c=hsl(h,s,l);return new THREE.Color(c[0]/255,c[1]/255,c[2]/255)};
function planetLook(p){const ty=ptype(p),h=p.hue;const L={Volcanique:{lq:.44,lava:1,cDeep:new THREE.Color(1,.3,.04),cShallow:new THREE.Color(1,.72,.22),cLow:C3(15,.25,.1),cHigh:C3(20,.18,.24),cPeak:C3(10,.1,.32),cloud:.3},
Désertique:{lq:.24,desert:1,cDeep:C3(200,.5,.22),cShallow:C3(180,.5,.4),cLow:C3(h,.6,.42),cHigh:C3(h+18,.5,.62),cPeak:C3(h-12,.45,.3),cloud:.18},
Jungle:{lq:.46,cDeep:C3(212,.65,.12),cShallow:C3(185,.6,.32),cLow:C3(h,.55,.2),cHigh:C3(h-25,.4,.32),cPeak:C3(0,0,.88),cloud:.45,city:1},
Océanique:{lq:.63,cDeep:C3(218,.75,.1),cShallow:C3(195,.7,.34),cLow:C3(100,.42,.28),cHigh:C3(40,.35,.45),cPeak:C3(0,0,.9),cloud:.45,city:1},
Glacée:{lq:.42,ice:1,cDeep:C3(205,.45,.5),cShallow:C3(190,.5,.74),cLow:C3(205,.15,.78),cHigh:C3(210,.1,.9),cPeak:C3(0,0,.97),cloud:.45},
Cristalline:{lq:.42,cDeep:C3(h+40,.7,.32),cShallow:C3(h+70,.8,.6),cLow:C3(h,.35,.3),cHigh:C3(h+20,.45,.5),cPeak:C3(h+70,.7,.82),cloud:.3,city:1}}[ty]||{gas:1,lq:0,cLow:C3(h,.5,.35),cHigh:C3(h+30,.45,.65),cPeak:C3(h+60,.3,.86),cDeep:C3(0,0,0),cShallow:C3(0,0,0),cloud:0};const pv=pvar(p);if(pv=='archipel'){L.lq=.68;L.cShallow=C3(176,.75,.48);L.cLow=C3(46,.45,.6);L.cHigh=C3(115,.5,.28)}else if(pv=='ruines')L.city=1;else if(pv=='cristal'){L.cPeak=C3(h+80,.75,.85);L.cHigh=C3(h+30,.55,.55)}return L}
function buildPlanetGPU(p){const g=new THREE.Group();g.position.set(p.x,p.y,p.z);const L=planetLook(p),lt=lightFor(p.x,p.y,p.z),atmC=new THREE.Color().setHSL(((p.hue+15)%360)/360,.6,.6),r=rng(seedOf(p.x,p.y,p.z,11));
const U={sunDir:{value:lt.dir.clone()},sunCol:{value:lt.col.clone().multiplyScalar(lt.s?1.1:.95)},seed:{value:new V3(r()*50,r()*50,r()*50)},cDeep:{value:L.cDeep},cShallow:{value:L.cShallow},cLow:{value:L.cLow},cHigh:{value:L.cHigh},cPeak:{value:L.cPeak},atm:{value:atmC},
lq:{value:L.lq},gas:{value:L.gas||0},lava:{value:L.lava||0},ice:{value:L.ice||0},desert:{value:L.desert||0},city:{value:L.city&&r()<.65?1:0},cloudAmt:{value:L.cloud},tm:TM,bumpK:{value:p.r*.035}};
const sph=new THREE.Mesh(new THREE.SphereGeometry(p.r,96,64),new THREE.ShaderMaterial({uniforms:U,vertexShader:PVS2,fragmentShader:PFS2,extensions:{derivatives:true}}));g.add(sph);
let cl=null;if(L.cloud>0){cl=new THREE.Mesh(new THREE.SphereGeometry(p.r*1.015,96,64),new THREE.ShaderMaterial({uniforms:U,vertexShader:PVS2,fragmentShader:CFS2,transparent:true,depthWrite:false}));g.add(cl)}
const at=new THREE.Mesh(new THREE.SphereGeometry(p.r*1.17,64,32),new THREE.ShaderMaterial({uniforms:{atm:U.atm,sunDir:U.sunDir},vertexShader:AVS,fragmentShader:AFS2,side:THREE.BackSide,blending:ADDB,transparent:true,depthWrite:false}));g.add(at);
if(p.ring){const rg=new THREE.RingGeometry(p.r*1.35,p.r*2.3,160,1),pos=rg.attributes.position,uv=rg.attributes.uv;for(let i=0;i<pos.count;i++){const l=Math.hypot(pos.getX(i),pos.getY(i));uv.setXY(i,(l-p.r*1.35)/(p.r*.95),.5)}
const rc=mkC(1024,4),rx=rc.getContext('2d');for(let x=0;x<1024;x++){const a=(.12+r()*.55)*(Math.sin(x*.05)*.25+.75)*(x<20||x>1000?.2:1)*(x>600&&x<650?.08:1),cc=hsl(p.hue+30+r()*25,.4,.55+r()*.2);rx.fillStyle=`rgba(${cc.map(Math.round)},${a})`;rx.fillRect(x,0,1,4)}
const ring=new THREE.Mesh(rg,new THREE.ShaderMaterial({uniforms:{map:{value:new THREE.CanvasTexture(rc)},sunDir:U.sunDir,sunCol:U.sunCol,pc:{value:new V3(p.x,p.y,p.z)},pr:{value:p.r}},vertexShader:'varying vec2 vUv;varying vec3 vW;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
fragmentShader:'uniform sampler2D map;uniform vec3 sunDir,sunCol,pc;uniform float pr;varying vec2 vUv;varying vec3 vW;void main(){vec4 t=texture2D(map,vUv);vec3 o=vW-pc;float b=dot(o,sunDir);float sh=1.;if(b<0.){float d2=dot(o,o)-b*b;sh=smoothstep(pr*pr*.92,pr*pr*1.05,d2);}gl_FragColor=vec4(t.rgb*sunCol*(.08+.92*sh),t.a);}',transparent:true,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=Math.PI/2-.35;ring.rotation.y=.2;g.add(ring)}
const moons=[],nm=p.ring?1+(r()<.5):r()<.5?1:0;for(let i=0;i<nm;i++){const piv=new THREE.Group();piv.rotation.set(r()*.6-.3,r()*TAU,r()*.6-.3);const m=new THREE.Mesh(new THREE.IcosahedronGeometry(p.r*(.06+r()*.08),3),new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(.08,.08,.45+r()*.2),roughness:.95,metalness:0,flatShading:true}));m.position.x=p.r*(2.5+i*.8+r()*.4);piv.add(m);g.add(piv);moons.push({piv,sp:(.03+r()*.05)*(r()<.5?-1:1)})}
g.userData={U,cl:null,moons,sph};return g}
// ----- reflets d'objectif (soleils), dessinés en surimpression -----
function lensFlares(){if(!DESK||mode!='space')return;const W=innerWidth,H=innerHeight;for(const s of suns){const sp=proj(s);if(!sp.front)continue;if(sp.x<-200||sp.x>W+200||sp.y<-200||sp.y>H+200)continue;
// occultation par les planètes
const o=camera.position,dir=_v.set(s.x-o.x,s.y-o.y,s.z-o.z),L=dir.length();dir.divideScalar(L);let vis=1;for(const p of planets){const oc=_w.set(p.x-o.x,p.y-o.y,p.z-o.z),b=oc.dot(dir);if(b<0||b>L)continue;const d2=oc.lengthSq()-b*b;if(d2<p.r*p.r){vis=0;break}}if(!vis)continue;
const c=new THREE.Color(s.col),cs=`${c.r*255|0},${c.g*255|0},${c.b*255|0}`,vx=W/2-sp.x,vy=H/2-sp.y,edge=1-clamp(Math.hypot(vx,vy)/Math.hypot(W,H)*1.4,0,1);OX.save();OX.globalCompositeOperation='lighter';OX.shadowBlur=0;
const G2=(x,y,r,a,col)=>{const g=OX.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);OX.fillStyle=g;OX.fillRect(x-r,y-r,r*2,r*2)};
G2(sp.x,sp.y,260,.35*edge+.1,cs);OX.strokeStyle=`rgba(${cs},${.12*edge})`;OX.lineWidth=2;OX.beginPath();OX.moveTo(sp.x-W*.6,sp.y);OX.lineTo(sp.x+W*.6,sp.y);OX.stroke();
[[.25,26,.18,'255,220,170'],[.45,12,.3,'180,220,255'],[.62,44,.1,'160,255,200'],[.8,18,.22,'255,160,220'],[1.15,70,.08,cs],[1.4,24,.18,'200,200,255'],[1.75,110,.06,'255,200,140']].forEach(([f,r,a,col])=>{const x=sp.x+vx*f,y=sp.y+vy*f;G2(x,y,r,a*edge*1.3,col);OX.strokeStyle=`rgba(${col},${a*edge*.6})`;OX.lineWidth=1.5;OX.beginPath();for(let k=0;k<6;k++){const an=k/6*TAU;OX.lineTo(x+Math.cos(an)*r*.8,y+Math.sin(an)*r*.8)}OX.closePath();OX.stroke()});OX.restore()}}
// ----- eau réaliste (surfaces) -----
function waterMat(deep,shallow){return new THREE.ShaderMaterial({transparent:true,uniforms:{tm:TM,deep:{value:new THREE.Color(deep)},shallow:{value:new THREE.Color(shallow)},sunDir:{value:new V3(.4,.75,.3).normalize()},sunCol:{value:new THREE.Color(1,.95,.85)},sky:{value:new THREE.Color()},fogColor:{value:new THREE.Color()},fogNear:{value:200},fogFar:{value:1900}},
vertexShader:'varying vec3 vW;varying float vD;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vec4 mv=viewMatrix*w;vD=-mv.z;gl_Position=projectionMatrix*mv;}',
fragmentShader:NOISE_GLSL+`uniform float tm,fogNear,fogFar;uniform vec3 deep,shallow,sunDir,sunCol,sky,fogColor;varying vec3 vW;varying float vD;
void main(){vec2 p=vW.xz;float e=.6;vec3 q=vec3(p*.012,tm*.25);float hx=snoise(q+vec3(e*.012,0.,0.))-snoise(q-vec3(e*.012,0.,0.)),hz=snoise(q+vec3(0.,e*.012,0.))-snoise(q-vec3(0.,e*.012,0.));vec3 q2=vec3(p*.05,tm*.6);hx+=.5*(snoise(q2+vec3(.05,0.,0.))-snoise(q2-vec3(.05,0.,0.)));hz+=.5*(snoise(q2+vec3(0.,.05,0.))-snoise(q2-vec3(0.,.05,0.)));
vec3 N=normalize(vec3(-hx*1.2,1.,-hz*1.2));vec3 V=normalize(cameraPosition-vW);float fr=.04+.96*pow(1.-max(dot(N,V),0.),5.);vec3 col=mix(mix(deep,shallow,.35+.3*snoise(vec3(p*.004,1.))),sky,fr*.85);
vec3 H=normalize(sunDir+V);col+=sunCol*pow(max(dot(N,H),0.),220.)*3.;col+=sunCol*pow(max(dot(N,H),0.),30.)*.15;float f=smoothstep(fogNear,fogFar,vD);gl_FragColor=vec4(mix(col,fogColor,f),mix(.88,1.,f));}`})}

const _gp=new V3(),_cf=new V3();
function updGodRays(){if(!GRP)return;let pos=null;if(mode=='space'){let bd=1e18;for(const s of suns){const d=camera.position.distanceToSquared(_gp.set(s.x,s.y,s.z));if(d<bd){bd=d;pos=_gp.clone()}}}else if(SURF.sunPos)pos=SURF.sunPos.clone();
let k=0;if(pos){_cf.set(0,0,-1).applyQuaternion(camera.quaternion);if(pos.clone().sub(camera.position).dot(_cf)>0){const p=pos.clone().project(camera);GRP.uniforms.sun.value.set((p.x+1)/2,(p.y+1)/2);k=clamp(1.5-Math.max(Math.abs(p.x),Math.abs(p.y)),0,1)}}
GRP.uniforms.str.value=lerp(GRP.uniforms.str.value,k*(mode=='surf'?1.1:1.4),.12)}
