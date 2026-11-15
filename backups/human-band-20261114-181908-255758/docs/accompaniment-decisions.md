# Accompaniment implementation decisions

2026-11-14. This log covers the human-band implementation and the later Dark Stage/theme-deletion request. The two Phase 1 documents and our own three evaluation scripts/fixtures were the design inputs. No upstream accompaniment source, style, pattern or groove was opened for implementation.

## Workspace and delivery

The current application is `/Users/willy/Documents/ChatGPT/iRealAlternative`. A reversible write probe was denied by macOS. Work therefore uses a complete writable copy at `band-engine-work`, preserving the current Next.js app, chart layout, library/user scopes, samples, UI and dependencies. The original folder has not been changed. The deliverable includes the tested source and a guarded apply script with backups; running that script in a context with write access is still needed to update the original folder. No dependency installation, deployment or commit was performed.

## Reference evidence

1. The user explicitly authorized downloading and executing MMA for this run. MMA 25.05.3 was fetched from its official site and executed with the existing Python 3 runtime in `/tmp/accomp-research/runtime-study`. Archive links were excluded during extraction. No installation took place. Stock grooves were selected by their documented CLI names, never opened or copied. Original `.mma` chart inputs rendered all 24 style/tempo cases, four choruses, three exports each. Only aggregates enter the docs.
2. MMA track roles come from its `-c` channel assignment report, not guessed GM programs. This matters: its bossa bass uses a guitar patch, and its ballad chord part uses a non-piano patch. Comp figures describe its CHORD tracks; arpeggio tracks are excluded. References are automatic generators, not human-performance standards.
3. No `/data/reference-midi/<tool>/` directory was present. No extra reference source was invented. GMD is a separate human-drum statistics source, not a source of harmony or accompaniment phrases.
4. GMD's MIDI-only archive checksum matched the official SHA-256. The app retains 48,088 bytes of statistics from 291 training-set, beat-only, 4/4 performances; no fills, held-out performances or note sequences are shipped. Drum velocities can inform every family; timing statistics mainly affect funk/rock/Latin/bossa. Swing keeps its own tempo curve. The raw dataset stays outside the app. Google LLC / CC BY 4.0 / Gillick et al. 2019 are credited.
5. The original analyzer was adapted, not replaced by an upstream library. Forty-millisecond chord clustering handles MMA's strummed note-ons. A ±0.025-beat boundary association prevents a slightly early humanized bass note from being assigned to the previous bar or omitted from a last-beat test. MIDI 53 is included as ride bell. These corrections apply consistently to all sources; Phase 1's historical numbers are retained separately.

## Engine and musical rules

6. `planPerformance` is the shared, immutable, seeded 960-PPQ plan API. A bounded module cache shares plans across live audio, MIDI and WAV. Mixer levels are excluded from its musical cache key. Per-role/phrase/decision sub-seeds prevent a bass-feel change from replacing the drum part. The original generator is isolated solely for the requested A/B mode.
7. Existing lookahead scheduling and sample loading remain. Whole-song composition, voicing searches, random choices and replacement-plan preparation occur before scheduling. A live musical edit swaps the prepared future queue at the next unscheduled bar. Mixer changes remain immediate. Practice tempo/key increments are compiled per performed bar; seek, pause/resume and loops reuse the plan. Chart highlighting uses authored positions.
8. Nine original JSON families cover all 33 offered names: swing, ballad, jazz waltz, bossa, Latin, funk, rock, shuffle and compound Afro. Related names are explicitly mapped to these families, not sent to the old engine. JSON files contain original gestures; native validation rejects unknown fields, bad meters, pulse sums, event bounds, IDs, probabilities and role/instrument combinations.
9. Bass anchors are planned before the connecting line, including their actual octave, so an approach resolves to the real future destination. Search retains at most 12 paths. The real next anchor is the arrival target; the second following bar adds a separate low-weight register/contour cost, so the two-bar lookahead actually participates in note selection. Walking/two-feel decisions have phrase-level persistence. Explicit Walk also works in ballads. Bossa/funk/Latin/rock prefer retained roots/fifths; their chromatic connections remain occasional rather than inheriting jazz's frequency. Sparse rests and phrase pickups are discretionary.
10. Comping searches at most 24 original voicing candidates. It retains harmonic identity and guides, uses ordered voice-movement costs, supports shells/normal voicings and known-harmony anticipations, and permits complete rests. A half-beat activity map reduces discretionary drum support during comping. Optional harmony remains a separate muted-by-default part and MIDI channel; muting it does not alter the arrangement.
11. Quarter/pulse anchors remain stable while optional skip notes/support vary. Jazz waltz has three-beat gestures; Afro has explicit compound pulse groups. Phrase/section boundaries determine fill eligibility. Fills replace conflicting support and use snare/tom transitions; silence is allowed. A chorus/section support-state arc changes density and emphasis without randomizing every anchor.
12. Timing follows swing → correlated pulse → role offset → bounded variation → articulation/velocity → safety. Default role placement is slightly forward for bass/ride and back for piano. All performer knobs and H targets live in `src/lib/band-config.json`. Motif event coordinates, measured GMD data and measured sample gains are data, not duplicate tuning controls. Metronome/count-in are outside humanization.

## Samples and rendering

13. The existing curated bank initially lacked a recorded bell, open hat and tom. Twenty-one additional recordings were obtained from the *same pinned CC0 Virtuosity Drums library*, using the already installed ffmpeg for AAC conversion. The completed bank now has real ride bow/bell, closed/pedal/open hats, kick, snare, rim, low tom, bass and piano. Existing licenses/credits are retained. No sound from MMA/JJazzLab/Impro-Visor is used.
14. Every included velocity layer/round-robin participates in selection. Last-used sample tracking is per instrument and pitch. Where the source has only one recorded strike at a layer (notably piano/tom), an adjacent velocity-layer recording supplies the alternative, normalized by calibration. We do not pretend these are extra recorded round robins.
15. Raw decoded sample RMS was measured over the first 400 ms of every region, grouped by layer. Gains normalize layer energy before applying the configurable velocity curve; this corrects very quiet drum assets rather than masking them with fixed MIDI velocities. Individual region variation remains. A high bounded gain cap is necessary for the quietest rim samples. Mixer gain remains independent of velocity/timbre.
16. Bass releases/chokes prevent overlapping monophonic attacks; open/closed/pedal hats share a choke group. Cymbals retain long decay. Per-role filters, a deterministic short room, gentle compression and a final safety compressor provide the master path. A/B renders the first eight seconds of both arrangements with the same samples/calibration/mixer and attenuates the louder excerpt to match RMS after the master chain. This is excerpt RMS matching, not whole-song LUFS normalization; later arrangement dynamics remain audible.

## Evaluation and corrections

The bounded loop included these substantive corrective passes; final aggregates, target checks and browser evidence are in `accompaniment-results.md`. Historical intermediate values are observations, not separate reference standards.

| Pass | Weakest finding | Correction |
| --- | --- | --- |
| Initial generation | Swing connection choices did not consistently arrive in the next anchor's octave | Preplan absolute anchor notes and connect to those destinations |
| Measurement correction | Early notes were excluded from last-beat counts; MMA strums appeared as many one-note chords | Consistent onset tolerance, strum grouping and actual track-role assignment |
| Style separation | Bossa/funk inherited too many chromatic jazz connections | Root/fifth groove behavior and a separate low approach probability |
| Sample response | Drum files had radically different raw levels; three articulations were missing | Complete the CC0 kit and measure velocity-layer gains |
| Comping | Closest-note scoring underestimated actual voice movement | Ordered movement cost, guide retention and original anticipation gestures |
| Scheduling/safety | Live tempo edits, harmonic release edges and export sizes needed explicit handling | Prepared future queues, offset-aware swaps, span clipping, bounded caches and chunked MIDI serialization |
| Dynamics/support | Inner chord notes competed with the top voice; discretionary drums were too busy | Explicit inner attenuation, lower support probability, energy-shaped fills and stable pulse anchors |
| Final validation | Guard against regressions across every offered style and rendering path | Seeded tests, full 24-case measurement/audio sweep, production UI checks and real-time scheduling soak |

The last pass validates the resulting design rather than claiming statistical objectives alone prove human musicianship. No listening claim is fabricated; the controls are provided for the user's final audition.

## Controls and later theme request

17. Practice adds New take, Looseness, Intensity, Bass feel, Swing override and Original/New band. Your room → Advanced contains the band sliders, validated JSON import/export, reset and event-intent export. Settings persist locally. Credits are a visible settings tab.
18. Dark Stage now follows the supplied midnight-violet/black/mint/ivory/violet/peach palette. The reference PNG’s LS27A800U ICC profile was converted to sRGB before sampling: background #19182b, surface #080808, accent #4fb793, chords #eee9df, section #6f6dd2 and highlight #edb78d. Color Neon remains the default. Saved/imported user themes receive an explicit Delete button; the current unsaved custom theme can also be deleted. Stock presets cannot be deleted. Deleting the active custom theme returns to Color Neon and persists that choice.

## Limits carried into the report

The writable-copy implementation can be tested and packaged, but sandbox permission prevents applying it to the original folder. Objective statistics and rendered-level checks do not certify that a machine accompaniment is indistinguishable from a human band. A/B matches its initial excerpt in RMS; it does not promise identical whole-song LUFS on every chart. These limits are disclosed instead of being marked as completed requirements.
