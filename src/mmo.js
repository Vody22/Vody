// ===== RÉSEAU GALACTIQUE (couche MMO) =====
// - zones : le salon temps réel public (netroom.js) est découpé en régions de 36 km dans l'espace (centrées sur l'origine : la Base Alpha est au milieu de la sienne) et un salon par planète ;
//   bascule automatique (avec marge) quand on voyage. Salon privé (#code) = pas de zones.
// - serveur /api/mmo (Redis) : identité de pilote (G.x.mmo {pid,key}, suit la sauvegarde cloud), pilotes en ligne dans toute la galaxie,
//   discussion Galaxie / Guilde, guildes (tag sur les noms, niveau = bonus d'XP), chantier commun de la semaine.
// État : MMO ; synchro `mmSync` toutes les 20 s (5 s quand le panneau est ouvert), uniquement si API_OK et la page visible.
const MMO={on:false,tab:'zone',ch:'g',list:[],gal:[],gch:[],cg:0,cc:0,guild:null,pr:null,gx:0,busy:false,syncAt:performance.now()+2500,err:'',glist:null,zone:null,zoneC:'',zoneCand:null,zoneHold:0,zoneT:-99,unread:0,first:true,col:'#ffc34d',lastOk:0};
const MZ=36000,MMCOLS=['#7ab6ff','#ff7a7a','#ffc34d','#7dffb0','#c79bff','#ff9a3d','#5ef0ff','#ff7ad9'],MMORE=['fer','titane','cristal','or'],MMPTS={fer:1,titane:2,cristal:3,or:6},MMGCOST=5000;
function mmId(){const o=GX('mmo',{});if(!/^[a-z0-9]{12}$/.test(o.pid||'')||!/^[a-z0-9]{24}$/.test(o.key||'')){const r=n=>{let s='';while(s.length<n)s+=Math.random().toString(36).slice(2);return s.slice(0,n)};o.pid=r(12);o.key=r(24);try{save()}catch(e){}}return{pid:o.pid,key:o.key}}
async function mmApi(a,body){return api('/api/mmo',{a,...mmId(),...(body||{})})}
const mmEsc=s=>String(s==null?'':s).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const mmCol=c=>MMCOLS.includes(c)?c:'#ffc34d';
const mmGL=xp=>Math.min(20,1+Math.floor(Math.sqrt(Math.max(0,xp)/400))),mmGX=L=>400*(L-1)*(L-1);
const mmBonus=()=>MMO.guild?Math.min(10,MMO.guild.lv-1)*2:0;

// ----- zones -----
function netZone(){if(mode=='int')return null;if(mode=='vox'){const n=vxPName();if(!n)return null;const s=String(n).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,18);return{c:'v-'+(s||'monde'),n,surf:1}}
if(mode=='surf'){const I=SURF.info&&SURF.info();if(!I||!I.name)return null;const s=String(I.name).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,18);return{c:'p-'+(s||'monde'),n:I.name,surf:1}}
const a=Math.floor((S.pos.x+MZ/2)/MZ),b=Math.floor((S.pos.z+MZ/2)/MZ),f=v=>v<0?'m'+(-v):''+v;
return{c:'z'+f(a)+'x'+f(b),n:'Région '+String(secName((a*3)+','+(b*3))).replace(/^Secteur /,''),a,b}}
function mmInside(z){if(!z||z.surf||z.a==null)return 1e9;const x=S.pos.x+MZ/2-z.a*MZ,y=S.pos.z+MZ/2-z.b*MZ;return Math.min(x,MZ-x,y,MZ-y)}
function mmZoneTick(dt){const R=MP.room;if(!R||!R.switchTo||R.priv)return;if(!MMO.zone){MMO.zone=netZone();MMO.zoneC=R.code;if(MMO.zone&&MMO.zone.c!==R.code){R.switchTo(MMO.zone.c)&&mmZoneSwitched()}return}
const z=netZone();if(!z||z.c===MMO.zoneC){MMO.zoneHold=0;return}
// marge : dans l'espace, il faut être à plus de 1,5 km à l'intérieur de la nouvelle région pendant 2 s (pas de va-et-vient sur la frontière)
if(!z.surf&&!MMO.zone.surf&&mmInside(z)<1500){MMO.zoneHold=0;return}
if(!MMO.zoneHold)MMO.zoneHold=performance.now();if(performance.now()-MMO.zoneHold<(z.surf||MMO.zone.surf?500:2000))return;MMO.zoneHold=0;MMO.zone=z;if(R.switchTo(z.c))mmZoneSwitched();MMO.zoneC=R.code}
function mmZoneSwitched(){MMO.zoneT=performance.now();MMO.zoneC=MP.room.code;MP.net=MP.room.code;if(MMO.zone)mpFeed('🛰','Zone : '+MMO.zone.n,'#9cf');mpUI();mmSoon(1500)}
// pas de « X a rejoint / quitté » en rafale pendant un changement de zone
{const _f=mpFeed;mpFeed=function(who,txt,col){if(who=='👋'&&performance.now()-MMO.zoneT<6000)return;_f(who,txt,col)}}

// ----- identité visible par les autres : tag de guilde + niveau -----
{const _mo=mpExtraOut;mpExtraOut=function(){const o=_mo();if(MMO.guild){o.gt=MMO.guild.tag;o.gc=MMO.guild.col}o.lv=lvl();return o}}
{const _mpp=mpPeer;mpPeer=function(p){_mpp(p);if(p.kind!='viewer'||p.sameTab)return;const o=MP.others.get(p.peer),pr=p.presence||{};if(!o)return;o.gt=typeof pr.gt=='string'?pr.gt.replace(/[^A-Z0-9]/g,'').slice(0,4):'';o.gc=mmCol(pr.gc);o.lv=clamp(pr.lv|0,0,60)}}
{const _mn=mpName;mpName=function(o){const n=_mn(o);return o&&o.gt?'['+o.gt+'] '+n:n}}
// bonus d'XP de guilde + contribution à la guilde
{const _gx=gainXP;gainXP=function(n){n=Math.round(n||0);if(n>0&&MMO.guild){n=Math.round(n*(1+mmBonus()/100));MMO.gx=Math.min(5000,MMO.gx+n)}_gx(n)}}

// ----- synchro avec le serveur -----
function mmMe(){const z=MMO.zone||netZone()||{c:'',n:''},I=mode=='surf'&&SURF.info?SURF.info():null;return{n:MP.nick||'Pilote',h:MP.hue,lv:lvl(),sh:G.ship,z:z.c,zn:z.n,m:mode,pl:I?I.name:'',x:S.pos.x,y:S.pos.y,zz:S.pos.z}}
async function mmSync(){if(MMO.busy||!API_OK)return;MMO.busy=true;const gx=Math.min(400,MMO.gx);MMO.gx-=gx;
try{const r=await mmApi('sync',{me:mmMe(),gx,cg:MMO.cg,cc:MMO.cc});if(r.err)throw new Error(r.err);MMO.on=true;MMO.err='';MMO.lastOk=t;
 MMO.list=r.on||[];const hadG=MMO.guild&&MMO.guild.id,newG=r.guild;MMO.guild=newG;if(hadG&&!newG)toast('🏳 Tu ne fais plus partie de ta guilde');if(!hadG||!newG||hadG!==newG.id)MMO.gch=[],MMO.cc=0;
 mmMerge('g',r.g||[]);mmMerge('c',r.c||[]);
 if(r.pr){const was=MMO.pr&&MMO.pr.done;MMO.pr=r.pr;if(!was&&r.pr.done&&!MMO.first&&r.pr.my>0)banner('station','Chantier commun terminé !',r.pr.n+' est construit. Récupère ta récompense dans le Réseau galactique.','#6f9')}
 if(MMO.first){MMO.first=false;if(!GX('newsMMO',0)){G.x.newsMMO=1;setTimeout(()=>banner('squad','Réseau galactique','Pilotes en ligne, discussion de la galaxie, guildes et chantier commun : touche T ou bouton 👥.','#7ab6ff'),2500)}}
 mmPaint()}catch(e){MMO.gx+=gx;MMO.err=String(e.message||e);if(MMO.tab!='zone')mmPaint()}finally{MMO.busy=false}}
function mmMerge(ch,arr){if(!arr.length)return;const L=ch=='g'?MMO.gal:MMO.gch,seen=new Set(L.map(m=>m.i)),me=mmId().pid;let nw=0;
for(const m of arr){if(!m||seen.has(m.i))continue;L.push(m);seen.add(m.i);if(ch=='g')MMO.cg=Math.max(MMO.cg,m.i);else MMO.cc=Math.max(MMO.cc,m.i);
 if(!MMO.first&&m.p!==me&&!(m.t&&Date.now()-m.t>120e3)){nw++;const who=(ch=='g'?'🌌 ':'')+(m.gt?'['+m.gt+'] ':'')+m.n;if(!(MP.panel&&MMO.tab=='chat'&&MMO.ch==ch))mpFeed(who,m.tx,ch=='c'?mmCol(MMO.guild&&MMO.guild.col):`hsl(${m.h|0},70%,70%)`)}}
L.sort((a,b)=>a.i-b.i);if(L.length>80)L.splice(0,L.length-80);if(nw&&!(MP.panel&&MMO.tab=='chat')){MMO.unread+=nw;mpUI()}}
const mmSoon=ms=>{MMO.syncAt=Math.min(MMO.syncAt,performance.now()+ms)};
TICK.push(dt=>{if(!MP.room)return;mmZoneTick(dt);if(!API_OK)return;if(document.hidden)return;const now=performance.now();if(now>=MMO.syncAt){const fast=MP.panel&&MMO.tab!='zone';MMO.syncAt=now+(fast?5000:(MMO.on?20000:30000));mmSync()}});
addEventListener('pagehide',()=>{if(!API_OK)return;try{navigator.sendBeacon&&navigator.sendBeacon('/api/mmo',new Blob([JSON.stringify({a:'bye',...mmId()})],{type:'application/json'}))}catch(e){}});

// ----- interface : onglets du panneau multijoueur -----
{const _ui=mpUI;mpUI=function(){_ui();const b=$('mpb');if(MMO.unread&&b.style.display!='none'&&!b.querySelector('em'))b.insertAdjacentHTML('beforeend','<em style="position:absolute;bottom:2px;right:2px;width:8px;height:8px;border-radius:50%;background:#ff5a5a"></em>');if(MP.net&&MMO.zone&&!MP.room.priv)$('mpcode').textContent=MMO.zone.n}}
{const _p=mpPanel;mpPanel=function(){_p();if(MP.room&&!MP.room.priv&&MMO.zone){$('mpcode').textContent=MMO.zone.n;const s=$('mpstat');s.textContent=MP.on?(MP.others.size?(MP.others.size+1)+' pilotes dans ta zone':'Personne d\'autre dans ta zone pour l\'instant'):'Connexion à la zone…';if(MMO.on)s.textContent+=' · '+MMO.list.length+' en ligne dans la galaxie'}}}
function mmTab(k){MMO.tab=k;for(const b of $('mmtabs').children)b.classList.toggle('on',b.dataset.mt==k);$('mppanel').classList.toggle('mmx',k!='zone');if(k=='chat'){MMO.unread=0;mpUI()}if(k=='guild'&&!MMO.guild)mmGuildList();if(k!='zone')mmSoon(300);mmPaint(true)}
$('mmtabs').addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.dataset.mt)mmTab(b.dataset.mt)});
$('mpb').addEventListener('click',()=>{if(MP.panel){mmSoon(300);if(MMO.tab=='chat'){MMO.unread=0;mpUI()}mmPaint(true)}});
const mmBusy=()=>{const a=document.activeElement;return a&&a.closest&&a.closest('#mmx')&&a.tagName=='INPUT'};
function mmPaint(force){if(!MP.panel||MMO.tab=='zone')return;const el=$('mmx');
if(!API_OK){el.innerHTML='<div class="mmsub">Le réseau galactique est disponible sur le jeu en ligne (star-vody.vercel.app).</div>';return}
if(MMO.tab=='chat'){if(force||!$('mmchat')){el.innerHTML=mmChatHTML();el.dataset.h=''}mmChatList();return}
if(!force&&mmBusy())return;const h=MMO.tab=='on'?mmOnHTML():MMO.tab=='guild'?mmGuildHTML():mmProjHTML();if(!force&&h===el.dataset.h)return;el.dataset.h=h;const top=el.scrollTop;el.innerHTML=h;el.scrollTop=top}
const mmErr=()=>MMO.err&&!MMO.on?`<div class="mmsub" style="color:#f99">Serveur injoignable : ${mmEsc(MMO.err)}</div>`:'';
const mmWait=()=>MMO.on?'':mmErr()||'<div class="mmsub">Connexion au réseau galactique…</div>';
const mmTag=(gt,gc)=>gt?`<span class="mmtag" style="color:${mmCol(gc)}">[${mmEsc(gt)}]</span>`:'';
function mmWhere(o){return o.m=='surf'?'sur '+mmEsc(o.pl||'une planète'):o.m=='int'?'dans une épave':mmEsc(o.zn||'dans l\'espace')}
// En ligne
function mmOnHTML(){if(!MMO.on)return mmWait();const me=mmId().pid;let h=`<div class="mmsub">${MMO.list.length} pilote${MMO.list.length>1?'s':''} en ligne dans la galaxie</div>`;
for(const o of MMO.list){const isMe=o.id==me;let btn='';const d=Math.hypot(o.x-S.pos.x,o.zz-S.pos.z);
 if(!isMe&&o.m=='space'&&mode=='space'&&d>3000)btn=`<button data-mm="go:${o.id}">${ICO('jump')} ${travelCost({x:o.x,z:o.zz}).toLocaleString('fr-FR')} ¢</button>`;
 h+=`<div class="mmrow"><b>${mmTag(o.gt,o.gc)}<span style="color:hsl(${o.h|0},80%,72%)">${mmEsc(o.n)}</span>${isMe?' (toi)':''}</b>${btn}<small>Nv ${o.lv|0} · ${mmEsc(SHIPN[o.sh]||o.sh||'')} · ${mmWhere(o)}${!isMe&&o.m=='space'&&mode=='space'?' · '+(d>=1000?(d/1000).toFixed(1)+' km':Math.round(d)+' m'):''}</small></div>`}
return h+mmErr()}
// Discussion
function mmChatHTML(){const g=!!MMO.guild;if(MMO.ch=='c'&&!g)MMO.ch='g';
return `<div class="mmch"><button data-mm="ch:g" class="${MMO.ch=='g'?'on':''}">${ICO('planet')} Galaxie</button><button data-mm="ch:c" class="${MMO.ch=='c'?'on':''}" ${g?'':'disabled'}>${ICO('flag')} Guilde${g?' ['+mmEsc(MMO.guild.tag)+']':''}</button></div><div id="mmchat"></div><form class="mmform" id="mmcf"><input id="mmci" maxlength="140" placeholder="${MMO.ch=='g'?'Message à toute la galaxie…':'Message à ta guilde…'}" autocomplete="off"><button>Envoyer</button></form><div class="mmsub">Les messages de ta zone sont dans l'onglet Zone.</div>`}
function mmChatList(){const el=$('mmchat');if(!el)return;const L=MMO.ch=='g'?MMO.gal:MMO.gch,stick=el.scrollHeight-el.scrollTop-el.clientHeight<30;
el.innerHTML=(L.length?L.map(m=>{const d=new Date(m.t||0);return`<div><time>${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}</time>${MMO.ch=='g'?mmTag(m.gt,m.gc):''}<b style="color:hsl(${m.h|0},75%,72%)">${mmEsc(m.n)}</b> ${mmEsc(m.tx)}</div>`}).join(''):`<div class="mmsub">${MMO.on?'Aucun message pour l\'instant. Dis bonjour !':'Connexion…'}</div>`)+mmErr();
if(stick||el.dataset.n!=L.length)el.scrollTop=el.scrollHeight;el.dataset.n=L.length}
$('mmx').addEventListener('submit',async e=>{e.preventDefault();if(e.target.id=='mmcf'){const i=$('mmci'),txt=cleanTxt(i.value).trim();if(!txt)return;i.value='';const ch=MMO.ch;
 try{const r=await mmApi('chat',{ch,txt});if(r.err)throw new Error(r.err);mmMerge(ch,[r.m]);mmChatList()}catch(err){toast(String(err.message).includes('429')?'Doucement, un message à la fois':'Message non envoyé');i.value=txt}}
 else if(e.target.id=='mmgf')mmCreate();else if(e.target.id=='mmmf'){const v=$('mmmi').value;try{const r=await mmApi('gmotd',{txt:v});if(r.guild)MMO.guild=r.guild;toast('Message de la guilde mis à jour');document.activeElement.blur();mmPaint(true)}catch(err){toast('Impossible pour l\'instant')}}});
// Guilde
async function mmGuildList(){try{const r=await mmApi('glist');MMO.glist=r.l||[]}catch(e){MMO.glist=MMO.glist||null;MMO.err=String(e.message||e)}mmPaint()}
function mmGuildHTML(){if(!MMO.on)return mmWait();const g=MMO.guild;
if(!g){let h=`<div class="mmsub">Une guilde, c'est un tag à côté de ton nom, une discussion privée et un bonus d'XP qui grandit avec l'activité de ses membres (+2 % par niveau de guilde).</div><div class="mmh">Guildes de la galaxie</div>`;
 if(MMO.glist==null)h+='<div class="mmsub">Chargement…</div>';else if(!MMO.glist.length)h+='<div class="mmsub">Aucune guilde pour l\'instant : fonde la première !</div>';
 else for(const x of MMO.glist)h+=`<div class="mmrow"><b>${mmTag(x.tag,x.col)}${mmEsc(x.n)}</b><button data-mm="join:${x.id}">Rejoindre</button><small>Niveau ${x.lv} · ${x.nb} pilote${x.nb>1?'s':''}${x.motd?' · '+mmEsc(x.motd):''}</small></div>`;
 return h+`<div class="mmh">Fonder une guilde</div><form id="mmgf" style="display:flex;flex-direction:column;gap:6px"><input id="mmgn" maxlength="24" placeholder="Nom (ex. Les Faucons de Vody)" autocomplete="off"><div class="mmform"><input id="mmgt" maxlength="4" placeholder="TAG" autocomplete="off" style="flex:0 0 80px;text-transform:uppercase"><div class="mmcols">${MMCOLS.map(c=>`<button type="button" data-mm="col:${c}" class="${c==MMO.col?'on':''}" style="background:${c}"></button>`).join('')}</div></div><button>${ICO('flag')} Fonder (${MMGCOST.toLocaleString('fr-FR')} ¢)</button></form>`}
const me=mmId().pid,chef=g.owner==me,L=g.lv,lo=mmGX(L),hi=mmGX(L+1),pc=L>=20?1:clamp((g.xp-lo)/(hi-lo),0,1),on=g.m.filter(m=>m.on).length;
let h=`<div class="mmh">${mmTag(g.tag,g.col)}${mmEsc(g.n)}</div><div class="mmsub">Niveau ${L} · bonus d'XP +${mmBonus()} % · ${g.m.length} pilote${g.m.length>1?'s':''} (${on} en ligne)</div><div class="mmbar"><i style="width:${pc*100}%"></i></div>`;
h+=chef?`<form class="mmform" id="mmmf"><input id="mmmi" maxlength="140" value="${mmEsc(g.motd)}" placeholder="Message de la guilde"><button>OK</button></form>`:(g.motd?`<div class="mmsub">« ${mmEsc(g.motd)} »</div>`:'');
for(const m of g.m)h+=`<div class="mmrow"><b><span style="color:${m.on?'#6f9':'#567'}">●</span> ${mmEsc(m.n)}${m.id==me?' (toi)':''}</b>${chef&&m.id!=me?`<button data-mm="kick:${m.id}">Exclure</button>`:''}<small>${m.r=='chef'?'Chef':'Membre'} · ${m.c.toLocaleString('fr-FR')} XP apportés</small></div>`;
return h+`<div class="mmbtns"><button data-mm="gchat">${ICO('chat')} Discussion</button><button data-mm="leave">Quitter</button></div>`+mmErr()}
async function mmCreate(){const n=$('mmgn').value.trim(),tag=$('mmgt').value.trim().toUpperCase();if(n.length<3){toast('Nom trop court');return}if(!/^[A-Z0-9]{2,4}$/.test(tag)){toast('Tag : 2 à 4 lettres ou chiffres');return}if(G.cr<MMGCOST){toast('Il faut '+MMGCOST.toLocaleString('fr-FR')+' ¢ pour fonder une guilde');return}
try{const r=await mmApi('gcreate',{n,tag,col:MMO.col,nick:MP.nick||'Pilote'});if(r.err)throw new Error(r.err);G.cr-=MMGCOST;MMO.guild=r.guild;save();banner('flag','Guilde fondée !','['+r.guild.tag+'] '+r.guild.n+' — invite tes amis à la rejoindre.',mmCol(r.guild.col));SFX.win();mpSend(true);mmPaint(true)}catch(e){toast(/409/.test(e.message)?'Ce tag est déjà pris':'Impossible de fonder la guilde')}}
// Chantier commun
function mmProjHTML(){if(!MMO.on||!MMO.pr)return mmWait();const p=MMO.pr;
let h=`<div class="mmh">${ICO('station')} ${mmEsc(p.n)}</div><div class="mmsub">${mmEsc(p.d)} Projet de la semaine ${mmEsc(p.w.slice(-3))} pour tous les pilotes : ${p.nb} contributeur${p.nb>1?'s':''}.</div><div class="mmbar ${p.done?'ok':''}"><i style="width:${p.pct*100}%"></i></div>`;
for(const o of MMORE){const gg=GOODS.find(x=>x.id==o),got=p.got[o]|0,goal=p.goal[o],have=G.cargo[o]|0;h+=`<div class="mmsub">${mmEsc(gg?gg.n:o)} : <b>${got}</b> / ${goal}${have?` · tu en as ${have}`:''}</div><div class="mmbar ${got>=goal?'ok':''}"><i style="width:${Math.min(100,got/goal*100)}%"></i></div>`}
if(p.done)h+=p.my>0?(p.cl?'<div class="mmsub" style="color:#6f9">Récompense récupérée. Nouveau chantier lundi !</div>':`<button data-mm="claim">${ICO('trophy')} Récupérer ma récompense (${mmReward(p.my).toLocaleString('fr-FR')} ¢)</button>`):'<div class="mmsub">Chantier terminé ! Le prochain commence lundi.</div>';
else h+=`<div class="mmsub">Tu as apporté ${p.my} point${p.my>1?'s':''}. Chaque livraison est payée ${MMPAY} ¢ par point (fer 1, titane 2, cristal 3, or 6), et une prime est versée à tous les contributeurs quand le chantier est fini.</div><button data-mm="give" ${S.docked?'':'disabled'}>${ICO('cargo')} ${S.docked?'Livrer mes minerais':'Amarre-toi à une station pour livrer'}</button>`;
if(p.top.length)h+='<div class="mmh">Meilleurs bâtisseurs</div>'+p.top.map((x,i)=>`<div class="mmsub">${i+1}. ${x.me?'<b>':''}${mmEsc(x.n)}${x.me?'</b>':''} — ${x.v} pts</div>`).join('');
return h+mmErr()}
const MMPAY=18,mmReward=pts=>Math.min(10000,300+pts*10);
async function mmGive(){if(!S.docked){toast('Amarre-toi à une station pour livrer');return}const p=MMO.pr;if(!p)return;const res={};let any=0;
for(const o of MMORE){const need=Math.max(0,p.goal[o]-(p.got[o]|0)),q=Math.min(G.cargo[o]|0,need);if(q>0){res[o]=q;any=1}}if(!any){toast('Tu n\'as pas de minerai utile au chantier (fer, titane, cristal, or)');return}
try{const r=await mmApi('pgive',{res,nick:MP.nick||'Pilote'});if(r.err)throw new Error(r.err);let pts=0,txt=[];for(const o in r.took){const q=r.took[o]|0;G.cargo[o]=Math.max(0,(G.cargo[o]|0)-q);if(!G.cargo[o])delete G.cargo[o];pts+=q*MMPTS[o];txt.push(q+' '+o)}
 const pay=pts*MMPAY;G.cr+=pay;gainXP(pts*2);MMO.pr=r.pr;save();toast('🏗 Livré au chantier : '+txt.join(', ')+' · +'+pay.toLocaleString('fr-FR')+' ¢');SFX.win();if(r.pr.done)banner('station','Chantier commun terminé !',r.pr.n+' est construit grâce à toi !','#6f9');mmPaint(true)}catch(e){toast('Livraison impossible : '+String(e.message).replace(/^HTTP \d+/,'réessaie'))}}
async function mmClaim(){try{const r=await mmApi('pclaim');if(r.err)throw new Error(r.err);const cr=mmReward(r.pts|0);G.cr+=cr;gainXP((r.pts|0)*3);MMO.pr=r.pr;save();banner('trophy','Prime du chantier commun','+'+cr.toLocaleString('fr-FR')+' ¢ pour ta participation','#6f9');SFX.win();mmPaint(true)}catch(e){toast('Récompense indisponible pour l\'instant')}}
// actions des boutons
$('mmx').addEventListener('click',async e=>{const b=e.target.closest('button');if(!b||!b.dataset.mm)return;e.preventDefault();const[k,...r]=b.dataset.mm.split(':'),arg=r.join(':');
if(k=='ch'){MMO.ch=arg;mmPaint(true)}
else if(k=='col'){MMO.col=arg;for(const x of b.parentNode.children)x.classList.toggle('on',x===b)}
else if(k=='go'){const o=MMO.list.find(x=>x.id==arg);if(!o)return;if(o.m!='space'){toast('Ce pilote n\'est plus dans l\'espace');return}const cost=travelCost({x:o.x,z:o.zz});if(G.cr<cost){toast('Pas assez de crédits');return}$('mpclose').onclick();fastTravel({x:o.x,y:o.y||0,z:o.zz,n:o.n})}
else if(k=='join'){try{const r=await mmApi('gjoin',{gid:arg,nick:MP.nick||'Pilote'});if(r.err)throw new Error(r.err);MMO.guild=r.guild;MMO.gch=[];MMO.cc=0;banner('flag','Bienvenue dans la guilde','['+r.guild.tag+'] '+r.guild.n,mmCol(r.guild.col));mpSend(true);mmSoon(200);mmPaint(true)}catch(err){toast('Impossible de rejoindre cette guilde')}}
else if(k=='leave'){if(!confirm('Quitter ta guilde ?'))return;try{await mmApi('gleave');MMO.guild=null;MMO.gch=[];MMO.cc=0;if(MMO.ch=='c')MMO.ch='g';toast('Tu as quitté ta guilde');mpSend(true);mmGuildList()}catch(err){toast('Impossible pour l\'instant')}}
else if(k=='kick'){if(!confirm('Exclure ce pilote de la guilde ?'))return;try{const r=await mmApi('gkick',{who:arg});if(r.guild)MMO.guild=r.guild;mmPaint(true)}catch(err){toast('Impossible pour l\'instant')}}
else if(k=='gchat'){MMO.ch='c';mmTab('chat')}
else if(k=='give')mmGive();else if(k=='claim')mmClaim()});
// le panneau se rafraîchit pendant qu'il est ouvert (distances, en ligne)
TICK.push(()=>{if(MP.panel&&MMO.tab=='on'&&Math.random()<.02)mmPaint()});
// service de station : accès direct au chantier commun
svcAdd({o:95,ic:'station',t:'Réseau galactique',show:()=>API_OK&&!!MP.room,html:()=>`<div class="hint">Chantier commun${MMO.pr?' : '+mmEsc(MMO.pr.n)+' ('+Math.round(MMO.pr.pct*100)+' %)':''}${MMO.guild?' · Guilde ['+mmEsc(MMO.guild.tag)+']':''}</div><button data-sv="mmopen:proj">${ICO('station')} Ouvrir le réseau galactique</button>`});
SVC.act.mmopen=k=>{MP.panel=true;$('mppanel').style.display='flex';mpPanel();mmTab(k||'on')};
