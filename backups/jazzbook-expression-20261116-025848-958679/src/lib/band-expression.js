import {rngFor} from './band-config.js';
export function bassGhostNotes(events,bar,options,c){const amount=options.bassGhosts??.3;if(!events.length||amount<=0||bar.isSection)return events;const d=c.expression,activity=bar.activity?.bass??.5,r=rngFor(bar.roleSeeds?.bass??bar.phraseSeed,'bass','ghost-pickup',bar.absolute);if(bar.phraseBar%2===0||r()>amount*(.5+activity))return events;
 const at=bar.beats-.5,previous=events.findLast(e=>e.at<at),following=events.find(e=>e.at>=at);if(!previous||previous.intent==='ghost'||following||at-previous.at<d.ghostMinGap)return events;
 const result=events.map(e=>({...e})),note=result.find(e=>e.at===previous.at);note.length=Math.min(note.length,at-note.at-d.ghostReleaseGap);
 result.push({...previous,at,length:d.ghostLength,velocity:d.ghostVelocity+r()*d.ghostVelocitySpread,intent:'ghost',gesture:'muted-pickup',articulation:'dead-note',release:d.ghostRelease});return result;
}
