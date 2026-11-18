import {clamp,rngFor} from './band-config.js';
// One phrase arc scales the player's roles. It never removes pulse anchors.
export function shapeDrums(plan,bar,options,c){
 const amount=clamp(options.drumsGhosts??.65,0,1),r=rngFor(bar.roleSeeds?.drums??bar.phraseSeed,'ghost-conversation',bar.absolute);
 const events=plan.events.filter(e=>e.intent!=='ghost'||r()<Math.min(1,amount/.65)).map(e=>({...e}));
 const electric=['funk','rock','shuffle'].includes(bar.family),activity=bar.activity?.drums??.5;
 if(electric&&bar.phraseBar%2===1&&r()<amount*(.5+activity)){
  const idea=bar.family==='funk'?[.75,2.75]:bar.family==='shuffle'?[.5,2.5]:[2.5];
  for(const at of idea)if(at<bar.beats&&(!plan.fill||at<plan.fill.start)&&!events.some(e=>['snare','rim'].includes(e.instrument)&&Math.abs(e.at-at)<.18))events.push({role:'drums',instrument:'snare',midi:38,at,length:.07,velocity:c.drums.ghost,intent:'ghost',gesture:'backbeat-pickup',shape:'ghost-answer'});
 }
 const phrase=c.drumFeel.phraseVelocity[bar.phraseBar%c.drumFeel.phraseVelocity.length],lift=(bar.section==='B'?2:0)+Math.min(4,bar.chorus*1.5),depth=c.drumFeel.dynamicDepth;
 for(const e of events){
  const ghost=e.intent==='ghost',skip=e.intent==='time'&&!Number.isInteger(e.at),backbeat=e.gesture==='backbeat',fill=e.intent==='fill';
  // Keep ghosts below all full snare strokes; hat skips remain below quarters.
  e.velocityMin=ghost?18:backbeat?70:fill?45:1;
  e.velocityMax=ghost?44:skip?e.instrument==='ride'?c.drums.rideMain-12:c.drums.hatMain-12:backbeat?112:116;
  const rise=(phrase+lift)*depth*(ghost?.35:e.instrument==='kick'?.5:1);
  e.velocity=clamp(e.velocity+rise,e.velocityMin,e.velocityMax);
 }
 return {...plan,events};
}
