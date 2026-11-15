import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {chooseRegion} from '../src/lib/studio.js';
import {PracticeEngine,wav} from '../src/lib/audio.js';
test('Sample selection preserves velocity layers, nearest pitch and alternating strikes',()=>{
 const regions=[{root:48,velocity:40,rr:0},{root:60,velocity:40,rr:0},{root:60,velocity:90,rr:0},{root:60,velocity:90,rr:1}];
 assert.equal(chooseRegion(regions,49,30).root,48);assert.equal(chooseRegion(regions,59,85,0),regions[2]);assert.equal(chooseRegion(regions,59,85,1),regions[3]);assert.equal(chooseRegion(regions,59,85,2),regions[2]);
});
test('Stop cancels a pending first load without starting a timer',async()=>{
 const engine=new PracticeEngine();let release;engine.ready=()=>new Promise(resolve=>{release=resolve;});
 const pending=engine.play({key:'C'},{},{});assert.equal(engine.snapshot.state,'loading');engine.stop();release();assert.equal(await pending,false);assert.equal(engine.snapshot.state,'stopped');assert.equal(engine.timer,null);
});
test('A failed load exposes a retryable error instead of synthetic fallback',async()=>{
 const engine=new PracticeEngine();engine.ready=async()=>{throw Error('Download unavailable');};await assert.rejects(engine.play({key:'C'},{},{}),/Download unavailable/);assert.equal(engine.snapshot.state,'error');assert.equal(engine.timer,null);engine.stop();assert.equal(engine.snapshot.error,null);
});
test('Studio samples are bundled and match their source manifest',()=>{
 const base=new URL('../public/audio/studio-v1/',import.meta.url),manifest=JSON.parse(readFileSync(new URL('manifest.json',base)));
 for(const part of ['piano','bass','ride','hat','pedal','kick','snare','rim']){assert.ok(manifest.instruments[part]?.length>1,part);for(const region of manifest.instruments[part]){const bytes=readFileSync(new URL(region.file,base));assert.equal(bytes.length,region.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),region.sha256);}}
 assert.equal(new Set(manifest.instruments.piano.map(r=>r.velocity)).size,4);assert.ok(manifest.sources.every(source=>source.license&&source.revision));
});
test('WAV preserves stereo CD sample rate and interleaved PCM',async()=>{
 const buffer={numberOfChannels:2,length:2,sampleRate:44100,getChannelData:channel=>channel?[.5,-.5]:[1,-1]};const data=new DataView(await wav(buffer).arrayBuffer());assert.equal(data.getUint32(24,true),44100);assert.equal(data.getUint16(22,true),2);assert.equal(data.getInt16(44,true),32767);assert.equal(data.getInt16(46,true),16383);
});

test('Playable notes stay within two semitones of their recorded root',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../public/audio/studio-v1/manifest.json',import.meta.url)));
 for(const [part,low,high] of [['piano',45,84],['bass',36,48]])for(let midi=low;midi<=high;midi++)for(const velocity of [40,65,90,115]){const region=chooseRegion(manifest.instruments[part],midi,velocity);assert.ok(Math.abs(region.root-midi)<=2,`${part} ${midi} -> ${region.root}`);}
});
