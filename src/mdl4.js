// ===== VAISSEAUX DES PNJ ET DES ENNEMIS EN VRAIS MODÈLES 3D (mdl4.js, après ship4.js) =====
// Modèles fournis par William, simplifiés et convertis (voir CLAUDE.md) : glider (chasseurs pirates), statek (vaisseaux lourds + courriers/patrouilles du trafic), dread (boss, dreadnought mondial).
// Chaque fichier est ramené au repère du jeu (nez -z, dessus +y) et à une longueur de 1 ; mdlSwap(groupe, clé) masque les pièces calculées (on garde flammes et halos additifs) et pose le modèle à la même taille.
const MDL={lib:{},defs:{glider:{url:'models/glider.glb',tex:'glider',ry:Math.PI,emi:.12},statek:{url:'models/statek.glb',tex:'statek',em:'statek_em',ry:0,emi:1.4},dread:{url:'models/dread.glb',tex:'dread',em:'dread_em',ry:Math.PI,emi:1.6}}};
function mdlLoad(){if(MDL.loading||/[?&]nomdl\b/.test(location.search))return;MDL.loading=1;let L;try{L=new THREE.GLTFLoader()}catch(e){return}const TL=new THREE.TextureLoader(),res=DESK?'2k':'1k';
 for(const k in MDL.defs){const D=MDL.defs[k];L.load(D.url,g=>{let m=null;g.scene.traverse(q=>{if(q.isMesh&&!m)m=q});if(!m)return;const geo=m.geometry;if(!geo.attributes.normal)geo.computeVertexNormals();
  if(D.ry)geo.rotateY(D.ry);geo.computeBoundingBox();const b=geo.boundingBox,c=b.getCenter(new V3()),sz=b.getSize(new V3());geo.translate(-c.x,-c.y,-c.z);const s=1/sz.z;geo.scale(s,s,s);geo.computeBoundingBox();geo.computeBoundingSphere();
  const map=TL.load('models/'+D.tex+res+'.jpg');map.encoding=THREE.sRGBEncoding;map.anisotropy=DESK?8:4;
  const mat=new THREE.MeshStandardMaterial({map,roughness:.45,metalness:.4,envMapIntensity:1.1,emissive:0xffffff,emissiveIntensity:D.emi});
  if(D.em){const em=TL.load('models/'+D.em+'.jpg');em.encoding=THREE.sRGBEncoding;mat.emissiveMap=em}else mat.emissiveMap=map;
  MDL.lib[k]={geo,mat,ratio:sz.x/sz.z};mdlReady(k)},null,e=>console.warn('mdl',k,e))}}
function mdlOk(k){return !!MDL.lib[k]&&!window.MDLOFF}
// remplace le visuel d'un vaisseau (groupe avec userData.body) par le modèle k, à la même longueur (× f)
function mdlSwap(root,k,f){const M=MDL.lib[k],u=root.userData||(root.userData={});if(!M||u.mdl)return root;const body=u.body||root;
 const p0=root.position.clone(),q0=root.quaternion.clone(),s0=root.scale.clone();root.position.set(0,0,0);root.quaternion.identity();root.scale.set(1,1,1);root.updateMatrixWorld(true);
 const bb=new THREE.Box3();body.traverse(o=>{if(!o.isMesh||!o.visible)return;const ms=Array.isArray(o.material)?o.material:[o.material];if(ms.some(m=>m&&m.blending===THREE.AdditiveBlending))return;o.geometry.computeBoundingBox&&!o.geometry.boundingBox&&o.geometry.computeBoundingBox();bb.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld))});
 root.position.copy(p0);root.quaternion.copy(q0);root.scale.copy(s0);if(bb.isEmpty())return root;
 const sz=bb.getSize(new V3()),c=bb.getCenter(new V3()),len=Math.max(sz.x,sz.z)*(f||1)/Math.max(1,M.ratio);
 body.traverse(o=>{if(!o.isMesh)return;const ms=Array.isArray(o.material)?o.material:[o.material];if(ms.some(m=>m&&m.blending===THREE.AdditiveBlending))return;o.visible=false;o.userData.mdlHid=1});
 const m=new THREE.Mesh(M.geo,M.mat.clone());m.scale.setScalar(len);m.position.copy(c);m.castShadow=DESK;m.name='mdl:'+k;
 // le corps peut être tourné/mis à l'échelle : on place le modèle dans le repère du groupe racine via le corps
 if(body!==root){body.updateMatrixWorld(true);root.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(body.matrixWorld).invert().multiply(root.matrixWorld);m.applyMatrix4(inv)}
 body.add(m);u.mdl=k;u.mdlM=m;return root}
// ----- branchements -----
const MDLE={pirate:['glider',1.15],chasseur:['glider',1.15],lourd:['statek',1.25],boss:['dread',1.25]};
{const _be=buildEnemy;buildEnemy=function(ty){const r=_be.apply(this,arguments);try{const e=MDLE[ty];if(e&&mdlOk(e[0]))mdlSwap(r,e[0],e[1])}catch(x){console.warn('mdl enemy',x)}return r}}
if(typeof w7Mesh=='function'){const _wm=w7Mesh;w7Mesh=function(job){const r=_wm.apply(this,arguments);try{if((job=='courier'||job=='patrol')&&mdlOk('statek'))mdlSwap(r,'statek',job=='patrol'?1.1:1)}catch(x){console.warn('mdl w7',x)}return r}}
if(typeof wbMesh=='function'){const _wb=wbMesh;wbMesh=function(){const r=_wb.apply(this,arguments);try{if(mdlOk('dread')){if(!r.userData.body)r.userData.body=r;mdlSwap(r,'dread',1.1)}}catch(x){console.warn('mdl wb',x)}return r}}
// quand un modèle arrive : les vaisseaux déjà dans l'espace sont mis à jour
function mdlReady(k){try{if(typeof en!='undefined')for(const e of en){const d=MDLE[e.ty];if(d&&d[0]==k&&e.mesh&&!e.mesh.userData.mdl)mdlSwap(e.mesh,k,d[1])}
 if(typeof FR!='undefined'&&k=='statek')for(const F of FR){if(F.kind=='npc7'&&F.mesh&&F.w7&&(F.w7.job=='courier'||F.w7.job=='patrol')&&!F.mesh.userData.mdl)mdlSwap(F.mesh,'statek',1)}
 if(k=='dread'&&typeof WB!='undefined'&&WB.mesh&&!WB.mesh.userData.mdl){if(!WB.mesh.userData.body)WB.mesh.userData.body=WB.mesh;mdlSwap(WB.mesh,'dread',1.1)}}catch(e){console.warn(e)}}
setTimeout(mdlLoad,900);
