// ===== CODEX ET SUCCÈS : encyclopédie qui se remplit en jouant, statistiques, 46 succès avec récompenses et titres =====
const CX=GX('cx',{});for(const k of['pl','sp','en','an','ch','fac','log','der'])if(typeof CX[k]!='object'||!CX[k])CX[k]={};
const STS=GX('st',{});if(typeof STS.k!='object'||!STS.k)STS.k={};for(const k of['earn','mined','smug','races','gold','golds','holes','worms','ions','ders','hacks','scans','probes','bat','hunt','wingk','hire','gm','dread','drones','fm'])STS[k]=+STS[k]||0;
const ACHD=GX('ach',{});
const CXT={pl:{Volcanique:'Croûte instable, rivières de lave et geysers. Riche en or et en fer.',Désertique:'Dunes sans fin et tempêtes de sable. Titane, fer et or affleurent.',Jungle:'Végétation géante et troupeaux nombreux. Fer et titane.',Océanique:'Archipels perdus dans un océan planétaire. Le fer abonde sur les rivages.',Glacée:'Banquises et blizzards. Les cristaux d\'énergie dorment sous la glace.',Cristalline:'Forêts de cristaux qui chantent au vent. Le paradis des prospecteurs.','Géante gazeuse':'Impossible de s\'y poser, mais ses anneaux attirent les mineurs.'},
en:{pirate:['Pirate','Chasseur léger du Pavillon noir. Peu résistant, il vole souvent en paire.'],chasseur:['Intercepteur pirate','Très rapide, il tire en rafales et esquive quand on le vise.'],lourd:['Croiseur lourd','Lent mais blindé : salves en éventail et missiles à tête chercheuse. Esquive les missiles en virant serré.'],boss:['Chef pirate','Vaisseau amiral entouré d\'ailiers. Grosse prime sur sa tête.'],police:['Patrouille de l\'Alliance','N\'attaque que les pilotes recherchés. Paie ta prime pour qu\'elle te laisse tranquille.'],hunter:['Chasseur de primes','Mercenaire qui traque les pilotes recherchés. Rapide, tenace et bien armé.'],drone:['Drone de sécurité','Il garde encore les épaves géantes. Trois tirs de blaster suffisent.'],sentry:['Tourelle de sécurité','Défend les ponts des épaves. Abrite-toi derrière les murs entre ses rafales.'],wb:['Dreadnought pirate','Apparaît toutes les 20 minutes. Il faut s\'y mettre à plusieurs.'],nemesis:['Croiseur Némésis','Générateurs de bouclier, tourelles, puis réacteur : trois phases.']},
an:{bh:['Trou noir','Sa gravité courbe la lumière. Les poches de matière exotique près de l\'horizon valent une fortune — si tu en reviens.'],worm:['Trou de ver','Un tunnel à travers l\'espace : il relie deux régions très éloignées. Fonce au centre.'],ion:['Tempête ionique','Coupe le radar et les boucliers. La foudre y forme des cristaux qu\'on peut récolter.'],der:['Épave géante','Croiseurs morts depuis des décennies. Des drones de sécurité veillent encore sur leurs trésors.'],rich:['Astéroïde riche','Un bloc gorgé de minerai précieux. Seul un laser de minage en vient vraiment à bout.'],cont:['Conteneur dérivant','Cargaison perdue, invisible sans scanner. Le rayon tracteur la ramène.']},
fac:{alliance:['Alliance stellaire','Les gardiens des routes commerciales. Leurs stations contrôlent les marchandises et chassent les pirates.'],guilde:['Guilde des mineurs','Elle fait tourner l\'économie du secteur : foreuses, raffineries, avant-postes.'],carto:['Cartographes','Savants et explorateurs qui rêvent de cartographier toute la galaxie.'],pirates:['Pavillon noir','Les pirates de Kael « Corbeau ». Ils tiennent les zones hostiles et le marché noir.']}};
const CHTXT={iris:'Commandante de la Base Alpha. Elle a confiance en toi depuis le premier jour.',tess:'Scientifique de la base, obsédée par le signal de l\'Écho.',corbeau:'Chef du Pavillon noir. Rusé, rancunier, toujours un coup d\'avance.',echo:'Une voix venue de l\'épave du Kepler… ou d\'ailleurs.',ia:'L\'ordinateur de bord de ton vaisseau.'};
function cxAdd(cat,id,data){if(!CX[cat]||CX[cat][id])return false;CX[cat][id]=Object.assign({t:Date.now()},data||{});const nm=cxName(cat,id);if(nm&&cat!='pl'&&cat!='ch')toast('📖 Nouvelle entrée du codex : '+nm);CXP.dirty=1;return true}
function cxName(cat,id){if(cat=='en')return(CXT.en[id]||[id])[0];if(cat=='an')return(CXT.an[id]||[id])[0];if(cat=='fac')return(CXT.fac[id]||[id])[0];if(cat=='sp')return id;if(cat=='log')return'Journal';if(cat=='ch')return CHAR[id]&&CHAR[id].n;return id}
function cxLog(txt,src){const id='l'+(txt.length*31+txt.charCodeAt(5)*7+txt.charCodeAt(txt.length-3)).toString(36);cxAdd('log',id,{txt,src:src||''})}
// ----- crochets : ennemis, espèces, personnages, factions, journaux, minerais, gains -----
{const _he=hitEnemy;hitEnemy=function(e,d,p){const was=e.dead;_he(e,d,p);if(!was&&e.dead){const k=e.kind||e.ty;STS.k[k]=(STS.k[k]||0)+1;cxAdd('en',k);if(k=='pirate'||k=='chasseur'||k=='lourd'||k=='boss')cxAdd('fac','pirates')}}}
{const _ni=nearInter;nearInter=function(){const I=_ni();if(I&&I.label&&!I.cxw){const l=I.label();if(typeof l=='string'&&l.startsWith('🔬 SCANNER · ')&&GR&&GR.F){const nm=l.slice(12).trim(),pl=GR.F.p.name,ty=GR.F.ty,a=I.act;I.act=()=>{a();cxAdd('sp',nm,{pl,ty})};I.cxw=1}}return I}}
{const _sy=say;say=function(lines,done){for(const l of lines)if(l&&l[0]&&CHAR[l[0]])cxAdd('ch',l[0]);return _sy(lines,done)}}
{const _ar=addRep;addRep=function(f,n){_ar(f,n);if(n>0)cxAdd('fac',f)}}
{const _to=toast;toast=function(s){_to(s);if(typeof s=='string'&&s.startsWith('📜 '))cxLog(s.slice(2).trim(),'Terminal de bunker')}}
{const _mt=minToast;minToast=function(){for(const k in MINQ)STS.mined+=MINQ[k];_mt()}}
{const _wd=wbDeath;wbDeath=function(){if(WB.myD>0){STS.dread++;cxAdd('en','wb')}_wd()}}
{const _sb=storyBossDone;storyBossDone=function(){cxAdd('en','nemesis');STS.k.nemesis=(STS.k.nemesis||0)+1;_sb()}}
{const _ug=updGM;updGM=function(){const win=G.gm&&gmTotal()>=G.gm.n;_ug();if(win)STS.gm++}}
let CRL=null;TICK.push(dt=>{if(CRL==null||G.ecoReset)CRL=G.cr;if(G.cr>CRL)STS.earn+=G.cr-CRL;CRL=G.cr});
// planètes découvertes → entrées par type
function cxPlanets(){const c={};for(const n in G.dpos||{}){const p=G.dpos[n],ty=p[4]?'Géante gazeuse':ptype({hue:p[3],ring:0});(c[ty]=c[ty]||[]).push(n)}return c}
// ----- succès -----
const xs=(k,f)=>{const o=G.x[k];return o&&o[f]!=null?o[f]:0};
const nk=o=>Object.keys(o||{}).length;
const ACH=[
['Combat'],
['sang','Premier sang','Abats ton premier ennemi.','target',()=>[G.kills,1],{cr:150,xp:30}],
['chasse50','Chasseur de pirates','Abats 50 ennemis.','target',()=>[G.kills,50],{cr:1500,xp:200}],
['chasse250','Fléau des pirates','Abats 250 ennemis.','skull',()=>[G.kills,250],{cr:6000,xp:800,ti:'Fléau des pirates'}],
['lourds','Briseur de blindage','Détruis 10 croiseurs lourds.','shield',()=>[STS.k.lourd||0,10],{cr:2500,xp:300}],
['chef','Chef pirate abattu','Abats un chef pirate (mission de prime).','flag',()=>[STS.k.boss||0,1],{cr:800,xp:100}],
['nemesis','Tueur de géants','Détruis le croiseur Némésis.','star',()=>[STS.k.nemesis||0,1],{cr:3000,xp:400}],
['dread','Brise-dreadnought','Participe à la destruction d\'un dreadnought.','skull',()=>[STS.dread,1],{cr:2500,xp:300}],
['gm','Esprit d\'équipe','Réussis une chasse de groupe.','mp',()=>[STS.gm,1],{cr:1000,xp:150}],
['Exploration'],
['pl5','Explorateur','Découvre 5 planètes.','planet',()=>[G.disc.size,5],{cr:400,xp:60}],
['pl25','Cartographe','Découvre 25 planètes.','map',()=>[G.disc.size,25],{cr:3000,xp:400,ti:'Cartographe'}],
['pl60','Grand pionnier','Découvre 60 planètes.','map',()=>[G.disc.size,60],{cr:9000,xp:1200,ti:'Grand pionnier'}],
['sp5','Naturaliste','Scanne 5 espèces animales.','scan',()=>[nk(CX.sp),5],{cr:800,xp:120}],
['sp20','Xénobiologiste','Scanne 20 espèces animales.','leaf',()=>[nk(CX.sp),20],{cr:4000,xp:600,ti:'Xénobiologiste'}],
['walk5','Pieds sur terre','Marche sur 5 planètes différentes.','walk',()=>[nk(G.pexp),5],{cr:700,xp:100}],
['bh','Horizon des événements','Approche-toi d\'un trou noir.','vortex',()=>[STS.holes,1],{cr:900,xp:150}],
['worm','Voyageur des trous de ver','Traverse 3 trous de ver.','vortex',()=>[STS.worms,3],{cr:1500,xp:250}],
['ion','Chasseur d\'orages','Traverse une tempête ionique.','bolt',()=>[STS.ions,1],{cr:700,xp:120}],
['der1','Pilleur d\'épaves','Atteins le pont d\'une épave géante.','door',()=>[STS.ders,1],{cr:1500,xp:250}],
['der5','Archéologue','Explore le pont de 5 épaves géantes.','door',()=>[STS.ders,5],{cr:6000,xp:900,ti:'Archéologue'}],
['hack','Pirate informatique','Pirate 10 portes verrouillées.','lock',()=>[STS.hacks,10],{cr:1500,xp:250}],
['scan','Œil de lynx','Lance 25 balayages du scanner.','pulse',()=>[STS.scans,25],{cr:1200,xp:200}],
['probe','Lanceur de sondes','Découvre 10 planètes grâce aux sondes.','probe',()=>[STS.probes,10],{cr:2000,xp:300}],
['Commerce et industrie'],
['earn10','Marchand','Gagne 10 000 ¢ au total.','coin',()=>[STS.earn,1e4],{cr:500,xp:80}],
['earn250','Magnat','Gagne 250 000 ¢ au total.','coin',()=>[STS.earn,2.5e5],{cr:10000,xp:1500,ti:'Magnat'}],
['smug','Contrebandier','Vends 20 marchandises de contrebande.','skull',()=>[STS.smug,20],{cr:2000,xp:300,ti:'Contrebandier'}],
['mine100','Mineur','Ramasse 100 minerais.','tool',()=>[STS.mined,100],{cr:600,xp:100}],
['mine1k','Foreur de l\'extrême','Ramasse 1 000 minerais.','drill',()=>[STS.mined,1000],{cr:5000,xp:700,ti:'Foreur'}],
['craft','Artisan','Fabrique une pièce à partir d\'un plan.','wrench',()=>[G.pown.filter(k=>CRAFT[k]).length,1],{cr:1000,xp:150}],
['ships','Collectionneur','Possède 4 vaisseaux.','ship',()=>[G.owned.length,4],{cr:3000,xp:400}],
['base1','Baron planétaire','Fonde une base sur une planète.','pad',()=>[nk(G.bases),1],{cr:1500,xp:250}],
['base3','Empire minier','Possède 3 bases.','pad',()=>[nk(G.bases),3],{cr:6000,xp:900,ti:'Baron'}],
['Progression'],
['lv5','Pilote confirmé','Atteins le niveau 5.','star',()=>[lvl(),5],{cr:500,xp:0}],
['lv15','Vétéran','Atteins le niveau 15.','star',()=>[lvl(),15],{cr:4000,xp:0,ti:'Vétéran'}],
['lv30','Légende vivante','Atteins le niveau 30.','star',()=>[lvl(),30],{cr:15000,xp:0,ti:'Légende'}],
['rank4','Honoré','Atteins le rang « Honoré » dans une faction.','shield',()=>[Math.max(rankOf('alliance'),rankOf('guilde'),rankOf('carto')),4],{cr:5000,xp:600}],
['story','L\'Écho de Kepler','Termine la campagne.','book',()=>[G.story&&G.story.ch>=8?1:0,1],{cr:2000,xp:300}],
['fma','Bouclier de l\'Alliance','Termine les missions de l\'Alliance.','shield',()=>[xs('fm','alliance'),5],{cr:4000,xp:600,ti:'Bouclier de l\'Alliance'}],
['fmg','Cœur de la Guilde','Termine les missions de la Guilde.','tool',()=>[xs('fm','guilde'),5],{cr:4000,xp:600,ti:'Maître foreur'}],
['fmc','Au-delà du voile','Termine les missions des Cartographes.','map',()=>[xs('fm','carto'),5],{cr:4000,xp:600,ti:'Voyageur du voile'}],
['Activités'],
['hire','Escadrille','Recrute un ailier.','squad',()=>[STS.hire,1],{cr:300,xp:60}],
['wingk','Chef d\'escadrille','Tes ailiers cumulent 25 victoires.','squad',()=>[STS.wingk,25],{cr:3000,xp:400,ti:'Chef d\'escadrille'}],
['race','Pilote de course','Termine une course spatiale.','race',()=>[STS.races,1],{cr:300,xp:60}],
['gold','Médaille d\'or','Décroche une médaille d\'or en course.','trophy',()=>[STS.gold,1],{cr:1500,xp:250}],
['golds','Roi du circuit','Médaille d\'or sur 5 circuits différents.','trophy',()=>[STS.golds,5],{cr:6000,xp:900,ti:'Roi du circuit'}],
['wanted','Hors-la-loi','Aie une prime de 5 000 ¢ sur ta tête.','skull',()=>[xs('law','max'),5000],{cr:1000,xp:200,ti:'Hors-la-loi'}],
['hunt','Les chasseurs chassés','Abats 10 chasseurs de primes.','target',()=>[STS.k.hunter||0,10],{cr:4000,xp:600}],
['bat3','Héros de la frontière','Gagne 3 batailles de frontière.','swords',()=>[STS.bat,3],{cr:4000,xp:600,ti:'Héros de la frontière'}]];
const ACHL=ACH.filter(a=>a.length>1);for(const a of ACHL)a[5].cr=Math.round(a[5].cr*.5/50)*50;
function achCheck(){let n=0;for(const a of ACHL){if(ACHD[a[0]])continue;let p;try{p=a[4]()}catch(e){continue}if(p[0]>=p[1]){ACHD[a[0]]=Date.now();const r=a[5];if(r.cr)G.cr+=r.cr;if(r.xp)gainXP(r.xp);
banner('trophy','Succès : '+a[1],a[2]+' · +'+fmt(r.cr)+' ¢'+(r.ti?' · titre « '+r.ti+' »':''),'#ffc34d');SFX.win();n++;CXP.dirty=1}}if(n)save()}
let ACHT=2;TICK.push(dt=>{ACHT-=dt;if(ACHT<=0){ACHT=1.5;achCheck();if(CXP.open&&CXP.dirty){CXP.dirty=0;cxRender()}}});
const titles=()=>ACHL.filter(a=>ACHD[a[0]]&&a[5].ti).map(a=>a[5].ti).concat(G.x.xti||[]);
// ----- panneau Journal de bord (succès, codex, classement) -----
const CXP={open:false,tab:'ach',dirty:0};
function cxPct(){const pt=Object.keys(cxPlanets()).length,tot=7+Object.keys(CXT.en).length+Object.keys(CXT.an).length+Object.keys(CXT.fac).length+Object.keys(CHTXT).length+10+20+12;
const got=pt+nk(CX.en)+nk(CX.an)+nk(CX.fac)+Object.keys(CHTXT).filter(k=>CX.ch[k]).length+Math.min(10,nk(CX.log))+Math.min(20,nk(CX.sp))+Math.min(12,nk(CX.der||{}));return Math.min(100,Math.round(got/tot*100))}
function cxRender(){const el=$('cxpanel');if(!CXP.open)return;const nA=ACHL.filter(a=>ACHD[a[0]]).length;
let h=`<div class="phead"><b>${ICO('book')} Journal de bord</b><button id="cxx">${ICO('close')}</button></div><div class="cxtabs"><button data-cxt="ach" class="${CXP.tab=='ach'?'on':''}">${ICO('trophy')}Succès ${nA}/${ACHL.length}</button><button data-cxt="codex" class="${CXP.tab=='codex'?'on':''}">${ICO('book')}Codex ${cxPct()} %</button><button data-cxt="board" class="${CXP.tab=='board'?'on':''}">${ICO('star')}Classement</button></div>`;
if(CXP.tab=='ach'){const T=titles();h+=`<div class="psec"><label class="orow"><span>Titre affiché</span><select id="cxti"><option value="">Aucun</option>${T.map(x=>`<option ${G.x.title==x?'selected':''}>${esc(x)}</option>`).join('')}</select></label>${T.length?'':'<small>Certains succès débloquent un titre, affiché dans ton profil et les classements.</small>'}</div>`;
for(const a of ACH){if(a.length==1){h+=`<div class="psec cxh"><b class="pt">${a[0]}</b></div>`;continue}const ok=ACHD[a[0]];let p=[0,1];try{p=a[4]()}catch(e){}const k=clamp(p[0]/p[1],0,1),r=a[5];
h+=`<div class="ach ${ok?'ok':''}">${ICO(ok?'trophy':a[3])}<div><b>${a[1]}</b><small>${a[2]}</small>${ok?`<em>Obtenu · +${fmt(r.cr)} ¢${r.ti?' · titre « '+esc(r.ti)+' »':''}</em>`:`<span class="pbar" style="color:#ffc34d"><i style="width:${(k*100).toFixed(1)}%"></i></span><em>${fmt(Math.min(p[0],p[1])|0)} / ${fmt(p[1])} · récompense ${fmt(r.cr)} ¢${r.ti?' + titre':''}</em>`}</div></div>`}}
else if(CXP.tab=='codex'){const P=cxPlanets();h+=`<div class="psec"><b class="pt">${ICO('planet')} Planètes · ${G.disc.size} découvertes</b>`;for(const ty in CXT.pl){const L=P[ty];h+=`<div class="cxe ${L?'':'unk'}"><b>${L?ty:'???'}</b><small>${L?CXT.pl[ty]+`<br><em>${L.length} : ${L.slice(0,6).map(esc).join(', ')}${L.length>6?'…':''}</em>`:'Type de planète pas encore découvert.'}</small></div>`}h+='</div>';
const sp=Object.entries(CX.sp);h+=`<div class="psec"><b class="pt">${ICO('leaf')} Espèces · ${sp.length}</b>${sp.length?sp.slice(-24).reverse().map(([n,o])=>`<div class="cxe"><b>${esc(n)}</b><small>${o.big?'Grand herbivore':'Herbivore grégaire'} des mondes ${esc(o.ty||'?')} · vue sur ${esc(o.pl||'?')}</small></div>`).join(''):'<small>Sur une planète, approche-toi d\'un troupeau à pied et scanne-le.</small>'}</div>`;
h+=`<div class="psec"><b class="pt">${ICO('target')} Bestiaire ennemi</b>`;for(const k in CXT.en){const o=CX.en[k];h+=`<div class="cxe ${o?'':'unk'}"><b>${o?CXT.en[k][0]:'???'}</b><small>${o?CXT.en[k][1]+`<br><em>Abattus : ${fmt(STS.k[k]||0)}</em>`:'Pas encore rencontré.'}</small></div>`}h+='</div>';
h+=`<div class="psec"><b class="pt">${ICO('vortex')} Phénomènes</b>`;for(const k in CXT.an){const o=CX.an[k];h+=`<div class="cxe ${o?'':'unk'}"><b>${o?CXT.an[k][0]:'???'}</b><small>${o?CXT.an[k][1]:'Pas encore observé.'}</small></div>`}h+='</div>';
h+=`<div class="psec"><b class="pt">${ICO('shield')} Factions</b>`;for(const k in CXT.fac){const o=CX.fac[k];h+=`<div class="cxe ${o?'':'unk'}"><b>${o?CXT.fac[k][0]:'???'}</b><small>${o?CXT.fac[k][1]:'Faction inconnue.'}</small></div>`}h+='</div>';
const chs=Object.keys(CX.ch).filter(k=>CHAR[k]);h+=`<div class="psec"><b class="pt">${ICO('user')} Personnages · ${chs.length}</b>${chs.map(k=>`<div class="cxe"><b>${CHAR[k].ic} ${esc(CHAR[k].n)}</b><small>${CHTXT[k]||CHAR[k].d||''}</small></div>`).join('')||'<small>Personne pour l\'instant.</small>'}</div>`;
const lg=Object.values(CX.log).sort((a,b)=>b.t-a.t);h+=`<div class="psec"><b class="pt">${ICO('terminal')} Journaux retrouvés · ${lg.length}</b>${lg.map(o=>`<div class="cxe"><small>${esc(o.txt)}${o.src?`<br><em>${esc(o.src)}</em>`:''}</small></div>`).join('')||'<small>Fouille les bunkers et les épaves géantes.</small>'}</div>`}
else h+=typeof boardHTML=='function'?boardHTML():'<div class="psec"><small>Classement indisponible.</small></div>';
el.innerHTML=h;$('cxx').onclick=()=>cxToggle(false);el.querySelectorAll('[data-cxt]').forEach(b=>b.onclick=()=>{CXP.tab=b.dataset.cxt;if(CXP.tab=='board'&&typeof boardFetch=='function')boardFetch();cxRender();SFX.tick()});
const ts=$('cxti');if(ts)ts.onchange=()=>{G.x.title=ts.value;save();toast(ts.value?'Titre : '+ts.value:'Aucun titre')};if(typeof boardBind=='function'&&CXP.tab=='board')boardBind(el)}
function cxToggle(v){CXP.open=v==null?!CXP.open:v;$('cxpanel').style.display=CXP.open?'flex':'none';$('cxb').classList.toggle('on',CXP.open);if(CXP.open){if(PROF.open)profToggle(false);if(OPTP.open)optToggle(false);if(CXP.tab=='board'&&typeof boardFetch=='function')boardFetch();cxRender()}}
$('cxb').onclick=()=>cxToggle();addEventListener('keydown',e=>{if(e.target.tagName=='INPUT'||e.target.tagName=='SELECT'||e.repeat)return;if(e.code=='KeyJ')cxToggle();if(e.code=='Escape'&&CXP.open)cxToggle(false)});
{const _pt=profToggle;profToggle=function(v){_pt(v);if(PROF.open&&CXP.open)cxToggle(false)}}
// le profil affiche le titre et le codex
{const _pr=profRender;profRender=function(){_pr();const hd=$('prof').querySelector('.phead b');if(hd&&G.x.title)hd.insertAdjacentHTML('beforeend',` <i class="ptitle">« ${esc(G.x.title)} »</i>`);const sec=document.createElement('div');sec.className='psec';sec.innerHTML=`<b class="pt">Journal de bord</b><small>${ACHL.filter(a=>ACHD[a[0]]).length}/${ACHL.length} succès · codex complété à ${cxPct()} %</small><div class="obtns"><button id="profcx">${ICO('book')} Ouvrir le journal</button></div>`;$('prof').appendChild(sec);$('profcx').onclick=()=>cxToggle(true)}}
