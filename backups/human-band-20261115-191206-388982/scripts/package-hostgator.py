from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json,os
root=Path(__file__).resolve().parent.parent
out=root/'out';release=root/'release';release.mkdir(exist_ok=True)
if not (out/'index.html').is_file():raise SystemExit('Build the static app first')
# Only authored public server files; never package a local secret config.
with ZipFile(release/'jazzbook-hostgator-web.zip','w',ZIP_DEFLATED) as z:
 for f in sorted(out.rglob('*')):
  if f.is_file() and f.relative_to(out).as_posix()!='.htaccess':z.write(f,f.relative_to(out))
 for name in ['index.php','bootstrap.php','.htaccess']:z.write(root/'server/api'/name,'api/'+name)
 z.write(root/'server/web.htaccess','.htaccess')
 z.writestr('deployment.json',json.dumps({'app':'Jazzbook','backend':'PHP 8.2+ / MySQL','basePath':os.environ.get('NEXT_PUBLIC_BASE_PATH',''),'schema':1})+'\n')
with ZipFile(release/'jazzbook-hostgator-setup.zip','w',ZIP_DEFLATED) as z:
 for rel in ['server/private/config.example.php','server/private/config-path.example.php','server/sql/001_accounts_catalog.sql','docs/hostgator-rollout.md']:
  p=root/rel
  if p.exists():z.write(p,rel)
print(release/'jazzbook-hostgator-web.zip');print(release/'jazzbook-hostgator-setup.zip')
