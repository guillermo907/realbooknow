import {rngFor,clamp} from './band-config.js';
// Authored two-bar statements/answers. Position is in quarter-note beats;
// the ordinary planner applies swing and expression after orchestration.
const ideas=[
 [[['snare',1.5,'ghost']],[['snare',2.5,'accent'],['kick',3.5,'reply']]],
 [[['snare',.5,'ghost'],['snare',2,'accent']],[['snare',1.5,'ghost']]],
 [[['kick',2.5,'reply']],[['snare',.5,'ghost'],['snare',2.5,'accent']]],
 [[],[['snare',1.5,'accent'],['snare',2.5,'ghost']]],
 [[['snare',2.5,'ghost']],[['kick',.5,'reply'],['snare',1.5,'accent']]],
 [[['snare',1,'accent'],['snare',1.5,'ghost']],[]],
 [[['snare',.5,'ghost']],[['snare',2,'accent'],['kick',2.5,'reply']]],
 [[],[['snare',.5,'ghost'],['snare',1.5,'ghost'],['snare',2.5,'accent']]]
];
const midi={snare:38,kick:36,ride:51,rideBell:53,openHat:46,tom:45};
export function orchestrateSwing(plan,bar,state,c){
 const d=c.drumConversation,group=Math.floor(bar.sectionBar/2),key=bar.sectionInstance+':'+group;
 if(state.conversationKey!==key){const r=rngFor(bar.phraseSeed,'drums','conversation',group),recent=state.conversationHistory||[],available=ideas.map((_,i)=>i).filter(i=>!recent.slice(-d.memory).includes(i));state.conversationIdea=available[Math.floor(r()*available.length)]??0;state.conversationHistory=[...recent,state.conversationIdea].slice(-d.memory);state.conversationKey=key;state.conversationActive=r()<Math.min(d.maxDensity,d.density*(d.openingDensity+bar.energy));}
 const r=rngFor(bar.phraseSeed,'drums','orchestration',bar.absolute),events=plan.events.map(e=>({...e}));
 const add=(instrument,at,velocity,intent,gesture)=>{if(at<0||at>=bar.beats||events.some(e=>e.instrument===instrument&&Math.abs(e.at-at)<.05))return;events.push({role:'drums',instrument,midi:midi[instrument],at,length:instrument==='openHat'?d.openHatLength:.13,velocity:Math.round(clamp(velocity,1,127)),intent,gesture,shape:'conversation-'+state.conversationIdea});};
 // Preserve every quarter ride pulse and foot-hat anchor. Additional skips
 // answer a phrase instead of turning every bar into an eighth-note stream.
 if(bar.phraseBar%2===1&&r()<d.rideAnswerChance){const at=bar.beats===3?2.5:r()<.5?1.5:3.5;add('ride',at,c.drums.rideSkip+plan.dynamic*.5,'time','ride-answer');}
 if(state.conversationActive){for(const [instrument,at,kind] of ideas[state.conversationIdea][bar.sectionBar%2]){if(plan.fill&&at>=plan.fill.start)continue;const velocity=(kind==='ghost'?d.ghost:kind==='accent'?d.snareAccent:d.kickReply)+plan.dynamic*d.supportDynamic;add(instrument,at,velocity,kind==='ghost'?'ghost':'support','two-bar-conversation');}}
 // Bell accents occur on existing quarter notes; no extra simultaneous ride.
 if(bar.chorus>0&&bar.phraseBar===2&&r()<d.bellChance){const e=events.find(e=>e.instrument==='ride'&&e.at===2);if(e){e.instrument='rideBell';e.midi=midi.rideBell;e.velocity=Math.min(e.velocity,d.bellVelocity);e.gesture='cymbal-color';}}
 let fill=plan.fill;const structural=bar.sectionEnd||bar.harmonicEnd||(bar.sectionBar+1)%d.fillCooldown===0;
 const eligible=bar.phraseEnd&&structural&&bar.absolute-(state.conversationFill??-99)>=d.fillCooldown;
 if(eligible&&(fill||r()<d.fillFrequency)){
  const length=bar.sectionEnd||bar.harmonicEnd?d.transitionBeats:d.phraseFillBeats,start=bar.beats-length;
  fill={start,length};state.conversationFill=bar.absolute;
  // Replace competing support strokes; keep the cymbal pulse and foot time.
  for(let i=events.length-1;i>=0;i--)if(events[i].at>=start&&!['ride','rideBell','footHat'].includes(events[i].instrument))events.splice(i,1);
  const triplets=r()<d.tripletFillChance,step=triplets?1/3:.5;let n=0;
  for(let at=start;at<bar.beats-.01;at+=step){const instrument=n++%3===2?'tom':'snare';add(instrument,at,d.fillVelocity+(n%2?d.fillAccent:0)+plan.dynamic*.5,'fill',triplets?'triplet-transition':'swing-transition');}
 }else if(bar.phraseBar===3&&r()<d.openHatChance&&!fill)add('openHat',bar.beats-.5,d.openHatVelocity,'support','phrase-lift');
 return {...plan,events,fill,relaxBand:!!plan.fill};
}
