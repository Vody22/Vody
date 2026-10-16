// ===== FINITIONS DU COMBAT ET DES MESSAGES (fin5.js, après traf.js) — état HM5 =====
// Marqueur de touche (croix blanche sur la cible), confirmation d'élimination (croix rouge + anneau + « +X ¢ »), sons de
// confirmation, chiffres de dégâts (option, localStorage sf-dmgn). Messages : un message déjà en attente est remplacé par sa
// version la plus récente (même texte aux nombres près), la radio des PNJ est ignorée quand la file est pleine.
const HM5={L:[],snd:0,on:false};try{HM5.on=localStorage.getItem('sf-dmgn')=='1'}catch(e){}
function hm5Add(e,d,p,kill){const now=t,P=p?p.clone?p.clone():new V3(p.x,p.y,p.z):e.pos.clone();let h=!kill&&HM5.L.find(q=>q.e===e&&!q.kill&&now-q.t0<.35);
 if(h){h.n+=d;h.t0=now;h.p.copy(P)}else HM5.L.push({e,p:P,t0:now,n:d,kill,rw:kill?(e.rw||0):0,dy:rv(8)});if(HM5.L.length>24)HM5.L.splice(0,HM5.L.length-24)}
function hm5Snd(kill){if(!AC||muted)return;const n=performance.now();if(!kill&&n-HM5.snd<70)return;HM5.snd=n;
 try{if(typeof SN3!='undefined'&&SN3.ok)sn3U(()=>{if(kill){sn3O('sine',880,880,.09,.06);sn3O('sine',1320,1320,.16,.06,.07);sn3O('sine',110,48,.28,.13)}else{sn3O('square',2500,2100,.03,.022);sn3O('sine',1700,1700,.045,.03)}});
  else if(kill){tone(880,880,.09,'sine',.05);setTimeout(()=>tone(1320,1320,.14,'sine',.05),70)}else tone(2200,1900,.03,'square',.015)}catch(err){}}
{const _he=hitEnemy;hitEnemy=function(e,d,p){const was=e&&e.dead,h0=e&&e.hp;_he(e,d,p);try{if(!e||was)return;if(e.dead){hm5Add(e,d,p,true);hm5Snd(true)}else if(e.hp<h0){hm5Add(e,h0-e.hp,p,false);hm5Snd(false)}}catch(err){}}}
{const _bh=bossHit;bossHit=function(pt,d,pp){const h0=pt.hp,dd=pt.dead;_bh(pt,d,pp);try{if(!dd&&pt.hp<h0){const k=pt.dead;hm5Add(pt,h0-pt.hp,pp||pt.pos,k);hm5Snd(k)}}catch(err){}}}
{const _ov=overlay;overlay=function(){_ov();if(!HM5.L.length)return;const now=t;OX.save();OX.textAlign='center';
 for(const h of HM5.L){const a=now-h.t0,s=proj(h.p);if(!s.front)continue;const x=s.x,y=s.y;
  if(h.kill){if(a<.45){const k=1-a/.45,r=10+a*26;OX.globalAlpha=k;OX.strokeStyle='#ff5a4a';OX.lineWidth=3;OX.beginPath();OX.moveTo(x-r,y-r);OX.lineTo(x-r*.4,y-r*.4);OX.moveTo(x+r,y-r);OX.lineTo(x+r*.4,y-r*.4);OX.moveTo(x-r,y+r);OX.lineTo(x-r*.4,y+r*.4);OX.moveTo(x+r,y+r);OX.lineTo(x+r*.4,y+r*.4);OX.stroke();
    OX.lineWidth=2;OX.globalAlpha=k*.6;OX.beginPath();OX.arc(x,y,r*1.6,0,TAU);OX.stroke()}
   if(h.rw>0&&a<1.1){OX.globalAlpha=Math.min(1,(1.1-a)*2.5);OX.font="700 13px 'Chakra Petch',system-ui";OX.fillStyle='#ffd257';OX.fillText('+'+Math.round(h.rw).toLocaleString('fr-FR')+' ¢',x,y-26-a*30)}}
  else if(a<.2){const k=1-a/.2,g=6,l=6;OX.globalAlpha=k;OX.strokeStyle='#ffffff';OX.lineWidth=2;OX.beginPath();OX.moveTo(x-g,y-g);OX.lineTo(x-g-l,y-g-l);OX.moveTo(x+g,y-g);OX.lineTo(x+g+l,y-g-l);OX.moveTo(x-g,y+g);OX.lineTo(x-g-l,y+g+l);OX.moveTo(x+g,y+g);OX.lineTo(x+g+l,y+g+l);OX.stroke()}
  if(HM5.on&&a<.8&&h.n>=.5){OX.globalAlpha=Math.min(1,(.8-a)*3);OX.font="700 12px 'Chakra Petch',system-ui";OX.fillStyle=h.kill?'#ff8a6a':'#fff3c0';OX.fillText(String(Math.round(h.n)),x+18+h.dy,y-10-a*36)}}
 OX.restore();HM5.L=HM5.L.filter(h=>now-h.t0<1.2)}}
// option « Chiffres de dégâts »
function dn5Apply(){const b=$('dn5b');if(b)b.textContent=HM5.on?'Affichés':'Masqués'}dn5Apply();
{const b=$('dn5b');if(b)b.onclick=()=>{HM5.on=!HM5.on;try{localStorage.setItem('sf-dmgn',HM5.on?'1':'0')}catch(e){}dn5Apply();toast(HM5.on?'Chiffres de dégâts affichés':'Chiffres de dégâts masqués')}}
// ----- messages : pas de doublons à quelques chiffres près, la radio des PNJ passe après le reste -----
{const _to=toast,key=s=>s.replace(/[\d\s.,+\-%×]+/g,'#');toast=function(s){if(s==null)return;s=String(s);const k=key(s),i=TOQ.q.findIndex(x=>key(x)===k);if(i>=0){TOQ.q[i]=s;return}
 if(TOQ.busy&&TOQ.q.length>=1&&/^(📡|📦|🛬)/u.test(s)&&!/Mayday|SOS/.test(s))return;_to(s)}}
