// ===== FOULE ET HABITANTS DES STATIONS (w8.js) : des gens qui vivent dans le hangar (emploi du temps selon l'heure réelle, déplacements,
// discussions entre eux, entrées/sorties par les portes de service), à qui on peut parler (ils se souviennent de toi, donnent des tuyaux
// et des petites missions : colis à livrer, minerai à rapporter). État W8, mémoire G.x.w8m, mission G.x.w8q.
const W8={sc:null,A:[],st:null,lastNear:null,sayT:0};
const W8FN=['Inès','Malik','Lou','Nadia','Yanis','Clara','Théo','Awa','Hugo','Sacha','Lina','Bastien','Maëlle','Karim','Jade','Noé','Zoé','Idris','Elsa','Tao','Rosa','Victor','Léna','Omar'];
const W8LN=['Kessler','Duval','Okafor','Martin','Nguyen','Moreau','Haddad','Rossi','Lambert','Sato','Diallo','Petit','Novak','Garnier','Ferreira','Mercier'];
const W8JOB=[{k:'pilote',n:'pilote de fret',role:'',suit:0x3a5a8a,ic:'🧑‍✈️',go:['bar','missions','center','shipL']},{k:'meca',n:'mécano',role:'mechanic',suit:0xf0b040,ic:'🧑‍🔧',go:['shipL','shipR','front','rear']},
{k:'docker',n:'docker',role:'miner',suit:0x6a7a8a,ic:'👷',go:['crates','shipR','front']},{k:'marchand',n:'marchand ambulant',role:'merchant',suit:0x6b3fa0,ic:'🧑‍💼',go:['market','center']},
{k:'touriste',n:'touriste',role:'',suit:0xd08a5a,ic:'🧳',go:['window','bar','center','bench']},{k:'mineur',n:'mineur',role:'miner',suit:0x8a6a3a,ic:'⛏️',go:['bar','market','crates']},
{k:'inge',n:'ingénieur·e de bord',role:'scientist',suit:0xf2f4f6,ic:'🧑‍🔬',go:['shipR','front','window']},{k:'garde',n:'garde de la station',role:'guard',suit:0x2a3a5a,ic:'💂',go:['door','center','missions']},
{k:'cuisto',n:'cuisinier·e du bar',role:'',suit:0xeeeeee,ic:'🧑‍🍳',go:['bar']},{k:'journa',n:'journaliste',role:'',suit:0x8a3a5a,ic:'🎙️',go:['center','missions','bar','window']}];
const W8P={bar:[[-27,33],[-24,32.4],[-21,33.4],[-29.5,30]],market:[[-6.5,33],[-1.5,33],[-4,31]],missions:[[13.5,33],[18.5,33],[16,31]],shipL:[[-12,-4],[-12,8],[-10.5,2]],shipR:[[12,-6],[12.5,7],[11,1]],
front:[[0,-13],[-4,-12],[4,-12.5]],rear:[[0,13],[-3,12.5],[3,13]],crates:[[-29,-12],[-30,4],[-27,-4]],window:[[29,-20],[30.5,-2],[29.5,12]],bench:[[25,25],[29,26]],door:[[-32.5,18],[32.5,18]],center:[[0,23],[-12,21],[12,21],[0,-22]]};
const W8DOORS=[[-33.6,18],[33.6,18]];
const W8OBS=[{x:0,z:0,w:8.5,d:9},{x:-24,z:37,w:5,d:1.3},{x:-4,z:37,w:5,d:1.3},{x:16,z:37,w:5,d:1.3},{x:9.5,z:5,w:1.6,d:1.6}];
const W8CHAT=[['Tu as vu le prix du titane ?','Ça a grimpé depuis le pillage du convoi.'],['Mon cargo a encore une fuite…','Passe voir le mécano, il fait des miracles.'],['Des pirates rôdent près de la ceinture.','Je reste à quai ce soir, merci bien.'],
['Il paraît qu\'une baleine spatiale est passée.','Encore une histoire de bar, ça.'],['Tu pars où demain ?','Livrer des médicaments, si l\'Alliance paie.'],['Le café du bar est infect.','Il te tient éveillé, c\'est tout ce qu\'on lui demande.'],['Ma fille veut devenir pilote.','Elle a bien raison, c\'est le plus beau métier.'],['J\'ai perdu au cartes contre un mineur.','Ne joue jamais contre un mineur.']];
const w8Hash=s=>[...String(s)].reduce((a,c)=>(a*31+c.charCodeAt(0))|0,7)>>>0;
const w8Nick=()=>(typeof MP!='undefined'&&MP.nick)||'pilote';
// habitants d'une station (toujours les mêmes, tirés du nom de la station)
function w8Res(st){const r=rng(w8Hash(st.n)%2147483646+1),L=[];const jobs=W8JOB.slice();for(let i=0;i<9;i++){const J=jobs.splice(r()*jobs.length|0,1)[0]||W8JOB[i%W8JOB.length],fem=r()<.5;let fn=W8FN[r()*W8FN.length|0];for(let k=0;k<30&&L.some(o=>o.fn==fn);k++)fn=W8FN[r()*W8FN.length|0];
L.push({id:st.n+'#'+i,fn,name:fn+' '+W8LN[r()*W8LN.length|0],J,fem,seed:w8Hash(st.n+i),hs:fem?[1,2,4,0][r()*4|0]:[0,3,5,6][r()*4|0],suit:new THREE.Color(J.suit).offsetHSL((r()-.5)*.08,0,(r()-.5)*.12).getHex(),night:r()<.35})}return L}
function w8Mem(id){const M=GX('w8m',{});return M[id]||(M[id]={n:0,t:0,q:0})}
function w8Hour(){return new Date().getHours()}
// ----- création de la foule quand le hangar est construit -----
function w8Build(){const sc=H3.sc,st=H3.st;if(!sc||!st)return;W8.sc=sc;W8.st=st;W8.A=[];const h=w8Hour(),night=h>=23||h<6,R=w8Res(st),max=DESK?9:6;
const add=(geo,m,x,y,z,ry)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.rotation.y=ry||0;sc.add(o);return o};
// portes de service (entrées et sorties des habitants)
const fr=new THREE.MeshStandardMaterial({color:0x2a313a,metalness:.7,roughness:.4}),pn=new THREE.MeshBasicMaterial({color:0x3fa8ff,transparent:true,opacity:.55});
for(const[x,z]of W8DOORS){const s=Math.sign(x);add(RB3(.6,3.6,3.2),fr,x+s*.9,1.8,z);add(new THREE.PlaneGeometry(2.4,3),pn,x+s*.55,1.6,z,-s*Math.PI/2);const L=sprite(0x3fa8ff,3,.6);L.position.set(x+s*.4,3.7,z);sc.add(L)}
let n=0;for(const P of R){if(n>=max)break;if(night&&!P.night&&P.J.k!='cuisto'&&P.J.k!='garde')continue;if(!night&&Math.random()<.15)continue;
 const jk=P.J.k,rr=rng(P.seed%2147483646+1),m=buildHuman({role:P.J.role,suit:P.suit,robe:jk=='marchand'?P.suit:undefined,helmet:false,closed:false,fem:P.fem,seed:P.seed,hs:rr()<.6?undefined:P.hs,tool:jk=='meca',outfit:jk=='cuisto'?'tablier':jk=='pilote'?'veste':jk=='journa'?(rr()<.5?'manteau':'veste'):undefined,acc2:jk=='touriste'?(rr()<.5?['solaires','sac']:['audio','sac','lunettes'].slice(0,1+(rr()*2|0))):jk=='journa'?['audio']:undefined});m.userData.noAO=1;
 const out=Math.random()<.25,dr=W8DOORS[Math.random()*2|0],p0=out?new V3(dr[0],0,dr[1]):w8Pt(P.J.go[W8.pk=Math.random()*P.J.go.length|0]);m.position.copy(p0);m.visible=!out;sc.add(m);
 if(night&&jk!='cuisto'&&jk!='garde')hmMood(m,'fatigue');W8.A.push({poi:P.J.go[W8.pk],P,m,p:m.position,yaw:Math.random()*TAU,ph:Math.random()*6,st:out?'away':'idle',wait:out?3+Math.random()*25:Math.random()*6,tg:null,spd:0,mate:null,talkT:0,bub:null});n++}
w8Spots()}
function w8Pt(k){const L=W8P[k]||W8P.center,q=L[Math.random()*L.length|0];return new V3(q[0]+rv(.8),0,q[1]+rv(.8))}
function w8Pick(A){const h=w8Hour(),night=h>=22||h<6,go=A.P.J.go.slice();if(night)go.push('bar','bar');if(Math.random()<.18)go.push('center','bench');return go[Math.random()*go.length|0]}
function w8Coll(p){p.x=clamp(p.x,-34,34);p.z=clamp(p.z,-30,46);for(const c of W8OBS){const dx=p.x-c.x,dz=p.z-c.z,ox=c.w+.4-Math.abs(dx),oz=c.d+.4-Math.abs(dz);if(ox>0&&oz>0){if(ox<oz)p.x+=Math.sign(dx||1)*ox;else p.z+=Math.sign(dz||1)*oz}}}
// ----- points de dialogue pour walk3 (sans « n » : walk3 ne les anime pas) -----
function w8Spots(){if(WK3.built!==W8.sc)return;WK3.spots=WK3.spots.filter(s=>!s.w8);for(const A of W8.A)WK3.spots.push({w8:A,x:A.p.x,z:A.p.z,act:'w8:'+A.P.id,lab:'Parler à '+A.P.fn})}
{const _b=w3Build;w3Build=function(){_b.apply(this,arguments);try{w8Spots()}catch(e){console.warn(e)}}}
{const _a=w3Act;w3Act=function(a){if(typeof a=='string'&&a.startsWith('w8:')){const A=W8.A.find(x=>'w8:'+x.P.id==a);if(A)w8Talk(A);return}return _a(a)}}
// ----- vie de la foule -----
const _w8a=new V3();
function w8Tick(dt){if(!H3.on||!H3.sc){return}if(W8.sc!==H3.sc)w8Build();const pl=WK3.on?WK3.p:null;
for(const A of W8.A){if(A.st=='away'){A.wait-=dt;if(A.wait<=0){const d=W8DOORS[Math.random()*2|0];A.p.set(d[0],0,d[1]);A.m.visible=true;A.st='walk';A.tg=w8Pt(A.poi=w8Pick(A))}continue}
 let spd=0,talk=0,look=null;
 if(A.st=='talk'){if(!pl||Math.hypot(pl.x-A.p.x,pl.z-A.p.z)>5||t>A.talkT){A.st='idle';A.wait=2+Math.random()*3}else{const ty=Math.atan2(pl.x-A.p.x,pl.z-A.p.z)+Math.PI;let d=ty-A.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));A.yaw+=d*damp(6,dt);talk=DLG.open?1:0}}
 else if(A.st=='walk'||A.st=='leave'||A.st=='meet'){_w8a.copy(A.tg).sub(A.p);_w8a.y=0;const d=_w8a.length();
  if(d<.5){if(A.st=='leave'){A.st='away';A.m.visible=false;A.wait=20+Math.random()*60;continue}if(A.st=='meet'){A.st='chat';A.talkT=t+8+Math.random()*7}else{A.st='idle';A.wait=5+Math.random()*12}}
  else{spd=A.P.J.k=='garde'?1.2:1.35+(A.P.seed%7)*.05;_w8a.divideScalar(d);for(const B of W8.A){if(B===A||B.st=='away')continue;const q=A.p.distanceTo(B.p);if(q<.9&&q>.01)_w8a.addScaledVector(_w8a.clone().copy(A.p).sub(B.p).normalize(),.6)}
   if(pl){const q=Math.hypot(A.p.x-pl.x,A.p.z-pl.z);if(q<1&&q>.01){_w8a.x+=(A.p.x-pl.x)/q*.8;_w8a.z+=(A.p.z-pl.z)/q*.8}}
   _w8a.normalize();A.p.addScaledVector(_w8a,spd*dt);w8Coll(A.p);const ty=Math.atan2(-_w8a.x,-_w8a.z);let dy=ty-A.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));A.yaw+=dy*damp(7,dt)}}
 else if(A.st=='chat'){const B=A.mate;if(!B||B.st!='chat'&&B.st!='meet'||t>A.talkT){A.st='idle';A.wait=3+Math.random()*5;A.mate=null}else{const ty=Math.atan2(B.p.x-A.p.x,B.p.z-A.p.z)+Math.PI;let d=ty-A.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));A.yaw+=d*damp(5,dt);talk=Math.floor(t/2.2+(A.P.seed&1))%2;
   if(!A.bub&&!B.bub&&A.P.seed<B.P.seed&&Math.random()<dt*.15){const L=w8Pick2(W8CHAT);A.bub={txt:L[0],t:t+3.5};B.bub={txt:L[1],t:t+7,t0:t+3.5}}}}
 else{A.wait-=dt;if(pl){const q=Math.hypot(pl.x-A.p.x,pl.z-A.p.z);if(q<4)look=Math.atan2(pl.x-A.p.x,pl.z-A.p.z)+Math.PI-A.yaw}
  if(A.wait<=0){const r=Math.random();if(r<.12){const d=W8DOORS[Math.random()*2|0];A.st='leave';A.tg=new V3(d[0],0,d[1])}
   else if(r<.32){const B=W8.A.find(o=>o!==A&&o.st=='idle'&&o.p.distanceTo(A.p)<22);if(B){const mid=A.p.clone().add(B.p).multiplyScalar(.5);w8Coll(mid);const off=_w8a.copy(B.p).sub(A.p).normalize().multiplyScalar(.75);A.st=B.st='meet';A.mate=B;B.mate=A;A.tg=mid.clone().sub(off);B.tg=mid.clone().add(off)}else{A.st='walk';A.tg=w8Pt(A.poi=w8Pick(A))}}
   else{A.st='walk';A.tg=w8Pt(A.poi=w8Pick(A))}}}
 if(look!=null)look=Math.atan2(Math.sin(look),Math.cos(look));if(look!=null&&Math.abs(look)>1.3)look=null;
 try{w8Act(A,pl,dt,talk)}catch(e){}A.ph+=dt*hm3Rate(spd);A.m.rotation.y=A.yaw;try{animHuman(A.m,A.ph,spd,false,false,talk,look)}catch(e){}
 if(A.bub&&t>A.bub.t)A.bub=null}
// points de dialogue qui suivent les habitants
if(WK3.built===W8.sc)for(const s of WK3.spots)if(s.w8){const A=s.w8;if(A.st=='away'){s.x=1e4;s.z=1e4}else{s.x=A.p.x;s.z=A.p.z}}}
function w8Pick2(a){return a[Math.random()*a.length|0]}
TICK.push(dt=>{try{w8Tick(Math.min(.1,dt||.016))}catch(e){console.warn(e)}});
// ----- conversation -----
function w8Char(A){const k='w8_'+A.P.id;CHAR[k]={n:A.P.name+' · '+A.P.J.n,ic:A.P.J.ic,c:'#ffd38a'};return k}
function w8Tip(A){const here=W8.st;const L=(typeof w7Sts=='function'?w7Sts():[]).filter(s=>s.n!==here.n);const goods=GOODS.filter(g=>!g.min||g.id!='or');
if(L.length&&Math.random()<.6){let best=null;for(const g of goods){const p0=gPrice(here,g);for(const s of L){const p=Math.round(sellPrice(s,g));if(p>p0*1.15&&(!best||p/p0>best.r))best={g,s,p,p0,r:p/p0}}}
 if(best)return`Un tuyau : ${best.g.n.toLowerCase()} s'achète ${best.p0} ¢ ici et se revend ${best.p} ¢ à ${best.s.n}. Fais-en bon usage !`}
const cx=cof(here.x),cz=cof(here.z),pls=[];for(let i=-3;i<=3;i++)for(let l=-3;l<=3;l++){const c=cdata(cx+i,0,cz+l);if(c.pl)pls.push(c.pl)}
if(pls.length){const p=w8Pick2(pls),k=Math.random();return k<.4?`On raconte qu'une grotte gardée par deux piliers runiques se cache sur ${p.name}. Il y aurait un trésor au fond.`:k<.7?`Un ami a vu des créatures étranges sur ${p.name}. Prends ton scanner si tu y vas.`:`L'avant-poste de ${p.name} cherche toujours des pilotes. Ça paie bien.`}
return'Le secteur est calme en ce moment. Profites-en.'}
const W8LINES={pilote:['Trois jours de saut sans dormir. Je rêve d\'un vrai lit.','Le couloir d\'amarrage est trop étroit pour mon cargo, je te jure.'],meca:['Ton vaisseau fait un drôle de bruit, non ? Je plaisante… peut-être.','Je répare tout, sauf les cœurs brisés.'],docker:['Cent caisses par jour. Mon dos me déteste.','Les caisses rouges, on n\'ouvre jamais. Jamais.'],marchand:['Tout se vend, tout s\'achète, même les souvenirs.','J\'ai des pierres de lune authentiques. Enfin, presque.'],
touriste:['C\'est mon premier voyage dans l\'espace ! Tout est si grand !','J\'ai fait cent photos de la nébuleuse.'],mineur:['Le cristal, ça chante quand tu le fores. Si si.','Un jour je trouverai un filon d\'or et je prendrai ma retraite.'],inge:['Le réacteur de cette station a 40 ans. Croise les doigts.','Les boucliers hexagonaux, c\'est mon invention. Enfin, presque.'],
garde:['Circule, pilote. Mais sois prudent dehors.','Pas de bagarre dans mon hangar.'],cuisto:['Ce soir, ragoût de racines de Jungle. Un délice.','Le secret du café ? Un peu de poussière de comète.'],journa:['Je prépare un article sur les pirates. Tu as des infos ?','Les gens adorent les histoires de sauvetage. Tu en as une ?']};
function w8Talk(A){if(DLG.open)return;const P=A.P,M=w8Mem(P.id),k=w8Char(A),nick=w8Nick(),L=[];A.st='talk';A.talkT=t+40;W8.lastNear=A;W8.talkA=A;hmWork(A.m,null);hmGest(A.m,'salut');hmMood(A.m,M.q>=2?'joie':M.n?'joie':'surpris',M.n?8:3);
const Q=G.x.w8q;
// mission de minerai en cours avec cet habitant : on rapporte ?
if(Q&&Q.k=='min'&&Q.id==P.id){const have=(G.cargo[Q.g]||0);if(have>=Q.n){G.cargo[Q.g]-=Q.n;G.cr+=Q.pay;gainXP(50);M.q++;G.x.w8q=null;try{SFX.win()}catch(e){}L.push([k,`Parfait, ${Q.n} unités de ${w7G(Q.g).n.toLowerCase()} ! Voilà ${Q.pay} ¢, comme promis. Merci, ${nick} !`]);M.n++;M.t=Date.now();say(L);save();return}
 L.push([k,`Alors, ce ${w7G(Q.g).n.toLowerCase()} ? Il m'en faut ${Q.n} unités (tu en as ${have}).`]);say(L);return}
if(!M.n)L.push([k,`Salut ! Moi c'est ${P.fn}, ${P.J.n} ici, à ${W8.st.n}. Et toi, tu es… ${nick} ? Enchanté${P.fem?'e':''} !`]);
else{const h=(Date.now()-M.t)/36e5;L.push([k,M.q>=2?`${nick} ! Mon pilote préféré. Toujours un plaisir.`:h>20?`${nick} ! Ça faisait ${h>48?Math.round(h/24)+' jours':'un moment'}. Content${P.fem?'e':''} de te revoir.`:`Re-salut, ${nick} !`])}
M.n++;M.t=Date.now();
const r=M.n%3;
if(r==1)L.push([k,w8Pick2(W8LINES[P.J.k]||W8LINES.pilote)]);
L.push([k,w8Tip(A)]);
say(L,()=>{if(!G.x.w8q&&(r==2||M.n==1&&Math.random()<.5))w8Offer(A,k)});save()}
function w8Offer(A,k){const P=A.P,here=W8.st,el=$('chc');let q;
const others=(typeof w7Sts=='function'?w7Sts():[]).filter(s=>s.n!==here.n).map(s=>({s,d:Math.hypot(s.x-here.x,s.y-here.y,s.z-here.z)})).filter(o=>o.d>2500&&o.d<20000);
if(others.length&&Math.random()<.6){const o=w8Pick2(others),pay=Math.round((180+o.d/1000*28)/10)*10;q={k:'col',id:P.id,who:P.name,to:o.s.n,tx:o.s.x,ty:o.s.y,tz:o.s.z,pay,txt:`Tu pourrais porter ce colis à ${o.s.n} (${(o.d/1000).toFixed(1)} km) ? Je te donne ${pay} ¢ à la livraison.`}}
else{const g=w8Pick2(['fer','titane','cristal']),n=4+Math.random()*5|0,base=(GOODS.find(x=>x.id==g)||{p:20}).p,pay=Math.round(base*n*2.2/10)*10;q={k:'min',id:P.id,who:P.name,st:here.n,g,n,pay,txt:`J'ai besoin de ${n} unités de ${w7G(g).n.toLowerCase()}. Rapporte-les-moi ici et je te paie ${pay} ¢, plus du double du prix du marché.`}}
const C=CHAR[k];el.innerHTML=`<div id="chcI">${C.ic}</div><div><div id="chcN" style="color:${C.c}">${esc(C.n)}</div><div id="chcT">${esc(q.txt)}</div><div class="obtns"><button data-w8="1">Accepter</button><button data-w8="0">Pas maintenant</button></div></div>`;el.style.display='flex';try{SFX.tick()}catch(e){}
el.querySelectorAll('[data-w8]').forEach(b=>b.onclick=e=>{e.stopPropagation();el.style.display='none';if(b.dataset.w8=='1'){G.x.w8q=q;toast(q.k=='col'?'📦 Colis à livrer à '+q.to:'⛏ Rapporte '+q.n+' unités de '+w7G(q.g).n.toLowerCase()+' à '+P.fn+' ('+here.n+')');try{SFX.buy()}catch(_){}save()}})}
// ----- livraison du colis : en s'amarrant à la bonne station -----
TICK.push(()=>{const Q=G.x.w8q;if(!Q||Q.k!='col'||!S.docked||S.docked.n!==Q.to)return;G.x.w8q=null;G.cr+=Q.pay;gainXP(60);const M=G.x.w8m&&G.x.w8m[Q.id];if(M)M.q++;banner('cargo','Colis livré',`Le colis de ${Q.who} est arrivé à bon port · +${Q.pay.toLocaleString('fr-FR')} ¢`,'#7fffb0');try{SFX.win()}catch(e){}save()});
// marqueur et ligne d'objectif
{const _ov=overlay;overlay=function(){_ov();try{const Q=G.x.w8q;if(Q&&Q.k=='col'&&mode=='space'&&!S.docked&&!S.dead)edgeMarker({x:Q.tx,y:Q.ty,z:Q.tz},'#ffd38a','Colis','📦')}catch(e){}
// bulles et noms dans le hangar (projection par la caméra du hangar)
try{if(!H3.on||!H3.cam||!W8.A.length)return;const cam=H3.cam,W=innerWidth,H=innerHeight;OX.textAlign='center';
 for(const A of W8.A){if(A.st=='away')continue;_w8a.set(A.p.x,2.25,A.p.z);const d=_w8a.distanceTo(cam.position);if(d>(WK3.on?16:40))continue;_w8a.project(cam);if(_w8a.z>1)continue;const x=(_w8a.x+1)/2*W,y=(1-_w8a.y)/2*H;
  const b=A.bub&&(!A.bub.t0||t>A.bub.t0)?A.bub:null;if(b){OX.font="600 11px 'Chakra Petch',system-ui";const w=Math.min(250,OX.measureText(b.txt).width+16);OX.fillStyle='rgba(6,16,28,.85)';OX.fillRect(x-w/2,y-34,w,22);OX.fillStyle='#ffd38a';OX.fillRect(x-w/2,y-34,2,22);OX.fillStyle='#eaf6ff';OX.fillText(b.txt,x,y-19)}
  if(WK3.on&&d<9&&!W8.talkA){OX.font="700 11px 'Chakra Petch',system-ui";OX.fillStyle='rgba(255,211,138,.95)';OX.fillText(A.P.fn,x,y);OX.font="600 9.5px 'Chakra Petch',system-ui";OX.fillStyle='rgba(205,230,255,.8)';OX.fillText(A.P.J.n,x,y+11)}}}catch(e){}}}
{const _ci=contentInfo;contentInfo=function(){let s=_ci();const Q=G.x.w8q;if(Q)s=(s?s+'<br>':'')+(Q.k=='col'?`📦 Colis de ${esc(Q.who.split(' ')[0])} → ${esc(Q.to)} (+${Q.pay} ¢)`:`⛏ ${Q.n} × ${esc(w7G(Q.g).n.toLowerCase())} pour ${esc(Q.who.split(' ')[0])} à ${esc(Q.st)} (${G.cargo[Q.g]||0}/${Q.n})`);return s}}

// caméra de conversation : de profil, les deux personnages dans le cadre
{const _ha=h3Anim;h3Anim=function(dt){_ha(dt);const A=W8.talkA;if(!A)return;const open=DLG.open||$('chc').style.display=='flex';if(A.st!='talk'||!WK3.on||!open){if(!open)W8.talkA=null;return}
const c=H3.cam,P=WK3.p,mx=(P.x+A.p.x)/2,mz=(P.z+A.p.z)/2,dx=A.p.x-P.x,dz=A.p.z-P.z,l=Math.hypot(dx,dz)||1;let px=-dz/l,pz=dx/l;const cx=Math.sin(WK3.cy),cz=Math.cos(WK3.cy);if(px*cx+pz*cz<0){px=-px;pz=-pz}
const tx=clamp(mx+px*3.4,-35,35),tz=clamp(mz+pz*3.4,-47,47);if(!W8.cp)W8.cp=c.position.clone();W8.cp.lerp(_w8a.set(tx,1.75,tz),damp(4,dt));c.position.copy(W8.cp);c.lookAt(mx,1.45,mz)}}
TICK.push(()=>{if(!W8.talkA&&W8.cp)W8.cp=null});
// ----- gestes : métier à son poste, bras croisés / mains dans le dos, humeurs des discussions, saluts au pilote (chars5.js) -----
const W8MOOD=['joie','joie','joie','surpris','triste','colere',null];
function w8Act(A,pl,dt,talk){const m=A.m,jk=A.P.J.k,st=A.st,p=A.poi||'';let wk=null,lg=null;
 if(st=='idle'){if(jk=='cuisto'&&p=='bar')wk='essuyer';else if(jk=='meca'&&/ship|front|rear/.test(p))wk='cle';else if((jk=='journa'||jk=='inge')&&p!='bar')wk='tablette';else if(p=='bar')wk='boire';
  else if(jk=='garde')lg='dos';else if(p=='window')lg=A.P.seed%2?'dos':'bras';else if(jk=='marchand')lg='hanches';else if(A.P.seed%3==0)lg='bras'}
 else if(st=='walk'&&jk=='docker'&&p!='crates')wk='caisse';
 hmWork(m,wk);const u=m.userData;if(lg!==A.lg||lg&&!u.g5k){A.lg=lg;hmGest(m,lg,lg?Infinity:0)}
 if(st=='chat'){if(A.cm!==A.talkT){A.cm=A.talkT;const md=W8MOOD[Math.random()*W8MOOD.length|0];if(md)hmMood(m,md,Math.max(1,A.talkT-t))}
 }
 if(st=='talk'||st=='chat'){if(talk&&!hmBusy(m)&&Math.random()<dt*.4)hmGest(m,['hausser','oui','montrer','non','rire','oui'][Math.random()*6|0])}
 // salut quand le pilote passe tout près (une fois par visite)
 if(pl&&!A.gr&&(st=='idle'||st=='walk')&&Math.hypot(pl.x-A.p.x,pl.z-A.p.z)<3.2){A.gr=1;const M=w8Mem(A.P.id);if(M.n>0||Math.random()<.55){hmWork(m,null);hmGest(m,'salut');hmMood(m,'joie',3);W8.wb=t+.7;if(st=='idle')A.wait=Math.max(A.wait,2.5)}else hmGest(m,'oui')}}
TICK.push(()=>{if(W8.wb&&t>W8.wb){W8.wb=0;try{if(WK3.on&&WK3.m&&!hmBusy(WK3.m))hmGest(WK3.m,'salut')}catch(e){}}});
