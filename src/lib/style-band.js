import {styleFamily} from './styles/index.js';
// These are supported sources: one recorded piano/drum kit and recorded upright,
// plus recorded electric keys and real finger/picked basses. Groove is planned
// from the style regardless of this instrumentation preference.
export const STYLE_BANDS=Object.freeze({
 swing:{bassTone:'acoustic',tone:'warm',pianoSound:'grand'},waltz:{bassTone:'acoustic',tone:'warm',pianoSound:'grand'},
 ballad:{bassTone:'studioElectric',tone:'warm',pianoSound:'grand'},bossa:{bassTone:'warm',tone:'warm',pianoSound:'grand'},
 latin:{bassTone:'studioElectric',tone:'bright',pianoSound:'grand'},afro:{bassTone:'acoustic',tone:'warm',pianoSound:'grand'},
 funk:{bassTone:'jazz',tone:'bright',pianoSound:'wurli'},rock:{bassTone:'picked',tone:'bright',pianoSound:'grand'},
 shuffle:{bassTone:'jazz',tone:'warm',pianoSound:'pianet'}
});
export const bandStyleKey=(style,meter)=>`${style}|${styleFamily(style,meter)}`;
export function matchStyleBand(settings,style,meter){
 const key=bandStyleKey(style,meter);
 if(settings.keepBandInstruments||settings.bandStyleKey===key)return settings;
 const family=styleFamily(style,meter),preset=STYLE_BANDS[family];
 return {...settings,...preset,bandStyleKey:key};
}
