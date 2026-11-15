import {orchestrateSwing} from './drum-conversation.js';
import {drumPhrase} from './swing-arranger.js';
import {clamp,rngFor} from './band-config.js';
export const drumMidi={ride:51,rideBell:53,hat:42,footHat:44,openHat:46,kick:36,snare:38,rim:37,tom:45};
export function makeDrumState(){return {lastFill:-99,history:[],energy:null,phrase:null,pattern:0,bias:0,relax:0};}

export function planDrumBar(bar,state,options,rng,c){
 if(['swing','waltz'].includes(bar.family))return orchestrateSwing(drumPhrase(bar,state,c),bar,state,c);
 const d=c.drumFeel,jazz=['swing','ballad','waltz','shuffle'].includes(bar.family),events=[];
 // A drummer commits to a phrase. Keep a stable pulse for its opening and
 // answer near its end; choosing a new preset every bar sounded like a loop.
 if(state.phrase!==bar.phraseId){
  const prng=rngFor(bar.phraseSeed,'drums','phrase'),choices=(bar.energy<.4?[0,0,1,2]:[0,0,2,3]).filter(n=>state.history.slice(-d.patternMemory).filter(x=>x===n).length<2);
  state.pattern=choices[Math.floor(prng()*choices.length)]??0;state.history=[...state.history,state.pattern].slice(-d.patternMemory);
  state.bias=(prng()*2-1)*d.phraseBias;state.phrase=bar.phraseId;
 }
 const target=clamp(bar.energy+(bar.section==='B'?d.bridgeLift:0)-state.relax,.12,1);
 state.energy=state.energy===null?target:state.energy+(target-state.energy)*d.energySmooth;state.relax=0;
 const energy=state.energy,dynamic=((energy-.5)*d.energyVelocity+d.phraseVelocity[bar.phraseBar%d.phraseVelocity.length]+state.bias)*d.dynamicDepth;
 let index=state.pattern;
 if(bar.phraseBar===2&&energy>.45)index=(index+1)%4;
 if(bar.phraseBar===3)index=energy<.55?1:0;
 let pulses;
 if(bar.beats===3)pulses=[[0,1,1.5,2],[0,1,2],[0,1,2,2.5],[0,.5,1,2]][index];
 else if(jazz)pulses=[[0,1,1.5,2,3,3.5],[0,1,2,3],[0,1,1.5,2,3],[0,1,2,3,3.5]][index];
 else{pulses=Array.from({length:Math.ceil(bar.beats*2)},(_,i)=>i/2);if(bar.family==='funk'&&energy>.6&&bar.phraseBar===2)pulses.push(bar.beats-.25);}
 const push=(instrument,at,velocity,intent,gesture)=>{
  if(at<0||at>=bar.beats)return;
  const accents=bar.beats===3?d.tripleAccents:d.quarterAccents,accent=Number.isInteger(at)?accents[Math.floor(at)%accents.length]:d.skipAccent;
  // Dynamics change the strike, leaving the user's mixer level independent.
  const phraseDynamic=instrument==='kick'||instrument==='footHat'?dynamic*.55:dynamic;
  const value=velocity+phraseDynamic+(intent==='time'?accent*d.dynamicDepth:0);
  events.push({role:'drums',instrument,midi:drumMidi[instrument],at,length:.1,velocity:Math.round(clamp(value,1,127)),intent,gesture,shape:'phrase-support-'+bar.supportState,energy});
 };
 for(const at of pulses.filter(x=>x<bar.beats))push(jazz?'ride':'hat',at,Number.isInteger(at)?jazz?c.drums.rideMain:c.drums.hatMain:jazz?c.drums.rideSkip:c.drums.hatSkip,'time','pulse-'+index);
 if(jazz){
  for(const at of bar.beats===3?[1,2]:[1,3])push('footHat',at,c.drums.foot,'anchor','foot');
  for(let beat=0;beat<bar.beats;beat++)push('kick',beat,c.drums.kick+(beat%2?-2:0),'anchor','feather');
 }else{
  for(const at of [0,2])push('kick',at,c.drums.kick+15,'anchor','kick-cycle');
  if(bar.family==='rock'||bar.family==='funk')for(const at of [1,3])push('snare',at,c.drums.backbeat,'anchor','backbeat');
  else for(const at of bar.sectionBar%2?[.5,2]:[1,2.5])push('rim',at,c.drums.rim,'anchor','two-bar-clave');
 }
 // A repeated chord does not need a drum announcement every four bars.
 const structural=bar.sectionEnd||bar.harmonicEnd||(bar.sectionBar+1)%d.minimumFillGap===0;
 let fill=null;
 if(bar.phraseEnd&&structural&&bar.absolute-state.lastFill>=d.minimumFillGap&&rng()<c.drums.fillFrequency*(.6+energy)){
  const final=!bar.hasNext,length=Math.min(bar.beats,final?d.endingFillBeats:bar.harmonicEnd?d.changeFillBeats:d.sameChordFillBeats,c.drums.fillMaxBeats);
  fill={start:bar.beats-length,length};state.lastFill=bar.absolute;state.relax=d.afterFillDrop;
  for(let at=fill.start;at<bar.beats;at+=.5)push(rng()<c.drums.fillTomChance?'tom':'snare',at,c.drums.fill*(.65+.35*energy),'fill','form-response');
 }
 return {events,fill,index,energy,dynamic,phrase:bar.phraseId};
}

export function reactDrums(plan,bar,activity,rng,c){
 if(plan.grammar)return plan;
 const d=c.drumFeel,candidates=d.ghostCandidates.filter(at=>at<bar.beats&&(!plan.fill||at<plan.fill.start));
 // One conversational idea or a breath, rather than independent snare draws
 // on every available eighth. Busy bars give way to the moving bass line.
 const density=c.drums.supportChance*d.supportDensity*(.2+1.6*(bar.activity?.drums??.5))*(.5+plan.energy)*Math.max(1,candidates.length),quiet=bar.phraseBar===0;
 if(!quiet&&rng()<density){
  const free=candidates.filter(at=>!activity.some(x=>Math.abs(x-at)<.5));
  const list=free.length?free:candidates;
  if(list.length){const at=list[Math.floor(rng()*list.length)],velocity=Math.round(clamp(c.drums.ghost+plan.dynamic*.45,1,c.drums.backbeat-c.drums.ghost));plan.events.push({role:'drums',instrument:'snare',midi:38,at,length:.1,velocity,intent:'ghost',gesture:'phrase-answer',shape:'support-'+bar.supportState,energy:plan.energy});}
 }
 if(plan.fill)plan.events=plan.events.filter(e=>e.intent==='time'||e.at<plan.fill.start||e.intent==='fill');
 return plan;
}
