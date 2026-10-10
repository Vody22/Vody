// ===== MOTEUR GRAPHIQUE : rendu HDR + courbe « cinéma », halo et étalonnage sur iPhone, anticrénelage FXAA, résolution adaptative, occlusion ambiante (PC Ultra), ombres au sol sur iPhone, flou de mouvement, profondeur de champ, réglage « Effets visuels » =====
const FX3={lv:'full',auto:true,hdr:false,ms:false,ao:null,dof:null,fxaa:null,grp:null,expo:1,mb:new THREE.Vector2(),pq:new THREE.Quaternion(),pqOk:false,
t0:0,tl:0,n:0,mx:0,good:0,bad:0,block:0,fps:0,cc:new THREE.Color()};
const FX3N={full:'Complet',bal:'Équilibré',eco:'Économie'};
try{const v=localStorage.getItem('sf-fx');if(v=='full'||v=='bal'||v=='eco'){FX3.lv=v;FX3.auto=false}}catch(e){}
const FX3V='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
// le GPU sait-il dessiner dans une image à virgule flottante (lumières au-delà du blanc) ?
function fx3HDR(){try{if(!R3.capabilities.isWebGL2)return false;const gl=R3.getContext();if(!gl.getExtension('EXT_color_buffer_float')&&!gl.getExtension('EXT_color_buffer_half_float'))return false;
const rt=new THREE.WebGLRenderTarget(4,4,{type:THREE.HalfFloatType});R3.setRenderTarget(rt);const ok=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;R3.setRenderTarget(null);rt.dispose();return ok}catch(e){try{R3.setRenderTarget(null)}catch(x){}return false}}
// objets à ignorer dans les passes de profondeur (particules, halos, vitres…)
function fx3Skip(o){if(o.isPoints||o.isLine||o.isSprite)return true;const m=Array.isArray(o.material)?o.material[0]:o.material;if(!m)return false;
return m.blending===THREE.AdditiveBlending||m.depthWrite===false||(m.transparent&&m.opacity<.9)||(o.isInstancedMesh&&o.count>1500)}
function fx3Hide(sc){const L=[];sc.traverseVisible(o=>{if(o!==sc&&fx3Skip(o))L.push(o)});for(const o of L)o.visible=false;return L}
// ----- passe de rendu de la scène : MSAA ×4 dans une cible privée (PC), sinon directement -----
class RP3 extends THREE.Pass{constructor(ms){super();this.needsSwap=false;this.scene=scene;this.camera=camera;this.ms=ms;
if(ms){this.cm=new THREE.ShaderMaterial({uniforms:{tDiffuse:{value:null}},vertexShader:FX3V,fragmentShader:'uniform sampler2D tDiffuse;varying vec2 vUv;void main(){gl_FragColor=texture2D(tDiffuse,vUv);}',depthTest:false,depthWrite:false});this.q=new THREE.FullScreenQuad(this.cm)}}
setSize(w,h){if(this.ms)this.ms.setSize(w,h)}
render(r,wb,rb){const ac=r.autoClear;r.autoClear=false;if(this.renderToScreen){r.setRenderTarget(null);r.clear();r.render(this.scene,this.camera)}
else if(this.ms){r.setRenderTarget(this.ms);r.clear();r.render(this.scene,this.camera);this.cm.uniforms.tDiffuse.value=this.ms.texture;r.setRenderTarget(rb);this.q.render(r)}
else{r.setRenderTarget(rb);r.clear();r.render(this.scene,this.camera)}r.autoClear=ac}
dispose(){if(this.ms)this.ms.dispose();if(this.cm)this.cm.dispose()}}
// ----- occlusion ambiante (SSAO, demi-résolution) : coins, pieds des rochers, couloirs des épaves -----
class AO3P extends THREE.Pass{constructor(){super();this.needsSwap=false;this.enabled=false;const dt=new THREE.DepthTexture();dt.type=THREE.UnsignedIntType;
this.nrt=new THREE.WebGLRenderTarget(8,8,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,format:THREE.RGBAFormat,depthTexture:dt});
this.srt=new THREE.WebGLRenderTarget(8,8,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat});this.brt=this.srt.clone();
const K=[];for(let i=0;i<16;i++){const s=new V3(Math.random()*2-1,Math.random()*2-1,Math.random()*.9+.1).normalize(),k=(i+1)/16;s.multiplyScalar(lerp(.12,1,k*k));K.push(s)}
const N=new Float32Array(64);for(let i=0;i<16;i++){const a=Math.random()*TAU;N[i*4]=Math.cos(a);N[i*4+1]=Math.sin(a);N[i*4+3]=1}const nt=new THREE.DataTexture(N,4,4,THREE.RGBAFormat,THREE.FloatType);nt.wrapS=nt.wrapT=THREE.RepeatWrapping;nt.needsUpdate=true;
const S=THREE.SSAOShader,fs=S.fragmentShader.replace('uniform float maxDistance;','uniform float maxDistance;uniform float ao3S,ao3F;').replace('gl_FragColor = vec4( vec3( 1.0 - occlusion ), 1.0 );','occlusion*=ao3S*(1.-smoothstep(ao3F*.4,ao3F,-viewZ));gl_FragColor=vec4(vec3(1.-occlusion),1.);');
this.ok=fs.indexOf('ao3S*')>0;const U=THREE.UniformsUtils.clone(S.uniforms);U.ao3S={value:1};U.ao3F={value:220};U.tNormal.value=this.nrt.texture;U.tDepth.value=dt;U.tNoise.value=nt;U.kernel.value=K;
this.sm=new THREE.ShaderMaterial({defines:{PERSPECTIVE_CAMERA:1,KERNEL_SIZE:16},uniforms:U,vertexShader:S.vertexShader,fragmentShader:fs,blending:THREE.NoBlending,depthTest:false,depthWrite:false});
const B=THREE.SSAOBlurShader;this.bm=new THREE.ShaderMaterial({uniforms:THREE.UniformsUtils.clone(B.uniforms),vertexShader:B.vertexShader,fragmentShader:B.fragmentShader,depthTest:false,depthWrite:false});this.bm.uniforms.tDiffuse.value=this.srt.texture;
this.mm=new THREE.ShaderMaterial({uniforms:{tDiffuse:{value:this.brt.texture}},vertexShader:FX3V,fragmentShader:'uniform sampler2D tDiffuse;varying vec2 vUv;void main(){gl_FragColor=vec4(texture2D(tDiffuse,vUv).rgb,1.);}',
blending:THREE.CustomBlending,blendSrc:THREE.DstColorFactor,blendDst:THREE.ZeroFactor,blendEquation:THREE.AddEquation,blendSrcAlpha:THREE.DstAlphaFactor,blendDstAlpha:THREE.ZeroFactor,depthTest:false,depthWrite:false});
this.nm=new THREE.MeshNormalMaterial();this.nm.blending=THREE.NoBlending;this.q=new THREE.FullScreenQuad(this.sm)}
setSize(w,h){const a=Math.max(1,w>>1),b=Math.max(1,h>>1);this.nrt.setSize(a,b);this.srt.setSize(a,b);this.brt.setSize(a,b);this.sm.uniforms.resolution.value.set(a,b);this.bm.uniforms.resolution.value.set(a,b)}
render(r,wb,rb){const sc=rpass.scene,cam=rpass.camera;if(!this.ok||!sc||!cam)return;const L=fx3Hide(sc),bg=sc.background,om=sc.overrideMaterial,au=r.shadowMap.autoUpdate,ac=r.autoClear,ca=r.getClearAlpha();r.getClearColor(FX3.cc);
try{sc.background=null;sc.overrideMaterial=this.nm;r.shadowMap.autoUpdate=false;r.autoClear=false;r.setClearColor(0x7777ff,1);r.setRenderTarget(this.nrt);r.clear();r.render(sc,cam)}finally{sc.overrideMaterial=om;sc.background=bg;r.shadowMap.autoUpdate=au;for(const o of L)o.visible=true}
const u=this.sm.uniforms,rg=cam.far-cam.near,int=mode=='int',R=int?1.15:2.3;u.cameraNear.value=cam.near;u.cameraFar.value=cam.far;u.cameraProjectionMatrix.value.copy(cam.projectionMatrix);u.cameraInverseProjectionMatrix.value.copy(cam.projectionMatrixInverse);
u.kernelRadius.value=R;u.minDistance.value=.012/rg;u.maxDistance.value=R*1.4/rg;u.ao3S.value=int?1.6:1.5;u.ao3F.value=int?70:230;
r.setClearColor(0xffffff,1);this.q.material=this.sm;r.setRenderTarget(this.srt);this.q.render(r);this.q.material=this.bm;r.setRenderTarget(this.brt);this.q.render(r);
this.q.material=this.mm;r.setRenderTarget(rb);this.q.render(r);r.setClearColor(FX3.cc,ca);r.autoClear=ac}
dispose(){for(const o of[this.nrt,this.srt,this.brt,this.sm,this.bm,this.mm,this.nm])o.dispose()}}
// ----- anticrénelage FXAA (iPhone, et PC sans MSAA) -----
const FXAA3={uniforms:{tDiffuse:{value:null},rs:{value:new THREE.Vector2(1/1024,1/1024)}},vertexShader:FX3V,
fragmentShader:`uniform sampler2D tDiffuse;uniform vec2 rs;varying vec2 vUv;
void main(){vec3 nw=texture2D(tDiffuse,vUv+vec2(-1.,-1.)*rs).rgb,ne=texture2D(tDiffuse,vUv+vec2(1.,-1.)*rs).rgb,sw=texture2D(tDiffuse,vUv+vec2(-1.,1.)*rs).rgb,se=texture2D(tDiffuse,vUv+vec2(1.,1.)*rs).rgb;vec4 mm=texture2D(tDiffuse,vUv);vec3 L=vec3(.299,.587,.114);
float lnw=dot(nw,L),lne=dot(ne,L),lsw=dot(sw,L),lse=dot(se,L),lm=dot(mm.rgb,L),mn=min(lm,min(min(lnw,lne),min(lsw,lse))),mx=max(lm,max(max(lnw,lne),max(lsw,lse)));
if(mx-mn<max(.0312,mx*.125)){gl_FragColor=vec4(mm.rgb,1.);return;}
vec2 dir=vec2(-((lnw+lne)-(lsw+lse)),(lnw+lsw)-(lne+lse));float rd=max((lnw+lne+lsw+lse)*.03125,.0078125),rc=1./(min(abs(dir.x),abs(dir.y))+rd);dir=clamp(dir*rc,-8.,8.)*rs;
vec3 a=.5*(texture2D(tDiffuse,vUv-dir/6.).rgb+texture2D(tDiffuse,vUv+dir/6.).rgb),b=a*.5+.25*(texture2D(tDiffuse,vUv-dir*.5).rgb+texture2D(tDiffuse,vUv+dir*.5).rgb);float lb=dot(b,L);
gl_FragColor=vec4((lb<mn||lb>mx)?a:b,1.);}`};
// ----- courbe « cinéma » (épaule douce au-dessus de 85 %, les couleurs très vives virent au blanc), exposition, flou de mouvement : ajoutés à l'étalonnage GRADE -----
function fx3GradePatch(){if(!GRADE)return;const m=GRADE.material;if(m.userData.fx3)return;const U=GRADE.uniforms;U.expo3={value:1};U.tmk={value:FX3.hdr?.85:1};U.mb3={value:FX3.mb};if(m.uniforms!==U){m.uniforms.expo3=U.expo3;m.uniforms.tmk=U.tmk;m.uniforms.mb3=U.mb3}
const s0='c=c*c*(3.-2.*c)*.18+c*.82;';if(m.fragmentShader.indexOf(s0)<0)return;m.userData.fx3=1;
m.fragmentShader=m.fragmentShader.replace('uniform sampler2D tDiffuse;','uniform sampler2D tDiffuse;uniform float expo3,tmk;uniform vec2 mb3;vec3 tm3(vec3 c){float l=max(max(c.r,c.g),c.b);if(l<=tmk)return c;if(tmk>.99)return c/l;float lm=tmk+(1.-tmk)*(1.-exp(-(l-tmk)/(1.-tmk)));return mix(c*(lm/l),vec3(lm),smoothstep(1.,2.6,l)*.85);}')
.replace(s0,'if(dot(mb3,mb3)>2e-6){float em=smoothstep(.004,.1,r2);vec3 a3=vec3(0.);for(int i=0;i<6;i++){a3+=texture2D(tDiffuse,uv+mb3*((float(i)+.5)/6.-.5)*em).rgb;}c=mix(c,a3/6.,em);}c=tm3(c*expo3);'+s0);m.needsUpdate=true}
// ----- construction de la chaîne de post-traitement (PC et iPhone) -----
{if(typeof GRP!='undefined'&&GRP&&GRP.material)FX3.grp={v:GRP.material.vertexShader,f:GRP.material.fragmentShader}}
function fx3Dispose(){const c=composer;if(!c)return;try{for(const p of c.passes){if(p===GRADE||p===FX3.fxaa||p===GRP){if(p.material)p.material.dispose();continue}if(p.renderTargetDepth){p.renderTargetDepth.dispose();p.materialBokeh.dispose();p.materialDepth.dispose();continue}if(p.dispose)p.dispose()}c.renderTarget1.dispose();c.renderTarget2.dispose()}catch(e){console.warn(e)}}
function fx3Build(){fx3Dispose();composer=null;rpass=null;bloom=null;GRP=null;GRADE=null;FX3.ao=FX3.dof=FX3.fxaa=null;FX3.ms=false;
if(!THREE.EffectComposer||FX3.lv=='eco'){bloomOn=false;return}
try{FX3.hdr=fx3HDR();const pr=R3.getPixelRatio(),w=innerWidth,h=innerHeight,W=Math.max(1,Math.round(w*pr)),H=Math.max(1,Math.round(h*pr)),ty=FX3.hdr?THREE.HalfFloatType:THREE.UnsignedByteType;
const rt=new THREE.WebGLRenderTarget(W,H,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,type:ty});composer=new THREE.EffectComposer(R3,rt);
let ms=null;if(DESK&&R3.capabilities.isWebGL2&&THREE.WebGLMultisampleRenderTarget){try{ms=new THREE.WebGLMultisampleRenderTarget(W,H,{format:THREE.RGBAFormat,type:ty});ms.samples=4;FX3.ms=true}catch(e){ms=null}}
rpass=new RP3(ms);composer.addPass(rpass);
if(DESK&&THREE.SSAOShader){FX3.ao=new AO3P();composer.addPass(FX3.ao)}
if(DESK&&FX3.grp){const f=FX3.hdr?FX3.grp.f.replace('vec3 s=texture2D(tDiffuse,c).rgb;','vec3 s=min(texture2D(tDiffuse,c).rgb,vec3(1.));'):FX3.grp.f;GRP=new THREE.ShaderPass({uniforms:{tDiffuse:{value:null},sun:{value:new THREE.Vector2(.5,.5)},str:{value:0}},vertexShader:FX3.grp.v,fragmentShader:f});composer.addPass(GRP)}
if(THREE.BokehPass){const d=new THREE.BokehPass(scene,camera,{focus:40,aperture:.0001,maxblur:.02,width:Math.max(1,W>>1),height:Math.max(1,H>>1)});d.needsSwap=true;d.enabled=false;d.setSize=(a,b)=>d.renderTargetDepth.setSize(Math.max(1,DESK?a:a>>1),Math.max(1,DESK?b:b>>1));
const _r=d.render.bind(d);d.render=function(r,wb,rb){this.scene=rpass.scene;this.camera=rpass.camera;this.uniforms.aspect.value=this.camera.aspect||1;const L=fx3Hide(this.scene),au=r.shadowMap.autoUpdate;r.shadowMap.autoUpdate=false;try{_r(r,wb,rb)}finally{r.shadowMap.autoUpdate=au;for(const o of L)o.visible=true}};FX3.dof=d;composer.addPass(d)}
bloom=DESK?new THREE.UnrealBloomPass(new THREE.Vector2(w,h),.8,.5,.84):new THREE.UnrealBloomPass(new THREE.Vector2(w>>1,h>>1),.55,.42,.86);
if(!DESK){const ss=bloom.setSize.bind(bloom);bloom.setSize=(a,b)=>ss(Math.max(2,a>>1),Math.max(2,b>>1))}composer.addPass(bloom);
setupGrade();fx3GradePatch();
if(!ms){FX3.fxaa=new THREE.ShaderPass(FXAA3);composer.addPass(FX3.fxaa)}
bloomOn=true;resize()}catch(e){console.warn('fx3',e);composer=null;bloomOn=false}fx3Sync()}
// réglage PC « Qualité » : Performance = pas de post-traitement ; Élevée = sans occlusion ambiante
function fx3Sync(){if(DESK&&composer)bloomOn=QI<2;else bloomOn=!!composer}
// ----- ombres au sol sur iPhone (mode Complet) -----
const SH3M={on:false,dl:null,r:new V3(),u:new V3(),c:new V3()};
function fx3ShadowCfg(){if(DESK)return;const dl=SURF.scene.children.find(o=>o.isDirectionalLight);if(!dl)return;SH3M.dl=dl;const want=FX3.lv=='full';if(want===SH3M.on)return;SH3M.on=want;
if(want){R3.shadowMap.enabled=true;R3.shadowMap.type=THREE.PCFShadowMap;dl.castShadow=true;dl.shadow.mapSize.set(1024,1024);const c=dl.shadow.camera;c.left=-118;c.right=118;c.top=118;c.bottom=-118;c.near=20;c.far=2800;c.updateProjectionMatrix();dl.shadow.bias=-.0006;dl.shadow.normalBias=.5}
else{dl.castShadow=false;R3.shadowMap.enabled=false;if(dl.shadow.map){dl.shadow.map.dispose();dl.shadow.map=null}}
if(mode=='surf'){fx3ShadowScene();SURF.scene.traverse(o=>{if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.needsUpdate=true)})}}
function fx3Caster(o){if(!o.isMesh||o.isInstancedMesh)return;const m=Array.isArray(o.material)?o.material[0]:o.material;if(!m||m.transparent||m.blending===THREE.AdditiveBlending||(m.isShaderMaterial&&!m.lights))return;
if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();if(o.geometry.boundingSphere.radius*o.matrixWorld.getMaxScaleOnAxis()>45)return;o.castShadow=o.receiveShadow=true}
function fx3ShadowScene(){if(DESK||!SH3M.on)return;const sc=SURF.scene;sc.updateMatrixWorld();const F=typeof GR!='undefined'&&GR&&GR.F;sc.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.attributes.position&&o.geometry.attributes.position.count>20000)o.receiveShadow=true;else fx3Caster(o)});
if(F&&F.terr)F.terr.receiveShadow=true;ship.traverse(o=>{const m=o.material;if(o.isMesh&&m&&!m.transparent&&m.blending!==THREE.AdditiveBlending)o.castShadow=true})}
{const _se=SURF.enter;SURF.enter=function(p,entry){_se(p,entry);try{fx3ShadowScene()}catch(e){console.warn(e)}}}
function fx3ShadowTick(){if(!SH3M.on||mode!='surf'||typeof GR=='undefined'||!GR||!GR.F)return;const F=GR.F,dl=SH3M.dl,d=F.sunDir;if(!d||!dl)return;
if(typeof BL3!='undefined'&&BL3.ship){BL3.ship.visible=false;BL3.foot.visible=false}
if(FOOT.model&&!FOOT.model.userData.sh3){FOOT.model.userData.sh3=1;FOOT.model.traverse(o=>{if(o.isMesh)o.castShadow=true})}
// centre de la zone d'ombre : là où tombe l'ombre du vaisseau (ou les pieds du pilote), calé sur la grille de la carte d'ombre (pas de scintillement)
const c=SH3M.c;if(FOOT.on)c.copy(FOOT.model?FOOT.model.position:FOOT.pos);else{const p=ship.position,gy=Math.max(0,SURF.height(p.x,p.z)),alt=Math.max(0,p.y-gy);c.copy(p).addScaledVector(d,-Math.min(240,alt/Math.max(.25,d.y)))}
const r=SH3M.r.set(0,1,0).cross(d);if(r.lengthSq()<1e-4)r.set(1,0,0);r.normalize();const u=SH3M.u.crossVectors(d,r).normalize(),tx=236/1024,a=c.dot(r),b=c.dot(u);c.addScaledVector(r,Math.round(a/tx)*tx-a).addScaledVector(u,Math.round(b/tx)*tx-b);
dl.target.position.copy(c);dl.position.copy(c).addScaledVector(d,1300);dl.target.updateMatrixWorld()}
// ----- résolution adaptative : baisse la définition quand ça rame, la remonte quand c'est fluide -----
function fx3PRMax(){const d=devicePixelRatio||1;if(DESK)return QI==2?1:Math.min(d,QI==0?2:1.5);return Math.min(d,FX3.lv=='eco'?[1.6,1.3,1][GQL]:[2,1.6,1.2][GQL])}
function fx3PRMin(){return DESK?.75:.9}
function fx3PRBase(){return DESK?(QI==2?1:Math.min(devicePixelRatio||1,1.5)):Math.min(devicePixelRatio||1,[1.6,1.3,1][GQL])}
function fx3SetPR(v){v=Math.round(v*100)/100;if(Math.abs(v-R3.getPixelRatio())<.01)return;R3.setPixelRatio(v);resize()}
function fx3Adapt(){const now=performance.now(),gap=now-(FX3.tl||now);FX3.tl=now;
if(gap>300||document.hidden||(typeof MENU3!='undefined'&&MENU3.on)||(typeof PH!='undefined'&&PH.on)||(typeof JMP!='undefined'&&JMP.on)){FX3.t0=now;FX3.n=0;FX3.mx=0;return}
if(!FX3.t0){FX3.t0=now;FX3.n=0;FX3.mx=0;return}FX3.n++;FX3.mx=Math.max(FX3.mx,gap);const el=now-FX3.t0;if(el<2000)return;const fps=FX3.n*1000/el;FX3.fps=fps;FX3.t0=now;FX3.n=0;const mx=FX3.mx;FX3.mx=0;
// iPhone en mode économie d'énergie : bloqué à 30 i/s régulières → ce n'est pas la carte graphique, on ne touche à rien
if(fps>28&&fps<31.5&&mx<40){FX3.good=0;return}
const pr=R3.getPixelRatio(),lo=fx3PRMin(),hi=fx3PRMax();
if(fps<45){FX3.good=0;FX3.block=now+15000;if(pr>lo+.01)fx3SetPR(Math.max(lo,pr-(fps<32?.25:.12)));else if(FX3.auto&&FX3.lv=='full'&&fps<36&&++FX3.bad>=3){FX3.bad=0;fx3Set('bal',true)}}
else{FX3.bad=0;if(fps>56.5){if(++FX3.good>=2&&now>FX3.block&&pr<hi-.01){FX3.good=0;fx3SetPR(Math.min(hi,pr+.1))}}else FX3.good=0}
if(pr>hi+.01)fx3SetPR(hi)}
// ----- par image : exposition, flou de mouvement, occlusion, profondeur de champ, FXAA -----
const _fx3f=new V3(),_fx3q=new THREE.Quaternion();
function fx3Tick(dt){fx3Adapt();fx3ShadowTick();if(!composer)return;const pr=R3.getPixelRatio(),menu=typeof MENU3!='undefined'&&MENU3.on,ph=typeof PH!='undefined'&&PH.on;
if(FX3.fxaa)FX3.fxaa.uniforms.rs.value.set(1/Math.max(1,innerWidth*pr),1/Math.max(1,innerHeight*pr));
// exposition (adaptation de l'œil) : plus ouverte dans les épaves et la nuit, plus fermée face au soleil
if(GRADE&&GRADE.uniforms.expo3){let tg=1.03;if(mode=='int')tg=1.16;else if(mode=='surf'&&typeof DN!='undefined')tg+=.12*(DN.night||0);if(typeof FL3!='undefined')tg-=.09*clamp(FL3.v||0,0,1);if(menu)tg=1.03;FX3.expo+=(tg-FX3.expo)*Math.min(1,dt*1.6);GRADE.uniforms.expo3.value=FX3.expo}
// flou de mouvement de la caméra (rotation rapide), bords de l'écran seulement : le vaisseau reste net
const ck=typeof ckActive=='function'&&ckActive(),mbOn=FX3.lv!='eco'&&!menu&&!ph&&!MAP.open&&!ck&&!S.dead&&!FOOT.on&&mode!='int'&&!S.docked;
if(mbOn&&FX3.pqOk){_fx3q.copy(camera.quaternion).invert();_fx3f.set(0,0,-1).applyQuaternion(FX3.pq).applyQuaternion(_fx3q);
if(_fx3f.z<-.94){const ty=Math.tan(camera.fov*Math.PI/360),nx=_fx3f.x/-_fx3f.z/(ty*camera.aspect),ny=_fx3f.y/-_fx3f.z/ty,k=.2;let mx=nx*k,my=ny*k;const L=Math.hypot(mx,my),L2=Math.min(.02,Math.max(0,L-.003));if(L>1e-6){mx*=L2/L;my*=L2/L}FX3.mb.x+=(mx-FX3.mb.x)*.6;FX3.mb.y+=(my-FX3.mb.y)*.6}else FX3.mb.set(0,0)}else FX3.mb.set(0,0);
if(FX3.mb.lengthSq()<4e-6)FX3.mb.set(0,0);FX3.pq.copy(camera.quaternion);FX3.pqOk=true;
// occlusion ambiante : PC, qualité Ultra, effets Complets, au sol et dans les épaves
if(FX3.ao)FX3.ao.enabled=FX3.lv=='full'&&QI==0&&(mode=='surf'||mode=='int')&&!menu&&!MAP.open;
// profondeur de champ : menu, ralenti sur les boss, amarrage, mode photo « Profondeur »
const D=FX3.dof;if(D){let f=0,ap=0,mb=.02;if(FX3.lv=='full'){
if(menu&&MENU3.cam&&MENU3.ship){f=MENU3.cam.position.distanceTo(MENU3.ship.position);ap=.00012;mb=.0085}
else if(ph&&PH.b=='dof'){f=PH.dist;ap=.00028*clamp(60/PH.fov,.6,3);mb=.013}
else if(typeof KC3!='undefined'&&KC3.on){f=camera.position.distanceTo(KC3.p);ap=.00006;mb=.009}
else if(typeof DKA!='undefined'&&DKA.on&&mode=='space'){f=camera.position.distanceTo(ship.position);ap=.00003;mb=.006}}
D.enabled=f>0&&!MAP.open;if(D.enabled){const u=D.uniforms;u.focus.value+=(f-u.focus.value)*(Math.abs(f-u.focus.value)>f*.5?1:.25);u.aperture.value=ap;u.maxblur.value=mb}}}
TICK.push(fx3Tick);
// ----- réglage « Effets visuels » (Options) -----
function fx3Set(lv,auto){if(!FX3N[lv])return;FX3.lv=lv;if(!auto){FX3.auto=false;try{localStorage.setItem('sf-fx',lv)}catch(e){}}
fx3Build();fx3ShadowCfg();FX3.block=performance.now()+4000;FX3.good=0;fx3SetPR(Math.min(fx3PRMax(),Math.max(fx3PRMin(),R3.getPixelRatio())));
toast('✨ Effets visuels : '+FX3N[lv]+(auto?' (pour garder le jeu fluide)':''));if(typeof OPTP!='undefined'&&OPTP.open)optRender()}
{const b=$('fxbtn');if(b)b.onclick=()=>fx3Set(FX3.lv=='full'?'bal':FX3.lv=='bal'?'eco':'full')}
{const _or=optRender;optRender=function(){_or();const b=$('fxbtn');if(b)b.textContent=FX3N[FX3.lv]}}
{const _cq=cycleQuality;cycleQuality=function(){_cq();fx3Sync();FX3.block=performance.now()+4000}}
{const qb=$('qbtn'),_qc=qb&&qb.onclick;if(qb&&_qc)qb.onclick=function(e){_qc.call(this,e);fx3Sync();FX3.block=performance.now()+4000;if(!DESK)fx3SetPR(Math.min(fx3PRMax(),fx3PRBase()))}}
// démarrage
fx3Build();fx3ShadowCfg();
