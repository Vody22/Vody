/* Explicit override; the platform locale remains the default on first launch. */
const STARFARER_LANGUAGE=(()=>{
  function select(language){
    if(language===SFL10N.language)return;
    save();localStorage.setItem('sf-language',language);
    window.SF2PAUSE=true;
    toast(language==='en'?'Switching to English…':'Passage en français…');
    setTimeout(()=>{const url=new URL(location.href);url.searchParams.set('lang',language);location.replace(url.href);},1200);
  }
  function controls(){
    const row=document.createElement('label');row.className='orow sf-language';
    const label=document.createElement('span');label.textContent='Langue';
    const choice=document.createElement('select');choice.setAttribute('aria-label','Langue du jeu');choice.dataset.noTranslate='true';
    for(const [value,name]of [['en','English'],['fr','Français']]){const option=document.createElement('option');option.value=value;option.text=name;option.lang=value;choice.append(option);}
    choice.value=SFL10N.language;choice.onchange=()=>select(choice.value);row.append(label,choice);return row;
  }
  const section=$('sf3-settings-section-0');if(section)section.append(controls());
  const menu=$('menu3');if(menu)menu.querySelector('.m3bot')?.append(controls());
  const style=document.createElement('style');style.textContent='.sf-language{gap:12px;max-width:100%;min-height:36px}.sf-language select{background:#132b3c;color:#e8f6ff;border:1px solid #86b9d344;border-radius:8px;padding:7px 12px;font:500 12px var(--hf)}.m3bot>.sf-language{justify-content:center;margin-top:6px;font-size:11px;color:#b3cad8}';document.head.append(style);
  return Object.freeze({select});
})();
