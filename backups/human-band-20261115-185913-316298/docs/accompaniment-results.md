# Accompaniment implementation results

2026-11-14. These are reproducible measurements of the original Vesper generator, the new Vesper band, and **MMA 25.05.3 separately**. MMA is an automatic generator, not a human reference. GMD supplies independent human drum statistics; it supplies no harmony, bass lines or comping gestures. No source is pooled with another.

The new band, controls, samples and theme updates are implemented in the writable `band-engine-work` copy. The original app folder remains blocked by macOS write permissions. The prepared apply package is required to update that folder. This deployment limitation is distinct from the tested implementation.

## Before / after at 120 BPM

Four choruses per fixture. Root and approach rates are percentages; two-feel/walking are rhythmic classifiers rather than a musical judgment. Voice motion is semitones per matched voice. Complete per-tempo numbers follow.

| Fixture | Root % old → new | Chromatic approach % old → new | Comp hits/bar old → new | Voice motion old → new | MMA comp hits/bar / voice motion |
| --- | --- | --- | --- | --- | --- |
| blues12 | 100 → 91.667 | 100 → 48.718 | 2.292 → 1.729 | 3.596 → 1.423 | 3.667 / 1.606 |
| aaba32 | 100 → 92.969 | 100 → 46.154 | 2.32 → 1.602 | 3.561 → 1.35 | 3.531 / 1.713 |
| ballad16 | 100 → 95.312 | 0 → 0 | 2 → 0.75 | 3.484 → 1.246 | 3.75 / 0.948 |
| bossa16 | 100 → 95.312 | 6.78 → 11.864 | 3.469 → 2 | 3.428 → 1.244 | 5.5 / 1.695 |
| waltz16 | 100 → 95.312 | 6.78 → 32.203 | 2.5 → 1.391 | 1.937 → 1.216 | 5.109 / 1.508 |
| funk16 | 100 → 93.75 | 14.545 → 12.727 | 3.188 → 2.234 | 1.2 → 0.811 | 5.359 / 4.135 |

## All style/tempo cases, sources kept separate

The same original charts, four choruses and three exports per case were used. 72 baseline + 72 new + 72 MMA MIDI files were rendered for the comparison. Rows describe run 0; independent-export equality and chorus variation are recorded in the aggregate file. The new fixed seed is intentionally reproducible. New take changes discretionary events.

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

Ride ratio is unidentifiable where the reference has no eligible onbeat/offbeat/onbeat ride triplets. Do not read N/M as 1:1 or infer straight timing from absent ride notes. The stock MMA swing groove uses hats and additional percussion, so it cannot be used to calibrate a ride curve directly.

## Articulation and variation

At 120 BPM; corresponding complete per-tempo distributions are in [the aggregate JSON](accompaniment-metrics.json). Repetition is the proportion of matching written bars whose rhythm repeats in the next chorus. It excludes velocity differences. More novelty is not always better: bossa/funk timekeeping anchors remain stable and discretionary support changes.

| Source | Fixture | Bass length SD (beats) | Bass range (MIDI) | Comp size mean | Comp rhythm repetition % | Drum rhythm repetition % |
| --- | --- | --- | --- | --- | --- | --- |
| baseline | blues12 | 0 | 28–48 | 4 | 75 | 0 |
| baseline | aaba32 | 0 | 28–52 | 4.108 | 12.5 | 3.125 |
| baseline | ballad16 | 0 | 36–51 | 4.062 | 100 | 100 |
| baseline | bossa16 | 0.415 | 28–38 | 4.063 | 0 | 100 |
| baseline | waltz16 | 0 | 33–50 | 5 | 0 | 100 |
| baseline | funk16 | 0 | 31–41 | 5 | 0 | 100 |
| new | blues12 | 0.084 | 33–55 | 3 | 16.667 | 0 |
| new | aaba32 | 0.069 | 31–55 | 3 | 13.542 | 3.125 |
| new | ballad16 | 0.049 | 32–53 | 3 | 20.833 | 0 |
| new | bossa16 | 0.122 | 33–55 | 3.227 | 10.417 | 6.25 |
| new | waltz16 | 0.021 | 31–55 | 3 | 10.417 | 2.083 |
| new | funk16 | 0.092 | 29–48 | 3.825 | 10.417 | 6.25 |
| MMA | blues12 | 0.29 | 31–48 | 5.091 | 52.778 | 0 |
| MMA | aaba32 | 0.29 | 31–47 | 5.133 | 46.875 | 0 |
| MMA | ballad16 | 0 | 31–43 | 4 | 100 | 6.25 |
| MMA | bossa16 | 0.325 | 31–48 | 3.298 | 100 | 27.083 |
| MMA | waltz16 | 0.171 | 31–48 | 4 | 39.583 | 0 |
| MMA | funk16 | 0.194 | 31–48 | 4.385 | 100 | 100 |

The aggregate JSON also contains signed bass interval/approach distributions, note ranges and lengths, attack histograms, voicing sizes, matched/unmatched voice statistics, drum-instrument positions and velocity ranges, candidate-fill spans, section densities and variation. Only aggregates are retained; no MMA/GMD note sequence or groove is delivered.

## Fill/form checks and support states

For the new band, semantic fill intent is available directly and is more reliable than guessing from MIDI. The original/reference MIDI uses the deliberately limited candidate detector defined in the measurements document; those candidate counts are not equivalent to annotated complete fills.

| Fixture | Performed fill bars (1-based) | Fill lengths (beats) | Intentional support states | Fills on eligible boundaries |
| --- | --- | --- | --- | --- |
| blues12 | 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48 | 2 | 3 | 100% |
| aaba32 | 4, 24, 28, 36, 40, 48, 56, 68, 72, 84, 88, 92, 100, 108, 112, 116 | 0.5, 2 | 3 | 100% |
| ballad16 | 4, 20, 24, 28, 32, 36, 40, 44, 52, 56, 64 | 0.5, 2 | 3 | 100% |
| bossa16 | 4, 20, 24, 28, 32, 36, 40, 44, 52, 56, 64 | 0.5, 2 | 3 | 100% |
| waltz16 | 20, 24, 44, 48, 52, 64 | 0.5, 2 | 3 | 100% |
| funk16 | 4, 20, 24, 28, 32, 36, 40, 44, 52, 56, 64 | 0.5, 2 | 3 | 100% |

A twelve-bar chorus can now receive a fill at its actual end. Fills are optional and need not occur at every chorus ending. Whole rests remain available, especially at low energy. No additional fill is scheduled solely because a global counter reached a multiple of eight.

## Target checks

Thresholds come from `src/lib/band-config.json`. H values remain original listening hypotheses. MMA's much denser chord parts and often-rooted bass were not copied as targets; GMD affects bounded drum expression, not the swing curve or harmony.

| Check | Result | Evidence |
| --- | --- | --- |
| blues12 60 ride curve | PASS | 1.898 vs 1.9 |
| blues12 120 ride curve | PASS | 1.647 vs 1.65 |
| blues12 180 ride curve | PASS | 1.297 vs 1.3 |
| blues12 240 ride curve | PASS | 1.115 vs 1.12 |
| aaba32 60 ride curve | PASS | 1.901 vs 1.9 |
| aaba32 120 ride curve | PASS | 1.655 vs 1.65 |
| aaba32 180 ride curve | PASS | 1.305 vs 1.3 |
| aaba32 240 ride curve | PASS | 1.121 vs 1.12 |
| 60-BPM auto swing permits two-feel | PASS | measured nonzero share |
| Swing root anchoring 80–95% | PASS | all cases |
| Swing approach diversity at 120–240 BPM | PASS | 30–65% chromatic; two-feel coverage reported separately |
| Voicing movement improves for all six fixtures at 120 BPM | PASS | matched-voice comparison |
| Ballad 0.75–1.5 comp hits/bar | PASS | every tempo |
| Bass articulation variance | PASS | nonzero in every case |
| Fill/form alignment | PASS | all 24 cases |

Targets are diagnostic constraints, not a human-musician certification. The 60-BPM approach percentage is interpreted alongside the lack of final-beat attacks in two-feel, rather than forcing a walking approach into a sparse line. Shorter/repeated groove articulations need not maximize note-length variance.

## Sample levels, loudness and browser validation

Offline audio sweep: **24/24 mixes**, four choruses, measured stereo output; maximum observed peak **0.454**. The sweep uses 22,050-Hz diagnostic rendering; user WAV export is stereo 44,100 Hz.

| Instrument | Velocity | Measured RMS | Peak |
| --- | --- | --- | --- |
| piano | 32 | 0.002 | 0.012 |
| piano | 60 | 0.006 | 0.035 |
| piano | 90 | 0.012 | 0.067 |
| piano | 115 | 0.016 | 0.088 |
| bass | 32 | 0.004 | 0.031 |
| bass | 60 | 0.01 | 0.076 |
| bass | 90 | 0.016 | 0.151 |
| bass | 115 | 0.023 | 0.212 |
| ride | 32 | 0.004 | 0.116 |
| ride | 60 | 0.014 | 0.321 |
| ride | 90 | 0.025 | 0.551 |
| ride | 115 | 0.037 | 0.632 |
| rideBell | 32 | 0.006 | 0.089 |
| rideBell | 60 | 0.013 | 0.211 |
| rideBell | 90 | 0.022 | 0.362 |
| rideBell | 115 | 0.043 | 0.371 |
| hat | 32 | 0.004 | 0.167 |
| hat | 60 | 0.011 | 0.642 |
| hat | 90 | 0.017 | 0.968 |
| hat | 115 | 0.025 | 0.614 |
| footHat | 32 | 0.006 | 0.106 |
| footHat | 60 | 0.017 | 0.305 |
| footHat | 90 | 0.028 | 0.512 |
| footHat | 115 | 0.04 | 0.519 |
| openHat | 32 | 0.006 | 0.233 |
| openHat | 60 | 0.013 | 0.26 |
| openHat | 90 | 0.022 | 0.446 |
| openHat | 115 | 0.041 | 0.37 |
| kick | 32 | 0.007 | 0.059 |
| kick | 60 | 0.016 | 0.185 |
| kick | 90 | 0.028 | 0.322 |
| kick | 115 | 0.039 | 0.444 |
| snare | 32 | 0.004 | 0.093 |
| snare | 60 | 0.011 | 0.163 |
| snare | 90 | 0.02 | 0.284 |
| snare | 115 | 0.031 | 0.549 |
| rim | 32 | 0.005 | 0.099 |
| rim | 60 | 0.007 | 0.124 |
| rim | 90 | 0.012 | 0.216 |
| rim | 115 | 0.014 | 0.27 |
| tom | 32 | 0.008 | 0.034 |
| tom | 60 | 0.018 | 0.133 |
| tom | 90 | 0.032 | 0.235 |
| tom | 115 | 0.043 | 0.259 |

Isolated stems use unity mixer controls to expose velocity response; complete-mix checks use the app defaults. A raw MIDI velocity is not an acoustic loudness measurement. Individual transient peak order need not follow integrated RMS order.

A/B matching: 24/24 cases checked by rendering both versions after their excerpt-matching gains; maximum absolute RMS-level difference **0 dB** over the initial excerpt. Matching attenuates after the common master chain; it never boosts peaks. This is not whole-song LUFS normalization.

**Ten-minute 240-BPM scheduling soak: PASS.** 33 offered styles played; live plans matched deterministic export inputs. Wall time 600.576 seconds; 12862 scheduled events; maximum observed scheduling lateness 0 ms; 0 tracked voices after Stop. 

**Final all-style live/MIDI parity: PASS.** 33 offered styles played; live plans matched deterministic export inputs. Wall time 10.014 seconds; 225 scheduled events; maximum observed scheduling lateness 0 ms; 0 tracked voices after Stop. 

**Production UI checks: PASS.** 12 checks, including persistence, tuning export, credits, mobile layout, theme deletion and production playback. 

The two real-time ten-minute development soaks exercised the same scheduling architecture under a denser support configuration; the final all-style check additionally compares every serialized MIDI note against the current live plan. Subsequent palette/deletion and excerpt-gain additions have separate UI/audio checks. Background-tab suspension is still handled by the existing pause-on-timing-interruption policy; this test does not guarantee real-time audio under every OS load.

Automated output/level checks were performed; no human listening session is claimed. Use Original/New band and the saved tuning controls for the final musical audition. The implementation is complete in the writable copy, with the original-folder apply step constrained by OS permissions.

## Reproduction

Run `npm test`, `npm run build`, then `npm run eval:band`. For references, run `download-references.py`, `render-mma.mjs` (which maps track roles), and `analyze-all.py`. GMD aggregation is `scripts/build-groove-stats.mjs`; sample calibration and offline browser checks are in `scripts/accompaniment-eval/`. Raw downloaded reference materials remain outside the project. No application dependency was added.

## Final source verification

77 Node tests and the production Next.js build pass. All 33 offered styles pass current live-plan/MIDI note parity and stop checks; 12 production UI checks pass, including the exact color-managed Dark Stage palette and deleting a custom theme. The final 24-case audio sweep and independently rendered A/B matching sweep pass. Loop/seek starts on held/repeated measures preserve their preceding harmony. Comp density responds above and below its default. No application dependency was added.
