"""Extend the existing CC0 Virtuosity bank with its recorded missing articulations.
No accompaniment generator code, styles or grooves are inputs.
"""
import pathlib,json,re,urllib.request,subprocess,hashlib,concurrent.futures,shutil
root=pathlib.Path(__file__).resolve().parents[2];out=root/'public/audio/studio-v1';manifest=json.loads((out/'manifest.json').read_text());sha='9f04cf9a734527edfbb0a4eee1f674e45bbf71bc';url='https://api.github.com/repos/sfzinstruments/virtuosity_drums/git/trees/'+sha+'?recursive=1';tree=json.load(urllib.request.urlopen(url,timeout=30));paths=[x['path'] for x in tree['tree']];jobs=[]
for part,folder,art in [('rideBell','ride','bell'),('openHat','hh','open'),('tom','ltom','center')]:
 matches=[]
 for path in paths:
  m=re.fullmatch(r'Samples/oh/'+folder+'/oh_'+folder+'_'+art+r'_vl(\d+)(?:_rr(\d+))?\.flac',path)
  if m:matches.append((int(m[1]),int(m[2] or 1),path))
 layers=sorted(set(x[0] for x in matches));chosen=layers if len(layers)<=3 else [layers[0],layers[len(layers)//2],layers[-1]]
 for layer in chosen:
  velocity=[38,75,112][chosen.index(layer)]
  for _,rr,path in [x for x in matches if x[0]==layer]:
   file=part+'-0-'+str(velocity)+'-'+str(rr-1)+'.m4a';jobs.append((part,{'root':0,'velocity':velocity,'rr':rr-1,'file':file},path))
def convert(job):
 part,r,path=job;target=out/r['file'];raw=target.with_suffix('.flac');data=urllib.request.urlopen('https://raw.githubusercontent.com/sfzinstruments/virtuosity_drums/'+sha+'/'+path,timeout=40).read();raw.write_bytes(data)
 subprocess.run([shutil.which('ffmpeg') or '/opt/homebrew/bin/ffmpeg','-v','error','-y','-i',str(raw),'-c:a','aac','-b:a','160k',str(target)],check=True);raw.unlink();r['bytes']=target.stat().st_size;r['sha256']=hashlib.sha256(target.read_bytes()).hexdigest();return part,r
for part in ['rideBell','openHat','tom']:manifest['instruments'][part]=[]
failures=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for job in jobs:
  pass
 futures=[pool.submit(convert,j) for j in jobs]
 for future in futures:
  try:
   part,r=future.result();manifest['instruments'][part].append(r)
  except Exception as e:failures.append(str(e))
for part in ['rideBell','openHat','tom']:
 if not manifest['instruments'][part]:del manifest['instruments'][part]
manifest['articulationSource']={'repository':'sfzinstruments/virtuosity_drums','revision':sha,'license':'CC0-1.0','added':['rideBell','openHat','tom']}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print(json.dumps({'new_samples':sum(len(manifest['instruments'].get(p,[])) for p in ['rideBell','openHat','tom']),'failures':failures},indent=2))
