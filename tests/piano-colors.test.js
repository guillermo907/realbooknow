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

test('piano touch separates hands, damps stabs and resolves an upper neighbor',async()=>{const {pianoTouch,pianoEmbellishment}=await import('../src/lib/piano-touch.js'),c=bandConfig(),span={symbol:'D-7',chord:parseChord('D-7')},context={c,rng:()=>0,bar:{tempo:136,phraseBar:0},span,length:3,attackId:'a',gesture:'hold',velocity:62,guides:[],kind:'modal',anticipation:false,scale:chordScale(span.chord)},notes=[53,57,60,64],item={at:0,length:3,roll:.03};const held=pianoTouch(notes,item,context);assert.ok(held.some(n=>n.at===.5)&&held.some(n=>n.at===0));const turn=pianoEmbellishment(notes,item,context);assert.equal(turn.length,2);assert.equal(turn[1].midi,notes.at(-1));const short=pianoTouch(notes,{...item,length:.3},{...context,length:.3});assert.ok(short.every(n=>n.release<.1&&n.length<=.3));});
