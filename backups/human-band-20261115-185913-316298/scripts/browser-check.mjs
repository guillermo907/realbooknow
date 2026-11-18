// Production UI smoke plus optional real-time band soak. Uses existing REA Playwright only.
await import('./accompaniment-eval/browser-ui.mjs');
if(process.env.VESPER_BAND_QA==='1')await import('./accompaniment-eval/browser-band.mjs');
