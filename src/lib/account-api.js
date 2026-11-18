import {readDeviceKey} from './legacy-storage.js';
const BASE=process.env.NEXT_PUBLIC_BASE_PATH||'';
export const apiURL=action=>`${BASE}/api/index.php?action=${encodeURIComponent(action)}`;
export async function accountRequest(action,{method='GET',body,csrf,signal}={}){
 const response=await fetch(apiURL(action),{method,credentials:'same-origin',cache:'no-store',signal,headers:{Accept:'application/json',...(body!==undefined?{'Content-Type':'application/json'}:{}),...(csrf?{'X-CSRF-Token':csrf}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});
 let value;try{value=await response.json();}catch{throw Object.assign(Error('Account service is not configured or reachable.'),{status:response.status});}
 if(!response.ok)throw Object.assign(Error(value.error||'Account request failed.'),{status:response.status});return value;
}
export async function accountSession(){try{const session=await accountRequest('session',{signal:AbortSignal.timeout(8000)});if(session.user)localStorage.setItem('jazzbook-last-account',JSON.stringify(session.user));return session;}catch{
 let cached;try{cached=JSON.parse(readDeviceKey('jazzbook-last-account')||'null');}catch{}return {available:false,offline:!!cached,user:cached?{...cached,admin:false}:null};
}}
// One coalesced write, optimistic revision and no silent last-writer-wins overwrite.
export class LibrarySync {
 constructor({revision=0,request,onStatus=()=>{},delay=750}){Object.assign(this,{revision,request,onStatus,delay});this.pending=null;this.running=null;this.blocked=false;this.closed=false;}
 schedule(library){this.pending=library;clearTimeout(this.timer);if(!this.blocked)this.onStatus('pending');this.timer=setTimeout(()=>this.flush().catch(()=>{}),this.delay);}
 async flush(){clearTimeout(this.timer);if(this.closed||this.blocked)return false;if(this.running){await this.running;if(this.pending)return this.flush();return true;}if(!this.pending)return true;
 this.running=(async()=>{while(this.pending&&!this.closed&&!this.blocked){const library=this.pending;this.pending=null;this.onStatus('syncing');try{const result=await this.request(this.revision,library);this.revision=result.revision;this.onStatus('synced');}catch(e){this.pending=this.pending||library;this.blocked=e.status===409||e.status===401||e.status===403;this.onStatus(e.status===409?'conflict':e.status===401||e.status===403?'signed-out':'offline',e.message);throw e;}}return !this.pending;})();try{return await this.running;}finally{this.running=null;}
 }
 close(){this.closed=true;clearTimeout(this.timer);}
}
