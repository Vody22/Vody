#!/usr/bin/env python3
"""Construit index.html (version en ligne, multijoueur PeerJS) à partir de src/.
   python3 build.py                 -> index.html
   python3 build.py --claude OUT    -> en plus, version artefact Claude (salon « room ») dans OUT
   python3 build.py --check OUT.js  -> écrit aussi le JS concaténé (pour node --check)
   python3 build.py --portal        -> en plus, dist/crazygames.zip et dist/poki.zip (sites de jeux web : chemins relatifs,
                                       Three.js inclus, serveurs du jeu sur star-vody.vercel.app, pas de mise à jour auto)"""
import os, sys, time
D = os.path.dirname(os.path.abspath(__file__)) + '/'
S = D + 'src/'
MODS = ['core','audio','gfx','models','world','game','surface','fx','ultra','detail','content','lasers','parts','cockpit','speed','sounds','visuals','chars','ground','story','explore','prog','planet2','daynight','gfxplus','weather2','base','netroom','mp','mpplus','hud','ui','options','svc','codex','law','wing','tools','anomaly','war','fmiss','race','derelict','board','combat','foes','talents','econ2','stations2','space2','jump','fx2','caves','gfx3','worlds3','space3','galmap','surf3','ship3','render3','hud3','model3','ground3','hangar3','anim3','ai3','custom3','dmg3','nat3','mega3','event3','walk3','perf3','snd3','diff3','mmo','mmo3','w1','w2','w4','w5','w6','w7','w7m','ui4','w8','w9','chars4','chars5','glchar','ship4','mdl4','sky4','pl4','wg4','city4','vox','voxp','vxast','saga','traf','fin5','photo','menu']
EXS = ['CopyShader','LuminosityHighPassShader','EffectComposer','RenderPass','ShaderPass','UnrealBloomPass','SSAOShader','BokehShader','BokehPass','GLTFLoader','SkeletonUtils']
import base64
FONTS = ''.join("@font-face{font-family:'Chakra Petch';font-style:normal;font-weight:%d;font-display:swap;src:url(data:font/woff;base64,%s) format('woff')}" % (w, base64.b64encode(open(S+'fonts/cp-'+n+'.woff','rb').read()).decode()) for n,w in [('Medium',500),('SemiBold',600),('Bold',700)])
sh = open(S+'shell.html').read().replace('%%FONTS%%', FONTS)
game = ''.join(open(S+m+'.js').read()+'\n' for m in MODS)
EX = '<script>' + ''.join(open(S+'three-examples/'+e+'.js').read()+'\n' for e in EXS) + '</script>'
chk = '<script>if(!window.THREE)document.getElementById("loading").innerHTML="STARFARER 3D<small>Impossible de charger le moteur 3D. Vérifie ta connexion et recharge la page.</small>"</script>'
cdn = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n<script>window.THREE||document.write(\'<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"><\\/script>\')</script>'
pj = ('<meta name="sf-build" content="'+time.strftime('%Y%m%d-%H%M%S')+'">'
      '<script>window.SF_STANDALONE=1</script><script src="https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js"></script>\n'
      '<script>window.Peer||document.write(\'<script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"><\\/script>\')</script>')
OUT = sh.replace('%%THREE%%', pj+cdn+chk+EX).replace('%%GAME%%', game)
open(D+'index.html','w').write(OUT)
os.makedirs(D+'public', exist_ok=True)
open(D+'public/index.html','w').write(OUT)
a = sys.argv[1:]
if '--claude' in a: open(a[a.index('--claude')+1],'w').write(sh.replace('%%THREE%%', cdn+chk+EX).replace('%%GAME%%', game))
if '--check' in a: open(a[a.index('--check')+1],'w').write(game)
print('ok', len(game))

if '--portal' in a:
    import shutil, zipfile
    TH = D + 'dev/three.min.js'
    API = 'https://star-vody.vercel.app'
    for kind in ['crazygames', 'poki']:
        head = ('<script>window.SF_PORTAL="%s";(function(){var B="%s",f=window.fetch.bind(window);'
                'window.fetch=function(u,o){if(typeof u=="string"&&u.indexOf("/api/")==0)u=B+u;return f(u,o)};'
                'if(navigator.sendBeacon){var sb=navigator.sendBeacon.bind(navigator);navigator.sendBeacon=function(u,d){if(typeof u=="string"&&u.indexOf("/api/")==0)u=B+u;return sb(u,d)}}})()</script>'
                '<style>body{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-touch-callout:none}</style>') % (kind, API)
        if kind == 'crazygames':
            head += ('<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>'
                     '<script>(function(){var st=0,ok=0;function S(){return window.CrazyGames&&CrazyGames.SDK&&CrazyGames.SDK.game}'
                     'var K="starfarer3d-v1",T="sf-cg-t";function D(){return CrazyGames.SDK.data}'
                     'function push(){try{var v=localStorage.getItem(K);if(!v||v===window.__cgLast)return;window.__cgLast=v;var n=String(Date.now());D().setItem(K,v);D().setItem(T,n);localStorage.setItem(T,n)}catch(e){}}'
                     'function pull(){try{var r=D().getItem(K),rt=+D().getItem(T)||0,lt=+localStorage.getItem(T)||0;window.__cgLast=localStorage.getItem(K);'
                     'if(r&&rt>lt&&r!==localStorage.getItem(K)&&!sessionStorage.getItem("sf-cg-r")){sessionStorage.setItem("sf-cg-r","1");localStorage.setItem(K,r);localStorage.setItem(T,String(rt));var si=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===K||k===T)return;return si.call(this,k,v)};location.reload();return 1}}catch(e){}}'
                     'window.addEventListener("load",function(){try{CrazyGames.SDK.init().then(function(){ok=1;if(!pull()){setInterval(push,10000);addEventListener("pagehide",push);document.addEventListener("visibilitychange",function(){if(document.hidden)push()})}}).catch(function(){})}catch(e){}});'
                     'setInterval(function(){if(!ok||!S())return;var on=!(window.MENU3&&MENU3.on)&&!document.hidden;if(on&&!st){st=1;try{S().gameplayStart()}catch(e){}}else if(!on&&st){st=0;try{S().gameplayStop()}catch(e){}}},1000)})()</script>')
        pjp = ('<script src="https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js"></script>\n'
               '<script>window.Peer||document.write(\'<script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"><\\/script>\')</script>')
        html = sh.replace('%%THREE%%', head + '<script>window.SF_STANDALONE=1</script>' + pjp + '<script src="three.min.js"></script>' + chk + EX).replace('%%GAME%%', game)
        out = D + 'dist/' + kind + '/'
        shutil.rmtree(out, ignore_errors=True); os.makedirs(out)
        open(out + 'index.html', 'w').write(html)
        shutil.copy(TH, out + 'three.min.js')
        for sub in ['models', 'cities']: shutil.copytree(D + 'public/' + sub, out + sub)
        z = D + 'dist/' + kind + '.zip'
        with zipfile.ZipFile(z, 'w', zipfile.ZIP_DEFLATED) as Z:
            for r, _, fs in os.walk(out):
                for f in fs: Z.write(os.path.join(r, f), os.path.relpath(os.path.join(r, f), out))
        print(kind, round(os.path.getsize(z) / 1e6, 1), 'Mo')
