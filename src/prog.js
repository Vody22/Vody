// ===== PROGRESSION : vrais prix, niveau de pilote, réputation des factions, plans et fabrication, entrepôt, profil =====
// ----- prix des pièces et recettes de fabrication (les meilleures pièces ne s'achètent pas : elles se fabriquent) -----
const PPRICE={paint:{arctique:1200,corsaire:1500,toxique:1800,furtif:2400,neon:3000},nose:{radar:3500,eperon:4500},wings:{delta:4000,blindees:5500},eng:{ion:5000,triple:8000},guns:{jumeles:6000,lourds:7500,rotatifs:11000},armor:{composite:4500,reactif:9000},shield:{leger:4000,tactique:8500},focus:{cryo:4500,surcharge:7500,prisme:13000},cargo:{pods:3500,ventral:7500}};
for(const s in PPRICE)for(const id in PPRICE[s])PARTS[s].o[id].p=PPRICE[s][id];
const CRAFT={'paint:royal':{m:{or:10,lux:2},fee:1500,lv:3},'nose:chasse':{m:{titane:8,cristal:4,elec:3},fee:2500,lv:5},'wings:lames':{m:{titane:10,metal:6},fee:3000,lv:6},'armor:nano':{m:{titane:14,herbes:6,cristal:6},fee:6500,lv:8},
'eng:fusion':{m:{cristal:10,or:4,elec:6},fee:6000,lv:9},'guns:plasma':{m:{cristal:12,or:6,elec:8},fee:8000,lv:10},'shield:egide':{m:{cristal:14,or:8,elec:6},fee:9000,lv:11},'focus:solaire':{m:{cristal:16,or:10},fee:10000,lv:12}};
for(const k in CRAFT){const[s,id]=k.split(':');PARTS[s].o[id].craft=CRAFT[k];PARTS[s].o[id].p=0}
const CRAFT_AMMO={missile:{m:{titane:3,elec:1},fee:200,lv:2},mine:{m:{fer:5},fee:120,lv:2}};
const STASH_CAP=300;
// ----- niveau de pilote -----
const XPN=k=>Math.round(120+70*Math.pow(k-1,1.45));
function lvInfo(xp=G.xp||0){let L=1,acc=0;while(L<60&&xp>=acc+XPN(L)){acc+=XPN(L);L++}return{L,cur:xp-acc,need:XPN(L)}}
const lvl=()=>lvInfo().L;
function gainXP(n){n=Math.round(n||0);if(n<=0)return;const a=lvl();G.xp=(G.xp||0)+n;XPF.v=1;XPF.n+=n;const b=lvl();if(b>a){const bonus=150*b;G.cr+=bonus;setTimeout(()=>{toast('⭐ Niveau '+b+' atteint ! Prime de '+bonus.toLocaleString('fr-FR')+' ¢');SFX.win()},400);save()}}
const XPF={v:0,n:0};
// ----- réputation -----
const FAC={alliance:{n:'Alliance stellaire',ic:'shield',d:'Missions des stations et chasse aux pirates',perk:r=>r?`−${r*3} % sur les vaisseaux, armes, pièces et améliorations`:'Aucun avantage pour l\'instant'},
guilde:{n:'Guilde des mineurs',ic:'tool',d:'Minage, vente de minerais, quêtes et bases',perk:r=>r?`+${r*4} % sur la vente de minerais, −${r*5} % de frais de fabrication`:'Aucun avantage pour l\'instant'},
carto:{n:'Cartographes',ic:'map',d:'Découvertes, espèces, monolithes, bunkers, caisses',perk:r=>r?`+${r*3} % de chances de trouver des plans, −${r*8} % sur les sauts rapides`:'Aucun avantage pour l\'instant'}};
const RANKS=[0,200,600,1500,3500,8000],RANKN=['Inconnu','Connu','Apprécié','Respecté','Honoré','Légende'];
const rankOf=f=>{const v=(G.rep&&G.rep[f])||0;let r=0;while(r<5&&v>=RANKS[r+1])r++;return r};
function addRep(f,n){n=Math.round(n||0);if(n<=0||!G.rep)return;const a=rankOf(f);G.rep[f]=(G.rep[f]||0)+n;const b=rankOf(f);if(b>a){setTimeout(()=>{toast('🎖 '+FAC[f].n+' : rang « '+RANKN[b]+' »');SFX.win()},700);applyPerks()}}
function applyPerks(){const da=1-rankOf('alliance')*.03,r10=v=>Math.round(v/10)*10;
for(const s in PARTS)for(const id in PARTS[s].o){const o=PARTS[s].o[id];if(o.p0==null)o.p0=o.p;if(!o.craft)o.p=r10(o.p0*da)}
for(const id in HULLS){const H=HULLS[id];if(H.p0==null)H.p0=H.price;H.price=r10(H.p0*da)}for(const id in WPN){const W=WPN[id];if(W.p0==null)W.p0=W.price;W.price=r10(W.p0*da)}
for(const k in AMMO){const A=AMMO[k];if(A.p0==null)A.p0=A.price;A.price=r10(A.p0*da)}SELLK=1+rankOf('guilde')*.04;TRAVK=1-rankOf('carto')*.08}
function upCost(i){return Math.round(600*Math.pow(G.u[i],1.6)*(1-rankOf('alliance')*.03)/50)*50}
// ----- plans -----
const bpName=k=>{const[s,id]=k.split(':');return PARTS[s].o[id].n};
function giveBlueprint(){const all=Object.keys(CRAFT).filter(k=>!G.bp.includes(k)&&!G.pown.includes(k));if(!all.length){G.cr+=900;toast('🎁 +900 ¢');SFX.coin();return}
const k=all[Math.random()*all.length|0];G.bp.push(k);toast('📐 Plan trouvé : '+bpName(k)+' — à fabriquer dans l\'onglet Fabrication');SFX.win();gainXP(40);save()}
giveRarePart=giveBlueprint;
// ----- matériaux : soute + entrepôt -----
const matG=id=>GOODS.find(g=>g.id==id)||(window.ILLG||[]).find(g=>g.id==id)||(window.RAREG||[]).find(g=>g.id==id)||{n:id,ic:'▫'};
const haveMat=id=>(G.cargo[id]||0)+(G.stash[id]||0);
const stashUsed=()=>Object.values(G.stash).reduce((a,b)=>a+b,0);
function useMats(m){for(const[id,q]of Object.entries(m)){let n=q;const c=Math.min(n,G.cargo[id]||0);if(c){G.cargo[id]-=c;n-=c;if(!G.cargo[id])delete G.cargo[id]}if(n>0){G.stash[id]-=n;if(G.stash[id]<=0)delete G.stash[id]}}}
const craftFee=R=>Math.round(R.fee*(1-rankOf('guilde')*.05)/10)*10;
const matsOk=m=>Object.entries(m).every(([id,q])=>haveMat(id)>=q);
function craftPart(k){const R=CRAFT[k];if(!R)return;if(G.pown.includes(k)){toast('Tu possèdes déjà cette pièce');return}if(lvl()<R.lv){toast('Niveau '+R.lv+' requis');return}if(!G.bp.includes(k)){toast('Il te faut le plan : fouille les épaves, les caisses, les bunkers et bats des boss');return}
const fee=craftFee(R);if(!matsOk(R.m)){toast('Matériaux insuffisants');SFX.tick();return}if(G.cr<fee){toast('Pas assez de crédits');return}G.cr-=fee;useMats(R.m);G.pown.push(k);const[s,id]=k.split(':');
toast('🔧 Fabriqué : '+PARTS[s].o[id].n+' ! Installe-le à l\'Atelier');SFX.win();gainXP(120);addRep('guilde',40);save()}
function craftAmmo(id){const R=CRAFT_AMMO[id];if(!G.w.includes(id)){toast('Achète d\'abord l\'arme '+WPN[id].n);return}if(!matsOk(R.m)){toast('Matériaux insuffisants');return}const fee=craftFee(R);if(G.cr<fee){toast('Pas assez de crédits');return}G.cr-=fee;useMats(R.m);G.ammo[id]=(G.ammo[id]||0)+AMMO[id].q;toast('🔧 +'+AMMO[id].q+' '+(id=='missile'?'missiles':'mines'));SFX.coin();gainXP(10)}
function stashMove(dir,id){if(dir=='in'){const c=G.cargo[id]||0,n=Math.min(c,STASH_CAP-stashUsed());if(n<=0){toast(c?'Entrepôt plein':'Rien à déposer');return}G.cargo[id]-=n;if(!G.cargo[id])delete G.cargo[id];G.stash[id]=(G.stash[id]||0)+n;toast('Déposé : '+n+' '+matG(id).n)}
else{const s=G.stash[id]||0,n=Math.min(s,cap()-cargoUsed());if(n<=0){toast(s?'Soute pleine':'Rien à retirer');return}G.stash[id]-=n;if(!G.stash[id])delete G.stash[id];G.cargo[id]=(G.cargo[id]||0)+n;toast('Retiré : '+n+' '+matG(id).n)}SFX.tick();save()}
// ----- boutique : onglets Fabrication et Entrepôt, verrous de niveau et de réputation -----
TABS.push(['craft','Fabrication'],['stash','Entrepôt']);
const reqTxt=o=>{if(o.lv&&lvl()<o.lv)return'Niveau '+o.lv;if(o.rep&&rankOf(o.rep[0])<o.rep[1])return FAC[o.rep[0]].n.split(' ')[0]+' : '+RANKN[o.rep[1]];return''};
const fmt=n=>n.toLocaleString('fr-FR');
const _svP=shopView;shopView=function(){const st=S.docked;if(!st)return'';const row=(l,r)=>`<div class="srow">${l}<span>${r}</span></div>`;
if(TAB=='ships')return Object.entries(HULLS).map(([id,H])=>{const own=G.owned.includes(id),cur=G.ship==id,lk=!own&&reqTxt(H);return row(`<div><b>${H.n}</b>${cur?' <i class="tag">actuel</i>':''}<small>${H.desc}<br>Coque ×${H.hp} · Vitesse ×${H.spd} · Soute ${H.cap} · Armes ×${H.dmg}</small></div>`,cur?'✓':lk?`<button class="dim" data-act="lock:${lk}">🔒 ${lk}</button>`:`<button data-act="ship:${id}" ${!own&&G.cr<H.price?'class="dim"':''}>${own?'Piloter':fmt(H.price)+' ¢'}</button>`)}).join('');
if(TAB=='weap')return Object.entries(WPN).map(([id,W])=>{const own=G.w.includes(id),am=W.am,lk=!own&&reqTxt(W);return row(`<div><b>${W.ic} ${W.n}</b>${curW()==id?' <i class="tag">équipé</i>':''}<small>${W.d}${am&&own?`<br>Munitions : ${G.ammo[am]}`:''}</small></div>`,(own?(am?`<button data-act="ammo:${am}" ${G.cr<AMMO[am].price?'class="dim"':''}>+${AMMO[am].q} · ${fmt(AMMO[am].price)} ¢</button>`:'')+(curW()!=id?`<button data-act="wpn:${id}">Équiper</button>`:''):lk?`<button class="dim" data-act="lock:${lk}">🔒 ${lk}</button>`:`<button data-act="wpn:${id}" ${G.cr<W.price?'class="dim"':''}>${fmt(W.price)} ¢</button>`))}).join('')+`<div class="hint">${DESK?'<kbd>Q</kbd> ou molette':'Bouton arme'} pour changer d'arme en vol</div>`;
if(TAB=='craft'){const L=lvl();let h=`<div class="hint">Les meilleures pièces se fabriquent avec un <b>plan</b>, des matériaux (soute + entrepôt) et des crédits.</div>`;
for(const k in CRAFT){const[s,id]=k.split(':'),o=PARTS[s].o[id],R=CRAFT[k],own=G.pown.includes(k),bp=G.bp.includes(k),fee=craftFee(R);
const mats=Object.entries(R.m).map(([m,q])=>{const hv=haveMat(m);return `<i class="${hv>=q?'good':'bad'}">${matG(m).ic} ${Math.min(hv,q)}/${q}</i>`}).join(' ');const lk=L<R.lv?'Niveau '+R.lv:!bp?'Plan manquant':'';
h+=row(`<div><b>${o.n}</b>${own?' <i class="tag">possédée</i>':bp?' <i class="tag pvt">plan</i>':''}<small>${o.d}<br>${mats} · ${fmt(fee)} ¢</small></div>`,own?'✓':lk?`<button class="dim" data-act="lock:${lk}">🔒 ${lk}</button>`:`<button data-act="craft:${k}" ${matsOk(R.m)&&G.cr>=fee?'':'class="dim"'}>Fabriquer</button>`)}
for(const id in CRAFT_AMMO){const R=CRAFT_AMMO[id],mats=Object.entries(R.m).map(([m,q])=>{const hv=haveMat(m);return `<i class="${hv>=q?'good':'bad'}">${matG(m).ic} ${Math.min(hv,q)}/${q}</i>`}).join(' ');
h+=row(`<div><b>${WPN[id].ic} ${AMMO[id].n}</b><small>${mats} · ${fmt(craftFee(R))} ¢</small></div>`,`<button data-act="cammo:${id}" ${matsOk(R.m)&&G.w.includes(id)?'':'class="dim"'}>Fabriquer</button>`)}return h}
if(TAB=='stash'){let h=`<div class="hint">Entrepôt personnel : <b>${stashUsed()}/${STASH_CAP}</b> · le même dans toutes les stations et tes bases</div>`;const ids=[...new Set([...Object.keys(G.cargo),...Object.keys(G.stash)])].filter(id=>(G.cargo[id]||0)+(G.stash[id]||0)>0);
for(const id of ids){const g=matG(id),c=G.cargo[id]||0,sv=G.stash[id]||0;h+=row(`<div><b>${g.ic} ${g.n}</b><small>Soute ${c} · Entrepôt ${sv}</small></div>`,`${c?`<button data-act="stash:in:${id}">Déposer</button>`:''}${sv?`<button data-act="stash:out:${id}">Retirer</button>`:''}`)}
if(!ids.length)h+='<div class="hint">Ta soute et ton entrepôt sont vides.</div>';return h}
return _svP()};
$('shop').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const a=b.dataset.act||'';const[k,v,w]=a.split(':');
if(k=='craft')craftPart(v+':'+w);else if(k=='cammo')craftAmmo(v);else if(k=='stash')stashMove(v,w);else if(k=='tab'){TAB=v}else if(k=='lock'){toast('🔒 '+v+' requis');SFX.tick()}else return;HC.shopV=null});
// achats bloqués par le niveau ou la réputation
{const _bs=buyShip;buyShip=function(id){const H=HULLS[id];if(!G.owned.includes(id)){const lk=reqTxt(H);if(lk){toast('🔒 '+lk+' requis');return}}_bs(id)}}
{const _bw=buyWeapon;buyWeapon=function(id){const W=WPN[id];if(!G.w.includes(id)){const lk=reqTxt(W);if(lk){toast('🔒 '+lk+' requis');return}}_bw(id)}}
{const _bp=buyPart;buyPart=function(s,id){const o=PARTS[s].o[id];if(o&&o.craft&&!G.pown.includes(s+':'+id)){TAB='craft';HC.shopV=null;toast('Cette pièce se fabrique (onglet Fabrication)');return}_bp(s,id)}}
// ----- récompenses : expérience, réputation, crédits en plus -----
{const _he=hitEnemy;hitEnemy=function(e,d,p){const was=e.dead;_he(e,d,p);if(!was&&e.dead){const z=1+danger()*.25;G.cr+=Math.round(e.rw*.5);gainXP(({chasseur:15,pirate:20,lourd:45,boss:120}[e.ty]||20)*z);addRep('alliance',e.boss?15:e.ty=='lourd'?8:4);if(e.boss&&Math.random()<.25+rankOf('carto')*.03)setTimeout(giveBlueprint,1200)}}}
{const _cp=complete;complete=function(){const m=G.m;if(m)m.rw=Math.round(m.rw);_cp();if(m){gainXP(70+m.rw/12);addRep('alliance',40)}}}
{const _mo=makeOffer;makeOffer=function(){const o=_mo();if(o&&!o.boosted){o.rw=Math.round(o.rw*1.7/5)*5;o.boosted=1}return o}}
{const _tr=trade;trade=function(id,q){const before=G.cargo[id]||0,cr0=G.cr;_tr(id,q);const sold=before-(G.cargo[id]||0);if(q<0&&sold>0){const g=matG(id);if(g.min){gainXP(sold);addRep('guilde',sold*2)}else gainXP((G.cr-cr0)/150)}}}
{const _mt=minToast;minToast=function(){let n=0;for(const k in MINQ)n+=MINQ[k];if(n){gainXP(n*2);addRep('guilde',n)}_mt()}}
{const _ee=endEvent;endEvent=function(win){if(win){gainXP(60);addRep('alliance',20)}_ee(win)}}
{const _sb=storyBossDone;storyBossDone=function(){gainXP(500);addRep('alliance',200);_sb();setTimeout(giveBlueprint,4000)}}
{const _qt=questTalk;questTalk=function(n){const had=G.pq;_qt(n);if(had&&!G.pq){gainXP(150);addRep('guilde',60);G.cr+=300}}}
{const _ra=exRevealAll;exRevealAll=function(){_ra();gainXP(40);addRep('carto',30);if(Math.random()<.4+rankOf('carto')*.03)setTimeout(giveBlueprint,3000)}}
{const _rr=exRevealAround;exRevealAround=function(p,R){if(R>=700){gainXP(60);addRep('carto',40)}return _rr(p,R)}}
// butin récupéré sur les planètes (caisses, épaves, espèces, cristaux, artefacts)
const LOOTW={c:null};function lootCount(){const c={k:0,w:0,sp:0,c:0,a:0};for(const pl in G.loot)for(const id of G.loot[pl]){const k=id.startsWith('sp')?'sp':id[0];if(c[k]!=null)c[k]++}return c}
function lootWatch(){const c=lootCount();if(!LOOTW.c){LOOTW.c=c;return}const o=LOOTW.c,d=k=>c[k]-o[k];
if(d('k')>0){gainXP(10*d('k'));addRep('carto',4*d('k'));if(Math.random()<rankOf('carto')*.03)setTimeout(giveBlueprint,1500)}if(d('w')>0){gainXP(25);addRep('guilde',10)}if(d('sp')>0){gainXP(30*d('sp'));addRep('carto',20*d('sp'))}if(d('c')>0)gainXP(3*d('c'));if(d('a')>0){gainXP(50);addRep('carto',30)}LOOTW.c=c}
// ----- chargement : avantages, message de changement d'économie -----
{const _ld=load;load=function(){const r=_ld();applyPerks();LOOTW.c=null;if(G.ecoReset){G.ecoReset=0;setTimeout(()=>toast('💰 Fin de l\'argent illimité : tu repars avec '+fmt(G.cr)+' ¢. Missions, minage et commerce rapportent de vrais crédits.'),4500)}return r}}
applyPerks();
// ----- HUD : niveau et barre d'expérience -----
const _hudP=hud;hud=function(){_hudP();const I=lvInfo();setH('lvt','Niv. '+I.L);setW('xpb',I.cur/I.need);if(XPF.v>0){XPF.v=Math.max(0,XPF.v-DT*.8);const s=XPF.v>.02?'+'+XPF.n+' XP':'';setH('xpg',s);if(!s)XPF.n=0}LOOTW.t=(LOOTW.t||0)-DT;if(LOOTW.t<=0){LOOTW.t=1;lootWatch()}if(PROF.open&&Math.random()<.05)profRender()};
// ----- panneau Profil -----
const PROF={open:false};
function profRender(){const I=lvInfo(),bar=(k,c)=>`<span class="pbar" style="color:${c}"><i style="width:${(clamp(k,0,1)*100).toFixed(1)}%"></i></span>`;let h=`<div class="phead"><b>${ICO('user')} Profil du pilote</b><button id="profx">${ICO('close')}</button></div>`;
h+=`<div class="psec"><div class="plv"><b>Niveau ${I.L}</b><span>${fmt(I.cur)} / ${fmt(I.need)} XP</span></div>${bar(I.cur/I.need,'#ffc34d')}<small>Gagne de l'expérience en combattant, en minant, en explorant et en réussissant des missions.</small></div>`;
h+=`<div class="psec"><b class="pt">Réputation</b>`;for(const f in FAC){const r=rankOf(f),v=G.rep[f]||0,a=RANKS[r],b=RANKS[Math.min(5,r+1)],k=r>=5?1:(v-a)/(b-a);h+=`<div class="pfac">${ICO(FAC[f].ic)}<div><b>${FAC[f].n}</b> · ${RANKN[r]}${bar(k,'#7ab6ff')}<small>${FAC[f].d}<br><em>${FAC[f].perk(r)}</em></small></div></div>`}h+='</div>';
const nb=Object.keys(CRAFT).length,got=Object.keys(CRAFT).filter(k=>G.bp.includes(k)||G.pown.includes(k));h+=`<div class="psec"><b class="pt">Plans de fabrication · ${got.length}/${nb}</b><small>${got.length?got.map(bpName).join(' · '):'Aucun plan pour l\'instant : fouille les épaves, les caisses et les bunkers, et bats des boss.'}</small></div>`;
const bs=Object.keys(G.bases||{});h+=`<div class="psec"><b class="pt">Bases · ${bs.length}/3</b><small>${bs.length?bs.join(' · '):'Aucune base. Sur une planète, sors du vaisseau et établis-en une (niveau 3).'}</small></div>`;
h+=`<div class="psec pst"><span>${ICO('target')}<b>${G.kills}</b> ennemis</span><span>${ICO('check')}<b>${G.done}</b> missions</span><span>${ICO('planet')}<b>${G.disc.size}</b> planètes</span><span>${ICO('cargo')}<b>${stashUsed()}</b> en entrepôt</span></div>`;
$('prof').innerHTML=h;$('profx').onclick=()=>profToggle(false)}
function profToggle(v){PROF.open=v==null?!PROF.open:v;$('prof').style.display=PROF.open?'flex':'none';$('profb').classList.toggle('on',PROF.open);if(PROF.open)profRender()}
$('profb').onclick=()=>profToggle();addEventListener('keydown',e=>{if(e.target.tagName=='INPUT'||e.repeat)return;if(e.code=='KeyP')profToggle()});
