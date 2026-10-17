// ===== TUTORIEL + « QUOI FAIRE ? » (w9.js) =====
// Tutoriel guidé en 10 étapes détectées automatiquement (G.x.tut9 {i,done}), lancé pour les nouveaux pilotes, relançable (Options / panneau « Quoi faire ? »).
// « Quoi faire ? » (bouton #qfb, touche F1) : 3 idées d'activités adaptées à la situation, avec un cap (G.x.wp9) ou une action directe.
const TUT9={on:false,t:0,acc:0,hl:null,d0:0};
const TUT9S=[
{k:'steer',t:'Piloter',d:()=>DESK?'Déplace la souris : le vaisseau suit le curseur. (Tab = curseur libre pour cliquer sur les menus.)':'Pose ton pouce sur la moitié gauche de l\'écran et fais-le glisser pour tourner.',ok:dt=>{if(Math.abs(S.yawV||0)+Math.abs(S.pitchV||0)>.3)TUT9.acc+=dt;return TUT9.acc>1.4}},
{k:'thr',t:'Régler la vitesse',d:()=>THR6.man?(DESK?'Maintiens Z (W sur un clavier QWERTY) pour accélérer, S pour ralentir.':'Fais glisser la jauge GAZ vers le haut pour accélérer.'):'Ton vaisseau avance tout seul en pilotage automatique.',hl:'#thr6',ok:()=>!THR6.man||THR6.v>=.6},
{k:'fire',t:'Tirer',d:()=>DESK?'Clic gauche (ou Espace) pour tirer. Vise un astéroïde pour t\'entraîner.':'Appuie sur le bouton Feu, en bas à droite.',hl:'#fire',ok:dt=>{if(isFire())TUT9.acc+=dt;return TUT9.acc>.6}},
{k:'boost',t:'Le boost',d:()=>DESK?'Maintiens Maj ou le clic droit pour un coup d\'accélération.':'Maintiens le bouton Boost.',hl:'#boost',ok:dt=>{if(isBoost())TUT9.acc+=dt;return TUT9.acc>.8}},
{k:'map',t:'La carte',d:()=>'Ouvre la carte'+(DESK?' (touche C)':'')+' : stations, planètes, missions… Touche un lieu pour voir sa distance et y sauter. Referme-la ensuite.',hl:'#mapb',ok:()=>{if(MAP.open)TUT9.acc=1;return TUT9.acc&&!MAP.open}},
{k:'dock',t:'S\'amarrer',d:()=>'Suis le marqueur violet jusqu\'à la station la plus proche et approche-toi : tu t\'amarres tout seul.',ok:()=>!!S.docked&&!S.docked.ground,go:()=>{const st=t9Station();if(st)t9Wp(st.x,st.y,st.z,st.n)}},
{k:'shop',t:'Le marché',d:()=>'Dans la station, ouvre l\'onglet Marché (l\'icône ¢) : achète bas, revends plus cher ailleurs. Les autres onglets : armes, Atelier, fabrication, services…',ok:()=>S.docked&&(TAB=='market'||TAB=='svc')},
{k:'walk',t:'Descendre du vaisseau',d:()=>'Appuie sur « Descendre du vaisseau » en haut de l\'écran pour marcher dans le hangar.',hl:'#w3go',ok:()=>typeof WK3!='undefined'&&WK3.on},
{k:'talk',t:'Parler aux habitants',d:()=>'Approche-toi de quelqu\'un et appuie sur « Parler à … »'+(DESK?' (E)':'')+'. Ils donnent des tuyaux et des petites missions.',hl:'#w3act',ok:()=>typeof W8!='undefined'&&!!W8.talkA},
{k:'go',t:'Repartir',d:()=>'Remonte dans ton vaisseau (« Retour au vaisseau »), puis appuie sur « Partir ». Bon vol !',hl:'#w3ship',ok:()=>!S.docked&&mode=='space'}];
function t9Station(){let b=null,bd=1e12;for(const s of(typeof w7Sts=='function'?w7Sts():stations)){const d=Math.hypot(s.x-S.pos.x,s.y-S.pos.y,s.z-S.pos.z);if(d<bd){bd=d;b=s}}return b}
function t9Wp(x,y,z,n){G.x.wp9={x,y,z,n};}
function tutStart(){const rewarded=!!(G.x.tut9&&G.x.tut9.rewarded)||!!GX('polish',{}).tutorialReward;G.x.tut9={i:0,rewarded};TUT9.on=true;TUT9.acc=0;TUT9.d0=0;hint=0;t9Step();toast('🎓 Tutoriel : suis les étapes en haut de l\'écran');}
function tutStop(done){TUT9.on=false;t9HL(null);$('tut9').style.display='none';const T=GX('tut9',{});T.done=1;T.skipped=!done;if(done&&!T.rewarded&&!GX('polish',{}).tutorialReward){T.rewarded=1;GX('polish',{}).tutorialReward=1;G.cr+=500;gainXP(80);banner('trophy','Tutoriel terminé !','+500 ¢ · Appuie sur « Quoi faire ? » ('+(DESK?'F1':'bouton ?')+') quand tu cherches une idée.','#7fffb0');try{SFX.win()}catch(e){}}save()}
function t9HL(sel){if(TUT9.hl===sel)return;if(TUT9.hl)document.querySelectorAll(TUT9.hl).forEach(e=>e.classList.remove('tut9hl'));TUT9.hl=sel;if(sel)document.querySelectorAll(sel).forEach(e=>e.classList.add('tut9hl'))}
function t9Step(){const T=G.x.tut9,s=TUT9S[T.i];if(!s){tutStop(true);return}TUT9.acc=0;if(s.go)s.go();const el=$('tut9');el.style.display='block';el.innerHTML=`<div class="t9h"><span>${ICO('star')} Tutoriel · ${T.i+1}/${TUT9S.length}</span><button id="t9x">Passer</button></div><b>${s.t}</b><p>${s.d()}</p><div class="t9bar"><i style="width:${(T.i/TUT9S.length*100).toFixed(0)}%"></i></div>`;$('t9x').onclick=()=>{tutStop(false);toast('Tutoriel passé — tu peux le relancer depuis « Quoi faire ? »')};t9HL(s.hl||null)}
document.body.insertAdjacentHTML('beforeend','<div id="tut9"></div><div id="qf9"></div>');
let t9T0=performance.now();TICK.push(()=>{const t9n=performance.now(),dt=Math.min(.1,(t9n-t9T0)/1000);t9T0=t9n;
 // cap (marqueur violet)
 const W=G.x.wp9;if(W&&mode=='space'&&(Math.hypot(W.x-S.pos.x,W.y-S.pos.y,W.z-S.pos.z)<450||S.docked&&S.docked.n===W.n))G.x.wp9=null;
 // démarrage automatique pour les nouveaux pilotes
 if(!TUT9.on&&!G.x.tut9&&(G.xp||0)<150&&mode=='space'&&!isPaused()&&!(typeof MENU3!='undefined'&&MENU3.on)){TUT9.d0+=dt;if(TUT9.d0>3&&!DLG.open)tutStart()}
 document.body.classList.toggle('t9dock',TUT9.on&&!!S.docked);if(!TUT9.on)return;const T=G.x.tut9,s=TUT9S[T.i];if(!s){tutStop(true);return}hint=0;
 if(isPaused()&&(s.k!='map'||!MAP.open)){$('tut9').style.opacity=.35;return}else $('tut9').style.opacity=1;
 let ok=false;try{ok=s.ok(dt)}catch(e){}if(ok){T.i++;try{tone(880,1320,.12,'sine',.05)}catch(e){}t9Step()}
 // sauter les étapes impossibles (ex. pilote déjà à quai au lancement)
 if(s.k!='dock'&&s.k!='shop'&&s.k!='walk'&&s.k!='talk'&&s.k!='go'&&S.docked&&!S.docked.ground){T.i=TUT9S.findIndex(x=>x.k=='shop');t9Step()}});
// ----- « Quoi faire ? » -----
const QF9={open:false,seed:0};
function qfIdeas(){const L=[],lv=(()=>{try{return lvInfo().L}catch(e){return 1}})(),st=t9Station(),dSt=st?Math.hypot(st.x-S.pos.x,st.y-S.pos.y,st.z-S.pos.z):1e9,dk=S.docked&&!S.docked.ground?S.docked:null,add=(sc,ic,t,d,go)=>L.push({sc:sc*(0.75+Math.random()*.5),ic,t,d,go});
const wp=(o,n)=>()=>{t9Wp(o.x,o.y,o.z,n);qfClose();toast('🧭 Cap sur '+n+' : suis le marqueur violet')};
if(typeof W7!='undefined'&&W7.raid&&!W7.raid.N.gone)add(10,'shield','Sauver '+W7.raid.N.name,'Des pirates l\'attaquent en ce moment. Abats-en au moins un : récompense, XP et réputation.',wp(W7.raid.N.F.pos,W7.raid.N.name));
if(G.x.w8q)add(8,'cargo','Finir ta mission pour '+G.x.w8q.who.split(' ')[0],G.x.w8q.k=='col'?'Livre le colis à '+G.x.w8q.to+'.':'Rapporte '+G.x.w8q.n+' unités de '+w7G(G.x.w8q.g).n.toLowerCase()+' à '+G.x.w8q.st+'.',G.x.w8q.k=='col'?wp({x:G.x.w8q.tx,y:G.x.w8q.ty,z:G.x.w8q.tz},G.x.w8q.to):null);
if(S.hp<maxhp()*.55)add(7,'shield','Réparer ta coque','Coque à '+Math.round(S.hp/maxhp()*100)+' % : amarre-toi (réparation gratuite) ou dors dans ton vaisseau.',st?wp(st,st.n):null);
if(typeof v4F=='function'&&v4F().v<30)add(7,'pad','Faire le plein','Il te reste '+Math.floor(v4F().v)+' de carburant : service « Carburant » en station, ou écope près d\'une étoile.',st?wp(st,st.n):null);
if(!G.m&&!dk&&st)add(5,'flag','Prendre une mission','Le bureau des missions de '+st.n+' propose du travail payé.',wp(st,st.n));
if(dk){add(5,'flag','Bureau des missions','Des missions t\'attendent ici même.',()=>{qfClose();TAB='station';HC.shopV=null});
 try{if(v4Offers(dk).length)add(4.5,'ship','Taxi spatial','Transporte des passagers : '+v4Offers(dk).length+' courses proposées ici.',()=>{qfClose();TAB='svc';HC.shopV=null})}catch(e){}
 try{const C=circuit(dk);if(!(RCD.medal[C.id]>0))add(3.5,'race','Course de la station','Tente une médaille sur le circuit de '+dk.n+'.',()=>{qfClose();TAB='svc';HC.shopV=null})}catch(e){}
 if(typeof w3Start=='function'&&typeof H3!='undefined'&&H3.on)add(4,'user','Rencontrer les habitants','Descends du vaisseau : ils donnent des tuyaux de commerce et des petites missions.',()=>{qfClose();w3Start()})}
try{for(let i=0;i<3;i++)if(G.u[i]<6&&G.cr>=upCost(i)){add(4,'wrench','Améliorer ton vaisseau','Tu as de quoi acheter une amélioration ('+['armes','moteur','coque'][i]+').',dk?()=>{qfClose();TAB='station';HC.shopV=null}:(st?wp(st,st.n):null));break}}catch(e){}
try{if(lv>=3&&typeof WG!='undefined'&&!WG.list.length)add(3,'squad','Recruter un ailier','Au bar d\'une station : un ailier combat à tes côtés.',dk?()=>{qfClose();TAB='svc';HC.shopV=null}:(st?wp(st,st.n):null))}catch(e){}
if(mode=='space'){let a=null,ad=4000;for(const x of asts){if(!x.ore)continue;const d=x.pos.distanceTo(S.pos);if(d<ad){ad=d;a=x}}if(a&&cargoUsed()<cap()*.7)add(3.5,'drill','Miner des astéroïdes','Un astéroïde riche en minerai est à '+(ad/1000).toFixed(1)+' km. Tire dessus et ramasse les fragments.',wp(a.pos,'Astéroïde riche'))
 let p=null,pd=1e12;for(const q of planets){if(G.disc.has(q.name))continue;const d=Math.hypot(q.x-S.pos.x,q.y-S.pos.y,q.z-S.pos.z);if(d<pd){pd=d;p=q}}if(p)add(4,'planet','Explorer '+p.name,'Une planète jamais visitée à '+(pd/1000).toFixed(1)+' km : récompense de découverte, grotte, créatures…',wp(p,p.name))}
try{const n=(G.x.v2art||[]).length;if(lv>=2&&n<12)add(2.5,'star','Chasser les artefacts','Tu as '+n+'/12 artefacts. Des reliques flottent dans certains secteurs lointains.',null)}catch(e){}
try{if(G.x.v1kn&&!G.x.v1bk)add(3,'target','Affronter le Kraken de fer','Son repaire est marqué sur ta carte. 15 000 ¢ à la clé.',()=>{qfClose();openMap()})}catch(e){}
if(dk&&st){try{const here=dk,goods=GOODS;let best=null;for(const s of w7Sts()){if(s.n==here.n)continue;for(const g of goods){const p0=gPrice(here,g),p=Math.round(sellPrice(s,g));if(p>p0*1.2&&(!best||p/p0>best.r))best={g,s,p,p0,r:p/p0}}}
 if(best)add(4.5,'cargo','Commerce : '+best.g.n,'Achète-le '+best.p0+' ¢ ici et revends-le '+best.p+' ¢ à '+best.s.n+'.',()=>{qfClose();TAB='market';HC.shopV=null})}catch(e){}}
add(1.5,'map','Ouvrir la carte','Repère les stations, les planètes et les objectifs autour de toi.',()=>{qfClose();openMap()});
L.sort((a,b)=>b.sc-a.sc);return L.slice(0,3)}
function qfRender(){const I=qfIdeas(),el=$('qf9');QF9.I=I;
el.innerHTML=`<div class="t9h"><span>${ICO('target')} Quoi faire ?</span><button id="qfx">${ICO('close')}</button></div>`+I.map((o,i)=>`<div class="qfr"><div class="qfi">${ICO(o.ic)}</div><div><b>${esc(o.t)}</b><small>${esc(o.d)}</small></div>${o.go?`<button data-qf="${i}">Y aller</button>`:''}</div>`).join('')+
`<div class="qfb"><button id="qfm">${ICO('jump')} Autres idées</button><button id="qft">${ICO('star')} ${G.x.tut9&&G.x.tut9.done?'Revoir le tutoriel':'Tutoriel'}</button></div>`;
$('qfx').onclick=qfClose;$('qfm').onclick=()=>{try{SFX.tick()}catch(e){}qfRender()};$('qft').onclick=()=>{qfClose();tutStart()};el.querySelectorAll('[data-qf]').forEach(b=>b.onclick=()=>{const o=QF9.I[+b.dataset.qf];try{SFX.buy()}catch(e){}if(o&&o.go)o.go()})}
function qfOpen(){QF9.open=true;$('qf9').style.display='block';qfRender();$('qfb').classList.add('on')}
function qfClose(){QF9.open=false;$('qf9').style.display='none';$('qfb').classList.remove('on')}
{const b=document.createElement('button');b.id='qfb';b.className='ic';b.title='Quoi faire ? (F1)';b.innerHTML='<b style="font:800 20px var(--hf)">?</b>';b.onclick=()=>QF9.open?qfClose():qfOpen();document.body.appendChild(b)}
addEventListener('keydown',e=>{if(e.code=='F1'){e.preventDefault();QF9.open?qfClose():qfOpen()}else if(e.code=='Escape'&&QF9.open)qfClose()},true);
// marqueur du cap
{const _ov=overlay;overlay=function(){_ov();try{const W=G.x.wp9;if(W&&mode=='space'&&!S.docked&&!S.dead)edgeMarker(W,'#c8a0ff',W.n,'◆')}catch(e){}}}
// bouton dans les Options
{const r=$('df3b')&&$('df3b').closest('.psec');if(r){r.insertAdjacentHTML('beforeend','<div class="orow"><span>Tutoriel</span><button id="tut9b">Relancer</button></div>');$('tut9b').onclick=()=>{try{optToggle(false)}catch(e){}tutStart()}}}

// pendant le tutoriel, les bandeaux attendent (ils se superposeraient) ; le panneau du tutoriel s'efface sous « Quoi faire ? »
{const _bb=banBlocked;banBlocked=function(){if(TUT9.on)return true;return _bb()}}
TICK.push(()=>{if(TUT9.on){G.x.thr6h=1;$('tut9').style.visibility=QF9.open?'hidden':''}});
