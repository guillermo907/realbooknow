<?php
// COPY outside the domain's public document root. Never put real secrets in public/.
return [
    'base_url' => 'https://vesper.example.com', // no trailing slash; /vesper allowed
    'db_dsn' => 'mysql:host=localhost;dbname=CPANEL_vesper;charset=utf8mb4',
    'db_user' => 'CPANEL_vesper',
    'db_password' => 'REPLACE_ME',
    'google_client_id' => 'REPLACE_ME.apps.googleusercontent.com',
    'google_client_secret' => 'REPLACE_ME',
    'admin_emails' => ['you@gmail.com'], // verified Google email, never client input
    'admin_subjects' => [], // optional stable Google sub IDs; prefer after first login
    'session_seconds' => 604800,
    'allow_local_http' => false, // true ONLY for localhost development
];
