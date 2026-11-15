# Band diagnosis — 2026-11-14

The installed app and the writable project copy have identical audio/planner/control files. The original folder is still outside this session's writable roots; fixes will be completed/tested in the writable copy and packaged for guarded application.

## Reproduced failure

On modal-vamp-aaba, Medium Swing 136 BPM, seed 1, **Walk's first eight bars are all `[38,38,38,38]` (D2 four times)**. There is one unique pitch fingerprint. The full modal plan uses only two piano voicings. Piano durations cluster around 0.65 beat; tiny duration jitter is not a comping vocabulary.

## Root causes

- The Bass feel select **does reach** settings, `PracticeEngine.update`, `getPlan`, and `planPerformance`. The setting is not lost in React. Walk changes the attack grid, but Auto already chooses that same grid at medium tempo. Walk therefore leaves the flawed pitch selection unchanged.
- Every bar's beat-one anchor is independently preselected from its chord, almost always the root. There is no modal-span contour, waypoint progression or register itinerary.
- Repeating a pitch costs only 1.1, while moving even two semitones costs at least 2. The deterministic lowest-cost path therefore wins by repeating D. Chord tones include the prior root; repetitions are penalized weakly, not forbidden.
- The search carries last pitch but no interval fingerprint, direction-run count or previous-phrase contour. Its two-bar target is an attraction to another root, reinforcing the same result on a vamp.
- Seeds do include phrase, role and bar identity. They are not accidentally identical across bars. However the final path is always `paths[0]`, so random differences cannot overcome deterministic root anchoring and cost minimization. The cache keys include feel and seed; stale cache reuse is not the primary fault.
- `voicingCandidates(...)[0]` always selects the same best common-tone voicing. Its repetition penalty is weaker than its common-tone/movement rewards. The bank has only a handful of gestures; voiced attacks mostly have short durations, and no real phrase arc, hold schedule or conditional statement/answer relationship.
- A production `original-band.js` path still exists and can generate its own events when the A/B setting is Original. It must be removed from production generation. Original comparison will retain a captured immutable take, not invoke a second planner.
- The planner composes the whole song before play. It has no live seed ledger, committed phrase prefix or state restoration at an unplayed boundary.
- The sampler schedules a flat gate until `min(requested duration, natural sample length)`, then ends at `min(hold+release,natural)`. Consequently a recorded note that ends early cannot sustain a requested long chord. Piano has no sustain-loop/residual-tail mechanism. This is a separate issue from the short generated notes. Offline 4-beat tests at velocities 40/80/110 will quantify it before and after the renderer fix; bass and cymbal decay will be checked too.

## Repair direction

One phrase-session planner will carry bass direction/history, voicing/gesture history, energy and fill cooldown. Bass repetition becomes a hard candidate exclusion, chord-span contour/waypoint rules replace independent root anchors, and seeded temperature selection chooses among bounded paths. The piano gets independently authored tagged gestures and guide/extension voicings with actual holds, pushes and rolls. Drums plan structural windows first and interact with the piano activity map. Immutable committed prefixes survive live edits; only unplayed material changes. Sustain is verified acoustically, not inferred from MIDI note lengths.

No gate threshold has been relaxed. Gate ambiguities/conflicts and any failures remaining after the 20-round limit will be explicitly recorded in the final results.
