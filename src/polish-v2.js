/* Starfarer 3D — flight, combat, comfort and progression polish.
 * Uses the original simulation and save format. No third-party dependencies.
 */
const STARFARER_POLISH = (() => {
  'use strict';
  const VERSION = '2.3';
  const defaults = {
    compact: true,
    calm: matchMedia('(prefers-reduced-motion: reduce)').matches,
    contrast: false,
    fov: 68,
    glare: 55,
    telemetry: false,
    effects: true
  };
  let prefs = { ...defaults };
  try {
    const v = JSON.parse(localStorage.getItem('sf-polish-v2') || '{}');
    for (const k of ['compact','calm','contrast','telemetry','effects']) if (typeof v[k] === 'boolean') prefs[k] = v[k];
    if (Number.isFinite(v.fov)) prefs.fov = clamp(v.fov, 55, 85);
    if (Number.isFinite(v.glare)) prefs.glare = clamp(v.glare, 0, 100);
  } catch (_) {}

  const state = GX('polish', {});
  if (!state.claimed || typeof state.claimed !== 'object' || Array.isArray(state.claimed)) state.claimed = {};
  // Older completed tutorials must not be rewarded again after this update.
  if (!state.migrated) {
    state.migrated = 1;
    if (G.x.tut9 && G.x.tut9.done && !G.x.tut9.skipped) state.tutorialReward = 1;
  }
  const MILESTONES = [
    { id:'mission1', name:'Premier contrat', desc:'Terminer une mission', goal:1, value:()=>G.done||0, credits:200, xp:35 },
    { id:'explore3', name:'Au-delà de la base', desc:'Découvrir 3 planètes', goal:3, value:()=>G.disc.size, credits:300, xp:50 },
    { id:'pirates5', name:'Secteur sécurisé', desc:'Abattre 5 ennemis', goal:5, value:()=>G.kills||0, credits:350, xp:60 },
    { id:'upgrade3', name:'Prêt pour le grand voyage', desc:'Acheter 3 améliorations armes, moteur ou coque', goal:3, value:()=>G.u.reduce((n,v)=>n+Math.max(0,v-1),0), credits:400, xp:70 }
  ];
  let panelOpen = false, previousFocus = null, lastHUD = 0, lastProgress = 0, hitUntil = 0, damageUntil = 0;
  let styledShip = null;
  const ringPool = [], ringGeometry = new THREE.RingGeometry(.82, 1, 32);
  let ringIndex = 0;

  function clearInput() {
    for (const k of Object.keys(K)) K[k] = 0;
    for (const k of ['fire','boost','brake']) {
      B[k] = 0;
      const el = $(k); if (el) el.classList.remove('on');
    }
    MS.in = MS.fire = MS.boost = false;
    stick = null;
    if (typeof THR6E !== 'undefined') THR6E.drag = null;
  }
  addEventListener('blur', clearInput);
  addEventListener('pagehide', clearInput);
  document.addEventListener('visibilitychange', () => {
    clearInput(); last = performance.now(); FX3.pqOk = false;
  });
  document.addEventListener('focusin', e => {
    if (e.target.matches('input,textarea,select,[contenteditable="true"]')) clearInput();
  });
  addEventListener('pointercancel', clearInput);
  document.addEventListener('pointerup', e => {
    if (e.pointerType === 'mouse') {
      if (e.button === 0) MS.fire = false;
      if (e.button === 2) MS.boost = false;
    }
  }, true);
  addEventListener('keydown', e => {
    const target = e.target;
    if (panelOpen) {
      if (e.code === 'Escape') { e.preventDefault(); togglePanel(false); }
      if (e.code === 'Tab') {
        const controls = [...panel.querySelectorAll('button,input,select')].filter(x => !x.disabled);
        const first = controls[0], end = controls[controls.length-1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); end.focus(); }
        else if (!e.shiftKey && document.activeElement === end) { e.preventDefault(); first.focus(); }
      }
      e.stopImmediatePropagation(); return;
    }
    if (target instanceof Element && target.matches('textarea,select,[contenteditable="true"]')) {
      e.stopImmediatePropagation(); return;
    }
    if (target instanceof Element && target.closest('button') && (e.code === 'Space' || e.code === 'Enter')) {
      e.stopImmediatePropagation();
    }
  }, true);

  const oldOptions = optToggle;
  optToggle = function(v) { clearInput(); oldOptions(v); syncControls(); };
  const oldSteer = steerInput;
  steerInput = function() { return isPaused() ? [0,0] : oldSteer(); };
  const oldCamera = updCam;
  updCam = function(dt) {
    oldCamera(dt);
    if ((mode === 'space' || mode === 'surf') && !FOOT.on && !S.docked && !S.entry && !S.ascent &&
        !MENU3.on && !PH.on && !MAP.open && !ckActive() && !SI.on && !GZ.on && !WK3.on) {
      camera.fov = clamp(camera.fov + prefs.fov - 60, 45, 105);
      camera.updateProjectionMatrix();
    }
  };

  // Cap actual pixels, including large desktop and high-DPI displays. Reuse the
  // existing adaptive-resolution system, rather than introducing a second loop.
  const oldMaxPR = fx3PRMax;
  fx3PRMax = function() {
    const budget = DESK ? (QI === 0 ? 4500000 : 2800000) : 1800000;
    return Math.max(fx3PRMin(), Math.min(oldMaxPR(), Math.sqrt(budget / Math.max(1, innerWidth*innerHeight))));
  };
  fx3SetPR(Math.min(R3.getPixelRatio(), fx3PRMax()));

  function applyPreferences(persist = true) {
    window.SF2Motion = prefs.calm ? 0 : .6;
    document.body.classList.toggle('sf2-compact', prefs.compact);
    document.body.classList.toggle('sf2-calm', prefs.calm);
    document.body.classList.toggle('sf2-contrast', prefs.contrast);
    if (persist) try { localStorage.setItem('sf-polish-v2', JSON.stringify(prefs)); } catch (_) {}
    if (prefs.calm) { FX3.mb.set(0,0); shake = 0; }
    syncControls();
  }

  function text(id, value) {
    const e = $(id); if (e && e.textContent !== String(value)) e.textContent = value;
  }
  function syncControls() {
    for (const k of ['compact','calm','contrast','telemetry','effects']) {
      const e=$('sf2-'+k); if (e) { e.textContent=prefs[k]?'Activé':'Désactivé'; e.setAttribute('aria-pressed',String(prefs[k])); }
    }
    for (const k of ['fov','glare']) { const e=$('sf2-'+k); if (e) e.value=prefs[k]; }
    text('sf2-fov-value',prefs.fov+'°'); text('sf2-glare-value',prefs.glare+' %');
    text('sf2-auto',FX3.auto?'Automatique':'Manuel');
  }
  const section=document.createElement('section'); section.className='psec sf2-options';
  section.innerHTML=`<b class="pt">Confort et lisibilité · ${VERSION}</b>
    <div class="orow"><span>Interface compacte</span><button id="sf2-compact"></button></div>
    <div class="orow"><span>Mouvements réduits</span><button id="sf2-calm"></button></div>
    <div class="orow"><span>Contraste renforcé</span><button id="sf2-contrast"></button></div>
    <div class="orow"><span>Effets d’impact</span><button id="sf2-effects"></button></div>
    <label class="sf2-range" for="sf2-fov"><span>Champ de vision <output id="sf2-fov-value"></output></span><input id="sf2-fov" type="range" min="55" max="85" step="1"></label>
    <label class="sf2-range" for="sf2-glare"><span>Éclat des lumières <output id="sf2-glare-value"></output></span><input id="sf2-glare" type="range" min="0" max="100" step="5"></label>
    <div class="orow"><span>Choix automatique des effets</span><button id="sf2-auto"></button></div>
    <div class="orow"><span>Indicateur de fluidité</span><button id="sf2-telemetry"></button></div>
    <div class="sf2-option-actions"><button id="sf2-open">Mon parcours</button><button id="sf2-defaults">Réglages conseillés</button></div>
    <small class="sf2-key-note">B : frein · F8 : mode photo · Tab : curseur libre</small>`;
  const firstSection=$('opts').querySelector('.psec');
  firstSection.parentNode.insertBefore(section,firstSection.nextSibling);
  for (const k of ['compact','calm','contrast','telemetry','effects']) $('sf2-'+k).onclick=()=>{ prefs[k]=!prefs[k]; applyPreferences(); };
  for (const k of ['fov','glare']) $('sf2-'+k).oninput=e=>{ prefs[k]=+e.target.value; applyPreferences(); };
  $('sf2-auto').onclick=()=>{
    FX3.auto=!FX3.auto; FX3.bad=FX3.good=0; FX3.block=performance.now()+4000;
    try { if(FX3.auto)localStorage.removeItem('sf-fx');else localStorage.setItem('sf-fx',FX3.lv); } catch (_) {}
    syncControls();
  };
  $('sf2-defaults').onclick=()=>{prefs={...defaults};FX3.auto=true;try{localStorage.removeItem('sf-fx')}catch(_){}applyPreferences();toast('Réglages de confort rétablis');};

  const panel=document.createElement('div');panel.id='sf2-panel';panel.hidden=true;
  panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','sf2-panel-title');
  panel.innerHTML=`<div class="sf2-window"><header><div><small>JOURNAL DU PILOTE</small><h2 id="sf2-panel-title">Mon parcours</h2></div><button id="sf2-close" aria-label="Fermer mon parcours">Fermer</button></header>
    <p class="sf2-intro">Explore, équipe ton vaisseau et termine des contrats. Chaque étape ci-dessous donne sa récompense une seule fois.</p>
    <div id="sf2-stats" class="sf2-stats"></div><div id="sf2-milestones"></div>
    <footer><button id="sf2-next">Trouver ma prochaine activité</button><button id="sf2-settings">Confort et commandes</button></footer></div>`;
  document.body.appendChild(panel);
  function renderProgress() {
    const stats=$('sf2-stats');stats.replaceChildren();
    for(const [label,value] of [['Niveau',lvInfo().L],['Contrats',G.done||0],['Planètes',G.disc.size],['Victoires',G.kills||0]]){
      const cell=document.createElement('div'),number=document.createElement('b'),caption=document.createElement('span');
      number.textContent=value;caption.textContent=label;cell.append(number,caption);stats.append(cell);
    }
    const list=$('sf2-milestones');list.replaceChildren();
    for(const m of MILESTONES){
      const done=!!state.claimed[m.id],value=Math.min(m.goal,m.value()),item=document.createElement('article');item.className='sf2-milestone'+(done?' done':'');
      const heading=document.createElement('div'),name=document.createElement('b'),count=document.createElement('span');name.textContent=m.name;count.textContent=done?'Accompli':value+' / '+m.goal;heading.append(name,count);
      const description=document.createElement('p');description.textContent=m.desc;
      const bar=document.createElement('progress');bar.max=m.goal;bar.value=value;bar.setAttribute('aria-label',m.desc);
      const reward=document.createElement('small');reward.textContent=done?'Récompense reçue':`Récompense : ${m.credits} ¢ · ${m.xp} XP`;
      item.append(heading,description,bar,reward);list.append(item);
    }
  }
  function togglePanel(on) {
    on=on==null?!panelOpen:!!on;if(on===panelOpen)return;
    clearInput();panelOpen=on;window.SF2PAUSE=on;panel.hidden=!on;
    if(on){previousFocus=document.activeElement;if(OPTP.open)oldOptions(false);renderProgress();$('sf2-close').focus();}
    else if(previousFocus&&previousFocus.isConnected)previousFocus.focus();
  }
  $('sf2-close').onclick=()=>togglePanel(false);
  $('sf2-open').onclick=()=>togglePanel(true);
  $('sf2-next').onclick=()=>{togglePanel(false);qfOpen();};
  $('sf2-settings').onclick=()=>{togglePanel(false);optToggle(true);section.scrollIntoView({block:'start'});};
  panel.addEventListener('pointerdown',e=>{if(e.target===panel)togglePanel(false);});
  const menuProgress=document.createElement('button');menuProgress.id='sf2-menu-progress';menuProgress.textContent='Mon parcours';menuProgress.onclick=()=>togglePanel(true);
  if($('menu3'))$('menu3').querySelector('.m3bot').appendChild(menuProgress);
  const hud=document.createElement('div');hud.id='sf2-hud';hud.innerHTML='<div id="sf2-target" hidden><span id="sf2-target-type"></span><b id="sf2-target-name"></b><progress id="sf2-target-hp" max="1" value="1" aria-label="Coque de la cible"></progress><small id="sf2-target-distance"></small></div><div id="sf2-objective" hidden><small id="sf2-objective-label">PROCHAIN CAP</small><b id="sf2-objective-name"></b><span id="sf2-objective-detail"></span></div><div id="sf2-alert" role="status" aria-live="polite" hidden></div><div id="sf2-fps" hidden></div><div id="sf2-pause" hidden>EN PAUSE · Ferme les options pour reprendre</div>';
  document.body.appendChild(hud);
  const oldLens=lensFlares;
  lensFlares=function(){const v=FL3.v,f=FL3.f,k=prefs.glare/100;FL3.v*=k;FL3.f*=k;try{return oldLens()}finally{FL3.v=v;FL3.f=f;}};

  function addRing(position,kill) {
    if(!prefs.effects||FX3.lv==='eco'||!position)return;
    if(!ringPool.length)for(let i=0;i<12;i++){
      const material=new THREE.MeshBasicMaterial({color:0x8aeaff,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
      const mesh=new THREE.Mesh(ringGeometry,material);mesh.visible=false;mesh.frustumCulled=false;ringPool.push({mesh,age:1,life:.45,size:1});
    }
    const r=ringPool[ringIndex++%ringPool.length];r.age=0;r.life=kill?.6:.3;r.size=kill?14:3;
    r.mesh.position.copy(position);r.mesh.material.color.setHex(kill?0xffa34d:0x8aeaff);r.mesh.visible=true;curScene().add(r.mesh);
  }
  const oldHit=hitEnemy;
  hitEnemy=function(e,amount,p){
    if(!e||e.dead||!(amount>0))return;
    const hp=e.hp;oldHit(e,amount,p);
    if(e.hp<hp||e.dead){hitUntil=t+(e.dead?.45:.13);addRing(p||e.pos,!!e.dead);}
  };
  const oldDamage=damage;
  damage=function(amount,kind){
    if(!Number.isFinite(amount)||amount<=0)return;
    // Let a new pilot learn the controls in the starting sector. Collisions
    // and travel outside that sector keep their normal consequences.
    if(kind!=='col'&&mode==='space'&&TUT9.on&&danger()===0)amount*=.6;
    const hp=S.hp,shield=S.sh||0;oldDamage(amount,kind);
    if(S.hp<hp||(S.sh||0)<shield)damageUntil=t+.45;
  };
  const oldEnemy=mkEnemy;
  mkEnemy=function(type,position,zone){const enemy=oldEnemy(type,position,zone);if(!enemy.boss)enemy.cd=Math.max(2.3,enemy.cd||0);return enemy;};
  const oldOverlay=overlay;
  overlay=function(){oldOverlay();if(MENU3.on||PH.on||MAP.open||S.dead||window.SF2PAUSE||OPTP.open)return;
    const W=innerWidth,H=innerHeight;
    if(damageUntil>t&&!prefs.calm){OX.save();OX.strokeStyle='rgba(255,95,80,'+Math.min(.55,(damageUntil-t)*1.2)+')';OX.lineWidth=3;OX.strokeRect(2,2,W-4,H-4);OX.restore();}
    if(hitUntil>t&&mode==='space'&&!ckActive()){OX.save();OX.globalAlpha=Math.min(1,(hitUntil-t)*7);OX.strokeStyle='#b9f5ff';OX.lineWidth=1.6;OX.beginPath();for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2;OX.moveTo(W/2+Math.cos(a)*12,H/2+Math.sin(a)*12);OX.lineTo(W/2+Math.cos(a)*17,H/2+Math.sin(a)*17);}OX.stroke();OX.restore();}
  };

  function updateHUD(now) {
    const hidden=MENU3.on||PH.on||MAP.open||OPTP.open||panelOpen||S.dead||DLG.open||!!window.XPAUSE;
    hud.hidden=hidden;
    $('sf2-pause').hidden=!OPTP.open||MENU3.on;
    // Pause label lives outside the hidden gameplay HUD when Options are open.
    if(hidden)return;
    const active=mode==='space'&&!S.docked&&!FOOT.on&&!SI.on&&!GZ.on;
    let target=active&&lock&&lock.foe&&!lock.dead?lock:null;
    $('sf2-target').hidden=!target||TUT9.on;
    if(target){
      text('sf2-target-type',target.boss?'MENACE MAJEURE':'CIBLE VERROUILLÉE');
      text('sf2-target-name',target.label||({pirate:'Pirate',chasseur:'Intercepteur',lourd:'Croiseur',boss:'Chef pirate'}[target.ty])||'Hostile');
      $('sf2-target-hp').value=clamp(target.hp/Math.max(1,target.mhp||target.hp),0,1);
      text('sf2-target-distance',Math.round(S.pos.distanceTo(target.pos))+' m');
    }
    const wp=G.x.wp9||(G.m&&G.m.tg),obj=$('sf2-objective');
    obj.hidden=!active||TUT9.on;
    if(active&&!TUT9.on){
      if(wp&&Number.isFinite(wp.x)){
        const distance=Math.hypot(wp.x-S.pos.x,wp.y-S.pos.y,wp.z-S.pos.z);
        text('sf2-objective-label',G.m?'CONTRAT EN COURS':'CAP ACTUEL');
        text('sf2-objective-name',wp.n||wp.name||G.m&&G.m.txt||'Destination');
        text('sf2-objective-detail',(distance>=1000?(distance/1000).toFixed(1)+' km':Math.round(distance)+' m')+' · C : carte');
      }else if(G.m){text('sf2-objective-label','CONTRAT EN COURS');text('sf2-objective-name',G.m.txt||'Mission active');text('sf2-objective-detail',G.m.type==='chasse'?Math.max(0,(G.kills||0)-(G.m.k0||0))+' / '+G.m.n+' pirates':'Suis le marqueur de mission');}
      else{text('sf2-objective-label','À TOI DE CHOISIR');text('sf2-objective-name','Explorer · commercer · combattre');text('sf2-objective-detail','F1 : activités à proximité · C : carte');}
    }
    if(typeof STARFARER_JOURNEY!=='undefined')STARFARER_JOURNEY.updateObjective();
    let alert='';
    if(active){
      if(EB.some(b=>b.home&&b.l>0&&b.m.position.distanceToSquared(S.pos)<490000))alert='MISSILE EN APPROCHE · X : leurres · R : esquive';
      else if(S.hp/maxhp()<.25)alert='COQUE CRITIQUE · Rejoins une station pour réparer';
      else if(cargoUsed()>=cap())alert='SOUTE PLEINE · Vends tes ressources en station';
    }
    const box=$('sf2-alert');box.hidden=!alert;text('sf2-alert',alert);
    $('sf2-fps').hidden=!prefs.telemetry;
    if(prefs.telemetry)text('sf2-fps',(FX3.fps?Math.round(FX3.fps)+' i/s':'Mesure…')+' · '+FX3N[FX3.lv]+' · '+Math.round(R3.getPixelRatio()*100)+' %');
  }

  function tick(dt) {
    const paused=isPaused(),elapsed=paused?0:Math.min(dt,.05),now=performance.now();
    if(bloom){bloom.strength=DESK?.48:.34;bloom.threshold=.91;bloom.radius=.42;}
    if(prefs.calm){FX3.mb.set(0,0);if(GRADE){GRADE.uniforms.bst.value=0;if(GRADE.uniforms.hit)GRADE.uniforms.hit.value=0;}if(typeof GL3!=='undefined')GL3.v=0;}
    if(!prefs.effects||prefs.calm)for(const r of ringPool)r.mesh.visible=false;
    for(const r of ringPool)if(r.mesh.visible){r.age+=elapsed;const k=r.age/r.life;if(k>=1){r.mesh.visible=false;if(r.mesh.parent)r.mesh.parent.remove(r.mesh);continue;}r.mesh.quaternion.copy(camera.quaternion);r.mesh.scale.setScalar(r.size*(.6+k*2.5));r.mesh.material.opacity=(1-k)*.55;}
    if(ship!==styledShip){styledShip=ship;ship.traverse(o=>{if(!o.isMesh)return;for(const m of(Array.isArray(o.material)?o.material:[o.material]))if(m&&m.isMeshStandardMaterial&&!m.transparent&&m.blending!==THREE.AdditiveBlending){m.roughness=Math.max(.28,m.roughness);m.envMapIntensity=Math.min(m.envMapIntensity||1,1.1);}});}
    if(now-lastHUD>250){lastHUD=now;updateHUD(now);}
    if(!paused&&!MENU3.on&&!PH.on&&now-lastProgress>1500){
      lastProgress=now;let earned=false;
      for(const m of MILESTONES)if(!state.claimed[m.id]&&m.value()>=m.goal){
        // Mark before granting: a save, callback, or reload cannot claim twice.
        state.claimed[m.id]=1;G.cr+=m.credits;gainXP(m.xp);earned=true;
        banner('trophy',m.name,`+${m.credits} ¢ · +${m.xp} XP · Étape de ton parcours`,'#7fe6ce');
      }
      if(earned)save();
    }
  }
  TICK.push(tick);
  applyPreferences(false);
  // Tooltips and accessible names remain useful on touch and keyboard.
  for(const [id,name] of [['optb','Options et confort (O)'],['mapb','Carte stellaire (C)'],['qfb','Trouver une activité (F1)'],['phob','Mode photo (F8)'],['profb','Profil du pilote (P)']]){
    const e=$(id);if(e){e.title=name;e.setAttribute('aria-label',name);}
  }
  $('opts').setAttribute('role','dialog');$('opts').setAttribute('aria-label','Options du jeu');
  return Object.freeze({version:VERSION});
})();
