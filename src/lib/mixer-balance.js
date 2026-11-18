// Fixed renderer calibration, independent of saved musical Band tuning patches.
// Short sample-based Swing/Funk mixes at equal faders showed keys roughly 9–10 dB
// below bass/drums. Correct the bus, preserving voicing/velocity relationships.
export const MIXER_TRIMS=Object.freeze({chords:3,harmony:3,bass:1,drums:.85});
export function mixerGain(part,settings){
 if(settings.rhythmSectionOnly===true&&['chords','harmony'].includes(part))return 0;
 return Math.max(0,Math.min(1,settings[part]??(part==='harmony'?0:.5)))*(MIXER_TRIMS[part]??1);
}
