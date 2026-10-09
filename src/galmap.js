// ===== CARTE GALACTIQUE 3D : galaxie spirale, planètes et stations connues, territoires, bases, routes commerciales =====
const GM3={on:false,sc:null,cam:null,yaw:.6,pitch:.75,dist:70,tg:new V3(),items:[],sel:null,pts:{},idle:0,lab:null,lx:null};
const GMK=1/1000;// 1 unité = 1 km
function gm3Galaxy(sc){const n=DESK?9000:4500,pos=new Float32Array(n*3),col=new Float32Array(n*3),r=rng(4242),c=new THREE.Color();
for(let i=0;i<n;i++){const arm=i%2,d=Math.pow(r(),.6)*520,a=d*.012+arm*Math.PI+rv(.45)*(1.2-d/600),h=rv(1)*(10+30*Math.exp(-d/80));pos.set([Math.cos(a)*d+rv(14),h,Math.sin(a)*d+rv(14)],i*3);
c.setHSL(d<90?.1+r()*.05:.58+r()*.12,d<90?.6:.5,.55+r()*.35);col.set([c.r,c.g,c.b],i*3)}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
const p=new THREE.Points(g,new THREE.PointsMaterial({size:2.2,map:GLOW,vertexColors:true,transparent:true,depthWrite:false,blending:ADDB,sizeAttenuation:true})),G2=new THREE.Group();G2.position.set(-270,-3,150);G2.add(p);
const core=sprite(0xffd9a0,200,.4);G2.add(core);const halo=sprite(0x6a5aff,900,.1);G2.add(halo);sc.add(G2);GM3.gal=G2}
function gm3Build(){const sc=new THREE.Scene();GM3.sc=sc;GM3.cam=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,8000);gm3Galaxy(sc);
const it=mapItems().map(o=>({...o,P:new V3(o.x*GMK,(o.y||0)*GMK,o.z*GMK)}));GM3.items=it;
// planètes (sphères colorées), stations (octaèdres dorés), soleils (lueurs)
const pl=it.filter(o=>o.k=='pl'),st=it.filter(o=>o.k=='st'||o.k=='base'),su=it.filter(o=>o.k=='sun'),d=new THREE.Object3D(),c=new THREE.Color();
if(pl.length){const m=new THREE.InstancedMesh(new THREE.SphereGeometry(1,16,10),new THREE.MeshBasicMaterial(),pl.length);pl.forEach((o,i)=>{d.position.copy(o.P);d.scale.setScalar(.35+(o.r||400)/1400);d.updateMatrix();m.setMatrixAt(i,d.matrix);m.setColorAt(i,c.setHSL((o.hue||0)/360,.6,.6))});sc.add(m)}
if(st.length){const m=new THREE.InstancedMesh(new THREE.OctahedronGeometry(.55),new THREE.MeshBasicMaterial({color:0xffc845}),st.length);st.forEach((o,i)=>{d.position.copy(o.P);d.scale.setScalar(1);d.updateMatrix();m.setMatrixAt(i,d.matrix)});sc.add(m);GM3.stm=m}
for(const o of su){const s=sprite(0xffd27a,9,.9);s.position.copy(o.P);sc.add(s)}
// territoires (secteurs de 12 km autour de la zone explorée)
try{const R=Math.ceil(Math.max(30000,...it.map(o=>Math.hypot(o.x,o.z)))/SEC)+1,quads=[],cols=[],cc={alliance:[.25,.55,1],pirates:[1,.25,.2],front:[1,.7,.2]};for(let i=-R;i<R;i++)for(let j=-R;j<R;j++){const k=ctlOf(i+','+j),x0=i*SEC*GMK,z0=j*SEC*GMK,s=SEC*GMK*.96,q=[[x0,z0],[x0+s,z0],[x0+s,z0+s],[x0,z0],[x0+s,z0+s],[x0,z0+s]];for(const[x,z]of q){quads.push(x,-.6,z);cols.push(...cc[k])}}
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(quads,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));sc.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.085,depthWrite:false,side:THREE.DoubleSide})))}catch(e){}
// routes commerciales entre stations visitées (pointillés qui défilent)
const lp=[];for(const a of st){const nb=st.filter(b=>b!==a).sort((b1,b2)=>a.P.distanceTo(b1.P)-a.P.distanceTo(b2.P)).slice(0,2);for(const b of nb)lp.push(a.P.x,a.P.y,a.P.z,b.P.x,b.P.y,b.P.z)}
if(lp.length){const g=new THREE.BufferGeometry(),ln=[];g.setAttribute('position',new THREE.Float32BufferAttribute(lp,3));for(let i=0;i<lp.length/6;i++){const L=Math.hypot(lp[i*6+3]-lp[i*6],lp[i*6+4]-lp[i*6+1],lp[i*6+5]-lp[i*6+2]);ln.push(0,L)}g.setAttribute('ld',new THREE.Float32BufferAttribute(ln,1));
sc.add(new THREE.LineSegments(g,new THREE.ShaderMaterial({uniforms:{tm:TM},vertexShader:'attribute float ld;varying float vL;void main(){vL=ld;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform float tm;varying float vL;void main(){float f=fract(vL*.5-tm*.6);gl_FragColor=vec4(vec3(.35,.95,1.)*(.25+.75*step(.6,f)),1.);}',transparent:true,blending:ADDB,depthWrite:false})))}
// bases du joueur, objectifs, joueur
const mk=(P,col,h)=>{const b=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,h,6).translate(0,h/2,0),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.7,blending:ADDB,depthWrite:false}));b.position.copy(P);sc.add(b);return b};
for(const n in G.bases||{}){const p=G.dpos&&G.dpos[n];if(p){const P=new V3(p[0]*GMK,p[1]*GMK,p[2]*GMK);mk(P,0x4dff8a,4);it.push({k:'bas',n:'Ta base : '+n,P,c:'#4dff8a'})}}
for(const o of it)if(o.k=='mis'||o.k=='story'||o.k=='ev')mk(o.P,o.k=='mis'?0x4dff8a:o.k=='story'?0xc890ff:0xff9a40,7);
const me=new THREE.Group(),cone=new THREE.Mesh(new THREE.ConeGeometry(.5,1.6,10).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x7fe8ff}));me.add(cone);const ring=new THREE.Mesh(new THREE.RingGeometry(1.2,1.45,40).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x7fe8ff,transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false}));me.add(ring);
me.position.set(S.pos.x*GMK,S.pos.y*GMK,S.pos.z*GMK);me.quaternion.copy(S.q);sc.add(me);GM3.me=me;GM3.ring=ring;it.push({k:'me',n:'Toi',P:me.position.clone(),c:'#7fe8ff'});
sc.add(new THREE.AmbientLight(0xffffff,1))}
function gm3UI(){if($('gm3'))return;const d=document.createElement('div');d.id='gm3';d.innerHTML=`<canvas id="gm3c"></canvas><div id="gm3top"><b>GALAXIE</b><span>Glisse pour tourner · pince ou molette pour zoomer · touche un point</span></div><div id="gm3info"></div><div id="gm3btns"><button id="gm3me">Ma position</button><button id="gm3home">Base Alpha</button><button id="gm3x">Carte 2D</button></div>`;document.body.appendChild(d);
GM3.lab=$('gm3c');GM3.lx=GM3.lab.getContext('2d');$('gm3x').onclick=()=>gm3Toggle(false);$('gm3me').onclick=()=>{GM3.tg.copy(GM3.me.position);GM3.dist=40};$('gm3home').onclick=()=>{GM3.tg.set(0,0,0);GM3.dist=70};
const v=GM3.lab;v.addEventListener('pointerdown',e=>{v.setPointerCapture(e.pointerId);GM3.pts[e.pointerId]={x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,t:performance.now()};GM3.idle=0});
v.addEventListener('pointermove',e=>{const P=GM3.pts[e.pointerId];if(!P)return;const ids=Object.keys(GM3.pts);if(ids.length>=2){const[a,b]=ids.map(i=>GM3.pts[i]),d0=Math.hypot(a.x-b.x,a.y-b.y);P.x=e.clientX;P.y=e.clientY;const d1=Math.hypot(a.x-b.x,a.y-b.y);if(d0>0)GM3.dist=clamp(GM3.dist*d0/d1,4,1600);return}GM3.yaw-=(e.clientX-P.x)*.006;GM3.pitch=clamp(GM3.pitch+(e.clientY-P.y)*.005,.08,1.5);P.x=e.clientX;P.y=e.clientY});
v.addEventListener('pointerup',e=>{const P=GM3.pts[e.pointerId];delete GM3.pts[e.pointerId];if(P&&Math.hypot(e.clientX-P.x0,e.clientY-P.y0)<8&&performance.now()-P.t<400)gm3Pick(e.clientX,e.clientY)});v.addEventListener('pointercancel',e=>{delete GM3.pts[e.pointerId]});
v.addEventListener('wheel',e=>{e.preventDefault();GM3.dist=clamp(GM3.dist*(1+Math.sign(e.deltaY)*.12),4,1600)},{passive:false})}
function gm3Proj(P){const v=S3.v.copy(P).project(GM3.cam);return{x:(v.x*.5+.5)*innerWidth,y:(-v.y*.5+.5)*innerHeight,ok:v.z<1}}
function gm3Pick(x,y){let best=null,bd=28;for(const o of GM3.items){const p=gm3Proj(o.P);if(!p.ok)continue;const d=Math.hypot(p.x-x,p.y-y);if(d<bd){bd=d;best=o}}GM3.sel=best;if(best){GM3.tg.copy(best.P);const km=S.pos.distanceTo(new V3(best.P.x/GMK,best.P.y/GMK,best.P.z/GMK))/1000;const ty={pl:'Planète',st:'Station',base:'Station',sun:'Étoile',mis:'Mission',story:'Histoire',ev:'Événement',ply:'Pilote',bas:'Ta base',me:'Ta position'}[best.k]||'';
let extra='';if(best.k=='pl'){try{extra=' · '+ptype({x:best.x,z:best.z,hue:best.hue,ring:best.ring})+(pvar({x:best.x,z:best.z,hue:best.hue,ring:best.ring})?' · '+PVARN[pvar({x:best.x,z:best.z,hue:best.hue,ring:best.ring})]:'')}catch(e){}}
try{const k=ctlOf(secOf(best.P.x/GMK,best.P.z/GMK));extra+=' · territoire '+(k=='alliance'?'Alliance':k=='pirates'?'pirate':'contesté')}catch(e){}
$('gm3info').innerHTML=`<b style="color:${best.c||'#fff'}">${best.n}</b><small>${ty}${extra} · ${km<1?'ici':km.toFixed(1)+' km'}</small>`;$('gm3info').style.display='block';try{SFX.tick()}catch(e){}}else $('gm3info').style.display='none'}
function gm3Toggle(on){on=on==null?!GM3.on:on;if(on===GM3.on)return;GM3.on=on;gm3UI();document.body.classList.toggle('gm3',on);if(on){gm3Build();GM3.tg.copy(GM3.me.position);GM3.dist=60;GM3.sel=null;$('gm3info').style.display='none';$('map').style.display='none'}else{GM3.sc=null;if(MAP.open){$('map').style.display='block';try{drawMap()}catch(e){}}}}
function gm3Frame(dt){const c=GM3.cam,W=innerWidth,H=innerHeight;if(Math.abs(c.aspect-W/H)>.001){c.aspect=W/H;c.updateProjectionMatrix()}GM3.idle+=dt;if(GM3.idle>4&&!Object.keys(GM3.pts).length)GM3.yaw+=dt*.04;
const cp=Math.cos(GM3.pitch);c.position.set(GM3.tg.x+Math.sin(GM3.yaw)*cp*GM3.dist,GM3.tg.y+Math.sin(GM3.pitch)*GM3.dist,GM3.tg.z+Math.cos(GM3.yaw)*cp*GM3.dist);c.lookAt(GM3.tg);
const k=1+Math.sin(t*4)*.15;GM3.ring.scale.setScalar(k*Math.max(1,GM3.dist/60));GM3.me.children[0].scale.setScalar(Math.max(1,GM3.dist/60));
// étiquettes
const L=GM3.lab,X=GM3.lx,dpr=Math.min(devicePixelRatio||1,2);if(L.width!==W*dpr||L.height!==H*dpr){L.width=W*dpr;L.height=H*dpr}X.setTransform(dpr,0,0,dpr,0,0);X.clearRect(0,0,W,H);X.font="600 12px 'Chakra Petch',system-ui";X.textAlign='center';X.shadowColor='rgba(0,0,0,.9)';X.shadowBlur=4;
for(const o of GM3.items){const imp=o.k=='me'||o.k=='base'||o.k=='bas'||o.k=='mis'||o.k=='story'||o===GM3.sel||((o.k=='st'||o.k=='sun')&&GM3.dist<160)||(o.k=='pl'&&GM3.dist<45);if(!imp)continue;const p=gm3Proj(o.P);if(!p.ok||p.x<-40||p.x>W+40||p.y<-20||p.y>H+20)continue;X.fillStyle=o.c||'#cfe';X.fillText(o.n.length>34?o.n.slice(0,32)+'…':o.n,p.x,p.y-12)}}
{const _rfG=renderFrame;renderFrame=function(){if(GM3.on&&GM3.sc&&MAP.open){gm3Frame(DT||.016);if(typeof GRP!='undefined'&&GRP)GRP.uniforms.str.value=0;if(composer&&bloomOn){rpass.scene=GM3.sc;rpass.camera=GM3.cam;composer.render();rpass.camera=camera}else R3.render(GM3.sc,GM3.cam);return}if(GM3.on&&!MAP.open)gm3Toggle(false);_rfG()}}
{const _cmG=closeMap;closeMap=function(){if(GM3.on)gm3Toggle(false);_cmG()}}
{const b=document.createElement('button');b.id='map3b';b.innerHTML='Galaxie 3D';b.onclick=e=>{e.stopPropagation();gm3Toggle(true)};const mb=$('mapbtns');if(mb)mb.insertBefore(b,mb.firstChild)}
addEventListener('keydown',e=>{if(GM3.on&&e.code=='Escape')gm3Toggle(false)});
