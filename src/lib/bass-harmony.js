import {bassRoot,chordScale,chordPcs,nearestNote,mod} from './band-theory.js';
// Choose destinations before connecting notes; an approach is defined by its
// resolution, never by snapping an unrelated melody into the current scale.
export function harmonicBassRoute(bar,next,state,rhythm,targets,rng,c){
 const h=c.bassHarmony,w=c.walking,at=i=>rhythm[i].at-bar.phraseBar*bar.beats,chAt=t=>(bar.spans.findLast(s=>s.beat<=t)||bar.spans[0]).chord;
 const pitchSet=(pcs)=>Array.from({length:w.high-w.low+1},(_,i)=>i+w.low).filter(n=>pcs.includes(mod(n)));
 let landing=null;if(next?.spans[0]?.chord?.kind==='chord'){const nch=next.spans[0].chord;if(next.harmonicStart||next.writtenBar===0)landing=nearestNote(bassRoot(nch),targets.at(-1),w.preferredLow,w.preferredHigh);else{const pcs=chordPcs(nch),expected=targets.at(-1)+(targets.at(-1)>state.last?-2:2);landing=pitchSet(pcs).sort((a,b)=>Math.abs(a-expected)-Math.abs(b-expected))[0];}}
 const arrival=state.bassArrival?.bar===bar.id?state.bassArrival.note:null;
 const choices=rhythm.map((_,i)=>{const t=at(i),ch=chAt(t),scale=chordScale(ch),tones=chordPcs(ch),change=bar.spans.some(s=>s.beat>0&&s.beat<=t&&(i===0||s.beat>at(i-1)));let pcs=scale,intent='scale-connection',fixed;
 if(i===0&&arrival!==null){fixed=arrival;intent='planned-arrival';}
 else if(change||i===0&&(bar.harmonicStart||bar.absolute===0||bar.writtenBar===0)){fixed=nearestNote(bassRoot(ch),targets[i],w.preferredLow,w.preferredHigh);intent='root-anchor';}
 else if(t===0||t===2){pcs=tones;intent='chord-tone-target';}
 let notes=fixed===undefined?pitchSet(pcs):[fixed];
 if(i===rhythm.length-1&&landing!==null&&rhythm.length>1&&fixed===undefined){const approaches=[landing-2,landing-1,landing+1,landing+2].filter(n=>n>=w.low&&n<=w.high&&(scale.includes(mod(n))||next.harmonicStart||bar.phraseEnd&&rng()<h.chromaticChance));if(approaches.length){notes=approaches;intent=next.harmonicStart?'change-approach':'diatonic-arrival';}}
 return {notes,ch,scale,intent};});
 let paths=[{notes:[],cost:0,last:state.last,dir:state.direction||0,run:state.run||0}];
 for(let i=0;i<choices.length;i++){const x=choices[i],pool=[];for(const p of paths)for(const n of x.notes){const d=n-p.last,ad=Math.abs(d),dir=Math.sign(d),run=dir===p.dir?p.run+1:1;if(ad===0&&x.notes.length>1)continue;let cost=p.cost+(run>h.maxRun?h.repeatPhraseCost*(run-h.maxRun):0)+Math.abs(n-targets[i])*h.vocabularyWeight+(ad<=2?h.stepCost:ad<=5?h.thirdCost:ad<=7?h.fifthCost:h.leapCost)+(ad===0?h.repeatCost:0)+(n<w.preferredLow||n>w.preferredHigh?h.registerCost:0);
 if(i>0&&i<choices.length-1&&!x.scale.includes(mod(n))&&Math.abs(n-p.notes.at(-1))>2)cost+=h.unresolvedCost;
 if(i===choices.length-1&&state.bars?.some(b=>b.notes?.join()===p.notes.concat(n).join()))cost+=h.repeatPhraseCost;
 pool.push({notes:[...p.notes,n],cost,last:n,dir,run});}pool.sort((a,b)=>a.cost-b.cost);paths=pool.slice(0,w.beam);if(!paths.length)throw Error('No harmonic bass route fits the selected range');}
 const best=paths[0],near=paths.filter(p=>p.cost<=best.cost+h.choiceWindow),chosen=near[Math.floor(rng()*near.length)]||best;state.direction=chosen.dir;state.run=chosen.run;if(next&&landing!==null)state.bassArrival={bar:next.id,note:landing};state.bars=[...(state.bars||[]),{notes:chosen.notes}].slice(-8);
 return chosen.notes.map((midi,i)=>({midi,intent:choices[i].intent,scale:choices[i].scale,destination:i===chosen.notes.length-1?landing:null}));
}
