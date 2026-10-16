// ===== ACTE II « La Porte des Anciens » (saga.js, après vxast.js) — état A2, sauvegarde G.x.a2 =====
// Suite de la campagne « L'Écho de Kepler » (story.js, qui finit au chapitre 8). 7 chapitres, 3 choix qui changent la suite
// (c1 : sort de Corbeau, c2 : à qui confier le cœur du Kepler, c3 : sort de la Porte) et 3 fins (titre + peinture unique).
// Objectif affiché en orange ✦ (l'acte I est en violet ★). Service de station « Campagne » : état, choix, fins trouvées, rejouer.
const A2={t:0,wait:0,scan:0,cor:null,sh:null,al:[],relay:null,porte:null,pmat:null,boss:0,end:0};
CHAR.kessler={n:'Amiral Varek Kessler',ic:'🎖️',c:'#ffb84d'};CHAR.xil={n:'Voix des Xil',ic:'👁️',c:'#6dff8a'};
PARTS.paint.o.a2garde={n:'Gardien de la Porte',p:0,uniq:1,d:'Fin de l\'acte II : la Porte refermée. Bleu nuit, argent et halo azur.',c:[0x24304a,0xd8e2ff,0x7fb0ff]};
PARTS.paint.o.a2xil={n:'Ambassadeur Xil',p:0,uniq:1,d:'Fin de l\'acte II : la paix avec les Xil. Vert profond et lueur bioluminescente.',c:[0x0f2a22,0x6dff8a,0xc0ffd8]};
PARTS.paint.o.a2tyran={n:'Tyran des étoiles',p:0,uniq:1,d:'Fin de l\'acte II : le pouvoir de la Porte. Noir, rouge sang et or.',c:[0x1a0a0e,0xff2a3a,0xffb020]};
const a2S=()=>GX('a2',{ch:0,ends:[]});
// emplacements fixes, écartés des étoiles, planètes et stations
function a2Safe(x,y,z){const p=new V3(x,y,z);for(let k=0;k<12;k++){let bad=false;const cx=cof(p.x),cy=cof(p.y),cz=cof(p.z);
  for(let i=-1;i<=1&&!bad;i++)for(let j=-1;j<=1&&!bad;j++)for(let l=-1;l<=1&&!bad;l++){const c=cdata(cx+i,cy+j,cz+l);
   if(c.sun&&p.distanceTo(_s1.set(c.sun.x,c.sun.y,c.sun.z))<(c.sun.r||600)*4+2500)bad=true;if(c.pl&&p.distanceTo(_s1.set(c.pl.x,c.pl.y,c.pl.z))<c.pl.r*2+1800)bad=true;if(c.st&&p.distanceTo(_s1.set(c.st.x,c.st.y,c.st.z))<2500)bad=true}
  if(!bad)break;p.x+=2600;p.z-=1300}return p}
const A2P={};function a2Pos(k){if(!A2P[k])A2P[k]=k=='relay'?a2Safe(-9000,600,11000):k=='cor'?a2Safe(21000,200,9000):a2Safe(30000,0,-24000);return A2P[k]}
const A2CH={1:'Le relais du Kepler',2:'L\'appel de Corbeau',3:'Le cœur du Kepler',4:'La clé de phase',5:'L\'Amiral',6:'La Porte des Anciens',7:'Le choix',8:'Épilogue'};
function a2Txt(){const s=a2S(),ch=s.ch;
 if(ch==1)return s.sub=='amb'?`Repousse l'embuscade Xil (${s.left} restants)`:'Rejoins le relais du Kepler et scanne-le';
 if(ch==2)return s.sub=='fight'?(s.c1=='save'?'Sauve Corbeau : abats les Xil':'Neutralise les Xil, Corbeau sera arrêté')+` (${s.left} restants)`:s.sub=='leave'?'Les Xil s\'occupent de Corbeau…':'Réponds au signal de détresse de Corbeau';
 if(ch==3)return s.prog>0?`Extraction du cœur du Kepler : ${Math.floor(s.prog*100)} % (reste à moins de 450 m)`:'Va à l\'épave du Kepler et extrais son cœur';
 if(ch==4)return`Livre 8 cristal et 4 titane à la Base Alpha (${Math.min(8,G.cargo.cristal||0)}/8, ${Math.min(4,G.cargo.titane||0)}/4)`;
 if(ch==5)return s.sub=='esc'?`Escorte la navette de Tess jusqu'à ${s.st.n}`:'Quitte la Base Alpha : la navette de Tess t\'attend';
 if(ch==6)return s.sub=='fight'?'Détruis le croiseur de Kessler':'Atteins la Porte des Anciens';
 if(ch==7)return'Décide du sort de la Porte';return''}
function a2Tg(){const s=a2S();if(s.ch==1)return a2Pos('relay');if(s.ch==2)return a2Pos('cor');if(s.ch==3)return WRECK;if(s.ch==4)return{x:0,y:0,z:0};
 if(s.ch==5)return s.sub=='esc'&&A2.sh&&!A2.sh.gone?A2.sh.pos:s.sub=='esc'?s.st:{x:0,y:0,z:0};if(s.ch==6||s.ch==7)return BOSS&&A2.boss?BOSS.g.position:a2Pos('porte');return null}
// ----- décors -----
function a2Relay(){const g=new THREE.Group(),M=new THREE.MeshStandardMaterial({color:0x8a8680,map:HULLT,metalness:.6,roughness:.45}),D=new THREE.MeshStandardMaterial({color:0x2a2d33,metalness:.6,roughness:.5}),
  W=new THREE.MeshStandardMaterial({color:0xd8d6d0,metalness:.35,roughness:.35,side:THREE.DoubleSide}),PV=new THREE.MeshStandardMaterial({color:0x1a2a4a,metalness:.7,roughness:.25,emissive:0x0a1430,side:THREE.DoubleSide});
 // paraboles : profil y = x²/(4f), ouvertes vers +z
 const prof=[];for(let i=0;i<=10;i++){const x=i/10*20;prof.push(new THREE.Vector2(x,x*x/48))}const dishG=new THREE.LatheGeometry(prof,28);dishG.rotateX(Math.PI/2);
 const dish=(r,x,y,z,ax,ay)=>{const d=new THREE.Group();d.position.set(x,y,z);const sc=r/20;const m=new THREE.Mesh(dishG,W);m.scale.setScalar(sc);d.add(m);
  for(let k=0;k<3;k++){const a=k*TAU/3,st=new THREE.Mesh(new THREE.CylinderGeometry(.35*sc,.35*sc,13*sc,5),D);st.position.set(Math.cos(a)*8*sc,Math.sin(a)*8*sc,9*sc);st.lookAt(0,0,12*sc*1.5);st.rotateX(Math.PI/2);d.add(st)}
  const h=new THREE.Mesh(new THREE.CylinderGeometry(1.2*sc,.8*sc,4*sc,8),D);h.rotation.x=Math.PI/2;h.position.z=12*sc;d.add(h);const arm=new THREE.Mesh(new THREE.CylinderGeometry(1.4*sc,1.4*sc,10*sc,8),M);arm.rotation.x=Math.PI/2;arm.position.z=-5*sc;d.add(arm);
  d.rotation.set(ax,ay,0);g.add(d);return d};
 // mât en treillis
 g.add(new THREE.Mesh(new THREE.CylinderGeometry(3,4.5,130,8),M));for(let i=0;i<5;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(6,.8,6,16),D);r.rotation.x=Math.PI/2;r.position.y=-50+i*25;g.add(r)}
 const hub=new THREE.Mesh(new THREE.BoxGeometry(18,14,18),M);hub.position.y=30;g.add(hub);
 dish(26,0,52,0,-.5,0);dish(15,14,30,6,-.2,1.2);dish(15,-14,30,6,-.2,-1.2);dish(10,0,8,-12,.3,Math.PI);
 // panneaux solaires
 for(const sx of[-1,1]){const bm=new THREE.Mesh(new THREE.BoxGeometry(40,1.5,1.5),D);bm.position.set(sx*28,-20,0);g.add(bm);for(let k=0;k<3;k++){const pnl=new THREE.Mesh(new THREE.BoxGeometry(11,.5,24),PV);pnl.position.set(sx*(16+k*12.5),-20,0);pnl.rotation.x=.4;g.add(pnl)}}
 // module d'habitation abîmé + débris
 const hab=new THREE.Mesh(new THREE.CylinderGeometry(9,9,26,12),M);hab.rotation.z=Math.PI/2;hab.position.y=-62;g.add(hab);for(let i=0;i<5;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(2+Math.random()*6,1+Math.random()*3,3+Math.random()*8),i%2?M:D);b.position.set(rv(70),-40+rv(50),rv(70));b.rotation.set(rv(3),rv(3),rv(3));g.add(b)}
 const L=sprite(0xffa040,40,.9);L.position.y=68;g.add(L);g.userData.L=L;for(const[x,y]of[[-56,-20],[56,-20],[0,-75]]){const s=sprite(0xff4030,10,.8);s.position.set(x,y,0);g.add(s)}
 const p=a2Pos('relay');g.position.copy(p);g.rotation.z=.18;scene.add(g);return g}
const A2PFS=`uniform float tm,k;uniform vec3 col;varying vec2 vUv;void main(){vec2 q=vUv*2.-1.;float r=length(q),a=atan(q.y,q.x);float s=sin(a*6.+r*16.-tm*2.2)*.5+.5,s2=sin(a*3.-r*9.+tm*1.3)*.5+.5;
 float f=smoothstep(1.,.15,r)*(.25+.55*s+.3*s2)+pow(max(0.,1.-r*2.2),2.)*.8;gl_FragColor=vec4(col*f*k,1.);}`;
function a2Porte(){const g=new THREE.Group(),M=new THREE.MeshStandardMaterial({color:0x3a3846,map:HULLT,metalness:.8,roughness:.35});
 g.add(new THREE.Mesh(new THREE.TorusGeometry(260,22,16,96),M));const RM=new THREE.MeshBasicMaterial({color:0xffc070});
 for(let i=0;i<12;i++){const a=i*TAU/12,b=new THREE.Mesh(new THREE.BoxGeometry(18,48,30),M);b.position.set(Math.cos(a)*262,Math.sin(a)*262,0);b.rotation.z=a;g.add(b);const r=new THREE.Mesh(new THREE.BoxGeometry(6,22,31),RM);r.position.copy(b.position);r.rotation.z=a;g.add(r)}
 const mat=new THREE.ShaderMaterial({uniforms:{tm:{value:0},k:{value:1},col:{value:new THREE.Color(0xa070ff)}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:A2PFS,transparent:true,blending:ADDB,depthWrite:false,side:THREE.DoubleSide});
 const disk=new THREE.Mesh(new THREE.CircleGeometry(240,64),mat);g.add(disk);const gl=sprite(0xa070ff,900,.35);g.add(gl);g.userData.gl=gl;
 A2.pmat=mat;const p=a2Pos('porte');g.position.copy(p);g.lookAt(0,0,0);scene.add(g);return g}
function a2PorteLook(){const s=a2S(),e=s.end||(s.ends.length&&s.ch!=6&&s.ch!=7?s.ends[s.ends.length-1]:null);if(!A2.pmat)return;const U=A2.pmat.uniforms;
 const c=e=='open'?0x6dff8a:e=='power'?0xff3040:e=='close'?0x4060a0:0xa070ff;U.col.value.setHex(c);U.k.value=e=='close'?.25:1;A2.porte.userData.gl.material=spriteMat(c,e=='close'?.12:.35)}
function a2CorShip(){const m=buildAlly(0x2a2226,0xff3b3b);m.scale.setScalar(2.4);for(let i=0;i<3;i++){const f=sprite(i?0xff6020:0xffb040,10+i*4,.85);f.position.set(rv(4),rv(2)+1,rv(6));m.add(f)}return m}
// ----- outils -----
function a2Foe(ty,c,r,o){const z=Math.max(1,danger()),p=c.clone().add(new V3(rv(r),rv(r*.3),rv(r)));let e;
 if(ty=='xil'||ty=='xilB')e=mkFoe('xil',p,z,{big:ty=='xilB'});else{e=mkEnemy(ty,p,z);en.push(e)}
 e.a2=1;e.persist=1;if(o&&o.tgF)e.tgF=o.tgF;if(o&&o.dark){try{reskin(e,0x16171c,0xff3020)}catch(err){}e.label='Escadron noir';e.lc='#ff6a50'}
 e.onKill=()=>{const s=a2S();if(s.left>0)s.left--};return e}
const a2Alive=()=>en.filter(e=>e.a2&&!e.dead).length;
function a2Ally(n,col,acc,p){return frSpawn({kind:'ally',name:n,col,acc,p:p.clone().add(new V3(rv(80),rv(30),rv(80))),hp:140,mhp:140,regen:4})}
function a2ClearAl(){for(const F of A2.al)if(!F.gone)frRemove(F);A2.al=[]}
function a2Choice(who,q,opts){if(DLG.open){setTimeout(()=>a2Choice(who,q,opts),400);return}const el=$('chc'),C=CHAR[who];window.XPAUSE=(window.XPAUSE||0)+1;
 el.innerHTML=`<div id="chcI">${C.ic}</div><div><div id="chcN" style="color:${C.c}">${C.n}</div><div id="chcT">${esc(q)}</div><div class="obtns">${opts.map((a,i)=>`<button data-ch="${i}">${esc(a.t)}</button>`).join('')}</div></div>`;el.style.display='flex';SFX.tick();
 el.querySelectorAll('[data-ch]').forEach(b=>b.onclick=e=>{e.stopPropagation();el.style.display='none';el.innerHTML='';window.XPAUSE=Math.max(0,(window.XPAUSE||1)-1);SFX.buy();try{opts[+b.dataset.ch].f()}catch(err){console.warn(err)}save()})}
function a2Go(ch,sub){const s=a2S();s.ch=ch;s.sub=sub||'';s.left=0;s.prog=0;save();if(A2CH[ch]&&ch<8)banner('star','Acte II — Chapitre '+ch,A2CH[ch],'#ffb84d')}
// ----- déroulement -----
function a2Intro(){a2Go(1);say([['tess','Pilote ! La carte de l\'Écho est complète… et elle ne s\'arrête pas au Kepler.'],['tess','Elle mène à une structure gigantesque, au-delà de la frontière. L\'Écho l\'appelle « la Porte des Anciens ».'],
 ['echo','… la Porte … nous l\'avons trouvée … puis ils sont venus … les gardiens …'],['iris','Les gardiens ? Je n\'aime pas ça. Un vieux relais du Kepler émet encore, pas loin. Va le scanner, il doit garder les journaux de bord.'],['ia','Nouvel objectif marqué en orange ✦.']])}
function a2Tick(dt){const s=a2S(),ch=s.ch;
 // déclenchement après l'acte I
 if(ch==0){if(!(G.story&&G.story.ch>=8)||S.docked||DLG.open||BOSS||S.dead)return;const tu=$('tut9');if(tu&&tu.offsetParent)return;A2.wait+=dt;if(A2.wait>(s.ends.length||s.skip?3:25))a2Intro();return}
 if(ch>=8)return;const P=S.pos;
 if(ch==1){const R=a2Pos('relay'),d=P.distanceTo(R);
  if(!s.sub){if(d<300){A2.scan+=dt;if(A2.scan>5){A2.scan=0;s.sub='amb';s.left=3;SFX.disc();for(let i=0;i<3;i++)a2Foe('xil',R,500);
    say([['ia','Journaux récupérés. Dernière entrée du Kepler : « Ils sortent de la Porte. Ils ne tirent pas sur les vaisseaux… ils tirent sur ce qui essaie de l\'ouvrir. »'],['iris','Contacts ! Ces vaisseaux… ce ne sont pas des pirates.'],['echo','… les Xil … gardiens … ils ont cru que nous voulions la forcer …'],['iris','Défends-toi, pilote !']])}}else A2.scan=Math.max(0,A2.scan-dt)}
  else if(s.sub=='amb'){if(s.left<=0){a2Go(2);SFX.win();G.cr+=600;say([['iris','Ils battent en retraite. Beau travail. (+600 ¢)'],['tess','Les Xil… une espèce entière qui garde la Porte depuis des siècles. Et le Kepler a essayé de l\'ouvrir.'],
    ['ia','Signal de détresse entrant. Code pirate… identifiant : Kael « Corbeau ».'],['corbeau','… Pilote. Je sais. Tu es la dernière personne que j\'appellerais. Mais les Xil m\'ont coincé, et mon vaisseau perd son air.'],['iris','C\'est peut-être un piège. À toi de voir.']])}
   else if(!a2Alive()&&d<2500)for(let i=0;i<s.left;i++)a2Foe('xil',R,500)}}
 else if(ch==2){const C=a2Pos('cor'),d=P.distanceTo(C);
  if(!A2.cor&&s.sub!='leave'&&d<1800){A2.cor=frSpawn({kind:'platform',name:'Corbeau',mesh:a2CorShip(),p:C,hp:260,mhp:260});A2.cor.onDie=a2CorDie;
   if(!s.sub){for(let i=0;i<4;i++)a2Foe(i==3?'xilB':'xil',C,450,{tgF:A2.cor});
    say([['corbeau','Te voilà. Regarde-les tourner autour de moi comme des vautours.'],['corbeau','Ce qu\'il y a dans la Porte… je l\'ai cherché toute ma vie. Sors-moi de là et je te dirai tout ce que je sais.'],['iris','Il a attaqué la Base Alpha, pilote. Il y a une prime sur sa tête.']],
     ()=>a2Choice('corbeau','Que fais-tu de Corbeau ?',[{t:'Le sauver — il me devra une dette',f:()=>{s.c1='save';s.sub='fight';s.left=4}},{t:'Le sauver puis l\'arrêter pour l\'Alliance',f:()=>{s.c1='arrest';s.sub='fight';s.left=4}},
      {t:'Le laisser aux Xil',f:()=>{s.c1='leave';s.sub='leave';say([['corbeau','… Je vois. On se ressemble plus que tu ne crois, pilote.']])}}]))}
   else if(s.sub=='fight')for(let i=0;i<Math.max(1,s.left);i++)a2Foe('xil',C,450,{tgF:A2.cor})}
  if(s.sub=='fight'&&A2.cor&&!A2.cor.gone){if(!a2Alive()&&s.left>0&&d<2500)for(let i=0;i<s.left;i++)a2Foe('xil',C,450,{tgF:A2.cor});
   if(s.left<=0){const cor=A2.cor;A2.cor=null;cor.onDie=null;G.cr+=s.c1=='arrest'?1500:800;if(s.c1=='arrest')addRep&&addRep('alliance',150);SFX.win();
    say(s.c1=='save'?[['corbeau','… Je ne l\'oublierai pas. Kael Corbeau paie toujours ses dettes. (+800 ¢)'],['corbeau','Un conseil gratuit : l\'Alliance cherche la Porte aussi. Méfie-toi de l\'Amiral Kessler.'],['iris','Kessler ? C\'est mon supérieur. Corbeau ment… sûrement.']]
     :[['iris','Une patrouille arrive pour le prendre en charge. Prime versée : +1 500 ¢.'],['corbeau','Tu m\'as sauvé la vie pour me jeter en cellule. Je saurai m\'en souvenir.'],['corbeau','Dis à ton Amiral Kessler qu\'il n\'aura pas la Porte non plus.']],()=>{boom3(cor.pos,20,0x80c0ff,60);frRemove(cor);a2Ch3()})}}
  if(s.sub=='leave'&&A2.cor&&!A2.cor.gone){A2.cor.hp=Math.min(A2.cor.hp,40);for(const e of en)if(e.a2)e.tgF=A2.cor;if(!a2Alive())frDamage(A2.cor,999)}
  if(s.sub=='leave'&&!A2.cor&&d>1800)a2Ch3()}
 else if(ch==3){const W=new V3(WRECK.x,WRECK.y,WRECK.z),d=P.distanceTo(W);
  if(d<450){const p0=s.prog||0;s.prog=Math.min(1,p0+dt/16);if(p0==0){toast('⚙ Extraction du cœur… reste près de l\'épave');for(let i=0;i<3;i++)a2Foe('xil',W,600)}
   if(p0<.5&&s.prog>=.5){for(let i=0;i<2;i++)a2Foe('xil',W,600);a2Foe('xilB',W,600);toast('⚠ Renforts Xil !');SFX.alarm()}
   if(s.prog>=1&&!s.done3){s.done3=1;SFX.disc();say([['ia','Cœur du Kepler extrait. C\'est une clé… une moitié de clé. Elle réagit à la Porte.'],['tess','Donne-le-moi ! Je peux en tirer un alliage qui renforcera ta coque, et apprendre comment fonctionne la Porte.'],
    ['iris','Non. L\'Alliance doit le garder sous clé. On peut en faire une arme contre les Xil… et contre les pirates.'],['ia','Note : un collectionneur du marché noir en offrirait une fortune.']],
    ()=>a2Choice('ia','À qui confies-tu le cœur du Kepler ?',[{t:'À Tess (science : coque +10 %)',f:()=>{s.c2='tess';a2Ch4([['tess','Merci ! Je m\'occupe de l\'alliage tout de suite. Ta coque sera plus solide (+10 % de coque).']])}},
     {t:'À Iris (Alliance : dégâts +8 %)',f:()=>{s.c2='iris';a2Ch4([['iris','Bon choix. Les armuriers de la base vont régler tes canons dessus (+8 % de dégâts).'],['tess','… Je comprends. Mais j\'aurai quand même besoin de toi pour la clé.']])}},
     {t:'Le garder et le vendre (+5 000 ¢)',f:()=>{s.c2='keep';G.cr+=5000;SFX.coin();a2Ch4([['ia','Transaction conclue : +5 000 ¢. Une copie des données a été conservée.'],['tess','Tu… l\'as vendu ? Heureusement que j\'avais scanné ses fréquences. On peut encore fabriquer une clé, mais à l\'ancienne.'],['iris','Je m\'en souviendrai, pilote.']])}}]))}}
  else if(s.prog>0&&s.prog<1&&!A2.tw){A2.tw=1;toast('Extraction en pause : reviens près de l\'épave');setTimeout(()=>A2.tw=0,8000)}}
 else if(ch==4){if(S.docked&&S.docked.n=='Base Alpha'){if((G.cargo.cristal||0)>=8&&(G.cargo.titane||0)>=4){G.cargo.cristal-=8;G.cargo.titane-=4;if(!G.cargo.cristal)delete G.cargo.cristal;if(!G.cargo.titane)delete G.cargo.titane;a2Go(5,'wait');SFX.win();
   say([['tess','Parfait ! Avec ce cristal, la clé de phase est prête. Elle ouvrira la Porte.'],['kessler','Excellent travail, docteur. Amiral Varek Kessler, commandement de l\'Alliance. Je prends le relais.'],['kessler','La clé sera transférée sur mon croiseur. Pour la sécurité de tous, naturellement.'],
    ['tess','(à voix basse) Pilote… je n\'ai pas confiance. Je pars avec la clé sur ma navette. Escorte-moi hors de la base, vite.']])}
  else if(!A2.tw){A2.tw=1;setTimeout(()=>A2.tw=0,20000);toast('Il faut 8 cristal et 4 titane en soute — creuse les astéroïdes géants ou les planètes')}}}
 else if(ch==5){const B=P.length();
  if(s.sub=='wait'){if(!S.docked&&B>350&&B<4500&&!DLG.open){if(!s.st)s.st=a2EscSt();s.sub='esc';s.k1=s.k2=0;
    fwd();A2.sh=frSpawn({kind:'freighter',name:'Navette de Tess',p:P.clone().addScaledVector(_f,180).add(new V3(60,0,0)),hp:a2ShHp(),mhp:a2ShHp(),sp:85,dest:w7Berth(s.st,1,1100)});A2.sh.onDie=a2ShDie;A2.sh.onArrive=a2ShArr;A2.sh.d0=A2.sh.pos.distanceTo(A2.sh.dest);
    if(s.c1=='save'){A2.al.push(a2Ally('Corbeau',0x2a2226,0xff3b3b,P),a2Ally('Pirate de Corbeau',0x3a2a2e,0xff6a3b,P));say([['corbeau','Je t\'avais promis de payer ma dette. Mes gars et moi, on couvre la navette.']])}
    say([['tess','Navette en route vers '+s.st.n+'. Reste près de moi !']])}
   else if(B>=4500&&!A2.tw){A2.tw=1;setTimeout(()=>A2.tw=0,30000);toast('Retourne près de la Base Alpha : la navette de Tess t\'y attend')}}
  else if(s.sub=='esc'&&A2.sh&&!A2.sh.gone){const sh=A2.sh,f=1-sh.pos.distanceTo(sh.dest)/Math.max(1,sh.d0);
   if(f>.2&&!s.k1){s.k1=1;for(let i=0;i<3;i++)a2Foe('chasseur',sh.pos.clone().addScaledVector(_s1.copy(sh.dest).sub(sh.pos).normalize(),900),300,{tgF:sh,dark:1});SFX.alarm();
    say([['iris','Des chasseurs sans insigne fondent sur la navette !'],['kessler','Docteur Tess, vous emportez un bien de l\'Alliance. Arrêtez cette navette, ou mes hommes s\'en chargeront.'],['iris','Amiral… ce sont vos hommes ?!']])}
   if(f>.6&&!s.k2){s.k2=1;for(let i=0;i<3;i++)a2Foe(i?'chasseur':'lourd',sh.pos.clone().addScaledVector(_s1.copy(sh.dest).sub(sh.pos).normalize(),800),300,{tgF:sh,dark:1});SFX.alarm();toast('⚠ Deuxième vague de l\'escadron noir !')}
   if(sh.hp<sh.mhp*.35&&!A2.tw2){A2.tw2=1;toast('⚠ La navette de Tess est en danger !');setTimeout(()=>A2.tw2=0,9000)}}
  else if(s.sub=='esc'&&!A2.sh){s.sub='wait';toast('La navette est repartie à la Base Alpha — rejoins-la')}}
 else if(ch==6){const Pp=a2Pos('porte'),d=P.distanceTo(Pp);
  if(!s.sub&&d<3200&&!BOSS&&!DLG.open){s.sub='fight';a2Boss(true)}
  else if(s.sub=='fight'&&!BOSS&&d<3200&&!DLG.open)a2Boss(false)}
 else if(ch==7&&!A2.c7&&!DLG.open){A2.c7=1;a2Choice('xil','Le sort de la Porte est entre tes mains.',[{t:'Fermer la Porte pour toujours',f:()=>a2End('close')},{t:'L\'ouvrir et tendre la main aux Xil',f:()=>a2End('open')},{t:'Prendre son pouvoir pour moi',f:()=>a2End('power')}])}
 if(ch!=2&&A2.cor){if(!A2.cor.gone)frRemove(A2.cor);A2.cor=null}}
function a2CorDie(){const s=a2S();A2.cor=null;for(const e of en)if(e.a2)e.tgF=null;
 if(s.sub=='leave'){say([['ia','Le vaisseau de Corbeau a été détruit. Aucune capsule de survie détectée.'],['iris','… Il a choisi sa vie. Les Xil, eux, se tournent vers toi : décroche ou bats-toi.']],a2Ch3)}
 else{s.c1='lost';say([['ia','Le vaisseau de Corbeau a été détruit.'],['iris','Tu as fait ce que tu as pu, pilote. Les Xil étaient trop nombreux.']],a2Ch3)}}
function a2Ch3(){if(a2S().ch!=2)return;a2Go(3);say([['tess','Revenons à la Porte. D\'après les journaux, le Kepler transportait une pièce pour l\'ouvrir : son cœur. Il est toujours dans l\'épave.'],['iris','Les Xil la surveillent sûrement. Extrais ce cœur et ne traîne pas.']])}
function a2Ch4(lines){a2Go(4);say(lines.concat([['tess','Il me faut une clé de phase pour l\'utiliser : 8 cristal et 4 titane. Les astéroïdes géants et les profondeurs des planètes en sont pleins.']]))}
function a2ShDie(){const s=a2S();A2.sh=null;s.sub='wait';for(const e of en)if(e.a2)e.tgF=null;a2ClearAl();say([['iris','La navette… elle a explosé ! Tess s\'est éjectée, une patrouille l\'a récupérée.'],['tess','Je vais bien. J\'ai encore la clé. On recommence : rejoins-moi près de la Base Alpha.']])}
const a2ShHp=()=>Math.round(115*(typeof DF3!='undefined'&&DF3.lv==2?1.3:1));
function a2EscSt(){let b=null,bd=1e18;for(let i=-4;i<=4;i++)for(let l=-4;l<=4;l++)for(let j=-1;j<=1;j++){const c=cdata(i,j,l).st;if(!c||c.n=='Base Alpha')continue;const d=Math.hypot(c.x,c.y,c.z),k=Math.abs(d-8000);if(d>4500&&k<bd){bd=k;b=c}}
 b=b||storyFindStation();return b?{n:b.n,x:b.x,y:b.y,z:b.z}:{n:'Base Alpha',x:0,y:0,z:0}}
function a2ShArr(F){const s=a2S();if(!F.a2d){F.a2d=1;F.arr=0;F.dest=w7Berth(s.st,1,125);F.sp=40;F.d0=1;for(const e of en)if(e.a2)e.tgF=null;toast('🛬 La navette entre dans le couloir d\'amarrage');return}A2.sh=null;frRemove(F);a2ClearAl();for(const e of en)if(e.a2)e.tgF=null;G.cr+=900;SFX.win();a2Go(6);
 say([['tess','Arrivée ! Merci, pilote. (+900 ¢)'],['tess','J\'ai lu les ordres de Kessler. Il veut ouvrir la Porte de force et faire de sa puissance une arme. Les Xil seraient exterminés.'],
  ['iris','Si c\'est vrai, il a trahi l\'Alliance. Va à la Porte avant lui. J\'ai marqué ses coordonnées.'],['echo','… la Porte … ne la laissez pas … à celui qui veut la briser …'],['ia','La Porte est loin : fais le plein de carburant avant le saut.']])}
function a2Boss(first){const s=a2S(),Pp=a2Pos('porte');A2.boss=1;spawnBoss(Pp.clone().add(new V3(700,120,-500)),{story:true,a2:1,nm:'CROISEUR VENGEUR (KESSLER)'});toast('⚠ Le Vengeur de Kessler garde la Porte !');
 for(let i=0;i<2;i++)a2Foe('chasseur',Pp,600,{dark:1});a2ClearAl();
 if(s.c1=='save')A2.al.push(a2Ally('Corbeau',0x2a2226,0xff3b3b,S.pos),a2Ally('Pirate de Corbeau',0x3a2a2e,0xff6a3b,S.pos));if(s.c2=='iris')A2.al.push(a2Ally('Iris Valen',0xdfe6ee,0x2fa8ff,S.pos),a2Ally('Patrouille d\'Iris',0xdfe6ee,0x2fa8ff,S.pos));
 if(!first)return;const L=[['kessler','Toujours là, pilote ? La Porte appartient à l\'Alliance. À moi.'],['kessler','Mon croiseur, le Vengeur, a les mêmes boucliers que le Némésis. Tu connais la chanson : générateurs, tourelles, réacteur. Si tu survis.']];
 if(s.c2=='iris')L.push(['iris','Varek ! Tu es relevé de ton commandement. Mes chasseurs sont avec toi, pilote !']);if(s.c1=='save')L.push(['corbeau','Je n\'allais pas rater ça. Corbeau entre dans la danse !']);if(s.c1=='arrest')L.push(['ia','Aucun renfort disponible : Corbeau est en prison et l\'Alliance hésite.']);say(L)}
function a2BossDone(){const s=a2S();A2.boss=0;A2.c7=1;a2ClearAl();for(const e of[...en])if(e.a2&&!e.dead)killQuiet(e);G.cr+=4000;gainXP&&gainXP(800);SFX.win();a2Go(7);
 say([['kessler','Non… La Porte… elle aurait fait de nous des dieux…'],['echo','… pilote … la clé est en toi … la Porte t\'écoute …'],['xil','Petite créature. Nous gardons ce passage depuis que vos étoiles étaient jeunes. Derrière lui dort une puissance qui brûle les mondes.'],
  ['xil','Le Kepler a voulu la forcer. Celui-ci voulait la voler. Et toi… que veux-tu ?'],['echo','… si tu fermes la Porte … je me dissoudrai avec elle … l\'équipage du Kepler pourra enfin dormir …']],
  ()=>a2Choice('xil','Le sort de la Porte est entre tes mains.',[{t:'Fermer la Porte pour toujours',f:()=>a2End('close')},{t:'L\'ouvrir et tendre la main aux Xil',f:()=>a2End('open')},{t:'Prendre son pouvoir pour moi',f:()=>a2End('power')}]))}
// ----- fins -----
const A2E={close:{n:'Le Gardien',ti:'Gardien de la Porte',pt:'a2garde',l:[['echo','… merci … nous rentrons … enfin …'],['xil','Tu as choisi le silence plutôt que la gloire. Les Xil s\'en souviendront.']],
  ep:'La Porte des Anciens s\'éteint dans un dernier éclair bleu. L\'Écho se tait pour toujours : l\'équipage du Kepler repose enfin. Les Xil, sans plus rien à garder, disparaissent dans les profondeurs de la galaxie.'},
 open:{n:'L\'Ambassadeur',ti:'Ambassadeur des Xil',pt:'a2xil',l:[['xil','Une main tendue… La première en mille ans. Nous la prenons.'],['echo','… la route est ouverte … ensemble …']],
  ep:'La Porte s\'illumine de vert. Pour la première fois, des vaisseaux Xil et humains volent côte à côte. Ce qui dort derrière la Porte, vous le garderez ensemble, et tu es le premier humain à qui les Xil font confiance.'},
 power:{n:'Le Tyran des étoiles',ti:'Tyran des étoiles',pt:'a2tyran',l:[['xil','… Alors tu n\'es pas différent de lui.'],['echo','… non … pilote … NON …']],
  ep:'Le pouvoir de la Porte te traverse comme un incendie. Ton vaisseau brille d\'une lumière rouge que plus personne n\'ose approcher. Les Xil fuient, l\'Alliance tremble, et dans les bars des stations, on murmure ton nom à voix basse.'}};
function a2End(k){const s=a2S(),E=A2E[k];s.c3=k;s.end=k;say(E.l,()=>{
  const C1={save:'Kael Corbeau a remboursé sa dette. On raconte qu\'il a fondé un port libre aux confins du secteur, où ton nom est toujours le bienvenu.',arrest:'Kael Corbeau purge sa peine dans une prison de l\'Alliance. Chaque semaine, il écrit une lettre adressée à « ce maudit pilote ». Il ne l\'envoie jamais.',
   leave:'Personne ne parle plus de Corbeau. Les pirates ont oublié son nom ; toi, jamais tout à fait.',lost:'Les pirates du Pavillon noir ont gravé le nom de Corbeau sur la coque de leurs vaisseaux. Ils disent que tu as essayé de le sauver.'}[s.c1]||'';
  const C2={tess:'Le Dr Tess publie ses travaux sur le Kepler. Ils changeront à jamais la façon dont on voyage entre les étoiles.',iris:'Iris Valen devient Amirale à la place de Kessler. Elle t\'offre un poste. Tu refuses : ta place est là-haut.',keep:'Le cœur du Kepler a disparu chez un collectionneur. Tess ne t\'a jamais vraiment pardonné.'}[s.c2]||'';
  s.ch=8;if(!s.ends.includes(k))s.ends.push(k);G.cr+=6000;gainXP&&gainXP(1500);G.x.xti=G.x.xti||[];if(!G.x.xti.includes(E.ti))G.x.xti.push(E.ti);if(!G.pown.includes('paint:'+E.pt))G.pown.push('paint:'+E.pt);a2PorteLook();save();a2EndScreen(E,[E.ep,C1,C2])})}
function a2EndScreen(E,ps){let el=$('a2end');if(!el){el=document.createElement('div');el.id='a2end';document.body.appendChild(el)}window.XPAUSE=(window.XPAUSE||0)+1;const s=a2S();
 el.style.cssText='position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at center,rgba(10,8,30,.92),rgba(0,0,0,.97));opacity:0;transition:opacity 1.6s;padding:20px;box-sizing:border-box;overflow:auto';
 el.innerHTML=`<div style="max-width:620px;text-align:center;font-family:var(--hf,inherit);color:#e8eefc"><div style="letter-spacing:.4em;font-size:13px;color:#ffb84d">ACTE II — FIN</div><div style="font-size:clamp(28px,7vw,46px);font-weight:700;margin:10px 0 18px;text-shadow:0 0 24px rgba(255,184,77,.5)">${esc(E.n)}</div>
 ${ps.filter(Boolean).map(p=>`<p style="font-size:15px;line-height:1.55;opacity:.92;margin:0 0 12px">${esc(p)}</p>`).join('')}
 <div style="margin:18px 0 6px;font-size:13px;color:#9fb3d9">Récompenses : 6 000 ¢ · 1 500 XP · titre « ${esc(E.ti)} » · peinture « ${esc(PARTS.paint.o[E.pt].n)} » (Atelier)</div>
 <div style="font-size:13px;color:#9fb3d9">Fins découvertes : ${s.ends.length} / 3 — rejoue l'acte II depuis le service « Campagne » d'une station pour faire d'autres choix.</div>
 <button id="a2endb" style="margin-top:20px;padding:12px 28px;font-size:15px">Continuer</button></div>`;el.style.display='flex';requestAnimationFrame(()=>el.style.opacity=1);SFX.win();
 $('a2endb').onclick=()=>{el.style.display='none';window.XPAUSE=Math.max(0,(window.XPAUSE||1)-1);banner('trophy','Titre et peinture débloqués','« '+E.ti+' » (Journal de bord) · peinture à l\'Atelier','#ffb84d')}}
// ----- branchements -----
STICK.push(dt=>{A2.t+=dt;const s=a2S();if(s.ch>=1||s.ends.length){const R=a2Pos('relay'),Pp=a2Pos('porte');
  if(!A2.relay&&S.pos.distanceTo(R)<20000)A2.relay=a2Relay();if(A2.relay){A2.relay.visible=S.pos.distanceTo(R)<20000;A2.relay.rotation.y+=dt*.05;A2.relay.userData.L.visible=(A2.t%1.4)<.5}
  if(!A2.porte&&(s.ch>=5||s.ends.length)&&S.pos.distanceTo(Pp)<30000){A2.porte=a2Porte();a2PorteLook()}if(A2.porte){A2.porte.visible=S.pos.distanceTo(Pp)<30000;A2.pmat.uniforms.tm.value=A2.t;A2.porte.rotation.z+=dt*.02}}
 if(!S.dead)a2Tick(dt)});
{const _sb=storyBossDone;storyBossDone=function(){if(A2.boss){a2BossDone();return}_sb()}}
{const _bb=bossBar;bossBar=function(){_bb();if(BOSS&&BOSS.opts&&BOSS.opts.nm){const el=$('bossN');if(el&&el.innerHTML.includes('CROISEUR NÉMÉSIS'))el.innerHTML=el.innerHTML.replace('CROISEUR NÉMÉSIS',BOSS.opts.nm)}}}
{const _pm=PM;PM=function(k){let v=_pm(k);const c=G.x&&G.x.a2&&G.x.a2.c2;if(c=='tess'&&k=='hp')v*=1.1;else if(c=='iris'&&k=='dmg')v*=1.08;return v}}
{const _ci=contentInfo;contentInfo=function(){let r=_ci();const s=a2S();if(s.ch>=1&&s.ch<8){const x=a2Txt();if(x)r+=(r?'<br>':'')+`<span style="color:#ffb84d">✦ ${x}</span>`}return r}}
{const _co=contentOverlay;contentOverlay=function(){_co();if(mode!='space'||S.dead)return;const s=a2S();if(s.ch>=1&&s.ch<8){const tg=a2Tg();if(tg&&!(BOSS&&A2.boss))edgeMarker(tg,'#ffb84d','','✦')}}}
{const _mi=mapItems;mapItems=function(){const it=_mi(),s=a2S();if(s.ch>=1&&s.ch<8){const tg=a2Tg();if(tg)it.push({k:'story',n:'Acte II : '+a2Txt(),x:tg.x,y:tg.y,z:tg.z,c:'#ffb84d'})}
  if(s.ends.length){const p=a2Pos('porte');it.push({k:'story',n:'Porte des Anciens',x:p.x,y:p.y,z:p.z,c:'#c890ff'})}return MAP.items=it}}
// service de station « Campagne »
svcAdd({o:1,ic:'star',t:'Campagne',show:()=>true,html:()=>{const a1=G.story&&G.story.ch>=8,s=a2S();let h=`<div class="srow">Acte I — L'Écho de Kepler<span>${a1?'terminé ✓':'chapitre '+((G.story&&G.story.ch)||1)+' / 7'}</span></div>`;
 h+=`<div class="srow">Acte II — La Porte des Anciens<span>${s.ch>=8?'terminé ✓':s.ch>=1?'chapitre '+s.ch+' / 7 : '+esc(A2CH[s.ch]):a1?'bientôt…':'après l\'acte I'}</span></div>`;
 const CN={save:'Corbeau sauvé',arrest:'Corbeau arrêté',leave:'Corbeau abandonné',lost:'Corbeau mort au combat',tess:'cœur confié à Tess',iris:'cœur confié à Iris',keep:'cœur vendu'},ch=[s.c1,s.c2].filter(Boolean).map(c=>CN[c]);
 if(ch.length)h+=`<div class="hint">Tes choix : ${ch.join(' · ')}${s.end&&s.ch>=8?' · fin : '+esc(A2E[s.end].n):''}</div>`;
 h+=`<div class="hint">Fins découvertes : ${s.ends.length} / 3${s.ends.length?' — '+s.ends.map(k=>esc(A2E[k].n)).join(', '):''}</div>`;
 if(!a1)h+=`<button data-sv="a2skip">Passer directement à l'acte II (résumé de l'acte I)</button>`;if(s.ch>=8)h+=`<button data-sv="a2replay">Rejouer l'acte II (autres choix, autres fins)</button>`;return h}});
SVC.act.a2skip=()=>{if(BOSS)return toast('Impossible pendant un combat');G.story=Object.assign(G.story||{},{ch:8,won:1,intro:1});const s=a2S();s.skip=1;A2.wait=0;save();
 say([['iris','Résumé : tu as suivi le signal de l\'Écho jusqu\'à l\'épave du Kepler et détruit le Némésis du pirate Corbeau. Corbeau a survécu.'],['ia','L\'acte II commence dès que tu repars dans l\'espace.']])};
SVC.act.a2replay=()=>{const s=a2S(),e=s.ends;for(const k in s)delete s[k];s.ch=0;s.ends=e;s.end=null;A2.wait=0;a2ClearAl();save();toast('✦ L\'acte II recommence dès que tu repars dans l\'espace')};
