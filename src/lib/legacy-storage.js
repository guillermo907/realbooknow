// Read compatibility for existing device data; all new writes use Jazzbook names.
export function readDeviceKey(key){try{return localStorage.getItem(key)??localStorage.getItem(key.replace(/^jazzbook/,'vesper'));}catch{return null;}}
export function removeDeviceKey(key){localStorage.removeItem(key);localStorage.removeItem(key.replace(/^jazzbook/,'vesper'));}
export async function readPreviousDeviceLibrary(profile){
 const name='vesper-changes'+(profile==='guest'?'':'-account-'+profile);
 return new Promise(resolve=>{let created=false;const request=indexedDB.open(name);request.onupgradeneeded=()=>{created=true;request.transaction.abort();};request.onerror=()=>resolve(null);request.onsuccess=()=>{const db=request.result;if(created||!db.objectStoreNames.contains('state')){db.close();resolve(null);return;}const stores=['state',...(db.objectStoreNames.contains('userSongs')?['userSongs']:[])],tx=db.transaction(stores),meta=tx.objectStore('state').get('library'),songs=stores.length>1?tx.objectStore('userSongs').getAll():null;tx.oncomplete=()=>{const value=meta.result;db.close();resolve(value?.separateSongs?{...value,userSongs:songs?.result||[]}:value||null);};tx.onerror=()=>{db.close();resolve(null);};};});
}
