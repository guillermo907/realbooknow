import {hydrateLibrary,serializeLibrary,songSignature} from './libraryScopes.js';
export function mergeGuestLibrary(catalog,current,guest,uid=()=>crypto.randomUUID()){
 const incoming=hydrateLibrary(catalog,guest),result=hydrateLibrary(catalog,current),songs=new Map(result.songs.map(s=>[s.id,s])),byContent=new Map(result.songs.filter(s=>s.scope==='user').map(s=>[songSignature(s),s.id])),remap=new Map();
 for(const s of incoming.songs){if(s.scope==='global'){remap.set(s.id,s.id);continue;}let id=byContent.get(songSignature(s));if(!id){id=songs.has(s.id)?uid():s.id;songs.set(id,{...s,id,scope:'user'});byContent.set(songSignature(s),id);}remap.set(s.id,id);}
 const folderMap=new Map(),folderIds=new Set(result.folders.map(f=>f.id));for(const f of incoming.folders){const id=folderIds.has(f.id)?uid():f.id;folderMap.set(f.id,id);folderIds.add(id);result.folders.push({...f,id});}
 const playlistIds=new Set(result.playlists.map(p=>p.id));for(const p of incoming.playlists){const id=playlistIds.has(p.id)?uid():p.id;playlistIds.add(id);result.playlists.push({...p,id,folder:folderMap.get(p.folder)||p.folder,songIds:p.songIds.map(id=>remap.get(id)||id).filter(id=>songs.has(id)),overrides:Object.fromEntries(Object.entries(p.overrides||{}).map(([id,v])=>[remap.get(id)||id,v]))});}
 result.songs=[...songs.values()];result.globalPreferences={...incoming.globalPreferences,...result.globalPreferences};for(const s of result.songs)if(s.scope==='global'){const pref=result.globalPreferences[s.id];if(pref)Object.assign(s,pref,{scope:'global'});}return serializeLibrary(result);
}
