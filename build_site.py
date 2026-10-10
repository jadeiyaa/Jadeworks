"""Build only the public website; original model files and local helpers stay out."""
from pathlib import Path
import shutil
from portfolio_server import ROOT, refresh
refresh()
out = ROOT / '_site'
if out.exists(): shutil.rmtree(out)
out.mkdir()
for name in ['index.html', 'portfolio-media.js', 'CNAME']:
    source = ROOT / name
    if source.is_file(): shutil.copy2(source, out / name)
allowed = {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif', '.mp4', '.webm', '.mov', '.m4v'}
for name in ['Commission-Info', 'VFX-Photos', 'VFX-Videos', 'Modelling-Photos', 'Modelling-Videos', 'Misc-Photos', 'Misc-Videos', 'Videos', 'Turntables/car-v2']:
    source = ROOT / name
    if source.is_dir():
        for item in source.rglob('*'):
            if item.is_file() and item.suffix.lower() in allowed and not item.name.startswith('.'):
                dest = out / item.relative_to(ROOT)
                dest.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(item, dest)
(out / 'scripts').mkdir()
for name in ['hover-glow.js', 'heading-reveal.js', 'model-turntable.js']:
    shutil.copy2(ROOT / 'scripts' / name, out / 'scripts' / name)
(out / '.nojekyll').touch()
print('Public site built: media and browser scripts only; no original 3D model files.')
