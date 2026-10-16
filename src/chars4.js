// ===== PERSONNAGES : MORPHOLOGIES, TENUES, ACCESSOIRES, COMBINAISON DU PILOTE (chars4.js, juste après chars.js) =====
// Enveloppe de buildHuman. Options : o.morph {h,w,age}, o.outfit ('veste'|'manteau'|'tablier'|'uniforme'|'combi'), o.acc2 [lunettes, solaires, audio, sac, robot],
// o.tat / o.scar (peints sur la peau, chars.js). Sans options, un profil est tiré de la graine (PNJ) ; le pilote (graine 'pilot…') garde sa silhouette.
const C4={mat:{}};
function c4M(k,f){return C4.mat[k]||(C4.mat[k]=f())}
function c4Seed(o){const s=o.seed;return s==null?(Math.random()*1e9|0):typeof s=='number'?s:[...String(s)].reduce((a,c)=>(a*31+c.charCodeAt(0))|0,7)>>>0}
function c4Prof(o){const pilot=typeof o.seed=='string'&&o.seed.startsWith('pilot'),r=rng((c4Seed(o)*7+13)%2147483646+1),P={pilot};
const m=o.morph||{};const rh=r(),rw=r(),ra=r();P.h=m.h!=null?m.h:pilot?1:.92+rh*.16;P.w=m.w!=null?m.w:pilot?1:(rw<.15?.9:rw>.75?1.08+(rw-.75)*.8:1);P.age=m.age!=null?m.age:pilot?0:(ra<.18?.65+ra*1.9:ra*.45);
const civ=o.helmet===false&&o.role!='alien';P.outfit=o.outfit!==undefined?o.outfit:(civ&&!o.role?(r()<.5?null:r()<.6?'veste':r()<.75?'manteau':'tablier'):civ&&o.role=='mechanic'?'combi':civ&&o.role=='guard'?'uniforme':null);
P.acc=o.acc2||(pilot||!civ?[]:[r()<.12?'lunettes':r()<.07?'solaires':null,r()<.09?'audio':null,r()<.14?'sac':null,r()<.05?'robot':null].filter(Boolean));
P.tat=o.tat!=null?o.tat:(pilot?0:r()<.1?1:0);P.scar=o.scar!=null?o.scar:(pilot?0:r()<.07?(r()<.5?1:2):0);return P}
// tissu taché (combinaisons de mécanicien) : copie du tissu + taches d'huile
function c4Stain(base){return c4M('stain'+base.uuid,()=>{const src=base.map.image,c=mkC(src.width,src.height),g=c.getContext('2d');g.drawImage(src,0,0);const r=rng(41);
for(let i=0;i<46;i++){const x=r()*c.width,y=r()*c.height,R=4+r()*c.width*.05,gr=g.createRadialGradient(x,y,0,x,y,R);gr.addColorStop(0,'rgba(20,16,10,'+(.35+r()*.35)+')');gr.addColorStop(1,'rgba(20,16,10,0)');g.fillStyle=gr;g.beginPath();g.ellipse(x,y,R,R*(.5+r()*.6),r()*3,0,TAU);g.fill()}
const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;const m=base.clone();m.map=t;return m})}
function c4Tag(txt,col){return c4M('tag'+txt+col,()=>{const c=mkC(128,32),g=c.getContext('2d');g.fillStyle='#1a2230';g.fillRect(0,0,128,32);g.fillStyle=col;g.fillRect(0,0,6,32);g.font="700 18px 'Chakra Petch',system-ui";g.fillStyle='#e8f2ff';g.textBaseline='middle';g.fillText(txt.toUpperCase().slice(0,10),12,17);const t=new THREE.CanvasTexture(c);return new THREE.MeshBasicMaterial({map:t})})}
{const _bh=buildHuman;buildHuman=function(o={}){const P=c4Prof(o),o2=Object.assign({},o);
if(P.age>.62&&o.hair==null)o2.hair=P.age>.85?0xd8d8d8:0x9a9590;o2.age=o.age!=null?o.age:P.age;o2.tat=P.tat;o2.scar=P.scar;if(P.age>.7&&!o2.fem&&o.beard==null&&o2.hs==null)o2.hs=c4Seed(o)%3==0?6:o2.hs;
const g=_bh(o2),u=g.userData;if(!u||!u.BW)return g;try{c4Dress(g,u,o2,P)}catch(e){console.warn(e)}
// silhouette : taille et corpulence (la tête garde ses proportions)
g.scale.set(g.scale.x*P.w,g.scale.y*P.h,g.scale.z*P.w);if(u.hg&&P.w!=1){u.hg.scale.x/=P.w;u.hg.scale.z/=P.w}
u.stoop=P.age>.6?(P.age-.6)*.55:0;u.c4=P;return g}}
function c4Dress(g,u,o,P){const BW=u.BW,fem=u.fem,civ=o.helmet===false,MT=MAT.metal,put=(b,geo,m,x,y,z,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1)=>{const w=BW.get(b),q=new THREE.Mesh(geo,m);q.position.set(x-w.x,y-w.y,z-w.z);q.rotation.set(rx,ry,rz);q.scale.set(sx,sy,sz);q.castShadow=DESK;b.add(q);return q};
const BX=HM3BX[fem?'f':'m'],r=rng((c4Seed(o)*3+5)%2147483646+1);
const sleeves=(m)=>{for(let i=0;i<2;i++){const s=i?1:-1,A=u.arms[i];put(A.sh,hm3Sh('c4shc',()=>new THREE.SphereGeometry(.07,16,10,0,TAU,0,Math.PI*.55)),m,s*(BX.sh-.005),1.432,0,0,0,s*-.28,1.12,.8,1.1);put(A.sh,hm3Sh('c4sl1'+(fem?1:0),()=>new THREE.CylinderGeometry(fem?.052:.058,fem?.045:.05,.31,14,1,true)),m,s*(BX.sh+BX.el)/2,1.29,0,0,0,s*.05);put(A.el,hm3Sh('c4sl2'+(fem?1:0),()=>new THREE.CylinderGeometry(fem?.041:.046,fem?.036:.04,.2,14,1,true)),m,s*BX.el,1.06,0,0,0,s*.02)}};
// ----- tenues -----
if(civ&&P.outfit=='veste'){const col=[0x3a2a20,0x2a3240,0x4a4a30,0x5a2020,0x20262e][r()*5|0],J=c4M('vj'+col,()=>new THREE.MeshStandardMaterial({color:col,roughness:.62,metalness:.05,map:hm3FabT(true).map,side:THREE.DoubleSide}));
 put(u.chest,hm3Shell(fem,1.0,1.5,1.1),J,0,0,0);sleeves(J);put(u.chest,new THREE.TorusGeometry(fem?.068:.078,.016,8,22,Math.PI*1.4),J,0,1.49,.012,Math.PI/2,0,Math.PI*.8,1,1.15,1);
 for(let k=0;k<3;k++)put(u.chest,new THREE.SphereGeometry(.006,8,6),MT,fem?.012:0,1.38-k*.09,fem?-.122:-.118)}
if(civ&&P.outfit=='manteau'){const col=[0x2a2420,0x3a3a44,0x5a4630,0x1e2a24][r()*4|0],C=c4M('co'+col,()=>new THREE.MeshStandardMaterial({color:col,roughness:.75,map:hm3FabT(true).map,side:THREE.DoubleSide}));
 const ct=new THREE.Mesh(hm3Sh('c4co'+(fem?1:0),()=>new THREE.LatheGeometry([[.3,0],[.26,.25],[fem?.205:.22,.5],[fem?.22:.24,.75],[fem?.21:.23,.88],[.12,.97],[0,.98]].map(([x,y])=>new THREE.Vector2(x,y)),22,0,Math.PI*1.8)),C);ct.scale.z=.74;ct.rotation.y=-Math.PI*.9;
 const w=BW.get(u.sp);ct.position.set(0,.5-w.y,0);ct.castShadow=DESK;u.sp.add(ct);u.coat=ct;sleeves(C);put(u.chest,new THREE.TorusGeometry(fem?.08:.09,.022,8,22,Math.PI*1.3),C,0,1.47,.02,Math.PI/2+.3,0,Math.PI*.85,1,1.1,1)}
if(civ&&P.outfit=='tablier'){const col=[0xf0ece4,0x8a3020,0x2a4a6a][r()*3|0],AP=c4M('ap'+col,()=>new THREE.MeshStandardMaterial({color:col,roughness:.85,side:THREE.DoubleSide,map:hm3FabT(true).map}));
 const ag=hm3Sh('c4ap'+(fem?1:0),()=>new THREE.CylinderGeometry(.19,.24,.72,16,1,true,-1.05,2.1).rotateY(Math.PI));put(u.hips,ag,AP,0,.92,-.0,0,0,0,1,1,.8);put(u.chest,RB3(.2,.2,.01),AP,0,1.34,fem?-.125:-.12);for(const s of[-1,1])put(u.chest,RB3(.022,.3,.01),AP,s*.08,1.4,0,0,0,s*.12)}
if(civ&&P.outfit=='uniforme'){const UC=c4M('uc',()=>new THREE.MeshStandardMaterial({color:0x1e2a44,roughness:.5,metalness:.1})),GD=c4M('gold',()=>new THREE.MeshStandardMaterial({color:0xd8b048,metalness:.85,roughness:.3}));
 const cp=new THREE.Mesh(hm3Sh('c4cap',()=>new THREE.CylinderGeometry(.1,.092,.06,22)),UC);cp.position.set(0,.115,.004);u.hg.add(cp);const vs=new THREE.Mesh(hm3Sh('c4vis',()=>new THREE.CylinderGeometry(.085,.085,.008,20,1,false,Math.PI*.5,Math.PI)),c4M('vis',()=>new THREE.MeshStandardMaterial({color:0x0e1420,metalness:.6,roughness:.2})));vs.position.set(0,.088,-.03);vs.scale.set(1,1,1.15);u.hg.add(vs);
 const bd=new THREE.Mesh(hm3Sh('c4bd',()=>new THREE.TorusGeometry(.097,.007,6,24)),GD);bd.rotation.x=Math.PI/2;bd.position.set(0,.1,.004);u.hg.add(bd);
 for(let i=0;i<2;i++){const s=i?1:-1;put(u.arms[i].sh,RB3(.09,.012,.05),GD,s*(BX.sh-.01),1.462,0,0,0,s*-.2)}put(u.chest,RB3(.05,.012,.006),GD,-.07,1.37,-.118)}
if(civ&&P.outfit=='combi'){const body=g.children.find(c=>c.isSkinnedMesh);if(body)body.material=c4Stain(body.material)}
// ----- accessoires -----
const A=P.acc,hg=u.hg,eyeC=u.eyes.map(e=>e.position);
if(A.includes('lunettes')||A.includes('solaires')){const sun=A.includes('solaires'),FR=c4M('gfr',()=>new THREE.MeshStandardMaterial({color:0x202428,metalness:.7,roughness:.3}));for(const ec of eyeC){const fr=new THREE.Mesh(hm3Sh('c4gf',()=>new THREE.TorusGeometry(.0158,.0017,6,20)),FR);fr.position.set(ec.x,ec.y,ec.z-.014);hg.add(fr);
  if(sun){const ln=new THREE.Mesh(hm3Sh('c4gl',()=>new THREE.CircleGeometry(.0156,20)),c4M('sunl',()=>new THREE.MeshStandardMaterial({color:0x101418,metalness:.9,roughness:.08,side:THREE.DoubleSide})));ln.position.set(ec.x,ec.y,ec.z-.0145);ln.rotation.y=Math.PI;hg.add(ln)}
  const tm=new THREE.Mesh(RB3(.003,.003,.1),FR);tm.position.set(ec.x+Math.sign(ec.x)*.03,ec.y+.004,ec.z+.03);tm.rotation.y=-Math.sign(ec.x)*.25;hg.add(tm)}const brg=new THREE.Mesh(RB3(.02,.002,.002),FR);brg.position.set(0,eyeC[0].y+.004,eyeC[0].z-.014);hg.add(brg)}
if(A.includes('audio')){const HP=c4M('hp'+(r()*3|0),()=>new THREE.MeshStandardMaterial({color:[0x202020,0xe8e8e8,0xff5a3a][r()*3|0],metalness:.3,roughness:.4}));const band=new THREE.Mesh(hm3Sh('c4hb',()=>new THREE.TorusGeometry(.098,.008,8,28,Math.PI)),HP);band.position.set(0,.02,.01);hg.add(band);
 for(const s of[-1,1]){const cup=new THREE.Mesh(hm3Sh('c4hc',()=>new THREE.CylinderGeometry(.03,.03,.022,18).rotateZ(Math.PI/2)),HP);cup.position.set(s*.088,.0,.01);hg.add(cup)}}
if(A.includes('sac')&&civ){const col=[0x3a4a2a,0x2a2a3a,0x8a3a2a,0x4a3a2a][r()*4|0],BG=c4M('bg'+col,()=>new THREE.MeshStandardMaterial({color:col,roughness:.8,map:hm3FabT(true).map}));put(u.chest,RB3(.26,.33,.12),BG,0,1.28,.16);put(u.chest,RB3(.22,.12,.05),BG,0,1.16,.235);
 for(const s of[-1,1])put(u.chest,RB3(.025,.32,.012),BG,s*.085,1.36,-.11+.002,0,0,s*.05)}
if(A.includes('robot')){const RM=c4M('robo',()=>new THREE.MeshStandardMaterial({color:0x8a939e,metalness:.85,roughness:.28})),RG=c4M('robog',()=>new THREE.MeshBasicMaterial({color:0x5ff0ff}));const L=u.arms[0];
 put(L.el,hm3Sh('c4rf',()=>new THREE.CylinderGeometry(.043,.034,.24,12)),RM,-BX.el-.004,1.03,0,0,0,-.02);put(L.el,hm3Sh('c4rr',()=>new THREE.TorusGeometry(.044,.006,6,16)),RG,-BX.el,1.13,0,Math.PI/2,0,0);put(L.el,hm3Sh('c4rr2',()=>new THREE.TorusGeometry(.037,.005,6,16)),RG,-BX.wr+.006,.93,0,Math.PI/2,0,0);
 for(const c of L.hd.children)if(c.isMesh&&!c.isSprite)c.material=RM}
// ----- combinaison du pilote : plaques d'armure, bandes lumineuses, écussons, plaque nominative -----
if(o.helmet!==false&&P.pilot){const ac=new THREE.Color(o.acc!=null?o.acc:0xff8a2a),AR=c4M('par'+ac.getHex(),()=>new THREE.MeshStandardMaterial({color:new THREE.Color(o.suit!=null?o.suit:0xe8ecf0).multiplyScalar(.82),metalness:.55,roughness:.3})),
 LT=c4M('plt'+ac.getHex(),()=>new THREE.MeshBasicMaterial({color:ac.clone().lerp(new THREE.Color(0xffffff),.35)})),DK=c4M('pdk',()=>new THREE.MeshStandardMaterial({color:0x22262e,metalness:.5,roughness:.45}));
 put(u.chest,hm3Shell(fem,1.24,1.41,1.115),AR,0,0,0);put(u.chest,hm3Shell(fem,1.215,1.235,1.12),DK,0,0,0);
 for(let i=0;i<2;i++){const s=i?1:-1,A2=u.arms[i];put(A2.sh,hm3Sh('c4sp',()=>new THREE.SphereGeometry(.068,16,10,0,TAU,0,Math.PI*.5)),AR,s*BX.sh,1.455,0,0,0,s*-.35,1.15,.7,1.05);put(A2.sh,RB3(.012,.16,.012),LT,s*(BX.sh+.045),1.3,-.01,0,0,s*.03);
  const Lg=u.legs[i];put(Lg.kn,RB3(.085,.2,.03),AR,s*(BX.hip-.005),.32,-.055,.04,0,0);put(Lg.hip,RB3(.012,.2,.012),LT,s*(BX.hip+.072),.72,0,0,0,0)}
 put(u.hips,RB3(.12,.01,.012),LT,0,1.065,-.104);
 const nick=(typeof MP!='undefined'&&MP.nick)||'PILOTE';put(u.chest,new THREE.PlaneGeometry(.1,.025),c4Tag(nick,'#'+ac.getHexString()),fem?.075:.08,1.4,fem?-.128:-.124,0,Math.PI,0);
 const R2=u.arms[1].sh,w=BW.get(R2),fl=new THREE.Mesh(new THREE.PlaneGeometry(.07,.045),c4M('flag',()=>{const c=mkC(64,40),x=c.getContext('2d');x.fillStyle='#1a3a7a';x.fillRect(0,0,64,40);x.fillStyle='#ffd34a';for(let k=0;k<5;k++){const a=k/5*TAU;x.beginPath();x.arc(32+Math.cos(a)*11,20+Math.sin(a)*11,2.4,0,TAU);x.fill()}x.strokeStyle='#e8f2ff';x.lineWidth=3;x.strokeRect(1.5,1.5,61,37);return new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)})}));
 fl.position.set(BX.sh+.052*(fem?.86:1)-w.x,1.36-w.y,-w.z);fl.rotation.y=Math.PI/2;R2.add(fl)}}
// ----- animations : dos voûté avec l'âge, pans du manteau, visière du casque qui se ferme -----
{const _ah=animHuman;animHuman=function(m,ph,spd,air,aim,talk,look){_ah.apply(this,arguments);const u=m.userData;if(!u||!u.rig)return;
 if(u.stoop){u.sp.rotation.x-=u.stoop*.5;u.chest.rotation.x-=u.stoop*.35;u.neck.rotation.x+=u.stoop*.55}
 if(u.coat){const v=Math.max(0,spd||0);u.coat.rotation.x=lerp(u.coat.rotation.x,Math.min(.35,v*.05)+Math.sin(ph*2)*.03*Math.min(1,v),.15)}
 if(u.visor){const tg=u.visorT!=null?u.visorT:0;u.visA=u.visA==null?tg:u.visA+(tg-u.visA)*Math.min(1,(u.visDt=clamp(t-(u.visLt==null?t:u.visLt),0,.1))*6);u.visLt=t;u.visor.rotation.x=u.visA;}}}
// le pilote : visière relevée dans le hangar, elle se referme (animation) quand il sort sur une planète
function c4Visor(m,open){if(!m||!m.userData||!m.userData.visor)return;m.userData.visorT=open?1.05:0}
{const _fe=footEnter;footEnter=function(){const r=_fe.apply(this,arguments);try{if(FOOT.on&&FOOT.model&&FOOT.model.userData.visor){FOOT.model.userData.visA=1.05;c4Visor(FOOT.model,false);try{tone(300,140,.35,'sawtooth',.03);noise(.4,.08,1800)}catch(e){}}}catch(e){}return r}}
TICK.push(()=>{try{if(typeof WK3!='undefined'&&WK3.m)c4Visor(WK3.m,true)}catch(e){}});
