// ===== ESPACE VIVANT : comètes, brume des nébuleuses quand on les traverse, champs d'astéroïdes de glace et de métal, éclipses =====
Object.assign(CXT.an,{comet:['Comète','Un bloc de glace et de poussière. Traverse sa queue pour récolter des cristaux.'],ice:['Champ de glace','Des astéroïdes gelés. On en tire de l\'eau pure et parfois des cristaux.'],metal:['Champ métallique','Des astéroïdes riches en métaux : plus durs, mais pleins de titane et d\'or.'],eclipse:['Éclipse','Une planète passe devant son étoile : le système plonge dans la pénombre.']});
MINC.water=0xd0f0ff;
const SP2={com:new Map(),mist:[],neb:0,nebC:new THREE.Color(),ecl:0,eclS:null,cr:0};
// ----- champs de glace et de métal -----
const FLDM={ice:new THREE.MeshStandardMaterial({color:0xcfe9ff,roughness:.18,metalness:.1,emissive:0x0a2a40,emissiveIntensity:.5,flatShading:!DESK}),metal:new THREE.MeshStandardMaterial({color:0x6e6a66,roughness:.32,metalness:.95,emissive:0x120804,emissiveIntensity:.4})};
const fldOf=c=>{if(c.ast.length<12||(c.cx==0&&c.cy==0&&c.cz==0))return null;const h=h3(c.cx,c.cy,c.cz,555);return h<.14?'ice':h<.28?'metal':null};
function fldTag(A,k){A.fk=k;A.mesh.material=FLDM[k];if(k=='metal')A.hp*=1.6}
{const _am=astMin;astMin=function(a){if(a.fk&&!a.min){const h=h3(a.id|0,a.v|0,a.r|0,56);a.min=a.fk=='ice'?(h<.62?'water':'cristal'):(h<.5?'titane':h<.8?'or':'fer')}return _am(a)}}
{const _ah=astHit;astHit=function(a,d,p){const n0=asts.length;_ah(a,d,p);if(a.fk)for(let i=n0;i<asts.length;i++){const F=asts[i];if(F.frag&&!F.fk){F.fk=a.fk;F.mesh.material=FLDM[a.fk]}}if(a.fk&&a.gone&&cxAdd('an',a.fk)){G.cr+=60;gainXP(30)}}}
// ----- comètes -----
const COMT=(()=>{const c=mkC(64),g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.25,'rgba(200,235,255,.6)');gr.addColorStop(1,'rgba(150,200,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
function mkComet(c){const H=k=>h3(c.cx,c.cy,c.cz,k),ctr=new V3(c.cx*CS+CS/2,c.cy*CS+CS/2,c.cz*CS+CS/2),g=new THREE.Group();
const nuc=new THREE.Mesh(AGEO[(H(602)*AGEO.length)|0],new THREE.MeshStandardMaterial({color:0xdde8f0,roughness:.6,emissive:0x203040,emissiveIntensity:.6}));nuc.scale.setScalar(16);g.add(nuc);
const coma=fxSprite(COMT,ADDB,0xbfe4ff,.55);coma.scale.setScalar(70);g.add(coma);const tail=[],ion=[];const n=DESK?26:14;
for(let i=0;i<n;i++){const s=fxSprite(i%3?SMOKET:COMT,ADDB,new THREE.Color().setHSL(.56+i*.003,.55,.6),.16*(1-i/n)+.03);g.add(s);tail.push(s)}for(let i=0;i<(DESK?14:8);i++){const s=fxSprite(COMT,ADDB,0x5a9cff,.28*(1-i/14));g.add(s);ion.push(s)}
const dir=new V3(H(603)-.5,(H(604)-.5)*.3,H(605)-.5).normalize();scene.add(g);return{g,nuc,tail,ion,ctr,dir,ph:H(606)*TAU,td:new V3(1,0,0),tdT:0,got:0,c}}
function comPos(C){return C.g.position.copy(C.ctr).addScaledVector(C.dir,Math.sin(t*.004+C.ph)*1400)}
function comUpd(C,dt){comPos(C);C.nuc.rotation.y+=dt*.2;C.nuc.rotation.x+=dt*.07;C.tdT-=dt;if(C.tdT<=0){C.tdT=1;const L=lightFor(C.g.position.x,C.g.position.y,C.g.position.z);C.td.copy(L.dir).negate()}
const len=DESK?900:700;C.tail.forEach((s,i)=>{const k=i/C.tail.length;s.position.copy(C.td).multiplyScalar(30+k*len).add(_c1.set(Math.sin(i*1.7+t*.3)*k*40,Math.cos(i*2.3)*k*30,0));s.scale.setScalar(40+k*300);s.material.rotation=i+t*.05});
const side=_c2.crossVectors(C.td,AY).normalize();C.ion.forEach((s,i)=>{const k=i/C.ion.length;s.position.copy(C.td).multiplyScalar(40+k*len*1.2).addScaledVector(side,k*120);s.scale.setScalar(30+k*90)});
// traverser la queue : poussière de comète (cristaux)
const rel=_c3.copy(S.pos).sub(C.g.position),along=rel.dot(C.td),perp=rel.addScaledVector(C.td,-along).length(),d=S.pos.distanceTo(C.g.position);
if(d<2500&&cxAdd('an','comet')){G.cr+=100;gainXP(40);toast('☄ Comète repérée ! Traverse sa queue pour récolter de la poussière de cristal (+100 ¢)')}
if(along>60&&along<len&&perp<60+along*.25&&C.got<8&&!S.docked){SP2.cr+=dt;if(SP2.cr>1.2){SP2.cr=0;if(cargoUsed()<cap()){C.got++;G.cargo.cristal=(G.cargo.cristal||0)+1;MINQ.cristal=(MINQ.cristal||0)+1;MINT=t;SFX.pick()}}if(Math.random()<dt*20)SPK.emit(S.pos.x+rv(20),S.pos.y+rv(20),S.pos.z+rv(20),rv(30),rv(30),rv(30),.6,.7,.9,1,.5)}}
// ----- chargement des secteurs -----
{const _ls=loadSmall;loadSmall=function(c){_ls(c);try{const k=fldOf(c),E=SMALL.get(c.k);if(k&&E)for(const A of E.list)fldTag(A,k);if(!c.sun&&h3(c.cx,c.cy,c.cz,601)<.025&&!SP2.com.has(c.k))SP2.com.set(c.k,mkComet(c))}catch(e){console.warn(e)}}}
{const _us=unloadSmall;unloadSmall=function(k){const C=SP2.com.get(k);if(C){scene.remove(C.g);C.nuc.material.dispose();C.g.traverse(o=>{if(o.isSprite)o.material.dispose()});SP2.com.delete(k)}_us(k)}}
// au chargement du jeu, les secteurs déjà chargés reçoivent aussi leurs champs et comètes
for(const[k,E]of SMALL){const c=E.c;try{const f=fldOf(c);if(f)for(const A of E.list)fldTag(A,f);if(!c.sun&&h3(c.cx,c.cy,c.cz,601)<.025&&!SP2.com.has(k))SP2.com.set(k,mkComet(c))}catch(e){}}
// ----- brume des nébuleuses : quand on est dedans, des nappes défilent autour du vaisseau -----
for(let i=0;i<(DESK?12:7);i++){const s=fxSprite(SMOKET,THREE.NormalBlending,0xffffff,0);s.visible=false;scene.add(s);SP2.mist.push({s,p:new V3(),l:0})}
function nebDensity(){let best=0;for(const o of DECOS.values())for(const g of o){if(g.userData.spin!=null||g.userData.spin===0)continue;for(const s of g.children){if(!s.isSprite||s.scale.x<400)continue;const d=s.position.distanceTo(S.pos),r=s.scale.x*.42;if(d<r){const k=1-d/r;if(k>best){best=k;SP2.nebC.copy(s.material.color)}}}}return best}
function mistUpd(dt){const on=mode=='space'&&!S.docked;let k=0;if(on){SP2.nT=(SP2.nT||0)-dt;if(SP2.nT<=0){SP2.nT=.4;SP2.nebT=nebDensity()}k=SP2.nebT||0}SP2.neb=lerp(SP2.neb,k,damp(1.5,dt));
fwd();for(const m of SP2.mist){if(SP2.neb<.03){m.s.visible=false;m.l=0;continue}m.l-=dt;if(m.l<=0||m.p.distanceTo(S.pos)>420||_c1.copy(m.p).sub(S.pos).dot(_f)<-60){m.p.copy(S.pos).addScaledVector(_f,180+Math.random()*240).add(_c1.set(rv(220),rv(120),rv(220)));m.l=4+Math.random()*4;m.s.material.rotation=Math.random()*TAU;m.s.scale.setScalar(160+Math.random()*200)}
m.s.position.copy(m.p);m.s.visible=true;m.s.material.color.copy(SP2.nebC).lerp(_cW,.25);const fade=Math.min(1,m.l/1.5,(8-m.l)/1.5);m.s.material.opacity=SP2.neb*.22*clamp(fade,0,1)}
if(SP2.neb>.2&&cxAdd('an','neb')){G.cr+=50;gainXP(25)}}
const _cW=new THREE.Color(0xffffff);
CXT.an.neb=CXT.an.neb||['Nébuleuse','Un nuage de gaz coloré. On peut le traverser, mais on n\'y voit pas grand-chose.'];
// ----- éclipses : une planète devant le soleil assombrit la lumière, une couronne apparaît autour d'elle -----
const ECLT=(()=>{const c=mkC(256),g=c.getContext('2d'),gr=g.createRadialGradient(128,128,0,128,128,128);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.6,'rgba(255,255,255,0)');gr.addColorStop(.665,'rgba(255,255,255,1)');gr.addColorStop(.75,'rgba(255,240,220,.35)');gr.addColorStop(1,'rgba(255,220,180,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);return new THREE.CanvasTexture(c)})();
const ECLS=fxSprite(ECLT,ADDB,0xffffff,0);ECLS.visible=false;scene.add(ECLS);
function eclUpd(dt){let k=0,pl=null,sn=null;if(mode=='space'){const L=lightFor(S.pos.x,S.pos.y,S.pos.z);sn=L.s;if(sn){const ds=_c1.set(sn.x-S.pos.x,sn.y-S.pos.y,sn.z-S.pos.z),dist=ds.length();ds.divideScalar(dist);const as=Math.asin(Math.min(1,sn.r/dist));
for(const p of planets){const oc=_c2.set(p.x-S.pos.x,p.y-S.pos.y,p.z-S.pos.z),b=oc.dot(ds);if(b<0||b>dist)continue;const ol=oc.length(),ap=Math.asin(Math.min(1,p.r/ol)),th=Math.acos(clamp(b/ol,-1,1)),f=clamp((ap+as-th)/(2*as),0,1);if(f>k){k=f;pl=p}}}}
SP2.ecl=lerp(SP2.ecl,k,damp(3,dt));if(SP2.ecl>.01){sunL.intensity*=1-.82*SP2.ecl;amb.intensity*=1-.35*SP2.ecl}
if(pl&&SP2.ecl>.05){ECLS.visible=true;ECLS.position.set(pl.x,pl.y,pl.z);{const D2=Math.max(pl.r*1.05,S.pos.distanceTo(ECLS.position));ECLS.scale.setScalar(pl.r*3*D2/Math.sqrt(D2*D2-pl.r*pl.r*.9))}ECLS.material.color.set(sn.col).lerp(_cW,.5);ECLS.material.opacity=Math.min(1,SP2.ecl*1.2)}else ECLS.visible=false;
if(SP2.ecl>.6&&cxAdd('an','eclipse')){G.cr+=80;gainXP(30);toast('🌑 Éclipse ! La planète masque son étoile (+80 ¢)')}}
STICK.push(dt=>{for(const C of SP2.com.values())comUpd(C,dt);eclUpd(dt)});
TICK.push(dt=>{try{mistUpd(dt)}catch(e){console.warn(e)}});
// les comètes sur le radar
{const _ov=overlay;overlay=function(){_ov();if(mode!='space'||S.dead)return;let b=null,bd=9000;for(const C of SP2.com.values()){const d=C.g.position.distanceTo(S.pos);if(d>1500&&d<bd){bd=d;b=C}}if(b)edgeMarker(b.g.position,'#bfe8ff','Comète','☄')}}
