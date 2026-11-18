-- Additional site-management storage. Existing users, libraries and charts remain intact.
CREATE TABLE IF NOT EXISTS jazzbook_site (
 id TINYINT UNSIGNED NOT NULL,
 revision BIGINT UNSIGNED NOT NULL DEFAULT 0,
 payload MEDIUMTEXT NOT NULL,
 updated_by BIGINT UNSIGNED NULL,
 updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 PRIMARY KEY(id),
 CONSTRAINT jazzbook_site_editor FOREIGN KEY(updated_by) REFERENCES jazzbook_users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT IGNORE INTO jazzbook_site(id,revision,payload) VALUES(1,0,'{}');
UPDATE jazzbook_meta SET value=2 WHERE name='schema';
