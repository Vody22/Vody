// ===== ASTÉROÏDES GÉANTS EN VOXELS (vxast.js, après voxp.js) — état VA =====
// Mêmes outils que les planètes voxel (vox.js) : un astéroïde géant (70–170 m) par cellule choisie au hasard (fixe), maillage voxel
// avec niveau de détail, galeries assez larges pour le vaisseau, certains creux (grande cavité au centre) et percés de tunnels.
// Les tirs (canon, laser, laser de minage, missiles) creusent la roche là où ils touchent : une cible « virtuelle » est placée
// à chaque image sur le point de la surface visé par le nez du vaisseau (ajoutée à spaceTargets), et les tirs du canon qui
// entrent dans la roche creusent aussi. Le minerai touché tombe en butin (spawnDrops). Collisions du vaisseau avec la roche.
// Trous enregistrés dans G.x.vad[id] (600 max).
const VA={on:new Map(),t:0,cells:new Map()};
const _vaA=new V3(),_vaB=new V3(),_vaN=new V3();
function vaCell(cx,cy,cz){const k=cx+','+cy+','+cz;if(VA.cells.has(k))return VA.cells.get(k);let o=null;
 if(Math.abs(cy)<=1&&(cx||cy||cz)&&h3(cx,cy,cz,4711)<.24){const c=cdata(cx,cy,cz);if(!c.sun){const R=Math.round(70+h3(cx,cy,cz,4712)*100),ox=cx*CS,oy=cy*CS,oz=cz*CS;
  for(let i=0;i<12;i++){const x=ox+400+h3(cx,cy,cz,4720+i)*(CS-800),y=oy+CS/2+(h3(cx,cy,cz,4740+i)-.5)*1400,z=oz+400+h3(cx,cy,cz,4760+i)*(CS-800);
   if(c.pl&&Math.hypot(x-c.pl.x,y-c.pl.y,z-c.pl.z)<c.pl.r*1.6+900)continue;if(c.st&&Math.hypot(x-c.st.x,y-c.st.y,z-c.st.z)<1800)continue;
   o={id:'va'+k,x,y,z,R,seed:(seedOf(cx,cy,cz,4799)>>>0)||5,name:'Astéroïde '+['Kepler','Hadès','Ymir','Orcus','Talos','Nyx','Brontès','Pallas'][(h3(cx,cy,cz,4801)*8)|0]+'-'+((h3(cx,cy,cz,4802)*90+10)|0)};break}}}
 VA.cells.set(k,o);return o}
function vaLoad(o){const P=vxPreset('Astéroïde',o.seed,o.R,null),U=vxU(P);U.space.value=1;const V=vxPlanet(P,{N:DESK?32:20,leaf:32,K:DESK?.75:.5,U,ew:64,fg:true});
 V.g.position.set(o.x,o.y,o.z);scene.add(V.g);const lt=lightFor(o.x,o.y,o.z);U.sunDir.value.copy(lt.dir);U.sunCol.value.copy(lt.col).multiplyScalar(lt.s?1.05:.92);U.pc.value.set(o.x,o.y,o.z);
 const dg=GX('vad',{})[o.id];if(Array.isArray(dg))for(let i=0;i+3<dg.length;i+=4)V.digs.push([dg[i],dg[i+1],dg[i+2],dg[i+3]]);
 const T={va:o,pos:new V3(o.x,o.y,o.z),r:4,max:1000,cone:.2,w:1.4,isAst:1,gone:1,label:o.name};T.hit=(d,p)=>vaHit(A,d,p);
 const A={o,P,U,V,T,pos:new V3(o.x,o.y,o.z),seen:0};VA.on.set(o.id,A);return A}
function vaFree(A){vaSave(A);A.V.dispose();scene.remove(A.V.g);VA.on.delete(A.o.id)}
function vaSave(A){const D=GX('vad',{}),a=[];for(const q of A.V.digs.slice(-600))a.push(q[0],q[1],q[2],q[3]);if(a.length)D[A.o.id]=a;A.dirty=0}
function vaF(A,x,y,z,rad){A.V.near(x,y,z,rad||3);return A.V.f(x,y,z)}
// creuser à un point (coordonnées du monde) : un trou, des éclats, et le minerai touché en butin
function vaDig(A,p,r,dir){const l=_vaA.copy(p).sub(A.pos);if(dir)l.addScaledVector(dir,r*.35);const core=A.V.core;let got=null,n=0;
 for(const[a,b,c]of[[0,0,0],[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){const x=l.x+a*r*.5,y=l.y+b*r*.5,z=l.z+c*r*.5;if(vaF(A,x,y,z,r+1)>=0)continue;const o=core.ore(x,y,z,-core.OUT.ds);if(o&&Math.random()<.5){got=VXORE[o-1];n++}}
 A.V.dig(Math.round(l.x*10)/10,Math.round(l.y*10)/10,Math.round(l.z*10)/10,r);A.dirty=1;
 if(n)spawnDrops(p,Math.min(3,n),got);boom3(p,6,n?MINC[got]:0x8a7a68,30);if(!VA.toldM&&n){VA.toldM=1;toast('⛏ Ce filon contient du minerai — ramasse les éclats qui flottent')}}
function vaHit(A,d,p){vaDig(A,p,clamp(1.3+d*.22,1.3,3.4),_vaB.copy(p).sub(S.pos).normalize());SFX.mineTick&&SFX.mineTick()}
// streaming, cible virtuelle, collisions
STICK.push(dt=>{VA.t-=dt;if(VA.t<=0){VA.t=.5;const cx=cof(S.pos.x),cy=cof(S.pos.y),cz=cof(S.pos.z);
  for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(let l=-1;l<=1;l++){const o=vaCell(cx+i,cy+j,cz+l);if(!o||VA.on.has(o.id))continue;if(Math.hypot(o.x-S.pos.x,o.y-S.pos.y,o.z-S.pos.z)<3200)vaLoad(o)}
  for(const A of[...VA.on.values()])if(A.pos.distanceTo(S.pos)>4200)vaFree(A)}
 const cp=camera.position;fwd();
 for(const A of VA.on.values()){const V=A.V,U=A.U;V.update(_vaA.copy(cp).sub(A.pos),dt);U.tm.value=t;
  const d=A.pos.distanceTo(S.pos);if(!A.seen&&d<A.P.Rx+600){A.seen=1;if(!GX('vas',{})[A.o.id]){G.x.vas[A.o.id]=1;banner&&banner('🪨 '+A.o.name+(A.P.hol?' — astéroïde creux, galeries à explorer':' — astéroïde géant')+' : tes tirs creusent la roche, le minerai s\'en détache')}}
  // lampe du vaisseau dans les galeries
  const inside=d<A.P.Rx;U.lampK.value=inside?1:0;U.lampPos.value.copy(S.pos).addScaledVector(_f,5);U.lampDir.value.copy(_f);
  // cible virtuelle : point de la roche visé par le nez
  const T=A.T,o=_vaB.copy(S.pos).sub(A.pos);let tt=0,hit=false;if(d<A.P.Rx+1000){for(let i=0;i<70&&tt<1000;i++){const x=o.x+_f.x*tt,y=o.y+_f.y*tt,z=o.z+_f.z*tt,f=vaF(A,x,y,z,2);if(f<.4){hit=true;break}tt+=Math.max(.6,f*.9)}}
  if(hit){T.pos.copy(S.pos).addScaledVector(_f,tt);T.gone=0}else{T.gone=1;T.pos.copy(A.pos).addScaledVector(_f,-1e6)}
  // collisions
  if(d<A.P.Rx+12&&!S.dead){const r=3.4*Math.max(1,(ship.userData.body&&ship.userData.body.scale.z)||1),l=_vaA.copy(S.pos).sub(A.pos);for(let it=0;it<2;it++){const f=vaF(A,l.x,l.y,l.z,r+6);if(f>r+.5)break;
   const g=A.V.core.grad(l.x,l.y,l.z,f,.3),n=_vaN.set(A.V.core.GN[0],A.V.core.GN[1],A.V.core.GN[2]),dd=f/Math.max(1,g);if(dd>=r)break;l.addScaledVector(n,r-dd);S.pos.copy(l).add(A.pos);
   const vn=S.vel.dot(n);if(vn<0){if(vn<-55&&it==0){damage(Math.min(30,(-vn-55)*.35),'col');boom3(S.pos,10,0x9a8a78,40);shake=Math.min(1.2,shake+.5)}S.vel.addScaledVector(n,-vn*1.2);S.spd=Math.min(S.spd,S.vel.length())}}}
  if(A.dirty&&(A.st=(A.st||20)-dt)<=0){A.st=20;vaSave(A)}}});
{const _st=spaceTargets;spaceTargets=function(){const L=_st();for(const A of VA.on.values())if(!A.T.gone)L.push(A.T);return L}}
// les tirs du canon qui entrent dans la roche creusent (avant le test des cibles)
{const _up=updPB;updPB=function(dt,T){if(mode=='space'&&VA.on.size)for(const b of PB){if(b.l<=0)continue;for(const A of VA.on.values()){const l=_vaA.copy(b.p).sub(A.pos);if(l.length()>A.P.Rx+40)continue;
  const sp=b.v.length()||1,st=sp*dt,ux=b.v.x/sp,uy=b.v.y/sp,uz=b.v.z/sp;let hit=null;for(let s=0;s<=st+1.5;s+=1.5){const x=l.x+ux*s,y=l.y+uy*s,z=l.z+uz*s;if(vaF(A,x,y,z,2)<0){hit=_vaB.set(x,y,z).add(A.pos);break}}
  if(hit){b.l=0;impactFX(hit,b.c);vaDig(A,hit,clamp(1.2+(b.d||1)*.25,1.2,3),_vaN.copy(b.v).normalize());break}}}_up(dt,T)}}
// étiquette dans l'espace
{const _ov=overlay;overlay=function(){_ov();if(mode!='space'||S.dead)return;for(const A of VA.on.values()){const d=A.pos.distanceTo(S.pos);if(d>A.P.Rx+120&&d<4000)label({x:A.pos.x,y:A.pos.y+A.P.Rx+30,z:A.pos.z},A.o.name,'rgba(220,200,170,.85)',4000)}}}
TICK.push(()=>{if(mode!='space'&&VA.on.size)for(const A of[...VA.on.values()])vaFree(A)});
