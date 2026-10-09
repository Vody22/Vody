// ===== MOTEUR 3D =====
const LOWQ=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);
const R3=new THREE.WebGLRenderer({canvas:$('c'),antialias:!LOWQ||devicePixelRatio<2.5,powerPreference:'high-performance'});
R3.setPixelRatio(Math.min(devicePixelRatio||1,LOWQ?1.6:1.5));if(DESK){R3.shadowMap.enabled=true;R3.shadowMap.type=THREE.PCFSoftShadowMap}
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(68,1,.5,60000);scene.add(camera);
function resize(){const w=innerWidth,h=innerHeight;R3.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<h?76:54;camera.updateProjectionMatrix();if(typeof composer!='undefined'&&composer){composer.setPixelRatio(R3.getPixelRatio());composer.setSize(w,h)}OV.width=w*Math.min(devicePixelRatio||1,2);OV.height=h*Math.min(devicePixelRatio||1,2);OX.setTransform(OV.width/w,0,0,OV.height/h,0,0)}
const OX=OV.getContext('2d');addEventListener('resize',resize);
const amb=new THREE.AmbientLight(0x4a5570,.75),sunL=new THREE.DirectionalLight(0xffffff,1.2),fillL=new THREE.HemisphereLight(0x9fc4ff,0x261c30,.55);scene.add(amb,sunL,sunL.target,fillL);
const GLOW=glowTex(.22),GLOW2=glowTex(.05);
const ADDB=THREE.AdditiveBlending;
const SPM={};function spriteMat(col,op=1,tex=GLOW){const k=col+'|'+op+'|'+tex.uuid;return SPM[k]||(SPM[k]=new THREE.SpriteMaterial({map:tex,color:col,transparent:true,opacity:op,blending:ADDB,depthWrite:false}))}
function sprite(col,size,op=1,tex){const s=new THREE.Sprite(spriteMat(col,op,tex));s.scale.set(size,size,1);return s}
// ----- ciel : nébuleuse + étoiles (suivent la caméra) -----
const sky=new THREE.Group();scene.add(sky);
let NEB;{const W2=DESK?4:1024,H2=DESK?2:512,c=mkC(W2,H2),g=c.getContext('2d'),im=g.createImageData(W2,H2),d=im.data;
for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){const lon=x/W2*TAU,lat=(y/H2-.5)*Math.PI,cx=Math.cos(lat)*Math.cos(lon),cy=Math.sin(lat),cz=Math.cos(lat)*Math.sin(lon);
const a=fbm3(cx*2.2,cy*2.2,cz*2.2,11,4),b=fbm3(cx*3+5,cy*3,cz*3,23,3),m=Math.max(0,a-.47)*2.6,n=Math.max(0,b-.5)*2.2,k=(y*W2+x)*4;
d[k]=4+m*70+n*80;d[k+1]=6+m*30+n*40;d[k+2]=16+m*95+n*120;d[k+3]=255}
g.putImageData(im,0,0);const tex=new THREE.CanvasTexture(c);const neb=new THREE.Mesh(new THREE.SphereGeometry(20000,32,16),new THREE.MeshBasicMaterial({map:tex,side:THREE.BackSide,depthWrite:false,fog:false}));neb.renderOrder=-10;NEB=neb;sky.add(neb);
for(const[n,sz,op]of(DESK?[[7000,1.5,.8],[900,2.4,1],[120,3.6,1]]:[[2600,1.6,.75],[350,2.8,1]])){const p=new Float32Array(n*3),col=new Float32Array(n*3),r=rng(77+n);for(let i=0;i<n;i++){const u=r()*2-1,th=r()*TAU,s=Math.sqrt(1-u*u);p[i*3]=s*Math.cos(th)*18000;p[i*3+1]=u*18000;p[i*3+2]=s*Math.sin(th)*18000;const tint=r(),br=.5+r()*.5;col[i*3]=br*(tint<.2?1:tint<.4?.75:.95);col[i*3+1]=br*(tint<.2?.85:.88);col[i*3+2]=br*(tint<.2?.7:1)}
const gm=new THREE.BufferGeometry();gm.setAttribute('position',new THREE.BufferAttribute(p,3));gm.setAttribute('color',new THREE.BufferAttribute(col,3));const pts=new THREE.Points(gm,new THREE.PointsMaterial({size:sz,sizeAttenuation:false,vertexColors:true,transparent:true,opacity:op,depthWrite:false,fog:false}));pts.renderOrder=-9;sky.add(pts)}}
// ----- lignes de vitesse (attachées à la caméra) -----
const SPL=(()=>{const n=110,p=new Float32Array(n*6),gm=new THREE.BufferGeometry(),r=rng(5);gm.setAttribute('position',new THREE.BufferAttribute(p,3));const data=[];for(let i=0;i<n;i++){const a=r()*TAU,rad=6+r()*30;data.push({x:Math.cos(a)*rad,y:Math.sin(a)*rad,z:-r()*260})}
const m=new THREE.LineSegments(gm,new THREE.LineBasicMaterial({color:0xaad4ff,transparent:true,opacity:0,blending:ADDB,depthWrite:false}));m.frustumCulled=false;camera.add(m);return{m,p,data,gm}})();
function updSpeedLines(dt,k,spd){SPL.m.material.opacity=k*.55;if(k<.02)return;const L=10+spd*.12;for(let i=0;i<SPL.data.length;i++){const d=SPL.data[i];d.z+=spd*1.4*dt;if(d.z>5)d.z-=265;SPL.p.set([d.x,d.y,d.z,d.x,d.y,d.z-L],i*6)}SPL.gm.attributes.position.needsUpdate=true}
// ----- particules -----
class PSys{constructor(n,size,host){this.n=n;this.pos=new Float32Array(n*3).fill(1e7);this.col=new Float32Array(n*3);this.v=new Float32Array(n*3);this.l=new Float32Array(n);this.ml=new Float32Array(n).fill(1);this.bc=new Float32Array(n*3);this.dr=new Float32Array(n).fill(1);this.i=0;
const gm=new THREE.BufferGeometry();gm.setAttribute('position',new THREE.BufferAttribute(this.pos,3));gm.setAttribute('color',new THREE.BufferAttribute(this.col,3));this.gm=gm;
this.pts=new THREE.Points(gm,new THREE.PointsMaterial({size,map:GLOW,vertexColors:true,transparent:true,depthWrite:false,blending:ADDB}));this.pts.frustumCulled=false;host.add(this.pts)}
emit(x,y,z,vx,vy,vz,life,r,g,b,drag=1){const i=this.i;this.i=(i+1)%this.n;this.pos[i*3]=x;this.pos[i*3+1]=y;this.pos[i*3+2]=z;this.v[i*3]=vx;this.v[i*3+1]=vy;this.v[i*3+2]=vz;this.l[i]=this.ml[i]=life;this.bc[i*3]=r;this.bc[i*3+1]=g;this.bc[i*3+2]=b;this.dr[i]=drag}
update(dt){for(let i=0;i<this.n;i++){if(this.l[i]<=0)continue;this.l[i]-=dt;const k=i*3;if(this.l[i]<=0){this.pos[k]=1e7;this.col[k]=this.col[k+1]=this.col[k+2]=0;continue}const dr=Math.pow(this.dr[i],dt);this.v[k]*=dr;this.v[k+1]*=dr;this.v[k+2]*=dr;this.pos[k]+=this.v[k]*dt;this.pos[k+1]+=this.v[k+1]*dt;this.pos[k+2]+=this.v[k+2]*dt;const f=this.l[i]/this.ml[i];this.col[k]=this.bc[k]*f;this.col[k+1]=this.bc[k+1]*f;this.col[k+2]=this.bc[k+2]*f}
this.gm.attributes.position.needsUpdate=true;this.gm.attributes.color.needsUpdate=true}
clear(){this.l.fill(0);this.pos.fill(1e7);this.col.fill(0)}}
const SPK=new PSys(1600,2.6,scene),FIRE=new PSys(700,13,scene);
const rv=s=>(Math.random()*2-1)*s;
function boom3(p,n,c,spd=60,big=false){const cl=new THREE.Color(c);for(let i=0;i<n;i++){const v=new V3(rv(1),rv(1),rv(1)).normalize().multiplyScalar(spd*(.3+Math.random()));SPK.emit(p.x,p.y,p.z,v.x,v.y,v.z,.5+Math.random()*.7,cl.r,cl.g,cl.b,.4)}
if(big){for(let i=0;i<n*.6;i++){const v=new V3(rv(1),rv(1),rv(1)).normalize().multiplyScalar(spd*.5*Math.random());FIRE.emit(p.x,p.y,p.z,v.x,v.y,v.z,.6+Math.random()*.6,1,.55+Math.random()*.3,.2,.3)}flash(p,n*1.6);shake=Math.min(1.4,shake+n*.012)}}
const FLASHES=[];function flash(p,size){const s=sprite(0xffd9a0,size,1,GLOW2);s.position.copy(p);curScene().add(s);FLASHES.push({s,l:.35,size})}
function updFlashes(dt){for(let i=FLASHES.length-1;i>=0;i--){const f=FLASHES[i];f.l-=dt;f.s.material=f.s.material;f.s.scale.setScalar(f.size*(1.4-f.l));f.s.material.opacity=Math.max(0,f.l/.35);if(f.l<=0){f.s.parent&&f.s.parent.remove(f.s);FLASHES.splice(i,1)}}}
let shake=0;
// ----- matériaux / géométries partagés -----
const MAT={metal:new THREE.MeshStandardMaterial({color:0xaab5c4,metalness:DESK?.8:.3,roughness:DESK?.3:.4}),dark:new THREE.MeshStandardMaterial({color:0x4a5260,metalness:DESK?.7:.3,roughness:DESK?.45:.55}),glass:new THREE.MeshPhongMaterial({color:0x66ddff,emissive:0x0a3550,shininess:120,specular:0xffffff}),
panel:new THREE.MeshStandardMaterial({color:0x2b4d7a,emissive:0x0a1a33,metalness:.3,roughness:.4}),ore:new THREE.MeshBasicMaterial({color:0x66f6ff}),gold:new THREE.MeshStandardMaterial({color:0xffcf5a,emissive:0x664400,metalness:.9,roughness:.25})};
const PBG=new THREE.CylinderGeometry(.22,.22,9,5).rotateX(Math.PI/2),PBM=new THREE.MeshBasicMaterial({color:0x9ff6ff,blending:ADDB,transparent:true,depthWrite:false});
const EBG=new THREE.SphereGeometry(1.4,8,6);const EBM={};const ebMat=c=>EBM[c]||(EBM[c]=new THREE.MeshBasicMaterial({color:c,blending:ADDB,transparent:true,depthWrite:false}));
// ----- vaisseau du joueur -----
const HULLC=[[0x3a8fd8,0x1d4f80],[0x5fb8c9,0x2a6b77],[0xd6a94a,0x8a6a2a]];
function wingGeo(){const s=new THREE.Shape();s.moveTo(0,-2.2);s.lineTo(6,1.4);s.lineTo(6.2,2.6);s.lineTo(0,2.2);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:.32,bevelEnabled:false});g.rotateX(Math.PI/2);g.translate(.8,0,0);return g}
const WING=wingGeo();
function buildShip(){const[wl,el,hl]=G.u,tier=hl>=5?2:hl>=3?1:0,HC=HULLC[tier];const root=new THREE.Group(),body=new THREE.Group();root.add(body);
const hull=new THREE.MeshStandardMaterial({color:HC[0],metalness:DESK?.75:.25,roughness:DESK?.26:.38,emissive:HC[0],emissiveIntensity:DESK?.03:.08}),wingM=new THREE.MeshStandardMaterial({color:HC[1],metalness:DESK?.7:.25,roughness:DESK?.32:.45,side:THREE.DoubleSide,emissive:HC[1],emissiveIntensity:DESK?.02:.06});
const nose=new THREE.Mesh(new THREE.ConeGeometry(1.35,7,12).rotateX(-Math.PI/2),hull);nose.position.z=-3.2;body.add(nose);
const mid=new THREE.Mesh(new THREE.CylinderGeometry(1.35,1.15,4,12).rotateX(Math.PI/2),hull);mid.position.z=2;body.add(mid);
const cp=new THREE.Mesh(new THREE.SphereGeometry(1,14,10),MAT.glass);cp.scale.set(.8,.6,1.9);cp.position.set(0,.85,-1.4);body.add(cp);
const wr=new THREE.Mesh(WING,wingM);wr.position.set(0,-.2,1.2);body.add(wr);const wl2=new THREE.Mesh(WING,wingM);wl2.scale.x=-1;wl2.position.set(0,-.2,1.2);body.add(wl2);
const fin=new THREE.Mesh(new THREE.BoxGeometry(.25,2,2.4),wingM);fin.position.set(0,1.4,2.6);fin.rotation.x=-.4;body.add(fin);
if(hl>=3)for(const z of[-1,.6]){const a=new THREE.Mesh(new THREE.TorusGeometry(1.3,.12,6,16),MAT.dark);a.position.z=z;body.add(a)}
const nE=el>=3?3:2,eC=el>=5?0xc07bff:el>=3?0x78e6ff:0x50aaff,ex=nE==3?[-1.6,0,1.6]:[-1.1,1.1],ey=nE==3?[0,.6,0]:[0,0];const flames=[];
ex.forEach((x,i)=>{const n=new THREE.Mesh(new THREE.CylinderGeometry(.55,.75,2.4,10).rotateX(Math.PI/2),MAT.dark);n.position.set(x,ey[i]-.1,4.3);body.add(n);
const fl=new THREE.Mesh(new THREE.ConeGeometry(.5,4,10).rotateX(Math.PI/2),new THREE.MeshBasicMaterial({color:DESK?new THREE.Color(eC).multiplyScalar(1.6):eC,transparent:true,opacity:.85,blending:ADDB,depthWrite:false}));fl.position.set(x,ey[i]-.1,7.4);body.add(fl);const gs=sprite(eC,3);gs.position.set(x,ey[i]-.1,5.8);body.add(gs);flames.push({fl,gs})});
if(wl>=2)for(const sx of[-1,1]){const c=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,4.5,6).rotateX(Math.PI/2),MAT.metal);c.position.set(sx*6.7,-.15,.8);body.add(c);if(wl>=4){const c2=c.clone();c2.position.set(sx*4.2,-.15,-.2);body.add(c2)}if(wl>=6){const g=sprite(0x5af0ff,2.2);g.position.set(sx*6.7,-.15,-1.6);body.add(g)}}
const nl=sprite(0xff4040,1.6),nr=sprite(0x40ff70,1.6);nl.position.set(-7,-.1,3.4);nr.position.set(7,-.1,3.4);body.add(nl,nr);
const shield=new THREE.Mesh(new THREE.SphereGeometry(10.5,28,18),new THREE.ShaderMaterial({uniforms:{op:{value:0}},vertexShader:AVS,fragmentShader:'uniform float op;varying vec3 vNV;varying vec3 vN;void main(){float f=pow(1.-abs(vNV.z),2.2);gl_FragColor=vec4(vec3(.35,.8,1.)*f*op*1.6,1.);}',transparent:true,blending:ADDB,depthWrite:false}));shield.material.opacity=0;root.add(shield);
root.userData={body,flames,shield,nl,nr};return root}
// ----- ennemis -----
const ENC={pirate:0xd23a3a,chasseur:0xffd23d,lourd:0xe055aa,boss:0xa04dff};
function buildEnemy(ty){const g=new THREE.Group(),b=new THREE.Group();g.add(b);const m=new THREE.MeshStandardMaterial({color:ENC[ty],metalness:.25,roughness:.45,emissive:ENC[ty],emissiveIntensity:.15});
if(ty=='chasseur'){const n=new THREE.Mesh(new THREE.ConeGeometry(.9,8,8).rotateX(-Math.PI/2),m);b.add(n);for(const s of[-1,1]){const f=new THREE.Mesh(new THREE.BoxGeometry(4.5,.2,2),m);f.position.set(s*2.4,0,2.4);f.rotation.y=s*.5;b.add(f)}}
else if(ty=='lourd'){const n=new THREE.Mesh(new THREE.BoxGeometry(5,3,9),m);b.add(n);for(const s of[-1,1]){const p=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,8,10).rotateX(Math.PI/2),MAT.dark);p.position.set(s*4.2,0,1);b.add(p)}}
else if(ty=='boss'){const n=new THREE.Mesh(new THREE.OctahedronGeometry(6,0),m);n.scale.set(1,.6,1.8);b.add(n);const r=new THREE.Mesh(new THREE.TorusGeometry(9,.8,8,28),MAT.dark);r.rotation.x=Math.PI/2;b.add(r);for(const s of[-1,1]){const w=new THREE.Mesh(new THREE.BoxGeometry(10,.5,5),m);w.position.set(s*8,0,2);b.add(w)}}
else{const n=new THREE.Mesh(new THREE.ConeGeometry(1.6,7,4).rotateX(-Math.PI/2),m);b.add(n);for(const s of[-1,1]){const f=new THREE.Mesh(new THREE.BoxGeometry(5,.3,3),m);f.position.set(s*2.6,0,2);f.rotation.z=s*.25;b.add(f)}}
const eye=new THREE.Mesh(new THREE.SphereGeometry(.7,8,6),new THREE.MeshBasicMaterial({color:0xff3030}));eye.position.set(0,.8,-1);b.add(eye);
const sc=(ty=='boss'?1.6:ty=='lourd'?1.2:1)*1.8,en=sprite(0xff6a3a,6);en.position.z=5;b.add(en);g.scale.setScalar(sc);
const bar=new THREE.Sprite(new THREE.SpriteMaterial({color:ENC[ty],depthWrite:false,transparent:true}));bar.scale.set(10,.7,1);bar.position.y=9;bar.visible=false;g.add(bar);g.userData={body:b,bar};return g}
// ----- station -----
function buildStation(){const g=new THREE.Group(),rot=new THREE.Group();g.add(rot);const ring=new THREE.Mesh(new THREE.TorusGeometry(60,7,DESK?24:12,DESK?96:48),MAT.metal);rot.add(ring);const hub=new THREE.Mesh(new THREE.SphereGeometry(18,20,14),MAT.metal);g.add(hub);
const hubL=sprite(0xffcc66,40,.8);g.add(hubL);for(let i=0;i<4;i++){const a=i/4*TAU,sp=new THREE.Mesh(new THREE.CylinderGeometry(2,2,44,8),MAT.dark);sp.position.set(Math.cos(a)*38,Math.sin(a)*38,0);sp.rotation.z=a+Math.PI/2;rot.add(sp);const pn=new THREE.Mesh(new THREE.BoxGeometry(22,.8,12),MAT.panel);pn.position.set(Math.cos(a+.785)*82,Math.sin(a+.785)*82,0);pn.rotation.z=a+.785;rot.add(pn)}
const lights=[];for(let i=0;i<8;i++){const a=i/8*TAU,s=sprite(0xffd060,10);s.position.set(Math.cos(a)*60,Math.sin(a)*60,8);rot.add(s);lights.push(s)}
const zone=new THREE.Mesh(new THREE.TorusGeometry(230,1.5,6,80),new THREE.MeshBasicMaterial({color:0xffc84a,transparent:true,opacity:.35,blending:ADDB,depthWrite:false}));zone.rotation.x=Math.PI/2;g.add(zone);
g.userData={rot,lights,zone,hubL};return g}
// ----- astéroïdes -----
const AGEO=[],AMAT=[];{for(let v=0;v<8;v++){const g=new THREE.IcosahedronGeometry(1,DESK?3:1),p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),k=.72+fbm3(x*1.3+v*7,y*1.3,z*1.3,v+3,DESK?5:3)*.6;p.setXYZ(i,x*k,y*k*(.75+v%3*.12),z*k)}g.computeVertexNormals();AGEO.push(g)}
for(let i=0;i<4;i++)AMAT.push(new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL((20+i*8)/360,.12,.32+i*.04),roughness:DESK?.82:.95,metalness:DESK?.15:.05,flatShading:true}))}
const OREG=new THREE.OctahedronGeometry(1.4);
// ----- planètes -----
const ptype=p=>p.ring?'Géante gazeuse':p.hue<25||p.hue>335?'Volcanique':p.hue<70?'Désertique':p.hue<160?'Jungle':p.hue<250?'Océanique':p.hue<290?'Glacée':'Cristalline';
// variantes (graphismes 3) : archipel tropical, forêt de cristal, ruines anciennes
const pvar=p=>{if(!p||p.ring)return '';const ty=ptype(p),k=hs((p.x|0)+7,(p.z|0)+3,21);return ty=='Océanique'&&k<.5?'archipel':ty=='Cristalline'?'cristal':(ty=='Désertique'||ty=='Jungle')&&k<.35?'ruines':''},PVARN={archipel:'Archipel tropical',cristal:'Forêt de cristal',ruines:'Ruines anciennes'};
const PVS=`varying vec2 vUv;varying vec3 vN;varying vec3 vW;void main(){vUv=uv;vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
const PFS=`float phs(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}float pvn(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(phs(i),phs(i+vec3(1.,0.,0.)),f.x),mix(phs(i+vec3(0.,1.,0.)),phs(i+vec3(1.,1.,0.)),f.x),f.y),mix(mix(phs(i+vec3(0.,0.,1.)),phs(i+vec3(1.,0.,1.)),f.x),mix(phs(i+vec3(0.,1.,1.)),phs(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}
uniform sampler2D map;uniform sampler2D night;uniform vec3 sunDir;uniform vec3 sunCol;uniform float hasNight;uniform vec3 atm;varying vec2 vUv;varying vec3 vN;varying vec3 vW;
void main(){vec3 n=normalize(vN);float d=dot(n,sunDir);vec3 c=texture2D(map,vUv).rgb;vec3 col=c*(0.07+sunCol*max(d,0.)*1.2);col+=texture2D(night,vUv).rgb*smoothstep(0.08,-0.25,d)*hasNight*1.4;
col*=.88+.24*(pvn(n*26.)*.6+pvn(n*64.)*.4);vec3 V=normalize(cameraPosition-vW);float rim=pow(1.-max(dot(V,n),0.),2.6);col+=atm*rim*.3*smoothstep(-0.25,0.45,d);gl_FragColor=vec4(col,1.);}`;
const CFS=`uniform sampler2D map;uniform vec3 sunDir;uniform vec3 sunCol;uniform float off;varying vec2 vUv;varying vec3 vN;varying vec3 vW;void main(){vec4 c=texture2D(map,vec2(vUv.x+off,vUv.y));float d=dot(normalize(vN),sunDir);gl_FragColor=vec4(c.rgb*(0.03+sunCol*max(d,0.)),c.a*smoothstep(-0.35,0.1,d)*0.9+c.a*0.1);}`;
const AVS=`varying vec3 vNV;varying vec3 vN;void main(){vNV=normalize(normalMatrix*normal);vN=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const AFS=`uniform vec3 atm;uniform vec3 sunDir;varying vec3 vNV;varying vec3 vN;void main(){float i=pow(clamp(0.78-dot(vNV,vec3(0.,0.,1.)),0.,1.),3.2);float l=smoothstep(-0.35,0.5,dot(vN,sunDir));gl_FragColor=vec4(atm*i*1.25*(0.12+l),1.);}`;
function* planetTexGen(p){const TW=LOWQ?384:512,TH=TW/2,ty=ptype(p),pv=pvar(p),h=p.hue,sd=seedOf(p.x,p.y,p.z,5),lq=ty=='Océanique'?(pv=='archipel'?.64:.5):ty=='Désertique'?.3:.4;
const c=mkC(TW,TH),g=c.getContext('2d'),im=g.createImageData(TW,TH),d=im.data,nc=mkC(TW,TH),ng=nc.getContext('2d'),nim=ng.createImageData(TW,TH),nd=nim.data,cc=mkC(TW,TH),cg=cc.getContext('2d'),cim=cg.createImageData(TW,TH),cd=cim.data;
const inhab=pv=='ruines'||(!p.ring&&ty!='Volcanique'&&hs(p.x|0,p.z|0,8)<.6),ru=pv=='ruines';
for(let y=0;y<TH;y++){const lat=(y/TH-.5)*Math.PI,cl=Math.cos(lat),sy=Math.sin(lat);for(let x=0;x<TW;x++){const lon=x/TW*TAU,X=cl*Math.cos(lon),Y=-sy,Z=cl*Math.sin(lon),k=(y*TW+x)*4;let col,v;
if(p.ring){v=.5+.32*Math.sin(Y*16+fbm3(X*2,Y*2,Z*2,sd,3)*5)+(fbm3(X*5,Y*5,Z*5,sd+9,2)-.5)*.3;col=hsl(h+v*35,.5,.28+v*.34)}
else{v=fbm3(X*2.2,Y*2.2,Z*2.2,sd,6);v=clamp(.5+(v-.5)*1.5,0,1);const pole=Math.abs(Y)>.86-v*.08;
if(ty=='Glacée')col=v<lq?hsl(195,.55,.62+v*.2):hsl(205,.15,.75+v*.2);else if(v<lq)col=ty=='Volcanique'?hsl(18+v*40,1,.45+v*.2):ty=='Océanique'?(pv=='archipel'&&v>lq-.07?hsl(176,.7,.42+(v-lq+.07)*3):hsl(205,.75,.18+v*.35)):ty=='Cristalline'?hsl(h+40,.6,.35+v*.4):hsl(h+25,.55,.18+v*.3);
else col=ty=='Volcanique'?hsl(h+(v-.5)*30,.3,.1+v*.28):hsl(h+(v-.5)*40,ty=='Désertique'?.5:.38,.2+v*.42);if(pole&&ty!='Volcanique'&&ty!='Désertique')col=hsl(200,.1,.88);
if(inhab&&v>lq+.02&&!pole){const q=noise3(X*40,Y*40,Z*40,sd+4);if(q>.72){const b=(q-.72)*3.6*(fbm3(X*6,Y*6,Z*6,sd+5,2)>.5?1:.25);nd[k]=(ru?70:255)*b;nd[k+1]=(ru?230:190)*b;nd[k+2]=(ru?255:90)*b}}}
d[k]=col[0];d[k+1]=col[1];d[k+2]=col[2];d[k+3]=255;nd[k+3]=255;
if(!p.ring){const cv=fbm3(X*2.5+3,Y*3.5,Z*2.5,sd+50,4),a=clamp((cv-(ty=='Désertique'?.6:.5))/.15,0,1),tint=ty=='Volcanique'?.35:1;cd[k]=cd[k+1]=cd[k+2]=255*tint;cd[k+3]=a*a*(3-2*a)*230}}if((y&3)==3)yield}
g.putImageData(im,0,0);ng.putImageData(nim,0,0);cg.putImageData(cim,0,0);
return{map:new THREE.CanvasTexture(c),night:new THREE.CanvasTexture(nc),clouds:p.ring?null:new THREE.CanvasTexture(cc),inhab}}
function buildPlanet(p,tx){const g=new THREE.Group();g.position.set(p.x,p.y,p.z);const atmC=new THREE.Color().setHSL(((p.hue+15)%360)/360,.55,.62),U={map:{value:tx.map},night:{value:tx.night},sunDir:{value:new V3(0,1,0)},sunCol:{value:new THREE.Color(1,1,1)},hasNight:{value:tx.inhab?1:0},atm:{value:atmC}};
const seg=LOWQ?48:64,sph=new THREE.Mesh(new THREE.SphereGeometry(p.r,seg,seg/2),new THREE.ShaderMaterial({uniforms:U,vertexShader:PVS,fragmentShader:PFS}));sph.rotation.z=hs(p.x|0,p.z|0,3)*.5;g.add(sph);
let cl=null;if(tx.clouds){const CU={map:{value:tx.clouds},sunDir:U.sunDir,sunCol:U.sunCol,off:{value:0}};tx.clouds.wrapS=THREE.RepeatWrapping;cl=new THREE.Mesh(new THREE.SphereGeometry(p.r*1.018,seg,seg/2),new THREE.ShaderMaterial({uniforms:CU,vertexShader:PVS,fragmentShader:CFS,transparent:true,depthWrite:false}));g.add(cl)}
const at=new THREE.Mesh(new THREE.SphereGeometry(p.r*1.16,seg,seg/2),new THREE.ShaderMaterial({uniforms:{atm:U.atm,sunDir:U.sunDir},vertexShader:AVS,fragmentShader:AFS2,side:THREE.BackSide,blending:ADDB,transparent:true,depthWrite:false}));g.add(at);
if(p.ring){const rg=new THREE.RingGeometry(p.r*1.35,p.r*2.2,96,1),pos=rg.attributes.position,uv=rg.attributes.uv;for(let i=0;i<pos.count;i++){const l=Math.hypot(pos.getX(i),pos.getY(i));uv.setXY(i,(l-p.r*1.35)/(p.r*.85),.5)}
const rc=mkC(256,4),rx=rc.getContext('2d'),r=rng(seedOf(p.x,p.y,p.z,9));for(let x=0;x<256;x++){const a=(.15+r()*.6)*(x<8||x>248?.2:1)*(x>150&&x<165?.1:1),cc=hsl(p.hue+30+r()*25,.45,.55+r()*.2);rx.fillStyle=`rgba(${cc.map(Math.round)},${a})`;rx.fillRect(x,0,1,4)}
const ring=new THREE.Mesh(rg,new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(rc),color:0xcccccc,transparent:true,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=Math.PI/2-.35;ring.rotation.y=.2;g.add(ring)}
const r=rng(seedOf(p.x,p.y,p.z,11)),moons=[],nm=p.ring?1+(r()<.5):r()<.5?1:0;for(let i=0;i<nm;i++){const piv=new THREE.Group();piv.rotation.set(r()*.6-.3,r()*TAU,r()*.6-.3);const m=new THREE.Mesh(new THREE.SphereGeometry(p.r*(.06+r()*.08),20,14),new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(.08,.08,.45+r()*.2),roughness:1,flatShading:true}));m.position.x=p.r*(2.4+i*.8+r()*.4);piv.add(m);g.add(piv);moons.push({piv,sp:(.03+r()*.05)*(r()<.5?-1:1)})}
g.userData={U,cl,moons,sph};return g}
// ----- soleils -----
const SUNS=[[0xffe196,0xfffae6,'naine jaune'],[0xffaa5a,0xffe1be,'géante orange'],[0x96beff,0xebf5ff,'étoile bleue'],[0xff6e50,0xffc8aa,'géante rouge']];
const SUNFS=`uniform vec3 cA;uniform vec3 cB;uniform float tm;varying vec3 vN;varying vec3 vW;varying vec2 vUv;
float h(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float n(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){vec3 N=normalize(vN),V=normalize(cameraPosition-vW);float mu=max(dot(N,V),0.);vec3 q=N*6.+vec3(tm*.05,tm*.03,0.);float g=n(q)*.55+n(q*2.3)*.3+n(q*5.)*.15;vec3 col=mix(cA,cB,pow(mu,.6))*(0.82+g*.35);col*=0.55+0.45*pow(mu,.35);gl_FragColor=vec4(col*1.15,1.);}`;
function buildSun(s){const g=new THREE.Group();g.position.set(s.x,s.y,s.z);const SU={cA:{value:new THREE.Color(s.col)},cB:{value:new THREE.Color(s.core)},tm:{value:0}};const core=new THREE.Mesh(new THREE.SphereGeometry(s.r,48,28),new THREE.ShaderMaterial({uniforms:SU,vertexShader:PVS,fragmentShader:SUNFS}));g.add(core);
const a=sprite(s.col,s.r*8,.45),b=sprite(s.col,s.r*3.4,.75),c=sprite(s.core,s.r*2.35,.55,GLOW2);g.add(a,b,c);g.userData={a,b,SU};return g}

// ----- tâches étalées sur plusieurs images (génération de textures) -----
const JOBS=[];function job(gen,done,d=()=>0){JOBS.push({gen,done,d})}
function runJobs(ms){const t0=performance.now();if(JOBS.length>1&&!JOBS[0].started)JOBS.sort((a,b)=>a.d()-b.d());while(JOBS.length&&performance.now()-t0<ms){JOBS[0].started=1;const j=JOBS[0],r=j.gen.next();if(r.done){JOBS.shift();j.done(r.value)}}}
