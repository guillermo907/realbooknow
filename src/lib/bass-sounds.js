export const BASS_SOUNDS={
 jazz:{name:'Jazz Bass · recorded finger',midi:33,kind:'sample',sample:'bassJazz',short:'bassJazzShort',releaseSample:'bassJazzRelease',ghost:'bassGhost',cutoff:8500,release:.08,gain:1},
 precision:{name:'Fender P-bass · vintage picked recording',midi:34,kind:'sample',sample:'bassPrecision',ghost:'bassGhost',cutoff:7500,release:.08,gain:1},
 picked:{name:'Blue solidbody · recorded pick',midi:34,kind:'sample',sample:'bassPicked',ghost:'bassGhost',cutoff:8500,release:.07,gain:1},
 studioElectric:{name:'Black hollowbody · recorded finger / ghosts',midi:33,kind:'sample',sample:'bassFinger',ghost:'bassGhost',short:'bassMute',releaseSample:'bassRelease',cutoff:7500,release:.07,gain:1},
 acoustic:{name:'Upright · natural',midi:32,kind:'sample',cutoff:1600,release:0.035,gain:1},
 warm:{name:'Upright · warm',midi:32,kind:'sample',cutoff:1200,release:.1,gain:1.05},
 bright:{name:'Upright · bright',midi:32,kind:'sample',cutoff:7200,release:.07,gain:.9},
 muted:{name:'Upright · muted',midi:32,kind:'sample',cutoff:850,release:.035,gain:1.1,length:.6}
};
// Retired synthesized presets migrate to recordings; never relabel a source as another model.
export const normalizeBassSound=id=>({electric:'jazz',fretless:'studioElectric',sub:'warm'}[id]||id);
export const bassSound=id=>BASS_SOUNDS[normalizeBassSound(id)]||BASS_SOUNDS.acoustic;
