import stats from './groove-stats.json' with {type:'json'};
import {clamp} from './band-config.js';
export function humanize(event,instrument,styleGroup,rng,context){
 const {config:c,tempo,looseness,sharedMs}=context,h=c.human,role=event.role;
 if(event.role==='click')return {...event,performedTick:event.authoredTick};
 const velocitySample=stats.groups[styleGroup==='swing'||styleGroup==='ballad'||styleGroup==='waltz'?'jazz':styleGroup==='bossa'?'latin':styleGroup]?.[instrument]?.[Math.floor(event.position*4)%16];
 const roleMs=role==='comp'?h.compBehindMs:role==='bass'?h.bassAheadMs:instrument==='ride'?h.rideAheadMs:0;
 let offset=roleMs+(sharedMs+(rng()*2-1)*h[role==='comp'?'compMs':role==='bass'?'bassMs':'drumsMs'])*looseness*Math.min(1,120/tempo);
 if(velocitySample&&['funk','rock','latin','bossa'].includes(styleGroup))offset+=clamp(velocitySample.offset16[0],-h.gmdLimitMs,h.gmdLimitMs)*h.gmdTimingMix*looseness;
 offset=clamp(offset,-h.maxRoleOffsetMs,h.maxRoleOffsetMs);
 const envelope=c.expression[role+'Phrase'],phraseAccent=envelope?envelope[(context.phraseBar??0)%envelope.length]*(context.expression??.65):0;
 let velocity=event.velocity+phraseAccent+(rng()*2-1)*h.velocitySpread*looseness;
 if(velocitySample)velocity+=(velocitySample.velocity[0]-velocity)*h.gmdVelocityMix*looseness;
 // Structural velocity categories remain intact even after dataset blending.
 if(event.intent==='ghost')velocity=Math.min(velocity,role==='bass'?c.expression.bassGhostCeiling:c.drums.backbeat-c.drums.ghost);
 const duration=Math.round(event.duration*(1+(rng()*2-1)*h.lengthSpread*looseness));
 return {...event,performedTick:Math.max(0,Math.round(event.authoredTick+offset*tempo*c.ppq/60000)),duration:Math.max(1,duration),velocity:Math.round(clamp(velocity,event.velocityMin??1,event.velocityMax??127))};
}
