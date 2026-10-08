// ===== HISTOIRE, ÉVÉNEMENTS, BOSS, MUSIQUE, CARTE =====
const _s1=new V3(),_s2=new V3();
// ----- dialogues -----
const CHAR={iris:{n:'Commandante Iris Valen',ic:'👩‍✈️',c:'#6cf'},tess:{n:'Dr Orun Tess',ic:'🧑‍🔬',c:'#9f8'},corbeau:{n:'Kael « Corbeau »',ic:'🏴‍☠️',c:'#f77'},echo:{n:'L\'Écho',ic:'📡',c:'#c9f'},ia:{n:'Ordinateur de bord',ic:'🤖',c:'#cde'}};
const DLG={open:false,q:[],cur:null,shown:0,done:null};
function say(lines,done){DLG.q.push(...lines.map(l=>({who:l[0],txt:l[1]})));if(done)DLG.q.push({fn:done});if(!DLG.open)nextLine()}
function nextLine(){const l=DLG.q.shift();if(!l){DLG.open=false;$('dlg').style.display='none';return}if(l.fn){l.fn();nextLine();return}DLG.open=true;DLG.cur=l;DLG.shown=0;const C=CHAR[l.who];
$('dlg').style.display='flex';$('dlgI').textContent=C.ic;$('dlgN').textContent=C.n;$('dlgN').style.color=C.c;$('dlgT').textContent='';SFX.tick()}
function dlgTap(){if(!DLG.open)return;if(DLG.shown<DLG.cur.txt.length){DLG.shown=DLG.cur.txt.length;$('dlgT').textContent=DLG.cur.txt;return}nextLine()}
$('dlg').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();dlgTap()});addEventListener('keydown',e=>{if(e.target.tagName=='INPUT')return;if(DLG.open&&(e.code=='Enter'||e.code=='Space'||e.code=='KeyE')){e.preventDefault();e.stopImmediatePropagation();dlgTap()}},true);
function updDlg(dt){if(!DLG.open||!DLG.cur)return;if(DLG.shown<DLG.cur.txt.length){DLG.shown=Math.min(DLG.cur.txt.length,DLG.shown+dt*55);$('dlgT').textContent=DLG.cur.txt.slice(0,DLG.shown|0)}}
// ----- histoire : « L'Écho de Kepler » -----
const BEACON={x:5200,y:300,z:-3800},WRECK={x:15000,y:-400,z:16000};
let STORY_OBJ=null;
function storyFindPlanet(){let best=null,bd=1e12;const cx=cof(BEACON.x),cz=cof(BEACON.z);for(let i=-4;i<=4;i++)for(let l=-4;l<=4;l++)for(let j=-1;j<=1;j++){const p=cdata(cx+i,j,cz+l).pl;if(!p||p.ring)continue;const d=Math.hypot(p.x-BEACON.x,p.z-BEACON.z);if(d<bd){bd=d;best=p}}return best&&{n:best.name,x:best.x,y:best.y,z:best.z,r:best.r}}
function storyFindStation(){let best=null,bd=1e12;for(let i=-4;i<=4;i++)for(let l=-4;l<=4;l++)for(let j=-1;j<=1;j++){const s=cdata(i,j,l).st;if(!s||s.n=='Base Alpha')continue;const d=Math.hypot(s.x,s.z);if(d>3000&&d<bd){bd=d;best=s}}return best&&{n:best.n,x:best.x,y:best.y,z:best.z}}
const SG=()=>G.story;
const CHAPTERS={
1:{txt:()=>'Rejoins la balise Écho-1',tg:()=>BEACON},
2:{txt:()=>`Atterris sur ${SG().pl.n} et récupère le fragment`,tg:()=>SG().pl},
3:{txt:()=>'Rapporte le fragment à la Base Alpha',tg:()=>({x:0,y:0,z:0})},
4:{txt:()=>`Défends la Base Alpha (${SG().left} pirates restants)`,tg:()=>null},
5:{txt:()=>`Livre 5 Électronique à ${SG().st.n} (${Math.min(5,G.cargo.elec||0)}/5 en soute)`,tg:()=>SG().st},
6:{txt:()=>'Rejoins l\'épave du Kepler',tg:()=>WRECK},
7:{txt:()=>'Détruis le croiseur Némésis',tg:()=>BOSS&&BOSS.g.position},
8:{txt:()=>'Campagne terminée ✓ — explore librement',tg:()=>null}};
function startStory(){if(!G.story)G.story={ch:0};if(G.story.ch==0){G.story.ch=1;G.story.intro=0}else if(G.story.ch==7&&!BOSS){G.story.ch=6}}
function storyIntro(){G.story.intro=1;say([['iris','Pilote, ici la Commandante Iris Valen, Base Alpha. Bienvenue dans le secteur.'],['iris','Depuis trois jours, nos antennes captent un signal étrange. Les scientifiques l\'appellent « l\'Écho ».'],['tess','Dr Orun Tess, laboratoire de la base. Le signal vient d\'une balise abandonnée. J\'ai besoin de quelqu\'un pour aller la scanner.'],['iris','C\'est toi. Suis le marqueur violet ★. Et reste prudent : les pirates de Corbeau rôdent.']])}
let beaconMesh=null,wreckMesh=null,scanT=0,fragItem=null;
function mkBeacon(){const g=new THREE.Group();const M=new THREE.MeshStandardMaterial({color:0x2a2440,metalness:.8,roughness:.3,emissive:0x2a1050});const ob=new THREE.Mesh(new THREE.OctahedronGeometry(14,0),M);ob.scale.set(1,3,1);g.add(ob);
for(let i=0;i<3;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(26+i*10,1,8,48),new THREE.MeshBasicMaterial({color:0xb070ff,transparent:true,opacity:.7,blending:ADDB,depthWrite:false}));r.rotation.x=Math.PI/2+i*.4;g.add(r)}g.add(sprite(0xb070ff,160,.6));g.position.set(BEACON.x,BEACON.y,BEACON.z);scene.add(g);return g}
function mkWreck(){const g=new THREE.Group();const M=new THREE.MeshStandardMaterial({color:0x5a5650,map:HULLT,metalness:.6,roughness:.6}),D=new THREE.MeshStandardMaterial({color:0x1e2024,metalness:.5,roughness:.7});
const hull=new THREE.Mesh(lathe([[0,-120],[25,-90],[40,-20],[40,40],[30,70]],10),M);hull.rotation.set(.3,0,.5);g.add(hull);const tail=new THREE.Mesh(lathe([[30,0],[38,30],[34,70],[0,74]],10),M);tail.position.set(30,-40,110);tail.rotation.set(-.6,.4,1.1);g.add(tail);
for(let i=0;i<14;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(4+Math.random()*14,2+Math.random()*4,6+Math.random()*20),i%2?M:D);b.position.set(rv(120),rv(70),rv(160));b.rotation.set(rv(3),rv(3),rv(3));g.add(b)}
const ring=new THREE.Mesh(new THREE.TorusGeometry(60,5,8,40,Math.PI*1.2),D);ring.position.z=-20;ring.rotation.set(.8,.2,0);g.add(ring);for(let i=0;i<6;i++){const s=sprite(i%2?0xff5030:0x80c0ff,14);s.position.set(rv(60),rv(30),rv(100));g.add(s)}
g.position.set(WRECK.x,WRECK.y,WRECK.z);scene.add(g);return g}
function storyTick(dt){const SGx=SG();if(!SGx)return;const ch=SGx.ch;if(ch==1&&SGx.intro===0&&t>1.2&&mode=='space'){storyIntro();return}
if(!beaconMesh&&ch>=1&&ch<=2)beaconMesh=mkBeacon();if(beaconMesh){beaconMesh.rotation.y+=dt*.4;beaconMesh.children.forEach((c,i)=>{if(i>0&&c.isMesh)c.rotation.z+=dt*(.5+i*.3)})}
if(!wreckMesh&&ch>=6)wreckMesh=mkWreck();
if(mode=='space'&&ch==1){const d=S.pos.distanceTo(_s1.set(BEACON.x,BEACON.y,BEACON.z));if(d<260){scanT+=dt;if(scanT>3){scanT=0;SGx.pl=storyFindPlanet();SGx.ch=2;SFX.disc();say([['ia','Scan terminé. Le signal est une carte… il pointe vers la planète '+SGx.pl.n+'.'],['tess','Incroyable ! Il y a un objet émetteur à sa surface. Pose-toi et récupère-le, c\'est peut-être un fragment de technologie ancienne.']])}}else scanT=Math.max(0,scanT-dt)}
if(ch==2&&mode=='surf'){const I=SURF.info();if(I&&I.name==SGx.pl.n){if(!fragItem){const p=new V3(0,0,-260);p.y=Math.max(0,SURF.height(p.x,p.z))+10;const m=new THREE.Mesh(new THREE.OctahedronGeometry(5,0),new THREE.MeshStandardMaterial({color:0xc080ff,emissive:0x8030ff,emissiveIntensity:1.2,metalness:.3,roughness:.1}));m.scale.y=1.8;m.position.copy(p);m.add(sprite(0xb070ff,60,.8));SURF.scene.add(m);fragItem={m,pos:m.position};toast('Signal de l\'Écho détecté à proximité')}
fragItem.m.rotation.y+=dt;if(fragItem.pos.distanceTo(S.pos)<22){SURF.scene.remove(fragItem.m);fragItem=null;SGx.ch=3;SFX.win();boom3(S.pos,30,0xb070ff,70,true);say([['ia','Fragment récupéré. Il émet une fréquence… familière.'],['tess','Ramène-le vite à la Base Alpha, je dois l\'analyser !']])}}}
if(ch!=2&&fragItem){fragItem.m.parent&&fragItem.m.parent.remove(fragItem.m);fragItem=null}
if(mode!='surf'&&fragItem){fragItem=null}
if(ch==3&&S.docked&&S.docked.n=='Base Alpha'){SGx.ch=4;SGx.left=6;SGx.spawned=0;say([['tess','Le fragment est un morceau de carte stellaire. Il mène à quelque chose de très ancien…'],['corbeau','Charmante conversation. Ce fragment m\'appartient, pilote. Donne-le, ou je réduis ta base en poussière.'],['iris','Corbeau ! Tous les pilotes, en position ! Repousse son escadron, vite !']])}
if(ch==4&&mode=='space'&&!S.docked){const dB=S.pos.length();const alive=en.filter(e=>e.story).length;if(alive<Math.min(3,SGx.left)&&dB<3000&&SGx.left>alive){const n=Math.min(SGx.left-alive,3);for(let i=0;i<n;i++){fwd();const a=Math.random()*TAU;const e=mkEnemy(i%3==2?'lourd':'pirate',_s1.set(Math.cos(a)*700,rv(150),Math.sin(a)*700).add(S.pos),0);e.story=1;e.onKill=()=>{SGx.left--;if(SGx.left<=0)storyCh4Done()};en.push(e)}}}
if(ch==5&&S.docked&&SGx.st&&S.docked.n==SGx.st.n){if((G.cargo.elec||0)>=5){G.cargo.elec-=5;if(!G.cargo.elec)delete G.cargo.elec;SGx.ch=6;G.cr+=400;SFX.win();say([['tess','Les composants sont arrivés, merci ! Avec ça, j\'ai décodé la carte. (+400 ¢)'],['tess','L\'Écho vient de l\'épave du Kepler, un vaisseau d\'exploration disparu il y a 80 ans. Il est en zone dangereuse.'],['iris','Corbeau y sera sûrement. Équipe-toi bien avant d\'y aller : missiles, blindage… tout ce que tu peux.']])}else if(!SGx.warnT||t-SGx.warnT>20){SGx.warnT=t;toast('Il faut 5 Électronique en soute (achète-les au Marché)')}}
if(ch==6&&mode=='space'&&S.pos.distanceTo(_s1.set(WRECK.x,WRECK.y,WRECK.z))<500&&!BOSS){SGx.ch=7;say([['echo','… … Kepler … nous sommes … toujours là … ne les laissez pas …'],['corbeau','Merci de m\'avoir guidé jusqu\'ici, pilote. Le trésor du Kepler est à moi. Dis bonjour au Némésis !'],['iris','Un croiseur de combat ! Détruis d\'abord ses générateurs de bouclier, puis ses tourelles, et vise le réacteur !']],()=>spawnBoss(_s1.set(WRECK.x+900,WRECK.y+100,WRECK.z-600).clone(),{story:true}))}
if(ch==7&&!BOSS&&!DLG.open&&!SGx.won&&mode=='space'&&S.pos.distanceTo(_s1.set(WRECK.x,WRECK.y,WRECK.z))<3000)spawnBoss(_s1.set(WRECK.x+900,WRECK.y+100,WRECK.z-600).clone(),{story:true})}
function storyCh4Done(){const SGx=SG();SGx.ch=5;SGx.st=storyFindStation();G.cr+=300;say([['iris','Bien joué, pilote ! L\'escadron de Corbeau bat en retraite. (+300 ¢)'],['tess','Pour décoder le fragment, il me faut 5 unités d\'Électronique. Livre-les-moi à '+SGx.st.n+', j\'y ai mon laboratoire.'],['ia','Conseil : l\'Électronique est bon marché dans les stations High-tech. Regarde l\'onglet Marché.']])}
function storyBossDone(){const SGx=SG();SGx.ch=8;SGx.won=1;G.cr+=3000;save();say([['corbeau','Impossible… Ce n\'est pas fini, pilote… pas fini…'],['echo','… merci … la route est ouverte … au-delà de la nébuleuse … d\'autres nous attendent …'],['tess','La carte s\'est complétée ! Elle montre une route vers une région inconnue. Tu viens d\'écrire l\'histoire.'],['iris','Mission accomplie, pilote. La Base Alpha te doit beaucoup. (+3000 ¢) Fin du chapitre 1 — à suivre…']])}
// ----- croiseur Némésis -----
let BOSS=null;
function spawnBoss(pos,opts={}){if(BOSS)return;const z=Math.max(1,danger()),g=new THREE.Group();g.position.copy(pos);
const H=new THREE.MeshStandardMaterial({color:0x5a2a34,map:HULLT,metalness:DESK?.7:.3,roughness:.4}),D=new THREE.MeshStandardMaterial({color:0x22252b,metalness:.6,roughness:.5}),R=new THREE.MeshBasicMaterial({color:0xff4040});
const add=(geo,m,x,y,z2,rx=0,ry=0,rz=0,par=g)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z2);o.rotation.set(rx,ry,rz);par.add(o);return o};
add(lathe([[0,-160],[22,-130],[44,-60],[50,30],[46,110],[34,140],[0,142]],8),H,0,0,0).scale.set(1,.5,1);
add(new THREE.BoxGeometry(36,22,60),H,0,24,50);add(new THREE.BoxGeometry(18,14,20),D,0,40,62);add(new THREE.BoxGeometry(20,2,4),new THREE.MeshBasicMaterial({color:0xffb070}),0,40,51.5);
for(const s of[-1,1]){add(new THREE.BoxGeometry(70,4,40),H,s*58,0,40,0,0,s*.08);add(new THREE.BoxGeometry(6,30,24),D,s*90,6,52);for(let k=0;k<4;k++)add(new THREE.BoxGeometry(4,4,80),D,s*(20+k*7),-14,-20)}
const eng=[];for(const[x,y]of[[-24,-6],[24,-6],[-12,10],[12,10]]){add(new THREE.CylinderGeometry(9,11,22,14).rotateX(Math.PI/2),D,x,y,148);const c=add(new THREE.CircleGeometry(8,16),new THREE.MeshBasicMaterial({color:0xff7040}),x,y,159.5);const s=sprite(0xff6030,60);s.position.set(x,y,164);g.add(s);eng.push(s)}
for(let i=0;i<16;i++){const s=sprite(i%3?0xffc070:0xff3030,8);s.position.set(rv(45),rv(15)+6,rv(250));g.add(s)}
const parts=[],mk=(kind,obj,r,hp)=>{const p={kind,obj,r,hp,mhp:hp,pos:new V3(),foe:1,max:2600,cone:.32,w:.6,bossPart:1};p.hit=(d,pp)=>bossHit(p,d,pp);parts.push(p);return p};
for(const s of[-1,1]){const o=new THREE.Group();o.position.set(s*92,26,52);g.add(o);add(new THREE.CylinderGeometry(2,2,14,8),D,0,-8,0,0,0,0,o);add(new THREE.SphereGeometry(7,16,12),new THREE.MeshStandardMaterial({color:0x60c8ff,emissive:0x2080ff,emissiveIntensity:1.4}),0,0,0,0,0,0,o);o.add(sprite(0x60c0ff,40,.8));mk('gen',o,10,38*(1+z*.25))}
for(const[x,y,zz]of[[0,26,-40],[0,26,-90],[-26,-22,-10],[26,-22,-10]]){const o=new THREE.Group();o.position.set(x,y,zz);g.add(o);add(new THREE.SphereGeometry(7,14,10,0,TAU,0,Math.PI/2),D,0,0,0,y<0?Math.PI:0,0,0,o);const head=new THREE.Group();o.add(head);
add(new THREE.CylinderGeometry(1.2,1.2,16,8).rotateX(Math.PI/2),D,-2.5,y<0?-3:3,-8,0,0,0,head);add(new THREE.CylinderGeometry(1.2,1.2,16,8).rotateX(Math.PI/2),D,2.5,y<0?-3:3,-8,0,0,0,head);const pt=mk('tur',o,9,24*(1+z*.25));pt.head=head;pt.cd=1+Math.random()*2}
const coreG=new THREE.Group();coreG.position.set(0,-20,20);g.add(coreG);const core=add(new THREE.SphereGeometry(12,20,14),new THREE.MeshBasicMaterial({color:0xff3a20}),0,0,0,0,0,0,coreG);coreG.add(sprite(0xff5020,70,.9));const cp=mk('core',coreG,14,140*(1+z*.25));
const armor=[];for(let i=0;i<4;i++){const a=add(new THREE.BoxGeometry(18,4,18),D,(i%2?1:-1)*9.5,-28,20+(i<2?-9.5:9.5));armor.push(a)}
const shield=new THREE.Mesh(new THREE.SphereGeometry(1,40,24),new THREE.ShaderMaterial({uniforms:{op:{value:.6}},vertexShader:AVS,fragmentShader:'uniform float op;varying vec3 vNV;varying vec3 vN;void main(){float f=pow(1.-abs(vNV.z),2.);gl_FragColor=vec4(vec3(.3,.7,1.)*f*op,1.);}',transparent:true,blending:ADDB,depthWrite:false,side:THREE.DoubleSide}));shield.scale.set(120,70,200);g.add(shield);
scene.add(g);BOSS={g,parts,core:cp,armor,shield,eng,phase:1,C:pos.clone(),ang:0,ftT:8,brT:3,dying:0,opts,hitFl:0,z};SFX.alarm();toast('⚠ Croiseur Némésis détecté !')}
const PHN=['','Bouclier — détruis les 2 générateurs','Tourelles — détruis les 4 tourelles','Réacteur exposé — vise le cœur !'];
function bossHit(p,d,pp){const B=BOSS;if(!B||B.dying||p.dead)return;const ok=(B.phase==1&&p.kind=='gen')||(B.phase==2&&p.kind=='tur')||(B.phase==3&&p.kind=='core');
if(!ok){B.hitFl=1;SPK.emit(pp.x,pp.y,pp.z,rv(30),rv(30),rv(30),.4,.4,.8,1,.4);return}p.hp-=d;boom3(pp,8,0xffaa66,50);SFX.tick();
if(p.hp<=0){p.dead=1;boom3(p.pos,40,0xff8040,110,true);SFX.boom();p.obj.visible=false;
if(B.phase==1&&B.parts.filter(q=>q.kind=='gen'&&!q.dead).length==0){B.phase=2;B.shield.visible=false;toast('Bouclier détruit ! Vise les tourelles');SFX.win()}
else if(B.phase==2&&B.parts.filter(q=>q.kind=='tur'&&!q.dead).length==0){B.phase=3;toast('Le réacteur est exposé !');SFX.alarm();for(const a of B.armor)a.userData.fall=new V3(rv(30),-40-Math.random()*30,rv(30))}
else if(p.kind=='core'){B.dying=3.2;toast('Le Némésis se désintègre !');SFX.alarm()}}}
function bossVuln(p){const B=BOSS;return B&&((B.phase==1&&p.kind=='gen')||(B.phase==2&&p.kind=='tur')||(B.phase==3&&p.kind=='core'))}
function bossTargets(){if(!BOSS||BOSS.dying)return[];return BOSS.parts.filter(p=>!p.dead)}
function updBoss(dt){const B=BOSS;if(!B)return;if(mode!='space'){return}const g=B.g;
B.C.lerp(S.pos,dt*.04);B.ang+=dt*.045;const R=900,np=_s1.set(B.C.x+Math.cos(B.ang)*R,B.C.y+Math.sin(B.ang*.7)*120,B.C.z+Math.sin(B.ang)*R);const tan=_s2.copy(np).sub(g.position);g.position.lerp(np,Math.min(1,dt*.6));if(tan.lengthSq()>1)g.lookAt(g.position.clone().sub(tan));
for(const p of B.parts)p.obj.getWorldPosition(p.pos);B.shield.material.uniforms.op.value=.35+.35*Math.sin(t*3)+B.hitFl;B.hitFl=Math.max(0,B.hitFl-dt*3);B.eng.forEach(s=>s.scale.setScalar(55+Math.random()*12));
for(const a of B.armor)if(a.userData.fall){a.position.addScaledVector(a.userData.fall,dt);a.rotation.x+=dt*2;a.rotation.z+=dt}
// collision avec la coque
const lp=g.worldToLocal(S.pos.clone()),e=(lp.x/62)**2+(lp.y/34)**2+(lp.z/160)**2;if(e<1){lp.divideScalar(Math.sqrt(e)*.98);S.pos.copy(g.localToWorld(lp));S.spd*=.4;S.vel.multiplyScalar(-.3);damage(4)}
if(B.dying>0){B.dying-=dt;if(Math.random()<dt*7){const p=g.localToWorld(new V3(rv(40),rv(20),rv(150)));boom3(p,35,0xff8040,100,true);SFX.boom();shake=Math.min(1.4,shake+.3)}
if(B.dying<=0){for(let i=0;i<4;i++)boom3(g.localToWorld(new V3(0,0,-120+i*80)),90,0xffa050,180,true);SFX.boom();scene.remove(g);spawnDrops(g.position,10);G.kills++;const st=B.opts.story;BOSS=null;if(st)storyBossDone();else{G.cr+=1500;toast('Croiseur détruit ! +1500 ¢');SFX.win()}}return}
const d=S.pos.distanceTo(g.position);if(S.dead||S.docked)return;
for(const p of B.parts){if(p.dead||p.kind!='tur')continue;p.head.lookAt(S.pos);p.cd-=dt;if(d<1700&&p.cd<=0){p.cd=(B.phase==2?1.1:1.6)*(.8+Math.random()*.4);const tt=p.pos.distanceTo(S.pos)/430,aim=S.pos.clone().addScaledVector(S.vel,tt*.8).add(new V3(rv(1),rv(1),rv(1)).multiplyScalar(p.pos.distanceTo(S.pos)*.04)).sub(p.pos).normalize();const m=mkEB(0xff8040);m.position.copy(p.pos);EB.push({m,v:aim.multiplyScalar(430),l:4,dmg:8});SFX.eshoot()}}
if(B.phase>=2){B.ftT-=dt;if(B.ftT<=0){B.ftT=12;if(en.filter(e=>e.fromBoss).length<4)for(let i=0;i<2;i++){const e=mkEnemy('chasseur',g.localToWorld(new V3(i?40:-40,-10,60)),B.z);e.fromBoss=1;en.push(e)}}}
if(B.phase==3){B.brT-=dt;if(B.brT<=0){B.brT=2.6;const o=B.core.pos;const ax=new V3(rv(1),rv(1),rv(1)).normalize(),b1=new V3().crossVectors(ax,AY).normalize(),b2=new V3().crossVectors(ax,b1);for(let i=0;i<16;i++){const a=i/16*TAU,v=b1.clone().multiplyScalar(Math.cos(a)).addScaledVector(b2,Math.sin(a)).addScaledVector(_s1.copy(S.pos).sub(o).normalize(),.6).normalize();const m=mkEB(0xff4060);m.position.copy(o);EB.push({m,v:v.multiplyScalar(320),l:5,dmg:7})}SFX.eshoot()}}}
function bossBar(){const B=BOSS;if(!B||mode!='space'){setD('bossbar','none');return}setD('bossbar','block');const cur=B.dying?[]:B.parts.filter(p=>p.kind==(B.phase==1?'gen':B.phase==2?'tur':'core'));const hp=cur.reduce((a,p)=>a+Math.max(0,p.hp),0),mh=cur.reduce((a,p)=>a+p.mhp,0)||1;
setH('bossN',`☠ CROISEUR NÉMÉSIS — ${B.dying?'Destruction imminente !':'Phase '+B.phase+' : '+PHN[B.phase]}`);setW('bossB',B.dying?0:hp/mh)}
// ----- événements aléatoires -----
let EV=null,evT=45;const EVN={meteor:'Pluie de météores',hole:'Trou noir',wreck:'Épave à fouiller',convoy:'Convoi attaqué',cruiser:'Croiseur pirate'};
const DISK_FS=`uniform float tm;varying vec2 vUv;void main(){vec2 p=vUv-.5;float r=length(p)*2.,a=atan(p.y,p.x);float sw=sin(a*5.+tm*2.5-r*14.)*.5+.5;float I=smoothstep(1.,.45,r)*smoothstep(.22,.34,r);vec3 c=mix(vec3(1.,.38,.08),vec3(1.,.88,.65),sw*smoothstep(.9,.3,r));gl_FragColor=vec4(c*I*(.45+sw*.35),1.);}`;
function startEvent(){const z=danger(),r=Math.random();let ty=r<.3?'meteor':r<.48?'hole':r<.72?'wreck':r<.94?'convoy':'cruiser';if(ty=='cruiser'&&(z<2||BOSS))ty='convoy';fwd();
const side=_s1.set(1,0,0).applyQuaternion(S.q),base=S.pos.clone().addScaledVector(_f,1500).addScaledVector(side,rv(700));base.y=S.pos.y+rv(200);EV={ty,t:0,pos:base,objs:[]};toast('⚠ Événement : '+EVN[ty]);SFX.alarm();
if(ty=='meteor'){EV.dur=26;EV.pos=S.pos.clone();EV.mt=0;EV.met=[]}
else if(ty=='hole'){EV.dur=100;const g=new THREE.Group();g.position.copy(base);const bh=new THREE.Mesh(new THREE.SphereGeometry(70,32,20),new THREE.MeshBasicMaterial({color:0x000000}));g.add(bh);const disk=new THREE.Mesh(new THREE.PlaneGeometry(700,700),new THREE.ShaderMaterial({uniforms:{tm:TM},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:DISK_FS,transparent:true,blending:ADDB,depthWrite:false,side:THREE.DoubleSide}));disk.rotation.x=-1.2;g.add(disk);
const halo=sprite(0xff9040,330,.22);g.add(halo);scene.add(g);EV.g=g;EV.near=0}
else if(ty=='wreck'){EV.dur=150;const g=new THREE.Group();g.position.copy(base);const M=new THREE.MeshStandardMaterial({color:0x6a6660,map:HULLT,metalness:.6,roughness:.6});g.add(new THREE.Mesh(lathe([[0,-30],[8,-22],[11,0],[10,20],[0,24]],8),M));for(let i=0;i<7;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(2+Math.random()*6,1,3+Math.random()*8),M);b.position.set(rv(30),rv(14),rv(40));b.rotation.set(rv(3),rv(3),rv(3));g.add(b)}
const l=sprite(0x80ff90,26);l.position.y=14;g.add(l);EV.blink=l;g.rotation.set(rv(1),rv(3),rv(1));scene.add(g);EV.g=g;EV.scan=0}
else if(ty=='convoy'){EV.dur=150;EV.fr=[];const dir=side.clone().negate();for(let i=0;i<3;i++){const g=mkFreighter();g.position.copy(base).addScaledVector(side,(i-1)*60).addScaledVector(_f,i*40);g.lookAt(g.position.clone().sub(dir));scene.add(g);EV.fr.push({g,hp:100,dir})}
EV.pir=4;for(let i=0;i<4;i++){const e=mkEnemy(i==3&&z>=1?'lourd':'pirate',base.clone().add(new V3(rv(250),rv(80),rv(250))),z);e.convoy=1;e.onKill=()=>{if(EV&&EV.ty=='convoy')EV.pir--};en.push(e)}}
else if(ty=='cruiser'){EV.dur=400;spawnBoss(base.clone().addScaledVector(_f,800),{});EV.pos=null}}
function mkFreighter(){const g=new THREE.Group(),M=new THREE.MeshStandardMaterial({color:0xb8b2a0,map:HULLT,metalness:.5,roughness:.5});g.add(new THREE.Mesh(new THREE.BoxGeometry(10,8,46),M));const cab=new THREE.Mesh(new THREE.BoxGeometry(8,6,8),M);cab.position.set(0,5,-22);g.add(cab);
const cols=[0xc04030,0x3070c0,0xd0a030,0x40a060];for(let k=0;k<4;k++){const c=new THREE.Mesh(new THREE.BoxGeometry(12,9,8),new THREE.MeshStandardMaterial({color:cols[(k+g.id)%4],roughness:.6,metalness:.2}));c.position.set(0,0,-10+k*9.5);g.add(c)}
const s=sprite(0x80b0ff,18);s.position.z=26;g.add(s);return g}
function endEvent(win){if(!EV)return;if(EV.g)scene.remove(EV.g);if(EV.met)for(const m of EV.met)m.m.parent&&m.m.parent.remove(m.m);if(EV.fr)for(const f of EV.fr)scene.remove(f.g);EV=null;evT=70+Math.random()*60}
function evTargets(){if(!EV||!EV.met)return[];return EV.met.filter(m=>!m.gone)}
function updEvents(dt){if(mode!='space'||S.dead)return;if(!EV){if(S.docked||BOSS||DLG.open)return;let nearSt=false;for(const st of stations)if(S.pos.distanceTo(_s1.set(st.x,st.y,st.z))<1500)nearSt=true;evT-=dt;if(evT<=0&&!nearSt)startEvent();return}
EV.t+=dt;const E=EV;
if(E.ty=='meteor'){E.mt-=dt;if(E.t<E.dur&&E.mt<=0){E.mt=.14;fwd();const side=_s1.set(1,0,0).applyQuaternion(S.q),sgn=Math.random()<.5?-1:1,p=S.pos.clone().addScaledVector(_f,300+Math.random()*700).addScaledVector(side,sgn*(500+Math.random()*300)).add(new V3(0,rv(250),0));
const v=side.clone().multiplyScalar(-sgn*(260+Math.random()*200)).add(new V3(rv(40),rv(40),rv(40)));const r=3+Math.random()*7;const m=new THREE.Mesh(AGEO[Math.random()*8|0],AMAT[Math.random()*4|0]);m.scale.setScalar(r);m.position.copy(p);m.add(sprite(0xff7a30,6,.9));scene.add(m);
const M={m,pos:m.position,v,r,l:7,hp:1,max:900,cone:.2,w:1};M.hit=(d,pp)=>{M.gone=1;boom3(M.pos,14,0xff8040,60,true);spawnDrops(M.pos,1);M.l=0};E.met.push(M)}
for(const M of E.met){M.l-=dt;M.pos.addScaledVector(M.v,dt);M.m.rotation.x+=dt*2;if(Math.random()<.9)FIRE.emit(M.pos.x,M.pos.y,M.pos.z,-M.v.x*.15+rv(6),-M.v.y*.15+rv(6),-M.v.z*.15+rv(6),.5,1,.5,.15,.5);if(!M.gone&&M.pos.distanceTo(S.pos)<M.r+6){M.gone=1;damage(10);boom3(M.pos,18,0xff8040,60,true);M.l=0}if(M.l<=0){M.m.parent&&M.m.parent.remove(M.m)}}E.met=E.met.filter(M=>M.l>0);
if(E.t>=E.dur&&!E.met.length){G.cr+=150;toast('Pluie de météores traversée ! +150 ¢');endEvent(1)}}
else if(E.ty=='hole'){const c=E.g.position,d=S.pos.distanceTo(c);E.g.children[1].rotation.z+=dt*.3;if(d<1100&&!S.docked){const k=Math.pow(1-d/1100,2)*320;S.vel.addScaledVector(_s1.copy(c).sub(S.pos).normalize(),k*dt);S.pos.addScaledVector(_s1.copy(c).sub(S.pos).normalize(),k*dt*.6);shake=Math.max(shake,(1-d/1100)*.5)}
if(d<110)damage(35*dt);if(d<450)E.near+=dt;if(E.near>3&&!E.got&&d>1200){E.got=1;G.cr+=450;toast('Données gravitationnelles revendues : +450 ¢');SFX.win()}if(E.t>E.dur||d>5000)endEvent(1)}
else if(E.ty=='wreck'){E.blink.visible=Math.sin(t*6)>0;E.g.rotation.y+=dt*.05;const d=S.pos.distanceTo(E.g.position);if(d<110){E.scan+=dt;if(E.scan>3){const cr=100+Math.random()*250|0;G.cr+=cr;let got='+'+cr+' ¢';const g=GOODS[Math.random()*GOODS.length|0],q=Math.min(2+Math.random()*5|0,cap()-cargoUsed());if(q>0){G.cargo[g.id]=(G.cargo[g.id]||0)+q;got+=' · '+q+' '+g.n}if(Math.random()<.5){const am=Math.random()<.5?'missile':'mine';G.ammo[am]+=am=='missile'?4:2;got+=' · munitions'}toast('Épave fouillée : '+got);SFX.win();endEvent(1)}}else E.scan=Math.max(0,E.scan-dt);if(E.t>E.dur||d>5000)endEvent(0)}
else if(E.ty=='convoy'){for(const f of E.fr){if(f.dead)continue;f.g.position.addScaledVector(f.dir,32*dt);if(E.pir>0){f.hp-=E.pir*1.1*dt;if(Math.random()<dt*E.pir*.6)boom3(f.g.position.clone().add(new V3(rv(8),rv(6),rv(20))),8,0xff8040,40)}if(f.hp<=0){f.dead=1;boom3(f.g.position,60,0xffa040,140,true);SFX.boom();scene.remove(f.g)}}
const alive=E.fr.filter(f=>!f.dead).length;E.pos=alive?E.fr.find(f=>!f.dead).g.position:null;
if(!alive&&!E.over){E.over=1;toast('Le convoi a été détruit…');endEvent(0);return}if(E.pir<=0&&!E.over){E.over=1;const rw=150+alive*150;G.cr+=rw;let txt='Convoi sauvé ! +'+rw+' ¢';const q=Math.min(alive*3,cap()-cargoUsed());if(q>0){const g=GOODS[Math.random()*GOODS.length|0];G.cargo[g.id]=(G.cargo[g.id]||0)+q;txt+=' · '+q+' '+g.n}toast(txt);SFX.win();E.dur=E.t+25}if(E.t>E.dur)endEvent(1)}
else if(E.ty=='cruiser'){if(!BOSS)endEvent(1)}}
// ----- musique dynamique -----
const MUS={on:false,I:0,tg:0,step:0,next:0,bus:null};
function musInit(){if(MUS.on||!AC)return;MUS.on=true;MUS.bus=AC.createGain();MUS.bus.gain.value=0;MUS.bus.connect(master);MUS.next=AC.currentTime+.1;setInterval(musTick,25)}
function nz(time,dur,vol,hp,lp){const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=noiseBuf;f.type=hp?'highpass':'lowpass';f.frequency.value=hp||lp;g.gain.setValueAtTime(vol,time);g.gain.exponentialRampToValueAtTime(.001,time+dur);s.connect(f);f.connect(g);g.connect(MUS.bus);s.start(time,Math.random());s.stop(time+dur+.02)}
function osc(time,f1,f2,dur,type,vol,lp){const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f1,time);if(f2!=f1)o.frequency.exponentialRampToValueAtTime(f2,time+dur);g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(vol,time+.005);g.gain.exponentialRampToValueAtTime(.001,time+dur);let n=o;if(lp){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;o.connect(f);n=f}n.connect(g);g.connect(MUS.bus);o.start(time);o.stop(time+dur+.02)}
const ROOT=[110,87.3,130.8,98],CH=[[220,261.6,329.6],[174.6,220,261.6],[261.6,329.6,392],[196,246.9,293.7]];
function musTick(){if(!AC||AC.state!='running')return;MUS.I+=(MUS.tg-MUS.I)*.04;MUS.bus.gain.setTargetAtTime(muted?0:MUS.I*.55,AC.currentTime,.3);if(MUS.I<.02){MUS.next=AC.currentTime+.05;return}
const spb=60/128/4;while(MUS.next<AC.currentTime+.12){const st=MUS.step%16,bar=Math.floor(MUS.step/16)%4,tm=MUS.next,I=MUS.I;
if(st%4==0)osc(tm,140,45,.28,'sine',.5);if(st==4||st==12)nz(tm,.16,.28,1200);if(st%2==1&&I>.35)nz(tm,.04,.12,7000);
if(st%2==0){const n=[0,0,12,0,7,0,12,10][st/2%8];osc(tm,ROOT[bar]*Math.pow(2,n/12),ROOT[bar]*Math.pow(2,n/12),.22,'sawtooth',.16,700+I*900)}
if(I>.6){const c=CH[bar],n=c[st%3]*(st%8<4?2:4);osc(tm,n,n,.16,'triangle',.05)}
if(I>.9&&st%8==0){for(const f of CH[bar])osc(tm,f,f,.5,'square',.035,1600)}
MUS.step++;MUS.next+=spb}}
function updMusic(){musInit();let tg=0;if(mode=='space'||mode=='surf'){for(const e of en)if(e.pos.distanceTo(S.pos)<1500){tg=.7;break}if(mode=='surf'&&SURF.info()&&SURF.info().tur.some(T=>T.pos.distanceTo(S.pos)<500))tg=Math.max(tg,.5)}if(BOSS&&mode=='space')tg=1;if(EV&&EV.ty=='meteor')tg=Math.max(tg,.5);if(S.dead)tg=0;MUS.tg=tg}
// ----- carte de la galaxie -----
const MAP={open:false,zoom:.02,cx:0,cz:0,sel:null,drag:null,items:[]};const MC=$('mapc'),MX=MC.getContext('2d');
function openMap(){if(MAP.open){closeMap();return}MAP.open=true;MAP.cx=S.pos.x;MAP.cz=S.pos.z;MAP.sel=null;$('map').style.display='block';sizeMap();drawMap();SFX.tick()}
function closeMap(){MAP.open=false;$('map').style.display='none'}
function sizeMap(){const d=Math.min(devicePixelRatio||1,2);MC.width=innerWidth*d;MC.height=innerHeight*d;MX.setTransform(d,0,0,d,0,0)}
const w2s=(x,z)=>[innerWidth/2+(x-MAP.cx)*MAP.zoom,innerHeight/2+(z-MAP.cz)*MAP.zoom];
function mapItems(){const it=[{k:'base',n:'Base Alpha',x:0,y:0,z:0,c:'#ffc845'}];for(const s of G.vst||[])if(s.n!='Base Alpha')it.push({k:'st',n:s.n,x:s.x,y:s.y,z:s.z,c:'#ffc845'});
for(const n in G.dpos||{}){const p=G.dpos[n];it.push({k:'pl',n,x:p[0],y:p[1],z:p[2],hue:p[3],ring:p[4],r:p[5]||400,c:`hsl(${p[3]},60%,62%)`})}
for(const c of CDATA.values())if(c.sun)it.push({k:'sun',n:c.sun.name[0].toUpperCase()+c.sun.name.slice(1),x:c.sun.x,y:c.sun.y,z:c.sun.z,c:'#ffd27a'});const tg=storyTarget();if(tg)it.push({k:'story',n:'Objectif : '+CHAPTERS[SG().ch].txt(),x:tg.x,y:tg.y,z:tg.z,c:'#c890ff'});
for(const o of MP.others.values()){const L=o.buf[o.buf.length-1];if(L&&o.m=='space')it.push({k:'ply',n:'Pilote : '+mpName(o),x:L.p.x,y:L.p.y,z:L.p.z,c:`hsl(${o.hue},85%,65%)`})}
if(G.m&&G.m.tg)it.push({k:'mis',n:'Mission : '+G.m.txt,x:G.m.tg.x,y:G.m.tg.y,z:G.m.tg.z,c:'#4dff8a'});if(EV&&EV.pos)it.push({k:'ev',n:'Événement : '+EVN[EV.ty],x:EV.pos.x,y:EV.pos.y,z:EV.pos.z,c:'#ff9a40'});return MAP.items=it}
function drawMap(){const W=innerWidth,H=innerHeight;MX.fillStyle='#03060f';MX.fillRect(0,0,W,H);const it=mapItems();
MX.strokeStyle='rgba(90,150,220,.08)';MX.lineWidth=1;const step=Math.pow(10,Math.ceil(Math.log10(80/MAP.zoom)));for(let x=Math.floor((MAP.cx-W/2/MAP.zoom)/step)*step;x<MAP.cx+W/2/MAP.zoom;x+=step){const[sx]=w2s(x,0);MX.beginPath();MX.moveTo(sx,0);MX.lineTo(sx,H);MX.stroke()}for(let z=Math.floor((MAP.cz-H/2/MAP.zoom)/step)*step;z<MAP.cz+H/2/MAP.zoom;z+=step){const[,sy]=w2s(0,z);MX.beginPath();MX.moveTo(0,sy);MX.lineTo(W,sy);MX.stroke()}
const[ox,oy]=w2s(0,0);for(let i=1;i<=4;i++){MX.strokeStyle=ZC[i]+'55';MX.setLineDash([6,8]);MX.beginPath();MX.arc(ox,oy,i*9000*MAP.zoom,0,TAU);MX.stroke();MX.setLineDash([]);MX.fillStyle=ZC[i]+'aa';MX.font='600 10px system-ui';MX.textAlign='center';MX.fillText(ZN[i],ox,oy-i*9000*MAP.zoom-4)}
for(const o of it){const[x,y]=w2s(o.x,o.z);if(x<-40||y<-40||x>W+40||y>H+40)continue;MX.fillStyle=o.c;MX.strokeStyle=o.c;
if(o.k=='sun'){const g=MX.createRadialGradient(x,y,0,x,y,14);g.addColorStop(0,'#fff8e0');g.addColorStop(.4,o.c);g.addColorStop(1,'rgba(255,200,100,0)');MX.fillStyle=g;MX.beginPath();MX.arc(x,y,14,0,TAU);MX.fill()}
else if(o.k=='pl'){const r=Math.max(4,o.r*MAP.zoom);MX.beginPath();MX.arc(x,y,r,0,TAU);MX.fill();if(o.ring){MX.lineWidth=1.5;MX.beginPath();MX.ellipse(x,y,r*1.9,r*.6,-.3,0,TAU);MX.stroke()}}
else if(o.k=='base'||o.k=='st'){MX.save();MX.translate(x,y);MX.rotate(.785);MX.fillRect(-5,-5,10,10);MX.restore()}
else{MX.lineWidth=2;MX.beginPath();MX.arc(x,y,9+Math.sin(t*4)*2,0,TAU);MX.stroke();MX.font='700 13px system-ui';MX.textAlign='center';MX.fillText(o.k=='story'?'★':o.k=='ev'?'⚠':o.k=='ply'?'👤':'🎯',x,y+5)}
if(MAP.zoom>.012||o.k=='base'||o===MAP.sel){MX.fillStyle='rgba(220,235,255,.85)';MX.font='600 11px system-ui';MX.textAlign='center';MX.fillText(o.k=='story'||o.k=='mis'||o.k=='ev'?'':o.n,x,y-12)}
if(o===MAP.sel){MX.strokeStyle='#fff';MX.lineWidth=1.5;MX.beginPath();MX.arc(x,y,16,0,TAU);MX.stroke()}}
const[px,py]=w2s(S.pos.x,S.pos.z);fwd();const a=Math.atan2(_f.z,_f.x);MX.save();MX.translate(px,py);MX.rotate(a);MX.fillStyle='#fff';MX.shadowColor='#6cf';MX.shadowBlur=10;MX.beginPath();MX.moveTo(10,0);MX.lineTo(-6,-6);MX.lineTo(-3,0);MX.lineTo(-6,6);MX.fill();MX.restore();
const sc=Math.pow(10,Math.floor(Math.log10(150/MAP.zoom))),sl=sc*MAP.zoom;MX.strokeStyle='#9cf';MX.lineWidth=2;MX.beginPath();MX.moveTo(20,H-30);MX.lineTo(20+sl,H-30);MX.stroke();MX.fillStyle='#9cf';MX.font='11px system-ui';MX.textAlign='left';MX.fillText(sc>=1000?sc/1000+' km':sc+' m',20,H-38);
const S2=MAP.sel;let info='<b>Carte de la galaxie</b><br><small>Glisse pour déplacer · '+(DESK?'molette':'boutons')+' pour zoomer · touche un lieu</small>';
if(S2){const d=Math.round(Math.hypot(S2.x-S.pos.x,S2.y-S.pos.y,S2.z-S.pos.z));info=`<b style="color:${S2.c}">${S2.n}</b><br><small>${d>=1000?(d/1000).toFixed(1)+' km':d+' m'}</small>`;const can=S2.k=='base'||S2.k=='st'||S2.k=='pl'||S2.k=='ply';if(can){const cost=travelCost(S2),why=travelBlock();info+=why?`<br><small style="color:#f99">${why}</small>`:`<br><button id="ftb">⚡ Voyage rapide · ${cost} ¢</button>`}}
if(HC.mapI!==info){HC.mapI=info;$('mapinfo').innerHTML=info;const b=$('ftb');if(b)b.onclick=()=>fastTravel(MAP.sel)}}
const travelCost=o=>Math.max(20,Math.round(Math.hypot(o.x-S.pos.x,o.z-S.pos.z)/110));
function travelBlock(){if(mode!='space')return'Impossible depuis la surface';if(S.entry||S.dead)return'Impossible maintenant';if(BOSS)return'Impossible pendant un combat contre un croiseur';if(en.some(e=>e.pos.distanceTo(S.pos)<1500))return'Des ennemis sont trop proches';if(MAP.sel&&G.cr<travelCost(MAP.sel))return'Pas assez de crédits';return''}
function fastTravel(o){const why=travelBlock();if(why){toast(why);return}const cost=travelCost(o);G.cr-=cost;closeMap();if(S.docked)undock();FADE.col='10,16,40';FADE.tg=1;FADE.sp=3;
setTimeout(()=>{const off=o.k=='pl'?(o.r||400)*1.6+300:420,dir=_s1.set(S.pos.x-o.x,0,S.pos.z-o.z);if(dir.lengthSq()<1)dir.set(1,0,0);dir.normalize();S.pos.set(o.x,o.y,o.z).addScaledVector(dir,off);S.q.setFromUnitVectors(new V3(0,0,-1),_s2.set(o.x,o.y,o.z).sub(S.pos).normalize());S.vel.set(0,0,0);S.spd=40;S.mustLeave=null;
for(const e of en)e.mesh.parent&&e.mesh.parent.remove(e.mesh);en.length=0;for(const b of EB)b.m.parent&&b.m.parent.remove(b.m);EB.length=0;clearWeapons();if(EV)endEvent(0);lastCK='';streamWorld();camInit=true;G.time+=Math.hypot(o.x,o.z)/50;FADE.tg=0;FADE.sp=1.2;toast('Arrivée : '+o.n);save()},420)}
MC.addEventListener('pointerdown',e=>{MAP.drag={x:e.clientX,y:e.clientY,cx:MAP.cx,cz:MAP.cz,moved:0};MC.setPointerCapture(e.pointerId)});
MC.addEventListener('pointermove',e=>{if(!MAP.drag)return;const dx=e.clientX-MAP.drag.x,dy=e.clientY-MAP.drag.y;if(Math.abs(dx)+Math.abs(dy)>5)MAP.drag.moved=1;MAP.cx=MAP.drag.cx-dx/MAP.zoom;MAP.cz=MAP.drag.cz-dy/MAP.zoom;drawMap()});
MC.addEventListener('pointerup',e=>{const D2=MAP.drag;MAP.drag=null;if(D2&&!D2.moved){let best=null,bd=22;for(const o of MAP.items){const[x,y]=w2s(o.x,o.z),d=Math.hypot(x-e.clientX,y-e.clientY);if(d<bd){bd=d;best=o}}MAP.sel=best;drawMap()}});
MC.addEventListener('wheel',e=>{e.preventDefault();mapZoom(e.deltaY<0?1.25:.8)},{passive:false});
function mapZoom(k){MAP.zoom=clamp(MAP.zoom*k,.0015,.6);drawMap()}
$('mapb').onclick=openMap;$('mapx').onclick=closeMap;$('mapzi').onclick=()=>mapZoom(1.4);$('mapzo').onclick=()=>mapZoom(.7);$('mapme').onclick=()=>{MAP.cx=S.pos.x;MAP.cz=S.pos.z;drawMap()};
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT')return;if(e.code=='KeyC'&&!e.repeat)openMap();if(e.code=='Escape'&&MAP.open)closeMap()});addEventListener('resize',()=>{if(MAP.open){sizeMap();drawMap()}});
// ----- intégration -----
function storyTarget(){const s=SG();if(!s||!CHAPTERS[s.ch])return null;return CHAPTERS[s.ch].tg()}
const isPaused=()=>DLG.open||MAP.open;
function updContent(dt){G.time=(G.time||0)+dt;storyTick(dt);updEvents(dt);updBoss(dt)}
function updContentAlways(dt){updDlg(dt);updMusic();bossBar();if(MAP.open&&Math.random()<.2)drawMap();updShop();setH('wpn',wpnHUD());setD('wbtn',G.w.length>1&&!DESK?'block':'none');if(G.w.length>1)setH('wbtn',WPN[curW()].ic)}
function contentInfo(){let s='';const c=SG()&&SG().ch<8&&CHAPTERS[SG().ch];if(c)s+=`<span style="color:#c9f">★ ${c.txt()}</span>`;if(SG()&&SG().ch==1&&scanT>0)s+=` <b style="color:#c9f">scan ${Math.min(100,scanT/3*100|0)}%</b>`;
if(EV){s+=(s?'<br>':'')+`<span style="color:#ff9a40">⚠ ${EVN[EV.ty]}${EV.ty=='convoy'?` — protège le convoi (${EV.pir>0?EV.pir+' pirates':'sauvé'})`:EV.ty=='wreck'?(EV.scan>0?` — fouille ${Math.min(100,EV.scan/3*100|0)}%`:' — approche-toi pour fouiller'):EV.ty=='hole'?' — approche-toi sans te faire aspirer':''}</span>`}return s}
function contentOverlay(){if(S.dead||mode=='surf'&&!(SG()&&SG().ch==2))return;const tg=storyTarget();if(tg&&!(SG().ch==7))edgeMarker(tg,'#c890ff','','★');if(EV&&EV.pos&&EV.ty!='meteor')edgeMarker(EV.pos,'#ff9a40','','⚠');if(mode=='surf'&&fragItem)edgeMarker(fragItem.pos,'#c890ff','Fragment','★')}
function spaceTargets(){const A=asts.map(a=>{a.max=1300;a.cone=.16;a.w=1;a.hit=a.hit||((d,p)=>{a.hp-=d;boom3(p,5,0xdddddd,35);SFX.tick();if(a.hp<=0&&!a.gone){a.gone=1;boom3(a.pos,20,0xbbbbbb,70,true);SFX.rock();spawnDrops(a.pos,(1+(a.r/14|0))+(a.ore?2:0));killAst(a)}});return a});return[...en,...bossTargets(),...evTargets(),...mpTargets(),...A]}
