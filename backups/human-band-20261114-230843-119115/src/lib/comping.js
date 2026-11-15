import {compPhraseItems,spreadVoicings} from './swing-arranger.js';
import {chordPcs,chordScale,bassRoot,mod,movement} from './band-theory.js';
export function guidePcs(ch){const q=ch?.quality||'',r=ch?.pc??0;let guide=q.includes('sus')?[5,10]:q.startsWith('o')?[3,9]:q.startsWith('h')||q.includes('-7b5')?[3,10]:q.startsWith('-')?[3,q.includes('^')?11:q.includes('6')?9:10]:[4,q.includes('^')?11:q.includes('6')?9:/7|9|13|alt/.test(q)?10:7];return guide.map(n=>mod(n+r));}
export function voicingPool(ch,previous,energy,c,{quartal=false,hold=false,bassNote=null}={}){if(ch?.kind!=='chord')return [];const q=ch.quality,r=ch.pc,guides=guidePcs(ch);let sets;
 if(q.startsWith('h')||q.includes('-7b5'))sets=[[3,6,10,5],[3,8,10,5],[3,10,14,17]];
 else if(q.startsWith('o'))sets=[[3,6,9,14],[3,9,12,18],[3,6,9,17]];
 else if(q.startsWith('-'))sets=[[3,7,10,14],[3,5,10,14],[3,7,10,17],[3,10,14,17],[3,7,11,14]];
 else if(q.includes('alt')||q.includes('b9')||q.includes('#9'))sets=[[4,10,13,20],[4,10,15,20],[4,8,10,15],[4,10,13,18]];
 else if(q.includes('sus'))sets=[[5,7,10,14],[5,10,14,19],[5,9,10,14]];
 else if(q.includes('^')||!(/7|9|13/.test(q)))sets=[[4,7,q.includes('6')?9:11,14],[4,9,q.includes('6')?9:11,14],[4,7,q.includes('6')?9:11,q.includes('#11')?18:21],[4,9,q.includes('6')?9:11,14]];
 else sets=[[4,10,14,21],[4,7,10,14],[4,9,10,14],[4,10,14,18]];
 if(q.startsWith('-')&&q.includes('^'))sets=sets.map(a=>a.map(n=>n===10?11:n));if(q.startsWith('-')&&q.includes('6'))sets=sets.map(a=>a.map(n=>n===10?9:n));
 if(quartal&&q.startsWith('-')&&!q.startsWith('h'))sets=[[5,10,15],[10,15,21,26],[3,9,14,19],...sets];
 const pool=[];for(const set of sets){const pcs=[...new Set(set.map(n=>mod(n+r)))];if(!guides.every(p=>pcs.includes(p)))continue;for(let low=c.piano.low;low<=66;low++){if(!pcs.includes(mod(low)))continue;let v=[low];for(let n=low+1;n<=c.piano.topHigh;n++)if(pcs.includes(mod(n))&&v.length<Math.min(4,pcs.length))v.push(n);if(energy<.25)v=v.filter(n=>guides.includes(mod(n)));if(v.length<2||v.at(-1)<c.piano.topLow||v.at(-1)>c.piano.topHigh)continue;if(v[0]<52&&v.some((n,i)=>i&&n-v[i-1]<3))continue;if(bassNote!==null&&mod(bassNote)===r&&v.some(n=>mod(n)===r))continue;if(!guides.every(p=>v.some(n=>mod(n)===p)))continue;const key=v.join();if(!pool.some(x=>x.notes.join()===key))pool.push({notes:v,quartal:quartal&&sets.indexOf(set)<3,guidePcs:guides});}}
 const score=v=>(previous.length?movement(v.notes,previous):Math.abs(v.notes.reduce((a,b)=>a+b,0)/v.notes.length-62)*.1)-v.notes.filter(n=>previous.includes(n)).length*c.piano.commonReward;
 return pool.sort((a,b)=>score(a)-score(b)).slice(0,c.piano.maxCandidates);}
export function makeCompState(){return {previous:[],history:[],pairs:[],anticipations:{},carry:[],lastGesture:null,consecutive:0,lastAttack:null};}
export function chooseCompBar(bar,next,state,drums,data,options,rng,c,bassNote){
 if(!['swing','waltz','ballad'].includes(bar.family))return chooseOtherCompBar(bar,next,state,drums,data,options,rng,c,bassNote);
 const density=c.comp.density*c.piano.density*(.25+1.5*(bar.activity?.comp??.5));
 const phrase=compPhraseItems(bar,state),items=phrase.items.filter((x,i)=>density>=.7||i%2===0).map(x=>({...x})),changed=bar.harmonicStart||bar.absolute===0;
 if(changed&&state.anticipated!==bar.id&&!items.some(x=>x.at===0))items.unshift({at:0,length:Math.min(2,bar.beats),velocity:58,roll:.04});
 for(let i=1;i<bar.spans.length;i++){const at=bar.spans[i].beat;if(!items.some(x=>Math.abs(x.at-at)<.05))items.push({at,length:.9,velocity:62,roll:0});}
 if(density>1.4&&!items.some(x=>x.at===1.5))items.push({at:1.5,length:.4,velocity:58,roll:0});
 items.sort((a,b)=>a.at-b.at);const events=[],attacks=[];
 for(let ai=0;ai<items.length;ai++){const x=items[ai],anticipation=next?.harmonicStart&&x.at>=bar.beats-.5,span=anticipation?next.spans[0]:bar.spans.findLast(s=>s.beat<=x.at)||bar.spans[0];if(span.chord?.kind!=='chord')continue;
 const same=state.symbol===span.symbol,modal=bar.spanLength>=8&&span.chord.quality.startsWith('-'),hold=x.length>=1.5;
 let pool=modal?spreadVoicings(span.chord,state.previous,true):voicingPool(span.chord,state.previous,bar.energy,c,{hold,bassNote}).map(v=>v.notes);if(!pool.length)pool=spreadVoicings(span.chord,state.previous,false);if(!pool.length)continue;
 let voice=same&&state.previous.length&&bar.absolute-(state.voicedBar??-99)<2?state.previous:pool[0];if(modal&&(!same||bar.absolute-(state.voicedBar??-99)>=2)){const alternatives=pool.filter(v=>v.join()!==state.previous.join());voice=alternatives[0]||voice;}
 const at=x.at,length=Math.min(x.length,items[ai+1]?items[ai+1].at-at-.03:x.length),attackId=bar.id+':'+ai,roll=Math.min(70,(x.roll||0)*60000/bar.tempo),guides=modal?[]:guidePcs(span.chord),velocity=x.velocity+(bar.energy-.5)*8;
 if(length<=0)continue;attacks.push({at,length,voicing:voice,gesture:phrase.id,harmony:span.symbol,anticipation,rollMs:roll,attackId});for(let i=0;i<voice.length;i++)events.push({role:'comp',instrument:'piano',midi:voice[i],at,length,velocity:velocity+(i===voice.length-1?6:-2),intent:anticipation?'anticipation':hold?'hold':'comp',gesture:phrase.id,shape:'statement-answer',attackId,harmony:span.symbol,guidePcs:guides,voicingKind:modal?'modal-quartal':'rootless',rollOffsetMs:roll*i/Math.max(1,voice.length-1),release:hold?c.render.pianoHoldRelease:c.render.pianoRelease});
 if(!same||voice!==state.previous)state.voicedBar=bar.absolute;state.previous=voice;state.symbol=span.symbol;if(anticipation)state.anticipated=next.id;
 }
 return {events,attacks,gesture:phrase.id,arc:'statement-answer'};
}

function chooseOtherCompBar(bar,next,state,drums,data,options,rng,c,bassNote){
 const ballad=bar.family==='ballad',bank=data.motifs.filter(m=>m.role==='comp'),pos=bar.sectionBar%8,arc=bar.phraseArc||'build';
 const plannedAnticipation=bar.anticipated,upcoming=next?.anticipated&&next.harmonicStart;
 let pool=bank.filter(m=>m.id!==state.lastGesture||state.consecutive<2);pool=pool.filter(m=>!state.history.slice(-4).includes(m.id));if(!pool.length)pool=bank;
 const sparse=pos===3||pos===7,holdBar=ballad||pos%4===0||rng()<c.piano.holdProbability;const arcScale=({build:c.piano.arcDensity[bar.phraseBar],steady:1,'call-answer':bar.phraseBar%2?.7:1.2,'sparse-active':bar.phraseBar<2?.65:1.2,'lay-out':.6})[arc]??1;const density=c.piano.density*c.comp.density*(.25+1.5*(bar.activity?.comp??.5))*(1+((options.intensity??.5)-.5)*c.piano.intensityDensity)*arcScale;
 if(sparse){const p=pool.filter(m=>m.events.length===1);if(p.length)pool=p;}
 else if(holdBar){const p=pool.filter(m=>m.events.some(e=>e.length>=2*960));if(p.length)pool=p;}
 else{const p=pool.filter(m=>m.events.length>=2&&m.events.length<=3);if(p.length)pool=p;}
 let motif=pool[Math.floor(rng()*pool.length)],items=motif.events.filter(e=>e.at<bar.beats*960).map(e=>({at:e.at/960,length:e.length/960,intent:e.intent}));if(state.carry.length&&!bar.isSection){items=state.carry;state.carry=[];motif=bank.find(m=>m.id===state.carryGesture)||motif;}else{state.carry=motif.events.filter(e=>e.at>=bar.beats*960&&e.at<bar.beats*1920).map(e=>({at:e.at/960-bar.beats,length:e.length/960,intent:e.intent}));state.carryGesture=motif.id;}if(ballad){items=[{at:bar.anticipated?1.5:0,length:c.piano.balladHold,intent:'voiceCurrent'}];}else{const wanted=Math.max(1,Math.min(4,Math.round(items.length*density)));while(items.length>wanted)items.splice(Math.floor(rng()*items.length),1);while(items.length<wanted){const at=[.5,1.5,2.5,3.5][Math.floor(rng()*4)];if(at<bar.beats&&!items.some(x=>x.at===at))items.push({at,length:.35+rng()*.9,intent:'voiceCurrent'});else break;}}
 // Harmony coverage and carries are arranged before pitches, not forced at every tick.
 const changed=bar.harmonicStart||bar.isSection;
 if(changed&&!plannedAnticipation){if(!items.some(x=>x.at===0))items.unshift({at:0,length:holdBar?2:.4,intent:'voiceCurrent'});}
 if(plannedAnticipation)items=items.filter(x=>x.at!==0);
 for(let si=1;si<bar.spans.length;si++){const change=bar.spans[si].beat;if(!items.some(x=>Math.abs(x.at-change)<.001||Math.abs(x.at-change+.5)<.001))items.push({at:drums.fill&&change>=drums.fill.start?change-.5:change,length:Math.min(1.75,bar.beats-change),intent:'spanChange',spanIndex:si});}
 if(sparse&&plannedAnticipation&&bar.spans.length>1)items=items.filter(x=>x.spanIndex!==undefined||x.at>=bar.spans[1].beat).slice(0,1);
 if(!items.length&&!sparse)items=[{at:bar.spans.length>1?bar.spans[1].beat:1.5,length:Math.min(2,bar.beats-1.5),intent:'voiceCurrent'}];
 if(drums.fill)items=items.filter(x=>x.at<drums.fill.start||x.at===bar.beats-.5&&upcoming);
 if(upcoming){items=items.filter(x=>x.at<bar.beats-.5&&(!ballad||x.at===0&&rng()<c.piano.balladDensity-1));items.push({at:bar.beats-.5,length:Math.min(2.4,(next.spans[1]?.beat??next.beats)+.4),intent:'voiceNext'});}
 if(!changed&&!plannedAnticipation&&!upcoming&&sparse&&rng()<c.piano.restProbability)items=[];
 items=items.filter(x=>x.at>=0&&x.at<bar.beats).sort((a,b)=>a.at-b.at).slice(0,5);
 // Avoid duplicate onset/length pairs, including accidental duplicates after coverage patches.
 items=items.filter((x,i)=>!i||x.at!==items[i-1].at);const events=[],attacks=[];
 for(let ai=0;ai<items.length;ai++){const x=items[ai],anticipation=x.intent==='voiceNext',span=anticipation?next?.spans[0]:x.spanIndex!==undefined?bar.spans[x.spanIndex]:bar.spans.findLast(s=>s.beat<=x.at+.001)||bar.spans[0];if(!span?.chord||span.chord.kind!=='chord')continue;const spanEnd=anticipation?bar.beats+(next.spans[1]?.beat??next.beats):bar.spans.find(s=>s.beat>x.at+.001)?.beat??bar.beats;let len=Math.min(x.length,spanEnd-x.at-.015);if(len<=0)continue;const isHold=len>=1.5,quartal=bar.spanLength>=4&&rng()<c.piano.quartalProbability;
 let candidates=voicingPool(span.chord,state.previous,bar.energy,c,{quartal,hold:isHold,bassNote});if(!candidates.length)continue;const different=candidates.filter(v=>v.notes.join()!==state.previous.join());if(different.length&&rng()<c.piano.voicingVariation)candidates=different;
 const score=v=>(state.previous.length?movement(v.notes,state.previous):0)+(v.notes.join()===state.previous.join()?c.piano.repeatCost:0);candidates.sort((a,b)=>score(a)-score(b));const best=candidates[0],near=candidates.filter(v=>score(v)<=score(best)+c.piano.temperature*(options.aliveness??.7));const voice=near[Math.floor(rng()*near.length)]||best;
 const roll=(ballad&&isHold||motif.tags?.roll)&&isHold?c.piano.rollMinMs+(c.piano.rollMaxMs-c.piano.rollMinMs)*rng():0;
 const attackId=bar.id+':'+ai,velocity=c.piano.velocity+(bar.energy-.5)*12+(rng()*2-1)*c.piano.voicingVelocitySpread-(isHold?c.piano.holdSoftening:0)+(anticipation?c.piano.pushAccent:0);
 const attack={at:x.at,length:len,voicing:voice.notes,gesture:motif.id,harmony:span.symbol,anticipation,rollMs:roll,quartal:voice.quartal,attackId};attacks.push(attack);
 for(let i=0;i<voice.notes.length;i++)events.push({role:'comp',instrument:'piano',midi:voice.notes[i],at:x.at,length:len,velocity:velocity+(i===voice.notes.length-1?c.piano.topAccent:0),intent:anticipation?'anticipation':isHold?'hold':len<=.5?'stab':'comp',gesture:motif.id,shape:arc,attackId,harmony:span.symbol,guidePcs:voice.guidePcs,voicingKind:voice.quartal?'quartal':'rootless',rollOffsetMs:roll*i/Math.max(1,voice.notes.length-1),release:ballad&&isHold?c.render.pianoHoldRelease:c.render.pianoRelease});state.previous=voice.notes;state.lastAttack=attack;
 }
 state.consecutive=state.lastGesture===motif.id?state.consecutive+1:1;state.lastGesture=motif.id;state.history.push(motif.id);state.history=state.history.slice(-8);return {events,attacks,gesture:motif.id,arc};
}
