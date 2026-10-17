const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const c={console};vm.createContext(c);for(const file of ['dev/three.min.js','src/ship-models-v28.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),c);
for(const kind of ['interceptor','cruiser','support']){
 test(kind+': finite geometry, outward hull normals, five draw calls and collision bounds',()=>{
  const ship=c.SFShipModels28.create(kind);assert.equal(ship.children.length,5);let triangles=0;
  for(const m of ship.children){const p=m.geometry.attributes.position,n=m.geometry.attributes.normal;triangles+=p.count/3;assert.equal(p.count,n.count);
   for(let i=0;i<p.count;i++){const xyz=[p.getX(i),p.getY(i),p.getZ(i)];assert.ok(xyz.every(Number.isFinite));assert.ok(Math.hypot(...xyz)<=ship.userData.radius+.00001);assert.ok(Math.abs(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))-1)<.001);}
  }
  assert.ok(triangles<4000);const hull=ship.children[0].geometry,positions=hull.attributes.position,normals=hull.attributes.normal;
  assert.ok(normals.getX(0)>0,'right hull wall faces outward');
  assert.ok(positions.count>100);
 });
 test(kind+': instances share resources without sharing transforms',()=>{const a=c.SFShipModels28.create(kind),b=c.SFShipModels28.create(kind);assert.notEqual(a,b);assert.equal(a.children[0].geometry,b.children[0].geometry);assert.equal(a.children[0].material,b.children[0].material);a.position.x=12;assert.equal(b.position.x,0);});
 test(kind+': portable GLB has embedded buffers and matches live triangle count',()=>{const b=fs.readFileSync(path.join(__dirname,'../public/models/starfarer28',kind+'.glb'));assert.equal(b.readUInt32LE(0),0x46546c67);assert.equal(b.readUInt32LE(4),2);assert.equal(b.readUInt32LE(8),b.length);const doc=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)).toString());assert.equal(doc.buffers.length,1);assert.equal(doc.buffers[0].uri,undefined);assert.equal(doc.images,undefined);assert.equal(doc.meshes[0].primitives.length,5);const count=doc.meshes[0].primitives.reduce((n,p)=>n+doc.accessors[p.attributes.POSITION].count,0);assert.equal(count,c.SFShipModels28.create(kind).children.reduce((n,m)=>n+m.geometry.attributes.position.count,0));});
}
test('game integration preserves hit bars, faction reskins, special ships and support position',()=>{
 vm.runInContext(`var en=[],LMAT={},ENC={chasseur:0xffd23d,lourd:0xe055aa,pirate:0xd23a3a};
 function buildEnemy(ty){const g=new THREE.Group();g.name='legacy:'+ty;return g;}
 function reskin(e,col,emi){LMAT[col+'|'+emi]=new THREE.MeshStandardMaterial({color:col});}function updEnemies(){}`,c);
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/ship-models-game-v28.js'),'utf8'),c);
 assert.equal(vm.runInContext("buildEnemy('boss').name",c),'legacy:boss');
 assert.equal(vm.runInContext("buildEnemy('pirate').name",c),'legacy:pirate');
 vm.runInContext("var ship=buildEnemy('chasseur');var e={mesh:ship};reskin(e,0x123456,0xabcdef)",c);
 assert.equal(vm.runInContext('ship.userData.body.children[0].material.color.getHex()',c),0x123456);
 assert.equal(vm.runInContext('ship.userData.bar.isSprite',c),true);
 assert.equal(vm.runInContext('ship.userData.mdl',c),'sf28:interceptor');
 vm.runInContext("ship.position.set(5,6,7);ship.scale.setScalar(1.8);var oldBar=ship.userData.bar;en=[{mesh:ship,tactic27:'support'}];updEnemies(.016,2)",c);
 assert.equal(vm.runInContext('ship.userData.model28',c),'support');
 assert.equal(vm.runInContext('ship.userData.bar===oldBar',c),true);
 assert.equal(vm.runInContext('ship.scale.x',c),1);
 assert.equal(vm.runInContext('ship.position.x+ship.position.y+ship.position.z',c),18);
 assert.equal(vm.runInContext('ship.children.length',c),2);
});
