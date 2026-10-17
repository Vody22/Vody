// Original ship geometry. Shared buffers, five opaque material batches, no textures.
var SFShipModels28=(function(T){
  const cache={},palettes={
    interceptor:[0x9caabb,0x182633,0xf16c38,0x142f45,0x80dfff],
    cruiser:[0x788697,0x17212e,0xda6940,0x16364a,0xffb467],
    support:[0xb7c9cb,0x213947,0x29b4bf,0x15374a,0x67f5ee]
  };
  function build(kind){
    if(!palettes[kind])throw new Error('Unknown ship model: '+kind);
    const bins=[[],[],[],[],[]];
    function put(geometry,channel,x=0,y=0,z=0,rx=0,ry=0,rz=0){
      const g=geometry.index?geometry.toNonIndexed():geometry;
      if(g!==geometry)geometry.dispose();
      const m=new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(1,1,1));
      g.applyMatrix4(m);bins[channel].push(g);
    }
    const box=(x,y,z,w,h,l,ch,rz=0)=>put(new T.BoxGeometry(w,h,l),ch,x,y,z,0,0,rz);
    // Octagonal hull sections: real thickness and bevelled silhouette, nose along -Z.
    function hull(sections,ch,x=0,y=0,z=0){
      const p=[],ring=[[1,.48],[.65,1],[-.65,1],[-1,.48],[-1,-.48],[-.65,-1],[.65,-1],[1,-.48]];
      const v=(i,j)=>[x+ring[j%8][0]*sections[i][1],y+ring[j%8][1]*sections[i][2],z+sections[i][0]];
      const tri=(a,b,c)=>p.push(...a,...b,...c);
      for(let i=0;i<sections.length-1;i++)for(let j=0;j<8;j++){const a=v(i,j),b=v(i,j+1),c=v(i+1,j),d=v(i+1,j+1);tri(a,b,c);tri(b,d,c);}
      for(let j=0;j<8;j++){tri([x,y,z+sections[0][0]],v(0,j+1),v(0,j));const n=sections.length-1;tri([x,y,z+sections[n][0]],v(n,j),v(n,j+1));}
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.computeVertexNormals();put(g,ch);
    }
    function wing(side,points,y,th,ch){
      const shape=new T.Shape();points.forEach((p,i)=>i?shape.lineTo(side*p[0],p[1]):shape.moveTo(side*p[0],p[1]));shape.closePath();
      const g=new T.ExtrudeGeometry(shape,{depth:th,bevelEnabled:false,steps:1,curveSegments:1});g.rotateX(Math.PI/2);g.translate(0,y+th/2,0);put(g,ch);
    }
    function engine(x,y,z,r){
      put(new T.CylinderGeometry(r*.8,r,2.1,10),1,x,y,z,Math.PI/2);
      put(new T.TorusGeometry(r*.87,r*.12,4,10),0,x,y,z+1.1);
      put(new T.CylinderGeometry(r*.72,r*.72,.14,10),4,x,y,z+1.08,Math.PI/2);
    }
    if(kind==='interceptor'){
      hull([[-10,.1,.1],[-7,.7,.42],[-3,1.5,.8],[2,1.65,.9],[6,1.1,.65]],0);
      hull([[-5,.2,.05],[-2,.83,.58],[.5,.72,.35],[1.2,.3,.1]],3,0,.82);
      for(const s of [-1,1]){
        wing(s,[[1,-3.5],[3,-2.4],[10,4.4],[9.6,6.5],[3,3.8],[1,4.8]],-.2,.35,0);
        wing(s,[[3.5,-.8],[4.2,0],[9.7,4.5],[9.6,5.15]],.03,.08,2);
        hull([[-2,.35,.4],[0,.65,.58],[4,.65,.6],[5,.45,.45]],1,s*3.2,-.1,1);
        engine(s*3.2,-.1,6.4,.75);
        box(s*8.5,.14,2.5,.28,.3,5,1);box(s*8.5,.14,-.1,.32,.32,.3,4);
        box(s*1.3,1.55,4.1,.16,1.6,2,0,s*-.24);
      }
      box(0,1,2.8,.3,.18,3.8,2);
    }else if(kind==='cruiser'){
      hull([[-10,1.1,.6],[-8,2.9,1.3],[-3,3.6,1.55],[4,3.8,1.7],[8,2.9,1.3]],0);
      hull([[-8,.8,.3],[-5,1.5,.55],[5,1.8,.6],[7,1,.3]],1,0,-1.6);
      hull([[-1,1.2,.3],[1,1.5,.9],[4,1.6,1.2],[6,1.3,.65]],0,0,1.8);
      box(0,2.4,-.45,2.5,.45,.16,3);
      for(const s of [-1,1]){
        box(s*4.4,-.1,2,4,.6,7,1);
        hull([[-5,.55,.65],[-3,1.2,1],[5,1.25,1.1],[7,.95,.8]],0,s*5.8,-.25,1);
        engine(s*5.8,-.25,9.3,1.1);
        for(let i=0;i<4;i++)box(s*3.55,.65,-5+i*2,1,1.25,1.55,0,s*-.15);
        box(s*5.8,.82,2,.55,.1,6,2);
        put(new T.CylinderGeometry(.85,1,.45,8),1,s*1.8,1.65,-4.5);
        for(const a of [-1,1])box(s*1.8+a*.24,1.95,-6.3,.22,.25,3.8,1);
        box(s*2.25,1.63,-7.3,.4,.08,1.5,2);
        for(let i=0;i<5;i++)box(s*3.4,1.78,1+i*.7,.4,.12,.3,1);
      }
      engine(0,-.25,9.4,1.15);box(0,3.6,4.5,.16,2.2,.16,1);box(0,4.75,4.5,.26,.18,.26,4);
    }else{
      hull([[-7,.45,.3],[-5,1.8,.85],[-1,2.2,1.2],[4,2,1.1],[6,1.2,.7]],0);
      hull([[-5,.45,.15],[-3,1.15,.45],[-1,1,.3]],3,0,1);
      box(0,1.35,2.3,2.6,.45,3.8,1);
      for(const s of [-1,1]){
        wing(s,[[1,-1],[5,-3],[7,-1],[5,3],[1,4]],-.2,.7,0);
        hull([[-6,.5,.5],[-4,1,.9],[3,1,1],[5,.65,.6]],0,s*6.2,.15,1);
        engine(s*6.2,.15,7.1,.9);
        box(s*6.2,1.16,.5,.7,.12,5,2);
        put(new T.TorusGeometry(2,.25,5,16),1,s*3.3,1.3,.6,Math.PI/2);
        put(new T.TorusGeometry(1.66,.12,4,16),4,s*3.3,1.38,.6,Math.PI/2);
        put(new T.CylinderGeometry(.75,1.1,.45,10),2,s*3.3,1.28,.6);
        box(s*2.25,-1,-2.2,.55,.6,3,1);
      }
      put(new T.SphereGeometry(1,12,6,0,Math.PI*2,0,Math.PI/2),0,0,2.05,2.3);
      box(0,3.1,2.3,.12,1.4,.12,1);box(0,3.8,2.3,1.6,.12,.12,4);
    }
    const materials=palettes[kind].map((color,i)=>{const m=new T.MeshStandardMaterial({color,metalness:i===3?.75:.5,roughness:i===3?.16:.38,emissive:i===4?color:0,emissiveIntensity:i===4?1.2:0});m.name=['armor','frame','markings','canopy','emitters'][i];return m;});
    const group=new T.Group();group.name=kind;
    bins.forEach((list,i)=>{if(!list.length)return;const size=list.reduce((n,g)=>n+g.attributes.position.count,0),p=new Float32Array(size*3),n=new Float32Array(size*3);let offset=0;
      for(const g of list){p.set(g.attributes.position.array,offset);n.set(g.attributes.normal.array,offset);offset+=g.attributes.position.array.length;g.dispose();}
      const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(p,3));geometry.setAttribute('normal',new T.BufferAttribute(n,3));geometry.computeBoundingBox();geometry.computeBoundingSphere();
      const mesh=new T.Mesh(geometry,materials[i]);mesh.name=materials[i].name;mesh.userData.sf28Channel=materials[i].name;group.add(mesh);
    });
    // Keep visual extents inside the existing combat collision sphere.
    const radius={interceptor:10.5,cruiser:16,support:12}[kind];let bound=0;
    for(const mesh of group.children){const p=mesh.geometry.attributes.position;for(let i=0;i<p.count;i++)bound=Math.max(bound,Math.hypot(p.getX(i),p.getY(i),p.getZ(i)));}
    for(const mesh of group.children){mesh.geometry.scale(radius/bound,radius/bound,radius/bound);mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();}
    group.userData={model28:kind,nose:'-Z',radius};return group;
  }
  function create(kind){const original=cache[kind]||(cache[kind]=build(kind));const group=new T.Group();group.name=original.name;group.userData={...original.userData};
    for(const m of original.children){const mesh=new T.Mesh(m.geometry,m.material);mesh.name=m.name;mesh.userData={...m.userData};group.add(mesh);}return group;
  }
  return Object.freeze({create,kinds:Object.freeze(Object.keys(palettes))});
})(THREE);
