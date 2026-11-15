// Phrase-based accompaniment shared by live playback, WAV and MIDI export.
// Values describe musical accents, not mixer volume. Timing variation is bounded
// and deterministic so exports, repeats and practice loops remain reproducible.
const SWING_COMPS=[[0,3],[2,5],[1,6],[3,7],[2],[1,4,7],[],[0,5]];
const LATIN_COMPS=[[0,3,6],[2,4,7],[0,3,5],[1,4,6]];
const FUNK_COMPS=[[0,3,7],[1,4,6],[0,5],[2,3,6]];
const pick=(values,n)=>values[((n%values.length)+values.length)%values.length];
export function rhythmStep(style,visit,step){
 const name=style.toLowerCase(),beat=step/2,whole=step%2===0;
 const bar=visit.visit??visit.index??0,chorus=visit.chorus||0,phrase=bar%4;
 const total=Math.round(visit.beats*2),s=step%8;
 let swing=/swing|shuffle|two feel|gypsy|blues|jazz waltz/.test(name);
 if(name.includes('/ swing'))swing=chorus>0||['B','C','D'].includes(visit.section??visit.measure.section);
 const latin=/bossa|samba|latin|rumba|bolero|cha|son|salsa|tango|partido/.test(name)&&!swing;
 const ballad=/ballad|long notes/.test(name),funk=/funk|soul|disco/.test(name),reggae=/reggae/.test(name);
 const waltz=visit.meter[0]===3&&visit.meter[1]===4,compound=visit.meter[1]===8&&visit.meter[0]%3===0;
 const motif=bar+Math.floor(bar/4)*3+chorus*3;
 const first=bar===0,turnaround=phrase===3;
 const ending=Boolean(visit.measure.end||['}','Z'].includes(visit.measure.right));
 const fill=(turnaround||ending)&&step>=total-2;
 let compSteps=swing?pick(SWING_COMPS,motif):latin?pick(LATIN_COMPS,motif):funk?pick(FUNK_COMPS,motif):reggae?[1,3,5,7]:[[0,4],[0,3,6],[2,4],[0,6]][motif%4];
 if(swing&&!ballad&&bar%8===6)compSteps=[];
 if(ballad)compSteps=phrase%2?[3]:[0,5];
 let comp=compSteps.includes(s);
 if(waltz)comp=pick([[0,3],[2],[1,4],[3,5]],motif).includes(step);
 if(compound)comp=(bar%2?[2,3]:[0,4]).includes(step);
 if(/gypsy/.test(name))comp=whole;
 if(first&&step===0)comp=true;
 const phraseDynamic=[0,-7,-3,5][phrase]+pick([0,3,-2,1],chorus);
 const compVelocity=Math.max(34,Math.min(105,(ballad?49:funk?82:latin?70:65)+phraseDynamic+(whole?5:-5)));
 const compDuration=ballad?1.65:latin?(whole?.62:.4):swing?(whole?.68:.3):funk?.22:.48;
 const compOffset=(swing?.008:0)+pick([0,.003,-.002,.001],bar+step);
 const drums=[];
 const hit=(kind,velocity,level=1,delay=0)=>drums.push({kind,velocity:Math.max(1,Math.min(127,velocity)),level,delay});
 if(swing&&!ballad){
  // Spang-a-lang: quarter notes with skips after 2 and 4; pedal on 2/4.
  if(whole||s===3||s===7)hit('ride',whole?(s===2||s===6?87:72):49,whole?1:.8);
  if(whole&&(waltz?step===2:s===2||s===6))hit('pedal',79,.9);
  if(whole&&(s===0||s===4)&&(!turnaround||s===0))hit('kick',48,.7);
  if(!comp&&pick([3,5,7,1],bar+chorus)===s)hit('snare',37,.48);
  if(fill&&step===total-1&&bar%8===7)hit('snare',66,.72);
 }else if(latin){
  if(whole)hit('hat',s===2||s===6?78:61,.9);
  if(!whole&&/samba|salsa/.test(name))hit('hat',42,.6);
  if([0,3,4,7].includes(s))hit('kick',s===0||s===4?72:54,s===0||s===4?.9:.7);
  if(pick([[0,3,6],[2,4]],bar).includes(s))hit('rim',s===3?85:72,.9);
  if(s===2||s===6)hit('pedal',64,.7);
 }else if(compound){
  hit('hat',step%3===0?82:47,step%3===0?1:.7);
  if(step===0)hit('kick',86,.9);
  if(step===3)hit('snare',86,.9);
 }else if(ballad){
  if(whole)hit('ride',s===2||s===6?61:44,.8);
  if(s===2||s===6)hit('pedal',65,.8);
  if(s===0)hit('kick',42,.6);
 }else{
  hit('hat',whole?79:48,whole?.9:.65);
  if(funk&&[1,5].includes(s))hit('hat',34,.42,.5); // quiet inner sixteenths
  if(s===0||s===4||(funk&&pick([3,7],bar)===s))hit('kick',s===0?100:85,.95);
  if(s===2||s===6)hit(reggae?'rim':'snare',s===6?98:89,.95);
  if(funk&&s===5)hit('snare',35,.4);
  if(fill&&s===7&&bar%8===7)hit('snare',64,.65);
 }
 if(waltz){for(let i=drums.length-1;i>=0;i--)if(drums[i].kind==='snare'&&step===5&&!fill)drums.splice(i,1);}
 const bass=compound?step%3===0:latin?[0,3,4,7].includes(s):reggae?[0,3,6].includes(s):ballad?whole&&(beat===0||beat===2):swing?whole&&(!/two feel|gypsy/.test(name)||beat===0||beat===2):funk?[0,3,4,7].includes(s):whole&&(beat===0||beat===2);
 return {beat,whole,swing,latin,ballad,funk,reggae,comp,bass,fill,drums,compVelocity,compDuration,compOffset,
  bassVelocity:(beat===0?85:whole?73:60)+phraseDynamic/2,bassDuration:latin?(whole?1.25:.42):ballad?1.65:funk?.4:.88,
  // Compatibility for consumers that only need coarse rhythm flags.
  hat:drums.find(d=>d.kind==='ride'||d.kind==='hat')?.kind||null,kick:drums.some(d=>d.kind==='kick'),snare:drums.some(d=>d.kind==='snare'||d.kind==='pedal')};
}
export function stepDuration(tempo,settings,feel,step,meter){const ratio=feel.swing&&meter[1]===4?Math.max(.5,Math.min(.72,settings.swing||.6)):.5;return 60/tempo*(step%2===0?ratio:1-ratio);}
