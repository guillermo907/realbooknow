import {bassSound} from './bass-sounds.js';
import {bandConfig,clamp,rngFor} from './band-config.js';
import {SAMPLE_MAP} from './sample-map.js';
import calibration from './sample-calibration.json' with {type:'json'};
// Recorded instruments, hosted with the app. See /audio/studio-v1/CREDITS.md.
const BASE=(process.env.NEXT_PUBLIC_BASE_PATH||'')+'/audio/studio-v1/';
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
  let cache;try{cache=await globalThis.caches?.open('jazzbook-studio-v2-band');}catch{}
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
export function chooseRegion(regions,midi,velocity,sequence=0,lastFile=null){
 if(!regions?.length)throw Error('Missing recorded instrument');const rank=regions.map(r=>({r,score:Math.abs(r.root-midi)*100+Math.abs(r.velocity-velocity)})).sort((a,b)=>a.score-b.score);const best=rank[0].r;
 let variants=rank.filter(x=>x.r.root===best.root&&x.r.velocity===best.velocity).map(x=>x.r),choice=variants[sequence%variants.length];
 if(choice.file===lastFile){choice=variants.find(r=>r.file!==lastFile)||rank.find(x=>x.r.file!==lastFile)?.r||choice;}
 return choice;
}
export const velocityGain=velocity=>(clamp(velocity,1,127)/100)**bandConfig().render.velocityExponent;
export class StudioTrio {
 constructor(ctx,settings,bank){this.ctx=ctx;this.bank=bank;this.settings=settings;this.voices=new Set();this.sustainTails=new WeakMap();this.sequence={};this.lastFiles={};this.groups=new Map();this.master=ctx.createGain();this.compressor=ctx.createDynamicsCompressor();this.limiter=ctx.createDynamicsCompressor();this.master.connect(this.compressor);this.compressor.connect(this.limiter);this.matchGain=ctx.createGain();this.limiter.connect(this.matchGain);this.matchGain.connect(ctx.destination);this.output=this.matchGain;this.parts={};this.pans={};this.filters={};
  for(const part of ['bass','chords','drums','harmony']){const gain=ctx.createGain(),filter=ctx.createBiquadFilter(),pan=ctx.createStereoPanner();filter.type='lowpass';pan.pan.value={bass:-.08,chords:.12,drums:-.12,harmony:.18}[part];filter.connect(gain);gain.connect(pan);pan.connect(this.master);this.parts[part]=gain;this.pans[part]=pan;this.filters[part]=filter;}
  this.verb=ctx.createConvolver();this.wet=ctx.createGain();for(const p of ['chords','drums'])this.parts[p].connect(this.verb);this.verb.connect(this.wet);this.wet.connect(this.master);this.update(settings);
 }
 setMatchGain(value,time=this.ctx.currentTime){this.matchGain.gain.setTargetAtTime(clamp(value,0,1),Math.max(time,this.ctx.currentTime),this.config.render.mixRampSeconds);}
 update(settings){this.settings=settings;this.config=bandConfig(settings.bandTuning);const c=this.config.render,t=this.ctx.currentTime;
  this.master.gain.setTargetAtTime((settings.master??.65)*c.masterHeadroom,t,c.mixRampSeconds);for(const part of Object.keys(this.parts))this.parts[part].gain.setTargetAtTime(settings.rhythmSectionOnly===true&&['chords','harmony'].includes(part)?0:settings[part]??(part==='harmony'?0:.5),t,c.mixRampSeconds);
  this.compressor.threshold.value=c.compressorThreshold;this.compressor.knee.value=c.compressorKnee;this.compressor.ratio.value=c.compressorRatio;this.compressor.attack.value=c.compressorAttack;this.compressor.release.value=c.compressorRelease;
  this.limiter.threshold.value=c.ceilingThreshold;this.limiter.knee.value=0;this.limiter.ratio.value=20;this.limiter.attack.value=.001;this.limiter.release.value=.08;
  this.wet.gain.setTargetAtTime((settings.reverb??c.reverb)*c.wetGain,t,c.mixRampSeconds);this.filters.chords.frequency.value=settings.tone==='bright'?c.keysBrightHz:c.keysWarmHz;this.filters.harmony.frequency.value=c.keysWarmHz;this.filters.bass.frequency.value=bassSound(settings.bassTone).cutoff;this.filters.drums.frequency.value=c.drumToneHz;
  if(this.roomKey!==[c.roomSeconds,c.roomDecay,c.roomAmplitude].join()){this.roomKey=[c.roomSeconds,c.roomDecay,c.roomAmplitude].join();const impulse=this.ctx.createBuffer(2,Math.ceil(this.ctx.sampleRate*c.roomSeconds),this.ctx.sampleRate);let seed=1783;for(let k=0;k<2;k++){const d=impulse.getChannelData(k);for(let i=0;i<d.length;i++){seed=seed*16807%2147483647;d[i]=(seed/1073741824-1)*Math.exp(-i/(this.ctx.sampleRate*c.roomDecay))*c.roomAmplitude;}}this.verb.buffer=impulse;}
 }
 sample(instrument,midi,velocity,time,duration,level,output,release){if(time<this.ctx.currentTime-.05||level<=0)return;const map=SAMPLE_MAP[instrument];if(!map)throw Error('Unknown instrument '+instrument);const part=this.bank.instruments[map.sample]?map.sample:map.fallback,c=this.config.render,sequence=this.sequence[part]||0;this.sequence[part]=sequence+1;const region=chooseRegion(this.bank.instruments[part],midi,velocity,sequence,this.lastFiles[part+':'+midi]);this.lastFiles[part+':'+midi]=region.file;
  const ctx=this.ctx,source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=this.bank.buffers.get(region.file);if(!source.buffer)throw Error('Undecoded sample '+region.file);source.playbackRate.value=2**((midi-region.root)/12)*(part==='piano'||part==='bass'?(this.settings.tuning||440)/440:1);
  const measured=calibration.instruments[part]?.[region.velocity];const normalization=measured?.gain??1;level*=Math.min(c.sampleGainCap,normalization)*(clamp(velocity,1,127)/100)**c.velocityExponent;
  const start=Math.max(time,ctx.currentTime),natural=source.buffer.duration/source.playbackRate.value,extend=part==='piano'&&duration+release>natural,hold=extend?duration:Math.min(duration,natural),end=Math.max(.008,extend?hold+release:Math.min(hold+release,natural));if(extend){const buffer=source.buffer;let tail=this.sustainTails.get(buffer);if(!tail){const begin=Math.min(buffer.duration*.5,c.sustainLoopStart),finish=Math.min(buffer.duration-.02,begin+c.sustainLoopWindow),fade=Math.min(c.sustainCrossfade,(finish-begin)/4),n=Math.floor(finish*buffer.sampleRate),size=Math.max(1,Math.floor(fade*buffer.sampleRate)),first=Math.floor(begin*buffer.sampleRate);if(n>first+size*2){const copy=ctx.createBuffer(buffer.numberOfChannels,n,buffer.sampleRate);for(let channel=0;channel<copy.numberOfChannels;channel++){const d=copy.getChannelData(channel),raw=buffer.getChannelData(channel);d.set(raw.subarray(0,n));for(let i=0;i<size;i++){const w=(i+1)/size;d[n-size+i]=raw[n-size+i]*(1-w)+raw[first+i]*w;}}tail={buffer:copy,start:(first+size)/buffer.sampleRate,end:n/buffer.sampleRate};this.sustainTails.set(buffer,tail);}}if(tail){source.buffer=tail.buffer;source.loop=true;source.loopStart=tail.start;source.loopEnd=tail.end;}}
  gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(level,start+.001);gain.gain.setValueAtTime(level,start+Math.max(.002,hold));gain.gain.linearRampToValueAtTime(0,start+end);
  const group=part==='bass'?'bass':part==='piano'?(output===this.filters.harmony?'harmony:':'piano:')+midi:map.choke; if(group){const previous=this.groups.get(group);if(previous){const fade=part==='bass'?Math.max(this.ctx.currentTime,start-c.bassRelease):start;previous.gain.gain.cancelScheduledValues(fade);previous.gain.gain.setTargetAtTime(0,fade,part==='bass'?c.bassRelease/3:part==='piano'?c.pianoRetriggerRelease:c.hatChokeSeconds);try{previous.source.stop(part==='bass'?start:start+(part==='piano'?c.pianoRetriggerRelease:c.hatChokeSeconds)*3);}catch{}}this.groups.set(group,{source,gain});}
  source.connect(gain);gain.connect(output);this.voices.add(source);source.onended=()=>{this.voices.delete(source);source.disconnect();gain.disconnect();};source.start(start);source.stop(start+end+.01);
 }
 tone(midi,time,duration,part='chords',level=1,velocity=70,release,articulation){if(this.settings.rhythmSectionOnly===true&&['chords','harmony'].includes(part))return;const bass=part==='bass',c=this.config.render,sound=bassSound(articulation?.bassSound??this.settings.bassTone);if(bass&&articulation?.ghost){this.bassDeadNote(time,level,velocity);return;}if(bass&&sound.kind==='synth'){this.synthBass(midi,time,duration,level,velocity,sound,articulation?.slap);return;}if(bass){duration*=sound.length??1;level*=sound.gain;}this.sample(bass?'bass':'piano',midi,velocity,time,duration,level*(bass?c.bassLevel:c.pianoLevel),this.filters[part],bass?sound.release:release??c.pianoRelease);}
 // A damped string pluck is broadband percussion, not a quieter pitched bass sample.
 bassDeadNote(time,level,velocity){const ctx=this.ctx;if(time<ctx.currentTime-.05||level<=0||this.settings.bass===0)return;const c=this.config.expression,start=Math.max(time,ctx.currentTime),end=start+c.ghostPluckSeconds,source=ctx.createBufferSource(),gain=ctx.createGain(),high=ctx.createBiquadFilter(),low=ctx.createBiquadFilter(),buffer=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*c.ghostPluckSeconds),ctx.sampleRate),data=buffer.getChannelData(0),sequence=this.sequence.deadBass||0,r=rngFor(1783,'dead-bass',sequence);this.sequence.deadBass=sequence+1;
 for(let i=0;i<data.length;i++)data[i]=r()*2-1;source.buffer=buffer;high.type='highpass';high.frequency.value=c.ghostPluckHighpassHz;low.type='lowpass';low.frequency.value=c.ghostPluckLowpassHz;
 const amplitude=level*c.ghostPluckGain*this.config.render.bassLevel*(clamp(velocity,1,127)/100)**this.config.render.velocityExponent;
 gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(amplitude,start+c.ghostPluckAttack);gain.gain.setTargetAtTime(0,start+c.ghostPluckAttack,c.ghostPluckDecay);gain.gain.setValueAtTime(0,end);
 const prior=this.groups.get('bass');if(prior){prior.gain.gain.cancelScheduledValues(start);prior.gain.gain.setTargetAtTime(0,start,c.ghostRelease/3);try{prior.source.stop(start+c.ghostRelease);}catch{}}this.groups.set('bass',{source,gain});
 source.connect(high);high.connect(low);low.connect(gain);gain.connect(this.parts.bass);this.voices.add(source);source.onended=()=>{this.voices.delete(source);source.disconnect();high.disconnect();low.disconnect();gain.disconnect();};source.start(start);source.stop(end);
 }
 synthBass(midi,time,duration,level,velocity,sound,slap=false){const ctx=this.ctx;if(time<ctx.currentTime-.05||level<=0)return;this.bassWaves??=new Map();let wave=this.bassWaves.get(sound);if(!wave){const real=new Float32Array(sound.harmonics.length+1),imag=new Float32Array(sound.harmonics.length+1);imag.set(sound.harmonics,1);wave=ctx.createPeriodicWave(real,imag);this.bassWaves.set(sound,wave);}const source=ctx.createOscillator(),gain=ctx.createGain(),start=Math.max(time,ctx.currentTime),end=start+duration+sound.release,amplitude=level*sound.gain*this.config.render.bassLevel*(clamp(velocity,1,127)/100)**this.config.render.velocityExponent;
 source.setPeriodicWave(wave);source.frequency.value=440*2**((midi-69)/12)*(this.settings.tuning||440)/440;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(amplitude,start+Math.min(sound.attack,duration/2));gain.gain.exponentialRampToValueAtTime(Math.max(.00001,amplitude*Math.exp(-duration*sound.decay)),start+duration);gain.gain.linearRampToValueAtTime(0,end);
 const prior=this.groups.get('bass');if(prior){prior.gain.gain.cancelScheduledValues(start);prior.gain.gain.setTargetAtTime(0,start,.008);try{prior.source.stop(start+.025);}catch{}}this.groups.set('bass',{source,gain});const tone=ctx.createBiquadFilter();tone.type='lowpass';tone.frequency.value=sound.cutoff;source.connect(gain);if(sound===bassSound('precision')){gain.connect(tone);tone.connect(this.parts.bass);}else gain.connect(this.filters.bass);if(slap){const attack=ctx.createOscillator(),g=ctx.createGain(),cfg=this.config.balladBand;attack.type='triangle';attack.frequency.setValueAtTime(source.frequency.value*6,start);attack.frequency.exponentialRampToValueAtTime(source.frequency.value*2,start+cfg.slapTransientSeconds);g.gain.setValueAtTime(amplitude*cfg.slapTransientLevel,start);g.gain.exponentialRampToValueAtTime(.00001,start+cfg.slapTransientSeconds);attack.connect(g);g.connect(tone);this.voices.add(attack);attack.onended=()=>{this.voices.delete(attack);attack.disconnect();g.disconnect();};attack.start(start);attack.stop(start+cfg.slapTransientSeconds);}this.voices.add(source);source.onended=()=>{this.voices.delete(source);source.disconnect();gain.disconnect();tone.disconnect();};source.start(start);source.stop(end+.01);}
 drum(kind,time,level=1,velocity=75){if(kind==='click'||kind==='keynote'){if(kind==='click'){this.sample('rim',0,velocity,time,.08,level,this.master,.01);return;}const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.frequency.value=this.settings.keynoteFrequency||440;g.gain.setValueAtTime(.08*level,time);g.gain.exponentialRampToValueAtTime(.0001,time+.1);o.connect(g);g.connect(this.master);this.voices.add(o);o.onended=()=>{this.voices.delete(o);o.disconnect();g.disconnect();};o.start(time);o.stop(time+.12);return;}
  const c=this.config.render;this.sample(kind,0,velocity,time,kind.startsWith('ride')||kind==='openHat'?c.cymbalSeconds:c.drumSeconds,level*c.drumLevel,this.filters.drums,.02);
 }
 silence(){for(const v of this.voices)try{v.stop();}catch{}this.voices.clear();this.groups.clear();this.sequence={};this.lastFiles={};}
 disconnect(){this.silence();for(const n of [...Object.values(this.parts),...Object.values(this.pans),...Object.values(this.filters),this.verb,this.wet,this.master,this.compressor,this.limiter,this.matchGain])n.disconnect();}
}
