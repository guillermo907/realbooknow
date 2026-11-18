// Central mapping. Unavailable articulations are explicit fallbacks, never advertised as recordings.
export const SAMPLE_MAP={piano:{sample:'piano'},bass:{sample:'bass'},ride:{sample:'ride'},rideBell:{sample:'rideBell',fallback:'ride'},hat:{sample:'hat',choke:'hat'},footHat:{sample:'pedal',choke:'hat'},pedal:{sample:'pedal',choke:'hat'},openHat:{sample:'openHat',choke:'hat',fallback:'hat'},kick:{sample:'kick'},snare:{sample:'snare'},rim:{sample:'rim'},tom:{sample:'tom',fallback:'snare'}};

for(const sample of ['epWurli','epPianet','epPianetRelease','grandYamaha','grandSteinway'])SAMPLE_MAP[sample]={sample,family:'keys'};
for(const sample of ['bassFinger','bassGhost','bassMute','bassRelease','bassJazz','bassJazzShort','bassJazzRelease','bassPicked','bassPrecision'])SAMPLE_MAP[sample]={sample,family:'bass'};
