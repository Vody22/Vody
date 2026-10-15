// ===== MONDE VIVANT — modèles des vaisseaux PNJ (w7m.js) : cargo porte-conteneurs, foreuse minière, navette de ligne, courrier, intercepteur de patrouille =====
// Remplace w7Proto/w7Mesh de w7.js. Le nez regarde -z ; tout est dans un groupe « body » (inclinaison en virage) ; userData.fl = flammes, fb = taille de base des flammes, s0 = échelle.
const W7M={mat:{},tex:{}};
function w7mC(w,h,f){const c=mkC(w,h),g=c.getContext('2d');f(g,w,h);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t}
// textures : hublots éclairés, bandes de danger, conteneur nervuré, numéro / logo
function w7mTex(k){if(W7M.tex[k])return W7M.tex[k];let t;
if(k=='win')t=w7mC(256,16,(g,w,h)=>{g.fillStyle='#0a1018';g.fillRect(0,0,w,h);for(let x=4;x<w-6;x+=10){const on=Math.random()<.78;g.fillStyle=on?(Math.random()<.2?'#bfe6ff':'#ffd9a0'):'#1a2430';g.fillRect(x,4,6,8)}});
else if(k=='haz')t=w7mC(128,32,(g,w,h)=>{g.fillStyle='#e8b420';g.fillRect(0,0,w,h);g.fillStyle='#16181c';for(let x=-h;x<w+h;x+=24){g.beginPath();g.moveTo(x,0);g.lineTo(x+12,0);g.lineTo(x+12-h,h);g.lineTo(x-h,h);g.fill()}});
else if(k=='box')t=w7mC(64,128,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);for(let x=2;x<w;x+=6){g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x,0,2,h);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(x+2,0,1,h)}g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,0,w,4);g.fillRect(0,h-4,w,4);g.fillStyle='rgba(0,0,0,.22)';g.fillRect(10,40,44,30)});
else if(k=='stripe')t=w7mC(128,32,(g,w,h)=>{g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle='#2f6fff';g.fillRect(0,10,w,12);g.fillStyle='#fff';g.font='bold 11px sans-serif';g.textAlign='center';g.fillText('ALLIANCE',w/2,20)});
return W7M.tex[k]=t}
function w7mM(k,f){return W7M.mat[k]||(W7M.mat[k]=f())}
const w7mHull=(col,met,rou)=>w7mM('h'+col,()=>new THREE.MeshStandardMaterial({color:col,map:HULLT,normalMap:DESK&&typeof HULLN!='undefined'?HULLN:null,metalness:met==null?.55:met,roughness:rou==null?.42:rou}));
const w7mWin=()=>w7mM('win',()=>new THREE.MeshBasicMaterial({map:w7mTex('win')}));
const w7mGlow=col=>w7mM('g'+col,()=>new THREE.MeshBasicMaterial({color:col}));
// feux de navigation qui clignotent (matériaux propres, animés dans un STICK)
const W7NAV={r:new THREE.SpriteMaterial({map:GLOW,color:0xff3020,transparent:true,blending:ADDB,depthWrite:false}),g:new THREE.SpriteMaterial({map:GLOW,color:0x30ff60,transparent:true,blending:ADDB,depthWrite:false}),w:new THREE.SpriteMaterial({map:GLOW,color:0xffffff,transparent:true,blending:ADDB,depthWrite:false}),b:new THREE.SpriteMaterial({map:GLOW,color:0x3070ff,transparent:true,blending:ADDB,depthWrite:false}),a:new THREE.SpriteMaterial({map:GLOW,color:0xffb030,transparent:true,blending:ADDB,depthWrite:false})};
STICK.push(()=>{const k=t%1.6;W7NAV.w.opacity=k<.08||(k>.22&&k<.3)?1:0;W7NAV.r.opacity=W7NAV.g.opacity=.75+.25*Math.sin(t*2);const p=Math.floor(t*4)%2;W7NAV.b.opacity=p?1:.1;W7NAV.a.opacity=.5+.5*Math.sin(t*5)});
function w7mBuild(job,v){const g=new THREE.Group(),b=new THREE.Group();g.add(b);const fl=[];let fb=4,s0=1;
const add=(geo,m,x,y,z,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.scale.set(sx,sy,sz);b.add(o);return o};
const wz=(sx,a)=>sx>0?a:Math.PI-a;
const nav=(k,x,y,z,s)=>{const sp=new THREE.Sprite(W7NAV[k]);sp.position.set(x,y,z);sp.scale.setScalar(s||2.2);b.add(sp)};
const eng=(x,y,z,r,col)=>{add(m3Nozzle(r),M3NZ,x,y,z);add(new THREE.CircleGeometry(r*.78,18),w7mGlow(col||0x9fd8ff),x,y,z+r*.55);const sp=sprite(col||0x6ab8ff,r*4);sp.position.set(x,y,z+r*1.4);b.add(sp);fl.push(sp)};
if(job=='cargo'){
 // porte-conteneurs : poste de pilotage à l'avant, épine centrale, 3 rangées de conteneurs colorés, bloc moteur, radiateurs
 const H=w7mHull(0xc9c3b4),D=EDARK,COLS=[[0xc0412f,0x2f6fc0,0xd6a22a,0x3c9a5a],[0x2f6fc0,0x8a4fc0,0xe07a2a,0x9aa4ae],[0xd6a22a,0xc0412f,0x3c9a5a,0x2f6fc0]][v%3];
 add(m3Side([[-34,-2.6],[-32.5,1.6],[-29,3.6],[-22,3.8],[-21,-3],[-31,-3.6]],9,.6),H,0,0,0);
 add(m3Side([[-33.4,1.9],[-31.6,3.1],[-28.6,3.15],[-28.6,2.2]],8.4,.15),M3GL,0,0,0);
 add(new THREE.PlaneGeometry(10,.7),w7mWin(),4.66,.8,-26,0,Math.PI/2,0);add(new THREE.PlaneGeometry(10,.7),w7mWin(),-4.66,.8,-26,0,-Math.PI/2,0);
 add(RB3(3.2,3,48),D,0,0,2);for(let i=0;i<6;i++)add(RB3(9.6,1,.8),D,0,0,-17+i*8);
 const bx=new THREE.BoxGeometry(4.3,4,7.4);for(let i=0;i<5;i++)for(const sx of[-1,1])for(const sy of[-1,1]){if(Math.random()<.12)continue;const c=COLS[(i+(sx>0?1:0)+(sy>0?2:0))%4];add(bx,w7mM('box'+c,()=>new THREE.MeshStandardMaterial({color:c,map:w7mTex('box'),metalness:.35,roughness:.6})),sx*2.35,sy*2.15,-15+i*8)}
 add(m3Side([[23,-3.8],[22,3.8],[30,4.2],[32,3],[32,-3],[30,-4.4]],10,.5),H,0,0,0);
 for(const sx of[-1,1])add(RB3(.3,7,9),D,sx*6.6,0,26,0,0,sx*.15);add(RB3(8,.3,6),D,0,5.2,26);
 for(const[x,y]of[[-2.6,-1.8],[2.6,-1.8],[-2.6,1.8],[2.6,1.8]])eng(x,y,32.4,1.6,0x8fc8ff);
 nav('r',-4.8,0,-25,2.6);nav('g',4.8,0,-25,2.6);nav('w',0,5.6,29,3);nav('a',0,4.1,-22,1.6);fb=7;s0=1}
else if(job=='miner'){
 // foreuse minière : coque trapue jaune, bandes de danger, deux bras avec trépans, trémies latérales, bulle de pilotage
 const H=w7mHull(0xd9a82a,.4,.5),D=EDARK,HZ=w7mM('haz',()=>new THREE.MeshStandardMaterial({map:w7mTex('haz'),metalness:.3,roughness:.6}));
 add(m3Side([[-6,-1.8],[-5.4,1.4],[-2,2.6],[5,2.6],[6.4,1.4],[6.4,-2.2],[-4.6,-2.4]],6.4,.45),H,0,0,0);
 add(new THREE.BoxGeometry(6.5,.9,.4),HZ,0,.2,-6.15);add(new THREE.BoxGeometry(.4,.8,9),HZ,3.25,1.6,.4);add(new THREE.BoxGeometry(.4,.8,9),HZ,-3.25,1.6,.4);
 add(new THREE.SphereGeometry(1.5,18,12,0,TAU,0,Math.PI/2),M3GL,0,2.4,-2.6,0,0,0,1,.8,1.3);
 for(const sx of[-1,1]){add(RB3(1,1,5),D,sx*2.4,-1.4,-6.4);add(new THREE.ConeGeometry(.9,3.2,10).rotateX(-Math.PI/2),w7mHull(0x8a8f96,.9,.3),sx*2.4,-1.4,-10.2);
  add(RB3(2.2,2.6,5.5),D,sx*4.2,-.2,1.6);add(RB3(2.3,.4,5.6),HZ,sx*4.2,1.2,1.6)}
 add(RB3(.25,3,.25),D,1.6,3.8,2);nav('a',1.6,5.4,2,1.8);nav('w',0,2.8,6,2);
 eng(-1.6,0,6.9,1,0xffd080);eng(1.6,0,6.9,1,0xffd080);fb=4;s0=1.25}
else if(job=='shuttle'){
 // navette de ligne : fuselage blanc arrondi, rangées de hublots, bande de couleur de la compagnie, ailerons, dérive
 const H=w7mHull(0xf2f2f2,.3,.32),A=w7mHull([0xffc34d,0x3aa0ff,0xe0503a][v%3],.3,.4);
 add(lathe([[0,-11],[1.1,-10],[2.1,-8],[2.6,-5],[2.7,3],[2.4,7],[1.8,9],[1.2,9.6]],22),H,0,0,0,0,0,0,1,.9,1);
 add(new THREE.CylinderGeometry(2.72,2.72,1.1,22,1,true).rotateX(Math.PI/2),A,0,0,-1,0,0,0,1,.9,1);
 for(const sx of[-1,1])add(new THREE.PlaneGeometry(12,.55),w7mWin(),sx*2.62,.55,1.6,0,sx*Math.PI/2,0);
 add(new THREE.SphereGeometry(1.4,16,10,0,TAU,0,Math.PI/2),M3GL,0,1.1,-7.6,-.35,0,0,1,.6,1.6);
 for(const sx of[-1,1]){const w=add(m3Wing(4.6,5,1.8,2.6,.32,.12),H,sx*2,-.9,3,0,0,wz(sx,0));add(RB3(.6,.3,1.6),A,sx*6.5,-.8,5.2)}
 add(m3Wing(3.6,4,1.6,2.4,.28,.1),A,0,1.8,6.4,0,0,Math.PI/2);
 eng(-1.1,0,9.9,.9,0xa8e0ff);eng(1.1,0,9.9,.9,0xa8e0ff);nav('r',-6.8,-.8,5.4,1.6);nav('g',6.8,-.8,5.4,1.6);nav('w',0,5.4,8,1.8);fb=3.5;s0=1.15}
else if(job=='courier'){
 // courrier rapide : aiguille effilée, ailes très en flèche, grosse tuyère unique, verrière teintée
 const H=w7mHull(0x5a4d78,.7,.3),A=w7mHull(0xc8a0ff,.5,.3);
 add(lathe([[0,-9],[.5,-7.6],[1,-4.5],[1.35,-1],[1.5,3],[1.3,5.6],[1,6.2]],18),H,0,0,0,0,0,0,1,.75,1);
 add(new THREE.SphereGeometry(.8,14,10,0,TAU,0,Math.PI/2),w7mM('gl2',()=>new THREE.MeshStandardMaterial({color:0x2a1040,metalness:.9,roughness:.1,emissive:0x40206a,emissiveIntensity:.5})),0,.65,-3,0,0,0,1,.7,2.2);
 for(const sx of[-1,1]){add(m3Wing(5.2,6,1,5.2,.18,.08),H,sx*1,-.2,2,0,0,wz(sx,0));add(RB3(.25,.25,3.4),A,sx*5.9,-.1,5.6);add(m3Wing(1.6,2.2,.8,1.4,.14,.05),A,sx*.8,.9,4.4,0,0,wz(sx,.9))}
 add(new THREE.BoxGeometry(.12,.12,10),w7mGlow(0xc8a0ff),0,-.4,-1);
 eng(0,0,6.6,1.25,0xd0a8ff);nav('a',0,-1,-6,1.2);fb=5;s0=1.1}
else{
 // patrouille de l'Alliance : intercepteur anguleux bleu et blanc, ailes à extrémités bleues, deux canons, rampe de gyrophares
 const H=w7mHull(0xe8eef6,.55,.35),A=w7mHull(0x2f6fff,.5,.35),ST=w7mM('stripe',()=>new THREE.MeshStandardMaterial({map:w7mTex('stripe'),metalness:.4,roughness:.4}));
 add(m3Side([[-8,-.3],[-6.6,1],[-2.5,1.8],[3.5,1.7],[6,1],[6,-1.2],[-4.5,-1.3]],3.6,.3),H,0,0,0);
 add(new THREE.PlaneGeometry(6,1.5),ST,1.85,.2,0,0,Math.PI/2,0);add(new THREE.PlaneGeometry(6,1.5),ST,-1.85,.2,0,0,-Math.PI/2,0);
 add(new THREE.SphereGeometry(1,16,10,0,TAU,0,Math.PI/2),M3GL,0,1.5,-3,0,0,0,1,.7,2);
 for(const sx of[-1,1]){add(m3Wing(6,5.5,1.6,3.6,.26,.1),H,sx*1.6,-.3,1.4,0,0,wz(sx,-.06));add(m3Wing(1.4,2.6,1.4,.8,.3,.08),A,sx*7.2,-.6,4.1,0,0,wz(sx,0));
  add(new THREE.CylinderGeometry(.12,.16,4,8).rotateX(Math.PI/2),EDARK,sx*2.6,-.5,-4.6);add(m3Wing(2.4,3,1.4,1.6,.2,.06),A,sx*1.2,1.4,4.6,0,0,wz(sx,1.1))}
 add(RB3(2.4,.35,.6),EDARK,0,2.2,.6);nav('b',-.8,2.5,.6,1.6);nav('r',.8,2.5,.6,1.6);nav('w',0,.5,6.3,1.6);
 eng(-1.1,0,6.6,.85,0x7fb0ff);eng(1.1,0,6.6,.85,0x7fb0ff);fb=3.5;s0=1.35}
try{pf3MergeChildren(b,new Set())}catch(e){}g.scale.setScalar(s0);g.userData={fb,s0};return g}
w7Proto=function(job){const v=Math.random()*3|0,k=job+v;return W7.proto[k]||(W7.proto[k]=w7mBuild(job,v))};
w7Mesh=function(job){const p=w7Proto(job),m=p.clone(),body=m.children[0],fl=[];body.traverse(o=>{if(o.isSprite&&o.material.map===GLOW&&!Object.values(W7NAV).includes(o.material))fl.push(o)});m.userData={body,fl,w7:1,fb:p.userData.fb,s0:p.userData.s0};return m};
W7J.cargo.r=36;W7J.miner.r=14;W7J.shuttle.r=15;W7J.courier.r=11;W7J.patrol.r=14;
