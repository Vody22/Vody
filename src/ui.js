// ===== INTERFACE : icônes dessinées (remplacent les emojis du HUD) =====
const ICONS={
snd:'<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
mute:'<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
inv:'<path d="M8 20V4M4.5 7.5L8 4l3.5 3.5M16 4v16M12.5 16.5L16 20l3.5-3.5"/>',
map:'<path d="M3 6.5l6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
mp:'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9.5" r="2.5"/><path d="M16 14.6a4.5 4.5 0 0 1 5 4.4"/>',
cockpit:'<path d="M2.5 17c1.5-6 5-10 9.5-10s8 4 9.5 10"/><path d="M2.5 17h19M12 7v10M7 9.5l2.5 7.5M17 9.5l-2.5 7.5"/>',
extcam:'<path d="M12 3.5l2.2 8.5L12 14l-2.2-2z"/><path d="M9.8 11L3 15.5V17l7-2.5M14.2 11L21 15.5V17l-7-2.5M10.5 19.5h3"/>',
gear:'<path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>',
hull:'<path d="M12 3l3.5 6.5V17L12 20.5 8.5 17V9.5z"/><path d="M8.5 12L3.5 16v2l5-1.5M15.5 12l5 4v2l-5-1.5"/>',
shield:'<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8-7.5 9.5-4.3-1.5-7.5-4.9-7.5-9.5V6z"/>',
cargo:'<path d="M4 7.5L12 3.5l8 4v9L12 20.5l-8-4z"/><path d="M4 7.5l8 4 8-4M12 11.5v9"/>',
coin:'<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.4a3.6 3.6 0 1 0 0 5.2M12.5 6.8v10.4"/>',
planet:'<circle cx="12" cy="12" r="5"/><ellipse cx="12" cy="12" rx="10" ry="3.2" transform="rotate(-22 12 12)"/>',
target:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
check:'<path d="M4.5 12.5l4.5 4.5L19.5 7"/>',
gem:'<path d="M6.5 4h11l3.5 5-9 11L3 9z"/><path d="M3 9h18M9.5 4L12 20l2.5-16"/>',
spark:'<path d="M12 2.5l2.2 7.3 7.3 2.2-7.3 2.2-2.2 7.3-2.2-7.3L2.5 12l7.3-2.2z"/>',
turret:'<path d="M4 20h16M6.5 20v-4a5.5 5.5 0 0 1 11 0v4M12 10.5V7l7-3"/>',
flag:'<path d="M5.5 21V3.5M5.5 4h12l-2.5 4 2.5 4h-12"/>',
land:'<path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5M4 20h16"/>',
takeoff:'<path d="M12 16.5v-12M7.5 9L12 4.5 16.5 9M4 20h16"/>',
undock:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
walk:'<circle cx="13" cy="4.5" r="2"/><path d="M9.5 21l2.5-6 3 3v3M7.5 12.5L10 8l4.5 1.5 2.5 3.5M12.3 9.2L11 15"/>',
fire:'<circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><path d="M12 2.5v3.5M12 18v3.5M2.5 12H6M18 12h3.5"/>',
boost:'<path d="M6 12.5l6-6 6 6M6 18.5l6-6 6 6"/>',
brake:'<path d="M6 5.5l6 6 6-6M6 11.5l6 6 6-6"/>',
tool:'<path d="M4 20l7.5-7.5"/><path d="M13 5l6 6-3 3-6-6z"/><path d="M15.5 3.5l5 5"/>',
jump:'<path d="M12 15.5V5M7.5 9.5L12 5l4.5 4.5"/><path d="M6.5 19.5c1.6-1.3 3.5-2 5.5-2s3.9.7 5.5 2"/>',
run:'<path d="M13.5 2.5L5.5 13.5h6l-1 8 8-11.5h-6z"/>',
swap:'<path d="M4 8h14l-3.5-3.5M20 16H6l3.5 3.5"/>',
plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',
locate:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
close:'<path d="M6 6l12 12M18 6L6 18"/>',
canon:'<path d="M3 15.5h11l4-2.5V10l-4-2.5H3z"/><path d="M18 11.5h3.5M6.5 15.5V19"/>',
missile:'<path d="M5.5 18.5l2-4.5 8-8c1.5-1.5 3.5-2 4.5-2-.1 1-.6 3-2.1 4.5l-8 8z"/><path d="M8 14l-3.5-.5L7 11M10 16l.5 3.5L13 17"/>',
laser:'<path d="M2.5 12h9"/><path d="M11.5 8l9.5 4-9.5 4z"/><path d="M5 8.5v.01M7.5 15.5v.01"/>',
mine:'<circle cx="12" cy="13" r="6"/><path d="M12 3.5V7M12 19v1.5M3.5 13H6M18 13h2.5M6 7l1.6 1.6M18 7l-1.6 1.6"/>',
sword:'<path d="M20.5 3.5v5L11.5 17.5l-5-5L15.5 3.5z"/><path d="M5 14.5l4.5 4.5M3.5 20.5l3-3"/>',
flame:'<path d="M12 3c.8 3.4 5 5.2 5 10a5 5 0 0 1-10 0c0-2.4 1.3-3.6 2.2-5.4.9 1.3 1.6 2 2.4 2.2C11.8 7.8 11.2 5.4 12 3z"/>',
station:'<path d="M12 2.8l8 4.6v9.2l-8 4.6-8-4.6V7.4z"/><circle cx="12" cy="12" r="2.6"/>',
ship:'<path d="M12 3l3 8 6 4v2l-6-1.5L13.5 20h-3L9 15.5 3 17v-2l6-4z"/>',
wrench:'<path d="M14.5 4.5a4.5 4.5 0 0 0-5 6L4 16l4 4 5.5-5.5a4.5 4.5 0 0 0 6-5l-3 3-3-1-1-3z"/>',
sun:'<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
moon:'<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>',
dawn:'<path d="M3 18h18M7.5 18a4.5 4.5 0 0 1 9 0M12 7v3.5M5.5 11.5l1.7 1.2M18.5 11.5l-1.7 1.2"/>',
warn:'<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.2v.3"/>',
quest:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5.5M12 16.3v.4"/>',
chat:'<path d="M4 5h16v11H9l-5 4z"/>',
scan:'<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4M8 12h8"/>',
terminal:'<rect x="3" y="4.5" width="18" height="13" rx="1"/><path d="M7 9l3 2.5L7 14M12 14h5M9 20.5h6"/>',
leaf:'<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19l8-8"/>',
weather:'<path d="M7 17.5h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 17.5z"/>',
pad:'<path d="M3 15l9 4 9-4-9-4z"/><path d="M12 11V4M9 6.5l3-2.5 3 2.5"/>',
user:'<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>'};
document.body.insertAdjacentHTML('afterbegin','<svg width="0" height="0" style="position:absolute" aria-hidden="true">'+Object.entries(ICONS).map(([k,v])=>`<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('')+'</svg>');
const ICO=(n,c)=>`<svg class="i${c?' '+c:''}"><use href="#i-${n}"/></svg>`;
// remplace l'emoji d'en-tête d'un libellé par une icône, et met le texte en minuscules (« 📦 OUVRIR LA CAISSE » → [caisse] Ouvrir la caisse)
const EMO={'🚀':'takeoff','📦':'cargo','✨':'spark','❗':'quest','🔧':'wrench','⛏':'tool','💬':'chat','🔬':'scan','💻':'terminal','🌿':'leaf','📼':'cargo','🛬':'land','🛫':'takeoff','🗣':'chat','🛒':'cargo','💰':'coin'};
function actLabel(s){if(!s)return s;const kb=s.indexOf(' <kbd>'),tail=kb>=0?s.slice(kb):'';let body=kb>=0?s.slice(0,kb):s;let icon='';for(const e in EMO)if(body.startsWith(e)){icon=ICO(EMO[e]);body=body.slice(e.length).trim();break}
if(!icon){const m=body.match(/^(\S+)\s+(.*)$/);if(m&&!/[A-Za-zÀ-ÿ0-9]/.test(m[1])){icon=m[1]+' ';body=m[2]}}const parts=body.split(' · ');if(parts[0]===parts[0].toUpperCase()){const l=parts[0].toLowerCase();parts[0]=l.charAt(0).toUpperCase()+l.slice(1)}return icon+parts.join(' · ')+tail}
// boutons d'action : icône + libellé
function btnSet(id,ic,lb){const b=$(id);if(!b)return;const k=ic+'|'+lb;if(b.dataset.k===k)return;b.dataset.k=k;b.innerHTML=ICO(ic)+'<span>'+lb+'</span>'}
// vue cockpit
ckBtn=function(){const b=$('cockb');b.classList.toggle('on',COCKPIT);b.innerHTML=ICO(COCKPIT?'extcam':'cockpit');b.title=COCKPIT?'Vue extérieure (V)':'Vue cockpit (V)'};ckBtn();
// multijoueur
mpUI=function(){const b=$('mpb');b.style.display=MP.room?'flex':'none';const n=MP.others.size;const h=ICO('mp')+(n?`<i>${n}</i>`:'');if(b.dataset.h!==h){b.dataset.h=h;b.innerHTML=h}b.classList.toggle('off',!MP.on);if(MP.panel)mpPanel()};mpUI();
// armes
const WSVG={canon:'canon',missile:'missile',laser:'laser',mine:'mine'};
wpnHUD=function(){const w=curW(),W=WPN[w];let s=`${ICO(WSVG[w]||'canon')} ${W.n}`;if(W.am)s+=` · <b>${G.ammo[W.am]}</b>`;if(w=='laser')s+=` <span class="heat"><i style="width:${(LZ.heat*100).toFixed(0)}%;background:${LZ.over>0?'#f44':LZ.heat>.7?'#fa4':'#6ef'}"></i></span>`;return s};
// onglets de la boutique
{const L={station:['station','Station'],ships:['ship','Vaisseaux'],weap:['canon','Armes'],market:['coin','Marché'],atelier:['wrench','Atelier'],craft:['tool','Fabrication'],stash:['cargo','Entrepôt']};for(const tb of TABS)if(L[tb[0]])tb[1]=ICO(L[tb[0]][0])+'<span class="tl">'+L[tb[0]][1]+'</span>';$('tabs').innerHTML=TABS.map(([k,n])=>`<button data-tab="${k}">${n}</button>`).join('')}
// boutons tactiles (vol / à pied)
btnSet('fire','fire','Feu');btnSet('boost','boost','Boost');btnSet('brake','brake','Frein');
