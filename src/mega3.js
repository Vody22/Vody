// ===== MÉGA-STRUCTURES (anneau orbital, sphère de Dyson en construction, chantier naval) et BATAILLES DE FLOTTES AU LOIN =====
const MG3={L:[],t:0};
// emplacements fixes, choisis dans la galaxie générée (identiques pour tous les joueurs)
function mg3Find(test,cx0,cz0,R){for(let d=0;d<=R;d++)for(let cx=cx0-d;cx<=cx0+d;cx++)for(let cz=cz0-d;cz<=cz0+d;cz++){if(Math.max(Math.abs(cx-cx0),Math.abs(cz-cz0))!==d)continue;for(const cy of[0]){const c=cdata(cx,cy,cz),r=test(c);if(r)return r}}return null}
{const ring=mg3Find(c=>c.pl&&!c.pl.ring&&Math.hypot(c.cx,c.cz)>=3?c.pl:null,-4,3,6),dy=mg3Find(c=>c.sun&&Math.hypot(c.cx,c.cz)>=4?c.sun:null,7,-4,8),
yard=mg3Find(c=>c.st&&Math.hypot(c.cx,c.cz)>=2?c.st:null,2,4,6);
if(ring)MG3.L.push({k:'ring',n:'Anneau orbital de '+ring.name,host:ring,c:new V3(ring.x,ring.y,ring.z),vis:32000});
if(dy)MG3.L.push({k:'dyson',n:'Sphère de Dyson (en construction)',host:dy,c:new V3(dy.x,dy.y,dy.z),vis:40000});
if(yard){const a=h3(yard.x|0,0,yard.z|0,71)*TAU;MG3.L.push({k:'yard',n:'Chantier naval de '+yard.n,host:yard,c:new V3(yard.x+Math.cos(a)*1700,yard.y+250,yard.z+Math.sin(a)*1700),vis:26000})}}
function mg3Win(seed,dens){const c=mkC(256,64),g=c.getContext('2d'),r=rng(seed);g.fillStyle='#000';g.fillRect(0,0,256,64);for(let i=0;i<dens;i++){const x=r()*256|0,y=r()*64|0;g.fillStyle=r()<.8?'#ffd890':'#9fd8ff';g.globalAlpha=.5+r()*.5;g.fillRect(x,y,2+(r()*3|0),2)}g.globalAlpha=1;const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
function mg3Metal(seed,rx,ry){const t=panelTex('#7c8694','#3a424e',256,128,seed);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);return t}
// ----- anneau orbital : couronne habitée qui tourne, ascenseurs spatiaux, modules d'amarrage -----
function mg3Ring(M){const P=M.host,R=P.r*2.15,g=new THREE.Group(),win=mg3Win(11,900);win.repeat.set(60,1);const met=mg3Metal(12,90,2);
const mat=new THREE.MeshStandardMaterial({map:met,color:0xc8d0dc,metalness:.6,roughness:.45,emissive:0xffffff,emissiveMap:win,emissiveIntensity:1.2});
const tor=new THREE.Mesh(new THREE.TorusGeometry(R,48,14,220),mat);g.add(tor);
const dk=new THREE.MeshStandardMaterial({color:0x3a4250,metalness:.7,roughness:.4}),lt=new THREE.MeshBasicMaterial({color:0x7fd0ff});
for(let i=0;i<12;i++){const a=i/12*TAU,b=new THREE.Mesh(new THREE.BoxGeometry(160,130,120),dk);b.position.set(Math.cos(a)*R,Math.sin(a)*R,0);b.rotation.z=a;g.add(b);const l=new THREE.Mesh(new THREE.BoxGeometry(170,8,126),lt);l.position.copy(b.position);l.rotation.z=a;g.add(l)}
for(let i=0;i<4;i++){const a=i/4*TAU+.4,len=R-P.r,cy=new THREE.Mesh(new THREE.CylinderGeometry(9,9,len,8),dk);cy.position.set(Math.cos(a)*(P.r+len/2),Math.sin(a)*(P.r+len/2),0);cy.rotation.z=a-Math.PI/2;g.add(cy);
for(let k=1;k<4;k++){const s=sprite(0xffd060,40,.9);s.position.set(Math.cos(a)*(P.r+len*k/4),Math.sin(a)*(P.r+len*k/4),0);g.add(s)}}
g.position.copy(M.c);g.rotation.set(Math.PI/2-.32,0,.2);M.spin=tor;M.sp=.004;return g}
// ----- sphère de Dyson : panneaux hexagonaux sur une partie de la coque, échafaudages, drones de construction -----
function mg3Dyson(M){const s=M.host,R=s.r*4.2,g=new THREE.Group(),N=DESK?320:220,pts=[],r=rng(4401),ax=new V3(.3,1,.2).normalize();
for(let i=0;i<N;i++){const y=1-(i+.5)/N*2,rr=Math.sqrt(1-y*y),a=i*2.399963;pts.push(new V3(Math.cos(a)*rr,y,Math.sin(a)*rr))}
const done=pts.map(p=>p.dot(ax)>-.15&&r()<.78);const hexR=R*Math.sqrt(4*Math.PI/N)*.56;
const hc=mkC(128,128),hg=hc.getContext('2d');hg.fillStyle='#000';hg.fillRect(0,0,128,128);hg.strokeStyle='#ffb040';hg.lineWidth=6;hg.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU;hg.lineTo(64+Math.cos(a)*58,64+Math.sin(a)*58)}hg.closePath();hg.stroke();
const pm=new THREE.MeshStandardMaterial({color:0x2a2622,metalness:.85,roughness:.35,emissive:0xffffff,emissiveMap:new THREE.CanvasTexture(hc),emissiveIntensity:1.1});
const geo=new THREE.CylinderGeometry(hexR,hexR,hexR*.08,6);geo.rotateX(Math.PI/2);const cnt=done.filter(x=>x).length,im=new THREE.InstancedMesh(geo,pm,cnt),d=new THREE.Object3D();let k=0;
pts.forEach((p,i)=>{if(!done[i])return;d.position.copy(p).multiplyScalar(R);d.lookAt(0,0,0);d.rotateZ(r()*TAU);d.updateMatrix();im.setMatrixAt(k++,d.matrix)});g.add(im);
// échafaudage entre les points restants
const lp=[];pts.forEach((p,i)=>{if(done[i])return;const nn=pts.map((q,j)=>[q.distanceToSquared(p),j]).sort((a,b)=>a[0]-b[0]).slice(1,4);for(const[,j]of nn){lp.push(p.x*R,p.y*R,p.z*R,pts[j].x*R,pts[j].y*R,pts[j].z*R)}});
const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.BufferAttribute(new Float32Array(lp),3));g.add(new THREE.LineSegments(lg,new THREE.LineBasicMaterial({color:0xffa040,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false})));
M.dr=[];for(let i=0;i<(DESK?24:12);i++){const sp=sprite(0xffe0a0,60,1);sp.material=sp.material.clone();g.add(sp);M.dr.push({s:sp,a:pts[r()*N|0].clone().multiplyScalar(R*1.03),b:pts[r()*N|0].clone().multiplyScalar(R*1.03),k:r()})}
g.position.copy(M.c);M.spin=g;M.sp=.0015;M.R=R;return g}
// ----- chantier naval : portique, cuirassé à moitié construit, projecteurs, drones -----
function mg3Yard(M){const g=new THREE.Group(),L=900,W=260,met=mg3Metal(21,12,2),gm=new THREE.MeshStandardMaterial({map:met,color:0xb8c0cc,metalness:.6,roughness:.45}),dk=new THREE.MeshStandardMaterial({color:0x2c323c,metalness:.7,roughness:.45}),
haz=new THREE.MeshStandardMaterial({color:0xe8b830,metalness:.3,roughness:.6}),add=(geo,m,x,y,z,rx=0,ry=0,rz=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);g.add(o);return o};
for(const[x,y]of[[-W/2,-W/2],[W/2,-W/2],[-W/2,W/2],[W/2,W/2]])add(new THREE.BoxGeometry(16,16,L),gm,x,y,0);
for(let i=0;i<=9;i++){const z=-L/2+i*L/9;add(new THREE.BoxGeometry(W,12,12),i%3?gm:haz,0,-W/2,z);add(new THREE.BoxGeometry(W,12,12),gm,0,W/2,z);add(new THREE.BoxGeometry(12,W,12),gm,-W/2,0,z);add(new THREE.BoxGeometry(12,W,12),gm,W/2,0,z)}
// coque du cuirassé : avant terminé, arrière en membrures
const hull=new THREE.Mesh(new THREE.LatheGeometry([[0,-420],[40,-380],[85,-300],[105,-180],[110,-40],[108,0]].map(p=>new THREE.Vector2(p[0],p[1])),28),new THREE.MeshStandardMaterial({map:mg3Metal(23,8,4),color:0x8a96a8,metalness:.6,roughness:.4,emissive:0xffffff,emissiveMap:mg3Win(24,260),emissiveIntensity:.8}));hull.rotation.x=Math.PI/2;g.add(hull);
for(let i=0;i<9;i++){const z=20+i*44,rib=new THREE.Mesh(new THREE.TorusGeometry(108-i*4,6,6,30),dk);rib.position.z=z;g.add(rib)}add(new THREE.BoxGeometry(14,14,420),dk,0,-100,210);add(new THREE.BoxGeometry(14,14,420),dk,0,100,210);
add(new THREE.BoxGeometry(60,80,120),gm,0,130,-120);
M.lt=[];for(let i=0;i<10;i++){const s=sprite(i%2?0xfff0c0:0xff9a40,i%2?50:30,.9);s.material=s.material.clone();s.position.set((i%2?1:-1)*W/2,(i%4<2?1:-1)*W/2,-L/2+i*L/10);g.add(s);M.lt.push(s)}
M.dr=[];for(let i=0;i<(DESK?10:6);i++){const d=new THREE.Mesh(new THREE.BoxGeometry(8,4,8),haz);g.add(d);const sp=sprite(0x9fe0ff,22,1);sp.material=sp.material.clone();d.add(sp);M.dr.push({m:d,sp,ph:i*1.7,r:120+i*9,z:100+i*30})}
g.position.copy(M.c);const st=M.host;g.lookAt(st.x,st.y+250,st.z);return g}
// ----- chargement / déchargement selon la distance, animation, découverte -----
function mg3Tick(dt){MG3.t+=dt;if(mode!='space'){return}const me=S.pos;
for(const M of MG3.L){const d=M.c.distanceTo(me);if(!M.g&&d<M.vis){try{M.g=M.k=='ring'?mg3Ring(M):M.k=='dyson'?mg3Dyson(M):mg3Yard(M);M.g.traverse(o=>{o.userData.noAO=1});scene.add(M.g)}catch(e){console.warn(e);M.vis=0}}
else if(M.g&&d>M.vis*1.15){scene.remove(M.g);M.g.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material&&o.material.map&&!o.isSprite)o.material.map.dispose()});M.g=null}
if(!M.g)continue;if(M.spin)M.spin.rotation.z+=dt*M.sp;
if(M.k=='dyson'){for(const q of M.dr){q.k+=dt*.05;if(q.k>1){q.k=0;q.a.copy(q.b);const p=new V3(rv(1),rv(1),rv(1)).normalize().multiplyScalar(M.R*1.03);q.b.copy(p)}q.s.position.copy(q.a).lerp(q.b,q.k);q.s.material.opacity=.6+.4*Math.sin(MG3.t*9+q.k*20)}}
if(M.k=='yard'){for(const q of M.dr){const a=MG3.t*.25+q.ph;q.m.position.set(Math.cos(a)*q.r,Math.sin(a)*q.r,q.z+Math.sin(MG3.t*.3+q.ph)*60);q.sp.material.opacity=Math.sin(MG3.t*11+q.ph)>.4?1:.15;
if(d<2500&&Math.random()<dt*.8){const wp=q.m.getWorldPosition(new V3());SPK.emit(wp.x,wp.y,wp.z,rv(30),rv(30),rv(30),.6,.8,.9,1,1.2)}}for(const s of M.lt)s.material.opacity=.6+.3*Math.sin(MG3.t*2+s.position.z)}
if(d<(M.k=='dyson'?14000:9000)){const seen=GX('mega',{});if(!seen[M.k]){seen[M.k]=1;banner('star','Découverte : '+M.n,M.k=='ring'?'Des millions d\'habitants vivent dans cette couronne qui tourne autour de la planète.':M.k=='dyson'?'Une civilisation enferme une étoile dans une coque géante pour capter toute son énergie.':'Un cuirassé est en construction, entouré de drones de soudure.','#9fd8ff');try{gainXP(80)}catch(e){}}}}
btTick(dt)}
TICK.push(mg3Tick);
{const _ov=overlay;overlay=function(){_ov();if(mode!='space'||S.dead||(typeof H3!='undefined'&&H3.on))return;for(const M of MG3.L){if(!M.g)continue;const d=M.c.distanceTo(S.pos);if(d<M.vis)label({x:M.c.x,y:M.c.y+(M.k=='dyson'?M.R*1.1:M.k=='ring'?M.host.r*2.4:300),z:M.c.z},M.n+' · '+(d/1000).toFixed(1)+' km','#9fd8ff',M.vis)}
if(BT.on&&!BT.done){const d=BT.c.distanceTo(S.pos);const s=proj(BT.c);if(s.front&&s.x>0&&s.x<innerWidth&&s.y>0&&s.y<innerHeight)label({x:BT.c.x,y:BT.c.y+900,z:BT.c.z},'⚔ Bataille · '+(d/1000).toFixed(1)+' km','#ffb060',40000);else edgeMarker(BT.c,'#ffb060','Bataille '+(d/1000).toFixed(0)+' km','⚔')}}}
// ----- batailles au loin : éclairs, tirs, explosions ; en t'approchant tu rejoins le combat -----
const BT={on:false,slot:-1,c:new V3(),g:null,fx:[],ln:null,lp:null,t:0,done:false,said:0};
function btBuild(){const g=new THREE.Group();for(let i=0;i<(DESK?26:16);i++){const s=sprite(0xffffff,100,0);s.material=s.material.clone();s.visible=false;g.add(s);BT.fx.push({s,l:0,ml:1})}
const n=DESK?24:14,pos=new Float32Array(n*6),col=new Float32Array(n*6),geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));
BT.ln=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false}));BT.ln.frustumCulled=false;g.add(BT.ln);BT.lp=[];for(let i=0;i<n;i++)BT.lp.push({a:new V3(),d:new V3(),l:0,c:[1,1,1]});
BT.ships=[];for(let i=0;i<8;i++){const m=i<4?buildEnemy(i==0?'lourd':'pirate'):buildAlly(0xdfe6ee,0x2fa8ff);m.scale.setScalar(4);g.add(m);BT.ships.push({m,ph:i*.9,side:i<4?1:-1})}return g}
function btFx(p,col,size,life){const q=BT.fx.find(f=>f.l<=0);if(!q)return;q.l=q.ml=life;q.s.visible=true;q.s.position.copy(p);q.s.scale.setScalar(size);q.s.material.color.setHex(col);q.s.material.opacity=1}
function btTick(dt){const slot=Math.floor(Date.now()/360e3),h=h3(slot,7,3,55);
if(slot!==BT.slot){BT.slot=slot;BT.done=false;BT.said=0;BT.on=h<.55&&mode=='space'&&!S.docked&&danger()>=1;if(BT.on){const a=h3(slot,1,9,56)*TAU;BT.c.set(S.pos.x+Math.cos(a)*11000,S.pos.y+(h3(slot,2,9,57)-.5)*2500,S.pos.z+Math.sin(a)*11000)}}
if(!BT.on||BT.done||mode!='space'){if(BT.g&&BT.g.parent)scene.remove(BT.g);return}const d=BT.c.distanceTo(S.pos);if(d>30000)return;
if(!BT.g)BT.g=btBuild();if(BT.g.parent!==scene)scene.add(BT.g);BT.g.position.copy(BT.c);BT.t+=dt;
if(!BT.said&&!S.docked){BT.said=1;banner('swords','Une bataille fait rage au loin','L\'Alliance affronte des pirates à '+(d/1000).toFixed(0)+' km. Approche-toi pour les aider !','#ffb060')}
// vaisseaux qui tournent autour du centre
for(const q of BT.ships){const a=BT.t*.18*q.side+q.ph;q.m.position.set(Math.cos(a)*(500+q.ph*60),Math.sin(a*1.3)*200,Math.sin(a)*(500+q.ph*60));q.m.lookAt(BT.g.localToWorld(new V3(Math.cos(a+.1*q.side)*(500+q.ph*60),Math.sin((a+.1)*1.3)*200,Math.sin(a+.1*q.side)*(500+q.ph*60))))}
// éclairs et tirs
for(const f of BT.fx){if(f.l<=0)continue;f.l-=dt;f.s.material.opacity=Math.max(0,f.l/f.ml);if(f.l<=0)f.s.visible=false}
if(Math.random()<dt*6)btFx(new V3(rv(700),rv(300),rv(700)),Math.random()<.5?0xffb060:0xff6040,160+Math.random()*220,.25+Math.random()*.3);
if(Math.random()<dt*.35){btFx(new V3(rv(600),rv(250),rv(600)),0xffd8a0,900+Math.random()*600,1.2);if(d<16000)try{tone(50,30,1.4,'sine',.05*(1-d/16000))}catch(e){}}
const P=BT.ln.geometry.attributes.position,C=BT.ln.geometry.attributes.color;BT.lp.forEach((q,i)=>{q.l-=dt;if(q.l<=0){q.l=.25+Math.random()*.5;q.a.set(rv(700),rv(300),rv(700));q.d.set(rv(1),rv(.3),rv(1)).normalize().multiplyScalar(250+Math.random()*350);q.c=Math.random()<.5?[1,.35,.25]:[.4,1,.7]}
const b=q.a.clone().addScaledVector(q.d,(1-q.l*1.5));P.setXYZ(i*2,q.a.x+q.d.x*(.6-q.l),q.a.y+q.d.y*(.6-q.l),q.a.z+q.d.z*(.6-q.l));P.setXYZ(i*2+1,b.x,b.y,b.z);C.setXYZ(i*2,...q.c);C.setXYZ(i*2+1,...q.c)});P.needsUpdate=true;C.needsUpdate=true;
// arrivée sur place : le combat devient réel
if(d<3500&&!S.docked&&!S.dead){BT.done=true;scene.remove(BT.g);const z=Math.max(1,danger()),fw=fwd().clone();for(let i=0;i<3;i++){const e=mkEnemy(i==0&&z>=2?'lourd':'pirate',S.pos.clone().addScaledVector(fw,700).add(new V3(rv(300),rv(120),rv(300))),z);en.push(e)}
for(let i=0;i<2;i++)try{frSpawn({kind:'ally',p:S.pos.clone().addScaledVector(fw,550).add(new V3(rv(200),rv(80),rv(200))),label:'Alliance'})}catch(e){}banner('swords','Tu rejoins la bataille !','Abats les pirates et protège les chasseurs de l\'Alliance','#ffb060');try{SFX.alarm()}catch(e){}}}
