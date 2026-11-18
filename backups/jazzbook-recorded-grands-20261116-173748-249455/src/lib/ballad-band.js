import {clamp,rngFor} from './band-config.js';
export function balladDrums(bar,state,options,c){const d=c.balladBand,r=rngFor(bar.roleSeeds?.drums??bar.phraseSeed,'drums','ballad',bar.absolute),events=[],activity=bar.activity?.drums??.5,delta=(bar.energy-.5)*d.dynamicRange,push=(instrument,midi,at,velocity,intent='time')=>{if(at>=0&&at<bar.beats)events.push({role:'drums',instrument,midi,at,length:.14,velocity:Math.round(clamp(velocity+delta,1,127)),intent,gesture:'ballad-pocket',shape:'soft-backbeat'});};
 const step=activity<.25?1:.5;
 for(let at=0;at<bar.beats;at+=step)push('hat',42,at,Number.isInteger(at)?d.hatQuarter:d.hatEighth);
 for(const at of [0,2])push('kick',36,at,d.kick,'anchor');for(const at of bar.beats===3?[2]:[1,3]){push('rim',37,at,d.rimAccent,'anchor');push('footHat',44,at,d.foot,'anchor');}
 if(activity>.4&&bar.phraseBar%2===1&&r()<d.ghostChance*activity)push('snare',38,bar.beats-1.5,d.ghost,'ghost');
 let fill=null;if(bar.phraseEnd&&bar.sectionEnd&&bar.absolute-(state.lastFill??-99)>=d.fillCooldown&&r()<d.fillChance){fill={start:bar.beats-.5,length:.5};state.lastFill=bar.absolute;push('snare',38,bar.beats-.5,d.fill,'fill');}
 return {events,fill,index:0,energy:bar.energy,dynamic:delta,grammar:true};}
export function balladBass(events,bar,options,c){if(bar.family!=='ballad')return events;const sound=options.bassTone??(options.keepBandInstruments||options.balladPrecision===false?null:'precision');if(sound!=='precision')return events;const d=c.balladBand,r=rngFor(bar.roleSeeds?.bass??bar.phraseSeed,'bass','ballad-slap',bar.absolute),amount=options.balladSlaps??d.slapChance;let chosen=-1;if(!bar.isSection&&bar.phraseBar%2===1&&r()<amount)chosen=events.findLastIndex(e=>e.intent!=='ghost'&&e.at>0);
 return events.map((e,i)=>({...e,bassSound:'precision',...(i===chosen?{articulation:'slap',length:Math.min(e.length,d.slapLength),velocity:Math.min(d.slapMaxVelocity,e.velocity+d.slapAccent)}:{})}));}
