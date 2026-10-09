// ===== VAISSEAU 3 : livrées (motifs, numéro, métal brossé, usure), dégâts qui restent sur la coque, impacts selon la matière, pilote visible, cockpit vivant (mains, pluie et reflets sur la verrière), radar holographique, écran qui grésille =====
const SP3={a:new V3(),b:new V3(),m:new THREE.Matrix4(),col:new THREE.Color(),roots:new Set()};
// ---------- #17 livrées : nouvel emplacement de l'Atelier ----------
PARTS.livery={n:'Motifs',ic:'🖌',o:{std:{n:'Sans motif',p:0,d:'Peinture unie.'},bandes:{n:'Bandes de course',p:600,d:'Deux bandes sur le dessus et ton numéro sur les ailes.',pat:1},flammes:{n:'Flammes',p:900,d:'Des flammes qui partent du nez.',pat:2},camo:{n:'Camouflage',p:700,d:'Taches aux couleurs de ta peinture.',pat:3},digital:{n:'Camouflage numérique',p:1000,d:'Des pixels, façon chasseur furtif.',pat:4},tigre:{n:'Rayures de tigre',p:1000,d:'Rayures sombres sur toute la coque.',pat:5},brosse:{n:'Métal brossé',p:1400,d:'Coque en métal poli qui accroche la lumière.',pat:6},veteran:{n:'Vétéran',p:500,d:'Peinture écaillée par mille combats.',pat:7}}};
if(!PSLOTS.includes('livery'))PSLOTS.push('livery');try{applyPerks()}catch(e){}
const DM3={s:Array.from({length:12},()=>new THREE.Vector4(0,0,0,0)),h:new Array(12).fill(0),i:0,lastP:null,lastT:-9};
const NUM3={};function num3Tex(n){if(NUM3[n])return NUM3[n];const c=mkC(128,64),g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,128,64);g.fillStyle='#fff';g.font="700 54px 'Chakra Petch',system-ui";g.textAlign='center';g.textBaseline='middle';g.fillText(n,64,34);const t=new THREE.CanvasTexture(c);NUM3[n]=t;return t}
const SHP3_V='varying vec3 vS3P;varying vec3 vS3N;uniform mat4 s3Inv;\n';
const SHP3_F=`varying vec3 vS3P;varying vec3 vS3N;uniform float s3Pat;uniform vec3 s3Col;uniform sampler2D s3Num;uniform vec4 s3D[12];uniform float s3H[12];
float s3h(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
float s3n(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(s3h(i),s3h(i+vec3(1,0,0)),f.x),mix(s3h(i+vec3(0,1,0)),s3h(i+vec3(1,1,0)),f.x),f.y),mix(mix(s3h(i+vec3(0,0,1)),s3h(i+vec3(1,0,1)),f.x),mix(s3h(i+vec3(0,1,1)),s3h(i+vec3(1,1,1)),f.x),f.y),f.z);}
`;
const SHP3_PAT=`{vec3 sp=vS3P;float pt=s3Pat;
if(pt>.5){if(pt<1.5){float m=step(abs(abs(sp.x)-.45),.16)*step(.2,sp.y)*step(abs(sp.x),2.);diffuseColor.rgb=mix(diffuseColor.rgb,s3Col,m);
if(vS3N.y>.4&&abs(sp.x)>3.4&&abs(sp.x)<7.){vec2 u=vec2((abs(sp.x)-3.4)/3.6,(sp.z+.4)/2.6);if(u.y>0.&&u.y<1.){float tx=texture2D(s3Num,vec2(sp.x>0.?1.-u.x:u.x,u.y)).r;diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.96),tx);}}}
else if(pt<2.5){float u=(sp.z+9.6)/12.;float w=sin(abs(sp.x)*1.6+sp.y*3.)*.12+sin(abs(sp.x)*4.3-sp.y*2.)*.07+sin(sp.y*9.+abs(sp.x)*1.5)*.04;float f=smoothstep(.03,0.,u-(.55+w-abs(sp.x)*.035));vec3 fc=mix(vec3(1.,.92,.3),vec3(.95,.18,.04),clamp(u*2.,0.,1.));diffuseColor.rgb=mix(diffuseColor.rgb,fc,f);}
else if(pt<3.5){float n=s3n(sp*.42)*.7+s3n(sp*1.2+3.)*.3;diffuseColor.rgb=n<.42?diffuseColor.rgb*.5:n<.62?diffuseColor.rgb:mix(diffuseColor.rgb,s3Col,.55);}
else if(pt<4.5){vec3 q=floor(sp*vec3(1.7,1.7,1.4));float n=s3h(q)*.6+s3n(sp*.35)*.4;diffuseColor.rgb=n<.38?diffuseColor.rgb*.45:n<.66?diffuseColor.rgb*.8:mix(diffuseColor.rgb,s3Col,.4);}
else if(pt<5.5){float s=sin(sp.z*2.7+s3n(sp*.9)*3.2+abs(sp.x)*.8);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.06,.05,.05),smoothstep(.5,.7,s));}
else if(pt<6.5){float st=s3h(vec3(floor(sp.y*46.+sp.x*3.),0.,0.));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.8,.82,.86),.6)*(.88+.18*st);}
else{float n=s3n(sp*1.8)*.6+s3n(sp*5.2)*.4;diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.56,.57,.6),smoothstep(.6,.66,n));diffuseColor.rgb*=.8+.2*s3n(sp*9.);}}
float burn=0.,hot=0.;for(int i=0;i<12;i++){vec4 d=s3D[i];if(d.w>0.){float r=distance(sp,d.xyz)/d.w;float n=s3n(sp*4.+float(i));burn=max(burn,smoothstep(1.05,.2,r+n*.35));hot=max(hot,s3H[i]*smoothstep(.6,.1,r+n*.25));}}
diffuseColor.rgb*=1.-burn*.85;totalEmissiveRadiance+=vec3(1.,.36,.06)*hot*2.2;}`;
function shp3Patch(mat,U){if(!mat||mat.userData.s3)return;mat.userData.s3=1;const prev=mat.onBeforeCompile;mat.onBeforeCompile=(sh,r)=>{if(prev&&prev!==THREE.Material.prototype.onBeforeCompile)try{prev(sh,r)}catch(e){}Object.assign(sh.uniforms,U);
sh.vertexShader=SHP3_V+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvS3P=(s3Inv*modelMatrix*vec4(transformed,1.)).xyz;vS3N=normalize(mat3(s3Inv*modelMatrix)*objectNormal);');
sh.fragmentShader=SHP3_F+sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n'+SHP3_PAT);if(sh.fragmentShader.indexOf('#include <roughnessmap_fragment>')>=0)sh.fragmentShader=sh.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nif(s3Pat>5.5&&s3Pat<6.5)roughnessFactor=min(roughnessFactor,.2);')};
const pk=prev&&prev!==THREE.Material.prototype.onBeforeCompile?String(prev).length:'';mat.customProgramCacheKey=()=>'s3'+pk;mat.needsUpdate=true}
function shp3Apply(root,P){const ud=root&&root.userData;if(!ud||!ud.mats||ud.s3U)return;const lv=PARTS.livery.o[(P||{}).livery]||PARTS.livery.o.std,pc=(()=>{try{const pp=PARTS.paint.o[(P||{}).paint];return pp&&pp.c?pp.c[1]:0xff8a2a}catch(e){return 0xff8a2a}})();
const num=String(GX('num',0)||((G.x.num=10+Math.floor(Math.random()*89)),G.x.num)).padStart(2,'0');
const Z=()=>({s3D:{value:Array.from({length:12},()=>new THREE.Vector4())},s3H:{value:new Array(12).fill(0)}});
const mk=(pat)=>Object.assign({s3Inv:{value:new THREE.Matrix4()},s3Pat:{value:pat},s3Col:{value:new THREE.Color(pc)},s3Num:{value:num3Tex(num)}},Z());
const UP=mk(lv.pat||0),UD=mk(0);UD.s3Inv=UP.s3Inv;UD.s3D=UP.s3D;UD.s3H=UP.s3H;ud.s3U=UP;
const M=ud.mats;shp3Patch(M.hull,UP);shp3Patch(M.wing,UP);shp3Patch(M.dark,UD);shp3Patch(M.accent,UD);SP3.roots.add(root);
// verrière transparente + pilote
root.traverse(o=>{if(o.isMesh&&o.material===MAT.glass){if(!SP3.glass){SP3.glass=MAT.glass.clone();SP3.glass.transparent=true;SP3.glass.opacity=.42;SP3.glass.depthWrite=false}o.material=SP3.glass;o.renderOrder=2}});
if(ud.body&&!ud.pilot){const g=new THREE.Group(),suit=new THREE.MeshStandardMaterial({color:0xd9dde4,roughness:.6}),vis=new THREE.MeshStandardMaterial({color:0x332211,emissive:0xffa040,emissiveIntensity:.35,metalness:.9,roughness:.15});
const hm=new THREE.Mesh(new THREE.SphereGeometry(.3,16,12),suit);hm.position.y=.32;g.add(hm);const vz=new THREE.Mesh(new THREE.SphereGeometry(.31,16,10,-Math.PI*.35,Math.PI*.7,Math.PI*.3,Math.PI*.36),vis);vz.position.y=.32;vz.rotation.y=Math.PI;g.add(vz);
const sh=new THREE.Mesh(new THREE.BoxGeometry(.8,.28,.4),new THREE.MeshStandardMaterial({color:0xe0742a,roughness:.7}));sh.position.y=-.05;g.add(sh);g.position.set(0,.92,-3.0);ud.body.add(g);ud.pilot=g}}
{const _bs3=buildShip;buildShip=function(P,l){const r=_bs3(P,l);try{shp3Apply(r,P||G.parts||{})}catch(e){console.warn(e)}return r}}
{const _rs3=rebuildShip;rebuildShip=function(){_rs3();try{const U=ship.userData.s3U;if(U){U.s3D.value=DM3.s;U.s3H.value=DM3.h}}catch(e){}}}
try{shp3Apply(ship,G.parts||{});const U=ship.userData.s3U;if(U){U.s3D.value=DM3.s;U.s3H.value=DM3.h}}catch(e){}
// ---------- #14 dégâts qui restent jusqu'à la réparation ----------
{const sv=GX('dmg',[]);if(Array.isArray(sv))sv.slice(-12).forEach((d,i)=>{DM3.s[i].set(d[0],d[1],d[2],d[3]);DM3.h[i]=0;DM3.i=(i+1)%12})}
function dm3Add(n){let lp=null;if(DM3.lastP&&t-DM3.lastT<.25){lp=SP3.a.copy(DM3.lastP);ship.updateMatrixWorld(true);ship.worldToLocal(lp)}
if(!lp||lp.length()>12){const w=Math.random()<.45;lp=SP3.a.set(w?(Math.random()<.5?-1:1)*(2.2+Math.random()*5):rv(1.2),w?-.2:rv(.7)+.2,w?Math.random()*3.6-1:-8.5+Math.random()*13)}
const i=DM3.i;DM3.i=(i+1)%12;DM3.s[i].set(lp.x,lp.y,lp.z,clamp(.7+n*.05,.7,2.3));DM3.h[i]=1;const sv=[];for(const v of DM3.s)if(v.w>0)sv.push([+v.x.toFixed(2),+v.y.toFixed(2),+v.z.toFixed(2),+v.w.toFixed(2)]);G.x.dmg=sv}
{const _dm3=damage;damage=function(n,kind){const a=S.hp;_dm3(n,kind);if(S.hp<a-.3&&mode!='int'&&!FOOT.on){try{dm3Add(a-S.hp);GL3.v=Math.min(1,GL3.v+.5+(a-S.hp)/25)}catch(e){}}}}
function dm3Tick(dt){for(let i=0;i<12;i++)if(DM3.h[i]>0)DM3.h[i]=Math.max(0,DM3.h[i]-dt/18);if(S.hp>=maxhp()-.01&&DM3.s.some(v=>v.w>0)){for(const v of DM3.s)v.set(0,0,0,0);DM3.h.fill(0);G.x.dmg=[]}
for(const r of SP3.roots){if(!r.parent&&r!==ship){if((r.userData.s3gone=(r.userData.s3gone||0)+dt)>5)SP3.roots.delete(r);continue}r.updateMatrixWorld();r.userData.s3U.s3Inv.value.copy(r.matrixWorld).invert()}}
// ---------- #16 impacts selon la matière ----------
function mat3FX(p,kind){const E=(n,sp,life,r,g,b,dr,up=0)=>{for(let i=0;i<n;i++){const v=SP3.b.set(rv(1),rv(1)+up,rv(1)).normalize().multiplyScalar(sp*(.4+Math.random()));SPK.emit(p.x,p.y,p.z,v.x,v.y,v.z,life*(.6+Math.random()*.6),r,g,b,dr)}};
const puff=(col,sz,l)=>{const s=fxSprite(SMOKET,THREE.NormalBlending,col,0);s.position.copy(p);s.scale.setScalar(1);s.material.rotation=Math.random()*TAU;curScene().add(s);FXL.push({o:s,k:'smoke',l,ml:l,sz,v:new V3(rv(2),2+Math.random()*3,rv(2)),d:0,sp:rv(.6)})};
if(kind=='metal'){E(14,90,.35,1,.9,.55,.82);E(4,28,.9,1,.45,.12,.95)}
else if(kind=='rock'){E(10,34,1.1,.5,.42,.34,.95,.4);puff(mode=='surf'?0x8a7a66:0x4a4440,5,1.4)}
else if(kind=='ice'){E(12,40,1,.75,.9,1,.95,.3);puff(0xe8f4ff,6,.9)}
else if(kind=='sand'){E(16,30,1.2,.85,.7,.45,.9,.8);puff(0xc8a070,8,1.8)}
else if(kind=='water'){E(16,26,1.1,.85,.93,1,.92,2.2);if(typeof wa3Spawn=='function')wa3Spawn(p.x,p.z,2,9,1.6)}
else if(kind=='lava'){E(14,30,1.3,1,.45,.1,.92,1.2)}}
function mat3Kind(p){if(mode=='int')return 'metal';if(mode=='surf'){for(const T of(SURF.extra?SURF.extra():[]))if(T&&T.pos&&T.pos.distanceTo&&T.pos.distanceTo(p)<(T.r||6)+4)return 'metal';const gy=SURF.height(p.x,p.z);if(p.y-gy<4){const ty=GR&&GR.F?GR.F.ty:'';if(gy<0&&p.y<2.5&&ty!='Glacée'&&ty!='Volcanique')return 'water';return ty=='Glacée'?'ice':ty=='Désertique'?'sand':ty=='Volcanique'?(gy<0?'lava':'rock'):'rock'}return 'metal'}
for(const A of asts){const r=A.r*1.2+4;if(Math.abs(A.pos.x-p.x)<r&&A.pos.distanceTo(p)<r)return A.fk=='ice'?'ice':A.fk=='metal'?'metal':'rock'}return 'metal'}
{const _if3=impactFX;impactFX=function(p,col,k){_if3(p,col,k);try{if(!p)return;if(mode!='int'&&!FOOT.on&&ship.position.distanceTo(p)<20){DM3.lastP=p.clone();DM3.lastT=t;if((S.sh||0)>0)return}mat3FX(p,mat3Kind(p))}catch(e){}}}
// les tirs touchent aussi le sol des planètes
function pb3Ground(){if(mode!='surf')return;for(const b of PB){if(b.l<=0)continue;const gy=SURF.height(b.p.x,b.p.z);if(b.p.y<Math.max(gy,gy<0?0:gy)+.3){b.l=.0001;impactFX(b.p.clone(),b.c,.6)}}}
// ---------- #19 cockpit vivant : mains sur les commandes ----------
function ck3Hands(g,asp,fov){if(!CK.stick||!CK.thr)return;const hH=Math.tan(fov*Math.PI/360),hW=hH*asp,por=asp<1,glove=new THREE.MeshStandardMaterial({color:0x2a2c30,roughness:.8}),suit=new THREE.MeshStandardMaterial({color:0xe0742a,roughness:.75}),cuff=new THREE.MeshStandardMaterial({color:0xd9dde4,roughness:.6}),metal=new THREE.MeshStandardMaterial({color:0x3a3f48,metalness:.7,roughness:.35});
const hand=(parent,y,side,k)=>{const h=new THREE.Group();h.position.set(0,y,.005);h.scale.setScalar(k);parent.add(h);const palm=new THREE.Mesh(new THREE.BoxGeometry(.062,.05,.058),glove);h.add(palm);for(let i=0;i<4;i++){const f=new THREE.Mesh(new THREE.BoxGeometry(.012,.014,.05),glove);f.position.set(-.022+i*.015,.012-i*.003,-.04);f.rotation.x=.9;h.add(f)}const th=new THREE.Mesh(new THREE.BoxGeometry(.014,.04,.014),glove);th.position.set(side*.036,.03,-.012);th.rotation.z=side*-.5;h.add(th);
const dir=new V3(side*.09,-.22,.32),L=dir.length(),arm=new THREE.Mesh(new THREE.CylinderGeometry(.03,.038,L,10).translate(0,L/2,0),suit);arm.quaternion.setFromUnitVectors(new V3(0,1,0),dir.clone().normalize());arm.position.set(0,-.01,.02);h.add(arm);
const cf=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.03,10),cuff);cf.quaternion.copy(arm.quaternion);cf.position.copy(dir).multiplyScalar(.1/L).add(arm.position);h.add(cf);return h};
const z=-.62,k=por?.8:1.2,ex=por?.92:.7,ey=por?.97:.86;
// manche latéral (droite) qui suit les commandes, main posée dessus
const rs=new THREE.Group();rs.position.set(hW*-z*ex,-hH*-z*ey,z);g.add(rs);const base=new THREE.Mesh(new THREE.BoxGeometry(.09,.03,.09),metal);base.scale.setScalar(k);rs.add(base);const piv=new THREE.Group();rs.add(piv);const sh=new THREE.Mesh(new THREE.CylinderGeometry(.008,.011,.09,8).translate(0,.045,0),metal);sh.scale.setScalar(k);piv.add(sh);hand(piv,.1*k,1,k);CK.rs=piv;
// manette des gaz (gauche) ramenée dans le champ de vision
const th=CK.thr.parent;if(th&&th!==g){th.position.set(-hW*-z*ex,-hH*-z*ey,z);th.scale.setScalar(k)}hand(CK.thr,.1,-1,1);
g.traverse(o=>{o.frustumCulled=false})}
// ---------- #20 radar holographique ----------
const HO3={g:null,pts:null,max:48};
function ho3Build(g,asp,fov){const hH=Math.tan(fov*Math.PI/360),hW=hH*asp,por=asp<1,z=-.85,G2=new THREE.Group();G2.position.set(-hW*-z*(por?.5:.3),-hH*-z*(por?.2:.24),z);G2.rotation.x=.45;g.add(G2);const R=hH*(por?.13:.15);
const rm=new THREE.ShaderMaterial({uniforms:{tm:TM,gl:{value:0}},vertexShader:'varying vec2 vUv;varying vec3 vP;void main(){vUv=uv;vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float tm,gl;varying vec2 vUv;varying vec3 vP;void main(){float r=length(vUv-.5)*2.;float ring=smoothstep(.07,.0,abs(fract(r*3.+.5)-.5))*step(r,1.);float sw=fract(atan(vP.z,vP.x)/6.2831-tm*.25);float s=pow(sw,12.)*.7;float scan=.75+.25*sin(vP.y*400.+tm*8.);float fl=1.-gl*step(.5,fract(sin(tm*90.)*43758.));gl_FragColor=vec4(vec3(.3,.9,1.)*(ring*.75+s*.8+.015)*scan*fl,1.);}',transparent:true,blending:ADDB,depthWrite:false,side:THREE.DoubleSide});
const disc=new THREE.Mesh(new THREE.CircleGeometry(R,48).rotateX(-Math.PI/2),rm);G2.add(disc);const dome=new THREE.Mesh(new THREE.SphereGeometry(R,24,8,0,TAU,0,Math.PI/2),new THREE.MeshBasicMaterial({color:0x40c8ff,wireframe:true,transparent:true,opacity:.045,blending:ADDB,depthWrite:false}));G2.add(dome);
const pos=new Float32Array(HO3.max*3),col=new Float32Array(HO3.max*3),pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));pg.setAttribute('color',new THREE.BufferAttribute(col,3));const pts=new THREE.Points(pg,new THREE.PointsMaterial({map:GLOW,size:R*.16,vertexColors:true,transparent:true,blending:ADDB,depthWrite:false}));G2.add(pts);
const me=new THREE.Mesh(new THREE.ConeGeometry(R*.05,R*.14,6).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x9ff0ff}));G2.add(me);G2.traverse(o=>{o.frustumCulled=false;o.renderOrder=5});HO3.g=G2;HO3.pts=pts;HO3.R=R;HO3.rm=rm}
function ho3Tick(){if(CK.rs&&CK.stick){CK.rs.rotation.x=CK.stick.rotation.x*.8;CK.rs.rotation.z=CK.stick.rotation.z*.8}if(!HO3.g||!HO3.g.parent||!ckActive())return;const R=HO3.R,P=HO3.pts.geometry.attributes.position,C=HO3.pts.geometry.attributes.color,q=SP3.q||(SP3.q=new QT());q.copy(S.q).invert();let n=0;const RG=2200;
const put=(p,r,g,b)=>{if(n>=HO3.max)return;const l=SP3.a.copy(p).sub(S.pos);const d=l.length();if(d>RG)return;l.applyQuaternion(q).multiplyScalar(R/RG);P.setXYZ(n,l.x,clamp(l.y,-R*.3,R),l.z);C.setXYZ(n,r,g,b);n++};
for(const e of en)if(!e.dead&&!e.cloaked)put(e.pos,1,.3,.25);for(const s of stations)if(s.mesh)put(s.mesh.position,1,.8,.3);if(typeof FR!='undefined')for(const f of FR)if(f&&f.pos&&!f.dead)put(f.pos,.3,1,.5);for(const A of asts){if(n>=HO3.max-6)break;put(A.pos,.35,.4,.45)}
for(let i=n;i<HO3.max;i++){P.setXYZ(i,0,-99,0);C.setXYZ(i,0,0,0)}P.needsUpdate=true;C.needsUpdate=true;HO3.rm.uniforms.gl.value=GL3.v;HO3.g.visible=!(GL3.v>.3&&Math.random()<GL3.v*.5)}
{const _bc3=buildCockpit;buildCockpit=function(asp,fov,ud){const g=_bc3(asp,fov,ud);try{ck3Hands(g,asp,fov)}catch(e){console.warn(e)}try{ho3Build(g,asp,fov)}catch(e){console.warn(e)}return g}}
// ---------- #19 pluie et reflets sur la verrière, #20 écran qui grésille ----------
const GL3={v:0};const RN3={d:[],t:0};
function rn3Tick(dt){const ck=ckActive();if(!ck){RN3.d.length=0;return}const F=GR&&GR.F,rain=mode=='surf'&&F&&(F.wx=='pluie'||F.wx=='neige')?clamp((F.storm||0)*1.3+.15,0,1):0,W=innerWidth,H=innerHeight;
if(rain>0){RN3.t-=dt;while(RN3.t<=0&&RN3.d.length<70){RN3.t+=.035/rain;RN3.d.push({x:Math.random()*W,y:Math.random()*H*.85,r:2+Math.random()*5,vy:0,l:3+Math.random()*4,snow:F.wx=='neige'})}}
const sp=clamp(S.spd/150,0,2);for(let i=RN3.d.length-1;i>=0;i--){const d=RN3.d[i];d.l-=dt;if(d.snow){d.r=Math.max(.5,d.r-dt*.4)}else{const dx=d.x-W/2,dy=d.y-H*.45,dl=Math.hypot(dx,dy)||1,v=sp*(60+dl*.35);d.vx=dx/dl*v;d.vy=dy/dl*v+(sp<.3?(d.r>4?30:8):0);d.x+=d.vx*dt;d.y+=d.vy*dt}if(d.l<=0||d.y>H+10||d.y<-10||d.x<-10||d.x>W+10)RN3.d.splice(i,1)}}
function rn3Draw(){const W=innerWidth,H=innerHeight;OX.save();
// reflets sur la verrière (bandes douces qui bougent avec la lumière)
const sx=FL3&&FL3.v>.01?FL3.x:W*.3,a0=.05+(FL3?FL3.v*.06:0);OX.globalCompositeOperation='lighter';for(let i=0;i<2;i++){const x=W*(.15+i*.55)+(sx-W/2)*.15,g=OX.createLinearGradient(x-W*.12,0,x+W*.12,H);g.addColorStop(0,'rgba(200,230,255,0)');g.addColorStop(.5,`rgba(200,230,255,${a0*(i?.6:1)})`);g.addColorStop(1,'rgba(200,230,255,0)');OX.fillStyle=g;OX.beginPath();OX.moveTo(x-W*.05,0);OX.lineTo(x+W*.03,0);OX.lineTo(x+W*.2,H);OX.lineTo(x+W*.08,H);OX.closePath();OX.fill()}
OX.globalCompositeOperation='source-over';
for(const d of RN3.d){const a=clamp(d.l,0,1);if(d.snow){OX.fillStyle=`rgba(240,248,255,${.7*a})`;OX.beginPath();OX.arc(d.x,d.y,d.r,0,TAU);OX.fill();continue}
const vv=Math.hypot(d.vx||0,d.vy||0);if(vv>30){OX.strokeStyle=`rgba(200,220,240,${.28*a})`;OX.lineWidth=d.r*.7;OX.beginPath();OX.moveTo(d.x-(d.vx||0)*.08,d.y-(d.vy||0)*.08);OX.lineTo(d.x,d.y);OX.stroke()}
const g=OX.createRadialGradient(d.x-d.r*.3,d.y-d.r*.3,0,d.x,d.y,d.r);g.addColorStop(0,`rgba(255,255,255,${.55*a})`);g.addColorStop(.5,`rgba(150,175,200,${.18*a})`);g.addColorStop(1,`rgba(20,30,40,${.35*a})`);OX.fillStyle=g;OX.beginPath();OX.arc(d.x,d.y,d.r,0,TAU);OX.fill()}OX.restore()}
function gl3Draw(){const W=innerWidth,H=innerHeight,v=GL3.v;OX.save();for(let i=0;i<Math.round(4+v*10);i++){const y=Math.random()*H,h=2+Math.random()*16*v,c=Math.random();OX.fillStyle=c<.33?`rgba(255,60,80,${.18*v})`:c<.66?`rgba(60,230,255,${.18*v})`:`rgba(255,255,255,${.12*v})`;OX.fillRect(rv(30*v),y,W,h)}
OX.fillStyle=`rgba(0,0,0,${.12*v})`;for(let y=Math.random()*4;y<H;y+=4)OX.fillRect(0,y,W,1);OX.restore()}
{const _ov3s=overlay;overlay=function(){_ov3s();try{if(ckActive()&&mode!='int')rn3Draw();if(GL3.v>.03)gl3Draw()}catch(e){}}}
function gl3Tick(dt){const was=GL3.v>.03;GL3.v=Math.max(0,GL3.v-dt*2.2);const on=GL3.v>.08,h=$('hud');if(h&&on!==GL3.on){GL3.on=on;h.classList.toggle('glitch',on)}}
TICK.push(dt=>{try{dm3Tick(dt);pb3Ground();rn3Tick(dt);ho3Tick();gl3Tick(dt)}catch(e){console.warn(e)}});
