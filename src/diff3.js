// ===== DIFFICULTÉ DES COMBATS (diff3) : Facile / Normal / Difficile (= ancien équilibrage), Options → Jeu =====
// dégâts reçus des tirs ennemis, précision des tirs ennemis (dispersion ajoutée), points de vie et cadence des ennemis
const DF3L=[{n:'Facile',dmg:.4,spr:.05,hp:.7,rate:1.35},{n:'Normal',dmg:.6,spr:.03,hp:.85,rate:1.15},{n:'Difficile',dmg:1,spr:0,hp:1,rate:1}];
const DF3={lv:1};try{const v=localStorage.getItem('sf-diff');if(v!=null&&DF3L[+v])DF3.lv=+v}catch(e){}
const df3=()=>DF3L[DF3.lv]||DF3L[1];
// ennemis moins résistants et qui tirent un peu moins souvent (les foes.js, primes, police, boss… passent tous par mkEnemy)
{const _mk=mkEnemy;mkEnemy=function(ty,pos,z){const e=_mk(ty,pos,z),D=df3();e.hp*=D.hp;e.mhp=e.hp;e.rate*=D.rate;return e}}
// tirs ennemis : chaque nouveau projectile est marqué une fois (dégâts réduits, direction un peu moins précise ; les missiles gardent leur guidage)
const _df3v=new V3();
function df3Bolt(v,dmgKey,b){const D=df3();b[dmgKey]*=D.dmg;if(D.spr&&!b.home){const s=v.length();_df3v.set(rv(1),rv(1),rv(1)).multiplyScalar(D.spr*s);v.add(_df3v).setLength(s)}b.df3=1}
TICK.push(()=>{for(const b of EB)if(!b.df3&&b.v)df3Bolt(b.v,'dmg',b);if(typeof DER!='undefined'&&DER.eb)for(const b of DER.eb)if(!b.df3&&b.v)df3Bolt(b.v,'d',b)});
// bouton des Options
function df3Apply(){const b=$('df3b');if(b)b.textContent=df3().n}
{const b=$('df3b');if(b)b.onclick=()=>{DF3.lv=(DF3.lv+1)%DF3L.length;try{localStorage.setItem('sf-diff',DF3.lv)}catch(e){}df3Apply();toast(['🛡 Facile : les ennemis visent mal et font peu de dégâts','🛡 Normal : combats équilibrés','⚔ Difficile : les ennemis sont redoutables (ancien réglage)'][DF3.lv])}}
df3Apply();
