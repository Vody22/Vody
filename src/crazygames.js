/* CrazyGames Basic Launch: solo, SDK progress and platform-controlled audio. */
const STARFARER_CRAZYGAMES=(()=>{
  if(window.SF_PORTAL!=='crazygames')return null;
  const sdk=window.CrazyGames.SDK;
  document.body.classList.add('sf-crazygames');
  const style=document.createElement('style');
  style.textContent=`body{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
    .sf-crazygames #mpb,.sf-crazygames #mppanel{display:none!important}
    @media(max-height:540px){.sf-crazygames .m3top{padding-top:16px}.sf-crazygames .m3bot{padding-bottom:14px}.sf-crazygames .m3tag{font-size:13px}.sf-crazygames #opts{max-height:calc(100dvh - 24px)}}`;
  document.head.append(style);
  // No custom account/code flow or third-party network during the solo launch.
  CLOUD.ok=false;
  $('mpb').onclick=()=>{};
  const cloudSection=$('ccode').closest('.psec');
  cloudSection.replaceChildren();
  const title=document.createElement('b');title.className='pt';title.textContent='Sauvegarde CrazyGames';
  const note=document.createElement('small');
  note.textContent='Progression enregistrée automatiquement. Connecté à CrazyGames : synchronisation entre tes appareils. Invité : sauvegarde sur cet appareil.';
  const saveButton=document.createElement('button');saveButton.textContent='Sauvegarder maintenant';
  saveButton.onclick=()=>{save();toast(window.SF_CG_SAVE_ERROR?'Sauvegarde impossible pour le moment. Réessaie.':'Partie sauvegardée avec CrazyGames');};
  cloudSection.append(title,note,saveButton);
  // Existing optRender expects these elements, even when this section is hidden.
  for(const id of ['ccode','cstat']){const e=document.createElement('span');e.id=id;e.hidden=true;cloudSection.append(e);}
  // Put flight controls first; story remains available after learning the basics.
  const story=storyTick;
  storyTick=function(dt){if(!G.x.tut9?.done||TUT9.on)return;story(dt);};
  G.x.news19=1;
  if($('m3play'))$('m3play').querySelector('span').textContent=G.time>0?'Continuer en solo':'Jouer en solo';
  let playing=false;
  const lastEvent=[-Infinity,-Infinity];
  function sync(){
    // CrazyGames handles focus/visibility events itself. Only report real breaks.
    if(document.hidden)return;
    const active=!MENU3.on&&!S.dead&&!DLG.open&&!MAP.open&&!PH.on&&
      !(window.XPAUSE>0)&&!window.SF2PAUSE&&!window.SFMobilePause&&!OPTP.open&&
      !document.body.classList.contains('sf3-panel-open');
    if(active===playing)return;
    const event=active?1:0,now=performance.now();
    // The SDK throttles repeated calls of the same type for one second. Keep
    // polling the desired state so a quick close/reopen is eventually reported.
    if(now-lastEvent[event]<1100)return;
    if(active)sdk.game.gameplayStart();else sdk.game.gameplayStop();
    lastEvent[event]=now;
    playing=active;
  }
  function audio(){
    const blocked=!!window.SF_CG_MUTE||document.hidden;
    if(!AC)return;
    if(blocked&&AC.state==='running')AC.suspend().catch(()=>{});
    else if(!blocked&&(AC.state==='suspended'||AC.state==='interrupted'))AC.resume().catch(()=>{});
  }
  sdk.game.addSettingsChangeListener(settings=>{window.SF_CG_MUTE=!!settings.muteAudio;applyVol();audio();});
  document.addEventListener('visibilitychange',audio);
  addEventListener('pointerdown',audio);addEventListener('touchend',audio);addEventListener('keydown',audio);
  TICK.push(sync);sync();audio();sdk.game.loadingStop();
  return Object.freeze({sync,version:'1.0',launch:'basic-solo'});
})();
