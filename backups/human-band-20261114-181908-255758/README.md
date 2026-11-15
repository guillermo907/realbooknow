# Vesper Changes

An independent, local-first chord-chart studio and practice room. React function components, Next.js static export, plain SASS, and a hand-written Web Audio rhythm section. No accounts, external fonts, sample downloads, subscriptions, analytics, UI kits or paid services.

## Run locally

```sh
nvm use
npm ci
npm run dev
```

Open **http://127.0.0.1:5173/**. Run these commands in the project folder. If npm's default cache is not writable on your Mac, use `npm ci --cache /tmp/vesper-npm-cache`; do not change ownership or install other software on the app's behalf.

```sh
npm test          # dependency-free node:test checks
npm run build    # static production files in out/
npm run build:hostgator # ZIP for the subdomain document root
```

Node 24.22.1 was used. Direct dependencies are React, ReactDOM, Vite and sass only. Their normal transitive dependencies are in package-lock.json. The REA checkout is a separate analysis tool; the app neither imports it nor includes it in its build. Vite and Vitest were found in that checkout, but the app uses its own Vite installation and Node's built-in test runner, not an added test dependency.

## Your first session

Nine original Vesper Lab charts are included. Select a chart, choose a key, then press Space or Play. First playback loads the audio feature and unlocks the browser's AudioContext. The original trio is synthesized, not sampled.

- **Library:** full-text search, sort and filters; favorites, recently played, recently edited/imported; virtual rows; multiple playlists, folders, drag order and keyboard move controls; bulk favorite/trash/membership actions.
- **Chart:** four measures per desktop row, two on phones; standard/Nashville/Roman/solfège notation; sections, repeats, endings, comments, time changes and alternate symbols; transpose; playback cursor; stage/print modes.
- **Mixer & practice:** independent gains/mutes, tone, swing/reverb, embellished voicings, count-in/metronome, chorus count, tempo/key increases, loop/stop/next behavior, tuning and visual latency.
- **Editor:** chord text and visual palette, song metadata, meter/symbols, section/bar duplication, undo/redo, internal copy/paste, templates and advisory key estimation.
- **Your room:** five presets, live custom colors, accessible color correction, notation/font/size/grid, density, panel widths and theme files.
- **Harmony:** generated piano/guitar/ukulele views and an advisory scale staff, including selectable voicings and left-handed diagrams.

Click a measure to select a start position; double-click starts there once the engine is loaded. Shift-click selects a range; Alt-click makes a one-bar loop. Space is play/pause; use the Stop button to reset. A stopped count-in or chart never silently schedules old notes into the next song.

Single-key shortcuts are ignored in form fields and dialogs. List/grid arrows navigate within those views. Elsewhere: Up/Down transpose; Left/Right select songs; `/` searches; F enters stage mode; E edits; M toggles metronome; +/− change tempo; `?` opens help. Comma is tap tempo when the player is loaded.

## Files and persistence

Import via the library button, dropping files on the page, a pasted URI, or Open Folder. Directory picking uses the File System Access API when available and a directory/file-input fallback otherwise.

Supported input: public `irealbook://` plain links; recognized `irealb://` obfuscated links; HTML/TXT containing links; our JSON. HTML is parsed inertly. The own JSON envelope is:

```json
{
  "format": "vesper-changes",
  "version": 1,
  "kind": "song",
  "exportedAt": "2026-11-11T00:00:00.000Z",
  "data": {
    "id": "my-original-chart",
    "title": "An original turnaround",
    "composer": "Your name",
    "style": "Medium Swing",
    "key": "C",
    "tempo": 120,
    "chart": "T44*A[C^7   |A-7   |D-7   |G7   Z"
  }
}
```

Other `kind` values are `playlist`, `backup`, and `theme`. Themes import through Your room. A backup holds songs, playlist memberships, folders and settings. Library writes use IndexedDB transactions; preferences use localStorage. The header distinguishes saving from saved/error. Quota failures are reported. Browser profiles and ports/origins have separate storage: opening `localhost` instead of `127.0.0.1` creates a different browser library.

Share exports include both compatibility links, editable HTML, JSON, a setlist and full backup. Print opens the browser print dialog, where Save as PDF is available; collection printing produces a booklet, capped at 200 charts per print job. MIDI is a generated multitrack comping/bass/drum performance; MusicXML is a basic harmony/form export. Backing WAV is synthesized offline, capped at ten minutes. Mic recording uses a genuinely supported browser MIME format, never a mislabeled AAC/WAV file. Use wired headphones; no permission is requested until Record is clicked.

**Compatibility is not certified.** Fresh files from the installed native app have not been provided or compared. Modern metadata variants, Unicode chart descrambling, native backup-only metadata and complex forms have known verification gaps. See [format specification](docs/format-spec.md) and [implementation status](docs/implementation-status.md). Native app private databases, bundled libraries, sounds and purchased packs are not imported.

## Architecture

| Directory | Responsibility |
| --- | --- |
| `src/components` | Library, memoized chart, editor, player, dialogs, theme controls and inline SVG icons |
| `src/hooks` | Debounced search |
| `src/store` | Reducer + split contexts, settings normalization, theme contrast rules |
| `src/lib/parser.js` | URI/container decoding, independent cell-stream AST, serializers, validation |
| `src/lib/chords.js` | Pure pitch/quality/voicing/transposition/notation and generated diagram helpers |
| `src/lib/plan.js` | Bounded form expansion and rational measure/chord timing |
| `src/lib/audio.js` | Lazy Web Audio engine, original synthesized voices, lookahead scheduler, recording, WAV |
| `src/lib/export.js` | Independent basic SMF and MusicXML writers |
| `src/lib/storage.js` | IndexedDB transactions, download blobs and JSON envelopes |
| `src/styles` | SASS abstracts/base/themes/components/layout; CSS variables and print styles |
| `tests` | Pure musical/format/contrast/export checks using node:test |
| `scripts/browser-check.mjs` | Optional browser QA using the already-installed REA Playwright, no app dependency |

The audio clock is not in React Context. A 25 ms timer schedules roughly 120 ms ahead; Web Audio timestamps drive sound. A separate subscribed overlay follows the current bar/chord. Static measure cells do not change during ordinary playback. Tempo/seek/stop cancel stale generations/voices. The engine pauses after a major timer interruption rather than playing a burst of missed notes. Browser background audio is still subject to platform policy.

The editor and player load with React.lazy; the audio engine comes with the player chunk. Search is debounced; the list mounts only viewport rows plus overscan. React state owns musical records/settings, while the engine owns audio nodes and transport timing.

## Add a style

1. Add its display name to `STYLE_NAMES` in `src/lib/samples.js`.
2. Write an independent bass/comping/drum branch in `pattern()` in `src/lib/audio.js`, using generated oscillators/noise and the visit's meter/section/chorus.
3. Keep chord tones in `chords.js`, not hard-coded recordings. Preserve slash bass and N.C.; test the style at slow/fast tempos and supported meters.
4. Add an original chart and a test. A differently named copy of a generic pattern is not claimed as a transcription of another app's style.

## Add a theme

Add a named object to `presets` in `src/store/themes.js`, with semantic background/surface/accent/chord/section/highlight/text/muted colors. `resolveTheme()` corrects text contrast against its surface. Any new component must use these variables and retain an opaque surface beneath text. Add its colors to the existing contrast test, and visually check light/dark/forced-color and reduced-motion modes. Users can also save/import/export custom presets entirely in the UI.

## Verification

`npm test`: 30 passing pure tests at the time of initial implementation. Production build passes; initial JS is about 92 KiB gzip plus about 8 KiB CSS, with separate editor/player/theme/export chunks.

Optional integration check, only when the existing Chrome debug window is open:

```sh
node scripts/browser-check.mjs
```

It opens an isolated browser context, checks actual UI interactions/Web Audio/exports, loads 5,000 synthetic records, then closes that context. It never edits your normal browser library. It expects the existing REA Playwright module; do not install a new browser service or paid application. `VESPER_CDP`, `VESPER_BROWSER_MODULE`, and `VESPER_QA_OUTPUT` optionally override the debugging endpoint/module/report path.

See [implementation-status.md](docs/implementation-status.md) for measured results and partial parity. Lighthouse >90 has **not** been measured; do not treat a small build or a fast local check as that score.

## Provenance

Phase 1 used read-only local REA metadata/UI-archive inspection and public specifications. Phase 2 used only the resulting specifications and independent code. No native executable was decompiled, modified or distributed. All nine bundled charts are original Vesper Lab exercises; all icons, branding and synthesis are independently written. Platform names appear only for interoperability. No song copyright or third-party performance license is inferred from a successful import.

## HostGator migration

See [docs/HOSTGATOR_DEPLOY.md](docs/HOSTGATOR_DEPLOY.md). The frontend matches the calculator’s Next.js/React static-export approach. Music logic remains JavaScript and styles remain SASS. Browser persistence is preserved; no PHP/MySQL backend is needed for current local-first features.


## Shared catalog and personal songs

See [library-storage.md](docs/library-storage.md) for the storage split, migration, publishing commands and HostGator account plan. Browser imports are personal; maintainers publish the global catalog with `npm run catalog:import -- export.html` before building. No new dependencies.


## Song URLs and quick search

The top search stays visible with panels hidden. Type to search title, composer, style or key, use arrows/Enter to select, and Escape to close. `/` and Cmd/Ctrl+K focus it. The optional song list starts collapsed; its visibility is remembered after the initial layout migration. The global panel toggle never opens the mixer.

Selections update `?song=<stable-id>&title=<title>` using browser history. Shared catalog links resolve after catalog loading and work with static HostGator export: no server rewrite is needed. Share → Copy Vesper song link copies the app URL. Personal links include a validated chart snapshot in the URL fragment so they work on another browser without an account; they exclude owner IDs, favorites and playlists. Opening one adds a personal chart when an equivalent chart is not already present. Anyone holding the link can read the chart. Chart links over 64,000 characters must use JSON export instead. Unknown local-only IDs display an explanatory message. Back/forward navigation restores chart selection without autoplay.

## Human rhythm section

The current band uses `planPerformance(chart, style, options, seed)` in `src/lib/performance.js`, exposed through `src/lib/accompaniment.js`. Live playback, MIDI and offline WAV consume the same immutable cached 960-PPQ performance. Notes retain authored and performed positions, bar/section/chorus identity, intent and gesture. Mixer mute/level is separate from the musical plan. Original mode is retained only for A/B comparison. The initial eight-second excerpt is RMS-matched after the shared master chain; whole-song dynamics are preserved.

Open **Mixer & practice** for New take, Looseness, Intensity, Bass feel and Swing override. Open **Your room → Advanced** for the swing curve, timing, comping density, approach/fill choices, velocity hierarchy, reverb and compression. Changes to the music enter at the next unscheduled bar; mixer changes are immediate. Export/import tuning JSON to save an audition. Performance-intent JSON is available after playing a chart. Settings persist on this device.

All performer constants and initial evaluation targets live in `src/lib/band-config.json`. `groove-stats.json` and `sample-calibration.json` are measured data, not hand-tuned duplicate constants. GMD is credited in **Your room → Credits**. The app ships aggregates only; it never downloads datasets or contacts sound CDNs at runtime.

To add an original style, author schema-v1 JSON in `src/lib/styles/`, register/import it in `styles/index.js`, and map an offered style name to it. Supply multiple bass, comp and drum motifs; declare meter, pulse groups, range and cycle. Native validation rejects unknown fields, invalid note roles/instruments, probability ranges, duplicate IDs and out-of-range event ticks. Do not import upstream grooves, pattern files or sound banks. `scripts/author-band-styles.mjs` documents the original gesture authoring process; edit the final JSON directly for a custom style.

Validation without new dependencies:

```sh
npm test
npm run build
npm run eval:band
```

The optional browser tests use the Playwright already installed with REA. Build the isolated static audio harness with `node scripts/accompaniment-eval/build-harness.mjs`, serve its `harness/` on port 5184 and the exported `out/` on 5185, then run `node scripts/browser-check.mjs`. Set `VESPER_BAND_QA=1` to also run the real-time ten-minute, 240-BPM soak. `BAND_SOAK_SECONDS` shortens only an explicitly requested smoke run; it must not be reported as the ten-minute test. Set `VESPER_BROWSER_MODULE`/`VESPER_CDP` when using a different existing browser connection.

`npm run eval:band` renders six original fixtures at 60/120/180/240 BPM, four choruses, and compares the isolated original generator with the new band. The reference runtime and GMD scripts are optional offline tools. They are not app dependencies. See `docs/accompaniment-decisions.md`, `docs/accompaniment-measurements.md`, and `docs/accompaniment-results.md` for definitions, source separation, measurements and validation limits.

Dark Stage uses the updated midnight palette. In Themes, user-created/imported themes have **Delete**; deleting an active custom theme returns to Color Neon. Stock presets remain available.
