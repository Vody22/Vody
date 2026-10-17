"""Audit the presentation catalog without network access."""
from pathlib import Path
from html.parser import HTMLParser
import ast,html,json,re,subprocess,tempfile

class Texts(HTMLParser):
 def __init__(self):super().__init__();self.text=[];self.skip=0
 def handle_starttag(self,tag,attrs):
  if tag in ['script','style']:self.skip+=1
  for k,v in attrs:
   if k in ['title','aria-label','alt','placeholder','data-label'] and v:self.text.append(v)
 def handle_endtag(self,tag):
  if tag in ['script','style']:self.skip=max(0,self.skip-1)
 def handle_data(self,data):
  if not self.skip:self.text.append(data)

def visible(s):
 if re.search(r'<[a-zA-Z/!][^>]*',s):
  p=Texts()
  try:p.feed(s);return p.text
  except:return []
 return [s]

def candidate(s):
 s=html.unescape(re.sub(r'\s+',' ',s)).strip()
 if not re.search(r'[A-Za-zÀ-ÿ]',s):return None
 if re.match(r'^(https?:|data:|models/|cities/|sf-|m24-|i-|#|\.|\[)',s):return None
 if re.search(r'(?:[a-zA-Z-]+:|\b)(?:rgba?\(|position:|display:|void main|uniform |varying |vec[234] |document\.|window\.|function\(|=>|gl_FragColor|gl_Position|\.glb\b|\.jpg\b|\.png\b|\.js\b)',s):return None
 if re.fullmatch(r'[a-zA-Z0-9_.:/#=,;+%(){}*<>!?\\-]+',s) and (re.search(r'[_:/#=(){}*<>\\]',s) or re.search(r'[a-z][A-Z]',s) or re.search(r'\d',s)):return None
 if s.startswith('--') or s in ['undefined','null','true','false','none','block','flex','grid','inline','absolute','fixed','relative','pointer','click','pointerdown','pointerup','keydown','keyup','input','change','button','div','span','canvas','script','style']:return None
 if len(s)>5000:return None
 return s

root=Path(__file__).resolve().parent.parent
mods=ast.literal_eval(re.search(r'^MODS = (.+)$',(root/'build.py').read_text(encoding='utf-8'),re.M).group(1))
with tempfile.TemporaryDirectory(prefix='starfarer-locale-audit-') as directory:
 folder=Path(directory);raw=folder/'source.js';items=folder/'strings.json'
 raw.write_text('\n'.join((root/'src'/f'{name}.js').read_text(encoding='utf-8') for name in mods),encoding='utf-8')
 subprocess.run(['node',str(root/'dev/localize.mjs'),str(raw),str(folder/'instrumented.js'),str(items)],check=True,capture_output=True)
 strings=json.loads(items.read_text(encoding='utf-8'))
strings.append((root/'src/shell.html').read_text(encoding='utf-8'))
catalog=json.loads((root/'src/locales/en.json').read_text(encoding='utf-8'))
catalog.update(json.loads((root/'src/locales/en-overrides.json').read_text(encoding='utf-8')))
keys=set()
for text in strings:
 for fragment in visible(text):
  key=candidate(fragment)
  if key:keys.add(key)
missing=sorted(keys-catalog.keys())
result={'sourceCandidates':len(keys),'catalogEntries':len(catalog),'unmappedCandidates':len(missing),'missing':missing}
print(json.dumps(result,ensure_ascii=False,indent=2))
raise SystemExit(1 if missing else 0)
