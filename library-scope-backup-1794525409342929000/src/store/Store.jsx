import React,{createContext,useReducer,useContext,useEffect,useRef,useMemo} from 'react';
import {samples,initialPlaylists} from '../lib/samples.js';
import {defaultSettings,normalizeSettings} from './themes.js';
import {readLibrary,writeLibrary} from '../lib/storage.js';
const Data=createContext(null),Actions=createContext(null),Settings=createContext(null);
const initial={songs:samples,playlists:initialPlaylists,folders:[],active:'copper',collection:'all',ready:false,storageError:'',revision:0};
const id=()=>crypto.randomUUID();
function reducer(state,action){let songs,playlists;switch(action.type){
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
 case 'IMPORT':{songs=[...state.songs];const imported=[],idMap=new Map();for(const song of action.songs){const same=songs.find(s=>s.title===song.title&&s.composer===song.composer&&s.chart===song.chart);if(same){imported.push(same.id);if(song.id)idMap.set(song.id,same.id);continue;}let entry={...song,id:id(),createdAt:Date.now(),updatedAt:Date.now(),lastImported:Date.now(),favorite:!!song.favorite};songs.push(entry);imported.push(entry.id);if(song.id)idMap.set(song.id,entry.id);}playlists=[...state.playlists];if(action.playlists?.length)for(const p of action.playlists)playlists.push({...p,id:id(),songIds:p.songIds.map(x=>idMap.get(x)).filter(Boolean),overrides:{}});if(action.sets?.length>1)for(const set of action.sets)playlists.push({id:id(),name:set.name||'Imported set',songIds:[...new Set(set.songs.map(x=>songs.find(s=>s.title===x.title&&s.composer===x.composer&&s.chart===x.chart)?.id).filter(Boolean))],overrides:{}});if(!action.playlists?.length&&!(action.sets?.length>1)&&action.name&&imported.length)playlists.push({id:id(),name:action.name,songIds:[...new Set(imported)],overrides:{}});return {...state,songs,playlists,active:imported[0]||state.active,revision:state.revision+1};}
 case 'RESTORE_BACKUP':return {...state,songs:action.data.songs,playlists:action.data.playlists||[],folders:action.data.folders||[],active:action.data.songs[0]?.id,collection:'all',revision:state.revision+1};
 case 'PLAYLIST':return {...state,playlists:action.playlists,revision:state.revision+1};
 case 'FOLDERS':return {...state,folders:action.folders,revision:state.revision+1};
 case 'BULK':return {...state,songs:state.songs.map(s=>action.ids.includes(s.id)?{...s,...action.patch}:s),revision:state.revision+1};
 case 'PURGE':return {...state,songs:state.songs.filter(s=>!s.trashed),playlists:state.playlists.map(p=>({...p,songIds:p.songIds.filter(i=>!state.songs.find(s=>s.id===i)?.trashed)})),revision:state.revision+1};
 default:return state;
}}
export function Provider({children}){const [state,dispatch]=useReducer(reducer,initial);const [settings,setSettings]=React.useState(()=>{try{return normalizeSettings(JSON.parse(localStorage.getItem('vesper-settings')||'{}'))}catch{return defaultSettings;}});const loaded=useRef(false);
 useEffect(()=>{let live=true;readLibrary().then(data=>{if(live){loaded.current=true;dispatch({type:'LOAD',data:data&&Array.isArray(data.songs)?data:{}});}}).catch(e=>{if(live){loaded.current=true;dispatch({type:'READY',error:'This session cannot save its library. Export a backup before closing. '+e.message});}});return()=>{live=false;};},[]);
 useEffect(()=>{if(!state.ready||!loaded.current)return;let current=true;dispatch({type:'SAVING'});writeLibrary({songs:state.songs,playlists:state.playlists,folders:state.folders}).then(()=>{if(current)dispatch({type:'STORED'});}).catch(e=>{if(current)dispatch({type:'ERROR',error:'Library save failed: '+e.message});});return()=>{current=false;};},[state.revision,state.ready]);
 useEffect(()=>{try{localStorage.setItem('vesper-settings',JSON.stringify(settings));}catch(e){dispatch({type:'ERROR',error:'Settings could not be saved. Export a backup.'});}},[settings]);
 const actions=useMemo(()=>({dispatch,uid:id}),[]);const prefs=useMemo(()=>({settings,setSettings,patchSettings:patch=>setSettings(s=>normalizeSettings({...s,...patch}))}),[settings]);return <Actions.Provider value={actions}><Settings.Provider value={prefs}><Data.Provider value={state}>{children}</Data.Provider></Settings.Provider></Actions.Provider>;
}
export const useData=()=>useContext(Data);export const useActions=()=>useContext(Actions);export const useSettings=()=>useContext(Settings);
