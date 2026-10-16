// ===== MONDES GÉNÉRÉS (wg4.js, après pl4.js) — portage du « WorldGeneratorFinal » de jgallant (licence MIT) =====
// Unity : cartes de relief / chaleur / humidité (bruit fractal sur la sphère), latitude → chaleur, relief → plus froid en altitude, eau → plus humide,
// rivières qui descendent jusqu'à la mer (humidifient leurs rives), table des biomes (Whittaker 6×6), couleurs + contour des biomes, deux couches de nuages.
// Ici : bruit cuit par la carte graphique (wg4Bake, même repère UV que SphereGeometry), relu, puis passes du générateur en JS (wg4Gen, mis en cache par planète).
// Vue de l'espace : planètes Jungle / Océanique / Désertique / Glacée (les autres gardent le style pl4). Au sol : le biome sous le point d'arrivée choisit le terrain
// (on change p.hue le temps du séjour, donc type, couleurs, végétation, eau et météo suivent ; remis en sortant).
const WG4={cache:new Map(),mode:'world'};try{const v=localStorage.getItem('sf-pl4');WG4.mode=v=='real'?'real':v=='style'?'style':'world'}catch(e){}
const WG4B=['Glace','Toundra','Prairie','Désert','Savane','Forêt tropicale','Forêt tempérée humide','Forêt boréale','Bois','Forêt saisonnière'];
// identifiants : 0 Ice,1 Tundra,2 Grassland,3 Desert,4 Savanna,5 TropicalRainforest,6 TemperateRainforest,7 BorealForest,8 Woodland,9 SeasonalForest
const WG4T=[[0,1,2,3,3,3],[0,1,2,3,3,3],[0,1,8,8,4,4],[0,1,7,8,4,4],[0,1,7,9,5,5],[0,1,7,6,5,5]];
const WG4C=[[255,255,255],[96,131,112],[164,225,99],[238,218,130],[177,209,110],[66,123,25],[29,73,40],[95,115,62],[139,175,90],[73,100,35]];
// teinte de surface par biome (choisit le type de sol du jeu : Désertique 25–70, Jungle 70–160, Océanique 160–250, Glacée 250–290)
const WG4H=[278,256,92,44,63,124,146,152,102,116];
function wg4Is(p){if(!p||p.ring||WG4.mode!='world'||window.WGOFF)return false;const ty=p.wg0!=null?wg4Ty0(p):ptype(p);return ty=='Jungle'||ty=='Océanique'||ty=='Désertique'||ty=='Glacée'}
function wg4Ty0(p){const h=p.hue;p.hue=p.wg0;const t=ptype(p);p.hue=h;return t}
const WG4_FS=PL4GL+`uniform vec3 SD;uniform float MODE;varying vec2 vUv;
float fb(vec3 p,int o){float s=0.,a=1.,w=0.;for(int i=0;i<8;i++){if(i>=o)break;s+=sn(p)*a;w+=a;a*=.5;p*=2.;}return s/w;}
float bl(vec3 p,int o){float s=0.,a=1.,w=0.;for(int i=0;i<8;i++){if(i>=o)break;s+=(abs(sn(p))*2.-1.)*a;w+=a;a*=.5;p*=2.;}return s/w;}
void main(){float ph=vUv.x*6.28318530718,th=(1.-vUv.y)*3.14159265359;vec3 d=vec3(-cos(ph)*sin(th),cos(th),sin(ph)*sin(th));
 if(MODE<.5)gl_FragColor=vec4(fb(d*1.25+SD,6)*.5+.5,fb(d*3.+SD*1.7,4)*.5+.5,fb(d*3.+SD*2.3+11.,4)*.5+.5,1.);
 else gl_FragColor=vec4(bl(d*1.55+SD,4)*.5+.5,bl(d*1.75+SD*1.3+5.,5)*.5+.5,0.,1.);}`;
function wg4Bake(seed,W,H,mode){const r=rng(seed),m=new THREE.ShaderMaterial({uniforms:{SD:{value:new V3(r()*90,r()*90,r()*90)},MODE:{value:mode},NT:{value:0},FT:{value:1},OCT:{value:1},LAC:{value:2},GAIN:{value:.5}},
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:WG4_FS,depthTest:false,depthWrite:false}),q=new THREE.Mesh(new THREE.PlaneGeometry(2,2),m),sc=new THREE.Scene();sc.add(q);
 const rt=new THREE.WebGLRenderTarget(W,H,{depthBuffer:false}),old=R3.getRenderTarget();R3.setRenderTarget(rt);R3.render(sc,new THREE.Camera());const px=new Uint8Array(W*H*4);R3.readRenderTargetPixels(rt,0,0,W,H,px);R3.setRenderTarget(old);rt.dispose();q.geometry.dispose();m.dispose();return px}
// ----- le générateur -----
function wg4Gen(p){const key=p.name||(p.x+','+p.z);if(WG4.cache.has(key))return WG4.cache.get(key);
 const W=DESK?1024:512,H=W/2,N=W*H,ty=p.wg0!=null?wg4Ty0(p):ptype(p),seed=(seedOf(p.x,p.y,p.z,53)>>>0)%2147483646+1,rr=rng(seed+9),A=wg4Bake(seed,W,H,0),C=wg4Bake(seed+1,W,H,1);
 const hv=new Float32Array(N),ht=new Float32Array(N),mo=new Float32Array(N),T=new Uint8Array(N),riv=new Uint8Array(N);
 // seuils (Unity : eau profonde .2, peu profonde .4, sable .5, herbe .7, forêt .8, roche .9) ; plus de mer sur les planètes océaniques, moins sur les déserts
 const TH=ty=='Océanique'?[.3,.56,.62,.77,.86,.93]:ty=='Désertique'?[.12,.24,.36,.66,.78,.9]:[.2,.4,.5,.7,.8,.9];
 let a=1e9,b=-1e9;for(let i=0;i<N;i++){const v=A[i*4]/255;hv[i]=v;if(v<a)a=v;if(v>b)b=v}for(let i=0;i<N;i++)hv[i]=(hv[i]-a)/Math.max(1e-4,b-a);
 const tyOf=v=>v<TH[0]?0:v<TH[1]?1:v<TH[2]?2:v<TH[3]?3:v<TH[4]?4:v<TH[5]?5:6;for(let i=0;i<N;i++)T[i]=tyOf(hv[i]);
 // chaleur : bruit + latitude (équateur chaud, pôles froids) − altitude
 // comme Unity : minimum et maximum pris sur le bruit brut, AVANT d'ajouter la latitude, l'altitude et l'eau (les pôles passent sous 0, l'équateur au-dessus de 1, la mer sature l'humidité)
 let ha=1e9,hb=-1e9,ma=1e9,mb=-1e9;for(let i=0;i<N;i++){const h=A[i*4+1]/255*2-1,m=A[i*4+2]/255*2-1;if(h<ha)ha=h;if(h>hb)hb=h;if(m<ma)ma=m;if(m>mb)mb=m}
 for(let y=0;y<H;y++){const lat=Math.abs(Math.asin(Math.cos((1-(y+.5)/H)*Math.PI)))*180/Math.PI;for(let x=0;x<W;x++){const i=y*W+x,t=T[i],hh=hv[i];let v=(A[i*4+1]/255*2-1)+1-2*lat/90;
  v+=t==4?-.1*hh:t==5?-.25*hh:t==6?-.4*hh:.01*hh;ht[i]=(v-ha)/Math.max(1e-4,hb-ha);let m=A[i*4+2]/255*2-1;m+=t==0?8*hh:t==1?3*hh:t==2?.2*hh:0;mo[i]=Math.min(1,(m-ma)/Math.max(1e-4,mb-ma))}}
 if(ty=='Glacée')for(let i=0;i<N;i++)ht[i]=ht[i]*.32-.06;if(ty=='Désertique')for(let i=0;i<N;i++){ht[i]=Math.min(1,ht[i]*.75+.3);mo[i]*=.45}if(ty=='Jungle')for(let i=0;i<N;i++)mo[i]=Math.min(1,mo[i]*1.08+.04);
 // rivières : depuis un point haut, on descend vers le voisin le plus bas jusqu'à la mer
 const nb=(i,k)=>{const x=i%W,y=(i/W)|0;return k==0?y*W+(x+W-1)%W:k==1?y*W+(x+1)%W:k==2?(y>0?i-W:-1):(y<H-1?i+W:-1)},sc=W/512,Lmin=Math.round(20*sc);let made=0;
 for(let at=0;at<1000&&made<(ty=='Désertique'?14:40);at++){const s=(rr()*N)|0;if(T[s]<2||riv[s]||hv[s]<.6)continue;const path=[s],seen=new Set([s]);let cur=s,ok=false;
  for(let k=0;k<1400;k++){let best=-1,bv=1e9;for(let q=0;q<4;q++){const n=nb(cur,q);if(n<0||seen.has(n))continue;const v=T[n]<2?-1:riv[n]?hv[n]-.02:hv[n];if(v<bv){bv=v;best=n}}if(best<0)break;cur=best;seen.add(cur);if(T[cur]<2||riv[cur]){ok=true;break}path.push(cur)}
  if(!ok||path.length<Lmin)continue;made++;path.forEach((i,k)=>{const w=k>path.length*.55?2:1;riv[i]=1;const r1=nb(i,1);if(r1>=0&&T[r1]>=2)riv[r1]=1;if(w>1){const d1=nb(i,2);if(d1>=0&&T[d1]>=2)riv[d1]=1}})}
 // les rivières humidifient leurs rives
 const R=Math.round(12*sc);for(let i=0;i<N;i++){if(!riv[i])continue;const x0=i%W,y0=(i/W)|0;for(let dy=-R;dy<=R;dy+=2){const y=y0+dy;if(y<0||y>=H)continue;for(let dx=-R;dx<=R;dx+=2){const d=Math.hypot(dx,dy);if(d<1||d>R)continue;const j=y*W+(x0+dx+W)%W;mo[j]=Math.min(1,mo[j]+.025/d*2)}}}
 // biomes
 const ht6=v=>v<.05?0:v<.18?1:v<.4?2:v<.6?3:v<.8?4:5,mo6=v=>v<.27?0:v<.4?1:v<.6?2:v<.8?3:v<.9?4:5,bio=new Uint8Array(N);for(let i=0;i<N;i++)bio[i]=WG4T[mo6(mo[i])][ht6(ht[i])];
 // couleurs (TextureGenerator.GetBiomeMapTexture) : biomes, mer profonde / peu profonde, rivières selon le froid, banquise, contour des biomes ; alpha = eau (1) ou relief (0–0,5)
 const px=new Uint8Array(N*4),lerp3=(c1,c2,k)=>[c1[0]+(c2[0]-c1[0])*k,c1[1]+(c2[1]-c1[1])*k,c1[2]+(c2[2]-c1[2])*k],DEEP=[15,30,80],SHAL=[22,58,118],ICEW=[210,255,252],COLDW=[119,156,213],RIVW=[65,110,179];
 for(let i=0;i<N;i++){let c,al;const t=T[i],h=ht[i];
  if(t<2){c=t==0?lerp3(DEEP,SHAL,Math.max(0,hv[i]/TH[0]-.5)):lerp3(SHAL,[30,78,140],(hv[i]-TH[0])/(TH[1]-TH[0]));al=255;if(h<.05){c=ICEW;al=60}else if(h<.1)c=lerp3(COLDW,c,(h-.05)/.05)}
  else if(riv[i]){c=h<.05?lerp3(ICEW,COLDW,h/.05):h<.18?lerp3(COLDW,RIVW,(h-.05)/.13):h<.4?lerp3(RIVW,SHAL,(h-.18)/.22):SHAL;al=255}
  else{c=WG4C[bio[i]].slice();const shade=.82+.36*(hv[i]-TH[1])/(1-TH[1]);c=c.map(v=>v*shade);let edge=false;for(let q=0;q<4;q++){const n=nb(i,q);if(n>=0&&(bio[n]!==bio[i]||T[n]<2))edge=true}if(edge)c=c.map(v=>v*.65);al=Math.round(hv[i]*127)}
  px[i*4]=Math.min(255,c[0]);px[i*4+1]=Math.min(255,c[1]);px[i*4+2]=Math.min(255,c[2]);px[i*4+3]=al}
 // nuages (Unity : couche 1 au-dessus de .45, couche 2 au-dessus de .5)
 let c1a=1e9,c1b=-1e9,c2a=1e9,c2b=-1e9;for(let i=0;i<N;i++){const u=C[i*4],v=C[i*4+1];if(u<c1a)c1a=u;if(u>c1b)c1b=u;if(v<c2a)c2a=v;if(v>c2b)c2b=v}
 const cl=new Uint8Array(N*4);for(let i=0;i<N;i++){const u=(C[i*4]-c1a)/Math.max(1,c1b-c1a),v=(C[i*4+1]-c2a)/Math.max(1,c2b-c2a);cl[i*4]=u>.45?Math.round(u*255):0;cl[i*4+1]=v>.5?Math.round(v*255):0;cl[i*4+3]=255}
 const mk=(d)=>{const t=new THREE.DataTexture(d,W,H,THREE.RGBAFormat);t.wrapS=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=DESK?8:2;t.needsUpdate=true;return t};
 const out={W,H,ty,hv,T,bio,riv,tex:mk(px),ctex:mk(cl),made};WG4.cache.set(key,out);return out}
// biome au point (u,v) de la carte
function wg4At(G,u,v){const x=Math.min(G.W-1,Math.max(0,(((u%1)+1)%1)*G.W|0)),y=Math.min(G.H-1,Math.max(0,v*G.H|0)),i=y*G.W+x;return{water:G.T[i]<2,river:!!G.riv[i],bio:G.bio[i],h:G.hv[i]}}
// ----- vue de l'espace -----
const WG4_PFS=`uniform sampler2D tex;uniform vec3 sunDir,sunCol,rN3,pc3;uniform float city,hasR,rI3,rO3,BK;varying vec2 vUv;varying vec3 vN,vW;
float hs2(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
vec3 pnrm(vec3 sp,vec3 sn,float hh){vec3 sx=dFdx(sp),sy=dFdy(sp),r1=cross(sy,sn),r2=cross(sn,sx);float det=dot(sx,r1);vec2 dh=vec2(dFdx(hh),dFdy(hh))*BK;vec3 g=sign(det)*(dh.x*r1+dh.y*r2);return normalize(abs(det)*sn-g);}
void main(){vec4 t=texture2D(tex,vUv);vec3 c=t.rgb;bool w=t.a>.7;float hh=w?0.:t.a*2.;vec3 N=normalize(vN);if(!w)N=pnrm(vW,N,hh);
 vec3 L=normalize(sunDir),V=normalize(cameraPosition-vW);float nl=dot(N,L),dif=max(nl,0.);
 float sh=1.;if(hasR>.5){float den=dot(L,rN3);if(abs(den)>1e-4){float tt=dot(pc3-vW,rN3)/den;if(tt>0.){float r=length(vW+L*tt-pc3);if(r>rI3&&r<rO3)sh=.45;}}}
 vec3 col=c*(sunCol*dif*sh+vec3(.03,.035,.05));if(w&&t.a>.9){vec3 Hh=normalize(L+V);col+=sunCol*pow(max(dot(normalize(vN),Hh),0.),80.)*.8*step(0.,nl)*sh;}
 if(city>.5&&!w){float nl0=dot(normalize(vN),L);if(nl0<.08){vec2 g=floor(vUv*vec2(1100.,550.));col+=vec3(1.,.72,.38)*step(.986,hs2(g))*smoothstep(.08,-.15,nl0)*1.6;}}
 gl_FragColor=vec4(col,1.);}`;
const WG4_CFS=`uniform sampler2D tex;uniform vec3 sunDir,sunCol;uniform float ch;varying vec2 vUv;varying vec3 vN,vW;
void main(){vec4 t=texture2D(tex,vUv);float a=ch<.5?t.r:t.g;if(a<.02)discard;vec3 N=normalize(vN),L=normalize(sunDir);float dif=max(dot(N,L),0.);gl_FragColor=vec4(vec3(1.)*(sunCol*dif+vec3(.04,.045,.06)),a*.6);}`;
function wg4Apply(p,g){if(!g||!g.userData||g.userData.wg4)return;const ud=g.userData,U=ud.U||{},sph=ud.sph;if(!sph)return;const G=wg4Gen(p),sunDir=U.sunDir||{value:new V3(0,1,0)},sunCol=U.sunCol||{value:new THREE.Color(1,1,1)};
 const S={sph:sph.material,hide:[]},add=[];for(const o of g.children)if(o!==sph&&o.isMesh&&o.geometry&&o.geometry.type=='SphereGeometry'&&o.geometry.parameters.radius>p.r*1.001){S.hide.push([o,o.visible]);o.visible=false}
 const mat=new THREE.ShaderMaterial({uniforms:{tex:{value:G.tex},sunDir,sunCol,city:U.city||{value:0},hasR:{value:U.rN3?1:0},rN3:U.rN3||{value:new V3(0,1,0)},pc3:U.pc3||{value:g.position.clone()},rI3:U.rI3||{value:0},rO3:U.rO3||{value:0},BK:{value:p.r*.035}},
  vertexShader:PL4VS,fragmentShader:WG4_PFS,extensions:{derivatives:true}});
 const cls=[];for(const[ch,k]of[[0,1.009],[1,1.016]]){const cm=new THREE.ShaderMaterial({uniforms:{tex:{value:G.ctex},sunDir,sunCol,ch:{value:ch}},vertexShader:PL4VS,fragmentShader:WG4_CFS,transparent:true,depthWrite:false});
  const m=new THREE.Mesh(new THREE.SphereGeometry(p.r*k,DESK?96:48,DESK?64:32),cm);m.rotation.copy(sph.rotation);g.add(m);add.push(m);cls.push(m)}
 const P=PL4P[G.ty=='Glacée'?'ice':G.ty=='Désertique'?'sand':'terrestrial'].at;const am=new THREE.ShaderMaterial({uniforms:{a1:{value:P.c1.clone()},a2:{value:P.c2.clone()},sunDir,sunCol,al:{value:P.a*.4},am:{value:P.am},ai:{value:P.i},ae:{value:0}},vertexShader:PL4VS,fragmentShader:PL4AFS,transparent:true,depthWrite:false});
 const at=new THREE.Mesh(new THREE.SphereGeometry(p.r*1.03,DESK?96:48,DESK?64:32),am);g.add(at);add.push(at);sph.material=mat;ud.wg4={S,add,mat,cls};ud.wg4p=p}
function wg4Revert(g){const ud=g.userData,s=ud&&ud.wg4;if(!s)return;ud.sph.material=s.S.sph;for(const[o,v]of s.S.hide)o.visible=v;for(const o of s.add){g.remove(o);o.geometry.dispose();o.material.dispose()}s.mat.dispose();ud.wg4=null}
{const _bgW=buildPlanetGPU;buildPlanetGPU=function(p){const g=_bgW.apply(this,arguments);try{if(wg4Is(p))wg4Apply(p,g)}catch(e){console.warn('wg4',e)}return g}}
{const _bpW=buildPlanet;buildPlanet=function(p,tx){const g=_bpW.apply(this,arguments);try{if(wg4Is(p))wg4Apply(p,g)}catch(e){console.warn('wg4',e)}return g}}
// nuages : la couche basse tourne avec la planète, la haute un peu plus vite (comme les deux sphères d'atmosphère de Unity)
{let lt=performance.now();TICK.push(()=>{const n=performance.now(),dt=Math.min(.1,(n-lt)/1000);lt=n;if(typeof planets=='undefined'||mode!='space')return;for(const p of planets){const u=p.mesh&&p.mesh.userData;if(!u||!u.wg4||!u.sph)continue;const[c1,c2]=u.wg4.cls;c1.rotation.copy(u.sph.rotation);c2.rotation.x=u.sph.rotation.x;c2.rotation.z=u.sph.rotation.z;c2.rotation.y+=dt*.006}})}
// ----- au sol : le biome sous le point d'arrivée -----
const _wg4v=new V3();
{const _st=startEntry;startEntry=function(p){try{if(p&&wg4Is(p)&&!S.entry){const sph=p.mesh&&p.mesh.userData&&p.mesh.userData.sph;_wg4v.copy(S.pos);if(sph){sph.updateMatrixWorld(true);sph.worldToLocal(_wg4v)}else _wg4v.sub(new V3(p.x,p.y,p.z));_wg4v.normalize();
  const th=Math.acos(clamp(_wg4v.y,-1,1)),ph=Math.atan2(_wg4v.z,-_wg4v.x),u=((ph/TAU)%1+1)%1,v=1-th/Math.PI;GX('wgL',{})[p.name]={u,v}}}catch(e){console.warn(e)}return _st.apply(this,arguments)}}
function wg4Land(p){const L=GX('wgL',{})[p.name];if(L)return L;const r=rng((seedOf(p.x,p.y,p.z,61)>>>0)%2147483646+1);return{u:r(),v:.3+r()*.4}}
{const _seW=SURF.enter;SURF.enter=function(p,entry){let info=null;try{if(p&&p.wg0!=null){p.hue=p.wg0;delete p.wg0}if(wg4Is(p)){const G=wg4Gen(p),L=wg4Land(p),B=wg4At(G,L.u,L.v);info=B;p.wg0=p.hue;p.hue=B.water?205:WG4H[B.bio]}}catch(e){console.warn('wg4 sol',e)}
 _seW.apply(this,arguments);if(info)try{const lat=Math.round((wg4Land(p).v-.5)*180);setTimeout(()=>{try{toast('🌍 '+(info.water?'Côte et océan':WG4B[info.bio])+' — latitude '+Math.abs(lat)+'° '+(lat>=0?'N':'S'))}catch(e){}},2500)}catch(e){}}}
// en quittant la planète, on rend sa vraie teinte
TICK.push(()=>{if(typeof planets=='undefined'||mode=='surf')return;for(const p of planets)if(p.wg0!=null){p.hue=p.wg0;delete p.wg0}if(typeof landP!='undefined'&&landP&&landP.wg0!=null&&mode!='surf'){landP.hue=landP.wg0;delete landP.wg0}});
// ----- option « Planètes » : Mondes générés / Stylisées / Réalistes -----
function wg4Refresh(){for(const p of(typeof planets!='undefined'?planets:[])){const g=p.mesh;if(!g)continue;try{wg4Revert(g);pl4Revert(g);if(wg4Is(p))wg4Apply(p,g);else if(PL4.on)pl4Apply(p,g)}catch(e){console.warn(e)}}}
pl4Toggle=function(){WG4.mode=WG4.mode=='world'?'style':WG4.mode=='style'?'real':'world';PL4.on=WG4.mode!='real';try{localStorage.setItem('sf-pl4',WG4.mode)}catch(e){}wg4Refresh();pl4Btn();toast('🪐 Planètes : '+{world:'mondes générés',style:'stylisées',real:'réalistes'}[WG4.mode])};
pl4Btn=function(){const b=$('pl4b');if(b)b.textContent={world:'Mondes générés',style:'Stylisées',real:'Réalistes'}[WG4.mode]};
{const b=$('pl4b');if(b){b.onclick=pl4Toggle;pl4Btn()}}
// planètes déjà construites avant ce module (aucune en principe, mais par sécurité)
setTimeout(()=>{try{wg4Refresh()}catch(e){}},50);
