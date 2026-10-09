// ===== MÉTÉO 2 : tempêtes qui vont et viennent, éclairs, éclaboussures, voiles de sable/neige, tourbillons, brume des vallées, traces de pas, poussière =====
// intensité de la tempête : longues périodes calmes puis grosses tempêtes
function wxStorm(F){const a=.5+.5*Math.sin(t*.045+F.hu)*.8+.2*Math.sin(t*.13+F.hu*2);return clamp(a,0,1)}
const WX_FS=`uniform float tm,k,y0,hf;uniform vec3 col;uniform sampler2D hm;varying vec3 vW;varying float vD;float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hs(i),hs(i+vec2(1.,0.)),f.x),mix(hs(i+vec2(0.,1.)),hs(i+vec2(1.,1.)),f.x),f.y);}
void main(){vec2 uv=(vW.xz+hf)/(2.*hf);float th=texture2D(hm,clamp(uv,0.,1.)).r*60.-30.,dp=y0-th;float n=vn(vW.xz*.0055+vec2(tm*.012,tm*.005))*.6+vn(vW.xz*.016-vec2(tm*.015,0.))*.4;
float a=smoothstep(.32,.72,n)*smoothstep(0.,9.,dp)*k*smoothstep(12.,80.,vD)*(1.-smoothstep(1000.,1700.,vD));gl_FragColor=vec4(col,a*.5);}`;
const FOGK={Jungle:.95,Océanique:.75,Glacée:.6,Cristalline:.55,Volcanique:.45,Désertique:0};
const _wxE=SURF.onEnter;SURF.onEnter=function(F,sc){_wxE(F,sc);const W={bolts:[],sheets:[],devils:[],fogs:[],lf:0,splT:0};F.W=W;
// brume basse dans les vallées (2 couches, adoucies au contact du relief)
if(FOGK[F.ty]){const hm=F.lmat&&F.lmat.uniforms&&F.lmat.uniforms.hm?F.lmat.uniforms.hm.value:hmapTex(F.h,F.HALF);for(const y0 of[7,17]){const U={tm:TM,k:{value:0},y0:{value:y0},hf:{value:F.HALF},col:{value:new THREE.Color()},hm:{value:hm}};const m=new THREE.Mesh(new THREE.PlaneGeometry(F.HALF*2,F.HALF*2,1,1).rotateX(-Math.PI/2),new THREE.ShaderMaterial({uniforms:U,vertexShader:LIQ_VS,fragmentShader:WX_FS,transparent:true,depthWrite:false}));m.position.y=y0;m.renderOrder=2;sc.add(m);W.fogs.push(U)}}
// voiles de sable / neige / cendres qui défilent autour de la caméra
const sheet=F.wx=='sable'?0xd8a868:F.wx=='neige'?0xf4f8ff:F.wx=='cendres'?0x3a2a24:0;if(sheet){for(let i=0;i<(DESK?16:GQL>=2?4:9);i++){const s=fxSprite(SMOKET,THREE.NormalBlending,sheet,0);s.material.fog=false;s.material.rotation=Math.random()*TAU;sc.add(s);W.sheets.push({s,o:new V3(rv(260),rv(30)-6,rv(260)),sz:70+Math.random()*120,ph:Math.random()*9})}W.sheetCol=new THREE.Color(sheet)}
// tourbillons de poussière (planètes désertiques)
if(F.ty=='Désertique')for(let d=0;d<2;d++){const g=new THREE.Group(),parts=[];for(let i=0;i<14;i++){const s=fxSprite(SMOKET,THREE.NormalBlending,0xc89a64,.32);s.material.rotation=Math.random()*TAU;g.add(s);parts.push(s)}sc.add(g);W.devils.push({g,parts,p:new V3(rv(600),0,rv(600)),v:new V3(rv(1),0,rv(1)).normalize().multiplyScalar(9+Math.random()*8),a:Math.random()*9})}};
// éclair : ligne brisée du nuage au sol
function mkBolt(sc,x,z,gy){const pts=[],n=14;let px=x+rv(40),pz=z+rv(40);for(let i=0;i<=n;i++){const k=i/n;pts.push(new V3(px,lerp(380,gy,k),pz));px+=rv(18);pz+=rv(18)}pts[n].set(x,gy,z);
const g=new THREE.BufferGeometry().setFromPoints(pts),m=new THREE.Line(g,new THREE.LineBasicMaterial({color:0xe8f0ff,transparent:true,opacity:1,blending:ADDB,depthWrite:false,fog:false}));sc.add(m);const gl=sprite(0xbcd4ff,160,.9);gl.position.set(x,gy+10,z);gl.material=gl.material.clone();sc.add(gl);return{m,gl,l:.35}}
const _wxT=SURF.tick;SURF.tick=function(dt,F){if(_wxT)_wxT(dt,F);if(!F||!F.W)return;const W=F.W,cp=camera.position,st=F.storm,rain=F.wx=='pluie';
// assombrissement par temps de pluie
if(rain){const k=1-st*.3;F.fog.color.multiplyScalar(k);if(F.skyU){F.skyU.hor.value.multiplyScalar(k);F.skyU.top.value.multiplyScalar(k)}}
// densité visible des particules selon la tempête
if(F.wm&&F.wm.material){const m=F.wm.material;if(rain)m.opacity=.12+.45*st;else if(F.wx=='neige')m.opacity=.35+.65*st;else if(F.wx=='sable')m.opacity=.15+.85*st}
// éclairs (pluie) avec tonnerre décalé selon la distance
if(rain&&st>.55&&Math.random()<dt*.12*st){F.flash=1}
if(F.flash>W.lf+.3){const x=cp.x+rv(700),z=cp.z+rv(700),gy=Math.max(0,F.h(x,z));W.bolts.push(mkBolt(SURF.scene,x,z,gy));const d=Math.hypot(x-cp.x,z-cp.z);setTimeout(()=>{if(mode=='surf'){SFX.boom();shake=Math.min(1,shake+.25*(1-d/1000))}},d/340*1000)}W.lf=F.flash;
for(let i=W.bolts.length-1;i>=0;i--){const b=W.bolts[i];b.l-=dt;const o=b.l>0?(Math.sin(b.l*90)>-.3?1:.25)*Math.min(1,b.l*6):0;b.m.material.opacity=o;b.gl.material.opacity=o*.8;if(b.l<=0){SURF.scene.remove(b.m,b.gl);b.m.geometry.dispose();b.m.material.dispose();b.gl.material.dispose();W.bolts.splice(i,1)}}
if(F.skyU&&F.flash>.05){F.skyU.hor.value.lerp(_dc2.set(.75,.8,.95),F.flash*.5);F.fog.color.lerp(_dc2,F.flash*.35)}
// éclaboussures de pluie au sol autour du joueur
if(rain){W.splT-=dt;if(W.splT<=0){W.splT=.03;for(let i=0;i<(DESK?6:3)*st+1;i++){const x=cp.x+rv(45),z=cp.z+rv(45),y=F.h(x,z);if(y<-1){SPK.emit(x,1.2,z,rv(2),5+Math.random()*4,rv(2),.25,.5,.6,.75,.3)}else SPK.emit(x,y+.1,z,rv(2.5),3+Math.random()*3,rv(2.5),.22,.45,.5,.6,.3)}}}
// voiles
if(W.sheets.length){const wind=_dv2.set(1,0,.25).normalize(),sp=F.wx=='sable'?60+180*st:F.wx=='neige'?25+60*st:12,lv=F.skyU?.2+.8*DN.day:1;
for(const q of W.sheets){q.o.addScaledVector(wind,sp*dt);if(q.o.x>260)q.o.x-=520;if(q.o.z>260)q.o.z-=520;if(q.o.z<-260)q.o.z+=520;const x=cp.x+q.o.x,z=cp.z+q.o.z,gy=Math.max(F.h(x,z),0);q.s.position.set(x,gy+4+Math.max(-2,q.o.y*.25),z);q.s.scale.setScalar(q.sz*(1+st*.6));q.s.material.rotation+=dt*.1;
const d=Math.hypot(q.o.x,q.o.z);q.s.material.opacity=(F.wx=='sable'?.8:F.wx=='neige'?.45:.55)*st*clamp((d-18)/50,0,1);q.s.material.color.copy(W.sheetCol).multiplyScalar(lv)}}
// tourbillons de poussière (surtout par temps calme)
for(const D of W.devils){D.p.addScaledVector(D.v,dt);D.a+=dt;const dx=D.p.x-cp.x,dz=D.p.z-cp.z;if(Math.hypot(dx,dz)>900){D.p.set(cp.x+rv(500),0,cp.z+rv(500))}if(Math.random()<dt*.2)D.v.applyAxisAngle(_dv.set(0,1,0),rv(1));
const gy=Math.max(F.h(D.p.x,D.p.z),0);D.g.position.set(D.p.x,gy,D.p.z);const vis=(1-st)*.9+.1;D.parts.forEach((s,i)=>{const h=i/D.parts.length,r=2+h*h*16,an=D.a*(5-h*2)+i*1.7;s.position.set(Math.cos(an)*r,h*55,Math.sin(an)*r);s.scale.setScalar(6+h*26);s.material.rotation+=dt*2;s.material.opacity=.28*vis*(1-h*.55)});
if(Math.random()<dt*8)smokePuff(_dv.set(D.p.x+rv(4),gy+1,D.p.z+rv(4)),_dv2.set(rv(6),3,rv(6)),5,1.4,0xc89a64)}
// brume des vallées : plus épaisse la nuit, à l'aube et sous la pluie
if(W.fogs.length){const base=FOGK[F.ty],k=base*(.3+.7*Math.max(DN.night,DN.set,rain?st:0));for(const U of W.fogs){U.k.value=k;U.col.value.copy(F.fog.color).lerp(DN_WHITE,.12*DN.day)}}
// poussière/embruns soulevés par le vaisseau en rase-mottes
if(!FOOT.on&&!S.dead&&ship.visible){const gy=F.h(S.pos.x,S.pos.z),alt=S.pos.y-Math.max(gy,0);if(alt<24&&S.spd>25&&Math.random()<.8){const k=1-alt/24;for(let i=0;i<2;i++){const x=S.pos.x+rv(8),z=S.pos.z+rv(8);if(gy<0)SPK.emit(x,1.5,z,rv(20),8+Math.random()*16*k,rv(20),.5,.7,.8,.9,.4);else smokePuff(_dv.set(x,Math.max(F.h(x,z),0)+1,z),_dv2.set(rv(12),2+k*4,rv(12)),5+k*5,1.2,F.ty=='Glacée'?0xdde8f0:F.ty=='Volcanique'?0x2a2220:F.ty=='Désertique'?0xc0956a:0x7a6a58)}}}
// traces de pas et poussière du jetpack
updFoot2(dt,F)};
// ----- traces de pas -----
const FPG=new THREE.PlaneGeometry(.22,.38).rotateX(-Math.PI/2),FPS=[];let FPi=0,FPstep=0;
function footprint(F,p,yaw){let q=FPS[FPi];if(!q){q={m:new THREE.Mesh(FPG,new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4})),l:0};FPS[FPi]=q}FPi=(FPi+1)%(DESK?90:50);
if(q.m.parent!==SURF.scene)SURF.scene.add(q.m);q.m.position.set(p.x,F.h(p.x,p.z)+.03,p.z);q.m.rotation.y=yaw;q.m.material.color.setHex(F.ty=='Glacée'?0x6a7a8c:F.ty=='Désertique'?0x5a3a1c:0x1a1410);q.l=30;q.m.visible=true}
function updFoot2(dt,F){for(const q of FPS){if(!q||q.l<=0)continue;q.l-=dt;q.m.material.opacity=Math.min(1,q.l/8)*(F.ty=='Glacée'||F.ty=='Désertique'?.42:.22);if(q.l<=0)q.m.visible=false}
if(!FOOT.on||!FOOT.model)return;const u=FOOT.model.userData,sp=Math.hypot(FOOT.vel.x,FOOT.vel.z);
if(FOOT.grounded&&sp>.8){const s=Math.floor(FOOT.ph/Math.PI);if(s!==FPstep){FPstep=s;const L=u.legs[s&1].ft;L.getWorldPosition(_dv);footprint(F,_dv,FOOT.yaw);if(sp>7&&Math.random()<.5)smokePuff(_dv.setY(_dv.y+.2),_dv2.set(rv(1),.8,rv(1)),.8,.8,F.ty=='Glacée'?0xe8f0f8:0x9a8670)}}
// jetpack près du sol : souffle circulaire
const gy=F.h(FOOT.pos.x,FOOT.pos.z),alt=FOOT.pos.y-gy;if(!FOOT.grounded&&FOOT.vy>2&&alt<5&&Math.random()<.7){const a=Math.random()*TAU;smokePuff(_dv.set(FOOT.pos.x+Math.cos(a)*.6,gy+.3,FOOT.pos.z+Math.sin(a)*.6),_dv2.set(Math.cos(a)*7,1,Math.sin(a)*7),1.4,.9,F.ty=='Glacée'?0xe8f0f8:0x9a8670)}
if(FOOT.grounded&&!FOOT.wasG&&(FOOT.lastVy||0)<-6)for(let i=0;i<10;i++){const a=i/10*TAU;smokePuff(_dv.set(FOOT.pos.x+Math.cos(a)*.5,gy+.2,FOOT.pos.z+Math.sin(a)*.5),_dv2.set(Math.cos(a)*5,.6,Math.sin(a)*5),1.2,1,F.ty=='Glacée'?0xe8f0f8:0x9a8670)}
FOOT.wasG=FOOT.grounded;FOOT.lastVy=FOOT.vy}
// voile de tempête plein écran (sable, neige, cendres)
const _wxOv=overlay;overlay=function(){_wxOv();if(mode!='surf'||!GR||!GR.F||!GR.F.W)return;const F=GR.F,st=F.storm,lv=.25+.75*DN.day;let c=null,a=0;if(F.wx=='sable'){c=[200,150,90];a=.24*st}else if(F.wx=='neige'){c=[235,240,250];a=.12*st}else if(F.wx=='cendres'){c=[60,40,30];a=.16*st}
if(c&&a>.01&&!FOOT.drag){OX.fillStyle=`rgba(${c[0]*lv|0},${c[1]*lv|0},${c[2]*lv|0},${a})`;OX.fillRect(0,0,innerWidth,innerHeight)}};
