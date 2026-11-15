# Vesper Changes: original accompaniment design

Phase 1 research and specification • 2026-11-14 • **Review draft; no application implementation**

The biggest opportunity is musical decision-making before sample playback: phrases with direction, coherent voicings, a drummer who knows the form, and role-specific expression. Better samples cannot supply those decisions. This specification describes a small original engine using native JavaScript and JSON. It does not reproduce any upstream generator, style, phrase library or sound set.

Read [accompaniment-measurements.md](accompaniment-measurements.md) alongside this document. Its **B** results are measured from existing Vesper exports; **S** findings are source observations; **H** values are original listening hypotheses. Upstream MIDI measurements are **NM**, because the applications were not already installed. Proposed numbers below are not presented as observations of musicians or the researched applications.

## 1. Research scope and clean-room boundary

REA's installed README and documented CLI workflow were read first. The installed CLI was used for source-only artifact inventories and passive browser observations of escaped local source text. Musical behavior was then followed manually through selected source files. REA did not execute the three applications, decompile an unavailable Toolkit JAR, or produce their performance statistics. Working files, selected source and analysis remain quarantined in `/tmp/accomp-research`; nothing there was committed.

Sources pinned for this study:

| Project | Revision analyzed | License context |
| --- | --- | --- |
| JJazzLab | `cd1944afdf8a18b659cdbf63538b6df625a515ec` | LGPL-2.1 project; individual component notices still matter |
| JJazzLab Toolkit | `4d38b923166a43b0ca573093e235f0461b72f606` | JJazzLab's standalone packaging/API example, not an unrelated engine |
| Impro-Visor | `550bbb554962249aceb0e82a72142e3e5b3c0d4a` | GPL-2.0-or-later |
| MMA | Official developer archive 25.05.3 | GPL; selected Python source and manual inspected |

MMA archive SHA-256: `402812db069e9e751e7a56b74dbd6193dd000f7921dc4eb4407e356ea507f57c`. Selected-source hashes and REA evidence identifiers are retained in the research directory; the measurements document records the observation identifiers and baseline hashes.

No upstream code, pattern sequences, groove definitions, phrase corpora, documentation wording, samples or Yamaha style assets are deliverables. Impro-Visor's own textual style files were inspected privately for their model and alternative counts. No commercial app was analyzed. JJazzLab's Yamaha-facing source was read only to understand delegation and architecture; no Yamaha data was obtained or parsed. The JSON model, musical rules and numerical hypotheses below are independently designed.

For Phase 2, use **only these two documents**, original test charts and newly authored data. Do not open or import the quarantined sources or assets. This is an engineering separation of research from implementation, not a legal opinion about license compliance.

## 2. What the three projects do, and what to adopt

### 2.1 JJazzLab and its Toolkit

**Chart to performance.** A song context combines chord/form information, a bar/beat interval, song-part rhythm settings and instrument voices. A rhythm engine produces instrument phrases; the surrounding song sequence builder assembles and post-processes them into a MIDI performance. Rhythm is more than a list of per-bar hits: meter, tempo, voices and song-part parameters participate in generation. Adopt this separation between musical context, role generation and event rendering. [J1] [J2]

**Current swing engine.** The pinned JJSwing implementation is composite. It generates bass and drums with dedicated components, while other voices, including piano, are delegated to the Yamaha-oriented generator. Do not describe all JJazzLab accompaniment as one purely procedural piano/bass/drum algorithm. General documentation may describe an older architecture; the pinned source takes precedence for this detail. [J3]

**Bass.** Separate two-feel and walking builders arrange multi-bar phrase material, adapt it to harmony and score connections. Candidate continuity considers preceding/following targets, starting and ending pitches, and repetition. The lesson is to preserve a line over several bars and look ahead at the next harmonic destination. Our implementation will generate short original lines from note roles; it will not copy or recreate JJazzLab's phrase database or tiling algorithm. [J4] [J5]

**Drums and variation.** The swing drummer chooses source material according to song context and drum style, then assembles phrases while allowing room for boundary fills. Song-part tags and style choices affect selection. Adopt phrase-boundary awareness and separate timekeeping from discretionary support. Do not reuse drum phrases or source sets. [J6]

**Piano.** The delegated style engine selects/adapts instrument phrases to harmony and register, with handling for phrase continuity, anticipations, accents, intensity and fills. This is a useful reminder that rhythmic material and harmonic adaptation are separate decisions; it is not a piano voicing implementation we should port. Our comping engine will choose original rhythms and compute voicings directly. [J7]

**Expression.** Swing tempo-adaptation code models changes in feel, articulation, accent and timing as tempo changes. Some optional microtiming behavior depends on configuration; inspection does not establish that every transform is always enabled. A separate Humanizer feature provides timing and velocity variation but is not proof that all automatic accompaniment passes through it. Adopt tempo-dependent feel and controlled role-specific expression, with freshly chosen values and listening tests. [J8] [J9]

**Toolkit.** The standalone demo initializes rhythm services, constructs/loads a song and mix, and uses the same generation/export facilities. It is a headless integration route, not a stock self-contained collection of newly licensed styles. The inspected Toolkit README requires Java 25+. This Mac has Java 8; no Toolkit JAR was found. Source/demo/packaging analysis is complete; JAR inspection and runtime exports are not. Do not fetch the external style asset mentioned by its demo. [T1] [T2]

### 2.2 Impro-Visor

**Styles as coordinated role banks.** A style holds separate bass, chord and drum alternatives plus ranges, voicing and feel settings. Pattern duration matters: selection looks for fitting duration classes and weights alternatives; chord patterns can be split with remaining material carried forward. It is not equivalent to flipping a coin independently at every subdivision. Adopt weighted selection among eligible whole gestures. [I1]

**Bass note roles.** Bass rules express harmonic intentions: current bass/root, chord member, scale member, next chord's bass, approach to a destination, retained pitch, explicit/degree-based pitch, and rest. Direction, range, prior note and chord context turn roles into notes. Some role resolution has random choices, but source categories do not establish measured output frequencies. Adopt a small semantic vocabulary and explicit destination planning; invent our own vocabulary, probabilities and solver. [I2] [I3]

**Comping and voicings.** Rhythm rules and chord realization are separable. Voicing selection uses chord/extension material and previous voicing information. The configurable voicing machinery manages hands/register and favors nearby prior tones while restricting repetition and undesirable crowding. Adopt guide-tone preservation, small search spaces and movement costs. Do not port its configurable voicing machinery, weight tables or saved voicings. [I4] [I5]

**Drums and dynamics.** Timed instrument rules form a drum alternative; pattern weights choose among alternatives. Pattern-level dynamics and separate swing/comping-feel controls provide more than one global velocity knob. Counts in the measurements document show the breadth of the selected style banks, not how often any rhythm plays. Adopt small separate banks with enough alternatives to express musical function; author all events ourselves. [I6]

### 2.3 MMA: Musical MIDI Accompaniment

**Patterns → sequences → grooves.** Track-specific event definitions are arranged into multi-bar sequences. A groove restores a bundle of track configuration, not just a rhythm name: sequence state, voices, volumes, articulation and related settings work together. Adopt multi-bar cycles and cohesive style presets, while storing only data our app actually needs. Do not implement MMA's text language or import its grooves. [M1] [M2] [M3]

**Bass and chords.** Bass events resolve relative pitch information against current harmony; walking has persistent direction/scale-path behavior rather than unrelated root choices. This particular walking algorithm is not evidence of complete bebop voice-leading or universal next-chord anticipation. Chord tracks combine voicing, register/inversion and articulation/strum controls. Adopt stateful contour and explicit register constraints, not the upstream algorithms or defaults. [M4] [M5] [M6]

**Variation and expression.** Sequence selection can be shared across tracks or randomized independently with weights. Shared track processing adds accents, volume variation, timing variation and duration changes; swing can modify subdivision spacing with configurable skew/accent/delay. Configurable swing is not evidence of automatic tempo adaptation. Random selection alone also does not guarantee non-repetition. Adopt a shared arrangement choice with independent subordinate role choices, then explicit cooldowns. [M7] [M8] [M9]

### 2.4 Combined lesson

Use JJazzLab's contextual phrase planning, Impro-Visor's separation of rhythmic gestures from harmonic roles, and MMA's coordinated multi-bar arrangement state as **ideas**. Our engine remains much smaller: a finite set of original styles, bounded note/voicing search and a shared event plan. Better musical structure comes before more randomness.

## 3. Unified chart-to-performance plan (a)

Normalize the chart into written bars, each with meter and timed chord spans. Expand repeats into **performed bar instances** while preserving written-bar identity, section label, section-instance number, chorus index and phrase position. A repeated A section and a return after B must remain distinguishable. Never infer the whole form from absolute bar modulo eight.

Use integer ticks internally at 960 ticks per quarter; represent 3/4 as three quarters and 6/8 as six eighths with explicit pulse grouping. Convert existing chart positions once at the boundary. Authored ticks are integers; performed offsets can remain fractional until MIDI serialization. Validate chord spans, pickups, empty bars, slash bass and held harmony. Emit a clear fallback or silence for malformed harmony; do not silently invent chords.

Plan in five stages:

1. **Context:** current and next harmonic spans, one to two bars of lookahead, meter, section/chorus position and ending flags.
2. **Arrangement:** choose an energy state, bass mode, comp density, timekeeper and optional fill window for a phrase. Build a gentle intensity envelope across a section; an explicit user setting wins.
3. **Gestures:** choose eligible original role motifs, including rests. Coordinate support so a busy piano answer does not automatically trigger busy snare support.
4. **Pitches and articulation:** resolve bass destinations and comp voicings with previous-note/voicing memory. Assign semantic accents and phrase envelopes.
5. **Performance:** apply swing and bounded timing/velocity/duration transforms once, producing immutable note events consumed by live audio and MIDI export.

An event carries role, instrument, MIDI pitch, authored tick, performed tick, duration, velocity, performed-bar ID and musical intent. Preserve authored tick for chart highlighting; an anticipated chord must not advance the visible chart early. Muting affects rendering, not regeneration of other roles. Mixer level is independent of musical velocity.

Choose a song/take seed, then derive stable sub-seeds from performed phrase, role and decision type. Changing bass settings must not randomly replace the drum part. Repeated playback of the same take is reproducible; an explicit “new take” changes discretionary choices. Plan the song once or cache phrase chunks before playback; do not search for voicings or draw random numbers inside an audio callback. No new dependency or server is required.

## 4. Bass design (b)

**Harmonic intent.** Plan destination notes at important chord attacks first, prioritizing slash bass, clear roots at new sections and structurally useful chord tones. Fill the space between destinations with chord tones, locally compatible scale tones, repeated notes, diatonic or chromatic approaches and occasional rests. An approach is a relationship to an actual future target, not an automatic semitone on every beat four. Avoid treating every altered dominant as a generic major scale.

**Bounded line search.** Build a small candidate set per attack from the current harmony and destination; score complete one/two-bar paths for harmonic validity, range, contour, repeated leaps and arrival quality. Common tones can continue across changes. Prefer steps after a leap; avoid oscillating the same two pitches indefinitely. Limit to 12 retained paths per step and two-bar lookahead initially. These are original engineering bounds, adjustable after profiling.

**Register and articulation.** Start acoustic-bass search within MIDI 28–55, with stronger preference for 33–48; use the instrument's actual playable sample range as a hard constraint. Electric funk bass may use a separate range. Do not keep folding notes by octaves after planning because that destroys contour. Shorten before a new attack when appropriate; allow phrase-ending sustain and explicit rests. Prevent accidental overlap on monophonic bass without removing intended legato.

**Two-feel versus walking.** Provide `auto`, `twoFeel` and `walk` overrides for swing. Auto chooses at phrase boundaries from tempo, section energy, harmonic rhythm and chorus position with hysteresis. Low-energy openings and ballads can use two-feel; later phrases may walk. Tempo alone is not a command to walk or stop walking. Keep a chosen mode long enough to sound intentional; prefer at least four bars before another discretionary switch. Let fast harmonic rhythm override a sparse gesture if necessary for clarity.

**Style differences.** Swing walking uses mostly quarter-note motion with occasional pickups; two-feel leaves room. Bossa uses a stable multi-bar groove and root/fifth support rather than compulsory walking. Funk favors intentional repetition, syncopation, rests and short articulations. Jazz waltz has explicit three-beat gestures and a floating alternative. Do not apply 4/4 walking percentages or chromatic-approach quotas to these other styles.

**Variation.** Retain contour and arrival intent across a phrase, with subordinate changes to middle notes. A return to an A section may recall an earlier line without replaying every note. Hypotheses for swing root/approach diversity are in measurement H; they are test ranges for the fixtures, not universal musicianship rules.

## 5. Comping design (c)

**Voicings.** Parse chord quality into required identity tones and optional colors. Preserve thirds/sevenths when applicable; respect suspensions, diminished structures, altered notes and explicit extensions. When bass supplies the root, rootless sevenths can be eligible, but never erase the defining root from every triad by rule. Use newly authored interval templates and generated inversions, not upstream voicing tables.

For each attack, enumerate at most 24 legal candidates, initially three or four notes, allowing two-note shells at low intensity and five-note voicings only when register/space permits. Start comp register around MIDI 48–84; penalize dense low-register clusters, excessive hand span and duplication of bass. Score movement from the previous voiced chord, common-tone retention, guide-tone clarity, top-note contour, register and repeated voicings. A rest need not erase voicing memory. Voice movement must be evaluated together with omitted/added voices so shrinking a chord cannot game the score.

**Rhythm selection.** Select weighted one- or two-bar gestures, conditioned on style, energy, meter, harmonic rhythm and recent usage. Weights are relative chances **after eligibility filtering**, not independent per-hit probabilities. Gestures may contain rests, anticipations, sustained chords, short answers and a whole-bar rest. Low energy should produce fewer gestures, not merely quieter copies of the same attacks.

**Reaction to harmony.** A motif must not sustain an incompatible voicing through a new chord. Split, release or revoice it according to harmonic span. A change need not cause a new attack: a common-tone hold or anticipated next harmony can cover it deliberately. Never anticipate before the known chord span/lookahead or across a stop. Increase harmonic coverage for two-chord bars without blindly doubling rhythmic density.

**Space and conversation.** Store a lightweight activity map in half-beat regions. Use it to reduce discretionary snare hits during a dense piano figure and permit an answer during piano silence. This is bounded coordination, not a general improvising agent. Preserve deliberate simultaneous accents at structural arrivals.

## 6. Drum design (d)

Separate the drummer into **timekeeper**, **low-frequency support**, **backbeat/ghost support**, and **transition** layers. Every layer remains independently measurable. Use the existing kit samples and a single semantic-to-sample mapping; verify ride, hats, kick, snare and rim are loaded, unmuted and audible before blaming musical rules. MIDI velocity cannot prove audibility.

| Family | Original design direction |
| --- | --- |
| Swing/blues/AABA | Ride-led pulse, lighter kick support, foot-hat landmarks, sparse conversational snare; allow brushes/hat substitute only if suitable samples already exist. |
| Ballad | Sparse timekeeping, restrained low drum and soft support; silence is available. Do not simulate brushes with loud repeated snare unless the sample supports it. |
| Bossa | Stable two-bar straight-feel skeleton, consistent bass-drum/hat relationship, rim/snare answers that preserve the cycle. |
| Jazz waltz | Explicit three-beat ride/hat family with a distinct pulse and occasional cross-bar answer; no clipped 4/4 backbeat fallback. |
| Funk | Tight straight subdivisions, intentional kick/snare groove and controlled ghosts; vary supporting details while preserving recognizable anchors. |

These are musical roles, not transcriptions of upstream patterns. Specific event placements and weights must be authored and auditioned in Phase 2.

**Fills.** Mark candidate windows from the actual form: phrase endings, section transitions, turnaround and final ending. Choose no fill, a setup, a short fill or a larger transition according to energy and recent fills. Start with half- to two-beat windows and reserve a longer window only for an explicit large transition. A fill replaces conflicting support events instead of stacking a second drummer. Keep one time reference where appropriate, resolve on the next arrival, and reduce immediate post-fill clutter. Do not insert a mandatory fill every eight performed bars.

**Intensity.** Raise intensity through selected accents, support density and occasional timekeeper changes at a phrase boundary, not by turning every velocity up equally. Keep quiet kick/ghost notes audible relative to samples while preserving hierarchy. Separate the live mixer gain from velocity/timbre choice.

## 7. Variation and repeat avoidance (e)

Use three timescales:

- **Bar:** modify an optional pickup, inner bass connection or ghost note while preserving the current gesture's identity.
- **Section/phrase:** select a related gesture family, bass mode, voicing register and support density; remember section instances.
- **Chorus:** create an arrangement arc, such as restrained opening, fuller middle, and a clear ending. More intense does not always mean faster or denser.

Track the last three motif fingerprints per role. Penalize immediate discretionary repeats; do not forbid bossa/funk ostinatos that define the groove. Exempt mandatory anchors from novelty requirements. Choose again only from eligible candidates; if all are excluded, relax repetition preference before breaking harmonic or meter constraints. Keep user-selected intensity and mode stable.

Variation should be explainable: a new section, a held chord, a response, an approach or a phrase ending. Randomly changing everything between bars can score well on a variation percentage and still sound worse. Report timekeeper stability separately from discretionary-support novelty.

## 8. Original compact JSON style model (f)

Use plain JSON, no general-purpose pattern interpreter. Tick units and declared meter make durations unambiguous. A minimal instance below is a **newly authored sparse illustrative gesture**, not a reference style or a transcription. It demonstrates structure only; a complete style needs multiple original motifs for each role.

```json
{
  "version": 1,
  "id": "study-sparse",
  "ppq": 960,
  "meter": [4, 4],
  "pulseGroups": [1, 1, 1, 1],
  "tempoRange": [55, 245],
  "cycleBars": 2,
  "parts": {
    "bass": {"range": [28, 55], "mode": "auto"},
    "comp": {"range": [48, 84], "maxVoices": 4},
    "drums": {"timekeeper": "ride"}
  },
  "motifs": [
    {
      "id": "spacious-arrival",
      "role": "comp",
      "bars": 1,
      "weight": 1,
      "energy": [0.1, 0.45],
      "function": "arrival",
      "events": [
        {"at": 0, "length": 840, "intent": "voiceCurrent", "accent": 0.15}
      ]
    }
  ],
  "variation": {"memoryBars": 3, "phraseBars": 4, "fillMaxBeats": 2},
  "humanize": {"timingLimitMs": 9, "velocitySpread": 6, "lengthSpread": 0.08}
}
```

The formal interchange contract is intentionally narrow. Version 1 has these fields:

| Object/field | Type and validation | Meaning |
| --- | --- | --- |
| `version`, `id`, `ppq` | `version=1`; unique nonempty string ID; `ppq=960` | Schema/version identity and tick unit |
| `meter` | Two positive integers; denominator 2, 4, 8 or 16 | Default supported meter for this style |
| `pulseGroups` | Positive integer array summing to numerator | Groups in denominator-note units; 6/8 can be `[3,3]` |
| `tempoRange` | Two ordered positive BPM numbers | Declared musical/test range, not a runtime crash boundary |
| `cycleBars` | Integer 1–4 | Position in the groove cycle |
| `parts` | Bass/comp/drum settings; ranges ordered within MIDI 0–127 | Role defaults and hard limits |
| `motifs[]` | Unique ID, role, bars 1–4, positive weight, ordered energy bounds 0–1, function, events | Original candidate gesture bank |
| `function` | `time`, `arrival`, `support`, `answer`, `transition` | Eligibility/coordination tag |
| `events[].at`, `length` | Nonnegative/positive integer ticks; inside motif duration | Authored onset and duration |
| `intent` | Role-specific enum described below | Semantic note decision, not raw upstream pattern tokens |
| `accent` | Number −1…1 | Relative expressive emphasis before MIDI clamping |
| Optional `chance` | Number 0…1, default 1 | Optional support event; never weakens a mandatory anchor |
| Optional `instrument` | `ride`, `hat`, `footHat`, `kick`, `snare`, `rim`, `tom` | Required for drum events; mapped centrally |
| Optional `cycleIndex` | Integer 0…`cycleBars−1` | Restricts a motif's cycle position |
| `variation` | Bounded positive memory/phrase settings and fill length | Original arrangement controls |
| `humanize` | Nonnegative timing/velocity/length limits | Bounds; role logic supplies distributions |

Bass intents: `anchor`, `member`, `step`, `connect`, `retain`, `silence`. Comp intents: `voiceCurrent`, `voiceNext`, `retain`, `silence`. Drum intents: `strike`, `silence`. A future chord must exist for `voiceNext`/destination-dependent `connect`; otherwise choose a valid alternative. Extending the enum requires a versioned validator change, not arbitrary executable strings.

Reject unknown fields in shipped style data so typos cannot silently alter behavior. Check total motif length against meter, instrument/role compatibility, probability bounds, no duplicate IDs and allowed note counts. Cross-field checks such as pulse sums and tick bounds need a few native JS checks beyond a structural schema. No runtime JSON-schema dependency is necessary. This is a compact typed contract rather than an upstream-compatible format.


Structural JSON Schema (draft 2020-12); a Phase 2 implementation can enforce this with native checks. Cross-field semantic checks described above remain mandatory.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "additionalProperties": false,
  "required": ["version", "id", "ppq", "meter", "pulseGroups", "tempoRange", "cycleBars", "parts", "motifs", "variation", "humanize"],
  "properties": {"version": {"const": 1}, "id": {"type": "string", "minLength": 1}, "ppq": {"const": 960}, "meter": {"type": "array", "prefixItems": [{"type": "integer", "minimum": 1}, {"enum": [2, 4, 8, 16]}], "items": false, "minItems": 2, "maxItems": 2}, "pulseGroups": {"type": "array", "items": {"type": "integer", "minimum": 1}, "minItems": 1}, "tempoRange": {"type": "array", "items": {"type": "number", "exclusiveMinimum": 0}, "minItems": 2, "maxItems": 2}, "cycleBars": {"type": "integer", "minimum": 1, "maximum": 4}, "parts": {"type": "object", "additionalProperties": false, "required": ["bass", "comp", "drums"], "properties": {"bass": {"type": "object", "additionalProperties": false, "required": ["range", "mode"], "properties": {"range": {"type": "array", "items": {"type": "integer", "minimum": 0, "maximum": 127}, "minItems": 2, "maxItems": 2}, "mode": {"enum": ["auto", "twoFeel", "walk"]}}}, "comp": {"type": "object", "additionalProperties": false, "required": ["range", "maxVoices"], "properties": {"range": {"type": "array", "items": {"type": "integer", "minimum": 0, "maximum": 127}, "minItems": 2, "maxItems": 2}, "maxVoices": {"type": "integer", "minimum": 2, "maximum": 5}}}, "drums": {"type": "object", "additionalProperties": false, "required": ["timekeeper"], "properties": {"timekeeper": {"enum": ["ride", "hat", "footHat"]}}}}}, "motifs": {"type": "array", "minItems": 1, "items": {"$ref": "#/$defs/motif"}}, "variation": {"type": "object", "additionalProperties": false, "required": ["memoryBars", "phraseBars", "fillMaxBeats"], "properties": {"memoryBars": {"type": "integer", "minimum": 1, "maximum": 16}, "phraseBars": {"type": "integer", "minimum": 1, "maximum": 32}, "fillMaxBeats": {"type": "number", "exclusiveMinimum": 0, "maximum": 4}}}, "humanize": {"type": "object", "additionalProperties": false, "required": ["timingLimitMs", "velocitySpread", "lengthSpread"], "properties": {"timingLimitMs": {"type": "number", "minimum": 0, "maximum": 30}, "velocitySpread": {"type": "integer", "minimum": 0, "maximum": 24}, "lengthSpread": {"type": "number", "minimum": 0, "maximum": 1}}}},
  "$defs": {"event": {"type": "object", "additionalProperties": false, "required": ["at", "length", "intent", "accent"], "properties": {"at": {"type": "integer", "minimum": 0}, "length": {"type": "integer", "minimum": 1}, "intent": {"enum": ["anchor", "member", "step", "connect", "retain", "silence", "voiceCurrent", "voiceNext", "strike"]}, "accent": {"type": "number", "minimum": -1, "maximum": 1}, "chance": {"type": "number", "minimum": 0, "maximum": 1}, "instrument": {"enum": ["ride", "hat", "footHat", "kick", "snare", "rim", "tom"]}}}, "motif": {"type": "object", "additionalProperties": false, "required": ["id", "role", "bars", "weight", "energy", "function", "events"], "properties": {"id": {"type": "string", "minLength": 1}, "role": {"enum": ["bass", "comp", "drums"]}, "bars": {"type": "integer", "minimum": 1, "maximum": 4}, "weight": {"type": "number", "exclusiveMinimum": 0}, "energy": {"type": "array", "items": {"type": "number", "minimum": 0, "maximum": 1}, "minItems": 2, "maxItems": 2}, "function": {"enum": ["time", "arrival", "support", "answer", "transition"]}, "events": {"type": "array", "items": {"$ref": "#/$defs/event"}}, "cycleIndex": {"type": "integer", "minimum": 0, "maximum": 3}}}}
}
```

## 9. Humanization, feel and expression (g)

Apply transformations in this order: authored gesture → swing mapping → shared pulse/phrase displacement → role displacement → small bounded note variation → articulation and velocity → event safety checks. Store the result once. Avoid applying swing both in the generator and the renderer.

**Swing versus tempo.** Start by auditioning original long:short hypotheses 1.9 at 60, 1.65 at 120, 1.3 at 180 and 1.12 at 240 BPM, with continuous interpolation and a user override. These values are not copied from JJazzLab and are not measured human norms. Straight bossa/funk keep 1:1 unless a different style is explicitly authored. Apply swing to eligible subdivisions, not indiscriminately to every sixteenth or to bass quarter notes. Clamp outside the declared curve rather than extrapolating wildly.

**Timing.** Share a small low-frequency pulse displacement among the band, then let piano sit slightly behind or a chosen bass/drum role slightly forward. Keep structural downbeats and groove anchors stable. Start discretionary jitter within roughly 3–9 ms depending on role, with stricter bounds at high tempos; use a bounded distribution and correlated gesture offsets. These are audition settings. Independent large random delays on every note sound like mistakes rather than ensemble feel.

**Velocity.** Generate a phrase envelope, recurring instrument accents and quiet support levels before adding small variation. Repeated ride hits need hierarchy; ghost snare must remain softer than backbeats; voice the top or guide note of a comp chord without making each constituent equally loud. Clamp MIDI velocity to 1–127 and preserve intentionally quiet events. Velocity-to-sample amplitude is a separate calibration; MIDI values are not decibels.

**Articulation.** Match duration to gesture and tempo. Short syncopations, connected bass quarters and phrase endings need different shapes. Start bounded length variation around 5–10% only when the gesture permits it. A tiny chord spread may be available, but reserve it for selected articulations rather than rolling every piano chord identically. Preserve simultaneous authored clusters in analysis even if performance onsets spread slightly.

**Safety.** No negative start tick; no note extends across an explicit stop without permission; avoid accidental retriggers and stuck notes. Distinct authored attacks must not reverse ordering under jitter. Quantize only on MIDI serialization; live audio uses the same performed timestamps at higher precision. Seek/restart uses cached plan and reconstructs controller state, not a fresh random take.

## 10. Keep it practical: omit these features (h)

Do not embed Java/Python engines, a plugin framework, a general-purpose accompaniment DSL, MIDI phrase retrieval, upstream style conversion, Yamaha style support, neural models, downloaded groove corpora, sound synthesis research or a server-side generation service. Do not implement automatic reharmonization, solo generation, guitar fingering or a full notation-to-performance inference system in this change.

Use a small curated set of original motif banks plus bounded searches. No new external package is needed for probability sampling, seeded random state, interpolation, voicing costs or these statistics. Keep composition out of the real-time audio callback. Cache role plans and invalidate only the affected portions when harmony/settings change. Existing sample assets remain independently licensed; this phase makes no sample-selection change.

## 11. Phase 2 validation and handoff

Implement only after review. First make generation observable: event intent, chosen gesture, destination, section and seed in a development export. Run the same six original fixtures at the same tempos and four choruses. Check role ranges, harmonic identity, no invalid timings and fixed-seed equality between the live plan and MIDI before listening comparisons. Exported MIDI alone does not test drum audibility or sample balance.

Then compare old/new audio with identical samples and loudness. Listen for an uninterrupted form, bass direction, comping space, clear chord identity, drum presence, controlled dynamics and a stable groove. Use a small set of alternate seeds; a single lucky take is not sufficient. Accept original H targets only when listening supports them. For style-specific metrics, compare like with like; do not reward fills in every ballad phrase or novelty in every bossa bar.

If the upstream applications later become available under the user's installation constraint, fill the NM matrix with real renders. Export each style/tempo repeatedly, retain exact version/style identifiers and annotate phrase boundaries. Prefer known MIDI track assignments over guessed channels; measure notes/controllers separately. Add rendered-audio checks for brush samples and mixer gains. Do not overwrite this Vesper baseline or describe inferred source rules as measured data.

## 12. Primary-source reading map

References below identify the inspected files/pages. All design choices above are written independently; references support architectural observations, not ownership of the proposed implementation. The official JJazzLab developer guide is useful for API context, but it does not replace the pinned source for current JJSwing behavior.

[J1]: https://github.com/jjazzboss/JJazzLab/blob/cd1944afdf8a18b659cdbf63538b6df625a515ec/core/RhythmMusicGenerationSPI/src/main/java/org/jjazz/rhythmmusicgeneration/spi/MusicGenerator.java "jjazz: core/RhythmMusicGenerationSPI/src/main/java/org/jjazz/rhythmmusicgeneration/spi/MusicGenerator.java"
- **J1:** [jjazz: core/RhythmMusicGenerationSPI/src/main/java/org/jjazz/rhythmmusicgeneration/spi/MusicGenerator.java](https://github.com/jjazzboss/JJazzLab/blob/cd1944afdf8a18b659cdbf63538b6df625a515ec/core/RhythmMusicGenerationSPI/src/main/java/org/jjazz/rhythmmusicgeneration/spi/MusicGenerator.java).
[J2]: https://github.com/jjazzboss/JJazzLab/blob/cd1944afdf8a18b659cdbf63538b6df625a515ec/core/RhythmMusicGeneration/src/main/java/org/jjazz/rhythmmusicgeneration/api/SongSequenceBuilder.java "jjazz: core/RhythmMusicGeneration/src/main/java/org/jjazz/rhythmmusicgeneration/api/SongSequenceBuilder.java"
- **J2:** [jjazz: core/RhythmMusicGeneration/src/main/java/org/jjazz/rhythmmusicgeneration/api/SongSequenceBuilder.java](https://github.com/jjazzboss/JJazzLab/blob/cd1944afdf8a18b659cdbf63538b6df625a515ec/core/RhythmMusicGeneration/src/main/java/org/jjazz/rhythmmusicgeneration/api/SongSequenceBuilder.java).
[J3]: https://github.com/jjazzboss/JJazzLab/blob/cd1944afdf8a18b659cdbf63538b6df625a515ec/plugins/JJSwing/src/main/java/org/jjazz/jjswing/api/JJSwingRhythm.java "jjazz: plugins/JJSwing/src/main/java/org/jjazz/jjswing/api/JJSwingRhythm.java"
- **J3:** [jjazz: plugins/JJSwing/src/main/java/org/jjazz/jjswing/api/JJSwingRhythm.java](https://github.com/jjazzboss/JJazzLab/blob/cd1944afdf8a18b659cdbf63538b6df625a515ec/plugins/JJSwing/src/main/java/org/jjazz/jjswing/api/JJSwingRhythm.java).
[J4]: https://github.com/jjazzboss/JJazzLab/blob/cd1944afdf8a18b659cdbf63538b6df625a515ec/plugins/JJSwing/src/main/java/org/jjazz/jjswing/bass/BassGenerator.java "jjazz: plugins/JJSwing/src/main/java/org/jjazz/jjswing/bass/BassGenerator.java"
- **J4:** [jjazz: plugins/JJSwing/src/main/java/org/jjazz/jjswing/bass/BassGenerator.java](https://github.com/jjazzboss/JJazzLab/blob/cd1944afdf8a18b659cdbf63538b6df625a515ec/plugins/JJSwing/src/main/java/org/jjazz/jjswing/bass/BassGenerator.java).
[J5]: https://github.com/jjazzboss/JJazzLab/blob/cd1944afdf8a18b659cdbf63538b6df625a515ec/plugins/JJSwing/src/main/java/org/jjazz/jjswing/bass/WbpsaScorer.java "jjazz: plugins/JJSwing/src/main/java/org/jjazz/jjswing/bass/WbpsaScorer.java"
- **J5:** [jjazz: plugins/JJSwing/src/main/java/org/jjazz/jjswing/bass/WbpsaScorer.java](https://github.com/jjazzboss/JJazzLab/blob/cd1944afdf8a18b659cdbf63538b6df625a515ec/plugins/JJSwing/src/main/java/org/jjazz/jjswing/bass/WbpsaScorer.java).
[J6]: https://github.com/jjazzboss/JJazzLab/blob/cd1944afdf8a18b659cdbf63538b6df625a515ec/plugins/JJSwing/src/main/java/org/jjazz/jjswing/drums/DrumsGenerator.java "jjazz: plugins/JJSwing/src/main/java/org/jjazz/jjswing/drums/DrumsGenerator.java"
- **J6:** [jjazz: plugins/JJSwing/src/main/java/org/jjazz/jjswing/drums/DrumsGenerator.java](https://github.com/jjazzboss/JJazzLab/blob/cd1944afdf8a18b659cdbf63538b6df625a515ec/plugins/JJSwing/src/main/java/org/jjazz/jjswing/drums/DrumsGenerator.java).
[J7]: https://github.com/jjazzboss/JJazzLab/blob/cd1944afdf8a18b659cdbf63538b6df625a515ec/plugins/YamJJazz/src/main/java/org/jjazz/yamjjazz/rhythm/api/YamJJazzRhythmGenerator.java "jjazz: plugins/YamJJazz/src/main/java/org/jjazz/yamjjazz/rhythm/api/YamJJazzRhythmGenerator.java"
- **J7:** [jjazz: plugins/YamJJazz/src/main/java/org/jjazz/yamjjazz/rhythm/api/YamJJazzRhythmGenerator.java](https://github.com/jjazzboss/JJazzLab/blob/cd1944afdf8a18b659cdbf63538b6df625a515ec/plugins/YamJJazz/src/main/java/org/jjazz/yamjjazz/rhythm/api/YamJJazzRhythmGenerator.java).
[J8]: https://github.com/jjazzboss/JJazzLab/blob/cd1944afdf8a18b659cdbf63538b6df625a515ec/plugins/JJSwing/src/main/java/org/jjazz/jjswing/tempoadapter/SwingProfile.java "jjazz: plugins/JJSwing/src/main/java/org/jjazz/jjswing/tempoadapter/SwingProfile.java"
- **J8:** [jjazz: plugins/JJSwing/src/main/java/org/jjazz/jjswing/tempoadapter/SwingProfile.java](https://github.com/jjazzboss/JJazzLab/blob/cd1944afdf8a18b659cdbf63538b6df625a515ec/plugins/JJSwing/src/main/java/org/jjazz/jjswing/tempoadapter/SwingProfile.java).
[J9]: https://github.com/jjazzboss/JJazzLab/blob/cd1944afdf8a18b659cdbf63538b6df625a515ec/core/Humanizer/src/main/java/org/jjazz/humanizer/api/Humanizer.java "jjazz: core/Humanizer/src/main/java/org/jjazz/humanizer/api/Humanizer.java"
- **J9:** [jjazz: core/Humanizer/src/main/java/org/jjazz/humanizer/api/Humanizer.java](https://github.com/jjazzboss/JJazzLab/blob/cd1944afdf8a18b659cdbf63538b6df625a515ec/core/Humanizer/src/main/java/org/jjazz/humanizer/api/Humanizer.java).
[T1]: https://github.com/jjazzboss/JJazzLabToolkit/blob/4d38b923166a43b0ca573093e235f0461b72f606/README.md "toolkit: README.md"
- **T1:** [toolkit: README.md](https://github.com/jjazzboss/JJazzLabToolkit/blob/4d38b923166a43b0ca573093e235f0461b72f606/README.md).
[T2]: https://github.com/jjazzboss/JJazzLabToolkit/blob/4d38b923166a43b0ca573093e235f0461b72f606/demo/src/main/java/org/jjazzlab/toolkitdemo/ToolkitDemoApp.java "toolkit: demo/src/main/java/org/jjazzlab/toolkitdemo/ToolkitDemoApp.java"
- **T2:** [toolkit: demo/src/main/java/org/jjazzlab/toolkitdemo/ToolkitDemoApp.java](https://github.com/jjazzboss/JJazzLabToolkit/blob/4d38b923166a43b0ca573093e235f0461b72f606/demo/src/main/java/org/jjazzlab/toolkitdemo/ToolkitDemoApp.java).
[I1]: https://github.com/Impro-Visor/Impro-Visor/blob/550bbb554962249aceb0e82a72142e3e5b3c0d4a/src/imp/style/Style.java "improvisor: src/imp/style/Style.java"
- **I1:** [improvisor: src/imp/style/Style.java](https://github.com/Impro-Visor/Impro-Visor/blob/550bbb554962249aceb0e82a72142e3e5b3c0d4a/src/imp/style/Style.java).
[I2]: https://github.com/Impro-Visor/Impro-Visor/blob/550bbb554962249aceb0e82a72142e3e5b3c0d4a/src/imp/style/stylePatterns/BassPattern.java "improvisor: src/imp/style/stylePatterns/BassPattern.java"
- **I2:** [improvisor: src/imp/style/stylePatterns/BassPattern.java](https://github.com/Impro-Visor/Impro-Visor/blob/550bbb554962249aceb0e82a72142e3e5b3c0d4a/src/imp/style/stylePatterns/BassPattern.java).
[I3]: https://github.com/Impro-Visor/Impro-Visor/blob/550bbb554962249aceb0e82a72142e3e5b3c0d4a/src/imp/style/stylePatterns/BassPatternElement.java "improvisor: src/imp/style/stylePatterns/BassPatternElement.java"
- **I3:** [improvisor: src/imp/style/stylePatterns/BassPatternElement.java](https://github.com/Impro-Visor/Impro-Visor/blob/550bbb554962249aceb0e82a72142e3e5b3c0d4a/src/imp/style/stylePatterns/BassPatternElement.java).
[I4]: https://github.com/Impro-Visor/Impro-Visor/blob/550bbb554962249aceb0e82a72142e3e5b3c0d4a/src/imp/style/stylePatterns/ChordPattern.java "improvisor: src/imp/style/stylePatterns/ChordPattern.java"
- **I4:** [improvisor: src/imp/style/stylePatterns/ChordPattern.java](https://github.com/Impro-Visor/Impro-Visor/blob/550bbb554962249aceb0e82a72142e3e5b3c0d4a/src/imp/style/stylePatterns/ChordPattern.java).
[I5]: https://github.com/Impro-Visor/Impro-Visor/blob/550bbb554962249aceb0e82a72142e3e5b3c0d4a/src/imp/voicing/VoicingGenerator.java "improvisor: src/imp/voicing/VoicingGenerator.java"
- **I5:** [improvisor: src/imp/voicing/VoicingGenerator.java](https://github.com/Impro-Visor/Impro-Visor/blob/550bbb554962249aceb0e82a72142e3e5b3c0d4a/src/imp/voicing/VoicingGenerator.java).
[I6]: https://github.com/Impro-Visor/Impro-Visor/blob/550bbb554962249aceb0e82a72142e3e5b3c0d4a/src/imp/style/stylePatterns/DrumPattern.java "improvisor: src/imp/style/stylePatterns/DrumPattern.java"
- **I6:** [improvisor: src/imp/style/stylePatterns/DrumPattern.java](https://github.com/Impro-Visor/Impro-Visor/blob/550bbb554962249aceb0e82a72142e3e5b3c0d4a/src/imp/style/stylePatterns/DrumPattern.java).
[M1]: https://www.mellowood.ca/mma/mma-devl.25.05.3.tar.gz "mma: MMA/pat.py"
- **M1:** [mma: MMA/pat.py](https://www.mellowood.ca/mma/mma-devl.25.05.3.tar.gz).
[M2]: https://www.mellowood.ca/mma/mma-devl.25.05.3.tar.gz "mma: MMA/sequence.py"
- **M2:** [mma: MMA/sequence.py](https://www.mellowood.ca/mma/mma-devl.25.05.3.tar.gz).
[M3]: https://www.mellowood.ca/mma/mma-devl.25.05.3.tar.gz "mma: MMA/grooves.py"
- **M3:** [mma: MMA/grooves.py](https://www.mellowood.ca/mma/mma-devl.25.05.3.tar.gz).
[M4]: https://www.mellowood.ca/mma/mma-devl.25.05.3.tar.gz "mma: MMA/patBass.py"
- **M4:** [mma: MMA/patBass.py](https://www.mellowood.ca/mma/mma-devl.25.05.3.tar.gz).
[M5]: https://www.mellowood.ca/mma/mma-devl.25.05.3.tar.gz "mma: MMA/patWalk.py"
- **M5:** [mma: MMA/patWalk.py](https://www.mellowood.ca/mma/mma-devl.25.05.3.tar.gz).
[M6]: https://www.mellowood.ca/mma/mma-devl.25.05.3.tar.gz "mma: MMA/patChord.py"
- **M6:** [mma: MMA/patChord.py](https://www.mellowood.ca/mma/mma-devl.25.05.3.tar.gz).
[M7]: https://www.mellowood.ca/mma/mma-devl.25.05.3.tar.gz "mma: MMA/seqrnd.py"
- **M7:** [mma: MMA/seqrnd.py](https://www.mellowood.ca/mma/mma-devl.25.05.3.tar.gz).
[M8]: https://www.mellowood.ca/mma/mma-devl.25.05.3.tar.gz "mma: MMA/swing.py"
- **M8:** [mma: MMA/swing.py](https://www.mellowood.ca/mma/mma-devl.25.05.3.tar.gz).
[M9]: https://www.mellowood.ca/mma/mma-devl.25.05.3.tar.gz "mma: MMA/volume.py"
- **M9:** [mma: MMA/volume.py](https://www.mellowood.ca/mma/mma-devl.25.05.3.tar.gz).
- JJazzLab developer guide: [Music generation](https://jjazzlab.gitbook.io/developer-guide/music-generation) and [rhythm-engine architecture](https://jjazzlab.gitbook.io/developer-guide/add-rhythm-engine).
- MMA official manual: [Patterns](https://www.mellowood.ca/mma/online-docs/html/ref/node4.html), [Sequences](https://www.mellowood.ca/mma/online-docs/html/ref/node5.html), [Grooves](https://www.mellowood.ca/mma/online-docs/html/ref/node6.html), [Randomization](https://www.mellowood.ca/mma/online-docs/html/ref/node13.html), [Voicing](https://www.mellowood.ca/mma/online-docs/html/ref/node14.html), [Swing](https://www.mellowood.ca/mma/online-docs/html/ref/node18.html), [Dynamics](https://www.mellowood.ca/mma/online-docs/html/ref/node19.html).
- MMA [official downloads](https://www.mellowood.ca/mma/downloads.html); selected files above belong to the pinned archive hash in section 1, not an unpinned Git mirror.

## 13. Ten changes in priority order

1. **Make swing feel respond to tempo.** Both swing fixtures hold a 1.5:1 ride ratio at every tested tempo. Add an original editable curve and audition the four reference tempos. [M01](accompaniment-measurements.md#measurement-anchors-for-implementation-decisions)
2. **Give bass a destination and multiple connection choices.** Every eligible changing-boundary swing approach is chromatic, and every bar starts on the root. Plan connections with chord/scale context and controlled non-root arrivals. [M03](accompaniment-measurements.md#measurement-anchors-for-implementation-decisions)
3. **Choose two-feel versus walking by phrase and energy.** Existing swing bass walks in 100% of bars from 60–240 BPM. Add an explicit override and a stable auto arrangement. [M02](accompaniment-measurements.md#measurement-anchors-for-implementation-decisions)
4. **Use previous-voicing-aware comping.** Mean matched-voice movement is about 3.56–3.60 semitones in the swing fixtures. Preserve guides/common tones while respecting register. [M04](accompaniment-measurements.md#measurement-anchors-for-implementation-decisions)
5. **Give comping phrase-level space and answers.** Ballad has two hits per bar and no chorus-to-chorus rhythm changes. Introduce eligible weighted gestures, sustains and whole-bar rests. [M05](accompaniment-measurements.md#measurement-anchors-for-implementation-decisions)
6. **Shape repeated-note dynamics and articulation.** Several bass styles have zero duration variance; swing kick and foot-hat each have constant velocity. Add role/phrase envelopes before bounded variation. [M09](accompaniment-measurements.md#measurement-anchors-for-implementation-decisions)
7. **Move fills onto actual form boundaries.** The eight-bar counter misses half the blues chorus endings, and candidate fills are isolated late hits. Reserve optional fill windows with a musical arrival. [M07](accompaniment-measurements.md#measurement-anchors-for-implementation-decisions)
8. **Implement a real three-beat drum family.** Waltz uses the generic straight backbeat branch. Author a dedicated jazz-waltz pulse and support vocabulary. [M08](accompaniment-measurements.md#measurement-anchors-for-implementation-decisions)
9. **Vary support by section while keeping the groove recognizable.** Bossa/waltz/funk drums show zero chorus rhythm change. Add arrangement states and comp/drum coordination rather than randomizing all anchors. [M06](accompaniment-measurements.md#measurement-anchors-for-implementation-decisions)
10. **Make every musical improvement audible and measurable through one seeded plan.** Existing MIDI repeats deterministically but omits some live transforms. Share performed events between live/export and expose a new-take seed; verify kit audibility separately. This is an implementation prerequisite even though it has the smallest direct compositional effect. [M10](accompaniment-measurements.md#measurement-anchors-for-implementation-decisions)

**End of Phase 1. Await review before implementing any of this design.**
