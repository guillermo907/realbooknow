import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {originalMidi as midi} from '../../src/lib/export.js';
import {buildPlan} from '../../src/lib/plan.js';
import {defaultSettings} from '../../src/store/themes.js';
const root=fileURLToPath(new URL('./output/baseline',import.meta.url)),fixtures=[];
function fixture(id,style,chords,meter=[4,4],sections={0:'A'}){
 const chart=chords.map((chord,i)=>(i===0?'T'+meter.join(''):'')+(sections[i]?'*'+sections[i][0]:'')+(i===0?'[':'')+(Array.isArray(chord)?chord.map(c=>c+'  ').join(''):chord+'   ')).join('|')+'Z';
 return {id,scope:'user',title:'Research '+id,composer:'Original research fixture',key:'C',style,tempo:120,chart,meter,sections};
}
fixtures.push(fixture('blues12','Medium Swing',['C7','F7','C7','C7','F7','F7','C7','A7','D-7','G7',['C7','A7'],['D-7','G7']],undefined,{0:'A',4:'B',8:'C'}));
const a=['C^7','A7','D-7','G7','E-7','A7',['D-7','G7'],'C6'];
fixtures.push(fixture('aaba32','Medium Swing',[...a,...a,'E7','E7','A7','A7','D7','D7','G7','G7',...a],undefined,{0:'A1',8:'A2',16:'B',24:'A3'}));
fixtures.push(fixture('ballad16','Ballad',['Eb^7','C-7','F-7','Bb7','G-7','C7','F-7','Bb7','Ab^7','Ab-6','Eb^7','C7','F-7','Bb7','Eb^7','Bb7'],undefined,{0:'A',8:'B'}));
fixtures.push(fixture('bossa16','Bossa Nova',['D-9','G13','C^7','C^7','F^7','Bb7','E-7','A7','D-9','G13','C^7','A7','D-7','G7','C6','G7'],undefined,{0:'A',8:'B'}));
fixtures.push(fixture('waltz16','Waltz',['C^7','A-7','D-7','G7','E-7','A7','D-7','G7','F^7','F-6','E-7','A7','D-7','G7','C6','G7'],[3,4],{0:'A',8:'B'}));
fixtures.push(fixture('funk16','Funk',['C-9','F9','C-9','C-9','Ab^7','G7alt','C-9','G7alt','C-9','F9','C-9','C-9','Ab^7','G7alt','C-9','G7alt'],undefined,{0:'A',8:'B'}));
await fs.mkdir(root+'/baseline-midi',{recursive:true});await fs.writeFile(root+'/fixtures.json',JSON.stringify(fixtures,null,2));
const manifest=[];
for(const fixture of fixtures)for(const tempo of [60,120,180,240]){
 const song={...fixture,tempo},settings={...defaultSettings,choruses:4,countIn:'0',harmony:0,metronome:false,practiceTempo:0,practiceTranspose:0,embellish:true,swing:.6};
 const name=fixture.id+'-'+tempo,plan=buildPlan(song,{choruses:4}),renders=[];
 for(let run=0;run<3;run++){
  const bytes=new Uint8Array(await midi(song,settings).arrayBuffer()),path=root+'/baseline-midi/'+name+'-run'+run+'.mid';await fs.writeFile(path,bytes);renders.push(path);
 }
 await fs.writeFile(root+'/baseline-midi/'+name+'-plan.json',JSON.stringify(plan));manifest.push({fixture:fixture.id,style:fixture.style,tempo,meter:fixture.meter,bars:fixture.sections,barCount:plan.length/4,choruses:4,settings,renders,plan:root+'/baseline-midi/'+name+'-plan.json'});
}
await fs.writeFile(root+'/baseline-manifest.json',JSON.stringify(manifest,null,2));console.log('Read-only Vesper export:',manifest.length,'style/tempo cases, 3 renders each, 4 choruses each.');
