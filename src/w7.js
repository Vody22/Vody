// ===== MONDE VIVANT (w7.js) : vaisseaux PNJ qui vivent leur vie (cargos, mineurs, navettes, courriers, patrouilles),
// économie qui réagit aux livraisons et aux pillages, pirates qui attaquent les PNJ (sauvetage récompensé), radio et bulles. État W7.
const W7={L:[],t:2,raidT:70,raid:null,simT:45,stK:'',stL:[],proto:{},sayT:-99,id:0};
const W7J={cargo:{n:'Cargo',col:'#ffd36b',sp:95,r:30,hp:220},miner:{n:'Mineur',col:'#ffb060',sp:120,r:16,hp:120},shuttle:{n:'Navette',col:'#9fe8ff',sp:150,r:16,hp:100},courier:{n:'Courrier',col:'#c8a0ff',sp:230,r:14,hp:80},patrol:{n:'Patrouille de l\'Alliance',col:'#7fb0ff',sp:170,r:16,hp:180}};
const W7NM=['Belle-Étoile','Vagabond','Orion II','Persévérance','Albatros','Petite Ourse','Cormoran','Marie-Galante','Fortune','Sirocco','Hirondelle','Grand Nord','Lune Rousse','Mistral','Pélican','Aurore','Caravelle','Vieux Loup','Tramontane','Comète Bleue','Saint-Malo','Kerguelen','Bonne Mine','Tortue','Pénélope'];
const W7CO=['Transports Kessler','Coop. Minière d\'Orion','Lignes Céleste','Fret Vasquez','Navettes Express','Compagnie des Anneaux','Messageries Stellaires'];
const W7SAY={cargo:['Salut pilote ! On livre {q} t de {g} à {d}.','Convoi {co}, tout est calme par ici.','Encore {km} km et on touche notre prime !','Pas de pirates en vue ? Tant mieux…'],
miner:['Ce caillou est plein de {g} !','Attention aux éclats, je fore.','Bonne journée : la soute est presque pleine.','On rentre vendre le {g} à {d}.'],
shuttle:['Navette {co}, passagers à bord. Bon vol !','Mes passagers te font coucou !','Prochain arrêt : {d}.'],
courier:['Courrier urgent, je ne m\'arrête pas !','Livraison express pour {d} !','Pas le temps de discuter, pilote !'],
patrol:['Patrouille de l\'Alliance. Secteur sous contrôle.','Signale-nous toute activité pirate, pilote.','Respecte les couloirs d\'amarrage.']};
const W7CUT=['Hé ! Regarde où tu vas !','T\'as appris à piloter où ?!','Trop près, trop près !','Doucement, chauffard !'];
const _w7a=new V3(),_w7b=new V3(),_w7c=new V3();
const w7Pick=a=>a[Math.random()*a.length|0];
// ----- stations connues autour du joueur (±3 cellules) -----
function w7Sts(){const cx=cof(S.pos.x),cy=cof(S.pos.y),cz=cof(S.pos.z),k=cx+','+cy+','+cz;if(k===W7.stK)return W7.stL;W7.stK=k;const L=[];
for(let i=-3;i<=3;i++)for(let j=-1;j<=1;j++)for(let l=-3;l<=3;l++){const y=cy+j;if(Math.abs(y)>1)continue;const c=cdata(cx+i,y,cz+l);if(c.st)L.push(c.st)}return W7.stL=L}
const w7D=st=>Math.hypot(st.x-S.pos.x,st.y-S.pos.y,st.z-S.pos.z);
function w7Ax(st){return(st.x||st.z)?_w7c.set(-st.x,0,-st.z).normalize().clone():new V3(0,0,1)}
function w7Berth(st,sg,d){return w7Ax(st).multiplyScalar(sg*d).add(new V3(st.x,st.y,st.z))}
// ----- économie : livraisons (baisse) et pillages (pénurie), effet qui s'efface de moitié toutes les 15 min -----
const W7E=GX('w7e',{}),W7HL=15*60e3;
{const now=Date.now();for(const k in W7E)if(!Array.isArray(W7E[k])||now-W7E[k][1]>4*W7HL)delete W7E[k]}
function w7Eff(n,g){const e=W7E[n+'|'+g];return e?e[0]*Math.pow(.5,(Date.now()-e[1])/W7HL):0}
function w7Push(n,g,dv){const v=clamp(w7Eff(n,g)+dv,-.35,.45),k=n+'|'+g;if(Math.abs(v)<.01)delete W7E[k];else W7E[k]=[+v.toFixed(3),Date.now()]}
{const _gp=gPrice;gPrice=function(st,g){const p=_gp(st,g);if(!st||!g||!st.n)return p;const f=w7Eff(st.n,g.id);return f?Math.max(2,Math.round(p*(1+f))):p}}
const W7NEWS=GX('w7n',[]);
function w7News(ic,s){W7NEWS.unshift({t:Date.now(),ic,s});if(W7NEWS.length>12)W7NEWS.length=12}
const w7G=id=>GOODS.find(g=>g.id==id)||{n:id};
// la meilleure marchandise à transporter d'une station à l'autre (bon marché au départ, chère à l'arrivée)
function w7Good(a,b){const ea=ECON[a?stEcon(a):'Industrielle']||{},eb=ECON[b?stEcon(b):'Agricole']||{};let best='food',bv=-1;for(const g of GOODS){if(g.min&&Math.random()<.5)continue;const v=(eb[g.id]||1)/(ea[g.id]||1)+Math.random()*.25;if(v>bv){bv=v;best=g.id}}return best}
// ----- modèles (un prototype fusionné par métier, puis clones qui partagent géométries et matériaux) -----
function w7Proto(job){if(W7.proto[job])return W7.proto[job];let g;if(job=='cargo')g=mkFreighter();else{const C={miner:[0xe0c070,0x40a060],shuttle:[0xf2f2f2,0xffc34d],courier:[0x8a7aa8,0xc8a0ff],patrol:[0xe8eef6,0x2f6fff]}[job];g=buildAlly(C[0],C[1])}
try{pf3MergeChildren(job=='cargo'?g:g.userData.body,new Set())}catch(e){}g.userData={};return W7.proto[job]=g}
function w7Mesh(job){const m=w7Proto(job).clone(),body=job=='cargo'?m:m.children[0],fl=[];body.traverse(o=>{if(o.isSprite)fl.push(o)});m.userData={body,fl,w7:1};return m}
// ----- apparition -----
function w7Name(job){const nm=w7Pick(W7NM);return job=='patrol'?'Patrouille « '+nm+' »':W7J[job].n+' « '+nm+' »'}
function w7Make(job,pos,dir){const J=W7J[job],F=frSpawn({kind:'npc7',mesh:w7Mesh(job),p:pos,hp:J.hp,mhp:J.hp,r:J.r,dir:dir.clone().normalize()});F.mesh.lookAt(_w7a.copy(F.pos).sub(F.dir));
const N={id:++W7.id,job,F,name:w7Name(job),co:w7Pick(W7CO),sp:J.sp*(.85+Math.random()*.3),ph:'cruise',greet:0,cut:0,bub:null,t0:t};F.w7=N;F.onDie=()=>w7Died(N);W7.L.push(N);return N}
function w7Spawn(){const ctl=ai3Ctl(),sts=w7Sts(),near=sts.filter(s=>w7D(s)<6500);let r=Math.random(),job=r<.4?'cargo':r<.6?'miner':r<.78?'shuttle':r<.9?'courier':'patrol';
if(job=='patrol'&&ctl=='pirates')job='courier';
if(near.length){const st=w7Pick(near),sg=Math.random()<.5?1:-1,others=sts.filter(s=>s!==st);
 if(job=='patrol'){const p=new V3(st.x,st.y,st.z).add(new V3(rv(1),rv(.15),rv(1)).normalize().multiplyScalar(1400));const N=w7Make(job,p,new V3(rv(1),0,rv(1)));N.ph='patrol';N.anc=new V3(st.x,st.y,st.z);N.home=st;w7Warp(N);return}
 if(Math.random()<.5){// départ de la station
  const N=w7Make(job,w7Berth(st,sg,125),w7Ax(st).multiplyScalar(sg));N.from=st;N.sg=sg;N.ph='undock';N.out=w7Berth(st,sg,1100);
  if(job=='miner'){N.home=st;N.g=w7Pick(['fer','titane','cristal','fer']);N.q=10+Math.random()*16|0}
  else{const to=others.length&&Math.random()<.75?w7Pick(others):null;N.to=to;N.toN=to?to.n:'Secteur '+w7Pick(NA)+(1+Math.random()*9|0);N.g=w7Good(st,to);N.q=job=='cargo'?20+Math.random()*45|0:job=='courier'?2+Math.random()*6|0:0}
  return}
 // arrivée par saut près de la station
 const p=new V3(st.x,st.y,st.z).add(new V3(rv(1),rv(.2),rv(1)).normalize().multiplyScalar(2400+Math.random()*1200));const N=w7Make(job,p,_w7a.set(st.x,st.y,st.z).sub(p));N.to=st;N.toN=st.n;N.sg=sg;
 const fr=others.length?w7Pick(others):null;N.fromN=fr?fr.n:'Secteur '+w7Pick(NA)+(1+Math.random()*9|0);
 if(job=='miner'){N.g=w7Pick(['fer','titane','cristal']);N.q=12+Math.random()*16|0}else{N.g=w7Good(fr,st);N.q=job=='cargo'?20+Math.random()*45|0:job=='courier'?2+Math.random()*6|0:0}
 N.ph='cruise';N.goal=w7Berth(st,sg,1100);w7Warp(N);return}
// pas de station tout près : vaisseaux en transit (ou mineurs sur les astéroïdes)
const a=Math.random()*TAU,p=S.pos.clone().add(new V3(Math.cos(a),rv(.15),Math.sin(a)).multiplyScalar(2200+Math.random()*1300));
if(job=='patrol'&&ctl!='alliance')job='cargo';
const N=w7Make(job,p,new V3(rv(1),rv(.1),rv(1)));N.toN='Secteur '+w7Pick(NA)+(1+Math.random()*9|0);N.g=job=='miner'?w7Pick(['fer','titane','cristal']):w7Good(null,null);N.q=job=='cargo'?20+Math.random()*45|0:10+Math.random()*15|0;
if(job=='patrol'){N.ph='patrol';N.anc=S.pos.clone()}else{N.ph='cruise';N.goal=p.clone().addScaledVector(N.F.dir,5000);N.jump=1}w7Warp(N)}
function w7Warp(N){if(N.F.pos.distanceTo(S.pos)<5000)try{mm3Warp(N.F.pos.clone(),N.F.mesh.quaternion,200)}catch(e){}}
function w7Remove(N){if(N.gone)return;N.gone=1;if(N.F.beam)hideBeam(N.F.beam);if(!N.F.gone)frRemove(N.F);if(W7.raid&&W7.raid.N===N)w7RaidEnd(0)}
// ----- arrivées -----
function w7Docked(N){const st=N.to||N.home;if(st&&N.g&&N.q){const dv=-(.05+.1*Math.min(1,N.q/45));w7Push(st.n,N.g,dv);if(N.job=='cargo'||N.job=='miner'){w7News('📦',`${N.name} a livré ${N.q} t de ${w7G(N.g).n} à ${st.n} : prix ${Math.round(dv*100)} %`);if(S.docked===st)toast('📦 '+N.name+' vient de livrer '+N.q+' t de '+w7G(N.g).n+' ici')}}
N.ph='dockin';N.dk=0}
function w7Died(N){N.gone=1;if(N.F.beam)hideBeam(N.F.beam);const p=N.F.pos.clone();try{spawnDrops(p,3+(N.job=='cargo'?3:0))}catch(e){}
const dn=N.toN||(N.to&&N.to.n);if(N.g&&dn&&N.job!='patrol'){w7Push(dn,N.g,.12+Math.random()*.08);w7News('☠',`${N.name} a été détruit par des pirates : pénurie de ${w7G(N.g).n} à ${dn}`)}
if(p.distanceTo(S.pos)<6000)toast('📡 '+N.name+' a été détruit…');if(W7.raid&&W7.raid.N===N)w7RaidEnd(0)}
// ----- déplacement -----
function w7Steer(N,goal,spd,dt,turn){const F=N.F;_w7a.copy(goal).sub(F.pos);const d=_w7a.length();_w7a.divideScalar(d||1);_w7b.copy(F.dir);F.dir.lerp(_w7a,damp(turn||1.4,dt)).normalize();const v=Math.min(spd,Math.max(10,d*.7));F.vel.copy(F.dir).multiplyScalar(v);F.pos.addScaledVector(F.vel,dt);
const ds=F.pos.distanceTo(S.pos),R=F.r+16;if(ds<R&&ds>.01)F.pos.addScaledVector(_w7c.copy(F.pos).sub(S.pos).normalize(),(R-ds));
F.mesh.lookAt(_w7c.copy(F.pos).sub(F.dir));const u=F.mesh.userData,turnY=_w7c.crossVectors(_w7b,F.dir).y;N.bank=lerp(N.bank||0,clamp(turnY*50,-.8,.8),damp(3,dt));u.body.rotation.z=N.bank*(N.job=='cargo'?.3:1);
for(const sp of u.fl)sp.scale.setScalar((u.fb||4)*(1+Math.min(1.2,v/150))+Math.random()*.8);return d}
function w7Upd(N,dt){const F=N.F,raid=W7.raid&&W7.raid.N===N,sp=N.sp*(raid?.45:1);
if(N.ph=='undock'){if(w7Steer(N,N.out,Math.min(sp,40+(t-N.t0)*12),dt,2.2)<90){if(N.job=='miner')w7MinerGo(N);else{N.ph='cruise';const to=N.to;if(to&&w7D(to)<7000&&Math.hypot(to.x-F.pos.x,to.z-F.pos.z)<9000){N.goal=w7Berth(to,Math.random()<.5?1:-1,1100);N.sg=N.goal.clone().sub(new V3(to.x,to.y,to.z)).dot(w7Ax(to))>0?1:-1}else{N.jump=1;N.goal=F.pos.clone().addScaledVector(F.dir,1500).add(new V3(rv(300),rv(80),rv(300)))}}}}
else if(N.ph=='cruise'){const d=w7Steer(N,N.goal,sp,dt);if(d<90){if(N.jump){N.ph='jumpc';N.jt=0}else if(N.to){N.ph='approach';N.goal=w7Berth(N.to,N.sg,125)}else{N.jump=1;N.goal=F.pos.clone().addScaledVector(F.dir,600)}}}
else if(N.ph=='approach'){if(w7Steer(N,N.goal,Math.min(sp,55),dt,2.4)<25)w7Docked(N)}
else if(N.ph=='dockin'){N.dk+=dt;F.pos.addScaledVector(F.dir,12*dt);F.mesh.scale.setScalar(Math.max(.05,1-N.dk/1.2)*(F.mesh.userData.s0||1));if(N.dk>1.2)w7Remove(N)}
else if(N.ph=='jumpc'){N.jt+=dt;F.pos.addScaledVector(F.dir,(sp*.4+N.jt*N.jt*400)*dt);for(const s of F.mesh.userData.fl)s.scale.setScalar((F.mesh.userData.fb||4)*(1.5+N.jt*3));if(N.jt>1.6){w7Warp(N);w7Remove(N)}}
else if(N.ph=='tomine'){const A=N.ast;if(!A||A.gone||!asts.includes(A)){w7MinerHome(N);return}const d=w7Steer(N,_w7b.copy(A.pos).addScaledVector(_w7c.copy(F.pos).sub(A.pos).normalize(),A.r+55),sp,dt,2);if(d<30){N.ph='mine';N.mt=25+Math.random()*30}}
else if(N.ph=='mine'){const A=N.ast;if(!A||A.gone||!asts.includes(A)){w7MinerHome(N);return}N.mt-=dt;F.dir.lerp(_w7a.copy(A.pos).sub(F.pos).normalize(),damp(2,dt)).normalize();F.mesh.lookAt(_w7c.copy(F.pos).sub(F.dir));
 if(F.pos.distanceTo(S.pos)<3000){if(!F.beam)F.beam=mkBeam(0xffd060);placeBeam(F.beam,F.pos,_w7b.copy(A.pos).addScaledVector(_w7c.copy(F.pos).sub(A.pos).normalize(),A.r*.9),.3,true);if(Math.random()<dt*6){const q=_w7b;SPK.emit(q.x,q.y,q.z,rv(30),rv(30),rv(30),.3,1,.75,.3,.5)}}else if(F.beam)hideBeam(F.beam);
 if(N.mt<=0){if(F.beam)hideBeam(F.beam);w7MinerHome(N)}}
else if(N.ph=='patrol'){N.pa=(N.pa||Math.random()*TAU)+dt*sp*.6/1400;const A=N.anc;w7Steer(N,_w7b.set(A.x+Math.cos(N.pa)*1400,A.y+Math.sin(N.pa*.7)*120,A.z+Math.sin(N.pa)*1400),sp*.7,dt)}}
function w7MinerGo(N){const st=N.home;let best=null,bd=3200;for(const a of asts){if(a.gone||a.r<10)continue;const d=a.pos.distanceTo(st?_w7a.set(st.x,st.y,st.z):N.F.pos);if(d<bd&&d>500){bd=d;best=a}}if(!best){w7MinerHome(N);return}N.ast=best;N.ph='tomine'}
function w7MinerHome(N){const F=N.F;if(F.beam)hideBeam(F.beam);const st=N.home||w7Sts().filter(s=>s.mesh).sort((a,b)=>w7D(a)-w7D(b))[0];if(st&&Math.hypot(st.x-F.pos.x,st.y-F.pos.y,st.z-F.pos.z)<8000){N.to=st;N.toN=st.n;N.sg=Math.random()<.5?1:-1;N.goal=w7Berth(st,N.sg,1100);N.ph='cruise';N.jump=0}else{N.ph='cruise';N.jump=1;N.goal=F.pos.clone().addScaledVector(F.dir,900)}}
// ----- pirates qui attaquent un PNJ -----
function w7RaidStart(z){const V=W7.L.filter(N=>!N.gone&&N.job!='patrol'&&/cruise|undock|mine|tomine/.test(N.ph)&&N.F.pos.distanceTo(S.pos)>450&&N.F.pos.distanceTo(S.pos)<3600);if(!V.length)return;const N=w7Pick(V),zz=Math.max(1,z),n=z>=2?3:2,grp=++AI3.gid,R={N,es:[],pk:0,t:0,z:zz};
for(let i=0;i<n;i++){const p=N.F.pos.clone().add(new V3(rv(1),rv(.3),rv(1)).normalize().multiplyScalar(420+Math.random()*200));const e=mkEnemy(i==0&&z>=2?'chasseur':'pirate',p,zz);en.push(e);ai3Init(e,'raid7',grp);e.ai3.lab0='Pirates à l\'abordage';e.label=e.ai3.lab0;e.lc='#ff6a4a';e.persist=0;e.w7r=R;e.w7cd=1+Math.random()*1.5;R.es.push(e)}
const dps=R.es.reduce((a,e)=>a+(e.dmg||6)/1.35,0);N.F.mhp=N.F.hp=Math.round(dps*28);N.F.regen=0;W7.raid=R;w7Bub(N,'Mayday ! Des pirates nous attaquent !',5);toast('📡 '+N.name+' : « Mayday ! Des pirates nous attaquent ! » (signal SOS)');try{SFX.alarm()}catch(e){}}
function w7RaidEnd(ok){const R=W7.raid;if(!R)return;W7.raid=null;for(const e of R.es)if(!e.dead&&e.ai3&&e.ai3.st=='raid7'){e.ai3.st='patrol';e.ai3.lab0=undefined;e.ai3.anc.copy(e.pos);ai3Label(e)}
const N=R.N;if(ok&&!N.gone){N.F.hp=N.F.mhp;const cr=Math.round((250+150*R.z+(N.job=='cargo'?200:0))/10)*10;if(R.pk>0){G.cr+=cr;gainXP(60+20*R.z);try{addRep('alliance',5)}catch(e){}w7Bub(N,'Merci pilote, on te doit une fière chandelle !',5);banner('ship','Équipage sauvé',N.name+' : « Merci pilote ! » · +'+cr.toLocaleString('fr-FR')+' ¢','#7fffb0');w7News('🛡',`Un pilote a sauvé ${N.name} des pirates`);G.x.w7sv=(G.x.w7sv||0)+1;save()}else{w7Bub(N,'Ouf… ils sont partis.',4)}}}
function w7Raid(dt,z){const R=W7.raid;if(!R)return;R.t+=dt;const N=R.N;if(N.gone){W7.raid=null;return}const al=R.es.filter(e=>!e.dead);if(!al.length||R.t>15&&al.every(e=>e.ai3&&e.ai3.st=='patrol')){w7RaidEnd(1);return}
if(R.t>110&&R.pk==0){w7RaidEnd(0);return}
for(const e of al){const A=e.ai3;if(!A||A.st!='raid7')continue;A.anc.copy(N.F.pos);const d=e.pos.distanceTo(N.F.pos);if(d>600)e.pos.addScaledVector(_w7a.copy(N.F.pos).sub(e.pos).normalize(),e.sp*.5*dt);
 e.w7cd-=dt;if(e.w7cd<=0&&d<850){e.w7cd=1.1+Math.random()*.6;const dir=_w7a.copy(N.F.pos).addScaledVector(N.F.vel,d/e.bs*.8).sub(e.pos).normalize().add(_w7b.set(rv(.03),rv(.03),rv(.03))).normalize();const m=mkEB(e.bc);m.position.copy(e.pos);EB.push({m,v:dir.clone().multiplyScalar(e.bs),l:2.4,dmg:e.dmg||6,toF:1});if(e.pos.distanceTo(S.pos)<900)try{SFX.eshoot()}catch(_){}}}
if(N.F.hp<N.F.mhp*.5&&!N.half){N.half=1;w7Bub(N,'Coque à 50 % ! Vite, pilote !',4)}}
{const _he=hitEnemy;hitEnemy=function(e,d,p){const was=e&&e.dead;_he(e,d,p);if(e&&!was&&e.dead&&e.w7r)e.w7r.pk++}}
// ----- bulles de radio -----
function w7Bub(N,txt,dur){N.bub={txt,t:t+(dur||4)}}
function w7Say(N,lines){const st=N.to||N.home;const km=st?(Math.hypot(st.x-N.F.pos.x,st.z-N.F.pos.z)/1000).toFixed(1):'?';const L=w7Pick(lines).replace('{g}',w7G(N.g||'fer').n.toLowerCase()).replace('{q}',N.q||20).replace('{d}',N.toN||(st&&st.n)||'la station').replace('{co}',N.co).replace('{km}',km);w7Bub(N,L,4.5);W7.sayT=t;try{tone(1200,900,.06,'sine',.02);setTimeout(()=>tone(900,1200,.06,'sine',.02),90)}catch(e){}}
function w7Talk(N){if(N.gone||W7.raid&&W7.raid.N===N)return;const d=N.F.pos.distanceTo(S.pos);
if(!N.greet&&d<360&&t-W7.sayT>5){N.greet=1;let L=N.sayL||W7SAY[N.job];if(N.job=='patrol'&&G.x.law&&G.x.law.b>0)L=['On a ton signalement… on te garde à l\'œil.'];w7Say(N,L)}
if(d<N.F.r+45&&t-N.cut>8){const rel=_w7a.copy(S.vel).sub(N.F.vel).length();if(rel>70){N.cut=t;w7Bub(N,w7Pick(W7CUT),3);try{tone(500,300,.15,'square',.02)}catch(e){}}}}
// ----- boucle (simulation spatiale) -----
STICK.push(dt=>{if(mode!='space'||S.dead||(typeof GZ!='undefined'&&GZ.on))return;const z=danger();
for(const N of W7.L){if(N.gone)continue;if(N.F.gone){N.gone=1;continue}const d=N.F.pos.distanceTo(S.pos);if(d>9500){w7Remove(N);continue}w7Upd(N,dt);N.F.mesh.visible=d<6000;w7Talk(N)}
W7.L=W7.L.filter(N=>!N.gone);
W7.t-=dt;if(W7.t<=0){const tg=(DESK?17:12)*(w7Sts().some(s=>w7D(s)<6500)?1:.6),n=W7.L.length;W7.t=n<tg/2?.9:2.5+Math.random()*4;if(n<tg&&!S.docked||n<tg/2)w7Spawn()}
w7Raid(dt,z);if(!W7.raid){W7.raidT-=dt;if(W7.raidT<=0){const c=ai3Ctl();W7.raidT=(130+Math.random()*120)*(c=='alliance'?1.6:c=='pirates'?.7:1);if(!S.docked&&!(typeof RC!='undefined'&&RC.on)&&!(z==0&&Math.random()<.7))w7RaidStart(z)}}
// la vie continue ailleurs : livraisons et pillages hors de vue
W7.simT-=dt;if(W7.simT<=0){W7.simT=60+Math.random()*50;const sts=w7Sts();if(sts.length){const st=w7Pick(sts),ok=Math.random()<.75,g=w7Pick(GOODS.filter(x=>!x.min||Math.random()<.4)).id;if(ok){const q=20+Math.random()*40|0,dv=-(.06+.08*Math.random());w7Push(st.n,g,dv);w7News('📦',`Le cargo « ${w7Pick(W7NM)} » a livré ${q} t de ${w7G(g).n} à ${st.n} : prix ${Math.round(dv*100)} %`)}else{const dv=.1+.1*Math.random();w7Push(st.n,g,dv);w7News('☠',`Un convoi pour ${st.n} a été pillé : pénurie de ${w7G(g).n} (+${Math.round(dv*100)} %)`)}}}});
// quand on quitte l'espace, les PNJ disparaissent (ils réapparaîtront au retour)
TICK.push(()=>{if(mode!='space'&&W7.L.length){for(const N of W7.L)w7Remove(N);W7.L=[]}});
// ----- étiquettes, bulles et SOS à l'écran -----
{const _ov=overlay;overlay=function(){_ov();if(mode!='space'||S.dead||S.docked||(typeof SI!='undefined'&&SI.on))return;try{
const LB=[],RN=W7.raid&&W7.raid.N;for(const N of W7.L){if(N.gone)continue;const s=proj(N.F.pos);if(!s.front||s.d>1700||s.x<0||s.x>innerWidth||s.y<40||s.y>innerHeight)continue;LB.push([N,s])}
LB.sort((a,b)=>((b[0]===RN)-(a[0]===RN))||((b[0].bub&&t<b[0].bub.t)-(a[0].bub&&t<a[0].bub.t))||a[1].d-b[1].d);
// étiquettes sans chevauchement : la plus proche d'abord, les suivantes se décalent ou se taisent
const occ=[],hit=(x0,y0,x1,y1)=>occ.some(r=>x0<r[2]&&x1>r[0]&&y0<r[3]&&y1>r[1]);let nL=0;
for(const[N,s]of LB){if(nL>=(DESK?9:6)&&N!==RN)break;const J=W7J[N.job],a=clamp(1.3-s.d/1700,.25,1),y0=s.y-Math.min(46,10+900/Math.max(60,s.d)),full=s.d<900;
 const st=N.toN||(N.to&&N.to.n);let info='';if(full)info=N.inf?N.inf:N.job=='patrol'?'Alliance · sécurité':N.ph=='mine'?'Minage · '+w7G(N.g).n:N.ph=='undock'?'Départ de '+(N.from?N.from.n:'la station'):N.ph=='approach'||N.ph=='dockin'?'Amarrage à '+(st||''):N.q&&N.g?(N.q+' t de '+w7G(N.g).n+(st?' → '+st:'')):(st?'→ '+st:N.co);
 OX.font="700 11px 'Chakra Petch',system-ui";let w=OX.measureText(N.name).width;if(info){OX.font="600 9.5px 'Chakra Petch',system-ui";w=Math.max(w,OX.measureText(info).width)}const hh=info?28:15;
 let y=null;for(const dy of[0,-30,30,-60]){const yy=y0+dy;if(!hit(s.x-w/2-4,yy-12,s.x+w/2+4,yy-12+hh)){y=yy;break}}if(y===null&&N!==RN)continue;if(y===null)y=y0;
 occ.push([s.x-w/2-4,y-12,s.x+w/2+4,y-12+hh]);nL++;OX.globalAlpha=a;OX.textAlign='center';
 if(y!==y0){OX.strokeStyle=J.col;OX.globalAlpha=a*.4;OX.lineWidth=1;OX.beginPath();OX.moveTo(s.x,s.y-4);OX.lineTo(s.x,y+(y<y0?hh-10:-12));OX.stroke();OX.globalAlpha=a}
 OX.font="700 11px 'Chakra Petch',system-ui";OX.fillStyle=J.col;OX.fillText(N.name,s.x,y);
 if(info){OX.font="600 9.5px 'Chakra Petch',system-ui";OX.fillStyle='rgba(205,230,255,.85)';OX.fillText(info,s.x,y+12)}
 if(N.bub&&t<N.bub.t){OX.globalAlpha=1;OX.font="600 11px 'Chakra Petch',system-ui";const bw=Math.min(260,OX.measureText(N.bub.txt).width+16),by=y-30;occ.push([s.x-bw/2,by-14,s.x+bw/2,by+8]);OX.fillStyle='rgba(6,16,28,.88)';OX.fillRect(s.x-bw/2,by-14,bw,22);OX.fillStyle=J.col;OX.fillRect(s.x-bw/2,by-14,2,22);OX.fillStyle='#eaf6ff';OX.fillText(N.bub.txt.length>40&&bw>=260?N.bub.txt.slice(0,38)+'…':N.bub.txt,s.x,by+1)}
 if(N===RN){OX.globalAlpha=1;const k=N.F.hp/N.F.mhp,by=y+(info?17:5);OX.fillStyle='rgba(0,0,0,.6)';OX.fillRect(s.x-24,by,48,4);OX.fillStyle=k>.5?'#7dffb0':k>.25?'#ffc34d':'#ff5a4a';OX.fillRect(s.x-24,by,48*k,4)}}
OX.globalAlpha=1;if(W7.raid&&!W7.raid.N.gone)edgeMarker(W7.raid.N.F.pos,'#ff5a4a','SOS · '+W7.raid.N.name,'🆘')}catch(e){OX.globalAlpha=1}}}
// ----- service de station : trafic et nouvelles -----
svcAdd({o:11,ic:'ship',t:'Trafic et nouvelles du secteur',show:st=>!st.ground,html:st=>{let h='';const eff=GOODS.map(g=>[g,w7Eff(st.n,g.id)]).filter(x=>Math.abs(x[1])>=.03).sort((a,b)=>a[1]-b[1]);
h+='<div class="hint">Les cargos qui livrent font baisser les prix ; les convois pillés provoquent des pénuries. L\'effet s\'efface en une demi-heure environ.</div>';
if(eff.length)h+=eff.map(([g,f])=>`<div class="srow"><span>${g.ic||''} ${esc(g.n)}</span><b style="color:${f<0?'#7dffb0':'#ff8a6a'}">${f<0?'':'+'}${Math.round(f*100)} %</b></div>`).join('');else h+='<div class="hint">Prix habituels dans cette station.</div>';
const inc=W7.L.filter(N=>!N.gone&&N.to===st&&N.job!='patrol');if(inc.length)h+='<b class="pt">En approche</b>'+inc.map(N=>`<div class="srow"><span>${esc(N.name)}</span><small>${N.q&&N.g?N.q+' t de '+esc(w7G(N.g).n):esc(N.co)}</small></div>`).join('');
if(W7NEWS.length)h+='<b class="pt">Nouvelles</b>'+W7NEWS.slice(0,8).map(n=>{const m=Math.max(1,Math.round((Date.now()-n.t)/60e3));return`<div class="srow"><span>${n.ic} ${esc(n.s)}</span><small>${m<60?'il y a '+m+' min':'il y a '+Math.round(m/60)+' h'}</small></div>`}).join('');
return h}});
