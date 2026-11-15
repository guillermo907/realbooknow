import {rngFor,clamp} from './band-config.js';
// Full-bar breaks are a deliberate arrangement decision, independent of
// busyness. Missing/short source phrases must not masquerade as breaks.
export function applyDrumBreaks(plan,bar,state,options,c){
 const amount=clamp(options.drumsBreaks??0,0,1),d=c.drumBreaks,r=rngFor(bar.roleSeeds?.drums??bar.phraseSeed,'drums','break',bar.absolute);
 if(bar.isSection||bar.sectionEnd||amount===0)state.drumBreakUntil=-1;
 const eligible=amount>0&&!bar.isSection&&!bar.sectionEnd&&bar.phraseBar===d.startPhraseBar&&bar.absolute>=(state.drumBreakNext??0);
 if(eligible&&r()<amount){const length=r()<amount*d.twoBarChance?d.maxBars:1;state.drumBreakUntil=bar.absolute+length;state.drumBreakNext=bar.absolute+length+d.cooldownBars;}
 const silent=amount>0&&bar.absolute<(state.drumBreakUntil??-1),relaxBand=plan.relaxBand??!!plan.fill;
 if(silent)return {...plan,events:[],fill:null,relaxBand,drumBreak:true};
 const events=[...plan.events],hasTime=events.some(e=>['ride','rideBell','hat','openHat'].includes(e.instrument));
 if(!hasTime&&!plan.fill){const jazz=['swing','waltz','ballad','shuffle'].includes(bar.family);for(let beat=0;beat<bar.beats;beat++)events.push({role:'drums',instrument:jazz?'ride':'hat',midi:jazz?51:42,at:beat,length:.2,velocity:jazz?c.drums.rideMain:c.drums.hatMain,intent:'time',gesture:'continuous-time',shape:'groove'});}
 return {...plan,events,relaxBand,drumBreak:false};
}
