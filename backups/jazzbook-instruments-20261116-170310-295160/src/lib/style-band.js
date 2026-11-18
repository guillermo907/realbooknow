import {styleFamily} from './styles/index.js';
// These are supported sources: one recorded piano/drum kit and recorded upright,
// plus explicitly labelled original electric-bass synthesis. Groove is planned
// from the style regardless of this instrumentation preference.
export const STYLE_BANDS=Object.freeze({
 swing:{bassTone:'acoustic',tone:'warm'},waltz:{bassTone:'acoustic',tone:'warm'},
 ballad:{bassTone:'precision',tone:'warm'},bossa:{bassTone:'warm',tone:'warm'},
 latin:{bassTone:'electric',tone:'bright'},afro:{bassTone:'acoustic',tone:'warm'},
 funk:{bassTone:'precision',tone:'bright'},rock:{bassTone:'electric',tone:'bright'},
 shuffle:{bassTone:'electric',tone:'warm'}
});
export const bandStyleKey=(style,meter)=>`${style}|${styleFamily(style,meter)}`;
export function matchStyleBand(settings,style,meter){
 const key=bandStyleKey(style,meter);
 if(settings.keepBandInstruments||settings.bandStyleKey===key)return settings;
 const family=styleFamily(style,meter),preset=STYLE_BANDS[family];
 return {...settings,...preset,...(family==='ballad'&&settings.balladPrecision===false?{bassTone:'warm'}:{}),bandStyleKey:key};
}
