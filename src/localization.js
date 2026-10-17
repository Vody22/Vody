/* Presentation-only localization: save keys, model paths and game data stay intact. */
const SFL10N=(()=>{
  const dictionary=window.SF_EN||{};
  const language=window.SF_LANG==='en'?'en':'fr';
  if(language==='fr'){
    document.documentElement.lang='fr';
    return Object.freeze({language,text:value=>value,html:value=>value,tree:()=>{},version:'1.0'});
  }
  const normalize=s=>s.replace(/\s+/g,' ').trim();
  const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const values=new Set(Object.values(dictionary).map(normalize));
  const cache=new Map(),htmlCache=new Map();
  const templates=[];
  for(const [key,value]of Object.entries(dictionary)){
    if(!key.includes('__SF_SLOT_')||key===value)continue;
    const slots=[],parts=key.split(/(__SF_SLOT_\d+__)/),staticParts=[];
    const pattern=parts.map(part=>{
      if(/^__SF_SLOT_\d+__$/.test(part)){slots.push(part);return '(.+?)';}
      if(part.trim())staticParts.push(part.trim());
      return escape(part);
    }).join('');
    if(!staticParts.some(part=>/\p{L}{2}/u.test(part)))continue;
    const anchor=staticParts.sort((a,b)=>b.length-a.length)[0];
    templates.push({regex:new RegExp('^'+pattern+'$','u'),slots,value,anchor,weight:staticParts.join('').length});
  }
  templates.sort((a,b)=>b.weight-a.weight);
  const tokenKeys=Object.keys(dictionary).filter(k=>k!==dictionary[k]&&!k.includes('__SF_SLOT_')&&k.length>=3).sort((a,b)=>b.length-a.length);
  const tokens=tokenKeys.length?new RegExp(tokenKeys.map(escape).join('|'),'gu'):null;
  const letter=/[\p{L}\p{N}_]/u;
  function translated(input,depth=0){
    if(!input)return input;
    if(Object.prototype.hasOwnProperty.call(dictionary,input)&&!input.includes('__SF_SLOT_'))return dictionary[input];
    if(values.has(input))return input;
    if(depth<3)for(const template of templates){
      if(!input.includes(template.anchor))continue;
      const match=template.regex.exec(input);if(!match)continue;
      let output=template.value;
      template.slots.forEach((slot,i)=>{output=output.split(slot).join(translated(match[i+1],depth+1));});
      return output;
    }
    if(!tokens)return input;
    return input.replace(tokens,(word,at,whole)=>{
      if(letter.test(word[0])&&at>0&&letter.test(whole[at-1]))return word;
      if(letter.test(word.at(-1))&&at+word.length<whole.length&&letter.test(whole[at+word.length]))return word;
      return dictionary[word];
    });
  }
  function text(value){
    if(language!=='en'||typeof value!=='string'||!value)return value;
    if(cache.has(value))return cache.get(value);
    const core=normalize(value),output=translated(core);
    const result=output===core?value:(value.match(/^\s*/)[0]+output+value.match(/\s*$/)[0]);
    if(cache.size>3000)cache.clear();cache.set(value,result);return result;
  }
  function tree(root){
    if(language!=='en')return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let node;
    while((node=walker.nextNode())){
      if(node.parentElement?.closest('script,style,textarea,code,pre,[data-no-translate]'))continue;
      node.data=text(node.data);
    }
    for(const element of root.querySelectorAll('[title],[aria-label],[placeholder],[alt],[data-label]')){
      for(const key of ['title','aria-label','placeholder','alt','data-label'])if(element.hasAttribute(key))element.setAttribute(key,text(element.getAttribute(key)));
    }
  }
  function html(value){
    if(language!=='en'||typeof value!=='string')return value;
    if(!value.includes('<'))return text(value);
    if(htmlCache.has(value))return htmlCache.get(value);
    const holder=document.createElement('template');holder.innerHTML=value;tree(holder.content);
    const result=holder.innerHTML;if(htmlCache.size>600)htmlCache.clear();htmlCache.set(value,result);return result;
  }
  document.documentElement.lang=language;
  tree(document.body);
  return Object.freeze({language,text,html,tree,version:'1.0'});
})();
