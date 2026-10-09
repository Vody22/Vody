// ===== MODE COCKPIT : vue à la première personne, tableau de bord 3D avec écrans en direct =====
let COCKPIT=false;try{COCKPIT=localStorage.getItem('sf-cockpit')=='1'}catch(e){}
const CK={g:null,key:'',scr:null,t:0,lights:[]};
const ckActive=()=>COCKPIT&&!S.dead&&!atelierOn()&&!(typeof FOOT!='undefined'&&FOOT.on);
function ckToggle(){COCKPIT=!COCKPIT;try{localStorage.setItem('sf-cockpit',COCKPIT?'1':'0')}catch(e){}ckBtn();toast(COCKPIT?'👁 Vue cockpit':'🎥 Vue extérieure');camInit=true;SFX.tick()}
function ckBtn(){const b=$('cockb');b.classList.toggle('on',COCKPIT);b.textContent=COCKPIT?'🎥':'👁';b.title=COCKPIT?'Vue extérieure':'Vue cockpit'}
$('cockb').addEventListener('pointerdown',e=>{e.preventDefault();ckToggle()});ckBtn();
addEventListener('keydown',e=>{if(e.repeat||e.target.tagName=='INPUT')return;if(e.code=='KeyV')ckToggle()});
function ckScreen(w,h){const c=mkC(w,h),x=c.getContext('2d'),tx=new THREE.CanvasTexture(c);tx.minFilter=THREE.LinearFilter;return{c,x,tx,w,h}}
// panneau de boutons des consoles latérales
const CKBTN=(()=>{const c=mkC(256,128),x=c.getContext('2d'),r=rng(33);x.fillStyle='#12151a';x.fillRect(0,0,256,128);for(let i=0;i<48;i++){const bx=10+(i%12)*20,by=10+Math.floor(i/12)*28;x.fillStyle='#262b33';x.fillRect(bx,by,16,18);const k=r();x.fillStyle=k<.14?'#ff5040':k<.3?'#40ff90':k<.4?'#ffb030':k<.52?'#40c0ff':'#3a4250';x.fillRect(bx+3,by+3,10,6);x.fillStyle='#0a0c10';x.fillRect(bx+5,by+12,6,3)}
x.strokeStyle='rgba(255,210,80,.5)';x.lineWidth=2;x.strokeRect(4,4,248,120);const t=new THREE.CanvasTexture(c);return t})();
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
const pil=(x0,y0,x1,y1)=>{const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy),a=Math.atan2(-dx,dy);add(new THREE.BoxGeometry(.05,L,.07),frame,(x0+x1)/2,(y0+y1)/2,-D,0,0,a);add(new THREE.BoxGeometry(.012,L,.074),hull,(x0+x1)/2,(y0+y1)/2,-D+.005,0,0,a);add(new THREE.BoxGeometry(.004,L*.92,.004),acc,(x0+x1)/2+(x0<0?.028:-.028),(y0+y1)/2,-D+.036,0,0,a)};
const px=por?.97:.9;for(const s of[-1,1])pil(s*hW*px,yTop,s*hW*(por?.8:.62),hH*1.08);
add(new THREE.BoxGeometry(W,.05,.08),frame,0,hH*1.02,-D);add(new THREE.BoxGeometry(W,.012,.085),hull,0,hH*1.02-.03,-D+.004);
// bords latéraux du cockpit
for(const s of[-1,1])add(new THREE.BoxGeometry(.08,hH*.9,.5),frame,s*hW*1.06,yTop-hH*.3,-D+.12,0,0,s*.12);
// combinateur du viseur tête haute
const cmb=add(new THREE.PlaneGeometry(hH*.36,hH*.26),new THREE.MeshBasicMaterial({color:0x50ffb0,transparent:true,opacity:.022,blending:ADDB,depthWrite:false}),0,yTop+hH*.15,-D-.12,-.12);
add(new THREE.BoxGeometry(hH*.37,.006,.006),frame,0,yTop+hH*.02,-D-.11);
// reflet de la verrière
const gl=add(new THREE.PlaneGeometry(hW*2.2,hH*2.2),new THREE.MeshBasicMaterial({map:CKGLASS,transparent:true,opacity:.09,blending:ADDB,depthWrite:false}),0,0,-D-.4);gl.renderOrder=4;
// consoles latérales avec rangées de boutons
const cbm=new THREE.MeshBasicMaterial({map:CKBTN,color:0xb0b8c0});for(const s of[-1,1]){const cg=new THREE.Group();cg.position.set(s*hW*.96,yTop-hH*.2,-.8);cg.rotation.set(-.55,0,s*.38);g.add(cg);add(new THREE.BoxGeometry(hW*.6,.05,.6),dash,0,0,0,0,0,0,cg);add(new THREE.PlaneGeometry(hW*.52,.3),cbm,0,.027,-.04,-Math.PI/2,0,0,cg)}
// manette des gaz (gauche) : elle avance avec la poussée
const thr=new THREE.Group();thr.position.set(-hW*(por?.74:.78),yTop-hH*.1,-.7);g.add(thr);add(new THREE.BoxGeometry(.06,.02,.2),frame,0,0,0,0,0,0,thr);const lev=new THREE.Group();thr.add(lev);
add(new THREE.CylinderGeometry(.007,.007,.1,6),MAT.metal,0,.05,0,0,0,0,lev);add(new THREE.BoxGeometry(.04,.032,.055),dash,0,.1,0,0,0,0,lev);add(new THREE.BoxGeometry(.012,.01,.012),new THREE.MeshBasicMaterial({color:0xff4030}),.014,.12,-.02,0,0,0,lev);CK.thr=lev;
// manche à balai (centre) : il suit tes commandes
const stk=new THREE.Group();stk.position.set(por?hW*.08:0,-hH*1.28,-.6);g.add(stk);const sl=hH*.44;add(new THREE.CylinderGeometry(.011,.016,sl,8),MAT.metal,0,sl/2,0,0,0,0,stk);
add(new THREE.BoxGeometry(.045,.085,.045),dash,0,sl+.03,0,0,0,0,stk);add(new THREE.BoxGeometry(.014,.02,.012),new THREE.MeshBasicMaterial({color:0xff3a2a}),0,sl+.03,-.026,0,0,0,stk);add(new THREE.CylinderGeometry(.009,.009,.012,8),new THREE.MeshBasicMaterial({color:0xffc040}),0,sl+.078,0,0,0,0,stk);CK.stick=stk;
// panneau d'alertes au plafond
const op=new THREE.Group();op.position.set(0,hH*.96,-.88);g.add(op);add(new THREE.BoxGeometry(hH*.44,.05,.1),frame,0,0,0,0,0,0,op);CK.warn=[];
for(const[i,c]of[[-1,0xff2a20],[0,0x3a8cff],[1,0xffa020]].map(([k,c])=>[k,c])){const m=new THREE.MeshBasicMaterial({color:c});add(new THREE.BoxGeometry(hH*.1,.022,.012),m,i*hH*.13,-.012,.052,0,0,0,op);CK.warn.push({m,c:new THREE.Color(c)})}
g.traverse(o=>{o.frustumCulled=false});return g}
// ----- écrans en direct -----
const ENN={pirate:'Pirate',chasseur:'Chasseur',lourd:'Croiseur lourd',boss:'Chef pirate'};
function ckDraw(){const S2=CK.scr;if(!S2)return;
// central : vitesse, coque, bouclier, arme
{const{x,w,h}=S2.c;x.fillStyle='#03101a';x.fillRect(0,0,w,h);x.strokeStyle='rgba(80,220,255,.5)';x.lineWidth=2;x.strokeRect(2,2,w-4,h-4);
x.fillStyle='#7fdcff';x.font="700 12px 'Chakra Petch',system-ui";x.textAlign='left';x.fillText('VITESSE',12,20);x.font="800 38px 'Chakra Petch',system-ui";x.fillStyle='#e8fbff';x.fillText(Math.round(S.spd),12,58);x.font="700 12px 'Chakra Petch',system-ui";x.fillStyle='#7fdcff';x.fillText('m/s',12,74);
const bar=(lab,v,c,y)=>{x.fillStyle='#8fb4c8';x.font="700 10px 'Chakra Petch',system-ui";x.fillText(lab,118,y);x.fillStyle='rgba(255,255,255,.1)';x.fillRect(118,y+4,124,8);x.fillStyle=c;x.fillRect(118,y+4,124*clamp(v,0,1),8)};
const mh=maxhp();bar('COQUE '+Math.max(0,Math.round(S.hp)),S.hp/mh,S.hp/mh<.3?'#ff5050':'#4dff8f',18);const ms=PM('sh');if(ms>0)bar('BOUCLIER '+Math.ceil(S.sh||0),(S.sh||0)/ms,'#5fa8ff',44);
if(G.w.includes('laser'))bar('CHALEUR LASER',LZ.heat,LZ.over>0?'#ff4040':LZ.heat>.7?'#ffa040':'#60e8ff',ms>0?70:44);
const W2=WPN[curW()];x.fillStyle='#ffd257';x.font="800 13px 'Chakra Petch',system-ui";x.fillText(W2.ic+' '+W2.n.toUpperCase()+(W2.am?'  '+G.ammo[W2.am]:''),12,h-14);x.textAlign='right';x.fillStyle=ZC[danger()];x.font="700 10px 'Chakra Petch',system-ui";x.fillText(mode=='surf'?'SURFACE':ZN[danger()].toUpperCase(),w-10,h-14);S2.c.tx.needsUpdate=true}
// gauche : radar vu de dessus
{const{x,w,h}=S2.l,cx=w/2,cy=h/2+4,R=h/2-12,RG=2600;x.fillStyle='#03101a';x.fillRect(0,0,w,h);x.strokeStyle='rgba(80,220,255,.5)';x.lineWidth=2;x.strokeRect(2,2,w-4,h-4);
x.strokeStyle='rgba(90,220,255,.35)';x.lineWidth=1;for(const k of[1,.5]){x.beginPath();x.arc(cx,cy,R*k,0,TAU);x.stroke()}x.beginPath();x.moveTo(cx-R,cy);x.lineTo(cx+R,cy);x.moveTo(cx,cy-R);x.lineTo(cx,cy+R);x.stroke();
const a=(t*2)%TAU;x.fillStyle='rgba(90,220,255,.18)';x.beginPath();x.moveTo(cx,cy);x.arc(cx,cy,R,a-.6,a);x.closePath();x.fill();
const inv=S.q.clone().invert(),bl=(p,c,s)=>{const v=_v.set(p.x-S.pos.x,p.y-S.pos.y,p.z-S.pos.z).applyQuaternion(inv);const d=Math.hypot(v.x,v.z);if(d>RG*1.2)return;const k=Math.min(1,d/RG)*R/(d||1);x.fillStyle=c;x.beginPath();x.arc(cx+v.x*k,cy+v.z*k,s,0,TAU);x.fill()};
if(mode=='space'){for(const su of suns){const v=_v.set(su.x-S.pos.x,su.y-S.pos.y,su.z-S.pos.z).applyQuaternion(inv),d=Math.hypot(v.x,v.z)||1,k=Math.min(R-6,d/RG*R)/d;x.fillStyle='#ffd27a';starPath(x,cx+v.x*k,cy+v.z*k,6,2.5);x.fill()}for(const st of stations)bl(st,'#ffc845',3);for(const e of en)bl(e.pos,'#ff4a4a',2.6)}else{const I=SURF.info();for(const T of I.tur)bl(T.pos,'#ff4a4a',2.6);for(const c2 of I.crys)bl(c2.pos,'#5ff',1.6)}
if(typeof MP!='undefined'&&MP.room)for(const o of MP.others.values())if(o.pos)bl(o.pos,`hsl(${o.hue},85%,65%)`,2.6);if(G.m&&G.m.tg&&G.m.tg.x!=null)bl(G.m.tg,'#5f9',3);
x.fillStyle='#fff';x.beginPath();x.moveTo(cx,cy-5);x.lineTo(cx-4,cy+4);x.lineTo(cx+4,cy+4);x.fill();x.fillStyle='#7fdcff';x.font="700 10px 'Chakra Petch',system-ui";x.textAlign='left';x.fillText('RADAR',8,15);S2.l.tx.needsUpdate=true}
// droite : cible verrouillée
{const{x,w,h}=S2.r;x.fillStyle='#03101a';x.fillRect(0,0,w,h);x.strokeStyle=lock?'rgba(255,90,90,.7)':'rgba(80,220,255,.5)';x.lineWidth=2;x.strokeRect(2,2,w-4,h-4);x.textAlign='left';
if(lock){const d=lock.pos.distanceTo(S.pos),e=en.find(q=>q===lock),nm=lock.isPlayer?'Pilote':lock.bossPart?'Némésis':e?ENN[e.ty]||'Pirate':'Tourelle';x.fillStyle='#ff7070';x.font="800 11px 'Chakra Petch',system-ui";x.fillText('◎ CIBLE VERROUILLÉE',8,18);
x.fillStyle='#fff';x.font="800 17px 'Chakra Petch',system-ui";x.fillText(nm,8,44);x.fillStyle='#bcd';x.font="700 12px 'Chakra Petch',system-ui";x.fillText(d>=1000?(d/1000).toFixed(2)+' km':Math.round(d)+' m',8,64);
const f=e&&e.mhp?clamp(e.hp/e.mhp,0,1):lock.hp!=null&&lock.mhp?clamp(lock.hp/lock.mhp,0,1):null;if(f!=null){x.fillStyle='rgba(255,255,255,.1)';x.fillRect(8,76,w-16,9);x.fillStyle='#ff5a5a';x.fillRect(8,76,(w-16)*f,9)}
const pulse=Math.sin(t*8)>0;if(pulse){x.strokeStyle='#ff5a5a';x.lineWidth=2;x.strokeRect(w-38,h-38,26,26)}}
else{x.fillStyle='#7fdcff';x.font="800 11px 'Chakra Petch',system-ui";x.fillText('AUCUNE CIBLE',8,18);x.fillStyle='#8fb4c8';x.font="600 10px 'Chakra Petch',system-ui";x.fillText('Vise un ennemi pour',8,44);x.fillText('le verrouiller',8,58);
x.fillStyle='#5f7d90';x.font="600 9px 'Chakra Petch',system-ui";x.fillText(`X ${Math.round(S.pos.x)}  Y ${Math.round(S.pos.y)}`,8,h-24);x.fillText(`Z ${Math.round(S.pos.z)}`,8,h-12)}S2.r.tx.needsUpdate=true}}
// ----- caméra : la tête du pilote bouge (accélérations, virages, vibrations), le cockpit reste fixé au vaisseau -----
const _ck=new V3(),_ckq=new QT(),_cke=new THREE.Euler();Object.assign(CK,{hx:0,hy:0,hz:0,roll:0,ls:0});
function ckCam(dt){const ud=ship.userData,b=ud.body,bo=isBoost()&&!S.docked?1:0;fovK=lerp(fovK,bo,damp(2.4,dt));ship.updateMatrixWorld(true);
const acc=dt>0?(S.spd-CK.ls)/dt:0;CK.ls=S.spd;CK.hz=lerp(CK.hz,clamp(acc*.0007,-.04,.07),damp(3,dt));CK.hx=lerp(CK.hx,clamp(-(S.yawV||0)*.045,-.045,.045),damp(3,dt));CK.hy=lerp(CK.hy,clamp(-(S.pitchV||0)*.03,-.03,.03),damp(3,dt));CK.roll=lerp(CK.roll,-(S.yawV||0)*.035,damp(3,dt));
// position de base des yeux (le cockpit 3D y est accroché)
const eye=b.localToWorld(_ck.set(0,1.34,-2.7)).clone(),bq=b.getWorldQuaternion(new QT());
const base=innerWidth<innerHeight?84:(DESK?74:68),spK=clamp(S.spd/Math.max(1,cruise()),0,2.8),fv=base+fovK*15+Math.max(0,spK-1)*2;if(Math.abs(camera.fov-fv)>.05){camera.fov=fv;camera.updateProjectionMatrix()}
const asp=innerWidth/innerHeight,key=asp.toFixed(2)+'|'+Math.round(base)+'|'+ud.mats.hull.color.getHex()+'|'+ud.mats.accent.color.getHex();
if(!CK.g||CK.key!==key){if(CK.g&&CK.g.parent)CK.g.parent.remove(CK.g);CK.g=buildCockpit(asp,base,ud);CK.key=key}
const sc=curScene();if(CK.g.parent!==sc)sc.add(CK.g);CK.g.visible=true;CK.g.position.copy(eye);CK.g.quaternion.copy(bq);const k=Math.tan(fv*Math.PI/360)/Math.tan(base*Math.PI/360);CK.g.scale.set(k,k,1);
// tête : inertie + vibrations du moteur, secousses du boost et des impacts
const vib=.0022+(S.thr||0)*.0018+fovK*.011+shake*.04;camera.position.copy(eye).add(_ck.set(CK.hx+rv(vib),CK.hy+rv(vib),CK.hz+rv(vib*.5)).applyQuaternion(bq));
_cke.set(rv(vib*.5)+CK.hy*.4,rv(vib*.5),CK.roll+rv(vib*.4));camera.quaternion.copy(bq).multiply(_ckq.setFromEuler(_cke));shake=Math.max(0,shake-dt*2.5);
camera.updateMatrixWorld();camUp.set(0,1,0).applyQuaternion(camera.quaternion);camera.up.copy(camUp);sky.position.copy(camera.position);camInit=true}
function updCockpit(dt){const on=ckActive(),ud=ship.userData;if(updCockpit.on!==on){updCockpit.on=on;document.body.classList.toggle('cockpit',on)}if(ud&&ud.body)ud.body.visible=!on;if(!on){if(CK.g)CK.g.visible=false;return}
CK.t-=dt;if(CK.t<=0){CK.t=.12;ckDraw()}for(const L of CK.lights)L.o.visible=Math.sin(t*L.sp+L.ph)>-.3;
if(CK.stick){CK.stick.rotation.x=lerp(CK.stick.rotation.x,(S.pitchV||0)*.32,damp(10,dt));CK.stick.rotation.z=lerp(CK.stick.rotation.z,(S.yawV||0)*.36,damp(10,dt))}
if(CK.thr)CK.thr.rotation.x=lerp(CK.thr.rotation.x,-.5+clamp((S.thr||0)/2.6,0,1)*1.1,damp(6,dt));
if(CK.warn){const low=S.hp/maxhp()<.3,bl=Math.sin(t*9)>0,on=[low&&bl,PM('sh')>0&&S.sh>1,isBoost()&&!S.docked];CK.warn.forEach((w,i)=>w.m.color.copy(w.c).multiplyScalar(on[i]?1.4:.12))}}
// ----- viseur tête haute (dessiné sur la verrière) -----
const CRK=(()=>{const c=mkC(512,512),x=c.getContext('2d'),r=rng(12);x.lineCap='round';for(const[cx,cy]of[[70,90],[450,120],[400,430]]){for(let k=0;k<9;k++){let px=cx,py=cy,a=r()*TAU;x.beginPath();x.moveTo(px,py);for(let s=0;s<7;s++){a+=(r()-.5)*.9;const L=14+r()*30;px+=Math.cos(a)*L;py+=Math.sin(a)*L;x.lineTo(px,py)}x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=3;x.stroke();x.strokeStyle='rgba(225,240,255,.8)';x.lineWidth=1.2;x.stroke()}
for(let k=0;k<3;k++){x.beginPath();x.arc(cx,cy,10+k*14+r()*8,r()*TAU,r()*TAU+2);x.strokeStyle='rgba(220,240,255,.45)';x.lineWidth=1;x.stroke()}}return c})();
function ckHUD(W,H){const fr=S.hp/maxhp();if(fr<.45){OX.save();OX.beginPath();OX.rect(0,0,W,H*(W<H?.75:.69));OX.clip();OX.globalAlpha=clamp((.45-fr)/.45,0,1)*.8;OX.drawImage(CRK,0,0,W,H);OX.restore()}
const q=camera.quaternion,F=_ck.set(0,0,-1).applyQuaternion(q).clone(),R=new V3(1,0,0).applyQuaternion(q),U=new V3(0,1,0).applyQuaternion(q);
const cx=W/2,cy=H/2,ppd=(H/2)/(camera.fov/2),pitch=Math.asin(clamp(F.y,-1,1))*180/Math.PI,roll=Math.atan2(R.y,U.y),col='rgba(110,255,190,.88)',S12=Math.max(10,Math.min(13,W/60));
OX.save();OX.strokeStyle=col;OX.fillStyle=col;OX.lineWidth=1.4;OX.shadowColor='rgba(40,255,150,.9)';OX.shadowBlur=5;OX.font=`700 ${S12}px 'Chakra Petch',system-ui`;
// échelle d'assiette (référence : plan de la galaxie)
const bw=Math.min(W*.3,260),bh=Math.min(H*.42,300);OX.save();OX.beginPath();OX.rect(cx-bw/2,cy-bh/2,bw,bh);OX.clip();OX.translate(cx,cy);OX.rotate(roll);OX.textAlign='center';
for(let a=-90;a<=90;a+=10){const y=(pitch-a)*ppd;if(Math.abs(y)>bh)continue;const hw=a==0?bw*.55:bw*.22,gp=bw*.07;if(a<0)OX.setLineDash([5,4]);OX.beginPath();OX.moveTo(-hw,y);OX.lineTo(-gp,y);OX.moveTo(gp,y);OX.lineTo(hw,y);if(a!=0){OX.moveTo(-hw,y);OX.lineTo(-hw,y+(a>0?6:-6));OX.moveTo(hw,y);OX.lineTo(hw,y+(a>0?6:-6))}OX.stroke();OX.setLineDash([]);if(a!=0){OX.fillText(Math.abs(a),-hw-14,y+4);OX.fillText(Math.abs(a),hw+14,y+4)}}OX.restore();
// cap (en haut)
const hd=((Math.atan2(F.x,-F.z)*180/Math.PI)+360)%360,tw=Math.min(W*.42,340),ty=Math.max(H*.13,DESK?40:150);OX.save();OX.beginPath();OX.rect(cx-tw/2,ty-20,tw,34);OX.clip();OX.textAlign='center';
for(let d=Math.floor((hd-40)/5)*5;d<=hd+40;d+=5){const x=cx+(d-hd)*tw/80,big=d%30==0;OX.beginPath();OX.moveTo(x,ty);OX.lineTo(x,ty-(big?9:4));OX.stroke();if(big){const v=((d%360)+360)%360;OX.fillText(v==0?'N':v==90?'E':v==180?'S':v==270?'O':String(v/10).padStart(2,'0'),x,ty-12)}}OX.restore();
OX.beginPath();OX.moveTo(cx,ty+2);OX.lineTo(cx-5,ty+9);OX.lineTo(cx+5,ty+9);OX.closePath();OX.fill();
// vitesse (gauche) et accélération ressentie
const lx=cx-bw/2-Math.min(70,W*.12),rx=cx+bw/2+Math.min(70,W*.12);OX.textAlign='center';OX.strokeRect(lx-30,cy-13,60,24);OX.font=`800 ${S12+3}px 'Chakra Petch',system-ui`;OX.fillText(Math.round(S.spd),lx,cy+5);OX.font=`700 ${S12-1}px 'Chakra Petch',system-ui`;OX.fillText('M/S',lx,cy+26);
const gf=1+Math.abs(S.yawV||0)*S.spd*.012+Math.abs(S.pitchV||0)*S.spd*.01;OX.fillText('G '+gf.toFixed(1),lx,cy-22);const tb=clamp((S.thr||0)/2.6,0,1);OX.strokeRect(lx-40,cy-40,6,80);OX.fillRect(lx-40,cy+40-80*tb,6,80*tb);
// droite : distance de la cible ou altitude
let rv2='—',rl='CIBLE';if(lock)rv2=Math.round(lock.pos.distanceTo(S.pos))+'';else if(mode=='surf'){rl='ALT';rv2=Math.round(S.pos.y-SURF.height(S.pos.x,S.pos.z))+''}OX.strokeRect(rx-30,cy-13,60,24);OX.font=`800 ${S12+3}px 'Chakra Petch',system-ui`;OX.fillText(rv2,rx,cy+5);OX.font=`700 ${S12-1}px 'Chakra Petch',system-ui`;OX.fillText(rl,rx,cy+26);
// vecteur vitesse (où tu vas réellement)
if(S.spd>5){const vp=proj(_ck.copy(S.pos).addScaledVector(S.vel,1/Math.max(1,S.spd)*600));if(vp.front){OX.beginPath();OX.arc(vp.x,vp.y,6,0,TAU);OX.moveTo(vp.x-6,vp.y);OX.lineTo(vp.x-15,vp.y);OX.moveTo(vp.x+6,vp.y);OX.lineTo(vp.x+15,vp.y);OX.moveTo(vp.x,vp.y-6);OX.lineTo(vp.x,vp.y-12);OX.stroke()}}
// point de visée anticipée pour les canons
if(lock&&lock.vel&&curW()=='canon'){const d=lock.pos.distanceTo(S.pos),lp=proj(_ck.copy(lock.pos).addScaledVector(lock.vel,d/950)),tp=proj(lock.pos);if(lp.front&&tp.front){OX.setLineDash([3,4]);OX.beginPath();OX.moveTo(tp.x,tp.y);OX.lineTo(lp.x,lp.y);OX.stroke();OX.setLineDash([]);OX.beginPath();OX.arc(lp.x,lp.y,8,0,TAU);OX.stroke();OX.fillRect(lp.x-1.5,lp.y-1.5,3,3)}}
// alertes
const warn=[];if(fr<.3)warn.push(['⚠ ALERTE COQUE','#ff5050']);if(PM('sh')>0&&(S.sh||0)<1)warn.push(['BOUCLIER HORS LIGNE','#ffb040']);if(LZ.over>0)warn.push(['SURCHAUFFE LASER','#ff8040']);if(isBoost()&&!S.docked)warn.push(['» BOOST «','#9fd8ff']);
OX.font=`800 ${S12}px 'Chakra Petch',system-ui`;warn.forEach(([txt,c],i)=>{if(c!='#9fd8ff'&&Math.sin(t*8)<-.2)return;OX.fillStyle=c;OX.shadowColor=c;OX.fillText(txt,cx,cy-bh/2-12-i*17)});OX.restore()}

