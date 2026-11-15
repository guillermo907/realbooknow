import {test} from 'node:test';
import assert from 'node:assert/strict';
import {rhythmStep,stepDuration} from '../src/lib/rhythm.js';
import {pattern,compVoicing,bassPitch} from '../src/lib/accompaniment.js';
import {velocityGain} from '../src/lib/studio.js';
import {parseChord,mod} from '../src/lib/chords.js';
import {buildPlan} from '../src/lib/plan.js';
const song={title:'Groove study',style:'Medium Swing',key:'C',tempo:140,chart:'T44[C^7   |C^7   |C^7   |C^7   |D-7   |G7   |C^7   |C^7   Z'};
const plan=buildPlan(song,{choruses:2});
const steps=(visit,style=song.style)=>Array.from({length:visit.beats*2},(_,step)=>rhythmStep(style,visit,step));
test('Swing ride uses quarter notes plus skips after 2 and 4, with softer skips and ghost notes',()=>{
 const feel=steps(plan[0]);assert.deepEqual(feel.flatMap((f,i)=>f.drums.some(d=>d.kind==='ride')?[i]:[]),[0,2,3,4,6,7]);
 assert.deepEqual(feel.flatMap((f,i)=>f.drums.some(d=>d.kind==='pedal')?[i]:[]),[2,6]);
 assert.ok(feel[2].drums.find(d=>d.kind==='ride').velocity>feel[3].drums.find(d=>d.kind==='ride').velocity);
 assert.ok(plan.flatMap(v=>steps(v)).some(f=>f.drums.some(d=>d.kind==='snare'&&d.velocity<45)));
});
test('Comping phrases contain rests, distinct bar rhythms, varied note lengths and dynamic arcs',()=>{
 const signatures=plan.slice(0,8).map(v=>steps(v).flatMap((f,i)=>f.comp?[i]:[]).join(','));
 assert.ok(new Set(signatures).size>=5);assert.ok(signatures.includes(''));
 const hits=plan.flatMap(v=>steps(v).filter(f=>f.comp));assert.ok(Math.max(...hits.map(f=>f.compVelocity))-Math.min(...hits.map(f=>f.compVelocity))>=15);
 assert.ok(new Set(hits.map(f=>f.compDuration)).size>=2);assert.ok(hits.every(f=>Math.abs(f.compOffset)<.015));
 assert.notDeepEqual(steps(plan[1]).map(f=>f.comp),steps(plan[9]).map(f=>f.comp));
});
test('Fills are reserved for phrase endings rather than every bar',()=>{
 for(const visit of plan.slice(0,7)){const fills=steps(visit).some(f=>f.fill);assert.equal(fills,visit.visit%4===3);}
});
test('Latin and funk keep different bass/comping patterns; funk includes soft inner sixteenths',()=>{
 const latin=steps(plan[0],'Bossa Nova'),funk=steps(plan[0],'Funk');
 assert.notDeepEqual(latin.map(f=>f.comp),funk.map(f=>f.comp));assert.deepEqual(latin.flatMap((f,i)=>f.bass?[i]:[]),[0,3,4,7]);assert.ok(funk.some(f=>f.drums.some(d=>d.delay===.5&&d.velocity<40)));
});
test('Piano guide tones leave seventh chord roots to bass and keep written triads intact',()=>{
 const voices=compVoicing('C^7',[],true,true);assert.ok(voices.length>=3);assert.ok(voices.every(n=>mod(n)!==0));assert.ok(voices.some(n=>mod(n)===4));assert.ok(voices.some(n=>mod(n)===11));assert.ok(compVoicing('C',[],false,true).some(n=>mod(n)===0));
});
test('Walking bass approaches the next root chromatically and stays in recorded range',()=>{
 const feel={swing:true,beat:3},note=bassPitch(parseChord('D-7'),parseChord('G7'),feel,41,{approach:true});assert.ok([1,11].includes(mod(note-7)));
 for(const root of ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'])for(const previous of [28,38,52]){const n=bassPitch(parseChord(root+'7'),parseChord('C^7'),feel,previous,{approach:true});assert.ok(n>=28&&n<=52);}
});
test('Continuous velocity expression makes soft and accented notes audibly different',()=>{
 assert.ok(velocityGain(95)>velocityGain(45)*2);assert.ok(velocityGain(65)<velocityGain(75));assert.equal(velocityGain(100),1);
});
test('Live/WAV scheduling uses varied dynamics and voices new written chords even during rests',()=>{
 const short={...song,chart:'T44[C^7 G7  |D-7 G7  Z'},visits=buildPlan(short,{choruses:1}),tones=[],drums=[];
 const synth={settings:{embellish:true,harmony:0,swing:.6},previous:[],tone(...args){tones.push(args);},drum(...args){drums.push(args);}};let time=0;
 visits.forEach((visit,index)=>{for(let step=0;step<visit.beats*2;step++){pattern(synth,visit,step,time,140,0,short.style,visits[index+1]);time+=stepDuration(140,synth.settings,rhythmStep(short.style,visit,step),step,visit.meter);}});
 const keys=tones.filter(t=>t[3]==='chords');assert.ok(new Set(keys.map(t=>t[5])).size>4);assert.ok(drums.some(d=>d[3]>80));assert.ok(drums.some(d=>d[3]<50));assert.equal(synth.lastCompSymbol,'G7');
});
test('Odd and compound meters produce finite schedules that end exactly at the bar',()=>{
 for(const meter of [[3,4],[5,4],[7,8],[6,8]]){const visit={...plan[0],meter,beats:meter[0]*4/meter[1]};const feel=steps(visit,'Jazz Waltz');const duration=feel.reduce((sum,f,i)=>sum+stepDuration(120,{swing:.6},f,i,meter),0);assert.ok(Math.abs(duration-visit.beats*.5)<1e-8);assert.ok(feel.every(f=>f.drums.every(d=>Number.isFinite(d.velocity))));}
});
test('A chromatic approach resolves into the same octave on the next downbeat',()=>{
 const d=parseChord('D-7'),g=parseChord('G7'),approach=bassPitch(d,g,{swing:true,beat:3},41,{approach:true});
 const landing=bassPitch(g,parseChord('C^7'),{swing:true,beat:0},approach,{anchor:true});assert.equal(Math.abs(landing-approach),1);
});
test('Two Feel uses two bass notes rather than a four-note walking line',()=>{
 assert.deepEqual(steps(plan[0],'Two Feel').flatMap((f,i)=>f.bass?[i]:[]),[0,4]);
});
test('MIDI exports the shared ride pattern and expressive note velocities',async()=>{
 const {midi}=await import('../src/lib/export.js');const bytes=new Uint8Array(await midi(song,{choruses:1,countIn:'0',master:.65,bass:.7,chords:.48,drums:.35,harmony:0,swing:.6,embellish:true}).arrayBuffer());const view=new DataView(bytes.buffer);let cursor=14;const hits=[];
 const variable=()=>{let value=0,b;do{b=bytes[cursor++];value=(value<<7)|(b&127);}while(b&128);return value;};
 while(cursor<bytes.length){const size=view.getUint32(cursor+4);cursor+=8;const end=cursor+size;
  while(cursor<end){variable();const status=bytes[cursor++];if(status===255){cursor++;const length=variable();cursor+=length;}else{const n=status>>4,a=bytes[cursor++],b=[12,13].includes(n)?null:bytes[cursor++];if(n===9&&b)hits.push({channel:status&15,note:a,velocity:b});}}
 }
 const drums=hits.filter(h=>h.channel===9);assert.ok(drums.some(h=>h.note===51));assert.ok(drums.some(h=>h.note===44));assert.ok(new Set(drums.map(h=>h.velocity)).size>=5);
 const keys=hits.filter(h=>h.channel===0);assert.ok(Math.max(...keys.map(h=>h.velocity))-Math.min(...keys.map(h=>h.velocity))>=20);
});
