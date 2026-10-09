// ===== UNIVERS (génération par secteurs 3D) =====
const CS=4000,CDATA=new Map();
function cdata(cx,cy,cz){const k=cx+','+cy+','+cz;let c=CDATA.get(k);if(c)return c;const r=rng(seedOf(cx,cy,cz,1)),ox=cx*CS,oy=cy*CS,oz=cz*CS,home=!cx&&!cy&&!cz,disk=Math.abs(cy)<=1;c={k,cx,cy,cz,pl:null,st:null,sun:null,ast:[]};
const P=()=>({x:ox+700+r()*(CS-1400),y:oy+700+r()*(CS-1400),z:oz+700+r()*(CS-1400)});
if(!home&&disk&&r()<.3){const q=P();q.x=ox+1200+(q.x-ox-700)/(CS-1400)*(CS-2400);q.z=oz+1200+(q.z-oz-700)/(CS-1400)*(CS-2400);c.pl={...q,r:560+r()*560,hue:r()*360,ring:r()<.28,name:NA[r()*10|0]+SU[r()*6|0]+'-'+(Math.abs(cx*7+cz*13+cy*3)%90+10)};c.pl.y=oy+CS/2+(r()-.5)*1600}
if(home)c.st={x:0,y:0,z:0,n:'Base Alpha'};else if(disk&&r()<.2){const q=P();q.n='Station '+NA[r()*10|0]+(Math.abs(cx*3+cz*5)%9+1);if(!c.pl||Math.hypot(q.x-c.pl.x,q.y-c.pl.y,q.z-c.pl.z)>c.pl.r+700)c.st=q}
const field=r()<.18,n=field?22+r()*16|0:(disk?4:1)+r()*8|0,fc=P();for(let i=0;i<n;i++){const a=field?{x:fc.x+(r()-.5)*1500,y:fc.y+(r()-.5)*600,z:fc.z+(r()-.5)*1500}:P();a.r=8+r()*28;a.v=r()*8|0;a.m=r()*4|0;a.ore=r()<.3;a.rx=r()*TAU;a.ry=r()*TAU;a.sp=(r()-.5)*.6;
if(home&&Math.hypot(a.x,a.y,a.z)<700)continue;if(c.pl&&Math.hypot(a.x-c.pl.x,a.y-c.pl.y,a.z-c.pl.z)<c.pl.r+a.r+80)continue;a.id=i;c.ast.push(a)}
if(!home&&cy==0&&Math.abs(cx)+Math.abs(cz)>2&&((cx%3)+3)%3==1&&((cz%3)+3)%3==1&&h3(cx,cy,cz,99)<.45){const ty=SUNS[h3(cx,cy,cz,98)*4|0],s={x:ox+CS/2+(h3(cx,cy,cz,100)-.5)*1200,y:oy+CS/2+(h3(cx,cy,cz,101)-.5)*800,z:oz+CS/2+(h3(cx,cy,cz,102)-.5)*1200,r:520+h3(cx,cy,cz,103)*380,col:ty[0],core:ty[1],name:ty[2]};c.sun=s;c.pl=null;c.st=null;c.ast=c.ast.filter(a=>Math.hypot(a.x-s.x,a.y-s.y,a.z-s.z)>s.r+400)}
CDATA.set(k,c);return c}
const cof=v=>Math.floor(v/CS);
// soleil le plus proche (mis en cache par secteur)
const SUNC=new Map();function sunNear(x,y,z){const cx=cof(x),cy=cof(y),cz=cof(z),k=cx+','+cy+','+cz;if(SUNC.has(k))return SUNC.get(k);let best=null,bd=1e12;for(let i=-3;i<=3;i++)for(let j=-1;j<=1;j++)for(let l=-3;l<=3;l++){const s=cdata(cx+i,clamp(cy+j,-1,1),cz+l).sun;if(s){const d=Math.hypot(s.x-x,s.y-y,s.z-z);if(d<bd){bd=d;best=s}}}SUNC.set(k,best);return best}
const DEF_SUN=new V3(.55,.45,.7).normalize();
function lightFor(x,y,z){const s=sunNear(x,y,z);if(!s)return{dir:DEF_SUN.clone(),col:new THREE.Color(0xc8d4ff),k:0};const d=new V3(s.x-x,s.y-y,s.z-z),l=d.length();return{dir:d.normalize(),col:new THREE.Color(s.col).lerp(new THREE.Color(0xffffff),.35),k:clamp(1-l/16000,0,1),d:l,s}}
// objets chargés
const LOADED=new Map(),SMALL=new Map(),DEAD=new Map();
const planets=[],suns=[],stations=[],asts=[];
function loadBig(c){const o={};if(DESK&&c.pl&&!c.pl.mesh){const p=c.pl;p.mesh=buildPlanetGPU(p);scene.add(p.mesh);planets.push(p)}else if(c.pl&&!c.pl.mesh&&!c.pl.pending){c.pl.pending=1;const p=c.pl;job(planetTexGen(p),tx=>{p.pending=0;if(!LOADED.has(c.k))return;p.mesh=buildPlanet(p,tx);const L=lightFor(p.x,p.y,p.z);p.mesh.userData.U.sunDir.value.copy(L.dir);p.mesh.userData.U.sunCol.value.copy(L.col).multiplyScalar(L.s?1.1:.9);scene.add(p.mesh);planets.push(p)},()=>Math.hypot(p.x-S.pos.x,p.y-S.pos.y,p.z-S.pos.z))}
if(c.sun&&!c.sun.mesh){c.sun.mesh=buildSun(c.sun);scene.add(c.sun.mesh);suns.push(c.sun)}LOADED.set(c.k,c)}
function disposeObj(o){o.traverse(m=>{if(m.geometry&&!AGEO.includes(m.geometry)&&m.geometry!==OREG)m.geometry.dispose();if(m.material&&m.material.uniforms){for(const u of Object.values(m.material.uniforms))if(u.value&&u.value.isTexture)u.value.dispose();m.material.dispose()}else if(m.material&&m.material.map&&m.isMesh){m.material.map.dispose();m.material.dispose()}})}
function unloadBig(c){if(c.pl&&c.pl.mesh){scene.remove(c.pl.mesh);disposeObj(c.pl.mesh);c.pl.mesh=null;planets.splice(planets.indexOf(c.pl),1)}if(c.sun&&c.sun.mesh){scene.remove(c.sun.mesh);c.sun.mesh=null;suns.splice(suns.indexOf(c.sun),1)}LOADED.delete(c.k)}
function loadSmall(c){const dead=DEAD.get(c.k)||new Set();DEAD.set(c.k,dead);const list=[];
for(const a of c.ast){if(dead.has(a.id))continue;const m=new THREE.Mesh(AGEO[a.v],AMAT[a.m]);m.position.set(a.x,a.y,a.z);m.scale.setScalar(a.r);m.rotation.set(a.rx,a.ry,0);if(a.ore)for(let i=0;i<3;i++){const o=new THREE.Mesh(OREG,MAT.ore);const d=new V3(rv(1),rv(1),rv(1)).normalize().multiplyScalar(.95);o.position.copy(d);o.scale.setScalar(.09);m.add(o)}
scene.add(m);const A={...a,mesh:m,hp:a.r/6,ck:c.k,pos:m.position};asts.push(A);list.push(A)}
if(c.st&&!c.st.mesh){c.st.mesh=buildStation();c.st.mesh.position.set(c.st.x,c.st.y,c.st.z);c.st.mesh.lookAt(0,c.st.y,0);scene.add(c.st.mesh);stations.push(c.st)}SMALL.set(c.k,{c,list})}
function unloadSmall(k){const e=SMALL.get(k);for(const A of e.list){if(A.mesh.parent)scene.remove(A.mesh);const i=asts.indexOf(A);if(i>=0)asts.splice(i,1)}if(e.c.st&&e.c.st.mesh){scene.remove(e.c.st.mesh);e.c.st.mesh=null;stations.splice(stations.indexOf(e.c.st),1)}SMALL.delete(k)}
let lastCK='';function streamWorld(){const cx=cof(S.pos.x),cy=cof(S.pos.y),cz=cof(S.pos.z),k=cx+','+cy+','+cz;if(k==lastCK)return;lastCK=k;
const want=new Set();for(let i=-3;i<=3;i++)for(let j=-1;j<=1;j++)for(let l=-3;l<=3;l++){const yy=cy+j;if(Math.abs(yy)>1)continue;const c=cdata(cx+i,yy,cz+l);if(Math.abs(i)==3||Math.abs(l)==3){if(!c.sun)continue}want.add(c.k);if(!LOADED.has(c.k))loadBig(c)}
for(const[k2,c]of LOADED)if(!want.has(k2))unloadBig(c);
const ws=new Set();for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(let l=-1;l<=1;l++){const c=cdata(cx+i,cy+j,cz+l);ws.add(c.k);if(!SMALL.has(c.k))loadSmall(c)}
for(const k2 of[...SMALL.keys()])if(!ws.has(k2))unloadSmall(k2)}
function killAst(A){scene.remove(A.mesh);asts.splice(asts.indexOf(A),1);const d=DEAD.get(A.ck);d&&d.add(A.id)}
