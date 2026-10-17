const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),source=fs.readFileSync(path.join(root,'src/localization.js'),'utf8');
const dictionary={...JSON.parse(fs.readFileSync(path.join(root,'src/locales/en.json'))),...JSON.parse(fs.readFileSync(path.join(root,'src/locales/en-overrides.json')))};
function locale(language){
 const context={window:{SF_LANG:language,SF_EN:dictionary},document:{documentElement:{},body:{querySelectorAll:()=>[]},createTreeWalker:()=>({nextNode:()=>null})},NodeFilter:{SHOW_TEXT:4}};
 vm.createContext(context);vm.runInContext(source,context);return vm.runInContext('SFL10N',context);
}
test('French stays byte-identical, including dynamic progress and HTML',()=>{
 const l=locale('fr');for(const s of ['Bouclier','Coque 125 / 200','  Rejoins la balise Écho-1  ','<b>Atelier</b>'])assert.equal(l.text(s),s);
});
test('English core controls use reviewed game terminology',()=>{
 const l=locale('en');for(const [fr,en]of [['Bouclier','Shield'],['Coque','Hull'],['Tonneau','Roll'],['Leurres','Flares'],['GAZ','THROTTLE'],['Son','Audio'],['Atelier','Workshop'],['Langue','Language']])assert.equal(l.text(fr),en);
});
test('dynamic numbers and original source strings remain intact',()=>{
 const l=locale('en'),input='Coque 125 / 200';assert.equal(l.text(input),'Hull 125 / 200');assert.equal(input,'Coque 125 / 200');assert.equal(l.text('  Bouclier  '),'  Shield  ');
});
test('story is translated before typewriter animation begins',()=>{
 const l=locale('en');assert.equal(l.text('Pilote, ici la Commandante Iris Valen, Base Alpha. Bienvenue dans le secteur.'),'Pilot, this is Commander Iris Valen at Alpha Base. Welcome to the sector.');
});
test('all template variables survive translation, including repeated variables',()=>{
 for(const [key,value]of Object.entries(dictionary)){
  const slots=s=>(s.match(/__SF_SLOT_\d+__/g)||[]).sort();assert.deepEqual(slots(key),slots(value),key);
 }
});
test('language rendering accepts numbers and missing values without changing type',()=>{
 const l=locale('en');for(const value of [null,undefined,0,42,false])assert.equal(l.text(value),value);
});
