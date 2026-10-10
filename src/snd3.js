// ===== SONS RÉALISTES (snd3) : mixage (compresseur, réverbérations selon le lieu), sons placés dans l'espace (gauche/droite, distance, étouffement),
// moteur en couches, armes, impacts, explosions, tonnerre, ambiances (planètes, hangar, épaves, grottes), bruits de pas, passages d'ennemis, musique plus riche =====
const SN3={ok:0,o:null,dl:0,live:0,cap:DESK?130:72,lb:{p:new V3(),n:0,ms:0},A:{},at:0,ev:3,gust:.5,gT:0,gW:.5,wat:0,lav:0,wT:0,fbc:0,jf:1,jt:0,lzOn:0,bo:0,fk:null,gr:true,pa:-99};
const SN3R={bar:[1,2.756,5.404,8.933],plate:[1,1.594,2.136,2.296,2.653,2.918],coin:[1,2.32,3.86,5.27],bell:[1,2,2.76,3.01,4.1]};
const SN3T={tone,noise,nzf},SN3O=Object.assign({},SFX);
// ----- briques de base -----
function sn3G(v=0){const g=AC.createGain();g.gain.value=v;return g}
function sn3F(ty,f,Q=.7){const b=AC.createBiquadFilter();b.type=ty;b.frequency.value=f;b.Q.value=Q;return b}
function sn3Pan(v){if(AC.createStereoPanner){const p=AC.createStereoPanner();p.pan.value=clamp(v,-1,1);return p}return sn3G(1)}
function sn3Buf(sec,fn,ch=1){const sr=AC.sampleRate,b=AC.createBuffer(ch,Math.floor(sr*sec),sr);for(let c=0;c<ch;c++)fn(b.getChannelData(c),sr,c);return b}
// raccord sans clic quand un bruit grave tourne en boucle
function sn3Seam(d){const N=d.length,a=d[0],b=d[N-1];for(let i=0;i<N;i++)d[i]-=a+(b-a)*i/N}
// réponse impulsionnelle : premières réflexions puis queue qui s'assombrit
function sn3IR(sec,pw,br,er){return sn3Buf(sec,(d,sr)=>{const N=d.length,pre=Math.floor(sr*.012);let y=0;for(let i=pre;i<N;i++){const x=(i-pre)/(N-pre),k=.05+br*Math.pow(1-x,1.6);y+=((Math.random()*2-1)-y)*k;d[i]=y*Math.pow(1-x,pw)}
for(let j=0;j<er;j++){const i=Math.floor(sr*(.005+Math.random()*.075));d[i]+=(Math.random()<.5?-1:1)*(.9-j/er*.6)}},2)}
function sn3Loop(b,r=1){const s=AC.createBufferSource();s.buffer=b;s.loop=true;s.playbackRate.value=r;s.start(0,Math.random()*(b.duration-.05));return s}
const sn3Dst=()=>SN3.o||SN3.bus||master;
function sn3Cnt(s){SN3.live++;s.onended=()=>{SN3.live--}}
// bruit filtré (balayage f0 → f1), attaque douce, extinction exponentielle
function sn3N(buf,dur,vol,ty,f0,f1,Q=1,dl=0,att=.004){if(SN3.live>SN3.cap)return;const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),n=AC.currentTime+dl+SN3.dl;g.gain.value=1e-4;att=Math.min(att,dur*.5);s.buffer=buf;s.loop=true;f.type=ty;f.Q.value=Q;f.frequency.setValueAtTime(f0,n);if(f1!=f0)f.frequency.exponentialRampToValueAtTime(Math.max(20,f1),n+dur);
g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(Math.max(1e-4,vol),n+att);g.gain.exponentialRampToValueAtTime(.0004,n+dur);s.connect(f);f.connect(g);g.connect(sn3Dst());sn3Cnt(s);s.start(n,Math.random()*(buf.duration-.1));s.stop(n+dur+.03)}
// oscillateur avec glissement de fréquence (passe-bas optionnel)
function sn3O(ty,f0,f1,dur,vol,dl=0,att=.003,lp=0){if(SN3.live>SN3.cap)return;const o=AC.createOscillator(),g=AC.createGain(),n=AC.currentTime+dl+SN3.dl;g.gain.value=1e-4;att=Math.min(att,dur*.5);o.type=ty;o.frequency.setValueAtTime(f0,n);if(f1!=f0)o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),n+dur);
g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(Math.max(1e-4,vol),n+att);g.gain.exponentialRampToValueAtTime(.0004,n+dur);let x=o;if(lp){const f=sn3F('lowpass',lp,.7);o.connect(f);x=f}x.connect(g);g.connect(sn3Dst());sn3Cnt(o);o.start(n);o.stop(n+dur+.03)}
// métal : partiels inharmoniques (barre, tôle, pièce, cloche), les aigus s'éteignent plus vite
function sn3M(f,dur,vol,dl=0,R=SN3R.bar){for(let i=0;i<R.length;i++){const ff=f*R[i]*(1+(Math.random()-.5)*.008);if(ff>15000)break;sn3O('sine',ff,ff,dur/(1+i*.7),vol/(1+i*.9),dl,.0015)}}
function sn3Bell(f,dur,vol,dl=0){sn3O('sine',f,f,dur,vol,dl,.002);sn3O('triangle',f,f,dur*.6,vol*.35,dl,.002);sn3O('sine',f*2.01,f*2.01,dur*.45,vol*.25,dl,.002);sn3O('sine',f*2.76,f*2.76,dur*.18,vol*.12,dl,.001)}
// ----- chaîne de mixage -----
function sn3Init(){if(SN3.ok||!AC||!master||!noiseBuf)return;try{
const C=AC.createDynamicsCompressor();C.threshold.value=-16;C.knee.value=12;C.ratio.value=3.2;C.attack.value=.003;C.release.value=.25;const L=sn3F('lowpass',20000,.5);
SN3.pink=sn3Buf(4,d=>{let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;b2=.969*b2+w*.153852;b3=.8665*b3+w*.3104856;b4=.55*b4+w*.5329522;b5=-.7616*b5-w*.016898;d[i]=(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.11;b6=w*.115926}sn3Seam(d)});
SN3.brown=sn3Buf(4,d=>{let l=0;for(let i=0;i<d.length;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3.5}sn3Seam(d)});
SN3.crk=sn3Buf(3,d=>{for(let i=0;i<d.length;i++)if(Math.random()<.0022){const a=(Math.random()*2-1)*(.3+Math.random()*.7);for(let j=0;j<7&&i+j<d.length;j++)d[i+j]+=a*Math.pow(.6,j)*(j&1?-1:1)}});
// deux réverbérations : salle métallique (hangar, épave) et grande salle (grotte, lointain)
const cA=AC.createConvolver(),cB=AC.createConvolver();cA.buffer=sn3IR(1.4,2.6,.85,14);cB.buffer=sn3IR(DESK?3.2:2.4,2.2,.5,8);const wet=sn3G(1);cA.connect(wet);cB.connect(wet);SN3.cA=cA;SN3.cB=cB;
const bus=sn3G(1),sA=sn3G(.1),sB=sn3G(.04);bus.connect(sA);bus.connect(sB);sA.connect(cA);sB.connect(cB);SN3.bus=bus;SN3.sA=sA;SN3.sB=sB;
// vaisseau du joueur et ambiances extérieures : étouffés dans le cockpit
SN3.ps=sn3F('lowpass',20000,.6);SN3.ps.connect(bus);SN3.amb=sn3F('lowpass',20000,.5);SN3.amb.connect(bus);
// interface : sèche avec un soupçon d'espace, et une version « ample »
SN3.ui=sn3G(1);const u1=sn3G(.08);SN3.ui.connect(u1);u1.connect(cA);SN3.uiL=sn3G(1);const u2=sn3G(.22);SN3.uiL.connect(u2);u2.connect(cB);
// musique : écho stéréo doux (deux lignes à retard croisées) + atténuation pendant les grosses explosions
SN3.md=sn3G(1);if(!MVOL){MVOL=AC.createGain();applyVol()}
SN3.mrv=sn3G(1);const d1=AC.createDelay(1),d2=AC.createDelay(1),f1=sn3F('lowpass',2200,.5),f2=sn3F('lowpass',1800,.5),fb1=sn3G(.42),fb2=sn3G(.42),mo=sn3G(.5),pL=sn3Pan(-.6),pR=sn3Pan(.6);
d1.delayTime.value=.31;d2.delayTime.value=.47;SN3.mrv.connect(d1);SN3.mrv.connect(d2);d1.connect(f1);f1.connect(fb1);fb1.connect(d2);d2.connect(f2);f2.connect(fb2);fb2.connect(d1);f1.connect(pL);f2.connect(pR);pL.connect(mo);pR.connect(mo);mo.connect(MVOL);
// branchements (en dernier : en cas d'échec, l'ancien son reste)
master.disconnect();master.connect(L);L.connect(C);C.connect(AC.destination);SN3.C=C;SN3.mlp=L;
bus.connect(master);wet.connect(master);SN3.ui.connect(master);SN3.uiL.connect(master);SN3.md.connect(C);try{MVOL.disconnect()}catch(e){}MVOL.connect(SN3.md);
try{engG.disconnect()}catch(e){}
SN3.ok=1}catch(e){console.warn('snd3',e);try{master.disconnect();master.connect(AC.destination)}catch(x){}}}
// les anciennes fonctions passent par la nouvelle chaîne (attaque sans clic, réverbération du lieu)
tone=function(f,f2,dur,type,vol,delay=0){if(!AC||muted)return;if(!SN3.ok)return SN3T.tone(f,f2,dur,type,vol,delay);sn3O(type,f,f2,dur,vol,delay,.004)};
noise=function(dur,vol,freq){if(!AC||muted)return;if(!SN3.ok)return SN3T.noise(dur,vol,freq);sn3N(noiseBuf,dur,vol,'lowpass',freq,60,1,0,.003)};
nzf=function(dur,vol,f0,f1,type='lowpass',Q=1,delay=0){if(!AC||muted)return;if(!SN3.ok)return SN3T.nzf(dur,vol,f0,f1,type,Q,delay);sn3N(noiseBuf,dur,vol,type,f0,f1,Q,delay,Math.min(.012,dur*.2))};
// ----- sons placés dans l'espace -----
function sn3Cam(){return typeof H3!='undefined'&&H3.on&&H3.cam?H3.cam:typeof MENU3!='undefined'&&MENU3.on&&MENU3.cam?MENU3.cam:camera}
function sn3Rel(p,cam){const e=(cam||sn3Cam()).matrixWorld.elements,dx=p.x-e[12],dy=p.y-e[13],dz=p.z-e[14],d=Math.hypot(dx,dy,dz)||.001;return{d,pan:(dx*e[0]+dy*e[1]+dz*e[2])/d,fr:-(dx*e[8]+dy*e[9]+dz*e[10])/d}}
const sn3Att=(d,ref)=>ref/(ref+Math.max(0,d-ref));
// voix : passe-bas selon la distance (l'air mange les aigus), panoramique, atténuation, plus de réverbération au loin
function sn3V(p,ref,dur){const r=sn3Rel(p),a=sn3Att(r.d,ref);if(a<.012)return null;const i=sn3G(1),lp=sn3F('lowpass',Math.max(350,19000/(1+Math.pow(r.d/(ref*5),1.35))*(r.fr<-.2?.7:1)),.5),pn=sn3Pan(r.pan*.85*Math.min(1,r.d/(ref*.25))),o=sn3G(a),w=sn3G(.04+.3*Math.min(1,r.d/(ref*10)));
i.connect(lp);lp.connect(pn);pn.connect(o);o.connect(SN3.bus);o.connect(w);w.connect(SN3.cB);setTimeout(()=>{try{i.disconnect();lp.disconnect();pn.disconnect();o.disconnect();w.disconnect()}catch(e){}},(dur+5)*1000);i.d=r.d;return i}
// sur une planète, le son des grosses explosions lointaines arrive après l'éclair (340 m/s)
function sn3At(p,ref,dur,fn,late){if(!SN3.ok||muted)return;if(!p){fn(null);return}const v=sn3V(p,ref,dur);if(!v)return;const o=SN3.o,dl=SN3.dl;SN3.o=v;if(late&&mode=='surf'&&v.d>260)SN3.dl=Math.min(3,v.d/340);try{fn(v.d)}finally{SN3.o=o;SN3.dl=dl}}
function sn3Via(node,fn){const o=SN3.o;SN3.o=node;try{fn()}finally{SN3.o=o}}
function sn3Side(pan,fn){if(!SN3.ok)return;const p=sn3Pan(pan);p.connect(SN3.o||SN3.bus);setTimeout(()=>{try{p.disconnect()}catch(e){}},6000);sn3Via(p,fn)}
const sn3U=(fn,lush)=>sn3Via(lush?SN3.uiL:SN3.ui,fn),sn3P=fn=>sn3Via(SN3.ps,fn);
// dernière explosion visuelle (boom3) : donne la position et la taille au son qui suit
{const _b3=boom3;boom3=function(p,n,c,spd,big){if(p){SN3.lb.p.set(p.x,p.y,p.z);SN3.lb.n=n;SN3.lb.ms=performance.now()}return _b3(p,n,c,spd,big)}}
function sn3Take(maxN){const L=SN3.lb;if(!L.ms||performance.now()-L.ms>8||(maxN!=null&&L.n>maxN))return null;L.ms=0;return L}
function sn3Duck(k,dur){if(!SN3.md)return;const n=AC.currentTime,g=SN3.md.gain;try{g.cancelScheduledValues(n);g.setTargetAtTime(1-k,n,.03);g.setTargetAtTime(1,n+.3,dur*.4)}catch(e){}}
// remplace un son ; si la nouvelle chaîne n'a pas pu démarrer, l'ancien son est joué
function sn3Def(k,fn,fb){const old=SFX[k]||SN3O[fb];SFX[k]=(...a)=>{if(!AC||muted)return;if(!SN3.ok)return old&&old(...a);try{fn(...a)}catch(e){console.warn('snd3',k,e)}}}
// ----- armes du joueur (un son par type de canon) -----
sn3Def('shoot',()=>sn3P(()=>{const g=(G.parts&&G.parts.guns)||'std',W=noiseBuf;
if(g=='lourds'){sn3N(W,.03,.4,'highpass',2600,1500,.7);sn3N(SN3.brown,.5,.4,'lowpass',2400,110,.8,0,.003);sn3O('sine',jit(115),30,.4,.22);sn3O('square',jit(430),85,.16,.04,0,.002,1300);sn3M(jit(640),.18,.03,.11);sn3N(W,.035,.1,'bandpass',3600,3000,3,.11)}
else if(g=='rotatifs'){sn3N(W,.018,.26,'highpass',3600,2600,.7);sn3O('sine',jit(185,.1),68,.055,.16);sn3O('square',jit(1150,.1),480,.04,.02,0,.002,2600);sn3N(SN3.pink,.07,.08,'bandpass',1800,700,1,.005)}
else if(g=='plasma'){sn3O('sawtooth',jit(230),900,.14,.045,0,.004,2600);sn3O('sine',jit(1600),430,.16,.05);sn3N(SN3.crk,.22,.3,'bandpass',4600,1800,1.3);sn3O('sine',95,40,.18,.2);sn3N(SN3.pink,.25,.06,'bandpass',1300,500,1,.02)}
else if(g=='jumeles'){for(const[s,dl]of[[-.35,0],[.35,.035]])sn3Side(s,()=>{sn3N(W,.02,.2,'highpass',4200,2600,.7,dl);sn3O('square',jit(1550),340,.09,.03,dl,.002,3200);sn3O('sine',150,55,.07,.13,dl)})}
else{sn3N(W,.022,.25,'highpass',4000,2500,.7);sn3O('square',jit(1450),300,.1,.034,0,.002,3400);sn3O('sine',jit(2700),900,.05,.028);sn3O('sine',160,55,.08,.17);sn3N(SN3.pink,.16,.05,'bandpass',2200,600,1,.01)}}));
sn3Def('missile',()=>sn3P(()=>{sn3N(SN3.brown,.1,.6,'lowpass',3200,400,.7);sn3O('sine',85,38,.3,.28);sn3N(SN3.pink,1.2,.3,'bandpass',1700,520,.8,.03,.05);sn3N(SN3.crk,1,.25,'bandpass',1500,800,.7,.03,.05);sn3O('sine',1500,650,.9,.018,.06,.05);sn3N(noiseBuf,.2,.1,'highpass',5000,2500,.7)}));
sn3Def('mine',()=>sn3P(()=>{sn3M(jit(230),.35,.05,0,SN3R.plate);sn3O('sine',105,52,.16,.2);sn3N(noiseBuf,.03,.12,'bandpass',2600,2000,2);sn3O('sine',1900,1900,.05,.025,.28);sn3O('sine',2500,2500,.05,.025,.45)}));
sn3Def('mineTick',()=>sn3P(()=>{sn3N(SN3.crk,.07,.7,'bandpass',jit(3000,.25),1900,1.1);sn3N(noiseBuf,.02,.15,'highpass',5200,4000,.7);if(Math.random()<.3)sn3O('sine',jit(180),90,.05,.06)}));
// ----- tirs ennemis : placés là où part le tir -----
sn3Def('eshoot',()=>{const b=EB.length?EB[EB.length-1]:null;sn3At(b&&b.m&&b.m.position,45,.5,()=>{sn3N(noiseBuf,.02,.15,'highpass',3200,2000,.7);sn3O('sawtooth',jit(820,.1),170,.15,.03,0,.003,2300);sn3O('sine',jit(140),58,.1,.1);sn3N(SN3.pink,.16,.05,'bandpass',1700,500,1,.01)})});
// ----- coups reçus : choc métallique de la coque, bouclier qui grésille -----
sn3Def('hit',()=>sn3P(()=>{sn3N(noiseBuf,.03,.25,'bandpass',3200,1600,.8);sn3M(jit(170,.15),.7,.045,0,SN3R.plate);sn3O('sine',jit(90),38,.28,.25);sn3N(SN3.brown,.4,.25,'lowpass',1000,100,.7);sn3N(SN3.crk,.35,.2,'bandpass',3600,1400,.8,.02);if(Math.random()<.5)sn3M(jit(90),1.4,.02,.25,SN3R.plate)}));
sn3Def('shield',()=>sn3P(()=>{sn3O('sawtooth',jit(130),460,.22,.05,0,.003,1900);sn3N(noiseBuf,.26,.22,'bandpass',1600,5200,2.4);sn3N(SN3.crk,.3,.3,'highpass',3200,2200,.7);sn3O('sine',jit(880),280,.25,.06);sn3O('sine',70,45,.2,.12)}));
// « tick » : impact sur une cible juste touchée (après boom3) ou petit clic d'interface
sn3Def('tick',()=>{const L=sn3Take(8);if(L){sn3At(L.p,50,.6,()=>{sn3M(jit(1500,.25),.14,.06);sn3N(noiseBuf,.04,.35,'bandpass',jit(3800,.2),2400,1.1);sn3N(SN3.crk,.12,.2,'bandpass',3000,1600,.8,.01)});return}
sn3U(()=>{sn3N(noiseBuf,.014,.35,'bandpass',3600,3000,1.4);sn3O('sine',2300,1800,.03,.08)})});
// ----- explosions : claquement, corps, infrabasse, débris qui crépitent, grondement ; taille et distance réelles -----
sn3Def('boom',()=>{const L=sn3Take(),n=L?L.n:30,big=n>=40,k=n>=70?1.6:big?1.2:.85;
const go=d=>{const fr=d==null?0:clamp(d/1000,0,1),cl=1-fr;sn3N(noiseBuf,.06,.45*cl*cl,'highpass',2800,1400,.7);sn3N(SN3.brown,1.5*k,.9,'lowpass',2600-fr*1900,90,.7,0,.004);sn3O('sine',jit(75),24,1.2*k,.55,0,.004);
sn3N(SN3.pink,.7*k,.35*cl,'bandpass',1400,300,.7,.01,.01);sn3N(SN3.crk,1.5*k,.45*cl,'bandpass',2600,800,.6,.05,.03);sn3N(SN3.brown,2.8*k,.3,'lowpass',260,55,.6,.15,.3);
if(big&&cl>.4)for(let i=0;i<3;i++)sn3M(jit(260+Math.random()*500,.1),.5,.02*cl,.3+Math.random()*.9,SN3R.plate)};
if(L)sn3At(L.p,big?140:80,4,go,true);else go(null);if(big)sn3Duck(.45,1.6)});
sn3Def('rock',()=>{const L=sn3Take(),go=()=>{sn3N(SN3.brown,.8,.4,'lowpass',1500,80,.8);sn3O('sine',jit(62),28,.55,.2);for(let i=0;i<4;i++)sn3N(SN3.crk,.25+Math.random()*.45,.18,'bandpass',800+Math.random()*2600,400,.9,i*.05+Math.random()*.1);sn3N(SN3.pink,.45,.12,'bandpass',650,200,.8,.04)};L?sn3At(L.p,80,2,go):go()});
// tonnerre : déchirure proche puis roulements qui se chevauchent
sn3Def('thunder',(d=500,p)=>{const near=d<350,a=clamp(1.2-d/1100,.25,1),pan=p?sn3Rel(p).pan*.7:rv(.5);sn3Side(pan,()=>{
if(near){sn3N(noiseBuf,.09,.55,'highpass',2400,900,.7);sn3N(SN3.crk,.7,.6,'highpass',1600,700,.7,.01,.005)}
const m=4+(Math.random()*3|0);for(let i=0;i<m;i++)sn3N(SN3.brown,1.4+Math.random()*1.8,(.75-i*.08)*a,'lowpass',(near?1100:520)*(1-i*.1),55,.6,(near?.02:.15)+i*(.28+Math.random()*.55),.12+Math.random()*.25);
sn3O('sine',52,26,2.8+d/600,.35*a,.05,.1)});sn3Duck(.35,2.5)},'boom');
sn3Def('erupt',(d=800)=>{const a=clamp(1.3-d/1500,.2,1);sn3Side(rv(.4),()=>{sn3N(SN3.brown,3.5,.65*a,'lowpass',700,60,.6,0,.05);sn3O('sine',45,22,3,.5*a,0,.05);sn3N(SN3.crk,3,.3*a,'bandpass',1400,500,.6,.2,.4);sn3N(SN3.pink,2.5,.2*a,'lowpass',1800,200,.6,.1,.2)});sn3Duck(.4,2)},'boom');
// ----- interface : ramassage, pièces, achat, découverte, victoire, alarme, souffle -----
sn3Def('pick',()=>sn3U(()=>{sn3N(noiseBuf,.08,.1,'bandpass',800,4000,2.5);sn3O('sine',jit(1250),1900,.07,.05);sn3M(2650,.3,.025,.05)}));
sn3Def('coin',()=>sn3U(()=>{sn3O('sine',1760,1760,.16,.05);sn3O('sine',2637,2637,.32,.05,.08);for(const[dl,f]of[[0,2400],[.07,2750],[.13,2550]]){sn3M(jit(f,.03),.45,.028,dl,SN3R.coin);sn3N(noiseBuf,.012,.03,'highpass',7000,7000,.7,dl)}}));
sn3Def('buy',()=>sn3U(()=>{sn3N(noiseBuf,.025,.1,'bandpass',2400,1800,2);sn3O('triangle',660,660,.09,.06);sn3O('triangle',990,990,.22,.06,.07);sn3O('sine',1980,1980,.3,.02,.07);sn3M(2300,.4,.022,.14,SN3R.coin)}));
sn3Def('disc',()=>sn3U(()=>{[660,990,1320,1980].forEach((f,i)=>{sn3O('sine',f,f,1.7-i*.25,.065-i*.012,i*.08,.025);sn3O('sine',f*1.003,f*1.003,1.2-i*.2,.02,i*.08+.01,.03)});sn3N(noiseBuf,1.1,.025,'bandpass',6000,9500,5,.1,.35)},1));
sn3Def('win',()=>sn3U(()=>{[523,659,784,1047].forEach((f,i)=>sn3Bell(f,1.1,.042,i*.11));sn3Bell(1568,1.6,.02,.44);sn3N(noiseBuf,.9,.02,'bandpass',7000,9000,4,.4,.25)},1));
sn3Def('alarm',()=>sn3U(()=>{for(let k=0;k<2;k++){const d0=k*.3;sn3O('sawtooth',360,560,.26,.033,d0,.02,1500);sn3O('square',180,280,.26,.016,d0,.02,900)}}));
sn3Def('whoosh',()=>{const p=sn3Pan(-.6),n=AC.currentTime;try{p.pan.setValueAtTime(-.6,n);p.pan.linearRampToValueAtTime(.6,n+1)}catch(e){}p.connect(SN3.bus);setTimeout(()=>{try{p.disconnect()}catch(e){}},2500);
sn3Via(p,()=>{if(SN3.live>SN3.cap)return;const s=AC.createBufferSource(),f=sn3F('bandpass',350,1.1),g=sn3G(0);s.buffer=SN3.pink;s.loop=true;f.frequency.setValueAtTime(350,n);f.frequency.exponentialRampToValueAtTime(2300,n+.35);f.frequency.exponentialRampToValueAtTime(450,n+1.1);
g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(1.1,n+.3);g.gain.exponentialRampToValueAtTime(.0004,n+1.15);s.connect(f);f.connect(g);g.connect(p);sn3Cnt(s);s.start(n,Math.random()*2);s.stop(n+1.2);sn3O('sawtooth',65,190,.9,.06,0,.2,320)})});
// ----- nappes continues (créées à la demande, arrêtées après 5 s de silence) -----
function sn3Bed(k,mk,v,tc=.3){let b=SN3.A[k];const n=AC.currentTime,now=performance.now();if(!b){if(v<=1e-4)return null;try{b=SN3.A[k]=mk()}catch(e){return null}b.g.gain.value=0;b.z=0}
b.g.gain.setTargetAtTime(Math.max(0,v),n,tc);if(v<=1e-4){if(!b.z)b.z=now;else if(now-b.z>5000){try{b.stop()}catch(e){}delete SN3.A[k];return null}}else b.z=0;return b}
const sn3NB=(buf,ty,f,Q,r=1,dst)=>()=>{const s=sn3Loop(buf,r),fl=sn3F(ty,f,Q),g=sn3G(0);s.connect(fl);fl.connect(g);g.connect(dst||SN3.amb);return{g,f:fl,stop(){s.stop();g.disconnect()}}};
const sn3Osc=(ty,f)=>{const o=AC.createOscillator();o.type=ty;o.frequency.value=f;o.start();return o};
// moteur : grondement de combustion (pulsé), souffle de poussée, sifflement de turbine, infrabasse, vent sur la coque, postcombustion qui crépite
function sn3EngMk(){const g=sn3G(0),lp=sn3F('lowpass',9000,.5);g.connect(lp);lp.connect(SN3.ps);const L=[],src=(b,r)=>{const s=sn3Loop(b,r);L.push(s);return s},osc=(ty,f)=>{const o=sn3Osc(ty,f);L.push(o);return o};
const E={g,lp,stop(){for(const s of L)try{s.stop()}catch(e){}g.disconnect()}};
E.r=sn3G(0);E.rf=sn3F('lowpass',140,.9);src(SN3.brown).connect(E.rf);E.rf.connect(E.r);E.r.connect(g);E.lg=sn3G(0);E.lfo=osc('sine',10);E.lfo.connect(E.lg);E.lg.connect(E.r.gain);
E.h=sn3G(0);E.hf=sn3F('bandpass',900,.8);src(SN3.pink).connect(E.hf);E.hf.connect(E.h);E.h.connect(g);
E.w=sn3G(0);E.wo=osc('triangle',400);E.wo2=osc('sine',804);const w2=sn3G(.5);E.wo.connect(E.w);E.wo2.connect(w2);w2.connect(E.w);E.w.connect(g);
E.s=sn3G(0);E.so=osc('sine',40);E.so.connect(E.s);E.s.connect(g);
E.wd=sn3G(0);E.wf=sn3F('bandpass',600,.6);src(SN3.pink,.8).connect(E.wf);E.wf.connect(E.wd);E.wd.connect(g);
E.b=sn3G(0);E.bf=sn3F('lowpass',400,.7);src(SN3.brown,1.4).connect(E.bf);E.bf.connect(E.b);E.b.connect(g);
E.c=sn3G(0);E.cf=sn3F('bandpass',1300,.6);src(SN3.crk).connect(E.cf);E.cf.connect(E.c);E.c.connect(g);
E.bh=sn3G(0);const hh=sn3F('highpass',2200,.7);src(noiseBuf).connect(hh);hh.connect(E.bh);E.bh.connect(g);return E}
function sn3Engine(){const fly=!S.dead&&!S.docked&&(mode=='space'||mode=='surf')&&!(typeof FOOT!='undefined'&&FOOT.on)&&!(typeof H3!='undefined'&&H3.on)&&!(typeof MENU3!='undefined'&&MENU3.on);
const E=sn3Bed('eng',sn3EngMk,fly?1:0,.25);if(!E)return;const n=AC.currentTime,T=(p,v,tc=.12)=>p.setTargetAtTime(v,n,tc);
const v=clamp(S.spd/Math.max(1,cruise()),0,3),th=clamp(S.thr||0,0,2.6),tm=Math.min(th,1.4),ck=ckActive()?1:0,sp=S.hp/Math.max(1,maxhp())<.3&&Math.random()<.06?.25:1;
T(E.r.gain,(.018+.015*tm)*sp,.05);T(E.rf.frequency,70+45*th+25*v);T(E.lg.gain,.008);T(E.lfo.frequency,7+5*tm);T(E.h.gain,(.006+.012*tm)*sp);T(E.hf.frequency,450+380*th+220*v);
const wf=320+150*th+70*v;T(E.wo.frequency,wf,.2);T(E.wo2.frequency,wf*2.013,.2);T(E.w.gain,(.003+.005*tm)*(ck?1.4:1));T(E.so.frequency,34+9*tm);T(E.s.gain,(.008+.007*tm)*(ck?1.8:1));
T(E.wd.gain,mode=='surf'?clamp((v-.1)*.06,0,.14):0,.3);T(E.wf.frequency,280+520*v*(.8+.4*SN3.gust),.3);
const bo=fly&&isBoost()?1:0;if(bo&&!SN3.bo)sn3P(()=>{sn3N(SN3.brown,.7,.55,'lowpass',260,1800,.7,0,.03);sn3O('sine',68,32,.6,.28)});SN3.bo=bo;
T(E.b.gain,bo*.18,.15);T(E.bf.frequency,240+160*v);T(E.c.gain,bo*.05,.15);T(E.bh.gain,bo*.025,.15);T(E.lp.frequency,ck?1200:14000,.2)}
{const _bs=boostSound;boostSound=function(dt){if(!SN3.ok)return _bs(dt)}}
// laser : grésillement + sifflement, mise sous tension et coupure
{const _lz=lzSound;lzSound=function(on,h=0){_lz(on,h);if(!SN3.ok||!LZA||muted)return;if(!LZA.s3){LZA.s3=1;try{LZA.g.disconnect();LZA.g.connect(SN3.ps)}catch(e){}}
const b=sn3Bed('lz',()=>{const g=sn3G(0),f=sn3F('bandpass',4200,.8),s=sn3Loop(SN3.crk),w=sn3Osc('sine',2400),wg=sn3G(.25);s.connect(f);f.connect(g);w.connect(wg);wg.connect(g);g.connect(SN3.ps);return{g,w,stop(){s.stop();w.stop();g.disconnect()}}},on?.06:0,.03);
if(b&&on)b.w.frequency.setTargetAtTime(2200+h*1600,AC.currentTime,.1);
if(on&&!SN3.lzOn)sn3P(()=>{sn3O('sine',300,1900,.12,.04);sn3N(noiseBuf,.1,.08,'bandpass',1200,5000,2)});if(!on&&SN3.lzOn)sn3P(()=>{sn3O('sine',1100,140,.3,.035);sn3N(SN3.pink,.25,.05,'bandpass',2500,600,1)});SN3.lzOn=on?1:0}}
// ----- ambiances -----
const SN3W={Désertique:[.05,450],Glacée:[.055,700],Volcanique:[.03,380],Jungle:[.018,420],Océanique:[.045,520],Cristalline:[.035,600]};
function sn3HumMk(){const g=sn3G(0),f=sn3F('lowpass',420,.7),o1=sn3Osc('sawtooth',50),o2=sn3Osc('sine',100.4),o3=sn3Osc('sine',150),g3=sn3G(.3);o1.connect(f);o2.connect(f);o3.connect(g3);g3.connect(f);f.connect(g);g.connect(SN3.amb);return{g,stop(){for(const o of[o1,o2,o3])o.stop();g.disconnect()}}}
function sn3WeldMk(){const g=sn3G(0),p=sn3Pan(0),s=sn3Loop(SN3.crk),f=sn3F('bandpass',3200,.7),o=sn3Osc('sawtooth',100),bf=sn3F('bandpass',1700,3),gb=sn3G(.25);s.connect(f);f.connect(g);o.connect(bf);bf.connect(gb);gb.connect(g);g.connect(p);p.connect(SN3.bus);return{g,p,stop(){s.stop();o.stop();g.disconnect();p.disconnect()}}}
function sn3DroneMk(){const g=sn3G(0),p=sn3Pan(0),o1=sn3Osc('sawtooth',175),o2=sn3Osc('sine',352),f=sn3F('lowpass',900,.8);o1.connect(f);o2.connect(f);f.connect(g);g.connect(p);p.connect(SN3.bus);return{g,p,stop(){o1.stop();o2.stop();g.disconnect();p.disconnect()}}}
const sn3Srf=()=>mode=='surf'&&typeof GR!='undefined'&&GR&&GR.F&&GR.F.h?GR.F:null;
const sn3Cave=()=>DER.on&&(DER.on.cave||DER.on.q&&DER.on.q.cave);
function sn3StDist(cp){let dm=1e9;for(const s of stations){if(s.ground)continue;const d=Math.hypot(s.x-cp.x,s.y-cp.y,s.z-cp.z);if(d<dm)dm=d}return dm}
function sn3Amb(dt){const cam=sn3Cam(),cp=cam.position,foot=typeof FOOT!='undefined'&&FOOT.on,hang=typeof H3!='undefined'&&H3.on,menu=typeof MENU3!='undefined'&&MENU3.on;
SN3.gT-=dt;if(SN3.gT<=0){SN3.gT=1.5+Math.random()*4;SN3.gW=Math.random()}SN3.gust+=(SN3.gW-SN3.gust)*Math.min(1,dt*.6);const gu=SN3.gust;
// jetpack (à pied ou dans une épave) : le carburant baisse en l'air
const jf=foot?FOOT.fuel:mode=='int'&&DER.on?DER.fuel:1,air=foot?!FOOT.grounded:mode=='int'&&DER.on?!DER.grounded:false;SN3.jt=lerp(SN3.jt,air&&jf<SN3.jf-1e-6?1:0,Math.min(1,dt*12));SN3.jf=jf;
SN3.at-=dt;if(SN3.at>0)return;SN3.at=.1;const n=AC.currentTime;
let w=0,wf=500,hw=0,hf=700,rn=0,dr=0,lo=0,lf=90,se=0,sw=0,lv=0,ve=0,vf=1400,hu=0,sa=.1,sb=.04;
if(hang){hu=.022;lo=.018;ve=.018;vf=1100;sa=.35;sb=.18}
else if(mode=='int'&&DER.on){if(sn3Cave()){lo=.03;lf=70;w=.016*(.5+gu);wf=260;sa=.15;sb=.6}else{lo=.035;lf=80;ve=.01*(.6+gu);vf=1900;hu=Math.random()<.97?.006:.001;sa=.4;sb=.25}}
else if(mode=='surf'){sa=.05;sb=.1;const F=sn3Srf();if(F){const ty=F.ty,st=F.storm||0,wx=F.wx,hg=Math.max(0,cp.y-F.h(cp.x,cp.z)),alt=1+clamp(hg/180,0,1)*.7,cfg=SN3W[ty]||[.035,500];
w=(cfg[0]*(.55+.9*gu)+st*(wx=='pluie'?.04:.08))*alt;wf=cfg[1]*(.75+.5*gu)+st*250;if(ty=='Glacée'||(wx=='sable'&&st>.4)){hw=(ty=='Glacée'?.012+.03*st:.025*st)*(.4+gu);hf=550+gu*450}
if(wx=='pluie'){rn=st*.1;dr=st*.07}else if(wx=='sable')rn=st*.035;
// eau / lave à proximité : on sonde le relief autour de l'auditeur
SN3.wT-=.1;if(SN3.wT<=0){SN3.wT=.5;let k=0,m=0;for(const r of[18,45,100])for(let i=0;i<8;i++){const a=i/8*TAU+r;m++;if(F.h(cp.x+Math.cos(a)*r,cp.z+Math.sin(a)*r)<0)k++}const lw=k/m*clamp(1-hg/220,0,1);SN3.lav=ty=='Volcanique'?lw:0;SN3.wat=ty=='Volcanique'?0:lw}
const wave=.5+.5*Math.sin(t*.85+Math.sin(t*.23)*2.2);se=SN3.wat*(.03+.06*wave);sw=SN3.wat*.035*wave*wave*wave;lv=SN3.lav*.09;lo=ty=='Volcanique'?.025:.006;SN3.wave=wave}}
else if(mode=='space'&&!S.dead){lo=.007;const dm=sn3StDist(cp);if(dm<2200)hu=.02*(1-dm/2200);if(ckActive()){hu+=.004;ve=.005;vf=900;sa=.16;sb=.02}}
if(menu){w=hw=rn=dr=se=sw=lv=ve=hu=0;lo=.006}
const B=sn3Bed;let b;
b=B('wind',sn3NB(SN3.pink,'bandpass',500,.7),w*3,.5);if(b)b.f.frequency.setTargetAtTime(wf,n,.6);
b=B('howl',sn3NB(SN3.pink,'bandpass',700,6,.7),hw*6,.6);if(b)b.f.frequency.setTargetAtTime(hf,n,.9);
B('rain',sn3NB(noiseBuf,'highpass',900,.6),rn*.5,.6);B('drops',sn3NB(SN3.crk,'bandpass',2600,.7,1.3),dr*10,.6);
b=B('low',sn3NB(SN3.brown,'lowpass',90,.7),lo,.8);if(b)b.f.frequency.setTargetAtTime(lf,n,.5);
b=B('sea',sn3NB(SN3.brown,'lowpass',500,.6),se*.6,.25);if(b)b.f.frequency.setTargetAtTime(260+700*(SN3.wave||.5),n,.3);B('wash',sn3NB(noiseBuf,'bandpass',2600,.5),sw,.25);
B('lava',sn3NB(SN3.brown,'lowpass',140,1,.6),lv*.5,.5);b=B('vent',sn3NB(SN3.pink,'bandpass',1400,.6),ve*3,.5);if(b)b.f.frequency.setTargetAtTime(vf*(.85+.3*gu),n,.8);
B('hum',sn3HumMk,hu*.25,.4);B('jet',sn3NB(noiseBuf,'bandpass',1100,.6,1,SN3.bus),SN3.jt*.07,.06);B('jetl',sn3NB(SN3.brown,'lowpass',260,.7,1,SN3.bus),SN3.jt*.04,.06);
// hangar : poste de soudure et drone, placés là où ils sont
if(hang&&H3.wl&&H3.cam){const r=sn3Rel(H3.wl.position,H3.cam);b=B('weld',sn3WeldMk,H3.wl.intensity>0?sn3Att(r.d,6)*(.5+Math.random()*.8)*.42:0,.03);if(b&&b.p.pan)b.p.pan.setTargetAtTime(r.pan*.8,n,.1)}else B('weld',sn3WeldMk,0);
if(hang&&H3.dr&&H3.cam){const r=sn3Rel(H3.dr.position,H3.cam);b=B('drone',sn3DroneMk,.006*sn3Att(r.d,6),.2);if(b&&b.p.pan)b.p.pan.setTargetAtTime(r.pan*.8,n,.2)}else B('drone',sn3DroneMk,0);
// réverbération du lieu, étouffement (cockpit, ralenti, mort)
SN3.sA.gain.setTargetAtTime(sa,n,.3);SN3.sB.gain.setTargetAtTime(sb,n,.3);const ck=ckActive()&&!foot&&!hang;SN3.amb.frequency.setTargetAtTime(ck?1100:20000,n,.2);SN3.ps.frequency.setTargetAtTime(ck?3200:20000,n,.2);
SN3.mlp.frequency.setTargetAtTime(S.dead?500:(window.TSCALE||1)<.85?800:20000,n,.15)}
// ----- bruits ponctuels de l'environnement -----
function sn3Bird(p){sn3At(p,25,3,()=>{const m=2+(Math.random()*5|0),f0=2200+Math.random()*2400,sp=.07+Math.random()*.07,up=Math.random()<.5;let dl=0;for(let i=0;i<m;i++){const f=f0*(1+(Math.random()-.5)*.25),d=.05+Math.random()*.08,a=up?f*.8:f*1.25,z=up?f*1.3:f*.75;sn3O('sine',a,z,d,.035,dl,.006);sn3O('sine',a*2,z*2,d*.7,.006,dl,.006);dl+=d+sp*(Math.random()<.2?3:1)}})}
function sn3Gull(p){sn3At(p,40,3,()=>{const m=2+(Math.random()*2|0);for(let i=0;i<m;i++){const dl=i*.32,f=jit(1300,.1);sn3O('sawtooth',f,f*1.35,.12,.024,dl,.01,2600);sn3O('sawtooth',f*1.35,f*.85,.22,.028,dl+.12,.01,2600);sn3O('sine',f*2,f*1.7,.3,.012,dl,.02)}})}
function sn3Hawk(p){sn3At(p,60,3,()=>{sn3O('sawtooth',jit(2600),1700,1.1,.01,0,.08,3200);sn3O('sine',2600,1750,1.1,.012,0,.08)})}
function sn3Cricket(p){sn3At(p,12,2,()=>{const f=4200+Math.random()*900,nb=2+(Math.random()*3|0);for(let b=0;b<nb;b++)for(let i=0;i<4;i++)sn3O('sine',f,f*.98,.018,.035,b*.32+i*.034,.003)})}
function sn3Frog(p){sn3At(p,20,2,()=>{for(let i=0;i<2;i++)sn3O('sawtooth',jit(170),jit(140),.16,.03,i*.24,.01,700)})}
function sn3Bubble(p){sn3At(p,25,2,()=>{const f=jit(70,.3);sn3O('sine',f,f*2.4,.12,.09,0,.01);sn3N(SN3.brown,.35,.12,'lowpass',380,90,.8,.05,.02);if(Math.random()<.4)sn3N(SN3.crk,.4,.08,'bandpass',1500,700,.7,.1,.05)})}
function sn3Rumble(){sn3Side(rv(.5),()=>{sn3N(SN3.brown,2.5,.1,'lowpass',160,50,.7,0,.5);sn3O('sine',38,30,2.2,.05,0,.6)})}
// glace qui craque : le « piou » dispersif des lacs gelés
function sn3Ice(p){sn3At(p,60,3,()=>{sn3N(SN3.crk,.25,.4,'highpass',2400,1800,.7);sn3O('sine',jit(3200),220,.45,.05,.01,.002);sn3O('sine',jit(2100),160,.6,.03,.03,.002);sn3N(SN3.brown,.8,.2,'lowpass',300,60,.7,.02,.05)})}
function sn3Chime(p){sn3At(p,15,3,()=>{const f=jit(2200+Math.random()*2400,.05),m=1+(Math.random()*3|0);for(let i=0;i<m;i++)sn3M(f*(1+i*.19),1.4,.008,i*(.08+Math.random()*.15),SN3R.bell)})}
function sn3Drip(p){sn3At(p,10,2,()=>{const f=jit(900,.3);sn3O('sine',f,f*2.6,.045,.18,0,.002);sn3N(noiseBuf,.02,.09,'bandpass',f*2,f*2.5,3)})}
function sn3Clank(p){sn3At(p,15,2.5,()=>{sn3M(jit(200+Math.random()*350,.1),.9,.05,0,SN3R.plate);sn3O('sine',jit(110),55,.12,.12);sn3N(noiseBuf,.03,.1,'bandpass',2800,2000,1.2);if(Math.random()<.4)sn3M(jit(400),.5,.025,.15+Math.random()*.15,SN3R.plate)})}
function sn3Hiss(p){sn3At(p,15,2,()=>{sn3N(noiseBuf,.9+Math.random()*.8,.06,'highpass',3000,2400,.7,0,.03);sn3N(SN3.pink,.3,.03,'bandpass',800,400,.8,0,.01)})}
function sn3Wrench(p){sn3At(p,15,2,()=>{const m=3+(Math.random()*4|0);for(let i=0;i<m;i++){sn3O('sawtooth',jit(55),50,.09,.03,i*.11,.003,900);sn3N(noiseBuf,.05,.05,'bandpass',2200,1500,1.5,i*.11)}})}
function sn3Bang(p){sn3At(p,30,4,()=>{sn3M(jit(120,.2),1.8,.04,0,SN3R.plate);sn3N(SN3.brown,.8,.18,'lowpass',600,80,.7);sn3O('sine',60,35,.4,.09)})}
// radio : voix hachée filtrée, souffle, bips de début et de fin
function sn3Radio(v=.5,stat){sn3U(()=>{if(SN3.live>SN3.cap)return;const n0=AC.currentTime,L=.8+Math.random()*1.2,bp=sn3F('bandpass',1500,1.4),g=sn3G(0),o=AC.createOscillator();o.type='sawtooth';let x=.05;o.frequency.setValueAtTime(140,n0);g.gain.setValueAtTime(0,n0);
while(x<L){o.frequency.setValueAtTime(110+Math.random()*90,n0+x);g.gain.setTargetAtTime(Math.random()<.2?0:.02*v*(.5+Math.random()*.5),n0+x,.015);bp.frequency.setValueAtTime(900+Math.random()*1400,n0+x);x+=.06+Math.random()*.14}g.gain.setTargetAtTime(0,n0+L,.02);
o.connect(bp);bp.connect(g);g.connect(sn3Dst());sn3Cnt(o);o.start(n0);o.stop(n0+L+.15);sn3N(noiseBuf,L+.1,.02*v*(stat?2:1),'bandpass',2200,2200,.9,0,.02);sn3N(noiseBuf,.04,.06*v,'highpass',3000,3000,.7);sn3N(noiseBuf,.05,.07*v,'highpass',3000,3000,.7,L+.05);sn3O('sine',1800,1800,.06,.02*v,L+.12)})}
function sn3PA(){sn3U(()=>{sn3Bell(784,1.2,.018);sn3Bell(622,1.6,.018,.38)},1);setTimeout(()=>{if(H3.on)sn3Radio(.6)},1400)}
function sn3Ev(dt){SN3.ev-=dt;if(SN3.ev>0)return;SN3.ev=2+Math.random()*4;const cp=sn3Cam().position,rp=(r0,r1,hy=0)=>{const a=Math.random()*TAU,r=r0+Math.random()*(r1-r0);return new V3(cp.x+Math.cos(a)*r,cp.y+hy+rv(2),cp.z+Math.sin(a)*r)};
if(typeof MENU3!='undefined'&&MENU3.on)return;
if(H3.on){const r=Math.random();if(r<.35)sn3Clank(rp(10,30));else if(r<.55)sn3Hiss(rp(8,25));else if(r<.7)sn3Wrench(rp(10,25));else if(r<.82&&t-SN3.pa>25){SN3.pa=t;sn3PA()}else sn3Radio(.5);return}
if(mode=='int'&&DER.on){if(sn3Cave()){SN3.ev=3+Math.random()*5;sn3Drip(rp(4,16,-1))}else{SN3.ev=5+Math.random()*9;Math.random()<.6?sn3Bang(rp(20,40)):sn3Radio(.25,1)}return}
if(mode=='surf'){const F=sn3Srf();if(!F)return;if(!(FOOT.on||S.docked||S.spd<70))return;const st=F.storm||0,ty=F.ty;
if(ty=='Volcanique'){SN3.ev=3+Math.random()*6;if(SN3.lav>.05&&Math.random()<.8)sn3Bubble(rp(15,60,-3));else sn3Rumble();return}
if(ty=='Glacée'){SN3.ev=4+Math.random()*9;if(Math.random()<.45)sn3Ice(rp(20,90,-3));return}
if(ty=='Cristalline'){SN3.ev=1.5+Math.random()*3;sn3Chime(rp(8,40));return}
if(st>.65)return;// les animaux se taisent pendant la tempête
if(DN.night>.5){SN3.ev=1+Math.random()*2.5;sn3Cricket(rp(6,30,-1));if(ty=='Jungle'&&Math.random()<.3)sn3Frog(rp(10,40,-1))}
else if(DN.day>.4){if(ty=='Jungle'){SN3.ev=.8+Math.random()*2.5;sn3Bird(rp(15,60,8))}else if(ty=='Océanique'){SN3.ev=3+Math.random()*6;SN3.wat>.05?sn3Gull(rp(30,90,25)):sn3Bird(rp(15,60,8))}else if(ty=='Désertique'){SN3.ev=8+Math.random()*12;sn3Hawk(rp(60,140,60))}}return}
if(mode=='space'&&!S.docked&&!S.dead){SN3.ev=5+Math.random()*8;if(sn3StDist(cp)<1600&&Math.random()<.35)sn3Radio(.35)}}
// ----- bruits de pas selon le sol (sable, neige, herbe, roche, cristal, métal, eau), atterrissage -----
const SN3K={Désertique:'sand',Glacée:'snow',Jungle:'grass',Océanique:'sand',Volcanique:'rock',Cristalline:'crystal'};
function sn3Step(kind,v,side,land){sn3Side(side?.12:-.12,()=>{const a=v*(land?1.4:1)*(.85+Math.random()*.3)*(kind=='metal'?1.8:2.5),W=noiseBuf;
if(kind=='sand'){sn3N(SN3.pink,.16,.09*a,'bandpass',jit(1100,.2),700,.7,0,.02);sn3N(SN3.crk,.14,.12*a,'bandpass',2600,1800,.7,.01,.02);sn3O('sine',90,55,.06,.06*a)}
else if(kind=='snow'){sn3N(SN3.crk,.2,.22*a,'bandpass',jit(2200,.2),1500,.9,0,.03);sn3N(SN3.pink,.18,.06*a,'highpass',1500,1200,.7,0,.03);sn3O('sine',80,50,.06,.05*a)}
else if(kind=='grass'){sn3N(SN3.pink,.14,.07*a,'highpass',jit(2400,.2),1800,.7,0,.02);sn3N(SN3.crk,.1,.06*a,'bandpass',1800,1200,.7);sn3O('sine',85,50,.07,.07*a)}
else if(kind=='water'){sn3N(W,.22,.12*a,'bandpass',jit(1400,.2),500,.9,0,.01);for(let i=0;i<2;i++){const f=jit(700+Math.random()*700,.1);sn3O('sine',f,f*1.6,.05,.03*a,.03+i*.05)}}
else if(kind=='metal'){sn3M(jit(330,.12),.22,.035*a,0,SN3R.plate);sn3O('sine',120,60,.05,.12*a);sn3N(W,.03,.08*a,'bandpass',3000,2500,1.2)}
else if(kind=='crystal'){sn3O('sine',100,60,.05,.09*a);sn3N(SN3.crk,.07,.1*a,'bandpass',3500,2500,1);sn3M(jit(2600,.3),.3,.008*a,0,SN3R.bar)}
else{sn3O('sine',jit(110),55,.05,.1*a);sn3N(SN3.crk,.08,.12*a,'bandpass',jit(1800,.25),1100,.8);sn3N(W,.025,.06*a,'bandpass',2600,1800,1)}})}
function sn3Steps(){let ph=null,gr=true,kind='rock',hs=0;
if(mode=='surf'&&FOOT.on){const F=sn3Srf();ph=FOOT.ph;gr=FOOT.grounded;hs=Math.hypot(FOOT.vel.x,FOOT.vel.z);kind=F&&F.onLiq?'water':GR.pad&&Math.hypot(FOOT.pos.x-GR.pad.x,FOOT.pos.z-GR.pad.z)<24&&FOOT.pos.y>=GR.pad.y-.2?'metal':F&&SN3K[F.ty]||'rock'}
else if(mode=='int'&&DER.on){ph=DER.ph;gr=DER.grounded;hs=Math.hypot(DER.vel.x,DER.vel.z);kind=sn3Cave()?'rock':'metal'}
else if(H3.on&&typeof WK3!='undefined'&&WK3.on){ph=WK3.ph;hs=Math.hypot(WK3.vel.x,WK3.vel.z);kind='metal'}
if(ph==null){SN3.fk=null;SN3.gr=true;return}const k=Math.floor(ph/Math.PI);
if(SN3.fk!=null&&k!=SN3.fk&&gr&&hs>.6)sn3Step(kind,Math.min(1,hs/7),k&1);if(gr&&SN3.gr===false)sn3Step(kind,1,0,1);SN3.fk=k;SN3.gr=gr}
// ----- passages rapides d'ennemis tout près (souffle + moteur qui baisse, effet Doppler) -----
function sn3Fly(p,big){sn3At(p,40,2,()=>{sn3N(SN3.pink,.8,.35,'bandpass',2600,450,.9,0,.04);const f=big?120:230;sn3O('sawtooth',f*1.15,f*.75,.7,.035,0,.03,1400);sn3N(SN3.brown,.6,.25,'lowpass',500,120,.7,0,.04)})}
STICK.push(dt=>{if(!SN3.ok||muted||dt<=0)return;SN3.fbc-=dt;const cp=camera.position;for(const e of en){if(e.dead||!e.pos)continue;const d=e.pos.distanceTo(cp);if(e.sn3d!=null){const cs=(e.sn3d-d)/dt;if(cs>40&&d<160)e.sn3a=1;else if(e.sn3a&&cs<-3){e.sn3a=0;if(d<220&&SN3.fbc<=0){SN3.fbc=.3;sn3Fly(e.pos,e.boss||e.ty=='lourd')}}}e.sn3d=d}});
TICK.push(dt=>{if(!AC||!SN3.ok||AC.state!='running')return;if(muted){SN3.at=0;return}sn3Engine();sn3Amb(dt);sn3Ev(dt);sn3Steps();if(!SN3.lzOn&&SN3.A.lz)sn3Bed('lz',null,0)});
// ----- musique d'ambiance : nappes chaudes (scies désaccordées filtrées), cloches qui résonnent dans l'écho -----
{const _mus=music;music=function(){try{sn3Init();if(!SN3.ok)return _mus();const prog=[[220,261.6,329.6],[174.6,220,261.6],[196,246.9,293.7],[164.8,207.7,246.9]];let i=0;const mg=sn3G(.02);mg.connect(getMV());
const play=()=>{const ch=prog[i++%4];if(muted||AC.state!='running')return;const n=AC.currentTime,fl=sn3F('lowpass',260,1.1),pg=sn3G(0);fl.frequency.setValueAtTime(260,n);fl.frequency.linearRampToValueAtTime(1100,n+4);fl.frequency.linearRampToValueAtTime(420,n+9);
pg.gain.setValueAtTime(0,n);pg.gain.linearRampToValueAtTime(.13,n+2.8);pg.gain.setValueAtTime(.13,n+6);pg.gain.linearRampToValueAtTime(0,n+9.2);fl.connect(pg);pg.connect(mg);const ws=sn3G(.35);pg.connect(ws);ws.connect(SN3.mrv);
ch.forEach(f=>{for(const dt of[-7,7]){const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=f;o.detune.value=dt+(Math.random()-.5)*4;o.connect(fl);o.start(n);o.stop(n+9.4)}const s=AC.createOscillator(),sg=sn3G(.6);s.type='sine';s.frequency.value=f/2;s.connect(sg);sg.connect(fl);s.start(n);s.stop(n+9.4)});
for(let k=0;k<4;k++){const f=ch[Math.random()*3|0]*(Math.random()<.5?2:4),s=n+1+k*1.7+Math.random()*.5;for(const[r,a,dd]of[[1,.22,1.8],[2.756,.05,.6],[5.4,.02,.3]]){const o=AC.createOscillator(),g=sn3G(0);o.type='sine';o.frequency.value=f*r;g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(a,s+.01);g.gain.exponentialRampToValueAtTime(.001,s+dd);o.connect(g);g.connect(mg);const e=sn3G(.6);g.connect(e);e.connect(SN3.mrv);o.start(s);o.stop(s+dd+.05)}}};
play();setInterval(play,8000)}catch(e){console.warn('snd3 music',e)}}}
// ----- musique de combat : batterie et basse plus réalistes, écho sur les arpèges -----
function mu3o(tm,f1,f2,dur,ty,vol,lp,wet){const o=AC.createOscillator(),g=sn3G(0);o.type=ty;o.frequency.setValueAtTime(f1,tm);if(f2!=f1)o.frequency.exponentialRampToValueAtTime(f2,tm+dur);g.gain.setValueAtTime(0,tm);g.gain.linearRampToValueAtTime(vol,tm+.004);g.gain.exponentialRampToValueAtTime(.001,tm+dur);
let x=o;if(lp){const f=sn3F('lowpass',lp,.7);o.connect(f);x=f}x.connect(g);g.connect(MUS.bus);if(wet&&SN3.mrv){const w=sn3G(wet);g.connect(w);w.connect(SN3.mrv)}o.start(tm);o.stop(tm+dur+.02)}
function mu3n(tm,dur,vol,ty,f,Q=.7,wet){const s=AC.createBufferSource(),fl=sn3F(ty,f,Q),g=AC.createGain();s.buffer=noiseBuf;g.gain.setValueAtTime(vol,tm);g.gain.exponentialRampToValueAtTime(.001,tm+dur);s.connect(fl);fl.connect(g);g.connect(MUS.bus);if(wet&&SN3.mrv){const w=sn3G(wet);g.connect(w);w.connect(SN3.mrv)}s.start(tm,Math.random());s.stop(tm+dur+.02)}
function mu3Bass(tm,f,I){const o=AC.createOscillator(),o2=AC.createOscillator(),fl=sn3F('lowpass',200,4),g=sn3G(0);o.type='sawtooth';o2.type='square';o.frequency.value=f;o2.frequency.value=f/2;fl.frequency.setValueAtTime(260+I*1600,tm);fl.frequency.exponentialRampToValueAtTime(180,tm+.2);
g.gain.setValueAtTime(0,tm);g.gain.linearRampToValueAtTime(.15,tm+.005);g.gain.exponentialRampToValueAtTime(.001,tm+.24);const g2=sn3G(.5);o.connect(fl);o2.connect(g2);g2.connect(fl);fl.connect(g);g.connect(MUS.bus);o.start(tm);o2.start(tm);o.stop(tm+.26);o2.stop(tm+.26)}
{const _mt=musTick;musTick=function(){if(!SN3.ok)return _mt();if(!AC||AC.state!='running')return;MUS.I+=(MUS.tg-MUS.I)*.04;MUS.bus.gain.setTargetAtTime(muted?0:MUS.I*.55,AC.currentTime,.3);if(MUS.I<.02){MUS.next=AC.currentTime+.05;return}
const spb=60/128/4;while(MUS.next<AC.currentTime+.12){const st=MUS.step%16,bar=Math.floor(MUS.step/16)%4,tm=MUS.next,I=MUS.I;
if(st%4==0){mu3o(tm,165,44,.32,'sine',.55);mu3n(tm,.012,.18,'highpass',2500)}
if(st==4||st==12){mu3n(tm,.18,.26,'bandpass',1900,.8,.25);mu3n(tm,.1,.08,'highpass',5500);mu3o(tm,205,165,.09,'triangle',.12)}
if(st%2==1&&I>.35){const op=st%8==7&&I>.7;mu3n(tm,op?.14:.035,op?.08:.11,'highpass',7800,.9)}
if(st%2==0){const nn=[0,0,12,0,7,0,12,10][st/2%8];mu3Bass(tm,ROOT[bar]*Math.pow(2,nn/12),I)}
if(I>.6){const c=CH[bar],f=c[st%3]*(st%8<4?2:4);mu3o(tm,f,f,.16,'triangle',.045,0,.5)}
if(I>.9&&st%8==0)for(const f of CH[bar])mu3o(tm,f,f,.5,'square',.03,1600,.4);
if(st==0&&bar==0&&I>.5)mu3n(tm,1.6,.07,'highpass',5000,.7,.3);
MUS.step++;MUS.next+=spb}}}
// ----- appli en arrière-plan : le son se coupe, et reprend au retour (iPhone : aussi après une interruption) -----
const sn3Q=p=>{if(p&&p.catch)p.catch(()=>{})};
document.addEventListener('visibilitychange',()=>{if(!AC)return;try{sn3Q(document.hidden?AC.suspend():AC.resume())}catch(e){}});
for(const ev of['pointerdown','touchend','keydown'])addEventListener(ev,()=>{if(AC&&AC.state!='running'&&AC.state!='closed'&&!document.hidden)try{sn3Q(AC.resume())}catch(e){}},true);
