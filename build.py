#!/usr/bin/env python3
"""Construit index.html (version en ligne, multijoueur PeerJS) à partir de src/.
   python3 build.py                 -> index.html
   python3 build.py --claude OUT    -> en plus, version artefact Claude (salon « room ») dans OUT
   python3 build.py --check OUT.js  -> écrit aussi le JS concaténé (pour node --check)"""
import os, sys, time
D = os.path.dirname(os.path.abspath(__file__)) + '/'
S = D + 'src/'
MODS = ['core','audio','gfx','models','world','game','surface','fx','ultra','detail','content','lasers','parts','cockpit','speed','sounds','visuals','chars','ground','story','explore','planet2','daynight','gfxplus','weather2','netroom','mp','hud']
EXS = ['CopyShader','LuminosityHighPassShader','EffectComposer','RenderPass','ShaderPass','UnrealBloomPass']
sh = open(S+'shell.html').read()
game = ''.join(open(S+m+'.js').read()+'\n' for m in MODS)
EX = '<script>' + ''.join(open(S+'three-examples/'+e+'.js').read()+'\n' for e in EXS) + '</script>'
chk = '<script>if(!window.THREE)document.getElementById("loading").innerHTML="STARFARER 3D<small>Impossible de charger le moteur 3D. Vérifie ta connexion et recharge la page.</small>"</script>'
cdn = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n<script>window.THREE||document.write(\'<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.min.js"><\\/script>\')</script>'
pj = ('<meta name="sf-build" content="'+time.strftime('%Y%m%d-%H%M%S')+'">'
      '<script>window.SF_STANDALONE=1</script><script src="https://cdnjs.cloudflare.com/ajax/libs/peerjs/1.5.4/peerjs.min.js"></script>\n'
      '<script>window.Peer||document.write(\'<script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"><\\/script>\')</script>')
open(D+'index.html','w').write(sh.replace('%%THREE%%', pj+cdn+chk+EX).replace('%%GAME%%', game))
a = sys.argv[1:]
if '--claude' in a: open(a[a.index('--claude')+1],'w').write(sh.replace('%%THREE%%', cdn+chk+EX).replace('%%GAME%%', game))
if '--check' in a: open(a[a.index('--check')+1],'w').write(game)
print('ok', len(game))
