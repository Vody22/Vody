// ===== MODE COCKPIT : vue à la première personne, tableau de bord 3D avec écrans en direct =====
let COCKPIT=false;try{COCKPIT=localStorage.getItem('sf-cockpit')=='1'}catch(e){}
const CK={g:null,key:'',scr:null,t:0,lights:[]};
const ckActive=()=>COCKPIT&&!S.dead&&!(S.docked&&TAB=='atelier'&&mode=='space');
function ckToggle(){COCKPIT=!COCKPIT;try{localStorage.setItem('sf-cockpit',COCKPIT?'1':'0')}catch(e){}ckBtn();toast(COCKPIT?'👁 Vue cockpit':'🎥 Vue extérieure');camInit=true;SFX.tick()}
function ckBtn(){const b=$('cockb');b.classList.toggle('on',COCKPIT);b.textContent=COCKPIT?'🎥':'👁';b.title=COCKPIT?'Vue extérieure':'Vue cockpit'}
$('cockb').addEventListener('pointerdown',e=>{e.preventDefault();ckToggle()});ckBtn();
addEventListener('keydown',e=>{if(e.repeat||e.target.tagName=='INPUT')return;if(e.code=='KeyV')ckToggle()});
function ckScreen(w,h){const c=mkC(w,h),x=c.getContext('2d'),tx=new THREE.CanvasTexture(c);tx.minFilter=THREE.LinearFilter;return{c,x,tx,w,h}}
// reflet discret sur la verrière
const CKGLASS=(()=>{const c=mkC(256,256),g=c.getContext('2d');let gr=g.createLinearGradient(0,0,256,256);gr.addColorStop(0,'rgba(150,200,255,.0)');gr.addColorStop(.32,'rgba(150,200,255,.0)');gr.addColorStop(.36,'rgba(190,225,255,.55)');gr.addColorStop(.42,'rgba(150,200,255,.0)');gr.addColorStop(.47,'rgba(190,225,255,.25)');gr.addColorStop(.5,'rgba(150,200,255,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);
gr=g.createRadialGradient(128,-40,20,128,-40,260);gr.addColorStop(0,'rgba(120,170,230,.35)');gr.addColorStop(1,'rgba(120,170,230,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);return new THREE.CanvasTexture(c)})();
function buildCockpit(asp,fov,ud){const g=new THREE.Group(),hH=Math.tan(fov*Math.PI/360),hW=hH*asp,por=asp<1,D=1;CK.lights=[];
const frame=new THREE.MeshStandardMaterial({color:0x262b33,metalness:.65,roughness:.4}),dash=new THREE.MeshStandardMaterial({color:0x181b21,metalness:.45,roughness:.62}),
hull=new THREE.MeshStandardMaterial({color:ud.mats.hull.color.clone(),metalness:.6,roughness:.35}),acc=new THREE.MeshBasicMaterial({color:ud.mats.accent.color.clone().multiplyScalar(.75)});
const add=(geo,m,x,y,z,rx=0,ry=0,rz=0,par=g)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);o.renderOrder=5;par.add(o);return o};
const W=hW*2.5,yTop=-hH*(por?.5:.38);
// capot anti-reflet + liseré lumineux
add(new THREE.BoxGeometry(W,.035,.42),dash,0,yTop,-D-.16);add(new THREE.CylinderGeometry(.022,.022,W,8).rotateZ(Math.PI/2),hull,0,yTop+.005,-D-.37);add(new THREE.BoxGeometry(W,.0035,.008),acc,0,yTop+.026,-D-.38);
// face du tableau de bord (inclinée)
const H=hH*.95,pz=-D+.02,tilt=-.42,panel=new THREE.Group();panel.position.set(0,yTop-.02,pz);panel.rotation.x=tilt;g.add(panel);
add(new THREE.BoxGeometry(W,H,.04),dash,0,-H/2,0,0,0,0,panel);
// écrans
const cw=por?hW*.62:hH*.5,ch=cw*.52,sw=por?hW*.4:hH*.36,sh=sw*.66,gap=cw*.07,sy=-ch*.6,cx0=por?-hW*.2:0;
if(!CK.scr)CK.scr={c:ckScreen(256,132),l:ckScreen(192,128),r:ckScreen(192,128)};const S2=CK.scr;
const scr=(s,w,h,x,y)=>{add(new THREE.BoxGeometry(w+.018,h+.018,.02),frame,x,y,.022,0,0,0,panel);const m=add(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:s.tx,toneMapped:false}),x,y,.034,0,0,0,panel);return m};
scr(S2.c,cw,ch,cx0,sy);const sx=cw/2+gap+sw/2;scr(S2.l,sw,sh,cx0-sx,sy+(ch-sh)*.3);if(!por)scr(S2.r,sw,sh,sx,sy+(ch-sh)*.3);
// petits voyants
const cols=[0x40ff80,0xffb030,0xff4040,0x40c8ff];for(let i=0;i<(por?4:8);i++){const x=cx0+(i<4?-1:1)*(sx+sw*.15+(i%4)*sw*.17)-(i<4?-1:1)*sw*.4,m=new THREE.MeshBasicMaterial({color:cols[i%4]});const o=add(new THREE.BoxGeometry(.018,.012,.01),m,x,sy-ch*.62,.03,0,0,0,panel);CK.lights.push({o,ph:Math.random()*9,sp:1+Math.random()*3})}
// montants de la verrière (piliers avant) et arceau supérieur
const pil=(x0,y0,x1,y1)=>{const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy);add(new THREE.BoxGeometry(.05,L,.07),frame,(x0+x1)/2,(y0+y1)/2,-D,0,0,Math.atan2(-dx,dy));add(new THREE.BoxGeometry(.012,L,.074),hull,(x0+x1)/2,(y0+y1)/2,-D+.005,0,0,Math.atan2(-dx,dy))};
const px=por?.97:.9;for(const s of[-1,1])pil(s*hW*px,yTop,s*hW*(por?.8:.62),hH*1.08);
add(new THREE.BoxGeometry(W,.05,.08),frame,0,hH*1.02,-D);add(new THREE.BoxGeometry(W,.012,.085),hull,0,hH*1.02-.03,-D+.004);
// bords latéraux du cockpit
for(const s of[-1,1])add(new THREE.BoxGeometry(.08,hH*.9,.5),frame,s*hW*1.06,yTop-hH*.3,-D+.12,0,0,s*.12);
// combinateur du viseur tête haute
const cmb=add(new THREE.PlaneGeometry(hH*.36,hH*.26),new THREE.MeshBasicMaterial({color:0x50ffb0,transparent:true,opacity:.022,blending:ADDB,depthWrite:false}),0,yTop+hH*.15,-D-.12,-.12);
add(new THREE.BoxGeometry(hH*.37,.006,.006),frame,0,yTop+hH*.02,-D-.11);
// reflet de la verrière
const gl=add(new THREE.PlaneGeometry(hW*2.2,hH*2.2),new THREE.MeshBasicMaterial({map:CKGLASS,transparent:true,opacity:.09,blending:ADDB,depthWrite:false}),0,0,-D-.4);gl.renderOrder=4;
g.traverse(o=>{o.frustumCulled=false});return g}
// ----- écrans en direct -----
const ENN={pirate:'Pirate',chasseur:'Chasseur',lourd:'Croiseur lourd',boss:'Chef pirate'};
function ckDraw(){const S2=CK.scr;if(!S2)return;
// central : vitesse, coque, bouclier, arme
{const{x,w,h}=S2.c;x.fillStyle='#03101a';x.fillRect(0,0,w,h);x.strokeStyle='rgba(80,220,255,.5)';x.lineWidth=2;x.strokeRect(2,2,w-4,h-4);
x.fillStyle='#7fdcff';x.font='700 12px system-ui';x.textAlign='left';x.fillText('VITESSE',12,20);x.font='800 38px system-ui';x.fillStyle='#e8fbff';x.fillText(Math.round(S.spd),12,58);x.font='700 12px system-ui';x.fillStyle='#7fdcff';x.fillText('m/s',12,74);
const bar=(lab,v,c,y)=>{x.fillStyle='#8fb4c8';x.font='700 10px system-ui';x.fillText(lab,118,y);x.fillStyle='rgba(255,255,255,.1)';x.fillRect(118,y+4,124,8);x.fillStyle=c;x.fillRect(118,y+4,124*clamp(v,0,1),8)};
const mh=maxhp();bar('COQUE '+Math.max(0,Math.round(S.hp)),S.hp/mh,S.hp/mh<.3?'#ff5050':'#4dff8f',18);const ms=PM('sh');if(ms>0)bar('BOUCLIER '+Math.ceil(S.sh||0),(S.sh||0)/ms,'#5fa8ff',44);
if(G.w.includes('laser'))bar('CHALEUR LASER',LZ.heat,LZ.over>0?'#ff4040':LZ.heat>.7?'#ffa040':'#60e8ff',ms>0?70:44);
const W2=WPN[curW()];x.fillStyle='#ffd257';x.font='800 13px system-ui';x.fillText(W2.ic+' '+W2.n.toUpperCase()+(W2.am?'  '+G.ammo[W2.am]:''),12,h-14);x.textAlign='right';x.fillStyle=ZC[danger()];x.font='700 10px system-ui';x.fillText(mode=='surf'?'SURFACE':ZN[danger()].toUpperCase(),w-10,h-14);S2.c.tx.needsUpdate=true}
// gauche : radar vu de dessus
{const{x,w,h}=S2.l,cx=w/2,cy=h/2+4,R=h/2-12,RG=2600;x.fillStyle='#03101a';x.fillRect(0,0,w,h);x.strokeStyle='rgba(80,220,255,.5)';x.lineWidth=2;x.strokeRect(2,2,w-4,h-4);
x.strokeStyle='rgba(90,220,255,.35)';x.lineWidth=1;for(const k of[1,.5]){x.beginPath();x.arc(cx,cy,R*k,0,TAU);x.stroke()}x.beginPath();x.moveTo(cx-R,cy);x.lineTo(cx+R,cy);x.moveTo(cx,cy-R);x.lineTo(cx,cy+R);x.stroke();
const a=(t*2)%TAU;x.fillStyle='rgba(90,220,255,.18)';x.beginPath();x.moveTo(cx,cy);x.arc(cx,cy,R,a-.6,a);x.closePath();x.fill();
const inv=S.q.clone().invert(),bl=(p,c,s)=>{const v=_v.set(p.x-S.pos.x,p.y-S.pos.y,p.z-S.pos.z).applyQuaternion(inv);const d=Math.hypot(v.x,v.z);if(d>RG*1.2)return;const k=Math.min(1,d/RG)*R/(d||1);x.fillStyle=c;x.beginPath();x.arc(cx+v.x*k,cy+v.z*k,s,0,TAU);x.fill()};
if(mode=='space'){for(const st of stations)bl(st,'#ffc845',3);for(const e of en)bl(e.pos,'#ff4a4a',2.6)}else if(SURF.targets)for(const T of SURF.targets())bl(T.pos,'#ff4a4a',2.6);
if(typeof MP!='undefined'&&MP.room)for(const o of MP.others.values())if(o.pos)bl(o.pos,`hsl(${o.hue},85%,65%)`,2.6);if(G.m&&G.m.tg&&G.m.tg.x!=null)bl(G.m.tg,'#5f9',3);
x.fillStyle='#fff';x.beginPath();x.moveTo(cx,cy-5);x.lineTo(cx-4,cy+4);x.lineTo(cx+4,cy+4);x.fill();x.fillStyle='#7fdcff';x.font='700 10px system-ui';x.textAlign='left';x.fillText('RADAR',8,15);S2.l.tx.needsUpdate=true}
// droite : cible verrouillée
{const{x,w,h}=S2.r;x.fillStyle='#03101a';x.fillRect(0,0,w,h);x.strokeStyle=lock?'rgba(255,90,90,.7)':'rgba(80,220,255,.5)';x.lineWidth=2;x.strokeRect(2,2,w-4,h-4);x.textAlign='left';
if(lock){const d=lock.pos.distanceTo(S.pos),e=en.find(q=>q===lock),nm=lock.isPlayer?'Pilote':lock.bossPart?'Némésis':e?ENN[e.ty]||'Pirate':'Tourelle';x.fillStyle='#ff7070';x.font='800 11px system-ui';x.fillText('◎ CIBLE VERROUILLÉE',8,18);
x.fillStyle='#fff';x.font='800 17px system-ui';x.fillText(nm,8,44);x.fillStyle='#bcd';x.font='700 12px system-ui';x.fillText(d>=1000?(d/1000).toFixed(2)+' km':Math.round(d)+' m',8,64);
const f=e&&e.mhp?clamp(e.hp/e.mhp,0,1):lock.hp!=null&&lock.mhp?clamp(lock.hp/lock.mhp,0,1):null;if(f!=null){x.fillStyle='rgba(255,255,255,.1)';x.fillRect(8,76,w-16,9);x.fillStyle='#ff5a5a';x.fillRect(8,76,(w-16)*f,9)}
const pulse=Math.sin(t*8)>0;if(pulse){x.strokeStyle='#ff5a5a';x.lineWidth=2;x.strokeRect(w-38,h-38,26,26)}}
else{x.fillStyle='#7fdcff';x.font='800 11px system-ui';x.fillText('AUCUNE CIBLE',8,18);x.fillStyle='#8fb4c8';x.font='600 10px system-ui';x.fillText('Vise un ennemi pour',8,44);x.fillText('le verrouiller',8,58);
x.fillStyle='#5f7d90';x.font='600 9px system-ui';x.fillText(`X ${Math.round(S.pos.x)}  Y ${Math.round(S.pos.y)}`,8,h-24);x.fillText(`Z ${Math.round(S.pos.z)}`,8,h-12)}S2.r.tx.needsUpdate=true}}
// ----- caméra et mise à jour -----
const _ck=new V3();
function ckCam(dt){const ud=ship.userData,b=ud.body,bo=isBoost()&&!S.docked?1:0;fovK=lerp(fovK,bo,damp(3,dt));ship.updateMatrixWorld(true);
camera.position.copy(b.localToWorld(_ck.set(0,1.34,-2.7)));b.getWorldQuaternion(camera.quaternion);
if(shake>0){camera.position.x+=rv(shake*.35);camera.position.y+=rv(shake*.35);shake=Math.max(0,shake-dt*2.5)}
const base=innerWidth<innerHeight?84:(DESK?74:68),fv=base+fovK*10;if(Math.abs(camera.fov-fv)>.05){camera.fov=fv;camera.updateProjectionMatrix()}
camera.updateMatrixWorld();camUp.set(0,1,0).applyQuaternion(camera.quaternion);camera.up.copy(camUp);sky.position.copy(camera.position);camInit=true;
const asp=innerWidth/innerHeight,key=asp.toFixed(2)+'|'+Math.round(base)+'|'+ud.mats.hull.color.getHex()+'|'+ud.mats.accent.color.getHex();
if(!CK.g||CK.key!==key){if(CK.g&&CK.g.parent)CK.g.parent.remove(CK.g);CK.g=buildCockpit(asp,base,ud);CK.key=key}
const sc=curScene();if(CK.g.parent!==sc)sc.add(CK.g);CK.g.visible=true;CK.g.position.copy(camera.position);CK.g.quaternion.copy(camera.quaternion);const k=Math.tan(fv*Math.PI/360)/Math.tan(base*Math.PI/360);CK.g.scale.set(k,k,1)}
function updCockpit(dt){const on=ckActive(),ud=ship.userData;if(updCockpit.on!==on){updCockpit.on=on;document.body.classList.toggle('cockpit',on)}if(ud&&ud.body)ud.body.visible=!on;if(!on){if(CK.g)CK.g.visible=false;return}
CK.t-=dt;if(CK.t<=0){CK.t=.12;ckDraw()}for(const L of CK.lights)L.o.visible=Math.sin(t*L.sp+L.ph)>-.3}
