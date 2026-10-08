// ===== MODÈLES DÉTAILLÉS (remplacent les modèles simples) =====
const PLASMA_FS=`uniform float k,tm;varying vec3 vNV;varying vec3 vN;varying vec3 vP;
void main(){float f=pow(1.-abs(vNV.z),2.4);float fl=.55+.45*sin(vP.z*7.+tm*38.+sin(vP.x*9.+tm*21.)*2.5+sin(vP.y*8.-tm*13.));float front=smoothstep(.1,-.9,vP.z);float tail=smoothstep(-.2,1.,vP.z);
vec3 c=mix(vec3(1.,.22,.04),vec3(1.,.7,.3),front);float I=(f*(.4+front*.8)*fl+front*front*.25)*(1.-tail*.7);gl_FragColor=vec4(c*I*k*1.1,1.);}`;
const PLASMA_VS=`varying vec3 vNV;varying vec3 vN;varying vec3 vP;void main(){vP=position;vNV=normalize(normalMatrix*normal);vN=normal;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const PLU={k:{value:0},tm:TM};
function lathe(pts,seg,rotX=Math.PI/2){const g=new THREE.LatheGeometry(pts.map(([r,y])=>new THREE.Vector2(r,y)),seg);g.rotateX(rotX);return g}
function panelTex(base,line,w=256,h=128,seed=5){const c=mkC(w,h),g=c.getContext('2d'),r=rng(seed);g.fillStyle=base;g.fillRect(0,0,w,h);g.strokeStyle=line;g.lineWidth=1;
for(let i=0;i<26;i++){const x=r()*w,y=r()*h,ww=20+r()*60,hh=10+r()*30;g.globalAlpha=.25+r()*.35;g.strokeRect(x,y,ww,hh)}g.globalAlpha=.08;for(let i=0;i<40;i++){g.fillStyle=r()<.5?'#000':'#fff';g.fillRect(r()*w,r()*h,4+r()*20,2+r()*6)}
g.globalAlpha=1;const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
const HULLT=panelTex('#ffffff','#2a3440');
function buildShip(){const[wl,el,hl]=G.u,tier=hl>=5?2:hl>=3?1:0,HC=HULLC[tier];const root=new THREE.Group(),body=new THREE.Group();root.add(body);
const hull=new THREE.MeshStandardMaterial({color:HC[0],map:HULLT,metalness:DESK?.72:.25,roughness:DESK?.3:.4,emissive:HC[0],emissiveIntensity:DESK?.03:.08}),
dark=new THREE.MeshStandardMaterial({color:0x2a3038,metalness:.6,roughness:.45}),wingM=new THREE.MeshStandardMaterial({color:HC[1],map:HULLT,metalness:DESK?.68:.25,roughness:DESK?.34:.45,side:THREE.DoubleSide,emissive:HC[1],emissiveIntensity:DESK?.02:.06}),
accent=new THREE.MeshStandardMaterial({color:tier==2?0x1a1a1a:0xff8a2a,emissive:tier==2?0:0x552200,metalness:.4,roughness:.4});
hull.name='hull';wingM.name='wing';
// fuselage profilé
const fus=new THREE.Mesh(lathe([[0,-9.5],[.35,-8.6],[.85,-6.8],[1.3,-4.5],[1.6,-2],[1.7,.5],[1.6,3],[1.35,4.6],[1.1,5.2],[0,5.3]],18),hull);fus.scale.set(1,.72,1);body.add(fus);
for(const z of[-4.2,-.6,2.6]){const b=new THREE.Mesh(new THREE.TorusGeometry(z<-3?1.32:1.67,.06,4,24),dark);b.scale.set(1,.72,1);b.position.z=z;body.add(b)}
// bande décorative
const stripe=new THREE.Mesh(new THREE.BoxGeometry(.5,.06,9),accent);stripe.position.set(0,1.2,-.6);body.add(stripe);
// verrière + armature
const cp=new THREE.Mesh(new THREE.SphereGeometry(1,24,16,0,TAU,0,Math.PI/2),MAT.glass);cp.scale.set(.85,.75,2.4);cp.position.set(0,.85,-3.3);body.add(cp);
const fr=new THREE.Mesh(new THREE.TorusGeometry(1,.07,6,24,Math.PI),dark);fr.scale.set(.86,.76,1);fr.position.set(0,.85,-3.3);body.add(fr);const fr2=fr.clone();fr2.rotation.y=Math.PI/2;fr2.scale.set(2.4,.76,1);body.add(fr2);
// entrées d'air
for(const s of[-1,1]){const ia=new THREE.Mesh(new THREE.BoxGeometry(.9,.9,3.2),hull);ia.position.set(s*1.75,-.15,.4);body.add(ia);const ii=new THREE.Mesh(new THREE.BoxGeometry(.7,.7,.2),new THREE.MeshBasicMaterial({color:0x05070a}));ii.position.set(s*1.75,-.15,-1.22);body.add(ii)}
// ailes biseautées
const ws=new THREE.Shape();ws.moveTo(0,-3.2);ws.lineTo(2.5,-1.4);ws.lineTo(6.8,1.6);ws.lineTo(7.1,2.9);ws.lineTo(5.6,3.1);ws.lineTo(1.8,2.6);ws.lineTo(0,2.8);ws.closePath();
const wg=new THREE.ExtrudeGeometry(ws,{depth:.22,bevelEnabled:true,bevelThickness:.08,bevelSize:.12,bevelSegments:2});wg.rotateX(Math.PI/2);wg.translate(1.4,0,0);
for(const s of[-1,1]){const w=new THREE.Mesh(wg,wingM);w.scale.x=s;w.position.set(0,-.25,.9);w.rotation.z=s*-.06;body.add(w);
const ac=new THREE.Mesh(new THREE.BoxGeometry(3.2,.05,.35),accent);ac.position.set(s*5,0,2.2);ac.rotation.y=s*-.62;body.add(ac);
const tip=new THREE.Mesh(new THREE.CylinderGeometry(.22,.22,3.4,8).rotateX(Math.PI/2),dark);tip.position.set(s*8.45,-.25,3);body.add(tip);
const fin=new THREE.Mesh(new THREE.BoxGeometry(.16,2.3,2.4),wingM);fin.geometry.translate(0,1.1,0);fin.position.set(s*1.1,.6,3.4);fin.rotation.set(-.42,0,s*-.32);body.add(fin)}
// antenne et détails
const ant=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,2.2,4),dark);ant.position.set(0,1.6,2.2);ant.rotation.x=-.5;body.add(ant);
for(let i=0;i<5;i++){const gb=new THREE.Mesh(new THREE.BoxGeometry(.3+i%2*.25,.18,.5),dark);gb.position.set((i%2?.45:-.45),1.12,.4+i*.7);body.add(gb)}
if(hl>=3)for(const s of[-1,1]){const ar=new THREE.Mesh(new THREE.BoxGeometry(.25,1.2,4.5),hull);ar.position.set(s*1.55,.25,-1.6);ar.rotation.z=s*.35;body.add(ar)}
// réacteurs
const nE=el>=3?3:2,eC=el>=5?0xc07bff:el>=3?0x78e6ff:0x50aaff,ex=nE==3?[-1.55,0,1.55]:[-1,1],ey=nE==3?[-.15,.55,-.15]:[0,0];const flames=[];
ex.forEach((x,i)=>{const n=new THREE.Mesh(lathe([[.5,-1.6],[.62,-1],[.72,.4],[.8,1.2],[.74,1.4],[.55,1.4]],16),dark);n.position.set(x,ey[i],4.4);body.add(n);
const rg=new THREE.Mesh(new THREE.TorusGeometry(.74,.07,6,20),new THREE.MeshStandardMaterial({color:0x99a4b4,metalness:.9,roughness:.25}));rg.position.set(x,ey[i],5.1);body.add(rg);
const core=new THREE.Mesh(new THREE.CircleGeometry(.56,20),new THREE.MeshBasicMaterial({color:new THREE.Color(eC).multiplyScalar(DESK?1.8:1.2)}));core.position.set(x,ey[i],5.75);body.add(core);
const fl=new THREE.Mesh(new THREE.ConeGeometry(.5,4,12,1,true).rotateX(Math.PI/2),new THREE.MeshBasicMaterial({color:DESK?new THREE.Color(eC).multiplyScalar(1.6):eC,transparent:true,opacity:.85,blending:ADDB,depthWrite:false,side:THREE.DoubleSide}));fl.position.set(x,ey[i],7.8);body.add(fl);
const gs=sprite(eC,3);gs.position.set(x,ey[i],6.1);body.add(gs);flames.push({fl,gs})});
// canons
if(wl>=2)for(const sx of[-1,1]){const c=new THREE.Mesh(lathe([[.24,-3],[.24,1],[.32,1.4],[.32,2],[0,2]],8),MAT.metal);c.position.set(sx*8.45,-.25,-.4);body.add(c);if(wl>=4){const c2=c.clone();c2.position.set(sx*4.4,-.35,-1.2);body.add(c2)}if(wl>=6){const g=sprite(0x5af0ff,2.2);g.position.set(sx*8.45,-.25,-3.5);body.add(g)}}
const nl=sprite(0xff4040,1.6),nr=sprite(0x40ff70,1.6);nl.position.set(-8.5,-.1,4.6);nr.position.set(8.5,-.1,4.6);body.add(nl,nr);
const shield=new THREE.Mesh(new THREE.SphereGeometry(11.5,28,18),new THREE.ShaderMaterial({uniforms:{op:{value:0}},vertexShader:AVS,fragmentShader:'uniform float op;varying vec3 vNV;varying vec3 vN;void main(){float f=pow(1.-abs(vNV.z),2.2);gl_FragColor=vec4(vec3(.35,.8,1.)*f*op*1.6,1.);}',transparent:true,blending:ADDB,depthWrite:false}));root.add(shield);
// plasma d'entrée atmosphérique
const plasma=new THREE.Mesh(new THREE.SphereGeometry(1,32,20),new THREE.ShaderMaterial({uniforms:PLU,vertexShader:PLASMA_VS,fragmentShader:PLASMA_FS,transparent:true,blending:ADDB,depthWrite:false,side:THREE.DoubleSide}));plasma.scale.set(6.5,4.5,13);plasma.position.z=-2;plasma.visible=false;root.add(plasma);
body.traverse(o=>{if(o.isMesh&&!o.material.blending)o.castShadow=DESK&&mode=='surf'});
root.userData={body,flames,shield,nl,nr,plasma};return root}
// ----- pirates -----
const ETEX={};function enemyMat(ty){return ETEX[ty]||(ETEX[ty]=new THREE.MeshStandardMaterial({color:ENC[ty],map:HULLT,metalness:DESK?.55:.25,roughness:.42,emissive:ENC[ty],emissiveIntensity:.1}))}
const EDARK=new THREE.MeshStandardMaterial({color:0x22262c,metalness:.6,roughness:.5}),EGLOW=new THREE.MeshBasicMaterial({color:0xff3a2a});
function buildEnemy(ty){const g=new THREE.Group(),b=new THREE.Group();g.add(b);const m=enemyMat(ty),add=(geo,mat,x,y,z,rx=0,ry=0,rz=0)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);b.add(o);return o};
const engines=[];
if(ty=='chasseur'){add(lathe([[0,-6],[.5,-4],[.8,-1],[.8,2],[.5,3.5],[0,3.6]],10),m,0,0,0);add(new THREE.SphereGeometry(.55,12,8),EGLOW,0,.45,-1.5);
for(let i=0;i<4;i++){const a=i/4*TAU+Math.PI/4,f=add(new THREE.BoxGeometry(4,.14,1.6),m,Math.cos(a)*2,Math.sin(a)*2,2,0,0,a);const gun=add(new THREE.CylinderGeometry(.1,.1,3,5).rotateX(Math.PI/2),EDARK,Math.cos(a)*3.9,Math.sin(a)*3.9,1)}engines.push([0,0,3.8])}
else if(ty=='lourd'){add(new THREE.BoxGeometry(4.4,2.6,8.5),m,0,0,0);add(new THREE.BoxGeometry(3,1.4,3),m,0,1.8,-1.2);add(new THREE.BoxGeometry(3.6,.4,9),EDARK,0,-1.5,0);
add(new THREE.CylinderGeometry(1,1.2,1.2,10),EDARK,0,2.8,.8);add(new THREE.CylinderGeometry(.22,.22,3.4,6).rotateX(Math.PI/2),EDARK,-.4,2.9,-1);add(new THREE.CylinderGeometry(.22,.22,3.4,6).rotateX(Math.PI/2),EDARK,.4,2.9,-1);
for(const s of[-1,1]){add(lathe([[1.1,-4],[1.4,-2.5],[1.4,3],[1,4.2]],12),EDARK,s*3.8,0,0);add(new THREE.BoxGeometry(1.6,.3,3),m,s*2.6,.9,2);engines.push([s*3.8,0,4.4])}
for(let i=0;i<4;i++)add(new THREE.BoxGeometry(.5,.5,.12),EGLOW,-1.2+i*.8,.4,-4.3)}
else if(ty=='boss'){add(new THREE.OctahedronGeometry(6,1),m,0,0,0).scale.set(1,.55,1.9);const r=add(new THREE.TorusGeometry(9,.7,10,40),EDARK,0,0,1,Math.PI/2);
for(let i=0;i<8;i++){const a=i/8*TAU;add(new THREE.ConeGeometry(.6,4,6),m,Math.cos(a)*9.6,Math.sin(a)*.5,1+Math.sin(a)*9.6,Math.PI/2,0,-a+Math.PI/2)}
for(const s of[-1,1]){add(new THREE.BoxGeometry(9,.6,5),m,s*7.5,0,2);add(new THREE.CylinderGeometry(.5,.5,6,8).rotateX(Math.PI/2),EDARK,s*11,0,-.5);engines.push([s*5,0,6.5])}
const core=add(new THREE.SphereGeometry(2,20,14),new THREE.MeshBasicMaterial({color:0xd070ff}),0,1.6,-2);core.add(sprite(0xc060ff,12,.8));engines.push([0,0,10])}
else{add(lathe([[0,-5],[.9,-3],[1.4,0],[1.3,2.5],[.9,3.6],[0,3.7]],6),m,0,0,0).scale.set(1,.6,1);
for(const s of[-1,1]){const w=add(new THREE.BoxGeometry(5.5,.25,2.6),m,s*3,0,1.4,0,s*-.35,s*.18);add(new THREE.ConeGeometry(.3,2.6,5).rotateX(-Math.PI/2),EDARK,s*5.6,.3,-.6);add(new THREE.BoxGeometry(.2,1.6,1.8),m,s*1,.9,2.4,0,0,s*.3)}
add(new THREE.SphereGeometry(.6,12,8),EGLOW,0,.55,-1.4);engines.push([0,0,4])}
for(const[x,y,z]of engines){const n=add(new THREE.CircleGeometry(ty=='boss'?1.6:.8,14),new THREE.MeshBasicMaterial({color:0xff7a3a}),x,y,z);const s=sprite(0xff6a3a,ty=='boss'?14:6);s.position.set(x,y,z+.6);b.add(s)}
const sc=(ty=='boss'?1.6:ty=='lourd'?1.2:1)*1.8;g.scale.setScalar(sc);
const bar=new THREE.Sprite(new THREE.SpriteMaterial({color:ENC[ty],depthWrite:false,transparent:true}));bar.scale.set(10,.7,1);bar.position.y=9;bar.visible=false;g.add(bar);g.userData={body:b,bar};return g}
// ----- station -----
const WINT=(()=>{const c=mkC(128,32),g=c.getContext('2d'),r=rng(77);g.fillStyle='#1a2230';g.fillRect(0,0,128,32);for(let y=4;y<32;y+=9)for(let x=2;x<128;x+=6){if(r()<.62){g.fillStyle=r()<.8?'#ffd890':'#9fd8ff';g.fillRect(x,y,3,4)}}const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;return t})();
const SOLT=(()=>{const c=mkC(64,64),g=c.getContext('2d');g.fillStyle='#0c1c3a';g.fillRect(0,0,64,64);g.strokeStyle='#4a6ea8';g.lineWidth=1;for(let i=0;i<=64;i+=8){g.beginPath();g.moveTo(i,0);g.lineTo(i,64);g.moveTo(0,i);g.lineTo(64,i);g.stroke()}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(4,2);return t})();
function buildStation(){const g=new THREE.Group(),rot=new THREE.Group();g.add(rot);const M=MAT.metal,D=MAT.dark;
const ring=new THREE.Mesh(new THREE.TorusGeometry(60,7,DESK?24:12,DESK?96:48),M);rot.add(ring);
const habM=new THREE.MeshStandardMaterial({color:0xb8c2d0,metalness:.6,roughness:.35,emissive:0xffffff,emissiveMap:WINT,emissiveIntensity:.9,map:WINT});
for(let i=0;i<12;i++){const a=i/12*TAU,h=new THREE.Mesh(new THREE.BoxGeometry(14,9,18),habM);h.position.set(Math.cos(a)*60,Math.sin(a)*60,0);h.rotation.z=a;rot.add(h)}
for(let i=0;i<6;i++){const a=i/6*TAU,sp=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,42,8),D);sp.position.set(Math.cos(a)*34,Math.sin(a)*34,0);sp.rotation.z=a+Math.PI/2;rot.add(sp);
const lat=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,42,4),M);lat.position.set(Math.cos(a+.06)*34,Math.sin(a+.06)*34,3);lat.rotation.z=a+Math.PI/2;rot.add(lat)}
// colonne centrale + quais
const spine=new THREE.Mesh(lathe([[10,-70],[14,-60],[14,-30],[20,-22],[20,22],[14,30],[14,60],[8,72]],20,0),M);spine.rotation.x=Math.PI/2;g.add(spine);
const hub=new THREE.Mesh(new THREE.SphereGeometry(22,24,16),M);g.add(hub);
for(const z of[-50,50]){const dk=new THREE.Mesh(new THREE.TorusGeometry(16,1.6,8,32),D);dk.position.z=z;g.add(dk);for(let i=0;i<4;i++){const a=i/4*TAU,arm=new THREE.Mesh(new THREE.BoxGeometry(3,3,26),D);arm.position.set(Math.cos(a)*22,Math.sin(a)*22,z);g.add(arm)}}
// panneaux solaires
const solM=new THREE.MeshStandardMaterial({map:SOLT,color:0xffffff,metalness:.5,roughness:.25,emissive:0x0a1a40,side:THREE.DoubleSide});
for(const z of[-82,82])for(const s of[-1,1]){const mast=new THREE.Mesh(new THREE.CylinderGeometry(1,1,70,6),D);mast.rotation.z=Math.PI/2;mast.position.set(s*35,0,z);g.add(mast);
for(let k=0;k<3;k++){const pn=new THREE.Mesh(new THREE.BoxGeometry(20,.5,32),solM);pn.position.set(s*(22+k*22),0,z);g.add(pn)}}
// antenne parabolique
const dish=new THREE.Mesh(new THREE.SphereGeometry(12,20,10,0,TAU,0,Math.PI*.32),new THREE.MeshStandardMaterial({color:0xdde3ea,metalness:.4,roughness:.4,side:THREE.DoubleSide}));dish.position.set(0,30,-64);dish.rotation.x=-.9;g.add(dish);
const mast=new THREE.Mesh(new THREE.CylinderGeometry(.8,.8,16,6),D);mast.position.set(0,24,-64);g.add(mast);
// radiateurs
for(const s of[-1,1]){const rd=new THREE.Mesh(new THREE.BoxGeometry(.6,26,40),new THREE.MeshStandardMaterial({color:0x2a2f38,emissive:0x3a1006,metalness:.4,roughness:.6}));rd.position.set(s*24,0,-10);g.add(rd)}
const hubL=sprite(0xffcc66,46,.7);g.add(hubL);
const lights=[];for(let i=0;i<12;i++){const a=i/12*TAU,s=sprite(i%3?0xffd060:0xff5050,9);s.position.set(Math.cos(a)*60,Math.sin(a)*60,10);rot.add(s);lights.push(s)}
for(const z of[-72,72]){const s=sprite(0x60ff90,12);s.position.z=z;g.add(s);lights.push(s)}
const zone=new THREE.Mesh(new THREE.TorusGeometry(230,1.5,6,80),new THREE.MeshBasicMaterial({color:0xffc84a,transparent:true,opacity:.35,blending:ADDB,depthWrite:false}));zone.rotation.x=Math.PI/2;g.add(zone);
g.userData={rot,lights,zone,hubL};return g}
