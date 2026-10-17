const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync(new URL('../src/crazygames-boot.js','file://'+__filename.replaceAll('\\','/')),'utf8');
function environment(options={}){
 const data=new Map([['starfarer3d-v1','{"cr":4321}']]),calls=[];
 const sdk={environment:options.disabled?'disabled':'local',init:options.init||(()=>Promise.resolve()),data:{getItem:key=>{if(options.dataDisabled)throw Error('disabled data');return data.get(key)||null;},setItem:(key,value)=>{if(options.quota)throw Error('quota');data.set(key,value);},removeItem:key=>data.delete(key)},game:{settings:{muteAudio:!!options.mute},loadingStart:()=>calls.push('loadingStart')}};
 sdk.user={systemInfo:{locale:options.locale}};
 const context={window:{CrazyGames:options.missing?null:{SDK:sdk}},document:{readyState:'loading',addEventListener(){}},location:{search:options.search||''},URLSearchParams,setTimeout,clearTimeout};
 vm.createContext(context);vm.runInContext(source,context);return{window:context.window,data,calls};
}
test('game waits for SDK initialization and keeps existing progress',async()=>{
 let done;const e=environment({init:()=>new Promise(r=>done=r)});
 assert.equal(e.window.SFStorage,undefined);assert.deepEqual(e.calls,[]);
 done();await e.window.SF_CG_READY;
 assert.equal(e.window.SFStorage.getItem('starfarer3d-v1'),'{"cr":4321}');assert.deepEqual(e.calls,['loadingStart']);
 e.window.SFStorage.setItem('new','42');assert.equal(e.data.get('new'),'42');e.window.SFStorage.removeItem('new');assert.equal(e.data.has('new'),false);
});
test('SDK errors never fall back to another local save',async()=>{
 for(const options of [{missing:true},{disabled:true},{dataDisabled:true},{init:()=>Promise.reject(Error('offline'))}]){
  const e=environment(options);await assert.rejects(e.window.SF_CG_READY);assert.equal(e.window.SFStorage,undefined);assert.deepEqual(e.calls,[]);assert.equal(e.data.get('starfarer3d-v1'),'{"cr":4321}');
 }
});
test('platform mute is available before audio can start',async()=>{const e=environment({mute:true});await e.window.SF_CG_READY;assert.equal(e.window.SF_CG_MUTE,true);});
test('SDK locale selects French with English fallback and explicit override',async()=>{
 for(const [options,expected]of [[{},'en'],[{locale:'fr-FR'},'fr'],[{locale:'es-ES'},'en'],[{locale:'fr-FR',search:'?lang=en'},'en']]){const e=environment(options);await e.window.SF_CG_READY;assert.equal(e.window.SF_LANG,expected);}
});
test('failed saves are reported and never replace valid progress',async()=>{
 const e=environment({quota:true});await e.window.SF_CG_READY;assert.throws(()=>e.window.SFStorage.setItem('starfarer3d-v1','{}'));assert.equal(e.window.SF_CG_SAVE_ERROR,true);assert.equal(e.data.get('starfarer3d-v1'),'{"cr":4321}');
});
