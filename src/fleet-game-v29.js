// Visual substitutions preserve original gameplay roots, targets and all saved IDs.
window.SF_FLEET29=true;
const FLEET29_TINTS=new Map(),FLEET29_PART_GEO={box:new THREE.BoxGeometry(1,1,1),ring:new THREE.TorusGeometry(.24,.025,5,16),cone:new THREE.ConeGeometry(.14,.5,8)};
function fleet29Attach(root,key,options={}){
  const u=root.userData||(root.userData={});if(u.fleetKey29===key&&u.body===u.fleetVisual29)return root;
  const first=!u.fleetKey29,previous=u.body||root,model=SFFleet29.create(key),radius=options.radius||SFFleet29.definitions[key][5],scale=Math.max(root.scale.x,root.scale.y,root.scale.z)||1;
  root.updateMatrixWorld(true);
  // Keep existing engine animation and landing gear attached to the gameplay root.
  const effects=[];for(const f of u.flames||[])for(const o of [f.fl,f.gs])if(o)effects.push(o);for(const o of u.fl||[])if(o)effects.push(o);
  if(u.gear)for(const g of u.gear.list||[])if(g.piv)effects.push(g.piv);
  for(const o of effects)if(o.parent!==root)root.attach(o);
  if(first){const keep=new Set([u.bar,u.shield,u.plasma,...effects,...(options.keep||[])]);for(const child of root.children)if(!keep.has(child))child.visible=false;}else if(previous!==root)previous.visible=false;
  if(u.fleetVisual29)root.remove(u.fleetVisual29);
  model.scale.multiplyScalar(radius/scale);root.add(model);u.body=model;u.fleetVisual29=model;u.fleetKey29=key;u.mdl='fleet29:'+key;u.fly=u.fly||true;
  const engines=u.flames||[];engines.forEach((f,i)=>{const x=(i-(engines.length-1)/2)*radius*.35/scale;for(const [o,dz]of [[f.fl,2],[f.gs,.3]])if(o)o.position.set(x,0,radius*.62/scale+dz);});
  (u.fl||[]).forEach((o,i,a)=>o.position.set((i-(a.length-1)/2)*radius*.3/scale,0,radius*.65/scale));
  return root;
}
function fleet29Player(root,P){
  const key='player_'+(G.ship||'eclaireur');if(!SFFleet29.definitions[key])return root;const style=key+'|'+JSON.stringify(P);if(root.userData.fleetStyle29===style)return root;fleet29Attach(root,key);const u=root.userData,model=u.body;u.fleetStyle29=style;
  const paint=PARTS.paint.o[P.paint]||PARTS.paint.o.std,materials=[];
  for(const mesh of model.children){mesh.material=mesh.material.clone();materials.push(mesh.material);mesh.userData.fleetOwnedMaterial29=true;
    if(paint.c)mesh.material.color.setHex(paint.c[mesh.name==='hull'?0:1]);
    if(u.s3U&&typeof shp3Patch==='function')shp3Patch(mesh.material,u.s3U);
  }
  u.fleetMaterials29=materials;
  // Read equipment from the same slots as the workshop; no new stats or save keys.
  const material=materials[1]||materials[0],signal=materials[2]||material;
  function detail(g,x,y,z,sx=1,sy=1,sz=1,glow=false){const m=new THREE.Mesh(g,glow?signal:material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.userData.fleet29=true;model.add(m);}
  const B=FLEET29_PART_GEO.box;
  if(P.nose==='radar')detail(FLEET29_PART_GEO.ring,0,.25,-.52);
  if(P.nose==='eperon'){detail(FLEET29_PART_GEO.cone,0,0,-.9);model.children[model.children.length-1].rotation.x=-Math.PI/2;}
  if(P.nose==='chasse')detail(B,0,-.1,-.72,.15,.12,.25);
  if(P.wings&&P.wings!=='std')for(const s of [-1,1])detail(B,s*.65,0,.1,.25,.07,P.wings==='delta'?.5:.3);
  if(P.armor&&P.armor!=='std')for(const s of [-1,1])for(const z of [-.1,.2])detail(B,s*.35,.16,z,.2,.09,.2);
  if(P.cargo&&P.cargo!=='std')for(const s of [-1,1])detail(B,P.cargo==='ventral'?0:s*.45,P.cargo==='ventral'?-.35:-.2,.1,.23,.25,.45);
  if(P.guns&&P.guns!=='std')for(const s of [-1,1])detail(B,s*.38,-.13,-.5,.045,.06,.4,true);
  if(P.eng&&P.eng!=='std')detail(FLEET29_PART_GEO.ring,0,0,.62,1,1,1,true);
  if(P.focus&&P.focus!=='std')detail(B,0,-.18,-.55,.08,.08,.16,true);
  return root;
}
{const previous=buildShip;buildShip=function(P,l){const root=previous.apply(this,arguments);return fleet29Player(root,P||G.parts||{});};}
{const previous=buildEnemy;buildEnemy=function(ty){const root=previous.apply(this,arguments),key={pirate:'enemy_pirate',chasseur:'enemy_interceptor',lourd:'enemy_heavy',boss:'enemy_boss'}[ty];return key?fleet29Attach(root,key):root;};}
{const previous=mkFoe;mkFoe=function(kind,p,z,o){const e=previous.apply(this,arguments);const key='enemy_'+(kind==='xil'&&o&&o.big?'xil_large':kind);if(SFFleet29.definitions[key])fleet29Attach(e.mesh,key,{radius:e.r});
  if(kind==='stealth'){e.mesh.userData.cloakM=e.mesh.userData.body.children.map(m=>{m.material=m.material.clone();m.material.transparent=true;return m.material;});}
  return e;
};}
{const previous=reskin;reskin=function(e,col,emi){previous(e,col,emi);const u=e.mesh&&e.mesh.userData;if(!u||!u.fleetVisual29)return;u.fleetTint29={col,emi};
  const mesh=u.fleetVisual29.children[0],id=u.fleetKey29+'|'+col+'|'+emi;let m=FLEET29_TINTS.get(id);if(!m){m=mesh.material.clone();m.color.setHex(col);m.emissive.setHex(emi);m.emissiveIntensity=.1;FLEET29_TINTS.set(id,m);}mesh.material=m;
};}
function fleet29Enemy(e){
  if(e.kind==='police')return e.passive?'npc_customs':'npc_police';
  if(e.kind==='hunter')return 'enemy_hunter';
  if(e.v1nd){if(e.boss)return 'enemy_kraken';if(e.sp===0)return 'enemy_generator';}
  if(e.tactic27==='support')return 'enemy_support';
  if(e.kind&&SFFleet29.definitions['enemy_'+e.kind])return e.xil&&e.big?'enemy_xil_large':'enemy_'+e.kind;
  return {pirate:'enemy_pirate',chasseur:'enemy_interceptor',lourd:'enemy_heavy',boss:'enemy_boss'}[e.ty];
}
{const previous=updEnemies;updEnemies=function(dt,z){previous(dt,z);for(const e of en){if(e.dead)continue;const key=fleet29Enemy(e);if(key&&e.mesh.userData.fleetKey29!==key){const tint=e.mesh.userData.fleetTint29;fleet29Attach(e.mesh,key,{radius:e.r||e.sz});if(tint)reskin(e,tint.col,tint.emi);}}};}
{const previous=w7Mesh;w7Mesh=function(job){const root=previous.apply(this,arguments),key='npc_'+job;return SFFleet29.definitions[key]?fleet29Attach(root,key,{radius:W7J[job].r*.92}):root;};}
function fleet29Traffic(N){if(N.ph==='tug10')return 'npc_tug';if(N.ph==='orb10')return 'npc_tourist';if(N.ph==='race10')return 'npc_racer';if(N.ph==='sq10')return 'npc_squad';if(N.ph==='esc10')return 'npc_escort';return 'npc_'+N.job;}
{const previous=w7Upd;w7Upd=function(N,dt){const key=fleet29Traffic(N);if(SFFleet29.definitions[key])fleet29Attach(N.F.mesh,key,{radius:N.F.r*.92});return previous(N,dt);};}
{const previous=buildAlly;buildAlly=function(){return fleet29Attach(previous.apply(this,arguments),'ally_wing');};}
{const previous=mkFreighter;mkFreighter=function(){return fleet29Attach(previous.apply(this,arguments),'ally_freighter');};}
{const previous=a2CorShip;a2CorShip=function(){return fleet29Attach(previous.apply(this,arguments),'story_corbeau');};}
{const previous=wbMesh;wbMesh=function(){return fleet29Attach(previous.apply(this,arguments),'world_dreadnought');};}
{const previous=spawnBoss;spawnBoss=function(pos,opts){previous.apply(this,arguments);const B=BOSS;if(!B||B.g.userData.fleetKey29)return;
  const keep=new Set([B.shield,...B.armor,...B.parts.map(p=>p.obj),...B.eng]);fleet29Attach(B.g,opts&&opts.a2?'story_vengeur':'story_nemesis',{keep});
};}
// The player ship and title showcase were created before these final wrappers.
if(typeof ship!=='undefined'&&ship)fleet29Player(ship,G.parts||{});
if(typeof MENU3!=='undefined'&&MENU3.ship)fleet29Player(MENU3.ship,G.parts||{});
