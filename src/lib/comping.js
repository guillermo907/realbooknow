import {authoredCompPhrase} from './comp-phrases.js';
import {pianoTouch,pianoEmbellishment} from './piano-touch.js';
import {spreadVoicings} from './swing-arranger.js';
import {chordPcs,chordScale,mod,movement} from './band-theory.js';
export function guidePcs(ch){const q=ch?.quality||'',r=ch?.pc??0;let guide=q.includes('sus')?[5,10]:q.startsWith('o')?[3,9]:q.startsWith('h')||q.includes('-7b5')?[3,10]:q.startsWith('-')?[3,q.includes('^')?11:q.includes('6')?9:10]:[4,q.includes('^')?11:q.includes('6')?9:/7|9|13|alt/.test(q)?10:7];return guide.map(n=>mod(n+r));}
export function voicingPool(ch,previous,energy,c,{quartal=false,hold=false,bassNote=null}={}){if(ch?.kind!=='chord')return [];const q=ch.quality,r=ch.pc,guides=guidePcs(ch);let sets;
 if(q.startsWith('h')||q.includes('-7b5'))sets=[[3,6,10,5],[3,8,10,5],[3,10,14,17]];
 else if(q.startsWith('o'))sets=[[3,6,9,14],[3,9,12,18],[3,6,9,17]];
 else if(q.startsWith('-'))sets=[[3,7,10,14],[3,5,10,14],[3,7,10,17],[3,10,14,17]];
 else if(q.includes('alt')||q.includes('b9')||q.includes('#9'))sets=[[4,10,13,20],[4,10,15,20],[4,8,10,15],[4,10,13,18]];
 else if(q.includes('sus'))sets=[[5,7,10,14],[5,10,14,19],[5,9,10,14]];
 else if(q.includes('^')||!(/7|9|13/.test(q)))sets=[[4,7,q.includes('6')?9:11,14],[4,9,q.includes('6')?9:11,14],[4,7,q.includes('6')?9:11,q.includes('#11')?18:21],[4,9,q.includes('6')?9:11,14]];
 else sets=[[4,10,14,21],[4,7,10,14],[4,9,10,14],[4,10,14,18]];
 if(q.startsWith('-')&&q.includes('^'))sets=sets.map(a=>a.map(n=>n===10?11:n));if(q.startsWith('-')&&q.includes('6'))sets=sets.map(a=>a.map(n=>n===10?9:n));
 if(quartal&&q.startsWith('-')&&!q.startsWith('h'))sets=[[5,10,15],[10,15,21,26],[3,9,14,19],...sets];
 const pool=[];for(const set of sets){const pcs=[...new Set(set.map(n=>mod(n+r)))];if(!pcs.every(p=>chordScale(ch).includes(p)||guides.includes(p)))continue;if(!guides.every(p=>pcs.includes(p)))continue;for(let low=c.piano.low;low<=66;low++){if(!pcs.includes(mod(low)))continue;let v=[low];for(let n=low+1;n<=c.piano.topHigh;n++)if(pcs.includes(mod(n))&&v.length<Math.min(4,pcs.length))v.push(n);if(energy<.25)v=v.filter(n=>guides.includes(mod(n)));if(v.length<2||v.at(-1)<c.piano.topLow||v.at(-1)>c.piano.topHigh)continue;if(v[0]<52&&v.some((n,i)=>i&&n-v[i-1]<3))continue;if(bassNote!==null&&mod(bassNote)===r&&v.some(n=>mod(n)===r))continue;if(!guides.every(p=>v.some(n=>mod(n)===p)))continue;const key=v.join();if(!pool.some(x=>x.notes.join()===key))pool.push({notes:v,quartal:quartal&&sets.indexOf(set)<3,guidePcs:guides});}}
 const score=v=>(previous.length?movement(v.notes,previous):Math.abs(v.notes.reduce((a,b)=>a+b,0)/v.notes.length-62)*.1)-v.notes.filter(n=>previous.includes(n)).length*c.piano.commonReward;
 return pool.sort((a,b)=>score(a)-score(b)).slice(0,c.piano.maxCandidates);}
export function makeCompState(){return {previous:[],history:[],pairs:[],anticipations:{},carry:[],lastGesture:null,consecutive:0,lastAttack:null};}
export function chooseCompBar(bar,next,state,drums,data,options,rng,c,bassNote){
 const density=c.comp.density*c.piano.density*(.25+1.5*(bar.activity?.comp??.5)),phrase=authoredCompPhrase(bar,state,c),changed=bar.harmonicStart||bar.absolute===0;
 let items=phrase.items.filter((x,i)=>density>=.7||i%2===0).map(x=>({...x}));
 if(['swing','waltz','rock','shuffle'].includes(bar.family)&&bar.spans.length===1&&bar.phraseBar%2===0&&items.length&&rng()<c.piano.holdProbability){items=[{...items[0],length:Math.max(1.8,bar.beats-items[0].at-.15)}];}
 if(bar.family==='ballad')items=items.slice(0,1).map(x=>({...x,length:Math.max(x.length,c.piano.balladHold),roll:x.roll}));
 if(state.anticipated===bar.id)items=items.filter(x=>x.at!==0);
 if(changed&&state.anticipated!==bar.id&&!items.some(x=>x.at===0))items.unshift({at:0,length:Math.min(2,bar.beats),velocity:58,roll:.04,size:4});
 for(let i=1;i<bar.spans.length;i++){const at=bar.spans[i].beat;if(!items.some(x=>Math.abs(x.at-at)<.05))items.push({at,length:.9,velocity:62,roll:0,size:3});}
 // A phrase breath belongs inside sustained harmony; entrances still state the change.
 if(!changed&&bar.phraseBar===3&&bar.spans.length===1&&rng()<c.piano.phraseRestChance)items=[];
 if(density>1.4&&!items.some(x=>x.at===1.5))items.push({at:1.5,length:c.piano.answerLength,velocity:58,roll:0,size:3});
 if(['swing','waltz','bossa','latin','funk','shuffle'].includes(bar.family)&&next?.harmonicStart&&rng()<c.piano.pushProbability&&!items.some(x=>x.at>=bar.beats-.5))items.push({at:bar.beats-.5,length:1.5,velocity:64,roll:.02,size:4});
 if(drums.fill)items=items.filter(x=>x.at<drums.fill.start||next?.harmonicStart&&x.at===bar.beats-.5);
 items.sort((a,b)=>a.at-b.at);items=items.filter((x,i)=>!i||x.at!==items[i-1].at);
 const events=[],attacks=[];
 for(let ai=0;ai<items.length;ai++){const x=items[ai],anticipation=!!next?.harmonicStart&&x.at>=bar.beats-.5,span=anticipation?next.spans[0]:bar.spans.findLast(s=>s.beat<=x.at)||bar.spans[0];if(span.chord?.kind!=='chord')continue;
 const modal=bar.spanLength>=4&&bar.spans.length===1&&span.chord.quality.startsWith('-')&&!/\^|6|b5/.test(span.chord.quality),hold=x.length>=1.5,maxSize=hold&&(x.size>=5||rng()<c.piano.modalFiveVoiceChance)?5:4;
 let candidates=modal?spreadVoicings(span.chord,state.previous,rng()<c.piano.quartalProbability,c,maxSize).filter(notes=>guidePcs(span.chord).every(pc=>notes.some(n=>mod(n)===pc))).map(notes=>({notes,guidePcs:guidePcs(span.chord),quartal:true})):voicingPool(span.chord,state.previous,bar.energy,c,{hold,bassNote});
 if(!candidates.length)candidates=voicingPool(span.chord,state.previous,bar.energy,c,{hold,bassNote});if(!candidates.length)continue;
 const color=notes=>[...new Set(notes.map(n=>mod(n-span.chord.pc)))].sort((a,b)=>a-b).join(','),history=state.colorHistory||[],targetTop=Math.max(c.piano.topLow,Math.min(c.piano.topHigh,60+span.chord.pc-2+(c.piano.topContour[bar.phraseBar%c.piano.topContour.length]-60)));
 const guides=guidePcs(span.chord),changedHarmony=state.symbol&&state.symbol!==span.symbol;const resolution=v=>changedHarmony?state.previous.filter(n=>!chordPcs(span.chord).includes(mod(n))).reduce((sum,n)=>sum+Math.min(...v.notes.filter(m=>guides.includes(mod(m))).map(m=>Math.abs(m-n))),0):0;
 const score=v=>resolution(v)*.35+movement(v.notes,state.previous)*c.piano.moveCost+(v.notes.join()===state.previous.join()?c.piano.exactRepeatCost:0)*c.piano.voicingVariation+history.filter(k=>k===color(v.notes)).length*c.piano.colorRepeatCost*c.piano.voicingVariation+Math.abs(v.notes.at(-1)-targetTop)*c.piano.topContourWeight;
 candidates.sort((a,b)=>score(a)-score(b));const best=score(candidates[0]),near=candidates.filter(v=>score(v)<=best+c.piano.choiceSlack*(options.aliveness??.7)),voice=near[Math.floor(rng()*near.length)]||candidates[0];
 const at=x.at,spanEnd=anticipation?bar.beats+(next.spans[1]?.beat??next.beats):bar.spans.find(s=>s.beat>at)?.beat??(bar.spans.length===1&&bar.hasNext&&!bar.harmonicEnd?bar.beats+c.piano.holdLengthScale:bar.beats),length=Math.min(x.length,items[ai+1]?items[ai+1].at-at-c.piano.releaseGapBeats:x.length,spanEnd-at-c.piano.releaseGapBeats),attackId=bar.id+':'+ai,roll=Math.min(c.piano.rollCapMs,(x.roll||0)*60000/bar.tempo),velocity=x.velocity+(bar.energy-.5)*c.piano.phraseEnergyVelocity+(hold?-c.piano.statementSoftening:c.piano.answerAccent);
 if(length<=0)continue;attacks.push({at,length,voicing:voice.notes,gesture:phrase.id,harmony:span.symbol,anticipation,rollMs:roll,attackId,color:color(voice.notes)});
 const touchContext={c,rng,bar,span,length,attackId,gesture:phrase.id,velocity,guides:voice.guidePcs,kind:modal?'modal-upper-structure':'rootless',anticipation,scale:chordScale(span.chord)};
 const touched=pianoTouch(voice.notes,x,touchContext),ornaments=pianoEmbellishment(voice.notes,x,touchContext);
 // The upper voice releases before an ornament replaces it; the shell can ring.
 if(ornaments.length){const top=touched.findLast(e=>e.midi===voice.notes.at(-1));if(top)top.length=Math.min(top.length,ornaments[0].at-top.at-c.piano.releaseGapBeats);}
 events.push(...touched,...ornaments);
 state.previous=voice.notes;state.symbol=span.symbol;state.colorHistory=[...history,color(voice.notes)].slice(-c.piano.colorMemory);if(anticipation)state.anticipated=next.id;
 }
 return {events,attacks,gesture:phrase.id,arc:'statement-answer'};
}
