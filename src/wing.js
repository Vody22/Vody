// ===== VAISSEAUX ALLIÉS : ailiers à recruter au bar (formation, combat, minage, salaire, niveaux, mort) + alliés des batailles, cargos d'escorte, plateformes =====
const FR=[];let FB=[];const _fa=new V3(),_fb=new V3(),_fc=new V3(),_fd=new V3();
const AMATS={};function allyMat(col,em){const k=col+'|'+(em||0);return AMATS[k]||(AMATS[k]=new THREE.MeshStandardMaterial({color:col,map:HULLT,metalness:DESK?.6:.3,roughness:.42,emissive:em||0,emissiveIntensity:em?.3:0}))}
function buildAlly(col,acc){const g=new THREE.Group(),b=new THREE.Group();g.add(b);const M=allyMat(col),A=allyMat(acc,acc),add=(geo,m,x,y,z,rx=0,ry=0,rz=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.rotation.set(rx,ry,rz);b.add(o);return o};
add(lathe([[0,-5.2],[.8,-3.2],[1.25,0],[1.15,2.6],[.75,3.6],[0,3.7]],8),M,0,0,0).scale.set(1,.7,1);add(new THREE.SphereGeometry(.62,12,8),new THREE.MeshBasicMaterial({color:0x9fe8ff}),0,.5,-1.4).scale.set(1,.7,1.6);
for(const s of[-1,1]){add(new THREE.BoxGeometry(5.6,.18,2.3),M,s*3,-.1,1.3,0,s*-.42,s*.06);add(new THREE.BoxGeometry(.9,.22,1.5),A,s*5.5,-.05,2.1,0,s*-.42,0);add(new THREE.BoxGeometry(.16,1.4,1.6),A,s*.8,.85,2.6,0,0,s*.35);add(new THREE.CylinderGeometry(.12,.12,2.4,5).rotateX(Math.PI/2),EDARK,s*1.6,-.25,-1.6)}
const fl=[];for(const s of[-.55,.55]){add(new THREE.CircleGeometry(.5,12),new THREE.MeshBasicMaterial({color:0x7fd0ff}),s,0,3.75);const sp=sprite(0x5ab8ff,5);sp.position.set(s,0,4.3);b.add(sp);fl.push(sp)}
g.scale.setScalar(1.7);g.userData={body:b,fl};return g}
// ----- création d'un allié -----
function frSpawn(o){const F=Object.assign({kind:'ally',hp:60,mhp:60,dmg:1.6,rate:.8,rng:1400,sp:240,r:12,cd:Math.random(),dir:new V3(0,0,-1),vel:new V3(),ph:Math.random()*9,bc:0x7fffb0},o);
if(!F.mesh)F.mesh=F.kind=='freighter'?mkFreighter():buildAlly(F.col||0xdfe6ee,F.acc||0x2fa8ff);F.mesh.position.copy(F.p||S.pos);F.pos=F.mesh.position;F.mhp=F.mhp||F.hp;scene.add(F.mesh);FR.push(F);return F}
function frRemove(F){F.gone=1;if(F.mesh.parent)F.mesh.parent.remove(F.mesh);if(F.beam)hideBeam(F.beam)}
// tue un ennemi sans récompense pour le joueur (abattu par un allié de bataille)
function killQuiet(e){if(e.dead)return;e.dead=1;if(e.onKill)e.onKill();boom3(e.pos,e.ty=='lourd'?45:28,ENC[e.ty],90,true);SFX.boom();spawnDrops(e.pos,1);e.mesh.parent&&e.mesh.parent.remove(e.mesh)}
function frHit(F,e,d,p){if(e.dead)return;if(F.kind=='wing'){const was=e.dead;hitEnemy(e,d,p);if(!was&&e.dead&&F.w){F.w.k=(F.w.k||0)+1;STS.wingk++;wingXP(F.w,e.ty=='lourd'?60:e.boss?150:30)}return}
e.hp-=d;e.hitT=t;boom3(p,5,0xffaa66,40);if(e.mesh.userData.bar)e.mesh.userData.bar.visible=true;if(e.hp<=0)killQuiet(e)}
// ----- IA des chasseurs alliés -----
const _wF=new V3(),_wR=new V3(),_wU=new V3(),_wS=new V3(),_wG=new V3(),_wT=new V3(),_wA=new V3(),_wP=new V3();
function frFighter(F,dt){fwd(S.q,_wF);_wR.set(1,0,0).applyQuaternion(S.q);_wU.set(0,1,0).applyQuaternion(S.q);let tg=null,bd=F.rng;
if(F.kind=='wing'&&lock&&lock.foe&&!lock.dead&&!lock.passive&&lock.pos&&lock.pos.distanceTo(F.pos)<F.rng*1.3&&en.includes(lock))tg=lock;
if(!tg)for(const e of en){if(e.dead||e.passive)continue;const d=e.pos.distanceTo(F.anchor||S.pos);if(d<bd){bd=d;tg=e}}
F.ph+=dt;let spd;const goal=_wG;
if(tg){const d=F.pos.distanceTo(tg.pos);_wT.copy(tg.pos).sub(F.pos).normalize();_wS.crossVectors(_wT,_wU).normalize();goal.copy(tg.pos).addScaledVector(_wT,-(220+Math.sin(F.ph*.7)*80)).addScaledVector(_wS,Math.cos(F.ph*1.3)*120);goal.y+=Math.sin(F.ph)*60;spd=Math.max(F.sp,(tg.vel?tg.vel.length():0)*1.1);
F.cd-=dt;if(F.cd<=0&&d<900){F.cd=F.rate*(.8+Math.random()*.4);const tt=d/800,aim=tg.pos.clone();if(tg.vel)aim.addScaledVector(tg.vel,tt);const dir=aim.sub(F.pos).normalize().add(new V3(rv(.03),rv(.03),rv(.03))).normalize();const m=mkPB(F.bc);m.position.copy(F.pos);m.lookAt(F.pos.clone().sub(dir));FB.push({m,p:m.position,v:dir.multiplyScalar(800),l:1.4,d:F.dmg,c:F.bc,F});if(F.pos.distanceTo(S.pos)<1200&&Math.random()<.5)tone(jit(760),240,.08,'square',.018)}
if(F.beam)hideBeam(F.beam)}
else if(F.kind=='wing'){const sl=F.slot||0,sx=sl==0?-1:sl==1?1:0;goal.copy(S.pos).addScaledVector(_wR,sx*55).addScaledVector(_wF,-(sl==2?70:38)).addScaledVector(_wU,sl==2?22:6);spd=S.spd+F.pos.distanceTo(goal)*1.6;
// mineur : s'attaque aux astéroïdes proches quand tout est calme
let a=null;if(F.role=='mineur'&&!S.docked){a=F.ast;if(!a||a.gone||a.hp<=0||a.pos.distanceTo(S.pos)>1100){a=F.ast=null;let ab=900;for(const x of asts){if(x.gone)continue;const d=x.pos.distanceTo(S.pos);if(d<ab&&x.r>8){ab=d;a=x}}F.ast=a}}
if(a){const d=F.pos.distanceTo(a.pos);goal.copy(a.pos).addScaledVector(_wT.copy(F.pos).sub(a.pos).normalize(),a.r+60);spd=180;if(d<a.r+260){if(!F.beam)F.beam=mkBeam(0xffd060);placeBeam(F.beam,F.pos,a.pos,.35,true);F.mc=(F.mc||0)+dt;if(F.mc>.25){F.mc=0;const hk=a.hit||((dd,pp)=>astHit(a,dd,pp));hk(.9+F.w.lv*.25,a.pos.clone().add(new V3(rv(a.r*.4),rv(a.r*.4),rv(a.r*.4))))}}else if(F.beam)hideBeam(F.beam)}else if(F.beam)hideBeam(F.beam)}
else{const A=F.anchor||S.pos;goal.set(A.x+Math.cos(F.ph*.3+F.r)*400,A.y+Math.sin(F.ph*.5)*80,A.z+Math.sin(F.ph*.3+F.r)*400);spd=F.sp*.7}
const to=_wT.copy(goal).sub(F.pos),dd=to.length();to.divideScalar(dd||1);_wP.copy(F.dir);F.dir.lerp(to,damp(tg?3.4:2.6,dt)).normalize();if(!tg)spd=Math.min(spd,Math.max(20,dd*2));F.vel.copy(F.dir).multiplyScalar(Math.min(spd,Math.max(320,boostSpd()*1.15)));F.pos.addScaledVector(F.vel,dt);
for(const o of FR){if(o===F||o.gone)continue;const q=F.pos.distanceTo(o.pos);if(q<30&&q>.01)F.pos.addScaledVector(_wA.copy(F.pos).sub(o.pos).normalize(),(30-q)*dt*3)}const ds=F.pos.distanceTo(S.pos);if(ds<26&&ds>.01)F.pos.addScaledVector(_wA.copy(F.pos).sub(S.pos).normalize(),(26-ds)*dt*3);
F.mesh.lookAt(_wA.copy(F.pos).sub(F.dir));const turn=_wS.crossVectors(_wP,F.dir).y;F.bank=lerp(F.bank||0,clamp(turn*60,-1,1),damp(4,dt));F.mesh.userData.body.rotation.z=F.bank;for(const sp of F.mesh.userData.fl)sp.scale.setScalar(4+Math.min(4,spd/80)+Math.random())}
function frDamage(F,n){if(F.gone)return;F.hp-=n;F.hitT=t;if(F.w)F.w.hp=Math.max(0,F.hp/F.mhp);if(F.hp<=0){F.gone=1;boom3(F.pos,40,0x7fd0ff,110,true);SFX.boom();frRemove(F);if(F.onDie)F.onDie(F)}}
function updFR(dt){for(const F of FR){if(F.gone)continue;if(F.kind=='wing'||F.kind=='ally')frFighter(F,dt);else if(F.kind=='freighter'){if(F.dest){const to=_fc.copy(F.dest).sub(F.pos),d=to.length();if(d<60){if(!F.arr){F.arr=1;F.onArrive&&F.onArrive(F)}}else{F.pos.addScaledVector(to.normalize(),(F.sp||45)*dt);F.mesh.lookAt(_fb.copy(F.pos).sub(to))}}}else if(F.kind=='platform'){F.mesh.rotation.y+=dt*.1}
if(F.regen&&t-(F.hitT||-9)>4)F.hp=Math.min(F.mhp,F.hp+F.regen*dt);if(F.w)F.w.hp=F.hp/F.mhp}
for(let i=FR.length-1;i>=0;i--)if(FR[i].gone)FR.splice(i,1);
// tirs alliés
const TG=en.filter(e=>!e.dead);for(const b of FB){const a=b.p.clone();b.p.addScaledVector(b.v,dt);b.l-=dt;for(const e of TG){if(b.l<=0)break;if(e.dead)continue;if(segHit(a,b.p,e.pos,e.r||10)){b.l=0;impactFX(b.p,b.c,.7);frHit(b.F,e,b.d,b.p.clone())}}if(b.l<=0)rmPB(b)}FB=FB.filter(b=>b.l>0);
// les pirates tirent aussi sur les alliés (et visent en priorité leur cible désignée)
for(const e of TG){if(e.passive)continue;let F=e.tgF&&!e.tgF.gone?e.tgF:null,d=F?F.pos.distanceTo(e.pos):1e9;if(!F){for(const o of FR){if(o.gone)continue;const q=o.pos.distanceTo(e.pos);if(q<d){d=q;F=o}}}if(!F||d>(e.tgF?1100:750))continue;
if(e.tgF&&d>350){e.pos.addScaledVector(_fc.copy(F.pos).sub(e.pos).normalize(),e.sp*.55*dt)}
const p=dt*(e.tgF?.9:F.role=='garde'?.55:.3);if(Math.random()<p){const dir=_fc.copy(F.pos).addScaledVector(F.vel||_fd.set(0,0,0),d/e.bs*.8).sub(e.pos).normalize().add(_fd.set(rv(.04),rv(.04),rv(.04))).normalize();const m=mkEB(e.bc);m.position.copy(e.pos);EB.push({m,v:dir.clone().multiplyScalar(e.bs),l:2.4,dmg:e.dmg,toF:1});if(d<900)SFX.eshoot()}}}
{const _ue=updEB;updEB=function(dt){for(const b of EB){if(b.l<=0)continue;const p=b.m.position;for(const F of FR){if(F.gone)continue;if(p.distanceTo(F.pos)<F.r){b.l=0;impactFX(p,0xff6650,.6);frDamage(F,b.dmg);break}}}_ue(dt)}}
// cacher / remontrer les alliés quand on change de mode
let FRSC=null;TICK.push(dt=>{const want=mode=='space'&&!S.dead;if(FRSC!==want){FRSC=want;for(const F of FR){if(want){if(F.mesh.parent!==scene)scene.add(F.mesh)}else{F.mesh.parent&&F.mesh.parent.remove(F.mesh);if(F.beam)hideBeam(F.beam)}}for(const b of FB)rmPB(b);FB=[]}});
// ===== AILIERS =====
const WG=GX('wing',{});if(!Array.isArray(WG.list))WG.list=[];WG.paid=+WG.paid||0;
const WROLE={chasseur:{n:'Chasseur',d:'Dégâts +30 %, engage de plus loin.',ic:'target',col:0xd8dee6,acc:0xff4a3a},garde:{n:'Garde du corps',d:'Coque +60 %, se répare, attire les tirs.',ic:'shield',col:0x9aa8b8,acc:0x3a8cff},mineur:{n:'Mineur',d:'Mine les astéroïdes proches quand tout est calme.',ic:'drill',col:0xe0c070,acc:0x40c060}};
const WN=['Nova','Rook','Ash','Kira','Juno','Dax','Lyra','Orso','Zia','Brix','Taro','Vela','Milo','Sana','Cole','Indra','Pax','Nyra','Odo','Remy'],WS=['« Faucon »','« Silex »','« Comète »','« Lame »','« Écho »','« Grizzly »','« Zéphyr »','« Rivet »','« Brume »','« Étincelle »'];
const wMax=()=>2+(rankOf('alliance')>=3?1:0);
const wNeed=lv=>Math.round(100*Math.pow(lv,1.4));
const wWage=w=>Math.round(45*w.lv*(w.role=='garde'?1.15:1));
const wStats=w=>{const lv=w.lv;return{hp:Math.round((45+16*lv)*(w.role=='garde'?1.6:1)),dmg:(.9+.28*lv)*(w.role=='chasseur'?1.3:1),rate:Math.max(.42,.9-lv*.04),rng:w.role=='chasseur'?1700:1300,regen:w.role=='garde'?2+lv*.4:0}};
function wingCands(st){const per=Math.floor(Date.now()/(30*60e3)),r=rng(seedOf(st.x|0,st.z|0,per,61)),dz=stDz(st),L=[];for(let i=0;i<3;i++){const role=['chasseur','garde','mineur'][(r()*3)|0],lv=clamp(1+Math.floor(r()*2.2+dz*.7),1,7);L.push({id:'c'+per+'-'+(st.x|0)+'-'+i,n:WN[r()*WN.length|0]+' '+WS[r()*WS.length|0],role,lv,fee:Math.round(700*Math.pow(lv,1.35)/50)*50,hue:r()})}return L}
function wingXP(w,n){w.xp=(w.xp||0)+n;let up=false;while(w.lv<10&&w.xp>=wNeed(w.lv)){w.xp-=wNeed(w.lv);w.lv++;up=true}if(up){toast('⬆ '+w.n+' passe niveau '+w.lv+(w.lv==3?' : capsule de survie débloquée':''));SFX.disc();const F=FR.find(f=>f.w===w);if(F){const s=wStats(w);F.mhp=s.hp;F.dmg=s.dmg;F.rate=s.rate;F.rng=s.rng;F.regen=s.regen;F.hp=Math.min(F.mhp,F.hp+20)}}}
function wingHire(id){const st=S.docked;if(!st)return;const c=wingCands(st).find(x=>x.id==id);if(!c)return;if(WG.list.some(w=>w.id==id)){toast('Déjà recruté');return}if(WG.list.length>=wMax()){toast('Escadrille complète ('+wMax()+' ailiers max)');return}if(G.cr<c.fee){toast('Pas assez de crédits');return}
G.cr-=c.fee;WG.list.push({id:c.id,n:c.n,role:c.role,lv:c.lv,xp:0,hp:1,st:'ok',k:0,hue:c.hue,unpaid:0});STS.hire++;toast('🛩 '+c.n+' rejoint ton escadrille !');SFX.win();gainXP(30);save()}
function wingFire(id){const i=WG.list.findIndex(w=>w.id==id);if(i<0)return;const w=WG.list[i];WG.list.splice(i,1);const F=FR.find(f=>f.w===w);if(F)frRemove(F);toast(w.n+' quitte l\'escadrille');save()}
function wingHeal(id){const w=WG.list.find(x=>x.id==id);if(!w||w.st!='inj')return;const c=150*w.lv;if(G.cr<c){toast('Pas assez de crédits');return}G.cr-=c;w.st='ok';w.hp=1;toast('🩹 '+w.n+' est de nouveau prêt à voler');SFX.buy();save()}
SVC.act.whire=wingHire;SVC.act.wfire=wingFire;SVC.act.wheal=wingHeal;
svcAdd({o:10,ic:'squad',t:st=>'Bar · ailiers ('+WG.list.length+'/'+wMax()+')',show:st=>!st.ground,html:st=>{let h='';const now=Date.now();
for(const w of WG.list){const s=wStats(w),R=WROLE[w.role],inj=w.st=='inj',left=inj?Math.max(0,Math.ceil((w.inj-now)/60e3)):0;
h+=SROW(`<div><b>${ICO(R.ic)} ${esc(w.n)}</b> <i class="tag">Niv. ${w.lv}</i>${inj?' <i class="tag" style="background:#a33">blessé</i>':''}<small>${R.n} · coque ${s.hp} · ${w.k||0} victoires · salaire ${wWage(w)} ¢ / 10 min${inj?'<br>Retour dans '+left+' min':''}<br><span class="pbar" style="color:#5af0a0;width:120px;display:inline-block"><i style="width:${(w.xp/wNeed(w.lv)*100).toFixed(0)}%"></i></span> XP</small></div>`,(inj?`<button data-sv="wheal:${w.id}">Soigner ${fmt(150*w.lv)} ¢</button>`:'')+`<button class="red" data-sv="wfire:${w.id}">Renvoyer</button>`)}
if(!WG.list.length)h+='<div class="hint">Des pilotes cherchent du travail. Un ailier te suit, combat avec toi et touche un salaire toutes les 10 minutes de vol.</div>';
if(WG.list.length<wMax()){for(const c of wingCands(st)){if(WG.list.some(w=>w.id==c.id))continue;const R=WROLE[c.role];h+=SROW(`<div><b>${ICO(R.ic)} ${esc(c.n)}</b> <i class="tag pvt">Niv. ${c.lv}</i><small>${R.n} — ${R.d}<br>Salaire ${wWage(c)} ¢ / 10 min${c.lv>=3?' · capsule de survie':''}</small></div>`,`<button data-sv="whire:${c.id}" class="${G.cr>=c.fee?'hot':'dim'}">Recruter ${fmt(c.fee)} ¢</button>`)}}return h}});
// apparition en vol, salaires, blessures
function wingSync(){const now=Date.now();let slot=0;for(const w of WG.list){if(w.st=='inj'&&now>=w.inj){w.st='ok';w.hp=1;toast('🛩 '+w.n+' a repris du service')}let F=FR.find(f=>f.w===w&&!f.gone);
if(w.st!='ok'){if(F)frRemove(F);continue}if(F&&F.pos.distanceTo(S.pos)>4000)F.pos.copy(S.pos).add(new V3(rv(80),30,90).applyQuaternion(S.q));if(!F){const s=wStats(w),R=WROLE[w.role],col=new THREE.Color(R.col).offsetHSL(w.hue*.1-.05,0,0).getHex();F=frSpawn({kind:'wing',w,role:w.role,p:S.pos.clone().add(new V3(rv(80),30,60).applyQuaternion(S.q)),hp:s.hp*Math.max(.25,w.hp),mhp:s.hp,dmg:s.dmg,rate:s.rate,rng:s.rng,regen:s.regen,sp:260,col,acc:R.acc,bc:0x8dffb8,
onDie:F2=>{if(w.lv>=3){w.st='inj';w.inj=Date.now()+5*60e3;w.hp=1;toast('🪂 '+w.n+' s\'est éjecté ! De retour dans 5 min (ou soigne-le au bar)')}else{WG.list.splice(WG.list.indexOf(w),1);toast('💀 '+w.n+' est mort au combat…')}SFX.alarm();save()}});F.dir.copy(fwd())}F.slot=slot++}
for(const F of FR)if(F.kind=='wing'&&!WG.list.includes(F.w))frRemove(F)}
let WGT=0;STICK.push(dt=>{WGT-=dt;if(WGT<=0){WGT=1;wingSync()}updFR(dt);
// salaire toutes les 10 minutes de jeu
if(WG.list.length&&(G.time||0)-WG.paid>600){WG.paid=G.time||0;let tot=0;for(const w of [...WG.list]){const c=wWage(w);if(G.cr>=c){G.cr-=c;tot+=c;w.unpaid=0}else{w.unpaid=(w.unpaid||0)+1;if(w.unpaid>=2){wingFire(w.id);toast('💸 '+w.n+' est parti : salaire impayé');}else toast('💸 Impossible de payer '+w.n+' — il partira à la prochaine paie manquée')}}if(tot)toast('💸 Salaires de l\'escadrille : −'+fmt(tot)+' ¢')}else if(!WG.list.length)WG.paid=G.time||0});
// HUD : noms et santé des alliés, radar
{const _ov=overlay;overlay=function(){_ov();if(mode!='space'||S.dead)return;for(const F of FR){if(F.gone)continue;const s=proj(F.pos);if(!s.front||s.d>2500)continue;const nm=F.w?F.w.n.split(' ')[0]:F.name||'';if(!nm&&F.kind=='ally')continue;const y=s.y-22;OX.textAlign='center';OX.font="700 11px 'Chakra Petch',system-ui";OX.fillStyle=F.kind=='freighter'||F.kind=='platform'?'#ffd257':'#8dffb8';OX.fillText(nm||'Allié',s.x,y);OX.fillStyle='rgba(0,0,0,.5)';OX.fillRect(s.x-18,y+4,36,3);OX.fillStyle=F.hp/F.mhp<.35?'#ff5a5a':'#5af0a0';OX.fillRect(s.x-18,y+4,36*clamp(F.hp/F.mhp,0,1),3)}}}
{const _mr=mpRadar;mpRadar=function(blip){_mr(blip);if(mode=='space')for(const F of FR)if(!F.gone)blip(F.pos,F.kind=='freighter'||F.kind=='platform'?'#ffd257':'#6dffa0',F.kind=='freighter'||F.kind=='platform'?3:2,F.kind!='wing'&&F.kind!='ally')}}
{const _ci=contentInfo;contentInfo=function(){let s=_ci();if(mode=='space'&&WG.list.length&&(en.length||FR.some(F=>F.w&&F.hp<F.mhp*.95)))s+=(s?'<br>':'')+'<span style="color:#8dffb8">🛩 '+WG.list.map(w=>{const F=FR.find(f=>f.w===w&&!f.gone);return esc(w.n.split(' ')[0])+' '+(w.st=='inj'?'blessé':F?Math.round(F.hp/F.mhp*100)+' %':'…')}).join(' · ')+'</span>';return s}}
// voyage rapide et mort : l'escadrille suit
{const _ft=fastTravel;fastTravel=function(o){_ft(o);setTimeout(()=>{for(const F of FR)if(F.kind=='wing'&&!F.gone){F.pos.copy(S.pos).add(new V3(rv(60),20,80).applyQuaternion(S.q))}},500)}}
