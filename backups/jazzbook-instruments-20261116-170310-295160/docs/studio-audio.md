# Recorded studio trio

The player uses recorded instruments through native Web Audio, with no new npm dependencies or runtime CDN. All 146 AAC samples (about 11.4 MiB) ship in `public/audio/studio-v1` and are included in the static HostGator export.

- **Splendid Grand Piano**: AKAI Steinway recordings, four velocity layers. Public domain, upstream SFZ mapping by kinwie and web conversion by smpldsnds.
- **D. Smolken Double Bass**: real pizzicato upright bass, two dynamics and alternating recordings. CC0.
- **Virtuosity Drums**: real jazz kit by Versilian Studios and Karoryfer Samples, performed by Austin McMahon. Three dynamic groups where available, alternating recordings, stereo overhead perspective. CC0. These are sticks, not brushes.

Pinned source revisions, hashes, full CC0 license and credits accompany the samples. The sampler is a small application module, not a general SFZ player. It supports nearest-note playback, velocity layers, alternating strikes, natural decays, release envelopes, tuning, stereo positioning, piano tone control, short room reverb and bus compression. Accompaniment now uses multi-bar comping motifs, rests, guide-tone voicings, articulated note lengths, dynamic phrase arcs, swing ride skips, pedal hi-hat, quiet snare ghosts, and walking bass approaches. Swing, two-feel, bossa/Latin, funk, ballad and straight grooves have distinct patterns. Continuous velocity expression controls amplitude as well as sample layers; mixer volume remains independent. Fixed per-articulation calibration compensates for quiet overhead drum recordings without normalizing away their recorded dynamics. Live playback, WAV and MIDI share the same note scheduler. It does not reproduce a particular commercial player or replace live musicians.

The first play loads instruments with visible progress. Files are cached when browser storage allows; decoded buffers are reused in the current session. Cancellation never starts delayed playback, and failures show a retry action. Browser storage eviction requires a subsequent download. Changing volume never selects a different timbre.

Live playback, microphone takes and 44.1 kHz stereo, 16-bit WAV exports use the same recorded sounds. Recording receives the compressed backing bus. The pitched keynote count-in remains a sine reference; the rim count-in uses a recording. No synthesized oscillators are used for the trio.

Validation: automated note-range, asset integrity, velocity/strike selection, pending-load cancellation, error handling and PCM tests; browser checks cover actual buffered playback, pause/resume, mixer volume, export, capture with a generated test microphone stream, failed-download retry, and cached playback after reload with audio requests blocked. No real microphone is used in automated QA.

Run `npm test` and `npm run build:hostgator` from the project. Upload the resulting archive contents to HostGator; include the entire `audio` folder. No server-side audio service or API key is required.
