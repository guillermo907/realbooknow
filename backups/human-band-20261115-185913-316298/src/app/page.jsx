"use client";
import dynamic from "next/dynamic";
const Studio = dynamic(() => import("../Studio.jsx"), {ssr:false, loading:()=> <main aria-busy="true">Opening Vesper Changes…</main>});
export default function Page(){return <Studio/>;}
