from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root=Path(__file__).resolve().parent.parent
out=root/'out'
if not (out/'index.html').is_file(): raise SystemExit('Build the static app first')
release=root/'release';release.mkdir(exist_ok=True)
with ZipFile(release/'ireal-alternative-hostgator.zip','w',ZIP_DEFLATED) as z:
 for f in sorted(out.rglob('*')):
  if f.is_file():z.write(f,f.relative_to(out))
print(release/'ireal-alternative-hostgator.zip')
