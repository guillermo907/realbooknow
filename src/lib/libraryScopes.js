// Public catalog content is immutable. Only personal data is persisted locally.
export const CONTENT_FIELDS=['title','composer','style','key','tempo','chart','choruses','meter','tags'];
const PERSONAL_FIELDS=['favorite','lastPlayed','lastViewed','lastImported','transpose','tempo','style','choruses','trashed','updatedAt'];
export const songSignature=s=>JSON.stringify([s.title,s.composer||'',s.chart]);
export function userSong(song,id=song.id){const {ownerId,userId,scope,sourceGlobalId,...rest}=song;return {...rest,id,scope:'user',...(typeof sourceGlobalId==='string'?{sourceGlobalId}: {})};}
export function catalogSong(song){return Object.fromEntries(['id',...CONTENT_FIELDS].filter(k=>song[k]!==undefined).map(k=>[k,song[k]]));}
export function globalSongs(catalog){const seen=new Set();return catalog.map(s=>{if(typeof s.id!=='string'||!s.id||seen.has(s.id))throw Error('Global catalog IDs must be unique.');seen.add(s.id);return {...catalogSong(s),scope:'global'};});}
export function hydrateLibrary(catalog,saved={}){
 const base=globalSongs(catalog),byId=new Map(base.map(s=>[s.id,s])),remap=new Map();let prefs={...(saved.globalPreferences||{})},personal=[];
 if(saved.schemaVersion===2){personal=(saved.userSongs||[]).map(s=>userSong(s));const ids=new Set(personal.map(s=>s.id));for(const song of saved.songs||[])if(song.scope==='global'&&!byId.has(song.id)&&!ids.has(song.id)){personal.push(userSong({...song,sourceGlobalId:song.id}));ids.add(song.id);}}
 else for(const song of saved.songs||[]){const global=byId.get(song.id);if(global&&songSignature(global)===songSignature(song)){prefs[song.id]=Object.fromEntries(PERSONAL_FIELDS.filter(k=>song[k]!==undefined).map(k=>[k,song[k]]));}else{const id=global?'user:legacy:'+song.id:song.id;remap.set(song.id,id);personal.push(userSong(song,id));}}
 const used=new Set(base.map(s=>s.id));for(const s of personal){if(used.has(s.id))throw Error('Personal song ID conflicts with the catalog.');used.add(s.id);}
 const playlists=(saved.playlists||[]).map(p=>({...p,songIds:p.songIds.map(id=>remap.get(id)||id),overrides:Object.fromEntries(Object.entries(p.overrides||{}).map(([id,v])=>[remap.get(id)||id,v]))}));
 return {globalCatalog:base,globalPreferences:prefs,songs:[...base.filter(s=>!prefs[s.id]?.hidden).map(s=>({...s,...Object.fromEntries(PERSONAL_FIELDS.filter(k=>prefs[s.id]?.[k]!==undefined).map(k=>[k,prefs[s.id][k]])),scope:'global'})),...personal],playlists,folders:saved.folders||[]};
}
export function serializeLibrary(state){const prefs={...state.globalPreferences},base=new Map(state.globalCatalog.map(s=>[s.id,s]));for(const song of state.songs)if(song.scope==='global'){const changes={};for(const key of PERSONAL_FIELDS)if(song[key]!==undefined&&song[key]!==base.get(song.id)?.[key])changes[key]=song[key];if(Object.keys(changes).length||prefs[song.id]?.hidden)prefs[song.id]={...(prefs[song.id]?.hidden?{hidden:true}:{}),...changes};else delete prefs[song.id];}return {schemaVersion:2,userSongs:state.songs.filter(s=>s.scope!=='global'),globalPreferences:prefs,playlists:state.playlists,folders:state.folders};}
export function scopedReduce(reduce,state,action,uid){
 if(action.type==='RESTORE_BACKUP'){const restored=hydrateLibrary(state.globalCatalog,action.data);return {...state,...restored,active:restored.songs[0]?.id,collection:'all',revision:state.revision+1};}
 if(action.type==='SAVE'){
  const global=state.songs.find(s=>s.id===action.song.id&&s.scope==='global');
  if(global){const copy=userSong({...action.song,sourceGlobalId:global.id},uid());const next=reduce(state,{...action,song:copy});return {...next,playlists:next.playlists.map(p=>p.id===state.collection?{...p,songIds:p.songIds.map(id=>id===global.id?copy.id:id),overrides:{...p.overrides,[copy.id]:{...p.overrides?.[global.id],transpose:copy.transpose||0}}}:p)};}
  action={...action,song:userSong(action.song,action.song.id||uid())};
 }
 if(action.type==='UPDATE'&&['title','composer','key','chart'].some(k=>k in action.patch)){
  const global=state.songs.find(s=>s.id===action.id&&s.scope==='global');if(global)return scopedReduce(reduce,state,{type:'SAVE',song:{...global,...action.patch}},uid);
 }
 if(action.type==='IMPORT')action={...action,songs:action.songs.map(s=>userSong(s))};
 if(action.type==='PURGE'){
  const removed=new Set(state.songs.filter(s=>s.trashed).map(s=>s.id)),prefs={...serializeLibrary(state).globalPreferences};for(const id of removed)if(state.globalCatalog.some(s=>s.id===id))prefs[id]={...prefs[id],hidden:true,trashed:false};
  return {...state,songs:state.songs.filter(s=>!removed.has(s.id)),globalPreferences:prefs,playlists:state.playlists.map(p=>({...p,songIds:p.songIds.filter(id=>!removed.has(id))})),revision:state.revision+1};
 }
 return reduce(state,action);
}
