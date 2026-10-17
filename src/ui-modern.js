/* Starfarer 3D 2.2 — interface redesign, reusing every existing action. */
const STARFARER_UI = (() => {
  'use strict';
  const paths = {
    gear:'<path d="M4 7h10m4 0h2M4 17h3m4 0h9"/><circle cx="16" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    map:'<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Z"/><path d="M9 3v16m6-14v16"/>',
    user:'<circle cx="12" cy="8" r="3.5"/><path d="M4.5 21v-2a7.5 7.5 0 0 1 15 0v2"/>',
    book:'<path d="M4 3h12a3 3 0 0 1 3 3v15H7a3 3 0 0 1-3-3V3Z"/><path d="M4 17h15M8 7h7M8 11h5"/>',
    cam:'<path d="M3 7h4l2-3h6l2 3h4v13H3V7Z"/><circle cx="12" cy="13" r="4"/>',
    mp:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2"/>',
    squad:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2"/>',
    cockpit:'<path d="M3 19v-3a9 9 0 0 1 18 0v3H3ZM12 7v12m-7-9 4 9m10-9-4 9"/>',
    extcam:'<path d="m12 3 3 9 6 5-7-1-2 5-2-5-7 1 6-5 3-9Z"/>',
    hull:'<path d="m12 3 4 7v9l-4 2-4-2v-9l4-7Zm-4 9-5 5v3l5-2m8-6 5 5v3l-5-2"/>',
    shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    cargo:'<path d="m12 3 9 5-9 5-9-5 9-5ZM3 8v10l9 4 9-4V8M12 13v9M7 5.8l9 5"/>',
    coin:'<circle cx="12" cy="12" r="9"/><path d="M15 8.5h-4a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H9m3-10v12"/>',
    planet:'<circle cx="12" cy="12" r="7"/><path d="M6 7C-3 10 2 20 14 16S26 4 17 6"/>',
    target:'<circle cx="12" cy="12" r="7"/><path d="M12 2v5m0 10v5M2 12h5m10 0h5"/><circle cx="12" cy="12" r="1"/>',
    fire:'<path d="M12 3c1 5 5 6 5 10a5 5 0 0 1-10 0c0-2 1-3 2-5 0 3 2 3 2 1l1-6Z"/><path d="M12 14c3 2 2 6 0 6s-3-3 0-6Z"/>',
    boost:'<path d="m13 2-8 12h6l-1 8 9-13h-6l0-7Z"/>',
    brake:'<circle cx="12" cy="12" r="9"/><path d="M9 8v8m6-8v8"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    minus:'<path d="M5 12h14"/>',
    check:'<path d="m5 12 4 4L20 5"/>',
    chat:'<path d="M21 11a8 8 0 0 1-8 8H7l-5 3 2-6a8 8 0 0 1-1-4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6Z"/><path d="M7 8h10M7 12h6"/>',
    star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
    trophy:'<path d="M8 3h8v7a4 4 0 0 1-8 0V3Zm0 2H4v4a4 4 0 0 0 4 4m8-8h4v4a4 4 0 0 1-4 4m-4 1v6m-4 1h8"/>',
    locate:'<circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>',
    warn:'<path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5m0 3v.01"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
    snd:'<path d="M3 9h4l5-5v16l-5-5H3V9Zm13-1a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    mute:'<path d="M3 9h4l5-5v16l-5-5H3V9Zm13 0 5 6m0-6-5 6"/>',
    arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 8.5a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 4v.01"/>',
    chart:'<path d="M4 3v17h17M8 15v-4m5 4V7m5 8V4"/>'
  };
  const sprite = document.querySelector('symbol[id^="i-"]')?.parentElement;
  for(const [name,markup] of Object.entries(paths)) {
    let symbol=$('i-'+name);
    if(!symbol && sprite){symbol=document.createElementNS('http://www.w3.org/2000/svg','symbol');symbol.id='i-'+name;symbol.setAttribute('viewBox','0 0 24 24');sprite.append(symbol);}
    if(symbol)symbol.innerHTML=markup;
    ICONS[name]=markup;
  }
  const icon=name=>ICO(name);
  const dock=document.createElement('nav');dock.id='sf3-toolbar';dock.setAttribute('aria-label','Raccourcis du vaisseau');
  const groups=[
    [['mapb','Carte','C'],['profb','Pilote','P'],['cxb','Journal','J']],
    [['cockb','Caméra','V'],['phob','Photo','F8']],
    [['mpb','Multijoueur','T'],['qfb','Activités','F1'],['optb','Options','O']]
  ];
  const originalButtons=[];
  for(const items of groups){
    const group=document.createElement('div');group.className='sf3-tool-group';group.setAttribute('role','group');
    for(const [id,label,key] of items){
      const button=$(id);if(!button)continue;
      originalButtons.push(button);button.dataset.label=label;button.dataset.key=key;button.classList.add('sf3-tool');
      if(id==='qfb')button.innerHTML=icon('help');
      button.addEventListener('pointerenter',()=>button.dataset.label=(button.title||label).replace(/\s*\([^)]*\)\s*$/,''));
      group.append(button);
    }
    dock.append(group);
  }
  document.body.append(dock);

  const settings=$('opts'),sections=[...settings.children].filter(e=>e.classList.contains('psec'));
  const tabNames=['Affichage','Confort','Jeu','Son','Commandes','Sauvegarde','Aide'];
  const tabs=document.createElement('div');tabs.id='sf3-settings-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Catégories des options');
  let selected=0;
  function selectTab(index,focus=false){
    selected=(index+sections.length)%sections.length;
    sections.forEach((section,i)=>{
      section.classList.toggle('sf3-inactive',i!==selected);
      const button=tabs.children[i];button.classList.toggle('sf3-selected',i===selected);button.setAttribute('aria-selected',String(i===selected));button.tabIndex=i===selected?0:-1;
    });
    settings.scrollTop=0;if(focus)tabs.children[selected].focus();
  }
  sections.forEach((section,i)=>{
    section.id=section.id||'sf3-settings-section-'+i;section.setAttribute('role','tabpanel');section.setAttribute('aria-labelledby','sf3-settings-tab-'+i);
    const tab=document.createElement('button');tab.id='sf3-settings-tab-'+i;tab.type='button';tab.setAttribute('role','tab');tab.setAttribute('aria-controls',section.id);tab.textContent=tabNames[i]||section.querySelector('.pt')?.textContent||'Autres';
    tab.onclick=()=>selectTab(i);tab.addEventListener('keydown',e=>{
      const direction=e.code==='ArrowRight'?1:e.code==='ArrowLeft'?-1:0;
      if(direction||e.code==='Home'||e.code==='End'){e.preventDefault();e.stopPropagation();selectTab(e.code==='Home'?0:e.code==='End'?sections.length-1:selected+direction,true);}
    });tabs.append(tab);
  });
  settings.querySelector('.phead').after(tabs);selectTab(0);
  const comfortIndex=sections.findIndex(s=>s.classList.contains('sf2-options'));
  const comfortButton=$('sf2-settings');if(comfortButton){const go=comfortButton.onclick;comfortButton.onclick=e=>{go(e);if(comfortIndex>=0)selectTab(comfortIndex);};}
  for(const id of ['sf2-open','sf2-next','sf2-settings','sf2-close']){
    const b=$(id);if(b)b.classList.add('sf3-action');
  }
  const scrim=document.createElement('div');scrim.id='sf3-scrim';scrim.hidden=true;scrim.setAttribute('aria-hidden','true');document.body.append(scrim);
  const panels=['opts','prof','cxpanel','talpanel','bugpanel','bpanel','trpanel','mkpanel','mppanel','qf9'];
  let topPanel=null;
  scrim.onclick=()=>{
    if(topPanel==='opts')optToggle(false);
    else if(topPanel==='prof')profToggle(false);
    else if(topPanel==='cxpanel')cxToggle(false);
    else if(topPanel==='qf9')qfClose();
    else {const close=$(topPanel)?.querySelector('.phead button,.mphead button,[id$="x"]');if(close)close.click();}
  };
  function updatePanels(){
    const visible=panels.filter(id=>{const e=$(id);return e&&e.style.display&&e.style.display!=='none';});
    topPanel=visible[visible.length-1]||null;
    scrim.hidden=!topPanel;document.body.classList.toggle('sf3-panel-open',!!topPanel);
    dock.hidden=MAP.open||PH.on||MENU3.on||!!window.SF2PAUSE;
    originalButtons.forEach(b=>{const active=b.id==='optb'?OPTP.open:b.id==='profb'?PROF.open:b.id==='cxb'?CXP.open:b.id==='qfb'?QF9.open:b.id==='cockb'?!!COCKPIT:b.id==='mpb'?MP.panel:false;b.classList.toggle('sf3-active',!!active);});
  }
  const oldOptions=optToggle;
  optToggle=function(on){oldOptions(on);updatePanels();};
  const oldProfile=profToggle;
  profToggle=function(on){oldProfile(on);updatePanels();};
  const oldIdeas=qfOpen;
  qfOpen=function(){oldIdeas();updatePanels();};
  const oldCloseIdeas=qfClose;
  qfClose=function(){oldCloseIdeas();updatePanels();};
  let elapsed=0;TICK.push(dt=>{elapsed+=dt;if(elapsed<.15)return;elapsed=0;updatePanels();});updatePanels();

  const menu=$('menu3');if(menu){
    const eyebrow=document.createElement('div');eyebrow.className='sf3-eyebrow';eyebrow.innerHTML=icon('planet')+'<span>UN UNIVERS À EXPLORER</span>';menu.querySelector('.m3top').prepend(eyebrow);
    const start=$('m3play'),label=/continuer|continue/i.test(start.textContent)?'Continuer l’aventure':'Commencer l’aventure';start.innerHTML='<span>'+label+'</span>'+icon('arrow');
    const progress=$('sf2-menu-progress');if(progress)progress.innerHTML=icon('chart')+'<span>Mon parcours</span>';
    $('m3opt').innerHTML=icon('gear')+'<span>Options</span>';$('m3ph').innerHTML=icon('cam')+'<span>Mode photo</span>';
    const version=menu.querySelector('.m3ver');if(version)version.textContent='STARFARER 3D · VERSION 2.8';
  }
  return Object.freeze({version:'2.8',toolbar:dock,originalButtons:originalButtons.length,settingsTabs:sections.length});
})();
