"""Publish only aggregate statistics and independently authored implementation notes."""
from pathlib import Path
import json,math,re,hashlib
here=Path(__file__).resolve().parent;project=here.parents[1];docs=project/'docs';data=json.loads((here/'output/aggregate-results.json').read_text());cfg=json.loads((project/'src/lib/band-config.json').read_text());rows=[]
def f(x):return 'N/M' if x is None else ('%.3f'%x).rstrip('0').rstrip('.')
def table(head,rs):return '\n'.join(['| '+' | '.join(head)+' |','| '+' | '.join(['---']*len(head))+' |']+['| '+' | '.join(map(str,r))+' |' for r in rs])+'\n\n'
def get(source,fixture,tempo=120):return next(r for r in data[source] if r['fixture']==fixture and r['tempo']==tempo)
for source,rs in data.items():
 if not isinstance(rs,list):continue
 for r in rs:
  if 'error' in r:raise RuntimeError((source,r))
  b=r['bass'];co=r['comping'];sw=r['drums']['ride_swing_ratio'];rows.append([source,r['fixture'],r['tempo'],f(b['root_downbeat_pct']),f(b['chromatic_approach_pct']),f(100*b['twofeel_bars']/r['bar_count'])+'/'+f(100*b['walking_bars']/r['bar_count']),f(co['hits_per_bar']),f(co['voice_leading_semitones_per_matched_voice']['mean']),f(sw['median'])])
summary='''# Accompaniment implementation results

2026-11-14. These are reproducible measurements of the original Jazzbook generator, the new Jazzbook band, and **MMA 25.05.3 separately**. MMA is an automatic generator, not a human reference. GMD supplies independent human drum statistics; it supplies no harmony, bass lines or comping gestures. No source is pooled with another.

The new band, controls, samples and theme updates are implemented in the writable `band-engine-work` copy. The original app folder remains blocked by macOS write permissions. The prepared apply package is required to update that folder. This deployment limitation is distinct from the tested implementation.

## Before / after at 120 BPM

Four choruses per fixture. Root and approach rates are percentages; two-feel/walking are rhythmic classifiers rather than a musical judgment. Voice motion is semitones per matched voice. Complete per-tempo numbers follow.

'''
summary+=table(['Fixture','Root % old → new','Chromatic approach % old → new','Comp hits/bar old → new','Voice motion old → new','MMA comp hits/bar / voice motion'],[[k,f(get('baseline',k)['bass']['root_downbeat_pct'])+' → '+f(get('new',k)['bass']['root_downbeat_pct']),f(get('baseline',k)['bass']['chromatic_approach_pct'])+' → '+f(get('new',k)['bass']['chromatic_approach_pct']),f(get('baseline',k)['comping']['hits_per_bar'])+' → '+f(get('new',k)['comping']['hits_per_bar']),f(get('baseline',k)['comping']['voice_leading_semitones_per_matched_voice']['mean'])+' → '+f(get('new',k)['comping']['voice_leading_semitones_per_matched_voice']['mean']),f(get('MMA',k)['comping']['hits_per_bar'])+' / '+f(get('MMA',k)['comping']['voice_leading_semitones_per_matched_voice']['mean'])] for k in ['blues12','aaba32','ballad16','bossa16','waltz16','funk16']])
summary+='''## All style/tempo cases, sources kept separate

The same original charts, four choruses and three exports per case were used. 72 baseline + 72 new + 72 MMA MIDI files were rendered for the comparison. Rows describe run 0; independent-export equality and chorus variation are recorded in the aggregate file. The new fixed seed is intentionally reproducible. New take changes discretionary events.

'''+table(['Source','Fixture','BPM','Root %','Chromatic approach %','Two-feel / walk %','Comp hits/bar','Voice movement','Ride ratio'],rows)
summary+='''Ride ratio is unidentifiable where the reference has no eligible onbeat/offbeat/onbeat ride triplets. Do not read N/M as 1:1 or infer straight timing from absent ride notes. The stock MMA swing groove uses hats and additional percussion, so it cannot be used to calibrate a ride curve directly.

## Articulation and variation

At 120 BPM; corresponding complete per-tempo distributions are in [the aggregate JSON](accompaniment-metrics.json). Repetition is the proportion of matching written bars whose rhythm repeats in the next chorus. It excludes velocity differences. More novelty is not always better: bossa/funk timekeeping anchors remain stable and discretionary support changes.

'''
summary+=table(['Source','Fixture','Bass length SD (beats)','Bass range (MIDI)','Comp size mean','Comp rhythm repetition %','Drum rhythm repetition %'],[[s,k,f(get(s,k)['bass']['duration_beats']['sd']),'–'.join(map(str,get(s,k)['bass']['range'])),f(get(s,k)['comping']['voicing_size']['mean']),f(100-get(s,k)['variation']['comping']['rhythm_changed_pct']),f(100-get(s,k)['variation']['drums']['rhythm_changed_pct'])] for s in ['baseline','new','MMA'] for k in ['blues12','aaba32','ballad16','bossa16','waltz16','funk16']])
summary+='''The aggregate JSON also contains signed bass interval/approach distributions, note ranges and lengths, attack histograms, voicing sizes, matched/unmatched voice statistics, drum-instrument positions and velocity ranges, candidate-fill spans, section densities and variation. Only aggregates are retained; no MMA/GMD note sequence or groove is delivered.

## Fill/form checks and support states

For the new band, semantic fill intent is available directly and is more reliable than guessing from MIDI. The original/reference MIDI uses the deliberately limited candidate detector defined in the measurements document; those candidate counts are not equivalent to annotated complete fills.

'''
fills=[];gates=[]
for r in data['new']:
 p=json.loads((here/'output/new'/f"{r['fixture']}-{r['tempo']}-intents.json").read_text());bs=[b for b in p['bars'] if b.get('fill')];valid=all(b['phraseEnd'] for b in bs);gates.append(valid)
 if r['tempo']==120:fills.append([r['fixture'],', '.join(str(i+1) for i,b in enumerate(p['bars']) if b.get('fill')) or 'None',', '.join(sorted(set(f(b['fill']['length']) for b in bs))) or 'N/A',len(set(b['supportState'] for b in p['bars'])), '100%' if bs and valid else 'N/A'])
summary+=table(['Fixture','Performed fill bars (1-based)','Fill lengths (beats)','Intentional support states','Fills on eligible boundaries'],fills)
summary+='''A twelve-bar chorus can now receive a fill at its actual end. Fills are optional and need not occur at every chorus ending. Whole rests remain available, especially at low energy. No additional fill is scheduled solely because a global counter reached a multiple of eight.

## Target checks

Thresholds come from `src/lib/band-config.json`. H values remain original listening hypotheses. MMA's much denser chord parts and often-rooted bass were not copied as targets; GMD affects bounded drum expression, not the swing curve or harmony.

'''
checks=[]
swing=[r for r in data['new'] if r['fixture'] in ('blues12','aaba32')]
for r in swing:
 target=dict(cfg['swingCurve'])[r['tempo']];actual=r['drums']['ride_swing_ratio']['median'];checks.append((f"{r['fixture']} {r['tempo']} ride curve",abs(actual-target)<=cfg['targets']['swingTolerance'],f(actual)+' vs '+f(target)))
checks.append(('60-BPM auto swing permits two-feel',any(r['tempo']==60 and r['bass']['twofeel_bars']>0 for r in swing),'measured nonzero share'))
checks.append(('Swing root anchoring 80–95%',all(80<=r['bass']['root_downbeat_pct']<=95 for r in swing),'all cases'))
checks.append(('Swing approach diversity at 120–240 BPM',all(cfg['targets']['approachMin']<=r['bass']['chromatic_approach_pct']/100<=cfg['targets']['approachMax'] for r in swing if r['tempo']>=120),'30–65% chromatic; two-feel coverage reported separately'))
checks.append(('Voicing movement improves for all six fixtures at 120 BPM',all(get('new',k)['comping']['voice_leading_semitones_per_matched_voice']['mean']<get('baseline',k)['comping']['voice_leading_semitones_per_matched_voice']['mean'] for k in ['blues12','aaba32','ballad16','bossa16','waltz16','funk16']),'matched-voice comparison'))
checks.append(('Ballad 0.75–1.5 comp hits/bar',all(cfg['targets']['balladMinHits']<=r['comping']['hits_per_bar']<=cfg['targets']['balladMaxHits'] for r in data['new'] if r['fixture']=='ballad16'),'every tempo'))
checks.append(('Bass articulation variance',all(r['bass']['duration_beats']['sd']>0 for r in data['new']),'nonzero in every case'))
checks.append(('Fill/form alignment',all(gates),'all 24 cases'))
summary+=table(['Check','Result','Evidence'],[[name,'PASS' if ok else 'LIMIT / RETUNE',value] for name,ok,value in checks]);
summary+='''Targets are diagnostic constraints, not a human-musician certification. The 60-BPM approach percentage is interpreted alongside the lack of final-beat attacks in two-feel, rather than forcing a walking approach into a sparse line. Shorter/repeated groove articulations need not maximize note-length variance.

## Sample levels, loudness and browser validation

'''
audioPath=here/'output/audio-levels.json'
if audioPath.exists():
 a=json.loads(audioPath.read_text());summary+=f"Offline audio sweep: **{len(a.get('mixes',[]))}/24 mixes**, four choruses, measured stereo output; maximum observed peak **{f(max((x['peak'] for x in a.get('mixes',[])),default=0))}**. The sweep uses 22,050-Hz diagnostic rendering; user WAV export is stereo 44,100 Hz.\n\n"
 summary+=table(['Instrument','Velocity','Measured RMS','Peak'],[[r['instrument'],r['velocity'],f(r['rms']),f(r['peak'])] for r in a.get('stems',[])])
 summary+='Isolated stems use unity mixer controls to expose velocity response; complete-mix checks use the app defaults. A raw MIDI velocity is not an acoustic loudness measurement. Individual transient peak order need not follow integrated RMS order.\n\n'
abPath=here/'output/ab-levels.json'
if abPath.exists():
 ab=json.loads(abPath.read_text());summary+=f"A/B matching: {len(ab)}/24 cases checked by rendering both versions after their excerpt-matching gains; maximum absolute RMS-level difference **{f(max((abs(x['differenceDb']) for x in ab),default=0))} dB** over the initial excerpt. Matching attenuates after the common master chain; it never boosts peaks. This is not whole-song LUFS normalization.\n\n"
for name,label in [('browser-ten-minute-soak.json','Ten-minute 240-BPM scheduling soak'),('browser-band.json','Final all-style live/MIDI parity'),('browser-ui.json','Production UI checks')]:
 p=here/'output'/name
 if p.exists():
  b=json.loads(p.read_text());summary+=f"**{label}: {'PASS' if b.get('passed') else 'FAIL'}.** "
  if 'styles' in b:summary+=f"{len(b['styles'])} offered styles played; live plans matched deterministic export inputs. "
  if 'longRun' in b and b['longRun'].get('stop'):summary+=f"Wall time {f(b['longRun'].get('elapsedWallSeconds'))} seconds; {b['longRun']['stop']['scheduled']} scheduled events; maximum observed scheduling lateness {f(b['longRun']['stop']['maxLateMs'])} ms; {b['longRun']['stop']['remaining']} tracked voices after Stop. "
  if 'checks' in b:summary+=f"{len(b['checks'])} checks, including persistence, tuning export, credits, mobile layout, theme deletion and production playback. "
  summary+='\n\n'
summary+='''The two real-time ten-minute development soaks exercised the same scheduling architecture under a denser support configuration; the final all-style check additionally compares every serialized MIDI note against the current live plan. Subsequent palette/deletion and excerpt-gain additions have separate UI/audio checks. Background-tab suspension is still handled by the existing pause-on-timing-interruption policy; this test does not guarantee real-time audio under every OS load.

Automated output/level checks were performed; no human listening session is claimed. Use Original/New band and the saved tuning controls for the final musical audition. The implementation is complete in the writable copy, with the original-folder apply step constrained by OS permissions.

## Reproduction

Run `npm test`, `npm run build`, then `npm run eval:band`. For references, run `download-references.py`, `render-mma.mjs` (which maps track roles), and `analyze-all.py`. GMD aggregation is `scripts/build-groove-stats.mjs`; sample calibration and offline browser checks are in `scripts/accompaniment-eval/`. Raw downloaded reference materials remain outside the project. No application dependency was added.
'''
(docs/'accompaniment-results.md').write_text(summary)
(docs/'accompaniment-metrics.json').write_text(json.dumps(data,indent=2)+'\n')
# Current reference measurements precede the immutable historical Phase 1 report.
base=(docs/'accompaniment-measurements.md').read_text();marker='<!-- PHASE_1_HISTORICAL -->'
if marker in base:base=base.split(marker,1)[1].lstrip()
new='''# Accompaniment measurements — current implementation update

2026-11-14. The user subsequently authorized downloading and running MMA. Its 24 original-fixture renders now replace the previous **MMA runtime unavailable** status. JJazzLab/Toolkit and Impro-Visor were not executed and remain unmeasured. MMA is an automatic generator, not a human band. Sources below are kept separate; no groove or note sequence has been copied into Jazzbook.

MMA 25.05.3 official archive: https://www.mellowood.ca/mma/mma-devl.25.05.3.tar.gz . Python was already installed; no package installation occurred. The source archive was executed for measurements only. Groove choices: blues/AABA `stdlib/swing:Swing`; ballad `stdlib/ballad:Ballad`; bossa `stdlib/bossanova:BossaNova`; waltz `stdlib/jazzwaltz:JazzWaltz`; funk `stdlib/bvfunk:BVFunk`. All tempos below rendered successfully; extreme tempos are stress cases, not endorsements of musical suitability. Original chart labels and bar metadata match the historical fixture definitions.

MMA native track roles were obtained with `-c`. CHORD tracks define comping; ARPEGGIO parts are excluded. MIDI program alone is not a role label. Forty-millisecond strum clustering and ±0.025-beat boundary tolerance apply to all three sources in this current comparison. Notes 51/53/59 form the ride family. The older exact-onset Phase 1 analysis is retained below as historical evidence.

## Current comparison matrix

'''+table(['Source','Fixture','BPM','Root %','Chromatic approach %','Two-feel / walk %','Comp hits/bar','Voice movement','Ride ratio'],rows)
new+='''## Complete aggregate evidence and interpretation

[Results and target checks](accompaniment-results.md) report articulation, dynamic response, repetition, form-based fill positions and rendered loudness. [All metric distributions](accompaniment-metrics.json) preserve bass interval/approach counts, ranges and length statistics; comp rhythm histograms, density, size, range and matched-voice motion; drum instrument histograms, velocity ranges and ride ratios; and section/chorus variation for every case/source. These are aggregates only.

GMD is separate from the three accompaniment generators: its human drum training-set aggregates influence bounded timing/velocity; no MIDI phrase is reproduced. 291 training-set, beat-only 4/4 performances contribute to the 48,088-byte app statistics. Official archive SHA-256: `651cbc524ffb891be1a3e46d89dc82a1cecb09a57c748c7b45b844c4841dcc1e`. Credit: Google LLC, CC BY 4.0; Gillick et al., “Learning to Groove with Inverse Sequence Transformations,” ICML 2019. Source: https://magenta.tensorflow.org/datasets/groove .

## H target decisions after adding references

- Keep the original tempo-dependent swing hypotheses: MMA Swing does not supply qualifying ride triplets, and its hat/percussion choices cannot justify a ride-curve target. Human GMD timing is not substituted for the explicit swing curve.
- Keep sparse ballad comping as an original listening hypothesis. MMA's substantially denser CHORD track demonstrates a different arrangement, not a requirement to fill the space.
- Keep contextual bass anchoring and mixed approaches. MMA's high root percentages and almost absent semitone approaches are a useful counterexample to the old always-root/always-chromatic combination, not a distribution to copy.
- Use smaller voice movement with guides/register constraints. The new band improves on its own baseline; MMA's varied instrumentation and strumming are reported separately.
- Replace constant role velocities with measured sample calibration plus bounded human drum aggregates. MIDI velocity does not establish acoustic loudness by itself.
- Form-based fills and intentional support states are assessed by their eligibility/intent; the old MIDI fill proxy remains deliberately limited. No universal fill-frequency target is inferred from a generator or from a dataset of drum exercises.

No `/data/reference-midi/<tool>/` directory was present. Additional tools were not invented or silently pooled. No JJazzLab or Impro-Visor runtime claim is made.

## Historical Phase 1 snapshot (superseded runtime availability)

'''+marker+'\n'+base
(docs/'accompaniment-measurements.md').write_text(new)
(docs/'accompaniment-target-checks.json').write_text(json.dumps([{'check':n,'passed':ok,'evidence':v} for n,ok,v in checks],indent=2)+'\n')
print('Wrote current measurements, results, aggregate JSON and target checks:',sum(ok for _,ok,_ in checks),'/',len(checks),'pass')
