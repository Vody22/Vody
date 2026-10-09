// ===== PLANÈTES 2 : rochers, végétation propre à chaque planète, eau et lave réalistes, petits détails autour du joueur =====
// ----- outils : fusion de géométries (couleur par sommet) -----
function mergeG(parts){let n=0;const P=[];for(const p of parts){const g=p.g.index?p.g.toNonIndexed():p.g.clone();if(p.m)g.applyMatrix4(p.m);if(!g.attributes.normal)g.computeVertexNormals();P.push([g,p.c]);n+=g.attributes.position.count}
const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3);let o=0;
for(const[g,c]of P){const k=g.attributes.position.count;pos.set(g.attributes.position.array,o*3);nor.set(g.attributes.normal.array,o*3);for(let i=0;i<k;i++){col[(o+i)*3]=c?c[0]:1;col[(o+i)*3+1]=c?c[1]:1;col[(o+i)*3+2]=c?c[2]:1}o+=k;g.dispose()}
const G2=new THREE.BufferGeometry();G2.setAttribute('position',new THREE.BufferAttribute(pos,3));G2.setAttribute('normal',new THREE.BufferAttribute(nor,3));G2.setAttribute('color',new THREE.BufferAttribute(col,3));return G2}
const M4=(x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=sx,sz=sx)=>new THREE.Matrix4().compose(new V3(x,y,z),new QT().setFromEuler(new THREE.Euler(rx,ry,rz)),new V3(sx,sy,sz));
const C01=(h,s,l)=>{const c=hsl(h,s,l);return[c[0]/255,c[1]/255,c[2]/255]};
// ----- rochers bosselés (3 formes) -----
const ROCKG=[0,1,2].map(v=>{const g=new THREE.IcosahedronGeometry(1,DESK?2:1),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=.7+fbm3(x*1.7+v*5,y*1.7+v,z*1.7,v+11,3)*.6;p.setXYZ(i,x*k*(1+v*.18),y*k*(.62+v*.08),z*k*(1-v*.08))}g.computeVertexNormals();return g});
// ----- modèles de végétation -----
const FLORA={};
function floraGeo(k){if(FLORA[k])return FLORA[k];const L=[],cyl=(r1,r2,h,s=7)=>new THREE.CylinderGeometry(r2,r1,h,s).translate(0,h/2,0);let g;
if(k=='cactus'){const gr=C01(105,.35,.3),gr2=C01(110,.3,.24),pk=C01(330,.7,.65);L.push({g:capG(.55,.48,6,10),c:gr});
L.push({g:capG(.32,.3,2.2,8),m:M4(.95,2.4,0,0,0,0),c:gr2},{g:cyl(.32,.32,1.1,8),m:M4(0,2.6,0,0,0,-Math.PI/2),c:gr2});
L.push({g:capG(.28,.26,1.8,8),m:M4(-.85,3.3,0),c:gr},{g:cyl(.28,.28,1,8),m:M4(0,3.5,0,0,0,Math.PI/2),c:gr});
for(let i=0;i<3;i++)L.push({g:new THREE.SphereGeometry(.16,6,5),m:M4(Math.cos(i*2.1)*.25,6,Math.sin(i*2.1)*.25),c:pk});g=mergeG(L)}
else if(k=='bush'){const b=C01(30,.35,.32),b2=C01(38,.4,.42);for(let i=0;i<9;i++){const a=i/9*TAU,t=.5+(i%3)*.25;L.push({g:new THREE.ConeGeometry(.08,1.6+t,4).translate(0,(1.6+t)/2,0),m:M4(0,0,0,Math.cos(a)*.7,0,Math.sin(a)*.7),c:i%2?b:b2})}L.push({g:new THREE.IcosahedronGeometry(.45,0),m:M4(0,.3,0,0,0,0,1,.6,1),c:b});g=mergeG(L)}
else if(k=='skel'){const bn=C01(40,.18,.82),bn2=C01(38,.15,.7);L.push({g:cyl(.5,.42,22,8),m:M4(0,4,-11,Math.PI/2,0,0),c:bn2});
for(let i=0;i<8;i++){const s=1-Math.abs(i-3.5)/6;L.push({g:new THREE.TorusGeometry(5*s+1.5,.32,6,14,Math.PI*1.15),m:M4(0,4,-8+i*2.2,0,0,Math.PI*-.075,1,1.15,1),c:bn})}
L.push({g:new THREE.SphereGeometry(2.4,10,8),m:M4(0,3.4,-12.5,0,0,0,1,.8,1.4),c:bn},{g:new THREE.ConeGeometry(.35,3.5,6),m:M4(1.4,4.6,-13.6,-1.1,0,-.4),c:bn2},{g:new THREE.ConeGeometry(.35,3.5,6),m:M4(-1.4,4.6,-13.6,-1.1,0,.4),c:bn2});g=mergeG(L)}
else if(k=='dead'){const d=C01(20,.12,.09),d2=C01(15,.1,.14);L.push({g:cyl(.55,.18,8,7),c:d});for(let i=0;i<4;i++){const a=i*1.7,h=3.5+i*1.1;L.push({g:cyl(.18,.05,3-i*.4,5),m:M4(Math.cos(a)*.15,h,Math.sin(a)*.15,Math.sin(a)*.9,0,-Math.cos(a)*.9),c:i%2?d:d2})}g=mergeG(L)}
else if(k=='obsid'){const o=C01(260,.25,.07);L.push({g:new THREE.ConeGeometry(1,1,5).translate(0,.5,0),c:o});L.push({g:new THREE.ConeGeometry(.5,.6,5).translate(0,.3,0),m:M4(.9,0,.3,0,0,-.4),c:o});g=mergeG(L)}
else if(k=='pine'){const tr=C01(25,.35,.2),gn=C01(160,.3,.2),sn=C01(205,.25,.93);L.push({g:cyl(.35,.25,2.4,6),c:tr});for(let i=0;i<4;i++){const s=1.9-i*.38,y=1.6+i*1.5;L.push({g:new THREE.ConeGeometry(s,2.4,8).translate(0,1.2,0),m:M4(0,y,0),c:gn},{g:new THREE.ConeGeometry(s*.86,1.2,8).translate(0,.6,0),m:M4(0,y+1.15,0),c:sn})}g=mergeG(L)}
else if(k=='shroom'){const st=C01(45,.25,.82),cp=C01(285,.55,.45),dt=C01(60,.5,.92);L.push({g:capG(.6,.45,6.5,10),c:st});L.push({g:new THREE.SphereGeometry(3.2,16,8,0,TAU,0,Math.PI/2),m:M4(0,6,0,0,0,0,1,.55,1),c:cp});
for(let i=0;i<9;i++){const a=i*2.4,r=.8+(i%3)*.75;L.push({g:new THREE.SphereGeometry(.28,6,5),m:M4(Math.cos(a)*r,6+Math.sqrt(Math.max(0,1-(r/3.2)**2))*1.7,Math.sin(a)*r),c:dt})}g=mergeG(L)}
else if(k=='gills'){g=new THREE.RingGeometry(.6,3.1,18,1).rotateX(Math.PI/2).translate(0,5.95,0)}
else if(k=='palm'){const tk=C01(30,.35,.32),tk2=C01(30,.3,.24),lf=C01(115,.5,.28),lf2=C01(105,.45,.36),co=C01(30,.5,.22);let x=0,y=0,a=0;
for(let i=0;i<7;i++){const h=1.35;L.push({g:cyl(.36-i*.025,.34-i*.025,h,7),m:M4(x,y,0,0,0,-a),c:i%2?tk:tk2});x+=Math.sin(a)*h;y+=Math.cos(a)*h;a+=.055}
for(let i=0;i<8;i++){const ang=i/8*TAU,f=new THREE.PlaneGeometry(1.1,5,1,6),p=f.attributes.position;for(let j=0;j<p.count;j++){const yy=p.getY(j)+2.5,w=Math.sin(yy/5*Math.PI)*1.0;p.setX(j,p.getX(j)*w);p.setZ(j,-((yy/5)**2)*2.2);p.setY(j,yy)}f.computeVertexNormals();f.rotateX(-Math.PI/2+.35);L.push({g:f,m:M4(x,y,0,0,ang,0),c:i%2?lf:lf2})}
for(let i=0;i<3;i++)L.push({g:new THREE.SphereGeometry(.26,6,5),m:M4(x+Math.cos(i*2.1)*.35,y-.35,Math.sin(i*2.1)*.35),c:co});g=mergeG(L)}
else if(k=='flower'){const st=C01(150,.45,.3),pt=C01(300,.6,.6);L.push({g:cyl(.07,.05,2.2,5),c:st});for(let i=0;i<5;i++){const a=i/5*TAU;L.push({g:new THREE.ConeGeometry(.28,1.1,4).translate(0,.55,0),m:M4(Math.cos(a)*.18,2.1,Math.sin(a)*.18,Math.sin(a)*1.1,0,-Math.cos(a)*1.1,1,1,.35),c:pt})}
for(let i=0;i<3;i++){const a=i*2.1;L.push({g:new THREE.ConeGeometry(.22,.9,4).translate(0,.45,0),m:M4(0,.2,0,Math.sin(a)*1.2,0,-Math.cos(a)*1.2,1,1,.3),c:st})}g=mergeG(L)}
else if(k=='fern'){const c1=C01(120,.45,.26),c2=C01(110,.5,.34);for(let i=0;i<6;i++){const f=new THREE.PlaneGeometry(.35,1.6,1,4),p=f.attributes.position;for(let j=0;j<p.count;j++){const yy=p.getY(j)+.8,w=Math.sin(yy/1.6*Math.PI);p.setX(j,p.getX(j)*w);p.setZ(j,-((yy/1.6)**2)*.7);p.setY(j,yy)}f.computeVertexNormals();f.rotateX(-.5);L.push({g:f,m:M4(0,0,0,0,i/6*TAU,0),c:i%2?c1:c2})}g=mergeG(L)}
else if(k=='pebble'){g=ROCKG[1]}
return FLORA[k]=g}
// ----- végétation et décors de toute la planète (appelé par SURF.enter) -----
function addFlora(sc,ty,hu,h,r,spot,inst,HALF){const VM=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,metalness:0,flatShading:true}),VS=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,metalness:0,side:THREE.DoubleSide}),q=DESK?1:.6,cc=(h2,s,l)=>new THREE.Color().setHSL(((h2%360)+360)%360/360,s,l);
const place=(n,minH=4,maxH=1e9,lim=HALF*.88)=>{const L=[];for(let i=0;i<n;i++){const p=spot(40,lim);if(p.y<minH||p.y>maxH)continue;L.push(p)}return L};
const std=(s0,s1,tint)=>(d,o)=>{d.position.set(o.x,o.y-.2,o.z);d.rotation.set(rv(.06),o.a,rv(.06));d.scale.setScalar(o.s)};
const mk=(list,s0,s1,cf)=>list.map(p=>({x:p.x,y:p.y,z:p.z,s:s0+r()*(s1-s0),a:r()*TAU,c:cf()}));
if(ty=='Désertique'){inst(floraGeo('cactus'),VM,mk(place(320*q,6),.8,1.7,()=>cc(rv(18),.3,.75+r()*.25)),std());
inst(floraGeo('bush'),VM,mk(place(420*q,4),.6,1.5,()=>cc(rv(15),.2,.7+r()*.3)),std());
inst(floraGeo('skel'),VM,mk(place(3,6,1e9,HALF*.7),.9,1.3,()=>new THREE.Color(1,1,1)),std())}
else if(ty=='Volcanique'){inst(floraGeo('dead'),VM,mk(place(260*q,4),.7,1.4,()=>new THREE.Color(1,1,1)),std());
const OM=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.15,metalness:.6,emissive:0xff3a08,emissiveIntensity:.25,flatShading:true});
inst(floraGeo('obsid'),OM,place(80*q,3).map(p=>({x:p.x,y:p.y,z:p.z,s:1,a:r()*TAU,l:4+r()*12,w:.8+r()*1.6,c:new THREE.Color(1,1,1)})),(d,o)=>{d.position.set(o.x,o.y-.5,o.z);d.rotation.set(rv(.25),o.a,rv(.25));d.scale.set(o.w,o.l,o.w)})}
else if(ty=='Glacée'){inst(floraGeo('pine'),VM,mk(place(380*q,6,160),.8,1.8,()=>cc(rv(10),.1,.75+r()*.25)),std())}
else if(ty=='Jungle'){const sh=mk(place(90*q,5),.7,1.5,()=>cc(r()*360,.6,.75));inst(floraGeo('shroom'),VM,sh.map(o=>({...o,c:cc(hu+120+rv(40),.5,.85)})),std());
GLOWM.gills=GLOWM.gills||new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide});inst(floraGeo('gills'),GLOWM.gills,sh.map(o=>({...o,c:cc(hu+150+rv(50),.9,.55)})),std());SURF_GLOW.push(...sh.map(o=>({p:new V3(o.x,o.y+6*o.s,o.z),c:cc(hu+150,.9,.6),s:o.s*9})))}
else if(ty=='Océanique'){inst(floraGeo('palm'),VS,mk(place(190*q,2.5,34),.8,1.35,()=>cc(rv(12),.25,.8+r()*.2)),std())}
else if(ty=='Cristalline'){const fl=mk(place(260*q,4),.8,1.6,()=>cc(hu+rv(60),.5,.85));inst(floraGeo('flower'),VS,fl,std());
GLOWM.bulb=GLOWM.bulb||new THREE.MeshBasicMaterial({color:0xffffff});inst(new THREE.SphereGeometry(.32,8,6).translate(0,2.35,0),GLOWM.bulb,fl.map(o=>({...o,c:cc(hu+180+rv(40),.9,.65)})),std())}
// gros rochers en amas (toutes les planètes)
const rc=ty=='Glacée'?[205,.12,.72]:ty=='Volcanique'?[15,.1,.1]:ty=='Désertique'?[28,.3,.42]:[hu,.12,.32],cl=[];
for(let i=0;i<(DESK?55:30);i++){const p=spot(60,HALF*.88);const n=2+r()*4|0;for(let j=0;j<n;j++){const x=p.x+rv(9),z=p.z+rv(9),s=j?1+r()*2.5:3+r()*5;cl.push({x,z,y:h(x,z),s,a:r()*TAU,v:j%3,c:cc(rc[0]+rv(8),rc[1],rc[2]*(.8+r()*.4))})}}
for(let v=0;v<3;v++)inst(ROCKG[v],new THREE.MeshStandardMaterial({roughness:.95,metalness:0,flatShading:true}),cl.filter(o=>o.v==v),(d,o)=>{d.position.set(o.x,o.y+o.s*.15,o.z);d.rotation.set(o.a*.3,o.a,o.a*.2);d.scale.set(o.s*1.2,o.s,o.s)})}
const GLOWM={},SURF_GLOW=[];
// ----- eau et lave : carte des hauteurs pour l'écume du rivage et la profondeur -----
function hmapTex(h,HALF){const N=DESK?256:160,d=new Uint8Array(N*N*4);for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=-HALF+(i+.5)/N*HALF*2,z=-HALF+(j+.5)/N*HALF*2,v=clamp((h(x,z)+30)/60,0,1)*255,k=(j*N+i)*4;d[k]=d[k+1]=d[k+2]=v;d[k+3]=255}
const t=new THREE.DataTexture(d,N,N,THREE.RGBAFormat);t.magFilter=t.minFilter=THREE.LinearFilter;t.needsUpdate=true;return t}
const LIQ_VS='varying vec3 vW;varying float vD;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vec4 mv=viewMatrix*w;vD=-mv.z;gl_Position=projectionMatrix*mv;}';
const WATER_FS=NOISE_GLSL+`uniform float tm,fogNear,fogFar,hf;uniform vec3 deep,shallow,sunDir,sunCol,sky,fogColor,amb;uniform sampler2D hm;varying vec3 vW;varying float vD;
void main(){vec2 p=vW.xz,uv=(p+hf)/(2.*hf);float ins=step(0.,uv.x)*step(uv.x,1.)*step(0.,uv.y)*step(uv.y,1.);float hh=texture2D(hm,clamp(uv,0.,1.)).r*60.-30.;float dep=mix(30.,max(0.,-hh),ins);
vec2 g=vec2(.6,.8)*cos(dot(p,vec2(.6,.8))*.08+tm*1.3)*.5+vec2(-.7,.3)*cos(dot(p,vec2(-.7,.3))*.13+tm*1.7)*.35+vec2(.2,-.9)*cos(dot(p,vec2(.2,-.9))*.21+tm*2.1)*.22+vec2(.9,-.2)*cos(dot(p,vec2(.9,-.2))*.37+tm*2.9)*.12;
#ifdef HQ
{vec3 q=vec3(p*.045,tm*.45);float e=.08;g+=vec2(snoise(q+vec3(e,0.,0.))-snoise(q-vec3(e,0.,0.)),snoise(q+vec3(0.,e,0.))-snoise(q-vec3(0.,e,0.)))*2.2;vec3 q2=vec3(p*.16,tm*.9);g+=vec2(snoise(q2+vec3(e,0.,0.))-snoise(q2-vec3(e,0.,0.)),snoise(q2+vec3(0.,e,0.))-snoise(q2-vec3(0.,e,0.)))*.9;}
#endif
vec3 N=normalize(vec3(-g.x*.45,1.,-g.y*.45)),V=normalize(cameraPosition-vW);float fr=.03+.97*pow(1.-max(dot(N,V),0.),5.);
vec3 lit=amb+sunCol*max(sunDir.y,0.)*.8;vec3 wc=mix(shallow*1.3,deep,smoothstep(.5,16.,dep))*lit;vec3 col=mix(wc,sky,fr*.75);
vec3 H=normalize(sunDir+V);float nh=max(dot(N,H),0.);col+=sunCol*(pow(nh,260.)*2.6+pow(nh,26.)*.1);
float band=sin(dep*3.4-tm*2.3+g.x*2.5)*.5+.5;float foam=(1.-smoothstep(0.,2.6,dep))*(.45+.55*band)+(1.-smoothstep(0.,.6,dep))*.6;foam=clamp(foam,0.,1.)*ins;
col=mix(col,vec3(.93,.96,1.)*max(lit,vec3(.3))*1.1,foam*.85);float a=mix(.45,.93,smoothstep(0.,7.,dep));a=max(a,foam*.9);
float f=smoothstep(fogNear,fogFar,vD);gl_FragColor=vec4(mix(col,fogColor,f),mix(a,1.,f));}`;
const LAVA_FS=`uniform float tm,fogNear,fogFar,hf;uniform vec3 fogColor;uniform sampler2D hm,lc,lt;varying vec3 vW;varying float vD;
void main(){vec2 p=vW.xz,uv=(p+hf)/(2.*hf);float hh=texture2D(hm,clamp(uv,0.,1.)).r*60.-30.;float dep=max(0.,-hh);
vec4 c1=texture2D(lc,p*.018+vec2(tm*.004,tm*.003)),c2=texture2D(lc,p*.043-vec2(tm*.006,-tm*.005));vec3 hb=texture2D(lt,p*.005+vec2(tm*.002,tm*.001)).rgb;
float msk=smoothstep(.3,.8,texture2D(lc,p*.0037+vec2(.3,.7)).g),molten=smoothstep(.55,.9,hb.g)*(.4+.6*msk),crack=pow(max(c1.r,c2.r*.8),1.8)*(.2+.8*msk),glow=max(crack,molten);glow*=mix(.3,1.,smoothstep(0.,5.,dep));
vec3 hot=mix(vec3(1.,.22,.02),vec3(1.,.78,.35),glow*glow)*(1.2+.3*sin(tm*1.6+p.x*.03+p.y*.02));vec3 crust=vec3(.06,.03,.024)*(.7+.6*c1.g);vec3 col=mix(crust,hot,glow);
float f=smoothstep(fogNear,fogFar,vD);gl_FragColor=vec4(mix(col,fogColor,f*.8),1.);}`;
// texture de croûte de lave : plaques sombres séparées par des fissures brillantes (Voronoï répété)
const LAVAC=(()=>{const N=128,c=mkC(N),g=c.getContext('2d'),im=g.createImageData(N,N),d=im.data,r=rng(4242),pts=[];for(let i=0;i<34;i++)pts.push([r()*N,r()*N,r()]);
for(let y=0;y<N;y++)for(let x=0;x<N;x++){let f1=1e9,f2=1e9,id=0;for(const[px,py,v]of pts)for(let ox=-N;ox<=N;ox+=N)for(let oy=-N;oy<=N;oy+=N){const dd=(x-px-ox)**2+(y-py-oy)**2;if(dd<f1){f2=f1;f1=dd;id=v}else if(dd<f2)f2=dd}
const e=Math.sqrt(f2)-Math.sqrt(f1),k=(y*N+x)*4;d[k]=255*Math.max(0,1-e/3.2)**1.6;d[k+1]=255*id;d[k+2]=0;d[k+3]=255}g.putImageData(im,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t})();
function liquidMat(ty,hu,h,HALF){const hm=hmapTex(h,HALF),base={tm:TM,hm:{value:hm},hf:{value:HALF},fogColor:{value:new THREE.Color()},fogNear:{value:200},fogFar:{value:1900},sunDir:{value:new V3(.4,.75,.3).normalize()},sunCol:{value:new THREE.Color(1,.95,.85)},sky:{value:new THREE.Color()}};
if(ty=='Volcanique'){return new THREE.ShaderMaterial({uniforms:{...base,lc:{value:LAVAC},lt:{value:SURF.LAVA}},vertexShader:LIQ_VS,fragmentShader:LAVA_FS})}
const dc=ty=='Océanique'?0x0a3260:ty=='Jungle'?0x0c3530:new THREE.Color().setHSL(((hu+25)%360)/360,.42,.15).getHex(),scc=ty=='Océanique'?0x2aa8b8:ty=='Jungle'?0x3a8a70:new THREE.Color().setHSL(((hu+40)%360)/360,.42,.38).getHex();
return new THREE.ShaderMaterial({transparent:true,defines:DESK?{HQ:''}:{},uniforms:{...base,deep:{value:new THREE.Color(dc)},shallow:{value:new THREE.Color(scc)},amb:{value:new THREE.Color(.55,.6,.66)}},vertexShader:LIQ_VS,fragmentShader:WATER_FS})}
// ----- petits détails autour du joueur (cailloux, fougères, éclats…) -----
let NEAR=null;
function initNear(sc,h,ty,hu){NEAR=null;const step=DESK?2.6:4,R=DESK?90:60,n=Math.ceil(Math.PI*(R/step)**2*1.05),sets=[];
const add=(geo,mat,dens,s0,s1,col,yo=0,minH=1)=>{const m=new THREE.InstancedMesh(geo,mat,n);m.setColorAt(0,new THREE.Color());m.count=0;m.frustumCulled=false;m.castShadow=false;m.receiveShadow=DESK;sc.add(m);sets.push({m,dens,s0,s1,col,yo,minH})};
const rockC=ty=='Glacée'?[205,.12,.75]:ty=='Volcanique'?[15,.1,.12]:ty=='Désertique'?[30,.3,.45]:ty=='Océanique'?[35,.12,.42]:[hu,.12,.35];
add(ROCKG[1],new THREE.MeshStandardMaterial({roughness:.95,metalness:0,flatShading:true}),.28,.12,.55,rockC,-.05,-50);
if(ty=='Jungle'||ty=='Océanique')add(floraGeo('fern'),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,side:THREE.DoubleSide}),.22,.7,1.6,null,0,2);
if(ty=='Volcanique')add(ROCKG[2],new THREE.MeshBasicMaterial({color:0xffffff}),.05,.08,.22,[18,1,.55],0,-50);
if(ty=='Cristalline'||ty=='Glacée')add(new THREE.OctahedronGeometry(.5,0).translate(0,.3,0),new THREE.MeshStandardMaterial({roughness:.1,metalness:.3,emissive:ty=='Glacée'?0x203040:0x301a50}),.12,.3,1,ty=='Glacée'?[200,.4,.85]:[hu+60,.6,.7],0,0);
NEAR={sets,h,step,R,ck:''}}
const _nd=new THREE.Object3D(),_nc=new THREE.Color();
function updNear(){if(!NEAR||mode!='surf')return;const N2=NEAR,cp=camera.position,cx=Math.round(cp.x/(N2.step*5)),cz=Math.round(cp.z/(N2.step*5)),k=cx+','+cz;if(k==N2.ck)return;N2.ck=k;const ox=cx*N2.step*5,oz=cz*N2.step*5,R=N2.R,st=N2.step;
N2.sets.forEach((S2,si)=>{let i=0;const m=S2.m,max=m.instanceMatrix.count;for(let gx=Math.floor((ox-R)/st);gx<=Math.ceil((ox+R)/st);gx++)for(let gz=Math.floor((oz-R)/st);gz<=Math.ceil((oz+R)/st);gz++){if(i>=max)break;
if(h3(gx,gz,si,61)>S2.dens)continue;const x=(gx+h3(gx,gz,si,62))*st,z=(gz+h3(gx,gz,si,63))*st;if((x-ox)**2+(z-oz)**2>R*R)continue;const y=N2.h(x,z);if(y<S2.minH)continue;
const v=h3(gx,gz,si,64),s=S2.s0+v*(S2.s1-S2.s0);_nd.position.set(x,y+S2.yo*s,z);_nd.rotation.set(v*.6,v*20,0);_nd.scale.set(s*(1+v*.4),s,s);_nd.updateMatrix();m.setMatrixAt(i,_nd.matrix);const c=S2.col;if(c)_nc.setHSL((((c[0]+(v-.5)*20)%360)+360)%360/360,c[1],c[2]*(.8+v*.4));else _nc.setRGB(1,1,1);m.setColorAt(i,_nc);i++}
m.count=i;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true})}
const _ud=updDetail;updDetail=function(){_ud();updNear()};
// ----- braises au-dessus de la lave, lueur des champignons -----
const _p2T=SURF.tick;SURF.tick=function(dt,F){if(_p2T)_p2T(dt,F);if(!F)return;const cp=camera.position;
if(F.ty=='Volcanique'){for(let i=0;i<(DESK?3:1);i++){const x=cp.x+rv(160),z=cp.z+rv(160);if(F.h(x,z)<-1&&Math.random()<.7){SPK.emit(x,1,z,rv(2),6+Math.random()*10,rv(2),1.2+Math.random(),1,.45+Math.random()*.3,.08,.85);if(Math.random()<.15)FIRE.emit(x,.5,z,rv(1),3+Math.random()*3,rv(1),.9,.5,.18,.03,.6)}}}};
const _p2E=SURF.onEnter;SURF.onEnter=function(F,sc){_p2E(F,sc);for(const g of SURF_GLOW){const s=sprite(g.c.getHex(),g.s,.35);s.position.copy(g.p);sc.add(s)}SURF_GLOW.length=0};
