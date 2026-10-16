// ===== VILLES DES PLANÈTES D'APRÈS DE VRAIS PLANS (city4.js, après wg4.js) =====
// Idée du « Unity-City-Generator » (import OpenStreetMap → bâtiments extrudés, toits, routes, eau, parcs). Les plans viennent des extraits OSM du projet
// (Ingolstadt, Londres, Munich, 3 quartiers de New York — © contributeurs OpenStreetMap, licence ODbL), découpés en 24 quartiers par dev/cities/osm2city.py
// → public/cities/*.json. Chaque planète habitée reçoit un quartier, une rotation, un miroir, une échelle de hauteur et une palette : toutes les villes diffèrent.
// Remplace les tours de surf3 (ct3Build garde l'emplacement, la circulation aérienne et la lueur). Bâtiments posés sur le relief, routes et parcs drapés sur le terrain.
const CT4={idx:null,cache:new Map(),on:false,tok:0,grid:null,mats:null,lights:null,name:''};
fetch('cities/index.json').then(r=>r.ok?r.json():null).then(j=>{CT4.idx=j}).catch(()=>{});
const CT4PAL=[{n:'béton',f:[0xb9c0c8,0xd2d6dc,0x9aa3ad,0xc4c0b8],r:0x4a4f57},{n:'grès',f:[0xd9c29a,0xc8a97e,0xe6d5b0,0xb89a74],r:0x6a4e34},{n:'marbre',f:[0xe8ecef,0xf4f2ec,0xdfe6ea,0xd6dde2],r:0x7f8790},
 {n:'verre sombre',f:[0x3e4e62,0x324052,0x4a5c74,0x2a3646],r:0x1e2228},{n:'brique',f:[0xa0553e,0x8e4a36,0xb86a4e,0x7a3e2e],r:0x3a2a26}];
function ct4Name(r){const A=['Nova','Kel','Ara','Vex','Ori','Tal','Zen','Mira','Dor','Sel','Kai','Lun'],B=['polis','grad','dor','heim','ville','port','mar','ion','ara','ste'];return A[r()*A.length|0]+B[r()*B.length|0]}
function ct4Cfg(p,F){const r=rng((seedOf(p.x,p.y,p.z,97)>>>0)%2147483646+1),I=CT4.idx||[];if(!I.length)return null;const d=I[(r()*I.length*7|0)%I.length];
 const pal=r()<.25?{n:'teinte',f:[0,1,2,3].map(k=>new THREE.Color().setHSL(((F.hu||200)+k*12)/360,.18+r()*.15,.55+r()*.2).getHex()),r:new THREE.Color().setHSL((F.hu||200)/360,.2,.22).getHex()}:CT4PAL[r()*CT4PAL.length|0];
 return{id:d.id,src:d.n,rot:r()*TAU,mir:r()<.5,hs:[1,1.15,1.35,1.6,2][r()*5|0],pal,name:ct4Name(r),r}}
function ct4Clear(){CT4.on=false;CT4.grid=null;CT4.lights=null}
// ----- construction -----
function ct4Build(F,sc,c,cfg,D,R){const h=F.h,r=cfg.r,ca=Math.cos(cfg.rot),sa=Math.sin(cfg.rot),mx=cfg.mir?-1:1;
 const T=(x,z)=>{x=x*.1*mx;z=z*.1;return[c.x+x*ca-z*sa,c.z+x*sa+z*ca]},inR=(x,z)=>Math.hypot(x-c.x,z-c.z)<R;
 const P=[],N=[],UV=[],CO=[],RP=[],RN=[],RC=[],AN=[],tmp=new THREE.Color(),euro=!/New York/.test(cfg.src),TERRA=[0x9a4a32,0xa85a3a,0x7e3e2c,0x5a5e66,0x6e6458];let maxTop=0;
 const G={x0:c.x-R-10,z0:c.z-R-10,cs:6},gn=Math.ceil((2*R+20)/G.cs);G.n=gn;G.top=new Float32Array(gn*gn);
 const quad=(a,b,c2,d,n,ua,ub,va,vb,col)=>{for(const[q,u,v]of[[a,ua,va],[b,ub,va],[c2,ub,vb],[a,ua,va],[c2,ub,vb],[d,ua,vb]]){P.push(q[0],q[1],q[2]);N.push(n[0],n[1],n[2]);UV.push(u,v);CO.push(col.r,col.g,col.b)}};
 for(const b of D.b){const H0=b[0]/10,pts=[];for(let i=1;i+1<b.length;i+=2)pts.push(T(b[i],b[i+1]));if(pts.length<3)continue;let cx=0,cz=0;for(const q of pts){cx+=q[0];cz+=q[1]}cx/=pts.length;cz/=pts.length;if(!inR(cx,cz))continue;
  let area=0;for(let i=0;i<pts.length;i++){const a=pts[i],q=pts[(i+1)%pts.length];area+=a[0]*q[1]-q[0]*a[1]}area/=2;if(Math.abs(area)<12)continue;if(area<0)pts.reverse();
  let lo=1e9,hi=-1e9;for(const q of pts){const y=h(q[0],q[1]);if(y<lo)lo=y;if(y>hi)hi=y}
  let H=H0>0?H0:(5+r()*r()*22)*(Math.abs(area)>900?1.4:1);H*=cfg.hs;if(H>70&&r()<.5)H*=1.25;H=Math.min(H,280);const base=lo-2,top=hi+H;if(top-hi>maxTop)maxTop=top-hi;
  const fc=tmp.setHex(cfg.pal.f[r()*cfg.pal.f.length|0]).clone().multiplyScalar(.88+r()*.24);let per=0;
  for(let i=0;i<pts.length;i++){const a=pts[i],q=pts[(i+1)%pts.length],dx=q[0]-a[0],dz=q[1]-a[1],L=Math.hypot(dx,dz);if(L<.05)continue;const n=[dz/L,0,-dx/L];
   quad([a[0],base,a[1]],[q[0],base,q[1]],[q[0],top,q[1]],[a[0],top,a[1]],n,per/21,(per+L)/21,0,(top-base)/76.8,fc);per+=L}
  // toits : en pente (pyramide) pour les petites maisons des plans européens, plats ailleurs (+ blocs techniques sur les grands toits plats, feu rouge sur les tours)
  const A2=Math.abs(area),pitched=euro&&A2<420&&H<26&&r()<.8,rc=(pitched?tmp.setHex(TERRA[r()*TERRA.length|0]):tmp.setHex(cfg.pal.r).multiplyScalar(1.7)).clone().multiplyScalar(.85+r()*.3);
  const pushR=(x,y,z,nx,ny,nz)=>{RP.push(x,y,z);RN.push(nx,ny,nz);RC.push(rc.r,rc.g,rc.b)};
  if(pitched){const rh=Math.min(7,Math.sqrt(A2)*.32),ax=cx,az=cz,ay=top+rh;for(let i=0;i<pts.length;i++){const a=pts[i],q=pts[(i+1)%pts.length],e1=[q[0]-a[0],0,q[1]-a[1]],e2=[ax-a[0],ay-top,az-a[1]],n=new V3(e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]).normalize();if(n.y<0)n.negate();
    pushR(a[0],top,a[1],n.x,n.y,n.z);pushR(ax,ay,az,n.x,n.y,n.z);pushR(q[0],top,q[1],n.x,n.y,n.z)}}
  else{const tri=THREE.ShapeUtils.triangulateShape(pts.map(q=>new THREE.Vector2(q[0],q[1])),[]);for(const t of tri)for(const k of[t[0],t[2],t[1]]){const q=pts[k];pushR(q[0],top,q[1],0,1,0)}
   if(A2>500&&r()<.6){const bw=2+r()*3,bh=1.5+r()*2.5,bx=cx+(r()-.5)*Math.sqrt(A2)*.3,bz=cz+(r()-.5)*Math.sqrt(A2)*.3;for(const[nx,nz,x1,z1,x2,z2]of[[0,-1,-bw,-bw,bw,-bw],[1,0,bw,-bw,bw,bw],[0,1,bw,bw,-bw,bw],[-1,0,-bw,bw,-bw,-bw]]){pushR(bx+x1,top,bz+z1,nx,0,nz);pushR(bx+x2,top,bz+z2,nx,0,nz);pushR(bx+x2,top+bh,bz+z2,nx,0,nz);pushR(bx+x1,top,bz+z1,nx,0,nz);pushR(bx+x2,top+bh,bz+z2,nx,0,nz);pushR(bx+x1,top+bh,bz+z1,nx,0,nz)}}
   if(H>90)AN.push(cx,top+3,cz)}
  // grille des toits (collision du vaisseau) + cercle pour le pilote à pied
  for(let gx=Math.floor((Math.min(...pts.map(q=>q[0]))-G.x0)/G.cs);gx<=Math.floor((Math.max(...pts.map(q=>q[0]))-G.x0)/G.cs);gx++)for(let gz=Math.floor((Math.min(...pts.map(q=>q[1]))-G.z0)/G.cs);gz<=Math.floor((Math.max(...pts.map(q=>q[1]))-G.z0)/G.cs);gz++){if(gx<0||gz<0||gx>=gn||gz>=gn)continue;const k=gz*gn+gx;if(top>G.top[k])G.top[k]=top}
  if(GR&&GR.col)GR.col.push({x:cx,z:cz,r:Math.sqrt(Math.abs(area)/Math.PI)*.8})}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));geo.setAttribute('color',new THREE.Float32BufferAttribute(CO,3));geo.computeBoundingSphere();
 const tex=ct3Tex();for(const t of[tex.map,tex.em]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.needsUpdate=true}
 const bm=new THREE.MeshStandardMaterial({vertexColors:true,map:tex.map,emissive:0xffffff,emissiveMap:tex.em,emissiveIntensity:.15,roughness:.55,metalness:.25,envMapIntensity:.5});
 const bmesh=new THREE.Mesh(geo,bm);bmesh.castShadow=bmesh.receiveShadow=DESK;bmesh.userData.noCull=1;sc.add(bmesh);
 if(RP.length){const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(RP,3));rg.setAttribute('normal',new THREE.Float32BufferAttribute(RN,3));rg.setAttribute('color',new THREE.Float32BufferAttribute(RC,3));rg.computeBoundingSphere();
  const rm=new THREE.Mesh(rg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,metalness:.1,side:THREE.DoubleSide}));rm.castShadow=rm.receiveShadow=DESK;rm.userData.noCull=1;sc.add(rm)}
 CT4.ant=null;if(AN.length){const ag=new THREE.BufferGeometry();ag.setAttribute('position',new THREE.Float32BufferAttribute(AN,3));CT4.ant=new THREE.Points(ag,new THREE.PointsMaterial({map:GLOW,color:0xff3020,size:10,transparent:true,blending:ADDB,depthWrite:false}));sc.add(CT4.ant)}
 // routes drapées sur le terrain (+ réverbères la nuit)
 const RV=[],LP=[];for(const rd of D.r){const w=rd[0]/20,pts=[];for(let i=1;i+1<rd.length;i+=2)pts.push(T(rd[i],rd[i+1]));
  for(let i=0;i+1<pts.length;i++){const a=pts[i],q=pts[i+1],dx=q[0]-a[0],dz=q[1]-a[1],L=Math.hypot(dx,dz);if(L<.1||(!inR(a[0],a[1])&&!inR(q[0],q[1])))continue;const nx=-dz/L*w,nz=dx/L*w,st=Math.max(1,Math.ceil(L/9));
   for(let s=0;s<st;s++){const f0=s/st,f1=(s+1)/st,x0=a[0]+dx*f0,z0=a[1]+dz*f0,x1=a[0]+dx*f1,z1=a[1]+dz*f1;if(!inR(x0,z0))continue;const y0=h(x0,z0)+.7,y1=h(x1,z1)+.7;
    RV.push(x0+nx,y0,z0+nz,x1+nx,y1,z1+nz,x1-nx,y1,z1-nz,x0+nx,y0,z0+nz,x1-nx,y1,z1-nz,x0-nx,y0,z0-nz)}
   if(w>2.5)for(let d=r()*30;d<L;d+=34){const x=a[0]+dx*d/L+nx*1.15,z=a[1]+dz*d/L+nz*1.15;if(inR(x,z))LP.push(x,h(x,z)+7,z)}}}
 if(RV.length){const rg=new THREE.BufferGeometry();rg.setAttribute('position',new THREE.Float32BufferAttribute(RV,3));rg.computeVertexNormals();const rm=new THREE.MeshStandardMaterial({color:0x2a2d33,roughness:.92,metalness:.05,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});const m=new THREE.Mesh(rg,rm);m.receiveShadow=DESK;m.userData.noCull=1;sc.add(m)}
 if(LP.length){const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(LP,3));CT4.lights=new THREE.Points(lg,new THREE.PointsMaterial({map:GLOW,color:0xffc070,size:DESK?7:9,transparent:true,opacity:0,blending:ADDB,depthWrite:false}));sc.add(CT4.lights)}
 // parcs et plans d'eau : triangulés, redécoupés en petits triangles puis drapés
 const drape=(list,col,dy,mat)=>{const V=[];for(const poly of list){const pts=[];for(let i=0;i+1<poly.length;i+=2)pts.push(T(poly[i],poly[i+1]));if(pts.length<3)continue;let a=0;for(let i=0;i<pts.length;i++){const p0=pts[i],q=pts[(i+1)%pts.length];a+=p0[0]*q[1]-q[0]*p0[1]}if(a<0)pts.reverse();
  const tri=THREE.ShapeUtils.triangulateShape(pts.map(q=>new THREE.Vector2(q[0],q[1])),[]),sub=(A,B,C,dep)=>{const l=Math.max(Math.hypot(A[0]-B[0],A[1]-B[1]),Math.hypot(B[0]-C[0],B[1]-C[1]),Math.hypot(C[0]-A[0],C[1]-A[1]));
   if(l>22&&dep<6){const ab=[(A[0]+B[0])/2,(A[1]+B[1])/2],bc=[(B[0]+C[0])/2,(B[1]+C[1])/2],ca2=[(C[0]+A[0])/2,(C[1]+A[1])/2];sub(A,ab,ca2,dep+1);sub(ab,B,bc,dep+1);sub(ca2,bc,C,dep+1);sub(ab,bc,ca2,dep+1);return}
   const cx=(A[0]+B[0]+C[0])/3,cz=(A[1]+B[1]+C[1])/3;if(!inR(cx,cz))return;for(const q of[A,C,B])V.push(q[0],h(q[0],q[1])+dy,q[1])};for(const t of tri)sub(pts[t[0]],pts[t[1]],pts[t[2]],0)}
  if(!V.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(V,3));g.computeVertexNormals();const m=new THREE.Mesh(g,mat||new THREE.MeshStandardMaterial({color:col,roughness:.95,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));m.receiveShadow=DESK;m.userData.noCull=1;sc.add(m)};
 drape(D.g,new THREE.Color().setHSL(((F.hu||110)<70||(F.hu||110)>160?.3:(F.hu||110)/360),.38,.3).getHex(),.55);
 drape(D.w,0,.65,new THREE.MeshStandardMaterial({color:0x2a5a7a,roughness:.15,metalness:.4,emissive:0x0a1a28,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));
 CT4.grid=G;CT4.bm=bm;CT4.on=true;CT4.c=new V3(c.x,0,c.z);CT4.R=R;CT4.maxTop=maxTop;return P.length/9}
// ----- branchement : remplace les tours de surf3 -----
{const _cb=ct3Build;ct3Build=function(F,sc){ct4Clear();const n0=sc.children.length,c0=GR&&GR.col?GR.col.length:0;_cb.apply(this,arguments);if(!CT3.on||window.CT4OFF||!CT4.idx)return;
 // on retire les tours, les dômes et les antennes de l'ancienne ville (on garde circulation et lueur)
 const added=sc.children.slice(n0);for(const o of added){if(o===CT3.flm||o===CT3.fll||o===CT3.glow)continue;if(o.isInstancedMesh||o===CT3.ant){o.visible=false;if(o!==CT3.ant)sc.remove(o)}}if(GR&&GR.col)GR.col.length=c0;
 const p=F.p,cfg=ct4Cfg(p,F);if(!cfg)return;const c=CT3.c.clone(),dOp=F.op?Math.hypot(c.x-F.op.x,c.z-F.op.z):1e9,R=Math.max(180,Math.min(DESK?470:330,dOp-140));const tok=++CT4.tok;
 const go=D=>{if(tok!==CT4.tok||mode!='surf'||!GR||GR.F!==F&&U3.F!==F)return;try{const nt=ct4Build(F,sc,c,cfg,D,R);CT4.name=cfg.name;setTimeout(()=>{try{toast('🏙️ '+cfg.name+' — plan d\'après '+cfg.src+' (© contributeurs OpenStreetMap)')}catch(e){}},4500);if(typeof pf3Compile=='function')try{pf3Compile(sc)}catch(e){}}catch(e){console.warn('ct4',e)}};
 const D=CT4.cache.get(cfg.id);if(D)go(D);else fetch('cities/'+cfg.id+'.json').then(r=>r.json()).then(j=>{CT4.cache.set(cfg.id,j);go(j)}).catch(e=>console.warn('ct4',e))}}
// ----- chaque image : fenêtres et réverbères la nuit, le vaisseau ne traverse pas les immeubles -----
TICK.push(()=>{if(!CT4.on||mode!='surf')return;const night=typeof DN!='undefined'?DN.night:0;if(CT4.bm)CT4.bm.emissiveIntensity=.12+night*1.5;if(CT4.lights)CT4.lights.material.opacity=Math.min(1,night*1.4);if(CT4.ant)CT4.ant.material.opacity=Math.sin(t*3)>0?1:.15;
 const G=CT4.grid;if(!G||typeof FOOT!='undefined'&&FOOT.on)return;const gx=Math.floor((S.pos.x-G.x0)/G.cs),gz=Math.floor((S.pos.z-G.z0)/G.cs);if(gx<0||gz<0||gx>=G.n||gz>=G.n)return;const top=G.top[gz*G.n+gx];
 if(top>0&&S.pos.y<top+4){S.pos.y=top+4;if(S.vel&&S.vel.y<0)S.vel.y=0}});
