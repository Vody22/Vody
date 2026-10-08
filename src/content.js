// ===== CONTENU : vaisseaux, armes, commerce, boutique =====
const _c1=new V3(),_c2=new V3(),_c3=new V3();
// ----- variantes de vaisseaux -----
const _buildShipBase=buildShip;
buildShip=function(){const root=_buildShipBase(),b=root.userData.body,h=G.ship||'eclaireur';if(h=='eclaireur')return root;
const PAL={intercepteur:[0xdfe3ea,0xb3202c],cargo:[0xd9a632,0x4e545c],faucon:[0x7d9a66,0x45524c],leviathan:[0xe9edf2,0x24386e]}[h];
b.traverse(o=>{if(o.isMesh&&o.material&&o.material.name=='hull')o.material.color.setHex(PAL[0]);if(o.isMesh&&o.material&&o.material.name=='wing')o.material.color.setHex(PAL[1])});
const M=new THREE.MeshStandardMaterial({color:PAL[0],map:HULLT,metalness:DESK?.7:.25,roughness:.35}),D=new THREE.MeshStandardMaterial({color:0x2a3038,metalness:.6,roughness:.45}),A=new THREE.MeshStandardMaterial({color:PAL[1],map:HULLT,metalness:.5,roughness:.4});
const add=(g,m,x,y,z,rx=0,ry=0,rz=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);b.add(o);return o};
if(h=='intercepteur'){b.scale.set(.82,.85,1.18);b.traverse(o=>{if(o.isMesh&&o.material.name=='wing'&&o.geometry.type=='ExtrudeGeometry')o.rotation.y+=o.scale.x>0?.32:-.32});
for(const s of[-1,1]){add(new THREE.BoxGeometry(2.6,.12,1.1),A,s*1.9,0,-6.2,0,s*.4,0);add(new THREE.BoxGeometry(.12,1.6,2),A,s*.6,1.1,4,0,0,s*.5)}}
else if(h=='cargo'){b.scale.set(1.3,1.25,1.05);for(const s of[-1,1]){add(new THREE.BoxGeometry(2.6,2.2,7),A,s*3.4,-1.2,1.2);for(let k=0;k<3;k++)add(new THREE.BoxGeometry(2.7,.15,.3),D,s*3.4,-.05,-1.4+k*2.4)}add(new THREE.BoxGeometry(3,2,4.5),M,0,1.6,2.4);add(new THREE.BoxGeometry(3.1,.2,4.6),A,0,2.65,2.4)}
else if(h=='faucon'){b.scale.setScalar(1.12);for(const s of[-1,1]){add(new THREE.CylinderGeometry(.28,.28,6,8).rotateX(Math.PI/2),D,s*2.6,-.7,-2.4);add(new THREE.BoxGeometry(1.4,.5,5),M,s*2.6,-.7,.6);add(new THREE.BoxGeometry(.25,1.4,3.2),A,s*5.4,.5,3.2,0,0,s*.6)}add(new THREE.BoxGeometry(2.4,.4,6),D,0,1.25,-.5)}
else if(h=='leviathan'){b.scale.setScalar(1.55);for(const s of[-1,1]){add(lathe([[.9,-3],[1.3,-1.5],[1.3,3],[1,3.8],[0,3.9]],12),M,s*4.6,-.4,2.6);const c=add(new THREE.CircleGeometry(.9,14),new THREE.MeshBasicMaterial({color:0x7fd8ff}),s*4.6,-.4,6.5);
const tur=add(new THREE.SphereGeometry(.9,12,8,0,TAU,0,Math.PI/2),D,s*1.2,1.05,1.6);add(new THREE.CylinderGeometry(.12,.12,2.4,6).rotateX(Math.PI/2),D,s*1.2,1.45,.3)}
add(new THREE.BoxGeometry(1.8,1.4,2.6),M,0,1.7,2.8);add(new THREE.BoxGeometry(1.9,.3,.8),new THREE.MeshBasicMaterial({color:0x9fe6ff}),0,2.1,1.6);for(let k=0;k<4;k++)add(new THREE.BoxGeometry(3.6,.25,1.4),A,0,-1.05,-3+k*2.2)}
b.traverse(o=>{if(o.isMesh&&!o.material.blending)o.castShadow=DESK&&mode=='surf'});return root};
function buyShip(id){const H=HULLS[id];if(G.owned.includes(id)){if(G.ship!=id){G.ship=id;S.hp=maxhp();rebuildShip();toast('Vaisseau : '+H.n);SFX.buy();save()}return}
if(G.cr<H.price){toast('Pas assez de crédits');return}if(cargoUsed()>HULLS[id].cap+10*(G.u[2]-1)*HULLS[id].cap/15){toast('Vide ta soute avant de changer de vaisseau');return}
G.cr-=H.price;G.owned.push(id);G.ship=id;S.hp=maxhp();rebuildShip();toast('Nouveau vaisseau : '+H.n+' !');SFX.win();save()}
// ----- armes -----
const WPN={canon:{n:'Canon',ic:'⚔',price:0,d:'Tir rapide, munitions infinies.'},missile:{n:'Missiles',ic:'🚀',price:800,am:'missile',d:'Tête chercheuse, gros dégâts de zone.'},laser:{n:'Laser',ic:'🔆',price:1600,d:'Rayon continu. Attention à la surchauffe.'},mine:{n:'Mines',ic:'💣',price:600,am:'mine',d:'Larguées derrière toi, explosent au contact.'}};
const AMMO={missile:{n:'10 missiles',q:10,price:150},mine:{n:'5 mines',q:5,price:100}};
const curW=()=>G.w[G.wi%G.w.length]||'canon';
function cycleW(dir=1){if(G.w.length<2)return;G.wi=(G.wi+dir+G.w.length)%G.w.length;toast(WPN[curW()].ic+' '+WPN[curW()].n);SFX.tick()}
const dmgMul=()=>G.u[0]*HS().dmg;
let MIS=[],MINES=[];const LZ={on:0,heat:0,over:0,acc:new Map()};
const MISG=lathe([[0,-1.8],[.28,-1.2],[.28,1.4],[0,1.5]],8),MISM=new THREE.MeshStandardMaterial({color:0xdde3ea,metalness:.6,roughness:.3});
const MINEG=new THREE.IcosahedronGeometry(1.6,0),MINEM=new THREE.MeshStandardMaterial({color:0x3a3f46,metalness:.7,roughness:.35,emissive:0x400000});
const LZB=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,1,8,1,true).rotateX(Math.PI/2).translate(0,0,-.5),new THREE.MeshBasicMaterial({color:0x60f0ff,transparent:true,opacity:.85,blending:ADDB,depthWrite:false}));
const LZC=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,1,6,1,true).rotateX(Math.PI/2).translate(0,0,-.5),new THREE.MeshBasicMaterial({color:0xffffff,blending:ADDB,transparent:true,depthWrite:false}));
const LZG=sprite(0x80f4ff,22,.9);LZB.frustumCulled=LZC.frustumCulled=false;
function fireW(dt,TG){const w=curW();if(w=='canon'){LZ.on=0;fire(dt);return}fcd-=dt;LZ.on=0;if(!isFire()||S.docked||S.entry||S.ascent||S.dead)return;
if(w=='laser'){if(LZ.over<=0)LZ.on=1;return}if(fcd>0)return;const am=WPN[w].am;if(G.ammo[am]<=0){fcd=1.2;toast('Plus de '+(am=='missile'?'missiles':'mines')+' — achète-en en station');return}
G.ammo[am]--;if(w=='missile'){fcd=.5;launchMissile()}else{fcd=.7;dropMine()}}
function launchMissile(){fwd();const side=(MIS.length%2?1:-1)*3.5;_c1.set(side,-1,-4).applyQuaternion(S.q);const m=new THREE.Mesh(MISG,MISM);m.position.copy(S.pos).add(_c1);const g=sprite(0xffa040,7);g.position.z=1.8;m.add(g);curScene().add(m);
mpShot(m.position,_f,'m');MIS.push({m,pos:m.position,vel:_f.clone().multiplyScalar(S.spd*.6+120).add(_c1.clone().normalize().multiplyScalar(40)),tg:lock,l:6,arm:.15});SFX.eshoot()}
function dropMine(){fwd();const m=new THREE.Mesh(MINEG,MINEM);for(let i=0;i<6;i++){const sp=new THREE.Mesh(new THREE.ConeGeometry(.35,1.4,5),MINEM);const d=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]][i];sp.position.set(d[0]*1.6,d[1]*1.6,d[2]*1.6);sp.lookAt(d[0]*5,d[1]*5,d[2]*5);sp.rotateX(Math.PI/2);m.add(sp)}
const l=sprite(0xff3030,6);m.add(l);m.position.copy(S.pos).addScaledVector(_f,-14);curScene().add(m);MINES.push({m,pos:m.position,vel:_f.clone().multiplyScalar(S.spd*.15),arm:1,l:45,blink:l});SFX.tick()}
function aoe(p,R,dmg,TG){for(const T of TG){if(T.dead||T.gone)continue;const d=T.pos.distanceTo(p);if(d<R+(T.r||0))T.hit(dmg*(1-.5*d/R),T.pos.clone())}}
function updWeapons(dt,TG){const sc=curScene();
for(const M of MIS){M.l-=dt;M.arm-=dt;let tg=M.tg;if(tg&&(tg.dead||tg.gone||(tg.hp!=null&&tg.hp<=0)))tg=M.tg=null;const sp=Math.min(720,M.vel.length()+500*dt);
if(tg){_c2.copy(tg.pos).sub(M.pos).normalize();const cur=M.vel.clone().normalize();const dd=tg.pos.distanceTo(M.pos);cur.lerp(_c2,Math.min(1,dt*(dd<200?14:6))).normalize();M.vel.copy(cur).multiplyScalar(sp)}else M.vel.setLength(sp);
M.pos.addScaledVector(M.vel,dt);M.m.lookAt(_c3.copy(M.pos).sub(M.vel));if(Math.random()<.8)FIRE.emit(M.pos.x,M.pos.y,M.pos.z,rv(8),rv(8),rv(8),.35,.9,.45,.12,.4);if(Math.random()<.5)SPK.emit(M.pos.x,M.pos.y,M.pos.z,rv(4),rv(4),rv(4),.9,.25,.25,.28,.3);
let hit=null;if(M.arm<=0)for(const T of TG){if(T.dead||T.gone)continue;if(T.pos.distanceTo(M.pos)<(T.r||6)+(T===M.tg?14:4)){hit=T;break}}
if(mode=='surf'&&M.pos.y<SURF.height(M.pos.x,M.pos.z)+1)M.l=0;
if(hit||M.l<=0){boom3(M.pos,26,0xffa040,80,true);SFX.boom();aoe(M.pos,50,9*dmgMul(),TG);M.l=0;M.m.parent&&M.m.parent.remove(M.m)}}MIS=MIS.filter(M=>M.l>0);
for(const N of MINES){N.l-=dt;N.arm-=dt;N.pos.addScaledVector(N.vel,dt);N.vel.multiplyScalar(Math.pow(.4,dt));N.m.rotation.y+=dt;N.blink.visible=N.arm<=0&&Math.sin(t*10)>0;let boom=N.l<=0;
if(N.arm<=0&&!boom)for(const T of TG){if(!T.foe||T.dead||T.gone)continue;if(T.pos.distanceTo(N.pos)<45+(T.r||0)){boom=true;break}}
if(boom){boom3(N.pos,40,0xff7030,110,true);SFX.boom();aoe(N.pos,95,16*dmgMul(),TG);N.l=0;N.m.parent&&N.m.parent.remove(N.m)}}MINES=MINES.filter(N=>N.l>0);
// laser
if(LZ.over>0){LZ.over-=dt;if(LZ.over<=0)LZ.heat=.3}
if(LZ.on){LZ.heat+=dt*.42;if(LZ.heat>=1){LZ.heat=1;LZ.over=2.4;LZ.on=0;toast('🔆 Laser en surchauffe !');SFX.alarm()}}else LZ.heat=Math.max(0,LZ.heat-dt*.55);
if(LZ.on){fwd();const o=_c1.copy(S.pos).addScaledVector(_f,10);let dir=_f.clone();if(lock&&lock.pos.distanceTo(S.pos)<800)dir=_c2.copy(lock.pos).sub(o).normalize();let best=null,bt=780;
for(const T of TG){if(T.dead||T.gone)continue;_c3.copy(T.pos).sub(o);const tt=_c3.dot(dir);if(tt<0||tt>bt)continue;const perp=_c3.addScaledVector(dir,-tt).length();if(perp<(T.r||6)){bt=tt;best=T}}
if(mode=='surf'){for(let s=20;s<bt;s+=20){const p=o.clone().addScaledVector(dir,s);if(p.y<SURF.height(p.x,p.z)){bt=s;best=null;break}}}
const end=o.clone().addScaledVector(dir,bt);for(const L of[LZB,LZC]){if(L.parent!==sc)sc.add(L);L.visible=true;L.position.copy(o);L.lookAt(end);L.rotateY(Math.PI);L.scale.set(1+Math.random()*.25,1+Math.random()*.25,bt)}if(LZG.parent!==sc)sc.add(LZG);LZG.visible=true;LZG.position.copy(end);LZG.scale.setScalar(16+Math.random()*10);
if(Math.random()<.7)SPK.emit(end.x,end.y,end.z,rv(40),rv(40),rv(40),.4,.5,1,1,.4);
if(best){const a=(LZ.acc.get(best)||0)+dt*7*dmgMul();if(a>=1.2){best.hit(a,end);LZ.acc.set(best,0)}else LZ.acc.set(best,a)}
if(AC&&!muted&&Math.random()<dt*14)tone(880+Math.random()*80,820,.06,'sawtooth',.02)}else{LZB.visible=LZC.visible=LZG.visible=false}}
function clearWeapons(){for(const M of MIS)M.m.parent&&M.m.parent.remove(M.m);for(const N of MINES)N.m.parent&&N.m.parent.remove(N.m);MIS=[];MINES=[];LZ.on=0;LZB.visible=LZC.visible=LZG.visible=false}
function buyWeapon(id){const W=WPN[id];if(G.w.includes(id)){G.wi=G.w.indexOf(id);toast(W.ic+' '+W.n+' équipé');return}if(G.cr<W.price){toast('Pas assez de crédits');return}G.cr-=W.price;G.w.push(id);G.wi=G.w.length-1;if(W.am)G.ammo[W.am]+=AMMO[W.am].q;toast('Nouvelle arme : '+W.n+' !');SFX.win();save()}
function buyAmmo(am){const A2=AMMO[am];if(G.cr<A2.price){toast('Pas assez de crédits');return}G.cr-=A2.price;G.ammo[am]+=A2.q;SFX.coin()}
// ----- commerce -----
const GOODS=[{id:'food',n:'Nourriture',ic:'🌾',p:22},{id:'water',n:'Eau pure',ic:'💧',p:15},{id:'fuel',n:'Carburant',ic:'⛽',p:32},{id:'metal',n:'Alliages',ic:'🔩',p:48},{id:'med',n:'Médicaments',ic:'💊',p:70},{id:'elec',n:'Électronique',ic:'🔌',p:95},{id:'lux',n:'Produits de luxe',ic:'💎',p:170}];
const ECON={Agricole:{food:.5,water:.65,fuel:1.15,metal:1.2,med:1.25,elec:1.35,lux:1.3},Minière:{food:1.35,water:1.3,fuel:.9,metal:.55,med:1.2,elec:1.15,lux:1.1},Industrielle:{food:1.15,water:1,fuel:.8,metal:1.25,med:1,elec:.75,lux:1.05},'High-tech':{food:1.25,water:1.15,fuel:1.1,metal:1.3,med:.65,elec:.55,lux:1.2},Luxe:{food:1.1,water:1.2,fuel:1.05,metal:1,med:1.15,elec:1.25,lux:.6}};
function stEcon(st){const k=Object.keys(ECON);return st.n=='Base Alpha'?'Industrielle':k[Math.floor(h3(st.x|0,st.y|0,st.z|0,77)*k.length)%k.length]}
function gPrice(st,g){const e=ECON[stEcon(st)][g.id]||1,per=Math.floor((G.time||0)/240),f=.9+.2*h3(st.x|0,g.p,per,78);return Math.max(2,Math.round(g.p*e*f))}
const sellPrice=(st,g)=>Math.max(1,Math.round(gPrice(st,g)*.9));
function cargoUsed(){let n=S.ore;for(const k in G.cargo)n+=G.cargo[k];return n}
function trade(id,q){const st=S.docked;if(!st)return;const g=GOODS.find(x=>x.id==id);if(q>0){const p=gPrice(st,g),can=Math.min(q,cap()-cargoUsed(),Math.floor(G.cr/p));if(can<=0){toast(cargoUsed()>=cap()?'Soute pleine':'Pas assez de crédits');return}G.cr-=p*can;G.cargo[id]=(G.cargo[id]||0)+can;SFX.coin()}
else{const have=G.cargo[id]||0,n=Math.min(-q,have);if(n<=0)return;G.cr+=sellPrice(st,g)*n;G.cargo[id]=have-n;if(!G.cargo[id])delete G.cargo[id];SFX.coin()}}
// ----- boutique à onglets -----
let TAB='station';const TABS=[['station','⬡ Station'],['ships','🚀 Vaisseaux'],['weap','⚔ Armes'],['market','📦 Marché']];
$('tabs').innerHTML=TABS.map(([k,n])=>`<button data-tab="${k}">${n}</button>`).join('');
$('shop').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.tab){TAB=b.dataset.tab;HC.shopV=null;return}const a=b.dataset.act;if(!a)return;const[k,v,q]=a.split(':');
if(k=='ship')buyShip(v);else if(k=='wpn')buyWeapon(v);else if(k=='ammo')buyAmmo(v);else if(k=='trade')trade(v,+q);HC.shopV=null});
function shopView(){const st=S.docked;if(!st)return'';const row=(l,r)=>`<div class="srow">${l}<span>${r}</span></div>`;
if(TAB=='ships')return Object.entries(HULLS).map(([id,H])=>{const own=G.owned.includes(id),cur=G.ship==id;return row(`<div><b>${H.n}</b>${cur?' <i class="tag">actuel</i>':''}<small>${H.desc}<br>Coque ×${H.hp} · Vitesse ×${H.spd} · Soute ${H.cap} · Armes ×${H.dmg}</small></div>`,cur?'✓':`<button data-act="ship:${id}" ${!own&&G.cr<H.price?'class="dim"':''}>${own?'Piloter':H.price+' ¢'}</button>`)}).join('');
if(TAB=='weap')return Object.entries(WPN).map(([id,W])=>{const own=G.w.includes(id),am=W.am;return row(`<div><b>${W.ic} ${W.n}</b>${curW()==id?' <i class="tag">équipé</i>':''}<small>${W.d}${am&&own?`<br>Munitions : ${G.ammo[am]}`:''}</small></div>`,(own?(am?`<button data-act="ammo:${am}" ${G.cr<AMMO[am].price?'class="dim"':''}>+${AMMO[am].q} · ${AMMO[am].price} ¢</button>`:'')+(curW()!=id?`<button data-act="wpn:${id}">Équiper</button>`:''):`<button data-act="wpn:${id}" ${G.cr<W.price?'class="dim"':''}>${W.price} ¢</button>`))}).join('')+`<div class="hint">${DESK?'<kbd>Q</kbd> ou molette':'Bouton arme'} pour changer d'arme en vol</div>`;
if(TAB=='market'){const ec=stEcon(st);return `<div class="hint">Économie <b>${ec}</b> · Soute ${cargoUsed()}/${cap()}</div>`+GOODS.map(g=>{const p=gPrice(st,g),sp=sellPrice(st,g),e=ECON[ec][g.id],have=G.cargo[g.id]||0,tag=e<.8?'<i class="good">▼ bon prix</i>':e>1.2?'<i class="bad">▲ se vend cher</i>':'';
return row(`<div><b>${g.ic} ${g.n}</b> ${tag}<small>Achat ${p} ¢ · Vente ${sp} ¢${have?` · en soute : ${have}`:''}</small></div>`,`<button data-act="trade:${g.id}:1">+1</button><button data-act="trade:${g.id}:5">+5</button>${have?`<button data-act="trade:${g.id}:-${have}" class="sell">Vendre</button>`:''}`)}).join('')}
return null}
function updShop(){if(!S.docked||mode!='space')return;for(const b of $('tabs').children)b.classList.toggle('on',b.dataset.tab==TAB);const st=TAB=='station';$('tabStation').style.display=st?'flex':'none';$('tabX').style.display=st?'none':'block';
if(!st){const v=shopView()+'|'+G.cr;if(HC.shopV!==v){HC.shopV=v;$('tabX').innerHTML=shopView()}}}
// ----- commandes armes -----
addEventListener('keydown',e=>{if(e.repeat||e.target.tagName=='INPUT')return;if(e.code=='KeyQ'||e.code=='Tab'){cycleW(1);e.preventDefault()}});
OV.addEventListener('wheel',e=>{if(DESK&&!MAP.open){cycleW(e.deltaY>0?1:-1)}},{passive:true});
$('wbtn').addEventListener('pointerdown',e=>{e.preventDefault();cycleW(1)});
function wpnHUD(){const w=curW(),W=WPN[w];let s=`${W.ic} ${W.n}`;if(W.am)s+=` · <b>${G.ammo[W.am]}</b>`;if(w=='laser')s+=` <span class="heat"><i style="width:${(LZ.heat*100).toFixed(0)}%;background:${LZ.over>0?'#f44':LZ.heat>.7?'#fa4':'#6ef'}"></i></span>`;return s}
