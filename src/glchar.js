// ===== PERSONNAGES EN VRAIS MODÈLES 3D (glchar.js, après chars5.js) =====
// Modèles glTF animés (squelette Mixamo) dans public/models/ : soldat (combinaison blindée : pilote, gardes, police), Michelle (civile), Xbot (robots + source des animations).
// Les animations sont transférées d'un squelette à l'autre par « cuisson » (glBake) : rotation du monde relative à la pose de repos (T-pose) → rotations locales du squelette cible.
// buildHuman(o) renvoie un modèle glTF quand il est chargé et adapté (glKind), sinon le personnage calculé (chars.js). animHuman pilote alors un AnimationMixer.
const GLC={lib:{},ready:false,clips:null,err:0,_q1:new THREE.Quaternion(),_q2:new THREE.Quaternion(),_v:new V3()};
const GLM={soldier:{url:'models/Soldier.glb',h:1.8},michelle:{url:'models/Michelle.glb',h:1.68,fem:1},xbot:{url:'models/Xbot.glb',h:1.74,robot:1}};
function glName(n){return String(n).replace(/^.*mixamorig[:_]?/,'')}
function glBones(root){const m={};root.traverse(o=>{if(o.isBone){const k=glName(o.name);if(!m[k])m[k]=o}});return m}
// pose de repos : clip TPose s'il existe, sinon la pose du fichier
function glRest(L){const r=THREE.SkeletonUtils.clone(L.scene);const tp=L.animations.find(a=>/tpose/i.test(a.name));if(tp){const mx=new THREE.AnimationMixer(r);mx.clipAction(tp).play();mx.update(0)}r.updateMatrixWorld(true);return r}
// direction « gauche » du personnage dans le monde (pour aligner deux squelettes tournés différemment)
function glLeft(B){const a=B.LeftArm||B.LeftShoulder,b=B.RightArm||B.RightShoulder;if(!a||!b)return new V3(1,0,0);const p=a.getWorldPosition(new V3()),q=b.getWorldPosition(new V3());return p.sub(q).setY(0).normalize()}
function glHeight(B){const h=B.Head,f=B.LeftFoot||B.LeftToeBase;if(!h||!f)return 1;return Math.max(.1,h.getWorldPosition(new V3()).y-f.getWorldPosition(new V3()).y)}
function glBake(srcL,clip,dstL){const S=glRest(srcL),D=glRest(dstL),SB=glBones(S),DB=glBones(D);
 // aligne le squelette source sur la cible (rotation autour de la verticale)
 const ls=glLeft(SB),ld=glLeft(DB),ang=Math.atan2(ls.x*ld.z-ls.z*ld.x,ls.x*ld.x+ls.z*ld.z);S.rotation.y-=ang;S.updateMatrixWorld(true);
 const keys=Object.keys(DB).filter(k=>SB[k]),sRW={},dRW={},inv=new THREE.Quaternion();for(const k of keys){sRW[k]=SB[k].getWorldQuaternion(new THREE.Quaternion()).invert();dRW[k]=DB[k].getWorldQuaternion(new THREE.Quaternion())}
 // ordre parent → enfant
 const ord=[];D.traverse(o=>{if(o.isBone&&keys.includes(glName(o.name))&&DB[glName(o.name)]===o)ord.push(glName(o.name))});
 const hk=keys.includes('Hips')?'Hips':null,sh0=hk?SB.Hips.getWorldPosition(new V3()):null,dh0=hk?DB.Hips.getWorldPosition(new V3()):null,sc=glHeight(DB)/glHeight(SB);
 const mx=new THREE.AnimationMixer(S),act=mx.clipAction(clip);act.play();const fps=30,n=Math.max(2,Math.round(clip.duration*fps)+1),times=new Float32Array(n),Q={},P=new Float32Array(n*3);for(const k of ord)Q[k]=new Float32Array(n*4);
 const W={},pw=new THREE.Quaternion(),wt=new THREE.Quaternion(),loc=new THREE.Quaternion(),tmp=new V3();
 for(let i=0;i<n;i++){const tt=Math.min(clip.duration,i/fps);times[i]=tt;mx.setTime(tt);S.updateMatrixWorld(true);
  for(const k of ord){const db=DB[k];SB[k].getWorldQuaternion(wt);wt.multiply(sRW[k]).multiply(dRW[k]);W[k]=wt.clone();
   const pk=db.parent&&db.parent.isBone?glName(db.parent.name):null;if(pk&&W[pk])pw.copy(W[pk]);else db.parent.getWorldQuaternion(pw);loc.copy(pw).invert().multiply(wt);loc.toArray(Q[k],i*4)}
  if(hk){SB.Hips.getWorldPosition(tmp).sub(sh0).multiplyScalar(sc).add(dh0);DB.Hips.parent.worldToLocal(tmp);tmp.toArray(P,i*3)}}
 const tr=ord.map(k=>new THREE.QuaternionKeyframeTrack(DB[k].name+'.quaternion',times,Q[k]));if(hk)tr.push(new THREE.VectorKeyframeTrack(DB.Hips.name+'.position',times,P));
 return new THREE.AnimationClip(clip.name,clip.duration,tr)}
// ----- chargement (en arrière-plan, après le démarrage) -----
function glLoad(){if(GLC.loading)return;GLC.loading=1;let L;try{L=new THREE.GLTFLoader()}catch(e){return}const keys=Object.keys(GLM).filter(k=>k!='michelle'||window.GLCIV);let left=keys.length;
 for(const k of keys)L.load(GLM[k].url,g=>{g.scene.traverse(o=>{if(o.isMesh){o.castShadow=DESK;o.frustumCulled=false;if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];for(const m of ms){for(const k of['map','emissiveMap'])if(m[k]){m[k].encoding=THREE.LinearEncoding;m[k].needsUpdate=true}if(m.map)m.map.anisotropy=4;m.envMapIntensity=.6;m.needsUpdate=true}}}});if(k=='xbot')g.scene.traverse(o=>{if(o.isMesh){const j=/joint/i.test(o.material.name);o.material=new THREE.MeshStandardMaterial({color:j?0x1c2026:0xc8ced6,metalness:j?.6:.75,roughness:j?.45:.28,skinning:true,envMapIntensity:.8})}});GLC.lib[k]=g;if(--left==0)glPrep()},null,e=>{GLC.err++;console.warn('glchar',k,e);if(--left==0)glPrep()})}
function glPrep(){try{const X=GLC.lib.xbot,Sd=GLC.lib.soldier;if(!X)return;const pick=(L,n)=>L&&L.animations.find(a=>a.name.toLowerCase()==n);
 GLC.src={idle:pick(X,'idle'),walk:pick(X,'walk'),run:pick(X,'run'),agree:pick(X,'agree'),shake:pick(X,'headshake'),sad:pick(X,'sad_pose')};
 for(const k in GLC.lib){const L=GLC.lib[k];L.clips={};for(const c in GLC.src){if(!GLC.src[c])continue;L.clips[c]=k=='xbot'?GLC.src[c]:null}
  if(k=='soldier'){for(const[c,n]of[['idle','idle'],['walk','walk'],['run','run']]){const a=pick(Sd,n);if(a)L.clips[c]=a}}}
 GLC.ready=true;try{if(typeof FOOT!='undefined'&&FOOT.model&&!FOOT.on&&!FOOT.model.userData.glc){FOOT.model.parent&&FOOT.model.parent.remove(FOOT.model);FOOT.model=null}}catch(e){}}catch(e){console.warn('glPrep',e)}}
// cuisson paresseuse (une fois par modèle et par animation)
function glClip(kind,c){const L=GLC.lib[kind];if(!L||!L.clips||!(c in L.clips))return null;if(!L.clips[c]&&GLC.src[c]){try{L.clips[c]=glBake(GLC.lib.xbot,GLC.src[c],L)}catch(e){console.warn('glBake',kind,c,e);delete L.clips[c];return null}}return L.clips[c]}
// ----- quel modèle pour quel personnage -----
function glKind(o){if(!GLC.ready||o.procedural||window.GLOFF)return null;const role=o.role||'',pilot=typeof o.seed=='string'&&o.seed.startsWith('pilot');
 if(role=='robot')return GLC.lib.xbot?'xbot':null;if(role=='alien')return null;
 if(o.helmet!==false&&(pilot||!/^(merchant|scientist|mechanic)$/.test(role)))return GLC.lib.soldier?'soldier':null;
 const fem=o.fem!=null?!!o.fem:(typeof o.seed=='number'?o.seed%2==0:Math.random()<.45);if(fem&&GLC.lib.michelle&&window.GLCIV)return 'michelle';return null}
function glSeedN(s){return s==null?Math.random()*1e9|0:typeof s=='number'?s:[...String(s)].reduce((a,c)=>(a*31+c.charCodeAt(0))|0,7)>>>0}
function glMake(kind,o){const L=GLC.lib[kind],M=GLM[kind],root=THREE.SkeletonUtils.clone(L.scene),g=new THREE.Group();g.add(root);
 // orientation : le personnage regarde -z ; taille
 const B=glBones(root);root.updateMatrixWorld(true);const lf=glLeft(B);root.rotation.y=Math.atan2(lf.z,lf.x)+Math.PI;// gauche du personnage = -x quand il regarde -z
 const r=rng(glSeedN(o.seed)%2147483646+1),mh=(o.morph&&o.morph.h)||(.95+r()*.09);root.updateMatrixWorld(true);const h0=glHeight(B)*1.09;root.scale.multiplyScalar(M.h*mh/h0);
 // teinte : couleur de la combinaison (pilote/gardes) ou variation légère (civils)
 const tint=o.suit!=null&&kind=='soldier'?new THREE.Color(0xffffff).lerp(new THREE.Color(o.suit),.6):kind=='michelle'?new THREE.Color().setHSL(r(),.25,.85):null;
 if(tint)root.traverse(q=>{if(q.isMesh&&q.material&&!/visor/i.test(q.material.name)){q.material=q.material.clone();q.material.color.copy(tint)}});
 const mx=new THREE.AnimationMixer(root),A={};for(const c of['idle','walk','run']){const cl=glClip(kind,c);if(cl){const a=mx.clipAction(cl);a.play();a.setEffectiveWeight(c=='idle'?1:0);A[c]=a}}
 for(const c of['agree','shake']){const cl=glClip(kind,c);if(cl){const a=mx.clipAction(cl);a.setLoop(THREE.LoopOnce);a.clampWhenFinished=false;A[c]=a}}
 const hd=B.RightHand,hl=B.LeftHand;let tool=null;
 if(o.tool&&hd){root.updateMatrixWorld(true);const ws=hd.getWorldScale(new V3()).x||1,tg=new THREE.Group();tg.scale.setScalar(1/ws);hd.add(tg);const MT=GLC.toolM||(GLC.toolM=new THREE.MeshStandardMaterial({color:0x2a2e36,metalness:.7,roughness:.35})),GLW2=GLC.toolG||(GLC.toolG=new THREE.MeshBasicMaterial({color:0x5ff0ff}));
  const bd=new THREE.Mesh(RB3(.05,.06,.2),MT);bd.position.set(0,.06,.06);tg.add(bd);const br=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,.16,10).rotateX(Math.PI/2),MT);br.position.set(0,.075,.2);tg.add(br);const gl=new THREE.Mesh(RB3(.052,.012,.08),GLW2);gl.position.set(0,.092,.04);tg.add(gl);
  tool=new THREE.Object3D();tool.position.set(0,.075,.29);tg.add(tool);GLC.toolGrp=tg}
 g.userData={glc:{kind,mx,A,B,lt:null,ph:r()*9},role:o.role||'',head:B.Head,hd,hl,tool,fem:!!M.fem,BW:null};
 mx.update(r()*2);return g}
{const _bh=buildHuman;buildHuman=function(o={}){let k=null;try{k=glKind(o)}catch(e){}if(k){try{return glMake(k,o)}catch(e){console.warn('glMake',e)}}return _bh.apply(this,arguments)}}
// ----- animation -----
const GLW={walk:1.35,run:4.2};
{const _ah=animHuman;animHuman=function(m,ph,spd,air,aim,talk,look){const u=m.userData;if(u&&u.glc)return glAnim(m,u,spd||0,air,aim,talk,look);return _ah.apply(this,arguments)}}
function glAnim(m,u,spd,air,aim,talk,look){const G=u.glc;let dt=G.lt==null?.016:t-G.lt;G.lt=t;dt=clamp(dt,0,.1);const A=G.A;
 const v=air?0:spd,wW=clamp(v/1.1,0,1)*(1-clamp((v-2.4)/1.4,0,1)),wR=clamp((v-2.4)/1.4,0,1),wI=1-clamp(v/1.1,0,1);
 G.wi=(G.wi==null?1:G.wi)+(wI-(G.wi==null?1:G.wi))*Math.min(1,dt*8);G.ww=(G.ww||0)+(wW-(G.ww||0))*Math.min(1,dt*8);G.wr=(G.wr||0)+(wR-(G.wr||0))*Math.min(1,dt*8);
 if(A.idle)A.idle.setEffectiveWeight(G.wi);if(A.walk){A.walk.setEffectiveWeight(G.ww);A.walk.timeScale=clamp(v/GLW.walk,.5,2)}if(A.run){A.run.setEffectiveWeight(G.wr);A.run.timeScale=clamp(v/GLW.run,.6,1.8)}
 if(A.walk&&A.run&&G.ww>.05&&G.wr>.05){A.run.time=A.walk.time/A.walk.getClip().duration*A.run.getClip().duration}
 // gestes de la tête en parlant (hochement) : animation « agree » de temps en temps
 if(talk>0&&A.agree&&!A.agree.isRunning()&&Math.random()<dt*.25){A.agree.reset().setEffectiveWeight(.6).play()}
 G.mx.update(dt);
 // regard : la tête et le cou tournent vers la cible (après le mixage)
 const B=G.B,ang=look!=null?clamp(look,-1.1,1.1):Math.sin(t*.23+G.ph)*.3*G.wi;G.hy=(G.hy||0)+(ang-(G.hy||0))*Math.min(1,dt*4);
 if(Math.abs(G.hy)>.002){for(const[b,f]of[[B.Neck,.4],[B.Head,.6]]){if(!b||!b.parent)continue;b.parent.getWorldQuaternion(GLC._q1);GLC._v.set(0,1,0).applyQuaternion(GLC._q1.invert());GLC._q2.setFromAxisAngle(GLC._v.normalize(),G.hy*f);b.quaternion.premultiply(GLC._q2)}}
 // saut / jetpack : jambes repliées
 if(air){G.air=Math.min(1,(G.air||0)+dt*5)}else G.air=Math.max(0,(G.air||0)-dt*5);
 if(G.air>0){for(const[b,a]of[[B.LeftUpLeg,-.7],[B.RightUpLeg,-.4],[B.LeftLeg,1.1],[B.RightLeg,.8]]){if(!b)continue;GLC._q2.setFromAxisAngle(GLC._v.set(1,0,0),a*G.air);b.quaternion.multiply(GLC._q2)}}}
// gestes de chars5 : « oui » / « non » deviennent les animations du modèle, le reste est ignoré
{const _g=hmGest;hmGest=function(m,k,d){const u=m&&m.userData;if(u&&u.glc){const A=u.glc.A,a=k=='oui'?A.agree:k=='non'?A.shake:null;if(a&&!a.isRunning())a.reset().setEffectiveWeight(.9).play();return}return _g.apply(this,arguments)}}
// démarrage : chargement un peu après le lancement (sauf ?nogl)
setTimeout(()=>{if(!/[?&]nogl\b/.test(location.search))glLoad()},1500);
