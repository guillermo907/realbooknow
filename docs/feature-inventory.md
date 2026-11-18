# Jazzbook — feature inventory

Phase 1 review draft · 11 November 2026 · Target: installed macOS app 2026.6.1 (build 20260611).

**Phase 2 is not authorized yet.** This is a behavioral specification, not an implementation or a claim of complete runtime verification. No dependencies were installed and no paid service was used. Ask the user before using anything that costs money, requires an account, or requires additional software. The user can open applications and supply exports.

## Identity and clean-room boundary

Working product name: **Jazzbook**. Identity: a midnight practice room with copper, teal and warm paper accents. Proposed original logo: four short rhythmic strokes rising into an open V; draw independently with inline SVG in Phase 2. This is a working name, not trademark clearance. Original branding appears only in compatibility documentation, never as this product's identity.

The installed target is `/Applications/iReal Pro.app`. Its Info.plist declares NSApplication, MainMenu, macOS 12.4 minimum, HTML documents, and the `irealb` / `irealbook` schemes. `file` reports a universal x86_64/arm64 Mach-O executable. Both `LC_BUILD_VERSION` commands report platform 1 (macOS), and linked frameworks include AppKit and native audio frameworks. **Classification: native macOS AppKit application, not Electron or Catalyst.** SwiftUI linkage does not establish that every view uses SwiftUI.

Only installation metadata, interface definitions, UI labels and public interoperability documentation informed this draft. No executable decompilation/disassembly, proprietary algorithm translation, sound-bank extraction, library reuse, DRM work or target modification was performed. Bundled charts and MIDI/sample contents were not read or copied. Interface resource metadata was inspected, not reused as application assets. Phase 2 must use these specs and independently written material.

## Evidence ledger and limits

| ID | Observation | Result and provenance |
| --- | --- | --- |
| L1 | REA `inspect-desktop-application` | Evidence `ev_486229951e6c4150088f4389957a1bb2d7510fdab18c22a64334215adfb86f14`; 1,118 entries examined, complete within scan. Only 76 header bytes probed; this is not a complete file-content inspection. No runtime-family candidate returned; do not interpret that as evidence of a web app. |
| L2 | REA `decode-interface-builder` | Evidence `ev_80ba8a21a70f19e930a8afeb93d2d881d8f43fba6d6da0972ca563717054f440`; seven archives, 1,833 graph nodes, 1,079 edges. Graph reports truncation/partial hierarchy and some unsupported connections. Controls/menu declarations are static evidence, not confirmation that a command is currently enabled. |
| L3 | macOS `plutil`, `file`, `otool -L`, `otool -l` | Bundle identity, version, URL schemes, binary architecture, linked frameworks and build platform. Reads only; no executable code analysis. |
| L4 | English localization metadata | 596 UI keys inspected for feature names, settings and explanatory text. Labels establish declared UI vocabulary, not executed behavior. |
| B1 | REA native metadata inspectors | `inspect-macho` and `inspect-plist` failed while compiling REA's process-ownership helper: its Swift/Clang module cache was not writable. Redirecting cache environment variables did not resolve it. L3 supplies the limited metadata facts above. |
| B2 | Live app observation/export | LaunchServices and System Events failed with -10827; process discovery was unavailable. No PID/window could be selected for `observe-native-ui`. No fresh export, live menu traversal, audio comparison or screen capture was completed. Do not infer the app itself is broken from this session's launch failure. |
| W | Public guides | Official Learn pages and developer protocol; community format maintainers. URLs appear under Sources and in the other specs. Newer documentation may differ from this installed build. |
| U | User requirement | Explicit requested web behavior. A U entry is required even when the original app does not offer it. |

Reproducible local commands used, after sourcing nvm and selecting Node 24.22.1:

```sh
node rea/scripts/rea.mjs inspect-desktop-application '/Applications/iReal Pro.app' --json
node rea/scripts/rea.mjs decode-interface-builder '/Applications/iReal Pro.app' --json
node rea/scripts/rea.mjs inspect-macho '/Applications/iReal Pro.app' --json
node rea/scripts/rea.mjs inspect-plist '/Applications/iReal Pro.app' --json
```

REA's README and `docs/desktop-applications.md`, `docs/guides/apple/apple-application-analysis.md`, and the static/native desktop sections of `docs/guides/native/native-investigation.md` were read first. CLI help verified command names and options. The working CLI made MCP re-registration unnecessary.

## Required feature coverage

Every row is an obligation for Phase 2, not a completed feature. Stage numbers match the requested delivery sequence. `L` means local declaration, `W` published behavior, `U` requested extension. Browser-dependent capabilities must report unavailable states; a dead button does not pass.

| ID | Feature and acceptance condition | Basis | Stage |
| --- | --- | --- | --- |
| LIB-01 | File picker and drop import for both schemes, TXT, HTML and versioned app JSON; preview counts/errors before committing. | L3/W/U | 2 |
| LIB-02 | Folder import with File System Access where supported, directory-input/file-picker fallback elsewhere; no duplicate ingestion on repeated drops. | U | 2 |
| LIB-03 | Title, composer, style label, concert key, tempo and initial/mixed meter; stable sorting by all requested fields and recent play. | L/W/U | 2 |
| LIB-04 | Debounced full-text search; style/key/meter filters; keyboard-accessible virtualized list tested with 5,000+ songs. | W/U | 2, 7 |
| LIB-05 | Create, rename, duplicate, delete and reorder playlists/folders; songs have multiple memberships; per-playlist key/style/tempo/choruses. | L/W/U | 4 |
| LIB-06 | Drag reorder and keyboard Move Up/Down; multi-select, bulk membership/remove/trash/export; merge without duplicates. | L/W/U | 4 |
| LIB-07 | Favorites; recently played, viewed, imported and edited collections; restore/empty trash with explicit destructive actions. | L/W/U | 4 |
| LIB-08 | Immediate chart selection; desktop master–detail, tablet collapsible panels, phone list/chart history and back navigation. | W/U | 1, 3 |
| CH-01 | Four bars per row by default, variable-width imported cells preserved, responsive reflow and multi-page charts without musical truncation. | L/W/U | 3 |
| CH-02 | Intro/A/B/C/D/Verse/custom labels, repeats, N0–N3 endings, meter changes, Segno/Coda/D.C./D.S./Fine/End, fermatas, one/two-bar repeats, N.C., slashes and comments. | L/W/U | 2, 3, 5 |
| CH-03 | Root/quality/slash bass, alterations, superscript layout, accidentals, narrow chords, alternate chords and invisible-root bass. | L/W/U | 3 |
| CH-04 | Measure/chord playback position; hidden marker option, auto-scroll/page turn, explicit jump and loop selection. | W/U | 3, 5 |
| CH-05 | Live ±12 semitones and target key, accidental preference, permanent transpose, independent wind-instrument display offset. | L/W/U | 3 |
| CH-06 | Standard/Nashville/Roman/solfège notation; font/size, numbers/labels visibility, high contrast, fullscreen stage, print/PDF through browser printing. | L/W/U | 1, 3 |
| AUD-01 | Original synthesized bass, comping and drums; swing/bossa/Latin/ballad/funk/rock/waltz/shuffle plus documented style families; audible distinction, correct meter and smooth chord-quality-aware voicings. | W/U | 5 |
| AUD-02 | Play/pause/stop, BPM and tap tempo, count-in/metronome, finite choruses, whole-song/range loops, jump to bar; no stale scheduled sound after stop/seek. | L/W/U | 5 |
| AUD-03 | Master and per-part gain/mute, tone choices, swing amount, reverb, embellished-chord switch, default mixer restore. | L/W/U | 5 |
| AUD-04 | Tempo increase and key shift at chorus boundaries; fourths/fifths/chromatic presets, finite counts and stop/loop/next-song end choices. | L/W/U | 5 |
| AUD-05 | Lookahead scheduling separate from React; audio-clock-driven visual overlay; recover suspended contexts and background timing gaps honestly. | U | 5, 7 |
| ED-01 | New original chart and templates; metadata form; visual measure/chord/symbol palette and keyboard-driven text mode. | L/W/U | 6 |
| ED-02 | Insert/remove cells/bars, normal/small/alternate chords, section duplication, text placement and spacers; structured navigation and selection. | L/W/U | 6 |
| ED-03 | Undo/redo, cut/copy/paste, save/cancel drafts; key estimation with confidence/manual override; distinguish Set Key from Set and Transpose. | L/W/U | 6 |
| EX-01 | Editable share URLs in both schemes, JSON chart/playlist/full backup, HTML share file, print/PDF chart and playlist booklet, plain-text setlist. | L/W/U | 6 |
| EX-02 | Import/restore preview, schema validation/migration, transactional writes; preserve original chart text and unknown tokens. | U | 2, 4, 6 |
| TH-01 | Dark Stage, Paper Real Book, Neon Jazz Club, High Contrast, Sepia; original mark; instant persisted CSS-variable themes. | U | 1 |
| TH-02 | Edit/save/name/import/export themes, six requested semantic colors, system/handwritten fonts, density/radius/line height/grid/background and panel widths/toolbar controls. | U | 1, 7 |
| TH-03 | Every preset and custom theme meets text/control contrast; invalid custom colors get a preview and accessible correction. No font or texture from original app. | U | 1, 7 |
| UX-01 | All requested shortcuts, help overlay, focus-visible states, screen-reader labels, keyboard equivalents for dragging, reduced motion. | U | 1–7 |
| PERF-01 | React hooks + reducer/context, memoized chart, virtual list, lazy editor and audio gate, small production chunks, Lighthouse >90 under recorded conditions. | U | 1–7 |
| QA-01 | Pure parser/chord/transposition tests, original fixtures, real-app exported fixture comparison and truthful final coverage report. | U | 2–7 |

## Extra features discovered: disposition for review

These are not silently dropped. The requested clean-room and zero-dependency constraints govern how they can be reproduced.

| ID | Discovered capability | Web specification |
| --- | --- | --- |
| EXTRA-01 | Piano one/two-hand, guitar/ukulele fingering, multiple voicings, left-hand view, chord-scale staff and reference libraries. L2/L4/W | Generate independently from intervals/tunings, inline SVG, selectable voicings/clefs. No original fingering database. Stage 6. |
| EXTRA-02 | Record microphone with accompaniment; input selection, gain/meter, WAV/AAC save. L2/L4/W | Opt-in mic permission; Web Audio mix and MediaRecorder with capability detection; WAV written independently if PCM capture available. AAC only if browser encoder supports it, otherwise a labeled supported format. Stage 6. |
| EXTRA-03 | Render audio, MIDI performance and MusicXML chart export. L2/W | Own WAV encoder, SMF writer and MusicXML serializer; use only our generated performance. No proprietary MIDI/drum maps. Browser-native compressed export is conditional. Stage 6. |
| EXTRA-04 | Audio routing, A4 tuning, wireless wake delay, AirPlay marker offset. L4/W | Tuning 415–466 Hz; output picker only if supported; explicit visual-latency offset. Do not claim browser Bluetooth/AirPlay device classification. Stage 5. |
| EXTRA-05 | iCloud sync and native backups. L4/W | JSON backup/restore and user-directed file sharing. Native CloudKit/iCloud account sync cannot be reproduced in a local-only, no-backend web app; remains an explicit platform limitation unless scope changes. |
| EXTRA-06 | Forum downloads/posting, online recording search, share sheet/AirDrop. L2/W | Open user-chosen public links, copy share URLs, download files, native Web Share where available; no bundled third-party library, forum automation or account creation. Stage 6. |
| EXTRA-07 | Built-in/paid style packs and recorded jazz drums. L4/W | Original synthetic style coverage; no store, subscriptions, licensing checks or recorded sample reuse. Exact sonic imitation is excluded. Full individual style-name/availability audit is pending local UI access. |
| EXTRA-08 | Utilities/reset, restore factory exercises, search history, playlist shuffle/sort. L2/L4/W | Restore our own original starter charts; separate settings reset from library deletion; persistent search history; shuffle changes playlist order. Stages 4, 6. |
| EXTRA-09 | OS media controls and background audio. W | Media Session when supported, honest browser/background limitations. No guarantee of native-app lock-screen behavior on every device. Stage 5. |
| EXTRA-10 | Mac services, updater, store, app/window management, social/help links. L2 | Browser/system equivalents or Help/About links; not new native integrations or paid services. |

## Original views and settings surfaced

Local declarations and published guides identify: library/sidebar; song list/columns; styles grouping; smart lists and trash; playlist contextual actions; chart; expanded/compact player; tempo/key/style/chorus controls; mixer/count-in; practice panel; chart appearance; visual editor and song metadata; new-chart templates; chord/scale libraries; record dialog; export/share/save/print dialogs; General/iCloud preferences; style store; Help/About. Dynamic dialogs, all contextual-menu states, and purchased style menus have not been exhaustively traversed.

Settings to cover: display instrument C/Bb/Eb/F/G; treble/bass clef; guitar/ukulele handedness; notation/font/minor symbol; app/chart theme and text/background/highlight colors; marker hidden/visible; mixer instrument sounds/levels/reverb/embellishment; count-in duration/volume/clicks/keynote; practice BPM/key steps; tuning/output/latency; default values; backups and reset. Which settings are global, song-level or playlist-level is defined in behavior-spec.md.

## Static menu and shortcut inventory

The following appendix is generated from L2 menu-item declarations and resolves display labels with L4. It includes every **titled menu-item declaration recovered from MainMenu.nib**, including OS commands. Static NSMenu/NSSubmenu associations provide group names; they do not repair REA's incomplete visual hierarchy. Contextual and programmatically generated items remain outside this enumeration. An em dash means no archived key equivalent. Modifier masks absent from an archive are shown as “unspecified,” not guessed to be Cmd.

| Declared group | Command | Archived shortcut | Object |
| --- | --- | --- | --- |
| Edit | Undo | Cmd+z | 95 |
| Edit | Redo | Cmd+Shift+z | 100 |
| Edit | Cut | Cmd+x | 105 |
| Edit | Copy | Cmd+c | 110 |
| Edit | Paste | Cmd+v | 115 |
| Edit | Delete Space | Cmd+Delete | 120 |
| Edit | Delete | (modifiers unspecified)+Delete | 128 |
| Edit | Insert Space | Cmd+\ | 132 |
| Edit | Select All | Cmd+a | 164 |
| Edit | Find | Cmd+f | 217 |
| Edit | Filter List | Cmd+Option+f | 225 |
| Edit | Insert | — | 608 |
| Edit / Insert | Bar Line | — | 612 |
| Edit / Insert | Size | — | 616 |
| File | Save | Cmd+s | 42 |
| File | Page Setup… | Cmd+Shift+p | 50 |
| File | Print… | Cmd+p | 55 |
| File | Open… | Cmd+o | 140 |
| File | New Playlist | Cmd+Shift+n | 148 |
| File | Edit Song | Cmd+e | 156 |
| File | Duplicate | Cmd+d | 233 |
| File | Shuffle Playlist | — | 360 |
| File | Sort Playlists | — | 417 |
| File | Sort Playlist | — | 541 |
| File | New Song | — | 572 |
| File | Export Chord Chart | — | 582 |
| File | Export Audio | — | 589 |
| File | Export Playlist | — | 596 |
| File / Export Audio | AAC | — | 453 |
| File / Export Audio | MIDI | — | 457 |
| File / Export Audio | WAV | — | 460 |
| File / Export Chord Chart | Forums | — | 463 |
| File / Export Chord Chart | iReal Pro Format | — | 467 |
| File / Export Chord Chart | PDF | — | 471 |
| File / Export Chord Chart | Share | — | 475 |
| File / Export Chord Chart | MusicXML | — | 479 |
| File / Export Playlist | Forums | — | 483 |
| File / Export Playlist | iReal Pro Format | — | 486 |
| File / Export Playlist | PDF | — | 489 |
| File / Export Playlist | Setlist | — | 492 |
| File / Export Playlist | Share | — | 496 |
| File / New Song | Blank | Cmd+n | 186 |
| File / New Song | 32 Bars AABA | — | 191 |
| File / New Song | 32 Bars ABAC | — | 194 |
| File / New Song | 48 Bars | — | 197 |
| File / New Song | 96 Bars | — | 200 |
| Help | __APPNAME__ Forums | — | 179 |
| Help | Website | — | 240 |
| Help | Rate in App Store | — | 247 |
| Help | Subscribe to Mailing List | — | 254 |
| Help | Facebook | — | 261 |
| Help | Instagram | — | 367 |
| Help | Threads | — | 379 |
| Help | Mastodon | — | 424 |
| Help | Video Tutorials | — | 509 |
| Help | Help & Support | — | 523 |
| Help | Bluesky | — | 530 |
| Menu | iReal Pro | — | 551 |
| Menu | File | — | 568 |
| Menu | Edit | — | 602 |
| Menu | View | — | 620 |
| Menu | Player | — | 624 |
| Menu | Window | — | 638 |
| Menu | Help | — | 645 |
| Player | Play/Stop | (modifiers unspecified)+Space | 169 |
| Player | Pause | (modifiers unspecified)+. | 174 |
| Player | Tempo + | (modifiers unspecified)+= | 203 |
| Player | Tempo - | (modifiers unspecified)+- | 208 |
| Player | Tap Tempo | (modifiers unspecified)+, | 213 |
| Player | Increase Volume | Cmd+Up | 341 |
| Player | Decrease Volume | Cmd+Down | 346 |
| Player | Repeats + | (modifiers unspecified)+] | 375 |
| Player | Record | Ctrl+r | 413 |
| Player | Transposition | Cmd+t | 444 |
| Player | Repeats - | (modifiers unspecified)+[ | 499 |
| Player | Style | Cmd+y | 504 |
| Player | Transposing Instrument | — | 631 |
| Player / Transposing Instrument | Bb | Ctrl+2 | 355 |
| Player / Transposing Instrument | C | Ctrl+1 | 436 |
| Player / Transposing Instrument | F | Ctrl+4 | 440 |
| Player / Transposing Instrument | Eb | Ctrl+3 | 449 |
| Player / Transposing Instrument | G | Ctrl+5 | 537 |
| View | Minimize Player Controls | Cmd+Ctrl+p | 387 |
| View | Show Sidebar | Cmd+Ctrl+s | 402 |
| View | Show as Columns | — | 406 |
| View | Enter Full Screen | Cmd+Ctrl+f | 432 |
| Window | Zoom | — | 86 |
| Window | Minimize | Cmd+m | 90 |
| Window | Guitar Chords | Ctrl+g | 269 |
| Window | Ukulele Chords | Ctrl+u | 274 |
| Window | Chord Scales | Ctrl+c | 279 |
| Window | Bring All to Front | — | 351 |
| Window | Piano Chords | Ctrl+p | 398 |
| iReal Pro | Check for Updates | — | 16 |
| iReal Pro | About __APPNAME__ | — | 38 |
| iReal Pro | Preferences… | Cmd+, | 63 |
| iReal Pro | Hide __APPNAME__ | Cmd+h | 68 |
| iReal Pro | Quit __APPNAME__ | Cmd+q | 73 |
| iReal Pro | Hide Others | Cmd+Option+h | 78 |
| iReal Pro | Show All | — | 82 |
| iReal Pro | Empty Trash | Cmd+Shift+Delete | 229 |
| iReal Pro | Backup | Cmd+Ctrl+Option+b | 394 |
| iReal Pro | Store | — | 516 |
| iReal Pro | Services | — | 559 |

## Review gates and missing evidence

1. Review all three documents before any React/parser/audio implementation starts.
2. Runtime enumeration remains partial. The user can open the target and provide menu/settings details; do not purchase an inspector or change OS permissions automatically.
3. A fresh export from a user-authored chart is needed. Request one HTML single-song export and one two-song playlist export with a name; optional MusicXML export helps verify structure. Do not request or copy the bundled exercise collection.
4. Modern metadata field variants, Unicode block behavior, ambiguous spacing and navigation cases are provisional until those exports pass comparison.
5. Approving Phase 2 does not convert unknowns into observed facts. Native-only limitations and browser-conditional recording/encoding/routing must remain visible in the final parity report.
6. No dev server/build/Lighthouse was run: this phase produces specifications only. The root has no app scaffold; Vite and Vitest are present inside REA's development dependencies, not yet dependencies of our app. React/ReactDOM/sass availability must be checked at Stage 1. No third-party parser/audio/UI package is permitted.

## Public sources

Accessed 11 November 2026. Details are paraphrased; no charts or assets are included.

- [Official Learn index](https://www.irealpro.com/learn/)
- [Library](https://www.irealpro.com/learn/find-your-songs/), [Playlists](https://www.irealpro.com/learn/playlists/), [Backup](https://www.irealpro.com/learn/back-up-and-restore/)
- [Keyboard shortcuts](https://www.irealpro.com/learn/keyboard-shortcuts/), [Chart appearance](https://www.irealpro.com/learn/chord-chart-appearance/)
- [Diagrams/scales](https://www.irealpro.com/learn/practice-scales/), [Recording](https://www.irealpro.com/learn/record-yourself/), [Audio routing/tuning](https://www.irealpro.com/learn/audio-output/)
- [Sharing](https://www.irealpro.com/learn/share-a-song-or-playlist/), [MIDI/MusicXML](https://www.irealpro.com/learn/exporting-to-midi-and-musicxml/)
- See [format-spec.md](format-spec.md) and [behavior-spec.md](behavior-spec.md) for protocol and playback sources.
