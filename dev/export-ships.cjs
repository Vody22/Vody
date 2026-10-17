// Exports the same shared geometry used by the game. glTF 2.0, no texture URLs.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),context={console};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'three.min.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'src/ship-models-v28.js'),'utf8'),context);
const out=path.join(root,'public/models/starfarer28');fs.mkdirSync(out,{recursive:true});
function glb(group){
 const doc={asset:{version:'2.0',generator:'Starfarer original ship modeller 2.8',copyright:'Original procedural geometry created for Starfarer 3D'},scene:0,scenes:[{nodes:[0]}],nodes:[{name:group.name,mesh:0}],meshes:[{name:group.name,primitives:[]}],materials:[],accessors:[],bufferViews:[],buffers:[]},chunks=[];let length=0;
 function attr(attribute,semantic){const data=Buffer.from(attribute.array.buffer,attribute.array.byteOffset,attribute.array.byteLength);const view=doc.bufferViews.length;doc.bufferViews.push({buffer:0,byteOffset:length,byteLength:data.length,target:34962});chunks.push(data);length+=data.length;
  const acc={bufferView:view,componentType:5126,count:attribute.count,type:'VEC3'};
  if(semantic==='POSITION'){acc.min=[Infinity,Infinity,Infinity];acc.max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<attribute.count;i++)for(let k=0;k<3;k++){const v=attribute.array[i*3+k];acc.min[k]=Math.min(acc.min[k],v);acc.max[k]=Math.max(acc.max[k],v);}}
  doc.accessors.push(acc);return doc.accessors.length-1;
 }
 for(const mesh of group.children){const m=mesh.material,c=m.color,e=m.emissive;doc.materials.push({name:m.name,pbrMetallicRoughness:{baseColorFactor:[c.r,c.g,c.b,1],metallicFactor:m.metalness,roughnessFactor:m.roughness},emissiveFactor:[Math.min(1,e.r*m.emissiveIntensity),Math.min(1,e.g*m.emissiveIntensity),Math.min(1,e.b*m.emissiveIntensity)]});
  doc.meshes[0].primitives.push({attributes:{POSITION:attr(mesh.geometry.attributes.position,'POSITION'),NORMAL:attr(mesh.geometry.attributes.normal,'NORMAL')},material:doc.materials.length-1,mode:4});
 }
 doc.buffers.push({byteLength:length});const json=Buffer.from(JSON.stringify(doc)),padding=(4-json.length%4)%4,j=Buffer.concat([json,Buffer.alloc(padding,32)]),bin=Buffer.concat(chunks),header=Buffer.alloc(12),jh=Buffer.alloc(8),bh=Buffer.alloc(8);
 header.writeUInt32LE(0x46546c67,0);header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+j.length+8+bin.length,8);jh.writeUInt32LE(j.length);jh.writeUInt32LE(0x4e4f534a,4);bh.writeUInt32LE(bin.length);bh.writeUInt32LE(0x004e4942,4);return Buffer.concat([header,jh,j,bh,bin]);
}
const report=[];for(const kind of context.SFShipModels28.kinds){const group=context.SFShipModels28.create(kind),data=glb(group),file=path.join(out,kind+'.glb');fs.writeFileSync(file,data);report.push({kind,file:path.relative(root,file).replaceAll('\\','/'),bytes:data.length,triangles:group.children.reduce((n,m)=>n+m.geometry.attributes.position.count/3,0),drawCalls:group.children.length,radius:group.userData.radius});}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({version:'2.8',format:'glTF 2.0 binary',front:'-Z',up:'+Y',textures:0,models:report},null,2)+'\n');console.log(JSON.stringify(report,null,2));
