// ===== PLANÈTES VIVANTES : volcans en éruption, geysers, rivières et cascades (de lave sur les mondes volcaniques), grands troupeaux qui fuient, nuées d'oiseaux =====
const NT3={F:null,vol:[],gey:[],riv:[],herds:[],flocks:[],bombs:[],mist:[],tex:{},t:0,said:{}};
const _n1=new V3(),_n2=new V3(),_nq=new THREE.Quaternion(),_nm=new THREE.Matrix4(),_ns=new V3(),_ne=new THREE.Euler();
function nt3Tex(k){if(NT3.tex[k])return NT3.tex[k];const c=mkC(128,256),g=c.getContext('2d'),r=rng(k=='lava'?51:k=='ice'?53:52);
if(k=='lava'){g.fillStyle='#3a0a02';g.fillRect(0,0,128,256);for(let i=0;i<70;i++){const x=r()*128,y=r()*256,w=6+r()*30,h=3+r()*10,gr=g.createRadialGradient(x,y,0,x,y,w);gr.addColorStop(0,'rgba(255,220,120,.95)');gr.addColorStop(.4,'rgba(255,110,20,.7)');gr.addColorStop(1,'rgba(120,20,0,0)');g.fillStyle=gr;g.beginPath();g.ellipse(x,y,w,h,0,0,TAU);g.fill()}
g.strokeStyle='rgba(30,8,4,.8)';g.lineWidth=2;for(let i=0;i<26;i++){g.beginPath();let x=r()*128,y=r()*256;g.moveTo(x,y);for(let j=0;j<5;j++){x+=r()*26-13;y+=r()*18;g.lineTo(x,y)}g.stroke()}}
else{g.fillStyle=k=='ice'?'#9fd8e8':'#2f7e96';g.fillRect(0,0,128,256);for(let i=0;i<90;i++){const x=r()*128,y=r()*256,l=10+r()*40;g.strokeStyle=`rgba(255,255,255,${.08+r()*.25})`;g.lineWidth=1+r()*2.5;g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+r()*8-4,y+l*.3,x+r()*8-4,y+l*.7,x+r()*6-3,y+l);g.stroke()}}
const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return NT3.tex[k]=t}
// ----- rivières (et cascades) : le cours suit la pente du relief jusqu'à la mer -----
function nt3River(F,sc,x,z,kind,w0){const h=F.h,P=[];let px=x,pz=z,py=h(x,z);for(let i=0;i<280;i++){P.push([px,py,pz]);if(py<=.3)break;let best=null,bh=py-.02;for(let k=0;k<12;k++){const a=k/12*TAU+i*.41,qx=px+Math.cos(a)*14,qz=pz+Math.sin(a)*14,qh=h(qx,qz);if(qh<bh){bh=qh;best=[qx,qz]}}if(!best)break;px=best[0];pz=best[1];py=bh;if(Math.abs(px)>F.HALF*.96||Math.abs(pz)>F.HALF*.96)break}
if(P.length<9)return null;const Q=P.map((p,i)=>{const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)];return new V3((a[0]+p[0]*2+b[0])/4,0,(a[2]+p[2]*2+b[2])/4)});let y=1e9;const falls=[];
for(let i=0;i<Q.length;i++){let gy=h(Q[i].x,Q[i].z);for(const[ox,oz]of[[3,0],[-3,0],[0,3],[0,-3]])gy=Math.max(gy,h(Q[i].x+ox,Q[i].z+oz)-1.2);gy+=.45;if(i>0&&y-gy>5)falls.push(i);y=gy;Q[i].y=Math.max(kind=='lava'?.15:.25,gy)}
const n=Q.length,pos=new Float32Array(n*2*3),uv=new Float32Array(n*2*2),col=new Float32Array(n*2*3),idx=[];let v=0;
for(let i=0;i<n;i++){const a=Q[Math.max(0,i-1)],b=Q[Math.min(n-1,i+1)],dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz)||1,px2=-dz/L,pz2=dx/L,w=Math.min(w0*2.2,w0+i*.05)*.5;if(i>0)v+=Q[i].distanceTo(Q[i-1])/14;
const steep=i>0?clamp((Q[i-1].y-Q[i].y)/6,0,1):0;for(let s=0;s<2;s++){const sg=s?-1:1,k=(i*2+s);pos[k*3]=Q[i].x+px2*w*sg;pos[k*3+1]=Q[i].y;pos[k*3+2]=Q[i].z+pz2*w*sg;uv[k*2]=s;uv[k*2+1]=v;const c=kind=='lava'?1:lerp(.72,.98,steep);col[k*3]=c;col[k*3+1]=c;col[k*3+2]=c}
if(i<n-1){const a2=i*2;idx.push(a2,a2+2,a2+1,a2+1,a2+2,a2+3)}}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
const tex=nt3Tex(kind).clone();tex.needsUpdate=true;const mat=kind=='lava'?new THREE.MeshBasicMaterial({map:tex,color:new THREE.Color(1.5,1.15,1),vertexColors:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})
:new THREE.MeshStandardMaterial({map:tex,vertexColors:true,transparent:true,opacity:.86,roughness:.18,metalness:.1,envMapIntensity:.6,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
const m=new THREE.Mesh(g,mat);m.receiveShadow=true;m.userData.noAO=1;sc.add(m);const R={m,tex,kind,falls:falls.sort((a,b)=>(Q[b-1].y-Q[b].y)-(Q[a-1].y-Q[a].y)).slice(0,2).map(i=>Q[i].clone()),spd:kind=='lava'?.06:kind=='ice'?0:.45};
// petit lac au bout s'il s'arrête dans un creux
const e=Q[n-1];if(e.y>1&&kind!='lava'){const lk=new THREE.Mesh(new THREE.CircleGeometry(w0*2.4,28),mat);lk.rotation.x=-Math.PI/2;lk.position.set(e.x,e.y-.05,e.z);lk.userData.noAO=1;sc.add(lk)}
NT3.riv.push(R);return R}
// ----- volcans -----
function nt3Volcano(F,sc,x,z,r){const Hh=150+r()*80,R=150+r()*60;let base=F.h(x,z);for(let k=0;k<16;k++){const a=k/16*TAU;base=Math.min(base,F.h(x+Math.cos(a)*R,z+Math.sin(a)*R))}base-=8;
const pf=[[R,-12],[R*.93,0],[R*.72,Hh*.24],[R*.48,Hh*.6],[R*.27,Hh*.9],[R*.21,Hh],[R*.16,Hh*.95],[R*.11,Hh*.86],[.5,Hh*.84]].map(p=>new THREE.Vector2(p[0],p[1]));
const g=new THREE.LatheGeometry(pf,44),P=g.attributes.position;for(let i=0;i<P.count;i++){const px=P.getX(i),pz=P.getZ(i),py=P.getY(i),a=Math.atan2(pz,px),k=1+.07*Math.sin(a*5+py*.03)+.05*Math.sin(a*11-py*.05);P.setX(i,px*k);P.setZ(i,pz*k)}g.computeVertexNormals();
const ec=mkC(64,256),eg=ec.getContext('2d'),rr=rng(61);eg.fillStyle='#000';eg.fillRect(0,0,64,256);for(let i=0;i<14;i++){const sx=rr()*64,l=40+rr()*130,gr=eg.createLinearGradient(0,0,0,l);gr.addColorStop(0,'rgba(255,150,40,1)');gr.addColorStop(1,'rgba(255,60,10,0)');eg.fillStyle=gr;eg.beginPath();eg.moveTo(sx-2,0);eg.bezierCurveTo(sx+8,l*.3,sx-8,l*.6,sx+rr()*6-3,l);eg.lineTo(sx+3,0);eg.fill()}eg.fillStyle='rgba(255,120,30,1)';eg.fillRect(0,0,64,14);
const et=new THREE.CanvasTexture(ec);et.wrapS=THREE.RepeatWrapping;et.repeat.set(3,1);const mat=new THREE.MeshStandardMaterial({color:0x2c2421,roughness:.95,metalness:0,flatShading:true,emissive:0xff5a18,emissiveMap:et,emissiveIntensity:.5});
const m=new THREE.Mesh(g,mat);m.position.set(x,base,z);m.castShadow=m.receiveShadow=DESK;sc.add(m);const top=new V3(x,base+Hh*.9,z);const gl=sprite(0xff6a20,R*.8,.55);gl.material=gl.material.clone();gl.position.copy(top);sc.add(gl);
if(GR&&GR.col)GR.col.push({x,z,r:R*.75});const V={m,mat,gl,top,R,H:Hh,base,x,z,t:20+r()*30,on:0,smT:0};NT3.vol.push(V);return V}
function nt3Bomb(p,v){const s=NT3.bombs.find(b=>!b.on);if(!s)return;s.on=1;s.p.copy(p);s.v.copy(v);s.l=5;s.s.visible=true;s.s.position.copy(p)}
// ----- geysers -----
function nt3Geyser(F,sc,x,z,r){const y=F.h(x,z),ty=F.ty,c=ty=='Glacée'?0xbcd4e0:ty=='Désertique'?0x9a7a5a:ty=='Volcanique'?0x3a2e28:0x6a6e74;
const m=new THREE.Mesh(new THREE.CylinderGeometry(2.2,9,3.2,18,1,false),new THREE.MeshStandardMaterial({color:c,roughness:.9,flatShading:true}));m.position.set(x,y+.9,z);m.receiveShadow=true;sc.add(m);
const hole=new THREE.Mesh(new THREE.CircleGeometry(2.3,16),new THREE.MeshBasicMaterial({color:0x0c0a08}));hole.rotation.x=-Math.PI/2;hole.position.set(x,y+2.53,z);sc.add(hole);
const cm=new THREE.Mesh(new THREE.CylinderGeometry(1.6,2.6,1,14,1,true),new THREE.MeshBasicMaterial({map:nt3ColTex(),transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,color:ty=='Volcanique'?0xffd0b0:0xd8f0ff}));cm.position.set(x,y+2.5,z);cm.visible=false;cm.userData.noAO=1;sc.add(cm);
const G0={x,z,y:y+2.5,cm,t:6+r()*18,st:0,ty};NT3.gey.push(G0);return G0}
function nt3ColTex(){if(NT3.tex.col)return NT3.tex.col;const c=mkC(64,128),g=c.getContext('2d'),gr=g.createLinearGradient(0,128,0,0);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(.7,'rgba(255,255,255,.35)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,128);
for(let i=0;i<40;i++){g.fillStyle=`rgba(255,255,255,${Math.random()*.25})`;g.fillRect(Math.random()*64,Math.random()*128,2+Math.random()*4,8+Math.random()*30)}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return NT3.tex.col=t}
// ----- grands troupeaux (instanciés : 2 appels de dessin pour tout le troupeau) -----
function nt3Herd(F,sc,x,z,r,col,n){const C=new THREE.Color(col),c=[C.r,C.g,C.b],dk=[C.r*.6,C.g*.6,C.b*.6],M4=(px,py,pz,sx,sy,sz,rx=0)=>new THREE.Matrix4().compose(new V3(px,py,pz),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,0,0)),new V3(sx,sy,sz));
const body=mergeG([{g:new THREE.SphereGeometry(1,10,8),m:M4(0,2.1,0,1.1,.9,1.9),c},{g:new THREE.CylinderGeometry(.3,.45,1.6,7),m:M4(0,3.1,-1.9,1,1,1,-.6),c},{g:new THREE.SphereGeometry(.5,8,7),m:M4(0,3.85,-2.45,.85,.8,1.3),c:dk},{g:new THREE.ConeGeometry(.3,1.5,6),m:M4(0,2.2,2.1,1,1,1,Math.PI/2+.4),c:dk},{g:new THREE.ConeGeometry(.09,.7,5),m:M4(.25,4.25,-2.2,1,1,1,-.5),c:dk},{g:new THREE.ConeGeometry(.09,.7,5),m:M4(-.25,4.25,-2.2,1,1,1,-.5),c:dk}]);
const leg=new THREE.CylinderGeometry(.2,.13,1.9,6).translate(0,-.95,0),mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,flatShading:true}),lm=new THREE.MeshStandardMaterial({color:new THREE.Color(...dk),roughness:.85});
const B=new THREE.InstancedMesh(body,mat,n),L=new THREE.InstancedMesh(leg,lm,n*4);B.frustumCulled=L.frustumCulled=false;B.castShadow=L.castShadow=DESK;sc.add(B,L);
const A=[];for(let i=0;i<n;i++)A.push({x:x+rv(30),z:z+rv(30),yaw:r()*TAU,ph:r()*9,sc:.75+r()*.45,ox:rv(26),oz:rv(26),v:0});
const H={B,L,A,c:new V3(x,0,z),wp:new V3(x,0,z),run:0,away:new V3(),dust:0,col};NT3.herds.push(H);return H}
// ----- nuées d'oiseaux (instanciées) -----
function nt3BirdGeo(){if(NT3.bg)return NT3.bg;const g=new THREE.BufferGeometry(),p=[0,0,-.8, -2.2,.8,.3, 0,0,.6, 0,0,-.8, 0,0,.6, 2.2,.8,.3, 0,0,-.8,0,-.15,.7,0,.12,.5];g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(p),3));g.computeVertexNormals();return NT3.bg=g}
function nt3Flock(F,sc,x,z,r,col,n){const m=new THREE.InstancedMesh(nt3BirdGeo(),new THREE.MeshLambertMaterial({color:col,side:THREE.DoubleSide}),n);m.frustumCulled=false;sc.add(m);const c=new V3(x,F.h(x,z)+80+r()*40,z),B=[];
for(let i=0;i<n;i++){B.push({p:c.clone().add(new V3(rv(30),rv(10),rv(30))),v:new V3(rv(1),rv(.2),rv(1)).normalize().multiplyScalar(18),ph:r()*9,s:1.6+r()*.9})}const FL={m,B,c,tg:c.clone(),wt:0,scare:0};NT3.flocks.push(FL);return FL}
// ----- création selon le type de planète -----
function nt3Enter(F,sc){NT3.F=F;NT3.vol=[];NT3.gey=[];NT3.riv=[];NT3.herds=[];NT3.flocks=[];NT3.mist=[];NT3.t=0;
const r=rng(seedOf(F.p.x,F.p.y,F.p.z,909)),ty=F.ty,HA=F.HALF||1600,pt=(dmin,dmax)=>{const a=r()*TAU,d=dmin+r()*(dmax-dmin);return[Math.cos(a)*d,Math.sin(a)*d]};
const high=(n,lo)=>{let best=null,bh=-1e9;for(let i=0;i<n;i++){const[x,z]=pt(250,HA*.8),h=F.h(x,z);if(h>bh&&h>lo){bh=h;best=[x,z]}}return best};
// bombes de lave (réserve de sprites)
NT3.bombs=[];if(ty=='Volcanique')for(let i=0;i<(DESK?36:20);i++){const s=sprite(0xff8a30,7,1);s.material=s.material.clone();s.visible=false;sc.add(s);NT3.bombs.push({s,p:s.position,v:new V3(),l:0,on:0})}
try{if(ty=='Volcanique'){for(let i=0;i<2;i++){const s0=high(14,25)||pt(500,HA*.75);const[x,z]=s0;const V=nt3Volcano(F,sc,x,z,r);let ok=0;for(let k=0;k<10&&ok<2;k++){const a=r()*TAU;if(nt3River(F,sc,x+Math.cos(a)*V.R*.95,z+Math.sin(a)*V.R*.95,'lava',7))ok++}}for(let i=0;i<2;i++){const[x,z]=pt(150,900);nt3Geyser(F,sc,x,z,r)}}
else if(ty=='Jungle'||ty=='Océanique'){let ok=0;for(let i=0;i<10&&ok<(ty=='Jungle'?3:2);i++){const s=high(20,6);if(s&&nt3River(F,sc,s[0],s[1],'water',8+r()*5))ok++}}
if(ty=='Glacée'||ty=='Désertique'||ty=='Cristalline'){for(let i=0;i<(ty=='Glacée'?3:2);i++){const[x,z]=pt(150,900);nt3Geyser(F,sc,x,z,r)}if(ty=='Glacée'){const s=high(24,10);if(s)nt3River(F,sc,s[0],s[1],'ice',7)}}
const hc={Jungle:0x7a5a3a,Désertique:0xb08858,Glacée:0xd8d4cc,Océanique:0x8a7a6a,Cristalline:0x8a7ab0,Volcanique:0x4a3a34}[ty];if(ty!='Volcanique'){const[x,z]=pt(300,800);nt3Herd(F,sc,x,z,r,hc,DESK?14:9)}
const bc={Jungle:0x2a2018,Désertique:0x3a2a20,Glacée:0x2a3038,Océanique:0xe8ecf0,Cristalline:0x6a4aa0,Volcanique:0x1a1614}[ty];for(let i=0;i<(ty=='Jungle'||ty=='Océanique'?2:1);i++){const[x,z]=pt(150,900);nt3Flock(F,sc,x,z,r,bc,DESK?44:28)}}catch(e){console.warn(e)}}
{const _se=SURF.enter;SURF.enter=function(p,entry){_se(p,entry);try{const F=typeof GR!='undefined'&&GR&&GR.F;if(F)nt3Enter(F,SURF.scene)}catch(e){console.warn(e)}}}
// ----- animation -----
function nt3Near(p,d){const me=FOOT.on?FOOT.pos:S.pos;return Math.hypot(me.x-p.x,me.z-p.z)<d}
function nt3Tick(dt){if(mode!='surf'||!GR||GR.F!==NT3.F||!NT3.F)return;const F=NT3.F,me=FOOT.on?FOOT.pos:S.pos;NT3.t+=dt;
for(const R of NT3.riv){R.tex.offset.y-=dt*R.spd;if(R.kind=='water')for(const f of R.falls)if(Math.random()<dt*1.6&&nt3Near(f,700))try{smokePuff(f.clone().add(new V3(rv(4),1,rv(4))),new V3(rv(2),3+Math.random()*3,rv(2)),4+Math.random()*3,1.8,0xe8f4ff)}catch(e){}}
// volcans
for(const V of NT3.vol){V.t-=dt;V.smT-=dt;const d=Math.hypot(me.x-V.x,me.z-V.z);if(V.smT<=0&&d<2600){V.smT=V.on?.06:.35;try{smokePuff(V.top.clone().add(new V3(rv(V.R*.1),5,rv(V.R*.1))),new V3(rv(4)+2,V.on?28+Math.random()*16:8+Math.random()*5,rv(4)),V.on?26:16,V.on?6:5,V.on?0x1a1614:0x3a3430)}catch(e){}}
if(!V.on&&V.t<=0){V.on=1;V.t=7+Math.random()*3;try{if(d<1500){SFX.boom();shake=Math.min(1,shake+(d<600?.6:.25))}if(d<1800&&!NT3.said.vol){NT3.said.vol=1;toast('🌋 Le volcan entre en éruption !')}}catch(e){}}
else if(V.on){if(Math.random()<dt*(DESK?14:9)){const a=Math.random()*TAU,sp=40+Math.random()*60;nt3Bomb(V.top.clone().add(new V3(0,6,0)),new V3(Math.cos(a)*sp*.45,70+Math.random()*60,Math.sin(a)*sp*.45))}if(Math.random()<dt*2&&d<1200){shake=Math.min(.5,shake+.05)}
if(V.t<=0){V.on=0;V.t=40+Math.random()*35}}const tg=V.on?2.4:.55+.12*Math.sin(NT3.t*1.3+V.x);V.mat.emissiveIntensity+=(tg-V.mat.emissiveIntensity)*Math.min(1,dt*2);V.gl.scale.setScalar(V.R*(V.on?1.6:.8)*(1+.08*Math.sin(NT3.t*7)));V.gl.material.opacity=V.on?.9:.5}
for(const b of NT3.bombs){if(!b.on)continue;b.l-=dt;b.v.y-=34*dt;b.p.addScaledVector(b.v,dt);if(Math.random()<.5)FIRE.emit(b.p.x,b.p.y,b.p.z,rv(3),rv(3),rv(3),.4,1,.5,.15,.5);const gy=F.h(b.p.x,b.p.z);
if(b.p.y<gy||b.l<=0){b.on=0;b.s.visible=false;try{boom3(b.p.clone().setY(Math.max(gy,b.p.y)+1),8,0xff7a30,40);smokePuff(b.p.clone().setY(gy+2),new V3(0,5,0),7,2.5,0x2a2420)}catch(e){}if(FOOT.on&&b.p.distanceTo(FOOT.pos)<7)try{damage(6,'lave')}catch(e){}}}
// geysers
for(const G0 of NT3.gey){G0.t-=dt;const d=Math.hypot(me.x-G0.x,me.z-G0.z);if(G0.st==0&&G0.t<=1.5&&d<900&&Math.random()<dt*6)try{smokePuff(_n1.set(G0.x+rv(1.5),G0.y,G0.z+rv(1.5)),_n2.set(rv(1),6,rv(1)),3,1.6,0xeef6ff)}catch(e){}
if(G0.st==0&&G0.t<=0){G0.st=1;G0.t=4.5;G0.cm.visible=true;if(d<500)try{noise(.9,.25,900);tone(80,60,1.2,'sine',.04)}catch(e){}}
if(G0.st==1){G0.t-=0;const k=Math.min(1,(4.5-G0.t)*2.5)*Math.min(1,G0.t*1.5),H=34*k+2;G0.cm.scale.set(1+k*.6,H,1+k*.6);G0.cm.position.y=G0.y+H/2;G0.cm.material.opacity=.55*k;G0.cm.material.map.offset.y-=dt*1.6;
if(d<900&&Math.random()<.8)try{smokePuff(_n1.set(G0.x+rv(2),G0.y+H*(.3+Math.random()*.7),G0.z+rv(2)),_n2.set(rv(4),18+Math.random()*14,rv(4)),5+Math.random()*4,2.2,G0.ty=='Volcanique'?0xd8c8b8:0xf2f8ff);const v=_n2.set(rv(8),40+Math.random()*25,rv(8));SPK.emit(G0.x,G0.y+2,G0.z,v.x,v.y,v.z,1,.85,.95,1,.5)}catch(e){}
if(FOOT.on&&Math.hypot(FOOT.pos.x-G0.x,FOOT.pos.z-G0.z)<4.5&&FOOT.pos.y<G0.y+6){FOOT.vy=Math.max(FOOT.vy||0,24);FOOT.grounded=false;if(!NT3.said.gey){NT3.said.gey=1;toast('💨 Le geyser t\'envoie en l\'air !')}}
if(!FOOT.on&&mode=='surf'&&Math.hypot(S.pos.x-G0.x,S.pos.z-G0.z)<10&&S.pos.y<G0.y+30)S.vel.y+=40*dt;
if(G0.t<=0){G0.st=0;G0.t=18+Math.random()*16;G0.cm.visible=false}}}
// troupeaux
const low=!FOOT.on&&S.pos.y-F.h(S.pos.x,S.pos.z)<45;
for(const H of NT3.herds){const dC=Math.hypot(me.x-H.c.x,me.z-H.c.z);
if(dC<(FOOT.on?40:low?150:0)&&H.run<=0){H.run=6+Math.random()*2;H.away.set(H.c.x-me.x,0,H.c.z-me.z).normalize();if(!NT3.said.herd&&dC<200){NT3.said.herd=1;toast('🦬 Le troupeau prend la fuite !')}}
let sp=2.4;if(H.run>0){H.run-=dt;sp=13;H.wp.copy(H.c).addScaledVector(H.away,80)}else if(Math.hypot(H.wp.x-H.c.x,H.wp.z-H.c.z)<15){const a=Math.random()*TAU,dd=150+Math.random()*250;H.wp.set(clamp(H.c.x+Math.cos(a)*dd,-(F.HALF||1600)*.85,(F.HALF||1600)*.85),0,clamp(H.c.z+Math.sin(a)*dd,-(F.HALF||1600)*.85,(F.HALF||1600)*.85))}
_n1.set(H.wp.x-H.c.x,0,H.wp.z-H.c.z);const L=_n1.length()||1;H.c.x+=_n1.x/L*sp*dt;H.c.z+=_n1.z/L*sp*dt;const far=dC>1400;if(far&&H.run<=0&&H.init)continue;H.init=1;
let li=0;for(const a of H.A){const tx=H.c.x+a.ox,tz=H.c.z+a.oz,dx=tx-a.x,dz=tz-a.z,dd=Math.hypot(dx,dz),v=Math.min(sp*1.25,dd*1.2+(H.run>0?sp:0));if(dd>.3){a.x+=dx/dd*v*dt;a.z+=dz/dd*v*dt;const yw=Math.atan2(-dx,-dz);let dy=yw-a.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));a.yaw+=dy*Math.min(1,dt*4)}a.ph+=v*dt*.9;
const y=F.h(a.x,a.z);_nq.setFromEuler(_ne.set(0,a.yaw,0,'YXZ'));_ns.setScalar(a.sc);_nm.compose(_n2.set(a.x,y,a.z),_nq,_ns);H.B.setMatrixAt(H.A.indexOf(a),_nm);
const sw=Math.sin(a.ph)*Math.min(1,v/3)*(H.run>0?.9:.5);for(const[lx,lz,s]of[[-.7,-1.1,1],[.7,-1.1,-1],[-.7,1,-1],[.7,1,1]]){_n1.set(lx,1.9,lz).multiplyScalar(a.sc).applyQuaternion(_nq);_nq2.setFromEuler(_ne.set(sw*s,a.yaw,0,'YXZ'));_nm.compose(_n2.set(a.x+_n1.x,y+_n1.y,a.z+_n1.z),_nq2,_ns);H.L.setMatrixAt(li++,_nm)}
if(H.run>0&&Math.random()<dt*3)try{smokePuff(_n2.set(a.x,y+.8,a.z),_n1.set(rv(2),2,rv(2)),4,1.6,F.ty=='Glacée'?0xe8eef4:0xa8906c)}catch(e){}}
H.B.instanceMatrix.needsUpdate=true;H.L.instanceMatrix.needsUpdate=true}
// nuées
for(const FL of NT3.flocks){const dS=FL.c.distanceTo(FOOT.on?FOOT.pos:S.pos);FL.wt-=dt;if(FL.wt<=0||FL.c.distanceTo(FL.tg)<20){FL.wt=8+Math.random()*8;const a=Math.random()*TAU,d=100+Math.random()*250;FL.tg.set(FL.c.x+Math.cos(a)*d,0,FL.c.z+Math.sin(a)*d);FL.tg.x=clamp(FL.tg.x,-1300,1300);FL.tg.z=clamp(FL.tg.z,-1300,1300);FL.tg.y=Math.max(0,F.h(FL.tg.x,FL.tg.z))+70+Math.random()*50}
if(!FOOT.on&&dS<160&&FL.scare<=0){FL.scare=4;_n1.copy(FL.c).sub(S.pos).setY(0).normalize();FL.tg.copy(FL.c).addScaledVector(_n1,300);FL.tg.y=FL.c.y+40;try{if(dS<120)tone(1400,2200,.15,'triangle',.02)}catch(e){}}FL.scare-=dt;
_n1.copy(FL.tg).sub(FL.c);const L=_n1.length();if(L>1)FL.c.addScaledVector(_n1,Math.min(1,dt*(FL.scare>0?30:16)/L));if(dS>1800&&FL.init)continue;FL.init=1;
let i=0;for(const b of FL.B){_n1.copy(FL.c).sub(b.p).multiplyScalar(.25);_n1.x+=Math.sin(NT3.t*.7+b.ph)*6;_n1.y+=Math.cos(NT3.t*.9+b.ph)*3;if(FL.scare>0)_n1.addScaledVector(_n2.copy(b.p).sub(S.pos).normalize(),18);
b.v.addScaledVector(_n1,dt);const sp=b.v.length(),mx=FL.scare>0?34:20;if(sp>mx)b.v.multiplyScalar(mx/sp);if(sp<10)b.v.multiplyScalar(10/Math.max(.1,sp));b.p.addScaledVector(b.v,dt);const gy=F.h(b.p.x,b.p.z)+12;if(b.p.y<gy)b.p.y=gy;
_nm.lookAt(_n2.set(0,0,0),b.v,AY);_nq.setFromRotationMatrix(_nm);const fl=Math.sin(NT3.t*(FL.scare>0?16:9)+b.ph);_ns.set(b.s,b.s*fl*1.3,b.s);_nm.compose(b.p,_nq,_ns);FL.m.setMatrixAt(i++,_nm)}FL.m.instanceMatrix.needsUpdate=true}}
const _nq2=new THREE.Quaternion();
TICK.push(nt3Tick);
