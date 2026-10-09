// ===== VISUELS : couronne solaire animée =====
const CORFS=`uniform vec3 col;uniform float tm;varying vec2 vU;void main(){vec2 p=vU-.5;float d=length(p)*2.;float a=atan(p.y,p.x);
float ray=pow(abs(sin(a*7.+sin(a*3.+tm*.3)*1.5+tm*.15)),6.)*.6+pow(abs(sin(a*13.-tm*.22+sin(a*5.)*.8)),10.)*.45;
float glow=pow(smoothstep(1.,.37,d),2.4);float rr=smoothstep(.98,.4,d)*smoothstep(.34,.42,d)*ray;gl_FragColor=vec4(col*(glow*.16+rr*.42),1.);}`;
const _bsun=buildSun;buildSun=function(s){const g=_bsun(s);const m=new THREE.Mesh(new THREE.PlaneGeometry(s.r*5.2,s.r*5.2),new THREE.ShaderMaterial({uniforms:{col:{value:new THREE.Color(s.col).lerp(new THREE.Color(1,1,1),.25)},tm:g.userData.SU.tm},
vertexShader:'varying vec2 vU;void main(){vU=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:CORFS,transparent:true,blending:ADDB,depthWrite:false}));m.frustumCulled=false;g.add(m);g.userData.cor=m;return g};
