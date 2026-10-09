// ===== COURSES SPATIALES : un circuit d'anneaux autour de chaque station, chrono, fantôme du meilleur temps, médailles, défis multijoueur =====
const RCD=GX('race',{});if(typeof RCD.best!='object'||!RCD.best)RCD.best={};if(typeof RCD.medal!='object'||!RCD.medal)RCD.medal={};const RFEE=100,RPAY=[0,350,700,1200];
const RC={on:null,rings:[],ghost:null,gm:null,mp:null,offers:new Map(),res:null};
const RACERG=new THREE.TorusGeometry(36,2.6,10,48);
function circuit(st){const r=rng(seedOf(st.x|0,st.z|0,7,71)),N=12,a0=r()*TAU,cen=new V3(st.x+Math.cos(a0)*1800,st.y,st.z+Math.sin(a0)*1800),R=1050+r()*450,ph=r()*TAU,pts=[];
for(let i=0;i<N;i++){const a=i/N*TAU+(r()-.5)*.28,rr=R*(.72+r()*.56);pts.push(new V3(cen.x+Math.cos(a)*rr,cen.y+Math.sin(a*2+ph)*240+(r()-.5)*160,cen.z+Math.sin(a)*rr*.8))}
// les anneaux évitent planètes, soleils et station
const obs=[];for(let i=-1;i<=1;i++)for(let l=-1;l<=1;l++)for(let j=-1;j<=1;j++){const c=cdata(cof(cen.x)+i,j,cof(cen.z)+l);if(c.pl)obs.push([c.pl,c.pl.r+220]);if(c.sun)obs.push([c.sun,c.sun.r*2]);if(c.st)obs.push([c.st,260])}
for(const p of pts)for(const[o,rr]of obs){const d=Math.hypot(p.x-o.x,p.y-o.y,p.z-o.z);if(d<rr){const k=rr/(d||1);p.set(o.x+(p.x-o.x)*k,o.y+(p.y-o.y)*k,o.z+(p.z-o.z)*k)}}
let L=0;for(let i=0;i<N;i++)L+=pts[i].distanceTo(pts[(i+1)%N]);const n=pts.map((p,i)=>pts[(i+1)%N].clone().sub(pts[(i+N-1)%N]).normalize());
return{id:st.n,n:'Circuit de '+st.n,pts,nrm:n,N,L,gold:L/235+3,silver:L/195+3,bronze:L/160+3}}
const tfmt=s=>{s=Math.max(0,s);const m=Math.floor(s/60),x=s-m*60;return m+':'+(x<10?'0':'')+x.toFixed(2)};
const medalOf=(C,s)=>s<=C.gold?3:s<=C.silver?2:s<=C.bronze?1:0,MEDN=['Aucune','Bronze','Argent','Or'],MEDC=['#9ab','#cd7f32','#d8dde6','#ffd34d'];
// ----- fantôme -----
function ghostLoad(id){try{const s=localStorage.getItem('sf-gh-'+id);return s?JSON.parse(s):null}catch(e){return null}}
function ghostSave(id,g){try{localStorage.setItem('sf-gh-'+id,JSON.stringify(g));const keys=Object.keys(localStorage).filter(k=>k.startsWith('sf-gh-'));if(keys.length>16)localStorage.removeItem(keys[0])}catch(e){}}
function ghostMesh(){const g=buildAlly(0x9fd8ff,0x9fd8ff),M=new THREE.MeshBasicMaterial({color:0x8fd8ff,transparent:true,opacity:.28,blending:ADDB,depthWrite:false});g.traverse(o=>{if(o.isMesh)o.material=M});return g}
// ----- départ, passage des anneaux, arrivée -----
function raceStart(st,mp){if(RC.on)return;const C=circuit(st);if(!mp){if(G.cr<RFEE){toast('Inscription : '+RFEE+' ¢');return}G.cr-=RFEE}if(S.docked)undock();
const p0=C.pts[0],n0=C.nrm[0];S.pos.copy(p0).addScaledVector(n0,-280);S.q.setFromUnitVectors(new V3(0,0,-1),n0);S.vel.set(0,0,0);S.spd=0;S.mustLeave=null;camInit=true;
for(const e of en)e.mesh.parent&&e.mesh.parent.remove(e.mesh);en.length=0;spawnT=Math.max(spawnT,60);
RC.rings=C.pts.map((p,i)=>{const m=new THREE.Mesh(RACERG,new THREE.MeshBasicMaterial({color:i==0?0xffffff:0x6fe8ff,transparent:true,opacity:.2,blending:ADDB,depthWrite:false}));m.position.copy(p);m.lookAt(p.clone().add(C.nrm[i]));scene.add(m);const s=sprite(0x6fe8ff,70,.0);m.add(s);m.userData.s=s;return m});
const gh=ghostLoad(C.id);if(gh&&gh.p&&gh.p.length>14){RC.gm=ghostMesh();scene.add(RC.gm)}
RC.on={C,st:{n:st.n,x:st.x,y:st.y,z:st.z},seq:0,cd:3.4,t:0,rec:[],recT:0,gh,last:S.pos.clone(),mp:!!mp};toast('🏁 '+C.n+' — prêt ?');SFX.buy()}
function raceEnd(ok){const R=RC.on;if(!R)return;for(const m of RC.rings)scene.remove(m);RC.rings=[];if(RC.gm){scene.remove(RC.gm);RC.gm=null}RC.on=null;
if(!ok){toast('🏁 Course abandonnée');if(RC.mp&&RC.mp.id)RC.mp.ft=-1;return}const C=R.C,tm=R.t,md=medalOf(C,tm),pb=RCD.best[C.id];STS.races++;
const prev=RCD.medal[C.id]||0;let cr=md>prev?RPAY[md]:Math.round(RPAY[md]*.2),txt=md&&md<=prev?' · gain réduit (médaille déjà obtenue ici)':'';if(md==3){STS.gold++;if(prev<3){STS.golds++;cr+=1500;txt=' · première médaille d\'or ici : +1 500 ¢'}}
if(!pb||tm<pb){RCD.best[C.id]=tm;ghostSave(C.id,{t:tm,p:R.rec});txt+=pb?' · nouveau record ('+(tm-pb).toFixed(2)+' s)':' · premier temps enregistré'}RCD.medal[C.id]=Math.max(RCD.medal[C.id]||0,md);
G.cr+=cr;gainXP([30,60,100,180][md]);banner('trophy',C.n+' : '+tfmt(tm),'Médaille : '+MEDN[md]+(cr?' · +'+fmt(cr)+' ¢':'')+txt,MEDC[md]);SFX.win();if(RC.mp&&RC.mp.id){RC.mp.ft=Math.round(tm*1000);mpSend(true)}save()}
function raceTick(dt){const R=RC.on;if(!R){rcMpTick();return}const C=R.C;
if(R.cd>0){const prev=Math.ceil(R.cd);R.cd-=dt;const p0=C.pts[0];S.pos.copy(p0).addScaledVector(C.nrm[0],-280);S.vel.set(0,0,0);S.spd=0;S.q.setFromUnitVectors(new V3(0,0,-1),C.nrm[0]);if(Math.ceil(R.cd)<prev&&R.cd>0)tone(660,660,.15,'square',.08);if(R.cd<=0){tone(1320,1320,.35,'square',.1);S.spd=cruise();S.vel.copy(fwd()).multiplyScalar(S.spd)}R.last.copy(S.pos);return}
R.t+=dt;R.recT-=dt;if(R.recT<=0){R.recT=.1;R.rec.push(Math.round(S.pos.x*10)/10,Math.round(S.pos.y*10)/10,Math.round(S.pos.z*10)/10,Math.round(S.q.x*1e3)/1e3,Math.round(S.q.y*1e3)/1e3,Math.round(S.q.z*1e3)/1e3,Math.round(S.q.w*1e3)/1e3)}
const gi=R.seq>=C.N?0:R.seq,p=C.pts[gi],n=C.nrm[gi],a=R.last.clone().sub(p).dot(n),b=S.pos.clone().sub(p).dot(n);if(a<0&&b>=0){const k=a/(a-b),hit=R.last.clone().lerp(S.pos,k);if(hit.distanceTo(p)<44){R.seq++;tone(880+R.seq*40,1320+R.seq*40,.12,'triangle',.07);fxGlow(p,0x6fe8ff,90,.3,1.8);if(R.seq>C.N){R.last.copy(S.pos);raceEnd(true);return}}}R.last.copy(S.pos);
for(let i=0;i<RC.rings.length;i++){const m=RC.rings[i],next=(R.seq>=C.N?0:R.seq)==i,after=((R.seq+1)%C.N)==i&&R.seq<C.N;m.material.opacity=next?.85+Math.sin(t*8)*.15:after?.35:.1;m.material.color.setHex(next?(R.seq>=C.N?0xffd34d:0x6fe8ff):0xbfefff);m.userData.s.material.opacity=next?.5:0;m.rotation.z+=dt*(next?1.5:.2)}
if(RC.gm&&R.gh){const P=R.gh.p,f=R.t/.1,i=Math.min(Math.floor(f),P.length/7-2),k=f-i;if(i>=0&&i*7+13<P.length){const A=i*7,Bb=A+7;RC.gm.position.set(lerp(P[A],P[Bb],k),lerp(P[A+1],P[Bb+1],k),lerp(P[A+2],P[Bb+2],k));RC.gm.quaternion.set(P[A+3],P[A+4],P[A+5],P[A+6]).normalize();RC.gm.visible=true}else RC.gm.visible=false}
const cen=C.pts[0];if(S.pos.distanceTo(cen)>6500||S.dead||S.docked||R.t>C.bronze*2.5)raceEnd(false)}
STICK.push(raceTick);
{const _ov=overlay;overlay=function(){_ov();const R=RC.on;if(!R||mode!='space')return;const W=innerWidth,H=innerHeight,C=R.C;OX.textAlign='center';
if(R.cd>0){const n=Math.ceil(R.cd);OX.font="800 92px 'Chakra Petch',system-ui";OX.fillStyle=n<=3?'#ffd34d':'#fff';OX.fillText(n>3?'PRÊT':n,W/2,H*.38);return}if(R.t<1){OX.font="800 80px 'Chakra Petch',system-ui";OX.fillStyle='#6fe8ff';OX.globalAlpha=1-R.t;OX.fillText('GO !',W/2,H*.38);OX.globalAlpha=1}
const y=DESK?54:142,pb=RCD.best[C.id];OX.font="800 28px 'Chakra Petch',system-ui";OX.fillStyle='#fff';OX.fillText(tfmt(R.t),W/2,y);OX.font="600 12px 'Chakra Petch',system-ui";OX.fillStyle='#bfefff';OX.fillText('Anneau '+Math.min(R.seq,C.N+1)+' / '+(C.N+1)+' · Or '+tfmt(C.gold)+(pb?' · record '+tfmt(pb):''),W/2,y+18);
const gi=R.seq>=C.N?0:R.seq;edgeMarker(C.pts[gi],R.seq>=C.N?'#ffd34d':'#6fe8ff',R.seq>=C.N?'Arrivée':'',R.seq>=C.N?'🏁':'◯')}}
// ----- défis multijoueur -----
function rcMine(){return RC.mp&&RC.mp.id?{id:RC.mp.id,st:RC.mp.st,t0:RC.mp.t0,ft:RC.mp.ft||0}:null}
{const _mo=mpExtraOut;mpExtraOut=function(){const o=_mo();const r=rcMine();if(r)o.rc=r;return o}}
{const _mpp=mpPeer;mpPeer=function(p){_mpp(p);if(p.kind!='viewer'||p.sameTab)return;const o=MP.others.get(p.peer),pr=p.presence||{};if(!o)return;const r=pr.rc;o.rc=r&&typeof r.id=='string'?{id:r.id.slice(0,40),st:String(r.st||'').slice(0,40),t0:+r.t0||0,ft:+r.ft||0}:null;
if(o.rc&&RC.mp&&RC.mp.id===o.rc.id&&!RC.mp.host&&!RC.mp.started&&o.rc.t0>Date.now())RC.mp.t0=o.rc.t0;if(o.rc&&RC.offers.has(o.rc.id))RC.offers.get(o.rc.id).t0=o.rc.t0;if(o.rc&&o.rc.t0>Date.now()&&!RC.offers.has(o.rc.id)&&(!RC.mp||RC.mp.id!==o.rc.id)){RC.offers.set(o.rc.id,{by:p.peer,nick:mpName(o),st:o.rc.st,t0:o.rc.t0});if(!o.first){toast('🏁 '+mpName(o)+' lance un défi de course à '+o.rc.st+' — rejoins-le dans l\'onglet Services de la station');SFX.disc()}}}}
function rcChallenge(){const st=S.docked;if(!st||!MP.room){toast('Le multijoueur n\'est pas disponible');return}if(!MP.others.size){toast('Aucun autre pilote connecté');return}RC.mp={id:(MP.me||'moi')+'-'+Date.now().toString(36),st:st.n,t0:Date.now()+25000,host:1,ft:0,stO:{n:st.n,x:st.x,y:st.y,z:st.z}};mpSend(true);toast('🏁 Défi lancé ! Départ dans 25 s — les autres pilotes doivent être amarrés à '+st.n);SFX.buy()}
function rcJoin(id){const o=RC.offers.get(id),st=S.docked;if(!o||!st)return;if(st.n!==o.st){toast('Rejoins d\'abord '+o.st);return}if(o.t0-Date.now()<3000){toast('Trop tard pour ce départ');return}RC.mp={id,st:o.st,t0:o.t0,host:0,ft:0,stO:{n:st.n,x:st.x,y:st.y,z:st.z}};mpSend(true);toast('🏁 Inscrit au défi ! Départ dans '+Math.ceil((o.t0-Date.now())/1000)+' s');SFX.buy()}
function rcMpTick(){const M=RC.mp;if(!M)return;const now=Date.now();if(!M.started&&now>=M.t0-3400){M.started=1;raceStart(M.stO,true);if(RC.on)RC.on.cd=Math.max(.5,(M.t0-now)/1000)}
if(M.started&&!RC.on&&!M.done){const rivals=[...MP.others.values()].filter(o=>o.rc&&o.rc.id===M.id);const fin=rivals.every(o=>o.rc.ft!==0)||(M.ftT&&now-M.ftT>60000);if(M.ft&&!M.ftT)M.ftT=now;if(M.ft!==0&&fin){M.done=1;const all=[{nick:'Toi',ft:M.ft},...rivals.map(o=>({nick:mpName(o),ft:o.rc.ft}))].filter(x=>x.ft>0).sort((a,b)=>a.ft-b.ft);
if(all.length>1){const won=all[0].nick=='Toi',pot=500*(all.length-1);if(won){G.cr+=pot;save()}banner('race','Défi terminé : '+(won?'victoire !':all.findIndex(x=>x.nick=='Toi')+1+'e place'),all.slice(0,3).map((x,i)=>(i+1)+'. '+x.nick+' '+tfmt(x.ft/1000)).join(' · ')+(won?' · +'+fmt(pot)+' ¢':''),won?'#ffd34d':'#9fd8ff')}setTimeout(()=>{RC.mp=null;mpSend(true)},4000)}}
if(now>M.t0+600000){RC.mp=null}}
// ----- station : circuit -----
SVC.act.rgo=()=>{const st=S.docked;if(st)raceStart({n:st.n,x:st.x,y:st.y,z:st.z},false)};SVC.act.rmp=rcChallenge;SVC.act.rjoin=id=>rcJoin(id);
svcAdd({o:30,ic:'race',t:'Course spatiale',show:st=>!st.ground&&!st.base,html:st=>{const C=circuit(st),pb=RCD.best[C.id],md=RCD.medal[C.id]||0;let h=SROW(`<div><b>🏁 ${esc(C.n)}</b>${md?` <i class="tag" style="background:${MEDC[md]};color:#111">${MEDN[md]}</i>`:''}<small>${C.N} anneaux · ${(C.L/1000).toFixed(1)} km · Or ${tfmt(C.gold)} · Argent ${tfmt(C.silver)} · Bronze ${tfmt(C.bronze)}<br>${pb?'Ton record : '+tfmt(pb)+' (ton fantôme court avec toi)':'Pas encore de temps enregistré'} · gains : 350 / 700 / 1 200 ¢ à la première médaille, 20 % ensuite</small></div>`,`<button class="hot" data-sv="rgo">Départ · ${RFEE} ¢</button>`);
if(typeof MP!='undefined'&&MP.room&&MP.others.size){const offs=[...RC.offers.entries()].filter(([,o])=>o.t0>Date.now()+3000&&o.st==st.n);h+=SROW(`<div><b>Défi multijoueur</b><small>${RC.mp?'Inscrit : départ dans '+Math.max(0,Math.ceil((RC.mp.t0-Date.now())/60e3))+' min max':'Le gagnant empoche 500 ¢ par adversaire.'}</small></div>`,RC.mp?'':(offs.map(([id,o])=>`<button class="hot" data-sv="rjoin:${id}">Rejoindre ${esc(o.nick)}</button>`).join('')+`<button data-sv="rmp">Défier</button>`))}return h}});
