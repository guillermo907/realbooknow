import {midiFromPerformance} from '../src/lib/band-midi.js';
import {readSMF} from '../scripts/accompaniment-eval/smf.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {PIANO_SOUNDS} from '../src/lib/piano-sounds.js';
import {BASS_SOUNDS} from '../src/lib/bass-sounds.js';
import {instrumentParts,instrumentsReady} from '../src/lib/instrument-library.js';
import {normalizeSettings,defaultSettings} from '../src/store/themes.js';
import {chooseRegion,StudioTrio,loadInstrumentParts} from '../src/lib/studio.js';
import {controlHelp} from '../src/lib/control-help.js';
import {PracticeEngine} from '../src/lib/audio.js';
import {createPerformanceSession} from '../src/lib/performance.js';
import {bandConfig} from '../src/lib/band-config.js';
const base=new URL('../public/audio/studio-v2/',import.meta.url),manifest=JSON.parse(readFileSync(new URL('manifest.json',base)));
test('recorded instrument assets are complete, pinned and correctly hashed',()=>{
 assert.deepEqual(Object.keys(PIANO_SOUNDS),['yamaha','steinway','grand','wurli','pianet']);assert.equal(BASS_SOUNDS.studioElectric.ghost,'bassGhost');
 const seen=new Set();for(const regions of Object.values(manifest.instruments))for(const r of regions){if(seen.has(r.file))continue;seen.add(r.file);const bytes=readFileSync(new URL(r.file,base));assert.equal(bytes.length,r.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),r.sha256);assert.ok(r.sourceSha1);assert.ok(r.gain>0&&r.gain<10);}
 assert.ok(seen.size>400);assert.ok(manifest.sources.every(s=>s.license&&(s.repository.startsWith('https://freesound.org/')?s.soundIds.length===12:/^[a-f0-9]{40}$/.test(s.revision))));
});
test('bass variants cover sounding range with distinct real articulations and dynamics',()=>{
 for(const part of ['bassFinger','bassGhost','bassMute','bassRelease'])for(let midi=28;midi<=55;midi++){const r=chooseRegion(manifest.instruments[part],midi,70);assert.ok(Math.abs(r.root-midi)<=2);}
 assert.equal(new Set(manifest.instruments.bassFinger.map(r=>r.velocity)).size,4);
 assert.equal(new Set(manifest.instruments.bassFinger.map(r=>r.rr)).size,4);
 assert.ok(manifest.instruments.bassGhost.every(r=>r.unpitched));
 for(const name of ['epWurli','epPianet'])for(let midi=48;midi<=84;midi++)for(const velocity of [30,60,85,110]){const r=chooseRegion(manifest.instruments[name],midi,velocity);assert.ok(midi>=r.low&&midi<=r.high);assert.ok(velocity>=r.velLow&&velocity<=r.velHigh);}
});
test('new settings validate and only selected recordings are requested',()=>{
 assert.equal(normalizeSettings({pianoSound:'wurli'}).pianoSound,'wurli');assert.equal(normalizeSettings({pianoSound:'fake'}).pianoSound,'grand');assert.equal(normalizeSettings({bassTone:'studioElectric'}).bassTone,'studioElectric');
 assert.deepEqual(instrumentParts(defaultSettings),[]);assert.deepEqual(instrumentParts({...defaultSettings,pianoSound:'pianet'}),['epPianet','epPianetRelease']);assert.equal(instrumentParts({...defaultSettings,bassTone:'studioElectric'}).length,4);
 assert.equal(instrumentsReady({instruments:{},buffers:new Map()},defaultSettings),true);
});
test('all practical and advanced musical controls have specific help text',()=>{
 for(const role of ['bass','piano','drums'])for(const suffix of ['Activity','Variation','Expression'])assert.ok(controlHelp(role+suffix).length>50);
 for(const key of ['pianoSound','tone','bassTone','keepBandInstruments','bassGhosts','bassGhostLevel','drumsGhosts','drumsGhostLevel','drumsBreaks','piano.density','piano.pushProbability','piano.holdProbability','piano.voicingVariation','drumFeel.dynamicDepth','human.compMs','swingCurve.0.1'])assert.ok(controlHelp(key).length>40,key);
});
test('active tone renderer routes actual electric keys, bass ghosts, short notes and releases',()=>{
 const calls=[],synth={settings:{...defaultSettings,pianoSound:'pianet',bassTone:'studioElectric'},config:bandConfig(),filters:{bass:{},chords:{}},sample:(...x)=>calls.push(x),bassDeadNote(){throw Error('Recorded ghosts must use their own samples');}};
 StudioTrio.prototype.tone.call(synth,64,1,1.2,'chords',1,80,.1);assert.equal(calls[0][0],'epPianet');assert.equal(calls[1][0],'epPianetRelease');assert.equal(calls[1][3],2.2);
 calls.length=0;StudioTrio.prototype.tone.call(synth,38,1,.1,'bass',1,45,.01,{ghost:true});assert.equal(calls[0][0],'bassGhost');assert.equal(calls.length,1);
 calls.length=0;StudioTrio.prototype.tone.call(synth,38,1,.18,'bass',1,70);assert.equal(calls[0][0],'bassMute');assert.equal(calls[1][0],'bassRelease');
});
test('sample loading defers a playing instrument switch and cancelling it cannot apply late',async()=>{
 const originalFetch=globalThis.fetch;let release;const asset=new Promise(resolve=>release=resolve),bank={instruments:{},buffers:new Map()},e=new PracticeEngine(),song={key:'D',tempo:120,style:'Medium Swing',chart:'T44*AD-7   |D-7   |D-7   |D-7   Z'},plan=createPerformanceSession(song,song.style,{choruses:1,countIn:0}).planAll();
 globalThis.fetch=async url=>String(url).endsWith('manifest.json')?{ok:true,json:async()=>({instruments:{epWurli:[{file:'test-wurli.m4a',root:60,velocity:60}]}})}:{ok:true,arrayBuffer:()=>asset};
 e.ctx={currentTime:0,decodeAudioData:async()=>({duration:2})};e.settings={...defaultSettings};e.synth={settings:{...defaultSettings},bank,update(s){this.settings=s;},silence(){throw Error('Do not cut held notes');}};e.timer=1;e.epoch=0;e.config=bandConfig();e.performance=plan;
 try{
  e.update({...defaultSettings,pianoSound:'wurli'});assert.equal(e.synth.settings.pianoSound,'grand');assert.equal(e.soundChange,null);
  await new Promise(resolve=>setTimeout(resolve,0));e.update({...defaultSettings,pianoSound:'grand'});release(new ArrayBuffer(4));await new Promise(resolve=>setTimeout(resolve,10));assert.equal(e.soundChange,null);assert.equal(e.synth.settings.pianoSound,'grand');
  e.update({...defaultSettings,pianoSound:'wurli'});assert.ok(e.soundChange.time>0);assert.equal(e.soundChange.pianoSound,'wurli');assert.equal(e.synth.settings.pianoSound,'grand');
 }finally{e.timer=null;globalThis.fetch=originalFetch;}
});

test('MIDI uses the selected electric-key program and the shared note plan',async()=>{const song={key:'D',tempo:120,style:'Medium Swing',chart:'T44*AD-7   |G7   Z'},plan=createPerformanceSession(song,song.style,{choruses:1,countIn:0}).planAll();for(const [pianoSound,program] of [['grand',0],['wurli',4],['pianet',5]]){const midi=readSMF(new Uint8Array(await midiFromPerformance(plan,{pianoSound}).arrayBuffer()));assert.equal(midi.programs[0],program);assert.equal(midi.notes.length,plan.events.length);}});

test('new acoustic pianos and real basses reach the renderer and preserve recorded touch layers',()=>{
 assert.ok(Object.values(BASS_SOUNDS).every(s=>s.kind==='sample'));
 for(const [old,next] of [['electric','jazz'],['fretless','studioElectric'],['sub','warm']])assert.equal(normalizeSettings({bassTone:old}).bassTone,next);
 assert.equal(normalizeSettings({bassTone:'precision'}).bassTone,'precision');
 assert.equal(Object.hasOwn(normalizeSettings({balladSlaps:1,balladPrecision:true}),'balladSlaps'),false);
 for(const [id,part,layers] of [['yamaha','grandYamaha',8],['steinway','grandSteinway',3],['jazz','bassJazz',4],['precision','bassPrecision',1],['picked','bassPicked',2]]){
  const regions=manifest.instruments[part];assert.equal(new Set(regions.map(r=>r.velocity)).size,layers);
  assert.ok(regions.every(r=>r.gain>0));
  const calls=[],synth={settings:{...defaultSettings,...(layers===8||id==='steinway'?{pianoSound:id}:{bassTone:id})},config:bandConfig(),filters:{bass:{},chords:{}},sample:(...x)=>calls.push(x)};
  StudioTrio.prototype.tone.call(synth,60,1,1,'yamaha steinway'.includes(id)?'chords':'bass',1,72,.1);assert.equal(calls[0][0],part);
 }
 assert.ok(manifest.instruments.grandYamaha.every(r=>r.naturalDecay));assert.ok(manifest.instruments.grandSteinway.every(r=>r.naturalDecay));
 assert.equal(new Set(manifest.instruments.bassJazz.map(r=>r.rr)).size,4);
});
