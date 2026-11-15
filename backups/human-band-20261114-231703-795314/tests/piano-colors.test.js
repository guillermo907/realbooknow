import test from 'node:test';
import assert from 'node:assert/strict';
import {createPerformanceSession} from '../src/lib/performance.js';
import {spreadVoicings} from '../src/lib/swing-arranger.js';
import {parseChord,chordScale,mod} from '../src/lib/band-theory.js';
import {bandConfig} from '../src/lib/band-config.js';
test('sustained D minor uses compatible upper structures and develops piano phrases',()=>{
 const chord=parseChord('D-7'),scale=chordScale(chord),pool=spreadVoicings(chord,[],true,bandConfig(),5);
 assert.ok(pool.some(v=>[5,9,0,4,7].every(pc=>v.some(n=>mod(n)===pc))),'Fmaj9 upper structure');
 const song={style:'Medium Swing',key:'D',tempo:136,chart:'T44*A'+Array(16).fill('D-7   ').join('|')+'Z'},options={choruses:2,countIn:0,takeSeed:1,rhythmSectionOnly:false},p=createPerformanceSession(song,song.style,options).planAll();
 const attacks=p.bars.flatMap(b=>b.attacks);assert.ok(new Set(attacks.map(a=>a.voicing.map(n=>mod(n)).sort().join())).size>2);assert.ok(attacks.every(a=>a.voicing.every(n=>scale.includes(mod(n)))));assert.ok(attacks.some(a=>a.at%1===.5)&&attacks.some(a=>a.length>2)&&attacks.some(a=>a.length<.5));
 assert.deepEqual(p.events,createPerformanceSession(song,song.style,options).planAll().events);
});
