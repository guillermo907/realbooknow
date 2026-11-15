import { parseChart } from './parser.js';
export function buildPlan(song,{choruses=3,range=null,start=0}={}){const {measures,warnings}=parseChart(song.chart);if(!measures.length)throw Error('This chart is empty.');if(measures.some(m=>m.comments.some(c=>/al Coda/i.test(c.text)))&&measures.filter(m=>m.coda).length<2)throw Error('An al Coda jump needs both a jump sign and a Coda destination.');if(warnings.some(x=>x.startsWith('Unknown')))throw Error('Unknown chart symbols need correction before playback.');let visits=[];
 if(range){const [a,b]=range;for(let c=0;c<choruses;c++)for(let i=a;i<=b;i++)if(measures[i])visits.push({index:i,chorus:c});}
 else {const intro=measures.findIndex(m=>m.section==='A'),segno=measures.findIndex(m=>m.segno),codas=measures.map((m,i)=>m.coda?i:-1).filter(i=>i>=0);let tag=codas.at(-1);const hasJump=measures.some(m=>m.comments.some(c=>/D\.[CS]\. al Coda/i.test(c.text)));
 for(let c=0;c<choruses;c++){let i=c===0?start:(intro>0&&['Intro','Verse'].includes(measures[0].section)?intro:0),repeatStart=i,pass=1,jumped=false,guard=0;
 while(i<measures.length){if(++guard>10000)throw Error('Could not resolve repeats: navigation cycle exceeds 10,000 visits.');const m=measures[i];if(!hasJump&&codas.length&&i===tag&&c<choruses-1)break;
  if(m.left==='{')repeatStart=i;if(m.ending&&m.ending!==pass){let close=i;while(close<measures.length&&measures[close].right!=='}'&&measures[close+1]?.ending==null)close++;i=close+1;continue;}
  visits.push({index:i,chorus:c});const text=m.comments.map(x=>x.text).join(' ');if(m.end)break;
  if(jumped&&/\bFine\b/.test(text))break;
  if(jumped&&m.coda&&codas.length>1&&i!==tag){i=tag;continue;}
  if(!jumped&&/D\.[CS]\.\s*al/i.test(text)){if(/D\.S\./i.test(text)&&segno<0)throw Error('D.S. needs a Segno target.');jumped=true;i=/D\.S\./i.test(text)?segno:0;pass=/3rd/.test(text)?3:/2nd/.test(text)?2:1;continue;}
  if(!jumped&&m.right==='}'){let count=Number(/(\d+)x/.exec(text)?.[1])||Math.max(2,...measures.slice(repeatStart,i+3).map(x=>x.ending||0));if(count>100)throw Error('A section repeat cannot exceed 100 passes.');if(pass<count){pass++;i=repeatStart;continue;}pass=1;}
  i++;
 }
 }}
 let meter=song.meter||[4,4],lastEvents=null,prior=[];return visits.flatMap((v,idx)=>{const m=measures[v.index];let effective=song.meter||[4,4];for(let i=0;i<=v.index;i++)if(measures[i].meter)effective=measures[i].meter;meter=effective;const units=meter[0]*4/meter[1];let events=m.events;
 const rep=events.find(e=>e.type.startsWith('repeat'));if(rep){if(!lastEvents)throw Error('Repeat sign needs a preceding measure.');events=rep.type==='repeat2'?(prior.at(-2)||lastEvents):lastEvents;}if(!events.length)return [];events=events.map(e=>({...e}));prior.push(events);lastEvents=events;const first=events[0].cell,span=Math.max(1,m.width-first);const timed=events.map((e,i)=>({...e,beat:(e.cell-first)/span*units,duration:((events[i+1]?.cell??m.width)-e.cell)/span*units}));return [{...v,visit:idx,measure:m,meter,beats:units,events:timed}];});}
