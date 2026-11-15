import React,{createContext,useReducer,useContext,useEffect,useRef,useMemo} from 'react';
import {samples,initialPlaylists} from '../lib/samples.js';
import {defaultSettings,normalizeSettings} from './themes.js';
import {readLibrary,writeLibrary,loadGlobalCatalog} from '../lib/storage.js';
import {hydrateLibrary,serializeLibrary} from '../lib/libraryScopes.js';
import {reducer} from './libraryReducer.js';
const Data=createContext(null),Actions=createContext(null),Settings=createContext(null);
const initial={...hydrateLibrary(samples,{playlists:initialPlaylists}),active:'copper',collection:'all',ready:false,storageError:'',revision:0};
const id=()=>crypto.randomUUID();
export function Provider({children}){const [state,dispatch]=useReducer(reducer,initial);const [settings,setSettings]=React.useState(()=>{try{return normalizeSettings(JSON.parse(localStorage.getItem('vesper-settings')||'{}'))}catch{return defaultSettings;}});const loaded=useRef(false);
 useEffect(()=>{let live=true;Promise.all([readLibrary(),loadGlobalCatalog(samples)]).then(([data,catalog])=>{if(live){loaded.current=true;dispatch({type:'LOAD',data:hydrateLibrary(catalog,data||{playlists:initialPlaylists})});}}).catch(e=>{if(live){loaded.current=false;dispatch({type:'READY',error:'This session cannot save its library. Export a backup before closing. '+e.message});}});return()=>{live=false;};},[]);
 useEffect(()=>{if(!state.ready||!loaded.current)return;let current=true;dispatch({type:'SAVING'});writeLibrary(serializeLibrary(state)).then(()=>{if(current)dispatch({type:'STORED'});}).catch(e=>{if(current)dispatch({type:'ERROR',error:'Library save failed: '+e.message});});return()=>{current=false;};},[state.revision,state.ready]);
 useEffect(()=>{try{localStorage.setItem('vesper-settings',JSON.stringify(settings));}catch(e){dispatch({type:'ERROR',error:'Settings could not be saved. Export a backup.'});}},[settings]);
 const actions=useMemo(()=>({dispatch,uid:id}),[]);const prefs=useMemo(()=>({settings,setSettings,patchSettings:patch=>setSettings(s=>normalizeSettings({...s,...patch}))}),[settings]);return <Actions.Provider value={actions}><Settings.Provider value={prefs}><Data.Provider value={state}>{children}</Data.Provider></Settings.Provider></Actions.Provider>;
}
export const useData=()=>useContext(Data);export const useActions=()=>useContext(Actions);export const useSettings=()=>useContext(Settings);
