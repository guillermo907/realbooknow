import {rngFor} from './band-config.js';
// Independently authored four-bar call/answer gestures. Tuples are onset,
// sounding length, strike velocity. Gaps are intentional, not missing data.
const jazz=[
 [[[0,2.7]],[[1.5,.28],[3,.55]],[[.5,.4],[2,1.65]],[[1.5,.3]]],
 [[[.5,.45],[2,1.5]],[[1,.3],[2.5,.45]],[[0,2.6]],[]],
 [[[0,.4],[2.5,.3]],[[.5,2.4]],[[1,.25],[2.5,.6]],[[.5,1.6]]],
 [[[1,2.5]],[[.5,.3],[2,.4]],[[0,.4],[1.5,.25],[3,.5]],[[1,1.8]]]
];
const waltz=[
 [[[0,2.5]],[[1.5,.35]],[[.5,.35],[2,.5]],[[1,1.4]]],
 [[[.5,.5]],[[0,1.4],[2,.3]],[[1,1.6]],[]]
];
const ballad=[
 [[[0,3.7]],[[1,2.7]],[[.5,3.3]],[[1.5,2.3]]],
 [[[.5,4.6]],[],[[0,3.6]],[[1,2.8]]]
];
const grooves={
 funk:[[[[0,.24],[1.5,.18],[2.75,.22]],[[.75,.2],[2,.3],[3.5,.2]],[[0,.35],[1.75,.2],[3,.25]],[[.5,.25],[2.5,.3]]],[[[.5,.2],[2,.35]],[[0,.25],[1.75,.2],[3.5,.2]],[[.75,.2],[2.5,.25]],[[0,.4],[3,.2]]]],
 rock:[[[[0,1.5],[2,.6]],[[.5,.5],[2,1.5]],[[0,.5],[1.5,.4],[3,.5]],[[0,2.5]]],[[[0,2.6]],[[1,.55],[3,.55]],[[0,1.5],[2.5,.4]],[[.5,2.5]]]],
 bossa:[[[[0,.65],[1.5,.45],[3,.55]],[[.5,.55],[2,.65]],[[0,1.2],[2.5,.55]],[[1,.55],[3,.5]]],[[[.5,.6],[2,.7]],[[0,.5],[1.5,.45],[3,.5]],[[1,.6],[2.5,.5]],[[.5,1.2],[3,.4]]]],
 latin:[[[[0,.35],[1.5,.35],[3,.35]],[[.5,.35],[2,.35],[3.5,.3]],[[0,.4],[1.5,.4],[3,.35]],[[.5,.3],[2,.5]]],[[[.5,.35],[2,.4],[3.5,.25]],[[1,.4],[2.5,.4]],[[0,.35],[1.5,.3],[3,.4]],[[.5,.35],[2,.65]]]],
 afro:[[[[0,1],[4/3,.4],[8/3,.6]],[[2/3,.4],[2,.7]],[[0,.6],[2,.6]],[[2/3,.4],[8/3,.6]]],[[[2/3,.6],[8/3,.6]],[[0,1.4]],[[4/3,.5],[10/3,.5]],[[0,.7],[2,.7]]]],
 shuffle:[[[[0,.4],[1.5,.3],[3,.4]],[[1,.4],[2.5,.4]],[[0,1.4],[2.5,.3]],[[.5,.4],[2,1.4]]],[[[.5,.35],[2,.6]],[[0,1.5]],[[1,.4],[2.5,.4]],[[0,.4],[3,.35]]]]
};
export function authoredCompPhrase(bar,state,c){
 const bank=bar.family==='waltz'?waltz:bar.family==='ballad'?ballad:grooves[bar.family]||jazz;
 const seed=bar.roleSeeds?.comp??bar.phraseSeed,key=bar.family+':'+bar.phraseId;
 if(state.authoredPhrase?.key!==key){const r=rngFor(seed,'authored-comp'),last=state.authoredPhrase,choices=bank.map((_,i)=>i).filter(i=>bank.length===1||last?.family!==bar.family||last?.index!==i),index=last?.seed===seed&&last.family===bar.family?last.index:choices[Math.floor(r()*choices.length)]??0;state.authoredPhrase={key,index,seed,family:bar.family};}
 const index=state.authoredPhrase.index,source=bank[index][bar.phraseBar%4],jazzFeel=['swing','waltz','ballad'].includes(bar.family);
 return {id:`authored-${bar.family}-${index}`,items:source.filter(x=>x[0]<bar.beats).map(([at,length,velocity],i)=>({at,length:Math.min(length,bar.beats+1.3-at),velocity:velocity??(jazzFeel?60:65)+(bar.phraseBar===2?4:0)-(i?3:0),size:length>2?5:4,roll:length>=2&&bar.phraseBar===0?c.piano.rollMinMs*bar.tempo/60000:0}))};
}
