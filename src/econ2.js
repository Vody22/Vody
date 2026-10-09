// ===== ÉCONOMIE VIVANTE : événements de station partagés par tous les joueurs (créneaux de 20 min sur l'heure réelle), pénurie après un bombardement, saturation des marchés, nouvelles du secteur =====
const EVT={famine:{n:'Famine',ic:'🌾',d:'La nourriture et l\'eau manquent : elles s\'y vendent très cher',m:{food:1.8,water:1.5}},
epid:{n:'Épidémie',ic:'💊',d:'Les médicaments s\'arrachent',m:{med:2}},
boom:{n:'Boom industriel',ic:'🏗',d:'Gros besoins en alliages, fer et titane',m:{metal:1.6,fer:1.5,titane:1.4}},
surplus:{n:'Récolte record',ic:'📦',d:'Nourriture et eau bradées : c\'est le moment d\'en acheter',m:{food:.5,water:.55}},
or:{n:'Ruée vers l\'or',ic:'🥇',d:'L\'or et les cristaux valent une fortune',m:{or:1.7,cristal:1.35}},
fete:{n:'Grande fête',ic:'🎉',d:'Produits de luxe et nourriture très demandés',m:{lux:1.7,food:1.25}},
panne:{n:'Panne de réacteur',ic:'⚡',d:'Carburant et électronique introuvables',m:{fuel:1.8,elec:1.5}},
soldes:{n:'Liquidation',ic:'🏷',d:'Électronique et luxe à prix cassés',m:{elec:.6,lux:.65}}};
const EVK=Object.keys(EVT),EVSLOT=20*60e3;
const ECO2={slot:-1,seen:{},nT:4};
const evSlot=()=>Math.floor(Date.now()/EVSLOT);
// événement d'une station pour le créneau courant (identique pour tous les joueurs)
function stEvent(st){if(!st||st.ground||st.base||st.n=='Base Alpha')return null;const s=evSlot(),h=h3(st.x|0,st.z|0,s,913);if(h>=.15)return null;return EVK[Math.floor(h3(st.z|0,st.x|0,s,914)*EVK.length)%EVK.length]}
const evLeft=()=>EVSLOT-Date.now()%EVSLOT;
const RAID=GX('raid',{});
function stationHit(st){RAID[st.n]=Date.now()+15*60e3;save()}
const raidOn=st=>st&&RAID[st.n]>Date.now();
// saturation des marchandises ordinaires (achats → prix en hausse, ventes → prix en baisse ; un lot se résorbe toutes les 30 s)
const satF=(st,g)=>{const s=satN(st,'gs'+g.id),b=satN(st,'gb'+g.id);return Math.max(g.min?.7:.62,1-(g.min?.01:.015)*s)*Math.min(1.4,1+.012*b)};
function evMult(st,id){let m=1;const e=stEvent(st);if(e&&EVT[e].m[id])m*=EVT[e].m[id];if(raidOn(st))m*=1.25;return m}
{const _gp=gPrice;gPrice=function(st,g){const p=_gp(st,g);if(!st||!g)return p;return Math.max(2,Math.round(p*evMult(st,g.id)*satF(st,g)))}}
// le commerce se fait unité par unité pour que la saturation s'applique au fil de la vente
{const _tr=trade;trade=function(id,q){const st=S.docked,g=GOODS.find(x=>x.id==id);if(!st||!g||!q)return _tr(id,q);const n=Math.abs(q)|0,s=Math.sign(q),coin=SFX.coin;let done=0,cr0=G.cr;SFX.coin=()=>{};
try{for(let i=0;i<n;i++){if(i>0&&s>0&&(cargoUsed()>=cap()||G.cr<gPrice(st,g)))break;const b=G.cargo[id]||0;_tr(id,s);if((G.cargo[id]||0)===b)break;done++;satAdd(st,(s>0?'gb':'gs')+id,1)}}finally{SFX.coin=coin}
if(done){coin();if(done>3&&s<0){const k=satF(st,g);if(k<.85)toast('📉 Marché saturé : '+g.n+' −'+Math.round((1-k)*100)+' % ici pour un moment')}}}}
// ----- affichage : onglet marché, amarrage, nouvelles -----
function evLine(st){const e=stEvent(st),r=raidOn(st);let h='';if(e){const E=EVT[e];h+=`<div class="hint evh">${E.ic} <b>${E.n}</b> · ${E.d}. Encore ${Math.ceil(evLeft()/60e3)} min.</div>`}if(r)h+=`<div class="hint evh bad">💥 <b>Pénurie</b> · la station a été bombardée : tout coûte 25 % plus cher (encore ${Math.ceil((RAID[st.n]-Date.now())/60e3)} min).</div>`;return h}
{const _sv=shopView;shopView=function(){const h=_sv();if(TAB!='market'||!S.docked||typeof h!='string')return h;const st=S.docked;let sat=[];for(const g of GOODS){const k=satF(st,g);if(Math.abs(k-1)>.08)sat.push(g.n+' '+(k<1?'−':'+')+Math.round(Math.abs(k-1)*100)+' %')}
return evLine(st)+h.replace(/(<div class="hint">Économie[^]*?<\/div>)/,m=>m+(sat.length?`<div class="hint">Marché local : ${sat.join(' · ')} (revient à la normale avec le temps)</div>`:''))}}
{const _dk=dock;dock=function(st){_dk(st);const e=stEvent(st);if(e){const E=EVT[e];setTimeout(()=>banner('station',E.ic+' '+E.n+' à '+st.n,E.d,'#7fe0ff'),900)}else if(raidOn(st))setTimeout(()=>banner('skull','Pénurie à '+st.n,'La station a été bombardée : tout coûte 25 % plus cher','#ff8a5a'),900)}}
// stations connues : celles déjà visitées et celles chargées autour du joueur
function knownSt(){const m=new Map();for(const v of G.vst||[])m.set(v.n,v);for(const s of stations)if(!s.ground)m.set(s.n,s);return[...m.values()]}
function newsList(){const out=[],me=S.pos;for(const st of knownSt()){const d=Math.hypot(st.x-me.x,st.z-me.z),e=stEvent(st);if(e)out.push({d,st,h:`${EVT[e].ic} <b>${EVT[e].n}</b> à ${esc(st.n)} · ${EVT[e].d}`});if(raidOn(st))out.push({d:d-1,st,h:`💥 <b>${esc(st.n)}</b> a été bombardée : pénurie, tout y coûte 25 % plus cher`})}
out.sort((a,b)=>a.d-b.d);const r=out.slice(0,6).map(o=>o.h+` <small>(${o.d<1000?'ici':(o.d/1000).toFixed(1)+' km'})</small>`);
try{const w=wbSlot();if(w.active&&!WB.dead)r.unshift('☠ <b>Le dreadnought pirate</b> attaque en ce moment : rejoins la bataille !');else r.push('☠ Prochaine attaque du dreadnought dans '+Math.ceil((WB_PERIOD-w.ph)/60e3)+' min')}catch(e){}
if(LAW&&LAW.b>0)r.push(`🚨 Avis de recherche : une prime de ${fmt(LAW.b)} ¢ pèse sur toi`);return r}
svcAdd({o:2,ic:'station',t:'Nouvelles du secteur',show:st=>!st.base,html:st=>{const L=newsList();return `<div class="news">${L.length?L.map(x=>`<div>${x}</div>`).join(''):'<div>Rien à signaler. Les prochaines nouvelles arrivent dans '+Math.ceil(evLeft()/60e3)+' min.</div>'}</div><small class="dimt">Les événements changent toutes les 20 minutes et sont les mêmes pour tous les pilotes.</small>`}});
// annonce en vol des nouveaux événements proches
TICK.push(dt=>{ECO2.nT-=dt;if(ECO2.nT>0)return;ECO2.nT=5;const s=evSlot();if(s!==ECO2.slot){const first=ECO2.slot<0;ECO2.slot=s;ECO2.seen={};if(first)for(const st of knownSt())ECO2.seen[st.n]=1}
if(mode!='space'||S.docked)return;for(const st of stations){if(st.ground||ECO2.seen[st.n])continue;const e=stEvent(st);if(!e)continue;const d=Math.hypot(st.x-S.pos.x,st.z-S.pos.z);if(d>15000)continue;ECO2.seen[st.n]=1;const E=EVT[e];toast('📰 '+E.n+' à '+st.n+' : '+E.d.toLowerCase());break}});
