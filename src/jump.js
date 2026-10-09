// ===== SAUT HYPERSPATIAL : le voyage rapide devient un vrai saut (alignement, charge, tunnel d'étoiles étirées, sortie) =====
let JMP={on:0};
const JN=DESK?320:160,JL=(()=>{const g=new THREE.BufferGeometry(),p=new Float32Array(JN*6);g.setAttribute('position',new THREE.BufferAttribute(p,3));const m=new THREE.LineSegments(g,new THREE.LineBasicMaterial({color:0xcfe8ff,transparent:true,opacity:0,blending:ADDB,depthWrite:false}));m.frustumCulled=false;m.visible=false;m.renderOrder=5;scene.add(m);return m})();
const JSTR=[];for(let i=0;i<JN;i++){const a=Math.random()*TAU,r=4+Math.pow(Math.random(),.6)*70;JSTR.push({x:Math.cos(a)*r,y:Math.sin(a)*r,z:-20-Math.random()*420})}
function jumpK(){const J=JMP;if(!J.on)return 0;if(J.ph=='charge')return Math.pow(Math.min(1,J.t/J.dur),2)*.45;if(J.ph=='tunnel')return 1;return Math.max(0,1-J.t/J.dur)}
{const _ft=fastTravel;fastTravel=function(o){if(JMP.on)return;const why=travelBlock();if(why){toast(why);return}closeMap();if(S.docked){DKA.skip=1;undock();DKA={on:0}}
const dir=_c1.set(o.x-S.pos.x,o.y-S.pos.y,o.z-S.pos.z).normalize(),up=_c2.set(0,1,0).applyQuaternion(S.q),m=new THREE.Matrix4().lookAt(S.pos,_c3.copy(S.pos).add(dir),up);
JMP={on:1,ph:'charge',t:0,dur:2.1,o,q0:S.q.clone(),qT:new QT().setFromRotationMatrix(m),run:_ft,cnt:-1};tone(110,900,2.1,'sawtooth',.045);tone(220,1800,2.1,'sine',.04);noise(2.1,.08,1800)}}
function jumpGo(){const J=JMP,why=travelBlock();if(why){toast('⚡ Saut annulé : '+why.toLowerCase());JMP={on:0};return}J.ph='tunnel';J.t=0;J.dur=.75;J.p0=S.pos.clone();J.run(J.o);FADE.col='200,230,255';FADE.sp=5;
noise(.9,.3,700);tone(1400,60,.9,'sawtooth',.07);shake=Math.min(1.2,shake+.8);if(typeof fxGlow=='function')fxGlow(S.pos.clone(),0xbfe0ff,120,.4,3)}
STICK.push(dt=>{const J=JMP;if(!J.on)return;J.t+=dt;if(S.dead||mode!='space'){JMP={on:0};return}
if(J.ph=='charge'){const k=Math.min(1,J.t/J.dur);S.q.slerp(J.qT,damp(3+k*6,dt));S.spd=Math.min(S.spd,lerp(S.spd,12,damp(2,dt)));S.vel.multiplyScalar(Math.pow(.25,dt));S.thr=.4+k*2;
const c=Math.ceil(J.dur-J.t);if(c!==J.cnt&&c>0){J.cnt=c;tone(700,700,.08,'square',.04)}if(J.t>=J.dur)jumpGo()}
else if(J.ph=='tunnel'){S.thr=2.6;if(J.t>=J.dur){J.ph='arrive';J.t=0;J.dur=1.4;FADE.tg=0;FADE.sp=2.5;tone(300,90,.8,'sine',.08);noise(.6,.25,500);if(typeof fxGlow=='function')fxGlow(S.pos.clone().addScaledVector(fwd(),40),0xd8f0ff,160,.5,2)}}
else if(J.t>=J.dur)JMP={on:0}});
// étoiles étirées autour de la caméra + tunnel à l'écran
TICK.push(dt=>{const k=jumpK();JL.visible=k>.01&&mode=='space';if(!JL.visible)return;JL.position.copy(camera.position);JL.quaternion.copy(camera.quaternion);const P=JL.geometry.attributes.position.array,sp=40+k*1600,len=1+k*k*260;
for(let i=0;i<JN;i++){const s=JSTR[i];s.z+=sp*dt;if(s.z>-8){s.z=-260-Math.random()*200;const a=Math.random()*TAU,r=4+Math.pow(Math.random(),.6)*70;s.x=Math.cos(a)*r;s.y=Math.sin(a)*r}const j=i*6;P[j]=s.x;P[j+1]=s.y;P[j+2]=s.z;P[j+3]=s.x;P[j+4]=s.y;P[j+5]=s.z-len}
JL.geometry.attributes.position.needsUpdate=true;JL.material.opacity=Math.min(1,k*1.6)});
{const _uc=updCam;updCam=function(dt){_uc(dt);const k=jumpK();if(k>.01&&mode=='space'){camera.fov+=k*28;camera.updateProjectionMatrix();if(JMP.ph!='arrive'){camera.position.x+=rv(k*.6);camera.position.y+=rv(k*.6)}}}}
{const _ov=overlay;overlay=function(){_ov();const k=jumpK();if(k<.02||mode!='space')return;const W=innerWidth,H=innerHeight,cx=W/2,cy=H/2,R=Math.hypot(W,H)/2;OX.save();OX.globalCompositeOperation='lighter';
const g=OX.createRadialGradient(cx,cy,R*.15,cx,cy,R);g.addColorStop(0,'rgba(60,120,255,0)');g.addColorStop(1,`rgba(70,130,255,${.35*k})`);OX.fillStyle=g;OX.fillRect(0,0,W,H);
OX.strokeStyle=`rgba(200,230,255,${.5*k})`;OX.lineWidth=1.5;OX.beginPath();for(let i=0;i<(DESK?70:40);i++){const a=Math.random()*TAU,r0=R*(.2+Math.random()*.5),r1=r0+R*(.08+k*.5)*Math.random();OX.moveTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);OX.lineTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1)}OX.stroke();OX.restore();
if(JMP.ph=='charge'){OX.font="800 15px 'Chakra Petch',system-ui";OX.textAlign='center';OX.fillStyle='rgba(205,242,255,.95)';OX.fillText('SAUT HYPERSPATIAL · '+Math.max(0,JMP.dur-JMP.t).toFixed(1)+' s',cx,H*.36);OX.font="600 12px 'Chakra Petch',system-ui";OX.fillStyle='rgba(205,242,255,.75)';OX.fillText('Destination : '+JMP.o.n,cx,H*.36+18)}}}
