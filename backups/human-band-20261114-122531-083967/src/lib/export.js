import {rhythmStep,stepDuration} from './rhythm.js';
import {pattern} from './accompaniment.js';
import {buildPlan} from './plan.js';
import {parseChart} from './parser.js';
import {parseChord,voiceChord,pitch,transposeChord,intervals as intervalsForMidi} from './chords.js';
const xml=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export function musicXML(song){const bars=parseChart(song.chart).measures;let meter=[4,4];return '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd"><score-partwise version="4.0"><work><work-title>'+xml(song.title)+'</work-title></work><identification><creator type="composer">'+xml(song.composer)+'</creator></identification><part-list><score-part id="P1"><part-name>Changes</part-name></score-part></part-list><part id="P1">'+bars.map((m,i)=>{if(m.meter)meter=m.meter;let out='<measure number="'+(i+1)+'"><attributes><divisions>24</divisions><time><beats>'+meter[0]+'</beats><beat-type>'+meter[1]+'</beat-type></time><clef><sign>G</sign><line>2</line></clef></attributes>';if(m.section)out+='<direction><direction-type><rehearsal>'+xml(m.section)+'</rehearsal></direction-type></direction>';for(const e of m.events){if(!e.symbol)continue;let c=parseChord(e.symbol);if(c.kind!=='chord')continue;let quality=c.quality,kind=quality.includes('h')||quality.includes('-7b5')?'half-diminished':quality.includes('o7')?'diminished-seventh':quality.includes('o')?'diminished':quality.includes('^7')?'major-seventh':quality.includes('-7')?'minor-seventh':quality.startsWith('-')?'minor':quality.includes('sus')?'suspended-fourth':/7|9|13/.test(quality)?'dominant':quality==='+'?'augmented':'major';out+='<harmony><root><root-step>'+c.root[0]+'</root-step>'+(c.root.length>1?'<root-alter>'+(c.root.includes('b')?-1:1)+'</root-alter>':'')+'</root><kind text="'+xml(quality)+'">'+kind+'</kind>'+(c.bass?'<bass><bass-step>'+c.bass[0]+'</bass-step>'+(c.bass.length>1?'<bass-alter>'+(c.bass.includes('b')?-1:1)+'</bass-alter>':'')+'</bass>':'')+'</harmony>';}out+='<note><rest measure="yes"/><duration>'+24*meter[0]*4/meter[1]+'</duration></note>';if(m.left==='{')out+='<barline location="left"><repeat direction="forward"/></barline>';if(m.ending!=null)out+='<barline location="left"><ending number="'+m.ending+'" type="start"/></barline>';if(m.right==='}')out+='<barline location="right"><repeat direction="backward"/></barline>';for(const comment of m.comments)out+='<direction><direction-type><words>'+xml(comment.text)+'</words></direction-type></direction>';return out+'</measure>';}).join('')+'</part></score-partwise>';}
const variable=n=>{let b=[n&127];while(n>>=7)b.unshift((n&127)|128);return b;};const u32=n=>[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255];
function track(events){events.sort((a,b)=>a.tick-b.tick);let bytes=[],last=0;for(const event of events){const tick=Math.max(last,Math.round(event.tick));bytes.push(...variable(tick-last),...event.data);last=tick;}bytes.push(0,255,47,0);return [77,84,114,107,...u32(bytes.length),...bytes];}
export function midi(song,settings){
 const plan=buildPlan(song,{choruses:settings.choruses||1}),conductor=[],harmony=[],bass=[],drums=[];
 const text=s=>[...new TextEncoder().encode(s)];
 const label=(events,name)=>events.push({tick:0,data:[255,3,...variable(text(name).length),...text(name)]});
 label(conductor,song.title);label(harmony,'Vesper comping');label(bass,'Vesper bass');label(drums,'Vesper drums');
 harmony.push({tick:0,data:[192,0]},{tick:0,data:[194,0]});bass.push({tick:0,data:[193,32]});
 for(const [part,channel,events] of [['chords',0,harmony],['harmony',2,harmony],['bass',1,bass],['drums',9,drums]]){
  events.push({tick:0,data:[176+channel,7,Math.round(127*(settings.master??.65)*(settings[part]??(part==='harmony'?0:.5)))]});
 }
 const note=(events,channel,midi,tick,duration,velocity)=>events.push({tick,data:[144+channel,midi,Math.max(1,Math.min(127,Math.round(velocity)))]},{tick:tick+Math.max(1,duration),data:[128+channel,midi,0]});
 const countBars=settings.countIn==='auto'?(song.tempo>140?2:1):Number(settings.countIn)||0;
 let tick=(plan[0]?.beats||4)*480*countBars,lastTempo=null,lastMeter='',stepTick=tick,stepTime=0,tempoForNote=song.tempo;
 for(let beat=0;beat<(plan[0]?.beats||4)*countBars;beat++)note(drums,9,37,beat*480,45,75);
 const drumNotes={ride:51,hat:42,pedal:44,kick:36,snare:38,rim:37,click:37,keynote:37};
 const player={settings,previous:[],tone(midi,time,duration,part,level,velocity){
  if((settings[part]??(part==='harmony'?0:.5))<=0)return;
  const channel=part==='bass'?1:part==='harmony'?2:0,events=part==='bass'?bass:harmony;
  note(events,channel,midi,stepTick+(time-stepTime)*480*tempoForNote/60,duration*480*tempoForNote/60,velocity??70);
 },drum(kind,time,level,velocity){
  if((settings.drums??.35)<=0&&kind!=='click')return;
  note(drums,9,drumNotes[kind]??42,stepTick+(time-stepTime)*480*tempoForNote/60,45,velocity??70);
 }};
 for(let index=0;index<plan.length;index++){
  const visit=plan[index],tempo=Math.min(360,Math.max(40,song.tempo+visit.chorus*(settings.practiceTempo||0)));
  tempoForNote=tempo;
  if(tempo!==lastTempo){const data=[255,81,3,...u32(Math.round(60000000/tempo)).slice(1)];conductor.push({tick,data});if(lastTempo===null&&tick)conductor.push({tick:0,data});lastTempo=tempo;}
  if(visit.meter.join('/')!==lastMeter){conductor.push({tick,data:[255,88,4,visit.meter[0],Math.log2(visit.meter[1]),24,8]});lastMeter=visit.meter.join('/');}
  stepTick=tick;
  for(let step=0;step<visit.beats*2;step++){
   const shift=(song.transpose||0)+visit.chorus*(settings.practiceTranspose||0);
   pattern(player,visit,step,stepTime,tempo,shift,song.style,plan[index+1]);
   const duration=stepDuration(tempo,settings,rhythmStep(song.style,visit,step),step,visit.meter);
   stepTime+=duration;stepTick+=duration*480*tempo/60;
  }
  tick+=visit.beats*480;
 }
 return new Blob([new Uint8Array([77,84,104,100,0,0,0,6,0,1,0,4,1,224,...track(conductor),...track(harmony),...track(bass),...track(drums)])],{type:'audio/midi'});
}
