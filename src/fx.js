// ===== EFFETS : explosions, fondu, entrée atmosphérique, décollage =====
const SMOKET=(()=>{const c=mkC(128),g=c.getContext('2d'),r=rng(31);for(let i=0;i<26;i++){const x=34+r()*60,y=34+r()*60,rr=16+r()*30,gr=g.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,`rgba(255,255,255,${.22+r()*.2})`);gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128)}return new THREE.CanvasTexture(c)})();
const FIRET=(()=>{const c=mkC(128),g=c.getContext('2d'),r=rng(37);for(let i=0;i<18;i++){const x=40+r()*48,y=40+r()*48,rr=18+r()*26,gr=g.createRadialGradient(x,y,0,x,y,rr);gr.addColorStop(0,'rgba(255,240,200,.6)');gr.addColorStop(.35,'rgba(255,170,60,.42)');gr.addColorStop(.7,'rgba(255,80,20,.22)');gr.addColorStop(1,'rgba(120,20,0,0)');g.fillStyle=gr;g.fillRect(0,0,128,128)}return new THREE.CanvasTexture(c)})();
const RINGT=(()=>{const c=mkC(128),g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.72,'rgba(255,255,255,0)');gr.addColorStop(.86,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)})();
const RINGG=new THREE.PlaneGeometry(2,2),DEBG=[new THREE.TetrahedronGeometry(1),new THREE.BoxGeometry(1.6,.4,1),new THREE.OctahedronGeometry(.9),new THREE.BoxGeometry(.5,.5,2)];
const DEBM=new THREE.MeshStandardMaterial({color:0x3a3632,map:HULLT,metalness:.6,roughness:.5,emissive:0xff4a10,emissiveIntensity:.55});
let FXL=[];
function fxSprite(tex,blend,col,op){return new THREE.Sprite(new THREE.SpriteMaterial({map:tex,color:col,transparent:true,opacity:op,depthWrite:false,blending:blend}))}
function bigBoom(p,n,c){const sc=curScene(),size=clamp(n*1.15,14,95),hi=DESK?1:.55;
for(let i=0;i<Math.round(6*hi);i++){const s=fxSprite(FIRET,ADDB,0xffffff,1);s.position.copy(p).add(new V3(rv(size*.18),rv(size*.18),rv(size*.18)));s.material.rotation=Math.random()*TAU;s.scale.setScalar(1);sc.add(s);FXL.push({o:s,k:'fire',l:.7+Math.random()*.5,ml:1.2,sz:size*(.55+Math.random()*.6),v:new V3(rv(10),rv(10),rv(10)),d:i*.04})}
for(let i=0;i<Math.round(9*hi);i++){const s=fxSprite(SMOKET,THREE.NormalBlending,mode=='surf'?0x5a5048:0x34343c,0);s.material.rotation=Math.random()*TAU;s.position.copy(p).add(new V3(rv(size*.2),rv(size*.2),rv(size*.2)));s.scale.setScalar(1);sc.add(s);const l=2.6+Math.random()*1.8;FXL.push({o:s,k:'smoke',l,ml:l,sz:size*(.7+Math.random()*.7),v:new V3(rv(1),rv(1),rv(1)).normalize().multiplyScalar(size*(.15+Math.random()*.35)),d:.12+Math.random()*.2,sp:rv(.4)})}
const rm=new THREE.Mesh(RINGG,new THREE.MeshBasicMaterial({map:RINGT,color:new THREE.Color(c).lerp(new THREE.Color(0xffe0b0),.5),transparent:true,blending:ADDB,depthWrite:false,side:THREE.DoubleSide}));rm.position.copy(p);rm.lookAt(camera.position);rm.rotateZ(Math.random()*TAU);sc.add(rm);FXL.push({o:rm,k:'ring',l:.6,ml:.6,sz:size*1.4});
for(let i=0;i<Math.round(12*hi);i++){const m=new THREE.Mesh(DEBG[i%4],DEBM);m.scale.setScalar((.35+Math.random()*.9)*size/22);m.position.copy(p);m.rotation.set(rv(3),rv(3),rv(3));sc.add(m);const l=1.8+Math.random()*1.6;FXL.push({o:m,k:'deb',l,ml:l,v:new V3(rv(1),rv(1),rv(1)).normalize().multiplyScalar(size*(1+Math.random()*2.2)),sp:new V3(rv(7),rv(7),rv(7))})}
const L=new THREE.PointLight(0xffa050,DESK?6:3,size*9,2);L.position.copy(p);sc.add(L);FXL.push({o:L,k:'light',l:.5,ml:.5,i0:L.intensity})}
function updFX(dt){for(let i=FXL.length-1;i>=0;i--){const f=FXL[i];if(f.d>0){f.d-=dt;if(f.o.material)f.o.material.opacity=0;continue}f.l-=dt;const a=clamp(1-f.l/f.ml,0,1),o=f.o;
if(f.k=='fire'){o.scale.setScalar(f.sz*(.35+Math.pow(a,.5)*1.1));o.material.opacity=Math.pow(1-a,1.6)*.7;o.material.color.setRGB(1,.72-a*.4,.42-a*.38);o.position.addScaledVector(f.v,dt)}
else if(f.k=='smoke'){o.scale.setScalar(f.sz*(.45+a*1.7));o.material.opacity=.55*(1-a)*Math.min(1,a*5);o.material.rotation+=f.sp*dt;o.position.addScaledVector(f.v,dt);f.v.multiplyScalar(Math.pow(.6,dt));if(mode=='surf')o.position.y+=8*dt}
else if(f.k=='ring'){o.scale.setScalar(f.sz*Math.pow(a,.55)+1);o.material.opacity=1-a}
else if(f.k=='deb'){o.position.addScaledVector(f.v,dt);o.rotation.x+=f.sp.x*dt;o.rotation.y+=f.sp.y*dt;o.rotation.z+=f.sp.z*dt;f.v.multiplyScalar(Math.pow(mode=='surf'?.5:.75,dt));if(mode=='surf')f.v.y-=90*dt;
if(a<.65&&Math.random()<.6)FIRE.emit(o.position.x,o.position.y,o.position.z,rv(4),rv(4),rv(4),.35+Math.random()*.3,1,.45+Math.random()*.3,.12,.4);if(a>.8)o.scale.multiplyScalar(Math.pow(.2,dt))}
else if(f.k=='light'){o.intensity=f.i0*(1-a)}
if(f.l<=0){o.parent&&o.parent.remove(o);if(o.material&&o.material!==DEBM)o.material.dispose();FXL.splice(i,1)}}}
function clearFX(){for(const f of FXL){f.o.parent&&f.o.parent.remove(f.o);if(f.o.material&&f.o.material!==DEBM)f.o.material.dispose()}FXL=[]}
// grosses explosions : on garde les étincelles et on ajoute boule de feu, fumée, débris, onde de choc
const _boom3=boom3;boom3=function(p,n,c,spd=60,big=false){_boom3(p,n,c,spd,false);if(big){bigBoom(p.clone?p.clone():new V3(p.x,p.y,p.z),n,c);shake=Math.min(1.4,shake+n*.012)}};
// ----- fondu plein écran -----
const FADE={v:0,tg:0,sp:2,col:'255,245,230'};let CLOUDW=0,CLOUDC='240,244,250';
function updFade(dt){FADE.v+=clamp(FADE.tg-FADE.v,-FADE.sp*dt,FADE.sp*dt)}
// ----- entrée atmosphérique -----
const _m4=new THREE.Matrix4();
function basisQ(f,upHint){const u=upHint.clone().addScaledVector(f,-upHint.dot(f));if(u.lengthSq()<1e-4)u.set(0,0,1).addScaledVector(f,-f.z);u.normalize();const r=f.clone().cross(u);return new QT().setFromRotationMatrix(_m4.makeBasis(r,u,f.clone().negate()))}
function startEntry(p){if(S.entry||S.dead||mode!='space')return;S.entry={p,t:0,c:new V3(p.x,p.y,p.z)};S.docked=null;toast('Entrée atmosphérique — accroche-toi !');SFX.alarm()}
function entryUpdate(dt){const E=S.entry;E.t+=dt;const R=E.p.r;_v.copy(S.pos).sub(E.c);const dist=_v.length(),up=_v.clone().divideScalar(dist);
const tg=E.c.clone().addScaledVector(up,R*.97),dir=tg.sub(S.pos).normalize();const qt=basisQ(dir,_u.set(0,1,0).applyQuaternion(S.q));S.q.slerp(qt,damp(2.6,dt));
const remain=Math.max(0,dist-R*1.06);S.spd=clamp(remain/Math.max(.3,3.3-E.t),90,1100);fwd();S.vel.copy(_f).multiplyScalar(S.spd);S.pos.addScaledVector(S.vel,dt);
S.heat=clamp(1-(dist-R)/(R*.42),0,1)*clamp(E.t*1.5,0,1);shake=Math.max(shake,S.heat*.7);S.thr=.4;
if(S.heat>.05&&Math.random()<S.heat){_r.set(1,0,0).applyQuaternion(S.q);_u.set(0,1,0).applyQuaternion(S.q);for(let i=0;i<2;i++){const sd=i?1:-1,n=S.pos.clone().addScaledVector(_f,2).addScaledVector(_r,sd*(6+Math.random()*3)).addScaledVector(_u,rv(2));FIRE.emit(n.x,n.y,n.z,-_f.x*220+_r.x*sd*25,-_f.y*220+_r.y*sd*25,-_f.z*220+_r.z*sd*25,.18+Math.random()*.2,.75*S.heat,.24*S.heat,.04,.3)}}
if(dist<R*1.075||E.t>4.6){FADE.tg=1;FADE.col='255,236,212';FADE.sp=2.8}
if(FADE.v>.985&&FADE.tg==1){const p=E.p;S.entry=null;S.heat=0;clearFX();SURF.enter(p,true);FADE.tg=0;FADE.sp=.75}}
// ----- décollage -----
function startAscent(){if(S.ascent||mode!='surf'||S.dead)return;S.ascent={t:0};toast('Décollage — cap vers l\'espace');SFX.buy()}
function ascentUpdate(dt){const A=S.ascent;A.t+=dt;fwd();const flat=new V3(_f.x,0,_f.z);if(flat.lengthSq()<1e-4)flat.set(0,0,-1);flat.normalize();const f=flat.multiplyScalar(Math.cos(1.05)).add(new V3(0,Math.sin(1.05),0)).normalize();
S.q.slerp(basisQ(f,new V3(0,1,0)),damp(2.2,dt));S.spd=lerp(S.spd,460,damp(1.1,dt));fwd();S.vel.copy(_f).multiplyScalar(S.spd);S.pos.addScaledVector(S.vel,dt);S.thr=2.4;shake=Math.max(shake,.25);
if(S.pos.y>1000||A.t>3.4){FADE.tg=1;FADE.col='230,240,255';FADE.sp=2.4}
if(FADE.v>.985&&FADE.tg==1){S.ascent=null;clearFX();SURF.exit();S.spd=cruise()*1.8;FADE.tg=0;FADE.sp=.9}}
