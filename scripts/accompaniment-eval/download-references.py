"""Fetch authorized runtime/data inputs only. Never import them into application code."""
import urllib.request,pathlib,hashlib,tarfile,zipfile,json
root=pathlib.Path('/tmp/accomp-research/runtime-study');root.mkdir(parents=True,exist_ok=True);result={}
for name,url in [('mma','https://www.mellowood.ca/mma/mma-devl.25.05.3.tar.gz'),('gmd','https://storage.googleapis.com/magentadata/datasets/groove/groove-v1.0.0-midionly.zip')]:
 try:
  raw=urllib.request.urlopen(url,timeout=40).read();path=root/(name+('.tar.gz' if name=='mma' else '.zip'));path.write_bytes(raw)
  if name=='gmd':assert hashlib.sha256(raw).hexdigest()=='651cbc524ffb891be1a3e46d89dc82a1cecb09a57c748c7b45b844c4841dcc1e'
  target=root/name;target.mkdir(exist_ok=True)
  # Input packages are data/executables for measurement only; no upstream source is opened for implementation.
  if name=='mma':
   with tarfile.open(path) as a:
    for x in a.getmembers():
     if not (target/x.name).resolve().is_relative_to(target.resolve()):raise ValueError('Unsafe archive path')
    a.extractall(target,members=[x for x in a.getmembers() if not x.issym() and not x.islnk()])
  else:
   with zipfile.ZipFile(path) as a:
    for x in a.namelist():
     if not (target/x).resolve().is_relative_to(target.resolve()):raise ValueError('Unsafe archive path')
    a.extractall(target)
  result[name]={'ok':True,'url':url,'sha256':hashlib.sha256(raw).hexdigest(),'directory':str(target)}
 except Exception as e:result[name]={'ok':False,'url':url,'reason':str(e)}
(root/'downloads.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
