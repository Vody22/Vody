// ===== MULTIJOUEUR + : dreadnought mondial, chasses de groupe, échanges entre joueurs =====
// ---------- dreadnought pirate : apparaît pour tout le monde à heure fixe (toutes les 20 min, pendant 8 min) ----------
const WB_PERIOD=20*60e3,WB_DUR=8*60e3,WB_HP=2600;
const WB={k:-1,mesh:null,tgt:null,myD:0,others:new Map(),dead:false,done:false,cd:3,esc:30,warned:-1,pos:new V3(),hitT:-9};
function wbSlot(){const now=Date.now(),k=Math.floor(now/WB_PERIOD),ph=now-k*WB_PERIOD;return{k,active:ph<WB_DUR,ph,left:WB_DUR-ph,next:WB_PERIOD-ph}}
function wbCenter(k){const a=h3(k,7,3,11)*TAU,r=5500+h3(k,9,1,12)*4500;return new V3(Math.cos(a)*r,(h3(k,2,2,13)-.5)*900,Math.sin(a)*r)}
function wbMesh(){const g=new THREE.Group(),H=new THREE.MeshStandardMaterial({color:0x4a1e26,map:HULLT,normalMap:HULLN,metalness:DESK?.7:.4,roughness:.4}),D=new THREE.MeshStandardMaterial({color:0x1e2026,metalness:.6,roughness:.5});
const add=(geo,m,x,y,z,rx=0,ry=0,rz=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);g.add(o);return o};
add(lathe([[0,-150],[26,-110],[48,-30],[52,60],[40,130],[0,134]],10),H,0,0,0).scale.set(1,.45,1);add(new THREE.BoxGeometry(40,24,70),H,0,22,40);add(new THREE.BoxGeometry(22,16,26),D,0,40,52);
for(const s of[-1,1]){add(new THREE.BoxGeometry(80,5,46),H,s*62,-2,30,0,0,s*.06);add(new THREE.BoxGeometry(10,34,30),D,s*100,6,40);for(let k=0;k<3;k++)add(new THREE.CylinderGeometry(3,3,26,10).rotateX(Math.PI/2),D,s*(28+k*18),10,-30)}
const eng=[];for(const[x,y]of[[-26,-6],[26,-6],[-13,12],[13,12],[0,-14]]){add(new THREE.CylinderGeometry(9,11,20,14).rotateX(Math.PI/2),D,x,y,138);const s=sprite(0xff5030,70);s.position.set(x,y,152);g.add(s);eng.push(s)}
for(let i=0;i<22;i++){const s=sprite(i%3?0xffb060:0xff3030,9);s.position.set(rv(55),rv(18)+6,rv(240));g.add(s)}const core=sprite(0xff3020,90,.8);core.position.set(0,-10,20);g.add(core);g.scale.setScalar(1.4);g.userData={eng,core};return g}
function wbSpawn(k){WB.k=k;WB.myD=0;WB.others.clear();WB.dead=false;WB.done=false;WB.mesh=wbMesh();scene.add(WB.mesh);WB.tgt={pos:WB.pos,r:110,foe:1,max:2600,cone:.4,w:.5,boss:1,hit:(d,p)=>{if(WB.dead)return;WB.myD+=d;WB.hitT=t;boom3(p,8,0xffaa66,40);SFX.tick()}}}
function wbClear(){if(WB.mesh){scene.remove(WB.mesh);WB.mesh.traverse(o=>{if(o.geometry)o.geometry.dispose()})}WB.mesh=null;WB.tgt=null}
const wbTotal=()=>{let s=WB.myD;for(const d of WB.others.values())s+=d;return s};
const wbHP=()=>Math.max(0,WB_HP-wbTotal());
function updWB(dt){const sl=wbSlot();if(sl.k!==WB.k){wbClear();WB.k=sl.k;WB.myD=0;WB.others.clear();WB.dead=false;WB.done=false}
if(!sl.active){if(WB.mesh)wbClear();return}const C=wbCenter(sl.k),a=sl.ph/1000*.012;WB.pos.set(C.x+Math.cos(a)*500,C.y+Math.sin(a*2)*60,C.z+Math.sin(a)*500);
if(WB.warned!==sl.k&&mode=='space'){WB.warned=sl.k;toast('⚠ Un dreadnought pirate est apparu ! Abattez-le à plusieurs avant qu\'il reparte (8 min)');SFX.alarm()}
const near=mode=='space'&&S.pos.distanceTo(WB.pos)<9000;if(!near||WB.done){if(WB.mesh&&!WB.dead)wbClear();return}if(!WB.mesh)wbSpawn(sl.k);
WB.mesh.position.copy(WB.pos);WB.mesh.lookAt(C.x+Math.cos(a+.05)*500,WB.pos.y,C.z+Math.sin(a+.05)*500);WB.mesh.rotateY(Math.PI);for(const s of WB.mesh.userData.eng)s.scale.setScalar(60+Math.random()*18);
if(!WB.dead&&wbHP()<=0){WB.dead=true;wbDeath();return}if(WB.dead)return;
// tirs et escorte
const d=S.pos.distanceTo(WB.pos);WB.cd-=dt;if(WB.cd<=0&&d<1800&&!S.dead&&!S.docked){WB.cd=2.2;for(let i=0;i<4;i++){const o=WB.pos.clone().add(new V3(rv(60),rv(20),rv(120))),dir=S.pos.clone().addScaledVector(S.vel,d/400*.7).sub(o).normalize().add(new V3(rv(.04),rv(.04),rv(.04))).normalize(),m=mkEB(0xff5040);m.position.copy(o);EB.push({m,v:dir.multiplyScalar(400),l:5,dmg:7,home:i==0&&Math.random()<.4})}SFX.eshoot()}
WB.esc-=dt;if(WB.esc<=0&&d<2500){WB.esc=40;for(let i=0;i<2;i++)en.push(mkEnemy(Math.random()<.5?'chasseur':'pirate',WB.pos.clone().add(new V3(rv(200),rv(80),rv(200))),Math.max(1,danger())))}}
function wbDeath(){const p=WB.pos.clone(),tot=Math.max(1,wbTotal()),share=WB.myD/tot;for(let i=0;i<7;i++)setTimeout(()=>{boom3(p.clone().add(new V3(rv(120),rv(40),rv(200))),60,0xff8040,160,true);SFX.boom()},i*260);
setTimeout(()=>{wbClear();WB.done=true},2200);if(WB.myD>0){const cr=1500+Math.round(3500*share/10)*10;G.cr+=cr;G.kills++;gainXP(300+400*share);addRep('alliance',150);setTimeout(()=>{toast('🏆 Dreadnought détruit ! Ta part : '+Math.round(share*100)+' % · +'+fmt(cr)+' ¢');SFX.win()},1800);if(share>=.05)setTimeout(giveBlueprint,4500);save()}
else setTimeout(()=>toast('Le dreadnought a été détruit par d\'autres pilotes'),1500)}
{const _st=spaceTargets;spaceTargets=function(){const r=_st();if(WB.tgt&&!WB.dead)r.push(WB.tgt);return r}}
// ---------- chasses de groupe ----------
G.gm=null;const GMX={seen:new Set(),offers:new Map()};
function gmStart(){if(!MP.room){toast('Le multijoueur n\'est pas disponible');return}if(G.gm){toast('Une chasse de groupe est déjà en cours');return}const n=6+2*Math.min(3,MP.others.size);G.gm={id:(MP.me||'moi')+'-'+Date.now().toString(36),by:MP.me,host:1,n,k:0,exp:Date.now()+10*60e3};
toast('🎯 Chasse de groupe lancée : '+n+' pirates à abattre ensemble (10 min)');SFX.buy();mpSend(true);mpPanel()}
function gmJoin(id){const o=GMX.offers.get(id);if(!o||G.gm)return;G.gm={id,by:o.by,host:0,n:o.n,k:0,exp:o.exp};toast('🎯 Tu as rejoint la chasse de '+o.nick);SFX.buy();mpSend(true);mpPanel()}
const gmTotal=()=>{if(!G.gm)return 0;let s=G.gm.k;for(const o of MP.others.values())if(o.gm&&o.gm.id===G.gm.id)s+=o.gm.k|0;return s};
const gmCount=()=>{if(!G.gm)return 0;let n=1;for(const o of MP.others.values())if(o.gm&&o.gm.id===G.gm.id)n++;return n};
function updGM(){if(!G.gm)return;if(gmTotal()>=G.gm.n){const n=gmCount(),cr=900+150*n;G.cr+=cr;gainXP(200);addRep('alliance',80);toast('🏆 Chasse de groupe réussie ! +'+fmt(cr)+' ¢');SFX.win();G.gm=null;mpSend(true);save();return}
if(Date.now()>G.gm.exp){toast('⌛ Chasse de groupe terminée sans succès');G.gm=null;mpSend(true)}}
{const _he2=hitEnemy;hitEnemy=function(e,d,p){const was=e.dead;_he2(e,d,p);if(!was&&e.dead&&G.gm){G.gm.k++;mpSend(true)}}}
// ---------- échanges entre joueurs ----------
const TRX={out:[],n:0,inc:new Map(),pend:new Map(),last:new Map(),sel:null};
function trSend(to,ty,o){TRX.out.push({i:++TRX.n,to,ty,...o});if(TRX.out.length>6)TRX.out.shift();mpSend(true)}
function trOffer(to,it,q,p){q=Math.floor(q);p=Math.max(0,Math.floor(p));const have=G.cargo[it]||0;if(q<=0||q>have){toast('Quantité invalide');return}G.cargo[it]-=q;if(!G.cargo[it])delete G.cargo[it];const id=Date.now().toString(36)+Math.random().toString(36).slice(2,5);
TRX.pend.set(id,{to,it,q,p,exp:Date.now()+120e3});trSend(to,'offer',{id,it,q,p});toast('📨 Offre envoyée');SFX.tick();trRender()}
function trRefund(id,why){const o=TRX.pend.get(id);if(!o)return;TRX.pend.delete(id);const room=cap()-cargoUsed(),k=Math.min(o.q,room);if(k)G.cargo[o.it]=(G.cargo[o.it]||0)+k;if(o.q-k>0)G.stash[o.it]=(G.stash[o.it]||0)+(o.q-k);toast(why+' — marchandise récupérée');trRender()}
function trAccept(id){const o=TRX.inc.get(id);if(!o)return;if(G.cr<o.p){toast('Pas assez de crédits');return}if(cargoUsed()+o.q>cap()){toast('Pas assez de place dans la soute');return}G.cr-=o.p;G.cargo[o.it]=(G.cargo[o.it]||0)+o.q;TRX.inc.delete(id);trSend(o.from,'acc',{id});toast('🤝 Échange conclu : +'+o.q+' '+matG(o.it).n);SFX.coin();save();trRender()}
function trRefuse(id){const o=TRX.inc.get(id);if(!o)return;TRX.inc.delete(id);trSend(o.from,'ref',{id});trRender()}
function trIn(o,list){const last=TRX.last.get(o.peer)||0;let mx=last;for(const m of list){if(!m||typeof m.i!='number'||m.i<=last||m.to!==MP.me)continue;mx=Math.max(mx,m.i);const g=GOODS.find(x=>x.id==m.it);
if(m.ty=='offer'&&g){const q=clamp(m.q|0,1,999),p=clamp(m.p|0,0,1e7);TRX.inc.set(m.id,{from:o.peer,nick:mpName(o),it:m.it,q,p,exp:Date.now()+120e3});toast('📨 '+mpName(o)+' te propose '+q+' '+g.n+(p?' pour '+fmt(p)+' ¢':' (cadeau)'));SFX.disc();trRender(true)}
else if(m.ty=='acc'){const P=TRX.pend.get(m.id);if(P){TRX.pend.delete(m.id);G.cr+=P.p;toast('🤝 '+mpName(o)+' a accepté : +'+fmt(P.p)+' ¢');SFX.coin();save();trRender()}}
else if(m.ty=='ref')trRefund(m.id,mpName(o)+' a refusé')}TRX.last.set(o.peer,Math.max(mx,list.reduce((a,m)=>Math.max(a,m&&m.i||0),0)))}
function trRender(open){const el=$('trpanel');if(open){el.style.display='flex'}if(el.style.display!='flex')return;let h=`<div class="phead"><b>${ICO('swap')} Échanges</b><button id="trx">${ICO('close')}</button></div>`;
if(TRX.inc.size){h+='<div class="psec"><b class="pt">Offres reçues</b>';for(const[id,o]of TRX.inc){const g=matG(o.it);h+=`<div class="bmod">${ICO('cargo')}<div><b>${o.nick}</b><small>${o.q} ${g.ic} ${g.n} · ${o.p?fmt(o.p)+' ¢':'cadeau'}</small></div><span><button data-ta="${id}">Accepter</button><button data-tr="${id}">Refuser</button></span></div>`}h+='</div>'}
const others=[...MP.others.values()];h+=`<div class="psec"><b class="pt">Proposer un échange</b>`;if(!others.length)h+='<small>Aucun autre pilote connecté.</small>';else{const items=Object.keys(G.cargo).filter(k=>G.cargo[k]>0);
h+=`<label class="orow"><span>Pilote</span><select id="trto">${others.map(o=>`<option value="${o.peer}">${mpName(o).replace(/[<>&"]/g,'')}</option>`).join('')}</select></label>`;
h+=items.length?`<label class="orow"><span>Marchandise</span><select id="trit">${items.map(k=>`<option value="${k}">${matG(k).n} (${G.cargo[k]})</option>`).join('')}</select></label><label class="orow"><span>Quantité</span><input id="trq" type="number" min="1" value="1"></label><label class="orow"><span>Prix (¢, 0 = cadeau)</span><input id="trp" type="number" min="0" value="0"></label><div class="obtns"><button id="trgo">Envoyer l'offre</button></div>`:'<small>Ta soute est vide : rien à proposer.</small>'}h+='</div>';
if(TRX.pend.size)h+=`<div class="psec"><b class="pt">En attente</b><small>${[...TRX.pend.values()].map(o=>o.q+' '+matG(o.it).n+' · '+(o.p?fmt(o.p)+' ¢':'cadeau')).join('<br>')}</small></div>`;
el.innerHTML=h;$('trx').onclick=()=>{el.style.display='none'};el.querySelectorAll('[data-ta]').forEach(b=>b.onclick=()=>trAccept(b.dataset.ta));el.querySelectorAll('[data-tr]').forEach(b=>b.onclick=()=>trRefuse(b.dataset.tr));
const go=$('trgo');if(go)go.onclick=()=>trOffer($('trto').value,$('trit').value,+$('trq').value,+$('trp').value)}
// ---------- réseau : champs en plus dans la présence ----------
function mpExtraOut(){const o={tr:TRX.out.slice(-6)};if(WB.myD>0)o.wb={k:WB.k,d:Math.round(WB.myD)};if(G.gm)o.gm={id:G.gm.id,n:G.gm.n,exp:G.gm.exp,k:G.gm.k,host:G.gm.host?1:0};return o}
{const _mpp=mpPeer;mpPeer=function(p){_mpp(p);if(p.kind!='viewer'||p.sameTab)return;const o=MP.others.get(p.peer),pr=p.presence||{};if(!o)return;
if(pr.wb&&pr.wb.k===WB.k)WB.others.set(p.peer,clamp(+pr.wb.d||0,0,WB_HP*2));
o.gm=pr.gm&&typeof pr.gm.id=='string'?{id:pr.gm.id.slice(0,40),n:clamp(pr.gm.n|0,1,30),exp:+pr.gm.exp||0,k:clamp(pr.gm.k|0,0,99),host:!!pr.gm.host}:null;
if(o.gm&&o.gm.host&&!GMX.offers.has(o.gm.id)&&o.gm.exp>Date.now()){GMX.offers.set(o.gm.id,{by:p.peer,nick:mpName(o),n:o.gm.n,exp:o.gm.exp});if(!G.gm&&!o.first){toast('🎯 '+mpName(o)+' lance une chasse de groupe — rejoins-la dans le panneau Multijoueur');SFX.disc()}}
if(Array.isArray(pr.tr))trIn(o,pr.tr)}}
{const _mpr=mpRemove;mpRemove=function(peer){for(const[id,P]of TRX.pend)if(P.to===peer)trRefund(id,'Le pilote est parti');for(const[id,o]of TRX.inc)if(o.from===peer)TRX.inc.delete(id);_mpr(peer)}}
// panneau multijoueur : chasse de groupe, échanges, dreadnought
{const _mpP=mpPanel;mpPanel=function(){_mpP();let ex=$('mpextra');if(!ex){ex=document.createElement('div');ex.id='mpextra';ex.className='psec';$('mplist').after(ex)}const sl=wbSlot(),mm=v=>Math.ceil(v/60e3);
let h=`<b class="pt">Événements</b><small>${sl.active?`⚠ Dreadnought actif : encore ${mm(sl.left)} min${WB.myD>0?' · tes dégâts : '+Math.round(WB.myD):''}`:`Prochain dreadnought dans ${mm(sl.next)} min`}</small>`;
if(G.gm)h+=`<small>🎯 Chasse de groupe : <b>${gmTotal()}/${G.gm.n}</b> pirates · ${gmCount()} pilote${gmCount()>1?'s':''} · ${mm(G.gm.exp-Date.now())} min</small>`;
else{const offs=[...GMX.offers.entries()].filter(([,o])=>o.exp>Date.now()&&MP.others.has(o.by));h+=`<div class="obtns"><button id="gmgo">Lancer une chasse de groupe</button>${offs.map(([id,o])=>`<button data-gj="${id}">Rejoindre ${o.nick.replace(/[<>&"]/g,'')}</button>`).join('')}</div>`}
h+=`<div class="obtns"><button id="trop">${ICO('swap')} Échanger avec un pilote${TRX.inc.size?' ('+TRX.inc.size+')':''}</button></div>`;ex.innerHTML=h;const g=$('gmgo');if(g)g.onclick=gmStart;ex.querySelectorAll('[data-gj]').forEach(b=>b.onclick=()=>gmJoin(b.dataset.gj));$('trop').onclick=()=>trRender(true)}}
// ---------- boucle ----------
{const _um=updMP;updMP=function(dt){_um(dt);try{updWB(dt);updGM();const now=Date.now();for(const[id,P]of TRX.pend)if(now>P.exp)trRefund(id,'Offre expirée');for(const[id,o]of TRX.inc)if(now>o.exp){TRX.inc.delete(id);trRender()}}catch(e){console.warn(e)}}}
// repère du dreadnought (bord d'écran + radar)
{const _ov=overlay;overlay=function(){_ov();const sl=wbSlot();if(mode!='space'||!sl.active||WB.done||S.dead)return;if(!WB.dead)edgeMarker(WB.pos,'#ff6a8a','Dreadnought · '+Math.ceil(sl.left/60e3)+' min','☠');
if(WB.mesh&&!WB.dead&&S.pos.distanceTo(WB.pos)<5000){const W=innerWidth,w=Math.min(W*.6,520),x=(W-w)/2,y=DESK?58:150,k=wbHP()/WB_HP;OX.fillStyle='rgba(0,0,0,.55)';OX.fillRect(x,y,w,8);OX.fillStyle='#ff4b5c';OX.fillRect(x,y,w*k,8);OX.font="700 12px 'Chakra Petch',system-ui";OX.textAlign='center';OX.fillStyle='#ffb0b8';OX.fillText('Dreadnought pirate · '+Math.ceil(wbHP())+' / '+WB_HP+(WB.others.size?' · '+(WB.others.size+1)+' pilotes':''),W/2,y-6)}}}
{const _mr=mpRadar;mpRadar=function(blip){_mr(blip);if(WB.mesh&&!WB.dead)blip(WB.pos,'#ff6a8a',4.5,true,true)}}
