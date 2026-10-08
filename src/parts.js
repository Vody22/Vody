// ===== ATELIER : pièces de vaisseau achetables une à une (visuels + boutique) =====
let ASLOT='paint',PREV=null,ORB=0;
const GM={};function gm(c,op=1){const k=c+'|'+op;return GM[k]||(GM[k]=new THREE.MeshBasicMaterial({color:c,transparent:op<1,opacity:op,blending:op<1?ADDB:THREE.NormalBlending,depthWrite:op>=1}))}
const shipParts=()=>PREV?{...G.parts,[PREV.s]:PREV.id}:G.parts;
const cyl=(r1,r2,h,s=10,open=false)=>new THREE.CylinderGeometry(r1,r2,h,s,1,open).rotateX(Math.PI/2);
const BARREL=lathe([[.24,-3],[.24,1],[.32,1.4],[.32,2],[0,2]],8);
// points d'ancrage des canons selon les ailes : [paire extérieure, paire intérieure]
const HARD={std:[[8.45,-.25,-.4],[4.4,-.35,-1.2]],delta:[[6.6,-.3,.4],[3.6,-.4,-1.6]],blindees:[[7.75,-.3,-.9],[4.3,-.5,-1.3]],lames:[[7,1.55,-1.3],[7,-1.25,-1.3]]};
const NAV={delta:[8.6,-.25,3.6],blindees:[7.8,-.1,2.9],lames:[8.6,1.9,-3.2]};
const _bsVar=buildShip;
buildShip=function(P,hasLz){P=P||shipParts();if(hasLz==null)hasLz=G.w.includes('laser')||(PREV&&PREV.s=='focus');
const root=_bsVar(),ud=root.userData,b=ud.body,MT=ud.mats,H=MT.hull,W=MT.wing,A=MT.accent,D=MT.dark;
const add=(geo,mat,x,y,z,rx=0,ry=0,rz=0,par=b)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);par.add(o);return o};
const sp=(c,s,x,y,z,par=b)=>{const o=sprite(c,s);o.position.set(x,y,z);par.add(o);return o};
const pid=s=>(P[s]&&PARTS[s].o[P[s]])?P[s]:'std';
// --- nez ---
const nose=pid('nose');
if(nose=='radar'){add(cyl(.07,.07,4.6,6),MAT.metal,0,0,-11.4);add(new THREE.TorusGeometry(.38,.05,6,16),D,0,0,-10.6);add(new THREE.TorusGeometry(.26,.04,6,14),D,0,0,-12.2);ud.blink=sp(0xff3a3a,1.8,0,0,-13.8);
const dome=add(new THREE.SphereGeometry(.7,16,10,0,TAU,0,Math.PI/2),D,0,.95,-6.4);dome.scale.set(1,.55,1.7);for(const s of[-1,1])add(cyl(.04,.04,2.2,4),MAT.metal,s*.55,.3,-8.6,.25,s*.18,0)}
else if(nose=='eperon'){const r=add(new THREE.ConeGeometry(1.05,4.4,6).rotateX(-Math.PI/2),D,0,-.05,-11.2);r.scale.set(1,.72,1);for(const s of[-1,1]){add(new THREE.BoxGeometry(.12,.5,3.6),A,s*.72,-.05,-10.2,0,s*.2,0);add(new THREE.BoxGeometry(.5,.12,3.2),MAT.metal,s*.55,-.45,-9.6,0,s*.12,0)}}
else if(nose=='chasse'){const c=add(new THREE.ConeGeometry(.55,2.8,10).rotateX(-Math.PI/2),H,0,0,-10.6);add(new THREE.SphereGeometry(.32,12,8),gm(0xff3030),0,-.45,-8.2);sp(0xff3030,2.2,0,-.45,-8.4);
add(cyl(.28,.32,3,8),D,0,-.75,-6.8);add(cyl(.12,.12,2,6),MAT.metal,0,-.75,-8.6);for(const s of[-1,1])add(new THREE.BoxGeometry(.9,.08,1.6),A,s*.75,.1,-8.4,0,s*.35,0)}
// --- ailes ---
const wings=pid('wings');
if(wings!='std'){ud.wingG.visible=false;
const ext=(pts,d=.22)=>{const s=new THREE.Shape();s.moveTo(...pts[0]);for(const p of pts.slice(1))s.lineTo(...p);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelThickness:.07,bevelSize:.1,bevelSegments:2});g.rotateX(Math.PI/2);g.translate(1.2,0,0);return g};
if(wings=='delta'){const g=ext([[0,-4.6],[7.4,3.2],[7.4,3.9],[0,3.9]]);for(const s of[-1,1]){const w=add(g,W,0,-.25,.4,0,0,s*-.04);w.scale.x=s;
add(new THREE.BoxGeometry(10.7,.06,.3),A,s*4.9,-.12,-.3,0,s*-.812,0);add(new THREE.BoxGeometry(.18,1.5,2),W,s*8.5,.35,3.6,-.3,0,s*-.1);add(cyl(.2,.2,2.6,8),D,s*8.6,-.25,3.4)}}
else if(wings=='blindees'){for(const s of[-1,1]){add(new THREE.BoxGeometry(6.1,.55,3.9),W,s*4.65,-.3,.8);add(new THREE.BoxGeometry(6.1,.4,1.1),W,s*4.65,-.3,-1.45,.35,0,0);
for(const x of[3.5,5.8])add(new THREE.BoxGeometry(1.9,.16,3),D,s*x,.04,.8);add(new THREE.BoxGeometry(.38,1.9,4.4),H,s*7.85,-.1,.6);add(new THREE.BoxGeometry(.4,.12,4.42),A,s*7.85,.7,.6);
for(let i=0;i<4;i++)add(cyl(.09,.09,.12,6).rotateX(Math.PI/2),MAT.metal,s*(2.4+i*1.5),.06,2.4)}}
else if(wings=='lames'){const g=ext([[0,-1],[7.2,-3.6],[8,-3.3],[7.6,-2.4],[1,2.4],[0,2.6]],.16);for(const s of[-1,1])for(const up of[1,-1]){const grp=new THREE.Group();grp.position.set(0,up>0?.15:-.45,.6);grp.rotation.z=s*up*.21;b.add(grp);
const w=add(g,W,0,0,0,0,0,0,grp);w.scale.x=s;add(new THREE.BoxGeometry(7.65,.06,.12),gm(PARTS.paint.o[pid('paint')].c?PARTS.paint.o[pid('paint')].c[2]:0x46e6ff,.7),s*4.8,.06,-2.3,0,s*.347,0,grp);add(cyl(.16,.16,1.8,8),D,s*8.7,0,-3.3,0,0,0,grp)}}
const n=NAV[wings];ud.nl.position.set(-n[0],n[1],n[2]);ud.nr.position.set(n[0],n[1],n[2])}
// --- canons ---
const guns=pid('guns'),gp=PARTS.guns.o[guns];
if(guns!='std'||wings!='std'){ud.gunG.visible=false;const hp=HARD[wings],mounts=[];
if(ud.wl>=2||guns!='std'){mounts.push(hp[0]);if(ud.wl>=4)mounts.push(hp[1])}
const L=[],R=[];ud.spin=[];ud.recoil=[];
for(const m of mounts)for(const s of[-1,1]){const x=s*m[0],y=m[1],z=m[2],out=s<0?L:R;
if(guns=='std'){add(BARREL,MAT.metal,x,y,z);out.push([x,y,z-3])}
else if(guns=='jumeles'){add(new THREE.BoxGeometry(1.2,.55,1.5),D,x,y,z+.7);for(const k of[-1,1]){const o=add(BARREL,MAT.metal,x+k*.32,y,z);o.scale.set(.8,.8,.95);out.push([x+k*.32,y,z-2.9])}}
else if(guns=='lourds'){add(new THREE.BoxGeometry(.95,.95,2),D,x,y,z+.7);const br=add(cyl(.34,.42,3.4,10),MAT.metal,x,y,z-1.3);ud.recoil.push({o:br,z:z-1.3});add(new THREE.BoxGeometry(.95,.5,.6),D,x,y,z-3);out.push([x,y,z-3.4])}
else if(guns=='rotatifs'){add(cyl(.58,.58,1.6,12),D,x,y,z+.5);const g2=new THREE.Group();g2.position.set(x,y,z-1);b.add(g2);for(let k=0;k<6;k++){const a=k/6*TAU;add(cyl(.09,.09,3.2,6),MAT.metal,Math.cos(a)*.3,Math.sin(a)*.3,-.4,0,0,0,g2)}add(new THREE.TorusGeometry(.42,.07,6,14),D,0,0,-1.9,0,0,0,g2);ud.spin.push(g2);out.push([x,y,z-3])}
else if(guns=='plasma'){add(cyl(.3,.36,3.4,10),D,x,y,z-1.1);for(let k=0;k<3;k++)add(new THREE.TorusGeometry(.42,.07,6,16),gm(gp.bc),x,y,z-.2-k*.9);add(new THREE.SphereGeometry(.3,10,8),gm(0xd8ffd8),x,y,z-2.9);sp(gp.bc,2.6,x,y,z-2.9);out.push([x,y,z-3.1])}}
const mz=[];for(let i=0;i<Math.max(L.length,R.length);i++){if(L[i])mz.push(L[i]);if(R[i])mz.push(R[i])}ud.muzzles=mz.length?mz:[[-4.6,-.3,-6],[4.6,-.3,-6]]}
// --- moteurs ---
const eng=pid('eng');
if(eng!='std'){ud.engG.visible=false;const col=PARTS.eng.o[eng].col,fl=[];
const E=(x,y,z,r)=>{const k=r/.8;const nz=add(lathe([[.5,-1.6],[.62,-1],[.72,.4],[.8,1.2],[.74,1.4],[.55,1.4]],16),D,x,y,z);nz.scale.setScalar(k);
add(new THREE.TorusGeometry(.74*k,.07*k,6,20),MAT.metal,x,y,z+.7*k);add(new THREE.CircleGeometry(.56*k,20),new THREE.MeshBasicMaterial({color:new THREE.Color(col).multiplyScalar(DESK?1.8:1.2)}),x,y,z+1.36*k);
const f=add(new THREE.ConeGeometry(.5*k,4,12,1,true).rotateX(Math.PI/2),new THREE.MeshBasicMaterial({color:DESK?new THREE.Color(col).multiplyScalar(1.6):col,transparent:true,opacity:.85,blending:ADDB,depthWrite:false,side:THREE.DoubleSide}),x,y,z+3.4*k);
const g=sp(col,3*k,x,y,z+1.7*k);fl.push({fl:f,gs:g});return k};
if(eng=='ion'){for(const s of[-1,1]){add(cyl(.82,.9,3.6,16),H,s*1.25,0,1.6);const k=E(s*1.25,0,4.6,.86);for(let i=0;i<3;i++)add(new THREE.TorusGeometry(.92,.045,6,24),gm(col),s*1.25,0,.4+i*.9)}}
else if(eng=='triple'){[[-1.8,-.15],[0,.75],[1.8,-.15]].forEach(([x,y])=>{E(x,y,4.5,1);for(let i=0;i<4;i++){const a=i/4*TAU+Math.PI/4;add(new THREE.BoxGeometry(.08,.5,1.6),D,x+Math.cos(a)*.95,y+Math.sin(a)*.95,4.3,0,0,a)}})}
else if(eng=='fusion'){E(0,.05,4.9,1.45);add(new THREE.TorusGeometry(1.95,.15,8,36),gm(col),0,.05,4.5);add(new THREE.TorusGeometry(2.2,.05,6,36),gm(col,.6),0,.05,4.5);for(const s of[-1,1])E(s*2.15,-.25,4.6,.55)}
ud.flames=fl}
// --- blindage ---
const arm=pid('armor');
if(arm=='composite'){for(const s of[-1,1])for(const z of[-1.6,1.6]){add(new THREE.BoxGeometry(.22,.85,2.9),H,s*1.72,0,z);add(new THREE.BoxGeometry(.24,.1,2.92),D,s*1.73,.42,z)}add(new THREE.BoxGeometry(1.3,.16,3.6),H,0,1.27,1.1);add(new THREE.BoxGeometry(1.32,.06,3.62),A,0,1.36,1.1)}
else if(arm=='reactif'){for(const s of[-1,1])for(let i=0;i<5;i++)add(new THREE.BoxGeometry(.5,.62,1.05),i%2?A:H,s*1.76,0,-4+i*1.5);for(let i=0;i<3;i++)add(new THREE.BoxGeometry(1.1,.36,.95),H,0,1.3,.2+i*1.15)}
else if(arm=='nano'){const nm=gm(0x50f0ff,.85);for(const s of[-1,1]){add(new THREE.BoxGeometry(.05,.05,8.4),nm,s*1.62,.38,-.6);add(new THREE.BoxGeometry(.05,.05,6),nm,s*1.5,-.5,0);for(let i=0;i<4;i++)add(new THREE.BoxGeometry(.05,.05,1.2),nm,s*1.66,0,-3+i*1.9,.9,0,0)}sp(0x50f0ff,2.4,0,1.3,1.2);H.emissive.setHex(0x0a3a4a);H.emissiveIntensity=.35}
// --- bouclier ---
const shp=PARTS.shield.o[pid('shield')];
if(shp.sh){for(const s of[-1,1]){add(new THREE.SphereGeometry(.36,12,8,0,TAU,0,Math.PI/2),gm(shp.scol),s*.78,1.16,1.3);sp(shp.scol,1.8,s*.78,1.45,1.3)}if(shp.sh>=100)add(new THREE.TorusGeometry(2.05,.07,6,36),gm(shp.scol,.65),0,0,1.2);ud.shield.material.uniforms.col.value.set(shp.scol)}
// --- émetteur laser (si l'arme Laser est achetée) ---
const fo=pid('focus'),fp=PARTS.focus.o[fo];
if(hasLz){const xs=fo=='prisme'?[-1.35,1.35]:[0],big=fo=='solaire';ud.lasers=[];for(const x of xs){add(cyl(big?.42:.32,big?.52:.42,big?3.4:2.8,10),D,x,-.85,-6.6);add(new THREE.SphereGeometry(big?.38:.29,12,8),gm(fp.lc),x,-.85,-8.1);sp(fp.lc,big?3.2:2.2,x,-.85,-8.2);
if(big||fo=='surcharge'||fo=='cryo')for(let i=0;i<(big?3:2);i++)add(new THREE.TorusGeometry(big?.5:.42,.05,6,16),gm(fp.lc,.8),x,-.85,-7.4+i*.7);ud.lasers.push([x,-.85,-8.6])}}
// --- soute ---
const cg=pid('cargo');
if(cg=='pods'){for(const s of[-1,1]){add(new THREE.BoxGeometry(1.5,1.2,4.4),H,s*3.4,-1.2,1.3);add(new THREE.BoxGeometry(.3,.65,1.6),D,s*3.4,-.55,1.3);add(new THREE.BoxGeometry(1.52,.12,4.42),A,s*3.4,-.78,1.3);for(const z of[-.3,1.3,2.9])add(new THREE.BoxGeometry(1.56,1.26,.16),D,s*3.4,-1.2,z)}}
else if(cg=='ventral'){add(new THREE.BoxGeometry(2.4,1.4,6.4),H,0,-1.55,1.2);for(let i=0;i<4;i++)add(new THREE.BoxGeometry(2.46,1.46,.16),D,0,-1.55,-1.5+i*1.8);add(new THREE.BoxGeometry(2.42,.12,6.42),A,0,-.95,1.2);for(const s of[-1,1])sp(0xffb040,1.4,s*1.1,-1.6,4.45)}
// --- peinture ---
const pc=PARTS.paint.o[pid('paint')].c;
if(pc){const dn=new Set();root.traverse(o=>{const m=o.material;if(!o.isMesh||!m||dn.has(m))return;if(m.name=='hull'){m.color.setHex(pc[0]);if(arm!='nano')m.emissive&&m.emissive.setHex(pc[0]);dn.add(m)}else if(m.name=='wing'){m.color.setHex(pc[1]);m.emissive&&m.emissive.setHex(pc[1]);dn.add(m)}else if(m.name=='accent'){m.color.setHex(pc[2]);m.emissive&&m.emissive.setHex(pc[2]);m.emissiveIntensity=.35;dn.add(m)}})}
b.traverse(o=>{if(o.isMesh&&!o.material.blending)o.castShadow=DESK&&mode=='surf'});return root};
// ----- achat / installation -----
const ownPart=(s,id)=>id=='std'||G.pown.includes(s+':'+id);
function capWith(P){return Math.round(HS().cap*(1+(G.u[2]-1)*.66)*pmCalc(P).cap)}
function installPart(s,id){const np={...G.parts};if(id=='std')delete np[s];else np[s]=id;if(cargoUsed()>capWith(np)){toast('Vide ta soute avant de changer de soute');return false}
const r=S.hp/maxhp();G.parts=np;PREV=null;S.hp=Math.min(maxhp(),Math.max(S.hp,Math.round(r*maxhp())));S.sh=Math.min(S.sh||0,PM('sh'));rebuildShip();save();return true}
function buyPart(s,id){const o=PARTS[s]&&PARTS[s].o[id];if(!o)return;if(ownPart(s,id)){if(installPart(s,id)){toast(PARTS[s].ic+' '+o.n+' installé');SFX.buy()}return}
if(G.cr<o.p){toast('Pas assez de crédits');SFX.tick();return}const np={...G.parts,[s]:id};if(cargoUsed()>capWith(np)){toast('Vide ta soute avant de changer de soute');return}
G.cr-=o.p;G.pown.push(s+':'+id);installPart(s,id);toast('Nouvelle pièce : '+o.n+' !');SFX.win()}
// ----- onglet Atelier -----
TABS.push(['atelier','🔧 Atelier']);$('tabs').innerHTML=TABS.map(([k,n])=>`<button data-tab="${k}">${n}</button>`).join('');
const _shopView=shopView;
shopView=function(){if(TAB!='atelier')return _shopView();const s=ASLOT,SL=PARTS[s],cur=G.parts[s]||'std';
let h=`<div class="aslots">${PSLOTS.map(k=>`<button data-aslot="${k}" class="${k==s?'on':''}${(G.parts[k]||'std')!='std'?' mod':''}">${PARTS[k].ic}<small>${PARTS[k].n}</small></button>`).join('')}</div>`;
if(s=='focus'&&!G.w.includes('laser'))h+=`<div class="hint">Ces pièces améliorent l'arme <b>Laser</b> (onglet Armes).</div>`;
if(s=='shield')h+=`<div class="hint">Le bouclier encaisse les tirs avant la coque et se recharge après 3 s sans dégâts.</div>`;
h+=Object.entries(SL.o).map(([id,o])=>{const own=ownPart(s,id),eq=cur==id,pv=PREV&&PREV.s==s&&PREV.id==id;
const sw=o.c?`<i class="sw">${o.c.map(c=>`<em style="background:#${c.toString(16).padStart(6,'0')}"></em>`).join('')}</i>`:'';
return `<div class="srow arow${pv?' pv':''}${eq?' eq':''}" data-aprev="${s}:${id}"><div>${sw}<b>${o.n}</b>${eq?' <i class="tag">installé</i>':pv?' <i class="tag pvt">aperçu</i>':''}<small>${o.d||''}</small></div><span>${eq?'✓':own?`<button data-act="pbuy:${s}:${id}">Installer</button>`:`<button data-act="pbuy:${s}:${id}" ${G.cr<o.p?'class="dim"':''}>${o.p} ¢</button>`}</span></div>`}).join('');
return h+`<div class="hint">Touche une pièce pour la voir sur ton vaisseau</div>`};
$('shop').addEventListener('click',e=>{const b=e.target.closest('button');
if(b){if(b.dataset.aslot){ASLOT=b.dataset.aslot;HC.shopV=null;SFX.tick();return}const a=b.dataset.act||'';if(a.startsWith('pbuy:')){const[,s,id]=a.split(':');buyPart(s,id);HC.shopV=null}return}
const r=e.target.closest('[data-aprev]');if(!r)return;const[s,id]=r.dataset.aprev.split(':');const same=(G.parts[s]||'std')==id;PREV=same||(PREV&&PREV.s==s&&PREV.id==id)?null:{s,id};rebuildShip();HC.shopV=null;SFX.tick()});
// ----- par image : bouclier, réparation, aperçu, canons -----
function updParts(dt){if(ARGENT_ILLIMITE)G.cr=CR_INF;const ms=PM('sh');if(S.dead||S.docked)S.sh=ms;else if(ms>0){if(S.sh==null)S.sh=ms;if(t-(S.shT||-9)>3)S.sh=Math.min(ms,S.sh+dt*9*PM('shr'))}else S.sh=0;
const rg=PM('regen');if(rg&&!S.dead&&S.hp<maxhp())S.hp=Math.min(maxhp(),S.hp+rg*dt);
if(PREV&&(!S.docked||TAB!='atelier'||mode!='space')){PREV=null;rebuildShip();HC.shopV=null}
document.body.classList.toggle('atelier',!!S.docked&&TAB=='atelier'&&mode=='space');if(S.docked&&!updParts.seen){updParts.seen=1;let k=0;try{k=localStorage.getItem('sf-atelier')}catch(e){}if(!k){setTimeout(()=>toast('🔧 Nouveau : l\'Atelier ! Personnalise ton vaisseau pièce par pièce'),1800);try{localStorage.setItem('sf-atelier','1')}catch(e){}}}
const ud=ship.userData;if(ud.blink)ud.blink.visible=Math.sin(t*6)>0;updGuns(dt)}
// pièces partagées en multijoueur : un chiffre par emplacement
const partsCode=P=>PSLOTS.map(s=>Math.max(0,Object.keys(PARTS[s].o).indexOf((P||{})[s]||'std'))).join('');
function partsDecode(c){const P={};if(typeof c!='string')return P;PSLOTS.forEach((s,i)=>{const k=Object.keys(PARTS[s].o)[+c[i]|0];if(k&&k!='std')P[s]=k});return P}
