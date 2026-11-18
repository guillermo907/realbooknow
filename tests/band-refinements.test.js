import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultSettings,normalizeSettings} from '../src/store/themes.js';
import {matchStyleBand,STYLE_BANDS} from '../src/lib/style-band.js';
import {createPerformanceSession,renderEvent} from '../src/lib/performance.js';
import {PracticeEngine} from '../src/lib/audio.js';
import {StudioTrio,chooseRegion} from '../src/lib/studio.js';
import {guidePcs,voicingPool} from '../src/lib/comping.js';
import {parseChord,mod} from '../src/lib/band-theory.js';
import {bandConfig} from '../src/lib/band-config.js';
const song=(style='Medium Swing')=>({id:'modal',key:'D',tempo:136,style,chart:'T44*A'+Array(16).fill('D-7   ').join('|')+'Z'});
const plan=(style,opts={})=>createPerformanceSession(song(style),style,{choruses:2,countIn:0,takeSeed:11,...opts}).planAll();
test('automatic band changes once per style, respects the lock and reapplies on unlock',()=>{
 assert.equal(defaultSettings.keepBandInstruments,false);
 let s=matchStyleBand({...defaultSettings,bass:0,chords:.31,master:.51},'Medium Swing');assert.equal(s.bassTone,'acoustic');
 s={...s,bassTone:'fretless',tone:'bright'};
 assert.equal(matchStyleBand(s,'Medium Swing'),s,'same style retains customizations');
 const f=matchStyleBand(s,'Funk');assert.equal(f.bassTone,'jazz');assert.equal(f.pianoSound,'wurli');assert.equal(f.bass,0);assert.equal(f.chords,.31);assert.equal(f.master,.51);
 const locked={...f,keepBandInstruments:true,bassTone:'sub',tone:'warm',takeSeed:99};assert.equal(matchStyleBand(locked,'Jazz Waltz'),locked);
 const unlocked=matchStyleBand({...locked,keepBandInstruments:false,bandStyleKey:''},'Jazz Waltz');assert.equal(unlocked.bassTone,'acoustic');assert.equal(unlocked.takeSeed,99);
 for(const [style,family] of [['Ballad','ballad'],['Rock','rock'],['Bossa Nova','bossa'],['Latin','latin'],['Shuffle','shuffle']])assert.equal(matchStyleBand(defaultSettings,style).bassTone,STYLE_BANDS[family].bassTone);
 const ballad=plan('Ballad',{...locked,choruses:1});assert.ok(!ballad.events.some(e=>e.bassSound==='precision'),'instrument lock prevents the old Ballad override');assert.ok(ballad.events.some(e=>e.instrument==='rim'));
});
test('minor shells have their written seventh, modal structures keep guide tones and vary inversions',()=>{
 const c=bandConfig(),ch=parseChord('D-7');for(const v of voicingPool(ch,[],.7,c))assert.ok(!v.notes.some(n=>mod(n)===1),'no C sharp over Dm7');
 const p=plan('Medium Swing'),attacks=p.bars.flatMap(b=>b.attacks);
 assert.ok(attacks.every(a=>guidePcs(ch).every(pc=>a.voicing.some(n=>mod(n)===pc))));
 assert.ok(attacks.some(a=>[5,9,0,4].every(pc=>a.voicing.some(n=>mod(n)===pc))),'Fmaj7 over D');
 assert.ok(new Set(attacks.map(a=>a.voicing.join())).size>5);
 assert.ok(attacks.some(a=>a.length>2)&&attacks.some(a=>a.length<.5));
});
test('drum ghosts have independent frequency and level with consistent hierarchy and continuous time',()=>{
 for(const style of ['Medium Swing','Ballad','Bossa Nova','Latin','Jazz Waltz','Funk','Rock','Shuffle']){
  const p=plan(style,{drumsGhosts:1,drumsBreaks:0}),quiet=plan(style,{drumsGhosts:0});
  assert.equal(quiet.events.filter(e=>e.role==='drums'&&e.intent==='ghost').length,0);
  for(const b of p.bars)assert.ok(p.events.some(e=>e.role==='drums'&&e.barId===b.id),style);
  for(const g of p.events.filter(e=>e.role==='drums'&&e.intent==='ghost'))assert.ok(g.velocity<=44);
  if(['Funk','Rock','Shuffle'].includes(style))assert.ok(p.events.some(e=>e.role==='drums'&&e.gesture==='backbeat'&&e.velocity>=70));
 }
 const p=plan('Funk',{drumsGhosts:1}),q=plan('Funk',{drumsGhosts:1,drumsGhostLevel:0});assert.deepEqual(p.events,q.events,'level cannot regenerate the rhythm');
 const calls=[],synth={settings:{drumsGhostLevel:.325},drum:(...args)=>calls.push(args)};
 renderEvent(synth,{role:'drums',instrument:'snare',intent:'ghost',velocity:32},10);assert.equal(calls[0][2],.5);
 const n=normalizeSettings({bassGhostLevel:9,drumsGhostLevel:-1,drumsGhosts:2});assert.equal(n.bassGhostLevel,1);assert.equal(n.drumsGhostLevel,0);assert.equal(n.drumsGhosts,1);
});
// Small Web Audio probe: captures the active renderer's source/envelope graph.
function audioProbe(){
 const nodes=[],sources=[],param=()=>({value:0,calls:[],setValueAtTime(...x){this.calls.push(['set',...x]);},linearRampToValueAtTime(...x){this.calls.push(['linear',...x]);},exponentialRampToValueAtTime(...x){this.calls.push(['exp',...x]);},setTargetAtTime(...x){this.calls.push(['target',...x]);},cancelScheduledValues(){}});
 const node=()=>{const n={connect(){},disconnect(){},gain:param(),frequency:param(),pan:param(),threshold:param(),knee:param(),ratio:param(),attack:param(),release:param()};nodes.push(n);return n;};
 const ctx={currentTime:0,sampleRate:1000,destination:node(),createGain:node,createBiquadFilter:node,createStereoPanner:node,createDynamicsCompressor:node,createConvolver:node,createBuffer(channels,length,rate){const data=Array.from({length:channels},()=>new Float32Array(length));return {duration:length/rate,numberOfChannels:channels,sampleRate:rate,getChannelData:i=>data[i]};},createBufferSource(){const n={...node(),playbackRate:{value:1},start(t){this.started=t;},stop(t){this.stopped=t;}};sources.push(n);return n;}};
 return {ctx,nodes,sources};
}
test('bass ghost renders a pitchless damped transient; its level does not alter normal samples',()=>{
 const {ctx,sources,nodes}=audioProbe(),synth=new StudioTrio(ctx,{...defaultSettings,bassGhostLevel:0},{instruments:{},buffers:new Map()});
 renderEvent(synth,{role:'bass',intent:'ghost',midi:38,velocity:46,seconds:.08},1);
 assert.equal(sources.length,1);assert.equal(sources[0].playbackRate.value,1);assert.ok(sources[0].buffer.duration<.1);assert.ok(nodes.some(n=>n.gain.calls.some(x=>x[0]==='linear'&&x[1]===0)));
 const wave=[...sources[0].buffer.getChannelData(0)];renderEvent(synth,{role:'bass',intent:'ghost',midi:50,velocity:46,seconds:.08},2);assert.equal(sources[1].playbackRate.value,1);assert.notDeepEqual([...sources[1].buffer.getChannelData(0)],wave,'deterministic varying plucks');
 synth.disconnect();
});
test('piano holds loop before the recorded decay ends, and stabs do not loop',()=>{
 const {ctx,sources}=audioProbe(),buffer=ctx.createBuffer(1,4000,1000);buffer.getChannelData(0).fill(.1);
 const bank={instruments:{piano:[{file:'p',root:60,velocity:65}]},buffers:new Map([['p',buffer]])},synth=new StudioTrio(ctx,defaultSettings,bank);
 synth.tone(60,1,2.5,'chords',1,65,.45);assert.equal(sources[0].loop,true);assert.ok(sources[0].loopEnd<buffer.duration);assert.ok(sources[0].stopped>3.9);
 synth.tone(64,5,.2,'chords',1,65,.055);assert.ok(!sources[1].loop);assert.ok(sources[1].stopped<5.3);synth.disconnect();
});
test('instrument edits enter on a future bar, keeping current voices and user levels',()=>{
 const e=new PracticeEngine(),p=plan('Medium Swing'),calls=[];e.ctx={currentTime:0};e.epoch=0;e.performance=p;e.plan=p.bars;e.queue=e.makeQueue(p);e.cursor=0;e.config=bandConfig();e.settings={...defaultSettings};e.synth={settings:{...defaultSettings},update(s,t){this.settings=s;calls.push({s,t});},tone(){},drum(){},silence(){throw Error('Instrument changes must not silence held voices');}};e.timer=1;
 e.update({...defaultSettings,bassTone:'bright',tone:'bright',bass:0});assert.equal(e.synth.settings.bassTone,'acoustic');assert.equal(e.synth.settings.bass,0);assert.ok(e.soundChange.time>0);
 const boundary=e.soundChange.time;e.ctx.currentTime=boundary-.1;e.cursor=e.queue.findIndex(x=>x.time>=boundary);e.tick();assert.equal(e.synth.settings.bassTone,'bright');assert.equal(calls.at(-1).t,boundary);clearInterval(e.timer);e.timer=null;
});

test('repeated sample attacks keep the chosen velocity layer when no round robin exists',()=>{const layers=[{root:60,velocity:40,file:'soft'},{root:60,velocity:90,file:'loud'}];assert.equal(chooseRegion(layers,60,42,1,'soft'),layers[0]);assert.equal(chooseRegion(layers,60,88,1,'loud'),layers[1]);});

test('long grand recordings keep their natural decay instead of looping the first second',()=>{
 const {ctx,sources}=audioProbe(),buffer=ctx.createBuffer(1,10000,1000);buffer.getChannelData(0).fill(.1);
 const bank={instruments:{grandYamaha:[{file:'natural',root:60,velocity:72,naturalDecay:true,gain:1}]},buffers:new Map([['natural',buffer]])},synth=new StudioTrio(ctx,{...defaultSettings,pianoSound:'yamaha'},bank);
 synth.tone(60,1,3,'chords',1,72,.45);assert.ok(!sources[0].loop);assert.equal(sources[0].buffer,buffer);assert.ok(sources[0].stopped>4.4);synth.disconnect();
});
