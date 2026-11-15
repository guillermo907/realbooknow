import {bassRoot,chordScale,chordPcs,nearestNote,mod} from './band-theory.js';
import {rngFor,clamp} from './band-config.js';

// Original four-bar sentences in scale degrees. These are musical statements,
// not a stock groove or a transcription. Each has a different answering half.
const sentences=[
 {id:'thirds-and-return',notes:[0,1,2,4, 6,5,4,3, 2,3,5,4, 2,1,0,-1]},
 {id:'upper-answer',notes:[0,1,2,4, 6,5,4,3, 2,4,5,6, 7,6,4,3]},
 {id:'low-answer',notes:[0,-1,-2,-3, -2,0,2,1, 2,3,4,2, 1,0,-2,-1]},
 {id:'seventh-to-third',notes:[0,2,4,6, 5,4,2,1, 0,-1,0,2, 4,3,2,1]},
 {id:'ninth-and-sixth',notes:[0,1,2,3, 4,5,4,2, 1,3,4,5, 6,4,3,2]},
 {id:'descending-answer',notes:[0,2,4,3, 2,1,0,-1, -2,0,1,2, 4,3,1,0]},
 {id:'fifth-and-space',notes:[0,2,4,5, 6,4,3,2, 4,3,2,0, -1,0,1,2]},
 {id:'rising-sequence',notes:[0,1,3,2, 1,2,4,3, 2,3,5,4, 6,5,3,2]}
];

function degreePitch(degree,root,intervals){const size=intervals.length,octave=Math.floor(degree/size),index=((degree%size)+size)%size;return root+octave*12+intervals[index];}

function buildSentence(bar,state,c){
 const m=c.modal,w=c.walking,ch=bar.spans[0].chord,pc=bassRoot(ch),scale=chordScale(ch),intervals=scale.map(p=>mod(p-ch.pc)).sort((a,b)=>a-b),rng=rngFor(bar.phraseSeed,'bass','modal-sentence');
 const history=state.modalHistory||[],fresh=sentences.filter(s=>!history.slice(-m.memoryPhrases).includes(s.id));
 const pool=fresh.length?fresh:sentences,choice=pool[Math.floor(rng()*pool.length)],notes=[...choice.notes];
 // Retain an idea for four bars. An answer may start from an inversion or a
 // color tone; only a real harmonic arrival insists on the root.
 const newHarmony=bar.harmonicStart||bar.absolute===0||bar.writtenBar===0,landing=state.modalLanding;
 const root=nearestNote(ch.pc,m.center,w.low,w.high);
 const degrees=notes.map(d=>degreePitch(d,root,intervals));
 if(newHarmony)degrees[0]=landing?.symbol===bar.spans[0].symbol&&mod(landing.note)===pc?landing.note:nearestNote(pc,state.last,w.preferredLow,w.preferredHigh);
 else if(landing?.symbol===bar.spans[0].symbol)degrees[0]=landing.note;
 else{const starts=m.startDegrees.map(d=>degreePitch(d,root,intervals)).filter(n=>n>=w.low&&n<=w.high);degrees[0]=starts.sort((a,b)=>Math.abs(a-state.last)-Math.abs(b-state.last))[0]??degrees[0];}
 // A few diatonic answers move the middle register without octave resets.
 if(!newHarmony&&rng()<m.sequenceChance){const shift=rng()<.5?-1:1;for(let i=4;i<12;i++)degrees[i]=degreePitch(notes[i]+shift,root,intervals);}
 for(let i=0;i<degrees.length;i++){while(degrees[i]<w.low)degrees[i]+=12;while(degrees[i]>w.high)degrees[i]-=12;}
 state.modalHistory=[...history,choice.id].slice(-m.memoryPhrases);
 state.modalSentence={id:bar.phraseId,motif:choice.id,notes:degrees,scale,symbol:bar.spans[0].symbol};
 return state.modalSentence;
}

export function modalBassBar(bar,next,state,positions,mode,deviation,options,rng,c){
 const m=c.modal,w=c.walking,ch=bar.spans[0].chord;
 let phrase=state.modalSentence;if(!phrase||phrase.id!==bar.phraseId||phrase.symbol!==bar.spans[0].symbol)phrase=buildSentence(bar,state,c);
 const offset=bar.phraseBar*bar.beats,notes=positions.map(at=>phrase.notes[Math.min(phrase.notes.length-1,offset+Math.floor(at))]);
 const last=notes.length-1,isEnd=bar.phraseEnd||bar.harmonicEnd;
 let destination=phrase.notes[Math.min(phrase.notes.length-1,offset+bar.beats)];
 if(next&&(isEnd||next.phraseId!==bar.phraseId)){
  const nextChord=next.spans[0]?.chord;
  if(nextChord?.kind==='chord'){
   if(next.harmonicStart||next.writtenBar===0)destination=nearestNote(bassRoot(nextChord),notes[last],w.preferredLow,w.preferredHigh);
   else{const pcs=m.landingDegrees.map(d=>degreePitch(d,nearestNote(bassRoot(ch),m.center,w.low,w.high),phrase.scale.map(p=>mod(p-ch.pc)).sort((a,b)=>a-b)));const targets=pcs.filter(n=>n>=w.preferredLow&&n<=w.preferredHigh&&n!==notes[last]);targets.sort((a,b)=>Math.abs(a-notes[last])-Math.abs(b-notes[last]));destination=targets[Math.min(targets.length-1,Math.floor(rng()*Math.min(m.landingChoices,targets.length)))]??notes[last];}
   state.modalLanding={symbol:next.spans[0].symbol,note:destination};
  }
 }
 // Resolve the end of a sentence to its *actual* next landing. Inside a
 // sentence the authored line is left alone instead of adding four cadences.
 let approach=false;
 if(next&&isEnd&&last>0){const candidates=[destination-2,destination-1,destination+1,destination+2].filter(n=>n>=w.low&&n<=w.high&&phrase.scale.includes(mod(n))&&n!==notes[last-1]);candidates.sort((a,b)=>Math.abs(a-notes[last-1])-Math.abs(b-notes[last-1]));if(candidates.length){notes[last]=candidates[0];approach=true;}}
 const tones=chordPcs(ch),events=notes.map((note,i)=>{
  const at=positions[i],nextAt=positions[i+1]??bar.beats,held=mode==='twoFeel'||deviation==='held'||deviation==='twoFeel',quarter=at%1===0;
  const phraseAccent=m.phraseVelocity[bar.phraseBar%m.phraseVelocity.length],beatAccent=m.beatVelocity[Math.min(m.beatVelocity.length-1,Math.floor(at))];
  const velocity=Math.round(w.velocity+phraseAccent+beatAccent+(bar.energy-.5)*m.energyVelocity+(rng()*2-1)*m.noteVelocity);
  const length=Math.min(nextAt-at-m.releaseGap,held?nextAt-at-m.heldGap:quarter?m.lengthLow+(m.lengthHigh-m.lengthLow)*rng():m.pickupLength);
  const interval=note-state.last,dir=Math.sign(interval);state.run=dir===state.direction?state.run+1:1;state.direction=dir;state.last=note;
  return {role:'bass',instrument:'bass',midi:note,at,length,velocity:clamp(velocity,1,127),intent:approach&&i===last?'phrase-approach':i===0&&bar.harmonicStart?'root-anchor':tones.includes(mod(note))?'modal-chord-tone':'modal-color-connection',gesture:phrase.motif,shape:bar.phraseBar<2?'statement':'answer',destination,scale:phrase.scale};
 });
 const fp=notes.join(',');state.bars.push({fp,notes});state.bars=state.bars.slice(-w.modeHoldBars*2);
 return {events,mode,deviation,shape:phrase.motif,waypoint:notes[0]};
}
