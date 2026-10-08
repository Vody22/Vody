// ===== SALON EN LIGNE AUTONOME (hors Claude) : WebRTC via PeerJS, topologie en étoile =====
// Même interface que la capacité « room » (presence, onPeers, onConnection, peers, connected).
function makeNetRoom(){if(!window.Peer)return null;
const code=(decodeURIComponent((location.hash||'').slice(1))||'public').toLowerCase().replace(/[^a-z0-9-]/g,'').slice(0,24)||'public',HOST='starfarer3d-'+code+'-host';
const peers=new Map(),hs=[],cs=[];let mine={},me=null,isHost=false,peer=null,hostConn=null,clients=new Map(),conn=false,dead=false,retryT=null;
const snap=()=>[...peers.values()];const fire=(j,u,l)=>{const ch={peers:snap(),joined:j,updated:u,left:l};hs.forEach(h=>{try{h(ch)}catch(e){console.error(e)}})};
const setConn=c=>{if(c!==conn){conn=c;cs.forEach(h=>h(c))}};
function up(id,pr,self){const ex=peers.get(id);const p=Object.freeze({peer:id,by:null,isMe:!!self,sameTab:!!self,kind:'viewer',guest:false,presence:Object.freeze(pr||{}),updatedAt:Date.now()});peers.set(id,p);ex?fire([],[p],[]):fire([p],[],[])}
function drop(id){const p=peers.get(id);if(p){peers.delete(id);fire([],[],[p])}}
function bcast(msg,except){for(const[c2,c]of clients)if(c2!==except&&c.open)try{c.send(msg)}catch(e){}}
const OPTS={debug:0,config:{iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'},{urls:'stun:global.stun.twilio.com:3478'}]}};
function start(){if(dead)return;clearTimeout(retryT);for(const id of[...peers.keys()])if(id!==me)drop(id);
// 1) essayer de devenir l'hôte du salon
const hp=new Peer(HOST,OPTS);let decided=false;
hp.on('open',id=>{decided=true;isHost=true;peer=hp;setMe(id);setConn(true);
 hp.on('connection',c=>{c.on('open',()=>{clients.set(c.peer,c);c.send({t:'all',list:snap().map(p=>({peer:p.peer,pr:p.presence}))})});
  c.on('data',m=>{if(m&&m.t=='p'&&m.pr&&typeof m.pr=='object'){up(c.peer,m.pr,false);bcast({t:'p',peer:c.peer,pr:m.pr},c.peer)}});
  const bye=()=>{if(clients.get(c.peer)===c){clients.delete(c.peer);drop(c.peer);bcast({t:'bye',peer:c.peer})}};c.on('close',bye);c.on('error',bye)});
 hp.on('disconnected',()=>{try{hp.reconnect()}catch(e){}})});
hp.on('error',e=>{if(decided){return}decided=true;try{hp.destroy()}catch(_){}if(e&&e.type=='unavailable-id')joinAsClient();else{setConn(false);retryT=setTimeout(start,4000+Math.random()*3000)}})}
// 2) sinon, rejoindre l'hôte comme client
function joinAsClient(){const p=new Peer(OPTS);peer=p;isHost=false;p.on('open',id=>{setMe(id);const c=p.connect(HOST,{reliable:false,serialization:'json'});hostConn=c;
 c.on('open',()=>{setConn(true);c.send({t:'p',pr:mine})});
 c.on('data',m=>{if(!m)return;if(m.t=='all'&&Array.isArray(m.list)){for(const x of m.list)if(x.peer!==me&&x.pr)up(x.peer,x.pr,false)}else if(m.t=='p'&&m.peer!==me&&m.pr)up(m.peer,m.pr,false);else if(m.t=='bye')drop(m.peer)});
 const lost=()=>{if(hostConn!==c)return;hostConn=null;setConn(false);try{p.destroy()}catch(_){}retryT=setTimeout(start,800+Math.random()*2500)};c.on('close',lost);c.on('error',lost)});
 p.on('error',e=>{if(e&&e.type=='peer-unavailable'){try{p.destroy()}catch(_){}retryT=setTimeout(start,1000+Math.random()*2000)}})}
function setMe(id){const old=me;me=id;if(old&&old!==id)peers.delete(old);up(me,{...mine},true)}
let lastSent=0,pend=null;
const room={code,dbg:()=>({isHost,me,clients:clients.size,hc:!!(hostConn&&hostConn.open),peers:peers.size}),presence(patch){for(const k in patch){if(patch[k]===null)delete mine[k];else mine[k]=patch[k]}if(me)up(me,{...mine},true);const msg=JSON.parse(JSON.stringify(mine));
 if(isHost)bcast({t:'p',peer:me,pr:msg});else if(hostConn&&hostConn.open)try{hostConn.send({t:'p',pr:msg})}catch(e){}return Promise.resolve()},
 onPeers(h){hs.push(h);setTimeout(()=>h({peers:snap(),joined:snap(),updated:[],left:[]}),0);return()=>{const i=hs.indexOf(h);if(i>=0)hs.splice(i,1)}},
 onConnection(h){cs.push(h);setTimeout(()=>h(conn),0);return()=>{}},peers:snap,connected:()=>conn,emit:()=>Promise.resolve(),on:()=>()=>{}};
addEventListener('pagehide',()=>{dead=true;try{peer&&peer.destroy()}catch(e){}});start();return room}
