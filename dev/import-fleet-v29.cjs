// Offline conversion of verified CC0 source data; never executes downloaded code.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),source=path.join(root,'dev/fleet-sources29'),c={console};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'three.min.js'),'utf8'),c);const T=c.THREE;
const encode=a=>Buffer.from(a.buffer,a.byteOffset,a.byteLength).toString('base64'),library={};
function finish(name,g,extra){
 const keep=[],norm=g.attributes.normal;for(let i=0;i<g.attributes.position.count;i+=3)if(!norm||Math.hypot(norm.getX(i),norm.getY(i),norm.getZ(i))>.1)keep.push(i,i+1,i+2);
 if(keep.length!==g.attributes.position.count)for(const [key,a]of Object.entries(g.attributes)){const values=new a.array.constructor(keep.length*a.itemSize);keep.forEach((v,i)=>values.set(a.array.subarray(v*a.itemSize,(v+1)*a.itemSize),i*a.itemSize));g.setAttribute(key,new T.BufferAttribute(values,a.itemSize,a.normalized));}
 g.computeBoundingBox();const center=g.boundingBox.getCenter(new T.Vector3());g.translate(-center.x,-center.y,-center.z);g.computeBoundingSphere();const radius=g.boundingSphere.radius;g.scale(1/radius,1/radius,1/radius);
 if(!g.attributes.normal)g.computeVertexNormals();const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
 library[name]={position:encode(Int16Array.from(p.array,x=>Math.round(x*32767))),normal:encode(Int8Array.from(n.array,x=>Math.round(x*127))),uv:uv?encode(Uint16Array.from(uv.array,x=>Math.round(Math.max(0,Math.min(1,x))*65535))):null,color:g.attributes.color?encode(g.attributes.color.array):null,triangles:p.count/3,...extra};
}
for(const name of ['Bob','Challenger','Dispatcher','Executioner','Imperial','Insurgent','Omen','Pancake','Spitfire','Striker','Zenith']){
 const text=fs.readFileSync(path.join(source,name+'.obj'),'utf8'),v=[],uv=[],p=[],u=[];
 for(const line of text.split(/\r?\n/)){const a=line.split(/\s+/);if(a[0]==='v')v.push(a.slice(1).map(Number));else if(a[0]==='vt')uv.push(a.slice(1).map(Number));else if(a[0]==='f')for(const token of a.slice(1)){const [vi,ti]=token.split('/').map(Number);p.push(...v[vi-1]);u.push(...(uv[ti-1]||[0,0]));}}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(u,2));g.rotateY(Math.PI);g.computeVertexNormals();
 finish(name,g,{texture:fs.readFileSync(path.join(source,name+'.jpg')).toString('base64'),author:'Quaternius',license:'CC0-1.0',source:'https://quaternius.com/packs/ultimatespaceships.html',sha256:crypto.createHash('sha256').update(text).digest('hex')});
}
for(const file of fs.readdirSync(source).filter(f=>f.endsWith('.glb'))){const b=fs.readFileSync(path.join(source,file)),size=b.readUInt32LE(12),d=JSON.parse(b.subarray(20,20+size)),bin=b.subarray(28+size);
 const read=i=>{const a=d.accessors[i],v=d.bufferViews[a.bufferView],C={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType],n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type];const offset=(v.byteOffset||0)+(a.byteOffset||0);const copy=Uint8Array.from(bin.subarray(offset,offset+a.count*n*C.BYTES_PER_ELEMENT));return new C(copy.buffer);};
 const p=[],n=[],uv=[],color=[];
 for(const mesh of d.meshes)for(const primitive of mesh.primitives){const pos=read(primitive.attributes.POSITION),norm=read(primitive.attributes.NORMAL),tex=primitive.attributes.TEXCOORD_0===undefined?null:read(primitive.attributes.TEXCOORD_0),indices=read(primitive.indices),col=d.materials[primitive.material].pbrMetallicRoughness.baseColorFactor;
  for(const i of indices){p.push(...pos.subarray(i*3,i*3+3));n.push(...norm.subarray(i*3,i*3+3));uv.push(...(tex?tex.subarray(i*2,i*2+2):[0,0]));color.push(...col.slice(0,3).map(x=>Math.round(x*255)));}
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('color',new T.BufferAttribute(new Uint8Array(color),3,true));g.rotateY(Math.PI);
 finish(file.slice(0,-4),g,{author:'Kenney',license:'CC0-1.0',source:'https://kenney.nl/assets/space-kit',sha256:crypto.createHash('sha256').update(b).digest('hex')});
}
fs.writeFileSync(path.join(root,'src/fleet-data-v29.js'),'// CC0 ships by Quaternius and Kenney. Provenance: dev/FLEET-SOURCES.md\nvar SF_FLEET29_DATA='+JSON.stringify(library)+';\n');
console.log(Object.entries(library).map(([name,data])=>({name,triangles:data.triangles})));console.log('Data bytes',fs.statSync(path.join(root,'src/fleet-data-v29.js')).size);
