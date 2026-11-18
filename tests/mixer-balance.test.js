import test from 'node:test';import assert from 'node:assert/strict';
import {mixerGain} from '../src/lib/mixer-balance.js';import {defaultSettings,normalizeSettings} from '../src/store/themes.js';
test('equal faders compensate quiet keys while preserving headroom controls and mute',()=>{
 assert.equal(mixerGain('chords',{chords:.5}),1.5);assert.equal(mixerGain('bass',{bass:.5}),.5);assert.equal(mixerGain('drums',{drums:.5}),.425);
 for(const part of ['chords','bass','drums','harmony'])assert.equal(mixerGain(part,{[part]:0}),0);
 assert.equal(mixerGain('chords',{chords:1,rhythmSectionOnly:true}),0);assert.equal(mixerGain('harmony',{harmony:1,rhythmSectionOnly:true}),0);
 for(const part of ['chords','bass','drums'])assert.equal(defaultSettings[part],.5);
 assert.equal(normalizeSettings({chords:1,bass:.2,drums:0}).chords,1);
 assert.equal(mixerGain('chords',{chords:.5,bandTuning:{render:{pianoLevel:.23}}}),1.5);
});
