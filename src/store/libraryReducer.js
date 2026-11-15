import {scopedReduce,songSignature} from '../lib/libraryScopes.js';
const id=()=>crypto.randomUUID();
function baseReducer(state,action){let songs,playlists;switch(action.type){
 case 'LOAD':return {...state,...action.data,active:action.data?.songs?.[0]?.id||state.active,ready:true};
 case 'READY':return {...state,ready:true,storageError:action.error||''};
 case 'SAVING':return {...state,saving:true};
 case 'STORED':return {...state,saving:false};
 case 'ERROR':return {...state,storageError:action.error};
 case 'SELECT':return {...state,active:action.id};
 case 'COLLECTION':return {...state,collection:action.id};
 case 'PREFERENCE':{const playlist=state.playlists.find(p=>p.id===state.collection);if(playlist)return {...state,playlists:state.playlists.map(p=>p.id===playlist.id?{...p,overrides:{...p.overrides,[action.id]:{...p.overrides?.[action.id],...action.patch}}}:p),revision:state.revision+1};return {...state,songs:state.songs.map(s=>s.id===action.id?{...s,...action.patch}:s),revision:state.revision+1};}
 case 'UPDATE':return {...state,songs:state.songs.map(s=>s.id===action.id?{...s,...action.patch,updatedAt:Date.now()}:s),revision:state.revision+1};
 case 'SAVE':{const found=state.songs.some(s=>s.id===action.song.id);return {...state,songs:found?state.songs.map(s=>s.id===action.song.id?{...action.song,updatedAt:Date.now()}:s):[{...action.song,id:action.song.id||id(),createdAt:Date.now(),updatedAt:Date.now()},...state.songs],active:action.song.id,revision:state.revision+1};}
 case 'IMPORT':{songs=[...state.songs];const lookup=new Map(songs.filter(s=>s.scope!=='global').map(s=>[songSignature(s),s]));const imported=[],idMap=new Map();for(const song of action.songs){const same=lookup.get(songSignature(song));if(same){imported.push(same.id);if(song.id)idMap.set(song.id,same.id);continue;}let entry={...song,id:id(),createdAt:Date.now(),updatedAt:Date.now(),lastImported:Date.now(),favorite:!!song.favorite};songs.push(entry);lookup.set(songSignature(entry),entry);imported.push(entry.id);if(song.id)idMap.set(song.id,entry.id);}playlists=[...state.playlists];if(action.playlists?.length)for(const p of action.playlists)playlists.push({...p,id:id(),songIds:p.songIds.map(x=>idMap.get(x)).filter(Boolean),overrides:{}});if(action.sets?.length>1)for(const set of action.sets)playlists.push({id:id(),name:set.name||'Imported set',songIds:[...new Set(set.songs.map(x=>lookup.get(songSignature(x))?.id).filter(Boolean))],overrides:{}});if(!action.playlists?.length&&!(action.sets?.length>1)&&action.name&&imported.length)playlists.push({id:id(),name:action.name,songIds:[...new Set(imported)],overrides:{}});return {...state,songs,playlists,active:imported[0]||state.active,revision:state.revision+1};}
 case 'RESTORE_BACKUP':return {...state,songs:action.data.songs,playlists:action.data.playlists||[],folders:action.data.folders||[],active:action.data.songs[0]?.id,collection:'all',revision:state.revision+1};
 case 'PLAYLIST':return {...state,playlists:action.playlists,revision:state.revision+1};
 case 'FOLDERS':return {...state,folders:action.folders,revision:state.revision+1};
 case 'BULK':return {...state,songs:state.songs.map(s=>action.ids.includes(s.id)?{...s,...action.patch}:s),revision:state.revision+1};
 case 'PURGE':return {...state,songs:state.songs.filter(s=>!s.trashed),playlists:state.playlists.map(p=>({...p,songIds:p.songIds.filter(i=>!state.songs.find(s=>s.id===i)?.trashed)})),revision:state.revision+1};
 default:return state;
}}

export const reducer=(state,action)=>scopedReduce(baseReducer,state,action,id);
