// ===== DÉGÂTS VISIBLES : morceaux qui se détachent, moteur qui crachote, boucliers ennemis qui scintillent, traces brûlantes sur les astéroïdes et les stations bombardées =====
const D3={parts:[],scor:[],hx:null,sph:new THREE.SphereGeometry(1,32,20),pl:new THREE.PlaneGeometry(1,1),st:new Map()};
// ----- boucliers des gros ennemis (lourds, boss, porte-chasseurs, police, chasseurs de primes) : actifs tant qu'il leur reste plus de la moitié de la coque -----
function d3Hex(){if(D3.hx)return D3.hx;const c=mkC(256,256),g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,256,256);g.strokeStyle='#fff';g.lineWidth=3;const R=21,h=R*Math.sqrt(3);
for(let row=-1;row<9;row++)for(let col=-1;col<9;col++){const x=col*R*1.5,y=row*h+(col%2?h/2:0);g.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU;g.lineTo(x+Math.cos(a)*R*.92,y+Math.sin(a)*R*.92)}g.closePath();g.stroke()}
const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return D3.hx=t}
const D3SH_V='varying vec3 d3N,d3V,d3P;varying vec2 d3U;void main(){d3U=uv;d3P=normalize(position);vec4 mv=modelViewMatrix*vec4(position,1.);d3N=normalize(normalMatrix*normal);d3V=-mv.xyz;gl_Position=projectionMatrix*mv;}';
const D3SH_F='uniform sampler2D d3hx;uniform vec3 d3c,d3hp;uniform float d3op,d3ht;varying vec3 d3N,d3V,d3P;varying vec2 d3U;void main(){float f=pow(1.-abs(dot(normalize(d3N),normalize(d3V))),2.2);float hx=texture2D(d3hx,d3U*vec2(8.,4.)).r;float d=distance(d3P,d3hp);float rg=smoothstep(.18,0.,abs(d-d3ht*1.7))*(1.-d3ht);float sp=smoothstep(.55,0.,d)*(1.-d3ht);float a=(f*.45+hx*(.12+sp*.8)+rg*1.1+sp*.35)*d3op;gl_FragColor=vec4(d3c*(.55+hx*.7+rg*.9),a);}';
function d3Shielded(e){return!!(e.ty=='lourd'||e.boss||e.carrier||e.kind=='police'||e.kind=='hunter')}
function d3Bubble(e){if(e.d3b)return e.d3b;const m=new THREE.Mesh(D3.sph,new THREE.ShaderMaterial({uniforms:{d3hx:{value:d3Hex()},d3c:{value:new THREE.Color(e.kind=='police'?0x6fb8ff:e.boss?0xc890ff:0x7fd8ff)},d3hp:{value:new V3(0,0,1)},d3op:{value:0},d3ht:{value:1}},vertexShader:D3SH_V,fragmentShader:D3SH_F,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
m.userData.noAO=1;m.visible=false;const s=(e.sz||12)*1.45/Math.max(.01,e.mesh.scale.x);m.scale.setScalar(s);e.mesh.add(m);return e.d3b=m}
function d3ShieldHit(e,p){const b=d3Bubble(e),u=b.material.uniforms;b.visible=true;u.d3op.value=1;u.d3ht.value=0;const lp=e.mesh.worldToLocal(p.clone()).normalize();u.d3hp.value.copy(lp);try{fxGlow(p,0x9fe0ff,(e.sz||12)*.7,.22,1.6)}catch(x){}}
function d3ShieldBreak(e){const b=e.d3b;if(b){b.visible=false}try{const c=e.pos.clone();boom3(c,DESK?40:20,0x8fd8ff,160);fxGlow(c,0x8fd8ff,(e.sz||12)*3.2,.4,2.6);tone(900,180,.35,'sawtooth',.04)}catch(x){}e.d3sb=1}
// ----- morceaux qui se détachent -----
function d3Detach(e){const body=e.mesh.userData.body||e.mesh,bar=e.mesh.userData.bar,c=[];body.updateMatrixWorld(true);
body.traverse(o=>{if(!o.isMesh||o===bar||o===e.d3b||o.userData.noAO||(bar&&bar.children&&bar.children.includes(o)))return;const m=o.material;if(!m||m.transparent||m.blending===THREE.AdditiveBlending)return;if(o.userData.d3gone)return;if(!o.geometry.boundingSphere)o.geometry.computeBoundingSphere();const lp=body.worldToLocal(o.getWorldPosition(new V3()));c.push({o,k:Math.abs(lp.x)+o.geometry.boundingSphere.radius*.2})});
if(c.length<4)return;c.sort((a,b)=>b.k-a.k);const pick=c[Math.random()<.6?0:Math.min(c.length-1,1+(Math.random()*2|0))].o;pick.userData.d3gone=1;const sc=curScene();sc.attach(pick);
const out=pick.position.clone().sub(e.pos).normalize();D3.parts.push({o:pick,v:out.multiplyScalar(25+Math.random()*35).addScaledVector(e.vel||new V3(),.35),w:new V3(rv(4),rv(4),rv(4)),l:6,sm:0,sc});
try{boom3(pick.position,DESK?20:12,0xffb060,90);SFX.boom()}catch(x){}}
function d3Parts(dt){for(let i=D3.parts.length-1;i>=0;i--){const q=D3.parts[i];q.l-=dt;if(q.l<=0||q.o.parent!==curScene()){if(q.o.parent)q.o.parent.remove(q.o);D3.parts.splice(i,1);continue}
q.o.position.addScaledVector(q.v,dt);q.v.multiplyScalar(Math.pow(.85,dt));q.o.rotation.x+=q.w.x*dt;q.o.rotation.y+=q.w.y*dt;q.o.rotation.z+=q.w.z*dt;q.sm-=dt;if(q.sm<=0){q.sm=.08;try{smokePuff(q.o.position,new V3(rv(3),rv(3),rv(3)),2.5,1.1);if(q.l>3.5)FIRE.emit(q.o.position.x,q.o.position.y,q.o.position.z,rv(3),rv(3),rv(3),.3,1,.5,.15,.45)}catch(x){}}
if(q.l<1)q.o.scale.multiplyScalar(Math.pow(.25,dt))}}
// ----- par image : boucliers, morceaux, moteur qui crachote -----
const _d3a=new V3();
function d3Tick(dt){d3Parts(dt);d3Scorch(dt);if(mode!='space')return;
for(const e of en){if(e.dead||!e.mhp)continue;const k=e.hp/e.mhp;
if(e.d3b&&e.d3b.visible){const u=e.d3b.material.uniforms;u.d3ht.value=Math.min(1,u.d3ht.value+dt*2.2);u.d3op.value=Math.max(0,u.d3op.value-dt*1.8);if(u.d3op.value<=0)e.d3b.visible=false}
if(d3Shielded(e)&&!e.d3sb&&k<.5)d3ShieldBreak(e);
const big=e.ty=='lourd'||e.boss||e.carrier;e.d3l=e.d3l||0;if(e.d3l<1&&k<.6){e.d3l=1;if(big||Math.random()<.5)d3Detach(e)}if(e.d3l<2&&k<.3){e.d3l=2;d3Detach(e)}
// moteur qui crachote : petites détonations à l'arrière, tremblements
if(k<.35&&Math.random()<dt*1.6){_d3a.copy(e.pos).addScaledVector(e.dir||_d3a.set(0,0,1),-(e.sz||10)*.8);try{boom3(_d3a,DESK?10:6,0xff9040,45);smokePuff(_d3a,new V3(rv(4),rv(4),rv(4)),(e.sz||10)*.5,1.6,0x151515);if(_d3a.distanceTo(S.pos)<500)noise(.12,.3,500)}catch(x){}}
if(k<.35&&e.mesh.userData.body)e.mesh.userData.body.rotation.z+=Math.sin(t*23+e.sz)*.04+(Math.random()-.5)*.03}}
TICK.push(d3Tick);
{const _he=hitEnemy;hitEnemy=function(e,d,p){try{if(e&&!e.dead&&d3Shielded(e)&&!e.d3sb&&e.hp>e.mhp*.5&&p)d3ShieldHit(e,p)}catch(x){}_he(e,d,p)}}
// ----- traces brûlantes : astéroïdes touchés, stations bombardées -----
function d3SootTex(){if(D3.soot)return D3.soot;const c=mkC(128,128),g=c.getContext('2d'),r=rng(77);g.translate(64,64);for(let i=0;i<16;i++){const a=r()*TAU,d=r()*24,x=Math.cos(a)*d,y=Math.sin(a)*d,R=18+r()*26,gr=g.createRadialGradient(x,y,0,x,y,R);gr.addColorStop(0,'rgba(8,6,5,.5)');gr.addColorStop(1,'rgba(8,6,5,0)');g.fillStyle=gr;g.beginPath();g.arc(x,y,R,0,TAU);g.fill()}
for(let i=0;i<9;i++){const a=r()*TAU;g.strokeStyle='rgba(10,8,6,.45)';g.lineWidth=1+r()*2;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*(30+r()*30),Math.sin(a)*(30+r()*30));g.stroke()}return D3.soot=new THREE.CanvasTexture(c)}
function d3Hot(){if(D3.hot)return D3.hot;const c=mkC(64,64),g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,30);gr.addColorStop(0,'rgba(255,230,160,1)');gr.addColorStop(.35,'rgba(255,130,40,.8)');gr.addColorStop(1,'rgba(255,60,10,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return D3.hot=new THREE.CanvasTexture(c)}
function d3Mark(par,p,n,size,life){if(!par)return;par.updateMatrixWorld(true);const ws=new V3();par.getWorldScale(ws);const s=size/Math.max(.001,ws.x);
const soot=new THREE.Mesh(D3.pl,new THREE.MeshBasicMaterial({map:d3SootTex(),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}));soot.userData.noAO=1;
const hot=new THREE.Mesh(D3.pl,new THREE.MeshBasicMaterial({map:d3Hot(),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-8,polygonOffsetUnits:-8}));hot.userData.noAO=1;hot.scale.setScalar(.55);hot.position.z=.01;soot.add(hot);
const lp=par.worldToLocal(p.clone().addScaledVector(n,size*.02)),ln=par.worldToLocal(p.clone().add(n)).sub(par.worldToLocal(p.clone())).normalize();soot.position.copy(lp);soot.lookAt(lp.clone().add(ln));soot.rotateZ(Math.random()*TAU);soot.scale.setScalar(s);par.add(soot);
D3.scor.push({m:soot,hot,t:0,life});if(D3.scor.length>(DESK?70:40)){const o=D3.scor.shift();o.m.parent&&o.m.parent.remove(o.m);o.m.material.dispose();o.hot.material.dispose()}}
function d3Scorch(dt){for(let i=D3.scor.length-1;i>=0;i--){const q=D3.scor[i];q.t+=dt;q.hot.material.opacity=Math.max(0,1-q.t/2.6);q.hot.visible=q.t<2.6;if(q.t>q.life||!q.m.parent){q.m.parent&&q.m.parent.remove(q.m);q.m.material.dispose();q.hot.material.dispose();D3.scor.splice(i,1)}else if(q.t>q.life-3)q.m.material.opacity=(q.life-q.t)/3}}
{const _ah=astHit;astHit=function(a,d,p){_ah(a,d,p);try{if(a&&a.mesh&&p&&a.mesh.parent&&Math.random()<.7){const n=p.clone().sub(a.pos||a.mesh.position).normalize();d3Mark(a.mesh,p,n,clamp((a.r||10)*.22,1.5,7),45)}}catch(e){}}}
// stations bombardées : brûlures et fumée pendant la pénurie (15 min)
const _d3rc=new THREE.Raycaster();
function d3StationScorch(st){const m=st&&st.mesh;if(!m||!m.parent)return;m.updateMatrixWorld(true);const c=new V3(st.x,st.y,st.z),r=rng((st.x|0)*7+(st.z|0)),meshes=[];m.traverse(o=>{if(o.isMesh&&o.material&&!o.material.transparent&&o.material.blending!==THREE.AdditiveBlending)meshes.push(o)});let n=0;
for(let i=0;i<24&&n<9;i++){const dir=new V3(r()*2-1,(r()*2-1)*.6,r()*2-1).normalize(),o=c.clone().addScaledVector(dir,420);_d3rc.set(o,dir.clone().negate());_d3rc.far=420;const h=_d3rc.intersectObjects(meshes,false)[0];if(!h)continue;
const nn=h.face?h.face.normal.clone().transformDirection(h.object.matrixWorld):dir;d3Mark(h.object,h.point,nn,9+r()*12,15*60);D3.st.get(st.n).pts.push({p:h.point.clone(),n:nn});n++}}
{const _sh=stationHit;stationHit=function(st){_sh(st);try{D3.st.set(st.n,{pts:[],done:0,mesh:st.mesh});d3StationScorch(st);D3.st.get(st.n).done=1}catch(e){console.warn(e)}}}
TICK.push(dt=>{if(mode!='space')return;for(const[n,o]of D3.st){const until=(typeof RAID!='undefined'&&RAID[n])||0;if(Date.now()>until){D3.st.delete(n);continue}const st=stations.find(s=>s.n==n);if(!st||!st.mesh||!st.mesh.parent||st.mesh.position.distanceTo(S.pos)>3000)continue;
if(!o.done||o.mesh!==st.mesh){o.pts=[];o.mesh=st.mesh;d3StationScorch(st);o.done=1}if(o.pts.length&&Math.random()<dt*4){const q=o.pts[Math.random()*o.pts.length|0];try{smokePuff(q.p.clone().addScaledVector(q.n,2),q.n.clone().multiplyScalar(6),10,3,0x1c1a18);if(Math.random()<.3)FIRE.emit(q.p.x,q.p.y,q.p.z,q.n.x*8,q.n.y*8,q.n.z*8,.5,1,.5,.15,1.4)}catch(x){}}}});
// une station déjà sous pénurie au chargement de la partie garde ses brûlures
setTimeout(()=>{try{for(const n in RAID)if(RAID[n]>Date.now())D3.st.set(n,{pts:[],done:0})}catch(e){}},3000);
