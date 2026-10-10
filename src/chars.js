// ===== PERSONNAGES RÉALISTES : corps continu animé par un squelette (SkinnedMesh), visage sculpté (yeux, paupières, lèvres, nez, oreilles),
// peau peinte (joues, sourcils, barbe, cheveux courts), coiffures, combinaisons et vêtements détaillés, métiers, extraterrestre, démarche réaliste =====
// boîte aux arêtes arrondies (partagée, mise en cache) : utilisée partout dans le jeu
const RB3C={};function RB3(w,h,d){const m=Math.min(w,h,d);if(m<.03)return new THREE.BoxGeometry(w,h,d);const k=w+'|'+h+'|'+d;if(RB3C[k])return RB3C[k];const r=Math.min(m*.32,.05),cw=w/2-r,ch=h/2-r,cr=Math.min(cw,ch)*.35,sh=new THREE.Shape();
sh.moveTo(-cw+cr,-ch);sh.lineTo(cw-cr,-ch);sh.quadraticCurveTo(cw,-ch,cw,-ch+cr);sh.lineTo(cw,ch-cr);sh.quadraticCurveTo(cw,ch,cw-cr,ch);sh.lineTo(-cw+cr,ch);sh.quadraticCurveTo(-cw,ch,-cw,ch-cr);sh.lineTo(-cw,-ch+cr);sh.quadraticCurveTo(-cw,-ch,-cw+cr,-ch);
const g=new THREE.ExtrudeGeometry(sh,{depth:Math.max(.001,d-2*r),bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:3,curveSegments:3});g.translate(0,0,-(d-2*r)/2);return RB3C[k]=g}
// forme de « gélule » tournée autour de l'axe Y (de y=0 à y=L), rayons r1 en bas et r2 en haut
function capG(r1,r2,L,s=DESK?18:14){const p=[];for(let i=0;i<=4;i++){const a=-Math.PI/2+i/4*Math.PI/2;p.push(new THREE.Vector2(Math.max(.001,Math.cos(a)*r1),r1+Math.sin(a)*r1))}for(let i=0;i<=4;i++){const a=i/4*Math.PI/2;p.push(new THREE.Vector2(Math.max(.001,Math.cos(a)*r2),L-r2+Math.sin(a)*r2))}return new THREE.LatheGeometry(p,s)}
const PATCHT=(()=>{const c=mkC(64),g=c.getContext('2d');g.fillStyle='#1a2a4a';g.beginPath();g.arc(32,32,30,0,TAU);g.fill();g.strokeStyle='#ffc040';g.lineWidth=4;g.beginPath();g.arc(32,32,26,0,TAU);g.stroke();g.fillStyle='#fff';g.beginPath();g.moveTo(32,10);g.lineTo(40,40);g.lineTo(32,34);g.lineTo(24,40);g.closePath();g.fill();g.fillStyle='#5ff0ff';g.fillRect(14,44,36,4);return new THREE.CanvasTexture(c)})();
// géométries partagées par tous les personnages (gardées quand on quitte une planète)
const CHG={};
const HM3={mat:{},tex:{}};
const sm3=(a,b,v)=>{const x=clamp((v-a)/(b-a),0,1);return x*x*(3-2*x)};
function hm3Sh(k,f){let g=CHG[k];if(!g){g=CHG[k]=f();try{SHAREDG.add(g)}catch(e){}}return g}
function hm3Hash(x,y,s){let h=(x*374761393+y*668265263+s*1442695041)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
// cadence de marche (pas par seconde × π) : utilisée par tous ceux qui font avancer la phase de marche
function hm3Rate(v){return v<.05?0:Math.PI*(Math.min(1,v/1.2)*1.7+.24*v)}
// fusion de géométries (position, normale, uv) en une seule
function hm3Merge(L){let n=0,ni=0;const G=[];for(const p of L){const g=p.g.clone();if(p.m)g.applyMatrix4(p.m);if(!g.attributes.normal)g.computeVertexNormals();const c=g.attributes.position.count;G.push(g);n+=c;ni+=g.index?g.index.count:c}
const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2),I=n>65535?new Uint32Array(ni):new Uint16Array(ni);let o=0,k=0;
for(const g of G){const c=g.attributes.position.count;P.set(g.attributes.position.array.subarray(0,c*3),o*3);N.set(g.attributes.normal.array.subarray(0,c*3),o*3);if(g.attributes.uv)U.set(g.attributes.uv.array.subarray(0,c*2),o*2);
if(g.index){const a=g.index.array;for(let i=0;i<a.length;i++)I[k++]=a[i]+o}else for(let i=0;i<c;i++)I[k++]=i+o;o+=c;g.dispose()}
const r=new THREE.BufferGeometry();r.setAttribute('position',new THREE.BufferAttribute(P,3));r.setAttribute('normal',new THREE.BufferAttribute(N,3));r.setAttribute('uv',new THREE.BufferAttribute(U,2));r.setIndex(new THREE.BufferAttribute(I,1));r.computeBoundingSphere();return r}
// normales lissées aux coutures (sphères : pôles et méridien de départ)
function hm3Weld(g){const p=g.attributes.position,n=g.attributes.normal,M=new Map();for(let i=0;i<p.count;i++){const k=Math.round(p.getX(i)*1e4)+','+Math.round(p.getY(i)*1e4)+','+Math.round(p.getZ(i)*1e4);let a=M.get(k);if(!a)M.set(k,a=[]);a.push(i)}
for(const a of M.values()){if(a.length<2)continue;let x=0,y=0,z=0;for(const i of a){x+=n.getX(i);y+=n.getY(i);z+=n.getZ(i)}const l=Math.hypot(x,y,z)||1;for(const i of a)n.setXYZ(i,x/l,y/l,z/l)}n.needsUpdate=true;return g}
// ----- textures -----
// carte de normales calculée à partir d'un tableau de hauteurs (pas de relecture de la toile : lent sur certains appareils)
function hm3NormH(Hh,W,H,str){const c=mkC(W,H),g=c.getContext('2d'),I=g.createImageData(W,H),d=I.data,L=(x,y)=>Hh[((y+H)%H)*W+((x+W)%W)];
for(let y=0;y<H;y++)for(let x=0;x<W;x++){const dx=(L(x+1,y)-L(x-1,y))*str,dy=(L(x,y+1)-L(x,y-1))*str,l=Math.hypot(dx,dy,1),i=(y*W+x)*4;d[i]=(-dx/l*.5+.5)*255;d[i+1]=(dy/l*.5+.5)*255;d[i+2]=(1/l*.5+.5)*255;d[i+3]=255}
g.putImageData(I,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
// tissu : toile de combinaison (quadrillage anti-déchirure, coutures surpiquées, plis) ou vêtement (sergé), calculé pixel par pixel
function hm3Fab(civ){const N=DESK?512:256,q=N/32,sd=civ?77:321,r=rng(sd),Hh=new Float32Array(N*N),Wk=[];for(let k=0;k<(DESK?24:16);k++){const a=r()*3;Wk.push([r()*N,r()*N,1/Math.pow(N*(.04+r()*.09),2),1/Math.pow(.22+r()*.25,2),Math.cos(a),Math.sin(a),r()<.55?-.1:.07])}
const SV=civ?[[2,0,N],[N/2,0,N]]:[[2,0,N],[N/2,0,N],[N*.25,N*.3,N*.62],[N*.75,N*.62,N]],SH=civ?[]:[[N*.3,0,N]],sw=N/400,so=N/90,sl=N/130,c=mkC(N,N),g=c.getContext('2d'),I=g.createImageData(N,N),d=I.data,wr=v=>v>N/2?v-N:v<-N/2?v+N:v;
for(let y=0;y<N;y++)for(let x=0;x<N;x++){let v=civ?((((x+y)>>1)&1)?.95:1):((x%q==0||y%q==0)?.935:1);v*=1-hm3Hash(x,y,sd)*.08;v*=.965+hm3Hash(x>>4,y>>4,sd+1)*.035;
for(const w of Wk){const dx=wr(x-w[0]),dy=wr(y-w[1]),u=dx*w[4]+dy*w[5],vv=-dx*w[5]+dy*w[4],e=(u*u+vv*vv*w[3])*w[2];if(e<6)v*=1+w[6]*Math.exp(-e)}
for(const[sx,y0,y1]of SV){if(y<y0||y>y1)continue;const dd=Math.abs(x-sx);if(dd<sw)v*=.72;else if(Math.abs(dd-so)<N/600&&((y/sl)|0)%2==0)v*=.84}
for(const[sy,x0,x1]of SH){if(x<x0||x>x1)continue;const dd=Math.abs(y-sy);if(dd<sw)v*=.72;else if(Math.abs(dd-so)<N/600&&((x/sl)|0)%2==0)v*=.84}
const i=y*N+x;Hh[i]=v;d[i*4]=d[i*4+1]=d[i*4+2]=Math.min(255,v*240);d[i*4+3]=255}
g.putImageData(I,0,0);return{c,Hh,N}}
function hm3FabT(civ){const k='fab'+(civ?1:0);if(!HM3.tex[k]){const F=hm3Fab(civ),t=new THREE.CanvasTexture(F.c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;HM3.tex[k]={map:t,nrm:hm3NormH(F.Hh,F.N,F.N,civ?1.6:2.4)}}return HM3.tex[k]}
// mèches de cheveux (suivent les méridiens : du sommet vers la nuque)
function hm3HairT(){if(HM3.tex.hair)return HM3.tex.hair;const W=256,H=128,c=mkC(W,H),g=c.getContext('2d'),I=g.createImageData(W,H),d=I.data,Hh=new Float32Array(W*H);
for(let x=0;x<W;x++){const b=.72+hm3Hash(x,0,5)*.35;for(let y=0;y<H;y++){const j=y*W+x,i=j*4,v=b*(.9+hm3Hash(x,y>>2,6)*.18);Hh[j]=v;d[i]=d[i+1]=d[i+2]=Math.min(255,v*255);d[i+3]=255}}g.putImageData(I,0,0);
const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return HM3.tex.hair={map:t,nrm:hm3NormH(Hh,W,H,2)}}
// œil : blanc, iris strié, pupille, liseré sombre (l'iris regarde vers -z : u=0,75)
function hm3EyeT(col){const k='eye'+col;if(HM3.tex[k])return HM3.tex[k];const W=256,H=128,c=mkC(W,H),g=c.getContext('2d');g.fillStyle='#e4dcd2';g.fillRect(0,0,W,H);
const vg=g.createLinearGradient(0,0,W,0);vg.addColorStop(0,'rgba(200,120,110,.25)');vg.addColorStop(.6,'rgba(255,255,255,0)');vg.addColorStop(.9,'rgba(255,255,255,0)');vg.addColorStop(1,'rgba(200,120,110,.25)');g.fillStyle=vg;g.fillRect(0,0,W,H);
const cx=W*.75,cy=H/2,rx=W*.062,ry=H*.125,ic=new THREE.Color(col);g.save();g.translate(cx,cy);g.scale(rx/ry,1);
const ig=g.createRadialGradient(0,0,ry*.2,0,0,ry);ig.addColorStop(0,'#'+ic.clone().multiplyScalar(.55).getHexString());ig.addColorStop(.6,'#'+ic.getHexString());ig.addColorStop(.92,'#'+ic.clone().multiplyScalar(.6).getHexString());ig.addColorStop(1,'#1a1410');g.fillStyle=ig;g.beginPath();g.arc(0,0,ry,0,TAU);g.fill();
g.strokeStyle='rgba(255,255,255,.12)';g.lineWidth=.8;for(let i=0;i<40;i++){const a=i/40*TAU;g.beginPath();g.moveTo(Math.cos(a)*ry*.3,Math.sin(a)*ry*.3);g.lineTo(Math.cos(a)*ry*.85,Math.sin(a)*ry*.85);g.stroke()}
g.fillStyle='#050403';g.beginPath();g.arc(0,0,ry*.38,0,TAU);g.fill();g.restore();const t=new THREE.CanvasTexture(c);t.anisotropy=4;return HM3.tex[k]=t}
// ----- matériaux (partagés quand c'est possible) -----
function hm3M(k,f){return HM3.mat[k]||(HM3.mat[k]=f())}
const HM3IRIS=[0x5a3a22,0x3a2414,0x4a7aa8,0x5a8a5a,0x7a8288,0x8a6a3a];
// ----- tête : sphère sculptée (crâne, mâchoire, menton, pommettes, arcades, orbites) -----
const HM3FX=[[.33,.33,-.88,.22,.045,'brow'],[.33,.15,-.93,.15,-.1,0],[0,.17,-.98,.1,.03,0],[.6,0,-.78,.22,.045,'cheek'],[0,-.35,-.93,.28,.035,0],[0,-.72,-.68,.2,.055,'chin'],[.7,-.62,-.25,.22,.06,'jaw'],[.86,.28,-.4,.22,-.03,0],[0,.05,.99,.45,.03,0]];
function hm3Def(x,y,z,F){let sx=F.W,sy=F.H,sz=z<0?F.Df:F.Db;const low=sm3(-.25,-1,y);if(z<0)sy*=1+.12*sm3(-.3,-.9,y)*(-z);sx*=(1+(.12+.07*F.jaw)*sm3(-.1,-.7,y)*(1-sm3(-.72,-1,y)))*(1-low*low*(.3-F.jaw*.06)*(z<0?1:.6));if(z>0)sz*=1-.5*sm3(-.15,-.9,y);if(y>.6)sy*=1-.05*sm3(.6,1,y);
let b=0;const ax=Math.abs(x);for(const f of HM3FX){const dx=(f[0]?ax:x)-f[0],dy=y-f[1],dz=z-f[2],a=f[4]*(f[5]?F[f[5]]:1);b+=a*Math.exp(-(dx*dx+dy*dy+dz*dz)/(f[3]*f[3]))}return[x*sx*(1+b),y*sy*(1+b),z*sz*(1+b)]}
const hm3Dir=(x,y,z)=>{const l=Math.hypot(x,y,z);return[x/l,y/l,z/l]};
function hm3Surf(F,x,y,z){const d=hm3Dir(x,y,z),p=hm3Def(d[0],d[1],d[2],F);return new V3(p[0],p[1],p[2])}
// ligne des cheveux (hauteur seuil selon l'angle autour de la tête : front, tempes, pattes, oreilles, nuque)
const HM3HL=[[0,.7],[.6,.58],[1.05,.38],[1.3,.08],[1.42,.04],[1.55,.34],[1.75,.3],[1.95,0],[2.4,-.4],[3.15,-.46]];
function hm3Hl(x,z){return hm3HlA(Math.abs(Math.atan2(x,-z)))}
function hm3HlA(A){for(let i=1;i<HM3HL.length;i++)if(A<=HM3HL[i][0]){const[a0,v0]=HM3HL[i-1],[a1,v1]=HM3HL[i];return v0+(v1-v0)*(A-a0)/(a1-a0)}return -.46}
// peau peinte pixel par pixel en projection équirectangulaire (même correspondance que les uv d'une sphère)
function hm3SkinT(F){const k='sk'+F.key;if(HM3.tex[k])return HM3.tex[k];const W=DESK?384:256,H=W/2,c=mkC(W,H),g=c.getContext('2d'),I=g.createImageData(W,H),d=I.data;
const S=new THREE.Color(F.skin),Hc=new THREE.Color(F.hair),SR=S.r*255,SG=S.g*255,SB=S.b*255,HR=Hc.r*255,HG=Hc.g*255,HB=Hc.b*255,LR=Math.min(255,SR*.92+40),LG=SG*.62,LB=SB*.62,al=F.alien;
for(let py=0;py<H;py++){const th=(py+.5)/H*Math.PI,y=Math.cos(th),st=Math.sin(th);for(let px=0;px<W;px++){const phi=(px+.5)/W*TAU,x=-Math.cos(phi)*st,z=Math.sin(phi)*st,ax=Math.abs(x),i=(py*W+px)*4;
let r=SR,gg=SG,b=SB;const mx=(R,G,B,a)=>{if(a<=0)return;a=Math.min(1,a);r+=(R-r)*a;gg+=(G-gg)*a;b+=(B-b)*a};
const n=hm3Hash(px,py,F.seed)-.5,n2=hm3Hash(px>>3,py>>3,F.seed+3)-.5,sh=1+n*.045+n2*.05;r*=sh;gg*=sh;b*=sh;
if(al){const sp=hm3Hash(px>>2,py>>2,F.seed+9);if(sp>.86)mx(SR*.6,SG*.75,SB*.9,.5);mx(SR*.7,SG*.6,SB*1.1,sm3(.2,-.9,y)*.4)}
else{const g2=(cx,cy,cz,s)=>{const dx=ax-cx,dy=y-cy,dz=z-cz;return Math.exp(-(dx*dx+dy*dy+dz*dz)/s)};
mx(205,95,85,g2(.58,-.05,-.8,.045)*(F.fem?.2:.12));mx(205,95,85,g2(0,-.02,-1,.012)*.1);mx(SR*.7,SG*.6,SB*.62,g2(.33,.05,-.94,.005)*.35);mx(SR*.78,SG*.68,SB*.68,g2(.34,.23,-.93,.003)*.3);
if(F.fem)mx(SR*.65,SG*.5,SB*.55,g2(.34,.2,-.93,.004)*.25);
const e=Math.pow(x/.19,2)+Math.pow((y+.42)/.062,2);if(z<-.6&&e<1.3)mx(LR,LG,LB,(1-sm3(.7,1.3,e))*.75);
// sourcils
if(z<-.55&&ax>.07&&ax<.53){const f=(ax-.07)/.46,by=.29+(F.fem?.075:.055)*Math.sin(Math.PI*Math.min(1,f*1.15))-f*.03,tb=(F.fem?.021:.032)*(1-.5*f)*F.brw;if(Math.abs(y-by)<tb)mx(HR*.6,HG*.6,HB*.6,(.55+.45*hm3Hash(px*7,py,F.seed+5))*(1-Math.abs(y-by)/tb*.5))}
// barbe : ombre de rasage ou barbe pleine, moustache
if(F.beard&&z<-.15&&y<-.12&&y>-.97&&e>1.25&&ax<.86){let a=sm3(-.12,-.3,y)*(1-sm3(.62,.86,ax));if(y>-.3&&ax>.22)a*=sm3(-.12,-.24,y-ax*.15);a*=F.beard==2?(.72+.25*hm3Hash(px*5,py*3,F.seed+7)):(hm3Hash(px,py,F.seed+8)>.42?.28:.08);mx(HR*.8,HG*.8,HB*.8,a)}
// cheveux peints sur le cuir chevelu (sous la coupe en relief, ou coupe très courte seule)
if(F.scalp){const thr=hm3Hl(x,z),dd=y-thr;if(dd>0){const a=sm3(0,.08,dd)*(F.scalp==2?.6:.92)*(.75+.25*hm3Hash(px,py*2,F.seed+11));mx(HR,HG,HB,a)}}}
d[i]=clamp(r,0,255);d[i+1]=clamp(gg,0,255);d[i+2]=clamp(b,0,255);d[i+3]=255}}
g.putImageData(I,0,0);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return HM3.tex[k]=t}
// géométries de la tête (crâne + nez + oreilles + paupières inférieures fusionnés), coiffure
function hm3HeadGeo(F){return hm3Sh('h3hd'+F.key,()=>{const sg=DESK?44:32,sk=new THREE.SphereGeometry(1,sg,Math.round(sg*.75)),p=sk.attributes.position;
for(let i=0;i<p.count;i++){const q=hm3Def(p.getX(i),p.getY(i),p.getZ(i),F);p.setXYZ(i,q[0],q[1],q[2])}sk.computeVertexNormals();hm3Weld(sk);
const L=[{g:sk}],plain=g=>{const u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,.5,.03);return g},M4=(x,y,z,rx,ry,rz,sx,sy,sz)=>new THREE.Matrix4().compose(new V3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new V3(sx,sy,sz));
if(!F.alien){// nez : arête fine qui s'élargit vers les narines, bout arrondi
const ns=new THREE.SphereGeometry(1,14,12),np=ns.attributes.position;for(let i=0;i<np.count;i++){const x=np.getX(i),y=np.getY(i),z=np.getZ(i),f=(1-y)/2,w=(.0045+.0085*f)*F.nose*(y<-.45?1+.45*sm3(-.45,-1,y)*Math.abs(x):1),dz=z<0?(.0035+.0115*Math.pow(f,1.4))*F.nose:.003;np.setXYZ(i,x*w,y*.0235*F.nose,z*dz)}ns.computeVertexNormals();
const nb=hm3Surf(F,0,-.02,-1);L.push({g:plain(ns),m:M4(0,nb.y-.006,nb.z+.004,-.05,0,0,1,1,1)});
// narines (ailes du nez)
for(const s of[-1,1]){const w=plain(new THREE.SphereGeometry(.0046*F.nose,10,8));L.push({g:w,m:M4(s*.0092*F.nose,nb.y-.019*F.nose,nb.z+.0045,0,0,0,1,.75,1.1)})}
// oreilles : pavillon aplati incliné vers l'arrière, lobe
for(const s of[-1,1]){const ep=hm3Surf(F,s,.1,.08);const ea=plain(new THREE.SphereGeometry(1,14,10));const ap=ea.attributes.position;for(let i=0;i<ap.count;i++){const y=ap.getY(i);ap.setX(i,ap.getX(i)*(y>0?1:.8))}ea.computeVertexNormals();L.push({g:ea,m:M4(ep.x+s*.004,ep.y-.002,ep.z+.006,0,s*.32,s*-.08,.0085,.029,.018)});
const lb=plain(new THREE.SphereGeometry(.0075,8,6));L.push({g:lb,m:M4(ep.x+s*.003,ep.y-.026,ep.z+.002,0,0,0,.8,1,1)})}
// paupières inférieures
for(const s of[-1,1]){const ec=F.eyeC[s<0?0:1],ll=plain(new THREE.SphereGeometry(.0128,14,6,0,TAU,Math.PI*.62,Math.PI*.38));L.push({g:ll,m:M4(ec.x,ec.y,ec.z,.25,0,0,1,1,1)})}}
return hm3Merge(L)})}
function hm3HairGeo(F,hs){return hm3Sh('h3hr'+F.key+'|'+hs,()=>{const NA=DESK?60:40,NS=DESK?14:10,P=[],UV=[],I=[],r=rng(F.seed+hs);
for(let j=0;j<=NS;j++){const s=j/NS;for(let i=0;i<=NA;i++){const A=i/NA*TAU-Math.PI,thr=hm3HlA(Math.abs(A))+(hs==4?.01:.04),y=thr+(1-thr)*Math.pow(s,.85),rh=Math.sqrt(Math.max(0,1-y*y)),x=Math.sin(A)*rh,z=-Math.cos(A)*rh;
let th=(.004+.011*Math.max(0,y))*sm3(0,.3,s)+.0012;if(hs==3)th+=sm3(.3,1,s)*(.004+r()*.018);if(hs==4)th+=.004*sm3(0,.3,s);if(hs==1)th*=.75;const q=hm3Def(x,y,z,F),l=Math.hypot(q[0],q[1],q[2]);P.push(q[0]*(1+th/l),q[1]*(1+th/l),q[2]*(1+th/l));UV.push(i/NA*4,s)}}
for(let j=0;j<NS;j++)for(let i=0;i<NA;i++){const a=j*(NA+1)+i,b=a+NA+1;I.push(a,b,a+1,b,b+1,a+1)}
const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.Float32BufferAttribute(P,3));G.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));G.setIndex(I);G.computeVertexNormals();hm3Weld(G);
const L=[{g:G}],M4=(x,y,z,rx,sx,sy,sz)=>new THREE.Matrix4().compose(new V3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,0,0)),new V3(sx,sy,sz));
if(hs==1){const pt=capG(.012,.024,.2,12);L.push({g:pt,m:M4(0,-.17,.105,-.35,1,1,.9)});L.push({g:new THREE.TorusGeometry(.016,.005,6,12),m:M4(0,.02,.112,1.2,1,1,1)})}
if(hs==2){L.push({g:new THREE.SphereGeometry(.042,14,10),m:M4(0,.075,.1,0,1,.85,.9)});L.push({g:new THREE.TorusGeometry(.03,.006,6,14),m:M4(0,.05,.085,.9,1,1,1)})}
if(hs==4){const pts=[];for(let j=0;j<=6;j++){const f=j/6,w=.084+.02*f,dp=.05-.015*f;pts.push([-.26*f,w,dp])}const R=[];const N=14;const P=[],I=[];for(let j=0;j<pts.length;j++){const[y,w,dp]=pts[j];for(let i=0;i<=N;i++){const a=i/N*Math.PI;P.push(-Math.cos(a)*w,y,.035+Math.sin(a)*dp)}}
for(let j=0;j<pts.length-1;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;I.push(a,a+1,b,b,a+1,b+1)}const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(P,3));const uv=[];for(let k=0;k<P.length/3;k++)uv.push((k%(N+1))/N,1-Math.floor(k/(N+1))/6);lg.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));lg.setIndex(I);lg.computeVertexNormals();
const lgb=lg.clone();lgb.index.array.reverse();lgb.index.needsUpdate=true;lgb.computeVertexNormals();L.push({g:lg},{g:lgb})}
return hm3Merge(L)})}
// visage d'un personnage : proportions et détails tirés d'un nombre (stable pour le pilote)
function hm3Face(o,fem){const sd=typeof o.seed=='number'?o.seed:o.seed!=null?[...String(o.seed)].reduce((a,c)=>(a*31+c.charCodeAt(0))|0,7):(Math.random()*1e9|0),r=rng((sd>>>0)%2147483646+1),v=a=>1+(r()-.5)*a,al=o.role=='alien';
const F=fem?{W:.0715*v(.06),H:.108*v(.05),Df:.093*v(.05),Db:.1,jaw:.6*v(.3),chin:.6*v(.3),brow:.35,cheek:1.15*v(.3),nose:.9*v(.18)}:{W:.0765*v(.07),H:.113*v(.05),Df:.097*v(.05),Db:.104,jaw:1*v(.5),chin:1*v(.4),brow:1*v(.4),cheek:1*v(.35),nose:1*v(.2)};
if(al)Object.assign(F,{W:.082,H:.15,Df:.1,Db:.12,jaw:-.6,chin:.2,brow:.2,cheek:.4,nose:0});
F.fem=fem;F.alien=al;F.seed=(sd>>>0)%100000;F.skin=al?(o.skin||0x6fd08a):(o.skin!=null?o.skin:[0xf1c8a8,0xd9a07a,0xa86a48,0x6e4630,0xe8b896][r()*5|0]);F.hair=o.hair!=null?o.hair:[0x2a1810,0x5a3a20,0x101010,0xc89048,0x803020,0x8a8580][r()*6|0];
F.beard=(!fem&&!al&&o.beard!==0)?(o.beard!=null?o.beard:(r()<.35?(r()<.45?2:1):0)):0;F.brw=v(.4);F.iris=HM3IRIS[r()*HM3IRIS.length|0];
const ex=al?.055:.0305,ey=al?.012:.017;F.eyeC=[-1,1].map(s=>{const q=hm3Surf(F,s*(al?.5:.4),al?.08:.16,-1);return new V3(s*ex,ey,q.z+(al?.022:.0062))});return F}
// ----- corps : tubes à sections superelliptiques fusionnés, avec poids de peau pour le squelette -----
const HM3BX={m:{sh:.186,hip:.095,el:.205,wr:.214},f:{sh:.168,hip:.1,el:.186,wr:.196}};
const HM3TOR={m:[[.80,.07,.06,.07,.01,2],[.84,.13,.085,.095,.01,2.2],[.90,.162,.092,.108,.012,2.3],[.97,.163,.09,.105,.01,2.3],[1.04,.146,.086,.094,.006,2.2],[1.12,.149,.093,.094,0,2.2],[1.21,.162,.106,.097,-.004,2.3],[1.30,.172,.113,.1,-.004,2.4],[1.37,.176,.106,.1,0,2.5],[1.42,.17,.09,.096,.006,2.6],[1.455,.152,.074,.089,.012,2.5],[1.49,.112,.062,.074,.012,2.2],[1.52,.072,.058,.062,.01,2],[1.55,.058,.054,.058,.008,2],[1.60,.056,.052,.055,.006,2],[1.64,.052,.048,.05,.004,2]],
f:[[.80,.07,.06,.075,.01,2],[.84,.14,.088,.1,.01,2.2],[.90,.172,.094,.114,.014,2.3],[.97,.165,.09,.108,.012,2.3],[1.04,.13,.08,.088,.006,2.2],[1.12,.132,.086,.088,0,2.2],[1.21,.148,.112,.092,-.004,2.3],[1.27,.155,.125,.094,-.006,2.3],[1.33,.158,.11,.094,-.002,2.4],[1.39,.16,.095,.092,.004,2.5],[1.43,.153,.082,.088,.008,2.6],[1.46,.136,.068,.08,.012,2.4],[1.49,.1,.056,.066,.012,2.2],[1.52,.062,.05,.054,.01,2],[1.55,.05,.047,.049,.008,2],[1.60,.048,.045,.047,.006,2],[1.64,.045,.042,.044,.004,2]]};
const HM3LEG=[[.045,.028,.03,.03],[.075,.031,.033,.033],[.14,.034,.036,.037],[.22,.041,.041,.047],[.30,.05,.046,.059],[.38,.053,.049,.064],[.45,.051,.053,.055],[.50,.054,.058,.053],[.57,.061,.065,.061],[.66,.071,.075,.071],[.76,.081,.083,.081],[.86,.089,.088,.093],[.93,.087,.086,.092],[1.0,.07,.07,.075]];
const HM3ARM=[[.89,.026,.021,.021],[.915,.029,.023,.024],[.985,.034,.029,.03],[1.05,.04,.035,.036],[1.11,.042,.04,.04],[1.15,.039,.038,.04],[1.18,.041,.04,.042],[1.24,.046,.047,.045],[1.32,.049,.05,.048],[1.38,.054,.054,.052],[1.415,.054,.054,.053],[1.445,.045,.046,.045],[1.47,.025,.025,.025]];
// indices des os : 0 bassin, 1 dos, 2 poitrine, 3 cou, 4 tête, 5-8 bras gauche (clavicule, bras, avant-bras, main), 9-12 bras droit, 13-15 jambe gauche (cuisse, tibia, pied), 16-18 jambe droite
function hm3BodyGeo(fem,civ){return hm3Sh('h3b'+(fem?1:0)+(civ?1:0),()=>{const P=[],UV=[],SI=[],SW=[],C=[],I=[],BX=HM3BX[fem?'f':'m'],W2=(a,b,f)=>f<=0?[[a,1]]:f>=1?[[b,1]]:[[a,1-f],[b,f]];
const loft=(R,N,uk,col)=>{const base=P.length/3,M=R.length;for(let j=0;j<M;j++){const q=R[j],n=q.n||2,e=2/n;for(let i=0;i<=N;i++){const th=i/N*TAU,c=Math.cos(th),s=Math.sin(th);P.push(q.x+q.a*Math.sign(c)*Math.pow(Math.abs(c),e),q.y,q.z+(s<0?q.bf:q.bb)*Math.sign(s)*Math.pow(Math.abs(s),e));UV.push(i/N*uk,q.y*2);SI.push(q.w[0][0],q.w[1]?q.w[1][0]:0,0,0);SW.push(q.w[0][1],q.w[1]?q.w[1][1]:0,0,0);const cc=col(q.y);C.push(cc,cc,cc*1.03)}}
for(let j=0;j<M-1;j++)for(let i=0;i<N;i++){const a=base+j*(N+1)+i,b=a+N+1;I.push(a,b,a+1,b,b+1,a+1)}
for(const[j,up]of[[0,0],[M-1,1]]){const q=R[j],ci=P.length/3;P.push(q.x,q.y+(up?.012:-.012),q.z);UV.push(.5,q.y*2);SI.push(q.w[0][0],q.w[1]?q.w[1][0]:0,0,0);SW.push(q.w[0][1],q.w[1]?q.w[1][1]:0,0,0);const cc=col(q.y);C.push(cc,cc,cc*1.03);for(let i=0;i<N;i++){const a=base+j*(N+1)+i;if(up)I.push(ci,a+1,a);else I.push(ci,a,a+1)}}return{base,M,N}};
const NT=DESK?26:18,NL=DESK?18:12,pants=y=>civ?(y<.99?.38:1):1,L=[];
L.push(loft(HM3TOR[fem?'f':'m'].map(([y,a,bf,bb,z,n])=>({y,a,bf,bb,z,n,x:0,w:y<1.12?W2(0,1,sm3(.97,1.12,y)):y<1.26?W2(1,2,sm3(1.12,1.26,y)):y<1.53?W2(2,3,sm3(1.48,1.53,y)):W2(3,4,sm3(1.59,1.64,y))})),NT,2,pants));
for(const s of[-1,1]){const T=s<0?13:16,Sh=T+1,Ft=T+2,lx=y=>s*(y>.48?BX.hip-.005+.005*sm3(.48,.91,y):BX.hip-.007+.002*sm3(.075,.48,y));
const fk=y=>fem?(y>.7?1.04:y<.45?.92:1):1;
L.push(loft(HM3LEG.map(([y,a,bf,bb])=>({y,a:a*fk(y),bf:bf*fk(y),bb:bb*fk(y),z:y>.4&&y<.55?-.006:y>.25&&y<.4?.004:0,x:lx(y),w:y>=.87?W2(T,0,sm3(.87,.97,y)):y>=.53?[[T,1]]:y>=.45?W2(Sh,T,sm3(.45,.53,y)):y>=.12?[[Sh,1]]:W2(Ft,Sh,sm3(.06,.12,y))})),NL,.7,y=>civ?.38:1));
const U=s<0?6:10,Fo=U+1,Hd=U+2,ak=fem?.86:1,axf=y=>s*(y>1.15?BX.el+(BX.sh-BX.el)*sm3(1.15,1.435,y):BX.wr+(BX.el-BX.wr)*sm3(.895,1.15,y));
L.push(loft(HM3ARM.map(([y,a,bf,bb])=>({y,a:a*ak,bf:bf*ak,bb:bb*ak,z:y<1.15?-.004:0,x:axf(y),w:y>=1.39?W2(U,2,.55*sm3(1.39,1.47,y)):y>=1.18?[[U,1]]:y>=1.12?W2(Fo,U,sm3(1.12,1.18,y)):y>=.925?[[Fo,1]]:W2(Hd,Fo,sm3(.88,.925,y))})),NL,.7,()=>1))}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(SI,4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(SW,4));g.setIndex(I);g.computeVertexNormals();
const n=g.attributes.normal;for(const l of L)for(let j=0;j<l.M;j++){const a=l.base+j*(l.N+1),b=a+l.N;const x=n.getX(a)+n.getX(b),y=n.getY(a)+n.getY(b),z=n.getZ(a)+n.getZ(b),q=Math.hypot(x,y,z)||1;n.setXYZ(a,x/q,y/q,z/q);n.setXYZ(b,x/q,y/q,z/q)}
g.computeBoundingSphere();g.boundingSphere.radius*=1.25;return g})}
// main : paume, quatre doigts en deux phalanges, pouce (main droite ; la gauche est son reflet). grip = doigts refermés sur un objet
function hm3HandGeo(grip,glove){return hm3Sh('h3hn'+(grip?1:0)+(glove?1:0),()=>{const L=[],k=glove?1.12:1,M4=(x,y,z,rx,ry,rz,sx=1,sy=1,sz=1)=>new THREE.Matrix4().compose(new V3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz,'XYZ')),new V3(sx,sy,sz));
const pm=new THREE.SphereGeometry(1,16,12);L.push({g:pm,m:M4(0,-.052,0,0,0,0,.019*k,.05,.041*k)});
const F=[[-.027,.072,.0085],[-.009,.08,.0088],[.01,.075,.0084],[.027,.06,.0076]];for(let f=0;f<4;f++){const[z,len,r]=F[f],a1=grip?-1.25:-.3-f*.06,a2=grip?-1.35:-.45-f*.05;
let px=-.004,py=-.098+Math.abs(z)*.12,ps=new V3(px,py,z);const s1=capG(r*k,r*.95*k,len*.55,8),m1=M4(ps.x,ps.y,ps.z,0,0,Math.PI+a1);L.push({g:s1,m:m1});const e1=new V3(0,len*.55-r,0).applyMatrix4(new THREE.Matrix4().makeRotationZ(Math.PI+a1));ps.add(e1);
const s2=capG(r*.95*k,r*.85*k,len*.5,8);L.push({g:s2,m:M4(ps.x,ps.y,ps.z,0,0,Math.PI+a1+a2)})}
const tb=capG(.0105*k,.009*k,.055,8),tb2=capG(.009*k,.008*k,.04,8);L.push({g:tb,m:M4(-.008,-.03,-.033,grip?.9:.55,0,Math.PI-(grip?.9:.5))});const tm=new THREE.Matrix4().compose(new V3(-.008,-.03,-.033),new THREE.Quaternion().setFromEuler(new THREE.Euler(grip?.9:.55,0,Math.PI-(grip?.9:.5))),new V3(1,1,1)),te=new V3(0,.05,0).applyMatrix4(tm);
L.push({g:tb2,m:M4(te.x,te.y,te.z,grip?1.3:.75,0,Math.PI-(grip?1.4:.8))});if(glove)L.push({g:new THREE.CylinderGeometry(.037,.034,.04,16),m:M4(0,.005,0,0,0,0,1,1,.85)});return hm3Merge(L)})}
// botte : semelle crantée, tige, bout renforcé (repère du pied : cheville à l'origine, le pied regarde -z)
function hm3BootGeo(civ){return hm3Sh('h3bt'+(civ?1:0),()=>{const S=[[.07,.036,-.075,-.005],[.045,.045,-.077,.022],[0,.048,-.078,.03],[-.05,.05,-.078,civ?.008:.005],[-.1,.051,-.078,civ?-.018:-.028],[-.15,.051,-.078,civ?-.034:-.042],[-.185,.044,-.077,-.046],[-.207,.022,-.073,-.058]],N=16,P=[],I=[],UV=[];
for(let j=0;j<S.length;j++){const[z,w,yb,yt]=S[j],cy=(yb+yt)/2,hh=(yt-yb)/2;for(let i=0;i<=N;i++){const a=i/N*TAU,c=Math.cos(a),s=Math.sin(a),e=2/2.6;P.push(w*Math.sign(c)*Math.pow(Math.abs(c),e),cy+hh*Math.sign(s)*Math.pow(Math.abs(s),e),z);UV.push(i/N,j/S.length)}}
for(let j=0;j<S.length-1;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;I.push(a,b,a+1,b,b+1,a+1)}
for(const[j,f]of[[0,1],[S.length-1,0]]){const[z,,yb,yt]=S[j],c=P.length/3;P.push(0,(yb+yt)/2,z+(f?.008:-.006));UV.push(.5,.5);for(let i=0;i<N;i++){const a=j*(N+1)+i;if(f)I.push(c,a,a+1);else I.push(c,a+1,a)}}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));g.setIndex(I);g.computeVertexNormals();
const sh=civ?new THREE.CylinderGeometry(.045,.05,.06,16):new THREE.CylinderGeometry(.05,.054,.16,16);return hm3Merge([{g},{g:sh,m:new THREE.Matrix4().makeTranslation(0,civ?.01:.06,.004)}])})}
function hm3SoleGeo(){return hm3Sh('h3sl',()=>{const g=RB3(.106,.024,.282);const m=new THREE.Matrix4().makeTranslation(0,-.073,-.069);return hm3Merge([{g,m}])})}
// coque qui épouse le buste (gilet, armure) entre deux hauteurs, agrandie de « k »
function hm3Shell(fem,y0,y1,k){return hm3Sh('h3sh'+(fem?1:0)+y0+'|'+y1+'|'+k,()=>{const T=HM3TOR[fem?'f':'m'],N=DESK?26:18,R=[];const at=y=>{for(let i=1;i<T.length;i++)if(y<=T[i][0]){const a=T[i-1],b=T[i],f=(y-a[0])/(b[0]-a[0]);return a.map((v,j)=>v+(b[j]-v)*f)}return T[T.length-1]};
for(let j=0;j<=6;j++){const y=y0+(y1-y0)*j/6,q=at(y);R.push(q)}const P=[],I=[],UV=[];for(let j=0;j<R.length;j++){const[y,a,bf,bb,z,n]=R[j],e=2/n;for(let i=0;i<=N;i++){const th=i/N*TAU,c=Math.cos(th),s=Math.sin(th);P.push(a*k*Math.sign(c)*Math.pow(Math.abs(c),e),y,z+(s<0?bf:bb)*k*Math.sign(s)*Math.pow(Math.abs(s),e));UV.push(i/N*2,y*2)}}
for(let j=0;j<R.length-1;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;I.push(a,b,a+1,b,b+1,a+1)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));g.setIndex(I);g.computeVertexNormals();
const g2=g.clone();g2.index.array.reverse();g2.index.needsUpdate=true;g2.computeVertexNormals();return hm3Merge([{g},{g:g2}])})}
// ----- construction d'un personnage -----
function buildHuman(o={}){const g=new THREE.Group(),role=o.role||'',alien=role=='alien',helmet=o.helmet!==false&&!alien,civ=!helmet&&(alien||role=='merchant'||role=='scientist'||role==''||role=='mechanic'),
sd=o.seed!=null?o.seed:(Math.random()*1e9|0),fem=o.fem!=null?!!o.fem:(alien?false:rng(((typeof sd=='number'?sd:[...String(sd)].reduce((a,c)=>(a*31+c.charCodeAt(0))|0,7))>>>0)%2147483646+1)()<.45),BX=HM3BX[fem?'f':'m'];
// matériaux
const fab=hm3FabT(civ),sc=alien?(o.robe||0x2a4a8a):o.suit!=null?o.suit:0xe8ecf0,mk=(c,civ2)=>hm3M('s'+c+(civ2?'c':''),()=>new THREE.MeshStandardMaterial({color:c,map:fab.map,normalMap:fab.nrm,normalScale:new THREE.Vector2(.55,.55),metalness:civ2?0:.12,roughness:civ2?.85:.62}));
const M=mk(sc,civ),Ms=hm3M('k'+sc+(civ?'c':''),()=>{const m=M.clone();m.skinning=true;m.vertexColors=true;return m}),D=hm3M('d'+(o.dark||0x262b33),()=>new THREE.MeshStandardMaterial({color:o.dark||0x262b33,metalness:.45,roughness:.5})),
SO=hm3M('sole',()=>new THREE.MeshStandardMaterial({color:0x121417,metalness:.1,roughness:.9})),ac=o.acc!=null?o.acc:0xff8a2a,A=hm3M('a'+ac,()=>new THREE.MeshStandardMaterial({color:ac,metalness:.3,roughness:.4,emissive:ac,emissiveIntensity:.08})),
GL=hm3M('g'+(o.glow||0x5ff0ff),()=>new THREE.MeshBasicMaterial({color:o.glow||0x5ff0ff}));
const F=hm3Face(Object.assign({},o,{seed:sd}),fem),hs=helmet?-1:(o.hs!=null?o.hs:(fem?[1,2,4,4,0][rng(F.seed+3)()*5|0]:[0,0,3,5,6][rng(F.seed+3)()*5|0]));
F.scalp=alien||hs==6?0:hs==5?2:1;F.key=[F.seed,fem?1:0,F.skin,F.hair,F.beard,F.scalp,alien?1:0].join('_');
const SKf=hm3M('f'+F.key,()=>new THREE.MeshStandardMaterial({map:hm3SkinT(F),roughness:alien?.45:.58,metalness:0,emissive:new THREE.Color(F.skin).multiplyScalar(.045)})),
SKp=hm3M('p'+F.skin,()=>new THREE.MeshStandardMaterial({color:new THREE.Color(F.skin).multiplyScalar(.97),roughness:.6,metalness:0,emissive:new THREE.Color(F.skin).multiplyScalar(.045)})),
LIP=hm3M('l'+F.skin+(fem?'f':''),()=>{const c=new THREE.Color(F.skin).lerp(new THREE.Color(fem?0xb04a50:0xa05a52),fem?.55:.4).multiplyScalar(.92);return new THREE.MeshStandardMaterial({color:c,roughness:.38,metalness:0,emissive:c.clone().multiplyScalar(.06)})}),
MOU=hm3M('mou',()=>new THREE.MeshStandardMaterial({color:0x2a1210,roughness:.6})),EYE=hm3M('e'+F.iris+(alien?'a':''),()=>alien?new THREE.MeshStandardMaterial({color:0x05070a,metalness:.6,roughness:.06}):new THREE.MeshStandardMaterial({map:hm3EyeT(F.iris),roughness:.14,metalness:0}));
// squelette (en pose de repos, en coordonnées du personnage : pieds à y=0, il regarde vers -z)
const bone=(par,x,y,z)=>{const b=new THREE.Bone();b.position.set(x,y,z);if(par)par.add(b);return b};
const hips=bone(null,0,.95,0),spine=bone(hips,0,.08,0),chest=bone(spine,0,.22,0),neck=bone(chest,0,.25,.008),head=bone(neck,0,.08,.004),bones=[hips,spine,chest,neck,head],legs=[],arms=[],clav=[];
for(const s of[-1,1]){const c=bone(chest,s*.03,.18,0),u=bone(c,s*(BX.sh-.03),.005,0),f=bone(u,s*(BX.el-BX.sh),-.285,0),h=bone(f,s*(BX.wr-BX.el),-.255,0);bones.push(c,u,f,h);clav.push(c);arms.push({sh:u,el:f,hd:h})}
for(const s of[-1,1]){const th=bone(hips,s*BX.hip,-.04,0),sh=bone(th,-s*.005,-.43,-.004),ft=bone(sh,0,-.405,.004);bones.push(th,sh,ft);legs.push({hip:th,kn:sh,ft})}
const body=new THREE.SkinnedMesh(hm3BodyGeo(fem,civ),Ms);body.castShadow=DESK;body.receiveShadow=true;body.add(hips);g.add(body);body.updateMatrixWorld(true);body.bind(new THREE.Skeleton(bones));
// position de repos de chaque os (pour poser les accessoires en coordonnées du personnage)
const BW=new Map();for(const b of bones){const p=new V3();b.getWorldPosition(p);BW.set(b,p)}
const acc=new Map(),put=(b,geo,m,x,y,z,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>{const w=BW.get(b),k=b.uuid+m.uuid;let e=acc.get(k);if(!e)acc.set(k,e={b,m,L:[]});e.L.push({g:geo,m:new THREE.Matrix4().compose(new V3(x-w.x,y-w.y,z-w.z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new V3(sx,sy,sz))})};
const solo=(b,geo,m,x,y,z,rx=0,ry=0,rz=0)=>{const w=BW.get(b),q=new THREE.Mesh(geo,m);q.position.set(x-w.x,y-w.y,z-w.z);q.rotation.set(rx,ry,rz);q.castShadow=DESK;b.add(q);return q};
// ----- tête -----
const HC=new V3(0,1.638,-.012),hp=BW.get(head),hg=new THREE.Group();hg.position.copy(HC).sub(hp);head.add(hg);hg.scale.setScalar(fem?.96:1);
const sk=new THREE.Mesh(hm3HeadGeo(F),SKf);sk.castShadow=DESK;hg.add(sk);const eyes=[],lids=[];
for(let i=0;i<2;i++){const ec=F.eyeC[i],ep=new THREE.Group();ep.position.copy(ec);hg.add(ep);const eb=new THREE.Mesh(hm3Sh(alien?'h3eyA':'h3ey',()=>alien?new THREE.SphereGeometry(.03,16,12):new THREE.SphereGeometry(.0118,18,14)),EYE);if(alien){eb.scale.set(1,.62,.5);eb.rotation.z=(i?1:-1)*-.4}ep.add(eb);eyes.push(ep);
if(!alien){const ul=new THREE.Mesh(hm3Sh('h3ul',()=>new THREE.SphereGeometry(.0128,16,8,0,TAU,0,Math.PI*.5)),SKp);ul.rotation.x=.6;ep.add(ul);lids.push(ul)}}
let lip=null,mou=null;if(!alien){const ub=hm3Surf(F,0,-.4,-.92),lb=hm3Surf(F,0,-.5,-.87);const up=new THREE.Mesh(hm3Sh('h3lu',()=>new THREE.SphereGeometry(1,16,8)),LIP);up.scale.set(.018*(fem?1:1.05),.0034,.0046);up.position.set(0,ub.y,ub.z+.0016);hg.add(up);
lip=new THREE.Mesh(hm3Sh('h3lu',()=>new THREE.SphereGeometry(1,16,8)),LIP);lip.scale.set(.0164,.0042*(fem?1.15:1),.005);lip.position.set(0,lb.y+.003,lb.z+.0016);lip.userData.y0=lip.position.y;hg.add(lip);
mou=new THREE.Mesh(hm3Sh('h3mo',()=>new THREE.SphereGeometry(1,12,6)),MOU);mou.scale.set(.016,.002,.004);mou.position.set(0,(ub.y+lb.y)/2,(ub.z+lb.z)/2+.006);hg.add(mou)}
else{const m2=new THREE.Mesh(hm3Sh('h3mo',()=>new THREE.SphereGeometry(1,12,6)),MOU);m2.scale.set(.016,.0018,.004);const mp=hm3Surf(F,0,-.55,-.83);m2.position.set(0,mp.y,mp.z+.003);hg.add(m2);
const SK=hm3M('alsk'+F.skin,()=>new THREE.MeshStandardMaterial({color:F.skin,roughness:.5}));for(const s of[-1,1]){const an=new THREE.Mesh(hm3Sh('h3an',()=>new THREE.CylinderGeometry(.006,.01,.2,6)),SK);an.position.set(s*.05,.17,.01);an.rotation.z=-s*.35;hg.add(an);const tip=sprite(o.glow||0xb070ff,.12);tip.position.set(s*.085,.26,.01);hg.add(tip)}}
// coiffure
if(!helmet&&!alien&&hs>=0&&hs!=5&&hs!=6){const HM=hm3M('h'+F.hair,()=>{const T=hm3HairT();return new THREE.MeshStandardMaterial({color:F.hair,map:T.map,normalMap:T.nrm,normalScale:new THREE.Vector2(.6,.6),roughness:.55,metalness:.05})});const hr=new THREE.Mesh(hm3HairGeo(F,hs),HM);hr.castShadow=DESK;hg.add(hr)}
// casque : coque, visière (ouverte = verre clair qui laisse voir le visage, fermée = miroir teinté), bourrelet, lampes, antenne
if(helmet){const SH=hm3M('hs'+sc,()=>new THREE.MeshStandardMaterial({color:sc,metalness:.35,roughness:.32,map:fab.map})),VI=new THREE.MeshStandardMaterial({color:o.visor||0x1a3a50,metalness:o.closed?.95:.6,roughness:.05,transparent:true,opacity:o.closed?.93:.18,envMapIntensity:1.5,depthWrite:!!o.closed,side:THREE.DoubleSide});
const shell=new THREE.Mesh(hm3Sh('h3hm',()=>new THREE.SphereGeometry(.165,30,22,Math.PI*1.5+1.05,TAU-2.1,0,Math.PI*.9)),SH);shell.castShadow=DESK;hg.add(shell);
const vz=new THREE.Mesh(hm3Sh('h3vz',()=>new THREE.SphereGeometry(.162,28,18,Math.PI*1.5-1.15,2.3,Math.PI*.16,Math.PI*.6)),VI);vz.renderOrder=3;hg.add(vz);
for(const s of[-1,1])put(head,new THREE.CylinderGeometry(.026,.026,.03,14),D,HC.x+s*.158,HC.y,HC.z,0,0,Math.PI/2);put(head,RB3(.04,.034,.06),D,HC.x+.13,HC.y+.08,HC.z-.075,0,-.5,0);put(head,new THREE.CylinderGeometry(.004,.004,.13,4),D,HC.x-.12,HC.y+.15,HC.z+.05,0,0,.25);
const lmp=sprite(0xfff0c0,.26);lmp.position.set(.15,.085,-.11);hg.add(lmp);const at=sprite(0xff4040,.07);at.position.set(-.137,.215,.05);hg.add(at)}
// ----- mains, pieds -----
const glove=helmet||role=='guard'||role=='miner'||role=='mechanic'||!!o.tool,GM=glove?D:SKp,holdR=!!(o.tool||role=='guard'||role=='mechanic');
for(let i=0;i<2;i++){const s=i?1:-1,h=arms[i].hd,w=BW.get(h),hm=new THREE.Mesh(hm3HandGeo(i==1&&holdR,glove),GM);hm.scale.set(s*(fem?.9:1),fem?.92:1,fem?.92:1);hm.castShadow=DESK;h.add(hm);
const ft=legs[i].ft,bt=new THREE.Mesh(hm3BootGeo(civ),civ?hm3M('shoe'+(alien?1:0),()=>new THREE.MeshStandardMaterial({color:alien?0x2a2030:0x2a2622,roughness:.55,metalness:.1})):D);bt.castShadow=DESK;bt.scale.set(fem?.92:1,1,fem?.92:1);ft.add(bt);const so=new THREE.Mesh(hm3SoleGeo(),SO);so.scale.copy(bt.scale);ft.add(so)}
// ----- équipement selon la tenue -----
const neckR=fem?.051:.06;
if(helmet){// combinaison spatiale : col étanche, unité de poitrine, ceinture, genouillères, gilet, ordinateur de poignet, sac de survie + propulseurs
put(chest,new THREE.TorusGeometry(.105,.022,10,28),A,0,1.505,.008,Math.PI/2,0,0,1,1.12,1);put(chest,new THREE.TorusGeometry(.12,.012,8,28),D,0,1.485,.008,Math.PI/2,0,0,1.05,1.12,1);
if(role!='guard'&&role!='miner'){put(chest,RB3(.15,.095,.035),D,0,1.33,-.118);put(chest,RB3(.09,.04,.006),GL,0,1.345,-.137)}for(const s of[-1,1]){put(chest,RB3(.045,.33,.016),D,s*.085,1.32,-.108+.004,0,0,s*.06);put(chest,RB3(.016,.016,.01),A,s*.03,1.3,-.139)}
put(hips,new THREE.TorusGeometry(.152,.02,8,30),D,0,1.04,.006,Math.PI/2,0,0,1,.66,1);put(hips,RB3(.055,.04,.022),A,0,1.04,-.098);for(const s of[-1,1]){put(hips,RB3(.06,.075,.05),D,s*.12,1.0,-.06,0,s*.5,0);put(hips,RB3(.05,.07,.045),D,s*.15,1.0,.04,0,s*-.3,0)}
for(let i=0;i<2;i++){const s=i?1:-1,L2=legs[i],kx=s*(BX.hip-.005);put(L2.kn,new THREE.SphereGeometry(.062,14,10,0,TAU,0,Math.PI*.5),A,kx,.5,-.03,-Math.PI/2+.15,0,0,.85,.7,.9);put(L2.kn,new THREE.TorusGeometry(.052,.008,6,18),D,kx,.27,0,Math.PI/2,0,0,1,1.05,1);
put(L2.hip,RB3(.06,.09,.03),D,s*(BX.hip+.06),.7,-.01,0,s*1.3,0)}
put(arms[0].el,RB3(.05,.075,.024),D,-BX.el-.035,1.0,-.01,0,-.15,0,1,1,1);put(arms[0].el,RB3(.032,.05,.006),GL,-BX.el-.049,1.0,-.012,0,Math.PI/2-.15,0,1,1,1);
for(let i=0;i<2;i++){const s=i?1:-1;put(arms[i].sh,new THREE.TorusGeometry(.044,.008,6,16),D,s*BX.el*1.0,1.2,0,Math.PI/2,0,0,1,1,1)}
if(role!='merchant'&&role!='scientist'){put(chest,RB3(.34,.44,.15),D,0,1.3,.17);put(chest,RB3(.3,.07,.155),A,0,1.48,.17);put(chest,RB3(.2,.02,.01),GL,0,1.38,.248);for(const s of[-1,1]){put(chest,capG(.045,.045,.3,10),M,s*.11,1.1,.25);put(chest,new THREE.CylinderGeometry(.04,.055,.06,10),D,s*.11,1.08,.25);put(chest,new THREE.CylinderGeometry(.012,.012,.25,6),D,s*.17,1.32,.12,0,0,0)}}}
else{put(neck,new THREE.CylinderGeometry(neckR,neckR+.004,.13,16),SKp,0,1.565,.008)}
if(!helmet&&!alien){// vêtements : col, ceinture de cuir avec boucle, poche
put(chest,new THREE.TorusGeometry(neckR+.014,.009,8,22),M,0,1.505,.008,Math.PI/2,0,0,1,1.15,1);
put(hips,new THREE.TorusGeometry(fem?.135:.15,.014,8,30),hm3M('belt',()=>new THREE.MeshStandardMaterial({color:0x3a2a1c,roughness:.6})),0,1.0,.006,Math.PI/2,0,0,1,.64,1);put(hips,RB3(.04,.03,.01),hm3M('buckle',()=>new THREE.MeshStandardMaterial({color:0xb8a070,metalness:.8,roughness:.3})),0,1.0,-.092);
put(chest,RB3(.06,.05,.006),D,fem?.07:.08,1.31,fem?-.118:-.112,0,-.15,0)}
// écusson (épaule gauche)
if(helmet||(o.badge&&o.badge!='none')){const u=arms[0].sh,w=BW.get(u);const pt=new THREE.Mesh(new THREE.PlaneGeometry(.075,.075),new THREE.MeshBasicMaterial({map:PATCHT,transparent:true}));pt.position.set(-BX.sh-.051*(fem?.86:1)-w.x,1.36-w.y,0-w.z);pt.rotation.y=-Math.PI/2;u.add(pt)}
// ----- métiers -----
let tool=null,prop=null;const MW=MAT.metal;
if(role=='merchant'||alien){const RB=hm3M('r'+(o.robe||0x6b3fa0),()=>new THREE.MeshStandardMaterial({color:o.robe||0x6b3fa0,roughness:.8,map:hm3FabT(true).map}));const rb=new THREE.Mesh(hm3Sh('h3rb',()=>new THREE.LatheGeometry([[.4,0],[.34,.25],[.26,.6],[.21,.8],[.18,.86],[0,.87]].map(([x,y])=>new THREE.Vector2(x,y)),22)),RB);rb.scale.z=.8;rb.position.set(0,.06-BW.get(hips).y,0);hips.add(rb);
put(spine,hm3Shell(fem,1.1,1.16,1.1),A,0,0,0);if(!alien){const HT=hm3M('hat',()=>new THREE.MeshStandardMaterial({color:0x8a5a2a,roughness:.8}));const br=new THREE.Mesh(hm3Sh('h3br',()=>new THREE.CylinderGeometry(.21,.22,.012,24)),HT);br.position.set(0,.085,0);hg.add(br);const cr=new THREE.Mesh(hm3Sh('h3cr',()=>new THREE.CylinderGeometry(.095,.11,.1,20)),HT);cr.position.set(0,.13,.005);hg.add(cr)}}
if(role=='scientist'){const CO=hm3M('coat',()=>new THREE.MeshStandardMaterial({color:0xf2f4f6,roughness:.75,side:THREE.DoubleSide,map:hm3FabT(true).map}));const ct=new THREE.Mesh(hm3Sh('h3co'+(fem?1:0),()=>new THREE.LatheGeometry([[.29,0],[.25,.25],[fem?.2:.215,.5],[fem?.215:.235,.75],[fem?.205:.225,.88],[.12,.97],[0,.98]].map(([x,y])=>new THREE.Vector2(x,y)),22,0,Math.PI*1.82)),CO);ct.scale.z=.72;ct.rotation.y=-Math.PI*.91;ct.position.set(0,.53-BW.get(spine).y,0);spine.add(ct);
const GLS=hm3M('gls',()=>new THREE.MeshStandardMaterial({color:0x202428,metalness:.7,roughness:.3}));for(const i of[0,1]){const ec=F.eyeC[i],fr=new THREE.Mesh(hm3Sh('h3gl',()=>new THREE.TorusGeometry(.0145,.0016,6,18)),GLS);fr.position.set(ec.x,ec.y,ec.z-.013);hg.add(fr)}const brg=new THREE.Mesh(RB3(.022,.002,.002),GLS);brg.position.set(0,F.eyeC[0].y+.004,F.eyeC[0].z-.013);hg.add(brg);
prop=new THREE.Group();arms[0].hd.add(prop);prop.position.set(.02,-.08,-.02);const tb=new THREE.Mesh(RB3(.15,.012,.2),D);prop.add(tb);const sc2=new THREE.Mesh(new THREE.PlaneGeometry(.13,.17),new THREE.MeshBasicMaterial({color:0x5ff0ff}));sc2.rotation.x=-Math.PI/2;sc2.position.y=.007;prop.add(sc2);prop.rotation.set(0,0,Math.PI/2)}
if(role=='mechanic'){const OR=hm3M('mcap',()=>new THREE.MeshStandardMaterial({color:0xff8a2a,roughness:.6}));if(!helmet){const cp=new THREE.Mesh(hm3Sh('h3cp',()=>new THREE.SphereGeometry(.088,20,12,0,TAU,0,Math.PI*.5)),OR);cp.scale.set(1.04,1,1.12);cp.position.set(0,.045,.004);hg.add(cp);const vs=new THREE.Mesh(RB3(.15,.012,.09),OR);vs.position.set(0,.05,-.112);vs.rotation.x=.12;hg.add(vs)}
const LB=hm3M('tbelt',()=>new THREE.MeshStandardMaterial({color:0x4a3220,roughness:.7}));put(hips,new THREE.TorusGeometry(.16,.022,8,26),LB,0,.97,.005,Math.PI/2,0,0,1,.68,1);for(const s of[-1,1])put(hips,RB3(.075,.1,.06),LB,s*.15,.92,-.05,0,s*.4,0);
prop=new THREE.Group();arms[1].hd.add(prop);prop.position.set(0,-.08,-.015);const wr=new THREE.Mesh(RB3(.022,.26,.012),MW);wr.position.y=-.08;prop.add(wr);const hd2=new THREE.Mesh(new THREE.TorusGeometry(.03,.012,6,12,Math.PI*1.4),MW);hd2.position.y=-.22;hd2.rotation.y=Math.PI/2;prop.add(hd2)}
if(role=='miner'){const pk=new THREE.Group();chest.add(pk);pk.position.set(0,1.3-BW.get(chest).y,.27);pk.rotation.z=.7;const hd3=new THREE.Mesh(new THREE.CylinderGeometry(.016,.016,.72,8),hm3M('wood',()=>new THREE.MeshStandardMaterial({color:0x6a4a2a,roughness:.8})));pk.add(hd3);const bl=new THREE.Mesh(RB3(.34,.045,.045),MW);bl.position.y=.34;pk.add(bl);
put(chest,hm3Shell(fem,1.02,1.42,1.085),hm3M('vest',()=>new THREE.MeshStandardMaterial({color:0xffb020,roughness:.6,emissive:0x302000})),0,0,0);put(chest,hm3Shell(fem,1.2,1.24,1.1),hm3M('refl',()=>new THREE.MeshStandardMaterial({color:0xe0e0e0,metalness:.6,roughness:.2,emissive:0x404040})),0,0,0)}
if(role=='guard'){const AR=hm3M('ar'+ac,()=>new THREE.MeshStandardMaterial({color:o.acc||0x2d4a6e,metalness:.6,roughness:.35}));put(chest,hm3Shell(fem,1.1,1.43,1.1),AR,0,0,0);put(chest,hm3Shell(fem,1.06,1.1,1.12),D,0,0,0);
for(let i=0;i<2;i++){const s=i?1:-1;put(arms[i].sh,new THREE.SphereGeometry(.075,14,10,0,TAU,0,Math.PI*.5),AR,s*BX.sh,1.47,0,0,0,s*-.3,1.1,.8,1)}
prop=new THREE.Group();arms[1].hd.add(prop);prop.position.set(-.01,-.08,-.02);const rf=new THREE.Mesh(RB3(.06,.55,.09),D);rf.position.set(0,-.12,-.03);prop.add(rf);const br2=new THREE.Mesh(new THREE.CylinderGeometry(.016,.016,.28,8),MW);br2.position.set(0,-.48,-.05);prop.add(br2);const sg=new THREE.Mesh(RB3(.035,.12,.035),D);sg.position.set(0,-.05,-.1);prop.add(sg)}
if(o.tool){tool=new THREE.Group();arms[1].hd.add(tool);tool.position.set(-.005,-.08,-.02);const bd=new THREE.Mesh(RB3(.06,.24,.075),D);bd.position.set(0,-.06,-.035);tool.add(bd);const gr=new THREE.Mesh(RB3(.045,.05,.09),D);gr.position.set(0,.04,0);tool.add(gr);
const bar=new THREE.Mesh(hm3Sh('h3tb',()=>new THREE.CylinderGeometry(.022,.026,.13,10)),MW);bar.position.set(0,-.23,-.04);tool.add(bar);const ab=new THREE.Mesh(RB3(.02,.17,.07),A);ab.position.set(-.032,-.07,-.035);tool.add(ab);const tp=sprite(0x5ff0ff,.28);tp.position.set(0,-.31,-.04);tool.add(tp)}
// fusion des accessoires par os et par matériau
for(const e of acc.values()){const q=new THREE.Mesh(hm3Merge(e.L),e.m);q.castShadow=DESK;e.b.add(q)}
const hb=BW.get(hips);g.userData={legs,arms,sp:spine,chest,neck,head,hips,clav,tool,prop,role,eyes,lids,lip,mou,ph:Math.random()*9,R:{L1:.43,L2:.405,AH:.085,HO:.04,hy0:hb.y+.01},
k:0,rn:0,ai:0,am:0,tk:0,hyw:0,bT:1+Math.random()*3,bl:0,sT:0,ex:0,ey:0,fem,rig:1};
g.scale.setScalar(o.h!=null?o.h:(fem?.95:1)*(o.seed!=null?1:.96+Math.random()*.07));return g}
// ----- animation : marche/course réalistes (pied posé, bassin qui roule, buste en contre-rotation), repos (appui alterné, respiration),
// saut/jetpack, viser, parler (gestes, bouche), regard (yeux, clignements) -----
function animHuman(m,ph,spd,air,aim,talk,look){const u=m.userData;if(!u.rig)return;let dt=u.lt==null?.016:t-u.lt;u.lt=t;dt=clamp(dt,0,.1);const ex=r=>1-Math.exp(-dt*r);
const v=Math.max(0,spd||0);u.k+=(sm3(.12,.9,v)-u.k)*ex(7);u.rn+=(sm3(3.6,6.8,v)-u.rn)*ex(4);u.ai+=((air?1:0)-u.ai)*ex(9);u.am+=((aim?1:0)-u.am)*ex(10);u.tk+=((talk>0?1:0)-u.tk)*ex(5);
const k=u.k,rn=u.rn*k,ai=u.ai,id=1-k,sw0=Math.sin(t*.37+u.ph),br=Math.sin(t*1.75+u.ph),R=u.R;
// foulée : longueur d'un pas = vitesse / cadence
const S=v>.05?Math.PI*v/hm3Rate(v):0,A=Math.asin(Math.min(.62,S/1.7))*k,ga=Math.min(1,A*3);
const th=[0,0],kn=[0,0],an=[0,0];
for(let i=0;i<2;i++){const p=ph+i*Math.PI,c=Math.cos(p),s=Math.sin(p),pw=((p%TAU)+TAU)%TAU,sw=Math.max(0,-s);
let a=A*c+.1*rn,b=-((1.0+.85*u.rn)*Math.pow(sw,1.3)*ga+.17*Math.exp(-Math.pow((pw-.85)/.5,2))*ga*(1-u.rn));
const fw=(pw<Math.PI?.22*Math.exp(-Math.pow(pw/.4,2))-.55*sm3(1.9,Math.PI,pw):-.5*(1-sm3(Math.PI,4.4,pw))+.2*sm3(4.9,TAU,pw))*ga;
const rel=Math.max(0,(i?1:-1)*sw0);a+=id*(.012+.02*rel);b-=id*(.025+.1*rel);
a=lerp(a,i?.18:.8,ai);b=lerp(b,i?-.5:-1.2,ai);th[i]=a;kn[i]=b;an[i]=lerp(fw-(a+b),-.35,ai)}
// bassin : hauteur réglée pour que le pied d'appui touche le sol
const dr=i=>R.L1*Math.cos(th[i])+R.L2*Math.cos(th[i]+kn[i]);let hy=Math.max(dr(0),dr(1))+R.AH+R.HO+.03*rn*Math.abs(Math.sin(ph));hy=lerp(hy,R.hy0,ai);
const B=u;B.hips.position.y=hy;B.hips.position.x=-.022*Math.sin(ph)*k*(1-u.rn)+id*.012*sw0;B.hips.rotation.set(-.06*rn,-.11*Math.cos(ph)*k*(1-.4*u.rn),-.045*Math.sin(ph)*k*(1-.5*u.rn)+id*.022*sw0);
B.sp.rotation.set(-(.015+.13*u.rn)*k+.008*br*id-.12*ai,.07*Math.cos(ph)*k,.03*Math.sin(ph)*k-id*.018*sw0);B.chest.rotation.set(-.012*k+.012*br,.09*Math.cos(ph)*k,0);
for(let i=0;i<2;i++){const s=i?1:-1;B.legs[i].hip.rotation.set(th[i],0,s*(.02*id+.008+.08*ai));B.legs[i].kn.rotation.x=kn[i];B.legs[i].ft.rotation.x=an[i]}
// bras : balancier opposé aux jambes, coudes pliés en courant
const arm=[[0,0,0],[0,0,0]];for(let i=0;i<2;i++){const s=i?1:-1,c=Math.cos(ph+i*Math.PI);let x=-(.3+.4*u.rn)*ga*c*k+.1*rn+id*.025*Math.sin(t*.9+u.ph+i*2),z=s*(.075+.07*rn+.015*id),e=.1+.12*id+k*(.14+.3*Math.max(0,-c))*(1-u.rn)+1.25*rn;
x=lerp(x,.3,ai);z=lerp(z,s*.5,ai);e=lerp(e,.55,ai);arm[i]=[x,z,e]}
// métiers : postures des mains
const ro=u.role,hold=(i,x,z,e,w)=>{arm[i][0]=lerp(arm[i][0],x,w);arm[i][1]=lerp(arm[i][1],z,w);arm[i][2]=lerp(arm[i][2],e,w)},wr=(1-ai)*(1-u.am);
if(ro=='guard'){hold(1,.55,.12,1.35,wr);hold(0,.8,.5,1.15,wr)}else if(ro=='scientist'){hold(0,.45,-.18,1.4,wr*(1-u.tk*.3))}else if(ro=='alien'||ro=='merchant'&&id>.5){hold(0,.32,.35,1.25,wr*id);hold(1,.32,-.35,1.25,wr*id)}
// parler : gestes de la main droite, petits mouvements de la gauche
if(u.tk>.01){const g1=Math.sin(t*3.1+u.ph),g2=Math.sin(t*4.3);hold(1,.5+.2*g1,.25+.08*g2,1.15+.3*g2,u.tk*(1-u.am)*(ro=='guard'?.3:1));if(ro!='scientist'&&ro!='guard')hold(0,.2+.1*g2,-.08,.6+.2*g1,u.tk*.6)}
// viser : bras droit tendu, main gauche en soutien, buste de trois quarts
if(u.am>.01){hold(1,1.5,-.1,.1,u.am);hold(0,1.3,.55,.5,u.am);B.chest.rotation.y-=.1*u.am;B.sp.rotation.y-=.04*u.am}
for(let i=0;i<2;i++){const s=i?1:-1,A2=B.arms[i];A2.sh.rotation.set(arm[i][0],0,arm[i][1]);A2.el.rotation.set(arm[i][2],0,0);A2.hd.rotation.set(-.08-.12*rn+(u.am>.5&&i==1?.1:0),0,s*.05);B.clav[i].rotation.z=s*(.012*br+.03*rn*Math.abs(Math.cos(ph)))}
// tête : stabilisée, regarde autour au repos, hoche la tête en parlant
const lean=B.hips.rotation.x+B.sp.rotation.x+B.chest.rotation.x,yaw=B.hips.rotation.y+B.sp.rotation.y+B.chest.rotation.y;
const hl=look!=null?clamp(look,-1.1,1.1):(Math.sin(t*.23+u.ph)*.38+Math.sin(t*.61+u.ph*2)*.12)*id*(1-u.tk*.6);u.hyw+=(hl-u.hyw)*ex(3);
const nod=u.tk*(.045*Math.sin(t*4.1+u.ph)+.02*Math.sin(t*2.3));B.neck.rotation.set(-lean*.45+nod*.4,u.hyw*.35-yaw*.4,0);B.head.rotation.set(-lean*.45+nod-.03*rn,u.hyw*.55-yaw*.55,-.04*Math.sin(ph)*k+.03*id*sw0);
// yeux : saccades, suivent le regard, clignements avec les paupières
u.sT-=dt;if(u.sT<0){u.sT=.5+Math.random()*2.2;u.ex=(Math.random()-.5)*.45;u.ey=(Math.random()-.5)*.18}
for(const e of u.eyes){e.rotation.y+=(u.ex+u.hyw*.25-e.rotation.y)*ex(18);e.rotation.x+=(u.ey-e.rotation.x)*ex(18)}
u.bT-=dt;if(u.bT<0){u.bT=1.8+Math.random()*4.5;u.bl=.15}u.bl-=dt;const cl=u.bl>0?Math.sin(clamp(u.bl/.15,0,1)*Math.PI):0;for(const l of u.lids)l.rotation.x=.6-2.1*cl+u.eyes[0].rotation.x*.6;
// bouche : syllabes quand il parle
if(u.lip){const o=u.tk*Math.max(0,Math.sin(t*12.7+u.ph)*.6+Math.sin(t*5.3)*.4)*.0055;u.lip.position.y=u.lip.userData.y0-o;u.mou.scale.y=.002+o*1.1}}
