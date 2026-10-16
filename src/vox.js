// ===== PLANÈTES VOXEL (vox.js, après city4.js) — moteur =====
// Portage du projet « Voxel Planets » de Joseba Sierra (Unity, licence MIT, https://github.com/josebasierra/voxel-planets) :
// planète = champ de distance signée (sphère déformée par l'élévation + grottes + noyau), arbre d'octants pour le niveau de détail
// (les morceaux proches sont fins, les lointains grossiers), maillage par « surface nets » (un sommet par cellule traversée, comme le
// MeshGenerator d'origine), modifications du terrain (creuser) stockées à part et appliquées par-dessus la génération procédurale.
// Différences avec l'original : le calcul tourne dans des Web Workers (au lieu des Jobs Burst), les coutures entre niveaux de détail sont
// cachées par un léger recouvrement des morceaux et par la projection des sommets sur la vraie surface (au lieu des « seams » de l'original),
// les modifications sont des sphères creusées (au lieu d'un octree de voxels).

// ----- cœur : bruit, champ de distance, maillage. Autonome (sert aussi de code aux workers via toString) -----
function vxCore(){
'use strict';
const F3=1/3,G3=1/6,GR=new Float32Array([1,1,0,-1,1,0,1,-1,0,-1,-1,0,1,0,1,-1,0,1,1,0,-1,-1,0,-1,0,1,1,0,-1,1,0,1,-1,0,-1,-1]);
const perm=new Uint8Array(512),pm=new Uint8Array(512);
let P=null,CAV=true,DG=null,NDG=0;const OUT={ds:0,m:0};
function seed(s){const p=new Uint8Array(256);for(let i=0;i<256;i++)p[i]=i;let x=(Math.imul(s|0,2654435761)>>>0)||1;
 for(let i=255;i>0;i--){x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;const j=x%(i+1),t=p[i];p[i]=p[j];p[j]=t}
 for(let i=0;i<512;i++){perm[i]=p[i&255];pm[i]=perm[i]%12}}
// bruit de simplexe 3D (Gustavson, domaine public), résultat dans [-1,1]
function sn(x,y,z){const s=(x+y+z)*F3,i=Math.floor(x+s),j=Math.floor(y+s),k=Math.floor(z+s),t=(i+j+k)*G3,x0=x-(i-t),y0=y-(j-t),z0=z-(k-t);
 let i1,j1,k1,i2,j2,k2;
 if(x0>=y0){if(y0>=z0){i1=1;j1=0;k1=0;i2=1;j2=1;k2=0}else if(x0>=z0){i1=1;j1=0;k1=0;i2=1;j2=0;k2=1}else{i1=0;j1=0;k1=1;i2=1;j2=0;k2=1}}
 else{if(y0<z0){i1=0;j1=0;k1=1;i2=0;j2=1;k2=1}else if(x0<z0){i1=0;j1=1;k1=0;i2=0;j2=1;k2=1}else{i1=0;j1=1;k1=0;i2=1;j2=1;k2=0}}
 const x1=x0-i1+G3,y1=y0-j1+G3,z1=z0-k1+G3,x2=x0-i2+2*G3,y2=y0-j2+2*G3,z2=z0-k2+2*G3,x3=x0-1+3*G3,y3=y0-1+3*G3,z3=z0-1+3*G3,ii=i&255,jj=j&255,kk=k&255;
 let n=0,q;
 q=.6-x0*x0-y0*y0-z0*z0;if(q>0){const g=pm[ii+perm[jj+perm[kk]]]*3;q*=q;n+=q*q*(GR[g]*x0+GR[g+1]*y0+GR[g+2]*z0)}
 q=.6-x1*x1-y1*y1-z1*z1;if(q>0){const g=pm[ii+i1+perm[jj+j1+perm[kk+k1]]]*3;q*=q;n+=q*q*(GR[g]*x1+GR[g+1]*y1+GR[g+2]*z1)}
 q=.6-x2*x2-y2*y2-z2*z2;if(q>0){const g=pm[ii+i2+perm[jj+j2+perm[kk+k2]]]*3;q*=q;n+=q*q*(GR[g]*x2+GR[g+1]*y2+GR[g+2]*z2)}
 q=.6-x3*x3-y3*y3-z3*z3;if(q>0){const g=pm[ii+1+perm[jj+1+perm[kk+1]]]*3;q*=q;n+=q*q*(GR[g]*x3+GR[g+1]*y3+GR[g+2]*z3)}
 return 32*n}
function fbm(x,y,z,o){let a=1,s=0,t=0;for(let i=0;i<o;i++){s+=sn(x,y,z)*a;t+=a;a*=.5;x*=2.03;y*=2.03;z*=2.03}return s/t}
function rid(x,y,z,o){let a=1,s=0,t=0,w=1;for(let i=0;i<o;i++){let v=1-Math.abs(sn(x,y,z));v*=v*w;w=Math.min(1,v*1.6);s+=v*a;t+=a;a*=.5;x*=2.07;y*=2.07;z*=2.07}return s/t}
const sm=(a,b,v)=>{v=(v-a)/(b-a);v=v<0?0:v>1?1:v;return v*v*(3-2*v)};
// élévation (m) au-dessus du rayon de base, selon la direction (vecteur unitaire)
function elev(nx,ny,nz){const R=P.R,x=nx*R,y=ny*R,z=nz*R,fC=P.fC,fM=P.fM;
 const w=sn(x*fC*.45+11.3,y*fC*.45-4.1,z*fC*.45+7.7)*P.warp;
 const c=fbm((x+w)*fC,(y-w*.7)*fC,(z+w*.4)*fC,4);
 let e=(c+P.cB)*P.amp*.75;
 if(P.mW>0){const mk=sm(P.mL,P.mL+.35,c);if(mk>0)e+=Math.pow(rid(x*fM,y*fM,z*fM,4),1.6)*mk*P.amp*P.mW}
 if(P.det>0)e+=sn(x*.05,y*.05,z*.05)*P.det;
 if(P.dune>0){const d=1-Math.abs(Math.sin(x*.016+y*.009-z*.006+sn(x*.004,y*.004,z*.004)*3));e+=d*d*P.dune*(1-sm(.1,.4,c))}
 if(P.ter>0){const s=P.ter,k=e/s,fl=Math.floor(k);e=s*(fl+sm(.3,.7,k-fl))*.85+e*.15}
 const C=P.cr;for(let i=0;i<C.length;i+=5){const d=nx*C[i]+ny*C[i+1]+nz*C[i+2];if(d<C[i+3])continue;const s=Math.sqrt((1-d)/(1-C[i+3]))*1.45;
  e+=C[i+4]*(s<1?s*s-1:0)+C[i+4]*.35*Math.exp(-(s-1)*(s-1)*40)}
 const V=P.vo;for(let i=0;i<V.length;i+=5){const d=nx*V[i]+ny*V[i+1]+nz*V[i+2];if(d<V[i+3])continue;const s=Math.sqrt((1-d)/(1-V[i+3]));
  e+=V[i+4]*Math.pow(1-s,1.7)-(s<.16?V[i+4]*.3*sm(.16,.05,s):0)}
 return e}
// champ de distance signée : < 0 = roche, > 0 = vide. OUT.ds = distance à la surface du relief (profondeur = -ds), OUT.m = matière
// treillis d'élévation d'un morceau (interpolation trilinéaire : ~20 fois moins d'appels au bruit pendant le maillage)
let LT=null;const LN=13;
function latSet(x0,y0,z0,span){const L=new Float32Array(LN*LN*LN),st=span/(LN-1);
 for(let k=0;k<LN;k++)for(let j=0;j<LN;j++)for(let i=0;i<LN;i++){const x=x0+i*st,y=y0+j*st,z=z0+k*st,r=Math.sqrt(x*x+y*y+z*z)||1;L[i+j*LN+k*LN*LN]=elev(x/r,y/r,z/r)}
 LT={L,x0,y0,z0,is:1/st}}
function latE(x,y,z){const T=LT,m=LN-1.0001;let u=(x-T.x0)*T.is,v=(y-T.y0)*T.is,w=(z-T.z0)*T.is;u=u<0?0:u>m?m:u;v=v<0?0:v>m?m:v;w=w<0?0:w>m?m:w;
 const i=u|0,j=v|0,k=w|0,fu=u-i,fv=v-j,fw=w-k,L=T.L,b=i+j*LN+k*LN*LN,N2=LN*LN;
 const a00=L[b]+(L[b+1]-L[b])*fu,a10=L[b+LN]+(L[b+LN+1]-L[b+LN])*fu,a01=L[b+N2]+(L[b+N2+1]-L[b+N2])*fu,a11=L[b+N2+LN]+(L[b+N2+LN+1]-L[b+N2+LN])*fu;
 const c0=a00+(a10-a00)*fv,c1=a01+(a11-a01)*fv;return c0+(c1-c0)*fw}
function sdf(x,y,z){const r=Math.sqrt(x*x+y*y+z*z);let ds;
 if(r>P.Rx){OUT.ds=r-P.Rx+1;OUT.m=0;return r-P.Rx+1}
 if(r<P.Rn)ds=r-P.Rn-1;else{const e=LT?latE(x,y,z):elev(x/r,y/r,z/r);ds=r-P.R-e}
 let f=ds,m=0;if(P.ice&&r-P.Rs<f){f=r-P.Rs;m=1}
 OUT.ds=f;const dep=-f,top=r-ds;
 if(CAV&&f<9&&r>P.cR*.55){const fc=P.cF,n1=sn(x*fc,y*fc,z*fc),n2=sn(x*fc+71.3,y*fc-17.9,z*fc+33.1);
  let w=P.cW*(.4+.6*sm(0,18,dep));if(P.Rs>0&&top<P.Rs+2&&dep<40)w*=sm(7,22,dep);
  let cv=(Math.sqrt(n1*n1+n2*n2)-w)/(fc*2.3);
  if(dep>12){const vf=P.vF,n3=sn(x*vf+5.5,y*vf-2.2,z*vf-9.1);const cav=(P.vT-n3)/(vf*2.4)+Math.max(0,40-dep)*.6;if(cav<cv)cv=cav}
  if(-cv>f){f=-cv;m=0}}
 if(r<P.cR+40){const cr=P.cR+7*sn(x*.021,y*.021,z*.021);if(cr-r>f){f=cr-r;m=0}if(P.cS>0){const cs=r-P.cS;if(cs<f){f=cs;m=2}}}
 const S=P.sh;for(let i=0;i<S.length;i+=5){const t=x*S[i]+y*S[i+1]+z*S[i+2];if(t<P.cR*.6||t>P.Rx+40)continue;const qx=x-S[i]*t,qy=y-S[i+1]*t,qz=z-S[i+2]*t;
  const rad=S[i+3]*(1+.28*sn(t*.013+S[i+4],S[i+4],0)),v=rad-Math.sqrt(qx*qx+qy*qy+qz*qz);if(v>f){f=v;m=0}}
 if(CAV)for(let i=0;i<NDG;i+=4){const dx=x-DG[i],dy=y-DG[i+1],dz=z-DG[i+2],v=DG[i+3]-Math.sqrt(dx*dx+dy*dy+dz*dz);if(v>f){f=v;m=0}}
 OUT.m=m;return f}
// gradient (différences avant) → normale
const GN=[0,0,0];function grad(x,y,z,f0,h){GN[0]=sdf(x+h,y,z)-f0;GN[1]=sdf(x,y+h,z)-f0;GN[2]=sdf(x,y,z+h)-f0;const l=Math.hypot(GN[0],GN[1],GN[2])||1e-9;GN[0]/=l;GN[1]/=l;GN[2]/=l;return l/h}
// paramètres + bornes de rayon (min/max de l'élévation, niveau de la mer) par échantillonnage
function setup(p){P=p;P.cr=P.cr||[];P.vo=P.vo||[];P.sh=P.sh||[];seed(P.seed);
 if(P.Rn==null){const n=3000,E=new Float32Array(n);P.Rn=-1e9;P.Rx=1e9;for(let i=0;i<n;i++){const y=1-2*(i+.5)/n,rr=Math.sqrt(1-y*y),a=i*2.399963;E[i]=elev(Math.cos(a)*rr,y,Math.sin(a)*rr)}
  const S=Array.from(E).sort((a,b)=>a-b),mn=S[0],mx=S[n-1],m=P.amp*.18+6;P.Rn=P.R+mn-m;P.Rx=P.R+mx+m;P.eMin=mn;P.eMax=mx;
  P.Rs=P.seaQ>0?P.R+S[Math.min(n-1,Math.floor(P.seaQ*n))]:0;if(P.seaQ<0)P.Rs=P.R+mn-1}
 return P}
// ----- maillage d'un morceau : grille (N+3)³ de points de i=-1 à N+1, « surface nets », recouvrement d'une cellule de chaque côté -----
function mesh(ox,oy,oz,size,N,cav,digs){try{return mesh0(ox,oy,oz,size,N,cav,digs)}finally{LT=null}}
const BUF={};function buf(k,T,n){let b=BUF[k];if(!b||b.length<n)b=BUF[k]=new T(n);return b}
const EA=new Int8Array([0,1,2,3,4,5,6,7,0,2,1,3,4,6,5,7,0,4,1,5,2,6,3,7]),COx=[0,1,0,1,0,1,0,1],COy=[0,0,1,1,0,0,1,1],COz=[0,0,0,0,1,1,1,1];
function mesh0(ox,oy,oz,size,N,cav,digs){CAV=cav;DG=digs;NDG=digs?digs.length:0;const h=size/N,M=N+3,M2=M*M,V=buf('V'+M,Float32Array,M*M2);let neg=0,ps=0;
 {const cx=ox+size/2,cy=oy+size/2,cz=oz+size/2,cr=Math.sqrt(cx*cx+cy*cy+cz*cz),hd=size*.87+3*h;if(cr-hd>P.Rx)return null;if(cr+hd>P.Rn){latSet(ox-3*h,oy-3*h,oz-3*h,size+6*h);
  // morceau entièrement dans le vide (au-dessus du relief) ou entièrement plein (sans grottes, puits ni noyau) : rien à calculer
  const L=LT.L,st=(size+6*h)/(LN-1);let mn=1e9,mx=-1e9;for(let k=0;k<LN;k++)for(let j=0;j<LN;j++)for(let i=0;i<LN;i++){const x=ox-3*h+i*st,y=oy-3*h+j*st,z=oz-3*h+k*st,v=Math.sqrt(x*x+y*y+z*z)-P.R-L[i+j*LN+k*LN*LN];if(v<mn)mn=v;if(v>mx)mx=v}
  const mg=st*1.5+2;if(mn>mg&&!(P.ice&&cr-hd<P.Rs))return null;
  if(mx<-mg&&!cav&&cr-hd>P.cR+45){let sh=false;const S=P.sh;for(let i=0;i<S.length;i+=5){const t=cx*S[i]+cy*S[i+1]+cz*S[i+2],qx=cx-S[i]*t,qy=cy-S[i+1]*t,qz=cz-S[i+2]*t;if(Math.sqrt(qx*qx+qy*qy+qz*qz)<S[i+3]*1.4+hd)sh=true}if(!sh)return null}}}
 for(let k=0;k<M;k++){const z=oz+(k-1)*h;for(let j=0;j<M;j++){const y=oy+(j-1)*h,b=j*M+k*M2;for(let i=0;i<M;i++){const v=sdf(ox+(i-1)*h,y,z);V[i+b]=v;if(v<0)neg++;else ps++}}}
 if(!neg||!ps)return null;
 const C=N+2,C2=C*C,cid=buf('C'+C,Int32Array,C*C2),P3=buf('P'+C,Float32Array,C*C2*3),cv=new Float32Array(8),off=new Int32Array(8);let nv=0;
 for(let c=0;c<8;c++)off[c]=COx[c]+COy[c]*M+COz[c]*M2;
 // un sommet par cellule traversée = moyenne des points de passage sur ses arêtes
 for(let k=0;k<C;k++)for(let j=0;j<C;j++){const b=j*M+k*M2,cb=j*C+k*C2;for(let i=0;i<C;i++){let msk=0;const vb=i+b;for(let c=0;c<8;c++){const v=V[vb+off[c]];cv[c]=v;if(v<0)msk|=1<<c}
  if(msk==0||msk==255){cid[i+cb]=-1;continue}let sx=0,sy=0,sz=0,ne=0;
  for(let e=0;e<24;e+=2){const a=EA[e],bb=EA[e+1],va=cv[a],vv=cv[bb];if((va<0)==(vv<0))continue;const t=va/(va-vv);sx+=COx[a]+(COx[bb]-COx[a])*t;sy+=COy[a]+(COy[bb]-COy[a])*t;sz+=COz[a]+(COz[bb]-COz[a])*t;ne++}
  cid[i+cb]=nv;P3[nv*3]=ox+(i-1+sx/ne)*h;P3[nv*3+1]=oy+(j-1+sy/ne)*h;P3[nv*3+2]=oz+(k-1+sz/ne)*h;nv++}}
 // faces : une par arête de la grille de points qui change de signe (quad des 4 cellules autour)
 const I=buf('I'+M,Uint32Array,M*M2*18);let ni=0;
 const cell=(i,j,k)=>(i<-1||j<-1||k<-1||i>N||j>N||k>N)?-1:cid[(i+1)+(j+1)*C+(k+1)*C2];
 const quad=(a,b,c,d,flip)=>{if(a<0||b<0||c<0||d<0)return;if(flip){const t=b;b=d;d=t}
  const d1=(P3[a*3]-P3[c*3])**2+(P3[a*3+1]-P3[c*3+1])**2+(P3[a*3+2]-P3[c*3+2])**2,d2=(P3[b*3]-P3[d*3])**2+(P3[b*3+1]-P3[d*3+1])**2+(P3[b*3+2]-P3[d*3+2])**2;
  if(d1<=d2){I[ni++]=a;I[ni++]=b;I[ni++]=c;I[ni++]=a;I[ni++]=c;I[ni++]=d}else{I[ni++]=a;I[ni++]=b;I[ni++]=d;I[ni++]=b;I[ni++]=c;I[ni++]=d}};
 for(let k=-1;k<=N+1;k++)for(let j=-1;j<=N+1;j++){const b=(j+1)*M+(k+1)*M2;for(let i=-1;i<=N+1;i++){const v0=V[(i+1)+b],s0=v0<0;
  if(i<=N&&s0!=(V[(i+2)+b]<0))quad(cell(i,j-1,k-1),cell(i,j,k-1),cell(i,j,k),cell(i,j-1,k),!s0);
  if(j<=N&&s0!=(V[(i+1)+b+M]<0))quad(cell(i-1,j,k-1),cell(i-1,j,k),cell(i,j,k),cell(i,j,k-1),!s0);
  if(k<=N&&s0!=(V[(i+1)+b+M2]<0))quad(cell(i-1,j-1,k),cell(i,j-1,k),cell(i,j,k),cell(i-1,j,k),!s0)}}
 if(!ni)return null;
 // projection des sommets sur la vraie surface (coutures entre niveaux de détail), normale = gradient, profondeur, occlusion
 const pos=P3.slice(0,nv*3),nor=new Int8Array(nv*4),dep=new Float32Array(nv),mat=new Uint8Array(nv*4),orw=new Uint8Array(nv*4),gh=Math.max(.05,h*.25),lim=h*.6,a1=Math.max(.8,h*1.2),a2=Math.max(3,h*3);
 for(let v=0;v<nv;v++){let x=pos[v*3],y=pos[v*3+1],z=pos[v*3+2];
  {const f0=sdf(x,y,z),g=grad(x,y,z,f0,gh);let st=f0/Math.max(.3,g);st=st>lim?lim:st<-lim?-lim:st;x-=GN[0]*st;y-=GN[1]*st;z-=GN[2]*st}
  const f0=sdf(x,y,z),ds=OUT.ds,m=OUT.m;grad(x,y,z,f0,gh);const nx=GN[0],ny=GN[1],nz=GN[2];
  pos[v*3]=x;pos[v*3+1]=y;pos[v*3+2]=z;nor[v*4]=Math.round(nx*127);nor[v*4+1]=Math.round(ny*127);nor[v*4+2]=Math.round(nz*127);dep[v]=-ds;
  const o1=sdf(x+nx*a1,y+ny*a1,z+nz*a1)/a1,o2=sdf(x+nx*a2,y+ny*a2,z+nz*a2)/a2,ao=Math.max(0,Math.min(1,.15+.42*o1+.43*o2));mat[v*4]=m;mat[v*4+1]=Math.round(ao*255);if(m==0&&cav&&-ds>1.2){const o=ore(x,y,z,-ds);if(o)orw[v*4+o-1]=Math.round(OUT.ow*255)}}
 const idx=nv>65535?I.slice(0,ni):Uint16Array.from(I.subarray(0,ni));
 return{pos,nor,dep,mat,orw,idx,nv,nt:ni/3}}
// minerais : filons en amas (bruit), plus rares et plus précieux en profondeur — 1 fer, 2 titane, 3 cristal, 4 or
const ORE=[[1.5,.56,11.3],[10,.61,37.7],[24,.655,73.1],[48,.70,151.9]];
function ore(x,y,z,dep){if(dep<1.5)return 0;const f=1/9.5;let best=0,bv=0;for(let k=0;k<4;k++){const t=ORE[k];if(dep<t[0])continue;const v=sn(x*f+t[2],y*f-t[2]*.7,z*f+t[2]*.3)-t[1]+(P.oreB||0);if(v>bv){bv=v;best=k+1}}OUT.ow=Math.min(1,bv/.05);return best}
// carte d'élévation équirectangulaire (profondeur de l'eau près des côtes en R, relief en G)
function emap(w,h){const D=new Uint8Array(w*h*4),sea=P.Rs>0?P.Rs-P.R:P.eMin-50,rg=Math.max(1,P.eMax-P.eMin);
 for(let j=0;j<h;j++){const th=(j+.5)/h*Math.PI,y=Math.cos(th),q=Math.sin(th);for(let i=0;i<w;i++){const ph=((i+.5)/w-.5)*2*Math.PI,e=elev(Math.cos(ph)*q,y,Math.sin(ph)*q),o=(i+j*w)*4,wd=sea-e;
  D[o]=Math.max(0,Math.min(255,wd*8+32));D[o+1]=Math.max(0,Math.min(255,(e-P.eMin)/rg*255));D[o+3]=255}}return D}
return{setup,sdf,elev,grad,GN,OUT,mesh,sn,emap,ore,setCav:(c,d)=>{CAV=c;DG=d;NDG=d?d.length:0},getP:()=>P}}

// ----- préréglages par type de planète (forme du relief, mer, grottes, noyau, couleurs) -----
function vxPreset(ty,seed,R,hue){let s=(seed>>>0)||1;const r=()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296};
 const dirs=n=>{const a=[];for(let i=0;i<n;i++){const y=r()*2-1,t=r()*6.2832,q=Math.sqrt(1-y*y);a.push([Math.cos(t)*q,y,Math.sin(t)*q])}return a};
 const P={ty,R,seed:s,amp:R*.1,fC:1/(R*.55),fM:1/(R*.3),mW:.85,mL:.02,cB:0,warp:R*.14,det:1.6,dune:0,ter:0,seaQ:0,ice:0,sea:'none',
  cF:1/(88+r()*24),cW:.12+r()*.03,vF:1/(150+r()*50),vT:.56+r()*.05,cR:R*.17,cS:R*.17*.42,sh:[],cr:[],vo:[],atm:1,col:null};
 // deux grands puits naturels qui descendent jusqu'au noyau
 for(const d of dirs(2))P.sh.push(d[0],d[1],d[2],Math.max(16,Math.min(30,R*.028)),r()*50);
 const C=(h,s2,l)=>{h=((h%360)+360)%360/360;const k=n=>(n+h*12)%12,a=s2*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1));return[f(0),f(8),f(4)]};
 const H=hue==null?r()*360:hue;let pal;
 if(ty=='Océanique'){P.seaQ=.66;P.sea='eau';P.mL=.15;P.amp=R*.095;
  pal={sand:C(42,.36,.66),low:C(100+r()*30,.45,.3),high:C(120,.3,.24),rock:C(30,.12,.38),rock2:C(25,.15,.28),snow:C(200,.15,.92),deep:C(220,.1,.2),vein:C(185,.9,.55),sea:C(212,.72,.18),sea2:C(176,.7,.48),atm:C(205,.6,.62),snowL:.85}}
 else if(ty=='Jungle'){P.seaQ=.34;P.sea='eau';
  const G=80+Math.max(0,Math.min(90,H-70))*.6;pal={sand:C(42,.32,.56),low:C(G,.5,.24),high:C(G+18,.38,.19),rock:C(28,.13,.34),rock2:C(18,.16,.24),snow:C(200,.12,.9),deep:C(20,.12,.17),vein:C(160,.9,.5),sea:C(200,.65,.17),sea2:C(172,.6,.42),atm:C(198,.55,.62),snowL:.92}}
 else if(ty=='Désertique'){P.seaQ=0;P.dune=R*.006;P.mW=.65;P.det=2.2;
  pal={sand:C(36,.6,.6),low:C(30,.6,.52),high:C(20,.5,.42),rock:C(14,.45,.34),rock2:C(8,.4,.25),snow:C(30,.4,.7),deep:C(12,.3,.18),vein:C(40,1,.55),sea:C(30,.5,.3),sea2:C(30,.5,.4),atm:C(26,.42,.72),snowL:9}}
 else if(ty=='Glacée'){P.seaQ=.42;P.ice=1;P.sea='glace';P.det=1.2;
  pal={sand:C(200,.25,.76),low:C(205,.2,.8),high:C(210,.18,.76),rock:C(215,.12,.42),rock2:C(220,.15,.3),snow:C(205,.18,.84),deep:C(215,.25,.2),vein:C(190,.9,.62),sea:C(195,.45,.62),sea2:C(190,.5,.75),atm:C(200,.5,.75),snowL:.0}}
 else if(ty=='Volcanique'){P.seaQ=.2;P.sea='lave';P.mW=.7;P.det=2;for(const d of dirs(5))P.vo.push(d[0],d[1],d[2],Math.cos(.16+r()*.12),R*(.07+r()*.06));for(const d of dirs(10))P.cr.push(d[0],d[1],d[2],Math.cos(.03+r()*.06),R*.012);
  pal={sand:C(15,.15,.12),low:C(10,.1,.13),high:C(5,.08,.1),rock:C(12,.1,.17),rock2:C(5,.12,.08),snow:C(20,.2,.3),deep:C(5,.2,.08),vein:C(18,1,.5),sea:C(10,1,.4),sea2:C(28,1,.5),atm:C(14,.5,.45),snowL:9,glow:1}}
 else if(ty=='Cristalline'){P.seaQ=.18;P.sea='cristal';P.ter=R*.012;P.mW=1;
  pal={sand:C(H+40,.25,.6),low:C(H,.3,.45),high:C(H+20,.35,.4),rock:C(H+180,.12,.32),rock2:C(H+200,.15,.22),snow:C(H,.3,.85),deep:C(H+180,.2,.15),vein:C(H,1,.6),sea:C(H,.8,.4),sea2:C(H+30,.8,.6),atm:C(H,.6,.62),snowL:.95}}
 else if(ty=='Astéroïde'){const hol=r()<.4;Object.assign(P,{seaQ:0,atm:0,amp:R*.2,fC:1/(R*.85),fM:1/(R*.3),mW:.9,warp:R*.35,det:2.5,cF:1/(R*.5+28),cW:.19,vF:1/(R*.7+20),vT:.5,cR:hol?R*.42:R*.1,cS:0,oreB:.035,sh:[]});
  for(const d of dirs(hol?3:2))P.sh.push(d[0],d[1],d[2],Math.max(9,R*.11),r()*50);for(const d of dirs(14))P.cr.push(d[0],d[1],d[2],Math.cos(.12+r()*.3),R*(.02+r()*.05));P.hol=hol;
  const h=20+r()*30,g=r()*.05;pal={sand:C(h,.08,.32),low:C(h,.05+g,.27),high:C(h+10,.05,.22),rock:C(h,.07,.25),rock2:C(h-10,.09,.15),snow:C(h,.1,.55),deep:C(h,.12,.13),vein:C(r()*360,.85,.55),sea:[0,0,0],sea2:[0,0,0],atm:[0,0,0],snowL:9}}
 else{P.seaQ=0;P.mW=.35;P.amp=R*.07;P.atm=0;P.det=1.2;for(const d of dirs(26))P.cr.push(d[0],d[1],d[2],Math.cos(.04+r()*.14),R*(.008+r()*.02));
  pal={sand:C(40,.05,.5),low:C(40,.06,.45),high:C(40,.05,.38),rock:C(40,.04,.3),rock2:C(40,.04,.22),snow:C(40,.05,.6),deep:C(40,.05,.16),vein:C(200,.8,.55),sea:[0,0,0],sea2:[0,0,0],atm:[0,0,0],snowL:9}}
 P.col=pal;
 const CL={Jungle:[.5,.85,[1,1,1]],'Océanique':[.47,.85,[1,1,1]],'Désertique':[.7,.55,[.95,.86,.72]],'Glacée':[.53,.8,[.95,.97,1]],Volcanique:[.5,.85,[.3,.26,.24]],Cristalline:[.6,.6,[.92,.82,1]]}[ty];
 if(CL)P.cl={v:CL[0],a:CL[1],c:CL[2]};
 if(CL&&r()<.3){P.ring=1;P.ringT=(r()-.5)*.5;P.ringC=ty=='Glacée'||ty=='Cristalline'?[.85,.9,1]:ty=='Volcanique'?[.5,.4,.36]:[.82,.76,.66]}
 return P}

// ----- pool de workers (le calcul du maillage ne bloque pas l'image) -----
const VXW={ws:[],q:[],busy:0,id:0,cb:new Map(),main:null,ok:false,init:false,P:new Map(),fg:new Map(),bud:typeof DESK!='undefined'&&!DESK?1.6:2.5};
function vxPoolInit(){if(VXW.init)return;VXW.init=true;
 const src='const vxCore='+vxCore.toString()+';const PL={};onmessage=e=>{const m=e.data;if(m.t=="p"){const c=vxCore();c.setup(m.P);PL[m.pid]=c;return}'+
  'if(m.t=="e"){const c=PL[m.pid],D=c?c.emap(m.w,m.h):null;postMessage({id:m.id,r:D},D?[D.buffer]:[]);return}'+
  'const c=PL[m.pid];let r=null,err=null;const t0=performance.now();try{r=c?c.mesh(m.x,m.y,m.z,m.s,m.N,m.cav,m.dg):null}catch(x){err=String(x)}const ms=performance.now()-t0;'+
  'if(r)postMessage({id:m.id,r,ms},[r.pos.buffer,r.nor.buffer,r.dep.buffer,r.mat.buffer,r.orw.buffer,r.idx.buffer]);else postMessage({id:m.id,r:null,err,ms})}';
 try{const url=URL.createObjectURL(new Blob([src],{type:'text/javascript'}));const n=Math.max(1,Math.min(4,((navigator.hardwareConcurrency||4)>>1)));
  for(let i=0;i<n;i++){const w=new Worker(url);w.n=0;w.onmessage=e=>{w.n--;VXW.busy--;const m=e.data;VXW.ms=(VXW.ms||0)+(m.ms||0);VXW.nj=(VXW.nj||0)+1;const cb=VXW.cb.get(m.id);VXW.cb.delete(m.id);if(m.err)console.warn('vox worker',m.err);if(cb)cb(m.r)};
   w.onerror=e=>{console.warn('vox worker',e.message||e);VXW.ok=false};VXW.ws.push(w)}VXW.ok=true}catch(e){console.warn('vox: workers indisponibles',e);VXW.ok=false}}
function vxPoolPlanet(pid,P){vxPoolInit();const Pc=JSON.parse(JSON.stringify(P));VXW.P.set(pid,Pc);for(const w of VXW.ws)w.postMessage({t:'p',pid,P:Pc})}
function vxPoolJob(pid,j,cb){const id=++VXW.id;j.id=id;j.pid=pid;j.t=j.t||'j';
 if(VXW.ok&&VXW.ws.length){let w=VXW.ws[0];for(const x of VXW.ws)if(x.n<w.n)w=x;w.n++;VXW.busy++;VXW.cb.set(id,cb);w.postMessage(j,j.dg?[j.dg.buffer]:[])}
 else{VXW.q.push([j,cb])}}
// repli sans worker : un morceau par image au plus
function vxPoolTick(){if(VXW.ok||!VXW.q.length)return;const t0=performance.now();while(VXW.q.length&&performance.now()-t0<6){const[j,cb]=VXW.q.shift();
 let c=VXW.main&&VXW.main[j.pid];if(!c){VXW.main=VXW.main||{};c=VXW.main[j.pid]=vxCore();c.setup(JSON.parse(JSON.stringify(VXW.P.get(j.pid))))}
 let r=null;try{r=j.t=='e'?c.emap(j.w,j.h):c.mesh(j.x,j.y,j.z,j.s,j.N,j.cav,j.dg)}catch(e){console.warn(e)}cb(r)}}
const vxPoolFree=()=>VXW.ok?VXW.ws.length*3-VXW.busy:(VXW.q.length?0:1);

// ----- texture de bruit qui se répète (grain, taches, fissures, veines) pour le placage triplanaire -----
let VXTX=null;
function vxTex(){if(VXTX)return VXTX;const S=256,D=new Uint8Array(S*S*4);let s=97531;const rnd=()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296};
 const lat=n=>{const a=new Float32Array(n*n);for(let i=0;i<n*n;i++)a[i]=rnd();return a};const L=[4,8,16,32,64].map(n=>({n,a:lat(n)}));
 const vn=(o,x,y)=>{const n=o.n,fx=x*n,fy=y*n,i=Math.floor(fx),j=Math.floor(fy),u=fx-i,v=fy-j,su=u*u*(3-2*u),sv=v*v*(3-2*v),A=o.a,g=(a,b)=>A[((a%n)+n)%n+(((b%n)+n)%n)*n];
  const a=g(i,j),b=g(i+1,j),c=g(i,j+1),d=g(i+1,j+1);return a+(b-a)*su+(c-a+(d-c-b+a)*su)*sv};
 const pts=[];const CN=10;for(let j=0;j<CN;j++)for(let i=0;i<CN;i++)pts.push([(i+rnd())/CN,(j+rnd())/CN]);
 for(let y=0;y<S;y++)for(let x=0;x<S;x++){const u=x/S,v=y/S;
  const fine=vn(L[4],u,v)*.5+vn(L[3],u,v)*.3+vn(L[2],u,v)*.2,med=vn(L[0],u,v)*.45+vn(L[1],u,v)*.35+vn(L[2],u,v)*.2;
  let d1=9,d2=9;for(const p of pts){let dx=Math.abs(u-p[0]),dy=Math.abs(v-p[1]);dx=Math.min(dx,1-dx);dy=Math.min(dy,1-dy);const d=dx*dx+dy*dy;if(d<d1){d2=d1;d1=d}else if(d<d2)d2=d}
  const crack=Math.min(1,(Math.sqrt(d2)-Math.sqrt(d1))*14),rid=Math.pow(1-Math.abs(vn(L[1],u,v)*2-1),6)*.6+Math.pow(1-Math.abs(vn(L[2],u,v)*2-1),8)*.4,o=(x+y*S)*4;
  D[o]=fine*255;D[o+1]=med*255;D[o+2]=crack*255;D[o+3]=Math.min(1,rid)*255}
 const t=new THREE.DataTexture(D,S,S,THREE.RGBAFormat);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;t.vxKeep=1;VXTX=t;return t}

// ----- ciel (même formule pour le dôme, les reflets de l'eau et le brouillard du terrain) -----
const VX_SKY=`vec3 vxSky(vec3 V,vec3 U,vec3 S,vec3 atm,vec3 sc,float dens,float dip){float sh=dot(U,S),day=smoothstep(-.22,.18,sh),h=(dot(V,U)+dip)/(1.+dip),ts=max(dot(V,S),0.);
 float hz=pow(1.-clamp(h,0.,1.),4.),bel=smoothstep(0.,-.3,h),ss=smoothstep(.42,0.,sh)*smoothstep(-.34,-.02,sh);
 vec3 zen=atm*atm*1.15*day,hor=mix(atm,vec3(1.),.5)*day,c=mix(zen,hor,hz);
 c=mix(c,vec3(1.,.36,.11)*1.5+hor*.25,ss*hz*(.3+.7*ts*ts));c*=1.-bel*.6;
 c+=sc*(pow(ts,32.)*.6+pow(ts,6.)*.12)*(day+ss*.6)+vec3(.006,.009,.02)*(1.-day);return c*dens;}`;
function vxU(P){const c=a=>new THREE.Color(a[0],a[1],a[2]),K=P.col;
 const em=new THREE.DataTexture(new Uint8Array([255,128,0,255]),1,1,THREE.RGBAFormat);em.needsUpdate=true;
 return{sunDir:{value:new THREE.Vector3(0,1,0)},sunCol:{value:new THREE.Color(1,.97,.9)},pc:{value:new THREE.Vector3()},camUp:{value:new THREE.Vector3(0,1,0)},
  dens:{value:1},dip:{value:0},fogK:{value:0},caveK:{value:0},waterK:{value:0},lampPos:{value:new THREE.Vector3()},lampDir:{value:new THREE.Vector3(0,0,-1)},lampK:{value:0},tm:{value:0},space:{value:0},
  R:{value:P.R},Rs:{value:P.Rs>0?P.Rs:P.R+P.eMin-50},amp:{value:P.amp},cR:{value:P.cR},snowL:{value:K.snowL},glow:{value:K.glow||0},hasSea:{value:P.Rs>0&&!P.ice?1:0},
  cSand:{value:c(K.sand)},cLow:{value:c(K.low)},cHigh:{value:c(K.high)},cRock:{value:c(K.rock)},cRock2:{value:c(K.rock2)},cSnow:{value:c(K.snow)},cDeep:{value:c(K.deep)},cVein:{value:c(K.vein)},
  cSea:{value:c(K.sea)},cSea2:{value:c(K.sea2)},atm:{value:c(K.atm)},tx:{value:vxTex()},em:{value:em}}}
const VX_TVS=`attribute vec4 nrm;attribute float dp;attribute vec4 mt,orw;varying vec3 vO,vNo,vW,vN;varying float vD;varying vec2 vM;varying vec4 vOr;
void main(){vOr=orw;vO=position;vNo=normalize(nrm.xyz);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;vN=normalize(mat3(modelMatrix)*vNo);vD=dp;vM=mt.xy;gl_Position=projectionMatrix*viewMatrix*w;}`;
const VX_COMMON=`uniform vec3 sunDir,pc,camUp,lampPos,lampDir,atm,cSea,cSea2;uniform vec3 sunCol;uniform float dip,dens,fogK,caveK,waterK,lampK,tm,space,R,Rs;uniform sampler2D tx,em;
`+VX_SKY+`
vec4 tri(vec3 p,vec3 w){return texture2D(tx,p.yz)*w.x+texture2D(tx,p.xz)*w.y+texture2D(tx,p.xy)*w.z;}
float vxWD(vec3 d){return texture2D(em,vec2(atan(d.z,d.x)/6.2831853+.5,acos(clamp(d.y,-1.,1.))/3.1415927)).r*31.875-4.;}
vec3 vxFog(vec3 c,vec3 W){if(space>.5)return c;vec3 D=W-cameraPosition;float d=length(D);vec3 V=D/d;vec3 fc=vxSky(V,camUp,sunDir,atm,sunCol,max(dens,.04),dip);
 fc=mix(fc,vec3(.004,.005,.007),caveK);fc=mix(fc,cSea*.22*(.15+.85*smoothstep(-.2,.3,dot(camUp,sunDir))),waterK);
 float k=fogK*(1.-caveK)+caveK*.012+waterK*.05;return mix(c,fc,1.-exp(-d*k));}
float vxLamp(vec3 N,vec3 W){if(lampK<.01)return 0.;vec3 L=lampPos-W;float d=length(L);L/=d;return lampK*smoothstep(.72,.93,dot(-L,lampDir))*max(dot(N,L),0.)/(1.+d*d*.005);}`;
// ----- matériau du terrain : couches selon l'altitude, la pente et la profondeur, triplanaire, grottes sombres, lampe frontale, brouillard -----
const VX_TFS=VX_COMMON+`uniform float vxFa;uniform vec3 cSand,cLow,cHigh,cRock,cRock2,cSnow,cDeep,cVein;uniform float amp,cR,snowL,hasSea,glow;varying vec3 vO,vNo,vW,vN;varying float vD;varying vec2 vM;varying vec4 vOr;
void main(){if(vxFa<.999){float h=fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))));if(vxFa>0.?h>vxFa:h< -vxFa)discard;}float r=length(vO);vec3 up=vO/r;float alt=r-R,aS=r-Rs,dep=vD;vec3 no=normalize(vNo);float sl=dot(no,up);
 vec3 bw=pow(abs(no),vec3(4.));bw/=dot(bw,vec3(1.));vec4 t1=tri(vO*.27,bw),t2=tri(vO*.031,bw),t3=tri(vO*.0043,bw),t0=tri(vO*1.3,bw);
 float n1=t1.r,n2=t2.g,n3=t3.g,hN=alt/amp+(n2-.5)*.25+(n3-.5)*.35,sw=1.-smoothstep(.5,3.5,dep);
 vec3 lo=mix(cLow,cLow*vec3(1.12,1.02,.72),smoothstep(.35,.7,n3)),cs=mix(lo,cHigh,smoothstep(.0,.7,hN+(n2-.5)*.3));
 if(hasSea>.5){float b=smoothstep(.5,2.6,aS+(n1-.5)*1.6);cs=mix(mix(cSand*.62,cSand,smoothstep(-.2,.7,aS)),cs,b);}
 float rk=smoothstep(.84,.64,sl+(n2-.5)*.16);vec3 rc=mix(cRock,cRock2,smoothstep(.25,.75,n2+(t0.r-.5)*.3))*(1.-smoothstep(.3,.04,t1.b)*.25);cs=mix(cs,rc,rk);
 if(snowL<2.){float sk=smoothstep(snowL-.05,snowL+.05,hN+(n1-.5)*.12)*smoothstep(.48,.7,sl);cs=mix(cs,cSnow,sk);}
 cs*=.82+.24*n1+.14*t0.r;
 float band=sin(r*.42+n2*7.)*.5+.5;vec3 cu=mix(cRock2,cRock,band*.65+n1*.35)*(.78+.3*t1.r+.14*t0.r);cu=mix(cu,cDeep,smoothstep(15.,R*.45,dep));cu*=1.-smoothstep(.35,.0,t2.b)*.35;
 vec3 col=mix(cu,cs,sw),emis=vec3(0.);
 float vein=smoothstep(.66,.8,t2.a)*smoothstep(5.,16.,dep);col=mix(col,cVein*.3,vein);emis+=cVein*vein*(.22+.08*sin(tm*1.3+r*.2));
 if(glow>0.){float ck=smoothstep(.16,.02,t2.b)*smoothstep(.45,.75,n3)*sw;emis+=vec3(1.,.3,.05)*ck*glow*(.9+.3*sin(tm*1.5+r*.1));col=mix(col,vec3(.05,.02,.01),ck);}
 float hot=smoothstep(cR*1.75,cR*1.02,r);emis+=hot*vec3(1.,.3,.05)*(.2+.8*t1.r)*.55*smoothstep(.45,.75,t2.r+hot*.3);col=mix(col,vec3(.08,.03,.02),hot*.7);
 float id=vM.x*255.,spec=.05*sw;
 // filons de minerai : fer rouillé, titane argenté, cristal lumineux, or brillant
 {vec4 o=smoothstep(.15,.6,vOr)*smoothstep(.25,.6,t1.r*.6+t0.g*.6);float ot=o.x+o.y+o.z+o.w;if(ot>.01){vec3 oc=(vec3(.42,.18,.09)*o.x+vec3(.42,.47,.53)*o.y+vec3(.25,.85,1.)*o.z+vec3(1.,.74,.2)*o.w)/ot;float k=min(1.,ot);
  col=mix(col,oc*(.75+.5*t0.r),k);spec=max(spec,k*(.15+.35*(o.y+o.w)/ot));emis+=(vec3(.15,.6,.8)*o.z*(.45+.2*sin(tm*2.+r*.3))+vec3(1.,.7,.2)*o.w*.12)*k;}}
 if(id>.5&&id<1.5){col=mix(cSea2,cSnow,t2.r*.6)*(.85+.3*n1);col*=1.-smoothstep(.25,.0,t1.b)*.3;spec=.7;}
 else if(id>1.5){float fl=tri(vO*.05+vec3(tm*.03),bw).r;col=vec3(.15,.04,.02);emis=mix(vec3(.9,.2,.03),vec3(1.,.55,.12),fl)*(.75+.2*sin(tm*2.+r))*smoothstep(.2,.7,fl+.3);}
 vec3 upW=normalize(vW-pc),N=normalize(vN);vec3 T=normalize(cross(N,abs(N.y)<.9?vec3(0.,1.,0.):vec3(1.,0.,0.))),B=cross(N,T);
 N=normalize(N+(T*(t0.r-.5+t1.g-.5)+B*(t0.g-.5+t1.r-.5))*.32);
 float term=smoothstep(-.14,.12,dot(upW,sunDir)),vis=1.-smoothstep(1.5,9.,dep),ao=vM.y;
 float dif=max(dot(N,sunDir),0.)*term*vis;
 vec3 sky=mix(atm,vec3(1.),.35)*(.2+.14*dot(N,upW))*smoothstep(-.3,.25,dot(upW,sunDir))*vis*max(dens,.3);
 vec3 lit=sunCol*dif*1.15*(.55+.45*ao)+sky*ao+vec3(.01,.011,.015)*ao+vec3(1.,.93,.8)*vxLamp(N,vW)*2.6*(.4+.6*ao);
 vec3 V=normalize(cameraPosition-vW);lit+=sunCol*pow(max(dot(reflect(-sunDir,N),V),0.),40.)*spec*term*vis;
 if(lampK>.01){vec3 Lw=normalize(lampPos-vW);lit+=vec3(1.,.95,.85)*pow(max(dot(reflect(-Lw,N),V),0.),28.)*spec*vxLamp(N,vW)*1.4;}
 vec3 c=col*lit+emis;gl_FragColor=vec4(vxFog(c,vW),1.);}`;
function vxTerrainMat(U){return new THREE.ShaderMaterial({uniforms:U,vertexShader:VX_TVS,fragmentShader:VX_TFS})}
// mer d'eau / de lave / de cristal liquide : sphère au niveau de la mer, vagues, profondeur lue dans la carte d'élévation (bas-fonds clairs, écume)
const VX_SVS=`uniform float Rs;varying vec3 vO,vW;void main(){vO=normalize(position)*Rs;vec4 w=modelMatrix*vec4(vO,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
const VX_SFS=VX_COMMON+`uniform float kind;varying vec3 vO,vW;
void main(){vec3 up=normalize(vO),bw=pow(abs(up),vec3(4.));bw/=dot(bw,vec3(1.));float wd=vxWD(up);if(wd<-2.5)discard;
 vec4 a=tri(vO*.045+vec3(tm*.013,0.,tm*.009),bw),b=tri(vO*.11-vec3(0.,tm*.021,tm*.017),bw);
 vec3 upW=normalize(vW-pc);vec3 T=normalize(cross(upW,vec3(.13,1.,.31))),B=cross(upW,T);
 vec3 V=normalize(vW-cameraPosition);float term=smoothstep(-.14,.12,dot(upW,sunDir)),day=max(.12,smoothstep(-.3,.2,dot(upW,sunDir)));
 if(kind>1.5&&kind<2.5){float f=smoothstep(.35,.75,a.r*.6+b.g*.6);vec3 c=mix(cSea*1.25,cSea2*1.6,f)*(1.+.25*sin(tm*1.7+a.g*6.));
  c=mix(vec3(.04,.015,.01),c,smoothstep(.12,.45,a.b+f*.5-smoothstep(3.,0.,wd)*.35));gl_FragColor=vec4(vxFog(c,vW),1.);return;}
 vec3 N=normalize(upW+(T*(a.r-.5+b.r-.5)+B*(a.g-.5+b.g-.5))*.3);float dif=max(dot(N,sunDir),0.)*term;
 float fr=.03+.97*pow(1.-max(dot(-V,N),0.),5.),shl=exp(-max(wd,0.)/6.);vec3 Rf=reflect(V,N);
 vec3 sk=vxSky(Rf,upW,sunDir,atm,sunCol,max(dens,.35),0.);
 vec3 base=mix(cSea,cSea2,shl*.85+a.g*.15)*(.25+dif*.85)*day;
 vec3 c=mix(base,sk,fr*.8)+sunCol*pow(max(dot(Rf,sunDir),0.),240.)*3.5*term;
 float fo=smoothstep(1.1,0.,wd)*smoothstep(.42,.7,a.r*.7+b.g*.5+.25*sin(tm*1.8+wd*4.));c=mix(c,vec3(.92,.95,.97)*(day*.95+.02+vxLamp(upW,vW)*.8),fo*.85);
 if(kind>2.5)c+=cSea2*.3*(.6+.4*sin(tm*1.1+a.r*5.));
 c+=vec3(1.)*vxLamp(N,vW)*.6;gl_FragColor=vec4(vxFog(c,vW),clamp(mix(.95,.42,shl)+fr*.5+fo,0.,1.));}`;
function vxSeaMat(U,kind){return new THREE.ShaderMaterial({uniforms:Object.assign({kind:{value:kind}},U),vertexShader:VX_SVS,fragmentShader:VX_SFS,transparent:kind!=2,side:THREE.DoubleSide,depthWrite:kind==2})}
// halo d'atmosphère vu de loin
const VX_AVS=`varying vec3 vNV,vN;void main(){vN=normalize(mat3(modelMatrix)*normal);vNV=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const VX_AFS=`uniform vec3 atm,sunDir;uniform float aK;varying vec3 vNV,vN;void main(){float i=pow(clamp(.86-abs(dot(vNV,vec3(0.,0.,1.))),0.,1.),3.2);float l=dot(vN,sunDir),day=smoothstep(-.18,.35,l);
 vec3 c=mix(vec3(1.,.5,.25),atm*1.2,smoothstep(-.12,.15,l))*day;gl_FragColor=vec4(c*i*1.6*aK,1.);}`;
function vxAtmo(P,U,Ra){return new THREE.Mesh(new THREE.SphereGeometry(Ra,64,32),new THREE.ShaderMaterial({uniforms:{atm:U.atm,sunDir:U.sunDir,aK:{value:1}},vertexShader:VX_AVS,fragmentShader:VX_AFS,side:THREE.BackSide,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false}))}
// couche de nuages qui tourne (vue de l'espace, traversée à l'atterrissage, plafond vu du sol)
const VX_CVS=`varying vec3 vO,vW;void main(){vO=position;vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
const VX_CFS=`uniform sampler2D tx;uniform vec3 sunDir,pc,cCol;uniform float tm,cov,cA;varying vec3 vO,vW;
vec4 tri(vec3 p,vec3 w){return texture2D(tx,p.yz)*w.x+texture2D(tx,p.xz)*w.y+texture2D(tx,p.xy)*w.z;}
void main(){vec3 d=normalize(vO),bw=pow(abs(d),vec3(4.));bw/=dot(bw,vec3(1.));
 float n=tri(d*1.7+vec3(tm*.0035,0.,tm*.0021),bw).g*.55+tri(d*5.3-vec3(0.,tm*.005,tm*.003),bw).r*.3+tri(d*15.+vec3(tm*.01),bw).r*.15;
 float a=smoothstep(cov,cov+.16,n);if(a<.01)discard;
 vec3 upW=normalize(vW-pc);float l=dot(upW,sunDir),day=smoothstep(-.22,.2,l);
 vec3 c=cCol*(.05+.9*day*(.55+.45*max(l,0.)))+vec3(1.,.42,.18)*smoothstep(.3,0.,abs(l))*.35*day;c*=.8+.4*smoothstep(cov,cov+.4,n);
 float cd=length(vW-cameraPosition);a*=smoothstep(8.,90.,cd);gl_FragColor=vec4(c,a*cA);}`;
function vxClouds(P,U,Rc){const cl=P.cl;if(!cl)return null;const m=new THREE.Mesh(new THREE.SphereGeometry(Rc,96,48),new THREE.ShaderMaterial({uniforms:{tx:U.tx,sunDir:U.sunDir,pc:U.pc,tm:U.tm,cCol:{value:new THREE.Color(cl.c[0],cl.c[1],cl.c[2])},cov:{value:cl.v},cA:{value:cl.a}},
 vertexShader:VX_CVS,fragmentShader:VX_CFS,transparent:true,depthWrite:false,side:THREE.DoubleSide}));m.renderOrder=2;return m}
// anneau de poussière et de glace (ombre de la planète)
const VX_RFS=`uniform sampler2D tx;uniform vec3 sunDir,pc,rCol;uniform float R,Ri,Ro;varying vec3 vO,vW;
void main(){float rr=length(vO),k=(rr-Ri)/(Ro-Ri);vec4 t=texture2D(tx,vec2(k*1.9,.37)),u=texture2D(tx,vec2(k*7.3,.71));
 float a=smoothstep(.3,.62,t.g)*(.45+.55*u.r)*smoothstep(0.,.08,k)*smoothstep(1.,.85,k);vec3 o=vW-pc;float b=dot(o,sunDir),sh=1.;if(b<0.){float d2=dot(o,o)-b*b;sh=smoothstep(R*R*.92,R*R*1.06,d2);}
 gl_FragColor=vec4(rCol*(.75+.5*u.g)*(.06+.94*sh),a*.8);}`;
function vxRing(P,U){const Ri=P.R*1.45,Ro=P.R*2.35,m=new THREE.Mesh(new THREE.RingGeometry(Ri,Ro,160,1),new THREE.ShaderMaterial({uniforms:{tx:U.tx,sunDir:U.sunDir,pc:U.pc,rCol:{value:new THREE.Color(...(P.ringC||[.8,.75,.68]))},R:{value:P.R},Ri:{value:Ri},Ro:{value:Ro}},
 vertexShader:VX_CVS,fragmentShader:VX_RFS,transparent:true,depthWrite:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2+(P.ringT||0);return m}
// dôme du ciel depuis la surface (étoiles et nébuleuse de l'espace à travers l'atmosphère)
const VX_KVS=`varying vec3 vD;void main(){vD=position;vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}`;
const VX_KFS=VX_SKY+`uniform vec3 sunDir,camUp,atm,sunCol;uniform float dip,dens,caveK,hasSpace;uniform sampler2D spaceTx;uniform mat3 skyRot;varying vec3 vD;
void main(){vec3 V=normalize(vD);vec3 c=vxSky(V,camUp,sunDir,atm,sunCol,dens,dip);
 vec3 d=skyRot*V;float th=acos(clamp(d.y,-1.,1.)),ph=atan(d.z,-d.x);vec2 uv=vec2(fract(ph/6.2831853),1.-th/3.1415927);
 vec3 sp=hasSpace>.5?texture2D(spaceTx,uv).rgb:vec3(0.);float lum=dot(c,vec3(.3,.5,.2));c+=sp*clamp(1.-lum*5.,0.,1.);
 float ts=dot(V,sunDir);c+=sunCol*(smoothstep(.99965,.9999,ts)*14.+pow(max(ts,0.),900.)*3.)*(1.-.6*dens*smoothstep(.1,-.1,dot(camUp,sunDir)));
 gl_FragColor=vec4(c,1.);}`;
function vxSkyDome(U){const m=new THREE.Mesh(new THREE.SphereGeometry(30000,48,24),new THREE.ShaderMaterial({uniforms:{sunDir:U.sunDir,camUp:U.camUp,atm:U.atm,sunCol:U.sunCol,dens:U.dens,dip:U.dip,caveK:U.caveK,
 hasSpace:{value:0},spaceTx:{value:null},skyRot:{value:new THREE.Matrix3()}},vertexShader:VX_KVS,fragmentShader:VX_KFS,side:THREE.BackSide,depthWrite:false,depthTest:false}));m.renderOrder=-20;m.frustumCulled=false;return m}

// ----- une planète : arbre d'octants (niveau de détail), morceaux de maillage, creusage -----
let VXPID=0;
function vxPlanet(P,o){o=o||{};const pid='vx'+(++VXPID),core=vxCore();core.setup(P);vxPoolPlanet(pid,P);
 const N=o.N||32,leaf=o.leaf||32;let W=leaf;while(W<2*(P.Rx+48))W*=2;
 const U=o.U||vxU(P);if(!U.vxFa)U.vxFa={value:1};const mat=vxTerrainMat(U),g=new THREE.Group();
 const faHook=function(){const f=this.userData.vxc.fv;if(f!==U.vxFa.value){U.vxFa.value=f;mat.uniformsNeedUpdate=true}};g.name='vox-'+pid;
 const emReq=()=>{const ew=o.ew||1024,eh=ew>>1;vxPoolJob(pid,{t:'e',w:ew,h:eh},D=>{if(!D)return;const t=new THREE.DataTexture(D,ew,eh,THREE.RGBAFormat);t.wrapS=THREE.RepeatWrapping;t.magFilter=t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;t.needsUpdate=true;U.em.value=t})};
 const V={pid,P,core,N,leaf,W,U,mat,g,ch:new Map(),want:new Map(),digs:[],K:o.K||.75,space:!!o.space,fg:!!o.fg,sLeaf:o.sLeaf||W/16,cam:new THREE.Vector3(1e9,0,0),under:0,tw:0,ready:false,tri:0,dirty:true,cav:o.cav!==false,maxCav:o.maxCav||2.01,pend:0};
 const dBox=(x,y,z,s,px,py,pz)=>{const dx=Math.max(x-px,0,px-x-s),dy=Math.max(y-py,0,py-y-s),dz=Math.max(z-pz,0,pz-z-s);return Math.sqrt(dx*dx+dy*dy+dz*dz)};
 const maxD=(x,y,z,s)=>{const ax=Math.max(Math.abs(x),Math.abs(x+s)),ay=Math.max(Math.abs(y),Math.abs(y+s)),az=Math.max(Math.abs(z),Math.abs(z+s));return Math.sqrt(ax*ax+ay*ay+az*az)};
 // ensemble des feuilles voulues autour de la caméra (coordonnées de la planète)
 function traverse(){const W2=W/2,c=V.cam,out=new Map(),deepOK=V.under>5;
  const rec=(d,ix,iy,iz)=>{const s=W/2**d,x=-W2+ix*s,y=-W2+iy*s,z=-W2+iz*s,bmin=dBox(x,y,z,s,0,0,0);if(bmin>P.Rx)return;const bmax=maxD(x,y,z,s),deep=bmax<P.Rn,cav=V.cav&&s/N<=V.maxCav;
   if(V.space){if(deep)return;const dc=dBox(x,y,z,s,c.x,c.y,c.z);if(s>W/4||s>V.sLeaf&&dc<V.K*s){for(let k=0;k<8;k++)rec(d+1,ix*2+(k&1),iy*2+(k>>1&1),iz*2+(k>>2&1));return}out.set(d+':'+ix+':'+iy+':'+iz,{d,ix,iy,iz,x,y,z,s,cav:false,pr:d*.6+dc/s*.4});return}
   const dc=dBox(x,y,z,s,c.x,c.y,c.z);
   if(deep&&!deepOK&&dc>110)return;
   // sous-arbre sans surface : distance au centre bien plus grande que le morceau (marge pour les pentes raides)
   {const hx=x+s/2,hy=y+s/2,hz=z+s/2,hd=s*.866;V.near(hx,hy,hz,hd*3+4);core.setCav(cav,core.dg);const f=core.sdf(hx,hy,hz);if(Math.abs(f)>hd*3+4)return;if(core.OUT.ds<-(hd*3+4)&&!deepOK&&dc>60)return}
   if(s>leaf&&dc<V.K*s){for(let k=0;k<8;k++)rec(d+1,ix*2+(k&1),iy*2+(k>>1&1),iz*2+(k>>2&1));return}
   out.set(d+':'+ix+':'+iy+':'+iz,{d,ix,iy,iz,x,y,z,s,cav,pr:d*.6+dc/s*.4})};
  rec(0,0,0,0);return out}
 function digsFor(c){const h=c.s/N,m=3*h,L=[];for(const q of V.digs){if(q[0]+q[3]<c.x-m||q[0]-q[3]>c.x+c.s+m||q[1]+q[3]<c.y-m||q[1]-q[3]>c.y+c.s+m||q[2]+q[3]<c.z-m||q[2]-q[3]>c.z+c.s+m)continue;L.push(q[0],q[1],q[2],q[3])}return L.length?new Float32Array(L):null}
 function request(c){c.ver=(c.ver||0)+1;const ver=c.ver;c.req=1;V.pend++;
  vxPoolJob(pid,{x:c.x,y:c.y,z:c.z,s:c.s,N,cav:c.cav,dg:c.cav?digsFor(c):null},r=>{V.pend--;if(V.dead||V.ch.get(c.k)!==c||c.ver!==ver)return;c.req=0;
   // construction différée : quelques maillages par image seulement (évite les à-coups)
   c.res=r;c.rv=ver;if(c.st===0)c.st=1;V.bq.push(c);pump()})}
 function build(c){const r=c.res;c.res=null;if(V.dead||V.ch.get(c.k)!==c||c.ver!==c.rv)return;c.st=2;const re=!!c.mesh;c.fa=re?1:Math.min(c.fa||0,0);c.fv=c.fa;
   if(c.mesh){V.g.remove(c.mesh);c.mesh.geometry.dispose();V.tri-=c.nt||0;c.mesh=null}c.nt=0;
   if(r){const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(r.pos,3));G.setAttribute('nrm',new THREE.BufferAttribute(r.nor,4,true));
    G.setAttribute('dp',new THREE.BufferAttribute(r.dep,1));G.setAttribute('mt',new THREE.BufferAttribute(r.mat,4,true));G.setAttribute('orw',new THREE.BufferAttribute(r.orw,4,true));G.setIndex(new THREE.BufferAttribute(r.idx,1));
    G.boundingSphere=new THREE.Sphere(new THREE.Vector3(c.x+c.s/2,c.y+c.s/2,c.z+c.s/2),c.s*.87+3*c.s/N);G.boundingBox=new THREE.Box3(new THREE.Vector3(c.x,c.y,c.z).subScalar(2*c.s/N),new THREE.Vector3(c.x+c.s,c.y+c.s,c.z+c.s).addScalar(2*c.s/N));
    const m=new THREE.Mesh(G,mat);m.matrixAutoUpdate=false;m.visible=false;m.userData.vxc=c;m.onBeforeRender=faHook;c.mesh=m;c.nt=r.nt;V.tri+=r.nt;V.g.add(m)}
   V.dirty=true}
 // priorité : la scène au premier plan (planète où l'on est, astéroïde proche) passe avant les maillages vus de loin
 function pump(){if(V.dead)return;if(!V.fg){const nw=performance.now();for(const e of VXW.fg.values())if(e[0]>0&&nw-e[1]<1500)return}let free=vxPoolFree();const L=[];for(const[k,w]of V.want){const c=V.ch.get(k);if(c&&c.st===0&&!c.req)L.push(c)}
  let i=0;if(L.length&&free>0){L.sort((a,b)=>a.pr-b.pr);for(;i<L.length&&free>0;i++,free--)request(L[i])}if(V.fg)VXW.fg.set(pid,[L.length-i,V.ut||0])}
 function drop(c){if(c.mesh){V.g.remove(c.mesh);c.mesh.geometry.dispose();V.tri-=c.nt||0;c.mesh=null}c.ver=(c.ver||0)+1;if(c.req){c.req=0}V.ch.delete(c.k)}
 const inside=(a,b)=>b.x>=a.x-1e-3&&b.y>=a.y-1e-3&&b.z>=a.z-1e-3&&b.x+b.s<=a.x+a.s+1e-3&&b.y+b.s<=a.y+a.s+1e-3&&b.z+b.s<=a.z+a.s+1e-3;
 // affichage : un morceau qui n'est plus voulu reste visible tant que ses remplaçants ne sont pas prêts (pas de trous pendant les transitions)
 function display(){let ready=true;const sub=new Map();
  let fad=false;for(const[k,w]of V.want){const c=V.ch.get(k),rd=!!c&&c.st===2,fa=rd?(c.fa==null?1:c.fa):0;if(!rd)ready=false;else if(fa<1)fad=true;
   // pour chaque ancêtre : tous ses descendants voulus sont-ils prêts ? (et où en est leur fondu)
   for(let dd=w.d-1;dd>=0;dd--){const sh=w.d-dd,ak=dd+':'+(w.ix>>sh)+':'+(w.iy>>sh)+':'+(w.iz>>sh),e=sub.get(ak);if(e){if(!rd)e.ok=false;if(fa<e.mn)e.mn=fa}else sub.set(ak,{ok:rd,mn:fa})}}
  V.ready=ready;V.fading=fad;
  for(const c of[...V.ch.values()]){if(V.want.has(c.k)){if(c.mesh){c.mesh.visible=c.st===2;c.fv=c.fa==null?1:c.fa}continue}
   if(c.st!==2||!c.mesh){drop(c);continue}
   let rel=false,ok=true,mn=1;const e=sub.get(c.k);if(e){rel=true;ok=e.ok;mn=e.mn}
   else for(let dd=c.d-1;dd>=0;dd--){const sh=c.d-dd,ak=dd+':'+(c.ix>>sh)+':'+(c.iy>>sh)+':'+(c.iz>>sh);if(V.want.has(ak)){rel=true;const q=V.ch.get(ak);ok=!!q&&q.st===2;mn=ok?(q.fa==null?1:q.fa):0;break}}
   // remplaçants prêts : l'ancien morceau s'efface avec la trame complémentaire, puis disparaît
   if(!rel||ok&&mn>=1)drop(c);else{c.mesh.visible=true;c.fv=ok?-Math.max(.001,mn):1}}}
 V.bq=[];
 V.update=function(camLocal,dt){V.ut=performance.now();if(!V.emq){V.emq=1;emReq()}
  if(V.bq.length){const t0=performance.now(),bud=VXW.bud||2.5;let n=0;while(V.bq.length&&(n<1||performance.now()-t0<bud)){build(V.bq.shift());n++}}V.tw-=dt||0;const moved=camLocal.distanceTo(V.cam)>(V.space?W/40:leaf*.22);
  if(moved||V.tw<=0||V.dirty&&!V.want.size){if(!V.space){V.cam.copy(camLocal);const f=core.sdf(camLocal.x,camLocal.y,camLocal.z);V.under=-core.OUT.ds}
   else V.cam.copy(camLocal);if(moved||(V.tw<=0&&!V.space)||!V.want.size){V.want=traverse();V.tw=.6;V.dirty=true}}
  for(const[k,w]of V.want){let c=V.ch.get(k);if(!c){c={k,...w,st:0,mesh:null};V.ch.set(k,c)}}
  // envois : les morceaux les plus grossiers puis les plus proches d'abord
  pump();
  if(V.fading){const k=(dt||.016)/.45;for(const c of V.ch.values())if(c.st===2&&c.fa<1&&V.want.has(c.k))c.fa=Math.min(1,c.fa+k);V.dirty=true}
  if(V.dirty){V.dirty=false;display()}vxPoolTick()};
 V.dig=function(x,y,z,r){V.digs.push([x,y,z,r]);for(const c of V.ch.values()){if(!c.cav||c.st==0)continue;const m=r+3*c.s/N;
   if(x+m<c.x||x-m>c.x+c.s||y+m<c.y||y-m>c.y+c.s||z+m<c.z||z-m>c.z+c.s)continue;request(c)}};
 // distance signée exacte pour la physique (avec les trous creusés autour du point)
 V.near=function(x,y,z,rad){const L=[];for(const q of V.digs){const dx=x-q[0],dy=y-q[1],dz=z-q[2],m=rad+q[3];if(dx*dx+dy*dy+dz*dz<m*m)L.push(q[0],q[1],q[2],q[3])}core.dg=L.length?new Float32Array(L):null;core.setCav(V.cav,core.dg)};
 V.f=(x,y,z)=>core.sdf(x,y,z);
 V.dispose=function(){V.dead=true;VXW.fg.delete(pid);for(const c of[...V.ch.values()])drop(c);mat.dispose()};
 return V}
