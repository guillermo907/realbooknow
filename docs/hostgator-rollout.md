# Jazzbook: HostGator rollout

This rollout uses the same practical stack as your other sites: **Next.js static export + PHP + MySQL**, uploaded through cPanel. No Node server, Composer packages, paid authentication provider, cron job or new application dependency is required on HostGator.

Jazzbook can share the hosting account with **calculadora de insulina** and **GuillermoLopezGuitar**, while keeping its document root, PHP session cookie and database tables separate. Do not upload Jazzbook over either existing site's root.

## Fresh Jazzbook installation

The application, PHP backend, SQL tables, session cookie, public catalog format and deployment files now use **Jazzbook** consistently. For a fresh installation run schema 001. If you already created the four account/catalog tables, run only the additive SQL 002 below. The existing logo symbol can be redesigned in a later visual update.

The five tables are `jazzbook_users`, `jazzbook_libraries`, `jazzbook_global_charts`, `jazzbook_meta` and `jazzbook_site`. Use the SQL included with this release, not the earlier guide's schema. Existing local backups can still be imported.

## What the update includes

- Google account login for normal users and admins, using your existing Google Cloud OAuth web client if desired.
- Private account songs, favorites, playlists, folders and chart preferences, with a separate per-account browser cache.
- Guest use without login. Guest charts are copied into an account only when the user explicitly chooses it.
- Admin preview/publication of charts into a shared catalog. Regular imports and edited global charts remain private.
- A bundled public catalog plus database additions/updates. Existing global chart IDs and share links remain stable.
- Optimistic sync revisions: stale devices get a conflict instead of silently overwriting another device. The local copy is retained.
- Local instrument/theme/audio settings remain device preferences; this rollout syncs the music library, not microphone recordings or all device settings.

The web files are ready to upload. Live Google authentication still requires your real OAuth configuration, domain and MySQL credentials. No production account or hosting changes have been made by this update.

## 0. Apply the local source update

On this Mac, the generated update is available at the absolute path below. This applies source changes with hash checks and a dated backup; it does not deploy to the hosting account.

```sh
unzip -o "/Users/willy/Documents/Codex/2026-11-11/new-chat/outputs/jazzbook-hostgator-account-update.zip" -d /tmp/jazzbook-hostgator-account-update && python3 /tmp/jazzbook-hostgator-account-update/apply-band-update.py
```

If you downloaded the rollout bundle elsewhere instead, extract its included `jazzbook-hostgator-account-update.zip` and run the enclosed `apply-band-update.py` against `/Users/willy/Documents/ChatGPT/iRealAlternative`.

Then build from the actual project:

```sh
cd /Users/willy/Documents/ChatGPT/iRealAlternative
npm run build:hostgator
```

The mobile update is included: key and actions share one row below the chart, each taking about half the width; Print is available in More actions.

## 1. Choose a dedicated location

Recommended: create a subdomain such as `jazzbook.guillermolopez-music.com` in **cPanel → Domains → Create a New Domain**. Turn off shared document root if offered. Choose a dedicated root such as:

```text
/home4/guill313/jazzbook-site/
```

The exact root name is your choice. Leave the insulin calculator and guitar site's document roots unchanged. If cPanel places the subdomain under `public_html/jazzbook`, use that exact path instead.

Enable AutoSSL/SSL for this domain and **Force HTTPS Redirect** in cPanel. Wait until `https://jazzbook.guillermolopez-music.com/` has a valid certificate before testing Google login.

### Optional: a subfolder instead of a subdomain

A subdomain avoids inherited rewrite rules and is the simplest setup. For `https://guillermolopez-music.com/jazzbook/`, build with:

```sh
NEXT_PUBLIC_BASE_PATH=/jazzbook npm run build:hostgator
```

Set `base_url` to `https://guillermolopez-music.com/jazzbook` and use the callback with `/jazzbook/api/...` below. The base path has no trailing slash. It is baked into Next's assets and audio URLs; changing it requires rebuilding. Do not upload a root build into a subfolder.

If the parent site's catch-all rewrite captures Jazzbook requests, add this exclusion **before that catch-all**, retaining all other parent rules:

```apache
RewriteRule ^jazzbook(?:/|$) - [L]
```

Do not replace your parent site's `.htaccess` with Jazzbook's. Its own `.htaccess` belongs only inside the Jazzbook document root.

## 2. Create MySQL storage in cPanel

Open **cPanel → MySQL Databases / Manage My Databases** (or Database Wizard).

1. Create a database named `jazzbook`.
2. Create a dedicated database user named `jazzbook_app` with a strong generated password.
3. Add that user to the new database and grant its privileges **on this database only**. cPanel's wizard can grant ALL PRIVILEGES for setup. Do not grant access to the insulin calculator's database.
4. Record the full prefixed names shown by cPanel, e.g. `guill313_jazzbook` and `guill313_jazzbook_app`. The actual prefixes can be shortened by cPanel; use its displayed names.
5. In **phpMyAdmin**, select that database, choose **Import**, and import:

```text
server/sql/001_accounts_catalog.sql
```

It is included in `jazzbook-hostgator-setup.zip`. The script only creates these tables:

| Table | Purpose |
| --- | --- |
| `jazzbook_users` | Stable Google subject, verified email, display name and login timestamps |
| `jazzbook_libraries` | One private library snapshot per user, revision and update time |
| `jazzbook_global_charts` | Admin-published chart content, stable ID and editor |
| `jazzbook_meta` | Schema version and public catalog revision |

The SQL is additive and can be imported again without dropping data. It does not create MySQL users or select your database: cPanel handles those steps. It uses InnoDB and utf8mb4, compatible with MySQL/MariaDB. There are no changes to either other application's tables.

You can verify the import in phpMyAdmin:

```sql
SHOW TABLES LIKE 'jazzbook_%';
SELECT name, value FROM jazzbook_meta;
```

After setup, the runtime database user needs SELECT/INSERT/UPDATE/DELETE on the Jazzbook tables. It does not need CREATE/DROP/ALTER for normal operation. If your cPanel only offers database-level privileges, use a dedicated Jazzbook database so these grants remain isolated.

## 3. Reuse the calculator's existing configuration

The preferred option now reuses the existing private calculator file:

```text
/home4/guill313/app/calculadora-insulina/backend/config/runtime.php
```

Jazzbook understands its existing uppercase `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` and `ADMIN_EMAILS` keys. It does not rewrite that file or copy its secrets into a public directory. The packaged API automatically looks for that layout outside public_html.

**The app URL and database stay specific to Jazzbook**: the default URL is `https://jazzbook.guillermolopez-music.com` and the database is `guill313_jazzbook`. The calculator's own `APP_URL`, `DB_NAME` and session name are not reused, so it keeps working as before.

In cPanel's MySQL database section, assign the **existing calculator database user** (the value of `DB_USER` in its private config) to `guill313_jazzbook`, with privileges on that database. This authorizes that same user to access Jazzbook's tables; it does not change the calculator's database. The password stays in the one existing config file.

If your private file is in another location, create or update only `public_html/jazzbook/api/config-path.php` with the actual path:

```php
<?php
return '/home4/guill313/app/calculadora-insulina/backend/config/runtime.php';
```

If you previously created this loader pointing at a separate Jazzbook config, change it to the shared runtime path above. The loader contains no credentials.

Optional app-specific overrides can be added to the existing private array: `JAZZBOOK_DB_NAME`, `JAZZBOOK_DB_USER`, `JAZZBOOK_DB_PASSWORD`, `JAZZBOOK_APP_URL`, `JAZZBOOK_ADMIN_SUBJECTS`. They are ignored by the calculator's own loader. Normally only granting the existing database user access is needed; do not change `DB_NAME` or `APP_URL` used by the calculator.

Reusing OAuth credentials still requires adding Jazzbook's exact callback in Google Cloud as described in section 4. Sessions remain separate.

### Update a site that was already uploaded

Upload `jazzbook-config-compartida.zip` into `/home4/guill313/public_html/jazzbook/` and extract it there, accepting replacement of the API files. It only updates `api/bootstrap.php`, `api/shared-config.php` and `api/.htaccess`. No tables, audio files, frontend assets or other sites are changed. The full web ZIP also contains this support.

### Alternative: a dedicated private Jazzbook config

Use the following alternative only if you prefer a separate configuration instead of the shared calculator file.

For the Jazzbook domain only, select **PHP 8.2 or later** in MultiPHP Manager. Enable the standard `pdo_mysql`, `curl` and `openssl` extensions if they are not already enabled. The account API needs outbound HTTPS to Google; ask HostGator to allow the endpoints in section 4 if authentication requests are blocked.

In File Manager, create this folder **outside public_html and outside every domain document root**:

```text
/home4/guill313/jazzbook-private/
```

Copy `server/private/config.example.php` there and rename it **config.php**. Edit its values:

```php
<?php
return [
    'base_url' => 'https://jazzbook.guillermolopez-music.com',
    'db_dsn' => 'mysql:host=localhost;dbname=guill313_jazzbook;charset=utf8mb4',
    'db_user' => 'guill313_jazzbook_app',
    'db_password' => 'YOUR_GENERATED_DATABASE_PASSWORD',
    'google_client_id' => 'YOUR_EXISTING_WEB_CLIENT_ID.apps.googleusercontent.com',
    'google_client_secret' => 'YOUR_EXISTING_WEB_CLIENT_SECRET',
    'admin_emails' => ['YOUR_ADMIN_GOOGLE_EMAIL@gmail.com'],
    'admin_subjects' => [],
    'session_seconds' => 604800,
    'allow_local_http' => false,
];
```

Use `base_url` without a trailing slash. Do not put credentials in JavaScript, a `NEXT_PUBLIC_*` variable, a source-controlled `.env`, the public upload ZIP or the database SQL file.

Set private folder/file permissions to the most restrictive values compatible with PHP running as your account (typically folder 700 and file 600). Do not make them world-writable.

Copy `server/private/config-path.example.php` to **YOUR_JAZZBOOK_ROOT/api/config-path.php** and edit only its absolute path:

```php
<?php
return '/home4/guill313/jazzbook-private/config.php';
```

This public loader contains only a path, not secrets; the API `.htaccess` denies direct access to helper PHP files. The release deliberately does not include `api/config-path.php`, so future uploads preserve your host-specific path. If your environment already sets `JAZZBOOK_CONFIG`, that absolute path takes precedence.

There is no need to change either other application's PHP config, cookies, database credentials or OAuth secrets. Jazzbook's cookie is named `JazzbookSession`, is HttpOnly/SameSite=Lax, and is scoped to its domain/path. It is not a shared login cookie.

## 4. Reuse Google OAuth safely

In **Google Cloud Console → Google Auth Platform → Clients** (or APIs & Services → Credentials), select the existing **Web application** OAuth client used by your other sites. You may reuse its client ID and secret. Add Jazzbook's exact redirect URI to the existing list; **do not remove the insulin calculator or guitar site's callback URLs**.

For the recommended subdomain, add exactly:

```text
https://jazzbook.guillermolopez-music.com/api/index.php?action=callback
```

For a subfolder build, add exactly:

```text
https://guillermolopez-music.com/jazzbook/api/index.php?action=callback
```

The callback's scheme, hostname, case, path and query must match. No trailing slash after `index.php`, no extra parameters and no `www` mismatch.

This implementation uses a server-side authorization-code redirect, not a JavaScript identity widget, so it does not require a new Authorized JavaScript Origin. Keep any origins your other apps already use. It requests only **openid, email, profile**; it never reads Gmail messages, Google Drive or the user's Google password, and does not retain access/refresh tokens in the database.

On the existing consent/branding screen, ensure your actual Jazzbook domain is allowed and the public homepage, privacy policy and contact details cover Jazzbook and its stored account/library data. Do not replace policies used by the other apps with an unrelated policy. When reusing the shared Google project/client, keep branding that accurately covers the calculator and guitar site too; do not rename their shared consent screen solely to Jazzbook. The Jazzbook domain/homepage can be added without removing the existing apps. If the OAuth application remains in Testing, add your admin and tester emails as test users. Publish the consent configuration for normal public access when ready.

Outbound server endpoints used:

```text
https://accounts.google.com/o/oauth2/v2/auth
https://oauth2.googleapis.com/token
https://openidconnect.googleapis.com/v1/userinfo
```

“Same Google login” here means users authenticate with the same Google account and optionally the same OAuth web client. Existing PHP sessions, role systems and user tables are deliberately not shared across the three apps. A previously signed-in Google account can make the Google step easier, but users still establish a Jazzbook session.

### Grant administrator access

With the shared loader, administration uses the existing calculator configuration’s `ADMIN_EMAILS` list, checked against the verified Google identity. Do not create another administrator list. For a standalone configuration only, use `admin_emails`. Normal Google sign-ins are regular users. The server rechecks admin authorization on every publication; changing a role value in browser storage has no effect.

No browser-triggered “first user becomes admin” rule exists. You do not need to edit an admin column in SQL.

For a stable subject-based allowlist after your first login:

```sql
SELECT id, google_sub, email, display_name FROM jazzbook_users;
```

Copy your own `google_sub` into `admin_subjects` in the private config. Remove the email entry if you want administration tied only to that stable identity. Google identifies accounts by `sub`, not by a mutable display name.

## 5. Build and upload

From the project folder on your Mac, after applying the source update:

```sh
npm run build:hostgator
```

This creates:

```text
release/jazzbook-hostgator-web.zip  # public files to upload
release/jazzbook-hostgator-setup.zip       # SQL/config examples/this guide; keep private
```

The downloadable rollout bundle also contains a ready-built **root/subdomain** web ZIP. No build is needed to use that exact layout. Rebuild for a subfolder or future changes.

In cPanel File Manager:

1. Open **only Jazzbook's document root**.
2. Upload `jazzbook-hostgator-web.zip` there and Extract.
3. Ensure `index.html`, `_next/`, `audio/`, `data/`, `.htaccess` and `api/` sit directly in that root, not inside another nested folder.
4. Create `api/config-path.php` as described above.
5. Remove the uploaded public ZIP after extracting it. Keep the SQL/config setup ZIP outside all public roots; do not extract it into the site.

Do not upload `node_modules`, `.next`, source tests, research files, private configs or SQL into the public website. Do not delete `api/config-path.php` on updates. The packaging script never includes real secret configs.

The public build already includes the current bundled global catalog and recorded instruments. Database publication augments/updates that catalog without rebuilding the website.

## 6. Verify the rollout

Use this order:

1. Open `https://jazzbook.guillermolopez-music.com/api/index.php?action=health`. Expect `{"ready":true,"schema":2}`. If it reports setup unavailable, check the loader path and private config; inspect cPanel's PHP error log for details.
2. Open `/api/index.php?action=session`. Before login, expect `available:true`, `user:null` and a CSRF token. No DB passwords or client secret should appear.
3. Open the home page. Search and playback should work as a guest. Existing shared hosting sites should remain unchanged.
4. Choose **Sign in → Continue with Google** and sign in as your admin. Your account should display **Admin**.
5. As admin, open **Your account → Open administration → Public playlists → Import collections**. Supported inputs: existing chart-link HTML/TXT, irealb/irealbook containers, Jazzbook JSON exports, and a `jazzbook-global-catalog` JSON file.
6. Preview one chart, then choose **Publish**. Open an incognito window as a guest and verify it appears in the shared catalog. Re-importing the same chart produces a stable ID rather than duplicating it.
7. Sign in with a regular Google account. It should have no admin publication UI. A direct publish API request from it is rejected by the server.
8. Create a playlist/favorite and import a private chart. Wait for **Account synced**, then sign in as that same user in another browser/device. Verify the library appears there. That chart must not appear in a guest's global catalog.
9. Sign out. Guest mode should return to its own library, not show the account's private songs. Sign in to a second account and verify it does not inherit the first account's private library.
10. To copy existing guest lists into an account, use **Your account → Copy guest songs & playlists**. It preserves global song references and copies private charts; it does not publish anything.

The session token is kept in an HttpOnly cookie. A separate CSRF token is sent on writes. Credentials stay on the server. Authentication uses OAuth state, PKCE and a server-side code exchange; identity is obtained directly from Google's HTTPS UserInfo endpoint with the returned access token. No unverified JWT payload is treated as proof of identity.

## 7. Sync behavior and recovery

- Each account has its own local IndexedDB cache. Guest mode retains the original guest database.
- Local writes happen first. The account snapshot is debounced/coalesced and saved under the authenticated user ID; clients cannot select another user's library.
- Only personal songs/preferences/lists/folders are stored in that snapshot. The shared catalog is never copied into every account.
- Offline edits remain in the account's device cache. If you reload offline, a previously known local account cache can be opened without granting server/admin access.
- Sync retries after connectivity returns while the account session remains usable. **Sync now** retries, or reloads/reconnects when no authenticated sync connection was established.
- If another device saved first, a conflict preserves your local copy. **Back up device & reload cloud** downloads a backup before loading the account copy. **Replace cloud with this device** explicitly replaces it, still protected against a fresh concurrent update.
- Sign-out flushes pending changes first; if that fails, it asks before leaving the locally cached account.
- Account library requests are capped at **5 MB** of JSON. Global publications are batched (up to 100 charts/request and under the body limit); global catalog size remains limited by the client to 20,000 charts. Oversized personal libraries remain local and show a sync error; reduce them or split/export before retrying.
- Account settings such as the instrument mixer/themes stay on the device. This is not a Google Drive backup service.

For removal of an account at the owner's request, back up/export if requested, identify the correct subject in phpMyAdmin, then delete that user's row. Personal library rows cascade. If the user published global charts, first reassign their `updated_by` to your administrator's user ID or retain those records as appropriate; the foreign key deliberately prevents accidental loss of the public catalog. Global content does not vanish on ordinary sign-out.

## 8. Future deployments and rollback

Routine deployment remains **build → upload ZIP → extract in Jazzbook root**. No dependency installation or server restart is required on HostGator.

Before updates, download a backup of Jazzbook's web folder and export the Jazzbook database from phpMyAdmin. Keep those backups outside public roots. Upload newer hashed `_next` assets before replacing `index.html`, and retain old hashed assets briefly for open browser tabs. File Manager extraction is not an atomic release: deploy at a quiet time and reload afterward.

To roll back frontend/API code, restore the previous Jazzbook web archive while keeping `api/config-path.php` and the private config. Do not import an old database over new user data merely to roll back UI code. Schema 001 is additive. To roll back account availability temporarily, restore the earlier static-only release; personal cloud data remains in MySQL for the next account-enabled release.

For a subfolder release, keep the same `NEXT_PUBLIC_BASE_PATH` on each build. For a domain change, rebuild if the path changes, update `base_url`, add the new exact Google callback and retain old callback entries until the other sites/releases no longer need them.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| `redirect_uri_mismatch` | Copy the exact callback above into the existing Web OAuth client's redirect list; match `base_url`, https, www and subfolder |
| Google app limited to testers | Existing OAuth consent screen is still Testing; add testers or publish appropriately |
| PHP text downloads rather than executes | PHP handler/version not enabled for Jazzbook's domain; fix in cPanel before using credentials |
| API returns HTML or 404 | Files extracted into the wrong folder, or parent app rewrite intercepts `/api/index.php` |
| Setup unavailable / HTTP 503 | Missing `api/config-path.php`, bad private file permissions/path, MySQL credentials, missing tables or blocked outbound HTTPS; check PHP logs |
| SQL access denied | Use full cPanel-prefixed DB/user names and add that user to the database |
| 403 on save | Expired session/CSRF or different origin; reload/sign in on the one configured canonical URL |
| 409 on save | Another device changed the library; use the conflict choices, not a blind retry |
| Charts load but audio 404s | Wrong build base path or missing `audio/` directory; rebuild for the deployed path |
| Old chart list after publishing | Reload; catalog uses a revision ETag. Verify admin publication actually succeeded |
| No regular-user charts in global catalog | Expected: personal imports remain private; only admin publication changes the global catalog |

## Validation and limits of this delivery

The project tests/build and a local PHP API contract harness cover authorization, account isolation, CSRF, stale revision conflicts and admin publication. The installed MySQL server binary crashed during isolated initialization before it could run the schema; a temporary SQLite test adapter exercised the PHP routes instead. That adapter is test-only and is not deployed. The production MySQL schema, row locking and cPanel integration still need the rollout checks above. Earlier browser checks covered account entry. A browser session was unavailable for the latest administration/mobile update; it was checked by build, source inspection and the PHP contract harness. Real Google consent/token exchange and HostGator's PHP/SSL/outbound network configuration require deployment credentials and must be checked using section 6. Neither a production login nor a hosted rollout has been claimed.

## Official references

- Google server-side OAuth flow and exact redirect matching: https://developers.google.com/identity/protocols/oauth2/web-server
- Google identity and UserInfo: https://developers.google.com/identity/openid-connect/openid-connect
- HostGator cPanel MySQL creation: https://soporte.hostgator.mx/hc/es-419/articles/28440853795475-C%C3%B3mo-crear-una-base-de-datos-en-cPanel
- HostGator PHP per-domain configuration: https://www.hostgator.com/help/article/php-configuration-plugin
- Next static export: https://nextjs.org/docs/app/guides/static-exports
- Next basePath: https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath


## Existing installation: administration and mobile update

1. In phpMyAdmin select `guill313_jazzbook` and import `server/sql/002_site_admin.sql` (also supplied as `jazzbook-site-admin.sql`). This adds one settings table and keeps existing users, charts and lists.
2. Apply the local source update and run `npm run build:hostgator` as before. Upload/extract `release/jazzbook-hostgator-web.zip` only in `/home4/guill313/public_html/jazzbook`. Keep `api/config-path.php`.
3. Sign in with the Google account already listed in shared `ADMIN_EMAILS`. Open **Your account → Open administration**, or **Administration** in navigation. Tabs manage public playlists, global charts, stock themes and plain-text site content. Save with **Publish settings**. Regular users and guests can read public lists; only the server-authorized admin can modify them. Users can copy public lists into their own private sets.
4. The bundled catalog includes Jazz 1400 (1,400), Latin 50 (50) and Brazilian 220 (220). Shared charts are deduplicated: 1,669 global charts total including the nine originals. The three public lists preserve all their chart references. The initial settings seed is used until an admin publishes an override; explicitly deleting a public list keeps it deleted.
5. On mobile the redundant navigation bar is removed. The search-bar hamburger opens navigation plus **Show/Hide song controls**, **Show/Hide player**, and **Show/Hide all controls**. Closing the player leaves no reserved player space. Showing controls does not reopen Mixer. The search and hamburger remain available.

There is no change to user login eligibility or the other apps. Public list administration is an additional permission guarded by the existing administrator identity. Private playlists remain editable by their owners.
