// ===== PLANÈTES STYLISÉES (pl4.js, après sky4.js) — portage du « Godot 3D Planet Generator » de naejimer (licence MIT) =====
// Godot : bruit FastNoiseLite normalisé → 5 bandes de couleur par seuils (corps), nuages = deux lectures du bruit qui défilent, seuil net (clouds), halo de Fresnel (atmosphere).
// Ici : le bruit 3D est « cuit » une fois par planète dans une texture équirectangulaire (R = corps normalisé, G = nuages) par la carte graphique (pl4Bake),
// puis la sphère colore par bandes, éclaire (soleil du jeu U.sunDir/U.sunCol), reflets sur l'eau, lave émissive, lumières des villes la nuit, ombre des anneaux.
// Préréglages Godot : terrestrial (Jungle, Océanique), ice (Glacée, Cristalline recolorée), lava (Volcanique), sand (Désertique), gaseous (Géante gazeuse), no_atmosphere (lunes).
// Options → « Planètes » : Stylisées / Réalistes (localStorage sf-pl4). Les matériaux d'origine sont gardés pour revenir en arrière.
const PL4={on:true,list:[],rt:null};try{PL4.on=localStorage.getItem('sf-pl4')!=='real'}catch(e){}
const C4h=(r,g,b)=>new THREE.Color(r,g,b);
// n : type de bruit (0 simplex, 1 cellulaire), f : fréquence (par rayon), o : octaves, ft : fractale (0 aucune, 1 fbm, 2 crêtes, 3 ping-pong), l/g : lacunarité/gain, sc : noise_scale, gas
const PL4P={
terrestrial:{n:0,f:2.6,o:5,ft:1,l:2,g:.5,sc:1,c:[C4h(.17,.55,1),C4h(1,.94,.76),C4h(.34,.74,.5),C4h(.27,.62,.42),C4h(1,1,1)],t:[.54,.56,.6,.7],r1:.1,cl:{b:.6,th:1.12,fl:.1},at:{c1:C4h(0,.12,.27),c2:C4h(.63,.78,1),a:.3,am:4.5,i:4}},
ice:{n:0,f:2.6,o:5,ft:1,l:2,g:.5,sc:1,c:[C4h(.31,.61,.78),C4h(.47,.68,.81),C4h(.62,.75,.83),C4h(.93,.94,.97),C4h(.82,.85,.89)],t:[.287,.374,.472,.573],r1:0,cl:{b:.728,th:1.102,fl:.376},at:{c1:C4h(.11,.29,.39),c2:C4h(.63,.82,.94),a:.6,am:4.5,i:4}},
lava:{n:0,f:10,o:1,ft:3,l:2,g:.5,sc:1,c:[C4h(1,.54,.2),C4h(.9,.27,.22),C4h(.68,.18,.27),C4h(.32,.2,.25),C4h(.24,.16,.21)],t:[.253,.303,.402,.653],r1:0,e1:1,at:{c1:C4h(.17,.06,0),c2:C4h(1,.52,.16),a:.3,am:5.4,i:.167,em:1}},
sand:{n:0,f:1.3,o:3,ft:3,l:2,g:.5,sc:1.283,c:[C4h(.98,.88,.73),C4h(.81,.65,.53),C4h(.57,.38,.22),C4h(.47,.32,.22),C4h(.33,.27,.22)],t:[.51,.659,.72,.764],r1:0,at:{c1:C4h(.57,.38,.22),c2:C4h(.88,.67,.51),a:.513,am:4.5,i:4}},
gaseous:{n:0,f:2.6,o:5,ft:1,l:2,g:.5,sc:1.425,gas:1,c:[C4h(.78,.55,.23),C4h(.56,.38,.3),C4h(.83,.61,.49),C4h(.65,.61,.53),C4h(.25,.27,.21)],t:[.422,.505,.529,.574],r1:0,at:{c1:C4h(.4,.26,.2),c2:C4h(.76,.56,.47),a:.8,am:4.5,i:4}},
noatm:{n:1,f:2.2,o:1,ft:0,l:2,g:.5,sc:1,c:[C4h(.19,.19,.18),C4h(.58,.56,.55),C4h(.85,.85,.84),C4h(.94,.94,.94),C4h(.76,.76,.75)],t:[.257,.332,.44,.638],r1:0}};
const PL4GL=`vec3 m2(vec3 x){return x-floor(x*(1./289.))*289.;}vec4 m2(vec4 x){return x-floor(x*(1./289.))*289.;}vec4 pm(vec4 x){return m2(((x*34.)+1.)*x);}
float sn(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=m2(i);vec4 p=pm(pm(pm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 nr=1.79284291400159-.85373472095314*vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3));
p0*=nr.x;p1*=nr.y;p2*=nr.z;p3*=nr.w;vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}
vec3 hh(vec3 p){p=vec3(dot(p,vec3(127.1,311.7,74.7)),dot(p,vec3(269.5,183.3,246.1)),dot(p,vec3(113.5,271.9,124.6)));return fract(sin(p)*43758.5453);}
float ce(vec3 p){vec3 i=floor(p),f=fract(p);float d=8.;for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)for(int z=-1;z<=1;z++){vec3 o=vec3(float(x),float(y),float(z));vec3 r=o+hh(i+o)-f;d=min(d,dot(r,r));}return sqrt(d)*1.6-1.;}
uniform float NT,FT,OCT,LAC,GAIN;
float bs(vec3 p){return NT<.5?sn(p):ce(p);}
float fr(vec3 p){if(FT<.5)return bs(p);float s=0.,a=1.,w=0.;for(int i=0;i<10;i++){if(float(i)>=OCT)break;float n=bs(p);
 if(FT<1.5)s+=n*a;else if(FT<2.5)s+=((1.-abs(n))*2.-1.)*a;else{float t=(n+1.)*2.;t=t-floor(t*.5)*2.;t=t<1.?t:2.-t;s+=(t*2.-1.)*a;}w+=a;a*=GAIN;p*=LAC;}return s/w;}`;
const PL4BAKE_FS=PL4GL+`uniform float FQ,GAS,CF,NORM;uniform vec3 SEED,SEED2;uniform vec4 MM;varying vec2 vUv;
void main(){float ph=vUv.x*6.28318530718,th=(1.-vUv.y)*3.14159265359;vec3 d=vec3(-cos(ph)*sin(th),cos(th),sin(ph)*sin(th));
 vec3 q=GAS>.5?vec3(d.x*.0998,d.y,d.z*.0998):d;float b=fr(q*FQ+SEED)*.5+.5;
 float c=0.;if(CF>0.){float s=0.,a=1.,w=0.;vec3 p=d*CF+SEED2;for(int i=0;i<5;i++){s+=sn(p)*a;w+=a;a*=.5;p*=2.;}c=s/w*.5+.5;}
 if(NORM>.5){b=clamp((b-MM.x)/max(1e-4,MM.y-MM.x),0.,1.);c=clamp((c-MM.z)/max(1e-4,MM.w-MM.z),0.,1.);}gl_FragColor=vec4(b,c,0.,1.);}`;
const PL4VS='varying vec2 vUv;varying vec3 vN,vW;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*w;}';
const PL4FS=`uniform sampler2D tex;uniform vec3 c1,c2,c3,c4,c5,sunDir,sunCol,rN3,pc3;uniform vec4 th;uniform float r1,e1,city,hasR,rI3,rO3;varying vec2 vUv;varying vec3 vN,vW;
float hs2(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){float v=texture2D(tex,vUv).r;vec3 c;float sp=0.,em=0.;bool w=false;
 if(v<th.x){c=c1;sp=1.-r1;em=e1;w=true;}else if(v<th.y)c=c2;else if(v<th.z)c=c3;else if(v<th.w)c=c4;else c=c5;
 vec3 N=normalize(vN),L=normalize(sunDir),V=normalize(cameraPosition-vW);float nl=dot(N,L),dif=max(nl,0.);
 float sh=1.;if(hasR>.5){float den=dot(L,rN3);if(abs(den)>1e-4){float t=dot(pc3-vW,rN3)/den;if(t>0.){float rr=length(vW+L*t-pc3);if(rr>rI3&&rr<rO3)sh=.45;}}}
 vec3 col=c*(sunCol*dif*sh+vec3(.035,.04,.06));
 if(sp>0.){vec3 H=normalize(L+V);col+=sunCol*pow(max(dot(N,H),0.),70.)*sp*.9*step(0.,nl)*sh;}
 col+=c*em*1.1;
 if(city>.5&&!w&&nl<.08){vec2 g=floor(vUv*vec2(900.,450.));float k=hs2(g);float lt=step(.985,k)*smoothstep(.08,-.15,nl);col+=vec3(1.,.72,.38)*lt*1.6;}
 gl_FragColor=vec4(col,1.);}`;
const PL4CFS=`uniform sampler2D tex;uniform vec3 sunDir,sunCol;uniform float tm,s1,s2,thr,bri;varying vec2 vUv;varying vec3 vN,vW;
void main(){float a=texture2D(tex,vec2(vUv.x+tm*s1,vUv.y)).g+texture2D(tex,vec2(vUv.x-tm*s2+.37,vUv.y)).g;if(a<thr)discard;
 vec3 N=normalize(vN),L=normalize(sunDir);float dif=max(dot(N,L),0.);gl_FragColor=vec4(vec3(a*bri)*(sunCol*dif+vec3(.03,.035,.05)),1.);}`;
const PL4AFS=`uniform vec3 a1,a2,sunDir,sunCol;uniform float al,am,ai,ae;varying vec2 vUv;varying vec3 vN,vW;
void main(){vec3 N=normalize(vN),V=normalize(cameraPosition-vW),L=normalize(sunDir);float f=pow(1.-max(dot(N,V),0.),am)*ai;float dif=max(dot(N,L),0.)*.92+.08;
 vec3 col=(a1+a2*f)*sunCol*dif;if(ae>.5)col+=a2*f;gl_FragColor=vec4(col,clamp(al+f*.15*ae,0.,1.));}`;
// ----- cuisson du bruit -----
function pl4Mat(P,seed,W){const r=rng(seed),U={NT:{value:P.n},FT:{value:P.ft},OCT:{value:P.o},LAC:{value:P.l},GAIN:{value:P.g},FQ:{value:P.f*P.sc},GAS:{value:P.gas?1:0},CF:{value:P.cl?1.7:0},NORM:{value:0},
 SEED:{value:new V3(r()*80,r()*80,r()*80)},SEED2:{value:new V3(r()*80,r()*80,r()*80)},MM:{value:new THREE.Vector4(0,1,0,1)}};return new THREE.ShaderMaterial({uniforms:U,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:PL4BAKE_FS,depthTest:false,depthWrite:false})}
function pl4Bake(P,seed,W,H){const m=pl4Mat(P,seed),q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),m),sc=new THREE.Scene();sc.add(q);const cam=new THREE.Camera(),old=R3.getRenderTarget(),oac=R3.autoClear;R3.autoClear=true;
 // 1) statistiques sur une petite image (Godot normalise la texture de bruit entre son minimum et son maximum)
 const sw=128,sh=64,st=new THREE.WebGLRenderTarget(sw,sh,{depthBuffer:false});R3.setRenderTarget(st);R3.render(sc,cam);const px=new Uint8Array(sw*sh*4);R3.readRenderTargetPixels(st,0,0,sw,sh,px);st.dispose();
 let a=1,b=0,c=1,d=0;for(let i=0;i<px.length;i+=4){const x=px[i]/255,y=px[i+1]/255;if(x<a)a=x;if(x>b)b=x;if(y<c)c=y;if(y>d)d=y}m.uniforms.MM.value.set(a,b,c,d);m.uniforms.NORM.value=1;
 // 2) texture finale
 const rt=new THREE.WebGLRenderTarget(W,H,{depthBuffer:false,wrapS:THREE.RepeatWrapping,minFilter:THREE.LinearMipmapLinearFilter,magFilter:THREE.LinearFilter,generateMipmaps:true});R3.setRenderTarget(rt);R3.render(sc,cam);
 R3.setRenderTarget(old);R3.autoClear=oac;q.geometry.dispose();m.dispose();rt.texture.anisotropy=DESK?8:2;return rt}
// ----- choix du préréglage + couleurs propres à chaque planète -----
function pl4Pre(p){const ty=ptype(p);return ty=='Géante gazeuse'?'gaseous':ty=='Volcanique'?'lava':ty=='Désertique'?'sand':ty=='Glacée'||ty=='Cristalline'?'ice':'terrestrial'}
function pl4Cols(P,p,key){const r=rng((seedOf(p.x,p.y,p.z,41)>>>0)%2147483646+1),ty=ptype(p),cs=P.c.map(c=>c.clone());let dh=(r()-.5)*.06;
 if(key=='gaseous')dh=((p.hue-35)/360);if(ty=='Cristalline')dh=((p.hue-205)/360);const hsl={};for(const c of cs){c.getHSL(hsl);c.setHSL((hsl.h+dh+1)%1,Math.min(1,hsl.s*(ty=='Cristalline'?1.3:1)),hsl.l)}
 const t=P.t.slice();if(ty=='Océanique'){t[0]+=.08;t[1]+=.08;t[2]+=.06;t[3]+=.04}if(pvar(p)=='archipel'){t[0]+=.12;t[1]+=.1;t[2]+=.08}return{cs,t}}
function pl4Apply(p,g){if(!g||!g.userData||g.userData.pl4)return;if(typeof wg4Is=='function'&&wg4Is(p))return;const ud=g.userData,U=ud.U||{},sph=ud.sph;if(!sph)return;const key=pl4Pre(p),P=PL4P[key],seed=(seedOf(p.x,p.y,p.z,17)>>>0)%2147483646+1;
 const W=DESK?2048:1024,rt=pl4Bake(P,seed,W,W/2),{cs,t}=pl4Cols(P,p,key),sunDir=U.sunDir||{value:new V3(0,1,0)},sunCol=U.sunCol||{value:new THREE.Color(1,1,1)};
 const BU={tex:{value:rt.texture},c1:{value:cs[0]},c2:{value:cs[1]},c3:{value:cs[2]},c4:{value:cs[3]},c5:{value:cs[4]},th:{value:new THREE.Vector4(...t)},r1:{value:P.r1||0},e1:{value:P.e1||0},
  city:U.city||{value:0},sunDir,sunCol,hasR:{value:U.rN3?1:0},rN3:U.rN3||{value:new V3(0,1,0)},pc3:U.pc3||{value:g.position.clone()},rI3:U.rI3||{value:0},rO3:U.rO3||{value:0}};
 const S={sph:sph.material,hide:[]},mat=new THREE.ShaderMaterial({uniforms:BU,vertexShader:PL4VS,fragmentShader:PL4FS});
 // sphères d'origine plus grandes que la planète (nuages, halo) : cachées
 for(const o of g.children)if(o!==sph&&o.isMesh&&o.geometry&&o.geometry.type=='SphereGeometry'&&o.geometry.parameters.radius>p.r*1.001){S.hide.push([o,o.visible]);o.visible=false}
 const add=[];if(P.cl){const cm=new THREE.ShaderMaterial({uniforms:{tex:BU.tex,sunDir,sunCol,tm:typeof TM!='undefined'?TM:{value:0},s1:{value:.00125},s2:{value:.00125*(1+P.cl.fl*1.2)},thr:{value:P.cl.th},bri:{value:P.cl.b}},vertexShader:PL4VS,fragmentShader:PL4CFS});
  const cl=new THREE.Mesh(new THREE.SphereGeometry(p.r*1.008,DESK?96:48,DESK?64:32),cm);cl.rotation.copy(sph.rotation);g.add(cl);add.push(cl);ud.pl4cl=cl}
 if(P.at){const A=P.at,a1=A.c1.clone(),a2=A.c2.clone();if(key=='gaseous'||ptype(p)=='Cristalline'){const h={};for(const c of[a1,a2]){c.getHSL(h);c.setHSL((h.h+(key=='gaseous'?(p.hue-35)/360:(p.hue-205)/360)+1)%1,h.s,h.l)}}
  const am=new THREE.ShaderMaterial({uniforms:{a1:{value:a1},a2:{value:a2},sunDir,sunCol,al:{value:A.a*.75},am:{value:A.am},ai:{value:A.i},ae:{value:A.em?1:0}},vertexShader:PL4VS,fragmentShader:PL4AFS,transparent:true,depthWrite:false});
  const at=new THREE.Mesh(new THREE.SphereGeometry(p.r*(key=='gaseous'?1.04:1.025),DESK?96:48,DESK?64:32),am);g.add(at);add.push(at)}
 // lunes : préréglage « sans atmosphère » (cratères cellulaires)
 const moons=[];for(const M of ud.moons||[]){const m=M.piv&&M.piv.children[0];if(!m||!m.geometry)continue;const R=m.geometry.parameters&&m.geometry.parameters.radius||p.r*.1,mr=pl4Bake(PL4P.noatm,seed+moons.length*7+3,512,256);
  const mm=new THREE.ShaderMaterial({uniforms:{tex:{value:mr.texture},c1:{value:PL4P.noatm.c[0]},c2:{value:PL4P.noatm.c[1]},c3:{value:PL4P.noatm.c[2]},c4:{value:PL4P.noatm.c[3]},c5:{value:PL4P.noatm.c[4]},th:{value:new THREE.Vector4(...PL4P.noatm.t)},r1:{value:0},e1:{value:0},city:{value:0},sunDir,sunCol,hasR:{value:0},rN3:{value:new V3()},pc3:{value:new V3()},rI3:{value:0},rO3:{value:0}},vertexShader:PL4VS,fragmentShader:PL4FS});
  moons.push({m,g0:m.geometry,m0:m.material,rt:mr});m.geometry=new THREE.SphereGeometry(R,32,16);m.material=mm}
 sph.material=mat;ud.pl4={S,add,rt,moons,mat};PL4.list.push(g)}
function pl4Revert(g){const ud=g.userData,s=ud&&ud.pl4;if(!s)return;ud.sph.material=s.S.sph;for(const[o,v]of s.S.hide)o.visible=v;for(const o of s.add){g.remove(o);o.geometry.dispose();o.material.dispose()}
 for(const M of s.moons){M.m.geometry.dispose();M.m.material.dispose();M.m.geometry=M.g0;M.m.material=M.m0;M.rt.dispose()}s.mat.dispose();s.rt.dispose();ud.pl4=null;ud.pl4cl=null}
// ----- branchements : planètes vues de l'espace (PC : buildPlanetGPU, mobile : buildPlanet), menu d'accueil compris -----
{const _bg4=buildPlanetGPU;buildPlanetGPU=function(p){const g=_bg4.apply(this,arguments);try{if(PL4.on)pl4Apply(p,g);g.userData.pl4p=p}catch(e){console.warn('pl4',e)}return g}}
{const _bp4=buildPlanet;buildPlanet=function(p,tx){const g=_bp4.apply(this,arguments);try{if(PL4.on)pl4Apply(p,g);g.userData.pl4p=p}catch(e){console.warn('pl4',e)}return g}}
// les nuages tournent avec la planète (game.js fait tourner sph et l'ancienne couche de nuages)
{let lt=performance.now();TICK.push(()=>{const n=performance.now(),dt=Math.min(.1,(n-lt)/1000);lt=n;if(typeof planets=='undefined')return;for(const p of planets){const u=p.mesh&&p.mesh.userData;if(u&&u.pl4cl&&u.sph)u.pl4cl.rotation.copy(u.sph.rotation)}})}
// ----- option -----
function pl4Toggle(){PL4.on=!PL4.on;try{localStorage.setItem('sf-pl4',PL4.on?'style':'real')}catch(e){}for(const p of(typeof planets!='undefined'?planets:[])){const g=p.mesh;if(!g)continue;try{if(PL4.on)pl4Apply(p,g);else pl4Revert(g)}catch(e){console.warn(e)}}pl4Btn();toast(PL4.on?'🪐 Planètes stylisées':'🪐 Planètes réalistes')}
function pl4Btn(){const b=$('pl4b');if(b)b.textContent=PL4.on?'Stylisées':'Réalistes'}
{const b=$('pl4b');if(b){b.onclick=pl4Toggle;pl4Btn()}}
