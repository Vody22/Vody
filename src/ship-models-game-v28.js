// Keep original bosses, specials, collision, rewards and weapon behaviour.
function ship28Root(kind,ty){
  const root=new THREE.Group(),body=SFShipModels28.create(kind);root.add(body);
  const bar=new THREE.Sprite(new THREE.SpriteMaterial({color:ENC[ty],depthWrite:false,transparent:true}));bar.position.y=kind==='cruiser'?8:5;bar.scale.set(10,.7,1);bar.visible=false;root.add(bar);
  root.userData={body,bar,mdl:'sf28:'+kind,model28:kind};return root;
}
{const previous=buildEnemy;buildEnemy=function(ty){if(ty==='chasseur')return ship28Root('interceptor',ty);if(ty==='lourd')return ship28Root('cruiser',ty);return previous.apply(this,arguments);};}
{const previous=reskin;reskin=function(e,col,emi){previous(e,col,emi);const u=e.mesh&&e.mesh.userData;if(!u||!u.model28)return;
  const m=LMAT[col+'|'+emi];if(m)u.body.traverse(o=>{if(o.isMesh&&o.userData.sf28Channel==='armor')o.material=m;});
};}
{const previous=updEnemies;updEnemies=function(dt,z){previous(dt,z);for(const e of en){if(e.dead||e.tactic27!=='support'||e.mesh.userData.model28==='support')continue;
  const u=e.mesh.userData,old=u.body,body=SFShipModels28.create('support');if(old)e.mesh.remove(old);e.mesh.add(body);e.mesh.scale.setScalar(1);
  u.body=body;u.model28='support';u.mdl='sf28:support';if(u.bar){u.bar.position.y=6;u.bar.scale.y=.7;}
  reskin(e,0x183c50,0x43d9ee);
};};}
