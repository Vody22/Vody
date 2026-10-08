(()=>{const bc=new BroadcastChannel('mockpeer');const peersHere=new Map();
class Em{constructor(){this.h={}}on(e,f){(this.h[e]=this.h[e]||[]).push(f);return this}emit(e,...a){(this.h[e]||[]).forEach(f=>f(...a))}}
class Conn extends Em{constructor(local,remote,cid){super();this.local=local;this.peer=remote;this.cid=cid;this.open=false}send(d){bc.postMessage({k:'data',to:this.peer,from:this.local.id,cid:this.cid,d:JSON.parse(JSON.stringify(d))})}close(){if(!this.open)return;this.open=false;bc.postMessage({k:'close',to:this.peer,from:this.local.id,cid:this.cid});this.emit('close')}}
class Peer extends Em{constructor(id){super();if(typeof id!='string')id='r'+Math.random().toString(36).slice(2,9);this.id=id;this.conns={};this.dead=false;
 setTimeout(()=>{const ts=+localStorage.getItem('mp:'+id)||0;if(ts){this.emit('error',{type:'unavailable-id'});return}this.alive=true;peersHere.set(id,this);this.hb=setInterval(()=>localStorage.setItem('mp:'+id,Date.now()),400);localStorage.setItem('mp:'+id,Date.now());this.emit('open',id)},50)}
 connect(rid){const cid=Math.random().toString(36).slice(2);const c=new Conn(this,rid,cid);this.conns[cid]=c;bc.postMessage({k:'req',to:rid,from:this.id,cid});c.t=setTimeout(()=>{if(!c.open)this.emit('error',{type:'peer-unavailable'})},1500);return c}
 destroy(){this.dead=true;clearInterval(this.hb);localStorage.removeItem('mp:'+this.id);for(const c of Object.values(this.conns))c.close();peersHere.delete(this.id)}reconnect(){}}
bc.onmessage=e=>{const m=e.data,p=peersHere.get(m.to);if(!p||p.dead)return;
 if(m.k=='req'){const c=new Conn(p,m.from,m.cid);p.conns[m.cid]=c;c.open=true;bc.postMessage({k:'ack',to:m.from,from:p.id,cid:m.cid});p.emit('connection',c);setTimeout(()=>c.emit('open'),0)}
 else if(m.k=='ack'){const c=p.conns[m.cid];if(c){c.open=true;clearTimeout(c.t);c.emit('open')}}
 else if(m.k=='data'){const c=p.conns[m.cid];if(c&&c.open)c.emit('data',m.d)}
 else if(m.k=='close'){const c=p.conns[m.cid];if(c&&c.open){c.open=false;c.emit('close')}}};
addEventListener('pagehide',()=>{for(const p of peersHere.values())p.destroy()});
window.Peer=Peer})();
