export const BASS_SOUNDS={
 acoustic:{name:'Upright · natural',midi:32,kind:'sample',cutoff:1600,release:0.035,gain:1},
 warm:{name:'Upright · warm',midi:32,kind:'sample',cutoff:1200,release:.1,gain:1.05},
 bright:{name:'Upright · bright',midi:32,kind:'sample',cutoff:7200,release:.07,gain:.9},
 muted:{name:'Upright · muted',midi:32,kind:'sample',cutoff:850,release:.035,gain:1.1,length:.6},
 electric:{name:'Electric finger · synthesized',midi:33,kind:'synth',cutoff:2600,release:.07,gain:.22,attack:.006,decay:1.25,harmonics:[1,.52,.27,.13,.08,.04]},
 fretless:{name:'Fretless · synthesized',midi:35,kind:'synth',cutoff:1800,release:.13,gain:.23,attack:.025,decay:.6,harmonics:[1,.38,.2,.12,.05]},
 sub:{name:'Sub bass · synthesized',midi:38,kind:'synth',cutoff:650,release:.08,gain:.28,attack:.008,decay:.35,harmonics:[1,.12,.04]}
};
export const bassSound=id=>BASS_SOUNDS[id]||BASS_SOUNDS.acoustic;
