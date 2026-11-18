import {rngFor} from './band-config.js';
export function bassGhostNotes(events,bar,options,c){
 const amount=options.bassGhosts??.3;
 if(!events.length||amount<=0||bar.isSection)return events;
 const d=c.expression,activity=bar.activity?.bass??.5,r=rngFor(bar.roleSeeds?.bass??bar.phraseSeed,'bass','ghost-pickup',bar.absolute);
 // A muted pickup answers the line at a two-bar boundary. Funk may also use a
 // sixteenth pickup into the middle of a bar; never displace a pitched arrival.
 if(bar.phraseBar%2===0||r()>amount*(.5+activity))return events;
 const positions=bar.family==='funk'?[bar.beats-.25,1.75]:bar.family==='rock'?[bar.beats-.5,1.5]:[bar.beats-.5];
 const candidates=positions.filter(at=>at>0&&at<bar.beats).map(at=>({at,previous:events.findLast(e=>e.at<at),following:events.find(e=>e.at>=at)})).filter(({at,previous,following})=>previous&&previous.intent!=='ghost'&&at-previous.at>=d.ghostMinGap&&(!following||following.at-at>=d.ghostMinGap));
 if(!candidates.length)return events;
 const {at,previous}=candidates[Math.floor(r()*candidates.length)],result=events.map(e=>({...e})),note=result.find(e=>e.at===previous.at);
 note.length=Math.min(note.length,at-note.at-d.ghostReleaseGap);
 result.push({...previous,at,length:d.ghostLength,velocity:d.ghostVelocity+r()*d.ghostVelocitySpread,intent:'ghost',gesture:'muted-pickup',articulation:'dead-note',release:d.ghostRelease});
 return result.sort((a,b)=>a.at-b.at);
}
