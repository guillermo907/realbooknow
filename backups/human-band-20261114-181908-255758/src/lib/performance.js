import {buildPlan} from './plan.js';
import {parseChord,pitch,intervals,mod,transposeChord} from './chords.js';
import {styles,styleFamily} from './styles/index.js';
import {bandConfig,BAND_DEFAULTS,rngFor,swingRatio,clamp} from './band-config.js';
import {humanize} from './band-humanize.js';
import {pattern as originalPattern} from './original-band.js';
import {rhythmStep,stepDuration} from './rhythm.js';
const freeze=o=>{if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.freeze(o);for(const v of Object.values(o))freeze(v);}return o;};
export const instrumentNotes={ride:51,rideBell:53,hat:42,footHat:44,openHat:46,kick:36,snare:38,rim:37,tom:45};
function weighted(pool,rng,history,c){const weights=pool.map(m=>m.weight*(history.includes(m.id)?c.variation.repetitionPenalty:1)),sum=weights.reduce((a,b)=>a+b,0);let x=rng()*sum;return pool.find((_,i)=>(x-=weights[i])<=0)||pool.at(-1);}
function nearest(pc,prev,range){let best;for(let n=range[0];n<=range[1];n++)if(mod(n)===mod(pc)&&(!Number.isFinite(best)||Math.abs(n-prev)<Math.abs(best-prev)))best=n;return best??clamp(prev,...range);}
function tones(ch){return ch?.kind==='chord'?intervals(ch.quality).map(n=>mod(n+ch.pc)):[];}
function scale(ch){const q=ch?.quality||'',r=ch?.pc??0;let degrees=q.includes('alt')?[0,1,3,4,6,8,10]:q.startsWith('h')||q.includes('b5')?[0,1,3,5,6,8,10]:q.startsWith('o')?[0,2,3,5,6,8,9,11]:q.startsWith('-')?[0,2,3,5,7,9,10]:q.includes('^')?[0,2,4,5,7,9,11]:[0,2,4,5,7,9,10];return degrees.map(n=>mod(r+n));}
function voiceMotion(a,b){const [small,large]=a.length<=b.length?[a,b]:[b,a];let row=Array(large.length+1).fill(0);for(let i=1;i<=small.length;i++){const next=Array(large.length+1).fill(Infinity);for(let j=1;j<=large.length;j++)next[j]=Math.min(next[j-1],row[j-1]+Math.abs(small[i-1]-large[j-1]));row=next;}return row[large.length]/Math.max(1,small.length);}
function root(ch){return pitch(ch?.bass||ch?.root||'C')??0;}
export function voicingCandidates(ch,previous,energy,c){
 let pcs=tones(ch);if(!pcs.length)return [];const seventh=pcs.some(p=>[9,10,11].includes(mod(p-ch.pc)));const guides=pcs.filter(p=>[3,4,10,11].includes(mod(p-ch.pc)));if(seventh&&pcs.length>=4)pcs=pcs.filter(p=>p!==ch.pc);
 const size=energy<c.comp.shellEnergy?2:Math.min(energy>c.comp.fiveVoiceEnergy?5:4,pcs.length);let candidates=[];
 for(let omit=0;omit<pcs.length;omit++){let selected=[...guides,...pcs.slice(omit),...pcs.slice(0,omit)];selected=[...new Set(selected)].slice(0,size);for(let rotation=0;rotation<selected.length;rotation++)for(let base=48;base<=60;base+=12){let v=selected.map((_,i)=>base+selected[(rotation+i)%selected.length]);for(let i=1;i<v.length;i++)while(v[i]<=v[i-1])v[i]+=12;if(v[0]>=c.comp.range[0]&&v.at(-1)<=c.comp.range[1]&&v.at(-1)-v[0]<=c.comp.maxSpan)candidates.push(v);}}
 candidates=[...new Map(candidates.map(v=>[v.join(','),v])).values()].slice(0,c.comp.maxCandidates);
 const movement=v=>previous.length?voiceMotion(v,previous):Math.abs(v.reduce((a,b)=>a+b,0)/v.length-c.comp.center)*c.comp.registerWeight;
 const score=v=>movement(v)*c.comp.movementWeight-v.filter(n=>previous.includes(n)).length*c.comp.commonToneReward+Math.abs((v.at(-1)||0)-(previous.at(-1)||v.at(-1)))*c.comp.topWeight+(v.join()===previous.join()?c.comp.repeatPenalty:0)+guides.filter(pc=>!v.some(n=>mod(n)===pc)).length*c.comp.guideWeight;
 return candidates.sort((a,b)=>score(a)-score(b));
}
function bassLine(intents,previous,c,rng){
 let paths=[{notes:[],score:0,last:previous}];const direction=rng()<.5?-1:1;
 for(const i of intents){let choices=[];if(i.fixed!==undefined)choices=[i.fixed];else for(let n=c.bass.range[0];n<=c.bass.range[1];n++)if(i.pcs.includes(mod(n)))choices.push(n);
 const next=[];for(const path of paths)for(const note of choices){let delta=Math.abs(note-path.last),score=path.score+delta+(delta>7?(delta-7)*c.bass.leapPenalty:0)+(note<c.bass.preferred[0]||note>c.bass.preferred[1]?c.bass.rangePenalty:0)+(note===path.last?c.bass.repeatPenalty:0)+Math.abs(note-i.destination)*c.bass.targetWeight+(Number.isFinite(i.secondaryDestination)?Math.abs(note-i.secondaryDestination)*c.bass.lookaheadWeight:0)+(Math.sign(note-path.last)!==direction?c.bass.contourWeight:0);next.push({notes:[...path.notes,note],score,last:note});}next.sort((a,b)=>a.score-b.score);paths=next.slice(0,c.bass.searchPaths);}
 return paths[0]?.notes||[];
}
function composePerformance(chart,style,options={},seed=options.takeSeed){
 const song=typeof chart==='string'?{chart,style,tempo:options.tempo||120,key:'C'}:chart,c=bandConfig(options.bandTuning),take=seed??c.seed,visits=buildPlan(song,{choruses:options.choruses||song.choruses||1,range:options.range||null,start:options.start||0});
 if(!visits.length)throw Error('There are no playable bars.');
 let tick=0,seconds=0,lastSymbol=visits[0].priorSymbol||null,section='',sectionInstance=-1,sectionBar=0,drumsBreak=false;
 const bars=visits.map((v,i)=>{const tempo=clamp(song.tempo+v.chorus*(options.practiceTempo||0),c.tempoMin,c.tempoMax),transpose=(song.transpose||0)+v.chorus*(options.practiceTranspose||0);const isSection=i===0||v.chorus!==visits[i-1].chorus||!!v.measure.section||v.index!==visits[i-1].index+1;
 if(isSection){section=v.measure.section||section||'A';sectionInstance++;sectionBar=0;}
 const spans=v.events.map(e=>{if(e.type==='nc')lastSymbol=null;else if(e.symbol)lastSymbol=e.symbol;const symbol=lastSymbol?transposeChord(lastSymbol,transpose,'C','sharps'):null;return {...e,symbol,chord:symbol?parseChord(symbol):null};});
 if(v.measure.left==='[')drumsBreak=false;const startsBreak=v.measure.comments.some(x=>/\bBreak\b/.test(x.text));if(startsBreak)drumsBreak=true;
 const family=styleFamily(style||song.style,v.meter),bar={id:`${i}:${v.index}:${v.chorus}`,writtenBar:v.index,section,sectionInstance,sectionBar:sectionBar++,chorus:v.chorus,tick,seconds,tempo,transpose,beats:v.beats,meter:v.meter,spans,isSection,visit:v,family,drumsBreak,startsBreak};tick+=Math.round(v.beats*c.ppq);seconds+=v.beats*60/tempo;return bar;});
 for(let i=0;i<bars.length;i++){const b=bars[i],next=bars[i+1];b.phraseEnd=!next||next.isSection||(b.sectionBar+1)%c.variation.phraseBars===0;b.sectionEnd=!next||next.isSection;b.final=!next;b.phraseId=`${b.sectionInstance}:${Math.floor(b.sectionBar/c.variation.phraseBars)}`;const chorusFraction=b.chorus/Math.max(1,(options.choruses||1)-1);b.energy=clamp(c.variation.openingEnergy+(c.variation.middleEnergy-c.variation.openingEnergy)*Math.sin(chorusFraction*Math.PI/2)+(b.sectionInstance%2)*c.variation.sectionLift+(b.sectionBar%c.variation.phraseBars)*c.variation.phraseLift/c.variation.phraseBars+((options.intensity??c.variation.intensity)-.5),.1,1);if(b.final)b.energy=Math.max(b.energy,c.variation.endingEnergy);b.supportState=(b.chorus+b.section.charCodeAt(0))%c.drums.supportStates;}
 for(const b of bars){const ch=b.spans[0]?.chord,r=rngFor(take,b.phraseId,'bass','destination',b.id),members=tones(ch);b.anchorPC=!b.isSection&&!ch?.bass&&members.length&&r()<c.bass.nonRootChance?members[Math.floor(r()*members.length)]:root(ch);}
 let anchorPrevious=c.bass.initial;for(const b of bars){b.anchorNote=nearest(b.anchorPC,anchorPrevious,c.bass.range);anchorPrevious=b.anchorNote;}
 const events=[],history={bass:[],comp:[],drums:[]},motifCarry={};let previousBass=c.bass.initial,previousVoicing=[],bassMode='twoFeel',modeBar=-Infinity;
 function emit(b,role,instrument,at,length,midi,velocity,intent,gesture,destination=null){if(at<0||at>=b.beats||length<=0)return;const local=Math.round(at*c.ppq),duration=Math.max(1,Math.round(Math.min(length,b.beats-at)*c.ppq)),r=rngFor(take,b.phraseId,role,'human',b.id,local,role==='comp'?'cluster':midi,intent),shared=(rngFor(take,b.id,'pulse',Math.floor(at))()*2-1)*c.human.sharedMs;let authored=b.tick+local,performed=authored;
 const ratio=(b.family==='swing'||b.family==='shuffle'||b.family==='waltz')?swingRatio(b.tempo,c,options.swingOverride||0):1;
 if(Math.abs(at%1-.5)<.001)performed=b.tick+Math.round((Math.floor(at)+ratio/(1+ratio))*c.ppq);
 let e={role,instrument,midi,authoredTick:authored,performedTick:performed,duration,velocity,barId:b.id,intent,gesture,destination,section:b.section,sectionInstance:b.sectionInstance,chorus:b.chorus,position:at,seed:take};
 const swung=e.performedTick-e.authoredTick;e=humanize(e,instrument,b.family,r,{config:c,tempo:b.tempo,looseness:options.looseness??c.human.looseness,sharedMs:shared});e.performedTick+=swung;if(role==='bass'||role==='comp'||role==='harmony'){const nextSpan=b.spans.find(x=>x.beat>at+.001)?.beat??b.beats;const end=b.tick+Math.round(nextSpan*c.ppq);e.duration=Math.max(1,Math.min(e.duration,end-e.performedTick-c.human.retriggerGapTicks));}events.push(e);}
 if(options.bandVersion==='original'){
  const state={settings:options,previous:[],tone(midi,time,duration,part,level,velocity){const b=state.bar;events.push({role:part==='bass'?'bass':part==='harmony'?'harmony':'comp',instrument:part==='bass'?'bass':'piano',midi,authoredTick:b.tick+Math.round(state.beat*c.ppq),performedTick:b.tick+Math.round((state.beat+(time-state.time)*b.tempo/60)*c.ppq),duration:Math.max(1,Math.round(duration*b.tempo/60*c.ppq)),velocity:velocity||70,barId:b.id,intent:'original',gesture:'original',destination:null,section:b.section,sectionInstance:b.sectionInstance,chorus:b.chorus,seed:take});},drum(kind,time,level,velocity){const b=state.bar;events.push({role:kind==='click'?'click':'drums',instrument:kind==='pedal'?'footHat':kind,midi:instrumentNotes[kind==='pedal'?'footHat':kind]||37,authoredTick:b.tick+Math.round(state.beat*c.ppq),performedTick:b.tick+Math.round((state.beat+(time-state.time)*b.tempo/60)*c.ppq),duration:Math.round(.08*c.ppq),velocity:velocity||70,barId:b.id,intent:'original',gesture:'original',destination:null,section:b.section,sectionInstance:b.sectionInstance,chorus:b.chorus,seed:take});}};
  for(let i=0;i<bars.length;i++){const b=bars[i];state.bar=b;let time=0;for(let step=0;step<b.beats*2;step++){state.beat=step/2;state.time=time;originalPattern(state,b.visit,step,time,b.tempo,b.transpose,style||song.style,bars[i+1]?.visit);time+=stepDuration(b.tempo,options,rhythmStep(style||song.style,b.visit,step),step,b.meter);}}
 }else for(let bi=0;bi<bars.length;bi++){
  const b=bars[bi],next=bars[bi+1],family=(/Bossa \/ Swing|Latin \/ Swing/.test(style||song.style)&&b.chorus%2)?'swing':b.family;b.family=family;const data=styles[family],rng=role=>rngFor(take,b.phraseId,role,'selection',b.id);
  const choose=role=>{let pending=motifCarry[role];if(pending&&pending.sectionInstance===b.sectionInstance&&pending.remaining>0){pending.remaining--;return {motif:pending.motif,events:pending.motif.events.filter(e=>e.at>=pending.offset&&e.at<pending.offset+b.beats*c.ppq).map(e=>({...e,at:e.at-pending.offset}))};}
   const pool=data.motifs.filter(m=>m.role===role&&b.energy>=m.energy[0]&&b.energy<=m.energy[1]&&(m.cycleIndex===undefined||m.cycleIndex===b.sectionBar%data.cycleBars));const eligible=pool.length?pool:data.motifs.filter(m=>m.role===role),weightedPool=role==='comp'?eligible.map(m=>({...m,weight:m.weight*Math.exp((c.comp.density-1)*m.events.length/m.bars)})):eligible;const m=weighted(weightedPool,rng(role),history[role],c);history[role].push(m.id);history[role]=history[role].slice(-c.variation.memoryBars);motifCarry[role]=m.bars>1?{motif:m,remaining:m.bars-1,offset:b.beats*c.ppq,sectionInstance:b.sectionInstance}:null;return {motif:m,events:m.events.filter(e=>e.at<b.beats*c.ppq)};};
  const current=beat=>{let x=b.spans[0];for(const span of b.spans)if(span.beat<=beat+.001)x=span;return x;};
  const destination=(beat,ch)=>{const following=b.spans.find(s=>s.beat>beat+.001);const future=following?.chord||next?.spans[0]?.chord||ch;return following?nearest(root(future),previousBass,c.bass.range):next?.anchorNote??nearest(root(future),previousBass,c.bass.range);};
  // Bass destination planning is independent of drums/comp RNG streams.
  const br=rng('bass'),bassGesture=choose('bass'),chord0=current(0)?.chord;
  if(b.isSection||bi-modeBar>=c.bass.modeHoldBars){const desired=options.bassFeel==='walk'?'walk':options.bassFeel==='twoFeel'||(style||song.style)==='Two Feel'?'twoFeel':b.tempo<c.bass.twoFeelTempo&&b.energy<c.bass.twoFeelEnergy?'twoFeel':'walk';if(desired!==bassMode||b.isSection){bassMode=desired;modeBar=bi;}}
  b.bassMode=['swing','ballad'].includes(family)?(family==='ballad'&&options.bassFeel!=='walk'?'twoFeel':bassMode):'groove';let positions=['swing','ballad'].includes(family)?(b.bassMode==='walk'?Array.from({length:Math.ceil(b.beats)},(_,i)=>i):[0,b.beats/2]):family==='ballad'?[0,b.beats/2]:bassGesture.events.map(e=>e.at/c.ppq).filter(p=>p<b.beats);
  if(['swing','shuffle'].includes(family)&&b.phraseEnd&&br()<c.bass.pickupChance)positions=[...positions,b.beats-.5].sort((a,b)=>a-b);
  const intents=[];for(const at of positions){const span=current(at),ch=span?.chord;if(!ch||ch.kind==='nc'||ch.kind==='unknown')continue;let pcs=tones(ch);if(!pcs.length)pcs=[root(ch)];let intent='member',fixed;const target=destination(at,ch),change=b.spans.find(s=>s.beat>at+.001)?.beat??b.beats;
   if(at===0){intent='anchor';fixed=b.anchorNote;}
   else if(at>=change-1&&target%12!==root(ch)&&br()<(['swing','waltz','shuffle'].includes(family)?c.bass.approachChance:c.bass.grooveApproachChance)){intent='connect';const chromatic=br()<c.bass.chromaticShare,side=target>=previousBass?-1:1;let n=target+side;if(!chromatic){const compatible=scale(ch).filter(pc=>Math.min(mod(pc-target),mod(target-pc))<=2);n=nearest(compatible[0]??root(ch),target+side*2,c.bass.range);}fixed=clamp(n,...c.bass.range);}
   else if(br()<c.bass.restChance&&at!==0&&b.energy<.5)continue;
   else if(['bossa','latin','funk','rock','afro'].includes(family)){const pc=root(ch)+(family==='bossa'?(at>=2?7:0):br()<c.bass.grooveFifthChance?7:0);pcs=[mod(pc)];intent='retain';}
   else if(br()<c.bass.scaleChance){pcs=[...new Set([...pcs,...scale(ch)])];intent='step';}
   intents.push({at,ch,pcs,fixed,intent,destination:target});
  }
  // Two-bar destination lookahead supplies a secondary contour target without copying phrases.
  const far=bars[bi+c.bass.lookaheadBars]?.spans[0]?.chord; if(far&&intents.length)intents.at(-1).destination=next?.anchorNote??nearest(root(far),previousBass,c.bass.range);
  if(far){const farTarget=bars[bi+c.bass.lookaheadBars].anchorNote;for(const intent of intents)intent.secondaryDestination=farTarget;}
  const line=bassLine(intents,previousBass,c,br);for(let j=0;j<intents.length;j++){const x=intents[j],until=(intents[j+1]?.at??b.beats)-x.at,len=Math.min(until-.02,b.bassMode==='twoFeel'?c.bass.twoLength:b.bassMode==='walk'?c.bass.walkLength:c.bass.grooveLength);emit(b,'bass','bass',x.at,len,line[j],c.bass.velocity+(x.at===0?c.bass.accent:0)+b.energy*c.bass.accent,x.intent,bassGesture.motif.id,x.destination);previousBass=line[j];}
  // Comp gestures carry across two-bar phrases, with harmonic releases at span boundaries.
  const comp=choose('comp'),cr=rng('comp'),activity=new Set();let compEvents=comp.events.filter(e=>e.at/c.ppq<b.beats);
  if(family==='ballad'&&cr()>c.comp.balladDensity*c.comp.density)compEvents=[];
  for(const x of compEvents){if(x.intent==='silence'||cr()>(x.chance??1)*Math.min(1,c.comp.density))continue;const at=x.at/c.ppq,span=current(at),anticipation=x.intent==='voiceNext',future=b.spans.find(s=>s.beat>at+.001)||next?.spans[0],ch=anticipation?future?.chord:span?.chord;if(anticipation&&(!future||b.final||b.drumsBreak||at<b.beats-.5))continue;if(!ch||ch.kind!=='chord')continue;const voice=voicingCandidates(ch,previousVoicing,b.energy,c)[0];if(!voice)continue;const end=b.spans.find(s=>s.beat>at+.001)?.beat??b.beats;const len=Math.min(x.length/c.ppq,end-at-.02);activity.add(Math.floor(at*2));for(let vi=0;vi<voice.length;vi++)emit(b,'comp','piano',at,len,voice[vi],c.comp.velocity+b.energy*c.comp.accent+(vi===voice.length-1?c.comp.accent:-c.comp.innerAttenuation),anticipation?'voiceNext':'voiceCurrent',comp.motif.id,anticipation?future.symbol:span.symbol);for(const note of [...new Set(voice.slice(-2).map(n=>Math.min(c.comp.range[1],n+12)))])emit(b,'harmony','piano',at,len,note,c.comp.velocity-c.comp.innerAttenuation,'color',comp.motif.id,anticipation?future.symbol:span.symbol);previousVoicing=voice;}
  // Timekeeper anchors are independent of motif novelty and optional support.
  if(b.drumsBreak){if(b.startsBreak)emit(b,'drums','kick',0,.1,36,c.drums.kick,'break','break');continue;}
  const dr=rng('drums'),dg=choose('drums'),keeper=data.parts.drums.timekeeper;let pulse=dg.events.map(e=>e.at/c.ppq).filter(p=>p<b.beats);
  if(['bossa','funk','rock'].includes(family))pulse=Array.from({length:Math.ceil(b.beats*2)},(_,i)=>i/2).filter(p=>p<b.beats);
  
  for(const at of pulse){const articulation=keeper==='ride'&&b.energy>c.drums.bellEnergyThreshold&&b.supportState===c.drums.openHatState?'rideBell':keeper==='hat'&&family==='funk'&&at===b.beats-.5&&b.supportState===c.drums.openHatState?'openHat':keeper;emit(b,'drums',articulation,at,.1,instrumentNotes[articulation],keeper==='ride'?((family==='afro'?Math.abs(at%(data.pulseGroups[0]*4/data.meter[1]))<.001:Number.isInteger(at))?c.drums.rideMain:c.drums.rideSkip):(Number.isInteger(at)?c.drums.hatMain:c.drums.hatSkip),'time',dg.motif.id);}
  const support=(at,instrument,velocity,intent='support')=>emit(b,'drums',instrument,at,.1,instrumentNotes[instrument],velocity*(intent==='fill'?c.drums.fillEnergyBase+b.energy*c.drums.fillEnergyScale:1)+b.supportState+(b.energy-.5)*c.drums.energyVelocity,intent,dg.motif.id);
  if(['swing','shuffle','ballad'].includes(family)){for(const at of [1,3].filter(p=>p<b.beats))support(at,'footHat',c.drums.foot);support(0,'kick',c.drums.kick);if(b.energy>.5&&b.beats>2)support(2,'kick',c.drums.kick-c.drums.ghost/4);}
  else if(family==='waltz'){support(0,'kick',c.drums.kick);support(2,'footHat',c.drums.foot);}
  else if(family==='afro'){for(const at of [0,3].filter(p=>p<b.beats))support(at,'kick',c.drums.kick);for(const at of [1.5,4.5].filter(p=>p<b.beats))support(at,'rim',c.drums.rim);}
  else if(family==='bossa'||family==='latin'){for(const at of [0,1.5,2,3.5].filter(p=>p<b.beats))support(at,'kick',c.drums.kick);for(const at of (b.sectionBar%2?[.5,2]:[1,2.5]).filter(p=>p<b.beats))support(at,'rim',c.drums.rim);}
  else{for(const at of [0,2].filter(p=>p<b.beats))support(at,'kick',c.drums.kick+c.drums.ghost/2);for(const at of [1,3].filter(p=>p<b.beats))support(at,'snare',c.drums.backbeat);}
  for(let at=.5;at<b.beats;at+=.5)if(dr()<c.drums.supportChance*(1+b.supportState)*(activity.has(Math.floor(at*2))?c.drums.busyCompReduction:1))support(at,['bossa','latin'].includes(family)?'rim':'snare',c.drums.ghost,'ghost');
  if(b.phraseEnd&&dr()<c.drums.fillFrequency){const length=clamp(b.sectionEnd?c.drums.fillMaxBeats:c.drums.fillMinBeats,c.drums.fillMinBeats,Math.min(c.drums.fillMaxBeats,b.beats)),start=b.beats-length;for(let ei=events.length-1;ei>=0;ei--){const e=events[ei];if(e.barId===b.id&&e.role==='drums'&&e.position>=start&&e.intent!=='time')events.splice(ei,1);}for(let at=start;at<b.beats;at+=.5)support(at,dr()<c.drums.fillTomChance?'tom':'snare',c.drums.fill+(at-start)*c.drums.supportStates,'fill');b.fill={start,length};}
 }
 // Count-in and metronome events bypass every humanization transform.
 for(const b of bars)if(options.metronome)for(let beat=0;beat<b.beats;beat++)events.push({role:'click',instrument:'click',midi:37,authoredTick:b.tick+Math.round(beat*c.ppq),performedTick:b.tick+Math.round(beat*c.ppq),duration:c.ppq/16,velocity:80,barId:b.id,intent:'metronome',gesture:'clock',seed:take});
 const countBars=options.countIn==='auto'?(song.tempo>140?2:1):Number(options.countIn)||0,countTicks=Math.round(countBars*bars[0].beats*c.ppq);for(const e of events){e.authoredTick+=countTicks;e.performedTick+=countTicks;}
 const countSeconds=countTicks/c.ppq*60/bars[0].tempo;for(const b of bars){b.tick+=countTicks;b.seconds+=countSeconds;}
 for(let i=0;i<countTicks;i+=c.ppq)events.push({role:'click',instrument:options.click==='Keynote'?'keynote':'click',midi:37,level:options.countVolume??.6,authoredTick:i,performedTick:i,duration:c.ppq/16,velocity:80,barId:'count-in',intent:'countIn',gesture:'clock',seed:take});
 // Preserve authored attack ordering and eliminate same-pitch retriggers and bass overlaps.
 const voices=new Map();events.sort((a,b)=>a.authoredTick-b.authoredTick||a.midi-b.midi);
 for(const e of events){e.performedTick=clamp(Math.round(e.performedTick),0,Math.max(0,tick+countTicks-1));e.duration=Math.max(1,Math.round(e.duration));const key=e.role==='bass'?'bass':e.instrument+':'+e.midi,prev=voices.get(key);if(prev){if(e.performedTick<=prev.performedTick)e.performedTick=prev.performedTick+c.human.retriggerGapTicks;prev.duration=Math.min(prev.duration,Math.max(1,e.performedTick-prev.performedTick-c.human.retriggerGapTicks));}voices.set(key,e);}
 const publicBars=bars.map(({visit,...b})=>b);const tickToSeconds=t=>{if(t<countTicks)return t/c.ppq*60/publicBars[0].tempo;let b=publicBars[0];for(const x of publicBars)if(x.tick<=t)b=x;else break;return b.seconds+(t-b.tick)/c.ppq*60/b.tempo;};
 for(const e of events){e.time=tickToSeconds(e.performedTick);e.seconds=tickToSeconds(e.performedTick+e.duration)-e.time;}
 events.sort((a,b)=>a.performedTick-b.performedTick||a.midi-b.midi);
 return freeze({version:1,ppq:c.ppq,seed:take,style:style||song.style,options:{bassFeel:options.bassFeel||'auto',bandVersion:options.bandVersion||'new'},bars:publicBars,events,duration:seconds+countSeconds,totalTicks:tick+countTicks,countTicks});
}
const performanceCache=new Map();
export function planPerformance(chart,style,options={},seed=options.takeSeed){
 const song=typeof chart==='string'?{chart,style,tempo:options.tempo||120}:chart;
 const key=JSON.stringify([song.chart,style||song.style,song.tempo,song.transpose||0,song.meter||null,options.choruses||song.choruses||1,options.range||null,options.start||0,options.practiceTempo||0,options.practiceTranspose||0,options.takeSeed??seed??BAND_DEFAULTS.seed,seed,options.bandTuning||{},options.looseness,options.intensity,options.bassFeel||'auto',options.swingOverride||0,options.bandVersion||'new',options.metronome||false,options.countIn||0,options.click,options.countVolume,options.bandVersion==='original'?[options.swing,options.embellish,options.harmony]:null]);
 if(!performanceCache.has(key)){if(performanceCache.size>=8)performanceCache.delete(performanceCache.keys().next().value);performanceCache.set(key,composePerformance(chart,style,options,seed));}
 return performanceCache.get(key);
}
export function devPerformance(plan){return JSON.stringify(plan,null,2);}
export function renderEvent(synth,e,time){if(e.role==='drums')synth.drum(e.instrument,time,1,e.velocity);else if(e.role==='click')synth.drum(e.instrument,time,e.level??.6,e.velocity);else if(e.role!=='harmony'||(synth.settings?.harmony??0)>0)synth.tone(e.midi,time,e.seconds,e.role==='bass'?'bass':e.role==='harmony'?'harmony':'chords',1,e.velocity);}
