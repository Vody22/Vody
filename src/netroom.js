// ===== SALON EN LIGNE AUTONOME (hors Claude) : WebRTC via PeerJS, topologie en étoile =====
// Même interface que la capacité « room » (presence, onPeers, onConnection, peers, connected).
// Salon public = découpé en zones (réseau galactique, mmo.js) : room.switchTo(code) change de salon sans recharger.
// Salon privé = code après # dans l'URL : un seul salon fixe, pas de zones.
function netCode(s){return String(s||'').toLowerCase().replace(/[^a-z0-9-]/g,'').slice(0,24)}
function makeNetRoom(){if(!window.Peer)return null;
const priv=netCode(decodeURIComponent((location.hash||'').slice(1)));
let code=priv||'public',HOST='';const hostOf=c=>'starfarer3d-'+c+'-host';
const peers=new Map(),hs=[],cs=[];let mine={},me=null,isHost=false,peer=null,hostConn=null,clients=new Map(),conn=false,dead=false,retryT=null,gen=0;
const snap=()=>[...peers.values()];const fire=(j,u,l)=>{const ch={peers:snap(),joined:j,updated:u,left:l};hs.forEach(h=>{try{h(ch)}catch(e){console.error(e)}})};
const setConn=c=>{if(c!==conn){conn=c;cs.forEach(h=>h(c))}};
function up(id,pr,self){const ex=peers.get(id);const p=Object.freeze({peer:id,by:null,isMe:!!self,sameTab:!!self,kind:'viewer',guest:false,presence:Object.freeze(pr||{}),updatedAt:Date.now()});peers.set(id,p);ex?fire([],[p],[]):fire([p],[],[])}
function drop(id){const p=peers.get(id);if(p){peers.delete(id);fire([],[],[p])}}
function bcast(msg,except){for(const[c2,c]of clients)if(c2!==except&&c.open)try{c.send(msg)}catch(e){}}
const OPTS={debug:0,config:{iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:global.stun.twilio.com:3478'}]}};
// coupe tout (changement de salon) : les anciens rappels sont ignorés grâce au numéro de génération
function teardown(){gen++;clearTimeout(retryT);const old=peer;peer=null;hostConn=null;isHost=false;const cl=[...clients.values()];clients.clear();for(const c of cl)try{c.close()}catch(e){}try{old&&old.destroy()}catch(e){}for(const id of[...peers.keys()])if(id!==me)drop(id);setConn(false)}
function start(){if(dead)return;clearTimeout(retryT);const g=++gen;HOST=hostOf(code);for(const id of[...peers.keys()])if(id!==me)drop(id);
// 1) essayer de devenir l'hôte du salon
const hp=new Peer(HOST,OPTS);let decided=false;
hp.on('open',id=>{if(g!==gen){try{hp.destroy()}catch(e){}return}decided=true;isHost=true;peer=hp;setMe(id);setConn(true);
 hp.on('connection',c=>{if(g!==gen)return;c.on('open',()=>{if(g!==gen)return;clients.set(c.peer,c);c.send({t:'all',list:snap().map(p=>({peer:p.peer,pr:p.presence}))})});
  c.on('data',m=>{if(g!==gen)return;if(m&&m.t=='p'&&m.pr&&typeof m.pr=='object'){up(c.peer,m.pr,false);bcast({t:'p',peer:c.peer,pr:m.pr},c.peer)}});
  const bye=()=>{if(g!==gen)return;if(clients.get(c.peer)===c){clients.delete(c.peer);drop(c.peer);bcast({t:'bye',peer:c.peer})}};c.on('close',bye);c.on('error',bye)});
 hp.on('disconnected',()=>{if(g!==gen)return;try{hp.reconnect()}catch(e){}})});
hp.on('error',e=>{if(g!==gen||decided)return;decided=true;try{hp.destroy()}catch(_){}if(e&&e.type=='unavailable-id')joinAsClient(g);else{setConn(false);retryT=setTimeout(start,4000+Math.random()*3000)}})}
// 2) sinon, rejoindre l'hôte comme client
function joinAsClient(g){const p=new Peer(OPTS);peer=p;isHost=false;p.on('open',id=>{if(g!==gen){try{p.destroy()}catch(e){}return}setMe(id);const c=p.connect(HOST,{reliable:false,serialization:'json'});hostConn=c;
 c.on('open',()=>{if(g!==gen)return;setConn(true);c.send({t:'p',pr:mine})});
 c.on('data',m=>{if(g!==gen||!m)return;if(m.t=='all'&&Array.isArray(m.list)){for(const x of m.list)if(x.peer!==me&&x.pr)up(x.peer,x.pr,false)}else if(m.t=='p'&&m.peer!==me&&m.pr)up(m.peer,m.pr,false);else if(m.t=='bye')drop(m.peer)});
 const lost=()=>{if(g!==gen||hostConn!==c)return;hostConn=null;setConn(false);try{p.destroy()}catch(_){}retryT=setTimeout(start,800+Math.random()*2500)};c.on('close',lost);c.on('error',lost)});
 p.on('error',e=>{if(g!==gen)return;if(e&&e.type=='peer-unavailable'){try{p.destroy()}catch(_){}retryT=setTimeout(start,1000+Math.random()*2000)}})}
function setMe(id){const old=me;me=id;if(old&&old!==id)peers.delete(old);up(me,{...mine},true)}
const room={get code(){return code},priv:!!priv,dbg:()=>({code,isHost,me,clients:clients.size,hc:!!(hostConn&&hostConn.open),peers:peers.size}),
 switchTo(c){c=netCode(c);if(priv||!c||c===code||dead)return false;code=c;teardown();retryT=setTimeout(start,150);return true},
 presence(patch){for(const k in patch){if(patch[k]===null)delete mine[k];else mine[k]=patch[k]}if(me)up(me,{...mine},true);const msg=JSON.parse(JSON.stringify(mine));
 if(isHost)bcast({t:'p',peer:me,pr:msg});else if(hostConn&&hostConn.open)try{hostConn.send({t:'p',pr:msg})}catch(e){}return Promise.resolve()},
 onPeers(h){hs.push(h);setTimeout(()=>h({peers:snap(),joined:snap(),updated:[],left:[]}),0);return()=>{const i=hs.indexOf(h);if(i>=0)hs.splice(i,1)}},
 onConnection(h){cs.push(h);setTimeout(()=>h(conn),0);return()=>{}},peers:snap,connected:()=>conn,emit:()=>Promise.resolve(),on:()=>()=>{}};
addEventListener('pagehide',()=>{dead=true;try{peer&&peer.destroy()}catch(e){}});
// zone de départ (réseau galactique) calculée au premier passage, quand tous les modules sont chargés
setTimeout(()=>{if(!priv&&typeof netZone=='function'){try{const z=netZone();if(z&&z.c)code=netCode(z.c)||code}catch(e){}}start()},0);return room}
