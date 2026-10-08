// ===== DÉTAILS : sol texturé, herbe, traînées, poussière, étalonnage =====
// ----- sol : détail procédural dans le shader du terrain -----
const TTYPE={Volcanique:0,Désertique:1,Jungle:2,Océanique:3,Glacée:4,Cristalline:5};
function detailTerrain(mat,ty){const tt=TTYPE[ty]??2,hq=DESK?1:0;
mat.onBeforeCompile=sh=>{sh.uniforms.ttype={value:tt};sh.uniforms.tm=TM;
sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying vec3 vWN;').replace('#include <begin_vertex>','#include <begin_vertex>\nvWP=(modelMatrix*vec4(transformed,1.)).xyz;vWN=normalize(mat3(modelMatrix)*objectNormal);');
sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying vec3 vWN;uniform float ttype;uniform float tm;\n'+NOISE_GLSL+`
float dH(vec2 p){return snoise(vec3(p*.09,1.3))*.6+snoise(vec3(p*.37,7.1))*.3+snoise(vec3(p*1.4,3.3))*.12;}`)
.replace('#include <color_fragment>',`#include <color_fragment>
float camD=length(cameraPosition-vWP),near=1.-smoothstep(120.,900.,camD);vec3 wp=vWP;float slope=1.-clamp(vWN.y,0.,1.);
float n1=snoise(wp*.012),n2=snoise(wp*.06),n3=snoise(wp*.31);
vec3 dc=diffuseColor.rgb;
if(ttype<.5){dc*=.85+.2*n1+.12*n2*near;float cr=smoothstep(.55,.72,snoise(wp*.045))*near;dc=mix(dc,vec3(.9,.25,.04),cr*.55*(1.-slope));}
else if(ttype<1.5){float rip=sin(wp.x*.55+wp.z*.25+n2*3.)*.5+.5;dc*=.88+.14*n1+.1*rip*near*(1.-slope);}
else if(ttype<3.5){float pch=smoothstep(-.2,.6,n1);dc*=.78+.3*pch+.14*n2*near;dc=mix(dc,dc*vec3(1.12,1.05,.75),smoothstep(.3,.8,n2)*.4*(1.-slope));}
else if(ttype<4.5){dc*=.93+.07*n1+.05*n2*near;}
else{dc*=.86+.18*n1+.1*n2*near;dc+=vec3(.25,.18,.4)*smoothstep(.75,.9,n3)*near*.6;}
float strata=sin(wp.y*.32+n1*7.+n2*2.5)*.5+.5;dc=mix(dc,dc*(.86+.2*strata)*(.9+.2*n3),smoothstep(.35,.65,slope)*(ttype>3.5&&ttype<4.5?.4:1.));
dc*=.94+.1*n3*near;diffuseColor.rgb=dc;`)
.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
${hq?`{float fade=1.-smoothstep(80.,700.,length(cameraPosition-vWP));if(fade>.01){float e=.6;vec2 p=vWP.xz;float h0=dH(p),hx=dH(p+vec2(e,0.)),hz=dH(p+vec2(0.,e));vec3 nW=normalize(vWN-vec3(hx-h0,0.,hz-h0)*(ttype>3.5&&ttype<4.5?1.2:2.4)*fade);normal=normalize((viewMatrix*vec4(nW,0.)).xyz);}}`:''}`)
.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
if(ttype>3.5&&ttype<4.5)roughnessFactor=.45+.3*n2;`)};
mat.customProgramCacheKey=()=>'terr'+tt+hq;mat.needsUpdate=true}
// ----- herbe animée autour de la caméra -----
let GRASS=null;
function bladeGeo(){const pos=[],nrm=[],uv=[];for(let k=0;k<3;k++){const a=k/3*Math.PI,c=Math.cos(a),s=Math.sin(a),w=.16,bend=.25;
const P=[[-w,0,0],[w,0,0],[0,1,bend]],q=P.map(([x,y,z])=>[x*c-z*s,y,x*s+z*c]);for(const v of q){pos.push(...v);nrm.push(0,1,0)}uv.push(0,0,1,0,.5,1);
const q2=[[-w*.8,0,0],[w*.8,0,0],[0,.75,-bend]].map(([x,y,z])=>[x*c-z*s+.15,y,x*s+z*c+.1]);for(const v of q2){pos.push(...v);nrm.push(0,1,0)}uv.push(0,0,1,0,.5,1)}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nrm,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return g}
const BLADE=bladeGeo();
function initGrass(sc,h,ty,hu){GRASS=null;if(!(ty=='Jungle'||ty=='Océanique'||ty=='Désertique'||ty=='Cristalline'))return;
const step=DESK?3.6:6.5,R=DESK?170:110,n=Math.ceil(Math.PI*(R/step)**2*1.05);
const mat=new THREE.MeshStandardMaterial({roughness:.9,side:THREE.DoubleSide,vertexColors:false});
mat.onBeforeCompile=sh=>{sh.uniforms.tm=TM;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float tm;').replace('#include <begin_vertex>',`#include <begin_vertex>
#ifdef USE_INSTANCING
vec3 ip=vec3(instanceMatrix[3][0],instanceMatrix[3][1],instanceMatrix[3][2]);float sway=sin(tm*1.9+ip.x*.08+ip.z*.05)*.5+sin(tm*3.3+ip.x*.3)*.18;transformed.x+=sway*uv.y*uv.y*.55;transformed.z+=sway*uv.y*uv.y*.25;
#endif`);sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb*=.5+.7*vUv.y;').replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\nnormal=normalize((viewMatrix*vec4(0.,1.,0.,0.)).xyz);')};
mat.defines={USE_UV:''};mat.customProgramCacheKey=()=>'grass';
const m=new THREE.InstancedMesh(BLADE,mat,n);m.setColorAt(0,new THREE.Color(1,1,1));m.count=0;m.frustumCulled=false;m.receiveShadow=DESK;sc.add(m);
const base=ty=='Désertique'?[38,.35,.42]:ty=='Cristalline'?[hu+60,.55,.55]:ty=='Océanique'?[95,.45,.3]:[hu,.5,.28];
GRASS={m,h,step,R,ty,base,ck:''};}
const _gd=new THREE.Object3D(),_gc=new THREE.Color();
function updGrass(){if(!GRASS)return;const G2=GRASS,cp=camera.position,cx=Math.round(cp.x/(G2.step*6)),cz=Math.round(cp.z/(G2.step*6)),k=cx+','+cz;if(k==G2.ck)return;G2.ck=k;
const ox=cx*G2.step*6,oz=cz*G2.step*6,R=G2.R,st=G2.step;let i=0;const m=G2.m,max=m.instanceMatrix.count;
for(let gx=Math.floor((ox-R)/st);gx<=Math.ceil((ox+R)/st);gx++)for(let gz=Math.floor((oz-R)/st);gz<=Math.ceil((oz+R)/st);gz++){if(i>=max)break;
const jx=h3(gx,gz,0,41),jz=h3(gx,gz,0,42),x=(gx+jx)*st,z=(gz+jz)*st;if((x-ox)**2+(z-oz)**2>R*R)continue;const y=G2.h(x,z);if(y<3)continue;
const sl=Math.abs(G2.h(x+2,z)-y)+Math.abs(G2.h(x,z+2)-y);if(sl>2.2)continue;const dens=noise3(x*.02,z*.02,0,43);if(dens<(G2.ty=='Désertique'?.55:.32))continue;
const s=(G2.ty=='Désertique'?1.2:1.8)+h3(gx,gz,1,44)*2.6*(dens+.3);_gd.position.set(x,y-.2,z);_gd.rotation.set(0,h3(gx,gz,2,45)*TAU,0);_gd.scale.set(s*1.4,s,s*1.4);_gd.updateMatrix();m.setMatrixAt(i,_gd.matrix);
const b=G2.base,v=h3(gx,gz,3,46);_gc.setHSL((((b[0]+(v-.5)*30)%360)+360)%360/360,b[1],b[2]*(.75+v*.5)+(dens-.5)*.08);m.setColorAt(i,_gc);i++}
m.count=i;m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true}
// ----- traînées des réacteurs -----
const TRAILS=[];const TRN=DESK?44:28;
for(let k=0;k<3;k++){const g=new THREE.BufferGeometry(),p=new Float32Array(TRN*2*3),c=new Float32Array(TRN*2*3),idx=[];for(let i=0;i<TRN-1;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}g.setIndex(idx);g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(c,3));
const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,blending:ADDB,depthWrite:false,side:THREE.DoubleSide}));m.frustumCulled=false;TRAILS.push({m,g,p,c,h:[],col:new THREE.Color()})}
const _tw=new V3(),_tv=new V3(),_ts=new V3();
function updTrails(){const ud=ship.userData,sc=curScene(),fl=ud.flames||[];for(let k=0;k<3;k++){const T=TRAILS[k];if(T.m.parent!==sc)sc.add(T.m);const f=fl[k];if(!f||S.dead||!ship.visible){T.m.visible=false;T.h=[];continue}T.m.visible=true;
f.gs.getWorldPosition(_tw);if(T.h.length&&T.h[0].distanceTo(_tw)>250)T.h=[];T.h.unshift(_tw.clone());if(T.h.length>TRN)T.h.pop();T.col.copy(f.fl.material.color);
let cum=0,cut=T.h.length;for(let i=1;i<T.h.length;i++){cum+=T.h[i].distanceTo(T.h[i-1]);if(cum>14+S.spd*.03){cut=i;break}}T.h.length=Math.min(T.h.length,cut+1);const n=T.h.length,kk=clamp(S.thr*.6+.15,0,1.4);for(let i=0;i<TRN;i++){const a=T.h[Math.min(i,n-1)],b=T.h[Math.min(i+1,n-1)];_tv.copy(a).sub(b);if(_tv.lengthSq()<1e-6)_tv.copy(fwd());_ts.copy(camera.position).sub(a);_ts.crossVectors(_tv,_ts).normalize();
const fr=Math.min(1,i/Math.max(1,n-1)),w=(1-fr)*.75+.12,in_=i<n?1:0,cd=a.distanceTo(camera.position),br=Math.pow(1-fr,1.4)*kk*in_*clamp((cd-10)/14,0,1);T.p.set([a.x+_ts.x*w,a.y+_ts.y*w,a.z+_ts.z*w,a.x-_ts.x*w,a.y-_ts.y*w,a.z-_ts.z*w],i*6);
T.c.set([T.col.r*br,T.col.g*br,T.col.b*br,T.col.r*br,T.col.g*br,T.col.b*br],i*6)}T.g.attributes.position.needsUpdate=true;T.g.attributes.color.needsUpdate=true}}
// ----- poussière spatiale -----
const DUST=(()=>{const n=DESK?900:400,B=320,p=new Float32Array(n*3);for(let i=0;i<n*3;i++)p[i]=(Math.random()-.5)*B;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));
const m=new THREE.Points(g,new THREE.PointsMaterial({size:.9,map:GLOW,color:0xa8c4ff,transparent:true,opacity:.55,depthWrite:false,blending:ADDB,sizeAttenuation:true}));m.frustumCulled=false;scene.add(m);return{m,p,g,B,n}})();
function updDust(){const D=DUST;D.m.visible=mode=='space';if(!D.m.visible)return;const c=camera.position,B=D.B,hb=B/2;for(let i=0;i<D.n;i++){for(let a=0;a<3;a++){const k=i*3+a,cc=a==0?c.x:a==1?c.y:c.z;let v=D.p[k];const d=v-cc;if(d>hb)v-=B*Math.ceil((d-hb)/B);else if(d<-hb)v+=B*Math.ceil((-hb-d)/B);D.p[k]=v}}D.g.attributes.position.needsUpdate=true}
// ----- étalonnage « cinéma » (PC) -----
let GRADE=null;
function setupGrade(){if(!composer)return;GRADE=new THREE.ShaderPass({uniforms:{tDiffuse:{value:null},tm:{value:0},res:{value:new THREE.Vector2(innerWidth,innerHeight)}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
fragmentShader:`uniform sampler2D tDiffuse;uniform float tm;uniform vec2 res;varying vec2 vUv;void main(){vec2 uv=vUv,d=uv-.5;float r2=dot(d,d);vec2 off=d*.002*r2*4.;vec3 c=vec3(texture2D(tDiffuse,uv+off).r,texture2D(tDiffuse,uv).g,texture2D(tDiffuse,uv-off).b);
c=c*c*(3.-2.*c)*.18+c*.82;float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,1.12);c+=(1.-l)*vec3(-.006,.004,.018)+l*vec3(.018,.006,-.012);
c*=1.-smoothstep(.18,.75,r2*1.5)*.32;float g=fract(sin(dot(uv*res+fract(tm*7.3)*91.,vec2(12.9898,78.233)))*43758.5453);c+=(g-.5)*.022;gl_FragColor=vec4(c,1.);}`});composer.addPass(GRADE)}
function updDetail(){updTrails();updDust();if(mode=='surf')updGrass();if(GRADE){GRADE.uniforms.tm.value=t;GRADE.uniforms.res.value.set(innerWidth,innerHeight)}}
