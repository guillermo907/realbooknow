import {Account,useAccountLibrary} from './AccountProvider.jsx';
import React,{createContext,useReducer,useContext,useEffect,useMemo} from 'react';
import {samples,initialPlaylists} from '../lib/samples.js';
import {defaultSettings,normalizeSettings} from './themes.js';
import {hydrateLibrary} from '../lib/libraryScopes.js';
import {reducer} from './libraryReducer.js';
const Data=createContext(null),Actions=createContext(null),Settings=createContext(null);
const initial={...hydrateLibrary(samples,{playlists:initialPlaylists}),active:'copper',collection:'all',ready:false,storageError:'',revision:0};
const id=()=>crypto.randomUUID();
export function Provider({children}){const [state,dispatch]=useReducer(reducer,initial);const [settings,setSettings]=React.useState(()=>{try{return normalizeSettings((()=>{const value=JSON.parse(localStorage.getItem('vesper-settings')||'{}');if(!value.searchFirstLayout){value.libraryCollapsed=true;value.searchFirstLayout=true;}return value;})())}catch{return defaultSettings;}});
 const account=useAccountLibrary(state,dispatch);
 useEffect(()=>{try{localStorage.setItem('vesper-settings',JSON.stringify(settings));}catch(e){dispatch({type:'ERROR',error:'Settings could not be saved. Export a backup.'});}},[settings]);
 const actions=useMemo(()=>({dispatch,uid:id}),[]);const prefs=useMemo(()=>({settings,setSettings,patchSettings:patch=>setSettings(s=>normalizeSettings({...s,...patch}))}),[settings]);return <Account.Provider value={account}><Actions.Provider value={actions}><Settings.Provider value={prefs}><Data.Provider value={state}>{children}</Data.Provider></Settings.Provider></Actions.Provider></Account.Provider>;
}
export const useData=()=>useContext(Data);export const useActions=()=>useContext(Actions);export const useSettings=()=>useContext(Settings);
