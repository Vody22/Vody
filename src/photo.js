// ===== MODE PHOTO : pause, caméra libre autour du vaisseau, filtres, flou, cadres, enregistrement de l'image =====
const PH={on:false,yaw:0,pitch:.2,dist:30,fov:60,roll:0,anc:new V3(),f:'none',b:'none',fr:'none',hide:false,drag:null,pinch:null,shots:0};
const PHF={none:{n:'Aucun',ops:[]},cine:{n:'Cinéma',ops:[['contrast',1.15],['saturate',1.15],['sepia',.18],['hue-rotate',-10]],vig:.45},nb:{n:'Noir & blanc',ops:[['grayscale',1],['contrast',1.25],['brightness',1.05]],vig:.35},
retro:{n:'Rétro',ops:[['sepia',.6],['contrast',.92],['brightness',1.06],['saturate',.85]],vig:.5,grain:16},neon:{n:'Néon',ops:[['saturate',1.8],['contrast',1.12],['hue-rotate',14]]},
glace:{n:'Glacial',ops:[['saturate',.7],['hue-rotate',-25],['brightness',1.08],['contrast',1.05]]},reve:{n:'Rêve',ops:[['brightness',1.08],['saturate',1.2],['contrast',.9]],glow:.45,vig:.25}};
const PHB={none:'Aucun',dof:'Profondeur',edge:'Bords',mini:'Miniature'},PHR={none:'Aucun',cine:'Cinéma',pola:'Polaroïd',sign:'Signature'};
// matrice de couleur équivalente aux filtres CSS (même rendu à l'écran et sur la photo)
function phMat(ops){let M=[1,0,0,0,0,1,0,0,0,0,1,0];const mul=(A)=>{const R=[];for(let r=0;r<3;r++){for(let c=0;c<3;c++)R[r*4+c]=A[r*4]*M[c]+A[r*4+1]*M[4+c]+A[r*4+2]*M[8+c];R[r*4+3]=A[r*4]*M[3]+A[r*4+1]*M[7]+A[r*4+2]*M[11]+A[r*4+3]}M=R};
for(const[k,a]of ops){let A;if(k=='grayscale'||k=='sepia'||k=='saturate'){const s=k=='saturate'?a:1-a;A=k=='sepia'?[.393+.607*s,.769-.769*s,.189-.189*s,0,.349-.349*s,.686+.314*s,.168-.168*s,0,.272-.272*s,.534-.534*s,.131+.869*s,0]:[.2126+.7874*s,.7152-.7152*s,.0722-.0722*s,0,.2126-.2126*s,.7152+.2848*s,.0722-.0722*s,0,.2126-.2126*s,.7152-.7152*s,.0722+.9278*s,0];if(k=='saturate')A=[.213+.787*s,.715-.715*s,.072-.072*s,0,.213-.213*s,.715+.285*s,.072-.072*s,0,.213-.213*s,.715-.715*s,.072+.928*s,0]}
else if(k=='hue-rotate'){const r=a*Math.PI/180,c=Math.cos(r),s=Math.sin(r);A=[.213+c*.787-s*.213,.715-c*.715-s*.715,.072-c*.072+s*.928,0,.213-c*.213+s*.143,.715+c*.285+s*.14,.072-c*.072-s*.283,0,.213-c*.213-s*.787,.715-c*.715+s*.715,.072+c*.928+s*.072,0]}
else if(k=='brightness')A=[a,0,0,0,0,a,0,0,0,0,a,0];else if(k=='contrast'){const o=(.5-.5*a)*255;A=[a,0,0,o,0,a,0,o,0,0,a,o]}if(A)mul(A)}return M}
const phCss=ops=>ops.map(([k,a])=>`${k}(${k=='hue-rotate'?a+'deg':a})`).join(' ');
function phUI(){if($('phui'))return;const d=document.createElement('div');d.id='phui';
const chips=(id,o,cur)=>`<div class="phrow"><span>${id=='f'?'Filtre':id=='b'?'Flou':'Cadre'}</span><div class="phch">${Object.entries(o).map(([k,v])=>`<button data-ph="${id}:${k}" class="${k==cur?'on':''}">${typeof v=='string'?v:v.n}</button>`).join('')}</div></div>`;
d.innerHTML=`<div id="phview"></div><div id="phblur"></div><div id="phframe"></div><div id="phflash"></div>
<div id="phtop"><button data-ph="x:0">✕ Quitter</button><b>MODE PHOTO</b><button data-ph="h:0" id="phhide">Vaisseau : visible</button></div>
<div id="phhint">Glisse pour tourner autour · pince ou molette pour rapprocher</div>
<div id="phbot"><div id="phopts">${chips('f',PHF,PH.f)}${chips('b',PHB,PH.b)}${chips('fr',PHR,PH.fr)}
<div class="phrow"><span>Zoom</span><input type="range" id="phzoom" min="18" max="95" value="60"><span>Roulis</span><input type="range" id="phroll" min="-35" max="35" value="0"></div></div>
<button id="phshot" data-ph="s:0" aria-label="Prendre la photo"></button></div>
<div id="phres"><img id="phimg" alt="Ta photo"><p>Sur iPhone : appuie longuement sur la photo puis « Ajouter à Photos », ou utilise Partager.</p><div><button data-ph="sh:0" id="phshare">Partager / Enregistrer</button><a id="phdl" download="starfarer.jpg">Télécharger</a><button data-ph="r:0">Reprendre</button><button data-ph="x:0">Quitter</button></div></div>`;
document.body.appendChild(d);
d.addEventListener('click',e=>{const b=e.target.closest('[data-ph]');if(!b)return;const[k,v]=b.dataset.ph.split(':');
if(k=='x')photoToggle(false);else if(k=='h'){PH.hide=!PH.hide;ship.visible=!PH.hide;$('phhide').textContent='Vaisseau : '+(PH.hide?'caché':'visible')}
else if(k=='f'||k=='b'||k=='fr'){PH[k]=v;b.parentNode.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));phApply()}
else if(k=='s')phShoot();else if(k=='r'){$('phres').classList.remove('on')}else if(k=='sh')phShare()});
$('phzoom').oninput=e=>{PH.fov=+e.target.value};$('phroll').oninput=e=>{PH.roll=+e.target.value*Math.PI/180};
const v=$('phview');v.addEventListener('pointerdown',e=>{v.setPointerCapture(e.pointerId);PH.pts=PH.pts||{};PH.pts[e.pointerId]={x:e.clientX,y:e.clientY}});
v.addEventListener('pointermove',e=>{const P=PH.pts&&PH.pts[e.pointerId];if(!P)return;const ids=Object.keys(PH.pts);if(ids.length>=2){const[a,b]=ids.map(i=>PH.pts[i]),d0=Math.hypot(a.x-b.x,a.y-b.y);P.x=e.clientX;P.y=e.clientY;const d1=Math.hypot(a.x-b.x,a.y-b.y);if(d0>0)PH.dist=clamp(PH.dist*d0/d1,4,400);return}
PH.yaw-=(e.clientX-P.x)*.008;PH.pitch=clamp(PH.pitch+(e.clientY-P.y)*.006,-1.45,1.45);P.x=e.clientX;P.y=e.clientY});
const up=e=>{if(PH.pts)delete PH.pts[e.pointerId]};v.addEventListener('pointerup',up);v.addEventListener('pointercancel',up);
v.addEventListener('wheel',e=>{e.preventDefault();PH.dist=clamp(PH.dist*(1+Math.sign(e.deltaY)*.1),4,400)},{passive:false})}
function phApply(){phUI();const F=PHF[PH.f];$('c').style.filter=F.ops.length?phCss(F.ops)+(F.glow?' blur(0px)':''):'';const bl=$('phblur');bl.className=PH.b=='dof'&&!(composer&&bloomOn)?'edge':PH.b;const fr=$('phframe');fr.className=PH.fr;
fr.innerHTML=PH.fr=='pola'?`<i>${phCaption()}</i>`:PH.fr=='sign'?`<i><b>STARFARER 3D</b> ${phCaption()}</i>`:'';fr.style.setProperty('--vig',F.vig||0)}
function phPlace(){if(mode=='space')return S.docked&&S.docked.n?S.docked.n:(()=>{let best=null,bd=1e18;for(const p of planets){const d=Math.hypot(p.x-S.pos.x,p.y-S.pos.y,p.z-S.pos.z)-p.r;if(d<bd){bd=d;best=p}}return best&&bd<6000?'près de '+best.name:'espace profond'})();if(mode=='surf'){const p=typeof GR!='undefined'&&GR&&GR.F?GR.F.p:null;return p&&p.name?p.name:'surface'}return 'épave'}
function phCaption(){let lv=1;try{lv=lvInfo().L||lv}catch(e){}const d=new Date();return `${phPlace()} · Niv. ${lv} · ${d.toLocaleDateString('fr-FR')}`}
function phAnchor(){if(mode=='surf'&&FOOT.on)return FOOT.model?FOOT.model.position:FOOT.pos;if(mode=='int')return camera.position.clone().add(new V3(0,0,-6).applyQuaternion(camera.quaternion));return ship.position}
function photoToggle(on){on=on==null?!PH.on:on;if(on===PH.on)return;if(on&&(S.dead||(typeof MENU3!='undefined'&&MENU3.on)))return;PH.on=on;phUI();document.body.classList.toggle('ph',on);
if(on){try{if(document.pointerLockElement)document.exitPointerLock()}catch(e){}window.XPAUSE=(window.XPAUSE||0)+1;PH.ck=COCKPIT;COCKPIT=false;PH.anc.copy(phAnchor());const o=camera.position.clone().sub(PH.anc);PH.dist=clamp(o.length(),6,200);PH.yaw=Math.atan2(o.x,o.z);PH.pitch=Math.asin(clamp(o.y/Math.max(1e-3,o.length()),-1,1));PH.fov=camera.fov;PH.roll=0;$('phzoom').value=PH.fov;$('phroll').value=0;$('phres').classList.remove('on');phApply();try{SFX.tick()}catch(e){}}
else{window.XPAUSE=Math.max(0,(window.XPAUSE||1)-1);COCKPIT=PH.ck;ship.visible=true;PH.hide=false;$('phhide').textContent='Vaisseau : visible';$('c').style.filter='';camera.up.set(0,1,0)}}
function phCam(){const a=PH.anc,cp=Math.cos(PH.pitch);camera.position.set(a.x+Math.sin(PH.yaw)*cp*PH.dist,a.y+Math.sin(PH.pitch)*PH.dist,a.z+Math.cos(PH.yaw)*cp*PH.dist);
if(mode=='surf'){const gy=Math.max(0,SURF.height(camera.position.x,camera.position.z))+1.2;if(camera.position.y<gy)camera.position.y=gy}
const fw=new V3().subVectors(a,camera.position).normalize();camera.up.set(0,1,0).applyAxisAngle(fw,PH.roll);camera.lookAt(a);if(Math.abs(camera.fov-PH.fov)>.01){camera.fov=PH.fov;camera.updateProjectionMatrix()}if(mode=='space')sky.position.copy(camera.position)}
{const _ucPH=updCam;updCam=function(dt){if(PH.on){phCam();return}_ucPH(dt)}}
// rendu de la photo
function phShoot(){phUI();const fl=$('phflash');fl.classList.remove('go');void fl.offsetWidth;fl.classList.add('go');try{SFX.tick()}catch(e){}
const pr0=R3.getPixelRatio(),pr=Math.min(devicePixelRatio||1,DESK?2:2.6),hi=pr>pr0+.05;let c,W,H,g;
try{if(hi){R3.setPixelRatio(pr);resize()}phCam();TM.value=t;camera.updateMatrixWorld();renderFrame();if(FL3.v>.01&&FL3.sc)fl3Draw(innerWidth,innerHeight)}catch(e){console.warn(e)}
{const src=R3.domElement;W=src.width;H=src.height;c=mkC(W,H);g=c.getContext('2d');g.drawImage(src,0,0)}if(hi){try{R3.setPixelRatio(pr0);resize();phCam()}catch(e){}}
const F=PHF[PH.f];if(F.ops.length||F.grain){const id=g.getImageData(0,0,W,H),d=id.data,M=phMat(F.ops),gr=F.grain||0;for(let i=0;i<d.length;i+=4){const r=d[i],gg=d[i+1],b=d[i+2],n=gr?(Math.random()-.5)*gr:0;d[i]=M[0]*r+M[1]*gg+M[2]*b+M[3]+n;d[i+1]=M[4]*r+M[5]*gg+M[6]*b+M[7]+n;d[i+2]=M[8]*r+M[9]*gg+M[10]*b+M[11]+n}g.putImageData(id,0,0)}
const blurred=()=>{const s=mkC(Math.max(1,W>>3),Math.max(1,H>>3)),sg=s.getContext('2d');sg.imageSmoothingQuality='high';sg.drawImage(c,0,0,s.width,s.height);const b=mkC(W,H),bg=b.getContext('2d');bg.imageSmoothingQuality='high';bg.drawImage(s,0,0,W,H);return b};
if(F.glow){const b=blurred();g.save();g.globalCompositeOperation='screen';g.globalAlpha=F.glow;g.drawImage(b,0,0);g.restore()}
if(PH.b!='none'&&(PH.b!='dof'||!(composer&&bloomOn))){const b=blurred(),bg=b.getContext('2d');bg.globalCompositeOperation='destination-in';let gr;if(PH.b!='mini'){gr=bg.createRadialGradient(W/2,H/2,Math.min(W,H)*.22,W/2,H/2,Math.hypot(W,H)*.55);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,1)')}else{gr=bg.createLinearGradient(0,0,0,H);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(.3,'rgba(0,0,0,0)');gr.addColorStop(.62,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,1)')}bg.fillStyle=gr;bg.fillRect(0,0,W,H);g.drawImage(b,0,0)}
if(F.vig){const v=g.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.hypot(W,H)*.6);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,`rgba(0,0,0,${F.vig})`);g.fillStyle=v;g.fillRect(0,0,W,H)}
let out=c;const u=W/innerWidth;
if(PH.fr=='cine'){const bh=W>H?Math.max(0,(H-W/2.39)/2):H*.1;g.fillStyle='#000';g.fillRect(0,0,W,bh);g.fillRect(0,H-bh,W,bh)}
else if(PH.fr=='pola'){const m=Math.round(Math.min(W,H)*.045),bb=Math.round(Math.min(W,H)*.16);out=mkC(W+m*2,H+m+bb);const o=out.getContext('2d');o.fillStyle='#f6f3ec';o.fillRect(0,0,out.width,out.height);o.drawImage(c,m,m);o.fillStyle='#2a2a30';o.font=`600 ${Math.round(bb*.24)}px 'Chakra Petch',system-ui`;o.textAlign='center';o.fillText('STARFARER 3D',out.width/2,H+m+bb*.42);o.fillStyle='#6a6a72';o.font=`500 ${Math.round(bb*.15)}px 'Chakra Petch',system-ui`;o.fillText(phCaption(),out.width/2,H+m+bb*.7)}
else if(PH.fr=='sign'){const fs=Math.round(15*u);g.save();g.shadowColor='rgba(0,0,0,.8)';g.shadowBlur=6*u;g.fillStyle='#fff';g.font=`700 ${fs*1.4}px 'Chakra Petch',system-ui`;g.fillText('STARFARER 3D',18*u,H-36*u);g.fillStyle='rgba(220,235,255,.9)';g.font=`500 ${fs}px 'Chakra Petch',system-ui`;g.fillText(phCaption(),18*u,H-16*u);g.restore()}
out.toBlob(b=>{if(!b){toast('Photo impossible sur cet appareil');return}PH.blob=b;if(PH.url)URL.revokeObjectURL(PH.url);PH.url=URL.createObjectURL(b);$('phimg').src=PH.url;$('phdl').href=PH.url;$('phshare').style.display=navigator.share?'':'none';$('phres').classList.add('on');PH.shots++;try{const st=GX('st',{});st.photos=(st.photos||0)+1}catch(e){}},'image/jpeg',.92)}
async function phShare(){if(!PH.blob)return;const f=new File([PH.blob],'starfarer-'+Date.now()+'.jpg',{type:'image/jpeg'});try{if(navigator.canShare&&navigator.canShare({files:[f]}))await navigator.share({files:[f],title:'Starfarer 3D'});else if(navigator.share)await navigator.share({title:'Starfarer 3D',text:'Ma photo dans Starfarer 3D'});else $('phdl').click()}catch(e){}}
// pas d'interface de jeu pendant la photo (les reflets du soleil restent)
{const _ovPH=overlay;overlay=function(){if(PH.on){OX.clearRect(0,0,innerWidth,innerHeight);try{lensFlares()}catch(e){}return}_ovPH()}}
addEventListener('keydown',e=>{const tg=e.target&&e.target.tagName;if(tg=='INPUT'||tg=='TEXTAREA'||e.repeat)return;if(e.code=='KeyB')photoToggle();else if(e.code=='Escape'&&PH.on)photoToggle(false)});
{const b=document.createElement('button');b.id='phob';b.className='ic';b.title='Mode photo (B)';b.innerHTML=ICO('cam');b.onclick=()=>photoToggle(true);document.body.appendChild(b)}
TICK.push(()=>{if(PH.on&&(S.dead))photoToggle(false)});
