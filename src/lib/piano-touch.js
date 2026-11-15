import {mod} from './band-theory.js';
// Separate hands, inner voices and phrase gestures: not every attack is a block.
export function pianoTouch(notes,item,context){
 const {c,rng,bar,span,length,attackId,gesture,velocity,guides,kind,anticipation}=context,t=c.piano.touch,hold=length>=t.holdBeats,answer=item.texture==='answer'||!hold&&bar.phraseBar%2===1,roll=Math.min(c.piano.rollCapMs,(item.roll||0)*60000/bar.tempo),split=notes.length>=4&&(hold||item.texture==='split'),events=[];
 const leftCount=split?t.leftVoices:0,rhythmSplit=split&&rng()<t.splitChance,shared={role:'comp',instrument:'piano',at:item.at,length,intent:anticipation?'anticipation':hold?'hold':length<=t.stabBeats?'stab':'comp',gesture,shape:split?'left-shell-right-answer':answer?'right-hand-answer':'statement',attackId,harmony:span.symbol,guidePcs:guides,voicingKind:kind,release:hold?t.holdRelease:length<=t.stabBeats?t.shortRelease:t.mediumRelease};
 for(let i=0;i<notes.length;i++){
  const upper=i>=leftCount,top=i===notes.length-1,stagger=split&&upper?t.handDelayMs:0,noteLength=answer&&!top?Math.min(length,t.answerInnerLength):length;
  const offset=rhythmSplit&&upper?t.splitDelayBeats:0;events.push({...shared,midi:notes[i],at:item.at+offset,length:Math.max(t.minimumLengthBeats,noteLength-offset),attackId:attackId+(offset?':right':''),velocity:velocity+(top?c.piano.topAccent:split&&!upper?-t.leftSoftening:-t.innerSoftening)+(offset?t.splitVelocityOffset:0)+(rng()*2-1)*t.voiceSpread,rollOffsetMs:stagger+roll*i/Math.max(1,notes.length-1)});
 }
 return events;
}
export function pianoEmbellishment(voice,item,context){
 const {c,rng,bar,span,length,attackId,gesture,velocity,anticipation,scale}=context,t=c.piano.touch;
 if(anticipation||length<t.ornamentMinHold||bar.phraseBar%2===1||rng()>=t.ornamentChance)return [];
 const top=voice.at(-1),direction=bar.phraseBar===0?1:-1,neighbor=[top+direction,top+direction*2].find(n=>n<=c.piano.topHigh&&n>=c.piano.topLow&&scale.includes(mod(n))&&!voice.includes(n));if(neighbor===undefined)return [];
 const at=item.at+t.ornamentAt,back=at+t.ornamentSpacing;if(back+t.ornamentLength>item.at+length)return [];
 return [{midi:neighbor,at,length:t.ornamentLength},{midi:top,at:back,length:Math.min(t.ornamentReturnLength,item.at+length-back)}].map((e,i)=>({...e,role:'comp',instrument:'piano',velocity:velocity+t.ornamentVelocityOffset+i*t.ornamentReturnAccent,intent:i?'melodic-resolution':'melodic-neighbor',gesture,shape:'upper-voice-turn',attackId:attackId+':turn:'+i,harmony:span.symbol,guidePcs:[],voicingKind:'melodic-embellishment',rollOffsetMs:0,release:t.shortRelease}));
}
