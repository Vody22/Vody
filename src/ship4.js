// ===== VAISSEAU DE DÉPART EN VRAI MODÈLE 3D (ship4.js, après glchar.js) =====
// public/models/flyer.glb (modèle de William, simplifié à 60 000 triangles, normales recalculées avec arêtes vives) + texture flyer2k.jpg (PC) / flyer1k.jpg (mobile).
// Repère du fichier : nez vers -x, dessus +z, ailes sur y, longueur 1,9 → ramené au repère du jeu (nez -z, dessus +y), longueur FLY.L.
// Enveloppe de buildShip : pour l'Éclaireur, les pièces calculées sont masquées (on garde flammes, halos, bouclier, feux) et le modèle est ajouté au corps ; flammes placées dans les tuyères (trouvées par lancer de rayon).
const FLY={ready:false,L:19,geo:null,mat:null,noz:null,gun:null};
function flyLoad(){if(FLY.loading||/[?&]noflyer\b/.test(location.search))return;FLY.loading=1;let L;try{L=new THREE.GLTFLoader()}catch(e){return}
 L.load('models/flyer.glb',g=>{let m=null;g.scene.traverse(q=>{if(q.isMesh&&!m)m=q});if(!m)return;const geo=m.geometry;if(!geo.attributes.normal)geo.computeVertexNormals();
  const tex=new THREE.TextureLoader().load('models/flyer'+(DESK?'2k':'1k')+'.jpg',()=>{FLY.ready=true;flyRefresh()});tex.encoding=THREE.sRGBEncoding;tex.anisotropy=DESK?8:4;
  FLY.mat=new THREE.MeshStandardMaterial({map:tex,roughness:.38,metalness:.35,envMapIntensity:1.2,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.14});FLY.mat.name='flyer';
  // repère du jeu
  const M4=new THREE.Matrix4().makeBasis(new V3(0,0,1),new V3(1,0,0),new V3(0,1,0));geo.applyMatrix4(M4);geo.computeBoundingBox();const b=geo.boundingBox,sz=b.getSize(new V3()),s=FLY.L/sz.z,c=b.getCenter(new V3());
  geo.translate(-c.x,-c.y,-c.z);geo.scale(s,s,s);geo.computeBoundingBox();geo.computeBoundingSphere();FLY.geo=geo;
  // tuyères : rayons tirés depuis l'arrière vers l'avant (tuyères du fichier à y = ±0,27, z = -0,14 sur 1,9 de long)
  const mesh=new THREE.Mesh(geo,FLY.mat),rc=new THREE.Raycaster(),k=s*1.0,noz=[];for(const sx of[-1,1]){const o=new V3(sx*.27*k,-.14*k,b.max.z*s+50);rc.set(o,new V3(0,0,-1));const h=rc.intersectObject(mesh)[0];noz.push(new V3(sx*.27*k,-.14*k,h?h.point.z:FLY.L*.3))}
  FLY.noz=noz;FLY.gun=[new V3(-.12*k,0,geo.boundingBox.min.z),new V3(.12*k,0,geo.boundingBox.min.z)]},null,e=>console.warn('flyer',e))}
function flyIs(){return(G.ship||'eclaireur')=='eclaireur'&&!window.FLYOFF}
function flyRefresh(){try{if(flyIs()&&typeof ship!='undefined'&&ship&&ship.parent&&!ship.userData.fly)rebuildShip()}catch(e){console.warn(e)}}
function flyApply(r){const u=r.userData,body=u.body||r;if(!body||u.fly)return;
 const keep=new Set();for(const f of u.flames||[]){if(f.fl)keep.add(f.fl);if(f.gs)keep.add(f.gs)}
 body.traverse(o=>{if(!o.isMesh||keep.has(o))return;const ms=Array.isArray(o.material)?o.material:[o.material];if(ms.some(m=>m&&m.blending===THREE.AdditiveBlending))return;o.visible=false});
 for(const k of['gear','can','pilot'])if(u[k]&&u[k].isObject3D)u[k].visible=false;
 const m=new THREE.Mesh(FLY.geo,FLY.mat);m.castShadow=m.receiveShadow=DESK;m.name='flyer';body.add(m);u.fly=m;
 // flammes dans les tuyères (les flammes en trop se rangent entre les deux)
 r.updateMatrixWorld(true);const F=u.flames||[],n=F.length;F.forEach((f,i)=>{const t=n<=1?.5:i/(n-1),p=new V3().lerpVectors(FLY.noz[0],FLY.noz[1],n==2?i:t);if(n>2&&i>0&&i<n-1)p.y+=.5;
  for(const[o,dz]of[[f.fl,2.1],[f.gs,.3]]){if(!o||!o.parent)continue;const w=body.localToWorld(p.clone().add(new V3(0,0,dz)));o.parent.updateMatrixWorld(true);o.position.copy(o.parent.worldToLocal(w))}});
 // feux de position au bout des ailes
 const bb=FLY.geo.boundingBox;if(u.nl&&u.nl.position)u.nl.position.set(bb.min.x,0,0);if(u.nr&&u.nr.position)u.nr.position.set(bb.max.x,0,0)}
{const _bs4=buildShip;buildShip=function(P,l){const r=_bs4.apply(this,arguments);try{if(FLY.ready&&flyIs())flyApply(r)}catch(e){console.warn('flyApply',e)}return r}}
setTimeout(flyLoad,600);
