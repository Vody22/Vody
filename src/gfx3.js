// ===== GRAPHISMES 3 : planètes vues de l'espace (aurores, orages, ombre des anneaux, archipels / cristal / ruines), soleil (reflets d'objectif, rayons), boucliers à hexagones, ombres, traînées des réacteurs, canons qui chauffent =====
const G3={a:new V3(),b:new V3(),c:new V3(),d:new V3(),q:new QT(),col:new THREE.Color(),up:new V3(0,1,0)};

// ---------- PLANÈTES ----------
// ombre des anneaux projetée sur la planète (même calcul sur PC et mobile)
const P3RS=`vec3 o3=vW-pc3;float dn3=dot(sunDir,rN3),rs3=1.;if(abs(dn3)>.001){float t3=-dot(o3,rN3)/dn3;if(t3>0.){float rr3=length(o3+sunDir*t3),k3=(rr3-rI3)/(rO3-rI3);if(k3>0.&&k3<1.)rs3=1.-.6*smoothstep(0.,.06,k3)*smoothstep(1.,.88,k3)*(1.-.85*step(.585,k3)*step(k3,.64))*(.82+.18*sin(k3*90.));}}`;
const P3RD='uniform vec3 rN3,pc3;uniform float rI3,rO3;\n';
// anneaux : ombre de la planète sur les anneaux (mobile : même shader que sur PC)
const P3RING_VS='varying vec2 vUv;varying vec3 vW;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}';
const P3RING_FS='uniform sampler2D map;uniform vec3 sunDir,sunCol,pc;uniform float pr;varying vec2 vUv;varying vec3 vW;void main(){vec4 t=texture2D(map,vUv);vec3 o=vW-pc;float b=dot(o,sunDir);float sh=1.;if(b<0.){float d2=dot(o,o)-b*b;sh=smoothstep(pr*pr*.92,pr*pr*1.05,d2);}gl_FragColor=vec4(t.rgb*sunCol*(.08+.92*sh),t.a);}';
// aurores polaires : rideaux animés, visibles côté nuit
const AUR_VS='varying vec2 vUv;varying vec3 vW;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}';
const AUR_FS=`uniform float tm;uniform vec3 ca,cb,sunDir,pc3;varying vec2 vUv;varying vec3 vW;void main(){float x=vUv.x*6.2831853;float w=sin(x*6.+tm*.5+sin(x*2.-tm*.2)*1.5)*.5+.5,w2=sin(x*15.-tm*.9+sin(x*4.+tm*.35)*2.5)*.5+.5;float cur=pow(w*.65+w2*.35,2.2);float fold=.6+.4*sin(x*55.+sin(x*7.+tm*.6)*5.);float v=vUv.y;float a=smoothstep(0.,.12,v)*pow(1.-v,1.8)*cur*fold;vec3 n=normalize(vW-pc3);float nt=smoothstep(.3,-.25,dot(n,sunDir));gl_FragColor=vec4(mix(ca,cb,v*v)*a*nt*1.6,1.);}`;
const AURG=[];
function p3Patch(m,re,code,decl){const s=m.fragmentShader,i=s.lastIndexOf(re);if(i<0)return false;m.fragmentShader=decl+s.slice(0,i)+code+s.slice(i);m.needsUpdate=true;return true}
function p3Deco(p,g,gpu){const ud=g.userData,U=ud.U,sph=ud.sph;if(!U||!sph)return;const ty=ptype(p),pv=pvar(p),fin=gpu?'gl_FragColor=vec4(c,1.);}':'gl_FragColor=vec4(col,1.);}',cv=gpu?'c':'col';
const m=sph.material;let code='',decl='';
// anneaux
let ring=null;g.children.forEach(o=>{if(o.geometry&&o.geometry.type=='RingGeometry')ring=o});
if(ring){const rN=new V3(0,0,1).applyEuler(ring.rotation).normalize();U.rN3={value:rN};U.pc3={value:g.position.clone()};U.rI3={value:p.r*1.35};U.rO3={value:p.r*(gpu?2.3:2.2)};decl+=P3RD;code+=P3RS+cv+'*=rs3;';
if(!gpu&&ring.material.isMeshBasicMaterial){const mp=ring.material.map;ring.material.dispose();ring.material=new THREE.ShaderMaterial({uniforms:{map:{value:mp},sunDir:U.sunDir,sunCol:U.sunCol,pc:{value:g.position.clone()},pr:{value:p.r}},vertexShader:P3RING_VS,fragmentShader:P3RING_FS,transparent:true,side:THREE.DoubleSide,depthWrite:false})}}
// ruines : lumières cyan géométriques ; cristal : reflets scintillants
if(gpu&&pv=='ruines'){U.city.value=1;m.fragmentShader=m.fragmentShader.replace('vec3(1.,.66,.32)*ci','vec3(.3,.92,1.)*ci*1.35')}
if(pv=='cristal')code+=gpu?'{vec3 Hc=normalize(sunDir+V);float gq=pow(snoise(d*150.+seed)*.5+.5,14.)*term;c+=vec3(.9,.7,1.)*gq*(1.5+6.*pow(max(dot(G,Hc),0.),6.));}':'col+=vec3(.9,.7,1.)*pow(pvn(n*180.),12.)*max(d,0.)*3.;';
if(code)p3Patch(m,fin,code,decl);
// aurores
const k=hs((p.x|0)+1,(p.z|0)+2,31);if(ty!='Volcanique'&&ty!='Désertique'&&k<.65){const r=p.r;if(!AURG.length)AURG.push(new THREE.CylinderGeometry(r*.46/r,r*.424/r,r*.1/r,72,1,true));
const gas=ty=='Géante gazeuse',ca=gas?new THREE.Color(1,.35,.7):pv=='cristal'||ty=='Cristalline'?new THREE.Color(.9,.3,1):new THREE.Color(.2,1,.55),cb=gas?new THREE.Color(.4,.5,1):pv=='cristal'?new THREE.Color(.3,.9,1):new THREE.Color(.6,.3,1);
const am=new THREE.ShaderMaterial({uniforms:{tm:TM,ca:{value:ca},cb:{value:cb},sunDir:U.sunDir,pc3:{value:g.position.clone()}},vertexShader:AUR_VS,fragmentShader:AUR_FS,transparent:true,blending:ADDB,depthWrite:false,side:THREE.DoubleSide});
const au=[];for(const s of[1,-1]){const a=new THREE.Mesh(AURG[0],am);a.scale.setScalar(r*(gas?1.04:1));a.position.y=s*r*.955*(gas?1.03:1);if(s<0)a.rotation.x=Math.PI;a.frustumCulled=false;a.visible=false;sph.add(a);au.push(a)}ud.aur=au}
ud.storm=ty=='Jungle'||ty=='Océanique'||ty=='Géante gazeuse'}
{const _bp=buildPlanet;buildPlanet=function(p,tx){const g=_bp(p,tx);try{p3Deco(p,g,false)}catch(e){console.warn(e)}return g}}
{const _bg=buildPlanetGPU;buildPlanetGPU=function(p){const g=_bg(p);try{p3Deco(p,g,true)}catch(e){console.warn(e)}return g}}
// orages : éclairs dans les nuages côté nuit
const LT3={pool:[],init(){for(let i=0;i<3;i++){const mk=(tex,c)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:c,transparent:true,opacity:0,blending:ADDB,depthWrite:false}));s.visible=false;scene.add(s);return s};this.pool.push({a:mk(GLOW2,0xe4ecff),b:mk(GLOW,0x8fa8ff),t:9})}}};
function p3Tick(dt){const cp=camera.position;let best=null,bd=1e18;
for(const p of planets){if(!p.mesh)continue;const d=Math.hypot(p.x-cp.x,p.y-cp.y,p.z-cp.z),ud=p.mesh.userData;if(ud.aur){const v=d<p.r*7;ud.aur[0].visible=ud.aur[1].visible=v}if(ud.storm&&d<p.r*5&&d<bd){bd=d;best=p}}
if(!LT3.pool.length)LT3.init();
if(best&&Math.random()<dt*1.6){const L=LT3.pool.find(l=>l.t>.6);if(L){const sd=best.mesh.userData.U.sunDir.value,pc=G3.a.set(best.x,best.y,best.z),toC=G3.b.copy(cp).sub(pc).normalize();for(let i=0;i<8;i++){const n=G3.c.set(rv(1),rv(1),rv(1)).normalize();if(n.dot(sd)<-.08&&n.dot(toC)>.3){const gas=best.ring,R=best.r*(gas?1.005:1.016);L.a.position.copy(pc).addScaledVector(n,R);L.b.position.copy(L.a.position);L.t=0;L.s=best.r*(.04+Math.random()*.05)*(gas?1.6:1);L.d=.35+Math.random()*.25;L.a.visible=L.b.visible=true;break}}}}
for(const L of LT3.pool){if(L.t>L.d){if(L.a.visible){L.a.visible=L.b.visible=false}continue}L.t+=dt;const x=L.t,f=x<.05?1:x<.1?.15:x<.17?.85:x<.22?.3:Math.max(0,1-(x-.22)/(L.d-.22));L.a.material.opacity=f;L.b.material.opacity=f*.45;L.a.scale.setScalar(L.s*(.8+f*.4));L.b.scale.setScalar(L.s*4.5)}}

// ---------- SOLEIL : reflets d'objectif, éblouissement, rayons ----------
const FL3={v:0,f:0,x:0,y:0,cs:'255,240,210',ok:0,cache:{}};
{const mk=(w,h,draw)=>{const c=mkC(w,h),g=c.getContext('2d');draw(g,w,h);return c};
FL3.burst=mk(256,256,(g,w)=>{g.translate(w/2,w/2);g.globalCompositeOperation='lighter';for(let i=0;i<12;i++){const a=i/12*TAU+(i%2?.12:0),L=w/2*(i%3==0?1:i%2?.55:.75),gr=g.createLinearGradient(0,0,Math.cos(a)*L,Math.sin(a)*L);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.strokeStyle=gr;g.lineWidth=i%3==0?2.4:1.4;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*L,Math.sin(a)*L);g.stroke()}const r=g.createRadialGradient(0,0,0,0,0,w*.18);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(-w/2,-w/2,w,w)});
FL3.rays=mk(512,512,(g,w)=>{const r=rng(77);g.translate(w/2,w/2);for(let i=0;i<46;i++){const a=r()*TAU,da=.008+r()*.035,L=w/2*(.55+r()*.45),gr=g.createRadialGradient(0,0,0,0,0,L);const al=.08+r()*.22;gr.addColorStop(0,`rgba(255,255,255,${al})`);gr.addColorStop(.25,`rgba(255,255,255,${al*.8})`);gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.arc(0,0,L,a-da,a+da);g.closePath();g.fill()}});}
function fl3Tint(key,src,cs){const k=key+cs;if(FL3.cache[k])return FL3.cache[k];const c=mkC(src.width,src.height),g=c.getContext('2d');g.drawImage(src,0,0);g.globalCompositeOperation='source-in';g.fillStyle=`rgb(${cs})`;g.fillRect(0,0,c.width,c.height);FL3.cache[k]=c;return c}
function fl3Ghost(cs){const k='gh'+cs;if(FL3.cache[k])return FL3.cache[k];const c=mkC(128),g=c.getContext('2d');const poly=(r)=>{g.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU+.3;g.lineTo(64+Math.cos(a)*r,64+Math.sin(a)*r)}g.closePath()};const gr=g.createRadialGradient(64,64,0,64,64,60);gr.addColorStop(0,`rgba(${cs},.25)`);gr.addColorStop(.8,`rgba(${cs},.45)`);gr.addColorStop(1,`rgba(${cs},.1)`);poly(60);g.fillStyle=gr;g.fill();g.strokeStyle=`rgba(${cs},.7)`;g.lineWidth=2.5;poly(58);g.stroke();FL3.cache[k]=c;return c}
function fl3Streak(cs){const k='st'+cs;if(FL3.cache[k])return FL3.cache[k];const c=mkC(512,32),g=c.getContext('2d'),gr=g.createLinearGradient(0,0,512,0);gr.addColorStop(0,`rgba(${cs},0)`);gr.addColorStop(.5,`rgba(${cs},.9)`);gr.addColorStop(1,`rgba(${cs},0)`);g.fillStyle=gr;const gv=g.createLinearGradient(0,0,0,32);g.fillRect(0,13,512,6);g.globalCompositeOperation='destination-in';gv.addColorStop(0,'rgba(0,0,0,0)');gv.addColorStop(.5,'rgba(0,0,0,1)');gv.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gv;g.fillRect(0,0,512,32);FL3.cache[k]=c;return c}
function fl3Occ(o,sp,sr){// part visible du disque solaire (7 points)
const dir=G3.a.copy(sp).sub(o),L=dir.length();dir.divideScalar(L);const u=G3.b.copy(Math.abs(dir.y)<.9?G3.up:G3.c.set(1,0,0)).cross(dir).normalize(),w=G3.c.copy(dir).cross(u);let vis=0;
for(let i=0;i<7;i++){const a=i/6*TAU,k=i?sr*.8:0;const tx=sp.x+(u.x*Math.cos(a)+w.x*Math.sin(a))*k-o.x,ty=sp.y+(u.y*Math.cos(a)+w.y*Math.sin(a))*k-o.y,tz=sp.z+(u.z*Math.cos(a)+w.z*Math.sin(a))*k-o.z,tl=Math.hypot(tx,ty,tz),dx=tx/tl,dy=ty/tl,dz=tz/tl;
const hit=(cx,cy,cz,r)=>{const ox=cx-o.x,oy=cy-o.y,oz=cz-o.z,b=ox*dx+oy*dy+oz*dz;if(b<0||b>tl)return false;return ox*ox+oy*oy+oz*oz-b*b<r*r};let occ=false;
for(const p of planets)if(hit(p.x,p.y,p.z,p.r)){occ=true;break}
if(!occ)for(const A of asts)if(hit(A.pos.x,A.pos.y,A.pos.z,A.r*.85)){occ=true;break}
if(!occ)for(const s of stations)if(s.mesh&&hit(s.mesh.position.x,s.mesh.position.y,s.mesh.position.z,120)){occ=true;break}
if(!occ)vis++}return vis/7}
function fl3Target(){const o=camera.position;
if(mode=='space'){let best=null,bk=0;for(const s of suns){const d=Math.hypot(s.x-o.x,s.y-o.y,s.z-o.z),k=s.r/d;if(k>bk){bk=k;best=s}}if(!best)return null;const sp=proj(best);if(!sp.front)return null;const c=new THREE.Color(best.col).lerp(G3.col.set(0xffffff),.35);return{x:sp.x,y:sp.y,cs:`${c.r*255|0},${c.g*255|0},${c.b*255|0}`,vis:fl3Occ(o,G3.d.set(best.x,best.y,best.z),best.r),k:clamp(bk*12,.5,1.4)}}
if(mode=='surf'&&SURF.sunPos&&!(typeof DN!='undefined'&&DN.day<.3)){const s=SURF.sunPos,dir=G3.a.copy(s).sub(o).normalize();if(dir.y<.02)return null;const sp=proj(s);if(!sp.front)return null;let vis=1;if(SURF.height)for(const k of[15,45,100,180,300,460,700,1000]){const y=o.y+dir.y*k;if(SURF.height(o.x+dir.x*k,o.z+dir.z*k)>y){vis=0;break}}return{x:sp.x,y:sp.y,cs:'255,236,200',vis:vis*(DN&&DN.set>.3?.7:1),k:.9}}
return null}
function lensFlares3(){const W=innerWidth,H=innerHeight;let tg=null;try{tg=fl3Target()}catch(e){tg=null}
if(tg&&(tg.x<-W*.4||tg.x>W*1.4||tg.y<-H*.4||tg.y>H*1.4))tg=null;
const dt=DT||.016;FL3.v+=((tg?tg.vis:0)-FL3.v)*Math.min(1,dt*10);FL3.f+=((tg?tg.vis:0)-FL3.f)*Math.min(1,dt*5);if(tg){FL3.x=tg.x;FL3.y=tg.y;FL3.cs=tg.cs;FL3.k=tg.k}
if(FL3.v<.01)return;fl3Draw(W,H)}
// rendu en WebGL (addition pure : ne masque jamais la scène en dessous)
function fl3Init(){const sc=new THREE.Scene(),cam=new THREE.OrthographicCamera(0,1,0,-1,-10,10),geo=new THREE.PlaneGeometry(1,1),tx=c=>{const t=new THREE.CanvasTexture(c);return t};
const rad=(stops)=>{const c=mkC(128),g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);stops.forEach(([o,a])=>gr.addColorStop(o,`rgba(255,255,255,${a})`));g.fillStyle=gr;g.fillRect(0,0,128,128);return c};
const T={halo:tx(rad([[0,1],[.35,.36],[1,0]])),veil:tx(rad([[0,1],[.5,.45],[1,.2]])),burst:tx(FL3.burst),streak:tx(fl3Streak('255,255,255')),rays:tx(FL3.rays),ghost:tx(fl3Ghost('255,255,255'))};
const mk=(k)=>{const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:T[k],transparent:true,blending:ADDB,depthTest:false,depthWrite:false,opacity:0}));m.frustumCulled=false;sc.add(m);return m};
FL3.sc=sc;FL3.cam=cam;FL3.m={veil:mk('veil'),rays:mk('rays'),halo:mk('halo'),burst:mk('burst'),streak:mk('streak'),gh:[0,1,2,3,4,5,6].map(()=>mk('ghost'))}}
const FL3GH=[[.28,22,.5,0xffd7a0],[.46,10,.8,0xaad7ff],[.62,40,.3,0x96ffc8],[.8,16,.6,0xff96dc],[1.12,62,.22,0],[1.38,22,.5,0xc8c8ff],[1.75,100,.16,0xffc88c]].map(([a,b,c,d])=>[a,b,c,d?new THREE.Color(d):null]);
function fl3Draw(W,H){if(!FL3.sc)fl3Init();const M=FL3.m,cam=FL3.cam;if(cam.right!==W||cam.bottom!==-H){cam.right=W;cam.bottom=-H;cam.updateProjectionMatrix()}
const v=FL3.v,x=FL3.x,y=FL3.y,S0=Math.min(W,H)/700,cx=W/2,cy=H/2,vx=cx-x,vy=cy-y,edge=1-clamp(Math.hypot(vx,vy)/Math.hypot(W,H)*1.3,0,1),K=FL3.k||1,DB=FL3.dbg||0;
const col=G3.col.setRGB(...FL3.cs.split(',').map(n=>n/255));
const put=(m,px,py,w,h,rot,op,c)=>{m.position.set(px,-py,0);m.scale.set(w,h,1);m.rotation.z=rot||0;m.material.opacity=Math.max(0,op);m.material.color.copy(c||col);m.visible=op>.003};
put(M.halo,x,y,300*S0*K*(1+v*.4),300*S0*K*(1+v*.4),0,DB&1?0:.34*v*(DESK?.6:1));
const bs=430*S0*K;put(M.burst,x,y,bs,bs,-(x+y)*.0015,DB&2?0:.45*v);
put(M.streak,x,y,W*1.25*K,28*S0,0,DB&4?0:.38*v);
const part=4*FL3.f*(1-FL3.f),ra=(part*.75+.1*v)*(DESK?.6:1),RS=Math.max(W,H)*1.7;put(M.rays,x,y,RS,RS,-t*.015,DB&8?0:Math.min(.85,ra));
FL3GH.forEach(([f,r,a,c2],i)=>{const rr=r*S0*2.8;put(M.gh[i],x+vx*f,y+vy*f,rr,rr,0,DB&16?0:a*edge*v*.75,c2||col)});
const cen=1-clamp(Math.hypot(vx,vy)/(Math.min(W,H)*.5),0,1),VR=Math.hypot(W,H)*2.2;put(M.veil,x,y,VR,VR,0,DB&32?0:.17*cen*cen*v*(DESK?.6:1));
const ac=R3.autoClear;R3.autoClear=false;R3.render(FL3.sc,cam);R3.autoClear=ac}
lensFlares=lensFlares3;

// ---------- BOUCLIERS À HEXAGONES ----------
const SH3={h:[0,1,2,3].map(()=>new THREE.Vector4(0,0,1,0)),prev:0,armed:0,brk:0,rb:0,dmg:0,pos:0};
const SH3_VS='varying vec3 vP;varying vec3 vNV;void main(){vP=position;vNV=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
const SH3_FS=`uniform float op,lvl,brk,rb,tm;uniform vec3 col;uniform vec4 h0,h1,h2,h3;varying vec3 vP;varying vec3 vNV;
float hx(vec2 p,out vec2 id){vec2 s=vec2(1.,1.7320508);vec2 a=mod(p,s)-s*.5,b=mod(p-s*.5,s)-s*.5;vec2 g=dot(a,a)<dot(b,b)?a:b;id=floor((p-g)*4.+.5);g=abs(g);return .5-max(dot(g,s*.5),g.x);}
float r1(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float hit(vec4 h,vec3 n){if(h.w<=0.)return 0.;float a=acos(clamp(dot(n,h.xyz),-1.,1.));float wf=(1.-h.w)*1.9;return h.w*exp(-pow((a-wf)*6.,2.))*1.4+h.w*h.w*smoothstep(.5,0.,a)*2.4;}
void main(){vec3 n=normalize(vP);vec2 id;vec2 q=vec2(atan(n.z,n.x)/6.2831853*40.,asin(clamp(n.y,-1.,1.))/3.1415927*20.);float e=hx(q,id);float edge=smoothstep(.07,.0,e),cell=smoothstep(.0,.5,e);float rnd=r1(id);
float f=pow(1.-abs(vNV.z),2.2);float H=hit(h0,n)+hit(h1,n)+hit(h2,n)+hit(h3,n);float I=op*f*.5+H;float low=lvl<.3?(.55+.45*sin(tm*30.+rnd*20.)):1.;
vec3 c=col*(edge*(I*1.8+f*.035*step(.01,lvl))+I*.3*(1.-cell*.6))*low;
if(brk>0.){float sh=step(rnd,brk)*brk;vec3 hot=mix(col,vec3(1.,.75,.45),.6);c+=hot*(edge*2.6+.4*(1.-cell))*sh*(f*.7+.3)*(.6+.4*sin(tm*40.+rnd*30.));}
if(rb>0.){float y=(1.-rb)*2.3-1.15;float band=exp(-pow((n.y-y)*7.,2.));c+=col*band*(edge*1.6+.15)*rb*1.2;}
gl_FragColor=vec4(c,1.);}`;
function sh3Apply(root){const ud=root&&root.userData;if(!ud||!ud.shield||ud.shield.userData.h3)return;const old=ud.shield.material,col=old.uniforms&&old.uniforms.col?old.uniforms.col.value.clone():new THREE.Color(.35,.8,1);
ud.shield.material=new THREE.ShaderMaterial({uniforms:{op:{value:0},col:{value:col},lvl:{value:1},brk:{value:0},rb:{value:0},tm:TM,h0:{value:SH3.h[0]},h1:{value:SH3.h[1]},h2:{value:SH3.h[2]},h3:{value:SH3.h[3]}},vertexShader:SH3_VS,fragmentShader:SH3_FS,transparent:true,blending:ADDB,depthWrite:false});ud.shield.userData.h3=1;old.dispose()}
function sh3Hit(wp){const sh=ship.userData.shield;if(!sh)return;sh.updateMatrixWorld();const l=sh.worldToLocal(G3.d.copy(wp));if(l.lengthSq()<1e-6)l.set(0,0,-1);l.normalize();let k=SH3.h[0];for(const h of SH3.h)if(h.w<k.w)k=h;k.set(l.x,l.y,l.z,1);SH3.pos=1}
{const _if=impactFX;impactFX=function(p,col,k){_if(p,col,k);try{if(mode=='space'&&!FOOT.on&&p&&PM('sh')>0&&((S.sh||0)>0||SH3.prev>0)&&ship.position.distanceTo(p)<20)sh3Hit(p)}catch(e){}}}
{const _dm=damage;damage=function(n,kind){const b=S.sh||0;_dm(n,kind);if(b>0&&(S.sh||0)<b)SH3.dmg=1}}
function sh3Shatter(){const ud=ship.userData,c=ud.shield&&ud.shield.material.uniforms?ud.shield.material.uniforms.col.value:G3.col.set(.35,.8,1);for(let i=0;i<34;i++){const d=G3.a.set(rv(1),rv(1),rv(1)).normalize(),p=G3.b.copy(ship.position).addScaledVector(d,11);SPK.emit(p.x,p.y,p.z,S.vel.x+d.x*45,S.vel.y+d.y*45,S.vel.z+d.z*45,.5+Math.random()*.4,c.r,c.g,c.b,.96)}shake=Math.max(shake,.6);try{SFX.shield()}catch(e){}}
function sh3Tick(dt){const ms=PM('sh'),sh=S.sh||0;if(SH3.armed&&ms>0&&mode=='space'){if(SH3.prev>0&&sh<=0){SH3.brk=1;sh3Shatter()}if(SH3.prev<=0&&sh>0)SH3.rb=1}SH3.armed=1;SH3.prev=sh;
SH3.brk=Math.max(0,SH3.brk-dt*.9);SH3.rb=Math.max(0,SH3.rb-dt*1.1);for(const h of SH3.h)h.w=Math.max(0,h.w-dt*1.5);
if(SH3.dmg&&!SH3.pos&&mode=='space'){let tg=null,bd=1e9;for(const e of en){const ep=e.pos||(e.m&&e.m.position);if(!ep)continue;const d=ep.distanceTo(S.pos);if(d<bd){bd=d;tg=ep}}sh3Hit(tg&&bd<900?tg:G3.c.copy(S.pos).add(G3.a.set(rv(10),rv(10),rv(10))))}SH3.dmg=0;SH3.pos=0;
const ud=ship.userData;if(ud&&ud.shield&&ud.shield.userData.h3){const u=ud.shield.material.uniforms;u.lvl.value=ms>0?sh/ms:0;u.brk.value=SH3.brk;u.rb.value=SH3.rb}}

// ---------- OMBRES ----------
// PC : le soleil projette l'ombre du vaisseau sur les stations, les astéroïdes et sur lui-même
if(DESK){sunL.castShadow=true;sunL.shadow.mapSize.set(2048,2048);const c=sunL.shadow.camera;c.left=-110;c.right=110;c.top=110;c.bottom=-110;c.near=500;c.far=1500;sunL.shadow.bias=-.0006;sunL.shadow.normalBias=.6;c.updateProjectionMatrix()}
function sh3Cast(o,rec){if(!DESK)return;o.traverse(m=>{if(m.isMesh&&!(m.material&&(m.material.blending===ADDB||m.material.transparent))){m.castShadow=true;m.receiveShadow=rec}})}
{const _ls=loadSmall;loadSmall=function(c){_ls(c);if(!DESK)return;try{if(c.st&&c.st.mesh)sh3Cast(c.st.mesh,true);const e=SMALL.get(c.k);if(e)for(const A of e.list){A.mesh.castShadow=A.mesh.receiveShadow=true}}catch(e){}}}
for(const[k,e]of SMALL){if(e.c.st&&e.c.st.mesh)sh3Cast(e.c.st.mesh,true);for(const A of e.list)if(DESK)A.mesh.castShadow=A.mesh.receiveShadow=true}
// mobile : ombre douce sous le vaisseau et sous le pilote à pied
const BL3={};
function bl3Init(){const c=mkC(128),g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(0,0,0,.8)');gr.addColorStop(.45,'rgba(0,0,0,.5)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);const tex=new THREE.CanvasTexture(c),geo=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2);
const mk=()=>{const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,opacity:.6,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));m.renderOrder=2;m.frustumCulled=false;return m};BL3.ship=mk();BL3.foot=mk()}
function bl3Place(m,x,y,z,sx,sz,yaw,op){const sc=SURF.scene;if(m.parent!==sc)sc.add(m);let gy=SURF.height(x,z),wet=false;if(gy<0){gy=0;wet=true}const a=Math.max(0,y-gy),f=clamp(1-a/90,0,1);m.visible=f>.02;if(!m.visible)return;
const hx=SURF.height(x+2.5,z)-SURF.height(x-2.5,z),hz=SURF.height(x,z+2.5)-SURF.height(x,z-2.5),n=wet?G3.a.set(0,1,0):G3.a.set(-hx/5,1,-hz/5).normalize();m.quaternion.setFromUnitVectors(G3.up,n);G3.q.setFromAxisAngle(G3.up,yaw);m.quaternion.multiply(G3.q);
m.position.set(x,gy+.35,z);const k=1+a/60;m.scale.set(sx*k,1,sz*k);m.material.opacity=op*f*(wet?.5:1)}
function bl3Tick(){if(DESK)return;if(mode!='surf'){if(BL3.ship){BL3.ship.visible=BL3.foot.visible=false}return}if(!BL3.ship)bl3Init();
const e=G3.b.set(0,0,-1).applyQuaternion(ship.quaternion),yaw=Math.atan2(-e.x,-e.z),bs=ship.userData.body?ship.userData.body.scale.z||1:1;bl3Place(BL3.ship,ship.position.x,ship.position.y-2,ship.position.z,19*bs,17*bs,yaw,.62);
if(FOOT.on){const p=FOOT.model?FOOT.model.position:FOOT.pos;bl3Place(BL3.foot,p.x,p.y,p.z,2.4,2.4,0,.55)}else BL3.foot.visible=false}

// ---------- TRAÎNÉES DES RÉACTEURS (couleur selon le réacteur installé) ----------
const TR3={N:20,F:4,h:[[],[],[],[]],mesh:null};
function tr3Init(){const N=TR3.N,F=TR3.F,nv=F*N*2,geo=new THREE.BufferGeometry();TR3.pos=new Float32Array(nv*3);TR3.col=new Float32Array(nv*3);geo.setAttribute('position',new THREE.BufferAttribute(TR3.pos,3));geo.setAttribute('color',new THREE.BufferAttribute(TR3.col,3));
const idx=[];for(let f=0;f<F;f++)for(let j=0;j<N-1;j++){const a=(f*N+j)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}geo.setIndex(idx);TR3.geo=geo;
TR3.mesh=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,blending:ADDB,depthWrite:false,side:THREE.DoubleSide}));TR3.mesh.frustumCulled=false;scene.add(TR3.mesh)}
function tr3Col(){const e=typeof pid=='function'?pid('eng'):'std';return e!='std'&&PARTS.eng.o[e]&&PARTS.eng.o[e].col?PARTS.eng.o[e].col:(ship.userData.eC||0x50aaff)}
function tr3Tick(dt){if(!TR3.mesh)tr3Init();const ud=ship.userData,on=mode=='space'&&!S.docked&&!S.dead&&!FOOT.on&&ship.visible&&!(typeof ckActive=='function'&&ckActive())&&ud.flames;
TR3.mesh.visible=!!on;if(!on){for(const h of TR3.h)h.length=0;return}
const bo=isBoost()?1:0,life=bo?.6:.38,Lmax=bo?24:13,thr=clamp(S.thr,0,1),cp=camera.position;TR3.c=TR3.c||new THREE.Color();TR3.c.set(tr3Col());const cr=TR3.c.r,cg=TR3.c.g,cb=TR3.c.b,inten=clamp(thr*1.1+bo*.5,0,1.4);
ud.flames.slice(0,TR3.F).forEach((f,i)=>{const H=TR3.h[i];const p=f.gs.getWorldPosition(new V3());if(H.length&&H[0].p.distanceToSquared(p)<.16)H[0].p.copy(p);else H.unshift({p,t});
let L=0;for(let j=1;j<H.length;j++){L+=H[j].p.distanceTo(H[j-1].p);if(t-H[j].t>life||L>Lmax||j>=TR3.N){H.length=j+1;break}}});
const P=TR3.pos,C=TR3.col,N=TR3.N;for(let f=0;f<TR3.F;f++){const H=TR3.h[f];for(let j=0;j<N;j++){const o=((f*N+j)*2)*3;const q=H[Math.min(j,H.length-1)];if(!q||H.length<2||j>=H.length){const lp=q?q.p:ship.position;P[o]=P[o+3]=lp.x;P[o+1]=P[o+4]=lp.y;P[o+2]=P[o+5]=lp.z;C.fill(0,o,o+6);continue}
const pa=H[Math.max(0,j-1)].p,pb=H[Math.min(H.length-1,j+1)].p,tg=G3.a.copy(pa).sub(pb),vw=G3.b.copy(cp).sub(q.p),sd=G3.c.copy(tg).cross(vw);if(sd.lengthSq()<1e-8)sd.set(0,1,0);sd.normalize();
const u=j/(H.length-1),age=clamp(1-(t-q.t)/life,0,1),cd=q.p.distanceTo(cp),w=(.32+bo*.18)*Math.pow(1-u,.6)*(.6+thr*.5),a=Math.pow(1-u,1.4)*age*inten*.85*clamp((cd-6)/16,0,1);sd.multiplyScalar(w);
P[o]=q.p.x+sd.x;P[o+1]=q.p.y+sd.y;P[o+2]=q.p.z+sd.z;P[o+3]=q.p.x-sd.x;P[o+4]=q.p.y-sd.y;P[o+5]=q.p.z-sd.z;const wh=clamp(1-u*4,0,1)*.6;const r=(cr+(1-cr)*wh)*a,g=(cg+(1-cg)*wh)*a,b=(cb+(1-cb)*wh)*a;C[o]=C[o+3]=r;C[o+1]=C[o+4]=g;C[o+2]=C[o+5]=b}}
TR3.geo.attributes.position.needsUpdate=true;TR3.geo.attributes.color.needsUpdate=true}

// ---------- CANONS QUI CHAUFFENT ----------
const GH3={h:0,pf:0,last:-9,mat:null,lmat:null,sp:[],ls:[]};

function gh3Build(root){const ud=root.userData;if(!ud||!ud.muzzles)return;if(!GH3.mat){GH3.mat=new THREE.SpriteMaterial({map:GLOW,color:0xff5010,transparent:true,opacity:0,blending:ADDB,depthWrite:false});GH3.lmat=GH3.mat.clone()}
GH3.sp=ud.muzzles.map(m=>{const s=new THREE.Sprite(GH3.mat);s.position.set(m[0],m[1],m[2]+.6);s.scale.setScalar(1.6);root.add(s);return s});GH3.ls=(ud.lasers||[]).map(m=>{const s=new THREE.Sprite(GH3.lmat);s.position.set(m[0],m[1],m[2]+.4);s.scale.setScalar(1.6);root.add(s);return s})}
const GH3C=[new THREE.Color(0x3a0800),new THREE.Color(0xa01a04),new THREE.Color(0xff5a12),new THREE.Color(0xffd29a)];
function gh3Ramp(h,out){const x=clamp(h,0,1)*3,i=Math.min(2,x|0);return out.copy(GH3C[i]).lerp(GH3C[i+1],x-i)}
function gh3Tick(dt){if(fcd>GH3.pf+.02&&mode=='space'&&curW()!='laser'){GH3.h=Math.min(1,GH3.h+.06);GH3.last=t}GH3.pf=fcd;GH3.h=Math.max(0,GH3.h-dt*(t-GH3.last<.3?.06:.24));if(!GH3.mat)return;const h=GH3.h,lh=typeof LZ!='undefined'?LZ.heat||0:0;
gh3Ramp(h,GH3.mat.color);GH3.mat.opacity=Math.pow(h,1.4)*.95;for(const s of GH3.sp)s.scale.setScalar(1.3+h*2.4);
gh3Ramp(lh,GH3.lmat.color);GH3.lmat.opacity=Math.pow(lh,1.3)*.9;for(const s of GH3.ls)s.scale.setScalar(1.4+lh*2.6);
if(mode=='space'&&ship.visible&&!FOOT.on&&(h>.55||lh>.6)&&Math.random()<dt*14){const src=(h>.55?GH3.sp:GH3.ls),s=src[Math.random()*src.length|0];if(s){s.getWorldPosition(G3.a);const k=Math.max(h,lh);SPK.emit(G3.a.x,G3.a.y,G3.a.z,S.vel.x*.9+rv(3),S.vel.y*.9+3+rv(2),S.vel.z*.9+rv(3),.45,.32*k,.14*k,.06*k,.9)}}}

// ---------- reconstruction du vaisseau ----------
function g3Ship(root){try{sh3Apply(root);sh3Cast(root,true);gh3Build(root)}catch(e){console.warn(e)}}
{const _rs=rebuildShip;rebuildShip=function(){_rs();g3Ship(ship);for(const h of TR3.h)h.length=0}}
g3Ship(ship);
TICK.push(dt=>{try{if(mode=='space')p3Tick(dt)}catch(e){console.warn(e)}sh3Tick(dt);bl3Tick();tr3Tick(dt);gh3Tick(dt)});
