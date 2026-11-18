"""Independent aggregate evaluation; sources are never pooled."""
import pathlib,json,importlib.util
here=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('jazzbook_midi_analysis',here/'analyze-midi.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
namespace={'analyze':module.analyze}
paths=[here/'output/baseline',here/'output/new',pathlib.Path('/tmp/accomp-research/runtime-study/mma-renders')]
external=pathlib.Path('/data/reference-midi')
if external.exists():
 for directory in external.iterdir():
  if directory.is_dir():paths.append(directory)
results={}
for directory in paths:
 manifest=directory/'baseline-manifest.json'
 if not manifest.exists():
  # Without chart/bar metadata, do not invent harmony/chorus labels. Record inventory, later generic SMF stats remain possible.
  results[str(directory)]={'status':'missing fixture/harmony metadata','midi_files':len(list(directory.rglob('*.mid')))};continue
 rows=[]
 for case in json.loads(manifest.read_text()):
  try:rows.append(namespace['analyze'](case))
  except Exception as e:rows.append({'fixture':case['fixture'],'tempo':case['tempo'],'error':repr(e)})
 name='MMA' if directory.name=='mma-renders' else directory.name;results[name]=rows
out=here/'output/aggregate-results.json';out.write_text(json.dumps(results,indent=2))
for source,rows in results.items():
 print(source,len(rows))
 if isinstance(rows,list):
  for r in rows:
   if 'error' in r:print('ERROR',r)
   elif r['tempo']==120:print(r['fixture'],'root',round(r['bass']['root_downbeat_pct'],1),'approach',round(r['bass']['chromatic_approach_pct'],1),'hits',round(r['comping']['hits_per_bar'],2),'voices',r['comping']['voicing_size']['mean'],'VL',round(r['comping']['voice_leading_semitones_per_matched_voice']['mean'] or 0,2),'swing',r['drums']['ride_swing_ratio']['median'])
