// ===== HANGAR 3D : quand on est amarré à une station, on voit son vaisseau posé dans un hangar (mécaniciens, drone, bras de soudure, écrans) derrière le menu =====
const H3={on:false,sc:null,cam:null,ship:null,st:null,t:0,npc:[],dr:null,arm:null,spk:[],wl:null,scr:[],ff:null,a0:0,key:''};
const H3W=72,H3D=96,H3H=26;
function h3Tex(){if(H3.T)return H3.T;const T={};
// sol : plaques de métal, rivets, traces d'usure
{const c=mkC(512,512),g=c.getContext('2d'),r=rng(31);g.fillStyle='#3c424b';g.fillRect(0,0,512,512);for(let i=0;i<4;i++)for(let j=0;j<4;j++){const v=55+r()*14|0;g.fillStyle=`rgb(${v},${v+4},${v+10})`;g.fillRect(i*128+2,j*128+2,124,124);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(i*128,j*128,128,3);g.fillRect(i*128,j*128,3,128);g.fillStyle='rgba(255,255,255,.07)';g.fillRect(i*128+3,j*128+3,122,2);
g.fillStyle='rgba(20,22,26,.8)';for(const[x,y]of[[10,10],[118,10],[10,118],[118,118]]){g.beginPath();g.arc(i*128+x,j*128+y,3,0,TAU);g.fill()}}
for(let i=0;i<260;i++){g.fillStyle=`rgba(${r()<.5?'0,0,0':'255,255,255'},${r()*.06})`;g.fillRect(r()*512,r()*512,2+r()*30,1+r()*3)}for(let i=0;i<14;i++){g.fillStyle=`rgba(10,8,6,${.05+r()*.08})`;g.beginPath();g.ellipse(r()*512,r()*512,8+r()*30,5+r()*16,r()*3,0,TAU);g.fill()}
T.floor=new THREE.CanvasTexture(c);T.floor.wrapS=T.floor.wrapT=THREE.RepeatWrapping;T.floor.repeat.set(H3W/8,H3D/8);T.floor.anisotropy=Math.min(8,R3.capabilities.getMaxAnisotropy())}
// aire d'atterrissage : cercle, bandes jaunes et noires, numéro du quai
{const c=mkC(512,512),g=c.getContext('2d');g.clearRect(0,0,512,512);g.translate(256,256);g.lineWidth=26;for(let i=0;i<48;i++){g.strokeStyle=i%2?'#1a1a1a':'#e8b830';g.beginPath();g.arc(0,0,226,i/48*TAU,(i+1)/48*TAU);g.stroke()}
g.strokeStyle='rgba(230,236,245,.85)';g.lineWidth=5;g.beginPath();g.arc(0,0,196,0,TAU);g.stroke();g.setLineDash([18,14]);g.beginPath();g.arc(0,0,150,0,TAU);g.stroke();g.setLineDash([]);
g.fillStyle='rgba(230,236,245,.8)';for(let i=0;i<4;i++){g.save();g.rotate(i*Math.PI/2);g.beginPath();g.moveTo(0,-196);g.lineTo(-16,-168);g.lineTo(16,-168);g.closePath();g.fill();g.restore()}
g.font="700 64px 'Chakra Petch',system-ui";g.textAlign='center';g.fillStyle='rgba(230,236,245,.55)';g.fillText('3',0,118);T.pad=new THREE.CanvasTexture(c)}
// bandes de danger (bords des portes et des passerelles)
{const c=mkC(256,32),g=c.getContext('2d');g.fillStyle='#e8b830';g.fillRect(0,0,256,32);g.fillStyle='#16161a';for(let x=-32;x<288;x+=32){g.beginPath();g.moveTo(x,32);g.lineTo(x+16,32);g.lineTo(x+32,0);g.lineTo(x+16,0);g.closePath();g.fill()}T.haz=new THREE.CanvasTexture(c);T.haz.wrapS=T.haz.wrapT=THREE.RepeatWrapping}
T.wall=panelTex('#5b636e','#1b2128',256,256,91);T.wall.repeat.set(6,2);T.crate=panelTex('#7a6a48','#2c2418',128,128,17);return H3.T=T}
// écran avec le nom de la station (redessiné à chaque entrée)
function h3Screen(st,k,col){const c=mkC(512,256),g=c.getContext('2d'),C='#'+new THREE.Color(col).getHexString();g.fillStyle='#050b14';g.fillRect(0,0,512,256);g.strokeStyle=C;g.lineWidth=4;g.strokeRect(6,6,500,244);
g.fillStyle=C;g.font="700 38px 'Chakra Petch',system-ui";g.fillText((st.n||'Station').toUpperCase(),26,62);g.font="600 22px 'Chakra Petch',system-ui";g.fillStyle='#cfe6ff';g.fillText((STY[k]?STY[k].n:'')+' · Quai 3 · Amarrage verrouillé',26,100);
const r=rng((st.x|0)+7);for(let i=0;i<7;i++){const w=60+r()*360;g.fillStyle='rgba(255,255,255,.12)';g.fillRect(26,124+i*16,460,8);g.fillStyle=C;g.globalAlpha=.75;g.fillRect(26,124+i*16,w,8);g.globalAlpha=1}
const t2=new THREE.CanvasTexture(c);(H3.tex||(H3.tex=[])).push(t2);return t2}
// fusionne les éléments fixes du décor par matériau (beaucoup moins d'appels de dessin)
function h3Merge(sc){sc.updateMatrixWorld(true);const G=new Map(),keep=new Set(Object.values(RB3C));for(const o of sc.children.slice()){if(!o.isMesh)continue;const k=o.material.uuid;if(!G.has(k))G.set(k,{m:o.material,list:[],cast:false});const e=G.get(k);e.list.push(o);if(o.castShadow)e.cast=true}
for(const e of G.values()){if(e.list.length<2)continue;const parts=[];let n=0;for(const o of e.list){const src=o.geometry,g=src.index?src.toNonIndexed():src.clone();g.applyMatrix4(o.matrixWorld);if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));if(!g.attributes.normal)g.computeVertexNormals();parts.push(g);n+=g.attributes.position.count;sc.remove(o);if(!keep.has(src))src.dispose()}
const pos=new Float32Array(n*3),nor=new Float32Array(n*3),uv=new Float32Array(n*2);let i=0;for(const g of parts){pos.set(g.attributes.position.array,i*3);nor.set(g.attributes.normal.array,i*3);uv.set(g.attributes.uv.array,i*2);i+=g.attributes.position.count;g.dispose()}
const mg=new THREE.BufferGeometry();mg.setAttribute('position',new THREE.BufferAttribute(pos,3));mg.setAttribute('normal',new THREE.BufferAttribute(nor,3));mg.setAttribute('uv',new THREE.BufferAttribute(uv,2));mg.computeBoundingSphere();const mm=new THREE.Mesh(mg,e.m);mm.castShadow=e.cast;mm.receiveShadow=true;sc.add(mm)}}
function h3Build(st){const k=typeof styKey=='function'?styKey(st):'alliance',S0=STY[k]||STY.alliance,T=h3Tex(),sc=new THREE.Scene(),por=innerWidth<innerHeight;H3.sc=sc;H3.st=st;H3.key=k;H3.t=0;H3.npc=[];H3.spk=[];H3.scr=[];
sc.background=new THREE.Color(0x05080e);if(scene.environment)sc.environment=scene.environment;
H3.cam=new THREE.PerspectiveCamera(por?62:46,innerWidth/innerHeight,.3,3000);
// lumières
sc.add(new THREE.AmbientLight(0x4a5262,.6),new THREE.HemisphereLight(0xdfe8ff,0x3a3028,.72));const dl=new THREE.DirectionalLight(0xfff4e6,1.05);dl.position.set(8,40,14);dl.target.position.set(0,0,0);sc.add(dl,dl.target);
if(R3.shadowMap.enabled){dl.castShadow=true;dl.shadow.mapSize.set(DESK?2048:1024,DESK?2048:1024);const c=dl.shadow.camera;c.left=-34;c.right=34;c.top=34;c.bottom=-34;c.near=5;c.far=90;dl.shadow.bias=-.0005;dl.shadow.normalBias=.04}
const pa=new THREE.PointLight(S0.acc,1.3,70,1.6);pa.position.set(0,14,H3D/2-6);sc.add(pa);const wl=new THREE.PointLight(0x9fd0ff,0,26,2);sc.add(wl);H3.wl=wl;
// matériaux
const M={floor:new THREE.MeshStandardMaterial({map:T.floor,color:0xffffff,metalness:.55,roughness:.55,envMapIntensity:.6}),wall:new THREE.MeshStandardMaterial({map:T.wall,color:0x9aa3ae,metalness:.5,roughness:.6}),
dark:new THREE.MeshStandardMaterial({color:0x22272e,metalness:.7,roughness:.45}),frame:new THREE.MeshStandardMaterial({color:S0.metal,metalness:.65,roughness:.4}),haz:new THREE.MeshStandardMaterial({map:T.haz,metalness:.3,roughness:.6}),
lt:new THREE.MeshBasicMaterial({color:0xf2f6ff}),acc:new THREE.MeshBasicMaterial({color:S0.acc}),crate:new THREE.MeshStandardMaterial({map:T.crate,color:0xffffff,metalness:.2,roughness:.75}),
pad:new THREE.MeshStandardMaterial({map:T.pad,transparent:true,metalness:.4,roughness:.5,polygonOffset:true,polygonOffsetFactor:-2}),glass:new THREE.MeshStandardMaterial({color:0x0b1824,metalness:.9,roughness:.1,emissive:S0.acc,emissiveIntensity:.08})};
const hz=rep=>{const t2=T.haz.clone();t2.needsUpdate=true;t2.repeat.set(rep,1);(H3.tex||(H3.tex=[])).push(t2);return new THREE.MeshStandardMaterial({map:t2,metalness:.3,roughness:.6})};
const add=(geo,mat,x,y,z,rx=0,ry=0,rz=0,par=sc)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.receiveShadow=true;par.add(o);return o};
const cast=o=>{o.castShadow=true;return o};
// sol, aire d'atterrissage
add(new THREE.PlaneGeometry(H3W,H3D),M.floor,0,0,0,-Math.PI/2);add(new THREE.PlaneGeometry(24,24),M.pad,0,.03,0,-Math.PI/2);
const ring=add(new THREE.RingGeometry(12.6,13,72),new THREE.MeshBasicMaterial({color:S0.acc,transparent:true,opacity:.85,side:THREE.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4}),0,.08,0,-Math.PI/2);H3.ring=ring;
{const hm=hz(8);for(const s of[-1,1])add(new THREE.PlaneGeometry(H3D*.8,1.2),hm,s*20,.04,-8,-Math.PI/2,0,Math.PI/2)}
// murs, plafond, piliers, bandeaux lumineux
add(new THREE.PlaneGeometry(H3D,H3H),M.wall,-H3W/2,H3H/2,0,0,Math.PI/2);add(new THREE.PlaneGeometry(H3D,H3H),M.wall,H3W/2,H3H/2,0,0,-Math.PI/2);add(new THREE.PlaneGeometry(H3W,H3H),M.wall,0,H3H/2,H3D/2,0,Math.PI);
add(new THREE.PlaneGeometry(H3W,H3D),M.dark,0,H3H,0,Math.PI/2);
for(let i=0;i<7;i++){const z=-H3D/2+8+i*13.5;for(const s of[-1,1]){cast(add(RB3(2.2,H3H,2.2),M.frame,s*(H3W/2-1.1),H3H/2,z));add(new THREE.BoxGeometry(.25,H3H*.8,.25),M.lt,s*(H3W/2-2.3),H3H/2,z)}
for(let j=0;j<3;j++)add(new THREE.BoxGeometry(9,.2,1.6),M.lt,-18+j*18,H3H-.15,z)}
for(let j=0;j<3;j++)cast(add(RB3(H3W,1.4,1.4),M.dark,0,H3H-2,-20+j*20));
// portique roulant au-dessus du vaisseau (câble + crochet)
const gan=cast(add(RB3(2,1.6,H3D-10),M.frame,8,H3H-3.4,0));const hook=new THREE.Group();hook.position.set(8,H3H-4.2,4);sc.add(hook);add(new THREE.CylinderGeometry(.06,.06,7,6),M.dark,0,-3.5,0,0,0,0,hook);cast(add(RB3(1.6,1,1.6),M.haz,0,-7.4,0,0,0,0,hook));H3.hook=hook;
// porte du hangar (vers l'espace) : cadre, bandes de danger, champ de force, ciel étoilé derrière
const DW=44,DH=19,zf=-H3D/2;for(const s of[-1,1]){add(new THREE.PlaneGeometry((H3W-DW)/2,H3H),M.wall,s*(DW/2+(H3W-DW)/4),H3H/2,zf);cast(add(RB3(2.4,DH+2.4,3),M.frame,s*(DW/2+1.2),DH/2+1.2,zf));add(new THREE.PlaneGeometry(DH,1),hz(2.4),s*(DW/2+.1),DH/2,zf+1.55,0,0,Math.PI/2)}
add(new THREE.PlaneGeometry(H3W,H3H-DH),M.wall,0,DH+(H3H-DH)/2,zf);cast(add(RB3(DW+4.8,2.4,3),M.frame,0,DH+1.2,zf));for(let i=0;i<9;i++)add(new THREE.BoxGeometry(2,.35,.3),M.acc,-DW/2+3+i*(DW-6)/8,DH-.4,zf+1.6);
const ff=add(new THREE.PlaneGeometry(DW,DH),new THREE.ShaderMaterial({uniforms:{tm:{value:0},col:{value:new THREE.Color(S0.acc)}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
fragmentShader:'uniform float tm;uniform vec3 col;varying vec2 vUv;void main(){float e=smoothstep(.0,.06,vUv.x)*smoothstep(1.,.94,vUv.x)*smoothstep(0.,.08,vUv.y)*smoothstep(1.,.92,vUv.y);float w=.5+.5*sin(vUv.y*90.+tm*3.)*sin(vUv.x*40.-tm*1.7);gl_FragColor=vec4(col*(.05+.05*w+(1.-e)*.35),1.);}',transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}),0,DH/2,zf+.2);ff.receiveShadow=false;H3.ff=ff;
try{const sk=sky.clone(true);sk.scale.setScalar(.1);sc.add(sk);H3.sky=sk}catch(e){}
{const c=mkC(256,256),g=c.getContext('2d'),gr=g.createRadialGradient(80,80,10,128,128,128);const P=new THREE.Color(S0.hab).lerp(new THREE.Color(0x4a7fbf),.6);gr.addColorStop(0,'#'+P.clone().multiplyScalar(1.2).getHexString());gr.addColorStop(.55,'#'+P.clone().multiplyScalar(.55).getHexString());gr.addColorStop(1,'#04060a');g.fillStyle=gr;g.fillRect(0,0,256,256);const tx=new THREE.CanvasTexture(c);(H3.tex||(H3.tex=[])).push(tx);
const pl=new THREE.Mesh(new THREE.CircleGeometry(170,48),new THREE.MeshBasicMaterial({map:tx,fog:false}));pl.position.set(-150,-40,zf-700);sc.add(pl);const gl=sprite(0x9fc8ff,520,.25);gl.position.copy(pl.position);gl.position.z+=5;sc.add(gl)}
// salle de contrôle (vitre éclairée + écrans) au fond, emblème de la faction
add(new THREE.PlaneGeometry(30,6),M.glass,0,14,H3D/2-.2,0,Math.PI);cast(add(RB3(32,1,4),M.frame,0,10.6,H3D/2-2));
for(let i=0;i<3;i++){const tex=h3Screen(st,k,S0.acc),m=add(new THREE.PlaneGeometry(7.5,3.75),new THREE.MeshBasicMaterial({map:tex}),-10+i*10,5.6,H3D/2-.3,0,Math.PI);H3.scr.push(m)}
{const c=mkC(256,256),g=c.getContext('2d'),C='#'+new THREE.Color(S0.acc).getHexString();g.translate(128,128);g.strokeStyle=C;g.lineWidth=12;g.beginPath();g.arc(0,0,110,0,TAU);g.stroke();g.fillStyle=C;g.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU-Math.PI/2;g.lineTo(Math.cos(a)*70,Math.sin(a)*70)}g.closePath();g.globalAlpha=.85;g.fill();g.globalAlpha=1;g.fillStyle='#05080e';g.font="700 46px 'Chakra Petch',system-ui";g.textAlign='center';g.fillText(k=='pirates'?'☠':k=='guilde'?'⚒':k=='front'?'✦':'★',0,16);
const et=new THREE.CanvasTexture(c);H3.tex.push(et);add(new THREE.PlaneGeometry(9,9),new THREE.MeshBasicMaterial({map:et,transparent:true}),0,20.5,H3D/2-.3,0,Math.PI)}
// passerelle latérale avec garde-corps
cast(add(RB3(5,.5,H3D-12),M.dark,H3W/2-4.6,9,6));add(new THREE.PlaneGeometry(H3D-12,.6),hz(17),H3W/2-7.05,9.3,6,0,-Math.PI/2);for(let i=0;i<14;i++)add(new THREE.CylinderGeometry(.07,.07,1.5,6),M.frame,H3W/2-7,10,-36+i*6);add(new THREE.BoxGeometry(.12,.12,H3D-12),M.frame,H3W/2-7,10.75,6);
// caisses, fûts, chariot, tuyau de carburant
const cr=RB3(2,2,2),cr2=RB3(3,1.6,2.2),r=rng(st.x|0);for(const[x,z,n]of[[-24,-14,4],[-26,18,3],[22,24,5],[-20,30,2],[24,-26,3]])for(let i=0;i<n;i++){const big=r()<.4;cast(add(big?cr2:cr,M.crate,x+(i%2)*2.3+r()*.4,(big?.8:1)+Math.floor(i/2)*2.05,z+(i%3)*1.2,0,r()*.6-.3,0))}
const brl=new THREE.CylinderGeometry(.75,.75,1.8,14);for(let i=0;i<6;i++)cast(add(brl,i%2?M.haz:M.dark,-28+i*1.7,.9,-30+(i%2)*1.6));
const hose=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(-H3W/2+1,3,6),new V3(-24,.3,6),new V3(-12,.3,3),new V3(-6.5,1.6,1.2)]),40,.28,8);cast(add(hose,M.dark,0,0,0));
h3Merge(sc);
// bras robotisé de soudure près de l'aile droite
{const arm=new THREE.Group();arm.position.set(9.5,0,5);sc.add(arm);cast(add(new THREE.CylinderGeometry(1.1,1.4,1,16),M.dark,0,.5,0,0,0,0,arm));const s1=new THREE.Group();s1.position.y=1;arm.add(s1);cast(add(RB3(.7,4.2,.7),M.haz,0,2.1,0,0,0,0,s1));
const s2=new THREE.Group();s2.position.y=4.2;s1.add(s2);cast(add(RB3(.55,3.4,.55),M.frame,0,1.7,0,0,0,0,s2));const tip=new THREE.Group();tip.position.y=3.4;s2.add(tip);add(new THREE.ConeGeometry(.22,.7,10),M.dark,0,.3,0,Math.PI,0,0,tip);H3.arm={arm,s1,s2,tip}}
for(let i=0;i<14;i++){const s=sprite(0xbfe4ff,.35,1);s.material=s.material.clone();(H3.mats||(H3.mats=[])).push(s.material);s.visible=false;sc.add(s);H3.spk.push({s,v:new V3(),life:0})}
// drone de maintenance
{const d=new THREE.Group();cast(add(new THREE.SphereGeometry(.6,16,12),M.frame,0,0,0,0,0,0,d));add(new THREE.TorusGeometry(.95,.1,6,24),M.dark,0,0,0,Math.PI/2,0,0,d);const e=add(new THREE.SphereGeometry(.18,10,8),M.acc,0,0,-.55,0,0,0,d);const L=sprite(S0.acc,1.6,.8);L.position.set(0,0,-.6);d.add(L);sc.add(d);H3.dr=d}
// mécaniciens
const pts=[[[-14,-12],[14,-12],[14,14],[-14,14]],[[-22,8],[-10,20],[-22,26]],[[16,-22],[24,-6],[18,8]]];
const hsh=m=>{m.userData.noAO=1;if(DESK)m.traverse(o=>{if(o.isMesh){if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();o.castShadow=o.geometry.boundingSphere.radius>.11}})};
for(let i=0;i<(DESK?2:1);i++){const m=buildHuman({role:'mechanic',helmet:i!=1,suit:[0xe8ecf0,0xf0b040,0x6f8fb0][i]});hsh(m);const P=pts[i],p=new V3(P[0][0],0,P[0][1]);m.position.copy(p);sc.add(m);H3.npc.push({m,P,i:1,ph:r()*6,wait:r()*2,pos:p})}
{const m=buildHuman({role:'mechanic',helmet:false,suit:0xd8dde4});m.position.set(-6,0,-30);m.rotation.y=Math.PI*.15;hsh(m);sc.add(m);H3.npc.push({m,fixed:1,ph:0});
cast(add(RB3(2.4,1.2,1),M.dark,-6,1.1,-31.4));add(new THREE.PlaneGeometry(2,.9),new THREE.MeshBasicMaterial({map:h3Screen(st,k,S0.acc)}),-6,1.95,-30.8,-.6,0,0)}
// le vaisseau du joueur, posé sur l'aire (verrière ouverte si disponible)
try{const s=buildShip();s.position.set(0,2.2,0);s.rotation.y=0;s.traverse(o=>{if(o.isMesh&&!(o.material&&(o.material.transparent||o.material.blending===THREE.AdditiveBlending)))o.castShadow=true});if(typeof an3Gear=='function'){an3Gear(s,1);an3Can(s,.85)}if(s.userData.pilot)s.userData.pilot.visible=false;if(s.userData.shield)s.userData.shield.visible=false;if(s.userData.flames)for(const f of s.userData.flames){f.fl.visible=false;if(f.gs)f.gs.visible=false}sc.add(s);H3.ship=s}catch(e){console.warn(e)}
// petites lumières de position au sol autour de l'aire
for(let i=0;i<12;i++){const a=i/12*TAU,L=sprite(S0.acc,.9,.9);L.material=L.material.clone();(H3.mats||(H3.mats=[])).push(L.material);L.position.set(Math.cos(a)*13.6,.25,Math.sin(a)*13.6);sc.add(L);H3.scr.push(L)}
H3.a0=Math.random()*TAU}
function h3Free(){const sc=H3.sc;if(!sc)return;const keep=new Set(Object.values(RB3C));sc.traverse(o=>{if(o.geometry&&!keep.has(o.geometry))o.geometry.dispose()});for(const t2 of H3.tex||[])t2.dispose();H3.tex=[];for(const m of H3.mats||[])m.dispose();H3.mats=[];H3.sc=null;H3.ship=null;H3.npc=[];H3.spk=[];H3.scr=[]}
function h3Want(){try{return mode=='space'&&!!S.docked&&!S.docked.ground&&!DKA.on&&!S.dead&&!atelierOn()&&!ckActive()&&!MAP.open&&!(typeof PH!='undefined'&&PH.on)&&!(typeof MENU3!='undefined'&&MENU3.on)&&!(typeof RC!='undefined'&&RC.on)&&!(typeof JMP!='undefined'&&JMP.on)}catch(e){return false}}
function h3Anim(dt){const t3=(H3.t+=dt),cam=H3.cam,por=innerWidth<innerHeight;
// caméra : lent travelling autour du vaisseau
const a=H3.a0+Math.sin(t3*.045)*.75+t3*.012,R=por?40:31,y=7.5+Math.sin(t3*.09)*1.6;cam.position.set(Math.sin(a)*R,y,Math.cos(a)*R);cam.lookAt(0,por?-2.4:-3,0);if(H3.sky)H3.sky.position.copy(cam.position);
const asp=innerWidth/innerHeight;if(Math.abs(cam.aspect-asp)>.001){cam.aspect=asp;cam.fov=asp<1?62:46;cam.updateProjectionMatrix()}
const s=H3.ship;if(s){s.position.y=2.2+Math.sin(t3*1.1)*.05;const ud=s.userData;if(ud.nl){const bl=Math.sin(t3*4)>.7;ud.nl.visible=ud.nr.visible=bl}}
if(H3.ff)H3.ff.material.uniforms.tm.value=t3;if(H3.ring)H3.ring.material.opacity=.6+.3*Math.sin(t3*2);for(const L of H3.scr)if(L.isSprite)L.material.opacity=.5+.45*Math.sin(t3*3+L.position.x);
if(H3.hook)H3.hook.position.z=4+Math.sin(t3*.13)*14;
// mécaniciens : marchent d'un point à l'autre, s'arrêtent et gesticulent
for(const n of H3.npc){if(n.fixed){animHuman(n.m,0,0,false,false,Math.sin(t3*.4)>0?1:0,Math.sin(t3*.3)*.6);continue}
if(n.wait>0){n.wait-=dt;animHuman(n.m,n.ph,0,false,false,n.wait>1.2?1:0,null);continue}const T=n.P[n.i],dx=T[0]-n.pos.x,dz=T[1]-n.pos.z,d=Math.hypot(dx,dz);
if(d<.3){n.i=(n.i+1)%n.P.length;n.wait=1.5+Math.random()*3;continue}const sp=1.5,st=Math.min(d,sp*dt);n.pos.x+=dx/d*st;n.pos.z+=dz/d*st;n.ph+=st*2.6;const yaw=Math.atan2(-dx,-dz);let dy=yaw-n.m.rotation.y;dy=Math.atan2(Math.sin(dy),Math.cos(dy));n.m.rotation.y+=dy*Math.min(1,dt*6);animHuman(n.m,n.ph,sp,false,false,0,null)}
// drone
if(H3.dr){const d=H3.dr;d.position.set(Math.sin(t3*.31)*16,6+Math.sin(t3*.7)*2,Math.sin(t3*.23)*18);d.rotation.y=t3*.6;d.rotation.z=Math.sin(t3*1.3)*.15}
// bras de soudure : vise l'aile, étincelles et éclairs bleus
const A=H3.arm;if(A){A.arm.rotation.y=-.9+Math.sin(t3*.21)*.35;A.s1.rotation.z=.55+Math.sin(t3*.33)*.12;A.s2.rotation.z=.85+Math.sin(t3*.5)*.15;const weld=Math.sin(t3*.8)>.1;
const wp=A.tip.getWorldPosition(new V3());H3.wl.position.copy(wp);H3.wl.intensity=weld?(1.2+Math.random()*2.2):0;
if(weld&&Math.random()<dt*28){const p=H3.spk.find(q=>q.life<=0);if(p){p.s.position.copy(wp);p.v.set(rv(5),2+Math.random()*4,rv(5));p.life=.5+Math.random()*.6;p.s.visible=true}}}
for(const p of H3.spk){if(p.life<=0)continue;p.life-=dt;p.v.y-=14*dt;p.s.position.addScaledVector(p.v,dt);if(p.s.position.y<.1){p.s.position.y=.1;p.v.y*=-.35;p.v.x*=.6;p.v.z*=.6}p.s.material.opacity=Math.min(1,p.life*2);if(p.life<=0)p.s.visible=false}}
function h3Enter(){const st=S.docked;if(!H3.sc||H3.st!==st)try{h3Free();h3Build(st)}catch(e){console.warn(e);return}H3.on=true;FADE.col='0,0,0';FADE.v=1;FADE.tg=0;FADE.sp=2.4;try{noise(.5,.12,300);tone(70,52,1.2,'sine',.05)}catch(e){}}
function h3Exit(){H3.on=false;FADE.col='0,0,0';FADE.v=Math.max(FADE.v,.85);FADE.tg=0;FADE.sp=2.6}
TICK.push(()=>{const w=h3Want();if(w&&!H3.on)h3Enter();else if(!w&&H3.on)h3Exit();if(!S.docked&&H3.sc&&!H3.on)h3Free()});
{const _rfH=renderFrame;renderFrame=function(){if(H3.on&&H3.sc){h3Anim(DT||.016);if(typeof GRP!='undefined'&&GRP)GRP.uniforms.str.value=0;if(composer&&bloomOn){rpass.scene=H3.sc;rpass.camera=H3.cam;composer.render();rpass.camera=camera}else R3.render(H3.sc,H3.cam);return}_rfH()}}
// pas d'étiquettes ni de reflets d'objectif de l'espace par-dessus le hangar
{const _pj=proj;proj=function(p){if(H3.on)return{x:-1e5,y:-1e5,front:false,d:1e9};return _pj(p)}}
{const _em=edgeMarker;edgeMarker=function(...a){if(H3.on)return;return _em(...a)}}
{const _lf=lensFlares;lensFlares=function(){if(H3.on)return;return _lf()}}
