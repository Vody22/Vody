// ===== MARCHER DANS LA STATION : on descend du vaisseau dans le hangar 3D et on va à pied au bar, au marché, au bureau des missions et chez le mécanicien =====
const WK3={on:false,menu:false,p:new V3(4,0,9),yaw:0,cy:Math.PI*.85,cp:.22,vel:new V3(),ph:0,m:null,built:null,spots:[],near:null,drag:null,col:[],box:{x0:-34,x1:34,z0:-30,z1:46}};
function w3Sign(txt,col){const c=mkC(512,128),g=c.getContext('2d');g.fillStyle='rgba(4,8,14,.9)';g.fillRect(0,0,512,128);g.strokeStyle=col;g.lineWidth=6;g.strokeRect(6,6,500,116);g.shadowColor=col;g.shadowBlur=22;g.fillStyle=col;g.font="700 64px 'Chakra Petch',system-ui";g.textAlign='center';g.textBaseline='middle';g.fillText(txt,256,68);
const t=new THREE.CanvasTexture(c);(H3.tex||(H3.tex=[])).push(t);return t}
// stands au fond du hangar (z≈40) : bar, marché, missions ; mécanicien près du vaisseau
function w3Build(){const sc=H3.sc;if(!sc||WK3.built===sc)return;WK3.built=sc;WK3.spots=[];WK3.col=[];const k=H3.key||'alliance',S0=STY[k]||STY.alliance;
const dk=new THREE.MeshStandardMaterial({color:0x232a33,metalness:.6,roughness:.45}),top=new THREE.MeshStandardMaterial({color:0x9aa6b4,metalness:.7,roughness:.3}),add=(geo,m,x,y,z,ry=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.rotation.y=ry;sc.add(o);return o};
const stand=(x,txt,col,role,suit,act,lab)=>{const z=40;add(RB3(9,1.15,1.6),dk,x,.58,z-3);add(RB3(9.2,.12,1.8),top,x,1.2,z-3);const sg=add(new THREE.PlaneGeometry(7,1.75),new THREE.MeshBasicMaterial({map:w3Sign(txt,col),transparent:true}),x,4.6,z-1.2,Math.PI);
add(RB3(10,5.4,.4),dk,x,2.7,z-.8);const L=sprite(new THREE.Color(col).getHex(),5,.55);L.position.set(x,4.6,z-1.6);sc.add(L);
const n=buildHuman({role,suit,helmet:false,hs:(Math.random()*4|0)});n.position.set(x,0,z-1.7);n.rotation.y=Math.PI;n.userData.noAO=1;sc.add(n);WK3.col.push({x,z:z-3,w:5,d:1.3});WK3.spots.push({x,z:z-4.6,n,act,lab,ph:Math.random()*6});return n};
const bar=stand(-24,'BAR','#ff9a40','merchant',0x3a2a4a,'bar','Parler au barman');
// étagère à bouteilles + tabourets + clients au bar
for(let i=0;i<9;i++){const b=sprite([0x60ff90,0xffb040,0x6fb8ff,0xff6070][i%4],.5,.9);b.position.set(-27.6+i*.7,2.9,39);sc.add(b)}for(let i=0;i<4;i++){add(new THREE.CylinderGeometry(.35,.3,.9,10),dk,-27.5+i*2.3,.45,34.6);WK3.col.push({x:-27.5+i*2.3,z:34.6,w:.4,d:.4})}
for(let i=0;i<2;i++){const c=buildHuman({role:i?'miner':'',suit:i?0x6a7a8a:0xa0603a,helmet:false,hs:i+1});c.position.set(-26.4+i*4.6,0,34.2);c.rotation.y=Math.PI*(i?.85:1.1);sc.add(c);WK3.spots.push({n:c,idle:1,ph:i*2})}
stand(-4,'MARCHÉ','#7fd8ff','merchant',0x6b3fa0,'market','Voir le marché');
stand(16,'MISSIONS','#9fff9f','guard',0x2a3a5a,'missions','Bureau des missions');
// mécanicien près du vaisseau (Atelier) ; le vaisseau (embarquement)
const mc=buildHuman({role:'mechanic',suit:0xf0b040,helmet:false,hs:2});mc.position.set(-9,0,4);mc.rotation.y=Math.PI*.5;sc.add(mc);WK3.spots.push({x:-8,z:4,n:mc,act:'atelier',lab:'Atelier (mécanicien)',ph:1});
WK3.spots.push({x:3.5,z:3,act:'ship',lab:'Remonter dans le vaisseau'});WK3.col.push({x:0,z:0,w:8.5,d:9},{x:9.5,z:5,w:1.6,d:1.6});
// pilote
if(WK3.m&&WK3.m.parent)WK3.m.parent.remove(WK3.m);WK3.m=buildHuman(pilotOpts({acc:0xff8a2a,tool:true,skin:0xe0b090,closed:false}));sc.add(WK3.m)}
function w3Start(){if(!H3.on||!H3.sc||WK3.on)return;w3Build();WK3.on=true;WK3.menu=false;WK3.p.set(4.5,0,10);WK3.yaw=Math.PI;WK3.cy=Math.PI*.9;WK3.cp=.22;WK3.vel.set(0,0,0);WK3.m.visible=true;document.body.classList.add('walk3');document.body.classList.remove('w3menu');
if(H3.ship&&typeof an3Can=='function')an3Can(H3.ship,1);try{SFX.buy()}catch(e){}toast('🚶 Tu marches dans la station — '+(DESK?'ZQSD/WASD pour marcher, glisse pour regarder, E pour parler':'joystick à gauche pour marcher, glisse à droite pour regarder'));w3UI()}
function w3Stop(){if(!WK3.on)return;WK3.on=false;WK3.menu=false;document.body.classList.remove('walk3','w3menu');if(WK3.m)WK3.m.visible=false;if(H3.ship&&typeof an3Can=='function')an3Can(H3.ship,.85);w3UI()}
function w3Act(a){if(a=='ship'){w3Stop();toast('🚀 De retour aux commandes');return}if(a=='atelier'){w3Stop();TAB='atelier';HC.shopV=null;return}
TAB=a=='bar'?'svc':a=='market'?'market':'station';HC.shopV=null;WK3.menu=true;document.body.classList.add('w3menu');stick=null;if(a=='bar'){const L=['« Paraît que des vaisseaux fantômes rôdent près des nébuleuses… »','« Un cuirassé se construit au chantier naval, ça va chauffer. »','« Les pirates ne t\'attaquent que si tu traînes sur leur territoire. Écoute leurs avertissements ! »','« J\'ai vu une baleine spatiale, je te jure ! »','« Les geysers des planètes glacées, ça envoie haut ! »'];toast('🍹 Le barman : '+L[Math.random()*L.length|0])}w3UI()}
// ----- boutons tactiles -----
{const d=document.createElement('div');d.id='w3ui';d.innerHTML=`<button id="w3go">${ICO('user')} Descendre du vaisseau</button><button id="w3act"></button><button id="w3back">${ICO('close')} Continuer à marcher</button><button id="w3ship">${ICO('ship')} Retour au vaisseau</button>`;document.body.appendChild(d);
$('w3go').onclick=()=>w3Start();$('w3act').onclick=()=>{if(WK3.near)w3Act(WK3.near.act)};$('w3back').onclick=()=>{WK3.menu=false;document.body.classList.remove('w3menu');w3UI()};$('w3ship').onclick=()=>w3Stop()}
function w3UI(){const go=H3.on&&!WK3.on&&!(typeof CUS3!='undefined'&&CUS3.open);$('w3go').style.display=go?'':'none';$('w3act').style.display=WK3.on&&!WK3.menu&&WK3.near?'':'none';if(WK3.near)$('w3act').innerHTML=ICO(WK3.near.act=='ship'?'ship':WK3.near.act=='market'?'cargo':WK3.near.act=='bar'?'squad':WK3.near.act=='atelier'?'wrench':'target')+' '+WK3.near.lab+(DESK?' (E)':'');
$('w3back').style.display=WK3.on&&WK3.menu?'':'none';$('w3ship').style.display=WK3.on&&!WK3.menu?'':'none'}
// regard : glisser à droite (tactile) ou n'importe où (souris)
OV.addEventListener('pointerdown',e=>{if(!WK3.on||WK3.menu)return;if(e.pointerType!='mouse'&&e.clientX<innerWidth*.62)return;WK3.drag={id:e.pointerId,x:e.clientX,y:e.clientY}});
OV.addEventListener('pointermove',e=>{const D=WK3.drag;if(!D||D.id!==e.pointerId)return;WK3.cy-=(e.clientX-D.x)*.008;WK3.cp=clamp(WK3.cp+(e.clientY-D.y)*.005,-.3,.9);D.x=e.clientX;D.y=e.clientY});
for(const ev of['pointerup','pointercancel'])OV.addEventListener(ev,e=>{if(WK3.drag&&WK3.drag.id===e.pointerId)WK3.drag=null});
addEventListener('keydown',e=>{if(!WK3.on)return;if(e.code=='KeyE'){e.preventDefault();e.stopImmediatePropagation();if(WK3.menu){WK3.menu=false;document.body.classList.remove('w3menu');w3UI()}else if(WK3.near)w3Act(WK3.near.act)}else if(e.code=='Escape'&&WK3.menu){WK3.menu=false;document.body.classList.remove('w3menu');w3UI()}},true);
// ----- déplacement -----
function w3Coll(p){const B=WK3.box;p.x=clamp(p.x,B.x0,B.x1);p.z=clamp(p.z,B.z0,B.z1);for(const c of WK3.col){const dx=p.x-c.x,dz=p.z-c.z,ox=c.w+.45-Math.abs(dx),oz=c.d+.45-Math.abs(dz);if(ox>0&&oz>0){if(ox<oz)p.x+=Math.sign(dx||1)*ox;else p.z+=Math.sign(dz||1)*oz}}}
function w3Tick(dt){if(!H3.on&&WK3.on)w3Stop();w3UI();if(!WK3.on||!WK3.m)return;const P=WK3.p;let ix=0,iz=0;
if(!WK3.menu){if(stick&&Math.hypot(stick.x,stick.y)>.1){ix=stick.x;iz=-stick.y}ix+=(K.KeyD|K.ArrowRight|0)-(K.KeyA|K.KeyQ|K.ArrowLeft|0);iz+=(K.KeyW|K.KeyZ|K.ArrowUp|0)-(K.KeyS|K.ArrowDown|0);const il=Math.hypot(ix,iz);if(il>1){ix/=il;iz/=il}}
const fw=new V3(-Math.sin(WK3.cy),0,-Math.cos(WK3.cy)),rt=new V3(Math.cos(WK3.cy),0,-Math.sin(WK3.cy)),run=K.ShiftLeft||K.ShiftRight||(B&&B.boost),sp=run?7:4.2;
const want=fw.multiplyScalar(iz).addScaledVector(rt,ix).multiplyScalar(sp);WK3.vel.x=lerp(WK3.vel.x,want.x,damp(10,dt));WK3.vel.z=lerp(WK3.vel.z,want.z,damp(10,dt));P.x+=WK3.vel.x*dt;P.z+=WK3.vel.z*dt;w3Coll(P);
const hs=Math.hypot(WK3.vel.x,WK3.vel.z);if(hs>.4){const ty=Math.atan2(-WK3.vel.x,-WK3.vel.z);let d=ty-WK3.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));WK3.yaw+=d*damp(10,dt)}WK3.ph+=dt*hm3Rate(hs);
WK3.m.position.set(P.x,0,P.z);WK3.m.rotation.y=WK3.yaw;try{animHuman(WK3.m,WK3.ph,hs,false,false,0,null)}catch(e){}
// proximité des stands
let best=null,bd=3.6;for(const s of WK3.spots){if(s.idle){try{animHuman(s.n,s.ph,0,false,false,Math.sin(t*.7+s.ph)>.6?1:0,null)}catch(e){}continue}const d=Math.hypot(P.x-s.x,P.z-s.z);if(d<bd){bd=d;best=s}if(s.n)try{animHuman(s.n,s.ph,0,false,false,d<5?1:0,d<8?Math.atan2(P.x-s.n.position.x,P.z-s.n.position.z)-s.n.rotation.y:null)}catch(e){}}WK3.near=best;w3UI()}
TICK.push(w3Tick);
// caméra : derrière le pilote (remplace le travelling du hangar)
{const _ha=h3Anim;h3Anim=function(dt){_ha(dt);if(!WK3.on||!H3.cam)return;const c=H3.cam,P=WK3.p,dist=WK3.menu?4.2:5.6,h=1.7+WK3.cp*3.2;c.position.set(P.x+Math.sin(WK3.cy)*dist*Math.cos(WK3.cp*.5),h,P.z+Math.cos(WK3.cy)*dist*Math.cos(WK3.cp*.5));c.position.x=clamp(c.position.x,-35,35);c.position.z=clamp(c.position.z,-47,47);c.lookAt(P.x,1.35,P.z)}}
