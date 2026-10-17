/* Loaded before the game; SDK storage must be ready before synchronous load(). */
window.SF_CG_ERROR = function() {
  let box = document.getElementById('loading');
  if (!box) { box=document.createElement('div');box.id='loading';document.body.append(box); }
  box.replaceChildren();
  box.append('Connection unavailable / Connexion indisponible');
  const note=document.createElement('small');
  note.textContent='Your save has not been changed. / Ta sauvegarde est conservée.';
  const retry=document.createElement('button');retry.textContent='Retry / Réessayer';
  retry.onclick=()=>location.reload();box.append(note,retry);
};
window.SF_CG_READY = (async function() {
  const sdk=window.CrazyGames&&window.CrazyGames.SDK;
  if (!sdk) throw new Error('CrazyGames SDK unavailable');
  let timeout;
  try {
    await Promise.race([sdk.init(),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('SDK initialization timed out')),20000);})]);
  } finally {clearTimeout(timeout);}
  if (sdk.environment==='disabled') throw new Error('Use CrazyGames Preview or localhost');
  sdk.data.getItem('starfarer3d-v1'); // Fail visibly if Progress Save is disabled.
  window.SFStorage={
    getItem:key=>sdk.data.getItem(key),
    setItem(key,value){
      try{sdk.data.setItem(key,value);window.SF_CG_SAVE_ERROR=false;}
      catch(error){window.SF_CG_SAVE_ERROR=true;throw error;}
    },
    removeItem:key=>sdk.data.removeItem(key)
  };
  let locale='en';
  try{locale=sdk.user.systemInfo?.locale||'en';}catch(_){}
  const requested=new URLSearchParams(location.search).get('lang');
  window.SF_LANG=/^fr/i.test(requested||sdk.data.getItem('sf-language')||locale)?'fr':'en';
  window.SF_CG_MUTE=!!sdk.game.settings?.muteAudio;
  sdk.game.loadingStart();
  return sdk;
})();
// Attach a rejection handler immediately, including when the body is not parsed.
window.SF_CG_READY.catch(()=>{
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',window.SF_CG_ERROR,{once:true});
  else window.SF_CG_ERROR();
});
