// ===== OPTIMISATIONS DU MOTEUR (WebGL) : moins d'appels de dessin, objets lointains masqués, shaders précompilés aux transitions =====
const PF3={t:0,asts:0,stats:{merged:0,culled:0}};
// ----- stations : les pièces fixes qui partagent le même matériau sont fusionnées (dans la station et dans l'anneau qui tourne) ; les feux sont regroupés et masqués de loin -----
function pf3MergeChildren(par,skip){const G=new Map();for(const o of par.children){if(!o.isMesh||o.isInstancedMesh||o.isSkinnedMesh||o.children.length||skip.has(o))continue;const m=o.material;
if(!m||Array.isArray(m)||m.transparent||m.blending!==THREE.NormalBlending||!o.geometry||!o.geometry.attributes.position||o.geometry.morphAttributes&&Object.keys(o.geometry.morphAttributes).length)continue;
if(o.onBeforeRender!==THREE.Object3D.prototype.onBeforeRender||o.userData.noMerge)continue;const s0=o.userData.sty0||m,k=m.uuid+'|'+s0.uuid+'|'+o.castShadow+'|'+o.receiveShadow+'|'+(o.renderOrder|0);if(!G.has(k))G.set(k,{m,s0,list:[]});G.get(k).list.push(o)}
let n=0;for(const e of G.values()){if(e.list.length<2)continue;const parts=[];let cnt=0,col=!!e.m.vertexColors;for(const o of e.list){o.updateMatrix();const src=o.geometry,g=src.index?src.toNonIndexed():src.clone();g.applyMatrix4(o.matrix);if(!g.attributes.normal)g.computeVertexNormals();parts.push(g);cnt+=g.attributes.position.count;if(col&&!g.attributes.color)col=false}
const pos=new Float32Array(cnt*3),nor=new Float32Array(cnt*3),uv=new Float32Array(cnt*2),cl=col?new Float32Array(cnt*3):null;let i=0;
for(const g of parts){const c=g.attributes.position.count;pos.set(g.attributes.position.array,i*3);nor.set(g.attributes.normal.array,i*3);if(g.attributes.uv&&g.attributes.uv.itemSize==2)uv.set(g.attributes.uv.array,i*2);if(cl)cl.set(g.attributes.color.array.subarray(0,c*3),i*3);i+=c;g.dispose()}
const mg=new THREE.BufferGeometry();mg.setAttribute('position',new THREE.BufferAttribute(pos,3));mg.setAttribute('normal',new THREE.BufferAttribute(nor,3));mg.setAttribute('uv',new THREE.BufferAttribute(uv,2));if(cl)mg.setAttribute('color',new THREE.BufferAttribute(cl,3));mg.computeBoundingSphere();
const mm=new THREE.Mesh(mg,e.m);mm.castShadow=e.list[0].castShadow;mm.receiveShadow=e.list[0].receiveShadow;mm.renderOrder=e.list[0].renderOrder;mm.userData.sty0=e.s0;mm.userData.pf3=1;mm.matrixAutoUpdate=false;mm.updateMatrix();
for(const o of e.list)par.remove(o);par.add(mm);n+=e.list.length-1}return n}
function pf3Station(st){const g=st&&st.mesh;if(!g||g.userData.pf3)return;const u=g.userData;g.userData.pf3=1;const skip=new Set();
for(const v of Object.values(u)){const add=x=>{if(x&&x.isObject3D)skip.add(x);else if(x&&typeof x=='object'){for(const k of['s','m','mesh','sp'])if(x[k]&&x[k].isObject3D)skip.add(x[k])}};if(Array.isArray(v))v.forEach(add);else add(v)}
if(u.fdeco){skip.add(u.fdeco);if(u.fdeco.userData.rotPart)skip.add(u.fdeco.userData.rotPart)}
let n=pf3MergeChildren(g,skip);if(u.rot)n+=pf3MergeChildren(u.rot,skip);PF3.stats.merged+=n;
// feux : regroupés pour pouvoir les masquer de loin en une fois
const regroup=par=>{const L=par.children.filter(o=>o.isSprite);if(L.length<6)return null;const lg=new THREE.Group();lg.userData.pf3l=1;par.add(lg);for(const s of L)lg.add(s);return lg};u.pf3L=[regroup(g),u.rot?regroup(u.rot):null].filter(Boolean)}
{const _ls=loadSmall;loadSmall=function(c){_ls(c);try{if(c.st&&c.st.mesh&&!c.st.ground)pf3Station(c.st)}catch(e){console.warn('pf3',e)}}}
{const _us=unloadSmall;unloadSmall=function(k){const e=SMALL.get(k);const m=e&&e.c.st&&e.c.st.mesh;_us(k);if(m)m.traverse(o=>{if(o.userData&&o.userData.pf3&&o.geometry)o.geometry.dispose()})}}
// stations déjà chargées au démarrage
setTimeout(()=>{try{for(const st of stations)if(!st.ground)pf3Station(st)}catch(e){console.warn(e)}},800);
// ----- masquer ce qui est trop loin pour être vu (taille à l'écran), sans toucher à ce que le jeu cache lui-même -----
const _pfv=new V3(),_pfs=new THREE.Sphere();
function pf3Far(o,d,r,k){if(d>Math.max(k[0],r*k[1])){if(o.visible){o.visible=false;o.userData.pf3c=1;PF3.stats.culled++}}else if(o.userData.pf3c){o.userData.pf3c=0;o.visible=true}}
function pf3Tick(dt){PF3.t-=dt;if(PF3.t>0)return;PF3.t=.25;const cp=camera.position;
if(mode=='space'){for(const a of asts){if(!a.mesh)continue;pf3Far(a.mesh,a.pos.distanceTo(cp),a.r||10,[1700,90])}
for(const st of stations){const u=st.mesh&&st.mesh.userData;if(!u||!u.pf3L)continue;const d=st.mesh.position.distanceTo(cp);for(const lg of u.pf3L)lg.visible=d<3200}}
else if(mode=='surf'&&SURF.scene){const sc=SURF.scene;for(const o of sc.children){if(o===ship||o===FOOT.model||o.isLight||o.isCamera||o.userData.noCull)continue;let r=o.userData.pf3r;
if(r==null){if(o.isMesh||o.isGroup){let nm=0;o.traverse(q=>{if(q.isMesh)nm++});const mt=o.isMesh&&o.material;if(o.isInstancedMesh||o.isPoints||o.isLine||(o.isGroup&&nm<6)||(mt&&(Array.isArray(mt)||mt.transparent||mt.blending!==THREE.NormalBlending))||(o.isMesh&&o.geometry&&o.geometry.attributes.position&&o.geometry.attributes.position.count>3000)){o.userData.pf3r=-1;continue}const b=new THREE.Box3().setFromObject(o);if(b.isEmpty()){o.userData.pf3r=-1;continue}b.getBoundingSphere(_pfs);r=_pfs.radius;o.userData.pf3o=_pfs.center.clone().sub(o.position)}else{o.userData.pf3r=-1;continue}o.userData.pf3r=r}
if(r<0||r>120)continue;_pfv.copy(o.position);if(o.userData.pf3o)_pfv.add(o.userData.pf3o);const d=_pfv.distanceTo(cp)-r;pf3Far(o,d,r,[170,85])}}}
TICK.push(pf3Tick);
// en quittant une planète, rien ne reste masqué par erreur
{const _sx=SURF.exit;SURF.exit=function(dead){try{for(const o of SURF.scene.children)if(o.userData.pf3c){o.userData.pf3c=0;o.visible=true}}catch(e){}return _sx(dead)}}
// ----- précompilation des shaders aux transitions (plus de saccade quand un objet apparaît pour la première fois) -----
function pf3Compile(sc,cam){try{const t0=performance.now();R3.compile(sc,cam||camera);PF3.lastC=performance.now()-t0}catch(e){console.warn(e)}}
{const _se=SURF.enter;SURF.enter=function(p,entry){_se(p,entry);setTimeout(()=>{if(mode=='surf')pf3Compile(SURF.scene)},50)}}
// espace : une seule fois, quand le menu d'accueil est fermé (pendant le fondu)
TICK.push(()=>{if(PF3.spaceC||mode!='space'||performance.now()<2500||(typeof MENU3!='undefined'&&MENU3.on))return;PF3.spaceC=1;pf3Compile(scene)});
if(typeof h3Build=='function'){const _hb=h3Build;h3Build=function(st){_hb(st);if(H3.sc)pf3Compile(H3.sc,H3.cam)}}
// ----- iPhone : la génération progressive (textures de planètes…) prend moins de temps par image quand le jeu rame -----
{const _rj=runJobs;runJobs=function(ms){const f=typeof FX3!='undefined'?FX3.fps:0;return _rj(!DESK&&f&&f<45?Math.min(ms,3):ms)}}
