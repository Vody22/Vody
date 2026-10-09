// ===== BASES PLANÉTAIRES : foreuses, entrepôt, serre, hangar, tourelles, lumières, raids de drones =====
const BMOD={drill:{n:'Foreuse',ic:'tool',d:'Extrait les minerais de la planète, même quand tu n\'es pas là (6 par heure).',cr:4000,m:{fer:10,titane:4},max:4},
farm:{n:'Serre',ic:'leaf',d:'Fait pousser des plantes rares (4 par heure).',cr:4500,m:{herbes:4,metal:4},max:2},
silo:{n:'Silo de stockage',ic:'cargo',d:'+60 places de stockage pour la production.',cr:3000,m:{metal:8},max:3},
turret:{n:'Tourelle',ic:'turret',d:'Défend la base contre les drones pirates.',cr:3500,m:{titane:6,elec:2},max:3},
hangar:{n:'Hangar',ic:'pad',d:'Piste privée : réparation, boutique, Atelier, fabrication et entrepôt.',cr:7000,m:{metal:12,elec:4},max:1},
light:{n:'Mât lumineux',ic:'sun',d:'Éclaire la base la nuit.',cr:600,m:{fer:2},max:4}};
const BASE_COST={cr:6000,m:{fer:8,metal:6},lv:3},BASE_MAX=3,BSLOTS=8;
const BS={drones:[],raidT:0,leave:false,meshes:null};
const curBase=()=>GR&&GR.F?G.bases[GR.F.p.name]:null;
const modCount=(b,t)=>b.mods.filter(m=>m.t==t).length;
const baseCap=b=>40+60*modCount(b,'silo');
const storeUsed=b=>Object.values(b.store).reduce((a,v)=>a+v,0);
// ----- production (calculée à partir de l'heure réelle, donc aussi hors-ligne) -----
function baseTick(b,ty){const now=Date.now(),h=Math.min(72,Math.max(0,(now-(b.last||now))/3.6e6));b.last=now;if(h<=0)return;b.acc=b.acc||{};const mins=MINS_BY[ty||b.ty]||['fer'];
const add=(id,q)=>{b.acc[id]=(b.acc[id]||0)+q;const n=Math.floor(b.acc[id]);if(n>0){const room=baseCap(b)-storeUsed(b),k=Math.min(n,room);if(k>0)b.store[id]=(b.store[id]||0)+k;b.acc[id]-=n}};
const nd=modCount(b,'drill');if(nd)mins.forEach(id=>add(id,6*nd*h/mins.length));const nf=modCount(b,'farm');if(nf)add('herbes',4*nf*h)}
function baseTickAll(){for(const k in G.bases)baseTick(G.bases[k])}
// ----- modèles 3D -----
function buildBaseMesh(b,sc){const g=new THREE.Group(),H=GR.h;g.position.set(b.x,H(b.x,b.z),b.z);sc.add(g);const W=new THREE.MeshStandardMaterial({color:0xe4e8ee,map:HULLT,metalness:.3,roughness:.5}),D=new THREE.MeshStandardMaterial({color:0x2a3038,metalness:.6,roughness:.45}),A=new THREE.MeshStandardMaterial({color:0xffb030,metalness:.4,roughness:.4,emissive:0x442200}),GL=new THREE.MeshBasicMaterial({color:0x5ff0ff});
const add=(geo,m,x,y,z,par=g)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=DESK;par.add(o);return o};
// dalle et module central
add(new THREE.CylinderGeometry(9,9.5,.6,24),new THREE.MeshStandardMaterial({color:0x5a5f68,roughness:.9}),0,.2,0);add(new THREE.SphereGeometry(5,24,14,0,TAU,0,Math.PI/2),W,0,.5,0).scale.y=.75;add(new THREE.TorusGeometry(5,.25,8,32),A,0,.6,0).rotation.x=Math.PI/2;
add(new THREE.BoxGeometry(1.6,1.6,.5),D,0,1.2,-5.4);add(new THREE.PlaneGeometry(1.2,.7),GL,0,1.45,-5.66).rotation.y=Math.PI;add(new THREE.CylinderGeometry(.08,.08,7,6),D,2.5,6,1.5);const bc=sprite(0xff5050,2.4);bc.position.set(2.5,9.6,1.5);g.add(bc);
const meshes={g,drills:[],turrets:[],lights:[],beacon:bc,pad:null};
b.mods.forEach(m=>{if(m.t=='hangar')return;const a=m.s/BSLOTS*TAU,x=Math.cos(a)*16,z=Math.sin(a)*16,y=H(b.x+x,b.z+z)-g.position.y,mg=new THREE.Group();mg.position.set(x,y,z);g.add(mg);
if(m.t=='drill'){for(const[lx,lz]of[[-1.6,-1.6],[1.6,-1.6],[-1.6,1.6],[1.6,1.6]]){const l=add(new THREE.CylinderGeometry(.15,.2,9,5),D,lx*.6,4.5,lz*.6,mg);l.rotation.set(lz*.06,0,-lx*.06)}add(new THREE.BoxGeometry(2.6,.6,2.6),A,0,8.7,0,mg);const bit=add(new THREE.CylinderGeometry(.5,.12,4,8),new THREE.MeshStandardMaterial({color:0x9aa4b0,metalness:.8,roughness:.3}),0,2,0,mg);add(new THREE.CylinderGeometry(2.2,2.4,.8,12),D,0,.4,0,mg);meshes.drills.push({bit,mg})}
else if(m.t=='silo'){add(new THREE.CylinderGeometry(2.6,2.6,7,16),W,0,3.5,0,mg);add(new THREE.ConeGeometry(2.7,1.6,16),D,0,7.8,0,mg);add(new THREE.TorusGeometry(2.62,.12,6,24),A,0,5,0,mg).rotation.x=Math.PI/2}
else if(m.t=='farm'){add(new THREE.SphereGeometry(3.6,20,12,0,TAU,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0x9fffc8,transparent:true,opacity:.35,roughness:.1,metalness:.2,depthWrite:false}),0,0,0,mg);for(let i=0;i<9;i++){const p=add(new THREE.ConeGeometry(.35,1.4,5),new THREE.MeshStandardMaterial({color:0x3fbf5a,emissive:0x0a3010}),Math.cos(i*2.4)*(.6+i*.25),.7,Math.sin(i*2.4)*(.6+i*.25),mg)}{const sg=sprite(0x8fffb0,6,.35);sg.position.y=2;mg.add(sg)}}
else if(m.t=='turret'){add(new THREE.CylinderGeometry(1.4,1.8,2,10),D,0,1,0,mg);const hd=new THREE.Group();hd.position.y=2.6;mg.add(hd);add(new THREE.SphereGeometry(1.1,12,8),W,0,0,0,hd);for(const s of[-1,1])add(new THREE.CylinderGeometry(.14,.14,2.6,6).rotateX(Math.PI/2),D,s*.45,.1,-1.6,hd);meshes.turrets.push({hd,cd:Math.random(),pos:new V3()})}
else if(m.t=='light'){add(new THREE.CylinderGeometry(.12,.16,8,6),D,0,4,0,mg);const l=sprite(0xffe2a0,7);l.position.y=8.2;mg.add(l);meshes.lights.push(l);const pool=new THREE.Mesh(new THREE.PlaneGeometry(26,26),new THREE.MeshBasicMaterial({map:GLOW,color:0xffc070,transparent:true,opacity:0,blending:ADDB,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3}));pool.rotation.x=-Math.PI/2;pool.position.y=.25;mg.add(pool);meshes.lights.push(pool)}});
if(modCount(b,'hangar')){const px=30,pz=0,py=H(b.x+px,b.z+pz)-g.position.y,pg=new THREE.Group();pg.position.set(px,py,pz);g.add(pg);const pad=add(new THREE.CylinderGeometry(11,11.5,.6,28),new THREE.MeshStandardMaterial({map:PADT,roughness:.8}),0,.3,0,pg);
add(new THREE.BoxGeometry(8,5,7),W,0,2.5,13,pg);add(new THREE.BoxGeometry(6,3.6,.3),D,0,1.8,9.4,pg);for(let i=0;i<8;i++){const s=sprite(i%2?0xffc41a:0x60ff90,2);s.position.set(Math.cos(i/8*TAU)*11.4,.9,Math.sin(i/8*TAU)*11.4);pg.add(s)}
meshes.pad=new V3(b.x+px,g.position.y+py+.6,b.z+pz)}
// collisions à pied
GR.col.push({x:b.x,z:b.z,r:5.5});b.mods.forEach(m=>{const a=m.s/BSLOTS*TAU;if(m.t!='light')GR.col.push({x:b.x+Math.cos(a)*16,z:b.z+Math.sin(a)*16,r:m.t=='farm'?3.6:2.6})});return meshes}
// ----- arrivée sur une planète : construire la base, son terminal, son repère -----
const _bsE=SURF.onEnter;SURF.onEnter=function(F,sc){_bsE(F,sc);BS.drones=[];BS.meshes=null;BS.raidT=240+Math.random()*240;const b=G.bases[F.p.name];if(!b)return;b.ty=F.ty;baseTick(b,F.ty);BS.meshes=buildBaseMesh(b,sc);
const tp=new V3(b.x,GR.h(b.x,b.z),b.z-6.5);exInter(tp,4.5,()=>'🏠 TERMINAL DE LA BASE',()=>baseOpen(true)).base=1;GR.pois.push({k:'base',name:'Ta base',pos:new V3(b.x,0,b.z),ic:'🏠',found:true})};
// ----- interface : établir une base, panneau de gestion -----
function canFound(){if(mode!='surf'||!FOOT.on||!GR||!GR.F)return'';const F=GR.F,p=FOOT.pos;if(G.bases[F.p.name])return'';if(Object.keys(G.bases).length>=BASE_MAX)return'Tu as déjà '+BASE_MAX+' bases';if(lvl()<BASE_COST.lv)return'Niveau '+BASE_COST.lv+' requis';
if(GR.op&&Math.hypot(p.x-GR.op.x,p.z-GR.op.z)<150)return'Trop près de l\'avant-poste';const y=F.h(p.x,p.z);if(y<2)return'Terrain inondé';let sl=0;for(let a=0;a<8;a++)sl=Math.max(sl,Math.abs(F.h(p.x+Math.cos(a*.785)*16,p.z+Math.sin(a*.785)*16)-y));if(sl>4)return'Terrain trop en pente';return'ok'}
function foundBase(){const why=canFound();if(why!='ok'){toast('🏗 '+why);SFX.tick();return}if(G.cr<BASE_COST.cr){toast('Il faut '+fmt(BASE_COST.cr)+' ¢');return}if(!matsOk(BASE_COST.m)){toast('Il faut aussi '+Object.entries(BASE_COST.m).map(([id,q])=>q+' '+matG(id).n).join(' et '));return}
G.cr-=BASE_COST.cr;useMats(BASE_COST.m);const F=GR.F,p=FOOT.pos;G.bases[F.p.name]={x:Math.round(p.x+Math.sin(FOOT.yaw)*-10),z:Math.round(p.z+Math.cos(FOOT.yaw)*-10),mods:[],store:{},acc:{},last:Date.now(),ty:F.ty};
const b=G.bases[F.p.name];BS.meshes=buildBaseMesh(b,GR.sc);exInter(new V3(b.x,GR.h(b.x,b.z),b.z-6.5),4.5,()=>'🏠 TERMINAL DE LA BASE',()=>baseOpen(true)).base=1;GR.pois.push({k:'base',name:'Ta base',pos:new V3(b.x,0,b.z),ic:'🏠',found:true});
boom3(new V3(b.x,GR.h(b.x,b.z)+3,b.z),30,0xffc040,60);toast('🏠 Base établie ! Construis des modules depuis le terminal');SFX.win();gainXP(150);addRep('guilde',80);save();baseOpen(true)}
function rebuildBase(){const b=curBase();if(!b||!BS.meshes)return;GR.sc.remove(BS.meshes.g);BS.meshes.g.traverse(o=>{if(o.geometry)o.geometry.dispose()});GR.col=GR.col.filter(c=>Math.hypot(c.x-b.x,c.z-b.z)>40);BS.meshes=buildBaseMesh(b,GR.sc)}
function buildMod(t){const b=curBase();if(!b)return;const M=BMOD[t];if(modCount(b,t)>=M.max){toast('Maximum atteint pour ce module');return}const used=new Set(b.mods.map(m=>m.s));let s=-1;if(t!='hangar')for(let i=0;i<BSLOTS;i++)if(!used.has(i)){s=i;break}if(t!='hangar'&&s<0){toast('Plus de place autour de la base');return}
if(G.cr<M.cr){toast('Il faut '+fmt(M.cr)+' ¢');return}if(!matsOk(M.m)){toast('Matériaux insuffisants : '+Object.entries(M.m).map(([id,q])=>q+' '+matG(id).n).join(', '));return}baseTick(b);G.cr-=M.cr;useMats(M.m);b.mods.push({t,s:t=='hangar'?-1:s});rebuildBase();
toast('🏗 '+M.n+' construit'+(M.n.endsWith('e')?'e':'')+' !');SFX.buy();gainXP(60);addRep('guilde',25);save();baseOpen(true)}
function baseCollect(where){const b=curBase();if(!b)return;baseTick(b);let n=0;for(const id of Object.keys(b.store)){const q=b.store[id];let k=0;if(where=='stash')k=Math.min(q,STASH_CAP-stashUsed());else k=Math.min(q,cap()-cargoUsed());if(k<=0)continue;if(where=='stash')G.stash[id]=(G.stash[id]||0)+k;else G.cargo[id]=(G.cargo[id]||0)+k;b.store[id]-=k;if(!b.store[id])delete b.store[id];n+=k}
toast(n?'📦 '+n+' unités envoyées '+(where=='stash'?'à l\'entrepôt':'dans la soute'):where=='stash'?'Entrepôt plein ou base vide':'Soute pleine ou base vide');if(n){SFX.coin();gainXP(n);addRep('guilde',n)}save();baseOpen(true)}
function baseOpen(v){const el=$('bpanel');if(v===false){el.style.display='none';return}const b=curBase();if(!b){el.style.display='none';return}baseTick(b);const nd=modCount(b,'drill'),nf=modCount(b,'farm'),used=storeUsed(b),capB=baseCap(b);
let h=`<div class="phead"><b>${ICO('station')} Base · ${GR.F.p.name}</b><button id="bpx">${ICO('close')}</button></div>`;
h+=`<div class="psec"><b class="pt">Production</b><small>${nd?nd+' foreuse'+(nd>1?'s':'')+' · '+(6*nd)+' minerais/h':'Aucune foreuse'}${nf?' · '+nf+' serre'+(nf>1?'s':'')+' · '+(4*nf)+' plantes/h':''}<br>Stock ${used}/${capB}${used>=capB?' — <b style="color:#ff8a4a">plein, la production s\'arrête</b>':''}</small>`;
const st=Object.entries(b.store).filter(([,q])=>q>0);h+=st.length?`<small>${st.map(([id,q])=>matG(id).ic+' '+q+' '+matG(id).n).join(' · ')}</small><div class="obtns"><button data-b="stash">Vers l'entrepôt</button><button data-b="cargo">Dans la soute</button></div>`:'<small>Rien à récupérer pour l\'instant.</small>';h+='</div>';
h+=`<div class="psec"><b class="pt">Construire</b>`;for(const t in BMOD){const M=BMOD[t],n=modCount(b,t),full=n>=M.max,ok=G.cr>=M.cr&&matsOk(M.m);
h+=`<div class="bmod">${ICO(M.ic)}<div><b>${M.n}</b> <span style="color:var(--dim)">${n}/${M.max}</span><small>${M.d}<br>${fmt(M.cr)} ¢ · ${Object.entries(M.m).map(([id,q])=>`<i class="${haveMat(id)>=q?'good':'bad'}">${matG(id).ic} ${q}</i>`).join(' ')}</small></div>${full?'<span>✓</span>':`<button data-m="${t}" ${ok?'':'class="dim"'}>Construire</button>`}</div>`}h+='</div>';
el.innerHTML=h;el.style.display='flex';$('bpx').onclick=()=>baseOpen(false);el.querySelectorAll('[data-m]').forEach(x=>x.onclick=()=>buildMod(x.dataset.m));el.querySelectorAll('[data-b]').forEach(x=>x.onclick=()=>baseCollect(x.dataset.b))}
$('baseb').onclick=()=>{const why=canFound();if(why!='ok'){toast('🏗 '+why);SFX.tick();return}foundBase()};
// ----- chaque image : animations, phare de nuit, piste, raids -----
const _bsT=SURF.tick;SURF.tick=function(dt,F){_bsT(dt,F);const b=G.bases[F.p.name],M=BS.meshes;
// bouton « Établir une base »
const cf=FOOT.on&&!b?canFound():'';const show=cf==='ok';if(HC.bb!==show){HC.bb=show;$('baseb').style.display=show?'flex':'none'}if(show&&HC.bbl!==1){HC.bbl=1;$('baseb').innerHTML=ICO('station')+'Établir une base · '+fmt(BASE_COST.cr)+' ¢'}
if(!b||!M)return;const night=typeof DN!='undefined'?DN.night:0;for(const d of M.drills){d.bit.rotation.y+=dt*6;d.bit.position.y=2+Math.sin(t*3)*.4;if(Math.random()<dt*2)smokePuff(_dv.set(b.x+d.mg.position.x+rv(1.5),GR.h(b.x,b.z)+.6,b.z+d.mg.position.z+rv(1.5)),_dv2.set(rv(2),1.5,rv(2)),1.5,1.2,0x8a7a64)}
for(const l of M.lights){if(l.isSprite)l.scale.setScalar(5+night*8);else l.material.opacity=night*.6}M.beacon.visible=Math.sin(t*3)>0;
// piste privée du hangar
if(M.pad&&!FOOT.on&&!S.ascent&&!S.dead){const dxz=Math.hypot(S.pos.x-M.pad.x,S.pos.z-M.pad.z);if(BS.leave&&dxz>40)BS.leave=false;if(!S.docked&&!BS.leave&&dxz<14&&S.pos.y-M.pad.y<14&&S.spd<55){BS.leave=true;S.hp=maxhp();S.sh=PM('sh');groundDock({n:'Ta base',ground:true,base:true,x:F.p.x,y:F.p.y,z:F.p.z,econ:'Industrielle'},false);TAB='station';toast('🛬 Bienvenue à ta base — coque réparée')}}
// raids de drones pirates quand tu es près de ta base
const me=FOOT.on?FOOT.pos:S.pos,near=Math.hypot(me.x-b.x,me.z-b.z)<450;if(near&&!S.docked&&b.mods.length>=2){BS.raidT-=dt;if(BS.raidT<=0&&!BS.drones.length){BS.raidT=300+Math.random()*240;startRaid(b)}}
updDrones(dt,b,M)};
const DRG=new THREE.OctahedronGeometry(1.4,0),DRM=new THREE.MeshStandardMaterial({color:0x3a3f46,metalness:.7,roughness:.35,emissive:0x400808});
function startRaid(b){const n=3+Math.min(4,Math.floor(b.mods.length/2)),a0=Math.random()*TAU;for(let i=0;i<n;i++){const m=new THREE.Mesh(DRG,DRM);m.scale.set(1,.6,1);const r=new THREE.Mesh(new THREE.TorusGeometry(1.9,.18,6,16),DRM);r.rotation.x=Math.PI/2;m.add(r);m.add(sprite(0xff3a3a,4));
const a=a0+rv(.5),p=new V3(b.x+Math.cos(a)*420,GR.h(b.x,b.z)+60+Math.random()*30,b.z+Math.sin(a)*420);m.position.copy(p);GR.sc.add(m);const D={m,pos:m.position,hp:3,r:3,foe:1,max:1600,cone:.3,w:.7,ang:Math.random()*TAU,cd:2+Math.random()*2,dead:false,life:95};D.hit=(d,pp)=>{D.hp-=d;boom3(pp,6,0xffaa66,30);SFX.tick();if(D.hp<=0&&!D.dead){D.dead=true;boom3(D.pos,22,0xff8040,80,true);SFX.boom();GR.sc.remove(D.m);G.cr+=120;gainXP(25);addRep('guilde',10)}};BS.drones.push(D)}
toast('⚠ Raid de drones pirates sur ta base !');SFX.alarm()}
function updDrones(dt,b,M){if(!BS.drones.length)return;const c=_dv.set(b.x,GR.h(b.x,b.z)+30,b.z);let alive=0;for(const D of BS.drones){if(D.dead)continue;alive++;D.life-=dt;D.ang+=dt*.5;const tg=_dv2.set(c.x+Math.cos(D.ang)*35,c.y+Math.sin(D.ang*2)*8,c.z+Math.sin(D.ang)*35);D.pos.lerp(tg,damp(.7,dt));D.m.rotation.y+=dt*3;
D.cd-=dt;if(D.cd<=0){D.cd=1.8+Math.random()*1.5;const me=FOOT.on?FOOT.pos:S.pos;if(me.distanceTo(D.pos)<320){const dir=me.clone().sub(D.pos).normalize(),eb=mkEB(0xff4040);eb.position.copy(D.pos);EB.push({m:eb,v:dir.multiplyScalar(260),l:2.2,dmg:5});SFX.eshoot()}}
if(D.life<=0){D.dead=true;GR.sc.remove(D.m);let lost=0;for(const id in b.store){const k=Math.ceil(b.store[id]*.1);b.store[id]-=k;lost+=k;if(b.store[id]<=0)delete b.store[id]}if(lost)toast('Un drone a pillé '+lost+' unités de ta base')}}
// tourelles de la base
for(const T of M.turrets){T.hd.getWorldPosition(T.pos);let best=null,bd=380;for(const D of BS.drones)if(!D.dead){const d=D.pos.distanceTo(T.pos);if(d<bd){bd=d;best=D}}if(!best)continue;T.hd.lookAt(best.pos);T.hd.rotateY(Math.PI);T.cd-=dt;if(T.cd<=0){T.cd=.7;const dir=best.pos.clone().sub(T.pos).normalize(),m=mkPB(0xffc040);m.scale.setScalar(.6);m.position.copy(T.pos);m.lookAt(T.pos.clone().sub(dir));PB.push({m,p:m.position,v:dir.multiplyScalar(520),l:1.2,d:1.2,c:0xffc040})}}
if(!alive&&BS.drones.length){const n=BS.drones.length;BS.drones=[];toast('✔ Raid repoussé !');SFX.win();gainXP(40);save()}}
{const _ex=SURF.extra;SURF.extra=()=>[..._ex(),...BS.drones.filter(D=>!D.dead)]}
{const _rd=SURF.radar;SURF.radar=blip=>{_rd(blip);const b=curBase();if(b)blip({x:b.x,y:0,z:b.z},'#ffc34d',3.2,true);for(const D of BS.drones)if(!D.dead)blip(D.pos,'#ff4d4d',2.2)}}
const _bsX=SURF.onExit;SURF.onExit=function(d){if(_bsX)_bsX(d);BS.drones=[];BS.meshes=null;$('bpanel').style.display='none';$('baseb').style.display='none';HC.bb=false;setD('footb','none')};
setInterval(()=>{baseTickAll()},60000);
