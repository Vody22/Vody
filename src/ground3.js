// ===== SOL PLUS NET : micro-détails de près (texture de détail avec mipmaps + filtrage anisotrope) et relief fin (bosses calculées à l'écran) =====
// G3T : R = grain (bruit fractal), G = fissures (bords de cellules), B = cailloux (petits dômes) ; se répète sans couture
const G3T=(()=>{const N=256,d=new Uint8Array(N*N*4),r=rng(4242),acc=new Float32Array(N*N);let amp=.5;
for(const f of[8,16,32,64]){const L=[];for(let i=0;i<f*f;i++)L.push(r());const at=(x,y)=>L[((y%f+f)%f)*f+((x%f+f)%f)];for(let y=0;y<N;y++)for(let x=0;x<N;x++){const X=x/N*f,Y=y/N*f,i=Math.floor(X),j=Math.floor(Y),fx=X-i,fy=Y-j,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy),A=at(i,j),B=at(i+1,j),C=at(i,j+1),D=at(i+1,j+1);acc[y*N+x]+=(A+(B-A)*sx+(C-A)*sy+(A-B-C+D)*sx*sy)*amp}amp*=.5}
let mn=1e9,mx=-1e9;for(const v of acc){mn=Math.min(mn,v);mx=Math.max(mx,v)}
// fissures : cellules de Voronoï sur une grille 7×7 décalée (qui boucle), distance au bord = F2 - F1
const G=7,P=[];for(let j=0;j<G;j++)for(let i=0;i<G;i++)P.push([(i+.15+r()*.7)/G,(j+.15+r()*.7)/G]);
const peb=new Float32Array(N*N);for(let k=0;k<64;k++){const cx=r()*N,cy=r()*N,rad=2.5+r()*3.5,dark=false;for(let y=-6;y<=6;y++)for(let x=-6;x<=6;x++){const dd=Math.hypot(x,y)/rad;if(dd>=1)continue;const X=((Math.round(cx)+x)%N+N)%N,Y=((Math.round(cy)+y)%N+N)%N,v=Math.sqrt(1-dd*dd)*(dark?-.6:1);if(Math.abs(v)>Math.abs(peb[Y*N+X]))peb[Y*N+X]=v}}
for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=x/N,v=y/N,ci=Math.floor(u*G),cj=Math.floor(v*G);let f1=9,f2=9;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const ii=((ci+a)%G+G)%G,jj=((cj+b)%G+G)%G,p=P[jj*G+ii];
const ox=(ci+a<0?-1:ci+a>=G?1:0),oy=(cj+b<0?-1:cj+b>=G?1:0),dx=u-(p[0]+ox),dy=v-(p[1]+oy),dd=dx*dx+dy*dy;if(dd<f1){f2=f1;f1=dd}else if(dd<f2)f2=dd}
const e=Math.min(1,(Math.sqrt(f2)-Math.sqrt(f1))*G*1.6),i=y*N+x;d[i*4]=(acc[i]-mn)/(mx-mn)*255;d[i*4+1]=e*255;d[i*4+2]=clamp(128+peb[i]*127,0,255);d[i*4+3]=255}
const t=new THREE.DataTexture(d,N,N,THREE.RGBAFormat);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=Math.min(8,R3.capabilities.getMaxAnisotropy());t.needsUpdate=true;return t})();
const G3_DECL=`uniform sampler2D g3t;
vec3 g3Bump(vec3 sp,vec3 sn,float h){
#if defined(GL_OES_standard_derivatives)||__VERSION__>=300
vec3 sx=dFdx(sp),sy=dFdy(sp),r1=cross(sy,sn),r2=cross(sn,sx);float det=dot(sx,r1);vec3 gr=sign(det)*(dFdx(h)*r1+dFdy(h)*r2);return normalize(abs(det)*sn-gr);
#else
return sn;
#endif
}`;
// détails selon le type de planète (0 volcanique, 1 désert, 2 jungle, 3 océan, 4 glace, 5 cristal), seulement près de la caméra
const G3_COL=`float g3h=0.,g3nd=0.;{g3nd=1.-smoothstep(18.,75.,camD);if(g3nd>.001){vec4 ta=texture2D(g3t,wp.xz*.29),tb=texture2D(g3t,wp.xz*1.13+vec2(.37,.11));float g3g=tb.r*.65+ta.r*.35,g3c=1.-smoothstep(.02,.12,ta.g),pb=max(ta.b*2.-1.,0.),g3f=1.-smoothstep(.25,.6,slope),k=g3nd;
if(ttype<.5){dc*=mix(1.,.55,g3c*k*g3f);dc*=1.+(g3g-.5)*.22*k;totalEmissiveRadiance+=vec3(1.,.3,.05)*g3c*smoothstep(.6,.85,ta.r)*k*.3*g3f;g3h=g3g*.5-g3c*.8+pb*.3;}
else if(ttype<1.5){float rp=sin(dot(wp.xz,vec2(2.3,1.05))+ta.r*7.)*.5+.5;dc*=1.+(rp-.5)*.1*k*g3f+(g3g-.5)*.14*k;dc=mix(dc,dc*vec3(.8,.74,.68),pb*.45*k);g3h=rp*.5*g3f+g3g*.35+pb*.4;}
else if(ttype<3.5){dc*=1.+(g3g-.5)*.2*k;dc=mix(dc,vec3(.46,.44,.4),smoothstep(.35,.85,pb)*.3*k);g3h=g3g*.55+pb*.35;}
else if(ttype<4.5){dc=mix(dc,dc*1.08+vec3(.03,.05,.08),g3c*.32*k);dc*=1.+(g3g-.5)*.08*k;g3h=g3g*.35-g3c*.16;}
else{dc*=1.+(g3g-.5)*.18*k;dc=mix(dc,vec3(.75,.55,1.),smoothstep(.5,.9,pb)*.35*k);totalEmissiveRadiance+=vec3(.5,.3,1.)*smoothstep(.7,.95,pb)*k*.3;g3h=g3g*.45+pb*.35-g3c*.25;}
g3h*=k;}}`;
function g3Patch(sh){if(sh.fragmentShader.indexOf('diffuseColor.rgb=dc;')<0)return;sh.uniforms.g3t={value:G3T};
sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+G3_DECL).replace('diffuseColor.rgb=dc;',G3_COL+'diffuseColor.rgb=dc;')
.replace('#include <emissivemap_fragment>','if(g3nd>.001)normal=g3Bump(-vViewPosition,normal,g3h*.09);\n#include <emissivemap_fragment>')}
{const _dt=detailTerrain;detailTerrain=function(mat,ty){_dt(mat,ty);const ob=mat.onBeforeCompile,ck=mat.customProgramCacheKey;mat.onBeforeCompile=(sh,r)=>{ob(sh,r);g3Patch(sh)};mat.customProgramCacheKey=()=>(ck?ck():'')+'g3';mat.needsUpdate=true}}
