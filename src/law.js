// ===== CONTREBANDE, DOUANE ET PRIMES : marché noir, scans douaniers, amendes, prime sur la tête, police et chasseurs de primes =====
const ILLG=[{id:'arms',n:'Armes de contrebande',ic:'🔫',p:180,ill:1},{id:'spice',n:'Épices de Nyx',ic:'🌶',p:260,ill:1},{id:'relic',n:'Reliques volées',ic:'🏺',p:400,ill:1}];window.ILLG=ILLG;
const LAW=GX('law',{});LAW.b=+LAW.b||0;LAW.max=+LAW.max||0;
const LS={scan:null,last:{},police:0,polT:20,huntT:90,beam:null,fineT:0,patT:120,sat:{}};
PARTS.cargo.o.doublefond={n:'Double fond',p:6000,d:'Soute +10 % et 60 % de chances que la douane ne trouve rien.',cap:1.1,hide:.6};
const illQ=()=>ILLG.reduce((a,g)=>a+(G.cargo[g.id]||0),0),illV=()=>ILLG.reduce((a,g)=>a+(G.cargo[g.id]||0)*g.p,0);
const stars=()=>LAW.b<=0?0:LAW.b<1500?1:LAW.b<4000?2:LAW.b<8000?3:LAW.b<15000?4:5;
function addBounty(n,why){n=Math.round(n);if(n<=0)return;const s0=stars();LAW.b+=n;LAW.max=Math.max(LAW.max,LAW.b);toast('🚨 '+why+' · prime +'+fmt(n)+' ¢ (total '+fmt(LAW.b)+' ¢)');SFX.alarm();if(stars()>s0&&s0==0)LS.huntT=Math.min(LS.huntT,60);save()}
function clearBounty(){LAW.b=0;LS.police=0}
// ----- marché noir -----
const stH=(st,k)=>h3(st.x|0,st.z|0,k,81);
const stDz=st=>Math.min(4,Math.floor(Math.hypot(st.x,st.y,st.z)/9000));
function bmAt(st){if(!st||st.base)return false;const f=stFac(st),h=stH(st,1);return f=='pirates'||(f!='alliance'&&h<.6)||h<.2}
function bmSells(st,i){const s=[0,1,2].filter(k=>stH(st,10+k)<.45);if(!s.length)s.push(Math.floor(stH(st,9)*3)%3);return s.includes(i)}
// le marché sature : chaque unité vendue fait baisser le prix (il remonte d'une unité toutes les 30 s), chaque achat le fait monter
function satN(st,k){const o=LS.sat[st.n+'|'+k];return o?Math.max(0,o.n-((G.time||0)-o.t)/30):0}
function satAdd(st,k,n){LS.sat[st.n+'|'+k]={n:satN(st,k)+n,t:G.time||0}}
function bmBase(st,g,buy){const i=ILLG.indexOf(g),per=Math.floor((G.time||0)/240),f=h3(st.x|0,i*7+3,per,83);if(buy)return g.p*(.75+.2*f);return g.p*(bmSells(st,i)?1.05:(1.45+.75*f)*(1+stDz(st)*.12))}
function bmPrice(st,g,buy,k=0){return Math.round(buy?bmBase(st,g,true)*(1+.03*(satN(st,'b'+g.id)+k)):bmBase(st,g,false)*Math.max(.5,1-.05*(satN(st,g.id)+k)))}
function smBuy(id,q){const st=S.docked,g=ILLG.find(x=>x.id==id);if(!st||!g)return;let n=0,tot=0;while(n<q&&cargoUsed()+n<cap()){const p=bmPrice(st,g,true,n);if(tot+p>G.cr)break;tot+=p;n++}if(n<=0){toast(cargoUsed()>=cap()?'Soute pleine':'Pas assez de crédits');return}G.cr-=tot;satAdd(st,'b'+id,n);LS.last[st.n]=t+600;G.cargo[id]=(G.cargo[id]||0)+n;SFX.coin();save()}
function smSell(id){const st=S.docked,g=ILLG.find(x=>x.id==id);if(!st||!g)return;const n=G.cargo[id]||0;if(!n)return;let tot=0;for(let k=0;k<n;k++)tot+=bmPrice(st,g,false,k);const p=Math.round(tot/n);satAdd(st,id,n);G.cr+=tot;delete G.cargo[id];STS.smug+=n;gainXP(n*4);SFX.coin();
if(G.rep)G.rep.alliance=Math.max(0,(G.rep.alliance||0)-n*2);if(typeof warAdd=='function')warAdd(-2*n,st);toast('🕶 Vendu au marché noir : '+n+' '+g.n+' · +'+fmt(tot)+' ¢'+(n>4?' (le prix baisse quand tu vends beaucoup d\'un coup)':''));if(stFac(st)=='alliance'&&Math.random()<.15)setTimeout(()=>addBounty(300+n*40,'Un informateur t\'a dénoncé'),1500);save()}
SVC.act.smb=(id,q)=>smBuy(id,+q);SVC.act.sms=id=>smSell(id);
svcAdd({o:40,ic:'skull',t:'Marché noir',show:st=>bmAt(st),html:st=>{let h=`<div class="hint">${stFac(st)=='alliance'?'Un revendeur discret, au fond du hangar. ':''}Marchandises illégales : très rentables, mais saisies par la douane et les patrouilles de l'Alliance. Le prix baisse si tu en vends beaucoup au même endroit.</div>`;
for(const g of ILLG){const i=ILLG.indexOf(g),have=G.cargo[g.id]||0,sells=bmSells(st,i),bp=bmPrice(st,g,true),sp=bmPrice(st,g,false);
h+=SROW(`<div><b>${g.ic} ${g.n}</b><small>${sells?'Achat '+fmt(bp)+' ¢ · ':''}Revente ${fmt(sp)} ¢${have?' · en soute : '+have:''}</small></div>`,(sells?`<button data-sv="smb:${g.id}:1">+1</button><button data-sv="smb:${g.id}:5">+5</button>`:'')+(have?`<button class="sell" data-sv="sms:${g.id}">Vendre</button>`:''))}return h}});
// ----- bureau des primes : payer sa prime (pot-de-vin) hors de l'Alliance -----
SVC.act.bpay=()=>{const c=Math.round(LAW.b*.8);if(G.cr<c){toast('Pas assez de crédits');return}G.cr-=c;clearBounty();toast('🤝 Prime effacée contre '+fmt(c)+' ¢. On ne t\'a jamais vu.');SFX.coin();save()};
svcAdd({o:45,ic:'skull',t:'Bureau des primes',show:st=>stFac(st)!='alliance'||LAW.b>0,html:st=>{if(LAW.b<=0)return'<div class="hint">Personne ne te recherche. Profites-en.</div>';
if(stFac(st)=='alliance')return'<div class="hint">Tu es recherché : l\'Alliance t\'arrêtera ici. Va dans une station pirate ou frontalière pour négocier.</div>';
const c=Math.round(LAW.b*.8);return SROW(`<div><b>Ta prime : ${fmt(LAW.b)} ¢</b><small>Un intermédiaire peut faire disparaître ton dossier pour ${fmt(c)} ¢.</small></div>`,`<button data-sv="bpay" class="${G.cr>=c?'hot':'dim'}">Payer ${fmt(c)} ¢</button>`)}});
// ----- arrivée dans une station de l'Alliance : arrestation ou inspection -----
function seize(){const v=illV(),q=illQ();for(const g of ILLG)delete G.cargo[g.id];return{v,q}}
function inspect(st,forced){const q=illQ();if(!q)return false;const hide=(partOf('cargo').hide||0)+.15*talR('contre');if(Math.random()<hide*(forced?.6:1)){toast('🛃 Inspection de '+st.n+' : rien à signaler…');SFX.tick();return false}
const{v}=seize(),fine=Math.max(200,Math.round(v*.5));if(G.cr>=fine){G.cr-=fine;toast('🛃 Contrebande saisie ('+q+') · amende de '+fmt(fine)+' ¢')}else{const paid=G.cr;G.cr=0;addBounty(fine-paid,'Amende impayée')}SFX.alarm();if(G.rep)G.rep.alliance=Math.max(0,(G.rep.alliance||0)-q*5);save();return true}
{const _dk=dock;dock=function(st){if(stFac(st)=='alliance'){if(LAW.b>0){const due=LAW.b,pay=Math.min(G.cr,due);G.cr-=pay;clearBounty();const{q}=seize();setTimeout(()=>{toast('🚔 Arrêté à '+st.n+' ! Amende de '+fmt(pay)+' ¢ payée'+(q?' · contrebande saisie':'')+'. Ton dossier est effacé.');SFX.alarm()},300);for(const e of en)if(e.kind=='police'){e.dead=1;e.mesh.parent&&e.mesh.parent.remove(e.mesh)}}
else if(LS.scan&&LS.scan.st===st){LS.scan=null;inspect(st,true)}else if(illQ()&&!LS.last[st.n])inspect(st,true)}_dk(st)}}
// ----- scans douaniers à l'approche des stations de l'Alliance -----
function lawScan(dt){const sc=LS.scan;if(sc&&sc.src){patScan(sc,dt);return}if(sc){const d=S.pos.distanceTo(_v.set(sc.st.x,sc.st.y,sc.st.z));sc.t+=dt;if(!LS.beam)LS.beam=mkBeam(0x5aa8ff);placeBeam(LS.beam,_w.set(sc.st.x,sc.st.y+60,sc.st.z),S.pos,.5,false);if(Math.random()<dt*2)tone(900,1400,.09,'sine',.025);
if(d>1600||!illQ()){LS.scan=null;hideBeam(LS.beam);LS.last[sc.st.n]=t;if(illQ()&&d>1600){const v=illV();addBounty(400+v*.5,'Refus de contrôle douanier');polSpawn(2,sc.st)}return}
if(sc.t>=sc.dur){LS.scan=null;hideBeam(LS.beam);LS.last[sc.st.n]=t;inspect(sc.st,false)}return}
if(!illQ()||S.docked||S.dead||S.entry)return;for(const st of stations){if(stFac(st)!='alliance')continue;if(LS.last[st.n]&&t-LS.last[st.n]<180)continue;const d=S.pos.distanceTo(_v.set(st.x,st.y,st.z));if(d<1100&&d>240){LS.scan={st,t:0,dur:5};toast('🛃 Scan douanier de '+st.n+' : reste pour le contrôle, ou file hors de portée');SFX.alarm();break}}}
// ----- police et chasseurs de primes -----
const LMAT={};function reskin(e,col,emi){const k=col+'|'+emi;const M=LMAT[k]||(LMAT[k]=new THREE.MeshStandardMaterial({color:col,map:HULLT,metalness:DESK?.6:.3,roughness:.4,emissive:emi,emissiveIntensity:.25}));e.mesh.traverse(o=>{if(o.isMesh&&o.material===enemyMat(e.ty))o.material=M})}
const HUNTN=['Vex la Traqueuse','Orik Main-Froide','Sable Noir','Kessa « l\'Épine »','Le Collecteur','Dray Tête-de-Fer','Mina Sans-Pitié','Garr l\'Ancien'];
function polSpawn(n,st){const z=Math.max(1,danger());for(let i=0;i<n;i++){const a=Math.random()*TAU,p=(st?_v.set(st.x,st.y,st.z):S.pos).clone().add(new V3(Math.cos(a)*600,rv(150),Math.sin(a)*600));const e=mkEnemy('chasseur',p,z);e.kind='police';e.hp*=1.8;e.mhp=e.hp;e.rw=0;reskin(e,0xe8eef8,0x2a6aff);e.label='Police';e.lc='#7ab6ff';en.push(e);LS.police++}toast('🚔 La police de l\'Alliance te prend en chasse !')}
function huntSpawn(){const z=Math.max(1,danger()),s=stars(),a=Math.random()*TAU,p=S.pos.clone().add(new V3(Math.cos(a)*1300,rv(250),Math.sin(a)*1300));const e=mkEnemy('chasseur',p,z);e.kind='hunter';e.hp*=3+s*.6;e.mhp=e.hp;e.dmg*=1.4;e.sp*=1.12;e.rw=150+s*60;reskin(e,0x1c1c22,0xff7a1a);e.label=HUNTN[Math.random()*HUNTN.length|0];e.lc='#ffb060';en.push(e);
if(s>=3){const w=mkEnemy('pirate',p.clone().add(new V3(40,10,40)),z);w.kind='hunter';w.hp*=2;w.mhp=w.hp;w.rw=60;reskin(w,0x2a2a30,0xff7a1a);w.label='Acolyte';w.lc='#ffb060';w.lead=e;w.side=1;en.push(w)}toast('🎯 Chasseur de primes en approche : '+e.label+' !');SFX.alarm()}
{const _he=hitEnemy;hitEnemy=function(e,d,p){const was=e.dead;if(e.kind=='police'&&!e.hitB){e.hitB=1;addBounty(250,'Tu as tiré sur la police')}_he(e,d,p);if(!was&&e.dead){if(e.kind=='police'){LS.police=Math.max(0,LS.police-1);addBounty(1500,'Policier abattu');if(G.rep)G.rep.alliance=Math.max(0,(G.rep.alliance||0)-50);if(typeof warAdd=='function')warAdd(-5)}if(e.kind=='hunter'&&e.label!='Acolyte'){toast('🎯 '+e.label+' est hors d\'état de nuire ! +'+fmt(e.rw)+' ¢');gainXP(120)}}}}
function lawTick(dt){lawScan(dt);if(LAW.b>0){LAW.b=Math.max(0,LAW.b-LAW.b*.01/60*dt-.4*dt);if(LAW.b<1)LAW.b=0}if(S.docked||S.dead||S.entry)return;smugRisk(dt);const s=stars();if(!s)return;
LS.polT-=dt;if(LS.polT<=0){LS.polT=35+Math.random()*30;let near=null;for(const st of stations)if(stFac(st)=='alliance'&&S.pos.distanceTo(_v.set(st.x,st.y,st.z))<3500)near=st;const cur=en.filter(e=>e.kind=='police').length;if(near&&cur<Math.min(4,1+s))polSpawn(Math.min(2,Math.min(4,1+s)-cur),near)}
LS.huntT-=dt;if(LS.huntT<=0){LS.huntT=Math.max(110,280-s*35)*(.7+Math.random()*.6);if(!BOSS&&en.filter(e=>e.kind=='hunter').length<1)huntSpawn()}}
// ----- risques en route pour les contrebandiers : patrouilles douanières (Alliance, frontière), pirates rivaux (territoire pirate) -----
function smugRisk(dt){if(!illQ()||LS.scan||(typeof RC!='undefined'&&RC.on)||BOSS){return}LS.patT-=dt;if(LS.patT>0)return;LS.patT=110+Math.random()*90;const c=typeof ctlOf=='function'?ctlOf(secOf(S.pos.x,S.pos.z)):'alliance';
for(const st of stations)if(S.pos.distanceTo(_v.set(st.x,st.y,st.z))<2500)return;if(c!='pirates'){if(Math.random()<.6)patStart()}else if(Math.random()<.45)ambush()}
function patStart(){const z=Math.max(1,danger());fwd();const base=S.pos.clone().addScaledVector(_f,900).add(new V3(rv(200),rv(80),rv(200)));const pat=[];for(let i=0;i<2;i++){const e=mkEnemy('chasseur',base.clone().add(new V3(i*40,0,i*30)),z);e.kind='police';e.hp*=1.8;e.mhp=e.hp;e.rw=0;e.passive=1;e.cd=1e9;reskin(e,0xe8eef8,0x2a6aff);e.label='Douane';e.lc='#7ab6ff';en.push(e);pat.push(e)}
LS.scan={src:pat[0],pat,o:S.pos.clone(),t:0,dur:7};toast('🚔 Patrouille douanière : laisse-toi contrôler… ou file à pleine vitesse (1 300 m) !');SFX.alarm()}
function patScan(sc,dt){const e=sc.src;if(!e||e.dead||!en.includes(e)){LS.scan=null;hideBeam(LS.beam);return}sc.t+=dt;if(!LS.beam)LS.beam=mkBeam(0x5aa8ff);placeBeam(LS.beam,e.pos,S.pos,.4,false);if(Math.random()<dt*2)tone(900,1400,.09,'sine',.025);const fled=S.pos.distanceTo(sc.o)>1300;
if(fled||!illQ()){LS.scan=null;hideBeam(LS.beam);if(fled&&illQ()){addBounty(400+illV()*.5,'Fuite devant la douane');for(const p of sc.pat){p.passive=0;p.cd=1;p.label='Police'}toast('🚔 La patrouille ouvre le feu !')}else patLeave(sc.pat);return}
if(sc.t>=sc.dur){LS.scan=null;hideBeam(LS.beam);inspect({n:'la patrouille'},false);patLeave(sc.pat)}}
function patLeave(L){setTimeout(()=>{for(const e of L){if(e.dead||!e.passive)continue;e.dead=1;fxGlow(e.pos,0x8fd0ff,40,.4,2);e.mesh.parent&&e.mesh.parent.remove(e.mesh)}},2500)}
function ambush(){const z=Math.max(1,danger());fwd();for(let i=0;i<3;i++){const a=Math.random()*TAU,e=mkEnemy(i==2&&z>=2?'chasseur':'pirate',S.pos.clone().add(new V3(Math.cos(a)*1000,rv(150),Math.sin(a)*1000)),z);en.push(e)}toast('🏴‍☠️ Des pirates rivaux en veulent à ta cargaison !');SFX.alarm()}
STICK.push(lawTick);
// une patrouille pacifique ne peut pas être prise pour cible
{const _st=spaceTargets;spaceTargets=function(){return _st().filter(T=>!T.passive)}}
// ----- HUD : prime, scan en cours, noms des chasseurs -----
TICK.push(()=>{const s=stars();setD('want',s?'inline-flex':'none');if(s)setH('want',ICO('skull')+' '+'★'.repeat(s)+'☆'.repeat(5-s)+' '+fmt(Math.round(LAW.b/10)*10)+' ¢')});
{const _ci=contentInfo;contentInfo=function(){let s=_ci();if(LS.scan&&mode=='space')s+=(s?'<br>':'')+`<span style="color:#7ab6ff">🛃 ${LS.scan.src?'Contrôle de la patrouille':'Scan douanier'} : ${Math.min(100,LS.scan.t/LS.scan.dur*100|0)} % — ${illQ()} contrebande${illQ()>1?'s':''} à bord${LS.scan.src?' · fuite : '+Math.round(S.pos.distanceTo(LS.scan.o))+' / 1 300 m':''}</span>`;return s}}
{const _ov=overlay;overlay=function(){_ov();if(mode!='space'||S.dead)return;for(const e of en){if(!e.label)continue;const d=e.pos.distanceTo(S.pos);if(d<1600)label({x:e.pos.x,y:e.pos.y+30,z:e.pos.z},e.label,e.lc||'#fff',1600)}}}
