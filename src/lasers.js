// ===== LASERS : tirs lumineux, rayon continu, éclairs de bouche, impacts, son =====
const LZ_VS=`varying vec3 vN,vV;varying vec2 vU;void main(){vU=uv;vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`;
// halo doux d'un tir : brillant au centre, bords et extrémités fondus
const BOLT_FS=`uniform vec3 col;uniform float k;varying vec3 vN,vV;varying vec2 vU;void main(){float f=abs(dot(vN,vV));float e=smoothstep(0.,.35,vU.y)*smoothstep(1.,.7,vU.y);gl_FragColor=vec4(col*(.18+pow(f,2.2)*.8+pow(f,10.)*.7)*k*e,1.);}`;
// rayon : cœur blanc, halo coloré, pulsations d'énergie qui filent le long du faisceau
const BEAM_FS=`uniform vec3 col;uniform float tm,len,k,hot;varying vec3 vN,vV;varying vec2 vU;void main(){float f=abs(dot(vN,vV));float z=vU.y*len;
float pulse=.78+.22*sin(z*.16-tm*60.)+.14*sin(z*.037-tm*19.)+.08*sin(z*.6-tm*90.);float e=smoothstep(0.,6./max(len,6.),vU.y)*smoothstep(1.,1.-3./max(len,3.),vU.y);
float core=pow(f,10.),halo=pow(f,2.);vec3 c=mix(col,vec3(1.),clamp(core*.9+hot*.25,0.,1.));gl_FragColor=vec4(c*(.06+core*1.35+halo*.55)*pulse*k*e,1.);}`;
const BOLTG={core:new THREE.CylinderGeometry(.12,.12,7,6).rotateX(Math.PI/2),glow:new THREE.CylinderGeometry(.7,.7,12,10,1,true).rotateX(Math.PI/2),
ecore:new THREE.CylinderGeometry(.28,.28,6,6).rotateX(Math.PI/2),eglow:new THREE.CylinderGeometry(1.4,1.4,11,10,1,true).rotateX(Math.PI/2)};
const BOLTM={};
function boltMats(c,big){const key=c+'|'+big;if(BOLTM[key])return BOLTM[key];const C=new THREE.Color(c),W=new THREE.Color(1,1,1);
const sm=(col,op)=>new THREE.SpriteMaterial({map:GLOW,color:col,transparent:true,opacity:op,blending:ADDB,depthWrite:false});
return BOLTM[key]={core:new THREE.MeshBasicMaterial({color:C.clone().lerp(W,.6),transparent:true,blending:ADDB,depthWrite:false}),
glow:new THREE.ShaderMaterial({uniforms:{col:{value:C.clone().multiplyScalar(DESK?.8:1.05)},k:{value:big?1.1:1}},vertexShader:LZ_VS,fragmentShader:BOLT_FS,transparent:true,blending:ADDB,depthWrite:false,side:THREE.DoubleSide}),
head:sm(C.clone().lerp(W,.25),DESK?.85:1),t1:sm(C,DESK?.5:.6),t2:sm(C,DESK?.28:.35)}}
// un tir = cœur + halo + traînée de lueurs (tête vers -z : on l'oriente avec lookAt(position - direction))
// les lueurs « sprites » restent visibles même quand le tir s'éloigne droit devant la caméra
function boltMesh(c,big){const M=boltMats(c,big),g=new THREE.Group(),k=big?1.5:1;g.add(new THREE.Mesh(big?BOLTG.ecore:BOLTG.core,M.core));if(!LOWQ||big)g.add(new THREE.Mesh(big?BOLTG.eglow:BOLTG.glow,M.glow));
for(const[m,sz,z]of[[M.head,5.2,-3.4],[M.t1,3.6,0],[M.t2,2.6,3.6]]){const h=new THREE.Sprite(m);h.scale.setScalar(sz*k);h.position.z=z*k;g.add(h)}return g}
// ----- petites lueurs éphémères (bouche des canons, impacts) -----
const FXS=[],fxPool=[];
function fxSprite(p,col,size,life,grow,parent){let s=fxPool.pop();if(!s)s=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW2,transparent:true,blending:ADDB,depthWrite:false}));
s.material.color.set(col);s.material.opacity=1;s.position.copy(p);s.scale.setScalar(size);(parent||curScene()).add(s);FXS.push({s,l:life,ml:life,size,grow:grow||1.6});return s}
function updFXS(dt){for(let i=FXS.length-1;i>=0;i--){const f=FXS[i];f.l-=dt;const k=f.l/f.ml;if(k<=0){f.s.parent&&f.s.parent.remove(f.s);fxPool.push(f.s);FXS.splice(i,1);continue}f.s.material.opacity=k*k;f.s.scale.setScalar(f.size*(1+(1-k)*(f.grow-1)))}}
const _lz1=new V3(),_lz2=new V3(),_lz3=new V3(),_lzc=new THREE.Color();
function muzzleFlash(l,col){const b=ship.userData.body;_lz1.set(l[0],l[1],l[2]);fxSprite(_lz1,col,5.5,.08,1.5,b);fxSprite(_lz1,0xffffff,2.4,.06,1.3,b)}
function impactFX(p,col,k=1){fxSprite(p,col,15*k,.24,2.3);fxSprite(p,0xffffff,5.5*k,.12,1.8);_lzc.set(col);const n=Math.round(9*k);
for(let i=0;i<n;i++){_lz2.set(rv(1),rv(1),rv(1)).normalize().multiplyScalar(50+Math.random()*110);SPK.emit(p.x,p.y,p.z,_lz2.x,_lz2.y,_lz2.z,.22+Math.random()*.3,Math.min(1,_lzc.r+.3),Math.min(1,_lzc.g+.3),Math.min(1,_lzc.b+.3),.32)}}
// recul des canons et rotation des canons rotatifs
let KICK=0;function gunKick(){KICK=1}
function updGuns(dt){const ud=ship.userData;if(!ud)return;KICK=Math.max(0,KICK-dt*9);if(ud.spin)for(const g of ud.spin)g.rotation.z+=dt*(isFire()&&!S.docked?26:1.5);if(ud.recoil)for(const r of ud.recoil)r.o.position.z=r.z+KICK*.45}
// ----- rayon laser -----
const BEAMG={i:new THREE.CylinderGeometry(.62,.62,1,14,1,true).rotateX(Math.PI/2).translate(0,0,.5),o:new THREE.CylinderGeometry(2.5,2.5,1,16,1,true).rotateX(Math.PI/2).translate(0,0,.5)};
function mkBeam(col){const g=new THREE.Group(),U={col:{value:new THREE.Color(col)},tm:TM,len:{value:100},hot:{value:0}};
const lay=(geo,k)=>{const m=new THREE.Mesh(geo,new THREE.ShaderMaterial({uniforms:{...U,k:{value:k}},vertexShader:LZ_VS,fragmentShader:BEAM_FS,transparent:true,blending:ADDB,depthWrite:false,side:THREE.DoubleSide}));m.frustumCulled=false;g.add(m);return m};
lay(BEAMG.i,DESK?1:1.25);lay(BEAMG.o,DESK?.38:.5);
const sm=c=>new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:c,transparent:true,blending:ADDB,depthWrite:false}));const s0=sm(col),s1=sm(col),s2=sm(0xffffff);
g.userData={U,s0,s1,s2};g.visible=false;return g}
function placeBeam(B,o,end,w,hit){const sc=curScene(),u=B.userData;for(const x of[B,u.s0,u.s1,u.s2]){if(x.parent!==sc)sc.add(x);x.visible=true}
const L=Math.max(1,o.distanceTo(end));B.position.copy(o);B.lookAt(end);B.scale.set(w,w,L);u.U.len.value=L;
u.s0.position.copy(o);u.s0.scale.setScalar(7+Math.random()*3);u.s1.position.copy(end);u.s1.scale.setScalar((hit?24:12)+Math.random()*9);u.s2.position.copy(end);u.s2.scale.setScalar((hit?9:4)+Math.random()*3);u.s2.visible=!!hit}
function hideBeam(B){if(!B)return;B.visible=false;const u=B.userData;u.s0.visible=u.s1.visible=u.s2.visible=false}
function rmBeam(B){if(!B)return;const u=B.userData;for(const x of[B,u.s0,u.s1,u.s2])x.parent&&x.parent.remove(x)}
const LZBEAMS=[];let LZCOL=null;
function laserHide(){for(const B of LZBEAMS)hideBeam(B);lzSound(0)}
function laserTick(dt,TG){const fp=partOf('focus'),col=fp.lc,nb=PM('twin')>0?2:1;
if(LZCOL!==col){for(const B of LZBEAMS)rmBeam(B);LZBEAMS.length=0;LZCOL=col}while(LZBEAMS.length<nb)LZBEAMS.push(mkBeam(col));while(LZBEAMS.length>nb)rmBeam(LZBEAMS.pop());
if(!LZ.on||S.dead){laserHide();return}
fwd();const ud=ship.userData,sc=ud.body.scale,E=ud.lasers&&ud.lasers.length?ud.lasers:[[0,-1.15,-8.6]],range=780*PM('lrange'),per=7*dmgMul()*PM('ldmg')/nb,hot=LZ.heat>.82?(LZ.heat-.82)*5.5:0;
for(let i=0;i<nb;i++){const B=LZBEAMS[i],e=E[i%E.length],o=_lz1.set(e[0]*sc.x,e[1]*sc.y,e[2]*sc.z).applyQuaternion(S.q).add(S.pos).clone();
let dir=_f.clone();if(lock&&lock.pos.distanceTo(S.pos)<range)dir=_lz2.copy(lock.pos).sub(o).normalize().clone();let best=null,bt=range;
for(const T of TG){if(T.dead||T.gone)continue;_lz3.copy(T.pos).sub(o);const tt=_lz3.dot(dir);if(tt<0||tt>bt)continue;const perp=_lz3.addScaledVector(dir,-tt).length();if(perp<(T.r||6)){bt=tt;best=T}}
if(mode=='surf'){for(let s=20;s<bt;s+=20){const p=o.clone().addScaledVector(dir,s);if(p.y<SURF.height(p.x,p.z)){bt=s;best=null;break}}}
const end=o.clone().addScaledVector(dir,bt),hit=!!best||bt<range-1;B.userData.U.hot.value=hot;
placeBeam(B,o,end,(1+Math.random()*.18)*(1+hot*.5)*(hot>0&&Math.random()<hot*.4?.5:1),hit);
if(hit&&Math.random()<.8){_lzc.set(col);_lz2.set(rv(1),rv(1),rv(1)).normalize().multiplyScalar(60+Math.random()*80);SPK.emit(end.x,end.y,end.z,_lz2.x,_lz2.y,_lz2.z,.3+Math.random()*.3,Math.min(1,_lzc.r+.4),Math.min(1,_lzc.g+.4),Math.min(1,_lzc.b+.4),.38)}
if(best){const a=(LZ.acc.get(best)||0)+dt*per*(best.isAst||best.isDep?2.5:1);if(a>=1.2){best.hit(a,end);LZ.acc.set(best,0);impactFX(end,col,.7)}else LZ.acc.set(best,a)}}
lzSound(1,LZ.heat)}
// bourdonnement continu du laser (au lieu de petits bips)
let LZA=null;
function lzSound(on,h=0){if(!AC)return;if(!LZA){if(!on)return;try{const o1=AC.createOscillator(),o2=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain(),lfo=AC.createOscillator(),lg=AC.createGain();
o1.type='sawtooth';o1.frequency.value=92;o2.type='square';o2.frequency.value=185;f.type='bandpass';f.frequency.value=900;f.Q.value=2.4;lfo.frequency.value=23;lg.gain.value=220;lfo.connect(lg);lg.connect(f.frequency);g.gain.value=0;
o1.connect(f);o2.connect(f);f.connect(g);g.connect(master);o1.start();o2.start();lfo.start();LZA={o1,f,g,was:0}}catch(e){return}}
const n=AC.currentTime;LZA.g.gain.setTargetAtTime(on?.07:0,n,on?.02:.05);if(on){LZA.f.frequency.setTargetAtTime(700+h*1500,n,.08);LZA.o1.frequency.setTargetAtTime(92+h*46,n,.08);if(!LZA.was)tone(1700,520,.14,'sine',.07)}LZA.was=on}
SFX.shield=()=>{tone(260,620,.16,'sine',.09);noise(.12,.08,3200)};
SFX.shoot=()=>{tone(1250,240,.11,'square',.035);tone(2600,900,.05,'sine',.03)};
