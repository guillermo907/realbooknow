# Accompaniment measurements — current implementation update

2026-11-14. The user subsequently authorized downloading and running MMA. Its 24 original-fixture renders now replace the previous **MMA runtime unavailable** status. JJazzLab/Toolkit and Impro-Visor were not executed and remain unmeasured. MMA is an automatic generator, not a human band. Sources below are kept separate; no groove or note sequence has been copied into Vesper.

MMA 25.05.3 official archive: https://www.mellowood.ca/mma/mma-devl.25.05.3.tar.gz . Python was already installed; no package installation occurred. The source archive was executed for measurements only. Groove choices: blues/AABA `stdlib/swing:Swing`; ballad `stdlib/ballad:Ballad`; bossa `stdlib/bossanova:BossaNova`; waltz `stdlib/jazzwaltz:JazzWaltz`; funk `stdlib/bvfunk:BVFunk`. All tempos below rendered successfully; extreme tempos are stress cases, not endorsements of musical suitability. Original chart labels and bar metadata match the historical fixture definitions.

MMA native track roles were obtained with `-c`. CHORD tracks define comping; ARPEGGIO parts are excluded. MIDI program alone is not a role label. Forty-millisecond strum clustering and ±0.025-beat boundary tolerance apply to all three sources in this current comparison. Notes 51/53/59 form the ride family. The older exact-onset Phase 1 analysis is retained below as historical evidence.

## Current comparison matrix

| Source | Fixture | BPM | Root % | Chromatic approach % | Two-feel / walk % | Comp hits/bar | Voice movement | Ride ratio |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| baseline | blues12 | 60 | 100 | 100 | 0/100 | 2.292 | 3.596 | 1.5 |
| baseline | blues12 | 120 | 100 | 100 | 0/100 | 2.292 | 3.596 | 1.5 |
| baseline | blues12 | 180 | 100 | 100 | 0/100 | 2.292 | 3.596 | 1.5 |
| baseline | blues12 | 240 | 100 | 100 | 0/100 | 2.292 | 3.596 | 1.5 |
| baseline | aaba32 | 60 | 100 | 100 | 0/100 | 2.32 | 3.561 | 1.5 |
| baseline | aaba32 | 120 | 100 | 100 | 0/100 | 2.32 | 3.561 | 1.5 |
| baseline | aaba32 | 180 | 100 | 100 | 0/100 | 2.32 | 3.561 | 1.5 |
| baseline | aaba32 | 240 | 100 | 100 | 0/100 | 2.32 | 3.561 | 1.5 |
| baseline | ballad16 | 60 | 100 | 0 | 100/0 | 2 | 3.484 | N/M |
| baseline | ballad16 | 120 | 100 | 0 | 100/0 | 2 | 3.484 | N/M |
| baseline | ballad16 | 180 | 100 | 0 | 100/0 | 2 | 3.484 | N/M |
| baseline | ballad16 | 240 | 100 | 0 | 100/0 | 2 | 3.484 | N/M |
| baseline | bossa16 | 60 | 100 | 6.78 | 0/0 | 3.469 | 3.428 | N/M |
| baseline | bossa16 | 120 | 100 | 6.78 | 0/0 | 3.469 | 3.428 | N/M |
| baseline | bossa16 | 180 | 100 | 6.78 | 0/0 | 3.469 | 3.428 | N/M |
| baseline | bossa16 | 240 | 100 | 6.78 | 0/0 | 3.469 | 3.428 | N/M |
| baseline | waltz16 | 60 | 100 | 6.78 | 0/0 | 2.5 | 1.937 | N/M |
| baseline | waltz16 | 120 | 100 | 6.78 | 0/0 | 2.5 | 1.937 | N/M |
| baseline | waltz16 | 180 | 100 | 6.78 | 0/0 | 2.5 | 1.937 | N/M |
| baseline | waltz16 | 240 | 100 | 6.78 | 0/0 | 2.5 | 1.937 | N/M |
| baseline | funk16 | 60 | 100 | 14.545 | 0/0 | 3.188 | 1.2 | N/M |
| baseline | funk16 | 120 | 100 | 14.545 | 0/0 | 3.188 | 1.2 | N/M |
| baseline | funk16 | 180 | 100 | 14.545 | 0/0 | 3.188 | 1.2 | N/M |
| baseline | funk16 | 240 | 100 | 14.545 | 0/0 | 3.188 | 1.2 | N/M |
| new | blues12 | 60 | 91.667 | 35.897 | 16.667/77.083 | 1.729 | 1.423 | 1.898 |
| new | blues12 | 120 | 91.667 | 48.718 | 0/91.667 | 1.729 | 1.423 | 1.647 |
| new | blues12 | 180 | 91.667 | 48.718 | 0/91.667 | 1.729 | 1.423 | 1.297 |
| new | blues12 | 240 | 91.667 | 48.718 | 0/91.667 | 1.729 | 1.423 | 1.115 |
| new | aaba32 | 60 | 92.969 | 42.308 | 11.719/82.812 | 1.602 | 1.349 | 1.901 |
| new | aaba32 | 120 | 92.969 | 46.154 | 0/92.969 | 1.602 | 1.35 | 1.655 |
| new | aaba32 | 180 | 92.969 | 46.154 | 0/92.969 | 1.602 | 1.362 | 1.305 |
| new | aaba32 | 240 | 92.969 | 46.154 | 0/92.969 | 1.602 | 1.362 | 1.121 |
| new | ballad16 | 60 | 95.312 | 0 | 100/0 | 0.75 | 1.246 | N/M |
| new | ballad16 | 120 | 95.312 | 0 | 100/0 | 0.75 | 1.246 | N/M |
| new | ballad16 | 180 | 95.312 | 0 | 100/0 | 0.75 | 1.246 | N/M |
| new | ballad16 | 240 | 95.312 | 0 | 100/0 | 0.75 | 1.246 | N/M |
| new | bossa16 | 60 | 95.312 | 11.864 | 1.562/0 | 2 | 1.244 | N/M |
| new | bossa16 | 120 | 95.312 | 11.864 | 1.562/0 | 2 | 1.244 | N/M |
| new | bossa16 | 180 | 95.312 | 11.864 | 1.562/0 | 2 | 1.244 | N/M |
| new | bossa16 | 240 | 95.312 | 11.864 | 1.562/0 | 2 | 1.244 | N/M |
| new | waltz16 | 60 | 95.312 | 32.203 | 0/0 | 1.391 | 1.216 | 1.898 |
| new | waltz16 | 120 | 95.312 | 32.203 | 0/0 | 1.391 | 1.216 | 1.653 |
| new | waltz16 | 180 | 95.312 | 32.203 | 0/0 | 1.391 | 1.216 | 1.301 |
| new | waltz16 | 240 | 95.312 | 32.203 | 0/0 | 1.391 | 1.216 | 1.119 |
| new | funk16 | 60 | 93.75 | 12.727 | 0/0 | 2.234 | 0.811 | N/M |
| new | funk16 | 120 | 93.75 | 12.727 | 0/0 | 2.234 | 0.811 | N/M |
| new | funk16 | 180 | 93.75 | 12.727 | 0/0 | 2.234 | 0.811 | N/M |
| new | funk16 | 240 | 93.75 | 12.727 | 0/0 | 2.234 | 0.811 | N/M |
| MMA | blues12 | 60 | 100 | 0 | 0/0 | 6.667 | 3.989 | N/M |
| MMA | blues12 | 120 | 100 | 0 | 0/0 | 3.667 | 1.606 | N/M |
| MMA | blues12 | 180 | 100 | 0 | 0/0 | 3.708 | 1.202 | N/M |
| MMA | blues12 | 240 | 100 | 0 | 0/0 | 3.375 | 1.532 | N/M |
| MMA | aaba32 | 60 | 100 | 0 | 0/0 | 6.531 | 4.295 | N/M |
| MMA | aaba32 | 120 | 100 | 0 | 0/0 | 3.531 | 1.713 | N/M |
| MMA | aaba32 | 180 | 100 | 0 | 0/0 | 3.531 | 1.807 | N/M |
| MMA | aaba32 | 240 | 100 | 0 | 0/0 | 3.75 | 1.722 | N/M |
| MMA | ballad16 | 60 | 95.312 | 0 | 0/0 | 3.75 | 0.948 | N/M |
| MMA | ballad16 | 120 | 95.312 | 0 | 0/0 | 3.75 | 0.948 | N/M |
| MMA | ballad16 | 180 | 87.5 | 0 | 0/0 | 3.75 | 1.004 | N/M |
| MMA | ballad16 | 240 | 89.062 | 0 | 0/0 | 3.75 | 1.004 | N/M |
| MMA | bossa16 | 60 | 92.188 | 0 | 25/0 | 9.984 | 5.398 | N/M |
| MMA | bossa16 | 120 | 93.75 | 0 | 15.625/0 | 5.5 | 1.695 | N/M |
| MMA | bossa16 | 180 | 93.75 | 0 | 26.562/0 | 4.5 | 1.323 | N/M |
| MMA | bossa16 | 240 | 93.75 | 0 | 20.312/0 | 4.5 | 1.384 | N/M |
| MMA | waltz16 | 60 | 92.188 | 1.695 | 0/0 | 7.594 | 1.401 | 0.921 |
| MMA | waltz16 | 120 | 85.938 | 1.695 | 0/0 | 5.109 | 1.508 | 1.086 |
| MMA | waltz16 | 180 | 87.5 | 0 | 0/0 | 4.953 | 0.956 | 0.949 |
| MMA | waltz16 | 240 | 89.062 | 10.169 | 0/0 | 3.75 | 1.675 | 0.94 |
| MMA | funk16 | 60 | 89.062 | 0 | 0/0 | 8.375 | 4.484 | N/M |
| MMA | funk16 | 120 | 89.062 | 0 | 0/0 | 5.359 | 4.135 | N/M |
| MMA | funk16 | 180 | 92.188 | 0 | 0/0 | 4 | 5.453 | N/M |
| MMA | funk16 | 240 | 89.062 | 0 | 0/0 | 4 | 5.453 | N/M |

## Complete aggregate evidence and interpretation

[Results and target checks](accompaniment-results.md) report articulation, dynamic response, repetition, form-based fill positions and rendered loudness. [All metric distributions](accompaniment-metrics.json) preserve bass interval/approach counts, ranges and length statistics; comp rhythm histograms, density, size, range and matched-voice motion; drum instrument histograms, velocity ranges and ride ratios; and section/chorus variation for every case/source. These are aggregates only.

GMD is separate from the three accompaniment generators: its human drum training-set aggregates influence bounded timing/velocity; no MIDI phrase is reproduced. 291 training-set, beat-only 4/4 performances contribute to the 48,088-byte app statistics. Official archive SHA-256: `651cbc524ffb891be1a3e46d89dc82a1cecb09a57c748c7b45b844c4841dcc1e`. Credit: Google LLC, CC BY 4.0; Gillick et al., “Learning to Groove with Inverse Sequence Transformations,” ICML 2019. Source: https://magenta.tensorflow.org/datasets/groove .

## H target decisions after adding references

- Keep the original tempo-dependent swing hypotheses: MMA Swing does not supply qualifying ride triplets, and its hat/percussion choices cannot justify a ride-curve target. Human GMD timing is not substituted for the explicit swing curve.
- Keep sparse ballad comping as an original listening hypothesis. MMA's substantially denser CHORD track demonstrates a different arrangement, not a requirement to fill the space.
- Keep contextual bass anchoring and mixed approaches. MMA's high root percentages and almost absent semitone approaches are a useful counterexample to the old always-root/always-chromatic combination, not a distribution to copy.
- Use smaller voice movement with guides/register constraints. The new band improves on its own baseline; MMA's varied instrumentation and strumming are reported separately.
- Replace constant role velocities with measured sample calibration plus bounded human drum aggregates. MIDI velocity does not establish acoustic loudness by itself.
- Form-based fills and intentional support states are assessed by their eligibility/intent; the old MIDI fill proxy remains deliberately limited. No universal fill-frequency target is inferred from a generator or from a dataset of drum exercises.

No `/data/reference-midi/<tool>/` directory was present. Additional tools were not invented or silently pooled. No JJazzLab or Impro-Visor runtime claim is made.

## Historical Phase 1 snapshot (superseded runtime availability)

<!-- PHASE_1_HISTORICAL -->
# Accompaniment measurements — Phase 1

Research date: 2026-11-14. No application code changed. This document distinguishes **U: upstream runtime measurements (unavailable)**, **S: inspected source behavior**, **B: measurements of Vesper's existing MIDI exporter**, and **H: proposed hypotheses for Phase 2**. B is a diagnostic baseline, not an upstream or human-performance reference. Read with [the specification](accompaniment-spec.md).

## U — Runtime availability and missing measurements

Java 8 (Oracle 1.8.0_381) and Python 3.9.6 were already present. JJazzLab, its standalone Toolkit JAR, Impro-Visor and MMA were not found on PATH or in the checked application/development locations. Checks included /Applications, ~/Applications, ~/Downloads, ~/Documents, Java homes, Maven caches, application-support directories and common executable/share directories. Searches were bounded, not proof that no file exists anywhere on the disk.

The inspected current Toolkit 5.2.1 README requires Java 25 or newer. No newer Java runtime was found. No applications, JARs, runtime dependencies or sound/style libraries were installed. Downloaded MMA source was inspected, **not executed as a substitute installation**. Consequently no upstream application rendered MIDI. The Toolkit JAR itself was not available for analysis; its source, packaging metadata and example were analyzed instead.

Exactly what a later runtime study needs:

| Target | Missing prerequisite |
| --- | --- |
| JJazzLab / Toolkit | A runnable compatible JJazzLab installation or standalone Toolkit JAR; for the inspected current Toolkit, Java 25+; a configured rhythm generator and legally usable original test rhythm data. Do not extract/reuse Yamaha styles, bundled style libraries or sounds. |
| Impro-Visor | Compatible application/JAR and its runtime files; the installed Java 8 may support the selected release, to be checked against that release. Authorized test styles may be run in the app, never copied into Vesper. |
| MMA | An already installed/otherwise authorized MMA executable and its Python modules; Python is present. No need for new MIDI-analysis dependencies. |

NM below means **not measured**, never zero. All requested upstream bass, comping, drums and variation statistics are NM for each case:

| Fixture | BPM | JJazzLab | Impro-Visor | MMA |
| --- | --- | --- | --- | --- |
| blues12 | 60 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| blues12 | 120 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| blues12 | 180 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| blues12 | 240 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| aaba32 | 60 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| aaba32 | 120 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| aaba32 | 180 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| aaba32 | 240 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| ballad16 | 60 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| ballad16 | 120 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| ballad16 | 180 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| ballad16 | 240 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| bossa16 | 60 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| bossa16 | 120 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| bossa16 | 180 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| bossa16 | 240 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| waltz16 | 60 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| waltz16 | 120 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| waltz16 | 180 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| waltz16 | 240 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| funk16 | 60 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| funk16 | 120 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| funk16 | 180 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |
| funk16 | 240 | NM — app/JAR/runtime | NM — app absent | NM — MMA absent |

No claim about what the upstream apps sound like at these tempos follows from static source analysis. Fast ballad, fast bossa and very slow funk are stress cases; upstream style validity would have to be checked before exporting.

## B — Baseline method and original test charts

The existing Vesper pure MIDI-export API was imported read-only. Actual generation currently resides in `src/lib/accompaniment.js`, alongside `plan.js`, `midi.js`, `audio.js` and `samples.js`. The study did not call the sampler or change the app. Each case used four choruses and three separate exports: 6 fixtures × 4 tempos × 3 = **72 MIDI files**. Statistics below use run 0; runs 1 and 2 were checked for byte identity. All three exports matched within every case.

Count-in 0; metronome off; embellishments on; swing control 0.6; harmony setting 0; no practice tempo/transposition increments. MIDI type 1, 480 ticks/quarter. Channels: keys 0, bass 1, drums 9. A standard-library SMF parser paired note-on/off events FIFO; no unmatched notes. MIDI ticks were converted into quarter-note beats. None of these results measure sample loudness, decay, loading failures or the live audio mix.

Original fixtures (not downloaded songs): each slash-separated item is a bar; a comma marks two equally spaced chord changes. Pitch/chord notation here is descriptive, not an upstream file format.

**blues12** — Medium Swing, 4/4: C7 / F7 / C7 / C7 / F7 / F7 / C7 / A7 / Dm7 / G7 / C7,A7 / Dm7,G7

**aaba32** — Medium Swing, 4/4: A (8 bars): Cmaj7 / A7 / Dm7 / G7 / Em7 / A7 / Dm7,G7 / C6. Repeat A. B (8): E7 / E7 / A7 / A7 / D7 / D7 / G7 / G7. Return A.

**ballad16** — Ballad, 4/4: Ebmaj7 / Cm7 / Fm7 / Bb7 / Gm7 / C7 / Fm7 / Bb7 / Abmaj7 / Abm6 / Ebmaj7 / C7 / Fm7 / Bb7 / Ebmaj7 / Bb7

**bossa16** — Bossa Nova, 4/4: Dm9 / G13 / Cmaj7 / Cmaj7 / Fmaj7 / Bb7 / Em7 / A7 / Dm9 / G13 / Cmaj7 / A7 / Dm7 / G7 / C6 / G7

**waltz16** — Waltz, 3/4: Cmaj7 / Am7 / Dm7 / G7 / Em7 / A7 / Dm7 / G7 / Fmaj7 / Fm6 / Em7 / A7 / Dm7 / G7 / C6 / G7

**funk16** — Funk, 4/4: `T44*A[C-9    / F9    / C-9    / C-9    / Ab^7    / G7alt    / C-9    / G7alt    / *BC-9    / F9    / C-9    / C-9    / Ab^7    / G7alt    / C-9    / G7alt   Z` (Vesper chart notation; original fixture)

Sections: blues has three four-bar groups; AABA has four eight-bar section instances; remaining fixtures have two eight-bar groups. Section-instance labels used for analysis are retained independently of Vesper's single-letter section notation. All tempos are quarter-note BPM.

### Metric definitions and limits

- Bass intervals are signed MIDI semitones between consecutive attacks, including section/chorus transitions. Range is minimum–maximum MIDI note number. Lengths are note-on to note-off in quarter beats, not audible sample tails.
- Root percentage denominator: bars having harmony on beat 0. A root must attack on that beat; root pitch class is used, respecting a slash bass where present. All eligible bars here have a downbeat attack.
- Approach denominator: boundaries where the next bar changes bass root, and the next bass target attacks on its downbeat. Test the final quarter-note beat attack in the preceding bar. Report signed distance to next target; chromatic = absolute interval 1, stepwise = absolute interval 1 or 2. No last-beat attack is not an approach failure in a sustained two-feel; its coverage is reported separately. Intra-bar changes are excluded from this particular metric.
- Two-feel classifier applies only to 4/4 bars with exactly two attacks at 0 and 2. Walking applies only to 4/4 bars with one attack per quarter. Other grooves remain unclassified; four syncopated bass attacks do not automatically mean walking.
- Comp hits are groups of simultaneous note-ons. Positions are **zero-based** within each bar: 0 = beat 1, 1.5 = the eighth after beat 2, 1.6 = its swung location at this swing setting. Histogram positions are snapped to the nearest expected subdivision; actual residual timing is tabulated separately. Voicing size/range describe emitted MIDI, not a hand model.
- Voice leading compares adjacent comp clusters only when their harmony changes. Match the smaller sorted voicing to an order-preserving subset of the larger with minimum summed absolute motion. Report semitones per matched voice and unmatched-voice fraction; this approximation is not a perceptual score or voice identity tracker.
- Ride swing ratio requires an onbeat → offbeat → next onbeat triplet on ride MIDI notes 51/59. Without those triplets it is **unidentifiable**, not proof of straight feel. Report median long:short duration ratio.
- Fills are a limited **baseline-specific candidate detector**: an offbeat snare attack in the final quarter-note beat with velocity ≥55. Ghost snare velocity is 37 here; added candidate hits use 66. Span is first candidate onset to barline, not a transcription of a multi-note fill. This detector is unsuitable as a universal upstream fill classifier.
- Chorus variation compares the same written bar in successive choruses. Rhythm signature includes onsets and, for drums, instrument; note signature also includes pitch. Velocity is excluded. High variation can be incidental ghost-note motion; low variation can be desirable in a stable groove.

## B01 — Per-style, per-tempo bass measurements

| Fixture | BPM | Bars | Bass notes | MIDI range | Root beat 1 | Last beat / eligible | Chromatic approach % | 2-feel / walking % | Length min–max; SD |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| blues12 | 60 | 48 | 192 | 28–48 | 100% | 39/39 | 100 | 0 / 100 | 0.879–0.879; 0 |
| blues12 | 120 | 48 | 192 | 28–48 | 100% | 39/39 | 100 | 0 / 100 | 0.879–0.879; 0 |
| blues12 | 180 | 48 | 192 | 28–48 | 100% | 39/39 | 100 | 0 / 100 | 0.879–0.879; 0 |
| blues12 | 240 | 48 | 192 | 28–48 | 100% | 39/39 | 100 | 0 / 100 | 0.879–0.879; 0 |
| aaba32 | 60 | 128 | 512 | 28–52 | 100% | 104/104 | 100 | 0 / 100 | 0.879–0.879; 0 |
| aaba32 | 120 | 128 | 512 | 28–52 | 100% | 104/104 | 100 | 0 / 100 | 0.879–0.879; 0 |
| aaba32 | 180 | 128 | 512 | 28–52 | 100% | 104/104 | 100 | 0 / 100 | 0.879–0.879; 0 |
| aaba32 | 240 | 128 | 512 | 28–52 | 100% | 104/104 | 100 | 0 / 100 | 0.879–0.879; 0 |
| ballad16 | 60 | 64 | 128 | 36–51 | 100% | 0/59 | 0 | 100 / 0 | 1.65–1.65; 0 |
| ballad16 | 120 | 64 | 128 | 36–51 | 100% | 0/59 | 0 | 100 / 0 | 1.65–1.65; 0 |
| ballad16 | 180 | 64 | 128 | 36–51 | 100% | 0/59 | 0 | 100 / 0 | 1.65–1.65; 0 |
| ballad16 | 240 | 64 | 128 | 36–51 | 100% | 0/59 | 0 | 100 / 0 | 1.65–1.65; 0 |
| bossa16 | 60 | 64 | 256 | 28–38 | 100% | 59/59 | 6.78 | 0 / 0 | 0.421–1.25; 0.415 |
| bossa16 | 120 | 64 | 256 | 28–38 | 100% | 59/59 | 6.78 | 0 / 0 | 0.421–1.25; 0.415 |
| bossa16 | 180 | 64 | 256 | 28–38 | 100% | 59/59 | 6.78 | 0 / 0 | 0.421–1.25; 0.415 |
| bossa16 | 240 | 64 | 256 | 28–38 | 100% | 59/59 | 6.78 | 0 / 0 | 0.421–1.25; 0.415 |
| waltz16 | 60 | 64 | 128 | 33–50 | 100% | 59/59 | 6.78 | 0 / 0 | 0.879–0.879; 0 |
| waltz16 | 120 | 64 | 128 | 33–50 | 100% | 59/59 | 6.78 | 0 / 0 | 0.879–0.879; 0 |
| waltz16 | 180 | 64 | 128 | 33–50 | 100% | 59/59 | 6.78 | 0 / 0 | 0.879–0.879; 0 |
| waltz16 | 240 | 64 | 128 | 33–50 | 100% | 59/59 | 6.78 | 0 / 0 | 0.879–0.879; 0 |
| funk16 | 60 | 64 | 256 | 31–41 | 100% | 55/55 | 14.545 | 0 / 0 | 0.4–0.4; 0 |
| funk16 | 120 | 64 | 256 | 31–41 | 100% | 55/55 | 14.545 | 0 / 0 | 0.4–0.4; 0 |
| funk16 | 180 | 64 | 256 | 31–41 | 100% | 55/55 | 14.545 | 0 / 0 | 0.4–0.4; 0 |
| funk16 | 240 | 64 | 256 | 31–41 | 100% | 55/55 | 14.545 | 0 / 0 | 0.4–0.4; 0 |

Intervals are unchanged across the four tempos within each fixture. Counts below are for one four-chorus export, **not pooled across tempos**.

| Fixture | Consecutive interval:count (semitones) | Approach interval:count |
| --- | --- | --- |
| blues12 | -3:31, -2:36, -1:44, 1:31, 2:8, 3:17, 4:20, 9:4 | -1:16, 1:23 |
| aaba32 | -7:4, -4:16, -3:72, -2:76, -1:126, 1:81, 2:20, 3:47, 4:52, 5:4, 6:4, 9:9 | 1:45, -1:59 |
| ballad16 | -7:7, -5:8, -3:12, -2:4, 0:68, 5:28 | None: no last-beat attacks |
| bossa16 | -5:40, -2:36, -1:4, 0:135, 2:4, 5:4, 7:24, 10:8 | -2:36, -1:4, 10:8, 2:4, 0:7 |
| waltz16 | -7:11, -5:4, -3:8, -2:4, -1:4, 0:68, 5:28 | -3:8, 5:28, -7:11, -2:4, -1:4, -5:4 |
| funk16 | -5:16, -4:8, -1:8, 0:200, 5:23 | 5:23, -5:16, -4:8, -1:8 |

## B02 — Per-style, per-tempo comping and measured ride swing

| Fixture | BPM | Comp hits/bar | Voicing size mean (min–max) | MIDI range | Voice motion mean / p90 | Comp velocity | Ride long:short |
| --- | --- | --- | --- | --- | --- | --- | --- |
| blues12 | 60 | 2.292 | 4 (4–4) | 50–84 | 3.596 / 4.25 | 48–83 | 1.5 |
| blues12 | 120 | 2.292 | 4 (4–4) | 50–84 | 3.596 / 4.25 | 48–83 | 1.5 |
| blues12 | 180 | 2.292 | 4 (4–4) | 50–84 | 3.596 / 4.25 | 48–83 | 1.5 |
| blues12 | 240 | 2.292 | 4 (4–4) | 50–84 | 3.596 / 4.25 | 48–83 | 1.5 |
| aaba32 | 60 | 2.32 | 4.108 (4–5) | 50–84 | 3.561 / 5.25 | 48–83 | 1.5 |
| aaba32 | 120 | 2.32 | 4.108 (4–5) | 50–84 | 3.561 / 5.25 | 48–83 | 1.5 |
| aaba32 | 180 | 2.32 | 4.108 (4–5) | 50–84 | 3.561 / 5.25 | 48–83 | 1.5 |
| aaba32 | 240 | 2.32 | 4.108 (4–5) | 50–84 | 3.561 / 5.25 | 48–83 | 1.5 |
| ballad16 | 60 | 2 | 4.062 (4–5) | 50–84 | 3.484 / 5.25 | 32–67 | NM |
| ballad16 | 120 | 2 | 4.062 (4–5) | 50–84 | 3.484 / 5.25 | 32–67 | NM |
| ballad16 | 180 | 2 | 4.062 (4–5) | 50–84 | 3.484 / 5.25 | 32–67 | NM |
| ballad16 | 240 | 2 | 4.062 (4–5) | 50–84 | 3.484 / 5.25 | 32–67 | NM |
| bossa16 | 60 | 3.469 | 4.063 (4–5) | 50–84 | 3.428 / 5.25 | 53–88 | NM |
| bossa16 | 120 | 3.469 | 4.063 (4–5) | 50–84 | 3.428 / 5.25 | 53–88 | NM |
| bossa16 | 180 | 3.469 | 4.063 (4–5) | 50–84 | 3.428 / 5.25 | 53–88 | NM |
| bossa16 | 240 | 3.469 | 4.063 (4–5) | 50–84 | 3.428 / 5.25 | 53–88 | NM |
| waltz16 | 60 | 2.5 | 5 (5–5) | 50–84 | 1.937 / 2.4 | 48–83 | NM |
| waltz16 | 120 | 2.5 | 5 (5–5) | 50–84 | 1.937 / 2.4 | 48–83 | NM |
| waltz16 | 180 | 2.5 | 5 (5–5) | 50–84 | 1.937 / 2.4 | 48–83 | NM |
| waltz16 | 240 | 2.5 | 5 (5–5) | 50–84 | 1.937 / 2.4 | 48–83 | NM |
| funk16 | 60 | 3.188 | 5 (5–5) | 56–70 | 1.2 / 2 | 65–100 | NM |
| funk16 | 120 | 3.188 | 5 (5–5) | 56–70 | 1.2 / 2 | 65–100 | NM |
| funk16 | 180 | 3.188 | 5 (5–5) | 56–70 | 1.2 / 2 | 65–100 | NM |
| funk16 | 240 | 3.188 | 5 (5–5) | 56–70 | 1.2 / 2 | 65–100 | NM |

Histogram counts and voicings are unchanged across tempos within each fixture.

| Fixture | Comp position:count | Unmatched voices mean % |
| --- | --- | --- |
| blues12 | 0:44, 0.6:6, 1:10, 1.6:14, 2:8, 2.6:18, 3:6, 3.6:4 | 0 |
| aaba32 | 0:117, 0.6:28, 1:28, 1.6:28, 2:26, 2.6:28, 3:14, 3.6:28 | 3.74 |
| ballad16 | 0:64, 1.5:32, 2.5:32 | 2.54 |
| bossa16 | 0:62, 0.5:16, 1:16, 1.5:32, 2:32, 2.5:16, 3:32, 3.5:16 | 2.712 |
| waltz16 | 0:64, 0.5:16, 1:16, 1.5:32, 2:16, 2.5:16 | 0 |
| funk16 | 0:60, 0.5:16, 1:16, 1.5:32, 2:16, 2.5:16, 3:32, 3.5:16 | 0 |

Measured comp onset residuals relative to the snapped grid, in milliseconds; PPQ quantization affects these numbers. A delayed cluster is not necessarily an intentional humanization model.

| Fixture | BPM | Residual min / median / max (ms) |
| --- | --- | --- |
| blues12 | 60 | 6.25 / 8.333 / 10.417 |
| blues12 | 120 | 6.25 / 8.333 / 11.458 |
| blues12 | 180 | 6.25 / 8.333 / 11.111 |
| blues12 | 240 | 6.25 / 7.812 / 10.938 |
| aaba32 | 60 | 6.25 / 8.333 / 10.417 |
| aaba32 | 120 | 6.25 / 8.333 / 11.458 |
| aaba32 | 180 | 6.25 / 8.333 / 11.111 |
| aaba32 | 240 | 6.25 / 7.813 / 10.938 |
| ballad16 | 60 | 0 / 0 / 2.083 |
| ballad16 | 120 | 0 / 0.521 / 3.125 |
| ballad16 | 180 | 0 / 0.347 / 2.778 |
| ballad16 | 240 | 0 / 0.521 / 3.125 |
| bossa16 | 60 | 0 / 0 / 2.083 |
| bossa16 | 120 | 0 / 0 / 3.125 |
| bossa16 | 180 | 0 / 0 / 2.778 |
| bossa16 | 240 | 0 / 0 / 3.125 |
| waltz16 | 60 | 0 / 0 / 2.083 |
| waltz16 | 120 | 0 / 0.521 / 3.125 |
| waltz16 | 180 | 0 / 0.347 / 2.778 |
| waltz16 | 240 | 0 / 0.521 / 3.125 |
| funk16 | 60 | 0 / 0 / 2.083 |
| funk16 | 120 | 0 / 0 / 3.125 |
| funk16 | 180 | 0 / 0 / 2.778 |
| funk16 | 240 | 0 / 0 / 3.125 |

## B03 — Drum instruments, dynamics and fills

The following complete per-instrument histograms apply at **60, 120, 180 and 240 BPM**; positions are beats, so wall-clock spacing changes. Counts describe one four-chorus export at each tempo. Velocity ranges are MIDI values, not acoustic levels. Instruments absent from a fixture have zero hits.

| Fixture | Instrument | Hits/bar | Position:count | Velocity min–max |
| --- | --- | --- | --- | --- |
| blues12 | kick | 1.75 | 0:48, 2:36 | 48–48 |
| blues12 | pedal_hat | 2 | 1:48, 3:48 | 79–79 |
| blues12 | ride | 6 | 0:48, 1:48, 1.6:48, 2:48, 3:48, 3.6:48 | 49–87 |
| blues12 | snare | 0.896 | 0.6:11, 1.6:8, 2.6:7, 3.6:17 | 37–66 |
| aaba32 | kick | 1.75 | 0:128, 2:96 | 48–48 |
| aaba32 | pedal_hat | 2 | 1:128, 3:128 | 79–79 |
| aaba32 | ride | 6 | 0:128, 1:128, 1.6:128, 2:128, 3:128, 3.6:128 | 49–87 |
| aaba32 | snare | 0.906 | 0.6:25, 1.6:25, 2.6:24, 3.6:42 | 37–66 |
| ballad16 | kick | 1 | 0:64 | 42–42 |
| ballad16 | pedal_hat | 2 | 1:64, 3:64 | 65–65 |
| ballad16 | ride | 4 | 0:64, 1:64, 2:64, 3:64 | 44–61 |
| bossa16 | closed_hat | 4 | 0:64, 1:64, 2:64, 3:64 | 61–78 |
| bossa16 | kick | 4 | 0:64, 1.5:64, 2:64, 3.5:64 | 54–72 |
| bossa16 | pedal_hat | 2 | 1:64, 3:64 | 64–64 |
| bossa16 | rim | 2.5 | 0:32, 1:32, 1.5:32, 2:32, 3:32 | 72–85 |
| waltz16 | closed_hat | 6 | 0:64, 0.5:64, 1:64, 1.5:64, 2:64, 2.5:64 | 48–79 |
| waltz16 | kick | 2 | 0:64, 2:64 | 85–100 |
| waltz16 | snare | 1 | 1:64 | 89–89 |
| funk16 | closed_hat | 10 | 0:64, 0.5:64, 0.75:64, 1:64, 1.5:64, 2:64, 2.5:64, 2.75:64, 3:64, 3.5:64 | 34–79 |
| funk16 | kick | 3 | 0:64, 1.5:32, 2:64, 3.5:32 | 85–100 |
| funk16 | snare | 3.125 | 1:64, 2.5:64, 3:64, 3.5:8 | 35–98 |

| Fixture (all four BPMs) | Candidate performed bars, 1-based | Candidate span beats | Candidates at chorus ends |
| --- | --- | --- | --- |
| blues12 | 8, 16, 24, 32, 40, 48 | 0.4 | 2/4 |
| aaba32 | 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128 | 0.4 | 4/4 |
| ballad16 | None | NM | 0/4 |
| bossa16 | None | NM | 0/4 |
| waltz16 | None | NM | 0/4 |
| funk16 | 8, 16, 24, 32, 40, 48, 56, 64 | 0.5 | 4/4 |

Blues has candidates every eighth performed bar, crossing its twelve-bar phrase cycle: only two of four chorus ends receive one. No detector candidates in ballad/bossa/waltz does not prove those styles always need fills. Swing kick and pedal-hat velocities are constant at 48 and 79 respectively. Waltz uses a straight subdivision grid with snare on zero-based beat 1; source inspection confirms it falls through the generic non-specialized drum branch rather than a dedicated jazz-waltz arrangement.

## B04 — Variation across choruses and sections

All following numbers apply separately at each of the four tempos. Percentages compare successive choruses at the same written bar, not unrelated bars in a song.

| Fixture | Role | Comparisons | Rhythm changed % | Notes changed % | Unique rhythm bars |
| --- | --- | --- | --- | --- | --- |
| blues12 | bass | 36 | 0 | 8.333 | 1 |
| blues12 | comping | 36 | 25 | 44.444 | 9 |
| blues12 | drums | 36 | 100 | 100 | 13 |
| aaba32 | bass | 96 | 0 | 2.083 | 1 |
| aaba32 | comping | 96 | 87.5 | 87.5 | 15 |
| aaba32 | drums | 96 | 96.875 | 96.875 | 14 |
| ballad16 | bass | 48 | 0 | 4.167 | 1 |
| ballad16 | comping | 48 | 0 | 31.25 | 2 |
| ballad16 | drums | 48 | 0 | 0 | 1 |
| bossa16 | bass | 48 | 0 | 0 | 1 |
| bossa16 | comping | 48 | 100 | 100 | 6 |
| bossa16 | drums | 48 | 0 | 0 | 2 |
| waltz16 | bass | 48 | 0 | 6.25 | 1 |
| waltz16 | comping | 48 | 100 | 100 | 4 |
| waltz16 | drums | 48 | 0 | 0 | 1 |
| funk16 | bass | 48 | 0 | 0 | 1 |
| funk16 | comping | 48 | 100 | 100 | 6 |
| funk16 | drums | 48 | 0 | 0 | 3 |

| Fixture | Section instance | Bars sampled | Bass attacks/bar | Comp hits/bar | Drum hits/bar |
| --- | --- | --- | --- | --- | --- |
| blues12 | A | 16 | 4 | 2.25 | 10.625 |
| blues12 | B | 16 | 4 | 2.25 | 10.625 |
| blues12 | C | 16 | 4 | 2.375 | 10.688 |
| aaba32 | A1 | 32 | 4 | 2.5 | 10.594 |
| aaba32 | A2 | 32 | 4 | 2.281 | 10.625 |
| aaba32 | B | 32 | 4 | 1.906 | 10.719 |
| aaba32 | A3 | 32 | 4 | 2.594 | 10.688 |
| ballad16 | A | 32 | 2 | 2 | 7 |
| ballad16 | B | 32 | 2 | 2 | 7 |
| bossa16 | A | 32 | 4 | 3.438 | 12.5 |
| bossa16 | B | 32 | 4 | 3.5 | 12.5 |
| waltz16 | A | 32 | 2 | 2.5 | 9 |
| waltz16 | B | 32 | 2 | 2.5 | 9 |
| funk16 | A | 32 | 4 | 3.188 | 16.125 |
| funk16 | B | 32 | 4 | 3.188 | 16.125 |

Section-density differences alone do not establish an intentional arrangement curve. All three independent exports are byte-identical in every style/tempo case. Reproducibility is useful; the limitation is the lack of an exposed alternate-arrangement seed, rather than determinism itself.

## S — Source evidence, not exported performance

Impro-Visor's selected native text styles contain the following alternative counts. They demonstrate distinct role banks and selection weights, **not actual selection frequencies, MIDI targets, or permission to reuse the patterns**. These are Impro-Visor's own textual style syntax, not Yamaha binary .sty assets.

| Style | Bass alternatives | Chord alternatives | Drum alternatives |
| --- | --- | --- | --- |
| funk | 8 | 3 | 1 |
| swing | 16 | 3 | 10 |
| bossa | 7 | 6 | 8 |
| ballad | 8 | 15 | 4 |
| waltz | 4 | 2 | 3 |

Vesper's live sampler applies additional per-note gain/timing/articulation behavior not represented by these exported MIDI statistics. This was established by source inspection, not audio measurement. MIDI cannot establish whether drums are audible. Phase 2 must measure the final shared event plan and listen to the rendered samples before attributing an acoustic fault to composition alone.

## Measurement anchors for implementation decisions

| Anchor | Observed result | Consequence to test, not a claimed upstream norm |
| --- | --- | --- |
| M01 | Swing ride ratio 1.5 at every tested tempo, both swing fixtures | Make swing tempo-dependent; audition a less lopsided fast feel. |
| M02 | Swing bass walking 100%, two-feel 0% from 60–240 BPM | Add phrase-aware two-feel/walking decisions and an override. |
| M03 | Root downbeats 100%; chromatic approach 100% of 39/104 eligible swing boundaries | Add contextual chord/scale/approach choices without sacrificing harmonic clarity. |
| M04 | Swing mean matched-voice movement 3.596 / 3.561 semitones | Try bounded voicing search retaining common tones and guides. |
| M05 | Ballad 2 comp hits/bar, 0% chorus rhythm change; onset 0 in every bar | Add sparse phrase-level comping, holds and deliberate rests. |
| M06 | Bossa, waltz and funk drums: 0% chorus rhythm change | Vary support/energy at section boundaries while retaining timekeeper identity. |
| M07 | Fill candidates are single late hits, 0.4/0.5 beats long; blues chorus-end coverage 2/4 | Plan optional bounded fills from actual form rather than modulo eight alone. |
| M08 | Waltz drum grid: six straight eighths/bar, snare on beat 2; generic branch in source | Implement an explicit three-beat jazz-waltz family. |
| M09 | Bass length SD 0 in swing/ballad/waltz/funk; swing kick/foot velocity SD 0 | Shape articulation and repeated-note dynamics by role and phrase. |
| M10 | All 24 cases repeat byte-identically; MIDI omits some live sampler transforms (S) | Share a seeded performance plan between export/live and expose alternate takes. |

## H — Original starting targets, pending listening review

These are design hypotheses, **not measurements of JJazzLab, Impro-Visor, MMA or real musicians**. They can be changed after blind listening. Never apply a swing-specific target to every groove.

| Test | Initial acceptance hypothesis | Linked evidence |
| --- | --- | --- |
| Swing ratio at 60 / 120 / 180 / 240 BPM | Audition 1.9 / 1.65 / 1.3 / 1.12, interpolate; keep a user override | M01 |
| Swing bass mode | Auto ballad/low-energy sections can use two-feel; explicit walk remains walking. No universal tempo percentage imposed. | M02 |
| Swing approach diversity | On these changing-boundary fixtures, try 30–65% chromatic approaches, remainder eligible diatonic/chord-tone connections or holds; require no forced approach at every boundary | M03 |
| Swing bass beat-one anchoring | Try 80–95% root attacks overall, prioritizing roots/slash bass on new sections and ambiguous harmony; evaluate the remaining notes musically | M03 |
| Comp voice leading | On AABA fixture aim mean ≤2.5 semitones/matched voice without register/span violations; report unmatched voices separately | M04 |
| Low-energy ballad comping | Audition 0.75–1.5 hits/bar over a section, including whole-bar rests; do not force every bar to meet a quota | M05 |
| Support variation | At least two intentional section/chorus support states over four choruses; don't randomize the core bossa/funk pulse each bar | M06 |
| Fills | Candidate fill windows end at actual phrase/section boundaries; no off-boundary fill forced by a global bar counter; rests may replace fills | M07 |
| Dynamics/articulation | Repeated timekeeper notes have role-shaped nonzero variance; use bounded timing and length changes, with no negative onset/stuck notes | M09 |
| Shared rendering | Fixed seed gives identical plan in live/export; changing seed changes discretionary events while preserving form, harmony and groove | M10 |

## Reproducibility and scope of retained evidence

Research working directory: `/tmp/accomp-research`. No research tree was committed. The source quarantine contains selected source-only archives, source/provenance hashes, manual pages, REA JSON inventories/observations and no extracted sounds or Yamaha rhythm data. These are research inputs, not Phase 2 implementation materials.

The independent scripts `export-vesper-baseline.mjs` and `analyze-midi.py` generated `fixtures.json`, `baseline-manifest.json`, `baseline-measurements.json` and `baseline-midi/`. The MIDI files contain only the six original fixtures rendered by existing Vesper. Analysis has no third-party Python dependencies. Raw files are temporary; all decision-critical aggregates, charts, definitions and limitations are included above so the two final documents stand alone.

REA README was read before invocation. No MCP registration was available; the installed CLI was used with documented `inspect-artifact`, `list-browser-targets` and `inspect-web-page` commands. Artifact inventories establish contents/hashes; inert local HTML source views establish observed source text. Manual source following supplies the musical interpretation. These are **not REA execution traces of the accompaniment apps**, semantic Java decompilation, or proof of runtime MIDI behavior.

- jjazz REA source-observation evidence: `ev_2d85080e206f690d0485717dd8cd710b9bbc7f0062527e31c1f63aa17133684e`.
- toolkit REA source-observation evidence: `ev_1c02c6fc117808a8dcfd215fcbcc96d715ff02638436b0a96bd7be57c0c5e182`.
- improvisor REA source-observation evidence: `ev_b41318c2e10bb0e862ff9cf851ca02652c0076fbbfb6fe90578201780e682640`.
- mma REA source-observation evidence: `ev_a1d38d66e9a4773b02b647d553fda5e7908bf3382991d49687f7fc89f156a4ea`.

### Integrity

Before/after SHA-256 comparison: 47 application source files checked; all unchanged. No application code was written by this research.
- `baseline-measurements.json` SHA-256: `69d8726d2d8790c36fd2f246c5fbf786fb04c4c23e2e09a39c14e3116f8131d0`.
- `fixtures.json` SHA-256: `e96ae26fb224e223d51c0d25a42d870991a0792404a441ab289c288168dcd27c`.
- `analyze-midi.py` SHA-256: `fad4fcf1573f97975f2b8e84e12558f3c977fde148dc09e55d9b2b43b6b09656`.
- `export-vesper-baseline.mjs` SHA-256: `a6f0a91dda5f76fb7d34f5bf9d1983b4ba79597b965e77f590f20cf961637570`.

Source provenance: [pinned source reading map](accompaniment-spec.md#12-primary-source-reading-map); [Toolkit prerequisites](https://github.com/jjazzboss/JJazzLabToolkit/blob/4d38b923166a43b0ca573093e235f0461b72f606/README.md); [MMA downloads](https://www.mellowood.ca/mma/downloads.html).
