"""Build a static GitHub Pages site, excluding local backups and working files."""
from pathlib import Path
import shutil
from portfolio_server import ROOT, refresh
refresh()
out = ROOT / '_site'
out.mkdir(exist_ok=True)
for name in ['index.html', 'portfolio-media.js', 'CNAME']:
    source = ROOT / name
    if source.is_file(): shutil.copy2(source, out / name)
for name in ['Commission-Info', 'VFX-Photos', 'VFX-Videos', 'Modelling-Photos', 'Modelling-Videos', 'Misc-Photos', 'Misc-Videos', 'Videos']:
    source = ROOT / name
    if source.is_dir(): shutil.copytree(source, out / name, dirs_exist_ok=True, ignore=shutil.ignore_patterns('.DS_Store'))
(out / '.nojekyll').touch()
print('Static website ready in _site')
