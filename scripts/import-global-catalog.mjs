// Maintainer-only build step. No browser is allowed to publish the shared catalog.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {extractImport,validateSong} from '../src/lib/parser.js';
import {catalogSong,songSignature} from '../src/lib/libraryScopes.js';
import {samples} from '../src/lib/samples.js';
const target=new URL('../public/data/global-songs.json',import.meta.url);
const args=process.argv.slice(2);if(!args.length){console.error('Usage: npm run catalog:import -- export.html [more.txt ...]');process.exit(1);}
let previous;try{previous=JSON.parse(await readFile(target,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;previous={songs:samples};}
const songs=previous.songs.map(catalogSong),lookup=new Map(songs.map(s=>[songSignature(s),s]));
for(const file of args){const content=await readFile(file,'utf8');const imported=extractImport(content);for(const song of imported.songs){validateSong(song);const signature=songSignature(song);if(lookup.has(signature))continue;const id='global:'+createHash('sha256').update(signature).digest('hex').slice(0,24);const entry=catalogSong({...song,id});songs.push(entry);lookup.set(signature,entry);}}
if(songs.length>20000)throw Error('Catalog exceeds 20,000 songs; split catalogs before increasing this limit.');
const text=JSON.stringify({format:'jazzbook-global-catalog',version:1,songs});
await mkdir(new URL('../public/data/',import.meta.url),{recursive:true});await writeFile(fileURLToPath(target),text+'\n');console.log(`${songs.length} global songs. Build and deploy to publish them. Personal libraries are untouched.`);
