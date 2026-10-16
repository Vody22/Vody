// ===== PERSONNAGES VIVANTS : EXPRESSIONS, GESTES, GESTES DE MÉTIER, PILOTE AU REPOS (chars5.js, après chars4.js) =====
// hmMood(m,'joie'|'colere'|'triste'|'surpris'|'fatigue'|'peur'|null,durée) : sourcils (deux pivots u.brows), paupières, coins de la bouche, tête, épaules.
// hmGest(m,clé,durée) : geste ponctuel (salut, montrer, hausser, oui, non, rire, applaudir, joie, etirer, montre, reflechir) ou en boucle (bras, hanches, dos : durée Infinity, hmGest(m,null) pour arrêter).
// hmWork(m,clé|null) : geste de métier en boucle (essuyer, tablette, boire, cle, caisse) avec l'accessoire dans la main.
// Les bras sont posés par quaternions (torsion autour du bras → avant/arrière → écart sur le côté) et mélangés avec la pose d'animHuman.
const H5E={joie:{br:.0025,bt:.15,lo:.06,sm:1,op:.12,hp:.05},colere:{br:-.0022,bt:-1,lo:-.12,sm:-.45,op:0,hp:-.07},triste:{br:.001,bt:1,lo:-.22,sm:-.85,op:0,hp:-.2,sl:1},
surpris:{br:.0055,bt:.2,lo:.32,sm:0,op:.9,hp:.06},fatigue:{br:-.001,bt:.3,lo:-.48,sm:-.2,op:0,hp:-.12,sl:.6},peur:{br:.0045,bt:.9,lo:.28,sm:-.45,op:.35,hp:-.04}};
const H5K=['br','bt','lo','sm','op','hp','sl'];
const H5Q=new THREE.Quaternion(),H5Q2=new THREE.Quaternion(),H5X=new V3(1,0,0),H5Y=new V3(0,1,0),H5Z=new V3(0,0,1);
// pose d'un bras : [avant, écart, torsion, coude] (écart > 0 = vers l'extérieur, torsion > 0 = avant-bras vers l'intérieur)
function h5Arm(A,s,p,w){if(!p||w<=0)return;const[fw,ab,tw,el]=p;H5Q.setFromAxisAngle(H5Z,s*ab);H5Q2.setFromAxisAngle(H5X,fw);H5Q.multiply(H5Q2);H5Q2.setFromAxisAngle(H5Y,s*tw);H5Q.multiply(H5Q2);
 A.sh.quaternion.slerp(H5Q,w);A.el.rotation.x=lerp(A.el.rotation.x,el,w)}
const h5S=(a,b,f)=>a+(b-a)*f,h5Env=(tau,d)=>Math.min(1,tau/.3)*(d==Infinity?1:Math.min(1,Math.max(0,(d-tau)/.35)));
// gestes : fonction(τ) → {r: bras droit, l: bras gauche, hx/hy/hz: tête, cx: buste, cl: épaules, md: humeur}
const H5G={
salut:{d:2.4,f:T=>({r:[1.5,1.35,-1.57,1.55+.38*Math.sin(T*9)],hz:-.08,md:'joie'})},
montrer:{d:2.2,f:T=>({r:[1.42,.12,0,.06],hy:.1})},
hausser:{d:1.6,f:T=>{const k=Math.sin(Math.min(1,T/1.3)*Math.PI);return{r:[.2,.3,-.9,1.25],l:[.2,.3,-.9,1.25],cl:.2*k,hz:.12*k,md:'peur'}}},
oui:{d:1.4,f:T=>({hx:-.13*Math.max(0,Math.sin(T*9))})},
non:{d:1.5,f:T=>({hy:.3*Math.sin(T*10)*Math.max(0,1-T/1.5)})},
rire:{d:2.4,f:T=>({hx:.18+.05*Math.sin(T*16),cx:.06+.03*Math.sin(T*16),r:[.3,.05,.9,1.5],md:'joie',op:.7})},
applaudir:{d:2.4,f:T=>{const c=.14*Math.sin(T*15);return{r:[.6,.06,.95+c,1.35],l:[.6,.06,.95+c,1.35],md:'joie'}}},
joie:{d:2,f:T=>{const k=.12*Math.sin(T*7);return{r:[.25,2.6+k,0,.35],l:[.25,2.6-k,0,.35],hx:.12,md:'joie',op:.8}}},
etirer:{d:3.2,f:T=>({r:[.15,2.9,.4,.25],l:[.15,2.9,.4,.25],cx:.16*Math.sin(Math.min(1,T/2.8)*Math.PI),hx:.2,md:'fatigue',op:.5*Math.max(0,Math.sin(T*2))})},
montre:{d:2.6,f:T=>({l:[.62,.05,1.15,1.65],hx:-.42,hy:-.3})},
reflechir:{d:3.4,f:T=>({r:[.4,-.02,.5,2.45],l:[.42,-.05,1.05,1.75],hx:-.06,hz:.1,md:'fatigue'})},
bras:{d:Infinity,f:T=>({r:[.42,-.05,1.05,1.75],l:[.5,-.05,1.0,1.8]})},
hanches:{d:Infinity,f:T=>({r:[-.12,.72,1.5,1.7],l:[-.12,.72,1.5,1.7]})},
dos:{d:Infinity,f:T=>({r:[-.62,.1,1.62,1.35],l:[-.6,.1,1.62,1.35]})}};
// gestes de métier (en boucle) + accessoire tenu
const H5W={
essuyer:{p:'rag',h:1,f:T=>({r:[.72+.12*Math.sin(T*4.5),.14+.1*Math.cos(T*4.5),.3,.8],l:[.5,.05,.2,.55],hx:-.3,cx:-.1})},
tablette:{p:'tab',h:-1,y:1.2,z:-.27,rx:.75,f:T=>({l:[.36,.04,.38,1.42],r:[.42,.0,.6,1.5+.07*Math.max(0,Math.sin(T*11))],hx:-.45})},
boire:{p:'cup',h:1,f:T=>{const c=T%7,k=c<1.8?Math.sin(c/1.8*Math.PI):0;return{r:[.28+.3*k,.05,.35-.15*k,1.35+1.15*k],hx:.16*k}}},
cle:{p:'wr',h:1,f:T=>({r:[1.0,.1,.25+.38*Math.sin(T*5.5),.7],l:[.92,.1,.2,.45],cx:-.22,hx:-.25})},
caisse:{p:'box',h:-1,y:1.2,z:-.3,f:T=>({r:[.55,.12,.85,1.3],l:[.55,.12,.85,1.3]})}};
const H5P={};
function h5Prop(k){if(H5P[k])return H5P[k].clone();let g;const M=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.5,metalness:.1},o));
if(k=='rag'){g=new THREE.Mesh(RB3(.11,.02,.08),M(0xd8d0c0,{roughness:.95}));g.position.set(0,-.085,-.02)}
else if(k=='tab'){g=new THREE.Group();const b=new THREE.Mesh(RB3(.15,.008,.21),M(0x1a1e24,{metalness:.5}));g.add(b);const sc=new THREE.Mesh(new THREE.PlaneGeometry(.135,.19),new THREE.MeshBasicMaterial({map:h5ScreenT()}));sc.rotation.x=-Math.PI/2;sc.position.y=.0045;g.add(sc);}
else if(k=='cup'){g=new THREE.Group();const c=new THREE.Mesh(new THREE.CylinderGeometry(.03,.025,.085,14),M(0xeeeae2,{roughness:.35}));g.add(c);const co=new THREE.Mesh(new THREE.CircleGeometry(.027,14),M(0x3a2010,{roughness:.2}));co.rotation.x=-Math.PI/2;co.position.y=.04;g.add(co);g.position.set(0,-.09,-.035)}
else if(k=='wr'){g=new THREE.Group();const MT=M(0xa8b0b8,{metalness:.85,roughness:.3});const h=new THREE.Mesh(RB3(.022,.2,.012),MT);g.add(h);const j=new THREE.Mesh(new THREE.TorusGeometry(.024,.008,6,12,Math.PI*1.5),MT);j.position.y=-.11;g.add(j);g.position.set(0,-.08,-.03);g.rotation.x=1.5}
else if(k=='box'){g=new THREE.Mesh(RB3(.42,.3,.32),M(0x8a6a3a,{roughness:.8,map:hm3FabT(true).map}));}
g.traverse(o=>{if(o.isMesh)o.castShadow=DESK});H5P[k]=g;return g.clone()}
function h5ScreenT(){if(H5P._st)return H5P._st;const c=mkC(64,96),x=c.getContext('2d');x.fillStyle='#0b2236';x.fillRect(0,0,64,96);x.fillStyle='#3fd0ff';for(let i=0;i<7;i++)x.fillRect(6,8+i*11,20+((i*37)%30),4);x.fillStyle='#ffc34d';x.fillRect(6,82,30,6);return H5P._st=new THREE.CanvasTexture(c)}
// ----- API -----
function hmMood(m,k,dur){const u=m&&m.userData;if(!u)return;k=k&&H5E[k]?k:null;if(dur){u.md5=k;u.md5E=t+dur}else{u.md5B=k;if(!u.md5E)u.md5=k}}
function hmGest(m,k,dur){const u=m&&m.userData;if(!u||!u.rig)return;if(!k){u.g5E=Math.min(u.g5E||0,t);return}const G=H5G[k];if(!G)return;
 if(u.g5k&&u.g5w>.05&&u.g5k!==k){u.g5n=[k,dur];u.g5E=Math.min(u.g5E,t);return}u.g5k=k;u.g5S=t;u.g5E=t+(dur||G.d)}
function hmWork(m,k){const u=m&&m.userData;if(!u||!u.rig)return;if(u.w5k===k)return;u.w5k=k&&H5W[k]?k:null;u.w5S=t;
 if(u.w5p){u.w5p.parent&&u.w5p.parent.remove(u.w5p);u.w5p=null}const W=u.w5k&&H5W[u.w5k];if(W&&W.p){const pr=h5Prop(W.p);(W.h<0?u.chest:u.arms[W.h].hd).add(pr);u.w5p=pr;
  if(W.h<0){const w=u.BW.get(u.chest);pr.position.set(0,W.y-w.y,W.z+(u.fem?.01:0)-w.z);pr.rotation.x=W.rx||0}}}
function hmBusy(m){const u=m&&m.userData;return !!(u&&(u.g5k&&t<u.g5E||u.w5k))}
// ----- application après animHuman -----
{const _ah=animHuman;animHuman=function(m,ph,spd,air,aim,talk,look){_ah.apply(this,arguments);const u=m.userData;if(!u||!u.rig)return;try{h5Apply(m,u,spd||0,air,aim)}catch(e){if(!H5P._err){H5P._err=1;console.warn(e)}}}}
function h5Apply(m,u,spd,air,aim){u.v5=air||aim?9:spd;const dt=clamp(t-(u.h5T==null?t-.016:u.h5T),0,.1);u.h5T=t;const ex=r=>1-Math.exp(-dt*r);
 // geste en cours
 let G=null,gw=0,gt=0;if(u.g5k){const D=H5G[u.g5k],act=t<u.g5E;u.g5w=(u.g5w||0)+((act?1:0)-(u.g5w||0))*ex(act?10:7);
  if(!act&&u.g5w<.02){u.g5k=null;u.g5w=0;if(u.g5n){const n=u.g5n;u.g5n=null;hmGest(m,n[0],n[1])}}else{gt=t-u.g5S;G=D.f(gt);gw=u.g5w*(D.d==Infinity?1:h5Env(gt,D.d+.4))}}
 let W=null,ww=0;u.w5w=(u.w5w||0)+((u.w5k?1:0)-(u.w5w||0))*ex(5);if(u.w5k&&u.w5w>.01){W=H5W[u.w5k].f(t-u.w5S);ww=u.w5w}
 const mv=clamp(spd/1.2,0,1),still=(1-mv)*(air?0:1)*(aim?0:1),carry=u.w5k=='caisse';
 if(W){const k=ww*(carry?1:still);h5Arm(u.arms[1],1,W.r,k);h5Arm(u.arms[0],-1,W.l,k);if(W.hx)u.head.rotation.x+=W.hx*k;if(W.cx)u.chest.rotation.x+=W.cx*k}
 if(u.w5p)u.w5p.visible=ww>.3;
 if(G){const k=gw*(1-mv*.7)*(aim?0:1);h5Arm(u.arms[1],1,G.r,k);h5Arm(u.arms[0],-1,G.l,k);
  if(G.hx)u.head.rotation.x+=G.hx*k;if(G.hy)u.head.rotation.y+=G.hy*k;if(G.hz)u.head.rotation.z+=G.hz*k;if(G.cx)u.chest.rotation.x+=G.cx*k;
  if(G.cl)for(let i=0;i<2;i++)u.clav[i].rotation.z+=(i?1:-1)*G.cl*k}
 // humeur : geste > humeur imposée ; elle s'efface à la fin de sa durée
 if(u.md5E&&t>u.md5E){u.md5=u.md5B||null;u.md5E=0}const mk=G&&G.md&&gw>.3?G.md:u.md5,E=mk?H5E[mk]:null;if(!u.e5){u.e5={};for(const q of H5K)u.e5[q]=0}
 for(const q of H5K){const tg=E&&E[q]||0;u.e5[q]+=(tg-u.e5[q])*ex(5)}const e=u.e5;
 if(u.brows&&u.brows.length==2)for(let i=0;i<2;i++){const b=u.brows[i],sd=i?1:-1;b.position.y=b.userData.y0+e.br;b.rotation.z=sd*e.bt*.32}
 if(u.lids)for(const l of u.lids)l.rotation.x=Math.min(.98,l.rotation.x+e.lo*(l.rotation.x>0?1:.3));
 if(u.lip){if(!u.mc5){u.mc5=[];for(const sd of[-1,1]){const c=new THREE.Mesh(hm3Sh('h5mc',()=>new THREE.SphereGeometry(1,8,6)),u.lip.material);c.scale.set(.0042,.0026,.0035);c.userData.x0=sd*.0158;c.userData.y0=u.lip.userData.y0+.0018;c.userData.z0=u.lip.position.z+.0028;u.lip.parent.add(c);u.mc5.push(c)}const sl=new THREE.Mesh(hm3Sh('h5sl',()=>new THREE.TorusGeometry(.03,.0013,4,24,1.5).rotateZ(-Math.PI/2-.75).translate(0,.03,0)),hm3M('h5sl',()=>new THREE.MeshStandardMaterial({color:0x4a2a24,roughness:.8,side:THREE.DoubleSide})));sl.userData.y0=(u.lip.userData.y0+u.mou.position.y)/2+.0012;sl.position.set(0,sl.userData.y0,u.mou.position.z-.0045);sl.visible=false;u.lip.parent.add(sl);u.sl5=sl}
  const op=Math.max(e.op,G&&G.op?G.op*gw:0);u.lip.position.y-=op*.0065;u.mou.scale.y+=op*.0068;u.lip.scale.x=.0164*(1+.12*Math.max(0,e.sm));
  for(let i=0;i<2;i++){const c=u.mc5[i],sd=i?1:-1;c.position.set(c.userData.x0+sd*.0022*Math.max(0,e.sm),c.userData.y0+e.sm*.005-op*.003,c.userData.z0)}const sl=u.sl5,sa=Math.abs(e.sm);sl.visible=sa>.08&&op<.5;if(sl.visible){sl.scale.set(1,Math.sign(e.sm)*(.35+.65*sa),1);sl.position.y=sl.userData.y0-(e.sm<0?.006*sa:.0032)}}
 u.head.rotation.x+=e.hp;if(e.sl){u.chest.rotation.x-=e.sl*.1;u.neck.rotation.x+=e.sl*.03;for(let i=0;i<2;i++)u.clav[i].rotation.z-=(i?1:-1)*e.sl*.07}}
// ----- le pilote est plus vivant : gestes au repos (à pied, dans le hangar, dans l'intérieur du vaisseau) -----
const H5I={still:0,next:7,lp:null};
function h5Idle(m,spd,dt){if(!m||!m.userData||!m.userData.rig)return;const u=m.userData;if(spd>.25||hmBusy(m)){H5I.still=0;if(spd>.25&&u.g5k&&H5G[u.g5k].d==Infinity)hmGest(m,null);return}
 H5I.still+=dt;if(H5I.still<H5I.next)return;H5I.still=0;H5I.next=8+Math.random()*9;
 const L=['montre','etirer','reflechir','bras','hanches','non'],k=L[Math.random()*L.length|0];hmGest(m,k,H5G[k].d==Infinity?5+Math.random()*4:undefined)}
{let lt=performance.now();TICK.push(()=>{const n=performance.now(),dt=Math.min(.2,(n-lt)/1000);lt=n;try{
 if(typeof FOOT!='undefined'&&FOOT.on&&FOOT.model&&mode=='surf')h5Idle(FOOT.model,FOOT.model.userData.v5||0,dt);
 else if(typeof WK3!='undefined'&&WK3.on&&WK3.m)h5Idle(WK3.m,WK3.m.userData.v5||0,dt);
 else if(typeof SI!='undefined'&&SI.on&&SI.m)h5Idle(SI.m,SI.m.userData.v5||0,dt)}catch(e){}})}
