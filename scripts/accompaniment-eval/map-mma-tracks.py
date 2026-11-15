import pathlib,json,re,subprocess
p=pathlib.Path('/tmp/accomp-research/runtime-study/mma-renders/baseline-manifest.json');data=json.loads(p.read_text());exe='/tmp/accomp-research/runtime-study/mma/mma-bin-25.05.3/mma.py'
for x in data:
 file=x['renders'][0].replace('-run0.mid','.mma');r=subprocess.run(['python3',exe,'-c',file],capture_output=True,text=True);roles={'bass':[],'comp':[],'drums':[9]}
 for line in r.stdout.split('Channel assignments:')[-1].splitlines():
  m=re.match(r'\s*(\d+)\s+(.+)',line)
  if not m:continue
  channel=int(m[1])-1;names=m[2].split()
  if any(n.startswith(('BASS','WALK')) for n in names):roles['bass'].append(channel)
  if any(n.startswith('CHORD') for n in names):roles['comp'].append(channel)
 x['roleChannels']=roles
p.write_text(json.dumps(data,indent=2));print('Mapped MMA by actual track assignments; no instrument-name guessing')
