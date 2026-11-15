# Implementation and verification status

11 November 2026. Vesper Changes runs locally at `http://127.0.0.1:5173/` in this workspace. No hosted deployment, paid app, account, library scraping, native-app modification or original-asset reuse was performed.

## Delivered and exercised

| Area | Implementation | Verification |
| --- | --- | --- |
| Application | React + Vite + SASS partials; reducer/contexts; original identity and nine original charts | Dev server HTTP 200, real Chrome page mounted, repeated production builds |
| Library | Virtual viewport rows; search/filter/sort; import containers/links; favorites/history, sets/folders, drag and keyboard ordering, bulk actions, trash | Browser import/favorite/reload/search; 5,000-record stress check |
| Charts | Cell-stream parsing, measures, chord typography, annotations, symbols, transposition and four notation styles; selected loops; independent playback overlay | Pure tests, live root/degree changes, chart DOM mutation check during playback |
| Audio | Original bass/comp/drum synthesis, lookahead scheduling, transport, gain/mute/tone/reverb, count-in/metronome, practice key/tempo and range loops | Real Web Audio context reaches playing/paused; offline WAV decoded to nonzero samples |
| Editor | Text/visual editing, symbols, metadata/templates, bar/section duplicate, internal copy/paste, undo/redo, advisory key estimation | Browser save and unit serialization tests |
| Personalization | Five contrast-corrected presets, custom themes/files, fonts/notation/grid/density/layout, stage/print | Browser instant theme/notation changes; pure preset color tests; desktop/phone inspection |
| Export | Compatibility links, HTML, JSON/backups, plain setlist, print/booklet, basic MIDI/MusicXML, generated WAV | Browser text download; unit wire/MIDI/XML tests; offline WAV decoding |
| Diagrams | Independently generated piano/fretboard voicings, handedness, two-hand option and advisory scale staff | Browser piano/scale views mount; visual checks; not a professional fingering reference database |
| Privacy | Device storage, inert imported HTML, explicit microphone gesture, no runtime external asset/service requests | Source/build inspection and browser checks; no formal security audit |

## Current measured evidence

- 30 node:test tests pass: chord qualities, pitch/transposition, URI variants, permutation boundaries, collections, cell serialization, repeats/endings, D.C./D.S. validation, meter timing, range plans, contrast and basic exports.
- 19 browser checks pass on Chrome 157.0.8103.39 in an isolated test context, at 1440 × 1000 and 390 × 844.
- 5,000 synthetic songs: 17 mounted rows at the first viewport; reload-to-visible list measured **129 ms** in the recorded dev-server run.
- Search for the final synthetic title measured **198 ms including debounce and browser-driver input**. This is one local run, not a cross-device benchmark.
- During playback, the observer found no chart-cell DOM rewriting; overlay/transport updates remain separate.
- A two-measure generated WAV decoded to 5.636 seconds, 497,172 bytes; peak 0.274, RMS 0.0275. This establishes non-silent generated audio, not a listening-quality or timing-jitter certification.
- Initial production JS approximately **92 KiB gzip**, CSS approximately **8 KiB gzip**; editor/player/theme/export remain separate chunks. Exact filenames/sizes change as fixes are made.
- No runtime page errors in the browser smoke run. Phone page did not overflow horizontally. Theme/editor/import/reload/audio controls were exercised, not just rendered.
- The optional reproducible script is `scripts/browser-check.mjs`. A missing existing browser connection is not an app runtime requirement.

## Partial parity and remaining limits

These prevent an honest claim that this is a complete reproduction of every native feature.

| Item | Current limit / reason |
| --- | --- |
| Native exports | No fresh original-chart HTML/playlist exports were provided. Wire behavior follows public specs and independent fixtures, not a completed native round-trip test. Unicode descrambling units and shortened modern metadata variants remain provisional. |
| Native backups | Share links are extracted from HTML. Native backup-only identity/settings metadata and private stores are not reproduced; use our JSON for full-fidelity backup. |
| Musical form | Basic repeats/endings/jumps/intro/coda are implemented and bounded; complex nested/overlapping forms, third-ending corner cases, native End-marker timing and exact native spacing quantization are not comprehensively verified. Unknown syntax raises diagnostics. |
| Styles | 33 selectable independently synthesized feel labels; several use shared groove families. They are not transcriptions of all 50/90 original styles, and do not reproduce recorded jazz drums or proprietary arrangements. |
| Practice / next-song | Key/tempo cycling and automatic next-song start are implemented. Seamless cross-song audio continuity is not guaranteed. |
| Diagrams/scales | Generated basic reference views, not the original voicing library. Some generated fret shapes may be impractical. Scale suggestions are starting points, not harmonic analysis. |
| Recording | Browser-native MediaRecorder with supported MIME. Microphone capture was not exercised during automated QA, to avoid granting device access on the user's behalf. Universal AAC or recorded-PCM WAV is not implemented. |
| MIDI | Generated format-1 SMF with separate comping/bass/drum tracks, GM programs and tempo/meter events. It describes our performance, not a native-app transcription; DAW round-trip listening has not been audited. |
| MusicXML | Basic chord/meter/rehearsal/repeat/text output; not complete lossless symbol, beat-offset or complex navigation interchange. |
| iCloud / native systems | No CloudKit/iCloud sync, store/purchases, native AirDrop integration or private native database access. Manual backup, browser share/download and system audio routing are the available equivalents. |
| Accessibility | Semantic controls, keyboard paths, focus, modal dialogs, color correction and reduced motion are implemented. Full VoiceOver audit and every custom-theme gradient/control combination have not been independently audited. |
| Lighthouse | No Lighthouse score was measured. The >90 requirement is still an unverified target; a bundle report and local timing do not substitute for it. No new auditing dependency/service was installed. |
| Compatibility/browser matrix | Chrome on this Mac was tested. Safari/iOS/Firefox, live folder picking, OS fullscreen/printing, microphone routing and background/lock-screen behavior require device-specific checks. |

## Stage record

The approved Phase 1 specifications remain in this folder. Phase 2 delivered the functional vertical slices for stages 1–7, with repeated builds and pure/browser checks during integration. The partial items above remain open instead of being marked complete merely because an interface control exists. No native executable code was revisited during implementation.

## Free next validation steps

The user can export a small original chart and named playlist from their installed app for exact parser comparison; open Chrome's built-in Lighthouse panel for a production audit; and exercise microphone/folder/device functions themselves. No paid service or app should be added without asking first.

## Next.js / HostGator migration

The Mac source was migrated to Next.js 16.3.5 / React 19.2.8 static export. Thirty tests pass and the production export and hosting ZIP build successfully. This copy does not yet include the twelve remote regression fixes. Previous Vite browser benchmarks do not certify this Next.js build. Relocation to Documents/ChatGPT/iRealAlternative is pending because this session cannot write outside its workspace. No hosting publication was performed.

## Human band update — 2026-11-14

Implemented in the writable `band-engine-work` copy, preserving the current Next.js UI/library/chart layout. The original app folder remains read-only to this session; the guarded update package is needed to apply the tested files there.

- All 33 offered style names use the new seeded plan engine, with nine independently authored JSON families. Original mode is isolated for A/B only.
- Live, MIDI and WAV share immutable cached plans; authored positions drive chart highlighting. Bass lookahead, guide-aware voice leading, sparse comping, form-based fills, independent role seeds and bounded expression replace tick-time composition.
- Practice controls and Advanced tuning persist locally and support validated JSON import/export. Initial-excerpt RMS matching makes Original/New comparisons fairer without flattening the arrangement's dynamics.
- GMD's verified MIDI-only archive produced 48,088 bytes of human drum aggregates. Twenty-one additional CC0 recordings complete the existing kit's bell/open-hat/tom articulations. Velocity-layer calibration, per-pitch alternate samples, releases/chokes, room and gentle compression are active.
- MMA 25.05.3 ran uninstalled under existing Python: 24 original-fixture cases, three exports each. Its reference statistics remain separate from Vesper/GMD. No upstream generator code/groove/style library or note sequence is shipped.
- 77 Node tests and the production static build pass. All 33 styles pass live-plan/MIDI note parity and stop checks. Two ten-minute, 240-BPM development soaks observed zero scheduling lateness and zero tracked voices after Stop; the current build also has a separate final parity check. Complete audio sweeps cover all 24 cases. See the results/measurement docs for measured levels, A/B matching and validation limits.
- Dark Stage now uses the supplied midnight palette. User-created/imported themes have Delete; deleting an active custom theme safely selects Color Neon. Stock presets remain available. Production UI checks cover this, tuning persistence/export, credits, mobile overflow and real playback.

Results: [accompaniment-results.md](accompaniment-results.md). Decisions: [accompaniment-decisions.md](accompaniment-decisions.md). Current reference data: [accompaniment-measurements.md](accompaniment-measurements.md). Source-level aggregates: [accompaniment-metrics.json](accompaniment-metrics.json).
