// ===== PERSONNALISATION : créateur de pilote (combinaison, accents, visière, casque, écusson) et peinture libre du vaisseau (couleurs, réacteurs, autocollants) =====
// visibles par les autres joueurs (présence : pl3 / pt3) ; aperçu 3D pendant que le panneau est ouvert
const CUS3={open:false,tab:'pil',sc:null,cam:null,pil:null,ship:null,t:0,tex:{},dirty:true};
const CUS3COL=[0xe8ecf0,0x8a939e,0x2a2e36,0xd23a3a,0xff8a2a,0xffc83d,0x3fbf5f,0x22b0a0,0x2fa7d8,0x3a5bd8,0x8a4fd8,0xe060b0,0x8a6a4a,0xb08860];
const CUS3VIS=[0x1a3a50,0xd8a020,0x30c070,0xc03030,0x8040c0,0x101418,0xc8d8e8];
const CUS3ENG=[0x50aaff,0xff5030,0xff9a30,0x40ff90,0xc060ff,0xffd040,0xffffff,0xff40a0];
const CUS3HELM=['Casque ouvert','Casque fermé','Sans casque'];
const CUS3SKIN=[0xf1c8a8,0xe0b090,0xd9a07a,0xa86a48,0x6e4630,0x4a2e20],CUS3HAIR=[0x101010,0x2a1810,0x5a3a20,0x8a5a30,0xc89048,0xe0c080,0x803020,0x8a8580,0xe8e8e8];
const CUS3HS={0:'Courte',1:'Queue de cheval',2:'Chignon',3:'Hérissée',4:'Longue',5:'Rasée',6:'Chauve'},CUS3BEARD={0:'Aucune',1:'De trois jours',2:'Pleine'};
const CUS3BADGE={none:'Aucun',alliance:'Alliance',guilde:'Guilde',pirates:'Pirates',front:'Front',etoile:'Étoile',crane:'Crâne',foudre:'Foudre'};
const CUS3DEC={none:'Aucun',crane:'Crâne',etoile:'Étoile',ailes:'Ailes',eclair:'Éclair',flamme:'Flamme',cible:'Cible',griffes:'Griffes'};
const CUS3PRICE=400;
function cus3P(){const p=GX('pilot',{});if(p.helm==null)Object.assign(p,{suit:null,acc:null,visor:null,helm:0,badge:'none'});return p}
function cus3S(){const p=GX('cpaint',{});if(p.on==null)Object.assign(p,{on:0,unl:0,hull:null,wing:null,acc:null,eng:null,dec:'none'});return p}
// ----- codes compacts pour la présence multijoueur -----
const h6=v=>v==null?'':(v>>>0).toString(16).padStart(6,'0').slice(-6);const p6=s=>/^[0-9a-f]{6}$/.test(s||'')?parseInt(s,16):null;
function cus3EncP(){const p=cus3P();return [h6(p.suit),h6(p.acc),h6(p.visor),p.helm|0,p.badge||'none',p.body|0,p.face|0,h6(p.skin),p.hs==null?'':p.hs,h6(p.hair),p.beard|0].join(',')}
function cus3DecP(s){const a=String(s||'').split(',');return{suit:p6(a[0]),acc:p6(a[1]),visor:p6(a[2]),helm:clamp(a[3]|0,0,2),badge:CUS3BADGE[a[4]]?a[4]:'none',body:clamp(a[5]|0,0,1),face:clamp(a[6]|0,0,7),skin:p6(a[7]),hs:a[8]==null||a[8]===''?null:clamp(a[8]|0,0,6),hair:p6(a[9]),beard:clamp(a[10]|0,0,2)}}
function cus3EncS(){const p=cus3S();if(!p.on)return '';return [h6(p.hull),h6(p.wing),h6(p.acc),h6(p.eng),p.dec||'none'].join(',')}
function cus3DecS(s){if(!s)return{on:0};const a=String(s).split(',');return{on:1,hull:p6(a[0]),wing:p6(a[1]),acc:p6(a[2]),eng:p6(a[3]),dec:CUS3DEC[a[4]]?a[4]:'none'}}
// ----- pilote : options de buildHuman -----
function pilotOpts(o,code,keepHelm){const P=code!=null?cus3DecP(code):cus3P(),r=Object.assign({},o);if(P.suit!=null)r.suit=P.suit;if(P.acc!=null)r.acc=P.acc;if(P.visor!=null)r.visor=P.visor;
if(!keepHelm){if(P.helm==1){r.helmet=true;r.closed=true}else if(P.helm==2){r.helmet=false}else{r.helmet=true;r.closed=false}}r.badge=P.badge||'none';
// silhouette et visage du pilote (toujours les mêmes d'une partie à l'autre)
r.fem=P.body==1;r.seed='pilot'+(P.face|0)+(r.fem?'f':'m');r.skin=P.skin!=null?P.skin:0xe0b090;r.hair=P.hair!=null?P.hair:0x2a1810;r.hs=P.hs!=null?P.hs:(r.fem?4:0);r.beard=r.fem?0:(P.beard|0);return r}
function cus3Badge(k){if(CUS3.tex['b'+k])return CUS3.tex['b'+k];const c=mkC(128,128),g=c.getContext('2d');g.translate(64,64);
const col={alliance:'#4aa0ff',guilde:'#ffb040',pirates:'#ff3a2a',front:'#c0c8d0',etoile:'#ffd34a',crane:'#e8e8e8',foudre:'#6ff0ff'}[k]||'#fff';
g.fillStyle='#10161e';g.beginPath();g.moveTo(0,-58);g.lineTo(52,-34);g.lineTo(46,30);g.lineTo(0,60);g.lineTo(-46,30);g.lineTo(-52,-34);g.closePath();g.fill();g.lineWidth=7;g.strokeStyle=col;g.stroke();g.fillStyle=col;
cus3Glyph(g,k=='alliance'?'etoile':k=='guilde'?'engrenage':k=='pirates'?'crane':k=='front'?'cible':k,34);const t=new THREE.CanvasTexture(c);t.anisotropy=4;return CUS3.tex['b'+k]=t}
// petits dessins vectoriels (écussons et autocollants)
function cus3Glyph(g,k,R){g.save();if(k=='etoile'){g.beginPath();for(let i=0;i<10;i++){const a=i/10*TAU-Math.PI/2,r=i%2?R*.42:R;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill()}
else if(k=='crane'){g.beginPath();g.arc(0,-R*.15,R*.62,0,TAU);g.fill();g.fillRect(-R*.36,R*.2,R*.72,R*.42);g.globalCompositeOperation='destination-out';for(const s of[-1,1]){g.beginPath();g.ellipse(s*R*.25,-R*.15,R*.17,R*.2,0,0,TAU);g.fill()}g.beginPath();g.moveTo(0,R*.05);g.lineTo(-R*.08,R*.2);g.lineTo(R*.08,R*.2);g.closePath();g.fill();for(let i=-1;i<=1;i++)g.fillRect(i*R*.2-R*.03,R*.38,R*.06,R*.24);g.globalCompositeOperation='source-over'}
else if(k=='ailes'){for(const s of[-1,1]){g.beginPath();g.moveTo(s*R*.12,0);for(let i=0;i<4;i++){g.quadraticCurveTo(s*R*(.35+i*.18),-R*(.55-i*.08),s*R*(.45+i*.17),-R*(.12-i*.13))}g.lineTo(s*R*.12,R*.18);g.closePath();g.fill()}g.beginPath();g.arc(0,0,R*.16,0,TAU);g.fill()}
else if(k=='eclair'||k=='foudre'){g.beginPath();g.moveTo(R*.2,-R);g.lineTo(-R*.45,R*.08);g.lineTo(-R*.02,R*.08);g.lineTo(-R*.25,R);g.lineTo(R*.48,-R*.15);g.lineTo(R*.05,-R*.15);g.closePath();g.fill()}
else if(k=='flamme'){g.beginPath();g.moveTo(0,R);g.bezierCurveTo(-R*.9,R*.5,-R*.5,-R*.2,-R*.1,-R);g.bezierCurveTo(-R*.05,-R*.35,R*.35,-R*.4,R*.25,-R*.75);g.bezierCurveTo(R*.85,-R*.1,R*.75,R*.6,0,R);g.fill();g.globalCompositeOperation='destination-out';g.beginPath();g.moveTo(0,R*.75);g.bezierCurveTo(-R*.35,R*.45,-R*.2,0,0,-R*.25);g.bezierCurveTo(R*.3,R*.15,R*.3,R*.5,0,R*.75);g.fill();g.globalCompositeOperation='source-over'}
else if(k=='cible'){g.lineWidth=R*.14;g.strokeStyle=g.fillStyle;for(const r of[.85,.5]){g.beginPath();g.arc(0,0,R*r,0,TAU);g.stroke()}g.beginPath();g.arc(0,0,R*.16,0,TAU);g.fill();g.fillRect(-R,-R*.05,R*.35,R*.1);g.fillRect(R*.65,-R*.05,R*.35,R*.1);g.fillRect(-R*.05,-R,R*.1,R*.35);g.fillRect(-R*.05,R*.65,R*.1,R*.35)}
else if(k=='griffes'){g.lineCap='round';g.lineWidth=R*.16;g.strokeStyle=g.fillStyle;for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(i*R*.38+R*.25,-R*.85);g.quadraticCurveTo(i*R*.38+R*.1,0,i*R*.38-R*.25,R*.85);g.stroke()}}
else if(k=='engrenage'){g.beginPath();for(let i=0;i<16;i++){const a=i/16*TAU,r=i%2?R*.7:R*.92;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);g.lineTo(Math.cos(a+TAU/32)*r,Math.sin(a+TAU/32)*r)}g.closePath();g.fill();g.globalCompositeOperation='destination-out';g.beginPath();g.arc(0,0,R*.32,0,TAU);g.fill();g.globalCompositeOperation='source-over'}
g.restore()}
// écusson sur l'épaule gauche (remplace le petit patch)
{const _bh=buildHuman;buildHuman=function(o={}){const g=_bh(o);try{if(o.badge&&o.badge!='none'){const tx=cus3Badge(o.badge);g.traverse(m=>{if(m.isMesh&&m.material&&m.material.map===PATCHT){m.material=new THREE.MeshBasicMaterial({map:tx,transparent:true});m.scale.setScalar(1.35)}})}}catch(e){console.warn(e)}return g}}
// ----- vaisseau : couleurs, réacteurs, autocollants -----
function cus3Decal(k,col){const key='d'+k+col;if(CUS3.tex[key])return CUS3.tex[key];const c=mkC(256,256),g=c.getContext('2d');g.translate(128,128);g.shadowColor='rgba(0,0,0,.85)';g.shadowBlur=10;g.fillStyle='#'+new THREE.Color(col).getHexString();cus3Glyph(g,k,100);
const t=new THREE.CanvasTexture(c);t.anisotropy=4;return CUS3.tex[key]=t}
const _c3r=new THREE.Raycaster();
function cus3Ship(root,P,pil){const ud=root.userData;if(!ud)return;
if(pil&&ud.pilot&&ud.pilot.children.length>=3){const[hm,vz,sh]=ud.pilot.children;if(pil.suit!=null)hm.material.color.setHex(pil.suit);if(pil.visor!=null)vz.material.color.setHex(pil.visor);if(pil.acc!=null)sh.material.color.setHex(pil.acc)}
if(!P||!P.on)return;const set=(m,c,k)=>{if(!m||c==null)return;m.color.setHex(c);if(m.emissive)m.emissive.setHex(c).multiplyScalar(k)};
const seen=new Set();root.traverse(o=>{if(!o.isMesh||!o.material||seen.has(o.material))return;const m=o.material;seen.add(m);if(m.name=='hull')set(m,P.hull,1);else if(m.name=='wing')set(m,P.wing,1);else if(m.name=='accent')set(m,P.acc,.35)});
if(P.eng!=null&&ud.flames){for(const f of ud.flames){if(f.fl&&f.fl.material){f.fl.material=f.fl.material.clone();f.fl.material.color.set(new THREE.Color(P.eng).multiplyScalar(DESK?1.6:1))}if(f.gs&&f.gs.material){f.gs.material=f.gs.material.clone();f.gs.material.color.setHex(P.eng)}}ud.eC=P.eng}
// autocollants des deux côtés du fuselage, posés à la surface (lancer de rayon)
if(P.dec&&P.dec!='none'&&ud.body){root.updateMatrixWorld(true);const hulls=[];ud.body.traverse(o=>{if(o.isMesh&&o.material&&o.material.name=='hull')hulls.push(o)});if(!hulls.length)return;
const bb=new THREE.Box3();for(const h of hulls)bb.expandByObject(h);const L=bb.max.z-bb.min.z,tx=cus3Decal(P.dec,P.acc!=null?P.acc:0xffffff),mat=new THREE.MeshStandardMaterial({map:tx,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,metalness:.3,roughness:.5});
for(const s of[-1,1]){const z=bb.min.z+L*.6,y=(bb.min.y+bb.max.y)*.5+.1,o=new V3(s*(bb.max.x+6),y,z);_c3r.set(o,new V3(-s,0,0));const hit=_c3r.intersectObjects(hulls,false)[0];if(!hit)continue;
const n=hit.face?hit.face.normal.clone().transformDirection(hit.object.matrixWorld):new V3(s,0,0);const p=hit.point.clone().addScaledVector(n,.03),m=new THREE.Mesh(new THREE.PlaneGeometry(1.7,1.7),mat);ud.body.worldToLocal(p);m.position.copy(p);
const nl=n.clone().transformDirection(new THREE.Matrix4().copy(ud.body.matrixWorld).invert());m.lookAt(p.clone().add(nl));if(s<0)m.rotateZ(0);m.userData.cus3=1;ud.body.add(m)}}}
{const _bs=buildShip;buildShip=function(P,l){const r=_bs(P,l);try{const o=window.CUS3O;if(o!=null)cus3Ship(r,cus3DecS(o),null);else cus3Ship(r,cus3S(),cus3P())}catch(e){console.warn(e)}return r}}
{const _tc=tr3Col;tr3Col=function(){const p=cus3S();return p.on&&p.eng!=null?p.eng:_tc()}}
// ----- présence multijoueur -----
{const _mo=mpExtraOut;mpExtraOut=function(){const o=_mo();o.pl3=cus3EncP();const s=cus3EncS();if(s)o.pt3=s;return o}}
// ----- appliquer les changements au vaisseau et au pilote en jeu -----
function cus3Apply(){try{if(!S.dead&&mode!='int'&&typeof rebuildShip=='function')rebuildShip()}catch(e){console.warn(e)}
try{const mk=(o,keep)=>buildHuman(pilotOpts(o,null,keep));if(FOOT.model){const old=FOOT.model,par=old.parent,nm=mk({acc:0xff8a2a,tool:true,skin:0xe0b090,closed:false});nm.position.copy(old.position);nm.rotation.copy(old.rotation);nm.visible=old.visible;if(par){par.add(nm);par.remove(old)}FOOT.model=nm}
if(typeof DER!='undefined'&&DER.model&&mode!='int'){if(DER.model.parent)DER.model.parent.remove(DER.model);DER.model=null}}catch(e){console.warn(e)}try{mpSend&&mpSend(true)}catch(e){}}
// ----- panneau -----
function cus3Sw(k,list,cur,auto){return `<div class="c3sw">${auto?`<button data-c3="${k}:auto" class="${cur==null?'on':''} c3a">Auto</button>`:''}${list.map(c=>`<button data-c3="${k}:${c}" class="${cur===c?'on':''}" style="--c:#${h6(c)}"></button>`).join('')}</div>`}
function cus3Chips(k,o,cur){return `<div class="c3ch">${Object.entries(o).map(([v,n])=>`<button data-c3="${k}:${v}" class="${cur==v?'on':''}">${n}</button>`).join('')}</div>`}
function cus3Render(){const el=$('cus3');if(!el)return;const P=cus3P(),Sx=cus3S();let h=`<div class="phead"><b>${ICO('user')} Personnalisation</b><button data-c3="x:0">${ICO('close')}</button></div><div class="c3tab"><button data-c3="tab:pil" class="${CUS3.tab=='pil'?'on':''}">Pilote</button><button data-c3="tab:shp" class="${CUS3.tab=='shp'?'on':''}">Vaisseau</button></div>`;
if(CUS3.tab=='pil'){h+=`<div class="psec"><b class="pt">Silhouette</b>${cus3Chips('body',{0:'Homme',1:'Femme'},String(P.body|0))}</div><div class="psec"><b class="pt">Visage</b>${cus3Chips('face',{0:'1',1:'2',2:'3',3:'4',4:'5',5:'6',6:'7',7:'8'},String(P.face|0))}</div><div class="psec"><b class="pt">Peau</b>${cus3Sw('skin',CUS3SKIN,P.skin==null?0xe0b090:P.skin,0)}</div><div class="psec"><b class="pt">Coiffure</b>${cus3Chips('hs',CUS3HS,String(P.hs!=null?P.hs:(P.body==1?4:0)))}</div><div class="psec"><b class="pt">Cheveux</b>${cus3Sw('hair',CUS3HAIR,P.hair==null?0x2a1810:P.hair,0)}</div>${P.body==1?'':`<div class="psec"><b class="pt">Barbe</b>${cus3Chips('beard',CUS3BEARD,String(P.beard|0))}</div>`}<small class="dimt">Le visage se voit à travers un casque ouvert ou sans casque.</small><div class="psec"><b class="pt">Combinaison</b>${cus3Sw('suit',CUS3COL,P.suit,1)}</div><div class="psec"><b class="pt">Accents</b>${cus3Sw('acc',CUS3COL,P.acc,1)}</div><div class="psec"><b class="pt">Visière</b>${cus3Sw('visor',CUS3VIS,P.visor,1)}</div>
<div class="psec"><b class="pt">Casque</b>${cus3Chips('helm',{0:CUS3HELM[0],1:CUS3HELM[1],2:CUS3HELM[2]},String(P.helm|0))}</div><div class="psec"><b class="pt">Écusson (épaule)</b>${cus3Chips('badge',CUS3BADGE,P.badge)}</div><small class="dimt">Les autres pilotes voient ton apparence quand tu marches à côté d'eux.</small>`}
else{if(!Sx.unl)h+=`<div class="psec"><b class="pt">Atelier de peinture</b><small>Choisis toi-même chaque couleur de ton vaisseau, la couleur des réacteurs et un autocollant. Déblocage unique : ${fmt(CUS3PRICE)} ¢.</small><button class="hot" data-c3="unl:1">Débloquer (${fmt(CUS3PRICE)} ¢)</button></div>`;
else{h+=`<div class="orow"><span>Peinture libre</span><button data-c3="on:${Sx.on?0:1}" class="${Sx.on?'on':''}">${Sx.on?'Activée':'Désactivée'}</button></div>`;
if(Sx.on)h+=`<div class="psec"><b class="pt">Coque</b>${cus3Sw('hull',CUS3COL,Sx.hull,1)}</div><div class="psec"><b class="pt">Ailes</b>${cus3Sw('wing',CUS3COL,Sx.wing,1)}</div><div class="psec"><b class="pt">Accents et autocollant</b>${cus3Sw('sacc',CUS3COL,Sx.acc,1)}</div><div class="psec"><b class="pt">Réacteurs et traînée</b>${cus3Sw('eng',CUS3ENG,Sx.eng,1)}</div><div class="psec"><b class="pt">Autocollant</b>${cus3Chips('dec',CUS3DEC,Sx.dec)}</div>`;
else h+=`<small class="dimt">Désactivée : ton vaisseau garde la peinture choisie à l'Atelier.</small>`}}
el.innerHTML=h}
function cus3Toggle(v){CUS3.open=v==null?!CUS3.open:v;const el=$('cus3');if(!el)return;el.style.display=CUS3.open?'flex':'none';document.body.classList.toggle('cus3',CUS3.open);
if(CUS3.open){try{if(PROF.open)profToggle(false)}catch(e){}window.XPAUSE=(window.XPAUSE||0)+1;CUS3.dirty=true;cus3Render()}else{window.XPAUSE=Math.max(0,(window.XPAUSE||1)-1);cus3Free();cus3Apply()}}
{const d=document.createElement('div');d.id='cus3';document.body.appendChild(d);d.addEventListener('click',e=>{const b=e.target.closest('[data-c3]');if(!b)return;const[k,v]=b.dataset.c3.split(':');const P=cus3P(),Sx=cus3S(),col=v=='auto'?null:+v;
if(k=='x')return cus3Toggle(false);if(k=='tab')CUS3.tab=v;else if(k=='suit')P.suit=col;else if(k=='acc')P.acc=col;else if(k=='visor')P.visor=col;if(['body','face','skin','hs','hair','beard','helm'].includes(k))CUS3.fz=5;else if(k=='helm')P.helm=+v;else if(k=='badge')P.badge=v;else if(k=='body')P.body=+v;else if(k=='face')P.face=+v;else if(k=='skin')P.skin=col;else if(k=='hs')P.hs=+v;else if(k=='hair')P.hair=col;else if(k=='beard')P.beard=+v;
else if(k=='unl'){if(G.cr<CUS3PRICE){toast('💰 Il te faut '+fmt(CUS3PRICE)+' ¢');return}G.cr-=CUS3PRICE;Sx.unl=1;Sx.on=1;try{SFX.buy()}catch(x){}toast('🎨 Atelier de peinture débloqué !')}
else if(k=='on')Sx.on=+v;else if(k=='hull')Sx.hull=col;else if(k=='wing')Sx.wing=col;else if(k=='sacc')Sx.acc=col;else if(k=='eng')Sx.eng=col;else if(k=='dec')Sx.dec=v;
try{SFX.tick()}catch(x){}CUS3.dirty=true;cus3Render();try{save()}catch(x){}})}
// ----- aperçu 3D (studio) -----
function cus3Build(){const sc=new THREE.Scene();sc.background=new THREE.Color(0x070b12);if(scene.environment)sc.environment=scene.environment;CUS3.sc=sc;CUS3.cam=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.1,500);
sc.add(new THREE.HemisphereLight(0xcfe0ff,0x2a2230,.75));const k=new THREE.DirectionalLight(0xfff2e0,1.3);k.position.set(5,8,6);sc.add(k);const r=new THREE.DirectionalLight(0x6fb0ff,.7);r.position.set(-6,3,-5);sc.add(r);
const fl=new THREE.Mesh(new THREE.CircleGeometry(16,64),new THREE.MeshStandardMaterial({color:0x151b24,metalness:.25,roughness:.8}));fl.rotation.x=-Math.PI/2;sc.add(fl);const rg=new THREE.Mesh(new THREE.RingGeometry(15.6,16,64),new THREE.MeshBasicMaterial({color:0x2fa7d8}));rg.rotation.x=-Math.PI/2;rg.position.y=.01;sc.add(rg);CUS3.dirty=true}
function cus3Disp(root){const keep=new Set([...Object.values(typeof RB3C!='undefined'?RB3C:{}),...Object.values(typeof CHG!='undefined'?CHG:{})]);root.traverse(o=>{if(o.geometry&&!keep.has(o.geometry))try{o.geometry.dispose()}catch(e){}})}
function cus3Free(){if(!CUS3.sc)return;cus3Disp(CUS3.sc);CUS3.sc=null;CUS3.pil=null;CUS3.ship=null}
function cus3Refresh(){const sc=CUS3.sc;if(CUS3.pil){sc.remove(CUS3.pil);cus3Disp(CUS3.pil)}if(CUS3.ship){sc.remove(CUS3.ship);cus3Disp(CUS3.ship)}
const p=buildHuman(pilotOpts({acc:0xff8a2a,tool:true,skin:0xe0b090,closed:false}));const por=innerWidth<innerHeight;p.scale.setScalar(2.6);if(por)p.position.set(-3.3,0,3.5);else p.position.set(-5.2,0,1.5);sc.add(p);CUS3.pil=p;
const s=buildShip();s.scale.setScalar(.62);s.position.set(por?2.4:3.2,2.2,por?-2.5:0);s.userData.y0=por?3:2.2;if(typeof an3Gear=='function'){an3Gear(s,1)}if(s.userData.shield)s.userData.shield.visible=false;sc.add(s);CUS3.ship=s;CUS3.dirty=false}
{const _rfC=renderFrame;renderFrame=function(){if(CUS3.open){if(!CUS3.sc)cus3Build();const por0=innerWidth<innerHeight;if(CUS3.por!==por0){CUS3.por=por0;CUS3.dirty=true}if(CUS3.dirty)cus3Refresh();const dt=DT||.016,t3=(CUS3.t+=dt),cam=CUS3.cam,W=innerWidth,H=innerHeight,por=W<H;
if(Math.abs(cam.aspect-W/H)>.001){cam.aspect=W/H;cam.updateProjectionMatrix()}if(por)cam.setViewOffset(W,H,0,H*.26,W,H);else cam.setViewOffset(W,H,W*.15,0,W,H);
const R=por?46:24;cam.position.set(Math.sin(.35+Math.sin(t3*.2)*.15)*R,5.5,Math.cos(.35+Math.sin(t3*.2)*.15)*R);cam.lookAt(por?-.3:-.6,por?3.3:2.6,0);
// gros plan sur le visage quand on change la tête du pilote
CUS3.fz=(CUS3.fz||0)-dt;CUS3.fzk=(CUS3.fzk||0)+((CUS3.fz>0?1:0)-(CUS3.fzk||0))*Math.min(1,dt*3);if(CUS3.fzk>.01&&CUS3.pil&&CUS3.pil.userData.head){const hp=new V3();CUS3.pil.userData.head.getWorldPosition(hp);hp.y+=.2;const f=CUS3.fzk*CUS3.fzk*(3-2*CUS3.fzk);cam.position.lerp(new V3(hp.x+.5,hp.y+.25,hp.z+(por?3.6:2.6)),f);const tg=new V3(por?-.3:-.6,por?3.3:2.6,0).lerp(hp,f);cam.lookAt(tg)}
if(CUS3.pil){CUS3.pil.rotation.y=Math.PI+Math.sin(t3*.5)*.6+.3;try{animHuman(CUS3.pil,t3*2,0,false,false,0,null)}catch(e){}}if(CUS3.ship){CUS3.ship.rotation.y=t3*.35;CUS3.ship.position.y=(CUS3.ship.userData.y0||2.2)+Math.sin(t3*1.2)*.1;const ud=CUS3.ship.userData;if(ud.flames)for(const f of ud.flames){if(f.fl)f.fl.scale.set(1,1,.6+Math.random()*.2)}}
if(typeof GRP!='undefined'&&GRP)GRP.uniforms.str.value=0;if(composer&&bloomOn){rpass.scene=CUS3.sc;rpass.camera=cam;composer.render();rpass.camera=camera}else R3.render(CUS3.sc,cam);cam.clearViewOffset();return}_rfC()}}
{const _ov=overlay;overlay=function(){if(CUS3.open){OX.clearRect(0,0,innerWidth,innerHeight);return}_ov()}}
// ----- accès : bouton dans le profil et service des stations -----
{const _pr=profRender;profRender=function(){_pr();const el=$('prof');if(!el)return;const d=document.createElement('div');d.className='psec';d.innerHTML=`<button class="hot" id="cus3b">${ICO('user')} Personnaliser le pilote et le vaisseau</button>`;const h=el.querySelector('.phead');if(h&&h.nextSibling)el.insertBefore(d,h.nextSibling);else el.appendChild(d);$('cus3b').onclick=()=>cus3Toggle(true)}}
svcAdd({o:8,ic:'user',t:'Personnalisation',show:st=>true,html:st=>SROW(`<div><b>Pilote et peinture</b><small>Combinaison, casque, écusson ; couleurs du vaisseau, réacteurs et autocollants.</small></div>`,`<button class="hot" data-sv="cus3">Ouvrir</button>`)});SVC.act.cus3=()=>cus3Toggle(true);
addEventListener('keydown',e=>{if(e.code=='Escape'&&CUS3.open)cus3Toggle(false)});
