// ===== INTERFACE : option « Interface minimale » (Options → Affichage) =====
const MINUI={on:false};try{MINUI.on=localStorage.getItem('sf-minui')=='1'}catch(e){}
function minuiApply(){document.body.classList.toggle('minui',MINUI.on);const b=$('minuib');if(b)b.textContent=MINUI.on?'Minimale':'Complète'}
{const b=$('minuib');if(b)b.onclick=()=>{MINUI.on=!MINUI.on;try{localStorage.setItem('sf-minui',MINUI.on?'1':'0')}catch(e){}minuiApply();toast(MINUI.on?'✨ Interface minimale : seulement l\'essentiel':'✨ Interface complète')}}
{const _or=optRender;optRender=function(){_or();minuiApply()}}
minuiApply();

// les petits messages passent sous les conseils de départ au lieu de les recouvrir
{let te=null,tv=null;TICK.push(()=>{const y=window.HINTY,v=y!=null?Math.round(y+62)+'px':'';if(v===tv)return;tv=v;te=te||$('toast');if(te)te.style.top=v})}
