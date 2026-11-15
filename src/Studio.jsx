"use client";
import React from 'react';
import {Provider} from './store/Store.jsx';
import App from './App.jsx';
class Boundary extends React.Component{constructor(p){super(p);this.state={error:null};}static getDerivedStateFromError(error){return {error};}render(){return this.state.error?<main className="fatal"><h1>The session needs a reset.</h1><p>{this.state.error.message}</p><button onClick={()=>location.reload()}>Reload</button><p>Your saved library is kept on this device.</p></main>:this.props.children;}}
export default function Studio(){return <Boundary><Provider><App/></Provider></Boundary>;}
