import React,{useEffect,useId,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {controlHelp} from '../lib/control-help.js';
export default function InfoHint({name,text}){
 const content=text||controlHelp(name),id=useId(),anchor=useRef(null),[position,setPosition]=useState(null);
 useEffect(()=>{if(!position)return;const close=()=>setPosition(null);document.addEventListener('scroll',close,true);window.addEventListener('resize',close);return()=>{document.removeEventListener('scroll',close,true);window.removeEventListener('resize',close);};},[!!position]);
 if(!content)return null;
 function show(){const r=anchor.current.getBoundingClientRect(),width=Math.min(280,window.innerWidth-24),above=r.top>110;setPosition({width,left:Math.max(12,Math.min(window.innerWidth-width-12,r.left-width/2+r.width/2)),...(above?{bottom:window.innerHeight-r.top+8}:{top:r.bottom+8})});}
 return <><span className="info-hint" ref={anchor} role="button" tabIndex={0} aria-label={'About '+(name||'this control').replace(/([a-z])([A-Z])/g,'$1 $2').replaceAll('.',' ').toLowerCase()} aria-describedby={position?id:undefined} onMouseEnter={show} onMouseLeave={()=>setPosition(null)} onFocus={show} onBlur={()=>setPosition(null)} onClick={e=>{e.preventDefault();e.stopPropagation();anchor.current.focus();show();}} onKeyDown={e=>{if(e.key==='Escape'&&position){e.preventDefault();e.stopPropagation();setPosition(null);}else if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();show();}}}>i</span>{position&&createPortal(<span id={id} role="tooltip" className="control-tooltip" style={position}>{content}</span>,anchor.current?.closest('dialog')||document.body)}</>;
}
