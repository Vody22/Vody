// A unique assembled model for every playable hull, enemy family and traffic job.
var SFFleet29=(function(T){
 const definitions={
  player_eclaireur:['Spitfire','Éclaireur','Joueur','scout',0x9bd8f2,12],
  player_intercepteur:['Striker','Intercepteur Vif','Joueur','dart',0x52cfff,12],
  player_cargo:['Dispatcher','Cargo Mule','Joueur','cargo',0xe9b36d,15],
  player_faucon:['Insurgent','Chasseur Faucon','Joueur','fighter',0xffa65e,14],
  player_leviathan:['Executioner','Croiseur Léviathan','Joueur','capital',0x8cb7ff,19],
  player_prospecteur:['Bob','Prospecteur','Joueur','drill',0xffc35a,15],
  player_explorateur:['Zenith','Pathfinder','Joueur','survey',0x6ef6e0,13],
  player_sentinelle:['Challenger','Sentinelle','Joueur','guardian',0xf4d383,16],
  player_mastodonte:['Imperial','Mastodonte','Joueur','industrial',0xffc745,21],
  enemy_pirate:['Omen','Corsaire pirate','Ennemis','raider',0xff654b,12],
  enemy_interceptor:['Bob','Intercepteur pirate','Ennemis','intercept',0xffa252,10.5],
  enemy_heavy:['Pancake','Croiseur pirate','Ennemis','heavy',0xee718b,16],
  enemy_support:['craft_cargoB','Soutien pirate','Ennemis','support',0x61f2ee,12],
  enemy_swarm:['craft_racer','Drone d’essaim','Ennemis','drone',0xff6738,3.8],
  enemy_stealth:['Striker','Chasseur furtif','Ennemis','stealth',0xb28bff,11],
  enemy_bomber:['craft_cargoA','Bombardier','Ennemis','bomber',0xff9960,22],
  enemy_carrier:['Imperial','Porte-chasseurs','Ennemis','carrier',0xffa64b,37],
  enemy_xil:['organic','Xil','Ennemis','xil',0x74ffb7,7],
  enemy_xil_large:['organic','Xil alpha','Ennemis','xil_large',0xc1ff74,14],
  enemy_boss:['Executioner','Amiral pirate','Ennemis','admiral',0xe086ff,25],
  enemy_kraken:['Imperial','Kraken de fer','Boss','kraken',0xff5a62,25],
  enemy_generator:['craft_speederD','Générateur du Kraken','Boss','generator',0x68e5ff,16],
  npc_cargo:['craft_cargoA','Cargo civil','PNJ','civil_cargo',0xecc477,27],
  npc_miner:['craft_miner','Mineur','PNJ','civil_miner',0xeab96a,14],
  npc_shuttle:['craft_speederA','Navette','PNJ','shuttle',0x9feaff,14],
  npc_courier:['craft_speederB','Courrier','PNJ','courier',0xc5a0ff,12],
  npc_patrol:['craft_speederC','Patrouille','PNJ','patrol',0x699dff,14],
  npc_escort:['craft_speederD','Escorte de convoi','PNJ','escort',0x85bbff,14],
  npc_tug:['craft_cargoB','Remorqueur','PNJ','tug',0xffd675,14],
  npc_tourist:['Pancake','Croisière touristique','PNJ','tourist',0x9bece7,14],
  npc_racer:['craft_racer','Vaisseau de course','PNJ','racer',0xffab65,12],
  npc_squad:['Bob','Escadrille','PNJ','squad',0x87b7ff,14],
  npc_police:['craft_speederC','Police de l’Alliance','PNJ','police',0x5f9aff,12],
  npc_customs:['craft_speederD','Douane','PNJ','customs',0xa3caff,12],
  enemy_hunter:['Bob','Chasseur de primes','Ennemis','hunter',0xff8f44,11],
  ally_wing:['Challenger','Ailier allié','Alliés','wing',0x83e7b8,12],
  ally_freighter:['Dispatcher','Cargo d’escorte','Alliés','freighter',0xe8c374,28],
  story_corbeau:['Omen','Vaisseau du Corbeau','Boss','corbeau',0xff4757,26],
  world_dreadnought:['Executioner','Dreadnought','Boss','dreadnought',0xff784e,190],
  story_nemesis:['Executioner','Croiseur Némésis','Boss','nemesis',0xf26a68,170],
  story_vengeur:['Imperial','Vengeur de Kessler','Boss','vengeur',0xc481ff,170]
 };
 const assets={},templates={},textures={};
 function floats(encoded,C,divisor){const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));return Float32Array.from(new C(bytes.buffer),x=>x/divisor);}
 function asset(key){if(assets[key])return assets[key];const d=SF_FLEET29_DATA[key];if(!d)throw new Error('Missing fleet asset');
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(floats(d.position,Int16Array,32767),3));g.setAttribute('normal',new T.BufferAttribute(floats(d.normal,Int8Array,127),3));if(d.uv)g.setAttribute('uv',new T.BufferAttribute(floats(d.uv,Uint16Array,65535),2));if(d.color)g.setAttribute('color',new T.BufferAttribute(Uint8Array.from(atob(d.color),c=>c.charCodeAt(0)),3,true));g.computeBoundingBox();g.computeBoundingSphere();
  let map=null;if(d.texture){map=textures[key]=new T.TextureLoader().load('data:image/jpeg;base64,'+d.texture);map.flipY=true;map.encoding=T.sRGBEncoding;map.anisotropy=2;}
  const mat=new T.MeshStandardMaterial({color:0xffffff,map,vertexColors:!!d.color,metalness:.28,roughness:.48});mat.name='fleet29-hull';return assets[key]={geometry:g,material:mat};
 }
 function merged(list){let count=0;const parts=list.map(mesh=>{mesh.updateMatrix();const g=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();g.applyMatrix4(mesh.matrix);count+=g.attributes.position.count;return g;});const p=new Float32Array(count*3),n=new Float32Array(count*3);let o=0;for(const g of parts){p.set(g.attributes.position.array,o);n.set(g.attributes.normal.array,o);o+=g.attributes.position.array.length;g.dispose();}const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('normal',new T.BufferAttribute(n,3));g.computeBoundingSphere();return g;}
 function template(key){
  const [base,,category,form,glow,radius]=definitions[key],root=new T.Group(),metal=[],lights=[];
  function add(geometry,x,y,z,signal=false,rx=0,ry=0,rz=0){const mesh=new T.Mesh(geometry);mesh.position.set(x,y,z);mesh.rotation.set(rx,ry,rz);(signal?lights:metal).push(mesh);}
  const box=(x,y,z,w,h,l,signal=false)=>{
    const g=new T.BoxGeometry(w,h,l,signal?1:2,signal?1:2,signal?1:2);
    if(!signal){const p=g.attributes.position,r=Math.min(w,h,l)*.16,v=new T.Vector3(),q=new T.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);q.set(Math.max(-w/2+r,Math.min(w/2-r,v.x)),Math.max(-h/2+r,Math.min(h/2-r,v.y)),Math.max(-l/2+r,Math.min(l/2-r,v.z)));v.sub(q).normalize().multiplyScalar(r).add(q);p.setXYZ(i,v.x,v.y,v.z);}g.computeVertexNormals();}
    add(g,x,y,z,signal);
  };
  const ring=(x,y,z,r,signal=false)=>add(new T.TorusGeometry(r,.035,5,16),x,y,z,signal,Math.PI/2);
  if(base==='organic'){
    const g=new T.IcosahedronGeometry(.62,2);g.scale(.65,.42,1.2);root.add(new T.Mesh(g,new T.MeshStandardMaterial({color:form==='xil'?0x164c43:0x354d29,roughness:.3,metalness:.1})));
    for(let i=0;i<(form==='xil'?6:8);i++){const a=i/8*Math.PI*2;add(new T.ConeGeometry(.11,.8,7),Math.cos(a)*.36,Math.sin(a)*.24,.65,false,Math.PI/2+Math.cos(a)*.4,0,a);ring(Math.cos(a)*.35,.18,Math.sin(a)*.45,.12,true);}add(new T.SphereGeometry(.16,12,8),0,.1,-.7,true);
  }else{const a=asset(base);const mesh=new T.Mesh(a.geometry,a.material);mesh.name='hull';root.add(mesh);}
  // Dedicated equipment changes the silhouette, rather than only recolouring a hull.
  const guns=['fighter','guardian','intercept','heavy','admiral','wing','squad','patrol','escort','corbeau','nemesis','vengeur','dreadnought','capital','kraken','police','hunter'];
  if(guns.includes(form))for(const s of [-1,1]){box(s*.43,-.08,-.32,.045,.07,.62);box(s*.43,-.08,-.64,.055,.055,.045,true);}
  if(['cargo','industrial','civil_cargo','freighter','carrier','bomber'].includes(form))for(const s of [-1,1])for(let i=0;i<(form==='industrial'?4:3);i++)box(s*.46,-.15,-.22+i*.19,.24,.21,.16);
  if(['survey','scout','tourist','shuttle','courier','customs'].includes(form)){ring(0,.29,.13,form==='tourist'?.29:.16);box(0,.37,.13,.018,.28,.018,true);}
  if(form==='police')for(const s of [-1,1])box(s*.25,.24,.1,.15,.08,.2,true);
  if(form==='hunter')for(const s of [-1,1])box(s*.57,.08,.12,.2,.14,.45);
  if(form==='racer'){box(0,.22,.4,.7,.035,.12);box(0,.32,.4,.04,.25,.2);}
  if(form==='guardian')for(const s of [-1,1])for(const z of [-.2,.15])box(s*.35,.2,z,.22,.09,.22);
  if(form==='squad')for(const s of [-1,1])box(s*.58,.02,-.22,.05,.06,.5);
  if(form==='freighter'){box(0,.3,.25,.32,.2,.4);ring(0,.44,.25,.12);}
  if(form==='stealth')for(const s of [-1,1])box(s*.43,.13,.15,.42,.035,.35);
  if(['support','generator'].includes(form))for(const s of [-1,1]){ring(s*.4,.23,0,.25);ring(s*.4,.25,0,.19,true);}
  if(['drill','civil_miner','industrial'].includes(form))for(const s of [-1,1]){add(new T.ConeGeometry(.12,.55,8),s*.48,-.15,-.45,false,-Math.PI/2);box(s*.48,-.15,-.15,.18,.2,.2);}
  if(form==='drill')for(const s of [-1,1])box(s*.38,.25,.25,.25,.2,.35);
  if(['dart','stealth','racer','drone','raider'].includes(form))for(const s of [-1,1]){add(new T.ConeGeometry(.15,.64,3),s*.5,.02,.05,false,0,0,s*-.7);box(s*.52,.08,-.07,.025,.04,.35,true);}
  if(form==='carrier'){box(0,-.2,-.72,.6,.35,.14);box(0,-.18,-.8,.47,.18,.025,true);}
  if(form==='bomber')for(const s of [-1,1])for(let i=0;i<3;i++)add(new T.SphereGeometry(.08,8,6),s*.3,-.4,-.25+i*.2,true);
  if(['heavy','capital','admiral','kraken','dreadnought','nemesis','vengeur'].includes(form)){for(const s of [-1,1]){add(new T.CylinderGeometry(.1,.14,.07,8),s*.25,.22,-.13);box(s*.25,.28,-.35,.035,.035,.45);box(s*.32,.13,.35,.09,.35,.18);}box(0,.24,.28,.2,.16,.32);}
  if(form==='kraken')for(let i=0;i<6;i++){const a=i/6*Math.PI*2;add(new T.ConeGeometry(.1,.5,6),Math.cos(a)*.6,Math.sin(a)*.32,.15,false,0,0,-a);}
  if(form==='tug'){box(0,-.28,-.45,.65,.1,.08);for(const s of [-1,1])box(s*.32,-.25,-.57,.08,.15,.4);}
  if(form==='stealth'){for(const mesh of root.children){mesh.material=mesh.material.clone();mesh.material.color.setHex(0x222335);}}
  if(form==='vengeur')ring(0,.3,.1,.4,true);
  if(form==='capital')for(const s of [-1,1])box(s*.62,-.1,.2,.2,.16,.6);
  if(form==='admiral'){box(0,.42,.25,.12,.5,.35);box(0,.69,.25,.13,.04,.36,true);}
  if(form==='dreadnought')for(const s of [-1,1])for(let i=0;i<3;i++)box(s*(.4+i*.1),-.15,-.3,.07,.1,.8-i*.1);
  if(form==='nemesis')for(const s of [-1,1])box(s*.31,-.13,-.62,.14,.2,.7);
  if(metal.length){const mat=new T.MeshStandardMaterial({color:category==='Ennemis'||category==='Boss'?0x34404d:0x647686,metalness:.6,roughness:.35});mat.name='fleet29-equipment';root.add(new T.Mesh(merged(metal),mat));metal.forEach(m=>m.geometry.dispose());}
  if(lights.length){const mat=new T.MeshStandardMaterial({color:glow,emissive:glow,emissiveIntensity:1,roughness:.3});mat.name='fleet29-signal';root.add(new T.Mesh(merged(lights),mat));lights.forEach(m=>m.geometry.dispose());}
  // Normalise the assembled silhouette, including equipment, to the gameplay radius.
  let bound=0;for(const mesh of root.children){const p=mesh.geometry.attributes.position;for(let i=0;i<p.count;i++)bound=Math.max(bound,Math.hypot(p.getX(i),p.getY(i),p.getZ(i)));}
  root.scale.setScalar(1/bound);root.userData={fleet29:key,radius,base,form};return root;
 }
 function create(key){if(!definitions[key])throw new Error('Unknown fleet model');const source=templates[key]||(templates[key]=template(key)),root=new T.Group();root.name=key;root.scale.copy(source.scale);root.userData={...source.userData};for(const m of source.children){const mesh=new T.Mesh(m.geometry,m.material);mesh.name=m.name;mesh.userData.fleet29=true;root.add(mesh);}return root;}
 return Object.freeze({create,definitions,keys:Object.freeze(Object.keys(definitions))});
})(THREE);
