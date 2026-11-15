import {rhythmStep,stepDuration} from './rhythm.js';
import {intervals,pitch,mod,voiceChord,parseChord,transposeChord} from './chords.js';
export function compVoicing(symbol,previous,embellish,rootless){
 const voices=voiceChord(symbol,previous,embellish),root=pitch(symbol);
 if(!rootless||root===null)return voices;
 // Leave roots to the bassist on seventh chords, retaining guide tones/colors.
 const hasSeventh=voices.some(note=>[10,11].includes(mod(note-root)));
 return hasSeventh?voices.filter(note=>mod(note-root)!==0):voices;
}
const nearest=(pc,reference)=>Array.from({length:25},(_,i)=>28+i).filter(note=>mod(note)===mod(pc)).sort((a,b)=>Math.abs(a-reference)-Math.abs(b-reference))[0];
export function bassPitch(chord,nextChord,feel,previous=38,{anchor=false,approach=false}={}){
 const root=pitch(chord.bass)??chord.pc??0;
 if(anchor||!Number.isFinite(previous))return nearest(root,Number.isFinite(previous)?previous:38);
 const nextRoot=pitch(nextChord?.bass)??nextChord?.pc??root;
 if(feel.swing&&approach&&nextRoot!==root){
  const target=nearest(nextRoot,previous),direction=target>=previous?1:-1;
  const note=target-direction;return Math.max(28,Math.min(52,note));
 }
 if(feel.latin)return nearest(root+(feel.beat>=2?7:0),previous);
 if(!feel.swing)return nearest(root,previous);
 const tones=intervals(chord.quality).filter(n=>n!==0),target=nearest(nextRoot,previous);
 const candidates=Array.from({length:25},(_,i)=>28+i).filter(note=>tones.includes(mod(note-root))&&note!==previous);
 candidates.sort((a,b)=>{
  const score=note=>Math.abs(note-previous)+Math.abs(note-target)*.25+(Math.abs(note-previous)>7?8:0);
  return score(a)-score(b);
 });
 return candidates[0]??nearest(root,previous);
}

export function pattern(synth,visit,step,time,tempo,transpose,style,nextVisit){
 const beat=step/2,whole=step%2===0,settings=synth.settings,seconds=60/tempo;
 let event=visit.events[0],chordIdx=0;
 for(let i=0;i<visit.events.length;i++)if(visit.events[i].beat<=beat+.001){event=visit.events[i];chordIdx=i;}
 if(event.type==='hold')event={...event,symbol:synth.lastSymbol,type:'chord'};
 if(event.type==='nc'){synth.lastSymbol=null;synth.lastCompSymbol=null;synth.lastBass=undefined;}
 if(event.symbol)synth.lastSymbol=event.symbol;
 const symbol=event.symbol?transposeChord(event.symbol,transpose,'C','sharps'):null,c=symbol?parseChord(symbol):null;
 const feel=rhythmStep(style,visit,step);
 const breakText=visit.measure.comments.some(comment=>/\bBreak\b/.test(comment.text));
 if(visit.measure.left==='[')synth.breakDrums=false;if(breakText)synth.breakDrums=true;
 if(!synth.breakDrums||(breakText&&step===0)){
  const duration=stepDuration(tempo,settings,feel,step,visit.meter);
  for(const hit of feel.drums)synth.drum(hit.kind,time+hit.delay*duration,hit.level,hit.velocity);
 }
 if(settings.metronome&&whole)synth.drum('click',time,beat===0?.8:.4);
 if(c&&c.kind!=='unknown'&&c.kind!=='nc'){
  const nextEvent=visit.events[chordIdx+1],nextRaw=nextEvent?.symbol??nextVisit?.events[0]?.symbol??event.symbol;
  const nextChord=nextRaw?parseChord(transposeChord(nextRaw,transpose,'C','sharps')):c;
  const changeBeat=nextEvent?.beat??visit.beats,anchor=Math.abs(beat-event.beat)<.001;
  if(feel.bass){
   const note=bassPitch(c,nextChord,feel,synth.lastBass,{anchor,approach:beat>=changeBeat-1});synth.lastBass=note;
   synth.tone(note,time,seconds*Math.min(feel.bassDuration,Math.max(.2,changeBeat-beat-.04)),'bass',.38,feel.bassVelocity);
  }
  const changed=symbol!==synth.lastCompSymbol;
  if(c.kind==='chord'&&(feel.comp||changed)){
   const voices=compVoicing(symbol,synth.previous,settings.embellish,feel.swing||feel.latin||feel.ballad);synth.previous=voices;synth.lastCompSymbol=symbol;
   const duration=seconds*Math.min(feel.compDuration,Math.max(.12,changeBeat-beat-.05)),offset=Math.max(0,feel.compOffset);
   for(let i=0;i<voices.length;i++)synth.tone(voices[i],time+offset,duration,'chords',.09,feel.compVelocity+(i===voices.length-1?5:-3),feel.compDuration<.5?.08:.18);
   if(settings.harmony>0)for(const note of voices.slice(-3))synth.tone(note+12,time+offset,duration,'harmony',.045,feel.compVelocity-12,.15);
  }
 }
 return {chord:chordIdx,symbol};
}
