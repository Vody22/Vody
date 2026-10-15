// ===== CARBURANT + TAXI SPATIAL (après w2.js) =====
// Carburant (`G.x.v4f`, 0-100) : chaque saut rapide en consomme 1 par 1,5 km (min. 3) ; plein en station (6 ¢/unité, service « Carburant »),
// écope solaire entre 1,9 et 3 rayons d'une étoile (+3/s), hélium-3 des géantes gazeuses (+4 par bulle). Jauge `#v4f` sous les crédits.
// Taxi spatial : service « Taxi spatial » en station : 3 passagers (pressé, VIP, touriste, nerveux) vers une autre station ;
// satisfaction (dégâts, boost, retard, détour touristique) → paiement + pourboire à l'arrivée. État `G.x.v4t`.
const V4={tipT:20,lastHe:0,scoopT:0,chatT:30};
const V4MAX=100;
const v4F=()=>{const x=GX('v4f',{v:V4MAX});if(typeof x.v!='number')x.v=V4MAX;return x};
const v4Need=o=>o?Math.max(3,Math.ceil(Math.hypot(o.x-S.pos.x,o.z-S.pos.z)/1500)):0;
// ----- voyages rapides -----
{const _tb=travelBlock;travelBlock=function(){const w=_tb();if(w)return w;const o=(JMP&&JMP.on&&JMP.o)||(MAP.open&&MAP.sel)||null;if(o){const n=v4Need(o),f=v4F().v;if(n>f)return'Pas assez de carburant : '+n+' requis, '+Math.floor(f)+' dans le réservoir'}return''}}
{const _jg=jumpGo;jumpGo=function(){const o=JMP.o;_jg();if(JMP.on&&JMP.ph=='tunnel'&&o){const n=v4Need(o)||0;const F=v4F();F.v=Math.max(0,F.v-n);setTimeout(()=>toast('⛽ Saut : −'+n+' carburant ('+Math.floor(F.v)+' restant)'),900)}}}
// ----- jauge -----
$('cr').insertAdjacentHTML('afterend','<div id="v4f" title="Carburant"><b>⛽</b><span><i></i></span><em></em></div>');
function v4Gauge(){const v=v4F().v,el=$('v4f');const w=(v/V4MAX*100).toFixed(0)+'%';if(V4.gw!==w){V4.gw=w;el.querySelector('i').style.width=w;el.querySelector('em').textContent=Math.floor(v);el.classList.toggle('low',v<15)}}
// ----- ravitaillement -----
svcAdd({o:12,ic:'pad',t:'Carburant',show:st=>!st.ground||true,html:()=>{const F=v4F(),miss=Math.ceil(V4MAX-F.v),pr=6;return`<div class="srow">Réservoir<span>${Math.floor(F.v)} / ${V4MAX}</span></div>`+(miss>0?`<button data-sv="v4fill">Faire le plein (+${miss}) — ${(miss*pr).toLocaleString('fr-FR')} ¢</button>`:'<div class="hint">Réservoir plein.</div>')+`<div class="hint">Astuce : passe près d'une étoile (pas trop près !) pour remplir gratuitement avec l'écope solaire.</div>`}});
SVC.act.v4fill=()=>{const F=v4F(),miss=Math.ceil(V4MAX-F.v),cost=miss*6;if(miss<=0)return;if(G.cr<cost){const n=Math.floor(G.cr/6);if(n<=0){toast('Pas assez de crédits');return}F.v+=n;G.cr-=n*6;toast('⛽ +'+n+' carburant');SFX.coin();save();return}G.cr-=cost;F.v=V4MAX;toast('⛽ Plein fait : −'+cost+' ¢');SFX.coin();save()};
function v4Scoop(dt){if(mode!='space'||S.dead||S.docked)return;const F=v4F();let near=null;for(const s of suns){const d=Math.hypot(S.pos.x-s.x,S.pos.y-s.y,S.pos.z-s.z);if(d>s.r*1.9&&d<s.r*3){near=s;break}}
if(near&&F.v<V4MAX){F.v=Math.min(V4MAX,F.v+3*dt);V4.scoopT-=dt;if(V4.scoopT<=0){V4.scoopT=6;toast('☀ Écope solaire : carburant '+Math.floor(F.v)+' / '+V4MAX)}if(Math.random()<dt*8){const f=_c1.set(0,0,-1).applyQuaternion(S.q);SPK.emit(S.pos.x+f.x*6,S.pos.y+f.y*6,S.pos.z+f.z*6,rv(10),rv(10),rv(10),.5,1,.8,.3,.9)}}else V4.scoopT=0}
function v4Helium(){if(typeof GZ=='undefined'||!GZ.on){V4.lastHe=0;return}if(GZ.got>V4.lastHe){const F=v4F();F.v=Math.min(V4MAX,F.v+4*(GZ.got-V4.lastHe));V4.lastHe=GZ.got}}

// =============== TAXI SPATIAL ===============
const V4P={presse:['Pressé','⏱','Je dois y être au plus vite. Chaque seconde compte !'],vip:['VIP','💎','Pas une égratignure sur la coque, compris ? Je paie bien.'],touriste:['Touriste','📸','Vous pourriez passer près d\'une planète en route ? J\'adore les photos !'],nerveux:['Nerveux','😰','Doucement… pas de boost, pas de combat, je vous en supplie.']};
const V4N=['Mme Okonkwo','M. Varga','Lila Sorens','le Dr Hassan','Pip','Mlle Tanaka','M. Duval','Zorg le voyageur','Mme Ilieva','le capitaine Rook'];
const V4Q={ok:['Merci, pilote. Excellent voyage !','Parfait, je vous recommanderai.','Vous êtes le meilleur taxi de la galaxie !'],bof:['Hum… on est arrivés, c\'est déjà ça.','J\'ai connu plus confortable.','Bon. Voilà votre argent.'],ko:['Plus jamais avec vous !','Mes nerfs… je ne paierai pas un centime de plus.','Quelle horreur de voyage.']};
function v4Dests(st){const L=[];const seen=new Set([st.n]);for(const v of G.vst||[])if(!seen.has(v.n)){seen.add(v.n);L.push({n:v.n,x:v.x,y:v.y,z:v.z})}
const cx=cof(st.x),cz=cof(st.z);for(let i=-4;i<=4;i++)for(let l=-4;l<=4;l++)for(let j=-1;j<=1;j++){const c=cdata(cx+i,j,cz+l);if(c.st&&!seen.has(c.st.n)){seen.add(c.st.n);L.push({n:c.st.n,x:c.st.x,y:c.st.y,z:c.st.z})}}
return L.map(o=>({...o,d:Math.hypot(o.x-st.x,o.z-st.z)})).filter(o=>o.d>2500&&o.d<45000).sort((a,b)=>a.d-b.d)}
function v4Offers(st){const k=st.n+'#'+Math.floor(Date.now()/600000);if(V4.offK===k&&V4.off)return V4.off;const r=rng(k.split('').reduce((a,c)=>a*31+c.charCodeAt(0)|0,7)>>>0),D=v4Dests(st),ty=Object.keys(V4P),O=[];
for(let i=0;i<3&&D.length;i++){const d=D[Math.floor(r()*Math.min(D.length,8))],t=ty[Math.floor(r()*ty.length)],km=d.d/1000,base=Math.round(180+km*55),time=Math.round(60+km*14);O.push({id:k+i,name:V4N[Math.floor(r()*V4N.length)],ty:t,to:d,pay:Math.round(base*(t=='vip'?1.6:t=='presse'?1.3:1)),time:t=='presse'?Math.round(time*.7):time})}
V4.offK=k;V4.off=O;return O}
const v4T=()=>{const x=G.x&&G.x.v4t;return x&&x.to?x:null};
svcAdd({o:13,ic:'user',t:'Taxi spatial',show:()=>true,html:st=>{const T=v4T();if(T)return`<div class="hint">À bord : <b>${esc(T.name)}</b> (${V4P[T.ty][1]} ${V4P[T.ty][0]}) pour <b>${esc(T.to.n)}</b> · satisfaction ${Math.round(T.sat)} %.</div><button data-sv="v4drop">Débarquer le passager ici (annule la course)</button>`;
 const O=v4Offers(st);if(!O.length)return'<div class="hint">Aucun passager ici. Visite d\'autres stations pour ouvrir des lignes.</div>';
 return O.map((o,i)=>`<div class="srow"><span>${V4P[o.ty][1]} <b>${esc(o.name)}</b> → ${esc(o.to.n)} <small>(${(o.to.d/1000).toFixed(1)} km · ${V4P[o.ty][0]} · ${Math.floor(o.time/60)} min ${o.time%60} s)</small></span><button data-sv="v4take:${i}">${o.pay.toLocaleString('fr-FR')} ¢</button></div>`).join('')}});
SVC.act.v4take=i=>{const st=S.docked;if(!st)return;const o=v4Offers(st)[+i];if(!o||v4T())return;G.x.v4t={name:o.name,ty:o.ty,to:o.to,pay:o.pay,time:o.time,t0:Date.now(),sat:100,from:st.n,dmg:0,tour:false};V4.off=V4.off.filter(x=>x!==o);
 banner('user',o.name+' monte à bord',V4P[o.ty][2],'#7ab6ff');SFX.buy();save()};
SVC.act.v4drop=()=>{const T=v4T();if(!T)return;toast('🚪 '+T.name+' descend, mécontent·e. Course annulée.');G.x.v4t=null;save()};
// satisfaction pendant le trajet
{const _dm=damage;damage=function(n,kind){const h0=S.hp,s0=S.sh;_dm(n,kind);const T=v4T();if(T&&mode=='space'&&(S.hp<h0||S.sh<s0)){T.sat=Math.max(0,T.sat-(T.ty=='vip'?6:T.ty=='nerveux'?4:1.5));if(t-(V4.hitT||0)>4){V4.hitT=t;toast('😟 '+T.name+' : '+(T.ty=='vip'?'Ma tenue ! Attention à la coque !':'Aïe ! On se fait tirer dessus ?!'))}}}}
function v4TaxiTick(dt){const T=v4T();if(!T)return;const el=(Date.now()-T.t0)/1000;
if(mode=='space'&&!S.docked){if(T.ty=='nerveux'&&isBoost()){T.sat=Math.max(0,T.sat-dt*6);if(t-(V4.bT||0)>5){V4.bT=t;toast('😰 '+T.name+' : Pas si vite !')}}
 if(T.ty=='nerveux'&&en.some(e=>!e.dead&&e.ai3&&e.ai3.st=='atk'&&e.pos.distanceTo(S.pos)<900))T.sat=Math.max(0,T.sat-dt*1.5);
 if(T.ty=='touriste'&&!T.tour){for(const p of planets){if(Math.hypot(S.pos.x-p.x,S.pos.y-p.y,S.pos.z-p.z)<p.r*2.2){T.tour=true;toast('📸 '+T.name+' : Magnifique ! Quelle vue sur '+p.name+' !');break}}}
 V4.chatT-=dt;if(V4.chatT<=0){V4.chatT=45+Math.random()*40;const L={presse:['On arrive bientôt ?','Plus vite, je vous en prie !'],vip:['Votre vaisseau manque de coussins.','J\'espère que la station a un bon spa.'],touriste:['Oh, regardez ces étoiles !','Vous avez déjà vu une baleine spatiale ?'],nerveux:['Vous êtes sûr de savoir piloter ?','Je crois que je vais être malade…']}[T.ty];toast('💬 '+T.name+' : '+L[Math.random()*L.length|0])}}
if(el>T.time&&!T.late){T.late=1;toast('⏰ '+T.name+' : On est en retard !')}
if(el>T.time*2.2){toast('🚪 '+T.name+' a perdu patience et a pris un autre taxi au prochain arrêt.');G.x.v4t=null;save();return}
if(S.docked&&!S.docked.ground&&S.docked.n===T.to.n){let sat=T.sat;const over=Math.max(0,el-T.time);sat-=over/T.time*60*(T.ty=='presse'?1.6:1);if(T.ty=='presse'&&el<T.time*.6)sat+=10;if(T.ty=='touriste')sat+=T.tour?15:-20;sat=clamp(sat,0,110);
 const pay=Math.round(T.pay*clamp(.4+sat/100*.6,.4,1)),tip=sat>=85?Math.round(T.pay*(sat-80)/100):0;G.cr+=pay+tip;gainXP(Math.round(T.pay/8));const Q=sat>=75?V4Q.ok:sat>=40?V4Q.bof:V4Q.ko;
 const nb=GX('v4n',0)+1;G.x.v4n=nb;banner('user','Course terminée ('+Math.round(Math.min(sat,100))+' %)','« '+Q[Math.random()*Q.length|0]+' » +'+pay.toLocaleString('fr-FR')+' ¢'+(tip?' + pourboire '+tip.toLocaleString('fr-FR')+' ¢':''),sat>=75?'#7dffb0':sat>=40?'#ffc34d':'#ff7a7a');SFX.win();try{if(nb==10)cxLog('10 courses de taxi')}catch(e){}G.x.v4t=null;save()}}
// destination sur la carte et à l'écran, passager dans le panneau d'infos
{const _mi=mapItems;mapItems=function(){const r=_mi.apply(this,arguments);try{const T=v4T();if(T&&Array.isArray(r))r.push({k:'mis',n:'🚕 '+T.to.n,x:T.to.x,y:T.to.y,z:T.to.z,c:'#ffd36b'})}catch(e){}return r}}
{const _ov=overlay;overlay=function(){_ov();try{const T=v4T();if(T&&mode=='space'&&!S.docked&&!S.dead)edgeMarker({x:T.to.x,y:T.to.y,z:T.to.z},'#ffd36b','Taxi','🚕')}catch(e){}}}
{const _ci=contentInfo;contentInfo=function(){let s=_ci();const T=v4T();if(T&&mode=='space'){const el=(Date.now()-T.t0)/1000,left=Math.max(0,T.time-el);s=`<span style="color:#ffd36b">🚕 ${esc(T.name)} → ${esc(T.to.n)} · ${Math.floor(left/60)}:${String(Math.floor(left%60)).padStart(2,'0')} · 😊 ${Math.round(T.sat)} %</span>`+(s?'<br>'+s:'')}return s}}

TICK.push(dt=>{const rd=Math.min(.1,dt||.016);try{v4Gauge();v4Scoop(rd);v4Helium();v4TaxiTick(rd)}catch(e){console.warn(e)}});
