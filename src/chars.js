// ===== PERSONNAGES : modèle humain arrondi et articulé, métiers, extraterrestre, animations =====
// forme de « gélule » tournée autour de l'axe Y (de y=0 à y=L), rayons r1 en bas et r2 en haut
function capG(r1,r2,L,s=10){const p=[];for(let i=0;i<=4;i++){const a=-Math.PI/2+i/4*Math.PI/2;p.push(new THREE.Vector2(Math.max(.001,Math.cos(a)*r1),r1+Math.sin(a)*r1))}for(let i=0;i<=4;i++){const a=i/4*Math.PI/2;p.push(new THREE.Vector2(Math.max(.001,Math.cos(a)*r2),L-r2+Math.sin(a)*r2))}return new THREE.LatheGeometry(p,s)}
const SUITT=(()=>{const c=mkC(128),g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,128,128);g.strokeStyle='rgba(0,0,0,.18)';g.lineWidth=1.5;for(let i=0;i<6;i++){g.beginPath();g.moveTo(0,i*22+8);g.lineTo(128,i*22+8);g.stroke()}g.strokeStyle='rgba(0,0,0,.1)';for(let i=0;i<5;i++){g.beginPath();g.moveTo(i*30+12,0);g.lineTo(i*30+12,128);g.stroke()}
for(let i=0;i<60;i++){g.fillStyle=`rgba(0,0,0,${Math.random()*.05})`;g.fillRect(Math.random()*128,Math.random()*128,3,3)}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t})();
const CHG={thigh:capG(.105,.12,.5),shin:capG(.085,.1,.46),upper:capG(.075,.088,.38),fore:capG(.065,.075,.34),boot:null,
torso:new THREE.LatheGeometry([[0,0],[.19,0],[.23,.08],[.25,.26],[.28,.46],[.27,.58],[.18,.66],[.07,.7],[0,.71]].map(([x,y])=>new THREE.Vector2(x,y)),14),
pelvis:new THREE.LatheGeometry([[0,0],[.17,0],[.22,.06],[.23,.16],[.2,.22],[0,.22]].map(([x,y])=>new THREE.Vector2(x,y)),12),
robe:new THREE.LatheGeometry([[.42,0],[.36,.25],[.27,.6],[.22,.78],[0,.8]].map(([x,y])=>new THREE.Vector2(x,y)),14),
coat:new THREE.LatheGeometry([[.36,0],[.32,.3],[.27,.62],[.27,.95],[.22,1.02],[0,1.03]].map(([x,y])=>new THREE.Vector2(x,y)),14,0,Math.PI*1.75)};
{const b=new THREE.Shape();b.moveTo(-.1,-.06);b.lineTo(-.1,.16);b.quadraticCurveTo(-.1,.2,-.06,.2);b.lineTo(.07,.2);b.quadraticCurveTo(.11,.2,.11,.1);b.lineTo(.11,-.06);b.closePath();CHG.boot=new THREE.ExtrudeGeometry(b,{depth:.16,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:2});CHG.boot.rotateY(-Math.PI/2);CHG.boot.translate(.08,0,.02)}
function buildHuman(o={}){const g=new THREE.Group(),role=o.role||'',alien=role=='alien';
const M=new THREE.MeshStandardMaterial({color:o.suit||0xe8ecf0,map:SUITT,metalness:.15,roughness:.62}),D=new THREE.MeshStandardMaterial({color:o.dark||0x262b33,metalness:.45,roughness:.5}),A=new THREE.MeshStandardMaterial({color:o.acc||0xff8a2a,metalness:.3,roughness:.4,emissive:o.acc||0xff8a2a,emissiveIntensity:.08}),
SK=new THREE.MeshStandardMaterial({color:alien?(o.skin||0x6fd08a):(o.skin||0xd9a07a),roughness:.7,metalness:0}),GL=new THREE.MeshBasicMaterial({color:o.glow||0x5ff0ff});
const add=(geo,m,x,y,z,par=g)=>{const q=new THREE.Mesh(geo,m);q.position.set(x,y,z);q.castShadow=DESK;par.add(q);return q};
// jambes (pivot à la hanche)
const legs=[],arms=[];for(const s of[-1,1]){const hip=new THREE.Group();hip.position.set(s*.12,.96,0);g.add(hip);add(CHG.thigh,alien?SK:M,0,-.5,0,hip);const kn=new THREE.Group();kn.position.y=-.48;hip.add(kn);add(new THREE.SphereGeometry(.1,10,8),alien?SK:A,0,0,-.03,kn);
add(CHG.shin,alien?SK:M,0,-.44,0,kn);const ft=new THREE.Group();ft.position.y=-.44;kn.add(ft);const bt=add(CHG.boot,D,0,-.06,-.02,ft);legs.push({hip,kn,ft})}
const pel=add(CHG.pelvis,alien?SK:D,0,.86,0);pel.scale.z=.8;
// buste (pivot de la colonne pour respirer et se pencher)
const sp=new THREE.Group();sp.position.y=1.02;g.add(sp);const tor=add(CHG.torso,alien?SK:M,0,0,0,sp);tor.scale.z=.74;
if(!alien){add(new THREE.BoxGeometry(.2,.11,.03),D,0,.38,-.2,sp);add(new THREE.BoxGeometry(.14,.06,.02),GL,0,.38,-.217,sp);add(new THREE.TorusGeometry(.2,.035,6,20),D,0,.66,0,sp).rotation.x=Math.PI/2;
for(const s of[-1,1])add(new THREE.BoxGeometry(.05,.3,.02),A,s*.12,.3,-.19,sp)}
// sac à dos avec propulseurs
if(!alien&&role!='merchant'&&role!='scientist'){const bp=new THREE.Group();bp.position.set(0,.36,.22);sp.add(bp);add(new THREE.BoxGeometry(.38,.46,.18),D,0,0,0,bp);add(new THREE.BoxGeometry(.34,.08,.19),A,0,.17,0,bp);for(const s of[-1,1]){add(capG(.05,.05,.3,8),M,s*.12,-.15,.1,bp);add(new THREE.CylinderGeometry(.045,.06,.06,8),D,s*.12,-.2,.1,bp)}add(new THREE.BoxGeometry(.2,.03,.01),GL,0,.05,.096,bp)}
// bras (pivot à l'épaule)
for(const s of[-1,1]){const sh=new THREE.Group();sh.position.set(s*.31,.58,0);sp.add(sh);add(new THREE.SphereGeometry(.1,10,8),alien?SK:A,0,0,0,sh);add(CHG.upper,alien?SK:M,0,-.38,0,sh);const el=new THREE.Group();el.position.y=-.37;sh.add(el);add(new THREE.SphereGeometry(.075,8,6),alien?SK:D,0,0,0,el);add(CHG.fore,alien?SK:M,0,-.34,0,el);
const hd=new THREE.Group();hd.position.y=-.36;el.add(hd);add(new THREE.SphereGeometry(.07,10,8),alien?SK:D,0,-.02,0,hd);add(new THREE.BoxGeometry(.06,.07,.1),alien?SK:D,0,-.07,-.02,hd);arms.push({sh,el,hd})}
// tête
const head=new THREE.Group();head.position.y=.62;sp.add(head);const helmet=o.helmet!==false&&!alien,face=!alien;
if(face){const sk=add(new THREE.SphereGeometry(.13,14,12),SK,0,.16,-.01,head);sk.scale.set(.92,1.05,.98);for(const s of[-1,1]){add(new THREE.SphereGeometry(.018,8,6),new THREE.MeshBasicMaterial({color:0x101418}),s*.045,.18,-.12,head);add(new THREE.SphereGeometry(.006,6,4),new THREE.MeshBasicMaterial({color:0xffffff}),s*.045+.006,.188,-.135,head)}
add(new THREE.SphereGeometry(.018,6,5),SK,0,.15,-.13,head);if(!helmet){const hair=add(new THREE.SphereGeometry(.137,14,10,0,TAU,0,Math.PI*.55),new THREE.MeshStandardMaterial({color:o.hair||0x3a2418,roughness:.9}),0,.17,.005,head);hair.rotation.x=-.25}}
if(helmet){add(new THREE.SphereGeometry(.24,20,14,Math.PI*1.5+.95,TAU-1.9,0,Math.PI*.86),M,0,.15,0,head);add(new THREE.SphereGeometry(.232,18,10,Math.PI*1.5-1,2,Math.PI*.2,Math.PI*.5),new THREE.MeshStandardMaterial({color:o.visor||0x1a3a50,metalness:.95,roughness:.05,transparent:true,opacity:o.closed?.92:.4,envMapIntensity:1.4,side:THREE.DoubleSide}),0,.15,0,head);
add(new THREE.TorusGeometry(.24,.02,6,24,Math.PI),A,0,.15,0,head).rotation.set(0,Math.PI/2,Math.PI/2);for(const s of[-1,1])add(new THREE.CylinderGeometry(.035,.035,.06,10),D,s*.23,.15,.02,head).rotation.z=Math.PI/2;const lmp=sprite(0xfff0c0,.32);lmp.position.set(.2,.24,-.12);head.add(lmp)}
if(alien){const sk=add(new THREE.SphereGeometry(.17,16,12),SK,0,.2,0,head);sk.scale.set(.9,1.35,1);for(const s of[-1,1]){const e=add(new THREE.SphereGeometry(.055,10,8),new THREE.MeshStandardMaterial({color:0x05070a,metalness:.8,roughness:.08}),s*.07,.22,-.13,head);e.scale.set(1,.65,.5);e.rotation.z=s*.4;
add(new THREE.CylinderGeometry(.008,.012,.22,5),SK,s*.07,.48,0,head).rotation.z=-s*.35;const tip=sprite(o.glow||0xb070ff,.14);tip.position.set(s*.11,.59,0);head.add(tip)}}
// accessoires des métiers
let tool=null,prop=null;
if(role=='merchant'||alien){const rb=add(CHG.robe,new THREE.MeshStandardMaterial({color:o.robe||0x6b3fa0,roughness:.75}),0,.38,0);rb.scale.z=.82;add(new THREE.TorusGeometry(.19,.05,6,16),A,0,.62,0,sp).rotation.x=Math.PI/2;
if(!alien){const brim=add(new THREE.CylinderGeometry(.3,.3,.02,20),new THREE.MeshStandardMaterial({color:0x8a5a2a,roughness:.8}),0,.29,0,head);add(new THREE.CylinderGeometry(.13,.15,.13,16),brim.material,0,.36,0,head)}}
if(role=='scientist'){add(CHG.coat,new THREE.MeshStandardMaterial({color:0xf2f4f6,roughness:.7,side:THREE.DoubleSide}),0,.5,0).rotation.y=Math.PI*1.125;prop=add(new THREE.BoxGeometry(.2,.14,.015),new THREE.MeshBasicMaterial({color:0x5ff0ff}),0,-.1,-.06,arms[0].hd);prop.rotation.x=-.8;
for(const s of[-1,1])add(new THREE.TorusGeometry(.03,.006,4,10),D,s*.045,.18,-.135,head)}
if(role=='mechanic'){add(new THREE.CylinderGeometry(.14,.14,.07,16),new THREE.MeshStandardMaterial({color:0xff8a2a,roughness:.6}),0,.27,0,head);add(new THREE.BoxGeometry(.18,.015,.12),new THREE.MeshStandardMaterial({color:0xff8a2a}),0,.24,-.13,head);
add(new THREE.TorusGeometry(.23,.03,6,18),new THREE.MeshStandardMaterial({color:0x4a3220}),0,.9,0).rotation.x=Math.PI/2;for(const s of[-1,1])add(new THREE.BoxGeometry(.07,.09,.05),new THREE.MeshStandardMaterial({color:0x4a3220}),s*.18,.86,-.12);
prop=new THREE.Group();prop.position.set(0,-.08,-.04);arms[1].hd.add(prop);add(new THREE.BoxGeometry(.03,.3,.02),MAT.metal,0,-.14,0,prop);add(new THREE.TorusGeometry(.04,.015,4,10,Math.PI*1.4),MAT.metal,0,-.3,0,prop)}
if(role=='miner'){const pk=new THREE.Group();pk.position.set(0,.36,.32);pk.rotation.z=.7;sp.add(pk);add(new THREE.CylinderGeometry(.018,.018,.7,6),new THREE.MeshStandardMaterial({color:0x6a4a2a}),0,0,0,pk);add(new THREE.BoxGeometry(.32,.05,.05),MAT.metal,0,.33,0,pk)}
if(role=='guard'){add(new THREE.BoxGeometry(.46,.34,.12),new THREE.MeshStandardMaterial({color:o.acc||0x2d4a6e,metalness:.6,roughness:.35}),0,.4,-.14,sp);for(const s of[-1,1])add(new THREE.SphereGeometry(.13,10,8,0,TAU,0,Math.PI/2),new THREE.MeshStandardMaterial({color:o.acc||0x2d4a6e,metalness:.6,roughness:.35}),s*.31,.62,0,sp);
prop=new THREE.Group();prop.position.set(0,-.06,-.05);arms[1].hd.add(prop);add(new THREE.BoxGeometry(.07,.11,.55),D,0,0,-.18,prop);add(new THREE.CylinderGeometry(.02,.02,.3,8).rotateX(Math.PI/2),MAT.metal,0,.02,-.55,prop);add(new THREE.BoxGeometry(.04,.04,.12),D,0,.08,-.15,prop)}
if(o.tool){tool=new THREE.Group();tool.position.set(0,-.07,-.06);arms[1].hd.add(tool);add(new THREE.BoxGeometry(.07,.1,.3),D,0,0,-.1,tool);add(new THREE.BoxGeometry(.05,.09,.06),D,0,-.08,.02,tool);add(new THREE.CylinderGeometry(.028,.028,.12,8).rotateX(Math.PI/2),MAT.metal,0,.02,-.3,tool);add(new THREE.BoxGeometry(.075,.02,.18),A,0,.06,-.08,tool);const tp=sprite(0x5ff0ff,.3);tp.position.set(0,.02,-.38);tool.add(tp)}
if(!helmet&&!alien)head.scale.setScalar(1.14);g.userData={legs,arms,sp,head,tool,prop,role,ph:Math.random()*9};return g}
// animation : marche/course, respiration au repos, regard, gestes en parlant, bras armé
function animHuman(m,ph,spd,air,aim,talk,look){const u=m.userData,k=Math.min(1,spd/6.5),run=spd>8,sw=Math.sin(ph)*k*(run?.95:.7),br=Math.sin(t*2.2+u.ph);
if(air){u.legs[0].hip.rotation.x=-.6;u.legs[1].hip.rotation.x=.3;u.legs[0].kn.rotation.x=.9;u.legs[1].kn.rotation.x=.5}
else{u.legs[0].hip.rotation.x=sw;u.legs[1].hip.rotation.x=-sw;u.legs[0].kn.rotation.x=Math.max(0,Math.sin(ph-1.1))*k*(run?1.3:.95);u.legs[1].kn.rotation.x=Math.max(0,Math.sin(ph+2))*k*(run?1.3:.95)}
for(const L of u.legs)L.ft.rotation.x=-L.kn.rotation.x*.35;
u.sp.position.y=1.02+Math.abs(Math.cos(ph))*k*.035+br*.006;u.sp.rotation.x=(run?.2:.06)*k;u.sp.rotation.y=-sw*.18;u.sp.scale.set(1+br*.008,1,1+br*.012);
const A0=u.arms[0],A1=u.arms[1];A0.sh.rotation.set(-sw*.85,0,.08+(1-k)*.04);A0.el.rotation.x=-.35-k*.35;
if(aim){A1.sh.rotation.set(-1.45,0,-.05);A1.el.rotation.x=-.12}else if(u.prop&&u.role=='guard'){A1.sh.rotation.set(-.7,0,-.1);A1.el.rotation.x=-.9;A0.sh.rotation.set(-.5,0,.3);A0.el.rotation.x=-1.1}
else if(talk>0){const w=Math.sin(t*7);A1.sh.rotation.set(-1.1-w*.25,0,-.35);A1.el.rotation.x=-.9+w*.3}else{A1.sh.rotation.set(sw*.85,0,-.08-(1-k)*.04);A1.el.rotation.x=-.35-k*.35}
if(u.role=='scientist'&&!aim){A0.sh.rotation.set(-.6,0,.15);A0.el.rotation.x=-1.2}
const hy=look!=null?clamp(look,-1,1):Math.sin(t*.5+u.ph)*.25*(1-k);u.head.rotation.y=lerp(u.head.rotation.y,hy,.15);u.head.rotation.x=talk>0?Math.sin(t*5)*.06:-u.sp.rotation.x*.6}
