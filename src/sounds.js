// ===== SONS : rugissement du boost, armes selon les canons, missiles, explosions =====
// bruit filtré avec balayage de fréquence (type : lowpass / bandpass / highpass)
function nzf(dur,vol,f0,f1,type='lowpass',Q=1,delay=0){if(!AC||muted)return;const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),n=AC.currentTime+delay;s.buffer=noiseBuf;f.type=type;f.Q.value=Q;f.frequency.setValueAtTime(f0,n);f.frequency.exponentialRampToValueAtTime(Math.max(30,f1),n+dur);
g.gain.setValueAtTime(.0001,n);g.gain.exponentialRampToValueAtTime(vol,n+Math.min(.012,dur*.2));g.gain.exponentialRampToValueAtTime(.001,n+dur);s.connect(f);f.connect(g);g.connect(master);s.start(n,Math.random()*1.5);s.stop(n+dur+.05)}
const jit=(v,k=.06)=>v*(1+(Math.random()-.5)*k*2);
// tirs du joueur : un son différent pour chaque type de canon
SFX.shoot=()=>{const g=(G.parts&&G.parts.guns)||'std';
if(g=='lourds'){tone(jit(520),85,.2,'square',.05);tone(jit(130),38,.26,'sine',.16);nzf(.16,.22,2400,200,'lowpass',.7)}
else if(g=='rotatifs'){tone(jit(980,.1),420,.05,'square',.026);nzf(.04,.1,6000,2000,'bandpass',1.2)}
else if(g=='plasma'){tone(jit(260),980,.13,'sawtooth',.03);tone(jit(1900),520,.12,'sine',.04);nzf(.1,.07,5000,1500,'bandpass',2)}
else if(g=='jumeles'){tone(jit(1500),330,.09,'square',.03);tone(jit(1350),300,.09,'square',.024,.035);nzf(.05,.08,7000,2500,'highpass',.8)}
else{tone(jit(1400),300,.1,'square',.033);tone(jit(2700),900,.05,'sine',.028);nzf(.05,.08,7000,2500,'highpass',.8)}};
SFX.eshoot=()=>{tone(jit(460,.1),120,.18,'sawtooth',.03);nzf(.1,.05,3000,600,'bandpass',1.5)};
SFX.missile=()=>{nzf(.7,.26,900,4200,'bandpass',.9);tone(jit(180),70,.45,'sawtooth',.05);nzf(.25,.12,6000,1200,'highpass',.7)};
SFX.mine=()=>{tone(220,110,.12,'square',.05);tone(90,60,.18,'sine',.12);nzf(.08,.1,2500,500)};
SFX.boom=()=>{nzf(1.1,.6,1600,60,'lowpass',.8);tone(jit(95),28,.9,'sine',.38);nzf(.35,.25,7000,900,'highpass',.6,.03);nzf(.6,.18,500,80,'lowpass',1,.12)};
SFX.rock=()=>{nzf(.5,.4,1200,90,'lowpass',.9);tone(70,35,.35,'triangle',.15);nzf(.2,.15,4000,800,'bandpass',1,.05)};
SFX.mineTick=()=>{tone(jit(1800,.15),1200,.03,'square',.02);nzf(.03,.05,8000,4000,'highpass',1)};
// rugissement continu du boost : souffle filtré + grondement grave + sifflement de turbine
let BST=null;
function boostSound(dt){if(!AC)return;if(!BST){try{const src=AC.createBufferSource();src.buffer=noiseBuf;src.loop=true;const bp=AC.createBiquadFilter();bp.type='bandpass';bp.Q.value=.7;bp.frequency.value=500;const gN=AC.createGain();gN.gain.value=0;src.connect(bp);bp.connect(gN);gN.connect(master);src.start();
const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=48;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=160;const gR=AC.createGain();gR.gain.value=0;o.connect(lp);lp.connect(gR);gR.connect(master);o.start();
const w=AC.createOscillator();w.type='sine';w.frequency.value=900;const gW=AC.createGain();gW.gain.value=0;w.connect(gW);gW.connect(master);w.start();BST={bp,gN,o,gR,w,gW,k:0}}catch(e){return}}
const on=isBoost()&&!S.docked&&!S.dead&&!(typeof FOOT!='undefined'&&FOOT.on)?1:0;BST.k=lerp(BST.k,on,damp(on?2.6:1.8,dt));const k=BST.k,n=AC.currentTime,sp=S.spd||0;
BST.gN.gain.setTargetAtTime(k*.2,n,.05);BST.bp.frequency.setTargetAtTime(380+sp*1.1+Math.sin(t*23)*40,n,.08);BST.gR.gain.setTargetAtTime(k*.16,n,.05);BST.o.frequency.setTargetAtTime(44+sp*.03,n,.1);BST.gW.gain.setTargetAtTime(k*.018,n,.05);BST.w.frequency.setTargetAtTime(700+sp*2.2,n,.1)}
