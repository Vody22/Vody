// ===== SERVICES DE LA STATION : onglet commun (bar et ailiers, contacts de faction, bureau des primes, marché noir, courses, hôtel des ventes) =====
// chaque module ajoute sa section avec svcAdd({o:ordre,ic:icône,t:titre(st),show:(st)=>bool,html:(st)=>html}) et ses actions dans SVC.act
const SVC={secs:[],act:{}};
function svcAdd(s){SVC.secs.push(s);SVC.secs.sort((a,b)=>(a.o||0)-(b.o||0))}
const SROW=(l,r)=>`<div class="srow">${l}<span>${r||''}</span></div>`;
const esc=s=>String(s==null?'':s).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
TABS.push(['svc',ICO('chat')+'<span class="tl">Services</span>']);
$('tabs').innerHTML=TABS.map(([k,n])=>`<button data-tab="${k}" title="${n.replace(/<[^>]+>/g,'')}">${n}</button>`).join('');
{const _sv=shopView;shopView=function(){if(TAB!='svc')return _sv();const st=S.docked;if(!st)return'';let h='';
for(const s of SVC.secs){try{if(s.show&&!s.show(st))continue;const b=s.html(st);if(b)h+=`<div class="svsec"><b class="pt">${ICO(s.ic)} ${typeof s.t=='function'?s.t(st):s.t}</b>${b}</div>`}catch(e){console.warn(e)}}
return h||'<div class="hint">Aucun service dans cette station.</div>'}}
$('shop').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!b.dataset.sv)return;const[k,...r]=b.dataset.sv.split(':');if(SVC.act[k]){try{SVC.act[k](...r)}catch(err){console.warn(err)}HC.shopV=null}});
// faction qui contrôle une station (remplacée par la guerre des territoires dans war.js)
let stFac=st=>'alliance';
// petit bandeau d'annonce en haut de l'écran (succès, événements importants)
const BANQ=[];let BANT=0;
function banner(ic,title,sub,col){BANQ.push({ic,title,sub,col:col||'#ffc34d'});if(BANQ.length==1&&BANT<=0)banNext()}
function banNext(){const b=BANQ[0],el=$('achb');if(!b){el.classList.remove('on');return}el.style.setProperty('--bc',b.col);el.innerHTML=`${ICO(b.ic)}<div><b>${b.title}</b><small>${b.sub||''}</small></div>`;el.classList.add('on');BANT=4.2}
function updBanner(dt){if(BANT>0){BANT-=dt;if(BANT<=0){$('achb').classList.remove('on');BANQ.shift();if(BANQ.length)setTimeout(banNext,450)}}}
// ----- crochets par image : TICK (toujours), STICK (simulation spatiale, hors pause) -----
const TICK=[],STICK=[];
{const _u=updParts;updParts=function(dt){_u(dt);for(const f of TICK)try{f(dt)}catch(e){console.warn(e)}}}
{const _us=updSpace;updSpace=function(dt){_us(dt);for(const f of STICK)try{f(dt)}catch(e){console.warn(e)}}}
TICK.push(updBanner);
// données des nouveaux modules dans la sauvegarde (G.x)
const GX=(k,def)=>{if(G.x[k]==null||typeof G.x[k]!=typeof def)G.x[k]=def;return G.x[k]};
// accès aux fonctions en ligne (Netlify) : désactivé hors du site, sauf ?api pour les tests
const API_OK=(location.protocol.startsWith('http')&&!/claude|localhost|127\.0\.0\.1/.test(location.hostname))||/[?&]api\b/.test(location.search);
async function api(path,body){const r=await fetch(path,body?{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}:{});if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}
// pièces et vaisseaux uniques (récompenses) : invisibles à la boutique tant qu'on ne les possède pas
{const _sv=shopView;shopView=function(){if(TAB=='atelier'){const hid=[];for(const s in PARTS)for(const id in PARTS[s].o){const o=PARTS[s].o[id];if(o.uniq&&!G.pown.includes(s+':'+id)){hid.push([s,id,o]);delete PARTS[s].o[id]}}try{return _sv()}finally{for(const[s,id,o]of hid)PARTS[s].o[id]=o}}
if(TAB=='ships'){const hid=[];for(const id in HULLS)if(HULLS[id].uniq&&!G.owned.includes(id)){hid.push([id,HULLS[id]]);delete HULLS[id]}try{return _sv()}finally{for(const[id,H]of hid)HULLS[id]=H}}return _sv()}}
{const _bp=buyPart;buyPart=function(s,id){const o=PARTS[s]&&PARTS[s].o[id];if(o&&o.uniq&&!G.pown.includes(s+':'+id)){toast('Pièce unique : elle se gagne, elle ne s\'achète pas');return}_bp(s,id)}}
{const _bs=buyShip;buyShip=function(id){const H=HULLS[id];if(H&&H.uniq&&!G.owned.includes(id)){toast('Vaisseau unique : il se gagne, il ne s\'achète pas');return}_bs(id)}}
// ----- garde-fou : plus jamais d'argent illimité (ancienne version restée ouverte, vieille sauvegarde…) -----
TICK.push(()=>{if(!ARGENT_ILLIMITE&&G.cr>=1e8){G.cr=2500;toast('💰 Argent illimité désactivé : tu repars avec 2 500 ¢');save()}});
// ----- mise à jour automatique : si une nouvelle version est publiée, elle s'installe au retour dans l'appli ou au prochain amarrage -----
const UPD={cur:(document.querySelector('meta[name="sf-build"]')||{}).content||'',ready:false,busy:false};
async function updCheck(){if(!API_OK||!UPD.cur||UPD.busy||UPD.ready)return;UPD.busy=true;try{const r=await fetch(location.pathname+'?v='+Date.now(),{cache:'no-store'});const tx=await r.text(),m=tx.match(/name="sf-build" content="([^"]+)"/);if(m&&m[1]!==UPD.cur){UPD.ready=true;UPD.nb=m[1];toast('✨ Nouvelle version disponible : elle s\'installe à ton prochain amarrage')}}catch(e){}UPD.busy=false}
function updApply(){if(!UPD.ready)return;save();try{if(typeof cloudSave=='function')cloudSave(false)}catch(e){}setTimeout(()=>{const q=new URLSearchParams(location.search);q.set('v',UPD.nb||Date.now());location.replace(location.pathname+'?'+q.toString()+location.hash)},600)}
// après une mise à jour, on retire le paramètre v= de l'adresse (l'icône de l'écran d'accueil garde l'adresse propre)
try{const q=new URLSearchParams(location.search);if(q.has('v')){q.delete('v');const r=q.toString();history.replaceState(null,'',location.pathname+(r?'?'+r:'')+location.hash)}}catch(e){}
addEventListener('visibilitychange',()=>{if(document.hidden)return;updCheck().then(()=>{if(UPD.ready&&(S.docked||mode=='space'&&!en.length))updApply()})});
setInterval(updCheck,10*60e3);setTimeout(updCheck,30000);
{const _dk=dock;dock=function(st){_dk(st);if(UPD.ready){toast('✨ Installation de la nouvelle version…');updApply()}}}
// ----- le moteur 3D peut s'arrêter (mémoire saturée sur mobile) : on le dit au lieu de rester figé -----
R3.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();try{save()}catch(x){}const d=document.createElement('div');d.style.cssText='position:fixed;inset:0;z-index:70;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;background:rgba(3,5,12,.94);color:#cdf2ff;font:600 15px system-ui;text-align:center;padding:24px';d.innerHTML='Le moteur 3D s\'est arrêté (mémoire de l\'appareil saturée).<br><small style="opacity:.7">Ta partie est sauvegardée.</small><button style="padding:10px 18px;font:600 14px system-ui;color:#03050c;background:#7fe0ff;border:0;border-radius:8px">Relancer le jeu</button>';d.querySelector('button').onclick=()=>location.reload();document.body.appendChild(d)},false);
