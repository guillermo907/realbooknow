# Jazzbook — behavior and implementation contract

Phase 1 review draft · 11 November 2026. No app implementation has started. This document separates observed declarations, published behavior and independent product choices. See [feature-inventory.md](feature-inventory.md) for the evidence ledger and [format-spec.md](format-spec.md) for interchange.

`L` = local UI/bundle declaration; `W` = publisher documentation; `D` = independently chosen web behavior; `U` = user requirement. **No live playback or editor workflow was exercised in the original app in this session.**

## 1. Library and state ownership

W documents title/composer search, style browsing, ordered playlists and separate library/trash actions. L declares Last Viewed/Imported/Edited collections, list/column layouts, sorting/shuffle, duplicate/rename, backup and recovery. D/U add full-text/key/meter filters, favorites, folders and recently played.

One canonical song record supplies all memberships. Memberships hold soft key, backing style, BPM and chorus overrides; editing canonical harmony updates every membership. Removing membership never deletes the song. Trash records retain memberships for restore; emptying trash is explicit and destructive. Deleting a playlist defaults to retaining its songs. Shuffle is a stored order change, not an unrecorded random playback flag.

Search is debounced 150–200 ms; normalized search text is indexed on edits/import, never rebuilt during playback. Sorts are stable with id tie-breaks. Keep keyboard focus by id when results change. Search and view preferences persist separately from musical content. Selecting a song stops old scheduled audio before loading a new chart; no accidental cross-song accompaniment.

Persist songs/playlists atomically in IndexedDB; small preferences use localStorage. Fall back with a visible ephemeral-session message if storage is unavailable, and retain export access. Never claim a write succeeded after a quota failure. File import gives a count/diagnostic preview before updating existing records.

## 2. Display, pitch and transposition

W distinguishes temporary transposition, permanent harmonic rewrite and wind-instrument display transposition. D models these independently:

`audio pitch class = stored pitch + song/membership offset + practice offset (mod 12)`

`display pitch class = audio pitch class + reading-instrument offset (mod 12)`

Reading offsets: C 0; Bb +2; Eb +9; F +7; G +5 semitones. Sound remains concert pitch. The key picker displays the concert key; a part badge makes reading transposition visible. Slash bass and alternate chords transpose too; quality, navigation and staff text do not.

Soft transposition does not mutate stored harmony. “Set Key” changes key metadata only; “Set and Transpose” rewrites chords and key. W says saving the latter resets playlist soft keys; D will show that consequence and include the operation in undo history. Auto-key estimation is advisory, with uncertainty and a manual choice; no forced major interpretation of a minor tune.

Spelling preferences: as imported, key-aware, prefer flats or prefer sharps. Root spelling and pitch class remain separate; raw source is retained for reversible editing. D's harmonic rules will be independently written, not a claim to match the original app's contextual spelling algorithm.

Four bars per row is the default. Imports retain cell widths and alternate/text positioning; phone layouts may reflow systems without changing durations. U adds stage mode, page turn, Roman/solfège notation, measure numbering and charts beyond the original page limit. Print removes controls, uses legible light paper, preserves endings/sections and avoids cutting measures. PDF means browser Print → Save as PDF; no fake direct-PDF control.

## 3. Transport state machine (D/U)

States: stopped, preparing, count-in, playing, paused, completed, error. AudioContext creation/resume occurs only after a user gesture. Preparation parses/validates chart navigation and creates a bounded playback plan before scheduling sound.

| Action | Required result |
| --- | --- |
| Play from stopped | Validate and begin at selected bar, otherwise beginning; honor count-in. |
| Pause | Cancel future queued notes, release active voices, save musical position. |
| Resume | Continue saved position; no second count-in by default. |
| Stop | Cancel queue/voices/interval, clear highlights, reset to selected start. |
| Seek/jump | Invalidate scheduled generation, resolve context for destination, restart on a predictable beat. |
| Select range | Inclusive endpoints, keyboard-adjustable; range loop bypasses outside navigation with an explicit indicator. |
| End of chorus | Apply practice increments once, not at every repeat barline. |
| End of requested count | Stop, loop, or advance according to explicit setting; never trigger another song unexpectedly. |
| Browser suspends audio | Enter paused/recovery state; do not dump late events on resume. |
| Invalid form | Show measure-specific error; no infinite expansion or silent wrong form. |

W distinguishes Space start/stop from period pause; U explicitly requests Space play/pause. **The web app follows U**, with a separate Stop button and period as an optional pause alias. W requires at least two bars for a selection loop; D supports one-bar practice as an intentional extension.

### Tempo, count-in and repeat ranges

L2 contains tempo stepper declarations of 40–360 BPM and chorus steppers of 1–30, both increment 1, in expanded/compact player archives. These are **archived control ranges, not tested runtime limits**. Use 40–360 and 1–30 as initial web ranges; an explicit infinite-loop setting is separate. The archived initial value 100 is not evidence of every style's default tempo.

L2 declares practice sliders 0–20 and 0–11. W confirms automatic tempo growth up to 20 BPM per chorus and semitone changes. D uses ±11 for key shift and 0–20 for BPM growth; caps effective tempo at 360 and reports the cap. Tap tempo takes a robust average of recent intervals, resets after an idle gap, and does not run in text inputs.

W count-in options are 0/1/2/Auto; Auto is one bar through 140 BPM and two above 140. D separately controls metronome and count-in volumes/sounds; include a synthesized tonic-note click. Repeats/choruses are distinct from repeat barlines. Playlist setting precedence: membership override → song default → app default. Choosing a new style previews its proposed tempo; preserving the current BPM is an explicit option.

## 4. Form, rhythm and annotations

W says spacing controls chord length; blank leading cells do not imply a rest, and completely empty bars are skipped. Slashes explicitly sustain/repeat harmony. D retains a lossless notated cell stream and derives an independently implemented musical timeline. Do not assume one cell equals one beat or divide bar duration by chord count. W describes quantized chord lengths and odd-meter grouping; exact edge-case thresholds are unverified and need real exported examples. Playback must flag unresolved rhythm rather than silently claim a match.

W defaults 5 meters to 3+2 and 7 meters to 4+3; staff text can select the opposite grouping. D preserves actual rational beat units for every meter; the original's style-dependent compound-meter remapping is a compatibility option rather than corruption of stored meter. The timing engine must correctly play all fourteen documented signatures, including changes on successive bars. Explicitly reject an unsupported style/meter pairing or use a labeled generic-meter groove.

| Symbol / construction | Playback requirement |
| --- | --- |
| Ordinary repeat pair | Two passes unless a supported count overrides it; bind endings to the pair. |
| N1/N2/N3 | Select ending by pass; retain visual brackets separately from visit order. |
| One-/two-bar repeat | Resolve to previous playable bars, keep display symbol; missing predecessor is an error. |
| Intro/Verse then A | Intro plays once before chorus cycle; later choruses restart at A. |
| D.C./D.S. al Fine | Return to beginning/Segno once, stop at the authorized Fine. |
| D.C./D.S. al Coda | Arm a single jump, then take a valid coda target. |
| D.C./D.S. al ending | Return with explicit ending selection; require a resolvable end. |
| Coda/tag without jump text | Final-chorus outro; do not repeat it on every pass. |
| N.C. | Silence bass/harmony for its range; drums continue. |
| Break text | W: drum hit on first beat then stop drums until next double barline; with N.C. complete silence. |
| Fermata | W: visual annotation, does not extend backing timing. |
| Alternate chord | Display/transpose only; never choose randomly for sound. |
| Invisible root/bass | Retain harmony, update bass; require prior harmonic context. |
| End-player symbol | Preserve/print; native wire placement and timing need export verification before enabling compatibility playback. |
| Unrecognized text | Print verbatim, no interpreted command or executable HTML. |

W notes nested repeat limitations. D will validate supported combinations and return actionable errors rather than trying unbounded recursion. Playback expansion needs a maximum visit budget and cycle detection keyed by navigation state, not a ban on legitimate repeated bars. Bounded budgets are engineering choices and must be disclosed. Original fixtures must assert complete visit arrays, including first/last chorus intro/coda behavior.

## 5. Styles and mixer

W lists Jazz (27), Latin (8), Pop (15), plus Blues/Brazilian/Salsa packs. **Individual installed and purchased style menus were not enumerated.** No native performance data or sound samples may be read or used. D will cover independently composed groove families for swing, bossa, Latin, ballad, funk, rock, waltz and shuffle, and independently authored variants for discovered families; a generic pattern renamed repeatedly is not parity.

The initial eight styles are mandatory before Stage 5 passes. Additional family coverage is tracked as EXTRA-07 rather than claiming exact reproduction of 50/90 native grooves. W documents section-dependent mixed feels and tempo-dependent swing; D supports section/chorus variation and fills at structural boundaries through our own algorithms. Default tempo, feel, meter compatibility and available tone voices are explicit metadata for each original style.

Mixer has drums, bass and comping; D additionally allows a separate optional harmony layer where implemented. Every generated channel has gain, mute and tone selection; global master, swing and reverb are separate. Embellishment off retains literal chord tones; on adds compatible extensions without overriding altered notes. Voicing selection minimizes voice movement within playable ranges and preserves guide tones; bass honors slash notes. Approximation of unsupported qualities is announced.

Use oscillators, filtered noise and synthesized envelopes; any impulse response is generated mathematically. No external CDN, sample pack, audio library, purchased plugin or original sound bank. Sounds may differ materially from the native app, particularly recorded jazz drums; report that openly. Resetting the mixer affects sound settings only, not charts.

## 6. Scheduler, recording and output (D)

Use a lookahead timer initially around 25 ms with a 100–150 ms schedule horizon; timestamp events using AudioContext.currentTime. These are tuning values, not facts about the original engine. Resolve musical durations before scheduling. Cache synthesis resources, cap polyphony and disconnect finished voices. Cancel/seek uses a generation id and releases queued voices; changing tempo rebuilds only future events at a documented boundary.

Keep scheduling off the React render path. A lazily mounted audio feature loads the engine with dynamic import; React.lazy is for its component gate, not an arbitrary engine object. requestAnimationFrame positions one playback overlay and chord cursor from the audio clock; the static memoized chart does not re-render each beat. Use an independent status subscription for transport text. When the active measure changes, only overlay/status changes; do not broadcast clock ticks through library Context.

Recording is opt-in, requests mic permission only on Record, and mixes microphone plus generated backing into a separate destination. Stop releases tracks. Detect MediaRecorder MIME support; never relabel WebM/Opus as AAC/WAV. For guaranteed WAV a PCM capture/encoder must be independently implemented and verified. WAV backing export can use OfflineAudioContext. Browser codec/output limitations must be explained at the point of use without dead controls.

Tuning defaults A4=440 Hz with 415–466 range from W. Browser audio routing uses supported sink-selection APIs only; otherwise follow system output. A user-set visual latency offset can align remote outputs. Do not infer Bluetooth/AirPlay type from an unverified device name. Media Session is progressive enhancement; native-grade background/lock-screen playback is not guaranteed.

## 7. Editor and undo model

L/W expose a visual palette, chord text entry, regular/alternate mode, chord size, text positions, symbols, meter, metadata, templates and range selection. D/U provide two synchronized views of the same draft AST: a visual measure editor and keyboard-driven chart text. Neither may maintain a separate interpretation of harmony.

Each committed edit is a reversible reducer transaction, including metadata, insert/delete, duplicate section, paste and transpose. Coalesce a typing burst into one undo step. Editor drafts persist separately; Cancel returns to saved revision, Save replaces it atomically. An invalid text draft remains editable and cannot overwrite a valid chart silently. Warn on unsaved navigation. Provide explicit Cut versus Clear versus Delete Space behavior.

Keyboard typing root/quality/bass has a visible preview and accepts aliases. A chord palette covers quality families without external icons. Selecting a range supports Shift/arrows and pointer dragging; paste inserts unless replacing a selection. Original blank/AABA/ABAC/48-/96-bar templates can be generated without copying any bundled chart. Set key metadata separately from transposing all chords. Inspect support for 3/8, custom labels and long charts in our app even when old native interchange has limits.

## 8. Shortcut contract

This table defines the **web product**, not an identical copy of every native key command. The original's recovered menu shortcuts appear in feature-inventory.md.

| Key | Web action |
| --- | --- |
| Space | Play/pause |
| Up / Down | Transpose ±1 semitone outside lists/forms |
| Left / Right | Previous/next song outside chart/editor/list navigation |
| `/` | Focus search |
| F | Fullscreen stage |
| E | Open editor |
| M | Toggle metronome |
| + / = / − | Tempo ±1 BPM |
| ? | Shortcuts help |
| Escape | Close topmost overlay/exit selection, restore focus |
| Cmd/Ctrl+Z, Shift+Z | Draft undo/redo |

Ignore musical single-key shortcuts while typing in inputs/contenteditable or during IME composition. List arrows move focus; chart/editor arrows move its cursor. Focus ownership wins over global shortcuts. Never hijack browser close/reload/zoom or standard form controls. Help lists context-specific keys and active states.

## 9. Themes, accessibility and layout

SASS only: abstracts variables/mixins, base/reset/type, themes, components and layout partials. Semantic CSS custom properties drive all live personalization. Presets: Dark Stage, Paper Real Book, Neon Jazz Club, High Contrast, Sepia. Expose background, surface, accent, chord, section and highlight colors; fonts, chart size/line spacing, lined/boxed/minimal grid, radius/density, solid/gradient/procedural texture; panel widths and toolbar visibility. Texture is CSS, not a copied image. System sans and handwritten-style fallbacks need no CDN; font appearance will vary by platform.

All theme text/control combinations require WCAG AA: normal text 4.5:1, large text 3:1, meaningful control/focus boundaries 3:1. Gradient/glass surfaces need an opaque backing whose worst-case contrast is known. Live custom editing shows a correction preview and applies an accessible nearest-color adjustment to invalid combinations, while preserving the intended input in the editor. High Contrast and forced-colors remain usable. Playback/selection uses border/shape/text as well as color.

Use semantic buttons/labels and keyboard-accessible list/grid patterns. A virtual row has aria-posinset/setsize and stable ids; focus remains mounted or scrolls into view before aria-activedescendant changes. Playback announcements are opt-in to avoid constant screen-reader interruption. Dialogs manage focus and return it to the trigger. Dragging always has buttons/keyboard alternatives. Resize handles are keyboard operable. Respect prefers-reduced-motion; animations use transform/opacity only.

Desktop: library/chart/player split with resizable persisted panels. Tablet: collapsible panels. Phone: list/chart/editor routes or history-aware panels with accessible back navigation. Never shrink chord text below readable size just to preserve four bars; horizontal density is separate from musical data. Stage mode hides chrome but retains accessible exit and transport.

## 10. Performance and implementation stages

Use React function components/hooks with reducer + Context split by stable data domains; no clock in global context. No new dependencies beyond React, ReactDOM, the bundler and sass. Vite and Vitest exist in the REA checkout; do not reuse REA as our app package or mutate it. At Stage 1 check whether they can be used cleanly for this app; no other test/parser/audio/drag/icon/virtualization packages. Pure logic tests can use node:test if necessary.

| Stage | Completion evidence required |
| --- | --- |
| 0 | Three reviewed specs; explicit evidence gaps and user-provided export fixture plan. **Current stage.** |
| 1 | Original identity, scaffold, all theme presets/live settings, responsive shell; dev server and production build verified. |
| 2 | Import/parser fixtures, virtual 5,000+ list, debounced search/filter; unit tests and build. Native fixture comparison before compatibility claim. |
| 3 | Notation/transposition/print tests and browser checks; memoized chart with independent playback overlay design. |
| 4 | Multi-playlist actions, favorites/trash/history, persistence/reload/backup recovery checks. |
| 5 | Audible style/meter/voicing checks, full form plans, clock/cancel/loop/practice tests, mixer/routing; browser listening verification. |
| 6 | Both editors, undo/drafts, diagrams/scales, supported recording and exports; real-app share round-trip and build. |
| 7 | Keyboard/screen-reader/contrast/reduced-motion pass, responsiveness, profiling, bundle report and Lighthouse. |

Performance targets: 5,000 songs without mounting all rows; search yields within 200 ms after debounce on the tested Mac; transport does not rerender the list/chart; no long tasks caused by per-tick parsing; responsive playback and navigation. Establish production JS gzip/chunk sizes at Stage 1, then enforce a proposed initial compressed JS budget of 150 KiB excluding lazy editor/audio chunks. Revise openly if necessary, never hide a failed budget.

Lighthouse >90 is an acceptance target, **not a measured result**. Record browser/version, production build/URL, viewport, throttling, sample library size and at least three runs; report median and failures. Browser listening tests and scheduling traces supplement Lighthouse; it cannot establish musical timing or compatibility. Every stage must run an appropriate dev/build check and fix errors; no app build is relevant to a documents-only stage.

## 11. Outstanding decisions and validation

- User review is mandatory before starting Stage 1.
- User can open the original app and export original test charts; no paid app/tool is authorized.
- Live menu/settings coverage, original export round-trip, exact modern metadata variants, Unicode scrambling and native rhythm edge cases remain unverified.
- Full 50/90-style individual parity is not established by family names. Record independent style coverage; do not imply original recorded performance quality.
- Native iCloud sync, store/purchases, unrestricted output routing and guaranteed AAC cannot be promised under the stated web/no-backend/no-new-library constraints. The review should accept the explicit browser equivalents or change scope.
- No changes to the original app, purchases, backend account setup, native permission modifications, or deployment are part of this analysis.

## Sources

Official primary guides, accessed 11 November 2026. The rules above are either short paraphrases of these guides or labeled independent design choices; no native implementation was recovered.

- [Play/count-in](https://www.irealpro.com/learn/play-a-song/)
- [Practice increments](https://www.irealpro.com/learn/advanced-practicing-techniques/)
- [Transposition](https://www.irealpro.com/learn/transposition/)
- [Cell spacing and empty measures](https://www.irealpro.com/learn/chart-layout/)
- [Meters/grouping](https://www.irealpro.com/learn/time-signatures/)
- [Repeats/jumps](https://www.irealpro.com/learn/repeats-endings-and-jumps/), [Coda](https://www.irealpro.com/learn/how-the-coda-symbol-works-in-ireal-pro/), [Intro](https://www.irealpro.com/learn/how-to-add-an-intro-to-a-song/)
- [Chord semantics/N.C./Break](https://www.irealpro.com/learn/chord-symbols/)
- [Styles](https://www.irealpro.com/learn/backing-track-styles/), [Mixer](https://www.irealpro.com/learn/customize-your-backing-tracks/)
- [Editor](https://www.irealpro.com/learn/edit-a-song/), [Keyboard](https://www.irealpro.com/learn/keyboard-shortcuts/)
- [Audio output/tuning](https://www.irealpro.com/learn/audio-output/), [Recording](https://www.irealpro.com/learn/record-yourself/)
