import {matchBandLoudness} from '../../src/lib/band-loudness.js';
import {engine,PracticeEngine,renderBacking} from '../../src/lib/audio.js';import {planPerformance} from '../../src/lib/performance.js';import {midiFromPerformance} from '../../src/lib/band-midi.js';import {StudioTrio,loadStudio} from '../../src/lib/studio.js';import {bandConfig} from '../../src/lib/band-config.js';
window.__VESPER_BAND__={matchBandLoudness,engine,PracticeEngine,renderBacking,planPerformance,midiFromPerformance,StudioTrio,loadStudio,bandConfig};
