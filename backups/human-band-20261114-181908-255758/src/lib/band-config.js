import defaults from './band-config.json' with {type:'json'};
export const BAND_DEFAULTS=Object.freeze(defaults);
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function bandConfig(patch={}){
 if(!patch||typeof patch!=='object'||Array.isArray(patch))throw Error('Band tuning must be an object');
 function merge(base,input){if(Array.isArray(base)){if(!Array.isArray(input)||input.length!==base.length)throw Error('Invalid tuning array');return base.map((x,i)=>typeof x==='object'?merge(x,input[i]):number(input[i],x));}const out={};for(const k of Object.keys(input||{}))if(!Object.hasOwn(base,k))throw Error('Unknown band tuning: '+k);for(const [k,v] of Object.entries(base))out[k]=input?.[k]===undefined?structuredClone(v):v&&typeof v==='object'?merge(v,input[k]):number(input[k],v);return out;}
 function number(x,base){if(!Number.isFinite(x)||Math.abs(x)>100000)throw Error('Invalid tuning number');return x;}
 const c=merge(defaults,patch);for(const [tempo,ratio] of c.swingCurve)if(tempo<=0||ratio<1||ratio>3)throw Error('Invalid swing curve');
 for(const role of ['bass','comp'])if(c[role].range[0]<0||c[role].range[1]>127||c[role].range[0]>=c[role].range[1])throw Error('Invalid range');
 for(const [x,a,b] of [[c.human.looseness,0,1],[c.variation.intensity,0,1],[c.bass.approachChance,0,1],[c.drums.fillFrequency,0,1],[c.comp.density,0,3],[c.human.lengthSpread,0,.25],[c.render.reverb,0,1],[c.render.compressorRatio,1,12],[c.human.bassMs,0,20],[c.human.compMs,0,20],[c.human.drumsMs,0,20]])if(x<a||x>b)throw Error('Tuning outside supported range');
 if(c.swingCurve.some((p,i)=>i&&p[0]<=c.swingCurve[i-1][0]))throw Error('Swing tempos must increase');
 for(const [n,a,b] of [[c.bass.searchPaths,1,12],[c.bass.lookaheadBars,1,2],[c.comp.maxCandidates,1,24],[c.drums.supportStates,1,8],[c.variation.memoryBars,1,16],[c.variation.phraseBars,1,32]])if(!Number.isInteger(n)||n<a||n>b)throw Error('Invalid planning bound');
 if(c.ppq!==960||c.drums.fillMinBeats<=0||c.drums.fillMinBeats>c.drums.fillMaxBeats||c.drums.fillMaxBeats>4||c.human.retriggerGapTicks<1||c.human.retriggerGapTicks>100)throw Error('Invalid timing bound');
 for(const [n,a,b] of [[c.render.roomSeconds,.05,2],[c.render.roomDecay,.01,1],[c.render.mixRampSeconds,.001,1],[c.render.compressorAttack,.001,.2],[c.render.compressorRelease,.01,2],[c.render.masterHeadroom,0,1],[c.scheduler.intervalMs,5,100],[c.scheduler.lookaheadSeconds,.03,.5],[c.scheduler.lateSeconds,.1,1]])if(n<a||n>b)throw Error('Invalid audio bound');
 for(const [k,v] of Object.entries(c.drums))if(/Main|Skip|foot|kick|backbeat|ghost|rim|fill$/.test(k)&&(v<1||v>127))throw Error('Invalid drum velocity');
 if(c.drums.ghost>=c.drums.backbeat)throw Error('Ghost notes must stay below backbeats');
 for(const [n,a,b] of [[c.human.maxRoleOffsetMs,0,20],[c.human.sharedMs,0,10],[c.human.velocitySpread,0,24],[c.human.gmdTimingMix,0,1],[c.human.gmdVelocityMix,0,1],[c.render.abMatchSeconds,1,16],[c.render.abRecheckMs,0,2000],[c.render.compressorThreshold,-60,0],[c.render.ceilingThreshold,-12,0],[c.render.sampleGainCap,1,512],[c.scheduler.startSeconds,.03,1],[c.scheduler.resumeSeconds,.03,1]])if(n<a||n>b)throw Error('Tuning exceeds safe performance bounds');
 if(![22050,44100,48000].includes(c.render.abSampleRate))throw Error('Unsupported matching sample rate');
 return c;
}
export function rngFor(seed,...keys){let h=2166136261;for(const s of [seed,...keys].join('|'))h=Math.imul(h^s.charCodeAt(0),16777619);return()=>{h+=0x6D2B79F5;let t=Math.imul(h^h>>>15,1|h);t^=t+Math.imul(t^t>>>7,61|t);return ((t^t>>>14)>>>0)/4294967296;};}
export function swingRatio(tempo,c=BAND_DEFAULTS,override=0){if(override>=1)return clamp(override,1,3);const points=c.swingCurve;if(tempo<=points[0][0])return points[0][1];for(let i=1;i<points.length;i++)if(tempo<=points[i][0]){const [a,x]=points[i-1],[b,y]=points[i];return x+(y-x)*(tempo-a)/(b-a);}return points.at(-1)[1];}
