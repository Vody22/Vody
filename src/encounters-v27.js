// Tactical encounters reuse existing ships, particles and traffic. No extra spawns.
function encounter27Ready(e,dt){
  if(e.ty!=='lourd'||e.bomb||e.carrier)return true;
  if(!(e.charge27>0)){e.charge27=.85;return false;}
  e.charge27=Math.max(.00001,e.charge27-dt);
  if(e.charge27>.00001)return false;
  e.charge27=0;return true;
}
function encounter27Support(e){
  if(!e.ai3||e.ai3.ext||e.ai3.hunt||e.kind||e.boss||e.bomb||e.carrier||e.xil)return false;
  return e.ty==='pirate'&&e.lead&&e.lead.ty==='lourd'&&!e.lead.dead;
}
function encounter27Protector(e){
  if(!e.ai3||e.ai3.st!=='atk')return null;
  for(const ally of en)if(ally!==e&&!ally.dead&&ally.tactic27==='support'&&ally.ai3&&ally.ai3.st==='atk'&&ally.ai3.grp===e.ai3.grp&&ally.cover27>0&&ally.pos.distanceToSquared(e.pos)<420*420)return ally;
  return null;
}
function encounter27Absorb(e,damage){
  if(!(damage>0)||e.dead)return damage;
  const ally=encounter27Protector(e);if(!ally)return damage;
  const absorbed=Math.min(damage*.65,ally.cover27);ally.cover27-=absorbed;
  if(t-(e.shieldFx27||-10)>.2&&e.pos.distanceToSquared(S.pos)<1500*1500){e.shieldFx27=t;fxGlow(e.pos,0x65e6ff,e.sz*1.8,.18,1.1);}
  e.coverHit27=t;return damage-absorbed;
}
{const previous=hitEnemy;hitEnemy=function(e,damage,p){return previous(e,encounter27Absorb(e,damage),p);};}

{const previous=updEnemies;updEnemies=function(dt,z){
  previous(dt,z);
  for(const e of en){
    if(e.dead)continue;
    if(!e.tactic27){
      e.tactic27=encounter27Support(e)?'support':e.ty==='chasseur'?'interceptor':e.ty==='lourd'?'heavy':'raider';
      if(e.tactic27==='support'){e.cover27=0;e.coverCd27=0;reskin(e,0x183c50,0x43d9ee);}
    }
    if(e.tactic27==='support'){
      e.coverCd27-=dt;
      if(e.ai3&&e.ai3.st==='atk'&&e.coverCd27<=0){e.cover27=Math.min(2,e.mhp*.35);e.coverCd27=9;}
      if(e.ai3&&e.ai3.st==='atk'&&e.lead&&!e.lead.dead)e.run=-2;
    }
    if(e.flee&&e.ai3&&!e.ai3.ext&&!e.ai3.hunt&&!e.retreat27){e.retreat27=true;e.stT=Math.max(e.stT,5);}
  }
};}

// Telegraphs and role labels are canvas overlays, capped to three nearby contacts.
{const previous=overlay;overlay=function(){previous();if(mode!=='space'||S.dead)return;
  let count=0;OX.save();OX.textAlign='center';OX.font="600 11px 'Chakra Petch',system-ui";
  for(const e of en){if(count>=3)break;if(e.dead||!e.ai3||e.ai3.st!=='atk'||e.cloaked||e.pos.distanceToSquared(S.pos)>1200*1200)continue;
    const s=proj(e.pos);if(!s.front||s.x<30||s.x>innerWidth-30||s.y<60||s.y>innerHeight-60)continue;
    const charging=e.charge27>0;OX.fillStyle=charging?'#ffba62':e.tactic27==='support'?'#7feaff':'#ffb8a0';
    let label=charging?'Salve imminente':e.flee?'Repli':e.tactic27==='support'?'Soutien · bouclier allié':e.tactic27==='interceptor'?'Intercepteur':e.tactic27==='heavy'?'Croiseur lourd':null;
    if(label){OX.fillText(label,s.x,s.y-32);count++;}
    if(charging){const k=1-Math.min(1,e.charge27/.85);OX.strokeStyle='#ffba62';OX.lineWidth=2;OX.beginPath();OX.arc(s.x,s.y,18+k*10,-Math.PI/2,-Math.PI/2+Math.PI*2*k);OX.stroke();}
  }OX.restore();
};}

// Civilians react to nearby combat without interrupting docking or scripted raids.
const ENCOUNTER27={radio:-30,ground:0};
const _enc27a=new V3(),_enc27b=new V3();
{const previous=w7Upd;w7Upd=function(N,dt){
  const F=N.F;N.threatCd27=(N.threatCd27||0)-dt;
  if(N.threatCd27<=0){N.threatCd27=.8;N.threat27=null;
    if(!N.gone&&F.pos.distanceToSquared(S.pos)<2500*2500&&N.job!=='patrol'&&N.ph==='cruise'&&!(W7.raid&&W7.raid.N===N)){
      let distance=650*650;for(const e of en){if(e.dead||!e.ai3||e.ai3.st!=='atk'||e.kind==='police')continue;const d=e.pos.distanceToSquared(F.pos);if(d<distance){distance=d;N.threat27=e;}}
    }
  }
  const threat=N.threat27;
  if(threat&&!threat.dead&&threat.ai3&&threat.ai3.st==='atk'&&N.ph==='cruise'&&!(W7.raid&&W7.raid.N===N)&&F.pos.distanceToSquared(threat.pos)<850*850){
    _enc27b.copy(F.pos).sub(threat.pos);if(_enc27b.lengthSq()<1)_enc27b.set(1,0,0);_enc27b.normalize();
    w7Steer(N,_enc27a.copy(F.pos).addScaledVector(_enc27b,700),N.sp*1.2,dt,2.3);
    if(t-ENCOUNTER27.radio>18){ENCOUNTER27.radio=t;w7Bub(N,'Contact hostile ! Nous changeons de cap.',4);}
    return;
  }
  return previous(N,dt);
};}
{const previous=w7RaidEnd;w7RaidEnd=function(ok){const R=W7.raid;const saved=ok&&R&&R.pk>0&&!R.N.gone?R.N:null;previous(ok);if(saved)saved.rescued27=true;};}
{const previous=w7Talk;w7Talk=function(N){
  if(N.rescued27&&!N.gone&&N.F.pos.distanceToSquared(S.pos)<650*650&&t-W7.sayT>18&&!(W7.raid&&W7.raid.N===N)){
    N.rescued27=false;W7.sayT=t;w7Bub(N,'Heureux de te revoir, pilote. On se souvient de ton aide !',5);return;
  }return previous(N);
};}

// Short role-specific ambient conversations; quest and shop interactions stay intact.
const ENCOUNTER27_LINES=[
  ['Je prépare les prochaines livraisons.','Les cargos attendent une éclaircie pour repartir.'],
  ['Je vérifie les réacteurs avant le prochain départ.','Un moteur bien entretenu peut te sauver la vie.'],
  ['Je repère les filons avant de sortir mes outils.','Je garde les plus beaux cristaux pour mon équipage.'],
  ['Je surveille les approches de l’avant-poste.','Signale les contacts suspects à la patrouille.'],
  ['Je compare mes relevés avec ceux de la station.','Chaque planète nous réserve des surprises.'],
  ['Les étoiles nous ramènent souvent aux mêmes rencontres.','Je reconnaîtrais le bruit de ton moteur entre mille.']
];
{const previous=talk;talk=function(n){const repeat=n.met27;n.met27=true;previous(n);
  if(repeat&&!n.quest&&!n.R.merchant&&!n.R.repair){n.say='Content de te revoir ! '+n.say;n.sayT=5.5;}
};}
TICK.push(dt=>{
  if(mode!=='surf'||!GR||!FOOT.on||S.dead||isPaused())return;
  ENCOUNTER27.ground-=dt;if(ENCOUNTER27.ground>0)return;ENCOUNTER27.ground=18;
  for(const n of GR.npcs){if(n.quest||n.sayT>0||n.pos.distanceToSquared(FOOT.pos)>12*12)continue;
    const lines=ENCOUNTER27_LINES[n.role];if(!lines)continue;
    n.say=lines[(n.li++||0)%lines.length];n.sayT=4.5;break;
  }
});
