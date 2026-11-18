"""Guarded, reversible application of a tested Jazzbook source/audio update. No installs."""
from pathlib import Path
import argparse,json,hashlib,shutil,datetime,tempfile,os
parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('target',nargs='?',default=str(Path.home()/'Documents/ChatGPT/iRealAlternative'));parser.add_argument('--dry-run',action='store_true');parser.add_argument('--force',action='store_true',help='Apply after making backups even if local source hashes differ');args=parser.parse_args()
base=Path(__file__).resolve().parent;target=Path(args.target).resolve();manifest=json.loads((base/'manifest.json').read_text());payload=base/'payload'
if manifest.get('format')!='jazzbook-band-update' or manifest.get('version')!=1:raise SystemExit('Unsupported update format')
if not (target/'package.json').is_file() or json.loads((target/'package.json').read_text()).get('name') not in ['jazzbook','vesper-changes']:raise SystemExit('Target is not a Jazzbook project')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest() if p.is_file() else None
pending=[];conflicts=[]
for item in manifest['files']:
 rel=Path(item['path'])
 if rel.is_absolute() or '..' in rel.parts or rel.parts[0] not in ['src','public','server','docs','scripts','tests','package.json','package-lock.json','README.md','next.config.mjs']:raise SystemExit('Unsafe manifest path')
 dst=target/rel;src=payload/rel
 if not dst.resolve().is_relative_to(target) or not src.resolve().is_relative_to(payload.resolve()):raise SystemExit('Unsafe target path')
 if any(p.is_symlink() for p in [dst,*list(dst.parents)[:len(rel.parts)-1]]):raise SystemExit('Symlink target refused: '+str(rel))
 if sha(src)!=item['after']:raise SystemExit('Corrupt update payload: '+str(rel))
 current=sha(dst)
 if current==item['after']:continue
 if current!=item['before']:conflicts.append(str(rel))
 pending.append(item)
if conflicts and not args.force:raise SystemExit('Local files differ; nothing changed. Inspect before using --force: '+', '.join(conflicts))
if args.dry_run:print('Validated update:',len(pending),'files would change.');raise SystemExit(0)
if not pending:print('Already up to date.');raise SystemExit(0)
stamp=datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f');backup=target/'backups'/('human-band-'+stamp);backup.mkdir(parents=True,exist_ok=False);written=[]
try:
 for item in pending:
  rel=Path(item['path']);dst=target/rel;saved=backup/rel;existed=dst.exists()
  if existed:saved.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(dst,saved)
  dst.parent.mkdir(parents=True,exist_ok=True)
  with tempfile.NamedTemporaryFile(dir=dst.parent,prefix='.jazzbook-band-',delete=False) as handle:
   temp=Path(handle.name);handle.write((payload/rel).read_bytes());handle.flush();os.fsync(handle.fileno())
  os.chmod(temp,(dst.stat().st_mode&0o777) if existed else 0o644)
  try:os.replace(temp,dst)
  finally:
   if temp.exists():temp.unlink()
  written.append((rel,existed))
 (backup/'update-manifest.json').write_text(json.dumps(manifest,indent=2));print('Applied',len(written),'files. Backup:',backup);print('Restart npm run dev. No dependency installation required.')
except Exception:
 for rel,existed in reversed(written):
  if existed:shutil.copy2(backup/rel,target/rel)
  else:(target/rel).unlink(missing_ok=True)
 raise
