// ===== MULTIJOUEUR (capacité « room » : présence partagée en temps réel) =====
const MP={room:null,user:null,on:false,me:null,others:new Map(),shots:[],shotN:0,hits:[],hitN:0,chatN:0,chat:null,ds:0,kb:null,lastAtk:null,lastAtkT:-99,sendT:0,pvp:false,pk:0,feed:[],names:{},nick:'',hue:0,panel:false};
try{MP.nick=(localStorage.getItem('sf-nick')||'').slice(0,16);MP.hue=+(localStorage.getItem('sf-hue')||Math.floor(Math.random()*360));localStorage.setItem('sf-hue',MP.hue);MP.pvp=localStorage.getItem('sf-pvp')=='1'}catch(e){MP.hue=Math.floor(Math.random()*360)}
const _m1=new V3(),_m2=new V3(),_mq=new QT(),_mq2=new QT();
const SHIPN={eclaireur:'Éclaireur',intercepteur:'Intercepteur',cargo:'Cargo',faucon:'Faucon',leviathan:'Léviathan'};
const r1=v=>Math.round(v*10)/10,r3=v=>Math.round(v*1000)/1000;
const cleanTxt=s=>String(s||'').replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁤﻿]/g,'').slice(0,120);
(async()=>{try{let room=null,user=null;if(window.claude&&claude.use)[room,user]=await Promise.all([claude.use('room'),claude.use('user')]);if(!room&&window.SF_STANDALONE){room=makeNetRoom();if(room){MP.net=room.code;if(!MP.nick){MP.nick='Pilote-'+(100+Math.random()*900|0);try{localStorage.setItem('sf-nick',MP.nick)}catch(e){}}}}MP.user=user;if(!room)return;MP.room=room;
room.onConnection(c=>{MP.on=c;mpUI()},()=>{MP.on=false;MP.room=null;mpUI()});room.onPeers(ch=>{for(const p of ch.left)mpRemove(p.peer);for(const p of[...ch.joined,...ch.updated])mpPeer(p);mpNames()},()=>{});
mpSend(true);mpUI()}catch(e){console.warn('multijoueur indisponible',e)}})();
function mpName(o){return o.nick||(o.by&&MP.names[o.by])||'Pilote'}
async function mpNames(){if(!MP.user)return;const ids=[...MP.others.values()].map(o=>o.by).filter(Boolean);if(!ids.length)return;try{const ps=await MP.user.profiles(ids);for(const id of ids)if(ps[id]&&ps[id].name)MP.names[id]=ps[id].name.slice(0,24)}catch(e){}}
// ----- réception -----
function mpPeer(p){if(p.kind!='viewer')return;if(p.sameTab){MP.me=p.peer;return}const pr=p.presence||{};if(!pr.p)return;let o=MP.others.get(p.peer);
if(!o){o={peer:p.peer,by:p.by,guest:p.guest,buf:[],mesh:null,key:'',lastShot:0,lastHit:{},lastChat:0,ds:0,first:true};MP.others.set(p.peer,o)}
o.by=p.by;o.nick=cleanTxt(pr.nick).slice(0,16);o.hue=+pr.hue||0;o.ship=SHIPN[pr.sh]?pr.sh:'eclaireur';o.u=Array.isArray(pr.u)?pr.u.map(v=>clamp(v|0,1,6)).slice(0,3):[1,1,1];o.m=pr.m=='surf'?'surf':'space';o.pl=cleanTxt(pr.pl);o.hp=clamp(+pr.hp||0,0,1);o.dead=!!pr.dead;o.th=clamp(+pr.th||0,0,3);o.pvp=!!pr.pvp;o.pk=pr.pk|0;o.k=pr.k|0;o.lz=!!pr.lz;o.pt=typeof pr.pt=='string'?pr.pt.replace(/[^0-9]/g,'').slice(0,PSLOTS.length):'';o.parts=partsDecode(o.pt);o.lw=!!pr.lw;o.ft=!!pr.ft;
const num=a=>Array.isArray(a)&&a.every(x=>typeof x=='number'&&isFinite(x));if(num(pr.p)&&pr.p.length==3&&num(pr.q)&&pr.q.length==4){const s={t:performance.now(),p:new V3(...pr.p),q:new QT(...pr.q).normalize(),v:num(pr.v)&&pr.v.length==3?new V3(...pr.v):new V3()};if(!o.buf.length||o.buf[o.buf.length-1].p.distanceToSquared(s.p)>1e-4||o.buf.length<2){o.buf.push(s);if(o.buf.length>12)o.buf.shift()}}
// tirs
if(Array.isArray(pr.sh2)){for(const s of pr.sh2){if(!s||typeof s.i!='number'||s.i<=o.lastShot)continue;if(!o.first&&num(s.p)&&num(s.d))mpRemoteShot(o,s);o.lastShot=Math.max(o.lastShot,s.i)}}
// touches JcJ me visant
if(Array.isArray(pr.hits)){for(const h of pr.hits){if(!h||h.to!==MP.me||typeof h.i!='number')continue;const last=o.lastHit[MP.me]||0;if(h.i<=last)continue;o.lastHit[MP.me]=h.i;if(!o.first&&MP.pvp&&o.pvp&&!S.dead&&mode==o.m){damage(clamp(+h.d||0,0,40));MP.lastAtk=o.peer;MP.lastAtkT=t;boom3(S.pos,8,0xff6650,40)}}}
// discussion
if(pr.chat&&typeof pr.chat.n=='number'&&pr.chat.n>o.lastChat){o.lastChat=pr.chat.n;if(!o.first)mpFeed(mpName(o),cleanTxt(pr.chat.txt),`hsl(${o.hue},70%,70%)`)}
// morts
if(typeof pr.ds=='number'&&pr.ds>o.ds){if(!o.first){const killer=pr.kb&&(pr.kb===MP.me?'toi':MP.others.get(pr.kb)&&mpName(MP.others.get(pr.kb)));if(pr.kb===MP.me){MP.pk++;G.cr+=200;toast('⚔ Tu as abattu '+mpName(o)+' ! +200 ¢');SFX.win()}else if(killer)mpFeed('⚔',mpName(o)+' abattu par '+killer,'#f99');else mpFeed('💥',mpName(o)+' a été détruit','#f99')}o.ds=pr.ds}
if(o.first){o.first=false;setTimeout(()=>{if(MP.others.has(o.peer)){mpFeed('👋',mpName(o)+' a rejoint la partie','#8fd');SFX.disc()}},1500)}}
function mpRemove(peer){const o=MP.others.get(peer);if(!o)return;if(o.mesh&&o.mesh.parent)o.mesh.parent.remove(o.mesh);rmBeam(o.beam);MP.others.delete(peer);mpFeed('👋',mpName(o)+' a quitté la partie','#aab')}
// ----- envoi -----
function mpSend(force){if(!MP.room)return;if(!force&&t-MP.sendT<.1)return;MP.sendT=t;const I=mode=='surf'?SURF.info():null;
const pr={nick:MP.nick||null,hue:MP.hue,sh:G.ship,u:G.u,m:mode,pl:I?I.name:null,p:[r1(S.pos.x),r1(S.pos.y),r1(S.pos.z)],q:[r3(S.q.x),r3(S.q.y),r3(S.q.z),r3(S.q.w)],v:[r1(S.vel.x),r1(S.vel.y),r1(S.vel.z)],th:r1(S.thr||0),hp:r3(clamp(S.hp/maxhp(),0,1)),dead:S.dead?1:0,pvp:MP.pvp?1:0,pk:MP.pk,k:G.kills,lz:LZ.on?1:0,pt:partsCode(G.parts),lw:G.w.includes('laser')?1:0,ft:FOOT.on?1:0,
sh2:MP.shots.slice(-6),hits:MP.hits.slice(-6),chat:MP.chat,ds:MP.ds,kb:MP.kb,...(typeof mpExtraOut=='function'?mpExtraOut():{})};MP.room.presence(pr).catch(()=>{})}
function mpShot(p,d,w){if(!MP.room)return;MP.shots.push({i:++MP.shotN,p:[r1(p.x),r1(p.y),r1(p.z)],d:[r3(d.x),r3(d.y),r3(d.z)],w:w||'c',g:G.parts.guns||'std'});if(MP.shots.length>6)MP.shots.shift()}
function mpHit(o,d,pp){MP.hits.push({i:++MP.hitN,to:o.peer,d:Math.round(d*10)/10});if(MP.hits.length>6)MP.hits.shift();boom3(pp,8,0xffaa66,40);SFX.tick();mpSend(true)}
function mpDied(){MP.ds++;MP.kb=(MP.lastAtk&&t-MP.lastAtkT<6)?MP.lastAtk:null;mpSend(true)}
function mpSay(txt){txt=cleanTxt(txt).trim();if(!txt)return;MP.chat={n:++MP.chatN,txt};mpFeed(MP.nick||'Toi',txt,`hsl(${MP.hue},70%,70%)`);mpSend(true)}
// ----- rendu des autres joueurs -----
const RSM={};function rShotMat(h){return RSM[h]||(RSM[h]=new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(h/360,.9,.65),blending:ADDB,transparent:true,depthWrite:false}))}
let RSHOTS=[];
function mpRemoteShot(o,s){if(o.m!=mode||(mode=='surf'&&o.pl!==(SURF.info()||{}).name))return;const p=new V3(...s.p),d=new V3(...s.d).normalize();if(p.distanceTo(S.pos)>3000)return;
const gb=PARTS.guns.o[s.g]&&PARTS.guns.o[s.g].bc,m=s.w=='m'?new THREE.Mesh(MISG,MISM):boltMesh(gb||new THREE.Color().setHSL(o.hue/360,.9,.6).getHex(),0);m.position.copy(p);m.lookAt(p.clone().sub(d));curScene().add(m);RSHOTS.push({m,v:d.multiplyScalar(s.w=='m'?600:950),l:s.w=='m'?2:1.4,w:s.w});if(p.distanceTo(S.pos)<900)(s.w=='m'?SFX.eshoot:SFX.shoot)()}
function shipFor(sh,u,P,lw){const s=G.ship,uu=G.u;G.ship=sh;G.u=u;let m;try{m=buildShip(P||{},!!lw)}finally{G.ship=s;G.u=uu}return m}
function mpSample(o,now){const b=o.buf;if(!b.length)return null;const rt=now-110;if(b.length==1||rt>=b[b.length-1].t){const L=b[b.length-1],dt=clamp((now-L.t)/1000,0,.5);return{p:L.p.clone().addScaledVector(L.v,dt),q:L.q.clone()}}
for(let i=b.length-1;i>0;i--){const A=b[i-1],B=b[i];if(rt>=A.t){const k=clamp((rt-A.t)/Math.max(1,B.t-A.t),0,1);return{p:A.p.clone().lerp(B.p,k),q:A.q.clone().slerp(B.q,k)}}}return{p:b[0].p.clone(),q:b[0].q.clone()}}
function mpVisible(o){if(o.m!=mode)return false;if(mode=='surf'){const I=SURF.info();return I&&o.pl===I.name}return true}
function updMP(dt){if(!MP.room){return}mpSend(false);const now=performance.now(),sc=curScene();
for(const o of MP.others.values()){const vis=mpVisible(o)&&!o.dead,smp=vis&&mpSample(o,now);if(!smp){if(o.mesh)o.mesh.visible=false;hideBeam(o.beam);o.pos=null;continue}
const key=o.ft?'ft':o.ship+o.u.join('')+o.pt+(o.lw?1:0);if(!o.mesh||o.key!==key){if(o.mesh&&o.mesh.parent)o.mesh.parent.remove(o.mesh);o.mesh=o.ft?buildHuman({suit:new THREE.Color().setHSL(o.hue/360,.3,.78).getHex(),acc:0xff8a2a,tool:true,closed:false}):shipFor(o.ship,o.u,o.parts,o.lw);o.key=key;if(o.mesh.userData.shield)o.mesh.userData.shield.visible=false;
const ring=new THREE.Mesh(new THREE.TorusGeometry(o.ft?1.3:11,o.ft?.06:.25,6,40),new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(o.hue/360,.85,.6),transparent:true,opacity:.55,blending:ADDB,depthWrite:false}));ring.rotation.x=Math.PI/2;o.mesh.add(ring)}
if(o.mesh.parent!==sc)sc.add(o.mesh);o.mesh.visible=true;o.mesh.position.copy(smp.p);o.mesh.quaternion.copy(smp.q);o.pos=smp.p;
const ud=o.mesh.userData;if(ud.flames)for(const f of ud.flames){f.fl.scale.set(1,1,.3+o.th*(.7+Math.random()*.3));f.gs.scale.setScalar(2.6+o.th*1.6)}if(ud.nl)ud.nl.visible=ud.nr.visible=Math.sin(t*5)>.6;if(o.ft){o.mesh.position.y-=1;const lv=o.buf.length?o.buf[o.buf.length-1].v:null,hs=lv?Math.hypot(lv.x,lv.z):0;o.aph=(o.aph||0)+DT*hs*1.25;animAstro(o.mesh,o.aph,hs,false,false)}
if(o.lz){const lc=partOf('focus',o.parts).lc;if(o.beam&&o.beamC!==lc){rmBeam(o.beam);o.beam=null}if(!o.beam){o.beam=mkBeam(lc);o.beamC=lc}_m1.set(0,0,-1).applyQuaternion(smp.q);_m2.set(0,-.85,-8.6).applyQuaternion(smp.q).add(smp.p);placeBeam(o.beam,_m2,_m2.clone().addScaledVector(_m1,600),1+Math.random()*.15,false)}else hideBeam(o.beam)}
for(const s of RSHOTS){s.m.position.addScaledVector(s.v,dt);s.l-=dt;if(s.w=='m'&&Math.random()<.7)FIRE.emit(s.m.position.x,s.m.position.y,s.m.position.z,rv(6),rv(6),rv(6),.3,.9,.45,.12,.4);if(s.l<=0){s.m.parent&&s.m.parent.remove(s.m);if(s.w=='m')boom3(s.m.position,20,0xffa040,70,true)}}RSHOTS=RSHOTS.filter(s=>s.l>0);
for(let i=MP.feed.length-1;i>=0;i--)if(t-MP.feed[i].t>14){MP.feed.splice(i,1);MP.feedDirty=1}if(MP.feedDirty){MP.feedDirty=0;mpFeedRender()}
if(MP.panel&&Math.random()<.1)mpPanel()}
// cibles JcJ (mes tirs peuvent toucher les autres joueurs si les deux ont activé le JcJ)
function mpTargets(){if(!MP.room||!MP.pvp)return[];const r=[];for(const o of MP.others.values()){if(!o.pos||!o.pvp||o.dead)continue;if(!o.tgt)o.tgt={r:10,foe:1,max:1600,cone:.22,w:.8,isPlayer:1,hit:(d,pp)=>mpHit(o,d,pp)};o.tgt.pos=o.pos;r.push(o.tgt)}return r}
// ----- surimpression : noms, radar -----
function mpOverlay(){if(!MP.room)return;for(const o of MP.others.values()){if(!o.pos)continue;const s=proj(o.pos);const d=o.pos.distanceTo(S.pos),col=`hsl(${o.hue},80%,70%)`;
if(s.front&&s.x>0&&s.x<innerWidth&&s.y>0&&s.y<innerHeight){OX.fillStyle=col;OX.font="700 12px 'Chakra Petch',system-ui";OX.textAlign='center';OX.fillText((o.pvp?'⚔ ':'')+mpName(o),s.x,s.y-26);OX.font="600 10px 'Chakra Petch',system-ui";OX.fillStyle='rgba(220,235,255,.8)';OX.fillText((d>=1000?(d/1000).toFixed(1)+' km':Math.round(d)+' m')+' · '+SHIPN[o.ship],s.x,s.y-13);
OX.fillStyle='rgba(0,0,0,.5)';OX.fillRect(s.x-18,s.y-8,36,3);OX.fillStyle=o.hp<.3?'#f55':'#6f9';OX.fillRect(s.x-18,s.y-8,36*o.hp,3)}else if(d<8000)edgeMarker(o.pos,col,'','👤')}}
function mpRadar(blip){if(!MP.room)return;for(const o of MP.others.values())if(o.pos)blip(o.pos,`hsl(${o.hue},85%,65%)`,3,true)}
// ----- interface -----
function mpFeed(who,txt,col){MP.feed.push({who,txt,col,t});if(MP.feed.length>6)MP.feed.shift();MP.feedDirty=1}
function mpFeedRender(){const el=$('mpfeed');el.textContent='';for(const f of MP.feed){const d=document.createElement('div'),b=document.createElement('b');b.textContent=f.who+' ';b.style.color=f.col;d.appendChild(b);d.appendChild(document.createTextNode(f.txt));el.appendChild(d)}}
function mpUI(){const b=$('mpb');b.style.display=MP.room?'block':'none';const n=MP.others.size;b.innerHTML='👥'+(n?`<i>${n}</i>`:'');b.classList.toggle('off',!MP.on);if(MP.panel)mpPanel()}
function mpPanel(){const el=$('mplist');el.textContent='';const rows=[{me:1,nick:MP.nick||'Toi',hue:MP.hue,ship:G.ship,m:mode,pl:mode=='surf'?(SURF.info()||{}).name:'',k:G.kills,pk:MP.pk,pvp:MP.pvp},...[...MP.others.values()].map(o=>({o,nick:mpName(o),hue:o.hue,ship:o.ship,m:o.m,pl:o.pl,k:o.k,pk:o.pk,pvp:o.pvp,d:o.pos?o.pos.distanceTo(S.pos):null}))];
rows.sort((a,b)=>(b.pk-a.pk)||(b.k-a.k));for(const r of rows){const d=document.createElement('div');d.className='mprow';const n=document.createElement('b');n.textContent=(r.pvp?'⚔ ':'')+r.nick+(r.me?' (toi)':'');n.style.color=`hsl(${r.hue},80%,70%)`;const s=document.createElement('small');
s.textContent=`${SHIPN[r.ship]||''} · ${r.m=='surf'?'sur '+(r.pl||'une planète'):'dans l\'espace'}${r.d!=null&&r.m==mode?' · '+(r.d>=1000?(r.d/1000).toFixed(1)+' km':Math.round(r.d)+' m'):''}`;const sc=document.createElement('span');sc.textContent=`☠ ${r.k}  ⚔ ${r.pk}`;d.append(n,sc,s);el.appendChild(d)}
if(MP.net){$('mpnet').style.display='flex';$('mpcode').textContent=MP.net}$('mpstat').textContent=MP.on?(MP.others.size?MP.others.size+1+' pilotes connectés':'Tu es seul pour l\'instant — partage le jeu pour inviter des amis'):'Connexion au salon…';$('mppvp').textContent=MP.pvp?'⚔ JcJ activé':'🕊 JcJ désactivé';$('mppvp').classList.toggle('on',MP.pvp)}
$('mpb').onclick=()=>{MP.panel=!MP.panel;$('mppanel').style.display=MP.panel?'flex':'none';$('mpnick').value=MP.nick;mpPanel()};$('mpclose').onclick=()=>{MP.panel=false;$('mppanel').style.display='none'};
$('mppvp').onclick=()=>{MP.pvp=!MP.pvp;try{localStorage.setItem('sf-pvp',MP.pvp?'1':'0')}catch(e){}toast(MP.pvp?'⚔ Combat entre joueurs activé : les autres pilotes en JcJ peuvent te tirer dessus':'🕊 Combat entre joueurs désactivé');mpPanel();mpSend(true)};
$('mpnick').onchange=e=>{MP.nick=cleanTxt(e.target.value).trim().slice(0,16);try{localStorage.setItem('sf-nick',MP.nick)}catch(_){}mpSend(true);mpPanel()};
$('mpform').onsubmit=e=>{e.preventDefault();const i=$('mpmsg');mpSay(i.value);i.value='';i.blur()};
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT')return;if(e.code=='KeyT'&&MP.room&&!e.repeat){e.preventDefault();MP.panel=true;$('mppanel').style.display='flex';mpPanel();setTimeout(()=>$('mpmsg').focus(),0)}});

function mpInviteLink(){return location.origin+location.pathname+'#'+MP.net}
$('mpinv').onclick=async()=>{const url=mpInviteLink();try{if(navigator.share){await navigator.share({title:'Starfarer 3D',text:'Rejoins-moi dans Starfarer 3D !',url});return}}catch(e){}try{await navigator.clipboard.writeText(url);toast('Lien d\'invitation copié !')}catch(e){prompt('Copie ce lien et envoie-le à ton ami :',url)}};
$('mpnew').onclick=()=>{const c=Math.random().toString(36).slice(2,8);location.hash=c;location.reload()};
$('mppub').onclick=()=>{location.hash='';location.reload()};
