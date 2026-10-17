const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),c={console,atob:s=>Buffer.from(s,'base64').toString('binary')};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,'dev/three.min.js'),'utf8'),c);c.THREE.TextureLoader.prototype.load=function(){return new c.THREE.Texture();};
for(const name of ['fleet-data-v29','fleet-v29'])vm.runInContext(fs.readFileSync(path.join(root,'src',name+'.js'),'utf8'),c);
test('covers all nine playable hulls with separate imported base geometry',()=>{
 const hulls=['eclaireur','intercepteur','cargo','faucon','leviathan','prospecteur','explorateur','sentinelle','mastodonte'];const bases=new Set();for(const id of hulls){const d=c.SFFleet29.definitions['player_'+id];assert.ok(d,id);bases.add(d[0]);}assert.equal(bases.size,9);
});
test('all 41 role models have finite geometry, UVs, bounded silhouettes and at most four batches',()=>{
 assert.equal(c.SFFleet29.keys.length,41);for(const key of c.SFFleet29.keys){const m=c.SFFleet29.create(key);assert.ok(m.children.length<=4,key);m.updateMatrixWorld(true);let triangles=0;
  for(const part of m.children){const g=part.geometry,p=g.attributes.position,n=g.attributes.normal;triangles+=p.count/3;assert.equal(p.count,n.count);assert.ok(g.attributes.uv||!part.material.map,key+' texture UVs');
   for(let i=0;i<p.count;i++){const v=new c.THREE.Vector3(p.getX(i),p.getY(i),p.getZ(i)).applyMatrix4(part.matrixWorld);assert.ok(v.toArray().every(Number.isFinite));assert.ok(v.length()<=1.0001,key+' radius');assert.ok(Math.abs(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))-1)<.025,key+' normals');}
  }assert.ok(triangles<10000,key+' triangle budget');
 }
});
test('every role has a distinct geometry assembly, including shared hull adaptations',()=>{
 const seen=new Map();for(const key of c.SFFleet29.keys){const h=crypto.createHash('sha256'),m=c.SFFleet29.create(key);m.updateMatrixWorld(true);for(const part of m.children){const p=part.geometry.attributes.position;for(let i=0;i<p.count;i++){const v=new c.THREE.Vector3(p.getX(i),p.getY(i),p.getZ(i)).applyMatrix4(part.matrixWorld);h.update(v.toArray().map(n=>n.toFixed(5)).join(','));}}const signature=h.digest('hex');assert.ok(!seen.has(signature),key+' duplicates '+seen.get(signature));seen.set(signature,key);}
});
test('instances share geometry but not transforms; source credits remain attached to data',()=>{
 for(const key of c.SFFleet29.keys){const a=c.SFFleet29.create(key),b=c.SFFleet29.create(key);assert.equal(a.children[0].geometry,b.children[0].geometry);a.position.x=100;assert.equal(b.position.x,0);}
 for(const d of Object.values(c.SF_FLEET29_DATA)){assert.equal(d.license,'CC0-1.0');assert.ok(['Kenney','Quaternius'].includes(d.author));assert.match(d.sha256,/^[0-9a-f]{64}$/);if(d.texture)assert.ok(Buffer.from(d.texture,'base64').length<100000);}
});
test('exported GLBs embed textures/buffers and keep geometry counts',()=>{
 for(const key of c.SFFleet29.keys){const b=fs.readFileSync(path.join(root,'public/models/starfarer29',key+'.glb'));assert.equal(b.readUInt32LE(0),0x46546c67);assert.equal(b.readUInt32LE(8),b.length);const d=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));assert.equal(d.buffers[0].uri,undefined);for(const im of d.images||[]){assert.equal(im.mimeType,'image/jpeg');assert.ok(Number.isInteger(im.bufferView));assert.equal(im.uri,undefined);}const count=d.meshes[0].primitives.reduce((n,p)=>n+d.accessors[p.attributes.POSITION].count,0);assert.equal(count,c.SFFleet29.create(key).children.reduce((n,m)=>n+m.geometry.attributes.position.count,0));}
});
test('visual swaps preserve gameplay roots, effects, late boss weak points and hide cloned legacy layers',()=>{
 vm.runInContext(`var window={},G={ship:'eclaireur',parts:{}},PARTS={paint:{o:{std:{}}}},W7J={},en=[];
 function buildShip(){}function buildEnemy(){}function mkFoe(){}function reskin(){}function updEnemies(){}function w7Mesh(){}function w7Upd(){}function buildAlly(){}function mkFreighter(){}function a2CorShip(){}function wbMesh(){}function spawnBoss(){}`,c);
 vm.runInContext(fs.readFileSync(path.join(root,'src/fleet-game-v29.js'),'utf8'),c);
 const T=c.THREE,r=new T.Group(),legacy=new T.Group(),second=new T.Group(),flame=new T.Mesh(new T.BoxGeometry(),new T.MeshBasicMaterial()),shield=new T.Mesh(new T.SphereGeometry(),new T.MeshBasicMaterial());r.add(legacy,second,shield);legacy.add(flame);r.position.set(12,34,56);r.scale.setScalar(1.8);const muzzles=[[1,2,3]];r.userData={body:legacy,flames:[{fl:flame}],shield,muzzles};c.testRoot29=r;
 vm.runInContext("fleet29Attach(testRoot29,'enemy_boss',{radius:25})",c);
 assert.equal(r.userData.muzzles,muzzles);assert.equal(r.userData.shield,shield);assert.equal(shield.visible,true);assert.equal(legacy.visible,false);assert.equal(second.visible,false);assert.equal(flame.parent,r);assert.deepEqual(Array.from(r.position.toArray()),[12,34,56]);assert.equal(r.scale.x,1.8);
 const weakPoint=new T.Mesh(new T.SphereGeometry(),new T.MeshBasicMaterial());r.add(weakPoint);vm.runInContext("fleet29Attach(testRoot29,'enemy_kraken',{radius:25})",c);assert.equal(weakPoint.visible,true);assert.equal(weakPoint.parent,r);assert.equal(r.userData.fleetKey29,'enemy_kraken');
 const box=new T.Box3().setFromObject(r.userData.body);assert.ok(box.getSize(new T.Vector3()).length()<90);
});

test('flight camera and weapon offsets use hull dimensions, independent of imported mesh scale',()=>{
 const T=c.THREE;
 const game=fs.readFileSync(path.join(root,'src/game.js'),'utf8');
 vm.runInContext(`var V3=THREE.Vector3,QT=THREE.Quaternion,ship,mode='space',FOOT={on:false},S={pos:new V3(),q:new QT(),spd:0,docked:false},window={SF2Motion:0},innerWidth=1280,innerHeight=720,DESK=true,shake=0;
 var camera=new THREE.PerspectiveCamera(60,1280/720,.1,100000),sky=new THREE.Group();
 function derCam(){}function footCam(){}function atelierOn(){return false}function ckActive(){return false}function isBoost(){return false}function cruise(){return 100}function clamp(x,a,b){return Math.max(a,Math.min(b,x))}function lerp(a,b,k){return a+(b-a)*k}function damp(k,dt){return 1-Math.exp(-k*dt)}function rv(){return 0}
 const _f=new V3(),_u=new V3(),_r=new V3(),_v=new V3(),_w=new V3();function fwd(q=S.q,o=_f){return o.set(0,0,-1).applyQuaternion(q)}
 `+game.slice(game.indexOf('function shipHullScale'),game.indexOf('function rebuildShip'))+game.slice(game.indexOf('const camUp='),game.indexOf('function placeShip')),c);
 for(const key of c.SFFleet29.keys.filter(k=>k.startsWith('player_'))){
  const r=new T.Group();r.userData={body:new T.Group()};r.add(r.userData.body);c.G.ship=key.slice(7);c.testRoot29=r;vm.runInContext('fleet29Player(testRoot29,{})',c);c.ship=r;
  for(const portrait of [false,true]){c.innerWidth=portrait?390:1280;c.innerHeight=portrait?844:720;c.camera.aspect=c.innerWidth/c.innerHeight;vm.runInContext('updCam(1/60)',c);
   const distance=c.camera.position.length(),radius=c.SFFleet29.definitions[key][5];assert.ok(distance/radius>3&&distance/radius<4,key+' consistent close framing');assert.ok(c.camera.fov===(portrait?74:60));
   const before=c.camera.position.clone();r.userData.body.scale.multiplyScalar(7);vm.runInContext('updCam(1/60)',c);assert.ok(before.distanceTo(c.camera.position)<1e-8,key+' normalization cannot change camera');
  }
  assert.equal(r.userData.hullScale29.z,c.SFFleet29.definitions[key][5]/12);
 }
});
