// ===== CIEL DE L'ESPACE : PANORAMA DE WILLIAM (sky4.js, après mdl4.js) =====
// public/models/sky4k.jpg (PC) / sky2k.jpg (mobile), tirés de space_nebula_6k.jpg (équirectangulaire) → carte de la sphère NEB (gfx.js) à la place de la nébuleuse calculée,
// puis reflets d'environnement (scene.environment) recalculés à partir du nouveau ciel. Le rendu du jeu est en espace linéaire (pas d'outputEncoding) : texture laissée en LinearEncoding.
const SKY4={tex:null,env:null,t:0};
function sky4Env(){try{const pm=new THREE.PMREMGenerator(R3),es=new THREE.Scene();es.add(new THREE.Mesh(new THREE.SphereGeometry(40,32,16),new THREE.MeshBasicMaterial({map:SKY4.tex,side:THREE.BackSide})));
 const k1=new THREE.Mesh(new THREE.SphereGeometry(5,16,8),new THREE.MeshBasicMaterial({color:0xfff2dd}));k1.position.set(20,22,10);es.add(k1);const env=pm.fromScene(es,.03).texture;pm.dispose();
 if(SKY4.env&&SKY4.env!==env)try{SKY4.env.dispose()}catch(e){}SKY4.env=env;scene.environment=env;if(typeof SURF!='undefined'&&SURF.scene&&DESK)SURF.scene.environment=env}catch(e){console.warn('sky4 env',e)}}
function sky4Apply(){if(!SKY4.tex||typeof NEB=='undefined'||!NEB||window.SKYOFF)return;if(NEB.material.map!==SKY4.tex){NEB.material.map=SKY4.tex;NEB.material.needsUpdate=true;sky4Env()}}
function sky4Load(){if(/[?&]nosky\b/.test(location.search))return;new THREE.TextureLoader().load('models/sky'+(DESK?'4k':'2k')+'.jpg',tx=>{tx.anisotropy=4;tx.generateMipmaps=true;tx.minFilter=THREE.LinearMipmapLinearFilter;SKY4.tex=tx;sky4Apply()},null,e=>console.warn('sky4',e))}
// la nébuleuse calculée au démarrage (PC) peut arriver après : on réapplique pendant les premières secondes
{let lt=performance.now();TICK.push(()=>{const n=performance.now();if(n-lt<1000)return;lt=n;SKY4.t++;if(SKY4.t<30)sky4Apply()})}
setTimeout(sky4Load,300);
