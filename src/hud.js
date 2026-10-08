// ===== INTERFACE =====
const HC={};function setH(id,v){if(HC[id]!==v){HC[id]=v;$(id).innerHTML=v}}
function setW(id,f){const v=(clamp(f,0,1)*100).toFixed(1)+'%';if(HC[id]!==v){HC[id]=v;$(id).style.width=v}}
function setD(id,v){if(HC['d'+id]!==v){HC['d'+id]=v;$(id).style.display=v}}
function hud(){const hp=Math.max(0,S.hp|0),mh=maxhp();setW('hpb',hp/mh);setH('hpt',hp);const low=hp/mh<.3;if(HC.low!==low){HC.low=low;$('hpbar').classList.toggle('low',low)}setW('orb',cargoUsed()/cap());setH('ort',cargoUsed()+'/'+cap());{const ms=PM('sh');setD('shrow',ms>0?'flex':'none');if(ms>0){setW('shb',(S.sh||0)/ms);setH('sht',Math.ceil(S.sh||0))}}setH('cr',G.cr+' <small>¢</small>');
let info='',sub,zone;if(mode=='surf'){const I=SURF.info();info=`<span style="color:#9cf">🪐 ${I.name} · ${I.ty}</span><br><span style="color:#a9c6da">${I.wx}</span>${I.lava?'<br><b style="color:#f84">⚠ Lave !</b>':I.gey?'<br><b style="color:#f84">⚠ Geyser !</b>':''}`;sub=`💎 ${I.cr} · ✦ ${I.ar} · ⌖ ${I.tu}`;zone=[I.ty,'#9cf']}
else{const z=danger();sub=`🪐 ${G.disc.size} · ☠ ${G.kills} · ✔ ${G.done}`;zone=[ZN[z],ZC[z]]}
if(G.m)info=(info?info+'<br>':'')+`<span style="color:#5f9">🎯 ${G.m.txt}${G.m.type=='chasse'?` (${G.kills-G.m.k0}/${G.m.n})`:''}</span> <span style="color:#ffd257">+${G.m.rw} ¢</span>`;
setH('info',info+(info&&contentInfo()?'<br>':'')+contentInfo());setH('sub',sub);setH('zone',zone[0]);if(HC.zc!==zone[1]){HC.zc=zone[1];$('zone').style.color=zone[1]}
// boutique et bouton principal
const lb=$('land');let lt='',dis=false;if(S.entry||S.ascent)lt='';else if(mode=='surf')lt='🚀 DÉCOLLER';else if(S.docked)lt='🚀 REPARTIR';else if(landP&&!S.dead){lt=landP.ring?'Géante gazeuse — impossible':'🛬 ATTERRIR';dis=landP.ring}if(lt&&DESK&&!dis)lt+=' <kbd>E</kbd>';
setD('land',lt?'block':'none');setH('land',lt);lb.style.opacity=dis?.5:1;
setD('shop',S.docked&&mode=='space'?'flex':'none');if(S.docked){setH('shopT','⬡ '+S.docked.n.toUpperCase());for(let i=0;i<3;i++){setH('u'+(i+1),`<b>${['⚔','🔥','🛡'][i]} ${tn[i]}${DESK?' <kbd>'+(i+1)+'</kbd>':''}</b><em>${'●'.repeat(G.u[i])+'○'.repeat(6-G.u[i])}</em><small>${G.u[i]>=6?'MAX':100*G.u[i]+' ¢'}</small>`);$('u'+(i+1)).style.opacity=G.u[i]<6&&G.cr>=100*G.u[i]?1:.5}
setH('mis',G.m?(armed?'Toucher encore pour abandonner':'En cours : '+G.m.txt):offer?'📋 Accepter : '+offer.txt+' (+'+offer.rw+' ¢)'+(DESK?' <kbd>F</kbd>':''):'Aucune mission disponible')}}
$('land').onclick=()=>{if(S.entry||S.ascent)return;if(mode=='surf')startAscent();else if(S.docked)undock();else if(landP&&!landP.ring)startEntry(landP)};
// ----- surimpression : réticule, marqueurs, radar, joystick -----
const PV=new V3();function proj(p){PV.set(p.x,p.y,p.z);const camD=PV.clone().sub(camera.position),front=camD.dot(_u.set(0,0,-1).applyQuaternion(camera.quaternion))>0;PV.project(camera);return{x:(PV.x+1)/2*innerWidth,y:(1-PV.y)/2*innerHeight,front,d:camD.length()}}
function edgeMarker(p,col,label,icon){const W=innerWidth,H=innerHeight,s=proj(p);let x=s.x,y=s.y;const m=40,on=s.front&&x>m&&x<W-m&&y>m+60&&y<H-m-40;const dist=Math.round(S.pos.distanceTo(PV.set(p.x,p.y,p.z)));
if(on){OX.strokeStyle=col;OX.lineWidth=2;OX.beginPath();OX.moveTo(x,y-14);OX.lineTo(x+10,y);OX.lineTo(x,y+14);OX.lineTo(x-10,y);OX.closePath();OX.stroke();OX.fillStyle=col;OX.font='700 11px system-ui';OX.textAlign='center';OX.fillText((icon||'')+' '+(dist>=1000?(dist/1000).toFixed(1)+' km':dist+' m'),x,y+28);if(label){OX.font='600 11px system-ui';OX.fillText(label,x,y-20)}return}
let dx=x-W/2,dy=y-H/2;if(!s.front){dx=-dx;dy=-dy}if(Math.abs(dx)<1&&Math.abs(dy)<1)dy=1;const a=Math.atan2(dy,dx),rx=W/2-34,ry=H/2-110,k=Math.min(rx/Math.abs(Math.cos(a)||1e-6),ry/Math.abs(Math.sin(a)||1e-6));x=W/2+Math.cos(a)*k;y=H/2+Math.sin(a)*k+20;
OX.save();OX.translate(x,y);OX.rotate(a);OX.fillStyle=col;OX.shadowColor=col;OX.shadowBlur=10;OX.beginPath();OX.moveTo(13,0);OX.lineTo(-8,-9);OX.lineTo(-3,0);OX.lineTo(-8,9);OX.fill();OX.restore();OX.fillStyle=col;OX.font='700 10px system-ui';OX.textAlign='center';OX.fillText(dist>=1000?(dist/1000).toFixed(1)+' km':dist+' m',x,y+(Math.sin(a)>0?-14:22))}
function label(p,txt,col,maxD){const s=proj(p);if(!s.front||s.d>maxD)return;OX.fillStyle=col;OX.font='600 12px system-ui';OX.textAlign='center';OX.fillText(txt,s.x,s.y)}
function overlay(){const W=innerWidth,H=innerHeight;OX.clearRect(0,0,W,H);OX.shadowColor='rgba(0,0,0,.75)';OX.shadowBlur=4;
if(CLOUDW>.01&&mode=='surf'){OX.fillStyle=`rgba(${CLOUDC},${CLOUDW*.88})`;OX.fillRect(0,0,W,H)}if(S.heat>.02){const g=OX.createRadialGradient(W/2,H/2,Math.min(W,H)*.25,W/2,H/2,Math.max(W,H)*.75);g.addColorStop(0,'rgba(255,120,30,0)');g.addColorStop(1,`rgba(255,110,30,${S.heat*.55})`);OX.fillStyle=g;OX.fillRect(0,0,W,H)}
if(hurt>0){const g=OX.createRadialGradient(W/2,H/2,Math.min(W,H)*.3,W/2,H/2,Math.max(W,H)*.7);g.addColorStop(0,'rgba(255,0,0,0)');g.addColorStop(1,`rgba(255,30,30,${hurt*.9})`);OX.fillStyle=g;OX.fillRect(0,0,W,H)}
if(S.dead)return;
// étiquettes
if(mode=='space'){for(const p of planets)if(G.disc.has(p.name))label({x:p.x,y:p.y+p.r*1.25,z:p.z},p.name,'rgba(170,215,255,.9)',14000);for(const s of suns)label({x:s.x,y:s.y+s.r*1.5,z:s.z},'★ '+s.name,'#ffd890',22000);for(const st of stations)if(!(G.m&&G.m.tg===st)&&st!==hud.mk)label({x:st.x,y:st.y+110,z:st.z},st.n,'#ffc845',4000)}
lensFlares();
// réticule
fwd();const aim=proj(_w.copy(S.pos).addScaledVector(_f,320));if(aim.front){OX.strokeStyle='rgba(160,230,255,.75)';OX.lineWidth=1.5;OX.beginPath();OX.arc(aim.x,aim.y,11,0,TAU);for(const[a,b]of[[0,-1],[0,1],[-1,0],[1,0]]){OX.moveTo(aim.x+a*15,aim.y+b*15);OX.lineTo(aim.x+a*22,aim.y+b*22)}OX.stroke();OX.fillStyle='rgba(160,230,255,.9)';OX.fillRect(aim.x-1,aim.y-1,2,2)}
if(lock){const s=proj(lock.pos);if(s.front){const r=clamp(1800/s.d*((lock.r||8)/6),12,60),c=lock.mhp?'#ff5050':'#e8f4ff';OX.strokeStyle=c;OX.lineWidth=2;for(const[a,b]of[[-1,-1],[1,-1],[1,1],[-1,1]]){OX.beginPath();OX.moveTo(s.x+a*r,s.y+b*r*.55);OX.lineTo(s.x+a*r,s.y+b*r);OX.lineTo(s.x+a*r*.55,s.y+b*r);OX.stroke()}if(lock.mhp){OX.fillStyle='rgba(0,0,0,.5)';OX.fillRect(s.x-r,s.y+r+5,r*2,4);OX.fillStyle=c;OX.fillRect(s.x-r,s.y+r+5,r*2*clamp(lock.hp/lock.mhp,0,1),4)}}}
// marqueurs
if(G.m&&G.m.tg)edgeMarker(G.m.tg,'#4dff8a',G.m.type=='liv'?G.m.tg.n:G.m.type=='boss'?'Chef pirate':'','🎯');
else if(mode=='space'&&!S.docked){let best=null,bd=1e9;const cx=cof(S.pos.x),cz=cof(S.pos.z);for(let i=-3;i<=3;i++)for(let l=-3;l<=3;l++)for(let j=-1;j<=1;j++){const st=cdata(cx+i,j,cz+l).st;if(st){const d=Math.hypot(st.x-S.pos.x,st.y-S.pos.y,st.z-S.pos.z);if(d<bd){bd=d;best=st}}}hud.mk=best;if(best&&bd>600)edgeMarker(best,'#ffc845',best.n,'⬡')}
if(mode=='surf'){const I=SURF.info();if(I.arts.length){const a=I.arts.reduce((m,o)=>o.pos.distanceTo(S.pos)<m.pos.distanceTo(S.pos)?o:m);edgeMarker(a.pos,'#ffd060','Artefact','✦')}}
for(const e of en){if(e.pos.distanceTo(S.pos)>1400)continue;const s=proj(e.pos);if(!(s.front&&s.x>0&&s.x<W&&s.y>0&&s.y<H))edgeMarker(e.pos,e.boss?'#c890ff':'#ff5050','','')}
// vitesse
OX.fillStyle='rgba(180,220,255,.85)';OX.font='800 12px system-ui';OX.textAlign='center';OX.fillText(Math.round(S.spd)+' m/s'+(isBoost()&&!S.docked?' ⚡':''),W/2,H-(DESK?36:W>H&&H<520?70:96));
if(DESK&&MS.in&&!S.dead){const R=Math.min(W,H)*.34,cx=W/2+MS.x*R,cy=H/2+MS.y*R;OX.strokeStyle='rgba(160,230,255,.25)';OX.lineWidth=1;OX.beginPath();OX.arc(W/2,H/2,R*.05,0,TAU);OX.stroke();OX.setLineDash([3,5]);OX.beginPath();OX.moveTo(W/2,H/2);OX.lineTo(cx,cy);OX.stroke();OX.setLineDash([]);OX.strokeStyle='rgba(200,240,255,.9)';OX.lineWidth=2;OX.beginPath();OX.arc(cx,cy,7,0,TAU);OX.stroke();OX.fillStyle='#fff';OX.fillRect(cx-1,cy-1,2,2)}
radar();contentOverlay();mpOverlay();
// joystick
if(stick){const R=stick.R||70;OX.strokeStyle='rgba(120,220,255,.45)';OX.lineWidth=2;OX.beginPath();OX.arc(stick.ox,stick.oy,R,0,TAU);OX.stroke();OX.fillStyle='rgba(120,220,255,.35)';OX.beginPath();OX.arc(stick.ox+stick.x*R,stick.oy+stick.y*R,R*.36,0,TAU);OX.fill()}
else if(!DESK&&(hint>0||t<4)){OX.globalAlpha=.35+.25*Math.sin(t*3);OX.strokeStyle='#8fd8ff';OX.lineWidth=2;OX.beginPath();OX.arc(W*.24,H*.72,52,0,TAU);OX.stroke();OX.globalAlpha=1}
if(hint>0){OX.fillStyle='rgba(210,240,255,.92)';OX.font='600 14px system-ui';OX.textAlign='center';const hy=W>H?H*.24:H*.19;OX.fillText(DESK?'Le vaisseau suit ta souris · Clic gauche pour tirer':'Glisse à gauche pour piloter (haut = monter)',W/2,hy);OX.fillText(DESK?'Z/W ou clic droit : boost · S : frein · E : atterrir/amarrer':'FEU tire · BOOST accélère · FREIN ralentit',W/2,hy+22);OX.fillText('Va vers la station ⬡ pour commencer',W/2,hy+44)}}
function radar(){const W=innerWidth,H=innerHeight,land=W>H&&H<520,mr=DESK?80:land?46:54,mx=W-mr-(DESK?24:14),my=DESK?H-mr-24:land?mr+100:H-mr-210,R=mode=='surf'?1600:7000,inv=S.q.clone().invert();
const bg=OX.createRadialGradient(mx,my-10,4,mx,my,mr);bg.addColorStop(0,'rgba(20,55,95,.82)');bg.addColorStop(1,'rgba(3,10,24,.88)');OX.fillStyle=bg;OX.beginPath();OX.arc(mx,my,mr,0,TAU);OX.fill();
OX.save();OX.beginPath();OX.arc(mx,my,mr,0,TAU);OX.clip();OX.fillStyle='rgba(90,200,255,.1)';const sw=t*1.3;OX.beginPath();OX.moveTo(mx,my);OX.arc(mx,my,mr,sw,sw+.7);OX.closePath();OX.fill();
OX.strokeStyle='rgba(120,200,255,.16)';OX.lineWidth=1;OX.beginPath();OX.arc(mx,my,mr*.5,0,TAU);OX.moveTo(mx-mr,my);OX.lineTo(mx+mr,my);OX.moveTo(mx,my-mr);OX.lineTo(mx,my+mr);OX.stroke();
const blip=(p,c,r,always)=>{_v.set(p.x-S.pos.x,p.y-S.pos.y,p.z-S.pos.z).applyQuaternion(inv);let dx=_v.x/R*mr,dy=_v.z/R*mr;const l=Math.hypot(dx,dy);if(l>mr-4){if(!always)return;dx*=(mr-4)/l;dy*=(mr-4)/l}const el=clamp(-_v.y/R*mr*.8,-14,14);
if(Math.abs(el)>1.5){OX.strokeStyle=c;OX.globalAlpha=.6;OX.beginPath();OX.moveTo(mx+dx,my+dy);OX.lineTo(mx+dx,my+dy+el);OX.stroke();OX.globalAlpha=1}OX.fillStyle=c;OX.beginPath();OX.arc(mx+dx,my+dy+el,r,0,TAU);OX.fill()};
if(mode=='space'){const cx=cof(S.pos.x),cz=cof(S.pos.z);for(let i=-2;i<=2;i++)for(let l=-2;l<=2;l++)for(let j=-1;j<=1;j++){const c=cdata(cx+i,j,cz+l);if(c.sun)blip(c.sun,'#ffd27a',4,true);if(c.pl)blip(c.pl,G.disc.has(c.pl.name)?`hsl(${c.pl.hue},60%,62%)`:'rgba(160,190,220,.6)',3);if(c.st)blip(c.st,'#ffc845',2.6)}for(const d of DROPS)blip(d.p,'#5ff',1.4)}
else{const I=SURF.info();for(const c of I.crys)blip(c.pos,'#5ff',1.8);for(const a of I.arts)blip(a.pos,'#ffd060',3,true);for(const T of I.tur)blip(T.pos,'#ff7050',2.4)}
for(const e of en)blip(e.pos,e.boss?'#d27bff':'#ff4d4d',e.boss?3.6:2.2,e.boss);if(G.m&&G.m.tg)blip(G.m.tg,'#4f8',3.2,true);mpRadar(blip);OX.restore();
OX.fillStyle='#fff';OX.beginPath();OX.moveTo(mx,my-6);OX.lineTo(mx-4,my+4);OX.lineTo(mx,my+2);OX.lineTo(mx+4,my+4);OX.fill();
const rg=OX.createLinearGradient(mx-mr,my-mr,mx+mr,my+mr);rg.addColorStop(0,'rgba(140,220,255,.85)');rg.addColorStop(1,'rgba(60,120,200,.4)');OX.strokeStyle=rg;OX.lineWidth=1.5;OX.beginPath();OX.arc(mx,my,mr,0,TAU);OX.stroke()}
// ===== BOUCLE =====
function stepFX(dt){shieldT=Math.max(0,shieldT-dt*1.8);hurt=Math.max(0,hurt-dt);if(S.hp<lastHp-.5){hurt=Math.min(.5,hurt+.2);shieldT=1;shake=Math.min(1.4,shake+.35)}lastHp=S.hp}
let last=performance.now();
function frame(now){requestAnimationFrame(frame);const dt=clamp((now-last)/1000,0,.05);last=Math.max(last,now);DT=dt;t+=dt;hint-=dt;
try{if(!isPaused()){if(mode=='space')updSpace(dt);else SURF.update(dt);updContent(dt)}updContentAlways(dt);updMP(dt)}catch(e){console.error(e)}
SPK.update(dt);FIRE.update(dt);updFlashes(dt);updFXS(dt);updFX(dt);updFade(dt);placeShip(dt);updCam(dt);updSpeedLines(dt,mode=='space'&&!S.docked?fovK:0,S.spd);updDetail();stepFX(dt);updParts(dt);
if(engG&&AC)engG.gain.setTargetAtTime(S.dead?0:S.thr*.05+(isBoost()&&!S.docked?.07:0),AC.currentTime,.08);if(engLP&&AC)engLP.frequency.setTargetAtTime(160+S.spd*2.2,AC.currentTime,.1);
TM.value=t;camera.updateMatrixWorld();if(typeof updGodRays=='function')updGodRays();renderFrame();overlay();if(FADE.v>.003){OX.fillStyle=`rgba(${FADE.col},${FADE.v})`;OX.fillRect(0,0,innerWidth,innerHeight)}hud()}
if(DESK){try{NEB.material.map=gpuNebula();NEB.material.needsUpdate=true}catch(e){console.warn(e)}setupEnv(NEB);setupPost();setupGrade()}
resize();{const l=load();if(l=='old')setTimeout(()=>toast('Progression de la version 2D importée'),400);else if(l){hint=0;setTimeout(()=>toast('Partie chargée — bon retour, pilote'),400)}}
if(S.pos.distanceTo(new V3())<300)S.pos.set(0,30,900);
rebuildShip();S.hp=Math.min(S.hp,maxhp());startStory();
$('loading').remove();requestAnimationFrame(frame);

// ----- qualité graphique (PC) -----
let QI=0;const QN=['Ultra','Élevée','Performance'];function cycleQuality(){if(!DESK)return;QI=(QI+1)%3;bloomOn=QI==0;R3.shadowMap.enabled=QI<2;R3.setPixelRatio(QI==2?1:Math.min(devicePixelRatio||1,1.5));resize();scene.traverse(o=>{if(o.material)o.material.needsUpdate=true});SURF.scene.traverse(o=>{if(o.material)o.material.needsUpdate=true});toast('Qualité graphique : '+QN[QI]);setH('qbtn','⚙ '+QN[QI]);try{localStorage.setItem('sf-q',QI)}catch(e){}}
if(DESK){$('qbtn').onclick=cycleQuality;setH('qbtn','⚙ Ultra');try{const q=+localStorage.getItem('sf-q')||0;for(let i=0;i<q;i++)cycleQuality()}catch(e){}}
