import {parseChord,pitch,mod,intervals,canonicalQuality} from './chords.js';
export {parseChord,mod};
export const bassRoot=ch=>pitch(ch?.bass||ch?.root||'C')??0;
export function chordScale(ch){const q=canonicalQuality(ch?.quality||''),r=ch?.pc??bassRoot(ch);let d;
 if(q.includes('alt')||q.includes('#9')||q.includes('b9'))d=[0,1,3,4,6,8,10];
 else if(q.startsWith('h')||q.includes('-7b5'))d=[0,2,3,5,6,8,10];
 else if(q.startsWith('o'))d=[0,2,3,5,6,8,9,11];
 else if(q.startsWith('+')||q.includes('#5'))d=[0,2,4,6,8,10];
 else if(q.startsWith('-'))d=/6|\^/.test(q)?[0,2,3,5,7,9,11]:[0,2,3,5,7,9,10];
 else if(q.includes('#11'))d=/7|9|13/.test(q)&&!q.includes('^')?[0,2,4,6,7,9,10]:[0,2,4,6,7,9,11];
 else if(q.includes('sus')||(/7|9|13/.test(q)&&!q.includes('^')))d=[0,2,4,5,7,9,10];
 else d=[0,2,4,5,7,9,11];return d.map(n=>mod(n+r));}
export const chordPcs=ch=>intervals(ch?.quality||'').map(n=>mod(n+(ch?.pc??bassRoot(ch))));
export function ladder(ch,low=28,high=55){const scale=chordScale(ch),tones=chordPcs(ch);return Array.from({length:high-low+1},(_,i)=>i+low).filter(n=>scale.includes(mod(n))).map(note=>({note,chord:tones.includes(mod(note)),color:!tones.includes(mod(note))}));}
export function nearestNote(pc,target,low=28,high=55){return Array.from({length:high-low+1},(_,i)=>i+low).filter(n=>mod(n)===mod(pc)).sort((a,b)=>Math.abs(a-target)-Math.abs(b-target))[0];}
export function movement(a,b){const [s,l]=a.length<=b.length?[a,b]:[b,a];if(!s.length)return 0;let row=Array(l.length+1).fill(0);for(let i=1;i<=s.length;i++){const next=Array(l.length+1).fill(Infinity);for(let j=1;j<=l.length;j++)next[j]=Math.min(next[j-1],row[j-1]+Math.abs(s[i-1]-l[j-1]));row=next;}return row[l.length]/s.length;}
export const fingerprint=events=>events.map(e=>[e.position??e.at,e.midi??e.intent,Math.round((e.length??e.duration??0)*100)/100].join(':')).join('|');
