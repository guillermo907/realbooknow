"""Requires Python 3 and ffmpeg; does not install application dependencies.
Source originals are pinned and hashed in studio-real-source-regions.json.
Fetch GitHub originals from repo/revision/path into raw/<sha256(repo/path)>.<ext>;
fetch P-bass public URLs into raw/pbass-<id>.mp3. All hashes are verified before use.
"""
from pathlib import Path
import json,hashlib,subprocess,concurrent.futures,array,statistics,math
import argparse
parser=argparse.ArgumentParser(description='Rebuild the recorded grand/bass additions from a verified source cache');parser.add_argument('--sources',type=Path,required=True);args=parser.parse_args()
r=Path(__file__).resolve().parent.parent;src=args.sources;out=r/'public/audio/studio-v2';spec=json.loads((r/'scripts/studio-real-source-regions.json').read_text());jobs=spec['regions'];manifest=json.loads((out/'manifest.json').read_text());newParts={x['part'] for x in jobs}|{'bassPrecision'}
# Rebuilding is idempotent; retain the older electric piano/hollowbody bank.
manifest['instruments']={k:v for k,v in manifest['instruments'].items() if k not in newParts}

def pcm(p,t=.4):return array.array('f',subprocess.run(['ffmpeg','-v','error','-i',str(p),'-t',str(t),'-f','f32le','-ac','1','-ar','22050','-'],capture_output=True,check=True).stdout)
def convert(x):
 h=hashlib.sha256((x['repo']+'/'+x['path']).encode()).hexdigest();p=src/'raw'/(h+'.'+x['path'].split('.')[-1]);raw=p.read_bytes();assert hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()==x['sha1']
 part=x['part'];dest=out/(part+'-'+Path(x['path']).stem.replace('#','s')+'.m4a');limit=.3 if 'Release' in part else 1.5 if 'Short' in part else 10 if part.startswith('grand') else 5.5
 if not dest.exists():subprocess.run(['ffmpeg','-v','error','-y','-i',str(p),'-t',str(limit),'-af',f'afade=t=out:st={limit-.08}:d=0.08','-c:a','aac','-b:a','256k','-ar','32000',str(dest)],check=True)
 samples=pcm(dest);rms=math.sqrt(sum(v*v for v in samples)/max(1,len(samples)));data=dest.read_bytes();return x,{**x['region'],'file':dest.name,'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'source':x['path'],'sourceSha1':x['sha1']},rms
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:results=list(pool.map(convert,jobs))
gains={}
for part,target in [('grandYamaha',72),('grandSteinway',72),('bassJazz',65),('bassPicked',65)]:
 rms=statistics.median(v for x,z,v in results if x['part']==part and x['region']['velocity']==target);gains[part]=min(8,.1/max(.001,rms))
gains['bassJazzRelease']=gains['bassJazzShort']=gains['bassJazz']
for x,z,v in results:z['gain']=gains[x['part']];manifest['instruments'].setdefault(x['part'],[]).append(z)
notes={'C':0,'C#':1,'D':2,'D#':3,'E':4,'F':5,'F#':6,'G':7,'G#':8,'A':9,'A#':10,'B':11}
pb=[]
for x in spec['pbass']:
 p=src/'raw'/('pbass-'+str(x['id'])+'.mp3');assert hashlib.sha256(p.read_bytes()).hexdigest()==x['sha256'];dest=out/('bassPrecision-'+str(x['id'])+'.mp3');dest.write_bytes(p.read_bytes());n=x['note'];samples=pcm(dest);rms=math.sqrt(sum(v*v for v in samples)/len(samples));data=dest.read_bytes();pb.append({'file':dest.name,'root':notes[n[:-1]]+(int(n[-1])+1)*12,'velocity':80,'rr':0,'gain':min(8,.1/rms),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'source':x['page'],'sourceSha1':hashlib.sha1(data).hexdigest(),'sourceSha256':x['sha256']})
manifest['instruments']['bassPrecision']=pb
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n');print('New regions',len(results)+len(pb),'gains',gains,'bytes',sum(z['bytes'] for x,z,v in results)+sum(z['bytes'] for z in pb))
