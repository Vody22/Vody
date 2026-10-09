// ===== GUERRE DES FACTIONS : territoires (secteurs de 12 km), influence partagée entre tous les joueurs, stations qui changent de camp, batailles de frontière =====
const SEC=12000,WAR={pend:{},ctl:{},cur:'',bat:null,batT:120,syncT:8,getT:2,busy:false};const WARD=GX('warD',{});
const secOf=(x,z)=>Math.floor(x/SEC)+','+Math.floor(z/SEC);
const secName=sid=>{const[a,b]=sid.split(',').map(Number);return'Secteur '+NA[((a*7+b*13)%10+10)%10]+'-'+(((a*31+b*17)%90+90)%90+10)};
function infl0(sid){const[a,b]=sid.split(',').map(Number);if(a>=-1&&a<=0&&b>=-1&&b<=0)return 90;const sd=Math.hypot(a+.5,b+.5);return clamp(85-sd*26+(h3(a,0,b,501)-.5)*70,-100,100)}
const influ=sid=>clamp(infl0(sid)+(+WARD[sid]||0)+(WAR.pend[sid]||0),-100,100);
const ctlOf=sid=>{const v=influ(sid);return v>=20?'alliance':v<=-20?'pirates':'front'};
const CTLN={alliance:'Alliance stellaire',pirates:'Pavillon noir',front:'Frontière disputée'},CTLC={alliance:'#7ab6ff',pirates:'#ff5a5a',front:'#ffc34d'},CTLS={alliance:'Alliance',pirates:'Pirates',front:'Frontière'};
stFac=st=>{if(!st)return'alliance';if(st.base)return'neutral';if(st.n=='Base Alpha')return'alliance';return ctlOf(secOf(st.x,st.z))};
function terrTag(){if(mode!='space')return'';return' · '+CTLS[ctlOf(secOf(S.pos.x,S.pos.z))]}
// contribution des actions du joueur à l'influence du secteur (+ = Alliance, − = pirates)
function warAdd(n,pos){const p=pos||S.pos,sid=secOf(p.x,p.z);WAR.pend[sid]=clamp((WAR.pend[sid]||0)+n,-60,60);const c=ctlOf(sid);if(WAR.ctl[sid]&&WAR.ctl[sid]!==c)warFlip(sid,WAR.ctl[sid],c);WAR.ctl[sid]=c}
function warFlip(sid,a,b){banner('swords',secName(sid)+' : '+(b=='front'?'la frontière vacille':'passe sous contrôle '+(b=='alliance'?'de l\'Alliance':'pirate')),b=='pirates'?'Les stations du secteur ouvrent leur marché noir':b=='alliance'?'La douane de l\'Alliance reprend ses contrôles':'Les combats font rage : batailles de frontière en vue',CTLC[b])}
async function warSync(push){if(WAR.busy)return;const keys=Object.keys(WAR.pend).filter(k=>Math.abs(WAR.pend[k])>=.5);
if(!API_OK){for(const k of keys)WARD[k]=clamp((+WARD[k]||0)+WAR.pend[k],-150,150);WAR.pend={};return}
if(push&&!keys.length)return;WAR.busy=true;try{const d={};for(const k of keys.slice(0,30))d[k]=Math.round(WAR.pend[k]);const r=push&&keys.length?await api('/api/war',{d}):await api('/api/war');if(push)for(const k of keys.slice(0,30))delete WAR.pend[k];if(r&&r.s){for(const k in WARD)if(!(k in r.s))delete WARD[k];for(const k in r.s)WARD[k]=+r.s[k]||0}}catch(e){}WAR.busy=false}
// ----- effets : apparitions d'ennemis, prix de guerre -----
{const _ue=updEnemies;updEnemies=function(dt,z){const s0=spawnT;_ue(dt,z);if(spawnT>s0+.5){const c=ctlOf(secOf(S.pos.x,S.pos.z));spawnT*=c=='alliance'?1.5:c=='pirates'?.75:1}}}
{const _gp=gPrice;gPrice=function(st,g){const p=_gp(st,g);return stFac(st)=='front'&&(g.id=='metal'||g.id=='fuel'||g.id=='med')?Math.round(p*1.3):p}}
{const _he=hitEnemy;hitEnemy=function(e,d,p){const was=e.dead;_he(e,d,p);if(!was&&e.dead&&!e.kind)warAdd(e.boss?4:e.ty=='lourd'?2:1)}}
{const _cp=complete;complete=function(){_cp();warAdd(4)}}
// ----- batailles de frontière -----
const FRIGN=['Frégate Valiant','Frégate Aurore','Corvette Hestia','Frégate Bastion','Corvette Lyre','Frégate Sirius'];
function batStart(){fwd();const c=S.pos.clone().addScaledVector(_f,1600).add(new V3(rv(300),rv(120),rv(300)));const z=Math.max(1,danger()),B={c,al:[],foes:0,t:0,dur:240,won:false,sid:secOf(c.x,c.z)};
for(let i=0;i<3;i++){const F=frSpawn({kind:'ally',name:FRIGN[(Math.random()*FRIGN.length)|0],p:c.clone().add(new V3(rv(200),rv(60),rv(200))),hp:110,mhp:110,dmg:1.9,rate:.7,rng:2200,sp:200,anchor:c,col:0xe8eef8,acc:0x2a6aff,bc:0x9fd0ff});F.onDie=()=>{toast('💥 La '+F.name+' a été détruite');};B.al.push(F)}
for(let i=0;i<5;i++){const ty=i==4&&z>=1?'lourd':i%2?'chasseur':'pirate',e=mkEnemy(ty,c.clone().add(new V3(rv(500),rv(150),rv(500))).addScaledVector(_f,500),z);e.bat=1;e.tgF=B.al[i%3];e.onKill=()=>{B.foes--};en.push(e);B.foes++}
WAR.bat=B;banner('swords','Bataille de frontière !','Aide les frégates de l\'Alliance à repousser les pirates','#ffc34d');SFX.alarm()}
function batEnd(win,txt){const B=WAR.bat;if(!B)return;WAR.bat=null;WAR.batT=200+Math.random()*120;const alive=B.al.filter(F=>!F.gone);if(win){const cr=600+150*alive.length;G.cr+=cr;gainXP(150);addRep('alliance',60);warAdd(15,B.c);STS.bat++;banner('swords','Bataille gagnée !','+'+fmt(cr)+' ¢ · l\'Alliance gagne du terrain','#7ab6ff');SFX.win()}
else{if(txt)toast(txt);warAdd(-10,B.c)}setTimeout(()=>{for(const F of alive)frRemove(F)},win?12000:3000);save()}
function batTick(dt){const B=WAR.bat;if(!B){if(mode!='space'||S.docked||S.dead||EV||BOSS||DLG.open)return;if(ctlOf(secOf(S.pos.x,S.pos.z))!='front')return;WAR.batT-=dt;if(WAR.batT<=0){let nearSt=false;for(const st of stations)if(S.pos.distanceTo(_v.set(st.x,st.y,st.z))<1500)nearSt=true;if(nearSt){WAR.batT=20;return}batStart()}return}
B.t+=dt;if(B.foes<=0&&!B.won){B.won=true;batEnd(true);return}if(B.al.every(F=>F.gone)){batEnd(false,'💥 Les frégates de l\'Alliance sont tombées : les pirates gagnent du terrain');return}if(B.t>B.dur||S.pos.distanceTo(B.c)>6000){batEnd(false,'La bataille s\'est terminée sans toi');for(const e of en)if(e.bat){e.dead=1;e.mesh.parent&&e.mesh.parent.remove(e.mesh)}}}
// ----- boucle : secteur courant, synchronisation -----
function warTick(dt){const sid=secOf(S.pos.x,S.pos.z),c=ctlOf(sid);if(sid!==WAR.cur){WAR.cur=sid;if(WAR.ctl[sid]&&WAR.ctl[sid]!==c)warFlip(sid,WAR.ctl[sid],c);else if(t>5)toast('⚔ '+secName(sid)+' — '+CTLN[c]+' ('+Math.round(influ(sid))+')');WAR.ctl[sid]=c}else if(WAR.ctl[sid]!==c){warFlip(sid,WAR.ctl[sid],c);WAR.ctl[sid]=c}batTick(dt)}
STICK.push(warTick);
TICK.push(dt=>{WAR.syncT-=dt;if(WAR.syncT<=0){WAR.syncT=90;warSync(true)}WAR.getT-=dt;if(WAR.getT<=0){WAR.getT=300;warSync(false)}});
addEventListener('pagehide',()=>{if(!API_OK)return;const keys=Object.keys(WAR.pend).filter(k=>Math.abs(WAR.pend[k])>=.5);if(!keys.length||!navigator.sendBeacon)return;const d={};for(const k of keys.slice(0,30))d[k]=Math.round(WAR.pend[k]);try{navigator.sendBeacon('/api/war',new Blob([JSON.stringify({d})],{type:'application/json'}))}catch(e){}});
{const _ci=contentInfo;contentInfo=function(){let s=_ci();const B=WAR.bat;if(B&&mode=='space')s+=(s?'<br>':'')+`<span style="color:#ffc34d">⚔ Bataille de frontière — pirates : ${Math.max(0,B.foes)} · frégates : ${B.al.filter(F=>!F.gone).length}/3</span>`;return s}}
{const _ov=overlay;overlay=function(){_ov();const B=WAR.bat;if(B&&mode=='space'&&!S.dead&&S.pos.distanceTo(B.c)>900)edgeMarker(B.c,'#ffc34d','Bataille','⚔')}}
// ----- station : statut et faction -----
svcAdd({o:1,ic:'swords',t:st=>'Territoire · '+CTLN[stFac(st)],show:st=>!st.ground&&!st.base,html:st=>{const sid=secOf(st.x,st.z),v=Math.round(influ(sid)),f=stFac(st);
return`<div class="hint" style="text-align:left">${secName(sid)} · influence <b style="color:${CTLC[f]}">${v>0?'+':''}${v}</b> (Alliance +100 · pirates −100)<br>${f=='alliance'?'Douane active : la contrebande est saisie.':f=='pirates'?'Repaire pirate : marché noir ouvert, aucune douane.':'Zone disputée : métal, carburant et médicaments se vendent 30 % plus cher, batailles fréquentes.'}<br><small>Chaque pirate abattu, chaque mission et chaque bataille gagnée fait pencher la balance — pour tous les joueurs.</small></div>`}});
// ----- carte : territoires -----
{const _dm=drawMap;drawMap=function(){_dm();if(mode=='surf'&&GR)return;const W=innerWidth,H=innerHeight,s=SEC*MAP.zoom;if(s<14)return;const x0=Math.floor((MAP.cx-W/2/MAP.zoom)/SEC),x1=Math.floor((MAP.cx+W/2/MAP.zoom)/SEC),z0=Math.floor((MAP.cz-H/2/MAP.zoom)/SEC),z1=Math.floor((MAP.cz+H/2/MAP.zoom)/SEC);
if((x1-x0)*(z1-z0)>900)return;MX.save();MX.globalCompositeOperation='lighter';for(let a=x0;a<=x1;a++)for(let b=z0;b<=z1;b++){const sid=a+','+b,c=ctlOf(sid),[px,py]=w2s(a*SEC,b*SEC);MX.fillStyle=c=='alliance'?'rgba(60,110,200,.07)':c=='pirates'?'rgba(200,50,50,.08)':'rgba(200,150,40,.07)';MX.fillRect(px,py,s,s);MX.strokeStyle=c=='alliance'?'rgba(120,170,255,.14)':c=='pirates'?'rgba(255,90,90,.16)':'rgba(255,200,80,.16)';MX.strokeRect(px+.5,py+.5,s-1,s-1);if(s>110){MX.fillStyle=CTLC[c]+'88';MX.font="600 10px 'Chakra Petch',system-ui";MX.textAlign='left';MX.fillText(secName(sid)+' · '+CTLS[c],px+5,py+13)}}MX.restore();
MX.font="600 11px 'Chakra Petch',system-ui";MX.textAlign='left';let lx=20;const ly=H-58;for(const k of['alliance','pirates','front']){MX.fillStyle=CTLC[k];MX.fillRect(lx,ly-8,9,9);MX.fillStyle='rgba(220,235,255,.85)';MX.fillText(CTLS[k],lx+13,ly);lx+=MX.measureText(CTLS[k]).width+30}}}
