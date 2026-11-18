# Global catalog and personal libraries

## Implemented now

- `public/data/global-songs.json` is the public, read-only catalog. All visitors fetch the same file. HTTP revalidation uses the host's normal cache headers; IndexedDB keeps the last successful catalog for offline use. The bundled originals seed the initial catalog.
- Regular imports and newly written charts always belong to **My songs**. Imports cannot publish global content, even when a JSON file claims `scope: global` or another owner.
- Saving an edited global chart creates a personal chart with a new ID and `sourceGlobalId`. It selects that copy, and replaces the reference in the current playlist only. The shared original remains unchanged. Different personal arrangements can coexist.
- Favorites, transpose, tempo and recently played are personal preferences, even for shared charts. They do not duplicate chart content. Playlist-specific playback preferences remain on the playlist.
- The browser's private data is IndexedDB `vesper-changes`, version 2: `userSongs` stores individual charts by ID; `state/library` stores playlists, folders and global preferences. Only changed personal chart objects are written. Writes are queued to preserve ordering; the shared catalog is cached separately, not rewritten during practice.
- Existing local libraries migrate automatically. Unmodified starter charts become catalog references; imported or edited charts stay personal. Old ID collisions are remapped in playlists. The previous library snapshot is retained under `state/library-before-scope-migration`. Export a backup before migrating devices.
- Global and personal songs can be mixed in the same playlist. The library provides All songs, Global catalog and My songs views. Personal edits retain their origin reference.
- Backups include the scope-aware state plus readable chart snapshots for compatibility. Restoring cannot overwrite the shared catalog.

**There are no accounts yet. “My songs” currently means this browser profile, not a server-authenticated user.** The split is a storage model, not an access-control system. Multiple people sharing the same browser profile share its local library. Do not offer account privacy until the PHP backend is implemented.

## Publishing global imports

Only the site maintainer runs this command in the project directory:

```sh
npm run catalog:import -- /path/to/export.html /path/to/more-songs.txt
npm run build:hostgator
```

The importer uses the existing parser, validates charts, strips private fields, deduplicates by title/composer/chart using a Map, and creates deterministic IDs for new songs. It preserves existing catalog IDs. Deploy the resulting static package normally; next visitors receive the updated catalog. A browser import never changes this public file. Imported private libraries are not automatically made public.

The supplied file initially contains only the project's original sample charts. The owner's actual iReal library still needs to be exported and deliberately imported through this publishing command to become global.

## HostGator account phase

Keep the public catalog static until edits by multiple administrators require a database. A single static catalog avoids a database query for each visitor; split it into indexed chunks only when measured download/parse time warrants it.

Add a same-origin PHP API with MySQL for personal data and PHP session authentication. Use these minimal entities:

- `users(id, email, password_hash)`
- `user_songs(id, user_id, source_global_id NULL, title, composer, style, song_key, tempo, chart, updated_at)`; index `(user_id, title, id)` and `(user_id, source_global_id)`.
- `user_library(user_id PRIMARY KEY, playlists_json, folders_json, global_preferences_json, revision)`.

`source_global_id` refers to a stable ID in the catalog, not a SQL foreign key while the catalog is static. A private chart is stored once regardless of how many playlists contain it. Playlist JSON stores IDs and ordering, never duplicated chart bodies. Keep song rows separate from the small library settings record.

The API obtains `user_id` exclusively from the authenticated PHP session. All reads/updates/deletes include `WHERE user_id = :session_user_id`; never accept a trusted owner/scope from the browser. Validate playlist references against the global catalog or this user's songs. Use prepared statements, CSRF protection and password hashing. No browser endpoint publishes the global catalog.

On login, import the anonymous browser library into the chosen account with an explicit migration step. Use a different IndexedDB database per authenticated user and clear in-memory state on logout. Never reuse this anonymous cache as another account's cache. Initially use revision checks and a clear conflict response; don't add background synchronization or automatic conflict merging until needed.

Nothing in this change claims that backend authentication, server persistence or cross-device synchronization is already implemented.
