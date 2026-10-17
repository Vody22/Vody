/* Build-time presentation boundary instrumentation. Acorn is MIT licensed. */
import {parse} from './acorn.mjs';
import fs from 'node:fs';
const [input,output,catalog]=process.argv.slice(2);
const source=fs.readFileSync(input==='-'?0:input,'utf8');
const tree=parse(source,{ecmaVersion:'latest',sourceType:'script',allowReturnOutsideFunction:true});
const strings=new Set(),ranges=new Map();
const fields=new Set(['textContent','innerText','innerHTML','outerHTML','title','placeholder','ariaLabel']);
function name(node){return node?.type==='Identifier'?node.name:node?.type==='Literal'?node.value:null;}
function wrap(node,html=false){if(!node)return;const key=node.start+':'+node.end;if(!ranges.has(key))ranges.set(key,{start:node.start,end:node.end,html});}
function walk(node,parent){
 if(!node||typeof node!=='object')return;
 if(node.type==='Literal'&&typeof node.value==='string')strings.add(node.value);
 if(node.type==='TemplateLiteral'){
  strings.add(node.quasis.map((q,i)=>(q.value.cooked??q.value.raw)+(i<node.expressions.length?'__SF_SLOT_'+i+'__':'')).join(''));
  for(const q of node.quasis)strings.add(q.value.cooked??q.value.raw);
 }
 if(node.type==='BinaryExpression'&&node.operator==='+'&&!(parent?.type==='BinaryExpression'&&parent.operator==='+')){
  const leaves=[];function flatten(n){if(n.type==='BinaryExpression'&&n.operator==='+'){flatten(n.left);flatten(n.right);}else leaves.push(n);}flatten(node);
  if(leaves.some(n=>n.type==='Literal'&&typeof n.value==='string'&&/[A-Za-zÀ-ÿ]/.test(n.value))){
    let slot=0;strings.add(leaves.map(n=>n.type==='Literal'&&typeof n.value==='string'?n.value:'__SF_SLOT_'+slot+++'__').join(''));
  }
 }
 if(node.type==='AssignmentExpression'&&node.operator==='='&&node.left.type==='MemberExpression'){
  const field=name(node.left.property);if(fields.has(field))wrap(node.right,field.includes('HTML'));
  if(field==='label'&&node.left.object.type==='MemberExpression'&&name(node.left.object.property)==='dataset')wrap(node.right);
 }
 if(node.type==='CallExpression'){
  const fn=node.callee,args=node.arguments;
  if(fn.type==='Identifier'&&['alert','confirm','prompt'].includes(fn.name))wrap(args[0]);
  if(fn.type==='MemberExpression'){
   const method=name(fn.property);
   if(['fillText','strokeText','measureText','createTextNode'].includes(method))wrap(args[0]);
   if(method==='insertAdjacentHTML')wrap(args[1],true);
   if(method==='setAttribute'&&['title','aria-label','placeholder','alt','data-label'].includes(args[0]?.value))wrap(args[1]);
   if(method==='append'||method==='prepend')for(const arg of args)wrap(arg);
  }
 }
 for(const [key,value]of Object.entries(node)){
  if(key==='start'||key==='end')continue;
  if(Array.isArray(value))for(const child of value)walk(child,node);
  else if(value&&typeof value==='object'&&value.type)walk(value,node);
 }
}
walk(tree);
// Insert around expressions instead of replacing them so nested assignments and
// template expressions remain valid and preserve their original evaluation order.
const inserts=new Map();
function add(at,text,order){if(!inserts.has(at))inserts.set(at,[]);inserts.get(at).push({text,order});}
for(const r of ranges.values()){add(r.start,'SFL10N.'+(r.html?'html':'text')+'(', -r.end);add(r.end,')',-r.start);}
let result=source;
for(const at of [...inserts.keys()].sort((a,b)=>b-a))result=result.slice(0,at)+inserts.get(at).sort((a,b)=>a.order-b.order).map(v=>v.text).join('')+result.slice(at);
if(output==='-')process.stdout.write(result);else if(output)fs.writeFileSync(output,result);
if(catalog)fs.writeFileSync(catalog,JSON.stringify([...strings]));
console.error(JSON.stringify({strings:strings.size,boundaries:ranges.size}));
