/* Navigation, equipment comparisons and notification priorities. */
const STARFARER_JOURNEY=(()=>{
  'use strict';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const distance=p=>Math.hypot(p.x-S.pos.x,(p.y||0)-S.pos.y,p.z-S.pos.z);
  const meters=d=>d>=1000?(d/1000).toFixed(1)+' km':Math.round(d)+' m';
  const zone=p=>Math.min(4,Math.floor(Math.hypot(p.x,p.y||0,p.z)/9000));
  function goal(){
    const wp=G.x.wp9;
    if(wp&&Number.isFinite(wp.x))return {...wp,label:'CAP CHOISI',name:wp.n||'Destination',kind:'waypoint'};
    if(G.m){const m=G.m;return {...(m.tg||{}),label:'CONTRAT EN COURS',name:m.txt||'Mission active',kind:m.type||'mission'};}
    const p=storyTarget();return p?{...p,label:'HISTOIRE',name:CHAPTERS[SG().ch].txt(),kind:'story'}:null;
  }
  const stats=[['hp','Coque',false],['spd','Vitesse (m/s)',false],['boost','Boost (m/s)',false],['turn','Maniabilité',false],['dmg','Dégâts',false],['cdmg','Canon',false],['rate','Cadence',false],['shots','Projectiles supplémentaires',false],['heat','Chauffe',true],['ldmg','Laser',false],['twin','Canons doubles',false],['sh','Bouclier',false],['shr','Recharge bouclier',false],['regen','Réparation / s',false],['lock','Portée de verrouillage',false],['cone','Angle de verrouillage',false],['cap','Soute',false],['ram','Éperonnage',false],['lrange','Portée laser',false]];
  function values(parts){const p=pmCalc(parts);return {...p,hp:Math.round((100+40*(G.u[2]-1))*HS().hp*p.hp),spd:Math.round((110+18*(G.u[1]-1))*HS().spd*p.spd),boost:Math.round((110+18*(G.u[1]-1))*HS().spd*p.spd*2.6*p.boost),cap:capWith(parts)};}
  function compare(slot,id){
    if(!PARTS[slot]?.o[id])return [];
    const before=values(G.parts),after=values({...G.parts,[slot]:id});
    return stats.filter(([k])=>Math.abs(after[k]-before[k])>.0001).map(([key,name,lower])=>({key,name,before:before[key],after:after[key],better:lower?after[key]<before[key]:after[key]>before[key]}));
  }
  const fmt=(key,n)=>['hp','spd','boost','cap','shots','twin','sh','ram','regen'].includes(key)?Number(n.toFixed(1)).toLocaleString('fr-FR'):Math.round(n*100)+' %';
  const oldShop=shopView;let shopSignature='',shopHTML='';
  shopView=function(){let h=oldShop.apply(this,arguments);if(TAB!=='atelier')return h;
    const signature=h+JSON.stringify([G.ship,G.parts,G.u,cargoUsed()]);if(signature===shopSignature)return shopHTML;
    const wrap=document.createElement('div');wrap.innerHTML=h;
    for(const row of wrap.querySelectorAll('[data-aprev]')){
      const [s,id]=row.dataset.aprev.split(':');if((G.parts[s]||'std')===id)continue;
      const changes=compare(s,id),box=document.createElement('div');box.className='j23-compare';
      box.innerHTML='<small>PAR RAPPORT À TON ÉQUIPEMENT</small>'+(changes.length?changes.map(c=>'<span class="'+(c.better?'gain':'loss')+'">'+esc(c.name)+' <b>'+fmt(c.key,c.before)+' → '+fmt(c.key,c.after)+'</b></span>').join(''):'<span>Apparence uniquement · performances identiques</span>');
      if(cargoUsed()>capWith({...G.parts,[s]:id}))box.innerHTML+='<span class="loss">Soute trop chargée pour installer cette pièce</span>';
      row.append(box);
    }
    shopSignature=signature;shopHTML=wrap.innerHTML;return shopHTML;
  };
  const panel=document.createElement('aside');panel.id='j23-map';panel.hidden=true;panel.setAttribute('aria-label','Itinéraire et dangers');
  panel.innerHTML='<small>PLAN DE VOL</small><b id="j23-map-name"></b><p id="j23-map-distance"></p><p id="j23-map-risk"></p><div class="j23-actions"><button id="j23-set-course">Choisir ce cap</button><button id="j23-focus">Voir mon objectif</button><button id="j23-clear">Effacer le cap</button></div><small class="j23-legend">◆ Stations · ● Planètes · Anneaux : danger croissant</small>';
  $('map').append(panel);
  $('j23-set-course').onclick=()=>{const p=MAP.sel;if(!p||!Number.isFinite(p.x))return;t9Wp(p.x,p.y||0,p.z,p.n);save();toast('Cap choisi : '+p.n);drawMap();};
  $('j23-clear').onclick=()=>{G.x.wp9=null;save();drawMap();};
  $('j23-focus').onclick=()=>{const p=goal();if(!p||!Number.isFinite(p.x))return;MAP.cx=p.x;MAP.cz=p.z;MAP.zoom=Math.min(.12,Math.max(.003,Math.min(innerWidth,innerHeight)/Math.max(1000,distance(p)*2.5)));drawMap();};
  function updateMap(){
    const space=mode!=='surf';panel.hidden=!MAP.open||!space;if(panel.hidden)return;
    const g=goal(),p=MAP.sel||(g&&Number.isFinite(g.x)?g:null),selected=!!MAP.sel;
    $('j23-map-name').textContent=p?(p.n||p.name):'Choisis une destination';
    $('j23-map-distance').textContent=p?meters(distance(p))+' · '+(selected?'Lieu sélectionné':g.label):'Touche un lieu pour préparer ton trajet.';
    $('j23-map-risk').textContent=p?'Danger du secteur : '+['Faible','Modéré','Élevé','Très élevé','Extrême'][zone(p)]+' · '+(zone(p)>zone(S.pos)?'Prépare coque et bouclier avant le départ.':'Surveille les contacts pendant le trajet.'):'Les anneaux colorés indiquent les zones de danger.';
    $('j23-set-course').hidden=!selected;$('j23-clear').hidden=!G.x.wp9;$('j23-focus').disabled=!g||!Number.isFinite(g.x);
    const wp=g&&Number.isFinite(g.x)?g:null;if(!wp)return;
    const [x,y]=w2s(S.pos.x,S.pos.z),[tx,ty]=w2s(wp.x,wp.z);
    MX.save();MX.strokeStyle='#72f2d2';MX.lineWidth=2;MX.setLineDash([7,6]);MX.beginPath();MX.moveTo(x,y);MX.lineTo(tx,ty);MX.stroke();MX.setLineDash([]);MX.beginPath();MX.arc(tx,ty,18,0,TAU);MX.stroke();MX.restore();
  }
  const oldMap=drawMap;drawMap=function(){oldMap.apply(this,arguments);updateMap();};
  function updateObjective(){
    const box=$('sf2-objective');if(!box||box.hidden)return;const g=goal();if(!g)return;
    $('sf2-objective-label').textContent=g.label;$('sf2-objective-name').textContent=g.name;
    let action='Suis le marqueur';
    if(g.kind==='chasse')action=Math.min(G.m.n,Math.max(0,G.kills-G.m.k0))+' / '+G.m.n+' pirates · Verrouille une cible puis tire';
    else if(Number.isFinite(g.x)){const d=distance(g);action=meters(d)+' · '+(g.kind==='liv'?'Rejoins la station et amarre-toi':g.kind==='exp'?'Approche la planète pour la découvrir':d<700?'Ralentis et utilise l’action proposée à l’écran':'Aligne ton vaisseau sur le marqueur');}
    $('sf2-objective-detail').textContent=action+' · C : carte';
  }
  // Keep every message in the journal; only urgent messages interrupt a toast.
  const history=[],pending=TOQ.q;
  const priority=s=>/missile|mayday|\bSOS\b|critique|détruit|attaqu|pas assez|impossible|vide ta soute|perdu/i.test(s)?2:/install|nouvelle pièce|récompense|livré|mission|contrat|obtenu|acheté|sauvé|cap choisi|arrivée/i.test(s)?1:0;
  const key=s=>s.replace(/[\d\s.,+\-%×]+/g,'#');
  const journal=document.createElement('details');journal.id='j23-journal';journal.innerHTML='<summary>Journal des notifications <span id="j23-notice-count">0</span></summary><ol id="j23-notice-list"></ol>';
  const section=$('sf2-calm')?.closest('.psec');if(section)section.append(journal);
  function record(s,p){const now=Date.now(),last=history[0];if(last&&last.key===key(s)&&now-last.time<4000){last.text=s;last.count++;last.time=now;}else history.unshift({text:s,priority:p,count:1,time:now,key:key(s)});history.length=Math.min(40,history.length);$('j23-notice-count').textContent=history.length;}
  journal.addEventListener('toggle',()=>{if(journal.open)renderHistory();});
  function renderHistory(){const list=$('j23-notice-list');list.replaceChildren();for(const h of history){const li=document.createElement('li');li.className='priority-'+h.priority;li.textContent=h.text+(h.count>1?' ×'+h.count:'');list.append(li);}}
  const oldBanner=banner,oldBanNext=banNext,oldBlocked=banBlocked;
  banner=function(ic,title,sub,col){record(title+(sub?' · '+sub:''),1);if(journal.open)renderHistory();return oldBanner.apply(this,arguments);};
  banNext=function(){oldBanNext();BANT=Math.min(BANT,4.5);};
  banBlocked=function(){return oldBlocked()||MAP.open||PH.on||(mode==='space'&&!S.docked&&(S.hp/maxhp()<.25||en.some(e=>!e.dead&&e.pos.distanceToSquared(S.pos)<810000)));};
  function next(){clearTimeout(TOQ.tm);const s=pending.shift();if(s==null){TOQ.busy=false;TOQ.cur='';$('toast').style.opacity=0;return;}TOQ.busy=true;TOQ.cur=s;TOQ.t0=performance.now();$('toast').innerHTML=toastHTML(s);$('toast').dataset.priority=priority(s);$('toast').style.opacity=1;TOQ.tm=setTimeout(next,priority(s)===2?4200:priority(s)===1?3200:2200);}
  toastShow=next;
  toast=function(value){if(value==null)return;const s=String(value),p=priority(s);record(s,p);if(journal.open)renderHistory();if(TOQ.busy&&key(TOQ.cur)===key(s)){TOQ.cur=s;$('toast').innerHTML=toastHTML(s);return;}
    const i=pending.findIndex(v=>key(v)===key(s));if(i>=0)pending.splice(i,1);
    if(p===2&&TOQ.busy&&priority(TOQ.cur)<2){if(priority(TOQ.cur)===1)pending.unshift(TOQ.cur);pending.unshift(s);next();return;}
    if(p===0){const ambient=pending.findIndex(v=>priority(v)===0);if(ambient>=0)pending.splice(ambient,1);}
    pending.push(s);pending.sort((a,b)=>priority(b)-priority(a));if(pending.length>5)pending.length=5;if(!TOQ.busy)next();
  };
  let elapsed=0;TICK.push(dt=>{elapsed+=dt;if(elapsed<.25)return;elapsed=0;panel.hidden=!MAP.open||mode==='surf';});
  return Object.freeze({version:'2.3',compare,goal,priority,history,updateObjective,updateMap});
})();
