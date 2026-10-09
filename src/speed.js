// ===== SENSATION DE VITESSE : poussière spatiale en traînées, souffle du boost, voile de vitesse =====
const SD=(()=>{const n=DESK?720:360,B=DESK?440:360,p=new Float32Array(n*3),seg=new Float32Array(n*6),col=new Float32Array(n*6),tint=new Float32Array(n),r=rng(91);
for(let i=0;i<n*3;i++)p[i]=(r()-.5)*B;for(let i=0;i<n;i++)tint[i]=.5+r()*.5;
const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(seg,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
const m=new THREE.LineSegments(g,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,blending:ADDB,depthWrite:false}));m.frustumCulled=false;m.renderOrder=2;scene.add(m);return{n,B,p,seg,col,g,m,tint}})();
updDust=function(){DUST.m.visible=false};
let BWAS=false;
function updStreaks(dt){const b=isBoost()&&!S.docked&&!S.dead&&mode=='space';if(b&&!BWAS&&S.spd>20)SFX.whoosh();BWAS=b;
const D=SD,on=mode=='space'&&!S.dead;D.m.visible=on;if(!on)return;
// chaque grain est immobile dans l'espace : on dessine sa traînée dans le sens où il défile devant le vaisseau
const c=camera.position,B=D.B,hb=B/2,v=S.vel,sp=v.length(),tau=.03+fovK*.042+Math.min(.03,sp*.00004),bk=clamp((sp-15)/150,0,1),P=D.p,Gs=D.seg,C=D.col;
for(let i=0;i<D.n;i++){const i3=i*3;let d2=0;for(let a=0;a<3;a++){const cc=a==0?c.x:a==1?c.y:c.z;let w=P[i3+a];const d=w-cc;if(d>hb)w-=B*Math.ceil((d-hb)/B);else if(d<-hb)w+=B*Math.ceil((-hb-d)/B);P[i3+a]=w;d2+=(w-cc)*(w-cc)}
const dist=Math.sqrt(d2),fade=clamp((hb-dist)/(hb*.45),0,1)*clamp((dist-5)/16,0,1),br=(.16+.84*bk)*fade*D.tint[i],i6=i*6;
Gs[i6]=P[i3];Gs[i6+1]=P[i3+1];Gs[i6+2]=P[i3+2];Gs[i6+3]=P[i3]+v.x*tau+.03;Gs[i6+4]=P[i3+1]+v.y*tau+.03;Gs[i6+5]=P[i3+2]+v.z*tau;
C[i6]=br*.78;C[i6+1]=br*.9;C[i6+2]=br;C[i6+3]=C[i6+4]=C[i6+5]=0}
D.g.attributes.position.needsUpdate=true;D.g.attributes.color.needsUpdate=true}
// voile bleuté sur les bords pendant le boost (toutes les vues)
function speedVeil(W,H){if(fovK<.03||mode!='space'||S.docked||S.dead)return;const k=fovK*clamp(S.spd/Math.max(1,boostSpd()),0,1),g=OX.createRadialGradient(W/2,H/2,Math.min(W,H)*.28,W/2,H/2,Math.max(W,H)*.72);
g.addColorStop(0,'rgba(40,90,200,0)');g.addColorStop(1,`rgba(30,70,170,${k*.38})`);OX.fillStyle=g;OX.fillRect(0,0,W,H)}
SFX.whoosh=()=>{noise(1.1,.32,5200);tone(70,210,.9,'sawtooth',.045);tone(140,420,.7,'triangle',.03,.05)};
