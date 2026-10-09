// ===== SURFACE DES PLANÈTES (3D) =====
const SURF={scene:new THREE.Scene()};
(()=>{const sc=SURF.scene,hemi=new THREE.HemisphereLight(0xbfd8ff,0x30251a,.75),dl=new THREE.DirectionalLight(0xffffff,1.05);sc.add(hemi,dl,dl.target);
const SWD=3200,HALF=SWD/2,SEG=DESK?230:(LOWQ?110:150),AMP=420;if(DESK){dl.castShadow=true;dl.shadow.mapSize.set(2048,2048);const c=dl.shadow.camera;c.left=-450;c.right=450;c.top=450;c.bottom=-450;c.near=20;c.far=2800;dl.shadow.bias=-.0004;dl.shadow.normalBias=.8}
const WXN={cendres:'Pluie de cendres',sable:'Tempête de sable',pluie:'Pluie',neige:'Neige',paillettes:'Poussière cristalline'};
const WX={Volcanique:'cendres',Désertique:'sable',Jungle:'pluie',Océanique:'pluie',Glacée:'neige',Cristalline:'paillettes'};
function vnoise(r,N){const g=[];for(let i=0;i<N*N;i++)g.push(r());return(x,y)=>{x=clamp(x,0,1)*(N-1);y=clamp(y,0,1)*(N-1);const i=Math.min(N-2,x|0),j=Math.min(N-2,y|0),fx=x-i,fy=y-j,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy),a=g[j*N+i],b=g[j*N+i+1],c=g[(j+1)*N+i],d=g[(j+1)*N+i+1];return a+(b-a)*sx+(c-a+(d-c-b+a)*sx)*sy}}
function tile(draw,n=128){const c=mkC(n),g=c.getContext('2d');draw(g,n);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
const r0=rng(9191);
const LAVA=tile((g,n)=>{g.fillStyle='#ff5a10';g.fillRect(0,0,n,n);for(let i=0;i<40;i++){const x=r0()*n,y=r0()*n,rr=6+r0()*18;for(const ox of[-n,0,n])for(const oy of[-n,0,n]){const gr=g.createRadialGradient(x+ox,y+oy,0,x+ox,y+oy,rr);gr.addColorStop(0,'rgba(255,240,150,.9)');gr.addColorStop(1,'rgba(255,120,20,0)');g.fillStyle=gr;g.fillRect(x+ox-rr,y+oy-rr,rr*2,rr*2)}}for(let i=0;i<14;i++){const x=r0()*n,y=r0()*n;g.fillStyle='rgba(60,10,0,.55)';g.beginPath();g.ellipse(x,y,4+r0()*10,2+r0()*5,r0()*3,0,TAU);g.fill()}});
const RIP=tile((g,n)=>{g.fillStyle='#808080';g.fillRect(0,0,n,n);g.lineCap='round';for(let i=0;i<60;i++){const x=r0()*n,y=r0()*n,w=6+r0()*16;g.strokeStyle=`rgba(255,255,255,${.25+r0()*.4})`;g.lineWidth=1+r0()*1.5;for(const ox of[-n,0,n])for(const oy of[-n,0,n]){g.beginPath();g.moveTo(x+ox,y+oy);g.quadraticCurveTo(x+ox+w/2,y+oy-3,x+ox+w,y+oy);g.stroke()}}});
let F=null,F_dome=null;const _a=new V3(),_b=new V3();
function clear(){while(sc.children.length>3)sc.remove(sc.children[3]);}
SURF.height=(x,z)=>F?F.h(x,z):0;
SURF.enter=function(p,entry){clearWeapons();const r=rng(seedOf(p.x,p.y,p.z,7)),n1=vnoise(r,6),n2=vnoise(r,26),n3=vnoise(r,70),ty=ptype(p),hu=p.hue,lq=ty=='Océanique'?.5:ty=='Désertique'?.18:.33;clear();
const h0=(x,z)=>{const u=(x+HALF)/SWD,v=(z+HALF)/SWD,val=n1(u,v)*.62+n2(u,v)*.3+n3(u,v)*.08,e=Math.max(Math.abs(x),Math.abs(z))/HALF;return(val-lq)*AMP+(e>.82?Math.pow((e-.82)/.18,2)*380:0)};
// avant-poste : on cherche un terrain plat au sec près de la zone d'arrivée, puis on l'aplanit
const OP=(()=>{let best=null;for(let k=0;k<90;k++){const a=r()*TAU,d=240+r()*420,x=Math.cos(a)*d,z=Math.sin(a)*d+200,y=h0(x,z);if(y<16)continue;let sl=0;for(const[dx,dz]of[[70,0],[-70,0],[0,70],[0,-70],[50,50],[-50,-50]])sl=Math.max(sl,Math.abs(h0(x+dx,z+dz)-y));if(!best||sl<best.sl)best={x,z,y,sl}}return best})();
const h=(x,z)=>{const y=h0(x,z);if(!OP)return y;const d=Math.hypot(x-OP.x,z-OP.z);if(d>170)return y;const k=d<105?1:1-(d-105)/65,kk=k*k*(3-2*k);return y+(OP.y-y)*kk};
const valAt=(x,z)=>{const u=(x+HALF)/SWD,v=(z+HALF)/SWD;return n1(u,v)*.62+n2(u,v)*.3+n3(u,v)*.08};
// relief
const geo=new THREE.PlaneGeometry(SWD,SWD,SEG,SEG).rotateX(-Math.PI/2),pos=geo.attributes.position,cols=new Float32Array(pos.count*3);
for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),y=h(x,z),v=valAt(x,z);pos.setY(i,y);let c;
const Lq=ty=='Volcanique'?hsl(15,.6,.12):ty=='Océanique'?hsl(45,.35,.55):ty=='Glacée'?hsl(200,.3,.7):hsl(hu+25,.4,.3);
const lh=ty=='Océanique'?95:hu,jit=(h3(i,7,3,1)-.5)*.06;let T=ty=='Glacée'?hsl(205,.18,.58+v*.16+jit):ty=='Volcanique'?hsl(hu+(v-.5)*30,.3,.1+v*.26+jit):hsl(lh+(v-.5)*36,ty=='Désertique'?.5:ty=='Océanique'?.3:.4,.2+v*.32+jit);
const sb=clamp(1-Math.abs(y-6)/14,0,1)*.9;if(sb>0){const S2=ty=='Volcanique'?hsl(10,.3,.08):ty=='Glacée'?hsl(200,.35,.65):ty=='Océanique'?hsl(44,.4,.6):hsl(hu+40,.35,.52);T=T.map((q,k)=>q*(1-sb)+S2[k]*sb)}
c=y<0?Lq:T;if(y>150&&ty!='Volcanique'&&ty!='Désertique'&&ty!='Glacée'){const sn=clamp((y-150)/60,0,1);c=c.map(q=>q*(1-sn)+225*sn)}cols.set([c[0]/255,c[1]/255,c[2]/255],i*3)}
geo.setAttribute('color',new THREE.BufferAttribute(cols,3));geo.computeVertexNormals();{const nm=geo.attributes.normal,rock=ty=='Glacée'?[.45,.5,.58]:ty=='Volcanique'?[.12,.08,.07]:[.38,.33,.3];for(let i=0;i<nm.count;i++){const sl=clamp((.9-nm.getY(i))/.25,0,1)*.75;if(sl>0&&pos.getY(i)>2)for(let k=0;k<3;k++)cols[i*3+k]=cols[i*3+k]*(1-sl)+rock[k]*sl}}const terr=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,metalness:0,envMapIntensity:.15}));terr.receiveShadow=terr.castShadow=DESK;detailTerrain(terr.material,ty);sc.add(terr);
// liquide
let liq=null,lmat;if(ty=='Volcanique'){lmat=new THREE.MeshPhongMaterial({color:0xff6a10,emissive:0xff3a00,emissiveMap:LAVA,map:LAVA,shininess:20});LAVA.repeat.set(26,26)}
else if(ty=='Glacée')lmat=new THREE.MeshPhongMaterial({color:DESK?0x7fa8c4:0xcfefff,emissive:DESK?0x000000:0x203040,shininess:140,specular:DESK?0x667788:0xffffff});
else if(DESK){const dc=ty=='Océanique'?0x0b3a6a:ty=='Jungle'?0x0f3a34:new THREE.Color().setHSL(((hu+25)%360)/360,.55,.18).getHex(),scc=ty=='Océanique'?0x2a8fb0:ty=='Jungle'?0x2f7a68:new THREE.Color().setHSL(((hu+40)%360)/360,.55,.38).getHex();lmat=waterMat(dc,scc)}
else{lmat=new THREE.MeshPhongMaterial({color:ty=='Océanique'?0x1d5fa0:ty=='Jungle'?0x2a6a60:new THREE.Color().setHSL(((hu+25)%360)/360,.5,.3).getHex(),map:RIP,transparent:true,opacity:.86,shininess:110,specular:0xbbddff});RIP.repeat.set(34,34)}
const lg=new THREE.PlaneGeometry(SWD*1.6,SWD*1.6,40,40).rotateX(-Math.PI/2);liq=new THREE.Mesh(lg,lmat);sc.add(liq);
// ciel, brouillard, lumière
const fogC=ty=='Désertique'?new THREE.Color(0xc7915a):ty=='Volcanique'?new THREE.Color(0x3a1c14):ty=='Glacée'?new THREE.Color(0x9fb8cc):ty=='Jungle'?new THREE.Color(0x6f8f88):ty=='Océanique'?new THREE.Color(0x7aa0c4):new THREE.Color().setHSL(hu/360,.35,.55);
sc.background=fogC.clone();sc.fog=new THREE.Fog(fogC,220,ty=='Désertique'?1300:1900);{const sg=new THREE.SphereGeometry(5000,24,12),sp=sg.attributes.position,sc2=new Float32Array(sp.count*3),top=fogC.clone().lerp(new THREE.Color(ty=='Volcanique'?0x120404:ty=='Glacée'?0x5a8ec4:0x1c3a78),.75);for(let i=0;i<sp.count;i++){const k=clamp(sp.getY(i)/5000*2.2,0,1);const c=fogC.clone().lerp(top,k);sc2.set([c.r,c.g,c.b],i*3)}sg.setAttribute('color',new THREE.BufferAttribute(sc2,3));const dome=new THREE.Mesh(sg,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false,depthWrite:false}));dome.renderOrder=-5;sc.add(dome);F_dome=dome}const L=p.L||lightFor(p.x,p.y,p.z);dl.color.copy(L.col);dl.intensity=ty=='Volcanique'?.6:ty=='Glacée'?.65:1;hemi.color.copy(fogC).lerp(new THREE.Color(0xffffff),.5);hemi.intensity=ty=='Glacée'?.5:.75;hemi.groundColor.set(ty=='Volcanique'?0x401008:0x2a2418);
const sunDir=new V3(.62,.36,.46).normalize();const sunS=sprite(L.col.getHex(),700,.9);sunS.position.copy(sunDir).multiplyScalar(4000);sunS.material=sunS.material.clone();sunS.material.fog=false;sc.add(sunS);const sunH=sprite(L.col.getHex(),2600,.35);sunH.material=sunH.material.clone();sunH.material.fog=false;sunS.add(sunH);sunH.scale.setScalar(4);
// emplacements
const onLand=(x,z,m=4)=>h(x,z)>m;const spot=(m=160,lim=HALF*.8)=>{for(let i=0;i<60;i++){const x=(r()*2-1)*lim,z=(r()*2-1)*lim;if(onLand(x,z)&&Math.hypot(x,z)>m)return new V3(x,h(x,z),z)}const x=(r()*2-1)*lim,z=(r()*2-1)*lim;return new V3(x,Math.max(0,h(x,z)),z)};
const zone=Math.min(4,Math.floor(Math.hypot(p.x,p.y,p.z)/9000)),got=G.loot[p.name]||[],dum=new THREE.Object3D(),col=new THREE.Color();
const inst=(geom,mat,list,set)=>{if(!list.length)return;const m=new THREE.InstancedMesh(geom,mat,list.length);list.forEach((o,i)=>{set(dum,o,i);dum.updateMatrix();m.setMatrixAt(i,dum.matrix);if(o.c){col.copy(o.c);m.setColorAt(i,col)}});m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.castShadow=m.receiveShadow=DESK;m.material.envMapIntensity=.2;sc.add(m);return m};
// cristaux, artefacts, tourelles
const crys=[],arts=[],tur=[],vents=[],ruins=[];const CG=new THREE.OctahedronGeometry(3.2),CM=new THREE.MeshStandardMaterial({color:0x66f6ff,emissive:0x1aa6c0,metalness:.2,roughness:.15});
for(let i=0;i<22;i++){const q=spot();if(got.includes('c'+i))continue;const m=new THREE.Mesh(CG,CM);m.position.copy(q).add(_a.set(0,6,0));m.add(sprite(0x50e8ff,16,.7));sc.add(m);crys.push({id:'c'+i,m,pos:m.position,ph:r()*TAU,y0:m.position.y})}
const na=r()<.7?1+(r()<.35):0;for(let i=0;i<na;i++){const q=spot(300),rw=Math.round((120+r()*120)*(1+zone*.4));const nr=7+r()*4|0;for(let j=0;j<nr;j++){const a=j/nr*TAU+r()*.3,d=34+r()*20,x=q.x+Math.cos(a)*d,z=q.z+Math.sin(a)*d;ruins.push({x,z,y:h(x,z),fall:r()<.35,a:r()*TAU,hh:10+r()*16,c:new THREE.Color().setHSL(.1,.25,.55+r()*.15)})}
if(got.includes('a'+i))continue;const m=new THREE.Mesh(new THREE.TorusKnotGeometry(3.2,.9,64,8),MAT.gold);m.position.copy(q).add(_a.set(0,9,0));m.add(sprite(0xffd060,30,.8));sc.add(m);arts.push({id:'a'+i,m,pos:m.position,rw})}
const TBM=new THREE.MeshStandardMaterial({color:0x555c6a,metalness:.6,roughness:.4}),TRM=new THREE.MeshStandardMaterial({color:0xff4a4a,emissive:0x661010});
for(let i=0;i<2+zone*2;i++){const q=spot(260),g=new THREE.Group();g.position.copy(q);const base=new THREE.Mesh(new THREE.CylinderGeometry(4,5.5,5,10),TBM);base.position.y=2.5;const head=new THREE.Group();head.position.y=7;const hb=new THREE.Mesh(new THREE.SphereGeometry(3.2,12,8),TBM),bar=new THREE.Mesh(new THREE.BoxGeometry(1.3,1.3,7),TRM);bar.position.z=-4;head.add(hb,bar);g.add(base,head);sc.add(g);
const T={g,head,pos:g.position.clone().add(_a.set(0,7,0)),hp:4*(1+zone*.35),cd:1+r()*2,r:6,max:1200,cone:.3,w:.7,foe:1};T.hit=(d,pp)=>{T.hp-=d;boom3(pp,6,0xffaa66,40);SFX.tick();if(T.hp<=0&&!T.dead){T.dead=1;G.cr+=20;boom3(T.pos,30,0xffaa44,90,true);SFX.boom();sc.remove(T.g)}};tur.push(T)}
// décors
const rocks=[];const rc=ty=='Glacée'?[.57,.1,.85]:ty=='Volcanique'?[.03,.15,.15]:[hu/360,.15,.32];for(let i=0;i<110;i++){const q=spot(40,HALF*.9);rocks.push({...q,s:1.5+r()*6,a:r()*TAU,c:new THREE.Color().setHSL(rc[0],rc[1],rc[2]+r()*.15)})}
inst(new THREE.DodecahedronGeometry(1,0),new THREE.MeshStandardMaterial({roughness:1,flatShading:true}),rocks,(d,o)=>{d.position.set(o.x,o.y+o.s*.3,o.z);d.rotation.set(o.a,o.a*2,0);d.scale.set(o.s,o.s*.7,o.s)});
if(ty=='Jungle'||ty=='Océanique'){const tr=[];const nt=ty=='Jungle'?(LOWQ?220:320):90;for(let i=0;i<nt;i++){const q=spot(90,HALF*.88);const k=1+r()*3|0;for(let j=0;j<k;j++){const x=q.x+rv(40),z=q.z+rv(40);if(!onLand(x,z,3))continue;tr.push({x,z,y:h(x,z),s:4+r()*5,c:new THREE.Color().setHSL(((ty=='Jungle'?hu:120)+rv(20))/360,.5,.2+r()*.14)})}}
const TRK=new THREE.MeshStandardMaterial({color:0x4a3220,roughness:1});
if(ty=='Jungle'){inst(new THREE.CylinderGeometry(.3,.65,1,7).translate(0,.5,0),TRK,tr,(d,o)=>{d.position.set(o.x,o.y-.5,o.z);d.rotation.set(rv(.08),o.x,rv(.08));d.scale.set(o.s*.45,o.s*1.9,o.s*.45)});
const cn=[];for(const o of tr)for(let k=0;k<4;k++){const a=k/4*TAU+o.x,rr=k?o.s*.55:0;cn.push({x:o.x+Math.cos(a)*rr,z:o.z+Math.sin(a)*rr,y:o.y+o.s*(k?1.6:2.15),s:o.s*(k?.72:.85),r:o.z+k,c:o.c.clone().offsetHSL(0,0,(k?-.03:.04)+rv(.03))})}
inst(new THREE.IcosahedronGeometry(1,1),new THREE.MeshStandardMaterial({roughness:.85,flatShading:true}),cn,(d,o)=>{d.position.set(o.x,o.y,o.z);d.rotation.set(o.r,o.r*1.3,0);d.scale.set(o.s,o.s*.8,o.s)});
const bu=[];for(let i=0;i<(DESK?420:160);i++){const q=spot(30,HALF*.9);bu.push({x:q.x,z:q.z,y:q.y,s:1.2+r()*2.2,c:new THREE.Color().setHSL((hu+rv(25))/360,.45,.18+r()*.12)})}
inst(new THREE.IcosahedronGeometry(1,0),new THREE.MeshStandardMaterial({roughness:.9,flatShading:true}),bu,(d,o)=>{d.position.set(o.x,o.y+o.s*.35,o.z);d.rotation.set(o.x,o.z,0);d.scale.set(o.s*1.3,o.s*.7,o.s*1.3)})}
else{inst(new THREE.CylinderGeometry(.25,.45,1,6).translate(0,.5,0),TRK,tr,(d,o)=>{d.position.set(o.x,o.y-.5,o.z);d.rotation.set(0,0,0);d.scale.set(o.s*.4,o.s*1.2,o.s*.4)});
const co=[];for(const o of tr)for(let k=0;k<3;k++)co.push({x:o.x,z:o.z,y:o.y+o.s*(.8+k*.7),s:o.s*(1.05-k*.28),c:o.c.clone().offsetHSL(-.05,0,k*.03)});
inst(new THREE.ConeGeometry(1,1.4,8).translate(0,.7,0),new THREE.MeshStandardMaterial({roughness:.85,flatShading:true}),co,(d,o)=>{d.position.set(o.x,o.y,o.z);d.rotation.set(0,o.x,0);d.scale.set(o.s,o.s,o.s)})}}
if(ty=='Cristalline'){const sh=[];for(let i=0;i<70;i++){const q=spot(90,HALF*.88),n=3+r()*4|0;for(let j=0;j<n;j++)sh.push({x:q.x,z:q.z,y:q.y,l:10+r()*24,w:1.5+r()*2.5,rx:rv(.6),rz:rv(.6),c:new THREE.Color().setHSL((180+r()*100)/360,.8,.6)})}
inst(new THREE.ConeGeometry(1,1,5).translate(0,.5,0),new THREE.MeshStandardMaterial({emissive:0x3a2a66,metalness:.3,roughness:.1,transparent:true,opacity:.9}),sh,(d,o)=>{d.position.set(o.x,o.y-1,o.z);d.rotation.set(o.rx,0,o.rz);d.scale.set(o.w,o.l,o.w)})}
if(ty=='Glacée'){const sp=[];for(let i=0;i<90;i++){const q=spot(90,HALF*.88),n=4+r()*3|0;for(let j=0;j<n;j++)sp.push({x:q.x,z:q.z,y:q.y,l:6+r()*16,w:1+r()*1.5,rx:rv(.7),rz:rv(.7),c:new THREE.Color().setHSL(.55,.4,.85+r()*.1)})}
inst(new THREE.ConeGeometry(1,1,4).translate(0,.5,0),new THREE.MeshStandardMaterial({metalness:.2,roughness:.15}),sp,(d,o)=>{d.position.set(o.x,o.y-1,o.z);d.rotation.set(o.rx,0,o.rz);d.scale.set(o.w,o.l,o.w)})}
if(ty=='Désertique')for(let i=0;i<5;i++){const q=spot(300),n=6+r()*7|0;for(let j=0;j<n;j++){const x=q.x+rv(120),z=q.z+rv(120);ruins.push({x,z,y:h(x,z),fall:r()<.4,a:r()*TAU,hh:10+r()*18,c:new THREE.Color().setHSL(.1,.3,.55+r()*.15)})}}
{const RM=new THREE.MeshStandardMaterial({roughness:.85,map:HULLT}),cols=ruins.filter(o=>!o.fall),fall=ruins.filter(o=>o.fall);
inst(new THREE.CylinderGeometry(1,1.1,1,12),RM,cols,(d,o)=>{d.position.set(o.x,o.y+o.hh/2-1,o.z);d.rotation.set(rv(.05),o.a,rv(.05));d.scale.set(2.2,o.hh,2.2)});
inst(new THREE.BoxGeometry(1,1,1),RM,cols,(d,o)=>{d.position.set(o.x,o.y+o.hh-1,o.z);d.rotation.set(0,o.a,0);d.scale.set(5.6,1.4,5.6)});
inst(new THREE.BoxGeometry(1,1,1),RM,cols,(d,o)=>{d.position.set(o.x,o.y-.4,o.z);d.rotation.set(0,o.a,0);d.scale.set(6,1.2,6)});
inst(new THREE.CylinderGeometry(1,1.1,1,12),RM,fall,(d,o)=>{d.position.set(o.x,o.y+2,o.z);d.rotation.set(0,o.a,Math.PI/2);d.scale.set(2.2,o.hh,2.2)});
const blk=[];for(const o of fall)for(let k=0;k<3;k++)blk.push({x:o.x+rv(8),z:o.z+rv(8),y:o.y,s:1+Math.random()*1.6,a:Math.random()*3,c:o.c});
inst(new THREE.BoxGeometry(1,1,1),RM,blk,(d,o)=>{d.position.set(o.x,o.y+o.s*.4,o.z);d.rotation.set(o.a*.3,o.a,o.a*.2);d.scale.set(o.s*1.6,o.s,o.s*1.2)});
const arch=ruins.filter((o,i)=>i%5==0&&!o.fall);inst(new THREE.TorusGeometry(7,1.4,8,18,Math.PI),RM,arch,(d,o)=>{d.position.set(o.x+6,o.y+o.hh*.6,o.z);d.rotation.set(0,o.a,0);d.scale.set(1,1,1)})}
if(ty=='Volcanique')for(let i=0;i<9;i++){const q=spot(260),m=new THREE.Mesh(new THREE.CylinderGeometry(6,12,8,12),new THREE.MeshStandardMaterial({color:0x1a0d08,roughness:1}));m.position.copy(q).add(_a.set(0,3,0));const gs=sprite(0xff7020,40,.7);gs.position.y=5;m.add(gs);sc.add(m);vents.push({pos:q.clone(),m,gs,cd:2+r()*6,er:0})}
// météo
const wx=WX[ty],NW=wx=='pluie'?(LOWQ?500:800):wx=='sable'?700:wx=='neige'?600:wx=='cendres'?500:300,wp=new Float32Array(NW*(wx=='pluie'?6:3)),wd=[];for(let i=0;i<NW;i++)wd.push({x:rv(260),y:rv(150),z:rv(260),s:Math.random()});
const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.BufferAttribute(wp,3));let wm;
if(wx=='pluie')wm=new THREE.LineSegments(wg,new THREE.LineBasicMaterial({color:0xbcd4ff,transparent:true,opacity:.45,fog:false}));
else wm=new THREE.Points(wg,new THREE.PointsMaterial({color:wx=='neige'?0xffffff:wx=='sable'?0xe6b47a:wx=='cendres'?0xff8a3a:new THREE.Color().setHSL(((hu+60)%360)/360,.9,.75).getHex(),size:wx=='neige'?2.4:wx=='sable'?1.6:2.2,map:GLOW,transparent:true,depthWrite:false,blending:wx=='sable'?THREE.NormalBlending:ADDB,fog:false}));
wm.frustumCulled=false;sc.add(wm);
const CL=[];{const ccol=ty=='Volcanique'?new THREE.Color(0x4a3830):ty=='Désertique'?new THREE.Color(0xd8b088):fogC.clone().lerp(new THREE.Color(0xffffff),.6).multiplyScalar(.9),nC=(DESK?30:12)*(ty=='Désertique'?.5:1);
const sh=ccol.clone().multiplyScalar(.72);for(let i=0;i<nC;i++){const cx=rv(HALF*.85),cz=rv(HALF*.85),cy=320+r()*170,np=DESK?9:6;for(let j=0;j<np;j++){const top=j<np/2;const s=fxSprite(SMOKET,THREE.NormalBlending,top?ccol:sh,ty=='Volcanique'?.8:.72);s.material.fog=true;s.material.rotation=r()*TAU;const sz=110+r()*130;s.scale.setScalar(sz);s.position.set(cx+rv(95),cy+(top?rv(14)+16:rv(14)-8),cz+rv(95));sc.add(s);CL.push({s,sz})}}}
CLOUDC=ty=='Volcanique'?'60,44,38':ty=='Désertique'?'220,180,140':'238,242,248';
// vaisseau et particules dans cette scène
sc.add(ship,SPK.pts,FIRE.pts);SPK.clear();FIRE.clear();ship.traverse(o=>{if(o.isMesh&&!o.material.blending)o.castShadow=DESK});if(lmat.uniforms){lmat.uniforms.sky.value.copy(fogC).lerp(new THREE.Color(0xffffff),.15);lmat.uniforms.sunCol.value.copy(L.col)}for(const o of [...crys.map(c=>c.m),...arts.map(a=>a.m),...tur.map(T=>T.g)])o.traverse(m=>{if(m.isMesh)m.castShadow=DESK});
initGrass(sc,h,ty,hu);const ang=new V3(S.pos.x-p.x,S.pos.y-p.y,S.pos.z-p.z).normalize();
F={sunS,sunDir,clouds:CL,dome:F_dome,p,ty,lq,h,hu,terr,liq,lmat,crys,arts,tur,vents,wx,wm,wg,wp,wd,fog:sc.fog,fogC,storm:0,flash:0,ang,hemiI:hemi.intensity,onLiq:false,op:OP,HALF,zone};if(SURF.onEnter)SURF.onEnter(F,sc);
for(const b of PB)rmPB(b);PB=[];for(const b of EB)b.m.parent&&b.m.parent.remove(b.m);EB=[];for(const d of DROPS)d.m.parent&&d.m.parent.remove(d.m);DROPS=[];for(const e of en)e.mesh.parent&&e.mesh.parent.remove(e.mesh);en=[];
mode='surf';S.docked=null;if(entry){S.pos.set(rv(150),660,650);S.q.setFromEuler(new THREE.Euler(-.34,0,0));S.spd=190;fwd();S.vel.copy(_f).multiplyScalar(190)}else{S.pos.set(0,Math.max(0,h(0,0))+70,0);S.q.setFromEuler(new THREE.Euler(-.15,0,0));S.vel.set(0,0,0);S.spd=40}camInit=true;
SFX.disc();toast('Atterrissage sur '+p.name+' — '+ty.toLowerCase()+' · '+WXN[wx].toLowerCase())};
SURF.exit=function(dead){if(!F)return;if(SURF.onExit)SURF.onExit(dead);clearWeapons();GRASS=null;const p=F.p;scene.add(ship,SPK.pts,FIRE.pts);SPK.clear();FIRE.clear();for(const b of PB)rmPB(b);PB=[];for(const b of EB)b.m.parent&&b.m.parent.remove(b.m);EB=[];
if(!dead){S.pos.set(p.x,p.y,p.z).addScaledVector(F.ang,p.r*1.6+120);S.q.setFromUnitVectors(new V3(0,0,-1),F.ang);S.vel.copy(F.ang).multiplyScalar(80);S.spd=cruise();SFX.buy()}
clear();F=null;mode='space';camInit=true;save()};
SURF.update=function(dt){if(!F)return;if(S.ascent)ascentUpdate(dt);else if(!S.dead){if(FOOT.on)footUpdate(dt,F);else fly(dt,{rate:1.15,minSpd:8,surf:true})}if(!F)return;if(!FOOT.on){
// sol, plafond, bords
const gy=Math.max(F.h(S.pos.x,S.pos.z),F.ty=='Glacée'?0:0)+6;if(S.pos.y<gy){S.pos.y=gy;if(S.vel.y<0){if(S.vel.y<-70){damage(5,'col');boom3(S.pos,10,0xbbaa88,40)}S.vel.y*=-.3}fwd();if(_f.y<-.2){_q.setFromAxisAngle(AX,dt*1.6);S.q.multiply(_q)}}
if(S.pos.y>720&&!S.ascent){S.pos.y-=(S.pos.y-720)*dt*2;if(!F.ceilT||t-F.ceilT>5){F.ceilT=t;toast('Altitude maximale — appuie sur DÉCOLLER pour quitter')}}
const lim=HALF*.9;if(Math.abs(S.pos.x)>lim||Math.abs(S.pos.z)>lim){S.pos.x=clamp(S.pos.x,-lim,lim);S.pos.z=clamp(S.pos.z,-lim,lim);S.vel.multiplyScalar(.5)}
const ground=F.h(S.pos.x,S.pos.z);F.onLiq=ground<0&&S.pos.y<26;if(F.onLiq&&F.ty=='Volcanique'){damage(9*dt);if(Math.random()<dt*6)FIRE.emit(S.pos.x,S.pos.y-4,S.pos.z,rv(10),20,rv(10),.6,1,.5,.1,.5)}}
// liquide animé
if(F.ty=='Volcanique'){LAVA.offset.x=t*.008;LAVA.offset.y=t*.005;F.lmat.emissiveIntensity=.75+.25*Math.sin(t*1.7)}else if(F.ty!='Glacée'){RIP.offset.x=t*.012;RIP.offset.y=t*.007;const lp=F.liq.geometry.attributes.position;for(let i=0;i<lp.count;i++){const x=lp.getX(i),z=lp.getZ(i);lp.setY(i,Math.sin(x*.012+t*1.4)*1.6+Math.cos(z*.015+t*1.1)*1.3)}lp.needsUpdate=true}
// geysers
for(const v of F.vents){v.cd-=dt;if(v.cd<=0&&!v.er){v.er=1.6;v.cd=4+Math.random()*5;if(v.pos.distanceTo(S.pos)<600){SFX.rock();shake=Math.min(1.2,shake+.5)}}const warm=v.er>0?1:clamp(1-v.cd/1.5,0,1);v.gs.scale.setScalar(30+warm*60+Math.sin(t*6)*4);
if(v.er>0){v.er-=dt;for(let i=0;i<6;i++)FIRE.emit(v.pos.x+rv(4),v.pos.y+6,v.pos.z+rv(4),rv(30),90+Math.random()*120,rv(30),.8+Math.random()*.6,1,.45+Math.random()*.3,.1,.6);if(Math.hypot(S.pos.x-v.pos.x,S.pos.z-v.pos.z)<34&&S.pos.y-v.pos.y<160)damage(24*dt)}else v.er=0}
// objets
for(const c of F.crys){c.m.rotation.y+=dt*1.5;c.m.position.y=c.y0+Math.sin(t*2+c.ph)*1.5;if(c.pos.distanceTo(S.pos)<16){if(cargoUsed()+2<=cap()){S.ore+=2;c.g=1;(G.loot[F.p.name]=G.loot[F.p.name]||[]).push(c.id);SFX.pick();boom3(c.pos,14,0x88ffff,50);sc.remove(c.m)}else if(!F.full){F.full=1;toast('Soute pleine — décolle pour vendre')}}}F.crys=F.crys.filter(c=>!c.g);
for(const a of F.arts){a.m.rotation.y+=dt;a.m.rotation.x+=dt*.6;if(a.pos.distanceTo(S.pos)<20){a.g=1;(G.loot[F.p.name]=G.loot[F.p.name]||[]).push(a.id);G.cr+=a.rw;toast('Artefact ancien récupéré ! +'+a.rw+' ¢');SFX.win();boom3(a.pos,40,0xffd060,80,true);sc.remove(a.m)}}F.arts=F.arts.filter(a=>!a.g);
for(const T of F.tur){if(T.dead)continue;T.head.lookAt(_a.copy(T.pos).multiplyScalar(2).sub(S.pos));const d=T.pos.distanceTo(S.pos);T.cd-=dt;if(d<560&&T.cd<=0&&!S.dead){T.cd=1.6;const dir=_b.copy(S.pos).addScaledVector(S.vel,d/380*.8).sub(T.pos).normalize();const m=mkEB(0xff5040);m.position.copy(T.pos);EB.push({m,v:dir.clone().multiplyScalar(380),l:2.2,dmg:8});if(d<800)SFX.eshoot()}}F.tur=F.tur.filter(T=>!T.dead);
const TGS=[...F.tur,...mpTargets(),...(SURF.extra?SURF.extra():[])];if(FOOT.on){lock=null;footTool(dt,TGS)}else{lock=findLock(TGS);fireW(dt,TGS)}updPB(dt,TGS);updWeapons(dt,TGS);updEB(dt);
// météo
F.storm=.5+.5*Math.sin(t*.25+F.hu);const st=F.storm,cp=camera.position,wd=F.wd,wp=F.wp,rain=F.wx=='pluie';
for(let i=0;i<wd.length;i++){const q=wd[i];if(rain){q.y-=(320+q.s*120)*dt;q.x-=(30+50*st)*dt}else if(F.wx=='neige'){q.y-=(18+q.s*22)*dt;q.x+=Math.sin(t+q.s*10)*10*dt}else if(F.wx=='sable'){q.x+=(160+q.s*220)*st*dt+20*dt;q.y+=Math.sin(t*2+q.s*9)*6*dt}else if(F.wx=='cendres'){q.y+=(q.s<.3?30:-14)*dt;q.x+=8*dt}else{q.x+=Math.sin(t*.5+q.s*7)*6*dt;q.y+=Math.cos(t*.4+q.s*5)*6*dt}
for(const[ax,lim2]of[['x',260],['y',150],['z',260]]){if(q[ax]<-lim2)q[ax]+=lim2*2;if(q[ax]>lim2)q[ax]-=lim2*2}
const x=cp.x+q.x,y=cp.y+q.y,z=cp.z+q.z;if(rain){wp.set([x,y,z,x+3+st*4,y+9,z],i*6)}else wp.set([x,y,z],i*3)}F.wg.attributes.position.needsUpdate=true;
if(F.wx!='pluie'&&F.wx!='neige'&&F.wx!='sable'&&F.wm.material)F.wm.material.opacity=F.wx=='paillettes'?.5+.5*Math.sin(t*5):.9;
if(F.wx=='sable'){F.fog.near=60+(1-st)*160;F.fog.far=500+(1-st)*900}
if(F.ty=='Jungle'&&Math.random()<dt*.1){F.flash=1;setTimeout(()=>SFX.boom(),200+Math.random()*600)}F.flash=Math.max(0,F.flash-dt*3);hemi.intensity=F.hemiI+F.flash*2.2;
dl.position.copy(S.pos).addScaledVector(F.sunDir,1300);F.sunS.position.copy(camera.position).addScaledVector(F.sunDir,4000);SURF.sunPos=F.sunS.position;updClouds(dt);dl.target.position.copy(S.pos);if(SURF.tick)SURF.tick(dt,F);if(F.lmat.uniforms){const u=F.lmat.uniforms;u.fogColor.value.copy(F.fog.color);u.fogNear.value=F.fog.near;u.fogFar.value=F.fog.far;u.sunDir.value.copy(F.sunDir)}F.dome.position.copy(camera.position);
if(S.hp<=0)die()};
function updClouds(dt){if(!F)return;let w=0;const cp=camera.position;for(const c of F.clouds){c.s.position.x+=6*dt;if(c.s.position.x>HALF)c.s.position.x-=HALF*2;const d=c.s.position.distanceTo(cp),r0=c.sz*.42;if(d<r0)w=Math.max(w,1-d/r0)}CLOUDW=Math.min(1,w*1.6)}
SURF.info=()=>F&&{name:F.p.name,ty:F.ty,wx:WXN[F.wx],cr:F.crys.length,ar:F.arts.length,tu:F.tur.length,lava:F.onLiq&&F.ty=='Volcanique',gey:F.vents.some(v=>v.er>0&&Math.hypot(S.pos.x-v.pos.x,S.pos.z-v.pos.z)<34),arts:F.arts,tur:F.tur,crys:F.crys}})();
