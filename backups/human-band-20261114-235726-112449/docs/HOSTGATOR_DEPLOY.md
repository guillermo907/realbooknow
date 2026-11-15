# HostGator

The frontend now uses Next.js 16.3.5 and React 19.2.8, matching the insulin calculator, with `output: 'export'`. SASS and the existing JavaScript music modules are retained. No Node process is required on HostGator.

This app keeps songs and settings in the browser (IndexedDB/localStorage). It does not currently need the calculator's PHP/MySQL API. Accounts and cross-device synchronization would require a separate backend; they are not added by this migration.

## Local

```sh
cd /Users/willy/Documents/ChatGPT/iRealAlternative
nvm use
npm ci
npm run dev
```

Open http://127.0.0.1:5173/.

## Hosting package

```sh
npm run build:hostgator
```

Upload `release/ireal-alternative-hostgator.zip` into the document root of a dedicated subdomain in cPanel and extract it there. `index.html`, `_next`, and `.htaccess` must be at that document root. This package has no credentials and does not modify any MySQL database. Use HTTPS for browser audio/recording capabilities. No publication has been performed.

Use a dedicated subdomain: this build targets the domain root, not an arbitrary subfolder. Moving to another origin does not transfer existing browser songs automatically: export a backup from the old origin, then import it at the new one.
