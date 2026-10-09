// ===== NOUVELLES PLANÈTES (graphismes 3) : archipels tropicaux, forêts de cristal, ruines anciennes =====
// pvar(p) (gfx.js) choisit la variante ; la vue depuis l'espace est réglée dans ultra.js / gfx.js / gfx3.js, la surface ici.
const W3={ruin:null,beam:null,pts:null};
const W3G={};
function w3Geo(){if(W3G.trunk)return W3G;
// palmier : tronc courbé + palmes retombantes
const tr=new THREE.CylinderGeometry(.16,.3,1,6,8).translate(0,.5,0),tp=tr.attributes.position;for(let i=0;i<tp.count;i++){const y=tp.getY(i);tp.setX(i,tp.getX(i)+y*y*.35)}tr.computeVertexNormals();W3G.trunk=tr;
const fr=[];for(let k=0;k<7;k++){const g=new THREE.PlaneGeometry(.55,2.8,1,5).translate(0,1.4,0),p=g.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i),x=p.getX(i);p.setXYZ(i,x*(1-y/3.2),y*.92,-y*y*.16-Math.abs(x)*.3)}g.rotateX(-Math.PI/2+.5);g.rotateY(k/7*TAU);fr.push({g,m:M4(.35,.98,0,0,0,0,.3,.3,.3),c:C01(110+k*4,.55,.26+(k%2)*.05)})}W3G.frond=mergeG(fr);
// cristal : prisme hexagonal + pointe
W3G.crys=mergeG([{g:new THREE.CylinderGeometry(1,1,1,6).translate(0,.5,0),c:[1,1,1]},{g:new THREE.ConeGeometry(1,.7,6).translate(0,1.35,0),c:[1,1,1]}]);
return W3G}
function w3Inst(sc,geo,mat,list,set){if(!list.length)return null;const m=new THREE.InstancedMesh(geo,mat,list.length),d=new THREE.Object3D(),c=new THREE.Color();list.forEach((o,i)=>{set(d,o);d.updateMatrix();m.setMatrixAt(i,d.matrix);if(o.c){c.copy(o.c);m.setColorAt(i,c)}});m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.castShadow=m.receiveShadow=DESK;sc.add(m);return m}
function w3Spot(r,h,f,tries=60){for(let i=0;i<tries;i++){const x=(r()*2-1)*1350,z=(r()*2-1)*1350,y=h(x,z);if(f(x,z,y))return{x,z,y}}return null}
// ----- archipel -----
function w3Archipel(p,sc,h,r){const G=w3Geo(),pal=[],n=DESK?240:130;for(let i=0;i<n*3&&pal.length<n;i++){const q=w3Spot(r,h,(x,z,y)=>y>1.5&&y<26&&Math.hypot(x,z)>60,8);if(q)pal.push({...q,s:5+r()*4.5,a:r()*TAU,l:(r()-.5)*.25})}
w3Inst(sc,G.trunk,new THREE.MeshStandardMaterial({color:0x8a6a48,roughness:.95}),pal,(d,o)=>{d.position.set(o.x,o.y-.4,o.z);d.rotation.set(o.l,o.a,0);d.scale.set(o.s*.9,o.s,o.s*.9)});
w3Inst(sc,G.frond,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,side:THREE.DoubleSide}),pal,(d,o)=>{d.position.set(o.x,o.y-.4,o.z);d.rotation.set(o.l,o.a,0);d.scale.set(o.s*.9,o.s,o.s*.9)});
// pitons rocheux dans le lagon
const st=[];for(let i=0;i<60&&st.length<26;i++){const q=w3Spot(r,h,(x,z,y)=>y<-3&&y>-40&&Math.hypot(x,z)>120,6);if(q)st.push({...q,s:4+r()*5,hh:14+r()*26,a:r()*TAU,c:new THREE.Color().setHSL(.08,.12,.32+r()*.12)})}
w3Inst(sc,ROCKG[1]||ROCKG[0],new THREE.MeshStandardMaterial({roughness:.95,flatShading:true}),st,(d,o)=>{d.position.set(o.x,o.y+o.hh*.4,o.z);d.rotation.set(0,o.a,0);d.scale.set(o.s,o.hh,o.s)});
// lagon turquoise
sc.traverse(m=>{const u=m.material&&m.material.uniforms;if(u&&u.shallow&&u.deep){u.shallow.value.set(0x3fe6d2);u.deep.value.set(0x0b5d8c)}})}
// ----- forêt de cristal -----
function w3Cristal(p,sc,h,r){const G=w3Geo(),hu=p.hue,A=[],B=[],glow=[];const nc=DESK?34:24;
for(let i=0;i<nc;i++){const q=w3Spot(r,h,(x,z,y)=>y>3&&Math.hypot(x,z)>140,20);if(!q)continue;const k=3+r()*5|0,big=r()<.35;for(let j=0;j<k;j++){const a=r()*TAU,d=j?2+r()*9:0,x=q.x+Math.cos(a)*d,z=q.z+Math.sin(a)*d,y=h(x,z),hh=(big?26:10)+r()*(big?34:16)*(j?.6:1),rr=hh*(.08+r()*.04);
const o={x,z,y,hh,rr,tx:Math.cos(a)*(j?.35:.08),tz:Math.sin(a)*(j?.35:.08),ry:r()*TAU};(r()<.5?A:B).push(o);if(!j){glow.push(x,y+hh*.3,z);if(hh>20)GR.col.push({x,z,r:rr*1.4})}}}
const MA=new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(((hu+40)%360)/360,.7,.62),emissive:new THREE.Color().setHSL(((hu+40)%360)/360,.85,.32),metalness:.1,roughness:.12,transparent:true,opacity:.9}),MB=MA.clone();MB.color.setHSL(.52,.75,.66);MB.emissive.setHSL(.53,.9,.3);
const set=(d,o)=>{d.position.set(o.x,o.y-1.5,o.z);d.rotation.set(o.tx,o.ry,o.tz);d.scale.set(o.rr,o.hh,o.rr)};w3Inst(sc,G.crys,MA,A,set);w3Inst(sc,G.crys,MB,B,set);
// éclats au sol
const sm=[];for(let i=0;i<(DESK?260:140);i++){const q=w3Spot(r,h,(x,z,y)=>y>2,6);if(q)sm.push({...q,s:.6+r()*1.6,a:r()*TAU,t:(r()-.5)*.8,c:r()<.5?MA.color:MB.color})}
w3Inst(sc,G.crys,new THREE.MeshStandardMaterial({emissive:0x4a2a70,roughness:.2,metalness:.1}),sm,(d,o)=>{d.position.set(o.x,o.y-.3,o.z);d.rotation.set(o.t,o.a,o.t*.6);d.scale.set(o.s*.35,o.s*2,o.s*.35)});
// halos lumineux (un seul appel de dessin)
if(glow.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(glow,3));const pt=new THREE.Points(g,new THREE.PointsMaterial({map:GLOW,size:38,color:new THREE.Color().setHSL(((hu+40)%360)/360,.8,.6),transparent:true,opacity:.55,blending:ADDB,depthWrite:false}));pt.frustumCulled=false;sc.add(pt)}}
// ----- ruines anciennes -----
function w3Ruines(p,sc,h,r){let best=null;for(let k=0;k<80;k++){const a=r()*TAU,d=420+r()*480,x=Math.cos(a)*d,z=-Math.abs(Math.sin(a)*d)-150,y=h(x,z);if(y<10)continue;let sl=0;for(const[dx,dz]of[[40,0],[-40,0],[0,40],[0,-40],[30,30],[-30,-30]])sl=Math.max(sl,Math.abs(h(x+dx,z+dz)-y));if(!best||sl<best.sl)best={x,z,y,sl}}if(!best)return;
const cx=best.x,cz=best.z,cy=best.y,ty=ptype(p),stone=ty=='Jungle'?[.42,.46,.38]:[.72,.6,.44],dark=stone.map(v=>v*.7),parts=[],glyph=[];
// pyramide à degrés
for(let i=0;i<5;i++){const w=44-i*8,y0=cy-6+i*6.5;parts.push({g:new THREE.BoxGeometry(w,i?6.5:12.5,w),m:M4(cx,y0+(i?3.25:0),cz),c:i%2?dark:stone});
for(const s of[0,1,2,3]){const a=s*Math.PI/2,ox=Math.sin(a)*(w/2+.06),oz=Math.cos(a)*(w/2+.06);glyph.push({g:new THREE.BoxGeometry(w*.7,.5,.12),m:M4(cx+ox,i?y0+4.5:cy-1.2,cz+oz,0,a,0),c:[1,1,1]})}}
const top=cy-6+5*6.5;parts.push({g:new THREE.BoxGeometry(8,7,8),m:M4(cx,top+3.5,cz),c:stone},{g:new THREE.ConeGeometry(6.2,5,4),m:M4(cx,top+9.5,cz,0,Math.PI/4,0),c:dark});
// escalier
parts.push({g:new THREE.BoxGeometry(8,30,30),m:M4(cx,cy+5,cz+22,-.78,0,0),c:dark});
// obélisques en cercle (certains tombés)
const obs=[];for(let i=0;i<10;i++){const a=i/10*TAU+.2,d=68+r()*8,x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d,y=h(x,z),fall=r()<.3;obs.push([x,z]);if(fall)parts.push({g:new THREE.CylinderGeometry(1.2,2.1,24,4),m:M4(x,y+1.5,z,Math.PI/2,a,0),c:dark});else{parts.push({g:new THREE.CylinderGeometry(1.2,2.1,24,4),m:M4(x,y+11,z,0,Math.PI/4,0),c:stone},{g:new THREE.ConeGeometry(1.4,3,4),m:M4(x,y+24.5,z,0,Math.PI/4,0),c:dark});glyph.push({g:new THREE.BoxGeometry(.4,10,.4),m:M4(x+Math.cos(a)*1.6,y+12,z+Math.sin(a)*1.6),c:[1,1,1]});GR.col.push({x,z,r:2.6})}}
// colonnes brisées le long de l'avenue
for(let i=0;i<14;i++){const s=i%2?1:-1,z=cz+40+(i>>1)*16,x=cx+s*14,y=h(x,z),hh=3+r()*12;parts.push({g:new THREE.CylinderGeometry(1.4,1.6,hh,8),m:M4(x,y+hh/2-.5,z),c:stone})}
// grand portail
const gz=cz+150,gy=h(cx,gz);parts.push({g:new THREE.TorusGeometry(15,2.4,8,28,Math.PI),m:M4(cx,gy+1,gz),c:stone},{g:new THREE.BoxGeometry(5,6,5),m:M4(cx-15,gy+1,gz),c:dark},{g:new THREE.BoxGeometry(5,6,5),m:M4(cx+15,gy+1,gz),c:dark});GR.col.push({x:cx-15,z:gz,r:3.5},{x:cx+15,z:gz,r:3.5});
const RM=new THREE.Mesh(mergeG(parts),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,flatShading:true}));RM.castShadow=RM.receiveShadow=DESK;sc.add(RM);
const GM=new THREE.Mesh(mergeG(glyph),new THREE.MeshBasicMaterial({color:0x5ff2ff}));sc.add(GM);
// voile du portail
const PU={tm:TM},pm=new THREE.Mesh(new THREE.CircleGeometry(12.6,32,0,Math.PI),new THREE.ShaderMaterial({uniforms:PU,vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float tm;varying vec2 vUv;void main(){vec2 d=vUv-vec2(.5,0.);float r=length(d)*2.;float w=sin(r*22.-tm*3.)*.5+.5;float a=(.18+.35*w)*smoothstep(1.,.7,r);gl_FragColor=vec4(vec3(.3,.9,1.)*a,1.);}',transparent:true,blending:ADDB,depthWrite:false,side:THREE.DoubleSide}));pm.position.set(cx,gy+1,gz);sc.add(pm);
GR.col.push({x:cx,z:cz,r:24});
// faisceau visible de loin tant que les ruines ne sont pas explorées
const done=GX('ruin',{})[p.name];let beam=null;if(!done){beam=new THREE.Mesh(new THREE.CylinderGeometry(3,7,900,16,1,true).translate(0,450,0),new THREE.ShaderMaterial({vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float tm;varying vec2 vUv;void main(){float a=pow(1.-vUv.y,1.5)*(.55+.2*sin(vUv.y*40.-tm*4.));gl_FragColor=vec4(vec3(.35,.9,1.)*a,1.);}',uniforms:{tm:TM},transparent:true,blending:ADDB,depthWrite:false,side:THREE.DoubleSide,fog:false}));beam.position.set(cx,top+12,cz);beam.frustumCulled=false;sc.add(beam)}
W3.ruin={p:p.name,x:cx,z:cz,y:top+8,beam,zone:Math.min(4,Math.floor(Math.hypot(p.x,p.y,p.z)/9000))}}
function w3Enter(p){W3.ruin=null;const pv=pvar(p);if(!pv)return;const sc=SURF.scene,h=SURF.height,r=rng(seedOf(p.x,p.y,p.z,61));w3Geo();
if(pv=='archipel')w3Archipel(p,sc,h,r);else if(pv=='cristal')w3Cristal(p,sc,h,r);else if(pv=='ruines')w3Ruines(p,sc,h,r);
const seen=GX('pvs',{});if(!seen[p.name]){seen[p.name]=1;setTimeout(()=>banner(pv=='archipel'?'star':pv=='cristal'?'star':'star',PVARN[pv]+' — '+p.name,pv=='ruines'?'Un faisceau signale des ruines : va les explorer !':pv=='archipel'?'Lagons turquoise et palmiers à perte de vue':'Des cristaux géants poussent ici','#5ff2ff'),1800)}}
{const _seW3=SURF.enter;SURF.enter=function(p,entry){_seW3(p,entry);try{w3Enter(p)}catch(e){console.warn(e)}}}
TICK.push(dt=>{const R=W3.ruin;if(!R||mode!='surf'||GX('ruin',{})[R.p])return;const P=FOOT.on?(FOOT.model?FOOT.model.position:FOOT.pos):ship.position;if(Math.hypot(P.x-R.x,P.z-R.z)<62&&Math.abs(P.y-R.y)<70){G.x.ruin[R.p]=1;const cr=350+R.zone*150;G.cr+=cr;try{gainXP(120)}catch(e){}try{addRep('carto',30)}catch(e){}try{SFX.win()}catch(e){}banner('star','Ruines anciennes explorées','+'+cr+' ¢ · les traces d\'une civilisation disparue','#5ff2ff');try{cxLog('Ruines anciennes explorées sur '+R.p)}catch(e){}if(R.beam){R.beam.visible=false}}});
