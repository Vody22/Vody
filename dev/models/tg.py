import sys,base64,json
from playwright.sync_api import sync_playwright
SP="/tmp/claude-0/-home-claude/e9a2cc42-50ae-59a7-8157-28aa470b270d/scratchpad/flyer/"
def save(d,n): open(SP+n,"wb").write(base64.b64decode(d.split(',')[1]))
url,tag,target=sys.argv[1],sys.argv[2],int(sys.argv[3])
with sync_playwright() as pw:
    b=pw.chromium.launch(args=["--use-gl=swiftshader","--enable-unsafe-swiftshader","--js-flags=--max-old-space-size=8000"]);A=b.new_page(viewport={"width":1100,"height":620});A.on("pageerror",lambda e:print("E",e))
    A.goto("http://127.0.0.1:8795/conv.html?"+tag);A.set_default_timeout(600000);import time;time.sleep(3);print(A.evaluate(f"load('{url}')"))
    if len(sys.argv)>4: print('miroir',A.evaluate('mirrorX()'))
    if target>0:
        print(A.evaluate(f"simp({target},0.05,['Permissive'])"));print(A.evaluate("crease(40)"))
        for n,(y,p) in {'q':(0.8,0.4),'top':(0,1.5708),'side':(1.5708,0)}.items(): save(A.evaluate(f"show('out',{y},{p})"),f"{tag}_{n}.png")
        open(SP+tag+".glb","wb").write(base64.b64decode(A.evaluate("exportGLB()")))
    b.close()
