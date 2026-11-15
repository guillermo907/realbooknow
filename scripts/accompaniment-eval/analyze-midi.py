"""Independent SMF analysis for research; no target implementation is modified."""
from pathlib import Path
from collections import defaultdict,deque,Counter
from bisect import bisect_right
from itertools import combinations
import struct,json,math,statistics,hashlib
R=Path(__file__).resolve().parent/'output/baseline'
def percentile(xs,p):
 if not xs:return None
 a=sorted(xs);i=(len(a)-1)*p;lo=int(i);hi=min(lo+1,len(a)-1);return a[lo]+(a[hi]-a[lo])*(i-lo)
def summary(xs):
 return {'n':len(xs),'min':min(xs) if xs else None,'p10':percentile(xs,.1),'median':percentile(xs,.5),'p90':percentile(xs,.9),'max':max(xs) if xs else None,'mean':statistics.mean(xs) if xs else None,'sd':statistics.pstdev(xs) if xs else None}
def smf(path):
 b=Path(path).read_bytes();assert b[:4]==b'MThd';header=struct.unpack('>I',b[4:8])[0];fmt,tracks,ppq=struct.unpack('>HHH',b[8:14]);assert not ppq&0x8000;cursor=8+header;notes=[];controllers=[];tempos=[];unmatched=0
 def variable():
  nonlocal cursor
  n=0
  for _ in range(5):
   x=b[cursor];cursor+=1;n=(n<<7)|(x&127)
   if not x&128:return n
  raise ValueError('Bad VLQ')
 for track in range(tracks):
  assert b[cursor:cursor+4]==b'MTrk';size=struct.unpack('>I',b[cursor+4:cursor+8])[0];cursor+=8;end=cursor+size;tick=0;running=None;active=defaultdict(deque)
  while cursor<end:
   tick+=variable();status=b[cursor]
   if status>=128:cursor+=1
   else:assert running is not None;status=running
   if status==255:
    kind=b[cursor];cursor+=1;n=variable();payload=b[cursor:cursor+n];cursor+=n
    if kind==81:tempos.append((tick,int.from_bytes(payload,'big')))
    continue
   if status in (240,247):n=variable();cursor+=n;running=None;continue
   running=status;kind=status>>4;channel=status&15;a=b[cursor];cursor+=1;v=None
   if kind not in (12,13):v=b[cursor];cursor+=1
   key=(channel,a)
   if kind==9 and v:active[key].append((tick,v))
   elif kind==8 or kind==9:
    if active[key]:
     start,velocity=active[key].popleft();notes.append({'channel':channel,'pitch':a,'on':start/ppq,'off':tick/ppq,'velocity':velocity,'duration':(tick-start)/ppq,'track':track})
    else:unmatched+=1
   elif kind==11:controllers.append((tick,channel,a,v))
  assert cursor==end
  unmatched+=sum(len(v) for v in active.values())
 assert cursor==len(b);assert unmatched==0,(path,unmatched)
 return {'ppq':ppq,'notes':sorted(notes,key=lambda n:(n['on'],n['channel'],n['pitch'])),'tempos':tempos,'controllers':controllers}
def pc(symbol):
 if not symbol:return None
 s=symbol.split('/')[-1];base={'C':0,'D':2,'E':4,'F':5,'G':7,'A':9,'B':11}.get(s[0])
 if base is None:return None
 for ch in s[1:]:
  if ch=='b':base-=1
  elif ch=='#':base+=1
  else:break
 return base%12
def vl(a,b):
 small,large=(a,b) if len(a)<=len(b) else (b,a)
 if not small:return None
 return min(sum(abs(x-y) for x,y in zip(small,c)) for c in combinations(large,len(small)))/len(small)
def analyze(case):
 data=smf(case['renders'][0]);plan=json.loads(Path(case['plan']).read_text());starts=[];end=0
 for v in plan:starts.append(end);end+=v['beats']
 assert len(plan)==case['barCount']*case['choruses']
 def bar_for(n):return min(len(starts)-1,max(0,bisect_right(starts,n['on']+.025)-1))
 def symbol_at(bar,beat):
  event=plan[bar]['events'][0]
  for candidate in plan[bar]['events']:
   if candidate['beat']<=beat+.001:event=candidate
  return event.get('symbol')
 def phase(n):i=bar_for(n);return n['on']-starts[i]
 notes=data['notes'];bass=[n for n in notes if n['channel'] in case.get('roleChannels',{}).get('bass',[1])];keys=[n for n in notes if n['channel'] in case.get('roleChannels',{}).get('comp',[0])];drums=[n for n in notes if n['channel'] in case.get('roleChannels',{}).get('drums',[9])]
 bybass=defaultdict(list)
 for n in bass:bybass[bar_for(n)].append(n)
 eligible_roots=roots=hits=walking=twofeel=other=0;approaches=Counter();approach_eligible=0;lastbeat_present=0
 for i,v in enumerate(plan):
  bn=bybass[i];root=pc(symbol_at(i,0))
  if root is not None:
   eligible_roots+=1;first=[n for n in bn if abs(n['on']-starts[i])<.025]
   if first:hits+=1;roots+=first[0]['pitch']%12==root
  pos=[round(n['on']-starts[i],3) for n in bn]
  if v['meter']==[4,4] and len(pos)==2 and all(abs(a-b)<.025 for a,b in zip(pos,[0,2])):twofeel+=1
  elif v['meter']==[4,4] and len(pos)==int(v['beats']) and all(abs(a-b)<.025 for a,b in zip(pos,range(int(v['beats'])))):walking+=1
  else:other+=1
  if i+1<len(plan) and pc(symbol_at(i+1,0)) is not None and pc(symbol_at(i+1,0))!=pc(symbol_at(i,max(0,v['beats']-1))):
   approach_eligible+=1;last=[n for n in bn if phase(n)>=v['beats']-1-.025]
   if last:
    lastbeat_present+=1;following=[n for n in bybass[i+1] if abs(n['on']-starts[i+1])<.025]
    if following and following[0]['pitch']%12==pc(symbol_at(i+1,0)):
     interval=following[0]['pitch']-last[-1]['pitch'];approaches[str(interval)]+=1
 groups=defaultdict(list)
 cluster_start=None;cluster_bar=None
 for n in keys:
  bar=bar_for(n)
  if cluster_start is None or bar!=cluster_bar or n['on']-cluster_start > .04*case['tempo']/60:cluster_start=n['on'];cluster_bar=bar
  groups[(bar,cluster_start)].append(n)
 clusters=[]
 for (bar,on),group in sorted(groups.items()):clusters.append({'bar':bar,'on':on,'pitches':sorted(n['pitch'] for n in group),'velocities':[n['velocity'] for n in group],'symbol':symbol_at(bar,on-starts[bar])})
 movements=[];unmatched=[]
 for prev,cur in zip(clusters,clusters[1:]):
  if prev['symbol']!=cur['symbol']:
   movements.append(vl(prev['pitches'],cur['pitches']));unmatched.append(abs(len(prev['pitches'])-len(cur['pitches']))/max(len(prev['pitches']),len(cur['pitches'])))
 by_inst=defaultdict(list);names={51:'ride',59:'ride',53:'ride',42:'closed_hat',44:'pedal_hat',46:'open_hat',36:'kick',35:'kick',38:'snare',40:'snare',37:'rim'}
 for n in drums:by_inst[names.get(n['pitch'],'other_'+str(n['pitch']))].append(n)
 ride=sorted(n['on'] for n in by_inst['ride']);ratios=[]
 for t in ride:
  if abs(t-round(t))>.025:continue
  following=[x for x in ride if t+.08<x<t+.92];ending=next((x for x in ride if abs(x-t-1)<.025),None)
  if following and ending:ratios.append((following[0]-t)/(ending-following[0]))
 swung=percentile(ratios,.5);swing_fraction=swung/(1+swung) if swung else .5
 def snap_phase(beat):
  choices=[i/4 for i in range(int(math.ceil(beat+2))*4)]+[i+swing_fraction for i in range(int(math.ceil(beat+2)))];return min(choices,key=lambda x:abs(x-beat))
 def histogram(ns,clusters=False):
  counts=Counter()
  for n in ns:
   if clusters:beat=n['on']-starts[n['bar']]
   else:beat=phase(n)
   counts[f'{snap_phase(beat):.3f}'.rstrip('0').rstrip('.')]+=1
  return dict(sorted(counts.items(),key=lambda kv:float(kv[0])))
 comp_hist=histogram(clusters,True);inst={}
 for name,ns in sorted(by_inst.items()):
  if not ns:continue
  residuals=[(phase(n)-snap_phase(phase(n)))*60/case['tempo']*1000 for n in ns]
  inst[name]={'notes':len(ns),'hits_per_bar':len(ns)/len(plan),'positions':histogram(ns),'velocity':summary([n['velocity'] for n in ns]),'timing_residual_ms':summary(residuals)}
 # Conservative observable proxy, not a semantic annotation from the generator.
 fills=defaultdict(list)
 for n in by_inst['snare']:
  i=bar_for(n);beat=phase(n)
  if beat>=plan[i]['beats']-1 and abs(beat-round(beat))>.1 and n['velocity']>=55:fills[i].append(n)
 fillbars=sorted(fills);fillspans=[starts[i]+plan[i]['beats']-min(n['on'] for n in ns) for i,ns in fills.items()]
 def signatures(part):
  src=bass if part=='bass' else keys if part=='comping' else drums;rows=[]
  for i,v in enumerate(plan):
   events=[n for n in src if bar_for(n)==i]
   if part=='comping':rhythm=sorted(set(round(snap_phase(phase(n)),3) for n in events))
   else:rhythm=sorted((round(snap_phase(phase(n)),3),n['pitch'] if part=='drums' else None) for n in events)
   pitches=sorted((round(snap_phase(phase(n)),3),n['pitch']) for n in events)
   rows.append({'rhythm':rhythm,'pitches':pitches})
  return rows
 variation={}
 for part in ['bass','comping','drums']:
  sig=signatures(part);n=case['barCount'];compared=0;changed_r=changed_p=0
  for i in range(n,len(sig)):
   compared+=1;changed_r+=sig[i]['rhythm']!=sig[i-n]['rhythm'];changed_p+=sig[i]['pitches']!=sig[i-n]['pitches']
  variation[part]={'compared_bars':compared,'rhythm_changed_pct':100*changed_r/compared,'notes_changed_pct':100*changed_p/compared,'unique_rhythm_bars':len({json.dumps(s['rhythm']) for s in sig})}
 sections=defaultdict(lambda:{'bars':0,'comp_hits':0,'bass_hits':0,'drum_hits':0})
 section_map={int(k):v for k,v in case['bars'].items()}
 for i,v in enumerate(plan):
  label=section_map[max(k for k in section_map if k<=v['index'])];entry=sections[label];entry['bars']+=1;entry['comp_hits']+=sum(c['bar']==i for c in clusters);entry['bass_hits']+=len(bybass[i]);entry['drum_hits']+=sum(bar_for(n)==i for n in drums)
 sections={label:{'bars':x['bars'],**{k+'_per_bar':x[k]/x['bars'] for k in ['comp_hits','bass_hits','drum_hits']}} for label,x in sections.items()}
 hashes=[hashlib.sha256(Path(p).read_bytes()).hexdigest() for p in case['renders']]
 residuals=[(n['on']-starts[n['bar']]-snap_phase(n['on']-starts[n['bar']]))*60/case['tempo']*1000 for n in clusters]
 return {'fixture':case['fixture'],'style':case['style'],'tempo':case['tempo'],'meter':case['meter'],'bar_count':len(plan),'ppq':data['ppq'],'bass':{'notes':len(bass),'intervals_signed':dict(sorted(Counter(str(b['pitch']-a['pitch']) for a,b in zip(bass,bass[1:])).items(),key=lambda x:int(x[0]))),'range':[min(n['pitch'] for n in bass),max(n['pitch'] for n in bass)],'duration_beats':summary([n['duration'] for n in bass]),'downbeat_eligible_bars':eligible_roots,'downbeat_hit_bars':hits,'root_downbeat_bars':roots,'root_downbeat_pct':100*roots/eligible_roots,'twofeel_bars':twofeel,'walking_bars':walking,'other_bars':other,'approach_eligible_boundaries':approach_eligible,'last_beat_present':lastbeat_present,'approach_intervals_signed':dict(approaches),'chromatic_approach_pct':100*(approaches['-1']+approaches['1'])/approach_eligible if approach_eligible else None,'stepwise_approach_pct':100*sum(approaches[str(x)] for x in [-2,-1,1,2])/approach_eligible if approach_eligible else None},'comping':{'hits':len(clusters),'hits_per_bar':len(clusters)/len(plan),'positions':comp_hist,'voicing_size':summary([len(c['pitches']) for c in clusters]),'range':[min(n['pitch'] for n in keys),max(n['pitch'] for n in keys)],'voice_leading_semitones_per_matched_voice':summary(movements),'unmatched_voice_fraction':summary(unmatched),'velocity':summary([n['velocity'] for n in keys]),'duration_beats':summary([n['duration'] for n in keys]),'timing_residual_ms':summary(residuals)},'drums':{'instruments':inst,'ride_swing_ratio':summary(ratios),'fill_candidate_performed_bars_1based':[i+1 for i in fillbars],'fill_candidate_beats_remaining':summary(fillspans),'fills_at_chorus_end':sum((i+1)%case['barCount']==0 for i in fillbars)},'variation':variation,'sections':sections,'independent_exports_identical':len(set(hashes))==1,'render_sha256':hashes[0]}

def main():
 import sys
 root=Path(sys.argv[1]) if len(sys.argv)>1 else R
 cases=json.loads((root/'baseline-manifest.json').read_text());results=[analyze(c) for c in cases]
 (root/'baseline-measurements.json').write_text(json.dumps(results,indent=2)+'\n')
 print('Analyzed',len(results),'cases in',root)
if __name__=='__main__':main()
