"""Build the curated palette from the verified download-plan cache (no runtime downloads)."""
from pathlib import Path
import argparse,json,hashlib,subprocess,concurrent.futures,array,statistics,math,urllib.request
parser=argparse.ArgumentParser();parser.add_argument('--sources',type=Path,required=True);parser.add_argument('--download',action='store_true',help='Fetch missing recordings from the pinned sources');args=parser.parse_args()
root=Path(__file__).resolve().parent.parent;out=root/'public/audio/studio-v2';out.mkdir(parents=True,exist_ok=True)
jobs=json.loads((args.sources/'download-plan.json').read_text());unique={x['repo']+'/'+x['path']:x for x in jobs}
def convert(kv):
 key,x=kv;h=hashlib.sha256(key.encode()).hexdigest();p=args.sources/'raw'/(h+'.'+x['path'].split('.')[-1]);raw=p.read_bytes();assert hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()==x['sha1'],x['path']
 if not p.exists():
  if not args.download:raise RuntimeError('Missing source '+str(p)+'; use --download to retrieve the pinned original')
  import urllib.parse
  url='https://raw.githubusercontent.com/'+x['repo']+'/'+x['revision']+'/'+urllib.parse.quote(x['path'])
  data=urllib.request.urlopen(url,timeout=45).read()
  if hashlib.sha1(('blob '+str(len(data))+'\0').encode()+data).hexdigest()!=x['sha1']:raise RuntimeError('Source hash mismatch: '+x['path'])
  p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
 stem=x['part']+'-'+Path(x['path']).stem.replace('#','s');dest=out/(stem+'.m4a')
 limit=.22 if 'Release' in x['part'] else .16 if x['part']=='bassGhost' else .55 if x['part']=='bassMute' else 5.5
 if not dest.exists():
  result=subprocess.run(['ffmpeg','-v','error','-y','-i',str(p),'-t',str(limit),'-c:a','aac','-b:a','192k','-ar','44100',str(dest)],capture_output=True,text=True)
  if result.returncode:raise RuntimeError(result.stderr)
 rawpcm=subprocess.run(['ffmpeg','-v','error','-i',str(dest),'-t','0.4','-f','f32le','-ac','1','-ar','22050','-'],capture_output=True,check=True).stdout
 samples=array.array('f',rawpcm);rms=math.sqrt(sum(v*v for v in samples)/max(1,len(samples)))
 data=dest.read_bytes();return key,{'file':dest.name,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'rms':rms}
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:converted=dict(pool.map(convert,unique.items()))
reference={}
for part in ['epPianet','epWurli','bassFinger','bassGhost']:
 vals=[converted[x['repo']+'/'+x['path']]['rms']*x['region'].get('gain',1) for x in jobs if x['part']==part and (part!='bassFinger' or x['region']['velocity']==80)]
 reference[part]=min(8,.1/max(.001,statistics.median(vals)))
reference['epPianetRelease']=reference['epPianet'];reference['bassRelease']=reference['bassMute']=reference['bassFinger']
manifest={'version':2,'instruments':{},'sources':[
 {'name':'Greg Sullivan Wurlitzer EP200 and Hohner Pianet T','author':'Greg Sullivan; SFZ mapping by kinwie','repository':'https://github.com/sfzinstruments/GregSullivan.E-Pianos','revision':'8c3e581acda3594b553948ff0222d4f84a698376','license':'CC-BY-3.0'},
 {'name':'Black And Blue Basses — darkblack','author':'D. Smolken / Karoryfer Samples','repository':'https://github.com/sfzinstruments/karoryfer.black-and-blue-basses','revision':'6e7d674cdb41be7a54dbccb15472401ad01099b9','license':'CC0-1.0'}]}
for x in jobs:
 region={**x['region'],**converted[x['repo']+'/'+x['path']]};region.pop('rms');region['gain']*=reference[x['part']];region['source']=x['path'];region['sourceSha1']=x['sha1'];manifest['instruments'].setdefault(x['part'],[]).append(region)
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'files':len(converted),'bytes':sum(x['bytes'] for x in converted.values()),'instrumentGains':reference},indent=2))
