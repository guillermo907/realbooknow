# Vesper Changes — format and parser specification

Phase 1 review draft · 11 November 2026. **No production parser has been written. Real-app export comparison is pending.**

## Evidence and authority

`L` refers to the local evidence ledger in [feature-inventory.md](feature-inventory.md). `P1` is the publisher's open chord-chart protocol; `C1–C4` are public community format witnesses linked below; `D` is an independent design decision. Do not treat an old community parser as a complete or normative description of the current app. No decompiled application logic was consulted.

L3 confirms registered HTML documents and both URI schemes. L2/L4 confirm editor vocabulary, but **REA did not recover a chart-format specification from executable code**. The grammar below is cross-checked against P1 and community witnesses. Local names identify `Exercises.html` and Core Data model resources; their song contents were not inspected. The target's private store/schema is not an import contract and will not be reused.

## 1. Input discovery and transport (D, P1, C1, C2)

Accepted containers: a pasted share URI; UTF-8 TXT; HTML containing one or more links; the app's versioned JSON; a selected folder of those files. HTML is parsed as inert markup, never inserted/executed. Read anchor `href` attributes and text candidates; decode HTML entities through the parser before percent-decoding URI contents. Treat the custom scheme as text, not an HTTP URL: fragments, `+`, slash bass and spaces must survive.

Decode percent escapes once using UTF-8. Do not form-decode `+` into space. Preserve empty metadata fields and internal whitespace. Malformed escapes produce source-position diagnostics rather than silent replacement or repeated decoding. A literal `=` in a legacy metadata/text field is ambiguous; reject export and explain the restriction. Keep unknown trailing fields and raw payload in provenance for future compatibility.

Classify `irealb://search?...` as a search command, not a chart. Do not invoke native handlers or import a fake song. After import preview, search the web app's library using the decoded query. The publisher documents this command separately from chart links.

## 2. Legacy plain scheme (P1)

Six fields follow `irealbook://`:

| Position | Meaning |
| --- | --- |
| 0 | Title |
| 1 | Composer, conventionally surname first |
| 2 | Descriptive style label |
| 3 | Key; trailing `-` denotes minor |
| 4 | Obsolete placeholder, conventionally `n` |
| 5 | Plain progression |

Do not misread field 4 as a mandatory time signature: meter is encoded in the progression. Some community tools label this field differently; preserve it verbatim. Single-song export will use the published six-field shape. Legacy collections use groups of six fields with `=` separators and may append a playlist name; only accept an unambiguous field grouping and report unresolved tails. Do not apply modern triple-equals splitting blindly to legacy data, especially empty composer fields.

## 3. Modern obfuscated scheme (C1, C2, C3)

Community witnesses disagree because some discard empty fields. A common **ten-field positional representation including empty fields** is:

| Position | Meaning / current confidence |
| --- | --- |
| 0 | Title |
| 1 | Composer |
| 2 | Auxiliary/unused metadata; preserve, do not invent semantics |
| 3 | Descriptive style |
| 4 | Stored key |
| 5 | Transposition/actual-key metadata; preserve until fixture establishes representation |
| 6 | Progression prefixed by `1r34LbKcu7` |
| 7 | Accompaniment-style identifier/metadata; not the descriptive label |
| 8 | BPM; zero/empty means unspecified rather than a playable 0 BPM |
| 9 | Chorus/repeat count; zero/empty means unspecified |

C1 commonly reports seven to nine fields **after collapsing empty runs**; C2 describes ten positional fields. This is not evidence of ten required nonempty values. Parse using scheme, preserved separators, progression sentinel and validated numeric suffixes. Support recognized shortened variants explicitly; do not guess composer/style/key from a `filter(Boolean)` array. Retain a variant tag and unresolved fields with warnings.

Modern collections generally join song records with `===` and append the playlist title after another `===` (C1/C2). Validate candidate records using their music sentinel and metadata; blank fields can also create equals runs. A trailing playlist title is not an empty extra song. Preserve titles and membership order. Backup HTML can contain multiple independent playlist/song links; exact duplicate-link handling and membership reconstruction require real backup fixtures, not inference from filename alone.

## 4. Descrambling contract (C1/C2; facts only, independently implement later)

After URI decoding, remove exactly one leading `1r34LbKcu7` from the music field. Apply an involutive permutation to eligible 50-character blocks. Zero-based positions are paired `i ↔ 49−i` for `i=0..4` and `i=10..23`; all other positions remain fixed.

**Boundary rule matters:** repeatedly consider a leading 50-character block only while more than 50 characters remain. Transform it only when at least two characters remain after consuming that block. Leave the final suffix, including a block followed by just one character, unchanged. Thus lengths 49, 50 and 51 receive no transformation; length 52 transforms its first 50. Test lengths 99, 100, 101, 102 as well.

Then expand the compression tokens:

| Encoded token | Plain text |
| --- | --- |
| `XyQ` | Three ASCII spaces |
| `LZ` | Space followed by `|` |
| `Kcl` | `|`, space, `x` |

The export inverse compresses three spaces, then space/barline, then barline/space/x; applies the same block permutation and prepends the sentinel. Treat compression tokens as reserved in generated staff text or warn when lossless export cannot be guaranteed. Do not execute/import the community code. The block boundary agreement was inspected in two public witnesses; Unicode indexing in current native exports is still unverified. Preserve Unicode comments, and require a real Unicode export before claiming modern non-ASCII round-trip parity.

## 5. Lexical chart vocabulary (P1, C1, L2/L4)

The document is a **cell stream**, not merely chords separated by spaces. Keep source spans, cell positions, bar boundaries and non-cell annotations. Four cells/bar and four bars/system are defaults; arbitrary imported widths need preservation.

| Token | Meaning |
| --- | --- |
| `|`, `[`, `]`, `{`, `}`, `Z` | Single, opening/closing double, opening/closing repeat, final barline |
| `T44` etc. | Meter change; `T12` means 12/8, not 1/2 |
| `*A`–`*D`, `*V`, `*i` | Rehearsal/verse/intro |
| `S`, `Q`, `f` | Segno, coda, fermata |
| `N0`, `N1`, `N2`, `N3` | Unnumbered/first/second/third ending |
| `<text>`, `<*36text>` | Staff text; optional two-digit vertical placement |
| `Y`, `YY`, `YYY` | Vertical space, not time |
| `x`, `r` | Repeat one / previous two measures |
| `n`, `p` | No chord / chord-repeat slash |
| `s`, `l` | Narrow / normal chord display mode |
| `(chord)` | Alternate chord; shares cell, excluded from accompaniment |
| `,` | Adjacent chord divider without a blank cell |
| `W/bass` | Community invisible-root spelling; lowercase editor key `w` is not proof of serialized case |
| `U` | Community end-player token; current placement semantics require a real export |

The keyboard `%` produces the one-bar repeat glyph; keyboard `x` produces a two-bar repeat. Those input shortcuts are **not** the serialized `x` / `r` mapping. Keep input keys, wire tokens and printed glyphs separate.

Recognize time signatures 2/2, 3/2, 2/4, 3/4, 4/4, 5/4, 6/4, 7/4, 3/8, 5/8, 6/8, 7/8, 9/8, 12/8. Current docs include 3/8, absent from the older open-protocol table. Default is 4/4; each change persists. Do not consume a digit sequence greedily across a chord.

Tokenize text and parenthetical quality syntax before generic navigation tokens. `maj(add4)` is a quality extension, whereas `(Db7)` is an alternate chord; context is required. An `S` inside staff text is not Segno. Unknown symbols must remain visible/round-trippable and inhibit uncertain playback, not disappear.

## 6. Chords (independent musical model; P1/C1 for vocabulary)

Store root spelling and pitch class separately from quality text, slash-bass spelling, display size and optional alternate. Interpret major/minor/dominant/diminished/half-diminished/augmented/suspended, extensions 6/7/9/11/13, added notes and alterations independently. Support the user's entire listed vocabulary, including `maj7`, `m7`, `7alt`, `m7b5`, `dim`, `aug`, `sus`, `add9`, `6/9`.

Canonical legacy spellings include `^` major, `-` minor, `o` diminished, `h` half-diminished and `+` augmented. Preserve raw notation even when aliases normalize internally. `69` is a quality, not `/9` bass; slash bass is a note name. Import accidentals `#`/`b`, accept Unicode input and render proper glyphs. Unknown/custom qualities remain printable; playback must label any approximation instead of silently treating them as major triads.

N.C. is an event, not a C chord. An invisible-root bass event inherits harmonic context but updates bass. Alternate chords transpose but do not sound. Distinguish a printed slash from slash-bass syntax and from empty cells. Timing and navigation are defined separately in behavior-spec.md.

## 7. Internal model and own JSON format (D)

Use an AST independent of all third-party parsers. Proposed major records:

| Record | Required content |
| --- | --- |
| Song | Stable id/revision, title/composer/style label, concert key+mode, default tempo/meter/style, ordered measures, provenance, timestamps, favorite/trash state |
| Measure | Stable id, source span, width/cells, left/right barlines, optional meter/section/ending, ordered events/annotations |
| Event | Type; source/cell offset and width; parsed chord/bass or rest/repeat reference; optional alternate, raw text |
| Annotation | Text/placement or typed navigation; raw form retained |
| Playback plan | Expanded visits with source measure id, chorus/repeat pass, effective meter/key/tempo and beat durations; never overwrite AST |
| Playlist | Stable id, parent folder, ordered memberships; each membership holds song id plus key/tempo/style/chorus overrides |
| Settings/theme | Versioned device preferences, CSS variables/layout, audio defaults; separate from song data |

Envelope: `format: "vesper-changes"`, `version: 1`, `kind: "song" | "playlist" | "backup" | "theme"`, `exportedAt`, `data`. Own song keys and themes are not shoehorned into native URI fields. Backups contain deduplicated songs and playlist references, favorites/trash, themes/settings and timestamp; omit browser file handles, microphone grants and ephemeral transport state.

Validate imported values, ids and references; reject unsupported future major versions with a readable message. Limit nesting and input size, with explicit override/workflow for legitimate larger libraries. Import preview offers merge/replace for backups; replacement requires confirmation and a recoverable snapshot. IndexedDB transactions commit complete changes atomically; quota failures leave the previous library intact. Detect id collisions using origin/revision/content, not title alone.

## 8. Test fixture plan (original charts only)

These are **test definitions**, not files exported by the installed app and not passing tests. Original titles/composers below are project-authored. Phase 2 must materialize fixtures and independent expected ASTs.

| Fixture | Input / expected assertion |
| --- | --- |
| F01 Plain turnaround | `irealbook://Copper%20Turnaround=Vesper%20Lab=Medium%20Swing=C=n=T44%5BC%5E7%20%7CA-7%20%7CD-7%20%7CG7%20Z`; four measures Cmaj7/Am7/Dm7/G7, key C, 4/4. |
| F02 Alterations | `T44[Db^7/Ab |C-7b5 F7b9 |Bb-6 |Eb7alt Z`; retain slash bass and half-bar changes. |
| F03 Alternate | `T44[C^7(Db^7) |A-7 |D-7 G7 |C6 Z`; alternate retained/transposed, not scheduled. |
| F04 Endings | `T44{C |N1G7 }[N2C6 Z`; intended visits 1,2,1,3. Verify this syntax in the real editor before calling native parity. |
| F05 Comments | Text containing Unicode `café ♭`, raised placement and a second line; preserve characters/placement. Modern export indexing pending. |
| F06 Repeat tokens | First bar C, second serialized `x`, then a two-bar `r` over its proper span; verify resolved references and chart glyphs. |
| F07 Meters | Separate 3/4, 5/4, 7/8, 12/8 sections; defaults and inherited changes remain exact. |
| F08 Rhythm | Same chords with widths 1:1 and 2:1:1; inspect notated widths separately from effective beat allocations. |
| F09 Navigation | Original independent D.S./D.C./Fine/Coda/intro/tag charts with expected visit arrays; invalid targets report errors. |
| F10 Silent states | N.C., empty measure, Break, fermata, End and invisible-root bass; verify different behavior, never conflate. |
| F11 Modern boundaries | Synthetic ASCII payload lengths 0,1,49,50,51,52,99,100,101,102,151,152; exact inverse and boundary vectors. |
| F12 Collections | Named two-song modern/legacy playlists, empty fields, anonymous composer, repeated songs in multiple playlists, trailing separator, conflicting versions. |
| F13 Containers | Multiple HTML anchors, single/double quotes, entity escaping, text links, malformed UTF-8/percent escape, unsupported scheme and search command. |
| F14 JSON | Round-trip each envelope kind, migrations, unsupported version, quota rollback, broken refs, malformed theme. |
| F15 Transposition | Every root/bass pitch class, enharmonic preference, minor/major, ±12 and full cycle of fourths; apply inverse without corrupting raw source. |

### Required real-app comparison — NOT YET RUN

Ask the user to create a small original chart in their app, using F01/F02 as a guide, and export it as HTML. Also export a named two-song playlist and a chart with Unicode text, repeats/endings and a meter change. The user has offered to open apps; no paid automation is necessary.

Record filename, SHA-256, app version and expected manually entered measures. Independently parse the exported link, compare metadata, cell stream, symbols and measure order against that known chart. Export the AST back through each scheme, reopen in the original app and have the user confirm appearance/playback; record normalization rather than demanding byte-identical native output. Test obfuscation separately from AST round-trip. JSON snapshots alone do not prove native compatibility.

No existing library export was searched for, and no proprietary bundled chart was substituted for these missing fixtures. Approval of the specs is separate from fixture validation.

## 9. Other exports and storage

L2 declares HTML compatibility shares, PDF, MusicXML, AAC, WAV, MIDI and playlist setlists. Those export entries do not imply those formats can be imported as editable charts. Phase 2 will implement own SMF/MusicXML/WAV writers for original data, not port native export logic. MusicXML represents form/harmony; MIDI represents our expanded performance; PDF uses print CSS. Native compressed codecs are conditional browser features, not reasons to add dependencies.

Native HTML full-backup identity/membership metadata, private Core Data stores, purchase data and sound-bank formats are **not verified contracts**. Our app will consume public share links found in HTML and report any unsupported backup-only metadata, while its own JSON provides a full-fidelity backup.

## Sources and discrepancies

- P1: [Publisher open protocol](https://www.irealpro.com/ireal-pro-custom-chord-chart-protocol/) and [Developer entry points](https://www.irealpro.com/developer-docs/). The old `/ireal-pro-file-format` URL was not accessible; the current developer link resolves to P1.
- C1: [ireal-reader](https://github.com/pianosnake/ireal-reader), [field parsing](https://github.com/pianosnake/ireal-reader/blob/master/index.js), [block permutation](https://github.com/pianosnake/ireal-reader/blob/master/unscramble.js), [grammar witness](https://github.com/pianosnake/ireal-reader/blob/master/Parser.js). Public source read for wire facts only; no package installed or implementation copied. Its collapsed-empty-field and flattening approaches are not our proposed parser design.
- C2: [ireal-mcp public format witness](https://github.com/seajaysec/ireal-mcp), `src/url.ts` and `src/obfuscate.ts` on its **master** branch. Confirms positional fields, compression substitutions and block boundary guard. Not imported or reused.
- C3: [chordsketch-ireal scope](https://docs.rs/crate/chordsketch-ireal/latest). Its six-field placeholder description differs from P1; P1 takes precedence, raw value is preserved.
- C4: [Data::iRealPro](https://github.com/sciurius/perl-Data-iRealPro), independent historical format lineage, not a dependency.

Unresolved: exact current field-5 encoding, all shortened modern variants, Unicode block units, backup-only metadata, current End token placement, chord-duration quantization and malformed navigation recovery. These must not be advertised as verified compatibility.
