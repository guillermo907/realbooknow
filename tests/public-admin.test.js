import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {publishCollections} from '../src/lib/admin-import.js';
import {baseStockThemes,applyStockThemes,presets} from '../src/store/themes.js';
test('public collections reuse global IDs and publish only missing charts',async()=>{
 const existing={id:'global:one',title:'One',composer:'Me',chart:'D-7Z'};const added={id:'private:two',title:'Two',composer:'Me',chart:'G7Z'};let calls=0;
 const result=await publishCollections([existing,added,added],[{name:'Set',songs:[existing,added,added]}],[existing],async rows=>{calls++;assert.equal(rows.length,1);assert.equal(rows[0].id,undefined);return {ids:['global:two']};});
 assert.equal(calls,1);assert.equal(result.published,1);assert.deepEqual(result.playlists[0].songIds,['global:one','global:two']);assert.equal(result.playlists[0].scope,'public');
});
test('stock overrides retain independent colors and can be reset',()=>{
 const originals=baseStockThemes();const t={...originals[0],accent:'#123456'};applyStockThemes([t]);assert.equal(presets[0].accent,'#123456');assert.equal(presets[0].surface,originals[0].surface);applyStockThemes([]);assert.deepEqual(presets,originals);
});
test('all uploaded collections are public and reference existing deduplicated global charts',async()=>{
 const catalog=JSON.parse(await readFile(new URL('../public/data/global-songs.json',import.meta.url)));const site=JSON.parse(await readFile(new URL('../public/data/site.json',import.meta.url)));const ids=new Set(catalog.songs.map(s=>s.id));assert.equal(ids.size,catalog.songs.length);
 assert.deepEqual(site.playlists.map(p=>[p.name,p.songIds.length]),[['Jazz 1400',1400],['Latin 50',50],['Brazilian 220',220]]);for(const p of site.playlists){assert.equal(p.scope,'public');assert.equal(new Set(p.songIds).size,p.songIds.length);for(const id of p.songIds)assert.ok(ids.has(id));}
});
