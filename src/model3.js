// ===== VAISSEAUX ENNEMIS PLUS DÉTAILLÉS : ailes biseautées, verrière, tuyères, feux, canons (géométries partagées par type) =====
const M3={geo:{},seg:DESK?18:12};
const M3GL=new THREE.MeshStandardMaterial({color:0x0e1a26,metalness:.9,roughness:.12,emissive:0x0a2636,emissiveIntensity:.7});
const M3NZ=new THREE.MeshStandardMaterial({color:0x2c2f36,metalness:.85,roughness:.32,side:THREE.DoubleSide});
// aile vue de dessus (envergure sur X, corde sur Z, épaisseur sur Y) avec bords arrondis
function m3Wing(span,root,tip,sweep,th,bev){const s=new THREE.Shape();s.moveTo(0,-root/2);s.lineTo(span,-root/2+sweep);s.lineTo(span,-root/2+sweep+tip);s.lineTo(0,root/2);s.closePath();
const g=new THREE.ExtrudeGeometry(s,{depth:th,bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:2,curveSegments:2});g.translate(0,0,-th/2);g.rotateX(Math.PI/2);return g}
// coque vue de profil (longueur sur Z, hauteur sur Y) extrudée sur la largeur X
function m3Side(pts,w,bev){const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);s.closePath();
const g=new THREE.ExtrudeGeometry(s,{depth:w-2*bev,bevelEnabled:true,bevelThickness:bev,bevelSize:bev,bevelSegments:3,curveSegments:2});g.translate(0,0,-(w-2*bev)/2);g.rotateY(-Math.PI/2);return g}
const m3Lathe=(pts,seg)=>lathe(pts,seg||M3.seg);
// tuyère : cloche ouverte + disque lumineux au fond
function m3Nozzle(r){return m3Lathe([[r*.55,-r*.9],[r*.62,-r*.5],[r*.8,0],[r,r*.6],[r*1.05,r*.8]])}
function m3G(k,f){return M3.geo[k]||(M3.geo[k]=f())}
buildEnemy=function(ty){const g=new THREE.Group(),b=new THREE.Group();g.add(b);const m=enemyMat(ty),engines=[],seg=M3.seg;
const add=(geo,mat,x,y,z,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.scale.set(sx,sy,sz);b.add(o);return o};
const light=(x,y,z,col,s)=>{const sp=sprite(col,s||1.4,.9);sp.position.set(x,y,z);b.add(sp);return sp};
if(ty=='chasseur'){
// intercepteur : nacelle effilée, 4 lames en X avec canons, œil rouge
add(m3G('c_pod',()=>m3Lathe([[0,-6.2],[.32,-5.2],[.62,-3.6],[.88,-1.4],[.95,1.2],[.82,2.8],[.6,3.5],[.3,3.7]])),m,0,0,0);
add(m3G('c_ring',()=>new THREE.TorusGeometry(.92,.12,8,seg+6)),EDARK,0,0,1.6);add(m3G('c_ring',()=>0),EDARK,0,0,-.9);
add(m3G('c_eye',()=>new THREE.SphereGeometry(.42,16,12)),EGLOW,0,.25,-3.2,0,0,0,1,.7,1.4);add(m3G('c_can',()=>new THREE.SphereGeometry(.62,16,10,0,TAU,0,Math.PI/2)),M3GL,0,.55,-1.2,0,0,0,1,.75,1.9);
for(let i=0;i<4;i++){const a=i/4*TAU+Math.PI/4,c=Math.cos(a),s=Math.sin(a);add(m3G('c_blade',()=>m3Wing(3.6,2.3,.8,1.2,.14,.06)),m,c*.7,s*.7,1.3,0,0,a);
add(m3G('c_gun',()=>new THREE.CylinderGeometry(.09,.12,3.2,8).rotateX(Math.PI/2)),EDARK,c*4.15,s*4.15,.9);add(m3G('c_gunb',()=>new THREE.CylinderGeometry(.2,.2,.9,8).rotateX(Math.PI/2)),EDARK,c*4.15,s*4.15,1.9);light(c*4.3,s*4.3,2.3,0xff4030,1)}
add(m3G('c_noz',()=>m3Nozzle(.62)),M3NZ,0,0,4.1);engines.push([0,0,4.3])}
else if(ty=='lourd'){
// canonnière : coque biseautée, passerelle, tourelle double, nacelles moteurs, plaques de blindage
add(m3G('l_hull',()=>m3Side([[-4.8,-.5],[-3.9,.9],[-1.2,1.35],[2.6,1.4],[4.4,.9],[4.4,-1.1],[2.2,-1.45],[-3.2,-1.3]],4.6,.32)),m,0,0,0);
add(m3G('l_keel',()=>m3Side([[-3,-.3],[3.6,-.3],[4.2,.2],[-2.4,.2]],3.4,.12)),EDARK,0,-1.55,0);
add(m3G('l_brg',()=>m3Side([[-1.6,0],[-1.1,.9],[1.4,1],[1.8,0]],2.6,.18)),m,0,1.35,.6);
for(let i=0;i<5;i++)add(m3G('l_win',()=>RB3(.32,.16,.08)),EGLOW,-.9+i*.45,1.85,-.72,-1,0,0);
add(m3G('l_tur',()=>m3Lathe([[1.15,-.5],[1.2,0],[.95,.55],[0,.62]],seg).rotateX(-Math.PI/2)),EDARK,0,1.6,-2.4);
for(const s of[-1,1])add(m3G('l_bar',()=>new THREE.CylinderGeometry(.16,.2,3.6,8).rotateX(Math.PI/2)),EDARK,s*.42,1.85,-4.1);
for(const s of[-1,1]){add(m3G('l_pod',()=>m3Lathe([[.8,-4],[1.2,-3],[1.4,-1],[1.4,2.6],[1.25,3.9],[1.05,4.2]])),EDARK,s*3.9,-.1,0);add(m3G('l_podc',()=>m3Lathe([[0,-4.6],[.5,-4.3],[.85,-3.9],[.9,-3.6]])),m,s*3.9,-.1,0);
add(m3G('l_pyl',()=>m3Wing(1.6,2.6,2,.4,.35,.1)),m,s*1.9,-.2,.5,0,0,0,s,1,1);add(m3G('l_noz',()=>m3Nozzle(1.05)),M3NZ,s*3.9,-.1,4.85);
add(m3G('l_arm',()=>RB3(.5,1.6,5.2)),m,s*2.45,.15,-.6,0,0,s*.12);light(s*3.9,1.3,-3,0xff5030,1.3);engines.push([s*3.9,-.1,5.1])}
light(0,3.2,3.4,0xff3020,1.1)}
else if(ty=='boss'){
// vaisseau amiral : noyau en diamant, anneau d'armes, ailes, cœur violet
add(m3G('b_core',()=>m3Lathe([[0,-11.4],[2.2,-8],[5.6,-2],[6,1],[4.2,6],[2.4,9.6],[0,10]],seg+4)),m,0,0,0,0,0,0,1,.55,1);
add(m3G('b_dorsal',()=>m3Side([[-5,0],[-2.4,1],[3.6,1.15],[6.4,0]],1.3,.2)),EDARK,0,2.9,.5);for(let i=0;i<4;i++)light(0,4.15,-1.6+i*1.6,0xff60ff,.9);
add(m3G('b_ring',()=>new THREE.TorusGeometry(9,.75,12,DESK?72:44)),EDARK,0,0,1,Math.PI/2);add(m3G('b_ring2',()=>new THREE.TorusGeometry(9.9,.18,6,DESK?72:44)),EGLOW,0,0,1,Math.PI/2);
for(let i=0;i<8;i++){const a=i/8*TAU,c=Math.cos(a),s=Math.sin(a);add(m3G('b_spk',()=>m3Lathe([[.5,-2],[.65,-1.4],[.45,1.2],[0,2.4]],8)),m,c*9.6,s*.5,1+s*9.6,0,-a+Math.PI/2,0);add(m3G('b_gun',()=>new THREE.CylinderGeometry(.16,.22,3,8).rotateX(Math.PI/2)),EDARK,c*10.6,s*.5+.6,1+s*10.6-1.4)}
for(const s of[-1,1]){add(m3G('b_wing',()=>m3Wing(9.5,6,2.6,3.2,.6,.22)),m,s*4.6,0,1.5,0,0,s*-.06,s,1,1);add(m3G('b_can',()=>m3Lathe([[.5,-3.6],[.7,-3],[.75,2.6],[.55,3]],10)),EDARK,s*11.6,0,-.2);
add(m3G('b_noz',()=>m3Nozzle(1.7)),M3NZ,s*5,0,6.8);light(s*14,.4,3.4,0xff4040,2.4);engines.push([s*5,0,7])}
const core=add(m3G('b_heart',()=>new THREE.SphereGeometry(2,22,16)),new THREE.MeshBasicMaterial({color:0xd070ff}),0,1.6,-2);core.add(sprite(0xc060ff,12,.8));add(m3G('b_cage',()=>new THREE.TorusGeometry(2.4,.16,6,28)),EDARK,0,1.6,-2,Math.PI/2);
add(m3G('b_noz0',()=>m3Nozzle(2.2)),M3NZ,0,0,10.3);engines.push([0,0,10.4])}
else{
// pirate : fuselage en flèche, ailes en W biseautées, dérives, canons d'aile, verrière, bandes rouges
add(m3G('p_fus',()=>m3Lathe([[0,-5.4],[.4,-4.6],[.85,-3],[1.25,-.6],[1.35,1.6],[1.15,3.2],[.85,4]])),m,0,0,0,0,0,0,1,.62,1);
add(m3G('p_nose',()=>m3Lathe([[0,-6.4],[.12,-6],[.2,-5.2]],8)),EDARK,0,0,0);
add(m3G('p_can',()=>new THREE.SphereGeometry(.72,18,12,0,TAU,0,Math.PI/2)),M3GL,0,.5,-1.7,0,0,0,1,.7,2.1);
add(m3G('p_spine',()=>m3Side([[-1.2,0],[-.4,.45],[3,.5],[3.8,0]],.5,.12)),EDARK,0,.62,.2);
for(const s of[-1,1]){add(m3G('p_wing',()=>m3Wing(4.8,3.4,1.1,2.1,.22,.08)),m,s*.9,-.05,1.2,0,0,s*.14,s,1,1);
add(m3G('p_strip',()=>m3Wing(4.4,.22,.18,1.96,.05,.02)),EGLOW,s*1.05,.12,-.36,0,0,s*.14,s,1,1);
add(m3G('p_fin',()=>m3Wing(1.7,1.9,.7,1.1,.14,.05)),m,s*.75,.35,2.7,0,0,s*1.25,s,1,1);
add(m3G('p_gun',()=>new THREE.CylinderGeometry(.11,.15,3,8).rotateX(Math.PI/2)),EDARK,s*5.55,.48,.4);add(m3G('p_gunb',()=>m3Lathe([[.22,-.8],[.3,-.4],[.3,.9],[.2,1.1]],8)),EDARK,s*5.55,.48,1.6);light(s*5.6,.55,-1.2,0xff3a2a,.9);
add(m3G('p_intk',()=>m3Lathe([[.45,-1.4],[.55,-1],[.55,1.2],[.4,1.6]],10)),EDARK,s*1.15,-.28,1.7);add(m3G('p_noz2',()=>m3Nozzle(.34)),M3NZ,s*1.15,-.28,3.55)}
add(m3G('p_noz',()=>m3Nozzle(.72)),M3NZ,0,0,4.45);add(m3G('p_ant',()=>new THREE.CylinderGeometry(.03,.03,1.4,4)),EDARK,.35,1.1,2.4,-.3);light(.35,1.8,2.62,0xff4030,.6);engines.push([0,0,4.6])}
for(const[x,y,z]of engines){const R=ty=='boss'?(x?1.7:2.2):ty=='lourd'?1.05:ty=='chasseur'?.62:.72;add(m3G('glow'+R,()=>new THREE.CircleGeometry(R*.9,16)),new THREE.MeshBasicMaterial({color:0xff7a3a}),x,y,z-.1);const s=sprite(0xff6a3a,ty=='boss'?14:6);s.position.set(x,y,z+.6);b.add(s)}
const sc=(ty=='boss'?1.6:ty=='lourd'?1.2:1)*1.8;g.scale.setScalar(sc);
const bar=new THREE.Sprite(new THREE.SpriteMaterial({color:ENC[ty],depthWrite:false,transparent:true}));bar.scale.set(10,.7,1);bar.position.y=9;bar.visible=false;g.add(bar);g.userData={body:b,bar};return g};
