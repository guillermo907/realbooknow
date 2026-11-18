import {useEffect} from 'react';
// Native proximity snapping can move the page after only a tiny scroll.
// Require deliberate travel in either direction, then settle only near a stop.
export function useIntentionalSnap(){
 useEffect(()=>{
  const mobile=matchMedia('(max-width:760px), (max-height:500px) and (pointer:coarse)');
  let armed=false,last=window.scrollY,direction=0,travel=0,timer;
  const reset=()=>{armed=false;travel=0;direction=0;clearTimeout(timer);};
  const input=e=>{if(!mobile.matches||document.querySelector('dialog[open]')||e.target.closest?.('input,select,textarea,[contenteditable=true]'))return;if(e.type==='keydown'&&!['ArrowUp','ArrowDown','PageUp','PageDown',' '].includes(e.key))return;if(!armed){last=window.scrollY;travel=0;direction=0;}armed=true;};
  const settle=()=>{
   if(!armed||travel<48||!mobile.matches||document.querySelector('dialog[open]'))return;
   const paper=document.querySelector('.paper-viewport');if(!paper)return;
   const y=window.scrollY,paperTop=paper.getBoundingClientRect().top+y;
   const target=direction>0?paperTop:0;
   // Never pull the reader back from controls or later chart content.
   if(y>paperTop+80||Math.abs(y-target)>80||Math.abs(y-target)<2){reset();return;}
   reset();window.scrollTo({top:target,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
  };
  const scroll=()=>{const y=window.scrollY,delta=y-last;last=y;if(!armed||!delta)return;const sign=Math.sign(delta);if(sign!==direction){direction=sign;travel=0;}travel+=Math.abs(delta);clearTimeout(timer);timer=setTimeout(settle,180);};
  window.addEventListener('wheel',input,{passive:true});window.addEventListener('touchmove',input,{passive:true});window.addEventListener('keydown',input);window.addEventListener('scroll',scroll,{passive:true});
  return()=>{reset();window.removeEventListener('wheel',input);window.removeEventListener('touchmove',input);window.removeEventListener('keydown',input);window.removeEventListener('scroll',scroll);};
 },[]);
}
