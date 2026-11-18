import React,{createContext,useContext,useEffect,useState,useCallback} from 'react';
import {accountRequest} from '../lib/account-api.js';
import {applyStockThemes} from './themes.js';
const empty={revision:0,site:{playlists:[],themes:[],content:{}}};
const Site=createContext({...empty,refresh:async()=>{}});export const useSite=()=>useContext(Site);
export function SiteProvider({children}){const [value,setValue]=useState(empty);
 const refresh=useCallback(async()=>{try{let next;try{next=await accountRequest('site');}catch{const response=await fetch((process.env.NEXT_PUBLIC_BASE_PATH||'')+'/data/site.json');if(!response.ok)throw Error('Site unavailable');next={revision:0,site:await response.json()};}if(!Number.isInteger(next.revision)||!Array.isArray(next.site?.playlists)||!Array.isArray(next.site?.themes))throw Error('Invalid public site data');applyStockThemes(next.site.themes);setValue(next);try{localStorage.setItem('jazzbook-public-site',JSON.stringify(next));}catch{}return next;}catch(e){return null;}},[]);
 useEffect(()=>{try{const cached=JSON.parse(localStorage.getItem('jazzbook-public-site')||'null');if(cached?.site&&Array.isArray(cached.site.themes)&&Array.isArray(cached.site.playlists)){applyStockThemes(cached.site.themes);setValue(cached);}}catch{}refresh();},[refresh]);
 return <Site.Provider value={{...value,refresh}}>{children}</Site.Provider>;
}
