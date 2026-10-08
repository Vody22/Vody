// ===== AUDIO =====
let AC=null,master,engG,engLP,noiseBuf,muted=false;
function audioInit(){
if(AC){if(AC.state=='suspended')AC.resume();return}
try{AC=new(window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=.5;master.connect(AC.destination);
noiseBuf=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
const src=AC.createBufferSource();src.buffer=noiseBuf;src.loop=true;engLP=AC.createBiquadFilter();engLP.type='lowpass';engLP.frequency.value=250;engG=AC.createGain();engG.gain.value=0;src.connect(engLP);engLP.connect(engG);engG.connect(master);src.start();
music()}catch(e){AC=null}}
addEventListener('pointerdown',audioInit,true);addEventListener('keydown',audioInit,true);addEventListener('touchend',audioInit,true);
$('snd').onclick=()=>{muted=!muted;$('snd').textContent=muted?'🔇':'🔊';if(master)master.gain.value=muted?0:.5};
function tone(f,f2,dur,type,vol,delay=0){if(!AC||muted)return;const o=AC.createOscillator(),g=AC.createGain(),n=AC.currentTime+delay;o.type=type;o.frequency.setValueAtTime(f,n);o.frequency.exponentialRampToValueAtTime(f2,n+dur);g.gain.setValueAtTime(vol,n);g.gain.exponentialRampToValueAtTime(.001,n+dur);o.connect(g);g.connect(master);o.start(n);o.stop(n+dur+.02)}
function noise(dur,vol,freq){if(!AC||muted)return;const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),n=AC.currentTime;s.buffer=noiseBuf;f.type='lowpass';f.frequency.setValueAtTime(freq,n);f.frequency.exponentialRampToValueAtTime(60,n+dur);g.gain.setValueAtTime(vol,n);g.gain.exponentialRampToValueAtTime(.001,n+dur);s.connect(f);f.connect(g);g.connect(master);s.start(n,Math.random());s.stop(n+dur)}
const SFX={
shoot:()=>tone(900,280,.12,'square',.05),
eshoot:()=>tone(420,140,.16,'sawtooth',.035),
tick:()=>noise(.07,.12,2500),
hit:()=>{noise(.18,.3,1800);tone(200,80,.15,'square',.05)},
rock:()=>noise(.4,.35,900),
boom:()=>{noise(.8,.55,1400);tone(130,35,.6,'sine',.35)},
pick:()=>tone(1200,1900,.06,'sine',.06),
coin:()=>{tone(880,880,.1,'triangle',.12);tone(1320,1320,.2,'triangle',.12,.09)},
buy:()=>tone(500,1200,.18,'triangle',.1),
disc:()=>{tone(660,660,.3,'sine',.12);tone(990,990,.5,'sine',.1,.15)},
win:()=>[523,659,784,1047].forEach((f,i)=>tone(f,f,.3,'triangle',.12,i*.11)),
alarm:()=>{tone(300,600,.25,'sawtooth',.06);tone(300,600,.25,'sawtooth',.06,.3)}};
function music(){const prog=[[220,261.6,329.6],[174.6,220,261.6],[196,246.9,293.7],[164.8,207.7,246.9]];let i=0;const mg=AC.createGain();mg.gain.value=.05;mg.connect(master);
const play=()=>{const ch=prog[i++%4];if(muted||AC.state!='running')return;const n=AC.currentTime;
ch.forEach(f=>[1,.5].forEach(m=>{const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=f*m;o.detune.value=(Math.random()-.5)*12;g.gain.setValueAtTime(0,n);g.gain.linearRampToValueAtTime(.5,n+2.5);g.gain.linearRampToValueAtTime(0,n+8.6);o.connect(g);g.connect(mg);o.start(n);o.stop(n+9)}));
for(let k=0;k<4;k++){const f=ch[Math.random()*3|0]*(Math.random()<.5?2:4),o=AC.createOscillator(),g=AC.createGain(),s=n+1+k*1.7+Math.random()*.5;o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(0,s);g.gain.linearRampToValueAtTime(.22,s+.02);g.gain.exponentialRampToValueAtTime(.001,s+1.5);o.connect(g);g.connect(mg);o.start(s);o.stop(s+1.6)}};
play();setInterval(play,8000)}

