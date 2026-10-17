const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function setup(){
  const c={console,Math,innerWidth:1280,innerHeight:720};vm.createContext(c);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../dev/three.min.js'),'utf8'),c);
  vm.runInContext(`var V3=THREE.Vector3,en=[],t=30,mode='space',GR=null,FOOT={on:false},S={pos:new V3(),dead:false},W7={raid:null,sayT:0},TICK=[],hits=[],bubbles=[],steers=[],calls=0,flashes=0;
    function hitEnemy(e,d,p){hits.push(d);e.hp-=d;}function updEnemies(){}function overlay(){}function reskin(){}function fxGlow(){flashes++;}
    function w7Upd(){calls++;}function w7Steer(N,p,spd){steers.push({p:p.clone(),spd});}function w7Bub(N,s){bubbles.push(s);}
    function w7RaidEnd(){W7.raid=null;}function w7Talk(){calls++;}function talk(n){calls++;n.say='Bonjour';}function isPaused(){return false;}`,c);
  vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/encounters-v27.js'),'utf8'),c);return c;
}
test('heavy salvo waits 850ms; interrupted charge must restart',()=>{
 const c=setup();vm.runInContext(`var e={ty:'lourd'};`,c);
 assert.equal(vm.runInContext('encounter27Ready(e,.1)',c),false);
 for(let i=0;i<8;i++)assert.equal(vm.runInContext('encounter27Ready(e,.1)',c),false);
 assert.equal(vm.runInContext('encounter27Ready(e,.1)',c),true);
 assert.equal(vm.runInContext('encounter27Ready(e,.1)',c),false);
 assert.equal(vm.runInContext("encounter27Ready({ty:'chasseur'},.1)",c),true);
 assert.equal(vm.runInContext("encounter27Ready({ty:'lourd',bomb:true},.1)",c),true);
});
test('support shield has finite energy, group/range checks and never heals hull',()=>{
 const c=setup();vm.runInContext(`var victim={hp:10,pos:new V3(),sz:12,ai3:{st:'atk',grp:1}},support={hp:5,mhp:5,pos:new V3(100,0,0),tactic27:'support',cover27:2,ai3:{st:'atk',grp:1}};en=[victim,support];hitEnemy(victim,4,victim.pos);`,c);
 assert.equal(c.hits[0],2);assert.equal(vm.runInContext('support.cover27',c),0);
 vm.runInContext('hitEnemy(victim,4,victim.pos)',c);assert.equal(c.hits[1],4);
 vm.runInContext('support.cover27=2;support.ai3.grp=2;hitEnemy(victim,1,victim.pos)',c);assert.equal(c.hits[2],1);
 vm.runInContext('support.ai3.grp=1;support.pos.x=421;hitEnemy(victim,1,victim.pos)',c);assert.equal(c.hits[3],1);
 vm.runInContext('support.pos.x=100;support.dead=true;hitEnemy(victim,1,victim.pos)',c);assert.equal(c.hits[4],1);
});
test('support cooldown cannot refill every frame; mission foes excluded',()=>{
 const c=setup();vm.runInContext(`var e={ty:'pirate',hp:5,mhp:5,pos:new V3(),lead:{ty:'lourd'},ai3:{st:'atk',grp:1}};en=[e];updEnemies(.1,2);`,c);
 assert.equal(vm.runInContext('e.tactic27',c),'support');
 vm.runInContext('e.cover27=0;updEnemies(.1,2)',c);assert.equal(vm.runInContext('e.cover27',c),0);
 vm.runInContext('updEnemies(9,2)',c);assert.ok(vm.runInContext('e.cover27>0',c));
 assert.equal(vm.runInContext('encounter27Support({...e,ai3:{ext:1}})',c),false);
});
test('civilian evades hostility, resumes route and does not override docking or raids',()=>{
 const c=setup();vm.runInContext(`var threat={pos:new V3(100,0,0),ai3:{st:'atk'}},n={sp:100,job:'cargo',ph:'cruise',F:{pos:new V3()}};en=[threat];w7Upd(n,.1);`,c);
 assert.equal(c.steers.length,1);assert.ok(c.steers[0].p.x<0);assert.equal(c.calls,0);
 vm.runInContext("threat.ai3.st='patrol';w7Upd(n,.1)",c);assert.equal(c.calls,1);
 vm.runInContext("threat.ai3.st='atk';n.ph='approach';w7Upd(n,1)",c);assert.equal(c.calls,2);
 vm.runInContext("n.ph='cruise';W7.raid={N:n};w7Upd(n,1)",c);assert.equal(c.calls,3);
});
test('NPC chatter keeps quest and service dialogue; rescue thanks grants no duplicate reward',()=>{
 const c=setup();vm.runInContext(`var n={R:{},sayT:0};talk(n);talk(n);`,c);assert.match(vm.runInContext('n.say',c),/Content/);
 vm.runInContext('n.quest=true;talk(n)',c);assert.equal(vm.runInContext('n.say',c),'Bonjour');
 vm.runInContext('n.quest=false;n.R.repair=1;talk(n)',c);assert.equal(vm.runInContext('n.say',c),'Bonjour');
 vm.runInContext(`var ship={F:{pos:new V3()}};W7.raid={N:ship,pk:1};w7RaidEnd(true);w7Talk(ship);w7Talk(ship);`,c);
 assert.equal(c.bubbles.length,1);assert.match(c.bubbles[0],/aide/);
});
