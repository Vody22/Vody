(()=>{const me='p'+Math.random().toString(36).slice(2,8),bc=new BroadcastChannel('mockroom');let mine={};const peers=new Map();const hs=[];const conn=[];
const snap=()=>[...peers.values()];
function fire(j,u,l){const ch={peers:snap(),joined:j,updated:u,left:l};hs.forEach(h=>h(ch))}
function upsert(peer,pres,self){const ex=peers.get(peer);const p=Object.freeze({peer,by:'u_'+peer,isMe:self,sameTab:self,kind:'viewer',guest:false,presence:Object.freeze({...pres}),updatedAt:Date.now()});peers.set(peer,p);if(ex)fire([],[p],[]);else fire([p],[],[])}
bc.onmessage=e=>{const m=e.data;if(m.t=='p')upsert(m.peer,m.pr,false);if(m.t=='hello')bc.postMessage({t:'p',peer:me,pr:mine});if(m.t=='bye'){const p=peers.get(m.peer);if(p){peers.delete(m.peer);fire([],[],[p])}}};
const room={presence(patch){for(const k in patch){if(patch[k]===null)delete mine[k];else mine[k]=patch[k]}upsert(me,mine,true);bc.postMessage({t:'p',peer:me,pr:JSON.parse(JSON.stringify(mine))});return Promise.resolve()},
onPeers(h){hs.push(h);setTimeout(()=>h({peers:snap(),joined:snap(),updated:[],left:[]}),0);return()=>{}},peers:snap,connected:()=>true,onConnection(h){setTimeout(()=>h(true),0);return()=>{}},emit(){return Promise.resolve()},on(){return()=>{}}};
const user={profiles:async ids=>Object.fromEntries((Array.isArray(ids)?ids:[ids]).map(i=>[i,{id:i,name:'Ami '+i.slice(-3),avatarUrl:'',color:'#888',email:null,isMe:false,guest:false}])),id:async()=>'u_'+me};
window.claude={use:async n=>n=='room'?room:n=='user'?user:null};bc.postMessage({t:'hello'});addEventListener('pagehide',()=>bc.postMessage({t:'bye',peer:me}))})();
