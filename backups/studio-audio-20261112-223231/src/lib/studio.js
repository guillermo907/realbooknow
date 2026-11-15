// Recorded instruments, hosted with the app. See /audio/studio-v1/CREDITS.md.
const BASE='/audio/studio-v1/';
let bankPromise;
const progressListeners=new Set();
let progress={loaded:0,total:0};
function report(){for(const listener of progressListeners)listener(progress);}
async function responseFor(url,cache){
 const hit=await cache?.match(url);if(hit)return hit;
 const response=await fetch(url,{signal:AbortSignal.timeout(45000)});
 if(!response.ok)throw Error(`Instrument download failed (${response.status}). Please retry playback.`);
 // A storage quota or private browsing restriction must not prevent playback.
 if(cache)try{await cache.put(url,response.clone());}catch{}
 return response;
}
export async function loadStudio(context,onProgress){
 if(onProgress){progressListeners.add(onProgress);onProgress(progress);}
 if(!bankPromise)bankPromise=(async()=>{
  let cache;try{cache=await globalThis.caches?.open('vesper-studio-v1');}catch{}
  const manifest=await (await responseFor(BASE+'manifest.json',cache)).json();
  const regions=Object.values(manifest.instruments).flat(),buffers=new Map();
  progress={loaded:0,total:regions.length};report();
  let cursor=0,failed;
  await Promise.all(Array.from({length:6},async()=>{
   while(cursor<regions.length&&!failed){const region=regions[cursor++];try{
    const bytes=await (await responseFor(BASE+region.file,cache)).arrayBuffer();
    buffers.set(region.file,await context.decodeAudioData(bytes));progress={...progress,loaded:progress.loaded+1};report();
   }catch(error){failed=error;}}
  }));
  if(failed)throw Error('Could not load the studio instruments. Check your connection and try again. '+failed.message);
  return {...manifest,buffers};
 })().catch(error=>{bankPromise=undefined;throw error;});
 try{return await bankPromise;}finally{if(onProgress)progressListeners.delete(onProgress);}
}
export function chooseRegion(regions,midi,velocity,sequence=0){
 const layer=regions.reduce((best,r)=>Math.abs(r.velocity-velocity)<Math.abs(best.velocity-velocity)?r:best);
 const candidates=regions.filter(r=>r.velocity===layer.velocity);
 const note=candidates.reduce((best,r)=>Math.abs(r.root-midi)<Math.abs(best.root-midi)?r:best);
 const variants=candidates.filter(r=>r.root===note.root);
 return variants[sequence%variants.length];
}
export class StudioTrio {
 constructor(ctx,settings,bank){
  this.ctx=ctx;this.bank=bank;this.settings=settings;this.previous=[];this.voices=new Set();this.sequence={};
  this.master=ctx.createGain();this.limiter=ctx.createDynamicsCompressor();
  this.limiter.threshold.value=-6;this.limiter.knee.value=6;this.limiter.ratio.value=12;
  this.limiter.attack.value=.003;this.limiter.release.value=.18;
  this.master.connect(this.limiter);this.limiter.connect(ctx.destination);this.output=this.limiter;
  this.parts={};this.pans={};
  for(const part of ['bass','chords','drums','harmony']){
   const gain=ctx.createGain(),pan=ctx.createStereoPanner();pan.pan.value={bass:-.08,chords:.12,drums:-.12,harmony:.18}[part];
   gain.connect(pan);pan.connect(this.master);this.parts[part]=gain;this.pans[part]=pan;
  }
  this.keysFilter=ctx.createBiquadFilter();this.keysFilter.type='lowpass';this.keysFilter.Q.value=.5;this.keysFilter.connect(this.parts.chords);
  // A deterministic short stereo room; recorded attacks and decays remain intact.
  const impulse=ctx.createBuffer(2,Math.ceil(ctx.sampleRate*.65),ctx.sampleRate);let seed=1783;
  for(let channel=0;channel<2;channel++){const data=impulse.getChannelData(channel);for(let i=0;i<data.length;i++){seed=seed*16807%2147483647;data[i]=(seed/1073741824-1)*Math.exp(-i/(ctx.sampleRate*.12))*.16;}}
  this.verb=ctx.createConvolver();this.verb.buffer=impulse;this.wet=ctx.createGain();
  this.parts.chords.connect(this.verb);this.verb.connect(this.wet);this.wet.connect(this.master);this.update(settings);
 }
 update(settings){this.settings=settings;const now=this.ctx.currentTime;
  this.master.gain.setTargetAtTime(settings.master??.65,now,.025);
  for(const part of Object.keys(this.parts))this.parts[part].gain.setTargetAtTime(settings[part]??.5,now,.025);
  this.wet.gain.setTargetAtTime((settings.reverb??.15)*.35,now,.05);
  this.keysFilter.frequency.setTargetAtTime(settings.tone==='bright'?14000:6500,now,.05);
 }
 sample(part,midi,velocity,time,duration,level,output,release=.2){
  if(time<this.ctx.currentTime-.05||level<=0)return;
  const sequence=this.sequence[part]||0;this.sequence[part]=sequence+1;
  const region=chooseRegion(this.bank.instruments[part],midi,velocity,sequence),ctx=this.ctx;
  const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=this.bank.buffers.get(region.file);
  source.playbackRate.value=2**((midi-region.root)/12)*(part==='piano'||part==='bass'?(this.settings.tuning||440)/440:1);
  const start=Math.max(time,ctx.currentTime),natural=source.buffer.duration/source.playbackRate.value;
  const hold=Math.min(duration,natural),end=Math.min(hold+release,natural);
  gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(level,start+.003);
  gain.gain.setValueAtTime(level,start+Math.max(.004,hold));gain.gain.linearRampToValueAtTime(0,start+Math.max(.008,end));
  source.connect(gain);gain.connect(output);this.voices.add(source);
  source.onended=()=>{this.voices.delete(source);source.disconnect();gain.disconnect();};
  source.start(start);source.stop(start+Math.max(.01,end)+.01);
 }
 tone(midi,time,duration,part='chords',level=.1,dynamic){
  const bass=part==='bass',index=this.sequence[bass?'bass':'piano']||0;
  const variation=[0,4,-3,2,-1,3][index%6];
  const velocity=Math.max(1,Math.min(127,(dynamic??(bass?84:70))+variation+(this.settings.tone==='bright'&&!bass?15:0)));
  this.sample(bass?'bass':'piano',midi,velocity,time+(bass?0:(index%4)*.002),duration,bass?level*1.6:level*2.6,part==='chords'?this.keysFilter:this.parts[part],bass?.12:.32);
 }
 drum(kind,time,level=1){
  if(kind==='click'||kind==='keynote'){
   if(kind==='click'){this.sample('rim',0,85,time,.15,level*.55,this.master,.05);return;}
   // A pitched tuning reference is deliberately a pure sine, never a band instrument.
   const oscillator=this.ctx.createOscillator(),gain=this.ctx.createGain();oscillator.frequency.value=this.settings.keynoteFrequency||440;
   gain.gain.setValueAtTime(.09*level,time);gain.gain.exponentialRampToValueAtTime(.0001,time+.12);
   oscillator.connect(gain);gain.connect(this.master);this.voices.add(oscillator);oscillator.onended=()=>{this.voices.delete(oscillator);oscillator.disconnect();gain.disconnect();};oscillator.start(time);oscillator.stop(time+.13);return;
  }
  const hit=this.sequence[kind]||0,variation=[0,-6,4,-3][hit%4];
  this.sample(kind,0,Math.max(1,Math.min(127,level*110+variation)),time,kind==='ride'?2.4:kind==='kick'?.8:.65,level*({ride:.8,hat:.7,pedal:.8,kick:1.15,snare:.75}[kind]||.7),this.parts.drums,.12);
 }
 silence(){for(const voice of this.voices)try{voice.stop();}catch{}this.voices.clear();this.previous=[];this.lastSymbol=null;this.breakDrums=false;}
 disconnect(){this.silence();for(const node of [...Object.values(this.parts),...Object.values(this.pans),this.keysFilter,this.verb,this.wet,this.master,this.limiter])node.disconnect();}
}
