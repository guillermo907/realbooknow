"""Package only independently authored changes and CC0 audio assets; no research inputs."""
from pathlib import Path
import json,hashlib,zipfile,shutil,subprocess
root=Path(__file__).resolve().parents[1];original=Path('/Users/willy/Documents/ChatGPT/iRealAlternative');destination=root.parent/'outputs';destination.mkdir(exist_ok=True);stage=root.parent/'band-expression-break-controls-package';stage.mkdir(exist_ok=True);payload=stage/'payload';payload.mkdir(exist_ok=True)
entries=[]
allowed=['src','public','scripts','tests','docs']
for folder in allowed:
 for p in (root/folder).rglob('*'):
  if not p.is_file() or p.is_symlink():continue
  rel=p.relative_to(root)
  if any(x in rel.parts for x in ['node_modules','__pycache__','output','harness','revision-baseline','revision-results']):continue
  if p.suffix in ['.pyc','.flac'] or p.name in ['hard-metrics.mjs','run-hard-gates.mjs','hard-fixtures.mjs','save-revision-baseline.mjs']:continue
  target=original/rel;new=hashlib.sha256(p.read_bytes()).hexdigest();old=hashlib.sha256(target.read_bytes()).hexdigest() if target.exists() else None
  if old==new:continue
  dest=payload/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest);entries.append({'path':str(rel),'before':old,'after':new})
for name in ['package.json','next.config.mjs','README.md']:
 p=root/name;target=original/name;new=hashlib.sha256(p.read_bytes()).hexdigest();old=hashlib.sha256(target.read_bytes()).hexdigest() if target.exists() else None
 if new!=old:shutil.copy2(p,payload/name);entries.append({'path':name,'before':old,'after':new})
(stage/'manifest.json').write_text(json.dumps({'format':'vesper-band-update','version':1,'files':entries},indent=2)+'\n')
shutil.copy2(root/'scripts/apply-band-update.py',stage/'apply-band-update.py')
(stage/'README-APPLY.md').write_text('''# Vesper Changes bass and drums update

Unzip this folder and run, using the Python already on your Mac:

```sh
python3 apply-band-update.py /Users/willy/Documents/ChatGPT/iRealAlternative
```

Use `--dry-run` to inspect without writing. The script checks source hashes, creates a dated backup, and applies only the listed source/docs/audio changes. Existing songs, preferences, node_modules and private files are not touched. No dependency installation is needed. Restart `npm run dev` after applying. `npm test` and `npm run build` verify the installed copy.

The working implementation was tested in a writable copy because macOS denied this session write access to the original application folder. The package makes the exact changes portable to a context with write access.

For the current changes and controls, see `payload/docs/accompaniment-decisions.md` and `payload/README.md`. The user canceled further metric/evidence/report work for this revision. This includes the complete phrase-engine update, the new modal bass sentences, variable drum dynamics and the Bass & drums only practice option. Prior theme changes are preserved.
''')
archive=destination/'vesper-expression-breaks.zip'
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
 for p in stage.rglob('*'):
  if p.is_file():z.write(p,p.relative_to(stage))
print(json.dumps({'archive':str(archive),'bytes':archive.stat().st_size,'changed_files':len(entries)},indent=2))
