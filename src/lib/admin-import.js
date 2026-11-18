import {catalogSong,songSignature} from './libraryScopes.js';
// Publish charts first, then translate imported collections into global references.
export async function publishCollections(songs,sets,catalog,publish,onProgress=()=>{}){
 const signatureToId=new Map(catalog.map(s=>[songSignature(s),s.id])),rows=[],seen=new Set();for(const song of songs){const sig=songSignature(song);if(signatureToId.has(sig)||seen.has(sig))continue;seen.add(sig);rows.push(song);}
 for(let start=0;start<rows.length;){let end=Math.min(start+100,rows.length);while(end>start+1&&new TextEncoder().encode(JSON.stringify(rows.slice(start,end))).length>4*1024*1024)end--;const chunk=rows.slice(start,end),result=await publish(chunk.map(s=>{const row=catalogSong(s);delete row.id;return row;}));if(result.ids?.length!==chunk.length)throw Error('Publication returned incomplete chart IDs.');chunk.forEach((s,i)=>signatureToId.set(songSignature(s),result.ids[i]));onProgress(end,rows.length);start=end;}
 const playlists=sets.map(s=>({id:'public:'+crypto.randomUUID(),name:s.name||'Imported collection',description:'',scope:'public',songIds:[...new Set(s.songs.map(song=>signatureToId.get(songSignature(song))).filter(Boolean))]}));return {playlists,published:rows.length};
}
