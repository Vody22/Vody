"""Self-contained CrazyGames Basic Launch candidate (no external game services)."""
from pathlib import Path
import shutil
import zipfile


def build_crazygames(shell, game, examples, check, directory, dictionary):
    root = Path(directory).resolve()
    out = root / 'dist' / 'crazygames'
    assert out.resolve().parent == root / 'dist'
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    boot = (root / 'src' / 'crazygames-boot.js').read_text(encoding='utf-8')
    head = (dictionary+'<script>window.SF_PORTAL="crazygames";window.SF_OFFLINE=true;</script>'
            '<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>'
            '<script>' + boot + '</script><script src="three.min.js"></script>' + check + examples)
    start = ('window.SF_CG_READY.then(()=>{const script=document.createElement("script");'
             'script.src="game.js";script.onerror=()=>window.SF_CG_ERROR();document.body.append(script);})'
             '.catch(()=>window.SF_CG_ERROR());')
    html = shell.replace('%%THREE%%', head).replace('%%GAME%%', start)
    (out / 'index.html').write_text(html, encoding='utf-8')
    # Use the SDK as the sole storage authority, including for guests. Never merge
    # another account's local save into an authenticated user's SDK save.
    (out / 'game.js').write_text(game.replace('localStorage', 'SFStorage'), encoding='utf-8')
    shutil.copy(root / 'dev' / 'three.min.js', out / 'three.min.js')
    for sub in ['models', 'cities']:
        shutil.copytree(root / 'public' / sub, out / sub)
    archive = root / 'dist' / 'crazygames.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as bundle:
        for file in sorted(out.rglob('*')):
            if file.is_file():
                bundle.write(file, file.relative_to(out))
    print('crazygames', round(archive.stat().st_size / 1e6, 1), 'Mo')
