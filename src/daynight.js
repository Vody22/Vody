// ===== JOUR ET NUIT SUR LES PLANÈTES : soleil qui tourne, couchers colorés, nuits étoilées, lune, lampes, phares, reflets =====
const DAYLEN=720;// une journée complète = 12 minutes (même heure pour tous les joueurs)
const DN={force:null,ph:.25,el:1,day:1,night:0,set:0,envT:0,envDay:-1,pm:null,env:null};
const SKY_FS=`uniform vec3 hor,top,sunD,sunC,glowC;uniform float night,set,tm;varying vec3 vD;
float hs(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
void main(){vec3 d=normalize(vD);float y=d.y;vec3 c=mix(hor,top,smoothstep(-.02,.55,y));float mu=max(dot(d,sunD),0.);
c+=sunC*(pow(mu,7.)*.28+pow(mu,60.)*.55)*(1.-night*.9);c+=glowC*set*pow(mu,2.2)*(1.-smoothstep(-.05,.5,y))*1.25;c+=glowC*set*.18*(1.-smoothstep(0.,.25,abs(y)));
if(night>.01){vec3 q=d*230.;vec3 i=floor(q);float h=hs(i);if(h>.982){vec3 f=fract(q)-.5;float s=smoothstep(.24,0.,length(f))*(.6+.4*sin(tm*(1.5+h*4.)+h*50.));c+=mix(vec3(1.,.85,.7),vec3(.8,.9,1.),hs(i+3.))*s*night*smoothstep(0.,.12,y)*(h-.982)*55.;}
float b=1.-abs(dot(d,normalize(vec3(.35,.75,.55))));c+=vec3(.2,.18,.32)*pow(max(0.,b*1.0),14.)*night*smoothstep(0.,.25,y)*.9;}
gl_FragColor=vec4(c,1.);}`;
const SKY_VS='varying vec3 vD;void main(){vD=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
const _dc1=new THREE.Color(),_dc2=new THREE.Color(),_dc3=new THREE.Color(),_dv=new V3(),_dv2=new V3(),DN_OR=new THREE.Color(1,.5,.28),DN_NIGHT=new THREE.Color(.012,.02,.045),DN_MOON=new THREE.Color(.62,.72,1),DN_WHITE=new THREE.Color(1,1,1);
const smooth=(a,b,x)=>{const k=clamp((x-a)/(b-a),0,1);return k*k*(3-2*k)};
function dnPhase(F){return DN.force!=null?DN.force:((Date.now()/1000/DAYLEN)+F.dnOff)%1}
function dnHour(){return((6.5+DN.ph*24)%24)}
// ----- reflets d'environnement propres à la planète (ciel + sol + soleil) -----
function planetEnv(top,hor,ground,sunDir,sunCol){try{if(!DN.pm)DN.pm=new THREE.PMREMGenerator(R3);const es=new THREE.Scene(),g=new THREE.SphereGeometry(50,32,16),p=g.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color();
for(let i=0;i<p.count;i++){const y=p.getY(i)/50;if(y>0)c.copy(hor).lerp(top,Math.min(1,y*1.8));else c.copy(hor).lerp(ground,Math.min(1,-y*5));col.set([c.r,c.g,c.b],i*3)}g.setAttribute('color',new THREE.BufferAttribute(col,3));
const sm=new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide});es.add(new THREE.Mesh(g,sm));const sg=new THREE.SphereGeometry(5,12,8),sun=new THREE.Mesh(sg,new THREE.MeshBasicMaterial({color:sunCol.clone().multiplyScalar(3)}));sun.position.copy(sunDir).multiplyScalar(40);if(sunDir.y>-.05)es.add(sun);
const rt=DN.pm.fromScene(es,.03);g.dispose();sg.dispose();sm.dispose();sun.material.dispose();if(DN.env)DN.env.dispose();DN.env=rt;SURF.scene.environment=rt.texture}catch(e){console.warn(e)}}
// ----- entrée sur une planète : ciel en shader, lune, phare, flaques de lumière sous les lampes -----
const _dnE=SURF.onEnter;SURF.onEnter=function(F,sc){_dnE(F,sc);const L=lightFor(F.p.x,F.p.y,F.p.z);F.dnOff=h3(F.p.x|0,F.p.z|0,5,77);F.fogC0=F.fogC.clone();F.hemiI0=F.hemiI;F.lcol=L.col.clone();
const[HEMI,DLT]=sc.children;F.HEMI=HEMI;F.DL=DLT;F.dlI0=DLT.intensity;F.hemiCol0=HEMI.color.clone();F.hemiG0=HEMI.groundColor.clone();
F.top0=F.fogC0.clone().lerp(new THREE.Color(F.ty=='Volcanique'?0x120404:F.ty=='Glacée'?0x5a8ec4:0x1c3a78),.75);
F.skyU={hor:{value:new THREE.Color()},top:{value:new THREE.Color()},sunD:{value:new V3(0,1,0)},sunC:{value:F.lcol.clone()},glowC:{value:new THREE.Color(1,.42,.18)},night:{value:0},set:{value:0},tm:TM};
F.dome.material=new THREE.ShaderMaterial({uniforms:F.skyU,vertexShader:SKY_VS,fragmentShader:SKY_FS,side:THREE.BackSide,depthWrite:false,fog:false});
F.sunCol0=F.sunS.material.color.clone();
// phare (toujours présent pour ne pas recompiler les shaders)
const hl=new THREE.SpotLight(0xfff0d8,0,300,.48,.55,1);hl.castShadow=false;sc.add(hl,hl.target);F.headL=hl;const hs=sprite(0xfff4e0,5,.9);hs.material=hs.material.clone();sc.add(hs);F.headS=hs;
// flaques de lumière des lampadaires
F.pools=[];if(GR&&GR.lamps){const PM2=new THREE.MeshBasicMaterial({map:GLOW,color:0xffc070,transparent:true,opacity:0,blending:ADDB,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3});
for(const l of GR.lamps){const m=new THREE.Mesh(new THREE.PlaneGeometry(22,22),PM2);m.rotation.x=-Math.PI/2;m.position.set(l.position.x,F.h(l.position.x,l.position.z)+.2,l.position.z);sc.add(m)}F.poolM=PM2}
for(const c of F.clouds)c.base=c.s.material.color.clone();if(F.wm&&F.wm.material)F.wmBase=F.wm.material.color.clone();
DN.envDay=-1;DN.envT=0;dnUpdate(F,0,true)};
// ----- calcul de l'heure et de l'éclairage -----
function dnUpdate(F,dt,first){const ph=dnPhase(F);DN.ph=ph;const a=ph*TAU,sd=_dv.set(Math.cos(a),Math.sin(a)*.95+.12,.35).normalize(),el=sd.y;DN.el=el;
const day=smooth(-.06,.14,el),night=1-smooth(-.17,.01,el),set=(1-smooth(.04,.4,el))*smooth(-.22,-.02,el);DN.day=day;DN.night=night;DN.set=set;
// couleurs du ciel et du brouillard
const fog=_dc1.copy(F.fogC0).lerp(_dc2.copy(F.fogC0).lerp(DN_OR,.45).multiplyScalar(.92),set*.85);_dc3.copy(F.fogC0).multiplyScalar(.09).add(DN_NIGHT);fog.lerp(_dc3,night);F.fog.color.copy(fog);SURF.scene.background=F.fog.color;
const U=F.skyU;U.hor.value.copy(fog);U.top.value.copy(F.top0).lerp(_dc2.set(.28,.16,.36),set*.55).lerp(_dc3.set(.004,.008,.024),night);U.sunD.value.copy(sd);U.night.value=night;U.set.value=set;
// soleil le jour, lune la nuit
const DL=F.DL,HEMI=F.HEMI,moon=el<-.02;if(!moon){F.sunDir.copy(sd);DL.color.copy(F.lcol).lerp(DN_OR,set*.75);DL.intensity=F.dlI0*day}else{F.sunDir.set(-sd.x,Math.max(.3,-sd.y),-sd.z+.25).normalize();DL.color.copy(DN_MOON);DL.intensity=.32*night}
F.sunS.material.color.copy(moon?_dc2.set(.8,.85,1):_dc2.copy(F.sunCol0).lerp(DN_OR,set*.6));F.sunS.scale.setScalar(moon?260:700);F.sunS.material.opacity=moon?.85*night:.9;const sh2=F.sunS.children[0];if(sh2)sh2.material.opacity=moon?.12*night:.35;
F.hemiI=F.hemiI0*lerp(1,.34,night)*(1-set*.2);HEMI.color.copy(F.hemiCol0).lerp(_dc2.set(.35,.45,.7),night);HEMI.groundColor.copy(F.hemiG0).multiplyScalar(1-night*.7);
// eau : ciel reflété, lumière, ambiance
if(F.lmat&&F.lmat.uniforms){const u=F.lmat.uniforms;if(u.sky)u.sky.value.copy(fog).lerp(DN_WHITE,.12*(1-night));if(u.sunCol)u.sunCol.value.copy(DL.color).multiplyScalar(DL.intensity/Math.max(.3,F.dlI0)*(moon?2.2:1));if(u.amb)u.amb.value.copy(HEMI.color).multiplyScalar(F.hemiI*.75)}
// nuages, météo, lampes (rafraîchis 4 fois par seconde)
F.dnT=(F.dnT||0)-dt;if(F.dnT<=0||first){F.dnT=.25;const lv=.1+.9*day;for(const c of F.clouds)if(c.base)c.s.material.color.copy(c.base).lerp(DN_OR,set*.4).multiplyScalar(lv);
if(F.wmBase&&F.wm.material.blending!==ADDB)F.wm.material.color.copy(F.wmBase).multiplyScalar(.25+.75*day);const cc=_dc2.setStyle('rgb('+CLOUDC+')');CLOUDC_N=`${Math.round(cc.r*255*lv)},${Math.round(cc.g*255*lv)},${Math.round(cc.b*255*lv)}`;
if(F.poolM)F.poolM.opacity=night*.55;if(GR&&GR.lamps)for(const l of GR.lamps)l.scale.setScalar(6+night*7);if(GR&&GR.plants&&GR.plants[0])GR.plants[0].bulb.material.emissiveIntensity=.7+night*1.6}
// reflets : on régénère quand la lumière a changé
DN.envT-=dt;if((DN.envDay<0||(DESK&&DN.envT<=0&&Math.abs(DN.envDay-(day+night*.5))>.12))){DN.envT=6;DN.envDay=day+night*.5;planetEnv(U.top.value,fog,_dc2.copy(F.fogC0).multiplyScalar(.35*(.15+.85*day)),sd,DL.color.clone().multiplyScalar(day))}
// phare du vaisseau ou lampe frontale
const hl=F.headL,hs=F.headS,k=smooth(.15,.75,night);if(hl){if(FOOT.on&&FOOT.model){const hd=FOOT.model.userData.head;hd.getWorldPosition(_dv2);hl.position.copy(_dv2);const cp=FOOT.cp||0;hl.target.position.set(_dv2.x-Math.sin(FOOT.cy)*40,_dv2.y-8-cp*20,_dv2.z-Math.cos(FOOT.cy)*40);hl.intensity=k*1.7;hl.distance=150;hl.angle=.55;hs.visible=false}
else{fwd();hl.position.copy(S.pos).addScaledVector(_f,7);hl.target.position.copy(S.pos).addScaledVector(_f,140);hl.intensity=S.dead?0:k*3;hl.distance=360;hl.angle=.42;hs.visible=k>.02&&!S.dead&&ship.visible&&!ckActive();hs.position.copy(S.pos).addScaledVector(_f,9.6);hs.material.opacity=k*.9}hl.target.updateMatrixWorld()}}
let CLOUDC_N=null;
const _dnT=SURF.tick;SURF.tick=function(dt,F){if(_dnT)_dnT(dt,F);if(F&&F.skyU)dnUpdate(F,dt)};
// voile des nuages (surimpression) assombri la nuit
const _dnOv=overlay;overlay=function(){const keep=CLOUDC;if(mode=='surf'&&CLOUDC_N)CLOUDC=CLOUDC_N;_dnOv();CLOUDC=keep};
// rayons de soleil atténués la nuit
if(typeof updGodRays=='function'){const _gr=updGodRays;updGodRays=function(){_gr();if(GRP&&mode=='surf')GRP.uniforms.str.value*=.1+.9*DN.day}}
// heure locale dans le panneau d'infos
const _dnCI=contentInfo;contentInfo=function(){const s=_dnCI();if(mode!='surf'||!GR||!GR.F||!GR.F.skyU)return s;const h=dnHour(),hh=Math.floor(h),mm=Math.floor((h-hh)*60),ic=ICO(DN.night>.5?'moon':DN.set>.35?'dawn':'sun'),lb=DN.night>.5?'Nuit':DN.set>.35?(h<12?'Lever du soleil':'Coucher du soleil'):'Jour';
return(s?s+'<br>':'')+`<span style="opacity:.85">${ic} ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')} · ${lb}</span>`};
