// Original Vesper gestures. No upstream pattern/groove files are inputs.
import fs from 'node:fs';
const ppq=960;
const event=(beat,len,intent,accent=0,instrument)=>({at:Math.round(beat*ppq),length:Math.round(len*ppq),intent,accent,...(instrument?{instrument}:{})});
const specs={
 swing:{meter:[4,4],comp:[[.5,2],[1.5,3],[0,2.5],[2.5],[0,1.5,3.5],[]],bass:[[0,1,2,3],[0,2],[0,1,2,3]],drums:[[0,1,1.5,2,3,3.5],[0,1,2,2.5,3,3.5]],keeper:'ride'},
 ballad:{meter:[4,4],comp:[[0],[1.5],[2.5],[],[.5,3],[]],bass:[[0,2],[0],[0,2.5]],drums:[[0,2],[0,1,2,3]],keeper:'ride'},
 waltz:{meter:[3,4],comp:[[0,1.5],[1,2.5],[.5,2],[],[0]],bass:[[0,1,2],[0,2],[0,1.5]],drums:[[0,1,1.5,2],[0,.5,1,2,2.5]],keeper:'ride'},
 bossa:{meter:[4,4],comp:[[0,1.5,3],[.5,2,3.5],[0,2.5],[1,2.5,3.5],[]],bass:[[0,1.5,2,3.5],[0,1.5,2,3.5],[0,2,3.5]],drums:[[0,.5,1,1.5,2,2.5,3,3.5],[0,.5,1,1.5,2,2.5,3,3.5]],keeper:'hat'},
 latin:{meter:[4,4],comp:[[0,1.5,2.5],[.5,2,3.5],[0,1,2.5,3.5],[1.5,3],[]],bass:[[0,1.5,2.5],[0,1.5,3],[0,2,3.5]],drums:[[0,.5,1,1.5,2,2.5,3,3.5],[0,1,1.5,2,2.5,3.5]],keeper:'ride'},
 funk:{meter:[4,4],comp:[[.5,1.75,3],[0,1.5,2.75],[.75,2,3.5],[1.5,3.75],[]],bass:[[0,.75,1.5,2.5,3.5],[0,1.5,2.75,3.5],[0,.75,2,3.25]],drums:[[0,.5,1,1.5,2,2.5,3,3.5],[0,.5,1,1.5,2,2.5,3,3.5]],keeper:'hat'},
 rock:{meter:[4,4],comp:[[0,2],[0,1.5,3],[.5,2.5],[0,2.5,3.5],[]],bass:[[0,1,2,3],[0,1.5,2,3.5],[0,2,3]],drums:[[0,.5,1,1.5,2,2.5,3,3.5],[0,.5,1,1.5,2,2.5,3,3.5]],keeper:'hat'},
 shuffle:{meter:[4,4],comp:[[0,1.5,2,3.5],[.5,2.5],[1,3],[0,2.5],[]],bass:[[0,1,2,3],[0,1.5,2,3.5],[0,1,2.5,3]],drums:[[0,.5,1,1.5,2,2.5,3,3.5],[0,.5,1,1.5,2,2.5,3,3.5]],keeper:'ride'},
 afro:{meter:[12,8],comp:[[0,1.5,3],[.5,2,4.5],[0,2.5,4.5],[],[1,2.5,4]],bass:[[0,1.5,3,4.5],[0,1,3,4.5],[0,1.5,3,5.5]],drums:[[0,.5,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5],[0,.5,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5]],keeper:'ride'}
};
for(const [id,s] of Object.entries(specs)){
 const beats=s.meter[0]*4/s.meter[1],motifs=[];s.drums.push(id==='afro'?[0,1.5,3,4.5]:Array.from({length:Math.ceil(beats)},(_,i)=>i));
 for(const role of ['bass','comp','drums'])s[role].forEach((positions,i)=>{
  const bars=role==='comp'&&i===1?2:1,all=bars===2?[...positions,...positions.map(p=>p+beats+.5).filter(p=>p<beats*2)]:positions;
  motifs.push({id:id+'-'+role+'-'+i,role,bars,weight:1,energy:[0,1],function:role==='drums'?'time':i===0?'arrival':'support',events:all.map((b,k)=>event(b,role==='comp'?(id==='ballad'?1.4:.65):role==='bass'?.8:.1,role==='comp'?'voiceCurrent':role==='bass'?(k===0?'anchor':'member'):'strike',k===0?.2:0,role==='drums'?s.keeper:undefined)).map(e=>({...e,length:Math.min(e.length,bars*beats*ppq-e.at)}))});
 });
 motifs.push({id:id+'-comp-anticipation',role:'comp',bars:1,weight:1,energy:[0.3,1],function:'answer',events:[event(beats-.5,.35,'voiceNext',.1)]});
 fs.writeFileSync(new URL('../src/lib/styles/'+id+'.json',import.meta.url),JSON.stringify({version:1,id,ppq,meter:s.meter,pulseGroups:s.meter[1]===8?Array(s.meter[0]/3).fill(3):Array(s.meter[0]).fill(1),tempoRange:[40,360],cycleBars:2,parts:{bass:{range:[28,55],mode:'auto'},comp:{range:[48,84],maxVoices:4},drums:{timekeeper:s.keeper}},motifs,variation:{memoryBars:3,phraseBars:4,fillMaxBeats:2},humanize:{timingLimitMs:9,velocitySpread:5,lengthSpread:.08}},null,2)+'\n');
}
