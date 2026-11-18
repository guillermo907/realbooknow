export const PIANO_SOUNDS=Object.freeze({
 yamaha:{name:'Yamaha C5 · Salamander recorded grand',sample:'grandYamaha',midi:0},
 steinway:{name:'Steinway B · VCSL recorded grand',sample:'grandSteinway',midi:0},
 grand:{name:'Acoustic grand · Splendid',sample:'piano',midi:0},
 wurli:{name:'Wurlitzer EP200 · recorded',sample:'epWurli',midi:4},
 pianet:{name:'Hohner Pianet T · recorded',sample:'epPianet',releaseSample:'epPianetRelease',midi:5}
});
export const pianoSound=id=>PIANO_SOUNDS[id]||PIANO_SOUNDS.grand;
