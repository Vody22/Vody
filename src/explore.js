// ===== EXPLORATION DES PLANÈTES : épaves, caisses, bunker, monolithe, plantes, faune, oiseaux, campement et quêtes, carte avec brouillard =====
GOODS.push({id:'herbes',n:'Plantes rares',ic:'🌿',p:42,min:1});for(const e of Object.values(ECON))e.herbes=e===ECON['High-tech']?1.5:e===ECON.Luxe?1.3:1;
const LORE=['Journal du capitaine Ardent : « Le signal de Kepler n\'est pas naturel. Quelqu\'un — ou quelque chose — nous appelle. »','Rapport de minage n°47 : les filons de cristal pulsent la nuit. Les mineurs refusent de travailler après le coucher du soleil.',
'Note du professeur Ilo : les monolithes sont plus anciens que toutes les civilisations connues. Ils réagissent à la présence humaine.','Message intercepté : « Le Némésis se réarme. Ne vous approchez pas des secteurs mortels sans bouclier. »',
'Carnet d\'un pilote : « J\'ai vu des créatures géantes traverser la plaine en troupeau. Elles fuient les vaisseaux mais pas les marcheurs calmes. »','Archive de la colonie : cet avant-poste a été bâti sur les ruines d\'une base plus ancienne. Personne ne sait qui l\'a construite.'];
const SCORCHT=(()=>{const c=mkC(128),x=c.getContext('2d'),gr=x.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.45,'rgba(255,255,255,.75)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,128,128);const r=rng(9);x.globalCompositeOperation='destination-out';for(let i=0;i<40;i++){x.fillStyle=`rgba(0,0,0,${r()*.5})`;x.beginPath();x.arc(r()*128,r()*128,4+r()*14,0,TAU);x.fill()}return new THREE.CanvasTexture(c)})();
const SYL=['gro','lak','zin','tho','mur','vex','ka','sil','dor','yth','bra','qui','nol','fen','ra','ush'];
const exInter=(pos,r,label,act)=>{const I={pos,r,label,act,done:false};GR.inter.push(I);return I};
const exLoot=()=>{const L=G.loot[GR.F.p.name]=G.loot[GR.F.p.name]||[];return L};
function giveRarePart(){const all=[];for(const s of PSLOTS)for(const id of Object.keys(PARTS[s].o))if(id!='std'&&!G.pown.includes(s+':'+id))all.push([s,id]);if(!all.length){G.cr+=600;toast('🎁 +600 ¢');return}
const[s,id]=all[Math.random()*all.length|0];G.pown.push(s+':'+id);toast('🎁 Pièce rare trouvée : '+PARTS[s].o[id].n+' — installe-la à l\'Atelier !');SFX.win();save()}
function addCargo(id,n){const can=Math.max(0,Math.min(n,cap()-cargoUsed()));if(can>0)G.cargo[id]=(G.cargo[id]||0)+can;return can}
// ----- construction des points d'intérêt -----
const _exOE=SURF.onEnter;
SURF.onEnter=function(F,sc){_exOE(F,sc);const rr=rng(seedOf(F.p.x,F.p.y,F.p.z,77)),got=exLoot();GR.inter=[];GR.pois=[];GR.smoke=[];GR.embers=[];GR.fauna=[];GR.birds=[];GR.plants=[];
const O=GR.op||{x:0,z:0},flatOk=(x,z,R)=>{const y=F.h(x,z);for(let a=0;a<8;a++)if(Math.abs(F.h(x+Math.cos(a*.785)*R,z+Math.sin(a*.785)*R)-y)>R*.16)return false;return true},
spot=(minO=200,lim=F.HALF*.82,flat=0)=>{for(let k=0;k<(flat?220:60);k++){const x=(rr()*2-1)*lim,z=(rr()*2-1)*lim;if(F.h(x,z)>4&&Math.hypot(x-O.x,z-O.z)>minO&&(!flat||flatOk(x,z,flat)))return new V3(x,F.h(x,z),z)}return flat?spot(minO,lim,0):null};
const mat=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.7,metalness:.3},o)),add=(geo,m,x,y,z,par)=>{const q=new THREE.Mesh(geo,m);q.position.set(x,y,z);q.castShadow=q.receiveShadow=DESK;(par||sc).add(q);return q};
const poi=(k,name,pos,ic)=>{const P={k,name,pos,ic,found:false,id:k+GR.pois.length};GR.pois.push(P);return P};
// caisse de ravitaillement
const crate=(pos,id)=>{const g=new THREE.Group();g.position.copy(pos);sc.add(g);const opened=got.includes(id);add(new THREE.BoxGeometry(1.6,1,1.1),mat(0x5a6a5a,{map:HULLT}),0,.5,0,g);const lid=new THREE.Group();lid.position.set(0,1,.55);g.add(lid);add(new THREE.BoxGeometry(1.64,.18,1.14),mat(0x4a5a4a,{map:HULLT}),0,.09,-.55,lid);
add(new THREE.BoxGeometry(1.62,.08,.04),new THREE.MeshBasicMaterial({color:0xffc040}),0,.7,-.56,g);if(!LOWQ)for(const s of[-1,1])add(new THREE.BoxGeometry(.08,1.02,1.12),mat(0x2a2f36,{metalness:.7}),s*.6,.5,0,g);
let bl=null,beam=null;if(!opened){bl=sprite(0xffc040,2.2);bl.position.y=1.6;g.add(bl);beam=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,60,6,1,true),new THREE.MeshBasicMaterial({color:0xffc040,transparent:true,opacity:.18,blending:ADDB,depthWrite:false}));beam.position.y=31;g.add(beam)}else lid.rotation.x=-1.9;
const I=exInter(pos,3.2,()=>'📦 OUVRIR LA CAISSE',()=>{I.done=true;lid.rotation.x=-1.9;if(bl)g.remove(bl);if(beam)g.remove(beam);exLoot().push(id);crateLoot()});I.done=opened;GR.pois.push({k:'crate',name:'Caisse de ravitaillement',pos,ic:'📦',found:false,id,I});return g};
// épaves
for(let w=0;w<2;w++){const p=spot(320,undefined,14);if(!p)continue;const P=poi('wreck',['Épave du Vagabond','Épave de l\'Aurore','Épave du Corsaire','Épave du Pèlerin'][(rr()*4)|0],p,'🛸');const g=new THREE.Group();g.position.copy(p);g.rotation.y=rr()*TAU;sc.add(g);g.updateMatrixWorld(true);
const burnt=mat(0x3a3430,{map:HULLT,roughness:.85}),dk=mat(0x1e1c1a,{roughness:.9}),hullG=lathe([[0,-12],[3,-10],[5,-6],[5.6,0],[5.6,8],[5,11],[3.5,12]],18,0);
const A=add(hullG,burnt,0,2,-6,g);A.rotation.set(Math.PI/2+.15,0,.35);const B=add(hullG,burnt,2,1.4,14,g);B.rotation.set(Math.PI/2-.25,.4,-.5);B.scale.set(.9,.7,.9);
for(let i=0;i<4;i++){const rb=add(new THREE.TorusGeometry(5.4,.35,6,20,Math.PI*1.2),dk,0,2.5,3+i*1.6,g);rb.rotation.set(0,0,-.3+i*.2)}add(lathe([[2,-2],[3,0],[3.4,3],[2.6,3.2]],14,Math.PI/2),dk,3,1.5,25,g);
for(let i=0;i<10;i++)add(new THREE.BoxGeometry(.6+rr()*2,.3+rr()*.8,.6+rr()*2),i%2?burnt:dk,rv(18),.3,rv(26),g).rotation.set(rr()*2,rr()*3,rr()*2);
{const sb=g.localToWorld(new V3(1,4,10));for(let i=0;i<8;i++){const s=fxSprite(SMOKET,THREE.NormalBlending,0x1c1814,0);s.material.fog=false;sc.add(s);GR.smoke.push({s,b:sb.clone().add(new V3(rv(2),0,rv(2))),t:i/8})}}
{const sc2=new THREE.Mesh(new THREE.CircleGeometry(17,24),new THREE.MeshBasicMaterial({color:0x0a0806,map:SCORCHT,transparent:true,opacity:.7,fog:false,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));sc2.rotation.x=-Math.PI/2;sc2.position.set(0,.08,4);sc2.scale.y=1.6;g.add(sc2);
for(let i=0;i<5;i++){const e=sprite(0xff6a20,1.4+rr(),.7);e.material=e.material.clone();e.position.set(rv(4),1+rr()*2.5,-4+rr()*14);g.add(e);(GR.embers=GR.embers||[]).push(e)}}
const cp=g.localToWorld(new V3(6,0,-4));cp.y=F.h(cp.x,cp.z);crate(cp,'k'+(100+w));
const bb=g.localToWorld(new V3(-3,1,8));bb.y=F.h(bb.x,bb.z)+.4;const box=new THREE.Mesh(new THREE.BoxGeometry(.5,.35,.6),mat(0xff6a1a,{emissive:0x501000}));box.position.copy(bb);box.visible=false;sc.add(box);
P.box={m:box,I:exInter(bb,3,()=>'📼 RAMASSER LA BOÎTE NOIRE',()=>{P.box.I.done=true;box.visible=false;if(G.pq&&G.pq.ty=='box'){G.pq.have=1;toast('📼 Boîte noire récupérée — rapporte-la au campement');SFX.win()}})};P.box.I.done=true;
{const sv=g.localToWorld(new V3(0,0,4)),wid='w'+w;sv.y=F.h(sv.x,sv.z);const I=exInter(sv,9,()=>'🔧 RÉCUPÉRER DES PIÈCES SUR L\'ÉPAVE',()=>{I.done=true;exLoot().push(wid);const a=addCargo('metal',3),b2=addCargo('elec',2);boom3(sv.clone().add(new V3(0,2,0)),10,0xffa040,24);SFX.rock();toast(a+b2?'🔧 Récupéré : '+a+' Alliages, '+b2+' Électronique':'Soute pleine — +250 ¢');if(!(a+b2))G.cr+=250;if(Math.random()<.3)setTimeout(giveRarePart,1600)});I.done=got.includes(wid)}
GR.col.push({x:p.x,z:p.z,r:6})}
// caisses dispersées
for(let i=0;i<8;i++){const p=spot(160);if(p)crate(p,'k'+i)}
// bunker abandonné avec terminal
{const p=spot(380,undefined,10);if(p){const P=poi('bunker','Bunker abandonné',p,'🏚');const g=new THREE.Group();g.position.copy(p);const ry=rr()*TAU;g.rotation.y=ry;sc.add(g);g.updateMatrixWorld(true);const cm=mat(0x8a8478,{map:HULLT,roughness:.95}),W=14,D=10,H=4.2;
add(new THREE.BoxGeometry(W,.6,D),cm,0,.2,0,g);add(new THREE.BoxGeometry(W+1.2,6,D+1.2),mat(0x6a655c,{map:HULLT,roughness:1}),0,-3.05,0,g);add(new THREE.BoxGeometry(W+.6,.5,D+.6),cm,0,H,0,g);add(new THREE.BoxGeometry(W,H,.6),cm,0,H/2,-D/2,g);for(const s of[-1,1])add(new THREE.BoxGeometry(.6,H,D),cm,s*W/2,H/2,0,g);for(const s of[-1,1])add(new THREE.BoxGeometry(W/2-1.8,H,.6),cm,s*(W/4+.9),H/2,D/2,g);
add(new THREE.BoxGeometry(3.6,.5,.7),mat(0xffc040,{emissive:0x402000}),0,H-.4,D/2+.05,g);const lt=sprite(0xffd890,3);lt.position.set(0,H-.6,0);g.add(lt);
const term=add(new THREE.BoxGeometry(1.4,1.6,.6),mat(0x2a2f36,{metalness:.6}),3,1.1,-D/2+.8,g);const scr=add(new THREE.PlaneGeometry(1.1,.7),new THREE.MeshBasicMaterial({color:0x40ff90}),3,1.5,-D/2+1.12,g);
const tp=g.localToWorld(new V3(3,0,-D/2+2));tp.y=p.y;P.term=exInter(tp,2.8,()=>'💻 CONSULTER LE TERMINAL',()=>{P.term.done=true;scr.material.color.set(0x2060a0);exRevealAll();const L=LORE[(Math.random()*LORE.length)|0];toast('💻 Carte de la planète téléchargée');setTimeout(()=>{toast('📜 '+L)},2600);SFX.disc();G.cr+=150});
const cp2=g.localToWorld(new V3(-4,0,-2));cp2.y=p.y+.3;crate(cp2,'k200');
// murs (pour marcher dedans)
const wl=(x0,z0,x1,z1)=>{const n=Math.ceil(Math.hypot(x1-x0,z1-z0)/1.2);for(let i=0;i<=n;i++){const q=g.localToWorld(new V3(x0+(x1-x0)*i/n,0,z0+(z1-z0)*i/n));GR.col.push({x:q.x,z:q.z,r:.55})}};
wl(-W/2,-D/2,W/2,-D/2);wl(-W/2,-D/2,-W/2,D/2);wl(W/2,-D/2,W/2,D/2);wl(-W/2,D/2,-1.8,D/2);wl(1.8,D/2,W/2,D/2)}}
// monolithe ancien
{const p=spot(450,undefined,6);if(p){const P=poi('mono','Monolithe ancien',p,'🗿');const rt=(()=>{const c=mkC(64,256),x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,64,256);x.strokeStyle='#b070ff';x.lineWidth=2;const r2=rng(5);for(let i=0;i<14;i++){const y=10+i*17;x.beginPath();for(let k=0;k<4;k++){const px=10+r2()*44,py=y+r2()*12;k?x.lineTo(px,py):x.moveTo(px,py)}x.stroke()}return new THREE.CanvasTexture(c)})();
const mono=add(new THREE.CylinderGeometry(1.2,2.2,22,4),new THREE.MeshStandardMaterial({color:0x101014,metalness:.85,roughness:.15,emissive:0xffffff,emissiveMap:rt,emissiveIntensity:.9}),p.x,p.y+11,p.z);mono.rotation.y=.4;
const orbs=[];for(let i=0;i<3;i++){const o=add(new THREE.OctahedronGeometry(.9),new THREE.MeshStandardMaterial({color:0xc080ff,emissive:0x7030c0,emissiveIntensity:.8,metalness:.3,roughness:.2}),p.x,p.y+8,p.z);o.add(sprite(0xb070ff,5,.7));orbs.push(o)}
const gl=sprite(0xb070ff,26,.55);gl.position.set(p.x,p.y+23,p.z);sc.add(gl);GR.mono={p,orbs,on:true};GR.col.push({x:p.x,z:p.z,r:2.6});
P.I=exInter(p,6,()=>'✨ TOUCHER LE MONOLITHE',()=>{P.I.done=true;GR.mono.on=false;S.hp=maxhp();S.sh=PM('sh');FOOT.fuel=1;FOOT.boostT=t+90;G.cr+=300;boom3(p.clone().add(new V3(0,6,0)),40,0xb070ff,60);SFX.win();toast('✨ Une énergie ancienne t\'envahit : coque réparée, jetpack illimité pendant 90 s');exRevealAround(p,700)})}}
// campement et donneur de quêtes
{const p=spot(300,undefined,9);if(p){const P=poi('camp','Campement de prospecteurs',p,'⛺');const fx=p.x,fz=p.z-3,wood=mat(0x5a4028,{roughness:.95,metalness:0});
// tentes canadiennes (prisme triangulaire) dont l'entrée regarde le feu
const tent=(x,z,col,r,L)=>{const g=new THREE.Group();g.position.set(x,F.h(x,z),z);g.rotation.y=Math.atan2(-(fz-z),fx-x);sc.add(g);const tg=new THREE.CylinderGeometry(r,r,L,3,1,false,Math.PI/2);tg.rotateZ(Math.PI/2);
add(tg,mat(col,{roughness:.95,metalness:0,flatShading:true}),0,r*.5,0,g);add(new THREE.BoxGeometry(L+.2,.06,r*1.9),mat(0x3a3a34,{roughness:1,metalness:0}),0,.03,0,g);
const sh=new THREE.Shape();sh.moveTo(-r*.55,0);sh.lineTo(r*.55,0);sh.lineTo(0,r*1.1);sh.closePath();const dr=add(new THREE.ShapeGeometry(sh),new THREE.MeshBasicMaterial({color:0x120a06}),L/2+.03,.02,0,g);dr.rotation.y=Math.PI/2;
for(const s of[-1,1]){const fl2=add(new THREE.PlaneGeometry(r*.62,r*1.05),mat(col,{roughness:.95,metalness:0,side:THREE.DoubleSide}),L/2+.35,r*.5,s*r*.52,g);fl2.rotation.y=s*.9}
add(new THREE.CylinderGeometry(.05,.05,L+.7,5).rotateZ(Math.PI/2),wood,0,r*1.5+.03,0,g);for(const s of[-1,1])add(new THREE.CylinderGeometry(.05,.05,r*1.5+.3,5),wood,s*(L/2+.32),(r*1.5+.3)/2,0,g);
for(const s of[-1,1])for(const e of[-1,1]){const gy=add(new THREE.CylinderGeometry(.015,.015,r*1.6,3),mat(0xb0a080),s*(L/2+.5),r*.85,e*r*.9,g);gy.rotation.x=e*.85}
GR.col.push({x,z,r:Math.max(r,L/2)+.3});return g};
tent(p.x+5.5,p.z+2,0xc8643a,2.3,4.4);tent(p.x-5.5,p.z+2.5,0x5a7a8a,1.9,3.8);
// feu de camp : pierres, bûches, flamme douce
for(let i=0;i<9;i++){const a=i/9*TAU;add(new THREE.DodecahedronGeometry(.22+rr()*.08),mat(0x5a5650,{roughness:1,flatShading:true}),fx+Math.cos(a)*.95,F.h(fx,fz)+.12,fz+Math.sin(a)*.95)}
for(let i=0;i<5;i++)add(new THREE.CylinderGeometry(.12,.14,1.3,6),mat(0x3a2414,{roughness:1}),fx+Math.cos(i*1.26)*.3,F.h(fx,fz)+.25,fz+Math.sin(i*1.26)*.3).rotation.set(1.15,i*1.26,0);
const fl=sprite(0xff7a28,2.4,.55);fl.position.set(fx,F.h(fx,fz)+.9,fz);sc.add(fl);const ember=sprite(0xff3a10,1.2,.8);ember.position.set(fx,F.h(fx,fz)+.35,fz);sc.add(ember);GR.fire={p:new V3(fx,F.h(fx,fz)+.5,fz),s:fl};
// bancs en rondins, lanterne, table et caisses
for(const[a,l]of[[.6,2.4],[2.6,2.2]]){const lx=fx+Math.cos(a)*2.6,lz=fz+Math.sin(a)*2.6,lg=add(new THREE.CylinderGeometry(.26,.28,l,8),wood,lx,F.h(lx,lz)+.26,lz);lg.rotation.set(0,-a,Math.PI/2)}
{const lx=p.x+2.2,lz=p.z+5.2,ly=F.h(lx,lz);add(new THREE.CylinderGeometry(.06,.07,2.6,6),mat(0x2a2f36,{metalness:.7}),lx,ly+1.3,lz);add(new THREE.BoxGeometry(.6,.05,.06),mat(0x2a2f36,{metalness:.7}),lx+.25,ly+2.55,lz);
const ln=add(new THREE.CylinderGeometry(.12,.14,.32,8),new THREE.MeshStandardMaterial({color:0xffe0a0,emissive:0xffc060,emissiveIntensity:1.2}),lx+.5,ly+2.3,lz);ln.add(sprite(0xffc070,2.2,.5))}
{const tx=p.x-1.8,tz=p.z+4.6,ty=F.h(tx,tz);add(new THREE.BoxGeometry(2,.1,1),wood,tx,ty+.85,tz);for(const s of[-1,1])add(new THREE.BoxGeometry(.1,.85,.9),wood,tx+s*.85,ty+.42,tz);
add(new THREE.BoxGeometry(.5,.32,.4),mat(0x30343a,{metalness:.6}),tx-.4,ty+1.06,tz);add(new THREE.PlaneGeometry(.4,.24),new THREE.MeshBasicMaterial({color:0x40ff90}),tx-.4,ty+1.09,tz+.21);add(new THREE.CylinderGeometry(.08,.08,.22,8),mat(0x9a3a2a),tx+.5,ty+1.01,tz);
for(let i=0;i<3;i++)add(new THREE.BoxGeometry(.8,.6,.6),mat(0x6a5a3a,{map:HULLT,roughness:.9}),p.x+8.5+(i%2)*.5,F.h(p.x+8.5,p.z-1)+.3+(i==2?.6:0),p.z-1.5+(i==1?.7:0)).rotation.y=i*.4;
GR.col.push({x:tx,z:tz,r:1.1})}
const nx=fx+1.9,nz=fz-1.5,n=mkNpc(rr()<.5?2:4,nx,nz,rr,true);n.quest=true;n.yaw=Math.atan2(-(fx-nx),-(fz-nz));GR.quester=n;P.npc=n;const cp3=new V3(p.x-7,0,p.z-3);cp3.y=F.h(cp3.x,cp3.z);crate(cp3,'k300')}}
// plantes rares
const pc=new THREE.Color().setHSL(((F.hu+140)%360)/360,.8,.55),PB2=new THREE.MeshStandardMaterial({color:pc,emissive:pc,emissiveIntensity:.7,roughness:.3}),PL=new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(((F.hu+90)%360)/360,.5,.3),roughness:.8,side:THREE.DoubleSide});
for(let i=0;i<(LOWQ?12:32);i++){const p=spot(60);if(!p)continue;const g=new THREE.Group();g.position.copy(p);sc.add(g);add(new THREE.CylinderGeometry(.06,.1,1.4,5),PL,0,.7,0,g);const bulb=add(new THREE.SphereGeometry(.32,10,8),PB2,0,1.5,0,g);for(let k=0;k<(LOWQ?0:3);k++){const lf=add(new THREE.ConeGeometry(.35,1.2,4),PL,Math.cos(k*2.1)*.35,.5,Math.sin(k*2.1)*.35,g);lf.rotation.set(Math.sin(k*2.1)*.8,0,-Math.cos(k*2.1)*.8)}
const gs=sprite(pc.getHex(),2.2,.6);gs.position.y=1.5;g.add(gs);const I=exInter(p,2.6,()=>'🌿 CUEILLIR LA PLANTE',()=>{I.done=true;sc.remove(g);const n=addCargo('herbes',1);if(n){toast('🌿 +1 Plante rare');SFX.pick()}else{toast('Soute pleine');I.done=false;sc.add(g)}});GR.plants.push({g,bulb,p,I})}
// faune : troupeaux qui broutent et fuient
const spn=()=>{const r2=rng(seedOf(F.p.x|0,GR.fauna.length,7,3));const s=SYL[r2()*16|0]+SYL[r2()*16|0];return s[0].toUpperCase()+s.slice(1)};
for(let hI=0;hI<2;hI++){const c=spot(220);if(!c)continue;const name=spn()+' '+['des plaines','des collines','géant','à cornes','lumineux'][(rr()*5)|0],col=new THREE.Color().setHSL(((F.hu+rv(60))%360+360)%360/360,.45,.45),glow=new THREE.Color().setHSL(rr(),.9,.6),big=.8+rr()*.8;
const P=poi('fauna','Troupeau : '+name,c,'🦎');for(let k=0;k<(LOWQ?3:4);k++){const m=buildCreature(col,glow,big);const q=c.clone().add(new V3(rv(14),0,rv(14)));m.position.copy(q);sc.add(m);GR.fauna.push({m,pos:m.position,c,herd:hI,name,yaw:rr()*TAU,tg:null,ph:rr()*9,spd:0,graze:rr()*5,big,P})}}
// oiseaux
{const c=spot(0);if(c){for(let k=0;k<7;k++){const b=buildBird(new THREE.Color().setHSL(((F.hu+200)%360)/360,.4,.3));sc.add(b);GR.birds.push({m:b,c:c.clone().add(new V3(0,70+rr()*40,0)),a:rr()*TAU,r:40+rr()*30,sp:.25+rr()*.2,ph:rr()*9})}}}
// quête active sur cette planète ?
if(G.pq&&G.pq.pl==F.p.name&&G.pq.ty=='box'){const W=GR.pois.find(q=>q.k=='wreck');if(W&&W.box&&!G.pq.have){W.box.m.visible=true;W.box.I.done=false}}
exFogLoad()};
// ----- modèles : créature et oiseau -----
function buildCreature(col,glow,big){const g=new THREE.Group(),M=new THREE.MeshStandardMaterial({color:col,roughness:.75,flatShading:true}),Gm=new THREE.MeshStandardMaterial({color:glow,emissive:glow,emissiveIntensity:.8}),add=(geo,m,x,y,z,par=g)=>{const q=new THREE.Mesh(geo,m);q.position.set(x,y,z);q.castShadow=DESK;par.add(q);return q};
const body=add(new THREE.SphereGeometry(1,12,9),M,0,2.1,0);body.scale.set(1.1,.9,1.9);const legs=[];for(const[x,z]of[[-.7,1],[.7,1],[-.7,-1.1],[.7,-1.1]]){const L=new THREE.Group();L.position.set(x,1.9,z);g.add(L);add(new THREE.CylinderGeometry(.22,.14,1.9,6),M,0,-.95,0,L);add(new THREE.SphereGeometry(.2,6,5),M,0,-1.9,0,L);legs.push(L)}
const neck=new THREE.Group();neck.position.set(0,2.6,-1.5);g.add(neck);add(new THREE.CylinderGeometry(.3,.45,1.6,7),M,0,.6,-.3,neck).rotation.x=-.6;const head=add(new THREE.SphereGeometry(.5,10,8),M,0,1.3,-.9,neck);head.scale.set(.85,.8,1.3);for(const s of[-1,1]){add(new THREE.SphereGeometry(.09,6,5),new THREE.MeshBasicMaterial({color:0x101010}),s*.3,1.45,-1.3,neck);add(new THREE.ConeGeometry(.08,.7,5),M,s*.25,1.8,-.7,neck).rotation.x=-.5}
add(new THREE.ConeGeometry(.3,1.6,6),M,0,2.2,2.2).rotation.x=Math.PI/2+.4;for(let i=0;i<6;i++)add(new THREE.SphereGeometry(.13,6,5),Gm,(i%2?.5:-.5)*.9,2.75,-1+i*.4);g.scale.setScalar(big);g.userData={legs,neck};return g}
function buildBird(col){const g=new THREE.Group(),M=new THREE.MeshStandardMaterial({color:col,roughness:.7,side:THREE.DoubleSide});const b=new THREE.Mesh(new THREE.ConeGeometry(.4,2,6).rotateX(-Math.PI/2),M);g.add(b);const wings=[];for(const s of[-1,1]){const w=new THREE.Group();g.add(w);const m=new THREE.Mesh(new THREE.PlaneGeometry(2.4,.9),M);m.rotation.x=-Math.PI/2;m.position.x=s*1.2;w.add(m);wings.push(w)}g.userData={wings};g.scale.setScalar(1.6);return g}
// ----- contenu des caisses -----
function crateLoot(){const r=Math.random();boom3(FOOT.pos.clone().add(new V3(0,1.5,0)),12,0xffc040,30);
if(r<.1){giveRarePart();return}if(r<.22){G.cr+=250+(Math.random()*350|0);toast('📦 Crédits trouvés !');SFX.coin();return}
if(r<.36&&G.w.some(w=>WPN[w].am)){const am=G.w.includes('missile')?'missile':'mine';G.ammo[am]+=AMMO[am].q;toast('📦 +'+AMMO[am].q+' '+(am=='missile'?'missiles':'mines'));SFX.coin();return}
const pool=r<.65?['metal','elec','med','lux','fuel']:['fer','titane','cristal','or','herbes'],id=pool[Math.random()*pool.length|0],n=addCargo(id,2+(Math.random()*3|0));if(n){toast('📦 +'+n+' '+GOODS.find(g=>g.id==id).n);SFX.coin()}else{G.cr+=200;toast('📦 Soute pleine — +200 ¢ à la place')}}
// ----- quêtes du campement -----
function questTalk(n){const F=GR.F,q=G.pq;n.sayT=5;SFX.tick();
if(q&&q.pl==F.p.name){let ok=false;if(q.ty=='min'||q.ty=='plant'){if((G.cargo[q.item]||0)>=q.need){G.cargo[q.item]-=q.need;if(!G.cargo[q.item])delete G.cargo[q.item];ok=true}}else if(q.ty=='box')ok=!!q.have;else if(q.ty=='scan')ok=q.have>=q.need;
if(ok){n.say='Parfait, merci pilote ! Voici ta récompense.';G.pq=null;G.cr+=500;giveRarePart();setTimeout(()=>toast('✔ Quête terminée : +500 ¢'),2400);GR.qdone=(GR.qdone||0)+1;return}n.say='Toujours en cours : '+q.txt+(q.ty=='scan'?' ('+q.have+'/'+q.need+')':'');return}
if(q&&q.pl!=F.p.name){n.say='Tu as déjà une quête sur '+q.pl+'. Termine-la d\'abord !';return}
const mins=MINS_BY[F.ty]||['fer'],types=['min','plant','scan'];if(GR.pois.some(p=>p.k=='wreck'))types.push('box');const ty=types[Math.random()*types.length|0];let nq;
if(ty=='min'){const it=mins[Math.random()*mins.length|0];nq={ty,item:it,need:4,txt:'Rapporte 4 '+GOODS.find(g=>g.id==it).n+' au campement'}}
else if(ty=='plant')nq={ty,item:'herbes',need:4,txt:'Cueille 4 plantes rares et rapporte-les'};else if(ty=='scan')nq={ty,need:2,have:0,txt:'Scanne 2 créatures de cette planète'};
else{nq={ty,have:0,txt:'Retrouve la boîte noire près de l\'épave'};const W=GR.pois.find(p=>p.k=='wreck');if(W){W.box.m.visible=true;W.box.I.done=false;W.found=true}}
nq.pl=F.p.name;G.pq=nq;n.say='J\'ai besoin d\'aide ! '+nq.txt+'. Je te paierai bien — et j\'ai une pièce rare pour toi.';toast('❗ Nouvelle quête : '+nq.txt);SFX.buy();save()}
const _ci=contentInfo;contentInfo=function(){const s=_ci();const q=G.pq;if(!q||mode!='surf'||!GR||q.pl!=GR.F.p.name)return s;return(s?s+'<br>':'')+`<span style="color:#ffd257">❗ ${q.txt}${q.ty=='scan'?' ('+q.have+'/'+q.need+')':q.ty=='min'||q.ty=='plant'?' ('+Math.min(q.need,G.cargo[q.item]||0)+'/'+q.need+')':q.ty=='box'&&q.have?' ✔':''}</span>`};
// ----- mise à jour : fumée, monolithe, faune, oiseaux, scanner, brouillard -----
const _exT=SURF.tick;
SURF.tick=function(dt,F){_exT(dt,F);if(!GR||!GR.inter)return;const me=FOOT.on?FOOT.pos:S.pos;
if(GR.embers)GR.embers.forEach((e,i)=>e.material.opacity=.45+Math.sin(t*9+i*2.3)*.25);for(const s of GR.smoke){s.t+=dt*.12;if(s.t>1)s.t-=1;const k=s.t;s.s.position.copy(s.b).add(_g1.set(Math.sin(k*5)*3,k*40,k*6));s.s.scale.setScalar(5+k*24);s.s.material.opacity=Math.min(1,k*6)*(1-k)}
if(GR.mono){const m=GR.mono;m.orbs.forEach((o,i)=>{const a=t*.6+i*2.1;o.position.set(m.p.x+Math.cos(a)*5,m.p.y+8+Math.sin(t*1.3+i)*1.5,m.p.z+Math.sin(a)*5);o.rotation.y+=dt*2})}
if(GR.fire){const f=GR.fire.p;if(Math.random()<.3)SPK.emit(f.x+rv(.3),f.y,f.z+rv(.3),rv(.5),1.5+Math.random()*2.5,rv(.5),.7+Math.random()*.8,1,.5+Math.random()*.2,.12,.6);if(Math.random()<.12)FIRE.emit(f.x+rv(.2),f.y,f.z+rv(.2),rv(.3),1.2,rv(.3),.35,.35,.16,.04,.4);GR.fire.s.scale.setScalar(2.1+Math.sin(t*17)*.25+Math.random()*.4)}
for(const P of GR.plants)if(!P.I.done)P.bulb.scale.setScalar(1+Math.sin(t*2+P.p.x)*.08);
// faune
const shipLow=!FOOT.on&&S.pos.y-F.h(S.pos.x,S.pos.z)<60;for(const A of GR.fauna){const dx=A.pos.x-me.x,dz=A.pos.z-me.z,d=Math.hypot(dx,dz),scared=d<(FOOT.on?16:shipLow?70:0);let tsp=0;
if(scared){A.yaw=Math.atan2(-dx,-dz)+Math.PI;tsp=9}else{A.graze-=dt;if(A.graze<=0){if(!A.tg){A.tg=A.c.clone().add(_g2.set(rv(30),0,rv(30)))}const tx=A.tg.x-A.pos.x,tz=A.tg.z-A.pos.z,td=Math.hypot(tx,tz);if(td<2){A.tg=null;A.graze=3+Math.random()*6}else{A.yaw=Math.atan2(-tx,-tz);tsp=2.2}}}
A.spd=lerp(A.spd,tsp,damp(3,dt));let yw=A.yaw-A.m.rotation.y;yw=Math.atan2(Math.sin(yw),Math.cos(yw));A.m.rotation.y+=yw*damp(4,dt);A.pos.x-=Math.sin(A.m.rotation.y)*A.spd*dt;A.pos.z-=Math.cos(A.m.rotation.y)*A.spd*dt;
if(Math.hypot(A.pos.x-A.c.x,A.pos.z-A.c.z)>90){A.tg=A.c.clone()}const gy=F.h(A.pos.x,A.pos.z);if(gy<0){A.pos.x+=Math.sin(A.m.rotation.y)*A.spd*dt*2;A.pos.z+=Math.cos(A.m.rotation.y)*A.spd*dt*2}A.pos.y=Math.max(0,gy);
A.ph+=dt*A.spd*1.4;const u=A.m.userData,sw=Math.sin(A.ph)*Math.min(1,A.spd/3)*.6;u.legs[0].rotation.x=sw;u.legs[3].rotation.x=sw;u.legs[1].rotation.x=-sw;u.legs[2].rotation.x=-sw;u.neck.rotation.x=lerp(u.neck.rotation.x,A.spd<.5&&A.graze>0?.9:0,damp(2,dt));
if(d<120)A.P.found=true}
for(const B of GR.birds){B.a+=B.sp*dt;B.m.position.set(B.c.x+Math.cos(B.a)*B.r,B.c.y+Math.sin(B.a*2)*6,B.c.z+Math.sin(B.a)*B.r);B.m.rotation.y=-B.a;B.m.rotation.z=.3;const f=Math.sin(t*8+B.ph)*.6;B.m.userData.wings[0].rotation.z=f;B.m.userData.wings[1].rotation.z=-f}
// découvertes proches + brouillard
for(const P of GR.pois)if(!P.found&&Math.hypot(P.pos.x-me.x,P.pos.z-me.z)<(FOOT.on?60:140)){P.found=true;if(P.k!='crate'&&P.k!='fauna'){toast('📍 Découverte : '+P.name);SFX.disc()}}
const alt=FOOT.on?0:Math.max(0,S.pos.y-F.h(S.pos.x,S.pos.z));exRevealAround(me,FOOT.on?160:Math.min(600,220+alt*.6));if(FOOT.boostT&&t<FOOT.boostT)FOOT.fuel=1};
// scanner de faune (interaction à pied)
const _exNP=nearInter;nearInter=function(){const I=_exNP();if(I||!GR||!GR.fauna)return I;let b=null,bd=16;for(const A of GR.fauna){const d=Math.hypot(A.pos.x-FOOT.pos.x,A.pos.z-FOOT.pos.z);if(d<bd){bd=d;b=A}}if(!b)return null;
return{pos:b.pos,r:16,label:()=>'🔬 SCANNER · '+b.name,act:()=>{const id='sp'+b.herd,L=exLoot(),nw=!L.includes(id);if(G.pq&&G.pq.ty=='scan'&&G.pq.pl==GR.F.p.name&&!(GR.scanned||[]).includes(b)){(GR.scanned=GR.scanned||[]).push(b);G.pq.have=Math.min(G.pq.need,G.pq.have+1)}
if(nw){L.push(id);G.cr+=200;toast('🔬 Nouvelle espèce répertoriée : '+b.name+' (+200 ¢)');SFX.disc()}else toast('🔬 '+b.name+' — déjà répertoriée');tone(1200,1800,.3,'sine',.05)}}};
// ----- carte de la planète (brouillard d'exploration sauvegardé) -----
const FOGN=64;let FOG=null;
function exFogLoad(){const k=GR.F.p.name;G.pexp=G.pexp||{};FOG=new Uint8Array(FOGN*FOGN);const s=G.pexp[k];if(s)try{const b=atob(s);for(let i=0;i<FOG.length;i++)FOG[i]=(b.charCodeAt(i>>3)>>(i&7))&1}catch(e){}GR.mapImg=null}
function exFogSave(){if(!GR||!FOG)return;let s='';for(let i=0;i<FOG.length;i+=8){let c=0;for(let k=0;k<8;k++)c|=FOG[i+k]<<k;s+=String.fromCharCode(c)}G.pexp[GR.F.p.name]=btoa(s)}
function exRevealAround(p,R){if(!FOG||!GR)return;const H=GR.F.HALF,cs=H*2/FOGN,cx=Math.floor((p.x+H)/cs),cz=Math.floor((p.z+H)/cs),n=Math.ceil(R/cs);let ch=0;for(let i=-n;i<=n;i++)for(let j=-n;j<=n;j++){const x=cx+i,z=cz+j;if(x<0||z<0||x>=FOGN||z>=FOGN||i*i+j*j>n*n)continue;const k=z*FOGN+x;if(!FOG[k]){FOG[k]=1;ch=1}}if(ch&&Math.random()<.05)exFogSave()}
function exRevealAll(){if(!FOG)return;FOG.fill(1);for(const P of GR.pois)P.found=true;exFogSave()}
const exSeen=p=>{if(!FOG||!GR)return false;const H=GR.F.HALF,cs=H*2/FOGN,x=Math.floor((p.x+H)/cs),z=Math.floor((p.z+H)/cs);return x>=0&&z>=0&&x<FOGN&&z<FOGN&&FOG[z*FOGN+x]};
function exMapImg(){if(GR.mapImg)return GR.mapImg;const F=GR.F,N=200,c=mkC(N),x=c.getContext('2d'),im=x.createImageData(N,N),H=F.HALF,ty=F.ty;
const lc=ty=='Volcanique'?[230,90,20]:ty=='Glacée'?[150,190,215]:ty=='Océanique'?[30,90,160]:ty=='Désertique'?[150,110,60]:[40,110,110];
for(let j=0;j<N;j++)for(let i=0;i<N;i++){const wx=-H+(i+.5)/N*H*2,wz=-H+(j+.5)/N*H*2,y=F.h(wx,wz),y2=F.h(wx+16,wz+16),sh=clamp(.75+(y-y2)*.02,.35,1.3);let c;
if(y<0)c=lc;else{const k=clamp(y/220,0,1),base=hsl(ty=='Glacée'?205:ty=='Volcanique'?F.hu:ty=='Désertique'?38:F.hu,.35,.25+k*.35);c=y>170&&ty!='Désertique'&&ty!='Volcanique'?[220,225,232]:base}const o=(j*N+i)*4;im.data[o]=c[0]*sh;im.data[o+1]=c[1]*sh;im.data[o+2]=c[2]*sh;im.data[o+3]=255}
x.putImageData(im,0,0);return GR.mapImg=c}
const _exDM=drawMap;
drawMap=function(){if(mode!='surf'||!GR){_exDM();return}const W=innerWidth,H=innerHeight,F=GR.F,HF=F.HALF,z=MAP.zoom;MX.fillStyle='#04070e';MX.fillRect(0,0,W,H);const[x0,y0]=w2s(-HF,-HF),sz=HF*2*z;
MX.imageSmoothingEnabled=true;MX.drawImage(exMapImg(),x0,y0,sz,sz);const cs=sz/FOGN;MX.fillStyle='rgba(4,7,14,.94)';for(let j=0;j<FOGN;j++)for(let i=0;i<FOGN;i++)if(!FOG||!FOG[j*FOGN+i])MX.fillRect(x0+i*cs-.5,y0+j*cs-.5,cs+1,cs+1);
MX.strokeStyle='rgba(140,200,255,.4)';MX.lineWidth=1.5;MX.strokeRect(x0,y0,sz,sz);const it=[];
const mk=(o,c,ic,txt,big)=>{const[x,y]=w2s(o.x,o.z);it.push({x:o.x,z:o.z,n:txt,c});MX.textAlign='center';MX.textBaseline='middle';if(big){MX.fillStyle='rgba(6,12,24,.78)';MX.beginPath();MX.arc(x,y,13,0,TAU);MX.fill();MX.strokeStyle=c;MX.lineWidth=1.6;MX.stroke()}MX.font=big?'600 16px system-ui':'600 12px system-ui';MX.fillStyle=c;MX.fillText(ic,x,y+(big?1:0));if(z>.25||o===MAP.sel||(big&&z>.12)){MX.font='600 10px system-ui';MX.lineWidth=3;MX.strokeStyle='rgba(4,8,16,.8)';MX.strokeText(txt,x,y+(big?22:13));MX.fillStyle='rgba(235,242,255,.95)';MX.fillText(txt,x,y+(big?22:13))}};
for(const P of GR.pois)if(P.k=='crate'&&(P.found||exSeen(P.pos))&&!(P.I&&P.I.done))mk(P.pos,'#ffc040','📦','Caisse');
for(const D of GR.deps)if(exSeen(D.pos))mk(D.pos,'#'+MINC[D.min].toString(16).padStart(6,'0'),'◆',GOODS.find(g=>g.id==D.min).n);const I=SURF.info();for(const a of I.arts)if(exSeen(a.pos))mk(a.pos,'#ffd060','✦','Artefact');for(const T of I.tur)if(exSeen(T.pos))mk(T.pos,'#ff5050','⌖','Tourelle pirate');
const PC={wreck:'#ff9a40',bunker:'#c8c0b0',mono:'#c080ff',camp:'#7fff99',fauna:'#b6e36a'};for(const P of GR.pois)if(P.k!='crate'&&P.found)mk(P.pos,PC[P.k]||'#fff',P.ic,P.name,1);if(GR.op)mk(GR.op,'#ffc845','⬡','Avant-poste',1);
if(FOOT.on)mk(FOOT.sp,'#9fd8ff','🚀','Ton vaisseau');{const[x,y]=w2s(S.pos.x,S.pos.z);fwd();MX.save();MX.translate(x,y);MX.rotate(Math.atan2(_f.x,-_f.z));MX.fillStyle='#fff';MX.beginPath();MX.moveTo(0,-9);MX.lineTo(-6,7);MX.lineTo(0,3);MX.lineTo(6,7);MX.fill();MX.restore()}
MAP.items=it;let ex=0;if(FOG){for(const v of FOG)ex+=v;ex=Math.round(ex/FOG.length*100)}const S2=MAP.sel;let info=`<b>Carte de ${F.p.name}</b> · ${F.ty}<br><small>Exploré : ${ex}% · glisse pour déplacer · ${DESK?'molette':'boutons'} pour zoomer</small>`;
const pq=G.pq&&G.pq.pl==F.p.name?`<br><span style="color:#ffd257">❗ ${G.pq.txt}</span>`:'';info+=pq;if(S2)info+=`<br><b style="color:${S2.c}">${S2.n}</b> · ${Math.round(Math.hypot(S2.x-S.pos.x,S2.z-S.pos.z))} m`;
info+='<br><small>⬡ avant-poste · 📦 caisse · 🛸 épave · 🏚 bunker · 🗿 monolithe · ⛺ campement · 🦎 faune · ◆ filon</small>';if(HC.mapI!==info){HC.mapI=info;$('mapinfo').innerHTML=info}};
const _exOM=openMap;openMap=function(){_exOM();if(MAP.open&&mode=='surf'&&GR){MAP.zoom=Math.min(innerWidth,innerHeight)/(GR.F.HALF*2.25);MAP.cx=0;MAP.cz=innerWidth<innerHeight?-GR.F.HALF*.12:0;drawMap()}};
$('mapb').onclick=openMap;
// repères sur le radar
const _exR=SURF.radar;SURF.radar=blip=>{_exR(blip);if(!GR||!GR.pois)return;for(const P of GR.pois){if(P.k=='crate'){if(!(P.I&&P.I.done))blip(P.pos,'#ffc040',1.8)}else if(P.found)blip(P.pos,P.k=='mono'?'#c080ff':P.k=='camp'?'#7f9':P.k=='wreck'?'#ff9a40':P.k=='fauna'?'#b6e36a':'#ccc',2.8,true)}};
