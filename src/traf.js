// ===== TRAFIC SPATIAL (traf.js, après saga.js) — état W10 =====
// Plus de PNJ dans l'espace (w7.js) : convois escortés, escadrilles en formation, remorqueurs autour des stations,
// navettes qui décollent des planètes / s'y posent, touristes en orbite, courses de pilotes, et au loin des couloirs
// de trafic (points lumineux qui circulent entre les stations voisines). Nouvelles phases ajoutées par l'enveloppe de w7Upd.
const W10={lane:null,lp:[],lk:'',lt:0};
const _t10a=new V3(),_t10b=new V3(),_t10c=new V3(),_t10u=new V3(0,1,0);
const W10SAY={escort:['Escorte en position, le convoi est sous protection.','On garde un œil sur le cargo.','Pas d\'imprudence près du convoi, pilote.'],
 tug:['Remorqueur au travail, dégage le couloir !','Encore un conteneur à ranger…','Station en vue, on manœuvre.'],
 tour:['Regardez cette vue ! Les passagers adorent.','Visite guidée de {p}, deuxième tour.','Souriez pour la photo !'],
 lift:['Décollage réussi, cap sur l\'orbite !','On quitte {p}, tout le monde est attaché ?','Atmosphère traversée, ça secoue !'],
 land:['Descente vers {p}, train sorti.','Approche de la surface, on se pose.','Rentrée atmosphérique dans 30 secondes.'],
 race:['3… 2… 1… Partez !','Tu veux faire la course, pilote ?','Personne ne me rattrape !','Dernier virage, plein gaz !'],
 squad:['Escadrille en formation, exercice en cours.','Formation serrée, on garde l\'alignement !','Exercice de patrouille, tout va bien.']};
const w10P=a=>a[Math.random()*a.length|0];
function w10N(job,pos,dir,nm,inf,say){const N=w7Make(job,pos,dir);if(nm)N.name=nm;N.inf=inf;N.sayL=say;return N}
const w10Pl=()=>{let b=null,bd=1e18;for(const p of planets){if(p.ring&&!p.r)continue;const d=Math.hypot(p.x-S.pos.x,p.y-S.pos.y,p.z-S.pos.z)-p.r;if(d<bd){bd=d;b=p}}return bd<5500?b:null};
// ----- apparitions spéciales -----
function w10Convoy(){const sts=w7Sts(),near=sts.filter(s=>w7D(s)<6500);let L;const lab='Convoi « '+w10P(W7NM)+' »';
 if(near.length){const st=w10P(near),p=new V3(st.x,st.y,st.z).add(new V3(rv(1),rv(.2),rv(1)).normalize().multiplyScalar(2600+Math.random()*1000));L=w7Make('cargo',p,_t10a.set(st.x,st.y,st.z).sub(p));L.to=st;L.toN=st.n;L.sg=Math.random()<.5?1:-1;const o=sts.filter(s=>s!==st);L.fromN=o.length?w10P(o).n:'Secteur lointain';L.g=w7Good(null,st);L.q=40+Math.random()*30|0;L.ph='cruise';L.goal=w7Berth(st,L.sg,1100)}
 else{const a=Math.random()*TAU,p=S.pos.clone().add(new V3(Math.cos(a),rv(.1),Math.sin(a)).multiplyScalar(2600)),dir=S.pos.clone().sub(p).add(new V3(rv(900),0,rv(900))).normalize();L=w7Make('cargo',p,dir);L.toN='Secteur '+w10P(NA)+(1+Math.random()*9|0);L.g=w7Good(null,null);L.q=40+Math.random()*30|0;L.ph='cruise';L.jump=1;L.goal=p.clone().addScaledVector(dir,6000)}
 L.name=lab;L.sp*=.85;const n=Math.random()<.5?2:3;for(let i=0;i<n;i++){const off=[[-70,15,30],[70,15,30],[0,40,-80]][i],E=w10N('patrol',L.F.pos.clone().add(new V3(off[0],off[1],off[2])),L.F.dir,'Escorte « '+w10P(W7NM)+' »','Escorte · '+lab,W10SAY.escort);E.ph='esc10';E.lead=L;E.off=off}
 w7Warp(L);return true}
function w10Squad(){if(ai3Ctl()=='pirates')return false;const a=Math.random()*TAU,p=S.pos.clone().add(new V3(Math.cos(a),rv(.2),Math.sin(a)).multiplyScalar(1800+Math.random()*900));
 const L=w10N('patrol',p,new V3(rv(1),0,rv(1)),'Escadrille « '+w10P(W7NM)+' »','Alliance · exercice en formation',W10SAY.squad);L.ph='sq10';L.anc=p.clone();L.sp*=1.15;L.t10=50+Math.random()*50;
 for(let i=0;i<3;i++){const off=[[-45,0,40],[45,0,40],[0,-10,85]][i],E=w10N('patrol',p.clone().add(new V3(off[0],off[1],off[2])),L.F.dir,'Ailier « '+w10P(W7NM)+' »','Escadrille · formation en V',W10SAY.squad);E.ph='esc10';E.lead=L;E.off=off}w7Warp(L);return true}
function w10Tugs(){const near=w7Sts().filter(s=>w7D(s)<5000&&s.mesh);if(!near.length)return false;const st=w10P(near);if(W7.L.filter(N=>N.ph=='tug10'&&N.home===st).length>=4)return false;
 for(let i=0;i<2;i++){const R=260+Math.random()*260,a=Math.random()*TAU,p=new V3(st.x+Math.cos(a)*R,st.y+rv(80),st.z+Math.sin(a)*R),N=w10N('shuttle',p,new V3(-Math.sin(a),0,Math.cos(a)),'Remorqueur « '+w10P(W7NM)+' »','Service de '+st.n,W10SAY.tug);
  N.ph='tug10';N.home=st;N.R=R;N.pa=a;N.dy=rv(90);N.sp=60+Math.random()*30;N.t10=60+Math.random()*80;N.to=st;N.toN=st.n;N.sg=Math.random()<.5?1:-1}return true}
function w10Planet(){const P=w10Pl();if(!P)return false;const pc=new V3(P.x,P.y,P.z),r=Math.random();const toMe=S.pos.clone().sub(pc).normalize();
 const rdir=toMe.clone().add(new V3(rv(.8),rv(.5),rv(.8))).normalize();
 if(r<.4){// touristes en orbite
  const R=P.r*1.3+250+Math.random()*300,N=w10N('shuttle',pc.clone().addScaledVector(rdir,R),new V3(rv(1),0,rv(1)),'Croisière « '+w10P(W7NM)+' »','Tourisme · orbite de '+P.name,W10SAY.tour.map(s=>s.replace('{p}',P.name)));
  N.ph='orb10';N.pl=P;N.R=R;N.ax=new V3(rv(.4),1,rv(.4)).normalize();N.v0=rdir.clone();N.pa=0;N.sp=70+Math.random()*30;N.t10=70+Math.random()*60;return true}
 if(r<.72){// décollage
  const N=w10N(Math.random()<.5?'shuttle':'cargo',pc.clone().addScaledVector(rdir,P.r*1.01),rdir,null,'Décollage de '+P.name,W10SAY.lift.map(s=>s.replace('{p}',P.name)));N.ph='lift10';N.pl=P;N.up=rdir;N.v10=8;N.toN='Orbite';N.g=w7Good(null,null);N.q=10+Math.random()*30|0;return true}
 // atterrissage
 const N=w10N('shuttle',pc.clone().addScaledVector(rdir,P.r*1.8+500),rdir.clone().negate(),null,'Atterrissage sur '+P.name,W10SAY.land.map(s=>s.replace('{p}',P.name)));N.ph='land10';N.pl=P;N.up=rdir;N.toN=P.name;w7Warp(N);return true}
function w10Race(){if(W7.L.some(N=>N.ph=='race10'))return false;fwd();const c=S.pos.clone().addScaledVector(_f,900+Math.random()*600).add(new V3(rv(500),rv(150),rv(500))),wp=[];for(let i=0;i<6;i++)wp.push(c.clone().add(new V3(rv(1),rv(.25),rv(1)).normalize().multiplyScalar(500+Math.random()*900)));
 const nm=['Éclair','Foudre'];for(let i=0;i<2;i++){const N=w10N('courier',c.clone().add(new V3(i*40-20,0,0)),wp[0].clone().sub(c),'Coureur « '+nm[i]+' »','Course de pilotes · '+(i?'2e':'1er'),W10SAY.race);N.ph='race10';N.wp=wp;N.wi=0;N.sp=300+i*25+Math.random()*30}w7Warp(W7.L[W7.L.length-1]);return true}
{const _sp=w7Spawn;w7Spawn=function(){const r=Math.random();try{if(r<.2&&w10Convoy())return;if(r<.34&&w10Planet())return;if(r<.44&&w10Tugs())return;if(r<.5&&w10Race())return;if(r<.57&&w10Squad())return}catch(e){console.warn(e)}_sp()}}
// ----- nouvelles phases -----
function w10Form(N,dt){const L=N.lead;if(!L||L.gone||L.ph=='dockin'||L.ph=='approach'){N.ph='cruise';N.jump=1;N.lead=null;N.goal=N.F.pos.clone().addScaledVector(N.F.dir,1400).add(new V3(rv(300),rv(60),rv(300)));return}
 if(L.ph=='jumpc'){N.ph='jumpc';N.jt=-Math.random()*.4;return}const f=L.F.dir,rt=_t10a.crossVectors(f,_t10u).normalize(),up=_t10b.crossVectors(rt,f).normalize();
 const g=_t10c.copy(L.F.pos).addScaledVector(rt,N.off[0]).addScaledVector(up,N.off[1]).addScaledVector(f,-N.off[2]).addScaledVector(L.F.vel,1);w7Steer(N,g,Math.max(60,L.F.vel.length()*1.6),dt,3)}
{const _u=w7Upd;w7Upd=function(N,dt){const F=N.F;
 if(N.ph=='esc10'){w10Form(N,dt);return}
 if(N.ph=='sq10'){N.t10-=dt;N.pa=(N.pa||0)+dt*.35;const A=N.anc;w7Steer(N,_t10a.set(A.x+Math.cos(N.pa)*900,A.y+Math.sin(N.pa*2)*160,A.z+Math.sin(N.pa)*900),N.sp*.75,dt,1.6);if(N.t10<=0){N.ph='cruise';N.jump=1;N.goal=F.pos.clone().addScaledVector(F.dir,900)}return}
 if(N.ph=='tug10'){const st=N.home;N.t10-=dt;N.pa+=dt*N.sp/N.R;w7Steer(N,_t10a.set(st.x+Math.cos(N.pa)*N.R,st.y+N.dy+Math.sin(N.pa*3)*20,st.z+Math.sin(N.pa)*N.R),N.sp,dt,2.2);if(N.t10<=0){N.ph='approach';N.goal=w7Berth(st,N.sg,125)}return}
 if(N.ph=='orb10'){const P=N.pl;N.t10-=dt;N.pa+=dt*N.sp/N.R;const v=_t10a.copy(N.v0).applyAxisAngle(N.ax,N.pa).multiplyScalar(N.R).add(_t10b.set(P.x,P.y,P.z));w7Steer(N,v,N.sp*1.2,dt,1.8);if(N.t10<=0){N.ph='jumpc';N.jt=0}return}
 if(N.ph=='lift10'){const P=N.pl;N.v10=Math.min(N.sp*1.3,N.v10+dt*25);F.dir.lerp(N.up,damp(1,dt)).normalize();F.vel.copy(F.dir).multiplyScalar(N.v10);F.pos.addScaledVector(F.vel,dt);F.mesh.lookAt(_t10a.copy(F.pos).sub(F.dir));
  for(const sp of F.mesh.userData.fl)sp.scale.setScalar((F.mesh.userData.fb||4)*(1.4+Math.random()*.5));if(F.pos.distanceTo(_t10b.set(P.x,P.y,P.z))>P.r*1.9){N.ph='jumpc';N.jt=0}return}
 if(N.ph=='land10'){const P=N.pl,c=_t10b.set(P.x,P.y,P.z),d=F.pos.distanceTo(c);const g=_t10a.copy(c).addScaledVector(N.up,P.r*.98);w7Steer(N,g,d<P.r*1.25?45:N.sp,dt,1.4);
  if(d<P.r*1.04){N.ph='dockin';N.dk=0}return}
 if(N.ph=='race10'){const w=N.wp[N.wi];if(w7Steer(N,w,N.sp,dt,2.6)<120){N.wi++;if(N.wi>=N.wp.length){N.ph='jumpc';N.jt=0;w7Bub(N,N.name.includes('Éclair')?'Victoire !':'La prochaine fois…',3)}}
  if(Math.random()<dt*20&&F.pos.distanceTo(S.pos)<2500){const q=F.pos;SPK.emit(q.x,q.y,q.z,rv(8),rv(8),rv(8),.3,.7,1,.25,.6)}return}
 _u(N,dt)}}
// ----- couloirs de trafic au loin : points lumineux entre stations voisines -----
function w10Lanes(dt){const sts=w7Sts().filter(s=>Math.hypot(s.x-S.pos.x,s.y-S.pos.y,s.z-S.pos.z)<26000),k=sts.map(s=>s.n).join('|');
 if(k!==W10.lk){W10.lk=k;W10.lp=[];const pr=[];for(let i=0;i<sts.length;i++)for(let j=i+1;j<sts.length;j++){const d=Math.hypot(sts[i].x-sts[j].x,sts[i].y-sts[j].y,sts[i].z-sts[j].z);if(d<30000)pr.push([d,sts[i],sts[j]])}
  pr.sort((a,b)=>a[0]-b[0]);for(const[d,a,b]of pr.slice(0,DESK?8:5))for(let n=0;n<(DESK?10:7);n++)W10.lp.push({a,b,f:Math.random(),v:(140+Math.random()*120)/d*(Math.random()<.5?1:-1),o:new V3(rv(160),rv(60),rv(160)),c:Math.random()<.6})
  const n=W10.lp.length;if(!W10.lane){const g=new THREE.BufferGeometry(),M=new THREE.PointsMaterial({size:DESK?26:30,map:GLOW,vertexColors:true,transparent:true,blending:ADDB,depthWrite:false,sizeAttenuation:true});W10.lane=new THREE.Points(g,M);W10.lane.frustumCulled=false;W10.lane.renderOrder=2;scene.add(W10.lane)}
  const g=W10.lane.geometry;g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(Math.max(1,n)*3),3));const C=new Float32Array(Math.max(1,n)*3);W10.lp.forEach((p,i)=>{const c=p.c?[1,.82,.5]:[.6,.85,1];C.set(c,i*3)});g.setAttribute('color',new THREE.BufferAttribute(C,3));g.setDrawRange(0,n)}
 if(!W10.lane)return;const P=W10.lane.geometry.attributes.position,A=P.array;let i=0;
 for(const p of W10.lp){p.f+=p.v*dt;if(p.f>1)p.f-=1;if(p.f<0)p.f+=1;const a=p.a,b=p.b,x=a.x+(b.x-a.x)*p.f+p.o.x,y=a.y+(b.y-a.y)*p.f+p.o.y,z=a.z+(b.z-a.z)*p.f+p.o.z;
  // les points proches sont repoussés hors de vue (les vrais PNJ prennent le relais à moins de 3,5 km)
  const dd=Math.hypot(x-S.pos.x,y-S.pos.y,z-S.pos.z);if(dd<3500){A[i++]=0;A[i++]=-1e7;A[i++]=0}else{A[i++]=x;A[i++]=y;A[i++]=z}}
 P.needsUpdate=true;W10.lane.visible=mode=='space'}
STICK.push(dt=>{if(mode!='space'||S.dead)return;W10.lt+=dt;w10Lanes(dt)});
TICK.push(()=>{if(W10.lane&&mode!='space')W10.lane.visible=false});
// ----- radar : une forme par type de PNJ (carré = cargo, losange = Alliance, petit point = civil), plus discrets au loin -----
const W10C={cargo:['#e8c070','rgba(232,192,112,.45)','sq',2],pat:['#7fb0ff','rgba(127,176,255,.45)','dia',2],civ:['rgba(175,210,240,.8)','rgba(175,210,240,.35)',null,1.4]};
{const _mr=mpRadar;mpRadar=function(blip){_mr(blip);if(mode!='space')return;const RN=W7.raid&&W7.raid.N;for(const N of W7.L){if(N.gone)continue;
  if(N===RN){blip(N.F.pos,(t%.8)<.4?'#ff9a40':'#ff5a3a',3.2,true);continue}const c=W10C[N.job=='cargo'?'cargo':N.job=='patrol'?'pat':'civ'],far=N.F.pos.distanceTo(S.pos)>4000;blip(N.F.pos,c[far?1:0],far?c[3]*.8:c[3],false,false,c[2])}}}
// ----- conseils de départ : disparaissent dès qu'on commence à jouer -----
{const k=()=>{if(t>2&&hint>1.2)hint=1.2};addEventListener('keydown',k,true);addEventListener('pointerdown',k,true)}
