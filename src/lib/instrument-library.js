import {pianoSound} from './piano-sounds.js';
import {bassSound} from './bass-sounds.js';
export function instrumentParts(settings={}){
 const piano=pianoSound(settings.pianoSound),bass=bassSound(settings.bassTone);
 return [...new Set([piano.sample,piano.releaseSample,bass.sample,bass.ghost,bass.short,bass.releaseSample].filter(x=>x&&x!=='piano'&&x!=='bass'))];
}
export function instrumentsReady(bank,settings){return instrumentParts(settings).every(part=>bank?.instruments?.[part]?.length&&bank.instruments[part].every(r=>bank.buffers.has(r.file)));}
